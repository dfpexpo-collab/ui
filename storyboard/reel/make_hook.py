# Hook plate (1080x1920), Voom take on the fluted-glass reference: B&W hand on the deep-blue field,
# fingers seen through vertical glass ribs that refract them and glow light blue.
import numpy as np
from PIL import Image, ImageFilter
W, H = 1080, 1920
DEEP = np.array([0, 0, 36], np.float32); OFF = np.array([241, 241, 241], np.float32)
BLUE = np.array([0, 18, 214], np.float32); LIGHT = np.array([0, 179, 255], np.float32)
PALE = np.array([205, 238, 255], np.float32)

src = Image.open('assets/hand_src.jpg').convert('L')
s = W / src.width; src = src.resize((W, round(src.height * s)), Image.LANCZOS)
lum = np.zeros((H, W), np.float32)
dy = -150                                   # lift the hand so the question sits clear below the fingers
g = np.asarray(src, np.float32) / 255
y0, y1 = max(0, dy), min(H, dy + g.shape[0])
lum[y0:y1] = g[y0 - dy:y1 - dy]
lum = np.clip((lum - .03) / .9, 0, 1)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def tone(l, stops):                          # piecewise colour ramp
    l = l[..., None]; out = np.zeros(l.shape[:2] + (3,), np.float32)
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        m = (l >= a) & (l <= b); t = (l - a) / (b - a)
        out = np.where(m, ca + (cb - ca) * t, out)
    return out
bw = tone(lum, [(0, DEEP), (.35, np.array([34, 40, 86], np.float32)), (1, OFF)])        # hand outside the glass
gl = tone(np.clip(lum * 1.1, 0, 1), [(0, DEEP), (.25, BLUE), (.6, LIGHT), (1, PALE)])   # hand behind the glass

# fluted glass: ribs between x0 and x1; each rib compresses its slice and pulls it sideways (refraction)
x0, x1, rib = 470, 1080, 52
img = bw.copy(); band = (xx >= x0) & (xx < x1)
for x in range(x0, x1):
    k = (x - x0) % rib
    sx = int(np.clip(x - k + k * .62 - 30, 0, W - 1))
    sy_shift = 0
    img[:, x] = gl[:, sx]
# glass edge fade-in on the left so the hand passes smoothly from clear to refracted
fade = np.clip((xx - x0) / 120, 0, 1)
img = bw * (1 - fade[..., None]) + img * fade[..., None]
# rib shading: a thin bright edge and a soft falloff per rib, visible even over the empty field
ribpos = ((xx - x0) % rib) / rib
edge = np.exp(-(ribpos / .045) ** 2) * .16 + np.exp(-((1 - ribpos) / .03) ** 2) * .06 - ribpos * .05
vert = np.exp(-((yy - 880) / 760) ** 2)     # ribs strongest around the hand, fading top and bottom
img += (edge * fade * band * vert)[..., None] * np.array([120, 190, 255], np.float32)
# light-blue bloom behind the refracted fingers
bloom = np.exp(-(((xx - 760) / 300) ** 2 + ((yy - 880) / 300) ** 2)) * band * fade
img += bloom[..., None] * LIGHT * .22
# quiet blue glow in the field
glow = np.exp(-(((xx - 540) / 700) ** 2 + ((yy - 950) / 900) ** 2))
img += glow[..., None] * (BLUE - DEEP) * .18 * (1 - lum[..., None])
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.4)).save('assets/hook_plate.jpg', quality=93)
