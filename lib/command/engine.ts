/**
 * The live simulation step. `tick(world, now)` returns the next world: new
 * arrivals, alert timeouts and escalation, and simulated responders. It never
 * mutates its input; unchanged cases and units keep their identity.
 */
import { SPEED_KMH, haversineKm, lerp } from "./geo.ts";
import { expGap, mulberry32, type Rng } from "./rng.ts";
import { begin, editCase, editUnit, finish, getUnit, type Draft } from "./draft.ts";
import {
  OVERDUE_AFTER_TIMEOUTS,
  ackWindowMs,
  acknowledgeIn,
  alertNextIn,
  hasCandidate,
  isMobile,
  pendingAlert,
  release,
  timeoutsThisRound,
} from "./alerting.ts";
import { newCase } from "./generate.ts";
import type { Case, Unit, World } from "./types.ts";

export { ACK_WINDOW_MS, SOS_ACK_WINDOW_MS, ackWindowMs, alertNext } from "./alerting.ts";

/** Mean gap between simulated arrivals. */
export const ARRIVAL_MEAN_MS = 8000;
/** Most arrivals created in one tick (after a long pause the backlog is skipped). */
const MAX_ARRIVALS_PER_TICK = 8;
/** Human actions win: responders leave a case alone this long after an operator touched it. */
export const OPERATOR_HOLD_MS = 60_000;
export const CLOSE_AFTER_MS = 10 * 60_000;
/** A simulated unit never answers an alert younger than this (no same-tick acknowledgement). */
const MIN_ACK_AGE_MS = 2000;
/** Cap on cases kept in the world; the oldest closed cases are dropped beyond it. */
export const MAX_CASES = 250;

/** Per-tick chances for the simulated responders (one tick is about a second). */
const P_ACK = 0.035;
const P_DEPART = 0.12;
const P_STATION_ARRIVE = 0.08;
const P_RESOLVE = 0.012;
/** The other-agency desk clerk: forwarding a new case, and the agency closing it out. */
const P_FORWARD = 0.06;
const P_AGENCY_RESOLVE = 0.008;
/** Patrols and teams drive this many times faster than real traffic, one second per tick. */
export const DEMO_SPEED = 20;
export const ARRIVE_KM = 0.15;

/** Distance a patrol or team covers in one tick. */
export function kmPerTick(u: Unit): number {
  return (SPEED_KMH[u.kind] / 3600) * DEMO_SPEED;
}

export function touchedByOperator(c: Case, now: number): boolean {
  return c.timeline.some((e) => e.by === "operator" && now - e.at < OPERATOR_HOLD_MS);
}

/** Step 2: pending alerts past their window time out and escalate. */
function expireAlerts(d: Draft, now: number): void {
  for (let i = 0; i < d.cases.length; i++) {
    const current = d.cases[i];
    if (current.status !== "alerted") continue;
    const p = pendingAlert(current);
    const window = ackWindowMs(current);
    if (!p || now - p.at <= window) continue;
    const c = editCase(d, current.id);
    const a = pendingAlert(c);
    if (a) a.outcome = "timed-out";
    const name = getUnit(d, p.unitId)?.name ?? "The unit";
    c.timeline.push({ at: now, kind: "escalated", text: `${name} did not answer within ${window / 1000} s; escalated` });
    if (!c.overdue && timeoutsThisRound(c) >= OVERDUE_AFTER_TIMEOUTS) {
      c.overdue = true;
      c.timeline.push({ at: now, kind: "note", text: "Flagged overdue after 3 missed alerts" });
    }
    alertNextIn(d, c.id, now);
  }
}

/** Queued cases (no unit was free) try again once a unit is free. */
function retryQueued(d: Draft, now: number): void {
  for (let i = 0; i < d.cases.length; i++) {
    const c = d.cases[i];
    if (c.status === "new" && c.dept !== "other" && hasCandidate(d, c)) alertNextIn(d, c.id, now);
  }
}

function markArrived(d: Draft, caseId: string, u: Unit, now: number): void {
  const c = editCase(d, caseId);
  c.status = "on-scene";
  c.timeline.push({ at: now, kind: "arrived", text: `${u.name} reached the scene` });
}

/** A patrol or team on its way moves one tick's distance toward the scene and arrives within ARRIVE_KM. */
function drive(d: Draft, c: Case, u: Unit, now: number): void {
  const left = haversineKm(u, c.place);
  const pos = left <= kmPerTick(u) ? c.place : lerp(u, c.place, kmPerTick(u) / left);
  const there = haversineKm(pos, c.place) <= ARRIVE_KM;
  const moving = editUnit(d, u.id);
  moving.lat = there ? c.place.lat : pos.lat;
  moving.lng = there ? c.place.lng : pos.lng;
  if (there) markArrived(d, c.id, u, now);
}

/** The other-agency desk: forwards new cases to their agency; the agency later reports back. */
function clerk(d: Draft, current: Case, r: Rng, now: number): void {
  if (current.status === "new") {
    // A fresh case waits a minute so an operator can forward it by hand first.
    if (now - current.reportedAt < OPERATOR_HOLD_MS || !current.agency || r.next() >= P_FORWARD) return;
    const c = editCase(d, current.id);
    c.status = "acknowledged";
    if (c.firstAckAt === undefined) c.firstAckAt = now;
    c.timeline.push({ at: now, kind: "forwarded", text: `Forwarded to ${current.agency}` });
  } else if (current.status === "acknowledged") {
    if (r.next() >= P_AGENCY_RESOLVE) return;
    const c = editCase(d, current.id);
    c.status = "resolved";
    c.resolvedAt = now;
    c.timeline.push({ at: now, kind: "resolved", text: `Resolved: ${current.agency ?? "the agency"} confirmed action` });
  }
}

/** Step 3 for one case: what a demo unit (or the other-agency desk) would do next. */
function respond(d: Draft, current: Case, r: Rng, now: number): void {
  if (current.dept === "other" && (current.status === "new" || current.status === "acknowledged")) {
    clerk(d, current, r, now);
    return;
  }
  switch (current.status) {
    case "alerted": {
      const p = pendingAlert(current);
      const u = getUnit(d, p?.unitId);
      if (!p || !u || u.status !== "available" || now - p.at < MIN_ACK_AGE_MS || r.next() >= P_ACK) return;
      acknowledgeIn(d, current.id, u.id, now);
      editCase(d, current.id).timeline.push({ at: now, kind: "acknowledged", text: `${u.name} acknowledged the alert` });
      return;
    }
    case "acknowledged": {
      const u = getUnit(d, current.assignedUnitId);
      if (!u || r.next() >= P_DEPART) return;
      const c = editCase(d, current.id);
      c.status = "en-route";
      c.timeline.push({ at: now, kind: "dispatched", text: `${u.name} is on the way` });
      return;
    }
    case "en-route": {
      const u = getUnit(d, current.assignedUnitId);
      if (!u) return;
      if (isMobile(u)) drive(d, current, u, now);
      else if (r.next() < P_STATION_ARRIVE) markArrived(d, current.id, u, now);
      return;
    }
    case "on-scene": {
      const u = getUnit(d, current.assignedUnitId);
      if (!u || r.next() >= P_RESOLVE) return;
      const c = editCase(d, current.id);
      c.status = "resolved";
      c.resolvedAt = now;
      c.timeline.push({ at: now, kind: "resolved", text: `${u.name} resolved the complaint on the spot` });
      release(d, u.id);
      return;
    }
    case "resolved": {
      if (current.resolvedAt === undefined || now - current.resolvedAt < CLOSE_AFTER_MS) return;
      const c = editCase(d, current.id);
      c.status = "closed";
      c.timeline.push({ at: now, kind: "closed", text: "Closed automatically 10 minutes after resolution" });
      return;
    }
    default:
      return;
  }
}

export function tick(world: World, now: number, opts: { responders?: boolean } = {}): World {
  if (world.paused) return world;
  const r = mulberry32(world.rngState);

  // 1. Arrivals.
  let w = world;
  let next = world.nextArrivalAt;
  for (let n = 0; now >= next && n < MAX_ARRIVALS_PER_TICK; n++) {
    w = newCase(w, r, next);
    next += expGap(r, ARRIVAL_MEAN_MS);
  }
  if (now >= next) next = now + expGap(r, ARRIVAL_MEAN_MS);

  const d = begin(w);
  // 2. Timeouts and escalation; then queued cases get another try.
  expireAlerts(d, now);
  retryQueued(d, now);

  // 3–4. Simulated responders. On a case an operator just touched they make no
  // decisions, but a patrol or team already on its way keeps driving (and may arrive).
  if (opts.responders ?? true) {
    for (let i = 0; i < d.cases.length; i++) {
      const c = d.cases[i];
      if (!touchedByOperator(c, now)) respond(d, c, r, now);
      else if (c.status === "en-route") {
        const u = getUnit(d, c.assignedUnitId);
        if (u && isMobile(u)) drive(d, c, u, now);
      }
    }
  }

  // 5. Clock and randomness.
  return finish(d, { now, rngState: r.state(), nextArrivalAt: next, cases: prune(d.cases) });
}

/**
 * Keeps at most MAX_CASES cases by dropping closed ones, oldest first; open and
 * resolved cases always stay. Closed cases that carry CRM history go last, so a
 * long session keeps the businesses' and stations' records: first the plain ones
 * (no business, no notes), then those tied to a business, and only then those
 * with an operator note (fines, inspections, follow-ups).
 */
export function prune(cases: Case[]): Case[] {
  const extra = cases.length - MAX_CASES;
  if (extra <= 0) return cases;
  const keepRank = (c: Case) => (c.notes.length > 0 ? 2 : c.businessId !== undefined ? 1 : 0);
  const drop = new Set(
    cases
      .filter((c) => c.status === "closed")
      .sort((a, b) => keepRank(a) - keepRank(b) || a.reportedAt - b.reportedAt || a.id.localeCompare(b.id))
      .slice(0, extra)
      .map((c) => c.id),
  );
  return drop.size ? cases.filter((c) => !drop.has(c.id)) : cases;
}

/**
 * Unpause: the demo was frozen, so every simulated clock moves forward by the
 * time spent paused (now - world.now). Shifting all of a case's timestamps
 * (report, alerts, timeline, notes, acknowledgement, resolution) and the next
 * arrival keeps every window the engine measures against `now` — alert
 * timeouts, operator hold, the ack minimum, the desk clerk's wait, auto-close —
 * exactly where it was at pause time. Recall logs move with them, so "ordered
 * 3 days ago" stays true of the frozen demo. Operator-chosen follow-up dates
 * (`notes[].followUpAt`) are wall-clock appointments and stay put.
 */
export function resume(world: World, now: number): World {
  const dt = Math.max(0, now - world.now);
  if (dt === 0) return world.paused ? { ...world, paused: false } : world;
  const at = <T extends { at: number }>(x: T): T => ({ ...x, at: x.at + dt });
  const cases = world.cases.map((c): Case => ({
    ...c,
    reportedAt: c.reportedAt + dt,
    ...(c.firstAckAt !== undefined ? { firstAckAt: c.firstAckAt + dt } : {}),
    ...(c.resolvedAt !== undefined ? { resolvedAt: c.resolvedAt + dt } : {}),
    alerts: c.alerts.map(at),
    timeline: c.timeline.map(at),
    notes: c.notes.map(at),
  }));
  const recalls = world.recalls
    ? Object.fromEntries(
        Object.entries(world.recalls).map(([id, s]) => [id, { ...s, updatedAt: s.updatedAt + dt, log: s.log.map(at) }]),
      )
    : undefined;
  return { ...world, paused: false, now, nextArrivalAt: world.nextArrivalAt + dt, cases, ...(recalls ? { recalls } : {}) };
}
