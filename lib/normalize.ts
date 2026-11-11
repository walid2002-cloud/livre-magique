export const PREFIXES = [
  { code: "BAM", min: 1, max: 10, label: "La Boîte à merveilles" },
  { code: "ANT", min: 1, max: 8, label: "Antigone" },
  { code: "DJC", min: 1, max: 8, label: "Le Dernier Jour d'un condamné" },
  { code: "LAN", min: 1, max: 10, label: "Cours de langue" },
  { code: "PE", min: 1, max: 7, label: "Production écrite" },
  { code: "EX", min: 2015, max: 2026, label: "Examens régionaux" },
] as const;

export function canonicalize(input: string): string | null {
  const raw = input.trim().toUpperCase().replace(/[\s_-]+/g, "");
  if (!raw) return null;

  const examShort = raw.match(/^EX(\d{2})$/);
  if (examShort) {
    const yy = Number(examShort[1]);
    const year = yy <= 39 ? 2000 + yy : 1900 + yy;
    return `EX-${year}`;
  }

  const exam = raw.match(/^EX(\d{4})$/);
  if (exam) return `EX-${exam[1]}`;

  const lesson = raw.match(/^(BAM|ANT|DJC|LAN|PE)(\d{1,2})$/);
  if (lesson) return `${lesson[1]}-${lesson[2].padStart(2, "0")}`;

  return null;
}

function levenshtein(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

function nearest(code: string, codes: string[], limit = 3) {
  const prefix = code.slice(0, code.indexOf("-"));
  const same = codes.filter((c) => c.startsWith(`${prefix}-`));
  const pool = same.length ? same : codes;
  const target = Number(code.slice(prefix.length + 1));
  if (Number.isFinite(target)) {
    return [...pool].sort(
      (a, b) =>
        Math.abs(Number(a.slice(prefix.length + 1)) - target) -
        Math.abs(Number(b.slice(prefix.length + 1)) - target),
    ).slice(0, limit);
  }
  return pool.slice(0, limit);
}

export function lookupCode(input: string, codes: string[]) {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: false as const,
      message: "Écris le code imprimé sous le QR, par exemple BAM-03.",
      suggestions: ["BAM-03", "ANT-01", "EX-2019"].filter((c) => codes.includes(c)),
    };
  }

  const canonical = canonicalize(trimmed);
  if (canonical && codes.includes(canonical)) {
    return { ok: true as const, code: canonical };
  }

  const compact = trimmed.toUpperCase().replace(/[\s_-]+/g, "");
  const prefix = PREFIXES.find((p) => compact.startsWith(p.code));

  if (prefix) {
    const range =
      prefix.code === "EX"
        ? `${prefix.code}-${prefix.min} à ${prefix.code}-${prefix.max}`
        : `${prefix.code}-${String(prefix.min).padStart(2, "0")} à ${prefix.code}-${String(prefix.max).padStart(2, "0")}`;
    return {
      ok: false as const,
      message: `Ce code n'existe pas. ${prefix.label} va de ${range}.`,
      suggestions: canonical ? nearest(canonical, codes) : codes.filter((code) => code.startsWith(`${prefix.code}-`)).slice(0, 3),
    };
  }

  const ranked = codes
    .map((code) => ({
      code,
      dist: levenshtein(compact, code.replace("-", "")),
    }))
    .filter((item) => item.dist > 0 && item.dist <= 3)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map((item) => item.code);

  return {
    ok: false as const,
    message: "Ce code n'existe pas. Les codes commencent par BAM, ANT, DJC, LAN, PE ou EX.",
    suggestions: ranked,
  };
}

export function slugFromCode(code: string) {
  return code.toLowerCase();
}

export function normalizePhone(input: string): string | null {
  let digits = input.trim().replace(/[^\d+]/g, "");
  if (digits.startsWith("+212")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("00212")) digits = `0${digits.slice(5)}`;
  else if (digits.startsWith("212")) digits = `0${digits.slice(3)}`;
  if (!/^0[567]\d{8}$/.test(digits)) return null;
  return digits;
}

export function normalizeLogin(input: string): string | null {
  const compact = input.trim().toUpperCase().replace(/[\s-]+/g, "");
  if (/^LM\d{5}$/.test(compact)) return `LM-${compact.slice(2)}`;
  return normalizePhone(input);
}

export function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length !== 10) return phone;
  return `${d.slice(0, 2)} ${d.slice(2, 4)} •• •• ${d.slice(8, 10)}`;
}

export function displayPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length !== 10) return phone;
  return `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

export function toWaNumber(local: string) {
  return `212${local.replace(/\D/g, "").slice(1)}`;
}
