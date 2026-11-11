import { site } from "./config";
import type { Book, Lesson, Part } from "./types";

export const BOOK: Book = {
  id: site.bookId,
  titre: "Le Livre Magique",
  niveau: "1re année Bac",
  domaine: "Français",
  statut: "actif",
};

type PartSeed = Omit<Part, "bookId"> & {
  lessons: { titre: string }[];
  onlineUntil: number;
};

const PARTS_SEED: PartSeed[] = [
  {
    id: "part_bam",
    code: "BAM",
    titre: "La Boîte à merveilles",
    auteur: "Ahmed Sefrioui",
    type: "Œuvre intégrale",
    couleur: "#B4560A",
    teinte: "#F6EADF",
    ordre: 1,
    pageDebut: 12,
    pageFin: 51,
    onlineUntil: 10,
    lessons: [
      { titre: "Sefrioui et la ville de Fès" },
      { titre: "Un narrateur encore enfant" },
      { titre: "La maison, la terrasse, le quartier" },
      { titre: "Ce que garde la boîte" },
      { titre: "Lalla Zoubida, la mère" },
      { titre: "Le père, l'argent et la honte" },
      { titre: "Hammam, rue et voisinage" },
      { titre: "La fête et le moussem" },
      { titre: "L'école et le maître" },
      { titre: "De la merveille au réel" },
    ],
  },
  {
    id: "part_ant",
    code: "ANT",
    titre: "Antigone",
    auteur: "Jean Anouilh",
    type: "Œuvre intégrale",
    couleur: "#9B1C2E",
    teinte: "#F3E3E5",
    ordre: 2,
    pageDebut: 58,
    pageFin: 89,
    onlineUntil: 6,
    lessons: [
      { titre: "Anouilh reprend le mythe" },
      { titre: "Le prologue et le chœur" },
      { titre: "Antigone face à Ismène" },
      { titre: "Le dialogue avec Créon" },
      { titre: "Refuser le bonheur" },
      { titre: "Hémon, entre loi et amour" },
      { titre: "La garde, ou le tragique ordinaire" },
      { titre: "Une tragédie d'aujourd'hui" },
    ],
  },
  {
    id: "part_djc",
    code: "DJC",
    titre: "Le Dernier Jour d'un condamné",
    auteur: "Victor Hugo",
    type: "Œuvre intégrale",
    couleur: "#3B4660",
    teinte: "#E7E9EC",
    ordre: 3,
    pageDebut: 96,
    pageFin: 127,
    onlineUntil: 4,
    lessons: [
      { titre: "Hugo contre l'échafaud" },
      { titre: "Un homme sans nom" },
      { titre: "Compter les heures" },
      { titre: "Le préau et le bagne" },
      { titre: "La visite de la petite fille" },
      { titre: "Le prêtre et le refus" },
      { titre: "Une plaidoirie sans tribune" },
      { titre: "Lire le réquisitoire" },
    ],
  },
  {
    id: "part_lan",
    code: "LAN",
    titre: "Cours de langue",
    auteur: "Maître Mohssine",
    type: "Langue",
    couleur: "#0A7480",
    teinte: "#E1EEF0",
    ordre: 4,
    pageDebut: 134,
    pageFin: 173,
    onlineUntil: 6,
    lessons: [
      { titre: "Rapporter des paroles" },
      { titre: "La modalisation" },
      { titre: "Exprimer la cause" },
      { titre: "Exprimer la conséquence" },
      { titre: "Exprimer le but" },
      { titre: "Opposition et concession" },
      { titre: "Enchaîner les arguments" },
      { titre: "Le lexique du jugement" },
      { titre: "Nominaliser une idée" },
      { titre: "Les figures de style" },
    ],
  },
  {
    id: "part_pe",
    code: "PE",
    titre: "Production écrite",
    auteur: "Maître Mohssine",
    type: "Écriture",
    couleur: "#2E7531",
    teinte: "#E5EEE6",
    ordre: 5,
    pageDebut: 180,
    pageFin: 207,
    onlineUntil: 4,
    lessons: [
      { titre: "Lire le sujet jusqu'au bout" },
      { titre: "Thèse, arguments, exemples" },
      { titre: "Le plan dialectique" },
      { titre: "Ouvrir la copie" },
      { titre: "Développer un paragraphe" },
      { titre: "Conclure sans se répéter" },
      { titre: "Écrire la copie complète" },
    ],
  },
  {
    id: "part_ex",
    code: "EX",
    titre: "Examens régionaux",
    auteur: "Sujets officiels",
    type: "Examen",
    couleur: "#5B2A9E",
    teinte: "#EBE5F3",
    ordre: 6,
    pageDebut: 214,
    pageFin: 285,
    onlineUntil: 8,
    lessons: Array.from({ length: 12 }, (_, i) => ({
      titre: `Régional ${2015 + i} · sujet et méthode`,
    })),
  },
];

function spread(start: number, end: number, count: number) {
  if (count <= 1) return [start];
  return Array.from({ length: count }, (_, i) =>
    Math.round(start + (i * (end - start)) / (count - 1)),
  );
}

const FRESH: Record<string, number> = {
  "LAN-06": 1,
  "PE-04": 2,
  "EX-2022": 3,
  "ANT-06": 4,
};

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export function buildCatalog() {
  const parts: Part[] = PARTS_SEED.map(({ lessons: _lessons, onlineUntil: _online, ...part }) => ({
    ...part,
    bookId: BOOK.id,
  }));

  const lessons: Lesson[] = [];
  let globalOrder = 0;

  for (const part of PARTS_SEED) {
    const pages = spread(part.pageDebut, part.pageFin, part.lessons.length);
    part.lessons.forEach((lesson, index) => {
      globalOrder += 1;
      const numero = part.code === "EX" ? String(2015 + index) : String(index + 1).padStart(2, "0");
      const code = `${part.code}-${numero}`;
      const online = index < part.onlineUntil;
      const age = FRESH[code] ?? 12 + globalOrder;
      lessons.push({
        id: `les_${code.toLowerCase()}`,
        partId: part.id,
        slug: code.toLowerCase(),
        code,
        numero,
        titre: lesson.titre,
        page: pages[index],
        dureeS: (8 + ((globalOrder * 3) % 9)) * 60,
        statut: online ? "en_ligne" : "a_tourner",
        miseEnLigneLe: online ? daysAgo(age) : null,
        ordre: globalOrder,
        bunnyVideoId: `bunny_${code.toLowerCase()}`,
        bunnyPreviewId: `preview_${code.toLowerCase()}`,
      });
    });
  }

  return { book: BOOK, parts, lessons };
}

export function partByCode(parts: Part[], code: string) {
  return parts.find((p) => p.code.toLowerCase() === code.toLowerCase()) ?? null;
}

export function partOf(parts: Part[], lesson: { partId: string }) {
  return parts.find((p) => p.id === lesson.partId) ?? null;
}
