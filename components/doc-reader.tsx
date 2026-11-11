"use client";

import { useEffect, useRef, useState } from "react";
import { getFile } from "@/lib/files";

export function isScreenCapture(event: KeyboardEvent) {
  if (event.key === "PrintScreen") return true;
  return event.metaKey && event.shiftKey && ["3", "4", "5"].includes(event.key);
}

export function DocReader({
  id,
  titre,
  nom,
  watermark,
  onClose,
}: {
  id: string;
  titre: string;
  nom: string;
  watermark: string;
  onClose: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Ouverture…");
  const [image, setImage] = useState("");
  const [guard, setGuard] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (!isScreenCapture(event)) return;
      setGuard(true);
      window.setTimeout(() => setGuard(false), 1400);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    let objectUrl = "";
    (async () => {
      const file = await getFile(id);
      if (!alive) return;
      if (!file) {
        setStatus("Ce document n'est plus disponible.");
        return;
      }
      const picture = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(nom);
      if (picture) {
        objectUrl = URL.createObjectURL(file);
        setImage(objectUrl);
        setStatus("");
        return;
      }
      if (file.type !== "application/pdf" && !nom.toLowerCase().endsWith(".pdf")) {
        setStatus("Ce document se lit ici seulement en PDF ou en image.");
        return;
      }
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      if (!alive || !host.current) return;
      host.current.replaceChildren();
      for (let index = 1; index <= pdf.numPages; index += 1) {
        if (!alive || !host.current) return;
        const page = await pdf.getPage(index);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "w-full bg-white";
        await page.render({ canvasContext: context, viewport }).promise;
        context.save();
        context.globalAlpha = 0.72;
        context.fillStyle = "#0f1b3d";
        context.font = "600 16px sans-serif";
        for (let y = 72; y < canvas.height; y += 160) context.fillText(watermark, 36, y);
        context.restore();
        host.current.append(canvas);
      }
      setStatus("");
    })().catch(() => {
      if (alive) setStatus("Le document n'a pas pu s'ouvrir.");
    });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, nom, watermark]);

  return (
    <div className="shield fixed inset-0 z-50 grid grid-rows-[auto_1fr] bg-[#0f1b3d] text-white" onContextMenu={(event) => event.preventDefault()}>
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-display text-xl">{titre}</p>
          <p className="text-sm text-white/70">Lecture seule. Ton nom reste sur la page.</p>
        </div>
        <button type="button" className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }} onClick={onClose}>Fermer</button>
      </header>
      <div className="relative overflow-auto px-4 pb-8">
        {status && <p className="py-10 text-center text-white/80">{status}</p>}
        {image && (
          <div className="relative mx-auto w-full max-w-3xl">
            <img src={image} alt="" className="w-full bg-white" draggable={false} />
            <span className="watermark" style={{ top: "12%", left: "8%" }}>{watermark}</span>
          </div>
        )}
        <div ref={host} className="relative mx-auto grid max-w-3xl gap-3" />
        {guard && <div className="absolute inset-0 bg-[#0f1b3d]" />}
      </div>
    </div>
  );
}
