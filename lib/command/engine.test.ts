import { test } from "node:test";
import assert from "node:assert/strict";
import { STALE_AFTER_MS, newCase, parseSaved, seedWorld, type SimRng } from "./generate.ts";
import { ACK_WINDOW_MS, ARRIVE_KM, CLOSE_AFTER_MS, DEMO_SPEED, MAX_CASES, OPERATOR_HOLD_MS, alertNext, kmPerTick, prune, resume, tick, touchedByOperator } from "./engine.ts";
import { addNote, dispatch, escalate } from "./actions.ts";
import { SPEED_KMH, haversineKm, rankUnits } from "./geo.ts";
import { mulberry32 } from "./rng.ts";
import type { Case, World } from "./types.ts";
import { PATROLS, STATIONS } from "../../data/command/stations.ts";

/** 12:00 in Bangladesh on 25 Oct 2026. */
const T = Date.UTC(2026, 9, 25, 6, 0, 0);

const byId = (w: World, id: string): Case => {
  const c = w.cases.find((x) => x.id === id);
  assert.ok(c, `case ${id}`);
  return c;
};
const pending = (c: Case) => c.alerts.find((a) => a.outcome === "pending");

test("seedWorld is deterministic, about 40 cases, unique ids, consistent units", () => {
  const a = seedWorld(7, T);
  const b = seedWorld(7, T);
  assert.deepEqual(a, b);
  assert.notDeepEqual(seedWorld(8, T).cases, a.cases);
  assert.ok(a.cases.length >= 35, String(a.cases.length));
  assert.equal(new Set(a.cases.map((c) => c.id)).size, a.cases.length);
  for (const c of a.cases) assert.match(c.id, /^PB-\d{6}$/);
  assert.equal(a.nextArrivalAt, T + 4000);
  assert.equal(a.now, T);
  assert.equal(a.nextId, a.cases.length + 1);
  const busy = a.units.filter((u) => u.status === "busy");
  assert.ok(busy.length > 0);
  for (const u of busy) {
    const c = a.cases.find((x) => x.id === u.caseId);
    assert.ok(c, `${u.id} -> ${u.caseId}`);
    assert.equal(c.assignedUnitId, u.id);
  }
  assert.equal(new Set(busy.map((u) => u.caseId)).size, busy.length);
});

test("seedWorld: mixed departments and statuses, timelines in order, within the last 6 hours", () => {
  const w = seedWorld(7, T);
  const count = (f: (c: Case) => boolean) => w.cases.filter(f).length;
  assert.ok(count((c) => c.dept === "police") >= 18);
  assert.ok(count((c) => c.dept === "consumer") >= 10);
  assert.ok(count((c) => c.dept === "other") >= 4);
  for (const s of ["alerted", "acknowledged", "en-route", "on-scene", "resolved", "closed"] as const) {
    assert.ok(count((c) => c.status === s) > 0, s);
  }
  for (const c of w.cases) {
    assert.ok(c.reportedAt <= T && c.reportedAt >= T - 6 * 3600_000, c.id);
    assert.equal(c.timeline[0].kind, "reported", c.id);
    for (let i = 1; i < c.timeline.length; i++) assert.ok(c.timeline[i].at >= c.timeline[i - 1].at, c.id);
    assert.ok(c.timeline[c.timeline.length - 1].at <= T, c.id);
    if (c.dept !== "other") assert.ok(c.homeId, c.id);
    if (c.dept === "consumer") assert.ok(w.businesses.some((b) => b.id === c.businessId), c.id);
    if (c.dept === "other") assert.ok(c.agency, c.id);
    if (c.status === "alerted") {
      const p = pending(c);
      assert.ok(p, c.id);
      assert.ok(T - p.at < ACK_WINDOW_MS[c.severity], c.id);
      assert.equal(w.units.find((u) => u.id === p.unitId)?.status, "available", c.id);
    }
    if (c.status === "resolved") assert.ok(c.resolvedAt && T - c.resolvedAt < 600_000, c.id);
    assert.ok(!/\{(area|business)\}/.test(c.titleBn + c.summaryBn), c.id);
  }
});

test("seedWorld copies units and never mutates the imported data", () => {
  const w = seedWorld(7, T);
  assert.notEqual(w.units[0], STATIONS[0]);
  assert.ok(STATIONS.every((u) => u.status === "available" && u.caseId === undefined));
  assert.ok(PATROLS.every((u) => u.status === "available" && u.caseId === undefined));
});

test("first alert goes to the nearest available unit", () => {
  const base = seedWorld(7, T);
  const world: World = {
    ...base,
    units: base.units.map((u) => (u.dept === "police" ? { ...u, status: "available", caseId: undefined } : u)),
  };
  const r = mulberry32(99);
  let found: Case | undefined;
  let w = world;
  for (let i = 0; i < 50 && !found; i++) {
    w = newCase(world, r, T + 1000);
    const c = w.cases[w.cases.length - 1];
    if (c.dept === "police") found = c;
  }
  assert.ok(found);
  assert.equal(found.status, "alerted");
  assert.equal(found.timeline[0].kind, "reported");
  assert.equal(found.alerts.length, 1);
  assert.equal(found.alerts[0].outcome, "pending");
  assert.equal(found.alerts[0].unitId, rankUnits(found.place, world.units, "police")[0].unit.id);
  assert.equal(found.id, `PB-${String(world.nextId).padStart(6, "0")}`);
  assert.equal(w.nextId, world.nextId + 1);
});

test("newCase: consumer cases sit at a business, others are jittered near a place", () => {
  const world = seedWorld(7, T);
  const r = mulberry32(5);
  const seen = new Set<string>();
  for (let i = 0; i < 80; i++) {
    const w = newCase(world, r, T);
    const c = w.cases[w.cases.length - 1];
    seen.add(c.dept);
    assert.equal(c.reportedAt, T);
    assert.ok(!/\{(area|business)\}/.test(c.titleBn + c.summaryBn));
    if (c.dept === "consumer") {
      const b = w.businesses.find((x) => x.id === c.businessId);
      assert.ok(b);
      assert.ok(c.titleBn.includes(b.nameBn) || c.summaryBn.includes(b.nameBn));
      assert.ok(haversineKm(c.place, b) < 0.001);
    } else {
      assert.equal(c.businessId, undefined);
    }
    if (c.dept === "other") {
      assert.equal(c.status, "new");
      assert.equal(c.alerts.length, 0);
    }
  }
  assert.deepEqual([...seen].sort(), ["consumer", "other", "police"]);
});

test("escalation: an ignored critical alert times out and the next unit is alerted", () => {
  const w = seedWorld(7, T);
  const c = w.cases.find((x) => x.status === "alerted" && x.severity === "critical");
  assert.ok(c, "seed has an alerted critical case");
  const p = pending(c);
  assert.ok(p);
  const n = c.alerts.indexOf(p);
  const w2 = tick(w, p.at + 45_001, { responders: false });
  const c2 = byId(w2, c.id);
  assert.equal(c2.alerts[n].outcome, "timed-out");
  assert.equal(c2.alerts[n + 1].outcome, "pending");
  assert.notEqual(c2.alerts[n + 1].unitId, p.unitId);
  assert.equal(c2.status, "alerted");
  assert.ok(c2.timeline.some((e) => e.kind === "escalated"));
});

test("three timeouts flag the case overdue: not after two, yes after the third, noted once", () => {
  let w = seedWorld(7, T);
  const start = w.cases.find((x) => x.status === "alerted" && x.alerts.length === 1 && !x.overdue);
  assert.ok(start, "an alerted case with no earlier timeouts");
  const id = start.id;
  const window = ACK_WINDOW_MS[start.severity];
  for (let i = 1; i <= 3; i++) {
    const p = pending(byId(w, id));
    assert.ok(p);
    w = tick(w, p.at + window + 1, { responders: false });
    const c = byId(w, id);
    assert.equal(c.alerts.filter((a) => a.outcome === "timed-out").length, i);
    if (i < 3) assert.ok(!c.overdue, `not overdue after ${i} timeouts`);
  }
  const c = byId(w, id);
  assert.equal(c.overdue, true);
  assert.equal(c.timeline.filter((e) => e.text === "Flagged overdue after 3 missed alerts").length, 1);
  // A fourth timeout does not note it again.
  const p = pending(c);
  assert.ok(p);
  w = tick(w, p.at + window + 1, { responders: false });
  assert.equal(byId(w, id).timeline.filter((e) => e.text === "Flagged overdue after 3 missed alerts").length, 1);
});

test("alertNext queues the case when no unit is free", () => {
  const w0 = seedWorld(7, T);
  const id = w0.cases.find((c) => c.dept === "police" && c.status === "alerted")?.id;
  assert.ok(id);
  const cleared: World = {
    ...w0,
    units: w0.units.map((u) => ({ ...u, status: "off-duty" as const, caseId: undefined })),
    cases: w0.cases.map((c) => (c.id === id ? { ...c, status: "new" as const, alerts: [], distanceKm: 1.9, etaMin: 5 } : c)),
  };
  const w = alertNext(cleared, id, T + 10);
  const c = byId(w, id);
  assert.equal(c.status, "new");
  assert.equal(c.alerts.length, 0);
  assert.equal(c.distanceKm, undefined);
  assert.equal(c.etaMin, undefined);
  assert.equal(c.assignedUnitId, undefined);
  assert.equal(c.timeline[c.timeline.length - 1].text, "No unit free; queued");
});

test("tick is a no-op while paused", () => {
  const w: World = { ...seedWorld(7, T), paused: true };
  const before = structuredClone(w);
  assert.deepEqual(tick(w, T + 60_000), before);
});

test("tick never mutates its input", () => {
  let w = seedWorld(7, T);
  for (let i = 1; i <= 120; i++) {
    const before = structuredClone(w);
    const next = tick(w, T + i * 1000);
    assert.deepEqual(w, before);
    w = next;
  }
});

test("arrivals: 60 one-second ticks add at least 3 cases; now and rngState advance", () => {
  const w0 = seedWorld(7, T);
  let w = w0;
  for (let i = 1; i <= 60; i++) w = tick(w, T + i * 1000);
  assert.ok(w.cases.length >= w0.cases.length + 3, `${w.cases.length - w0.cases.length}`);
  assert.equal(w.now, T + 60_000);
  assert.notEqual(w.rngState, w0.rngState);
  assert.ok(w.nextArrivalAt > T + 60_000);
  assert.equal(new Set(w.cases.map((c) => c.id)).size, w.cases.length);
});

test("simulated responders move cases forward and keep units consistent", () => {
  let w = seedWorld(7, T);
  const startResolved = w.cases.filter((c) => c.status === "resolved" || c.status === "closed").length;
  for (let i = 1; i <= 900; i++) w = tick(w, T + i * 1000);
  const resolved = w.cases.filter((c) => c.status === "resolved" || c.status === "closed").length;
  assert.ok(resolved > startResolved, `${startResolved} -> ${resolved}`);
  assert.ok(w.cases.some((c) => c.status === "closed" && c.timeline.some((e) => e.kind === "closed" && e.at > T)));
  for (const u of w.units.filter((x) => x.status === "busy")) {
    const c = byId(w, u.caseId ?? "");
    assert.equal(c.assignedUnitId, u.id);
    assert.ok(["acknowledged", "en-route", "on-scene"].includes(c.status), `${c.id} ${c.status}`);
  }
  for (const c of w.cases.filter((x) => x.status === "alerted")) {
    const p = pending(c);
    assert.ok(p, c.id);
    assert.equal(w.units.find((u) => u.id === p.unitId)?.status, "available", c.id);
  }
});

test("hands-off: responders make no decisions on cases an operator touched in the last minute", () => {
  const w0 = seedWorld(7, T);
  // Every open case except those en route (driving is allowed during the hold).
  const ids = new Set(w0.cases.filter((c) => ["new", "alerted", "acknowledged", "on-scene"].includes(c.status)).map((c) => c.id));
  const touched: World = {
    ...w0,
    cases: w0.cases.map((c) =>
      ids.has(c.id) ? { ...c, timeline: [...c.timeline, { at: T, kind: "note" as const, text: "Checking", by: "operator" }] } : c,
    ),
  };
  const decided = (w: World) =>
    w.cases.filter(
      (c) => ids.has(c.id) && c.timeline.some((e) => e.at > T && e.by === undefined && ["acknowledged", "dispatched", "resolved", "forwarded"].includes(e.kind)),
    ).length;
  let held = touched;
  let free = w0;
  for (let i = 1; i < OPERATOR_HOLD_MS / 1000; i++) {
    held = tick(held, T + i * 1000);
    free = tick(free, T + i * 1000);
  }
  assert.equal(decided(held), 0, "no simulated decisions inside the window");
  assert.ok(decided(free) >= 3, `control world decides: ${decided(free)}`);
  // Once the window has passed, the held cases are worked again.
  for (let i = 60; i <= 300; i++) held = tick(held, T + i * 1000);
  assert.ok(decided(held) >= 3);
});

test("simulated units never acknowledge an alert in the tick it was raised", () => {
  let w = seedWorld(7, T);
  for (let i = 1; i <= 600; i++) w = tick(w, T + i * 1000);
  let checked = 0;
  for (const c of w.cases) {
    for (let i = 0; i < c.timeline.length; i++) {
      const e = c.timeline[i];
      if (e.kind !== "acknowledged" || e.by !== undefined || e.at <= T) continue;
      const alerted = c.timeline.slice(0, i).filter((x) => x.kind === "alerted").pop();
      assert.ok(alerted && e.at - alerted.at >= 2000, c.id);
      checked++;
    }
  }
  assert.ok(checked > 10, String(checked));
});

test("a fresh other-agency case waits a minute before the desk forwards it", () => {
  const base = seedWorld(7, T);
  const r: SimRng = mulberry32(3);
  let w = base;
  let id: string | undefined;
  for (let i = 0; i < 100 && !id; i++) {
    w = newCase(base, r, T);
    const c = w.cases[w.cases.length - 1];
    if (c.dept === "other") id = c.id;
  }
  assert.ok(id);
  let forwardedAt = 0;
  for (let i = 1; i <= 900 && !forwardedAt; i++) {
    w = tick(w, T + i * 1000);
    const c = byId(w, id);
    if (i < OPERATOR_HOLD_MS / 1000) assert.equal(c.status, "new", `still waiting at ${i} s`);
    if (c.status !== "new") forwardedAt = i;
  }
  assert.ok(forwardedAt >= OPERATOR_HOLD_MS / 1000, String(forwardedAt));
  assert.equal(byId(w, id).status, "acknowledged");
});

test("the world keeps at most MAX_CASES cases by dropping the oldest closed ones", () => {
  assert.equal(MAX_CASES, 250);
  const w0 = seedWorld(7, T);
  // A plain closed case (no notes, no business): CRM history outlives these (next test).
  const plainClosed = (c: Case) => c.status === "closed" && c.notes.length === 0 && c.businessId === undefined;
  const closed = w0.cases.find(plainClosed);
  assert.ok(closed);
  const filler: Case[] = Array.from({ length: 260 }, (_, i) => ({
    ...closed,
    id: `PB-9${String(i).padStart(5, "0")}`,
    reportedAt: T - 5 * 3600_000 + i * 1000,
  }));
  const big: World = { ...w0, cases: [...w0.cases, ...filler] };
  const w = tick(big, T + 1000, { responders: false });
  assert.equal(w.cases.length, MAX_CASES);
  const kept = new Set(w.cases.map((c) => c.id));
  for (const c of big.cases) if (c.status !== "closed") assert.ok(kept.has(c.id), `${c.id} kept`);
  // The ones dropped are the oldest plain closed cases.
  const droppedClosed = big.cases.filter((c) => !kept.has(c.id));
  assert.ok(droppedClosed.every(plainClosed));
  const keptClosed = w.cases.filter(plainClosed);
  assert.ok(Math.max(...droppedClosed.map((c) => c.reportedAt)) <= Math.min(...keptClosed.map((c) => c.reportedAt)));

  // Open cases are never dropped, even past the cap.
  const waiting = w0.cases.find((c) => c.dept === "other" && c.status === "new");
  assert.ok(waiting);
  const open: Case[] = Array.from({ length: 300 }, (_, i) => ({ ...waiting, id: `PB-8${String(i).padStart(5, "0")}` }));
  const crowded = tick({ ...w0, cases: open }, T + 1000, { responders: false });
  assert.ok(crowded.cases.length >= 300);
});

test("pruning keeps CRM history: a closed case with a business or a note outlives older plain closed cases", () => {
  const w0 = seedWorld(7, T);
  const template = w0.cases.find((c) => c.status === "closed");
  assert.ok(template);
  const plain = (id: string, at: number): Case => ({ ...template, id, reportedAt: at, businessId: undefined, notes: [] });
  const oldest = T - 6 * 3600_000;
  const fined: Case = { ...plain("PB-700000", oldest), notes: [{ at: oldest, text: "Fine imposed.", kind: "fine", amountTk: 5000 }] };
  const linked: Case = { ...plain("PB-700001", oldest + 1000), businessId: w0.businesses[0].id };
  const filler = Array.from({ length: 260 }, (_, i) => plain(`PB-7${String(i + 10).padStart(5, "0")}`, oldest + 60_000 + i * 1000));
  const keepers = [fined, linked];
  const rest = w0.cases.filter((c) => c.status !== "closed");
  const big: World = { ...w0, cases: [...keepers, ...filler, ...rest] };
  const w = tick(big, T + 1000, { responders: false });
  assert.equal(w.cases.length, MAX_CASES);
  const kept = new Set(w.cases.map((c) => c.id));
  assert.ok(kept.has(fined.id), "fined case kept");
  assert.ok(kept.has(linked.id), "business case kept");
  // The plain ones dropped are the oldest plain ones.
  assert.ok(!kept.has(filler[0].id));
  assert.ok(kept.has(filler[filler.length - 1].id));
  for (const c of rest) assert.ok(kept.has(c.id), `${c.id} kept`);

  // Past the plain ones, business cases go before annotated ones, each oldest first.
  const linkedMany = Array.from({ length: 300 }, (_, i) => ({
    ...plain(`PB-600${String(i).padStart(3, "0")}`, oldest + 10_000 + i * 1000),
    businessId: w0.businesses[0].id,
  }));
  const pruned = prune([fined, ...linkedMany]);
  assert.equal(pruned.length, MAX_CASES);
  assert.ok(pruned.some((c) => c.id === fined.id), "an annotated case outlives business-only cases");
  assert.ok(!pruned.some((c) => c.id === linkedMany[0].id));
  assert.ok(pruned.some((c) => c.id === linkedMany[299].id));
});

test("other-agency desk: new cases get forwarded to their agency, only when responders run", () => {
  const w0 = seedWorld(7, T);
  const waiting = w0.cases.filter((c) => c.dept === "other" && c.status === "new").map((c) => c.id);
  assert.ok(waiting.length > 0);
  let w = w0;
  let forwarded: Case | undefined;
  for (let i = 1; i <= 600 && !forwarded; i++) {
    w = tick(w, T + i * 1000);
    forwarded = waiting.map((id) => byId(w, id)).find((c) => c.status !== "new");
  }
  assert.ok(forwarded, "a waiting other-agency case was forwarded");
  assert.equal(forwarded.status, "acknowledged");
  assert.ok(forwarded.firstAckAt && forwarded.firstAckAt > T);
  const e = forwarded.timeline[forwarded.timeline.length - 1];
  assert.equal(e.kind, "forwarded");
  assert.equal(e.by, undefined);
  assert.ok(forwarded.agency && e.text.includes(forwarded.agency));

  let still = w0;
  for (let i = 1; i <= 600; i++) still = tick(still, T + i * 1000, { responders: false });
  for (const c of still.cases.filter((x) => x.dept === "other")) {
    assert.ok(!c.timeline.some((x) => x.kind === "forwarded" && x.by === undefined), c.id);
    if (waiting.includes(c.id) || c.reportedAt > T) assert.equal(c.status, "new", c.id);
  }
});

test("other-agency desk: forwarded cases are resolved by the agency, then closed", () => {
  let w = seedWorld(7, T);
  const ids = w.cases.filter((c) => c.dept === "other" && c.status === "acknowledged").map((c) => c.id);
  let done: Case | undefined;
  for (let i = 1; i <= 1800 && !done; i++) {
    w = tick(w, T + i * 1000);
    done = ids.map((id) => byId(w, id)).find((c) => c.status === "resolved");
  }
  assert.ok(done, "an agency resolved a forwarded case");
  assert.ok(done.resolvedAt && done.resolvedAt > T);
  const id = done.id;
  const at = done.resolvedAt;
  for (let t = at + 1000; t <= at + 10 * 60_000 + 1000; t += 1000) w = tick(w, t);
  assert.equal(byId(w, id).status, "closed");
});

/** A seeded en-route case whose patrol or team is put `km` north of the scene. */
function enRouteFrom(km: number): { world: World; id: string; unitId: string } {
  const w0 = seedWorld(7, T);
  const c = w0.cases.find((x) => x.status === "en-route" && w0.units.some((u) => u.id === x.assignedUnitId && (u.kind === "patrol" || u.kind === "team")));
  assert.ok(c && c.assignedUnitId);
  const unitId = c.assignedUnitId;
  const world: World = {
    ...w0,
    units: w0.units.map((u) => (u.id === unitId ? { ...u, lat: c.place.lat + km / 111.32, lng: c.place.lng } : u)),
  };
  return { world, id: c.id, unitId };
}
const unitOf = (w: World, id: string) => {
  const u = w.units.find((x) => x.id === id);
  assert.ok(u);
  return u;
};

test("movement: patrols and teams drive at DEMO_SPEED times road speed and arrive within ARRIVE_KM", () => {
  assert.equal(DEMO_SPEED, 20);
  const { world, id, unitId } = enRouteFrom(3);
  const u0 = unitOf(world, unitId);
  const step = kmPerTick(u0);
  assert.ok(Math.abs(step - (SPEED_KMH[u0.kind] / 3600) * DEMO_SPEED) < 1e-12);
  const place = byId(world, id).place;
  let w = world;
  let before = haversineKm(u0, place);
  let ticks = 0;
  while (byId(w, id).status === "en-route" && ticks < 100) {
    ticks++;
    w = tick(w, T + ticks * 1000);
    const after = haversineKm(unitOf(w, unitId), place);
    if (byId(w, id).status === "en-route") assert.ok(Math.abs(before - after - step) < 0.003, `tick ${ticks}: ${before} -> ${after}`);
    before = after;
  }
  assert.equal(byId(w, id).status, "on-scene");
  assert.ok(ticks >= 20 && ticks <= Math.ceil((3 - ARRIVE_KM) / step) + 1, String(ticks));
  assert.ok(haversineKm(unitOf(w, unitId), place) < 0.001);
});

test("hands-off window: no simulated decisions, but a dispatched unit keeps driving and may arrive", () => {
  const w0 = seedWorld(7, T);
  const c0 = w0.cases.find((c) => c.dept === "police" && c.status === "alerted");
  assert.ok(c0);
  const patrol = w0.units.find((u) => u.kind === "patrol" && u.status === "available");
  assert.ok(patrol);
  const r = dispatch(w0, c0.id, T, patrol.id);
  assert.ok(r.ok);
  // Put the patrol 3 km out so the trip is long enough to watch.
  const world: World = {
    ...r.world,
    units: r.world.units.map((u) => (u.id === patrol.id ? { ...u, lat: c0.place.lat + 3 / 111.32, lng: c0.place.lng } : u)),
  };
  let w = world;
  let arrivedAt = 0;
  for (let i = 1; i <= 59; i++) {
    const prev = haversineKm(unitOf(w, patrol.id), c0.place);
    w = tick(w, T + i * 1000);
    const c = byId(w, c0.id);
    if (c.status === "en-route") assert.ok(haversineKm(unitOf(w, patrol.id), c0.place) < prev, `tick ${i}`);
    if (c.status === "on-scene" && !arrivedAt) arrivedAt = i;
    if (arrivedAt) assert.equal(c.status, "on-scene", `tick ${i}: no simulated resolve inside the window`);
  }
  assert.ok(arrivedAt >= 20, String(arrivedAt));
  const arrived = byId(w, c0.id).timeline.find((e) => e.kind === "arrived");
  assert.ok(arrived);
  assert.equal(arrived.by, undefined);
});

test("parseSaved: a saved world (bare or wrapped with its counter) round-trips after ticks", () => {
  let w = seedWorld(11, T);
  for (let i = 1; i <= 30; i++) w = tick(w, T + i * 1000);
  const later = T + 30_000 + 5 * 60_000;
  assert.deepEqual(parseSaved(JSON.stringify(w), later), w);
  assert.deepEqual(parseSaved(JSON.stringify({ world: w, prunedToday: { day: "2026-10-25", count: 3 } }), later), w);
  // The restored world keeps ticking the same way as the original.
  const back = parseSaved(JSON.stringify(w), later);
  assert.ok(back);
  assert.deepEqual(tick(back, later), tick(w, later));
});

test("parseSaved: wrong version → null", () => {
  const w = seedWorld(11, T);
  assert.equal(parseSaved(JSON.stringify({ ...w, version: 1 }), T), null, "a v1 world reseeds");
  assert.equal(parseSaved(JSON.stringify({ ...w, version: 3 }), T), null);
  assert.equal(parseSaved(JSON.stringify({ ...w, version: undefined }), T), null);
  assert.equal(parseSaved(JSON.stringify({ world: { ...w, version: "2" } }), T), null);
});

test("parseSaved: stale (older than 30 minutes) → null; just inside → world", () => {
  const w = seedWorld(11, T);
  assert.equal(STALE_AFTER_MS, 30 * 60_000);
  assert.equal(parseSaved(JSON.stringify(w), T + STALE_AFTER_MS + 1), null);
  assert.ok(parseSaved(JSON.stringify(w), T + STALE_AFTER_MS - 1));
  // A clock far in the future (another machine, a changed system clock) isn't live either.
  assert.equal(parseSaved(JSON.stringify(w), T - 10 * 60_000), null);
});

test("parseSaved: garbage and broken shapes → null", () => {
  const w = seedWorld(11, T);
  for (const bad of ["", "not json", "null", "42", "[]", "{}", '{"world":null}', JSON.stringify({ world: "x" })]) {
    assert.equal(parseSaved(bad, T), null, bad);
  }
  const broken: unknown[] = [
    { ...w, cases: "x" },
    { ...w, units: null },
    { ...w, businesses: undefined },
    { ...w, now: "soon" },
    { ...w, rngState: Number.NaN },
    { ...w, nextId: 1.5 },
    { ...w, paused: "no" },
    { ...w, cases: [...w.cases, { id: "PB-999999" }] },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, status: "lost" } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, place: { lat: "x", lng: 90 } } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, timeline: null } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, timeline: [...c.timeline, { kind: "note", text: "x" }] } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, alerts: [{ at: "soon", unitId: "u", outcome: "pending" }] } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, notes: [null] } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, resolvedAt: "today" } : c)) },
    { ...w, units: w.units.map((u, i) => (i === 0 ? { ...u, lat: null } : u)) },
    { ...w, units: w.units.map((u, i) => (i === 0 ? { ...u, kind: "tank" } : u)) },
    { ...w, units: [] },
  ];
  for (const b of broken) assert.equal(parseSaved(JSON.stringify(b), T), null, JSON.stringify(b).slice(0, 80));
});

test("seedWorld: some consumer cases carry inspection outcomes, in order and valid", () => {
  const w = seedWorld(7, T);
  const noted = w.cases.filter((c) => c.notes.length > 0);
  assert.ok(noted.length >= 3, String(noted.length));
  for (const c of noted) {
    assert.equal(c.dept, "consumer", c.id);
    for (const n of c.notes) {
      assert.ok(n.kind, c.id);
      assert.ok(n.at >= c.reportedAt && n.at <= T, c.id);
      if (n.kind === "fine") assert.ok(Number.isInteger(n.amountTk) && n.amountTk! > 0, c.id);
      else assert.equal(n.amountTk, undefined, c.id);
    }
  }
  assert.ok(noted.some((c) => c.notes.some((n) => n.kind === "fine")));
  assert.ok(parseSaved(JSON.stringify(w), T));
});

test("parseSaved: notes with a bad kind, amount or text → null; good ones round-trip", () => {
  const w = seedWorld(11, T);
  const withNote = (note: unknown): unknown => ({ ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, notes: [note] } : c)) });
  const good = { at: T - 1000, text: "ok", kind: "fine", amountTk: 500, followUpAt: T };
  assert.ok(parseSaved(JSON.stringify(withNote(good)), T));
  assert.ok(parseSaved(JSON.stringify(withNote({ at: T - 1000, text: "plain" })), T));
  for (const bad of [
    { ...good, kind: "raid" },
    { ...good, kind: 5 },
    { ...good, amountTk: "500" },
    { ...good, amountTk: 1.5 },
    { ...good, amountTk: -1 },
    { ...good, text: 7 },
    { ...good, followUpAt: "soon" },
  ]) {
    assert.equal(parseSaved(JSON.stringify(withNote(bad)), T), null, JSON.stringify(bad));
  }
});

test("pause freezes time: resume after 5 min → no alert times out, windows left as they were", () => {
  let w = seedWorld(13, T);
  for (let i = 1; i <= 20; i++) w = tick(w, T + i * 1000);
  const pausedAt = w.now;
  const paused: World = { ...w, paused: true };
  // While paused, ticks change nothing.
  assert.equal(tick(paused, pausedAt + 60_000), paused);
  const left = (x: World, now: number) =>
    new Map(
      x.cases
        .filter((c) => c.status === "alerted")
        .map((c) => [c.id, ACK_WINDOW_MS[c.severity] - (now - (pending(c)?.at ?? now))] as const),
    );
  const before = left(paused, pausedAt);
  assert.ok(before.size > 0, "some alerts pending at pause time");

  const back = pausedAt + 5 * 60_000;
  const r = resume(paused, back);
  assert.equal(r.paused, false);
  assert.equal(r.now, back);
  assert.equal(r.nextArrivalAt, paused.nextArrivalAt + 5 * 60_000);
  assert.deepEqual(left(r, back), before);

  const timedOut = (x: World) => x.cases.reduce((n, c) => n + c.alerts.filter((a) => a.outcome === "timed-out").length, 0);
  const next = tick(r, back + 1000);
  assert.equal(timedOut(next), timedOut(paused), "no burst of timeouts on the first tick after resume");
  // Without resume, the same 5 min would have expired the pending alerts at once.
  assert.ok(timedOut(tick({ ...paused, paused: false }, back + 1000)) > timedOut(paused));
});

test("parseSaved keeps an old paused world (frozen, not stale)", () => {
  const w: World = { ...seedWorld(11, T), paused: true };
  assert.deepEqual(parseSaved(JSON.stringify({ world: w }), T + 6 * 3600_000), w);
  assert.equal(parseSaved(JSON.stringify({ world: { ...w, paused: false } }), T + 6 * 3600_000), null);
});

test("actions on a paused world use its frozen now; after resume nothing is dated in the future", () => {
  let w = seedWorld(13, T);
  for (let i = 1; i <= 20; i++) w = tick(w, T + i * 1000);
  const paused: World = { ...w, paused: true };
  const target = paused.cases.find((c) => c.status === "alerted");
  assert.ok(target);
  // The store stamps actions with world.now while paused (commandAct).
  const stamp = paused.now;
  const a = escalate(paused, target.id, stamp);
  assert.ok(a.ok, a.ok ? "" : a.error);
  const b = addNote(a.world, target.id, stamp, "checked while paused");
  assert.ok(b.ok, b.ok ? "" : b.error);
  const back = paused.now + 5 * 60_000;
  const r = resume(b.world, back);
  for (const c of r.cases) {
    for (const e of c.timeline) assert.ok(e.at <= r.now, `${c.id} timeline ${e.at} > ${r.now}`);
    for (const n of c.notes) assert.ok(n.at <= r.now, `${c.id} note`);
    for (const al of c.alerts) assert.ok(al.at <= r.now, `${c.id} alert`);
    const p = pending(c);
    if (c.status === "alerted" && p) assert.ok(ACK_WINDOW_MS[c.severity] - (r.now - p.at) <= ACK_WINDOW_MS[c.severity]);
  }
  const t = r.cases.find((c) => c.id === target.id);
  assert.ok(t);
  // The operator hold runs from the (shifted) action time: still on at resume.
  assert.equal(touchedByOperator(t, r.now), true);
});

test("resume keeps the operator hold and the resolved→closed timing; dt = 0 is identity", () => {
  let w = seedWorld(17, T);
  for (let i = 1; i <= 10; i++) w = tick(w, T + i * 1000);
  const open = w.cases.find((c) => c.status === "alerted" || c.status === "new");
  assert.ok(open);
  const noted = addNote(w, open.id, w.now - 30_000, "operator note");
  assert.ok(noted.ok);
  const before = { ...noted.world, paused: true };
  const resolved = before.cases.find((c) => c.resolvedAt !== undefined && c.status === "resolved");
  assert.ok(resolved, "seed has a resolved case");

  const back = before.now + 7 * 60_000;
  const r = resume(before, back);
  const o = r.cases.find((c) => c.id === open.id);
  const s = r.cases.find((c) => c.id === resolved.id);
  assert.ok(o && s);
  // Operator hold: same answer, same time left.
  const ob = before.cases.find((c) => c.id === open.id);
  assert.ok(ob);
  assert.equal(touchedByOperator(ob, before.now), true);
  assert.equal(touchedByOperator(o, r.now), true);
  assert.equal(touchedByOperator(o, r.now + OPERATOR_HOLD_MS - 30_000 - 1), true);
  assert.equal(touchedByOperator(o, r.now + OPERATOR_HOLD_MS - 30_000), false);
  // Auto-close: the time since resolution is what it was at pause.
  assert.equal(r.now - (s.resolvedAt ?? 0), before.now - (resolved.resolvedAt ?? 0));
  const closesIn = CLOSE_AFTER_MS - (before.now - (resolved.resolvedAt ?? 0));
  if (closesIn > 1000) assert.equal(tick(r, r.now + 1000).cases.find((c) => c.id === s.id)?.status, "resolved");

  // dt = 0: an unpaused world comes back as the same object; a paused one is only unpaused.
  assert.equal(resume(w, w.now), w);
  assert.deepEqual(resume(before, before.now), { ...before, paused: false });
});
