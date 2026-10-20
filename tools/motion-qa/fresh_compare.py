#!/usr/bin/env python3
"""
Catch render-only glitches: compare frames of the encoded video with the same frames rendered on fresh pages.

  python3 fresh_compare.py <video.mp4> <fresh_frames_dir> [fps=30]

<fresh_frames_dir> holds frames named <frame>.jpg (e.g. from `ONLY=12,345,... node build_film.js <dir>`, whose
pages render only those frames). A long-running render page can keep stale raster tiles from earlier frames; they
show as hard-edged ghost pieces (a doubled chip, a copy of a button elsewhere). Any 48 px block that differs a lot
from the fresh render is flagged as STALE. Exit code 1 when anything is flagged. Needs ffmpeg and numpy.
"""
import subprocess, sys
from pathlib import Path
import numpy as np

W, H, B = 960, 540, 24   # compare at half size; 24 px blocks = 48 px at 1080p


def frame_from_video(path, t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', path, '-frames:v', '1',
                          '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W).astype(np.float32)


def frame_from_jpg(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-vf', f'scale={W}:{H}', '-f', 'rawvideo',
                          '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W).astype(np.float32)


def main():
    video, fresh = sys.argv[1], Path(sys.argv[2])
    fps = float(sys.argv[3]) if len(sys.argv) > 3 else 30
    bad = 0
    for jpg in sorted(fresh.glob('*.jpg')):
        f = int(jpg.stem)
        a, b = frame_from_video(video, (f + 0.5) / fps), frame_from_jpg(jpg)
        d = np.abs(a - b)[: H // B * B, : W // B * B].reshape(H // B, B, W // B, B).mean(axis=(1, 3))
        worst = float(d.max())
        hot = int((d > 18).sum())
        flag = worst > 18
        bad += flag
        print(f'{"STALE" if flag else "ok   "} frame {f:5d} ({f / fps:6.2f}s)  worst block {worst:5.1f}  blocks over limit {hot}')
    print(f'{bad} frame(s) flagged')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
