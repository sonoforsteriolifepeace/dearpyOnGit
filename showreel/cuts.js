'use strict';
// Timelines. Durations are in seconds on a 120 BPM grid (0.5 s beats); `trans` is the
// transition played over the last seconds of the scene: [type, duration, options].
const CUTS = {
  30: { tag: '30″', scenes: [
    { k: 'signal', d: 2 },
    { k: 'tempsReel', d: 3, o: { flip: 1.5 }, trans: ['strips', .5] },
    { k: 'mission', d: 4, trans: ['diag', .6] },
    { k: 'annee', d: 4, trans: ['iris', .6] },
    { k: 'blocs', d: 4, trans: ['rect', .6, { from: blocRect(2) }] },
    { k: 'ordo', d: 3.5 },
    { k: 'mots', d: 3, o: { words: [0, 1, 2, 3, 5, 6] }, trans: ['columns', .45] },
    { k: 'chiffres', d: 3.5, o: { marquee: true }, trans: ['clock', .5] },
    { k: 'deadline', d: 3 },
  ] },
  60: { tag: '60″', scenes: [
    { k: 'signal', d: 3 },
    { k: 'tempsReel', d: 4, o: { flip: 1.5, quote: true }, trans: ['strips', .5] },
    { k: 'mission', d: 4, trans: ['diag', .6] },
    { k: 'mention', d: 4, trans: ['columns', .5, { col: C.dark }] },
    { k: 'annee', d: 4.5, trans: ['iris', .6] },
    { k: 'blocs', d: 3.5, trans: ['rect', .6, { from: blocRect(0) }] },
    { k: 'dive', name: 'COMMANDE', d: 4.5, o: { i: 0 }, trans: ['push', .5] },
    { k: 'dive', name: 'AUTONOMIE', d: 4.5, o: { i: 1 }, trans: ['push', .5] },
    { k: 'dive', name: 'RÉACTIVITÉ', d: 4.5, o: { i: 2 }, trans: ['push', .5] },
    { k: 'dive', name: 'FIABILITÉ', d: 4.5, o: { i: 3 } },
    { k: 'mots', d: 4, trans: ['columns', .5] },
    { k: 'projet', d: 4, trans: ['diag', .6] },
    { k: 'chiffres', d: 4, trans: ['strips', .5] },
    { k: 'debouches', d: 3.5, trans: ['clock', .5] },
    { k: 'deadline', d: 3.5 },
  ] },
};

const cutId = (new URLSearchParams(location.search).get('cut')) || '60';
window.READY = boot(CUTS[cutId]);
if (!/render/.test(location.search)) {
  const fitView = () => { const s = Math.min(innerWidth / W, innerHeight / H); main.style.transform = `scale(${s}) translate(-50%,-50%)`; };
  addEventListener('resize', fitView); fitView();
  window.READY.then(tl => {
    const t0 = performance.now();
    const loop = now => { render(((now - t0) / 1000) % tl.dur); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}
