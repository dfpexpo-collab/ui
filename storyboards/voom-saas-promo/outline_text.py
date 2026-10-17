"""Convert every <text> in a frame SVG to vector outlines, one <g> per word.

Illustrator often breaks Arabic when it imports live SVG text (disjoined or
reversed letters). The outlined copies look exactly like the previews and keep
each word as its own named group, so words can be animated one by one.

Shaping uses HarfBuzz (Arabic joining, kerning). Bidi is handled for the simple
cases in these frames: Latin/number runs inside an RTL line.
"""
import html
import os
import re

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills",
                                        "voom-brand", "assets", "fonts"))
FAMILY_FILE = {"IBM Plex Sans Arabic": "IBMPlexSansArabic", "Gabarito": "Gabarito", "Poppins": "Poppins"}
_CACHE = {}

LTR_RUN = re.compile(r"[A-Za-z0-9][A-Za-z0-9.,\-+×²%&'/]*(?:\s+[A-Za-z0-9][A-Za-z0-9.,\-+×²%&'/]*)*")


def _font(family, weight):
    key = (family, weight)
    if key not in _CACHE:
        base = FAMILY_FILE[family]
        avail = sorted(int(f.split("-")[1][:3]) for f in os.listdir(FONT_DIR) if f.startswith(base + "-"))
        w = min(avail, key=lambda a: abs(a - weight))
        path = os.path.join(FONT_DIR, f"{base}-{w}.ttf")
        with open(path, "rb") as fh:
            blob = hb.Blob(fh.read())
        hbfont = hb.Font(hb.Face(blob))
        tt = TTFont(path)
        _CACHE[key] = (hbfont, tt, tt.getGlyphSet(), tt.getGlyphOrder(), tt["head"].unitsPerEm)
    return _CACHE[key]


def _runs(chars, rtl):
    """Split logical text into directional runs, returned in visual (left-to-right) order."""
    s = "".join(c for c, _ in chars)
    if not rtl:
        return [(0, len(s), "ltr")]
    runs, pos = [], 0
    for m in LTR_RUN.finditer(s):
        if m.start() > pos:
            runs.append((pos, m.start(), "rtl"))
        runs.append((m.start(), m.end(), "ltr"))
        pos = m.end()
    if pos < len(s):
        runs.append((pos, len(s), "rtl"))
    return list(reversed(runs))


def _shape(chars, start, end, direction, family, weight):
    hbfont, *_ = _font(family, weight)
    buf = hb.Buffer()
    buf.add_codepoints([ord(c) for c, _ in chars[start:end]])
    buf.direction = direction
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    return [(info.codepoint, start + info.cluster, pos.x_advance, pos.x_offset, pos.y_offset)
            for info, pos in zip(buf.glyph_infos, buf.glyph_positions)]


def _parse_content(inner, base_fill):
    chars = []
    for m in re.finditer(r'<tspan fill="([^"]+)">(.*?)</tspan>|([^<]+)', inner, re.S):
        fill, ts, raw = m.group(1), m.group(2), m.group(3)
        seg, f = (html.unescape(ts), fill) if fill else (html.unescape(raw), base_fill)
        chars.extend((c, f) for c in seg)
    return chars


def _attrs(tag):
    return dict(re.findall(r'([\w-]+)="([^"]*)"', tag))


def outline_text(tag, inner):
    a = _attrs(tag)
    family, weight, size = a["font-family"], int(a["font-weight"]), float(a["font-size"])
    x, y = float(a["x"]), float(a["y"])
    rtl = a.get("direction") == "rtl"
    anchor = a.get("text-anchor", "start")
    ls = float(a.get("letter-spacing", 0))
    chars = _parse_content(inner, a["fill"])
    _, _, glyphset, order, upem = _font(family, weight)
    scale = size / upem

    glyphs = []
    for start, end, d in _runs(chars, rtl):
        glyphs.extend(_shape(chars, start, end, d, family, weight))
    width = sum(g[2] * scale + ls for g in glyphs) - (ls if glyphs else 0)

    if anchor == "middle":
        x0 = x - width / 2
    elif (anchor == "start") == rtl:  # rtl+start or ltr+end -> text ends at x
        x0 = x - width
    else:
        x0 = x

    # word index per character (words split on whitespace, logical order)
    word_of, wi = [], 0
    for i, (c, _) in enumerate(chars):
        if c.isspace():
            word_of.append(None)
            if i and not chars[i - 1][0].isspace():
                wi += 1
        else:
            word_of.append(wi)
    words = {}
    pen_x = x0
    for gid, cl, adv, xo, yo in glyphs:
        w = word_of[cl] if cl < len(word_of) else None
        if w is not None and not chars[cl][0].isspace():
            svgpen = SVGPathPen(glyphset)
            tpen = TransformPen(svgpen, (scale, 0, 0, -scale, pen_x + xo * scale, y - yo * scale))
            glyphset[order[gid]].draw(tpen)
            d = svgpen.getCommands()
            if d:
                words.setdefault(w, {}).setdefault(chars[cl][1], []).append(d)
        pen_x += adv * scale + ls

    text_words = "".join(c for c, _ in chars).split()
    gid_base = a.get("id", "TXT")
    meta = {"text": "".join(c for c, _ in chars), "font": family, "weight": weight, "size": size, "x": x, "y": y,
            "anchor": anchor, "fill": a["fill"], "ls": ls, "rtl": int(rtl)}
    data = "".join(f' data-{k}="{html.escape(str(v), quote=True)}"' for k, v in meta.items())
    out = [f'<g id="{gid_base}"' + data + (f' opacity="{a["opacity"]}"' if "opacity" in a else "") + ">"]
    for w in sorted(words):
        label = re.sub(r"[^\w]+", "", text_words[w] if w < len(text_words) else "") or "w"
        out.append(f'<g id="{gid_base}__w{w+1:02d}_{label}">')
        for fill, ds in words[w].items():
            out.append(f'<path d="{" ".join(ds)}" fill="{fill}"/>')
        out.append("</g>")
    out.append("</g>")
    return "".join(out)


def outline_svg(doc):
    return re.sub(r"(<text\b[^>]*>)(.*?)</text>", lambda m: outline_text(m.group(1), m.group(2)), doc, flags=re.S)
