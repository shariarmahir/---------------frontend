import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DIVISION_IDS,
  bdDate,
  bdDay,
  businessHistory,
  byCategory,
  byDivision,
  filterCases,
  followUpsDue,
  inDivision,
  isWomenCase,
  kpis,
  openInDivision,
  pendingAlerts,
  scopeWorld,
  sosQueue,
  stationRows,
  stationStats,
  unitDivision,
  unitsInDivision,
  womenCases,
  womenDeskLoad,
} from "./selectors.ts";
import { seedWorld } from "./generate.ts";
import { OFFICES, TEAMS } from "../../data/command/consumer.ts";
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
  version: 2,
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

/* ------------------------------------------------------------ v2: divisions */

test("divisions: units carry theirs (offices and teams by the nearest place); inDivision and scopeWorld agree", () => {
  assert.equal(DIVISION_IDS.length, 8);
  const office = (slug: string) => OFFICES.find((o) => o.id === `of-${slug}`) as Unit;
  assert.equal(unitDivision(office("dhaka-hq")), "dhaka");
  assert.equal(unitDivision(office("ctg")), "chattogram");
  assert.equal(unitDivision(office("cumilla")), "chattogram");
  assert.equal(unitDivision(office("sherpur")), "mymensingh");
  assert.equal(unitDivision(office("dinajpur")), "rangpur");
  for (const t of TEAMS) assert.equal(unitDivision(t), unitDivision(OFFICES.find((o) => o.id === t.homeId) as Unit), t.id);
  const w = seedWorld(7, T);
  const ctg = scopeWorld(w, "chattogram");
  assert.ok(ctg.cases.every((c) => c.place.division === "chattogram"));
  assert.ok(ctg.units.length > 0 && ctg.units.every((u) => inDivision(u, "chattogram")));
  assert.ok(ctg.businesses.every((b) => b.division === "chattogram"));
  assert.equal(scopeWorld(w, "all"), w);
  assert.equal(scopeWorld(w, undefined), w);
  // Every division has police units, and the parts add up to the whole.
  for (const d of DIVISION_IDS) assert.ok(unitsInDivision(w, d, "police").some((u) => u.kind === "station"), d);
  assert.equal(DIVISION_IDS.reduce((s, d) => s + unitsInDivision(w, d).length, 0), w.units.length);
  assert.equal(DIVISION_IDS.reduce((s, d) => s + openInDivision(w, d).length, 0), openInDivision(w, "all").length);
});

test("division-scoped kpis, filters, pending alerts and categories", () => {
  assert.equal(kpis(world, T, "chattogram").open, 1);
  assert.equal(kpis(world, T, "dhaka").open, 2);
  assert.deepEqual(kpis(world, T, "all"), kpis(world, T));
  assert.deepEqual(filterCases(world, { division: "chattogram" }).map((c) => c.id), ["PB-000002"]);
  assert.equal(pendingAlerts(world, "police", "chattogram").length, 0);
  assert.equal(pendingAlerts(world, "police", "dhaka").length, 1);
  assert.deepEqual(byCategory(world, undefined, "chattogram"), [{ key: "adulteration", count: 1 }]);
  assert.deepEqual(openInDivision(world, "dhaka").map((c) => c.id), ["PB-000001", "PB-000003"]);
  assert.deepEqual(openInDivision(world, "dhaka", "consumer"), []);
});

test("stationRows: one pass of station numbers, scoped by division, busiest first", () => {
  const w = seedWorld(7, T);
  const all = stationRows(w);
  assert.equal(all.length, w.units.filter((u) => u.kind === "station").length);
  for (const r of all.slice(0, 5)) {
    const s = stationStats(w, r.station.id);
    assert.equal(r.open, s.open);
    assert.equal(r.closed, s.closed);
    assert.equal(r.medianFirstResponseMin, s.medianFirstResponseMin);
    assert.deepEqual(r.patrols.map((u) => u.id), s.patrols.map((u) => u.id));
    assert.equal(r.patrolsAvailable, r.patrols.filter((u) => u.status === "available").length);
  }
  for (let i = 1; i < all.length; i++) assert.ok(all[i - 1].open >= all[i].open);
  const sylhet = stationRows(w, "sylhet");
  assert.deepEqual(sylhet.map((r) => r.station.id).sort(), ["st-sunamganj-sadar", "st-sylhet-kotwali"]);
  assert.ok(sylhet.every((r) => r.division === "sylhet"));
});

test("women safety: women categories or a woman/child victim; desk load per station", () => {
  const women = (id: string, c: Partial<Case>) => mk(id, { homeId: "st-a", status: "acknowledged", ...c });
  const w: World = {
    ...world,
    cases: [
      women("PB-000201", { category: "sexual-harassment", severity: "critical", victim: "woman" }),
      women("PB-000202", { category: "theft", victim: "woman", status: "alerted" }),
      women("PB-000203", { category: "domestic-violence", victim: "child", status: "closed" }),
      women("PB-000204", { category: "theft", victim: "general" }),
      women("PB-000205", { category: "kidnapping", victim: "child", homeId: "st-b" }),
      { ...women("PB-000206", { category: "adulteration", victim: "woman" }), dept: "consumer" },
    ],
  };
  assert.deepEqual(w.cases.map(isWomenCase), [true, true, true, false, true, false]);
  // Critical first, then newest (same time here, so by id, highest first).
  assert.deepEqual(womenCases(w).map((c) => c.id), ["PB-000201", "PB-000205", "PB-000203", "PB-000202"]);
  assert.equal(womenCases(w, "chattogram").length, 0);
  const desks = womenDeskLoad(w);
  assert.deepEqual(desks.map((d) => [d.station.id, d.open, d.critical, d.awaiting]), [["st-a", 2, 1, 1], ["st-b", 1, 0, 0]]);
});

test("sosQueue: waiting SOS cases with their three nearest free units, closest to escalating first", () => {
  const base = seedWorld(7, T);
  const at = (ago: number) => T - ago;
  const sos = (id: string, ago: number, status: Case["status"]): Case =>
    mk(id, {
      category: "sos",
      severity: "critical",
      status,
      reportedAt: at(ago),
      alerts: status === "alerted" ? [{ at: at(ago), unitId: "pt-ramna-1", outcome: "pending" }] : [],
    });
  const w: World = { ...base, cases: [sos("PB-000301", 5_000, "alerted"), sos("PB-000302", 20_000, "alerted"), sos("PB-000303", 60_000, "new"), sos("PB-000304", 1000, "on-scene")] };
  const q = sosQueue(w, T);
  assert.deepEqual(q.map((e) => e.case.id), ["PB-000303", "PB-000302", "PB-000301"]);
  assert.deepEqual(q.map((e) => e.msLeft), [0, 10_000, 25_000]);
  assert.equal(q[0].waitedMs, 60_000);
  for (const e of q) {
    assert.equal(e.nearest.length, 3);
    assert.ok(e.nearest.every((n) => n.unit.dept === "police" && n.unit.status === "available"));
    for (let i = 1; i < 3; i++) assert.ok(e.nearest[i - 1].eta <= e.nearest[i].eta);
  }
  assert.equal(sosQueue(w, T, "khulna").length, 0);
});
