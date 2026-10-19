# Voom

Every design, motion or video task in this repo is Voom brand work: follow the `voom-brand` skill (colors, logo, type, motion language).

## Skills and agents reach the default branch
Each session works on its own branch, and new sessions start from the default branch only. So when a session adds or changes anything under `.claude/` (skills, agents), `CLAUDE.md` or `tools/`, open a PR to the default branch and merge it before the session ends, then tell the user it is merged. Don't leave skill work sitting on a session branch, and don't ship skill copies as `.zip` files: the repo is the only copy.

## Mado (the user's skill catalog)
`Mado.md` lists every motion, design and content skill and agent in this repo (brand skills like voom-brand excluded). Whenever a skill or agent is added, removed or renamed, run `python3 tools/mado/build_mado.py` (add new skills to `CATEGORIES` in that script) and commit `Mado.md` with the change. When the user asks for Mado on another account or repo, copy the listed skill and agent folders from `dfpexpo-collab/ui`.

## Fonts
- Brand fonts live in `.claude/skills/voom-brand/assets/fonts/` (`<Family>-<weight>.ttf`): `Gabarito` (Latin), `IBM Plex Sans Arabic` (Arabic UI/body), `Poppins` (display).
- Before rendering anything (Playwright, HyperFrames, Remotion, Pillow), run `bash tools/fonts/install_voom_fonts.sh` once per session so the fonts resolve by family name. Code that needs a file path (Pillow, OpenCV, ffmpeg drawtext) uses the folder above directly.
- thmanyah (Arabic display/editorial) is licensed and not in the repo: install with `bash tools/fonts/install_thmanyah.sh <zip>` when the user provides the zip; outline it in deliverables. Rules in `voom-brand/references/visual-system.md` §3.
