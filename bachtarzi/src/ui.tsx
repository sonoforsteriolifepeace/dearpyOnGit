import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, ramp, span} from './theme';

export const useTime = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

/** Scene wrapper: fades in and out over its own duration (seconds). */
export const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const t = useTime();
  return <AbsoluteFill style={{opacity: span(t, 0, dur, 0.5)}}>{children}</AbsoluteFill>;
};

export type Line = [number, number, string];

/** Narration lines in the lower third. */
export const Caption: React.FC<{lines: Line[]}> = ({lines}) => {
  const t = useTime();
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 260,
          background: 'linear-gradient(to top, rgba(6,11,18,0.88), rgba(6,11,18,0))',
        }}
      />
      {lines.map(([a, b, text], i) => {
        const o = span(t, a, b, 0.4);
        if (o <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 70,
              width: 1720,
              textAlign: 'center',
              fontFamily: F.serif,
              fontWeight: 500,
              fontSize: 44,
              lineHeight: 1.25,
              color: C.parchment,
              opacity: o,
              transform: `translateY(${(1 - ramp(t, a, a + 0.6)) * 14}px)`,
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}
          >
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 8-pointed star (two overlapping squares) as a path string. */
export const octagram = (cx: number, cy: number, r: number, rot = 0) => {
  const sq = (off: number) => {
    const pts = [0, 1, 2, 3].map((k) => {
      const a = rot + off + (k * Math.PI) / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return `M${pts.join('L')}Z`;
  };
  return sq(0) + sq(Math.PI / 4);
};

/** Star with 16 vertices alternating radii, as a closed outline. */
export const star8 = (cx: number, cy: number, r: number, inner = 0.7, rot = 0) => {
  const pts: string[] = [];
  for (let k = 0; k < 16; k++) {
    const a = rot + (k * Math.PI) / 8 - Math.PI / 2;
    const rr = k % 2 ? r * inner : r;
    pts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);
  }
  return `M${pts.join('L')}Z`;
};

/** Path drawn progressively (p in 0..1). */
export const Draw: React.FC<React.SVGProps<SVGPathElement> & {p: number}> = ({p, ...rest}) => (
  <path
    pathLength={1}
    strokeDasharray="1 1"
    strokeDashoffset={1 - p}
    fill="none"
    opacity={p <= 0.001 ? 0 : rest.opacity ?? 1}
    {...rest}
  />
);

/** Round medallion with an octagram, a French title and an Arabic title. */
export const Medallion: React.FC<{
  x: number;
  y: number;
  r: number;
  p: number;
  title?: string;
  ar?: string;
  sub?: string;
  color?: string;
  fill?: string;
  labelBelow?: boolean;
  spin?: number;
}> = ({x, y, r, p, title, ar, sub, color = C.gold, fill = C.ink, labelBelow = true, spin = 0}) => {
  const fillO = ramp(p, 0.3, 0.8);
  const textO = ramp(p, 0.55, 1);
  return (
    <g>
      <circle cx={x} cy={y} r={r * (0.6 + 0.4 * ramp(p, 0, 0.5))} fill={fill} opacity={fillO} />
      <Draw d={`M${x},${y - r}a${r},${r} 0 1,1 -0.01,0`} p={ramp(p, 0, 0.6)} stroke={color} strokeWidth={3} />
      <Draw d={octagram(x, y, r * 0.78, spin)} p={ramp(p, 0.2, 0.9)} stroke={color} strokeWidth={1.6} opacity={0.75} />
      <circle cx={x} cy={y} r={r * 0.42} fill="none" stroke={color} strokeWidth={1.2} opacity={0.5 * fillO} />
      {ar && (
        <text
          x={x}
          y={y + r * 0.14}
          textAnchor="middle"
          fontFamily={F.arabic}
          fontWeight={700}
          fontSize={r * 0.36}
          fill={C.parchment}
          opacity={textO}
          direction="rtl"
        >
          {ar}
        </text>
      )}
      {title && (
        <text
          x={x}
          y={labelBelow ? y + r + 52 : y - r - 30}
          textAnchor="middle"
          fontFamily={F.serif}
          fontWeight={700}
          fontSize={40}
          fill={C.parchment}
          opacity={textO}
        >
          {title}
        </text>
      )}
      {sub && (
        <text
          x={x}
          y={labelBelow ? y + r + 92 : y - r - 70}
          textAnchor="middle"
          fontFamily={F.sans}
          fontSize={22}
          letterSpacing={3}
          fill={color}
          opacity={textO}
        >
          {sub.toUpperCase()}
        </text>
      )}
    </g>
  );
};

/** Running stitches along a straight segment, with a needle at the head. */
export const Stitches: React.FC<{
  x1: number;
  x2: number;
  y: number;
  p: number;
  color?: string;
  len?: number;
  gap?: number;
  needle?: boolean;
}> = ({x1, x2, y, p, color = C.gold, len = 22, gap = 14, needle = true}) => {
  const n = Math.floor((x2 - x1) / (len + gap));
  const head = x1 + (x2 - x1) * p;
  const items = [];
  for (let i = 0; i < n; i++) {
    const sx = x1 + i * (len + gap);
    if (sx + len > head) break;
    items.push(<line key={i} x1={sx} x2={sx + len} y1={y} y2={y} stroke={color} strokeWidth={4} strokeLinecap="round" />);
  }
  const showNeedle = needle && p > 0.001 && p < 0.999;
  const bob = Math.sin(p * n * Math.PI) * 10;
  return (
    <g>
      {items}
      {showNeedle && (
        <g transform={`translate(${head},${y + bob}) rotate(-18)`}>
          <line x1={-6} y1={0} x2={-260} y2={0} stroke={color} strokeWidth={1.5} opacity={0.5} />
          <path d="M0,0 L60,-3 Q66,0 60,3 Z" fill={C.parchment} />
          <ellipse cx={52} cy={0} rx={4} ry={1.2} fill={C.night} />
        </g>
      )}
    </g>
  );
};

/** Large centred title used by the part cards. */
export const Kicker: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div
    style={{
      position: 'absolute',
      top: 38,
      left: 50,
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '10px 22px 10px 14px',
      borderRadius: 40,
      background: 'rgba(11,20,32,0.72)',
      opacity: o,
      fontFamily: F.sans,
      fontWeight: 600,
      fontSize: 20,
      letterSpacing: 4,
      color: C.gold,
      textTransform: 'uppercase',
    }}
  >
    <svg width={30} height={30} viewBox="-15 -15 30 30">
      <path d={octagram(0, 0, 12)} fill="none" stroke={C.gold} strokeWidth={1.6} />
    </svg>
    {text}
  </div>
);
