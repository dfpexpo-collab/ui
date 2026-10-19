#!/usr/bin/env python3
"""
Motion QA for a rendered video: finds the glitches that are easy to miss at full speed.

  python3 check_video.py <video.mp4> [--cues cues.json]

Flags:
  FLASH  1-5 frames that jump away and then back (an old scene or element popping in for a moment)
  EMPTY  the picture loses most of its detail for more than 0.2s (a scene that goes blank mid-shot or between scenes)
  JUMP   a hard change between two frames that is not at a scene cut listed in cues.json
Exit code 1 when anything is flagged. Needs ffmpeg and numpy.
"""
import json, subprocess, sys
import numpy as np

W, H = 160, 90

def frames(path):
    fps = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', path],
                         capture_output=True, text=True).stdout.strip()
    a, b = fps.split('/'); fps = float(a) / float(b)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return fps, np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)

def detail(f):   # high-frequency energy: UI lines, text and cards; a smooth background alone scores low
    return float(np.abs(np.diff(f, axis=0)).mean() + np.abs(np.diff(f, axis=1)).mean())

def main():
    path = sys.argv[1]
    cuts = []
    if '--cues' in sys.argv:
        cues = json.load(open(sys.argv[sys.argv.index('--cues') + 1]))
        cuts = [s['start'] for s in cues['scenes']]
    fps, F = frames(path)
    n = len(F)
    d = lambda i, j: float(np.abs(F[i] - F[j]).mean())
    det = np.array([detail(f) for f in F])
    out = []
    # FLASH: frame i-1 ~ frame i+k but frames in between differ
    i = 1
    while i < n - 6:
        step = d(i - 1, i)
        if step > 6:
            for k in range(1, 6):
                if d(i - 1, i + k) < step * 0.35:
                    out.append(('FLASH', i / fps, k)); i += k; break
        i += 1
    # JUMP: big single-frame change away from any cut
    for i in range(1, n):
        t = i / fps
        if d(i - 1, i) > 18 and not any(abs(t - c) < 0.6 for c in cuts):
            out.append(('JUMP', t, round(d(i - 1, i), 1)))
    # EMPTY: detail falls under 35% of the recent peak for > 0.2s
    win = int(fps * 0.6); run = 0
    for i in range(win, n):
        ref = det[i - win:i].max()
        if ref > 2.0 and det[i] < 0.35 * ref: run += 1
        else:
            if run > fps * 0.2: out.append(('EMPTY', (i - run) / fps, round(run / fps, 2)))
            run = 0
    out.sort(key=lambda x: x[1])
    for kind, t, v in out:
        print(f'{kind:6s} {t:6.2f}s  {v}')
    print(f'{len(out)} issue(s) in {n / fps:.1f}s')
    sys.exit(1 if out else 0)

if __name__ == '__main__':
    main()
