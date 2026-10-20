---
name: saas-animation
description: House method for premium SaaS / product promo films rendered in code (GSAP + Playwright + ffmpeg) from layered SVG storyboards - camera, live gradient backgrounds, varied transitions (pixel reveal, particle dissolve, zoom-through, push + blur, element morph), click FX, Arabic/English kinetic text, counters, cursor choreography, VO sync and the QA loop that catches flashes and empty frames. Use for any SaaS animation, product promo, UI motion film or storyboard-to-video job, and update it after every round of user feedback.
---

# SaaS animation

The method we use to turn a storyboard into a SaaS promo film. It is built from real feedback on the VOOM promo. Every rule below exists because the user asked for it or because a render broke without it.

**Keep this skill current.** After every round of feedback, add the lesson to `references/lessons.md` (date, what was wrong, the rule). When a lesson changes how we work, fold it into the rules below in the same commit.

## Pipeline

1. **Storyboard frames:** layered SVG, one file per shot, generated in code. The VOOM generator is `storyboards/voom-saas-promo/build_frames.py`.
   - Top-level layers are named `L##_NAME`, with named sub-groups (`GLASS`, `PILL_`, `UNIT_GRID`, `TILE_`, `CURSOR`, `TAP_PING`, `ICON_TILE_` and so on).
   - Text is outlined with HarfBuzz, one group per word, and carries `data-text`, `data-font`, `data-size` and the rest.
   - Run `design-qa` (`tools/design-qa/check_layout.js`) until it exits 0.
2. **Text motion:** tune it in Text Motion Studio (`tools/text-motion-studio/`), save, and export the settings to `textfx_settings.json`. The shared engine is `textfx.js`.
3. **Timing:** `cues.json` holds the scenes (`start`, `end`, `vo` window, `words`, `big`) aligned to the VO, plus the audio segments.
4. **Film runtime:** `film_runtime.js` builds one paused GSAP timeline, and `window.seek(t)` is a pure function of time. `build_film.js` inlines the SVGs, renders 4 Playwright workers at 30fps and muxes the VO.
5. **Live preview before any render:** run `HTML_ONLY=1 node build_film.js <dir>`, then `node build_preview.js <dir>/film.html <vo.mp3> <out.html>`, and publish the result as an artifact. It plays the film in real time with the VO, a scrubber, scene jumps, frame steps, a scene loop and a copy-timecode button. The user reviews motion there, and we render the MP4 only once the motion is approved. After a render, pass a 720p copy as the 4th argument (`render.mp4`, published alongside the page). The player then gets a **Render** mode that plays the encoded film on the same scrubber, because some issues only show in the render.
6. **QA loop** (see below). Show the user the video only after QA passes.
7. **Optional AE hand-off:** write one `.jsx` at the end, after the motion is approved. Never iterate in AE, because it costs far more tokens.

## Motion rules

- **Action safe:** every content layer stays inside the 5% action-safe frame (96 px / 54 px at 1080p) on every frame, camera moves and entrances included.
  - Exempt by design: transitions (zoom-through, push, dissolve particles, pixel reveal, F14 push-through, all on the scene wrapper), the background, full-bleed decor (walls, orbits) and soft drop shadows.
  - `node tools/motion-qa/safe_area.js <film.html>` checks it in seconds without rendering, and must exit 0.
  - Typical fixes: keep camera scale ≤ 1.04 on wide layouts (or < 1 for very tall ones), and keep entrance slides ≤ 40 px near the edges.
- **The camera never stops.** Every shot gets a push, pan, pull or 3D tilt with `sine.inOut` across the whole shot.
  - Choose the transform origin per shot so the focal element stays in frame.
  - Keep pans small (scale ≤1.06, x ≤60 on dense UI) and check the edges.
- **Background:** a full-screen WebGL gradient behind every scene, with a static frame and a live inside. It should read like AE Gaussian Blur + Turbulent Displace with the evolution keyed.
  - Use domain-warped fbm, 3 octaves, low frequency (about 0.5) and slow time (×0.11).
  - Three palettes: `dark`, `light` and `brand`. Cross-fade them over ±0.4s around each cut. That cross-fade is the dark↔light transition.
  - Hide the SVG `BG_*`, `GLOW*` and `VIGNETTE` layers. Keep the line work.
- **Entrances vary by role:**
  - chips and pills pop (`back.out`);
  - devices rise with blur;
  - sheets come from the left and dashboards from the right;
  - links draw;
  - everything else cycles rise, scale and drop, always with blur.
  - Inner parts follow: icon tiles, small dots and chart lines draw.
- **A shot leaves only after all its text is on screen**, and the text holds for at least 0.35s before the outgoing transition starts.
  - When a shot is short, type faster, count faster or pull the headline words earlier. Never cut text off.
  - `TEXT_REPORT` in the page lists every shot's text-done time against its leave time, so check it without rendering.
  - If a shot still can't fit, give it room: run `retime.py cues.json <t>:<gap>` at a VO silence (`ffmpeg -af silencedetect=n=-38dB:d=0.06`). It shifts every later time and splits the audio there. The user allows extra pauses so the motion can breathe.
- **No dead air.** Once the last beat of a shot lands (text done or click), the transition starts within about 0.3–0.5s.
- **Transitions are relaxed, not snappy.** The old scene leaves over about 0.6s (`power2.inOut` / `power2.in`) and the new one settles over about 0.95s (`power3.out`). Pixel and dissolve run about 1.05–1.1s, and the morph about 0.85s.
- **Elements start entering before the cut.** Use `LEAD` per transition (pixel 0.4, dissolve 0.45, zoom/push 0.3, morph 0.12) so the incoming scene is never empty.
- **Small squares (unit grids):** build in a wave from one corner. Each square goes from scale 0.3 to 1 with `back.out`, plus a brightness and glow flash that settles. Never use random steps.
- **Cursor:**
  - It arcs in, settles, and press-scales on the click. The click lands on the spoken word.
  - Cells near the cursor grow toward it (proximity is computed after each seek from screen positions).
  - On the click, fire a click FX: a **halftone ripple** (dots in a ring from the cursor) or **glowing pixels** (a cluster of squares near the cursor that flicker on and off).
- **Text:**
  - Arabic headlines animate per word. Echo copies lead the word, then the word lands with blur.
  - Text inside bars, sheets and fields types letter by letter, with no `|` cursor.
  - Numbers and prices count from 0 with motion blur and land on the exact value. When the count lands, swap back to the outlined glyphs, because live text shimmers under the camera.
  - Words enter on their VO time.
- **Numbers sit centred in their cards.** Small status dots pop in after the card.

## Transitions: vary them, and never repeat one back to back

| Name | Use for | Notes |
|---|---|---|
| `pixel` | big reveals, at most twice per film (e.g. after an AI click) | glass-square disc grows from the click. Mask the new scene in and the old one out with the inverse cells. Hide the old scene when the mask comes off |
| `dissolve` | after a click that "sends" something | old scene breaks into particles that blow away from the click; new scene sits underneath (lower z) |
| `zoom` | into a device, logo or tile | old scene scales ×2.6 with blur toward its focal point; new scene settles from 0.78 |
| `push` | dark→dark story beats | old scene leaves with blur, new one enters from the opposite side. Vary the direction |
| `morph` | only where the user asks (same object, new context) | an empty shape keyed from A's outline rect to B's (x, y, w, h, rx; about 0.9s, power3.inOut), read live from the screen. Old content leaves first, new content fills after it lands. No stretch, no duplicate |
| `fade` / `cut` | same set (wall → wall) / the footage slate | on a cut, hide the previous scene in the same frame |

Scenes have a transparent background (the shader sits behind everything). So any transition that reveals must also remove the old scene in the same area.

## Engine gotchas (each one broke a render)

- GSAP children at negative positions misplay. Shift every position by `PAD` and seek `t + PAD`.
- Per-frame effects (balls, masks, particles) must be computed from `t` inside `seek`. Tween `onUpdate` with `immediateRender` leaves stale state, which once covered the whole intro.
- `window.seek` must return `undefined`. Returning the timeline hangs Playwright.
- Don't name a global `top`.
- Use `let`/`const` effect factories carefully. Anything called during the scene build must not touch a later-declared `const` (TDZ).
- WebGL in headless Chromium needs `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, plus `preserveDrawingBuffer: true`.
- Set `filter: 'none'` after every blur entrance or transition. A leftover `blur(0px)` paints a faint box around the group.
- **Render-only ghosts:** a long render page with GPU compositing (SwiftShader) left trails of earlier frames in some regions: stacked copies of a chip or icon with hard edges, never in the live preview. Launch the render browser with `--disable-gpu-compositing` and wait two `requestAnimationFrame`s after each seek before the screenshot.
- **Render must not depend on seek history.** Never put two GSAP tweens or sets on the same property of one element (e.g. a filter `fromTo` plus a later `set: none`). The result changes with the order frames are seeked: full render, fresh page and preview disagree. Compute such effects from `t` in `seek` instead (like `glowAt` for the square glow).
- **Speed:** draw the background shader at 640×360, CSS-scaled to full frame. It is a soft gradient, so the result is visually identical (max block difference 0.6) and about 3× faster per frame. A full 50s render takes about 6 min on 4 cores.
  - `SCENES=F09,F10 node build_film.js …` re-renders only those scenes (±0.7s) into the last full render's frames, then re-encodes. Use it for small fixes.
- Wrap each scene's content in a group so masks can apply. Keep an unmasked fx group on top.

## QA loop (mandatory, every render)

**Never start a render, spot or full, without asking the user first.** Timing checks that only load the page, such as `TEXT_REPORT`, are fine without asking.

1. **Spot frames:** render with `ONLY=` at T±0.2s around every transition, at every click and at every count end. Make a contact sheet and look at it as an art director.
2. **Full render:** `python3 tools/motion-qa/check_video.py <mp4> --cues cues.json` must exit 0. It flags FLASH (an old scene popping back), EMPTY (the picture going blank for more than 0.2s) and JUMP (a hard change away from a cut). An EMPTY you keep on purpose (a beat that waits for the VO) needs a one-line reason.
2b. **Action-safe check** (`safe_area.js`, before rendering).
3. **Fresh-page check:** re-render about 40 spread-out frames with `ONLY=` (fresh pages), then run `python3 tools/motion-qa/fresh_compare.py <mp4> <dir>/frames`. It must exit 0. It catches ghosts that only exist in the long render.
4. Make a 1fps contact sheet of the final MP4 and check it before sending.

## Fonts

- VOOM brand: Gabarito, IBM Plex Sans Arabic and Poppins (in `voom-brand`).
- **thmanyah** (Sans, Serif Text, Serif Display; Light–Black) is installed locally with `tools/fonts/install_thmanyah.sh <zip>`. The licence forbids uploading or redistributing the font files.
  - Never commit them, and never embed them as `@font-face` in a published page.
  - Outline the text to SVG paths, which is allowed for design work.
  - **Kashida:** type tatweel `ـ` (U+0640) after a letter, 1 to 5 of them. The font swaps in that letter's own stretched form (`yehAr.medi_kashida…`, up to 5 levels). The result is a real curved extension, not a flat line, and HarfBuzz and Chrome shape it automatically.
  - Animating a kashida means stepping through the levels 0→5, each step re-shaped and outlined. Use it on one word for emphasis, not across a whole line.

## Working with this user

- Ask before the final render when anything is open. Keep token use low: no re-analysing references already analysed, small edits, spot renders before full renders.
- No corner logo and no fixed footer lines.
- SFX are added later in Premiere from the user's library.
- Brand rules come from `voom-brand` (or the client's brand skill).

Related: `motion-prompt-playbook`, `motion-art-direction`, `design-qa`, `gsap-timeline`, `kinetic-typography`.
