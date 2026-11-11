import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { askAgent } from "../lib/agent";
import { claimBrowser, emptyLock, releaseBrowser, sessionAllowed } from "../lib/browser-lock";
import { examFor } from "../lib/exams";
import { buildCatalog } from "../lib/catalog";
import { isOpeningChapter } from "../lib/access";
import { activateStudent, batchCsv, createBatch, createFreeStudent, createSale, grantEnrollment, isViewed, loginStudentClean, submitEnrollment } from "../lib/domain";
import { canonicalize, lookupCode, normalizePhone } from "../lib/normalize";
import { generatePassword, isGeneratedShape } from "../lib/password";
import { createSeed } from "../lib/seed";
import type { Admin } from "../lib/types";

const codes = () => buildCatalog().lessons.map((lesson) => lesson.code);

describe("codes vidéo", () => {
  it("accepte les variantes et l'année sur deux chiffres", () => {
    for (const input of ["bam3", "BAM 03", "bam-03", "BAM_03"]) {
      assert.equal(canonicalize(input), "BAM-03");
      assert.equal(lookupCode(input, codes()).ok, true);
    }
    assert.equal(canonicalize("ex19"), "EX-2019");
    assert.equal(canonicalize("EX-2019"), "EX-2019");
    assert.equal(lookupCode("ex19", codes()).ok, true);
  });

  it("propose la plage et des codes proches", () => {
    const result = lookupCode("BAM-99", codes());
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /BAM-01 à BAM-10/);
      assert.equal(result.suggestions[0], "BAM-10");
      assert.ok(result.suggestions.length <= 3);
    }
  });
});

describe("téléphone", () => {
  it("convertit +212 et refuse un indicatif hors 05 06 07", () => {
    assert.equal(normalizePhone("+212 661-234524"), "0661234524");
    assert.equal(normalizePhone("212661234524"), "0661234524");
    assert.equal(normalizePhone("0512345678"), "0512345678");
    assert.equal(normalizePhone("0812345678"), null);
  });
});

describe("comptes", () => {
  it("connecte Yassine et refuse le 3e appareil de Sara", () => {
    const seed = createSeed();
    const yassine = loginStudentClean(seed, {
      identifiant: "06 61 23 45 24",
      password: "k7m4px",
      deviceId: "browser",
      libelle: "Chrome · Mac",
      ip: "local",
      now: new Date().toISOString(),
      deviceRecordId: "dev_test",
      eventId: "evt_test",
    });
    assert.equal(yassine.ok, true);

    const sara = loginStudentClean(seed, {
      identifiant: "0661000099",
      password: "DEVICE",
      deviceId: "browser",
      libelle: "Chrome · Mac",
      ip: "autre",
      now: new Date().toISOString(),
      deviceRecordId: "dev_sara",
      eventId: "evt_sara",
    });
    assert.equal(sara.ok, false);
    if (!sara.ok) assert.match(sara.error, /changer d'appareil/);
  });

  it("bloque après 5 essais", () => {
    let db = createSeed();
    const now = new Date().toISOString();
    for (let i = 0; i < 4; i++) {
      const result = loginStudentClean(db, {
        identifiant: "0661234524",
        password: "MAUVAIS",
        deviceId: "browser",
        libelle: "Chrome",
        ip: "ecole",
        now,
        deviceRecordId: `dev_${i}`,
        eventId: `evt_${i}`,
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.match(result.error, /incorrect/);
      db = result.db;
    }
    const fifth = loginStudentClean(db, {
      identifiant: "0661234524",
      password: "MAUVAIS",
      deviceId: "browser",
      libelle: "Chrome",
      ip: "ecole",
      now,
      deviceRecordId: "dev_5",
      eventId: "evt_5",
    });
    assert.equal(fifth.ok, false);
    if (!fifth.ok) {
      assert.match(fifth.error, /Trop d'essais/);
      db = fifth.db;
    }
    const locked = loginStudentClean(db, {
      identifiant: "0661234524",
      password: "K7M4PX",
      deviceId: "browser",
      libelle: "Chrome",
      ip: "ecole",
      now,
      deviceRecordId: "dev_lock",
      eventId: "evt_lock",
    });
    assert.equal(locked.ok, false);
    if (!locked.ok) assert.match(locked.error, /Trop d'essais/);
  });

  it("active un compte librairie et le numéro devient identifiant", () => {
    const seed = createSeed();
    const now = new Date().toISOString();
    const login = loginStudentClean(seed, {
      identifiant: "lm 00418",
      password: "R8TQ2H",
      deviceId: "browser",
      libelle: "Safari · iPhone",
      ip: "maison",
      now,
      deviceRecordId: "dev_act",
      eventId: "evt_act",
    });
    assert.equal(login.ok, true);
    if (!login.ok || login.data.kind !== "activation") return;
    const activated = activateStudent(login.db, {
      studentId: login.data.studentId,
      prenom: "Inès",
      nom: "Alaoui",
      ville: "Fès",
      telephone: "+212 618887766",
      password: "secret1",
      consent: true,
      deviceId: "browser",
      libelle: "Safari · iPhone",
      now,
      deviceRecordId: "dev_phone",
      eventId: "evt_phone",
    });
    assert.equal(activated.ok, true);
    if (!activated.ok) return;
    const again = loginStudentClean(activated.db, {
      identifiant: "0618887766",
      password: "secret1",
      deviceId: "browser",
      libelle: "Safari · iPhone",
      ip: "maison",
      now,
      deviceRecordId: "dev_phone",
      eventId: "evt_back",
    });
    assert.equal(again.ok, true);
  });

  it("refuse une vente sur un numéro déjà inscrit", () => {
    const admin = createSeed().admins[1] as Admin;
    const result = createSale(createSeed(), {
      telephone: "0661234524",
      nom: "Quelqu'un",
      canal: "whatsapp",
      admin,
      password: "ABCDEF",
      now: new Date().toISOString(),
      studentId: "stu_new",
      messageId: "msg_new",
      auditId: "aud_new",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /déjà inscrit/);
  });

  it("crée un lot et un CSV", () => {
    const admin = createSeed().admins.find((item) => item.role === "super_admin") as Admin;
    const result = createBatch(createSeed(), {
      quantite: 2,
      admin,
      passwords: ["ABCDEF", "GHJK23"],
      now: new Date().toISOString(),
      batchId: "batch_test",
      studentIds: ["stu_a", "stu_b"],
      auditId: "aud_batch",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const batch = result.db.batches[0];
    assert.equal(batch.comptes[0].identifiant, "LM-00423");
    assert.match(batchCsv(batch), /^identifiant;mot_de_passe\nLM-00423;ABCDEF\nLM-00424;GHJK23$/);
  });
});

describe("lecture", () => {
  it("compte une leçon vue à 90 % ou sur le bouton", () => {
    assert.equal(isViewed(89, 100, false), false);
    assert.equal(isViewed(90, 100, false), true);
    assert.equal(isViewed(10, 100, true), true);
  });

  it("prépare 55 leçons", () => {
    assert.equal(buildCatalog().lessons.length, 55);
  });

  it("génère un mot de passe sans caractères ambigus", () => {
    for (let i = 0; i < 30; i++) assert.equal(isGeneratedShape(generatePassword()), true);
  });
});

describe("agent", () => {
  it("répond avec la correction déposée", () => {
    const sources = createSeed().agentSources.filter((item) => item.lessonId === "les_bam-01");
    const reply = askAgent("Quelle est la correction sur la boîte ?", sources, "BAM-01");
    assert.match(reply, /correction/i);
    assert.match(reply, /mémoire/);
  });

  it("dit quand la leçon n'a pas de document", () => {
    assert.match(askAgent("Qui raconte ?", [], "BAM-02"), /pas encore de document/);
  });
});

describe("chapitre offert", () => {
  it("ouvre seulement le premier chapitre, puis tout le livre après paiement", () => {
    const lessons = buildCatalog().lessons;
    const bam = lessons.filter((lesson) => lesson.code.startsWith("BAM"));
    assert.equal(isOpeningChapter(bam[0], lessons), true);
    assert.equal(isOpeningChapter(bam[1], lessons), false);

    const admin = createSeed().admins[0] as Admin;
    const created = createFreeStudent(createSeed(), {
      prenom: "Sara",
      nom: "Alaoui",
      telephone: "0661000001",
      ville: "Fès",
      password: "secret1",
      now: "2026-11-10T00:00:00.000Z",
      studentId: "stu_free",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.equal(created.db.students[0]?.acces, "chapitre");

    const proof = submitEnrollment(created.db, {
      prenom: "Sara",
      nom: "Alaoui",
      telephone: "0661000001",
      ville: "Fès",
      packId: "pack_complet",
      bankId: "cih",
      justifId: "jus_1",
      justifNom: "recu.jpg",
      now: "2026-11-10T00:01:00.000Z",
      enrollmentId: "enr_1",
    });
    assert.equal(proof.ok, true);
    if (!proof.ok) return;
    const granted = grantEnrollment(proof.db, {
      enrollmentId: "enr_1",
      admin,
      password: "secret2",
      now: "2026-11-10T00:02:00.000Z",
      studentId: "stu_other",
      messageId: "msg_1",
      auditId: "aud_1",
    });
    assert.equal(granted.ok, true);
    if (!granted.ok) return;
    const sara = granted.db.students.find((student) => student.id === "stu_free");
    assert.equal(sara?.acces, "complet");
    assert.equal(granted.db.students.some((student) => student.id === "stu_other"), false);
  });
});

describe("examens", () => {
  it("propose un QCM corrigé pour chaque partie", () => {
    for (const code of ["BAM", "ANT", "DJC", "LAN", "PE", "EX"]) {
      const exam = examFor(code);
      assert.ok(exam);
      assert.ok(exam && exam.questions.length >= 5);
      for (const question of exam?.questions ?? []) {
        assert.equal(question.choices.length, 4);
        assert.ok(question.choices.some((choice) => choice.id === question.answer));
        assert.ok(question.why.length > 20);
      }
    }
  });
});

describe("navigateur", () => {
  it("lie le premier navigateur et refuse le second jusqu'à réinitialisation", () => {
    const first = claimBrowser(emptyLock(), { studentId: "stu", passwordHash: "h.1", browserId: "a", sessionId: "s1" });
    assert.equal(first.status, "ok");
    const second = claimBrowser(first.store, { studentId: "stu", passwordHash: "h.1", browserId: "b", sessionId: "s2" });
    assert.equal(second.status, "denied");
    const same = claimBrowser(first.store, { studentId: "stu", passwordHash: "h.1", browserId: "a", sessionId: "s3" });
    assert.equal(same.status, "ok");
    assert.equal(same.sessionId, "s1");
    const released = releaseBrowser(first.store, "stu");
    assert.equal(sessionAllowed(released, "s1"), false);
    const again = claimBrowser(released, { studentId: "stu", passwordHash: "h.1", browserId: "b", sessionId: "s4" });
    assert.equal(again.status, "ok");
  });
});
