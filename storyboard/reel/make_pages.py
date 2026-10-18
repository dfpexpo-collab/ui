# Brochure page -> 1080x1920 Reel plate. The page is fitted to the width and centred on the Reel safe band.
# Above and below it the page continues (mirrored) under a progressive blur: sharp inside the page,
# blur radius ramping up through a long eased feather, then a soft deep-blue fade at the frame edge.
import sys
import numpy as np
from PIL import Image, ImageFilter

LEVELS = [0, 3, 7, 13, 22, 34, 50]          # blur radii, px

def smooth(x):                               # smootherstep 0..1
    x = np.clip(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10)

def plate(src, crop, pt, out, feather_top=(110, 70), feather_bot=(170, 230)):
    pg = Image.open(src).convert('RGB').crop(crop)
    h = round(pg.height * 1080 / pg.width); pg = pg.resize((1080, h), Image.LANCZOS)
    c = Image.new('RGB', (1080, 1920))
    c.paste(pg, (0, pt))
    # continuation: mirror the page edges outward so colours and light carry on naturally
    if pt > 0:
        c.paste(pg.crop((0, 0, 1080, min(pt, h))).transpose(Image.FLIP_TOP_BOTTOM).resize((1080, pt)), (0, 0))
    rest = 1920 - (pt + h)
    if rest > 0:
        c.paste(pg.crop((0, h - min(rest, h), 1080, h)).transpose(Image.FLIP_TOP_BOTTOM).resize((1080, rest)), (0, pt + h))
    stack = np.stack([np.asarray(c.filter(ImageFilter.GaussianBlur(r)) if r else c, dtype=np.float32) for r in LEVELS])
    y = np.arange(1920, dtype=np.float32)
    # t: 0 = sharp, 1 = full blur. Ramps start inside the page and finish outside it.
    tb = smooth((y - (pt + h - feather_bot[0])) / (feather_bot[0] + feather_bot[1]))
    tt = smooth(((pt + feather_top[0]) - y) / (feather_top[0] + feather_top[1]))
    t = np.maximum(tb, tt) * (len(LEVELS) - 1)
    i0 = np.clip(np.floor(t).astype(int), 0, len(LEVELS) - 2); f = (t - i0)[:, None, None]
    rows = np.arange(1920)
    img = stack[i0, rows] * (1 - f) + stack[i0 + 1, rows] * f
    # gentle tonal fall-off into the brand deep blue at the very top and bottom
    deep = np.array([0, 4, 40], np.float32)
    vb = smooth((y - (pt + h)) / max(rest, 1)) * .55
    vt = smooth((pt - y) / max(pt, 1)) * .45
    v = np.maximum(vb, vt)[:, None, None]
    img = img * (1 - v) + deep * v
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(out, quality=93)

P = sys.argv[1] if len(sys.argv) > 1 else 'brochure/pages/'   # folder with the brochure page JPGs (b01.jpg ...)
plate(P + 'b01.jpg', (0, 0, 1240, 1754), 166, 'assets/plate_b01.jpg', feather_top=(60, 60), feather_bot=(150, 150))
plate(P + 'b04.jpg', (0, 140, 1240, 1754), 227, 'assets/plate_b04.jpg')
plate(P + 'b08.jpg', (0, 140, 1240, 1754), 227, 'assets/plate_b08.jpg')
