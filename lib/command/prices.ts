/**
 * Price watch: today's simulated market price for each essential, checked
 * against the government-fixed price (a ceiling) or the sample reference range.
 *
 * Observations are deterministic per (seed, day, division): the same demo shows
 * the same prices all day, and they change at Bangladesh midnight. They stand in
 * for market reports; the official daily list is TCB's (data/command/prices.ts).
 */
import { mulberry32 } from "./rng.ts";
import type { DivisionId, PriceItem } from "./types.ts";
import { PRICE_ITEMS } from "../../data/command/prices.ts";

export { PRICE_ITEMS, TCB_SOURCE } from "../../data/command/prices.ts";

export type PriceStatus = "ok" | "over-ceiling" | "above-range" | "below-range";

export interface PriceObservation {
  item: PriceItem;
  /** Today's average market price, whole taka. */
  todayTk: number;
  yesterdayTk: number;
  /** Today against yesterday, percent to one decimal. */
  changePct: number;
  /** The last 7 days, oldest first, ending today (for a sparkline). */
  series: number[];
  /** Fixed items: the government price, and how far today's price is over it (0 when at or under). */
  ceilingTk?: number;
  overCeilingPct?: number;
  /** Reference items: today's price outside the sample range. */
  outOfRange?: "above" | "below";
  status: PriceStatus;
}

const DIVISION_INDEX: Record<DivisionId, number> = {
  dhaka: 0, chattogram: 1, khulna: 2, rajshahi: 3, sylhet: 4, barishal: 5, rangpur: 6, mymensingh: 7,
};

/** One well-mixed 32-bit number from a few integers (the seed for a mulberry32 draw). */
function mix(...xs: number[]): number {
  let h = 0x811c9dc5;
  for (const x of xs) {
    h = Math.imul(h ^ (x | 0), 0x01000193);
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12;
  }
  return h >>> 0;
}

/** The draws for one item on one day: a wobble in [-1, 1], a spike chance and a spike size in [0, 1). */
function dayDraws(seed: number, item: number, day: number): [number, number, number] {
  const r = mulberry32(mix(seed, item, day));
  return [r.next() * 2 - 1, r.next(), r.next()];
}

const round1 = (x: number): number => Math.round(x * 10) / 10;

/** Per-division price level: Dhaka is the base (TCB's market), others within ±3%. */
function divisionLevel(seed: number, item: number, division?: DivisionId): number {
  if (!division || division === "dhaka") return 1;
  const r = mulberry32(mix(seed, item, 0x5d1f, DIVISION_INDEX[division]));
  return 1 + (r.next() * 2 - 1) * 0.03;
}

/**
 * The market price of item `i` on `day`. Fixed items trade just under their
 * price, except on spike days (about 3 in 10) when sellers charge 3–9% over it;
 * reference items wander about ±7% around the middle of their range and on
 * about 1 day in 8 jump 10–18% (gouging), which can push them out of range.
 */
function priceOn(seed: number, i: number, day: number, level: number): number {
  const item = PRICE_ITEMS[i];
  const [w0, spikeAt, spikeSize] = dayDraws(seed, i, day);
  const w1 = dayDraws(seed, i, day - 1)[0];
  const w2 = dayDraws(seed, i, day - 2)[0];
  const wobble = (w0 + w1 + w2) / 3;
  let p: number;
  if (item.fixed) {
    const base = item.fixed.priceTk * 0.985;
    p = base * (1 + 0.012 * wobble);
    if (spikeAt < 0.3) p = item.fixed.priceTk * (1.03 + 0.06 * spikeSize);
  } else {
    const mid = (item.reference.lowTk + item.reference.highTk) / 2;
    p = mid * (1 + 0.07 * wobble);
    if (spikeAt < 0.125) p *= 1.1 + 0.08 * spikeSize;
  }
  return Math.max(1, Math.round(p * level));
}

const cache = new Map<string, PriceObservation[]>();
const CACHE_MAX = 24;

/**
 * Every item's observation for one Bangladesh calendar day (selectors' bdDay),
 * optionally in one division (default: Dhaka, TCB's market). Memoised: the same
 * arguments return the same array.
 */
export function observedPrices(seed: number, day: number, division?: DivisionId): PriceObservation[] {
  const key = `${seed}|${day}|${division ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const out = PRICE_ITEMS.map((item, i): PriceObservation => {
    const level = divisionLevel(seed, i, division);
    const series: number[] = [];
    for (let d = day - 6; d <= day; d++) series.push(priceOn(seed, i, d, level));
    const todayTk = series[6];
    const yesterdayTk = series[5];
    const obs: PriceObservation = {
      item,
      todayTk,
      yesterdayTk,
      changePct: round1(((todayTk - yesterdayTk) / yesterdayTk) * 100),
      series,
      status: "ok",
    };
    if (item.fixed) {
      obs.ceilingTk = item.fixed.priceTk;
      obs.overCeilingPct = Math.max(0, round1(((todayTk - item.fixed.priceTk) / item.fixed.priceTk) * 100));
      if (todayTk > item.fixed.priceTk) obs.status = "over-ceiling";
    } else if (todayTk > item.reference.highTk) {
      obs.outOfRange = "above";
      obs.status = "above-range";
    } else if (todayTk < item.reference.lowTk) {
      obs.outOfRange = "below";
      obs.status = "below-range";
    }
    return obs;
  });
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, out);
  return out;
}

/** Items sold over their fixed price or above their range today: what overpricing complaints are about. */
export function overpricedToday(seed: number, day: number, division?: DivisionId): PriceItem[] {
  return observedPrices(seed, day, division)
    .filter((o) => o.status === "over-ceiling" || o.status === "above-range")
    .map((o) => o.item);
}

export const priceItem = (id: string): PriceItem | undefined => PRICE_ITEMS.find((p) => p.id === id);
