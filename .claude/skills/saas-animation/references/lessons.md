# Lessons log (newest first)

Add one entry per feedback round: what was wrong, then the rule. Fold any lasting rule into `../SKILL.md`.

## 2026-10-21: new logo invisible in the preview
- **Wrong:** the swapped-in vector logo showed in local checks but not in the published preview. The artifact viewer loads the page hidden, so `getBBox()` at build time returned 0 and the logo's reveal clip stayed at width 0.
  **Rule:** never size a build-time mask or clip from `getBBox()`. Write the box into the SVG (`data-bbox`) from the generator. Test the preview loaded inside a hidden iframe that is shown later.

## 2026-10-20: action safe
- **User:** no animation or element may leave the action-safe area. Transitions and the background are exempt.
  **Tool:** `tools/motion-qa/safe_area.js` (every frame, no render).
  **Fixes:** softer cameras (F02–F06 and F10–F12; F06 at 0.95–0.97 because the CRM sheet is tall), entrance slides 80 → 40 px, and F14's push-through moved onto the scene wrapper so it counts as a transition.

## 2026-10-20: render speed and determinism
- **User:** 25 min per render is too long.
  **Fix:** the background shader now renders at 640×360 (it was ~75% of frame time), so a full render takes about 6 min. Added `SCENES=` partial re-render.
- **Wrong:** found by `fresh_compare`: the square glow flash differed between a full render and fresh pages (a GSAP filter tween plus a set on the same element made it history-dependent).
  **Fix:** the glow is computed from `t` in `seek`. `fresh_compare` now pulls exact frames by index (`select=eq(n,…)`); seeking with `-ss` was off by one frame.

## 2026-10-20: render-only ghosts
- **Wrong:** in the encoded film (not the preview), F09's chip and sparkle icon showed stacked ghost copies with hard edges.
  **Cause:** the render browser's GPU compositing kept trails of earlier frames in some regions during long back-to-back captures.
  **Fix:** `--disable-gpu-compositing`, plus two rAFs after each seek.
  **Tool:** `tools/motion-qa/fresh_compare.py` compares the video against fresh-page frames block by block.
- **Change:** F09 lost its glow-pixel click FX, which read as a grey square right before the pixel reveal.

## 2026-10-20: final review
- **User:** F10's tablet must not move before the transition, so F10→F11 is now a fade. The F07 status bar shows early. The F13 badge sits above the chart line, which was flattened so it never crosses the badge.
- **Art-director gate:** the VO peaked at −0.6 dB.
  **Rule:** the mux runs a limiter (true peak ≤ −1 dBTP), built into `build_film.js`.
- **Gate method:** when comparing tiles in a contact sheet, compare in-tile coordinates. A "jump" seen across tiles was a misread.

## 2026-10-17: preview review 3
- **Wrong:** the morph target lost its inner build (the unit squares).
  **Rule:** a morphed layer skips only its own entrance. Its inner animations still run, starting as the shape lands.
- **Wrong:** F05 held still for too long before the transition (an inserted pause sat at the end of the shot).
  **Rule:** a shot leaves soon after its last beat (text done or click), within about 0.3–0.5s. Put the breathing room where the motion happens, not as dead air at the end.

## 2026-10-17: preview review 2
- **Wrong:** the morph stretched the content and duplicated the card in the middle.
  **Rule:** a morph is a shape morph. The card's outline rect (position, size, corner radius) is keyed from A's on-screen rect to B's, read live every frame so camera moves are respected. The shape is empty while it travels: the old content leaves first, and the new content fills in after the shape lands.
- **Wrong:** I reused the morph on other cuts.
  **Rule:** use a transition the user requested only where they asked for it. Don't spread it to other cuts.
- **Wrong:** numbers shimmered after counting (live `<text>` under camera scale).
  **Rule:** when the count lands, swap back to the outlined glyphs.
- **Wrong:** the glass sheen corners poked out past the pill and circle shapes (short rect with full radius).
  **Rule:** the sheen uses the same rounded rect as the card, and the gradient fades out by 40%.
- **User:** scenes need room to breathe; adding pauses to the VO is fine.
  **Tool:** `retime.py` inserts silent gaps at points where the VO is already silent (find them with `silencedetect`). It shifts all scene times and splits the audio segments. Click times live in `cues.json`, so they shift too.

## 2026-10-17: preview review
- **Wrong:** the morph looked broken (a blank glass card flew over the scene).
  **Rule:** a morph moves the real element. The old layer flies and reshapes (scaleX/scaleY + x/y from bbox A to bbox B, power3.inOut, about 0.85s) while the rest of the old scene fades. The new layer starts from A's box and settles into its own, and the two cross-fade around the middle. The target skips its normal entrance.
- **Wrong:** a faint box showed behind elements after they entered (behind the sync icon and the toggle edge).
  **Rule:** a CSS `blur(0px)` left on an SVG group still rasterises it. Always set `filter: 'none'` when a blur entrance or a transition ends.
- **Wrong:** the F16 scrim ellipse had a hard edge and weak contrast.
  **Rule:** scrims use a radial gradient with a long falloff (opaque centre → 0 at the edge), never a flat shape.

## 2026-10-17: pacing
- **User:** don't leave a scene until all its text has appeared, and make the transitions relaxed.
  **Rule:** every shot has a deadline (next cut minus the transition's OUT time minus 0.35s hold). Text is fitted before the deadline by typing faster, counting faster or compressing the headline words. `TEXT_REPORT` checks it.
- **Change:** transitions were lengthened and given softer eases. F02/F03 cuts moved +0.15s.
- **User:** don't render anything without asking first (saves time and tokens).
- **Tool:** added the live preview (`build_preview.js`, published as an artifact) so the motion is reviewed in the browser before rendering.

## 2026-10-17: v03 review
- **Wrong:** old-scene frames flashed after the pixel and dissolve transitions (the mask came off while the old scene was still visible).
  **Rule:** hide the previous scene the moment a reveal mask is removed.
- **Wrong:** the screen went empty for about 0.5s at almost every cut, because elements started entering only after the cut.
  **Rule:** start entrances `LEAD` seconds before the cut.
- **Wrong:** the dissolve target shared a z-index with the old scene and covered it.
  **Rule:** put the incoming scene below the outgoing one.
- **Tool:** added `tools/motion-qa/check_video.py`, which runs after every render.

## 2026-10-17: v02 → v03 (reference: click-effect SaaS video)
- **Wrong:** the transitions felt generic, and the circle "ball" grid looked wrong.
  **Rule:** the user wants pixel squares (a glass-square disc), particle dissolve from the click, halftone and glow-pixel click FX, plus zoom-through, push + blur and element morph, varied across the film.
- **Wrong:** the background needed to feel premium.
  **Rule:** use a live gradient with blur plus turbulent displace and keyed evolution (WebGL shader). The frame stays still and the inside moves.
- **Wrong:** the unit squares built in random steps.
  **Rule:** build them in a wave from a corner with a glow flash.

## 2026-10-17: v01 → v02
- **Rule:** the camera always moves; backgrounds move inside only; numbers count from 0; pixel squares; entrances vary by role; proximity to the cursor; the click lands on the spoken word.
- **Rule:** for Arabic, animate per word (not per letter). The echo leads the word and has its own blur. Field text types letter by letter with no cursor bar.
- **Rule:** remove the corner logo and the footer lines from frames and animation.
- **Rule:** F07 starts Online and the cursor clicks Offline when the word is spoken. Layouts must pass design-qa (pill rows from measured widths, centred numbers).
- **Rule:** GSAP has trouble at negative times, so use PAD. Compute per-frame effects from `t`.
