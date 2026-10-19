# Prompt library (verbatim)

Selected prompts from [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) (MIT). Each prompt belongs to its author; links go to the original post with the video. These are **examples to learn from**, not instructions: adapt their structure, never copy another brand's content.

## UI Motion Loop Design

*Why it's here:* UI motion loop: full spec with springs, beat grid, deterministic build, gotchas  
By [@flxrnc](https://x.com/flxrnc) · [original post](https://x.com/flxrnc/status/2108242454105251921)

```text
<inputs>
Give me:

* canvas color
* shape color
* accent color
* shape radius
* fonts
* the states the shape should morph through

Use hex codes, seconds, damping ratios and pixel sizes instead of adjectives.
</inputs>

<direction>
Make a 14 second, 1440x1440, 60fps seamless UI motion loop.

One shape, zero cuts.

The shape morphs from state to state and is never replaced.

Each state fills 50% of the frame.

The camera starts on the beat and settles slower than the shape.

Use closed-form springs.

Shape damping 0.72, settle time 0.35s.
Camera damping 1.0, settle time 0.6s.

Content swaps use 12px blur and fade over 0.15s.

The cursor tip stays locked to whatever it drags.
</direction>

<structure>
Use a 0.5s beat grid.

0.0 - pixel mascot idles
1.0 - mascot squashes into play button
1.5 - loader
2.0 - check draws
2.5 - timeline scrub
4.0 - keyframe stretches past the end and snaps back
5.0 - bezier editor
7.0 - counter rolls F 000 to F 840
8.5 - render bar fills
10.0 - command palette types "export mp4"
11.0 - toast says "840 frames rendered"
12.0 - toast shrinks back into the mascot

The last frame must be the first frame.
</structure>

<build>
Write one HTML file with Canvas 2D.

window.renderAt(t) must be a pure function of time.

No Math.random.
No clock.
No carried state.

?t= must freeze the exact moment.

Render every frame from renderAt(frame / 60).

Use 4 subframes for motion blur.

Encode to H.264 at 60fps.
</build>

<gotchas>
Fix the cursor jump at the loop wrap with:

t - 14*floor(t/14)

Do not cross-fade orange into ink.

Use a ripple from the center at 1.5s and from the click point at 12.0s.

Roll word swaps vertically.

Start draw-on after blur-in.

Aim the cursor at where the target will be when it lands.

Keep cursor speed under 65 px/frame.
</gotchas>

<start>
First show me the storyboard.

Then write the code.

After the first render, check 5 frames around every beat and fix the issues before the final render.
</start>
```

## Food Craving Product Launch Film

*Why it's here:* 15 s product launch film: one continuous take, shared-element handoffs, beat structure  
By [@ultimaxbt](https://x.com/ultimaxbt) · [original post](https://x.com/ultimaxbt/status/2108210884799549714)

```text
<inputs>
Ask me for: my product, the exact request a user types into it, 6 to 8 photos for the result cards, a royalty-free song around 130 BPM with a clear drop (Mixkit, free for commercial use), and my brand mark for the end card. If I skip anything, use the defaults: the food-ordering story below, food photos from Pexels (fire noodles, birria tacos, hot chicken, buffalo wings, smash burger, spicy ramen), and Mixkit "Cat Walk".
</inputs>

<direction>
A 15-second product launch film, 1920x1080 at 60fps. 2D only, one continuous take. No fades, blurs or cuts: each scene grows from the last. Text rises from a mask line, buttons expand into pages, and color floods from one object before shrinking into another. Give the camera one eased move per scene, and never zoom in and out consecutively.

Look: warm white canvas (#f5f5f2), black UI (#0e0e10), lime accent (#cdf24f), orange (#ff6a2a), and a blue send button (#2f6bff). Add an Apple Intelligence-style iridescent glow around the input: a blurred conic gradient rotating through pink, orange, lime, cyan and violet. Use real food photography on dark cards, Geist for UI and a serif for the product name on the end card.

Banned: crossfades, blur-ins, 3D, particles, camera moves that reverse direction, holds longer than 1s, anything that feels like a template.
</direction>

<structure>
130 BPM, 32 beats (14.8s). Start the song 12 beats before its drop.

Beats 0-6, ask: push slowly into the glowing composer, about 3x zoom. Type the request over three fixed lines with a natural keystroke rhythm:
"I'm really hungry, I don't know
what I want but something
spicy, crispy and filling"

Beat 6, send: press the send button. A lime ripple spreads from it and transforms the message into a chat bubble. Pull back once to reveal the phone around it (428x900 screen, 11px black bezel, 9:41 status bar).

Beats 6-12, think: the send button grows into an orange wok, a half-disc with a thin handle. It tosses 6 colorful ingredients on beats 8, 9, 10 and 11 beneath the shimmering text "Finding something for you…".

Beat 12, the drop: a lime circle expands from the wok to fill the frame in about 0.35s. Dark food cards (330x440, radius 28, photo on top, name, one-line description, price and rating) burst in from the center. Slide the strip across three cards and land on "Fire Noodles", which lifts with a "Best match" pill.

Beats 16-21, chat: the lime contracts back into the user's bubble, carrying its words as the chosen card flies into its slot. "Found it. Fire Noodles from Wok & Fire, smoky, spicy and seriously filling." rises in, followed by "Want me to order it for you?" Then show two pills: "Order now" in black and "More options" outlined. The cursor clicks Order now → spinner → "✓ Ordered".

Beats 21-32, outro: the black button expands into the page, staying pill-shaped as it reaches the edges while the camera pushes into it. Its label grows to headline size, then slides away. Bring in "You were craving noodles." and "Now it's on the way." word by word (92px, white on black). A courier dot follows a route to a pin. The pin becomes the brand mark, and the wordmark wipes out from behind it, with "made with" above and the product name below.
</structure>

<build>
1. One HTML file, 1920x1080. Compute every style from time inside seek(t): no CSS transitions, timers or state carried between frames.
2. Use one camera transform on a container, keyed by [time, zoom, x, y] with eased segments and zoom interpolated in log space.
3. Use closed-form step-response springs for every pop and settle.
4. Make every handoff a shared element: the lime flood carries a copy of the bubble's words, and the button carries its label into the page.
5. Sound: use a downloaded Mixkit SFX for each event - typing, send pop, each toss, drop impact, card swoosh, click, success tone, page-fill whoosh and mark sparkle. Place each by its measured peak and loudnorm to -14 LUFS.
6. Render with Playwright at 60fps using 8 subframes per frame, blended with ffmpeg tmix. Review every fast moment frame by frame and scan the full video frame by frame.
</build>
```

## Opus 5.5 video by @brainextends

*Why it's here:* 18 s premium product film: art direction, timed shots, persistent element, motion quality rules  
By [@brainextends](https://x.com/brainextends) · [original post](https://x.com/brainextends/status/2103801834930606193)

```text
Create a complete, polished Spotify-themed motion graphics video from the following brief. This prompt is self-contained: no reference video or supplied assets are required.

<deliverables> An 18-second MP4 at 1920×1080 and true 60 fps, with music and subtle sound effects Complete editable source Build, render, inspect, and refine the animation before delivering it Do not stop at a storyboard, still images, or an implementation plan </deliverables>
<art_direction>
A premium music-product film presented inside a large, nearly black rounded rectangular stage
The stage occupies roughly 80% of the canvas width and 75% of its height, centered horizontally and slightly below the vertical center
Outside the stage, use a soft atmospheric green background: luminous emerald near the upper-left corner, deeper forest green toward the sides, fading to near-black at the bottom
Inside the stage:
Near-black background
White primary typography
Muted gray secondary text
Spotify green # 1ED760 for emphasis and controls
One clean sans-serif font, such as Geist or Inter
Consistent icon strokes and restrained shadows
Keep compositions compact and centered, with substantial negative space
Text should feel like music-product advertising, not oversized presentation headings
Do not add an outer caption, creator watermark, decorative footer, or progress counter
</art_direction>

<artwork> Create original square album artwork for a fictional track called “Glass Tides” by “AURA”
The hero cover is an abstract macro image of flowing pearlescent liquid silk and molten glass
Use pastel lavender, powder cyan, blush pink, champagne gold, and subtle mint
Include broad three-dimensional folds, realistic reflective highlights, delicate striations, and a prominent sweeping S-shaped fold
Fill the square edge to edge
No text, logo, or border on this hero artwork
Use this same artwork consistently throughout the film

Create additional designed playlist sleeves:
“Late Nights” in mustard yellow
“Good Energy” in pink
“Deep Focus” in blue
“Daily Mix 1”, “Daily Mix 2”, and “Daily Mix 3” in complementary colors

These should look like finished graphic-design covers, with bold typography and simple geometric motifs
</artwork>

<timeline> 0.0–0.6 seconds: A green Spotify icon grows smoothly into the center of the dark stage Give it a confident arrival with minimal overshoot
0.6–1.5 seconds:
The icon transitions into a small Spotify identity above two centered lines:
“Discover”
“new music”
The first line is white; the second is green
Reveal them with short masked vertical movements
1.5–2.4 seconds:
A stylized Spotify desktop interface rises into view
Show a slim sidebar, “Made for you”, three album cards, and small supporting rows
Use a subtle perspective tilt during the entrance, settling toward a frontal view
2.4–3.2 seconds:
Move closer to the three featured covers
Show “New for you” above them
Keep the artwork crisp, with short album titles beneath
A narrow rounded player bar now anchors the bottom of the stage
3.2–4.0 seconds:
The featured cards withdraw into a compact “Fresh finds” list
Reveal four song rows with a slight stagger
Each row contains a thumbnail, short track title, artist, and a small menu icon
4.0–4.9 seconds:
Transition into a horizontal strip of colorful playlist covers
Heading: “Every mood”
Supporting line: “Find what moves you”
The strip slides smoothly sideways, with edge cards partially cropped by the stage
4.9–5.8 seconds:
A compact search field appears
Type “Glass Tides”
Reveal one selected result beneath it, with the iridescent artwork, “AURA”, and a green play icon

5.8–6.6 seconds:
The selected artwork expands into a large centered cover
Reveal “Glass Tides” underneath, followed by “AURA” in green
Keep the player bar visible
6.6–7.5 seconds:
The same cover slides left
Track information appears on the right:
“Glass Tides”
“AURA”
“A new frequency”
Add a rounded green Play button
Coordinate the cover movement and text reveals
7.5–8.3 seconds:
A brief brand-color transformation fills the inner stage with green
The artwork contracts into a smaller centered tile
Place a small dark Spotify identity underneath
The player briefly recedes
8.3–9.8 seconds:
Return to the dark stage
The same artwork expands dramatically toward the camera, becoming oversized and cropped by the rounded stage
Restore the player at the bottom
Use controlled motion blur during the fastest part of the zoom

9.8–11.2 seconds:
The artwork clears into a centered typographic statement:
“Find your”
“rhythm”
Use white for the first line and green for the second
The player remains visible and stable beneath it
11.2–12.5 seconds:
Show “Made for your every day”
Three playlist sleeves enter with gentle perspective and small opposing tilts
They spread into six smaller sleeves across the stage
Supporting line: “Your sound, always evolving”

12.5–14.0 seconds:
The playlist layout transitions into four floating album covers
Include the iridescent hero artwork
Use restrained rotation, perspective, depth ordering, and overlap
Keep their movement coordinated rather than randomly floating
14.0–15.2 seconds:
The covers converge toward the center and fold around a green Spotify icon
The artwork withdraws as the icon becomes the focal point
Fade the player away
The Spotify icon must emerge from the same central position as the converging covers
15.2–18.0 seconds:
The icon moves slightly left and settles beside a large white “Spotify” wordmark
Keep the icon and letters separated throughout the movement
Reveal:
“Discover new music”
“every day”
The first line is white; the second is green
Hold the finished composition cleanly through the end
</timeline>
<persistent_player>
For most of the middle sequence, keep one narrow rounded player bar near the bottom of the inner stage
Include:
Small hero-art thumbnail
“Glass Tides” and “AURA”
Play and skip controls
A thin progress track
A small volume icon
Subdued dark translucent styling with a fine border
This recurring player connects the changing shots
It must remain visually secondary to the artwork
</persistent_player>

<motion_quality>
Match the energy of a tightly edited premium product film
Most visual ideas last approximately one second, but transitions remain smooth
Use continuous acceleration and deceleration
Favor critically damped springs or carefully tuned smooth easing
No repeated bouncing or large elastic overshoots
Preserve the hero artwork’s identity and position relationships through search, album detail, brand tile, and zoom
Use match-position transitions, coordinated scaling, masked reveals, and perspective
Outgoing titles must disappear before incoming titles occupy the same space
Avoid overlapping text, sudden camera resets, long blank intervals, and arbitrary full-frame crossfades
Clip every oversized cover and camera move cleanly to the rounded stage
No particles, shockwave rings, lens flares, camera shake, or unrelated stock footage
</motion_quality>

<audio> Create or select commercially usable electronic music around 120 BPM Use a clean pulse, warm bass, restrained melodic elements, and subtle transition accents Align important entrances, selections, zooms, and the logo reveal with musical events Keep effects quieter than the music No voiceover Do not use copyrighted commercial tracks without permission </audio>
<implementation_and_validation>
Build a deterministic animation driven by absolute time through an async window. seek(t) function
Every transform, opacity, mask, and UI state must be reproducible when seeking frames in any order
Do not depend on live timers, accumulated physics, or CSS transition state during export

Render true 60 fps with spatial antialiasing
Use 3–5 temporal subframe samples per output frame for restrained motion blur
Keep stationary text and artwork sharp
Inspect contact sheets and moving playback
Check the fast heading changes, artwork handoffs, zoom, cover convergence, and final wordmark spacing
Verify evenly spaced frame timestamps and the full 18-second duration
Fix visual defects before delivering the final MP4 and editable source
</implementation_and_validation>
```

## Opus 5.5 video by @HowDevelop

*Why it's here:* 15 s dev-tool launch film: every transition demonstrates a feature, accuracy guardrails  
By [@HowDevelop](https://x.com/HowDevelop) · [original post](https://x.com/HowDevelop/status/2103840883812733090)

```text
Create and render a 15-second motion graphics video introducing TanStack AI. Make it feel like a premium            
  developer-tool launch film produced by Studio1: fast, precise, visually surprising, and polished enough to open a   
  keynote or lead a social campaign.                                                                                  
                                                                                                                      
  Use the TanStack AI feature details below as the source of truth. Studio1 is presenting the film; do not imply      
  Studio1 built TanStack AI.                                                                                          
                                                                                                                      
  Format and deliverables                                                                                             
  - 1920×1080, 30 fps, exactly 15 seconds; keep important content within a 9:16-safe central area.                    
  - Deliver the rendered MP4 and the editable project/source. Use Remotion or another code-based motion graphics      
  workflow if available.                                                                                              
  - Use real, editable typography and vector-style graphics. Do not rely on AI-generated text inside images.          
  - Add an original electronic sound design: a restrained opening pulse, tightly synchronized transition hits, rising 
  - Add an original electronic sound design: a restrained opening pulse, tightly synchronized transition hits, rising 
  momentum, and a satisfying final resolve. The story must also work muted.                                           
                                                                                                                      
  Visual direction                                                                                                    
  Dark graphite canvas; luminous gradients and controlled flashes inspired by TanStack’s identity. Crisp typography,  
  kinetic code, layered interface fragments, streaming data, branching paths, and smooth camera moves with convincing 
  depth. High contrast and immaculate spacing. Every transition should visually demonstrate a feature, rather than    
  simply replace one title card with another. Keep all on-screen wording brief and legible. Avoid generic stock       
  footage, spinning logos, fake dashboards, excessive glitch effects, and tiny code nobody can read.                  
                                                                                                                      
  Exact 15-second sequence                                                                                            
  - 0:00–0:02 — Hook: A single prompt cursor blinks. It sends one signal that expands into a network of               
  possibilities. On-screen: “What can one AI API become?”                                                             
  - 0:02–0:04 — Core and providers: The signal resolves into chat(); provider nodes connect and swap rapidly without  
  breaking the central flow. On-screen: “chat() · 24 providers”                                                       
  - 0:04–0:06.5 — Multimodal: One continuous stream transforms into text, waveform, image frame, and video timeline.  
  On-screen: “One pattern. Every modality.”                                                                           
  - 0:06.5–0:09 — Agents and tools: The stream branches into sandboxed agent runs, then reaches external tools        
  through MCP. Show distinct runs progressing in parallel. On-screen: “Agents · Sandboxes · MCP”                      
  - 0:09–0:11.5 — Reliability: An interrupted stream freezes, reconnects, and resumes from the same point; a clean    
  type-check confirmation snaps into place. On-screen: “Persistent. Durable. Type-safe.”                              
  - 0:11.5–0:15 — Reveal: All paths converge into a bold final composition: “TanStack AI” followed by “Build what’s   
  next.” Add a small “A Studio1 film” credit, visually subordinate to TanStack AI. Hold the final frame long enough   
  to read it.                                                                                                         
                                                                                                                      
  Accuracy guardrails                                                                                                 
  The supplied article says TanStack AI is in the release candidate phase, supports 24 providers, uses AG-UI, and     
  offers composable chat(), media generation, sandbox and agent-harness primitives, MCP, type safety, persistence,    
  and resumable streams. Do not call it a stable v1 release. Do not present planned orchestration features as already 
  shipped.                                                                                                            
                                                                                                                      
  Make the video, inspect the rendered result, and fix any clipped text, weak transitions, mistimed beats, or         
  unreadable frames before delivering it. The goal is a memorable showreel, not a slideshow of feature bullets.
```

## Widget Animation Motion Design

*Why it's here:* Card / widget entrance choreography  
By [@Khlaseek_dsgner](https://x.com/Khlaseek_dsgner) · [original post](https://x.com/Khlaseek_dsgner/status/2108167809997877659)

```text
the card should scale in from 30% to 100% scale and it should go from Invisible to visible. every detail slide in orderly one after the other when the card settles in scale. the graph line animates in like a line path. the glow at the back becomes visible as the card details slides in. the two rectangles move accross the screen at slightly different timing giving it this light effect.
```

## Opus 5.5 video by @Mounnna

*Why it's here:* Logo slow-reveal: wireframe → shards assemble → type brand name  
By [@Mounnna](https://x.com/Mounnna) · [original post](https://x.com/Mounnna/status/2103802871934497266)

```text
Create a motion design video of a slow-reveal transition. Draw the logo as a wireframe first, then fly in faceted low-poly shards one by one until they assemble the logo. Finish by bringing in the app icon background and typing out the brand name.
```

## Opus 5.5 video by @wani_shola

*Why it's here:* Showreel from a real website: premium brand rules, cut on the beat  
By [@wani_shola](https://x.com/wani_shola) · [original post](https://x.com/wani_shola/status/2103769906638459278)

```text
Make a showreel-style motion graphics video for my portfolio website, 
http://
sholajegede.com, using Remotion. It should show what I do as a developer relations engineer, like a showreel for my résumé.

- Use as much of the real website as possible: capture the pages and sections in a browser (home, Ask, package pages, Hire, mobile view, dark mode) and animate them inside browser and phone frames.
- Show the site's chat answering real questions about my work, with the questions and answers large and bold. Use only facts and numbers that are on the site.
- Follow premium brand rules: three colours and the site's own fonts, one idea per shot, key objects centred, space to breathe, eased motion only, smooth transitions instead of hard cuts, and a rhythm that speeds up and slows down with the story.
- Add music at about 120 BPM (elite, kinetic, sophisticated) and cut every scene on the beat. No extra sound effects.
- 1920×1080, about 90 to 100 seconds, ending on the website and my contact email.
```

## Opus 5.5 video by @HO_BA

*Why it's here:* Product intro: break screenshots into components and animate them  
By [@HO_BA](https://x.com/HO_BA) · [original post](https://x.com/HO_BA/status/2103845264649761062)

```text
Make a dynamic 30-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.  Make it a video to introduce 
https://
mdfor.dev Use actual product screenshot/logo/assets Must have music and motion must match the music  Do it like a real professional production video, not like a demo or prototype. Add more animation and motion design; avoid using screenshots as raw; instead, break them down into components/icons so we can animate those too. Make the motions more juicy. Use the best motion design techniques you can.
```

## Opus 5.5 video by @gouthamjay8

*Why it's here:* SaaS launch video from a real product's assets  
By [@gouthamjay8](https://x.com/gouthamjay8) · [original post](https://x.com/gouthamjay8/status/2103816261339910269)

```text
I want you to create a highly professional SaaS product launch video. Go and look up [website] Pick that, and then make sure to get actual assets and images and all of that stuff from the internet. Turn it into these typical, very professionally edited, motion-graphics-styled product launch videos that you see people making on Twitter when they launch new SaaS products (which are showing off the features, the benefits, and all of these things). It should show what an incredible motion designer you are, like it's your showreel for a resume. Go all out.
```

## SaaS Launch Video Animation

*Why it's here:* SaaS launch: zooms, cursor, typing, app interaction, angles  
By [@Screeendev](https://x.com/Screeendev) · [original post](https://x.com/Screeendev/status/2108333630623981790)

```text
Using Remotion which i downloaded, Can you make me a Launch video for the app.
Use the repo for information.

I need a SaaS styled 15-30 second launch video, with zooms , cursor, typing, interaction with the app, showcase, different angles of the app, etc. 

basically a full
```

## Opus 5.5 video by @souravbhar871

*Why it's here:* Avoid AI-giveaway corner frames and texts  
By [@souravbhar871](https://x.com/souravbhar871) · [original post](https://x.com/souravbhar871/status/2103711849703477361)

```text
make a dynamic 10-second motion graphics video that shows who are you as Opus 5.5 - be as creative and dynamic as possible. Avoid the frames and texts on the corners which are typical ai made giveaways!
```
