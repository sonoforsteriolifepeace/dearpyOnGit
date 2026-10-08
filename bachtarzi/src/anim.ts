import {Easing} from 'remotion';
import TL from './timeline.json';

export const FPS = TL.fps;
export const W = TL.width;
export const H = TL.height;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const eOut = Easing.bezier(0.22, 1, 0.36, 1);
export const eInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const eBack = Easing.bezier(0.34, 1.56, 0.64, 1);

// Eased 0..1 progress of an animation starting at t0 (s) lasting d (s).
export const prog = (t: number, t0: number, d: number, e: (k: number) => number = eOut) =>
  e(clamp((t - t0) / d));

// 0 → 1 → 0 envelope: in over `a`, hold, out over `b` before `t1`.
export const env = (t: number, t0: number, t1: number, a = 0.5, b = 0.5) =>
  Math.min(prog(t, t0, a), 1 - prog(t, t1 - b, b, eInOut));

// Deterministic PRNG (mulberry32).
export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};

type Pt = [number, number];

// Catmull-Rom spline through points, as an SVG path.
export const smooth = (pts: Pt[], closed = false, tension = 0.5) => {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const k = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return closed ? d + ' Z' : d;
};

export const poly = (pts: Pt[], closed = true) =>
  'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L') + (closed ? ' Z' : '');

// Regular 8-pointed star {8/2} (khatam) centred on (cx, cy).
export const star8 = (cx: number, cy: number, R: number, rot = 0) => {
  const r = R * 0.7654;
  const pts: Pt[] = [];
  for (let i = 0; i < 16; i++) {
    const a = rot + (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 === 0 ? R : r;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return poly(pts);
};

export const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy}`;

// Quadratic arc from a to b bowing through control point c.
export const arc = (a: Pt, c: Pt, b: Pt) => `M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
