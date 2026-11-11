"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SupportBlock } from "./support";
import { ErrorText } from "./ui";
import { site, waLink } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { claimSession, recoverSession } from "@/lib/session-client";
import { CITIES } from "@/lib/format";
import { useApp } from "@/lib/store";

function nextUrl() {
  const value = sessionStorage.getItem("lm-next");
  sessionStorage.removeItem("lm-next");
  return value && value.startsWith("/") ? value : "/";
}

export function LoginScreen() {
  const { login, logout, student } = useApp();
  const { t } = useI18n();
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [blockedId, setBlockedId] = useState("");
  const [asked, setAsked] = useState(false);

  if (student) {
    return (
      <div className="mx-auto grid max-w-md gap-4">
        <h1 className="font-display text-4xl">{t.already}</h1>
        <Link href="/" className="btn btn-primary">{t.goHome}</Link>
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = login(identifiant, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.kind === "session") {
      const gate = await claimSession(result.studentId, password);
      if (!gate.ok) {
        logout();
        setBlockedId(gate.status === 409 ? result.studentId : "");
        setError(gate.error);
        return;
      }
    }
    router.push(result.kind === "activation" ? "/activation" : nextUrl());
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.loginKicker}</p>
        <h1 className="font-display text-4xl">{t.login}</h1>
      </div>
      <form className="card grid gap-3 p-4" onSubmit={submit}>
        <label className="grid gap-1 text-sm">
          {t.id}
          <input className="field" autoComplete="username" value={identifiant} onChange={(event) => setIdentifiant(event.target.value)} placeholder="06… ou LM-…" />
        </label>
        <label className="grid gap-1 text-sm">
          {t.password}
          <input className="field" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <ErrorText>{error}</ErrorText>
        {error && identifiant.trim() && !/\d/.test(identifiant) && (
          <Link href="/admin" className="text-sm font-semibold text-[var(--blue)]">{t.adminHere}</Link>
        )}
        {blockedId && !asked && (
          <button
            type="button"
            className="btn btn-soft"
            onClick={async () => {
              const ok = await recoverSession(blockedId);
              if (ok) setAsked(true);
            }}
          >
            {t.browserAsk}
          </button>
        )}
        {asked && <p className="text-sm text-[var(--ink-soft)]">{t.browserAsked}</p>}
        <button className="btn btn-primary" type="submit">{t.enter}</button>
        <a className="text-sm text-[var(--ink-soft)]" href={waLink(site.supportWa, `Salam, j'ai oublié le mot de passe de mon Livre Magique. Mon identifiant : ${identifiant}`)}>
          {t.forgot}
        </a>
      </form>
      <details className="text-sm text-[var(--ink-soft)]">
        <summary className="tap cursor-pointer">{t.demo}</summary>
        <ul className="mt-2 grid gap-1 font-mono">
          <li>0661234524 / K7M4PX</li>
          <li>LM-00418 / R8TQ2H</li>
          <li>0661000099 / DEVICE</li>
        </ul>
      </details>
      <SupportBlock hint={t.supportHintLogin} />
    </div>
  );
}

export function ActivationScreen() {
  const { pending, activate, logout } = useApp();
  const { t } = useI18n();
  const router = useRouter();
  const [prenom, setPrenom] = useState(pending?.prenom || "");
  const [nom, setNom] = useState(pending?.nom || "");
  const [ville, setVille] = useState(pending?.ville || "");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const needsPhone = pending ? !pending.telephone : true;

  if (!pending) {
    return (
      <div className="mx-auto grid max-w-md gap-3">
        <h1 className="font-display text-4xl">{t.noActivation}</h1>
        <Link href="/connexion" className="btn btn-primary w-fit">{t.enter}</Link>
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = activate({ prenom, nom, ville, telephone, password, consent });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.studentId) {
      const gate = await claimSession(result.studentId, password);
      if (!gate.ok) {
        logout();
        setError(gate.error);
        return;
      }
    }
    router.push(nextUrl());
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.first}</p>
        <h1 className="font-display text-4xl">{t.activate}</h1>
      </div>
      <form className="card grid gap-3 p-4" onSubmit={submit}>
        <label className="grid gap-1 text-sm">{t.firstName}<input className="field" value={prenom} onChange={(event) => setPrenom(event.target.value)} required /></label>
        <label className="grid gap-1 text-sm">{t.lastName}<input className="field" value={nom} onChange={(event) => setNom(event.target.value)} required /></label>
        <label className="grid gap-1 text-sm">
          {t.city}
          <input className="field" list="villes" value={ville} onChange={(event) => setVille(event.target.value)} required />
          <datalist id="villes">
            {CITIES.map((city) => <option key={city} value={city} />)}
          </datalist>
        </label>
        {needsPhone && (
          <label className="grid gap-1 text-sm">
            {t.whatsapp}
            <input className="field" inputMode="tel" placeholder="06XXXXXXXX" value={telephone} onChange={(event) => setTelephone(event.target.value)} required />
          </label>
        )}
        <label className="grid gap-1 text-sm">
          {t.newPassword}
          <input className="field" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>{t.consent} <Link href="/confidentialite">{t.privacy}</Link>.</span>
        </label>
        <ErrorText>{error}</ErrorText>
        <button className="btn btn-primary" type="submit">{t.activateBtn}</button>
      </form>
    </div>
  );
}
