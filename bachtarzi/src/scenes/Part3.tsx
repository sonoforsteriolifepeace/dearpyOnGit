import React from 'react';
import {C, F, easeOut, ramp} from '../theme';
import {Caption, Draw, Scene, Stitches, octagram, useTime} from '../ui';

export const Terdji: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const chips = [
    {main: '« Terdji »', sub: 'son surnom'},
    {main: 'Khayat · خيّاط', sub: 'tailleur'},
    {main: 'Couturier', sub: 'son métier'},
  ];
  return (
    <Scene dur={dur}>
      <div style={{position: 'absolute', top: 180, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: F.sans, fontSize: 22, letterSpacing: 5, color: C.gold, opacity: ramp(t, 0.3, 1)}}>ON L'APPELLE</div>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 104, color: C.parchment, opacity: ramp(t, 0.6, 1.6)}}>Abderrahmane Ben Memmach</div>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <Stitches x1={420} x2={1500} y={360} p={ramp(t, 1.4, 3.6)} />
      </svg>
      <div style={{position: 'absolute', top: 440, width: '100%', display: 'flex', justifyContent: 'center', gap: 40}}>
        {chips.map((c, i) => {
          const o = ramp(t, 3.4 + i * 0.7, 4.2 + i * 0.7);
          return (
            <div
              key={i}
              style={{
                opacity: o,
                transform: `translateY(${(1 - ramp(t, 3.4 + i * 0.7, 4.6 + i * 0.7, easeOut)) * 30}px)`,
                padding: '24px 44px',
                borderRadius: 14,
                border: `2px dashed ${C.gold}`,
                background: 'rgba(214,170,92,0.08)',
                textAlign: 'center',
              }}
            >
              <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 54, color: C.parchment}}>{c.main}</div>
              <div style={{fontFamily: F.sans, fontSize: 18, letterSpacing: 4, color: C.gold}}>{c.sub.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', textAlign: 'center', opacity: ramp(t, 7.4, 8.4)}}>
        <div style={{fontFamily: F.serif, fontSize: 40, color: C.parchmentDim}}>
          <span style={{color: C.gold, fontWeight: 700}}>Bach-Tarzi</span> : du turc <i>baş</i> (chef) et <i>terzi</i> (tailleur)
        </div>
      </div>
      <Caption
        lines={[
          [0.3, 4.4, 'Pourquoi aime-t-il tant le chiffre, la mesure ?'],
          [4.6, 13, "Parce qu'il était couturier : « terdji », « khayat ». Il cousait."],
        ]}
      />
    </Scene>
  );
};

const TIERS = [
  {fr: 'Les deys', dz: 'dayat', w: 360},
  {fr: 'Les bachaghas', dz: 'bachaghawat', w: 620},
  {fr: 'Les aghas', dz: 'aghawat', w: 880},
  {fr: 'Les khodjas', dz: 'khoudjat', w: 1140},
];

export const Clients: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const h = 110;
  const top = 200;
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <pattern id="brocade" width={40} height={40} patternUnits="userSpaceOnUse">
            <rect width={40} height={40} fill={C.velvet} />
            <path d={octagram(20, 20, 10)} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.5} />
          </pattern>
        </defs>
        {/* "le public": dimmed, struck through */}
        <g opacity={ramp(t, 0.4, 1.2) * (1 - 0.6 * ramp(t, 5.4, 6.2))}>
          <rect x={960 - 700} y={top + 4 * h + 30} width={1400} height={h - 20} rx={6} fill="none" stroke={C.parchmentDim} strokeWidth={2} strokeDasharray="10 10" />
          <text x={960} y={top + 4 * h + 98} textAnchor="middle" fontFamily={F.serif} fontWeight={700} fontSize={42} fill={C.parchmentDim}>
            le public
          </text>
        </g>
        <Draw d={`M${960 - 260},${top + 4 * h + 75} L${960 + 260},${top + 4 * h + 75}`} p={ramp(t, 5.2, 6.0)} stroke={C.red} strokeWidth={6} />
        {/* pyramid, built bottom → top */}
        {TIERS.map((tier, i) => {
          const row = i; // deys on top
          const at = 6.0 + (3 - row) * 0.8;
          const o = ramp(t, at, at + 0.7);
          const y = top + row * h;
          const wTop = TIERS[Math.max(0, i - 1)].w * (i === 0 ? 0.55 : 1);
          const wb = tier.w;
          const d = `M${960 - wTop / 2},${y} L${960 + wTop / 2},${y} L${960 + wb / 2},${y + h - 8} L${960 - wb / 2},${y + h - 8} Z`;
          return (
            <g key={i} opacity={o} transform={`translate(0,${(1 - ramp(t, at, at + 0.8, easeOut)) * 30})`}>
              <path d={d} fill="url(#brocade)" stroke={C.gold} strokeWidth={2.5} />
              <text x={960} y={y + h / 2 + 4} textAnchor="middle" fontFamily={F.serif} fontWeight={700} fontSize={i === 0 ? 38 : 42} fill={C.parchment}>
                {tier.fr}
              </text>
              <text x={960} y={y + h / 2 + 34} textAnchor="middle" fontFamily={F.sans} fontSize={17} letterSpacing={3} fill={C.gold}>
                {tier.dz.toUpperCase()}
              </text>
            </g>
          );
        })}
        <text x={960} y={top - 40} textAnchor="middle" fontFamily={F.sans} fontSize={22} letterSpacing={5} fill={C.gold} opacity={ramp(t, 9.4, 10.2)}>
          LA HAUTE CLASSE DU POUVOIR TURC À ALGER
        </text>
      </svg>
      <Caption
        lines={[
          [0.3, 5.6, "Mais il ne cousait pas pour le public."],
          [5.8, 13, 'Il cousait pour le pouvoir turc d’Alger : khodjas, aghas, bachaghas… jusqu’aux deys.'],
        ]}
      />
    </Scene>
  );
};

/** Kaftan front, centred at origin, roughly 520 × 400. */
const KAFTAN = 'M-70,-170 Q0,-128 70,-170 L150,-150 L262,-30 L222,22 L140,-46 L196,230 L-196,230 L-140,-46 L-222,22 L-262,-30 L-150,-150 Z';
const FRONT = 'M-70,-170 Q0,-128 70,-170 L22,230 L-22,230 Z';
const SLEEVE = 'M0,0 L210,-40 L230,60 L20,90 Q-10,45 0,0 Z';

const Dim: React.FC<{x1: number; y1: number; x2: number; y2: number; label: string; o: number}> = ({x1, y1, x2, y2, label, o}) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  return (
    <g opacity={o} stroke={C.red} strokeWidth={2} fill={C.red}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <circle cx={x1} cy={y1} r={4} />
      <circle cx={x2} cy={y2} r={4} />
      <text
        x={vertical ? mx - 14 : mx}
        y={vertical ? my : my - 12}
        textAnchor={vertical ? 'end' : 'middle'}
        stroke="none"
        fontFamily={F.sans}
        fontWeight={600}
        fontSize={22}
      >
        {label}
      </text>
    </g>
  );
};

export const Measure: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const tape = ramp(t, 0.8, 3.0);
  const words = ['Mesure', 'Plan · patron', 'Technique'];
  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <pattern id="grid" width={30} height={30} patternUnits="userSpaceOnUse">
            <path d="M30,0 L0,0 L0,30" fill="none" stroke="#b9a77f" strokeWidth={1} />
          </pattern>
        </defs>
        <g opacity={ramp(t, 0.2, 0.9)}>
          <rect x={140} y={150} width={1060} height={700} rx={10} fill={C.parchment} />
          <rect x={140} y={150} width={1060} height={700} rx={10} fill="url(#grid)" opacity={0.6} />
        </g>
        {/* tape measure */}
        <g>
          <rect x={160} y={176} width={1020 * tape} height={40} fill="#e6c54f" stroke="#8a6d1e" strokeWidth={2} />
          {Array.from({length: 51}, (_, i) => {
            const x = 160 + i * 20;
            if (x > 160 + 1020 * tape) return null;
            return (
              <g key={i}>
                <line x1={x} y1={176} x2={x} y2={176 + (i % 5 === 0 ? 20 : 10)} stroke="#3a2c08" strokeWidth={2} />
                {i % 5 === 0 && i > 0 && (
                  <text x={x} y={210} textAnchor="middle" fontFamily={F.sans} fontSize={14} fill="#3a2c08">
                    {i * 2}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        {/* pattern pieces */}
        <g transform="translate(470,520) scale(0.95)">
          <Draw d={KAFTAN} p={ramp(t, 3.0, 6.0)} stroke={C.ink} strokeWidth={3} strokeDasharray="12 8" />
          <path d={KAFTAN} fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="12 8" opacity={ramp(t, 5.8, 6.0)} />
          <Draw d={FRONT} p={ramp(t, 4.6, 6.4)} stroke={C.ink} strokeWidth={1.5} />
          <Dim x1={-196} y1={262} x2={196} y2={262} label="112" o={ramp(t, 6.2, 6.8)} />
          <Dim x1={-300} y1={-170} x2={-300} y2={230} label="128" o={ramp(t, 6.6, 7.2)} />
          <Dim x1={-70} y1={-200} x2={70} y2={-200} label="38" o={ramp(t, 7.0, 7.6)} />
        </g>
        <g transform="translate(880,430)">
          <Draw d={SLEEVE} p={ramp(t, 5.2, 7.0)} stroke={C.ink} strokeWidth={3} />
          <Dim x1={0} y1={130} x2={230} y2={100} label="62" o={ramp(t, 7.2, 7.8)} />
        </g>
        <text x={670} y={830} textAnchor="middle" fontFamily={F.sans} fontSize={18} letterSpacing={4} fill="#6d5a36" opacity={ramp(t, 6.4, 7)}>
          PATRON · CAFTAN, DEVANT ET MANCHE
        </text>
      </svg>
      <div style={{position: 'absolute', left: 1280, top: 250, width: 520}}>
        {words.map((w, i) => (
          <div
            key={i}
            style={{
              opacity: ramp(t, 8.0 + i * 0.8, 8.7 + i * 0.8),
              transform: `translateX(${(1 - ramp(t, 8.0 + i * 0.8, 9.0 + i * 0.8, easeOut)) * 40}px)`,
              fontFamily: F.serif,
              fontWeight: 700,
              fontSize: 62,
              color: C.parchment,
              borderLeft: `4px solid ${C.gold}`,
              paddingLeft: 28,
              marginBottom: 30,
            }}
          >
            {w}
          </div>
        ))}
        <div style={{opacity: ramp(t, 10.6, 11.4), fontFamily: F.serif, fontStyle: 'italic', fontSize: 44, color: C.gold, marginTop: 30, paddingLeft: 32}}>
          → un technicien,
          <br />
          pas seulement un lettré
        </div>
      </div>
      <Caption
        lines={[
          [0.3, 4.6, 'La couture est une science : il y apprend la mesure.'],
          [4.8, 9.6, 'Il raisonne comme un concepteur : il fait un plan, il fait des patrons.'],
          [9.8, 14, "Ce n'est pas seulement un lettré, ni un fellah : c'est un technicien."],
        ]}
      />
    </Scene>
  );
};

const STEPS = ['Plan · patron', 'Tissu', 'Superpositions', 'Garnitures', 'Finitions'];
const STEP_AT = (k: number) => 2.0 + k * 3.2;

export const Couture: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const s = STEPS.map((_, k) => ramp(t, STEP_AT(k), STEP_AT(k) + 1.6));
  const active = STEPS.reduce((acc, _, k) => (t >= STEP_AT(k) ? k : acc), -1);
  const verses = Array.from({length: 7}, (_, i) => i);
  const panel = {x: 1150, y: 290, w: 560, h: 530};
  const buttons = Array.from({length: 7}, (_, i) => i);
  return (
    <Scene dur={dur}>
      {/* step chips */}
      <div style={{position: 'absolute', top: 120, width: '100%', display: 'flex', justifyContent: 'center', gap: 18}}>
        {STEPS.map((label, k) => {
          const on = k === active;
          const done = k < active;
          return (
            <div
              key={k}
              style={{
                opacity: ramp(t, 0.4 + k * 0.15, 1.0 + k * 0.15),
                padding: '12px 26px',
                borderRadius: 40,
                border: `2px solid ${on ? C.gold : 'rgba(214,170,92,0.35)'}`,
                background: on ? C.gold : done ? 'rgba(214,170,92,0.15)' : 'transparent',
                color: on ? C.night : C.parchment,
                fontFamily: F.serif,
                fontWeight: 700,
                fontSize: 34,
              }}
            >
              <span style={{fontFamily: F.sans, fontSize: 20, marginRight: 10, opacity: 0.8}}>{k + 1}</span>
              {label}
            </div>
          );
        })}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {/* ——— garment ——— */}
        <g transform="translate(560,560) scale(1.05)">
          <Draw d={KAFTAN} p={s[0]} stroke={C.parchment} strokeWidth={3} strokeDasharray="12 8" />
          <path d={KAFTAN} fill={C.velvet} opacity={s[1]} />
          <path d={KAFTAN} fill="none" stroke="#9e3a4c" strokeWidth={3} opacity={s[1]} />
          {/* layers: inner gilet and cuffs */}
          <g opacity={s[2]}>
            <path d={FRONT} fill="#24395a" />
            <path d="M262,-30 L222,22 L196,-4 L236,-54 Z" fill="#24395a" />
            <path d="M-262,-30 L-222,22 L-196,-4 L-236,-54 Z" fill="#24395a" />
          </g>
          {/* garnitures: gold braid along the opening, neckline and hem */}
          <Draw d="M-70,-170 L-22,230" p={s[3]} stroke={C.gold} strokeWidth={8} />
          <Draw d="M70,-170 L22,230" p={s[3]} stroke={C.gold} strokeWidth={8} />
          <Draw d="M-70,-170 Q0,-128 70,-170" p={s[3]} stroke={C.gold} strokeWidth={8} />
          <Draw d="M-196,224 L196,224" p={s[3]} stroke={C.gold} strokeWidth={6} />
          {Array.from({length: 9}, (_, i) => {
            const u = (i + 0.5) / 9;
            const o = ramp(s[3], u * 0.8, u * 0.8 + 0.2);
            return (
              <g key={i} opacity={o}>
                <circle cx={-70 + 48 * u - 22} cy={-170 + 400 * u} r={9} fill="none" stroke={C.gold} strokeWidth={3} />
                <circle cx={70 - 48 * u + 22} cy={-170 + 400 * u} r={9} fill="none" stroke={C.gold} strokeWidth={3} />
              </g>
            );
          })}
          {/* finitions: buttons and visible stitching */}
          {buttons.map((i) => (
            <circle key={i} cx={0} cy={-120 + i * 46} r={8} fill={C.gold} stroke={C.night} strokeWidth={2} opacity={ramp(s[4], i * 0.1, i * 0.1 + 0.25)} />
          ))}
          <Draw d={KAFTAN} p={s[4]} stroke={C.parchment} strokeWidth={1.6} strokeDasharray="6 8" opacity={0.7} />
        </g>
        <text x={560} y={872} textAnchor="middle" fontFamily={F.serif} fontWeight={700} fontSize={40} fill={C.parchment}>
          La couture <tspan fontFamily={F.arabic} fill={C.gold} fontWeight={400}>· الخياطة</tspan>
        </text>

        {/* ——— approx sign ——— */}
        <text x={960} y={590} textAnchor="middle" fontFamily={F.serif} fontSize={120} fill={C.gold} opacity={ramp(t, 1.0, 2.0)}>
          ≈
        </text>

        {/* ——— poem ——— */}
        <g>
          <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx={8} fill={C.parchment} opacity={0.08 + 0.92 * s[1]} />
          {verses.map((i) => {
            const y = panel.y + 70 + i * 60;
            const header = i === 0 || i === 4;
            const lineCol = C.ink;
            const xr = panel.x + panel.w - 50;
            const xl = panel.x + 50;
            const half = 205;
            return (
              <g key={i}>
                {header ? (
                  <>
                    <line x1={panel.x + 160} x2={panel.x + panel.w - 160} y1={y} y2={y} stroke={s[1] > 0 ? lineCol : C.parchment} strokeWidth={8} strokeLinecap="round" strokeDasharray={s[1] > 0.5 ? undefined : '10 10'} opacity={s[0]} />
                    <path d={octagram(panel.x + 130, y, 16)} fill="none" stroke={C.red} strokeWidth={2} opacity={s[3]} />
                    <path d={octagram(panel.x + panel.w - 130, y, 16)} fill="none" stroke={C.red} strokeWidth={2} opacity={s[3]} />
                  </>
                ) : (
                  <>
                    {/* superposition: shaded band behind each group */}
                    <rect x={panel.x + 30} y={y - 22} width={panel.w - 60} height={44} rx={6} fill={C.gold} opacity={0.22 * s[2] * (i % 2 ? 1 : 0.6)} />
                    <line x1={xr} x2={xr - half} y1={y} y2={y} stroke={s[1] > 0.5 ? lineCol : C.parchment} strokeWidth={5} strokeLinecap="round" strokeDasharray={s[1] > 0.5 ? undefined : '8 10'} opacity={ramp(s[0], i * 0.1, i * 0.1 + 0.3)} />
                    <line x1={xl + 30} x2={xl + half} y1={y} y2={y} stroke={s[1] > 0.5 ? lineCol : C.parchment} strokeWidth={5} strokeLinecap="round" strokeDasharray={s[1] > 0.5 ? undefined : '8 10'} opacity={ramp(s[0], i * 0.1, i * 0.1 + 0.3)} />
                    <circle cx={xl + 8} cy={y} r={9} fill={C.red} opacity={s[3]} />
                  </>
                )}
              </g>
            );
          })}
          {/* finition: frame and closing seal */}
          <Draw d={`M${panel.x + 14},${panel.y + 14} h${panel.w - 28} v${panel.h - 28} h${-(panel.w - 28)} Z`} p={s[4]} stroke={C.gold} strokeWidth={4} />
          <Draw d={`M${panel.x + 24},${panel.y + 24} h${panel.w - 48} v${panel.h - 48} h${-(panel.w - 48)} Z`} p={s[4]} stroke={C.red} strokeWidth={1.5} />
          <g opacity={ramp(s[4], 0.6, 1)}>
            <circle cx={panel.x + panel.w / 2} cy={panel.y + panel.h - 44} r={16} fill={C.red} />
            <path d={octagram(panel.x + panel.w / 2, panel.y + panel.h - 44, 14)} fill="none" stroke={C.parchment} strokeWidth={1.2} />
          </g>
        </g>
        <text x={panel.x + panel.w / 2} y={872} textAnchor="middle" fontFamily={F.serif} fontWeight={700} fontSize={40} fill={C.parchment}>
          Le poème <tspan fontFamily={F.arabic} fill={C.gold} fontWeight={400}>· النظم</tspan>
        </text>
      </svg>
      <Caption
        lines={[
          [0.3, 5.8, "Sa façon d'écrire ressemble à la couture."],
          [6.0, 14.6, 'Un plan, un patron, un tissu, des superpositions, des garnitures, des finitions…'],
          [14.8, 22, "Son esprit de terdji, de couturier, il l'a mis dans ses poèmes."],
        ]}
      />
    </Scene>
  );
};

