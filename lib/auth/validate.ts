/**
 * Input rules for the account forms. Pure, so the forms, the mock gateway
 * and the tests all apply the same checks.
 */

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toAsciiDigits(value: string): string {
  return value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/**
 * A Bangladeshi mobile number as "01XXXXXXXXX", or null. Accepts +880 /
 * 880 prefixes, spaces, dashes and Bangla digits. Operator codes 013–019.
 */
export function normalizePhone(raw: string): string | null {
  let v = toAsciiDigits(raw).replace(/[\s\-().]/g, "");
  if (v.startsWith("+880")) v = `0${v.slice(4)}`;
  else if (v.startsWith("880")) v = `0${v.slice(3)}`;
  return /^01[3-9]\d{8}$/.test(v) ? v : null;
}

/** "01700000001" → "০১৭০০-০০০০০১" */
export function formatPhone(phone: string): string {
  return toBanglaDigits(`${phone.slice(0, 5)}-${phone.slice(5)}`);
}

/** "01700000001" → "০১৭•••••০১" — for "code sent to …". */
export function maskPhone(phone: string): string {
  return toBanglaDigits(`${phone.slice(0, 3)}•••••${phone.slice(-2)}`);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(normalizeEmail(raw));
}

/** Email if it has an @, otherwise a phone number. */
export function identifierKind(raw: string): "email" | "phone" {
  return raw.includes("@") ? "email" : "phone";
}

export type PasswordIssue = "short" | "long" | "letter" | "digit";

export const PASSWORD_ISSUE_BN: Record<PasswordIssue, string> = {
  short: "কমপক্ষে ৮ অক্ষর",
  long: "৭২ অক্ষরের বেশি নয়",
  letter: "অন্তত একটি অক্ষর (a–z)",
  digit: "অন্তত একটি সংখ্যা (0–9)",
};

export function passwordIssues(pw: string, min = 8, max = 72): PasswordIssue[] {
  const out: PasswordIssue[] = [];
  if (pw.length < min) out.push("short");
  if (pw.length > max) out.push("long");
  if (!/\p{L}/u.test(pw)) out.push("letter");
  if (!/[0-9০-৯]/.test(pw)) out.push("digit");
  return out;
}

/** 0 (empty) … 4 (strong): length, mixed case, digits, symbols. */
export function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9০-৯]/.test(pw) && /[^\p{L}0-9০-৯]/u.test(pw)) score++;
  return Math.max(1, Math.min(4, score)) as 1 | 2 | 3 | 4;
}

/** First letter of the name (a whole Bangla grapheme, titles skipped) for avatars. */
export function initialsOf(name: string): string {
  const word = name.trim().replace(/^(ডা\.|ড\.|dr\.?|md\.?|মো\.)\s*/i, "").split(/\s+/)[0] ?? "";
  const first = new Intl.Segmenter("bn", { granularity: "grapheme" }).segment(word)[Symbol.iterator]().next().value;
  return first ? first.segment.toUpperCase() : "?";
}

export function validName(raw: string): boolean {
  const v = raw.trim();
  return v.length >= 3 && v.length <= 60 && /\p{L}/u.test(v);
}

/**
 * Where to go after signing in. Only same-site paths are allowed, so a
 * crafted `?next=https://evil.example` link cannot bounce people off-site,
 * and the auth pages themselves are never a destination.
 */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  const path = next.split(/[?#]/)[0];
  if (path === "/login" || path === "/signup") return fallback;
  return next;
}
