import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {eInOut, lerp, prog, rng, star8} from '../anim';
import {Box, SceneProps, Svg} from '../components/Layout';
import {Medallion, VerseBars} from '../components/Ornaments';
import {Ar, italic, Kicker, Rv, sans, serif, Words} from '../components/Text';
import {Thread} from '../components/Thread';
import {AR, C} from '../theme';
import TL from '../timeline.json';

// ---------- From receiver to author ----------
const MX = 1380, MY = 220;
const STUDENTS = Array.from({length: 11}, (_, i) => {
  const u = i / 10 - 0.5;
  return [MX + u * 760, 560 - 110 * (2 * u) * (2 * u)] as [number, number];
});
const ME = 5;
const READERS = Array.from({length: 7}, (_, i) => {
  const u = i / 6 - 0.5;
  return [MX + u * 620, 880 - 40 * Math.cos(u * Math.PI)] as [number, number];
});

const Particles: React.FC<{a: [number, number]; b: [number, number]; t: number; speed: number; n: number; opacity: number; color: string; r?: number}> = ({
  a,
  b,
  t,
  speed,
  n,
  opacity,
  color,
  r = 4,
}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const u = (t * speed + i / n) % 1;
      return <circle key={i} cx={lerp(a[0], b[0], u)} cy={lerp(a[1], b[1], u)} r={r} fill={color} opacity={opacity * Math.sin(Math.PI * u)} />;
    })}
  </>
);

export const Writer: React.FC<SceneProps> = ({t}) => {
  const phaseB = prog(t, 4.4, 1.2);
  const me = STUDENTS[ME];
  return (
    <AbsoluteFill>
      <Svg>
        {STUDENTS.map((s, i) => (
          <g key={i}>
            <Thread d={`M${MX} ${MY + 56} L${s[0]} ${s[1]}`} p={prog(t, 0.7 + i * 0.05, 1.2)} color={C.inkSoft} width={1.2} opacity={0.35} />
            <Particles a={[MX, MY + 56]} b={s} t={t + i * 0.13} speed={0.45} n={3} opacity={prog(t, 1.4, 0.8) * (1 - 0.7 * phaseB)} color={C.gold} />
          </g>
        ))}
        {READERS.map((r, i) => (
          <g key={i}>
            <Thread d={`M${me[0]} ${me[1]} L${r[0]} ${r[1] - 22}`} p={prog(t, 5.0 + i * 0.08, 1.0)} color={C.terra} width={1.6} opacity={0.6} />
            <Particles a={me} b={[r[0], r[1] - 22]} t={t + i * 0.21} speed={0.5} n={3} opacity={prog(t, 5.6, 0.8)} color={C.terra} r={4.5} />
            <g opacity={prog(t, 5.6 + i * 0.08, 0.6)} transform={`translate(${r[0]} ${r[1]})`}>
              <rect x={-17} y={-22} width={34} height={44} rx={2} fill={C.paperHi} stroke={C.terra} strokeWidth={1.6} />
              {[0, 1, 2, 3].map((j) => (
                <rect key={j} x={-10} y={-13 + j * 8} width={j % 2 ? 14 : 20} height={2.4} fill={C.inkSoft} opacity={0.7} />
              ))}
            </g>
          </g>
        ))}
        {STUDENTS.map((s, i) => {
          const k = prog(t, 1.0 + i * 0.05, 0.5);
          if (i === ME) {
            const r = lerp(11, 26, phaseB);
            return (
              <g key={i}>
                <circle cx={s[0]} cy={s[1]} r={r + 16 * phaseB} fill={C.terra} opacity={0.15 * phaseB} />
                <circle cx={s[0]} cy={s[1]} r={r * k} fill={phaseB > 0 ? C.terra : C.ink} />
                <path d={star8(s[0], s[1], r * 0.55)} fill={C.paperHi} opacity={phaseB} />
              </g>
            );
          }
          return <circle key={i} cx={s[0]} cy={s[1]} r={11 * k} fill={C.ink} opacity={1 - 0.6 * phaseB} />;
        })}
        <Medallion t={t} at={0.1} cx={MX} cy={MY} r={58} ar="الشيخ" arSize={34} tone={C.green} />
      </Svg>
      <Box x={MX + 90} y={MY - 22} w={300}>
        <Rv t={t} at={0.6} style={{...sans(17, C.green, 600), letterSpacing: '0.18em'}}>
          LE MAÎTRE
        </Rv>
      </Box>
      <Box x={me[0]} y={me[1] + 38} w={360} center>
        <Rv t={t} at={4.8}>
          <span style={{...serif(34, 700, C.terra), background: C.paper, padding: '2px 14px', borderRadius: 20}}>Bachtarzi</span>
        </Rv>
      </Box>
      <Box x={1650} y={590} w={300} center style={{opacity: 1 - phaseB}}>
        <Rv t={t} at={1.6} style={{...sans(17, C.muted, 600), letterSpacing: '0.16em'}}>
          LES ÉLÈVES REÇOIVENT
        </Rv>
      </Box>
      <Box x={MX} y={930} w={600} center>
        <Rv t={t} at={6.0} style={{...sans(17, C.terra, 600), letterSpacing: '0.16em'}}>
          IL ÉCRIT, ET TRANSMET À SON TOUR
        </Rv>
      </Box>
      <Box x={140} y={210} w={860}>
        <Kicker t={t} at={0.2}>Le plus important</Kicker>
        <div style={{...serif(92), marginTop: 22}}>
          <Words t={t} at={0.5} text="Son élève le plus important." stagger={0.08} />
        </div>
        <Rv t={t} at={2.0} style={{...serif(92, 600, C.terra), marginTop: 8}}>
          Pourquoi&nbsp;?
        </Rv>
        <div style={{...serif(64, 600), marginTop: 40}}>
          <Words t={t} at={4.4} text="Parce qu’il s’est mis à écrire." stagger={0.08} />
        </div>
        <Rv t={t} at={7.4} style={{...italic(46), marginTop: 40, borderLeft: `3px solid ${C.gold}`, paddingLeft: 26}}>
          «&nbsp;Il n’était plus juste une personne qui reçoit.&nbsp;»
        </Rv>
        <Rv t={t} at={9.0} style={{...sans(26, C.inkSoft), marginTop: 22, paddingLeft: 29}}>
          Il devient un <b style={{color: C.terra}}>auteur</b> de la Tariqa Rahmania.
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Lessons rewritten as verse ----------
const PX0 = 170, PX1 = 1130, PY = 300, PW = 620, PH = 600;
const LINE_Y = (i: number) => PY + 150 + i * 70;
const HW = 225, GAP = 56;

export const Verse: React.FC<SceneProps> = ({t}) => {
  const pieces = useMemo(() => {
    const r = rng(5);
    const out: {i: number; side: number; x0: number; w0: number}[] = [];
    for (let i = 0; i < 6; i++) {
      const total = i === 5 ? 340 : 500 + r() * 30;
      const xr = PX0 + 60 + (520 - total); // prose is right-aligned (Arabic)
      const split = total * (0.42 + r() * 0.16);
      // right part = first words of the line → first hemistich (right side)
      out.push({i, side: 0, x0: xr + total - split, w0: split});
      out.push({i, side: 1, x0: xr, w0: total - split - 8});
    }
    return out;
  }, []);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <filter id="page-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#3C280A" floodOpacity="0.22" />
          </filter>
        </defs>
        {[PX0, PX1].map((x, j) => (
          <rect key={x} x={x} y={PY} width={PW} height={PH} rx={4} fill={C.paperHi} stroke={C.gold} strokeOpacity={0.5} filter="url(#page-shadow)" opacity={prog(t, 0.3 + j * 0.3, 0.8)} />
        ))}
        {/* ghost lines left behind on the prose page */}
        {pieces.map((p, n) => (
          <rect key={n} x={p.x0} y={LINE_Y(p.i)} width={p.w0} height={9} rx={4.5} fill={C.muted} opacity={0.14 * prog(t, 0.8, 0.6)} />
        ))}
        <Thread d={`M${PX0 + PW + 14} 600 Q960 430 ${PX1 - 14} 600`} p={prog(t, 1.6, 1.2, eInOut)} color={C.gold} width={2.4} dash={[12, 8]} needle />
        {pieces.map((p, n) => {
          const at = 2.6 + p.i * 0.32 + p.side * 0.12;
          const k = prog(t, at, 1.3, eInOut);
          const appear = prog(t, 0.9 + p.i * 0.08, 0.5);
          const x1 = p.side === 0 ? PX1 + 60 + HW + GAP : PX1 + 60;
          const x = lerp(p.x0, x1, k);
          const w = lerp(p.w0, HW, k);
          const y = LINE_Y(p.i) - Math.sin(Math.PI * k) * (90 + p.i * 6);
          const col = k < 0.5 ? C.muted : C.ink;
          const dot = prog(t, at + 1.2, 0.4);
          return (
            <g key={n} opacity={appear}>
              <rect x={x} y={y} width={w} height={9} rx={4.5} fill={col} />
              <circle cx={x1 - 14} cy={LINE_Y(p.i) + 4.5} r={6 * dot} fill={C.gold} />
            </g>
          );
        })}
        <g opacity={prog(t, 8.4, 0.8)}>
          <path d={`M${PX1 + 60 + HW + GAP} ${LINE_Y(0) - 16} L${PX1 + 60 + HW + GAP + HW} ${LINE_Y(0) - 16}`} stroke={C.goldDark} strokeWidth={1.2} />
          <path d={`M${PX1 + 60} ${LINE_Y(0) - 16} L${PX1 + 60 + HW} ${LINE_Y(0) - 16}`} stroke={C.goldDark} strokeWidth={1.2} />
        </g>
      </Svg>
      <Box x={PX0 + 40} y={PY + 40} w={PW - 80}>
        <Rv t={t} at={0.6} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{...sans(18, C.goldDark, 600), letterSpacing: '0.18em'}}>LES COURS DU CHEIKH</span>
          <Ar size={34}>دروس</Ar>
        </Rv>
      </Box>
      <Box x={PX1 + 40} y={PY + 40} w={PW - 80}>
        <Rv t={t} at={0.9} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{...sans(18, C.goldDark, 600), letterSpacing: '0.18em'}}>QASÂ’ID · POÈMES</span>
          <Ar size={34}>قصائد</Ar>
        </Rv>
      </Box>
      <Box x={PX1 + 60} y={LINE_Y(0) - 50} w={HW * 2 + GAP}>
        <Rv t={t} at={8.4} style={{display: 'flex', justifyContent: 'space-between', ...sans(15, C.goldDark, 600), letterSpacing: '0.08em'}}>
          <span>2ᵉ HÉMISTICHE · <span style={{fontFamily: AR, fontSize: 20}}>عجز</span></span>
          <span>1ᵉʳ HÉMISTICHE · <span style={{fontFamily: AR, fontSize: 20}}>صدر</span></span>
        </Rv>
      </Box>
      <Box x={960} y={60} w={1600} center>
        <Kicker t={t} at={0.1} center>
          De la leçon au poème
        </Kicker>
        <div style={{...serif(84), marginTop: 16}}>
          <Words t={t} at={0.3} text="Ses leçons, réécrites en vers" stagger={0.08} />
        </div>
      </Box>
      <Box x={960} y={470} w={300} center>
        <Rv t={t} at={2.0} style={italic(32, C.goldDark)}>
          réécrire
        </Rv>
      </Box>
      <Box x={960} y={940} w={1600} center>
        <Rv t={t} at={6.6} style={sans(27, C.inkSoft)}>
          Les cours reçus de Sidi M’hamed Ben Abderrahmane deviennent des <b style={{color: C.ink}}>qasâ’id</b> : des vers mesurés et rimés.
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Why poetry: the beat of the metre ----------
const M = TL.meter;
const ONSETS = (() => {
  const out: number[] = [];
  let x = 0;
  for (const u of M.pattern) {
    out.push(x);
    x += u * M.unit;
  }
  return {times: out, len: x};
})();
const GX = (i: number) => 337 + i * 105 + Math.floor(i / 4) * 45 + 26;

export const Memory: React.FC<SceneProps> = ({t}) => {
  const passes = Array.from({length: M.repeat}, (_, r) => M.offset + r * (ONSETS.len + M.gap));
  const rowIn = prog(t, 1.9, 0.8);
  // playhead position along the row
  let head = -1;
  for (const p0 of passes) {
    ONSETS.times.forEach((o, i) => {
      if (t >= p0 + o) head = i;
    });
  }
  return (
    <AbsoluteFill>
      <Svg>
        {M.pattern.map((u, i) => {
          const x = GX(i);
          let flash = 0;
          let lit = 0;
          passes.forEach((p0) => {
            const tt = p0 + ONSETS.times[i];
            if (t >= tt) {
              flash = Math.max(flash, Math.exp(-(t - tt) * 5));
              lit = 1;
            }
          });
          const s = 1 + 0.35 * flash;
          const col = flash > 0.3 ? C.terra : C.ink;
          const op = (0.3 + 0.7 * lit) * rowIn;
          return (
            <g key={i} transform={`translate(${x} 560) scale(${s})`} opacity={op}>
              {u === 2 ? (
                <rect x={-36} y={-6} width={72} height={12} rx={6} fill={col} />
              ) : (
                <path d="M-20 -14 Q-20 12 0 12 Q20 12 20 -14" fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" />
              )}
              {flash > 0.02 ? <circle r={30 + (1 - flash) * 40} fill="none" stroke={C.terra} strokeWidth={2} opacity={flash * 0.6} /> : null}
            </g>
          );
        })}
        {[0, 1].map((j) => (
          <path key={j} d={`M${(GX(3 + j * 4) + GX(4 + j * 4)) / 2} 520 L${(GX(3 + j * 4) + GX(4 + j * 4)) / 2} 600`} stroke={C.gold} strokeWidth={1.5} opacity={rowIn * 0.7} />
        ))}
        {head >= 0 ? (
          <path d={`M${GX(0) - 40} 612 L${GX(head) + 10} 612`} stroke={C.gold} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
        ) : null}
      </Svg>
      {[0, 1, 2].map((f) => {
        const cx = (GX(f * 4) + GX(f * 4 + 3)) / 2;
        return (
          <React.Fragment key={f}>
            <Box x={cx} y={430} w={300} center>
              <Rv t={t} at={2.0 + f * 0.15}>
                <Ar size={46}>مستفعلن</Ar>
              </Rv>
            </Box>
            <Box x={cx} y={636} w={300} center>
              <Rv t={t} at={2.1 + f * 0.15} style={{...sans(20, C.muted, 500), letterSpacing: '0.12em'}}>
                mus · taf · ʿi · lun
              </Rv>
            </Box>
          </React.Fragment>
        );
      })}
      <Box x={960} y={120} w={1600} center>
        <div style={serif(96)}>
          <Words t={t} at={0.2} text={'Pourquoi la poésie\u00A0?'} />
        </div>
        <Rv t={t} at={1.1} style={{...italic(60, C.terra), marginTop: 12}}>
          Parce qu’elle se retient facilement.
        </Rv>
      </Box>
      <Box x={960} y={730} w={1600} center>
        <Rv t={t} at={4.6} style={sans(30, C.ink, 500)}>
          Le rythme et la rime portent les mots : c’est ainsi que les Arabes enseignaient.
        </Rv>
        <Rv t={t} at={7.4} style={{...italic(42, C.inkSoft), marginTop: 18}}>
          Et on l’apprenait aux enfants, dès le plus jeune âge.
        </Rv>
      </Box>
      <Box x={960} y={950} w={1600} center>
        <Rv t={t} at={8.6} style={sans(19, C.muted)}>
          Exemple : le <i>rajaz</i> (mustafʿilun × 3), mètre classique des poèmes d’enseignement.
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

// ---------- Every science, in verse ----------
const SCIENCES = [
  {ar: 'الفقه', fr: 'Fiqh', gloss: 'la jurisprudence'},
  {ar: 'الحديث', fr: 'Hadith', gloss: 'les paroles du Prophète ﷺ'},
  {ar: 'السيرة', fr: 'Sîra', gloss: 'la vie du Prophète ﷺ'},
  {ar: 'السنة', fr: 'Sunna', gloss: 'la tradition prophétique'},
  {ar: 'القواعد', fr: 'Qawâʿid', gloss: 'les règles'},
];
const CW = 300, CG = 40, CX0 = (1920 - (5 * CW + 4 * CG)) / 2, CY = 330, CH = 400;

const Glossed: React.FC<{text: string}> = ({text}) => {
  const parts = text.split('ﷺ');
  return parts.length === 1 ? (
    <>{text}</>
  ) : (
    <>
      {parts[0]}
      <span style={{fontFamily: AR, fontSize: '1.15em'}}>ﷺ</span>
      {parts[1]}
    </>
  );
};

export const Sciences: React.FC<SceneProps> = ({t}) => (
  <AbsoluteFill>
    <Svg>
      <defs>
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#3C280A" floodOpacity="0.2" />
        </filter>
      </defs>
      {SCIENCES.map((s, i) => {
        const k = prog(t, 1.0 + i * 0.32, 0.9);
        const x = CX0 + i * (CW + CG);
        return (
          <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * -40})`}>
            <rect x={x} y={CY} width={CW} height={CH} rx={6} fill={C.paperHi} stroke={C.gold} strokeOpacity={0.6} strokeWidth={1.5} filter="url(#card-shadow)" />
            <path d={star8(x + CW / 2, CY, 16)} fill={C.paperHi} stroke={C.gold} strokeWidth={1.5} />
            {[0, 1, 2].map((j) => (
              <VerseBars key={j} x={x + 56} y={CY + 296 + j * 26} w={CW - 100} h={6} gap={22} color={C.inkSoft} k={prog(t, 2.2 + i * 0.32 + j * 0.12, 0.6)} />
            ))}
          </g>
        );
      })}
      <Thread d={`M${CX0 - 30} ${CY + CH + 70} L${1920 - CX0 + 30} ${CY + CH + 70}`} p={prog(t, 1.0, 3.2, eInOut)} color={C.gold} width={3} dash={[16, 10]} needle />
    </Svg>
    {SCIENCES.map((s, i) => {
      const x = CX0 + i * (CW + CG);
      return (
        <Box key={i} x={x + CW / 2} y={CY + 50} w={CW} center>
          <Rv t={t} at={1.2 + i * 0.32} y={0} blur={0}>
            <Ar size={68} color={C.ink}>
              {s.ar}
            </Ar>
            <div style={{...serif(48, 700), marginTop: 6}}>{s.fr}</div>
            <div style={{...sans(19, C.muted), marginTop: 8, padding: '0 18px'}}>
              <Glossed text={s.gloss} />
            </div>
          </Rv>
        </Box>
      );
    })}
    <Box x={960} y={70} w={1700} center>
      <Kicker t={t} at={0.1} center>
        La méthode des anciens
      </Kicker>
      <div style={{...serif(82), marginTop: 16}}>
        <Words t={t} at={0.3} text="Dans tous les domaines, on apprenait en vers" stagger={0.06} />
      </div>
    </Box>
    <Box x={960} y={CY + CH + 110} w={1600} center>
      <Rv t={t} at={4.4} style={italic(42)}>
        Des textes mis en vers, pour être appris par cœur dès l’enfance.
      </Rv>
    </Box>
  </AbsoluteFill>
);

// ---------- The Mandhouma: same method, to keep the Tariqa ----------
export const Manuscript: React.FC<SceneProps> = ({t}) => {
  const open = prog(t, 0.3, 1.4, eInOut);
  const frame = prog(t, 1.0, 1.8, eInOut);
  const L = 'M960 300 Q700 268 400 296 L400 904 Q700 876 960 906 Z';
  const R = 'M960 300 Q1220 268 1520 296 L1520 904 Q1220 876 960 906 Z';
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="spineL" x1="0" x2="1">
            <stop offset="0.82" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#3C280A" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="spineR" x1="1" x2="0">
            <stop offset="0.82" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#3C280A" stopOpacity="0.18" />
          </linearGradient>
          <filter id="book-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#3C280A" floodOpacity="0.28" />
          </filter>
        </defs>
        <g opacity={open} transform={`translate(960 600) scale(${lerp(0.92, 1, open)}) translate(-960 -600)`}>
          <path d="M392 300 L1528 300 L1528 916 L392 916 Z" fill={C.wine} opacity={0.9} filter="url(#book-shadow)" transform="translate(0 4)" />
          <path d={L} fill={C.paperHi} />
          <path d={R} fill={C.paperHi} />
          <path d={L} fill="url(#spineL)" />
          <path d={R} fill="url(#spineR)" />
          <Thread d="M1000 340 L1480 340 L1480 860 L1000 860 Z" p={frame} color={C.gold} width={3} />
          <Thread d="M1012 352 L1468 352 L1468 848 L1012 848 Z" p={frame} color={C.gold} width={1.2} />
          <path d="M1060 380 L1420 380 Q1440 430 1420 480 L1060 480 Q1040 430 1060 380 Z" fill="none" stroke={C.gold} strokeWidth={1.6} opacity={prog(t, 1.8, 0.8)} />
          {[1040, 1440].map((x) => (
            <path key={x} d={star8(x, 430, 12)} fill={C.gold} opacity={prog(t, 2.2, 0.6)} />
          ))}
          {[0, 1, 2, 3, 4].map((j) => (
            <VerseBars key={j} x={1066} y={540 + j * 58} w={360} h={7} gap={30} color={C.ink} k={prog(t, 2.6 + j * 0.15, 0.6)} />
          ))}
          {Array.from({length: 8}, (_, j) => (
            <VerseBars key={j} x={470} y={360 + j * 62} w={420} h={7} gap={34} color={C.ink} k={prog(t, 3.2 + j * 0.12, 0.6)} />
          ))}
          <path d="M960 300 L960 906" stroke="#3C280A" strokeOpacity={0.25} strokeWidth={1.5} />
        </g>
        <Thread d="M372 560 L460 560" p={prog(t, 5.0, 0.6)} color={C.terra} width={2} />
        <circle cx={460} cy={560} r={5} fill={C.terra} opacity={prog(t, 5.5, 0.3)} />
        <Thread d="M1548 700 L1440 700" p={prog(t, 5.8, 0.6)} color={C.terra} width={2} />
        <circle cx={1440} cy={700} r={5} fill={C.terra} opacity={prog(t, 6.3, 0.3)} />
      </Svg>
      <Box x={1240} y={386} w={480} center>
        <Rv t={t} at={2.0} y={10}>
          <Ar size={54} ruqaa color={C.goldDark}>
            المنظومة الرحمانية
          </Ar>
        </Rv>
      </Box>
      <Box x={70} y={505} w={290} style={{textAlign: 'right'}}>
        <Rv t={t} at={5.0} x={-20} y={0}>
          <div style={serif(38, 700)}>les règles de la voie</div>
          <div style={{...sans(18, C.terra, 600), marginTop: 6, letterSpacing: '0.1em'}}>LA TARIQA RAHMANIA</div>
        </Rv>
      </Box>
      <Box x={1560} y={645} w={320}>
        <Rv t={t} at={5.8} x={20} y={0}>
          <div style={serif(38, 700)}>l’enseignement de son cheikh</div>
          <div style={{...sans(18, C.terra, 600), marginTop: 6, letterSpacing: '0.1em'}}>SIDI M’HAMED</div>
        </Rv>
      </Box>
      <Box x={960} y={60} w={1700} center>
        <Kicker t={t} at={0.1} center>
          Préserver la Tariqa
        </Kicker>
        <div style={{...serif(76), marginTop: 14}}>
          <Words t={t} at={0.3} text="La même méthode, pour garder la voie" stagger={0.07} />
        </div>
      </Box>
      <Box x={960} y={950} w={1600} center>
        <Rv t={t} at={6.6} style={italic(36)}>
          Des poèmes où l’on retrouve les règles, et ce qu’il a appris de son cheikh.
        </Rv>
      </Box>
    </AbsoluteFill>
  );
};

