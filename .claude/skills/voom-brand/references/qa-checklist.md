# Brand QA checklist

Run this on any Voom deliverable. Report findings as **Blocker / Fix / Nit** with the rule and a concrete before -> after.

## Logo
- [ ] Uses the supplied artwork (full or wordmark), unmodified, correct colorway for the background.
- [ ] Off-white (not pure white) on gradient/deep blue/blue; dark navy on off-white, white or solid light blue; pure black/white only on off-palette backgrounds.
- [ ] Safe zone >= 1/4 logo height on all sides; no text or edges intruding.
- [ ] Not stretched, rotated, outlined, shadowed, recolored, or placed on a gradient over gradient or on low contrast.
- [ ] Tagline dropped at small sizes (wordmark only).
- [ ] Partner lockup uses the light-blue diamond and same-color logos.

## Color
- [ ] Only Blue `#0012d6`, Light blue `#00b3ff`, Deep blue `#000024`, Off white `#f1f1f1` (+ black/white for monochrome logo).
- [ ] Background is the signature gradient or a deep-blue/blue field. No flat off-brand colors.
- [ ] Light blue used as accent (highlight phrase, glow, diamond), not as a large field.
- [ ] Text contrast AA: off-white on blue/deep blue; light blue text only on dark and large.
- [ ] Client UI colors (teal, green...) appear only inside product screenshots.

## Typography
- [ ] Latin = Gabarito (or Poppins for display on sheets), Arabic = IBM Plex Sans Arabic.
- [ ] Sentence case; headings SemiBold, leading ~90%, tracking -30; subheads Medium 100% -20; body Regular 130% -10.
- [ ] Clear size jumps; headline dominant; max 2 type sizes per text block.
- [ ] Arabic: RTL, no negative tracking, line-height >= 1.4, no letter-by-letter animation.
- [ ] No more than one highlighted (light-blue) phrase per headline.

## Layout
- [ ] Follows the grid: 9x12 vertical, 9x9 square, 12x9 horizontal; margin = half a cell.
- [ ] One focal point; hierarchy reads in 3 seconds.
- [ ] Platform safe zones respected (story/reel top 250 px, bottom 340 px).
- [ ] Footer (handle + social icons) present on social posts: `@voomproptech`.
- [ ] Icons: line style, sharp corners, consistent stroke.

## Content
- [ ] Feature names, claims and numbers match `features-catalog.md` (16K zoom, CRM sync, offline...). No unsupported claims, no investment/return promises.
- [ ] Voice: short, concrete, benefit-first, confident. No hype words.
- [ ] Arabic reviewed by a native speaker; Arabic and English say the same thing.
- [ ] CTA present and singular. URL is `www.voomproptech.com`; no placeholder emails/phones.
- [ ] Client logos used only with their consent and in portfolio contexts.
- [ ] Render disclaimer where renders are shown as the real product ("illustrative purposes only").

## Motion / video (if applicable)
- [ ] Ends with the logo end card (safe zone respected, >= 1.5 s hold).
- [ ] Easing/timing follows `storyboard-and-motion.md`; no bounce, glitch, 3D flip of the logo.
- [ ] Text holds >= reading time; Arabic +15%.
- [ ] Captions present; audio levels set; loop point clean for exhibition screens.
- [ ] Product footage is real, sharp, and not tinted over client brand colors.

## Report template

```
Verdict: Pass / Pass with fixes / Fail
Blockers: ...
Fixes: ...
Nits: ...
What works: ...
```
