"""Builds the editable Cityscape Qatar x VOOM story (1080x1920).
Output: story.svg with live text (Gabarito) and the vector End-to-End logo.
Run: python3 designs/cityscape-qatar-2026/build.py"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).parent
LOGO = ROOT / ".claude/skills/voom-brand/assets/logo/voom-logo-full-white.svg"

W, H = 1080, 1920
NAVY, BLUE, LIGHT, OFF = "#000024", "#0012d6", "#00b3ff", "#f1f1f1"
FONT = "Gabarito, sans-serif"

# ---- copy (edit here or directly in the SVG) ----
HEAD1, HEAD2 = "Cityscape", "Qatar"
AMP = "&amp;"
BOOTH_LABEL, BOOTH = "BOOTH:", "H3.B57"
DATE = "27–29 Oct 2026"

src = LOGO.read_text()
paths = "\n".join(re.findall(r"<path[^>]*/>", src, re.S))
# logo viewBox 60 60 3880 1286 -> paths in a symbol
logo_symbol = f'<symbol id="voom-logo" viewBox="60 60 3880 1286"><g fill="{OFF}">{paths}</g></symbol>'
wordmark = "\n".join(re.findall(r"<path[^>]*/>", src, re.S)[:8])  # VOOM + rocket + (R), no tagline
wordmark_symbol = f'<symbol id="voom-wordmark" viewBox="60 60 3880 850"><g>{wordmark}</g></symbol>'

def band(y, angle, fill, ink, idp, logos=True):
    """Diagonal event ribbon. Front band: logo + diamond + event name, centred on the canvas.
    Back band: event name only, so the crossing never hides a logo."""
    h = 96
    unit = [("logo", 220, 30), ("dia", 18, 30), ("txt", 389, 30), ("dia", 18, 30)] if logos else [("txt", 389, 34), ("dia", 18, 34)]
    period = sum(w + g for _, w, g in unit)
    items, x = [], W / 2 - 110 - period * 3  # a logo (or text) sits dead centre
    while x < W + 600:
        for kind, w, g in unit:
            if kind == "logo":
                items.append(f'<use xlink:href="#voom-wordmark" x="{x}" y="{y-24}" width="{w}" height="48" fill="{ink}"/>')
            elif kind == "dia":
                items.append(f'<rect x="{x}" y="{y-9}" width="18" height="18" transform="rotate(45 {x+9} {y})" fill="{ink}"/>')
            else:
                items.append(f'<text x="{x}" y="{y+15}" font-family="{FONT}" font-weight="600" font-size="42" letter-spacing="-0.5" fill="{ink}">Cityscape Qatar 2026</text>')
            x += w + g
    return (f'<g id="{idp}" transform="rotate({angle} {W/2} {y})">'
            f'<rect x="-400" y="{y-h/2}" width="{W+800}" height="{h}" fill="{fill}"/>'
            + "".join(items) + "</g>")

# grid floor (perspective) at the bottom
floor = []
hy, vx = 1500, W / 2
for i in range(-14, 15):
    floor.append(f'<line x1="{vx + i*18}" y1="{hy}" x2="{vx + i*150}" y2="{H+40}"/>')
y, step = hy, 14
while y < H:
    floor.append(f'<line x1="0" y1="{y:.0f}" x2="{W}" y2="{y:.0f}"/>')
    step *= 1.35; y += step

card_x, card_y, card_w, card_h = 90, 1110, W - 180, 300
mid = card_y + 158
DATE_W = 404  # measured width of DATE at 62px Gabarito 500
DATE_X = round(W / 2 - (50 + 26 + DATE_W) / 2)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<title>Cityscape Qatar &amp; VOOM — Booth H3.B57 — 27–29 Oct 2026</title>
<defs>
  {logo_symbol}
  {wordmark_symbol}
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{NAVY}"/><stop offset=".62" stop-color="{BLUE}"/><stop offset="1" stop-color="{LIGHT}"/>
  </linearGradient>
  <linearGradient id="topshade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{NAVY}" stop-opacity=".85"/><stop offset=".45" stop-color="{NAVY}" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="{LIGHT}" stop-opacity=".75"/><stop offset=".55" stop-color="{BLUE}" stop-opacity=".35"/><stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="floorfade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/>
  </linearGradient>
  <mask id="floormask"><rect x="0" y="{hy}" width="{W}" height="{H-hy}" fill="url(#floorfade)"/></mask>
  <linearGradient id="cardstroke" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{LIGHT}"/><stop offset="1" stop-color="{OFF}" stop-opacity=".5"/>
  </linearGradient>
</defs>

<g id="background">
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#topshade)"/>
  <ellipse cx="{W/2}" cy="1330" rx="780" ry="600" fill="url(#glow)"/>
  <path d="M -120 {hy+40} Q {W/2} {hy-90} {W+120} {hy+40}" fill="none" stroke="{LIGHT}" stroke-opacity=".45" stroke-width="2"/>
  <g id="grid-floor" stroke="{OFF}" stroke-opacity=".16" stroke-width="1.5" mask="url(#floormask)">{"".join(floor)}</g>
  <circle cx="930" cy="250" r="190" fill="none" stroke="{LIGHT}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="6 14"/>
</g>

<g id="headline" font-family="{FONT}" font-weight="600" font-size="196" letter-spacing="-5.9" fill="{OFF}" text-anchor="middle">
  <text x="{W/2}" y="440">{HEAD1}</text>
  <text x="{W/2}" y="616">{HEAD2}</text>
</g>
<text id="ampersand" x="{W/2}" y="746" font-family="{FONT}" font-weight="500" font-size="120" fill="{LIGHT}" text-anchor="middle">{AMP}</text>
<use id="voom-logo-end-to-end" xlink:href="#voom-logo" x="{W/2-330}" y="806" width="660" height="218.8"/>

<g id="ribbons">
  {band(1690, 7, OFF, NAVY, "ribbon-back", logos=False)}
  {band(1680, -6, LIGHT, NAVY, "ribbon-front")}
</g>

<g id="info-card">
  <rect x="{card_x}" y="{card_y}" width="{card_w}" height="{card_h}" rx="40" fill="{NAVY}" fill-opacity=".72" stroke="url(#cardstroke)" stroke-width="2"/>
  <text id="booth" x="{W/2}" y="{card_y+122}" font-family="{FONT}" text-anchor="middle" fill="{OFF}">
    <tspan font-weight="500" font-size="44" letter-spacing="1" fill="{LIGHT}">{BOOTH_LABEL}</tspan><tspan dx="22" font-weight="600" font-size="96" letter-spacing="-2.9">{BOOTH}</tspan>
  </text>
  <line x1="{card_x+60}" y1="{mid}" x2="{card_x+card_w-60}" y2="{mid}" stroke="{OFF}" stroke-opacity=".22" stroke-width="2"/>
  <g id="date">
    <g id="calendar-icon" fill="none" stroke="{LIGHT}" stroke-width="4" transform="translate({DATE_X} {mid+44})">
      <rect x="0" y="6" width="50" height="46"/><line x1="0" y1="20" x2="50" y2="20"/><line x1="13" y1="0" x2="13" y2="12"/><line x1="37" y1="0" x2="37" y2="12"/>
    </g>
    <text x="{DATE_X+76}" y="{mid+92}" font-family="{FONT}" font-weight="500" font-size="62" letter-spacing="-1.2" fill="{OFF}">{DATE}</text>
  </g>
</g>
</svg>
'''
(HERE / "story.svg").write_text(svg)
print("wrote", HERE / "story.svg")
