/**
 * Read-only views of the world for the dashboard pages. Pure functions; the
 * store memoises them.
 */
import { ackWindowMs } from "./alerting.ts";
import { haversineKm, rankUnits } from "./geo.ts";
import { isWomenCase, searchFields } from "./privacy.ts";
import type { Alert, Case, Category, Dept, DivisionId, Severity, Status, Unit, World } from "./types.ts";
import { PLACES } from "../../data/command/places.ts";

export const isOpen = (c: Case): boolean => c.status !== "resolved" && c.status !== "closed";

/* -------------------------------------------------------------- divisions */

export const DIVISION_IDS: readonly DivisionId[] = ["dhaka", "chattogram", "khulna", "rajshahi", "sylhet", "barishal", "rangpur", "mymensingh"];
/** A division, or undefined / "all" for the whole country. */
export type DivisionScope = DivisionId | "all" | undefined;
export const isDivision = (v: unknown): v is DivisionId => typeof v === "string" && (DIVISION_IDS as readonly string[]).includes(v);

/** Units carry no division when they are consumer offices or teams: theirs is the nearest listed place's. */
const derivedDivision = new Map<string, DivisionId>();
export function unitDivision(u: Unit): DivisionId {
  if (u.division) return u.division;
  let d = derivedDivision.get(u.id);
  if (!d) {
    let best = PLACES[0];
    for (const p of PLACES) if (haversineKm(p, u) < haversineKm(best, u)) best = p;
    d = best.division;
    derivedDivision.set(u.id, d);
  }
  return d;
}

/** True when the case (by its place) or unit is in the division; always true for the whole country. */
export function inDivision(x: Case | Unit, div: DivisionScope): boolean {
  if (div === undefined || div === "all") return true;
  return "place" in x ? x.place.division === div : unitDivision(x) === div;
}

/** The world with only one division's cases and units (businesses by their division): every selector can then be scoped. */
export function scopeWorld(world: World, div: DivisionScope): World {
  if (div === undefined || div === "all") return world;
  return {
    ...world,
    cases: world.cases.filter((c) => c.place.division === div),
    units: world.units.filter((u) => inDivision(u, div)),
    businesses: world.businesses.filter((b) => b.division === div),
  };
}

/** Open cases in the division (all departments unless `dept`), critical first, then newest. */
export function openInDivision(world: World, div: DivisionScope, dept?: Dept): Case[] {
  return world.cases.filter((c) => isOpen(c) && (!dept || c.dept === dept) && inDivision(c, div)).sort(compareCases);
}

/** Units in the division, optionally of one department. */
export function unitsInDivision(world: World, div: DivisionScope, dept?: "police" | "consumer"): Unit[] {
  return world.units.filter((u) => (!dept || u.dept === dept) && inDivision(u, div));
}

/* ----------------------------------------------------------- women safety */

/** isWomenCase lives with the privacy rules (privacy.ts); re-exported for the selectors' callers. */
export { isWomenCase };

/** Women and child cases in the division, critical first, then newest (open and closed: filter with isOpen). */
export function womenCases(world: World, div?: DivisionScope): Case[] {
  return world.cases.filter((c) => isWomenCase(c) && inDivision(c, div)).sort(compareCases);
}

export interface WomenDeskLoad { station: Unit; open: number; critical: number; awaiting: number }

/** Per station, its open women and child cases (the women help desk's load), busiest first; stations with none left out. */
export function womenDeskLoad(world: World, div?: DivisionScope): WomenDeskLoad[] {
  const by = new Map<string, WomenDeskLoad>();
  const stations = new Map(world.units.filter((u) => u.kind === "station").map((u) => [u.id, u]));
  for (const c of world.cases) {
    if (!isOpen(c) || !isWomenCase(c) || !inDivision(c, div) || !c.homeId) continue;
    const station = stations.get(c.homeId);
    if (!station) continue;
    const row = by.get(station.id) ?? { station, open: 0, critical: 0, awaiting: 0 };
    row.open++;
    if (c.severity === "critical") row.critical++;
    if (c.status === "new" || c.status === "alerted") row.awaiting++;
    by.set(station.id, row);
  }
  return [...by.values()].sort((a, b) => b.open - a.open || b.critical - a.critical || a.station.id.localeCompare(b.station.id));
}

/* ------------------------------------------------------------- emergency */

export interface SosEntry {
  case: Case;
  /** Time left on the pending alert's window (0 when queued or expired). */
  msLeft: number;
  /** Since the SOS came in. */
  waitedMs: number;
  /** The three nearest free police units, by ETA. */
  nearest: { unit: Unit; km: number; eta: number }[];
}

/** SOS cases still waiting for a unit (new or alerted) in the division, the one closest to escalating first. */
export function sosQueue(world: World, now: number, div?: DivisionScope): SosEntry[] {
  const out: SosEntry[] = [];
  for (const c of world.cases) {
    if (c.category !== "sos" || (c.status !== "new" && c.status !== "alerted") || !inDivision(c, div)) continue;
    const p = c.alerts.find((a) => a.outcome === "pending");
    const msLeft = p ? Math.max(0, p.at + ackWindowMs(c) - now) : 0;
    out.push({ case: c, msLeft, waitedMs: Math.max(0, now - c.reportedAt), nearest: rankUnits(c.place, world.units, "police").slice(0, 3) });
  }
  return out.sort((a, b) => a.msLeft - b.msLeft || b.waitedMs - a.waitedMs || a.case.id.localeCompare(b.case.id));
}

/** Calendar day in Bangladesh time (UTC+6, no daylight saving). */
const BD_OFFSET_MS = 6 * 3600_000;
export const bdDay = (t: number): number => Math.floor((t + BD_OFFSET_MS) / 86_400_000);
/** The same Bangladesh calendar day as "YYYY-MM-DD". */
export const bdDate = (t: number): string => new Date(bdDay(t) * 86_400_000).toISOString().slice(0, 10);

/** Median, to one decimal; null for an empty list. */
function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const mid = s.length >> 1;
  const m = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  return Math.round(m * 10) / 10;
}

/** Median minutes from report to first acknowledgement. */
function medianFirstResponse(cases: readonly Case[]): number | null {
  const mins: number[] = [];
  for (const c of cases) if (c.firstAckAt !== undefined) mins.push((c.firstAckAt - c.reportedAt) / 60_000);
  return median(mins);
}

export interface Kpis {
  open: number;
  awaiting: number;
  enRoute: number;
  onScene: number;
  resolvedToday: number;
  medianFirstResponseMin: number | null;
  overdue: number;
}

/** Headline numbers; `div` limits them to one division's cases. */
export function kpis(world: World, now: number, div?: DivisionScope): Kpis {
  const today = bdDay(now);
  const k: Kpis = { open: 0, awaiting: 0, enRoute: 0, onScene: 0, resolvedToday: 0, medianFirstResponseMin: null, overdue: 0 };
  const cases = div === undefined || div === "all" ? world.cases : world.cases.filter((c) => c.place.division === div);
  for (const c of cases) {
    if (isOpen(c)) k.open++;
    if (c.status === "new" || c.status === "alerted") k.awaiting++;
    if (c.status === "en-route") k.enRoute++;
    if (c.status === "on-scene") k.onScene++;
    if (!isOpen(c) && c.resolvedAt !== undefined && bdDay(c.resolvedAt) === today) k.resolvedToday++;
    if (isOpen(c) && c.overdue) k.overdue++;
  }
  k.medianFirstResponseMin = medianFirstResponse(cases);
  return k;
}

export interface CaseFilter {
  dept?: Dept;
  status?: Status | "open";
  category?: Category;
  homeId?: string;
  severity?: Severity;
  /** One division, by the case's place. */
  division?: DivisionId;
  q?: string;
}

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, normal: 2 };

/** Critical first, then newest. */
export function compareCases(a: Case, b: Case): number {
  return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.reportedAt - a.reportedAt || b.id.localeCompare(a.id);
}

export function filterCases(world: World, f: CaseFilter): Case[] {
  const q = f.q?.trim().toLowerCase();
  return world.cases
    .filter(
      (c) =>
        (!f.dept || c.dept === f.dept) &&
        (!f.status || (f.status === "open" ? isOpen(c) : c.status === f.status)) &&
        (!f.category || c.category === f.category) &&
        (!f.homeId || c.homeId === f.homeId) &&
        (!f.severity || c.severity === f.severity) &&
        (!f.division || c.place.division === f.division) &&
        // Only what the board may show: a women case's hidden title or summary never matches.
        (!q || searchFields(c).some((s) => s.toLowerCase().includes(q))),
    )
    .sort(compareCases);
}

export interface PendingAlert { case: Case; alert: Alert; unit?: Unit; msLeft: number }

/** Alerted cases of the department with time left before escalation, soonest first. */
export function pendingAlerts(world: World, dept: Dept, div?: DivisionScope): PendingAlert[] {
  const out: PendingAlert[] = [];
  for (const c of world.cases) {
    if (c.dept !== dept || c.status !== "alerted" || !inDivision(c, div)) continue;
    const alert = c.alerts.find((a) => a.outcome === "pending");
    if (!alert) continue;
    const msLeft = Math.max(0, alert.at + ackWindowMs(c) - world.now);
    out.push({ case: c, alert, unit: world.units.find((u) => u.id === alert.unitId), msLeft });
  }
  return out.sort((a, b) => a.msLeft - b.msLeft || compareCases(a.case, b.case));
}

/** A station's (or consumer office's) area: its cases and its mobile units. */
export function stationStats(
  world: World,
  homeId: string,
): { open: number; closed: number; medianFirstResponseMin: number | null; patrols: Unit[] } {
  const cases = world.cases.filter((c) => c.homeId === homeId);
  const open = cases.filter(isOpen).length;
  return {
    open,
    closed: cases.length - open,
    medianFirstResponseMin: medianFirstResponse(cases),
    patrols: world.units.filter((u) => u.homeId === homeId && u.id !== homeId),
  };
}

export interface StationRow {
  station: Unit;
  division: DivisionId;
  open: number;
  closed: number;
  critical: number;
  overdue: number;
  /** Open women and child cases (isWomenCase). */
  womenOpen: number;
  medianFirstResponseMin: number | null;
  patrols: Unit[];
  patrolsAvailable: number;
}

/** Every police station in the division with its case and patrol numbers (one pass over the world), busiest first. */
export function stationRows(world: World, div?: DivisionScope): StationRow[] {
  const rows = new Map<string, StationRow>();
  const cases = new Map<string, Case[]>();
  for (const u of world.units) {
    if (u.kind !== "station" || !inDivision(u, div)) continue;
    rows.set(u.id, {
      station: u, division: unitDivision(u), open: 0, closed: 0, critical: 0, overdue: 0, womenOpen: 0,
      medianFirstResponseMin: null, patrols: [], patrolsAvailable: 0,
    });
    cases.set(u.id, []);
  }
  for (const u of world.units) {
    const row = u.kind === "patrol" ? rows.get(u.homeId) : undefined;
    if (!row) continue;
    row.patrols.push(u);
    if (u.status === "available") row.patrolsAvailable++;
  }
  for (const c of world.cases) {
    const row = c.homeId === undefined ? undefined : rows.get(c.homeId);
    if (!row) continue;
    cases.get(row.station.id)?.push(c);
    if (!isOpen(c)) {
      row.closed++;
      continue;
    }
    row.open++;
    if (c.severity === "critical") row.critical++;
    if (c.overdue) row.overdue++;
    if (isWomenCase(c)) row.womenOpen++;
  }
  for (const row of rows.values()) row.medianFirstResponseMin = medianFirstResponse(cases.get(row.station.id) ?? []);
  return [...rows.values()].sort((a, b) => b.open - a.open || b.critical - a.critical || a.station.name.localeCompare(b.station.name));
}

/** Every complaint against a business, newest first; a repeat offender has two or more. */
export function businessHistory(world: World, businessId: string): { cases: Case[]; repeat: boolean } {
  const cases = world.cases.filter((c) => c.businessId === businessId).sort((a, b) => b.reportedAt - a.reportedAt);
  return { cases, repeat: cases.length >= 2 };
}

function countBy<K extends string>(cases: readonly Case[], key: (c: Case) => K): { key: K; count: number }[] {
  const m = new Map<K, number>();
  for (const c of cases) m.set(key(c), (m.get(key(c)) ?? 0) + 1);
  return [...m].map(([k, count]) => ({ key: k, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

const ofDept = (world: World, dept?: Dept) => (dept ? world.cases.filter((c) => c.dept === dept) : world.cases);

/** Cases per category (one department, one division when given), most first. */
export function byCategory(world: World, dept?: Dept, div?: DivisionScope): { key: Category; count: number }[] {
  return countBy(ofDept(world, dept).filter((c) => inDivision(c, div)), (c) => c.category);
}

export function byDivision(world: World, dept?: Dept): { key: DivisionId; count: number }[] {
  return countBy(ofDept(world, dept), (c) => c.place.division);
}

export interface FollowUpDue { case: Case; text: string; /** When the note was written. */ at: number; dueAt: number; overdue: boolean }

/**
 * The follow-ups still open at a station (or office): a note's follow-up is
 * done once a later note is logged on the same case, or once the case is
 * resolved or closed. Soonest first; `overdue` when the time has passed `now`.
 */
export function followUpsDue(world: World, homeId: string, now: number): FollowUpDue[] {
  const out: FollowUpDue[] = [];
  for (const c of world.cases) {
    if (c.homeId !== homeId || !isOpen(c)) continue;
    c.notes.forEach((n, i) => {
      // Only the newest note can still be waiting: any later note closes it.
      if (n.followUpAt === undefined || i !== c.notes.length - 1) return;
      out.push({ case: c, text: n.text, at: n.at, dueAt: n.followUpAt, overdue: n.followUpAt < now });
    });
  }
  return out.sort((a, b) => a.dueAt - b.dueAt || a.case.id.localeCompare(b.case.id));
}
