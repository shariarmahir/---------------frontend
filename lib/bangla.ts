/** Bangla ↔ ASCII digits, for the site-wide pages (media and gori keep their own). */

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function toAsciiDigits(value: string): string {
  return value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/** A number in Bangla digits with Bangla grouping, e.g. 175700000 → "১৭,৫৭,০০,০০০". */
export function bnNumber(value: number, digits = 0): string {
  return value.toLocaleString("bn-BD", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
