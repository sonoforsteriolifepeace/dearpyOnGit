import React from 'react';

export type SceneProps = {t: number; dur: number};

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

export const Box: React.FC<{
  x: number;
  y: number;
  w?: number;
  center?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({x, y, w, center, style, children}) => (
  <div
    style={{
      position: 'absolute',
      left: center && w ? x - w / 2 : x,
      top: y,
      width: w,
      textAlign: center ? 'center' : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);
