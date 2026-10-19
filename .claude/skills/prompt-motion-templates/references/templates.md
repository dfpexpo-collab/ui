# Templates

`{field}` = fill in. `[default]` = used when the user doesn't say. Every template inherits the shared rules in `SKILL.md`; repeat only what changes.

---

## showreel

```text
A {duration:[15 s]} motion design showreel at {size:[1920x1080]}, {fps:[60]} fps, that proves world-class motion design skill, built around {concept: one idea/product/theme}.
Every shot grows out of the previous one. Type: {display_font} + {ui_font}; palette {bg}, {fg}, one accent {accent}.
Show these techniques, one per shot, each visually distinct: {techniques:[kinetic typography, masked reveals, shape morph, 2.5D camera move, self-drawing line/chart, logo lockup]}.
Music {bpm:[120]} BPM; something happens on every beat; the biggest change lands on the drop.
End on a title card: "{title}" held for the last 15 %.
Banned: {banned:[shared list]}.
```
Structure that works: 4–6 distinct ideas → title card. Don't make it a random effects pile: one art direction across all shots.

---

## launch-film

```text
Ask me for (defaults if skipped): product name, one-line promise, 3–5 features or UI moments, logo (vector), real screens/recordings, music ~{bpm:[120]} BPM with a drop.
A {duration:[25 s]} launch film for {product}, {size}, {fps}. 2D, one continuous take: nothing fades or cuts; objects change shape. Text rises from a mask line, icons pop from zero on a spring, bars draw across, pages push, a shape floods the frame and shrinks into the next object.
Look: {bg}, {fg}, accent {accent}; {fonts}. One eased camera move per scene; never zoom in then out; camera settles slower than the subject.
Structure:
- 0–10 %: hook "{hook_line}"
- reveal: "{product}" wordmark
- one beat per feature: {feature_1}, {feature_2}, {feature_3} – each transition demonstrates the feature
- last 15 %: CTA "{cta}" + {url}, held
Claims allowed: {facts}. Do not claim: {non_claims}.
```

---

## ui-morph

```text
Ask me for: 8–12 UI states the shape becomes (e.g. button, loader, player, slider, toggle, tabs, chart, command palette, toast), palette (black/white or one accent), music ~120 BPM.
{duration:[14 s]} seamless loop, {size:[1440x1440]}, 60 fps. One shape, never cut: every state is the same element morphing size, radius and color while its content swaps with a short blur ({blur:[12 px]}, {swap:[0.15 s]}).
A cursor drives every change with real clicks, typing and one drag; the cursor tip stays locked to what it drags; aim where the target will land; ≤ 65 px/frame.
Springs: shape ζ {[0.72]} settle {[0.35 s]}; camera ζ {[1.0]} settle {[0.6 s]}; camera zooms so each state fills ~50 % of the frame.
Beat grid {[0.5 s]}: {state timeline: t → state}.
Last frame = first frame (wrap time with t - D*floor(t/D)).
Banned: bouncy easing, particles, glows, gradients on UI chrome, mismatched radii.
```

---

## walkthrough

```text
A {duration:[30 s]} walkthrough of {product}, {what it is}. Recreate a clean, believable UI from its real screens (sidebar, header, cards, lists, charts) – real data, no placeholders.
The cursor performs: {action_1: e.g. open dashboard}, {action_2: click an item}, {action_3: drag X to Y}, {action_4: watch a value update}. Each click = small ripple; state changes animate in place.
Zoom in on the key moment ({key_moment}). End with "{product} — {tagline}".
```

---

## beat-launch

```text
You're a world-class motion designer building a {product} launch video. Land the core value: {value}. Hook in the first second, then distinct beats for {proof_points}.
Brand-accurate UI, type, color and motion. Score the music ({bpm:[125]} BPM) so every cut, animation hit and scene change lands on a beat or the drop; retime until synced (check with beat markers).
Social energy, quick cuts ({shot_len:[0.5–1 beat]}), but every shot readable for ≥ {min_read:[0.6 s]}.
```

---

## slow-teaser

```text
A {duration:[27 s]} teaser for {product}, landscape. One continuous camera over one {stage: desktop / device / board}, no hard cuts.
Camera pushes, pulls and pans take 1.5–3 s on gentle ease-in-out – half the speed you'd default to. Motion blur on fast moves, light film grain finish. Oversized cursor. {audio:[no audio]}.
Copy style: {case:[as the brand writes it]}. Shots: {numbered list of beats with exact lines}.
```

---

## logo-reveal

```text
A premium {duration:[8 s]} logo reveal for {brand} with the tagline "{tagline}".
Abstract shapes and light build tension → converge into the mark → the wordmark wipes out from behind it → tagline rises. Hold the final lockup for the last 25 %.
Option ({style:[light streak]}): wireframe draw-on then shards assemble | light streak mask reveal | shape morph from a UI element.
Mark and wordmark never overlap; logo never distorted, recolored or effected (brand rules win).
Sound: soft riser → clean low hit + shimmer on the lockup.
```

---

## kinetic-type

```text
A {duration:[20 s]} kinetic typography piece, {size:[1080x1080]}, 60 fps, from this text: "{text}".
Every line changes the architecture of the frame; emphasis words get bigger type and a distinct motion; the final line stands on what earlier words built.
Palette {bg}, {paper/fg}, accent {accent}; {display_font} for statements, {secondary_font} for small lines.
Reveal by word (Arabic: whole words, right to left, never letters); outgoing words leave before incoming words take their place. Attribution / logo last.
{loop:[no]} – if yes: frame 0 == last frame.
```

---

## data-story

```text
Animate {topic} in numbers: {metric_1}, {metric_2}, {metric_3}. Tone: {tone:[celebratory but credible]}.
One metric per beat: count-up (0.8 s, ease-out, tabular numerals) + a self-drawing chart or bar; units and labels set in the UI font; source line small at the end.
Close with one takeaway line: "{takeaway}".
Numbers must be real and approved.
```

---

## social-ad

```text
A punchy {duration:[15 s]} vertical ad (1080x1920) for {product}. Hook in the first second: "{hook}".
Then 3–4 quick beats with big centered type: {beats}. End card: "{cta}" + {url}.
Keep text inside the safe zone (top 250 px and bottom 340 px free). Burned-in captions if there's VO.
```

---

## Voom presets

When the brand is Voom, fill these fields from `voom-brand` and the current storyboard:

| Field | Value |
|---|---|
| bg / fg / accent | `#000024` (or signature gradient) / `#f1f1f1` / `#00b3ff`; light scenes `#f1f1f1` / `#000024` / `#0012d6` |
| fonts | IBM Plex Sans Arabic (Arabic), Gabarito (Latin), Poppins Bold for big display |
| eases | launch `cubic-bezier(.16,1,.3,1)`, settle `(.22,1,.36,1)`, glide `(.45,0,.15,1)` |
| logo-reveal style | light streak mask reveal + swoosh trim-path draw (brand motion spec) |
| banned (extra) | off-palette color, rainbow, logo effects/distortion, letter-by-letter Arabic |
| claims | per script; "10x" and "200+ projects" need sign-off |
| url / handle | `www.voomproptech.com` / `@voomproptech` |
