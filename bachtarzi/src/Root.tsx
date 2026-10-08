import React from 'react';
import {Composition} from 'remotion';
import {DURATION_FRAMES, Video} from './Video';
import {FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="Bachtarzi" component={Video} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
);
