const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function hashPassword(password: string) {
  const s = password.trim().toUpperCase();
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0x9e3779b9;
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= s.charCodeAt(s.length - 1 - i);
    h2 = Math.imul(h2, 0x01000193);
  }
  return `h.${(h1 >>> 0).toString(16)}.${(h2 >>> 0).toString(16)}`;
}

export function generatePassword() {
  const bytes = new Uint32Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function passwordAlphabet() {
  return ALPHABET;
}

export function isGeneratedShape(password: string) {
  return new RegExp(`^[${ALPHABET}]{6}$`).test(password);
}
