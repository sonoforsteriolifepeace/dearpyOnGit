"""Synthesised score for the Bachtarzi animation (180 s, 48 kHz stereo).

A drone on D, ney phrases in maqam Bayati at the title, chapter cards and
finale, oud plucks on reveals and arrivals, a soft bendir pulse under parts
II and III, and small sound effects (needle, tape measure, chalk, chimes).
Every cue is read from src/timeline.json so sound and picture stay in sync.

    python3 audio/score.py [out.wav]      (needs numpy + scipy)
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, sosfilt

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / 'src' / 'timeline.json').read_text())
DUR = TL['duration']
N = int(DUR * SR)
rng = np.random.default_rng(1806)

SCENE = {s['id']: s for s in TL['scenes']}


def at(scene, dt=0.0):
    return SCENE[scene]['start'] + dt


# ---------- easing (same curves as src/anim.ts) ----------
def bezier(x1, y1, x2, y2):
    s = np.linspace(0, 1, 4001)
    bx = 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s ** 2 * x2 + s ** 3
    by = 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s ** 2 * y2 + s ** 3
    return bx, by


EIO_X, EIO_Y = bezier(0.65, 0, 0.35, 1)
EOUT_X, EOUT_Y = bezier(0.22, 1, 0.36, 1)


def ticks_along(t0, d, n, curve=(EIO_X, EIO_Y)):
    """n event times spread so they follow an eased progress curve."""
    bx, by = curve
    ks = (np.arange(n) + 0.5) / n
    return [t0 + d * float(np.interp(k, by, bx)) for k in ks]


# ---------- buses ----------
dry = np.zeros((2, N))
wet = np.zeros((2, N))


def place(sig, t, gain=1.0, pan=0.0, rev=0.3):
    """Mix a mono signal at time t (s); pan -1..1; rev = reverb send."""
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0:
        return
    j = min(N, i + len(sig))
    seg = sig[: j - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    for bus, g in ((dry, 1 - rev * 0.5), (wet, rev)):
        bus[0, i:j] += seg * l * g
        bus[1, i:j] += seg * r * g


def env_adsr(n, a, r, sus=1.0):
    e = np.full(n, sus)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, sus, na) ** 1.5
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return sosfilt(sos, x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


# ---------- maqam Bayati on D ----------
D3 = 146.83
STEPS = {'D': 0, 'E': 1.5, 'F': 3, 'G': 5, 'A': 7, 'Bb': 8, 'C': 10}


def note(name, octave=4):
    return D3 * 2 ** ((STEPS[name] + 12 * (octave - 3)) / 12)


# ---------- instruments ----------
def ney(phrase, t0, gain=0.06, pan=-0.1):
    """Breathy flute line with glides and vibrato. phrase: [(note, octave, dur)]."""
    total = sum(d for _, _, d in phrase) + 0.8
    n = int(total * SR)
    f = np.zeros(n)
    amp = np.zeros(n)
    pos = 0
    prev = None
    for k, (nm, octv, d) in enumerate(phrase):
        m = int(d * SR)
        target = note(nm, octv)
        seg = np.full(m, target)
        if prev is not None:
            g = min(m, int(0.07 * SR))
            seg[:g] = np.geomspace(prev, target, g)
        f[pos:pos + m] = seg
        a = np.ones(m)
        a[: int(0.05 * SR)] *= np.linspace(0.75, 1, int(0.05 * SR))
        amp[pos:pos + m] = a * (1.0 if k else 0.9)
        pos += m
        prev = target
    f[pos:] = prev
    amp[pos:] = 0
    tt = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt) * np.clip(tt / 0.8, 0, 1)
    phase = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(phase) + 0.32 * np.sin(2 * phase + 0.4) + 0.12 * np.sin(3 * phase) + 0.05 * np.sin(4 * phase)
    breath = bp(rng.normal(size=n), 900, 3800) * 0.22
    shape = env_adsr(n, 0.35, 0.9) * lp(amp, 6)
    sig = (tone * (0.85 + 0.15 * lp(rng.normal(size=n), 4)) + breath) * shape
    place(lp(sig, 5200) * gain, t0, pan=pan, rev=0.55)


def pluck(freq, t, gain=0.22, pan=0.0, decay=0.996, dur=2.4, bright=3200):
    """Oud-like Karplus-Strong string."""
    n = int(dur * SR)
    L = int(round(SR / freq))
    exc = np.zeros(n)
    burst = lp(rng.normal(size=L), bright)
    exc[:L] = burst * np.hanning(L) ** 0.3
    a = np.zeros(L + 2)
    a[0] = 1
    a[L] = a[L + 1] = -decay / 2
    y = lfilter([1.0], a, exc)
    body = bp(y, 180, 2400) * 0.6 + y * 0.4
    body *= np.exp(-np.arange(n) / SR * 1.2)
    click = np.zeros(n)
    click[:200] = rng.normal(size=200) * np.exp(-np.arange(200) / 30) * 0.3
    sig = body / (np.max(np.abs(body)) + 1e-9) + hp(click, 2000)
    place(sig * gain, t, pan=pan, rev=0.35)


def chime(freq, t, gain=0.08, pan=0.2, dur=3.2):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    idx = 2.2 * np.exp(-tt * 3)
    sig = np.sin(2 * np.pi * freq * tt + idx * np.sin(2 * np.pi * freq * 3.5 * tt))
    sig += 0.35 * np.sin(2 * np.pi * freq * 2.76 * tt) * np.exp(-tt * 4)
    sig *= np.exp(-tt * 1.6) * np.clip(tt / 0.004, 0, 1)
    place(sig * gain, t, pan=pan, rev=0.6)


def gong(t, gain=0.12, f0=73.42, dur=6.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for ratio, amp, dec in ((1, 1, 0.7), (1.47, 0.5, 1.0), (2.09, 0.35, 1.3), (2.56, 0.25, 1.7), (3.1, 0.18, 2.2), (4.2, 0.1, 3)):
        sig += amp * np.sin(2 * np.pi * f0 * ratio * tt * (1 - 0.002 * np.exp(-tt * 2)))  * np.exp(-tt * dec)
    sig *= np.clip(tt / 0.02, 0, 1)
    place(sig / 2.4 * gain, t, rev=0.6)


def dum(t, gain=0.3, pan=0.0):
    n = int(0.7 * SR)
    tt = np.arange(n) / SR
    f = 52 + 70 * np.exp(-tt * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
    jingle = bp(rng.normal(size=n), 1800, 6000) * np.exp(-tt * 16) * 0.12
    thump = lp(rng.normal(size=n), 400) * np.exp(-tt * 40) * 0.4
    place((body + jingle + thump) * gain, t, pan=pan, rev=0.2)


def tek(t, gain=0.12, pan=0.15):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    slap = bp(rng.normal(size=n), 1500, 7000) * np.exp(-tt * 45)
    ring = np.sin(2 * np.pi * 340 * tt) * np.exp(-tt * 30) * 0.4
    jingle = bp(rng.normal(size=n), 3000, 9000) * np.exp(-tt * 14) * 0.25
    place((slap + ring + jingle) * gain, t, pan=pan, rev=0.25)


def tick(t, gain=0.05, pan=0.0, f=4200):
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    sig = (bp(rng.normal(size=n), f * 0.6, min(f * 1.6, 20000)) + 0.5 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 260)
    place(sig * gain, t, pan=pan, rev=0.1)


def whoosh(t, d, gain=0.05, pan=0.0, lo=300, hi=2400):
    n = int(d * SR)
    noise = rng.normal(size=n)
    out = np.zeros(n)
    blocks = 48
    edges = np.linspace(0, n, blocks + 1).astype(int)
    for b in range(blocks):
        k = (b + 0.5) / blocks
        fc = lo * (hi / lo) ** np.sin(np.pi * k)
        seg = bp(noise[edges[b]:edges[b + 1] + 2048], fc * 0.7, fc * 1.4)[: edges[b + 1] - edges[b]]
        out[edges[b]:edges[b + 1]] = seg
    out *= np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    place(out * gain, t, pan=pan, rev=0.4)


def swell(t_end, d=1.4, gain=0.05):
    n = int(d * SR)
    sig = bp(rng.normal(size=n), 400, 5000) * np.linspace(0, 1, n) ** 3
    place(sig * gain, t_end - d, rev=0.5)


def chalk(t, d, gain=0.035, pan=-0.2):
    n = int(d * SR)
    tt = np.arange(n) / SR
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 19 * tt + 3 * lp(rng.normal(size=n), 8))
    sig = bp(rng.normal(size=n), 1800, 7000) * am * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.5
    place(sig * gain, t, pan=pan, rev=0.15)


# ---------- drone ----------
def drone():
    tt = np.arange(N) / SR
    sig = np.zeros(N)
    for f, a in ((73.42, 0.55), (110.0, 0.32), (146.83, 0.4), (220.0, 0.12), (293.66, 0.07)):
        for det in (-0.6, 0.6):
            ph = rng.uniform(0, 2 * np.pi)
            sig += a * np.sin(2 * np.pi * (f + det * f / 440) * tt + ph) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * tt + ph))
    sig = lp(sig, 1400)
    # level follows the film: present everywhere, swelling on dark cards
    lvl = np.full(N, 0.55)
    for s in TL['scenes']:
        if s['bg'] != 'paper':
            a, b = int(s['start'] * SR), int(s['end'] * SR)
            lvl[a:b] = 0.85
    lvl = lp(np.concatenate([lvl, lvl[-1:]])[:N], 0.6, order=1)
    lvl *= np.clip(tt / 2.5, 0, 1) * np.clip((DUR - tt) / 2.0, 0, 1)
    sig *= lvl * 0.07
    dry[0] += sig * 0.8
    dry[1] += sig * 0.8
    wet[0] += sig * 0.3
    wet[1] += sig * 0.3


drone()

# ---------- Part I ----------
ney([('D', 4, 1.6), ('E', 4, 0.5), ('F', 4, 0.7), ('G', 4, 1.1), ('F', 4, 0.5), ('E', 4, 0.6), ('D', 4, 1.9)], 0.3)
chime(note('A', 5), 1.9)
chime(note('D', 6), 3.0, gain=0.06, pan=-0.2)

CH_PHRASES = {
    'ch1': [('A', 4, 1.0), ('G', 4, 0.45), ('F', 4, 0.45), ('G', 4, 1.4)],
    'ch2': [('D', 5, 0.9), ('C', 5, 0.45), ('Bb', 4, 0.45), ('A', 4, 1.5)],
    'ch3': [('G', 4, 0.8), ('A', 4, 0.5), ('Bb', 4, 0.5), ('A', 4, 1.5)],
}
for ch, phrase in CH_PHRASES.items():
    swell(at(ch), 1.3)
    gong(at(ch, 0.05), gain=0.09)
    ney(phrase, at(ch, 0.4), gain=0.05)
    chime(note('D', 6), at(ch, 0.35), gain=0.05)

pluck(note('D', 3), at('master', 0.6), pan=-0.3)
pluck(note('A', 3), at('master', 0.9), gain=0.16, pan=-0.2)
pluck(note('F', 3), at('master', 2.8), gain=0.14, pan=0.3)
chime(note('F', 5), at('master', 4.2), gain=0.04)

legs = TL['journey']['legs']
arrive = [note('A', 3), note('E', 4), note('A', 3), note('D', 4)]
pluck(note('D', 3), at('journey', 1.0), pan=-0.4)
for (a, b), f, pan in zip(legs, arrive, (0.4, 0.2, 0.3, -0.4)):
    whoosh(at('journey', a), b - a, gain=0.035, pan=pan)
    for k, tt in enumerate(ticks_along(at('journey', a), b - a, 10)):
        tick(tt, gain=0.018, pan=pan, f=3600)
    pluck(f, at('journey', b), gain=0.2, pan=pan)
    pluck(f * 1.5, at('journey', b + 0.12), gain=0.08, pan=pan)

chime(note('A', 5), at('tombs', 0.4), gain=0.05)
pluck(note('D', 3), at('tombs', 1.0), pan=0.3)
pluck(note('A', 2), at('tombs', 1.4), pan=-0.3)
whoosh(at('tombs', 3.2), 1.6, gain=0.03)

pluck(note('F', 3), at('lineage', 0.4), pan=-0.4)
whoosh(at('lineage', 1.6), 1.4, gain=0.035)
pluck(note('A', 3), at('lineage', 1.8), pan=0.4)
chime(note('D', 6), at('lineage', 3.0), gain=0.04, pan=0.4)

pluck(note('D', 3), at('disciple', 0.3), pan=-0.4)
whoosh(at('disciple', 1.2), 1.8, gain=0.035)
pluck(note('F', 3), at('disciple', 1.6), pan=0.4)
pluck(note('A', 3), at('disciple', 3.0), gain=0.15, pan=0.4)
chime(note('A', 5), at('disciple', 3.6), gain=0.05)

# ---------- bendir pulse (parts II and III) ----------
BEAT = 60 / 72
PULSE = ['writer', 'verse', 'sciences', 'manuscript', 'measure', 'name', 'clients', 'pattern', 'sewing']
for sid in PULSE:
    s = SCENE[sid]
    t = s['start'] + 0.2
    i = 0
    while t < s['end'] - 0.4:
        fade = min(1, (t - s['start']) / 1.5, (s['end'] - t) / 1.0)
        g = 0.55 + 0.45 * fade
        pos = i % 8  # eighths in a bar of 4
        if pos == 0:
            dum(t, gain=0.17 * g)
        elif pos == 4:
            dum(t, gain=0.12 * g, pan=0.1)
        elif pos in (2, 6):
            tek(t, gain=0.05 * g)
        elif pos == 3:
            tek(t, gain=0.03 * g, pan=-0.15)
        t += BEAT / 2
        i += 1

# ---------- Part II ----------
chime(note('F', 5), at('writer', 2.0), gain=0.04)
whoosh(at('writer', 4.4), 1.2, gain=0.03)
chime(note('A', 5), at('writer', 4.6), gain=0.05)
pluck(note('D', 4), at('writer', 4.5), gain=0.16)
for i in range(7):
    tick(at('writer', 5.6 + i * 0.08), gain=0.03, pan=-0.6 + i * 0.2, f=2800)

whoosh(at('verse', 1.6), 1.2, gain=0.03)
SCALE = [note(n, o) for n, o in (('D', 3), ('E', 3), ('F', 3), ('G', 3), ('A', 3), ('Bb', 3), ('C', 4), ('D', 4), ('E', 4), ('F', 4), ('G', 4), ('A', 4))]
for i in range(6):
    for side in (0, 1):
        land = 2.6 + i * 0.32 + side * 0.12 + 1.25
        pluck(SCALE[i * 2 + side], at('verse', land), gain=0.1, pan=0.4 if side == 0 else 0.15, bright=2600)

m = TL['meter']
onsets = np.cumsum([0] + [u * m['unit'] for u in m['pattern']])[:-1]
length = sum(u * m['unit'] for u in m['pattern'])
for r in range(m['repeat']):
    p0 = at('memory', m['offset'] + r * (length + m['gap']))
    for u, o in zip(m['pattern'], onsets):
        if u == 2:
            dum(p0 + o, gain=0.2 if r else 0.17)
        else:
            tek(p0 + o, gain=0.09)
    pluck(note('D', 3), p0, gain=0.12, pan=-0.3)
chime(note('D', 6), at('memory', 1.1), gain=0.04)

for i in range(5):
    pluck(SCALE[2 + i], at('sciences', 1.0 + i * 0.32), gain=0.13, pan=-0.6 + i * 0.3)
for tt in ticks_along(at('sciences', 1.0), 3.2, 24):
    tick(tt, gain=0.02, f=3800)

whoosh(at('manuscript', 0.3), 1.4, gain=0.035, lo=200, hi=1600)
chime(note('A', 5), at('manuscript', 2.0), gain=0.05)
pluck(note('F', 3), at('manuscript', 5.0), gain=0.12, pan=-0.5)
pluck(note('A', 3), at('manuscript', 5.8), gain=0.12, pan=0.5)

# ---------- Part III ----------
# tape measure: a ratchet click every 2 cm of tape (24 px), following the unroll
ts = np.linspace(0, 2.6, 4000)
W = 2080 * np.interp(np.clip(ts / 2.6, 0, 1), EIO_X, EIO_Y)
marks = np.nonzero(np.diff(np.floor(W / 24)) > 0)[0]
for k in marks:
    tick(at('measure', 0.7 + ts[k]), gain=0.035, pan=-0.6 + 1.2 * W[k] / 2080, f=2600)
whoosh(at('measure', 0.7), 2.6, gain=0.025, lo=500, hi=3000)
for tt in ticks_along(at('measure', 3.6), 3.4, 26):
    tick(tt, gain=0.022, f=4000)
pluck(note('D', 3), at('measure', 3.4), gain=0.15)

pluck(note('A', 3), at('name', 0.8), gain=0.14, pan=-0.4)
pluck(note('D', 4), at('name', 1.4), gain=0.14, pan=0.4)
whoosh(at('name', 3.6), 1.2, gain=0.03)
chime(note('D', 6), at('name', 4.2), gain=0.05)

for i, nm in enumerate(('D', 'F', 'A', 'D')):
    octv = 4 if i == 3 else 3
    dum(at('clients', 1.8 + i * 0.45), gain=0.12)
    pluck(note(nm, octv), at('clients', 2.3 + i * 0.45), gain=0.15, pan=-0.5 + i * 0.33)
chime(note('A', 5), at('clients', 4.6), gain=0.04)

chalk(at('pattern', 0.5), 2.2)
chalk(at('pattern', 2.0), 1.7, pan=0.1)
for i in range(5):
    chalk(at('pattern', 3.2 + i * 0.35), 0.7, gain=0.025, pan=-0.3 + i * 0.15)
for i in range(3):
    pluck(note('F', 3) * (1, 1.12, 1.26)[i], at('pattern', 1.0 + i * 1.3), gain=0.1, pan=0.5)
chime(note('A', 5), at('pattern', 5.4), gain=0.04)

S = TL['sewing']['steps']
for i in range(5):
    pluck(SCALE[i * 2], at('sewing', S[i]), gain=0.15, pan=0.4)
    chime(SCALE[(i * 2 + 7) % len(SCALE)] * 2, at('sewing', S[i] + 0.05), gain=0.025, pan=0.4)
for tt in ticks_along(at('sewing', S[0]), 2.0, 34):
    tick(tt, gain=0.025, pan=-0.3, f=3600)
whoosh(at('sewing', S[1]), 1.5, gain=0.03, lo=200, hi=1200)
whoosh(at('sewing', S[2] + 0.5), 1.2, gain=0.03)
for tt in ticks_along(at('sewing', S[4]), 1.6, 40):
    tick(tt, gain=0.025, pan=-0.3, f=4400)
for i in range(3):
    chime(note('D', 6) * (1, 1.5, 2)[i], at('sewing', S[4] + 1.6 + i * 0.2), gain=0.03, pan=-0.5 + i * 0.3)
# oud arpeggio building through the sewing scene
ARP = [('D', 3), ('A', 3), ('D', 4), ('F', 4), ('A', 3), ('D', 4), ('E', 4), ('D', 4)]
t = at('sewing', S[1])
i = 0
while t < at('sewing', 13.6):
    k = (t - at('sewing', S[1])) / (13.6 - S[1])
    nm, octv = ARP[i % len(ARP)]
    pluck(note(nm, octv), t, gain=0.05 + 0.06 * k, pan=-0.25 + 0.5 * ((i % 2) - 0.5), dur=1.4, bright=2400)
    t += BEAT / 2
    i += 1

# ---------- finale ----------
swell(at('finale'), 1.2, gain=0.04)
gong(at('finale', 0.05), gain=0.1)
ney([('F', 4, 0.7), ('G', 4, 0.6), ('A', 4, 1.0), ('G', 4, 0.5), ('F', 4, 0.5), ('E', 4, 0.7), ('D', 4, 2.3)], at('finale', 0.4), gain=0.06)
chime(note('A', 5), at('finale', 0.9), gain=0.05)
chime(note('D', 6), at('finale', 1.7), gain=0.04, pan=-0.3)
pluck(note('D', 3), at('finale', 4.6), gain=0.14)

# ---------- reverb + master ----------
ir_n = int(2.6 * SR)
ir_t = np.arange(ir_n) / SR
ir = np.stack([lp(rng.normal(size=ir_n), 6000) * np.exp(-ir_t * 2.4) for _ in range(2)])
ir[:, : int(0.012 * SR)] = 0
ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
rev = np.stack([fftconvolve(wet[c], ir[c])[:N] for c in range(2)])
mix = dry + rev * 0.9
mix = np.stack([hp(c, 35) for c in mix])
mix = np.tanh(mix * 1.6) / 1.6
mix /= np.max(np.abs(mix)) / 0.89
fade = np.clip((DUR - np.arange(N) / SR) / 1.5, 0, 1)
mix *= fade

out = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'audio' / 'score.wav')
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out, f'{DUR}s')
