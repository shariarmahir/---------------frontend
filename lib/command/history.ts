/**
 * The demo's last 30 days, as counts only (no Case objects): police reports per
 * area × hour of day × category. Intelligence compares the live feed with it
 * ("twice the usual rate for this hour") and the women safety and intel pages
 * draw their hour patterns from it.
 *
 * One model drives both this history and the live arrivals (generate.ts), so
 * they agree: a category's share by hour (harassment peaks 17–21h, theft in the
 * evening, drugs late at night, extortion in market hours), times a weight for
 * the kind of area (transport hubs and markets draw harassment, theft and
 * extortion; homes draw domestic violence), times a per-area factor from the
 * seed. Counts are Poisson draws around that expectation, at a realistic scale
 * (about six police reports per area per day); intel rescales to the demo pace.
 * Every number is invented for the demonstration.
 */
import { mulberry32 } from "./rng.ts";
import { POLICE_CATEGORIES } from "./routing.ts";
import type { DivisionId, Place, PoliceCategory } from "./types.ts";
import { PLACES } from "../../data/command/places.ts";

export const HISTORY_DAYS = 30;
const HOUR_MS = 3600_000;
const BD_OFFSET_MS = 6 * HOUR_MS;

/** Hour of the day in Bangladesh (UTC+6), 0–23. */
export function bdHour(t: number): number {
  const ms = (((t + BD_OFFSET_MS) % 86_400_000) + 86_400_000) % 86_400_000;
  return Math.floor(ms / HOUR_MS);
}

/** The areas history (and police cases) are counted by: data/command/places.ts, in its order. */
export const AREAS: readonly Place[] = PLACES;
export const areaKey = (p: Pick<Place, "district" | "areaBn">): string => `${p.district}|${p.areaBn}`;
const AREA_INDEX: ReadonlyMap<string, number> = new Map(AREAS.map((p, i) => [areaKey(p), i]));
/** Index of the case's area in AREAS; -1 for a place that is not listed. */
export const areaIndex = (p: Pick<Place, "district" | "areaBn">): number => AREA_INDEX.get(areaKey(p)) ?? -1;

/**
 * Transport: bus, launch and rail hubs and big junctions. Market: markets,
 * commercial and crowded public places. Residential: mostly homes. Mixed: the rest.
 */
export type AreaKind = "transport" | "market" | "residential" | "mixed";
const KIND_OF: Record<string, AreaKind> = {
  "মিরপুর ১০": "transport", "মোহাম্মদপুর": "residential", "শাহবাগ": "transport", "মতিঝিল": "market", "গুলিস্তান": "transport",
  "উত্তরা সেক্টর ৭": "residential", "যাত্রাবাড়ী": "transport", "পুরান ঢাকা লালবাগ": "residential", "বাড্ডা": "residential",
  "রামপুরা": "residential", "খিলগাঁও": "residential", "মালিবাগ": "transport", "ফার্মগেট": "transport", "কারওয়ান বাজার": "market",
  "আজিমপুর": "residential", "পল্টন": "market", "কাফরুল": "residential", "পল্লবী": "residential", "সদরঘাট": "transport",
  "চাষাড়া": "transport", "টঙ্গী": "transport", "গাজীপুর চৌরাস্তা": "transport",
  "আগ্রাবাদ": "market", "পাহাড়তলী": "residential", "দামপাড়া": "transport", "চকবাজার": "market", "হালিশহর": "residential",
  "অক্সিজেন মোড়": "transport", "কান্দিরপাড়": "market", "কক্সবাজার সৈকত": "market",
  "সোনাডাঙ্গা": "transport", "খালিশপুর": "residential", "বেনাপোল": "transport",
  "সাহেব বাজার": "market", "কাদিরগঞ্জ": "residential", "বগুড়া সাতমাথা": "transport",
  "জিন্দাবাজার": "market", "আম্বরখানা": "transport", "বন্দরবাজার": "market",
  "বরিশাল সদর রোড": "market", "লঞ্চঘাট": "transport",
  "রংপুর কেন্দ্রীয় বাজার": "market", "রংপুর মডার্ন মোড়": "transport",
  "গাঙ্গিনারপাড়": "market", "নকলা": "residential",
};
export const AREA_KIND: readonly AreaKind[] = AREAS.map((p) => KIND_OF[p.areaBn] ?? "mixed");

/** Each category's share of police reports over a whole day (sums to 1). */
const SHARE: Record<PoliceCategory, number> = {
  chadabaji: 0.13, harassment: 0.09, "police-misconduct": 0.06, theft: 0.18, assault: 0.1, protest: 0.05,
  "sexual-harassment": 0.11, "domestic-violence": 0.07, kidnapping: 0.04, drugs: 0.11, sos: 0.06,
};

/** Relative activity by hour, 00 to 23 (normalised below to a mean of 1). */
const RAW_SHAPE: Record<PoliceCategory, readonly number[]> = {
  chadabaji: [0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.4, 0.7, 1.2, 1.8, 2, 2, 1.9, 1.8, 1.8, 1.9, 1.8, 1.6, 1.3, 1, 0.8, 0.6, 0.4, 0.3],
  harassment: [0.4, 0.3, 0.2, 0.2, 0.2, 0.3, 0.5, 0.8, 1.1, 1.3, 1.4, 1.4, 1.3, 1.3, 1.4, 1.5, 1.6, 1.7, 1.7, 1.5, 1.3, 1, 0.8, 0.6],
  "police-misconduct": [1.6, 1.5, 1.2, 0.9, 0.6, 0.4, 0.4, 0.5, 0.7, 0.9, 1, 1, 1, 1, 1, 1, 1, 1.1, 1.2, 1.3, 1.5, 1.7, 1.8, 1.7],
  theft: [0.8, 0.6, 0.5, 0.4, 0.4, 0.4, 0.5, 0.7, 0.9, 1, 1, 1, 1, 1, 1, 1.1, 1.3, 1.6, 1.9, 2.1, 2, 1.7, 1.4, 1.1],
  assault: [0.7, 0.5, 0.4, 0.3, 0.3, 0.3, 0.4, 0.6, 0.8, 1, 1.1, 1.1, 1.1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.6, 1.4, 1.1, 0.9],
  protest: [0.05, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.5, 1, 1.8, 2.4, 2.6, 2.6, 2.5, 2.4, 2.2, 1.8, 1.3, 0.8, 0.5, 0.3, 0.2, 0.1, 0.05],
  "sexual-harassment": [0.3, 0.2, 0.1, 0.1, 0.1, 0.2, 0.5, 1.1, 1.4, 1.1, 0.8, 0.8, 0.9, 1, 1, 1.2, 1.6, 2.3, 2.6, 2.6, 2.3, 1.6, 0.9, 0.5],
  "domestic-violence": [1.1, 0.8, 0.5, 0.3, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.7, 0.7, 0.7, 0.7, 0.8, 0.9, 1.1, 1.4, 1.7, 2, 2.1, 1.9, 1.5],
  kidnapping: [0.6, 0.5, 0.4, 0.3, 0.3, 0.4, 0.6, 0.8, 1, 1.1, 1.1, 1.1, 1.2, 1.3, 1.4, 1.4, 1.4, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.7],
  drugs: [2.2, 2.2, 1.9, 1.4, 0.8, 0.4, 0.2, 0.2, 0.3, 0.4, 0.5, 0.5, 0.6, 0.6, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.6, 1.9, 2.1, 2.2],
  sos: [1, 0.8, 0.6, 0.4, 0.3, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 1, 1.1, 1.2, 1.4, 1.6, 1.7, 1.7, 1.6, 1.4, 1.2],
};

/** How strongly each kind of area draws each category (1 = average). */
const DEFAULT_KIND: Record<AreaKind, number> = { transport: 1.2, market: 1.2, residential: 0.9, mixed: 1 };
const KIND_WEIGHT: Partial<Record<PoliceCategory, Record<AreaKind, number>>> = {
  chadabaji: { transport: 1.6, market: 2.2, residential: 0.5, mixed: 1 },
  harassment: { transport: 1.1, market: 1.1, residential: 1, mixed: 1 },
  theft: { transport: 1.8, market: 1.6, residential: 0.7, mixed: 1 },
  assault: { transport: 1, market: 1.1, residential: 1, mixed: 1 },
  protest: { transport: 1.5, market: 1.6, residential: 0.4, mixed: 1 },
  "sexual-harassment": { transport: 2.6, market: 1.8, residential: 0.6, mixed: 1 },
  "domestic-violence": { transport: 0.4, market: 0.6, residential: 2, mixed: 1.2 },
  drugs: { transport: 1.3, market: 0.8, residential: 1.4, mixed: 1 },
};

/** Police reports per area per day at an average weight: the scale of the history. */
const AREA_REPORTS_PER_DAY = 6;

const NCAT = POLICE_CATEGORIES.length;
const NAREA = AREAS.length;
const CAT_INDEX: ReadonlyMap<PoliceCategory, number> = new Map(POLICE_CATEGORIES.map((c, i) => [c, i]));
export const categoryIndex = (c: PoliceCategory): number => CAT_INDEX.get(c) ?? -1;

/** SHARE × hour shape (mean 1), per category index × hour. */
const HOUR_WEIGHT: readonly Float64Array[] = POLICE_CATEGORIES.map((c) => {
  const raw = RAW_SHAPE[c];
  const mean = raw.reduce((a, b) => a + b, 0) / 24;
  return Float64Array.from(raw, (x) => (SHARE[c] * x) / mean);
});

/** A category's expected share of police reports in hour `h`, before area weights. */
export const categoryHourWeight = (c: PoliceCategory, h: number): number => HOUR_WEIGHT[categoryIndex(c)][h];

/** Per-area factor for one seed (0.7 to 1.4): some areas are busier in one demo than in another. */
const factorCache = new Map<number, Float64Array>();
function areaFactors(seed: number): Float64Array {
  let f = factorCache.get(seed);
  if (!f) {
    const r = mulberry32((seed ^ 0x41a7e5) >>> 0);
    f = Float64Array.from(AREAS, () => 0.7 + 0.7 * r.next());
    if (factorCache.size > 8) factorCache.clear();
    factorCache.set(seed, f);
  }
  return f;
}

/** How likely a report of category `c` is to come from area `a` (unnormalised), for this seed. */
export function areaWeight(seed: number, a: number, c: PoliceCategory): number {
  return (KIND_WEIGHT[c] ?? DEFAULT_KIND)[AREA_KIND[a]] * areaFactors(seed)[a];
}

export interface History {
  seed: number;
  days: number;
  categories: readonly PoliceCategory[];
  /** Report counts, indexed [(area * 24 + hour) * categories + category]. */
  counts: Uint16Array;
}

/** Poisson draw (Knuth; the means here are small). */
function poisson(r: { next(): number }, mean: number): number {
  if (mean <= 0) return 0;
  if (mean > 60) return Math.max(0, Math.round(mean + Math.sqrt(mean) * (r.next() + r.next() + r.next() - 1.5) * 2));
  const limit = Math.exp(-mean);
  let k = 0;
  let p = r.next();
  while (p > limit) {
    k++;
    p *= r.next();
  }
  return k;
}

const historyCache = new Map<number, History>();

/** The 30-day history for a demo seed. Memoised per seed; computed in a few milliseconds. */
export function historyFor(seed: number): History {
  const hit = historyCache.get(seed);
  if (hit) return hit;
  const r = mulberry32((seed ^ 0x7a11e4) >>> 0);
  const counts = new Uint16Array(NAREA * 24 * NCAT);
  const perHour = (AREA_REPORTS_PER_DAY * HISTORY_DAYS) / 24;
  for (let a = 0; a < NAREA; a++) {
    for (let c = 0; c < NCAT; c++) {
      const w = areaWeight(seed, a, POLICE_CATEGORIES[c]) * perHour;
      for (let h = 0; h < 24; h++) counts[(a * 24 + h) * NCAT + c] = poisson(r, w * HOUR_WEIGHT[c][h]);
    }
  }
  const out: History = { seed, days: HISTORY_DAYS, categories: POLICE_CATEGORIES, counts };
  if (historyCache.size > 4) historyCache.clear();
  historyCache.set(seed, out);
  return out;
}

export interface HistoryQuery {
  /** Area indexes (AREAS); default every area. */
  areas?: readonly number[];
  division?: DivisionId;
  hours?: readonly number[];
  categories?: readonly PoliceCategory[];
}

const ALL_HOURS: readonly number[] = Array.from({ length: 24 }, (_, h) => h);

function resolve(q: HistoryQuery): { areas: readonly number[]; hours: readonly number[]; cats: number[] } {
  let areas: readonly number[] = q.areas ?? AREAS.map((_, i) => i);
  if (q.division) areas = areas.filter((a) => AREAS[a]?.division === q.division);
  const cats = (q.categories ?? POLICE_CATEGORIES).map(categoryIndex).filter((i) => i >= 0);
  return { areas, hours: q.hours ?? ALL_HOURS, cats };
}

/** Total reports in 30 days matching the query. */
export function historyCount(h: History, q: HistoryQuery = {}): number {
  const { areas, hours, cats } = resolve(q);
  let n = 0;
  for (const a of areas) for (const hr of hours) for (const c of cats) n += h.counts[(a * 24 + hr) * NCAT + c];
  return n;
}

/** 24 × categories matrix of 30-day counts (rows are hours), for the hour × category heatmap. */
export function hourMatrix(h: History, q: Omit<HistoryQuery, "hours"> = {}): number[][] {
  const { areas, cats } = resolve(q);
  const rows = ALL_HOURS.map(() => new Array<number>(cats.length).fill(0));
  for (const a of areas) for (let hr = 0; hr < 24; hr++) for (let j = 0; j < cats.length; j++) rows[hr][j] += h.counts[(a * 24 + hr) * NCAT + cats[j]];
  return rows;
}
