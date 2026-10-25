/**
 * The demo world: a seeded starting snapshot and one-at-a-time live arrivals.
 * Every case is invented (see the data files); the same seed and time always
 * give the same world.
 */
import { haversineKm, lerp, nearestHome, rankUnits } from "./geo.ts";
import { mulberry32, pick, weighted, type Rng } from "./rng.ts";
import { CATEGORY_META, routeCategory } from "./routing.ts";
import { begin, addCase, finish } from "./draft.ts";
import { ACK_WINDOW_MS, OVERDUE_AFTER_TIMEOUTS, alertNextIn, isMobile, round1 } from "./alerting.ts";
import type { Business, Case, Category, ConsumerCategory, Dept, Place, Status, TimelineEntry, Unit, World } from "./types.ts";
import { PLACES } from "../../data/command/places.ts";
import { PATROLS, STATIONS } from "../../data/command/stations.ts";
import { BUSINESSES, OFFICES, TEAMS } from "../../data/command/consumer.ts";
import { CATEGORY_KINDS, TEMPLATES } from "../../data/command/templates.ts";

/** The generator newCase needs: it reads `next()` and the caller saves `state()`. */
export type SimRng = ReturnType<typeof mulberry32>;

const MIN = 60_000;
const DEPT_WEIGHTS: readonly { item: Dept; weight: number }[] = [
  { item: "police", weight: 55 },
  { item: "consumer", weight: 30 },
  { item: "other", weight: 15 },
];
const CATEGORIES: Record<Dept, Category[]> = { police: [], consumer: [], other: [] };
for (const [c, m] of Object.entries(CATEGORY_META)) CATEGORIES[m.dept].push(c as Category);

export const caseId = (n: number): string => `PB-${String(n).padStart(6, "0")}`;
const between = (r: Rng, lo: number, hi: number): number => Math.round(lo + r.next() * (hi - lo));

/** A point up to 600 m from the place, uniformly over the disc. */
function jitter(r: Rng, p: Place): Place {
  const km = 0.59 * Math.sqrt(r.next());
  const angle = 2 * Math.PI * r.next();
  const dLat = (km * Math.cos(angle)) / 111.32;
  const dLng = (km * Math.sin(angle)) / (111.32 * Math.cos((p.lat * Math.PI) / 180));
  const round5 = (x: number) => Math.round(x * 1e5) / 1e5;
  return { ...p, lat: round5(p.lat + dLat), lng: round5(p.lng + dLng) };
}

/** A consumer case sits exactly at the business; the area name comes from the nearest listed place. */
function businessPlace(b: Business): Place {
  const local = PLACES.filter((p) => p.district === b.district);
  let area = (local.length ? local : PLACES)[0];
  for (const p of local.length ? local : PLACES) if (haversineKm(p, b) < haversineKm(area, b)) area = p;
  return { division: b.division, district: b.district, areaBn: area.areaBn, lat: b.lat, lng: b.lng };
}

/** A fresh, unalerted case of the department (status "new", timeline [reported]). */
function draftCase(r: Rng, units: readonly Unit[], businesses: readonly Business[], dept: Dept, id: string, at: number): Case {
  const category = pick(r, CATEGORIES[dept]);
  const { agency, severity } = routeCategory(category);
  let business: Business | undefined;
  let place: Place;
  if (dept === "consumer") {
    const kinds = CATEGORY_KINDS[category as ConsumerCategory];
    const pool = kinds ? businesses.filter((b) => kinds.includes(b.kind)) : businesses;
    business = pick(r, pool.length ? pool : businesses);
    place = businessPlace(business);
  } else {
    place = jitter(r, pick(r, PLACES));
  }
  const fitting = TEMPLATES[category].filter((t) => !t.kinds || (business !== undefined && t.kinds.includes(business.kind)));
  const t = pick(r, fitting.length ? fitting : TEMPLATES[category]);
  const fill = (s: string) => s.replaceAll("{area}", place.areaBn).replaceAll("{business}", business?.nameBn ?? "");
  const home = dept === "other" ? undefined : nearestHome(place, units, dept);
  return {
    id,
    dept,
    ...(agency ? { agency } : {}),
    category,
    severity,
    titleBn: fill(t.titleBn),
    summaryBn: fill(t.summaryBn),
    place,
    reportedAt: at,
    status: "new",
    ...(home ? { homeId: home.id } : {}),
    alerts: [],
    timeline: [{ at, kind: "reported", text: `Complaint received: ${CATEGORY_META[category].label}, ${place.district}` }],
    notes: [],
    ...(business ? { businessId: business.id } : {}),
  };
}

/** One live arrival at `now`, alerted straight away. The caller writes `r.state()` back into the world. */
export function newCase(world: World, r: SimRng, now: number): World {
  const dept = weighted(r, DEPT_WEIGHTS);
  const c = draftCase(r, world.units, world.businesses, dept, caseId(world.nextId), now);
  const d = begin(world);
  addCase(d, c);
  alertNextIn(d, c.id, now);
  return finish(d, { nextId: world.nextId + 1 });
}

// ---------------------------------------------------------------------------
// Seeding: a plausible snapshot of the last six hours.

interface Plan { dept: Dept; status: Status; timeouts: number }
const p = (dept: Dept, status: Status, timeouts = 0): Plan => ({ dept, status, timeouts });

/**
 * Busy cases first (they take units), then finished ones, then alerted cases
 * last so their pending units are still free. 22 police, 12 consumer, 6 other.
 */
const PLAN: readonly Plan[] = [
  p("police", "acknowledged"), p("police", "acknowledged", 1), p("police", "acknowledged", 2),
  p("police", "en-route", 1), p("police", "en-route"), p("police", "en-route", 2), p("police", "en-route", 1),
  p("police", "on-scene", 1), p("police", "on-scene", 2), p("police", "on-scene"),
  p("consumer", "acknowledged", 1), p("consumer", "acknowledged", 2),
  p("consumer", "en-route", 1), p("consumer", "en-route"),
  p("consumer", "on-scene", 1),
  p("police", "resolved", 1), p("police", "resolved", 2), p("police", "resolved"),
  p("police", "closed"), p("police", "closed", 1), p("police", "closed", 1), p("police", "closed", 2),
  p("consumer", "resolved", 1), p("consumer", "resolved"), p("consumer", "closed", 2), p("consumer", "closed", 1),
  p("police", "alerted"), p("police", "alerted", 1), p("police", "alerted"), p("police", "alerted", 3), p("police", "alerted"),
  p("consumer", "alerted"), p("consumer", "alerted", 1), p("consumer", "alerted"),
  p("other", "new"), p("other", "new"), p("other", "acknowledged"), p("other", "acknowledged"), p("other", "resolved"), p("other", "closed"),
];

const ORDER: readonly Status[] = ["new", "alerted", "acknowledged", "en-route", "on-scene", "resolved", "closed"];
const reached = (s: Status, target: Status) => ORDER.indexOf(target) >= ORDER.indexOf(s);

/** Shifts every time in the case by `dt` (the story is built from time 0, then placed). */
function shift(c: Case, dt: number): void {
  c.reportedAt += dt;
  for (const a of c.alerts) a.at += dt;
  c.timeline = c.timeline.map((e) => ({ ...e, at: e.at + dt }));
  if (c.firstAckAt !== undefined) c.firstAckAt += dt;
  if (c.resolvedAt !== undefined) c.resolvedAt += dt;
}

/** Writes a police/consumer case's history up to `target`, starting at time 0. Returns the working unit. */
function unitStory(r: Rng, c: Case, units: Unit[], plan: Plan): Unit | undefined {
  if (c.dept === "other") return undefined;
  const ranked = rankUnits(c.place, units, c.dept);
  const window = ACK_WINDOW_MS[c.severity];
  const step = window + 1000;
  const log = (e: TimelineEntry) => c.timeline.push(e);
  let t = between(r, 2000, 6000);
  if (ranked.length === 0) {
    // No unit of the department exists: the case stays queued.
    log({ at: t, kind: "note", text: "No unit free; queued" });
    return undefined;
  }
  const n = Math.min(plan.timeouts, Math.max(0, ranked.length - 1));
  for (let i = 0; i <= n; i++) {
    const { unit, km, eta } = ranked[i];
    c.alerts.push({ at: t, unitId: unit.id, outcome: "pending" });
    c.distanceKm = round1(km);
    c.etaMin = eta;
    log({ at: t, kind: "alerted", text: `Alerted ${unit.name} (${round1(km)} km, about ${eta} min away)` });
    if (i < n) {
      c.alerts[c.alerts.length - 1].outcome = "timed-out";
      t += step;
      log({ at: t, kind: "escalated", text: `${unit.name} did not answer within ${window / 1000} s; escalated` });
      if (i + 1 === OVERDUE_AFTER_TIMEOUTS) {
        c.overdue = true;
        log({ at: t, kind: "note", text: "Flagged overdue after 3 missed alerts" });
      }
    }
  }
  if (plan.status === "alerted") {
    c.status = "alerted";
    return undefined;
  }
  const unit = ranked[n].unit;
  // Seeded units took a while to answer (most of their window), as busy desks do.
  t += between(r, Math.round(window * 0.3), Math.round(window * 0.95));
  c.alerts[c.alerts.length - 1].outcome = "acknowledged";
  c.assignedUnitId = unit.id;
  c.firstAckAt = t;
  c.status = "acknowledged";
  log({ at: t, kind: "acknowledged", text: `${unit.name} acknowledged the alert` });
  if (reached("en-route", plan.status)) {
    t += between(r, MIN, 4 * MIN);
    c.status = "en-route";
    log({ at: t, kind: "dispatched", text: `${unit.name} is on the way` });
  }
  if (reached("on-scene", plan.status)) {
    t += Math.min(c.etaMin ?? 10, 40) * MIN;
    c.status = "on-scene";
    log({ at: t, kind: "arrived", text: `${unit.name} reached the scene` });
  }
  if (reached("resolved", plan.status)) {
    t += between(r, 10 * MIN, 40 * MIN);
    c.status = "resolved";
    c.resolvedAt = t;
    log({ at: t, kind: "resolved", text: `${unit.name} resolved the complaint on the spot` });
  }
  return unit;
}

/** Other-agency history: forwarded, then optionally resolved. */
function agencyStory(r: Rng, c: Case, plan: Plan): void {
  if (plan.status === "new") return;
  let t = between(r, 5 * MIN, 30 * MIN);
  c.status = "acknowledged";
  c.firstAckAt = t;
  c.timeline.push({ at: t, kind: "forwarded", text: `Forwarded to ${c.agency}`, by: "operator" });
  if (reached("resolved", plan.status)) {
    t += between(r, 30 * MIN, 90 * MIN);
    c.status = "resolved";
    c.resolvedAt = t;
    c.timeline.push({ at: t, kind: "resolved", text: `Resolved: ${c.agency ?? "the agency"} confirmed action` });
  }
}

function seedCase(r: Rng, units: Unit[], businesses: readonly Business[], plan: Plan, now: number, tmpId: string): Case {
  const c = draftCase(r, units, businesses, plan.dept, tmpId, 0);
  const unit = unitStory(r, c, units, plan);
  if (c.dept === "other") agencyStory(r, c, plan);
  if (plan.status === "closed" && c.status === "resolved") {
    c.status = "closed";
    c.timeline.push({ at: (c.resolvedAt ?? 0) + 10 * MIN, kind: "closed", text: "Closed automatically 10 minutes after resolution" });
  }
  const end = c.timeline[c.timeline.length - 1].at;
  let reportedAt: number;
  if (c.status === "alerted") {
    // The live alert went out within the last 80% of its window.
    const last = c.alerts[c.alerts.length - 1].at;
    reportedAt = now - Math.round(r.next() * 0.8 * ACK_WINDOW_MS[c.severity]) - last;
  } else if (c.status === "resolved") {
    reportedAt = now - end - between(r, 30_000, 8 * MIN);
  } else if (c.status === "closed") {
    reportedAt = now - end - between(r, 5 * MIN, Math.max(5 * MIN, 6 * 60 * MIN - end - 10 * MIN));
  } else if (c.status === "new") {
    reportedAt = now - between(r, 2 * MIN, 60 * MIN);
  } else {
    reportedAt = now - end - between(r, 30_000, 20 * MIN);
  }
  shift(c, reportedAt);
  if (unit && reached("acknowledged", c.status) && !reached("resolved", c.status)) {
    const i = units.findIndex((u) => u.id === unit.id);
    const moved =
      !isMobile(unit) ? unit : c.status === "on-scene" ? { ...unit, lat: c.place.lat, lng: c.place.lng }
      : c.status === "en-route" ? { ...unit, ...lerp(unit, c.place, 0.2 + 0.4 * r.next()) } : unit;
    units[i] = { ...moved, status: "busy", caseId: c.id };
  }
  return c;
}

export function seedWorld(seed: number, now: number): World {
  const r = mulberry32(seed);
  const units: Unit[] = [...STATIONS, ...PATROLS, ...OFFICES, ...TEAMS].map((u) => ({ ...u }));
  const businesses: Business[] = BUSINESSES.map((b) => ({ ...b }));
  const drafted = PLAN.map((plan, i) => seedCase(r, units, businesses, plan, now, `tmp-${i}`));
  drafted.sort((a, b) => a.reportedAt - b.reportedAt || a.id.localeCompare(b.id));
  const ids = new Map<string, string>();
  const cases = drafted.map((c, i) => {
    ids.set(c.id, caseId(i + 1));
    return { ...c, id: caseId(i + 1) };
  });
  const finalUnits = units.map((u) => (u.caseId ? { ...u, caseId: ids.get(u.caseId) } : u));
  return {
    version: 1,
    seed,
    now,
    rngState: r.state(),
    nextId: cases.length + 1,
    nextArrivalAt: now + 4000,
    paused: false,
    cases,
    units: finalUnits,
    businesses,
  };
}

/* ------------------------------------------------------------ saved world */

/** A saved world older than this is not "live" any more: the store seeds a fresh one. */
export const STALE_AFTER_MS = 30 * 60_000;
/** A saved clock this far ahead of ours (another machine, a changed system clock) is not trusted either. */
const FUTURE_SLACK_MS = 5 * 60_000;

const STATUSES: ReadonlySet<string> = new Set(["new", "alerted", "acknowledged", "en-route", "on-scene", "resolved", "closed"]);
const DEPTS: ReadonlySet<string> = new Set(["police", "consumer", "other"]);
const UNIT_KINDS: ReadonlySet<string> = new Set(["station", "patrol", "office", "team"]);
const UNIT_STATUSES: ReadonlySet<string> = new Set(["available", "busy", "off-duty"]);

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isPoint = (v: unknown): boolean => isObj(v) && isNum(v.lat) && isNum(v.lng);
/** Alerts, timeline entries and notes: objects with a numeric `at` (resume() shifts it). */
const isStampedList = (v: unknown): boolean => Array.isArray(v) && v.every((e) => isObj(e) && isNum(e.at));
const isOptNum = (v: unknown): boolean => v === undefined || isNum(v);

function isSavedCase(v: unknown): boolean {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.dept) && DEPTS.has(v.dept) &&
    isStr(v.status) && STATUSES.has(v.status) &&
    isStr(v.category) &&
    isStr(v.severity) &&
    isStr(v.titleBn) &&
    isNum(v.reportedAt) &&
    isPoint(v.place) &&
    isOptNum(v.firstAckAt) &&
    isOptNum(v.resolvedAt) &&
    isStampedList(v.alerts) &&
    isStampedList(v.timeline) &&
    isStampedList(v.notes)
  );
}

function isSavedUnit(v: unknown): boolean {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.kind) && UNIT_KINDS.has(v.kind) &&
    (v.dept === "police" || v.dept === "consumer") &&
    isStr(v.status) && UNIT_STATUSES.has(v.status) &&
    isStr(v.homeId) &&
    isPoint(v)
  );
}

/**
 * The world saved in the browser, if it is still usable at `now`: the JSON is a
 * World or `{ world: World, ... }` (the store's entry). Returns null for
 * garbage, a wrong `version` or shape, or an unpaused world older than STALE_AFTER_MS —
 * the caller then seeds a new one.
 */
export function parseSaved(json: string, now: number): World | null {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return null;
  }
  const w = isObj(value) && "world" in value ? value.world : value;
  if (!isObj(w) || w.version !== 1) return null;
  if (!isNum(w.seed) || !isNum(w.now) || !isNum(w.rngState) || !isNum(w.nextArrivalAt)) return null;
  if (!Number.isInteger(w.nextId) || typeof w.paused !== "boolean") return null;
  // A paused demo is frozen, not stale: it resumes where it stopped (engine resume()).
  if (!w.paused && (now - w.now > STALE_AFTER_MS || w.now - now > FUTURE_SLACK_MS)) return null;
  if (!Array.isArray(w.cases) || !Array.isArray(w.units) || !Array.isArray(w.businesses)) return null;
  if (w.units.length === 0 || !w.cases.every(isSavedCase) || !w.units.every(isSavedUnit)) return null;
  if (!w.businesses.every((b) => isObj(b) && isStr(b.id) && isPoint(b))) return null;
  return w as unknown as World;
}
