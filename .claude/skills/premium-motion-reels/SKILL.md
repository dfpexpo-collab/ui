---
name: premium-motion-reels
description: High-end motion rules for promo Reels and product films (9:16 or 16:9), learned from premium reference films and from a self-review of a first cut that was not good enough. Use when planning, building or reviewing any animated promo, Reel, launch film or kinetic-type video, and always run the self-review checklist before delivering a render. Covers the guide object, transitions by type, text choreography, depth, holds, beat grid, music and SFX design, and the review method.
---

# Premium motion Reels

Read this before building any promo film, and run **§9 Self-review** before showing a render to anyone.
Pairs with `motion-prompt-playbook` (build contract), `voom-brand` (colours, type, logo), `kinetic-typography`.

## 1. What separates premium from "animated brochure"

A first cut usually fails the same way: every scene is a page whose pieces fade/slide in, then the page sits still, then a soft dissolve. The fixes below come from studying two premium references (a green "Spark" brand film and a dark fintech launch film):

| Weak (what to avoid) | Premium (what to do) |
|---|---|
| Elements fade in, then the scene freezes for 1-2 s | Something new happens every **0.5-1 s** until the cut; holds only on the final lockup |
| Same dissolve between every scene, with empty frames | Transition chosen by meaning; **no frame without content** |
| Every block rises from below with blur | Entrances vary by role: pop, mask-rise, slide from its own side, draw-on, 3D unfold, assemble |
| All text gets the same effect | Hero word gets the big effect; supporting lines mask-rise quietly |
| Flat: plate and elements move together | Depth: plate, bokeh, content, foreground light at different speeds |
| Music bed + a few whooshes | A sound for every visual event, on the beat |

## 2. The guide object (the single biggest upgrade)

Both references use **one small luminous object that travels through the whole film** (a flower/spark, a cursor, a dot). It:
- arrives first and *causes* each event: lands on a word and the word appears, touches a card and the card opens;
- carries the eye across cuts: it exits one scene and enters the next on the same path;
- turns into things: becomes a dot in "Question", the period of a sentence, a highlight bar, the logo mark;
- has a light trail and a soft glow, and its own sound (a glint) on every landing.

For Voom use the rocket's four-point flare in light blue `#00b3ff` with an off-white core.
Path rules: ease into each target (launch, then land), never linear; no straight teleport; trail length ~0.25 s; scale up (1.5-3×) on hero hits and inside zoom transitions.

## 3. Transitions (learned from the references)

Pick the transition by what the two scenes have in common. Never show an empty frame.

| Transition | How | When |
|---|---|---|
| **Morph / shape carry** | The last shape of scene A becomes the first shape of scene B (a square becomes a diamond, an arc becomes the frame around a photo, a pill expands into a page) | Default between related ideas |
| **Zoom through** | Push into a bright point (fingertips, a core, a screen) to white/light, next scene expands out of the same point | Entering a product or a "deeper" idea |
| **Match cut** | The same object in both scenes (tower → tower in the dashboard): scale/translate A so it lands exactly on B's object, then swap | Same subject, new context |
| **Film-strip whip** | Both scenes move together like one strip (A exits while B enters, same velocity, 0.4-0.45 s, directional motion blur 60-90 px at mid-move) | Fast beat changes, lists of features |
| **Light flood** | A colour floods from one object and fills the frame; next scene is revealed in that colour (light ⇄ dark sections) | Section changes, dark ↔ light |
| **Text-led cut** | The last word stays, everything else changes around it, or the word scales up and becomes the background | Statement → visual |
| **Hard cut on the downbeat** | Straight cut exactly on a kick | Energy, after a build |

Rules: transitions last 0.3-0.6 s; the next scene is already moving when it appears; never fade two saturated scenes through grey; vary the type across the film (no more than two of the same in a row).

## 4. Text choreography

- **Word by word**, each word with its own tiny sound (soft pluck/blip, pitches stepping up the scale).
- **Hero word** gets the big treatment: echo + blur trail, weight/colour change, a highlight bar sliding under it, letters bouncing (references: «Question» with one letter jumping, «grow» swapping colour, «works» getting a highlight box).
- **Supporting lines** mask-rise from a baseline (no blur), 0.05 s stagger.
- **Mixed styles in one line** work: regular + bold + italic/serif accent («Spend *crypto*», «Everything *evolved*»).
- Arabic: reveal whole words right-to-left, never letters (joining breaks); kashida can grow on the hero word.
- The outgoing line leaves before the incoming one takes its place; text never overlaps text.

## 5. Depth and life

- Layers: background plate (0.3× camera move) → large soft bokeh circles/rings (drift, 0.5×) → content (1×) → foreground light/sparks (1.2×).
- Every scene has one eased camera move (push, pan, orbit, rack). Different move per scene.
- After an element lands it keeps living: slow drift (6-14 px), glow breathing on the beat, a light sheen crossing cards once, rings pinging on taps.
- 3D: cards and boards unfold with perspective (rotateX 25-40° → 0) and keep a slow orbit (±5°) while held.

## 6. Timing and the beat grid

- Pick the BPM first (100-120 for premium product films). Put cuts, pops, landings and counts on beats or 8ths.
- Stagger pops on 8th notes, not arbitrary 0.08 s.
- Hero hits (10X, logo, the booth) land on a downbeat with an impact + a short scale punch (≤7 %).
- Overshoot ≤ 3 %, once. Exits ≈ half the entrance duration.
- Reading time still rules: a short line holds ≥ 1 s readable; Arabic +15 %.

## 7. Music and SFX (from the references)

- Reference 1 (brand film): sparse, airy, pluck/marimba-like melodic hits, almost every visual event has its own tuned sound; music dips under hero moments.
- Reference 2 (launch film): ~102 BPM, dark, deep sub and a steady pulse; a quiet intro then a full-band **drop at ~9 s** on the reveal; loud, dense master (≈ −12 dBFS RMS).
- Build: intro (filtered pad + soft pulse) → riser → **drop on the product/brand reveal** → steady groove → half-time outro under the end card → final swell and tail.
- SFX palette: word blips (tuned to the key), glints for the guide object, pops for icons/flags, glass ticks for cards, ticks under counters, keystrokes for typing, whip/whoosh per transition type, a sub impact for hero numbers, bells for the final reveal.
- Mix: music ducks under hero SFX (sidechain from the kick); final loudness −14 LUFS for social; true peak ≤ −1 dB.
- Prefer a licensed track when available; synthesized music is a fallback and should be said so.

## 8. Storyboard → build checklist

1. Write the beat sheet on the BPM grid: every event has a time in beats.
2. Plan the guide object's path through all scenes first, then attach events to its landings.
3. Choose each transition from §3 by what the scenes share.
4. Give every element a role (hero / support / ambient) and an entrance that fits the role.
5. Fill holds: list what moves in every 0.5 s window of every scene.

## 9. Self-review before delivering (mandatory)

Do this on the encoded file, not on stills you hand-picked:
1. **Contact sheet at 2 fps** of the whole film. Any two neighbouring frames identical outside the end card → a dead hold. Fix.
2. **10 frames across every transition** (−0.4 … +0.4 s). Any frame that is mostly empty, grey or a flat colour → fix the transition.
3. **Variety count**: list the entrance types and transition types used. The same one more than ~3 times in a row → vary.
4. **Hierarchy**: in every scene, can you name the one hero move? If not, make one.
5. **Guide object**: does it touch every scene and cause the key events?
6. **Audio**: spectrogram + loudness. Hits line up with visual events (±1 frame); drop lands on the reveal; −14 LUFS.
7. Score honestly against the references. If it reads as "animated pages", say so, list the reasons, fix them, then deliver. Never present a first render as high-end without this pass.
