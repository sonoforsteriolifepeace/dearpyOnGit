import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {star8} from '../anim';
import {C} from '../theme';

// Faint lattice of 8-pointed stars, slowly drifting.
export const StarLattice: React.FC<{color: string; opacity: number; shift: number; id: string; size?: number}> = ({
  color,
  opacity,
  shift,
  id,
  size = 132,
}) => {
  const T = size;
  const R = T * 0.27;
  return (
    <AbsoluteFill style={{opacity}}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse" patternTransform={`translate(${shift % T} ${(shift * 0.5) % T})`}>
            <path d={star8(T / 2, T / 2, R)} fill="none" stroke={color} strokeWidth={1.4} />
            <path d={star8(T / 2, T / 2, R * 0.45, Math.PI / 8)} fill="none" stroke={color} strokeWidth={1} />
            {[
              [0, 0],
              [T, 0],
              [0, T],
              [T, T],
            ].map(([x, y], i) => (
              <path key={i} d={star8(x, y, R)} fill="none" stroke={color} strokeWidth={1.4} />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{opacity: number; blend?: React.CSSProperties['mixBlendMode']}> = ({opacity, blend = 'multiply'}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `url(${staticFile('paper.png')})`,
      backgroundSize: '512px 512px',
      opacity,
      mixBlendMode: blend,
    }}
  />
);

export type BgKind = 'paper' | 'night' | 'indigo';

export const Background: React.FC<{kind: BgKind; abs: number}> = ({kind, abs}) => {
  const shift = abs * 0.25;
  if (kind === 'night') {
    return (
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, ${C.night2} 0%, ${C.night} 70%)`}}>
        <StarLattice id="lat-night" color={C.goldHi} opacity={0.07} shift={shift} />
        <Grain opacity={0.5} blend="soft-light" />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'indigo') {
    return (
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 40% 45%, #263761 0%, ${C.indigo} 75%)`}}>
        <AbsoluteFill
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 2px, rgba(0,0,0,0) 2px 7px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.06) 0 1px, rgba(0,0,0,0) 1px 6px)',
          }}
        />
        <Grain opacity={0.55} blend="soft-light" />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)'}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <StarLattice id="lat-paper" color={C.goldDark} opacity={0.06} shift={shift} />
      <Grain opacity={0.5} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(90,60,25,0.2) 100%)'}} />
    </AbsoluteFill>
  );
};
