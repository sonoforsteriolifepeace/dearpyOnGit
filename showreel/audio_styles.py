"""Alternative soundtracks for the long cuts, one per musical style.

    python3 audio_styles.py timeline60.json ambient  audio_ambient.wav
    styles: ambient · piano · lofi · pulse

Same timeline and cues as audio_long.py (every cut, word and landing digit keeps
its sound), but the sounds are tuned notes and soft percussion instead of noise
crashes, the harmony is richer (Am9 · Fmaj7 · Cmaj7 · G6) and the master is
quieter with a gentle limiter rather than hard saturation.
"""
import json
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
TL = json.load(open(sys.argv[1]))
STYLE = sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else f'audio_{STYLE}.wav'
D = TL['dur']
N = int((D + .3) * SR)
rs = np.random.default_rng(7)
BUS = np.zeros((2, N))
VERB = np.zeros((2, N))


def tt(d):
    return np.arange(int(d * SR)) / SR


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def put(sig, t, g=1.0, pan=0.0, verb=0.0):
    i = int(round(t * SR))
    if i >= N or g == 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    BUS[0, i:i + n] += sig[:n] * g * l
    BUS[1, i:i + n] += sig[:n] * g * r
    if verb:
        VERB[0, i:i + n] += sig[:n] * g * verb * l
        VERB[1, i:i + n] += sig[:n] * g * verb * r


def filt(x, fc, kind='low', order=2):
    if isinstance(fc, (list, tuple)):
        b, a = butter(order, [fc[0] / (SR / 2), min(fc[1], SR * .45) / (SR / 2)], 'band')
    else:
        b, a = butter(order, min(fc, SR * .45) / (SR / 2), kind)
    return lfilter(b, a, x)


def noise(d):
    return rs.standard_normal(int(d * SR))


def ramp(t, a=.004):
    return np.minimum(1, t / a)


# ---------------- instruments ----------------
def piano(f, d=2.6, vel=1.0):
    t = tt(d)
    s = np.zeros_like(t)
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + .0004 * k * k)
        if fk > 16000:
            break
        s += vel ** (k * .35) / k ** 1.15 * np.exp(-t * (.7 + .55 * k) * (1 + f / 1200)) * np.sin(2 * np.pi * fk * t)
    s += filt(noise(d), 2500) * np.exp(-t * 120) * .05 * vel
    return s * ramp(t, .003) * np.clip((d - t) / .08, 0, 1)


def rhodes(f, d=2.2, vel=1.0):
    t = tt(d)
    mod = np.sin(2 * np.pi * f * t) * (1.6 * vel * np.exp(-t * 2.5) + .2)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.1) * (1 + .12 * np.sin(2 * np.pi * 4.2 * t))
    return s * ramp(t, .004) * np.clip((d - t) / .1, 0, 1)


def marimba(f, d=.9, vel=1.0):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 5.5) + .22 * vel * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t * 22)
    s += .08 * vel * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t * 60)
    return s * ramp(t, .002)


def glass(f, d=3.0, vel=1.0):
    t = tt(d)
    s = np.zeros_like(t)
    for m, a, dc in [(1, 1, .9), (2.0, .35, 1.4), (3.01, .18, 2.2), (4.16, .08, 3.5)]:
        s += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dc)
    return s * ramp(t, .012) * vel


def pad(midis, d, bright=1400, air=.0):
    t = tt(d)
    s = np.zeros_like(t)
    for m in midis:
        f = hz(m)
        for det in (-.0035, 0, .004):
            ph = rs.random()
            s += 2 * ((f * (1 + det) * t + ph) % 1) - 1
    s = filt(s, bright) / (3 * len(midis))
    if air:
        s += filt(noise(d), (3000, 9000), order=1) * air
    return s * np.minimum(1, t / .6) * np.clip((d - t) / .8, 0, 1)


def softkick(v=1.0):
    t = tt(.5)
    f = 45 + 70 * np.exp(-t * 22)
    return filt(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * ramp(t, .002), 900) * v


def lofikick():
    t = tt(.45)
    f = 50 + 90 * np.exp(-t * 30)
    s = np.tanh(1.4 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 8)
    return filt(s + filt(noise(.45), 3000) * np.exp(-t * 200) * .15, 2500)


def lofisnare():
    t = tt(.35)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30) * .5
    return filt(filt(noise(.35), (1200, 6000)) * np.exp(-t * 16) + body, 6500)


def brush(d=.25):
    t = tt(d)
    return filt(noise(d), (2000, 7000)) * np.minimum(1, t / .015) * np.exp(-t * 14)


def shaker():
    t = tt(.09)
    return filt(noise(.09), (4500, 10000)) * np.minimum(1, t / .01) * np.exp(-t * 45)


def softhat():
    t = tt(.06)
    return filt(filt(noise(.06), 6500, 'high'), 12000) * np.exp(-t * 80)


def woodtick(f=1900):
    t = tt(.05)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * ramp(t, .001)


def swell(d, top=2200):
    t = tt(d)
    k = t / d
    x = noise(d)
    out = np.zeros_like(x)
    zi = None
    for s in range(0, len(x), 1024):
        b, a = butter(2, (300 + top * k[s] ** 2) / (SR / 2))
        zi = np.zeros(2) if zi is None else zi
        out[s:s + 1024], zi = lfilter(b, a, x[s:s + 1024], zi=zi)
    return out * np.sin(np.pi * k) ** 2


def boom(d=2.5):
    t = tt(d)
    f = 44 + 12 * np.exp(-t * 5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4) * ramp(t, .008)


def crackle(d):
    x = np.zeros(int(d * SR))
    idx = rs.integers(0, len(x), int(d * 35))
    x[idx] = rs.standard_normal(len(idx)) * rs.random(len(idx)) ** 3
    return filt(x, 5000) + filt(noise(d), 1200) * .004


# ---------------- harmony ----------------
PROG = [[45, 57, 60, 64, 67, 71],   # Am9
        [41, 53, 57, 60, 64, 69],   # Fmaj7
        [48, 55, 59, 64, 67, 71],   # Cmaj7
        [43, 55, 59, 62, 64, 67]]   # G6
AM = PROG[0]
PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]
DL = next(s for s in TL['scenes'] if s['k'] == 'deadline')['start']


def chord(t):
    return AM if t >= DL else PROG[int(t / 2) % 4]


def energy(t):
    for s in TL['scenes']:
        if s['start'] <= t < s['start'] + s['dur']:
            return s['energy']
    return 0


def tone_at(t, i, lo=69):
    """A chord tone above `lo` for cue number i (keeps cue notes in the harmony)."""
    ups = sorted({m + 12 * o for m in chord(t)[1:] for o in (0, 1, 2) if m + 12 * o >= lo})
    return ups[int(i) % min(len(ups), 6)]


STY = {
    'ambient': dict(lead=glass, verb=.55, pad=.11, bright=1300, air=.02, master=-20),
    'piano':   dict(lead=piano, verb=.35, pad=.05, bright=1000, air=0, master=-19),
    'lofi':    dict(lead=rhodes, verb=.25, pad=.0, bright=900, air=0, master=-18),
    'pulse':   dict(lead=marimba, verb=.3, pad=.05, bright=1600, air=.01, master=-18),
    # calm family, built on the opening of `pulse`: marimba, soft heartbeat, no drums
    'calme':       dict(lead=marimba, verb=.4, pad=.03, bright=900, air=0, master=-21, calm=True),
    'nappe':       dict(lead=marimba, verb=.45, pad=.16, bright=700, air=.006, master=-21, calm=True),
    'horloge':     dict(lead=marimba, verb=.35, pad=.04, bright=800, air=0, master=-21, calm=True),
    'respiration': dict(lead=marimba, verb=.4, pad=.03, bright=900, air=0, master=-21, calm=True),
}[STYLE]
CALM = STY.get('calm', False)
lead = STY['lead']

# ---------------- bed ----------------
bars = int(np.ceil(D / 2))
for bar in range(bars):
    t0 = bar * 2.0
    ch = chord(t0)
    e = max(energy(t0 + .01), energy(t0 + 1.01))
    if STY['pad'] and (e > 0 or t0 >= DL):
        put(pad(ch[1:], 2.9, STY['bright'], STY['air']), t0, STY['pad'] * (1.2 if e <= 1 else .9), verb=.5)
    for bi in range(4):
        tb = t0 + bi * .5
        if tb >= D:
            break
        e = energy(tb + .01)
        root = hz(ch[0])
        if STYLE == 'ambient':
            if e >= 1 and bi % 2 == 0:
                put(glass(hz(tone_at(tb, bar * 2 + bi // 2 + (3 if e >= 2 else 0), 72)), 3.2), tb, .10, pan=(-.4 if bi else .4), verb=.6)
            if e >= 2:
                put(glass(hz(tone_at(tb, bi + bar, 76)), 2.0), tb + .25, .05, pan=.5, verb=.6)
                if bi == 0:
                    put(softkick(.8), tb, .5)
            if e == 3:
                for q in (0, .25):
                    put(shaker(), tb + q, .05, pan=-.3)
            if bi == 0 and e >= 1:
                put(np.sin(2 * np.pi * root * tt(2.0)) * np.exp(-tt(2.0) * 1.2) * ramp(tt(2.0), .05), tb, .22)
        elif STYLE == 'piano':
            if e >= 1 and bi == 0:
                put(piano(root, 3.0, .8), tb, .30, pan=-.2, verb=.4)
                put(piano(root * 1.5, 2.6, .6), tb + .02, .18, pan=-.2, verb=.4)
            if e >= 1:
                steps = 2 if e >= 2 else 1
                for s in range(steps):
                    m = ch[1 + (bi * steps + s + bar) % 3]
                    put(piano(hz(m), 1.8, .55), tb + s * (.5 / steps), .11, pan=-.1, verb=.4)
            if e >= 2 and bi in (1, 3):
                put(brush(), tb, .05, pan=.2, verb=.3)
        elif STYLE == 'lofi':
            put(crackle(.5), tb, .6)
            if bi == 0:
                for j, m in enumerate(ch[1:5]):
                    put(rhodes(hz(m), 2.1, .7), tb + j * .018, .10, pan=-.15 + .1 * j, verb=.3)
            if e >= 1:
                if bi == 0 or (bi == 1 and e >= 2):
                    put(lofikick(), tb + (0 if bi == 0 else .25), .55)
                if bi == 2:
                    put(lofisnare(), tb, .32, verb=.2)
            if e >= 2:
                for q in (0, .28):
                    put(softhat(), tb + q, .10 if q == 0 else .07, pan=.25)
                bt = tt(.45)
                put(np.sin(2 * np.pi * root * bt) * np.exp(-bt * 3) * ramp(bt, .01), tb, .32 if bi in (0, 2) else .18)
        elif STYLE == 'pulse':
            if e >= 1:
                pat = [0, 2, 1, 3, 2, 4, 1, 3] if e >= 2 else [0, 2, 1, 3]
                steps = 4 if e >= 2 else 2
                ups = [m + 12 for m in ch[1:]]
                for s in range(steps):
                    m = ups[pat[(bi * steps + s) % len(pat)] % len(ups)]
                    acc = 1.0 if s == 0 else .7
                    put(marimba(hz(m), .8, acc), tb + s * (.5 / steps), .16 * acc, pan=(.35 if s % 2 else -.35), verb=.25)
            if e >= 1:
                bt = tt(.24)
                put(np.sin(2 * np.pi * root * bt) * np.exp(-bt * 9) * ramp(bt, .005), tb, .13)
                put(np.sin(2 * np.pi * root * bt) * np.exp(-bt * 9) * ramp(bt, .005), tb + .25, .08)
            if e >= 2:
                put(softkick(), tb, .3)
                put(shaker(), tb + .25, .06, pan=.3)
            if e == 3 and bi in (1, 3):
                put(brush(.2), tb, .08, verb=.3)
        elif CALM:
            grow = .8 + .3 * tb / D                        # slow crescendo towards the deadline
            if tb >= 3:                                    # heartbeat on every beat, like the opening
                put(boom(1.0), tb, (.13 if bi == 0 else .09) * grow)
                put(woodtick(1200), tb, .02 * grow, verb=.3)
            if e == 0:
                continue
            if STYLE == 'calme':
                if bi == 0 or (bi == 2 and e >= 2):
                    put(marimba(hz(ch[1 + (bar + bi // 2) % 3]), 1.2, .7), tb, .13 * grow, pan=(-.3 if bi else .3), verb=.5)
            elif STYLE == 'horloge':
                put(woodtick(1500 if bi % 2 else 1900), tb, (.045 + .012 * e) * grow, pan=(.25 if bi % 2 else -.25), verb=.2)
                if bi == 0:
                    put(marimba(hz(ch[1]), 1.2, .6), tb, .06 * grow, verb=.5)
            elif STYLE == 'respiration':
                for s, m in enumerate((ch[0] + 24, ch[0] + 31)):
                    put(marimba(hz(m), .7, .6), tb + s * .25, (.06 + .015 * e) * grow, pan=(.3 if s else -.3), verb=.35)

# ---------------- melody (piano style) ----------------
if STYLE == 'piano':
    prev = 69
    t = 0.0
    while t < D:
        e = energy(t + .01)
        step = {0: 2.0, 1: 1.0, 2: .5, 3: .5}[e]
        beat_in_bar = (t % 2) / .5
        if e > 0 and not (t % 4 > 3.4):          # breathe at the end of each 2-bar phrase
            cands = [m for m in PENTA if abs(m - prev) <= 5] or PENTA
            ct = [m for m in cands if (m % 12) in {c % 12 for c in chord(t)}]
            pool = ct if (beat_in_bar % 2 == 0 and ct) else cands
            m = pool[int(rs.integers(len(pool)))]
            if rs.random() < .3:
                m = prev
            put(piano(hz(m), 2.2, .9), t, .17, pan=.15, verb=.45)
            prev = m
        t += step

# ---------------- cues ----------------
HIT = {'hitBig': 1.0, 'hitCut': .9, 'hit': .6, 'hitS': .4, 'hitFlip': .7, 'impact': 1.4}
SOFT_WHOOSH = {'whoosh', 'whoosh2', 'whooshDown', 'whooshOut', 'sweep', 'zoom', 'swell'}
for t, kind, arg in TL['cues']:
    if kind in HIT:
        g = HIT[kind]
        ch = chord(t + .01)
        if STYLE == 'lofi':
            put(lofikick(), t, .55 * g)
            put(filt(filt(noise(1.2), 5000, 'high'), 9000) * np.exp(-tt(1.2) * 3.5), t, .05 * g, verb=.4)
        elif CALM:
            put(boom(1.8), t, .13 * g)
            put(marimba(hz(ch[0] + 24), 1.4), t, .1 * min(g, 1), verb=.5)
        elif STYLE == 'pulse':
            put(softkick(), t, .55 * g)
            for j, m in enumerate(ch[1:4]):
                put(marimba(hz(m + 12), 1.2), t + j * .012, .12 * g, verb=.4)
        else:
            put(boom(), t, .45 * g)
            if g >= .6:
                for j, m in enumerate(ch[:4]):
                    put(lead(hz(m + (12 if j else 0)), 3.0, .8), t + j * .02, .09 * g, pan=-.3 + .2 * j, verb=.6)
        if kind == 'impact':
            for j, m in enumerate([69, 72, 76, 79, 83]):
                put(glass(hz(m + 12), 4.0), t + .04 * j, .09, pan=-.4 + .2 * j, verb=.9)
            put(pad(AM[1:], 3.0, 1800, .02), t, .10, verb=.6)
    elif kind in ('blip', 'land', 'wordBlip', 'blipEnd'):
        i = arg if arg is not None else 0
        m = tone_at(t, i if kind != 'wordBlip' else int(arg) // 3, 72 if kind != 'blipEnd' else 84)
        g = {'blip': .13, 'land': .15, 'wordBlip': .17, 'blipEnd': .12}[kind] * (.7 if CALM else 1)
        if kind == 'land' and STYLE in ('ambient', 'piano'):
            put(boom(1.2), t, .18)
        put(lead(hz(m), 2.0), t, g, pan=(.3 if int(i) % 2 else -.3), verb=STY['verb'] + .2)
    elif kind in ('tick', 'clockTick'):
        f = 1900 if (arg or 0) % 2 == 0 else 1500
        put(woodtick(f), t, (.05 if kind == 'tick' else .07) * (.5 if CALM else 1), pan=(-.3 if (arg or 0) % 2 else .3))
    elif kind == 'heart':
        put(boom(1.0), t, .2 if CALM else .3)
        put(woodtick(1200), t, .04, verb=.3)
    elif kind == 'osc':
        steps = int(arg / .125)
        for q in range(steps):
            m = PENTA[q % len(PENTA)] + 12 * (q // len(PENTA))
            put(lead(hz(min(m, 96)), 1.0), t + q * .125, .06 + .06 * q / max(1, steps), pan=np.sin(q) * .5, verb=STY['verb'])
    elif kind in SOFT_WHOOSH:
        d = max(.3, arg or .4)
        put(swell(d, 1800 if STYLE != 'pulse' else 2600), t, .03 if CALM else .06, pan=rs.random() - .5, verb=.3)
    elif kind == 'riser':
        put(swell(arg, 2500), t, .07, verb=.3)
    elif kind == 'type':
        for q in np.arange(0, arg, 1 / 24):
            put(woodtick(2400 + 600 * rs.random()), t + q, .02, pan=rs.random() * .6 - .3)
    elif kind == 'rattle':
        q = 0.0
        j = 0
        while q < arg - .02:
            put(marimba(hz(PENTA[j % len(PENTA)] + 12), .4), t + q, .045, pan=rs.random() - .5)
            q += .03 + .12 * (q / arg) ** 2
            j += 1
    elif kind == 'zap':
        for j, m in enumerate([70, 71]):
            put(glass(hz(m + 12), 1.5), t + j * .03, .07, verb=.5)
    elif kind == 'hitAcc':
        put(lead(hz(76), 1.5), t, .1, verb=.4)
    elif kind == 'pad':
        put(pad(AM[1:], arg + .8, 1500, .015), t, .09, verb=.6)

# ---------------- reverb + master ----------------
irl = int(2.6 * SR)
ti = np.arange(irl) / SR


def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]


for ch_ in (0, 1):
    ir = filt(rs.standard_normal(irl), 4500) * np.exp(-ti * 2.2)
    ir /= np.sqrt(np.sum(ir ** 2))
    BUS[ch_] += conv(VERB[ch_], ir) * .45

mix = filt(BUS, 30, 'high')
if STYLE == 'lofi':
    mix = filt(mix, 9500)
fade = np.ones(N)
fade[-int(.25 * SR):] = np.linspace(1, 0, int(.25 * SR))
mix *= fade
rms = np.sqrt(np.mean(mix ** 2))
mix *= 10 ** (STY['master'] / 20) / rms
a = np.abs(mix)
knee = .7
mix = np.where(a < knee, mix, np.sign(mix) * (knee + (1 - knee) * np.tanh((a - knee) / (1 - knee))))
mix *= .97
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('wrote', OUT)
