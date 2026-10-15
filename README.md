# Voom brand kit

Claude Code skill for the Voom brand (Proptech & Digital Twin Innovation). Call it with `/voom-brand` for ideas, designs, layouts, storyboards, video motion specs, copy (AR/EN) and brand reviews.

Skill: `.claude/skills/voom-brand/`

| Path | What |
|---|---|
| `SKILL.md` | Entry point, workflows, hard rules |
| `references/` | Brand foundations, visual system, layouts, features catalog, storyboard + motion, ideas + copy, QA checklist |
| `assets/logo/` | Transparent logo PNGs (white/black, full/wordmark) |
| `tokens/` | `voom.css`, `voom-tokens.json` |
| `templates/` | Post, story, feature sheet, storyboard (HTML/MD) |
| `reference/` | Page renders of the brand book and the product feature sheets |

Official source: Voom Brand Guidelines 2026 + New Features sheets. The motion language is **proposed** (the book has no motion chapter).

## Third-party motion skills (for code-rendered video)

Copied as-is into `.claude/skills/` so Claude can build the animation as HTML + GSAP and render it to MP4.

| Skills | Source | License |
|---|---|---|
| `hyperframes`, `hyperframes-core`, `hyperframes-animation`, `hyperframes-cli`, `hyperframes-creative`, `hyperframes-keyframes`, `motion-graphics`, `product-launch-video`, `general-video` | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) @ `76222e4` | Apache-2.0 |
| `remotion-motion-graphics` (skill folder only, demos left out) | [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) @ `1dcbe5e` | MIT |
| `gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`, `gsap-utils`, `gsap-scrolltrigger`, `gsap-react`, `gsap-frameworks` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) @ `aed9cfd` | MIT |

Update with `npx hyperframes skills update` / `npx skills add https://github.com/greensock/gsap-skills`.
