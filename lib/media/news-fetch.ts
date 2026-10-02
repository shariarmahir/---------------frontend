/** Server only: reads the publishers' feeds (imported by the নাগরিক জীবন page). */
import { NEWS_SOURCES, sampleNews } from "@/data/media/news-sources";
import { mergeNews, parseFeed, type NewsItem } from "./news";

/** How often the feeds are read again, in seconds. */
export const NEWS_REFRESH = 900;

export interface NewsDesk {
  items: NewsItem[];
  /** Sources that could not be read this time. */
  failed: string[];
  /** True when nothing could be read and the sample is shown. */
  sample: boolean;
  at: string;
}

const MAX_BYTES = 3_000_000;

async function read(feed: string): Promise<string> {
  const res = await fetch(feed, {
    headers: { "User-Agent": "KandariLab-NagorikJibon/1.0", Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: NEWS_REFRESH },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error("feed too large");
  return text;
}

/** Every source at once; one slow or broken feed never holds up the rest. */
export async function loadNews(now = new Date()): Promise<NewsDesk> {
  const results = await Promise.allSettled(NEWS_SOURCES.map(async (s) => parseFeed(await read(s.feed), s)));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.warn(`[news] ${NEWS_SOURCES[i].id} could not be read:`, r.reason instanceof Error ? r.reason.message : r.reason);
  });
  const failed = NEWS_SOURCES.filter((_, i) => results[i].status === "rejected" || (results[i] as PromiseFulfilledResult<NewsItem[]>).value.length === 0).map((s) => s.id);
  const lists = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  const items = mergeNews(lists, now);  if (items.length === 0) return { items: sampleNews(now), failed, sample: true, at: now.toISOString() };
  return { items, failed, sample: false, at: now.toISOString() };
}
