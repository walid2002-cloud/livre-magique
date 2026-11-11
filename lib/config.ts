export const site = {
  name: "Le Livre Magique",
  domain: "livremagique.ma",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://livremagique.ma",
  level: "Français · 1ʳᵉ année Bac",
  supportDisplay: "06 61 00 00 00",
  supportLocal: "0661000000",
  supportWa: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "212661000000",
  bookId: "book_lm",
};

export function lessonUrl(slug: string, source: "qr" | "code") {
  const base = site.url.replace(/\/$/, "");
  return `${base}/v/${slug}?s=${source}`;
}

export function waLink(phone212: string, text: string) {
  return `https://wa.me/${phone212}?text=${encodeURIComponent(text)}`;
}

export function accessMessage(input: { prenom: string; identifiant: string; password: string }) {
  const hello = input.prenom.trim() ? `Mabrouk ${input.prenom.trim()} !` : "Mabrouk !";
  return `${hello} Le Livre Magique dyalk wsal 🎉
Accès aux vidéos de Maître Mohssine :
🌐 ${site.domain}
👤 Identifiant : ${input.identifiant}
🔑 Mot de passe : ${input.password}
📱 Scanne les QR du livre
💻 Ou tape le code sous le QR (ex : BAM-03)
⚠ Compte personnel, 2 appareils max.`;
}
