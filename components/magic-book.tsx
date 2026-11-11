"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { WelcomeSlot } from "./welcome-slot";

export function MagicBook() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  function openBook() {
    const target = document.getElementById("couvertures");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      target?.scrollIntoView({ block: "start" });
      return;
    }
    setOpen(true);
    window.setTimeout(() => target?.scrollIntoView({ behavior: "smooth", block: "start" }), 650);
  }

  return (
    <div className="book-still">
      <div className={`book-tile ${open ? "is-open" : ""}`}>
        <svg viewBox="0 0 40 30" className="book-mark" aria-hidden>
          <path className="page-left" d="M3 5c5.6 1.7 9.5 1.7 16 0v21c-6.5 1.7-10.4 1.7-16 0V5z" fill="#FFFFFF" />
          <path className="page-right" d="M37 5c-5.6 1.7-9.5 1.7-16 0v21c6.5 1.7 10.4 1.7 16 0V5z" fill="#FFC72C" />
          <path d="M20 5v21" stroke="#0F1B3D" strokeWidth="0.6" />
        </svg>
        <WelcomeSlot part="photo" />
      </div>
      <button type="button" className="btn btn-primary" onClick={openBook}>
        {t.openBook}
      </button>
      <WelcomeSlot part="video" />
    </div>
  );
}
