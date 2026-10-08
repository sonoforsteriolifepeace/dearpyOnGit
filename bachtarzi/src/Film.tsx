import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Bg, C, Caption, Heading, In, SANS, SERIF, Scene, Stitch, prog, useCurrentFrame} from './ui';

const DUR = {intro: 180, route: 450, tombs: 330, writer: 390, poetry: 390, tailor: 450, measure: 390, outro: 270};
export const TOTAL = Object.values(DUR).reduce((a, b) => a + b, 0);

/* ───────────── 1. Intro ───────────── */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 10, 120);
  return (
    <Scene dur={DUR.intro}>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <Stitch id="i1" d="M 160 760 C 520 640, 700 900, 1000 770 S 1500 650, 1760 760" p={p} w={5} />
        <circle cx={160 + p * 1600} cy={760} r={0} />
      </svg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <In><div style={{fontFamily: SANS, fontSize: 24, letterSpacing: 8, color: C.gold}}>TARIQA RAHMANIA · ALGÉRIE</div></In>
        <In at={14}><div style={{fontFamily: SERIF, fontSize: 112, color: C.ink, marginTop: 24, lineHeight: 1.05}}>Cheikh Abderrahmane<br />Bachtarzi</div></In>
        <In at={40}><div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, color: C.thread, marginTop: 30}}>Le couturier devenu poète</div></In>
        <In at={64}><div style={{fontFamily: SANS, fontSize: 24, color: C.dim, marginTop: 40}}>L’auteur de la « Mandhouma Rahmania »</div></In>
      </AbsoluteFill>
    </Scene>
  );
};

/* ───────────── 2. Route ───────────── */
const places = {
  kab: {x: 520, y: 330, n: 'Kabylie', s: 'son pays d’origine'},
  cai: {x: 1560, y: 470, n: 'Le Caire · Al-Azhar', s: 'études'},
  sou: {x: 1640, y: 790, n: 'Soudan', s: 'séjour'},
  alg: {x: 360, y: 380, n: 'Alger', s: 'retour en Algérie'},
};
const Route: React.FC = () => {
  const f = useCurrentFrame();
  const L = places;
  const legs = [
    {id: 'r1', d: `M ${L.kab.x} ${L.kab.y} C 800 150, 1300 200, ${L.cai.x} ${L.cai.y}`, a: 40, b: 130},
    {id: 'r2', d: `M ${L.cai.x} ${L.cai.y} C 1500 600, 1560 700, ${L.sou.x} ${L.sou.y}`, a: 140, b: 210},
    {id: 'r3', d: `M ${L.sou.x} ${L.sou.y} C 1760 700, 1740 560, ${L.cai.x + 50} ${L.cai.y + 20}`, a: 220, b: 290},
    {id: 'r4', d: `M ${L.cai.x} ${L.cai.y} C 1200 560, 700 600, ${L.alg.x} ${L.alg.y}`, a: 300, b: 400},
  ];
  const shown = [0, 40, 140, 220, 300];
  const pts: [keyof typeof places, number][] = [['kab', 10], ['cai', 130], ['sou', 210], ['alg', 400]];
  return (
    <Scene dur={DUR.route}>
      <Heading kicker="Un parcours" title="De la Kabylie à Al-Azhar, puis Alger" />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        {[300, 520, 740, 960, 1180, 1400, 1620].map((x) => <line key={x} x1={x} y1={230} x2={x} y2={900} stroke={C.ink} opacity={0.05} />)}
        {[300, 480, 660, 840].map((y) => <line key={y} x1={140} y1={y} x2={1780} y2={y} stroke={C.ink} opacity={0.05} />)}
        <text x={900} y={560} fontFamily={SANS} fontSize={26} letterSpacing={14} fill={C.dim} opacity={0.5} textAnchor="middle">SAHARA</text>
        {legs.map((l) => <Stitch key={l.id} id={l.id} d={l.d} p={prog(f, l.a, l.b)} />)}
        {pts.map(([k, at]) => {
          const pt = L[k];
          const p = prog(f, at, at + 18);
          const left = k === 'alg';
          return (
            <g key={k} opacity={p}>
              <circle cx={pt.x} cy={pt.y} r={10 + (1 - p) * 20} fill={C.gold} />
              <circle cx={pt.x} cy={pt.y} r={26} fill="none" stroke={C.gold} opacity={0.4} />
              <text x={pt.x + (k === 'sou' || k === 'cai' ? -44 : 0)} y={pt.y + (k === 'kab' ? -52 : left ? 62 : 8)} textAnchor={k === 'sou' || k === 'cai' ? 'end' : 'middle'} fontFamily={SERIF} fontSize={36} fill={C.ink}>{pt.n}</text>
              <text x={pt.x + (k === 'sou' || k === 'cai' ? -44 : 0)} y={pt.y + (k === 'kab' ? -20 : left ? 94 : 42)} textAnchor={k === 'sou' || k === 'cai' ? 'end' : 'middle'} fontFamily={SANS} fontSize={20} fill={C.dim}>{pt.s}</text>
            </g>
          );
        })}
        {shown.length ? null : null}
      </svg>
      <In at={20} style={{position: 'absolute', left: 120, top: 280, width: 360}}>
        <div style={{fontFamily: SERIF, fontSize: 30, color: C.thread, lineHeight: 1.3}}>Sidi Mhamed Ben Abderrahmane, le maître kabyle</div>
      </In>
      <Caption at={30} text="Le maître, Sidi Mhamed Ben Abderrahmane, étudie à Al-Azhar, passe par le Soudan, revient à Al-Azhar… puis rentre en Algérie." />
    </Scene>
  );
};

/* ───────────── 3. Bou Qabrine ───────────── */
const Tomb: React.FC<{x: number; at: number; label: string}> = ({x, at, label}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 30);
  return (
    <g transform={`translate(${x},${500 + (1 - p) * 40})`} opacity={p}>
      <rect x={-90} y={0} width={180} height={150} fill="#2b2118" stroke={C.gold} strokeWidth={3} />
      <path d="M -90 0 A 90 90 0 0 1 90 0 Z" fill="#3a2c1f" stroke={C.gold} strokeWidth={3} />
      <line x1={0} y1={-90} x2={0} y2={-125} stroke={C.gold} strokeWidth={3} />
      <circle cx={0} cy={-132} r={7} fill={C.gold} />
      <path d="M -30 150 L -30 80 A 30 30 0 0 1 30 80 L 30 150 Z" fill={C.bg} />
      <text y={205} textAnchor="middle" fontFamily={SERIF} fontSize={30} fill={C.ink}>{label}</text>
    </g>
  );
};
const Tombs: React.FC = () => {
  const f = useCurrentFrame();
  const chain = [
    {t: 'Khalwatiyya', s: 'en Égypte', c: C.teal, at: 150},
    {t: 'Rahmaniyya', s: 'en Algérie', c: C.gold, at: 190},
    {t: 'Bachtarzi', s: 'son premier élève', c: C.rust, at: 230},
  ];
  return (
    <Scene dur={DUR.tombs}>
      <Heading kicker="Le maître" title="« Bou Qabrine » — l’homme aux deux tombeaux" />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <Tomb x={380} at={20} label="Belcourt, Alger" />
        <Tomb x={720} at={44} label="Un second tombeau" />
      </svg>
      <div style={{position: 'absolute', left: 1000, top: 330, width: 780}}>
        <In at={120}><div style={{fontFamily: SANS, fontSize: 22, letterSpacing: 4, color: C.dim, marginBottom: 24}}>FONDATEUR DE LA CONFRÉRIE</div></In>
        {chain.map((c, i) => (
          <In key={c.t} at={c.at} x={40} y={0} style={{display: 'flex', alignItems: 'center', marginBottom: 26}}>
            <div style={{width: 18, height: 18, borderRadius: 9, background: c.c, marginRight: 22}} />
            <div style={{fontFamily: SERIF, fontSize: 54, color: C.ink}}>{c.t}</div>
            <div style={{fontFamily: SANS, fontSize: 24, color: c.c, marginLeft: 20}}>{c.s}</div>
            {i < 2 && <div style={{marginLeft: 20, color: C.dim, fontSize: 36}}>→</div>}
          </In>
        ))}
      </div>
      <Caption at={40} text="Il est enterré à Belcourt. Son tout premier élève en Algérie : Cheikh Abderrahmane Bachtarzi." />
    </Scene>
  );
};

/* ───────────── 4. From student to author ───────────── */
const Bars: React.FC<{n: number; at: number; rhyme?: boolean; w: number}> = ({n, at, rhyme, w}) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const p = prog(f, at + i * 7, at + i * 7 + 18);
        const len = (rhyme ? 0.62 : 0.78 + ((i * 37) % 20) / 100) * w;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', height: 26, margin: '14px 0', opacity: p}}>
            <div style={{height: 10, width: len * p, borderRadius: 5, background: rhyme ? C.thread : C.dim}} />
            {rhyme && <div style={{marginLeft: 'auto', width: 34, height: 10, borderRadius: 5, background: i % 2 ? C.teal : C.rust}} />}
          </div>
        );
      })}
    </>
  );
};
const Writer: React.FC = () => {
  const f = useCurrentFrame();
  const arrow = prog(f, 120, 160);
  return (
    <Scene dur={DUR.writer}>
      <Heading kicker="Le tournant" title="Il ne fait plus que recevoir : il écrit" />
      <div style={{position: 'absolute', left: 150, top: 300, width: 600}}>
        <In at={20}><div style={{fontFamily: SANS, fontSize: 22, letterSpacing: 4, color: C.dim}}>LES COURS DU CHEIKH</div></In>
        <div style={{marginTop: 24, padding: 30, border: `2px solid ${C.dim}`, borderRadius: 14}}><Bars n={7} at={34} w={540} /></div>
        <In at={60}><div style={{fontFamily: SERIF, fontSize: 32, color: C.ink, marginTop: 20}}>celui qui reçoit</div></In>
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <Stitch id="w1" d="M 800 520 L 1100 520" p={arrow} w={6} />
        <path d="M 1100 520 l -26 -18 M 1100 520 l -26 18" stroke={C.thread} strokeWidth={6} strokeLinecap="round" opacity={arrow} />
      </svg>
      <div style={{position: 'absolute', left: 1180, top: 300, width: 600}}>
        <In at={130}><div style={{fontFamily: SANS, fontSize: 22, letterSpacing: 4, color: C.gold}}>QASAYED · POÈMES</div></In>
        <div style={{marginTop: 24, padding: 30, border: `2px solid ${C.gold}`, borderRadius: 14, background: 'rgba(217,164,65,0.06)'}}><Bars n={7} at={150} w={540} rhyme /></div>
        <In at={200}><div style={{fontFamily: SERIF, fontSize: 32, color: C.gold, marginTop: 20}}>celui qui écrit : un auteur de la Tariqa</div></In>
      </div>
      <Caption at={50} text="Les enseignements de son cheikh, il les réécrit sous forme de qasayed : des poèmes." />
    </Scene>
  );
};

/* ───────────── 5. Why poetry ───────────── */
const Poetry: React.FC = () => {
  const f = useCurrentFrame();
  const topics = ['Fiqh', 'Hadith', 'Sîra', 'Sounna', 'Qawâ‘id'];
  const sub = ['jurisprudence', 'paroles du Prophète', 'biographie', 'tradition', 'règles'];
  const mem = prog(f, 200, 330);
  return (
    <Scene dur={DUR.poetry}>
      <Heading kicker="Pourquoi des poèmes ?" title="Parce que la poésie se retient" />
      <div style={{position: 'absolute', left: 150, top: 290}}>
        {topics.map((t, i) => (
          <In key={t} at={30 + i * 12} x={-30} y={0} style={{display: 'flex', alignItems: 'baseline', margin: '0 0 26px'}}>
            <div style={{fontFamily: SERIF, fontSize: 56, color: C.ink, width: 240}}>{t}</div>
            <div style={{fontFamily: SANS, fontSize: 22, color: C.dim}}>{sub[i]}</div>
          </In>
        ))}
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        {topics.map((t, i) => <Stitch key={t} id={`p${i}`} d={`M 700 ${322 + i * 82} C 900 ${322 + i * 82}, 960 540, 1120 540`} p={prog(f, 100 + i * 8, 150 + i * 8)} w={3} />)}
      </svg>
      <In at={110} x={40} y={0} style={{position: 'absolute', left: 1120, top: 340, width: 640}}>
        <div style={{padding: '30px 34px', border: `2px solid ${C.gold}`, borderRadius: 14, background: 'rgba(217,164,65,0.06)'}}>
          <Bars n={6} at={130} w={560} rhyme />
        </div>
      </In>
      <In at={190} style={{position: 'absolute', left: 1120, top: 690, width: 640}}>
        <div style={{fontFamily: SANS, fontSize: 22, color: C.dim, marginBottom: 10}}>MÉMORISATION — même pour les tout-petits</div>
        <div style={{height: 16, borderRadius: 8, background: '#2b2420'}}><div style={{height: 16, borderRadius: 8, width: `${mem * 100}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.gold})`}} /></div>
      </In>
      <Caption at={40} text="Chez les Arabes, la poésie sert à enseigner : on enseignait ainsi aux enfants, parce que c’est facile à mémoriser." />
    </Scene>
  );
};

/* ───────────── 6. The tailor ───────────── */
const Tailor: React.FC = () => {
  const f = useCurrentFrame();
  const tiers = [
    {t: 'Les deys', w: 260, c: C.rust},
    {t: 'Les bachaghas', w: 380, c: '#b8643b'},
    {t: 'Les aghas', w: 500, c: '#c0833a'},
    {t: 'Les khodjas', w: 620, c: C.gold},
  ];
  const sew = prog(f, 40, 300);
  return (
    <Scene dur={DUR.tailor}>
      <Heading kicker="Le métier" title="Abderrahmane « Ben Memmach », dit le Terdji" />
      <In at={20} style={{position: 'absolute', left: 120, top: 250}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, color: C.thread}}>khayyat · couturier</div>
      </In>
      <div style={{position: 'absolute', left: 1000, top: 270, width: 700}}>
        <In at={80}><div style={{fontFamily: SANS, fontSize: 22, letterSpacing: 4, color: C.dim, marginBottom: 22, textAlign: 'center'}}>IL COUD POUR LA HAUTE CLASSE TURQUE</div></In>
        {tiers.map((t, i) => (
          <In key={t.t} at={100 + i * 22} y={20} style={{margin: '0 auto 14px', width: t.w, height: 84, background: t.c, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: SERIF, fontSize: 38, color: '#1a1410'}}>{t.t}</div>
          </In>
        ))}
        <In at={230} style={{margin: '22px auto 0', width: 620, textAlign: 'center', padding: 18, border: `2px dashed ${C.dim}`, borderRadius: 8}}>
          <div style={{fontFamily: SERIF, fontSize: 32, color: C.dim}}>pas un couturier pour le public</div>
        </In>
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <Stitch id="t1" d="M 140 560 C 260 470, 360 650, 480 560 S 700 470, 820 560" p={sew} w={5} />
        <g transform={`translate(${140 + sew * 680},${560 + Math.sin(sew * Math.PI * 3) * 60 * 0}) rotate(-35)`} opacity={sew > 0 ? 1 : 0}>
          <line x1={0} y1={0} x2={90} y2={0} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={80} cy={0} rx={7} ry={3} fill="none" stroke={C.ink} strokeWidth={2} />
        </g>
      </svg>
      <Caption at={40} text="Il cousait pour les khodjas, les aghas, les bachaghas et les deys, au sommet de la société turque d’Algérie." />
    </Scene>
  );
};

/* ───────────── 7. Measure ───────────── */
const Measure: React.FC = () => {
  const f = useCurrentFrame();
  const tape = prog(f, 20, 110);
  const steps = ['Un plan', 'Un patron', 'Un tissu', 'Des superpositions', 'Des garnitures', 'Des finitions'];
  const line = prog(f, 150, 330);
  return (
    <Scene dur={DUR.measure}>
      <Heading kicker="Un esprit de technicien" title="Il mesure, il conçoit, il assemble" />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <g transform="translate(140,330)">
          <rect x={0} y={0} width={1640 * tape} height={64} fill={C.gold} />
          {Array.from({length: 83}).map((_, i) => {
            const x = i * 20;
            if (x > 1640 * tape) return null;
            return <line key={i} x1={x} x2={x} y1={0} y2={i % 5 === 0 ? 34 : 18} stroke="#1a1410" strokeWidth={2} />;
          })}
        </g>
        <Stitch id="m1" d="M 220 640 L 1700 640" p={line} w={4} />
        {steps.map((s, i) => {
          const x = 220 + i * 296;
          const p = prog(f, 150 + i * 30, 175 + i * 30);
          return (
            <g key={s} opacity={p}>
              <circle cx={x} cy={640} r={16} fill={i === 5 ? C.rust : C.gold} />
              <text x={x} y={710 + (i % 2) * 52} textAnchor="middle" fontFamily={SERIF} fontSize={34} fill={C.ink}>{s}</text>
            </g>
          );
        })}
      </svg>
      <In at={40} style={{position: 'absolute', left: 140, top: 430, width: 1640}}>
        <div style={{fontFamily: SERIF, fontSize: 36, color: C.thread}}>Un technicien avant tout — pas seulement un lettré, ni un fellah.</div>
      </In>
      <In at={330} style={{position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: C.gold}}>Ses poèmes se construisent comme un vêtement.</div>
      </In>
      <Caption at={50} text="La couture lui a donné le sens de la mesure et du plan — et il a mis cet esprit de couturier dans ses poèmes." />
    </Scene>
  );
};

/* ───────────── 8. Outro ───────────── */
const Outro: React.FC = () => {
  const cards = [
    {n: 'Cheikh Mhamed Belkacem', s: 'déjà présenté', done: true},
    {n: 'Sidi Mhamed Ben Abderrahmane El Azhari', s: 'déjà présenté', done: true},
    {n: 'Cheikh Abderrahmane Bachtarzi', s: 'sa vie, son parcours : à raconter', done: false},
  ];
  return (
    <Scene dur={DUR.outro}>
      <Heading kicker="À retenir" title="Une figure à lire et à faire connaître" />
      <div style={{position: 'absolute', left: 120, right: 120, top: 330, display: 'flex', gap: 36}}>
        {cards.map((c, i) => (
          <In key={c.n} at={30 + i * 24} style={{flex: 1, padding: 34, minHeight: 300, borderRadius: 16, border: `2px solid ${c.done ? C.dim : C.gold}`, background: c.done ? 'transparent' : 'rgba(217,164,65,0.08)'}}>
            <div style={{fontFamily: SANS, fontSize: 40, color: c.done ? C.teal : C.gold}}>{c.done ? '✓' : '★'}</div>
            <div style={{fontFamily: SERIF, fontSize: 42, color: C.ink, marginTop: 14, lineHeight: 1.15}}>{c.n}</div>
            <div style={{fontFamily: SANS, fontSize: 22, color: c.done ? C.dim : C.gold, marginTop: 18}}>{c.s}</div>
          </In>
        ))}
      </div>
      <Caption at={110} text="Cheikh Abderrahmane Bachtarzi mérite vraiment son propre film : un personnage très important, à lire et à exposer." />
    </Scene>
  );
};

export const Film: React.FC = () => {
  let t = 0;
  const S = (k: keyof typeof DUR, el: React.ReactNode) => { const from = t; t += DUR[k]; return <Sequence key={k} from={from} durationInFrames={DUR[k]}>{el}</Sequence>; };
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Bg />
      <Audio src={staticFile('pad.wav')} volume={0.5} />
      {S('intro', <Intro />)}
      {S('route', <Route />)}
      {S('tombs', <Tombs />)}
      {S('writer', <Writer />)}
      {S('poetry', <Poetry />)}
      {S('tailor', <Tailor />)}
      {S('measure', <Measure />)}
      {S('outro', <Outro />)}
    </AbsoluteFill>
  );
};
