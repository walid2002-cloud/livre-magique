import { ImageResponse } from "next/og";

export const alt = "Le Livre Magique : tout ton programme de français 1re année Bac, avec Maître Mohssine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "#0B3D91",
          color: "#FFFFFF",
          borderLeft: "28px solid #FFC72C",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 4, color: "#FFC72C" }}>FRANÇAIS · 1RE ANNÉE BAC</div>
        <div style={{ fontSize: 88, fontWeight: 800, marginTop: 18 }}>Le Livre Magique</div>
        <div style={{ fontSize: 38, marginTop: 24, maxWidth: 960, lineHeight: 1.3 }}>
          Les trois œuvres, la langue, la production écrite et les régionaux 2015–2026. Résumé du chapitre 1 gratuit.
        </div>
        <div style={{ fontSize: 30, marginTop: 36, color: "#FFC72C" }}>avec Maître Mohssine</div>
      </div>
    ),
    size,
  );
}
