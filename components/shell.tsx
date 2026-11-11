"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CodeSheet } from "./code-form";
import { SiteFooter } from "./site-footer";
import { useI18n } from "@/lib/i18n";
import { LangButton, Logo, ThemeButton } from "./ui";
import { useApp } from "@/lib/store";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/livre", key: "book" },
  { href: "/compte", key: "account" },
] as const;

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { student } = useApp();
  const { t } = useI18n();
  const [sheet, setSheet] = useState(false);
  const admin = pathname.startsWith("/admin");

  useEffect(() => {
    setSheet(false);
  }, [pathname]);

  if (admin) return <>{children}</>;

  return (
    <>
      <div className="app-chrome mx-auto min-h-dvh w-full max-w-6xl">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:bg-[var(--paper-2)] focus:px-3 focus:py-2">
          {t.skip}
        </a>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3">
          <Logo />
          <div className="ms-auto flex items-center gap-2">
            <nav className="hidden items-center gap-1 md:flex">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active(pathname, link.href) ? "page" : undefined}
                  className="nav-link tap inline-flex items-center rounded-full px-3 text-sm text-[var(--ink)] no-underline"
                >
                  {t[link.key]}
                </Link>
              ))}
            </nav>
            {!student && pathname !== "/" && pathname !== "/inscription" && (
              <Link href="/inscription" className="btn btn-primary hidden h-11 min-h-11 md:inline-flex">{t.signup}</Link>
            )}
            <LangButton />
            <ThemeButton />
          </div>
        </header>
        <main id="contenu" tabIndex={-1} className="px-4 pb-10 pt-6 outline-none md:pb-12">
          {children}
        </main>
        <SiteFooter />
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--paper)] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:hidden">
          <ul className="mx-auto grid max-w-lg grid-cols-4 items-end">
            {LINKS.slice(0, 2).map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={active(pathname, link.href) ? "page" : undefined} className="mobile-tab tap grid place-items-center text-xs no-underline">
                  {t[link.key]}
                </Link>
              </li>
            ))}
            <li className="grid place-items-center">
              <button type="button" className="tap grid place-items-center text-xs" onClick={() => setSheet(true)}>
                <span className="-mt-5 grid h-12 w-12 place-items-center rounded-full bg-[var(--yellow)] text-sm font-semibold text-[var(--yellow-ink)]">{t.code}</span>
                {t.codeVideo}
              </button>
            </li>
            <li>
              <Link href="/compte" aria-current={active(pathname, "/compte") ? "page" : undefined} className="mobile-tab tap grid place-items-center text-xs no-underline">
                {t.account}
              </Link>
            </li>
          </ul>
        </nav>
        <CodeSheet open={sheet} onClose={() => setSheet(false)} />
      </div>
    </>
  );
}
