import { test } from "node:test";
import assert from "node:assert/strict";
import { seedWorld } from "./generate.ts";
import { countPruned, emptyPruned, prunedOn, readCounter, resolvedInWorld } from "./pruned.ts";
import { tick } from "./engine.ts";
import type { Case, World } from "./types.ts";

/** 12:00 in Bangladesh on 25 Oct 2026. */
const T = Date.UTC(2026, 9, 25, 6, 0, 0);
const DAY = "2026-10-25";

const done = (c: Case, id: string, dept: Case["dept"], at: number): Case => ({ ...c, id, dept, status: "closed", resolvedAt: at });

test("countPruned adds each dropped resolved-today case under its own department", () => {
  const base = seedWorld(7, T).cases[0];
  const a = done(base, "PB-900001", "police", T - 3600_000);
  const b = done(base, "PB-900002", "consumer", T - 3600_000);
  const c = done(base, "PB-900003", "consumer", T - 7200_000);
  const yesterday = done(base, "PB-900004", "other", T - 30 * 3600_000);
  const open: Case = { ...base, id: "PB-900005", dept: "other", status: "new", resolvedAt: undefined };
  const prev = { cases: [a, b, c, yesterday, open, base] };
  const next = { cases: [open, base] };
  const out = countPruned(emptyPruned(DAY), prev, next, T);
  assert.deepEqual(out.count, { police: 1, consumer: 2, other: 0 });
  assert.equal(prunedOn(out, T), 3);
  assert.equal(prunedOn(out, T, "consumer"), 2);
  assert.equal(prunedOn(out, T, "other"), 0);
  // It accumulates, and no change returns the same object.
  const again = countPruned(out, prev, next, T);
  assert.deepEqual(again.count, { police: 2, consumer: 4, other: 0 });
  assert.equal(countPruned(out, next, next, T), out);
});

test("countPruned starts from zeros on a new day, and prunedOn ignores a stale day", () => {
  const w = seedWorld(7, T);
  const old = { day: "2026-10-24", count: { police: 5, consumer: 5, other: 5 } };
  assert.deepEqual(countPruned(old, w, w, T), emptyPruned(DAY));
  assert.equal(prunedOn(old, T), 0);
});

test("readCounter reads the per-department shape for today only", () => {
  const good = JSON.stringify({ prunedToday: { day: DAY, count: { police: 1, consumer: 2, other: 3 } } });
  assert.deepEqual(readCounter(good, DAY), { day: DAY, count: { police: 1, consumer: 2, other: 3 } });
  assert.deepEqual(readCounter(good, "2026-10-26"), emptyPruned("2026-10-26"));
});

test("readCounter resets the older single-total shape and rejects bad data", () => {
  const blob = (count: unknown) => JSON.stringify({ prunedToday: { day: DAY, count } });
  assert.deepEqual(readCounter(blob(4), DAY), emptyPruned(DAY));
  assert.deepEqual(readCounter(blob({ police: -1, consumer: 0, other: 0 }), DAY), emptyPruned(DAY));
  assert.deepEqual(readCounter(blob({ police: 1.5, consumer: 0, other: 0 }), DAY), emptyPruned(DAY));
  assert.deepEqual(readCounter(blob({ police: 1 }), DAY), emptyPruned(DAY));
  assert.deepEqual(readCounter(JSON.stringify({ world: {} }), DAY), emptyPruned(DAY));
  assert.deepEqual(readCounter("not json", DAY), emptyPruned(DAY));
});

test("police + consumer + other 'resolved today' equals the all-department figure after a prune", () => {
  const w0 = seedWorld(7, T);
  const closed = w0.cases.find((c) => c.status === "closed");
  assert.ok(closed);
  const depts = ["police", "consumer", "other"] as const;
  const filler: Case[] = Array.from({ length: 260 }, (_, i) => ({
    ...closed,
    id: `PB-9${String(i).padStart(5, "0")}`,
    dept: depts[i % 3],
    reportedAt: T - 5 * 3600_000 + i * 1000,
    resolvedAt: T - 4 * 3600_000 + i * 1000,
  }));
  const big: World = { ...w0, cases: [...w0.cases, ...filler] };
  const all = (w: World, c = emptyPruned(DAY)) => resolvedInWorld(w) + prunedOn(c, w.now);
  const before = all(big);
  const next = tick(big, T + 1000, { responders: false });
  assert.ok(next.cases.length < big.cases.length, "something was pruned");
  const counter = countPruned(emptyPruned(DAY), big, next, next.now);
  const per = depts.map((d) => resolvedInWorld(next, d) + prunedOn(counter, next.now, d));
  assert.equal(per[0] + per[1] + per[2], all(next, counter));
  // Pruning moves cases from the world into the counter without losing any.
  assert.equal(all(next, counter), before);
});
