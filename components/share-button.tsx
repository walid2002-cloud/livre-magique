"use client";

import { useState } from "react";
import { site } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

export function ShareButton({ path, text, className = "btn btn-ghost" }: { path: string; text: string; className?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: site.name, text, url });
        return;
      } catch {
        return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className={className} onClick={share}>
      {copied ? t.shareCopied : t.share}
    </button>
  );
}
