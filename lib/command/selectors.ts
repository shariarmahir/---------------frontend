/**
 * Read-only views of the world for the dashboard pages. Pure functions; the
 * store memoises them.
 */
import { ACK_WINDOW_MS } from "./alerting.ts";
import type { Alert, Case, Category, Dept, DivisionId, Severity, Status, Unit, World } from "./types.ts";

export const isOpen = (c: Case): boolean => c.status !== "resolved" && c.status !== "closed";

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

export function kpis(world: World, now: number): Kpis {
  const today = bdDay(now);
  const k: Kpis = { open: 0, awaiting: 0, enRoute: 0, onScene: 0, resolvedToday: 0, medianFirstResponseMin: null, overdue: 0 };
  for (const c of world.cases) {
    if (isOpen(c)) k.open++;
    if (c.status === "new" || c.status === "alerted") k.awaiting++;
    if (c.status === "en-route") k.enRoute++;
    if (c.status === "on-scene") k.onScene++;
    if (!isOpen(c) && c.resolvedAt !== undefined && bdDay(c.resolvedAt) === today) k.resolvedToday++;
    if (isOpen(c) && c.overdue) k.overdue++;
  }
  k.medianFirstResponseMin = medianFirstResponse(world.cases);
  return k;
}

export interface CaseFilter {
  dept?: Dept;
  status?: Status | "open";
  category?: Category;
  homeId?: string;
  severity?: Severity;
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
        (!q || [c.id, c.titleBn, c.summaryBn, c.place.areaBn, c.place.district].some((s) => s.toLowerCase().includes(q))),
    )
    .sort(compareCases);
}

export interface PendingAlert { case: Case; alert: Alert; unit?: Unit; msLeft: number }

/** Alerted cases of the department with time left before escalation, soonest first. */
export function pendingAlerts(world: World, dept: Dept): PendingAlert[] {
  const out: PendingAlert[] = [];
  for (const c of world.cases) {
    if (c.dept !== dept || c.status !== "alerted") continue;
    const alert = c.alerts.find((a) => a.outcome === "pending");
    if (!alert) continue;
    const msLeft = Math.max(0, alert.at + ACK_WINDOW_MS[c.severity] - world.now);
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

export function byCategory(world: World, dept?: Dept): { key: Category; count: number }[] {
  return countBy(ofDept(world, dept), (c) => c.category);
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
