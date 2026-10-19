# Voom

Every design, motion or video task in this repo is Voom brand work: follow the `voom-brand` skill (colors, logo, type, motion language).

## Fonts
- Brand fonts live in `.claude/skills/voom-brand/assets/fonts/` (`<Family>-<weight>.ttf`): `Gabarito` (Latin), `IBM Plex Sans Arabic` (Arabic UI/body), `Poppins` (display).
- Before rendering anything (Playwright, HyperFrames, Remotion, Pillow), run `bash tools/fonts/install_voom_fonts.sh` once per session so the fonts resolve by family name. Code that needs a file path (Pillow, OpenCV, ffmpeg drawtext) uses the folder above directly.
- thmanyah (Arabic display/editorial) is licensed and not in the repo: install with `bash tools/fonts/install_thmanyah.sh <zip>` when the user provides the zip; outline it in deliverables. Rules in `voom-brand/references/visual-system.md` §3.
