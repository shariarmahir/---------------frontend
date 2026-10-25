/**
 * Operator actions on a case. Each one checks the case's current status,
 * returns a new world (the input is never changed) and records itself in the
 * timeline with `by: "operator"`, which also holds off the simulated
 * responders for a minute.
 */
import { etaMin, haversineKm, rankUnits } from "./geo.ts";
import { begin, editCase, editUnit, finish, getCase, getUnit, type Draft } from "./draft.ts";
import { acknowledgeIn, alertNextIn, isMobile, occupy, pendingAlert, release, round1 } from "./alerting.ts";
import type { ActionResult, Case, Status, TimelineEntry, Unit, World } from "./types.ts";

const fail = (error: string): ActionResult => ({ ok: false, error });
const op = (at: number, kind: TimelineEntry["kind"], text: string): TimelineEntry => ({ at, kind, text, by: "operator" });
const DEPT_NAME = { police: "police", consumer: "consumer-rights" } as const;

/** Runs `apply` on an editable copy of the case once `guard` passes; either may return an error. */
function act(
  world: World,
  caseId: string,
  guard: (c: Case) => string | undefined,
  apply: (d: Draft, c: Case) => string | undefined,
): ActionResult {
  const d = begin(world);
  const current = getCase(d, caseId);
  if (!current) return fail(`Case ${caseId} not found.`);
  const refused = guard(current);
  if (refused) return fail(refused);
  const error = apply(d, editCase(d, caseId));
  return error ? fail(error) : { ok: true, world: finish(d) };
}

const only = (allowed: readonly Status[], message: string) => (c: Case) => (allowed.includes(c.status) ? undefined : message);

export function acknowledge(world: World, caseId: string, now: number): ActionResult {
  return act(world, caseId, only(["alerted"], "Only an alerted case can be acknowledged."), (d, c) => {
    const p = pendingAlert(c);
    const u = getUnit(d, p?.unitId);
    if (!p || !u) return "This case has no pending alert to acknowledge.";
    if (u.status === "busy" && u.caseId !== c.id) return `${u.name} is busy on another case; dispatch another unit.`;
    if (u.status === "off-duty") return `${u.name} is off duty; dispatch another unit.`;
    c.timeline.push(op(now, "acknowledged", `Acknowledged for ${u.name}`));
    acknowledgeIn(d, c.id, u.id, now);
    return undefined;
  });
}

function pickUnit(d: Draft, c: Case, dept: "police" | "consumer", unitId: string | undefined): Unit | string {
  if (unitId !== undefined) {
    const u = getUnit(d, unitId);
    if (!u) return `Unit ${unitId} not found.`;
    if (u.dept !== dept) return `${u.name} is not a ${DEPT_NAME[dept]} unit.`;
    if (u.id === c.assignedUnitId) return u;
    if (u.status === "off-duty") return `${u.name} is off duty.`;
    if (u.status === "busy") return `${u.name} is busy on another case.`;
    return u;
  }
  const assigned = getUnit(d, c.assignedUnitId);
  if (assigned) return assigned;
  const alerted = getUnit(d, pendingAlert(c)?.unitId);
  if (alerted?.status === "available") return alerted;
  return rankUnits(c.place, d.units, dept)[0]?.unit ?? "No unit is free to dispatch.";
}

/** Sends a unit: the one given, else the one already on the case, else the alerted or best-ranked free unit. */
export function dispatch(world: World, caseId: string, now: number, unitId?: string): ActionResult {
  const guard = (c: Case) =>
    c.dept === "other"
      ? "Other-agency cases are forwarded, not dispatched."
      : only(["new", "alerted", "acknowledged"], "Only a new, alerted or acknowledged case can be dispatched.")(c);
  return act(world, caseId, guard, (d, c) => {
    if (c.dept === "other") return "Other-agency cases are forwarded, not dispatched.";
    const u = pickUnit(d, c, c.dept, unitId);
    if (typeof u === "string") return u;
    for (const a of c.alerts) if (a.outcome === "pending") a.outcome = a.unitId === u.id ? "acknowledged" : "declined";
    if (c.assignedUnitId && c.assignedUnitId !== u.id) release(d, c.assignedUnitId);
    const km = haversineKm(c.place, u);
    c.assignedUnitId = u.id;
    c.distanceKm = round1(km);
    c.etaMin = etaMin(km, u.kind);
    if (c.firstAckAt === undefined) c.firstAckAt = now;
    c.status = "en-route";
    c.timeline.push(op(now, "dispatched", `Dispatched ${u.name} (${round1(km)} km, about ${c.etaMin} min)`));
    occupy(d, u.id, c.id, now);
    return undefined;
  });
}

export function escalate(world: World, caseId: string, now: number): ActionResult {
  return act(world, caseId, only(["alerted"], "Only an alerted case can be escalated."), (d, c) => {
    const p = pendingAlert(c);
    if (!p) return "This case has no pending alert to escalate.";
    p.outcome = "declined";
    c.timeline.push(op(now, "escalated", `Escalated past ${getUnit(d, p.unitId)?.name ?? "the alerted unit"}`));
    alertNextIn(d, c.id, now);
    return undefined;
  });
}

export function arrive(world: World, caseId: string, now: number): ActionResult {
  return act(world, caseId, only(["en-route"], "Only a case en route can be marked arrived."), (d, c) => {
    const u = getUnit(d, c.assignedUnitId);
    if (u && isMobile(u)) {
      const moved = editUnit(d, u.id);
      moved.lat = c.place.lat;
      moved.lng = c.place.lng;
    }
    c.status = "on-scene";
    c.timeline.push(op(now, "arrived", u ? `${u.name} marked on scene` : "Marked on scene"));
    return undefined;
  });
}

export function resolve(world: World, caseId: string, now: number, note: string): ActionResult {
  const guard = (c: Case) =>
    only(["acknowledged", "en-route", "on-scene"], "Only an acknowledged, en-route or on-scene case can be resolved.")(c) ??
    (note.trim() ? undefined : "Add a short resolution note.");
  return act(world, caseId, guard, (d, c) => {
    const u = getUnit(d, c.assignedUnitId);
    if (u && u.caseId === c.id) release(d, u.id);
    c.status = "resolved";
    c.resolvedAt = now;
    c.timeline.push(op(now, "resolved", `Resolved: ${note.trim()}`));
    return undefined;
  });
}

export function close(world: World, caseId: string, now: number): ActionResult {
  return act(world, caseId, only(["resolved"], "Only a resolved case can be closed."), (_d, c) => {
    c.status = "closed";
    c.timeline.push(op(now, "closed", "Closed"));
    return undefined;
  });
}

/** Back to work: police and consumer cases are alerted again from the nearest unit. */
export function reopen(world: World, caseId: string, now: number): ActionResult {
  return act(world, caseId, only(["resolved", "closed"], "Only a resolved or closed case can be reopened."), (d, c) => {
    c.status = "new";
    delete c.resolvedAt;
    delete c.assignedUnitId;
    delete c.distanceKm;
    delete c.etaMin;
    delete c.overdue;
    c.timeline.push(op(now, "reopened", "Reopened"));
    alertNextIn(d, c.id, now);
    return undefined;
  });
}

export function addNote(world: World, caseId: string, now: number, text: string, followUpAt?: number): ActionResult {
  const t = text.trim();
  return act(world, caseId, () => (t ? undefined : "Write a note first."), (_d, c) => {
    c.notes.push(followUpAt === undefined ? { at: now, text: t } : { at: now, text: t, followUpAt });
    c.timeline.push(op(now, "note", `Note: ${t}`));
    return undefined;
  });
}

export function forward(world: World, caseId: string, now: number, agency: string): ActionResult {
  const name = agency.trim();
  const guard = (c: Case) =>
    c.dept !== "other" || c.status !== "new"
      ? "Only new cases for other agencies can be forwarded."
      : name ? undefined : "Choose the agency to forward to.";
  return act(world, caseId, guard, (_d, c) => {
    c.agency = name;
    c.status = "acknowledged";
    if (c.firstAckAt === undefined) c.firstAckAt = now;
    c.timeline.push(op(now, "forwarded", `Forwarded to ${name}`));
    return undefined;
  });
}
