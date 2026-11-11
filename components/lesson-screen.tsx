"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChapterNotes } from "./chapter-notes";
import { ShareButton } from "./share-button";
import { LessonAgent } from "./lesson-agent";
import { Player } from "./player";
import { site } from "@/lib/config";
import { DocReader } from "@/components/doc-reader";
import { getFile } from "@/lib/files";
import { hasFullBook, isOpeningChapter, isStory } from "@/lib/access";
import { formatClock, watermarkName } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";

const visitToken = Math.random().toString(36).slice(2);

export function LessonScreen({ slug }: { slug: string }) {
  const params = useSearchParams();
  const source = params.get("s") === "qr" ? "qr" : "code";
  const { db, student, parts, deviceId, rememberProgress, track } = useApp();
  const { t, minutes, unit, lesson: lessonName, arrow, work } = useI18n();
  const lesson = db.lessons.find((item) => item.slug === slug);
  const [listOpen, setListOpen] = useState(false);
  const [marked, setMarked] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const partOfLesson = lesson ? parts.find((item) => item.id === lesson.partId) : undefined;
  const story = Boolean(partOfLesson && isStory(partOfLesson.code));
  const opening = lesson ? isOpeningChapter(lesson, db.lessons) : false;
  const host = story
    ? db.lessons.filter((item) => item.partId === lesson?.partId).sort((a, b) => a.ordre - b.ordre)[0]
    : lesson;
  const showVideo = !story;
  const videoId = showVideo && host ? db.videos.find((item) => item.lessonId === host.id)?.id : undefined;
  const canPlay = Boolean(student) && showVideo && host?.statut !== "a_tourner" && (hasFullBook(student) || opening);

  useEffect(() => {
    if (!videoId || !canPlay) return;
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
  }, [canPlay, videoId]);

  useEffect(() => {
    if (!lesson) return;
    const kind = source === "qr" ? "scan_qr" : "code_saisi";
    track(kind, lesson.id, `${kind}_${lesson.id}_${deviceId}_${visitToken}`);
    if (student && lesson.statut === "en_ligne") {
      track("lecture", lesson.id, `lecture_${lesson.id}_${deviceId}_${visitToken}`);
    }
  }, [deviceId, lesson, source, student, track]);

  if (!lesson) {
    return (
      <div className="grid gap-3">
        <h1 className="font-display text-4xl">{t.missing}</h1>
        <p className="text-[var(--ink-soft)]">{t.codeUnder}</p>
        <Link href="/" className="btn btn-primary w-fit">{t.backHome}</Link>
      </div>
    );
  }

  const part = parts.find((item) => item.id === lesson.partId);
  const siblings = db.lessons.filter((item) => item.partId === lesson.partId).sort((a, b) => a.ordre - b.ordre);
  const index = siblings.findIndex((item) => item.id === lesson.id);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const videoLesson = host ?? lesson;
  const progress = db.progress.find((item) => item.studentId === student?.id && item.lessonId === videoLesson.id);
  const chapterProgress = db.progress.find((item) => item.studentId === student?.id && item.lessonId === lesson.id);
  const soon = videoLesson.statut === "a_tourner";
  const chapterOpen = Boolean(student) && lesson.statut !== "a_tourner" && (hasFullBook(student) || opening);
  const enrollment = db.enrollments.find((item) => item.studentId === student?.id && item.statut === "valide");
  const pdfsOpen = chapterOpen && (opening || enrollment?.packId !== "pack_videos");
  const docs = db.pdfs.filter((pdf) => pdf.lessonId === (story ? videoLesson.id : lesson.id));
  const watermark = student ? watermarkName(student.prenom, student.nom, student.telephone) : `Aperçu · ${site.domain}`;
  const seen = Boolean(chapterProgress?.vue || marked);
  const names = unit(part?.code || "BAM");
  const named = part ? work(part.code, part.titre, part.auteur, part.type) : null;
  const chapter = `${names.one} ${index + 1}`;

  return (
    <article className="lesson-layout">
      <div className="grid gap-4">
        <header className="grid gap-1">
          {part && (
            <Link href={`/livre/${part.code.toLowerCase()}`} className="text-sm no-underline" style={{ color: part.couleur }}>
              {part.titre}
            </Link>
          )}
          <p className="font-mono text-sm text-[var(--blue)]">{chapter} · {lesson.code} · page {lesson.page}</p>
          <h1 className="font-display text-4xl text-balance md:text-5xl">{lessonName(lesson.titre)}</h1>
          <p className="text-sm text-[var(--ink-soft)]">
            {story ? t.chapterKind : minutes(lesson.dureeS)}
            {!story && canPlay && progress ? ` · ${t.resumeAt} ${formatClock(progress.positionS)}` : ""}
          </p>
        </header>

        {story ? (
          opening || hasFullBook(student) ? (
            <>
              <ChapterNotes code={lesson.code} watermark={!opening && student ? watermark : ""} />
              {opening && <ShareButton path={`/v/${lesson.slug}`} text={`${part ? part.titre : ""} · ${t.shareChapter}`} className="btn btn-ghost w-fit" />}
            </>
          ) : (
            <div className="card grid gap-3 p-5">
              <h2 className="font-display text-3xl">{t.summaryLockedTitle}</h2>
              <p className="text-[var(--ink-soft)]">{t.summaryLocked}</p>
              <Link href="/inscription" className="btn btn-yellow w-fit">{t.payEnter}</Link>
            </div>
          )
        ) : <section className="grid gap-3">
          <h2 className="font-display text-2xl">{t.theVideo}</h2>
        {soon ? (
          <div className="card grid gap-2 p-5">
            <p className="text-[var(--ink-soft)]">{t.theVideo} {t.notOnline}{student ? t.whatsappSoon : ""}</p>
          </div>
        ) : canPlay ? (
          <div className="player-glow">
            <Player
              key={videoLesson.id}
              durationS={videoLesson.dureeS}
              startS={progress && videoLesson.dureeS - progress.positionS > 8 ? progress.positionS : 0}
              mode="full"
              watermark={watermark}
              title={story && named ? named.titre : lessonName(lesson.titre)}
              code={videoLesson.code}
              color={part?.couleur || "#0B3D91"}
              src={videoUrl || undefined}
              onProgress={(position) => rememberProgress(videoLesson.id, position)}
            />
          </div>
        ) : student ? (
          <div className="card grid gap-3 p-5">
            <h2 className="font-display text-3xl">{names.one} {t.payChapter}</h2>
            <p className="text-[var(--ink-soft)]">{t.payBody}</p>
            <Link href="/inscription" className="btn btn-yellow w-fit">{t.payNext}</Link>
          </div>
        ) : (
          <WowGate
            title={lesson.titre}
            code={lesson.code}
            page={lesson.page}
            minutes={minutes(lesson.dureeS)}
            color={part?.couleur || "#0B3D91"}
            opening={opening}
          />
        )}

        {chapterOpen && (
          <button
            type="button"
            className="btn btn-soft w-fit"
            onClick={() => {
              rememberProgress(lesson.id, lesson.dureeS, true);
              setMarked(true);
            }}
          >
            <span className={`tick ${seen ? "is-on" : ""}`} aria-hidden />
            {seen ? `${names.one} ${t.marked}` : t.mark}
          </button>
        )}
        </section>}

        {story && student && (opening || hasFullBook(student)) && (
          <button
            type="button"
            className="btn btn-soft w-fit"
            onClick={() => {
              rememberProgress(lesson.id, lesson.dureeS, true);
              setMarked(true);
            }}
          >
            <span className={`tick ${seen ? "is-on" : ""}`} aria-hidden />
            {seen ? `${names.one} ${t.marked}` : t.mark}
          </button>
        )}

        {!story && <section className="grid gap-3">
          <h2 className="font-display text-2xl">{t.thePdf}</h2>
          {pdfsOpen ? <PdfList docs={docs} watermark={watermark} /> : (
            <p className="text-sm text-[var(--ink-soft)]">
              {!student
                ? opening
                  ? t.pdfSignup
                  : t.pdfLocked
                : !hasFullBook(student)
                  ? t.pdfPay
                  : `${t.thePdf} ${t.pdfPack}`}
            </p>
          )}
        </section>}

        {!story && (chapterOpen && pdfsOpen ? <LessonAgent lessonId={lesson.id} code={lesson.code} /> : chapterOpen ? (
          <p className="text-sm text-[var(--ink-soft)]">{t.agentPack}</p>
        ) : null)}

        <nav className="grid grid-cols-2 gap-2">
          {prev ? <Link className="btn btn-soft" href={`/v/${prev.slug}?s=code`}>{arrow(true)} {names.one} {index}</Link> : <span />}
          {next ? (
            <Link className="btn btn-soft" href={`/v/${next.slug}?s=code`}>{names.one} {index + 2} {arrow(false)}</Link>
          ) : part ? (
            <Link className="btn btn-primary" href={`/livre/${part.code.toLowerCase()}/examen`}>{t.examLabel} {arrow(false)}</Link>
          ) : <span />}
        </nav>
      </div>

      <aside className="lesson-rail">
        <button type="button" className="lesson-toggle btn btn-soft" onClick={() => setListOpen((value) => !value)}>
          {listOpen ? t.closeList : names.many}
        </button>
        <ul className={`lesson-list grid gap-1 ${listOpen ? "" : "is-closed"}`}>
          {siblings.map((item, itemIndex) => (
            <li key={item.id}>
              <Link
                href={`/v/${item.slug}?s=code`}
                className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-3 no-underline ${item.id === lesson.id ? "bg-[var(--blue-fill)] text-white" : "text-[var(--ink)]"}`}
              >
                <span className="font-mono text-sm">{itemIndex + 1}</span>
                <span className="min-w-0 flex-1 text-sm leading-snug">{lessonName(item.titre)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}

function WowGate({ title, code, page, minutes, color, opening }: { title: string; code: string; page: number; minutes: string; color: string; opening: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-4">
      <button
        type="button"
        className="player-stage with-stripes relative aspect-video overflow-hidden rounded-[14px] text-left text-white"
        style={{ backgroundColor: color }}
        onClick={() => setOpen(true)}
      >
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,#0f1b3d_100%)]" />
        <span className="absolute left-4 top-4 z-[1] font-mono text-sm">{code} · p. {page} · {minutes}</span>
        <span className="absolute inset-0 z-[1] grid place-items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-[var(--yellow)] text-3xl text-[var(--yellow-ink)]">▶</span>
        </span>
        <span className="absolute inset-x-0 bottom-0 z-[1] grid gap-1 p-5">
          <span className="font-display text-3xl text-balance">{title}</span>
          <span className="font-hand text-2xl text-[var(--yellow)]">{t.teacher}</span>
        </span>
      </button>
      {open && (
        <section className="reveal is-in grid gap-3">
          <h2 className="font-display text-3xl">{t.ready}</h2>
          <p className="max-w-xl text-[var(--ink-soft)]">
            {opening ? t.wowFree : t.wowPay}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/inscription" className="btn btn-yellow">{t.join}</Link>
            <Link href="/connexion" className="btn btn-ghost">{t.haveAccess}</Link>
          </div>
        </section>
      )}
    </div>
  );
}

function PdfList({ docs, watermark }: { docs: { id: string; titre: string; nom: string }[]; watermark: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<{ id: string; titre: string; nom: string } | null>(null);
  if (docs.length === 0) return <p className="text-sm text-[var(--ink-soft)]">{t.pdfMissing}</p>;
  return (
    <div className="grid gap-2">
      <ul className="grid gap-2">
        {docs.map((pdf) => (
          <li key={pdf.id}>
            <button type="button" className="btn btn-soft w-fit" onClick={() => setOpen(pdf)}>{t.read} · {pdf.titre}</button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-[var(--ink-soft)]">{t.noDownload}</p>
      {open && <DocReader id={open.id} titre={open.titre} nom={open.nom} watermark={watermark} onClose={() => setOpen(null)} />}
    </div>
  );
}
