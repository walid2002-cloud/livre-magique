"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="grid gap-3">
      <h1 className="font-display text-4xl">{t.missing}</h1>
      <Link href="/" className="btn btn-primary w-fit">{t.backHome}</Link>
    </div>
  );
}
