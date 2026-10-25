/**
 * Alerting rules shared by the generator, the tick engine and operator
 * actions (internal to lib/command; engine.ts re-exports the public parts).
 * All functions work on a Draft, so callers stay pure.
 */
import { rankUnits } from "./geo.ts";
import { begin, editCase, editUnit, finish, getCase, getUnit, type Draft } from "./draft.ts";
import type { Alert, Case, LatLng, Severity, Unit, World } from "./types.ts";
import { PATROLS, STATIONS } from "../../data/command/stations.ts";
import { OFFICES, TEAMS } from "../../data/command/consumer.ts";

/** How long an alerted unit has to acknowledge before the case escalates. */
export const ACK_WINDOW_MS: Record<Severity, number> = { critical: 45_000, high: 90_000, normal: 180_000 };

/** Missed alerts after which a case is flagged overdue. */
export const OVERDUE_AFTER_TIMEOUTS = 3;

/** Where each unit waits when it is free: its position in the data files. */
const POSTS: ReadonlyMap<string, LatLng> = new Map(
  [...STATIONS, ...PATROLS, ...OFFICES, ...TEAMS].map((u) => [u.id, { lat: u.lat, lng: u.lng }]),
);

export const isMobile = (u: Unit): boolean => u.kind === "patrol" || u.kind === "team";
export const round1 = (x: number): number => Math.round(x * 10) / 10;

export function pendingAlert(c: Case): Alert | undefined {
  return c.alerts.find((a) => a.outcome === "pending");
}

/** Time of the last reopen; alerts before it belong to an earlier round of work. */
function roundStart(c: Case): number {
  for (let i = c.timeline.length - 1; i >= 0; i--) if (c.timeline[i].kind === "reopened") return c.timeline[i].at;
  return -Infinity;
}

export function timeoutsThisRound(c: Case): number {
  const since = roundStart(c);
  return c.alerts.filter((a) => a.at >= since && a.outcome === "timed-out").length;
}

/** Ranked available units not yet alerted for this case in this round. */
function candidates(d: Draft, c: Case): ReturnType<typeof rankUnits> {
  if (c.dept === "other") return [];
  const since = roundStart(c);
  const tried = new Set(c.alerts.filter((a) => a.at >= since).map((a) => a.unitId));
  return rankUnits(c.place, d.units, c.dept).filter((r) => !tried.has(r.unit.id));
}

export function hasCandidate(d: Draft, c: Case): boolean {
  return candidates(d, c).length > 0;
}

/** Alerts the best-ranked free unit not yet alerted; queues the case when there is none. */
export function alertNextIn(d: Draft, caseId: string, now: number): void {
  const current = getCase(d, caseId);
  if (!current || current.dept === "other") return;
  const best = candidates(d, current)[0];
  const c = editCase(d, caseId);
  if (!best) {
    c.status = "new";
    delete c.assignedUnitId;
    delete c.distanceKm;
    delete c.etaMin;
    c.timeline.push({ at: now, kind: "note", text: "No unit free; queued" });
    return;
  }
  c.alerts.push({ at: now, unitId: best.unit.id, outcome: "pending" });
  c.status = "alerted";
  c.distanceKm = round1(best.km);
  c.etaMin = best.eta;
  c.timeline.push({
    at: now,
    kind: "alerted",
    text: `Alerted ${best.unit.name} (${round1(best.km)} km, about ${best.eta} min away)`,
  });
}

export function alertNext(world: World, caseId: string, now: number): World {
  const d = begin(world);
  alertNextIn(d, caseId, now);
  return finish(d);
}

/**
 * Marks the unit busy on the case. Any other case still waiting on this unit
 * loses it (alert declined) and moves on to its next unit.
 */
export function occupy(d: Draft, unitId: string, caseId: string, now: number): void {
  const u = editUnit(d, unitId);
  u.status = "busy";
  u.caseId = caseId;
  for (let i = 0; i < d.cases.length; i++) {
    const other = d.cases[i];
    if (other.id === caseId || other.status !== "alerted") continue;
    const p = pendingAlert(other);
    if (!p || p.unitId !== unitId) continue;
    const c = editCase(d, other.id);
    const a = pendingAlert(c);
    if (a) a.outcome = "declined";
    c.timeline.push({ at: now, kind: "escalated", text: `${u.name} took another case; escalated` });
    alertNextIn(d, c.id, now);
  }
}

/** Frees the unit and sends it back to its post. */
export function release(d: Draft, unitId: string | undefined): void {
  const current = getUnit(d, unitId);
  if (!current) return;
  const u = editUnit(d, current.id);
  u.status = "available";
  delete u.caseId;
  const post = POSTS.get(u.id) ?? getUnit(d, u.homeId);
  if (post) {
    u.lat = post.lat;
    u.lng = post.lng;
  }
}

/** The pending alert's unit takes the case (shared by responders and the operator). */
export function acknowledgeIn(d: Draft, caseId: string, unitId: string, now: number): void {
  const c = editCase(d, caseId);
  for (const a of c.alerts) if (a.outcome === "pending" && a.unitId === unitId) a.outcome = "acknowledged";
  c.status = "acknowledged";
  c.assignedUnitId = unitId;
  if (c.firstAckAt === undefined) c.firstAckAt = now;
  occupy(d, unitId, caseId, now);
}
