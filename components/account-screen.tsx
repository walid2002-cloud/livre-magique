"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SupportBlock } from "./support";
import { ErrorText } from "./ui";
import { formatDate, studentName } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { maskPhone } from "@/lib/normalize";
import { useApp } from "@/lib/store";

export function AccountScreen() {
  const { student, db, deviceId, logout, changeOwnPassword } = useApp();
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!student) {
    return (
      <div className="mx-auto grid max-w-md gap-4">
        <h1 className="font-display text-4xl">{t.yourAccount}</h1>
        <p className="text-[var(--ink-soft)]">{t.accountHint}</p>
        <Link href="/connexion" className="btn btn-primary w-fit">{t.enter}</Link>
      </div>
    );
  }

  const devices = db.devices.filter((device) => device.studentId === student.id && !device.revoqueLe);
  const enrollment = [...db.enrollments].reverse().find((item) => item.studentId === student.id || item.telephone === student.telephone);
  const seen = db.progress.filter((item) => item.studentId === student.id && item.vue).length;
  const phone = student.telephone ? maskPhone(student.telephone) : t.toAdd;

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = changeOwnPassword(current, next);
    if (!result.ok) {
      setError(result.error);
      setMessage("");
      return;
    }
    setError("");
    setMessage(t.passUpdated);
    setCurrent("");
    setNext("");
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-5">
      {enrollment && (
        <p className="text-sm text-[var(--ink-soft)]">
          {enrollment.statut === "en_attente" ? t.payPending : enrollment.statut === "valide" ? t.payReady : t.payRefused}
          {enrollment.statut === "refuse" && enrollment.motif ? ` ${enrollment.motif}` : ""}
        </p>
      )}
      {student.acces === "chapitre" && (!enrollment || enrollment.statut === "refuse") && (
        <section className="card grid gap-2 p-4">
          <h2 className="font-display text-2xl">{t.noProofTitle}</h2>
          <p className="text-sm text-[var(--ink-soft)]">{t.noProofBody}</p>
          <Link href="/inscription" className="btn btn-yellow w-fit">{t.sendProof}</Link>
        </section>
      )}
      <p className="text-sm text-[var(--ink-soft)]">{seen} / {db.lessons.length}</p>
      <p className="text-sm text-[var(--ink-soft)]">{t.browserNote}</p>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.account}</p>
        <h1 className="font-display text-4xl">{studentName(student.prenom, student.nom)}</h1>
        <p className="text-[var(--ink-soft)]">{phone} · {student.ville || t.cityMissing}{student.activeLe ? ` · ${t.activated} ${formatDate(student.activeLe)}` : ""}</p>
      </div>

      <section className="card grid gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">{t.devices}</h2>
          <span className="font-mono text-sm">{devices.length}/2</span>
        </div>
        <p className="text-sm text-[var(--ink-soft)]">{t.devicesHint}</p>
        <ul className="grid gap-2">
          {devices.map((device) => (
            <li key={device.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] px-3 py-3">
              <span>{device.libelle}</span>
              {device.deviceId === deviceId && <span className="text-sm text-[var(--good)]">{t.thisDevice}</span>}
            </li>
          ))}
          {Array.from({ length: Math.max(0, 2 - devices.length) }).map((_, index) => (
            <li key={index} className="rounded-2xl border border-dashed border-[var(--line)] px-3 py-3 text-sm text-[var(--ink-soft)]">
              {t.freeSlot}
            </li>
          ))}
        </ul>
      </section>

      <form className="card grid gap-3 p-4" onSubmit={submit}>
        <h2 className="font-display text-2xl">{t.changePass}</h2>
        <input className="field" type="password" autoComplete="current-password" placeholder={t.currentPass} value={current} onChange={(event) => setCurrent(event.target.value)} />
        <input className="field" type="password" autoComplete="new-password" minLength={6} placeholder={t.newPassword} value={next} onChange={(event) => setNext(event.target.value)} />
        <ErrorText>{error}</ErrorText>
        {message && <p className="text-sm text-[var(--good)]">{message}</p>}
        <button className="btn btn-primary" type="submit">{t.save}</button>
      </form>

      <SupportBlock />
      <button type="button" className="btn btn-ghost" onClick={logout}>{t.logout}</button>
      <Link href="/confidentialite" className="text-sm text-[var(--ink-soft)]">{t.privacy}</Link>
    </div>
  );
}
