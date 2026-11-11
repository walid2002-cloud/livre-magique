import type { Metadata, Viewport } from "next";
import { Cairo, Caveat_Brush, JetBrains_Mono, Poppins } from "next/font/google";
import { Shell } from "@/components/shell";
import { site } from "@/lib/config";
import { LangProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-poppins" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono" });
const caveat = Caveat_Brush({ subsets: ["latin"], weight: "400", variable: "--font-caveat" });
const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "600", "700", "800"], variable: "--font-arabic" });

const description =
  "Français 1re année Bac avec Maître Mohssine : La Boîte à merveilles, Antigone, Le Dernier Jour d'un condamné, cours de langue, production écrite et examens régionaux 2015–2026. Résumé du chapitre 1 gratuit, en français et en arabe.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Le Livre Magique · Français 1re année Bac", template: "%s · Le Livre Magique" },
  description,
  applicationName: "Le Livre Magique",
  keywords: [
    "1ère année bac",
    "français bac Maroc",
    "examen régional français",
    "La Boîte à merveilles résumé",
    "Antigone résumé",
    "Le Dernier Jour d'un condamné résumé",
    "production écrite",
    "Maître Mohssine",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    alternateLocale: ["ar_MA"],
    siteName: "Le Livre Magique",
    title: "Le Livre Magique · Français 1re année Bac",
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Le Livre Magique · Français 1re année Bac", description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B3D91",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Le Livre Magique · Français 1re année Bac",
  description,
  inLanguage: ["fr", "ar"],
  educationalLevel: "1re année du baccalauréat (Maroc)",
  provider: { "@type": "Person", name: "Maître Mohssine" },
  url: site.url,
};

const themeScript = `try{var t=localStorage.getItem('lm-theme');if(t==='dark')document.documentElement.classList.add('dark');var l=localStorage.getItem('lm-lang');if(l==='ar'&&location.pathname.indexOf('/admin')!==0){document.documentElement.lang='ar';document.documentElement.dir='rtl'}if(!sessionStorage.getItem('lm-fade')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('enter-once');sessionStorage.setItem('lm-fade','1')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} ${mono.variable} ${caveat.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body>
        <StoreProvider>
          <LangProvider>
            <Shell>{children}</Shell>
          </LangProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
