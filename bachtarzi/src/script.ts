// Transcription fournie (3 × 60 s) + moteur de synchronisation.
//
// Il n'y a pas d'enregistrement de la voix : le timing de chaque mot est ESTIMÉ en répartissant
// les mots de chaque minute (pauses de ponctuation comprises). Chaque événement visuel est ancré
// sur une expression du texte via `cue(partie, "expression")`, jamais sur un nombre de secondes
// écrit en dur. Si vous avez le vrai timing de la voix, il suffit d'ajouter des `override`
// (voir plus bas) ou de remplacer `wordTime`.

export type PartId = 1 | 2 | 3;

export const PART_SECONDS = 60;
export const PARTS: Record<PartId, string> = {
  1: `Et pour revenir à la personnalité de cheikh Abderrahmane Bachtarzi, ya3ni pour te donner une idée, celui qui a écrit la Mandhouma Rahmania... Bref, il y avait le cheikh Sidi Mhamed Ben Abderrahmane, qui est Kabyle, et qui est parti étudier en Égypte, à Al-Azhar. D'Al-Azhar, il est parti au Soudan, et du Soudan il est revenu à Al-Azhar, puis il est venu en Algérie. C'est lui qu'on appelle "Bou Qabrine" (l'homme aux deux tombeaux), c'est lui qui est enterré à Belcourt, et c'est le fondateur de la confrérie Rahmania en Algérie, qui est la Khalwatia en Égypte. Celui-là, quand il est venu, son premier élève, c'était le cheikh Abderrahmane Bachtarzi. C'est lui qui a fait cette Mandhouma sur laquelle on travaille en ce moment.`,
  2: `Il est devenu son élève le plus important. Et pourquoi est-il devenu son élève le plus important ? Parce qu'il s'est mis à écrire. Lui aussi s'est mis à écrire, il est devenu un auteur dans la Tariqa Rahmania, il n'était plus juste une personne qui reçoit. Ces cours-là qu'il a pris chez le cheikh Sidi Mhamed Ben Abderrahmane, il les a réécrits sous forme de qasayed (poèmes). Et ces poèmes, c'est avec ça qu'on enseignait autrefois, parce que la poésie, c'est ce que les Arabes utilisaient autrefois pour enseigner, parce qu'elle est facile à mémoriser. Donc toi, dans tous les domaines du fiqh (jurisprudence), du hadith, de la sira, de la sounna, des qawa'id (règles), on enseignait aux enfants en bas âge avec la poésie. Donc lui, il a suivi la même méthode pour garder la Tariqa. Il a écrit des poèmes dans lesquels on retrouve les règles et ce qu'il a appris de son cheikh.`,
  3: `Ça, c'est une grande personnalité. Et pourquoi ? Il aime le chiffre. Pourquoi y a-t-il le chiffre chez lui ? Parce que c'est un couturier, khayat, terdji. On l'appelle Abderrahmane Ben Memmach, et son surnom c'est "terdji" parce qu'il était couturier, il était khayat, il cousait. Et pour qui cousait-il ? Il cousait pour la haute classe du pouvoir des Turcs en Algérie. Ya3ni, il cousait pour les khoudjat, les aghawat, les bachaghawat et les dayat (les deys). Il n'était pas un couturier pour le public, non, c'était un couturier pour les gens de la très haute classe de la société. Et lui, de sa couture, qui est une science, il a appris la notion de mesure. Il mesure, il a la mesure. Il a le raisonnement de quelqu'un qui fait un plan, une conception, il fait ce qu'on appelle le patron. Il fait des patrons, il mesure et il a la technique, c'est-à-dire que c'est un technicien à la base. Ce n'est pas [seulement] quelqu'un de lettré ou un fellah... non, c'est un technicien. C'est pour ça que la façon par laquelle il a écrit ses poèmes ressemble à peu près à la couture. Ça ressemble à quelqu'un qui est en train de coudre quelque chose : il commence par un plan, un patron, un tissu, des superpositions de choses, des garnitures, des finitions... Donc, son esprit de terdji, de couturier, il l'a mis dans ses poèmes. Et il mérite... Moi, j'ai fait une vidéo sur le cheikh Mhamed Belkacem, j'ai fait une vidéo sur Sidi Mhamed Ben Abderrahmane El Azhari, mais le cheikh Abderrahmane Bachtarzi mérite vraiment une vidéo sur sa vie, sa carrière, ce qu'il a fait. Parce que c'est un personnage très, très important à lire, à exposer. Voilà.`,
};

// ---------- modèle de débit ----------
interface Tok { w: string; weight: number; }

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'");

// Un mot pèse 1 ; une pause de ponctuation allonge le mot qui la précède.
function tokenize(text: string): Tok[] {
  return text.split(/\s+/).filter(Boolean).map(w => {
    let weight = 1 + 0.045 * Math.min(w.replace(/[^\p{L}\p{N}]/gu, '').length, 12);
    if (/[.?!…]["»)]*$/.test(w)) weight += 2.4;
    else if (/[:;]["»)]*$/.test(w)) weight += 1.6;
    else if (/,["»)]*$/.test(w)) weight += 0.9;
    return { w, weight };
  });
}

interface TimedWord { w: string; start: number; end: number; }
const timeline: Record<PartId, TimedWord[]> = { 1: [], 2: [], 3: [] };

(Object.keys(PARTS) as unknown as string[]).forEach(k => {
  const id = Number(k) as PartId;
  const toks = tokenize(PARTS[id]);
  const total = toks.reduce((a, t) => a + t.weight, 0);
  const t0 = (id - 1) * PART_SECONDS;
  let acc = 0;
  timeline[id] = toks.map(t => {
    const start = t0 + (acc / total) * PART_SECONDS;
    acc += t.weight;
    return { w: t.w, start, end: t0 + (acc / total) * PART_SECONDS };
  });
});

const plain = (s: string) => norm(s).replace(/[^\p{L}\p{N}'\s-]/gu, ' ').split(/\s+/).filter(Boolean);

/** Corrections manuelles éventuelles (secondes absolues), indexées par "partie:expression". */
export const override: Record<string, number> = {};

/** Instant (s) où commence l'expression, n-ième occurrence dans la partie. */
export function cue(part: PartId, phrase: string, occurrence = 1): number {
  const key = `${part}:${phrase}${occurrence > 1 ? '#' + occurrence : ''}`;
  if (key in override) return override[key];
  const words = timeline[part];
  const pw = plain(phrase);
  const hay = words.map(x => plain(x.w).join(' '));
  let seen = 0;
  for (let i = 0; i < words.length; i++) {
    let ok = true;
    for (let j = 0; j < pw.length; j++) {
      if (hay[i + j] !== pw[j]) { ok = false; break; }
    }
    if (ok && ++seen === occurrence) return words[i].start;
  }
  throw new Error(`cue introuvable : partie ${part}, « ${phrase} » (occurrence ${occurrence})`);
}

/** Fin (s) de l'expression : instant où son dernier mot se termine. */
export function cueEnd(part: PartId, phrase: string, occurrence = 1): number {
  const t = cue(part, phrase, occurrence);
  const words = timeline[part];
  const i = words.findIndex(x => x.start === t);
  return words[Math.min(words.length - 1, i + plain(phrase).length - 1)].end;
}

export const partStart = (p: PartId) => (p - 1) * PART_SECONDS;
export const TOTAL_SECONDS = PART_SECONDS * 3;
export const FPS = 30;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;

/** Sous-titres SRT à partir du même modèle (phrases = unités de coupe). */
export function toSrt(): string {
  const pad = (n: number, l = 2) => String(n).padStart(l, '0');
  const ts = (s: number) => {
    const ms = Math.round(s * 1000);
    return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
  };
  const out: string[] = [];
  let n = 1;
  (Object.keys(PARTS) as unknown as string[]).forEach(k => {
    const words = timeline[Number(k) as PartId];
    let cur: TimedWord[] = [];
    const flush = () => {
      if (!cur.length) return;
      out.push(`${n++}\n${ts(cur[0].start)} --> ${ts(cur[cur.length - 1].end)}\n${cur.map(x => x.w).join(' ')}\n`);
      cur = [];
    };
    words.forEach((x, i) => {
      cur.push(x);
      const endSentence = /[.?!…]["»)]*$/.test(x.w) || /[:;]["»)]*$/.test(x.w);
      const long = cur.length >= 14 && /,["»)]*$/.test(x.w);
      if (endSentence || long || cur.length >= 22 || i === words.length - 1) flush();
    });
  });
  return out.join('\n');
}
