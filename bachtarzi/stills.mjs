// Rend des images fixes pour vérifier la mise en page : node stills.mjs 5 12.5 30 …  (secondes)
// Variables : OUT (dossier, défaut stills/), SHEET=1 pour aussi assembler une planche-contact.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const browserExecutable = process.env.BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const out = process.env.OUT || 'stills';
const times = process.argv.slice(2).map(Number);
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: 'Bachtarzi', browserExecutable });
for (const s of times) {
  const frame = Math.round(s * composition.fps);
  const file = `${out}/t${s.toFixed(1).padStart(5, '0')}.png`;
  await renderStill({ composition, serveUrl, output: file, frame, browserExecutable, imageFormat: 'png' });
  console.log(file);
}
if (process.env.SHEET) {
  const cols = Number(process.env.COLS || 3);
  const files = times.map(s => `${out}/t${s.toFixed(1).padStart(5, '0')}.png`);
  const rows = Math.ceil(files.length / cols);
  const args = ['-y', '-loglevel', 'error'];
  files.forEach(f => args.push('-i', f));
  const scale = files.map((_, i) => `[${i}:v]scale=${Math.round(1920 / cols)}:-1[s${i}]`).join(';');
  const stack = files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${files.length}:layout=` +
    files.map((_, i) => `${(i % cols) * Math.round(1920 / cols)}_${Math.floor(i / cols) * Math.round(1080 / cols)}`).join('|');
  args.push('-filter_complex', `${scale};${stack}`, '-frames:v', '1', `${out}/sheet.png`);
  execFileSync('ffmpeg', args);
  console.log(`${out}/sheet.png`, rows, 'rangées');
}
