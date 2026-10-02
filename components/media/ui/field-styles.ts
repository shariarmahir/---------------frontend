/** Native <select> styled like the shadcn Input, for short fixed lists. */
export const selectClass =
  "h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-[15px] text-white hover:border-white/30 focus-visible:border-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange/25 focus-visible:outline-none aria-invalid:border-crimson-bright";

/** A pill that acts as a radio or toggle. */
export function choiceClass(on: boolean) {
  return [
    "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border-2 px-3 text-sm font-semibold transition-[color,background-color,border-color,scale] duration-200 active:scale-[0.97] has-focus-visible:ring-2 has-focus-visible:ring-signal-orange",
    on ? "border-signal-orange bg-signal-orange/10 text-signal-orange" : "border-white/12 text-white/80 hover:border-white/30 hover:text-white",
  ].join(" ");
}

/** A filter chip link (feeds, boards). */
export function chipClass(on: boolean) {
  return [
    "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,translate,box-shadow] duration-200 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0",
    on ? "border-signal-orange bg-signal-orange text-text-primary shadow-[0_8px_20px_-12px_var(--color-signal-orange)]" : "border-white/12 bg-text-primary text-white/80 hover:border-signal-orange/40 hover:text-signal-orange",
  ].join(" ");
}

/** Digits typed in either script, as a number (0 when empty). */
export function toNumber(raw: string): number {
  return Number(raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d]/g, "")) || 0;
}
