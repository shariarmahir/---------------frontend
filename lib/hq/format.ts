/** Dates, times and durations for Kandari HQ (English, Dhaka time). Pure; tested in rules.test.ts. */
import { dhakaDay } from "./rules.ts";
import type { Day, Iso } from "./types.ts";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DHAKA_MS = 6 * 60 * 60_000;
function dhakaParts(at: Iso | number) {
  const d = new Date((typeof at === "number" ? at : Date.parse(at)) + DHAKA_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes(), wd: d.getUTCDay() };
}

/** "21 Oct", with the year when it isn't this one, the weekday on request ("Wed, 21 Oct"). */
export function dateLabel(at: Iso | number | Day, opts: { year?: boolean; weekday?: boolean; long?: boolean; now?: number } = {}): string {
  const p = dhakaParts(typeof at === "string" && at.length === 10 ? Date.parse(`${at}T06:00:00.000Z`) : at);
  const thisYear = dhakaParts(opts.now ?? Date.now()).y;
  const year = opts.year ?? p.y !== thisYear;
  const wd = opts.weekday ? `${(opts.long ? WEEKDAYS : WEEKDAYS_SHORT)[p.wd]}, ` : "";
  return `${wd}${p.d} ${(opts.long ? MONTHS : MONTHS_SHORT)[p.m]}${year ? ` ${p.y}` : ""}`;
}

/** "10:30 AM". */
export function clockLabel(at: Iso | number): string {
  const { h, min } = dhakaParts(at);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function dateTimeLabel(at: Iso | number, now?: number): string {
  return `${dateLabel(at, { now })}, ${clockLabel(at)}`;
}

/** "just now", "5 min ago", "2 h ago", "yesterday", "3 days ago", else the date. Future: "in 5 min". */
export function ago(at: Iso | number, now: number): string {
  const t = typeof at === "number" ? at : Date.parse(at);
  const diff = now - t;
  const future = diff < 0;
  const s = Math.abs(diff) / 1000;
  const wrap = (x: string) => (future ? `in ${x}` : `${x} ago`);
  if (s < 45) return future ? "now" : "just now";
  if (s < 3600) return wrap(`${Math.round(s / 60)} min`);
  if (s < 86400) return wrap(`${Math.round(s / 3600)} h`);
  const days = Math.round(s / 86400);
  if (days === 1) return future ? "tomorrow" : "yesterday";
  if (days < 7) return wrap(`${days} days`);
  return dateLabel(t, { now });
}

/** A countdown: "2 days 3 h", "4 h 12 min", "12 min 5 s". */
export function duration(ms: number): string {
  const s = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d} day${d === 1 ? "" : "s"}${h ? ` ${h} h` : ""}`;
  if (h > 0) return `${h} h${m ? ` ${m} min` : ""}`;
  if (m > 0) return `${m} min${sec ? ` ${sec} s` : ""}`;
  return `${sec} s`;
}

/** Days of a month as Dhaka days, for calendars. */
export function monthDays(year: number, month0: number): Day[] {
  const n = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => `${year}-${String(month0 + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
}

export function today(now: number): Day {
  return dhakaDay(now);
}

export function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}
