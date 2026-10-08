import React, {useMemo} from 'react';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {clamp} from '../anim';
import {C} from '../theme';

// A sewing needle pointing along +x, eye at the back.
export const Needle: React.FC<{x: number; y: number; angle: number; color?: string; scale?: number; opacity?: number}> = ({
  x,
  y,
  angle,
  color = C.ink,
  scale = 1,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`} opacity={opacity}>
    <path d="M6 0 L-30 -2.6 Q-36 0 -30 2.6 Z" fill={color} />
    <ellipse cx={-28} cy={0} rx={3.2} ry={1.1} fill="#EFE6D3" />
  </g>
);

const tip = (d: string, len: number, p: number) => {
  const l = clamp(p) * len;
  const pt = getPointAtLength(d, l);
  const tg = getTangentAtLength(d, Math.max(0.01, Math.min(len - 0.01, l)));
  return {x: pt?.x ?? 0, y: pt?.y ?? 0, angle: tg ? (Math.atan2(tg.y, tg.x) * 180) / Math.PI : 0};
};

// A path that draws itself; optionally led by a needle.
export const Thread: React.FC<{
  d: string;
  p: number;
  color?: string;
  width?: number;
  needle?: boolean;
  needleColor?: string;
  opacity?: number;
  cap?: 'round' | 'butt';
  dash?: number[];
}> = ({d, p, color = C.gold, width = 3, needle, needleColor, opacity = 1, cap = 'round', dash}) => {
  const len = useMemo(() => getLength(d), [d]);
  const pp = clamp(p);
  if (pp <= 0) return null;
  let dasharray: string;
  if (dash) {
    // Dashed thread revealed stitch by stitch.
    const unit = dash[0] + dash[1];
    const shown = len * pp;
    const n = Math.floor(shown / unit);
    const arr: number[] = [];
    for (let i = 0; i < n; i++) arr.push(dash[0], dash[1]);
    arr.push(Math.min(dash[0], shown - n * unit), len * 2);
    dasharray = arr.map((v) => v.toFixed(2)).join(' ');
  } else {
    dasharray = `${(len * pp).toFixed(2)} ${(len * 2).toFixed(2)}`;
  }
  const n = needle && pp < 1 ? tip(d, len, pp) : null;
  return (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap={cap} strokeLinejoin="round" strokeDasharray={dasharray} />
      {n ? <Needle x={n.x} y={n.y} angle={n.angle} color={needleColor ?? C.ink} /> : null}
    </g>
  );
};

// Point on a path at progress p, for markers that travel along it.
export const usePathPoint = (d: string, p: number) => {
  const len = useMemo(() => getLength(d), [d]);
  return tip(d, len, p);
};
