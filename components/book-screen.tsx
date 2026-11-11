"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PartCover, workCover } from "./part-cover";
import { Player } from "./player";
import { DocReader } from "./doc-reader";
import { hasFullBook, isStory } from "@/lib/access";
import { StoryCinema, storyScene, useStoryIntro, type StoryCode } from "./story-cinema";
import { DepthBanner, DepthBook, useDepthReveal } from "./work-depth";
import { site } from "@/lib/config";
import { getFile } from "@/lib/files";
import { watermarkName } from "@/lib/format";
import { Chip, CodePill } from "./ui";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export function BookScreen() {
  const { db, student, parts } = useApp();
  const { t } = useI18n();
  const seen = new Set(db.progress.filter((item) => item.studentId === student?.id && item.vue).map((item) => item.lessonId));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--blue)]">{t.library}</p>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">{t.booksIn}</h1>
        <p className="mt-2 max-w-xl text-[var(--ink-soft)]">{t.libraryLead}</p>
      </div>
      <div className="cover-grid">
        {parts.map((part, index) => {
          const lessons = db.lessons.filter((lesson) => lesson.partId === part.id);
          const done = lessons.filter((lesson) => seen.has(lesson.id)).length;
          return <PartCover key={part.id} part={part} count={lessons.length} done={done} index={index} />;
        })}
      </div>
    </div>
  );
}

export function PartScreen({ code }: { code: string }) {
  const { db, student, parts } = useApp();
  const { t, ar, minutes, unit, work, lesson, arrow } = useI18n();
  const part = parts.find((item) => item.code.toLowerCase() === code.toLowerCase());
  const scene = part && isStory(part.code) ? storyScene(part.code) : null;
  const intro = useStoryIntro(scene ? part!.code : null);
  const depth = useDepthReveal<HTMLOListElement>();
  if (!part) {
    return (
      <div className="grid gap-3">
        <h1 className="font-display text-4xl">{t.missingPart}</h1>
        <Link href="/livre" className="btn btn-primary w-fit">{t.backBook}</Link>
      </div>
    );
  }
  const named = work(part.code, part.titre, part.auteur, part.type);
  const lessons = db.lessons.filter((lesson) => lesson.partId === part.id).sort((a, b) => a.ordre - b.ordre);
  const seen = new Set(db.progress.filter((item) => item.studentId === student?.id && item.vue).map((item) => item.lessonId));
  const names = unit(part.code);
  const story = isStory(part.code);
  const pdfIds = new Set(db.pdfs.filter((pdf) => lessons.some((lesson) => lesson.id === pdf.lessonId)).map((pdf) => pdf.lessonId));

  return (
    <div className="grid gap-5">
      {intro.play && scene && (
        <StoryCinema
          code={part.code as StoryCode}
          title={named.titre}
          author={named.auteur}
          cover={workCover(part.code)}
          onClose={intro.close}
        />
      )}
      <div inert={intro.play ? true : undefined} className="grid gap-5">
      <header className="work-head flex flex-wrap items-end gap-4">
        {workCover(part.code) && <DepthBook src={workCover(part.code)!} color={part.couleur} />}
        <div className="grid min-w-0 flex-1 gap-2">
          <Link href="/livre" className="text-sm text-[var(--blue)] no-underline">{arrow(true)} {t.backTo}</Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: part.couleur }}>{named.type} · {named.auteur}</p>
          <h1 className="font-display text-4xl text-balance md:text-5xl">{named.titre}</h1>
          <p className="max-w-xl text-[var(--ink-soft)]">
            {lessons.length} {names.many}, {t.pagesFrom} {part.pageDebut} {t.pagesTo} {part.pageFin}. {story ? `${ar ? `افهم ${named.titre} خطوة بخطوة.` : `Comprends ${named.titre}, étape par étape.`} ${t.storyPitch}` : `${t.inEach} ${names.bare}, ${t.together}`}
          </p>
          {scene && (
            <button type="button" className="btn btn-ghost w-fit" onClick={intro.replay}>{t.replayIntro}</button>
          )}
        </div>
      </header>
      {scene && <DepthBanner code={part.code as StoryCode} />}
      {story && lessons[0] && !hasFullBook(student) && (
        <div className="flex flex-wrap gap-2">
          <Link href={`/v/${lessons[0].slug}?s=code`} className="btn btn-yellow">{t.readFree}</Link>
          <Link href="/inscription" className="btn btn-primary">{t.discoverPlans}</Link>
        </div>
      )}
      {story && lessons[0] && <StoryDesk host={lessons[0]} color={part.couleur} title={named.titre} />}
      <ol ref={depth.ref} className="depth-list grid gap-2">
        {lessons.map((item, index) => {
          const vue = seen.has(item.id);
          const soon = item.statut === "a_tourner";
          const hasPdf = pdfIds.has(item.id);
          const pdfPlace = names.one === "Leçon" || names.one === "الدرس" ? t.pdfLesson : names.one === "Sujet" || names.one === "الموضوع" ? t.pdfSubject : t.pdfChapter;
          return (
            <li key={item.id} className="reveal is-in" style={{ "--d": `${index * 40}ms` } as React.CSSProperties}>
              <Link href={`/v/${item.slug}?s=code`} className="grid gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--paper-2)] p-3 no-underline text-[var(--ink)] sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <span className="w-2 self-stretch rounded-full" style={{ background: part.couleur }} />
                <span className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: part.couleur }}>{names.one} {index + 1}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <CodePill code={item.code} color={part.couleur} tint={part.teinte} />
                    <span className="font-medium">{lesson(item.titre)}</span>
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ink-soft)]">
                    p. {item.page}{story ? ` · ${t.resumeShort}` : ` · ${minutes(item.dureeS)} · ${soon ? t.videoSoon : t.video} · ${hasPdf ? t.pdfIn : pdfPlace}`}
                  </span>
                </span>
                <Chip color={!story && (soon || (!hasFullBook(student) && index > 0)) ? undefined : vue || (story && index === 0) || (!story && index === 0) ? part.couleur : undefined}>
                  {story
                    ? !hasFullBook(student) ? (index === 0 ? t.free : <span className="inline-flex items-center gap-1">{t.inFormula} <span aria-hidden className="text-xs">🔒</span></span>) : vue ? t.seen : t.toSee
                    : soon ? t.toShoot : !hasFullBook(student) ? (index === 0 ? t.free : <span className="inline-flex items-center gap-1">{t.inFormula} <span aria-hidden className="text-xs">🔒</span></span>) : vue ? t.seen : t.toSee}
                </Chip>
              </Link>
            </li>
          );
        })}
      </ol>
      <Link href={`/livre/${part.code.toLowerCase()}/examen`} className="card grid gap-1 p-4 no-underline text-[var(--ink)]">
        <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: part.couleur }}>{t.atEnd}</span>
        <span className="font-display text-2xl">{t.examAll}</span>
        <span className="text-sm text-[var(--ink-soft)]">{t.examHint}</span>
      </Link>
      </div>
    </div>
  );
}

function StoryDesk({
  host,
  color,
  title,
}: {
  host: { id: string; code: string; dureeS: number; statut: string };
  color: string;
  title: string;
}) {
  const { db, student, rememberProgress } = useApp();
  const { t } = useI18n();
  const open = hasFullBook(student);
  const paid = db.enrollments.find((item) => item.studentId === student?.id && item.statut === "valide");
  const pdfsOpen = open && paid?.packId !== "pack_videos";
  const video = db.videos.find((item) => item.lessonId === host.id);
  const videoId = video?.id;
  const pdfs = db.pdfs.filter((item) => item.lessonId === host.id);
  const pending = db.enrollments.some((item) => item.studentId === student?.id && item.statut === "en_attente");
  const progress = db.progress.find((item) => item.studentId === student?.id && item.lessonId === host.id);
  const watermark = student ? watermarkName(student.prenom, student.nom, student.telephone) : site.domain;
  const [videoUrl, setVideoUrl] = useState("");
  const [doc, setDoc] = useState<{ id: string; titre: string; nom: string } | null>(null);

  useEffect(() => {
    if (!open || !videoId) return;
    let objectUrl = "";
    getFile(videoId).then((file) => {
      if (!file) return;
      objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setVideoUrl("");
    };
  }, [open, videoId]);

  return (
    <section className="card grid gap-4 p-5">
      <div className="grid gap-1">
        <h2 className="font-display text-3xl">{t.storyGate}</h2>
        <p className="text-[var(--ink-soft)]">{open ? t.oneVideo : pending ? t.storyWait : t.storyGateLock}</p>
      </div>
      {open ? (
        <>
          {host.statut === "a_tourner" || !video ? (
            <p className="text-sm text-[var(--ink-soft)]">{t.noStoryVideo}</p>
          ) : (
            <div className="player-glow">
              <Player
                key={host.id}
                durationS={host.dureeS}
                startS={progress && host.dureeS - progress.positionS > 8 ? progress.positionS : 0}
                mode="full"
                watermark={watermark}
                title={title}
                code={host.code}
                color={color}
                src={videoUrl || undefined}
                onProgress={(position) => rememberProgress(host.id, position)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <h3 className="font-display text-2xl">{t.thePdf}</h3>
            {!pdfsOpen ? (
              <p className="text-sm text-[var(--ink-soft)]">{t.pdfFormula}</p>
            ) : pdfs.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)]">{t.noStoryPdf}</p>
            ) : (
              pdfs.map((pdf) => (
                <button key={pdf.id} type="button" className="btn btn-soft w-fit" onClick={() => setDoc(pdf)}>
                  {t.read} · {pdf.titre}
                </button>
              ))
            )}
            {pdfsOpen && <p className="text-sm text-[var(--ink-soft)]">{t.noDownload}</p>}
          </div>
          {doc && <DocReader id={doc.id} titre={doc.titre} nom={doc.nom} watermark={watermark} onClose={() => setDoc(null)} />}
        </>
      ) : pending ? null : (
        <Link href="/inscription" className="btn btn-primary w-fit">{student ? t.payEnter : t.join}</Link>
      )}
    </section>
  );
}
