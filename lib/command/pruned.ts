/**
 * "Resolved today" bookkeeping for cases the engine pruned out of the world.
 * Pure (no React, no window) so the store can stay thin and this can be tested.
 *
 * The world keeps at most MAX_CASES cases, so resolved cases fall out of it
 * during a long session. A per-department counter remembers the ones resolved
 * today, and "resolved today" is always: cases still in the world + this counter,
 * for one department or for all three, so every page agrees.
 */
import { bdDate, bdDay, isOpen } from "./selectors.ts";
import type { Dept, World } from "./types.ts";

export interface PrunedToday {
  /** Calendar day in Bangladesh, "YYYY-MM-DD". */
  day: string;
  count: Record<Dept, number>;
}

export const emptyPruned = (day: string): PrunedToday => ({ day, count: { police: 0, consumer: 0, other: 0 } });

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;

/**
 * Fold the cases that left the world between `prev` and `next` into the counter:
 * a pruned case counts when it was closed/resolved today, under its own department.
 * Returns the same object when nothing changed; starts from zeros on a new day.
 */
export function countPruned(counter: PrunedToday, prev: Pick<World, "cases">, next: Pick<World, "cases">, now: number): PrunedToday {
  const day = bdDate(now);
  const base = counter.day === day ? counter : emptyPruned(day);
  if (prev.cases === next.cases) return base;
  const kept = new Set<string>();
  for (const c of next.cases) kept.add(c.id);
  let count: Record<Dept, number> | null = null;
  for (const c of prev.cases) {
    if (kept.has(c.id) || isOpen(c) || c.resolvedAt === undefined || bdDate(c.resolvedAt) !== day) continue;
    count ??= { ...base.count };
    count[c.dept]++;
  }
  return count ? { day, count } : base;
}

/**
 * The counter from a saved blob, for `day` only. A blob from another day, or in
 * the older shape `{ day, count: number }` (one total, no departments), is
 * dropped to zeros: the total cannot be attributed to a department, and a few
 * missing pruned cases for the rest of one day is the lesser error.
 */
export function readCounter(raw: string, day: string): PrunedToday {
  try {
    const p = (JSON.parse(raw) as { prunedToday?: unknown }).prunedToday as { day?: unknown; count?: unknown } | undefined;
    if (p && p.day === day && p.count && typeof p.count === "object") {
      const c = p.count as Partial<Record<Dept, unknown>>;
      if (isCount(c.police) && isCount(c.consumer) && isCount(c.other)) {
        return { day, count: { police: c.police, consumer: c.consumer, other: c.other } };
      }
    }
  } catch {
    // Fall through to a fresh counter.
  }
  return emptyPruned(day);
}

/** Cases still in the world that were resolved or closed today (Bangladesh time), for one department or all. */
export function resolvedInWorld(world: Pick<World, "cases" | "now">, dept?: Dept): number {
  const today = bdDay(world.now);
  let n = 0;
  for (const c of world.cases) {
    if (dept && c.dept !== dept) continue;
    if (!isOpen(c) && c.resolvedAt !== undefined && bdDay(c.resolvedAt) === today) n++;
  }
  return n;
}

/** Pruned cases resolved on the world's day, for one department or all three. */
export function prunedOn(counter: PrunedToday, now: number, dept?: Dept): number {
  if (counter.day !== bdDate(now)) return 0;
  return dept ? counter.count[dept] : counter.count.police + counter.count.consumer + counter.count.other;
}
