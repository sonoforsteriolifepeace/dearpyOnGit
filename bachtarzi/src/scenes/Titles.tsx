import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, ramp, span, easeOut} from '../theme';
import {Draw, Scene, Stitches, octagram, star8, useTime} from '../ui';

const PARTS = [
  {n: 'I', fr: 'Le maître et son premier élève', ar: 'الشيخ وتلميذه الأول'},
  {n: 'II', fr: "De l'élève à l'auteur", ar: 'من التلميذ إلى المؤلّف'},
  {n: 'III', fr: 'Le terdji : couture et poésie', ar: 'الخيّاط الناظم'},
];

const Rosette: React.FC<{p: number; r: number; spin: number}> = ({p, r, spin}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <g transform={`rotate(${spin} 960 540)`}>
      <Draw d={octagram(960, 540, r, 0)} p={ramp(p, 0, 0.7)} stroke={C.gold} strokeWidth={1.5} opacity={0.35} />
      <Draw d={star8(960, 540, r * 1.12, 0.82, Math.PI / 16)} p={ramp(p, 0.15, 0.85)} stroke={C.gold} strokeWidth={1} opacity={0.25} />
      <Draw d={`M960,${540 - r * 1.3}a${r * 1.3},${r * 1.3} 0 1,1 -0.01,0`} p={ramp(p, 0.3, 1)} stroke={C.gold} strokeWidth={1} opacity={0.2} />
    </g>
  </svg>
);

export const Intro: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const up = (a: number) => ({
    opacity: ramp(t, a, a + 0.9),
    transform: `translateY(${(1 - ramp(t, a, a + 1.2, easeOut)) * 24}px)`,
  });
  return (
    <Scene dur={dur}>
      <Rosette p={ramp(t, 0, 3.5)} r={360} spin={t * 2} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{...up(0.6), fontFamily: F.arabic, fontSize: 76, color: C.gold, direction: 'rtl', marginBottom: 6}}>
          الشيخ عبد الرحمن باش تارزي
        </div>
        <div style={{...up(1.2), fontFamily: F.serif, fontWeight: 700, fontSize: 104, color: C.parchment, lineHeight: 1.05}}>
          Cheikh Abderrahmane Bachtarzi
        </div>
        <div style={{height: 70}} />
        <div style={{...up(3.4), fontFamily: F.serif, fontStyle: 'italic', fontSize: 50, color: C.parchmentDim}}>
          le couturier qui cousait la Tariqa en vers
        </div>
        <div style={{...up(4.6), marginTop: 34, fontFamily: F.sans, fontSize: 22, letterSpacing: 5, color: C.gold}}>
          AUTEUR DE LA MANDHOUMA RAHMANIA · <span style={{fontFamily: F.arabic, letterSpacing: 0, fontSize: 30}}>المنظومة الرحمانية</span>
        </div>
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <Stitches x1={430} x2={1490} y={598} p={ramp(t, 2.0, 4.2)} />
      </svg>
    </Scene>
  );
};

export const PartTitle: React.FC<{dur: number; n: number}> = ({dur, n}) => {
  const t = useTime();
  const part = PARTS[n];
  return (
    <Scene dur={dur}>
      <Rosette p={ramp(t, 0, 2.2)} r={250} spin={-t * 4} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: F.serif,
            fontWeight: 700,
            fontSize: 150,
            color: C.gold,
            opacity: ramp(t, 0.2, 0.9),
            transform: `scale(${0.85 + 0.15 * ramp(t, 0.2, 1.4, easeOut)})`,
            lineHeight: 1,
          }}
        >
          {part.n}
        </div>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 76, color: C.parchment, marginTop: 20, opacity: ramp(t, 0.7, 1.4)}}>
          {part.fr}
        </div>
        <div style={{fontFamily: F.arabic, fontSize: 52, color: C.parchmentDim, direction: 'rtl', marginTop: 10, opacity: ramp(t, 1.1, 1.8)}}>
          {part.ar}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

export const Outro: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const a = span(t, 0.3, 5.2);
  const b = span(t, 5.4, 10.4);
  const c = ramp(t, 10.6, 11.6);
  const cards = [
    {fr: "Cheikh M'hamed Belkacem", done: true},
    {fr: "Sidi M'hamed Ben Abderrahmane El Azhari", done: true},
    {fr: 'Cheikh Abderrahmane Bachtarzi', done: false},
  ];
  return (
    <Scene dur={dur}>
      <Rosette p={ramp(t, 10.4, 13)} r={330} spin={t * 2} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: a}}>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 82, color: C.parchment, maxWidth: 1400, lineHeight: 1.15}}>
          Une très grande personnalité,
          <br />
          <span style={{color: C.gold}}>à lire et à faire connaître.</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: b, gap: 26}}>
        <div style={{fontFamily: F.sans, fontSize: 22, letterSpacing: 5, color: C.gold, marginBottom: 20}}>DANS LA MÊME SÉRIE</div>
        {cards.map((card, i) => {
          const o = ramp(t, 5.8 + i * 1.1, 6.6 + i * 1.1);
          return (
            <div
              key={i}
              style={{
                opacity: o,
                transform: `translateX(${(1 - o) * -40}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                width: 1100,
                padding: '22px 34px',
                border: `2px ${card.done ? 'solid' : 'dashed'} ${card.done ? 'rgba(214,170,92,0.45)' : C.gold}`,
                borderRadius: 14,
                background: card.done ? 'rgba(239,227,200,0.04)' : 'rgba(214,170,92,0.12)',
              }}
            >
              <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 20, letterSpacing: 3, color: card.done ? C.parchmentDim : C.gold, width: 270, textAlign: 'left', whiteSpace: 'nowrap'}}>
                {card.done ? 'VIDÉO RÉALISÉE' : 'MÉRITE LA SIENNE'}
              </div>
              <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 44, color: C.parchment, textAlign: 'left'}}>{card.fr}</div>
            </div>
          );
        })}
        <div style={{opacity: ramp(t, 8.6, 9.3), fontFamily: F.serif, fontStyle: 'italic', fontSize: 38, color: C.parchmentDim, marginTop: 18}}>
          sa vie, sa carrière, son œuvre
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: c}}>
        <div style={{fontFamily: F.arabic, fontSize: 64, color: C.gold, direction: 'rtl'}}>الشيخ عبد الرحمن باش تارزي</div>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 86, color: C.parchment}}>Cheikh Abderrahmane Bachtarzi</div>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 36, color: C.parchmentDim, marginTop: 16}}>
          premier élève de Sidi M'hamed Ben Abderrahmane · auteur de la Mandhouma Rahmania
        </div>
        <div style={{fontFamily: F.sans, fontSize: 18, letterSpacing: 3, color: C.goldSoft, marginTop: 60, opacity: ramp(t, 11.6, 12.4)}}>
          D'APRÈS UN EXPOSÉ ORAL SUR LA MANDHOUMA RAHMANIA
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
