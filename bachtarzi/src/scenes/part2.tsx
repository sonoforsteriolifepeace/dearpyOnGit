import React from 'react';
import { getPointAtLength, getLength } from '@remotion/paths';
import { C, FONT, H, W } from '../theme';
import { cue } from '../script';
import { clamp, eb, eio, eo, mix, p, rand, useT, win } from '../anim';
import {
  Ar, FadeIn, Label, Pin, Plaque, Rise, Scene, Serif, Strike, SvgLayer, Thread, TimedThread, circlePath, star8Path,
} from '../kit';
import { Kid, Medal, Scroll } from '../shapes';

export const T2 = {
  write: cue(2, "Parce qu'il s'est mis à écrire"),
  author: cue(2, 'un auteur'),
  receives: cue(2, 'qui reçoit'),
  courses: cue(2, 'Ces cours-là'),
  rewritten: cue(2, 'il les a réécrits'),
  qasayed: cue(2, 'qasayed'),
  poetry: cue(2, "la poésie, c'est ce que"),
  easy: cue(2, 'facile à mémoriser'),
  fiqh: cue(2, 'fiqh'),
  hadith: cue(2, 'du hadith'),
  sira: cue(2, 'de la sira'),
  sounna: cue(2, 'de la sounna'),
  qawaid: cue(2, "des qawa'id"),
  kids: cue(2, 'enfants en bas âge'),
  method: cue(2, 'même méthode'),
  keep: cue(2, 'garder la Tariqa'),
  rules: cue(2, 'les règles'),
  cheikh: cue(2, "ce qu'il a appris de son cheikh"),
};

// ================================================================== 6. IL S'EST MIS À ÉCRIRE
const FLOURISH =
  'M330 468C470 420 560 520 700 468S880 420 960 470S1130 530 1230 470C1290 430 1360 440 1390 480' +
  'C1415 515 1360 535 1345 500C1330 465 1400 430 1470 455S1580 500 1620 470';

export const SceneWrite: React.FC = () => {
  const t = useT();
  const A = 66.8, B = 78.4;
  const k = p(t, T2.write + 0.5, 3.6, eio);
  const len = React.useMemo(() => getLength(FLOURISH), []);
  const pen = getPointAtLength(FLOURISH, len * clamp(k)) ?? { x: 0, y: 0 };
  const penOp = clamp(k * 10) * (1 - p(t, T2.write + 4.6, 0.6));
  const plaqueK = p(t, T2.author - 0.2, 1.0, eb);
  return (
    <Scene a={A} b={B} fadeIn={0.9} fadeOut={0.7}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 205, textAlign: 'center' }}>
        <Rise at={T2.write - 0.1}><Serif size={104} italic weight={500}>Il s’est mis à <span style={{ color: C.gold, fontWeight: 700 }}>écrire</span></Serif></Rise>
      </div>
      <SvgLayer>
        <Thread d={FLOURISH} k={k} width={5} dash={null} needle={false} glow />
        <g transform={`translate(${pen.x} ${pen.y}) rotate(28)`} opacity={penOp}>
          <path d="M0 0L-9 -22L9 -22Z" fill={C.cream} />
          <rect x={-9} y={-120} width={18} height={98} fill={C.gold} />
          <rect x={-9} y={-120} width={18} height={14} fill={C.goldDeep} />
          <line x1={0} y1={0} x2={0} y2={-22} stroke="#0B1E1B" strokeWidth={2} />
        </g>
      </SvgLayer>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center' }}>
        <div style={{ opacity: clamp(plaqueK * 2), transform: `scale(${mix(0.8, 1, plaqueK)})` }}>
          <Plaque pad="22px 90px 26px" color={C.gold} fill="rgba(6,8,22,0.55)">
            <Label size={22} style={{ textAlign: 'center' }}>Il devient</Label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 36, justifyContent: 'center' }}>
              <Serif size={120} weight={700}>Auteur</Serif>
              <Ar size={104} color={C.gold}>مؤلِّف</Ar>
            </div>
            <Serif size={36} italic weight={500} color={C.creamDim} style={{ textAlign: 'center', marginTop: 2 }}>dans la Tariqa Rahmania</Serif>
          </Plaque>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 862, textAlign: 'center' }}>
        <FadeIn at={T2.receives - 0.2} dy={14}>
          <Serif size={50} weight={500} color={C.creamDim}>plus seulement quelqu’un qui <Strike at={T2.receives + 0.5} color={C.terra}>reçoit</Strike></Serif>
        </FadeIn>
      </div>
    </Scene>
  );
};

// ================================================================== 7. COURS → QASAYED
export const SceneVerse: React.FC = () => {
  const t = useT();
  const A = 78.0, B = 90.4;
  const rows = React.useMemo(() => {
    const r = rand(21);
    return Array.from({ length: 9 }, (_, i) => ({ w: i === 8 ? 0.55 : 0.82 + r() * 0.18 }));
  }, []);
  const reK = p(t, T2.rewritten - 0.4, 1.7, eio);
  const arrow = 'M806 560L1088 560M1062 534L1092 560L1062 586';
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.8}>
      {/* carte de cours */}
      <div style={{ position: 'absolute', left: 150, top: 330 }}>
        <FadeIn at={T2.courses - 0.3}>
          <div style={{ position: 'relative', width: 620, height: 470, background: 'rgba(8,10,28,0.62)', border: `2px solid ${C.creamSoft}`, padding: '48px 50px' }}>
            {rows.map((r, i) => {
              const gone = p(t, T2.rewritten + i * 0.22, 0.6);
              return (
                <div key={i} style={{ height: 8, width: `${r.w * 100}%`, borderRadius: 4, background: C.cream, opacity: mix(0.75, 0.12, gone), marginBottom: 33 }} />
              );
            })}
          </div>
        </FadeIn>
      </div>
      <div style={{ position: 'absolute', left: 150, top: 205, width: 620 }}>
        <FadeIn at={T2.courses - 0.1}>
          <Label size={22} color={C.creamDim} ls="0.22em">Les cours de son cheikh</Label>
          <Serif size={44} weight={600} style={{ marginTop: 8 }}>Sidi Mhamed Ben Abderrahmane</Serif>
        </FadeIn>
      </div>
      <SvgLayer>
        <Thread d={arrow} k={reK} width={5} dash={[16, 11]} glow needle={reK < 1} />
      </SvgLayer>
      <div style={{ position: 'absolute', left: 790, top: 600, width: 320, textAlign: 'center' }}>
        <FadeIn at={T2.rewritten + 0.1} dy={10}><Serif size={42} italic weight={500} color={C.gold}>réécrits</Serif></FadeIn>
      </div>
      {/* le poème */}
      <Scroll x={1180} y={250} w={560} h={600} at={T2.rewritten + 0.5} dur={2.2} title="قصائد" titleSize={84} lines={8} verse seed={31} />
      <div style={{ position: 'absolute', left: 1130, top: 880, width: 660, textAlign: 'center' }}>
        <FadeIn at={T2.qasayed - 0.2}>
          <Serif size={56} italic weight={600}>qasayed <span style={{ color: C.creamDim, fontWeight: 500 }}>· poèmes</span></Serif>
        </FadeIn>
      </div>
    </Scene>
  );
};

// ================================================================== 8. LA POÉSIE ENSEIGNE, ELLE SE RETIENT
export const ScenePoetry: React.FC = () => {
  const t = useT();
  const A = 90.0, B = 99.4;
  const N = 16, step = 0.32, t0 = T2.poetry + 0.6;
  const x0 = 330, x1 = 1590, y = 690;
  const dx = (x1 - x0) / (N - 1 + 1.4);
  const px = (i: number) => x0 + i * dx + (i >= 8 ? dx * 1.4 : 0);
  const pos = (t - t0) / step;
  const done = p(t, t0 + N * step, 0.6);
  const mem = p(t, T2.easy - 0.1, 1.2, eo);
  // balle : arc entre le point i et le point i+1
  const ballI = clamp(Math.floor(pos), 0, N - 1);
  const frac = clamp(pos - ballI);
  const bx = mix(px(ballI), px(Math.min(N - 1, ballI + 1)), frac);
  const by = y - 18 - 64 * Math.sin(Math.PI * frac);
  const ballOp = p(t, t0 - 0.3, 0.3) * (1 - p(t, t0 + N * step - 0.1, 0.3));
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.8}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 215, textAlign: 'center' }}>
        <Rise at={T2.poetry - 0.2}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 44 }}>
            <Serif size={130} italic weight={600}>La poésie</Serif>
            <Ar size={140} color={C.gold}>الشعر</Ar>
          </div>
        </Rise>
        <FadeIn at={T2.poetry + 0.7} style={{ marginTop: 18 }}>
          <Serif size={50} weight={500} color={C.creamDim}>ce que les Arabes utilisaient autrefois <span style={{ color: C.cream, fontStyle: 'italic' }}>pour enseigner</span></Serif>
        </FadeIn>
      </div>
      <SvgLayer>
        <line x1={x0 - 60} x2={x1 + 60} y1={y + 34} y2={y + 34} stroke={C.cream} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="10 9" />
        {Array.from({ length: N }, (_, i) => {
          const hit = t - (t0 + i * step);
          const lit = hit >= 0 ? 1 : 0;
          const pulse = hit >= 0 && hit < 0.5 ? 1 - hit / 0.5 : 0;
          const r = 17 + pulse * 7 + mem * 3;
          return (
            <g key={i}>
              {pulse > 0 && <circle cx={px(i)} cy={y} r={r + 22 * (1 - pulse)} fill="none" stroke={C.gold} strokeOpacity={pulse * 0.7} strokeWidth={2} />}
              <circle cx={px(i)} cy={y} r={r} fill={lit ? C.gold : 'rgba(243,233,209,0.16)'} />
              {mem > 0 && <circle cx={px(i)} cy={y} r={r + 14 * mem} fill="none" stroke={C.gold} strokeOpacity={0.35 * mem} strokeWidth={2} />}
            </g>
          );
        })}
        <path d={star8Path((px(7) + px(8)) / 2, y, 14)} fill={C.goldDeep} opacity={p(t, t0, 0.5)} />
        <circle cx={bx} cy={by} r={13} fill={C.cream} opacity={ballOp} />
        <circle cx={bx} cy={by} r={30} fill={C.gold} opacity={ballOp * 0.2} />
      </SvgLayer>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', opacity: mem, transform: `translateY(${(1 - mem) * 14}px)` }}>
        <Plaque pad="14px 56px" style={{ display: 'inline-block' }}>
          <Serif size={50} italic weight={600}>facile à <span style={{ color: C.gold }}>mémoriser</span></Serif>
        </Plaque>
      </div>
    </Scene>
  );
};

// ================================================================== 9. LES DOMAINES, LES ENFANTS
const DOMAINS = [
  { ar: 'فقه', fr: 'Fiqh', gloss: 'Jurisprudence', at: T2.fiqh },
  { ar: 'حديث', fr: 'Hadith', gloss: 'Paroles du Prophète', at: T2.hadith },
  { ar: 'سيرة', fr: 'Sira', gloss: 'Vie du Prophète', at: T2.sira },
  { ar: 'سُنّة', fr: 'Sounna', gloss: 'Tradition prophétique', at: T2.sounna },
  { ar: 'قواعد', fr: 'Qawa’id', gloss: 'Règles', at: T2.qawaid },
];

export const SceneDomains: React.FC = () => {
  const t = useT();
  const A = 99.0, B = 110.6;
  const up = p(t, T2.kids - 0.5, 1.2, eio);
  const tileW = 290, gap = 36, total = 5 * tileW + 4 * gap, left = (W - total) / 2;
  const scale = mix(1, 0.62, up);
  const cy = mix(560, 400, up);
  const kidsK = p(t, T2.kids, 0.8, eo);
  const kids = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.8}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center', opacity: 1 - up }}>
        <FadeIn at={T2.fiqh - 0.9}><Label>Dans tous les domaines</Label></FadeIn>
      </div>
      {DOMAINS.map((d, i) => {
        const k = p(t, d.at - 0.1, 0.8, eb);
        const x = left + i * (tileW + gap);
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: cy - 220, width: tileW, height: 440, opacity: clamp(k * 2.5),
            transform: `translateY(${(1 - k) * 60}px) scale(${scale})`, transformOrigin: `${tileW / 2}px ${220 + (560 - cy) * 0}px`,
          }}>
            <Plaque pad="0" color={C.gold} style={{ width: tileW, height: 440 }}>
              <svg width={tileW} height={440} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                <path d={star8Path(tileW / 2, 120, 58)} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2} />
                <path d={star8Path(tileW / 2, 120, 84, Math.PI / 8)} fill="none" stroke={C.gold} strokeOpacity={0.16} strokeWidth={2} />
              </svg>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center' }}><Ar size={104} color={C.gold} style={{ lineHeight: 1.25 }}>{d.ar}</Ar></div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center' }}>
                <Serif size={60} weight={700}>{d.fr}</Serif>
                <Label size={20} color={C.creamDim} ls="0.12em" style={{ marginTop: 14, padding: '0 14px', lineHeight: 1.5 }}>{d.gloss}</Label>
              </div>
            </Plaque>
          </div>
        );
      })}
      {/* enfants */}
      <SvgLayer>
        {kids.map(i => {
          const kx = 330 + i * 157;
          const kk = p(t, T2.kids + 0.1 + i * 0.09, 0.6, eb);
          const talk = Math.max(0, Math.sin(t * 7.5 + i * 1.7)) * (t > T2.kids + 1 ? 1 : 0);
          return (
            <g key={i} opacity={clamp(kk * 2)} transform={`translate(0 ${(1 - kk) * 30})`}>
              <Kid x={kx} y={950 - 82} s={1.55 + ((i * 37) % 5) * 0.08} color={i % 3 === 0 ? C.gold : C.cream} bob={Math.sin(t * 4 + i) * 2} mouth={talk} />
              {[0, 1].map(j => (
                <path key={j} d={`M${kx + 30 + j * 14} ${950 - 82 - 80 - 12 - j * 6}q${10 + j * 5} ${12 + j * 6} 0 ${24 + j * 12}`}
                  fill="none" stroke={C.gold} strokeWidth={3.4} strokeLinecap="round" opacity={clamp(talk * 1.6 - j * 0.5) * 0.85} />
              ))}
            </g>
          );
        })}
      </SvgLayer>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 622, textAlign: 'center' }}>
        <FadeIn at={T2.kids + 0.2}>
          <Serif size={60} italic weight={500}>enseignés aux <span style={{ color: C.gold, fontWeight: 700 }}>enfants en bas âge</span>…</Serif>
          <Serif size={40} weight={500} color={C.creamDim} style={{ marginTop: 10 }}>avec la poésie</Serif>
        </FadeIn>
      </div>
    </Scene>
  );
};

// ================================================================== 10. GARDER LA TARIQA
export const SceneKeep: React.FC = () => {
  const t = useT();
  const A = 110.2, B = 120.6;
  const cx = 960, cy = 540;
  const ring = p(t, T2.keep - 0.5, 2.2, eo);
  const appearA = p(t, T2.rules - 0.3, 0.8, eo), flyA = p(t, T2.rules + 1.1, 0.9, eio);
  const appearB = p(t, T2.cheikh - 0.3, 0.8, eo), flyB = p(t, T2.cheikh + 1.3, 0.9, eio);
  const absorbB = flyB;
  const glow = absorbB;
  return (
    <Scene a={A} b={B} fadeIn={0.8} fadeOut={0.8}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center' }}>
        <Rise at={T2.method - 0.2}><Serif size={66} italic weight={500}>la même méthode pour <span style={{ color: C.gold, fontWeight: 700 }}>garder la Tariqa</span></Serif></Rise>
      </div>
      <SvgLayer>
        {glow > 0 && <circle cx={cx} cy={cy + 20} r={330} fill={C.gold} opacity={0.1 * glow} />}
        <g transform={`rotate(${t * 2.2} ${cx} ${cy + 20})`}>
          <path d={star8Path(cx, cy + 20, 300)} fill="none" stroke={C.gold} strokeWidth={3} strokeOpacity={0.9}
            strokeDasharray={2800} strokeDashoffset={2800 * (1 - ring)} />
        </g>
        <path d={circlePath(cx, cy + 20, 345)} fill="none" stroke={C.creamSoft} strokeWidth={3} strokeLinecap="round" strokeDasharray="3 14" opacity={ring} />
      </SvgLayer>
      <Scroll x={cx - 190} y={cy - 195} w={380} h={430} at={T2.method} dur={1.4} lines={6} verse seed={44} title="الطريقة" titleSize={62} />
      {/* puces qui viennent se verser dans le poème */}
      <Chip x={mix(270, cx, flyA)} y={cy + 20} appear={appearA} fly={flyA} text="Les règles" ar="قواعد" />
      <Chip x={mix(1640, cx, flyB)} y={cy + 20} appear={appearB} fly={flyB} text="Ce qu’il a appris de son cheikh" ar="" wide />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 898, textAlign: 'center', opacity: glow }}>
        <Serif size={42} italic weight={500} color={C.creamDim}>règles et enseignement du cheikh, <span style={{ color: C.gold }}>mis en vers</span></Serif>
      </div>
    </Scene>
  );
};

const Chip: React.FC<{ x: number; y: number; appear: number; fly: number; text: string; ar: string; wide?: boolean }> = ({ x, y, appear, fly, text, ar, wide }) => {
  const k = appear * (1 - clamp(fly * 1.25));
  if (k <= 0.01) return null;
  const w = wide ? 400 : 270;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - 52, width: w, opacity: clamp(k * 2), transform: `scale(${mix(1, 0.35, fly) * mix(0.7, 1, appear)})` }}>
      <Plaque pad="16px 20px" style={{ textAlign: 'center' }}>
        {ar && <Ar size={44} color={C.gold} style={{ display: 'block' }}>{ar}</Ar>}
        <Serif size={wide ? 34 : 40} weight={700}>{text}</Serif>
      </Plaque>
    </div>
  );
};
