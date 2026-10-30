import { cn } from "@/lib/utils";

/**
 * The About page's card: a solid field with a block of another field set
 * off behind its lower right corner, sharp and flat (no blur, no glow). On
 * hover the card lifts up and to the left and the block shows a little
 * more. The block's colour comes from `--offset` (see `offsetFor`).
 */
export const OFFSET_CARD = cn(
  "relative rounded-3xl ring-1 ring-white/12 ring-inset",
  "shadow-[10px_10px_0_0_var(--offset)] transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "motion-reduce:transition-none",
);

/** The lift, for a card that is itself the hover target (or sits in a `group/card`). */
export const OFFSET_LIFT = cn(
  "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[14px_14px_0_0_var(--offset)]",
  "motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0",
);

const NAVY = "var(--color-bdnavy-900)";
const COBALT = "var(--color-cobalt)";

/** The block behind a card: cobalt behind navy and ink, navy behind cobalt, so the two never match. */
export function offsetFor(field: string) {
  return field === COBALT ? NAVY : COBALT;
}

/** The three fields as values for `--field` and `--offset`. */
export const ABOUT_FIELDS = {
  navy: { field: NAVY, offset: COBALT },
  cobalt: { field: COBALT, offset: NAVY },
  ink: { field: "var(--color-text-primary)", offset: COBALT },
} as const;

export type AboutField = keyof typeof ABOUT_FIELDS;
