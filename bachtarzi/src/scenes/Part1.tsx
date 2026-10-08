import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {arc, circle, clamp, eInOut, prog, rng, smooth, star8} from '../anim';
import {Box, SceneProps, Svg} from '../components/Layout';
import {Medallion, Qubba, Rosette} from '../components/Ornaments';
import {Ar, italic, Kicker, Rv, sans, serif, Words} from '../components/Text';
import {Thread, usePathPoint} from '../components/Thread';
import {LABELS, LAND, PLACES, RIVERS, SEA_INLAND} from '../geo';
import {AR, C, SANS, SERIF} from '../theme';
import TL from '../timeline.json';

// ---------- Title ----------
export const Title: React.FC<SceneProps> = ({t}) => {
  const p = prog(t, 0.1, 2.6, eInOut);
  const side = prog(t, 1.2, 1.6, eInOut);
  return (
    <AbsoluteFill>
      <Svg>
        <Rosette cx={960} cy={290} R={150} p={p} rot={t * 0.04} fill="rgba(184,134,43,0.10)" />
        <Thread d="M780 290 L250 290" p={side} width={1.6} />
        <Thread d="M1140 290 L1670 290" p={side} width={1.6} />
        {[250, 1670].map((x) => (
          <path key={x} d={star8(x, 290, 10)} fill={C.gold} opacity={prog(t, 2.6, 0.5)} />
        ))}
      </Svg>
      <Box x={960} y={500} w={1600} center>
        <Kicker t={t} at={1.3} center>
          Tariqa Rahmania · Alger · XVIII<sup style={{fontSize: '0.6em'}}>e</sup> siècle
        </Kicker>
        <div style={{...serif(126), marginTop: 26}}>
          <Words t={t} at={1.8} text="Cheikh Abderrahmane Bachtarzi" stagger={0.12} />
        </div>
        <Rv t={t} at={2.9} style={{marginTop: 6}}>
          <Ar size={64}>الشيخ عبد الرحمن باش تارزي</Ar>
        </Rv>
        <Rv t={t} at={3.7} style={{...italic(46), marginTop: 4}}>
          le couturier de la <span style={{color: C.terra}}>Mandhouma Rahmania</span>
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Chapter cards ----------
const ChapterCard: React.FC<SceneProps & {i: number}> = ({t, i}) => {
  const ch = TL.chapters[i];
  const line = prog(t, 0.5, 1.5, eInOut);
  return (
    <AbsoluteFill>
      <Svg>
        <Thread d="M960 712 L520 712" p={line} color={C.goldHi} width={1.6} />
        <Thread d="M960 712 L1400 712" p={line} color={C.goldHi} width={1.6} />
        <path d={star8(960, 712, 13, t * 0.5)} fill={C.goldHi} opacity={prog(t, 0.4, 0.6)} />
      </Svg>
      <Box x={960} y={250} w={1400} center>
        <Kicker t={t} at={0.2} center color={C.goldHi} line={C.goldHi}>
          Chapitre
        </Kicker>
        <Rv t={t} at={0.3} y={40} style={{...serif(230, 600, C.goldHi), lineHeight: 1, marginTop: 10}}>
          {ch.n}
        </Rv>
        <div style={{...serif(84, 500, C.ivory), marginTop: 40}}>
          <Words t={t} at={0.8} text={ch.title} stagger={0.08} />
        </div>
      </Box>
    </AbsoluteFill>
  );
};
export const Chapter1: React.FC<SceneProps> = (p) => <ChapterCard {...p} i={0} />;
export const Chapter2: React.FC<SceneProps> = (p) => <ChapterCard {...p} i={1} />;
export const Chapter3: React.FC<SceneProps> = (p) => <ChapterCard {...p} i={2} />;

// ---------- The master ----------
const ridge = (seed: number, baseY: number, amp: number, x0: number, x1: number, step: number) => {
  const r = rng(seed);
  const pts: [number, number][] = [];
  for (let x = x0; x <= x1 + 0.1; x += step) {
    const peak = Math.pow(r(), 1.6);
    pts.push([x + (r() - 0.5) * step * 0.5, baseY - amp * (0.25 + 0.75 * peak)]);
  }
  return pts;
};

const Chip: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 22px',
      borderRadius: 40,
      border: `1.5px solid ${dark ? 'rgba(217,174,85,0.6)' : 'rgba(134,96,26,0.45)'}`,
      ...sans(24, dark ? C.ivory : C.ink, 500),
      background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(247,241,228,0.7)',
    }}
  >
    {children}
  </span>
);
export {Chip};

export const Master: React.FC<SceneProps> = ({t}) => {
  const cx = 1400, cy = 520, R = 330;
  const layers = useMemo(
    () =>
      [
        {pts: ridge(11, 600, 170, cx - R - 40, cx + R + 40, 46), fill: '#C9BDA6'},
        {pts: ridge(23, 690, 150, cx - R - 40, cx + R + 40, 58), fill: '#8F948B'},
        {pts: ridge(37, 790, 110, cx - R - 40, cx + R + 40, 72), fill: C.green},
      ].map((l) => {
        const line = smooth(l.pts, false, 0.25);
        const last = l.pts[l.pts.length - 1], first = l.pts[0];
        return {line, fill: `${line} L${last[0]} ${cy + R + 20} L${first[0]} ${cy + R + 20} Z`, color: l.fill};
      }),
    [],
  );
  const ring = prog(t, 0.2, 1.8, eInOut);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <clipPath id="master-win">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
          <linearGradient id="master-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4ECDC" />
            <stop offset="1" stopColor="#E8C9A6" />
          </linearGradient>
        </defs>
        <g clipPath="url(#master-win)" opacity={prog(t, 0.4, 1.2)}>
          <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R} fill="url(#master-sky)" />
          <circle cx={cx + 110} cy={cy - 120 + (1 - prog(t, 0.5, 4)) * 40} r={62} fill={C.terra} opacity={0.22} />
          {layers.map((l, i) => {
            const pl = prog(t, 0.8 + i * 0.5, 1.6, eInOut);
            return (
              <g key={i} transform={`translate(${(1 - prog(t, 0, 8.5, (k) => k)) * (i + 1) * 8} 0)`}>
                <path d={l.fill} fill={l.color} opacity={prog(t, 1.6 + i * 0.5, 1)} />
                <Thread d={l.line} p={pl} color={i === 2 ? C.ink : C.goldDark} width={2.2} opacity={0.8} />
              </g>
            );
          })}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={cx - 120 + i * 26 + (i % 2) * 6} y={cy + 220 - (i % 3) * 10} width={16} height={12} fill={C.paperHi} opacity={prog(t, 3.2 + i * 0.1, 0.5) * 0.85} />
          ))}
        </g>
        <Thread d={circle(cx, cy, R)} p={ring} width={3} />
        <Thread d={circle(cx, cy, R + 12)} p={ring} width={1} opacity={0.6} />
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2 + Math.PI / 4;
          return <path key={i} d={star8(cx + (R + 6) * Math.cos(a), cy + (R + 6) * Math.sin(a), 11)} fill={C.gold} opacity={prog(t, 1.8, 0.6)} />;
        })}
      </Svg>
      <Box x={cx} y={cy + R + 34} w={600} center>
        <Kicker t={t} at={2.4} center>
          Kabylie · Djurdjura
        </Kicker>
      </Box>
      <Box x={140} y={250} w={900}>
        <Kicker t={t} at={0.3}>Son maître</Kicker>
        <div style={{...serif(112), marginTop: 26}}>
          <Words t={t} at={0.6} text="Sidi M’hamed" stagger={0.1} />
          <br />
          <Words t={t} at={0.9} text="Ben Abderrahmane" stagger={0.1} />
        </div>
        <Rv t={t} at={1.8} style={{marginTop: 10}}>
          <Ar size={58}>سيدي امحمد بن عبد الرحمن</Ar>
        </Rv>
        <Rv t={t} at={2.8} style={{display: 'flex', gap: 16, marginTop: 22}}>
          <Chip>Kabyle</Chip>
          <Chip>
            dit «&nbsp;El Azhari&nbsp;» <Ar size={30}>الأزهري</Ar>
          </Chip>
        </Rv>
        <Rv t={t} at={4.2} style={{...italic(44), marginTop: 40, maxWidth: 820}}>
          Parti de Kabylie pour étudier à Al-Azhar, au Caire.
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- The journey ----------
const LEGS = TL.journey.legs;
const ARCS = [
  arc(PLACES.kabylie, [960, 110], PLACES.caire),
  arc(PLACES.caire, [1110, 660], PLACES.soudan),
  arc(PLACES.soudan, [1470, 640], PLACES.caire),
  arc(PLACES.caire, [930, 560], PLACES.alger),
];

const Marker: React.FC<{x: number; y: number; t: number; at: number; again?: number}> = ({x, y, t, at, again}) => {
  const k = prog(t, at, 0.5);
  if (k <= 0) return null;
  const pulse = (t0: number) => {
    const u = clamp((t - t0) / 1.2);
    return u > 0 && u < 1 ? <circle cx={x} cy={y} r={10 + u * 34} fill="none" stroke={C.terra} strokeWidth={2} opacity={1 - u} /> : null;
  };
  return (
    <g>
      {pulse(at)}
      {again !== undefined ? pulse(again) : null}
      <circle cx={x} cy={y} r={14 * k} fill={C.paperHi} stroke={C.terra} strokeWidth={2} />
      <circle cx={x} cy={y} r={7 * k} fill={C.terra} />
    </g>
  );
};

const MapLabel: React.FC<{x: number; y: number; t: number; at: number; title: string; sub?: string; anchor?: 'start' | 'end'; ar?: string}> = ({
  x,
  y,
  t,
  at,
  title,
  sub,
  anchor = 'start',
  ar,
}) => {
  const k = prog(t, at, 0.8);
  const halo = {stroke: C.paper, strokeWidth: 7, paintOrder: 'stroke' as const, strokeLinejoin: 'round' as const};
  return (
    <g opacity={k} transform={`translate(${(1 - k) * (anchor === 'start' ? -10 : 10)} 0)`}>
      <text x={x} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38}} fill={C.ink} {...halo}>
        {title}
      </text>
      {sub ? (
        <text x={x} y={y + 30} textAnchor={anchor} style={{fontFamily: SANS, fontWeight: 600, fontSize: 17, letterSpacing: '0.16em'}} fill={C.goldDark} {...halo}>
          {sub.toUpperCase()}
        </text>
      ) : null}
      {ar ? (
        <text x={x} y={y - 42} textAnchor={anchor === 'start' ? 'end' : 'start'} direction="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 40}} fill={C.goldDark} {...halo}>
          {ar}
        </text>
      ) : null}
    </g>
  );
};

const STEPS = [
  {title: 'Kabylie', sub: 'le point de départ', at: 1.0},
  {title: 'Al-Azhar, Le Caire', sub: 'les études', at: LEGS[0][1]},
  {title: 'Soudan', sub: 'le voyage vers le sud', at: LEGS[1][1]},
  {title: 'Retour à Al-Azhar', sub: 'Le Caire', at: LEGS[2][1]},
  {title: 'Algérie', sub: 'le retour, pour transmettre', at: LEGS[3][1]},
];

export const Journey: React.FC<SceneProps> = ({t, dur}) => {
  const mapIn = prog(t, 0, 1.2);
  const zoom = 1 + 0.05 * clamp(t / dur);
  const legP = LEGS.map(([a, b]) => prog(t, a, b - a, eInOut));
  const active = STEPS.reduce((acc, s, i) => (t >= s.at ? i : acc), -1);
  const halo = (w: number, c: string) => LAND.map((d, i) => <path key={i} d={d} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" />);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: mapIn}}>
        <Svg>
          <defs>
            <pattern id="sea-hatch" width={46} height={18} patternUnits="userSpaceOnUse">
              <path d="M4 10 Q12 5 20 10 T36 10" fill="none" stroke={C.seaLine} strokeWidth={1.1} opacity={0.55} />
            </pattern>
            <linearGradient id="map-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.paper} stopOpacity={1} />
              <stop offset="0.1" stopColor={C.paper} stopOpacity={0} />
              <stop offset="0.9" stopColor={C.paper} stopOpacity={0} />
              <stop offset="1" stopColor={C.paper} stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
            <rect x={-200} y={-200} width={2320} height={1480} fill={C.sea} />
            <rect x={-200} y={-200} width={2320} height={1480} fill="url(#sea-hatch)" opacity={0.8} />
            {halo(22, C.seaLine)}
            {halo(20.4, C.sea)}
            {halo(10, C.seaLine)}
            {halo(8.4, C.sea)}
            {LAND.map((d, i) => (
              <path key={i} d={d} fill={C.paper} stroke={C.inkSoft} strokeWidth={1.6} strokeLinejoin="round" />
            ))}
            {SEA_INLAND.map((d, i) => (
              <path key={i} d={d} fill={C.sea} stroke={C.inkSoft} strokeWidth={1.4} strokeLinejoin="round" />
            ))}
            {RIVERS.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#8EA3A5" strokeWidth={i === 0 ? 2.6 : 1.8} strokeLinecap="round" />
            ))}
            {LABELS.map((l) => (
              <text
                key={l.text}
                x={l.at[0]}
                y={l.at[1]}
                textAnchor="middle"
                transform={l.rotate ? `rotate(${l.rotate} ${l.at[0]} ${l.at[1]})` : undefined}
                style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: l.size, letterSpacing: '0.12em'}}
                fill={C.muted}
                opacity={0.8}
              >
                {l.text}
              </text>
            ))}
            {ARCS.map((d, i) => (
              <g key={i}>
                <Thread d={d} p={legP[i]} color={C.terra} width={6} opacity={0.18} />
                <Thread d={d} p={legP[i]} color={C.terra} width={3} dash={[14, 9]} needle />
              </g>
            ))}
            <Marker {...xy(PLACES.kabylie)} t={t} at={1.0} />
            <Marker {...xy(PLACES.caire)} t={t} at={LEGS[0][1]} again={LEGS[2][1]} />
            <Marker {...xy(PLACES.soudan)} t={t} at={LEGS[1][1]} />
            <Marker {...xy(PLACES.alger)} t={t} at={LEGS[3][1]} />
            <MapLabel x={PLACES.kabylie[0] + 26} y={PLACES.kabylie[1] + 44} t={t} at={1.1} title="Kabylie" />
            <MapLabel x={PLACES.caire[0] + 28} y={PLACES.caire[1] + 10} t={t} at={LEGS[0][1] + 0.1} title="Le Caire" sub="Al-Azhar" ar="الأزهر" />
            <MapLabel x={PLACES.soudan[0] + 28} y={PLACES.soudan[1] + 12} t={t} at={LEGS[1][1] + 0.1} title="Soudan" />
            <MapLabel x={PLACES.alger[0] - 26} y={PLACES.alger[1] - 4} t={t} at={LEGS[3][1] + 0.1} title="Alger" anchor="end" />
          </g>
          <rect x={0} y={0} width={1920} height={1080} fill="url(#map-fade)" />
        </Svg>
      </AbsoluteFill>
      <Box x={96} y={470} w={560}>
        <Kicker t={t} at={0.4}>Un voyage de savoir</Kicker>
        <div style={{...serif(62), marginTop: 18}}>
          <Words t={t} at={0.7} text="De la Kabylie à Al-Azhar, et retour" stagger={0.07} />
        </div>
        <div style={{marginTop: 30}}>
          {STEPS.map((s, i) => {
            const k = prog(t, s.at, 0.6);
            const state = i < active ? 'done' : i === active ? 'active' : 'todo';
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, height: 64, opacity: 0.3 + 0.7 * k}}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...sans(17, state === 'active' ? C.paperHi : C.goldDark, 600),
                    background: state === 'active' ? C.terra : 'transparent',
                    border: `1.5px solid ${state === 'active' ? C.terra : C.gold}`,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{...serif(34, 700, state === 'todo' ? C.muted : C.ink)}}>{s.title}</div>
                  {s.sub ? <div style={{...sans(16, C.muted, 500), letterSpacing: '0.04em'}}>{s.sub}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    </AbsoluteFill>
  );
};
const xy = (p: [number, number]) => ({x: p[0], y: p[1]});

// ---------- Bou Qabrine ----------
export const Tombs: React.FC<SceneProps> = ({t}) => {
  const link = prog(t, 3.2, 1.6, eInOut);
  return (
    <AbsoluteFill>
      <Svg>
        <Qubba x={600} y={800} s={1.05} p={prog(t, 1.4, 2.2)} color={C.goldDark} fill={C.sea} fillOpacity={prog(t, 2.4, 1) * 0.7} />
        <Qubba x={1320} y={800} s={1.15} p={prog(t, 1.0, 2.2)} color={C.ink} fill="#E5D6B8" fillOpacity={prog(t, 2.0, 1)} />
        <Thread d="M600 470 Q960 330 1320 440" p={link} color={C.terra} width={2.4} dash={[10, 8]} />
      </Svg>
      <Box x={960} y={70} w={1600} center>
        <Kicker t={t} at={0.2} center>
          On l’appelle
        </Kicker>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 36, marginTop: 10}}>
          <span style={serif(120)}>
            <Words t={t} at={0.4} text={'«\u00A0Bou Qabrine\u00A0»'} />
          </span>
          <Rv t={t} at={0.9}>
            <Ar size={84} ruqaa>
              بوقبرين
            </Ar>
          </Rv>
        </div>
        <Rv t={t} at={1.5} style={italic(48, C.terra)}>
          l’homme aux deux tombeaux
        </Rv>
      </Box>
      <Box x={600} y={830} w={520} center>
        <Rv t={t} at={3.0}>
          <div style={serif(42, 700, C.inkSoft)}>Aït Smaïl · Kabylie</div>
          <div style={{...sans(19, C.muted), marginTop: 6}}>un second tombeau, selon la tradition</div>
        </Rv>
      </Box>
      <Box x={1320} y={830} w={560} center>
        <Rv t={t} at={2.4}>
          <div style={serif(42, 700)}>Belcourt (El Hamma) · Alger</div>
          <div style={{...sans(19, C.terra, 600), marginTop: 6}}>c’est là qu’il est enterré</div>
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Khalwatia → Rahmania ----------
export const Lineage: React.FC<SceneProps> = ({t}) => {
  const link = prog(t, 1.6, 1.4, eInOut);
  const d = 'M770 560 Q960 470 1150 560';
  const tipPt = usePathPoint(d, 0.999);
  return (
    <AbsoluteFill>
      <Svg>
        <Medallion t={t} at={0.4} cx={600} cy={560} r={160} ar="الخلوتية" arSize={62} tone={C.green} />
        <Medallion t={t} at={1.8} cx={1320} cy={560} r={160} ar="الرحمانية" arSize={62} tone={C.gold} glow={prog(t, 3, 1)} />
        <Thread d={d} p={link} color={C.terra} width={3} needle />
        <path
          d="M-16 -9 L0 0 L-16 9"
          fill="none"
          stroke={C.terra}
          strokeWidth={3}
          strokeLinecap="round"
          transform={`translate(${tipPt.x} ${tipPt.y}) rotate(${tipPt.angle})`}
          opacity={prog(t, 2.9, 0.3)}
        />
      </Svg>
      <Box x={960} y={70} w={1700} center>
        <Kicker t={t} at={0.2} center>
          La voie
        </Kicker>
        <div style={{...serif(86), marginTop: 18}}>
          <Words t={t} at={0.4} text="Fondateur de la Rahmania en Algérie" stagger={0.07} />
        </div>
      </Box>
      <Box x={960} y={438} w={420} center>
        <Rv t={t} at={2.6} style={sans(19, C.terra, 600)}>
          transmise par Sidi M’hamed
        </Rv>
      </Box>
      <Box x={600} y={750} w={520} center>
        <Rv t={t} at={1.0}>
          <div style={serif(56, 700)}>Khalwatia</div>
          <div style={{...sans(19, C.green, 600), letterSpacing: '0.2em', marginTop: 4}}>ÉGYPTE</div>
        </Rv>
      </Box>
      <Box x={1320} y={750} w={520} center>
        <Rv t={t} at={2.4}>
          <div style={serif(56, 700)}>Rahmania</div>
          <div style={{...sans(19, C.goldDark, 600), letterSpacing: '0.2em', marginTop: 4}}>ALGÉRIE</div>
        </Rv>
      </Box>
      <Box x={960} y={900} w={1500} center>
        <Rv t={t} at={3.4} style={italic(42)}>
          La Rahmania est issue de la Khalwatia, la voie qu’il avait reçue en Égypte.
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- The first disciple ----------
export const Disciple: React.FC<SceneProps> = ({t}) => {
  const d = 'M660 430 C 860 330, 1060 530, 1260 430';
  const link = prog(t, 1.2, 1.8, eInOut);
  const flow = [0, 1, 2, 3].map((i) => ((t * 0.32 + i / 4) % 1));
  return (
    <AbsoluteFill>
      <Svg>
        <Medallion t={t} at={0.3} cx={520} cy={430} r={124} ar="سيدي امحمد" arSize={46} tone={C.green} />
        <Medallion t={t} at={1.6} cx={1400} cy={430} r={124} ar="باش تارزي" arSize={46} tone={C.terra} glow={prog(t, 2.8, 0.8)} />
        <Thread d={d} p={link} color={C.gold} width={3} needle />
        {t > 3.2
          ? flow.map((u, i) => <FlowDot key={i} d={d} u={u} opacity={prog(t, 3.2, 0.6) * Math.sin(Math.PI * u)} />)
          : null}
      </Svg>
      <Box x={960} y={64} w={1400} center>
        <Kicker t={t} at={0.1} center>
          Premier disciple
        </Kicker>
        <div style={{...serif(92), marginTop: 14}}>
          <Words t={t} at={0.3} text="Son premier élève" />
        </div>
      </Box>
      <Box x={520} y={580} w={600} center>
        <Rv t={t} at={0.9}>
          <div style={serif(40, 700)}>Sidi M’hamed Ben Abderrahmane</div>
          <div style={{...sans(18, C.green, 600), letterSpacing: '0.2em', marginTop: 6}}>LE MAÎTRE</div>
        </Rv>
      </Box>
      <Box x={1400} y={580} w={640} center>
        <Rv t={t} at={2.4}>
          <div style={serif(40, 700)}>Cheikh Abderrahmane Bachtarzi</div>
          <div style={{...sans(18, C.terra, 600), letterSpacing: '0.2em', marginTop: 6}}>SON PREMIER ÉLÈVE</div>
        </Rv>
      </Box>
      <Box x={960} y={740} w={1000} center>
        <Rv t={t} at={3.6} y={30}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 40,
              padding: '26px 48px',
              background: 'rgba(247,241,228,0.85)',
              border: `1.5px solid ${C.gold}`,
              borderRadius: 6,
              boxShadow: '0 18px 40px -24px rgba(60,40,10,0.45)',
            }}
          >
            <div style={{textAlign: 'left'}}>
              <div style={sans(17, C.goldDark, 600)}>L’AUTEUR DE</div>
              <div style={{...serif(50, 700), marginTop: 4}}>la Mandhouma Rahmania</div>
              <div style={{...italic(30), marginTop: 6}}>le texte que nous étudions aujourd’hui</div>
            </div>
            <Ar size={64} ruqaa>
              المنظومة الرحمانية
            </Ar>
          </div>
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

const FlowDot: React.FC<{d: string; u: number; opacity: number}> = ({d, u, opacity}) => {
  const pt = usePathPoint(d, u);
  return <circle cx={pt.x} cy={pt.y} r={6} fill={C.goldHi} opacity={opacity} />;
};

