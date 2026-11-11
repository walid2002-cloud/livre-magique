"use client";

import { useEffect, useRef, useState } from "react";
import { formatClock } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { isScreenCapture } from "@/components/doc-reader";

const SPOTS = [
  { top: "10%", left: "6%", right: "auto", bottom: "auto", rotate: "-6deg" },
  { top: "12%", left: "auto", right: "6%", bottom: "auto", rotate: "4deg" },
  { top: "auto", left: "8%", right: "auto", bottom: "22%", rotate: "7deg" },
  { top: "auto", left: "auto", right: "8%", bottom: "24%", rotate: "-3deg" },
  { top: "40%", left: "22%", right: "auto", bottom: "auto", rotate: "2deg" },
];

export function Player({
  durationS,
  startS,
  mode,
  watermark,
  title,
  code,
  color,
  src,
  onProgress,
  onPreviewEnd,
}: {
  durationS: number;
  startS: number;
  mode: "full" | "preview";
  watermark: string;
  title: string;
  code: string;
  color: string;
  src?: string;
  onProgress?: (position: number) => void;
  onPreviewEnd?: () => void;
}) {
  const { t } = useI18n();
  const [mediaDuration, setMediaDuration] = useState(0);
  const full = src && mediaDuration ? mediaDuration : durationS;
  const limit = mode === "preview" ? Math.min(30, durationS) : full;
  const [position, setPosition] = useState(() => Math.min(startS, Math.max(limit - 1, 0)));
  const [playing, setPlaying] = useState(true);
  const [ended, setEnded] = useState(false);
  const [spot, setSpot] = useState(0);
  const [guard, setGuard] = useState(false);
  const positionRef = useRef(position);
  const savedAt = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onProgressRef = useRef(onProgress);
  const onPreviewEndRef = useRef(onPreviewEnd);

  useEffect(() => {
    positionRef.current = position;
    onProgressRef.current = onProgress;
    onPreviewEndRef.current = onPreviewEnd;
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSpot((value) => (value + 1) % SPOTS.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    const onKey = (event: KeyboardEvent) => {
      if (!isScreenCapture(event)) return;
      videoRef.current?.pause();
      setPlaying(false);
      setGuard(true);
      window.setTimeout(() => setGuard(false), 1400);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("lm-play");
    const mine = Math.random().toString(36).slice(2);
    channel.onmessage = (event: MessageEvent<{ id?: string }>) => {
      if (event.data?.id === mine) return;
      videoRef.current?.pause();
      setPlaying(false);
    };
    const onPlay = () => channel.postMessage({ id: mine });
    const video = videoRef.current;
    video?.addEventListener("play", onPlay);
    return () => {
      video?.removeEventListener("play", onPlay);
      channel.close();
    };
  }, [src]);

  useEffect(() => {
    if (src || !playing || ended) return;
    const timer = window.setInterval(() => {
      setPosition((value) => Math.min(limit, +(value + 0.25).toFixed(2)));
    }, 250);
    return () => window.clearInterval(timer);
  }, [ended, limit, playing, src]);

  useEffect(() => {
    if (src || ended || position < limit) return;
    setPlaying(false);
    setEnded(true);
    if (mode === "preview") onPreviewEndRef.current?.();
    else onProgressRef.current?.(limit);
  }, [ended, limit, mode, position, src]);

  useEffect(() => {
    if (src || mode !== "full") return;
    if (position - savedAt.current < 10 && position < limit) return;
    savedAt.current = position;
    onProgressRef.current?.(position);
  }, [limit, mode, position, src]);

  useEffect(() => {
    return () => {
      if (mode === "full") onProgressRef.current?.(positionRef.current);
    };
  }, [mode]);

  const place = SPOTS[spot];

  return (
    <div className="shield overflow-hidden rounded-[14px] border border-[var(--line)]" onContextMenu={(event) => event.preventDefault()}>
      <div className="player-stage with-stripes relative aspect-video" style={{ backgroundColor: color }}>
        {src && (
          <video
            key={src}
            ref={videoRef}
            className="absolute inset-0 z-[1] h-full w-full bg-black object-contain"
            src={src}
            controls={false}
            controlsList="nodownload"
            disablePictureInPicture
            playsInline
            draggable={false}
            onLoadedMetadata={(event) => {
              setMediaDuration(event.currentTarget.duration);
              if (startS > 0 && startS < event.currentTarget.duration - 2) event.currentTarget.currentTime = startS;
              if (playing) void event.currentTarget.play();
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(event) => {
              const time = event.currentTarget.currentTime;
              positionRef.current = time;
              setPosition(time);
              if (mode !== "full") return;
              if (time - savedAt.current < 10 && time < event.currentTarget.duration) return;
              savedAt.current = time;
              onProgressRef.current?.(time);
            }}
            onEnded={(event) => {
              setEnded(true);
              setPlaying(false);
              onProgressRef.current?.(event.currentTarget.duration);
            }}
          />
        )}
        <p className={`absolute left-4 top-4 z-[2] font-mono text-sm font-semibold tracking-wide ${src ? "rounded-full bg-[#0f1b3d]/70 px-2 py-1" : ""}`}>{code}</p>
        {!src && (
          <div className="absolute inset-x-0 bottom-0 z-[1] px-5 pb-5">
            <p className="font-display text-2xl text-balance md:text-4xl">{title}</p>
            <p className="font-hand text-2xl text-[var(--yellow)]">Maître Mohssine</p>
          </div>
        )}
        <span className="watermark" style={{ top: place.top, left: place.left, right: place.right, bottom: place.bottom, transform: `rotate(${place.rotate})` }}>
          {watermark}
        </span>
        {guard && <div className="absolute inset-0 z-20 bg-[#0f1b3d]" />}
        {ended && mode === "preview" && (
          <div className="absolute inset-0 z-10 grid content-center gap-2 bg-[#0f1b3d]/95 px-5 text-white">
            <p className="font-hand text-3xl text-[var(--yellow)]">Fin de l&apos;aperçu</p>
            <h3 className="font-display text-3xl">Active ton livre</h3>
            <p className="max-w-sm text-sm text-white/80">Les 30 secondes sont passées. La vidéo complète reste sur ton compte.</p>
          </div>
        )}
      </div>
      <div className="grid gap-3 bg-[var(--paper-2)] p-3">
        <input
          aria-label="Position de la lecture"
          type="range"
          min={0}
          max={limit}
          step={1}
          value={Math.min(position, limit)}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = next;
            setEnded(false);
            setPosition(next);
            positionRef.current = next;
            if (mode === "full") onProgress?.(next);
          }}
        />
        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-primary h-11 min-h-11 px-4" onClick={() => {
            const video = videoRef.current;
            if (ended && mode === "preview") return;
            if (video) {
              if (ended) {
                video.currentTime = 0;
                setEnded(false);
              }
              if (video.paused) void video.play();
              else video.pause();
              return;
            }
            if (ended) {
              setEnded(false);
              setPosition(0);
            }
            setPlaying((value) => !value);
          }}>
            {ended && mode === "preview" ? t.previewDone : playing ? t.pause : t.play}
          </button>
          <p className="font-mono text-sm text-[var(--ink-soft)]">
            {formatClock(position)} / {formatClock(limit)}
            {src ? ` · ${t.readOnly}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
