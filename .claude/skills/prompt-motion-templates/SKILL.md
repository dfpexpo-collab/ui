---
name: prompt-motion-templates
description: Fill-in motion-video brief templates (fields + defaults) for code-rendered videos - showreel, product launch film, one-shape UI morph, app walkthrough, beat-synced launch, slow polished teaser, logo reveal, kinetic type / quote, data story, 9:16 social ad - in the style of prompt-motion.com's customizable templates. Use when the user wants a launch/promo/UI/logo/kinetic-type video, wants to "customize a prompt", turn a script into a motion brief, or asks which prompt/structure to use. Collect the fields, write the filled brief, show it, then build with hyperframes / gsap and verify per motion-prompt-playbook.
---

# Prompt Motion templates

Inspired by [prompt-motion.com](https://prompt-motion.com/templates) (every part you'd change is a field) and the community prompts collected in [eastling/awesome-opus-5.5-video-prompts](https://github.com/eastling/awesome-opus-5.5-video-prompts) (CC0 notes/templates; quoted prompts belong to their authors). Templates here are written for this repo; they are not copies of prompt-motion.com's text.

## How to use

1. **Pick a template** from the table (or combine: e.g. launch film + UI morph scene + logo reveal end card).
2. **Collect the fields.** Ask only for fields you can't fill from the repo, the brand skill or the user's message. Fill the rest with the listed defaults and say which defaults you used.
3. **Write the filled brief** (the template with every `{field}` replaced) and show it to the user before building anything longer than ~10 s.
4. **Build and verify** with `hyperframes` / `gsap-timeline` and the render + frame-check loop in `motion-prompt-playbook`.
5. For Voom, `voom-brand` fills the look fields (palette, fonts, logo, banned list) and overrides any default here.

| Template | Format default | Use for |
|---|---|---|
| `showreel` | 16:9 · 15 s | Show range: 4–6 techniques, ends on a title card |
| `launch-film` | 16:9 · 20–30 s | Product launch in one continuous take |
| `ui-morph` | 1:1 · 14 s loop | One shape becomes 8–12 UI states, cursor-driven |
| `walkthrough` | 16:9 · 30 s | Cursor performs 3–4 real actions in the product UI |
| `beat-launch` | 16:9 · 24 s | Social-energy launch, every hit on a beat |
| `slow-teaser` | 16:9 · 27 s | Slow, polished single-desktop teaser, no cuts |
| `logo-reveal` | 16:9 · 6–10 s | Abstract build → wordmark → tagline |
| `kinetic-type` | 1:1 or 9:16 · 15–20 s | Quote, manifesto or script line, word by word |
| `data-story` | 16:9 · 15 s | Count-ups and self-drawing charts |
| `social-ad` | 9:16 · 15 s | Hook in first second, 3–4 beats, CTA card |

Full templates: `references/templates.md`. Shared rules every template inherits are below.

## Shared rules (inherited by every template)

- **Numbers, not adjectives:** hex colors, px, seconds, BPM, spring damping.
- **Timing skeleton:** hook in the first 1 s / first 10 %; one idea per shot (~1 s each, or 1.5–3 s camera moves for slow pieces); end card held for the last 15 % (logo-only pieces: last 25 %).
- **Continuity:** every shot grows out of the previous one (shape changes, masks, floods, match cuts); no full-frame crossfades.
- **Type & color constrained:** one display face + one UI face max, one accent color, accent on one word per line.
- **Banned by default:** corner labels/frames/watermarks ("AI giveaways"), fake placeholder UI, particle bursts, shockwave rings, lens flares, RGB split, camera shake, neon, bouncy/elastic easing, spinning logos, tiny unreadable text, full stops in short on-screen lines.
- **Real material:** real UI, real data, real logo; never invented stats. Royalty-free music (license checked) or synthesized in code.
- **Deterministic build:** one HTML file, `seek(t)`/`draw(t)` pure function of time, no timers/CSS transitions/carried state, seeded randomness; render frame by frame; verify frames around every beat before delivering MP4 + source.
- **Effort:** these are long, multi-step builds; plan the storyboard first, then build scene by scene.
