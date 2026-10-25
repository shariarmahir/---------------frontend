import { test } from "node:test";
import assert from "node:assert/strict";
import { bdDate, bdDay, businessHistory, byCategory, byDivision, filterCases, followUpsDue, kpis, pendingAlerts, stationStats } from "./selectors.ts";
import type { Case, Unit, World } from "./types.ts";

/** 12:00 in Bangladesh on 25 Oct 2026. */
const T = Date.UTC(2026, 9, 25, 6, 0, 0);
const MIN = 60_000;

const mk = (id: string, c: Partial<Case>): Case => ({
  id,
  dept: "police",
  category: "theft",
  severity: "normal",
  titleBn: `শিরোনাম ${id}`,
  summaryBn: "বিবরণ",
  place: { lat: 23.75, lng: 90.39, division: "dhaka", district: "Dhaka", areaBn: "শাহবাগ" },
  reportedAt: T,
  status: "new",
  homeId: "st-a",
  alerts: [],
  timeline: [],
  notes: [],
  ...c,
});

const unit = (id: string, kind: Unit["kind"], homeId: string): Unit => ({
  id, kind, dept: "police", name: id, nameBn: id, homeId, status: "available", lat: 23.75, lng: 90.39,
});

const world: World = {
  version: 1,
  seed: 1,
  now: T,
  rngState: 1,
  nextId: 5,
  nextArrivalAt: T + 4000,
  paused: false,
  units: [unit("st-a", "station", "st-a"), unit("pt-a-1", "patrol", "st-a"), unit("pt-a-2", "patrol", "st-a"), unit("st-b", "station", "st-b")],
  businesses: [],
  cases: [
    mk("PB-000001", {
      status: "alerted", severity: "critical", category: "chadabaji", reportedAt: T - 10 * MIN,
      alerts: [{ at: T - 10_000, unitId: "pt-a-1", outcome: "pending" }],
    }),
    mk("PB-000002", { status: "en-route", reportedAt: T - 30 * MIN, firstAckAt: T - 28 * MIN, businessId: "bz-01", dept: "consumer", category: "adulteration", homeId: "of-a", place: { lat: 22.3, lng: 91.8, division: "chattogram", district: "Chattogram", areaBn: "আগ্রাবাদ" } }),
    mk("PB-000003", { status: "on-scene", severity: "high", overdue: true, reportedAt: T - 60 * MIN, firstAckAt: T - 56 * MIN }),
    mk("PB-000004", { status: "resolved", reportedAt: T - 120 * MIN, firstAckAt: T - 111 * MIN, resolvedAt: T - 5 * MIN, businessId: "bz-01", dept: "consumer", category: "adulteration", homeId: "of-a" }),
  ],
};

test("kpis on a hand-built 4-case world", () => {
  assert.deepEqual(kpis(world, T), {
    open: 3,
    awaiting: 1,
    enRoute: 1,
    onScene: 1,
    resolvedToday: 1,
    medianFirstResponseMin: 4,
    overdue: 1,
  });
  const empty = kpis({ ...world, cases: [] }, T);
  assert.equal(empty.medianFirstResponseMin, null);
  assert.equal(empty.open, 0);
  // A case resolved yesterday (Bangladesh time) is not "today".
  assert.equal(kpis(world, T + 12 * 60 * MIN).resolvedToday, 0);
});

test("filterCases: critical first, then newest; filters combine", () => {
  assert.deepEqual(filterCases(world, {}).map((c) => c.id), ["PB-000001", "PB-000003", "PB-000002", "PB-000004"]);
  assert.deepEqual(filterCases(world, { status: "open" }).map((c) => c.id), ["PB-000001", "PB-000003", "PB-000002"]);
  assert.deepEqual(filterCases(world, { dept: "consumer" }).map((c) => c.id), ["PB-000002", "PB-000004"]);
  assert.deepEqual(filterCases(world, { status: "resolved" }).map((c) => c.id), ["PB-000004"]);
  assert.deepEqual(filterCases(world, { severity: "high" }).map((c) => c.id), ["PB-000003"]);
  assert.deepEqual(filterCases(world, { category: "chadabaji", homeId: "st-a" }).map((c) => c.id), ["PB-000001"]);
  assert.deepEqual(filterCases(world, { q: "আগ্রাবাদ" }).map((c) => c.id), ["PB-000002"]);
  assert.deepEqual(filterCases(world, { q: "pb-000003" }).map((c) => c.id), ["PB-000003"]);
});

test("pendingAlerts lists alerted cases with the time left", () => {
  const list = pendingAlerts(world, "police");
  assert.equal(list.length, 1);
  assert.equal(list[0].case.id, "PB-000001");
  assert.equal(list[0].alert.unitId, "pt-a-1");
  assert.equal(list[0].msLeft, 35_000);
  assert.equal(pendingAlerts(world, "consumer").length, 0);
});

test("stationStats: open, closed, median and the station's patrols", () => {
  const s = stationStats(world, "st-a");
  assert.equal(s.open, 2);
  assert.equal(s.closed, 0);
  assert.equal(s.medianFirstResponseMin, 4);
  assert.deepEqual(s.patrols.map((u) => u.id), ["pt-a-1", "pt-a-2"]);
  const o = stationStats(world, "of-a");
  assert.equal(o.open, 1);
  assert.equal(o.closed, 1);
  assert.equal(o.medianFirstResponseMin, 5.5);
});

test("businessHistory: repeat when two or more cases", () => {
  const h = businessHistory(world, "bz-01");
  assert.deepEqual(h.cases.map((c) => c.id), ["PB-000002", "PB-000004"]);
  assert.equal(h.repeat, true);
  assert.equal(businessHistory(world, "bz-02").repeat, false);
});

test("byCategory and byDivision count, sorted descending", () => {
  assert.deepEqual(byCategory(world), [
    { key: "adulteration", count: 2 },
    { key: "chadabaji", count: 1 },
    { key: "theft", count: 1 },
  ]);
  assert.deepEqual(byCategory(world, "consumer"), [{ key: "adulteration", count: 2 }]);
  assert.deepEqual(byDivision(world), [
    { key: "dhaka", count: 3 },
    { key: "chattogram", count: 1 },
  ]);
  assert.deepEqual(byDivision(world, "consumer"), [
    { key: "chattogram", count: 1 },
    { key: "dhaka", count: 1 },
  ]);
});

test("bdDay / bdDate: the Bangladesh calendar day turns at 18:00 UTC", () => {
  const midnight = Date.UTC(2026, 9, 24, 18, 0, 0);
  assert.equal(bdDate(midnight), "2026-10-25");
  assert.equal(bdDate(midnight - 1), "2026-10-24");
  assert.equal(bdDay(midnight) - bdDay(midnight - 1), 1);
});

test("followUpsDue: open until a later note or the end of the case; soonest first; overdue only when past", () => {
  const w: World = {
    ...world,
    cases: [
      // Overdue follow-up, nothing after it.
      mk("PB-000101", { status: "acknowledged", notes: [{ at: T - 30 * MIN, text: "call back", followUpAt: T - 5 * MIN }] }),
      // Later note logged: the first follow-up is done, the later one is still open (not yet due).
      mk("PB-000102", { status: "en-route", notes: [{ at: T - 60 * MIN, text: "first", followUpAt: T - 40 * MIN }, { at: T - 10 * MIN, text: "second", followUpAt: T + 20 * MIN }] }),
      // Later note without a follow-up closes the earlier one.
      mk("PB-000103", { status: "on-scene", notes: [{ at: T - 60 * MIN, text: "x", followUpAt: T + 10 * MIN }, { at: T - 5 * MIN, text: "done, nothing more" }] }),
      // Resolved and closed cases carry no open follow-ups.
      mk("PB-000104", { status: "resolved", notes: [{ at: T - 20 * MIN, text: "y", followUpAt: T + 5 * MIN }] }),
      mk("PB-000105", { status: "closed", notes: [{ at: T - 20 * MIN, text: "z", followUpAt: T + 5 * MIN }] }),
      // Another station.
      mk("PB-000106", { status: "new", homeId: "st-b", notes: [{ at: T, text: "other", followUpAt: T + MIN }] }),
    ],
  };
  const due = followUpsDue(w, "st-a", T);
  assert.deepEqual(due.map((d) => [d.case.id, d.text, d.overdue]), [["PB-000101", "call back", true], ["PB-000102", "second", false]]);
});
