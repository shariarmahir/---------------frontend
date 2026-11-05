import { test } from "node:test";
import assert from "node:assert/strict";
import type { NewsItem } from "./news.ts";
import { findSection, findSub, inSection, NEWS_SECTIONS, placeStory, searchNews, SLOW_READ_CHARS, storiesIn, subsWithStories } from "./news-sections.ts";

const item = (x: Partial<NewsItem>): NewsItem => ({ id: "i", title: "শিরোনাম", summary: "", url: "https://example.com/a", source: "bt", category: "national", at: "2026-10-02T10:00:00.000Z", lang: "bn", ...x });

test("every section and sub-section has a unique slug and a Bangla name", () => {
  const slugs = NEWS_SECTIONS.map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of NEWS_SECTIONS) {
    assert.ok(s.bn && s.subs.length > 0, s.slug);
    const subs = s.subs.map((x) => x.slug);
    assert.equal(new Set(subs).size, subs.length, s.slug);
    for (const reserved of ["story", "today", "epaper", "search"]) assert.notEqual(s.slug, reserved);
  }
});

test("a sub-section takes its categories and the stories whose words match", () => {
  const news = findSection("news")!;
  const politics = findSub(news, "politics")!;
  const fires = findSub(news, "accidents-fires")!;
  const crash = item({ title: "বাস দুর্ঘটনায় নিহত ৫" });
  const vote = item({ category: "politics", title: "সংসদে বাজেট পাস" });
  assert.deepEqual(storiesIn([crash, vote], news, politics), [vote]);
  assert.deepEqual(storiesIn([crash, vote], news, fires), [crash]);
  assert.ok(inSection(crash, news) && inSection(vote, news));
});

test("keywords match only inside the story's own section, except in cross-cutting sections", () => {
  const news = findSection("news")!;
  const plus = findSection("plus")!;
  const abroad = item({ category: "world", title: "ব্রিটিশ সরকারের নতুন নীতি" });
  const home = item({ title: "সরকারের নতুন নীতি" });
  const match = item({ category: "sports", title: "স্কুল ক্রিকেটে নতুন রেকর্ড" });
  assert.deepEqual(storiesIn([abroad, home], news, findSub(news, "governance")), [home]);
  assert.deepEqual(storiesIn([match], news, findSub(news, "education")), []);
  assert.deepEqual(storiesIn([item({ category: "politics", title: "ঢাকায় সমাবেশ" })], plus, findSub(plus, "my-dhaka")).length, 1);
});

test("tags (the feed's section and URL path) count as words", () => {
  const sports = findSection("sports")!;
  const story = item({ category: "sports", title: "Bangladesh win by 20 runs", tags: ["cricket"] });
  assert.deepEqual(subsWithStories([story], sports).map(([s]) => s.slug), ["cricket", "other-sports"]);
});

test("slow reads are the long summaries", () => {
  const slow = findSection("slow-reads")!;
  assert.equal(inSection(item({ summary: "ক".repeat(SLOW_READ_CHARS) }), slow), true);
  assert.equal(inSection(item({ summary: "ছোট" }), slow), false);
});

test("every story is filed somewhere, by category first", () => {
  assert.deepEqual(Object.values(placeStory(item({ category: "world" }))).map((x) => x?.slug), ["news", "world"]);
  assert.equal(placeStory(item({ category: "entertainment" })).sub?.slug, "entertainment");
  assert.equal(placeStory(item({ title: "নতুন রেসিপি" , category: "life" })).sub?.slug, "food-recipe");
  assert.equal(placeStory(item({ title: "সাধারণ খবর" })).section.slug, "news");
});

test("search needs every word, in any order and case", () => {
  const a = item({ id: "a", title: "Dhaka metro rail extends hours" });
  const b = item({ id: "b", title: "ঢাকায় মেট্রোরেল", summary: "নতুন সময়সূচি" });
  assert.deepEqual(searchNews([a, b], "METRO dhaka").map((n) => n.id), ["a"]);
  assert.deepEqual(searchNews([a, b], "সময়সূচি").map((n) => n.id), ["b"]);
  assert.deepEqual(searchNews([a, b], "   "), []);
});
