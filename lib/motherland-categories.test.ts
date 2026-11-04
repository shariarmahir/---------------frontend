import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { ABOUT, BIOGRAPHIES, CULTURE, HISTORY, NATURE, PROCON, SCIENCE, TAKA, TOPIC_PAGES, TRAVEL, VIDEOS } from "../data/motherland.ts";
import { CATEGORIES, categoryFor } from "../data/motherland-categories.ts";
import { DEEP, deepSources } from "../data/motherland-deep.ts";
import { BANKS, MOBILE_MONEY } from "../data/motherland-money.ts";

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

test("every page's blocks name real pictures, sources and links", async () => {
  const { PAGE_BLOCKS } = await import("../data/motherland-pages.ts");
  const { blockSources, blockCredits } = await import("../data/motherland-blocks.ts");
  for (const [slug, blocks] of Object.entries(PAGE_BLOCKS)) {
    assert.ok(categoryFor(slug), `${slug} has no page`);
    for (const s of blockSources(blocks)) assert.ok(s.url.startsWith("http"), `${slug}: ${s.name}`);
    for (const c of blockCredits(blocks)) assert.ok(c.credit.sourceUrl && c.credit.license, `${slug}: ${c.label}`);
    const ids = blocks.flatMap((b) => ("id" in b ? [b.id] : []));
    assert.equal(new Set(ids).size, ids.length, `${slug}: two blocks share an id`);
    for (const b of blocks) {
      const cards = b.kind === "chapters" ? b.chapters : b.kind === "cards" || b.kind === "people" ? b.cards : b.kind === "steps" ? b.steps : [];
      for (const c of cards) if (c.picture) assert.ok(existsSync(`public${c.picture.src}`), `${slug}: ${c.picture.src}`);
      if (b.kind === "films") for (const f of b.films) assert.ok(existsSync(`public/motherland/video/${f.file}.${f.ext ?? "webm"}`) && existsSync(`public/motherland/video/${f.file}.jpg`), `${slug}: film ${f.file}`);
    }
  }
});

test("no page shows a political biography", async () => {
  const { PAGE_BLOCKS } = await import("../data/motherland-pages.ts");
  const people = JSON.stringify([PAGE_BLOCKS.people, categoryFor("people"), DEEP.people, BIOGRAPHIES]).toLowerCase();
  for (const name of ["hasina", "mujib", "khaleda", "ziaur", "fazlul huq", "yunus"]) assert.ok(!people.includes(name), name);
});

test("every event has a real date and venue, and no ticket link is invented", async () => {
  const { EVENTS, SCIENCE_EVENTS } = await import("../data/motherland-live.ts");
  for (const e of EVENTS) {
    assert.ok(e.title && e.venue && e.about, e.id);
    assert.ok(!Number.isNaN(Date.parse(e.start)), e.id);
    if (e.end) assert.ok(e.end >= e.start, e.id);
    if (e.ticket) assert.ok(e.ticket.url.startsWith("http"), e.id);
  }
  for (const e of SCIENCE_EVENTS) assert.ok(e.url.startsWith("https://"), e.id);
});

test("the Pro & Con page opens with the policy statement", async () => {
  const { PAGE_BLOCKS } = await import("../data/motherland-pages.ts");
  const [first] = PAGE_BLOCKS.procon;
  assert.equal(first.kind, "statement");
  assert.match(JSON.stringify(first), /no conflict with any government/);
});

test("the page copy carries none of the giveaway dashes", async () => {
  const { PAGE_BLOCKS } = await import("../data/motherland-pages.ts");
  for (const [slug, blocks] of Object.entries(PAGE_BLOCKS)) {
    const prose = JSON.stringify(blocks.map((b) => (b.kind === "lines" ? { ...b, lines: [] } : b)));
    assert.ok(!prose.includes("\u2014") && !prose.includes("—"), slug);
  }
});

test("every card on the category pages has a photograph", async () => {
  const { PAGE_BLOCKS } = await import("../data/motherland-pages.ts");
  const bare: string[] = [];
  for (const blocks of Object.values(PAGE_BLOCKS)) {
    for (const b of blocks) {
      const cards = b.kind === "chapters" ? b.chapters : b.kind === "cards" || b.kind === "people" ? b.cards : b.kind === "steps" ? b.steps : [];
      for (const c of cards) if (!c.picture) bare.push(c.title);
      if (b.kind === "map") for (const m of b.pins) if (!m.picture) bare.push(m.name);
    }
  }
  assert.deepEqual(bare, []);
});

test("card titles and section subtitles are short enough to hold one line", async () => {
  const { PAGE_BLOCKS } = await import("../data/motherland-pages.ts");
  for (const blocks of Object.values(PAGE_BLOCKS)) {
    for (const b of blocks) {
      if ("lede" in b && b.lede) assert.ok(b.lede.length <= 100, b.lede);
      const cards = b.kind === "chapters" ? b.chapters : b.kind === "cards" || b.kind === "people" ? b.cards : b.kind === "steps" ? b.steps : [];
      for (const c of cards) assert.ok(c.title.length <= 33, c.title);
    }
  }
});

test("no photograph on a category page shows an excluded politician's file", async () => {
  const { MORE } = await import("../data/motherland-more.ts");
  for (const [key, m] of Object.entries(MORE)) assert.ok(!/hasina|mujib|khaleda|ziaur/i.test(m.sourceUrl), key);
});

test("every category page opens on a film", () => {
  for (const c of CATEGORIES) {
    if (c.slug === "travel") continue; // Geography & Travel has its own page, and its own film.
    assert.ok(DEEP[c.slug]?.film, c.slug);
  }
});

test("the money band names real brands, with safe links and logos on disk", () => {
  for (const b of [...MOBILE_MONEY, ...BANKS]) {
    assert.ok(b.url.startsWith("https://"), b.name);
    assert.ok(b.text.length > 0, b.name);
    if (b.logo) assert.ok(existsSync(`public${b.logo}`), b.logo);
  }
});

test("hero films stay clean: no AI-generated source and no removed film", () => {
  for (const deep of Object.values(DEEP)) {
    const file = deep?.film?.src.phone ?? "";
    assert.ok(!/rickshaws-tsc|cinematic-bangladesh|chital-herd/.test(file), file);
  }
});

test("every hero film and all its cuts are on disk", () => {
  for (const [slug, deep] of Object.entries(DEEP)) {
    if (!deep?.film) continue;
    const { src, poster } = deep.film;
    for (const file of [src.phone, src.desktop, src.wide, poster]) {
      if (file) assert.ok(existsSync(`public${file}`), `${slug}: ${file}`);
    }
  }
});
