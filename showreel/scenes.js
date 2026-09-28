'use strict';
// Scene library for the long cuts. Each kind: { name, bg, energy, draw(u, d, o), cues(d, o), impact? }.
// u = local time in seconds (negative while an incoming transition is revealing the scene),
// d = the scene's duration in the cut, o = per-cut options. Entrances are anchored to u = 0,
// exits to u = d, so the same scene breathes longer when a cut gives it more time.
const K = {};

// ================= SIGNAL =================
K.signal = {
  name: 'SIGNAL', bg: 'dark', energy: 0,
  draw(u, d) {
    bg(C.bg);
    const cx = W / 2, cy = H / 2;
    const wS = .5, wE = d - .5, cE = d - .25, fS = d - .28;
    const ga = .09 * E.o3(P(u, .2, .9)) * (1 - P(u, d - .25, d - .05));
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
    let pulse = 0;
    for (let b = 0; b < d - .9; b += .5) {
      pulse += decay(u, b, 9);
      const k = P(u, b, b + .7);
      if (u >= b && k < 1) {
        ctx.save(); ctx.strokeStyle = C.acc; ctx.globalAlpha = (1 - k) * .8; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 10 + 300 * E.oExpo(k), 0, TAU); ctx.stroke(); ctx.restore();
      }
    }
    ctx.save(); ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(cx, cy, 7 + 12 * pulse, 0, TAU); ctx.fill(); ctx.restore();
    // square-wave clock signal drawn outward from the centre, frequency climbing
    const reach = 880 * E.io3(P(u, wS, wE));
    const amp = 110 * (1 - E.io3(P(u, wE, cE)));
    if (reach > 1) {
      ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 3.5; ctx.lineJoin = 'miter';
      ctx.shadowColor = C.acc; ctx.shadowBlur = 22;
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(cx, cy);
        for (let dd = 0; dd <= reach; dd += 1.5) {
          const q = dd / 880;
          const ph = TAU * (q * 3 + q * q * q * 16) - u * 9;
          ctx.lineTo(cx + side * dd, cy - amp * (Math.sin(ph) >= 0 ? 1 : -1) * side);
        }
        ctx.stroke();
      }
      ctx.restore();
      for (const side of [-1, 1]) {
        ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = C.acc; ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(cx + side * reach, cy, 6, 0, TAU); ctx.fill(); ctx.restore();
      }
    }
    const la = E.o3(P(u, .35, .7)) * (1 - P(u, d - .3, d - .15));
    if (la > 0) {
      const f = mono(17, 500);
      text('CH1 · CLK · 5 V/div', 160, 212, f, { alpha: la, ls: 2 });
      const hz = Math.round(1 + 4999 * E.iExpo(P(u, wS, cE)));
      text(`f = ${hz.toLocaleString('fr-FR')} Hz`, 1760, 212, f, { alpha: la, fill: C.acc, ls: 2, align: 'right' });
      text(`t = ${Math.max(0, u).toFixed(3)} s`, 160, 882, f, { alpha: la, ls: 2 });
      text('TRIG ▲ RISE · 1 ms/div', 1760, 882, f, { alpha: la * .6, ls: 2, align: 'right' });
    }
    const fl = E.iExpo(P(u, fS, d));
    if (fl > 0) {
      const h = lerp(4, H * 1.3, fl);
      ctx.save(); ctx.fillStyle = C.ink; ctx.shadowColor = C.acc; ctx.shadowBlur = 40;
      ctx.fillRect(cx - reach - 40 * fl, cy - h / 2, (reach + 40 * fl) * 2, h); ctx.restore();
    }
  },
  cues(d) {
    const c = [];
    for (let b = 0; b < d - .9; b += .5) c.push([b, 'heart']);
    c.push([.5, 'osc', d - .75], [d - .45, 'riser', .45]);
    return c;
  },
};

// ================= TEMPS RÉEL =================
const QUOTE = '« DEUX CARACTÉRISTIQUES : LA RÉACTIVITÉ ET LE RESPECT DE CONTRAINTES TEMPORELLES »';
K.tempsReel = {
  name: 'TEMPS RÉEL', energy: 3,
  bg: (u, d, o) => u >= (o.flip ?? d / 2) ? 'orange' : 'dark',
  draw(u, d, o) {
    const fT = o.flip ?? d / 2, flip = u >= fT;
    bg(flip ? C.acc : C.bg);
    const f1 = F(300, { st: 'expanded' }), ls = -8;
    if (!flip) {
      const y1 = 505, y2 = 815;
      const s = 1 + .05 * u;
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
      reveal('TEMPS', W / 2, y1, f1, { t: u, stagger: .04, dur: .5, ls });
      reveal('RÉEL', W / 2, y2, f1, { t: u, delay: .5, stagger: .04, dur: .5, ls, fill: C.acc, dir: -1 });
      const rl = E.oExpo(P(u, .15, .7));
      line(W / 2 - 800 * rl, 568, W / 2 + 800 * rl, 568, C.ink, 2, .5);
      const f = mono(18, 500);
      typeOn('[01] SYSTÈMES', 160, 190, f, u, .1, 40, { ls: 3 });
      typeOn('t ∈ ℝ⁺ · Δt → 0', 1760, 190, f, u, .35, 40, { ls: 3, align: 'right', fill: C.acc });
      typeOn('INGÉNIERIE DES SYSTÈMES TEMPS RÉEL — M2', W / 2, 940, f, u, .55, 70, { ls: 5, align: 'center', alpha: .7 });
      ctx.restore();
      return;
    }
    const v = u - fT;
    const y1 = o.quote ? 462 : 505, y2 = o.quote ? 862 : 815;
    const off = 760 * E.oExpo(P(v, 0, .5)) + 260 * v;
    const L1 = layout('TEMPS', f1, ls), L2 = layout('RÉEL', f1, ls), sp = 110;
    for (let k = -4; k <= 4; k++) {
      const filled = k === 0;
      text('TEMPS', W / 2 + k * (L1.total + sp) - off, y1, f1, { align: 'center', ls, fill: filled ? C.dark : null, stroke: filled ? null : C.dark, lw: 3 });
      text('RÉEL', W / 2 + k * (L2.total + sp) + off, y2, f1, { align: 'center', ls, fill: filled ? C.dark : null, stroke: filled ? null : C.dark, lw: 3 });
    }
    const f = mono(18, 700);
    text('RÉACTIVITÉ', 160, 190, f, { ls: 4, fill: C.dark });
    text('CONTRAINTES TEMPORELLES', 1760, 190, f, { ls: 4, fill: C.dark, align: 'right' });
    text('← T →', W / 2, 960, f, { ls: 8, fill: C.dark, align: 'center' });
    if (!o.quote) { line(0, 568, W, 568, C.dark, 3); return; }
    const bk = E.oExpo(P(v, .25, .7));
    if (bk > 0) {
      ctx.fillStyle = C.dark; ctx.fillRect(W / 2 - W * bk / 2, 480, W * bk, 92);
      const qf = mono(25, 700), qw = measure(QUOTE, qf, 1).w;
      typeOn(QUOTE, W / 2 - qw / 2, 536, qf, v, .4, 150, { fill: C.ink, ls: 1 });
    }
  },
  cues(d, o) {
    const f = o.flip ?? d / 2;
    const c = [[0, 'hitBig'], [.5, 'hit'], [.5, 'hitAcc'], [f, 'hitFlip']];
    if (o.quote) c.push([f + .4, 'type', .58]);
    return c;
  },
};

// ================= OBJECTIF / MISSION (paper) =================
const VERBS = ['CONCEVOIR', 'ANALYSER', 'METTRE EN ŒUVRE', 'OPTIMISER', 'EXPLOITER'];
K.mission = {
  name: 'OBJECTIF', bg: 'paper', energy: 1,
  draw(u, d) {
    bg(C.paper);
    ctx.save(); ctx.translate(0, 10 - 20 * P(u, 0, d));
    typeOn('OBJECTIF DU PARCOURS · FORMER DES SPÉCIALISTES CAPABLES DE', 120, 168, mono(17, 700), u, .05, 80, { fill: C.dark, ls: 3 });
    const f = F(74, { st: 'expanded' }), y0 = 296, lh = 106;
    const rk = E.oExpo(P(u, .1, 1.6));
    line(132, y0 - 70, 132, y0 - 70 + (lh * 4 + 96) * rk, C.dark, 2, .18);
    VERBS.forEach((vb, i) => {
      const t0 = .15 + i * .24, y = y0 + i * lh;
      const a = E.o3(P(u, t0, t0 + .25));
      dot(132, y - 26, 6 * a, C.accP, C.paper);
      text(`0${i + 1}`, 160, y - 38, mono(14, 700), { fill: C.accP, alpha: a, ls: 2 });
      reveal(vb, 200, y, f, { t: u, delay: t0, stagger: .016, dur: .42, fill: C.dark, align: 'left', ls: -2 });
    });
    const dv = E.oExpo(P(u, 1.1, 1.7));
    line(1170, 230, 1170, 230 + 540 * dv, C.dark, 1.5, .18);
    const lines = ['des systèmes automatiques', 'et temps réel, autonomes', 'et/ou embarqués.'];
    lines.forEach((l, j) => {
      const a = E.o3(P(u, 1.3 + j * .13, 1.75 + j * .13));
      text(l, 1230, 330 + j * 70 + 16 * (1 - a), serif(58), { fill: C.dark, alpha: a });
    });
    const sp = wrap('Une réponse à la demande récurrente des partenaires industriels de l’université et des laboratoires de recherche.', mono(16, 500), 560);
    const sa = E.o3(P(u, 1.9, 2.3));
    sp.forEach((l, j) => text(l, 1232, 590 + j * 26, mono(16, 500), { fill: C.dark, alpha: sa * .75 }));
    const ta = E.o3(P(u, 2.2, 2.6));
    text('SPÉCIALISATIONS', 1232, 760, mono(13, 700), { fill: C.accP, ls: 3, alpha: ta });
    text('COMMANDE · AUTONOMIE · RÉACTIVITÉ · FIABILITÉ', 1232, 786, mono(15, 700), { fill: C.dark, ls: 1, alpha: ta });
    ctx.restore();
  },
  cues() {
    const c = [[0, 'hitS']];
    VERBS.forEach((_, i) => c.push([.15 + i * .24, 'blip', i]));
    c.push([1.3, 'swell', .8], [2.2, 'tick']);
    return c;
  },
};

// ================= MENTION EEA (dark) =================
const PARCOURS = [
  ['ESET', 'Électronique des Systèmes Embarqués et Télécommunications'],
  ['SME', 'Systèmes et Microsystèmes Embarqués'],
  ['ISTR', 'Ingénierie des Systèmes Temps Réel'],
  ['RODECO', 'Robotique : Décision et Commande'],
  ['SIA-AMS', 'Signal, Imagerie et Applications Audio-vidéo Médicales et Spatiales'],
  ['RM-GBM', 'Radiophysique Médicale et Génie BioMédical'],
  ['E2-CMD', 'Énergie Électrique : Conversion, Matériaux, Développement durable'],
  ['STP', 'Sciences et Technologies des Plasmas'],
];
const SECTEURS = ['AÉRONAUTIQUE', 'ESPACE', 'ÉNERGIE', 'TÉLÉCOMMUNICATIONS', 'SANTÉ'];
K.mention = {
  name: 'MENTION EEA', bg: 'dark', energy: 1,
  draw(u, d) {
    bg(C.bg);
    const hl = 1.1, dimT = 1.3;
    reveal('MASTER', 120, 290, F(112, { st: 'expanded' }), { t: u, align: 'left', stagger: .03, dur: .45, ls: -3 });
    reveal('EEA', 120, 412, F(112, { st: 'expanded' }), { t: u, delay: .12, align: 'left', stagger: .04, dur: .45, ls: -3, fill: C.acc });
    typeOn('ÉLECTRONIQUE · ÉNERGIE ÉLECTRIQUE · AUTOMATIQUE', 124, 470, mono(16, 700), u, .3, 90, { ls: 2 });
    text('8 PARCOURS TYPES · MASTER LABELLISÉ CMI', 124, 502, mono(15, 500), { ls: 2, alpha: .6 * E.o3(P(u, .6, .9)) });
    // sectors
    const sa = E.o3(P(u, 1.6, 1.9));
    text('SECTEURS VISÉS', 124, 640, mono(13, 700), { fill: C.acc, ls: 3, alpha: sa });
    let cx = 120, cy = 668;
    SECTEURS.forEach((s, i) => {
      const f = mono(15, 700), w = measure(s, f, 2).w + 34;
      if (cx + w > 780) { cx = 120; cy += 54; }
      const a = E.oBack(P(u, 1.7 + i * .08, 1.95 + i * .08));
      if (a > 0) {
        ctx.save(); ctx.translate(cx + w / 2, cy + 19); ctx.scale(a, a);
        ctx.strokeStyle = 'rgba(242,238,228,.55)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(-w / 2, -19, w, 38, 19); ctx.stroke();
        text(s, 0, 6, f, { align: 'center', ls: 2 });
        ctx.restore();
      }
      cx += w + 12;
    });
    const ia = E.o3(P(u, 2.1, 2.4));
    text('Insertion professionnelle : ≈ 2 mois de recherche d’emploi en moyenne.', 124, 860, serif(34), { alpha: ia * .85 });
    // grid of the 8 parcours
    const gx = 860, gw = (1800 - gx - 28) / 2, gh = 120, rowsY = [200, 352, 504, 656];
    const dim = E.o3(P(u, dimT, dimT + .3));
    PARCOURS.forEach(([ac, nm], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = gx + col * (gw + 28), y = rowsY[row];
      const k = E.oExpo(P(u, .2 + i * .05, .65 + i * .05));
      if (k <= 0) return;
      const isI = ac === 'ISTR';
      ctx.save();
      ctx.globalAlpha *= k * (isI ? 1 : 1 - .55 * dim);
      ctx.translate(40 * (1 - k), 0);
      const h = isI ? E.oExpo(P(u, hl, hl + .35)) : 0;
      ctx.fillStyle = C.panel; ctx.fillRect(x, y, gw, gh);
      if (h > 0) { ctx.fillStyle = C.acc; ctx.fillRect(x, y, gw * h, gh); }
      ctx.strokeStyle = 'rgba(242,238,228,.14)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + .75, y + .75, gw - 1.5, gh - 1.5);
      const tc = h > .5 ? C.dark : C.ink;
      text(ac, x + 24, y + 54, F(38, { st: 'semi-expanded' }), { fill: tc });
      wrap(nm, mono(13.5, 500), gw - 48).slice(0, 2).forEach((l, j) => text(l, x + 24, y + 84 + j * 19, mono(13.5, 500), { fill: tc, alpha: h > .5 ? .85 : .6 }));
      text(`0${i + 1}`, x + gw - 20, y + 30, mono(12, 700), { fill: h > .5 ? C.dark : C.acc, align: 'right', alpha: .8 });
      ctx.restore();
    });
    // M1 shared with RODECO
    const bk = E.oExpo(P(u, 1.5, 1.9));
    if (bk > 0) {
      const bx = gx - 12, by = rowsY[1] - 14, bw = 2 * gw + 28 + 24, bh = gh + 28;
      ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 2; ctx.setLineDash([8, 7]);
      ctx.beginPath(); ctx.rect(bx, by, bw * bk, bh); ctx.stroke(); ctx.restore();
      const tf = mono(12, 700), tl = 'M1 COMMUN ISTR / RODECO', tw = measure(tl, tf, 2).w + 20;
      ctx.save(); ctx.globalAlpha = P(bk, .6, 1);
      ctx.fillStyle = C.acc; ctx.fillRect(bx + bw - tw, by - 12, tw, 24);
      text(tl, bx + bw - 10, by + 5, tf, { fill: C.dark, align: 'right', ls: 2 });
      ctx.restore();
    }
  },
  cues() {
    const c = [[0, 'hit']];
    for (let i = 0; i < 8; i++) c.push([.2 + i * .05, 'tick', i]);
    c.push([1.1, 'land', 0], [1.5, 'swell', .5]);
    SECTEURS.forEach((_, i) => c.push([1.7 + i * .08, 'blip', 7 + i]));
    return c;
  },
};

// ================= L'ANNÉE DE M2 (orange) =================
const YEAR = [
  { label: 'S1 — 1ER SEMESTRE', segs: [
    { c: 'EIEAT3AM', n: 'CONCEPTION OBJET', n2: '& SYSTÈMES TR', e: 4, k: 'core' },
    { c: 'EIEAT3JM', n: 'ORGANISATION', n2: '& ASPECTS HUMAINS', e: 4, k: 'core' },
    { c: 'EIEAT3CM', n: 'INGÉNIERIE SYST.', n2: '& ENTREPRISE', e: 4, k: 'core' },
    { c: 'EIEAT3DM', n: 'CHOIX 1', n2: '3 SOUS-UE PARMI 4', e: 9, k: 'choix' },
    { c: 'EIEAT3EM', n: 'CHOIX 2', n2: '3 SOUS-UE PARMI 4', e: 9, k: 'choix' }] },
  { label: 'S2 — 2ND SEMESTRE', segs: [
    { c: 'EIEAT4DM', n: 'CHOIX 3', n2: '3 SOUS-UE PARMI 4', e: 9, k: 'choix' },
    { c: 'EIEAT4CM', n: 'PROJET', n2: '125 H', e: 3, k: 'core' },
    { c: 'EIEAT4VM', n: 'LANGUE', n2: 'ANGLAIS…', e: 3, k: 'core' },
    { c: 'EIEAT4BM', n: 'STAGE', n2: 'ENTREPRISE OU LABORATOIRE', e: 15, k: 'stage' }] },
];
K.annee = {
  name: 'L’ANNÉE', bg: 'orange', energy: 1,
  draw(u, d) {
    bg(C.acc);
    const x0 = 120, x1 = 1800, pe = (x1 - x0) / 30, gap = 6, bh = 170, bys = [330, 620];
    reveal('L’ANNÉE DE M2', x0, 210, F(76, { st: 'expanded' }), { t: u, align: 'left', stagger: .02, dur: .4, ls: -2, fill: C.dark });
    typeOn('60 ECTS · ≈ 7 MOIS DE COURS PUIS ≈ 5 MOIS DE STAGE', x1, 168, mono(16, 700), u, .15, 90, { fill: C.dark, align: 'right', ls: 2 });
    typeOn('ENSEIGNEMENTS EN BLOCS · PÉDAGOGIE PAR PROJETS', x1, 198, mono(15, 500), u, .4, 90, { fill: C.dark, align: 'right', ls: 2, alpha: .75 });
    YEAR.forEach((sem, si) => {
      const by = bys[si];
      const la = E.o3(P(u, .15 + si * .6, .45 + si * .6));
      text(sem.label, x0, by - 20, mono(15, 700), { fill: C.dark, ls: 3, alpha: la });
      text('30 ECTS', x1, by - 20, mono(15, 700), { fill: C.dark, ls: 3, alpha: la, align: 'right' });
      let x = x0;
      sem.segs.forEach((s, i) => {
        const t0 = .2 + si * .6 + i * .1;
        const k = E.oExpo(P(u, t0, t0 + .5));
        const w = s.e * pe - gap;
        if (k > 0) {
          const ww = w * k;
          if (s.k === 'core') { ctx.fillStyle = C.dark; ctx.fillRect(x, by, ww, bh); }
          else if (s.k === 'choix') { ctx.save(); ctx.strokeStyle = C.dark; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, by + 1.5, ww - 3, bh - 3); ctx.restore(); }
          else { hatch(x, by, ww, bh, C.dark, 2, 14, .35); ctx.save(); ctx.strokeStyle = C.dark; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, by + 1.5, ww - 3, bh - 3); ctx.restore(); }
          const ta = E.o3(P(u, t0 + .25, t0 + .5));
          const tc = s.k === 'core' ? C.ink : C.dark;
          ctx.save(); ctx.globalAlpha *= ta; ctx.beginPath(); ctx.rect(x, by, ww, bh); ctx.clip();
          if (s.k === 'stage') { ctx.fillStyle = C.acc; ctx.fillRect(x + 10, by + 10, Math.min(w - 20, 440), 92); }
          text(s.c, x + 16, by + 28, mono(12, 500), { fill: tc, alpha: .75, ls: 1 });
          text(s.n, x + 16, by + 62, fit(s.n, F(24, { wt: 800 }), w - 32), { fill: tc });
          text(s.n2, x + 16, by + 88, fit(s.n2, mono(13, 700), w - 32), { fill: tc, alpha: .8 });
          const ef = F(50, { st: 'expanded' });
          text(String(s.e), x + 16, by + bh - 20, ef, { fill: tc });
          text('ECTS', x + 22 + measure(String(s.e), ef).w, by + bh - 22, mono(12, 700), { fill: tc, ls: 2 });
          if (s.k === 'choix') {
            for (let q = 0; q < 4; q++) {
              const qx = x + w - 16 - (4 - q) * 24, qy = by + 16;
              if (q < 3) { ctx.fillStyle = C.dark; ctx.fillRect(qx, qy, 18, 18); }
              else { ctx.strokeStyle = C.dark; ctx.lineWidth = 2; ctx.strokeRect(qx + 1, qy + 1, 16, 16); line(qx + 3, qy + 3, qx + 15, qy + 15, C.dark, 2); }
            }
          }
          ctx.restore();
        }
        x += s.e * pe;
      });
    });
    // stage dimension line + alternance note
    const sx = x0 + 15 * pe, da = E.oExpo(P(u, 1.7, 2.1));
    if (da > 0) {
      const y = bys[1] + bh + 36, xe = lerp(sx, x1 - gap, da);
      line(sx, y, xe, y, C.dark, 2); line(sx, y - 9, sx, y + 9, C.dark, 2); if (da > .98) line(x1 - gap, y - 9, x1 - gap, y + 9, C.dark, 2);
      text('≈ 5 MOIS · FRANCE OU ÉTRANGER · RAPPORT + SOUTENANCE', (sx + x1) / 2, y + 34, mono(14, 700), { fill: C.dark, align: 'center', ls: 2, alpha: da });
    }
    const aa = E.o3(P(u, 2.0, 2.4));
    text('OU EN ALTERNANCE', x0, bys[1] + bh + 42, mono(14, 700), { fill: C.dark, ls: 3, alpha: aa });
    text('Contrat de professionnalisation : les semaines « libres »', x0, bys[1] + bh + 76, serif(30), { fill: C.dark, alpha: aa });
    text('se passent en entreprise.', x0, bys[1] + bh + 108, serif(30), { fill: C.dark, alpha: aa });
    // playhead sweeping the year
    const ph = P(u, 2.2, d - .4);
    if (ph > 0 && ph < 1) {
      const si = ph < .5 ? 0 : 1, q = si ? (ph - .5) * 2 : ph * 2;
      const px = x0 + (x1 - x0) * E.ioSine(q), by = bys[si];
      line(px, by - 12, px, by + bh + 12, C.dark, 3);
      ctx.fillStyle = C.dark; ctx.beginPath(); ctx.moveTo(px - 8, by - 20); ctx.lineTo(px + 8, by - 20); ctx.lineTo(px, by - 8); ctx.fill();
    }
  },
  cues() {
    const c = [[0, 'hit']];
    for (let i = 0; i < 5; i++) c.push([.2 + i * .1, 'blip', i]);
    for (let i = 0; i < 4; i++) c.push([.8 + i * .1, 'blip', 5 + i]);
    c.push([1.7, 'swell', .5]);
    return c;
  },
};

// ================= 4 BLOCS (dark) =================
const BLOCS = [
  { n: 'COMMANDE', code: 'EIEAT3F1 · 3E1 · 4D1', ue: [['Commande linéaire avancée', 40], ['Analyse & commande des STR', 30], ['Mise en œuvre des commandes', 20]] },
  { n: 'AUTONOMIE', code: 'EIEAT3D3 · 3E4 · 4D4', ue: [['Modèles temporels avancés', 30], ['Contrôle et simulation', 30], ['Diagnostic et supervision', 30]] },
  { n: 'RÉACTIVITÉ', code: 'EIEAT3D2 · 3E2 · 4D2', ue: [['Techniques pour le temps réel', 34], ['Conception des STR', 20], ['Réseaux temps réel', 36]] },
  { n: 'FIABILITÉ', code: 'EIEAT3D4 · 3E3 · 4D3', ue: [['Sûreté de fonctionnement', 30], ['Vérification et validation', 30], ['Tolérance aux fautes', 30]] },
];
const BL = { mx: 120, gap: 24, py: 262, ph: 628 };
BL.pw = (W - 2 * BL.mx - 3 * BL.gap) / 4;
const blocRect = i => ({ x: BL.mx + i * (BL.pw + BL.gap), y: BL.py, w: BL.pw, h: BL.ph });

function miniCommande(bx, by, bw, bh, v) {
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
  if (k > 0) dot(hx, hy, 6, C.acc);
  text('y(t)', bx + 22, by + 22, mono(13), { alpha: .6, fill: C.acc });
}
function miniAutonomie(bx, by, bw, bh, v) {
  const p = [[bx + 50, by + 150], [bx + 173, by + 55], [bx + 296, by + 150]];
  const tr = [[bx + 111, by + 102], [bx + 234, by + 102], [bx + 173, by + 205]];
  const path = [p[0], tr[0], p[1], tr[1], p[2], tr[2], p[0]];
  const s = ((v * .9) % 1 + 1) % 1, seg = s * 6, si = Math.floor(seg), sf = seg - si;
  const lit = si % 2 === 0 ? -1 : (si - 1) / 2;
  for (let i = 0; i < 6; i++) arc(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], i % 2 ? 8 : 24, i % 2 ? 24 : 10, 'rgba(242,238,228,.55)', 1.5);
  for (const q of p) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q[0], q[1], 22, 0, TAU); ctx.stroke(); ctx.restore(); }
  tr.forEach((q, i) => {
    ctx.fillStyle = lit === i ? C.acc : C.ink;
    const a = Math.atan2(path[i * 2 + 2][1] - path[i * 2][1], path[i * 2 + 2][0] - path[i * 2][0]) + Math.PI / 2;
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(a); ctx.fillRect(-4, -18, 8, 36); ctx.restore();
  });
  const a = path[si], b = path[si + 1];
  ctx.save(); ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(lerp(a[0], b[0], E.io3(sf)), lerp(a[1], b[1], E.io3(sf)), 8, 0, TAU); ctx.fill(); ctx.restore();
  ['P1', 'P2', 'P3'].forEach((n, i) => text(n, p[i][0], p[i][1] + 44, mono(12), { align: 'center', alpha: .55 }));
}
function miniReact(bx, by, bw, bh, v) {
  const per = [118, 170, 250], wd = [30, 52, 74];
  ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  for (let r = 0; r < 3; r++) {
    const y = by + 30 + r * 68;
    line(bx, y + 40, bx + bw, y + 40, C.ink, 1, .25);
    for (let k = -1; k < 6; k++) {
      const x = bx + k * per[r] - ((v * 150) % per[r]) + r * 22;
      ctx.fillStyle = r === 0 ? C.acc : r === 1 ? C.ink : 'rgba(242,238,228,.35)';
      ctx.fillRect(x, y, wd[r], 36);
      line(x, y + 46, x, y - 6, C.ink, 1, .5);
    }
  }
  ctx.restore();
  const dx = bx + bw * .78;
  ctx.save(); ctx.setLineDash([5, 5]); line(dx, by, dx, by + bh - 10, C.acc, 2); ctx.restore();
  text('D', dx + 8, by + 16, mono(14, 700), { fill: C.acc });
}
function miniFiab(bx, by, bw, bh, v) {
  const fault = v > .75, vx = bx + 238, vy = by + 120;
  for (let i = 0; i < 3; i++) {
    const y = by + 22 + i * 72, bad = fault && i === 1;
    ctx.save();
    if (bad) { ctx.fillStyle = C.acc; ctx.fillRect(bx + 10, y, 100, 50); }
    ctx.strokeStyle = bad ? C.acc : C.ink; ctx.lineWidth = 2; ctx.strokeRect(bx + 10, y, 100, 50); ctx.restore();
    text(bad ? 'M2 ✕' : `M${i + 1}`, bx + 60, y + 32, mono(16, 700), { align: 'center', fill: bad ? C.dark : C.ink });
    ctx.save(); if (bad) ctx.setLineDash([4, 6]);
    arc(bx + 110, y + 25, vx, vy, 0, 30, bad ? C.acc : 'rgba(242,238,228,.6)', 1.5); ctx.restore();
    if (!bad) {
      const s = (v * 1.4 + i * .17) % 1;
      dot(lerp(bx + 110, vx - 30, s), lerp(y + 25, vy, s), 3.5, C.ink);
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
const MINI = [miniCommande, miniAutonomie, miniReact, miniFiab];

K.blocs = {
  name: 'BLOCS', bg: 'dark', energy: 2,
  draw(u, d, o) {
    bg(C.bg);
    const { mx, gap, py, ph, pw } = BL;
    reveal('SPÉCIALISATIONS', mx, 205, F(78, { st: 'expanded' }), { t: u, align: 'left', stagger: .018, dur: .4, ls: -2 });
    typeOn('M2 · CHOISIR 3 BLOCS PARMI 4 · 9 ECTS PAR SEMESTRE ET PAR CHOIX', W - mx, 150, mono(17, 500), u, .15, 80, { align: 'right', ls: 3, alpha: .7 });
    const kk = E.oBack(P(u, 1.05, 1.35));
    if (kk > 0) { ctx.save(); ctx.translate(W - mx, 205); ctx.scale(kk, kk); text('3 / 4', 0, 0, F(64, { st: 'expanded' }), { align: 'right', fill: C.acc }); ctx.restore(); }
    const dimI = o.dim ?? 1;
    const selT = [1.1, 1.25, 1.4];
    const dim = E.o3(P(u, 1.52, 1.72));
    let si = 0;
    for (let i = 0; i < 4; i++) {
      const x = mx + i * (pw + gap), dl = i * .08;
      const k = E.oExpo(P(u, dl, dl + .55));
      if (k <= 0) continue;
      const yOff = (1 - k) * 120, isDim = i === dimI;
      const st = isDim ? null : selT[si++];
      ctx.save();
      ctx.globalAlpha = isDim ? 1 - .72 * dim : 1;
      ctx.translate(0, yOff);
      ctx.beginPath(); ctx.rect(x, py, pw, ph * k); ctx.clip();
      ctx.fillStyle = C.panel; ctx.fillRect(x, py, pw, ph);
      ctx.strokeStyle = 'rgba(242,238,228,.16)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + .75, py + .75, pw - 1.5, ph - 1.5);
      ctx.globalAlpha *= E.o3(P(u, dl + .18, dl + .5));
      text(`0${i + 1}`, x + 28, py + 46, mono(18, 700), { fill: C.acc, ls: 2 });
      text(BLOCS[i].n, x + 28, py + 122, fit(BLOCS[i].n, F(52, { st: 'semi-expanded' }), pw - 56, -1), { ls: -1 });
      MINI[i](x + 28, py + 165, pw - 56, 240, u - dl - .2);
      BLOCS[i].ue.forEach(([s, h], j) => {
        const yy = py + 462 + j * 44;
        line(x + 28, yy - 28, x + pw - 28, yy - 28, C.ink, 1, .14);
        text('—  ' + s, x + 28, yy, mono(14, 400), { alpha: .85 });
        text(`${h} H`, x + pw - 28, yy, mono(13, 700), { align: 'right', alpha: .5 });
      });
      text('3 SOUS-UE', x + 28, py + ph - 28, mono(12, 500), { alpha: .4, ls: 2 });
      text(BLOCS[i].code, x + pw - 28, py + ph - 28, mono(12, 500), { align: 'right', alpha: .4, ls: 1 });
      ctx.restore();
      if (st !== null && u >= st) {
        const s = E.oExpo(P(u, st, st + .3));
        ctx.fillStyle = C.acc; ctx.fillRect(x, py + yOff, pw * s, 8);
        const b = E.oBack(P(u, st, st + .25));
        ctx.save(); ctx.translate(x + pw - 44, py + yOff + 42); ctx.scale(b, b);
        ctx.fillStyle = C.acc; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill();
        check(0, 0, 17, C.dark, 3); ctx.restore();
        const g = decay(u, st, 6);
        if (g > .01) { ctx.save(); ctx.strokeStyle = C.acc; ctx.globalAlpha = g; ctx.lineWidth = 4; ctx.strokeRect(x - 6 * (1 - g), py + yOff - 6 * (1 - g), pw + 12 * (1 - g), ph + 12 * (1 - g)); ctx.restore(); }
      }
      if (isDim && dim > 0) line(x + 20, py + ph / 2 + 20, x + 20 + (pw - 40) * dim, py + ph / 2 - 20, C.acc, 4);
    }
  },
  cues() { return [[0, 'hit'], [1.1, 'blip', 0], [1.25, 'blip', 2], [1.4, 'blip', 4], [1.55, 'tick', 0]]; },
};

// ================= DEEP DIVES (split: dark text / paper figure) =================
const SPLIT = 780;
function resp2(z, wn, t) { const s = Math.sqrt(1 - z * z), wd = wn * s; return 1 - Math.exp(-z * wn * t) * (Math.cos(wd * t) + z / s * Math.sin(wd * t)); }
function figAxes(px0, py0, px1, py1, xt, yt, xl, yl, a) {
  ctx.save(); ctx.globalAlpha *= a;
  line(px0, py1, px1, py1, C.dark, 1, .45); line(px0, py0, px0, py1, C.dark, 1, .45);
  xt.forEach(([v, s, x]) => { line(x, py1, x, py1 + 6, C.dark, 1, .45); text(s, x, py1 + 26, mono(13, 500), { fill: C.dark, align: 'center', alpha: .7 }); });
  yt.forEach(([v, s, y]) => { if (v) line(px0, y, px1, y, C.dark, 1, .08); text(s, px0 - 12, y + 5, mono(13, 500), { fill: C.dark, align: 'right', alpha: .7 }); });
  text(xl, px1, py1 + 50, mono(13, 700), { fill: C.dark, align: 'right', ls: 2, alpha: .7 });
  text(yl, px0, py0 - 16, mono(13, 700), { fill: C.dark, ls: 2, alpha: .7 });
  ctx.restore();
}
function legendItem(x, y, col, label, lw = 3) {
  const f = mono(12, 700), w = measure(label, f, 2).w;
  text(label, x, y + 4, f, { fill: C.dark, align: 'right', ls: 2 });
  line(x - w - 40, y, x - w - 12, y, col, lw);
  return w + 60;
}
function polyAlong(pts, s) {
  let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let r = s * L;
  for (let i = 0; i < seg.length; i++) {
    if (r <= seg[i]) { const q = r / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; }
    r -= seg[i];
  }
  return pts[pts.length - 1];
}

function bigCommande(u, d, x0, y0, w, h) {
  const ink = C.dark, yc = y0 + 90;
  const a = E.o3(P(u, -.25, .35));
  const sx = x0 + 150, cX = x0 + 250, cW = 170, gX = x0 + 510, gW = 170, oX = x0 + 790, fbY = yc + 118;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  text('r(t)', x0, yc + 11, serif(36), { fill: ink });
  arc(x0 + 58, yc, sx, yc, 0, 24, ink, 2.5, 12);
  ctx.beginPath(); ctx.arc(sx, yc, 24, 0, TAU); ctx.stroke();
  text('+', sx - 44, yc - 12, mono(20, 700), { fill: ink });
  text('−', sx + 10, yc + 54, mono(22, 700), { fill: ink });
  arc(sx + 24, yc, cX, yc, 0, 0, ink, 2.5, 12);
  ctx.strokeRect(cX, yc - 42, cW, 84);
  text('C(s)', cX + cW / 2, yc + 13, serif(42), { fill: ink, align: 'center' });
  text('CORRECTEUR', cX + cW / 2, yc + 68, mono(12, 700), { fill: ink, align: 'center', ls: 2, alpha: .6 });
  arc(cX + cW, yc, gX, yc, 0, 0, ink, 2.5, 12);
  text('u(t)', (cX + cW + gX) / 2, yc - 14, serif(28), { fill: ink, align: 'center' });
  ctx.strokeRect(gX, yc - 42, gW, 84);
  text('G(s)', gX + gW / 2, yc + 13, serif(42), { fill: ink, align: 'center' });
  text('PROCÉDÉ', gX + gW / 2, yc + 68, mono(12, 700), { fill: ink, align: 'center', ls: 2, alpha: .6 });
  arc(gX + gW, yc, oX + 48, yc, 0, 0, ink, 2.5, 12);
  text('y(t)', oX + 60, yc + 11, serif(36), { fill: ink });
  ctx.beginPath(); ctx.moveTo(oX, yc); ctx.lineTo(oX, fbY); ctx.lineTo(sx, fbY); ctx.lineTo(sx, yc + 38); ctx.stroke();
  arrowHead(sx, yc + 26, -Math.PI / 2, 12, ink);
  dot(oX, yc, 5, ink);
  ctx.restore();
  if (a > .5) {
    const loop = [[sx + 24, yc], [oX, yc], [oX, fbY], [sx, fbY], [sx, yc + 26]];
    for (let j = 0; j < 3; j++) { const p = polyAlong(loop, ((u * .45 + j / 3) % 1 + 1) % 1); dot(p[0], p[1], 6, C.accP, C.paper); }
  }
  // step response under uncertainty
  const px0 = x0 + 70, px1 = x0 + w - 30, py0 = y0 + 330, py1 = y0 + h - 80;
  const X = t => px0 + (px1 - px0) * t / 16, Y = v => py1 - (py1 - py0) * v / 1.5;
  const fa = E.o3(P(u, .15, .5));
  ctx.save(); ctx.globalAlpha *= fa;
  ctx.fillStyle = 'rgba(217,58,16,.10)'; ctx.fillRect(px0, Y(1.05), px1 - px0, Y(.95) - Y(1.05));
  text('±5 %', px1 - 6, Y(.95) + 18, mono(12, 700), { fill: ink, align: 'right', alpha: .6 });
  ctx.save(); ctx.setLineDash([7, 6]); line(px0, Y(1), px1, Y(1), ink, 1.5, .55); ctx.restore();
  text('CONSIGNE r = 1', px1 - 6, Y(1.05) - 10, mono(12, 700), { fill: ink, ls: 2, alpha: .6, align: 'right' });
  ctx.restore();
  figAxes(px0, py0, px1, py1, [0, 4, 8, 12, 16].map(t => [t, String(t), X(t)]), [[0, '0', Y(0)], [.5, '0,5', Y(.5)], [1.5, '1,5', Y(1.5)]], 'TEMPS (s)', 'y(t)', fa);
  const fam = [[.3, .9], [.35, 1.15], [.5, .85], [.6, 1.1], [.7, 1], [.55, 1.25]];
  const k2 = E.io3(P(u, .55, 2.1));
  ctx.save(); ctx.strokeStyle = C.grayP; ctx.lineWidth = 2; ctx.globalAlpha *= .75; ctx.lineJoin = 'round';
  for (const [z, wn] of fam) {
    ctx.beginPath();
    for (let t = 0; t <= 16 * k2; t += .05) { const x = X(t), y = Y(resp2(z, wn, t)); t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
  const z = .42, k = E.io3(P(u, .35, 2.0));
  let hx = X(0), hy = Y(0);
  ctx.save(); ctx.strokeStyle = C.accP; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
  for (let t = 0; t <= 16 * k; t += .04) { hx = X(t); hy = Y(resp2(z, 1, t)); t === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy); }
  ctx.stroke(); ctx.restore();
  if (k > 0) dot(hx, hy, 5, C.accP, C.paper);
  // annotations
  const an = E.o3(P(u, 2.05, 2.45));
  if (an > 0) {
    const tp = Math.PI / Math.sqrt(1 - z * z), pk = resp2(z, 1, tp);
    let ts = 16; for (let t = 16; t > 0; t -= .01) { if (Math.abs(resp2(z, 1, t) - 1) > .05) { ts = t; break; } }
    ctx.save(); ctx.globalAlpha *= an;
    const ax = X(tp) + 16;
    line(ax, Y(1), ax, Y(pk), ink, 1.5); line(ax - 6, Y(pk), ax + 6, Y(pk), ink, 1.5); line(ax - 6, Y(1), ax + 6, Y(1), ink, 1.5);
    const dl = `DÉPASSEMENT ≈ ${Math.round((pk - 1) * 100)} %`, dlw = measure(dl, mono(13, 700), 1).w;
    ctx.fillStyle = 'rgba(239,234,224,.9)'; ctx.fillRect(ax + 8, Y((1 + pk) / 2) - 13, dlw + 12, 24);
    text(dl, ax + 14, Y((1 + pk) / 2) + 5, mono(13, 700), { fill: ink, ls: 1 });
    line(X(ts), Y(0), X(ts), Y(1.05), ink, 1, .5);
    text(`t₅% ≈ ${ts.toFixed(1).replace('.', ',')} s`, X(ts) + 10, Y(.3), mono(13, 700), { fill: ink, ls: 1 });
    ctx.restore();
  }
  const lg = E.o3(P(u, .6, .9));
  ctx.save(); ctx.globalAlpha *= lg;
  const lw = legendItem(px1, py0 - 20, C.accP, 'NOMINAL');
  legendItem(px1 - lw, py0 - 20, C.grayP, 'MODÈLES INCERTAINS', 2);
  ctx.restore();
}

const PN = (() => {
  const pl = [[70, 0], [320, -130], [320, 130], [620, -130], [620, 130], [880, 0]];
  const tr = [[190, 0], [470, -130], [470, 130], [760, 0], [475, 300]];
  const pre = [[0], [1], [2], [3, 4], [5]], post = [[1, 2], [3], [4], [5], [0]];
  const itv = ['[1,2]', '[2,4]', '[1,3]', '[0,1]', '[3,5]'];
  const ev = [[.15, 0], [.75, 2], [1.2, 1], [1.7, 3], [2.3, 4]];
  return { pl, tr, pre, post, itv, ev, per: 2.8, fly: .34 };
})();
function bigAutonomie(u, d, x0, y0, w, h) {
  const ink = C.dark, cy = y0 + 250;
  const at = ([x, y]) => [x0 + x, cy + y];
  const a = E.o3(P(u, -.25, .35));
  ctx.save(); ctx.globalAlpha *= a;
  // arcs
  PN.pre.forEach((ps, t) => {
    const T = at(PN.tr[t]);
    ps.forEach(p => { const Pp = at(PN.pl[p]); arc(Pp[0], Pp[1], T[0], T[1], 32, 10, ink, 2, 11); });
    PN.post[t].forEach(p => { const Pp = at(PN.pl[p]); arc(T[0], T[1], Pp[0], Pp[1], 9, 33, ink, 2, 11); });
  });
  PN.pl.forEach((p, i) => {
    const [x, y] = at(p);
    ctx.fillStyle = C.paper; ctx.strokeStyle = ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.fill(); ctx.stroke();
    text(`P${i + 1}`, x, y + 56, mono(13, 700), { fill: ink, align: 'center', alpha: .55 });
  });
  ctx.restore();
  // token game
  const M = [1, 0, 0, 0, 0, 0];
  let flying = null;
  if (u > .05) {
    const tau = ((u - .05) % PN.per + PN.per) % PN.per;
    for (const [et, t] of PN.ev) {
      if (tau >= et + PN.fly) { PN.pre[t].forEach(p => M[p]--); PN.post[t].forEach(p => M[p]++); }
      else if (tau >= et) { PN.pre[t].forEach(p => M[p]--); flying = { t, q: (tau - et) / PN.fly }; }
    }
  }
  PN.tr.forEach((q, t) => {
    const [x, y] = at(q), on = flying && flying.t === t;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = on ? C.accP : ink; ctx.fillRect(x - 7, y - 36, 14, 72); ctx.restore();
    text(PN.itv[t], x, y - 48, mono(14, 700), { fill: on ? C.accP : ink, align: 'center', alpha: a * .8 });
  });
  if (a > .5) {
    M.forEach((m, i) => { if (m > 0) { const [x, y] = at(PN.pl[i]); dot(x, y, 10, C.accP); } });
    if (flying) {
      const T = at(PN.tr[flying.t]);
      if (flying.q < .5) PN.pre[flying.t].forEach(p => { const S = at(PN.pl[p]), e = E.io3(flying.q * 2); dot(lerp(S[0], T[0], e), lerp(S[1], T[1], e), 10, C.accP, C.paper); });
      else PN.post[flying.t].forEach(p => { const S = at(PN.pl[p]), e = E.io3((flying.q - .5) * 2); dot(lerp(T[0], S[0], e), lerp(T[1], S[1], e), 10, C.accP, C.paper); });
    }
  }
  // legend + (max,+)
  const la = E.o3(P(u, .5, .9));
  ctx.save(); ctx.globalAlpha *= la;
  const ly = y0 + 620;
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x0 + 12, ly - 5, 11, 0, TAU); ctx.stroke();
  text('PLACE', x0 + 34, ly, mono(12, 700), { fill: ink, ls: 2 });
  ctx.fillStyle = ink; ctx.fillRect(x0 + 140, ly - 18, 8, 26);
  text('TRANSITION · INTERVALLE DE TIR [a,b]', x0 + 160, ly, mono(12, 700), { fill: ink, ls: 2 });
  dot(x0 + 530, ly - 5, 8, C.accP);
  text('JETON', x0 + 546, ly, mono(12, 700), { fill: ink, ls: 2 });
  ctx.restore();
  const ea = E.o3(P(u, 1.0, 1.4));
  line(x0, y0 + 660, x0 + w - 30, y0 + 660, ink, 1, .15 * ea);
  text('ALGÈBRE (MAX,+) · GRAPHES D’ÉVÉNEMENTS TEMPORISÉS', x0, y0 + 702, mono(13, 700), { fill: C.accP, ls: 3, alpha: ea });
  text('x(k+1) = A ⊗ x(k) ⊕ B ⊗ u(k)', x0, y0 + 762, serif(50, false), { fill: ink, alpha: ea });
}

const TASKS = [{ C: 1, T: 4 }, { C: 2, T: 6 }, { C: 3, T: 12 }];
const SCHED = (() => {
  const rem = [0, 0, 0], segs = [[], [], []]; let miss = 0;
  for (let t = 0; t < 24; t++) {
    TASKS.forEach((k, i) => { if (t % k.T === 0) { if (rem[i] > 0) miss++; rem[i] = k.C; } });
    const i = rem.findIndex(r => r > 0);
    if (i >= 0) { rem[i]--; const s = segs[i]; if (s.length && s[s.length - 1][1] === t) s[s.length - 1][1] = t + 1; else s.push([t, t + 1]); }
  }
  return { segs, miss };
})();
const U_RM = TASKS.reduce((a, k) => a + k.C / k.T, 0);
// Gantt of the rate-monotonic schedule; shared by the 30 s "ordo" scene and the Réactivité dive.
function gantt(u, g) {
  const { X0, X1, rows, bh, axisY, topY, p, lblX, lblF, out } = g;
  const U = (X1 - X0) / 24, px = X0 + p * U, ink = C.dark;
  const O = out || (() => 0);
  ctx.save(); ctx.translate(O(4), 0);
  const ga = E.o3(P(u, -.1, .3));
  for (let i = 0; i <= 24; i++) {
    const x = X0 + i * U;
    line(x, topY, x, axisY - 15, ink, 1, (i % 2 ? .06 : .12) * ga);
    line(x, axisY, x, i % 2 ? axisY + 8 : axisY + 16, ink, 2, ga);
    if (i % 2 === 0) text(String(i), x, axisY + 44, mono(15, 500), { fill: ink, align: 'center', alpha: ga });
  }
  line(X0, axisY, X0 + 24 * U * E.oExpo(P(u, -.1, .5)), axisY, ink, 2.5);
  text('t', X1 + 22, axisY + 6, serif(34), { fill: ink, alpha: ga });
  ctx.restore();
  rows.forEach((y, r) => {
    ctx.save(); ctx.translate(O(r + 1), 0);
    const ra = E.o3(P(u, .0 + r * .06, .35 + r * .06));
    text(`τ${r + 1}`, lblX, y + 18, lblF, { fill: ink, alpha: ra });
    text(`C=${TASKS[r].C}  T=${TASKS[r].T}`, lblX + lblF.px * 1.3, y + 16, mono(14, 500), { fill: ink, alpha: .6 * ra });
    line(X0, y + bh / 2 + 4, X1, y + bh / 2 + 4, ink, 1, .2 * ra);
    ctx.save(); ctx.beginPath(); ctx.rect(X0 - 2, y - 80, Math.max(0, px - X0 + 2), 180); ctx.clip();
    for (const [a, b] of SCHED.segs[r]) {
      const x = X0 + a * U + 1, w = (b - a) * U - 2;
      if (r === 2) { hatch(x, y - bh / 2, w, bh, ink, 2, 12); ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y - bh / 2 + 1, w - 2, bh - 2); ctx.restore(); }
      else { ctx.fillStyle = r === 0 ? ink : C.accP; ctx.fillRect(x, y - bh / 2, w, bh); }
    }
    ctx.restore();
    for (let rt = 0; rt <= 24; rt += TASKS[r].T) {
      if (p < rt - .001) continue;
      const k = E.oBack(cl((p - rt) / 1.2)), x = X0 + rt * U;
      line(x, y + bh / 2 + 10, x, y + bh / 2 + 10 - (bh + 20) * k, ink, 2.5);
      arrowHead(x, y + bh / 2 + 10 - (bh + 20) * k, -Math.PI / 2, 12 * k, ink);
      if (rt > 0) {
        ctx.save(); ctx.fillStyle = C.accP; ctx.translate(x, y - bh / 2 - 12);
        ctx.beginPath(); ctx.moveTo(-9 * k, -12 * k); ctx.lineTo(9 * k, -12 * k); ctx.lineTo(0, 2 * k); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
  });
  if (p > 0 && p < 23.99) {
    line(px, topY - 20, px, axisY, C.accP, 3);
    dot(px, topY - 20, 7, C.accP);
  }
}
function ganttLegend(x, y, xr, a) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = C.dark; ctx.fillRect(x, y - 15, 26, 16);
  text('EXÉCUTION', x + 38, y, mono(14, 500), { fill: C.dark, ls: 2 });
  line(x + 223, y + 3, x + 223, y - 19, C.dark, 2.5); arrowHead(x + 223, y - 19, -Math.PI / 2, 10, C.dark);
  text('ACTIVATION', x + 240, y, mono(14, 500), { fill: C.dark, ls: 2 });
  ctx.fillStyle = C.accP; ctx.beginPath(); ctx.moveTo(x + 438, y - 15); ctx.lineTo(x + 456, y - 15); ctx.lineTo(x + 447, y - 1); ctx.fill();
  text('ÉCHÉANCE', x + 468, y, mono(14, 500), { fill: C.dark, ls: 2 });
  if (xr) text('RATE MONOTONIC · PRIORITÉS FIXES · PRÉEMPTION', xr, y, mono(14, 500), { fill: C.dark, ls: 2, align: 'right', alpha: .6 });
  ctx.restore();
}
function bigReact(u, d, x0, y0, w, h) {
  const p = 24 * E.ioSine(P(u, .15, d - .9));
  const X0 = x0 + 150, X1 = x0 + w - 40;
  gantt(u, { X0, X1, rows: [y0 + 200, y0 + 340, y0 + 480], bh: 72, axisY: y0 + 590, topY: y0 + 130, p, lblX: x0, lblF: F(46) });
  text(`U = Σ Cᵢ/Tᵢ = ${U_RM.toFixed(3)}`, X1, y0 + 30, mono(20, 700), { fill: C.dark, align: 'right', alpha: E.o3(P(u, .2, .5)) });
  if (p >= 23.9) {
    const k = E.oBack(P(u, d - .9, d - .65));
    ctx.save(); ctx.translate(X1, y0 + 72); ctx.scale(k, k);
    const s = `${SCHED.miss} ÉCHÉANCE MANQUÉE`, f = mono(20, 700), sw = measure(s, f).w;
    text(s, 0, 0, f, { fill: C.dark, align: 'right' }); check(-sw - 22, -7, 22, C.accP, 4);
    ctx.restore();
  } else text(`t = ${p.toFixed(1)}`, X1, y0 + 72, mono(20, 500), { fill: C.dark, align: 'right', alpha: .6 * E.o3(P(u, .2, .5)) });
  ganttLegend(x0, y0 + 700, null, E.o3(P(u, .6, .9)));
  text('RATE MONOTONIC · PRIORITÉS FIXES · PRÉEMPTION', x0, y0 + 748, mono(14, 500), { fill: C.dark, ls: 2, alpha: .6 * E.o3(P(u, .6, .9)) });
}

function bigFiab(u, d, x0, y0, w, h) {
  const ink = C.dark, fT = 1.35, fault = u >= fT;
  const a = E.o3(P(u, -.25, .35));
  const busX = x0 + 120, mX = x0 + 190, mW = 170, mH = 64, vX = x0 + 560, vY = y0 + 150, oX = x0 + 800;
  const cyM = [y0 + 50, y0 + 150, y0 + 250];
  ctx.save(); ctx.globalAlpha *= a;
  text('ENTRÉE', x0, vY - 16, mono(13, 700), { fill: ink, ls: 2 });
  line(x0, vY, busX, vY, ink, 2.5); line(busX, cyM[0], busX, cyM[2], ink, 2.5);
  cyM.forEach((cy, i) => {
    const bad = fault && i === 1;
    arc(busX, cy, mX, cy, 0, 0, ink, 2.5, 11);
    if (bad) { ctx.fillStyle = C.accP; ctx.fillRect(mX, cy - mH / 2, mW, mH); }
    ctx.strokeStyle = bad ? C.accP : ink; ctx.lineWidth = 2.5; ctx.strokeRect(mX, cy - mH / 2, mW, mH);
    text(bad ? `M${i + 1}  ✕` : `M${i + 1}`, mX + mW / 2, cy + 8, mono(20, 700), { fill: bad ? C.paper : ink, align: 'center' });
    ctx.save(); if (bad) ctx.setLineDash([6, 7]);
    arc(mX + mW, cy, vX, vY, 0, 42, bad ? C.accP : ink, 2.5, 11); ctx.restore();
  });
  ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(vX, vY, 42, 0, TAU); ctx.stroke();
  text('2/3', vX, vY + 7, mono(20, 700), { fill: ink, align: 'center' });
  text('VOTEUR', vX, vY + 70, mono(12, 700), { fill: ink, align: 'center', ls: 2, alpha: .6 });
  arc(vX + 42, vY, oX, vY, 0, 0, ink, 2.5, 12);
  text('SORTIE', oX + 14, vY + 6, mono(13, 700), { fill: ink, ls: 2 });
  ctx.restore();
  if (a > .5) {
    cyM.forEach((cy, i) => {
      if (fault && i === 1) return;
      const pth = [[x0, vY], [busX, vY], [busX, cy], [mX, cy], [mX + mW, cy], [vX - 42, vY]];
      const s = ((u * .7 + i * .21) % 1 + 1) % 1;
      const q = polyAlong(pth, s);
      if (!(q[0] > mX - 6 && q[0] < mX + mW + 6)) dot(q[0], q[1], 5, C.accP, C.paper);
    });
    const s = ((u * 1.1) % 1 + 1) % 1; dot(lerp(vX + 42, oX, s), vY, 5, C.accP, C.paper);
  }
  // fault injection
  const z = P(u, fT - .12, fT + .05);
  if (z > 0 && z < 1 || (u >= fT && u < fT + .4)) {
    const bx = mX + mW / 2, top = cyM[1] - 150;
    const al = u < fT + .05 ? 1 : 1 - P(u, fT + .05, fT + .4);
    ctx.save(); ctx.globalAlpha *= al; ctx.strokeStyle = C.accP; ctx.lineWidth = 5; ctx.lineJoin = 'miter';
    ctx.beginPath(); ctx.moveTo(bx + 30, top); ctx.lineTo(bx - 10, top + 60 * Math.min(1, z * 2)); ctx.lineTo(bx + 20, top + 70); ctx.lineTo(bx - 8, cyM[1] - mH / 2 - 4); ctx.stroke(); ctx.restore();
  }
  if (u >= fT + .35) {
    const k = E.oBack(P(u, fT + .35, fT + .6));
    ctx.save(); ctx.translate(oX + 14, vY + 46); ctx.scale(k, k);
    check(10, -6, 20, C.accP, 4); text('SORTIE CORRECTE', 30, 0, mono(13, 700), { fill: ink, ls: 2 }); ctx.restore();
  }
  // reliability: simplex vs TMR
  const px0 = x0 + 70, px1 = x0 + w - 30, pyT = y0 + 420, pyB = y0 + h - 70;
  const X = v => px0 + (px1 - px0) * v / 2, Y = r => pyB - (pyB - pyT) * r;
  const fa = E.o3(P(u, .3, .7));
  figAxes(px0, pyT, px1, pyB, [[0, '0', X(0)], [.5, '0,5', X(.5)], [1, '1', X(1)], [1.5, '1,5', X(1.5)], [2, '2', X(2)]],
    [[0, '0', Y(0)], [.5, '0,5', Y(.5)], [1, '1', Y(1)]], 'λt', 'FIABILITÉ R(t)', fa);
  const k = E.io3(P(u, .5, 2.4));
  const Rs = x => Math.exp(-x), Rt = x => 3 * Math.exp(-2 * x) - 2 * Math.exp(-3 * x);
  const curve = (fn, col, lw) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
    for (let x = 0; x <= 2 * k + 1e-9; x += .01) { const px = X(x), py = Y(fn(x)); x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke(); ctx.restore();
  };
  if (k > 0) { curve(Rs, C.grayP, 2); curve(Rt, C.accP, 3); }
  if (k > .36) {
    const ca = E.oBack(P(u, 1.3, 1.55)), lx = X(Math.LN2), ly = Y(.5);
    ctx.save(); ctx.translate(lx, ly); ctx.scale(ca, ca); dot(0, 0, 6, C.accP, C.paper); ctx.restore();
    text('λt = ln 2  ·  R = 0,5', lx + 16, ly - 14, mono(13, 700), { fill: ink, ls: 1, alpha: P(u, 1.3, 1.5) });
    const ra = E.o3(P(u, 1.7, 2.1)) * .75;
    line(lx, Y(0), lx, ly + 8, ink, 1, .35 * ra / .75);
    text('◀ TMR PLUS FIABLE', lx - 14, Y(.08), mono(12, 700), { fill: ink, ls: 2, align: 'right', alpha: ra });
    text('SIMPLEX PLUS FIABLE ▶', lx + 14, Y(.08), mono(12, 700), { fill: ink, ls: 2, alpha: ra });
  }
  const lg = E.o3(P(u, .6, .9));
  ctx.save(); ctx.globalAlpha *= lg;
  const lw = legendItem(px1, pyT - 20, C.accP, 'TMR · VOTE 2 SUR 3');
  legendItem(px1 - lw, pyT - 20, C.grayP, 'SIMPLEX', 2);
  ctx.restore();
}

const DIVE = [
  { n: 'COMMANDE', tag: 'Modéliser, quantifier les performances, analyser la robustesse, synthétiser des correcteurs.',
    ue: [{ c: 'EIEAT3F1', s: 'S1', n: 'Commande linéaire avancée', h: [8, 20, 12] }, { c: 'EIEAT3E1', s: 'S1', n: 'Analyse et commande des systèmes temps réel', h: [10, 12, 8] }, { c: 'EIEAT4D1', s: 'S2', n: 'Conception et mise en œuvre des commandes TR', h: [0, 6, 14] }],
    tp: 'TP : procédé à trois bacs d’eau · modèle de lanceur · bras robotisé · systèmes à retard', fig: 'BOUCLE FERMÉE · RÉPONSE INDICIELLE ET ROBUSTESSE', vis: bigCommande },
  { n: 'AUTONOMIE', tag: 'Prendre en compte le temps dans les modèles à événements discrets.',
    ue: [{ c: 'EIEAT3D3', s: 'S1', n: 'Modèles temporels avancés', h: [7, 19, 4] }, { c: 'EIEAT3E4', s: 'S1', n: 'Contrôle et simulation', h: [5, 10, 15] }, { c: 'EIEAT4D4', s: 'S2', n: 'Diagnostic et supervision', h: [6, 16, 8] }],
    tp: 'Petri temporels & stochastiques · (max,+) · DEVS · hardware-in-the-loop · diagnostiqueur', fig: 'RÉSEAU DE PETRI TEMPOREL · JEU DE JETONS', vis: bigAutonomie },
  { n: 'RÉACTIVITÉ', tag: 'Vérifier les exigences de réactivité, du calculateur au réseau.',
    ue: [{ c: 'EIEAT3D2', s: 'S1', n: 'Techniques pour le temps réel', h: [10, 12, 12] }, { c: 'EIEAT3E2', s: 'S1', n: 'Conception des systèmes temps réel', h: [4, 8, 8] }, { c: 'EIEAT4D2', s: 'S2', n: 'Réseaux temps réel', h: [16, 8, 12] }],
    tp: 'OS temps réel Trampoline · OSEK/VDX · multi-cœurs · UML2 / MARTE / SysML · CAN · AFDX', fig: 'ORDONNANCEMENT RATE MONOTONIC · 3 TÂCHES', vis: bigReact },
  { n: 'FIABILITÉ', tag: 'Concevoir, vérifier et valider des systèmes sûrs, tolérants aux fautes.',
    ue: [{ c: 'EIEAT3D4', s: 'S1', n: 'Sûreté de fonctionnement', h: [6, 20, 4] }, { c: 'EIEAT3E3', s: 'S1', n: 'Vérification et validation', h: [6, 12, 12] }, { c: 'EIEAT4D3', s: 'S2', n: 'Tolérance aux fautes', h: [6, 12, 12] }],
    tp: 'Gestion du risque · model-checking · test · redondance spatiale & temporelle · COM/MON', fig: 'REDONDANCE MODULAIRE TRIPLE · FIABILITÉ R(t)', vis: bigFiab },
];
K.dive = {
  name: 'BLOC', energy: 2,
  bg: { left: 'dark', right: 'paper', split: SPLIT },
  draw(u, d, o) {
    const B = DIVE[o.i], L0 = 110, maxW = SPLIT - L0 - 60;
    ctx.fillStyle = C.bg; ctx.fillRect(-300, -300, SPLIT + 300, H + 600);
    ctx.fillStyle = C.paper; ctx.fillRect(SPLIT, -300, W - SPLIT + 300, H + 600);
    const ha = E.o3(P(u, -.35, .05));
    const hf = mono(16, 700), hl = `BLOC 0${o.i + 1} / 04`;
    text(hl, L0, 150, hf, { fill: C.acc, ls: 3, alpha: ha });
    const hw = measure(hl, hf, 3).w;
    ctx.save(); ctx.globalAlpha *= ha;
    for (let j = 0; j < 4; j++) { ctx.fillStyle = j === o.i ? C.acc : 'rgba(242,238,228,.22)'; ctx.fillRect(L0 + hw + 22 + j * 24, 140, 18, 6); }
    ctx.restore();
    reveal(B.n, L0, 262, fit(B.n, F(100, { st: 'expanded' }), maxW, -2), { t: u, delay: -.3, stagger: .03, dur: .45, align: 'left', ls: -2 });
    wrap(B.tag, serif(35), maxW - 10).forEach((l, j) => text(l, L0, 324 + j * 42, serif(35), { alpha: E.o3(P(u, .05 + j * .08, .45 + j * .08)) }));
    const pxh = (maxW - 90) / 40, cols = [C.hC, C.hTD, C.hTP];
    B.ue.forEach((ue, j) => {
      const y = 470 + j * 122, t0 = .3 + j * .15;
      const a = E.o3(P(u, t0, t0 + .35));
      text(`${ue.c} · ${ue.s}`, L0, y, mono(13, 700), { fill: C.acc, ls: 2, alpha: a });
      text(ue.n, L0, y + 33, fit(ue.n, F(26, { wt: 700 }), maxW), { alpha: a });
      const k = E.oExpo(P(u, t0 + .15, t0 + .8)), tot = ue.h[0] + ue.h[1] + ue.h[2];
      const by = y + 50, bh = 16;
      const segs = ue.h.map((hh, q) => ({ w: hh * pxh, col: cols[q] })).filter(s => s.w > 0);
      ctx.save(); ctx.beginPath(); ctx.rect(L0, by - 2, tot * pxh * k, bh + 4); ctx.clip();
      let x = L0;
      segs.forEach((s, q) => { const last = q === segs.length - 1; barH(x, by, s.w - (last ? 0 : 2), bh, s.col, last); x += s.w; });
      ctx.restore();
      if (k > 0) text(`${tot} H`, L0 + tot * pxh * k + 12, by + 14, mono(15, 700), { alpha: a });
      const parts = [];
      if (ue.h[0]) parts.push(`COURS ${ue.h[0]} H`); parts.push(`TD ${ue.h[1]} H`); parts.push(`TP ${ue.h[2]} H`);
      text(parts.join('  ·  '), L0, by + 42, mono(12, 500), { alpha: a * .6, ls: 1 });
    });
    const lga = E.o3(P(u, .8, 1.1));
    ctx.save(); ctx.globalAlpha *= lga;
    let lx = L0;
    [['COURS', C.hC], ['TD', C.hTD], ['TP', C.hTP]].forEach(([n, c]) => {
      barH(lx, 855, 14, 14, c, true); text(n, lx + 22, 868, mono(12, 700), { ls: 2 }); lx += 22 + measure(n, mono(12, 700), 2).w + 28;
    });
    text('HEURES ENCADRÉES PAR SOUS-UE', lx + 10, 868, mono(12, 500), { ls: 2, alpha: .5 });
    ctx.restore();
    wrap(B.tp, mono(13, 500), maxW).slice(0, 2).forEach((l, j) => text(l, L0, 918 + j * 22, mono(13, 500), { alpha: .6 * E.o3(P(u, 1.1, 1.4)) }));
    // figure
    const fx = SPLIT + 80;
    text(`FIG. 0${o.i + 1} — ${B.fig}`, fx, 130, mono(13, 700), { fill: C.dark, ls: 3, alpha: ha });
    clipRect(SPLIT, 0, W - SPLIT, H, () => B.vis(u, d, fx, 180, W - SPLIT - 150, 780));
  },
  cues(d, o) {
    const c = [[0, 'hitS'], [.3, 'blip', 0], [.45, 'blip', 2], [.6, 'blip', 4]];
    if (o.i === 0) c.push([.35, 'swell', 1.6], [2.05, 'tick', 3]);
    if (o.i === 1) for (let t = .05; t < d; t += PN.per) PN.ev.forEach(([et]) => { if (t + et < d) c.push([t + et, 'tick', 2]); });
    if (o.i === 2) for (let q = 0; q <= 24; q++) c.push([.15 + (d - 1.05) * (0.5 - 0.5 * Math.cos(Math.PI * q / 24)), 'tick', q % 4 ? 1 : 3]);
    if (o.i === 3) c.push([1.23, 'zap'], [1.7, 'land', 1]);
    if (o.i === 2) c.push([d - .9, 'land', 2]);
    return c;
  },
};

// ================= ORDONNANCEMENT (paper, 30 s cut) =================
K.ordo = {
  name: 'ORDONNANCEMENT', bg: 'paper', energy: 2,
  draw(u, d) {
    bg(C.paper);
    const s = 1.06 - .06 * E.o3(P(u, 0, d));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.rotate(-.01 * (1 - E.o3(P(u, 0, d)))); ctx.translate(-W / 2, -H / 2);
    const out = gI => (gI % 2 ? 1 : -1) * W * 1.2 * E.iExpo(P(u, d - .32 + gI * .035, d - .02));
    const pEnd = d - .75, p = 24 * E.ioSine(P(u, .18, pEnd));
    ctx.save(); ctx.translate(out(0), 0);
    reveal('ORDONNANCEMENT', 120, 205, F(90, { st: 'expanded' }), { t: u, align: 'left', stagger: .02, dur: .4, ls: -3, fill: C.dark });
    typeOn('EIEAT3D2 · TECHNIQUES POUR LE TEMPS RÉEL — RATE MONOTONIC, n = 3', 122, 258, mono(17, 500), u, .2, 90, { fill: C.dark, ls: 2, alpha: .75 });
    text(`U = Σ Cᵢ/Tᵢ = ${U_RM.toFixed(3)}`, 1800, 150, mono(22, 700), { fill: C.dark, align: 'right', alpha: E.o3(P(u, .3, .6)) });
    if (p >= 23.9) {
      const k = E.oBack(P(u, pEnd, pEnd + .23));
      ctx.save(); ctx.translate(1800, 205); ctx.scale(k, k);
      const st = `${SCHED.miss} ÉCHÉANCE MANQUÉE`, f = mono(22, 700), sw = measure(st, f).w;
      text(st, 0, 0, f, { fill: C.dark, align: 'right' }); check(-sw - 24, -8, 24, C.accP, 4); ctx.restore();
    } else text(`t = ${p.toFixed(2)}`, 1800, 205, mono(22, 500), { fill: C.dark, align: 'right', alpha: .6 * E.o3(P(u, .3, .6)) });
    ctx.restore();
    gantt(u, { X0: 330, X1: 1800, rows: [405, 540, 675], bh: 72, axisY: 760, topY: 350, p, lblX: 120, lblF: F(54), out });
    ctx.save(); ctx.translate(out(5), 0);
    ganttLegend(122, 895, 1800, E.o3(P(u, .5, .8)));
    ctx.restore();
    ctx.restore();
  },
  cues(d) {
    const c = [[0, 'hitS']];
    for (let q = 0; q <= 24; q++) c.push([.18 + (d - .93) * (0.5 - 0.5 * Math.cos(Math.PI * q / 24)), 'tick', q % 4 ? 1 : 3]);
    c.push([d - .75, 'land', 2], [d - .32, 'whooshOut', .3]);
    return c;
  },
};

// ================= MOTS-CLÉS (dark) =================
const NET = (() => {
  const r = rng(7), n = 46, nodes = [];
  for (let i = 0; i < n; i++) nodes.push({ x: (r() - .5) * 2600, y: (r() - .5) * 1500, z: (r() - .5) * 1400, kind: r() < .35 ? 1 : 0 });
  const edges = [];
  nodes.forEach((a, i) => {
    const ds = nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2]).filter(q => q[0] !== i).sort((p, q) => p[1] - q[1]);
    for (let k = 0; k < 2; k++) { const j = ds[k][0]; if (!edges.some(e => e[0] === j && e[1] === i)) edges.push([i, j]); }
  });
  const packets = edges.filter((_, i) => i % 3 === 0).map(e => ({ e, off: r(), sp: .8 + r() * 1.2 }));
  return { nodes, edges, packets };
})();
function project(nd, a, tilt) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const x = nd.x * ca - nd.z * sa; let z = nd.x * sa + nd.z * ca;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const y2 = nd.y * ct - z * st; z = nd.y * st + z * ct;
  const f = 1300, dd = z + 1500;
  return { x: W / 2 + x * f / dd, y: H / 2 + y2 * f / dd, s: f / dd, d: dd };
}
const WORDS = [
  { t: 'Réseaux de Petri', f: serif(200), c: 'ink', code: 'EIEAT3D3 · MODÈLES TEMPORELS AVANCÉS' },
  { t: 'MODEL-CHECKING', f: F(170, { st: 'expanded' }), c: 'acc', code: 'EIEAT3E3 · VÉRIFICATION ET VALIDATION' },
  { t: 'CAN · AFDX', f: F(310, { st: 'condensed' }), c: 'ink', stroke: true, code: 'EIEAT4D2 · RÉSEAUX TEMPS RÉEL' },
  { t: 'Network Calculus', f: serif(210), c: 'acc', code: 'EIEAT4D2 · CONTRAINTES TEMPORELLES' },
  { t: 'UML2 / MARTE / SysML', f: mono(120, 700), c: 'ink', code: 'EIEAT3E2 · CONCEPTION DES SYSTÈMES TEMPS RÉEL' },
  { t: 'OSEK/VDX', f: F(250, { st: 'expanded' }), c: 'dark', box: true, code: 'EIEAT3D2 · NORME INDUSTRIELLE (AUTOMOBILE)' },
  { t: '(max,+)', f: serif(330, false), c: 'ink', code: 'EIEAT3E4 · CONTRÔLE ET SIMULATION' },
  { t: 'H∞ · µ-analyse', f: serif(230), c: 'acc', code: 'EIEAT3F1 · COMMANDE LINÉAIRE AVANCÉE' },
];
K.mots = {
  name: 'MOTS-CLÉS', bg: 'dark', energy: 3,
  draw(u, d, o) {
    bg(C.bg);
    const list = (o.words || [0, 1, 2, 3, 4, 5, 6, 7]).map(i => WORDS[i]), n = list.length, wd = d / n;
    const a = -.5 + u * .21, tilt = .18 - u * .03;
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
      ctx.save(); ctx.globalAlpha = na * cl(1.5 - q.d / 2000, .15, .8);
      if (NET.nodes[i].kind) { ctx.fillStyle = C.ink; ctx.fillRect(q.x - 3 * q.s, q.y - 16 * q.s, 6 * q.s, 32 * q.s); }
      else { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, 14 * q.s, 0, TAU); ctx.stroke(); }
      ctx.restore();
    });
    for (const pk of NET.packets) {
      const s = (u * pk.sp + pk.off) % 1, A = pr[pk.e[0]], B = pr[pk.e[1]];
      ctx.save(); ctx.globalAlpha = na * .9; ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(lerp(A.x, B.x, s), lerp(A.y, B.y, s), 4.5 * lerp(A.s, B.s, s), 0, TAU); ctx.fill(); ctx.restore();
    }
    const sg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 900);
    sg.addColorStop(0, 'rgba(11,11,14,.72)'); sg.addColorStop(1, 'rgba(11,11,14,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
    if (u < 0) return;
    const i = Math.min(n - 1, Math.floor(u / wd)), w = u - i * wd, wdd = list[i];
    const f = fit(wdd.t, wdd.f, 1400), m = measure(wdd.t, f);
    const cy = 520, base = cy + (m.asc - m.desc) / 2;
    const k = E.oExpo(P(w, 0, .14)), sc = lerp(1.22, 1, k) + .05 * w;
    const col = wdd.c === 'acc' ? C.acc : wdd.c === 'dark' ? C.dark : C.ink;
    ctx.save(); ctx.translate(W / 2, cy); ctx.scale(sc, sc); ctx.translate(-W / 2, -cy);
    if (wdd.box) { const bw = (m.w + 80) * E.oExpo(P(w, 0, .1)); ctx.fillStyle = C.acc; ctx.fillRect(W / 2 - bw / 2, cy - m.asc / 2 - 40, bw, m.asc + 80); }
    const g = 1 - k;
    if (g > .02) {
      text(wdd.t, W / 2 - 22 * g, base, f, { align: 'center', fill: wdd.stroke ? null : C.acc, stroke: wdd.stroke ? C.acc : null, lw: 4, alpha: .6 * g });
      text(wdd.t, W / 2 + 22 * g, base, f, { align: 'center', fill: wdd.stroke ? null : '#3AE6FF', stroke: wdd.stroke ? '#3AE6FF' : null, lw: 4, alpha: .35 * g });
    }
    text(wdd.t, W / 2, base, f, { align: 'center', fill: wdd.stroke ? null : col, stroke: wdd.stroke ? col : null, lw: 4, alpha: cl(w / .03) });
    ctx.restore();
    typeOn(wdd.code, W / 2, 780, mono(20, 500), w, .03, 160, { align: 'center', ls: 4, alpha: .65 });
    text(String(i + 1).padStart(2, '0'), 70, 520, F(64, { st: 'expanded' }), { fill: C.acc });
    text('/' + String(n).padStart(2, '0'), 74, 552, mono(16, 500), { alpha: .5 });
    line(72, 580, 72, 880, C.ink, 1, .2);
    line(72, 580, 72, 580 + 300 * (u / d), C.acc, 3);
    text('MOTS-CLÉS', 1860, 940, mono(15, 500), { align: 'right', ls: 4, alpha: .5 });
    text('SYLLABUS · M2', 1860, 966, mono(15, 500), { align: 'right', ls: 4, alpha: .3 });
  },
  cues(d, o) {
    const n = (o.words || [0, 1, 2, 3, 4, 5, 6, 7]).length, c = [[0, 'hitCut']];
    const sc = [0, 3, 7, 10, 12, 15, 19, 22];
    for (let i = 0; i < n; i++) c.push([i * d / n, 'wordBlip', sc[i % 8]]);
    return c;
  },
};

// ================= PROJET & STAGE (paper, 60 s cut) =================
const STEPS = ['Analyse du cahier des charges', 'Spécification fonctionnelle', 'Architectures matérielle & logicielle', 'Conception, développement, intégration', 'Validation et livraison du produit'];
const STAGE = [
  ['OÙ', 'Entreprise — grand groupe, PME, startup — ou laboratoire'],
  ['OÙ ENCORE', 'En France ou à l’étranger'],
  ['DURÉE', '≈ 5 mois, au second semestre'],
  ['À LA FIN', 'Rapport et soutenance'],
];
K.projet = {
  name: 'PROJET & STAGE', bg: 'paper', energy: 1,
  draw(u, d) {
    bg(C.paper);
    const ink = C.dark, xl = 120, xr = 1010;
    text('01 · PROJET', xl, 160, mono(16, 700), { fill: C.accP, ls: 3, alpha: E.o3(P(u, 0, .3)) });
    reveal('PROJET', xl, 262, F(88, { st: 'expanded' }), { t: u, align: 'left', stagger: .03, dur: .42, ls: -2, fill: ink });
    typeOn('TRANSVERSAL · 125 H · EN ÉQUIPE · 3 ECTS', xl + 2, 312, mono(17, 700), u, .2, 80, { fill: ink, ls: 2 });
    const ty = [390, 468, 546, 624, 702];
    const tk = P(u, .55, 2.6);
    const lineK = E.oExpo(P(u, .3, .9));
    line(xl + 14, ty[0], xl + 14, ty[0] + (ty[4] - ty[0]) * lineK, ink, 2, .25);
    const tokY = ty[0] + (ty[4] - ty[0]) * E.ioSine(tk);
    STEPS.forEach((s, i) => {
      const reach = (ty[i] - ty[0]) / (ty[4] - ty[0]);
      const on = tk >= reach - 1e-6 && u > .55;
      const a = E.o3(P(u, .35 + i * .08, .7 + i * .08));
      ctx.save(); ctx.globalAlpha *= a;
      ctx.fillStyle = on ? C.accP : C.paper; ctx.strokeStyle = on ? C.accP : ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(xl + 14, ty[i], 12, 0, TAU); ctx.fill(); ctx.stroke();
      text(`0${i + 1}`, xl + 48, ty[i] - 12, mono(12, 700), { fill: on ? C.accP : ink, alpha: .8, ls: 2 });
      text(s, xl + 48, ty[i] + 16, fit(s, F(28, { wt: 700 }), 740), { fill: ink, alpha: on ? 1 : .45 });
      ctx.restore();
    });
    if (u > .55) dot(xl + 14, tokY, 8, C.accP, C.paper);
    text('OUTILS DE GESTION DE PROJET · SUIVI DE VERSION', xl, 790, mono(14, 500), { fill: ink, ls: 2, alpha: .6 * E.o3(P(u, 1.2, 1.5)) });
    line(945, 150, 945, 150 + 700 * E.oExpo(P(u, .2, .8)), ink, 1.5, .15);
    text('02 · STAGE', xr, 160, mono(16, 700), { fill: C.accP, ls: 3, alpha: E.o3(P(u, .25, .55)) });
    reveal('STAGE', xr, 262, F(88, { st: 'expanded' }), { t: u, delay: .25, align: 'left', stagger: .03, dur: .42, ls: -2, fill: ink });
    typeOn('15 ECTS · SECOND SEMESTRE', xr + 2, 312, mono(17, 700), u, .45, 80, { fill: ink, ls: 2 });
    STAGE.forEach(([lb, s], i) => {
      const a = E.o3(P(u, .7 + i * .12, 1.05 + i * .12)), y = 380 + i * 82;
      text(lb, xr, y, mono(12, 700), { fill: C.accP, ls: 3, alpha: a });
      text(s, xr, y + 34 + 10 * (1 - a), fit(s, F(28, { wt: 700 }), 790), { fill: ink, alpha: a });
    });
    const bk = E.oExpo(P(u, 1.5, 1.95));
    if (bk > 0) {
      const by = 720, bw = 790 * bk;
      ctx.fillStyle = ink; ctx.fillRect(xr, by, bw, 128);
      ctx.save(); ctx.beginPath(); ctx.rect(xr, by, bw, 128); ctx.clip();
      text('OU EN ALTERNANCE', xr + 28, by + 50, F(34, { st: 'expanded' }), { fill: C.ink });
      text('CONTRAT DE PROFESSIONNALISATION : LES SEMAINES', xr + 28, by + 86, mono(14, 700), { fill: C.ink, ls: 1, alpha: .8 });
      text('« LIBRES » SE PASSENT EN ENTREPRISE', xr + 28, by + 108, mono(14, 700), { fill: C.ink, ls: 1, alpha: .8 });
      ctx.restore();
    }
  },
  cues() {
    const c = [[0, 'hit']];
    STEPS.forEach((_, i) => c.push([.55 + 2.05 * (Math.acos(1 - 2 * (i / 4)) / Math.PI), 'blip', i]));
    for (let i = 0; i < 4; i++) c.push([.7 + i * .12, 'tick', i]);
    c.push([1.5, 'land', 1]);
    return c;
  },
};

// ================= CHIFFRES (orange) =================
const STATS = [
  { v: '60', unit: 'ECTS', l: ['CRÉDITS', 'SUR L’ANNÉE DE M2'] },
  { v: '7', unit: 'MOIS', l: ['DE COURS', 'À L’UNIVERSITÉ'] },
  { v: '5', unit: 'MOIS', l: ['DE STAGE', 'ENTREPRISE OU LABO'] },
  { v: '2', unit: 'MOIS', l: ['RECHERCHE D’EMPLOI', 'DURÉE MOYENNE'] },
];
const JOBS = 'INGÉNIEUR SYSTÈMES ET SIMULATIONS ◆ R&D AÉRONAUTIQUE · ESPACE · AUTOMOBILE ◆ FIABILITÉ & SÛRETÉ DE FONCTIONNEMENT ◆ LOGICIEL TEMPS RÉEL EMBARQUÉ ◆ AUTOMATICIEN ◆ INFORMATIQUE INDUSTRIELLE ◆ DOCTORAT ◆ ';
const statLand = (k, j) => .38 + .25 * k + j * .05;
K.chiffres = {
  name: 'CHIFFRES', bg: 'orange', energy: 2,
  draw(u, d, o) {
    bg(C.acc);
    const mx = 120, cw = (W - 2 * mx) / 4;
    reveal('LE M2 EN CHIFFRES', mx, 215, F(76, { st: 'expanded' }), { t: u, align: 'left', stagger: .016, dur: .4, ls: -2, fill: C.dark });
    typeOn('MASTER INDIFFÉRENCIÉ · INDUSTRIE ⟷ RECHERCHE', W - mx, 176, mono(17, 700), u, .1, 80, { align: 'right', ls: 3, fill: C.dark });
    typeOn('ALTERNANCE POSSIBLE EN M2', W - mx, 208, mono(17, 500), u, .3, 80, { align: 'right', ls: 3, fill: C.dark, alpha: .7 });
    const numF = F(200), dm = measure('0', numF), dw = dm.w, cap = dm.asc, base = 610;
    STATS.forEach((st, k) => {
      const x = mx + k * cw, lk = E.oExpo(P(u, k * .06, .5 + k * .06));
      line(x, 290, x, 290 + 470 * lk, C.dark, 2, .8);
      text(`0${k + 1}`, x + 24, 330, mono(16, 700), { fill: C.dark, alpha: lk });
      const S = .04 + .05 * k, digits = [...st.v];
      let xx = x + 22;
      digits.forEach((dg, j) => {
        const L = statLand(k, j);
        if (u < S) { xx += dw - 6; return; }
        const val = +dg + 30 * (1 - E.o5(P(u, S, L))), n = Math.floor(val), fr = val - n, step = cap * 1.35;
        ctx.save(); ctx.beginPath(); ctx.rect(xx - 10, base - cap - 24, dw + 20, cap + 48); ctx.clip();
        for (const [dd, oy] of [[n, fr * step], [n + 1, (fr - 1) * step]]) {
          const ch = String(((dd % 10) + 10) % 10);
          if (u < L && fr > .02) text(ch, xx, base + oy - 18, numF, { fill: C.dark, alpha: .25 });
          text(ch, xx, base + oy, numF, { fill: C.dark });
        }
        ctx.restore();
        xx += dw - 6;
      });
      const land = statLand(k, digits.length - 1), ua = E.oExpo(P(u, land - .05, land + .25));
      text(st.unit, xx + 10, base, F(34, { st: 'expanded' }), { fill: C.dark, alpha: ua });
      line(x + 24, base + 34, x + 24 + (cw - 60) * ua, base + 34, C.dark, 5);
      st.l.forEach((s, j) => text(s, x + 24, base + 84 + j * 30, mono(18, j ? 400 : 700), { fill: C.dark, ls: 2, alpha: ua * (j ? .7 : 1) }));
    });
    if (o.marquee) {
      const bw = E.oExpo(P(u, .15, .7));
      ctx.fillStyle = C.dark; ctx.fillRect(0, 858, W * bw, 84);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 858, W * bw, 84); ctx.clip();
      const mf = mono(26, 700), mw = measure(JOBS, mf, 2).w, ox = -((u * 220) % mw);
      for (let r = 0; r < 3; r++) text(JOBS, ox + r * mw, 911, mf, { fill: C.ink, ls: 2 });
      ctx.restore();
      text('DÉBOUCHÉS', mx, 840, mono(15, 700), { fill: C.dark, ls: 4, alpha: bw });
    } else {
      const a = E.o3(P(u, 1.6, 2.0));
      text('« Notre master étant indifférencié, il permet d’envisager une carrière', mx, 900, serif(36), { fill: C.dark, alpha: a });
      text('aussi bien dans l’industrie que dans la recherche. »', mx, 944, serif(36), { fill: C.dark, alpha: a });
    }
  },
  cues() {
    const c = [[0, 'hit']];
    STATS.forEach((st, k) => { const L = statLand(k, st.v.length - 1); c.push([.04 + .05 * k, 'rattle', L - (.04 + .05 * k)], [L, 'land', k]); });
    return c;
  },
};

// ================= DÉBOUCHÉS (paper, 60 s cut) =================
const METIERS = [
  'Ingénieur systèmes et simulations', 'Ingénieur R&D — aéronautique, espace, automobile',
  'Ingénieur fiabilité et sûreté de fonctionnement', 'Concepteur développeur logiciel temps réel embarqué',
  'Concepteur de systèmes de communication', 'Responsable automatismes',
  'Automaticien', 'Responsable de production',
  'Ingénieur informatique industrielle', 'Ingénieur électronique, systèmes embarqués',
];
K.debouches = {
  name: 'DÉBOUCHÉS', bg: 'paper', energy: 1,
  draw(u, d) {
    bg(C.paper);
    const ink = C.dark;
    reveal('DÉBOUCHÉS', 120, 215, F(84, { st: 'expanded' }), { t: u, align: 'left', stagger: .025, dur: .42, ls: -2, fill: ink });
    typeOn('INDUSTRIE ⟷ RECHERCHE', 1800, 170, mono(17, 700), u, .15, 60, { fill: ink, align: 'right', ls: 3 });
    typeOn('SELON LES 3 BLOCS CHOISIS · OU DOCTORAT', 1800, 202, mono(15, 500), u, .35, 80, { fill: ink, align: 'right', ls: 3, alpha: .7 });
    METIERS.forEach((m, i) => {
      const col = Math.floor(i / 5), row = i % 5;
      const x = 120 + col * 860, y = 330 + row * 116;
      const t0 = .3 + i * .1, a = E.o3(P(u, t0, t0 + .35));
      line(x, y - 44, x + 800 * E.oExpo(P(u, t0 - .05, t0 + .4)), y - 44, ink, 1, .18);
      text(String(i + 1).padStart(2, '0'), x, y, mono(15, 700), { fill: C.accP, ls: 2, alpha: a });
      text(m, x + 56 + 20 * (1 - a), y + 2, fit(m, F(31, { wt: 700 }), 740), { fill: ink, alpha: a });
    });
    const ba = E.o3(P(u, 1.6, 2.0));
    text('Liste issue du syllabus — le master prépare aussi à la poursuite en doctorat.', 120, 930, serif(30), { fill: ink, alpha: ba * .8 });
  },
  cues() { const c = [[0, 'hit']]; for (let i = 0; i < 10; i++) c.push([.3 + i * .1, 'tick', i % 4]); return c; },
};

// ================= DEADLINE (dark) =================
K.deadline = {
  name: 'DEADLINE', bg: 'dark', energy: 0,
  impact: (d, o) => o.S ?? d - 1.5,
  draw(u, d, o) {
    bg(C.bg);
    const S = o.S ?? d - 1.5;
    const cx = W / 2, cy = H / 2, R = 470;
    const endFade = 1 - E.io3(P(u, d - .3, d - .1));
    const hit = decay(u, S, 3.5);
    ctx.save(); ctx.globalAlpha = endFade;
    for (let i = 0; i < 60; i++) {
      const ti = -.45 + i * .011, k = E.oExpo(P(u, ti, ti + .4));
      if (k <= 0) continue;
      const a = -Math.PI / 2 + i * TAU / 60, maj = i % 5 === 0, len = (maj ? 38 : 16) * k;
      ctx.strokeStyle = decay(u, S + i * .004, 5) > .05 ? C.acc : maj ? C.ink : 'rgba(242,238,228,.4)';
      ctx.lineWidth = maj ? 4 : 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - len), cy + Math.sin(a) * (R - len));
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
    }
    const la = E.o3(P(u, 0, .5));
    [['00', 0], ['15', 1], ['30', 2], ['45', 3]].forEach(([s, q]) => {
      const a = -Math.PI / 2 + q * Math.PI / 2;
      text(s, cx + Math.cos(a) * (R - 68), cy + Math.sin(a) * (R - 68) + 6, mono(15, 500), { align: 'center', alpha: la * .5 });
    });
    let ha = -Math.PI / 2 + TAU * E.io3(P(u, 0, S));
    if (u > S) ha += .035 * Math.sin((u - S) * 34) * decay(u, S, 7);
    if (u > 0 && u < S) {
      const spd = Math.sin(Math.PI * P(u, 0, S));
      const g = ctx.createConicGradient(ha - 1.1, cx, cy);
      g.addColorStop(0, 'rgba(255,74,28,0)');
      g.addColorStop(1.1 / TAU, `rgba(255,74,28,${.32 * spd})`);
      g.addColorStop(1.1 / TAU + .0001, 'rgba(255,74,28,0)');
      g.addColorStop(1, 'rgba(255,74,28,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 4, ha - 1.1, ha); ctx.closePath(); ctx.fill();
    }
    ctx.save(); ctx.strokeStyle = C.acc; ctx.lineWidth = 3.5; ctx.shadowColor = C.acc; ctx.shadowBlur = 18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - Math.cos(ha) * 50, cy - Math.sin(ha) * 50); ctx.lineTo(cx + Math.cos(ha) * (R - 8), cy + Math.sin(ha) * (R - 8)); ctx.stroke(); ctx.restore();
    if (u >= S) {
      const k = P(u, S, S + .7);
      ctx.save(); ctx.strokeStyle = C.acc; ctx.globalAlpha *= 1 - k; ctx.lineWidth = 10 * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(cx, cy, R + 520 * E.oExpo(k), 0, TAU); ctx.stroke(); ctx.restore();
    }
    const hub = al => { ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = C.acc; ctx.shadowColor = C.acc; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(cx, cy, 9 + 6 * hit + 8 * decay(u, d - .08, 8), 0, TAU); ctx.fill(); ctx.restore(); };
    hub(1);
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
    if (u >= S) {
      const k = E.oBack(P(u, S, S + .3));
      ctx.save(); ctx.translate(cx, 812); ctx.scale(k, k);
      const f = mono(22, 700), mw = measure('DEADLINE MET', f, 5).w + 70;
      ctx.fillStyle = C.acc; ctx.beginPath(); ctx.roundRect(-mw / 2 - 20, -26, mw + 40, 52, 26); ctx.fill();
      check(-mw / 2 + 14, 0, 22, C.dark, 4);
      text('DEADLINE MET', 22, 8, f, { align: 'center', ls: 5, fill: C.dark }); ctx.restore();
    }
    ctx.restore();
    hub(1 - endFade);
  },
  cues(d, o) {
    const S = o.S ?? d - 1.5, c = [[0, 'hitS'], [0, 'pad', d], [S - .9, 'riser', .9], [S, 'impact'], [d - .08, 'blipEnd']];
    for (let t = 0; t < S - .05; t += .125) c.push([t, 'clockTick', Math.round(t / .125) % 2]);
    return c;
  },
};
