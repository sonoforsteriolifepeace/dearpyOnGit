import React from 'react';
import { C, FONT, H, W } from '../theme';
import { cue } from '../script';
import { clamp, eb, eio, eo, mix, p, useT, win } from '../anim';
import {
  Ar, FadeIn, Label, Plaque, Rise, Scene, Serif, Strike, SvgLayer, Thread, TimedThread, circlePath, star8Path,
} from '../kit';
import { Kid, Scroll } from '../shapes';

export const T3 = {
  great: cue(3, "Ça, c'est une grande personnalité"),
  number: cue(3, 'Il aime le chiffre'),
  tailor: cue(3, 'couturier, khayat, terdji'),
  memmach: cue(3, 'Abderrahmane Ben Memmach'),
  nick: cue(3, 'son surnom'),
  turks: cue(3, 'haute classe du pouvoir des Turcs'),
  khodja: cue(3, 'khoudjat'),
  agha: cue(3, 'aghawat'),
  bachagha: cue(3, 'bachaghawat'),
  dey: cue(3, 'dayat'),
  notPublic: cue(3, 'pas un couturier pour le public'),
  topClass: cue(3, 'très haute classe de la société'),
  science: cue(3, 'une science'),
  measure: cue(3, 'notion de mesure'),
  plan: cue(3, 'fait un plan'),
  pattern: cue(3, "ce qu'on appelle le patron"),
  tech: cue(3, 'un technicien à la base'),
  notScholar: cue(3, 'lettré ou un fellah'),
  sewing: cue(3, 'ressemble à peu près à la couture'),
  step1: cue(3, 'il commence par un plan'),
  step2: cue(3, 'un patron'),
  step3: cue(3, 'un tissu'),
  step4: cue(3, 'des superpositions'),
  step5: cue(3, 'des garnitures'),
  step6: cue(3, 'des finitions'),
  spirit: cue(3, 'son esprit de terdji'),
  v1: cue(3, 'vidéo sur le cheikh Mhamed Belkacem'),
  v2: cue(3, 'vidéo sur Sidi Mhamed Ben Abderrahmane El Azhari'),
  deserves: cue(3, 'mérite vraiment une vidéo'),
  life: cue(3, 'sur sa vie'),
  career: cue(3, 'sa carrière'),
  did: cue(3, "ce qu'il a fait"),
  important: cue(3, 'très, très important'),
};

// ================================================================== 11. LE CHIFFRE, LE MÈTRE
const Tape: React.FC<{ y: number; at: number; h?: number; speed?: number }> = ({ y, at, h = 118, speed = 55 }) => {
  const t = useT();
  const k = p(t, at, 1.4, eio);
  if (k <= 0) return null;
  const total = Math.max(0, t - at) * speed;
  const off = total % 100;
  const ticks = Array.from({ length: 21 }, (_, i) => i - 1);
  return (
    <div style={{ position: 'absolute', left: 0, top: y, width: W, height: h, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>
      <svg width={W} height={h} style={{ position: 'absolute', inset: 0 }}>
        <rect width={W} height={h} fill="#E8CD84" />
        <rect y={h - 8} width={W} height={8} fill="#CFAE58" />
        {ticks.map(i => {
          const x = i * 100 - off;
          const num = Math.floor(total / 100) + i;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={0} y2={h * 0.5} stroke="#2A1B0A" strokeWidth={3} />
              <line x1={x + 50} x2={x + 50} y1={0} y2={h * 0.3} stroke="#2A1B0A" strokeWidth={2} />
              {[1, 2, 3, 4, 6, 7, 8, 9].map(j => <line key={j} x1={x + j * 10} x2={x + j * 10} y1={0} y2={h * 0.16} stroke="#2A1B0A" strokeWidth={1.5} />)}
              <text x={x + 8} y={h * 0.5 + 34} fontFamily={FONT.sans} fontWeight={700} fontSize={32} fill="#2A1B0A">{num}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const SceneNumber: React.FC = () => {
  const t = useT();
  const A = 119.8, B = 127.6;
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.8}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center' }}>
        <FadeIn at={T3.great - 0.2}><Label>Une grande personnalité</Label></FadeIn>
        <Rise at={T3.number - 0.2} style={{ marginTop: 18 }}><Serif size={136} italic weight={600}>Il aime <span style={{ color: C.gold, fontWeight: 700 }}>le chiffre</span></Serif></Rise>
      </div>
      <Tape y={510} at={T3.number + 0.2} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center' }}>
        <FadeIn at={T3.tailor - 0.7}><Serif size={44} italic weight={500} color={C.creamDim}>Pourquoi ? Parce que c’est un…</Serif></FadeIn>
        <Rise at={T3.tailor - 0.1} style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 36 }}>
            <Serif size={118} weight={700}>couturier</Serif>
          </div>
        </Rise>
        <FadeIn at={T3.tailor + 0.5} style={{ display: 'flex', justifyContent: 'center', gap: 70, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}><Serif size={50} italic weight={500} color={C.gold}>khayat</Serif><Ar size={60} color={C.gold}>خيّاط</Ar></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}><Serif size={50} italic weight={500} color={C.gold}>terdji</Serif><Ar size={60} color={C.gold}>ترزي</Ar></div>
        </FadeIn>
      </div>
    </Scene>
  );
};

// ================================================================== 12. L'ÉTIQUETTE
export const SceneLabel: React.FC = () => {
  const t = useT();
  const A = 127.2, B = 132.6;
  const drop = p(t, T3.memmach - 0.3, 1.0, eb);
  const sway = Math.sin((t - T3.memmach) * 2.6) * 1.2 * Math.exp(-(t - T3.memmach) * 0.35);
  const w = 1060, h = 400, x = (W - w) / 2, y = 330;
  const rect = `M${x + 18} ${y + 18}H${x + w - 18}V${y + h - 18}H${x + 18}Z`;
  return (
    <Scene a={A} b={B} fadeIn={0.7} fadeOut={0.7}>
      <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: clamp(drop * 2.4),
        transform: `translateY(${(1 - drop) * -120}px) rotate(${-1.5 + sway}deg)`, transformOrigin: '50% -40px' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#E9DDBF', boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(60,40,10,0.05) 0 2px, transparent 2px 5px)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center' }}>
          <Serif size={74} weight={700} color="#2C2013">Abderrahmane Ben Memmach</Serif>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 176, textAlign: 'center', opacity: p(t, T3.nick - 0.2, 0.8, eo) }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 36 }}>
            <Serif size={64} italic weight={600} color="#8A5A12">dit « Terdji »</Serif>
            <Ar size={86} color="#2C2013">ترزي</Ar>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 316, textAlign: 'center', opacity: p(t, T3.nick + 0.6, 0.8, eo) }}>
          <Label size={22} color="#6B5430" ls="0.2em">parce qu’il était couturier · il cousait</Label>
        </div>
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} viewBox={`${x} ${y} ${w} ${h}`}>
          <TimedThread d={rect} at={T3.memmach + 0.2} dur={2.8} color="#B5842A" width={4} dash={[15, 10]} needle />
        </svg>
      </div>
    </Scene>
  );
};

// ================================================================== 13. LES CLIENTS
const RANKS = [
  { fr: 'Khodjas', at: T3.khodja },
  { fr: 'Aghas', at: T3.agha },
  { fr: 'Bachaghas', at: T3.bachagha },
  { fr: 'Deys', at: T3.dey },
];

export const SceneClients: React.FC = () => {
  const t = useT();
  const A = 132.0, B = 142.2;
  const bx = 800, bw = 250, base = 900;
  const top = (i: number) => base - (150 + i * 112);
  const nope = p(t, T3.notPublic - 0.2, 0.7, eo);
  const crown = p(t, T3.topClass - 0.2, 1.2, eo);
  const crowd = [0, 1, 2, 3, 4, 5];
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.8}>
      <div style={{ position: 'absolute', left: 130, top: 200, width: 700 }}>
        <FadeIn at={T3.turks - 0.9}><Label>Pour qui cousait-il ?</Label></FadeIn>
        <Rise at={T3.turks - 0.4} style={{ marginTop: 16 }}>
          <Serif size={68} italic weight={500}>La haute classe du <span style={{ color: C.gold, fontWeight: 700 }}>pouvoir turc</span> en Algérie</Serif>
        </Rise>
      </div>
      <SvgLayer>
        {RANKS.map((r, i) => {
          const k = p(t, r.at - 0.15, 0.7, eb);
          const x = bx + i * bw, y = top(i);
          const lit = i === 3 ? crown : 0;
          return (
            <g key={i} opacity={clamp(k * 2.4)} transform={`translate(0 ${(1 - k) * 50})`}>
              <rect x={x} y={y} width={bw - 8} height={base - y} fill={`rgba(7,10,26,${0.66})`} stroke={i === 3 ? C.gold : C.goldDeep} strokeWidth={2.5} />
              <rect x={x + 9} y={y + 9} width={bw - 26} height={base - y - 18} fill="none" stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="7 6" />
              {lit > 0 && <rect x={x - 10} y={y - 10} width={bw + 12} height={base - y + 20} fill={C.gold} opacity={0.10 * lit} />}
            </g>
          );
        })}
        {/* le fil gravit l'escalier */}
        <Thread d={`M${bx + 40} ${top(0) - 36}L${bx + bw - 40} ${top(0) - 36}L${bx + bw + 40} ${top(1) - 36}L${bx + 2 * bw - 40} ${top(1) - 36}L${bx + 2 * bw + 40} ${top(2) - 36}L${bx + 3 * bw - 40} ${top(2) - 36}L${bx + 3 * bw + 40} ${top(3) - 36}L${bx + 4 * bw - 50} ${top(3) - 36}`}
          k={p(t, T3.khodja - 0.4, 2.0, eio)} width={4} dash={[14, 10]} needle glow />
        <path d={star8Path(bx + 3 * bw + bw / 2 - 4, top(3) - 130, 34 * crown, 0)} fill={C.gold} opacity={crown} />
        {/* le public, écarté */}
        {crowd.map(i => (
          <Kid key={i} x={190 + i * 78} y={base - 4} s={1.35} color={C.creamSoft}
            bob={0} mouth={0} />
        ))}
        <rect x={150} y={base - 150} width={500} height={160} fill="rgba(7,10,26,0.55)" opacity={nope * 0.0} />
        <line x1={160} x2={640} y1={base - 60} y2={base - 120} stroke={C.terra} strokeWidth={6} strokeLinecap="round" opacity={nope}
          strokeDasharray={600} strokeDashoffset={600 * (1 - nope)} />
      </SvgLayer>
      {RANKS.map((r, i) => {
        const k = p(t, r.at - 0.1, 0.7, eo);
        return (
          <div key={i} style={{ position: 'absolute', left: bx + i * bw, top: top(i) + 22, width: bw - 8, textAlign: 'center', opacity: k }}>
            <Serif size={i === 3 ? 56 : 50} weight={700} color={i === 3 ? C.gold : C.cream}>{r.fr}</Serif>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 140, top: base - 330, width: 560, textAlign: 'center', opacity: nope, transform: `translateY(${(1 - nope) * 14}px)` }}>
        <Serif size={50} italic weight={500}>pas un couturier pour <Strike at={T3.notPublic + 0.5} color={C.terra}>le public</Strike></Serif>
      </div>
      <div style={{ position: 'absolute', left: 1790 - 700, top: top(3) - 86, width: 690, textAlign: 'right', opacity: crown }}>
        <Label size={22} color={C.gold} ls="0.2em">la très haute classe de la société</Label>
      </div>
    </Scene>
  );
};

// ================================================================== 14. MESURE, PATRON, TECHNICIEN
const PIECES = {
  body: 'M0 60L105 28Q160 110 215 28L320 60L300 470L20 470Z',
  sleeve: 'M385 300L385 128Q485 40 600 128L600 300Z',
  hood: 'M668 78Q748 30 808 96L796 262Q736 300 668 262Z',
};

const Count: React.FC<{ to: number; at: number; dur?: number }> = ({ to, at, dur = 1.2 }) => {
  const t = useT();
  return <>{Math.round(to * p(t, at, dur, eo))}</>;
};

export const ScenePattern: React.FC = () => {
  const t = useT();
  const A = 141.8, B = 156.0;
  const ox = 780, oy = 300, S = 1.1;
  const draw = (at: number, dur: number) => p(t, at, dur, eio);
  const ph1 = win(t, T3.science - 0.3, T3.pattern - 0.4, 0.6, 0.6);
  const ph2 = win(t, T3.pattern - 0.4, T3.tech - 0.3, 0.6, 0.6);
  const ph3 = p(t, T3.tech - 0.3, 0.7, eo);
  const dim = (x1: number, y1: number, x2: number, y2: number, at: number) => {
    const k = p(t, at, 1.0, eio);
    const horizontal = y1 === y2;
    const [tx, ty] = [(x1 + x2) / 2, (y1 + y2) / 2];
    return (
      <g opacity={k} stroke={C.blue} strokeWidth={2.2} fill="none">
        <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} />
        {horizontal ? <><line x1={x1} x2={x1} y1={y1 - 12} y2={y1 + 12} /><line x1={x2} x2={x2} y1={y2 - 12} y2={y2 + 12} /></> :
          <><line x1={x1 - 12} x2={x1 + 12} y1={y1} y2={y1} /><line x1={x2 - 12} x2={x2 + 12} y1={y2} y2={y2} /></>}
      </g>
    );
  };
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.8}>
      <AbsFill>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,34,64,0.34)',
          backgroundImage: 'linear-gradient(rgba(143,195,218,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(143,195,218,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px', opacity: p(t, T3.science - 0.4, 1.4) }} />
      </AbsFill>
      {/* titres successifs */}
      <div style={{ position: 'absolute', left: 120, top: 190, width: 600 }}>
        <div style={{ position: 'absolute', opacity: ph1, transform: `translateY(${(1 - ph1) * 14}px)` }}>
          <Label color={C.blue}>La couture est une science</Label>
          <Serif size={96} italic weight={600} style={{ marginTop: 14 }}>La notion de <span style={{ color: C.gold, fontWeight: 700 }}>mesure</span></Serif>
        </div>
        <div style={{ position: 'absolute', opacity: ph2, transform: `translateY(${(1 - ph2) * 14}px)` }}>
          <Label color={C.blue}>Un plan · une conception</Label>
          <Serif size={96} italic weight={600} style={{ marginTop: 14 }}>Il fait le <span style={{ color: C.gold, fontWeight: 700 }}>patron</span></Serif>
        </div>
        <div style={{ position: 'absolute', opacity: ph3, transform: `translateY(${(1 - ph3) * 14}px)` }}>
          <Label color={C.blue}>À la base</Label>
          <Serif size={96} italic weight={600} style={{ marginTop: 14 }}>C’est un <span style={{ color: C.gold, fontWeight: 700 }}>technicien</span></Serif>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 560, width: 560, opacity: ph3 }}>
        <Serif size={44} weight={500} color={C.creamDim} italic>pas seulement un <Strike at={T3.notScholar + 0.2} color={C.terra}>lettré</Strike> ou un <Strike at={T3.notScholar + 0.9} color={C.terra}>fellah</Strike></Serif>
      </div>
      <SvgLayer>
        <g transform={`translate(${ox} ${oy}) scale(${S})`}>
          {(Object.keys(PIECES) as (keyof typeof PIECES)[]).map((k, i) => {
            const at = T3.measure + 0.4 + i * 1.5;
            const g = p(t, at + 1.2, 1.2);
            return (
              <g key={k}>
                <path d={PIECES[k]} fill={`rgba(143,195,218,${0.07 * g})`} stroke="none" />
                <TimedThread d={PIECES[k]} at={at} dur={2.0} color={C.cream} width={3.2 / S} dash={null} needle={k === 'body'} />
                <g opacity={g}>
                  <path d={PIECES[k]} fill="none" stroke={C.blue} strokeWidth={1.8} strokeDasharray="8 7" strokeOpacity={0.7}
                    transform={k === 'body' ? 'translate(16 14) scale(0.9)' : k === 'sleeve' ? 'translate(60 22) scale(0.86)' : 'translate(106 20) scale(0.86)'} />
                </g>
              </g>
            );
          })}
          {dim(20, 508, 300, 508, T3.measure + 1.2)}
          {dim(-34, 60, -34, 470, T3.measure + 1.8)}
          {dim(385, 336, 600, 336, T3.measure + 3.0)}
          <text x={160} y={552} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={26} fill={C.blue}><Count to={56} at={T3.measure + 1.4} /> cm</text>
          <text x={-52} y={272} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={26} fill={C.blue} transform="rotate(-90 -52 272)"><Count to={98} at={T3.measure + 2.0} /> cm</text>
          <text x={492} y={380} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={26} fill={C.blue}><Count to={44} at={T3.measure + 3.2} /> cm</text>
          {/* fil droit */}
          <g opacity={p(t, T3.plan, 1.0)} stroke={C.gold} strokeWidth={2.4} fill="none">
            <line x1={160} y1={180} x2={160} y2={430} />
            <path d="M148 200L160 176L172 200M148 410L160 434L172 410" />
          </g>
          <g opacity={p(t, T3.pattern, 1.0)} fill={C.gold}>
            <path d="M20 300l14 -9v18z" /><path d="M300 300l-14 -9v18z" />
            <path d="M385 215l12 -8v16z" />
          </g>
        </g>
      </SvgLayer>
    </Scene>
  );
};

const AbsFill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
);

// ================================================================== 15. LA COUTURE DANS LE POÈME
const ROBE = 'M-70 -118L-28 -132Q0 -100 28 -132L70 -118L150 -36L118 -4L82 -44L90 200L-90 200L-82 -44L-118 -4L-150 -36Z';

const STEPS = [
  { fr: 'Plan', at: T3.step1 },
  { fr: 'Patron', at: T3.step2 },
  { fr: 'Tissu', at: T3.step3 },
  { fr: 'Superpositions', at: T3.step4 },
  { fr: 'Garnitures', at: T3.step5 },
  { fr: 'Finitions', at: T3.step6 },
];
// espacement minimal pour que la liste reste lisible même dite très vite
const STEP_AT = STEPS.reduce<number[]>((acc, s, i) => { acc.push(i === 0 ? s.at : Math.max(s.at, acc[i - 1] + 0.62)); return acc; }, []);

const StepIcon: React.FC<{ i: number; k: number }> = ({ i, k }) => {
  const g = { fill: 'none', stroke: C.cream, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const a = { fill: 'none', stroke: C.gold, strokeWidth: 3, strokeLinecap: 'round' as const };
  switch (i) {
    case 0: return <g><rect x={-46} y={-34} width={92} height={68} {...g} strokeDasharray="6 8" /><path d="M-46 -34L46 34M46 -34L-46 34" {...a} strokeOpacity={0.6} /></g>;
    case 1: return <g><path d="M-40 34L-40 -20L-14 -36Q0 -18 14 -36L40 -20L40 34Z" {...g} /><path d="M-40 6h12M40 6h-12" {...a} /></g>;
    case 2: return <g><rect x={-46} y={-34} width={92} height={68} {...g} />{[-18, 0, 18].map(x => <line key={x} x1={x} y1={-34} x2={x} y2={34} {...a} strokeOpacity={0.6} />)}{[-12, 12].map(y => <line key={y} x1={-46} y1={y} x2={46} y2={y} {...g} strokeOpacity={0.5} />)}</g>;
    case 3: return <g><rect x={-40} y={-30} width={76} height={50} {...g} strokeOpacity={0.45} /><rect x={-28} y={-18} width={76} height={50} {...g} strokeOpacity={0.7} /><rect x={-16} y={-6} width={76} height={50} {...a} /></g>;
    case 4: return <g><path d="M-48 8Q-32 -22 -16 8T16 8T48 8" {...a} /><circle cx={-32} cy={-14} r={5} fill={C.gold} /><circle cx={0} cy={-14} r={5} fill={C.gold} /><circle cx={32} cy={-14} r={5} fill={C.gold} /><path d="M-48 26H48" {...g} strokeDasharray="4 8" /></g>;
    default: return <g><path d="M-48 14H48" {...a} strokeDasharray="12 8" /><path d={star8Path(0, -14, 22)} {...g} /></g>;
  }
};

export const SceneAnalogy: React.FC = () => {
  const t = useT();
  const A = 155.6, B = 170.6;
  const compress = p(t, T3.step1 - 0.7, 1.1, eio);
  const pairY = mix(520, 405, compress);
  const sc = mix(1, 0.8, compress);
  const link = p(t, T3.sewing - 0.2, 1.8, eio);
  const run = p(t, T3.spirit - 0.2, 2.8, eio);
  const finale = p(t, T3.spirit + 1.2, 1.2, eo);
  const stationX = (i: number) => 260 + i * 280;
  const sy = 800;
  const rx = 590, px = 1330;
  const zig = `M${rx + 190 * sc} ${pairY}${Array.from({ length: 12 }, (_, i) => `L${rx + 190 * sc + (i + 1) * ((px - 190 * sc - rx - 190 * sc) / 12)} ${pairY + (i % 2 ? 22 : -22)}`).join('')}`;
  const capY = pairY + 262 * sc;
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.9}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 172, textAlign: 'center', opacity: 1 - finale }}>
        <FadeIn at={T3.sewing - 0.9}><Label>Ses poèmes ressemblent à de la couture</Label></FadeIn>
      </div>
      <SvgLayer>
        <g transform={`translate(${rx} ${pairY}) scale(${1.15 * sc})`}>
          <path d={ROBE} fill="rgba(243,233,209,0.1)" opacity={p(t, T3.sewing - 0.6, 0.8)} />
          <TimedThread d={ROBE} at={T3.sewing - 0.6} dur={2.4} width={3.4} dash={[12, 9]} needle />
          <g opacity={p(t, T3.sewing + 1, 1)}>
            <path d="M0 -96L0 200" stroke={C.gold} strokeWidth={2.2} strokeDasharray="6 9" fill="none" opacity={0.7} />
            {[-52, -6, 40, 86, 132].map(y => <path key={y} d={star8Path(0, y, 7)} fill={C.gold} />)}
          </g>
        </g>
        <Thread d={zig} k={link} width={4} dash={null} needle={false} color={C.gold} />
      </SvgLayer>
      <div style={{ position: 'absolute', left: rx - 150, top: capY, width: 300, textAlign: 'center', opacity: p(t, T3.sewing, 0.8) * (1 - 0) }}>
        <Serif size={44} italic weight={600}>la couture</Serif>
      </div>
      <Scroll x={px - 150} y={pairY - 175} w={300} h={350} at={T3.sewing + 0.2} dur={1.4} lines={6} verse seed={61} scale={sc} />
      <div style={{ position: 'absolute', left: px - 150, top: capY, width: 300, textAlign: 'center', opacity: p(t, T3.sewing + 0.6, 0.8) }}>
        <Serif size={44} italic weight={600}>le poème</Serif>
      </div>
      <SvgLayer>
        <line x1={stationX(0)} x2={stationX(5)} y1={sy} y2={sy} stroke={C.cream} strokeOpacity={0.14} strokeWidth={3} strokeDasharray="10 9"
          opacity={p(t, T3.step1 - 0.4, 0.8)} />
        <Thread d={`M${stationX(0)} ${sy}L${stationX(5)} ${sy}`} k={run} width={4.5} dash={[14, 10]} glow needle />
        {STEPS.map((s, i) => {
          const k = p(t, STEP_AT[i], 0.6, eb);
          const lit = clamp((run * 5 - i) * 1.4);
          return (
            <g key={i} transform={`translate(${stationX(i)} ${sy - 74}) scale(${k})`} opacity={clamp(k * 2)}>
              <circle r={64} fill="rgba(5,8,22,0.55)" stroke={C.gold} strokeWidth={2.4} strokeOpacity={0.5 + 0.5 * lit} />
              {lit > 0 && <circle r={64 + 10 * lit} fill="none" stroke={C.gold} strokeWidth={2} strokeOpacity={0.3 * lit} />}
              <StepIcon i={i} k={k} />
              <circle cx={0} cy={74} r={7} fill={C.gold} />
            </g>
          );
        })}
      </SvgLayer>
      {STEPS.map((s, i) => {
        const k = p(t, STEP_AT[i] + 0.1, 0.6, eo);
        return (
          <div key={i} style={{ position: 'absolute', left: stationX(i) - 135, top: sy + 22, width: 270, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 12}px)` }}>
            <Label size={20} color={C.creamDim} ls="0.2em" style={{ marginBottom: 2 }}>{i + 1}</Label>
            <Serif size={s.fr.length > 11 ? 38 : 46} weight={700}>{s.fr}</Serif>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 172, textAlign: 'center', opacity: finale, transform: `translateY(${(1 - finale) * 16}px)` }}>
        <Serif size={58} italic weight={500}>Son esprit de <span style={{ color: C.gold, fontWeight: 700 }}>terdji</span>, il l’a mis dans ses poèmes</Serif>
      </div>
    </Scene>
  );
};

// ================================================================== 16. IL MÉRITE UNE VIDÉO
const VideoCard: React.FC<{ x: number; y: number; w: number; h: number; at: number; name: string; sub?: string; done?: boolean; big?: boolean }> = ({
  x, y, w, h, at, name, sub, done, big,
}) => {
  const t = useT();
  const k = p(t, at, 0.9, eo);
  if (k <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
      <Plaque pad="0" color={done ? C.goldDeep : C.gold} fill={done ? 'rgba(8,6,6,0.5)' : 'rgba(40,16,8,0.6)'} style={{ width: w, height: h }}>
        <div style={{ position: 'absolute', left: 36, top: big ? 40 : 30, right: 36 }}>
          <Label size={big ? 20 : 16} color={done ? C.creamDim : C.gold} ls="0.26em">{done ? 'Vidéo réalisée' : 'À raconter'}</Label>
          <Serif size={big ? 76 : 40} weight={700} style={{ marginTop: big ? 18 : 10, lineHeight: 1.08 }}>{name}</Serif>
          {sub && <Serif size={big ? 46 : 32} italic weight={500} color={C.creamDim} style={{ marginTop: big ? 22 : 8 }}>{sub}</Serif>}
        </div>
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
          {done ? (
            <g transform={`translate(${w - 66} ${h - 62})`}>
              <circle r={26} fill="none" stroke={C.gold} strokeWidth={3} />
              <path d="M-11 0L-3 9L12 -9" fill="none" stroke={C.gold} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : (
            <g transform={`translate(${w - 110} ${h - 100})`}>
              <circle r={50} fill={C.gold} />
              <path d="M-15 -24L28 0L-15 24Z" fill="#1F0D09" />
            </g>
          )}
        </svg>
      </Plaque>
    </div>
  );
};

export const SceneEnding: React.FC = () => {
  const t = useT();
  const A = 170.0, B = 180.0;
  const tag = p(t, T3.important - 0.3, 1.0, eo);
  const star = p(t, T3.deserves - 0.4, 1.6, eo);
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.01}>
      <div style={{ position: 'absolute', left: 130, top: 186 }}>
        <FadeIn at={T3.v1 - 0.4}><Label>Déjà racontés</Label></FadeIn>
      </div>
      <VideoCard x={130} y={250} w={640} h={220} at={T3.v1 - 0.2} name="Cheikh Mhamed Belkacem" done />
      <VideoCard x={130} y={500} w={640} h={260} at={T3.v2 - 0.2} name="Sidi Mhamed Ben Abderrahmane El Azhari" done />
      <div style={{ position: 'absolute', left: 860, top: 186 }}>
        <FadeIn at={T3.deserves - 0.5}><Label color={C.gold}>Mérite vraiment une vidéo</Label></FadeIn>
      </div>
      <SvgLayer>
        <path d={star8Path(1690, 360, 70 * star, Math.PI / 8)} fill="none" stroke={C.gold} strokeOpacity={0.35 * star} strokeWidth={2.4} />
        <path d={star8Path(1690, 360, 52 * star)} fill="none" stroke={C.gold} strokeOpacity={0.5 * star} strokeWidth={2.4} />
      </SvgLayer>
      <VideoCard x={860} y={250} w={930} h={510} at={T3.deserves - 0.3} name="Cheikh Abderrahmane Bachtarzi" big />
      <div style={{ position: 'absolute', left: 896, top: 530, display: 'flex', gap: 22 }}>
        {[['Sa vie', T3.life], ['Sa carrière', T3.career], ['Ce qu’il a fait', T3.did]].map(([txt, at]) => {
          const k = p(t, at as number - 0.2, 0.7, eb);
          return (
            <div key={txt as string} style={{ opacity: clamp(k * 2), transform: `scale(${mix(0.6, 1, k)}) translateY(${(1 - k) * 16}px)` }}>
              <Plaque pad="14px 28px" color={C.gold}><Serif size={44} italic weight={600}>{txt as string}</Serif></Plaque>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 14}px)` }}>
        <Serif size={56} italic weight={500}>Un personnage <span style={{ color: C.gold, fontWeight: 700 }}>très, très important</span> — à lire, à exposer.</Serif>
      </div>
    </Scene>
  );
};
