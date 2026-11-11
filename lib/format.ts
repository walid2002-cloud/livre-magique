export function formatClock(seconds: number) {
  const v = Math.max(0, Math.floor(seconds));
  const m = Math.floor(v / 60);
  const r = v % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function formatMinutes(seconds: number) {
  const m = Math.max(1, Math.round(seconds / 60));
  return `${m} min`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function dayStamp(iso: string) {
  const d = new Date(iso);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

export function sameDay(a: string, b: string) {
  return dayStamp(a) === dayStamp(b);
}

export function relativeDay(iso: string, now: string) {
  const days = Math.round((dayStamp(now) - dayStamp(iso)) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

export function viewedLabel(count: number, total: number) {
  if (count <= 0) return `Aucune leçon vue sur ${total}`;
  if (count === 1) return `1 leçon vue sur ${total}`;
  return `${count} leçons vues sur ${total}`;
}

export function studentName(prenom: string, nom: string) {
  const full = [prenom, nom].map((p) => p.trim()).filter(Boolean).join(" ");
  return full || "Sans nom";
}

export function watermarkName(prenom: string, nom: string, phone: string | null) {
  const initial = nom.trim().charAt(0);
  const who = [prenom.trim(), initial ? `${initial.toUpperCase()}.` : ""].filter(Boolean).join(" ");
  return phone ? `${who} · ${maskSafe(phone)}` : who;
}

function maskSafe(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length !== 10) return phone;
  return `${d.slice(0, 2)} ${d.slice(2, 4)} •• •• ${d.slice(8, 10)}`;
}

export function deviceLabel(ua: string) {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua) && !/Edg\//.test(ua)
      ? "Chrome"
      : /Safari\//.test(ua) && !/Chrome\//.test(ua)
        ? "Safari"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : "Navigateur";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPad/.test(ua)
      ? "iPad"
      : /iPhone/.test(ua)
        ? "iPhone"
        : /Mac/.test(ua)
          ? "Mac"
          : /Windows/.test(ua)
            ? "Windows"
            : "Appareil";
  return `${browser} · ${os}`;
}

export const CITIES = [
  "Casablanca",
  "Rabat",
  "Salé",
  "Témara",
  "Fès",
  "Marrakech",
  "Tanger",
  "Agadir",
  "Oujda",
  "Meknès",
  "Kénitra",
  "Tétouan",
  "Safi",
  "El Jadida",
  "Nador",
  "Beni Mellal",
  "Khouribga",
  "Taza",
  "Mohammedia",
  "Settat",
  "Larache",
  "Khémisset",
  "Guelmim",
  "Berrechid",
  "Errachidia",
  "Ouarzazate",
  "Laâyoune",
  "Dakhla",
  "Inezgane",
  "Essaouira",
];

export const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "tournee", label: "Tournée" },
  { id: "site", label: "Site" },
  { id: "centre", label: "Centre partenaire" },
] as const;

export function channelLabel(id: string | null) {
  if (id === "librairie") return "Librairie";
  return CHANNELS.find((c) => c.id === id)?.label ?? "—";
}

export function statusLabel(status: string) {
  if (status === "active") return "Activé";
  if (status === "desactive") return "Désactivé";
  if (status === "en_attente") return "En attente";
  if (status === "en_ligne") return "En ligne";
  if (status === "a_tourner") return "À tourner";
  return status;
}
