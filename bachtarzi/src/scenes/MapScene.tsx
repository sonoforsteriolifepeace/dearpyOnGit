import React from 'react';
import {interpolate} from 'remotion';
import {C, F, ease, ramp} from '../theme';
import {Caption, Scene, useTime} from '../ui';

// Equirectangular projection, 40 px per degree.
const K = 40;
const LON0 = -4;
const LAT0 = 41;
type LL = [number, number];
const P = ([lon, lat]: LL): [number, number] => [(lon - LON0) * K, (LAT0 - lat) * K];
const path = (pts: LL[], close = true) =>
  'M' + pts.map((p) => P(p).map((v) => v.toFixed(1)).join(',')).join('L') + (close ? 'Z' : '');

// Stylised coastlines (approximate, simplified by hand).
const EUROPE: LL[] = [
  [-1.5, 50], [-1.5, 46], [-1.2, 44.5], [-1.8, 43.4], [-8, 43.7], [-9.3, 43], [-8.9, 38.7], [-8.9, 37],
  [-6.3, 36.8], [-5.6, 36.0], [-4.4, 36.7], [-2.1, 36.7], [-0.98, 37.6], [0.2, 38.8], [-0.37, 39.47],
  [0.5, 40.5], [2.2, 41.4], [3.2, 41.9], [3.0, 43.3], [4.5, 43.4], [6.0, 43.1], [7.3, 43.7], [8.8, 44.4],
  [10.2, 43.9], [10.5, 42.9], [11.1, 42.4], [12.3, 41.6], [13.5, 41.2], [14.3, 40.8], [14.9, 40.3],
  [15.7, 40.0], [16.1, 38.9], [15.6, 38.0], [16.1, 37.9], [16.6, 38.9], [17.1, 39.0], [16.5, 39.7],
  [17.2, 40.4], [18.5, 40.1], [18.0, 40.6], [16.0, 41.5], [14.0, 42.6], [13.6, 43.5], [12.3, 44.5],
  [12.4, 45.4], [13.7, 45.7], [14.5, 45.2], [15.2, 44.3], [16.5, 43.4], [18.5, 42.4], [19.4, 41.8],
  [19.4, 40.3], [20.2, 39.5], [21.1, 38.3], [21.7, 36.8], [22.5, 36.4], [23.0, 37.5], [24.0, 38.0],
  [22.9, 39.4], [23.8, 40.3], [26.0, 40.8], [26.2, 40.0], [26.8, 39.3], [27.0, 38.4], [27.3, 37.5],
  [28, 36.7], [30.6, 36.8], [32.5, 36.1], [34.0, 36.3], [36.2, 36.6], [35.9, 35.0], [35.5, 33.9],
  [35.0, 33], [34.4, 31.5],
];
const AFRICA_NORTH_COAST: LL[] = [
  [-5.9, 35.8], [-5.3, 35.9], [-3, 35.2], [-2, 35.1], [-0.6, 35.7], [1.3, 36.5], [3.0, 36.8], [5.08, 36.75],
  [6.6, 37.1], [7.75, 36.9], [9.8, 37.3], [11.0, 37.1], [10.5, 36.4], [11.1, 35.2], [10.76, 34.74],
  [10.1, 33.9], [11.1, 33.2], [13.2, 32.9], [15.1, 32.4], [15.6, 31.6], [16.6, 31.2], [18.5, 30.4],
  [20.0, 30.9], [20.07, 32.1], [21.5, 32.9], [22.6, 32.77], [23.97, 32.08], [25.2, 31.6], [27.2, 31.4],
  [29.0, 30.9], [29.9, 31.2], [31.0, 31.6], [32.3, 31.26], [33.0, 31.1], [34.2, 31.3],
];
const AFRICA_REST: LL[] = [
  [-6.8, 34], [-9.6, 30.4], [-13, 27.7], [-17, 21], [-17.5, 14.7], [-16.8, 12], [-15, 10], [-13, 8],
  [-11, 6.5], [-8, 4.5], [-4, 5], [0, 5.6], [3, 6.3], [6, 4.3], [9.5, 3.5], [9.8, 0], [10, -6], [40, -6],
  [42, -1], [46, 2], [51, 11.8], [45, 10.4], [43.2, 11.6], [41.2, 13.8], [39.45, 15.6], [38.6, 18],
  [37.2, 19.6], [35.5, 23.9], [33.8, 27.2], [32.55, 29.95], [32.7, 29.6], [33.5, 28.5], [34.3, 27.9],
  [34.6, 28.6], [34.9, 29.5], [35.0, 29.5], [34.8, 28.0], [35.6, 27.3], [36.5, 26], [37.5, 24.3],
  [39.1, 21.5], [40.5, 19], [41.8, 16.8], [42.7, 15.0], [43.3, 12.7], [45, 13], [48, 14], [52, 15.5],
  [55, 17], [57, 18.8], [59.8, 22.4], [62, 25], [62, 52], [-1.5, 52],
];
// Land: Europe westwards-to-east, then North African coast east-to-west, then the rest.
const LAND = [...EUROPE, ...[...AFRICA_NORTH_COAST].reverse(), ...AFRICA_REST];

const ISLANDS: LL[][] = [
  [[8.4, 41.1], [9.6, 41.1], [9.8, 40.5], [9.7, 39.2], [9.0, 38.9], [8.4, 39.1], [8.6, 40.5]],
  [[8.6, 42.0], [9.4, 43.0], [9.5, 42.0], [9.2, 41.4], [8.7, 41.6]],
  [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7], [14.3, 37.0], [12.6, 37.6]],
  [[23.5, 35.6], [26.3, 35.3], [26.2, 35.0], [24.0, 35.1]],
  [[32.3, 35.1], [34.6, 35.7], [33.9, 34.9], [32.9, 34.6]],
  [[2.4, 39.6], [3.4, 39.9], [3.3, 39.3], [2.7, 39.4]],
];
const INLAND_SEAS: LL[][] = [
  // Black Sea
  [[28.0, 41.6], [28.6, 44.2], [29.7, 45.3], [30.7, 46.5], [31.8, 46.6], [33.6, 46.0], [33.4, 44.5], [34.5, 44.5],
    [36.5, 45.3], [38.3, 46.9], [39.2, 47.1], [37.5, 44.8], [39.0, 44.3], [41.6, 41.6], [38.4, 40.9], [35.2, 42.0],
    [33.3, 42.0], [31.2, 41.1], [29.1, 41.2]],
  // Caspian
  [[47, 44], [49, 46.5], [53, 47], [53, 45], [51, 44], [51.3, 42.5], [53, 41], [54, 38], [53.9, 37], [50.5, 37],
    [49, 38], [49.5, 40.5], [48, 42.5]],
  // Persian Gulf
  [[48, 30], [50, 29.5], [51.5, 27.8], [54, 26.6], [56.3, 27.2], [56.5, 26.2], [56.3, 24.8], [54.5, 24.2], [52, 24],
    [51.6, 25.3], [51, 26], [50.2, 25.7], [50, 26.6], [49, 27.3], [48.4, 28.5]],
];
const NILE: LL[] = [
  [31.0, 31.5], [31.25, 30.05], [30.9, 28.0], [31.2, 27.2], [32.9, 24.1], [32.6, 22.0], [31.0, 21.6], [30.3, 19.9],
  [31.8, 18.6], [33.7, 17.6], [32.5, 15.6], [32.6, 12], [31.6, 9.5], [31, 6],
];
const BLUE_NILE: LL[] = [[32.5, 15.6], [33.6, 13.5], [34.4, 11.3], [36.5, 10.3], [37.2, 11.5]];

const PLACES = {
  kabylie: [4.2, 36.45] as LL,
  alger: [3.06, 36.75] as LL,
  caire: [31.26, 30.05] as LL,
  soudan: [25.3, 13.6] as LL,
};

// Journey legs: from, to, bend (perpendicular offset, fraction of length), start, end (s).
const LEGS: [LL, LL, number, number, number][] = [
  [PLACES.kabylie, PLACES.caire, -0.1, 3.0, 8.4],
  [PLACES.caire, PLACES.soudan, 0.18, 9.4, 13.4],
  [PLACES.soudan, PLACES.caire, 0.18, 14.0, 17.6],
  [PLACES.caire, PLACES.alger, 0.04, 18.4, 22.6],
];

const legPoint = (a: LL, b: LL, bend: number, u: number): [number, number] => {
  const [x0, y0] = P(a);
  const [x1, y1] = P(b);
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  const v = 1 - u;
  return [v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1];
};

// Camera keyframes: time, lon, lat, zoom.
const CAM: [number, number, number, number][] = [
  [0, 4.2, 36.0, 2.6],
  [2.8, 5.5, 35.4, 2.1],
  [8.2, 17.5, 31.5, 0.95],
  [9.4, 17.5, 31.0, 0.95],
  [13.4, 24, 21.5, 0.84],
  [17.6, 22, 23.5, 0.82],
  [20.0, 17, 31, 0.92],
  [23.0, 3.6, 36.2, 2.9],
  [26.0, 3.3, 36.4, 3.3],
];

const camera = (t: number) => {
  const times = CAM.map((k) => k[0]);
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease} as const;
  // Piecewise, eased per segment.
  let i = 0;
  while (i < CAM.length - 2 && t > times[i + 1]) i++;
  const [ta, la, pa, za] = CAM[i];
  const [tb, lb, pb, zb] = CAM[i + 1];
  const u = interpolate(t, [ta, tb], [0, 1], opts);
  const lon = la + (lb - la) * u;
  const lat = pa + (pb - pa) * u;
  const zoom = Math.exp(Math.log(za) + (Math.log(zb) - Math.log(za)) * u);
  return {xy: P([lon, lat]), zoom};
};

const Pin: React.FC<{at: LL; o: number; s: number; label: string; ar?: string; dx?: number; dy?: number; big?: boolean}> = ({
  at,
  o,
  s,
  label,
  ar,
  dx = 22,
  dy = -22,
  big,
}) => {
  if (o <= 0) return null;
  const [x, y] = P(at);
  const k = 1 / s;
  const fs = big ? 34 : 28;
  return (
    <g opacity={o} transform={`translate(${x},${y}) scale(${k})`}>
      <circle r={16 + 10 * (1 - o)} fill="none" stroke={C.red} strokeWidth={3} opacity={0.6} />
      <circle r={8} fill={C.red} stroke={C.parchment} strokeWidth={3} />
      <g transform={`translate(${dx},${dy})`}>
        <rect
          x={dx < 0 ? -(label.length * fs * 0.48 + 28) : 0}
          y={-fs - 4}
          width={label.length * fs * 0.48 + 28}
          height={ar ? fs * 2.6 : fs + 18}
          rx={8}
          fill={C.night}
          opacity={0.88}
        />
        <text
          x={dx < 0 ? -14 : 14}
          y={0}
          textAnchor={dx < 0 ? 'end' : 'start'}
          fontFamily={F.serif}
          fontWeight={700}
          fontSize={fs}
          fill={C.parchment}
        >
          {label}
        </text>
        {ar && (
          <text x={dx < 0 ? -14 : 14} y={fs * 1.25} textAnchor={dx < 0 ? 'end' : 'start'} fontFamily={F.arabic} fontSize={fs * 0.95} fill={C.gold}>
            {ar}
          </text>
        )}
      </g>
    </g>
  );
};

const LINES: [number, number, string][] = [
  [0.4, 3.0, "Tout commence avec Sidi M'hamed Ben Abderrahmane, un Kabyle."],
  [3.2, 8.8, "Il part étudier en Égypte, à la grande mosquée-université d'Al-Azhar."],
  [9.2, 13.8, "D'Al-Azhar, il part au Soudan…"],
  [14.0, 18.0, "…puis il revient à Al-Azhar."],
  [18.3, 22.8, 'Enfin, il rentre en Algérie.'],
  [23.0, 26.0, 'À Alger, il fonde la confrérie Rahmania.'],
];

export const MapScene: React.FC<{dur: number}> = ({dur}) => {
  const t = useTime();
  const {xy, zoom} = camera(t);
  const lw = 5 / zoom;

  const arrived = (i: number) => ramp(t, LEGS[i][4] - 0.2, LEGS[i][4] + 0.5);

  return (
    <Scene dur={dur}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect width={1920} height={1080} fill={C.sea} />
        <g transform={`translate(960,500) scale(${zoom}) translate(${-xy[0]},${-xy[1]})`}>
          {/* graticule */}
          {Array.from({length: 14}, (_, i) => -10 + i * 5).map((lon) => (
            <path key={`m${lon}`} d={path([[lon, 55], [lon, -10]], false)} stroke={C.gold} strokeWidth={1 / zoom} opacity={0.12} />
          ))}
          {Array.from({length: 13}, (_, i) => -5 + i * 5).map((lat) => (
            <path key={`p${lat}`} d={path([[-25, lat], [65, lat]], false)} stroke={C.gold} strokeWidth={1 / zoom} opacity={0.12} />
          ))}
          <path d={path(LAND)} fill={C.land} stroke="#9c845a" strokeWidth={2 / zoom} />
          {ISLANDS.map((isl, i) => (
            <path key={i} d={path(isl)} fill={C.land} stroke="#9c845a" strokeWidth={2 / zoom} />
          ))}
          {INLAND_SEAS.map((s, i) => (
            <path key={i} d={path(s)} fill={C.sea} stroke="#9c845a" strokeWidth={2 / zoom} />
          ))}
          <path d={path(NILE, false)} fill="none" stroke="#4d7fa3" strokeWidth={4 / zoom} strokeLinejoin="round" />
          <path d={path(BLUE_NILE, false)} fill="none" stroke="#4d7fa3" strokeWidth={3 / zoom} strokeLinejoin="round" />

          {/* region labels */}
          {(
            [
              ['MÉDITERRANÉE', [17.5, 35.2], C.parchmentDim, 30],
              ['ALGÉRIE', [2.5, 29.5], '#7d6640', 34],
              ['ÉGYPTE', [28.5, 26.5], '#7d6640', 34],
              ['SOUDAN', [29.5, 16.5], '#7d6640', 34],
              ['Nil', [33.6, 23.5], '#3c6a8c', 26],
              ['MER ROUGE', [37.2, 21.8], C.parchmentDim, 20],
            ] as [string, LL, string, number][]
          ).map(([label, at, color, fs]) => {
            const [x, y] = P(at);
            return (
              <text
                key={label}
                x={x}
                y={y}
                textAnchor="middle"
                fontFamily={F.sans}
                fontWeight={600}
                fontSize={fs / Math.sqrt(zoom)}
                letterSpacing={8 / zoom}
                fill={color}
                opacity={0.8}
                transform={label === 'MER ROUGE' ? `rotate(58 ${x} ${y})` : undefined}
              >
                {label}
              </text>
            );
          })}

          {/* journey */}
          {LEGS.map(([a, b, bend, ta, tb], i) => {
            const p = ramp(t, ta, tb);
            if (p <= 0) return null;
            const n = 80;
            const pts = Array.from({length: n + 1}, (_, k) => legPoint(a, b, bend, (k / n) * p));
            const d = 'M' + pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join('L');
            const head = pts[pts.length - 1];
            const settled = ramp(t, tb, tb + 1.2);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={C.parchment} strokeWidth={lw * 2.2} strokeLinecap="round" opacity={0.5} />
                <path
                  d={d}
                  fill="none"
                  stroke={C.red}
                  strokeWidth={lw}
                  strokeLinecap="round"
                  strokeDasharray={settled > 0 ? `${14 / zoom} ${10 / zoom}` : undefined}
                />
                {p < 1 && <circle cx={head[0]} cy={head[1]} r={10 / zoom} fill={C.red} stroke={C.parchment} strokeWidth={3 / zoom} />}
              </g>
            );
          })}

          <Pin at={PLACES.kabylie} o={ramp(t, 0.4, 1.2)} s={zoom} label="Kabylie" ar="القبائل" dx={22} dy={50} />
          <Pin at={PLACES.caire} o={arrived(0)} s={zoom} label="Le Caire · Al-Azhar" ar="الأزهر" dx={22} dy={-60} />
          <Pin at={PLACES.soudan} o={arrived(1)} s={zoom} label="Soudan" ar="السودان" dx={-22} dy={-30} />
          <Pin at={PLACES.alger} o={arrived(3)} s={zoom} label="Alger · Belcourt" ar="الجزائر" dx={-22} dy={-50} big />
        </g>
      </svg>

      {/* foundation badge */}
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 260,
          opacity: ramp(t, 23.4, 24.4),
          transform: `scale(${0.9 + 0.1 * ramp(t, 23.4, 24.6)})`,
          padding: '26px 40px',
          borderRadius: 16,
          background: 'rgba(11,20,32,0.9)',
          border: `2px solid ${C.gold}`,
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: F.sans, fontSize: 20, letterSpacing: 4, color: C.gold}}>FONDATION</div>
        <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 54, color: C.parchment}}>La Rahmania</div>
        <div style={{fontFamily: F.arabic, fontSize: 44, color: C.gold}}>الطريقة الرحمانية</div>
      </div>
      <Caption lines={LINES} />
    </Scene>
  );
};
