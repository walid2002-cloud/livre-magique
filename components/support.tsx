"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

export function SupportBlock({ hint }: { hint?: string }) {
  const { t } = useI18n();
  const line = hint ?? t.supportHint;
  const [copied, setCopied] = useState(false);
  return (
    <section className="card flex items-center justify-between gap-3 p-4">
      <div>
        <p className="text-sm text-[var(--ink-soft)]">{t.support}</p>
        <p className="font-mono text-lg">{site.supportDisplay}</p>
        <p className="text-sm text-[var(--ink-soft)]">{line}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          className="btn btn-soft h-11 min-h-11"
          onClick={async () => {
            await navigator.clipboard.writeText(site.supportLocal);
            setCopied(true);
          }}
        >
          {copied ? t.copied : t.copy}
        </button>
        <a className="btn btn-ghost h-11 min-h-11" href={waLink(site.supportWa, "Salam, j'ai besoin d'aide avec Le Livre Magique.")}>
          {t.write}
        </a>
      </div>
    </section>
  );
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}
