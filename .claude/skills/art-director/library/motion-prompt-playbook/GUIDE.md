---
name: motion-prompt-playbook
description: Proven briefs and production rules for code-rendered motion graphics (SaaS / product launch films, UI motion loops, kinetic type, logo reveals), distilled from the most-shared Opus 5.5 motion videos. Use when planning or writing a launch/promo video, turning a script or storyboard into a timed motion brief, choosing transitions, cursor/UI choreography, springs and camera moves, or when a render looks like a "template" / "PowerPoint" and needs to feel like a premium product film. Pairs with hyperframes, gsap-*, kinetic-typography and voom-brand.
---

# Motion prompt playbook

Distilled from ~64 public prompts behind viral Opus 5.5 motion videos ([awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos), MIT; gallery: skillry.dev/ai-videos/opus-5-5). Most of those prompts are one line ("go all out"). The ones that produced premium results share one method, captured here. Verbatim exemplars with credits: `references/prompt-library.md`.

## The method in one line

**Numbers, not adjectives. One continuous film, not slides. A pure `seek(t)` renderer. Render, look at frames, fix, re-render.**

## 1. Write the brief as a spec (use this skeleton)

Every strong prompt uses the same blocks. Fill them before writing code; show the user the storyboard first when the piece is longer than ~10 s.

```
<inputs>      what the user must supply (product facts, logo, copy, music); defaults if skipped
<direction>   size, fps, duration, look (hex colors, fonts), camera rules, BANNED list
<structure>   beat-by-beat timeline: time range → what moves → exact on-screen text
<build>       renderer contract (see §4)
<gotchas>     known failure points and their fixes
<start>       "Show storyboard → write code → render → check frames around every beat → fix → final"
```

Rules for filling it:
- **Use hex codes, seconds, pixel sizes and damping ratios instead of adjectives** ("shape damping 0.72, settle 0.35 s", not "snappy").
- **Exact copy in quotes** for every line of on-screen text. Mark which word is the accent color.
- **Accuracy guardrails:** list the facts the film may claim, and what it must not claim (e.g. don't call a beta "v1").
- **The story must work muted.** Sound is support, not the message.

## 2. Direction: what premium looks like

- **One continuous take where possible.** Each scene grows from the last: buttons expand into pages, a color floods from one object and shrinks into another, the chosen card flies into its slot. Prefer this over cuts.
- **Shared-element handoffs:** the element that ends a scene starts the next (same position/scale relationship). Keep the hero object's identity through search → detail → tile → zoom.
- **Every transition demonstrates a feature** instead of replacing one title card with another.
- **One idea per shot, ~1 s per idea**, holds ≤ 1 s except the final lockup; never > 3 s without a new visual event.
- **Camera:** one eased move per scene; never zoom in then immediately out; never reverse direction; camera settles slower than the subject (camera damping 1.0 / 0.6 s vs subject 0.72 / 0.35 s). Interpolate zoom in log space.
- **Text:** rises from a mask line; word swaps roll vertically; outgoing title leaves before the incoming one takes its place (no overlapping text). Reveal Arabic by whole words, never letters.
- **Cursor & UI:** aim the cursor where the target *will be* when it lands; cap speed (~65 px/frame at 60 fps); the cursor tip stays locked to whatever it drags; click = ripple from the click point; typing has a natural keystroke rhythm over fixed line breaks.
- **Cards / widgets:** scale 30 %→100 % + fade in, then details slide in one after another *after* the card settles; graph line draws as a path; the back glow rises as details arrive; two light bars cross at slightly different timing for a sheen.
- **Logo reveals:** wireframe/draw-on first → pieces fly in and assemble → light sweep → name types or wipes out from behind the mark. Mark and wordmark never collide.
- **Composition:** compact and centered, generous negative space; keep key content inside a 9:16-safe center if the film will be re-cut vertically.

**Banned (unless the brief asks):** full-frame crossfades, blur-ins as the default entrance, particles, lens flares, shockwave rings, camera shake, glitch, spinning logos, fake dashboards, tiny unreadable code, stock footage, repeated bouncing / big elastic overshoot, corner captions/watermarks/progress counters ("AI giveaway frames"), anything that feels like a template.

## 3. Motion physics

- **Closed-form step-response springs** for every pop and settle (critically damped or ζ≈0.7–1.0). No accumulated physics state.
- Overshoot ≤ 2–3 %, at most once. Exits faster than entrances (~½ duration).
- Blur only on content swaps (e.g. 12 px blur + fade over 0.15 s), and start any draw-on *after* the blur-in finishes.
- Never cross-fade two saturated colors through gray; flood/wipe instead.
- **Beat grid:** pick BPM first (120–130 for launches), put a 0.5 s (or 1-beat) grid on the timeline, land entrances, selections, zooms and the logo on beats; start the track N beats before its drop so the drop hits the reveal.

## 4. Build contract (deterministic rendering)

1. One HTML file (Canvas 2D, SVG or DOM) at the final size. `window.renderAt(t)` / `seek(t)` is a **pure function of time**: no `Math.random` (use a seeded PRNG), no clocks, no CSS transitions, no state carried between frames. `?t=` in the URL freezes that exact moment for debugging.
2. One camera transform on a container, keyed by `[time, zoom, x, y]` with eased segments.
3. Render every frame with Playwright from `seek(frame / fps)`; motion blur = 3–8 subframes per frame blended (`ffmpeg tmix`), keeping static text sharp.
4. Encode H.264 (`-pix_fmt yuv420p -crf 17-18`), verify duration and evenly spaced timestamps (`ffprobe`).
5. Sound: one SFX per event (type, send/pop, whoosh, click, success, logo sparkle) placed on its measured peak; music bed; loudnorm to −14 LUFS for social. Royalty-free sources only (e.g. Mixkit), or synthesize in code.
6. For loops: last frame = first frame; wrap time with `t - D*floor(t/D)` to avoid a cursor jump at the seam.

## 5. Verify loop (mandatory)

After the first render: contact sheet of the whole film + 5 frames around every beat and every fast moment. Check, in this order: clipped/overlapping text, elements visible before their entrance or after their exit, cursor jumps, mistimed beats, unreadable frames, color handoffs going gray, logo spacing. Fix → re-render → re-check. Only then deliver the MP4 **and** the editable source.

## 6. Using it with the other skills here

- Framework: build with `hyperframes` / `hyperframes-core` (HTML + GSAP, seek-safe) or plain GSAP timeline (`gsap-timeline`, `gsap-core`).
- Text: `kinetic-typography`. Timing/easing judgement: `animation-principles`, `motion-art-direction`. Logo: `logo-animation`. Arc of a launch film: `launch-video`, `product-launch-video`.
- Brand: for Voom, `voom-brand` overrides colors, fonts, logo and the banned list (palette only, off-white text, light-blue accent, no rainbow).

## 7. Template: SaaS launch film brief

See `references/saas-launch-template.md` for a fill-in brief, plus a worked Voom example built from the current storyboard.
