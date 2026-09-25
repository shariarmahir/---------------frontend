/** Native <select> styled like the shadcn Input, for short fixed lists. */
export const selectClass =
  "h-11 w-full rounded-lg border border-card-border bg-white px-3 text-[15px] text-text-primary focus-visible:border-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/20 focus-visible:outline-none aria-invalid:border-national-crimson";

/** A pill that acts as a radio or toggle. */
export function choiceClass(on: boolean) {
  return [
    "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border-2 px-3 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-bd-green/30",
    on ? "border-bd-green bg-bd-green-light text-bd-green-dark" : "border-card-border text-text-secondary hover:border-slate-300",
  ].join(" ");
}

/** A filter chip link (feeds, boards). */
export function chipClass(on: boolean) {
  return [
    "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
    on ? "border-bd-green bg-bd-green text-white" : "border-card-border bg-white text-text-secondary hover:border-bd-green/40 hover:text-bd-green",
  ].join(" ");
}

/** Digits typed in either script, as a number (0 when empty). */
export function toNumber(raw: string): number {
  return Number(raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, "")) || 0;
}
