/**
 * Patrol windows for the Women safety and Emergency pages. Pure functions; no
 * clock. The survivor privacy rules (safeTitleBn, redactCase) live in
 * lib/command/privacy and are re-exported here for these pages.
 */
import { AREAS, historyFor, hourMatrix } from "@/lib/command/history";
import type { Hotspot } from "@/lib/command/intel";
import { WOMEN_CATEGORIES } from "@/lib/command/routing";
import type { DivisionScope } from "@/lib/command/selectors";
import type { DivisionId } from "@/lib/command/types";

export { redactCase, safeTitleBn } from "@/lib/command/privacy";

/* ───────────── where to patrol ───────────── */

const WINDOW_HOURS = 3;
const pad = (h: number): string => String(h).padStart(2, "0");

/** "17:00–20:00". */
export const hourWindow = (start: number, hours = WINDOW_HOURS): string => `${pad(start)}:00–${pad((start + hours) % 24)}:00`;

export interface PeakWindow {
  start: number;
  /** Women and child reports in those three hours over the 30-day history. */
  count: number;
}

const peakCache = new Map<string, PeakWindow | null>();

/** The three hours of the day with the most harassment and violence reports in one area's 30-day history. */
export function peakWindow(seed: number, area: number): PeakWindow | null {
  const key = `${seed}|${area}`;
  const hit = peakCache.get(key);
  if (hit !== undefined) return hit;
  const byHour = hourMatrix(historyFor(seed), { areas: [area], categories: WOMEN_CATEGORIES }).map((r) => r.reduce((a, b) => a + b, 0));
  let best: PeakWindow | null = null;
  for (let s = 0; s < 24; s++) {
    let n = 0;
    for (let k = 0; k < WINDOW_HOURS; k++) n += byHour[(s + k) % 24];
    if (n > 0 && (!best || n > best.count)) best = { start: s, count: n };
  }
  if (peakCache.size > 512) peakCache.clear();
  peakCache.set(key, best);
  return best;
}

export interface PatrolStop {
  area: number;
  areaBn: string;
  district: string;
  division: DivisionId;
  /** Women and child reports here in the last hour (0 when the stop comes from the history alone). */
  live: number;
  rising: boolean;
  window: PeakWindow | null;
}

/**
 * Where to patrol for women's safety: the areas with women and child reports in
 * the last hour (rising first), each with its usual worst three hours; topped
 * up from the history's busiest areas in the scope so the list is never empty.
 */
export function patrolPlan(seed: number, spots: readonly Hotspot[], div: DivisionScope, limit = 6): PatrolStop[] {
  const out: PatrolStop[] = spots.slice(0, limit).map((h) => ({
    area: h.area,
    areaBn: h.areaBn,
    district: h.district,
    division: h.division,
    live: h.count,
    rising: h.rising,
    window: peakWindow(seed, h.area),
  }));
  if (out.length >= limit) return out;
  const taken = new Set(out.map((s) => s.area));
  const rest = AREAS.map((p, a) => ({ p, a, w: peakWindow(seed, a) }))
    .filter(({ p, a, w }) => !taken.has(a) && w !== null && (div === undefined || div === "all" || p.division === div))
    .sort((x, y) => (y.w?.count ?? 0) - (x.w?.count ?? 0) || x.a - y.a);
  for (const { p, a, w } of rest.slice(0, limit - out.length)) {
    out.push({ area: a, areaBn: p.areaBn, district: p.district, division: p.division, live: 0, rising: false, window: w });
  }
  return out;
}
