# Cheikh Abderrahmane Bachtarzi — le couturier de la Mandhouma Rahmania

Animation de 3 minutes (1920×1080, 30 i/s) tirée d’une explication orale sur
la Mandhouma Rahmania, faite avec [Remotion](https://www.remotion.dev/) (React).
Les trois chapitres durent chacun 60 s et suivent les timecodes de la
transcription (00:00, 01:00, 02:00) : la piste audio originale peut donc être
posée dessous.

| Chapitre | Scènes |
|---|---|
| I · Le maître et son premier élève (0:00–1:00) | titre, Sidi M’hamed Ben Abderrahmane, le voyage Kabylie → Al-Azhar → Soudan → Al-Azhar → Alger, « Bou Qabrine », Khalwatia → Rahmania, le premier élève |
| II · Écrire pour transmettre (1:00–2:00) | l’élève devient auteur, les leçons réécrites en vers, pourquoi la poésie (le mètre), les sciences apprises en vers, la Mandhouma |
| III · Le tailleur et la mesure (2:00–3:00) | la mesure, « Bach-Terzi », ses clients (khodjas, aghas, bachaghas, deys), le patron, le poème cousu comme un habit, final |

Rendu : `bachtarzi.mp4` (recompressé en CRF 25 pour rester sous la limite de taille de GitHub ; `npm run render` produit `out/bachtarzi.mp4` en pleine qualité).

## Structure

- `src/timeline.json` — découpage des scènes et repères partagés avec l’audio
- `src/Film.tsx` — composition : enchaînement des scènes en fondu, fil de progression
- `src/scenes/Part1.tsx`, `Part2.tsx`, `Part3.tsx` — les 20 scènes
- `src/components/` — fil/aiguille qui se dessine, textes animés, ornements (étoile à 8 branches, médaillons, caftan, qubba)
- `src/geo.ts` — littoraux simplifiés pour la carte du voyage
- `audio/score.py` — musique et bruitages synthétisés (bourdon, ney en maqam Bayati, oud, bendir), calés sur `timeline.json`
- `audio/paper_texture.py` — texture de papier (`public/paper.png`)
- `public/fonts/` — EB Garamond, Inter, Amiri, Aref Ruqaa (licence OFL)

## Reconstruire

Node 18+ et `npm install`, Python 3 avec `numpy` et `scipy`, `ffmpeg`.

```sh
npm install
python3 audio/score.py audio/score.wav
ffmpeg -i audio/score.wav -c:a libmp3lame -b:a 192k public/score.mp3
npm run studio          # aperçu interactif
npm run render          # → out/bachtarzi.mp4
```

Pour utiliser un Chromium déjà installé au lieu de celui que Remotion télécharge :
`REMOTION_BROWSER=/chemin/vers/chrome npm run render`.

Sans musique (pour poser une voix off) : `npx remotion render src/index.ts Bachtarzi out/muet.mp4 --props='{"mute":true}'`.

Images de contrôle : `node scripts/stills.mjs 5 25 90` → `stills/`.

## Note sur le contenu

Le texte suit l’explication orale. Quelques repères ont été ajoutés pour le
grand public : l’étymologie turque *baş terzi* (« chef tailleur »), le second
tombeau d’Aït Smaïl que la tradition attribue à Sidi M’hamed, et le *rajaz*
donné comme exemple de mètre des poèmes d’enseignement. Aucun vers de la
Mandhouma n’est cité : les lignes de poème sont figurées de façon abstraite.
