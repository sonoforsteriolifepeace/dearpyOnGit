import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile} from 'remotion';
import './fonts.css';
import timeline from './timeline.json';
import {C, FPS, SCENES, span, TOTAL} from './theme';
import {Kicker, octagram, useTime} from './ui';
import {Intro, PartTitle, Outro} from './scenes/Titles';
import {MapScene} from './scenes/MapScene';
import {Tombs, Lineage, Student} from './scenes/Part1';
import {Author, Verse, Memory, Preserve} from './scenes/Part2';
import {Terdji, Clients, Measure, Couture} from './scenes/Part3';

const REGISTRY: Record<string, React.FC<{dur: number}>> = {
  intro: Intro,
  p1title: (p) => <PartTitle {...p} n={0} />,
  map: MapScene,
  tombs: Tombs,
  lineage: Lineage,
  student: Student,
  p2title: (p) => <PartTitle {...p} n={1} />,
  author: Author,
  verse: Verse,
  memory: Memory,
  preserve: Preserve,
  p3title: (p) => <PartTitle {...p} n={2} />,
  terdji: Terdji,
  clients: Clients,
  measure: Measure,
  couture: Couture,
  outro: Outro,
};

const FONT_PROBES = [
  '400 40px Amiri',
  '700 40px Amiri',
  '500 40px "Cormorant Garamond"',
  '700 40px "Cormorant Garamond"',
  'italic 500 40px "Cormorant Garamond"',
  '400 40px Inter',
  '600 40px Inter',
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONT_PROBES.map((f) => document.fonts.load(f, 'Aé عبد الرحمن')))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

const Background: React.FC = () => {
  const t = useTime();
  const tile = 180;
  const drift = (t * 6) % tile;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, #1b2b43 0%, ${C.ink} 45%, ${C.night} 100%)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.07}}>
        <defs>
          <pattern id="girih" width={tile} height={tile} patternUnits="userSpaceOnUse" patternTransform={`translate(${drift},${drift * 0.5})`}>
            <path d={octagram(tile / 2, tile / 2, tile * 0.32)} fill="none" stroke={C.gold} strokeWidth={1.4} />
            <path d={octagram(0, 0, tile * 0.18)} fill="none" stroke={C.gold} strokeWidth={1} />
            <path d={octagram(tile, 0, tile * 0.18)} fill="none" stroke={C.gold} strokeWidth={1} />
            <path d={octagram(0, tile, tile * 0.18)} fill="none" stroke={C.gold} strokeWidth={1} />
            <path d={octagram(tile, tile, tile * 0.18)} fill="none" stroke={C.gold} strokeWidth={1} />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#girih)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Part label in the top-left corner, persistent across the scenes of a part. */
const PartKicker: React.FC = () => {
  const t = useTime();
  return (
    <>
      {timeline.parts.map((part, i) => {
        const scenes = SCENES.filter((s) => s.part === i && !s.id.endsWith('title'));
        if (!scenes.length) return null;
        const a = scenes[0].start;
        const last = scenes[scenes.length - 1];
        const o = span(t, a + 0.3, last.start + last.dur - 0.2, 0.6);
        return o > 0 ? <Kicker key={i} o={o} text={`${part.id} · ${part.title}`} /> : null;
      })}
    </>
  );
};

export const Video: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Background />
      {SCENES.map((s) => {
        const Comp = REGISTRY[s.id];
        return (
          <Sequence key={s.id} from={Math.round(s.start * FPS)} durationInFrames={Math.round(s.dur * FPS)} name={s.id}>
            <Comp dur={s.dur} />
          </Sequence>
        );
      })}
      <PartKicker />
      <Audio src={staticFile('soundtrack.m4a')} />
    </AbsoluteFill>
  );
};

export const DURATION_FRAMES = Math.round(TOTAL * FPS);
