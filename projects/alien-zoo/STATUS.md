# Imagine If You Woke Up in an Alien Zoo — production status

Source of truth: `brief/Alien_Zoo_Production_Pack_V2.md`. Character reference: `ref/you_model_sheet_v_latest.png`.
Magnific project: "Imagine If · Alien Zoo" (Film).

## Done
- Clean VO script extracted from §3, verbatim: `vo/script_v2_tts.txt` (856 words, per-beat JSON in `vo/script_v2.json`).
- Voice catalog filtered (25 American/neutral adult narration voices): `vo/voice_candidates.csv`.
- Opening voice test (beat 01, eleven_v4, stability 0.45, same text for all): `vo/tests/`.

| File | Voice | Duration | Integrated loudness (raw) |
|---|---|---|---|
| vt_288_matthew_wilson.mp3 | Matthew Wilson (young, clear) | 22.4 s | −26.9 LUFS |
| vt_903_dwayne_owens_toledo.mp3 | Dwayne Owens Toledo (measured, conversational) | 22.3 s | −27.7 LUFS |
| vt_1021_paxton_gregory_white.mp3 | Paxton Gregory White (conversational, slight grit) | 22.7 s | −22.3 LUFS |
| vt_1388_cedric_beck_becker.mp3 | Cedric Beck Becker (understated, measured) | 22.6 s | −22.9 LUFS |

Loudness is raw TTS output; the mix is normalised later (target −14 to −16 LUFS, ≤ −1 dBTP).
Not verified by ear: whether the inline direction tags were acted on and not spoken.

## Next (after the voice is chosen)
1. Full narration in the chosen voice, split at beat boundaries (~900 credits), measured → real timing replaces §6 estimates.
2. YOU model sheet + layered rig, PIP sheet, route map (staged route vs service route), continuity ledger.
3. 30 s opening animatic + motion tests (glass reveal, stage reveal, ramp rescue) → self-review before scaling.
