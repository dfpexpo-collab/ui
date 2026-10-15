# Layouts and formats

All layouts use `tokens/voom.css`, the logo assets, and the grid in `visual-system.md`. Replace placeholder content, keep the structure.

## Canvas sizes

| Use | Size | Grid | Safe margin |
|---|---|---|---|
| Social post, square | 1080 x 1080 | 9 x 9 (120 px cell) | 60 px (half cell) |
| Social post, portrait | 1080 x 1350 (4:5) | 9 x 12 (120 px cell) | 60 px |
| Story / Reel / TikTok / Short | 1080 x 1920 (9:16) | 9 x 16 (120 px cell) | 60 px sides, keep top 250 px and bottom 340 px free of key text (UI overlays) |
| Profile avatar | 1080 x 1080, circle crop | - | logo within central 70% |
| Social cover (X/LinkedIn/Facebook) | 1500 x 500 (3:1) and 1640 x 624 | 12 x 4 | headline left, devices right, avatar overlap zone left-bottom |
| Product feature sheet | 1988 x 1848 (observed) or 1600 x 1500 | 9 x 9-ish | 5% |
| Presentation / video 16:9 | 1920 x 1080 | 12 x 9 (160 px cell) | 80 px |
| YouTube thumbnail | 1280 x 720 | 12 x 9 | 60 px |
| Web hero | 1440 x 900 | 12-col | 80 px |
| Print A4 letterhead | 210 x 297 mm | 9 x 12 | 12 mm |
| Business card | 90 x 50 mm | - | 5 mm |

## Recipe: Product feature sheet (the brand's own pattern, OBSERVED)

1. **Field:** deep blue `#000024` at the top, rising to `#0012d6` at the bottom with a soft light-blue glow behind the hero. Optional faint curved horizon arc.
2. **Title:** centered, Poppins Bold ~110-130 px on a ~1900 px sheet, off-white, tight tracking. 2-4 words (e.g. "Smart Search Engine").
3. **Subtitle:** centered, Poppins Regular ~34-40 px, max 2 lines, off-white. One sentence, benefit first.
4. **Hero:** the product in device mockups, lower 55-60% of the sheet, lit from below by blue podiums/steps or floating with a soft shadow.
5. **Callouts:** 2-4 glass pills with icon tiles around the hero, linked by thin white leader lines.
6. **Accents:** dashed light-blue circle near the hero corner, translucent rocket silhouette behind the device, optional ghost keyword (giant, 10% opacity) behind the title.
7. **Footer:** nothing, or the URL capsule on the overview sheet. Logo appears on the hero and thank-you sheets only.

Template: `templates/feature-sheet.html`.

## Recipe: Social post (square or portrait)

Zones on a 9-col grid: **top bar** (logo left or centered, optional year/tag right) -> **headline** (large, 2-4 lines, key phrase in light blue) -> **hero** (device/3D/concept visual) -> **footer** (`@voomproptech` left, social icons right).

Hook types that fit the brand (see `ideas-and-copy.md`): question, contrast pair (old vs Voom), checkmark/cross pair, numbered tip, feature spotlight, event invitation, project launch.

Rules: one message per post, headline <= 8 words per line, max 2 typefaces, logo size ~ 18-22% of canvas width, footer text ~ 18-22 px. Template: `templates/post-square.html`.

## Recipe: Story / Reel cover (9:16)

Logo top (below the top UI zone). Headline center-upper, hero centered, CTA capsule in the lower third above the bottom UI zone. Use the same gradient direction as the Reel's first frame for a clean cut. Template: `templates/story-vertical.html`.

## Recipe: Social profile

- Avatar: gradient disc + white full logo.
- Cover: gradient (deep blue left to blue right) + headline "Redefining How off-plan **Real Estate** is Presented" (the words *Real Estate* in light blue) + a cluster of devices on the right.
- Name `Voom`, handle `@voomproptech`, verified badge, "Follow" pill in `#1d9bf0`-style bright blue (platform-native).

## Recipe: Presentation slide (16:9)

- Cover: gradient deep blue to light blue top-right, huge heading bottom-left, logo bottom-right (book cover pattern).
- Section divider: giant off-white numeral at the right (Poppins/Gabarito Regular, ~1000 px tall, cropped), section name bottom-left, small wordmark top-left.
- Content: blue-to-light-blue gradient, title top-left (Poppins SemiBold ~52 px), year top-right, footer label bottom-left "Visual Identity Guidelines" style, content centered.
- Closing: radial glow from the bottom, big "Thank You" Poppins Bold centered with a script subline is how the book closes; for new decks prefer the logo + ghost "THANK YOU" as on the product sheets.

## Recipe: Web landing

Header: wordmark left, nav center, Log In / Sign Up right. Hero: rounded gradient panel, centered H1 (Gabarito SemiBold, "Real Estate" in light blue), one-sentence sub, email capture pill + "Get Updates". Below: feature rows following the catalog order (Present -> Find -> Experience -> Convert), each with a device mockup and a glass pill list. Footer deep blue with logo and handles. Responsive: 12-col desktop, 4-col mobile, 16 px gutters.

## Recipe: Email / newsletter header

600 px wide, gradient band 200 px tall, wordmark left, one-line headline right, light-blue pill button below. Body on off-white.

## Recipe: Roll-up / banner / event

Vertical 9 x 12 grid. Logo top, giant statement (3 lines max), hero device on a glowing platform, QR + URL at the bottom, optional diagonal logo ribbon band for event partners. Keep the safe zone and legibility at distance: headline >= 6% of the height.

## Co-branded layout

Two logos on one baseline, equal optical height, separated by the light-blue diamond, both pure white or pure black. Clear space between logo and diamond = 1/2 logo height.

## Arabic / RTL adjustments

Mirror the whole composition: logo stays top-left only if the brand owner shows it that way on the page; in the supplied Arabic posts the logo sits top-left or top-center, headline right-aligned, footer handle left, social icons right. IBM Plex Sans Arabic, no negative tracking, line-height 1.4-1.5, avoid mixing Latin and Arabic in one line except for the brand name and feature names (keep "Voom" Latin, as the posts do).
