export type Role = "super_admin" | "ventes";
export type AccountStatus = "en_attente" | "active" | "desactive";
export type Channel = "whatsapp" | "tournee" | "site" | "centre" | "librairie";
export type LessonStatus = "en_ligne" | "a_tourner";
export type EventType =
  | "scan_qr"
  | "code_saisi"
  | "lecture"
  | "apercu_termine"
  | "connexion";

export type Book = {
  id: string;
  titre: string;
  niveau: string;
  domaine: string;
  statut: "actif";
};

export type Part = {
  id: string;
  bookId: string;
  code: string;
  titre: string;
  auteur: string;
  type: string;
  couleur: string;
  teinte: string;
  ordre: number;
  pageDebut: number;
  pageFin: number;
};

export type Lesson = {
  id: string;
  partId: string;
  slug: string;
  code: string;
  numero: string;
  titre: string;
  page: number;
  dureeS: number;
  statut: LessonStatus;
  miseEnLigneLe: string | null;
  ordre: number;
  bunnyVideoId: string;
  bunnyPreviewId: string;
};

export type Student = {
  id: string;
  bookId: string;
  identifiant: string;
  alias: string[];
  telephone: string | null;
  prenom: string;
  nom: string;
  ville: string;
  canal: Channel | null;
  statut: AccountStatus;
  batchId: string | null;
  activeLe: string | null;
  creePar: string;
  creeLe: string;
  passwordHash: string;
  acces?: "chapitre" | "complet";
};

export type Device = {
  id: string;
  studentId: string;
  deviceId: string;
  libelle: string;
  premierVu: string;
  dernierVu: string;
  revoqueLe: string | null;
};

export type Progress = {
  studentId: string;
  lessonId: string;
  positionS: number;
  vue: boolean;
  vueLe: string | null;
  majLe: string;
};

export type LmEvent = {
  id: string;
  type: EventType;
  lessonId: string | null;
  studentId: string | null;
  deviceId: string | null;
  creeLe: string;
};

export type BatchAccount = {
  identifiant: string;
  motDePasse: string;
  studentId: string;
};

export type Batch = {
  id: string;
  bookId: string;
  quantite: number;
  creePar: string;
  creeLe: string;
  exporteLe: string | null;
  comptes: BatchAccount[];
};

export type Message = {
  id: string;
  studentId: string;
  type: "acces" | "renvoi";
  statut: "envoye" | "livre" | "echec";
  body: string;
  providerId: string | null;
  envoyeLe: string;
};

export type Admin = {
  id: string;
  nom: string;
  identifiant: string;
  role: Role;
  passwordHash: string;
};

export type Audit = {
  id: string;
  adminId: string;
  action: string;
  cible: string;
  creeLe: string;
};

export type Attempt = { key: string; at: string };

export type BankId = "cashplus" | "cih" | "bmce" | "attijari";

export type Pack = {
  id: string;
  nom: string;
  detail: string;
  prixMad: number;
  actif: boolean;
  duree: string;
  perimetre: string;
};

export type BankAccount = {
  id: BankId;
  nom: string;
  titulaire: string;
  rib: string;
  consigne: string;
};

export type EnrollmentStatus = "en_attente" | "valide" | "refuse";

export type Enrollment = {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  ville: string;
  packId: string;
  bankId: BankId;
  statut: EnrollmentStatus;
  justifId: string;
  justifNom: string;
  studentId: string | null;
  creeLe: string;
  traiteLe: string | null;
  motif: string;
};

export type PdfDoc = {
  id: string;
  lessonId: string;
  titre: string;
  nom: string;
  creeLe: string;
};

export type VideoFile = {
  id: string;
  lessonId: string;
  nom: string;
  creeLe: string;
};

export type AgentKind = "cours" | "correction";

export type AgentSource = {
  id: string;
  lessonId: string;
  kind: AgentKind;
  titre: string;
  texte: string;
  pdfId: string | null;
  creeLe: string;
};

export type FaqEntry = { id: string; q: string; a: string; qAr: string; aAr: string };
export type PracticeQuestion = { prompt: string; choices: string[]; answer: number; why: string };
export type PracticeQuiz = { id: string; kind: "teste" | "defi" | "decouverte"; titre: string; questions: PracticeQuestion[] };
export type MistakeNote = { id: string; titre: string; faux: string; juste: string; note: string };
export type WritingSample = { id: string; titre: string; copie: string; commentaire: string };
export type RevisionPath = { id: string; jours: 7 | 15 | 30; codes: string[] };
export type TeacherQuestion = { id: string; studentId: string; prenom: string; texte: string; creeLe: string; reponse: string };
export type Studio = {
  questionsOuvertes: boolean;
  welcomePhotoId: string | null;
  welcomeVideoId: string | null;
  faq: FaqEntry[];
  quizzes: PracticeQuiz[];
  mistakes: MistakeNote[];
  writings: WritingSample[];
  paths: RevisionPath[];
  questions: TeacherQuestion[];
};

export type DB = {
  version: number;
  lessons: Lesson[];
  students: Student[];
  devices: Device[];
  progress: Progress[];
  events: LmEvent[];
  batches: Batch[];
  messages: Message[];
  admins: Admin[];
  audit: Audit[];
  attempts: Attempt[];
  packs: Pack[];
  banks: BankAccount[];
  enrollments: Enrollment[];
  pdfs: PdfDoc[];
  videos: VideoFile[];
  agentSources: AgentSource[];
  studio: Studio;
};

export type StudentSession = {
  kind: "student";
  studentId: string;
  deviceId: string;
};

export type AdminSession = {
  kind: "admin";
  adminId: string;
};

export type Persisted = {
  db: DB;
  session: StudentSession | null;
  adminSession: AdminSession | null;
  activatingId: string | null;
  savedAt?: number;
};
