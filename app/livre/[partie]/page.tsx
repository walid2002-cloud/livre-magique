import type { Metadata } from "next";
import { PartScreen } from "@/components/book-screen";
import { buildCatalog, partByCode } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ partie: string }> }): Promise<Metadata> {
  const { partie } = await params;
  const part = partByCode(buildCatalog().parts, partie);
  if (!part) return {};
  const story = ["BAM", "ANT", "DJC"].includes(part.code);
  const description = story
    ? `Comprends ${part.titre} (${part.auteur}) étape par étape : résumé du chapitre 1 gratuit en français et en arabe, avec les figures de style. Français 1re année Bac.`
    : `${part.titre} pour la 1re année Bac avec Maître Mohssine : une vidéo et un PDF par leçon, et un QCM à la fin.`;
  return {
    title: story ? `${part.titre} : résumé et explication` : part.titre,
    description,
    alternates: { canonical: `/livre/${part.code.toLowerCase()}` },
    openGraph: { title: `${part.titre} · Le Livre Magique`, description },
  };
}

export default async function Page({ params }: { params: Promise<{ partie: string }> }) {
  const { partie } = await params;
  return <PartScreen code={partie} />;
}
