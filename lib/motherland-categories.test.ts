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

test("the native-life lists, seasons and conservation are all filled", async () => {
  const { NATIVE_LIFE, SEASON_NATURE, WHY_CARE } = await import("../data/motherland-nature.ts");
  assert.equal(SEASON_NATURE.length, 6, "six seasons");
  assert.ok(WHY_CARE.length >= 3, "conservation reasons");
  for (const g of NATIVE_LIFE) {
    assert.ok(g.items.length > 0, `${g.id} has no items`);
    assert.ok(existsSync(`public/motherland/photos/${g.photo}.jpg`), `${g.id} photo`);
    for (const it of g.items) assert.ok(it.name && it.note, `${g.id}: an item is missing text`);
  }
});

test("every culture event has a venue and either a ticket link or none (shown as at the venue)", async () => {
  const { EVENTS, GHOSTS } = await import("../data/motherland-culture-events.ts");
  assert.ok(EVENTS.length > 0 && GHOSTS.length > 0);
  for (const e of EVENTS) {
    assert.ok(e.title && e.venue && e.city && e.when, `${e.id} is missing a field`);
    assert.ok(e.ticket === null || e.ticket.startsWith("https://"), `${e.id} ticket must be a link or null`);
  }
});

test("the trip planner regions each have transport, sights and a photo on disk", async () => {
  const { REGIONS } = await import("../data/motherland-trip.ts");
  assert.ok(REGIONS.length > 0);
  for (const r of REGIONS) {
    assert.ok(r.transport.length > 0, `${r.id} has no transport`);
    assert.ok(r.attractions.length > 0, `${r.id} has no sights`);
    assert.ok(r.dailyUsd > 0, `${r.id} daily cost`);
    assert.ok(existsSync(`public/motherland/photos/${r.photo}.jpg`), `${r.id} photo`);
  }
});

test("the People page adds voices and women, and names no excluded politician", async () => {
  const { MORE_VOICES, WOMEN_POWER } = await import("../data/motherland-people.ts");
  assert.ok(MORE_VOICES.length >= 5 && WOMEN_POWER.length >= 3);
  const banned = ["hasina", "mujib", "khaleda", "ziaur rahman", " zia"];
  const text = JSON.stringify([...MORE_VOICES, ...WOMEN_POWER]).toLowerCase();
  for (const name of banned) assert.ok(!text.includes(name), `People must not name "${name.trim()}"`);
});
