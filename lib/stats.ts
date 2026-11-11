import type { DB } from "./types";
import { sameDay } from "./format";

function since(now: string, days: number) {
  return new Date(now).getTime() - days * 86_400_000;
}

export function countEvents(db: DB, type: DB["events"][number]["type"], now: string, days: number, olderThan = 0) {
  const start = since(now, days);
  const end = since(now, olderThan);
  return db.events.filter((e) => {
    if (e.type !== type) return false;
    const t = new Date(e.creeLe).getTime();
    return t >= start && t < end;
  }).length;
}

export function kpis(db: DB, now: string) {
  const accounts = db.students.length;
  const createdToday = db.students.filter((s) => sameDay(s.creeLe, now)).length;
  const active = db.students.filter((s) => s.statut === "active").length;
  const scans7 = countEvents(db, "scan_qr", now, 7);
  const scansPrev = countEvents(db, "scan_qr", now, 14, 7);
  const online = db.lessons.filter((l) => l.statut === "en_ligne").length;
  const total = db.lessons.length;
  return {
    accounts,
    createdToday,
    active,
    activePct: accounts ? Math.round((active / accounts) * 100) : 0,
    scans7,
    scansPrev,
    online,
    total,
    toShoot: total - online,
  };
}

export function evolutionLabel(current: number, previous: number) {
  if (previous === 0) return current === 0 ? "stable" : "nouveau";
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "stable";
  return `${pct > 0 ? "+" : ""}${pct} %`;
}

export function topScans(db: DB, now: string, limit = 5) {
  const start = since(now, 7);
  const map = new Map<string, number>();
  for (const event of db.events) {
    if (event.type !== "scan_qr" || !event.lessonId) continue;
    if (new Date(event.creeLe).getTime() < start) continue;
    map.set(event.lessonId, (map.get(event.lessonId) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([lessonId, count]) => ({ lessonId, count }));
}

export function scansForLesson(db: DB, lessonId: string, now: string) {
  const start = since(now, 7);
  return db.events.filter(
    (e) => e.type === "scan_qr" && e.lessonId === lessonId && new Date(e.creeLe).getTime() >= start,
  ).length;
}
