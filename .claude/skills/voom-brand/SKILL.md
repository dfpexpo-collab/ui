---
name: voom-brand
description: Voom (Proptech & Digital Twin Innovation) brand system. Use for ANY Voom work - campaign ideas, social posts, feature sheets, decks, web or landing layouts, stationery, storyboards, video/motion specs, logo reveals, copy in Arabic or English, or a brand-compliance review. Holds the logo assets, colors, type rules, grids, tone of voice, product feature catalog, and motion language.
---

# Voom brand skill

Voom is the first AI-powered PropTech platform that changes how **off-plan real estate** is showcased, sold and managed. Everything produced for Voom must look and sound like one brand. Load the reference file that matches the task, then produce the work. Do not improvise colors, fonts or logo treatments.

Official source: *Voom Brand Guidelines 2026* plus the *New Features* product sheets. Items marked **PROPOSED** are derived (the book has no motion chapter, no stated min logo size, no Arabic headline spec beyond the typeface). Say so when you rely on them.

## Pick the workflow

| The user wants | Read first | Output |
|---|---|---|
| Ideas, campaign angles, hooks, copy | `references/ideas-and-copy.md`, `references/brand-foundations.md` | 3-5 distinct ideas, each with hook, visual, copy (AR + EN), CTA |
| Social post, story, cover, ad, banner | `references/layouts-and-formats.md`, `references/visual-system.md` | HTML from `templates/` rendered to PNG, or a precise layout spec |
| Feature sheet / product slide | `references/layouts-and-formats.md` (feature sheet recipe), `references/features-catalog.md` | Layout using the feature sheet recipe |
| Deck, web page, stationery | `references/visual-system.md`, `references/layouts-and-formats.md` | Layout with grid and type spec |
| Storyboard | `references/storyboard-and-motion.md` | Shot table from `templates/storyboard.md` (or `.html`) |
| Video motion / animation spec / logo reveal | `references/storyboard-and-motion.md`, `tokens/voom-tokens.json` | Timed motion spec (durations, easing, layers), AE/CSS/Lottie-ready values |
| Review something against the brand | `references/qa-checklist.md` | Findings by severity with before/after fixes |

Always read `references/visual-system.md` before anything visual. It is short and contains the hard rules.

## Hard rules (never break)

1. **Palette only:** Blue `#0012d6`, Light blue `#00b3ff`, Deep blue `#000024`, Off white `#f1f1f1`. Pure black/white only for monochrome logo on off-palette surfaces.
2. **Signature background:** diagonal gradient deep blue -> blue -> light blue (or a deep-blue field with a blue glow). Never a flat unapproved color, never a rainbow.
3. **Logo:** use the files in `assets/logo/`. Off-white on dark, blue or gradient; dark navy on off-white, white or solid light blue. Keep a safe zone of **1/4 logo height** on every side. Never recolor (no two-tone), never stretch, never add effects, never put it on a gradient over a gradient, never on low-contrast backgrounds.
4. **Type:** Gabarito (Latin), IBM Plex Sans Arabic (Arabic). Sentence case. Heading SemiBold, leading 90%, tracking -30. Subheading Medium, leading 100%, tracking -20. Body Regular, leading 130%, tracking -10. Poppins Bold/Regular is the approved display face used on product sheets and the guidelines deck.
5. **Highlight with light blue:** emphasize a key phrase by coloring it `#00b3ff`, not by changing font or adding underlines.
6. **Text on blue is off-white `#f1f1f1`**, not pure white.
7. **Product screenshots are client-themed** (teal, green, etc.). Do not treat those colors as Voom colors. Voom blue lives on the marketing frame around the screenshot.
8. **Language:** Arabic and English are both first-class. Arabic layouts are right-to-left, mirrored, and use IBM Plex Sans Arabic with no tracking.

## Voice in one line

Confident, modern, clear. Short sentences, concrete outcomes ("Sell off-plan with full visibility"), one idea per frame. Serious-leaning but never stiff; timeless over trendy. See `references/brand-foundations.md`.

## Using the assets

- Logos: `assets/logo/voom-logo-full-white.png`, `voom-logo-full-black.png` (with tagline), `voom-wordmark-white.png`, `voom-wordmark-black.png` (no tagline, for small sizes). Transparent PNG, 3000px+ wide.
- Fonts: `assets/fonts/` (Gabarito, IBM Plex Sans Arabic, Poppins TTFs, OFL). Install before rendering or opening SVG/AI files.
- Tokens: `tokens/voom.css` (import in any HTML), `tokens/voom-tokens.json` (design/motion handoff).
- Templates: `templates/post-square.html`, `templates/story-vertical.html`, `templates/feature-sheet.html`, `templates/storyboard.md`, `templates/storyboard.html`.
- Visual reference: `reference/brand-book/` and `reference/features/` (page renders of the source PDFs). Open them to match look and feel.

To render a template to an image: `npx playwright screenshot` or a short Playwright script (set the viewport to the template's canvas size). Check the render before delivering.

## When the brief is thin

Make a reasonable choice and state it. Ask only if the answer changes the work a lot (target platform, language, which feature/project, duration). Default language: Arabic + English pair for social, English for decks, bilingual for stationery.

## Keeping this skill current

When the brand owner changes something, edit the matching reference file and `tokens/`, and update the "Official vs Proposed" notes. Add new campaigns to `references/ideas-and-copy.md` so future ideas stay consistent.
