#!/usr/bin/env python3
"""
Give the animation room: insert silent gaps into the film at points where the VO is already silent.
Shifts every scene time (start/end/vo/words/big/click) at or after each point, and splits the audio segments there.

  python3 retime.py cues.json 3.15:0.7 6.79:0.4 ...      (film time : gap seconds, times as in the current cues)
"""
import json, sys

def shift(c, X, g):
    for s in c['scenes']:
        for k in ('start', 'end', 'big', 'click'):
            if k in s and s[k] >= X - 1e-6: s[k] = round(s[k] + g, 3)
        for k in ('vo', 'words'):
            if k in s: s[k] = [round(v + g, 3) if v >= X - 1e-6 else v for v in s[k]]
    segs = []
    for a in c['audio']['segments']:
        end = a['at'] + a['to'] - a['from']
        if a['at'] >= X: segs.append(dict(a, at=round(a['at'] + g, 3)))
        elif end <= X: segs.append(a)
        else:   # split the segment at X
            cut = round(a['from'] + X - a['at'], 3)
            segs += [dict(a, to=cut), dict(a, **{'from': cut, 'at': round(X + g, 3)})]
    c['audio']['segments'] = segs

path = sys.argv[1]
c = json.load(open(path))
for X, g in sorted((tuple(map(float, p.split(':'))) for p in sys.argv[2:]), reverse=True):   # latest first, so earlier points keep their meaning
    shift(c, X, g)
txt = json.dumps(c, ensure_ascii=False, indent=1)
open(path, 'w').write(txt)
print('film is now', c['scenes'][-1]['end'], 's;', len(c['audio']['segments']), 'audio segments')
