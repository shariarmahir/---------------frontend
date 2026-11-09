import type { NewsItem, NewsSource } from "@/lib/media/news";

/**
 * The publishers নাগরিক জীবন reads, through their public RSS feeds. Each
 * story shows only its headline, a short summary and a link to the full
 * story on the publisher's site. Checked live on 2026-10-02; the Daily
 * Star front page and TBS feeds were left out because they still serve
 * 2022 stories.
 */
export const NEWS_SOURCES: NewsSource[] = [
  { id: "prothomalo", bn: "প্রথম আলো", lang: "bn", feed: "https://www.prothomalo.com/feed/", home: "https://www.prothomalo.com" },
  { id: "bbcbangla", bn: "বিবিসি বাংলা", lang: "bn", feed: "https://feeds.bbci.co.uk/bengali/rss.xml", home: "https://www.bbc.com/bengali" },
  { id: "banglatribune", bn: "বাংলা ট্রিবিউন", lang: "bn", feed: "https://www.banglatribune.com/feed/", home: "https://www.banglatribune.com" },
  { id: "ittefaq", bn: "ইত্তেফাক", lang: "bn", feed: "https://www.ittefaq.com.bd/feed/", home: "https://www.ittefaq.com.bd" },
  { id: "dhakatribune", bn: "ঢাকা ট্রিবিউন", lang: "en", feed: "https://www.dhakatribune.com/feed/", home: "https://www.dhakatribune.com" },
  { id: "bt-entertainment", bn: "বাংলা ট্রিবিউন বিনোদন", lang: "bn", feed: "https://www.banglatribune.com/feed/entertainment", home: "https://www.banglatribune.com", category: "entertainment" },
  { id: "ds-entertainment", bn: "দ্য ডেইলি স্টার বিনোদন", lang: "en", feed: "https://www.thedailystar.net/entertainment/rss.xml", home: "https://www.thedailystar.net", category: "entertainment" },
];

export const sourceName = (id: string) => NEWS_SOURCES.find((s) => s.id === id)?.bn ?? id;

/**
 * Shown only when no feed can be reached (offline build, network down),
 * and labelled "নমুনা" on the page. Written for this demo; the links go to
 * the publishers' home pages, not to real stories.
 */
export function sampleNews(now: Date): NewsItem[] {
  const ago = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
  const s = (id: string, sourceId: string, h: number, category: NewsItem["category"], title: string, summary: string): NewsItem => {
    const src = NEWS_SOURCES.find((x) => x.id === sourceId)!;
    return { id: `sample-${id}`, title, summary, url: src.home, source: sourceId, category, at: ago(h), lang: src.lang };
  };
  return [
    s("1", "prothomalo", 0.5, "national", "উত্তরাঞ্চলে টানা বৃষ্টি, তিস্তার পানি বিপৎসীমার কাছে", "নমুনা খবর: রংপুর ও লালমনিরহাটের নিচু এলাকায় পানি ঢুকছে; উপজেলা প্রশাসন আশ্রয়কেন্দ্র প্রস্তুত রেখেছে।"),
    s("2", "bbcbangla", 1, "world", "জলবায়ু সম্মেলনের আগে ক্ষতিপূরণ তহবিল নিয়ে আলোচনা", "নমুনা খবর: ঝুঁকিপূর্ণ দেশগুলো দ্রুত অর্থছাড়ের দাবি জানাচ্ছে।"),
    s("3", "banglatribune", 1.5, "economy", "সবজির দাম কিছুটা কমেছে, চালের দাম স্থির", "নমুনা খবর: কারওয়ান বাজারে শিম ও লাউয়ের দাম কেজিতে ১০–১৫ টাকা কমেছে।"),
    s("4", "ittefaq", 2, "sports", "সিরিজ জয়ের লক্ষ্যে আজ মাঠে নামছে বাংলাদেশ", "নমুনা খবর: দলে ফিরেছেন দুই পেসার; টস দুপুর দেড়টায়।"),
    s("5", "bt-entertainment", 2.5, "entertainment", "নতুন সিনেমার শুটিং শুরু পুরান ঢাকায়", "নমুনা খবর: মুক্তির লক্ষ্য আগামী ঈদ।"),
    s("6", "dhakatribune", 3, "tech", "Rural schools get solar-powered computer labs", "Sample story: 40 schools in the north will get labs by December."),
    s("7", "prothomalo", 4, "life", "ডেঙ্গু: হাসপাতালে নতুন ভর্তি কমেছে", "নমুনা খবর: তবে মৃত্যু এখনো উদ্বেগজনক, বলছে স্বাস্থ্য অধিদপ্তর।"),
    s("8", "bbcbangla", 5, "media", "ভিডিও: নদীভাঙনে ঘর হারানো মানুষের গল্প", "নমুনা খবর: কুড়িগ্রামের চরাঞ্চল থেকে।"),
  ];
}
