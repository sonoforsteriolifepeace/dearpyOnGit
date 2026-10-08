// Sous-titres (SRT) de la transcription, calés sur le même modèle de débit que l'animation.
//   node srt.ts out/bachtarzi_fr.srt
import { writeFileSync } from 'node:fs';
import { toSrt } from './src/script.ts';

const out = process.argv[2] || 'out/bachtarzi_fr.srt';
writeFileSync(out, toSrt() + '\n');
console.log(`${out}`);
