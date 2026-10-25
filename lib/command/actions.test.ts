import { test } from "node:test";
import assert from "node:assert/strict";
import { acknowledge, addNote, arrive, close, dispatch, escalate, forward, reopen, resolve } from "./actions.ts";
import { seedWorld } from "./generate.ts";
import type { ActionResult, Case, Status, World } from "./types.ts";

const T = Date.UTC(2026, 9, 25, 6, 0, 0);
const NOW = T + 5000;
const W = seedWorld(7, T);

const find = (w: World, f: (c: Case) => boolean): Case => {
  const c = w.cases.find(f);
  assert.ok(c, "fixture case");
  return c;
};
const of = (status: Status, dept: Case["dept"] = "police") => find(W, (c) => c.status === status && c.dept === dept);
const ok = (r: ActionResult): World => {
  assert.ok(r.ok, r.ok ? "" : r.error);
  return r.world;
};
const fails = (r: ActionResult, pattern?: RegExp) => {
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.error.length > 10, r.error);
    if (pattern) assert.match(r.error, pattern);
  }
};
const get = (w: World, id: string) => find(w, (c) => c.id === id);
const unit = (w: World, id: string | undefined) => {
  const u = w.units.find((x) => x.id === id);
  assert.ok(u, `unit ${id}`);
  return u;
};
const operatorEntry = (w: World, id: string) =>
  assert.ok(get(w, id).timeline.some((e) => e.by === "operator" && e.at === NOW), "operator timeline entry");

test("acknowledge: alerted case only; the alerted unit takes it", () => {
  const c = of("alerted");
  const unitId = c.alerts.find((a) => a.outcome === "pending")?.unitId;
  const w = ok(acknowledge(W, c.id, NOW));
  const c2 = get(w, c.id);
  assert.equal(c2.status, "acknowledged");
  assert.equal(c2.assignedUnitId, unitId);
  assert.equal(c2.firstAckAt, NOW);
  assert.equal(unit(w, unitId).status, "busy");
  assert.equal(unit(w, unitId).caseId, c.id);
  assert.ok(!c2.alerts.some((a) => a.outcome === "pending"));
  operatorEntry(w, c.id);
  fails(acknowledge(W, of("en-route").id, NOW), /Only an alerted case can be acknowledged/);
  fails(acknowledge(W, of("new", "other").id, NOW));
});

test("dispatch: from alerted, acknowledged or new; marks the unit busy with the case", () => {
  for (const s of ["alerted", "acknowledged"] as const) {
    const c = of(s);
    const w = ok(dispatch(W, c.id, NOW));
    const c2 = get(w, c.id);
    assert.equal(c2.status, "en-route");
    assert.ok(c2.assignedUnitId);
    assert.equal(unit(w, c2.assignedUnitId).status, "busy");
    assert.equal(unit(w, c2.assignedUnitId).caseId, c.id);
    assert.ok(c2.timeline.some((e) => e.kind === "dispatched" && e.by === "operator"));
    operatorEntry(w, c.id);
  }
  const alerted = of("alerted", "consumer");
  const asNew: World = {
    ...W,
    cases: W.cases.map((c) => (c.id === alerted.id ? { ...c, status: "new" as const, alerts: [] } : c)),
  };
  const free = W.units.find((u) => u.dept === "consumer" && u.status === "available" && u.kind === "team");
  assert.ok(free);
  const w = ok(dispatch(asNew, alerted.id, NOW, free.id));
  assert.equal(get(w, alerted.id).assignedUnitId, free.id);
  assert.equal(unit(w, free.id).caseId, alerted.id);
  assert.equal(get(w, alerted.id).status, "en-route");
});

test("dispatch refuses busy or wrong-department units, other-agency cases and cases already moving", () => {
  const c = of("alerted");
  const busy = W.units.find((u) => u.status === "busy" && u.dept === "police");
  assert.ok(busy);
  fails(dispatch(W, c.id, NOW, busy.id), /busy/);
  const team = W.units.find((u) => u.dept === "consumer" && u.status === "available");
  assert.ok(team);
  fails(dispatch(W, c.id, NOW, team.id));
  fails(dispatch(W, c.id, NOW, "no-such-unit"));
  fails(dispatch(W, of("new", "other").id, NOW));
  fails(dispatch(W, of("on-scene").id, NOW));
  fails(dispatch(W, of("closed").id, NOW));
});

test("escalate: the pending alert is declined and the next unit is alerted", () => {
  const c = of("alerted");
  const p = c.alerts.find((a) => a.outcome === "pending");
  assert.ok(p);
  const w = ok(escalate(W, c.id, NOW));
  const c2 = get(w, c.id);
  assert.equal(c2.status, "alerted");
  assert.equal(c2.alerts.find((a) => a.unitId === p.unitId)?.outcome, "declined");
  const next = c2.alerts.find((a) => a.outcome === "pending");
  assert.ok(next);
  assert.notEqual(next.unitId, p.unitId);
  assert.ok(c2.timeline.some((e) => e.kind === "escalated" && e.by === "operator"));
  assert.deepEqual(unit(w, p.unitId), unit(W, p.unitId), "the passed-over unit is left as it was");
  fails(escalate(W, of("en-route").id, NOW), /alerted/);
});

test("arrive: en-route only", () => {
  const c = of("en-route");
  const w = ok(arrive(W, c.id, NOW));
  assert.equal(get(w, c.id).status, "on-scene");
  operatorEntry(w, c.id);
  fails(arrive(W, of("acknowledged").id, NOW), /en route/);
});

test("resolve: from acknowledged, en-route or on-scene; frees the unit; needs a note", () => {
  for (const s of ["acknowledged", "en-route", "on-scene"] as const) {
    const c = of(s);
    const w = ok(resolve(W, c.id, NOW, "Settled on the spot"));
    const c2 = get(w, c.id);
    assert.equal(c2.status, "resolved");
    assert.equal(c2.resolvedAt, NOW);
    const u = unit(w, c.assignedUnitId);
    assert.equal(u.status, "available");
    assert.equal(u.caseId, undefined);
    operatorEntry(w, c.id);
  }
  fails(resolve(W, of("alerted").id, NOW, "x"));
  fails(resolve(W, of("on-scene").id, NOW, "   "), /note/);
});

test("close: resolved only", () => {
  const c = of("resolved");
  const w = ok(close(W, c.id, NOW));
  assert.equal(get(w, c.id).status, "closed");
  operatorEntry(w, c.id);
  fails(close(W, of("on-scene").id, NOW), /resolved/);
});

test("reopen: from resolved or closed; police cases are alerted again", () => {
  for (const s of ["resolved", "closed"] as const) {
    const c = of(s);
    const w = ok(reopen(W, c.id, NOW));
    const c2 = get(w, c.id);
    assert.equal(c2.status, "alerted");
    assert.equal(c2.resolvedAt, undefined);
    assert.equal(c2.assignedUnitId, undefined);
    assert.ok(c2.timeline.some((e) => e.kind === "reopened" && e.by === "operator"));
    assert.equal(c2.alerts.filter((a) => a.outcome === "pending").length, 1);
  }
  const other = find(W, (c) => c.dept === "other" && (c.status === "resolved" || c.status === "closed"));
  assert.equal(get(ok(reopen(W, other.id, NOW)), other.id).status, "new");
  fails(reopen(W, of("en-route").id, NOW), /resolved or closed/);
});

test("addNote: any status; needs text; keeps the follow-up time", () => {
  for (const c of [of("alerted"), of("closed"), of("new", "other")]) {
    const w = ok(addNote(W, c.id, NOW, "Called the complainant", NOW + 3600_000));
    const c2 = get(w, c.id);
    assert.equal(c2.status, c.status);
    assert.deepEqual(c2.notes[c2.notes.length - 1], { at: NOW, text: "Called the complainant", followUpAt: NOW + 3600_000 });
    operatorEntry(w, c.id);
  }
  fails(addNote(W, of("alerted").id, NOW, ""), /note/);
});

test("forward: new other-agency cases only", () => {
  const c = of("new", "other");
  const w = ok(forward(W, c.id, NOW, "Department of Environment"));
  const c2 = get(w, c.id);
  assert.equal(c2.status, "acknowledged");
  assert.equal(c2.agency, "Department of Environment");
  assert.ok(c2.timeline.some((e) => e.kind === "forwarded" && e.by === "operator"));
  fails(forward(W, of("alerted").id, NOW, "ACC"), /other agencies/);
  fails(forward(W, of("acknowledged", "other").id, NOW, "ACC"));
  fails(forward(W, c.id, NOW, " "));
});

test("unknown case and immutability", () => {
  fails(acknowledge(W, "PB-999999", NOW), /not found/);
  const before = structuredClone(W);
  ok(acknowledge(W, of("alerted").id, NOW));
  ok(resolve(W, of("on-scene").id, NOW, "done"));
  ok(dispatch(W, of("acknowledged").id, NOW));
  assert.deepEqual(W, before);
});

const pendingUnit = (c: Case) => {
  const p = c.alerts.find((a) => a.outcome === "pending");
  assert.ok(p, `${c.id} has a pending alert`);
  return p.unitId;
};
const freePatrol = (w: World, not: readonly (string | undefined)[]) => {
  const u = w.units.find((x) => x.kind === "patrol" && x.status === "available" && !not.includes(x.id));
  assert.ok(u);
  return u;
};

test("dispatch of a different unit while one is pending: old alert declined, old unit stays free", () => {
  const c = of("alerted");
  const old = pendingUnit(c);
  const other = freePatrol(W, [old]);
  const w = ok(dispatch(W, c.id, NOW, other.id));
  const c2 = get(w, c.id);
  assert.equal(c2.alerts.find((a) => a.unitId === old)?.outcome, "declined");
  assert.ok(!c2.alerts.some((a) => a.outcome === "pending"));
  assert.equal(unit(w, old).status, "available");
  assert.equal(unit(w, old).caseId, undefined);
  assert.equal(unit(w, other.id).status, "busy");
  assert.equal(unit(w, other.id).caseId, c.id);
});

test("dispatch swaps the unit on an acknowledged case: the old unit is released", () => {
  const c = of("acknowledged");
  const old = c.assignedUnitId;
  assert.ok(old);
  assert.equal(unit(W, old).caseId, c.id);
  const other = freePatrol(W, [old]);
  const w = ok(dispatch(W, c.id, NOW, other.id));
  assert.equal(get(w, c.id).assignedUnitId, other.id);
  assert.equal(unit(w, old).status, "available");
  assert.equal(unit(w, old).caseId, undefined);
  assert.equal(unit(w, other.id).caseId, c.id);
  // Dispatching the unit already on the case is fine too.
  const same = of("acknowledged");
  assert.equal(get(ok(dispatch(W, same.id, NOW, same.assignedUnitId)), same.id).status, "en-route");
});

/** Two alerted police cases waiting on the same unit. */
function sharedWait(): { world: World; first: Case; second: Case; shared: string } {
  const alerted = W.cases.filter((c) => c.status === "alerted" && c.dept === "police");
  assert.ok(alerted.length >= 2);
  const [first, second] = alerted;
  const shared = pendingUnit(first);
  const world: World = {
    ...W,
    cases: W.cases.map((c) =>
      c.id === second.id ? { ...c, alerts: c.alerts.map((a) => (a.outcome === "pending" ? { ...a, unitId: shared } : a)) } : c,
    ),
  };
  return { world, first, second: get(world, second.id), shared };
}

test("acknowledge and dispatch move another case waiting on the same unit to its next unit", () => {
  for (const run of [
    (w: World, id: string) => acknowledge(w, id, NOW),
    (w: World, id: string) => dispatch(w, id, NOW),
  ]) {
    const { world, first, second, shared } = sharedWait();
    const w = ok(run(world, first.id));
    assert.equal(unit(w, shared).caseId, first.id);
    const s2 = get(w, second.id);
    assert.equal(s2.alerts.find((a) => a.unitId === shared)?.outcome, "declined");
    const next = s2.alerts.find((a) => a.outcome === "pending");
    assert.ok(next, "the other case is alerted again");
    assert.notEqual(next.unitId, shared);
    assert.equal(s2.status, "alerted");
    assert.ok(s2.timeline.some((e) => e.kind === "escalated" && e.text.includes("took another case")));
  }
});

test("acknowledge refuses when the pending unit is busy on another case and leaves it alone", () => {
  const c = of("alerted");
  const busy = W.units.find((u) => u.status === "busy" && u.dept === "police");
  assert.ok(busy && busy.caseId);
  const forced: World = {
    ...W,
    cases: W.cases.map((x) =>
      x.id === c.id ? { ...x, alerts: x.alerts.map((a) => (a.outcome === "pending" ? { ...a, unitId: busy.id } : a)) } : x,
    ),
  };
  fails(acknowledge(forced, c.id, NOW), /busy on another case/);
  const offDuty: World = { ...W, units: W.units.map((u) => (u.id === pendingUnit(c) ? { ...u, status: "off-duty" as const } : u)) };
  fails(acknowledge(offDuty, c.id, NOW), /off duty/);
  assert.equal(unit(forced, busy.id).caseId, busy.caseId);
});

test("escalate with no free unit queues the case and clears its distance and ETA", () => {
  const c = of("alerted");
  const none: World = {
    ...W,
    units: W.units.map((u) => (u.dept === "police" && u.status === "available" ? { ...u, status: "off-duty" as const } : u)),
  };
  const w = ok(escalate(none, c.id, NOW));
  const c2 = get(w, c.id);
  assert.equal(c2.status, "new");
  assert.equal(c2.distanceKm, undefined);
  assert.equal(c2.etaMin, undefined);
  assert.equal(c2.timeline[c2.timeline.length - 1].text, "No unit free; queued");
});
