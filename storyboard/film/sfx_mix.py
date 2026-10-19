# Sound design from the Ocular Sounds picks (sfx_in/all). Each cue lines up a sample's peak (or onset)
# with a timeline event; ~45 cues instead of ~200 synthesized blips, so every sound means something.
import numpy as np, subprocess, wave, os
SR = 48000; TOTAL = 40.0; N = int((TOTAL + .5) * SR)
LIB = os.environ.get('SFX_LIB', '../sfx_in/all')
out = np.zeros((N, 2)); cache = {}
def load(name):
    if name not in cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{LIB}/{name}.wav', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
        x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64); x /= np.abs(x).max() + 1e-9
        cache[name] = x
    return cache[name]
def cue(name, t, gain=.5, align='peak', maxlen=None, pan=0.0):
    x = load(name)
    if maxlen: n = int(maxlen * SR); x = x[:n].copy(); f = min(len(x), int(.25 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
    mono = np.abs(x).mean(1); env = np.convolve(mono, np.ones(240) / 240, 'same')
    ref = int(np.argmax(env)) if align == 'peak' else int(np.argmax(env > env.max() * .1))
    i = int(t * SR) - ref
    if i < 0: x = x[-i:]; i = 0
    x = x[:N - i] * gain
    x[:, 0] *= np.sqrt(1 - pan); x[:, 1] *= np.sqrt(1 + pan)
    out[i:i + len(x)] += x

# 1 hook: air, the spark touching the glass, riser into the cover drop
cue('shimmer_05', .5, .22, 'onset'); cue('shimmer_03', 1.34, .25, 'onset')
cue('riser_02', 3.21, .45); cue('impact_03', 3.21, .75, 'onset', 3.2)
# 2 cover wheel assembling
for k, t in enumerate([3.78, 4.05, 4.32, 4.59]): cue(['ui_01', 'ui_03', 'ui_05', 'ui_03'][k], t, .26, 'onset', pan=(-.3, .3)[k % 2])
cue('whoosh_03', 4.29, .35)
# 3 dissolve → tower and man rise, cards
cue('transition_03', 6.96, .5); cue('riser_03', 8.0, .4, maxlen=None)
cue('ui_06', 8.30, .26, 'onset', pan=-.3); cue('ui_06', 8.57, .26, 'onset', pan=.3)
# 4 push → "It looks like Voom", board unfolds, counters
cue('whoosh_01', 10.71, .6); cue('whoosh_02', 12.4, .4)
for t in (12.86, 12.96, 13.06): cue('ui_04', t, .18, 'onset')
# 5 zoom → masterplan, 10X hit
cue('riser_01', 14.46, .4); cue('ui_02', 15.27, .25, 'onset'); cue('ui_02', 15.54, .25, 'onset')
cue('riser_02', 17.14, .3); cue('impact_01', 17.14, .85, 'peak', 3.5)
# 6 pixel → AI voice agent
cue('glitch_03', 18.75, .4); cue('riser_02', 19.3, .3)
cue('whoosh_04', 20.62, .3); cue('ui_08', 21.43, .35, 'onset')
# 7 push → digital twin: scan line, callouts
cue('whoosh_06', 22.5, .45); cue('glitch_01', 23.6, .3)
for k, t in enumerate([23.97, 24.38, 24.78]): cue(['ui_08', 'ui_01', 'ui_08'][k], t, .26, 'onset', pan=(-.35, .35, -.35)[k])
# 8 match cut → twin dashboard, "ويوفر حتى 25%"
cue('transition_02', 26.25, .45); cue('ui_04', 27.59, .2, 'onset'); cue('shimmer_01', 28.23, .22, 'onset')
# 9 push → global presence: flags flip, contact cards
cue('whoosh_01', 30.0, .55)
for k, t in enumerate([30.67, 30.94, 31.20, 31.47]): cue(['ui_03', 'ui_05'][k % 2], t, .24, 'onset', pan=(-.3, .3)[k % 2])
cue('ui_08', 32.28, .24, 'onset'); cue('ui_08', 32.55, .24, 'onset')
# 10 zoom out → end card: box opens, typing, E3 / E4, sting
cue('whoosh_02', 33.75, .5); cue('transition_01', 33.75, .3)
cue('shimmer_02', 34.29, .22, 'onset'); cue('whoosh_03', 35.36, .3); cue('ui_07', 35.36, .25, 'onset')
cue('typing_01', 35.76, .3, 'onset', 1.6); cue('typing_02', 36.83, .25, 'onset')
cue('riser_01', 38.04, .3); cue('impact_04', 38.04, .55, 'peak', 2.4); cue('chime_01', 38.57, .45, 'onset')

out = np.tanh(out * 1.1) / np.tanh(1.1)            # soft safety clip; loudness is set at encode
pk = np.abs(out).max(); out = out / pk * .89
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open(os.environ.get('OUT_WAV', 'sfx_v04.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('cues ok', len(cache), 'samples used')
