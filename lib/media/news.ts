/**
 * নাগরিক জীবন: the day's news in four editions — morning, afternoon,
 * evening, night — read from publishers' RSS feeds. Only the headline, a
 * short summary and the link are kept; the full story stays on the
 * publisher's site. Pure rules here (no fetching), tested in news.test.ts.
 */

export type NewsCategory = "national" | "politics" | "crime" | "economy" | "world" | "sports" | "entertainment" | "tech" | "life" | "media" | "opinion";

export const CATEGORIES: Record<NewsCategory, { bn: string }> = {
  national: { bn: "জাতীয়" },
  politics: { bn: "রাজনীতি" },
  crime: { bn: "আইন ও অপরাধ" },
  economy: { bn: "অর্থনীতি" },
  world: { bn: "আন্তর্জাতিক" },
  sports: { bn: "খেলা" },
  entertainment: { bn: "বিনোদন" },
  tech: { bn: "প্রযুক্তি ও বিজ্ঞান" },
  life: { bn: "জীবন ও স্বাস্থ্য" },
  media: { bn: "গণমাধ্যম ও ভিডিও" },
  opinion: { bn: "মতামত" },
};

export const CATEGORY_ORDER = Object.keys(CATEGORIES) as NewsCategory[];

/**
 * Words in a feed's own section names and in story URLs, matched in this
 * order (the first hit wins, so "sports" beats "bangladesh" in
 * /bangladesh/sports/…). Bangla and English, as the feeds write them.
 */
const RULES: [NewsCategory, RegExp][] = [
  ["entertainment", /entertainment|showtime|showbiz|dhallywood|bollywood|hollywood|বিনোদন|সিনেমা|নাটক|গান|তারকা|ঢালিউড|বলিউড|ওটিটি/i],
  ["sports", /sports?|cricket|football|hockey|tennis|খেলা|ক্রিকেট|ফুটবল|হকি/i],
  ["media", /video|photo|journalism|media|ভিডিও|ছবি|গণমাধ্যম|সাংবাদিক/i],
  ["opinion", /opinion|op-ed|editorial|column|মতামত|সম্পাদকীয়|কলাম/i],
  ["tech", /tech|science|technology|প্রযুক্তি|বিজ্ঞান/i],
  ["economy", /business|economy|bazaar|stock|bank|বাণিজ্য|অর্থনীতি|অর্থ|শেয়ার|ব্যাংক|বাজার/i],
  ["crime", /crime|court|law|police|আইন|অপরাধ|আদালত|গ্রেফতার|পুলিশ/i],
  ["politics", /politic|parliament|election|রাজনীতি|সংসদ|নির্বাচন|দল$/i],
  ["world", /world|international|asia|middle-east|america|europe|india|বিশ্ব|আন্তর্জাতিক|এশিয়া|মধ্যপ্রাচ্য|আমেরিকা|যুক্তরাষ্ট্র|ভারত|ইউরোপ/i],
  ["life", /lifestyle|health|recipe|education|campus|জীবনযাপন|স্বাস্থ্য|রেসিপি|শিক্ষা|ক্যাম্পাস/i],
  ["national", /bangladesh|nation|national|district|capital|dhaka|দেশ|জাতীয়|রাজধানী|সারাদেশ|বিভাগ|জেলা/i],
];

/** The first rule any hint matches; hints are section names first, then URL path parts. */
export function categorize(hints: string[], fallback: NewsCategory = "national"): NewsCategory {
  for (const [cat, re] of RULES) if (hints.some((h) => re.test(h))) return cat;
  return fallback;
}

export interface NewsSource {
  id: string;
  bn: string;
  lang: "bn" | "en";
  feed: string;
  home: string;
  /** For a section feed: every story is this category. */
  category?: NewsCategory;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: NewsCategory;
  /** ISO time. */
  at: string;
  image?: string;
  lang: "bn" | "en";
}

/* ---------- Editions ---------- */

export type Edition = "morning" | "noon" | "evening" | "night";

export const EDITIONS: Record<Edition, { bn: string; span: string; from: number }> = {
  morning: { bn: "সকালের খবর", span: "ভোর ৫টা – দুপুর ১২টা", from: 5 },
  noon: { bn: "দুপুরের খবর", span: "দুপুর ১২টা – বিকেল ৪টা", from: 12 },
  evening: { bn: "সন্ধ্যার খবর", span: "বিকেল ৪টা – রাত ৮টা", from: 16 },
  night: { bn: "রাতের খবর", span: "রাত ৮টা – ভোর ৫টা", from: 20 },
};

export const EDITION_ORDER: Edition[] = ["morning", "noon", "evening", "night"];

const BD_OFFSET = 6 * 3_600_000;

/** The hour in Bangladesh (UTC+6, no daylight saving). */
export const bdHour = (d: Date) => new Date(d.getTime() + BD_OFFSET).getUTCHours();

export function editionAt(d: Date): Edition {
  const h = bdHour(d);
  return h >= 20 || h < 5 ? "night" : h >= 16 ? "evening" : h >= 12 ? "noon" : "morning";
}

/** The news day a moment belongs to: after midnight and before 5am is still last night's edition. */
export function newsDay(d: Date): string {
  const bd = new Date(d.getTime() + BD_OFFSET);
  if (bd.getUTCHours() < 5) bd.setUTCDate(bd.getUTCDate() - 1);
  return bd.toISOString().slice(0, 10);
}

/* ---------- Parsing ---------- */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Plain text: CDATA opened, tags dropped (twice, for entity-encoded HTML), entities decoded, space collapsed. */
export function plainText(raw: string): string {
  let s = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  s = s.replace(/<[^>]*>/g, " ");
  s = decodeEntities(s);
  s = s.replace(/<[^>]*>/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

export const SUMMARY_MAX = 220;

/** Cut at a word near `max`, ending with an ellipsis; drops "Details"/"বিস্তারিত" tails the feeds add. */
export function clip(text: string, max = SUMMARY_MAX): string {
  const t = text.replace(/\s*(Details|বিস্তারিত|আরও পড়ুন|Read more)\s*$/i, "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:–—-]+$/, "")}…`;
}

/** Only absolute http(s) addresses, as given. */
export function webUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(decodeEntities(raw.trim()));
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** RFC 822 dates as feeds write them, with 2- or 4-digit years; ISO also works. */
export function parseFeedDate(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const m = raw.trim().match(/(\d{1,2})\s+([a-z]{3})[a-z]*\s+(\d{2}|\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(GMT|UTC?|Z|[+-]\d{4})?/i);
  if (m) {
    const month = MONTHS.indexOf(m[2].toLowerCase());
    if (month === -1) return undefined;
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    const zone = m[7] && /^[+-]/.test(m[7]) ? (m[7][0] === "-" ? -1 : 1) * (Number(m[7].slice(1, 3)) * 60 + Number(m[7].slice(3, 5))) : 0;
    const t = Date.UTC(year, month, Number(m[1]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0)) - zone * 60_000;
    return Number.isFinite(t) ? new Date(t).toISOString() : undefined;
  }
  const t = Date.parse(raw);
  return Number.isFinite(t) ? new Date(t).toISOString() : undefined;
}

/** FNV-1a, so a story keeps the same id across refreshes. */
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function tag(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m?.[1];
}

function attr(block: string, name: string, key: string): string | undefined {
  const m = block.match(new RegExp(`<${name}\\s[^>]*?${key}=["']([^"']+)["']`, "i"));
  return m?.[1];
}

/** Read an RSS 2.0 feed into stories; anything without a title, a web link or a date is skipped. */
export function parseFeed(xml: string, source: NewsSource): NewsItem[] {
  const out: NewsItem[] = [];
  for (const [, block] of xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)) {
    const title = plainText(tag(block, "title") ?? "");
    const url = webUrl(plainText(tag(block, "link") ?? ""));
    const at = parseFeedDate(plainText(tag(block, "pubDate") ?? tag(block, "dc:date") ?? ""));
    if (!title || !url || !at) continue;
    const rawDesc = tag(block, "description") ?? "";
    const summary = clip(plainText(rawDesc));
    const decodedDesc = decodeEntities(rawDesc.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
    const image = webUrl(attr(block, "media:thumbnail", "url") ?? attr(block, "media:content", "url") ?? attr(block, "enclosure", "url") ?? decodedDesc.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]);
    const sections = [...block.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map((c) => plainText(c[1]));
    let path: string[] = [];
    try {
      path = new URL(url).pathname.split("/").filter(Boolean).slice(0, 2).map(decodeURIComponent);
    } catch {
      path = [];
    }
    out.push({
      id: `${source.id}-${hash(url)}`,
      title: clip(title, 160),
      summary: summary === title ? "" : summary,
      url,
      source: source.id,
      category: source.category ?? categorize([...sections, ...path]),
      at,
      ...(image?.startsWith("https:") ? { image } : {}),
      lang: source.lang,
    });
  }
  return out;
}

/* ---------- Merging and grouping ---------- */

const key = (title: string) => title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/**
 * All sources in one list, newest first: duplicates (same link, or the
 * same headline) kept once, future-dated and older-than-`maxHours`
 * stories dropped.
 */
export function mergeNews(lists: NewsItem[][], now: Date, maxHours = 36): NewsItem[] {
  const seen = new Set<string>();
  const oldest = now.getTime() - maxHours * 3_600_000;
  const latest = now.getTime() + 10 * 60_000;
  return lists
    .flat()
    .filter((n) => {
      const t = Date.parse(n.at);
      return t >= oldest && t <= latest;
    })
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((n) => {
      const k1 = n.url;
      const k2 = key(n.title);
      if (seen.has(k1) || seen.has(k2)) return false;
      seen.add(k1);
      seen.add(k2);
      return true;
    });
}

/** The stories of one edition of one news day. */
export function inEdition(items: NewsItem[], day: string, edition: Edition): NewsItem[] {
  return items.filter((n) => {
    const d = new Date(n.at);
    return newsDay(d) === day && editionAt(d) === edition;
  });
}

/**
 * The edition's headlines: newest first, but no source and no category
 * twice until every one has had a turn — so one busy newsroom can't fill
 * the front page.
 */
export function headlines(items: NewsItem[], n = 5): NewsItem[] {
  const picked: NewsItem[] = [];
  const sources = new Set<string>();
  const cats = new Set<NewsCategory>();
  for (const pass of [0, 1, 2]) {
    for (const it of items) {
      if (picked.length >= n) return picked;
      if (picked.includes(it)) continue;
      if (pass === 0 && (sources.has(it.source) || cats.has(it.category))) continue;
      if (pass === 1 && sources.has(it.source) && cats.has(it.category)) continue;
      picked.push(it);
      sources.add(it.source);
      cats.add(it.category);
    }
  }
  return picked;
}

/** Stories by category, in the page's order, empty ones left out. */
export function byCategory(items: NewsItem[]): [NewsCategory, NewsItem[]][] {
  return CATEGORY_ORDER.map((c) => [c, items.filter((n) => n.category === c)] as [NewsCategory, NewsItem[]]).filter(([, l]) => l.length > 0);
}
