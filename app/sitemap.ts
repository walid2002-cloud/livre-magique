import type { MetadataRoute } from "next";
import { buildCatalog } from "@/lib/catalog";
import { site } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const { parts, lessons } = buildCatalog();
  const free = lessons.filter((lesson) => ["BAM-01", "ANT-01", "DJC-01"].includes(lesson.code));
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/livre`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/inscription`, changeFrequency: "monthly", priority: 0.8 },
    ...parts.map((part) => ({ url: `${base}/livre/${part.code.toLowerCase()}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...free.map((lesson) => ({ url: `${base}/v/${lesson.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
