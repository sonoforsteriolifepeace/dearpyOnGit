// Render single frames for checking: node scripts/stills.mjs 12.5 40 88 (seconds)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const browserExecutable = process.env.REMOTION_BROWSER || null;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Bachtarzi', browserExecutable});
fs.mkdirSync(path.join(root, 'out/stills'), {recursive: true});
for (const s of process.argv.slice(2)) {
  const frame = Math.round(parseFloat(s) * composition.fps);
  const output = path.join(root, `out/stills/${String(s).padStart(6, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable});
  console.log(output);
}
