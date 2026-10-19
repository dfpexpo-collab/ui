# Mado

مهاراتي في الموشن والديزاين وصناعة المحتوى: كل الـ skills والـ agents اللي ضفتها للريبو (من غير skills البراندات زي voom-brand).

> الملف ده بيتبني أوتوماتيك من الريبو. ما تعدّلوش بإيدك: `python3 tools/mado/build_mado.py`

## أنقلهم لأكونت تاني إزاي

الملف ده فهرس، والـ skills نفسها في الريبو `dfpexpo-collab/ui` (ملفات وسكربتات وخطوط، أكبر من إن ملف واحد يشيلها).

1. في الأكونت الجديد، افتح جلسة Claude Code وقوله: **"هات Mado من dfpexpo-collab/ui"**.
2. لو الجلسة على ريبو تاني: هينسخ فولدرات الـ skills والـ agents اللي تحت لـ `.claude/skills/` و`.claude/agents/` في الريبو ده.
3. لو عايزهم في claude.ai (Customize > Skills): هيعمل zip لكل skill ترفعه هناك.

**الإجمالي:** 49 skill و1 agent.

## Agents

| Agent | بيعمل إيه | المكان |
|---|---|---|
| `art-director` | Creative/art director agent that leads every creative project. | `.claude/agents/art-director.md` |

## الإخراج الفني والتخطيط

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `art-director` | Creative / art director that leads every creative project and sits above every design, motion and content skill. | 342 |
| `motion-art-direction` | This skill should be used when the user asks to "direct a motion graphics video", "do creative/art direction for a video", "define a motion language", "set the tone and pacing", "make the animation feel consistent", "de… | 3 |
| `motion-prompt-playbook` | Proven briefs and production rules for code-rendered motion graphics (SaaS / product launch films, UI motion loops, kinetic type, logo reveals), distilled from the most-shared Opus 5.5 motion videos. | 3 |
| `prompt-motion-templates` | Fill-in motion-video brief templates (fields + defaults) for code-rendered videos - showreel, product launch film, one-shape UI morph, app walkthrough, beat-synced launch, slow polished teaser, logo reveal, kinetic type… | 2 |
| `premium-motion-reels` | High-end motion rules for promo Reels and product films (9:16 or 16:9), learned from premium reference films and from a self-review of a first cut that was not good enough. | 1 |
| `od-motion-design` | Apply motion craft to an active task: refine a brief, beat map, visual continuity, typography, pacing, and timeline implementation. | 2 |

## أفلام وفيديوهات المنتج والإعلانات

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `saas-animation` | House method for premium SaaS / product promo films rendered in code (GSAP + Playwright + ffmpeg) from layered SVG storyboards - camera, live gradient backgrounds, varied transitions (pixel reveal, particle dissolve, zo… | 2 |
| `product-film` | Make a showreel-grade product film (landing-page loop, launch video, promo, demo reel, social cut) in code with Remotion, built on the product's own design system, components and voice. | 26 |
| `product-launch-video` | Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. | 37 |
| `launch-video` | This skill should be used when the user asks to "make a launch video", "create a product hype/sizzle film", "build a teaser/trailer for a drop", "do a reveal montage with an end-card CTA", "cut a hero video to the beat"… | 3 |
| `ad-creative-video` | This skill should be used when the user asks to "make a video ad", "create an animated ad", "build a performance/UGC-style ad", "batch-produce ad creative variations", "generate ad variants for A/B testing", "swap headl… | 4 |
| `general-video` | Author or edit a custom HyperFrames composition when no specialized workflow fits, or when BRIEF.md sets flow: companion. | 6 |
| `motion-graphics` | A short, design-led motion graphic where motion is the message — kinetic typography, stat count-up, chart/data-viz hit, logo sting / brand lockup, lower-third / callout / social overlay, animated map (highlight regions,… | 23 |

## موشن: مبادئ وتقنيات

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `animation-principles` | This skill should be used when the user asks to "make this animation feel natural", "fix motion that feels stiff/floaty/cheap", "my animation looks robotic", "choose an easing curve", "how do I use the Graph Editor", "a… | 6 |
| `kinetic-typography` | This skill should be used when the user asks to "animate a headline", "make a kinetic typography video", "do a split-text reveal", "stagger text by character/word/line", "make a lyric or caption video", "animate a varia… | 3 |
| `logo-animation` | This skill should be used when the user asks to "animate our logo", "make a logo intro/stinger", "build a brand reveal", "create an app splash animation", "loop a loader logo", "draw on our SVG mark", "morph an icon int… | 3 |
| `motion-background` | This skill should be used when the user asks to "add an animated background", "build a mesh/gradient background", "make an aurora/shader background", "add constellation/particle background", "animated hero background",… | 3 |
| `beat-sync-editing` | This skill should be used when the user asks to "cut to the beat", "fix the pacing", "edit this sequence", "sync cuts to music/BPM", "add a match cut / J-cut / L-cut", "build a speed ramp", or "plan a shot sequence / ed… | 3 |
| `color-motion` | This skill should be used when the user asks to "build a color palette for a motion piece", "make a gradient background", "animate a color transition", "interpolate colors smoothly", "fix muddy/gray gradients", "convert… | 4 |
| `shot-composition` | This skill should be used when the user asks to "compose a frame", "set up a grid", "plan shot composition", "place the focal point", "decide where elements enter and exit", "add a parallax/camera move", "adapt a layout… | 3 |
| `od-shader-dev` | GLSL shader techniques for ray marching, fluid simulation, particle systems, and procedural generation. | 1 |
| `od-frame-glitch-title` | Digital glitch, chromatic offset, and data-corruption title frame for video transitions or cyberpunk heroes. | 3 |
| `od-frame-liquid-bg-hero` | WebGL-style fluid displacement background with a quote overlay, suited to video intros, landing heroes, or posters. | 3 |
| `od-frame-logo-outro` | Segmented logo assembly, glow bloom, and tagline reveal for video outros or brand closing frames. | 3 |
| `od-video-hyperframes` | Hyperframes / Remotion-compatible continuous frame animation with autoplay support. | 3 |

## HyperFrames

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `hyperframes` | Mandatory entry point: read this first for any request to make, create, edit, animate, or render a video, animation, or motion graphic, including a promo, explainer, captioned clip, title card, overlay, slideshow or int… | 32 |
| `hyperframes-core` | The HyperFrames composition contract — build one renderable project. | 11 |
| `hyperframes-animation` | All animation knowledge for HyperFrames — atomic motion rules, multi-phase scene blueprints, scene transitions, broader motion-design techniques, AND the seven runtime adapters (GSAP default, plus Lottie, Three.js, Anim… | 122 |
| `hyperframes-creative` | Non-animation creative direction for HyperFrames videos. | 79 |
| `hyperframes-keyframes` | Use when a HyperFrames composition needs a punch-in, punch-out, zoom, reframe, Ken Burns treatment, camera move, visual match/whip handoff, or other seek-safe 2D/3D keyframes; also for GSAP, CSS keyframes, Anime.js, WAA… | 3 |
| `hyperframes-cli` | Use the HyperFrames CLI development loop: init, add, catalog, capture, lint, check, snapshot, compare, grade-compare, preview, play, present, beats, keyframes, single or batch render, publish, cloud, cloudrun, feedback,… | 11 |

## Remotion

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `remotion-motion-graphics` | Create and edit professional motion graphics videos with Remotion (React-based video). | 5 |

## GSAP

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `gsap-core` | Official GSAP skill for the core API — gsap.to(), from(), fromTo(), easing, duration, stagger, defaults, gsap.matchMedia() (responsive, prefers-reduced-motion). | 2 |
| `gsap-timeline` | Official GSAP skill for timelines — gsap.timeline(), position parameter, nesting, playback. | 1 |
| `gsap-plugins` | Official GSAP skill for GSAP plugins — registration, ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, ScrambleText, SVG and physics plugins, CustomEase, EasePack, CustomWiggle, CustomBounce… | 1 |
| `gsap-utils` | Official GSAP skill for gsap.utils — clamp, mapRange, normalize, interpolate, random, snap, toArray, wrap, pipe. | 1 |
| `gsap-scrolltrigger` | Official GSAP skill for ScrollTrigger — scroll-linked animations, pinning, scrub, triggers. | 1 |
| `gsap-react` | Official GSAP skill for React — useGSAP hook, refs, gsap.context(), cleanup. | 1 |
| `gsap-frameworks` | Official GSAP skill for Vue, Svelte, and other non-React frameworks — lifecycle, scoping selectors, cleanup on unmount. | 1 |
| `gsap-performance` | Official GSAP skill for performance — prefer transforms, avoid layout thrashing, will-change, batching. | 1 |

## موشن الواجهات (UI)

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `od-animate` | Implement purposeful interface animations: easing, springs, interruption, exits, and reduced motion. | 5 |
| `od-emilkowalski-motion` | Motion-design follow-up skill inspired by Emil Kowalski's animation guidance. | 1 |
| `od-ui-animation` | Implement, review, and measure UI motion. | 24 |
| `od-review-animations` | Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy. | 3 |

## ديزاين ومراجعة الجودة

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `design-qa` | Mandatory self-review for any designed frame, storyboard, slide, social post or UI mockup before showing it to the user - automated layout check (overlapping pills/cards, colliding text, text spilling out of pills, text… | 1 |
| `od-design-review` | Designer Who Codes: visual audit then fixes with atomic commits and before/after screenshots. | 1 |
| `od-emil-design-eng` | This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. | 2 |
| `od-impeccable-design-polish` | Follow-up design polish skill inspired by Impeccable. | 1 |
| `od-mockup-device-3d` | Static iPhone and MacBook 3D-style showcase with real HTML embedded on screens, glass-lens refraction, and 360-degree turntable composition. | 3 |

## جوه مكتبة الـ Art Director

Skills مش متثبتة لوحدها في الريبو، محفوظة في `.claude/skills/art-director/library/` والـ Art Director بيقراها من هناك.

| Skill | بيعمل إيه | ملفات |
|---|---|---|
| `accessibility-review` | Run a WCAG 2.1 AA accessibility audit on a design or page. | 1 |
| `adobe-batch-edit-photos` | Apply consistent photo adjustments across a set of images so they look like they were edited together. | 1 |
| `adobe-create-social-variations` | Resize, crop, or export any image or video into platform-ready social media assets using Adobe Creative Cloud tools. | 1 |
| `adobe-design-from-template` | Create any visual design using Adobe Express templates — flyers, posters, social media posts (Instagram, Facebook, LinkedIn), business cards, invitations, greeting cards, resumes, cover letters, brochures, newsletters,… | 1 |
| `adobe-design-to-pdf` | Find an Adobe Express template, customize its text or background color, and turn it into a print-ready PDF, packet, or shareable link. | 1 |
| `adobe-edit-quick-cut` | Create a punchy highlight cut from a video with Adobe Quick Cut — for requests like "make a sizzle reel", "make a highlight reel", "quick cut this", "cut the best parts", "shorten this video", "make a highlight clip", o… | 1 |
| `adobe-fonts` | Finds, searches, and previews real, licensable Adobe Fonts typefaces: contextual recommendations, direct lookup by name or facets (foundry, designer, style), metadata (language support, weight, foundry), style variants… | 1 |
| `adobe-resize-photos-and-videos` | Resize photos and videos to exact pixel dimensions or aspect ratios using Adobe tools. | 2 |
| `adobe-retouch-portraits` | Bulk-retouch a folder of portrait photos using Adobe tools — designed for wedding photographers and event photographers who need fast, walk-away batch processing. | 1 |
| `algorithmic-art` | Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. | 4 |
| `art-direction` |  | 2 |
| `brand-guidelines` | Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. | 2 |
| `brand-review` | Review content against your brand voice, style guide, and messaging pillars, flagging deviations by severity with specific before/after fixes. | 1 |
| `campaign-plan` | Generate a full campaign brief with objectives, audience, messaging, channel strategy, content calendar, and success metrics. | 1 |
| `canvas-design` | Create beautiful visual art in .png and .pdf documents using design philosophy. | 83 |
| `competitive-brief` | Research competitors and generate a positioning and messaging comparison with content gaps, opportunities, and threats. | 1 |
| `content-creation` | Draft marketing content across channels — blog posts, social media, email newsletters, landing pages, press releases, and case studies. | 1 |
| `creative-brief-to-key-visuals` | Build an ad campaign creative brief and take it through idea generation, mood boarding, sketching and AI key-visual execution, following the Barn's workflow. | 1 |
| `design-critique` | Get structured design feedback on usability, hierarchy, and consistency. | 1 |
| `design-handoff` | Generate developer handoff specs from a design. | 1 |
| `design-system` | Audit, document, or extend your design system. | 1 |
| `designer-skills` | حزمة خارجية، فهرسها في `library/INDEX.md` | 205 |
| `doc-coauthoring` | Guide users through a structured workflow for co-authoring documentation. | 1 |
| `draft-content` | Draft blog posts, social media, email newsletters, landing pages, press releases, and case studies with channel-specific formatting and SEO recommendations. | 1 |
| `email-sequence` | Design and draft multi-email sequences with full copy, timing, branching logic, exit conditions, and performance benchmarks. | 1 |
| `performance-report` | Build a marketing performance report with key metrics, trend analysis, wins and misses, and prioritized optimization recommendations. | 1 |
| `research-synthesis` | Synthesize user research into themes, insights, and recommendations. | 1 |
| `seo-audit` | Run a comprehensive SEO audit — keyword research, on-page analysis, content gaps, technical checks, and competitor comparison. | 1 |
| `theme-factory` | Toolkit for styling artifacts with a theme. | 13 |
| `user-research` | Plan, conduct, and synthesize user research. | 1 |
| `ux-copy` | Write or review UX copy — microcopy, error messages, empty states, CTAs. | 1 |
