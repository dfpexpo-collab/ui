# VOOM – SaaS promo storyboard (AR, 16.9)

- **Format:** 1920×1080, 30 fps. Arabic VO (Egyptian, as written), burned-in captions optional.
- **Look:** SaaS motion style (glass cards, kinetic type, tilted device mockups, light sweeps) in VOOM colors only: `#000024` / `#0012d6` / `#00b3ff` / `#f1f1f1`.
- **Rhythm:** dark hook → light “platform” section (F03–F07) → dark VOOM reveal → **project footage** → dark close → gradient end card.
- **Not in this board:** the section from «البداية من الخريطة التفاعلية…» to «…قبل ما البناء يخلص». Real project videos go there (marked F14).
- Timings assume ~2.3 Arabic words/s. Adjust them to the recorded VO.
- Motion tokens (proposed, from the brand skill): `launch` cubic-bezier(.16,1,.3,1), `settle` (.22,1,.36,1), `glide` (.45,0,.15,1). Stagger 0.08 s. No bounce, glitch, or spin.

Previews: `previews/_contact-sheet.jpg`. Editable frames: `frames/F01.svg` … `F19.svg`.

## Part A – before the footage (0 → ~27.4 s)

| # | Time (s) | VO | Visual | Motion (AE) | SFX |
|---|---|---|---|---|---|
| F01 | 0.0–1.6 | لكل شركة تطوير عقاري | Dark field, horizon arc, dashed orbits, floating feature words (Master plan, CRM, 16K…), building icon tile | Hook: open on black, then a light sweep. Floating words drift on Z with depth blur (like ref 1, “everything”). Orbits rotate 6°/s. Headline: mask reveal per word, right to left, `settle`. «تطوير عقاري» lands 0.15 s later in light blue | Riser + soft hit |
| F02 | 1.6–3.2 | عايزة تضاعف مبيعاتها | Glass sales card with an area chart + ×2 chip; stacked headline on the right | Card rises 40 px with `launch`. Chart line draws (trim path 0→100%, 0.8 s). Endpoint dot pops. ×2 chip scales from 0.92. «تضاعف» scales from 120% to 100% with a blur→sharp settle | Glass tick on the chip |
| F03 | 3.2–5.0 | مشروعك بالكامل | **Switch to light** (light sweep). Project card with a grid of 1,248 units | Unit cells pop in a diagonal wave (stagger 0.01 s per cell, use the Repeater or a script). Counter 0→1,248 | Whoosh + tick cascade |
| F04 | 5.0–6.6 | بكل وحداته وتفاصيله وبياناته | 3 cards: الوحدات / التفاصيل / البيانات | Cards enter in sync with each word (RTL), 0.08 stagger. Floor-plan lines draw. Data rows fade up | 3 soft ticks |
| F05 | 6.6–8.0 | في منصة واحدة تفاعلية | The 3 cards fly together and merge into one dashboard window | Shape morph: the cards scale/translate into the dashboard frame (`glide` 0.9 s). Cursor click + ping | Merge whoosh, click |
| F06 | 8.0–9.6 | متصلة بالـ CRM بتاعك | CRM card ↔ sync ↔ dashboard | Dashed link draws, dots travel along the path (loop). Sync icon spins once. Unit colors flip green→yellow→red in sync | Data blips |
| F07 | 9.6–11.6 | وشغالة أونلاين أو حتى أوفلاين | Online/Offline toggle, crossed Wi-Fi, «المنصة شغالة بدون إنترنت» pill | Toggle knob slides Online→Offline (0.3 s `launch`). Wi-Fi slash draws. Check pill pops. Everything keeps moving (it still works) | Switch click |
| F08 | 11.6–13.2 | VOOM.. | **Back to dark.** Signature gradient + full logo | Logo sting (brand skill): light streak sweeps, wordmark mask reveal, swoosh trim path, tagline rises 12 px | Whoosh → thud + shimmer |
| F09 | 13.2–15.2 | منصة PropTech مدعومة بالذكاء الاصطناعي | AI prompt bar (like the ref-2 search bar) + chips | Bar expands from a dot to full width. Text types in word by word (never letter by letter). AI chip glows. 3 chips stagger in | Typing ticks |
| F10 | 15.2–17.4 | بتحوّل مشروعك العقاري بالكامل لتجربة تفاعلية | Tilted tablet (3D layer) + 3 glass pills with leader lines | Device rotates in Y −25°→−12°, rises with `launch`. **Put a real screen recording inside the screen.** Leader lines draw, then the pills appear. Tap ping | Shimmer |
| F11 | 17.4–19.6 | وبتربط العرض بالبيانات الحقيقية للمشروع | Plan screen + selected unit → data card (A‑204, LIVE) | Unit highlight, then the link curve draws, then the data card slides in from the left. Values count up | Blip |
| F12 | 19.6–22.4 | من أول الماستر بلان لحد أصغر وحدة | 3 steps: الماستر بلان → المبنى → الوحدة + “16K zoom” pill | Camera zoom-through: push into the plan card, which becomes the building card, which becomes the unit card (match cut on the screen shape). Blur→sharp on each step (the 16K metaphor) | 3 zoom whooshes |
| F13 | 22.4–26.4 | وبكده فريق المبيعات بيشتغل ببيانات دقيقة ومحدّثة لحظة بلحظة | 3 stat cards (متاح/محجوز/مباع), live chart, «تحديث الآن» | Numbers tick in real time (expression `Math.round(time*…)`). Chart line extends. The live dot pulses at 1 Hz | Soft ticks |
| F14 | 26.4–27.4 | — | Tablet with a dashed zoom guide | **Through the screen:** push into the screen until it fills the frame (0.9–1.2 s, `glide`), then cut to the project footage | Big whoosh |

## Part B – project footage (editor)

From «البداية من الخريطة التفاعلية» to «قبل ما البناء يخلص»: real videos from the project (map, master plan 16K, smart filtration, availability, live inventory, exterior, 3D floor plan, interior tour). Recommendation: keep the same small chrome (wordmark top-right + footer) over the footage, and use glass pills for feature names so it stays consistent with the rest of the film.

## Part C – after the footage (T = end of footage)

| # | Time (s) | VO | Visual | Motion (AE) | SFX |
|---|---|---|---|---|---|
| F15 | T+0–2.6 | جاهز تضاعف مبيعاتك لـ 10 أضعاف! | Big “10x” with a gradient fill + arrows going up | Light-sweep transition out of the footage. Counter 1→10 (0.8 s `launch`), then a blur→sharp settle. Arrows shoot up-right | Hit on “10” |
| F16 | T+2.6–5.0 | أكتر من متين مشروع اتباع عن طريق VOOM.. | Tilted wall of project tiles (like the ref-2 opening) + «+200» | Wall drifts diagonally (`glide`). Counter 0→200. **Replace the tiles with real project renders** | Riser |
| F17 | T+5.0–7.4 | والدور الجاي على مشروعك | Same wall, one empty dashed tile «مشروعك», cursor | Camera pushes toward the empty tile. Cursor moves in and clicks, ping, and the tile glows | Click |
| F18 | T+7.4–9.6 | VOOM.. تجربة أوضح، بيعة أسرع. | Two lines, «أسرع.» in light blue | Line 1 mask-up, then line 2. «أسرع» gets a short rocket-whip motion blur | Whoosh |
| F19 | T+9.6–12.6 | — | Gradient + full logo + URL capsule + handle | Logo sting short (1.5 s), then the URL pill scales in, then the handle fades. Hold ≥ 1 s | Logo thud |

## Notes on the copy (please confirm)

- «الأصطناعي» is a spelling mistake. The correct form is **«الاصطناعي»** (hamzat wasl). The frames use the correct spelling.
- Claims «10 أضعاف» and «أكتر من 200 مشروع» need sales/marketing approval (brand QA: no unsupported numbers).
- F09/F10 chips use the feature names from the product catalog (Smart filtration, Live inventory, Availability, Master plan, 3D, Interior tour).
- The colors inside product screens (green/yellow/red statuses) are product UI only, not brand colors.
