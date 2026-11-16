"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import "./story-cinema.css";

const SCENES = {
  BAM: {
    far: "/intro/bam-alley.jpg",
    mid: "/intro/bam-patio.jpg",
    near: "/intro/bam-box.jpg",
    still: "/intro/bam-alley.jpg",
    video: "/intro/bam",
    tone: "#1c140c",
  },
  ANT: {
    far: "/intro/ant-stage.jpg",
    mid: "/intro/ant-figures.jpg",
    near: "",
    still: "/intro/ant-figures.jpg",
    video: "/intro/ant",
    tone: "#0c1018",
  },
  DJC: {
    far: "/intro/djc-page.jpg",
    mid: "/intro/djc-dawn.jpg",
    near: "",
    still: "/intro/djc-dawn.jpg",
    video: "/intro/djc",
    tone: "#141210",
  },
} as const;

export type StoryCode = keyof typeof SCENES;

export function storyScene(code: string) {
  return code in SCENES ? SCENES[code as StoryCode] : null;
}

export function reducedMotion() {
  try {
    const saved = localStorage.getItem("lm-motion");
    if (saved === "reduced") return true;
    if (saved === "full") return false;
  } catch {
    /* préférence système */
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function findVideo(base: string) {
  const small = window.matchMedia("(max-width: 720px)").matches;
  const candidates = small ? [`${base}-mobile.mp4`, `${base}.mp4`] : [`${base}.mp4`];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      const type = res.headers.get("content-type") || "";
      if (res.ok && type.startsWith("video/")) return url;
    } catch {
      /* pas de vidéo : la scène animée prend le relais */
    }
  }
  return "";
}

export function useStoryIntro(code: string | null) {
  const [play, setPlay] = useState(false);

  function close() {
    setPlay(false);
    document.getElementById("contenu")?.focus();
  }

  return { play, close, replay: () => setPlay(true) };
}

export function StoryCinema({
  code,
  title,
  author,
  cover,
  onClose,
}: {
  code: StoryCode;
  title: string;
  author: string;
  cover: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const scene = SCENES[code];
  const [reduced, setReduced] = useState(false);
  const [farOk, setFarOk] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoOn, setVideoOn] = useState(false);
  const [videoDone, setVideoDone] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    setReduced(reducedMotion());
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    findVideo(scene.video).then((url) => {
      if (alive) setVideoUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [scene.video]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function chooseMotion(next: boolean) {
    setReduced(next);
    try {
      localStorage.setItem("lm-motion", next ? "reduced" : "full");
    } catch {
      /* le réglage reste pour cette visite */
    }
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  }

  const useVideo = Boolean(videoUrl) && !reduced;
  const mode = reduced ? "is-reduced" : videoOn ? "is-video is-full" : "is-playing is-full";

  return (
    <div
      className={`cinema ${mode} ${videoDone ? "show-copy" : ""}`}
      data-work={code}
      style={{ "--tone": scene.tone } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="cinema-bar">
        <button type="button" className="cinema-text" autoFocus onClick={onClose}>
          {t.skipIntro}
        </button>
        <span className="flex gap-2">
          {videoOn && (
            <button type="button" className="cinema-text" onClick={toggleSound} aria-pressed={!muted}>
              {muted ? t.soundOn : t.soundOff}
            </button>
          )}
          <button type="button" className="cinema-text" onClick={() => chooseMotion(!reduced)}>
            {reduced ? t.fullMotion : t.lessMotion}
          </button>
        </span>
      </div>
      <div className="cinema-stage">
        {farOk ? (
          <img className="layer layer-far" src={reduced ? scene.still : scene.far} alt="" onError={() => setFarOk(false)} />
        ) : (
          <div className="layer layer-far layer-fallback" />
        )}
        <img className="layer layer-mid" src={scene.mid} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
        {scene.near && (
          <img className="layer layer-near" src={scene.near} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
        )}
        {code === "BAM" && !reduced && (
          <span className="dust" aria-hidden>
            <i /><i /><i /><i /><i />
          </span>
        )}
        <div className="cinema-book" aria-hidden>
          <span className="leaf leaf-left"><img src={cover} alt="" /></span>
          <span className="leaf leaf-right"><img src={cover} alt="" /></span>
        </div>
        {useVideo && (
          <video
            ref={videoRef}
            className={`cinema-video ${videoOn ? "is-on" : ""}`}
            src={videoUrl}
            poster={scene.still}
            autoPlay
            muted
            playsInline
            preload="auto"
            controlsList="nodownload"
            disablePictureInPicture
            aria-hidden
            onPlaying={() => setVideoOn(true)}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (video.duration && video.duration - video.currentTime < 1.6) setVideoDone(true);
            }}
            onEnded={() => setVideoDone(true)}
            onError={() => {
              setVideoUrl("");
              setVideoOn(false);
            }}
          />
        )}
        <div className="cinema-copy">
          <p className="cinema-kicker">{author}</p>
          <h2>{title}</h2>
          <button type="button" className="btn btn-yellow" onClick={onClose}>{t.enterStory}</button>
        </div>
      </div>
    </div>
  );
}
