/**
 * The National TV Wall's collectors: they poll the public sources in
 * data/tv-wall/sources.ts, run the headlines through lib/tv-wall/core.ts and
 * hand the page one payload.
 *
 * Each source is cached in memory for its own interval and fetched at most
 * once at a time, so a thousand viewers cost the sources the same as one. A
 * source that fails keeps its last good value and is reported as down; the
 * wall never fills a gap with invented data.
 */
import { CHANNELS, DIVISIONS, FEEDS } from "@/data/tv-wall/sources";
import { distanceKm, liveVideoIdFrom, mergeWire, parseRss, toWire, type WireItem } from "./core";

export interface FeedStatus {
  id: string;
  label: string;
  ok: boolean;
  count: number;
}

export interface CityReading {
  id: string;
  bn: string;
  temp: number;
  humidity: number;
  wind: number;
  code: number;
  /** Rain expected today, in mm. */
  rainToday: number;
  maxToday: number;
  aqi: number | null;
  pm25: number | null;
}

export interface Quake {
  id: string;
  mag: number;
  place: string;
  time: number;
  /** Distance from Dhaka. */
  km: number;
  url: string;
}

export interface FxRate {
  code: string;
  bn: string;
  /** Taka for one unit. */
  bdt: number;
}

export interface LiveChannel {
  id: string;
  name: string;
  nameBn: string;
  videoId: string | null;
}

export interface WallPayload {
  generatedAt: number;
  /** When the news collectors last answered; 0 if they never have. Older than a few minutes means the wire is stale. */
  newsAt: number;
  items: WireItem[];
  feeds: FeedStatus[];
  cities: CityReading[] | null;
  quakes: Quake[] | null;
  fx: { updatedAt: number; rates: FxRate[] } | null;
  channels: LiveChannel[];
}

const UA = "Mozilla/5.0 (compatible; KandariLabTVWall/1.0; +https://kandari-lab.com/tv-wall)";
const MAX_BYTES = 3_000_000;

async function fetchText(url: string, ms = 9000): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "bn,en;q=0.8" },
    signal: AbortSignal.timeout(ms),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error(`too large: ${url}`);
  return text;
}

const fetchJson = async <T>(url: string, ms?: number): Promise<T> => JSON.parse(await fetchText(url, ms)) as T;

interface Slot<T> {
  at: number;
  value: T | null;
  pending: Promise<T | null> | null;
  /** After a failure, the next attempt waits until this time. */
  retryAt: number;
}

const slots = new Map<string, Slot<unknown>>();

/** The cached value, refreshed in the background once older than `ttl`; a failure keeps the last good value. */
async function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T | null> {
  const slot = (slots.get(key) as Slot<T> | undefined) ?? { at: 0, value: null, pending: null, retryAt: 0 };
  slots.set(key, slot as Slot<unknown>);
  const now = Date.now();
  if (slot.value !== null && now - slot.at < ttl) return slot.value;
  if (!slot.pending && now >= slot.retryAt) {
    slot.pending = load()
      .then((v) => {
        slot.value = v;
        slot.at = Date.now();
        return v;
      })
      .catch((e: unknown) => {
        // Logged so an empty panel can be traced; retried after a short pause, not on every request.
        console.warn(`[tv-wall] ${key} failed: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
        slot.retryAt = Date.now() + 30_000;
        return slot.value;
      })
      .finally(() => {
        slot.pending = null;
      });
  }
  // A stale value is served at once while the refresh runs; the first load is awaited.
  return slot.value !== null ? slot.value : (slot.pending ?? null);
}

/* ── News ────────────────────────────────────────────────────────────── */

/** The latest attempt's state per feed, kept even when the attempt fails as a whole. */
let lastFeeds: FeedStatus[] = FEEDS.map((f) => ({ id: f.id, label: f.label, ok: false, count: 0 }));

async function loadNews(): Promise<{ items: WireItem[]; at: number }> {
  const now = Date.now();
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const raw = parseRss(await fetchText(f.url), f.id === "prothomalo" ? "প্রথম আলো" : "");
      return toWire(raw, f, now);
    }),
  );
  const feeds: FeedStatus[] = FEEDS.map((f, i) => {
    const r = results[i];
    return { id: f.id, label: f.label, ok: r.status === "fulfilled", count: r.status === "fulfilled" ? r.value.length : 0 };
  });
  lastFeeds = feeds;
  if (!feeds.some((f) => f.ok)) throw new Error("no feed answered");
  const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  return { items: mergeWire(all).slice(0, 300), at: now };
}

/* ── Weather and air ─────────────────────────────────────────────────── */

interface MeteoCurrent {
  current: { temperature_2m: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number };
  daily: { precipitation_sum: number[]; temperature_2m_max: number[] };
}
interface AirCurrent {
  current: { us_aqi: number | null; pm2_5: number | null };
}

async function loadCities(): Promise<CityReading[]> {
  const lat = DIVISIONS.map((d) => d.lat).join(",");
  const lon = DIVISIONS.map((d) => d.lon).join(",");
  const [weather, air] = await Promise.all([
    // Eight cities in one call: slower than a single reading, so it gets a longer limit.
    fetchJson<MeteoCurrent[]>(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=precipitation_sum,temperature_2m_max&forecast_days=1&timezone=Asia%2FDhaka`,
      25_000,
    ),
    fetchJson<AirCurrent[]>(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`, 25_000).catch(() => null),
  ]);
  return DIVISIONS.map((d, i) => {
    const w = weather[i];
    const a = air?.[i]?.current;
    return {
      id: d.id,
      bn: d.bn,
      temp: Math.round(w.current.temperature_2m),
      humidity: Math.round(w.current.relative_humidity_2m),
      wind: Math.round(w.current.wind_speed_10m),
      code: w.current.weather_code,
      rainToday: Math.round((w.daily.precipitation_sum[0] ?? 0) * 10) / 10,
      maxToday: Math.round(w.daily.temperature_2m_max[0] ?? w.current.temperature_2m),
      aqi: a?.us_aqi != null ? Math.round(a.us_aqi) : null,
      pm25: a?.pm2_5 != null ? Math.round(a.pm2_5) : null,
    };
  });
}

/* ── Earthquakes ─────────────────────────────────────────────────────── */

interface UsgsFeed {
  features: { id: string; properties: { mag: number; place: string; time: number; url: string }; geometry: { coordinates: [number, number, number] } }[];
}

async function loadQuakes(): Promise<Quake[]> {
  const feed = await fetchJson<UsgsFeed>("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson");
  const dhaka = DIVISIONS[0];
  return feed.features
    .filter((f) => {
      const [lon, lat] = f.geometry.coordinates;
      return lat >= 18.5 && lat <= 29 && lon >= 86 && lon <= 95.5;
    })
    .map((f) => ({
      id: f.id,
      mag: Math.round(f.properties.mag * 10) / 10,
      place: f.properties.place,
      time: f.properties.time,
      km: Math.round(distanceKm(dhaka.lat, dhaka.lon, f.geometry.coordinates[1], f.geometry.coordinates[0])),
      url: f.properties.url,
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 8);
}

/* ── Exchange rates ──────────────────────────────────────────────────── */

const FX = [
  { code: "USD", bn: "মার্কিন ডলার" },
  { code: "EUR", bn: "ইউরো" },
  { code: "GBP", bn: "পাউন্ড" },
  { code: "SAR", bn: "সৌদি রিয়াল" },
  { code: "AED", bn: "দিরহাম" },
  { code: "MYR", bn: "রিঙ্গিত" },
  { code: "INR", bn: "রুপি" },
];

async function loadFx() {
  const r = await fetchJson<{ result: string; time_last_update_unix: number; rates: Record<string, number> }>("https://open.er-api.com/v6/latest/USD");
  if (r.result !== "success" || !r.rates.BDT) throw new Error("fx");
  return {
    updatedAt: r.time_last_update_unix * 1000,
    rates: FX.filter((c) => r.rates[c.code]).map((c) => ({ ...c, bdt: Math.round((r.rates.BDT / r.rates[c.code]) * 100) / 100 })),
  };
}

/* ── Live channels ───────────────────────────────────────────────────── */

/** The channel's current live stream, read from its /live page; null when it is not live. */
async function liveVideo(channel: string): Promise<string | null> {
  const html = await fetchText(`https://www.youtube.com/channel/${channel}/live`, 20_000);
  return liveVideoIdFrom(html);
}

async function loadChannels(): Promise<LiveChannel[]> {
  const results = await Promise.allSettled(CHANNELS.map((c) => liveVideo(c.youtube)));
  // If YouTube answered for none of them, say so (and retry soon) rather than cache "nobody is live".
  if (results.every((r) => r.status === "rejected")) throw new Error("no channel page answered");
  const ids = results.map((r) => (r.status === "fulfilled" ? r.value : null));
  return CHANNELS.map((c, i) => ({ id: c.id, name: c.name, nameBn: c.nameBn, videoId: ids[i] }));
}

/* ── The payload ─────────────────────────────────────────────────────── */

/** A source's value, or null if it is not ready within `ms`; the load carries on and the next request gets it. */
const atMost = <T>(p: Promise<T | null>, ms: number) => Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

export async function getWall(): Promise<WallPayload> {
  const [news, cities, quakes, fx, channels] = await Promise.all([
    atMost(cached("news", 120_000, loadNews), 12_000),
    atMost(cached("cities", 600_000, loadCities), 8_000),
    atMost(cached("quakes", 600_000, loadQuakes), 8_000),
    atMost(cached("fx", 3_600_000, loadFx), 8_000),
    atMost(cached("channels", 600_000, loadChannels), 8_000),
  ]);
  return {
    generatedAt: Date.now(),
    newsAt: news?.at ?? 0,
    items: news?.items ?? [],
    feeds: lastFeeds,
    cities,
    quakes,
    fx,
    channels: channels ?? CHANNELS.map((c) => ({ id: c.id, name: c.name, nameBn: c.nameBn, videoId: null })),
  };
}
