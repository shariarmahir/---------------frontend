import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { TOPICS, TOPIC_PAGES, topicHref } from "../data/motherland.ts";
import { categoryFor } from "../data/motherland-categories.ts";
import { BEST, BOTH_SIDES, FACT_INDEX, FACT_NAV, FACT_SOURCES, FACT_TOPICS, FACTS_NAME, GLANCE, GOVERNMENT, NOT_BEST, PEACE, RESEARCH, SCHOOLS, factsCredits } from "../data/motherland-facts.ts";
import { searchFacts } from "./motherland-facts-search.ts";

const anchors = new Set([BEST.id, NOT_BEST.id, GLANCE.id, GOVERNMENT.id, SCHOOLS.id, PEACE.id, RESEARCH.id, ...BEST.items.map((f) => f.id), ...NOT_BEST.items.map((f) => f.id)]);

test("the Facts tab sits last in the bar and opens its page from everywhere", () => {
  assert.equal(TOPICS.at(-1)?.tab, "Facts");
  assert.equal(topicHref("facts", true), "/bangladesh/facts");
  assert.equal(topicHref("facts", false), "/bangladesh/facts");
  assert.equal(TOPIC_PAGES.facts, "/bangladesh/facts");
  assert.ok(!categoryFor("facts"), "a category must not shadow the facts page");
});

test("the two required sections are in the topics and carry their facts", () => {
  assert.equal(BEST.title, "Why we are the best");
  assert.equal(NOT_BEST.title, "Why we are not doing best");
  assert.deepEqual(FACT_TOPICS.slice(0, 2).map((t) => t.title), [BEST.title, NOT_BEST.title]);
  assert.ok(BEST.items.length && NOT_BEST.items.length);
});

test("every fact has a figure, a linked source, and a reality check or the reader's part", () => {
  for (const f of BEST.items) assert.ok(f.figure && f.check && f.source.url.startsWith("https://"), f.id);
  for (const f of NOT_BEST.items) assert.ok(f.figure && f.yourPart && f.source.url.startsWith("https://"), f.id);
  assert.ok(FACT_SOURCES.length > 10);
});

test("fact ids are unique, and every in-page link lands on one", () => {
  const ids = [...BEST.items, ...NOT_BEST.items].map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  const links = [...FACT_TOPICS.map((t) => t.href), ...SCHOOLS.links.map((l) => l.href), ...PEACE.links.map((l) => l.href)];
  for (const href of links) if (href.startsWith("#")) assert.ok(anchors.has(href.slice(1)), href);
});

test("every picture is on disk and credited", () => {
  const pictures = [...[...BEST.items, ...NOT_BEST.items].map((f) => f.picture), ...FACT_TOPICS.map((t) => t.picture), ...GOVERNMENT.cards.map((c) => c.picture), ...RESEARCH.cards.map((c) => c.picture), SCHOOLS.picture, PEACE.picture];
  for (const p of pictures) assert.ok(existsSync(`public${p.src}`) && p.credit.sourceUrl, p.src);
  assert.ok(factsCredits().length > 0);
});

test("the page goes by its new name everywhere", () => {
  assert.equal(FACTS_NAME, "Facts about Bangladesh");
  assert.equal(TOPICS.find((t) => t.id === "facts")?.name, FACTS_NAME);
});

test("every fact has a title that holds one line and a photograph of its own", () => {
  const facts = [...BEST.items, ...NOT_BEST.items];
  for (const f of facts) assert.ok(f.title.length <= 34, f.title);
  /* The same photograph on two facts in one list would read as a mistake. */
  for (const list of [BEST.items, NOT_BEST.items]) assert.equal(new Set(list.map((f) => f.picture.src)).size, list.length);
});

test("the bar and both-sides pairs point at sections and facts that exist", () => {
  for (const n of FACT_NAV) assert.ok(n.id && n.label, n.id);
  const strong = new Set(BEST.items.map((f) => f.id));
  const hard = new Set(NOT_BEST.items.map((f) => f.id));
  for (const p of BOTH_SIDES.pairs) assert.ok(strong.has(p.best) && hard.has(p.hard), p.subject);
});

test("the search finds a fact by its words and its figure, and narrows as you type", () => {
  assert.equal(searchFacts("air", FACT_INDEX)[0].href, "#air");
  assert.equal(searchFacts("padma", FACT_INDEX)[0].href, "#padma");
  assert.equal(searchFacts("30.6%", FACT_INDEX)[0].href, "#loans");
  assert.equal(searchFacts("  ", FACT_INDEX).length, 0);
  assert.equal(searchFacts("zzzz", FACT_INDEX).length, 0);
  const wide = searchFacts("children", FACT_INDEX, 50).length;
  assert.ok(searchFacts("children read", FACT_INDEX, 50).length < wide);
});
