"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { buildCatalog } from "./catalog";
import {
  activateStudent,
  addAdmin,
  addEvent,
  addLesson,
  changePassword,
  createBatch,
  createFreeStudent,
  createSale,
  deleteStudent,
  grantEnrollment,
  loginAdmin,
  loginStudentClean,
  markBatchExported,
  refuseEnrollment,
  releaseDevices,
  removePdfMeta,
  removeVideoMeta,
  resendAccess,
  savePdfMeta,
  saveVideoMeta,
  saveProgress,
  setAccountStatus,
  setLessonStatus,
  submitEnrollment,
  removeAgentSource,
  saveAgentSource,
  updateBank,
  updateLesson,
  updateOffer,
} from "./domain";
import { deviceLabel } from "./format";
import { generatePassword } from "./password";
import { putFile, deleteFile } from "./files";
import { defaultBanks, defaultPacks } from "./offers";
import { createSeed, DB_VERSION, demoAgentSources } from "./seed";
import type { Admin, AgentKind, BankId, Channel, DB, Persisted, Role } from "./types";

const KEY = "lm-db-v1";
const DEVICE_KEY = "lm-device-id";
const GRANTS_KEY = "lm-grants-v1";
// Validation déjà faite par l'admin, puis effacée par un onglet resté ouvert.
const RESTORED_GRANTS = ["enr_0e5daae9571856ec"];

export type Notice = { ok: false; error: string };
type Done = { ok: true } | Notice;

type Store = {
  ready: boolean;
  db: Persisted["db"];
  session: Persisted["session"];
  adminSession: Persisted["adminSession"];
  student: Persisted["db"]["students"][number] | null;
  pending: Persisted["db"]["students"][number] | null;
  admin: Admin | null;
  parts: ReturnType<typeof buildCatalog>["parts"];
  deviceId: string;
  login: (identifiant: string, password: string) => { ok: true; kind: "session" | "activation"; studentId: string } | Notice;
  activate: (input: {
    prenom: string;
    nom: string;
    ville: string;
    telephone: string;
    password: string;
    consent: boolean;
  }) => { ok: true; studentId: string } | Notice;
  logout: () => void;
  changeOwnPassword: (current: string, next: string) => Done;
  loginAsAdmin: (identifiant: string, password: string) => Done;
  logoutAdmin: () => void;
  sell: (telephone: string, nom: string, canal: Channel) => { ok: true; message: string; phone: string } | Notice;
  makeBatch: (quantite: number) => { ok: true; batchId: string } | Notice;
  exportBatch: (batchId: string) => void;
  resend: (studentId: string) => { ok: true; message: string; phone: string } | Notice;
  release: (studentId: string) => Done;
  deactivate: (studentId: string) => Done;
  deleteUser: (studentId: string) => Done;
  toggleLesson: (lessonId: string) => Done;
  editLesson: (input: {
    lessonId: string;
    titre: string;
    page: number;
    ordre: number;
    dureeS: number;
    partId: string;
    bunnyVideoId: string;
    bunnyPreviewId: string;
  }) => Done;
  createLesson: (input: { partId: string; prefix: string; numero: string; titre: string; page: number }) =>
    | { ok: true; code: string }
    | Notice;
  createAdmin: (nom: string, identifiant: string, role: Role) =>
    | { ok: true; identifiant: string; password: string }
    | Notice;
  rememberProgress: (lessonId: string, positionS: number, marked?: boolean) => void;
  track: (type: Persisted["db"]["events"][number]["type"], lessonId: string | null, id?: string) => void;
  resetDemo: () => void;
  joinFree: (input: { prenom: string; nom: string; telephone: string; ville: string; password: string }) => { ok: true; studentId: string } | Notice;
  enroll: (input: {
    prenom: string;
    nom: string;
    telephone: string;
    ville: string;
    packId: string;
    bankId: BankId;
    file: File;
  }) => Promise<Done>;
  grantAccess: (enrollmentId: string) => { ok: true; message: string; phone: string } | Notice;
  refuseAccess: (enrollmentId: string, motif?: string) => Done;
  saveStudio: (studio: Persisted["db"]["studio"]) => Done;
  askTeacher: (texte: string) => Done;
  answerTeacher: (id: string, reponse: string) => Done;
  addPdf: (lessonId: string, titre: string, file: File) => Promise<{ ok: true; id: string } | Notice>;
  addVideo: (lessonId: string, file: File) => Promise<Done>;
  removeVideo: (lessonId: string) => Promise<Done>;
  removePdf: (pdfId: string) => Promise<Done>;
  feedAgent: (input: { lessonId: string; kind: AgentKind; titre: string; texte: string; pdfId: string | null }) => { ok: true; truncated: boolean } | Notice;
  dropAgentSource: (sourceId: string) => Done;
  setPackPrice: (packId: string, prixMad: number, duree?: string, perimetre?: string) => Done;
  setBank: (bankId: BankId, titulaire: string, rib: string, consigne: string) => Done;
};

const StoreContext = createContext<Store | null>(null);

function createId(prefix: string) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `${prefix}_${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function complete(db: DB): DB {
  return {
    ...db,
    banks: db.banks?.length ? db.banks : defaultBanks(),
    pdfs: db.pdfs ?? [],
    videos: db.videos ?? [],
    agentSources: db.agentSources ?? demoAgentSources(),
    packs: (db.packs?.length ? db.packs : defaultPacks()).map((pack) => ({
      ...pack,
      duree: pack.duree ?? "",
      perimetre: pack.perimetre ?? "",
    })),
    enrollments: (db.enrollments ?? []).map((item) => ({ ...item, motif: item.motif ?? "" })),
    students: db.students.map((student) => {
      if (student.acces !== "chapitre") return student;
      const paid = (db.enrollments ?? []).some(
        (item) => item.statut === "valide" && (item.studentId === student.id || item.telephone === student.telephone),
      );
      return paid ? { ...student, acces: "complet" as const } : student;
    }),
    studio: {
      questionsOuvertes: db.studio?.questionsOuvertes ?? false,
      welcomePhotoId: db.studio?.welcomePhotoId ?? null,
      welcomeVideoId: db.studio?.welcomeVideoId ?? null,
      faq: db.studio?.faq ?? [],
      quizzes: db.studio?.quizzes ?? [],
      mistakes: db.studio?.mistakes ?? [],
      writings: db.studio?.writings ?? [],
      paths: db.studio?.paths ?? [],
      questions: db.studio?.questions ?? [],
    },
  };
}

function readGrants(): string[] {
  try {
    const raw = localStorage.getItem(GRANTS_KEY);
    if (raw === null) {
      localStorage.setItem(GRANTS_KEY, JSON.stringify(RESTORED_GRANTS));
      return [...RESTORED_GRANTS];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function rememberGrant(enrollmentId: string) {
  const ids = readGrants();
  if (!ids.includes(enrollmentId)) localStorage.setItem(GRANTS_KEY, JSON.stringify([...ids, enrollmentId]));
}

function forgetGrant(enrollmentId: string) {
  localStorage.setItem(GRANTS_KEY, JSON.stringify(readGrants().filter((id) => id !== enrollmentId)));
}

function applyGrants(db: DB): DB {
  const ids = new Set(readGrants());
  if (ids.size === 0) return db;
  const enrollments = db.enrollments.map((item) =>
    ids.has(item.id) && item.statut !== "valide"
      ? { ...item, statut: "valide" as const, traiteLe: item.traiteLe || new Date().toISOString() }
      : item,
  );
  const paidIds = new Set(enrollments.filter((item) => item.statut === "valide").map((item) => item.studentId));
  const paidPhones = new Set(enrollments.filter((item) => item.statut === "valide").map((item) => item.telephone));
  const students = db.students.map((student) =>
    student.acces !== "complet" && (paidIds.has(student.id) || (student.telephone && paidPhones.has(student.telephone)))
      ? { ...student, acces: "complet" as const }
      : student,
  );
  return { ...db, enrollments, students };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (parsed.db?.version === DB_VERSION) return { ...parsed, db: applyGrants(complete(parsed.db)) };
    }
  } catch {
    /* repartir du jeu de démonstration */
  }
  return { db: createSeed(), session: null, adminSession: null, activatingId: null };
}

function snapshot(data: Persisted) {
  return JSON.stringify({
    db: data.db,
    session: data.session,
    adminSession: data.adminSession,
    activatingId: data.activatingId,
  });
}

function ensureDeviceId() {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const id = createId("device");
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

function blankState(): Persisted {
  return { db: createSeed(), session: null, adminSession: null, activatingId: null };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Persisted>(blankState);
  const [deviceId, setDeviceId] = useState("device_local");
  const [ready, setReady] = useState(false);
  const parts = useMemo(() => buildCatalog().parts, []);
  const seenAt = useRef(0);

  useEffect(() => {
    const fresh = load();
    seenAt.current = fresh.savedAt ?? 0;
    setDeviceId(ensureDeviceId());
    setData(fresh);
    setReady(true);
    const pull = () => {
      const next = load();
      if ((next.savedAt ?? 0) <= seenAt.current) return;
      seenAt.current = next.savedAt ?? 0;
      setData(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === GRANTS_KEY) pull();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", pull);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", pull);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const healed = applyGrants(complete(data.db));
    if (snapshot({ ...data, db: healed }) !== snapshot(data)) {
      setData({ ...data, db: healed });
      return;
    }
    const disk = load();
    const diskAt = disk.savedAt ?? 0;
    const ours = data.savedAt ?? 0;
    if (diskAt > ours && snapshot(disk) !== snapshot(data)) {
      seenAt.current = diskAt;
      setData(disk);
      return;
    }
    if (snapshot(disk) === snapshot(data) && ours === diskAt) return;
    const stamp = Math.max(Date.now(), diskAt + 1, seenAt.current + 1);
    seenAt.current = stamp;
    const stamped = { ...data, savedAt: stamp };
    localStorage.setItem(KEY, JSON.stringify(stamped));
    if (ours !== stamp) setData(stamped);
  }, [data, ready]);

  useEffect(() => {
    if (!data?.session) return;
    let stop = false;
    const check = () => {
      fetch("/api/session")
        .then((res) => {
          if (stop || res.status !== 401) return;
          setData((current) => (current ? { ...current, session: null } : current));
        })
        .catch(() => undefined);
    };
    check();
    window.addEventListener("focus", check);
    return () => {
      stop = true;
      window.removeEventListener("focus", check);
    };
  }, [data?.session?.studentId]);

  const api = useMemo<Store | null>(() => {
    if (!data || !deviceId) return null;
    const student =
      data.db.students.find((s) => s.id === data.session?.studentId && s.statut !== "desactive") ?? null;
    const pending = data.db.students.find((s) => s.id === data.activatingId) ?? null;
    const admin = data.db.admins.find((a) => a.id === data.adminSession?.adminId) ?? null;
    const stamp = () => new Date().toISOString();
    const label = () => deviceLabel(navigator.userAgent);

    return {
      ready: true,
      db: data.db,
      session: student ? data.session : null,
      adminSession: data.adminSession,
      student,
      pending,
      admin,
      parts,
      deviceId,
      login: (identifiant, password) => {
        const result = loginStudentClean(data.db, {
          identifiant,
          password,
          deviceId,
          libelle: label(),
          ip: "local",
          now: stamp(),
          deviceRecordId: createId("dev"),
          eventId: createId("evt"),
        });
        if (!result.ok) {
          setData({ ...data, db: result.db });
          return { ok: false, error: result.error };
        }
        if (result.data.kind === "activation") {
          setData({ ...data, db: result.db, activatingId: result.data.studentId, session: null });
          return { ok: true, kind: "activation", studentId: result.data.studentId };
        }
        setData({
          ...data,
          db: result.db,
          activatingId: null,
          session: { kind: "student", studentId: result.data.studentId, deviceId },
        });
        return { ok: true, kind: "session", studentId: result.data.studentId };
      },
      activate: (input) => {
        if (!data.activatingId) return { ok: false, error: "Reconnecte-toi pour activer le livre." };
        const result = activateStudent(data.db, {
          ...input,
          studentId: data.activatingId,
          deviceId,
          libelle: label(),
          now: stamp(),
          deviceRecordId: createId("dev"),
          eventId: createId("evt"),
        });
        if (!result.ok) return result;
        setData({
          ...data,
          db: result.db,
          activatingId: null,
          session: { kind: "student", studentId: result.data.studentId, deviceId },
        });
        return { ok: true, studentId: result.data.studentId };
      },
      logout: () => setData({ ...data, session: null, activatingId: null }),
      changeOwnPassword: (current, next) => {
        if (!student) return { ok: false, error: "Connecte-toi d'abord." };
        const result = changePassword(data.db, { studentId: student.id, current, next });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      loginAsAdmin: (identifiant, password) => {
        const result = loginAdmin(data.db, { identifiant, password, ip: "local", now: stamp() });
        if (!result.ok) {
          setData({ ...data, db: result.db });
          return { ok: false, error: result.error };
        }
        setData({ ...data, db: result.db, adminSession: { kind: "admin", adminId: result.data.adminId } });
        return { ok: true };
      },
      logoutAdmin: () => setData({ ...data, adminSession: null }),
      sell: (telephone, nom, canal) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = createSale(data.db, {
          telephone,
          nom,
          canal,
          admin,
          password: generatePassword(),
          now: stamp(),
          studentId: createId("stu"),
          messageId: createId("msg"),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true, message: result.data.message, phone: result.data.identifiant };
      },
      makeBatch: (quantite) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const count = Math.floor(quantite);
        const result = createBatch(data.db, {
          quantite: count,
          admin,
          passwords: Array.from({ length: count }, () => generatePassword()),
          now: stamp(),
          batchId: createId("batch"),
          studentIds: Array.from({ length: count }, () => createId("stu")),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true, batchId: result.data.batchId };
      },
      exportBatch: (batchId) => setData({ ...data, db: markBatchExported(data.db, batchId, stamp()) }),
      resend: (studentId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = resendAccess(data.db, {
          studentId,
          admin,
          password: generatePassword(),
          now: stamp(),
          messageId: createId("msg"),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        const person = result.db.students.find((s) => s.id === studentId);
        setData({ ...data, db: result.db });
        return { ok: true, message: result.data.message, phone: person?.telephone || "" };
      },
      release: (studentId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = releaseDevices(data.db, { studentId, admin, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        setData({
          ...data,
          db: result.db,
          session: data.session?.studentId === studentId ? null : data.session,
        });
        return { ok: true };
      },
      deactivate: (studentId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = setAccountStatus(data.db, {
          studentId,
          admin,
          statut: "desactive",
          now: stamp(),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        setData({
          ...data,
          db: result.db,
          session: data.session?.studentId === studentId ? null : data.session,
        });
        return { ok: true };
      },
      deleteUser: (studentId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = deleteStudent(data.db, { studentId, admin, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        setData({
          ...data,
          db: result.db,
          session: data.session?.studentId === studentId ? null : data.session,
        });
        return { ok: true };
      },
      toggleLesson: (lessonId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = setLessonStatus(data.db, { lessonId, admin, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      editLesson: (input) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = updateLesson(data.db, { ...input, admin, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      createLesson: (input) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = addLesson(data.db, {
          ...input,
          admin,
          ordre: data.db.lessons.reduce((max, lesson) => Math.max(max, lesson.ordre), 0) + 1,
          bunnyVideoId: "",
          bunnyPreviewId: "",
          now: stamp(),
          lessonId: createId("les"),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true, code: result.data.code };
      },
      createAdmin: (nom, identifiant, role) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const password = generatePassword();
        const result = addAdmin(data.db, {
          actor: admin,
          nom,
          identifiant,
          role,
          password,
          now: stamp(),
          adminId: createId("adm"),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true, identifiant: result.data.identifiant, password: result.data.password };
      },
      rememberProgress: (lessonId, positionS, marked = false) => {
        setData((prev) => {
          if (!prev?.session) return prev;
          const current = prev.db.students.find((s) => s.id === prev.session?.studentId && s.statut === "active");
          if (!current) return prev;
          return {
            ...prev,
            db: saveProgress(prev.db, {
              studentId: current.id,
              lessonId,
              positionS,
              marked,
              now: new Date().toISOString(),
            }),
          };
        });
      },
      track: (type, lessonId, id) => {
        const eventId = id ?? createId("evt");
        setData((prev) => {
          if (!prev || prev.db.events.some((event) => event.id === eventId)) return prev;
          return {
            ...prev,
            db: addEvent(prev.db, {
              id: eventId,
              type,
              lessonId,
              studentId: prev.session?.studentId ?? null,
              deviceId,
              now: new Date().toISOString(),
            }),
          };
        });
      },
      resetDemo: () => {
        localStorage.removeItem(KEY);
        localStorage.removeItem(GRANTS_KEY);
        setData({ db: createSeed(), session: null, adminSession: null, activatingId: null });
      },
      joinFree: (input) => {
        const created = createFreeStudent(data.db, {
          ...input,
          now: stamp(),
          studentId: createId("stu"),
        });
        if (!created.ok) return created;
        const logged = loginStudentClean(created.db, {
          identifiant: created.data.identifiant,
          password: input.password,
          deviceId,
          libelle: label(),
          ip: "local",
          now: stamp(),
          deviceRecordId: createId("dev"),
          eventId: createId("evt"),
        });
        if (!logged.ok || logged.data.kind !== "session") {
          setData({ ...data, db: logged.db });
          return { ok: false, error: logged.ok ? "Reconnecte-toi pour ouvrir le chapitre 1." : logged.error };
        }
        setData({
          ...data,
          db: logged.db,
          activatingId: null,
          session: { kind: "student", studentId: logged.data.studentId, deviceId },
        });
        return { ok: true, studentId: logged.data.studentId };
      },
      enroll: async (input) => {
        if (input.file.size > 4_000_000) return { ok: false, error: "Le justificatif doit faire moins de 4 Mo." };
        const enrollmentId = createId("enr");
        const result = submitEnrollment(data.db, {
          ...input,
          justifId: enrollmentId,
          justifNom: input.file.name,
          now: stamp(),
          enrollmentId,
        });
        if (!result.ok) return result;
        await putFile(enrollmentId, input.file);
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      grantAccess: (enrollmentId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = grantEnrollment(data.db, {
          enrollmentId,
          admin,
          password: generatePassword(),
          now: stamp(),
          studentId: createId("stu"),
          messageId: createId("msg"),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        rememberGrant(enrollmentId);
        setData({ ...data, db: applyGrants(result.db) });
        return { ok: true, message: result.data.message, phone: result.data.phone };
      },
      refuseAccess: (enrollmentId, motif = "") => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        forgetGrant(enrollmentId);
        const result = refuseEnrollment(data.db, { enrollmentId, admin, now: stamp(), auditId: createId("aud"), motif });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      saveStudio: (studio) => {
        setData({ ...data, db: { ...data.db, studio } });
        return { ok: true };
      },
      askTeacher: (texte) => {
        if (!student) return { ok: false, error: "Connecte-toi pour écrire à Maître Mohssine." };
        const body = texte.trim();
        if (!data.db.studio.questionsOuvertes) return { ok: false, error: "Les questions à Maître sont fermées pour le moment." };
        if (body.length < 8) return { ok: false, error: "Écris ta question." };
        const question = { id: createId("qst"), studentId: student.id, prenom: student.prenom, texte: body, creeLe: stamp(), reponse: "" };
        setData({ ...data, db: { ...data.db, studio: { ...data.db.studio, questions: [question, ...data.db.studio.questions] } } });
        return { ok: true };
      },
      answerTeacher: (id, reponse) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const questions = data.db.studio.questions.map((item) => (item.id === id ? { ...item, reponse: reponse.trim() } : item));
        setData({ ...data, db: { ...data.db, studio: { ...data.db.studio, questions } } });
        return { ok: true };
      },
      addPdf: async (lessonId, titre, file) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        if (file.size > 8_000_000) return { ok: false, error: "Le PDF doit faire moins de 8 Mo." };
        const pdfId = createId("pdf");
        const result = savePdfMeta(data.db, {
          admin,
          lessonId,
          titre,
          nom: file.name,
          now: stamp(),
          pdfId,
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        await putFile(pdfId, file);
        setData({ ...data, db: result.db });
        return { ok: true, id: pdfId };
      },
      addVideo: async (lessonId, file) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        if (file.size > 40_000_000) return { ok: false, error: "La vidéo doit faire moins de 40 Mo." };
        const videoId = createId("vid");
        const result = saveVideoMeta(data.db, {
          admin,
          lessonId,
          nom: file.name,
          now: stamp(),
          videoId,
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        await putFile(videoId, file);
        await Promise.all(result.data.removedIds.map((id) => deleteFile(id)));
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      removeVideo: async (lessonId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = removeVideoMeta(data.db, { admin, lessonId, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        await Promise.all(result.data.removedIds.map((id) => deleteFile(id)));
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      feedAgent: ({ lessonId, kind, titre, texte, pdfId }) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = saveAgentSource(data.db, {
          admin,
          lessonId,
          kind,
          titre,
          texte,
          pdfId,
          now: stamp(),
          sourceId: createId("agt"),
          auditId: createId("aud"),
        });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true, truncated: result.data.truncated };
      },
      dropAgentSource: (sourceId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = removeAgentSource(data.db, { admin, sourceId, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      removePdf: async (pdfId) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = removePdfMeta(data.db, { admin, pdfId, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        await deleteFile(pdfId);
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      setPackPrice: (packId, prixMad, duree, perimetre) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = updateOffer(data.db, { admin, packId, prixMad, duree, perimetre, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true };
      },
      setBank: (bankId, titulaire, rib, consigne) => {
        if (!admin) return { ok: false, error: "Session admin expirée." };
        const result = updateBank(data.db, { admin, bankId, titulaire, rib, consigne, now: stamp(), auditId: createId("aud") });
        if (!result.ok) return result;
        setData({ ...data, db: result.db });
        return { ok: true };
      },
    };
  }, [data, deviceId, parts]);

  if (!api) return null;

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useApp() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store absent");
  return value;
}
