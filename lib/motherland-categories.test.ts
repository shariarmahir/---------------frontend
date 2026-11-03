import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { ABOUT, BIOGRAPHIES, CULTURE, HISTORY, NATURE, PROCON, SCIENCE, TAKA, TOPIC_PAGES, TRAVEL, VIDEOS } from "../data/motherland.ts";
import { CATEGORIES, categoryFor } from "../data/motherland-categories.ts";
import { DEEP, deepSources } from "../data/motherland-deep.ts";

const buttons = [ABOUT.cta, ...HISTORY.cards.map((c) => c.cta), SCIENCE.cta, BIOGRAPHIES.cta, NATURE.cta, TRAVEL.cta, CULTURE.cta, PROCON.cta, TAKA.cta, VIDEOS.cta];

test("every section's button opens a real category page and part", () => {
  for (const { label, href } of buttons) {
    const [path, part] = href.split("#");
    const category = categoryFor(path.replace("/bangladesh/", ""));
    assert.ok(category, `${label}: no page at ${path}`);
    if (part) assert.ok(category.subcategories.some((s) => s.id === part), `${label}: no part #${part}`);
  }
});

test("every topic page in the header exists", () => {
  for (const [topic, href] of Object.entries(TOPIC_PAGES)) if (topic !== "facts") assert.ok(categoryFor(href.replace("/bangladesh/", "")), href);
});

test("slugs and subcategory ids are unique, and none hides a fixed page", () => {
  const slugs = CATEGORIES.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(!slugs.includes("government") && !slugs.includes("facts"));
  for (const c of CATEGORIES) {
    const ids = c.subcategories.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, c.slug);
  }
});

test("quiz answers point at an option", () => {
  for (const c of CATEGORIES) for (const q of c.quiz) assert.ok(q.options[q.answer], `${c.slug}: ${q.question}`);
});

test("every picture is on disk, with alt text and a credit", () => {
  for (const c of CATEGORIES) {
    for (const p of [c.hero, ...c.subcategories.flatMap((s) => s.stories.map((st) => st.picture))]) {
      assert.ok(existsSync(`public${p.src}`), p.src);
      assert.ok(p.alt && p.credit.sourceUrl, p.src);
    }
  }
});

test("every figure on a category page names a real source, and every timeline runs in order", () => {
  for (const [slug, deep] of Object.entries(DEEP)) {
    assert.ok(categoryFor(slug), `${slug} has no page`);
    for (const f of deep.figures ?? []) assert.ok(f.value && f.label && f.source.url.startsWith("https://"), `${slug}: ${f.label}`);
    if (deep.figures) assert.ok(deepSources(slug).length > 0, slug);
    if (deep.film) assert.ok(existsSync(`public${deep.film.src.phone}`) && existsSync(`public${deep.film.poster}`), `${slug} film`);
    const years = (deep.timeline ?? []).map((m) => Number(/\d{4}/.exec(m.when)?.[0])).filter(Boolean);
    for (let i = 1; i < years.length; i++) assert.ok(years[i] > years[i - 1], `${slug}: ${years[i]} out of order`);
  }
  for (const c of CATEGORIES) assert.ok(c.slug === "travel" || c.slug === "procon" || DEEP[c.slug], `${c.slug} has no extra depth`);
});

test("the header's Resources and Invest tabs have their own pages", () => {
  assert.equal(TOPIC_PAGES.resources, "/bangladesh/resources");
  assert.equal(TOPIC_PAGES.invest, "/bangladesh/invest");
});
