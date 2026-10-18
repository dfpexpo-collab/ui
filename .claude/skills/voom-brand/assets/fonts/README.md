# Voom brand fonts

All three faces in the brand book are open-source (SIL Open Font License), downloaded from Google Fonts.

| File | Family | Weight | Role |
|---|---|---|---|
| `Gabarito-400/500/600/700.ttf` | Gabarito | Regular / Medium / SemiBold / Bold | Latin heading, subheading, body |
| `IBMPlexSansArabic-400/500/600/700.ttf` | IBM Plex Sans Arabic | Regular / Medium / SemiBold / Bold | All Arabic |
| `Poppins-400/600/700.ttf` | Poppins | Regular / SemiBold / Bold | Display on product sheets / decks |

Install them locally (double-click → Install) before opening any SVG/AI file from this repo.

**thmanyah (licensed, approved 2026-10):** Sans, Serif Text and Serif Display, Light to Black. Its licence forbids uploading, hosting or redistributing the files, so they are **not** stored here. Install locally with `bash tools/fonts/install_thmanyah.sh <Thmanyah-Font-Family.zip>` (official source: thmanyah.com). Outline text in deliverables.

**Other custom / licensed fonts:** if the brand owner has a font that is not on Google Fonts (e.g. a custom Arabic display face), add the `.otf`/`.ttf` files to this folder with their license file, then update `references/visual-system.md` (Typography) and `tokens/voom-tokens.json` (`font`).
