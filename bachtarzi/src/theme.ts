import {Easing, interpolate} from 'remotion';
import timeline from './timeline.json';

export const C = {
  night: '#0b1420',
  ink: '#132033',
  inkSoft: '#1d2d45',
  gold: '#d6aa5c',
  goldSoft: '#a8834a',
  parchment: '#efe3c8',
  parchmentDim: '#c9bb9a',
  red: '#a3352a',
  green: '#4f8a68',
  velvet: '#6e1f2e',
  sea: '#10233a',
  land: '#d8c7a0',
};

export const F = {
  serif: '"Cormorant Garamond", Georgia, serif',
  arabic: 'Amiri, "Times New Roman", serif',
  sans: 'Inter, Arial, sans-serif',
};

export const FPS = timeline.fps;
export const OVERLAP = timeline.overlap;

/** Start time (s) of every scene, scenes overlap by OVERLAP for crossfades. */
export const SCENES = (() => {
  let at = 0;
  return timeline.scenes.map((s) => {
    const out = {...s, start: at};
    at += s.dur - OVERLAP;
    return out;
  });
})();

export const TOTAL = SCENES[SCENES.length - 1].start + SCENES[SCENES.length - 1].dur;

export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 between a and b (seconds), clamped and eased. */
export const ramp = (t: number, a: number, b: number, e = ease) =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: e,
  });

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Fade in at a, fade out at b. */
export const span = (t: number, a: number, b: number, fade = 0.45) =>
  Math.min(ramp(t, a, a + fade), 1 - ramp(t, b - fade, b));
