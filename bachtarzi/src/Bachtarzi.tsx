import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { TimeCtx, p } from './anim';
import { Backdrop, Chrome } from './kit';
import { SceneBouQabrine, SceneFounder, SceneJourney, SceneStudent, SceneTitle } from './scenes/part1';
import { SceneDomains, SceneKeep, ScenePoetry, SceneVerse, SceneWrite } from './scenes/part2';
import { SceneAnalogy, SceneEnding, SceneLabel, SceneClients, SceneNumber, ScenePattern } from './scenes/part3';

const FONT_SPECS = [
  '700 80px Amiri', '400 80px Amiri', '600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"',
  'italic 500 40px "Cormorant Garamond"', 'italic 600 40px "Cormorant Garamond"', '600 20px Inter', '500 20px Inter',
  '700 40px "Reem Kufi"', '500 40px "Reem Kufi"',
];

export const Bachtarzi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONT_SPECS.map(f => document.fonts.load(f, 'Aأ'))).then(() => continueRender(handle));
  }, [handle]);
  const t = frame / fps;
  const total = durationInFrames / fps;
  const black = 1 - Math.min(p(t, 0, 1.2), 1 - p(t, total - 1.4, 1.4));
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill style={{ background: '#000' }}>
        <Backdrop />
        <SceneTitle />
        <SceneJourney />
        <SceneBouQabrine />
        <SceneFounder />
        <SceneStudent />
        <SceneWrite />
        <SceneVerse />
        <ScenePoetry />
        <SceneDomains />
        <SceneKeep />
        <SceneNumber />
        <SceneLabel />
        <SceneClients />
        <ScenePattern />
        <SceneAnalogy />
        <SceneEnding />
        <Chrome />
        <AbsoluteFill style={{ background: '#000', opacity: black }} />
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
