# Voom visual system

Read this before producing anything visual. Everything here is from the Brand Guidelines 2026 unless marked **PROPOSED** or **OBSERVED** (seen in the supplied social and product sheets but not written as a rule).

## 1. Logo

Files: `assets/logo/` (transparent PNG).

| File | Use |
|---|---|
| `voom-logo-full-white.png` | Default. Wordmark + (R) + tagline, on deep blue / blue / gradient. |
| `voom-logo-full-black.png` | On off-white or light neutral surfaces. |
| `voom-wordmark-white.png` / `-black.png` | Small sizes, icons-in-context, tight headers, watermark in product shots. No tagline. |

**Anatomy:** VOOM wordmark in wide geometric caps, rocket swoosh above the M, registered mark (R) at the baseline right, tagline *Proptech & Digital Twin Innovation* underneath.

**Approved colorways** (the book's "Logo Colors" page plus the five square logo files the owner supplied):
1. Off-white on the signature gradient (deep blue to blue to light blue).
2. Off-white on near-black navy (about `#04101c`, reads as the deep-blue family).
3. Off-white on the blue to light-blue gradient / radial light-blue glow.
4. Off-white on solid brand blue.
5. Dark navy (about `#04101c`, not pure black) on off-white or white.
6. Dark navy on **solid light blue `#00b3ff`**.
**Monochrome:** pure white on black, pure black on off-white. Use these whenever the background is outside the palette (photos, client colors, print).

Note: in the supplied solid-blue tile the blue renders more saturated/violet (about `#1a00ff`) than the book's `#0012d6`. Treat `#0012d6` as the official value; the tile is likely an export difference. Confirm with the brand owner.

The supplied square files (1000x1000, logo centered, tagline included) are the master artwork. They were shared in chat, not saved as files. If you want them in this repo, upload them as SVG/PNG files; until then `assets/logo/` holds high-res transparent versions extracted from the brand book.

**Safe zone:** `X` = 1/4 of the logo's height, clear on all four sides (measured around the whole lockup including tagline).

**Scalability:** the book shows the logo at 100/75/50/25%. At 75/50/25 the tagline and (R) are dropped: use the wordmark-only file. Treat 25% of a reference lockup as the floor, and **PROPOSED:** never place the wordmark narrower than ~80 px on screen (~15 mm in print); below that use the rocket-M crop only if the brand owner supplies a symbol file (none supplied yet).

**Lockups:** horizontal primary only is supplied (the book labels it "vertical logo": wordmark above tagline, centered).

**Do not (from "Logo Rules"):**
- use unapproved colors (cyan, pink, purple, etc.)
- put the logo over a gradient on a gradient (dark logo on the blue gradient)
- use low-contrast combinations (blue logo on blue)
- place it on colors outside the palette (use black or white logo instead)
- resize disproportionately (stretch, squash, condense)
- modify logo color applications (e.g. coloring only the V)
- add shadow, outline, glow, 3D or animation that distorts the mark. (Motion that reveals it intact is fine, see motion file.)

**Partnerships:** Voom logo + a **light-blue diamond** (the square-rotated divider, `#00b3ff`) + partner logo. Both logos in the same color, black or white only. Align on a shared baseline and equal optical height. Example in the book: Voom `◆` Google.

**Avatar (social):** circular crop, gradient background (deep blue to blue), white full logo centered.

## 2. Color

| Name | HEX | Role |
|---|---|---|
| Blue | `#0012d6` | Primary brand blue |
| Light blue | `#00b3ff` | Accent, highlight text, glow, diamond |
| Deep blue ("deeb blue" in the book) | `#000024` | Darkest tone, dark backgrounds, text on light |
| Off white | `#f1f1f1` | Text on blue, light backgrounds, logo |

**Signature gradient (OBSERVED):** deep blue at one corner, blue through the middle, light blue at the opposite corner, diagonal. Covers: deep blue bottom-left to light blue top-right. Section slides and pages vary the direction, always blue-dominant. CSS: `linear-gradient(135deg, #000024 0%, #0012d6 55%, #00b3ff 100%)` (flip direction per layout).

**Product-sheet field (OBSERVED):** near-black blue `#000024`-`#020234` top, rising into `#0012d6` with a soft light-blue glow behind the hero device; a faint curved horizon arc and podium/steps in blue.

**Usage ratio (PROPOSED):** ~60% blue/deep blue, ~25% off-white (text, cards), ~10% light blue (accent), ~5% neutral (photos, UI). Light blue is an accent: never the main field.

**Contrast:** off-white or white text on blue/deep blue passes AA. Light blue text only on deep blue or blue at 24px+ / bold; never on off-white. Dark text on off-white only.

**Status colors in product depictions only (OBSERVED in CRM sheet):** Available green, Sold red, Reserved yellow, Unlaunched grey. Primary CTA button inside the product is red ("Register Interest", "Callback").

## 3. Typography

| Role | Font | Weight | Case | Size (book, 1920x1080) | Leading | Tracking |
|---|---|---|---|---|---|---|
| Heading | **Gabarito** | SemiBold (600) | Sentence | 144 pt | 90% (x0.9) | -30 |
| Subheading | Gabarito | Medium (500) | Sentence | 48 pt | 100% (x1.0) | -20 |
| Body | Gabarito | Regular (400) | Sentence | 18 pt | 130% (x1.3) | -10 |
| Arabic (all roles) | **IBM Plex Sans Arabic** | Bold / Medium / Regular | - | match Latin sizes | 1.3-1.5 | 0 |
| Display / decks / product sheets | **Poppins** | Bold headlines, Regular body | Sentence | scale to canvas | 1.0-1.3 | tight (-10 to -30) |
| Arabic display / editorial (APPROVED 2026-10) | **thmanyah Sans** (headlines, UI-like display), **thmanyah Serif Display** (hero, campaign), **thmanyah Serif Text** (editorial copy) | Light 300 / Regular 400 / Medium 500 / Bold 700 / Black 900 | - | match Latin sizes | 1.2-1.4 | 0 |

Notes:
- Tracking is in 1/1000 em: -30 = -0.03em, -20 = -0.02em, -10 = -0.01em. Small text stays between 0 and -10.
- Scale by canvas: size = reference x (canvas width / 1920). A 1080 px square post: heading ~ 80-96 px, subheading ~ 36 px, body ~ 20-24 px (OBSERVED proportions from social posts: headline is the dominant element).
- Poppins appears on the book's typography page, its section dividers and all product feature sheets. Gabarito is the "Typography Rules" face and sets the hierarchy. **When both are available:** Gabarito for UI/web/body and long text; Poppins Bold for big marketing headlines on sheets. Don't mix them within one text block.
- Hierarchy rule from the book: clear and intentional size jumps between heading, subheading and body. Headlines big and tight.
- Highlight a phrase by switching it to `#00b3ff` (e.g. *"Redefining How off-plan **Real Estate** is Presented"*).
- Left-align body copy. Center only hero titles on product sheets.
- **thmanyah (Arabic display):** use it for Arabic headlines, hero lines, campaign and video titles where the brand should feel premium or editorial. Keep IBM Plex Sans Arabic for UI screens, tables, forms and long body text. Don't mix thmanyah and Plex inside one text block. Pair thmanyah Sans with Gabarito, and thmanyah Serif Display with Poppins Bold for big bilingual titles.
- **Kashida (thmanyah only):** type tatweel `ـ` (U+0640) after a letter, 1 to 5 of them. The font swaps in that letter's own stretched form, a curved extension, not a flat line. Use it on one key word per line for emphasis or to balance a centred title (e.g. «بيـــعة أسرع»). Never use it in body text or with Plex, where tatweel is a flat bar. In motion, a kashida can grow by stepping levels 0→5 on the hero word.
- **thmanyah licence:** local install only, never committed or embedded as a web font. Deliver it as outlined paths (SVG/AI/PDF/video). See `assets/fonts/README.md`.

## 4. Grid and layout

| Layout | Grid | Typical canvas |
|---|---|---|
| Vertical | **9 x 12** | 1080x1350 (4:5), 1080x1920 (9:16) |
| Square | **9 x 9** | 1080x1080 |
| Horizontal | **12 x 9** | 1920x1080 (16:9 uses 12 x 9 modules cropped), 1600x1200 |

- Square cells. The **text margin** (red line in the book) is aligned to the centre of the first grid square, i.e. half a cell from each edge.
- Align logo, headline and footer to the margin. Hero imagery may bleed.
- Generous negative space. One focal point per frame.

## 5. Icons

Line icons, sharp corners, clean uniform stroke, simple geometric shapes (envelope, calendar, house, clock, lock, door, gift, tag, chat, check, search-frame, user, bookmark, headset, mail-open, document). White on blue. **OBSERVED:** on product sheets icons sit inside a rounded-square glowing blue tile (`~#0a64f0`, soft light-blue glow) at the start of a glass pill.

## 6. Components seen in the brand's own material (OBSERVED)

- **Glass pill / callout:** rounded rectangle or full pill, translucent navy fill, 1.5-2 px light-blue-to-white stroke, soft inner glow. Contains an icon tile + 2-4 word label (Poppins SemiBold/Bold, off-white). Linked to the hero with a thin white leader line.
- **Dashed circle accent:** thin dashed light-blue circle or arc near a corner or behind a device, for orbit/ping feel.
- **Rocket ghost:** the rocket form as a large translucent 3D silhouette behind the hero device (low opacity, blue on blue).
- **Podiums / steps:** soft blue cylinders or cubes lighting up devices from below.
- **Device mockups:** laptop, phone, tablet, desktop monitor with the real Voom experience; shown on podium, floating, or in hands. Keep screens sharp and crisp.
- **URL capsule:** pill outlined in white-blue, centered, holding `www.voomproptech.com`.
- **Social footer:** `@voomproptech` bottom-left, small icons X / TikTok / Instagram / Facebook bottom-right. Logo top-left (or top-center on poster-like posts).
- **Split "old vs new" (social concept):** torn-paper edge, left = Voom blue with a device, right = grey paper world (rope-tied chair, piles of papers).
- **Ribbon band (event):** diagonal repeating VOOM logo band under a device on a glowing circular platform with grid floor.
- **Pill buttons:** off-white pill with deep-blue text ("Get Updates", "Log In"), or light-blue pill with white text ("Follow").

## 7. Imagery

- **Hero imagery = the product:** real masterplan, 3D renders, interior panoramas, floor plans, in clean device mockups. Photorealistic 3D, bright and aspirational, rendered in sunny or dusk light.
- Keep photography high-resolution; avoid stock photos of generic skylines when a project render exists.
- Overlays on photos: deep-blue gradient scrim `rgba(0,0,36,.55)` for text legibility.
- Do not put the logo directly on busy imagery: use the monochrome logo on a scrim or in a clear corner.

## 8. Stationery and print (OBSERVED)

- **Letterhead:** off-white `#f5f6f6`; black full logo top-left; footer row with phone, web, email, evenly spaced, Gabarito 9-10 pt.
- **Business card:** front = vertical gradient (blue top to near-black bottom), white logo top, `PROPTECH & DIGITAL TWIN INNOVATION` in bold caps bottom-left with a white QR tile bottom-right. Back = white, QR top-left, name + title in English and Arabic, address, phone, email, web.
- **Envelope:** off-white body, black logo top-left, gradient flap.
- Phone/e-mail shown in the book (`+1 (800) 555-7895`, `hello@voom.com`) are placeholders: do not reuse them. Real web is `www.voomproptech.com`, real handle `@voomproptech`.

## 9. Web (OBSERVED)

Dark UI: black/deep-blue page, hero gradient panel with a rounded top corner, centered headline with the phrase "Real Estate" in light blue, dotted globe texture, email capture pill with an off-white "Get Updates" button, top nav: Home, About Us, Services, Contact, Blogs, Reviews; Log In (off-white pill) and Sign Up (dark pill).
