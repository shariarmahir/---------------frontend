import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { TOPICS, TOPIC_PAGES, topicHref } from "../data/motherland.ts";
import { categoryFor } from "../data/motherland-categories.ts";
import { BEST, FACT_SOURCES, FACT_TOPICS, GLANCE, GOVERNMENT, NOT_BEST, PEACE, RESEARCH, SCHOOLS, SLIDES, factsCredits } from "../data/motherland-facts.ts";

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
  const links = [...SLIDES.map((s) => s.href), ...FACT_TOPICS.map((t) => t.href), ...SCHOOLS.links.map((l) => l.href), ...PEACE.links.map((l) => l.href)];
  for (const href of links) if (href.startsWith("#")) assert.ok(anchors.has(href.slice(1)), href);
});

test("every picture is on disk and credited", () => {
  const pictures = [...SLIDES.map((s) => s.picture), ...FACT_TOPICS.map((t) => t.picture), ...GOVERNMENT.cards.map((c) => c.picture), ...RESEARCH.cards.map((c) => c.picture), SCHOOLS.picture, PEACE.picture];
  for (const p of pictures) assert.ok(existsSync(`public${p.src}`) && p.credit.sourceUrl, p.src);
  assert.ok(factsCredits().length > 0);
});
