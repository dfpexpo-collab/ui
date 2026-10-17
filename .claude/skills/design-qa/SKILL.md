---
name: design-qa
description: Mandatory self-review for any designed frame, storyboard, slide, social post or UI mockup before showing it to the user - automated layout check (overlapping pills/cards, colliding text, text spilling out of pills, text cut by the edge) plus a visual checklist for alignment, centring in containers, even spacing, mixed Arabic/Latin text and number alignment. Use after generating or editing any SVG/HTML design, and whenever the user points out a layout mistake.
---

# Design QA

Run this before every hand-off of visual work. The user should never be the one to find an overlap, a number outside its box or a broken RTL line.

## 1. Automated check (always)

```bash
node tools/design-qa/check_layout.js <frames dir or svg files>
```
(needs Playwright; in a cloud session set `NODE_PATH` to where it is installed.)

It flags, per frame:
- **OVERLAP**: sibling pills, cards, tiles or icon tiles colliding. One element fully inside another is fine; partial overlap is a bug.
- **TEXT×TEXT**: two texts whose boxes collide.
- **SPILL**: text running outside a pill or badge, or closer than 6px to its edge.
- **CUT**: text leaving the canvas.

Fix every flag at the source (the generator), regenerate, and rerun until it exits 0. A flag you keep on purpose needs a one-line reason in your reply.

## 2. Visual checklist (render once, look at the contact sheet)

- **Rows of pills/chips/buttons**: sized to their labels, with an even gap and centred as a group. Never place them on fixed centres; lay them out from measured widths (see `pill_row` in `storyboards/voom-saas-promo/build_frames.py`).
- **Numbers and values in cards**: centred in their card or aligned to a shared edge with the label. A value anchored at one edge drifts out of the box when it gets longer.
- **Tables and sheets**: column widths add up to the table width; header and cells share the same centre or edge; nothing spills past the last column.
- **Mixed Arabic and Latin**: file names, codes and units set as separate runs or in one script. Check that `.xlsx`, `m²`, `CRM` and the digits land on the correct side.
- **Hierarchy**: one focal point; the headline reads first. Small text is at least 16px at 1920 wide.
- **Spacing**: equal gaps between repeated cards; the same inner padding in sibling cards; margins kept clear of the frame edge.
- **Brand**: palette, fonts and logo rules from the brand skill (e.g. `voom-brand`).

## 3. Motion previews

When text animates, check a frame mid-entrance and a frame after it settles:
- Echo copies lead the word.
- Typewriter text fills its field before the scene ends.
- Counters end on the exact value and stay inside their card.

## Related skills

`design:design-critique` (structured critique), `design:accessibility-review` (contrast and size), `shot-composition` (grids and safe areas), `voom-brand` (`references/qa-checklist.md`).
