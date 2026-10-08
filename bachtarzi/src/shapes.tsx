import React, { useId } from 'react';
import { C } from './theme';
import { clamp, eb, eio, p, rand, useT } from './anim';
import { Ar, star8Path } from './kit';

/** Médaillon : étoile à 8 branches, texte centré (noms, mots-clés). */
export const Medal: React.FC<{
  cx: number; cy: number; r: number; at: number; children?: React.ReactNode;
  scale?: number; dim?: number; glow?: number; color?: string; fill?: string; ring?: boolean;
}> = ({ cx, cy, r, at, children, scale = 1, dim = 1, glow = 0, color = C.gold, fill = 'rgba(5,12,12,0.58)', ring = true }) => {
  const t = useT();
  const gid = 'g' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const k = p(t, at, 0.9, eb);
  if (k <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r,
      transform: `scale(${k * scale})`, opacity: dim * clamp(k * 2.5),
    }}>
      <svg viewBox={`${-r} ${-r} ${2 * r} ${2 * r}`} width={2 * r} height={2 * r} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <radialGradient id={gid}>
            <stop offset="0.45" stopColor={color} stopOpacity={0.24 * Math.min(1, glow)} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>
        {glow > 0 && <circle r={r * 1.75} fill={`url(#${gid})`} />}
        <path d={star8Path(0, 0, r * 0.98)} fill={fill} stroke={color} strokeWidth={3.2} strokeLinejoin="round" />
        <path d={star8Path(0, 0, r * 0.82, Math.PI / 8)} fill="none" stroke={color} strokeOpacity={0.4} strokeWidth={1.8} />
        {ring && <circle r={r * 0.6} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={1.5} strokeDasharray="5 8" />}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
      }}>{children}</div>
    </div>
  );
};

/** Manuscrit déroulé : deux rouleaux, lignes d'encre, titre arabe. */
export const Scroll: React.FC<{
  x: number; y: number; w: number; h: number; at: number; dur?: number; title?: string; lines?: number;
  verse?: boolean; seed?: number; ink?: number; titleSize?: number; scale?: number;
}> = ({ x, y, w, h, at, dur = 1.6, title, lines = 7, verse = false, seed = 4, ink = 1, titleSize = 54, scale = 1 }) => {
  const t = useT();
  const k = p(t, at, dur, eio);
  if (k <= 0) return null;
  const rl = 22;
  const paperH = (h - rl * 2) * k;
  const r = rand(seed);
  const rows = Array.from({ length: lines }, () => ({ a: 0.62 + r() * 0.38, b: 0.5 + r() * 0.5 }));
  const top = title ? titleSize * 1.3 + 64 : 38;
  const rowGap = (h - rl * 2 - top - 34) / Math.max(1, lines - 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'center' }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <rect x={14} y={rl} width={w - 28} height={paperH} fill="#E9DDBF" />
        <clipPath id={`scl${seed}`}><rect x={14} y={rl} width={w - 28} height={Math.max(0, paperH)} /></clipPath>
        <g clipPath={`url(#scl${seed})`} opacity={clamp(k * 3)}>
          {rows.map((rw, i) => {
            const yy = rl + top + i * rowGap;
            const inkA = 0.62 * ink;
            if (verse) {
              const mid = w / 2, gapW = 34, full = (w - 28 - 72 - gapW) / 2;
              return (
                <g key={i}>
                  <rect x={mid + gapW / 2} y={yy} width={full * rw.a} height={6} rx={3} fill="#2C2013" opacity={inkA} />
                  <rect x={mid - gapW / 2 - full * rw.b} y={yy} width={full * rw.b} height={6} rx={3} fill="#2C2013" opacity={inkA} />
                  <path d={star8Path(mid, yy + 3, 6)} fill={C.goldDeep} />
                </g>
              );
            }
            return <rect key={i} x={50} y={yy} width={(w - 100) * rw.a} height={6} rx={3} fill="#2C2013" opacity={inkA} />;
          })}
        </g>
        {/* rouleaux */}
        <rect x={0} y={0} width={w} height={rl * 2} rx={rl} fill="#8B5B2B" />
        <rect x={0} y={0} width={w} height={rl} rx={rl / 2} fill="#A87638" opacity={0.7} />
        <rect x={0} y={rl + paperH - rl} width={w} height={rl * 2} rx={rl} fill="#8B5B2B" />
        <rect x={0} y={rl + paperH - rl} width={w} height={rl} rx={rl / 2} fill="#A87638" opacity={0.7} />
        <circle cx={6} cy={rl} r={5} fill={C.goldDeep} />
        <circle cx={w - 6} cy={rl} r={5} fill={C.goldDeep} />
      </svg>
      {title && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: rl + 26, textAlign: 'center', opacity: clamp((k - 0.4) * 3) }}>
          <Ar size={titleSize} color="#3A2812">{title}</Ar>
        </div>
      )}
    </div>
  );
};

/** Coupole funéraire (qubba), tracée d'un seul fil. */
export function qubbaPath(cx: number, base: number, s = 1): string {
  const X = (v: number) => (cx + v * s).toFixed(1);
  const Y = (v: number) => (base + v * s).toFixed(1);
  return [
    `M${X(-118)} ${Y(0)}L${X(-118)} ${Y(-26)}L${X(-104)} ${Y(-26)}L${X(-104)} ${Y(-168)}`,
    `L${X(104)} ${Y(-168)}L${X(104)} ${Y(-26)}L${X(118)} ${Y(-26)}L${X(118)} ${Y(0)}Z`,
    `M${X(-30)} ${Y(0)}L${X(-30)} ${Y(-66)}A${(30 * s).toFixed(1)} ${(30 * s).toFixed(1)} 0 0 1 ${X(30)} ${Y(-66)}L${X(30)} ${Y(0)}`,
    `M${X(-104)} ${Y(-168)}L${X(-116)} ${Y(-168)}L${X(-84)} ${Y(-186)}L${X(84)} ${Y(-186)}L${X(116)} ${Y(-168)}L${X(104)} ${Y(-168)}`,
    `M${X(-84)} ${Y(-186)}C${X(-100)} ${Y(-330)} ${X(100)} ${Y(-330)} ${X(84)} ${Y(-186)}`,
    `M${X(0)} ${Y(-262)}L${X(0)} ${Y(-318)}`,
  ].join('');
}

/** Silhouette d'enfant : tête + petit corps. */
export const Kid: React.FC<{ x: number; y: number; s?: number; color?: string; bob?: number; mouth?: number }> = ({
  x, y, s = 1, color = C.cream, bob = 0, mouth = 0,
}) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`} fill={color}>
    <circle cx={0} cy={-46} r={14} />
    <path d="M-17 0 L-12 -28 Q0 -34 12 -28 L17 0 Z" />
    <ellipse cx={0} cy={-41} rx={4.5} ry={1.2 + 3.4 * mouth} fill="#0B1E1B" opacity={0.7} />
  </g>
);
