# SaaS launch film brief: template + Voom example

## Fill-in template

```text
<inputs>
Product facts I may claim: […]. Do not claim: […].
Assets: logo (vector if possible), real screens/recordings, fonts, music (royalty-free, ~120-130 BPM, clear drop).
If something is missing: use [defaults] and say so.
</inputs>

<direction>
[W]x[H], [fps] fps, exactly [N] s. Keep key content inside a 9:16-safe center.
Look: background [hex], text [hex], accent [hex] (one accent word per line), fonts [Latin] / [Arabic].
One continuous film: each scene grows from the last (shared-element handoffs). One eased camera move per scene.
Springs: subject ζ [0.72] settle [0.35 s]; camera ζ [1.0] settle [0.6 s].
Text rises from a mask line, word by word (Arabic: whole words, right to left).
Banned: crossfades, blur-ins, particles, lens flares, shake, glitch, spinning logo, corner captions/watermarks, fake dashboards, holds > 1 s (except end card).
</direction>

<structure>
BPM [..], beat grid [0.5 s]. Music starts [n] beats before the drop; the drop lands on the product reveal.
[t0–t1] Hook — [what moves] — on-screen: "[exact text]" (accent: "[word]")
[t1–t2] Problem/scope — …
[t2–t3] Reveal (logo) — …
[t3–t4] Feature 1 — the transition itself demonstrates it — "[text]"
…
[tn–end] CTA + logo lockup — hold ≥ 1 s — "[text]" + URL
</structure>

<build>
One HTML file; seek(t) pure function of time; seeded randomness only; one camera container keyed [t, zoom, x, y] (zoom in log space).
Playwright frame-by-frame at [fps], [4] subframes motion blur (ffmpeg tmix), H.264 yuv420p crf 17.
SFX per event on its peak; loudnorm −14 LUFS.
</build>

<gotchas>
Cursor aims where the target will land; ≤ 65 px/frame; tip locked to dragged items.
Outgoing text leaves before incoming text takes its place.
Never fade between two saturated colors; flood or wipe instead.
Start draw-on after any blur-in.
</gotchas>

<start>
Show the storyboard first. Then code. After the first render, check 5 frames around every beat, fix, re-render, then deliver MP4 + source.
</start>
```

## Worked example: Voom SaaS promo (16:9, Arabic VO)

Source: `storyboards/voom-saas-promo/STORYBOARD.md` (frames F01–F19, project footage cut in by the editor between F14 and F15). Brand rules: `voom-brand`.

```text
<inputs>
Claims allowed (from the script): AI-powered PropTech platform; whole project, all units, details and data in one interactive platform; connected to the developer's CRM; works online and offline; master plan to the smallest unit; live, up-to-date data for the sales team.
Needs sign-off before use: "10x sales", "200+ projects sold".
Assets: frames_outlined/F01–F19.svg (layered, one group per word), voom logo PNGs, fonts Gabarito + IBM Plex Sans Arabic, VO track (Arabic). Music: royalty-free, 110-120 BPM, no vocals.
</inputs>

<direction>
1920x1080, 30 fps. Part A ≈ 27 s, footage slot, Part C ≈ 13 s.
Look: deep blue #000024 field with blue #0012d6 glow; off-white #f1f1f1 text; light blue #00b3ff accent (one phrase per line); light section F03–F07 on #f1f1f1 with blue #0012d6 accent.
Eases: launch cubic-bezier(.16,1,.3,1), settle (.22,1,.36,1), glide (.45,0,.15,1). Stagger 0.08 s.
Continuous handoffs: F04's three cards fly together into F05's dashboard; F05 dashboard shrinks into F06's right side; F11 selected unit → link → data card; F12 zoom-through plan → building → unit; F14 push through the tablet screen into the footage; F16 wall → F17 same wall, camera pushes to the empty "مشروعك" tile.
Banned: rainbow/off-palette color, logo effects or distortion, letter-by-letter Arabic, plus the general banned list.
</direction>

<structure>
Hook 0.0–3.2 (F01–F02): orbits + floating feature words → "لكل شركة تطوير عقاري" ; chart line draws, ×2 chip → "عايزة تضاعف مبيعاتها".
Light sweep → 3.2–11.6 (F03–F07): unit grid wave (1,248 units) → three cards on «وحداته / تفاصيله / بياناته» → merge into one dashboard → CRM sync link with traveling dots → online/offline toggle.
Light sweep → 11.6–13.2 (F08): logo sting (streak, mask reveal, swoosh draw, tagline rise).
13.2–26.4 (F09–F13): AI prompt bar types → tilted tablet + pills → data link → 16K zoom-through → live stats tick.
26.4–27.4 (F14): push through the screen → project footage.
After footage (F15–F19): 10x count-up on the drop → +200 wall → empty tile click "مشروعك" → "تجربة أوضح، بيعة أسرع." → logo + URL capsule, hold ≥ 1 s.
</structure>
```
