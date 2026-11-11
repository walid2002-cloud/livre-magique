"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { isStory } from "@/lib/access";
import { workCover } from "./part-cover";
import { formatMad } from "@/lib/offers";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { PracticeQuiz } from "@/lib/types";

export function HomeExtra({ showFree = true }: { showFree?: boolean }) {
  const { db, student, parts, askTeacher } = useApp();
  const { t, ar, work } = useI18n();
  const [question, setQuestion] = useState("");
  const [note, setNote] = useState("");
  const stories = parts.filter((part) => isStory(part.code));

  return (
    <div className="grid gap-10">
      {showFree && (
        <section id="gratuits" className="grid gap-3">
          <h2 className="section-title font-display text-3xl">{t.freeHome}</h2>
          <div className="grid gap-2">
            {stories.map((part) => {
              const lesson = db.lessons.filter((item) => item.partId === part.id).sort((a, b) => a.ordre - b.ordre)[0];
              if (!lesson) return null;
              const named = work(part.code, part.titre, part.auteur, part.type);
              return (
                <Link key={part.id} href={`/v/${lesson.slug}?s=code`} className="card go-card flex items-center gap-4 p-3 no-underline text-[var(--ink)]">
                  {workCover(part.code) && <img src={workCover(part.code)} alt="" className="free-thumb" />}
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{named.titre}</span>
                    <span className="text-sm text-[var(--ink-soft)]">{lesson.code} · {named.auteur}</span>
                  </span>
                  <span className="go-label text-sm font-semibold text-[var(--blue)]">
                    <span className="go-text">{t.readFree} </span><span className="go-arrow" aria-hidden>{ar ? "←" : "→"}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section id="formules" className="grid gap-3">
        <h2 className="section-title font-display text-3xl">{t.plansTitle}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {db.packs.filter((pack) => pack.actif).map((pack) => {
            const full = pack.id !== "pack_videos";
            const rows: [string, boolean][] = [
              [t.rowFree, true],
              [t.rowVideos, true],
              [t.rowPdf, full],
            ];
            return (
              <article key={pack.id} className={`card plan-card grid content-start gap-3 p-5 ${full ? "is-full" : ""}`}>
                <h3 className="font-display text-2xl">{pack.nom}</h3>
                <p className="font-display text-4xl">{formatMad(pack.prixMad)}</p>
                <p className="text-sm text-[var(--ink-soft)]">{full ? t.packFullDetail : t.packVideosDetail}</p>
                <ul className="grid gap-1.5 text-sm">
                  {rows.map(([label, yes]) => (
                    <li key={label} className={`plan-row ${yes ? "" : "is-off"}`}>
                      <span aria-hidden>{yes ? "✓" : "—"}</span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                {pack.duree ? <p className="text-sm">{pack.duree}</p> : null}
                {pack.perimetre ? <p className="text-sm">{pack.perimetre}</p> : null}
                <Link href="/inscription" className="btn btn-primary w-fit">{t.choosePlan}</Link>
              </article>
            );
          })}
        </div>
      </section>

      <PracticeBlocks />
      <Paths />

      {db.studio.questionsOuvertes && (
        <section className="card grid gap-3 p-4">
          <h2 className="font-display text-2xl">{t.teacherAsk}</h2>
          <p className="text-sm text-[var(--ink-soft)]">{t.teacherHint}</p>
          {student ? (
            <form
              className="grid gap-2"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                const result = askTeacher(question);
                setNote(result.ok ? t.teacherThanks : result.error);
                if (result.ok) setQuestion("");
              }}
            >
              <textarea className="field min-h-28" value={question} onChange={(event) => setQuestion(event.target.value)} />
              <button type="submit" className="btn btn-primary w-fit">{t.teacherSend}</button>
              {note && <p className="text-sm">{note}</p>}
            </form>
          ) : (
            <Link href="/connexion" className="btn btn-soft w-fit">{t.enter}</Link>
          )}
          {student && db.studio.questions.filter((item) => item.studentId === student.id && item.reponse).map((item) => (
            <article key={item.id} className="rounded-2xl bg-[var(--paper)] p-3 text-sm">
              <p>{item.texte}</p>
              <p className="mt-2 text-[var(--ink-soft)]">{item.reponse}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function PracticeBlocks() {
  const { db } = useApp();
  const teste = db.studio.quizzes.find((quiz) => quiz.kind === "teste" && quiz.questions.length > 0);
  const defi = db.studio.quizzes.find((quiz) => quiz.kind === "defi" && quiz.questions.length >= 5);
  const exam = db.studio.quizzes.find((quiz) => quiz.kind === "decouverte" && quiz.questions.length > 0);
  const day = defi ? pick(defi, 5) : null;
  return (
    <>
      {teste && <QuizCard quiz={teste} title="Teste-toi en 2 minutes" />}
      {day && <QuizCard quiz={day} title="Défi du jour" />}
      {exam && <QuizCard quiz={exam} title={exam.titre || "Examen de découverte"} />}
      {db.studio.mistakes.length > 0 && (
        <section className="grid gap-2">
          <h2 className="section-title font-display text-3xl">Les erreurs qui font perdre des points</h2>
          {db.studio.mistakes.map((item) => (
            <article key={item.id} className="card grid gap-1 p-4">
              <h3 className="font-medium">{item.titre}</h3>
              <p className="text-sm">{item.faux}</p>
              <p className="text-sm">{item.juste}</p>
              {item.note && <p className="text-sm text-[var(--ink-soft)]">{item.note}</p>}
            </article>
          ))}
        </section>
      )}
      {db.studio.writings.length > 0 && (
        <section className="grid gap-2">
          <h2 className="section-title font-display text-3xl">Production écrite</h2>
          {db.studio.writings.map((item) => (
            <article key={item.id} className="card grid gap-2 p-4">
              <h3 className="font-medium">{item.titre}</h3>
              <p className="whitespace-pre-wrap text-sm">{item.copie}</p>
              <p className="text-sm text-[var(--ink-soft)]">{item.commentaire}</p>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

function pick(quiz: PracticeQuiz, count: number): PracticeQuiz {
  const start = new Date().getDate() % quiz.questions.length;
  const questions = Array.from({ length: count }, (_, index) => quiz.questions[(start + index) % quiz.questions.length]);
  return { ...quiz, questions };
}

function QuizCard({ quiz, title }: { quiz: PracticeQuiz; title: string }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const question = quiz.questions[index];
  if (!question) return null;
  const right = picked === question.answer;
  return (
    <section className="card grid gap-3 p-4">
      <h2 className="font-display text-2xl">{title}</h2>
      <p>{question.prompt}</p>
      <div className="grid gap-2">
        {question.choices.map((choice, choiceIndex) => (
          <button
            key={choice}
            type="button"
            className={`rounded-[14px] border px-4 py-3 text-start ${picked !== null && choiceIndex === question.answer ? "answer-ok border-[var(--blue)]" : "border-[var(--line)]"}`}
            disabled={picked !== null}
            onClick={() => setPicked(choiceIndex)}
          >
            {choice}
          </button>
        ))}
      </div>
      {picked !== null && <p className="text-sm">{right ? "Juste." : "Pas encore."} {question.why}</p>}
      {picked !== null && index + 1 < quiz.questions.length && (
        <button type="button" className="btn btn-soft w-fit" onClick={() => { setIndex((value) => value + 1); setPicked(null); }}>Suite</button>
      )}
    </section>
  );
}

function Paths() {
  const { db } = useApp();
  const paths = useMemo(() => db.studio.paths.map((path) => ({
    ...path,
    lessons: path.codes
      .map((code) => db.lessons.find((lesson) => lesson.code.toUpperCase() === code.toUpperCase()))
      .filter((lesson) => lesson !== undefined),
  })).filter((path) => path.lessons.length > 0), [db.lessons, db.studio.paths]);
  if (paths.length === 0) return null;
  return (
    <section className="grid gap-2">
      <h2 className="section-title font-display text-3xl">Parcours de révision</h2>
      {paths.map((path) => (
        <article key={path.id} className="card grid gap-2 p-4">
          <h3 className="font-medium">{path.jours} jours</h3>
          {path.lessons.map((lesson) => (
            <Link key={lesson.id} href={`/v/${lesson.slug}?s=code`} className="text-sm text-[var(--blue)]">
              {lesson.code} · {lesson.titre}
            </Link>
          ))}
        </article>
      ))}
    </section>
  );
}
