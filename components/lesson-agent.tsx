"use client";

import { FormEvent, useState } from "react";
import { askAgent } from "@/lib/agent";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export function LessonAgent({ lessonId, code }: { lessonId: string; code: string }) {
  const { db } = useApp();
  const { t } = useI18n();
  const sources = (db.agentSources ?? []).filter((item) => item.lessonId === lessonId);
  const cours = sources.filter((item) => item.kind === "cours").length;
  const corrections = sources.filter((item) => item.kind === "correction").length;
  const known = [cours ? `${cours} cours` : "", corrections ? `${corrections} correction${corrections > 1 ? "s" : ""}` : ""].filter(Boolean);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "eleve" | "agent"; text: string }[]>([]);

  const ask = (event: FormEvent) => {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "eleve", text }, { role: "agent", text: askAgent(text, sources, code) }]);
    setQuestion("");
  };

  return (
    <section className="card grid gap-3 p-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.agent}</p>
        <h2 className="font-display text-2xl">{t.askTitle}</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          {sources.length === 0 ? t.noSource : `${t.answersWith} ${known.join(" · ")}.`}
        </p>
      </div>
      {messages.length > 0 && (
        <ol className="grid gap-2">
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              className={`max-w-[38rem] whitespace-pre-wrap rounded-[14px] px-3 py-2 text-sm ${message.role === "eleve" ? "ms-auto bg-[var(--blue-fill)] text-white" : "bg-[var(--paper-2)]"}`}
            >
              {message.text}
            </li>
          ))}
        </ol>
      )}
      <form className="grid gap-2" onSubmit={ask}>
        <label className="grid gap-1 text-sm">
          {t.yourQ}
          <textarea className="field min-h-20 resize-y" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t.yourQ} />
        </label>
        <button type="submit" className="btn btn-primary w-fit">{t.ask}</button>
      </form>
    </section>
  );
}
