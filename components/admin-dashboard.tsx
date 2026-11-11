"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { EnrollmentPanel, PaymentPanel, PdfBox, PublishPanel } from "./access-panels";
import { StudioAdmin } from "./studio-admin";
import { bindAdminSession, releaseBrowser } from "@/lib/session-client";
import { AgentPanel } from "./agent-panel";
import { ThemeButton } from "./ui";
import { lessonUrl, site, waLink } from "@/lib/config";
import { batchCsv } from "@/lib/domain";
import { channelLabel, CHANNELS, formatDateTime, statusLabel, studentName } from "@/lib/format";
import { maskPhone, toWaNumber } from "@/lib/normalize";
import { evolutionLabel, kpis, scansForLesson, topScans } from "@/lib/stats";
import { useApp } from "@/lib/store";
import type { Channel, Lesson } from "@/lib/types";

type Tab = "apercu" | "equipe" | "acces" | "publier" | "agent" | "vente" | "lot" | "videos" | "paiement" | "atelier" | "eleves";

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function MessageCard({ body, phone }: { body: string; phone: string }) {
  const [copied, setCopied] = useState(false);
  const href = waLink(phone ? toWaNumber(phone) : site.supportWa, body);
  return (
    <div className="grid gap-2">
      <pre className="whitespace-pre-wrap rounded-2xl bg-[var(--paper)] p-3 text-sm">{body}</pre>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-soft"
          onClick={async () => {
            await navigator.clipboard.writeText(body);
            setCopied(true);
          }}
        >
          {copied ? "Copié" : "Copier"}
        </button>
        <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer">
          Ouvrir WhatsApp
        </a>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const app = useApp();
  const { admin, db, parts } = app;
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!admin) {
    return (
      <div className="mx-auto grid min-h-dvh w-full max-w-sm content-center gap-5 px-4">
        <div className="flex items-center gap-3">
          <span className="admin-logo" aria-hidden>
            <svg viewBox="0 0 40 30">
              <path d="M3 5c5.6 1.7 9.5 1.7 16 0v21c-6.5 1.7-10.4 1.7-16 0V5z" fill="#FFFFFF" />
              <path d="M37 5c-5.6 1.7-9.5 1.7-16 0v21c6.5 1.7 10.4 1.7 16 0V5z" fill="#FFC72C" />
            </svg>
          </span>
          <div className="grid leading-tight">
            <h1 className="font-display text-2xl">Espace admin</h1>
            <small className="text-[var(--ink-soft)]">Le Livre Magique</small>
          </div>
          <span className="ms-auto"><ThemeButton /></span>
        </div>
        <form
          className="admin-panel grid gap-3 p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = app.loginAsAdmin(identifiant, password);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            const bound = await bindAdminSession(identifiant, password);
            if (!bound) setError("Session locale ouverte. La réinitialisation d'un navigateur utilise le mot de passe admin de départ.");
          }}
        >
          <label className="grid gap-1 text-sm">
            Identifiant
            <input className="field" value={identifiant} onChange={(event) => setIdentifiant(event.target.value)} autoComplete="username" />
          </label>
          <label className="grid gap-1 text-sm">
            Mot de passe
            <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button className="btn btn-primary" type="submit">Se connecter</button>
        </form>
        <details className="text-sm text-[var(--ink-soft)]">
          <summary className="cursor-pointer">Comptes de démonstration</summary>
          <ul className="mt-2 grid gap-1 font-mono">
            <li>grok / GROK47 · super admin</li>
            <li>khalil / AGENCE1 · super admin</li>
            <li>mohssine / MOHSSINE · super admin</li>
            <li>ventes / VENTES1 · ventes</li>
          </ul>
        </details>
      </div>
    );
  }

  return <Desk />;
}

const ICONS: Record<string, string> = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.8M15 4.2a3 3 0 0 1 0 5.6",
  plus: "M12 5v14M5 12h14",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2",
  doc: "M6 3h9l5 5v13H6zM14 3v6h6",
  chat: "M4 5h16v11H8l-4 4z",
  card: "M3 6h18v12H3zM3 10h18",
  box: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  out: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};

export function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" className="admin-icon" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

type NavItem = { id: Tab; label: string; icon: keyof typeof ICONS; count?: number };

function Desk() {
  const app = useApp();
  const admin = app.admin!;
  const superAdmin = admin.role === "super_admin";
  const pending = app.db.enrollments.filter((item) => item.statut === "en_attente").length;
  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: "Au quotidien",
      items: [
        { id: "apercu", label: "Tableau de bord", icon: "home" },
        { id: "acces", label: "Paiements à valider", icon: "receipt", count: pending },
        { id: "eleves", label: "Élèves", icon: "users" },
        { id: "vente", label: "Nouvelle vente", icon: "plus" },
      ],
    },
    {
      title: "Contenu",
      items: [
        { id: "publier", label: "Publier une vidéo", icon: "upload" },
        ...(superAdmin ? [{ id: "videos" as const, label: "Leçons & QR codes", icon: "qr" as const }] : []),
        { id: "atelier", label: "Contenus du site", icon: "doc" },
        { id: "agent", label: "Agent", icon: "chat" },
      ],
    },
    ...(superAdmin
      ? [{
          title: "Réglages",
          items: [
            { id: "paiement" as const, label: "Formules & RIB", icon: "card" as const },
            { id: "lot" as const, label: "Lot librairie", icon: "box" as const },
            { id: "equipe" as const, label: "Équipe & journal", icon: "shield" as const },
          ],
        }]
      : []),
  ];
  const [tab, setTab] = useState<Tab>("apercu");

  function go(next: Tab) {
    setTab(next);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="admin-app">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-logo" aria-hidden>
            <svg viewBox="0 0 40 30">
              <path d="M3 5c5.6 1.7 9.5 1.7 16 0v21c-6.5 1.7-10.4 1.7-16 0V5z" fill="#FFFFFF" />
              <path d="M37 5c-5.6 1.7-9.5 1.7-16 0v21c6.5 1.7 10.4 1.7 16 0V5z" fill="#FFC72C" />
            </svg>
          </span>
          <span className="grid leading-tight">
            <strong>Le Livre Magique</strong>
            <small>Administration</small>
          </span>
          <span className="admin-top-actions">
            <ThemeButton />
            <button type="button" className="admin-out" onClick={app.logoutAdmin} aria-label="Sortir">
              <Icon name="out" />
            </button>
          </span>
        </div>
        <nav className="admin-nav" aria-label="Administration">
          {groups.map((group) => (
            <div key={group.title} className="admin-group">
              <p className="admin-group-title">{group.title}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-link ${tab === item.id ? "is-on" : ""}`}
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => go(item.id)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {!!item.count && <span className="admin-count">{item.count}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-me">
          <span className="admin-avatar" aria-hidden>{admin.nom.replace(/^Maître\s+/, "").charAt(0)}</span>
          <span className="grid min-w-0 leading-tight">
            <strong className="truncate">{admin.nom}</strong>
            <small>{superAdmin ? "Super admin" : "Admin ventes"}</small>
          </span>
          <button type="button" className="admin-out" onClick={app.logoutAdmin} aria-label="Sortir" title="Sortir">
            <Icon name="out" />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === "apercu" && <Overview pending={pending} onGo={go} />}
        {tab === "acces" && <EnrollmentPanel />}
        {tab === "publier" && <PublishPanel />}
        {tab === "agent" && <AgentPanel />}
        {tab === "vente" && <SalePanel />}
        {tab === "lot" && superAdmin && <BatchPanel />}
        {tab === "videos" && superAdmin && <VideoPanel />}
        {tab === "paiement" && superAdmin && <PaymentPanel />}
        {tab === "atelier" && <StudioAdmin />}
        {tab === "eleves" && <StudentsPanel />}
        {tab === "equipe" && superAdmin && (
          <div className="grid gap-6">
            <AdminPanel />
            <Journal limit={30} />
            <button type="button" className="btn btn-ghost w-fit" onClick={app.resetDemo}>
              Réinitialiser la démo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Overview({ pending, onGo }: { pending: number; onGo: (tab: Tab) => void }) {
  const app = useApp();
  const admin = app.admin!;
  const now = new Date().toISOString();
  const stats = kpis(app.db, now);
  const hour = new Date().getHours();
  const first = admin.nom.replace(/^Maître\s+/, "").split(" ")[0];

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm text-[var(--ink-soft)]">{formatDateTime(now)}</p>
        <h1 className="font-display text-3xl md:text-4xl">{hour >= 18 ? "Bonsoir" : "Bonjour"} {first}</h1>
      </header>

      {pending > 0 ? (
        <button type="button" className="admin-alert" onClick={() => onGo("acces")}>
          <span className="admin-alert-num">{pending}</span>
          <span className="grid text-left">
            <strong>{pending === 1 ? "Un paiement attend ta validation" : `${pending} paiements attendent ta validation`}</strong>
            <span className="text-sm">Vérifie le reçu puis ouvre l&apos;accès à l&apos;élève.</span>
          </span>
          <span className="admin-alert-go" aria-hidden>→</span>
        </button>
      ) : (
        <p className="admin-calm">Aucun paiement en attente. Tout est à jour.</p>
      )}

      <section className="admin-kpis">
        <Kpi label="Comptes créés" value={String(stats.accounts)} detail={`dont ${stats.createdToday} aujourd'hui`} />
        <Kpi label="Livres activés" value={String(stats.active)} detail={`${stats.activePct} % des comptes`} />
        <Kpi label="Scans QR · 7 jours" value={String(stats.scans7)} detail={evolutionLabel(stats.scans7, stats.scansPrev)} />
        <Kpi label="Vidéos en ligne" value={`${stats.online}/${stats.total}`} detail={`${stats.toShoot} à tourner`} bar={(stats.online / Math.max(stats.total, 1)) * 100} />
      </section>

      <Journal limit={6} />
    </div>
  );
}

function Journal({ limit }: { limit: number }) {
  const { db } = useApp();
  const entries = db.audit.slice(0, limit);
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-xl">Activité récente</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">Rien pour l&apos;instant.</p>
      ) : (
        <ul className="admin-list">
          {entries.map((entry) => {
            const who = db.admins.find((item) => item.id === entry.adminId);
            return (
              <li key={entry.id}>
                <span className="grid min-w-0">
                  <span className="truncate"><strong>{entry.action}</strong> · {entry.cible}</span>
                  <small>{who?.nom ?? "Admin"}</small>
                </span>
                <small className="shrink-0">{formatDateTime(entry.creeLe)}</small>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Kpi({ label, value, detail, bar }: { label: string; value: string; detail: string; bar?: number }) {
  return (
    <article className="admin-kpi">
      <p className="text-sm text-[var(--ink-soft)]">{label}</p>
      <p className="font-display text-3xl">{value}</p>
      {bar !== undefined && (
        <span className="admin-bar" aria-hidden><i style={{ width: `${bar}%` }} /></span>
      )}
      <p className="text-xs text-[var(--ink-soft)]">{detail}</p>
    </article>
  );
}

function SalePanel() {
  const { sell } = useApp();
  const [telephone, setTelephone] = useState("");
  const [nom, setNom] = useState("");
  const [canal, setCanal] = useState<Channel>("whatsapp");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ body: string; phone: string } | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = sell(telephone, nom, canal);
    if (!result.ok) {
      setSent(null);
      setError(result.error);
      return;
    }
    setError("");
    setSent({ body: result.message, phone: result.phone });
    setTelephone("");
    setNom("");
  }

  return (
    <section className="card grid gap-4 p-4">
      <h2 className="font-display text-2xl">Nouvelle vente</h2>
      <form className="grid gap-3" onSubmit={submit}>
        <label className="grid gap-1 text-sm">
          Numéro WhatsApp
          <input className="field" required inputMode="tel" placeholder="06XXXXXXXX" value={telephone} onChange={(event) => setTelephone(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          Nom, facultatif
          <input className="field" value={nom} onChange={(event) => setNom(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          Canal
          <select className="field" value={canal} onChange={(event) => setCanal(event.target.value as Channel)}>
            {CHANNELS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button className="btn btn-primary" type="submit">Créer le compte et envoyer</button>
      </form>
      {sent && (
        <div className="grid gap-2">
          <p className="text-sm text-[var(--good)]">Message envoyé. Le secours reste disponible si WhatsApp n&apos;a pas abouti.</p>
          <MessageCard body={sent.body} phone={sent.phone} />
        </div>
      )}
    </section>
  );
}

function BatchPanel() {
  const { db, makeBatch, exportBatch } = useApp();
  const [quantite, setQuantite] = useState(10);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState(db.batches[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);
  const batch = db.batches.find((item) => item.id === previewId) ?? db.batches[0];

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = makeBatch(quantite);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setPreviewId(result.batchId);
    setRevealed(false);
  }

  return (
    <section className="grid gap-4">
      <form className="card grid gap-3 p-4" onSubmit={submit}>
        <h2 className="font-display text-2xl">Lot librairie</h2>
        <label className="grid gap-1 text-sm">
          Nombre de livres
          <input className="field" type="number" min={1} max={5000} value={quantite} onChange={(event) => setQuantite(Number(event.target.value))} />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button className="btn btn-primary" type="submit">Générer les comptes</button>
      </form>
      {batch && (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="card grid gap-3 p-4">
            <h3 className="font-display text-2xl">Autocollant</h3>
            <div className="grid gap-2 rounded-3xl border border-dashed border-[var(--line)] p-4">
              <p className="font-display text-xl">Le Livre Magique</p>
              <p className="text-sm text-[var(--ink-soft)]">Identifiant</p>
              <p className="font-mono text-2xl">{batch.comptes[0]?.identifiant}</p>
              <p className="text-sm text-[var(--ink-soft)]">Mot de passe</p>
              <button type="button" className="btn btn-soft font-mono" onClick={() => setRevealed(true)}>
                {revealed ? batch.comptes[0]?.motDePasse : "Gratter"}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                exportBatch(batch.id);
                download(`lot-${batch.id}.csv`, new Blob([batchCsv(batch)], { type: "text/csv;charset=utf-8" }));
              }}
            >
              Exporter le CSV
            </button>
          </article>
          <article className="grid gap-2">
            <h3 className="font-display text-2xl">Historique</h3>
            {db.batches.map((item) => (
              <button key={item.id} type="button" className="card p-3 text-left" onClick={() => { setPreviewId(item.id); setRevealed(false); }}>
                <span className="font-medium">{item.quantite} livres</span>
                <span className="block text-sm text-[var(--ink-soft)]">
                  {formatDateTime(item.creeLe)} · {item.exporteLe ? "CSV exporté" : "pas encore exporté"}
                </span>
              </button>
            ))}
          </article>
        </div>
      )}
    </section>
  );
}

function VideoPanel() {
  const { db, parts, toggleLesson, editLesson, createLesson } = useApp();
  const [partId, setPartId] = useState("tous");
  const [selectedId, setSelectedId] = useState(db.lessons[0]?.id ?? "");
  const [svg, setSvg] = useState("");
  const [message, setMessage] = useState("");
  const now = new Date().toISOString();
  const selected = db.lessons.find((lesson) => lesson.id === selectedId) ?? null;
  const visible = db.lessons
    .filter((lesson) => partId === "tous" || lesson.partId === partId)
    .sort((a, b) => a.ordre - b.ordre);
  const ranking = topScans(db, now);

  useEffect(() => {
    if (!selected) return;
    let cancel = false;
    import("qrcode").then((QR) =>
      QR.toString(lessonUrl(selected.slug, "qr"), { type: "svg", errorCorrectionLevel: "M", margin: 1 }).then((value) => {
        if (!cancel) setSvg(value);
      }),
    );
    return () => {
      cancel = true;
    };
  }, [selected]);

  async function downloadOne(kind: "svg" | "png") {
    if (!selected) return;
    const QR = await import("qrcode");
    if (kind === "svg") {
      const value = await QR.toString(lessonUrl(selected.slug, "qr"), { type: "svg", errorCorrectionLevel: "M", margin: 1 });
      download(`${selected.code}.svg`, new Blob([value], { type: "image/svg+xml" }));
      return;
    }
    const dataUrl = await QR.toDataURL(lessonUrl(selected.slug, "qr"), { errorCorrectionLevel: "M", margin: 1, width: 512 });
    const blob = await (await fetch(dataUrl)).blob();
    download(`${selected.code}.png`, blob);
  }

  async function downloadZip() {
    const QR = await import("qrcode");
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const lesson of db.lessons) {
      const value = await QR.toString(lessonUrl(lesson.slug, "qr"), { type: "svg", errorCorrectionLevel: "M", margin: 1 });
      zip.file(`${lesson.code}.svg`, value);
    }
    download("qr-livremagique.zip", await zip.generateAsync({ type: "blob" }));
  }

  const online = db.lessons.filter((lesson) => lesson.statut === "en_ligne").length;

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid max-w-2xl gap-1">
          <h1 className="font-display text-3xl">Leçons & QR codes</h1>
          <p className="text-sm text-[var(--ink-soft)]">
            Chaque leçon du livre imprimé a son QR code. L&apos;élève le scanne avec son téléphone et arrive directement sur la vidéo de cette leçon.
            Choisis une leçon dans la liste pour télécharger son QR, la modifier ou y joindre un PDF.
          </p>
        </div>
        <button type="button" className="btn btn-soft" onClick={downloadZip}>Télécharger tous les QR (ZIP)</button>
      </header>

      <div className="admin-steps">
        <p><strong>{online}</strong> leçons en ligne : leur vidéo est prête, l&apos;élève peut la regarder.</p>
        <p><strong>{db.lessons.length - online}</strong> à tourner : la vidéo n&apos;existe pas encore, l&apos;élève voit « vidéo à venir ».</p>
      </div>

      <div className="chip-row" role="tablist" aria-label="Filtrer par partie">
        <Filter id="tous" label="Toutes" current={partId} onPick={setPartId} />
        {parts.map((part) => (
          <Filter key={part.id} id={part.id} label={part.titre} current={partId} onPick={setPartId} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul className="admin-list lesson-list">
          {visible.map((lesson) => {
            const on = lesson.statut === "en_ligne";
            return (
              <li key={lesson.id} className={lesson.id === selectedId ? "is-on" : ""}>
                <button type="button" className="lesson-pick" onClick={() => setSelectedId(lesson.id)}>
                  <span className="font-mono text-xs text-[var(--ink-soft)]">{lesson.code} · page {lesson.page}</span>
                  <span className="truncate font-medium">{lesson.titre}</span>
                  <small>{scansForLesson(db, lesson.id, now)} scans cette semaine</small>
                </button>
                <span className={`status-pill ${on ? "is-good" : ""}`}>{statusLabel(lesson.statut)}</span>
              </li>
            );
          })}
        </ul>

        {selected && (
          <div className="grid content-start gap-4 lg:sticky lg:top-6">
            <article className="admin-panel grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-[var(--ink-soft)]">{selected.code}</p>
                  <h2 className="font-display text-xl">{selected.titre}</h2>
                </div>
                <span className={`status-pill ${selected.statut === "en_ligne" ? "is-good" : ""}`}>{statusLabel(selected.statut)}</span>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => toggleLesson(selected.id)}>
                {selected.statut === "en_ligne" ? "Repasser en « à tourner »" : "La vidéo est prête : mettre en ligne"}
              </button>
            </article>

            <article className="admin-panel grid justify-items-center gap-3 text-center">
              <p className="justify-self-start text-sm font-semibold">QR code à imprimer</p>
              <div className="w-40 rounded-lg bg-white p-2" dangerouslySetInnerHTML={{ __html: svg }} />
              <p className="text-xs text-[var(--ink-soft)]">Il ouvre : <span className="break-all font-mono">{lessonUrl(selected.slug, "qr")}</span></p>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" className="btn btn-primary" onClick={() => downloadOne("svg")}>Pour l&apos;imprimeur (SVG)</button>
                <button type="button" className="btn btn-soft" onClick={() => downloadOne("png")}>Image (PNG)</button>
              </div>
              <p className="text-xs text-[var(--ink-soft)]">Imprime-le à 2 cm minimum. Ce lien ne change jamais, même si tu modifies le titre.</p>
            </article>

            <LessonForm
              lesson={selected}
              onSave={(input) => {
                const result = editLesson(input);
                setMessage(result.ok ? "Leçon enregistrée." : result.error);
              }}
            />
            {message && <p className="text-sm text-[var(--good)]">{message}</p>}
            <PdfBox lessonId={selected.id} />
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <NewLesson
          onCreate={(input) => {
            const result = createLesson(input);
            setMessage(result.ok ? `${result.code} ajoutée.` : result.error);
          }}
        />
        <section className="grid content-start gap-3">
          <h2 className="font-display text-xl">Les plus scannées cette semaine</h2>
          <ol className="admin-list">
            {ranking.map((item) => {
              const lesson = db.lessons.find((entry) => entry.id === item.lessonId);
              return (
                <li key={item.lessonId}>
                  <span className="truncate">{lesson?.code} · {lesson?.titre}</span>
                  <strong className="font-mono">{item.count}</strong>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </section>
  );
}

function Filter({ id, label, current, onPick }: { id: string; label: string; current: string; onPick: (id: string) => void }) {
  return (
    <button type="button" role="tab" aria-selected={current === id} className={`chip ${current === id ? "is-on" : ""}`} onClick={() => onPick(id)}>
      {label}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-[var(--ink-soft)]">{hint}</span>}
    </label>
  );
}

const noWheel = (event: React.WheelEvent<HTMLInputElement>) => event.currentTarget.blur();

function LessonForm({ lesson, onSave }: { lesson: Lesson; onSave: (input: {
  lessonId: string;
  titre: string;
  page: number;
  ordre: number;
  dureeS: number;
  partId: string;
  bunnyVideoId: string;
  bunnyPreviewId: string;
}) => void }) {
  const { parts } = useApp();
  const [titre, setTitre] = useState(lesson.titre);
  const [page, setPage] = useState(lesson.page);
  const [ordre, setOrdre] = useState(lesson.ordre);
  const [duree, setDuree] = useState(Math.round(lesson.dureeS / 60));
  const [partId, setPartId] = useState(lesson.partId);
  const [bunny, setBunny] = useState(lesson.bunnyVideoId);
  const [preview, setPreview] = useState(lesson.bunnyPreviewId);

  useEffect(() => {
    setTitre(lesson.titre);
    setPage(lesson.page);
    setOrdre(lesson.ordre);
    setDuree(Math.round(lesson.dureeS / 60));
    setPartId(lesson.partId);
    setBunny(lesson.bunnyVideoId);
    setPreview(lesson.bunnyPreviewId);
  }, [lesson]);

  return (
    <form
      className="admin-panel grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          lessonId: lesson.id,
          titre,
          page,
          ordre,
          dureeS: duree * 60,
          partId,
          bunnyVideoId: bunny,
          bunnyPreviewId: preview,
        });
      }}
    >
      <h3 className="font-display text-lg">Modifier les informations</h3>
      <Field label="Titre de la leçon">
        <input className="field" value={titre} onChange={(event) => setTitre(event.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Page du livre">
          <input className="field" type="number" min={1} value={page} onWheel={noWheel} onChange={(event) => setPage(Number(event.target.value))} />
        </Field>
        <Field label="Durée (minutes)">
          <input className="field" type="number" min={1} value={duree} onWheel={noWheel} onChange={(event) => setDuree(Number(event.target.value))} />
        </Field>
      </div>
      <div className="grid grid-cols-[1fr_96px] gap-2">
        <Field label="Partie">
          <select className="field" value={partId} onChange={(event) => setPartId(event.target.value)}>
            {parts.map((part) => <option key={part.id} value={part.id}>{part.titre}</option>)}
          </select>
        </Field>
        <Field label="Position">
          <input className="field" type="number" min={1} value={ordre} onWheel={noWheel} onChange={(event) => setOrdre(Number(event.target.value))} />
        </Field>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-[var(--ink-soft)]">Réglages vidéo (Bunny)</summary>
        <div className="mt-2 grid gap-2">
          <Field label="Vidéo complète" hint="Identifiant donné par Bunny après l'envoi de la vidéo.">
            <input className="field font-mono" value={bunny} onChange={(event) => setBunny(event.target.value)} />
          </Field>
          <Field label="Aperçu gratuit de 30 s">
            <input className="field font-mono" value={preview} onChange={(event) => setPreview(event.target.value)} />
          </Field>
        </div>
      </details>
      <button className="btn btn-primary" type="submit">Enregistrer</button>
    </form>
  );
}

function NewLesson({ onCreate }: { onCreate: (input: { partId: string; prefix: string; numero: string; titre: string; page: number }) => void }) {
  const { parts } = useApp();
  const [partId, setPartId] = useState(parts[0]?.id ?? "");
  const part = parts.find((item) => item.id === partId);
  const [numero, setNumero] = useState("");
  const [titre, setTitre] = useState("");
  const [page, setPage] = useState(1);

  return (
    <form
      className="admin-panel grid content-start gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!part) return;
        onCreate({ partId, prefix: part.code, numero, titre, page });
      }}
    >
      <h2 className="font-display text-xl">Ajouter une leçon</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Partie">
          <select className="field" value={partId} onChange={(event) => setPartId(event.target.value)}>
            {parts.map((item) => <option key={item.id} value={item.id}>{item.titre}</option>)}
          </select>
        </Field>
        <Field label="Numéro" hint={part ? `Le code sera ${part.code}-${numero.trim() ? (part.code === "EX" ? numero.trim() : numero.trim().padStart(2, "0")) : "…"}` : undefined}>
          <input className="field" placeholder="ex. 11" value={numero} onChange={(event) => setNumero(event.target.value)} required />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Titre">
            <input className="field" value={titre} onChange={(event) => setTitre(event.target.value)} required />
          </Field>
        </div>
        <Field label="Page du livre">
          <input className="field" type="number" min={1} value={page} onWheel={noWheel} onChange={(event) => setPage(Number(event.target.value))} />
        </Field>
      </div>
      <button className="btn btn-soft" type="submit">Ajouter la leçon</button>
    </form>
  );
}

function StudentsPanel() {
  const { db, admin, resend, release, deactivate, deleteUser } = useApp();
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState<"tous" | "sans" | "attente" | "actif" | "suspendu">("tous");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sent, setSent] = useState<{ id: string; body: string; phone: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const superAdmin = admin?.role === "super_admin";
  const needle = query.trim().toLowerCase().replace(/\s+/g, "");
  const students = useMemo(() => {
    return db.students.filter((student) => {
      const pendingPay = db.enrollments.some((item) => item.studentId === student.id && item.statut === "en_attente");
      const group = student.statut === "desactive" ? "suspendu" : pendingPay ? "attente" : student.acces === "chapitre" ? "sans" : "actif";
      if (bucket !== "tous" && group !== bucket) return false;
      if (!needle) return true;
      const blob = [student.prenom, student.nom, student.ville, student.identifiant, student.telephone, ...student.alias]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, "");
      return blob.includes(needle);
    });
  }, [bucket, db.enrollments, db.students, needle]);
  const open = students.find((student) => student.id === openId) ?? null;

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {(["tous", "sans", "attente", "actif", "suspendu"] as const).map((id) => (
          <button key={id} type="button" className={`btn ${bucket === id ? "btn-primary" : "btn-soft"}`} onClick={() => setBucket(id)}>
            {id === "tous" ? "Tous" : id === "sans" ? "Sans paiement" : id === "attente" ? "En attente" : id === "actif" ? "Actifs" : "Suspendus"}
          </button>
        ))}
      </div>
      <input className="field" placeholder="Nom, numéro ou ville" value={query} onChange={(event) => setQuery(event.target.value)} />
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <ul className="grid gap-2">
        {students.map((student) => {
          const devices = db.devices.filter((device) => device.studentId === student.id && !device.revoqueLe).length;
          return (
            <li key={student.id}>
              <button type="button" className="card grid w-full gap-1 p-3 text-left" onClick={() => setOpenId(student.id === openId ? null : student.id)}>
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{studentName(student.prenom, student.nom)}</span>
                  <span className="font-mono text-sm">{student.telephone ? maskPhone(student.telephone) : student.identifiant}</span>
                </span>
                <span className="text-sm text-[var(--ink-soft)]">
                  {student.ville || "—"} · {channelLabel(student.canal)} · {statusLabel(student.statut)} · {student.acces === "chapitre" ? "Chapitre 1" : "Livre complet"} · {devices}/2
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {open && (
        <article className="card grid gap-3 p-4">
          <h3 className="font-display text-2xl">{studentName(open.prenom, open.nom)}</h3>
          <p className="text-sm text-[var(--ink-soft)]">
            {open.identifiant} · {statusLabel(open.statut)} · {db.progress.filter((item) => item.studentId === open.id && item.vue).length} leçons vues
          </p>
          <ul className="grid gap-1 text-sm">
            {db.devices.filter((device) => device.studentId === open.id).map((device) => (
              <li key={device.id}>{device.libelle} · {device.revoqueLe ? "libéré" : "actif"} · vu {formatDateTime(device.dernierVu)}</li>
            ))}
          </ul>
          <ul className="grid gap-1 text-sm text-[var(--ink-soft)]">
            {db.events.filter((event) => event.studentId === open.id && event.type === "connexion").slice(0, 5).map((event) => (
              <li key={event.id}>Connexion · {formatDateTime(event.creeLe)}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const result = resend(open.id);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setError("");
                setSent({ id: open.id, body: result.message, phone: result.phone });
              }}
            >
              Renvoyer les accès
            </button>
            {superAdmin && (
              <>
                <button type="button" className="btn btn-soft" onClick={() => release(open.id)}>Libérer les appareils</button>
                <button type="button" className="btn btn-soft" onClick={async () => {
                  const result = await releaseBrowser(open.id);
                  if (!result.ok) setError(result.error);
                  else setError("");
                }}>Réinitialiser le navigateur</button>
                <button type="button" className="btn btn-ghost" onClick={async () => { deactivate(open.id); await releaseBrowser(open.id); }}>Désactiver</button>
              </>
            )}
            {confirmId === open.id ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const result = deleteUser(open.id);
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  setOpenId(null);
                  setConfirmId(null);
                }}
              >
                Confirmer la suppression
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmId(open.id)}>Supprimer le compte</button>
            )}
          </div>
          {sent?.id === open.id && <MessageCard body={sent.body} phone={sent.phone} />}
        </article>
      )}
    </section>
  );
}

function AdminPanel() {
  const { db, createAdmin } = useApp();
  const [nom, setNom] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [role, setRole] = useState<"super_admin" | "ventes">("ventes");
  const [created, setCreated] = useState("");
  const [error, setError] = useState("");

  return (
    <section className="card grid gap-3 p-4">
      <h2 className="font-display text-2xl">Admins</h2>
      <ul className="grid gap-1 text-sm">
        {db.admins.map((item) => (
          <li key={item.id}>{item.nom} · {item.identifiant} · {item.role === "super_admin" ? "Super admin" : "Ventes"}</li>
        ))}
      </ul>
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const result = createAdmin(nom, identifiant, role);
          if (!result.ok) {
            setCreated("");
            setError(result.error);
            return;
          }
          setError("");
          setCreated(`${result.identifiant} / ${result.password}`);
          setNom("");
          setIdentifiant("");
        }}
      >
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="field" placeholder="Nom" value={nom} onChange={(event) => setNom(event.target.value)} required />
          <input className="field" placeholder="Identifiant" value={identifiant} onChange={(event) => setIdentifiant(event.target.value)} required />
          <select className="field" value={role} onChange={(event) => setRole(event.target.value as "super_admin" | "ventes")}>
            <option value="ventes">Ventes</option>
            <option value="super_admin">Super admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {created && <p className="font-mono text-sm">Mot de passe à transmettre maintenant : {created}</p>}
        <button className="btn btn-soft w-fit" type="submit">Ajouter un admin</button>
      </form>
    </section>
  );
}
