# Lessons log (newest first)

Add one entry per feedback round: what was wrong, then the rule. Fold any lasting rule into `../SKILL.md`.

## 2026-10-17: pacing
- **User:** don't leave a scene until all its text has appeared, and make the transitions relaxed.
  **Rule:** every shot has a deadline (next cut minus the transition's OUT time minus 0.35s hold). Text is fitted before the deadline by typing faster, counting faster or compressing the headline words. `TEXT_REPORT` checks it.
- **Change:** transitions were lengthened and given softer eases. F02/F03 cuts moved +0.15s.
- **User:** don't render anything without asking first (saves time and tokens).

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
