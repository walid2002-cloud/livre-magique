import { buildCatalog } from "./catalog";
import { defaultBanks, defaultPacks } from "./offers";
import { hashPassword } from "./password";
import type { Admin, DB, LmEvent, Progress, Student } from "./types";

export const DB_VERSION = 1;

export function demoAgentSources(): DB["agentSources"] {
  return [
    {
      id: "agt_bam01_cours",
      lessonId: "les_bam-01",
      kind: "cours",
      titre: "Fiche Sefrioui",
      texte: "Ahmed Sefrioui raconte Fès à travers un enfant. Le narrateur observe la maison, la terrasse et le quartier. La boîte à merveilles garde de petits objets qui deviennent des souvenirs. La ville entre dans le regard de l'enfant.",
      pdfId: null,
      creeLe: at(1, 11, 0),
    },
    {
      id: "agt_bam01_corr",
      lessonId: "les_bam-01",
      kind: "correction",
      titre: "Corrigé du narrateur",
      texte: "Question : qui raconte ? Réponse attendue : un narrateur enfant qui se souvient, devenu adulte. Question : à quoi sert la boîte ? Réponse attendue : elle conserve les objets et ouvre la mémoire. Une copie qui dit seulement « une boîte de jouets » est incomplète.",
      pdfId: null,
      creeLe: at(1, 11, 5),
    },
  ];
}

function at(daysAgo: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function admin(id: string, nom: string, identifiant: string, role: Admin["role"], password: string): Admin {
  return { id, nom, identifiant, role, passwordHash: hashPassword(password) };
}

export function createSeed(): DB {
  const { lessons } = buildCatalog();
  const now = new Date().toISOString();
  const admins: Admin[] = [
    admin("adm_mohssine", "Maître Mohssine", "mohssine", "super_admin", "MOHSSINE"),
    admin("adm_khalil", "Khalil · With Khalil Agency", "khalil", "super_admin", "AGENCE1"),
    admin("adm_grok", "Grok", "grok", "super_admin", "GROK47"),
    admin("adm_ventes", "Équipe ventes", "ventes", "ventes", "VENTES1"),
  ];

  const yassine: Student = {
    id: "stu_yassine",
    bookId: "book_lm",
    identifiant: "0661234524",
    alias: [],
    telephone: "0661234524",
    prenom: "Yassine",
    nom: "Bennani",
    ville: "Casablanca",
    canal: "whatsapp",
    statut: "active",
    batchId: null,
    activeLe: at(18),
    creePar: "adm_khalil",
    creeLe: at(20),
    passwordHash: hashPassword("K7M4PX"),
  };

  const blocked: Student = {
    id: "stu_sara",
    bookId: "book_lm",
    identifiant: "0661000099",
    alias: [],
    telephone: "0661000099",
    prenom: "Sara",
    nom: "El Idrissi",
    ville: "Rabat",
    canal: "site",
    statut: "active",
    batchId: null,
    activeLe: at(6),
    creePar: "adm_ventes",
    creeLe: at(8),
    passwordHash: hashPassword("DEVICE"),
  };

  const today: Student = {
    id: "stu_today",
    bookId: "book_lm",
    identifiant: "0661555010",
    alias: [],
    telephone: "0661555010",
    prenom: "",
    nom: "Amrani",
    ville: "",
    canal: "tournee",
    statut: "en_attente",
    batchId: null,
    activeLe: null,
    creePar: "adm_ventes",
    creeLe: now,
    passwordHash: hashPassword("TODAY1"),
  };

  const batchAccounts = [
    ["LM-00418", "R8TQ2H", "stu_lm418"],
    ["LM-00419", "K4NP7Q", "stu_lm419"],
    ["LM-00420", "H8WT2M", "stu_lm420"],
    ["LM-00421", "Q5RJ9C", "stu_lm421"],
    ["LM-00422", "M3YK6D", "stu_lm422"],
  ] as const;

  const library: Student[] = batchAccounts.map(([identifiant, password, id]) => ({
    id,
    bookId: "book_lm",
    identifiant,
    alias: [],
    telephone: null,
    prenom: "",
    nom: "",
    ville: "",
    canal: "librairie" as const,
    statut: "en_attente" as const,
    batchId: "batch_seed",
    activeLe: null,
    creePar: "adm_khalil",
    creeLe: at(4),
    passwordHash: hashPassword(password),
  }));

  const viewed = lessons.filter((l) => ["BAM-01", "BAM-02", "BAM-03", "BAM-04", "BAM-05", "BAM-06"].includes(l.code));
  const resume = lessons.find((l) => l.code === "BAM-07");
  const progress: Progress[] = viewed.map((lesson, index) => ({
    studentId: yassine.id,
    lessonId: lesson.id,
    positionS: lesson.dureeS,
    vue: true,
    vueLe: at(10 - index),
    majLe: at(10 - index),
  }));
  if (resume) {
    progress.push({
      studentId: yassine.id,
      lessonId: resume.id,
      positionS: 420,
      vue: false,
      vueLe: null,
      majLe: at(0, new Date().getHours(), Math.max(0, new Date().getMinutes() - 20)),
    });
  }

  const scanPlan: { code: string; recent: number; older: number }[] = [
    { code: "BAM-03", recent: 9, older: 4 },
    { code: "BAM-01", recent: 7, older: 6 },
    { code: "ANT-04", recent: 6, older: 2 },
    { code: "EX-2022", recent: 5, older: 1 },
    { code: "LAN-02", recent: 4, older: 3 },
    { code: "PE-01", recent: 2, older: 2 },
  ];

  const events: LmEvent[] = [];
  let n = 0;
  for (const plan of scanPlan) {
    const lesson = lessons.find((l) => l.code === plan.code);
    if (!lesson) continue;
    for (let i = 0; i < plan.recent; i++) {
      n += 1;
      events.push({
        id: `evt_scan_${n}`,
        type: "scan_qr",
        lessonId: lesson.id,
        studentId: i % 3 === 0 ? yassine.id : null,
        deviceId: null,
        creeLe: at(i % 6, 8 + (i % 10), (i * 7) % 60),
      });
    }
    for (let i = 0; i < plan.older; i++) {
      n += 1;
      events.push({
        id: `evt_old_${n}`,
        type: "scan_qr",
        lessonId: lesson.id,
        studentId: null,
        deviceId: null,
        creeLe: at(8 + (i % 5), 11, (i * 11) % 60),
      });
    }
  }
  events.push({
    id: "evt_login_yassine",
    type: "connexion",
    lessonId: null,
    studentId: yassine.id,
    deviceId: "seed_iphone",
    creeLe: at(1, 21, 10),
  });

  return {
    version: DB_VERSION,
    lessons,
    students: [today, yassine, blocked, ...library],
    devices: [
      {
        id: "dev_yassine_phone",
        studentId: yassine.id,
        deviceId: "seed_iphone",
        libelle: "Safari · iPhone",
        premierVu: at(12),
        dernierVu: at(1, 21, 10),
        revoqueLe: null,
      },
      {
        id: "dev_sara_a",
        studentId: blocked.id,
        deviceId: "seed_sara_phone",
        libelle: "Chrome · Android",
        premierVu: at(6),
        dernierVu: at(1),
        revoqueLe: null,
      },
      {
        id: "dev_sara_b",
        studentId: blocked.id,
        deviceId: "seed_sara_pc",
        libelle: "Chrome · Windows",
        premierVu: at(3),
        dernierVu: at(2),
        revoqueLe: null,
      },
    ],
    progress,
    events,
    batches: [
      {
        id: "batch_seed",
        bookId: "book_lm",
        quantite: batchAccounts.length,
        creePar: "adm_khalil",
        creeLe: at(4, 9, 30),
        exporteLe: at(4, 9, 40),
        comptes: batchAccounts.map(([identifiant, motDePasse, studentId]) => ({
          identifiant,
          motDePasse,
          studentId,
        })),
      },
    ],
    messages: [
      {
        id: "msg_today",
        studentId: today.id,
        type: "acces",
        statut: "envoye",
        body: "Mabrouk ! Le Livre Magique dyalk wsal 🎉\nAccès aux vidéos de Maître Mohssine :\n🌐 livremagique.ma\n👤 Identifiant : 0661555010\n🔑 Mot de passe : TODAY1\n📱 Scanne les QR du livre\n💻 Ou tape le code sous le QR (ex : BAM-03)\n⚠ Compte personnel, 2 appareils max.",
        providerId: "demo_msg_today",
        envoyeLe: now,
      },
    ],
    admins,
    audit: [
      {
        id: "aud_seed",
        adminId: "adm_khalil",
        action: "Lot librairie",
        cible: "5 comptes",
        creeLe: at(4, 9, 30),
      },
    ],
    attempts: [],
    packs: defaultPacks(),
    banks: defaultBanks(),
    enrollments: [],
    pdfs: [],
    videos: [],
    agentSources: demoAgentSources(),
    studio: {
      questionsOuvertes: false,
      welcomePhotoId: null,
      welcomeVideoId: null,
      faq: [],
      quizzes: [],
      mistakes: [],
      writings: [],
      paths: [],
      questions: [],
    },
  };
}
