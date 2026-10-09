/**
 * The line-up grid runs one column, then two, three and four as its
 * container widens. The cell after the last card stretches over what is
 * left of its row at every one of those widths, so the hairline grid never
 * shows a hole.
 */
const FILL: Record<2 | 3 | 4, string[]> = {
  2: ["", "@2xl:col-span-1", "@2xl:col-span-2"],
  3: ["", "@5xl:col-span-1", "@5xl:col-span-2", "@5xl:col-span-3"],
  4: ["", "@6xl:col-span-1", "@6xl:col-span-2", "@6xl:col-span-3", "@6xl:col-span-4"],
};

/** The line-up grid itself; put it inside an `@container`. */
export const lineupGrid = "grid gap-px bg-(--c-line) @2xl:grid-cols-2 @5xl:grid-cols-3 @6xl:grid-cols-4";

export const fillRow = (cards: number) => ([2, 3, 4] as const).map((cols) => FILL[cols][cols - (cards % cols)]).join(" ");
