import React from 'react';
import {C, F, ramp} from '../theme';
import {Caption, Draw, Medallion, Scene, useTime} from '../ui';

/** A white domed shrine (qubba), drawn progressively. Origin at the base centre. */
const Qubba: React.FC<{x: number; y: number; p: number; s?: number}> = ({x, y, p, s = 1}) => {
  const fillO = ramp(p, 0.45, 0.9);
  const body = 'M-130,0 L-130,-170 L130,-170 L130,0 Z';
  const drum = 'M-95,-170 L-95,-200 L95,-200 L95,-170 Z';
  const dome = 'M-95,-200 C-95,-300 -40,-330 0,-345 C40,-330 95,-300 95,-200 Z';
  const door = 'M-38,0 L-38,-80 Q-38,-118 0,-124 Q38,-118 38,-80 L38,0 Z';
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={220} ry={18} fill="#000" opacity={0.25 * fillO} />
      {[body, drum, dome].map((d, i) => (
        <path key={i} d={d} fill="#f4ecdc" opacity={fillO} />
      ))}
      <path d={dome} fill="#d9cdb3" opacity={fillO * 0.5} transform="translate(30,0) scale(0.7,1)" />
      <path d={door} fill={C.green} opacity={fillO} />
      {[-90, 90].map((wx) => (
        <path key={wx} d={`M${wx - 16},-100 L${wx - 16},-130 Q${wx},-148 ${wx + 16},-130 L${wx + 16},-100 Z`} fill={C.green} opacity={fillO * 0.85} />
      ))}
      {[body, drum, dome, door].map((d, i) => (
        <Draw key={i} d={d} p={ramp(p, 0.05 * i, 0.55 + 0.05 * i)} stroke={C.gold} strokeWidth={3} />
      ))}
      <Draw d="M0,-345 L0,-385" p={ramp(p, 0.6, 0.75)} stroke={C.gold} strokeWidth={4} />
      <g opacity={ramp(p, 0.7, 0.95)}>
        <circle cx={0} cy={-358} r={7} fill={C.gold} />
        <path d="M-14,-400 A16,16 0 1,0 14,-400 A12,12 0 1,1 -14,-400 Z" fill={C.gold} />
      </g>
    </g>
  );
};

export const Tombs: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const left = ramp(t, 2.4, 4.6);
  const right = ramp(t, 0.6, 2.8);
  const labelL = ramp(t, 6.0, 6.8);
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <Qubba x={1340} y={760} p={right} />
        <g opacity={0.35 + 0.65 * ramp(t, 5.6, 6.6)}>
          <Qubba x={580} y={760} p={left} />
        </g>
        <path d="M200,760 L1720,760" stroke={C.gold} strokeWidth={1.5} opacity={0.4} />
        <g fontFamily={F.serif} textAnchor="middle">
          <text x={1340} y={820} fontSize={40} fontWeight={700} fill={C.parchment} opacity={ramp(t, 2.4, 3.2)}>
            Belcourt (El Hamma), Alger
          </text>
          <text x={580} y={820} fontSize={40} fontWeight={700} fill={C.parchment} opacity={labelL}>
            Aït Smaïl, Kabylie
          </text>
          <text x={580} y={858} fontSize={26} fontStyle="italic" fill={C.parchmentDim} opacity={labelL}>
            selon la tradition
          </text>
        </g>
      </svg>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: ramp(t, 3.2, 4.2)}}>
        <div style={{fontFamily: F.arabic, fontSize: 92, color: C.gold, lineHeight: 1.1}}>بوقبرين</div>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 58, color: C.parchment}}>« Bou Qabrine »</div>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 38, color: C.parchmentDim}}>l'homme aux deux tombeaux</div>
      </div>
      <Caption
        lines={[
          [0.3, 5.4, "C'est lui qu'on appelle « Bou Qabrine » : l'homme aux deux tombeaux."],
          [5.6, 11, "Enterré à Belcourt, à Alger… et, selon la tradition, aussi en Kabylie."],
        ]}
      />
    </Scene>
  );
};

export const Lineage: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const flow = ramp(t, 2.2, 4.4);
  const dots = Array.from({length: 7}, (_, i) => ((t * 0.35 + i / 7) % 1));
  const curve = (u: number) => {
    // cubic from (560,500) to (1360,500) arching up
    const p0 = [600, 480];
    const p1 = [820, 300];
    const p2 = [1100, 300];
    const p3 = [1320, 480];
    const v = 1 - u;
    return [0, 1].map((k) => v * v * v * p0[k] + 3 * v * v * u * p1[k] + 3 * v * u * u * p2[k] + u * u * u * p3[k]);
  };
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <Medallion x={460} y={520} r={150} p={ramp(t, 0.3, 2.2)} ar="الخلوتية" title="La Khalwatia" sub="en Égypte" color={C.gold} spin={t * 0.05} />
        <Medallion x={1460} y={520} r={150} p={ramp(t, 3.6, 5.6)} ar="الرحمانية" title="La Rahmania" sub="en Algérie" color={C.green} fill="#13261f" spin={-t * 0.05} />
        <Draw d="M600,480 C820,300 1100,300 1320,480" p={flow} stroke={C.gold} strokeWidth={3} strokeDasharray="1 1" />
        {flow >= 1 &&
          dots.map((u, i) => {
            const [x, y] = curve(u);
            return <circle key={i} cx={x} cy={y} r={7} fill={C.gold} opacity={Math.sin(u * Math.PI)} />;
          })}
        <path d="M1300,452 L1326,484 L1288,490" fill="none" stroke={C.gold} strokeWidth={3} opacity={ramp(t, 4.2, 4.6)} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 200,
          width: '100%',
          textAlign: 'center',
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontSize: 46,
          color: C.parchment,
          opacity: ramp(t, 5.8, 6.8),
        }}
      >
        une même voie, deux noms
      </div>
      <Caption
        lines={[
          [0.3, 5.4, 'Il est le fondateur de la confrérie Rahmania en Algérie…'],
          [5.6, 10, '…qui correspond, en Égypte, à la Khalwatia.'],
        ]}
      />
    </Scene>
  );
};

const Book: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => {
  const open = ramp(p, 0.3, 1);
  const o = ramp(p, 0, 0.3);
  const w = 170 * (0.25 + 0.75 * open);
  const lines = Array.from({length: 6}, (_, i) => i);
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <path d={`M0,-110 Q${-w / 2},-130 ${-w},-110 L${-w},110 Q${-w / 2},90 0,110 Z`} fill={C.parchment} stroke={C.goldSoft} strokeWidth={2} />
      <path d={`M0,-110 Q${w / 2},-130 ${w},-110 L${w},110 Q${w / 2},90 0,110 Z`} fill="#e6d7b5" stroke={C.goldSoft} strokeWidth={2} />
      {lines.map((i) => (
        <g key={i} opacity={ramp(p, 0.5 + i * 0.07, 0.6 + i * 0.07)}>
          <line x1={-w + 24} x2={-22} y1={-70 + i * 30} y2={-70 + i * 30} stroke={C.ink} strokeWidth={3} opacity={0.55} />
          <line x1={22} x2={w - 24} y1={-70 + i * 30} y2={-70 + i * 30} stroke={C.ink} strokeWidth={3} opacity={0.55} />
          <circle cx={-w + 18} cy={-70 + i * 30} r={4} fill={C.red} />
        </g>
      ))}
      <path d="M0,-112 L0,112" stroke={C.goldSoft} strokeWidth={2} />
    </g>
  );
};

export const Student: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const badge = ramp(t, 3.4, 4.2);
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <Medallion x={560} y={270} r={110} p={ramp(t, 0.2, 1.8)} ar="الشيخ" title="Sidi M'hamed Ben Abderrahmane" color={C.green} fill="#13261f" />
        <Draw d="M560,440 L560,530" p={ramp(t, 1.8, 2.6)} stroke={C.gold} strokeWidth={3} />
        <path d="M546,516 L560,536 L574,516" fill="none" stroke={C.gold} strokeWidth={3} opacity={ramp(t, 2.4, 2.6)} />
        <Medallion x={560} y={650} r={110} p={ramp(t, 2.4, 4.0)} ar="التلميذ" color={C.gold} />
        <g opacity={badge} transform={`translate(668,560) scale(${0.6 + 0.4 * badge})`}>
          <circle r={38} fill={C.red} stroke={C.parchment} strokeWidth={3} />
          <text y={11} textAnchor="middle" fontFamily={F.sans} fontWeight={600} fontSize={30} fill={C.parchment}>
            1<tspan fontSize={17} dy={-10}>er</tspan>
          </text>
        </g>
        <Draw d="M700,650 C860,650 980,560 1120,560" p={ramp(t, 6.0, 7.2)} stroke={C.gold} strokeWidth={2.5} strokeDasharray="1 1" />
        <Book x={1340} y={520} p={ramp(t, 6.6, 8.6)} />
      </svg>
      <div style={{position: 'absolute', left: 280, top: 790, width: 560, textAlign: 'center', opacity: ramp(t, 3.2, 4)}}>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 44, color: C.parchment}}>Abderrahmane Bachtarzi</div>
        <div style={{fontFamily: F.sans, fontSize: 20, letterSpacing: 4, color: C.gold}}>SON PREMIER ÉLÈVE</div>
      </div>
      <div style={{position: 'absolute', left: 1090, top: 680, width: 500, textAlign: 'center', opacity: ramp(t, 7.6, 8.4)}}>
        <div style={{fontFamily: F.arabic, fontSize: 52, color: C.gold}}>المنظومة الرحمانية</div>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 44, color: C.parchment}}>La Mandhouma Rahmania</div>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 30, color: C.parchmentDim}}>le texte étudié aujourd'hui</div>
      </div>
      <Caption
        lines={[
          [0.3, 5.6, 'Quand il arrive en Algérie, son premier élève est cheikh Abderrahmane Bachtarzi.'],
          [5.8, 11, "C'est lui qui a composé la Mandhouma Rahmania, le poème que l'on étudie."],
        ]}
      />
    </Scene>
  );
};

