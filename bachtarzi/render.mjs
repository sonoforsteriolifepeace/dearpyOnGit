// Rendu de l'animation : node render.mjs
// Variables : OUT (défaut out/bachtarzi_muet.mp4), RANGE="début-fin" (images), CRF (défaut 18), CONCURRENCY, BROWSER.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const browserExecutable = process.env.BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const outputLocation = process.env.OUT || 'out/bachtarzi_muet.mp4';
mkdirSync(path.dirname(outputLocation), { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: 'Bachtarzi', browserExecutable });
const range = process.env.RANGE ? process.env.RANGE.split('-').map(Number) : null;
const t0 = Date.now();
await renderMedia({
  composition, serveUrl, outputLocation, browserExecutable,
  codec: 'h264', crf: Number(process.env.CRF || 18), pixelFormat: 'yuv420p', x264Preset: 'medium',
  imageFormat: 'jpeg', jpegQuality: 92,
  concurrency: process.env.CONCURRENCY ? Number(process.env.CONCURRENCY) : 4,
  frameRange: range ?? undefined,
  muted: true,
  onProgress: ({ renderedFrames, encodedFrames }) => {
    if (renderedFrames % 150 === 0) console.log(`rendu ${renderedFrames} · encodé ${encodedFrames} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  },
});
console.log(`terminé en ${((Date.now() - t0) / 1000).toFixed(0)} s → ${outputLocation}`);
