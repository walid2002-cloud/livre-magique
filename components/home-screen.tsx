"use client";

import Link from "next/link";
import { CodeForm } from "./code-form";
import { MagicBook } from "./magic-book";
import { PartCover } from "./part-cover";
import { Reveal } from "./reveal";
import { HomeExtra } from "./home-extra";
import { ShareButton } from "./share-button";
import { SupportBlock } from "./support";
import { Bar } from "./ui";
import { formatClock } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export function HomeScreen() {
  const { db, student, parts } = useApp();
  const { t, minutes, ago, seenCount, lesson, work } = useI18n();

  const now = new Date().toISOString();
  const hour = new Date().getHours();
  const hello = hour >= 18 ? t.evening : t.morning;
  const seen = new Set(db.progress.filter((item) => item.studentId === student?.id && item.vue).map((item) => item.lessonId));
  const resume = db.progress
    .filter((item) => item.studentId === student?.id)
    .sort((a, b) => b.majLe.localeCompare(a.majLe))[0];
  const resumeLesson = resume ? db.lessons.find((lesson) => lesson.id === resume.lessonId) : null;
  const firstUnseen = [...db.lessons].sort((a, b) => a.ordre - b.ordre).find((lesson) => !seen.has(lesson.id) && lesson.statut === "en_ligne");
  const fresh = [...db.lessons]
    .filter((lesson) => lesson.statut === "en_ligne" && lesson.miseEnLigneLe)
    .sort((a, b) => (b.miseEnLigneLe || "").localeCompare(a.miseEnLigneLe || ""))
    .slice(0, 4);
  const total = db.lessons.length;
  const name = student?.prenom?.trim() || "";
  const resumePart = parts.find((part) => part.id === resumeLesson?.partId);

  if (!student) {
    return (
      <div className="grid gap-14">
        <section className="hero-grid">
          <div className="grid content-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--blue)]">{t.level}</p>
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-balance md:text-6xl">{t.heroTitle}</h1>
            <p className="max-w-xl text-lg">{t.heroPromise}</p>
            <p className="max-w-xl text-[var(--ink-soft)]">{t.heroPresent}</p>
            <div className="flex flex-wrap gap-2">
              <a href="#gratuits" className="btn btn-yellow">{t.discoverFree}</a>
              <a href="#formules" className="btn btn-primary">{t.seePlans}</a>
              <ShareButton path="/" text={t.shareSite} />
            </div>
            <nav className="jump-row" aria-label={t.home}>
              <a href="#gratuits">{t.jumpFree}</a>
              <a href="#couvertures">{t.jumpProgram}</a>
              <a href="#formules">{t.jumpPlans}</a>            </nav>
          </div>
          <div className="hero-book">
            <MagicBook />
          </div>
        </section>

        <HomeExtra />

        <section id="couvertures" className="grid gap-4">
          <h2 className="section-title font-display text-3xl">{t.sixCovers}</h2>
          <p className="text-[var(--ink-soft)]">{total} {t.programNote}</p>
          <div className="cover-grid">
            {parts.map((part, index) => {
              const lessons = db.lessons.filter((lesson) => lesson.partId === part.id);
              return (
                <Reveal key={part.id} delay={index * 70}>
                  <PartCover part={part} count={lessons.length} done={0} index={index} />
                </Reveal>
              );
            })}
          </div>
        </section>

      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <Reveal>
        <p className="text-[var(--blue)]">{hello}{name ? `, ${name}` : ""}</p>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">{student.acces === "chapitre" ? t.chapterOpen : t.bookOpen}</h1>
        <p className="text-[var(--ink-soft)]">{student.acces === "chapitre" ? t.chapterHint : seenCount(seen.size, total)}</p>
      </Reveal>

      {resume && resumeLesson ? (
        <Reveal>
          <Link href={`/v/${resumeLesson.slug}?s=code`} className="card grid gap-4 p-4 no-underline text-[var(--ink)] md:grid-cols-[180px_1fr] md:p-5">
            <span className="resume-thumb grid min-h-28 place-items-center rounded-2xl">
              <i className="resume-mark" style={{ background: resumePart?.couleur || "var(--blue)" }} />
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--blue-fill)] text-white">▶</span>
            </span>
            <span className="grid content-center gap-2">
              <span className="bookmark">{t.here}</span>
              <span className="text-sm text-[var(--ink-soft)]">{t.resume}</span>
              <span className="font-display text-2xl">{lesson(resumeLesson.titre)}</span>
              <span className="font-mono text-sm text-[var(--blue)]">
                {resumeLesson.code} · p. {resumeLesson.page} · {formatClock(resume.positionS)} / {minutes(resumeLesson.dureeS)}
              </span>
              <Bar value={(resume.positionS / resumeLesson.dureeS) * 100} />
            </span>
          </Link>
        </Reveal>
      ) : firstUnseen ? (
        <Reveal>
          <Link href={`/v/${firstUnseen.slug}?s=code`} className="card flex items-center justify-between gap-3 p-4 no-underline text-[var(--ink)]">
            <span>
              <span className="text-sm text-[var(--blue)]">{t.startHere}</span>
              <span className="block font-display text-2xl">{firstUnseen.code} · {lesson(firstUnseen.titre)}</span>
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--blue-fill)] text-white">▶</span>
          </Link>
        </Reveal>
      ) : null}

      <section className="max-w-md">
        <p className="mb-2 text-sm text-[var(--ink-soft)]">{t.codeVideo}</p>
        <CodeForm compact />
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-2xl">{t.sixParts}</h2>
        <div className="cover-grid">
          {parts.map((part, index) => {
            const lessons = db.lessons.filter((lesson) => lesson.partId === part.id);
            const done = lessons.filter((lesson) => seen.has(lesson.id)).length;
            return <PartCover key={part.id} part={part} count={lessons.length} done={done} index={index} />;
          })}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-2xl">{t.latest}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {fresh.map((item, index) => {
            const part = parts.find((entry) => entry.id === item.partId);
            return (
              <Reveal key={item.id} delay={index * 60}>
                <Link href={`/v/${item.slug}?s=code`} className="grid grid-cols-[72px_1fr] items-center gap-3 no-underline text-[var(--ink)]">
                  <span className="with-stripes grid h-[72px] place-items-center rounded-[14px] font-mono text-xs font-semibold text-white" style={{ backgroundColor: part?.couleur }}>
                    {item.code}
                  </span>
                  <span>
                    <span className="block font-medium">{lesson(item.titre)}</span>
                    <span className="text-sm text-[var(--ink-soft)]">{part ? work(part.code, part.titre, part.auteur, part.type).titre : ""} · {item.miseEnLigneLe ? ago(item.miseEnLigneLe, now) : ""}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <p className="max-w-xl text-sm text-[var(--ink-soft)]">{t.browserNote}</p>
      <HomeExtra showFree={student.acces === "chapitre"} />
      <SupportBlock />
    </div>
  );
}
