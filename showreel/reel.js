'use strict';
// ISTR showreel — deterministic 15 s motion piece. render(T) draws frame at time T (seconds).
// Cut grid: 120 BPM, one beat = 0.5 s, one bar = 2 s.

const W = 1920, H = 1080, DUR = 15, TAU = Math.PI * 2;
const main = document.getElementById('c');
const mctx = main.getContext('2d');
let ctx = mctx;

const C = {
  bg: '#0B0B0E', ink: '#F2EEE4', acc: '#FF4A1C', dark: '#0B0B0E', paper: '#EFEAE0',
  panel: '#141418',
};

// ---------- math ----------
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  o3: k => 1 - Math.pow(1 - k, 3),
  o5: k => 1 - Math.pow(1 - k, 5),
  i3: k => k * k * k,
  io3: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  oExpo: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k),
  iExpo: k => k <= 0 ? 0 : Math.pow(2, 10 * k - 10),
  ioExpo: k => k <= 0 ? 0 : k >= 1 ? 1 : k < .5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2,
  oBack: k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  ioSine: k => -(Math.cos(Math.PI * k) - 1) / 2,
};
function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const decay = (t, at, rate) => t < at ? 0 : Math.exp(-(t - at) * rate);

// ---------- drawing helpers ----------
function bg(col) { ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); }
function F(px, o = {}) { return { px, fam: o.fam || 'Archivo', wt: o.wt || 900, st: o.st || 'normal', it: !!o.it }; }
function setF(o) {
  const fam = o.fam === 'Archivo' ? 'Archivo' : `"${o.fam}"`;
  ctx.font = `${o.it ? 'italic ' : ''}${o.wt} ${o.px}px ${fam}`;
  ctx.fontStretch = o.st;
}
const mono = (px, wt = 400) => F(px, { fam: 'JetBrains Mono', wt });
const serif = (px, it = true) => F(px, { fam: 'Instrument Serif', wt: 400, it });

function text(s, x, y, font, o = {}) {
  ctx.save();
  ctx.globalAlpha *= (o.alpha ?? 1);
  setF(font);
  ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  if (o.fill !== null) { ctx.fillStyle = o.fill || C.ink; ctx.fillText(s, x, y); }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.restore();
}
function measure(s, font, ls = 0) {
  ctx.save(); setF(font); ctx.letterSpacing = ls + 'px';
  const m = ctx.measureText(s); ctx.restore();
  return { w: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
}
function fit(s, font, maxW, ls = 0) {
  const w = measure(s, font, ls).w;
  return w > maxW ? { ...font, px: font.px * maxW / w } : font;
}
function layout(s, font, ls = 0) {
  ctx.save(); setF(font); ctx.letterSpacing = '0px';
  const ch = [...s];
  const ws = ch.map(c => ctx.measureText(c).width);
  const cap = ctx.measureText('H').actualBoundingBoxAscent;
  ctx.restore();
  const total = ws.reduce((a, b) => a + b, 0) + ls * (ch.length - 1);
  let x = 0;
  const out = ch.map((c, i) => { const o = { c, x, w: ws[i] }; x += ws[i] + ls; return o; });
  return { ch: out, total, cap };
}
// Per-letter masked reveal. dir 1 = rise from below, -1 = drop from above.
function reveal(s, x, base, font, o = {}) {
  const t = o.t, L = layout(s, font, o.ls || 0);
  const x0 = o.align === 'left' ? x : o.align === 'right' ? x - L.total : x - L.total / 2;
  const dur = o.dur ?? .45, st = o.stagger ?? .035, delay = o.delay || 0, dir = o.dir || 1;
  const ease = o.ease || E.oExpo;
  setF(font);
  for (let i = 0; i < L.ch.length; i++) {
    const c = L.ch[i];
    const k = ease(P(t, delay + i * st, delay + i * st + dur));
    if (k <= 0 || c.c === ' ') continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0 + c.x - 30, base - L.cap * 1.45, c.w + 60, L.cap * 1.75);
    ctx.clip();
    ctx.translate(0, dir * (1 - k) * L.cap * 1.5);
    setF(font); ctx.letterSpacing = '0px'; ctx.textAlign = 'left';
    if (o.fill !== null) { ctx.fillStyle = o.fill || C.ink; ctx.fillText(c.c, x0 + c.x, base); }
    if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 3; ctx.strokeText(c.c, x0 + c.x, base); }
    ctx.restore();
  }
  return L;
}
function typeOn(s, x, y, font, t, a, cps, o = {}) {
  const n = Math.floor(cl((t - a) * cps, 0, s.length));
  if (n <= 0) return;
  const cursor = n < s.length ? '▌' : '';
  text(s.slice(0, n) + cursor, x, y, font, o);
}
function line(x1, y1, x2, y2, col, lw = 1, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function arrowHead(x, y, ang, sz, col) {
  ctx.save(); ctx.fillStyle = col; ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-sz, -sz * .55); ctx.lineTo(-sz, sz * .55); ctx.closePath(); ctx.fill(); ctx.restore();
}
function arc(x1, y1, x2, y2, r1, r2, col, lw = 1.5) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const sx = x1 + Math.cos(a) * r1, sy = y1 + Math.sin(a) * r1;
  const ex = x2 - Math.cos(a) * r2, ey = y2 - Math.sin(a) * r2;
  line(sx, sy, ex, ey, col, lw);
  arrowHead(ex, ey, a, 9, col);
}
function check(x, y, s, col, lw = 3) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * .5, y); ctx.lineTo(x - s * .12, y + s * .38); ctx.lineTo(x + s * .55, y - s * .4); ctx.stroke(); ctx.restore();
}

// ---------- buffers ----------
function mkBuf() { const c = document.createElement('canvas'); c.width = W; c.height = H; return { c, g: c.getContext('2d') }; }
const B1 = mkBuf();
function drawTo(b, fn) {
  const prev = ctx; ctx = b.g;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.save(); fn(); ctx.restore();
  ctx = prev;
}

// ================= SCENE 1 — SIGNAL (0–2) =================
function s1(t) {
  bg(C.bg);
  const cx = W / 2, cy = H / 2;
  const ga = .09 * E.o3(P(t, .2, .9)) * (1 - P(t, 1.75, 1.95));
  if (ga > 0) {
    ctx.save(); ctx.strokeStyle = C.ink; ctx.globalAlpha = ga; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) { const x = 160 + i * 100; ctx.moveTo(x, 240); ctx.lineTo(x, 840); }
    for (let j = 0; j <= 6; j++) { const y = 240 + j * 100; ctx.moveTo(160, y); ctx.lineTo(1760, y); }
    ctx.stroke();
    ctx.globalAlpha = ga * 2.2; ctx.beginPath();
    for (let i = 0; i <= 80; i++) { const x = 160 + i * 20; ctx.moveTo(x, cy - 6); ctx.lineTo(x, cy + 6); }
    for (let j = 0; j <= 30; j++) { const y = 240 + j * 20; ctx.moveTo(cx - 6, y); ctx.lineTo(cx + 6, y); }
    ctx.stroke(); ctx.restore();
  }
  // heartbeat rings
  for (const b of [0, .5, 1.0]) {
    const k = P(t, b, b + .7);
    if (t >= b && k < 1) {
      ctx.save(); ctx.strokeStyle = C.acc; ctx.globalAlpha = (1 - k) * .8; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 10 + 300 * E.oExpo(k), 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  const pulse = decay(t, 0, 9) + decay(t, .5, 9) + decay(t, 1, 9);
  ctx.save(); ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(cx, cy, 7 + 12 * pulse, 0, TAU); ctx.fill(); ctx.restore();

  // square-wave clock signal drawn outward from center, frequency climbing
  const reach = 880 * E.io3(P(t, .5, 1.5));
  const amp = 110 * (1 - E.io3(P(t, 1.5, 1.75)));
  if (reach > 1) {
    ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 3.5; ctx.lineJoin = 'miter';
    ctx.shadowColor = C.acc; ctx.shadowBlur = 22;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for (let d = 0; d <= reach; d += 1.5) {
        const u = d / 880;
        const ph = TAU * (u * 3 + u * u * u * 16) - t * 9;
        const y = cy - amp * (Math.sin(ph) >= 0 ? 1 : -1) * side;
        ctx.lineTo(cx + side * d, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    for (const side of [-1, 1]) {
      ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = C.acc; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(cx + side * reach, cy, 6, 0, TAU); ctx.fill(); ctx.restore();
    }
  }
  // labels
  const la = E.o3(P(t, .35, .7)) * (1 - P(t, 1.7, 1.85));
  if (la > 0) {
    const f = mono(17, 500);
    text('CH1 · CLK · 5 V/div', 160, 212, f, { alpha: la, fill: C.ink, ls: 2 });
    const hz = Math.round(1 + 4999 * E.iExpo(P(t, .5, 1.75)));
    text(`f = ${hz.toLocaleString('fr-FR')} Hz`, 1760, 212, f, { alpha: la, fill: C.acc, ls: 2, align: 'right' });
    text(`t = ${t.toFixed(3)} s`, 160, 882, f, { alpha: la, ls: 2 });
    text('TRIG ▲ RISE · 1 ms/div', 1760, 882, f, { alpha: la * .6, ls: 2, align: 'right' });
  }
  // collapse to a bar that floods the frame
  const fl = E.iExpo(P(t, 1.72, 2.0));
  if (fl > 0) {
    const h = lerp(4, H * 1.3, fl);
    ctx.save(); ctx.fillStyle = C.ink; ctx.shadowColor = C.acc; ctx.shadowBlur = 40;
    ctx.fillRect(cx - reach - 40 * fl, cy - h / 2, (reach + 40 * fl) * 2, h); ctx.restore();
  }
}

// ================= SCENE 2 — TEMPS RÉEL (2–4) =================
function s2core(u) {
  const flip = u >= 1.0;
  bg(flip ? C.acc : C.bg);
  const f1 = F(300, { st: 'expanded' });
  const y1 = 505, y2 = 815, ls = -8;
  if (!flip) {
    const s = 1 + .05 * u;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
    reveal('TEMPS', W / 2, y1, f1, { t: u, delay: 0, stagger: .04, dur: .5, ls });
    reveal('RÉEL', W / 2, y2, f1, { t: u, delay: .5, stagger: .04, dur: .5, ls, fill: C.acc, dir: -1 });
    const rl = E.oExpo(P(u, .15, .7));
    line(W / 2 - 800 * rl, 568, W / 2 + 800 * rl, 568, C.ink, 2, .5);
    const f = mono(18, 500);
    typeOn('[01] SYSTÈMES', 160, 190, f, u, .1, 40, { ls: 3 });
    typeOn('t ∈ ℝ⁺ · Δt → 0', 1760, 190, f, u, .35, 40, { ls: 3, align: 'right', fill: C.acc });
    typeOn('INGÉNIERIE DES SYSTÈMES TEMPS RÉEL — M2', W / 2, 940, f, u, .55, 70, { ls: 5, align: 'center', alpha: .7 });
    ctx.restore();
  } else {
    const v = u - 1;
    const off = 760 * E.oExpo(P(v, 0, .5)) + 260 * v;
    const L1 = layout('TEMPS', f1, ls), L2 = layout('RÉEL', f1, ls);
    const sp = 110;
    for (let k = -4; k <= 4; k++) {
      const xA = W / 2 + k * (L1.total + sp) - off;
      const xB = W / 2 + k * (L2.total + sp) + off;
      const filled = k === 0;
      text('TEMPS', xA, y1, f1, { align: 'center', ls, fill: filled ? C.dark : null, stroke: filled ? null : C.dark, lw: 3 });
      text('RÉEL', xB, y2, f1, { align: 'center', ls, fill: filled ? C.dark : null, stroke: filled ? null : C.dark, lw: 3 });
    }
    line(0, 568, W, 568, C.dark, 3);
    const f = mono(18, 700);
    text('RÉACTIVITÉ', 160, 190, f, { ls: 4, fill: C.dark });
    text('CONTRAINTES TEMPORELLES', 1760, 190, f, { ls: 4, fill: C.dark, align: 'right' });
    text('← T →', W / 2, 940, f, { ls: 8, fill: C.dark, align: 'center' });
  }
}
function s2(u) {
  if (u < 1.5) { s2core(u); return; }
  drawTo(B1, () => s2core(u));
  bg(C.bg);
  const n = 8, sh = H / n;
  for (let i = 0; i < n; i++) {
    const d = 1.5 + (i % 4) * .03 + Math.floor(i / 4) * .015;
    const k = E.iExpo(P(u, d, d + .38));
    const dx = (i % 2 ? 1 : -1) * k * W * 1.15;
    ctx.save(); ctx.globalAlpha = .25;
    ctx.drawImage(B1.c, 0, i * sh, W, sh, dx * .85, i * sh, W, sh); ctx.restore();
    ctx.drawImage(B1.c, 0, i * sh, W, sh, dx, i * sh, W, sh);
  }
}

// ================= SCENE 3 — 4 BLOCS (4–6) =================
const BLOCS = [
  { n: 'COMMANDE', code: 'EIEAT3F1 · 3E1 · 4D1', ue: ['Commande linéaire avancée', 'Analyse & commande des STR', 'Mise en œuvre des commandes'] },
  { n: 'AUTONOMIE', code: 'EIEAT3D3 · 3E4 · 4D4', ue: ['Modèles temporels avancés', 'Contrôle et simulation', 'Diagnostic et supervision'] },
  { n: 'RÉACTIVITÉ', code: 'EIEAT3D2 · 3E2 · 4D2', ue: ['Techniques pour le temps réel', 'Conception des STR', 'Réseaux temps réel'] },
  { n: 'FIABILITÉ', code: 'EIEAT3D4 · 3E3 · 4D3', ue: ['Sûreté de fonctionnement', 'Vérification et validation', 'Tolérance aux fautes'] },
];
function visCommande(bx, by, bw, bh, v) {
  const gy = by + bh - 20, top = by + 60;
  line(bx + 10, by + 10, bx + 10, gy, C.ink, 1.5, .35);
  line(bx + 10, gy, bx + bw, gy, C.ink, 1.5, .35);
  ctx.save(); ctx.setLineDash([6, 6]); line(bx + 10, top, bx + bw, top, C.ink, 1.5, .5); ctx.restore();
  text('r(t)', bx + bw, top - 12, mono(13), { align: 'right', alpha: .6 });
  const k = E.io3(P(v, 0, 1.1));
  ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 3.5; ctx.beginPath();
  let hx = bx + 10, hy = gy;
  for (let s = 0; s <= k; s += .004) {
    const y = 1 - Math.exp(-4.2 * s) * Math.cos(15 * s);
    hx = bx + 10 + s * (bw - 10); hy = gy - y * (gy - top);
    s === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
  }
  ctx.stroke(); ctx.restore();
  if (k > 0) { ctx.fillStyle = C.acc; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, TAU); ctx.fill(); }
  text('y(t)', bx + 22, by + 22, mono(13), { alpha: .6, fill: C.acc });
}
function visAutonomie(bx, by, bw, bh, v) {
  const p = [[bx + 50, by + 150], [bx + 173, by + 55], [bx + 296, by + 150]];
  const tr = [[bx + 111, by + 102], [bx + 234, by + 102], [bx + 173, by + 205]];
  const path = [p[0], tr[0], p[1], tr[1], p[2], tr[2], p[0]];
  const s = ((v * .9) % 1 + 1) % 1;
  const seg = s * 6, si = Math.floor(seg), sf = seg - si;
  const lit = si % 2 === 0 ? -1 : (si - 1) / 2;
  for (let i = 0; i < 6; i++) {
    const a = path[i], b = path[i + 1];
    arc(a[0], a[1], b[0], b[1], i % 2 ? 8 : 24, i % 2 ? 24 : 10, 'rgba(242,238,228,.55)', 1.5);
  }
  for (const q of p) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q[0], q[1], 22, 0, TAU); ctx.stroke(); ctx.restore(); }
  tr.forEach((q, i) => {
    const on = decay(sf + (lit === i ? 0 : 9), 0, 1) * (lit === i ? 1 : 0);
    ctx.fillStyle = on ? C.acc : C.ink;
    const a = Math.atan2(path[i * 2 + 2][1] - path[i * 2][1], path[i * 2 + 2][0] - path[i * 2][0]) + Math.PI / 2;
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(a); ctx.fillRect(-4, -18, 8, 36); ctx.restore();
  });
  const a = path[si], b = path[si + 1];
  const tx = lerp(a[0], b[0], E.io3(sf)), ty = lerp(a[1], b[1], E.io3(sf));
  ctx.save(); ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(tx, ty, 8, 0, TAU); ctx.fill(); ctx.restore();
  ['P1', 'P2', 'P3'].forEach((n, i) => text(n, p[i][0], p[i][1] + 44, mono(12), { align: 'center', alpha: .55 }));
}
function visReact(bx, by, bw, bh, v) {
  const per = [118, 170, 250], wd = [30, 52, 74];
  ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  for (let r = 0; r < 3; r++) {
    const y = by + 30 + r * 68;
    line(bx, y + 40, bx + bw, y + 40, C.ink, 1, .25);
    const scroll = v * 150;
    for (let k = -1; k < 6; k++) {
      const x = bx + k * per[r] - (scroll % per[r]) + r * 22;
      ctx.fillStyle = r === 0 ? C.acc : r === 1 ? C.ink : 'rgba(242,238,228,.35)';
      ctx.fillRect(x, y, wd[r], 36);
      line(x, y + 46, x, y - 6, C.ink, 1, .5);
    }
    text(`τ${r + 1}`, bx + 4, y + 26, mono(13, 700), { fill: r === 0 ? C.dark : C.dark, alpha: 0 });
  }
  ctx.restore();
  const dx = bx + bw * .78;
  ctx.save(); ctx.setLineDash([5, 5]); line(dx, by, dx, by + bh - 10, C.acc, 2); ctx.restore();
  text('D', dx + 8, by + 16, mono(14, 700), { fill: C.acc });
}
function visFiab(bx, by, bw, bh, v) {
  const fault = v > .75;
  const vx = bx + 238, vy = by + 120;
  for (let i = 0; i < 3; i++) {
    const y = by + 22 + i * 72;
    const bad = fault && i === 1;
    ctx.save();
    if (bad) { ctx.fillStyle = C.acc; ctx.fillRect(bx + 10, y, 100, 50); }
    ctx.strokeStyle = bad ? C.acc : C.ink; ctx.lineWidth = 2; ctx.strokeRect(bx + 10, y, 100, 50); ctx.restore();
    text(bad ? 'M2 ✕' : `M${i + 1}`, bx + 60, y + 32, mono(16, 700), { align: 'center', fill: bad ? C.dark : C.ink });
    ctx.save(); if (bad) ctx.setLineDash([4, 6]);
    arc(bx + 110, y + 25, vx, vy, 0, 30, bad ? C.acc : 'rgba(242,238,228,.6)', 1.5); ctx.restore();
    if (!bad) {
      const s = (v * 1.4 + i * .17) % 1;
      const px = lerp(bx + 110, vx - 30, s), py = lerp(y + 25, vy, s);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, TAU); ctx.fill();
    }
  }
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(vx, vy, 30, 0, TAU); ctx.stroke(); ctx.restore();
  text('2/3', vx, vy + 6, mono(15, 700), { align: 'center' });
  arc(vx + 30, vy, bx + bw - 6, vy, 0, 0, C.ink, 2);
  if (fault) {
    const k = E.oBack(P(v, .9, 1.2));
    ctx.save(); ctx.translate(bx + bw - 20, vy - 40); ctx.scale(k, k); check(0, 0, 26, C.acc, 4); ctx.restore();
  }
}
const VIS = [visCommande, visAutonomie, visReact, visFiab];

function s3(u) {
  bg(C.bg);
  const mx = 120, gap = 24, pw = (W - 2 * mx - 3 * gap) / 4, py = 262, ph = 628;
  // header
  reveal('SPÉCIALISATIONS', mx, 205, F(78, { st: 'expanded' }), { t: u, align: 'left', stagger: .018, dur: .4, ls: -2 });
  typeOn('M2 · CHOISIR 3 BLOCS PARMI 4 · 9 ECTS CHACUN', W - mx, 150, mono(17, 500), u, .15, 70, { align: 'right', ls: 3, alpha: .7 });
  const kk = E.oBack(P(u, 1.05, 1.35));
  if (kk > 0) {
    ctx.save(); ctx.translate(W - mx, 205); ctx.scale(kk, kk);
    text('3 / 4', 0, 0, F(64, { st: 'expanded' }), { align: 'right', fill: C.acc }); ctx.restore();
  }
  const selT = [1.1, null, 1.25, 1.4];
  const dim = E.o3(P(u, 1.52, 1.72));
  for (let i = 0; i < 4; i++) {
    const x = mx + i * (pw + gap), d = i * .08;
    const k = E.oExpo(P(u, d, d + .55));
    if (k <= 0) continue;
    const yOff = (1 - k) * 120;
    const isDim = selT[i] === null;
    ctx.save();
    ctx.globalAlpha = (isDim ? 1 - .72 * dim : 1);
    ctx.translate(0, yOff);
    ctx.beginPath(); ctx.rect(x, py, pw, ph * k); ctx.clip();
    ctx.fillStyle = C.panel; ctx.fillRect(x, py, pw, ph);
    ctx.strokeStyle = 'rgba(242,238,228,.16)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + .75, py + .75, pw - 1.5, ph - 1.5);
    const ca = E.o3(P(u, d + .18, d + .5));
    ctx.globalAlpha *= ca;
    text(`0${i + 1}`, x + 28, py + 46, mono(18, 700), { fill: C.acc, ls: 2 });
    const nf = fit(BLOCS[i].n, F(52, { st: 'semi-expanded' }), pw - 56, -1);
    text(BLOCS[i].n, x + 28, py + 122, nf, { ls: -1 });
    VIS[i](x + 28, py + 165, pw - 56, 240, u - d - .2);
    BLOCS[i].ue.forEach((s, j) => {
      const yy = py + 462 + j * 44;
      line(x + 28, yy - 28, x + pw - 28, yy - 28, C.ink, 1, .14);
      text('—  ' + s, x + 28, yy, mono(15, 400), { alpha: .82 });
    });
    text('3 SOUS-UE · 9 ECTS', x + 28, py + ph - 28, mono(12, 500), { alpha: .4, ls: 2 });
    text(BLOCS[i].code, x + pw - 28, py + ph - 28, mono(12, 500), { align: 'right', alpha: .4, ls: 1 });
    ctx.restore();
    // selection state
    if (selT[i] !== null && u >= selT[i]) {
      const s = E.oExpo(P(u, selT[i], selT[i] + .3));
      ctx.fillStyle = C.acc; ctx.fillRect(x, py + yOff, pw * s, 8);
      const b = E.oBack(P(u, selT[i], selT[i] + .25));
      ctx.save(); ctx.translate(x + pw - 44, py + yOff + 42); ctx.scale(b, b);
      ctx.fillStyle = C.acc; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill();
      check(0, 0, 17, C.dark, 3); ctx.restore();
      const g = decay(u, selT[i], 6);
      if (g > .01) { ctx.save(); ctx.strokeStyle = C.acc; ctx.globalAlpha = g; ctx.lineWidth = 4; ctx.strokeRect(x - 6 * (1 - g), py + yOff - 6 * (1 - g), pw + 12 * (1 - g), ph + 12 * (1 - g)); ctx.restore(); }
    }
    if (isDim && dim > 0) {
      line(x + 20, py + ph / 2 + 20, x + 20 + (pw - 40) * dim, py + ph / 2 - 20, C.acc, 4);
    }
  }
  // wipe to paper
  const lead = E.ioExpo(P(u, 1.62, 1.92)), pap = E.ioExpo(P(u, 1.7, 2.0));
  const slant = 260;
  const wipe = (k, col) => {
    if (k <= 0) return;
    const xe = W + slant - (W + slant * 2) * k;
    ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(xe, -10); ctx.lineTo(W + 400, -10); ctx.lineTo(W + 400, H + 10); ctx.lineTo(xe - slant, H + 10); ctx.closePath(); ctx.fill();
  };
  wipe(lead, C.acc); wipe(pap, C.paper);
}

// ================= SCENE 4 — ORDONNANCEMENT (6–8) =================
const TASKS = [{ C: 1, T: 4 }, { C: 2, T: 6 }, { C: 3, T: 12 }];
const SCHED = (() => {
  const rem = [0, 0, 0], segs = [[], [], []]; let miss = 0;
  for (let t = 0; t < 24; t++) {
    TASKS.forEach((k, i) => { if (t % k.T === 0) { if (rem[i] > 0) miss++; rem[i] = k.C; } });
    const i = rem.findIndex(r => r > 0);
    if (i >= 0) {
      rem[i]--;
      const s = segs[i];
      if (s.length && s[s.length - 1][1] === t) s[s.length - 1][1] = t + 1; else s.push([t, t + 1]);
    }
  }
  return { segs, miss };
})();
function hatch(x, y, w, h, col) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = -h; i < w; i += 12) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); }
  ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, h); ctx.restore();
}
function s4(u) {
  bg(C.paper);
  const s = 1.07 - .07 * E.o3(P(u, 0, 2));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.rotate(-.012 * (1 - E.o3(P(u, 0, 2)))); ctx.translate(-W / 2, -H / 2);
  const out = g => (g % 2 ? 1 : -1) * W * 1.2 * E.iExpo(P(u, 1.68 + g * .035, 1.98));
  const X0 = 330, X1 = 1800, U = (X1 - X0) / 24;
  const rows = [405, 540, 675], bh = 72;
  const p = 24 * E.ioSine(P(u, .18, 1.62));
  const px = X0 + p * U;

  ctx.save(); ctx.translate(out(0), 0);
  reveal('ORDONNANCEMENT', 120, 205, F(90, { st: 'expanded' }), { t: u, align: 'left', stagger: .02, dur: .4, ls: -3, fill: C.dark });
  typeOn('EIEAT3D2 · TECHNIQUES POUR LE TEMPS RÉEL — RATE MONOTONIC, n = 3', 122, 258, mono(17, 500), u, .2, 90, { fill: C.dark, ls: 2, alpha: .75 });
  const U_ = TASKS.reduce((a, k) => a + k.C / k.T, 0);
  text(`U = Σ Cᵢ/Tᵢ = ${U_.toFixed(3)}`, 1800, 150, mono(22, 700), { fill: C.dark, align: 'right', alpha: E.o3(P(u, .3, .6)) });
  if (p >= 23.9) {
    const k = E.oBack(P(u, 1.62, 1.85));
    ctx.save(); ctx.translate(1800, 205); ctx.scale(k, k);
    text(`✓ ${SCHED.miss} ÉCHÉANCE MANQUÉE`, 0, 0, mono(22, 700), { fill: C.acc, align: 'right' }); ctx.restore();
  } else {
    text(`t = ${p.toFixed(2)}`, 1800, 205, mono(22, 500), { fill: C.dark, align: 'right', alpha: .6 * E.o3(P(u, .3, .6)) });
  }
  ctx.restore();

  // grid + axis
  ctx.save(); ctx.translate(out(4), 0);
  const ga = E.o3(P(u, .05, .4));
  for (let i = 0; i <= 24; i++) {
    const x = X0 + i * U;
    line(x, 350, x, 745, C.dark, 1, (i % 2 ? .06 : .12) * ga);
    line(x, 760, x, i % 2 ? 768 : 776, C.dark, 2, ga);
    if (i % 2 === 0) text(String(i), x, 804, mono(15, 500), { fill: C.dark, align: 'center', alpha: ga });
  }
  line(X0, 760, X0 + 24 * U * E.oExpo(P(u, .05, .6)), 760, C.dark, 2.5);
  text('t', X1 + 24, 766, serif(34), { fill: C.dark });
  ctx.restore();

  const cols = [C.dark, C.acc, C.dark];
  rows.forEach((y, r) => {
    ctx.save(); ctx.translate(out(r + 1), 0);
    const ra = E.o3(P(u, .1 + r * .06, .45 + r * .06));
    ctx.globalAlpha = ra;
    text(`τ${r + 1}`, 120, y + 18, F(54, { st: 'normal' }), { fill: C.dark });
    text(`C=${TASKS[r].C}  T=${TASKS[r].T}`, 190, y + 16, mono(14, 500), { fill: C.dark, alpha: .6 });
    line(X0, y + bh / 2 + 4, X1, y + bh / 2 + 4, C.dark, 1, .2);
    ctx.globalAlpha = 1;
    // jobs up to playhead
    ctx.save(); ctx.beginPath(); ctx.rect(X0 - 2, y - 80, Math.max(0, px - X0 + 2), 180); ctx.clip();
    for (const [a, b] of SCHED.segs[r]) {
      const x = X0 + a * U + 1.5, w = (b - a) * U - 3;
      if (r === 2) hatch(x, y - bh / 2, w, bh, C.dark);
      else { ctx.fillStyle = cols[r]; ctx.fillRect(x, y - bh / 2, w, bh); }
    }
    ctx.restore();
    // releases (↑) and deadlines (▼)
    for (let rt = 0; rt <= 24; rt += TASKS[r].T) {
      if (p < rt - .001) continue;
      const k = E.oBack(cl((p - rt) / 1.2));
      const x = X0 + rt * U;
      line(x, y + bh / 2 + 10, x, y + bh / 2 + 10 - 90 * k, C.dark, 2.5);
      arrowHead(x, y + bh / 2 + 10 - 90 * k, -Math.PI / 2, 12 * k, C.dark);
      if (rt > 0) {
        ctx.save(); ctx.fillStyle = C.acc; ctx.translate(x, y - bh / 2 - 12);
        ctx.beginPath(); ctx.moveTo(-9 * k, -12 * k); ctx.lineTo(9 * k, -12 * k); ctx.lineTo(0, 2 * k); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
  });
  // playhead
  if (u > .18 && u < 1.7) {
    const a = 1 - P(u, 1.62, 1.7);
    line(px, 330, px, 760, C.acc, 3, a);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.acc; ctx.beginPath(); ctx.arc(px, 330, 7, 0, TAU); ctx.fill(); ctx.restore();
  }
  // legend
  ctx.save(); ctx.translate(out(5), 0);
  const la = E.o3(P(u, .5, .8));
  ctx.globalAlpha = la;
  ctx.fillStyle = C.dark; ctx.fillRect(122, 880, 26, 16);
  text('EXÉCUTION', 160, 895, mono(14, 500), { fill: C.dark, ls: 2 });
  line(345, 898, 345, 876, C.dark, 2.5); arrowHead(345, 876, -Math.PI / 2, 10, C.dark);
  text('ACTIVATION', 362, 895, mono(14, 500), { fill: C.dark, ls: 2 });
  ctx.fillStyle = C.acc; ctx.beginPath(); ctx.moveTo(560, 880); ctx.lineTo(578, 880); ctx.lineTo(569, 894); ctx.fill();
  text('ÉCHÉANCE', 590, 895, mono(14, 500), { fill: C.dark, ls: 2 });
  text('PRÉEMPTION · PRIORITÉS FIXES', 1800, 895, mono(14, 500), { fill: C.dark, ls: 2, align: 'right', alpha: .6 });
  ctx.restore();
  ctx.restore();
}

// ================= SCENE 5 — MODÈLES / KEYWORDS (8–10) =================
const NET = (() => {
  const r = rng(7), n = 46, nodes = [];
  for (let i = 0; i < n; i++) nodes.push({ x: (r() - .5) * 2600, y: (r() - .5) * 1500, z: (r() - .5) * 1400, kind: r() < .35 ? 1 : 0 });
  const edges = [];
  nodes.forEach((a, i) => {
    const ds = nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2]).filter(q => q[0] !== i).sort((p, q) => p[1] - q[1]);
    for (let k = 0; k < 2; k++) { const j = ds[k][0]; if (!edges.some(e => (e[0] === j && e[1] === i))) edges.push([i, j]); }
  });
  const packets = edges.filter((_, i) => i % 3 === 0).map((e, i) => ({ e, off: r(), sp: .8 + r() * 1.2 }));
  return { nodes, edges, packets };
})();
function project(nd, a, tilt) {
  const ca = Math.cos(a), sa = Math.sin(a);
  let x = nd.x * ca - nd.z * sa, z = nd.x * sa + nd.z * ca, y = nd.y;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const y2 = y * ct - z * st; z = y * st + z * ct;
  const f = 1300, d = z + 1500;
  return { x: W / 2 + x * f / d, y: H / 2 + y2 * f / d, s: f / d, d };
}
const WORDS = [
  { t: 'Réseaux de Petri', f: serif(200), c: 'ink', code: 'EIEAT3D3 · MODÈLES TEMPORELS AVANCÉS' },
  { t: 'MODEL-CHECKING', f: F(170, { st: 'expanded' }), c: 'acc', code: 'EIEAT3E3 · VÉRIFICATION ET VALIDATION' },
  { t: 'CAN · AFDX', f: F(310, { st: 'condensed' }), c: 'ink', stroke: true, code: 'EIEAT4D2 · RÉSEAUX TEMPS RÉEL' },
  { t: 'Network Calculus', f: serif(210), c: 'acc', code: 'EIEAT4D2 · CONTRAINTES TEMPORELLES' },
  { t: 'UML2 / MARTE / SysML', f: mono(120, 700), c: 'ink', code: 'EIEAT3E2 · CONCEPTION DES SYSTÈMES TEMPS RÉEL' },
  { t: 'OSEK/VDX', f: F(250, { st: 'expanded' }), c: 'dark', box: true, code: 'EIEAT3D2 · NORME INDUSTRIELLE' },
  { t: '(max,+)', f: serif(330, false), c: 'ink', code: 'EIEAT3E4 · ALGÈBRE DES DIOÏDES' },
  { t: 'TOLÉRANCE AUX FAUTES', f: F(150, { st: 'expanded' }), c: 'acc', code: 'EIEAT4D3 · ARCHITECTURES SÛRES' },
];
function s5(u) {
  bg(C.bg);
  // 3D Petri/network field
  const a = -.5 + u * .42, tilt = .18 - u * .06;
  const pr = NET.nodes.map(nd => project(nd, a, tilt));
  const na = E.o3(P(u, 0, .3));
  ctx.save(); ctx.lineWidth = 1;
  for (const [i, j] of NET.edges) {
    const A = pr[i], B = pr[j];
    ctx.strokeStyle = `rgba(242,238,228,${.13 * na * cl(1.6 - (A.d + B.d) / 3000, .2, 1)})`;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
  }
  ctx.restore();
  pr.forEach((q, i) => {
    const al = na * cl(1.5 - q.d / 2000, .15, .8);
    ctx.save(); ctx.globalAlpha = al;
    if (NET.nodes[i].kind) { ctx.fillStyle = C.ink; ctx.fillRect(q.x - 3 * q.s, q.y - 16 * q.s, 6 * q.s, 32 * q.s); }
    else { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, 14 * q.s, 0, TAU); ctx.stroke(); }
    ctx.restore();
  });
  for (const pk of NET.packets) {
    const s = (u * pk.sp + pk.off) % 1;
    const A = pr[pk.e[0]], B = pr[pk.e[1]];
    const x = lerp(A.x, B.x, s), y = lerp(A.y, B.y, s);
    ctx.save(); ctx.globalAlpha = na * .9; ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(x, y, 4.5 * lerp(A.s, B.s, s), 0, TAU); ctx.fill(); ctx.restore();
  }
  // dark scrim so type reads
  const sg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 900);
  sg.addColorStop(0, 'rgba(11,11,14,.72)'); sg.addColorStop(1, 'rgba(11,11,14,0)');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

  // keyword barrage — one word per 1/8 bar
  const i = Math.min(7, Math.floor(u / .25)), w = u - i * .25;
  const wd = WORDS[i];
  const f = fit(wd.t, wd.f, 1400);
  const m = measure(wd.t, f);
  const cy = 520, base = cy + (m.asc - m.desc) / 2;
  const k = E.oExpo(P(w, 0, .14));
  const sc = lerp(1.22, 1, k) + .05 * w;
  const col = wd.c === 'acc' ? C.acc : wd.c === 'dark' ? C.dark : C.ink;
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(sc, sc); ctx.translate(-W / 2, -cy);
  if (wd.box) {
    const bw = (m.w + 80) * E.oExpo(P(w, 0, .1));
    ctx.fillStyle = C.acc; ctx.fillRect(W / 2 - bw / 2, cy - m.asc / 2 - 40, bw, m.asc + 80);
  }
  // chromatic ghost on entrance
  const g = 1 - k;
  if (g > .02) {
    text(wd.t, W / 2 - 22 * g, base, f, { align: 'center', fill: wd.stroke ? null : C.acc, stroke: wd.stroke ? C.acc : null, lw: 4, alpha: .6 * g });
    text(wd.t, W / 2 + 22 * g, base, f, { align: 'center', fill: wd.stroke ? null : '#3AE6FF', stroke: wd.stroke ? '#3AE6FF' : null, lw: 4, alpha: .35 * g });
  }
  text(wd.t, W / 2, base, f, { align: 'center', fill: wd.stroke ? null : col, stroke: wd.stroke ? col : null, lw: 4, alpha: cl(w / .03) });
  ctx.restore();
  typeOn(wd.code, W / 2, 780, mono(19, 500), w, .03, 160, { align: 'center', ls: 4, alpha: .6 });
  // counter + side rail
  text(`0${i + 1}`, 70, 520, F(64, { st: 'expanded' }), { fill: C.acc });
  text('/08', 74, 552, mono(16, 500), { alpha: .5 });
  line(72, 580, 72, 580 + 300, C.ink, 1, .2);
  line(72, 580, 72, 580 + 300 * (u / 2), C.acc, 3);
  text('MOTS-CLÉS', 1860, 940, mono(15, 500), { align: 'right', ls: 4, alpha: .5 });
  text('SYLLABUS · M2', 1860, 966, mono(15, 500), { align: 'right', ls: 4, alpha: .3 });
  // orange columns drop in
  for (let j = 0; j < 8; j++) {
    const kk = E.io3(P(u, 1.64 + j * .028, 1.64 + j * .028 + .26));
    if (kk > 0) { ctx.fillStyle = C.acc; ctx.fillRect(j * W / 8 - 1, -10, W / 8 + 2, (H + 20) * kk); }
  }
}

// ================= SCENE 6 — CHIFFRES / DÉBOUCHÉS (10–12) =================
const STATS = [
  { v: '60', unit: 'ECTS', l: ['CRÉDITS', 'SUR L’ANNÉE DE M2'] },
  { v: '7', unit: 'MOIS', l: ['DE COURS', 'À L’UNIVERSITÉ'] },
  { v: '5', unit: 'MOIS', l: ['DE STAGE', 'ENTREPRISE OU LABO'] },
  { v: '2', unit: 'MOIS', l: ['RECHERCHE D’EMPLOI', 'DURÉE MOYENNE'] },
];
const JOBS = 'INGÉNIEUR SYSTÈMES ET SIMULATIONS ◆ R&D AÉRONAUTIQUE · ESPACE · AUTOMOBILE ◆ FIABILITÉ & SÛRETÉ DE FONCTIONNEMENT ◆ LOGICIEL TEMPS RÉEL EMBARQUÉ ◆ AUTOMATICIEN ◆ INFORMATIQUE INDUSTRIELLE ◆ DOCTORAT ◆ ';
function s6(u) {
  bg(C.acc);
  const mx = 120, cw = (W - 2 * mx) / 4;
  reveal('LE M2 EN CHIFFRES', mx, 215, F(76, { st: 'expanded' }), { t: u, align: 'left', stagger: .016, dur: .4, ls: -2, fill: C.dark });
  typeOn('MASTER INDIFFÉRENCIÉ · INDUSTRIE ⟷ RECHERCHE', W - mx, 176, mono(17, 700), u, .1, 80, { align: 'right', ls: 3, fill: C.dark, base: 'alphabetic' });
  typeOn('ALTERNANCE POSSIBLE EN M2', W - mx, 208, mono(17, 500), u, .3, 80, { align: 'right', ls: 3, fill: C.dark, alpha: .7 });
  const numF = F(200, { st: 'normal' });
  const dm = measure('0', numF);
  const dw = dm.w, cap = dm.asc, base = 610;
  STATS.forEach((st, k) => {
    const x = mx + k * cw;
    const lk = E.oExpo(P(u, k * .06, .5 + k * .06));
    line(x, 290, x, 290 + 470 * lk, C.dark, 2, .8);
    text(`0${k + 1}`, x + 24, 330, mono(16, 700), { fill: C.dark, alpha: lk });
    const S = .04 + .05 * k;
    const digits = [...st.v];
    let xx = x + 22;
    digits.forEach((d, j) => {
      const L = .38 + .25 * k + j * .05;
      if (u < S) { xx += dw - 6; return; }
      const val = +d + 30 * (1 - E.o5(P(u, S, L)));
      const n = Math.floor(val), fr = val - n;
      const step = cap * 1.35;
      ctx.save(); ctx.beginPath(); ctx.rect(xx - 10, base - cap - 24, dw + 20, cap + 48); ctx.clip();
      const speed = u < L ? 1 : 0;
      for (const [dd, oy] of [[n, fr * step], [n + 1, (fr - 1) * step]]) {
        const ch = String(((dd % 10) + 10) % 10);
        if (speed && fr > .02) text(ch, xx, base + oy - 18, numF, { fill: C.dark, alpha: .25 });
        text(ch, xx, base + oy, numF, { fill: C.dark });
      }
      ctx.restore();
      xx += dw - 6;
    });
    const land = .38 + .25 * k + (digits.length - 1) * .05;
    const ua = E.oExpo(P(u, land - .05, land + .25));
    text(st.unit, xx + 10, base, F(34, { st: 'expanded' }), { fill: C.dark, alpha: ua });
    line(x + 24, base + 34, x + 24 + (cw - 60) * ua, base + 34, C.dark, 5);
    st.l.forEach((s, j) => text(s, x + 24, base + 84 + j * 30, mono(18, j ? 400 : 700), { fill: C.dark, ls: 2, alpha: ua * (j ? .7 : 1) }));
  });
  // débouchés marquee band
  const bw = E.oExpo(P(u, .15, .7));
  ctx.fillStyle = C.dark; ctx.fillRect(0, 858, W * bw, 84);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 858, W * bw, 84); ctx.clip();
  const mf = mono(26, 700);
  const mw = measure(JOBS, mf, 2).w;
  const ox = -((u * 300) % mw);
  for (let r = 0; r < 3; r++) text(JOBS, ox + r * mw, 911, mf, { fill: C.ink, ls: 2 });
  ctx.restore();
  text('DÉBOUCHÉS', mx, 840, mono(15, 700), { fill: C.dark, ls: 4, alpha: bw });
}
function clockWipe(drawTop, k) {
  const a0 = -Math.PI / 2, a = a0 + TAU * k;
  ctx.save(); ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.arc(W / 2, H / 2, 2400, a, a0 + TAU); ctx.closePath(); ctx.clip();
  drawTop(); ctx.restore();
  if (k > 0 && k < 1) {
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.shadowColor = C.acc; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(W / 2 + Math.cos(a) * 2400, H / 2 + Math.sin(a) * 2400); ctx.stroke(); ctx.restore();
  }
}

// ================= SCENE 7 — DEADLINE (12–15) =================
function s7(u) {
  bg(C.bg);
  const cx = W / 2, cy = H / 2, R = 470;
  const endFade = 1 - E.io3(P(u, 2.7, 2.9));
  const hit = decay(u, 2.0, 3.5);
  ctx.save(); ctx.globalAlpha = endFade;
  // dial ticks
  for (let i = 0; i < 60; i++) {
    const ti = -.45 + i * .011;
    const k = E.oExpo(P(u, ti, ti + .4));
    if (k <= 0) continue;
    const a = -Math.PI / 2 + i * TAU / 60, maj = i % 5 === 0;
    const len = (maj ? 38 : 16) * k;
    const flash = decay(u, 2.0 + i * .004, 5);
    ctx.strokeStyle = flash > .05 ? C.acc : maj ? C.ink : 'rgba(242,238,228,.4)';
    ctx.lineWidth = maj ? 4 : 2;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - len), cy + Math.sin(a) * (R - len));
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
  }
  const la = E.o3(P(u, 0, .5));
  [['00', 0], ['15', 1], ['30', 2], ['45', 3]].forEach(([s, q]) => {
    const a = -Math.PI / 2 + q * Math.PI / 2;
    text(s, cx + Math.cos(a) * (R - 68), cy + Math.sin(a) * (R - 68) + 6, mono(15, 500), { align: 'center', alpha: la * .5 });
  });
  // sweep hand with radar trail
  let ha = -Math.PI / 2 + TAU * E.io3(P(u, 0, 2.0));
  if (u > 2) ha += .035 * Math.sin((u - 2) * 34) * decay(u, 2, 7);
  const moving = u > 0 && u < 2.0;
  if (moving) {
    const spd = Math.sin(Math.PI * P(u, 0, 2));
    const g = ctx.createConicGradient(ha - 1.1, cx, cy);
    g.addColorStop(0, 'rgba(255,74,28,0)');
    g.addColorStop(1.1 / TAU, `rgba(255,74,28,${.32 * spd})`);
    g.addColorStop(1.1 / TAU + .0001, 'rgba(255,74,28,0)');
    g.addColorStop(1, 'rgba(255,74,28,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 4, ha - 1.1, ha); ctx.closePath(); ctx.fill();
  }
  ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 3.5; ctx.shadowColor = C.acc; ctx.shadowBlur = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - Math.cos(ha) * 50, cy - Math.sin(ha) * 50); ctx.lineTo(cx + Math.cos(ha) * (R - 8), cy + Math.sin(ha) * (R - 8)); ctx.stroke(); ctx.restore();
  // impact ring
  if (u >= 2.0) {
    const k = P(u, 2.0, 2.7);
    ctx.save(); ctx.strokeStyle = C.acc; ctx.globalAlpha *= 1 - k; ctx.lineWidth = 10 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(cx, cy, R + 520 * E.oExpo(k), 0, TAU); ctx.stroke(); ctx.restore();
  }
  const hub = (al) => { const hr = 9 + 6 * hit + 8 * decay(u, 2.92, 8); ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(cx, cy, hr, 0, TAU); ctx.fill(); ctx.restore(); };
  hub(1);
  // lockup
  ctx.save(); ctx.fillStyle = 'rgba(11,11,14,.78)'; ctx.globalAlpha *= E.o3(P(u, .1, .5));
  ctx.beginPath(); ctx.arc(cx, cy, R - 60, 0, TAU); ctx.fill(); ctx.restore();
  typeOn('MASTER 2 · MENTION EEA', cx, 372, mono(19, 700), u, .15, 50, { align: 'center', ls: 6, fill: C.acc });
  const ps = 1 + .03 * hit;
  ctx.save(); ctx.translate(cx, 540); ctx.scale(ps, ps); ctx.translate(-cx, -540);
  reveal('ISTR', cx, 590, F(232, { st: 'expanded' }), { t: u, delay: .2, stagger: .06, dur: .55, ls: -6 });
  ctx.restore();
  const sa = E.o3(P(u, .6, 1.1));
  text('Ingénierie des Systèmes Temps Réel', cx, 668 + 20 * (1 - sa), serif(56), { align: 'center', alpha: sa });
  typeOn('UNIVERSITÉ PAUL SABATIER · TOULOUSE III · 2017–2018', cx, 728, mono(15, 500), u, .9, 70, { align: 'center', ls: 4, alpha: .55 });
  if (u >= 2.0) {
    const k = E.oBack(P(u, 2.0, 2.3));
    ctx.save(); ctx.translate(cx, 812); ctx.scale(k, k);
    const f = mono(22, 700), mw = measure('DEADLINE MET', f, 5).w + 70;
    ctx.fillStyle = C.acc; ctx.beginPath(); ctx.roundRect(-mw / 2 - 20, -26, mw + 40, 52, 26); ctx.fill();
    check(-mw / 2 + 14, 0, 22, C.dark, 4);
    text('DEADLINE MET', 22, 8, f, { align: 'center', ls: 5, fill: C.dark }); ctx.restore();
  }
  ctx.restore();
  // hub remains as the closing dot (callback to the opening pulse)
  hub(1 - endFade);
}

// ================= HUD / POST =================
const SCENES = [[0, 'SIGNAL'], [2, 'TEMPS RÉEL'], [4, 'BLOCS'], [6, 'ORDONNANCEMENT'], [8, 'MODÈLES'], [10, 'DÉBOUCHÉS'], [12, 'DEADLINE']];
const DEADLINE = 14;
function hudInk(T) {
  if ((T >= 3.0 && T < 3.62) || (T >= 5.86 && T < 8.0) || (T >= 9.86 && T < 11.78)) return C.dark;
  return C.ink;
}
function hud(T) {
  const a = E.o3(P(T, .3, .9)) * (1 - P(T, 14.7, 14.9));
  if (a <= 0) return;
  const ink = hudInk(T);
  ctx.save(); ctx.globalAlpha = a;
  const f = mono(14, 500);
  text('M2 ISTR — SHOWREEL', 60, 58, mono(14, 700), { fill: ink, ls: 3 });
  text('SYLLABUS 2017 / 2018 · UPS TOULOUSE', 60, 80, f, { fill: ink, ls: 3, alpha: .5 });
  const rem = Math.max(0, DEADLINE - T);
  const done = T >= DEADLINE;
  text('ÉCHÉANCE', 1860, 58, mono(14, 700), { fill: done ? C.acc : ink, ls: 3, align: 'right' });
  const s = rem.toFixed(3).padStart(6, '0');
  text((done ? '' : '−') + s + ' s', 1860, 84, mono(22, 700), { fill: done ? C.acc : ink, align: 'right' });
  // blinking rec dot on beats
  const beatOn = (T % .5) < .25;
  ctx.fillStyle = hudInk(T) === C.dark ? C.dark : C.acc;
  if (beatOn || done) { ctx.beginPath(); ctx.arc(1860 - measure((done ? '' : '−') + s + ' s', mono(22, 700)).w - 18, 77, 5, 0, TAU); ctx.fill(); }
  // timeline to deadline
  const x0 = 60, x1 = 1860, y = 1032;
  const X = t => x0 + (x1 - x0) * cl(t / DEADLINE);
  line(x0, y, x1, y, ink, 1.5, .25);
  line(x0, y, X(T), y, ink, 3);
  SCENES.forEach(([t0, n], i) => {
    const cur = T >= t0 && (i === SCENES.length - 1 || T < SCENES[i + 1][0]);
    line(X(t0), y - 8, X(t0), y + 8, ink, 1.5, cur ? 1 : .4);
    text(`${String(i + 1).padStart(2, '0')} ${n}`, X(t0) + 8, y - 10, mono(11, cur ? 700 : 400), { fill: ink, ls: 2, alpha: cur ? 1 : .4 });
  });
  ctx.fillStyle = C.acc; ctx.fillRect(x1 - 3, y - 12, 6, 24);
  text('D', x1, y + 30 - 4, mono(11, 700), { fill: C.acc, align: 'center' });
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(X(T), y, 5, 0, TAU); ctx.fill();
  ctx.restore();
}
const HITS = [[2.0, 1.0], [2.5, .55], [3.0, .8], [4.0, .35], [8.0, .7], [10.0, .3], [10.38, .25], [10.63, .25], [10.88, .25], [11.13, .25], [12.0, .4], [14.0, 1.3]];
function shake(T) {
  let amp = 0;
  for (const [h, s] of HITS) amp += s * decay(T, h, 11);
  const fr = Math.floor(T * 60), r = rng(fr * 13 + 1);
  return { x: (r() - .5) * 34 * amp, y: (r() - .5) * 34 * amp, s: 1 + .025 * amp };
}
const FLASHES = [[2.0, .95, '#ffffff'], [2.5, .25, C.acc], [3.0, .5, '#ffffff'], [4.0, .35, '#ffffff'], [8.0, .7, '#ffffff'], [14.0, .45, C.acc]];
const GRAIN = [];
function makeGrain() {
  const r = rng(99);
  for (let n = 0; n < 4; n++) {
    const c = document.createElement('canvas'); c.width = 960; c.height = 540;
    const g = c.getContext('2d'), im = g.createImageData(960, 540);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); GRAIN.push(c);
  }
}
let VIG;
function post(T) {
  for (const [h, a, col] of FLASHES) {
    const k = a * decay(T, h, 13);
    if (k > .005) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .11;
  ctx.drawImage(GRAIN[Math.floor(T * 60) % 4], 0, 0, W, H); ctx.restore();
  ctx.drawImage(VIG, 0, 0);
}

function render(T) {
  ctx = mctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const sh = shake(T);
  ctx.save();
  ctx.translate(W / 2 + sh.x, H / 2 + sh.y); ctx.scale(sh.s, sh.s); ctx.translate(-W / 2, -H / 2);
  if (T < 2) s1(T);
  else if (T < 4) s2(T - 2);
  else if (T < 6) s3(T - 4);
  else if (T < 8) s4(T - 6);
  else if (T < 10) s5(T - 8);
  else if (T < 11.5) s6(T - 10);
  else if (T < 12) { s7(T - 12); clockWipe(() => s6(T - 10), E.io3(P(T, 11.5, 12))); }
  else s7(T - 12);
  ctx.restore();
  hud(T);
  post(T);
}

window.READY = (async () => {
  const sample = 'AÉÈÊÀÇÔÛÙéèêàçôûù’—·τΣℝ⁺ᵢ⟷◆✓✕0123456789';
  await Promise.all([
    '900 300px Archivo', 'italic 400 100px "Instrument Serif"', '400 100px "Instrument Serif"',
    '400 20px "JetBrains Mono"', '500 20px "JetBrains Mono"', '700 20px "JetBrains Mono"',
  ].map(f => document.fonts.load(f, sample)));
  await document.fonts.ready;
  makeGrain();
  VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H;
  const g = VIG.getContext('2d'), rg = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
  rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.4)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  return { miss: SCHED.miss, segs: SCHED.segs };
})();

// live preview when opened directly (render mode drives render() externally)
if (!/render/.test(location.search)) {
  const fitView = () => {
    const s = Math.min(innerWidth / W, innerHeight / H);
    main.style.transform = `scale(${s}) translate(-50%,-50%)`;
  };
  addEventListener('resize', fitView); fitView();
  window.READY.then(() => {
    const t0 = performance.now();
    const loop = now => { render(((now - t0) / 1000) % DUR); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}
