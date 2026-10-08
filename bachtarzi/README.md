# Cheikh Abderrahmane Bachtarzi — animation

Animation grand public (3 min 21 s, 1920×1080, 30 i/s) tirée d'un exposé oral sur la
*Mandhouma Rahmania*. Elle est faite avec [Remotion](https://www.remotion.dev) : chaque scène
est un composant React dessiné en SVG, animé en fonction du temps. La bande sonore
est synthétisée en Python : un bourdon, des notes pincées façon oud en mode hijaz,
et un coup de bendir à chaque changement de scène.

Rendu : `out/bachtarzi.mp4`.

## Déroulé

| Partie | Scènes |
|---|---|
| Ouverture | Titre, nom en arabe, fil cousu sous le nom |
| I · Le maître et son premier élève | Carte du voyage de Sidi M'hamed Ben Abderrahmane (Kabylie → Al-Azhar → Soudan → Al-Azhar → Alger) · « Bou Qabrine », les deux tombeaux · Rahmania = Khalwatia · le premier élève et la Mandhouma |
| II · De l'élève à l'auteur | Recevoir → écrire · les cours deviennent des qasayed (sadr, ʿajuz, rime) · la poésie comme outil de mémoire (exemple : l'Alfiyya d'Ibn Mālik) et les disciplines (fiqh, hadith, sira, sunna, qawaʿid) · des vers pour garder la Tariqa |
| III · Le terdji : couture et poésie | Abderrahmane Ben Memmach, « terdji », « khayat » · ses clients, du khodja au dey · mesure, patron, technique · couture ≈ poème : plan, tissu, superpositions, garnitures, finitions |
| Fin | « À lire et à faire connaître » · les vidéos de la série · carton final |

Le découpage (durée de chaque scène) se trouve dans `src/timeline.json`. Les textes à
l'écran sont dans chaque scène (`src/scenes/*.tsx`, tableaux `lines`).

## Ajouts au texte source

Trois précisions ne viennent pas de l'exposé, mais de la tradition courante. Elles sont
signalées à l'écran :

- le second tombeau de Bou Qabrine, à Aït Smaïl en Kabylie (« selon la tradition ») ;
- l'étymologie de *Bach-Tarzi*, du turc *baş* (chef) et *terzi* (tailleur) ;
- l'Alfiyya d'Ibn Mālik, donnée comme exemple de poème didactique.

La carte est stylisée : les côtes sont simplifiées à la main.

## Refaire le rendu

```sh
npm install
npm run studio                      # aperçu interactif dans le navigateur
python3 scripts/soundtrack.py audio.wav && ffmpeg -i audio.wav -c:a aac -b:a 160k public/soundtrack.m4a
npm run render                      # → out/bachtarzi.mp4
node scripts/stills.mjs 12.5 90     # images fixes (en secondes) → out/stills/
```

Remotion télécharge son propre Chrome. Si le réseau l'interdit, pointez
`REMOTION_BROWSER` vers un Chromium headless déjà installé.

Polices : Amiri, Cormorant Garamond et Inter (SIL OFL), embarquées dans `src/fonts/`.
