# ISTR showreel

Motion-graphics showreels for the M2 *Ingénierie des Systèmes Temps Réel* syllabus
(Université Paul Sabatier, 2017/2018). Everything is drawn on a canvas as a pure
function of time, captured frame by frame in headless Chromium and muxed with a
synthesized soundtrack.

| Version | Page | Output |
|---|---|---|
| 15 s | `index.html` (`reel.js`, `audio.py`) | `showreel.mp4` |
| 30 s | `long.html?cut=30` | `showreel_30s.mp4` |
| 60 s | `long.html?cut=60` | `showreel_60s.mp4` |

The long cuts share one engine: `engine.js` (helpers, transitions, HUD, post),
`scenes.js` (scene library, each scene stretches to the duration it is given)
and `cuts.js` (the two timelines). Open any page in a browser for a live preview.

## Rebuild

Needs Node with Playwright, Python 3 with `numpy` and `scipy`, and `ffmpeg`
(set `FFMPEG` if it is not on the `PATH`).

```sh
# 15 s
python3 audio.py
node render.js video

# 30 s (use cut=60 / *_60* for the 60 s version)
PAGE=long.html QUERY=cut=30 node render.js timeline timeline30.json
python3 audio_long.py timeline30.json audio30.wav
PAGE=long.html QUERY=cut=30 AUDIO=audio30.wav OUT=showreel_30s.mp4 CRF=18 node render.js video
```

`node render.js stills 1.5 4 12.25` renders single frames to `stills/` for checking.

## Alternative soundtracks (60 s)

`audio_styles.py` builds softer takes on the same timeline and cues:
`ambient` (glass bells and pads), `piano` (generated piano melody),
`lofi` (Rhodes, dusty drums, vinyl crackle) and `pulse` (marimba patterns).
A calmer family keeps a soft heartbeat on every beat and no drums:
`calme` (sparse marimba), `nappe` (warm drone), `horloge` (tick-tock) and
`respiration` (slow two-note marimba ostinato).
The encoded tracks are in `audio/`; swap one onto the video without re-rendering:

```sh
python3 audio_styles.py timeline60.json piano audio_piano.wav
ffmpeg -i showreel_60s.mp4 -i audio_piano.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest showreel_60s_piano.mp4
```

## Sound effects only (60 s)

For a music bed added in editing, `audio_sfx.py` makes effect-only tracks, no melody,
peak-normalised to -6 dBFS: `essentiel` (4 big moments), `transitions` (every scene
change), `accents` (+ key visual events) and `interface` (+ ticks, typing, pops).
Encoded tracks: `audio/sfx_60s_*.m4a`.

```sh
python3 audio_sfx.py timeline60.json transitions sfx_transitions.wav
```
