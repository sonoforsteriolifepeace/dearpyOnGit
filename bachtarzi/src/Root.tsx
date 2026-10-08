import React from 'react';
import { Composition } from 'remotion';
import './fonts.css';
import { Bachtarzi } from './Bachtarzi';
import { FPS, TOTAL_FRAMES } from './script';
import { H, W } from './theme';

export const Root: React.FC = () => (
  <Composition id="Bachtarzi" component={Bachtarzi} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
