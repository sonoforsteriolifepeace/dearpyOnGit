#!/usr/bin/env python3
"""Lit d'ambiance de 3 minutes (sans voix) pour l'animation : synthèse pure, numpy seul.

Mode D « hijaz » (ré, mi♭, fa♯, sol, la, si♭, do). Trois parties, comme le film :
  I   0–60 s    bourdon + oud rare, aucune percussion (le maître et la voie)
  II  60–120 s  cadre de bendir doux, mélodie plus haute (la poésie, la cadence)
  III 120–180 s + « aiguille » : petits tics réguliers (le tailleur), résolution finale

Pensé pour passer sous une voix : niveau bas, peu de fréquences médiums.
Usage : python3 audio.py out/musique.wav
"""
import sys
import wave
import numpy as np

SR = 44100
DUR = 180.0
N = int(SR * DUR)
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(buf, x, t, pan=0.0, gain=1.0):
    """Ajoute le signal mono x à l'instant t dans le buffer stéréo, avec panoramique."""
    i = int(t * SR)
    if i >= buf.shape[0]:
        return
    n = min(len(x), buf.shape[0] - i)
    l = gain * np.cos((pan + 1) * np.pi / 4)
    r = gain * np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += x[:n] * l
    buf[i:i + n, 1] += x[:n] * r


def pluck(freq, dur=3.2, decay=0.9965, bright=0.62):
    """Corde pincée type oud (Karplus-Strong par blocs) + un peu de corps de caisse."""
    L = max(8, int(round(SR / freq)))
    n = int(dur * SR) + L * 2
    n = ((n + L - 1) // L + 1) * L          # multiple de L : dernier bloc complet
    y = np.zeros(n)
    exc = rng.standard_normal(L)
    # excitation : bruit lissé (plus ou moins brillant)
    k = max(1, int(round(6 * (1 - bright)))) + 1
    exc = np.convolve(exc, np.ones(k) / k, mode='same')
    exc *= np.hanning(L) ** 0.3
    y[:L] = exc
    for s in range(L, n, L):
        prev = y[s - L:s]
        shifted = np.concatenate([[y[s - L - 1]], prev[:-1]])
        y[s:s + L] = decay * 0.5 * (prev + shifted)
    y = y[L:L + int(dur * SR)]
    env = np.minimum(1, np.arange(len(y)) / (0.004 * SR)) * np.exp(-np.arange(len(y)) / (SR * dur * 0.55))
    y = y * env
    # corps : résonance douce vers 200 Hz
    body = np.convolve(y, np.hanning(int(SR / 200)) / np.hanning(int(SR / 200)).sum(), mode='same')
    y = y + 0.5 * body
    return y / (np.max(np.abs(y)) + 1e-9)


def pad(freqs, dur, vib=0.18):
    """Nappe : harmoniques douces, deux voix légèrement désaccordées, respiration lente."""
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for f in freqs:
        for det, ph in ((0.9985, 0.0), (1.0015, 1.7)):
            for h, a in ((1, 1.0), (2, 0.42), (3, 0.2), (4, 0.09), (5, 0.04)):
                out += a * np.sin(2 * np.pi * f * det * h * t + ph * h)
    out *= 0.55 + 0.45 * np.sin(2 * np.pi * vib * t + 0.6)
    a = np.minimum(1, t / 3.5) * np.minimum(1, (dur - t) / 3.5)
    return out * a / (np.max(np.abs(out)) + 1e-9)


def dum(f0=118.0):
    t = np.arange(int(0.5 * SR)) / SR
    f = 62 + (f0 - 62) * np.exp(-t * 22)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 9)
    n = rng.standard_normal(len(t))
    n = np.convolve(n, np.ones(14) / 14, mode='same') * np.exp(-t * 60) * 0.25
    return y + n


def tek(bright=1.0):
    t = np.arange(int(0.12 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = n - np.convolve(n, np.ones(10) / 10, mode='same')   # passe-haut grossier
    return n * np.exp(-t * 55) * 0.5 * bright


def tick():
    t = np.arange(int(0.05 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = n - np.convolve(n, np.ones(6) / 6, mode='same')
    return n * np.exp(-t * 130) * 0.5 + 0.35 * np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 160)


def reverb(x, tail=2.8, wet=0.28):
    L = int(tail * SR)
    t = np.arange(L) / SR
    out = np.zeros_like(x)
    for c in range(2):
        ir = rng.standard_normal(L) * np.exp(-t * 2.4)
        ir[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir = np.convolve(ir, np.ones(5) / 5, mode='same')   # adoucit les aigus
        ir /= np.sqrt(np.sum(ir ** 2))
        m = 1 << (len(x) + L).bit_length()
        y = np.fft.irfft(np.fft.rfft(x[:, c], m) * np.fft.rfft(ir, m), m)[:len(x)]
        out[:, c] = y
    return x * (1 - wet) + out * wet * 2.2


mix = np.zeros((N, 2))

# ------------------------------------------------------------- bourdon (ré + la) sur tout le film
D2, A2, D3 = hz(38), hz(45), hz(50)
for t0, t1, notes, g in ((0, 62, (D2, A2), 1.0), (58, 122, (D2, A2, D3), 1.1), (118, 180, (D2, A2, D3, hz(57)), 1.2)):
    place(mix, pad(notes, t1 - t0), t0, 0.0, g)

# ------------------------------------------------------------- oud : phrases en mode hijaz
D4, Eb4, Fs4, G4, A4, Bb4, C5, D5 = 62, 63, 66, 67, 69, 70, 72, 74
P1 = [  # (instant, [(note, durée-avant-suivante)…])
    (2.0, [(A4, .9), (G4, .9), (Fs4, 1.0), (Eb4, 1.2), (D4, 3.0)]),
    (13.0, [(D4, 1.0), (Eb4, 1.0), (Fs4, 1.4), (Eb4, 1.0), (D4, 3.5)]),
    (25.0, [(Fs4, .8), (G4, .8), (A4, 1.2), (Bb4, 1.2), (A4, 1.0), (G4, 1.0), (Fs4, 3.0)]),
    (40.0, [(D5, 1.0), (C5, 0.9), (Bb4, 0.9), (A4, 1.2), (G4, 1.0), (Fs4, 1.0), (Eb4, 1.0), (D4, 3.5)]),
    (53.0, [(A4, 1.2), (Fs4, 1.2), (Eb4, 1.3), (D4, 4.0)]),
]
P2 = [
    (61.0, [(D5, .75), (C5, .75), (Bb4, .75), (A4, 1.0), (Bb4, .75), (A4, .75), (G4, 1.5)]),
    (72.0, [(Fs4, .5), (G4, .5), (A4, .75), (G4, .5), (Fs4, .5), (Eb4, 1.0), (D4, 2.2)]),
    (83.0, [(A4, .5), (Bb4, .5), (C5, .75), (Bb4, .5), (A4, .75), (G4, .75), (Fs4, 1.0), (G4, 2.0)]),
    (95.0, [(D5, .5), (D5, .5), (C5, .5), (Bb4, .75), (A4, .5), (G4, .5), (Fs4, 1.0), (Eb4, 1.0), (D4, 2.2)]),
    (107.0, [(Fs4, .75), (A4, .75), (D5, 1.0), (C5, .75), (Bb4, .75), (A4, 1.2), (G4, 2.4)]),
]
P3 = [
    (121.0, [(A4, .75), (G4, .75), (Fs4, .75), (G4, .75), (A4, 1.0), (Bb4, 1.0), (A4, 2.0)]),
    (134.0, [(D5, .5), (C5, .5), (Bb4, .5), (A4, .5), (G4, .5), (Fs4, .5), (Eb4, .75), (D4, 2.4)]),
    (146.0, [(Fs4, .6), (A4, .6), (D5, .8), (C5, .6), (Bb4, .6), (A4, .8), (G4, .8), (Fs4, 2.0)]),
    (158.0, [(D4, .6), (Eb4, .6), (Fs4, .6), (G4, .6), (A4, .6), (Bb4, .6), (C5, .6), (D5, 1.8)]),
    (168.0, [(A4, 1.0), (G4, 1.0), (Fs4, 1.2), (Eb4, 1.4), (D4, 6.0)]),
]
for part, base_gain in ((P1, 0.9), (P2, 1.0), (P3, 1.0)):
    for t0, notes in part:
        t = t0
        for i, (m, d) in enumerate(notes):
            place(mix, pluck(hz(m), dur=max(2.4, d + 1.6), bright=0.5), t, pan=-0.25 + 0.5 * ((i * 37 % 7) / 7), gain=0.34 * base_gain)
            t += d
# octave grave sur les notes finales de chaque partie (poids)
for t in (6.0, 58.0, 118.0, 174.0):
    place(mix, pluck(hz(50), dur=5.0, decay=0.9985, bright=0.3), t, 0.0, 0.4)

# ------------------------------------------------------------- bendir : parties II et III
BPM = 72
beat = 60.0 / BPM
pat = [('d', 0), ('t', 1.0), ('x', 1.5), ('t', 2.0), ('d', 2.5), ('t', 3.0), ('t', 3.5)]   # sur 4 temps
bars = int(DUR / (beat * 4)) + 1
for bar in range(bars):
    t_bar = bar * beat * 4
    if t_bar < 61.0 or t_bar > 177:
        continue
    vol = 0.55 if t_bar < 120 else 0.7
    for kind, off in pat:
        t = t_bar + off * beat
        if kind == 'd':
            place(mix, dum(), t, -0.05, 0.62 * vol)
        elif kind == 't':
            place(mix, tek(), t, 0.15, 0.32 * vol)
        else:
            place(mix, tek(0.5), t, -0.15, 0.2 * vol)

# ------------------------------------------------------------- aiguille : partie III
tk = tick()
t = 120.5
k = 0
while t < 176:
    place(mix, tk, t, pan=(-0.55 if k % 2 else 0.55), gain=0.16 + 0.03 * ((k % 4) == 0))
    t += beat / 2
    k += 1

# ------------------------------------------------------------- repères de chapitre : grosse caisse + nappe
for t in (60.0, 120.0):
    place(mix, dum(95.0), t, 0.0, 1.1)
    place(mix, pad((hz(50), hz(57), hz(62)), 8.0, 0.1), t, 0.0, 0.5)

# ------------------------------------------------------------- final
mix = reverb(mix)
t = np.arange(N) / SR
fade = np.minimum(1, t / 2.5) * np.minimum(1, (DUR - t) / 3.0) ** 1.5
mix *= fade[:, None]
peak = np.max(np.abs(mix))
mix *= 10 ** (-9 / 20) / peak          # crête à −9 dBFS : sous une voix, il reste de la marge

out = sys.argv[1] if len(sys.argv) > 1 else 'out/musique.wav'
pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-12)
print(f'{out} · {DUR:.0f} s · crête −9 dBFS · RMS {rms:.1f} dBFS')
