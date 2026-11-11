"use client";

import { useRouter } from "next/navigation";
import type { Part } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const COVERS: Record<string, string> = {
  BAM: "/covers/boite-a-merveilles.jpg",
  ANT: "/covers/antigone.jpg",
  DJC: "/covers/dernier-jour.jpg",
  LAN: "/covers/cours-de-langue.jpg",
  PE: "/covers/production-ecrite.jpg",
  EX: "/covers/examens-regionaux.jpg",
};

export function workCover(code: string) {
  return COVERS[code] ?? "";
}

function Art({ code, color }: { code: string; color: string }) {
  const photo = workCover(code);
  if (photo) return <img src={photo} alt="" className="h-full w-full object-cover" />;
  if (code === "LAN") {
    return (
      <svg viewBox="0 0 200 220" className="h-full w-full" aria-hidden>
        <rect width="200" height="220" fill="#062421" />
        {Array.from({ length: 6 }, (_, index) => (
          <rect key={index} x="32" y={48 + index * 22} width={136 - (index % 3) * 28} height="6" rx="3" fill={index === 0 ? "#f4f1ea" : color} />
        ))}
      </svg>
    );
  }
  if (code === "PE") {
    return (
      <svg viewBox="0 0 200 220" className="h-full w-full" aria-hidden>
        <rect width="200" height="220" fill="#160c28" />
        <path d="M40 150 C80 40, 120 180, 168 60" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <path d="M150 58 l22 6 -16 16z" fill="#f4f1ea" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" aria-hidden>
      <rect width="200" height="220" fill="#062216" />
      <circle cx="100" cy="104" r="48" fill="none" stroke={color} strokeWidth="8" />
      <circle cx="100" cy="104" r="28" fill="none" stroke="#f4f1ea" strokeWidth="2" />
      <path d="M100 78 v52 M86 104 h28" stroke={color} strokeWidth="3" />
    </svg>
  );
}

export function PartCover({
  part,
  count,
  done,
  index,
}: {
  part: Part;
  count: number;
  done: number;
  index: number;
}) {
  const router = useRouter();
  const { work, unit } = useI18n();
  const named = work(part.code, part.titre, part.auteur, part.type);
  const foot = `${done > 0 ? `${done}/` : ""}${count} ${unit(part.code).many} · p. ${part.pageDebut}–${part.pageFin}`;
  const href = `/livre/${part.code.toLowerCase()}`;
  const photo = workCover(part.code);

  function open() {
    router.push(href);
  }

  if (photo) {
    return (
      <button
        type="button"
        className="part-cover is-photo"
        style={{ "--accent": part.couleur, "--d": `${index * 70}ms` } as React.CSSProperties}
        onClick={open}
      >
        <span className="part-photo">
          <img src={photo} alt="" className="part-photo-img object-contain object-center" />
        </span>
        <span className="part-copy">
          <small>{named.type}</small>
          <strong>{named.titre}</strong>
          <em>{named.auteur}</em>
        </span>
        <span className="part-foot">
          {foot}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="part-cover"
      style={{ "--accent": part.couleur, "--d": `${index * 70}ms` } as React.CSSProperties}
      onClick={open}
    >
      <span className="part-cover-3d">
        <span className="part-glow" />
        <span className="part-pages" />
        <span className="part-flap">
          <span className={`part-art ${workCover(part.code) ? "is-photo" : ""}`}>
            <Art code={part.code} color={part.couleur} />
            <span className="part-sheen" />
          </span>
          <span className="part-copy">
            <small>{named.type}</small>
            <strong>{named.titre}</strong>
            <em>{named.auteur}</em>
          </span>
        </span>
      </span>
      <span className="part-foot">
        {foot}
      </span>
    </button>
  );
}
