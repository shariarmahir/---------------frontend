/**
 * The National TV Wall's collector logic, kept pure so it can be tested
 * without a network: read an RSS feed, decide what each headline is about,
 * place it on the map, fold together the same story told by several outlets,
 * and turn the result into the wall's risk figures.
 *
 * Everything here works on headlines, not on police records. The analysis
 * says so wherever it is shown: a district "lights up" because outlets are
 * reporting from it, which tracks crime but is not the same thing.
 */
import type { DivisionId } from "../../data/bangladesh-map.ts";
import { districtShapes } from "../../data/tv-wall/districts-map.ts";
import { BN_DISTRICT_SPELLINGS, PLACES } from "../../data/tv-wall/places.ts";
import { DIVISIONS, type Feed, type WireCategory } from "../../data/tv-wall/sources.ts";

export type { WireCategory };

/** What kind of crime a crime headline reports, for the analysis bars. */
export type CrimeKind = "murder" | "rape" | "abduction" | "robbery" | "assault" | "drugs" | "fraud" | "arrest" | "other";

export interface WireItem {
  id: string;
  title: string;
  url: string;
  /** The outlet that reported it. */
  source: string;
  /** Other outlets that carried the same story. */
  alsoIn: string[];
  publishedAt: number;
  lang: "bn" | "en";
  category: WireCategory;
  /** 1 (minor) to 3 (a life lost or a violent crime). */
  severity: 1 | 2 | 3;
  crimeKind?: CrimeKind;
  district: string | null;
  division: DivisionId | null;
}

export interface RawItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

/* ── RSS ─────────────────────────────────────────────────────────────── */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : "";
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function textOf(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return "";
  let v = m[1].trim();
  const cdata = v.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdata) v = cdata[1];
  // Decode first, then strip any markup the decoding revealed, then decode once more for text.
  return decodeEntities(decodeEntities(v).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** The items of an RSS 2.0 feed. Tolerant: a malformed item is skipped, never thrown. */
export function parseRss(xml: string, fallbackSource = ""): RawItem[] {
  const out: RawItem[] = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const block = m[0];
    const title = textOf(block, "title");
    const link = textOf(block, "link");
    if (!title || !link) continue;
    out.push({ title, link, pubDate: textOf(block, "pubDate"), source: textOf(block, "source") || fallbackSource });
  }
  return out;
}

/** Google News appends " - Outlet" to each title; take it off when it names the source. */
export function cleanTitle(title: string, source: string): string {
  const t = title.trim();
  if (source) {
    const tail = ` - ${source}`;
    if (t.endsWith(tail)) return t.slice(0, -tail.length).trim();
  }
  const dash = t.lastIndexOf(" - ");
  return dash > 20 && t.length - dash < 48 ? t.slice(0, dash).trim() : t;
}

export function isSafeUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/* ── Classification ──────────────────────────────────────────────────── */

const norm = (s: string) => s.normalize("NFC");
const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * One pattern for a keyword list. Bangla words match inside compounds
 * ("গণধর্ষণ") and with case endings; English ones must start a word, and
 * short English ones must be the whole word ("fire", not "ceasefire").
 * A word given as `/…/` is a raw pattern, for the few that need a guard.
 */
const words = (list: string[]) =>
  new RegExp(
    list
      .map((w) => {
        if (w.startsWith("/") && w.endsWith("/")) return w.slice(1, -1);
        const n = escape(norm(w));
        if (/[ঀ-৿]/.test(w)) return n;
        return `\\b${n}${w.length <= 5 ? "\\b" : ""}`;
      })
      .join("|"),
    "i",
  );

const CRIME_3 = words(["হত্যা", "খুন", "ধর্ষণ", "অপহরণ", "গণপিটুনি", "কুপিয়ে", "গলা কেটে", "murder", "killed", "rape", "abduct", "kidnap", "lynch", "hacked to death"]);
const CRIME_2 = words(["ডাকাতি", "ছিনতাই", "চাঁদাবাজি", "চাঁদা দাবি", "সন্ত্রাসী", "/গুলি(?!স্তান)/", "ছুরিকাঘাত", "মারধর", "হামলা", "অস্ত্রসহ", "মাদক", "ইয়াবা", "হেরোইন", "নির্যাতন", "যৌন হয়রানি", "পাচার", "মরদেহ উদ্ধার", "robbery", "mugging", "extortion", "stabbed", "shot", "attack", "assault", "drugs", "yaba", "torture", "harass", "trafficking"]);
const CRIME_1 = words(["গ্রেপ্তার", "গ্রেফতার", "/আটক(?!া|ে(?!র))/", "মামলা", "চুরি", "প্রতারণা", "জালিয়াতি", "arrested", "detained", "case filed", "theft", "fraud", "scam"]);
const CORRUPTION = words(["দুর্নীতি", "ঘুষ", "আত্মসাৎ", "দুদক", "লোপাট", "অর্থপাচার", "অর্থ পাচার", "corruption", "bribe", "embezzl", "graft", "money laundering", "Anti-Corruption"]);
const LOSS = words(["দুর্ঘটনা", "অগ্নিকাণ্ড", "আগুনে", "আগুন লেগে", "বন্যা", "ভূমিধস", "পাহাড়ধস", "বজ্রপাত", "পানিতে ডুবে", "লঞ্চডুবি", "নৌকাডুবি", "ট্রলারডুবি", "ঘূর্ণিঝড়", "ডেঙ্গু", "ভবন ধস", "জলাবদ্ধতা", "নদীভাঙন", "accident", "crash", "fire", "flood", "landslide", "lightning", "drown", "capsiz", "cyclone", "dengue", "collapse", "waterlogging"]);
const DEATH = words(["নিহত", "মৃত্যু", "প্রাণ গেল", "প্রাণহানি", "died", "dead", "death", "killed"]);
const ACHIEVEMENT = words(["অর্জন", "স্বর্ণপদক", "পদক", "চ্যাম্পিয়ন", "পুরস্কার", "স্বীকৃতি", "রেকর্ড", "শিরোপা", "জিতল", "জিতেছে", "সাফল্য", "award", "medal", "champion", "wins", "won", "record", "recognition", "honour", "achievement"]);
const DEVELOPMENT = words(["প্রকল্প", "উদ্বোধন", "সেতু", "মেট্রোরেল", "এক্সপ্রেসওয়ে", "রেলপথ", "রেললাইন", "বিদ্যুৎকেন্দ্র", "একনেক", "টানেল", "উড়ালসড়ক", "project", "inaugurat", "bridge", "metro rail", "expressway", "railway", "power plant", "ECNEC", "tunnel", "flyover"]);
const ECONOMY = words(["রেমিট্যান্স", "প্রবাসী আয়", "রপ্তানি", "আমদানি", "রিজার্ভ", "মূল্যস্ফীতি", "ডলার", "বাজেট", "শেয়ারবাজার", "পুঁজিবাজার", "ব্যাংক", "বিনিয়োগ", "বাজারদর", "/(?<![ঀ-৿])দাম(?![িা])/", "অর্থনীতি", "অর্থনৈতিক", "জিডিপি", "প্রবৃদ্ধি", "আইএমএফ", "remittance", "economy", "economic", "export", "import", "reserve", "inflation", "dollar", "budget", "stock market", "DSE", "bank", "investment", "price", "GDP", "growth", "IMF", "taka"]);

const KINDS: [CrimeKind, RegExp][] = [
  ["rape", words(["ধর্ষণ", "যৌন", "rape", "harass", "molest"])],
  ["murder", words(["হত্যা", "খুন", "গণপিটুনি", "কুপিয়ে", "গলা কেটে", "murder", "killed", "lynch"])],
  ["abduction", words(["অপহরণ", "পাচার", "abduct", "kidnap", "trafficking"])],
  ["robbery", words(["ডাকাতি", "ছিনতাই", "চুরি", "চাঁদা", "robbery", "mugging", "theft", "extortion"])],
  ["drugs", words(["মাদক", "ইয়াবা", "হেরোইন", "ফেনসিডিল", "drugs", "yaba"])],
  ["assault", words(["হামলা", "মারধর", "/গুলি(?!স্তান)/", "ছুরিকাঘাত", "নির্যাতন", "সংঘর্ষ", "attack", "assault", "stabbed", "shot", "torture"])],
  ["fraud", words(["প্রতারণা", "জালিয়াতি", "fraud", "scam"])],
  ["arrest", words(["গ্রেপ্তার", "গ্রেফতার", "/আটক(?!া|ে(?!র))/", "arrested", "detained"])],
];

export function crimeKindOf(text: string): CrimeKind {
  const t = norm(text);
  return KINDS.find(([, re]) => re.test(t))?.[0] ?? "other";
}

/**
 * What a headline is about, and how serious. Order matters: corruption
 * before crime ("দুর্নীতির মামলায় গ্রেপ্তার" is a corruption story), and an
 * accident with an arrest after it stays a loss unless violence is named.
 */
export function classify(text: string): { category: WireCategory; severity: 1 | 2 | 3 } | null {
  const t = norm(text);
  if (CORRUPTION.test(t)) return { category: "corruption", severity: 2 };
  const c3 = CRIME_3.test(t);
  const c2 = CRIME_2.test(t);
  const loss = LOSS.test(t);
  if (c3) return { category: "crime", severity: 3 };
  if (c2 && !loss) return { category: "crime", severity: 2 };
  if (loss) return { category: "loss", severity: DEATH.test(t) ? 3 : 2 };
  if (CRIME_1.test(t)) return { category: "crime", severity: 1 };
  if (ACHIEVEMENT.test(t)) return { category: "achievement", severity: 1 };
  if (DEVELOPMENT.test(t)) return { category: "development", severity: 1 };
  if (ECONOMY.test(t)) return { category: "economy", severity: 1 };
  // The query that found a headline never decides its category: search
  // engines match the article body, so only the headline's own words count.
  return null;
}

/** Stories from abroad, which the wall leaves out unless they also name a Bangladeshi district. */
const FOREIGN = words([
  "ভারত", "পাকিস্তান", "নিউইয়র্ক", "যুক্তরাষ্ট্র", "যুক্তরাজ্য", "কানাডা", "চীন", "রাশিয়া", "ইউক্রেন", "ইসরায়েল", "গাজা",
  "ইরান", "সৌদি", "দুবাই", "লন্ডন", "কলকাতা", "দিল্লি", "মুম্বাই", "বলিউড", "পশ্চিমবঙ্গ", "আসামে", "আফগান", "নেপাল",
  "শ্রীলঙ্কা", "পঞ্জাব", "পাঞ্জাব", "হ্যানয়", "ভিয়েতনাম", "থাইল্যান্ড", "ইন্দোনেশিয়া", "তুরস্ক", "মিসর", "মণিপুর", "উত্তর প্রদেশ", "জাপান", "ফ্রান্স", "জার্মানি", "ইতালি", "অস্ট্রেলিয়া", "মালয়েশিয়া", "মার্কিন", "ট্রাম্প",
  "India", "Pakistan", "New York", "Canada", "China", "Russia", "Ukraine", "Israel", "Gaza", "Iran", "Saudi", "Dubai",
  "London", "Kolkata", "Delhi", "Mumbai", "Bollywood", "Nepal", "Sri Lanka", "Trump", "Punjab", "Vietnam", "Thailand", "Indonesia", "Turkey",
]);

const ABROAD_EXTRA = words([
  "মহারাষ্ট্র", "উত্তরপ্রদেশ", "গুজরাট", "রাজস্থান", "কর্ণাটক", "তামিলনাড়ু", "কেরালা", "মেঘালয়", "ঝাড়খণ্ড", "ওডিশা", "হরিয়ানা",
  "বেঙ্গালুরু", "চেন্নাই", "কাশ্মীর", "মিয়ানমার", "বুলগেরিয়া", "রোমানিয়া", "পোল্যান্ড", "স্পেন", "পর্তুগাল", "গ্রিস", "ব্রাজিল",
  "মেক্সিকো", "আর্জেন্টিনা", "নাইজেরিয়া", "কেনিয়া", "কোরিয়া", "সিঙ্গাপুর", "কুয়েত", "ওমান", "লিবিয়া", "সুদান", "সিরিয়া",
  "ইরাক", "লেবানন", "ইয়েমেন", "ইউরোপ", "আমেরিকা", "ক্যালিফোর্নিয়া", "টেক্সাস", "প্যারিস", "মস্কো", "বেইজিং", "হলিউড",
  "Maharashtra", "Myanmar", "Bulgaria", "Brazil", "Mexico", "Korea", "Singapore", "Syria", "Iraq", "Lebanon", "Yemen", "Europe",
  "America", "California", "Texas", "Paris", "Moscow", "Beijing", "Hollywood",
]);

/** Words that tie a story abroad back to Bangladeshis: those stay on the wall. */
const OURS = words(["বাংলাদেশ", "প্রবাসী", "দেশি শ্রমিক", "Bangladesh"]);

/** A story set abroad with no Bangladeshi in it. */
export const isForeign = (text: string) => {
  const t = norm(text);
  return (FOREIGN.test(t) || ABROAD_EXTRA.test(t)) && !OURS.test(t);
};

/** Outlets sometimes name themselves by their address; show the site instead. */
export function sourceName(source: string): string {
  const s = source.trim();
  if (!/^https?:\/\//i.test(s)) return s;
  try {
    return new URL(s).hostname.replace(/^www\./, "");
  } catch {
    return s;
  }
}

/* ── Places ──────────────────────────────────────────────────────────── */

interface Needle {
  text: string;
  district: string;
  bangla: boolean;
}

const NEEDLES: Needle[] = (() => {
  const list: Needle[] = [];
  const add = (text: string, district: string) => list.push({ text: norm(text), district, bangla: /[ঀ-৿]/.test(text) });
  for (const d of districtShapes) {
    add(d.bn, d.id);
    add(d.en, d.id);
    d.alias.forEach((a) => add(a, d.id));
  }
  for (const [id, names] of Object.entries(BN_DISTRICT_SPELLINGS)) names.forEach((n) => add(n, id));
  for (const [id, names] of Object.entries(PLACES)) names.forEach((n) => add(n, id));
  return list;
})();

const DIVISION_OF = new Map(districtShapes.map((d) => [d.id, d.division]));
const BN_LETTER = /[ঀ-৿]/;
const LATIN_LETTER = /[A-Za-z]/;

/**
 * The district a headline names. A Bangla place may carry a case ending
 * ("সাতক্ষীরায়", "ঢাকার") but must start a word; an English one must be a
 * whole word. When several match, the first named wins, and at the same
 * spot the longer name wins ("ভোলাহাট" over "ভোলা").
 */
export function locate(text: string): { district: string | null; division: DivisionId | null } {
  const t = norm(text);
  const lower = t.toLowerCase();
  let best: { at: number; len: number; district: string } | null = null;
  for (const n of NEEDLES) {
    const hay = n.bangla ? t : lower;
    const needle = n.bangla ? n.text : n.text.toLowerCase();
    let from = 0;
    while (from <= hay.length) {
      const at = hay.indexOf(needle, from);
      if (at < 0) break;
      const before = at > 0 ? hay[at - 1] : "";
      const after = hay[at + needle.length] ?? "";
      const ok = n.bangla ? !BN_LETTER.test(before) : !LATIN_LETTER.test(before) && !LATIN_LETTER.test(after);
      if (ok) {
        if (!best || at < best.at || (at === best.at && needle.length > best.len)) best = { at, len: needle.length, district: n.district };
        break;
      }
      from = at + 1;
    }
  }
  if (!best) return { district: null, division: null };
  return { district: best.district, division: DIVISION_OF.get(best.district) ?? null };
}

/* ── Building the wire ───────────────────────────────────────────────── */

/** FNV-1a, for stable ids. */
export function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** Bangla case endings, longest first, so "শ্রফকে" and "শ্রফের" count as one word. */
const BN_ENDINGS = ["দের", "কে", "ের", "রা", "তে", "টি", "র", "য়", "ে"].map(norm);

function stem(w: string): string {
  if (!/[ঀ-৿]/.test(w) || w.length <= 3) return w;
  const end = BN_ENDINGS.find((e) => w.endsWith(e) && w.length - e.length >= 2);
  return end ? w.slice(0, -end.length) : w;
}

const tokens = (s: string) =>
  new Set(
    norm(s)
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .map(stem),
  );

function overlapOf(a: string, b: string): { jaccard: number; overlap: number; smaller: number } {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return { jaccard: 0, overlap: 0, smaller: 0 };
  let both = 0;
  A.forEach((w) => B.has(w) && both++);
  const smaller = Math.min(A.size, B.size);
  return { jaccard: both / (A.size + B.size - both), overlap: both / smaller, smaller };
}

/** Shared words ÷ all words of the two headlines (Jaccard). */
export function similarity(a: string, b: string): number {
  return overlapOf(a, b).jaccard;
}

const family = (c: WireCategory) => (c === "crime" || c === "corruption" ? "harm" : c);

/**
 * Whether two reports tell the same story: the same kind of news, places
 * that do not disagree, within a day of each other, and either most words in
 * common or the shorter headline mostly contained in the longer one.
 */
export function sameStory(a: WireItem, b: WireItem, threshold = 0.55): boolean {
  if (family(a.category) !== family(b.category)) return false;
  if (a.district && b.district && a.district !== b.district) return false;
  if (Math.abs(a.publishedAt - b.publishedAt) > 24 * 3_600_000) return false;
  const o = overlapOf(a.title, b.title);
  return o.jaccard >= threshold || (o.smaller >= 4 && o.overlap >= 0.6);
}

export const WINDOW_HOURS = 48;

/** One feed's items, classified and placed; items older than the window are dropped. */
export function toWire(raw: RawItem[], feed: Pick<Feed, "lang">, now: number): WireItem[] {
  const out: WireItem[] = [];
  for (const r of raw) {
    if (!isSafeUrl(r.link)) continue;
    const title = cleanTitle(r.title, r.source);
    if (title.length < 8) continue;
    const parsed = Date.parse(r.pubDate);
    const publishedAt = Number.isFinite(parsed) ? Math.min(parsed, now) : now;
    if (now - publishedAt > WINDOW_HOURS * 3_600_000) continue;
    const kind = classify(title);
    if (!kind) continue;
    const place = locate(title);
    // A story abroad shows in its words or in its outlet ("Vietnam.vn"), unless it is about Bangladeshis.
    if (!place.district && isForeign(`${title} ${r.source}`)) continue;
    out.push({
      id: hash(norm(title)),
      title,
      url: r.link,
      source: sourceName(r.source || ""),
      alsoIn: [],
      publishedAt,
      lang: feed.lang,
      category: kind.category,
      severity: kind.severity,
      crimeKind: kind.category === "crime" ? crimeKindOf(title) : undefined,
      district: place.district,
      division: place.division,
    });
  }
  return out;
}

/**
 * The same story from several outlets becomes one item that lists them all:
 * the wall shows corroboration instead of repeating the headline.
 */
export function mergeWire(items: WireItem[], threshold = 0.55): WireItem[] {
  const sorted = [...items].sort((a, b) => b.publishedAt - a.publishedAt);
  const kept: WireItem[] = [];
  const byId = new Map<string, WireItem>();
  for (const item of sorted) {
    const same =
      byId.get(item.id) ??
      kept.find((k) => sameStory(k, item, threshold));
    if (same) {
      if (item.source && item.source !== same.source && !same.alsoIn.includes(item.source)) same.alsoIn.push(item.source);
      if (!same.district && item.district) {
        same.district = item.district;
        same.division = item.division;
      }
      same.severity = Math.max(same.severity, item.severity) as 1 | 2 | 3;
      continue;
    }
    const copy = { ...item, alsoIn: [...item.alsoIn] };
    kept.push(copy);
    byId.set(copy.id, copy);
  }
  return kept;
}

/* ── Analysis ────────────────────────────────────────────────────────── */

export const inWindow = (items: WireItem[], now: number, hours: number) => items.filter((i) => now - i.publishedAt <= hours * 3_600_000);

export type RiskLevel = 0 | 1 | 2 | 3;

/**
 * Severity-weighted crime score → map level: 0 quiet, 1 reported, 2 watch,
 * 3 red zone. Pass the window so a score is read as a daily rate: six points
 * in six hours is a red zone, six points in two days is not.
 */
export function riskLevel(score: number, windowHours = 24): RiskLevel {
  score = (score * 24) / windowHours;
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  if (score > 0) return 1;
  return 0;
}

const isHarm = (i: WireItem) => i.category === "crime" || i.category === "corruption";

export function districtScores(items: WireItem[]): Map<string, { score: number; count: number }> {
  const out = new Map<string, { score: number; count: number }>();
  for (const i of items) {
    if (!isHarm(i) || !i.district) continue;
    const cur = out.get(i.district) ?? { score: 0, count: 0 };
    cur.score += i.severity;
    cur.count += 1;
    out.set(i.district, cur);
  }
  return out;
}

/** P(at least one more report) over the next 24 hours, from the window's rate (Poisson). */
export function chanceNext24h(count: number, windowHours: number): number {
  if (count <= 0 || windowHours <= 0) return 0;
  const lambda = (count * 24) / windowHours;
  return 1 - Math.exp(-lambda);
}

export interface DivisionStat {
  id: DivisionId;
  bn: string;
  en: string;
  reports: number;
  score: number;
  /** Crime reports per million people. */
  perMillion: number;
  /** Share of reports ÷ share of population: 1 = in line with its size. */
  index: number;
  /** Reports of violent crime (severity 3) in the window. */
  severe: number;
  /** Chance of another violent-crime report in the next 24 hours. */
  chance: number;
}

export function divisionStats(items: WireItem[], windowHours: number): DivisionStat[] {
  const harm = items.filter((i) => isHarm(i) && i.division);
  const total = harm.length;
  const people = DIVISIONS.reduce((s, d) => s + d.population, 0);
  return DIVISIONS.map((d) => {
    const mine = harm.filter((i) => i.division === d.id);
    const reports = mine.length;
    const score = mine.reduce((s, i) => s + i.severity, 0);
    const index = total ? reports / total / (d.population / people) : 0;
    const severe = mine.filter((i) => i.category === "crime" && i.severity === 3).length;
    return {
      id: d.id,
      bn: d.bn,
      en: d.en,
      reports,
      score,
      perMillion: reports / (d.population / 1_000_000),
      index,
      severe,
      chance: chanceNext24h(severe, windowHours),
    };
  }).sort((a, b) => b.score - a.score || b.reports - a.reports);
}

export function crimeKinds(items: WireItem[]): { kind: CrimeKind; count: number }[] {
  const counts = new Map<CrimeKind, number>();
  items.forEach((i) => i.category === "crime" && counts.set(i.crimeKind ?? "other", (counts.get(i.crimeKind ?? "other") ?? 0) + 1));
  return [...counts].map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count);
}

/** Reports per hour for the last `hours` hours, oldest first, split into harm and gains. */
export function hourly(items: WireItem[], now: number, hours = 24): { harm: number; gain: number }[] {
  const bins = Array.from({ length: hours }, () => ({ harm: 0, gain: 0 }));
  for (const i of items) {
    const ago = Math.floor((now - i.publishedAt) / 3_600_000);
    if (ago < 0 || ago >= hours) continue;
    const bin = bins[hours - 1 - ago];
    if (isHarm(i) || i.category === "loss") bin.harm++;
    else if (i.category === "achievement" || i.category === "development") bin.gain++;
  }
  return bins;
}

export interface Balance {
  harm: number;
  loss: number;
  gain: number;
  economy: number;
}

export function balance(items: WireItem[]): Balance {
  return {
    harm: items.filter(isHarm).length,
    loss: items.filter((i) => i.category === "loss").length,
    gain: items.filter((i) => i.category === "achievement" || i.category === "development").length,
    economy: items.filter((i) => i.category === "economy").length,
  };
}

/* ── Live channels ───────────────────────────────────────────────────── */

const VIDEO_ID = /^[\w-]{11}$/;

/**
 * The live stream's video id from a channel's /live page, or null when the
 * channel is not live. YouTube serves that page in more than one shape, so
 * the id is read from whichever of three places carries it.
 */
export function liveVideoIdFrom(html: string): string | null {
  if (!html.includes('"isLive":true')) return null;
  const id =
    html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1] ??
    html.match(/"currentVideoEndpoint":\{"clickTrackingParams":"[^"]*","commandMetadata":\{"webCommandMetadata":\{"url":"\/watch\?v=([\w-]{11})/)?.[1] ??
    html.match(/"videoDetails":\s*\{\s*"videoId":\s*"([\w-]{11})"/)?.[1] ??
    null;
  return id && VIDEO_ID.test(id) ? id : null;
}

/* ── Vitals ──────────────────────────────────────────────────────────── */

/** US EPA AQI band for a reading, in English and Bangla. */
export function aqiBand(aqi: number): { en: string; bn: string; level: 0 | 1 | 2 | 3 } {
  if (aqi <= 50) return { en: "Good", bn: "ভালো", level: 0 };
  if (aqi <= 100) return { en: "Moderate", bn: "মাঝারি", level: 1 };
  if (aqi <= 150) return { en: "Unhealthy for sensitive groups", bn: "সংবেদনশীলদের জন্য অস্বাস্থ্যকর", level: 2 };
  if (aqi <= 200) return { en: "Unhealthy", bn: "অস্বাস্থ্যকর", level: 3 };
  if (aqi <= 300) return { en: "Very unhealthy", bn: "খুবই অস্বাস্থ্যকর", level: 3 };
  return { en: "Hazardous", bn: "দুর্যোগপূর্ণ", level: 3 };
}

/** WMO weather code → a Material Symbol and the word for it. */
export function weatherOf(code: number): { icon: string; en: string; bn: string } {
  if (code === 0) return { icon: "clear_day", en: "Clear", bn: "পরিষ্কার" };
  if (code <= 3) return { icon: "partly_cloudy_day", en: "Partly cloudy", bn: "আংশিক মেঘলা" };
  if (code <= 48) return { icon: "foggy", en: "Fog", bn: "কুয়াশা" };
  if (code <= 57) return { icon: "rainy_light", en: "Drizzle", bn: "গুঁড়ি বৃষ্টি" };
  if (code <= 67) return { icon: "rainy", en: "Rain", bn: "বৃষ্টি" };
  if (code <= 77) return { icon: "weather_snowy", en: "Snow", bn: "তুষার" };
  if (code <= 82) return { icon: "rainy_heavy", en: "Heavy showers", bn: "ভারী বর্ষণ" };
  return { icon: "thunderstorm", en: "Thunderstorm", bn: "বজ্রঝড়" };
}

/** "5 min ago". */
export function ago(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86_400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** Great-circle distance in km. */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/** "৫ মিনিট আগে". */
export function agoBn(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  const bn = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  if (s < 60) return "এইমাত্র";
  if (s < 3600) return `${bn(Math.floor(s / 60))} মিনিট আগে`;
  if (s < 86_400) return `${bn(Math.floor(s / 3600))} ঘণ্টা আগে`;
  return `${bn(Math.floor(s / 86_400))} দিন আগে`;
}
