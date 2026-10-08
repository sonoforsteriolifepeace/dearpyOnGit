# Cheikh Abderrahmane Bachtarzi — le tailleur qui mit la voie en vers

Animation de 3 minutes (1920×1080, 30 i/s) réalisée avec [Remotion](https://www.remotion.dev) à partir de la
transcription en trois parties de 60 s. Elle accompagne la voix : le texte à l'écran ne reprend que les
mots-clés, la transcription complète n'est pas incrustée.

| Fichier | Contenu |
|---|---|
| `bachtarzi.mp4` | animation + lit musical (sans voix) |
| `bachtarzi_muet.mp4` | la même animation sans piste audio, pour poser la voix par-dessus |
| `bachtarzi_musique.m4a` | le lit musical seul (180 s), pour le mixer à part |
| `bachtarzi_fr.srt` | transcription sous-titrée, **calée à l'estime** (voir plus bas) |

## Le fil conducteur

Un seul motif traverse tout le film : **le fil de couture**. Il trace le voyage de Sidi Mhamed Ben Abderrahmane
(Kabylie → Al-Azhar → Soudan → Al-Azhar → Alger), dessine les tombeaux de Bou Qabrine, relie la Rahmania à la
Khalwatia, puis se transforme en couture dans la partie III : l'étiquette cousue, le patron, les six étapes
(plan, patron, tissu, superpositions, garnitures, finitions) et le parallèle avec le poème. La barre pointillée
en bas de l'écran est une couture qui avance avec le film.

| Partie | Temps | Scènes |
|---|---|---|
| I — Le maître et la voie | 0:00–1:00 | titre · carte du voyage · Bou Qabrine · Rahmania = Khalwatia · premier élève et la Mandhouma |
| II — Du disciple à l'auteur | 1:00–2:00 | élève le plus important · « il s'est mis à écrire » · cours → qasayed · poésie et mémoire · fiqh, hadith, sira, sounna, qawa'id · enfants · garder la Tariqa |
| III — L'âme du tailleur | 2:00–3:00 | le chiffre et le mètre · étiquette « Ben Memmach, dit Terdji » · les clients (khodjas → deys) · mesure, patron, technicien · couture ↔ poème · « il mérite une vidéo » |

## Synchronisation (important)

Il n'y a pas d'enregistrement de la voix dans le dépôt. Chaque événement visuel est donc ancré sur **une expression
du texte** (`cue(2, 'fiqh')`, `cue(3, 'des finitions')`…) et non sur un nombre de secondes. `src/script.ts`
répartit les mots de chaque minute (pauses de ponctuation comprises) pour estimer l'instant où chaque
expression est prononcée ; les trois minutes tombent exactement sur 1:00, 2:00 et 3:00.

C'est une estimation : selon le rythme réel de la voix, un mot-clé peut apparaître avec une à deux secondes
d'écart. Pour caler précisément après coup, deux solutions :

* corriger un repère : `override['2:fiqh'] = 99.8` dans `src/script.ts` (secondes absolues) ;
* ou me donner un SRT/horodatage réel de la voix, et les repères se règlent tous d'un coup.

## Ce qui a été ajouté au texte

Rien n'est affirmé au-delà de la transcription, mais quelques éléments sont de la mise en forme :

* le sous-titre « Le tailleur qui mit la voie en vers » et les titres de parties ;
* les mots arabes (الطريقة الرحمانية، المنظومة، الأزهر، السودان، الجزائر، بوقبرين، الخلوتية، قصائد، فقه، حديث،
  سيرة، سُنّة، قواعد، خيّاط، ترزي، مؤلِّف) — à relire si vous voulez une orthographe particulière ;
* les petites définitions sous les cinq domaines : Paroles du Prophète (hadith), Vie du Prophète (sira),
  Tradition prophétique (sounna) ; « Jurisprudence » et « Règles » viennent de votre texte ;
* le Soudan est repéré sur la carte à Khartoum (simple repère de pays), Belcourt est placé à Alger.

Les chiffres de la scène du patron (56 cm, 98 cm, 44 cm) sont illustratifs.

## Reconstruire

Il faut Node 22+, ffmpeg et un Chromium (`BROWSER=/chemin/vers/chrome` si ce n'est pas celui de Playwright).
Les polices (Cormorant Garamond, Inter, Amiri, Reem Kufi) sont dans `src/fonts/`, le rendu fonctionne hors ligne.

```sh
npm install
npm run studio                         # aperçu interactif Remotion
node stills.mjs 12 33 100 150          # images fixes → stills/ (SHEET=1 pour une planche-contact)
node render.mjs                        # → out/bachtarzi_muet.mp4 (≈ 8 min sur 4 cœurs, ≈ 72 Mo en CRF 18)
ffmpeg -i out/bachtarzi_muet.mp4 -c:v libx264 -preset slow -crf 23 -an bachtarzi_muet.mp4   # version allégée (≈ 32 Mo), celle du dépôt

python3 audio.py out/musique.wav       # lit musical (numpy seul)
ffmpeg -i bachtarzi_muet.mp4 -i out/musique.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k bachtarzi.mp4
node srt.ts out/bachtarzi_fr.srt
```

Poser votre voix : importez `bachtarzi_muet.mp4` (ou `bachtarzi.mp4` en coupant sa piste audio) dans votre
logiciel de montage, et placez l'enregistrement à 0:00. Le lit musical est à −23 LUFS, crête −9 dBFS : baissez-le
de 8 à 10 dB sous une voix.

## Structure

```
src/script.ts      transcription + moteur de repères (cue)
src/Bachtarzi.tsx  composition : ordre des scènes, fondu d'entrée/sortie
src/kit.tsx        fil de couture, étiquettes cousues, étoiles à 8 branches, fond, barre de progression
src/shapes.tsx     médaillons, manuscrits, coupoles, silhouettes d'enfants
src/map.ts         projection de la carte (world-atlas, 50 m)
src/scenes/part1|2|3.tsx   les 16 scènes
audio.py           synthèse du lit musical (mode hijaz : bourdon, oud, bendir, « aiguille »)
```
