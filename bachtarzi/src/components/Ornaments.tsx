import React from 'react';
import {circle, clamp, prog, star8} from '../anim';
import {C} from '../theme';
import {Thread} from './Thread';

// Gold rosette: outer ring, 8-pointed star, inner star; drawn by a thread.
export const Rosette: React.FC<{cx: number; cy: number; R: number; p: number; color?: string; rot?: number; fill?: string}> = ({
  cx,
  cy,
  R,
  p,
  color = C.gold,
  rot = 0,
  fill,
}) => {
  const p1 = clamp(p / 0.45);
  const p2 = clamp((p - 0.25) / 0.5);
  const p3 = clamp((p - 0.55) / 0.45);
  return (
    <g>
      {fill ? <path d={star8(cx, cy, R * 0.86, rot)} fill={fill} opacity={p3} /> : null}
      <Thread d={circle(cx, cy, R)} p={p1} color={color} width={2.2} />
      <Thread d={circle(cx, cy, R * 1.07)} p={p1} color={color} width={1} opacity={0.6} />
      <Thread d={star8(cx, cy, R * 0.86, rot)} p={p2} color={color} width={2.6} />
      <Thread d={star8(cx, cy, R * 0.42, rot + Math.PI / 8)} p={p3} color={color} width={1.8} />
    </g>
  );
};

// Circular medallion with a star and an Arabic name.
export const Medallion: React.FC<{
  t: number;
  at: number;
  cx: number;
  cy: number;
  r: number;
  ar: string;
  arSize?: number;
  tone?: string;
  glow?: number;
}> = ({t, at, cx, cy, r, ar, arSize = 54, tone = C.gold, glow = 0}) => {
  const p = prog(t, at, 1.6);
  const k = prog(t, at + 0.6, 0.9);
  return (
    <g>
      {glow > 0 ? <circle cx={cx} cy={cy} r={r * 1.35} fill={tone} opacity={0.14 * glow} /> : null}
      <circle cx={cx} cy={cy} r={r} fill={C.paperHi} opacity={k * 0.9} />
      <path d={star8(cx, cy, r * 0.92)} fill={tone} opacity={0.08 * k} />
      <Thread d={circle(cx, cy, r)} p={p} color={tone} width={3} />
      <Thread d={circle(cx, cy, r * 0.9)} p={p} color={tone} width={1.2} opacity={0.7} />
      <Thread d={star8(cx, cy, r * 0.92)} p={clamp((p - 0.3) / 0.7)} color={tone} width={1.4} opacity={0.6} />
      <text
        x={cx}
        y={cy + arSize * 0.12}
        textAnchor="middle"
        dominantBaseline="middle"
        direction="rtl"
        style={{fontFamily: 'Amiri, serif', fontWeight: 700, fontSize: arSize}}
        fill={C.ink}
        opacity={k}
      >
        {ar}
      </text>
    </g>
  );
};

// Caftan silhouette in a 600×800 box (front view).
export const CAFTAN =
  'M255 60 Q300 98 345 60 L468 104 Q540 210 588 330 L508 372 L446 240 L470 760 Q300 792 130 760 L154 240 L92 372 L12 330 Q60 210 132 104 Z';
export const CAFTAN_OPENING = 'M300 80 L300 778';
export const CAFTAN_HEM = 'M132 748 Q300 780 468 748';
export const VEST = 'M252 62 Q300 98 348 62 L452 100 L442 238 L456 436 Q300 456 144 436 L158 238 L148 100 Z';

// Small caftan icon with increasing amounts of gold trim (level 0..3).
export const CaftanIcon: React.FC<{x: number; y: number; h: number; level: number; p: number; dark?: boolean}> = ({x, y, h, level, p, dark}) => {
  const s = h / 800;
  const body = dark ? ['#3B4A6E', '#5A2A38', '#2F5B4C', '#6E2333'][level] : C.indigo;
  const k = clamp(p);
  return (
    <g transform={`translate(${x - 300 * s} ${y - 800 * s}) scale(${s})`} opacity={k}>
      <path d={CAFTAN} fill={body} stroke={C.goldHi} strokeWidth={level > 0 ? 6 : 3} strokeOpacity={level > 0 ? 0.9 : 0.5} />
      {level >= 1 ? <path d={CAFTAN_OPENING} stroke={C.goldHi} strokeWidth={14} /> : null}
      {level >= 2 ? <path d={VEST} fill="rgba(0,0,0,0.25)" stroke={C.goldHi} strokeWidth={8} /> : null}
      {level >= 2
        ? [150, 210, 270, 330, 390].map((yy) => <circle key={yy} cx={300} cy={yy} r={11} fill={C.goldHi} />)
        : null}
      {level >= 3 ? (
        <>
          <path d={CAFTAN_HEM} fill="none" stroke={C.goldHi} strokeWidth={22} />
          <path d="M20 326 L96 366" stroke={C.goldHi} strokeWidth={20} />
          <path d="M580 326 L504 366" stroke={C.goldHi} strokeWidth={20} />
          <path d={star8(300, 560, 70)} fill="none" stroke={C.goldHi} strokeWidth={8} />
        </>
      ) : null}
    </g>
  );
};

// Domed shrine (qubba) line drawing, base centred at (0,0), ~300 tall.
export const QUBBA_PARTS = [
  'M-112 0 L-112 -118 L112 -118 L112 0',
  'M-124 0 L124 0',
  'M-30 0 L-30 -58 Q0 -96 30 -58 L30 0',
  'M-122 -118 L122 -118 L122 -132 L-122 -132 Z',
  'M-96 -132 Q-100 -238 0 -262 Q100 -238 96 -132',
  'M0 -262 L0 -300',
  'M-10 -312 A14 14 0 1 0 10 -312 A10 10 0 1 1 -10 -312',
];

export const Qubba: React.FC<{x: number; y: number; s: number; p: number; color: string; fill: string; fillOpacity: number}> = ({
  x,
  y,
  s,
  p,
  color,
  fill,
  fillOpacity,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-112 0 L-112 -132 L-96 -132 Q-100 -238 0 -262 Q100 -238 96 -132 L112 -132 L112 0 Z" fill={fill} opacity={fillOpacity} />
    {QUBBA_PARTS.map((d, i) => (
      <Thread key={i} d={d} p={clamp((p - i * 0.08) / 0.5)} color={color} width={3 / s} />
    ))}
  </g>
);

// Abstract verse line: two hemistichs with a rhyme dot at the (RTL) end.
export const VerseBars: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  gap?: number;
  color?: string;
  dot?: string;
  k?: number;
}> = ({x, y, w, h = 8, gap = 36, color = C.ink, dot = C.gold, k = 1}) => {
  const hw = (w - gap) / 2;
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={hw * k} height={h} rx={h / 2} fill={color} />
      <rect x={x + hw + gap + hw * (1 - k)} y={y} width={hw * k} height={h} rx={h / 2} fill={color} />
      <circle cx={x - 12} cy={y + h / 2} r={h * 0.62} fill={dot} opacity={k} />
      <circle cx={x + hw + gap - 12} cy={y + h / 2} r={h * 0.62} fill={dot} opacity={k} />
    </g>
  );
};
