import React from 'react';
import {C, F, easeOut, mix, ramp, span} from '../theme';
import {Caption, Draw, Medallion, Scene, octagram, useTime} from '../ui';

/** Reed pen (qalam). */
const Qalam: React.FC<{x: number; y: number; o: number; wobble: number}> = ({x, y, o, wobble}) => (
  <g transform={`translate(${x},${y}) rotate(${-40 + wobble})`} opacity={o}>
    <rect x={0} y={-7} width={200} height={14} rx={5} fill="#b48a52" stroke={C.night} strokeWidth={2} />
    <path d="M0,-7 L-34,0 L0,7 Z" fill="#8a6634" stroke={C.night} strokeWidth={2} />
    <line x1={-30} y1={0} x2={-8} y2={0} stroke={C.night} strokeWidth={1.5} />
  </g>
);

export const Author: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const phase2 = ramp(t, 5.4, 6.4);
  const master = [380, 470];
  const student = [960, 470];
  const readers = [
    [1560, 280],
    [1620, 470],
    [1560, 660],
  ];
  const flow = (a: number[], b: number[], k: number, n: number, speed: number, o: number) =>
    Array.from({length: n}, (_, i) => {
      const u = (t * speed + i / n) % 1;
      return <circle key={`${k}-${i}`} cx={mix(a[0], b[0], u)} cy={mix(a[1], b[1], u)} r={7} fill={C.gold} opacity={o * Math.sin(u * Math.PI)} />;
    });
  const lineCount = 5;
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={510} y1={470} x2={830} y2={470} stroke={C.gold} strokeWidth={2} opacity={0.35} />
        {flow([510, 470], [830, 470], 0, 6, 0.45, ramp(t, 1, 1.6) * (1 - 0.6 * phase2))}
        <Medallion x={master[0]} y={master[1]} r={120} p={ramp(t, 0.2, 1.6)} ar="الشيخ" title="Le maître" color={C.green} fill="#13261f" />
        <Medallion x={student[0]} y={student[1]} r={120} p={ramp(t, 0.6, 2.0)} ar="باش تارزي" title="L'élève" color={C.gold} />
        {readers.map((r, i) => (
          <g key={i}>
            <line x1={1090} y1={470} x2={r[0] - 70} y2={r[1]} stroke={C.gold} strokeWidth={2} opacity={0.35 * ramp(t, 7.4, 8)} />
            {flow([1090, 470], [r[0] - 70, r[1]], i + 1, 4, 0.5, ramp(t, 8, 8.6))}
            <circle cx={r[0]} cy={r[1]} r={56} fill={C.ink} stroke={C.parchmentDim} strokeWidth={2} opacity={ramp(t, 7.6 + i * 0.3, 8.2 + i * 0.3)} />
            <path d={octagram(r[0], r[1], 30)} fill="none" stroke={C.parchmentDim} strokeWidth={1.4} opacity={ramp(t, 7.6 + i * 0.3, 8.2 + i * 0.3)} />
          </g>
        ))}
        <text x={1600} y={790} textAnchor="middle" fontFamily={F.serif} fontStyle="italic" fontSize={32} fill={C.parchmentDim} opacity={ramp(t, 8.6, 9.4)}>
          ceux qui apprendront après lui
        </text>
        {/* writing lines under the student */}
        {Array.from({length: lineCount}, (_, i) => {
          const p = ramp(t, 6.2 + i * 0.55, 6.9 + i * 0.55);
          const w = 300 - (i % 2) * 40;
          return (
            <g key={i} opacity={phase2}>
              <line x1={960 + w / 2} y1={680 + i * 30} x2={960 + w / 2 - w * p} y2={680 + i * 30} stroke={C.parchment} strokeWidth={4} strokeLinecap="round" />
              <circle cx={960 - w / 2} cy={680 + i * 30} r={5} fill={C.red} opacity={p >= 1 ? 1 : 0} />
            </g>
          );
        })}
        <Qalam
          x={960 + 150 - 300 * ((t - 6.2) / 0.55 - Math.floor((t - 6.2) / 0.55))}
          y={680 + Math.min(lineCount - 1, Math.max(0, Math.floor((t - 6.2) / 0.55))) * 30 - 6}
          o={phase2 * (1 - ramp(t, 9, 9.4))}
          wobble={Math.sin(t * 18) * 4}
        />
      </svg>
      <div style={{position: 'absolute', left: 520, top: 330, width: 300, textAlign: 'center', fontFamily: F.sans, fontSize: 22, letterSpacing: 4, color: C.gold, opacity: ramp(t, 1.2, 1.8) * (1 - phase2)}}>
        RECEVOIR
        <div style={{fontFamily: F.arabic, letterSpacing: 0, fontSize: 36}}>التلقّي</div>
      </div>
      <div style={{position: 'absolute', left: 1410, top: 120, width: 360, textAlign: 'center', fontFamily: F.sans, fontSize: 22, letterSpacing: 4, color: C.gold, opacity: ramp(t, 7.2, 7.8)}}>
        ÉCRIRE · TRANSMETTRE
        <div style={{fontFamily: F.arabic, letterSpacing: 0, fontSize: 36}}>التأليف</div>
      </div>
      <Caption
        lines={[
          [0.3, 5.2, 'Il devient son élève le plus important.'],
          [5.4, 9.2, "Pourquoi ? Parce qu'il se met à écrire."],
          [9.4, 13, "Il n'est plus seulement celui qui reçoit : il devient un auteur de la Tariqa Rahmania."],
        ]}
      />
    </Scene>
  );
};

/** Prose bars morph into verses (two hemistichs per line, rhyme on the left in Arabic). */
export const Verse: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const m = ramp(t, 4.2, 7.0, easeOut);
  const rhyme = ramp(t, 7.4, 8.4);
  const prose = [520, 470, 540, 380, 510, 490, 530, 300];
  const bars = prose.map((w, i) => {
    // prose: left block, ragged lines
    const px = 200;
    const py = 330 + i * 46;
    // verse: right block; verse row = floor(i/2); i even = sadr (right), odd = ajuz (left)
    const row = Math.floor(i / 2);
    const vy = 340 + row * 92;
    const hw = 270;
    const vx = i % 2 === 0 ? 1460 : 1150;
    return {x: mix(px, vx, m), y: mix(py, vy, m), w: mix(w, hw, m)};
  });
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={160} y={270} width={620} height={430} rx={14} fill="none" stroke={C.parchmentDim} strokeWidth={2} strokeDasharray="10 10" opacity={0.6 - 0.35 * m} />
        <rect x={1110} y={270} width={660} height={430} rx={14} fill="rgba(214,170,92,0.06)" stroke={C.gold} strokeWidth={2} opacity={m} />
        <Draw d="M820,485 L1060,485" p={ramp(t, 3.2, 4.4)} stroke={C.gold} strokeWidth={3} />
        <path d="M1040,470 L1064,485 L1040,500" fill="none" stroke={C.gold} strokeWidth={3} opacity={ramp(t, 4.2, 4.4)} />
        {prose.map((w, i) => (
          <rect key={`g${i}`} x={200} y={330 + i * 46} width={w} height={14} rx={7} fill={C.parchment} opacity={0.14 * m} />
        ))}
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={14} rx={7} fill={C.parchment} opacity={0.88 * ramp(t, 0.4 + i * 0.12, 0.9 + i * 0.12)} />
        ))}
        {[0, 1, 2, 3].map((row) => (
          <g key={row} opacity={rhyme}>
            <circle cx={1150 - 26} cy={347 + row * 92} r={11} fill={C.red} />
            <path d={octagram(1150 - 26, 347 + row * 92, 18)} fill="none" stroke={C.gold} strokeWidth={1.3} />
          </g>
        ))}
        <line x1={1440} y1={320} x2={1440} y2={640} stroke={C.gold} strokeWidth={1} strokeDasharray="4 8" opacity={m} />
        <g fontFamily={F.arabic} fontSize={34} fill={C.gold} textAnchor="middle" opacity={ramp(t, 7, 7.8)}>
          <text x={1595} y={680}>الصدر</text>
          <text x={1285} y={680}>العجز</text>
          <text x={1124} y={740}>القافية</text>
        </g>
        <text x={1124} y={772} textAnchor="middle" fontFamily={F.sans} fontSize={18} letterSpacing={3} fill={C.parchmentDim} opacity={ramp(t, 7.4, 8.2)}>
          LA RIME
        </text>
      </svg>
      <div style={{position: 'absolute', left: 160, top: 190, width: 620, textAlign: 'center', opacity: ramp(t, 0.2, 0.8) * (1 - 0.5 * m)}}>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 44, color: C.parchment}}>Les cours du cheikh</div>
      </div>
      <div style={{position: 'absolute', left: 1110, top: 160, width: 660, textAlign: 'center', opacity: ramp(t, 5.4, 6.4)}}>
        <div style={{fontFamily: F.arabic, fontSize: 50, color: C.gold, lineHeight: 1}}>قصائد</div>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 44, color: C.parchment}}>des qasayed : des poèmes</div>
      </div>
      <Caption
        lines={[
          [0.3, 7.2, 'Les cours reçus de son cheikh, il les réécrit sous forme de qasayed, de poèmes.'],
          [7.4, 15, 'Dans ces vers, on retrouve les règles de la voie et ce qu’il a appris de son maître.'],
        ]}
      />
    </Scene>
  );
};

const ALFIYYA = [
  ['قَالَ', 'مُحَمَّدٌ', 'هُوَ', 'ابْنُ', 'مَالِكِ'],
  ['أَحْمَدُ', 'رَبِّي', 'اللهَ', 'خَيْرَ', 'مَالِكِ'],
];

const FIELDS = [
  {fr: 'Fiqh', ar: 'الفقه', sub: 'jurisprudence'},
  {fr: 'Hadith', ar: 'الحديث', sub: 'paroles du Prophète'},
  {fr: 'Sira', ar: 'السيرة', sub: 'vie du Prophète'},
  {fr: 'Sunna', ar: 'السنّة', sub: 'tradition'},
  {fr: "Qawa'id", ar: 'القواعد', sub: 'règles'},
];

export const Memory: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const partA = span(t, 0.2, 7.6, 0.6);
  const partB = ramp(t, 7.6, 8.6);
  const beat = 0.55;
  const k = Math.floor((t - 1.4) / beat);
  const words = ALFIYYA.flat();
  const pulse = t > 1.4 && t < 7 ? Math.exp(-(((t - 1.4) % beat) / 0.12)) : 0;
  return (
    <Scene dur={dur}>
      {/* A: the Alfiyya as an example of a didactic poem, read on a beat */}
      <div style={{position: 'absolute', inset: 0, opacity: partA}}>
        <div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center', fontFamily: F.sans, fontSize: 22, letterSpacing: 4, color: C.gold}}>
          UN EXEMPLE CÉLÈBRE · L'ALFIYYA D'IBN MĀLIK, LA GRAMMAIRE EN MILLE VERS
        </div>
        <div style={{position: 'absolute', top: 330, width: '100%', display: 'flex', justifyContent: 'center', gap: 110, direction: 'rtl'}}>
          {ALFIYYA.map((half, h) => (
            <div key={h} style={{display: 'flex', gap: 22, direction: 'rtl'}}>
              {half.map((w, i) => {
                const idx = h * 5 + i;
                const lit = idx <= k % (words.length + 3);
                return (
                  <span key={i} style={{fontFamily: F.arabic, fontSize: 84, color: lit ? C.gold : 'rgba(239,227,200,0.35)', transform: `translateY(${idx === k % (words.length + 3) ? -6 * pulse : 0}px)`}}>
                    {w}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', fontFamily: F.serif, fontStyle: 'italic', fontSize: 36, color: C.parchmentDim}}>
          « Muhammad, fils de Mālik, dit : je loue mon Seigneur, Dieu, le meilleur des souverains. »
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <circle cx={960} cy={640} r={18 + 14 * pulse} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.4 + 0.6 * pulse} />
          <circle cx={960} cy={640} r={8} fill={C.gold} />
          <text x={960} y={712} textAnchor="middle" fontFamily={F.sans} fontSize={20} letterSpacing={4} fill={C.gold}>
            RYTHME · RIME · MÉMOIRE
          </text>
        </svg>
      </div>
      {/* B: all the sciences taught to children through verse */}
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: partB}}>
        {Array.from({length: 24}, (_, i) => {
          const a = (i / 24) * Math.PI * 2 + t * 0.06;
          const o = ramp(t, 11.6 + i * 0.05, 12.2 + i * 0.05);
          return (
            <g key={i} opacity={o * 0.8}>
              <circle cx={960 + Math.cos(a) * 470} cy={480 + Math.sin(a) * 300} r={9} fill={C.parchmentDim} />
              <circle cx={960 + Math.cos(a) * 470} cy={480 + Math.sin(a) * 300 + 20} r={12} fill="none" stroke={C.parchmentDim} strokeWidth={3} />
            </g>
          );
        })}
        {FIELDS.map((f, i) => {
          const a = -Math.PI / 2 + (i / FIELDS.length) * Math.PI * 2 + t * 0.04;
          const x = 960 + Math.cos(a) * 320;
          const y = 470 + Math.sin(a) * 190;
          const o = ramp(t, 8.6 + i * 0.45, 9.3 + i * 0.45);
          return (
            <g key={i} opacity={o}>
              <line x1={960} y1={470} x2={x} y2={y} stroke={C.gold} strokeWidth={1.5} opacity={0.35} />
              <circle cx={x} cy={y} r={78} fill={C.ink} stroke={C.gold} strokeWidth={2.5} />
              <text x={x} y={y - 2} textAnchor="middle" fontFamily={F.arabic} fontSize={36} fill={C.gold}>
                {f.ar}
              </text>
              <text x={x} y={y + 34} textAnchor="middle" fontFamily={F.serif} fontWeight={700} fontSize={28} fill={C.parchment}>
                {f.fr}
              </text>
            </g>
          );
        })}
        <circle cx={960} cy={470} r={96} fill={C.red} opacity={0.9} />
        <path d={octagram(960, 470, 80, t * 0.1)} fill="none" stroke={C.parchment} strokeWidth={1.5} opacity={0.6} />
        <text x={960} y={466} textAnchor="middle" fontFamily={F.arabic} fontSize={44} fill={C.parchment}>
          الشعر
        </text>
        <text x={960} y={504} textAnchor="middle" fontFamily={F.serif} fontWeight={700} fontSize={30} fill={C.parchment}>
          la poésie
        </text>
        <text x={960} y={846} textAnchor="middle" fontFamily={F.sans} fontSize={20} letterSpacing={4} fill={C.gold} opacity={ramp(t, 12.2, 12.8)}>
          ENSEIGNÉ AUX ENFANTS DÈS LE PLUS JEUNE ÂGE
        </text>
      </svg>
      <Caption
        lines={[
          [0.3, 7.4, 'Autrefois, on enseignait par la poésie : elle est facile à mémoriser.'],
          [7.8, 16, 'Fiqh, hadith, sira, sounna, règles : les enfants apprenaient tout en vers.'],
        ]}
      />
    </Scene>
  );
};

export const Preserve: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const rings = [
    {r: 230, text: 'les règles · l’enseignement du maître · '.repeat(3), dir: 1, at: 1.2},
    {r: 330, text: 'des qasayed pour garder la voie · '.repeat(5), dir: -1, at: 2.2},
  ];
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          {rings.map((ring, i) => (
            <path key={i} id={`ring${i}`} d={`M960,${480 - ring.r} a${ring.r},${ring.r} 0 1,1 -0.01,0`} />
          ))}
        </defs>
        {rings.map((ring, i) => (
          <g key={i} transform={`rotate(${ring.dir * t * 6} 960 480)`} opacity={ramp(t, ring.at, ring.at + 1)}>
            <circle cx={960} cy={480} r={ring.r - 40} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.35} />
            <circle cx={960} cy={480} r={ring.r + 22} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.35} />
            <text fontFamily={F.serif} fontSize={30} fill={C.parchment} letterSpacing={1}>
              <textPath href={`#ring${i}`}>{ring.text}</textPath>
            </text>
          </g>
        ))}
        <Medallion x={960} y={480} r={150} p={ramp(t, 0.2, 1.6)} ar="الرحمانية" color={C.green} fill="#13261f" spin={t * 0.08} />
      </svg>
      <Caption lines={[[0.3, 9, 'Il a suivi la même méthode pour garder la Tariqa.']]} />
    </Scene>
  );
};

