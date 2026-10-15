# VOOM SaaS promo – frames for After Effects

| Path | What |
|---|---|
| `STORYBOARD.md` | Shot table: VO, timing, visuals, motion, SFX |
| `frames_outlined/F01.svg` … `F19.svg` | **Use these in Illustrator.** Text converted to shapes (exact look, no broken Arabic), one group per word |
| `frames/F01.svg` … `F19.svg` | Same frames with live (editable) text |
| `previews/` | JPG renders + `_contact-sheet.jpg` |
| `build_frames.py` | Regenerates all SVGs (`python3 build_frames.py`, needs `pip install pillow uharfbuzz fonttools`) |

## Layer naming

Top level (one AE layer each): `L01_BG` background · `L02–L09` elements (cards, device, pills, cursor) · `L10+` headline/text · `L90_CHROME` small wordmark + footer · `L95_NOTE_DELETE` notes, delete before animating.

Inside each layer every part is its own named group/object, e.g. `GLASS`, `CHART_LINE`, `CHART_AREA`, `CHART_DOT`, `CURSOR`, `TAP_PING`, `ICON_TILE_users`, `PILL_Live_inventory`, `UNIT_GRID`, `TILE`, `GLOW_MAIN`, `HORIZON_ARC`, `VIGNETTE`. Text groups are `TXT_<text>` and, in `frames_outlined`, contain one group per word: `TXT_…__w01_<word>`, `__w02_…` (logical reading order, right to left for Arabic).

## SVG → After Effects

AE does not import SVG directly. Pick one route:

1. **Illustrator (recommended):** open the SVG, then in the Layers panel select the main layer → *Release to Layers (Sequence)*, rename the layers from the group IDs, and save as `.ai`. In AE: *Import → Composition – Retain Layer Sizes*. Right-click each layer → *Create Shapes from Vector Layer* to animate trim paths.
2. **Plugins:** Overlord (Battleaxe) to push the layers from Illustrator to AE, or an SVG-import script such as *SVG Import* / *Lottie importer*.

Tips:
- **Arabic text:** retype it in AE as live text layers (Paragraph panel → Middle Eastern composer, RTL). Animate with an Animator *by Words*, never by characters. The text in the SVG is the layout reference and source copy.
- **Glows** are radial gradients (they import cleanly). Add bloom or Glow in AE on light-blue elements only.
- **Device screens** (F10, F14, F16) are placeholders. Replace them with real screen recordings or renders using a Corner Pin or a 3D layer.
- **Logos** are embedded PNGs from `.claude/skills/voom-brand/assets/logo/`. Swap them for the vector logo when the brand owner provides AI/SVG.

## Fonts

Install the fonts in `.claude/skills/voom-brand/assets/fonts/` (Gabarito, IBM Plex Sans Arabic, Poppins: open-source, from Google Fonts) before opening the SVGs, otherwise Illustrator substitutes them.
