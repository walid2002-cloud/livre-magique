import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Le Livre Magique · Maître Mohssine",
    short_name: "Livre Magique",
    description: "Français 1re année Bac : œuvres, langue, production écrite et examens régionaux, en français et en arabe.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0B3D91",
    lang: "fr",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
