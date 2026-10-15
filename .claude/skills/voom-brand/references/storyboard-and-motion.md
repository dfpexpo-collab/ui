# Storyboards and video motion

**Status:** The Brand Guidelines 2026 have no motion chapter. Everything under "Motion language" is **PROPOSED**, derived from what the brand already is: a rocket symbol (acceleration, lift-off), screen-shaped O (a window into the product), glass UI and soft light-blue glows. Say "proposed motion language" when presenting, and get the brand owner's OK before locking it. Visual rules (palette, logo, type, safe zone) are official and always apply.

## 1. Motion principles

1. **Launch, then settle.** Fast acceleration into position, long soft deceleration (the rocket). Never linear, never bouncy.
2. **Light leads.** Glow and light-blue sweeps reveal elements; elements don't just pop.
3. **One hero per beat.** One thing moves most; everything else supports with less amplitude and a later start.
4. **Show the real product.** Cut to real screen recordings or 3D flythroughs as soon as a claim is made. Motion graphics frame the product, they don't replace it.
5. **Clarity over flash.** Text holds long enough to read (see timing). Premium = restrained.
6. **Directional logic.** Forward/up = progress (sell, launch). Orbit = 360 spin/tour. Zoom-through-the-screen = entering the digital twin.

## 2. Tokens (also in `tokens/voom-tokens.json`)

| Token | Value | Use |
|---|---|---|
| `ease.launch` | cubic-bezier(.16, 1, .3, 1) | entrances, logo fly-in, panels |
| `ease.settle` | cubic-bezier(.22, 1, .36, 1) | text, cards |
| `ease.glide` | cubic-bezier(.45, 0, .15, 1) | camera moves, parallax, orbit |
| `ease.exit` | cubic-bezier(.55, 0, 1, .45) | exits (shorter than entrances) |
| `dur.micro` | 0.15 s | hover, icon ticks |
| `dur.ui` | 0.30 s | pills, buttons, toggles |
| `dur.element` | 0.60 s | text lines, cards |
| `dur.scene` | 0.90 s | scene transitions |
| `dur.hero` | 1.40 s | logo reveal, device hero move |
| stagger | 0.08 s per item (max 6 items, then group) | lists, pill sets |
| fps | 30 (social, web), 25 for broadcast MENA, 60 for UI screen recordings | |
| overshoot | none; at most 2% scale settle on pills | |

After Effects: use the Easy Ease with influence ~ 85% in / 60% out for `launch`; a speed graph that spikes at the start and eases for the rest. Lottie/CSS: use the cubic-beziers above.

## 3. Reading time (on-screen text)

- Short line (<= 4 words): 1.0 s hold minimum.
- Headline (5-8 words): 1.8-2.2 s.
- Sub line (one sentence): 2.5-3 s.
- Arabic: add 15% to every hold.
- Don't animate text off before it has been fully readable for the minimum above.

## 4. Logo reveal (4 s sting, 16:9 / 9:16 / 1:1) - PROPOSED

Frame times at 30 fps. Background: signature gradient, subtle slow drift (scale 100 -> 106% over 4 s).

| Time | Action |
|---|---|
| 0.00-0.30 | Deep blue field. Faint light-blue particle dust drifts up, very low opacity. |
| 0.30-0.80 | Light-blue streak (the rocket's trail) sweeps left to right under the wordmark line with `launch` easing, leaving a soft glow. |
| 0.50-1.40 | Wordmark V-O-O-M masked left to right by the streak (mask reveal, `launch`), letters at 100% scale, no wobble. |
| 1.10-1.60 | The rocket swoosh above the M draws in along its path (trim path 0 to 100%), then a brief light-blue flare (80 ms) at its tip. |
| 1.60-2.00 | (R) mark fades in; tagline fades + 12 px rise (`settle`). |
| 2.00-3.40 | Hold. Slow 3% scale push. Glow breathes once (opacity 80 to 100 to 90). |
| 3.40-4.00 | Optional: hold for end card, or exit by a light sweep to the next scene. |

Rules: logo always lands fully intact and unrotated; no 3D flip, no glitch, no shake. Keep the safe zone clear while animating. Audio: a soft rising whoosh at 0.30 and a clean low "thud + shimmer" at 1.40 (see sound).

Short sting (1.5 s, for Reels start/end): only the streak reveal (0.0-0.8) and swoosh flare (0.6-1.0), hold 0.5 s.

## 5. Scene transitions

| Transition | Looks like | Use for |
|---|---|---|
| **Light sweep** | A light-blue gradient wipe moves across, next scene is revealed behind it, 0.9 s | Default between topics |
| **Through the screen** | Camera pushes into the device screen until the product fills the frame, 0.9-1.2 s, ease `glide` | Mockup -> full product recording; "enter the digital twin" |
| **Rocket whip** | Fast horizontal/vertical motion blur in the direction of travel, 0.4 s, hides the cut | Beat changes in fast edits, launch announcements |
| **Match cut (shape)** | The screen-shaped O or a device frame becomes the next scene's window | Premium transitions between features |
| **Cross-dissolve on gradient** | 0.5 s dissolve while background gradient continues | Soft, slow scenes (day -> night) |
| **Day -> night** | Same camera path, color-graded blend, sun tile morphs to moon tile | Day & Night feature |

Avoid: spin transitions, glitch, page-curl, star wipes, zooms with bounce.

## 6. Text and UI animation

- **Headline:** per-line mask reveal up (24 px travel), `settle`, 0.6 s, stagger 0.08 s/line. Key phrase in light blue arrives 0.15 s after the rest.
- **Subtitles/captions:** word-group fade, no per-letter bounce. Arabic is revealed as whole words, right to left, never letter by letter (breaks joining).
- **Glass pills:** scale 0.92 -> 1.0 + fade, 0.3 s, stagger 0.08; leader line draws (trim path) 0.3 s before the pill appears.
- **Numbers/stat counters:** count up 0.8 s `launch`, then settle; "16K" appears with a quick sharpen from blurred to crisp (resolution metaphor).
- **Dashed circle accent:** rotates slowly (6 deg/s) or draws in once.
- **Cursor/tap overlays:** a light-blue ring ping on tap (0.4 s expand + fade) to show interaction.
- **Hold frames:** hold the final composition of each scene for >= 0.6 s before leaving.

## 7. Device and product shots

- Devices enter from below or slightly rotated, rise 40 px with `launch`, settle with a 2% scale-back. Podium light fades up 0.3 s before the device.
- Screen content plays real recordings at 60 fps downsampled, or smooth 3D camera paths. No fake UI. Mask rounded corners to match the device.
- Parallax: layers move at 100% / 70% / 40% (device / glow / background), `glide`, 4-8% travel over the shot.
- Rocket ghost silhouette: slow drift up-right (2-3% per second), 15-25% opacity.
- Glow: radial light-blue behind the hero, breathing at 0.15 Hz.

## 8. Camera moves per feature (for 3D / screen-record shots)

| Feature | Camera move |
|---|---|
| Interactive map | Orbit down from a high oblique to the project pin, then trace the distance line to a landmark. 5-6 s |
| Master plan | Slow aerial push-in / glide across blocks; 16K crispness: zoom from full plan to a single unit with a sharpen pass. 6 s |
| Day & night | Locked camera, color-graded morph sun -> moon (1.2 s), lights in windows turn on. |
| Interactive building | Rotate the tower 90-120 degrees (`glide`), floor band highlights and status chip pops. |
| 360 spin | 360 degree orbit at constant angular velocity (6-8 s per rotation) with `glide` ends. |
| Floor plan | Top-down, floors stack and switch GF -> 1F -> 2F with a vertical slide. |
| Interior tour | First-person pan/dolly between room chips; cut on room chip tap. |
| Tape measure | Two points snap, dimension line draws, value counts up. |
| Smart search / filter | UI-led: sliders move, count updates (17 -> 9), matching units light up on the plan. |
| CRM integration | Unit colors flip (green -> yellow -> red) in sync with a CRM card status change. |
| Register interest | Tap callback, glass form scales in, fields fill, Send triggers a ping. |
| Offline | Wifi icon strikes through, product keeps working: continuous interaction shot with the crossed wifi tile in the corner. |

## 9. Color grade and look

- Keep the gradient as the base layer. Add a subtle bloom on light-blue elements only.
- Product recordings: lift shadows slightly toward deep blue (`#000024`) for harmony; do not tint the client's brand colors.
- Safe levels: no clipping on off-white text; off-white `#f1f1f1` text, not pure white.
- Grain: none. Vignette: soft, toward deep blue.

## 10. Sound (PROPOSED)

- **Music:** modern, confident, minimal electronic / cinematic tech, 100-118 BPM, no vocals for product videos. Build with the cut rhythm, drop on the logo.
- **SFX palette:** soft whoosh (transitions), glassy tick (pill appears), low shimmer (logo land), subtle click (taps), airy riser for the hero reveal.
- **VO:** calm, confident. Arabic (Saudi-neutral) and English versions. Pace ~ 2.3 words/s.
- Mix: music -18 LUFS bed under VO -> -23 on VO sections; final -14 LUFS for social.
- Always provide captions (burned-in for social, SRT for others).

## 11. Video formats and safe zones

| Format | Size | Safe zone (keep text/logo inside) |
|---|---|---|
| Reel / Story / TikTok / Short | 1080 x 1920 | 60 px sides; top 250 px and bottom 340 px free |
| Square | 1080 x 1080 | 60 px |
| Portrait feed | 1080 x 1350 | 60 px |
| Landscape | 1920 x 1080 | 5% title-safe (96 x 54 px) |
| Exhibition screen / LED wall | 3840 x 2160 | 5% title-safe; ensure no text < 60 px |

Duration guide: Reel hook 0-3 s; feature clip 6-10 s; product overview 20-30 s; launch film 45-60 s; sting 4 s; end card 2-3 s. Loop-friendly endings for exhibition screens.

Delivery: H.264 MP4 (social), ProRes 422 (master), alpha logo sting as ProRes 4444 or WebM. Name files `voom_<campaign>_<format>_<lang>_v<nn>.mp4`.

## 12. Storyboard method

1. **Brief in 5 lines:** goal, audience, key message, CTA, duration, languages, platforms.
2. **Beat sheet:** hook (0-3 s) -> problem/contrast -> product reveal -> proof (2-3 feature moments) -> CTA -> logo end card.
3. **Shot table** (`templates/storyboard.md` or `.html`): shot #, time, duration, frame description, camera/motion, on-screen text (AR + EN), VO, SFX/music, transition, assets needed.
4. **Frame sketches** (optional): `templates/storyboard.html` renders each shot as a branded frame placeholder using the gradient, grid and safe zone for quick visual boards.
5. **Check:** total duration, reading times, one-hero-per-beat, safe zones, logo end card with safe zone, brand rules in `qa-checklist.md`.

### Hook formulas that suit Voom
- **Contrast:** "Papers everywhere?" -> torn paper reveals a tablet with the whole project.
- **Question:** "Can your client see their exact unit before it's built?"
- **Reveal:** device rises, screen zooms into the masterplan, unit lights up, card pops.
- **Number:** "16K zoom on every unit."
- **Day-in-the-life:** broker taps a unit, client sees interior, sends interest in 10 seconds.

## 13. Sample storyboards

### A. "From paper to Voom" - 15 s Reel, 9:16 (contrast hook)

| # | Time | Visual | Motion | On-screen text (AR / EN) | SFX |
|---|---|---|---|---|---|
| 1 | 0.0-2.5 | Grey desk piled with brochures and price sheets. A chair tied with rope on the right (as in the social concept). | Slow push-in, desaturated. | "اوراقك كثيرة؟" / "Too much paper?" | Paper rustle |
| 2 | 2.5-3.3 | Torn-paper edge rips across revealing deep-blue gradient. | Rocket whip, 0.4 s | - | Rip + whoosh |
| 3 | 3.3-6.5 | Phone rises on a blue podium showing the interactive masterplan. | Device rise `launch`, glow breathes. | "كل شي تغيّر مع VOOM" / "Everything changes with Voom" | Shimmer |
| 4 | 6.5-9.5 | Through the screen into the masterplan, tap a unit, info card pops. | Through-the-screen, ping ring on tap. | "Tap any unit. See everything." | Click, glass tick |
| 5 | 9.5-12 | Interior tour pan + tape measure snap. | Dolly + dimension draw. | "Walk through before it's built" | Soft ticks |
| 6 | 12-15 | Logo sting + CTA capsule. | Streak reveal, hold. | `www.voomproptech.com` | Logo thud |

### B. "Redefining how off-plan is presented" - 30 s product overview, 16:9

1. 0-3 Logo sting short -> headline "Redefining how off-plan real estate is presented".
2. 3-8 Devices on podiums (laptop, tablet, phone, monitor) assemble, light sweep. VO: "Voom is the first AI-powered PropTech platform..."
3. 8-14 Master plan aerial, 16K zoom into a unit, filter panel adjusts (17 results).
4. 14-20 Info card -> 360 spin -> interior tour -> tape measure (quick cuts with rocket whip).
5. 20-25 CRM colors flip live; interactive building floor chips; offline icon.
6. 25-30 Portfolio tile grid, then logo + CTA.

### C. "Day & Night" - 8 s loop, 1:1
Locked view of a masterplan, sun tile and moon tile pill at the top; morph day -> night 1.2 s at 3 s, hold, morph back at 6.8 s for loop. Text: "Explore day and night."

## 14. After Effects / CSS implementation notes

- Build in 1920x1080 and 1080x1920 comps from one master with the same grid.
- Use shape layers for the gradient (3 color stops, angle 135 degrees) so direction is editable.
- Pre-comp the logo reveal once and reuse; keep the logo as the supplied artwork (import PNG at 2x or recreate as vector if the brand owner provides the AI/SVG).
- CSS/Web: use `tokens/voom.css` variables; prefer `transform`/`opacity` animations, `prefers-reduced-motion` fallback = fade only.
