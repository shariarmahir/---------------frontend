import { cn } from "@/lib/utils";

/*
 * Form parts in the catalogue's dress, for the shared shadcn Input,
 * Textarea and Form pieces: square, sunk into the page, the yellow edge on
 * focus, red for what is wrong. Their colours come from the stylesheet
 * (`.catalogue [data-slot=…]`, which outranks the /media shell's own); these
 * classes give the shape.
 */

/** An input, textarea or select. A bare select gets `data-slot="form-control"` from FormControl, or pass it. */
export const fieldClass =
  "h-auto min-h-11 w-full rounded-none border px-4 py-2.5 text-base shadow-none transition-colors duration-150 focus-visible:ring-0 focus-visible:outline-none aria-invalid:ring-0 disabled:opacity-50";

/** A field's label. */
export const labelClass = "text-sm font-semibold text-(--c-ink)";

/** What is wrong with a field. */
export const messageClass = "text-xs font-semibold text-(--c-bad)";

/** A square choice acting as a radio or a toggle; the chosen one inverts. */
export function choiceClass(on: boolean, className?: string) {
  return cn(
    "inline-flex min-h-10 cursor-pointer items-center gap-1.5 border px-3 text-sm font-semibold transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--c-signal)",
    on ? "border-transparent bg-(--c-invert-bg) text-(--c-invert-fg)" : "border-(--c-line-strong) text-(--c-muted) hover:border-(--c-ink) hover:text-(--c-ink-strong)",
    className,
  );
}
