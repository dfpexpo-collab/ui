# VOOM SaaS promo – frames for After Effects

| Path | What |
|---|---|
| `STORYBOARD.md` | Shot table: VO, timing, visuals, motion, SFX |
| `frames/F01.svg` … `F19.svg` | Editable 1920×1080 frames. Each top-level `<g id="L##_NAME">` is one AE layer |
| `previews/` | JPG renders + `_contact-sheet.jpg` |
| `build_frames.py` | Regenerates all SVGs (`python3 build_frames.py`, needs Pillow) |

## Layer naming

`L01_BG` background · `L02–L09` elements (cards, device, pills, cursor) · `L10+` headline/text · `L90_CHROME` small wordmark + footer · `L95_NOTE_DELETE` notes, delete before animating.

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
