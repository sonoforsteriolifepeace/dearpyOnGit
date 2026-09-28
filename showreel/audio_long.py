"""Soundtrack for the long cuts, generated from the timeline that render.js exports.

    python3 audio_long.py timeline60.json audio60.wav

The music bed (A minor, i-VI-III-VII, 120 BPM) follows each scene's `energy`
(0 intro/outro, 1 reading, 2 groove, 3 peak); every visual cue gets its own
sound effect, so cuts, words and landing digits stay in sync with the picture.
"""
import json
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
TL = json.load(open(sys.argv[1]))
OUT = sys.argv[2] if len(sys.argv) > 2 else 'audio_long.wav'
D = TL['dur']
N = int((D + .1) * SR)
rs = np.random.default_rng(5)

FX = np.zeros((2, N))
MUS = np.zeros((2, N))
VERB = np.zeros((2, N))
KICKS = []


def tt(d):
    return np.arange(int(d * SR)) / SR


def put(bus, sig, t, g=1.0, pan=0.0, verb=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    bus[0, i:i + n] += sig[:n] * g * l
    bus[1, i:i + n] += sig[:n] * g * r
    if verb:
        VERB[0, i:i + n] += sig[:n] * g * verb * l
        VERB[1, i:i + n] += sig[:n] * g * verb * r


def lp(x, fc, order=2):
    b, a = butter(order, min(fc, SR * .45) / (SR / 2))
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'high')
    return lfilter(b, a, x)


def sweep_lp(x, f0, f1, curve=1.0):
    """Low-pass whose cutoff glides from f0 to f1 (block-wise, filter state carried over)."""
    out, zi, blk = np.zeros_like(x), None, 512
    for s in range(0, len(x), blk):
        k = (s / max(1, len(x) - 1)) ** curve
        b, a = butter(2, min(f0 + (f1 - f0) * k, SR * .45) / (SR / 2))
        if zi is None:
            zi = np.zeros(max(len(a), len(b)) - 1)
        out[s:s + blk], zi = lfilter(b, a, x[s:s + blk], zi=zi)
    return out


def noise(d):
    return rs.standard_normal(int(d * SR))


# ---------------- instruments ----------------
def kick(big=False):
    t = tt(.6 if big else .38)
    f = 42 + (160 if big else 120) * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (3.5 if big else 8))
    return np.tanh(2.2 * s) + noise(len(t) / SR) * np.exp(-t * 400) * .25


def sub(d=1.8):
    t = tt(d)
    f = 36 + 22 * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6) * np.minimum(1, t * 200)


def crash(d=1.6):
    t = tt(d)
    return hp(noise(d), 4000) * np.exp(-t * 2.6)


def hat(open_=False):
    d = .25 if open_ else .05
    t = tt(d)
    return hp(noise(d), 7000) * np.exp(-t * (18 if open_ else 90))


def clap():
    t = tt(.3)
    x = lp(hp(noise(.3), 900), 3500)
    e = sum(np.exp(-np.clip(t - o, 0, None) * 120) * (t >= o) for o in (0, .009, .019)) + .5 * np.exp(-t * 14)
    return x * e


def tick(f=2600, d=.03):
    t = tt(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 160) + hp(noise(d), 5000) * np.exp(-t * 400) * .4


def blip(f, d=.16):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 26)


def whoosh(d, up=True):
    t = tt(d)
    k = t / d
    env = np.sin(np.pi * k) ** 2
    return sweep_lp(noise(d), 300 if up else 9000, 9000 if up else 400, 2 if up else .5) * env


def riser(d):
    t = tt(d)
    k = t / d
    return sweep_lp(noise(d), 200, 12000, 3) * k ** 2.5


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def bell(f, d=2.4):
    t = tt(d)
    s = np.zeros_like(t)
    for m, a, dc in [(1, 1, 1.6), (2.0, .5, 2.4), (2.76, .35, 3.2), (5.4, .2, 5), (8.93, .1, 7)]:
        s += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dc)
    return s * np.minimum(1, t * 800)


def pluck(f, d=.4):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 12) + .15 * np.sin(6 * np.pi * f * t) * np.exp(-t * 18)
    return s * np.exp(-t * 9) * np.minimum(1, t * 600)


def pad(freqs, d, cutoff=1400):
    t = tt(d)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-.004, 0, .0045):
            s += saw(f * (1 + det), t + rs.random())
    s = lp(s, cutoff)
    env = np.minimum(1, t / .25) * np.clip((d - t) / .35, 0, 1)
    return s * env / (3 * len(freqs))


def zap():
    t = tt(.35)
    f = 1800 * np.exp(-t * 9) + 90
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5
    return lp(tone + hp(noise(.35), 2000) * .6, 7000) * np.exp(-t * 9)


# ---------------- music bed ----------------
BEAT = .5
ROOTS = [55.0, 43.65, 65.41, 49.0]                                   # A F C G
PADS = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 261.63, 329.63], [196, 246.94, 293.66]]
ARPS = [[440, 523.25, 659.25, 880], [349.23, 440, 523.25, 698.46], [392, 523.25, 659.25, 783.99], [392, 493.88, 587.33, 783.99]]
ARP_SEQ = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2]
HIT_KINDS = {'hitBig', 'hit', 'hitCut', 'hitS', 'impact', 'land'}
hit_times = [c[0] for c in TL['cues'] if c[1] in HIT_KINDS]


def energy(t):
    for s in TL['scenes']:
        if s['start'] <= t < s['start'] + s['dur']:
            return s['energy']
    return 0


def near_hit(t, w=.04):
    return any(abs(t - h) < w for h in hit_times)


ARP = np.zeros(N)
bars = int(np.ceil(D / 2))
for bar in range(bars):
    t0, ch = bar * 2.0, bar % 4
    e0 = energy(t0 + 1e-3)
    ep = max(energy(t0 + .001), energy(t0 + 1.001))
    if ep >= 1:
        put(MUS, pad(PADS[ch], 2.3), t0, .075 if ep == 1 else .045, verb=.35)
    for bi in range(4):
        tb = t0 + bi * BEAT
        if tb >= D:
            break
        e = energy(tb + 1e-3)
        if e == 0:
            continue
        # drums
        if (e >= 2 or bi == 0) and not near_hit(tb):
            put(FX, kick(), tb, .85 if e >= 2 else .6)
            KICKS.append(tb)
        if e >= 2 and bi in (1, 3):
            put(FX, clap(), tb, .38, pan=.05, verb=.3)
        if e == 1 and bi == 2:
            put(FX, clap(), tb, .2, verb=.5)
        if e >= 2:
            put(FX, hat(), tb + .25, .16, pan=.3)
            for s16 in (.125, .375):
                put(FX, hat(), tb + s16, .09 if e == 3 else .055, pan=-.35)
            if e == 3 and bi == 3:
                put(FX, hat(True), tb + .25, .1, pan=.2)
        else:
            put(FX, hat(), tb + .25, .06, pan=.3)
        # bass
        if e >= 2:
            for s in range(4):
                g = bi * 4 + s
                if g % 2 == 0 or g in (7, 11, 15):
                    d = .12
                    t = tt(d)
                    sg = saw(ROOTS[ch], t) + .5 * saw(ROOTS[ch] * 1.005, t)
                    sg = lp(sg * np.exp(-t * 18) * np.minimum(1, t * 400), 600 + 500 * (g % 4 == 0))
                    put(MUS, sg, tb + s * .125, .5)
        elif bi in (0, 2):
            d = .9
            t = tt(d)
            sg = lp((saw(ROOTS[ch], t) + saw(ROOTS[ch] * 1.004, t)) * np.exp(-t * 2.5) * np.minimum(1, t * 200), 320)
            put(MUS, sg, tb, .38)
        # arpeggio
        steps = 4 if e >= 2 else 2
        for s in range(steps):
            g = bi * 4 + s * (4 // steps)
            f = ARPS[ch][ARP_SEQ[g] % 4] * (2 if (e == 3 and g % 8 >= 4) else 1)
            ta = tb + s * (BEAT / steps)
            gain = .12 if e == 1 else (.085 if e == 3 else .06)
            i = int(ta * SR)
            sg = pluck(f)
            n = min(len(sg), N - i)
            if n > 0:
                ARP[i:i + n] += sg[:n] * gain

# ping-pong delay on the arpeggio


def shift(x, d):
    k = int(d * SR)
    return np.concatenate([np.zeros(k), x[:-k]])


MUS[0] += lp(ARP + .32 * shift(ARP, .375) + .12 * shift(ARP, .75), 6000)
MUS[1] += lp(.85 * ARP + .36 * shift(ARP, .1875) + .16 * shift(ARP, .5625), 6000)
VERB[0] += ARP * .25
VERB[1] += ARP * .25

# ---------------- cue sound design ----------------
SCALE = [0, 3, 7, 10, 12, 15, 19, 22, 24, 27, 31, 34]
for t, kind, arg in TL['cues']:
    if kind == 'heart':
        put(FX, sub(.5), t, .5)
        put(FX, tick(1800), t, .22, verb=.4)
    elif kind == 'osc':
        d = arg
        tq = tt(d)
        k = tq / d
        f = 55 * 2 ** (6.2 * k ** 1.6)
        sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
        put(FX, sweep_lp(sq, 1500, 7500) * np.minimum(1, k * 6) * .16, t, 1.0, verb=.3)
    elif kind == 'riser':
        put(FX, riser(arg), t, .45)
    elif kind in ('hitBig', 'hitCut'):
        put(FX, kick(big=True), t, .95 if kind == 'hitBig' else .85)
        put(FX, sub(), t, .65)
        put(FX, crash(), t, .33, verb=.3)
        KICKS.append(t)
    elif kind == 'hit':
        put(FX, kick(), t, .7)
        put(FX, crash(1.0), t, .16, verb=.2)
        KICKS.append(t)
    elif kind == 'hitS':
        put(FX, kick(), t, .45)
        put(FX, hp(noise(.08), 3000) * np.exp(-tt(.08) * 60), t, .15)
        KICKS.append(t)
    elif kind == 'hitAcc':
        put(FX, clap(), t, .3, verb=.5)
    elif kind == 'hitFlip':
        put(FX, clap(), t, .45, verb=.3)
        put(FX, crash(1.2), t, .28)
    elif kind == 'type':
        for q in np.arange(0, arg, 1 / 38):
            put(FX, tick(2000 + 900 * rs.random(), .02), t + q, .05, pan=rs.random() * .6 - .3)
    elif kind == 'blip':
        put(FX, blip(440 * 2 ** (SCALE[int(arg) % len(SCALE)] / 12)), t, .2, pan=(.3 if int(arg) % 2 else -.3), verb=.35)
    elif kind == 'wordBlip':
        put(FX, blip(440 * 2 ** (arg / 12)), t, .28, pan=(.4 if int(arg) % 2 else -.4), verb=.35)
        put(FX, hp(noise(.1), 2500) * np.exp(-tt(.1) * 40), t, .08)
    elif kind == 'tick':
        put(FX, tick(2300 + 350 * (int(arg or 0) % 4)), t, .1, pan=-.5 + .25 * (int(arg or 0) % 4))
    elif kind == 'clockTick':
        put(FX, tick(2700 if int(arg) == 0 else 2100), t, .11, pan=(-.25 if int(arg) == 0 else .25))
    elif kind == 'land':
        put(FX, kick(), t, .42)
        put(FX, blip(220 * 2 ** (SCALE[int(arg or 0) % len(SCALE)] / 12)), t, .22, verb=.3)
        KICKS.append(t)
    elif kind == 'swell':
        put(FX, whoosh(max(.3, arg)), t, .2, verb=.3)
    elif kind == 'zap':
        put(FX, zap(), t, .4, verb=.2)
    elif kind == 'rattle':
        q = 0.0
        while q < arg - .02:
            put(FX, tick(3000, .015), t + q, .06, pan=rs.random() - .5)
            q += .018 + .09 * (q / arg) ** 2
    elif kind == 'pad':
        tq = tt(arg + .6)
        chord = sum(np.sin(2 * np.pi * f * tq + ph) for f, ph in [(220, 0), (261.63, 1), (329.63, 2), (440 * 1.003, .5)])
        put(MUS, chord * np.minimum(1, tq / .6) * np.exp(-np.clip(tq - arg + .4, 0, None) * 6) * .07, t, 1.0, verb=.6)
    elif kind == 'impact':
        put(FX, kick(big=True), t, 1.0)
        put(FX, sub(2.0), t, .9)
        put(FX, crash(1.8), t, .45, verb=.5)
        put(FX, bell(880), t, .35, verb=.8)
        put(FX, bell(1318.5), t + .03, .16, pan=.3, verb=.8)
        KICKS.append(t)
    elif kind == 'blipEnd':
        put(FX, blip(1760) * .6, t, .25, verb=.6)
    elif kind == 'whoosh':
        put(FX, whoosh(max(.3, arg)), t, .34)
    elif kind == 'whoosh2':
        put(FX, whoosh(arg), t, .34, pan=-.5)
        put(FX, whoosh(arg, False), t + .02, .24, pan=.5)
    elif kind == 'whooshDown':
        put(FX, whoosh(arg, False), t, .32)
    elif kind == 'whooshOut':
        put(FX, whoosh(max(.25, arg)), t, .3)
    elif kind == 'sweep':
        d = max(.3, arg)
        tq = tt(d)
        tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * (tq / d) ** 2) / SR) * np.sin(np.pi * tq / d) * .15
        put(FX, whoosh(d) + tone, t, .4)
    elif kind == 'zoom':
        put(FX, whoosh(arg) * .8 + riser(arg) * .4, t, .38)
        put(FX, sub(.6), t + arg, .45)

# sidechain: duck the music bed under every kick
duck = np.zeros(N)
for k in KICKS:
    i = int(k * SR)
    n = min(int(.4 * SR), N - i)
    if n > 0:
        duck[i:i + n] = np.maximum(duck[i:i + n], np.exp(-np.arange(n) / SR * 9))
MUS *= (1 - .5 * duck)

# reverb: exponentially decaying noise, FFT convolution
irl = int(1.4 * SR)
ti = np.arange(irl) / SR


def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]


for ch in (0, 1):
    ir = lp(rs.standard_normal(irl), 5000) * np.exp(-ti * 3.2)
    ir /= np.sqrt(np.sum(ir ** 2))
    FX[ch] += conv(VERB[ch], ir) * .5

mix = FX + MUS
fade = np.ones(N)
fn = int(.12 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade
mix = np.tanh(mix * 1.1 / np.max(np.abs(mix)) * 1.6) / np.tanh(1.6) * .94
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('wrote', OUT, mix.shape[1] / SR, 's')
