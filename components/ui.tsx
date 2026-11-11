"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14.7" fill="#0B3D91" />
      <path d="M14 18c6 1.6 10.2 1.6 16 0v28c-5.8 1.6-10 1.6-16 0V18z" fill="#FFFFFF" />
      <path d="M50 18c-6 1.6-10.2 1.6-16 0v28c5.8 1.6 10 1.6 16 0V18z" fill="#FFC72C" />
      <path d="M30 18v28" stroke="#0F1B3D" strokeWidth="1.6" />
      {size >= 24 && (
        <path d="M46 11.5v7M42.5 15h7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Bar({ value, color }: { value: number; color?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="bar" aria-hidden>
      <span style={{ width: `${width}%`, background: color ?? "var(--blue-fill)" }} />
    </div>
  );
}

export function CodePill({ code, color, tint }: { code: string; color: string; tint: string }) {
  return (
    <span className="code-pill" style={{ color, background: tint }}>
      {code}
    </span>
  );
}

export function LangButton() {
  const { lang, setLang, t } = useI18n();
  const next = lang === "ar" ? "fr" : "ar";
  return (
    <button
      type="button"
      className="tap grid h-11 min-w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-3 text-sm font-semibold"
      aria-label={lang === "ar" ? t.toFrench : t.toArabic}
      onClick={() => setLang(next)}
    >
      {lang === "ar" ? "FR" : "ع"}
    </button>
  );
}

export function ThemeButton() {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className="tap grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper-2)]"
      aria-label={t.theme}
      onClick={() => {
        const root = document.documentElement;
        const next = root.classList.contains("dark") ? "light" : "dark";
        root.classList.toggle("dark", next === "dark");
        localStorage.setItem("lm-theme", next);
      }}
    >
      <span className="dark:hidden" aria-hidden>
        ☾
      </span>
      <span className="hidden dark:inline" aria-hidden>
        ☀
      </span>
    </button>
  );
}

export function Logo() {
  const { t } = useI18n();
  return (
    <Link href="/" className="flex items-center gap-2.5 text-[var(--ink)] no-underline">
      <Mark />
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight">
          {t.brand} <span className="font-hand text-[1.35rem] font-normal">{t.brandHand}</span>
        </span>
        <span className="mt-0.5 block text-[11px] text-[var(--ink-soft)]">{t.byTeacher}</span>
      </span>
    </Link>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="text-sm text-[var(--danger)]" role="alert">
      {children}
    </p>
  );
}

export function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        background: color ? `color-mix(in srgb, ${color} 18%, var(--paper-2))` : "var(--paper)",
        color: color ?? "var(--ink)",
      }}
    >
      {children}
    </span>
  );
}
