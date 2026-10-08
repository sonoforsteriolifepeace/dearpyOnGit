import { createContext, useContext } from 'react';
import { Easing } from 'remotion';

/** Temps absolu de la composition, en secondes. */
export const TimeCtx = createContext(0);
export const useT = () => useContext(TimeCtx);

export type EaseFn = (x: number) => number;
export const lin: EaseFn = x => x;
export const eo: EaseFn = Easing.bezier(0.16, 1, 0.3, 1); // sortie « expo »
export const eio: EaseFn = Easing.bezier(0.65, 0, 0.35, 1);
export const ei: EaseFn = Easing.bezier(0.7, 0, 0.84, 0);
export const eb: EaseFn = Easing.bezier(0.34, 1.45, 0.64, 1); // petit rebond

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Progression 0→1 de `a` sur `d` secondes. */
export const p = (t: number, a: number, d: number, ease: EaseFn = lin) => ease(clamp((t - a) / d));

/** Fenêtre : 0 → 1 à l'entrée, reste à 1, puis 1 → 0 à la sortie. */
export const win = (t: number, a: number, b: number, din = 0.5, dout = 0.5, ease: EaseFn = lin) =>
  Math.min(p(t, a, din, ease), 1 - p(t, b - dout, dout, ease));

/** Interpolation par images-clés : frames = [[temps, v1, v2…], …], avec accélération entre chaque. */
export function kf(t: number, frames: number[][], ease: EaseFn = eio): number[] {
  if (t <= frames[0][0]) return frames[0].slice(1);
  for (let i = 1; i < frames.length; i++) {
    if (t <= frames[i][0]) {
      const k = ease(clamp((t - frames[i - 1][0]) / (frames[i][0] - frames[i - 1][0])));
      return frames[i].slice(1).map((v, j) => mix(frames[i - 1][j + 1], v, k));
    }
  }
  return frames[frames.length - 1].slice(1);
}

/** Bruit pseudo-aléatoire déterministe. */
export function rand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
