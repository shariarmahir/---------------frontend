/**
 * MOTHERLAND's "bright future" model (components/motherland/invest.tsx):
 * an illustrative projection, not a forecast. Income per person grows each
 * year at one rate, built from four choices the visitor makes, and exports
 * grow at their own rate. Kept pure so the page and the tests share it.
 */

export interface Plan {
  /** Investment, % of GDP (20–40). */
  investment: number;
  /** Export growth, % a year (0–20). */
  exports: number;
  /** Young people with job skills, % (10–80). */
  skills: number;
  /** How many growth sectors are backed (0–8). */
  sectors: number;
}

export type Point = [year: number, value: number];

/**
 * The yearly growth of income per person. Today's levers (30% investment,
 * 8% export growth, 30% skilled, two sectors) give about 4.6%, close to the
 * country's recent pace; every lever at its best gives just under 10%.
 */
export function growthRate({ investment, exports, skills, sectors }: Plan): number {
  return 0.1 * (investment / 100) + 0.03 * (skills / 100) + 0.1 * (exports / 100) + 0.0025 * sectors - 0.006;
}

/** Income per person each year from `start` to `horizon`, compounding at the plan's rate. */
export function project(plan: Plan, start: Point, horizon: number): Point[] {
  const rate = growthRate(plan);
  const [year0, value0] = start;
  return Array.from({ length: horizon - year0 + 1 }, (_, i) => [year0 + i, value0 * (1 + rate) ** i]);
}

/** Exports in `years` from now, US$ billion: export growth plus a little for every sector backed. */
export function exportsAfter(plan: Plan, today: number, years: number): number {
  return today * (1 + plan.exports / 100 + 0.004 * plan.sectors) ** years;
}

/** The first year a projection reaches `value`, or null if it never does. */
export function yearReaching(points: Point[], value: number): number | null {
  return points.find(([, v]) => v >= value)?.[0] ?? null;
}
