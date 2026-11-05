/**
 * Intelligence: early detection from the live police feed against the seeded
 * 30-day history (history.ts). Hotspots, early warnings, a threat level per
 * division, the networks behind repeat cases, and concrete actions. Pure
 * functions of the world and a clock; the store memoises them per world.
 *
 * The history is kept at a realistic scale (a few reports per area a day);
 * the live demo runs far faster (a police case every ~15 s). "The usual rate"
 * is therefore the history's share for an area and hour times the demo's own
 * police rate, so a rising area means rising against this demo, not against
 * the history's small numbers.
 */
import { ackWindowMs } from "./alerting.ts";
import { ARRIVAL_MEAN_MS } from "./engine.ts";
import { POLICE_SHARE } from "./generate.ts";
import { rankUnits } from "./geo.ts";
import { AREAS, HISTORY_DAYS, areaIndex, bdHour, historyCount, historyFor, hourMatrix, type History } from "./history.ts";
import { CATEGORY_META, POLICE_CATEGORIES } from "./routing.ts";
import { DIVISION_IDS, bdDay, inDivision, isOpen, stationRows, unitDivision, womenDeskLoad, type DivisionScope } from "./selectors.ts";
import type { Case, Category, DivisionId, InvolvedKind, PoliceCategory, World } from "./types.ts";

const MIN = 60_000;
/** Police categories that are critical by default (CATEGORY_META). */
const CRITICAL: readonly PoliceCategory[] = POLICE_CATEGORIES.filter((c) => CATEGORY_META[c].severity === "critical");
/** Police cases the live demo produces per hour (all areas, all categories). */
export const DEMO_POLICE_PER_HOUR = (3_600_000 / ARRIVAL_MEAN_MS) * POLICE_SHARE;

const round1 = (x: number): number => Math.round(x * 10) / 10;
const fmt = (x: number): string => (x >= 10 ? String(Math.round(x)) : String(round1(x)));
const pad = (h: number): string => String(h).padStart(2, "0");
const scoped = (div: DivisionScope): DivisionId | undefined => (div === "all" ? undefined : div);
/** "chattogram" → "Chattogram" (the pages carry the full names; this keeps reasons readable). */
const divisionLabel = (d: DivisionId): string => d[0].toUpperCase() + d.slice(1);
const uniq = <T>(xs: readonly (T | undefined)[]): T[] => [...new Set(xs.filter((x): x is T => x !== undefined))];

/** History totals per hour over every area and police category (the denominator of the usual rate). */
const hourTotals = new WeakMap<History, Float64Array>();
function totalsAt(h: History): Float64Array {
  let t = hourTotals.get(h);
  if (!t) {
    t = Float64Array.from({ length: 24 }, (_, hr) => historyCount(h, { hours: [hr] }));
    hourTotals.set(h, t);
  }
  return t;
}

/**
 * The usual police reports per hour in one area at hour `hr`, at the demo's
 * pace: that area's share of all reports at that hour in the 30-day history,
 * times DEMO_POLICE_PER_HOUR. `categories` narrows it (e.g. harassment only).
 */
export function baselinePerHour(h: History, area: number, hr: number, categories?: readonly PoliceCategory[]): number {
  const all = totalsAt(h)[hr];
  if (all === 0) return 0;
  return (DEMO_POLICE_PER_HOUR * historyCount(h, { areas: [area], hours: [hr], categories })) / all;
}

/* --------------------------------------------------------------- hotspots */

/**
 * The earliest report time the world still holds in full. The engine keeps at
 * most MAX_CASES cases by dropping plain closed ones (no notes, no business)
 * oldest first, so once anything was dropped the oldest plain closed case left
 * marks how far back the counts are complete. -Infinity when nothing was dropped.
 */
export function coverageStart(world: World): number {
  if (world.nextId - 1 <= world.cases.length) return -Infinity;
  let t = Infinity;
  for (const c of world.cases) if (c.status === "closed" && c.notes.length === 0 && c.businessId === undefined) t = Math.min(t, c.reportedAt);
  return t === Infinity ? -Infinity : t;
}

export interface HotspotOptions {
  /** The recent window, minutes (default 60). */
  windowMin?: number;
  /** The fewest cases that can make an area rising (default 3). */
  minCount?: number;
  /** Rising needs at least this many times the usual count for the window too (default 2). */
  ratio?: number;
  division?: DivisionScope;
  /** Only these police categories (default all). */
  categories?: readonly PoliceCategory[];
}

export interface Hotspot {
  /** Area index in history AREAS (stable id). */
  area: number;
  areaBn: string;
  district: string;
  division: DivisionId;
  /** The listed area's point, not a case's: no exact location is shown for anyone. */
  lat: number;
  lng: number;
  count: number;
  critical: number;
  open: number;
  categories: { key: Category; count: number }[];
  caseIds: string[];
  /** The usual reports per hour here at this hour (demo pace; see baselinePerHour). */
  baselinePerHour: number;
  /** Minutes actually counted: the window, or less when older cases were pruned (coverageStart). */
  coveredMin: number;
  /** The usual reports over the counted minutes, and the usual critical ones. */
  expected: number;
  expectedCritical: number;
  /** count / expected; null when nothing is usual here at this hour. */
  ratio: number | null;
  rising: boolean;
  /** Earliest and latest report in the window. */
  since: number;
  last: number;
}

/**
 * Areas with police cases reported in the last `windowMin` minutes. An area is
 * rising when its count reaches both floors: at least `minCount` (3) cases and
 * at least `ratio` (2) times its usual count for the window. Read "3+ cases, or
 * twice the usual rate" as "whichever is higher": where little is usual 3 cases
 * are enough; a busy hub needs twice its usual. (At the demo's pace a busy area
 * usually sees 3–7 police cases an hour, so 3 on its own would flag almost
 * every area.) Rising first, then by count.
 */
export function hotspots(world: World, now: number, opts: HotspotOptions = {}): Hotspot[] {
  const windowMin = opts.windowMin ?? 60;
  const minCount = opts.minCount ?? 3;
  const ratioAt = opts.ratio ?? 2;
  const cats = opts.categories ? new Set<string>(opts.categories) : null;
  const from = Math.max(now - windowMin * MIN, coverageStart(world));
  const coveredMin = Math.max(1, (now - from) / MIN);
  const groups = new Map<number, Case[]>();
  for (const c of world.cases) {
    if (c.dept !== "police" || c.reportedAt <= from || c.reportedAt > now) continue;
    if ((cats && !cats.has(c.category)) || !inDivision(c, opts.division)) continue;
    const a = areaIndex(c.place);
    if (a < 0) continue;
    const list = groups.get(a);
    if (list) list.push(c);
    else groups.set(a, [c]);
  }
  const h = historyFor(world.seed);
  const hr = bdHour(now);
  const out: Hotspot[] = [];
  for (const [a, list] of groups) {
    const p = AREAS[a];
    const per = new Map<Category, number>();
    let critical = 0;
    let open = 0;
    let since = Infinity;
    let last = -Infinity;
    for (const c of list) {
      per.set(c.category, (per.get(c.category) ?? 0) + 1);
      if (c.severity === "critical") critical++;
      if (isOpen(c)) open++;
      since = Math.min(since, c.reportedAt);
      last = Math.max(last, c.reportedAt);
    }
    const base = baselinePerHour(h, a, hr, opts.categories);
    const expected = (base * coveredMin) / 60;
    const criticalCats = opts.categories ? opts.categories.filter((c) => CRITICAL.includes(c)) : CRITICAL;
    const expectedCritical = (baselinePerHour(h, a, hr, criticalCats) * coveredMin) / 60;
    const count = list.length;
    const ratio = expected > 0 ? round1(count / expected) : null;
    out.push({
      area: a,
      areaBn: p.areaBn,
      district: p.district,
      division: p.division,
      lat: p.lat,
      lng: p.lng,
      count,
      critical,
      open,
      categories: [...per].map(([key, n]) => ({ key, count: n })).sort((x, y) => y.count - x.count || x.key.localeCompare(y.key)),
      caseIds: list.map((c) => c.id),
      baselinePerHour: round1(base),
      coveredMin: Math.round(coveredMin),
      expected: round1(expected),
      expectedCritical: round1(expectedCritical),
      ratio,
      rising: count >= minCount && count >= ratioAt * expected,
      since,
      last,
    });
  }
  return out.sort((x, y) => Number(y.rising) - Number(x.rising) || y.count - x.count || y.critical - x.critical || x.area - y.area);
}

/* ---------------------------------------------------------- early warning */

export type WarningLevel = "watch" | "alert" | "critical";
const LEVEL_RANK: Record<WarningLevel, number> = { critical: 0, alert: 1, watch: 2 };

export interface EarlyWarning {
  id: string;
  area: number;
  areaBn: string;
  district: string;
  division: DivisionId;
  lat: number;
  lng: number;
  /** One line in English: the counts behind the warning. */
  reason: string;
  level: WarningLevel;
  categories: Category[];
  count: number;
  sosWaiting: number;
  since: number;
  caseIds: string[];
}

/** SOS cases still waiting for a unit (new or alerted). */
const sosWaiting = (c: Case): boolean => c.category === "sos" && (c.status === "new" || c.status === "alerted");

/**
 * Areas to act on now. Thresholds (window 60 min, "usual" from the history):
 * - critical: an SOS waiting for a unit in the area, or a rising area with 5+ cases at 4× its usual or more;
 * - alert: a rising area with 4+ cases at 3× its usual or more, or with 3+ critical cases at 2× their usual;
 * - watch: any other rising area (hotspots' rule: 3+ cases and 2× the usual).
 * Most severe first, then by count, then oldest.
 */
export function earlyWarnings(world: World, now: number, div?: DivisionScope): EarlyWarning[] {
  // Worlds are immutable, so one answer per (world, now, division) can be kept.
  const key = `${now}|${div ?? "all"}`;
  const memo = warningMemo.get(world);
  const hit = memo?.get(key);
  if (hit) return hit;
  const result = computeWarnings(world, now, div);
  if (memo) memo.set(key, result);
  else warningMemo.set(world, new Map([[key, result]]));
  return result;
}

const warningMemo = new WeakMap<World, Map<string, EarlyWarning[]>>();

function computeWarnings(world: World, now: number, div: DivisionScope): EarlyWarning[] {
  const spots = hotspots(world, now, { division: div });
  const sos = new Map<number, Case[]>();
  for (const c of world.cases) {
    if (!sosWaiting(c) || !inDivision(c, div)) continue;
    const a = areaIndex(c.place);
    if (a >= 0) sos.set(a, [...(sos.get(a) ?? []), c]);
  }
  const out: EarlyWarning[] = [];
  const seen = new Set<number>();
  for (const s of spots) {
    const waiting = sos.get(s.area) ?? [];
    if (!s.rising && waiting.length === 0) continue;
    seen.add(s.area);
    const times = s.expected > 0 ? s.count / s.expected : Infinity;
    const level: WarningLevel =
      waiting.length > 0 || (s.rising && s.count >= 5 && times >= 4) ? "critical"
      : s.rising && ((s.count >= 4 && times >= 3) || (s.critical >= 3 && s.critical >= 2 * s.expectedCritical)) ? "alert"
      : "watch";
    const parts = [`${s.count} police case${s.count === 1 ? "" : "s"} in the last ${s.coveredMin} min`];
    if (s.ratio !== null && s.expected >= 0.05) parts[0] += `, ${fmt(s.ratio)}× the usual ${fmt(s.expected)} for this time of day`;
    if (s.critical > 0) parts.push(`${s.critical} critical`);
    if (waiting.length > 0) parts.push(`${waiting.length} SOS waiting for a unit`);
    out.push({
      id: `ew-${s.area}`,
      area: s.area,
      areaBn: s.areaBn,
      district: s.district,
      division: s.division,
      lat: s.lat,
      lng: s.lng,
      reason: parts.join("; "),
      level,
      categories: s.categories.map((x) => x.key),
      count: s.count,
      sosWaiting: waiting.length,
      since: Math.min(s.since, ...waiting.map((c) => c.reportedAt)),
      caseIds: [...new Set([...s.caseIds, ...waiting.map((c) => c.id)])],
    });
  }
  // An SOS older than the window still needs a unit.
  for (const [a, waiting] of sos) {
    if (seen.has(a)) continue;
    const p = AREAS[a];
    out.push({
      id: `ew-${a}`,
      area: a,
      areaBn: p.areaBn,
      district: p.district,
      division: p.division,
      lat: p.lat,
      lng: p.lng,
      reason: `${waiting.length} SOS waiting for a unit`,
      level: "critical",
      categories: ["sos"],
      count: waiting.length,
      sosWaiting: waiting.length,
      since: Math.min(...waiting.map((c) => c.reportedAt)),
      caseIds: waiting.map((c) => c.id),
    });
  }
  return out.sort((x, y) => LEVEL_RANK[x.level] - LEVEL_RANK[y.level] || y.count - x.count || x.since - y.since || x.area - y.area);
}

/* -------------------------------------------------------- division threat */

export type ThreatLevel = "calm" | "watch" | "alert" | "critical";

export interface DivisionThreat {
  division: DivisionId;
  level: ThreatLevel;
  /** Pressure against the division's usual load (see divisionThreat). */
  score: number;
  /** Open police cases. */
  open: number;
  critical: number;
  overdue: number;
  sosWaiting: number;
  /** Early warnings in the division, and how many are alert or critical. */
  hotspots: number;
  serious: number;
  stations: number;
  /** Police cases the division usually gets per hour at this hour (demo pace). */
  usualPerHour: number;
}

/** Score cut-offs: below 1 calm, below 2.5 watch, below 4 alert, else critical. */
export const THREAT_THRESHOLDS = { watch: 1, alert: 2.5, critical: 4 } as const;
/** Usual cases per hour that count as one unit of load in the score. */
export const LOAD_UNIT_PER_HOUR = 16;

/**
 * Situation per division from its open police cases and early warnings.
 * raw = 1 × open critical + 3 × overdue + 3 × SOS waiting + 1 × watch warning
 * + 3 × alert or critical warning; score = raw ÷ load, where load is the
 * division's usual police cases per hour ÷ LOAD_UNIT_PER_HOUR (at least 1), so
 * Dhaka is not alarming just for being big and a quiet division still shows a
 * spike. The level follows THREAT_THRESHOLDS; 3+ overdue cases make it at
 * least "alert". Every division is returned, in DIVISION_IDS order.
 */
export function divisionThreat(world: World, now: number): DivisionThreat[] {
  const h = historyFor(world.seed);
  const hr = bdHour(now);
  const rows = new Map<DivisionId, DivisionThreat>(
    DIVISION_IDS.map((d) => [
      d,
      {
        division: d, level: "calm", score: 0, open: 0, critical: 0, overdue: 0, sosWaiting: 0, hotspots: 0, serious: 0, stations: 0,
        usualPerHour: totalsAt(h)[hr] > 0 ? (DEMO_POLICE_PER_HOUR * historyCount(h, { division: d, hours: [hr] })) / totalsAt(h)[hr] : 0,
      },
    ]),
  );
  for (const r of stationRows(world)) {
    const row = rows.get(r.division);
    if (row) row.stations++;
  }
  for (const c of world.cases) {
    if (c.dept !== "police" || !isOpen(c)) continue;
    const row = rows.get(c.place.division);
    if (!row) continue;
    row.open++;
    if (c.severity === "critical") row.critical++;
    if (c.overdue) row.overdue++;
    if (sosWaiting(c)) row.sosWaiting++;
  }
  for (const w of earlyWarnings(world, now)) {
    const row = rows.get(w.division);
    if (!row) continue;
    row.hotspots++;
    if (w.level !== "watch") row.serious++;
  }
  for (const row of rows.values()) {
    const raw = row.critical + 3 * row.overdue + 3 * row.sosWaiting + (row.hotspots - row.serious) + 3 * row.serious;
    row.score = round1(raw / Math.max(1, row.usualPerHour / LOAD_UNIT_PER_HOUR));
    row.usualPerHour = round1(row.usualPerHour);
    row.level =
      row.score >= THREAT_THRESHOLDS.critical ? "critical"
      : row.score >= THREAT_THRESHOLDS.alert ? "alert"
      : row.score >= THREAT_THRESHOLDS.watch ? "watch"
      : "calm";
    if (row.overdue >= 3 && (row.level === "calm" || row.level === "watch")) row.level = "alert";
  }
  return DIVISION_IDS.map((d) => rows.get(d) as DivisionThreat);
}

/* --------------------------------------------------------------- networks */

export interface Network {
  groupId: string;
  kind: Extract<InvolvedKind, "ring" | "gang">;
  caseIds: string[];
  /** Owning stations of its cases. */
  stations: string[];
  areas: string[];
  divisions: DivisionId[];
  categories: Category[];
  /** Largest head count reported on any of its cases. */
  people: number;
  firstSeen: number;
  lastSeen: number;
  open: number;
}

/**
 * Rings and gangs linked across cases by their fictional group code. Only the
 * kind of actor and a code; nothing about who the people are. Most open cases
 * first, then most stations touched.
 */
export function networks(world: World, div?: DivisionScope): Network[] {
  const groups = new Map<string, Case[]>();
  for (const c of world.cases) {
    const g = c.involved?.groupId;
    if (!g || (c.involved?.kind !== "ring" && c.involved?.kind !== "gang")) continue;
    groups.set(g, [...(groups.get(g) ?? []), c]);
  }
  const out: Network[] = [];
  for (const [groupId, list] of groups) {
    if (div && div !== "all" && !list.some((c) => c.place.division === div)) continue;
    const sorted = list.slice().sort((a, b) => a.reportedAt - b.reportedAt || a.id.localeCompare(b.id));
    out.push({
      groupId,
      kind: sorted[0].involved?.kind as Network["kind"],
      caseIds: sorted.map((c) => c.id),
      stations: uniq(sorted.map((c) => c.homeId)),
      areas: uniq(sorted.map((c) => c.place.areaBn)),
      divisions: uniq(sorted.map((c) => c.place.division)),
      categories: uniq(sorted.map((c) => c.category)),
      people: Math.max(0, ...sorted.map((c) => c.involved?.people ?? 0)),
      firstSeen: sorted[0].reportedAt,
      lastSeen: sorted[sorted.length - 1].reportedAt,
      open: sorted.filter(isOpen).length,
    });
  }
  return out.sort((a, b) => b.open - a.open || b.stations.length - a.stations.length || b.caseIds.length - a.caseIds.length || a.groupId.localeCompare(b.groupId));
}

/* ------------------------------------------------------------ hour pattern */

export interface HourPattern {
  categories: readonly PoliceCategory[];
  /** 24 rows (hours 00–23) × categories: reports in 30 days. */
  rows: number[][];
  /** Per hour, all the categories together. */
  totals: number[];
  max: number;
  days: number;
}

const patternCache = new Map<string, HourPattern>();

/**
 * The hour × category matrix for the heatmap, from the seed's 30-day history
 * (one division, or all). Memoised: the same arguments return the same object.
 */
export function hourPattern(seed: number, div?: DivisionScope, categories: readonly PoliceCategory[] = POLICE_CATEGORIES): HourPattern {
  const key = `${seed}|${scoped(div) ?? ""}|${categories.join(",")}`;
  const hit = patternCache.get(key);
  if (hit) return hit;
  const rows = hourMatrix(historyFor(seed), { division: scoped(div), categories });
  let max = 0;
  for (const r of rows) for (const x of r) max = Math.max(max, x);
  const out: HourPattern = { categories, rows, totals: rows.map((r) => r.reduce((a, b) => a + b, 0)), max, days: HISTORY_DAYS };
  if (patternCache.size > 64) patternCache.clear();
  patternCache.set(key, out);
  return out;
}

/* ------------------------------------------------------ response certainty */

export interface ResponseCertainty {
  /** Police cases reported today whose first alert was answered within its window. */
  answered: number;
  missed: number;
  /** First alert still inside its window. */
  pending: number;
  /** answered ÷ (answered + missed); null before any is decided. */
  share: number | null;
}

/**
 * The deterrence measure on the roadmap: of today's police cases (Bangladesh
 * day), the share whose first alert was acknowledged (or the case dispatched)
 * within the window: "certainty of a response", not arrests.
 */
export function responseCertainty(world: World, now: number, div?: DivisionScope): ResponseCertainty {
  const today = bdDay(now);
  const r: ResponseCertainty = { answered: 0, missed: 0, pending: 0, share: null };
  for (const c of world.cases) {
    if (c.dept !== "police" || bdDay(c.reportedAt) !== today || c.alerts.length === 0 || !inDivision(c, div)) continue;
    const first = c.alerts[0];
    const deadline = first.at + ackWindowMs(c);
    if (first.outcome === "acknowledged" || (c.firstAckAt !== undefined && c.firstAckAt <= deadline)) r.answered++;
    else if (now <= deadline && c.firstAckAt === undefined) r.pending++;
    else r.missed++;
  }
  const decided = r.answered + r.missed;
  r.share = decided ? Math.round((r.answered / decided) * 1000) / 1000 : null;
  return r;
}

/* --------------------------------------------------------- recommendations */

export type RecommendationKind = "sos" | "patrol-now" | "backup" | "link-cases" | "women-desk" | "patrol-window";

export interface Recommendation {
  id: string;
  kind: RecommendationKind;
  /** Higher is more urgent. */
  priority: number;
  /** The action, in English with Bangla place names. */
  title: string;
  /** The data behind it. */
  reason: string;
  target: { kind: "area" | "station" | "division"; id: string; label: string };
  division: DivisionId;
  caseIds?: string[];
}

/** Category groups the patrol-window advice looks for in the history, with how the reason names them. */
const WINDOW_GROUPS: readonly { categories: readonly PoliceCategory[]; label: string }[] = [
  { categories: ["sexual-harassment"], label: "sexual harassment" },
  { categories: ["theft"], label: "theft and snatching" },
  { categories: ["chadabaji"], label: "extortion" },
  { categories: ["drugs"], label: "drugs" },
];
const WINDOW_HOURS = 3;

/** Best (area, 3-hour window) for each category group in the history, in the division. Memoised per seed and division. */
const windowCache = new Map<string, { group: (typeof WINDOW_GROUPS)[number]; area: number; start: number; count: number }[]>();
function patrolWindows(seed: number, div?: DivisionId) {
  const key = `${seed}|${div ?? ""}`;
  const hit = windowCache.get(key);
  if (hit) return hit;
  const h = historyFor(seed);
  const used = new Set<number>();
  const out: { group: (typeof WINDOW_GROUPS)[number]; area: number; start: number; count: number }[] = [];
  for (const group of WINDOW_GROUPS) {
    let best: { area: number; start: number; count: number } | null = null;
    for (let a = 0; a < AREAS.length; a++) {
      if ((div && AREAS[a].division !== div) || used.has(a)) continue;
      const m = hourMatrix(h, { areas: [a], categories: group.categories }).map((r) => r[0]);
      for (let s = 0; s < 24; s++) {
        let n = 0;
        for (let k = 0; k < WINDOW_HOURS; k++) n += m[(s + k) % 24];
        if (!best || n > best.count) best = { area: a, start: s, count: n };
      }
    }
    if (best && best.count > 0) {
      used.add(best.area);
      out.push({ group, ...best });
    }
  }
  if (windowCache.size > 32) windowCache.clear();
  windowCache.set(key, out);
  return out;
}

const areaTarget = (a: number) => ({ kind: "area" as const, id: `area-${a}`, label: AREAS[a].areaBn });

/**
 * Up to `limit` (8) concrete actions, most urgent first: dispatch to a waiting
 * SOS; a patrol to an area rising now; back-up for a station with overdue
 * cases; link cases one ring or gang left at several stations; a women help
 * desk where women and child cases are open; and standing patrol windows
 * where the 30-day history peaks (sooner hours ranked higher).
 */
export function recommendations(world: World, now: number, div?: DivisionScope, limit = 8): Recommendation[] {
  const out: Recommendation[] = [];
  const hr = bdHour(now);

  for (const c of world.cases) {
    if (!sosWaiting(c) || !inDivision(c, div)) continue;
    const near = rankUnits(c.place, world.units, "police")[0];
    out.push({
      id: `rec-sos-${c.id}`,
      kind: "sos",
      priority: 100 + Math.min(20, Math.floor((now - c.reportedAt) / 10_000)),
      title: `Dispatch to the SOS at ${c.place.areaBn} now`,
      reason: near
        ? `Waiting ${Math.max(0, Math.round((now - c.reportedAt) / 1000))} s; nearest free unit ${near.unit.name}, about ${near.eta} min away`
        : `Waiting ${Math.max(0, Math.round((now - c.reportedAt) / 1000))} s; no police unit is free nearby`,
      target: areaTarget(Math.max(0, areaIndex(c.place))),
      division: c.place.division,
      caseIds: [c.id],
    });
  }

  for (const w of earlyWarnings(world, now, div)) {
    if (w.level === "watch" || w.sosWaiting > 0) continue;
    out.push({
      id: `rec-now-${w.area}`,
      kind: "patrol-now",
      priority: w.level === "critical" ? 90 : 80,
      title: `Send a patrol to ${w.areaBn} now`,
      reason: w.reason,
      target: areaTarget(w.area),
      division: w.division,
      caseIds: w.caseIds,
    });
  }

  for (const r of stationRows(world, div)) {
    if (r.overdue < 2) continue;
    out.push({
      id: `rec-backup-${r.station.id}`,
      kind: "backup",
      priority: 70 + r.overdue,
      title: `Back up ${r.station.name}`,
      reason: `${r.overdue} cases overdue after 3 missed alerts; ${r.patrolsAvailable} of ${r.patrols.length} patrols free`,
      target: { kind: "station", id: r.station.id, label: r.station.name },
      division: r.division,
    });
  }

  for (const n of networks(world, div)) {
    if (n.stations.length < 2 || n.open < 1) continue;
    const name = `${n.kind === "ring" ? "Ring" : "Gang"} ${n.groupId}`;
    const shown = n.caseIds.slice(-3).join(", ");
    out.push({
      id: `rec-link-${n.groupId}`,
      kind: "link-cases",
      priority: 60 + n.stations.length,
      title: `Link cases ${shown}${n.caseIds.length > 3 ? " and more" : ""} as one investigation`,
      reason: `${name} touched ${n.stations.length} stations in ${n.caseIds.length} cases, ${n.open} still open`,
      target: { kind: "division", id: n.divisions[0], label: divisionLabel(n.divisions[0]) },
      division: n.divisions[0],
      caseIds: n.caseIds,
    });
  }

  for (const d of womenDeskLoad(world, div)) {
    if (d.open < 2) continue;
    out.push({
      id: `rec-desk-${d.station.id}`,
      kind: "women-desk",
      priority: 55 + d.open,
      title: `Women help desk at ${d.station.name}`,
      reason: `${d.open} open women and child cases${d.critical ? `, ${d.critical} critical` : ""}${d.awaiting ? `, ${d.awaiting} waiting for a unit` : ""}`,
      target: { kind: "station", id: d.station.id, label: d.station.name },
      division: unitDivision(d.station),
    });
  }

  for (const w of patrolWindows(world.seed, scoped(div))) {
    const ahead = (w.start - hr + 24) % 24;
    out.push({
      id: `rec-window-${w.group.categories.join("+")}-${w.area}`,
      kind: "patrol-window",
      priority: 40 + (ahead <= 3 ? 10 : 0),
      title: `Put a patrol at ${AREAS[w.area].areaBn} ${pad(w.start)}:00–${pad((w.start + WINDOW_HOURS) % 24)}:00`,
      reason: `${w.count} ${w.group.label} reports at these hours in ${HISTORY_DAYS} days`,
      target: areaTarget(w.area),
      division: AREAS[w.area].division,
    });
  }

  const seen = new Set<string>();
  return out
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
    .filter((r) => {
      const k = `${r.kind}|${r.target.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}

/** Human label for a category list, e.g. in tooltips: "Sexual harassment, Theft and snatching". */
export const categoryLabels = (cs: readonly Category[]): string => cs.map((c) => CATEGORY_META[c].label).join(", ");
