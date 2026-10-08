import React, { useId, useMemo } from 'react';
import { AbsoluteFill, interpolateColors } from 'remotion';
import { getLength, getPointAtLength } from '@remotion/paths';
import { BG, C, FONT, H, W } from './theme';
import { clamp, eo, p, useT, win } from './anim';
import type { EaseFn } from './anim';

// ---------------------------------------------------------------- géométrie

/** Étoile à 8 branches (khatem) : contour d'une étoile pleine, 16 sommets. */
export function star8Path(cx: number, cy: number, r: number, rot = 0): string {
  const inner = r * 0.7654;
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = rot + (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : inner;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** Carré tourné de `rot` (deux carrés à 45° = l'étoile à 8 branches). */
export function squarePath(cx: number, cy: number, r: number, rot = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < 4; i++) {
    const a = rot + (i * Math.PI) / 2 - Math.PI / 4;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

export const circlePath = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

// ---------------------------------------------------------------- fil de couture

interface ThreadProps {
  d: string;
  /** progression 0→1 (le fil se « coud » de proche en proche) */
  k: number;
  color?: string;
  width?: number;
  /** points (px) cousus / sautés ; null = trait plein */
  dash?: [number, number] | null;
  needle?: boolean;
  glow?: boolean;
  opacity?: number;
}

/** Trait qui se dessine comme une couture ; une aiguille en pointe le long du tracé. */
export const Thread: React.FC<ThreadProps> = ({
  d, k, color = C.gold, width = 4, dash = [16, 11], needle = true, glow = false, opacity = 1,
}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const len = useMemo(() => getLength(d), [d]);
  if (k <= 0.0005) return null;
  const kk = clamp(k);
  const head = getPointAtLength(d, len * kk) ?? { x: 0, y: 0 };
  const back = getPointAtLength(d, Math.max(0, len * kk - 10)) ?? head;
  const ang = (Math.atan2(head.y - back.y, head.x - back.x) * 180) / Math.PI;
  const nAlpha = needle ? clamp((1 - kk) * 14) * clamp(kk * 14) : 0;
  return (
    <g opacity={opacity}>
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={9000} height={9000}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={width * 6} strokeLinecap="round"
            strokeDasharray={len} strokeDashoffset={len * (1 - kk)} />
        </mask>
      </defs>
      {glow && (
        <path d={d} fill="none" stroke={color} strokeWidth={width * 4} strokeLinecap="round" opacity={0.12}
          mask={`url(#m${id})`} />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={dash ? `${dash[0]} ${dash[1]}` : undefined} mask={`url(#m${id})`} />
      {nAlpha > 0.01 && (
        <g transform={`translate(${head.x} ${head.y}) rotate(${ang})`} opacity={nAlpha}>
          <path d="M-8 -3.2 L26 0 L-8 3.2 Z" fill={C.cream} />
          <ellipse cx={-14} cy={0} rx={5.5} ry={2.4} fill="none" stroke={C.cream} strokeWidth={1.6} />
        </g>
      )}
    </g>
  );
};

/** Tracé qui apparaît de 0 à 1 selon le temps (raccourci pour les ornements). */
export const TimedThread: React.FC<Omit<ThreadProps, 'k'> & { at: number; dur: number; ease?: EaseFn }> = ({
  at, dur, ease = eo, ...rest
}) => <Thread {...rest} k={p(useT(), at, dur, ease)} />;

// ---------------------------------------------------------------- fond + décor fixe

const PART_LABELS = ['I · LE MAÎTRE ET LA VOIE', 'II · DU DISCIPLE À L’AUTEUR', 'III · L’ÂME DU TAILLEUR'];

export const Backdrop: React.FC = () => {
  const t = useT();
  const col = (i: 0 | 1) =>
    interpolateColors(t, [0, 58.5, 61.5, 118.5, 121.5, 180],
      [BG[1][i], BG[1][i], BG[2][i], BG[2][i], BG[3][i], BG[3][i]]);
  const drift = t * 2.4;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 88% 78% at 50% 44%, ${col(1)} 0%, ${col(0)} 100%)` }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="zel" width={200} height={200} patternUnits="userSpaceOnUse"
            patternTransform={`translate(${drift} ${drift * 0.6})`}>
            <path d={star8Path(100, 100, 74)} fill="none" stroke={C.cream} strokeOpacity={0.05} strokeWidth={1.4} />
            <path d={star8Path(0, 0, 30)} fill="none" stroke={C.cream} strokeOpacity={0.05} strokeWidth={1.2} />
            <path d={star8Path(200, 0, 30)} fill="none" stroke={C.cream} strokeOpacity={0.05} strokeWidth={1.2} />
            <path d={star8Path(0, 200, 30)} fill="none" stroke={C.cream} strokeOpacity={0.05} strokeWidth={1.2} />
            <path d={star8Path(200, 200, 30)} fill="none" stroke={C.cream} strokeOpacity={0.05} strokeWidth={1.2} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#zel)" />
      </svg>
      <AbsoluteFill style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.016) 0 1px, transparent 1px 4px),' +
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.016) 0 1px, transparent 1px 4px)',
      }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 48%, transparent 55%, rgba(0,0,0,0.5) 100%)' }} />
    </AbsoluteFill>
  );
};

/** En-têtes courants, bandeau de chapitre, barre de progression « cousue ». */
export const Chrome: React.FC = () => {
  const t = useT();
  const part = t < 60 ? 0 : t < 120 ? 1 : 2;
  const x0 = 110, x1 = W - 110, gap = 30, y = 1004;
  const segW = (x1 - x0 - gap * 2) / 3;
  const segX = (i: number) => x0 + i * (segW + gap);
  const headX = (() => {
    const f = clamp(t / 180) * 3;
    const i = Math.min(2, Math.floor(f));
    return segX(i) + segW * (f - i);
  })();
  const bannerAt = [0.2, 60.1, 120.1];
  const bannerTitle = ['Le maître et la voie', 'Du disciple à l’auteur', 'L’âme du tailleur'];
  const bi = t < 30 ? 0 : t < 90 ? 1 : 2;
  const bk = win(t, bannerAt[bi] + 0.2, bannerAt[bi] + 4.6, 0.8, 0.8, eo);
  const roman = ['I', 'II', 'III'];
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <rect x={34} y={34} width={W - 68} height={H - 68} fill="none" stroke={C.cream} strokeOpacity={0.14} strokeWidth={1.5} />
        {[[34, 34], [W - 34, 34], [34, H - 34], [W - 34, H - 34]].map(([x, yy], i) => (
          <g key={i}>
            <rect x={x - 11} y={yy - 11} width={22} height={22} fill={BG[(part + 1) as 1 | 2 | 3][0]} />
            <path d={star8Path(x, yy, 11)} fill={C.gold} opacity={0.9} />
          </g>
        ))}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <line x1={segX(i)} x2={segX(i) + segW} y1={y} y2={y} stroke={C.cream} strokeOpacity={0.2} strokeWidth={3}
              strokeDasharray="10 8" />
            <clipPath id={`pc${i}`}><rect x={segX(i)} y={y - 20} width={Math.max(0, headX - segX(i))} height={40} /></clipPath>
            <line x1={segX(i)} x2={segX(i) + segW} y1={y} y2={y} stroke={C.gold} strokeWidth={3.4}
              strokeDasharray="10 8" clipPath={`url(#pc${i})`} />
          </g>
        ))}
        <path d={star8Path(headX, y, 9)} fill={C.gold} />
      </svg>
      {PART_LABELS.map((l, i) => (
        <div key={i} style={{
          position: 'absolute', left: segX(i), top: y - 42, width: segW, fontFamily: FONT.sans, fontSize: 20,
          fontWeight: 600, letterSpacing: '0.16em', color: i === part ? C.cream : C.creamSoft,
          opacity: i === part ? 1 : 0.7,
        }}>{l}</div>
      ))}
      <div style={{
        position: 'absolute', left: 110, top: 64, fontFamily: FONT.sans, fontSize: 19, fontWeight: 600,
        letterSpacing: '0.28em', color: C.creamSoft,
      }}>CHEIKH ABDERRAHMANE BACHTARZI</div>
      <div style={{
        position: 'absolute', right: 110, top: 60, fontFamily: FONT.serif, fontSize: 30, fontStyle: 'italic',
        color: C.creamSoft,
      }}>{roman[part]}</div>
      {/* bandeau de chapitre */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center', opacity: bk,
        transform: `translateY(${(1 - bk) * -14}px)`,
      }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 21, fontWeight: 600, letterSpacing: '0.3em', color: C.gold }}>
          PARTIE {roman[bi]}
        </span>
        <span style={{ fontFamily: FONT.serif, fontSize: 36, fontStyle: 'italic', color: C.cream, marginLeft: 22, verticalAlign: '-3px' }}>
          {bannerTitle[bi]}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- scènes & texte

interface SceneProps { a: number; b: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode; }

/** Fenêtre de temps d'une scène : fondu entrant/sortant, rien n'est rendu hors fenêtre. */
export const Scene: React.FC<SceneProps> = ({ a, b, fadeIn = 0.6, fadeOut = 0.6, children }) => {
  const t = useT();
  if (t < a - 0.01 || t > b + 0.01) return null;
  const o = Math.min(p(t, a, fadeIn), 1 - p(t, b - fadeOut, fadeOut));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

interface RiseProps { at: number; d?: number; dist?: number; children: React.ReactNode; style?: React.CSSProperties; ease?: EaseFn; }

/** Ligne qui monte derrière un masque (révélation de titre). */
export const Rise: React.FC<RiseProps> = ({ at, d = 0.9, dist = 85, children, style, ease = eo }) => {
  const t = useT();
  const k = p(t, at, d, ease);
  return (
    <div style={{ overflow: 'hidden', padding: '0.2em 0.1em 0.28em', margin: '-0.2em -0.1em -0.28em', ...style }}>
      <div style={{ transform: `translateY(${(1 - k) * dist}%)`, opacity: clamp(k * 3) }}>{children}</div>
    </div>
  );
};

/** Apparition en fondu avec léger glissement. */
export const FadeIn: React.FC<{ at: number; d?: number; dy?: number; dx?: number; style?: React.CSSProperties; children?: React.ReactNode; scale?: number; out?: number }> = ({
  at, d = 0.8, dy = 22, dx = 0, scale = 1, out, style, children,
}) => {
  const t = useT();
  const k = p(t, at, d, eo) * (out === undefined ? 1 : 1 - p(t, out, 0.6));
  return (
    <div style={{ opacity: k, transform: `translate(${(1 - k) * dx}px, ${(1 - k) * dy}px) scale(${mix2(scale, 1, k)})`, ...style }}>
      {children}
    </div>
  );
};
const mix2 = (a: number, b: number, k: number) => a + (b - a) * k;

/** Texte barré qui se raye en cours de route. */
export const Strike: React.FC<{ at: number; d?: number; color?: string; thick?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at, d = 0.5, color = C.terra, thick = 4, children, style,
}) => {
  const t = useT();
  const k = p(t, at, d, eo);
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ opacity: 1 - 0.55 * k }}>{children}</span>
      <span style={{
        position: 'absolute', left: -6, right: -6, top: '54%', height: thick, background: color,
        transform: `scaleX(${k}) rotate(-2deg)`, transformOrigin: 'left center', borderRadius: 3,
      }} />
    </span>
  );
};

/** Étiquette « cousue » : cadre plein + point de couture intérieur. */
export const Plaque: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties; pad?: string; fill?: string }> = ({
  children, color = C.gold, style, pad = '24px 46px', fill = 'rgba(6,12,12,0.46)',
}) => (
  <div style={{ position: 'relative', padding: pad, border: `2px solid ${color}`, background: fill, ...style }}>
    <div style={{ position: 'absolute', inset: 9, border: `2px dashed ${color}`, opacity: 0.65, pointerEvents: 'none' }} />
    {children}
  </div>
);

export const Ar: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties; weight?: number }> = ({
  children, size, color = C.cream, style, weight = 700,
}) => (
  <span lang="ar" dir="rtl" style={{ fontFamily: FONT.ar, fontSize: size, fontWeight: weight, color, lineHeight: 1.25, unicodeBidi: 'isolate', ...style }}>
    {children}
  </span>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties; ls?: string }> = ({
  children, color = C.gold, size = 22, style, ls = '0.3em',
}) => (
  <div style={{ fontFamily: FONT.sans, fontSize: size, fontWeight: 600, letterSpacing: ls, color, textTransform: 'uppercase', ...style }}>
    {children}
  </div>
);

export const Serif: React.FC<{ children: React.ReactNode; size: number; color?: string; italic?: boolean; weight?: number; style?: React.CSSProperties }> = ({
  children, size, color = C.cream, italic = false, weight = 600, style,
}) => (
  <div style={{ fontFamily: FONT.serif, fontSize: size, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', color, lineHeight: 1.04, ...style }}>
    {children}
  </div>
);

/** Étoile à 8 branches dessinée par un fil. */
export const StarOrn: React.FC<{ cx: number; cy: number; r: number; at: number; dur?: number; rot?: number; color?: string; width?: number; dash?: [number, number] | null; needle?: boolean }> = ({
  cx, cy, r, at, dur = 2.4, rot = 0, color = C.gold, width = 3.4, dash = null, needle = false,
}) => <TimedThread d={star8Path(cx, cy, r, rot)} at={at} dur={dur} color={color} width={width} dash={dash} needle={needle} />;

/** Pastille de lieu : étoile pleine + onde. */
export const Pin: React.FC<{ x: number; y: number; at: number; r?: number; color?: string }> = ({ x, y, at, r = 15, color = C.gold }) => {
  const t = useT();
  const k = p(t, at, 0.6, eo);
  if (k <= 0) return null;
  const w = ((t - at) % 2.2) / 2.2;
  return (
    <g>
      <circle cx={x} cy={y} r={r + w * 52} fill="none" stroke={color} strokeWidth={2} opacity={(1 - w) * 0.7 * k} />
      <path d={star8Path(x, y, r * k, 0.2)} fill={color} />
      <circle cx={x} cy={y} r={r * 0.28 * k} fill="#0B1E1B" />
    </g>
  );
};

export const SvgLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg>
);
