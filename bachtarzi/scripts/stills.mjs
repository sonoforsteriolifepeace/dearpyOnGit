// Render check frames: node scripts/stills.mjs 3.5 12 40.2 …  → stills/tXXX.XX.jpg
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const browser = await openBrowser('chrome', {browserExecutable});
const inputProps = {mute: true};
const composition = await selectComposition({serveUrl, id: 'Bachtarzi', inputProps, puppeteerInstance: browser});
fs.mkdirSync('stills', {recursive: true});
for (const t of times) {
  const output = `stills/t${t.toFixed(2).padStart(6, '0')}.jpg`;
  await renderStill({composition, serveUrl, output, frame: Math.round(t * composition.fps), inputProps, imageFormat: 'jpeg', jpegQuality: 85, puppeteerInstance: browser});
  console.log(output);
}
await browser.close({silent: true});
