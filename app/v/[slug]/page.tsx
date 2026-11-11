import type { Metadata } from "next";
import { Suspense } from "react";
import { Boot } from "@/components/boot";
import { LessonScreen } from "@/components/lesson-screen";
import { buildCatalog, partOf } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { parts, lessons } = buildCatalog();
  const lesson = lessons.find((item) => item.slug === slug.toLowerCase());
  if (!lesson) return {};
  const part = partOf(parts, lesson);
  const free = ["BAM-01", "ANT-01", "DJC-01"].includes(lesson.code);
  const title = part ? `${part.titre} · ${lesson.code} · ${lesson.titre}` : lesson.titre;
  const description = free
    ? `Résumé gratuit du chapitre 1 de ${part?.titre}, en français et en arabe, avec les figures de style. Français 1re année Bac.`
    : `${lesson.titre} : ${part?.titre}, Français 1re année Bac avec Maître Mohssine.`;
  return {
    title,
    description,
    alternates: { canonical: `/v/${lesson.slug}` },
    robots: free ? undefined : { index: false, follow: true },
    openGraph: { title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<Boot label="Ouverture de la leçon" />}>
      <LessonScreen slug={slug} />
    </Suspense>
  );
}
