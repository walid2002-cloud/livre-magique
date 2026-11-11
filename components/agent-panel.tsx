"use client";

import { useState } from "react";
import { readPdfText } from "@/lib/pdf-text";
import { useApp } from "@/lib/store";
import type { AgentKind } from "@/lib/types";

export function AgentPanel() {
  const { db, parts, feedAgent, dropAgentSource } = useApp();
  const [lessonId, setLessonId] = useState(db.lessons[0]?.id ?? "");
  const [kind, setKind] = useState<AgentKind>("cours");
  const [titre, setTitre] = useState("");
  const [texte, setTexte] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reading, setReading] = useState(false);
  const lesson = db.lessons.find((item) => item.id === lessonId);
  const sources = (db.agentSources ?? []).filter((item) => item.lessonId === lessonId);

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="font-display text-2xl">Nourrir l&apos;agent</h2>
        <p className="text-sm text-[var(--ink-soft)]">Il répond aux élèves avec le texte des PDF et des corrections que tu déposes ici.</p>
      </div>
      <label className="grid gap-1 text-sm">
        Leçon
        <select className="field" value={lessonId} onChange={(event) => setLessonId(event.target.value)}>
          {parts.map((part) => (
            <optgroup key={part.id} label={part.titre}>
              {db.lessons.filter((item) => item.partId === part.id).map((item) => (
                <option key={item.id} value={item.id}>{item.code} · {item.titre}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`btn ${kind === "cours" ? "btn-primary" : "btn-soft"}`} onClick={() => setKind("cours")}>Cours, PDF</button>
        <button type="button" className={`btn ${kind === "correction" ? "btn-primary" : "btn-soft"}`} onClick={() => setKind("correction")}>Correction</button>
      </div>
      <article className="card grid gap-2 p-4">
        <label className="grid gap-1 text-sm">
          Titre
          <input className="field" value={titre} onChange={(event) => setTitre(event.target.value)} placeholder={kind === "correction" ? "Corrigé BAM-01" : "Fiche du cours"} />
        </label>
        <label className="grid gap-1 text-sm">
          PDF
          <input
            className="field"
            type="file"
            accept="application/pdf"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setReading(true);
              setError("");
              try {
                const extracted = await readPdfText(file);
                if (extracted.length < 8) {
                  setError("Ce PDF n'a pas de texte à copier. Colle la correction à la main.");
                } else {
                  setTexte(extracted);
                  if (!titre.trim()) setTitre(file.name.replace(/\.pdf$/i, ""));
                  setNotice("Texte lu. Vérifie-le, puis enregistre.");
                }
              } catch {
                setError("Ce PDF n'a pas pu être lu. Colle le texte à la main.");
              } finally {
                setReading(false);
              }
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          Texte que l&apos;agent connaît
          <textarea className="field min-h-36 resize-y" value={texte} onChange={(event) => setTexte(event.target.value)} placeholder="Colle ici le cours ou la correction." />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {notice && <p className="text-sm text-[var(--blue)]">{notice}</p>}
        <button
          type="button"
          className="btn btn-primary w-fit"
          disabled={reading}
          onClick={() => {
            const result = feedAgent({ lessonId, kind, titre, texte, pdfId: null });
            if (!result.ok) {
              setNotice("");
              setError(result.error);
              return;
            }
            setError("");
            setNotice(result.truncated ? `${lesson?.code ?? "La leçon"} : les 20 000 premiers caractères sont dans l'agent.` : `${lesson?.code ?? "La leçon"} : l'agent a ce texte.`);
            setTitre("");
            setTexte("");
          }}
        >
          {reading ? "Lecture du PDF…" : "Enregistrer dans l'agent"}
        </button>
      </article>
      <ul className="grid gap-2">
        {sources.length === 0 && <li className="text-sm text-[var(--ink-soft)]">Rien pour cette leçon.</li>}
        {sources.map((source) => (
          <li key={source.id} className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--line)] px-3 py-2">
            <span className="grid">
              <span className="text-sm font-semibold">{source.kind === "correction" ? "Correction" : "Cours"} · {source.titre}</span>
              <span className="text-sm text-[var(--ink-soft)]">{source.texte.length.toLocaleString("fr-FR")} caractères</span>
            </span>
            <button type="button" className="btn btn-ghost h-11 min-h-11" onClick={() => dropAgentSource(source.id)}>Retirer</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
