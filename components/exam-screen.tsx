"use client";

import Link from "next/link";
import { useState } from "react";
import { examFor } from "@/lib/exams";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export function ExamScreen({ code }: { code: string }) {
  const { student, parts } = useApp();
  const { t, examTitle, arrow, work } = useI18n();
  const part = parts.find((item) => item.code.toLowerCase() === code.toLowerCase());
  const exam = examFor(code);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!part || !exam) {
    return (
      <div className="grid gap-3">
        <h1 className="font-display text-4xl">{t.examMissing}</h1>
        <Link href="/livre" className="btn btn-primary w-fit">{t.backBook}</Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="grid max-w-xl gap-3">
        <Link href={`/livre/${part.code.toLowerCase()}`} className="text-sm text-[var(--blue)] no-underline">{arrow(true)} {work(part.code, part.titre, part.auteur, part.type).titre}</Link>
        <h1 className="font-display text-4xl">{examTitle(part.code, exam.title)}</h1>
        <p className="text-[var(--ink-soft)]">{t.examSignup}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/inscription" className="btn btn-yellow">{t.join}</Link>
          <Link href="/connexion" className="btn btn-ghost">{t.haveAccess}</Link>
        </div>
      </div>
    );
  }

  if (student.acces === "chapitre") {
    return (
      <div className="grid max-w-xl gap-3">
        <Link href={`/livre/${part.code.toLowerCase()}`} className="text-sm text-[var(--blue)] no-underline">{arrow(true)} {work(part.code, part.titre, part.auteur, part.type).titre}</Link>
        <h1 className="font-display text-4xl">{examTitle(part.code, exam.title)}</h1>
        <p className="text-[var(--ink-soft)]">{t.examLocked}</p>
        <Link href="/inscription" className="btn btn-yellow w-fit">{t.payNext}</Link>
      </div>
    );
  }

  const question = exam.questions[index];
  const finished = done || !question;

  return (
    <div className="grid max-w-2xl gap-5">
      <header className="grid gap-2">
        <Link href={`/livre/${part.code.toLowerCase()}`} className="text-sm no-underline" style={{ color: part.couleur }}>{arrow(true)} {work(part.code, part.titre, part.auteur, part.type).titre}</Link>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">{t.examLabel}</p>
        <h1 className="font-display text-4xl text-balance">{examTitle(part.code, exam.title)}</h1>
        <p className="text-[var(--ink-soft)]">{exam.intro}</p>
      </header>

      {finished ? (
        <section className="card grid gap-3 p-5">
          <h2 className="font-display text-3xl">{score} {t.of} {exam.questions.length}</h2>
          <p className="text-[var(--ink-soft)]">
            {score === exam.questions.length ? t.perfect : t.again}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setIndex(0);
                setPicked(null);
                setScore(0);
                setDone(false);
              }}
            >
              {t.restart}
            </button>
            <Link href={`/livre/${part.code.toLowerCase()}`} className="btn btn-ghost">{t.backChapters}</Link>
          </div>
        </section>
      ) : (
        <section className="grid gap-4">
          <p className="font-mono text-sm text-[var(--ink-soft)]">{t.question} {index + 1} / {exam.questions.length}</p>
          <h2 className="font-display text-2xl text-balance">{question.prompt}</h2>
          <ul className="grid gap-2">
            {question.choices.map((choice) => {
              const selected = picked === choice.id;
              const right = choice.id === question.answer;
              let tone = "border-[var(--line)] bg-[var(--paper-2)]";
              if (picked && right) tone = "border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_12%,var(--paper))]";
              else if (selected && !right) tone = "border-[var(--danger)] bg-[var(--paper-2)]";
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    disabled={picked !== null}
                    className={`w-full rounded-[14px] border px-4 py-3 text-start ${tone}`}
                    onClick={() => {
                      setPicked(choice.id);
                      if (choice.id === question.answer) setScore((value) => value + 1);
                    }}
                  >
                    {choice.label}
                  </button>
                </li>
              );
            })}
          </ul>
          {picked && (
            <div className="grid gap-3">
              <p className={`whitespace-pre-wrap rounded-[14px] bg-[var(--paper-2)] px-4 py-3 text-sm ${picked === question.answer ? "answer-ok" : ""}`}>
                {picked === question.answer
                  ? `${t.just} ${question.why}`
                  : `${t.notYet} ${question.choices.find((choice) => choice.id === question.answer)?.label}. ${question.why}`}
              </p>
              <button
                type="button"
                className="btn btn-primary w-fit"
                onClick={() => {
                  if (index + 1 >= exam.questions.length) setDone(true);
                  else {
                    setIndex((value) => value + 1);
                    setPicked(null);
                  }
                }}
              >
                {index + 1 >= exam.questions.length ? t.result : t.nextQ}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
