/**
 * The Geography & Travel page's crowd alert: an ESTIMATE from the calendar,
 * not a live count. No ticket seller publishes sales data, so it reads what
 * reliably fills places in Bangladesh: the season, the weekend (Friday and
 * Saturday), the public holidays and the hour, all in Dhaka time. When real
 * ticket data exists, replace crowdAt's score and keep its shape.
 * Kept pure so the page and the tests share it.
 */

export type CrowdLevel = "closed" | "quiet" | "steady" | "busy" | "packed";

export interface CrowdPlace {
  /** How well known it is: 1 hidden, 2 known, 3 famous. */
  fame: 1 | 2 | 3;
  /** Months (1 to 12) when people want to go. */
  best: number[];
  /** Months when it is closed to visitors. */
  closed?: number[];
}

export interface Crowd {
  level: CrowdLevel;
  score: number;
  reasons: string[];
}

interface Surge {
  name: string;
  from: string;
  to: string;
}

/**
 * The days that fill the roads. The Eid and Puja dates follow the moon, so
 * they are expected dates and may move a day; add each new year here.
 */
export const SURGES: Surge[] = [
  { name: "Victory Day", from: "2026-12-14", to: "2026-12-17" },
  { name: "Winter school holidays", from: "2026-12-18", to: "2027-01-05" },
  { name: "Language Day", from: "2027-02-19", to: "2027-02-21" },
  { name: "Eid-ul-Fitr", from: "2027-03-06", to: "2027-03-15" },
  { name: "Independence Day", from: "2027-03-25", to: "2027-03-27" },
  { name: "Pohela Boishakh", from: "2027-04-13", to: "2027-04-15" },
  { name: "Eid-ul-Adha", from: "2027-05-13", to: "2027-05-22" },
  { name: "Durga Puja", from: "2027-10-05", to: "2027-10-11" },
  { name: "Victory Day", from: "2027-12-14", to: "2027-12-17" },
  { name: "Winter school holidays", from: "2027-12-18", to: "2028-01-05" },
];

/** Year, month, day, weekday and hour as a clock in Dhaka reads them. */
export function dhakaClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, month: Number(get("month")), weekday: get("weekday"), hour: Number(get("hour")) };
}

const surgeOn = (date: string) => SURGES.find((s) => date >= s.from && date <= s.to);

/** The next holiday rush from a date, or the one under way. */
export function nextSurge(now: Date): Surge | undefined {
  const { date } = dhakaClock(now);
  return SURGES.find((s) => s.to >= date);
}

export function daysUntil(now: Date, iso: string): number {
  const from = Date.parse(`${dhakaClock(now).date}T00:00:00Z`);
  return Math.max(0, Math.round((Date.parse(`${iso}T00:00:00Z`) - from) / 86_400_000));
}

export function crowdAt(place: CrowdPlace, now: Date): Crowd {
  const { date, month, weekday, hour } = dhakaClock(now);
  if (place.closed?.includes(month)) return { level: "closed", score: 0, reasons: ["Closed to visitors this month"] };

  const reasons: string[] = [];
  let score = [0, 12, 28, 48][place.fame];
  if (place.best.includes(month)) {
    score += 22;
    reasons.push("In season");
  } else {
    reasons.push("Out of season");
  }
  if (weekday === "Fri" || weekday === "Sat") {
    score += 14;
    reasons.push("Weekend");
  }
  const surge = surgeOn(date);
  if (surge) {
    score += 30;
    reasons.push(surge.name);
  }
  if (hour >= 10 && hour < 17) score += 6;
  if (hour >= 21 || hour < 6) score -= 12;

  score = Math.max(4, Math.min(100, score));
  const level: CrowdLevel = score >= 80 ? "packed" : score >= 55 ? "busy" : score >= 30 ? "steady" : "quiet";
  return { level, score, reasons };
}

/** Distance in km between two points on the Earth. */
function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function nearestPlaces<T extends { lat: number; lon: number }>(from: { lat: number; lon: number }, places: T[], count: number) {
  return places
    .map((place) => ({ place, km: haversineKm(from, place) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** The visitor's marks as a GPX file, which offline map apps such as Organic Maps and OsmAnd can open. */
export function placesToGpx(places: { name: string; lat: number; lon: number; note: string }[]) {
  const points = places.map((p) => `  <wpt lat="${p.lat}" lon="${p.lon}"><name>${xml(p.name)}</name><desc>${xml(p.note)}</desc></wpt>`);
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<gpx version="1.1" creator="MOTHERLAND" xmlns="http://www.topografix.com/GPX/1/1">', ...points, "</gpx>", ""].join("\n");
}

/** Which of the six seasons it is in Dhaka today; each season gives the month and day it begins. */
export function seasonAt<T extends { from: [number, number] }>(now: Date, seasons: T[]): T {
  const [, month, day] = dhakaClock(now).date.split("-").map(Number);
  const key = (m: number, d: number) => m * 100 + d;
  const sorted = [...seasons].sort((a, b) => key(...a.from) - key(...b.from));
  return [...sorted].reverse().find((s) => key(...s.from) <= key(month, day)) ?? sorted[sorted.length - 1];
}

/** The week's number, counted from Sundays in Dhaka, so the film of the week changes on the same day for everyone. */
export function weekNumber(now: Date) {
  const days = Date.parse(`${dhakaClock(now).date}T00:00:00Z`) / 86_400_000;
  return Math.floor((days + 4) / 7);
}

export interface TicketOutlook {
  mode: string;
  level: Exclude<CrowdLevel, "closed">;
  note: string;
}

/** How hard tickets are likely to be this week, by way of travelling. */
export function ticketOutlook(now: Date): TicketOutlook[] {
  const { date, month, weekday } = dhakaClock(now);
  const weekendEve = weekday === "Wed" || weekday === "Thu";
  const next = nextSurge(now);
  const rush = !!surgeOn(date) || (!!next && daysUntil(now, next.from) <= 10);
  const winter = month === 11 || month === 12 || month === 1 || month === 2;
  const monsoon = month >= 6 && month <= 9;
  const fog = month === 12 || month === 1;
  const stormy = month >= 3 && month <= 5;
  const pick = (r: boolean, w: boolean): TicketOutlook["level"] => (r ? "packed" : w ? "busy" : "steady");

  return [
    { mode: "Train", level: pick(rush, weekendEve || winter), note: rush ? "Advance sale seats go fast. Buy online as soon as sale opens." : fog ? "Dense fog can delay trains, especially in the north." : "Inter-city seats open online several days ahead." },
    { mode: "Bus", level: pick(rush, weekendEve), note: rush ? "Book a seat before you travel to the terminal, and expect slow roads." : "Thursday and Friday departures fill first." },
    { mode: "Launch and ferry", level: rush ? "packed" : monsoon || stormy ? "steady" : "quiet", note: fog ? "Fog often halts ferries for hours in the morning." : stormy || monsoon ? "Storm signals can cancel small launches. Check before you leave." : "Cabins sell out first. Never board an overcrowded launch." },
    { mode: "Flight", level: pick(rush, winter), note: winter ? "Cox's Bazar and Sylhet flights fill in the winter season." : "Domestic fares are lowest out of season." },
  ];
}
