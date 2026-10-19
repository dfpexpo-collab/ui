# Music bed + sound design for the Reel, synthesized in code (royalty-free by construction).
# 112 BPM minimal premium electronic: dark pad intro, drop on the cover reveal, half-time outro.
# SFX are placed from sfx.json (exported by the film timeline).
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
data = json.load(open('sfx.json')); TOTAL = data['total']; N = int((TOTAL + 1.2) * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
BPM = 112; BEAT = 60 / BPM; BAR = 4 * BEAT
DROP = data['scenes'][1][0]                # cover reveal
OUTRO = data['scenes'][-1][0]              # end card

def t_arr(d): return np.arange(int(d * SR)) / SR
def env(n, a, r, curve=4.0):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.exp(-curve * np.linspace(0, 1, nr)) * np.linspace(1, 0, nr) ** .3
    return e
def lp(x, f): return sosfilt(butter(2, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[:N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(.5 * (1 - pan)) * 1.414
    R[i:i + len(sig)] += sig * gain * np.sqrt(.5 * (1 + pan)) * 1.414
def note(n): return 440 * 2 ** ((n - 69) / 12)
def sweep_noise(n, lo, hi, up=True):
    """noise through a bank of fixed band-passes, crossfaded over time: a smooth filter sweep with no clicks"""
    s = rng.standard_normal(n); tt = np.linspace(0, 1, n); p = tt if up else 1 - tt
    cs = np.geomspace(lo, hi, 7); out = np.zeros(n); pos = np.log(lo * (hi / lo) ** p)
    for c in cs:
        band = bp(s, max(40, c * .7), min(SR / 2 - 200, c * 1.45))
        w = np.exp(-((pos - np.log(c)) / .45) ** 2); out += band * w
    return out

# ---------------- music
# chords (MIDI): Dm9, Bbmaj9, Fmaj9, C6/9  -> i VI III VII
CH = [[50, 57, 62, 64, 65, 69], [46, 53, 58, 60, 62, 69], [41, 53, 57, 60, 64, 67], [48, 55, 60, 62, 64, 69]]
ROOT = [38, 34, 41, 36]
def saw(f, d):
    t = t_arr(d); s = np.zeros_like(t)
    for det in (-.11, 0, .13):
        ph = (t * f * 2 ** (det / 12) + rng.random()) % 1; s += 2 * ph - 1
    return s / 3
def pad_chord(ch, d, bright):
    s = sum(saw(note(n), d) for n in ch) / len(ch)
    s = lp(s, bright)
    return s * env(len(s), d * .35, d * .45, 2)
bar_i = 0; t = 0.0
while t < TOTAL + BAR:
    k = bar_i % 4
    bright = 900 if t < DROP else (2600 if t < OUTRO else 1400)
    g = .16 if t < DROP else .13
    s = pad_chord(CH[k], BAR * 1.05, bright)
    add(s, t, g, -.25); add(np.roll(s, 400), t, g, .25)
    bar_i += 1; t += BAR

# kick + sidechain envelope
duck = np.ones(N)
def kick():
    d = .42; tt = t_arr(d); f = 48 + 90 * np.exp(-tt * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7.5)
    s += .25 * np.sin(2 * np.pi * 2.0 * np.cumsum(f) / SR) * np.exp(-tt * 30)
    return np.tanh(s * 1.6) * .9
K = kick()
def hat(open_=False):
    d = .22 if open_ else .05; s = hp(rng.standard_normal(int(d * SR)), 8000)
    return s * np.exp(-t_arr(d) * (12 if open_ else 70)) * .5
def clap():
    d = .25; s = bp(rng.standard_normal(int(d * SR)), 900, 4200); e = np.exp(-t_arr(d) * 18)
    for off in (0, .012, .024): e[int(off * SR):] += .6 * np.exp(-t_arr(d - off) * 40)[:len(e) - int(off * SR)]
    return s * e * .35
def bass(n, d):
    tt = t_arr(d); f = note(n)
    s = np.sin(2 * np.pi * f * tt) + .35 * np.sin(2 * np.pi * 2 * f * tt + .4)
    return np.tanh(1.4 * s) * env(len(tt), .005, d * .6, 3) * .55
def pluck(n, d=.35):
    tt = t_arr(d); f = note(n)
    s = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * 3 * f * tt)) * np.exp(-tt * 9)
    return lp(s, 3500) * .22

beat = 0
tb = DROP
while tb < TOTAL + .5:
    bar = int((tb - DROP) / BAR + 1e-6); k = bar % 4; pos = beat % 4
    outro = tb >= OUTRO
    if not outro or pos == 0:
        add(K, tb, .95)
        n0 = int(tb * SR); n1 = min(N, n0 + int(.32 * SR))
        duck[n0:n1] = np.minimum(duck[n0:n1], 1 - .55 * np.exp(-np.linspace(0, 4, n1 - n0)))
    if not outro:
        add(bass(ROOT[k], BEAT * .48), tb + BEAT * .5, .9)          # off-beat bass
        add(hat(), tb + BEAT * .5, .55 if pos % 2 else .45, .3)
        if tb > DROP + 2 * BAR and pos in (1, 3): add(clap(), tb, .7)
        if tb > DROP + BAR:                                              # 16th arp, chord tones
            for j in range(4):
                nn = CH[k][(beat * 4 + j) % len(CH[k])] + 24
                add(pluck(nn), tb + j * BEAT / 4, .55, (-.4, .4, -.2, .2)[j])
        if pos == 3: add(hat(True), tb + BEAT * .5, .35, -.3)
    beat += 1; tb += BEAT
# intro pulse + riser into the drop
tp = 0.6
while tp < DROP - .1:
    add(bass(38, .18) * .5, tp, .55); tp += BEAT
rz = DROP - 0.1
d = 2.2; s = rng.standard_normal(int(d * SR)); tt = t_arr(d)
sw = sweep_noise(len(s), 300, 9000, True)
add(sw * (tt / d) ** 2 * .45, rz - d, 1.0)
# final chord swell at the end card + tail
s = pad_chord(CH[0] + [74, 76], 5.5, 3200); add(s, OUTRO + .2, .2, 0)
music = np.stack([L * duck, R * duck])
L[:] = 0; R[:] = 0

# ---------------- sound effects
def whoosh(d=.55, lo=200, hi=5000, up=True, g=1.0):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    return sweep_noise(n, lo, hi, up) * np.sin(np.pi * tt) ** 1.5 * .5 * g
def sine_ping(f, d=.6, decay=7, g=.3):
    tt = t_arr(d); return (np.sin(2 * np.pi * f * tt) + .25 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 14)) * np.exp(-tt * decay) * g
def pop(i=0, low=False):
    scale = [72, 74, 76, 79, 81, 84, 86, 88]
    f = note(scale[i % 8] - (12 if low else 0)); d = .16; tt = t_arr(d)
    ff = f * (1.6 - .6 * np.minimum(1, tt / .03)); s = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tt * 34)
    click = hp(rng.standard_normal(int(.006 * SR)), 3000) * .25
    s[:len(click)] += click
    return s * .32
def ticks(d, rate=22):
    out = np.zeros(int((d + .1) * SR)); tt = 0; i = 0
    while tt < d:
        c = hp(rng.standard_normal(int(.004 * SR)), 2500) * np.exp(-np.linspace(0, 6, int(.004 * SR)))
        c += sine_ping(2600 + 300 * (i % 3), .02, 120, .25)[:len(c)] if len(c) else 0
        j = int(tt * SR); out[j:j + len(c)] += c * .5; tt += 1 / (rate * (1 - .45 * tt / max(d, .01))); i += 1
    return out
def keys(d, cps=26):
    out = np.zeros(int((d + .1) * SR)); tt = 0
    while tt < d:
        c = bp(rng.standard_normal(int(.012 * SR)), 1500, 6000) * np.exp(-np.linspace(0, 8, int(.012 * SR))) * (.6 + .4 * rng.random())
        j = int(tt * SR); out[j:j + len(c)] += c * .45; tt += 1 / cps * (.8 + .4 * rng.random())
    return out
def impact():
    d = 1.4; tt = t_arr(d); f = 40 + 70 * np.exp(-tt * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2) * .9
    s += lp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 14) * .35
    return np.tanh(s * 1.3) * .8
def shimmer(d=2.2, base=88):
    tt = t_arr(d); s = np.zeros_like(tt)
    for j, n in enumerate([base, base + 3, base + 7, base + 12, base + 14]):
        s += np.sin(2 * np.pi * note(n) * tt + j) * np.exp(-tt * (2.2 + j * .5)) * (.5 + .5 * np.sin(2 * np.pi * (3 + j) * tt))
    return s * .07 * env(len(tt), .04, d * .6, 2)
def bell(n, d=1.6, g=.22):
    tt = t_arr(d); f = note(n)
    s = sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt * k) for m, a, k in [(1, 1, 2.5), (2.01, .5, 4), (3.01, .25, 6), (4.2, .12, 9)])
    return s * g
def rise(d=1.0):
    n = int(d * SR); tt = np.linspace(0, 1, n); s = lp(rng.standard_normal(n), 900) * tt ** 1.5 * (1 - tt) ** .3
    sub = np.sin(2 * np.pi * np.cumsum(50 + 40 * tt) / SR) * tt * (1 - tt) * .6
    return (s * .5 + sub) * .6

def blip(n, d=.09, g=.12):
    tt = t_arr(d); f = note(n)
    return (np.sin(2 * np.pi * f * tt) + .2 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 45) * g
def glint(d=.5):
    tt = t_arr(d); s = hp(rng.standard_normal(len(tt)), 6000) * np.exp(-tt * 9) * .18
    for j, n in enumerate([96, 100, 103]): s += np.sin(2 * np.pi * note(n) * tt) * np.exp(-tt * (10 + 4 * j)) * .05
    return s
def whip_fx(d=.32):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    return sweep_noise(n, 400, 9000, True) * np.sin(np.pi * tt) ** .8 * .7
def zoom_fx():
    d = .9; n = int(d * SR); tt = np.linspace(0, 1, n)
    swell = sweep_noise(n, 200, 6000, True) * tt ** 2.5 * .55
    sub = np.sin(2 * np.pi * np.cumsum(30 + 50 * tt) / SR) * tt ** 2 * .5
    return swell + sub
WORD_SCALE = [62, 65, 69, 72, 74, 77]
for typ, t, x in data['sfx']:
    if typ == 'whoosh': add(whoosh(.6, 250, 6000, True, .9), t - .05, 1, -.3)
    elif typ == 'whoosh_soft': add(whoosh(.9, 150, 2500, True, .6), t, 1, .2)
    elif typ == 'whoosh_up': add(whoosh(.8, 120, 3500, True, .75), t, 1, 0)
    elif typ == 'streak': add(whoosh(.9, 1200, 11000, True, .55), t, 1, -.4); add(shimmer(1.6, 91), t + .5, 1, .3)
    elif typ == 'pop': add(pop(int(x)), t, 1, (-.5 + (int(x) % 5) * .25))
    elif typ == 'pop_low': add(pop(0, True), t, 1.2, 0); add(sine_ping(note(50), .5, 9, .3), t, 1)
    elif typ == 'swish': add(whoosh(.35, 600, 7000, True, .5), t, 1, (-.4, .4, 0)[int(x) % 3])
    elif typ == 'glass': add(sine_ping(note(88 + (int(x) % 4) * 2), .7, 6, .14), t, 1, (-.5, .5)[int(x) % 2]); add(whoosh(.25, 2000, 9000, True, .25), t - .05, 1)
    elif typ == 'tick': add(ticks(x), t, .9, .1)
    elif typ == 'type': add(keys(x), t, .9, .15)
    elif typ == 'impact': add(impact(), t, 1.0)
    elif typ == 'rise': add(rise(1.1), t - .2, 1.0)
    elif typ == 'open': add(whoosh(.6, 300, 4000, True, .6), t, 1); add(sine_ping(note(81), .9, 5, .12), t + .25, 1)
    elif typ == 'ding': add(bell(76), t, 1, -.2)
    elif typ == 'ding2': add(bell(83), t, 1, .2)
    elif typ == 'shimmer': add(shimmer(2.6, 88), t, 1.2, 0)
    elif typ == 'word': add(blip(WORD_SCALE[int(x) % 6] + 12, .08, .1), t, 1, (-.3, .3)[int(x) % 2])
    elif typ == 'word_soft': add(blip(WORD_SCALE[int(x) % 6] + 24, .05, .05), t, 1, .15)
    elif typ == 'spark': add(glint(), t, 1, 0)
    elif typ == 'whip': add(whip_fx(), t, 1, -.4 * float(x))
    elif typ == 'zoom': add(zoom_fx(), t, 1, 0)
sfx = np.stack([L, R])

# ---------------- mix
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
music *= .2 / rms(music); sfx *= .16 / max(rms(sfx), 1e-6)
import os
mix = (0 if os.environ.get('SFX_ONLY') else 1) * music + sfx
# fade out the last 1.2 s, soft clip, normalise peak
n_end = int(TOTAL * SR); fade = np.ones(mix.shape[1]); fl = int(1.2 * SR)
fade[n_end - fl:n_end] = np.linspace(1, 0, fl) ** 1.5; fade[n_end:] = 0
mix = mix * fade
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= .89 / np.max(np.abs(mix))
mix = mix[:, :n_end]
import wave
with wave.open(os.environ.get('OUT_WAV', 'soundtrack.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print('soundtrack.wav', mix.shape[1] / SR, 's')
