"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { lookupCode } from "@/lib/normalize";
import { useApp } from "@/lib/store";

const RECENT_KEY = "lm-recent-codes";

function readRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as string[];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function remember(code: string) {
  const next = [code, ...readRecent().filter((item) => item !== code)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function CodeForm({ compact = false, tone = "yellow", onDone }: { compact?: boolean; tone?: "yellow" | "blue"; onDone?: () => void }) {
  const { db } = useApp();
  const { t, codeError } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [confirmed, setConfirmed] = useState("");

  function open(raw: string) {
    const result = lookupCode(raw, db.lessons.map((lesson) => lesson.code));
    if (!result.ok) {
      setConfirmed("");
      setMessage(codeError(result.message));
      setSuggestions(result.suggestions);
      setShake(false);
      requestAnimationFrame(() => setShake(true));
      return;
    }
    const lesson = db.lessons.find((item) => item.code === result.code);
    if (!lesson) return;
    remember(result.code);
    setMessage("");
    setSuggestions([]);
    setShake(false);
    setConfirmed(result.code);
    window.setTimeout(() => {
      setValue("");
      onDone?.();
      router.push(`/v/${lesson.slug}?s=code`);
    }, 280);
  }

  return (
    <form
      className={`${compact ? "relative flex min-w-0 flex-1 flex-wrap items-center gap-2" : "grid gap-3"} ${shake ? "shake" : ""}`}
      onAnimationEnd={() => setShake(false)}
      onSubmit={(event) => {
        event.preventDefault();
        open(value);
      }}
    >
      {!compact && (
        <div>
          <label htmlFor="code-video" className="font-display text-xl">
            {t.codeVideo}
          </label>
          <p className="text-sm text-[var(--ink-soft)]">{t.codeHint}</p>
        </div>
      )}
      <div className={compact ? "flex min-w-0 flex-1 gap-2" : "flex gap-2"}>
        <input
          id={compact ? undefined : "code-video"}
          aria-label={t.codeVideo}
          className="field field-code font-mono uppercase"
          placeholder="BAM-03"
          value={value}
          autoCapitalize="characters"
          autoCorrect="off"
          onFocus={() => setRecent(readRecent())}
          onChange={(event) => setValue(event.target.value)}
        />
        <button className={`btn shrink-0 ${tone === "blue" ? "btn-primary" : "btn-yellow"}`} type="submit">
          {t.seeVideo}
        </button>
      </div>
      {!compact && recent.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recent.map((code) => (
            <button key={code} type="button" className="btn btn-soft h-10 min-h-10 px-3 font-mono text-sm" onClick={() => open(code)}>
              {code}
            </button>
          ))}
        </div>
      )}
      {confirmed && <p className={compact ? "code-pop code-ok" : "code-ok basis-full"}>{t.openingCode} {confirmed}</p>}
      {message && (
        <div className={compact ? "code-pop grid gap-2" : "grid basis-full gap-2"}>
          <p className="text-sm text-[var(--danger)]" role="alert">
            {message}
          </p>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((code) => (
                <button key={code} type="button" className="btn btn-soft h-10 min-h-10 px-3 font-mono text-sm" onClick={() => open(code)}>
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

export function CodeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div className="sheet-backdrop fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-3 md:items-center" onClick={onClose}>
      <div
        className="sheet-panel card w-full max-w-md p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="code-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="code-sheet-title" className="font-display text-2xl">
              {t.codeVideo}
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">{t.codeUnder}</p>
          </div>
          <button type="button" className="tap grid h-11 w-11 place-items-center rounded-full border border-[var(--line)]" onClick={onClose} aria-label={t.close}>
            ×
          </button>
        </div>
        <CodeForm onDone={onClose} />
      </div>
    </div>
  );
}
