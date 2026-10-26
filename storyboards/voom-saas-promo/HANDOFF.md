# VOOM SaaS promo: handoff

Read this first when picking the project up in a new session or account. It holds the state of the film and how we work on it.

## State (2026-10-26)
- The final film is `voom_saas-promo_film_16x9_ar_FINAL.mp4`: 1920×1080, 30fps, 50.0s, −13.7 LUFS, −1.1 dBTP. It was approved after these fixes:
  - the new vector logo with tagline in F08 and F19, entering with a blur-in and settle (no wipe, no light streak);
  - the F10 camera jump at 21.57s fixed.
- All checks pass: `safe_area.js` 0, `check_video.py` no FLASH/JUMP (14 EMPTY notes are intentional transition moments), `fresh_compare.py` 0 flagged.
- Media not in the repo (the repo is public). Keep your own copies:
  - the VO `Vo_Z1.mp3`, needed for every build;
  - the final MP4;
  - thmanyah fonts (licensed: never commit them).
- Live preview of the last session: https://claude.ai/artifact/VH7k3LFU2jYK2YqkV5c8Cu (owned by the old account; a new account publishes its own).

## Local machine setup (once)
- Install Git, Node 18+, Python 3.10+, ffmpeg, and Claude Code (`npm i -g @anthropic-ai/claude-code`).
- `git clone https://github.com/dfpexpo-collab/ui.git && cd ui`, then run `claude` in that folder. The skills in `.claude/` load automatically.
- `pip install pillow numpy fonttools uharfbuzz`
- `npm i --prefix ~/voom-node playwright gsap && npx --prefix ~/voom-node playwright install chromium`, then `export NODE_PATH=~/voom-node/node_modules`.
- Fonts: `bash tools/fonts/install_voom_fonts.sh` (Linux and macOS). On Windows, install the `.ttf` files in `.claude/skills/voom-brand/assets/fonts/` by hand.
- Put `Vo_Z1.mp3` somewhere outside the repo and pass its path to the build commands.
- Windows: use WSL or Git Bash for the shell commands.

## Rebuild from scratch
```bash
bash tools/fonts/install_voom_fonts.sh
npm i --prefix /tmp/node playwright gsap      # Chromium is pre-installed in cloud sessions
export NODE_PATH=/tmp/node/node_modules
cd storyboards/voom-saas-promo
python3 build_frames.py                        # SVG frames -> frames/, frames_outlined/
node ../../tools/design-qa/check_layout.js frames_outlined/*.svg
cd animatic
HTML_ONLY=1 node build_film.js <out> <Vo_Z1.mp3>           # page only, no render
node ../../../tools/motion-qa/safe_area.js <out>/film.html
node build_preview.js <out>/film.html <Vo_Z1.mp3> <preview.html> [render720.mp4]
node build_film.js <out> <Vo_Z1.mp3>                         # full render, about 6 min
SCENES=F08,F19 node build_film.js <out> <Vo_Z1.mp3>          # partial re-render (needs a full render's frames)
```

## Working rules from the client
- **Never render without asking first.** Review motion in the live preview.
- Change only what was asked; keep the rest of the film as it is.
- Keep token use low.
- Every content layer stays inside the 5% action-safe area. Transitions and the background are exempt.
- Text must be fully on screen and hold before each transition. Transitions are relaxed. No dead air.
- The morph happens only at F04→F05.
- Arabic text: IBM Plex Sans Arabic (400/500/600). Latin: Gabarito. thmanyah is available for display use but is not used in this film.
- Method, motion rules, engine gotchas and QA loop: `.claude/skills/saas-animation/` (SKILL.md and references/lessons.md).

## Key files
- `build_frames.py`: storyboard generator (layered SVG per shot).
- `animatic/cues.json`: scene times, VO windows, clicks, audio segments.
- `animatic/film_runtime.js`: GSAP timeline, camera (CAM), transitions (TRANS), click FX, background shader.
- `animatic/build_film.js`, `animatic/build_preview.js`, `animatic/retime.py`.
- `tools/motion-qa/`: check_video.py, fresh_compare.py, safe_area.js.

## Open / optional
- Brochure animation (artifact https://claude.ai/artifact/1D6a2ZWmMuhyDYv8JEc971): approach not decided. The recommendation was a 3D page flip plus element crops on 3–4 key pages, or the layered source file if the client has one.
- An After Effects `.jsx` export once motion is approved; SFX are added in Premiere by the client.
