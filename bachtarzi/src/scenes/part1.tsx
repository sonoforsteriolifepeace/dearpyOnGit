import React from 'react';
import { C, FONT, H, W } from '../theme';
import { cue } from '../script';
import { clamp, eb, eio, eo, kf, p, useT, win } from '../anim';
import {
  Ar, FadeIn, Label, Pin, Plaque, Rise, Scene, Serif, StarOrn, SvgLayer, Thread, TimedThread, circlePath, star8Path,
} from '../kit';
import { Medal, Scroll, qubbaPath } from '../shapes';
import { countries, graticuleD, place, projection } from '../map';

export const T1 = {
  name: cue(1, 'Abderrahmane Bachtarzi'),
  mandhouma: cue(1, 'Mandhouma Rahmania'),
  master: cue(1, 'Sidi Mhamed Ben Abderrahmane'),
  kabyle: cue(1, 'Kabyle'),
  egypte: cue(1, 'étudier en Égypte'),
  azhar: cue(1, 'Al-Azhar'),
  azhar2: cue(1, "D'Al-Azhar"),
  soudan: cue(1, 'au Soudan'),
  retour: cue(1, 'du Soudan'),
  azhar3: cue(1, 'revenu à Al-Azhar'),
  algerie: cue(1, 'en Algérie'),
  bou: cue(1, 'Bou Qabrine'),
  tombs: cue(1, 'deux tombeaux'),
  belcourt: cue(1, 'Belcourt'),
  founder: cue(1, 'fondateur de la confrérie Rahmania'),
  khalwatia: cue(1, 'la Khalwatia en Égypte'),
  student: cue(1, 'son premier élève'),
  studentName: cue(1, "c'était le cheikh Abderrahmane Bachtarzi"),
  scroll: cue(1, 'cette Mandhouma'),
  now: cue(1, 'en ce moment'),
  important: cue(2, 'élève le plus important'),
};

// ================================================================== 1. TITRE
export const SceneTitle: React.FC = () => {
  const t = useT();
  const cx = 1500, cy = 540;
  const rot = t * 1.1;
  const arK = p(t, T1.mandhouma, 1.0, eo);
  return (
    <Scene a={0} b={13.0} fadeIn={1.4} fadeOut={0.8}>
      <SvgLayer>
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          <StarOrn cx={cx} cy={cy} r={300} at={0.5} dur={3.4} />
          <StarOrn cx={cx} cy={cy} r={300} rot={Math.PI / 8} at={1.1} dur={3.4} color={C.goldDeep} width={2.4} />
          <TimedThread d={circlePath(cx, cy, 352)} at={1.4} dur={3.6} dash={[3, 13]} width={5} needle={false} color={C.creamSoft} />
        </g>
        <g transform={`rotate(${-rot * 0.7} ${cx} ${cy})`}>
          <StarOrn cx={cx} cy={cy} r={200} at={2.0} dur={3.0} width={2.4} color={C.creamSoft} />
        </g>
        <circle cx={cx} cy={cy} r={214} fill="rgba(5,12,12,0.55)" opacity={arK} />
      </SvgLayer>
      <div style={{ position: 'absolute', left: cx - 215, top: cy - 112, width: 430, textAlign: 'center', opacity: arK, transform: `translateY(${(1 - arK) * 18}px)` }}>
        <Ar size={96} color={C.cream} style={{ display: 'block', lineHeight: 1.18 }}>المنظومة</Ar>
        <Ar size={96} color={C.gold} style={{ display: 'block', lineHeight: 1.18 }}>الرحمانية</Ar>
      </div>
      <div style={{ position: 'absolute', left: cx - 215, top: cy + 108, width: 430, textAlign: 'center', opacity: arK }}>
        <Label size={22} color={C.creamDim} ls="0.22em" style={{ textAlign: 'center' }}>La Mandhouma Rahmania</Label>
      </div>
      <div style={{ position: 'absolute', left: 130, top: 238 }}>
        <FadeIn at={0.6}><Label style={{ marginBottom: 26 }}>Portrait · Tariqa Rahmania</Label></FadeIn>
        <Rise at={0.95}><Serif size={72} italic weight={500} color={C.creamDim}>Cheikh</Serif></Rise>
        <Rise at={1.25}><Serif size={168} weight={700}>Abderrahmane</Serif></Rise>
        <Rise at={1.55}><Serif size={168} weight={700}>Bachtarzi</Serif></Rise>
        <Rise at={T1.name + 0.1} style={{ marginTop: 34 }}>
          <Serif size={56} italic weight={500} color={C.gold}>Le tailleur qui mit la voie en vers</Serif>
        </Rise>
      </div>
    </Scene>
  );
};

// ================================================================== 2. LE VOYAGE
const mid = (u: number[], v: number[]) => [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];

export const SceneJourney: React.FC = () => {
  const t = useT();
  const A = 12.5, B = 32.8;
  const { kabylie: kab, caire: cai, soudan: sou, alger: alg } = place;
  const cs = mid(cai, sou), cm = mid(cai, alg);
  // caméra : [temps, S, centre-x, centre-y] (centre choisi pour poser la cible à (sx, sy) à l'écran)
  const at = (pt: number[], S: number, sx = 960, sy = 540) => [S, pt[0] - (sx - 960) / S, pt[1] - (sy - 540) / S];
  const [S, cx, cy] = kf(t, [
    [A, 1, 960, 560],
    [15.7, ...at(kab, 2.5, 1180, 620)],
    [T1.egypte - 0.2, ...at(kab, 2.5, 1180, 620)],
    [T1.azhar + 0.9, ...at(cs, 1.42, 1010, 580)],
    [T1.azhar3 + 1.6, ...at(cs, 1.42, 1010, 580)],
    [30.3, ...at(cm, 1.18, 960, 520)],
    [B, ...at(alg, 2.3, 1100, 580)],
  ]);
  const sc = (pt: number[]): [number, number] => [960 + (pt[0] - cx) * S, 540 + (pt[1] - cy) * S];
  const legs = [
    { f: kab, to: cai, q: [-70, -120], a: T1.egypte - 0.2, b: T1.azhar + 1.5 },
    { f: cai, to: sou, q: [70, 0], a: T1.azhar2 + 0.35, b: T1.retour - 0.1 },
    { f: sou, to: cai, q: [-70, 0], a: T1.retour + 0.05, b: T1.azhar3 + 1.2 },
    { f: cai, to: alg, q: [0, 140], a: T1.algerie - 1.3, b: T1.algerie + 2.2 },
  ];
  const legPath = (l: typeof legs[number]) => {
    const [x0, y0] = sc(l.f), [x1, y1] = sc(l.to);
    const [qx, qy] = sc([(l.f[0] + l.to[0]) / 2 + l.q[0], (l.f[1] + l.to[1]) / 2 + l.q[1]]);
    return `M${x0} ${y0}Q${qx} ${qy} ${x1} ${y1}`;
  };
  const keyOp: Record<string, number> = {
    Algeria: p(t, A + 1.5, 1.4),
    Egypt: p(t, T1.egypte - 0.6, 1.2),
    Sudan: p(t, T1.soudan - 0.6, 1.2),
  };
  const name = (txt: string, lon: number, lat: number, k: number) => {
    const [x, y] = sc(projection([lon, lat]) as number[]);
    return (
      <text x={x} y={y} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={40} letterSpacing={16}
        fill={C.cream} opacity={0.2 * k}>{txt}</text>
    );
  };
  const kS = sc(kab), cS = sc(cai), sS = sc(sou), aS = sc(alg);
  const badge = (n: string, x: number, y: number, at0: number) => {
    const k = p(t, at0, 0.5, eb);
    return k > 0 ? (
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <circle r={19} fill={C.gold} />
        <text y={7} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={21} fill="#0B1E1B">{n}</text>
      </g>
    ) : null;
  };
  const place_label = (x: number, y: number, at0: number, fr: string, ar: string, sub?: string, side: 'r' | 'l' = 'r', until = 1e9) => {
    const k = p(t, at0, 0.8, eo) * (1 - p(t, until, 0.7));
    if (k <= 0) return null;
    return (
      <div style={{
        position: 'absolute', top: y - 46, opacity: k, textAlign: side === 'r' ? 'left' : 'right',
        ...(side === 'r' ? { left: x + 40 } : { right: W - x + 40 }), transform: `translateY(${(1 - k) * 12}px)`,
      }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', flexDirection: side === 'r' ? 'row' : 'row-reverse' }}>
          <Serif size={50} weight={700}>{fr}</Serif>
          <Ar size={46} color={C.gold}>{ar}</Ar>
        </div>
        {sub && <Label size={22} color={C.creamDim} ls="0.2em" style={{ marginTop: 4 }}>{sub}</Label>}
      </div>
    );
  };
  const steps = [
    { n: '1', txt: 'Étudier à Al-Azhar, en Égypte', at: legs[0].a },
    { n: '2', txt: 'Le Soudan', at: legs[1].a },
    { n: '3', txt: 'Retour à Al-Azhar', at: legs[2].a },
    { n: '4', txt: 'Puis l’Algérie', at: legs[3].a },
  ];
  return (
    <Scene a={A} b={B} fadeIn={1.0} fadeOut={0.7}>
      <SvgLayer>
        <g transform={`translate(960 540) scale(${S}) translate(${-cx} ${-cy})`}>
          <path d={graticuleD} fill="none" stroke={C.cream} strokeOpacity={0.06} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          {countries.map(c => {
            const k = c.key ? keyOp[c.name] : 0;
            return (
              <path key={c.name} d={c.d} vectorEffect="non-scaling-stroke" strokeLinejoin="round"
                fill={c.key ? `rgba(230,182,90,${0.07 + 0.13 * k})` : 'rgba(243,233,209,0.085)'}
                stroke={c.key ? C.gold : C.cream} strokeOpacity={c.key ? 0.35 + 0.4 * k : 0.34} strokeWidth={c.key ? 2 : 1.2} />
            );
          })}
        </g>
        {name('ALGÉRIE', 2.6, 28.2, keyOp.Algeria)}
        {name('ÉGYPTE', 29.6, 26.6, keyOp.Egypt)}
        {name('SOUDAN', 29, 13.6, keyOp.Sudan)}
        {legs.map((l, i) => (
          <Thread key={i} d={legPath(l)} k={p(t, l.a, l.b - l.a, eio)} width={5} glow dash={[18, 11]} />
        ))}
        <Pin x={kS[0]} y={kS[1]} at={T1.kabyle - 0.3} />
        <Pin x={cS[0]} y={cS[1]} at={legs[0].b - 0.4} />
        <Pin x={sS[0]} y={sS[1]} at={legs[1].b - 0.4} />
        <Pin x={aS[0]} y={aS[1]} at={legs[3].b - 0.5} />
        {badge('1', cS[0] - 36, cS[1] + 6, legs[0].b - 0.1)}
        {badge('2', sS[0] - 36, sS[1] + 6, legs[1].b - 0.1)}
        {badge('3', cS[0] + 8, cS[1] + 44, legs[2].b - 0.1)}
        {badge('4', aS[0] - 36, aS[1] + 6, legs[3].b - 0.1)}
      </SvgLayer>
      {place_label(kS[0], kS[1] + 6, T1.kabyle, 'Kabyle', 'القبائل', 'Kabylie · Algérie', 'l', T1.egypte + 0.6)}
      {place_label(cS[0], cS[1] + 6, legs[0].b - 0.3, 'Al-Azhar', 'الأزهر', 'Le Caire · Égypte')}
      {place_label(sS[0], sS[1] + 6, legs[1].b - 0.3, 'Soudan', 'السودان')}
      {place_label(aS[0], aS[1] + 70, legs[3].b - 0.4, 'Algérie', 'الجزائر', 'Alger', 'l')}

      <div style={{ position: 'absolute', left: 110, top: 150 }}>
        <FadeIn at={T1.master - 0.4} dx={-40} dy={0}>
          <Plaque pad="22px 40px 24px">
            <Label size={22} ls="0.24em" style={{ marginBottom: 10 }}>Le maître</Label>
            <Serif size={44}>Sidi Mhamed Ben Abderrahmane</Serif>
            <div style={{ marginTop: 6 }}><Ar size={46} color={C.gold}>سيدي محمد بن عبد الرحمن</Ar></div>
          </Plaque>
        </FadeIn>
      </div>

      <div style={{ position: 'absolute', left: 110, bottom: 142 }}>
        <Plaque pad="20px 34px" style={{ minWidth: 470, opacity: win(t, T1.egypte - 0.5, B, 0.7, 0.7) }}>
          {steps.map(s => {
            const k = p(t, s.at - 0.2, 0.6, eo);
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 18, height: 44 * k, overflow: 'hidden', opacity: k, transform: `translateX(${(1 - k) * -18}px)` }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: C.gold, color: '#0B1E1B', fontFamily: FONT.sans, fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
                <div style={{ fontFamily: FONT.serif, fontSize: 32, fontWeight: 600, color: C.cream }}>{s.txt}</div>
              </div>
            );
          })}
        </Plaque>
      </div>
    </Scene>
  );
};

// ================================================================== 3. BOU QABRINE
export const SceneBouQabrine: React.FC = () => {
  const t = useT();
  const A = 32.2, B = 39.9;
  const base = 790;
  const cx1 = 1250, cx2 = 1590;
  const glow = (a: number) => p(t, a, 1.4, eo);
  return (
    <Scene a={A} b={B} fadeIn={0.9} fadeOut={0.7}>
      <SvgLayer>
        {[cx1, cx2].map((cx, i) => {
          const at = T1.tombs - 0.5 + i * 0.9;
          const g = glow(at + 2.2);
          return (
            <g key={i}>
              <path d={qubbaPath(cx, base, 1)} fill={`rgba(230,182,90,${0.1 * g})`} stroke="none" />
              <TimedThread d={qubbaPath(cx, base, 1)} at={at} dur={2.6} width={4} dash={null} needle={i === 0} />
              <path d={star8Path(cx, base - 232, 24 * g)} fill={C.gold} opacity={g} />
            </g>
          );
        })}
        <line x1={cx1 - 200} x2={cx2 + 200} y1={base + 18} y2={base + 18} stroke={C.gold} strokeOpacity={0.5 * p(t, T1.tombs - 0.5, 1.2)} strokeWidth={3} strokeDasharray="14 10" />
        <Pin x={cx1} y={base + 18} at={T1.belcourt} r={13} />
      </SvgLayer>
      <div style={{ position: 'absolute', left: 130, top: 250 }}>
        <FadeIn at={T1.bou - 0.5}><Label style={{ marginBottom: 16 }}>On l’appelle</Label></FadeIn>
        <Rise at={T1.bou - 0.3} d={1.1}><Ar size={250} color={C.gold} style={{ display: 'block', lineHeight: 1.3 }}>بوقبرين</Ar></Rise>
        <Rise at={T1.bou + 0.1} style={{ marginTop: 6 }}><Serif size={84} italic weight={600}>Bou Qabrine</Serif></Rise>
        <FadeIn at={T1.tombs - 0.3} style={{ marginTop: 22 }}>
          <Serif size={50} weight={500} color={C.creamDim}>l’homme aux <span style={{ color: C.gold }}>deux tombeaux</span></Serif>
        </FadeIn>
      </div>
      <div style={{ position: 'absolute', left: cx1 - 150, top: base + 42, width: 300, textAlign: 'center' }}>
        <FadeIn at={T1.belcourt} dy={14}>
          <Serif size={50} weight={700}>Belcourt</Serif>
          <Label size={22} color={C.creamDim} ls="0.18em">Alger · enterré ici</Label>
        </FadeIn>
      </div>
    </Scene>
  );
};

// ================================================================== 4. FONDATEUR
export const SceneFounder: React.FC = () => {
  const t = useT();
  const A = 39.6, B = 49.1;
  const y = 600, xr = 1360, r = 215;
  const eq = p(t, T1.khalwatia - 0.9, 1.1, eo);
  const link = p(t, T1.khalwatia - 1.6, 1.4, eio);
  const slide = p(t, T1.khalwatia - 2.1, 1.3, eio);
  const xl = 960 + (560 - 960) * slide;
  return (
    <Scene a={A} b={B} fadeIn={0.9} fadeOut={0.7}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center' }}>
        <FadeIn at={T1.founder}><Label>Sidi Mhamed Ben Abderrahmane · fondateur</Label></FadeIn>
        <Rise at={T1.founder + 0.3} style={{ marginTop: 14 }}><Serif size={72} italic weight={500}>de la confrérie <span style={{ color: C.gold, fontWeight: 700 }}>Rahmania</span> en Algérie</Serif></Rise>
      </div>
      <SvgLayer>
        <Thread d={`M${560 + r + 28} ${y}L${xr - r - 28} ${y}`} k={link} dash={[14, 11]} width={4} needle={false} />
      </SvgLayer>
      <Medal cx={xl} cy={y} r={r} at={T1.founder + 0.9} glow={0.8}>
        <Ar size={104} color={C.gold} style={{ lineHeight: 1.1 }}>الرحمانية</Ar>
        <Serif size={38} weight={700} style={{ marginTop: 6 }}>Rahmania</Serif>
        <Label size={22} color={C.creamDim} ls="0.24em" style={{ marginTop: 8 }}>Algérie</Label>
      </Medal>
      <div style={{ position: 'absolute', left: (560 + xr) / 2 - 120, top: y - 62, width: 240, textAlign: 'center', opacity: eq, transform: `scale(${0.7 + 0.3 * eq})` }}>
        <svg width={240} height={110} viewBox="-120 -55 240 110">
          <line x1={-44} x2={44} y1={-16} y2={-16} stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
          <line x1={-44} x2={44} y1={16} y2={16} stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ position: 'absolute', left: (560 + xr) / 2 - 190, top: y + 52, width: 380, textAlign: 'center', opacity: eq }}>
        <Serif size={32} italic color={C.creamDim} weight={500}>qui est la…</Serif>
      </div>
      <Medal cx={xr} cy={y} r={r} at={T1.khalwatia - 0.2} color={C.teal} glow={0.6}>
        <Ar size={104} color={C.teal} style={{ lineHeight: 1.1 }}>الخلوتية</Ar>
        <Serif size={38} weight={700} style={{ marginTop: 6 }}>Khalwatia</Serif>
        <Label size={22} color={C.creamDim} ls="0.24em" style={{ marginTop: 8 }}>Égypte</Label>
      </Medal>
    </Scene>
  );
};

// ================================================================== 5. LE PREMIER ÉLÈVE
export const SceneStudent: React.FC = () => {
  const t = useT();
  const A = 48.8, B = 67.0;
  const y = 560;
  const imp = p(t, T1.important - 0.5, 1.5, eio);           // « l'élève le plus important »
  const away = 1 - p(t, T1.important - 1.1, 0.9, eio);      // maître + manuscrit s'effacent
  const sx = 900 + (960 - 900) * imp;
  const sr = 188 + 56 * imp;
  const orbit = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.4 + t * 0.08;
    return { x: 960 + Math.cos(a) * 520, y: y + Math.sin(a) * 270 * 0.95 };
  });
  return (
    <Scene a={A} b={B} fadeIn={0.9} fadeOut={0.8}>
      <SvgLayer>
        <Thread d={`M${330 + 150 + 22} ${y}L${900 - 188 - 22} ${y}`} k={p(t, T1.student + 0.2, 1.3, eio) * away}
          dash={[14, 11]} width={4} needle={p(t, T1.student + 0.2, 1.3) < 1} opacity={away} />
        <Thread d={`M${900 + 188 + 22} ${y}L${1500 - 150 - 22} ${y}`} k={p(t, T1.scroll - 0.8, 1.3, eio) * away}
          dash={[14, 11]} width={4} needle={p(t, T1.scroll - 0.8, 1.3) < 1} opacity={away} />
        {orbit.map((o, i) => (
          <g key={i} opacity={imp * 0.55}>
            <path d={star8Path(o.x, o.y, 34)} fill="rgba(5,12,12,0.5)" stroke={C.creamSoft} strokeWidth={2} />
            <circle cx={o.x} cy={o.y - 5} r={8} fill={C.creamSoft} />
            <path d={`M${o.x - 13} ${o.y + 16}Q${o.x} ${o.y - 6} ${o.x + 13} ${o.y + 16}Z`} fill={C.creamSoft} />
          </g>
        ))}
        {imp > 0 && <circle cx={sx} cy={y} r={sr + 70 + 14 * Math.sin(t * 2.2)} fill="none" stroke={C.gold} strokeOpacity={0.5 * imp} strokeWidth={2} strokeDasharray="3 12" strokeLinecap="round" />}
      </SvgLayer>
      <div style={{ opacity: away }}>
        <Medal cx={330} cy={y} r={150} at={A + 0.8} color={C.goldDeep}>
          <Label size={19} color={C.creamDim} ls="0.2em">Le maître</Label>
          <Serif size={27} weight={700} style={{ marginTop: 6, width: 190 }}>Sidi Mhamed Ben Abderrahmane</Serif>
        </Medal>
      </div>
      <Medal cx={sx} cy={y} r={sr} at={T1.student + 0.1} glow={0.5 + 1.1 * imp}>
        <Label size={20 + 3 * imp} ls="0.18em" style={{ marginBottom: 8 }}>{imp > 0.5 ? 'Le plus important' : 'Premier élève'}</Label>
        <Serif size={44 + 10 * imp} weight={700} style={{ width: 300 }}>Abderrahmane Bachtarzi</Serif>
      </Medal>
      <div style={{ opacity: away }}>
        <Scroll x={1330} y={y - 225} w={340} h={450} at={T1.scroll - 0.4} dur={2.0} title="المنظومة الرحمانية" titleSize={42} seed={9} lines={7} />
        <div style={{ position: 'absolute', left: 1250, top: y + 250, width: 500, textAlign: 'center' }}>
          <FadeIn at={T1.scroll + 0.5}>
            <Serif size={40} italic weight={500}>la Mandhouma</Serif>
            <Label size={21} color={C.creamDim} ls="0.14em" style={{ marginTop: 8, lineHeight: 1.5 }}>sur laquelle on travaille<br />en ce moment</Label>
          </FadeIn>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', opacity: imp }}>
        <Serif size={60} italic weight={500}>Son élève le plus important</Serif>
      </div>
    </Scene>
  );
};
