/**
 * The demo world: a seeded starting snapshot and one-at-a-time live arrivals.
 * Every case is invented (see the data files); the same seed and time always
 * give the same world.
 */
import { haversineKm, lerp, nearestHome, rankUnits } from "./geo.ts";
import { mulberry32, pick, weighted, type Rng } from "./rng.ts";
import { CATEGORY_META, POLICE_CATEGORIES, routeCategory } from "./routing.ts";
import { begin, addCase, finish } from "./draft.ts";
import { NOTE_KINDS } from "./actions.ts";
import { OVERDUE_AFTER_TIMEOUTS, ackWindowMs, alertNextIn, isMobile, round1 } from "./alerting.ts";
import { AREAS, areaWeight, bdHour, categoryHourWeight, historyCount, historyFor } from "./history.ts";
import { overpricedToday } from "./prices.ts";
import { seedRecalls } from "./recalls.ts";
import { bdDay } from "./selectors.ts";
import type {
  Business,
  Case,
  CaseNote,
  Category,
  ConsumerCategory,
  Dept,
  DivisionId,
  Involved,
  InvolvedKind,
  NoteKind,
  Place,
  PoliceCategory,
  Status,
  TimelineEntry,
  Unit,
  Victim,
  World,
} from "./types.ts";
import { PLACES } from "../../data/command/places.ts";
import { PATROLS, STATIONS } from "../../data/command/stations.ts";
import { BUSINESSES, OFFICES, TEAMS } from "../../data/command/consumer.ts";
import { CATEGORY_KINDS, TEMPLATES, type Template } from "../../data/command/templates.ts";
import { PRICE_ITEMS } from "../../data/command/prices.ts";
import { HAZARDS, RECALLS } from "../../data/command/recalls.ts";

/** The generator newCase needs: it reads `next()` and the caller saves `state()`. */
export type SimRng = ReturnType<typeof mulberry32>;

const MIN = 60_000;
const DEPT_WEIGHTS: readonly { item: Dept; weight: number }[] = [
  { item: "police", weight: 55 },
  { item: "consumer", weight: 30 },
  { item: "other", weight: 15 },
];
/** Police's share of arrivals (intel scales the 30-day history to the live pace with it). */
export const POLICE_SHARE = DEPT_WEIGHTS[0].weight / DEPT_WEIGHTS.reduce((s, d) => s + d.weight, 0);
const CATEGORIES: Record<Dept, Category[]> = { police: [], consumer: [], other: [] };
for (const [c, m] of Object.entries(CATEGORY_META)) CATEGORIES[m.dept].push(c as Category);

/**
 * Police arrivals follow the same model as the 30-day history (history.ts), so
 * the live feed and "the usual rate" agree: the category by its share at this
 * hour of the day, then the area by how strongly it draws that category. The
 * category weight carries the sum of its area weights, which makes the pair
 * proportional to the history's expectation for (area, category, hour).
 */
interface PoliceModel {
  byHour: { item: PoliceCategory; weight: number }[][];
  areas: Map<PoliceCategory, { item: number; weight: number }[]>;
}
const models = new Map<number, PoliceModel>();
function policeModel(seed: number): PoliceModel {
  let m = models.get(seed);
  if (m) return m;
  const areas = new Map<PoliceCategory, { item: number; weight: number }[]>();
  const sums = new Map<PoliceCategory, number>();
  for (const c of POLICE_CATEGORIES) {
    const list = AREAS.map((_, a) => ({ item: a, weight: areaWeight(seed, a, c) }));
    areas.set(c, list);
    sums.set(c, list.reduce((s, x) => s + x.weight, 0));
  }
  const byHour = Array.from({ length: 24 }, (_, h) =>
    POLICE_CATEGORIES.map((c) => ({ item: c, weight: categoryHourWeight(c, h) * (sums.get(c) ?? 0) })),
  );
  m = { byHour, areas };
  if (models.size > 8) models.clear();
  models.set(seed, m);
  return m;
}

/** Who a case protects, where the template does not say. Categories missing here record no victim. */
const VICTIM_MIX: Partial<Record<PoliceCategory, { item: Victim; weight: number }[]>> = {
  "sexual-harassment": [{ item: "woman", weight: 80 }, { item: "child", weight: 20 }],
  "domestic-violence": [{ item: "woman", weight: 85 }, { item: "child", weight: 10 }, { item: "elderly", weight: 5 }],
  kidnapping: [{ item: "child", weight: 50 }, { item: "woman", weight: 25 }, { item: "general", weight: 25 }],
  sos: [{ item: "woman", weight: 40 }, { item: "general", weight: 45 }, { item: "elderly", weight: 10 }, { item: "child", weight: 5 }],
  harassment: [{ item: "general", weight: 60 }, { item: "woman", weight: 30 }, { item: "elderly", weight: 10 }],
  theft: [{ item: "general", weight: 75 }, { item: "woman", weight: 15 }, { item: "elderly", weight: 10 }],
  assault: [{ item: "general", weight: 70 }, { item: "woman", weight: 15 }, { item: "elderly", weight: 10 }, { item: "child", weight: 5 }],
};

/** Chance the complainant asks not to be named: highest where retaliation and stigma are feared. */
const ANONYMOUS: Partial<Record<Category, number>> = {
  "sexual-harassment": 0.45, "domestic-violence": 0.35, chadabaji: 0.4, drugs: 0.5, "police-misconduct": 0.5, kidnapping: 0.2,
};
const ANONYMOUS_DEFAULT: Record<Dept, number> = { police: 0.1, consumer: 0.15, other: 0.1 };

/** What kind of actor is behind a case, where the template does not say. Categories missing here record nothing. */
const INVOLVED_MIX: Partial<Record<PoliceCategory, { item: InvolvedKind; weight: number }[]>> = {
  chadabaji: [{ item: "ring", weight: 45 }, { item: "gang", weight: 25 }, { item: "repeat", weight: 15 }, { item: "unknown", weight: 15 }],
  drugs: [{ item: "ring", weight: 40 }, { item: "gang", weight: 20 }, { item: "individual", weight: 20 }, { item: "unknown", weight: 20 }],
  theft: [{ item: "gang", weight: 30 }, { item: "repeat", weight: 20 }, { item: "individual", weight: 25 }, { item: "unknown", weight: 25 }],
  kidnapping: [{ item: "gang", weight: 40 }, { item: "ring", weight: 20 }, { item: "unknown", weight: 40 }],
  "sexual-harassment": [{ item: "repeat", weight: 30 }, { item: "individual", weight: 40 }, { item: "gang", weight: 10 }, { item: "unknown", weight: 20 }],
  "domestic-violence": [{ item: "individual", weight: 90 }, { item: "repeat", weight: 10 }],
  assault: [{ item: "individual", weight: 40 }, { item: "gang", weight: 30 }, { item: "unknown", weight: 30 }],
  harassment: [{ item: "individual", weight: 50 }, { item: "repeat", weight: 25 }, { item: "unknown", weight: 25 }],
};

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const code = (prefix: string, n: number): string => `${prefix}-${String(n).padStart(2, "0").replace(/\d/g, (d) => BN_DIGITS[Number(d)])}`;
/** Fictional group codes, a small fixed pool per division, so one ring links cases across its stations. */
const GROUP_NUMBERS: Record<DivisionId, { ring: number[]; gang: number[] }> = {
  dhaka: { ring: [1, 2, 3, 4], gang: [1, 2, 3] },
  chattogram: { ring: [5, 6], gang: [4, 5] },
  khulna: { ring: [7], gang: [6] },
  rajshahi: { ring: [8], gang: [7] },
  sylhet: { ring: [9], gang: [8] },
  barishal: { ring: [10], gang: [9] },
  rangpur: { ring: [11], gang: [10] },
  mymensingh: { ring: [12], gang: [11] },
};
export const GROUP_PREFIX = { ring: "চক্র", gang: "দল" } as const;

function involvedFor(r: Rng, kind: InvolvedKind, division: DivisionId): Involved {
  if (kind === "ring" || kind === "gang") {
    return { kind, groupId: code(GROUP_PREFIX[kind], pick(r, GROUP_NUMBERS[division][kind])), people: kind === "ring" ? between(r, 3, 8) : between(r, 2, 6) };
  }
  return kind === "unknown" ? { kind } : { kind, people: 1 };
}

/** Business kinds that sell the price-watch essentials. */
const PRICE_KINDS: readonly string[] = ["grocery", "market"];

interface Product { id: string; nameBn: string; kind: NonNullable<Template["product"]> }

/**
 * The product a consumer case is about, if any: an overpricing complaint at a
 * grocery or market is usually about an essential (one sold over its price
 * today is four times as likely); fake-product and adulteration complaints are
 * sometimes about a recalled product the business would stock.
 */
function productFor(r: Rng, category: Category, business: Business, seed: number, clock: number): Product | undefined {
  if (category === "overpricing" && PRICE_KINDS.includes(business.kind)) {
    if (r.next() >= 0.7) return undefined;
    const over = new Set(overpricedToday(seed, bdDay(clock), business.division).map((p) => p.id));
    const item = weighted(r, PRICE_ITEMS.map((p) => ({ item: p, weight: over.has(p.id) ? 4 : 1 })));
    return { id: item.id, nameBn: item.nameBn, kind: item.fixed ? "fixed" : "price" };
  }
  if (category === "fake-product" || category === "adulteration") {
    const pool = RECALLS.filter((rc) => HAZARDS[rc.hazard].category === category && rc.kinds.includes(business.kind));
    if (pool.length === 0 || r.next() >= 0.4) return undefined;
    const rc = pick(r, pool);
    return { id: rc.id, nameBn: `${rc.brandBn} ${rc.productBn}`, kind: "recall" };
  }
  return undefined;
}

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

/**
 * A fresh, unalerted case of the department (status "new", timeline [reported]).
 * `clock` sets the hour of day and the price day the case is drawn for (the
 * report time for live arrivals; the seeding time for a seeded world, whose
 * stories are built from time 0). `force` fixes a police case's category and
 * area (the seeded clusters).
 */
function draftCase(
  r: Rng,
  seed: number,
  units: readonly Unit[],
  businesses: readonly Business[],
  dept: Dept,
  id: string,
  at: number,
  clock: number,
  force?: Cluster,
): Case {
  let category: Category;
  let business: Business | undefined;
  let place: Place;
  if (dept === "police" && force) {
    category = force.category;
    place = jitter(r, force.place);
  } else if (dept === "police") {
    const model = policeModel(seed);
    const c = weighted(r, model.byHour[bdHour(clock)]);
    category = c;
    place = jitter(r, AREAS[weighted(r, model.areas.get(c) ?? [])]);
  } else {
    category = pick(r, CATEGORIES[dept]);
    if (dept === "consumer") {
      const kinds = CATEGORY_KINDS[category as ConsumerCategory];
      const pool = kinds ? businesses.filter((b) => kinds.includes(b.kind)) : businesses;
      business = pick(r, pool.length ? pool : businesses);
      place = businessPlace(business);
    } else {
      place = jitter(r, pick(r, PLACES));
    }
  }
  const { agency, severity } = routeCategory(category);
  const product = business ? productFor(r, category, business, seed, clock) : undefined;
  const fits = (t: Template) => (!t.kinds || (business !== undefined && t.kinds.includes(business.kind))) && t.product === product?.kind;
  const fitting = TEMPLATES[category].filter(fits);
  const plain = TEMPLATES[category].filter((t) => !t.product);
  const t = pick(r, fitting.length ? fitting : plain);
  // A product the chosen text cannot name is dropped, so the case and its text agree.
  const named = product && t.product === product.kind ? product : undefined;
  const fill = (s: string) =>
    s.replaceAll("{area}", place.areaBn).replaceAll("{business}", business?.nameBn ?? "").replaceAll("{product}", named?.nameBn ?? "");
  const home = dept === "other" ? undefined : nearestHome(place, units, dept);
  const police = dept === "police" ? (category as PoliceCategory) : undefined;
  const victimMix = police ? VICTIM_MIX[police] : undefined;
  const victim = t.victim ?? (victimMix ? weighted(r, victimMix) : undefined);
  const anonymous = r.next() < (ANONYMOUS[category] ?? ANONYMOUS_DEFAULT[dept]);
  const involvedMix = police ? INVOLVED_MIX[police] : undefined;
  const involvedKind = t.involved ?? (involvedMix ? weighted(r, involvedMix) : undefined);
  const involved = involvedKind ? involvedFor(r, involvedKind, place.division) : undefined;
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
    ...(victim ? { victim } : {}),
    ...(anonymous ? { anonymous } : {}),
    ...(involved ? { involved } : {}),
    ...(named ? { productId: named.id } : {}),
  };
}

/** One live arrival at `now`, alerted straight away. The caller writes `r.state()` back into the world. */
export function newCase(world: World, r: SimRng, now: number): World {
  const dept = weighted(r, DEPT_WEIGHTS);
  const c = draftCase(r, world.seed, world.units, world.businesses, dept, caseId(world.nextId), now, now);
  const d = begin(world);
  addCase(d, c);
  alertNextIn(d, c.id, now);
  return finish(d, { nextId: world.nextId + 1 });
}

// ---------------------------------------------------------------------------
// Seeding: a plausible snapshot of the last six hours.

interface Cluster { category: PoliceCategory; place: Place }
interface Plan { dept: Dept; status: Status; timeouts: number; force?: Cluster }
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
  c.notes = c.notes.map((n) => ({ ...n, at: n.at + dt }));
  if (c.firstAckAt !== undefined) c.firstAckAt += dt;
  if (c.resolvedAt !== undefined) c.resolvedAt += dt;
}

/** Writes a police/consumer case's history up to `target`, starting at time 0. Returns the working unit. */
function unitStory(r: Rng, c: Case, units: Unit[], plan: Plan): Unit | undefined {
  if (c.dept === "other") return undefined;
  const ranked = rankUnits(c.place, units, c.dept);
  const window = ackWindowMs(c);
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

/**
 * What the inspection team found, by kind of complaint, for consumer cases that
 * reached the scene. Fixed text and amounts (no random draws), so the seed's
 * random sequence is untouched. Fines are invented demonstration figures.
 */
const INSPECTION_STORY: Record<ConsumerCategory, { kind: NoteKind; text: string; amountTk?: number }> = {
  adulteration: { kind: "fine", text: "Sample taken for testing; adulterated stock found and a fine imposed on the spot.", amountTk: 25_000 },
  overpricing: { kind: "fine", text: "Price list checked against the market rate; fined for charging above the displayed price.", amountTk: 10_000 },
  "fake-product": { kind: "sealed", text: "Counterfeit stock found and sealed; the owner was asked to attend the office." },
  "unsafe-business": { kind: "warning", text: "Hygiene and safety breaches recorded; written warning issued with a 7-day deadline to fix them." },
  "false-weight": { kind: "fine", text: "Scales found to weigh short; the scale was seized and a fine imposed.", amountTk: 5_000 },
};

/** Adds the inspection outcome to a consumer case that got as far as the scene (before it is resolved). */
function inspectionStory(c: Case, plan: Plan): void {
  if (c.dept !== "consumer" || !reached("on-scene", plan.status)) return;
  const arrived = c.timeline.find((e) => e.kind === "arrived");
  if (!arrived) return;
  const s = INSPECTION_STORY[c.category as ConsumerCategory];
  if (!s) return;
  // An open on-scene case has only the first look; finished ones carry the outcome.
  const done = reached("resolved", plan.status);
  const at = arrived.at + 2 * MIN;
  const note: CaseNote = done
    ? { at, text: s.text, kind: s.kind, ...(s.amountTk !== undefined ? { amountTk: s.amountTk } : {}) }
    : { at, text: "Team on site; stock and records being checked.", kind: "inspection" };
  c.notes.push(note);
  const label = done && s.amountTk !== undefined ? `Fine ৳ ${s.amountTk.toLocaleString("en-US")}` : "Inspection";
  c.timeline.push({ at, kind: "note", text: `${label}: ${note.text}` });
  c.timeline.sort((a, b) => a.at - b.at);
}

function seedCase(r: Rng, seed: number, units: Unit[], businesses: readonly Business[], plan: Plan, now: number, tmpId: string): Case {
  const c = draftCase(r, seed, units, businesses, plan.dept, tmpId, 0, now, plan.force);
  const unit = unitStory(r, c, units, plan);
  // Before `end` is read below: the inspection note can be the case's last timeline entry, and the case is placed in time by it.
  inspectionStory(c, plan);
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
    reportedAt = now - Math.round(r.next() * 0.8 * ackWindowMs(c)) - last;
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

/**
 * Trouble already building when the board opens: five police reports of one
 * kind at one place within the last half hour, and five more at a place in a
 * different division, so the early warnings have something to read from the
 * first minute. Each place is the quietest at this hour in the seed's history
 * (the second one outside the first one's division): a warning weighs a burst
 * against everything usual there at this hour (intel.ts), and the quietest
 * places run at about 2 reports an hour at most, so five clears "twice the
 * usual". The kind is one the place sees at all.
 */
const CLUSTER_CATEGORIES: readonly PoliceCategory[] = ["sexual-harassment", "chadabaji", "theft", "drugs"];
const CLUSTER_STATUSES: readonly (readonly Status[])[] = [
  ["acknowledged", "en-route", "alerted", "alerted", "alerted"],
  ["acknowledged", "on-scene", "alerted", "alerted", "alerted"],
];

function clusterPlans(r: Rng, seed: number, now: number): { busy: Plan[]; alerted: Plan[] } {
  const h = historyFor(seed);
  const hours = [bdHour(now)];
  const busy: Plan[] = [];
  const alerted: Plan[] = [];
  let taken: DivisionId | undefined;
  for (const statuses of CLUSTER_STATUSES) {
    let a = -1;
    for (let i = 0; i < AREAS.length; i++) {
      if (AREAS[i].division === taken) continue;
      if (a < 0 || historyCount(h, { areas: [i], hours }) < historyCount(h, { areas: [a], hours })) a = i;
    }
    const place = AREAS[a];
    const fitting = CLUSTER_CATEGORIES.filter((c) => areaWeight(seed, a, c) > 0);
    const category = pick(r, fitting.length ? fitting : CLUSTER_CATEGORIES);
    taken = place.division;
    for (const status of statuses) (status === "alerted" ? alerted : busy).push({ ...p("police", status), force: { category, place } });
  }
  return { busy, alerted };
}

export function seedWorld(seed: number, now: number): World {
  const r = mulberry32(seed);
  const units: Unit[] = [...STATIONS, ...PATROLS, ...OFFICES, ...TEAMS].map((u) => ({ ...u }));
  const businesses: Business[] = BUSINESSES.map((b) => ({ ...b }));
  const cluster = clusterPlans(r, seed, now);
  // Busy cluster cases take their units before the planned alerted cases look for free ones; alerted ones go last, like PLAN's.
  const plans = [...cluster.busy, ...PLAN, ...cluster.alerted];
  const drafted = plans.map((plan, i) => seedCase(r, seed, units, businesses, plan, now, `tmp-${i}`));
  drafted.sort((a, b) => a.reportedAt - b.reportedAt || a.id.localeCompare(b.id));
  const ids = new Map<string, string>();
  const cases = drafted.map((c, i) => {
    ids.set(c.id, caseId(i + 1));
    return { ...c, id: caseId(i + 1) };
  });
  const finalUnits = units.map((u) => (u.caseId ? { ...u, caseId: ids.get(u.caseId) } : u));
  return {
    version: 2,
    seed,
    now,
    rngState: r.state(),
    nextId: cases.length + 1,
    nextArrivalAt: now + 4000,
    paused: false,
    cases,
    units: finalUnits,
    businesses,
    recalls: seedRecalls(seed, now),
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

const NOTE_KINDS_SAVED: ReadonlySet<string> = new Set(NOTE_KINDS);
/** Notes: stamped, text a string, and the optional follow-up, kind and amount of the right type. */
function isSavedNotes(v: unknown): boolean {
  return (
    isStampedList(v) &&
    (v as Obj[]).every(
      (n) =>
        isStr(n.text) &&
        isOptNum(n.followUpAt) &&
        (n.kind === undefined || (isStr(n.kind) && NOTE_KINDS_SAVED.has(n.kind))) &&
        (n.amountTk === undefined || (Number.isInteger(n.amountTk) && (n.amountTk as number) > 0)),
    )
  );
}

const VICTIMS: ReadonlySet<string> = new Set(["woman", "child", "elderly", "general"]);
const INVOLVED_KINDS: ReadonlySet<string> = new Set(["ring", "gang", "repeat", "individual", "unknown"]);
const RECALL_STATUSES: ReadonlySet<string> = new Set(["ordered", "seizing", "seized", "destroyed"]);

/** The v2 case fields, each optional and of the right type when present. */
function isSavedCaseExtras(v: Obj): boolean {
  const inv = v.involved;
  return (
    (v.victim === undefined || (isStr(v.victim) && VICTIMS.has(v.victim))) &&
    (v.anonymous === undefined || typeof v.anonymous === "boolean") &&
    (v.productId === undefined || isStr(v.productId)) &&
    (inv === undefined ||
      (isObj(inv) && isStr(inv.kind) && INVOLVED_KINDS.has(inv.kind) && (inv.groupId === undefined || isStr(inv.groupId)) && isOptNum(inv.people)))
  );
}

/** Recall states: a known status, a whole number of units, and a stamped log of texts. */
function isSavedRecalls(v: unknown): boolean {
  if (v === undefined) return true;
  if (!isObj(v)) return false;
  return Object.values(v).every(
    (s) =>
      isObj(s) &&
      isStr(s.status) && RECALL_STATUSES.has(s.status) &&
      Number.isInteger(s.seizedUnits) && (s.seizedUnits as number) >= 0 &&
      isNum(s.updatedAt) &&
      isStampedList(s.log) && (s.log as Obj[]).every((e) => isStr(e.text)),
  );
}

function isSavedCase(v: unknown): boolean {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.dept) && DEPTS.has(v.dept) &&
    isStr(v.status) && STATUSES.has(v.status) &&
    // A category the dashboard no longer knows would break every label lookup.
    isStr(v.category) && Object.hasOwn(CATEGORY_META, v.category) &&
    isSavedCaseExtras(v) &&
    isStr(v.severity) &&
    isStr(v.titleBn) &&
    isNum(v.reportedAt) &&
    isPoint(v.place) &&
    isOptNum(v.firstAckAt) &&
    isOptNum(v.resolvedAt) &&
    isStampedList(v.alerts) &&
    isStampedList(v.timeline) &&
    isSavedNotes(v.notes)
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
  if (!isObj(w) || w.version !== 2) return null;
  if (!isNum(w.seed) || !isNum(w.now) || !isNum(w.rngState) || !isNum(w.nextArrivalAt)) return null;
  if (!Number.isInteger(w.nextId) || typeof w.paused !== "boolean") return null;
  // A paused demo is frozen, not stale: it resumes where it stopped (engine resume()).
  if (!w.paused && (now - w.now > STALE_AFTER_MS || w.now - now > FUTURE_SLACK_MS)) return null;
  if (!Array.isArray(w.cases) || !Array.isArray(w.units) || !Array.isArray(w.businesses)) return null;
  if (w.units.length === 0 || !w.cases.every(isSavedCase) || !w.units.every(isSavedUnit)) return null;
  if (!w.businesses.every((b) => isObj(b) && isStr(b.id) && isPoint(b))) return null;
  if (!isSavedRecalls(w.recalls)) return null;
  return w as unknown as World;
}
