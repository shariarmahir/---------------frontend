/** The page's one yellow button: the step it wants you to take. */
export const primaryBtn =
  "inline-flex h-12 w-fit items-center justify-center gap-2 bg-(--c-signal) px-6 text-sm font-bold whitespace-nowrap text-black transition-opacity duration-150 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

/** Any other way on: outlined, inverting under the pointer. */
export const secondaryBtn =
  "inline-flex h-12 w-fit items-center justify-center gap-2 border border-(--c-line-strong) bg-(--c-bg) px-6 text-sm font-bold whitespace-nowrap text-(--c-ink-strong) transition-colors duration-150 hover:border-transparent hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)";

/** A small inverted block, for the quiet way out of a cell. */
export const blockBtn = "inline-flex w-fit items-center gap-2 bg-(--c-invert-bg) px-4 py-2 text-sm font-bold text-(--c-invert-fg) transition-opacity duration-150 hover:opacity-80";
