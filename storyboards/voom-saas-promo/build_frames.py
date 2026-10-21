#!/usr/bin/env python3
"""Generate the Voom SaaS promo storyboard frames as layered SVGs (1920x1080).

Every frame is built from named top-level groups (<g id="L##_name">) so it can be
opened in Illustrator -> Release to Layers -> imported into After Effects as a
composition with one layer per group. Glows use radial gradients (no SVG filters)
so they survive the Illustrator/AE import.

Run:  python3 build_frames.py   (writes frames/*.svg)
"""
import base64
import io
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
LOGO_DIR = os.path.join(ROOT, ".claude", "skills", "voom-brand", "assets", "logo")
OUT = os.path.join(HERE, "frames")

W, H = 1920, 1080
BLUE, LBLUE, DEEP, OFF = "#0012d6", "#00b3ff", "#000024", "#f1f1f1"
AR = "IBM Plex Sans Arabic"
LAT = "Gabarito"
# Product-depiction status colors only (never brand colors).
ST_AVAIL, ST_SOLD, ST_RES = "#2fb344", "#e03131", "#e8c200"


def logo_data(name, width):
    im = Image.open(os.path.join(LOGO_DIR, name + ".png"))
    im = im.crop(im.getbbox())
    h = round(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode(), im.width / im.height


def logo_svg(name):
    """Vector logo inlined as paths (no data URI): returns a placer and the viewBox ratio."""
    src = open(os.path.join(LOGO_DIR, name + ".svg")).read()
    vx, vy, vw, vh = [float(v) for v in re.search(r'viewBox="([^"]+)"', src).group(1).split()]
    body = src[src.index("<g"):src.rindex("</svg>")]

    def place(x, y, w):
        k = w / vw
        return f'<g id="LOGO_FULL" data-bbox="{vx} {vy} {vw} {vh}" transform="translate({x:.1f},{y:.1f}) scale({k:.5f}) translate({-vx},{-vy})">{body}</g>'
    return place, vw / vh


import re
LOGO_FULL, LOGO_FULL_R = logo_svg("voom-logo-full-white")
WM_W, WM_R = logo_data("voom-wordmark-white", 500)
WM_B, _ = logo_data("voom-wordmark-black", 500)

# ---------------------------------------------------------------- helpers
import re

_IDS = {}


def uid(base):
    """Unique, readable id per frame (Illustrator uses it as the object/layer name)."""
    base = re.sub(r"[^\w]+", "_", base, flags=re.UNICODE).strip("_")[:40] or "item"
    n = _IDS.get(base, 0) + 1
    _IDS[base] = n
    return base if n == 1 else f"{base}_{n}"


def grp(name, body):
    return f'<g id="{uid(name)}">{body}</g>'


def plain(s):
    return re.sub(r"<[^>]+>", "", s).replace("&amp;", "&")



def g(id_, body, extra=""):
    _IDS[id_] = 1
    return f'<g id="{id_}"{extra}>\n{body}\n</g>'


def text(x, y, s, size, weight=600, fill=OFF, anchor="middle", font=AR, rtl=True, opacity=1, ls=0, id_=None):
    d = ' direction="rtl"' if rtl else ""
    i = f' id="{id_ or uid("TXT_" + plain(s))}"'
    op = f' opacity="{opacity}"' if opacity != 1 else ""
    lsp = f' letter-spacing="{ls}"' if ls else ""
    return (f'<text{i} x="{x}" y="{y}" font-family="{font}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}"{d}{op}{lsp}>{s}</text>')


def hl(s, fill=LBLUE):
    return f'<tspan fill="{fill}">{s}</tspan>'


def rrect(x, y, w, h, r, fill="none", stroke="none", sw=0, opacity=1, extra=""):
    op = f' opacity="{opacity}"' if opacity != 1 else ""
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke != "none" else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{st}{op}{extra}/>'


ICONS = {
    "building": "M4 21V6l8-3 8 3v15M2 21h20M9 21v-4h6v4M8 8h2M14 8h2M8 12h2M14 12h2",
    "units": "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    "layers": "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
    "data": "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    "sync": "M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M6 21v-4h4",
    "wifi": "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.5",
    "slash": "M3 3l18 18",
    "spark": "M12 2l2.2 6.3L21 10l-6.8 2L12 19l-2.2-7L3 10l6.8-1.7z",
    "chart": "M3 17l6-6 4 4 8-8M15 7h6v6",
    "check": "M5 12l5 5 9-10",
    "pin": "M12 22s7-6.6 7-12a7 7 0 0 0-14 0c0 5.4 7 12 7 12zM12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
    "users": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1M16 3.5a4 4 0 0 1 0 7.5M19 14a6 6 0 0 1 3 5.2V21",
    "plan": "M3 3h18v18H3zM3 10h8M11 3v11M15 10v11M15 14h6",
    "cube": "M12 2l9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10",
    "clock": "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 3",
    "zoom": "M10 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-6-6M10 7v6M7 10h6",
    "plus": "M12 5v14M5 12h14",
    "arrow_up": "M7 17L17 7M9 7h8v8",
}


def icon(name, x, y, size, color=OFF, sw=1.8):
    s = size / 24
    return (f'<path id="{uid("ICON_" + name)}" d="{ICONS[name]}" transform="translate({x} {y}) scale({s})" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="square" stroke-linejoin="miter"/>')


def icon_tile(x, y, size, name, dark=True):
    """Glowing brand-blue rounded tile with a line icon (product-sheet component)."""
    pad = size * 0.24
    glow = f'<circle cx="{x+size/2}" cy="{y+size/2}" r="{size*0.95}" fill="url(#gTileGlow)"/>' if dark else ""
    return grp("ICON_TILE_" + name, glow + rrect(x, y, size, size, size * 0.26, fill="url(#gTile)", stroke="url(#gGlassStroke)", sw=1.5)
               + icon(name, x + pad, y + pad, size - 2 * pad, OFF, 1.8))


def glass(x, y, w, h, r=28, dark=True):
    if dark:
        return grp("GLASS", rrect(x, y, w, h, r, fill="url(#gGlassFill)", stroke="url(#gGlassStroke)", sw=1.5)
                   + rrect(x + 1.5, y + 1.5, w - 3, h - 3, r - 1.5, fill="url(#gGlassSheen)"))
    shadow = f'<ellipse cx="{x+w/2}" cy="{y+h+10}" rx="{w*0.48}" ry="{max(24,h*0.12)}" fill="url(#gShadow)"/>'
    return grp("GLASS", shadow + rrect(x, y, w, h, r, fill="#ffffff", stroke="url(#gGlassStrokeLight)", sw=1.5, opacity=0.92)
               + rrect(x + 1.5, y + 1.5, w - 3, h - 3, r - 1.5, fill="url(#gSheenLight)"))


def pill(cx, cy, label, w=None, dark=True, icon_name=None, size=30, font=AR, rtl=True, color=None):
    w = w or (len(label) * size * 0.62 + (90 if icon_name else 60))
    h = size * 2.1
    x, y = cx - w / 2, cy - h / 2
    out = glass(x, y, w, h, h / 2, dark)
    col = color or (OFF if dark else DEEP)
    if icon_name:
        t = h - 16
        out += icon_tile(x + w - t - 8, y + 8, t, icon_name, dark) if rtl else icon_tile(x + 8, y + 8, t, icon_name, dark)
        tx = cx - t / 2 if rtl else cx + t / 2
    else:
        tx = cx
    out += text(tx, cy + size * 0.36, label, size, 500, col, "middle", font, rtl)
    return grp("PILL_" + label, out)


def pill_width(label, size, icon_name=None):
    return len(label) * size * 0.62 + (90 if icon_name else 60)


def pill_row(labels, cy, size=24, font=LAT, rtl=False, gap=24, cx=960, dark=True):
    """Pills side by side, sized to their labels, evenly spaced and centred on cx (never overlapping)."""
    ws = [pill_width(l, size) for l in labels]
    x = cx - (sum(ws) + gap * (len(ws) - 1)) / 2
    out = ""
    for l, w in zip(labels, ws):
        out += pill(x + w / 2, cy, l, w, dark, None, size, font, rtl)
        x += w + gap
    return out


def cursor(x, y, s=1.0, color=OFF):
    return (f'<path id="{uid("CURSOR")}" d="M0 0L0 34L9 26L15 40L21 37L15 24L27 24Z" transform="translate({x} {y}) scale({s})" '
            f'fill="{color}" stroke="{DEEP}" stroke-width="2" stroke-linejoin="round"/>')


def ping(cx, cy, r=34):
    return grp("TAP_PING", f'<circle id="{uid("PING_RING_1")}" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{LBLUE}" stroke-width="2.5" opacity="0.9"/>'
               f'<circle id="{uid("PING_RING_2")}" cx="{cx}" cy="{cy}" r="{r*1.7}" fill="none" stroke="{LBLUE}" stroke-width="1.5" opacity="0.35"/>'
               f'<circle id="{uid("PING_DOT")}" cx="{cx}" cy="{cy}" r="{r*0.35}" fill="{LBLUE}" opacity="0.5"/>')


def dashed_circle(cx, cy, r, color=LBLUE, opacity=0.45, sw=1.5, dash="6 10"):
    return (f'<circle id="{uid("ORBIT_DASHED")}" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-dasharray="{dash}" opacity="{opacity}"/>')


DEFS = f"""<defs>
  <linearGradient id="gSignature" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="{DEEP}"/><stop offset="0.55" stop-color="{BLUE}"/><stop offset="1" stop-color="{LBLUE}"/>
  </linearGradient>
  <radialGradient id="gGlowBlue" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{BLUE}" stop-opacity="0.9"/><stop offset="0.55" stop-color="{BLUE}" stop-opacity="0.25"/><stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gGlowLight" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0.75"/><stop offset="0.5" stop-color="{LBLUE}" stop-opacity="0.18"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gGlowSoftLight" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0.35"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gGlowSoftBlue" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{BLUE}" stop-opacity="0.22"/><stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gVignette" cx="0.5" cy="0.5" r="0.75">
    <stop offset="0.55" stop-color="{DEEP}" stop-opacity="0"/><stop offset="1" stop-color="{DEEP}" stop-opacity="0.85"/>
  </radialGradient>
  <radialGradient id="gTileGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0.45"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gShadow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{BLUE}" stop-opacity="0.16"/><stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="gTile" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{LBLUE}"/><stop offset="1" stop-color="{BLUE}"/>
  </linearGradient>
  <linearGradient id="gGlassFill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{OFF}" stop-opacity="0.10"/><stop offset="1" stop-color="{OFF}" stop-opacity="0.03"/>
  </linearGradient>
  <linearGradient id="gGlassSheen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{OFF}" stop-opacity="0.07"/><stop offset="0.45" stop-color="{OFF}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gGlassStroke" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0.95"/><stop offset="0.5" stop-color="{OFF}" stop-opacity="0.18"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0.55"/>
  </linearGradient>
  <linearGradient id="gGlassStrokeLight" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0.7"/><stop offset="0.5" stop-color="{BLUE}" stop-opacity="0.08"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0.45"/>
  </linearGradient>
  <linearGradient id="gSheenLight" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="0.4" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gTextFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{OFF}"/><stop offset="1" stop-color="{LBLUE}"/>
  </linearGradient>
  <linearGradient id="gStreak" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0"/><stop offset="0.5" stop-color="{LBLUE}" stop-opacity="1"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0.45"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#03063a"/><stop offset="0.6" stop-color="{BLUE}" stop-opacity="0.55"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0.5"/>
  </linearGradient>
  <linearGradient id="gHorizon" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{LBLUE}" stop-opacity="0"/><stop offset="0.5" stop-color="{LBLUE}" stop-opacity="0.9"/><stop offset="1" stop-color="{LBLUE}" stop-opacity="0"/>
  </linearGradient>
</defs>"""


def bg_dark(glow=(960, 620), glow2=(1500, 180), horizon=False, grid=False):
    b = grp("BG_FILL", rrect(0, 0, W, H, 0, fill=DEEP))
    b += f'<ellipse id="{uid("GLOW_MAIN")}" cx="{glow[0]}" cy="{glow[1]}" rx="980" ry="620" fill="url(#gGlowBlue)"/>'
    if glow2:
        b += f'<ellipse id="{uid("GLOW_ACCENT")}" cx="{glow2[0]}" cy="{glow2[1]}" rx="520" ry="380" fill="url(#gGlowSoftLight)"/>'
    if grid:
        lines = []
        vy, base = 560, 1080
        for i in range(-12, 13):
            lines.append(f'<line x1="{960 + i*28}" y1="{vy}" x2="{960 + i*190}" y2="{base}"/>')
        for k, yy in enumerate([640, 700, 770, 850, 950, 1075]):
            lines.append(f'<line x1="0" y1="{yy}" x2="{W}" y2="{yy}"/>')
        b += f'<g id="{uid("GRID_FLOOR")}" stroke="{LBLUE}" stroke-width="1" opacity="0.12">{"".join(lines)}</g>'
    if horizon:
        b += f'<ellipse id="{uid("HORIZON_ARC")}" cx="960" cy="1420" rx="1250" ry="520" fill="none" stroke="url(#gHorizon)" stroke-width="2.5"/>'
        b += f'<ellipse id="{uid("HORIZON_GLOW")}" cx="960" cy="1060" rx="760" ry="140" fill="url(#gGlowSoftLight)"/>'
    b += grp("VIGNETTE", rrect(0, 0, W, H, 0, fill="url(#gVignette)"))
    return g("L01_BG", b)


def bg_light():
    b = grp("BG_FILL", rrect(0, 0, W, H, 0, fill=OFF))
    b += f'<ellipse id="{uid("GLOW_LIGHT")}" cx="1560" cy="120" rx="760" ry="520" fill="url(#gGlowSoftLight)"/>'
    b += f'<ellipse id="{uid("GLOW_BLUE")}" cx="300" cy="980" rx="820" ry="520" fill="url(#gGlowSoftBlue)"/>'
    return g("L01_BG", b)


def bg_signature():
    b = grp("BG_GRADIENT", rrect(0, 0, W, H, 0, fill="url(#gSignature)"))
    b += f'<ellipse id="{uid("GLOW_CENTER")}" cx="960" cy="540" rx="900" ry="520" fill="url(#gGlowSoftLight)" opacity="0.6"/>'
    return g("L01_BG", b)


def chrome(dark=True):
    """Small SaaS-style frame furniture: wordmark top-right (RTL), URL bottom-left."""
    return ""  # removed at the client's request (no corner wordmark / footer lines)
    img = WM_W if dark else WM_B
    w = 120
    h = w / WM_R
    col = OFF if dark else DEEP
    body = (f'<image id="{uid("WORDMARK")}" x="{W-80-w}" y="{60}" width="{w}" height="{h:.1f}" href="{img}" opacity="0.85"/>'
            + text(80, H - 54, "voomproptech.com", 18, 400, col, "start", LAT, False, 0.5)
            + text(W - 80, H - 54, "Proptech &amp; Digital Twin Innovation", 18, 400, col, "end", LAT, False, 0.5))
    return g("L90_CHROME", body)


def svg(frame_id, title, layers):
    body = "\n".join(layers)
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">\n<title>{frame_id} - {title}</title>\n'
            f'{DEFS}\n{body}\n</svg>\n')


# ---------------------------------------------------------------- frames
FRAMES = []


def frame(fid, title):
    def deco(fn):
        FRAMES.append((fid, title, fn))
        return fn
    return deco


@frame("F01", "Intro hook - لكل شركة تطوير عقاري")
def f01():
    words = [("Master plan", 300, 250, 30, 0.35), ("Live inventory", 1540, 300, 28, 0.35),
             ("CRM sync", 250, 820, 30, 0.3), ("16K", 1660, 780, 40, 0.4),
             ("3D floor plan", 560, 140, 24, 0.25), ("Offline", 1360, 930, 26, 0.25),
             ("AI", 1480, 560, 30, 0.3), ("Interior tour", 420, 560, 24, 0.22)]
    fl = "".join(text(x, y, s, sz, 500, OFF, "middle", LAT, False, op) for s, x, y, sz, op in words)
    orbit = dashed_circle(960, 520, 360, opacity=0.35) + dashed_circle(960, 520, 470, opacity=0.18, dash="3 12")
    tile = icon_tile(910, 300, 100, "building")
    return [bg_dark(glow=(960, 560), horizon=True), g("L02_ORBITS", orbit), g("L03_FLOAT_WORDS", fl),
            g("L04_ICON_TILE", tile),
            g("L10_HEADLINE", text(960, 560, "لكل شركة", 120, 600, OFF)
              + text(960, 700, hl("تطوير عقاري"), 120, 600)),
            chrome()]


@frame("F02", "Hook - عايزة تضاعف مبيعاتها")
def f02():
    cx, cy, cw, ch = 160, 250, 720, 560
    card = glass(cx, cy, cw, ch)
    card += text(cx + cw - 40, cy + 70, "المبيعات", 30, 500, OFF, "start")
    card += text(cx + 40, cy + 72, "Q1 - Q4", 22, 400, OFF, "start", LAT, False, 0.6)
    pts = [(cx + 40, cy + 470), (cx + 160, cy + 440), (cx + 270, cy + 450), (cx + 380, cy + 380),
           (cx + 480, cy + 330), (cx + 580, cy + 220), (cx + 680, cy + 140)]
    d = "M" + " L".join(f"{x} {y}" for x, y in pts)
    card += "<g id=\"CHART_GRIDLINES\">" + "".join(
        f'<line x1="{cx+40}" y1="{cy+180+i*90}" x2="{cx+680}" y2="{cy+180+i*90}" stroke="{OFF}" stroke-opacity="0.08"/>' for i in range(4)) + "</g>"
    card += f'<path id="CHART_AREA" d="{d} L{cx+680} {cy+520} L{cx+40} {cy+520}Z" fill="url(#gArea)"/>'
    card += f'<path id="CHART_LINE" d="{d}" fill="none" stroke="{LBLUE}" stroke-width="4" stroke-linejoin="round"/>'
    card += f'<circle id="CHART_DOT" cx="{cx+680}" cy="{cy+140}" r="10" fill="{OFF}" stroke="{LBLUE}" stroke-width="4"/>'
    chip = glass(cx - 40, cy - 60, 190, 74, 37) + icon("arrow_up", cx - 18, cy - 43, 40, LBLUE, 2.4) \
        + text(cx + 80, cy - 8, "×2", 44, 600, OFF, "middle", LAT, False)
    return [bg_dark(glow=(560, 620), glow2=(1500, 300)), g("L05_CHART_CARD", card), g("L06_CHIP_x2", chip),
            g("L07_CURSOR", cursor(cx + 700, cy + 160)),
            g("L10_HEADLINE", text(1760, 470, "عايزة", 110, 600, OFF, "start")
              + text(1760, 610, hl("تضاعف"), 150, 600, OFF, "start")
              + text(1760, 740, "مبيعاتها", 110, 600, OFF, "start")),
            chrome()]


def unit_grid(x, y, cols, rows, cell, gap, dark=False, seed=7):
    out = []
    pal = [BLUE, LBLUE, BLUE, "#7fd0ff" if not dark else LBLUE, BLUE]
    for r in range(rows):
        for c in range(cols):
            k = (r * 7 + c * 3 + seed) % 11
            col = pal[k % len(pal)]
            op = [1, 0.85, 0.55, 0.35, 0.18][k % 5]
            out.append(rrect(x + c * (cell + gap), y + r * (cell + gap), cell, cell, cell * 0.22, fill=col, opacity=op))
    return grp("UNIT_GRID", "".join(out))


@frame("F03", "مشروعك بالكامل")
def f03():
    x, y, w, h = 420, 330, 1080, 600
    card = glass(x, y, w, h, 32, dark=False)
    card += text(x + w - 50, y + 80, "مشروعك", 34, 600, DEEP, "start")
    card += text(x + 50, y + 82, "1,248 units", 28, 500, BLUE, "start", LAT, False)
    card += unit_grid(x + 50, y + 130, 18, 7, 46, 10)
    return [bg_light(), g("L05_PROJECT_CARD", card),
            g("L10_HEADLINE", text(960, 220, "مشروعك " + hl("بالكامل", BLUE), 110, 600, DEEP)),
            chrome(dark=False)]


@frame("F04", "بكل وحداته وتفاصيله وبياناته")
def f04():
    cards = []
    items = [("الوحدات", "units", 1360), ("التفاصيل", "layers", 760), ("البيانات", "data", 160)]
    for i, (lab, ic, x) in enumerate(items):
        y, w, h = 400, 400, 470
        c = glass(x, y, w, h, 32, dark=False)
        c += icon_tile(x + w - 130, y + 40, 90, ic, dark=False)
        c += text(x + w - 40, y + 200, lab, 46, 600, DEEP, "start")
        if ic == "units":
            c += unit_grid(x + 40, y + 250, 6, 3, 44, 12, seed=3)
        elif ic == "layers":
            c += (f'<g fill="none" stroke="{BLUE}" stroke-width="3">'
                  f'<rect x="{x+40}" y="{y+250}" width="320" height="170" rx="8"/>'
                  f'<path d="M{x+170} {y+250}v100M{x+40} {y+330}h130M{x+250} {y+330}v90M{x+250} {y+330}h110"/></g>'
                  + text(x + 105, y + 300, "4.2m", 20, 500, BLUE, "middle", LAT, False)
                  + text(x + 305, y + 390, "3.6m", 20, 500, BLUE, "middle", LAT, False))
        else:
            rows = [("Area", "145 m²"), ("Price", "4.8M"), ("Status", "Available")]
            for j, (k, v) in enumerate(rows):
                yy = y + 280 + j * 56
                c += text(x + 40, yy, k, 24, 400, DEEP, "start", LAT, False, 0.55)
                c += text(x + w - 40, yy, v, 24, 600, ST_AVAIL if k == "Status" else DEEP, "end", LAT, False)
                c += f'<line x1="{x+40}" y1="{yy+18}" x2="{x+w-40}" y2="{yy+18}" stroke="{DEEP}" stroke-opacity="0.08"/>'
        cards.append(g(f"L0{5+i}_CARD_{ic.upper()}", c))
    return [bg_light(), *cards,
            g("L10_HEADLINE", text(960, 260, "بكل وحداته وتفاصيله " + hl("وبياناته", BLUE), 96, 600, DEEP)),
            chrome(dark=False)]


def dashboard(x, y, w, h, dark=False, title="Voom"):
    fg = OFF if dark else DEEP
    out = glass(x, y, w, h, 26, dark)
    out += "".join(f'<circle cx="{x+30+i*22}" cy="{y+30}" r="6" fill="{fg}" opacity="0.18"/>' for i in range(3))
    out += rrect(x + w * 0.3, y + 16, w * 0.4, 28, 14, fill=fg, opacity=0.06)
    sb = 0.2 * w
    out += rrect(x + w - sb - 16, y + 60, sb, h - 76, 16, fill=fg, opacity=0.05)
    for i in range(5):
        out += rrect(x + w - sb + 4, y + 90 + i * 46, sb - 40, 18, 9, fill=BLUE if i == 0 else fg,
                     opacity=0.9 if i == 0 else 0.12)
    mx, my, mw, mh = x + 16, y + 60, w - sb - 48, h * 0.58
    out += rrect(mx, my, mw, mh, 16, fill="url(#gScreen)")
    out += unit_grid(mx + 30, my + 30, int((mw - 60) // 34), int((mh - 60) // 34), 26, 8, dark=True, seed=5)
    cw = (mw - 32) / 3
    for i in range(3):
        out += rrect(mx + i * (cw + 16), my + mh + 16, cw, h - mh - 92, 14, fill=fg, opacity=0.06)
        out += rrect(mx + i * (cw + 16) + 18, my + mh + 36, cw * 0.4, 12, 6, fill=fg, opacity=0.2)
        out += rrect(mx + i * (cw + 16) + 18, my + mh + 60, cw * 0.6, 22, 8, fill=BLUE if not dark else LBLUE, opacity=0.8)
    return grp("DASHBOARD", out)


@frame("F05", "في منصة واحدة تفاعلية")
def f05():
    return [bg_light(), g("L05_DASHBOARD", dashboard(460, 360, 1000, 600)),
            g("L06_CURSOR", ping(820, 560) + cursor(820, 560, 1.0, DEEP)),
            g("L10_HEADLINE", text(960, 250, "في " + hl("منصة واحدة", BLUE) + " تفاعلية", 104, 600, DEEP)),
            chrome(dark=False)]


@frame("F06", "متصلة بالـ CRM بتاعك")
def f06():
    # Spreadsheet CRM (Egyptian sample leads) syncing into the Voom dashboard.
    X, Y, Wd = 90, 300, 820
    XL = "#1d6f42"   # spreadsheet-app green: product depiction only
    sheet = glass(X, Y, Wd, 720, 18, dark=False)
    bar = rrect(X + 1, Y + 1, Wd - 2, 56, 17, fill="#f6f8fa")
    bar += rrect(X + Wd - 64, Y + 12, 34, 34, 7, fill=XL)
    bar += f'<path d="M{X+Wd-56} {Y+20}l18 18M{X+Wd-38} {Y+20}l-18 18" stroke="#fff" stroke-width="4"/>'
    bar += text(X + Wd - 80, Y + 37, "CRM_Leads.xlsx", 20, 600, DEEP, "end", LAT, False)
    bar += "".join(rrect(X + 24 + i * 26, Y + 22, 16, 16, 4, fill=DEEP, opacity=0.12) for i in range(3))
    sheet += grp("SHEET_TOOLBAR", bar)
    # columns right-to-left: row number, name, mobile, unit, status, source, agent
    cols = [("#", 42), ("الاسم", 160), ("الموبايل", 160), ("الوحدة", 92), ("الحالة", 116), ("المصدر", 112), ("المسؤول", 110)]
    rows = [
        ("أحمد محمود", "0100 245 7831", "A-204", "محجوز", "فيسبوك", "سارة"),
        ("منى عبد الرحمن", "0112 908 3417", "B-118", "مباع", "إحالة", "يوسف"),
        ("محمد السيد", "0122 670 1954", "C-031", "متاح", "الموقع", "مريم"),
        ("ياسمين فؤاد", "0155 312 8806", "A-412", "محجوز", "معرض", "سارة"),
        ("كريم حسني", "0101 774 2290", "D-207", "مباع", "فيسبوك", "يوسف"),
        ("هبة مصطفى", "0114 563 0718", "B-305", "متاح", "إحالة", "مريم"),
        ("عمرو عادل", "0127 481 6625", "C-110", "محجوز", "الموقع", "سارة"),
        ("نورهان سامي", "0150 239 4471", "A-019", "مباع", "معرض", "يوسف"),
        ("مصطفى إبراهيم", "0106 812 3390", "D-114", "متاح", "فيسبوك", "مريم"),
        ("سلمى خالد", "0111 405 7726", "B-221", "محجوز", "الموقع", "سارة"),
        ("طارق فتحي", "0128 337 9014", "C-308", "مباع", "إحالة", "يوسف"),
        ("دينا أشرف", "0155 760 2148", "A-115", "متاح", "معرض", "مريم"),
        ("شريف ناصر", "0109 223 5867", "D-402", "محجوز", "فيسبوك", "سارة"),
        ("رنا جمال", "0114 978 0631", "B-017", "مباع", "الموقع", "يوسف"),
    ]
    stc = {"متاح": ST_AVAIL, "محجوز": ST_RES, "مباع": ST_SOLD}
    top, hh, rh = Y + 70, 44, 42
    edges, x = [], X + Wd - 14
    for _, w in cols:
        edges.append((x - w, x)); x -= w
    grid = rrect(X + 14, top, Wd - 28, hh, 0, fill="#eef2f6")
    grid += rrect(edges[1][0], top + hh, edges[1][1] - edges[1][0], rh, 0, fill="none", stroke=XL, sw=2.5)  # selected cell
    lines = [f'<line x1="{X+14}" y1="{top + hh + r*rh}" x2="{X+Wd-14}" y2="{top + hh + r*rh}"/>' for r in range(len(rows) + 1)]
    lines += [f'<line x1="{a}" y1="{top}" x2="{a}" y2="{top + hh + len(rows)*rh}"/>' for a, _ in edges[:-1]]
    grid += f'<g id="SHEET_GRID" stroke="{DEEP}" stroke-opacity="0.1" stroke-width="1">{"".join(lines)}</g>'
    head = "".join(text((a + b) / 2, top + 29, lab, 17, 600, DEEP, "middle") for (lab, _), (a, b) in zip(cols, edges))
    body = ""
    for r, row in enumerate(rows):
        cy = top + hh + r * rh + 28
        cells = [str(r + 1)] + list(row)
        for c, ((a, b), val) in enumerate(zip(edges, cells)):
            mid = (a + b) / 2
            if c == 4:
                body += grp("STATUS_PILL", rrect(mid - 44, cy - 21, 88, 28, 14, fill=stc[val], opacity=0.16)
                            + f'<circle cx="{mid+31}" cy="{cy-7}" r="5" fill="{stc[val]}"/>'
                            + text(mid - 8, cy, val, 16, 600, DEEP, "middle"))
            elif c in (0, 2, 3):
                body += text(mid, cy, val, 16, 500 if c else 400, DEEP if c else "#7a8494", "middle", LAT, False)
            else:
                body += text(mid, cy, val, 16, 500, DEEP, "middle")
    sheet += grp("SHEET_TABLE", grid + head + body)

    dash = dashboard(1090, 400, 700, 440)
    link = (f'<path id="LINK_PATH" d="M910 620 C 960 620, 1040 620, 1090 620" fill="none" stroke="{BLUE}" stroke-width="3" stroke-dasharray="10 10"/>'
            + "".join(f'<circle id="DATA_DOT_{i+1}" cx="{x}" cy="620" r="7" fill="{LBLUE}"/>' for i, x in enumerate((935, 1065)))
            + glass(945, 565, 110, 110, 55, dark=False) + icon("sync", 970, 590, 60, BLUE, 2.4))
    return [bg_light(), g("L05_CRM_SHEET", sheet), g("L06_DASHBOARD", dash), g("L07_SYNC_LINK", link),
            g("L10_HEADLINE", text(960, 230, "متصلة بالـ " + hl("CRM", BLUE) + " بتاعك", 104, 600, DEEP)),
            chrome(dark=False)]


@frame("F07", "شغالة أونلاين أو حتى أوفلاين")
def f07():
    # Start state: Online is selected. On «أوفلاين» the cursor clicks Offline and the knob slides left
    # (animate TOGGLE_KNOB to x - (tw/2 - 14) and swap the two option colours).
    tx, ty, tw, th = 560, 470, 800, 160
    track = glass(tx, ty, tw, th, th / 2, dark=False)
    knob = grp("TOGGLE_KNOB", rrect(tx + tw / 2, ty + 14, tw / 2 - 14, th - 28, (th - 28) / 2, fill="url(#gTile)"))
    off = grp("OPT_OFFLINE", icon("wifi", tx + 70, ty + 50, 60, DEEP, 2.4) + icon("slash", tx + 70, ty + 50, 60, DEEP, 2.4)
              + text(tx + 250, ty + 98, "Offline", 44, 500, DEEP, "middle", LAT, False, 0.55))
    on = grp("OPT_ONLINE", icon("wifi", tx + tw - 330, ty + 50, 60, OFF, 2.4)
             + text(tx + tw - 160, ty + 98, "Online", 44, 600, OFF, "middle", LAT, False))
    tog = track + knob + off + on
    ok = pill(960, 760, "المنصة شغالة بدون إنترنت", 560, dark=False, icon_name="check", size=30)
    return [bg_light(), g("L05_TOGGLE", tog), g("L06_STATUS_PILL", ok),
            g("L07_CURSOR", cursor(tx + 230, ty + 150, 1.0, DEEP)),
            g("L10_HEADLINE", text(960, 290, "أونلاين أو حتى " + hl("أوفلاين", BLUE), 110, 600, DEEP)),
            chrome(dark=False)]


@frame("F08", "VOOM logo reveal")
def f08():
    w = 980
    h = w / LOGO_FULL_R
    return [bg_signature(), g("L10_LOGO", LOGO_FULL(960 - w / 2, 540 - h / 2, w))]


@frame("F09", "منصة PropTech مدعومة بالذكاء الاصطناعي")
def f09():
    bx, by, bw, bh = 360, 600, 1200, 120
    bar = glass(bx, by, bw, bh, bh / 2) + icon("spark", bx + bw - 90, by + 34, 52, LBLUE, 2)
    bar += text(bx + bw - 120, by + 74, "اعرض الوحدات المتاحة بـ 3 غرف تحت 5 مليون", 32, 400, OFF, "start", AR, True, 0.8)
    bar += rrect(bx + 20, by + 20, 200, 80, 40, fill="url(#gTile)") + text(bx + 120, by + 72, "AI", 34, 600, OFF, "middle", LAT, False)
    chips = pill_row(["Smart filtration", "Live inventory", "Availability"], 830, 24, LAT, False)
    return [bg_dark(glow=(960, 700), glow2=(1500, 200), grid=True), g("L05_AI_BAR", bar), g("L06_CHIPS", chips),
            g("L07_CURSOR", cursor(bx + 150, by + 70)),
            g("L10_HEADLINE", text(960, 330, "منصة " + hl("PropTech"), 110, 600)
              + text(960, 470, "مدعومة بالذكاء الاصطناعي", 84, 500)),
            chrome()]


def device(x, y, w, h, label="PROJECT SCREEN"):
    """Tablet-style device with a placeholder screen (replace with real screen recording)."""
    out = rrect(x, y, w, h, 40, fill="#05082e", stroke="url(#gGlassStroke)", sw=3)
    out += rrect(x + 22, y + 22, w - 44, h - 44, 22, fill="url(#gScreen)")
    out += unit_grid(x + 70, y + 70, int((w - 140) // 52), int((h - 200) // 52), 40, 12, dark=True, seed=2)
    out += text(x + w / 2, y + h - 54, label, 22, 500, OFF, "middle", LAT, False, 0.55, 3)
    return grp("DEVICE", out)


@frame("F10", "بتحوّل مشروعك لتجربة تفاعلية")
def f10():
    dev = (f'<g transform="matrix(0.94 -0.12 0.18 0.86 -60 120)">'
           + device(560, 360, 960, 600, "REPLACE WITH SCREEN RECORDING") + "</g>")
    pills = (pill(380, 520, "Master plan", None, True, "plan", 26, LAT, False)
             + pill(1560, 430, "3D", 200, True, "cube", 26, LAT, False)
             + pill(1580, 820, "Interior tour", None, True, "zoom", 26, LAT, False))
    lines = (f'<g stroke="{OFF}" stroke-width="1.5" opacity="0.5" fill="none">'
             f'<path d="M520 520 L640 600"/><path d="M1460 430 L1320 500"/><path d="M1430 820 L1300 760"/></g>')
    return [bg_dark(glow=(960, 680), horizon=True), g("L05_DEVICE", dev), g("L06_LEADER_LINES", lines),
            g("L07_PILLS", pills), g("L08_TAP", ping(1040, 640) + cursor(1040, 640)),
            g("L10_HEADLINE", text(960, 200, "مشروعك بالكامل… " + hl("تجربة تفاعلية"), 92, 600)),
            chrome()]


@frame("F11", "بتربط العرض بالبيانات الحقيقية")
def f11():
    plan = glass(160, 330, 860, 600)
    plan += rrect(190, 360, 800, 540, 18, fill="url(#gScreen)")
    plan += unit_grid(230, 400, 13, 8, 46, 12, dark=True, seed=9)
    sel_x, sel_y = 230 + 8 * 58, 400 + 3 * 58
    plan += grp("SELECTED_UNIT", rrect(sel_x - 6, sel_y - 6, 58, 58, 14, fill="none", stroke=OFF, sw=3))
    card = glass(1180, 380, 580, 500) + text(1720, 450, "وحدة A-204", 40, 600, OFF, "start")
    rows = [("المساحة", "145 m²"), ("السعر", "4,800,000"), ("الغرف", "3"), ("الحالة", "Available")]
    for j, (k, v) in enumerate(rows):
        yy = 540 + j * 84
        card += text(1720, yy, k, 28, 400, OFF, "start", AR, True, 0.65)
        card += text(1220, yy, v, 30, 600, ST_AVAIL if k == "الحالة" else OFF, "start", LAT, False)
        card += f'<line x1="1220" y1="{yy+28}" x2="1720" y2="{yy+28}" stroke="{OFF}" stroke-opacity="0.1"/>'
    live = rrect(1220, 410, 130, 50, 25, fill=LBLUE, opacity=0.18) + f'<circle cx="1246" cy="435" r="8" fill="{LBLUE}"/>' \
        + text(1300, 445, "LIVE", 22, 600, LBLUE, "middle", LAT, False)
    link = (f'<path id="LINK_PATH" d="M{sel_x+52} {sel_y+23} C 1080 {sel_y+23}, 1080 560, 1180 560" fill="none" stroke="{LBLUE}" stroke-width="3"/>'
            f'<circle cx="{sel_x+52}" cy="{sel_y+23}" r="8" fill="{LBLUE}"/><circle cx="1180" cy="560" r="8" fill="{LBLUE}"/>')
    return [bg_dark(glow=(900, 640)), g("L05_PLAN_SCREEN", plan), g("L06_DATA_CARD", card + live),
            g("L07_LINK", link),
            g("L10_HEADLINE", text(960, 220, "العرض مربوط " + hl("بالبيانات الحقيقية"), 92, 600)),
            chrome()]


@frame("F12", "من الماستر بلان لحد أصغر وحدة")
def f12():
    steps = [("الماستر بلان", 1300, 380, 460, 420, "plan"), ("المبنى", 760, 430, 380, 360, "building"),
             ("الوحدة", 270, 470, 320, 290, "units")]
    out = []
    for i, (lab, x, y, w, h, ic) in enumerate(steps):
        c = glass(x, y, w, h)
        c += rrect(x + 20, y + 20, w - 40, h - 110, 18, fill="url(#gScreen)")
        if ic == "plan":
            c += unit_grid(x + 46, y + 46, 9, 6, 32, 10, dark=True, seed=4)
        elif ic == "building":
            for k in range(7):
                c += rrect(x + 110, y + 50 + k * 30, 160, 22, 5, fill=LBLUE if k == 3 else OFF, opacity=1 if k == 3 else 0.25)
        else:
            c += (f'<g fill="none" stroke="{OFF}" stroke-width="3" opacity="0.85">'
                  f'<rect x="{x+50}" y="{y+45}" width="220" height="130" rx="6"/>'
                  f'<path d="M{x+140} {y+45}v80M{x+50} {y+110}h90M{x+200} {y+110}v65"/></g>')
        c += icon_tile(x + w - 80, y + h - 76, 56, ic) + text(x + w - 100, y + h - 34, lab, 32, 600, OFF, "start")
        out.append(g(f"L0{5+i}_STEP_{ic.upper()}", c))
    arrows = (f'<g fill="none" stroke="{LBLUE}" stroke-width="3">'
              f'<path d="M1290 590 L1160 600"/><path d="M1172 588 L1158 600 L1172 612"/>'
              f'<path d="M750 610 L610 615"/><path d="M622 603 L608 615 L622 627"/></g>')
    zoom = pill(1530, 300, "16K zoom", 230, True, "zoom", 26, LAT, False)
    return [bg_dark(glow=(960, 640)), *out, g("L08_ARROWS", arrows), g("L09_16K_PILL", zoom),
            g("L10_HEADLINE", text(960, 200, "من الماستر بلان لحد " + hl("أصغر وحدة"), 92, 600)),
            chrome()]


@frame("F13", "بيانات دقيقة ومحدّثة لحظة بلحظة")
def f13():
    stats = [("متاح", "342", ST_AVAIL), ("محجوز", "128", ST_RES), ("مباع", "816", ST_SOLD)]
    out = ""
    for i, (lab, num, col) in enumerate(stats):
        x = 1290 - i * 400
        out += glass(x, 360, 360, 220)
        out += f'<circle cx="{x+320}" cy="{404}" r="9" fill="{col}"/>' + text(x + 300, 414, lab, 30, 500, OFF, "start")
        out += text(x + 180, 532, num, 96, 600, OFF, "middle", LAT, False)
    ch = glass(490, 620, 1160, 300)
    # line peaks below the "live" badge (y 650-714) so the badge sits clearly above the chart
    pts = [(530 + i * 80, 880 - v * 0.6) for i, v in enumerate([40, 60, 50, 90, 80, 120, 110, 150, 140, 175, 170, 200, 210, 220])]
    d = "M" + " L".join(f"{x} {y}" for x, y in pts)
    ch += f'<path id="CHART_AREA" d="{d} L{pts[-1][0]} 900 L530 900Z" fill="url(#gArea)"/>'
    ch += f'<path id="CHART_LINE" d="{d}" fill="none" stroke="{LBLUE}" stroke-width="4" stroke-linejoin="round"/>'
    ch += f'<circle id="CHART_DOT" cx="{pts[-1][0]}" cy="{pts[-1][1]}" r="10" fill="{OFF}" stroke="{LBLUE}" stroke-width="4"/>'
    live = glass(1360, 650, 260, 64, 32) + f'<circle cx="1590" cy="682" r="9" fill="{LBLUE}"/>' \
        + text(1570, 694, "تحديث الآن", 26, 500, OFF, "start")
    team = pill(330, 470, "فريق المبيعات", 300, True, "users", 26)
    return [bg_dark(glow=(1000, 620)), g("L05_STAT_CARDS", out), g("L06_CHART", ch), g("L07_LIVE_BADGE", live),
            g("L08_TEAM_PILL", team),
            g("L10_HEADLINE", text(960, 220, "بيانات دقيقة ومحدّثة " + hl("لحظة بلحظة"), 88, 600)),
            chrome()]


@frame("F14", "Transition into project footage (placeholder)")
def f14():
    dev = device(360, 170, 1200, 740, "THROUGH THE SCREEN -> PROJECT FOOTAGE")
    note = text(960, 990, "[ مقطع فيديوهات المشروع: الخريطة ← الماستر بلان ← الفلترة ← الإتاحة ← Exterior ← 3D ← Interior ]",
                26, 400, OFF, "middle", AR, True, 0.7)
    return [bg_dark(glow=(960, 540), glow2=None), g("L05_DEVICE", dev),
            g("L06_ZOOM_GUIDE", f'<rect x="382" y="192" width="1156" height="696" rx="22" fill="none" stroke="{LBLUE}" stroke-width="3" stroke-dasharray="14 10"/>'),
            g("L95_NOTE_DELETE", note)]


@frame("F15", "جاهز تضاعف مبيعاتك لـ 10 أضعاف")
def f15():
    big = text(960, 700, "10x", 480, 700, "url(#gTextFade)", "middle", LAT, False, 1, -14)
    rays = "".join(f'<path d="M{x} {y}l40 -40M{x+12} {y-40}h28v28" fill="none" stroke="{LBLUE}" stroke-width="3" opacity="{o}"/>'
                   for x, y, o in [(380, 640, 0.5), (1500, 520, 0.6), (1600, 760, 0.35), (300, 420, 0.3)])
    return [bg_dark(glow=(960, 600), horizon=True), g("L04_ARROWS", rays), g("L05_BIG_10X", big),
            g("L10_HEADLINE", text(960, 240, "جاهز تضاعف مبيعاتك؟", 92, 600)
              + text(960, 850, hl("10 أضعاف"), 72, 600)),
            chrome()]


def tile_wall(highlight_empty=False):
    out = []
    tw, th, gap = 300, 190, 30
    k = 0
    for r in range(5):
        for c in range(7):
            x = -120 + c * (tw + gap) + (r % 2) * 120
            y = 40 + r * (th + gap)
            k += 1
            if highlight_empty and r == 2 and c == 3:
                out.append(f'<g id="{uid("TILE_EMPTY_YOUR_PROJECT")}"><rect x="{x}" y="{y}" width="{tw}" height="{th}" rx="22" fill="{BLUE}" fill-opacity="0.25" '
                           f'stroke="{LBLUE}" stroke-width="3" stroke-dasharray="12 10"/>'
                           + icon("plus", x + tw / 2 - 28, y + 40, 56, LBLUE, 3)
                           + text(x + tw / 2, y + 150, "مشروعك", 34, 600, OFF) + "</g>")
                continue
            op = 0.35 + ((k * 7) % 5) * 0.08
            out.append(grp("TILE", rrect(x, y, tw, th, 22, fill="url(#gScreen)", stroke="url(#gGlassStroke)", sw=1.2, opacity=op)
                           + rrect(x + 20, y + th - 44, tw * 0.45, 14, 7, fill=OFF, opacity=0.25 * op)))
    return "".join(out)


@frame("F16", "أكتر من 200 مشروع اتباع عن طريق VOOM")
def f16():
    wall = f'<g transform="matrix(0.92 -0.16 0.22 0.8 -40 150)" opacity="0.9">{tile_wall()}</g>'
    # soft, gaussian-like falloff (no hard edge) so the counter reads on top of the wall
    scrim = (f'<defs><radialGradient id="gScrim" cx="50%" cy="50%" r="50%">'
             f'<stop offset="0" stop-color="{DEEP}" stop-opacity="0.92"/><stop offset="0.45" stop-color="{DEEP}" stop-opacity="0.8"/>'
             f'<stop offset="0.75" stop-color="{DEEP}" stop-opacity="0.35"/><stop offset="1" stop-color="{DEEP}" stop-opacity="0"/></radialGradient></defs>'
             f'<ellipse cx="960" cy="545" rx="980" ry="470" fill="url(#gScrim)"/>')
    return [bg_dark(glow=(960, 540)), g("L03_PROJECT_WALL", wall), g("L04_SCRIM", scrim),
            g("L05_COUNTER", text(960, 590, "+200", 260, 700, "url(#gTextFade)", "middle", LAT, False, 1, -8)),
            g("L10_HEADLINE", text(960, 740, "مشروع اتباع عن طريق " + hl("VOOM"), 72, 600)),
            chrome()]


@frame("F17", "والدور الجاي على مشروعك")
def f17():
    wall = f'<g transform="matrix(1.15 -0.2 0.27 1.0 -330 120)">{tile_wall(True)}</g>'
    return [bg_dark(glow=(960, 560)), g("L03_PROJECT_WALL", wall),
            g("L06_CURSOR", ping(1070, 575) + cursor(1070, 575)),
            g("L10_HEADLINE", rrect(460, 110, 1000, 150, 75, fill=DEEP, opacity=0.7)
              + text(960, 215, "والدور الجاي على " + hl("مشروعك"), 88, 600)),
            chrome()]


@frame("F18", "تجربة أوضح، بيعة أسرع")
def f18():
    return [bg_dark(glow=(960, 560), horizon=True),
            g("L05_ORBIT", dashed_circle(960, 540, 420, opacity=0.3)),
            g("L10_LINE1", text(960, 500, "تجربة أوضح،", 140, 600)),
            g("L11_LINE2", text(960, 680, "بيعة " + hl("أسرع."), 140, 600)),
            chrome()]


@frame("F19", "End card - logo + CTA")
def f19():
    w = 900
    h = w / LOGO_FULL_R
    url = pill(960, 800, "www.voomproptech.com", 520, True, None, 30, LAT, False)
    return [bg_signature(),
            g("L10_LOGO", LOGO_FULL(960 - w / 2, 430 - h / 2, w)),
            g("L11_URL", url), g("L12_HANDLE", text(960, 930, "@voomproptech", 26, 400, OFF, "middle", LAT, False, 0.75))]


def main():
    from outline_text import outline_svg

    out_ol = os.path.join(HERE, "frames_outlined")
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(out_ol, exist_ok=True)
    for fid, title, fn in FRAMES:
        _IDS.clear()
        doc = svg(fid, title, fn())
        with open(os.path.join(OUT, f"{fid}.svg"), "w", encoding="utf-8") as f:
            f.write(doc)
        with open(os.path.join(out_ol, f"{fid}.svg"), "w", encoding="utf-8") as f:
            f.write(outline_svg(doc))
        print("wrote", fid)


if __name__ == "__main__":
    main()
