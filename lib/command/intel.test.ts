import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_POLICE_PER_HOUR,
  THREAT_THRESHOLDS,
  baselinePerHour,
  coverageStart,
  divisionThreat,
  earlyWarnings,
  hotspots,
  hourPattern,
  networks,
  recommendations,
  responseCertainty,
} from "./intel.ts";
import { AREAS, historyFor } from "./history.ts";
import { seedWorld } from "./generate.ts";
import { nearestHome } from "./geo.ts";
import { POLICE_CATEGORIES } from "./routing.ts";
import type { Case, Category, World } from "./types.ts";
import { STATIONS } from "../../data/command/stations.ts";

/** 19:00 in Bangladesh on 25 Oct 2026 (13:00 UTC). */
const T = Date.UTC(2026, 9, 25, 13, 0, 0);
const MIN = 60_000;
const SEED = 7;
const BASE = seedWorld(SEED, T);
const h = historyFor(SEED);

let n = 0;
/** A police case at area `a`, `ago` minutes before T, closed unless said otherwise. */
const mk = (a: number, ago: number, c: Partial<Case> = {}): Case => {
  const place = AREAS[a];
  return {
    id: `PB-${String(++n).padStart(6, "0")}`,
    dept: "police",
    category: "theft",
    severity: "high",
    titleBn: "x",
    summaryBn: "x",
    place,
    reportedAt: T - ago * MIN,
    status: "closed",
    homeId: nearestHome(place, STATIONS, "police")?.id,
    alerts: [],
    timeline: [],
    notes: [],
    ...c,
  };
};
const world = (cases: Case[]): World => ({ ...BASE, now: T, cases, nextId: cases.length + 1 });

/** Areas at 19:00, by their usual rate: the quietest and the busiest. */
const byBase = AREAS.map((_, a) => ({ a, base: baselinePerHour(h, a, 19) })).sort((x, y) => x.base - y.base);
const QUIET = byBase[0].a;
const BUSY = byBase[byBase.length - 1].a;

test("baseline: the areas' usual rates at an hour add up to the demo's police pace", () => {
  assert.equal(DEMO_POLICE_PER_HOUR, (3600 / 8) * 0.55);
  for (const hr of [3, 12, 19]) {
    const total = AREAS.reduce((s, _, a) => s + baselinePerHour(h, a, hr), 0);
    assert.ok(Math.abs(total - DEMO_POLICE_PER_HOUR) < 1e-6, `${hr}: ${total}`);
  }
  assert.ok(byBase[0].base < 1.5, `quietest area ${byBase[0].base}`);
  assert.ok(byBase[byBase.length - 1].base > 4, `busiest area ${byBase[byBase.length - 1].base}`);
  // Harassment only: a part of the whole.
  assert.ok(baselinePerHour(h, BUSY, 19, ["sexual-harassment"]) < baselinePerHour(h, BUSY, 19));
});

test("hotspots: rising needs 3+ cases and twice the usual; window, department and category filters apply", () => {
  const busyExpected = baselinePerHour(h, BUSY, 19);
  const enough = Math.ceil(2 * busyExpected) + 1;
  const cases = [
    mk(QUIET, 5), mk(QUIET, 20), mk(QUIET, 50, { status: "alerted", severity: "critical", category: "sexual-harassment" }),
    ...Array.from({ length: 3 }, (_, i) => mk(BUSY, 10 + i)),
    mk(QUIET, 61), // outside the window
    { ...mk(QUIET, 5), dept: "consumer" as const, category: "overpricing" as Category },
  ];
  const spots = hotspots(world(cases), T);
  const quiet = spots.find((s) => s.area === QUIET);
  const busy = spots.find((s) => s.area === BUSY);
  assert.ok(quiet && busy);
  assert.equal(quiet.count, 3);
  assert.equal(quiet.rising, true);
  assert.equal(quiet.critical, 1);
  assert.equal(quiet.open, 1);
  assert.equal(quiet.coveredMin, 60);
  assert.deepEqual([quiet.lat, quiet.lng], [AREAS[QUIET].lat, AREAS[QUIET].lng], "the area's point, not a case's");
  assert.deepEqual(quiet.categories, [{ key: "theft", count: 2 }, { key: "sexual-harassment", count: 1 }]);
  assert.equal(busy.count, 3);
  assert.equal(busy.rising, false, "3 cases are normal for a busy hub");
  assert.equal(spots[0].area, QUIET, "rising first");
  // Twice its usual makes the busy area rise too.
  const surge = hotspots(world([...Array.from({ length: enough }, (_, i) => mk(BUSY, 5 + i))]), T)[0];
  assert.equal(surge.rising, true);
  assert.ok((surge.ratio ?? 0) >= 2);
  // Two cases never rise.
  assert.equal(hotspots(world([mk(QUIET, 5), mk(QUIET, 6)]), T)[0].rising, false);
  // Categories and division filters.
  const women = hotspots(world(cases), T, { categories: ["sexual-harassment"] });
  assert.deepEqual(women.map((s) => s.count), [1]);
  const other = AREAS[QUIET].division === "sylhet" ? "rangpur" : "sylhet";
  assert.equal(hotspots(world(cases), T, { division: other }).length, 0);
});

test("coverage: once the engine pruned cases, the window shrinks to what the world still holds", () => {
  const cases = [mk(QUIET, 20), mk(QUIET, 5), mk(QUIET, 10)];
  assert.equal(coverageStart(world(cases)), -Infinity);
  const pruned: World = { ...world(cases), nextId: 500 };
  assert.equal(coverageStart(pruned), T - 20 * MIN);
  const s = hotspots(pruned, T)[0];
  assert.equal(s.coveredMin, 20);
  assert.ok(Math.abs(s.expected - Math.round(((baselinePerHour(h, QUIET, 19) * 20) / 60) * 10) / 10) < 1e-9);
});

test("earlyWarnings: SOS waiting is critical; a big surge is critical; a small rise is watch; most severe first", () => {
  const quiet2 = byBase[1].a;
  const sosArea = byBase[2].a;
  const cases = [
    // A small rise: 3 cases where little is usual.
    mk(QUIET, 5), mk(QUIET, 15), mk(QUIET, 25),
    // A big surge: 6 cases where about one is usual.
    ...Array.from({ length: 6 }, (_, i) => mk(quiet2, 3 + i * 5)),
    // An SOS waiting for a unit (reported 2 hours ago: older than the window, still a warning).
    mk(sosArea, 120, { category: "sos", severity: "critical", status: "alerted", alerts: [{ at: T - 20_000, unitId: "pt-x", outcome: "pending" }] }),
  ];
  const w = world(cases);
  const ws = earlyWarnings(w, T);
  assert.deepEqual(ws.map((w) => [w.area, w.level]), [[quiet2, "critical"], [sosArea, "critical"], [QUIET, "watch"]]);
  const sos = ws.find((w) => w.area === sosArea);
  assert.equal(sos?.sosWaiting, 1);
  assert.match(sos?.reason ?? "", /SOS waiting for a unit/);
  assert.match(ws[0].reason, /^6 police cases in the last 60 min, [\d.]+× the usual [\d.]+ for this time of day$/);
  assert.ok(ws.every((w) => w.id === `ew-${w.area}` && w.caseIds.length > 0));
  assert.equal(earlyWarnings(w, T), ws, "memoised per world, clock and division");
  assert.notEqual(earlyWarnings(w, T, "dhaka"), ws);
  assert.deepEqual(earlyWarnings(world([]), T), []);
});

test("divisionThreat: all 8 divisions; calm when quiet; pressure is measured against the division's usual load", () => {
  const empty = divisionThreat(world([]), T);
  assert.equal(empty.length, 8);
  assert.ok(empty.every((d) => d.level === "calm" && d.score === 0 && d.usualPerHour > 0 && d.stations > 0));
  assert.equal(empty.find((d) => d.division === "dhaka")?.stations, STATIONS.filter((s) => s.division === "dhaka").length);
  assert.deepEqual(THREAT_THRESHOLDS, { watch: 1, alert: 2.5, critical: 4 });
  const sylhetArea = AREAS.findIndex((p) => p.division === "sylhet");
  const dhakaArea = AREAS.findIndex((p) => p.division === "dhaka");
  // Three open critical cases (reported 2 h ago, so no early warning) in each division.
  const open = (a: number) => Array.from({ length: 3 }, () => mk(a, 120, { status: "on-scene", severity: "critical" }));
  const t = divisionThreat(world([...open(sylhetArea), ...open(dhakaArea)]), T);
  const sylhet = t.find((d) => d.division === "sylhet");
  const dhaka = t.find((d) => d.division === "dhaka");
  assert.equal(sylhet?.critical, 3);
  assert.equal(dhaka?.critical, 3);
  assert.equal(sylhet?.level, "alert", "three critical cases weigh heavily in a quiet division");
  assert.equal(dhaka?.level, "calm", "and lightly in Dhaka");
  // Overdue cases and waiting SOS push a division to critical.
  const many = Array.from({ length: 3 }, () => mk(sylhetArea, 120, { status: "alerted", overdue: true, severity: "critical", category: "sos" }));
  const hot = divisionThreat(world(many), T).find((d) => d.division === "sylhet");
  assert.equal(hot?.level, "critical");
  assert.equal(hot?.overdue, 3);
  assert.equal(hot?.sosWaiting, 3);
});

test("networks: one ring linked across stations by its code; individuals are not networks", () => {
  const ring = { kind: "ring" as const, groupId: "চক্র-০২", people: 5 };
  const cases = [
    mk(0, 300, { category: "chadabaji", involved: ring }),
    mk(5, 200, { category: "chadabaji", involved: { ...ring, people: 7 } }),
    mk(10, 10, { category: "drugs", involved: ring, status: "alerted" }),
    mk(3, 10, { category: "theft", involved: { kind: "individual", people: 1 } }),
    mk(4, 10, { category: "theft", involved: { kind: "gang", groupId: "দল-০১", people: 3 } }),
  ];
  const nets = networks(world(cases));
  assert.deepEqual(nets.map((x) => x.groupId), ["চক্র-০২", "দল-০১"]);
  const r = nets[0];
  assert.equal(r.kind, "ring");
  assert.equal(r.caseIds.length, 3);
  assert.equal(r.open, 1);
  assert.equal(r.people, 7);
  assert.deepEqual(r.categories, ["chadabaji", "drugs"]);
  assert.ok(r.stations.length >= 2, r.stations.join());
  assert.equal(r.firstSeen, T - 300 * MIN);
  assert.equal(r.lastSeen, T - 10 * MIN);
  assert.equal(networks(world(cases), "rangpur").length, 0);
});

test("recommendations: concrete, data-backed, most urgent first, at most 8", () => {
  const ring = { kind: "ring" as const, groupId: "চক্র-০৩", people: 4 };
  const stationA = AREAS.findIndex((p) => p.areaBn === "মিরপুর ১০");
  const stationB = AREAS.findIndex((p) => p.areaBn === "যাত্রাবাড়ী");
  const cases = [
    mk(stationA, 90, { category: "chadabaji", involved: ring }),
    mk(stationB, 80, { category: "chadabaji", involved: ring, status: "on-scene" }),
    mk(stationA, 70, { category: "sexual-harassment", victim: "woman", status: "acknowledged", severity: "critical" }),
    mk(stationA, 75, { category: "domestic-violence", victim: "woman", status: "en-route" }),
    mk(QUIET, 1, { category: "sos", severity: "critical", status: "alerted", alerts: [{ at: T - 10_000, unitId: "pt-x", outcome: "pending" }] }),
  ];
  const recs = recommendations(world(cases), T);
  assert.ok(recs.length > 0 && recs.length <= 8);
  for (let i = 1; i < recs.length; i++) assert.ok(recs[i - 1].priority >= recs[i].priority);
  assert.equal(new Set(recs.map((r) => r.id)).size, recs.length);
  assert.equal(recs[0].kind, "sos");
  assert.match(recs[0].title, /^Dispatch to the SOS at .+ now$/);
  const link = recs.find((r) => r.kind === "link-cases");
  assert.match(link?.reason ?? "", /^Ring চক্র-০৩ touched 2 stations in 2 cases, 1 still open$/);
  const desk = recs.find((r) => r.kind === "women-desk");
  assert.match(desk?.reason ?? "", /^2 open women and child cases, 1 critical/);
  assert.equal(desk?.target.kind, "station");
  const windows = recs.filter((r) => r.kind === "patrol-window");
  assert.ok(windows.length > 0);
  for (const w of windows) {
    assert.match(w.title, /^Put a patrol at .+ \d\d:00–\d\d:00$/);
    assert.match(w.reason, /^\d+ .+ reports at these hours in 30 days$/);
  }
  assert.ok(recommendations(world(cases), T, undefined, 3).length === 3);
  const sylhet = recommendations(world(cases), T, "sylhet");
  assert.ok(sylhet.every((r) => r.division === "sylhet"));
});

test("hourPattern: 24 × categories from history, memoised, per division", () => {
  const all = hourPattern(SEED);
  assert.equal(hourPattern(SEED), all);
  assert.equal(all.rows.length, 24);
  assert.deepEqual(all.categories, POLICE_CATEGORIES);
  assert.equal(all.days, 30);
  assert.equal(all.max, Math.max(...all.rows.flat()));
  assert.deepEqual(all.totals, all.rows.map((r) => r.reduce((a, b) => a + b, 0)));
  const women = hourPattern(SEED, "dhaka", ["sexual-harassment", "domestic-violence"]);
  assert.ok(women.rows.every((r) => r.length === 2));
  const i = POLICE_CATEGORIES.indexOf("sexual-harassment");
  assert.ok(women.rows.every((r, hr) => r[0] <= all.rows[hr][i]));
  // Evening harassment beats the small hours in the heatmap too.
  assert.ok(women.rows[19][0] > women.rows[3][0]);
});

test("responseCertainty: today's police cases answered within their first window", () => {
  const ack = (at: number) => [{ at, unitId: "u", outcome: "acknowledged" as const }];
  const cases = [
    mk(0, 30, { alerts: ack(T - 30 * MIN), firstAckAt: T - 30 * MIN + 20_000 }),
    // The first unit missed its 90 s; the second took it: not answered in time.
    mk(1, 30, { alerts: [{ at: T - 30 * MIN, unitId: "u", outcome: "timed-out" }, ...ack(T - 28 * MIN)], firstAckAt: T - 28 * MIN + 5000 }),
    mk(2, 1, { status: "alerted", alerts: [{ at: T - 10_000, unitId: "u", outcome: "pending" }] }),
    // Dispatched by an operator inside the window counts as answered.
    mk(3, 20, { alerts: [{ at: T - 20 * MIN, unitId: "u", outcome: "declined" }], firstAckAt: T - 20 * MIN + 30_000 }),
    mk(4, 24 * 60, { alerts: ack(T - 24 * 60 * MIN) }), // yesterday
    { ...mk(5, 5, { alerts: ack(T - 5 * MIN) }), dept: "consumer" as const },
  ];
  const r = responseCertainty(world(cases), T);
  assert.deepEqual(r, { answered: 2, missed: 1, pending: 1, share: 0.667 });
  assert.equal(responseCertainty(world([]), T).share, null);
});

test("a fresh world opens with an early warning: the seeded clusters rise in two divisions, at any hour", () => {
  for (const seed of [1, 7, 42, 1234, 99991]) {
    for (const hourUtc of [0, 4, 8, 13, 18]) {
      const now = Date.UTC(2026, 9, 25, hourUtc, 0, 0);
      const w = seedWorld(seed, now);
      const warnings = earlyWarnings(w, now);
      assert.ok(warnings.length >= 1, `seed ${seed} at ${hourUtc}:00 UTC`);
      const rising = hotspots(w, now).filter((s) => s.rising);
      assert.ok(new Set(rising.map((s) => s.division)).size >= 2, `seed ${seed} at ${hourUtc}:00 UTC: ${rising.length} rising`);
    }
  }
});
