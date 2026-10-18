# Split brochure pages into animatable layers for the Reel film (1080x1920).
#   clean background plate (text and elements removed, edges continued with a soft blur)
#   text lines keyed out of the page and split into words (for the echo + blur text animation)
#   elements (wheel segments, tower, people, cards, flags...) as RGBA sprites
# Output: assets/<scene>/*.png + manifest.json (all positions in frame pixels).
import json, os, sys
import numpy as np, cv2
from PIL import Image, ImageFilter

PAGES = sys.argv[1] if len(sys.argv) > 1 else '../brochure/pages/'
OUT = 'assets'
S = 1080 / 1240
MAN = {}

def load(p): return np.asarray(Image.open(PAGES + p + '.jpg').convert('RGB'), np.float32)

def rect_mask(shape, rects, pad=0):
    m = np.zeros(shape[:2], np.uint8)
    for x0, y0, x1, y1 in rects: m[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad] = 255
    return m

def clean_bg(img, mask):
    """Fill masked areas with a smooth surface fitted to the visible background (2D polynomial, degree 4):
    a clean light gradient with no smears, edges, or leftover shapes."""
    h, w = mask.shape
    step = 6
    ys, xs = np.mgrid[0:h:step, 0:w:step]
    ok = cv2.dilate(mask, np.ones((31, 31), np.uint8))[::step, ::step] == 0
    def feats(y, x):
        u, v = x / w * 2 - 1, y / h * 2 - 1
        return np.stack([u ** i * v ** j for i in range(4) for j in range(4 - i)], -1)
    F = feats(ys[ok].astype(np.float32), xs[ok].astype(np.float32))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    FA = feats(yy, xx)
    fill = np.zeros_like(img)
    for ch in range(3):
        coef, *_ = np.linalg.lstsq(F, img[::step, ::step, ch][ok], rcond=None)
        vis = img[::step, ::step, ch][ok]
        fill[..., ch] = np.clip(FA @ coef, np.percentile(vis, 8), np.percentile(vis, 99))
    soft = cv2.GaussianBlur(cv2.dilate(mask, np.ones((41, 41), np.uint8)).astype(np.float32) / 255, (0, 0), 22)[..., None]
    base = cv2.GaussianBlur(img, (0, 0), 1.2)
    return base * (1 - soft) + np.clip(fill, 0, 255) * soft

class Scene:
    def __init__(self, sid, page, crop_top, pt):
        self.sid, self.page, self.ct, self.pt = sid, page, crop_top, pt
        self.img = load(page); self.layers = []; self.excl = []
        os.makedirs(f'{OUT}/{sid}', exist_ok=True)
    def fx(self, x): return round(x * S, 1)
    def fy(self, y): return round(self.pt + (y - self.ct) * S, 1)
    def save(self, name, rgba, x0, y0, extra=None):
        im = Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA')
        nw = max(1, round(im.width * S)); nh = max(1, round(im.height * S))
        im = im.resize((nw, nh), Image.LANCZOS)
        path = f'{OUT}/{self.sid}/{name}.png'; im.save(path, optimize=True)
        L = dict(id=name, src=path, x=self.fx(x0), y=self.fy(y0), w=nw, h=nh)
        if extra: L.update(extra)
        self.layers.append(L); return L

    def text(self, name, rect, lang='ar', gap=0.17, k=None, split=True, thr=10):
        """Key light text out of its rect and split it into words (reading order)."""
        x0, y0, x1, y1 = rect; self.excl.append(rect)
        crop = self.img[y0:y1, x0:x1]
        L = (crop[..., 0] + crop[..., 1]) / 2
        h = y1 - y0
        kk = k or (max(15, int(h * 0.55)) | 1)
        bg = cv2.morphologyEx(L, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kk, kk)))
        bg = cv2.GaussianBlur(bg, (0, 0), kk / 4)
        top = np.percentile(L, 99.3)
        a = np.clip((L - bg - thr) / max(20, top - bg.mean() - thr), 0, 1)
        a = np.clip(a * 1.25, 0, 1) ** 0.9
        rgba = np.dstack([crop, a * 255])
        words = []
        if split:
            col = (a > 0.12).any(axis=0)
            g = max(4, int(h * gap)); segs = []; run = None; gapn = 0
            for i, on in enumerate(col):
                if on:
                    if run is None: run = [i, i]
                    elif gapn >= g: segs.append(run); run = [i, i]
                    run[1] = i; gapn = 0
                else: gapn += 1
            if run: segs.append(run)
            if lang == 'ar': segs = segs[::-1]
            for j, (s0, s1) in enumerate(segs):
                s0 = max(0, s0 - 3); s1 = min(crop.shape[1] - 1, s1 + 3)
                rows = np.where((a[:, s0:s1 + 1] > 0.05).any(axis=1))[0]
                r0, r1 = (rows[0], rows[-1]) if len(rows) else (0, h - 1)
                r0 = max(0, r0 - 3); r1 = min(h - 1, r1 + 3)
                words.append(self.save(f'{name}_w{j + 1:02d}', rgba[r0:r1 + 1, s0:s1 + 1], x0 + s0, y0 + r0))
                self.layers.pop()
        whole = self.save(name, rgba, x0, y0, dict(kind='text', lang=lang, words=words))
        return whole

    def element(self, name, rect, mode='diff', thr=26, poly=None, keep=1, feather=1.5, rounded=None, plate=None):
        """Cut an element out of the page. mode='rect' keeps the whole rect (rounded corners optional);
        mode='diff' keeps pixels that differ from the clean background plate."""
        x0, y0, x1, y1 = rect
        crop = self.img[y0:y1, x0:x1]
        if mode == 'rect':
            a = np.ones(crop.shape[:2], np.float32)
            if rounded:
                m = np.zeros(crop.shape[:2], np.uint8)
                cv2.rectangle(m, (rounded, 0), (crop.shape[1] - rounded, crop.shape[0]), 255, -1)
                cv2.rectangle(m, (0, rounded), (crop.shape[1], crop.shape[0] - rounded), 255, -1)
                for cx, cy in [(rounded, rounded), (crop.shape[1] - rounded - 1, rounded), (rounded, crop.shape[0] - rounded - 1), (crop.shape[1] - rounded - 1, crop.shape[0] - rounded - 1)]:
                    cv2.circle(m, (cx, cy), rounded, 255, -1)
                a = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 0.8)
        else:
            ref = plate[y0:y1, x0:x1]
            d = np.abs(crop - ref).sum(axis=2)
            m = (d > thr).astype(np.uint8) * 255
            if poly is not None:
                pm = np.zeros_like(m); cv2.fillPoly(pm, [np.array(poly, np.int32) - [x0, y0]], 255); m &= pm
            m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
            m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            n, lab, st, _ = cv2.connectedComponentsWithStats(m)
            if n > 1:
                order = np.argsort(-st[1:, cv2.CC_STAT_AREA])[:keep] + 1
                m = np.isin(lab, order).astype(np.uint8) * 255
            # fill small holes inside the silhouette
            inv = 255 - m; n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv)
            for i in range(1, n2):
                if st2[i, cv2.CC_STAT_AREA] < 4000 and st2[i, cv2.CC_STAT_LEFT] > 0 and st2[i, cv2.CC_STAT_TOP] > 0: m[lab2 == i] = 255
            a = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), feather)
        return self.save(name, np.dstack([crop, a * 255]), x0, y0, dict(kind='element'))

    def plate(self, bg_page, out_name='plate', feather_top=(10, 140), feather_bot=(10, 260)):
        """1080x1920 plate from the clean page: centred band + stretched, blurred continuation."""
        pg = Image.fromarray(np.clip(bg_page, 0, 255).astype(np.uint8)).crop((0, self.ct, 1240, 1754))
        h = round(pg.height * S); pg = pg.resize((1080, h), Image.LANCZOS)
        c = Image.new('RGB', (1080, 1920)); c.paste(pg, (0, self.pt))
        if self.pt > 0: c.paste(pg.crop((0, 0, 1080, 6)).resize((1080, self.pt)), (0, 0))
        rest = 1920 - self.pt - h
        if rest > 0: c.paste(pg.crop((0, h - 6, 1080, h)).resize((1080, rest)), (0, self.pt + h))
        arr = np.asarray(c, np.float32)
        bl = np.asarray(c.filter(ImageFilter.GaussianBlur(40)), np.float32)
        y = np.arange(1920, dtype=np.float32)[:, None, None]
        def sm(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
        t = np.maximum(sm((self.pt + feather_top[0] - y) / feather_top[1]), sm((y - (self.pt + h - feather_bot[0])) / feather_bot[1]))
        out = arr * (1 - t) + bl * t
        deep = np.array([0, 4, 40], np.float32)
        v = np.maximum(sm((y - (self.pt + h)) / max(rest, 1)) * .5, sm((self.pt - y) / max(self.pt, 1)) * .4)
        out = out * (1 - v) + deep * v
        path = f'{OUT}/{self.sid}/{out_name}.jpg'
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(path, quality=92)
        return path

    def done(self, plate_path, extra=None):
        MAN[self.sid] = dict(plate=plate_path, pageBottom=round(self.pt + (1754 - self.ct) * S), layers=self.layers, **(extra or {}))

# ------------------------------------------------------------------ S2 cover (b01)
def cover():
    sc = Scene('s2', 'b01', 0, 166)
    img = sc.img
    CX, CY, R_OUT, R_CORE = 627, 1112, 462, 258   # core keeps the whole dark gap ring
    yy, xx = np.mgrid[0:1754, 0:1240].astype(np.float32)
    rr = np.hypot(xx - CX, yy - CY); ang = (np.degrees(np.arctan2(yy - CY, xx - CX)) + 360) % 360
    texts = [('logo', (330, 150, 910, 340)), ('t_h1', (160, 370, 1090, 480)), ('t_h2', (245, 500, 995, 595)), ('t_url', (540, 1622, 712, 1675))]
    m = rect_mask(img.shape, [r for _, r in texts], 6)
    m[rr < R_OUT + 14] = 255
    bg = clean_bg(img, m)
    sc.text('logo', (330, 150, 910, 340), 'en', split=False)
    sc.text('t_h1', (160, 370, 1090, 480), 'ar', gap=.2)
    sc.text('t_h2', (245, 500, 995, 595), 'ar', gap=.2)
    sc.text('t_url', (540, 1622, 712, 1675), 'en', split=False)
    # wheel: core disc + 8 segments (45 degree sectors, boundaries on the gaps)
    def sector(name, sel):
        a = cv2.GaussianBlur(sel.astype(np.float32), (0, 0), 1.0)
        ys, xs = np.where(sel); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        crop = img[y0:y1, x0:x1]
        return sc.save(name, np.dstack([crop, a[y0:y1, x0:x1] * 255]), x0, y0, dict(kind='segment'))
    sector('core', rr < R_CORE)
    names = ['ERP', 'Cinematic', 'Vision', 'ECRM', 'Twin', 'PropTech', 'AIVoice', 'Community']   # clockwise from 0 deg (right)
    for k in range(8):
        lo, hi = k * 45, (k + 1) * 45
        sel = (rr >= R_CORE) & (rr < R_OUT + 12) & (ang >= lo) & (ang < hi)
        L = sector(f'seg{k}', sel); L['label'] = names[k]; L['angle'] = lo + 22.5
    p = sc.plate(bg)
    sc.done(p, dict(wheel=dict(cx=sc.fx(CX), cy=sc.fy(CY))))

# ------------------------------------------------------------------ S3 your project (b04)
def project():
    sc = Scene('s3', 'b04', 140, 227)
    img = sc.img
    T = [('t_eyebrow', (110, 205, 1100, 265), 'en'), ('t_h1', (110, 280, 1090, 380), 'ar'), ('t_h2', (340, 392, 860, 500), 'ar'),
         ('t_l1', (44, 576, 320, 690), 'en'), ('t_l2', (40, 772, 345, 925), 'en'), ('t_l3', (42, 1020, 330, 1132), 'en'),
         ('t_r1', (900, 572, 1160, 690), 'ar'), ('t_r2', (896, 786, 1160, 900), 'ar'), ('t_r3', (930, 1000, 1160, 1130), 'ar')]
    BANDS = [(0, 551, 1240, 716), (0, 764, 1240, 929), (0, 993, 1240, 1153)]
    TOWER = [(205, 540), (640, 540), (640, 1754), (205, 1754)]
    MANP = [(590, 740), (960, 740), (960, 1754), (590, 1754)]
    fgrect = [(205, 540, 960, 1754), (0, 1480, 1240, 1754)]
    textm = rect_mask(img.shape, [r for _, r, _ in T], 6)
    logo = rect_mask(img.shape, [(40, 40, 340, 150)], 4)
    # background without bands: mask bands + fg + text, then fill
    m0 = textm | logo | rect_mask(img.shape, BANDS + fgrect, 4)
    bg = clean_bg(img, m0)
    # band overlays: background + band, sampled where the band is clear of the tower, man and text
    bandimgs = []
    for i, (x0, y0, x1, y1) in enumerate(BANDS):
        sub = img[y0:y1].copy()
        mm = (textm[y0:y1] | rect_mask(img.shape, fgrect)[y0:y1])
        yy, xx = np.mgrid[0:sub.shape[0], 0:sub.shape[1]].astype(np.float32)
        ok = mm == 0
        X = np.stack([np.ones_like(xx), xx / 1240, (xx / 1240) ** 2, (xx / 1240) ** 3, yy / 165, (yy / 165) ** 2, xx * yy / (1240 * 165)], -1)
        fill = np.zeros_like(sub)
        for ch in range(3):
            coef, *_ = np.linalg.lstsq(X[ok], sub[..., ch][ok], rcond=None)
            fill[..., ch] = X @ coef
        bandimgs.append((i, (x0, y0, x1, y1), fill))
    plate_bands = bg.copy()
    for i, (x0, y0, x1, y1), fill in bandimgs: plate_bands[y0:y1] = fill
    for name, r, lang in T: sc.text(name, r, lang, gap=.2 if lang == 'ar' else .17)
    for i, (x0, y0, x1, y1), fill in bandimgs:
        sc.save(f'band{i + 1}', np.dstack([fill, np.full(fill.shape[:2], 255, np.float32)]), x0, y0, dict(kind='band'))
    # tower + man + ground as one foreground (they rise together); Floor 23 card separately
    card = (425, 868, 562, 990)
    work = img.copy()
    cx0, cy0, cx1, cy1 = card
    work[cy0:cy1, cx0:cx1] = img[cy0 - (cy1 - cy0) - 6:cy0 - 6, cx0:cx1]          # facade from the floors above
    for name, r, lang in T:                       # labels belong to the text layers, not the foreground
        x0, y0, x1, y1 = r; work[y0:y1, x0:x1] = plate_bands[y0:y1, x0:x1]
    sc.img = work
    fg = sc.element('fg', (0, 520, 1240, 1754), 'diff', thr=40, keep=3, plate=plate_bands,
                    poly=[(205, 520), (640, 520), (640, 740), (970, 740), (970, 1470), (1240, 1470), (1240, 1754), (0, 1754), (0, 1470), (205, 1470)])
    sc.img = img
    sc.element('card', card, 'rect', rounded=10)
    p = sc.plate(bg)
    sc.done(p, dict(finger=[sc.fx(578), sc.fy(830)]))

# ------------------------------------------------------------------ S6 AI voice agent (b06)
def agent():
    sc = Scene('s6', 'b06', 140, 227)
    img = sc.img
    T = [('t_title', (120, 245, 1125, 345), 'en'), ('t_sub', (120, 360, 1125, 422), 'en'), ('t_ar1', (120, 432, 1120, 505), 'ar'),
         ('t_ar2', (120, 530, 1125, 695), 'ar'),
         ('t_l1', (262, 790, 440, 842), 'en'), ('t_l2', (520, 790, 700, 842), 'en'), ('t_l3', (760, 755, 990, 842), 'en')]
    NUMS = [('n1', (262, 722, 440, 790)), ('n2', (520, 722, 700, 790))]
    BAND = (200, 704, 1040, 880)
    textm = rect_mask(img.shape, [r for _, r, _ in T] + [r for _, r in NUMS], 6)
    logo = rect_mask(img.shape, [(40, 40, 340, 150)], 4)
    MAN = (0, 860, 470, 1754); POD = (370, 1005, 1215, 1754)
    m0 = textm | logo | rect_mask(img.shape, [BAND, MAN, POD], 6)
    bg = clean_bg(img, m0)
    band_fill = clean_bg(img[BAND[1]:BAND[3], BAND[0]:BAND[2]].copy(), textm[BAND[1]:BAND[3], BAND[0]:BAND[2]])
    for name, r, lang in T: sc.text(name, r, lang, gap=.2 if lang == 'ar' else .17)
    for name, r in NUMS: sc.text(name, r, 'en', split=False)
    sc.save('band', np.dstack([band_fill, np.full(band_fill.shape[:2], 255, np.float32)]), BAND[0], BAND[1], dict(kind='band'))
    # dividers inside the band (thin bright bars)
    plate_band = bg.copy(); plate_band[BAND[1]:BAND[3], BAND[0]:BAND[2]] = band_fill
    sc.element('man', MAN, 'diff', thr=34, keep=2, plate=bg, poly=[(0, 860), (470, 860), (470, 1754), (0, 1754)])
    sc.element('podium', POD, 'diff', thr=34, keep=2, plate=bg, poly=[(470, 1005), (1215, 1005), (1215, 1754), (380, 1754), (380, 1470), (470, 1470)])
    p = sc.plate(bg)
    sc.done(p, dict(nums=[dict(id='n1', text='+20', target=20, prefix='+'), dict(id='n2', text='24/7', target=24, suffix='/7')]))

# ------------------------------------------------------------------ S7 digital twin (b08)
def twin():
    sc = Scene('s7', 'b08', 140, 227)
    img = sc.img
    T = [('t_title', (70, 240, 1140, 355), 'en'), ('t_ar', (205, 368, 1000, 540), 'ar')]
    CALL = [('c_cctv', (120, 564, 398, 830), 'left'), ('c_ahu', (120, 845, 398, 1003), 'left'), ('c_hub', (822, 564, 1095, 715), 'right'),
            ('c_energy', (822, 780, 1095, 930), 'right'), ('c_indoor', (829, 985, 1094, 1150), 'right')]
    textm = rect_mask(img.shape, [r for _, r, _ in T], 6)
    logo = rect_mask(img.shape, [(40, 40, 340, 150)], 4)
    callm = rect_mask(img.shape, [r for _, r, _ in CALL], 6)
    # sky/background plate: everything except the headline is replaced by the smooth continuation
    PHOTO_TOP = 540
    m0 = textm | logo | callm
    m0[PHOTO_TOP:] = 255
    bg = clean_bg(img, m0)
    for name, r, lang in T: sc.text(name, r, lang, gap=.2 if lang == 'ar' else .14)
    for name, r, side in CALL:
        L = sc.element(name, r, 'rect', rounded=12); L['side'] = side
    # photo layer: tower + city with the callouts filled in, soft top edge into the sky
    ph = img.copy()
    sky = clean_bg(img, callm | textm | logo)
    ph = ph * (1 - (callm[..., None] / 255)) + sky * (callm[..., None] / 255)
    y0 = 420
    crop = ph[y0:]
    yy = np.arange(crop.shape[0], dtype=np.float32)[:, None]
    d = np.abs(crop - bg[y0:]).sum(axis=2)
    a = np.clip((d - 18) / 40, 0, 1)
    a = cv2.GaussianBlur(a, (0, 0), 3)
    a = np.maximum(a, np.clip((yy - 600) / 200, 0, 1))      # lower city fully opaque
    sc.save('photo', np.dstack([crop, a * 255]), 0, y0, dict(kind='element'))
    p = sc.plate(bg)
    sc.done(p)

# ------------------------------------------------------------------ S9 global presence (b16)
def glob():
    sc = Scene('s9', 'b16', 215, 260)
    img = sc.img
    T = [('t_en', (280, 245, 935, 320), 'en'), ('t_ar', (90, 345, 1115, 478), 'ar'),
         ('t_cn', (342, 742, 600, 812), 'en'), ('t_pj', (790, 742, 1000, 812), 'en'), ('t_bar', (600, 742, 625, 812), 'en'),
         ('t_ar2', (165, 865, 1045, 995), 'ar'), ('t_find', (340, 1340, 875, 1395), 'en'),
         ('t_contact', (50, 1460, 410, 1560), 'en'), ('t_contact_ar', (50, 1530, 410, 1600), 'ar'),
         ('t_phone', (50, 1600, 410, 1650), 'en'), ('t_mail', (50, 1652, 410, 1705), 'en')]
    NUMS = [('n10', (222, 742, 342, 812)), ('n200', (625, 742, 790, 812))]
    FLAGS = [('EGYPT', 58, 200), ('SAUDI ARABIA', 218, 358), ('OMAN', 378, 518), ('KUWAIT', 538, 678), ('UAE', 698, 838), ('IRAQ', 858, 998), ('USA', 1019, 1152)]
    CARDS = [('card_sa', (74, 1027, 593, 1157)), ('card_eg', (621, 1027, 1138, 1157)), ('card_iq', (74, 1173, 593, 1306)), ('card_us', (621, 1173, 1138, 1306))]
    QR = (934, 1478, 1151, 1698)
    rects = [r for _, r, _ in T] + [r for _, r in NUMS] + [r for _, r in CARDS] + [QR] + [(x0, 494, x1, 620) for _, x0, x1 in FLAGS]
    m0 = rect_mask(img.shape, rects, 6) | rect_mask(img.shape, [(430, 90, 780, 210)], 4)
    bg = clean_bg(img, m0)
    for name, r, lang in T: sc.text(name, r, lang, gap=.2 if lang == 'ar' else .17, split=name not in ('t_bar',))
    for name, r in NUMS: sc.text(name, r, 'en', split=False)
    for i, (lab, x0, x1) in enumerate(FLAGS):
        sc.element(f'flag{i}', (x0, 494, x1, 578), 'rect', rounded=3)
        sc.text(f'flagl{i}', (x0 - 10, 586, x1 + 10, 620), 'en', split=False)
    for name, r in CARDS: sc.element(name, r, 'diff', thr=12, keep=1, plate=bg, feather=1.2)
    sc.element('qr', QR, 'rect', rounded=10)
    p = sc.plate(bg)
    sc.done(p, dict(nums=[dict(id='n10', text='10+', target=10, suffix='+'), dict(id='n200', text='200+', target=200, suffix='+')]))

if __name__ == '__main__':
    which = sys.argv[2:] or ['cover', 'project', 'agent', 'twin', 'glob']
    if os.path.exists('manifest.json'): MAN.update(json.load(open('manifest.json')))
    for w in which: globals()[w](); print('done', w)
    json.dump(MAN, open('manifest.json', 'w'), indent=1, ensure_ascii=False)
