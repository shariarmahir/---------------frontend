/** Native <select> styled like the shadcn Input, for short fixed lists. */
export const selectClass =
  "h-11 w-full rounded-lg border border-m-ink/13 bg-m-canvas px-3 text-[15px] text-m-ink hover:border-m-ink/26 focus-visible:border-m-blue focus-visible:ring-2 focus-visible:ring-m-blue/25 focus-visible:outline-none aria-invalid:border-m-red";

/** A pill that acts as a radio or toggle. */
export function choiceClass(on: boolean) {
  return [
    "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border-2 px-3 text-sm font-semibold transition-[color,background-color,border-color,scale] duration-200 active:scale-[0.97] has-focus-visible:ring-2 has-focus-visible:ring-m-blue",
    on ? "border-m-blue bg-m-yellow/10 text-m-blue" : "border-m-ink/10 text-m-ink/80 hover:border-m-ink/26 hover:text-m-ink",
  ].join(" ");
}

/** A filter chip link (feeds, boards). */
export function chipClass(on: boolean) {
  return [
    "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,translate,box-shadow] duration-200 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0",
    on ? "border-m-blue bg-m-yellow text-m-ink shadow-[0_8px_20px_-12px_var(--color-signal-orange)]" : "border-m-ink/10 bg-m-card text-m-ink/80 hover:border-m-blue/40 hover:text-m-blue",
  ].join(" ");
}

/** Digits typed in either script, as a number (0 when empty). */
export function toNumber(raw: string): number {
  return Number(raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, "")) || 0;
}
