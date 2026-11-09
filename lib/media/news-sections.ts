/**
 * নাগরিক জীবন as a newspaper: its sections and their sub-sections, laid
 * out after The Daily Star's menu (Mahir, 2026-10-21) and named in Bangla.
 * The stories come from publishers' feeds (news.ts), so a sub-section is a
 * rule, not a desk: a story belongs to it when its category is one of the
 * sub-section's `cats`, or when its headline, summary or tags (the feed's
 * own section names and URL path) match `words`. A quiet sub-section is
 * simply empty for a while; the pages say so instead of inventing stories.
 * Pure (no fetching), tested in news-sections.test.ts.
 */
import type { NewsCategory, NewsItem } from "./news";

export interface NewsSub {
  slug: string;
  bn: string;
  cats?: NewsCategory[];
  words?: RegExp;
  /** Its categories stay here: the section's keyword sub-sections don't take them (বিশ্ব: a foreign "সরকার" is not ours). */
  exclusive?: boolean;
}

export interface NewsSection {
  slug: string;
  bn: string;
  /** Categories that belong to the section even when no sub-section claims them. */
  cats?: NewsCategory[];
  /** A section-wide test of its own (ধীরে পড়ুন: the longer reads). */
  test?: (n: NewsItem) => boolean;
  subs: NewsSub[];
}

/** A long summary marks a longer read. */
export const SLOW_READ_CHARS = 170;

export const NEWS_SECTIONS: NewsSection[] = [
  {
    slug: "news",
    bn: "খবর",
    cats: ["national"],
    subs: [
      { slug: "politics", bn: "রাজনীতি", cats: ["politics"] },
      { slug: "governance", bn: "শাসন ও প্রশাসন", words: /সরকার|মন্ত্রণাল|উপদেষ্টা|প্রশাসন|সচিব|govern|ministry|adviser|secretariat|administration/i },
      { slug: "crime-justice", bn: "আইন ও বিচার", cats: ["crime"] },
      { slug: "accidents-fires", bn: "দুর্ঘটনা ও অগ্নিকাণ্ড", words: /দুর্ঘটনা|অগ্নিকাণ্ড|আগুন|সংঘর্ষে|লঞ্চডুবি|accident|fire|blaze|crash|collision|capsize/i },
      { slug: "technology", bn: "প্রযুক্তি", cats: ["tech"] },
      { slug: "education", bn: "শিক্ষা", words: /শিক্ষা|বিশ্ববিদ্যাল|পরীক্ষা|স্কুল|শিক্ষার্থী|education|universit|exam|school|student/i },
      { slug: "healthcare", bn: "স্বাস্থ্যসেবা", words: /স্বাস্থ্য|হাসপাতাল|ডেঙ্গু|চিকিৎস|রোগী|health|hospital|dengue|patient|medical/i },
      { slug: "environment", bn: "পরিবেশ", words: /পরিবেশ|জলবায়ু|বন্যা|নদী|বৃষ্টি|ঘূর্ণিঝড়|দূষণ|বায়ুমান|climate|flood|environment|cyclone|pollution|river|weather/i },
      { slug: "world", bn: "বিশ্ব", cats: ["world"], exclusive: true },
    ],
  },
  {
    slug: "opinion",
    bn: "মতামত",
    cats: ["opinion"],
    subs: [
      { slug: "editorial", bn: "সম্পাদকীয়", words: /সম্পাদকীয়|editorial/i },
      { slug: "views", bn: "দৃষ্টিভঙ্গি", cats: ["opinion"] },
      { slug: "interviews", bn: "সাক্ষাৎকার", words: /সাক্ষাৎকার|interview/i },
      { slug: "tribute", bn: "শ্রদ্ধাঞ্জলি", words: /শ্রদ্ধা|স্মরণ|প্রয়াণ|মৃত্যুবার্ষিকী|tribute|obituar|remember/i },
    ],
  },
  {
    slug: "business",
    bn: "বাণিজ্য",
    cats: ["economy"],
    subs: [
      { slug: "economy", bn: "অর্থনীতি", cats: ["economy"] },
      { slug: "agriculture", bn: "কৃষি", words: /কৃষি|ফসল|ধান|চালের|সবজি|কৃষক|agricultur|farm|crop|harvest/i },
      { slug: "industry", bn: "শিল্প", words: /শিল্প|কারখানা|পোশাক|গার্মেন্ট|industr|factor(y|ies)|garment|\brmg\b/i },
      { slug: "startups", bn: "স্টার্টআপ", words: /স্টার্টআপ|উদ্যোক্তা|startup|entrepreneur/i },
      { slug: "global-economy", bn: "বিশ্ব অর্থনীতি", words: /বিশ্ববাজার|ডলার|আইএমএফ|বিশ্বব্যাংক|তেলের দাম|\bimf\b|world bank|global econom|oil price|dollar/i },
    ],
  },
  {
    slug: "sports",
    bn: "খেলা",
    cats: ["sports"],
    subs: [
      { slug: "cricket", bn: "ক্রিকেট", words: /ক্রিকেট|টেস্ট|ওয়ানডে|টি-?টোয়েন্টি|বিপিএল|cricket|\btest\b|odi|t20|\bbpl\b|wicket/i },
      { slug: "football", bn: "ফুটবল", words: /ফুটবল|গোল|বিশ্বকাপ বাছাই|লিগ|football|soccer|\bfifa\b|league|messi|ronaldo/i },
      { slug: "tennis", bn: "টেনিস", words: /টেনিস|tennis|wimbledon|grand slam/i },
      { slug: "other-sports", bn: "অন্যান্য খেলা", cats: ["sports"] },
    ],
  },
  {
    slug: "lifestyle",
    bn: "জীবনধারা",
    cats: ["life"],
    subs: [
      { slug: "fashion", bn: "ফ্যাশন", words: /ফ্যাশন|পোশাকে|সাজ|fashion|style/i },
      { slug: "relationships", bn: "সম্পর্ক", words: /সম্পর্ক|দাম্পত্য|বিয়ে|প্রেম|relationship|marriage|parenting/i },
      { slug: "health-wellness", bn: "স্বাস্থ্য ও সুস্থতা", words: /সুস্থ|ব্যায়াম|ঘুম|মানসিক|পুষ্টি|wellness|fitness|mental health|nutrition|sleep/i },
      { slug: "food-recipe", bn: "খাবার ও রেসিপি", words: /রেসিপি|রান্না|খাবার|recipe|food|cook/i },
      { slug: "travel-leisure", bn: "ভ্রমণ ও অবসর", words: /ভ্রমণ|পর্যটন|বেড়ানো|travel|tourism|tourist|leisure/i },
    ],
  },
  {
    slug: "culture",
    bn: "সংস্কৃতি",
    cats: ["entertainment"],
    subs: [
      { slug: "entertainment", bn: "বিনোদন", cats: ["entertainment"] },
      { slug: "books-literature", bn: "বই ও সাহিত্য", words: /বই|সাহিত্য|কবিতা|উপন্যাস|লেখক|বইমেলা|book|literat|poet|novel|author/i },
      { slug: "heritage", bn: "ঐতিহ্য", words: /ঐতিহ্য|প্রত্নতত্ত্ব|জাদুঘর|heritage|archaeolog|museum/i },
      { slug: "tv-film", bn: "টিভি ও চলচ্চিত্র", words: /সিনেমা|চলচ্চিত্র|নাটক|ওটিটি|ছবির|টিভি|film|movie|cinema|\bott\b|series|tv/i },
      { slug: "music", bn: "গান", words: /গান|সংগীত|শিল্পী|কনসার্ট|music|song|concert|singer|album/i },
      { slug: "theatre-arts", bn: "মঞ্চ ও শিল্পকলা", words: /মঞ্চ|থিয়েটার|চিত্রকলা|প্রদর্শনী|theatre|theater|stage|exhibition|art/i },
    ],
  },
  {
    slug: "slow-reads",
    bn: "ধীরে পড়ুন",
    test: (n) => n.summary.length >= SLOW_READ_CHARS,
    subs: [
      { slug: "in-focus", bn: "ফোকাসে", words: /বিশ্লেষণ|কেন|যেভাবে|analysis|explainer|why |how /i },
      { slug: "geopolitical-insights", bn: "ভূরাজনীতি", words: /ভূরাজনীতি|কূটনীতি|সীমান্ত|চীন|যুক্তরাষ্ট্র|ভারত|geopolit|diplomac|border|china|india|us |russia/i },
      { slug: "big-picture", bn: "বড় পরিসরে", words: /দশক|বছরে|প্রবণতা|decade|trend|years of/i },
      { slug: "wisdom", bn: "প্রজ্ঞা", words: /দর্শন|জীবনের|শিক্ষা নিন|philosoph|lesson|wisdom/i },
      { slug: "unheard-voices", bn: "না-শোনা কণ্ঠ", words: /প্রান্তিক|শ্রমিক|দিনমজুর|আদিবাসী|চরাঞ্চল|marginal|labourer|worker|indigenous|char /i },
    ],
  },
  {
    slug: "youth",
    bn: "তারুণ্য",
    subs: [
      { slug: "academics", bn: "পড়াশোনা", words: /পরীক্ষা|ফলাফল|ভর্তি|বৃত্তি|exam|result|admission|scholarship/i },
      { slug: "career-skills", bn: "ক্যারিয়ার ও দক্ষতা", words: /চাকরি|ক্যারিয়ার|দক্ষতা|নিয়োগ|প্রশিক্ষণ|job|career|skill|recruit|training/i },
      { slug: "campus-life", bn: "ক্যাম্পাস", words: /ক্যাম্পাস|বিশ্ববিদ্যাল|হল|campus|universit|hall/i },
      { slug: "off-campus", bn: "ক্যাম্পাসের বাইরে", words: /তরুণ|যুব|স্বেচ্ছাসেব|youth|young|volunteer/i },
      { slug: "pop-culture", bn: "পপ কালচার", words: /ভাইরাল|সামাজিক মাধ্যম|ট্রেন্ড|viral|social media|meme|trend/i },
    ],
  },
  {
    slug: "plus",
    bn: "প্লাস",
    subs: [
      { slug: "business-plus", bn: "বাণিজ্য প্লাস", words: /বাজেট|রাজস্ব|রপ্তানি|বিনিয়োগ|budget|revenue|export|invest/i },
      { slug: "investigative", bn: "অনুসন্ধানী", words: /অনুসন্ধান|অনিয়ম|দুর্নীতি|investigat|irregular|corruption|graft/i },
      { slug: "roundtables", bn: "গোলটেবিল", words: /গোলটেবিল|সংলাপ|সেমিনার|roundtable|dialogue|seminar/i },
      { slug: "supplements", bn: "ক্রোড়পত্র", words: /ক্রোড়পত্র|বিশেষ সংখ্যা|supplement|special issue/i },
      { slug: "law-rights", bn: "আইন ও অধিকার", words: /অধিকার|মানবাধিকার|সংবিধান|আইনের|rights|constitution|human right/i },
      { slug: "my-dhaka", bn: "আমার ঢাকা", words: /ঢাকা|রাজধানী|dhaka|capital/i },
    ],
  },
];

export function findSection(slug: string): NewsSection | undefined {
  return NEWS_SECTIONS.find((s) => s.slug === slug);
}

export function findSub(section: NewsSection, slug: string): NewsSub | undefined {
  return section.subs.find((s) => s.slug === slug);
}

const text = (n: NewsItem) => [n.title, n.summary, ...(n.tags ?? [])].join(" ");

const sectionOfSub = new Map(NEWS_SECTIONS.flatMap((s) => s.subs.map((sub) => [sub, s] as const)));
const topical = (s: NewsSection) => Boolean(s.cats || s.subs.some((sub) => sub.cats));
const homeOf = (cat: NewsCategory) => NEWS_SECTIONS.find((s) => s.cats?.includes(cat) || s.subs.some((sub) => sub.cats?.includes(cat)));

/**
 * Does one story belong to one sub-section? By category always; by keyword
 * only inside the story's own section (a sports story that says "স্কুল" is
 * not শিক্ষা), except in the cross-cutting sections (তারুণ্য, প্লাস, ধীরে পড়ুন).
 */
export function inSub(n: NewsItem, sub: NewsSub): boolean {
  if (sub.cats?.includes(n.category)) return true;
  if (!sub.words?.test(text(n))) return false;
  const section = sectionOfSub.get(sub);
  if (!section || !topical(section)) return true;
  const home = homeOf(n.category);
  if (home && home !== section) return false;
  return !section.subs.some((s) => s.exclusive && s.cats?.includes(n.category));
}

/** Does one story belong to a section (its own categories, its test, or any of its sub-sections)? */
export function inSection(n: NewsItem, section: NewsSection): boolean {
  if (section.cats?.includes(n.category)) return true;
  if (section.test?.(n)) return true;
  return section.subs.some((sub) => inSub(n, sub));
}

/** The section's stories, newest first (as given); with a sub-section, only that one's. */
export function storiesIn(items: NewsItem[], section: NewsSection, sub?: NewsSub): NewsItem[] {
  return items.filter((n) => (sub ? inSub(n, sub) : inSection(n, section)));
}

/**
 * Where a story is filed, for its kicker and breadcrumb: the first sub-section
 * that claims it by category, else the first that matches its words, else
 * the first section that takes its category. Every story lands somewhere.
 */
export function placeStory(n: NewsItem): { section: NewsSection; sub?: NewsSub } {
  for (const section of NEWS_SECTIONS) {
    const sub = section.subs.find((s) => s.cats?.includes(n.category));
    if (sub) return { section, sub };
  }
  for (const section of NEWS_SECTIONS) {
    if (section.slug === "slow-reads") continue;
    const sub = section.subs.find((s) => s.words && inSub(n, s));
    if (sub) return { section, sub };
  }
  const section = NEWS_SECTIONS.find((s) => s.cats?.includes(n.category)) ?? NEWS_SECTIONS[0];
  return { section };
}

/** A section's sub-sections with their stories, empty ones left out. */
export function subsWithStories(items: NewsItem[], section: NewsSection): [NewsSub, NewsItem[]][] {
  return section.subs.map((sub) => [sub, storiesIn(items, section, sub)] as [NewsSub, NewsItem[]]).filter(([, list]) => list.length > 0);
}

/** Headline search: every word of the query must appear in the headline, summary or tags (case-insensitive). */
export function searchNews(items: NewsItem[], query: string): NewsItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return items.filter((n) => {
    const t = text(n).toLowerCase();
    return words.every((w) => t.includes(w));
  });
}

/** Paths in the paper. */
export const newsHref = {
  home: "/media/news",
  section: (s: string) => `/media/news/${s}`,
  sub: (s: string, sub: string) => `/media/news/${s}/${sub}`,
  story: (id: string) => `/media/news/story/${id}`,
  today: "/media/news/today",
  epaper: "/media/news/epaper",
  search: (q?: string) => (q ? `/media/news/search?q=${encodeURIComponent(q)}` : "/media/news/search"),
};
