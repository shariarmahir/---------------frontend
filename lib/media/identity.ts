/**
 * Format checks for identity documents, run before anything is sent for
 * verification. They catch typos only — whether a number is real is for
 * the Election Commission / passport authority check on the server.
 */

const BN = "০১২৩৪৫৬৭৮৯";

/** Bangla digits → ASCII, spaces and dashes removed. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[০-৯]/g, (d) => String(BN.indexOf(d)))
    .replace(/[\s-]/g, "");
}

export type NidError = "empty" | "digits" | "length";

/** Smart card (10), old laminated card (13) or 17-digit with birth year. */
export const NID_LENGTHS = [10, 13, 17];

export function validateNid(raw: string): NidError | null {
  const v = normalizeDigits(raw);
  if (!v) return "empty";
  if (!/^\d+$/.test(v)) return "digits";
  if (!NID_LENGTHS.includes(v.length)) return "length";
  return null;
}

export type PassportError = "empty" | "format";

/** 9 characters: 1–2 letters then digits (MRP "BN0123456", e-passport "A01234567"). */
export function validatePassport(raw: string): PassportError | null {
  const v = raw.replace(/[\s-]/g, "").toUpperCase();
  if (!v) return "empty";
  if (v.length !== 9 || !/^[A-Z]{1,2}\d{7,8}$/.test(v)) return "format";
  return null;
}
