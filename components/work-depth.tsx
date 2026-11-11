"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion, storyScene, type StoryCode } from "./story-cinema";
import "./work-depth.css";

function useCalm() {
  const [calm, setCalm] = useState(true);
  useEffect(() => {
    const sync = () => setCalm(reducedMotion());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return calm;
}

function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function DepthBook({ src, color }: { src: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const calm = useCalm();

  useEffect(() => {
    const node = ref.current;
    if (!node || calm || !finePointer()) return;
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      node.style.setProperty("--ry", `${-14 + x * 16}deg`);
      node.style.setProperty("--rx", `${-y * 10}deg`);
    };
    const leave = () => {
      node.style.removeProperty("--ry");
      node.style.removeProperty("--rx");
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [calm]);

  return (
    <span ref={ref} className={`depth-book${calm ? " is-calm" : ""}`} style={{ "--spine": color } as React.CSSProperties} aria-hidden>
      <span className="depth-book-body">
        <span className="depth-book-face">
          <img src={src} alt="" />
        </span>
        <span className="depth-book-spine" />
        <span className="depth-book-pages" />
      </span>
    </span>
  );
}

export function DepthBanner({ code }: { code: StoryCode }) {
  const scene = storyScene(code);
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();

  useEffect(() => {
    const node = ref.current;
    if (!node || calm) return;
    let frame = 0;
    let px = 0;
    let py = 0;
    const paint = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      const center = box.top + box.height / 2 - window.innerHeight / 2;
      const sy = Math.max(-1, Math.min(1, center / window.innerHeight));
      node.style.setProperty("--sy", sy.toFixed(3));
      node.style.setProperty("--px", px.toFixed(3));
      node.style.setProperty("--py", py.toFixed(3));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      px = (event.clientX - box.left) / box.width - 0.5;
      py = (event.clientY - box.top) / box.height - 0.5;
      queue();
    };
    const leave = () => {
      px = 0;
      py = 0;
      queue();
    };
    paint();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    const pointer = finePointer();
    if (pointer) {
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (pointer) {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      }
    };
  }, [calm]);

  if (!scene) return null;
  return (
    <div ref={ref} className={`depth-banner${calm ? " is-calm" : ""}`} data-work={code} style={{ "--tone": scene.tone } as React.CSSProperties} aria-hidden>
      <img className="depth-back" src={scene.still} alt="" />
      <span className="depth-light" />
      {scene.near && <img className="depth-near" src={scene.near} alt="" />}
      <span className="depth-vignette" />
    </div>
  );
}

export function useDepthReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const calm = useCalm();

  useEffect(() => {
    const list = ref.current;
    if (!list || calm) return;
    const rows = [...list.children] as HTMLElement[];
    const below = rows.filter((row) => row.getBoundingClientRect().top > window.innerHeight * 0.92);
    if (!below.length) return;
    below.forEach((row) => row.classList.add("depth-wait"));
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("depth-wait");
          watch.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    below.forEach((row) => watch.observe(row));
    return () => {
      watch.disconnect();
      below.forEach((row) => row.classList.remove("depth-wait"));
    };
  }, [calm]);

  return { ref, calm };
}
