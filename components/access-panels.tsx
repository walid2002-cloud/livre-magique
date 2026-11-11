"use client";

import { useEffect, useState } from "react";
import { site, waLink } from "@/lib/config";
import { getFile } from "@/lib/files";
import { readPdfText } from "@/lib/pdf-text";
import { formatDateTime } from "@/lib/format";
import { displayPhone, toWaNumber } from "@/lib/normalize";
import { formatMad } from "@/lib/offers";
import { isStory } from "@/lib/access";
import { useApp } from "@/lib/store";
import type { BankId } from "@/lib/types";

export function EnrollmentPanel() {
  const { db, grantAccess, refuseAccess } = useApp();
  const [sent, setSent] = useState<{ id: string; body: string; phone: string } | null>(null);
  const [error, setError] = useState("");
  const waiting = db.enrollments.filter((item) => item.statut === "en_attente");
  const done = db.enrollments.filter((item) => item.statut !== "en_attente").slice(0, 6);
  const noProof = db.students.filter(
    (student) =>
      student.canal === "site" &&
      student.acces === "chapitre" &&
      student.telephone &&
      !db.enrollments.some((item) => item.studentId === student.id || item.telephone === student.telephone),
  );

  const renderWaiting = (item: (typeof waiting)[number]) => {
    const pack = db.packs.find((packItem) => packItem.id === item.packId);
    const bank = db.banks.find((bankItem) => bankItem.id === item.bankId);
    return (
      <li key={item.id} className="review-card">
        <Proof id={item.justifId} name={item.justifNom} />
        <div className="grid content-start gap-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-display text-2xl">{item.prenom} {item.nom}</p>
              <p className="text-sm text-[var(--ink-soft)]">Reçu le {formatDateTime(item.creeLe)}</p>
            </div>
            <span className="status-pill">En attente</span>
          </div>
          <dl className="review-facts">
            <div><dt>Formule</dt><dd>{pack?.nom ?? "—"}</dd></div>
            <div><dt>Montant</dt><dd className="font-semibold">{pack ? formatMad(pack.prixMad) : "—"}</dd></div>
            <div><dt>Banque</dt><dd>{bank?.nom ?? "—"}</dd></div>
            <div><dt>Téléphone</dt><dd className="font-mono">{displayPhone(item.telephone)}</dd></div>
            <div><dt>Ville</dt><dd>{item.ville || "—"}</dd></div>
          </dl>
          <ReviewActions
            onGrant={() => {
              const result = grantAccess(item.id);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setError("");
              setSent({ id: item.id, body: result.message, phone: result.phone });
            }}
            onRefuse={(motif) => refuseAccess(item.id, motif)}
          />
        </div>
      </li>
    );
  };

  return (
    <section className="grid gap-5">
      <header className="grid gap-1">
        <h1 className="font-display text-3xl">Paiements à valider</h1>
        <p className="text-sm text-[var(--ink-soft)]">Compare le reçu avec ton relevé bancaire, puis ouvre l&apos;accès. L&apos;élève reçoit ses identifiants par WhatsApp.</p>
      </header>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {sent && !waiting.some((item) => item.id === sent.id) && (
        <div className="admin-panel grid gap-3">
          <p className="text-sm font-semibold text-[var(--good)]">Accès ouvert. Envoie ce message à l&apos;élève :</p>
          <AccessNote body={sent.body} phone={sent.phone} />
        </div>
      )}
      {waiting.length === 0 && <p className="admin-calm">Aucun reçu en attente.</p>}
      <ul className="grid gap-4">{waiting.map(renderWaiting)}</ul>
      {noProof.length > 0 && (
        <div className="admin-panel grid gap-3">
          <div>
            <h2 className="font-display text-xl">Inscrits sans reçu ({noProof.length})</h2>
            <p className="text-sm text-[var(--ink-soft)]">Ils ont créé leur compte et lisent le chapitre 1, mais n&apos;ont pas encore envoyé de reçu. Rien à valider tant que le reçu n&apos;est pas arrivé.</p>
          </div>
          <ul className="admin-list">
            {noProof.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-medium">{item.prenom} {item.nom}</span>
                  <span className="block text-sm text-[var(--ink-soft)]">{displayPhone(item.telephone!)} · inscrit le {formatDateTime(item.creeLe)}</span>
                </span>
                <a
                  className="btn btn-ghost"
                  href={waLink(toWaNumber(item.telephone!), `Bonjour ${item.prenom}, ton compte Le Livre Magique est prêt. Pour ouvrir tout le livre, envoie ton reçu de paiement ici : ${site.url}/inscription`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Relancer sur WhatsApp
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {done.length > 0 && (
        <section className="grid gap-3">
          <h2 className="font-display text-xl">Déjà traités</h2>
          <ul className="admin-list">
            {done.map((item) => (
              <li key={item.id}>
                <span className="grid min-w-0">
                  <span className="truncate font-medium">{item.prenom} {item.nom}</span>
                  {item.motif && <small className="truncate">{item.motif}</small>}
                </span>
                <span className={`status-pill ${item.statut === "valide" ? "is-good" : "is-bad"}`}>
                  {item.statut === "valide" ? "Validé" : "Refusé"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}

function ReviewActions({ onGrant, onRefuse }: { onGrant: () => void; onRefuse: (motif: string) => void }) {
  const [refusing, setRefusing] = useState(false);
  const [motif, setMotif] = useState("");
  if (refusing) {
    return (
      <div className="grid gap-2">
        <input className="field" autoFocus placeholder="Motif du refus (envoyé à l'élève)" value={motif} onChange={(event) => setMotif(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-danger" onClick={() => onRefuse(motif)}>Confirmer le refus</button>
          <button type="button" className="btn btn-ghost" onClick={() => setRefusing(false)}>Annuler</button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-yellow" onClick={onGrant}>✓ Paiement reçu, ouvrir l&apos;accès</button>
      <button type="button" className="btn btn-ghost" onClick={() => setRefusing(true)}>Refuser</button>
    </div>
  );
}

function AccessNote({ body, phone }: { body: string; phone: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid gap-2">
      <pre className="whitespace-pre-wrap rounded-[14px] bg-[var(--paper)] p-3 text-sm">{body}</pre>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-soft" onClick={async () => { await navigator.clipboard.writeText(body); setCopied(true); }}>
          {copied ? "Copié" : "Copier"}
        </button>
        <a className="btn btn-primary" href={waLink(phone ? toWaNumber(phone) : site.supportWa, body)} target="_blank" rel="noreferrer">
          Ouvrir WhatsApp
        </a>
      </div>
    </div>
  );
}

function Proof({ id, name }: { id: string; name: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    getFile(id).then((file) => {
      if (!file || !active) return;
      objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  if (!url) return <div className="review-proof is-empty">{name || "Reçu introuvable"}</div>;
  if (name.toLowerCase().endsWith(".pdf")) {
    return (
      <a className="review-proof is-empty" href={url} target="_blank" rel="noreferrer">
        Reçu PDF · ouvrir ↗
      </a>
    );
  }
  return (
    <a className="review-proof" href={url} target="_blank" rel="noreferrer" title="Voir le reçu en grand">
      <img src={url} alt={`Reçu : ${name}`} />
      <span>Agrandir ↗</span>
    </a>
  );
}

export function PaymentPanel() {
  const { db, setPackPrice, setBank } = useApp();
  const [error, setError] = useState("");
  return (
    <section className="grid gap-4">
      <h2 className="font-display text-2xl">Packs et RIB</h2>
      <p className="text-sm text-[var(--ink-soft)]">Les montants et les RIB affichés au visiteur. Remplace les RIB de démonstration par les tiens.</p>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {db.packs.map((pack) => (
        <PackPrice key={pack.id} id={pack.id} nom={pack.nom} prix={pack.prixMad} duree={pack.duree} perimetre={pack.perimetre} onSave={(prix, duree, perimetre) => {
          const result = setPackPrice(pack.id, prix, duree, perimetre);
          setError(result.ok ? "" : result.error);
        }} />
      ))}
      {db.banks.map((bank) => (
        <BankForm
          key={bank.id}
          id={bank.id}
          nom={bank.nom}
          titulaire={bank.titulaire}
          rib={bank.rib}
          consigne={bank.consigne}
          onSave={(titulaire, rib, consigne) => {
            const result = setBank(bank.id, titulaire, rib, consigne);
            setError(result.ok ? "" : result.error);
          }}
        />
      ))}
    </section>
  );
}

function PackPrice({ id, nom, prix, duree, perimetre, onSave }: { id: string; nom: string; prix: number; duree: string; perimetre: string; onSave: (prix: number, duree: string, perimetre: string) => void }) {
  const [value, setValue] = useState(String(prix));
  const [span, setSpan] = useState(duree);
  const [scope, setScope] = useState(perimetre);
  return (
    <form className="card grid gap-2 p-4" onSubmit={(event) => { event.preventDefault(); onSave(Number(value), span, scope); }}>
      <label className="grid gap-1 text-sm">
        {nom}
        <input className="field w-36" inputMode="numeric" aria-label={`Prix ${id}`} value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        Durée d'accès
        <input className="field" value={span} placeholder="Laisser vide si elle n'est pas définie" onChange={(event) => setSpan(event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        Périmètre
        <input className="field" value={scope} placeholder="Laisser vide si le périmètre n'est pas défini" onChange={(event) => setScope(event.target.value)} />
      </label>
      <button className="btn btn-soft w-fit" type="submit">Enregistrer</button>
    </form>
  );
}

function BankForm({
  id, nom, titulaire, rib, consigne, onSave,
}: {
  id: BankId;
  nom: string;
  titulaire: string;
  rib: string;
  consigne: string;
  onSave: (titulaire: string, rib: string, consigne: string) => void;
}) {
  const [holder, setHolder] = useState(titulaire);
  const [account, setAccount] = useState(rib);
  const [note, setNote] = useState(consigne);
  return (
    <form className="card grid gap-2 p-4" onSubmit={(event) => { event.preventDefault(); onSave(holder, account, note); }}>
      <h3 className="font-display text-xl">{nom}</h3>
      <input className="field" aria-label={`Titulaire ${id}`} value={holder} onChange={(event) => setHolder(event.target.value)} />
      <input className="field font-mono" aria-label={`RIB ${id}`} value={account} onChange={(event) => setAccount(event.target.value)} />
      <input className="field" aria-label={`Consigne ${id}`} value={note} onChange={(event) => setNote(event.target.value)} />
      <button className="btn btn-soft w-fit" type="submit">Enregistrer</button>
    </form>
  );
}

export function PublishPanel() {
  const { db, parts, addVideo, removeVideo } = useApp();
  const targets = parts.flatMap((part) => {
    const items = db.lessons.filter((item) => item.partId === part.id).sort((a, b) => a.ordre - b.ordre);
    if (isStory(part.code)) {
      const host = items[0];
      return host ? [{ id: host.id, part: part.titre, label: `${part.titre} · une vidéo, un PDF` }] : [];
    }
    return items.map((item) => ({ id: item.id, part: part.titre, label: `${item.code} · ${item.titre}` }));
  });
  const [lessonId, setLessonId] = useState(targets[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const lesson = db.lessons.find((item) => item.id === lessonId);
  const video = db.videos.find((item) => item.lessonId === lessonId);
  const story = Boolean(lesson && isStory(parts.find((item) => item.id === lesson.partId)?.code || ""));

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="font-display text-2xl">Publier une vidéo et un document</h2>
        <p className="text-sm text-[var(--ink-soft)]">La Boîte, Antigone et Le Dernier Jour ont une seule vidéo et un seul PDF. L'élève les trouve à l'entrée de l'histoire, après que tu lui as ouvert l'accès. Chaque autre leçon garde les siens.</p>
      </div>
      <label className="grid gap-1 text-sm">
        Leçon
        <select className="field" value={lessonId} onChange={(event) => setLessonId(event.target.value)}>
          {parts.map((part) => (
            <optgroup key={part.id} label={part.titre}>
              {targets.filter((item) => item.part === part.titre).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <article className="card grid gap-2 p-4">
        <h3 className="font-display text-xl">Vidéo</h3>
        <p className="text-sm text-[var(--ink-soft)]">{video ? video.nom : story ? "Aucune vidéo pour cette histoire." : "Aucune vidéo pour cette leçon."}</p>
        <input className="field" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {notice && <p className="text-sm text-[var(--blue)]">{notice}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              if (!file || !lesson) {
                setError("Choisis une vidéo.");
                return;
              }
              const result = await addVideo(lesson.id, file);
              if (!result.ok) {
                setNotice("");
                setError(result.error);
                return;
              }
              setError("");
              setNotice(`${lesson.code} est en ligne.`);
              setFile(null);
            }}
          >
            Publier la vidéo
          </button>
          {video && (
            <button type="button" className="btn btn-ghost" onClick={() => removeVideo(lessonId)}>
              Retirer la vidéo
            </button>
          )}
        </div>
      </article>
      {lesson && <PdfBox lessonId={lesson.id} story={story} />}
    </section>
  );
}

export function PdfBox({ lessonId, story = false }: { lessonId: string; story?: boolean }) {
  const { db, addPdf, removePdf, feedAgent } = useApp();
  const [titre, setTitre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const docs = db.pdfs.filter((pdf) => pdf.lessonId === lessonId);

  return (
    <section className="card grid gap-2 p-4">
      <h3 className="font-display text-xl">{story ? "PDF de l'histoire" : "Document de la leçon"}</h3>
      <ul className="grid gap-1 text-sm">
        {docs.map((pdf) => (
          <li key={pdf.id} className="flex items-center justify-between gap-2">
            <span>{pdf.titre}</span>
            <button type="button" className="btn btn-ghost h-11 min-h-11" onClick={() => removePdf(pdf.id)}>Retirer</button>
          </li>
        ))}
      </ul>
      <input className="field" placeholder="Titre du PDF" value={titre} onChange={(event) => setTitre(event.target.value)} />
      <input className="field" type="file" accept="application/pdf,.doc,.docx,image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {notice && <p className="text-sm text-[var(--blue)]">{notice}</p>}
      <button
        type="button"
        className="btn btn-primary w-fit"
        onClick={async () => {
          if (!file) {
            setError("Choisis un PDF.");
            return;
          }
          const result = await addPdf(lessonId, titre || file.name, file);
          if (!result.ok) {
            setNotice("");
            setError(result.error);
            return;
          }
          const name = titre || file.name;
          let fed = false;
          if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
            try {
              const extracted = await readPdfText(file);
              if (extracted.length >= 8) {
                const given = feedAgent({ lessonId, kind: "cours", titre: name, texte: extracted, pdfId: result.id });
                fed = given.ok;
              }
            } catch {
              fed = false;
            }
          }
          setError("");
          setNotice(fed ? "Document publié. L'agent a le texte." : "Document publié. Colle le texte dans l'onglet Agent : ce fichier n'a pas de texte lisible.");
          setTitre("");
          setFile(null);
        }}
      >
        Publier le document
      </button>
    </section>
  );
}
