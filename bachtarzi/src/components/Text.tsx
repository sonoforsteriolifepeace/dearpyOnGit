import React from 'react';
import {prog} from '../anim';
import {AR, C, RUQAA, SANS, SERIF} from '../theme';

type RvProps = {
  t: number;
  at: number;
  d?: number;
  y?: number;
  x?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

// Fades a block in while it slides and un-blurs into place.
export const Rv: React.FC<RvProps> = ({t, at, d = 0.9, y = 26, x = 0, blur = 8, style, children}) => {
  const k = prog(t, at, d);
  return (
    <div
      style={{
        opacity: k,
        transform: `translate(${(1 - k) * x}px, ${(1 - k) * y}px)`,
        filter: blur && k < 1 ? `blur(${(1 - k) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Word-by-word reveal; non-breaking spaces keep groups together.
export const Words: React.FC<{
  t: number;
  at: number;
  text: string;
  stagger?: number;
  d?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number, w: string) => React.CSSProperties | undefined;
}> = ({t, at, text, stagger = 0.07, d = 0.8, style, wordStyle}) => {
  const words = text.split(' ');
  return (
    <span style={style}>
      {words.map((w, i) => {
        const k = prog(t, at + i * stagger, d);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: k,
              transform: `translateY(${(1 - k) * 0.32}em)`,
              filter: k < 1 ? `blur(${(1 - k) * 5}px)` : undefined,
              marginRight: i < words.length - 1 ? '0.24em' : 0,
              ...(wordStyle ? wordStyle(i, w) : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
};

export const Kicker: React.FC<{
  t: number;
  at: number;
  children: React.ReactNode;
  color?: string;
  line?: string;
  center?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({t, at, children, color = C.goldDark, line = C.gold, center, size = 21, style}) => {
  const k = prog(t, at, 0.9);
  const k2 = prog(t, at + 0.15, 0.8);
  const bar = <div style={{width: 56 * k, height: 2, background: line, flexShrink: 0}} />;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: center ? 'center' : 'flex-start',
        gap: 18,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
    >
      {bar}
      <span style={{opacity: k2, transform: `translateX(${(1 - k2) * -10}px)`}}>{children}</span>
      {center ? bar : null}
    </div>
  );
};

export const Ar: React.FC<{children: React.ReactNode; size?: number; color?: string; ruqaa?: boolean; weight?: number; style?: React.CSSProperties}> = ({
  children,
  size = 48,
  color = C.goldDark,
  ruqaa,
  weight = 700,
  style,
}) => (
  <span dir="rtl" lang="ar" style={{fontFamily: ruqaa ? RUQAA : AR, fontSize: size, fontWeight: weight, color, lineHeight: 1.5, ...style}}>
    {children}
  </span>
);

// Sizes are given on a Cormorant-like scale; EB Garamond sets larger.
const SERIF_SCALE = 0.86;

export const serif = (size: number, weight = 600, color: string = C.ink): React.CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: weight === 700 ? 600 : weight === 600 ? 500 : weight,
  fontSize: Math.round(size * SERIF_SCALE),
  color,
  lineHeight: 1.08,
  letterSpacing: '-0.01em',
});

export const italic = (size: number, color: string = C.inkSoft): React.CSSProperties => ({
  fontFamily: SERIF,
  fontStyle: 'italic',
  fontWeight: 500,
  fontSize: Math.round(size * SERIF_SCALE),
  color,
  lineHeight: 1.22,
});

export const sans = (size: number, color: string = C.inkSoft, weight = 500): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: weight,
  fontSize: size,
  color,
  lineHeight: 1.35,
});
