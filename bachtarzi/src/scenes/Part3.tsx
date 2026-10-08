import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, eBack, eInOut, lerp, prog, star8} from '../anim';
import {Box, SceneProps, Svg} from '../components/Layout';
import {CAFTAN, CAFTAN_HEM, CAFTAN_OPENING, CaftanIcon, Rosette, VEST} from '../components/Ornaments';
import {Ar, italic, Kicker, Rv, sans, serif, Words} from '../components/Text';
import {Thread} from '../components/Thread';
import {AR, C, SANS} from '../theme';
import TL from '../timeline.json';
import {Chip} from './Part1';

// ---------- He loves numbers: the tape measure ----------
export const Measure: React.FC<SceneProps> = ({t}) => {
  const W = lerp(0, 2080, prog(t, 0.7, 2.6, eInOut));
  const Y = 462, TH = 84, U = 12;
  const caseX = -40 + W + 74;
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <clipPath id="tape-clip">
            <rect x={-40} y={Y - 10} width={Math.max(0, W)} height={TH + 20} />
          </clipPath>
          <linearGradient id="tape-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EDCF79" />
            <stop offset="1" stopColor="#D6AE4C" />
          </linearGradient>
        </defs>
        <g clipPath="url(#tape-clip)">
          <rect x={-40} y={Y} width={2200} height={TH} fill="url(#tape-g)" />
          <rect x={-40} y={Y + TH - 4} width={2200} height={4} fill="#000" opacity={0.12} />
          {Array.from({length: 172}, (_, i) => {
            const x = 20 + i * U;
            const big = i % 10 === 0, mid = i % 5 === 0;
            const h = big ? 34 : mid ? 24 : 13;
            return (
              <g key={i}>
                <rect x={x - 0.9} y={Y} width={1.8} height={h} fill={C.ink} opacity={0.85} />
                {big && i > 0 ? (
                  <text x={x} y={Y + 66} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 600, fontSize: 22}} fill={i % 50 === 0 ? C.terra : C.ink}>
                    {i}
                  </text>
                ) : null}
              </g>
            );
          })}
          <rect x={-40} y={Y - 6} width={30} height={TH + 12} rx={3} fill="#8A8E96" />
        </g>
        <g transform={`translate(${caseX} ${Y + TH / 2})`} opacity={clamp((1960 - caseX) / 200 + 0.2)}>
          <circle r={84} fill="#2B2F3A" />
          <circle r={70} fill="none" stroke="#8A8E96" strokeWidth={4} />
          <g transform={`rotate(${(W / 84) * 57.3})`}>
            <path d="M0 0 m-40 0 a40 40 0 1 1 80 0 a34 34 0 1 1 -68 0 a28 28 0 1 1 56 0" fill="none" stroke={C.tape} strokeWidth={3} opacity={0.7} />
          </g>
          <circle r={12} fill={C.goldHi} />
        </g>
        <Thread d="M120 960 L1800 960" p={prog(t, 3.6, 3.4, eInOut)} color={C.gold} width={3} dash={[16, 10]} needle />
      </Svg>
      <Box x={140} y={140} w={1700}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 30}}>
          <span style={serif(112)}>
            <Words t={t} at={0.2} text="Il aime le chiffre," stagger={0.09} />
          </span>
          <Rv t={t} at={1.1} style={italic(84, C.terra)}>
            et la mesure.
          </Rv>
        </div>
      </Box>
      <Box x={140} y={610} w={1700}>
        <div style={serif(74)}>
          <Words t={t} at={3.4} text={'Pourquoi\u00A0? Parce qu’il était couturier.'} stagger={0.08} wordStyle={(i) => (i === 0 ? {color: C.terra} : undefined)} />
        </div>
        <Rv t={t} at={5.0} style={{display: 'flex', gap: 18, marginTop: 30}}>
          <Chip>
            khayyât <Ar size={32}>خيّاط</Ar>
          </Chip>
          <Chip>terzi · en turc</Chip>
          <Chip>tailleur, couturier</Chip>
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Bach + Terzi ----------
export const Name: React.FC<SceneProps> = ({t}) => {
  const m = prog(t, 3.6, 1.2, eInOut);
  const part = (x: number, word: string, tr: string, gloss: string, at: number, dir: number) => (
    <>
      <Box x={x + dir * m * 220} y={330} w={560} center style={{opacity: prog(t, at, 0.8) * (1 - m)}}>
        <Rv t={t} at={at} style={serif(170, 700)}>
          {word}
        </Rv>
      </Box>
      <Box x={x} y={560} w={560} center style={{opacity: 1 - m}}>
        <Rv t={t} at={at + 0.5}>
          <div style={{...sans(20, C.goldDark, 600), letterSpacing: '0.2em'}}>TURC · {tr}</div>
          <div style={{...italic(56, C.terra), marginTop: 4}}>{gloss}</div>
        </Rv>
      </Box>
    </>
  );
  return (
    <AbsoluteFill>
      <Svg>
        <path d={star8(960, 430, 22, t * 0.6)} fill={C.gold} opacity={prog(t, 1.4, 0.5) * (1 - m)} />
        <Thread d="M560 820 L1360 820" p={prog(t, 4.4, 1.2, eInOut)} color={C.gold} width={2} />
        <path d={star8(960, 820, 12)} fill={C.gold} opacity={prog(t, 5.0, 0.5)} />
      </Svg>
      <Box x={960} y={90} w={1700} center>
        <Kicker t={t} at={0.1} center>
          Un nom de métier
        </Kicker>
        <Rv t={t} at={0.3} style={{...serif(50, 600, C.inkSoft), marginTop: 16}}>
          Abderrahmane Ben Memmach, surnommé «&nbsp;terzi&nbsp;» : le tailleur
        </Rv>
      </Box>
      {part(600, 'Bach', 'BAŞ', 'chef', 0.8, 1)}
      {part(1320, 'Terzi', 'TERZI', 'tailleur', 1.4, -1)}
      <Box x={960} y={330} w={1400} center style={{opacity: m}}>
        <div style={{...serif(170, 700), letterSpacing: `${(1 - m) * 0.2}em`}}>Bachtarzi</div>
      </Box>
      <Box x={960} y={560} w={1400} center style={{opacity: prog(t, 4.2, 0.8)}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40}}>
          <span style={italic(60, C.terra)}>«&nbsp;le chef tailleur&nbsp;»</span>
          <Ar size={70} ruqaa>
            باش تارزي
          </Ar>
        </div>
      </Box>
      <Box x={960} y={880} w={1500} center>
        <Rv t={t} at={5.2} style={sans(26, C.inkSoft)}>
          Le même «&nbsp;bach&nbsp;» que dans <b style={{color: C.ink}}>bach-agha</b> : l’agha en chef.
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- His clients ----------
const CLIENTS = [
  {ar: 'الخوجات', fr: 'Khodjas', gloss: 'secrétaires, scribes'},
  {ar: 'الآغاوات', fr: 'Aghas', gloss: 'commandants'},
  {ar: 'الباشآغاوات', fr: 'Bachaghas', gloss: 'aghas de haut rang'},
  {ar: 'الدايات', fr: 'Deys', gloss: 'souverains de la Régence'},
];

export const Clients: React.FC<SceneProps> = ({t}) => (
  <AbsoluteFill>
    <Svg>
      {CLIENTS.map((c, i) => {
        const x = 380 + i * 386;
        const top = 840 - i * 70;
        const k = prog(t, 1.8 + i * 0.45, 1.0);
        const ic = prog(t, 2.3 + i * 0.45, 0.9, eBack);
        const h = 190 + i * 32;
        return (
          <g key={i}>
            <g transform={`translate(0 ${(1 - k) * 120})`} opacity={k}>
              <rect x={x - 168} y={top} width={336} height={1200 - top} fill={C.night2} stroke="rgba(217,174,85,0.25)" />
              <rect x={x - 168} y={top} width={336} height={3} fill={C.goldHi} />
            </g>
            <g transform={`translate(${x} ${top - 6}) scale(${lerp(0.6, 1, ic)}) translate(${-x} ${-(top - 6)})`}>
              <CaftanIcon x={x} y={top - 6} h={h} level={i} p={ic} dark />
            </g>
          </g>
        );
      })}
    </Svg>
    {CLIENTS.map((c, i) => {
      const x = 380 + i * 386;
      const top = 840 - i * 70;
      return (
        <Box key={i} x={x} y={top + 14} w={330} center>
          <Rv t={t} at={2.2 + i * 0.45} y={14}>
            <Ar size={30} color={C.goldHi} weight={400}>
              {c.ar}
            </Ar>
            <div style={serif(46, 700, C.ivory)}>{c.fr}</div>
            <div style={{...sans(19, 'rgba(243,235,221,0.7)'), marginTop: 4}}>{c.gloss}</div>
          </Rv>
        </Box>
      );
    })}
    <Box x={140} y={80} w={1640}>
      <Kicker t={t} at={0.1} color={C.goldHi} line={C.goldHi}>
        Ses clients
      </Kicker>
      <div style={{...serif(92, 600, C.ivory), marginTop: 16}}>
        <Words t={t} at={0.3} text={'Pour qui cousait-il\u00A0?'} />
      </div>
      <Rv t={t} at={1.1} style={{...italic(50, C.goldHi), marginTop: 8}}>
        Pour l’élite du pouvoir ottoman à Alger.
      </Rv>
    </Box>
    <Box x={140} y={400} w={640}>
      <Rv t={t} at={4.6} style={{...italic(38, 'rgba(243,235,221,0.85)'), borderLeft: `3px solid ${C.goldHi}`, paddingLeft: 24}}>
        «&nbsp;Pas un couturier pour le public : un couturier de la très haute classe.&nbsp;»
      </Rv>
    </Box>
  </AbsoluteFill>
);

// ---------- The pattern: measure, plan, cut ----------
const FRONT = 'M200 240 Q285 236 300 150 L470 190 Q428 282 455 360 L560 900 L200 900 Z';
const SLEEVE = 'M640 380 Q760 214 880 380 L940 860 L580 860 Z';
const DIMS: {d: string; label: string; at: [number, number]; rot?: number}[] = [
  {d: 'M160 150 L160 900', label: '118', at: [140, 525], rot: -90},
  {d: 'M200 950 L560 950', label: '42', at: [380, 985]},
  {d: 'M318 112 L488 152', label: '16', at: [410, 112], rot: 13},
  {d: 'M990 300 L990 860', label: '64', at: [1022, 590], rot: -90},
  {d: 'M580 910 L940 910', label: '30', at: [760, 948]},
];

const Arrowed: React.FC<{d: string; p: number}> = ({d, p}) => {
  const m = d.match(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/)!;
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const head = (x: number, y: number, ang: number) => (
    <path d="M0 0 L-14 -6 M0 0 L-14 6" transform={`translate(${x} ${y}) rotate(${ang})`} stroke={C.chalk} strokeWidth={2.4} fill="none" opacity={p} />
  );
  return (
    <g>
      <Thread d={d} p={p} color={C.chalk} width={2} cap="butt" />
      {head(x2, y2, a)}
      {head(x1, y1, a + 180)}
    </g>
  );
};

export const Pattern: React.FC<SceneProps> = ({t}) => {
  const lines = ['Mesurer.', 'Concevoir un plan.', 'Tracer le patron.'];
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g transform="translate(110 40)">
          <g opacity={prog(t, 0, 1) * 0.08}>
            {Array.from({length: 26}, (_, i) => (
              <path key={`v${i}`} d={`M${i * 40} 60 L${i * 40} 980`} stroke={C.chalk} strokeWidth={1} />
            ))}
            {Array.from({length: 24}, (_, i) => (
              <path key={`h${i}`} d={`M0 ${60 + i * 40} L1000 ${60 + i * 40}`} stroke={C.chalk} strokeWidth={1} />
            ))}
          </g>
          <g filter="url(#chalk)">
            <path d={FRONT} fill={C.chalk} opacity={prog(t, 2.6, 1) * 0.06} />
            <path d={SLEEVE} fill={C.chalk} opacity={prog(t, 3.6, 1) * 0.06} />
            <Thread d={FRONT} p={prog(t, 0.5, 2.2, eInOut)} color={C.chalk} width={3.2} />
            <Thread d={SLEEVE} p={prog(t, 2.0, 1.7, eInOut)} color={C.chalk} width={3.2} />
            <g transform="translate(380 570) scale(1.045) translate(-380 -570)">
              <Thread d={FRONT} p={prog(t, 4.2, 1.8)} color={C.chalk} width={1.6} dash={[10, 9]} opacity={0.7} />
            </g>
            <path d="M380 600 L380 760 M372 610 L380 600 L388 610" stroke={C.chalk} strokeWidth={2} fill="none" opacity={prog(t, 4.6, 0.6) * 0.8} />
            {DIMS.map((dm, i) => (
              <Arrowed key={i} d={dm.d} p={prog(t, 3.2 + i * 0.35, 0.8)} />
            ))}
          </g>
          {DIMS.map((dm, i) => (
            <text
              key={i}
              x={dm.at[0]}
              y={dm.at[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={dm.rot ? `rotate(${dm.rot} ${dm.at[0]} ${dm.at[1]})` : undefined}
              style={{fontFamily: SANS, fontWeight: 600, fontSize: 26}}
              fill={C.goldHi}
              stroke={C.indigo}
              strokeWidth={8}
              paintOrder="stroke"
              opacity={prog(t, 3.6 + i * 0.35, 0.5)}
            >
              {dm.label}
            </text>
          ))}
          <text x={300} y={640} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 600, fontSize: 18, letterSpacing: '0.2em'}} fill={C.chalk} opacity={prog(t, 4.8, 0.6) * 0.7}>
            DEVANT
          </text>
          <text x={760} y={640} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 600, fontSize: 18, letterSpacing: '0.2em'}} fill={C.chalk} opacity={prog(t, 4.8, 0.6) * 0.7}>
            MANCHE
          </text>
        </g>
      </Svg>
      <Box x={1230} y={170} w={620}>
        <Kicker t={t} at={0.3} color={C.goldHi} line={C.goldHi}>
          La couture, une science
        </Kicker>
        <div style={{marginTop: 36}}>
          {lines.map((l, i) => (
            <Rv key={i} t={t} at={1.0 + i * 1.3} x={-24} y={0} style={{display: 'flex', alignItems: 'baseline', gap: 22, marginBottom: 18}}>
              <span style={{...sans(20, C.goldHi, 600), letterSpacing: '0.1em'}}>0{i + 1}</span>
              <span style={serif(66, 600, C.ivory)}>{l}</span>
            </Rv>
          ))}
        </div>
        <Rv t={t} at={5.4} style={{...italic(42, C.goldHi), marginTop: 40, borderLeft: `3px solid ${C.goldHi}`, paddingLeft: 24}}>
          «&nbsp;Ce n’est pas seulement un lettré, ni un fellah : c’est un technicien.&nbsp;»
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Sewing the poem ----------
const STEPS = [
  {name: 'Le patron', gloss: 'le plan d’ensemble'},
  {name: 'Le tissu', gloss: 'la matière : l’enseignement reçu'},
  {name: 'Les superpositions', gloss: 'des couches qui s’assemblent'},
  {name: 'Les garnitures', gloss: 'les ornements'},
  {name: 'Les finitions', gloss: 'la touche finale'},
];
const S = TL.sewing.steps;

export const Sewing: React.FC<SceneProps> = ({t}) => {
  const active = S.reduce((acc, s, i) => (i < 5 && t >= s ? i : acc), -1);
  const outline = prog(t, S[0], 2.0, eInOut);
  const fabric = prog(t, S[1], 1.5, eInOut);
  const lining = prog(t, S[2], 0.9);
  const vest = prog(t, S[2] + 0.5, 1.2, eBack);
  const trims = prog(t, S[3], 1.6, eInOut);
  const finish = prog(t, S[4], 1.6, eInOut);
  const shine = clamp((t - (S[4] + 1.3)) / 1.2);
  const buttons = [150, 205, 260, 315, 370];
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <clipPath id="caftan-clip">
            <path d={CAFTAN} />
          </clipPath>
          <pattern id="twill" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width={10} height={10} fill={C.indigo} />
            <rect width={4} height={10} fill="#27386077" />
          </pattern>
          <linearGradient id="shine" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <path id="hem-path" d="M150 735 Q300 764 450 735" />
        </defs>
        <g transform="translate(250 205) scale(0.94)">
          <g clipPath="url(#caftan-clip)">
            <rect x={0} y={0} width={600} height={800 * fabric} fill="url(#twill)" />
            <path d="M300 82 L262 800 L338 800 Z" fill={C.terra} opacity={lining * fabric} />
            <rect x={0} y={0} width={600} height={800} fill="#000" opacity={0.12 * fabric} />
            {shine > 0 && shine < 1 ? <rect x={-300 + shine * 1200} y={0} width={220} height={800} fill="url(#shine)" transform="skewX(-15)" /> : null}
          </g>
          <Thread d={CAFTAN} p={outline} color={fabric > 0.5 ? C.goldDark : C.ink} width={3} dash={fabric > 0.99 ? undefined : [16, 10]} needle={outline < 1} />
          <Thread d={CAFTAN_OPENING} p={outline} color={C.ink} width={2} dash={[10, 10]} opacity={1 - fabric} />
          <g transform={`translate(0 ${(1 - vest) * -70})`} opacity={clamp(vest * 1.5)}>
            <path d={VEST} fill={C.wine} />
            <Thread d={VEST} p={trims} color={C.goldHi} width={7} />
            {buttons.map((y, i) => (
              <circle key={y} cx={300} cy={y} r={10 * prog(t, S[3] + 0.6 + i * 0.12, 0.5, eBack)} fill={C.goldHi} />
            ))}
            {[0, 1].map((side) => (
              <Thread
                key={side}
                d={side ? 'M330 120 C 380 160, 360 220, 410 250 S 400 360, 420 400' : 'M270 120 C 220 160, 240 220, 190 250 S 200 360, 180 400'}
                p={prog(t, S[3] + 0.4, 1.4)}
                color={C.goldHi}
                width={3}
              />
            ))}
          </g>
          <Thread d="M20 326 L96 366" p={trims} color={C.goldHi} width={14} cap="butt" />
          <Thread d="M580 326 L504 366" p={trims} color={C.goldHi} width={14} cap="butt" />
          <Thread d={CAFTAN_HEM} p={trims} color={C.goldHi} width={4} />
          <path d={star8(300, 590, 62)} fill="none" stroke={C.goldHi} strokeWidth={4} opacity={prog(t, S[3] + 0.8, 0.8)} />
          <path d={star8(300, 590, 26, Math.PI / 8)} fill={C.goldHi} opacity={prog(t, S[3] + 1.0, 0.8)} />
          <text style={{fontFamily: AR, fontWeight: 700, fontSize: 25}} fill={C.goldHi} opacity={prog(t, S[3] + 1.0, 1)} direction="rtl">
            <textPath href="#hem-path" startOffset="50%" textAnchor="middle">
              المنظومة الرحمانية
            </textPath>
          </text>
          <Thread d={CAFTAN} p={finish} color={C.goldHi} width={2.4} dash={[6, 6]} opacity={0.95} />
          {[
            [140, 140],
            [470, 300],
            [380, 640],
          ].map(([x, y], i) => {
            const k = clamp((t - (S[4] + 1.6 + i * 0.2)) / 0.9);
            return k > 0 && k < 1 ? <path key={i} d={star8(x, y, 18 * Math.sin(Math.PI * k), k)} fill="#fff" opacity={0.8 * Math.sin(Math.PI * k)} /> : null;
          })}
        </g>
      </Svg>
      <Box x={140} y={56} w={1700}>
        <Kicker t={t} at={0.1}>Le poème comme un vêtement</Kicker>
        <div style={{...serif(70), marginTop: 14}}>
          <Words t={t} at={0.3} text="Il a écrit ses poèmes comme on coud un habit" stagger={0.06} />
        </div>
      </Box>
      <Box x={1000} y={270} w={840}>
        {STEPS.map((s, i) => {
          const k = prog(t, S[i] - 0.2, 0.6);
          const state = i < active ? 'done' : i === active ? 'active' : 'todo';
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, height: 128, opacity: 0.25 + 0.75 * k}}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...sans(22, state === 'active' ? C.paperHi : C.goldDark, 600),
                  background: state === 'active' ? C.terra : state === 'done' ? 'rgba(184,134,43,0.14)' : 'transparent',
                  border: `2px solid ${state === 'active' ? C.terra : C.gold}`,
                  transform: `scale(${state === 'active' ? 1 + 0.1 * Math.exp(-(t - S[i]) * 4) : 1})`,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={serif(56, 700, state === 'todo' ? C.muted : C.ink)}>{s.name}</div>
                <div style={{...sans(22, state === 'active' ? C.terra : C.muted, 500), marginTop: 4}}>{s.gloss}</div>
              </div>
            </div>
          );
        })}
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Finale ----------
export const Finale: React.FC<SceneProps> = ({t}) => (
  <AbsoluteFill>
    <Svg>
      <Rosette cx={960} cy={270} R={130} p={prog(t, 0.1, 2.2, eInOut)} color={C.goldHi} rot={-t * 0.04} fill="rgba(217,174,85,0.05)" />
      <Thread d="M800 270 L300 270" p={prog(t, 1.0, 1.4, eInOut)} color={C.goldHi} width={1.4} />
      <Thread d="M1120 270 L1620 270" p={prog(t, 1.0, 1.4, eInOut)} color={C.goldHi} width={1.4} />
    </Svg>
    <Box x={960} y={470} w={1700} center>
      <div style={serif(108, 600, C.ivory)}>
        <Words t={t} at={0.8} text="Cheikh Abderrahmane Bachtarzi" stagger={0.1} />
      </div>
      <Rv t={t} at={1.6} style={{marginTop: 6}}>
        <Ar size={58} color={C.goldHi}>
          الشيخ عبد الرحمن باش تارزي
        </Ar>
      </Rv>
      <Rv t={t} at={2.4} style={{...italic(46, 'rgba(243,235,221,0.9)'), marginTop: 18}}>
        Un personnage très important — à lire, et à faire connaître.
      </Rv>
    </Box>
    <Box x={960} y={960} w={1600} center>
      <Rv t={t} at={3.4} style={{...sans(18, 'rgba(243,235,221,0.55)', 500), letterSpacing: '0.14em'}}>
        D’APRÈS UNE EXPLICATION ORALE SUR LA MANDHOUMA RAHMANIA
      </Rv>
    </Box>
  </AbsoluteFill>
);


