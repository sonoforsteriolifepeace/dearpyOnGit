"""Sound-effects-only tracks (no music, no melody) to sit under a music bed added later.

    python3 audio_sfx.py timeline60.json transitions sfx_transitions.wav
    levels: essentiel · transitions · accents · interface

Each level adds more cues on top of the previous one:
  essentiel    the four big moments (title, keyword cut, panel zoom, deadline)
  transitions  every scene change: a soft air whoosh, a low thump on hard cuts
  accents      + key visual events (selections, landing digits, the fault, the intro heartbeat)
  interface    + light UI details (ticks, typing, word pops, digit rattles, clock ticks)
Sounds are unpitched or fixed-pitch, peak-normalised to -6 dBFS (mostly silence).
"""
import json
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
TL = json.load(open(sys.argv[1]))
LEVEL = sys.argv[2]
OUT = sys.argv[3]
ORDER = ['essentiel', 'transitions', 'accents', 'interface']
LV = ORDER.index(LEVEL)
D = TL['dur']
N = int((D + .3) * SR)
rs = np.random.default_rng(3)
BUS = np.zeros((2, N))
VERB = np.zeros((2, N))


def tt(d):
    return np.arange(int(d * SR)) / SR


def put(sig, t, g=1.0, pan=0.0, verb=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    for bus, gg in ((BUS, g), (VERB, g * verb)):
        bus[0, i:i + n] += sig[:n] * gg * l
        bus[1, i:i + n] += sig[:n] * gg * r


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return lfilter(b, a, x)


def low(x, fc):
    b, a = butter(2, fc / (SR / 2))
    return lfilter(b, a, x)


def air(d, up=True):
    """Soft whoosh: band-limited noise whose band glides, sin² envelope."""
    t = tt(d)
    k = t / d
    x = rs.standard_normal(len(t))
    out, zi = np.zeros_like(x), None
    for s in range(0, len(x), 1024):
        q = k[s] if up else 1 - k[s]
        c = 500 + 2500 * q ** 1.5
        b, a = butter(2, [c * .6 / (SR / 2), c * 1.6 / (SR / 2)], 'band')
        zi = np.zeros(4) if zi is None else zi
        out[s:s + 1024], zi = lfilter(b, a, x[s:s + 1024], zi=zi)
    return out * np.sin(np.pi * k) ** 2


def thump(d=.45):
    t = tt(d)
    f = 48 + 40 * np.exp(-t * 25)
    return low(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * np.minimum(1, t / .003), 400)


def click(f=1800, d=.04):
    t = tt(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 110) * np.minimum(1, t / .0008)


def pop():
    t = tt(.05)
    f = 900 * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 70) * np.minimum(1, t / .001)


def tail(d=2.5):
    t = tt(d)
    return low(band(rs.standard_normal(len(t)), 150, 2500), 1800) * np.exp(-t * 1.8) * np.minimum(1, t / .02)


TRANS = {'whoosh', 'whoosh2', 'whooshDown', 'sweep', 'zoom'}
cut_scene = {round(s['start'], 3) for i, s in enumerate(TL['scenes']) if i and TL['scenes'][i - 1]['trans']['dur'] == 0}

for t, kind, arg in TL['cues']:
    at_cut = round(t, 3) in cut_scene
    if LV == 0:
        if kind == 'hitBig' or kind == 'hitCut':
            put(thump(), t, .9)
            put(air(.6, False), t, .12, verb=.3)
        elif kind == 'zoom':
            put(air(arg), t, .25, verb=.3)
        elif kind == 'impact':
            put(thump(.8), t, 1.0)
            put(tail(), t, .15, verb=.5)
        elif kind == 'riser' and t > D / 2:
            put(air(arg), t, .2, verb=.3)
        continue
    # --- transitions and up ---
    if kind in TRANS:
        put(air(max(.3, arg)), t, .28 if kind != 'whooshDown' else .22, pan=rs.random() * .6 - .3, verb=.3)
        if kind == 'whoosh2':
            put(air(max(.3, arg), False), t + .03, .14, pan=.4, verb=.3)
    elif kind in ('hitBig', 'hitCut', 'impact') or (kind in ('hit', 'hitS', 'hitFlip') and at_cut):
        put(thump(.8 if kind == 'impact' else .45), t, {'hitBig': .9, 'hitCut': .8, 'impact': 1.0}.get(kind, .6))
        if kind == 'impact':
            put(tail(), t, .15, verb=.5)
    elif kind == 'riser':
        put(air(arg), t, .18, verb=.3)
    elif LV >= 2 and kind in ('hitFlip', 'hit') and not at_cut:
        put(thump(.3), t, .35)
    elif LV >= 2 and kind == 'land':
        put(pop(), t, .22)
        put(thump(.25), t, .2)
    elif LV >= 2 and kind == 'zap':
        z = band(rs.standard_normal(int(.25 * SR)), 800, 5000) * np.exp(-tt(.25) * 14)
        put(z, t, .18, verb=.2)
    elif LV >= 2 and kind == 'heart':
        put(thump(.35), t, .35)
    elif LV >= 2 and kind == 'blip':
        put(pop(), t, .15, pan=rs.random() * .6 - .3)
    elif LV >= 2 and kind == 'wordBlip':
        put(pop(), t, .18)
    elif LV >= 3 and kind in ('tick', 'clockTick'):
        put(click(1900 if (arg or 0) % 2 == 0 else 1500), t, .07, pan=(.25 if (arg or 0) % 2 else -.25))
    elif LV >= 3 and kind == 'type':
        for q in np.arange(0, arg, 1 / 24):
            put(click(2600 + 500 * rs.random(), .02), t + q, .035, pan=rs.random() * .5 - .25)
    elif LV >= 3 and kind == 'rattle':
        q = 0.0
        while q < arg - .02:
            put(click(2200, .02), t + q, .04, pan=rs.random() - .5)
            q += .02 + .08 * (q / arg) ** 2
    elif LV >= 3 and kind in ('hitS', 'hitAcc', 'blipEnd'):
        put(pop(), t, .12)

# light room reverb + peak normalisation (the track is mostly silence, so no RMS target)
irl = int(1.2 * SR)
ti = np.arange(irl) / SR


def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]


for c in (0, 1):
    ir = low(rs.standard_normal(irl), 4000) * np.exp(-ti * 3.5)
    ir /= np.sqrt(np.sum(ir ** 2))
    BUS[c] += conv(VERB[c], ir) * .4
mix = BUS * 10 ** (-6 / 20) / np.max(np.abs(BUS))
fade = np.ones(N)
fade[-int(.2 * SR):] = np.linspace(1, 0, int(.2 * SR))
mix *= fade
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('wrote', OUT)
