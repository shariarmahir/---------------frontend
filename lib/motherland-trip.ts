/**
 * The planner's working: reads a plain question, then builds a route, a cost
 * and warnings from the tables in data/motherland-trip.ts. Pure, with no clock
 * and no randomness, so the same question always gets the same answer.
 */
import { MONTHS, REGIONS, linkBetween, type Leg, type LegKind, type Region, type SeasonNote } from "../data/motherland-trip.ts";

export const TAKA_PER_USD = 122.5;

export type Style = "budget" | "comfort";

export interface TripRequest {
  regions: string[];
  /** 1 to 12. */
  month: number;
  days: number;
  prefer: LegKind;
  style: Style;
  budgetBdt?: number | null;
}

interface PlannedLeg {
  from: string;
  to: string;
  how: string;
  mode: string;
  fare: number;
  hours: number;
  checked: boolean;
}

interface PlannedStop {
  region: Region;
  days: number;
  doing: string[];
  note: SeasonNote | null;
}

export interface TripPlan {
  stops: PlannedStop[];
  legs: PlannedLeg[];
  stayBdt: number;
  travelBdt: number;
  totalBdt: number;
  totalUsd: number;
  warnings: { level: "closed" | "caution"; text: string }[];
  nearby: Region[];
  overBudgetBy: number;
  days: number;
}

const byId = (id: string) => REGIONS.find((r) => r.id === id);

export function pickLeg(region: Region, prefer: LegKind): Leg {
  const fit = region.legs.filter((l) => l.kinds.includes(prefer));
  return (fit.length ? fit : region.legs).reduce((best, l) => (l.fare < best.fare ? l : best));
}

const distance = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => Math.hypot(a.lat - b.lat, a.lon - b.lon);

/** Visit the nearest next place first, so the route does not zigzag across the country. */
export function orderStops(ids: string[]) {
  const left = [...new Set(ids)].map(byId).filter((r): r is Region => Boolean(r));
  const home = byId("dhaka")!;
  const order: Region[] = left.some((r) => r.id === "dhaka") ? [home] : [];
  let rest = left.filter((r) => r.id !== "dhaka");
  let here = home;
  while (rest.length) {
    const next = rest.reduce((a, b) => (distance(here, b) < distance(here, a) ? b : a));
    order.push(next);
    rest = rest.filter((r) => r.id !== next.id);
    here = next;
  }
  return order;
}

const noteFor = (region: Region, month: number) => region.notes.find((n) => n.months.includes(month)) ?? null;

export function planTrip(request: TripRequest): TripPlan {
  const { month, prefer, style, budgetBdt } = request;
  const days = Math.max(1, Math.round(request.days));
  const order = orderStops(request.regions);
  const empty: TripPlan = { stops: [], legs: [], stayBdt: 0, travelBdt: 0, totalBdt: 0, totalUsd: 0, warnings: [], nearby: [], overBudgetBy: 0, days };
  if (!order.length) return empty;

  // Days spread as evenly as possible; the earlier stops take any left over.
  const each = Math.floor(days / order.length);
  const extra = days % order.length;
  const stops: PlannedStop[] = order.map((region, i) => {
    const here = Math.max(1, each + (i < extra ? 1 : 0));
    return { region, days: here, doing: region.sights.slice(0, Math.max(2, here + 1)), note: noteFor(region, month) };
  });

  // Dhaka to the first stop, on from stop to stop, and home.
  const legs: PlannedLeg[] = [];
  let at = "dhaka";
  for (const { region } of stops) {
    if (region.id === at) continue;
    const link = at === "dhaka" ? undefined : linkBetween(at, region.id);
    if (link) {
      legs.push({ from: at, to: region.id, how: link.how, mode: "Road or boat", fare: link.fare, hours: link.hours, checked: false });
    } else {
      if (at !== "dhaka") {
        const back = pickLeg(byId(at)!, prefer);
        legs.push({ from: at, to: "dhaka", how: `Back to Dhaka: ${back.how}`, mode: back.mode, fare: back.fare, hours: back.hours, checked: Boolean(back.checked) });
      }
      const go = pickLeg(region, prefer);
      legs.push({ from: "dhaka", to: region.id, how: go.how, mode: go.mode, fare: go.fare, hours: go.hours, checked: Boolean(go.checked) });
    }
    at = region.id;
  }
  if (at !== "dhaka") {
    const home = pickLeg(byId(at)!, prefer);
    legs.push({ from: at, to: "dhaka", how: `Home to Dhaka: ${home.how}`, mode: home.mode, fare: home.fare, hours: home.hours, checked: Boolean(home.checked) });
  }

  const stayBdt = stops.reduce((sum, s) => sum + s.days * (style === "budget" ? s.region.dayBudget : s.region.dayComfort), 0);
  const travelBdt = legs.reduce((sum, l) => sum + l.fare, 0);
  const totalBdt = stayBdt + travelBdt;

  const warnings: TripPlan["warnings"] = [];
  for (const { region, note, days: here } of stops) {
    if (region.usualDays && here > region.usualDays) warnings.push({ level: "caution", text: `${region.name}: most visits last about ${region.usualDays} days. Add a place close by for the rest of your time.` });
    if (note?.level === "closed") warnings.push({ level: "closed", text: `${region.name} in ${MONTHS[month - 1]}: ${note.text}` });
    else if (note?.level === "caution") warnings.push({ level: "caution", text: `${region.name} in ${MONTHS[month - 1]}: ${note.text}` });
    if (region.forVisitors) warnings.push({ level: "caution", text: `${region.name}: ${region.forVisitors}` });
  }
  const hoursOnRoad = legs.reduce((sum, l) => sum + l.hours, 0);
  if (hoursOnRoad / 12 > days / 2) warnings.push({ level: "caution", text: `That is about ${hoursOnRoad} hours of travel in ${days} ${days === 1 ? "day" : "days"}. Add days or drop a stop.` });
  if (days < stops.length) warnings.push({ level: "caution", text: `${stops.length} places need at least ${stops.length} days.` });

  const chosen = new Set(order.map((r) => r.id));
  const nearby = [...new Set(order.flatMap((r) => r.nearby))].filter((id) => !chosen.has(id)).map(byId).filter((r): r is Region => Boolean(r)).slice(0, 4);

  return {
    stops,
    legs,
    stayBdt,
    travelBdt,
    totalBdt,
    totalUsd: Math.round(totalBdt / TAKA_PER_USD),
    warnings,
    nearby,
    overBudgetBy: budgetBdt && totalBdt > budgetBdt ? totalBdt - budgetBdt : 0,
    days,
  };
}

const WORD_NUMBERS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, fourteen: 14 };

export interface ParsedAsk {
  regions: string[];
  days: number | null;
  month: number | null;
  budgetBdt: number | null;
  prefer: LegKind | null;
  style: Style | null;
}

/** Read a question such as "5 days in Sylhet in July under 20000 taka, easiest road". */
export function parseAsk(text: string): ParsedAsk {
  const ask = ` ${text.toLowerCase().replace(/[’']/g, "'")} `;

  const regions = REGIONS.filter((r) => r.names.some((n) => new RegExp(`(^|[^a-z])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?([^a-z]|$)`).test(ask))).map((r) => r.id);

  let days: number | null = null;
  const dayMatch = /(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fourteen)[ -]*(day|days|night|nights)\b/.exec(ask);
  if (dayMatch) days = WORD_NUMBERS[dayMatch[1]] ?? Number(dayMatch[1]);
  const weekMatch = /(\d|one|two|three|a)[ -]*weeks?\b/.exec(ask);
  if (!days && weekMatch) days = 7 * (weekMatch[1] === "a" ? 1 : (WORD_NUMBERS[weekMatch[1]] ?? Number(weekMatch[1])));
  if (days) days = Math.min(30, Math.max(1, days));

  let month: number | null = MONTHS.findIndex((m) => new RegExp(`\\b(${m.toLowerCase()}|${m.slice(0, 3).toLowerCase()})\\b`).test(ask)) + 1 || null;
  if (!month) {
    if (/\b(monsoon|rainy|rain|borsha)\b/.test(ask)) month = 7;
    else if (/\b(winter|sheet|cold|cool)\b/.test(ask)) month = 1;
    else if (/\b(spring|bosonto|falgun)\b/.test(ask)) month = 3;
    else if (/\b(summer|grishmo|hot)\b/.test(ask)) month = 5;
    else if (/\b(autumn|sharat|hemanta)\b/.test(ask)) month = 10;
  }

  let budgetBdt: number | null = null;
  const usd = /(?:\$|usd\s*)([\d,]+)|([\d,]+)\s*(?:usd|dollars?)\b/.exec(ask);
  const bdt = /(?:৳|tk\.?\s*|bdt\s*)([\d,]+)|([\d,]+)\s*(?:k\s*)?(?:taka|tk|bdt)\b/.exec(ask);
  const toNumber = (s?: string) => (s ? Number(s.replace(/,/g, "")) : 0);
  if (usd) budgetBdt = Math.round(toNumber(usd[1] ?? usd[2]) * TAKA_PER_USD);
  else if (bdt) budgetBdt = toNumber(bdt[1] ?? bdt[2]) * (/\dk\s*(taka|tk|bdt)/.test(bdt[0]) ? 1000 : 1);

  let prefer: LegKind | null = null;
  if (/\b(cheap|cheapest|lowest|budget|low cost|save)\b/.test(ask)) prefer = "cheapest";
  else if (/\b(easy|easiest|fast|fastest|quick|quickest|comfortable|simple|family|elderly|children|kids)\b/.test(ask)) prefer = "easiest";
  else if (/\b(fun|entertaining|scenic|beautiful|adventure|exciting|most enjoyable)\b/.test(ask)) prefer = "fun";

  let style: Style | null = null;
  if (/\b(backpack|backpacker|cheap|budget|student)\b/.test(ask)) style = "budget";
  else if (/\b(luxury|comfort|comfortable|family|honeymoon|premium)\b/.test(ask)) style = "comfort";

  return { regions, days, month, budgetBdt, prefer, style };
}
