"use client";

import Link from "next/link";
import { useState } from "react";
import { formatMad } from "@/lib/offers";
import { CITIES } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { claimSession } from "@/lib/session-client";
import { useApp } from "@/lib/store";
import type { BankId } from "@/lib/types";

const STEPS = ["you", "pack", "bank", "proof"] as const;

export function EnrollScreen() {
  const { db, student, enroll, joinFree } = useApp();
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState("");
  const [paying, setPaying] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState(CITIES[0] ?? "");
  const [packId, setPackId] = useState(db.packs.find((pack) => pack.actif)?.id ?? "");
  const [bankId, setBankId] = useState<BankId | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const bank = db.banks.find((item) => item.id === bankId);
  const pack = db.packs.find((item) => item.id === packId);

  if (student && student.acces !== "chapitre") {
    return (
      <section className="mx-auto grid max-w-lg gap-3">
        <h1 className="font-display text-4xl">{t.fullTitle}</h1>
        <p className="text-[var(--ink-soft)]">{t.fullBody}</p>
        <Link href="/" className="btn btn-primary w-fit">{t.backMine}</Link>
      </section>
    );
  }

  if (student && student.acces === "chapitre" && !paying) {
    return (
      <section className="mx-auto grid max-w-lg gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.seeChapter}</p>
        <h1 className="font-display text-4xl">{t.yours}</h1>
        <p className="text-[var(--ink-soft)]">{t.yoursBody}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/livre" className="btn btn-primary">{t.seeChapter}</Link>
          <button type="button" className="btn btn-yellow" onClick={() => {
            setPrenom(student.prenom);
            setNom(student.nom);
            setTelephone(student.telephone ?? "");
            setVille(student.ville || CITIES[0] || "");
            setPaying(true);
            setStep(1);
          }}>{t.payNext}</button>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section className="mx-auto grid max-w-lg gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.sent}</p>
        <h1 className="font-display text-4xl">{t.checking}</h1>
        <p className="text-[var(--ink-soft)]">{t.stays}</p>
        <Link href="/" className="btn btn-ghost w-fit">{t.backHome}</Link>
      </section>
    );
  }

  function next() {
    setError("");
    if (step === 0 && (!prenom.trim() || !nom.trim() || !telephone.trim() || !ville || password.trim().length < 6)) {
      setError(t.needIdentity);
      return;
    }
    if (step === 1 && !packId) {
      setError(t.needPack);
      return;
    }
    if (step === 2 && !bankId) {
      setError(t.needBank);
      return;
    }
    setStep((value) => value + 1);
  }

  return (
    <section className="mx-auto grid max-w-lg gap-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.become}</p>
        <h1 className="font-display text-4xl">{student ? t.payTitle : t.freeTitle}</h1>
        <p className="text-[var(--ink-soft)]">{student ? t.kept : t.why}</p>
        {student && step > 0 && <p className="mt-2 text-sm font-semibold text-[var(--blue)]">{t.lastStep}</p>}
      </div>
      <ol className="flex flex-wrap gap-2 text-sm">
        {STEPS.map((label, index) => (
          <li key={label} className={index === step ? "font-semibold text-[var(--blue)]" : "text-[var(--ink-soft)]"}>
            {index + 1}. {t[label]}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">{t.firstName}
            <input className="field" value={prenom} onChange={(event) => setPrenom(event.target.value)} autoComplete="given-name" />
          </label>
          <label className="grid gap-1 text-sm">{t.lastName}
            <input className="field" value={nom} onChange={(event) => setNom(event.target.value)} autoComplete="family-name" />
          </label>
          <label className="grid gap-1 text-sm">{t.phone}
            <input className="field" inputMode="tel" placeholder="06…" value={telephone} onChange={(event) => setTelephone(event.target.value)} autoComplete="tel" />
          </label>
          <label className="grid gap-1 text-sm">{t.city}
            <select className="field" value={ville} onChange={(event) => setVille(event.target.value)}>
              {CITIES.map((city) => <option key={city}>{city}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">{t.password}
            <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-3">
          {db.packs.filter((item) => item.actif).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`card grid gap-1 p-4 text-start ${item.id === packId ? "ring-2 ring-[var(--blue-fill)]" : ""}`}
              onClick={() => setPackId(item.id)}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-2xl">{item.id === "pack_videos" ? t.packVideos : t.packFull}</span>
                <span className="font-semibold">{formatMad(item.prixMad)}</span>
              </span>
              <span className="text-sm text-[var(--ink-soft)]">{item.id === "pack_videos" ? t.packVideosDetail : t.packFullDetail}</span>
              {item.duree ? <span className="text-sm">{item.duree}</span> : null}
              {item.perimetre ? <span className="text-sm">{item.perimetre}</span> : null}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3">
          <div className="grid gap-2">
            {db.banks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`btn ${item.id === bankId ? "btn-primary" : "btn-ghost"} justify-start`}
                onClick={() => setBankId(item.id)}
              >
                {item.nom}
              </button>
            ))}
          </div>
          {bank && pack && (
            <article className="card grid gap-2 p-4">
              <p className="text-sm text-[var(--ink-soft)]">{t.toPay} · {pack.id === "pack_videos" ? t.packVideos : t.packFull}</p>
              <p className="font-display text-4xl">{formatMad(pack.prixMad)}</p>
              <p className="text-sm">{t.holder} · {bank.titulaire}</p>
              <p className="font-mono text-lg">{bank.rib}</p>
              <p className="text-sm text-[var(--ink-soft)]">{t.bankHint}</p>
              <button
                type="button"
                className="btn btn-soft w-fit"
                onClick={() => navigator.clipboard.writeText(bank.rib)}
              >
                {t.copy}
              </button>
            </article>
          )}
        </div>
      )}

      {step === 3 && bank && pack && (
        <div className="grid gap-3">
          <article className="rounded-[14px] bg-[var(--pale)] p-4 text-[var(--yellow-ink)]">
            <p className="font-semibold">{pack.id === "pack_videos" ? t.packVideos : t.packFull} · {formatMad(pack.prixMad)}</p>
            <p className="font-mono">{bank.nom} · {bank.rib}</p>
          </article>
          <label className="grid gap-1 text-sm">{t.receipt}
            <input
              className="field"
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-sm text-[var(--ink-soft)]">{t.receiptHint}</p>
        </div>
      )}

      {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {step > 1 || (step === 1 && !student) ? (
          <button type="button" className="btn btn-ghost" onClick={() => { setError(""); setStep((value) => value - 1); }}>
            {t.back}
          </button>
        ) : step === 1 ? (
          <Link href="/livre" className="btn btn-ghost">{t.payLater}</Link>
        ) : null}
        {step === 0 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={async () => {
              if (!prenom.trim() || !nom.trim() || !telephone.trim() || !ville || password.trim().length < 6) {
                setError(t.needIdentity);
                return;
              }
              setBusy(true);
              const result = joinFree({ prenom, nom, telephone, ville, password });
              if (!result.ok) {
                setBusy(false);
                setError(result.error);
                return;
              }
              setPaying(true);
              setStep(1);
              const gate = await claimSession(result.studentId, password);
              setBusy(false);
              if (!gate.ok) setError(gate.error);
            }}
          >
            {busy ? t.opening : t.openChapter}
          </button>
        ) : step < 3 ? (
          <button type="button" className="btn btn-primary" onClick={next}>{t.continue}</button>
        ) : (
          <button
            type="button"
            className="btn btn-yellow"
            disabled={busy}
            onClick={async () => {
              if (!file || !bankId) {
                setError(t.needProof);
                return;
              }
              setBusy(true);
              const result = await enroll({ prenom, nom, telephone, ville, packId, bankId, file });
              setBusy(false);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setDone(true);
            }}
          >
            {busy ? t.sending : t.sendProof}
          </button>
        )}
      </div>
    </section>
  );
}
