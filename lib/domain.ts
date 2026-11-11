import { accessMessage } from "./config";
import { hashPassword } from "./password";
import { normalizeLogin, normalizePhone, slugFromCode } from "./normalize";
import type { AccountStatus, Admin, AgentKind, BankId, Channel, DB, Lesson, Role } from "./types";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const MAX_DEVICES = 2;

export type Fail = { ok: false; error: string; retryAt?: string };
export type Ok<T> = { ok: true; db: DB; data: T };

function clone(db: DB): DB {
  return structuredClone(db);
}

function recent(db: DB, key: string, now: string) {
  const t = new Date(now).getTime();
  return db.attempts.filter((a) => a.key === key && t - new Date(a.at).getTime() < WINDOW_MS);
}

function retryAt(db: DB, keys: string[], now: string) {
  let earliest: number | null = null;
  for (const key of keys) {
    const fails = recent(db, key, now);
    if (fails.length < MAX_FAILS) continue;
    const oldest = Math.min(...fails.map((f) => new Date(f.at).getTime()));
    earliest = earliest === null ? oldest : Math.min(earliest, oldest);
  }
  if (earliest === null) return null;
  return new Date(earliest + WINDOW_MS).toISOString();
}

function waitMessage(retry: string, now: string) {
  const mins = Math.max(1, Math.ceil((new Date(retry).getTime() - new Date(now).getTime()) / 60_000));
  return `Trop d'essais. Réessaie dans ${mins} min.`;
}

function audit(db: DB, adminId: string, action: string, cible: string, now: string, id: string) {
  db.audit.unshift({ id, adminId, action, cible, creeLe: now });
}

export function activeDevices(db: DB, studentId: string) {
  return db.devices.filter((d) => d.studentId === studentId && !d.revoqueLe);
}

export function findStudent(db: DB, login: string) {
  return (
    db.students.find((s) => s.identifiant === login || s.alias.includes(login) || s.telephone === login) ??
    null
  );
}

export function findAdmin(db: DB, login: string) {
  const id = login.trim().toLowerCase();
  return db.admins.find((a) => a.identifiant === id) ?? null;
}

function splitName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: "", nom: "" };
  if (parts.length === 1) return { prenom: "", nom: parts[0] };
  return { prenom: parts[0], nom: parts.slice(1).join(" ") };
}

function recordFail(db: DB, keys: string[], now: string, error: string): Fail & { db: DB } {
  for (const key of keys) db.attempts.push({ key, at: now });
  const again = retryAt(db, keys, now);
  if (again) return { ok: false, error: waitMessage(again, now), retryAt: again, db };
  return { ok: false, error, db };
}

export function loginStudentClean(
  source: DB,
  input: {
    identifiant: string;
    password: string;
    deviceId: string;
    libelle: string;
    ip: string;
    now: string;
    deviceRecordId: string;
    eventId: string;
  },
): (Ok<{ kind: "session" | "activation"; studentId: string }> & { db: DB }) | (Fail & { db: DB }) {
  const db = clone(source);
  const ipKey = `ip:${input.ip}`;
  const login = normalizeLogin(input.identifiant);
  const keys = login ? [`id:${login}`, ipKey] : [ipKey];
  const blocked = retryAt(db, keys, input.now);
  if (blocked) return { ok: false, error: waitMessage(blocked, input.now), retryAt: blocked, db: source };

  if (!login) {
    return recordFail(db, keys, input.now, "Utilise ton numéro 06… ou ton identifiant LM-…");
  }

  const student = findStudent(db, login);
  if (!student || student.passwordHash !== hashPassword(input.password)) {
    return recordFail(db, keys, input.now, "Identifiant ou mot de passe incorrect.");
  }

  db.attempts = db.attempts.filter((a) => !keys.includes(a.key));

  if (student.statut === "desactive") {
    return { ok: false, error: "Ce compte est désactivé. Écris au support.", db };
  }

  if (student.statut === "en_attente") {
    return { ok: true, db, data: { kind: "activation", studentId: student.id } };
  }

  const known = db.devices.find((d) => d.studentId === student.id && d.deviceId === input.deviceId);
  if (known && !known.revoqueLe) {
    known.dernierVu = input.now;
    known.libelle = input.libelle;
    db.events.unshift({
      id: input.eventId,
      type: "connexion",
      lessonId: null,
      studentId: student.id,
      deviceId: input.deviceId,
      creeLe: input.now,
    });
    return { ok: true, db, data: { kind: "session", studentId: student.id } };
  }

  if (activeDevices(db, student.id).length >= MAX_DEVICES) {
    return { ok: false, error: "Écris au support pour changer d'appareil.", db };
  }

  db.devices.push({
    id: input.deviceRecordId,
    studentId: student.id,
    deviceId: input.deviceId,
    libelle: input.libelle,
    premierVu: input.now,
    dernierVu: input.now,
    revoqueLe: null,
  });
  db.events.unshift({
    id: input.eventId,
    type: "connexion",
    lessonId: null,
    studentId: student.id,
    deviceId: input.deviceId,
    creeLe: input.now,
  });
  return { ok: true, db, data: { kind: "session", studentId: student.id } };
}

export function activateStudent(
  source: DB,
  input: {
    studentId: string;
    prenom: string;
    nom: string;
    ville: string;
    telephone: string;
    password: string;
    consent: boolean;
    deviceId: string;
    libelle: string;
    now: string;
    deviceRecordId: string;
    eventId: string;
  },
): Ok<{ studentId: string }> | Fail {
  const db = clone(source);
  const student = db.students.find((s) => s.id === input.studentId);
  if (!student || student.statut === "desactive") {
    return { ok: false, error: "Ce compte ne peut pas être activé." };
  }
  if (!input.consent) return { ok: false, error: "Le consentement est nécessaire pour activer le livre." };
  if (!input.prenom.trim() || !input.nom.trim() || !input.ville.trim()) {
    return { ok: false, error: "Prénom, nom et ville sont obligatoires." };
  }
  if (input.password.trim().length < 6) {
    return { ok: false, error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }

  if (!student.telephone) {
    const phone = normalizePhone(input.telephone);
    if (!phone) return { ok: false, error: "Numéro WhatsApp invalide. Format attendu : 06XXXXXXXX." };
    const taken = db.students.some(
      (s) => s.id !== student.id && (s.telephone === phone || s.identifiant === phone || s.alias.includes(phone)),
    );
    if (taken) return { ok: false, error: "Ce numéro est déjà inscrit." };
    student.telephone = phone;
    if (!student.alias.includes(phone)) student.alias.push(phone);
  }

  student.prenom = input.prenom.trim();
  student.nom = input.nom.trim();
  student.ville = input.ville.trim();
  student.passwordHash = hashPassword(input.password);
  student.statut = "active";
  student.activeLe = input.now;

  if (activeDevices(db, student.id).length >= MAX_DEVICES) {
    return { ok: false, error: "Écris au support pour changer d'appareil." };
  }
  db.devices.push({
    id: input.deviceRecordId,
    studentId: student.id,
    deviceId: input.deviceId,
    libelle: input.libelle,
    premierVu: input.now,
    dernierVu: input.now,
    revoqueLe: null,
  });
  db.events.unshift({
    id: input.eventId,
    type: "connexion",
    lessonId: null,
    studentId: student.id,
    deviceId: input.deviceId,
    creeLe: input.now,
  });
  return { ok: true, db, data: { studentId: student.id } };
}

export function changePassword(
  source: DB,
  input: { studentId: string; current: string; next: string },
): Ok<{ studentId: string }> | Fail {
  const db = clone(source);
  const student = db.students.find((s) => s.id === input.studentId);
  if (!student) return { ok: false, error: "Compte introuvable." };
  if (student.passwordHash !== hashPassword(input.current)) {
    return { ok: false, error: "Le mot de passe actuel est incorrect." };
  }
  if (input.next.trim().length < 6) {
    return { ok: false, error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }
  student.passwordHash = hashPassword(input.next);
  return { ok: true, db, data: { studentId: student.id } };
}

export function createSale(
  source: DB,
  input: {
    telephone: string;
    nom: string;
    canal: Channel;
    admin: Admin;
    password: string;
    now: string;
    studentId: string;
    messageId: string;
    auditId: string;
  },
): Ok<{ message: string; studentId: string; identifiant: string }> | Fail {
  const db = clone(source);
  const phone = normalizePhone(input.telephone);
  if (!phone) return { ok: false, error: "Numéro WhatsApp invalide. Utilise 06, 05 ou 07, ou +212." };
  const exists = db.students.some(
    (s) => s.telephone === phone || s.identifiant === phone || s.alias.includes(phone),
  );
  if (exists) {
    return {
      ok: false,
      error: "Ce numéro est déjà inscrit. Renvoie les accès depuis l'onglet Élèves.",
    };
  }
  const { prenom, nom } = splitName(input.nom);
  db.students.unshift({
    id: input.studentId,
    bookId: "book_lm",
    identifiant: phone,
    alias: [],
    telephone: phone,
    prenom,
    nom,
    ville: "",
    canal: input.canal,
    statut: "en_attente",
    batchId: null,
    activeLe: null,
    creePar: input.admin.id,
    creeLe: input.now,
    passwordHash: hashPassword(input.password),
  });
  const body = accessMessage({ prenom, identifiant: phone, password: input.password });
  db.messages.unshift({
    id: input.messageId,
    studentId: input.studentId,
    type: "acces",
    statut: "envoye",
    body,
    providerId: `demo_${input.messageId}`,
    envoyeLe: input.now,
  });
  audit(db, input.admin.id, "Création d'un compte", phone, input.now, input.auditId);
  return { ok: true, db, data: { message: body, studentId: input.studentId, identifiant: phone } };
}

export function createBatch(
  source: DB,
  input: {
    quantite: number;
    admin: Admin;
    passwords: string[];
    now: string;
    batchId: string;
    studentIds: string[];
    auditId: string;
  },
): Ok<{ batchId: string; first: string }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  if (!Number.isInteger(input.quantite) || input.quantite < 1 || input.quantite > 5000) {
    return { ok: false, error: "Indique un nombre de livres entre 1 et 5 000." };
  }
  if (input.passwords.length !== input.quantite || input.studentIds.length !== input.quantite) {
    return { ok: false, error: "Lot incomplet." };
  }
  const db = clone(source);
  const used = db.students
    .map((s) => s.identifiant)
    .concat(db.students.flatMap((s) => s.alias))
    .map((id) => (/^LM-(\d{5})$/.exec(id)?.[1] ? Number(/^LM-(\d{5})$/.exec(id)![1]) : 0));
  let next = Math.max(0, ...used) + 1;
  const comptes = [];
  for (let i = 0; i < input.quantite; i++) {
    if (next > 99999) return { ok: false, error: "Plus de numéros LM disponibles." };
    const identifiant = `LM-${String(next).padStart(5, "0")}`;
    next += 1;
    const studentId = input.studentIds[i];
    db.students.push({
      id: studentId,
      bookId: "book_lm",
      identifiant,
      alias: [],
      telephone: null,
      prenom: "",
      nom: "",
      ville: "",
      canal: "librairie",
      statut: "en_attente",
      batchId: input.batchId,
      activeLe: null,
      creePar: input.admin.id,
      creeLe: input.now,
      passwordHash: hashPassword(input.passwords[i]),
    });
    comptes.push({ identifiant, motDePasse: input.passwords[i], studentId });
  }
  db.batches.unshift({
    id: input.batchId,
    bookId: "book_lm",
    quantite: input.quantite,
    creePar: input.admin.id,
    creeLe: input.now,
    exporteLe: null,
    comptes,
  });
  audit(db, input.admin.id, "Lot librairie", `${input.quantite} comptes`, input.now, input.auditId);
  return { ok: true, db, data: { batchId: input.batchId, first: comptes[0].identifiant } };
}

export function markBatchExported(source: DB, batchId: string, now: string): DB {
  const db = clone(source);
  const batch = db.batches.find((b) => b.id === batchId);
  if (batch && !batch.exporteLe) batch.exporteLe = now;
  return db;
}

export function batchCsv(batch: { comptes: { identifiant: string; motDePasse: string }[] }) {
  const lines = ["identifiant;mot_de_passe", ...batch.comptes.map((c) => `${c.identifiant};${c.motDePasse}`)];
  return lines.join("\n");
}

export function resendAccess(
  source: DB,
  input: { studentId: string; admin: Admin; password: string; now: string; messageId: string; auditId: string },
): Ok<{ message: string }> | Fail {
  const db = clone(source);
  const student = db.students.find((s) => s.id === input.studentId);
  if (!student) return { ok: false, error: "Élève introuvable." };
  student.passwordHash = hashPassword(input.password);
  const body = accessMessage({
    prenom: student.prenom,
    identifiant: student.telephone || student.identifiant,
    password: input.password,
  });
  db.messages.unshift({
    id: input.messageId,
    studentId: student.id,
    type: "renvoi",
    statut: "envoye",
    body,
    providerId: `demo_${input.messageId}`,
    envoyeLe: input.now,
  });
  audit(db, input.admin.id, "Renvoi des accès", student.identifiant, input.now, input.auditId);
  return { ok: true, db, data: { message: body } };
}

export function releaseDevices(
  source: DB,
  input: { studentId: string; admin: Admin; now: string; auditId: string },
): Ok<{ studentId: string }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  const db = clone(source);
  const student = db.students.find((s) => s.id === input.studentId);
  if (!student) return { ok: false, error: "Élève introuvable." };
  for (const device of db.devices) {
    if (device.studentId === student.id && !device.revoqueLe) device.revoqueLe = input.now;
  }
  audit(db, input.admin.id, "Libération des appareils", student.identifiant, input.now, input.auditId);
  return { ok: true, db, data: { studentId: student.id } };
}

export function setAccountStatus(
  source: DB,
  input: { studentId: string; admin: Admin; statut: AccountStatus; now: string; auditId: string },
): Ok<{ studentId: string }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  const db = clone(source);
  const student = db.students.find((s) => s.id === input.studentId);
  if (!student) return { ok: false, error: "Élève introuvable." };
  student.statut = input.statut;
  audit(
    db,
    input.admin.id,
    input.statut === "desactive" ? "Désactivation" : "Changement de statut",
    student.identifiant,
    input.now,
    input.auditId,
  );
  return { ok: true, db, data: { studentId: student.id } };
}

export function isViewed(positionS: number, dureeS: number, marked: boolean) {
  if (marked) return true;
  if (dureeS <= 0) return false;
  return positionS / dureeS >= 0.9;
}

export function saveProgress(
  source: DB,
  input: { studentId: string; lessonId: string; positionS: number; marked: boolean; now: string },
): DB {
  const db = clone(source);
  const lesson = db.lessons.find((l) => l.id === input.lessonId);
  if (!lesson) return db;
  const vue = isViewed(input.positionS, lesson.dureeS, input.marked);
  const current = db.progress.find((p) => p.studentId === input.studentId && p.lessonId === input.lessonId);
  if (!current) {
    db.progress.push({
      studentId: input.studentId,
      lessonId: input.lessonId,
      positionS: Math.floor(input.positionS),
      vue,
      vueLe: vue ? input.now : null,
      majLe: input.now,
    });
    return db;
  }
  current.positionS = Math.floor(input.positionS);
  current.majLe = input.now;
  if (vue && !current.vue) {
    current.vue = true;
    current.vueLe = input.now;
  }
  return db;
}

export function addEvent(
  source: DB,
  input: {
    id: string;
    type: DB["events"][number]["type"];
    lessonId: string | null;
    studentId: string | null;
    deviceId: string | null;
    now: string;
  },
): DB {
  const db = clone(source);
  db.events.unshift({
    id: input.id,
    type: input.type,
    lessonId: input.lessonId,
    studentId: input.studentId,
    deviceId: input.deviceId,
    creeLe: input.now,
  });
  return db;
}

export function setLessonStatus(
  source: DB,
  input: { lessonId: string; admin: Admin; now: string; auditId: string },
): Ok<{ statut: Lesson["statut"] }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  const db = clone(source);
  const lesson = db.lessons.find((l) => l.id === input.lessonId);
  if (!lesson) return { ok: false, error: "Leçon introuvable." };
  lesson.statut = lesson.statut === "en_ligne" ? "a_tourner" : "en_ligne";
  lesson.miseEnLigneLe = lesson.statut === "en_ligne" ? input.now : null;
  audit(db, input.admin.id, "Statut vidéo", lesson.code, input.now, input.auditId);
  return { ok: true, db, data: { statut: lesson.statut } };
}

export function updateLesson(
  source: DB,
  input: {
    admin: Admin;
    lessonId: string;
    titre: string;
    page: number;
    ordre: number;
    dureeS: number;
    partId: string;
    bunnyVideoId: string;
    bunnyPreviewId: string;
    now: string;
    auditId: string;
  },
): Ok<{ lessonId: string }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  const db = clone(source);
  const lesson = db.lessons.find((l) => l.id === input.lessonId);
  if (!lesson) return { ok: false, error: "Leçon introuvable." };
  if (!input.titre.trim()) return { ok: false, error: "Le titre est obligatoire." };
  lesson.titre = input.titre.trim();
  lesson.page = input.page;
  lesson.ordre = input.ordre;
  lesson.dureeS = input.dureeS;
  lesson.partId = input.partId;
  lesson.bunnyVideoId = input.bunnyVideoId.trim();
  lesson.bunnyPreviewId = input.bunnyPreviewId.trim();
  audit(db, input.admin.id, "Modification d'une leçon", lesson.code, input.now, input.auditId);
  return { ok: true, db, data: { lessonId: lesson.id } };
}

export function addLesson(
  source: DB,
  input: {
    admin: Admin;
    partId: string;
    numero: string;
    titre: string;
    page: number;
    ordre: number;
    bunnyVideoId: string;
    bunnyPreviewId: string;
    prefix: string;
    now: string;
    lessonId: string;
    auditId: string;
  },
): Ok<{ code: string }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  const numero = input.prefix === "EX" ? input.numero.trim() : input.numero.trim().padStart(2, "0");
  const code = `${input.prefix}-${numero}`;
  if (!/^(?:[A-Z]{2,3}-\d{2}|EX-\d{4})$/.test(code)) {
    return { ok: false, error: "Numéro de leçon invalide." };
  }
  const db = clone(source);
  if (db.lessons.some((l) => l.code === code || l.slug === slugFromCode(code))) {
    return { ok: false, error: "Ce code existe déjà." };
  }
  db.lessons.push({
    id: input.lessonId,
    partId: input.partId,
    slug: slugFromCode(code),
    code,
    numero,
    titre: input.titre.trim() || "Nouvelle leçon",
    page: input.page,
    dureeS: 600,
    statut: "a_tourner",
    miseEnLigneLe: null,
    ordre: input.ordre,
    bunnyVideoId: input.bunnyVideoId.trim(),
    bunnyPreviewId: input.bunnyPreviewId.trim(),
  });
  audit(db, input.admin.id, "Ajout d'une leçon", code, input.now, input.auditId);
  return { ok: true, db, data: { code } };
}

export function addAdmin(
  source: DB,
  input: { actor: Admin; nom: string; identifiant: string; role: Role; password: string; now: string; adminId: string; auditId: string },
): Ok<{ identifiant: string; password: string }> | Fail {
  if (input.actor.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  const identifiant = input.identifiant.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,24}$/.test(identifiant)) {
    return { ok: false, error: "Identifiant admin : 3 à 24 lettres ou chiffres." };
  }
  if (!input.nom.trim()) return { ok: false, error: "Le nom est obligatoire." };
  const db = clone(source);
  if (db.admins.some((a) => a.identifiant === identifiant)) {
    return { ok: false, error: "Cet identifiant admin existe déjà." };
  }
  db.admins.push({
    id: input.adminId,
    nom: input.nom.trim(),
    identifiant,
    role: input.role,
    passwordHash: hashPassword(input.password),
  });
  audit(db, input.actor.id, "Ajout d'un admin", identifiant, input.now, input.auditId);
  return { ok: true, db, data: { identifiant, password: input.password } };
}

export function loginAdmin(
  source: DB,
  input: { identifiant: string; password: string; ip: string; now: string },
): (Ok<{ adminId: string }> & { db: DB }) | (Fail & { db: DB }) {
  const db = clone(source);
  const identifiant = input.identifiant.trim().toLowerCase();
  const keys = [`admin:${identifiant}`, `ip:${input.ip}`];
  const blocked = retryAt(db, keys, input.now);
  if (blocked) return { ok: false, error: waitMessage(blocked, input.now), retryAt: blocked, db: source };
  const admin = db.admins.find((a) => a.identifiant === identifiant);
  if (!admin || admin.passwordHash !== hashPassword(input.password)) {
    return recordFail(db, keys, input.now, "Identifiant ou mot de passe incorrect.");
  }
  db.attempts = db.attempts.filter((a) => !keys.includes(a.key));
  return { ok: true, db, data: { adminId: admin.id } };
}

export function createFreeStudent(
  source: DB,
  input: {
    prenom: string;
    nom: string;
    telephone: string;
    ville: string;
    password: string;
    now: string;
    studentId: string;
  },
): Ok<{ studentId: string; identifiant: string }> | Fail {
  const phone = normalizePhone(input.telephone);
  if (!phone) return { ok: false, error: "Numéro invalide. Utilise 06, 05 ou 07." };
  if (!input.prenom.trim() || !input.nom.trim()) return { ok: false, error: "Écris ton prénom et ton nom." };
  if (!input.ville.trim()) return { ok: false, error: "Indique ta ville." };
  if (input.password.trim().length < 6) return { ok: false, error: "Choisis un mot de passe d'au moins 6 caractères." };
  const db = clone(source);
  const taken = db.students.some((student) => student.telephone === phone || student.identifiant === phone);
  if (taken) return { ok: false, error: "Ce numéro est déjà inscrit. Connecte-toi." };
  db.students.unshift({
    id: input.studentId,
    bookId: "book_lm",
    identifiant: phone,
    alias: [],
    telephone: phone,
    prenom: input.prenom.trim(),
    nom: input.nom.trim(),
    ville: input.ville.trim(),
    canal: "site",
    statut: "active",
    batchId: null,
    activeLe: input.now,
    creePar: "site",
    creeLe: input.now,
    passwordHash: hashPassword(input.password),
    acces: "chapitre",
  });
  return { ok: true, db, data: { studentId: input.studentId, identifiant: phone } };
}

export function submitEnrollment(
  source: DB,
  input: {
    prenom: string;
    nom: string;
    telephone: string;
    ville: string;
    packId: string;
    bankId: BankId;
    justifId: string;
    justifNom: string;
    now: string;
    enrollmentId: string;
  },
): Ok<{ id: string }> | Fail {
  const phone = normalizePhone(input.telephone);
  if (!phone) return { ok: false, error: "Numéro invalide. Utilise 06, 05 ou 07." };
  if (!input.prenom.trim() || !input.nom.trim()) return { ok: false, error: "Écris ton prénom et ton nom." };
  if (!input.ville.trim()) return { ok: false, error: "Indique ta ville." };
  const db = clone(source);
  const pack = db.packs.find((item) => item.id === input.packId && item.actif);
  if (!pack) return { ok: false, error: "Choisis un pack." };
  if (!db.banks.some((item) => item.id === input.bankId)) return { ok: false, error: "Choisis une banque." };
  if (!input.justifNom) return { ok: false, error: "Ajoute le justificatif de paiement." };
  const existing = db.students.find((student) => student.telephone === phone || student.identifiant === phone);
  if (existing && existing.acces !== "chapitre") return { ok: false, error: "Ce numéro a déjà tout le livre. Connecte-toi." };
  const waiting = db.enrollments.some((item) => item.telephone === phone && item.statut === "en_attente");
  if (waiting) return { ok: false, error: "Ton justificatif est déjà en vérification." };
  db.enrollments.unshift({
    id: input.enrollmentId,
    prenom: input.prenom.trim(),
    nom: input.nom.trim(),
    telephone: phone,
    ville: input.ville.trim(),
    packId: pack.id,
    bankId: input.bankId,
    statut: "en_attente",
    justifId: input.justifId,
    justifNom: input.justifNom,
    motif: "",
    studentId: existing?.id ?? null,
    creeLe: input.now,
    traiteLe: null,
  });
  return { ok: true, db, data: { id: input.enrollmentId } };
}

export function grantEnrollment(
  source: DB,
  input: { enrollmentId: string; admin: Admin; password: string; now: string; studentId: string; messageId: string; auditId: string },
): Ok<{ message: string; phone: string }> | Fail {
  const db = clone(source);
  const enrollment = db.enrollments.find((item) => item.id === input.enrollmentId);
  if (!enrollment || enrollment.statut !== "en_attente") return { ok: false, error: "Cette demande n'est plus en attente." };
  const phone = enrollment.telephone;
  const already = db.students.find((student) => student.id === enrollment.studentId || student.telephone === phone || student.identifiant === phone);
  if (already) {
    already.acces = "complet";
    enrollment.statut = "valide";
    enrollment.studentId = already.id;
    enrollment.traiteLe = input.now;
    const body = `${enrollment.prenom}, tout le livre est ouvert. Connecte-toi avec ton numéro.`;
    db.messages.unshift({
      id: input.messageId,
      studentId: already.id,
      type: "acces",
      statut: "envoye",
      body,
      providerId: `demo_${input.messageId}`,
      envoyeLe: input.now,
    });
    audit(db, input.admin.id, "Livre complet", phone, input.now, input.auditId);
    return { ok: true, db, data: { message: body, phone } };
  }
  db.students.unshift({
    id: input.studentId,
    bookId: "book_lm",
    identifiant: phone,
    alias: [],
    telephone: phone,
    prenom: enrollment.prenom,
    nom: enrollment.nom,
    ville: enrollment.ville,
    canal: "site",
    statut: "active",
    batchId: null,
    activeLe: input.now,
    creePar: input.admin.id,
    creeLe: input.now,
    passwordHash: hashPassword(input.password),
    acces: "complet",
  });
  enrollment.statut = "valide";
  enrollment.studentId = input.studentId;
  enrollment.traiteLe = input.now;
  const body = accessMessage({ prenom: enrollment.prenom, identifiant: phone, password: input.password });
  db.messages.unshift({
    id: input.messageId,
    studentId: input.studentId,
    type: "acces",
    statut: "envoye",
    body,
    providerId: `demo_${input.messageId}`,
    envoyeLe: input.now,
  });
  audit(db, input.admin.id, "Accès élève", phone, input.now, input.auditId);
  return { ok: true, db, data: { message: body, phone } };
}

export function refuseEnrollment(
  source: DB,
  input: { enrollmentId: string; admin: Admin; now: string; auditId: string; motif?: string },
): Ok<{ id: string }> | Fail {
  const db = clone(source);
  const enrollment = db.enrollments.find((item) => item.id === input.enrollmentId);
  if (!enrollment || enrollment.statut !== "en_attente") return { ok: false, error: "Cette demande n'est plus en attente." };
  enrollment.statut = "refuse";
  enrollment.motif = input.motif?.trim() || "";
  enrollment.traiteLe = input.now;
  audit(db, input.admin.id, "Inscription refusée", enrollment.telephone, input.now, input.auditId);
  return { ok: true, db, data: { id: enrollment.id } };
}

export function savePdfMeta(
  source: DB,
  input: { admin: Admin; lessonId: string; titre: string; nom: string; now: string; pdfId: string; auditId: string },
): Ok<{ id: string }> | Fail {
  if (!input.titre.trim() || !input.nom) return { ok: false, error: "Le document a besoin d'un titre et d'un fichier." };
  const db = clone(source);
  if (!db.lessons.some((lesson) => lesson.id === input.lessonId)) return { ok: false, error: "Leçon introuvable." };
  db.pdfs.unshift({
    id: input.pdfId,
    lessonId: input.lessonId,
    titre: input.titre.trim(),
    nom: input.nom,
    creeLe: input.now,
  });
  audit(db, input.admin.id, "Document ajouté", input.titre.trim(), input.now, input.auditId);
  return { ok: true, db, data: { id: input.pdfId } };
}

export function removePdfMeta(
  source: DB,
  input: { admin: Admin; pdfId: string; now: string; auditId: string },
): Ok<{ id: string }> | Fail {
  const db = clone(source);
  const pdf = db.pdfs.find((item) => item.id === input.pdfId);
  if (!pdf) return { ok: false, error: "PDF introuvable." };
  db.pdfs = db.pdfs.filter((item) => item.id !== input.pdfId);
  db.agentSources = (db.agentSources ?? []).filter((item) => item.pdfId !== pdf.id);
  audit(db, input.admin.id, "Document retiré", pdf.titre, input.now, input.auditId);
  return { ok: true, db, data: { id: pdf.id } };
}

export function saveVideoMeta(
  source: DB,
  input: { admin: Admin; lessonId: string; nom: string; now: string; videoId: string; auditId: string },
): Ok<{ id: string; removedIds: string[] }> | Fail {
  if (!input.nom) return { ok: false, error: "Choisis une vidéo." };
  const db = clone(source);
  const lesson = db.lessons.find((item) => item.id === input.lessonId);
  if (!lesson) return { ok: false, error: "Leçon introuvable." };
  const removedIds = db.videos.filter((item) => item.lessonId === lesson.id).map((item) => item.id);
  db.videos = db.videos.filter((item) => item.lessonId !== lesson.id);
  db.videos.unshift({ id: input.videoId, lessonId: lesson.id, nom: input.nom, creeLe: input.now });
  lesson.statut = "en_ligne";
  lesson.miseEnLigneLe = input.now;
  audit(db, input.admin.id, "Vidéo publiée", lesson.code, input.now, input.auditId);
  return { ok: true, db, data: { id: input.videoId, removedIds } };
}

export function removeVideoMeta(
  source: DB,
  input: { admin: Admin; lessonId: string; now: string; auditId: string },
): Ok<{ removedIds: string[] }> | Fail {
  const db = clone(source);
  const lesson = db.lessons.find((item) => item.id === input.lessonId);
  if (!lesson) return { ok: false, error: "Leçon introuvable." };
  const removedIds = db.videos.filter((item) => item.lessonId === lesson.id).map((item) => item.id);
  if (removedIds.length === 0) return { ok: false, error: "Cette leçon n'a pas de vidéo." };
  db.videos = db.videos.filter((item) => item.lessonId !== lesson.id);
  audit(db, input.admin.id, "Vidéo retirée", lesson.code, input.now, input.auditId);
  return { ok: true, db, data: { removedIds } };
}

export function deleteStudent(
  source: DB,
  input: { studentId: string; admin: Admin; now: string; auditId: string },
): Ok<{ studentId: string }> | Fail {
  const db = clone(source);
  const student = db.students.find((item) => item.id === input.studentId);
  if (!student) return { ok: false, error: "Élève introuvable." };
  db.students = db.students.filter((item) => item.id !== student.id);
  db.devices = db.devices.filter((item) => item.studentId !== student.id);
  db.progress = db.progress.filter((item) => item.studentId !== student.id);
  db.messages = db.messages.filter((item) => item.studentId !== student.id);
  db.events = db.events.map((item) => (item.studentId === student.id ? { ...item, studentId: null } : item));
  for (const enrollment of db.enrollments) {
    if (enrollment.studentId === student.id) enrollment.studentId = null;
  }
  audit(db, input.admin.id, "Compte supprimé", student.identifiant, input.now, input.auditId);
  return { ok: true, db, data: { studentId: student.id } };
}

const AGENT_TEXT_MAX = 20_000;

export function saveAgentSource(
  source: DB,
  input: {
    admin: Admin;
    lessonId: string;
    kind: AgentKind;
    titre: string;
    texte: string;
    pdfId: string | null;
    now: string;
    sourceId: string;
    auditId: string;
  },
): Ok<{ id: string; truncated: boolean }> | Fail {
  const titre = input.titre.trim();
  const texte = input.texte.trim();
  if (!titre) return { ok: false, error: "Donne un titre au document." };
  if (texte.length < 8) return { ok: false, error: "Colle le texte du PDF ou de la correction." };
  const db = clone(source);
  if (!db.lessons.some((lesson) => lesson.id === input.lessonId)) return { ok: false, error: "Leçon introuvable." };
  db.agentSources = db.agentSources ?? [];
  if (input.pdfId) db.agentSources = db.agentSources.filter((item) => item.pdfId !== input.pdfId);
  db.agentSources.unshift({
    id: input.sourceId,
    lessonId: input.lessonId,
    kind: input.kind,
    titre,
    texte: texte.slice(0, AGENT_TEXT_MAX),
    pdfId: input.pdfId,
    creeLe: input.now,
  });
  audit(db, input.admin.id, input.kind === "correction" ? "Correction donnée à l'agent" : "PDF donné à l'agent", titre, input.now, input.auditId);
  return { ok: true, db, data: { id: input.sourceId, truncated: texte.length > AGENT_TEXT_MAX } };
}

export function removeAgentSource(
  source: DB,
  input: { admin: Admin; sourceId: string; now: string; auditId: string },
): Ok<{ id: string }> | Fail {
  const db = clone(source);
  const item = (db.agentSources ?? []).find((entry) => entry.id === input.sourceId);
  if (!item) return { ok: false, error: "Ce texte n'est plus dans l'agent." };
  db.agentSources = db.agentSources.filter((entry) => entry.id !== item.id);
  audit(db, input.admin.id, "Texte retiré de l'agent", item.titre, input.now, input.auditId);
  return { ok: true, db, data: { id: item.id } };
}

export function updateOffer(
  source: DB,
  input: { admin: Admin; packId: string; prixMad: number; now: string; auditId: string; duree?: string; perimetre?: string },
): Ok<{ id: string }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  if (!Number.isFinite(input.prixMad) || input.prixMad < 0) return { ok: false, error: "Indique un prix en dirhams." };
  const db = clone(source);
  const pack = db.packs.find((item) => item.id === input.packId);
  if (!pack) return { ok: false, error: "Pack introuvable." };
  pack.prixMad = Math.round(input.prixMad);
  if (input.duree !== undefined) pack.duree = input.duree.trim();
  if (input.perimetre !== undefined) pack.perimetre = input.perimetre.trim();
  audit(db, input.admin.id, "Prix du pack", pack.nom, input.now, input.auditId);
  return { ok: true, db, data: { id: pack.id } };
}

export function updateBank(
  source: DB,
  input: { admin: Admin; bankId: BankId; titulaire: string; rib: string; consigne: string; now: string; auditId: string },
): Ok<{ id: string }> | Fail {
  if (input.admin.role !== "super_admin") return { ok: false, error: "Réservé au super admin." };
  if (!input.rib.trim() || !input.titulaire.trim()) return { ok: false, error: "Le titulaire et le RIB sont obligatoires." };
  const db = clone(source);
  const bank = db.banks.find((item) => item.id === input.bankId);
  if (!bank) return { ok: false, error: "Banque introuvable." };
  bank.titulaire = input.titulaire.trim();
  bank.rib = input.rib.trim();
  bank.consigne = input.consigne.trim();
  audit(db, input.admin.id, "RIB", bank.nom, input.now, input.auditId);
  return { ok: true, db, data: { id: bank.id } };
}
