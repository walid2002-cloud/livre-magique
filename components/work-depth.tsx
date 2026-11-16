import { storyScene, type StoryCode } from "./story-cinema";
import "./work-depth.css";

export function DepthBook({ src, color }: { src: string; color: string }) {
  return (
    <span className="depth-book" style={{ "--spine": color } as React.CSSProperties} aria-hidden>
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
  if (!scene) return null;
  return (
    <div className="depth-banner" data-work={code} style={{ "--tone": scene.tone } as React.CSSProperties} aria-hidden>
      <img className="depth-back" src={scene.still} alt="" />
      <span className="depth-light" />
      {scene.near && <img className="depth-near" src={scene.near} alt="" />}
      <span className="depth-vignette" />
    </div>
  );
}
