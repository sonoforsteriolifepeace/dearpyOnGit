"""Synthesise the soundtrack: a warm drone on D, slow plucked notes in the
Hijaz mode (oud-like), and a soft frame-drum hit at every scene change.
Reads src/timeline.json; writes public/soundtrack.wav (encode to m4a with ffmpeg)."""
import json, sys, wave
import numpy as np

SR = 48000
tl = json.load(open('src/timeline.json'))
starts, at = [], 0.0
for s in tl['scenes']:
    starts.append((s['id'], at))
    at += s['dur'] - tl['overlap']
total = starts[-1][1] + tl['scenes'][-1]['dur']
n = int(total * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(7)
out = np.zeros((n, 2))

def hz(semi):  # semitones from D3
    return 146.83 * 2 ** (semi / 12)

# Drone: D2 + A2 + D3, slow breathing.
breath = 0.75 + 0.25 * np.sin(2 * np.pi * t / 11.0)
drone = np.zeros(n)
for f, a in [(hz(-12), 0.5), (hz(-5), 0.25), (hz(0), 0.18), (hz(7), 0.06)]:
    drone += a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
fade = np.clip(t / 4, 0, 1) * np.clip((total - t) / 5, 0, 1)
drone *= 0.09 * breath * fade
out[:, 0] += drone
out[:, 1] += drone * 0.96

# Oud-like plucks (Karplus-Strong) on a Hijaz scale.
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16]
def pluck(freq, dur=2.6):
    N = int(SR / freq)
    buf = rng.uniform(-1, 1, N)
    m = int(dur * SR)
    y = np.empty(m)
    for i in range(m):
        y[i] = buf[i % N]
        buf[i % N] = 0.5 * (buf[i % N] + buf[(i + 1) % N]) * 0.996
    return y * np.exp(-np.arange(m) / SR * 1.2)

cache = {}
phrase = [0, 1, 4, 5, 4, 1, 0, 7, 5, 4, 5, 1, 0]
beat = 1.6
k = 0
time = 4.0
while time < total - 6:
    deg = phrase[k % len(phrase)]
    if k % 7 != 6:  # breathe
        semi = HIJAZ[HIJAZ.index(deg)] if deg in HIJAZ else deg
        if semi not in cache:
            cache[semi] = pluck(hz(semi))
        y = cache[semi]
        i0 = int(time * SR)
        seg = y[: max(0, min(len(y), n - i0))]
        pan = 0.5 + 0.3 * np.sin(k * 1.3)
        vel = 0.10 * (0.8 + 0.2 * rng.random())
        out[i0:i0 + len(seg), 0] += seg * vel * (1 - pan)
        out[i0:i0 + len(seg), 1] += seg * vel * pan
    time += beat * (1.5 if k % 4 == 3 else 1)
    k += 1

# Frame drum (bendir) at each scene start.
def bendir():
    m = int(1.2 * SR)
    tt = np.arange(m) / SR
    f = 70 * (1 + 0.6 * np.exp(-tt * 18))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5)
    snare = rng.normal(0, 1, m) * np.exp(-tt * 9) * 0.25
    return body + snare
hit = bendir()
for sid, st in starts[1:]:
    i0 = int(max(0, st - 0.05) * SR)
    seg = hit[: max(0, min(len(hit), n - i0))]
    g = 0.22 if sid.endswith('title') else 0.1
    out[i0:i0 + len(seg)] += (seg * g)[:, None]

# Gentle reverb: a few feedback delays.
for d, g in [(0.113, 0.25), (0.171, 0.2), (0.241, 0.15), (0.373, 0.1)]:
    s = int(d * SR)
    out[s:, 0] += g * out[:-s, 1]
    out[s:, 1] += g * out[:-s, 0]

out /= np.max(np.abs(out)) / 0.7
pcm = (out * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'public/soundtrack.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'{total:.1f}s')
