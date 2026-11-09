import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aqiBand,
  chanceNext24h,
  classify,
  cleanTitle,
  crimeKindOf,
  decodeEntities,
  districtScores,
  divisionStats,
  hourly,
  isForeign,
  isSafeUrl,
  locate,
  sourceName,
  mergeWire,
  parseRss,
  riskLevel,
  similarity,
  toWire,
  type WireItem,
} from "./core.ts";
import { districtShapes } from "../../data/tv-wall/districts-map.ts";

const NOW = Date.parse("2026-10-19T06:00:00Z");

const rss = (items: string) => `<?xml version="1.0"?><rss><channel><title>t</title>${items}</channel></rss>`;
const item = (title: string, link: string, date: string, source = "") =>
  `<item><title>${title}</title><link>${link}</link><pubDate>${date}</pubDate>${source ? `<source url="https://x.test">${source}</source>` : ""}</item>`;

test("the map has all 64 districts across the 8 divisions, each with a shape", () => {
  assert.equal(districtShapes.length, 64);
  assert.equal(new Set(districtShapes.map((d) => d.id)).size, 64);
  assert.equal(new Set(districtShapes.map((d) => d.division)).size, 8);
  for (const d of districtShapes) assert.ok(d.d.startsWith("M") && d.bn && d.en, d.id);
});

test("parseRss reads titles, links, dates and sources, and decodes entities", () => {
  const xml = rss(
    item("সাতক্ষীরায় যুবককে পিটিয়ে হত্যা - প্রথম আলো", "https://news.google.com/a", "Sun, 18 Oct 2026 16:58:21 GMT", "প্রথম আলো") +
      item("<![CDATA[Fish &amp; rice <b>prices</b>]]>", "https://x.test/b", "Sun, 18 Oct 2026 10:00:00 GMT") +
      "<item><title>no link</title></item>",
  );
  const items = parseRss(xml, "fallback");
  assert.equal(items.length, 2);
  assert.equal(items[0].source, "প্রথম আলো");
  assert.equal(items[1].title, "Fish & rice prices");
  assert.equal(items[1].source, "fallback");
  assert.equal(decodeEntities("&#2453;&#x995;&lt;"), "কক<");
});

test("cleanTitle drops Google News' outlet suffix", () => {
  assert.equal(cleanTitle("দিনাজপুরে দুই সন্তানকে হত্যার পর মায়ের আত্মহত্যা - Shomoyer Alo", "Shomoyer Alo"), "দিনাজপুরে দুই সন্তানকে হত্যার পর মায়ের আত্মহত্যা");
  assert.equal(cleanTitle("A plain headline without a suffix", ""), "A plain headline without a suffix");
});

test("only https links with a real host are kept", () => {
  assert.ok(isSafeUrl("https://www.prothomalo.com/x"));
  assert.ok(!isSafeUrl("javascript:alert(1)"));
  assert.ok(!isSafeUrl("http://example.com"));
  assert.ok(!isSafeUrl("https://localhost/x"));
});

test("classify sorts headlines into the wall's categories and severities", () => {
  assert.deepEqual(classify("সরাইলে কিশোরীকে দলবদ্ধ ধর্ষণ, ২ তরুণ গ্রেপ্তার"), { category: "crime", severity: 3 });
  assert.deepEqual(classify("সিদ্ধিরগঞ্জে ছিনতাইকারীর হামলায় আহত ২"), { category: "crime", severity: 2 });
  assert.deepEqual(classify("চুরির অভিযোগে মামলা"), { category: "crime", severity: 1 });
  assert.deepEqual(classify("দুর্নীতির মামলায় সাবেক কর্মকর্তা গ্রেপ্তার"), { category: "corruption", severity: 2 });
  assert.deepEqual(classify("ফরিদপুরে সড়ক দুর্ঘটনায় নিহত ৩"), { category: "loss", severity: 3 });
  assert.deepEqual(classify("সেপ্টেম্বরে রেমিট্যান্স এল ২৪০ কোটি ডলার"), { category: "economy", severity: 1 });
  assert.deepEqual(classify("পদ্মা সেতুর রেল সংযোগ প্রকল্প উদ্বোধন"), { category: "development", severity: 1 });
  assert.deepEqual(classify("আন্তর্জাতিক গণিত অলিম্পিয়াডে বাংলাদেশের স্বর্ণপদক"), { category: "achievement", severity: 1 });
  assert.equal(classify("রবীন্দ্রনাথের বিরোধিতা, নাকি বাঙালির বিভাজন"), null);
  // Only the headline's own words decide: an off-topic search hit is left out.
  assert.equal(classify("অবকাশ শেষে ২৫ অক্টোবর খুলছে সুপ্রিম কোর্ট"), null);
  assert.equal(classify("হ্যানয়ে আবাসিক এলাকায় অগ্নিকাণ্ড")?.category, "loss");
});

test("classify does not mistake places and idioms for crime", () => {
  assert.equal(classify("গুলিস্তানে যানজটে আটকে আছে শত শত বাস"), null);
  assert.equal(classify("Ceasefire talks resume"), null);
  assert.deepEqual(classify("আটকের পর থানায় নির্যাতনের অভিযোগ"), { category: "crime", severity: 2 });
});

test("crimeKindOf names the crime", () => {
  assert.equal(crimeKindOf("কিশোরীকে দলবদ্ধ ধর্ষণ"), "rape");
  assert.equal(crimeKindOf("যুবককে পিটিয়ে হত্যা"), "murder");
  assert.equal(crimeKindOf("ইয়াবাসহ আটক ২"), "drugs");
  assert.equal(crimeKindOf("কিছু একটা"), "other");
});

test("locate finds the district from Bangla case endings, upazilas and English names", () => {
  assert.deepEqual(locate("সাতক্ষীরায় যুবককে পিটিয়ে হত্যা"), { district: "satkhira", division: "khulna" });
  assert.deepEqual(locate("সরাইলে কিশোরীকে দলবদ্ধ ধর্ষণ"), { district: "brahmanbaria", division: "chattogram" });
  assert.deepEqual(locate("জমি নিয়ে বিরোধে চাচা হত্যা, আশুলিয়া থেকে ভাতিজা গ্রেপ্তার"), { district: "dhaka", division: "dhaka" });
  assert.deepEqual(locate("Two held with yaba in Cox's Bazar"), { district: "coxs-bazar", division: "chattogram" });
  assert.deepEqual(locate("Man killed in Chittagong"), { district: "chattogram", division: "chattogram" });
  assert.equal(locate("ভোলাহাটে ডাকাতি").district, "chapainawabganj");
  assert.equal(locate("ভোলায় ডাকাতি").district, "bhola");
  assert.equal(locate("মহাকাশে নতুন গ্রহ").district, null);
  // A place name inside another word is not a match.
  assert.equal(locate("Dhakai jamdani fair").district, null);
});

test("toWire drops unsafe links, stale items and off-topic headlines", () => {
  const raw = parseRss(
    rss(
      item("দিনাজপুরে দুই সন্তানকে হত্যার পর মায়ের আত্মহত্যা - Jugantor", "https://news.google.com/a", "Sun, 18 Oct 2026 20:00:00 GMT", "Jugantor") +
        item("ফেনীতে ডাকাতি", "javascript:alert(1)", "Sun, 18 Oct 2026 20:00:00 GMT") +
        item("খুলনায় হত্যা", "https://x.test/old", "Wed, 14 Oct 2026 20:00:00 GMT") +
        item("রবীন্দ্রনাথের বিরোধিতা, নাকি বাঙালির বিভাজন", "https://x.test/c", "Sun, 18 Oct 2026 20:00:00 GMT") +
        item("নিউইয়র্কে কলেজছাত্রীকে ধর্ষণের অভিযোগ", "https://x.test/d", "Sun, 18 Oct 2026 20:00:00 GMT"),
    ),
  );
  const wire = toWire(raw, { lang: "bn" }, NOW);
  assert.equal(wire.length, 1);
  assert.equal(wire[0].district, "dinajpur");
  assert.equal(wire[0].source, "Jugantor");
  assert.equal(wire[0].crimeKind, "murder");
});

const make = (over: Partial<WireItem>): WireItem => ({
  id: Math.random().toString(36),
  title: "t",
  url: "https://x.test",
  source: "A",
  alsoIn: [],
  publishedAt: NOW - 3_600_000,
  lang: "bn",
  category: "crime",
  severity: 2,
  district: "dhaka",
  division: "dhaka",
  ...over,
});

test("mergeWire folds one story told by several outlets into one item", () => {
  const merged = mergeWire([
    make({ title: "দুই সন্তানকে হত্যার পর মায়ের আত্মহত্যা", source: "Jugantor", district: null, division: null }),
    make({ title: "দিনাজপুরে দুই সন্তানকে হত্যার পর মায়ের আত্মহত্যা", source: "Shomoyer Alo", district: "dinajpur", division: "rangpur", severity: 3 }),
    make({ title: "কক্সবাজারে ইয়াবাসহ আটক", source: "BSS", district: "coxs-bazar", division: "chattogram" }),
  ]);
  assert.equal(merged.length, 2);
  const story = merged.find((m) => m.title.includes("মায়ের"))!;
  assert.equal(story.alsoIn.length, 1);
  assert.equal(story.district, "dinajpur");
  assert.equal(story.severity, 3);
  assert.ok(similarity("two held with yaba", "two held with heroin") > 0.5);
});

test("risk levels, district scores and the Poisson chance", () => {
  assert.equal(riskLevel(0), 0);
  assert.equal(riskLevel(2), 1);
  assert.equal(riskLevel(4), 2);
  assert.equal(riskLevel(9), 3);
  // The same score is a red zone over six hours but not over two days.
  assert.equal(riskLevel(6, 6), 3);
  assert.equal(riskLevel(6, 48), 2);
  const scores = districtScores([make({ severity: 3 }), make({ severity: 2 }), make({ category: "economy" })]);
  assert.deepEqual(scores.get("dhaka"), { score: 5, count: 2 });
  assert.equal(chanceNext24h(0, 24), 0);
  assert.ok(Math.abs(chanceNext24h(1, 24) - (1 - Math.exp(-1))) < 1e-9);
  assert.ok(chanceNext24h(2, 48) > 0.6 && chanceNext24h(2, 48) < 0.7);
});

test("divisionStats weighs reports against population", () => {
  const stats = divisionStats(
    [make({}), make({}), make({ district: "sylhet", division: "sylhet" }), make({ category: "loss", district: "sylhet", division: "sylhet" })],
    24,
  );
  assert.equal(stats.length, 8);
  const dhaka = stats.find((s) => s.id === "dhaka")!;
  const sylhet = stats.find((s) => s.id === "sylhet")!;
  assert.equal(dhaka.reports, 2);
  assert.equal(sylhet.reports, 1);
  // Sylhet has a quarter of Dhaka's people, so one report weighs more there.
  assert.ok(sylhet.index > dhaka.index);
  assert.equal(stats[0].id, "dhaka");
  // The chance follows violent crime only: two severity-2 reports leave it at zero.
  assert.equal(dhaka.severe, 0);
  assert.equal(dhaka.chance, 0);
});

test("hourly bins reports by hour, harm apart from gains", () => {
  const bins = hourly([make({ publishedAt: NOW - 30 * 60_000 }), make({ category: "achievement", publishedAt: NOW - 90 * 60_000 }), make({ publishedAt: NOW - 30 * 3_600_000 })], NOW, 24);
  assert.equal(bins.length, 24);
  assert.equal(bins[23].harm, 1);
  assert.equal(bins[22].gain, 1);
  assert.equal(bins.reduce((s, b) => s + b.harm + b.gain, 0), 2);
});

test("ago reads in English", async () => {
  const { ago } = await import("./core.ts");
  assert.equal(ago(NOW - 20_000, NOW), "just now");
  assert.equal(ago(NOW - 5 * 60_000, NOW), "5 min ago");
  assert.equal(ago(NOW - 3 * 3_600_000, NOW), "3 h ago");
  assert.equal(ago(NOW - 86_400_000, NOW), "1 day ago");
});

test("aqiBand follows the US EPA breakpoints", () => {
  assert.equal(aqiBand(120).en, "Unhealthy for sensitive groups");
  assert.equal(aqiBand(42).level, 0);
  assert.equal(aqiBand(120).level, 2);
  assert.equal(aqiBand(189).bn, "অস্বাস্থ্যকর");
});

test("stories abroad are left out unless they are about Bangladeshis", () => {
  assert.ok(isForeign("টাইগার শ্রফের বাসায় মহারাষ্ট্রের উপমুখ্যমন্ত্রী"));
  assert.ok(isForeign("বোমা হামলার হুমকি, বুলগেরিয়ায় জরুরি অবতরণ"));
  assert.ok(!isForeign("মালয়েশিয়ায় বাংলাদেশি শ্রমিককে হত্যা"));
  assert.ok(!isForeign("সাতক্ষীরায় যুবককে পিটিয়ে হত্যা"));
  assert.equal(sourceName("https://www.citizensvoicebd.com/"), "citizensvoicebd.com");
  assert.equal(sourceName("প্রথম আলো"), "প্রথম আলো");
});

test("mergeWire also folds reworded headlines of one story, but not stories a day apart", () => {
  const merged = mergeWire([
    make({ title: "টাইগার শ্রফকে লক্ষ্য করে গুলি, দায় স্বীকার বিষ্ণোই গ্যাংয়ের", district: null, division: null, source: "A" }),
    make({ title: "টাইগার শ্রফের গাড়ি লক্ষ্য করে গুলি", district: null, division: null, source: "B" }),
    make({ title: "Former air chief Hannan arrested in Qatar", category: "crime", district: null, division: null, source: "C" }),
    make({ title: "Ex air force chief Sheikh Abdul Hannan arrested in Qatar", category: "corruption", district: null, division: null, source: "D" }),
    make({ title: "যশোরে ইয়াবাসহ দুই নারী গ্রেপ্তার", district: "jashore", division: "khulna", source: "E" }),
    make({ title: "যশোরে ইয়াবাসহ দুই নারী গ্রেপ্তার", district: "jashore", division: "khulna", source: "F", publishedAt: NOW - 40 * 3_600_000, id: "older" }),
  ]);
  assert.equal(merged.length, 4);
  assert.equal(merged.find((m) => m.title.includes("শ্রফ"))!.alsoIn.length, 1);
  assert.equal(merged.find((m) => m.title.includes("Hannan"))!.alsoIn.length, 1);
});

test("liveVideoIdFrom reads the live stream from any of YouTube's page shapes", async () => {
  const { liveVideoIdFrom } = await import("./core.ts");
  const live = '"isLive":true';
  assert.equal(liveVideoIdFrom(`<link rel="canonical" href="https://www.youtube.com/watch?v=yRX-c1F1Clg">${live}`), "yRX-c1F1Clg");
  assert.equal(
    liveVideoIdFrom(`${live}"currentVideoEndpoint":{"clickTrackingParams":"CAAQ","commandMetadata":{"webCommandMetadata":{"url":"/watch?v=iWq2kH0iq2Q&pp=x"`),
    "iWq2kH0iq2Q",
  );
  assert.equal(liveVideoIdFrom(`${live}"videoDetails":{"videoId":"03Rp8h4qykk","title"`), "03Rp8h4qykk");
  // Not live, or no id anywhere: null, never a guess.
  assert.equal(liveVideoIdFrom('<link rel="canonical" href="https://www.youtube.com/watch?v=yRX-c1F1Clg">'), null);
  assert.equal(liveVideoIdFrom(live), null);
});

test("a story from a foreign outlet is left out even when written in Bangla", () => {
  const raw = parseRss(
    rss(
      item("ভিন লং-এর দিন খাও সেতুটি এখনও সমস্যায় - Vietnam.vn", "https://x.test/v", "Sun, 18 Oct 2026 20:00:00 GMT", "Vietnam.vn") +
        item("পদ্মা সেতুর রেল সংযোগ প্রকল্প উদ্বোধন - প্রথম আলো", "https://x.test/p", "Sun, 18 Oct 2026 20:00:00 GMT", "প্রথম আলো"),
    ),
  );
  const wire = toWire(raw, { lang: "bn" }, NOW);
  assert.equal(wire.length, 1);
  assert.ok(wire[0].title.includes("পদ্মা"));
});
