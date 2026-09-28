'use strict';
// Shared engine for the long ISTR showreels (30 s / 60 s): helpers, transitions,
// HUD, post-processing and the master render(T). Scenes live in scenes.js,
// timelines in cuts.js. Everything is a pure function of T, so any frame can
// be rendered in any order.

const W = 1920, H = 1080, TAU = Math.PI * 2;
const main = document.getElementById('c');
const mctx = main.getContext('2d');
let ctx = mctx;

const C = {
  bg: '#0B0B0E', ink: '#F2EEE4', acc: '#FF4A1C', dark: '#0B0B0E', paper: '#EFEAE0', panel: '#141418',
  accP: '#D93A10',   // accent for chart marks on paper (3.8:1)
  grayP: '#8A8780',  // context marks on paper
  // ordinal ramp cours → TD → TP, validated on the dark surface
  hC: '#8F3219', hTD: '#D4441C', hTP: '#FF8A5C',
};
const BGC = { dark: C.bg, paper: C.paper, orange: C.acc };

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
function wrap(s, font, maxW, ls = 0) {
  const out = []; let cur = '';
  for (const w of s.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (cur && measure(t, font, ls).w > maxW) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
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
  for (let i = 0; i < L.ch.length; i++) {
    const c = L.ch[i];
    const k = ease(P(t, delay + i * st, delay + i * st + dur));
    if (k <= 0 || c.c === ' ') continue;
    ctx.save();
    ctx.globalAlpha *= (o.alpha ?? 1);
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
function arc(x1, y1, x2, y2, r1, r2, col, lw = 1.5, head = 9) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const sx = x1 + Math.cos(a) * r1, sy = y1 + Math.sin(a) * r1;
  const ex = x2 - Math.cos(a) * r2, ey = y2 - Math.sin(a) * r2;
  line(sx, sy, ex, ey, col, lw);
  arrowHead(ex, ey, a, head, col);
}
function check(x, y, s, col, lw = 3) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * .5, y); ctx.lineTo(x - s * .12, y + s * .38); ctx.lineTo(x + s * .55, y - s * .4); ctx.stroke(); ctx.restore();
}
function hatch(x, y, w, h, col, lw = 2, step = 12, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
  for (let i = -h; i < w; i += step) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); }
  ctx.stroke(); ctx.restore();
}
// Horizontal bar: square at the baseline (left), 4px rounded data-end.
function barH(x, y, w, h, col, roundEnd = true) {
  if (w <= .5) return;
  const r = roundEnd ? Math.min(4, w, h / 2) : 0;
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
}
function dot(x, y, r, col, ring) {
  if (ring) { ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, TAU); ctx.fill(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
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

// ---------- transitions (k: 0 → 1 over the last `dur` seconds of a scene) ----------
function clipRect(x, y, w, h, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore(); }
function diagPath(e, slant) {
  const xe = W + slant - (W + slant * 2) * e;
  ctx.beginPath(); ctx.moveTo(xe, -60); ctx.lineTo(W + 400, -60); ctx.lineTo(W + 400, H + 60);
  ctx.lineTo(xe - slant * (H + 120) / H, H + 60); ctx.closePath();
}
const TRANS = {
  strips(k, cur, nxt) {
    nxt();
    drawTo(B1, cur);
    const n = 8, sh = H / n;
    for (let i = 0; i < n; i++) {
      const d0 = (i % 4) * .06 + Math.floor(i / 4) * .03;
      const e = E.iExpo(P(k, d0, d0 + .76));
      const dx = (i % 2 ? 1 : -1) * e * W * 1.15;
      ctx.save(); ctx.globalAlpha = .25; ctx.drawImage(B1.c, 0, i * sh, W, sh, dx * .85, i * sh, W, sh); ctx.restore();
      ctx.drawImage(B1.c, 0, i * sh, W, sh, dx, i * sh, W, sh);
    }
  },
  push(k, cur, nxt) {
    const e = E.ioExpo(k), sx = W * (1 - e);
    clipRect(-300, -300, sx + 300, H + 600, () => { ctx.translate(-W * e, 0); cur(); });
    clipRect(sx, -300, W - sx + 300, H + 600, () => { ctx.translate(sx, 0); nxt(); });
    if (k > 0 && k < 1) line(sx, -60, sx, H + 60, C.acc, 8);
  },
  diag(k, cur, nxt, o) {
    cur();
    const lead = E.ioExpo(P(k, 0, .8)), rev = E.ioExpo(P(k, .22, 1));
    if (lead > 0) { diagPath(lead, 260); ctx.fillStyle = o.col || C.acc; ctx.fill(); }
    if (rev > 0) { ctx.save(); diagPath(rev, 260); ctx.clip(); nxt(); ctx.restore(); }
  },
  columns(k, cur, nxt, o) {
    cur();
    const n = 8, cw = W / n;
    ctx.save(); ctx.beginPath();
    const hs = [];
    for (let j = 0; j < n; j++) {
      const e = E.io3(P(k, j * .055, j * .055 + .6));
      hs.push(e);
      if (e > 0) ctx.rect(j * cw - 1, -60, cw + 2, (H + 120) * e);
    }
    ctx.clip(); nxt(); ctx.restore();
    hs.forEach((e, j) => { if (e > 0 && e < 1) { ctx.fillStyle = o.col || C.acc; ctx.fillRect(j * cw - 1, (H + 120) * e - 60 - 8, cw + 2, 8); } });
  },
  iris(k, cur, nxt, o) {
    cur();
    const e = E.io3(k), r = 1150 * e;
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, TAU); ctx.clip(); nxt(); ctx.restore();
    if (k > 0 && k < 1) {
      ctx.save(); ctx.strokeStyle = o.col || C.ink; ctx.lineWidth = 10 * (1 - e) + 2;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, TAU); ctx.stroke(); ctx.restore();
    }
  },
  clock(k, cur, nxt) {
    nxt();
    const a0 = -Math.PI / 2, a = a0 + TAU * E.io3(k);
    ctx.save(); ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.arc(W / 2, H / 2, 2400, a, a0 + TAU); ctx.closePath(); ctx.clip();
    cur(); ctx.restore();
    if (k > 0 && k < 1) {
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.shadowColor = C.acc; ctx.shadowBlur = 25;
      ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(W / 2 + Math.cos(a) * 2400, H / 2 + Math.sin(a) * 2400); ctx.stroke(); ctx.restore();
    }
  },
  // zoom through a rectangle (e.g. a panel) into the next scene
  rect(k, cur, nxt, o) {
    cur();
    const e = E.ioExpo(k), f = o.from;
    const x = lerp(f.x, 0, e), y = lerp(f.y, 0, e), w = lerp(f.w, W, e), h = lerp(f.h, H, e);
    const s = Math.max(w / W, h / H);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.globalAlpha = P(k, 0, .22);
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
    nxt(); ctx.restore();
    if (k < 1) { ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 5; ctx.strokeRect(x, y, w, h); ctx.restore(); }
  },
};
const TRANS_SFX = { strips: 'whoosh2', push: 'whoosh', diag: 'whoosh', columns: 'whooshDown', iris: 'whoosh', clock: 'sweep', rect: 'zoom' };

// ---------- timeline ----------
let CUT = null;
function buildCut(def) {
  let t = 0;
  const scenes = def.scenes.map((s, i) => {
    const kind = K[s.k];
    const sc = { i, k: s.k, name: s.name || kind.name, d: s.d, o: s.o || {}, start: t, kind,
      trans: s.trans ? { type: s.trans[0], dur: s.trans[1] || 0, ...(s.trans[2] || {}) } : { type: 'cut', dur: 0 } };
    t += s.d;
    return sc;
  });
  const dur = t;
  const cues = [];
  scenes.forEach((sc, i) => {
    for (const [ct, kind, arg] of (sc.kind.cues ? sc.kind.cues(sc.d, sc.o) : [])) cues.push([sc.start + ct, kind, arg ?? null]);
    const nx = scenes[i + 1];
    if (nx && sc.trans.dur > 0 && TRANS_SFX[sc.trans.type]) cues.push([nx.start - sc.trans.dur, TRANS_SFX[sc.trans.type], sc.trans.dur]);
  });
  cues.sort((a, b) => a[0] - b[0]);
  const dl = scenes[scenes.length - 1];
  const deadline = dl.start + (dl.kind.impact ? dl.kind.impact(dl.d, dl.o) : dl.d);
  CUT = { tag: def.tag, dur, deadline, scenes, cues };
  HITS = cues.filter(c => SHAKE[c[1]]).map(c => [c[0], SHAKE[c[1]]]);
  FLASHES = cues.filter(c => FLASH[c[1]]).map(c => [c[0], ...FLASH[c[1]]]);
  return {
    dur, deadline, tag: def.tag, bpm: 120,
    scenes: scenes.map(s => ({ k: s.k, name: s.name, start: s.start, dur: s.d, energy: s.o.energy ?? s.kind.energy ?? 1, trans: s.trans })),
    cues,
  };
}
function sceneAt(T) {
  const S = CUT.scenes;
  for (let i = S.length - 1; i >= 0; i--) if (T >= S[i].start) return i;
  return 0;
}
const SHAKE = { hitCut: .7, hitBig: 1.0, hit: .5, hitFlip: .8, hitS: .3, land: .25, impact: 1.3, zap: .6 };
const FLASH = { hitCut: [.7, '#ffffff'], hitBig: [.95, '#ffffff'], hitFlip: [.5, '#ffffff'], hitAcc: [.25, C.acc], impact: [.45, C.acc], zap: [.35, '#ffffff'] };
let HITS = [], FLASHES = [];

function shake(T) {
  let amp = 0;
  for (const [h, s] of HITS) amp += s * decay(T, h, 11);
  const fr = Math.floor(T * 60), r = rng(fr * 13 + 1);
  return { x: (r() - .5) * 34 * amp, y: (r() - .5) * 34 * amp, s: 1 + .025 * amp };
}

// ---------- HUD ----------
function bgInfo(T) {
  const i = sceneAt(T), sc = CUT.scenes[i], nx = CUT.scenes[i + 1];
  let s = sc, u = T - sc.start;
  if (nx && sc.trans.dur > 0 && u > sc.d - sc.trans.dur && (u - (sc.d - sc.trans.dur)) / sc.trans.dur > .5) { s = nx; u = T - nx.start; }
  const b = typeof s.kind.bg === 'function' ? s.kind.bg(u, s.d, s.o) : s.kind.bg;
  return typeof b === 'string' ? { left: b, right: b, split: null } : b;
}
const inkOn = b => b === 'dark' ? C.ink : C.dark;
function hudDraw(T, b) {
  const ink = inkOn(b), acc = b === 'orange' ? C.dark : C.acc;
  const f = mono(14, 500);
  text('M2 ISTR — SHOWREEL ' + CUT.tag, 60, 58, mono(14, 700), { fill: ink, ls: 3 });
  text('SYLLABUS 2017 / 2018 · UPS TOULOUSE', 60, 80, f, { fill: ink, ls: 3, alpha: .5 });
  const rem = Math.max(0, CUT.deadline - T), done = T >= CUT.deadline;
  text('ÉCHÉANCE', 1860, 58, mono(14, 700), { fill: done ? acc : ink, ls: 3, align: 'right' });
  const s = (done ? '' : '−') + rem.toFixed(3).padStart(6, '0') + ' s';
  const tf = mono(22, 700);
  text(s, 1860, 84, tf, { fill: done ? acc : ink, align: 'right' });
  if ((T % .5) < .25 || done) { ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(1860 - measure(s, tf).w - 18, 77, 5, 0, TAU); ctx.fill(); }
  // timeline
  const x0 = 60, x1 = 1860, y = 1032;
  const X = t => x0 + (x1 - x0) * cl(t / CUT.dur);
  line(x0, y, x1, y, ink, 1.5, .25);
  line(x0, y, X(T), y, ink, 3);
  const cur = sceneAt(T);
  CUT.scenes.forEach((sc, i) => {
    const on = i === cur;
    line(X(sc.start), y - 8, X(sc.start), y + 8, ink, 1.5, on ? 1 : .4);
    if (!on) text(String(i + 1).padStart(2, '0'), X(sc.start) + 6, y - 10, mono(10, 400), { fill: ink, ls: 1, alpha: .4 });
  });
  const sc = CUT.scenes[cur];
  const lab = `${String(cur + 1).padStart(2, '0')} ${sc.name}`, lf = mono(11, 700);
  const lw = measure(lab, lf, 2).w;
  ctx.fillStyle = BGC[b]; ctx.fillRect(X(sc.start) + 3, y - 24, lw + 8, 18);
  text(lab, X(sc.start) + 6, y - 10, lf, { fill: ink, ls: 2 });
  ctx.fillStyle = acc; ctx.fillRect(X(CUT.deadline) - 3, y - 12, 6, 24);
  text('D', X(CUT.deadline), y + 26, mono(11, 700), { fill: acc, align: 'center' });
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(X(T), y, 5, 0, TAU); ctx.fill();
}
function hud(T) {
  const a = E.o3(P(T, .3, .9)) * (1 - P(T, CUT.dur - .3, CUT.dur - .1));
  if (a <= 0) return;
  const info = bgInfo(T);
  ctx.save(); ctx.globalAlpha = a;
  if (info.split) {
    clipRect(0, 0, info.split, H, () => hudDraw(T, info.left));
    clipRect(info.split, 0, W - info.split, H, () => hudDraw(T, info.right));
  } else hudDraw(T, info.left);
  ctx.restore();
}

// ---------- post ----------
const GRAIN = [];
function makeGrain() {
  const r = rng(99);
  for (let n = 0; n < 6; n++) {
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
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .085;
  ctx.drawImage(GRAIN[Math.floor(T * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
  ctx.drawImage(VIG, 0, 0);
}

function drawScene(sc, u) { ctx.save(); sc.kind.draw(u, sc.d, sc.o); ctx.restore(); }
function render(T) {
  ctx = mctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const sh = shake(T);
  ctx.save();
  ctx.translate(W / 2 + sh.x, H / 2 + sh.y); ctx.scale(sh.s, sh.s); ctx.translate(-W / 2, -H / 2);
  const i = sceneAt(T), sc = CUT.scenes[i], nx = CUT.scenes[i + 1], u = T - sc.start;
  const tr = sc.trans;
  if (nx && tr.dur > 0 && u > sc.d - tr.dur) {
    const k = (u - (sc.d - tr.dur)) / tr.dur;
    TRANS[tr.type](k, () => drawScene(sc, u), () => drawScene(nx, T - nx.start), tr);
  } else drawScene(sc, u);
  ctx.restore();
  hud(T);
  post(T);
}

async function boot(def) {
  const tl = buildCut(def);
  window.DUR = tl.dur; window.TIMELINE = tl;
  const sample = 'AÉÈÊÀÇÔÛÙÎéèêàçôûùîœŒ’—–·τΣℝ⁺ᵢ⟷◆✓✕⊗⊕∞μλ₅%0123456789';
  await Promise.all([
    '900 300px Archivo', '800 100px Archivo', '700 100px Archivo',
    'italic 400 100px "Instrument Serif"', '400 100px "Instrument Serif"',
    '400 20px "JetBrains Mono"', '500 20px "JetBrains Mono"', '700 20px "JetBrains Mono"',
  ].map(f => document.fonts.load(f, sample)));
  await document.fonts.ready;
  makeGrain();
  VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H;
  const g = VIG.getContext('2d'), rg = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
  rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.36)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  return tl;
}
