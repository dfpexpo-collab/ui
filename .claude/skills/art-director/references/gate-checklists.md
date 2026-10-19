# Gate checklists (with the why)

Use with SKILL.md §3. Each line: check → how to see it → typical fix.

## A. Composition and design
| Check | How to see it | Fix |
|---|---|---|
| Matches the approved reference | Side-by-side: reference frame vs final frame at the same moment, same scale | Rebuild the layer from the reference (plate, ground, crop) |
| Cut-out fringes / leftover background | Composite every RGBA layer on magenta and look at edges | Key only background blobs touching the outside; feather 1-2 px |
| Hard plate edges | Look for straight lines that are not in the reference | Feather, extend or remove the plate |
| Empty frame edges | Check all four edges in the final second of each scene and while layers drift | Extend the layer past the frame by the drift distance + 50 px |
| Focal point | Squint test: one thing should win | Reduce competing contrast/size |
| Safe areas (9:16) | Overlay guides at y 220 and y 1540 | Move copy inside |

## B. Typography and copy
| Check | How to see it | Fix |
|---|---|---|
| Live text, brand font | Zoom 200 % on glyph edges; eroded or jagged = keyed bitmap | Rebuild as text, fit to the original box |
| Ghost / baked text underneath | Freeze a frame mid-reveal; anything legible behind the live text? | Erase copy from the plate/photo below |
| Arabic shaping and kashida | Compare word by word with the reference; count tatweels (Thmanyah tatweel ≈ 0.12 em each) | Match count and position; bold/size as the reference |
| Word spacing | Descender tails (ي) touching the next word | Add ~0.1-0.15 em word spacing |
| Facts | Read every number, date, code, phone, URL against the source | Correct |

## C. Brand
Logo: right version (wordmark vs full lockup and the right tagline), clear space ≥ height of the "O" counter, no stretching, only in the scenes the brief allows. Colours from tokens.

## D. Motion
| Check | How to see it | Fix |
|---|---|---|
| Copy moves after landing | `scripts/text_stability.mjs` → any flagged element, or 10 consecutive frames of a crop | Move copy out of the camera layer; remove drift on text |
| Counter width | Watch the line around the number while counting | `font-variant-numeric: tabular-nums` + min-width of the final value |
| Echo / doubled text | Frames across every transition and reveal | Outgoing clears first; no duplicate echo layers |
| Empty / grey transition frames | 10 frames −0.4…+0.4 s around each cut | Overlap scenes, next scene already moving |
| Dead holds | Contact sheet at 2 fps: identical neighbours | Add a living hold (sheen, ping, drift on imagery) |
| Easing | Scrub: constant speed = linear | Expo/launch-out for entries, accelerate for exits |
| Variety and hero | List entrance and transition types per scene | Vary; give each scene one hero move |
| Brief compliance | Re-read the user's per-scene brief | Implement exactly what was asked |

## E. Technical
Resolution/aspect via ffprobe; no upscaled logos (source ≥ 2× display size); check seams where layers meet; frame count = duration × fps.

## F. Audio
`scripts/audio_check.sh`: integrated LUFS, true peak. Spot-check hits against events (scrub with waveform). Remove sounds without a visual reason.
