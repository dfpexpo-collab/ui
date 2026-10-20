# VOOM × PropTech Summit — Reel film (1080×1920, 40 s)

Built from the storyboard in `../voom-proptech-summit-storyboard.html` (10 scenes).

| Step | Command | What it does |
|---|---|---|
| 1 | `python3 decomp.py <brochure pages dir>` | Splits brochure pages into layers: clean plate, text keyed per word, elements (wheel segments, tower, people, cards, flags). Writes `assets/` + `manifest.json`. |
| 2 | `python3 build.py` | Injects the manifest into `film.html` → `film_built.html`. |
| 3 | `node render.mjs stills 1.5,6,12` / `node render.mjs frames 30 frames` | Renders stills or every frame (each frame is `seek(t)`, a pure function of time). Also writes `sfx.json`. |
| 4 | `python3 audio.py` | Synthesizes the music bed and the sound effects from `sfx.json` → `soundtrack.wav`. |
| 5 | ffmpeg (see below) | Encodes the MP4 with loudness at −14 LUFS. |

```
ffmpeg -framerate 30 -i frames/f%05d.jpg -i soundtrack.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1:LRA=7 -c:a aac -b:a 256k -shortest -movflags +faststart voom_proptech-summit_reel_ar_v01.mp4
```

Fonts: thmanyah sans (installed locally from the brand owner's zip, never committed) and Gabarito (Google Fonts, installed locally). Text styles follow the Text Studio settings (echo + blur, ghosts lead the word, count-ups).
