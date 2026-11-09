import { test } from "node:test";
import assert from "node:assert/strict";
import {
  byCategory, categorize, clip, decodeEntities, editionAt, headlines, inEdition, mergeNews, newsDay, parseFeed, parseFeedDate, plainText, webUrl, type NewsItem, type NewsSource,
} from "./news.ts";

const src: NewsSource = { id: "bt", bn: "বাংলা ট্রিবিউন", lang: "bn", feed: "https://www.banglatribune.com/feed/", home: "https://www.banglatribune.com" };
const item = (x: Partial<NewsItem>): NewsItem => ({ id: "i", title: "শিরোনাম", summary: "", url: "https://example.com/a", source: "bt", category: "national", at: "2026-10-02T10:00:00.000Z", lang: "bn", ...x });

test("Bangladesh time sets the edition: 5am morning, noon afternoon, 4pm evening, 8pm to 5am night", () => {
  // 23:00Z is 5am next day in Dhaka.
  const at = (bdHour: number) => new Date(Date.UTC(2026, 9, 2, bdHour - 6));
  assert.equal(editionAt(at(5)), "morning");
  assert.equal(editionAt(at(11)), "morning");
  assert.equal(editionAt(at(12)), "noon");
  assert.equal(editionAt(at(16)), "evening");
  assert.equal(editionAt(at(20)), "night");
  assert.equal(editionAt(at(26)), "night"); // 2am
  assert.equal(editionAt(at(29)), "morning"); // 5am next day
});

test("after midnight and before 5am still counts as last night's news day", () => {
  assert.equal(newsDay(new Date("2026-10-02T19:30:00Z")), "2026-10-02"); // 1:30am Dhaka on the 3rd
  assert.equal(newsDay(new Date("2026-10-02T23:00:00Z")), "2026-10-03"); // 5am Dhaka
  assert.equal(newsDay(new Date("2026-10-02T04:00:00Z")), "2026-10-02");
});

test("feed dates with 4- or 2-digit years and any zone become UTC", () => {
  assert.equal(parseFeedDate("Fri, 02 Oct 2026 22:42:49 +0600"), "2026-10-02T16:42:49.000Z");
  assert.equal(parseFeedDate("Fri, 02 Oct 26 20:35:57 +0600"), "2026-10-02T14:35:57.000Z");
  assert.equal(parseFeedDate("Fri, 02 Oct 2026 16:18:45 GMT"), "2026-10-02T16:18:45.000Z");
  assert.equal(parseFeedDate("2026-10-02T16:19:12.613Z"), "2026-10-02T16:19:12.613Z");
  for (const bad of ["", "tomorrow", "Fri, 02 Foo 2026 10:00:00 GMT", undefined]) assert.equal(parseFeedDate(bad), undefined, String(bad));
});

test("text is cleaned: CDATA opened, tags and encoded tags dropped, entities decoded, tails trimmed", () => {
  assert.equal(decodeEntities("Tk5&ndash;10 &amp; &#2453;&#x9be; &bogus;"), "Tk5–10 & কা &bogus;");
  assert.equal(plainText("<![CDATA[ <p><img src='x.jpg' /> The MID <b>said</b>  <a href='/d'>Details</a></p> ]]>"), "The MID said Details");
  assert.equal(plainText("&lt;p class=&quot;x&quot;&gt;&lt;strong&gt;Prices rose&lt;/strong&gt;&lt;/p&gt;"), "Prices rose");
  assert.equal(clip("The MID said Details"), "The MID said");
  const long = "শব্দ ".repeat(80).trim();
  const c = clip(long, 100);
  assert.ok(c.length <= 101 && c.endsWith("…") && !c.includes("শব্দ…শ"), c);
});

test("only absolute http(s) links are kept", () => {
  assert.equal(webUrl("https://www.bbc.com/bengali/articles/x?at_medium=RSS&amp;at_campaign=rss"), "https://www.bbc.com/bengali/articles/x?at_medium=RSS&at_campaign=rss");
  for (const bad of ["javascript:alert(1)", "/relative/path", "data:text/html,x", "", undefined]) assert.equal(webUrl(bad), undefined, String(bad));
});

test("section names come first, then the link's path; entertainment and sports win over the country", () => {
  assert.equal(categorize(["বিনোদন", "দেশ"]), "entertainment");
  assert.equal(categorize(["Bangladesh", "Sports"]), "sports");
  assert.equal(categorize(["আইন ও অপরাধ", "রাজধানী"]), "crime");
  assert.equal(categorize(["bangladesh", "district"]), "national");
  assert.equal(categorize(["video", "bangladesh"]), "media");
  assert.equal(categorize(["world", "middle-east"]), "world");
  assert.equal(categorize(["something-else"]), "national");
  assert.equal(categorize([], "world"), "world");
});

const FEED = `<?xml version="1.0"?><rss><channel><title>Feed</title>
<item><title><![CDATA[বিমানবন্দরে কোন ঘটনায় গ্রেফতার?]]></title>
<description><![CDATA[ঢাকার বিমানবন্দরে বিশৃঙ্খলার অভিযোগে মামলা। ]]></description>
<link>https://www.bbc.com/bengali/articles/abc?at_medium=RSS&amp;at_campaign=rss</link>
<pubDate>Fri, 02 Oct 2026 16:18:45 GMT</pubDate>
<media:thumbnail width="240" height="134" url="https://ichef.bbci.co.uk/x.png"/></item>
<item> <title><![CDATA[নতুন সিনেমার শুটিং শুরু]]></title> <link>https://www.banglatribune.com/entertainment/9/x</link>
<pubDate>Fri, 02 Oct 2026 22:27:19 +0600</pubDate> <category><![CDATA[বিনোদন]]></category>
<description><![CDATA[<p><img width="150" src="https://cdn.example.com/a.jpg" /> শুটিং শুরু হয়েছে <a href="x">বিস্তারিত</a></p>]]></description></item>
<item><title>No link</title><pubDate>Fri, 02 Oct 2026 10:00:00 GMT</pubDate></item>
<item><title>Bad link</title><link>javascript:alert(1)</link><pubDate>Fri, 02 Oct 2026 10:00:00 GMT</pubDate></item>
<item><title><a href="/x" hreflang="en">Old style title</a></title><link>http://old.example.com/y</link><pubDate>Fri, 22 Jul 22 18:00:00 +0600 </pubDate><description>Plain text &lt;br&gt;</description></item>
</channel></rss>`;

test("a feed reads into clean stories; items without a web link or date are skipped", () => {
  const items = parseFeed(FEED, src);
  assert.equal(items.length, 3);
  const [bbc, film, old] = items;
  assert.equal(bbc.title, "বিমানবন্দরে কোন ঘটনায় গ্রেফতার?");
  assert.equal(bbc.url, "https://www.bbc.com/bengali/articles/abc?at_medium=RSS&at_campaign=rss");
  assert.equal(bbc.image, "https://ichef.bbci.co.uk/x.png");
  assert.equal(bbc.at, "2026-10-02T16:18:45.000Z");
  assert.equal(film.category, "entertainment");
  assert.equal(film.summary, "শুটিং শুরু হয়েছে");
  assert.equal(film.image, "https://cdn.example.com/a.jpg");
  assert.equal(old.title, "Old style title");
  assert.equal(old.image, undefined);
  assert.equal(old.at, "2022-07-22T12:00:00.000Z");
  assert.equal(new Set(items.map((i) => i.id)).size, 3);
  assert.equal(parseFeed(FEED, src)[0].id, bbc.id, "ids are stable across reads");
  assert.ok(parseFeed(FEED, { ...src, category: "world" }).every((i) => i.category === "world"));
  assert.deepEqual(parseFeed("<html>not a feed</html>", src), []);
});

test("merging keeps one copy of a story, drops stale and future ones, newest first", () => {
  const now = new Date("2026-10-02T16:00:00Z");
  const a = item({ id: "a", url: "https://x.com/1", title: "বন্যায় পানিবন্দি ৫০ হাজার", at: "2026-10-02T15:00:00Z" });
  const sameLink = item({ id: "b", url: "https://x.com/1", title: "অন্য শিরোনাম", at: "2026-10-02T14:00:00Z" });
  const sameTitle = item({ id: "c", url: "https://y.com/2", title: "বন্যায় পানিবন্দি ৫০ হাজার!", at: "2026-10-02T14:30:00Z" });
  const stale = item({ id: "d", url: "https://z.com/3", title: "পুরোনো", at: "2026-09-29T10:00:00Z" });
  const future = item({ id: "e", url: "https://z.com/4", title: "ভবিষ্যৎ", at: "2026-10-03T10:00:00Z" });
  const fresh = item({ id: "f", url: "https://z.com/5", title: "নতুন", at: "2026-10-02T15:30:00Z" });
  assert.deepEqual(mergeNews([[a, sameLink, stale], [sameTitle, future, fresh]], now).map((n) => n.id), ["f", "a"]);
});

test("an edition holds its own hours of its own news day", () => {
  const list = [
    item({ id: "m", at: "2026-10-02T01:00:00Z" }), // 7am
    item({ id: "e", at: "2026-10-02T11:00:00Z" }), // 5pm
    item({ id: "n1", at: "2026-10-02T15:00:00Z" }), // 9pm
    item({ id: "n2", at: "2026-10-02T20:00:00Z" }), // 2am on the 3rd — still the 2nd's night
    item({ id: "x", at: "2026-10-01T15:00:00Z" }), // the night before
  ];
  assert.deepEqual(inEdition(list, "2026-10-02", "night").map((n) => n.id), ["n1", "n2"]);
  assert.deepEqual(inEdition(list, "2026-10-02", "morning").map((n) => n.id), ["m"]);
  assert.deepEqual(inEdition(list, "2026-10-02", "noon"), []);
});

test("headlines spread across sources and categories before repeating any", () => {
  const list = [
    item({ id: "1", source: "pa", category: "national" }),
    item({ id: "2", source: "pa", category: "sports" }),
    item({ id: "3", source: "bbc", category: "national" }),
    item({ id: "4", source: "bbc", category: "world" }),
    item({ id: "5", source: "bt", category: "entertainment" }),
    item({ id: "6", source: "pa", category: "national" }),
  ];
  assert.deepEqual(headlines(list, 3).map((n) => n.id), ["1", "4", "5"]);
  assert.equal(headlines(list, 6).length, 6);
  assert.deepEqual(headlines([], 5), []);
});

test("categories come out in the page's order, empty ones left out", () => {
  const groups = byCategory([item({ id: "s", category: "sports" }), item({ id: "n", category: "national" }), item({ id: "s2", category: "sports" })]);
  assert.deepEqual(groups.map(([c, l]) => [c, l.length]), [["national", 1], ["sports", 2]]);
});
