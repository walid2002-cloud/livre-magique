"use client";

import { noteFor } from "@/lib/chapter-notes";
import { useI18n } from "@/lib/i18n";

export function ChapterNotes({ code, watermark = "" }: { code: string; watermark?: string }) {
  const { t } = useI18n();
  const note = noteFor(code);
  if (!note) return <p className="text-[var(--ink-soft)]">{t.summaryMissing}</p>;
  return (
    <div className="grid gap-4">
      {watermark && <p className="text-xs text-[var(--ink-soft)]">{watermark}</p>}
      <section className="card grid gap-3 p-5" dir="ltr" lang="fr">
        <h2 className="font-display text-2xl">{t.resumeTitle}</h2>
        <p className="text-base leading-relaxed">{note.fr}</p>
      </section>
      <section className="card grid gap-3 p-5" dir="rtl" lang="ar">
        <h2 className="font-display text-2xl">{t.resumeArTitle}</h2>
        <p className="text-base leading-relaxed">{note.ar}</p>
      </section>
      <section className="grid gap-2">
        <h2 className="font-display text-2xl">{t.figuresTitle}</h2>
        <ul className="grid gap-2">
          {note.figures.map((figure) => (
            <li key={figure.nom} className="card grid gap-2 p-4">
              <p className="font-semibold text-[var(--blue)]" dir="ltr" lang="fr">{figure.nom}</p>
              <p className="font-semibold text-[var(--blue)]" dir="rtl" lang="ar">{figure.nomAr}</p>
              <p className="leading-relaxed" dir="ltr" lang="fr">{figure.fr}</p>
              <p className="leading-relaxed" lang="ar" dir="rtl">{figure.ar}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
