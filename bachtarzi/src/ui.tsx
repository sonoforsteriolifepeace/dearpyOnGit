import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig, spring} from 'remotion';

export const C = {
  bg: '#14110f', ink: '#f3e9d6', gold: '#d9a441', teal: '#3fa7a0', rust: '#c4553a', dim: '#8d8271', thread: '#e8c777',
};
export const SERIF = '"Liberation Serif","DejaVu Serif",Georgia,serif';
export const SANS = '"DejaVu Sans","Liberation Sans",Arial,sans-serif';

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0→1 progress between two frames, eased. */
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Fade/slide-in wrapper starting at frame `at`. */
export const In: React.FC<{at?: number; dur?: number; y?: number; x?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({at = 0, dur = 24, y = 24, x = 0, style, children}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + dur);
  return <div style={{opacity: p, transform: `translate(${(1 - p) * x}px,${(1 - p) * y}px)`, ...style}}>{children}</div>;
};

/** Scene wrapper: fades in/out at its edges. */
export const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = Math.min(prog(f, 0, 14), 1 - prog(f, dur - 14, dur));
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>;
};

export const Heading: React.FC<{kicker: string; title: string}> = ({kicker, title}) => (
  <div style={{position: 'absolute', left: 120, top: 80}}>
    <In><div style={{fontFamily: SANS, fontSize: 22, letterSpacing: 6, color: C.gold, textTransform: 'uppercase'}}>{kicker}</div></In>
    <In at={6}><div style={{fontFamily: SERIF, fontSize: 68, color: C.ink, marginTop: 10}}>{title}</div></In>
  </div>
);

/** Bottom narration caption. */
export const Caption: React.FC<{text: string; at?: number}> = ({text, at = 20}) => (
  <In at={at} style={{position: 'absolute', left: 160, right: 160, bottom: 70, textAlign: 'center'}}>
    <div style={{fontFamily: SERIF, fontSize: 38, lineHeight: 1.35, color: C.ink, textShadow: '0 2px 12px #000'}}>{text}</div>
  </In>
);

/** Dashed "stitch" line revealed progressively (p: 0→1) through a mask. */
export const Stitch: React.FC<{d: string; p: number; id: string; color?: string; w?: number}> = ({d, p, id, color = C.thread, w = 4}) => (
  <g>
    <mask id={id}><path d={d} fill="none" stroke="#fff" strokeWidth={w + 8} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} /></mask>
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray="14 12" mask={`url(#${id})`} />
  </g>
);

export const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${50 + Math.sin(f / 120) * 8}% 40%, #2a2019 0%, ${C.bg} 70%)`}}>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.07}}>
        <defs><pattern id="w" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 0L36 36M36 0L0 36" stroke={C.ink} strokeWidth="1" /></pattern></defs>
        <rect width="1920" height="1080" fill="url(#w)" />
      </svg>
    </div>
  );
};
export {useCurrentFrame, useVideoConfig, spring, interpolate};
