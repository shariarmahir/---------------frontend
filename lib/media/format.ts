/**
 * Number, money and time formatting. Bangla digits by default; every
 * function takes `numerals: "latn"` for the Latin-digit option. Unit words
 * (হা, লাখ, মিনিট আগে) stay Bangla either way — only the digits change.
 */

export type Numerals = "bn" | "latn";

const BN = "০১২৩৪৫৬৭৮৯";

export function digits(value: number | string, numerals: Numerals = "bn"): string {
  const s = String(value);
  return numerals === "bn"
    ? s.replace(/[0-9]/g, (d) => BN[Number(d)])
    : s.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));
}

/** Kept for existing call sites; same as digits(value, "bn"). */
export function bnDigits(value: number | string): string {
  return digits(value, "bn");
}

const grouping = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ৳ with lakh grouping: 125000 → "৳১,২৫,০০০" (or "৳1,25,000"). */
export function taka(amount: number, numerals: Numerals = "bn"): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}৳${digits(grouping.format(Math.abs(Math.round(amount))), numerals)}`;
}

function oneDecimal(n: number, numerals: Numerals): string {
  return digits(n.toFixed(1).replace(/\.0$/, ""), numerals);
}

/** Short counts: 1200 → "১.২ হা", 1500000 → "১৫ লাখ", 25000000 → "২.৫ কোটি". */
export function compactBn(n: number, numerals: Numerals = "bn"): string {
  if (n < 1000) return digits(n, numerals);
  if (n < 100_000) return `${oneDecimal(n / 1000, numerals)} হা`;
  if (n < 10_000_000) return `${oneDecimal(n / 100_000, numerals)} লাখ`;
  return `${oneDecimal(n / 10_000_000, numerals)} কোটি`;
}

export function timeAgoBn(iso: string, now: Date, numerals: Numerals = "bn"): string {
  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "এইমাত্র";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${digits(minutes, numerals)} মিনিট আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${digits(hours, numerals)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${digits(days, numerals)} দিন আগে`;
  return `${digits(Math.floor(days / 30), numerals)} মাস আগে`;
}
