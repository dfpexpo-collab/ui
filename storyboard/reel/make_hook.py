# Hook plate (1080x1920): duotone tower photo, fluted-glass band with a light-blue glow, deep-blue field.
import numpy as np
from PIL import Image, ImageFilter
W, H = 1080, 1920
DEEP = np.array([0, 0, 36], np.float32); OFF = np.array([241, 241, 241], np.float32)
BLUE = np.array([0, 18, 214], np.float32); LIGHT = np.array([0, 179, 255], np.float32)

src = Image.open('assets/hook_src.jpg').convert('RGB').crop((0, 40, 1130, 940))
# subject placement: tower on the left half (RTL mirror of the reference), photo bleeds past the window top
s = 1440 / src.height; src = src.resize((round(src.width * s), 1440), Image.LANCZOS)
cx_src = int(0.53 * src.width)            # tower centre in the photo
x0 = 400 - cx_src; y0 = 150
canvas = np.zeros((H, W, 3), np.float32)
lum = np.zeros((H, W), np.float32); alpha = np.zeros((H, W), np.float32)
g = np.asarray(src.convert('L'), np.float32) / 255
xs, xe = max(0, x0), min(W, x0 + src.width); ys, ye = y0, y0 + src.height
lum[ys:ye, xs:xe] = g[:, xs - x0:xe - x0]
# soft photo edges: fade out to the field on every side
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def ramp(v, a, b): return np.clip((v - a) / (b - a), 0, 1)
alpha = (ramp(yy, ys, ys + 260) * (1 - ramp(yy, ye - 420, ye)) * (1 - ramp(xx, 760, 1080)) * ramp(xx, -40, 120))
alpha *= (lum > 0)
lum = np.clip((lum - .08) * 1.35, 0, 1) ** 1.1              # contrast
# duotone: deep blue shadows -> cool off-white highlights
mid = np.array([40, 52, 120], np.float32)
def duo(l):
    l = l[..., None]
    return np.where(l < .5, DEEP + (mid - DEEP) * (l / .5), mid + (OFF - mid) * ((l - .5) / .5))
photo = duo(lum)
# glow version (behind the glass): deep -> blue -> light blue -> pale
def glowtone(l):
    l = l[..., None]
    pale = np.array([200, 236, 255], np.float32)
    return np.where(l < .45, DEEP + (BLUE - DEEP) * (l / .45), np.where(l < .8, BLUE + (LIGHT - BLUE) * ((l - .45) / .35), LIGHT + (pale - LIGHT) * ((l - .8) / .2)))
glow_img = glowtone(np.clip(lum * 1.15, 0, 1))
# fluted glass band: vertical ribs, each one magnifies and shifts its slice; ribs cover the tower's right side
band0, band1, rib = 300, 760, 46
fl = photo.copy(); flg = glow_img.copy(); fa = alpha.copy()
for x in range(band0, band1):
    k = (x - band0) % rib; r0 = x - k
    sx = int(np.clip(r0 + k * .58 + rib * .55 - 34, 0, W - 1))   # compressed + shifted sample
    fl[:, x] = photo[:, sx]; flg[:, x] = glow_img[:, sx]; fa[:, x] = alpha[:, sx]
ribpos = ((xx - band0) % rib) / rib
inband = ((xx >= band0) & (xx < band1)).astype(np.float32)
bandmask = inband * ramp(xx, band0, band0 + 90) * (1 - ramp(xx, band1 - 140, band1))
# colour inside the band leans to the glow tone, strongest in the middle of the band
gw = bandmask * (0.35 + 0.65 * np.exp(-((yy - 900) / 520) ** 2))
img = photo * (1 - inband[..., None]) + (fl * (1 - gw[..., None]) + flg * gw[..., None]) * inband[..., None]
a = alpha * (1 - inband) + fa * inband
# rib shading: bright edge on the left of each rib, soft shadow to the right
shade = (np.exp(-(ribpos / .06) ** 2) * .55 - ribpos * .18) * bandmask
img = img + shade[..., None] * np.array([150, 200, 255], np.float32) * a[..., None]
# field: deep blue with a blue glow, plus a light-blue bloom behind the glass
field = np.broadcast_to(DEEP, (H, W, 3)).copy()
d = np.exp(-(((xx - 520) / 520) ** 2 + ((yy - 860) / 640) ** 2)); field += (BLUE - DEEP) * d[..., None] * .55
bloom = np.exp(-(((xx - 560) / 260) ** 2 + ((yy - 820) / 520) ** 2)) * .45
field += (LIGHT - DEEP) * bloom[..., None] * .55
out = field * (1 - a[..., None]) + img * a[..., None]
out += (LIGHT * bloom[..., None] * .18) * bandmask[..., None]
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5)).save('assets/hook_plate.jpg', quality=93)
