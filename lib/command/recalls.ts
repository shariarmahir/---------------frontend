/**
 * Remove from sale: each recall's progress (ordered → seizing → seized →
 * destroyed) lives in the world, so operators' actions are kept with the demo.
 * Pure functions; the actions return an ActionResult like lib/command/actions.
 */
import { mulberry32, weighted } from "./rng.ts";
import type { ActionResult, Danger, RecallItem, RecallState, RecallStatus, World } from "./types.ts";
import { HAZARDS, RECALLS, REGULATORS, type HazardInfo } from "../../data/command/recalls.ts";

export { HAZARDS, RECALLS, REGULATORS } from "../../data/command/recalls.ts";

const HOUR = 3600_000;
const DAY = 24 * HOUR;
export const RECALL_ORDER: readonly RecallStatus[] = ["ordered", "seizing", "seized", "destroyed"];
/** Most units one seizure entry may log, and most a recall may hold in all. */
export const MAX_SEIZURE_UNITS = 100_000;
export const MAX_SEIZED_TOTAL = 1_000_000;

const fail = (error: string): ActionResult => ({ ok: false, error });
const regulatorShort = (r: RecallItem): string => REGULATORS[r.regulator].short;
const units = (n: number): string => `${n.toLocaleString("en-US")} unit${n === 1 ? "" : "s"}`;

/**
 * Where each recall stands when a demo starts: a few just ordered, most being
 * seized, some finished. Drawn from its own generator (seed-derived), so the
 * world's case sequence is untouched. Every log time is before `now`.
 */
export function seedRecalls(seed: number, now: number): Record<string, RecallState> {
  const r = mulberry32((seed ^ 0x2ec0a115) >>> 0);
  const out: Record<string, RecallState> = {};
  for (const item of RECALLS) {
    const status = weighted(r, [
      { item: "ordered" as const, weight: 3 },
      { item: "seizing" as const, weight: 4 },
      { item: "seized" as const, weight: 2 },
      { item: "destroyed" as const, weight: 1.5 },
    ]);
    const step = RECALL_ORDER.indexOf(status);
    // Ordered 4 to 10 days ago; the later steps add at most 77 hours, so every entry is in the past.
    let at = now - Math.round((4 + r.next() * 6) * DAY);
    const log: RecallState["log"] = [
      { at, text: `Recall ordered by ${regulatorShort(item)}: remove from sale in ${item.districts.join(", ")}` },
    ];
    let seized = 0;
    if (step >= 1) {
      at += Math.round((2 + r.next() * 20) * HOUR);
      log.push({ at, text: "Seizure started" });
      const share = step === 1 ? 0.2 + 0.4 * r.next() : 0.8 + 0.2 * r.next();
      seized = Math.max(1, Math.round(item.seededUnits * share));
      at += Math.round((1 + r.next() * 10) * HOUR);
      log.push({ at, text: `Seized ${units(seized)} in ${item.districts[0]}` });
    }
    if (step >= 2) {
      at += Math.round((2 + r.next() * 12) * HOUR);
      log.push({ at, text: `Seizure complete: ${units(seized)} held` });
    }
    if (step >= 3) {
      at += Math.round((6 + r.next() * 24) * HOUR);
      log.push({ at, text: `Destroyed ${units(seized)} under ${regulatorShort(item)} supervision` });
    }
    out[item.id] = { status, seizedUnits: seized, updatedAt: log[log.length - 1].at, log };
  }
  return out;
}

/** The world's recall states; a world saved without them gets the seeded ones. */
export function recallsOf(world: World): Record<string, RecallState> {
  return world.recalls ?? seedRecalls(world.seed, world.now);
}

const recallItem = (id: string): RecallItem | undefined => RECALLS.find((r) => r.id === id);

/** Applies `edit` to a copy of one recall's state; the world and every other recall stay as they were. */
function actOn(world: World, id: string, edit: (s: RecallState, item: RecallItem) => string | RecallState): ActionResult {
  const item = recallItem(id);
  if (!item) return fail(`Recall ${id} not found.`);
  const all = recallsOf(world);
  const current = all[id];
  if (!current) return fail(`Recall ${id} has no record in this demo.`);
  const next = edit({ ...current, log: current.log.slice() }, item);
  if (typeof next === "string") return fail(next);
  return { ok: true, world: { ...world, recalls: { ...all, [id]: next } } };
}

/** One step along ordered → seizing → seized → destroyed. Seized needs at least one unit logged. */
export function advanceRecall(world: World, id: string, now: number): ActionResult {
  return actOn(world, id, (s, item) => {
    const i = RECALL_ORDER.indexOf(s.status);
    if (i === RECALL_ORDER.length - 1) return "This recall is finished: the stock was destroyed.";
    const status = RECALL_ORDER[i + 1];
    if (status === "seized" && s.seizedUnits < 1) return "Log the units seized before marking the seizure complete.";
    const text =
      status === "seizing" ? "Seizure started"
      : status === "seized" ? `Seizure complete: ${units(s.seizedUnits)} held`
      : `Destroyed ${units(s.seizedUnits)} under ${regulatorShort(item)} supervision`;
    s.log.push({ at: now, text });
    return { ...s, status, updatedAt: now };
  });
}

/**
 * Logs units taken off shelves: a whole number from 1 to MAX_SEIZURE_UNITS,
 * while the recall is ordered or seizing (an ordered recall moves to seizing),
 * and never past MAX_SEIZED_TOTAL in all.
 */
export function logSeizure(world: World, id: string, count: number, now: number): ActionResult {
  if (!Number.isInteger(count) || count < 1 || count > MAX_SEIZURE_UNITS) {
    return fail(`Enter a whole number of units from 1 to ${MAX_SEIZURE_UNITS.toLocaleString("en-US")}.`);
  }
  return actOn(world, id, (s) => {
    if (s.status !== "ordered" && s.status !== "seizing") return "The seizure is already complete for this recall.";
    if (s.seizedUnits + count > MAX_SEIZED_TOTAL) return `A recall can hold at most ${units(MAX_SEIZED_TOTAL)}.`;
    if (s.status === "ordered") s.log.push({ at: now, text: "Seizure started" });
    s.log.push({ at: now, text: `Seized ${units(count)}` });
    return { ...s, status: "seizing", seizedUnits: s.seizedUnits + count, updatedAt: now };
  });
}

export interface RecallRow {
  item: RecallItem;
  hazard: HazardInfo;
  regulator: (typeof REGULATORS)[keyof typeof REGULATORS];
  state: RecallState;
  /** Units seized against the units expected, 0 to 1. */
  progress: number;
}

const DANGER_RANK: Record<Danger, number> = { critical: 0, high: 1, medium: 2 };

const rowsMemo = new WeakMap<object, RecallRow[]>();

/**
 * Every recall joined with its hazard, regulator and state: most dangerous
 * first, unfinished before finished. The same recall states (an untouched
 * `world.recalls`) give the same array, so pages don't re-render every tick.
 */
export function recallRows(world: World): RecallRow[] {
  const memoKey: object = world.recalls ?? world;
  const hit = rowsMemo.get(memoKey);
  if (hit) return hit;
  const rows = buildRows(recallsOf(world));
  rowsMemo.set(memoKey, rows);
  return rows;
}

function buildRows(states: Record<string, RecallState>): RecallRow[] {
  return RECALLS.filter((item) => states[item.id])
    .map((item) => {
      const state = states[item.id];
      return {
        item,
        hazard: HAZARDS[item.hazard],
        regulator: REGULATORS[item.regulator],
        state,
        progress: Math.min(1, state.seizedUnits / item.seededUnits),
      };
    })
    .sort(
      (a, b) =>
        Number(a.state.status === "destroyed") - Number(b.state.status === "destroyed") ||
        DANGER_RANK[a.item.danger] - DANGER_RANK[b.item.danger] ||
        a.item.id.localeCompare(b.item.id),
    );
}
