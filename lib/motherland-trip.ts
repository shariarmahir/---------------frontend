/**
 * The trip planner's compute: from the regions a visitor picks, a season and a
 * number of days, it works out an approximate cost, the cheapest way in, a
 * day-by-day route, warnings where a place is out of season, and nearby
 * regions to add. Pure and deterministic — no clock, no randomness — so it is
 * easy to test and gives the same answer every time. Costs are illustrative.
 */
import { REGIONS, type Region, type Season, type Transport } from "../data/motherland-trip.ts";

export interface RouteDay {
  day: number;
  region: string;
  regionName: string;
  focus: string;
}

export interface TripPlan {
  days: number;
  /** Lodging, food and local travel for the stay, in US dollars. */
  lodgingFoodUsd: number;
  /** Lodging/food plus the transport legs, in US dollars. */
  totalUsd: number;
  /** The cheapest way into each chosen region. */
  transport: Transport[];
  route: RouteDay[];
  seasonWarnings: string[];
  /** Region ids worth adding, not already chosen. */
  nearby: string[];
}

/** Which regions sit near which, for the "you might also like" suggestions. */
const NEIGHBOURS: Record<string, string[]> = {
  dhaka: ["sylhet", "rajshahi", "coxs-bazar"],
  "coxs-bazar": ["bandarban", "sundarbans"],
  sylhet: ["dhaka"],
  bandarban: ["coxs-bazar"],
  sundarbans: ["kuakata", "coxs-bazar"],
  kuakata: ["sundarbans"],
  rajshahi: ["dhaka"],
};

/** A taka fare turned into round US dollars, at an illustrative ৳115 to the dollar. */
const TAKA_TO_USD = 115;
const toUsd = (taka: number) => Math.round(taka / TAKA_TO_USD);

export function cheapestTransport(region: Region): Transport | null {
  const legs = region.transport.filter((t) => t.fare > 0);
  if (legs.length === 0) return null;
  return legs.reduce((best, t) => (t.fare < best.fare ? t : best));
}

const byId = (id: string): Region | undefined => REGIONS.find((r) => r.id === id);

export function planTrip(regionIds: string[], season: Season, days: number): TripPlan {
  const chosen = regionIds.map(byId).filter((r): r is Region => Boolean(r));
  const empty: TripPlan = { days, lodgingFoodUsd: 0, totalUsd: 0, transport: [], route: [], seasonWarnings: [], nearby: [] };
  if (chosen.length === 0 || days < 1) return { ...empty, days: Math.max(0, days) };

  // Spread the days across the regions as evenly as possible, in order.
  const route: RouteDay[] = [];
  for (let d = 0; d < days; d++) {
    const region = chosen[Math.floor((d * chosen.length) / days)];
    const dayInRegion = route.filter((r) => r.region === region.id).length;
    route.push({
      day: d + 1,
      region: region.id,
      regionName: region.name,
      focus: region.attractions[dayInRegion % region.attractions.length],
    });
  }

  // Lodging and food: each day costs that day's region's daily rate.
  const lodgingFoodUsd = route.reduce((sum, d) => sum + (byId(d.region)?.dailyUsd ?? 0), 0);

  // Transport: the cheapest leg into each chosen region.
  const transport = chosen.map(cheapestTransport).filter((t): t is Transport => Boolean(t));
  const transportUsd = transport.reduce((sum, t) => sum + toUsd(t.fare), 0);

  const seasonWarnings = chosen
    .filter((r) => !r.bestSeasons.includes(season))
    .map((r) => `${r.name} is best in another season; ${season} is not its finest.`);

  const chosenIds = new Set(chosen.map((r) => r.id));
  const nearby = [...new Set(chosen.flatMap((r) => NEIGHBOURS[r.id] ?? []))].filter((id) => !chosenIds.has(id));

  return {
    days,
    lodgingFoodUsd,
    totalUsd: lodgingFoodUsd + transportUsd,
    transport,
    route,
    seasonWarnings,
    nearby,
  };
}
