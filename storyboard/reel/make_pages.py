# Brochure page -> 1080x1920 Reel plate: page fitted to width and centred on the safe band,
# with the page's own top/bottom edges continued as a gaussian-blurred fill (no hard crop).
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import sys
def plate(src, crop, pt, out):
    pg = Image.open(src).convert('RGB').crop(crop)
    h = round(pg.height * 1080 / pg.width); pg = pg.resize((1080, h), Image.LANCZOS)
    c = Image.new('RGB', (1080, 1920))
    top = pg.crop((0, 0, 1080, 24)).resize((1080, pt + 80)).filter(ImageFilter.GaussianBlur(30))
    c.paste(top, (0, 0))
    rest = 1920 - (pt + h)
    bot = pg.crop((0, h - 260, 1080, h)).transpose(Image.FLIP_TOP_BOTTOM).resize((1080, rest + 120))
    bot = ImageEnhance.Brightness(bot.filter(ImageFilter.GaussianBlur(38))).enhance(.82)
    c.paste(bot, (0, pt + h - 120))
    m = Image.new('L', (1080, h), 255); d = ImageDraw.Draw(m)
    for y in range(40): d.line((0, y, 1080, y), fill=int(255 * y / 40))
    for y in range(110): d.line((0, h - 1 - y, 1080, h - 1 - y), fill=int(255 * y / 110))
    c.paste(pg, (0, pt), m)
    c.save(out, quality=92)
P = sys.argv[1] if len(sys.argv) > 1 else 'brochure/pages/'  # folder with the brochure page JPGs (b01.jpg ...)
plate(P + 'b01.jpg', (0, 0, 1240, 1754), 166, 'assets/plate_b01.jpg')
plate(P + 'b04.jpg', (0, 140, 1240, 1754), 227, 'assets/plate_b04.jpg')
plate(P + 'b08.jpg', (0, 140, 1240, 1754), 227, 'assets/plate_b08.jpg')
