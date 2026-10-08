import React from 'react';
import {AbsoluteFill, getInputProps, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, FPS, prog, star8} from './anim';
import {Background, BgKind} from './components/Backgrounds';
import {SceneProps} from './components/Layout';
import {loadFonts} from './fonts';
import {Chapter1, Chapter2, Chapter3, Disciple, Journey, Lineage, Master, Title, Tombs} from './scenes/Part1';
import {Manuscript, Memory, Sciences, Verse, Writer} from './scenes/Part2';
import {Clients, Finale, Measure, Name, Pattern, Sewing} from './scenes/Part3';
import {C, SANS} from './theme';
import TL from './timeline.json';

loadFonts();

const SCENES: Record<string, React.FC<SceneProps>> = {
  title: Title,
  ch1: Chapter1,
  master: Master,
  journey: Journey,
  tombs: Tombs,
  lineage: Lineage,
  disciple: Disciple,
  ch2: Chapter2,
  writer: Writer,
  verse: Verse,
  memory: Memory,
  sciences: Sciences,
  manuscript: Manuscript,
  ch3: Chapter3,
  measure: Measure,
  name: Name,
  clients: Clients,
  pattern: Pattern,
  sewing: Sewing,
  finale: Finale,
};

type Sc = (typeof TL.scenes)[number];
const F = Math.round(TL.fade * FPS);
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Each scene fades in over the previous one, which keeps running underneath
// for F frames while its own content fades out.
const SceneFrame: React.FC<{sc: Sc; from: number; dur: number; last: boolean}> = ({sc, from, dur, last}) => {
  const f = useCurrentFrame();
  const Comp = SCENES[sc.id];
  const inA = sc.start === 0 ? 1 : interpolate(f, [0, F], [0, 1], CLAMP);
  const outA = last ? 1 : interpolate(f, [dur, dur + F], [1, 0], CLAMP);
  const zoom = 1 + 0.016 * clamp(f / dur);
  return (
    <AbsoluteFill style={{opacity: inA}}>
      <Background kind={sc.bg as BgKind} abs={from + f} />
      <AbsoluteFill style={{opacity: outA, transform: `scale(${zoom})`}}>
        <Comp t={f / FPS} dur={dur / FPS} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Thin thread along the bottom: overall progress, with a knot per chapter.
const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = Math.max(0, TL.scenes.findIndex((s) => t >= s.start && t < s.end));
  const sc = TL.scenes[i];
  const prev = TL.scenes[i - 1];
  const k = clamp((t - sc.start) / TL.fade);
  const paper = (sc.bg === 'paper' ? k : 0) + (prev && prev.bg === 'paper' ? 1 - k : 0);
  const show = paper * prog(t, 10.5, 0.8) * (1 - prog(t, 172.5, 0.5));
  if (show <= 0.001) return null;
  const ch = TL.chapters.find((c) => t >= c.start && t < c.end) ?? TL.chapters[2];
  const x0 = 96, x1 = 1824, y = 1040;
  const X = (s: number) => x0 + ((x1 - x0) * s) / TL.duration;
  return (
    <AbsoluteFill style={{opacity: show}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={`M${x0} ${y} L${x1} ${y}`} stroke={C.ink} strokeOpacity={0.14} strokeWidth={1.5} />
        <path d={`M${x0} ${y} L${X(t)} ${y}`} stroke={C.gold} strokeWidth={2.5} />
        {[0, 60, 120, 180].map((s) => (
          <path key={s} d={star8(X(s), y, 7)} fill={t >= s ? C.gold : C.paper} stroke={C.gold} strokeWidth={1.2} />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: x0,
          top: y - 34,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: C.muted,
        }}
      >
        {ch.n} · {ch.title}
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const {mute} = getInputProps() as {mute?: boolean};
  return (
    <AbsoluteFill style={{background: C.paper}}>
      {TL.scenes.map((sc, i) => {
        const last = i === TL.scenes.length - 1;
        const from = Math.round(sc.start * FPS);
        const dur = Math.round((sc.end - sc.start) * FPS);
        return (
          <Sequence key={sc.id} name={sc.id} from={from} durationInFrames={last ? dur : dur + F}>
            <SceneFrame sc={sc} from={from} dur={dur} last={last} />
          </Sequence>
        );
      })}
      <Progress />
      {mute ? null : <Html5Audio src={staticFile('score.mp3')} />}
    </AbsoluteFill>
  );
};
