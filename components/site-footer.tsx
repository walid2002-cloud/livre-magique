"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export function SiteFooter() {
  const { student } = useApp();
  const { t } = useI18n();
  const [far, setFar] = useState(false);

  useEffect(() => {
    const check = () => setFar(window.scrollY > 900);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  function top() {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    document.getElementById("contenu")?.focus({ preventScroll: true });
  }

  return (
    <>
      <footer className="site-footer">
        <div className="grid gap-1">
          <strong>{t.brand} {t.brandHand}</strong>
          <span className="text-sm text-[var(--ink-soft)]">{t.footerNote}</span>
        </div>
        <nav className="footer-links" aria-label={t.brand}>
          <Link href="/">{t.home}</Link>
          <Link href="/livre">{t.book}</Link>
          {student ? <Link href="/compte">{t.account}</Link> : <Link href="/inscription">{t.signup}</Link>}
          {!student && <Link href="/connexion">{t.login}</Link>}
          <Link href="/confidentialite">{t.privacy}</Link>
        </nav>
      </footer>
      {far && (
        <button type="button" className="back-top" onClick={top} aria-label={t.backTop}>
          ↑
        </button>
      )}
    </>
  );
}
