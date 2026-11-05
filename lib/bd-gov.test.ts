import assert from "node:assert/strict";
import { test } from "node:test";
import { ABOUT, BENEFITS, FOOTER, NAV, TOPICS } from "../data/bd-gov.ts";
import { DETAILS, detailFor } from "../data/bd-gov-details.ts";
import { NEEDS, SCHEMES, SERVICES, TOP_SERVICES } from "../data/bd-gov-services.ts";
import { inNeed, searchServices } from "./bd-gov-services.ts";

const HOME = "/bangladesh/government";
const PAGES = new Set([HOME, `${HOME}/about`, `${HOME}/benefits`, `${HOME}/national-portal`]);

const cards = [...TOPICS.cards, ...ABOUT.cards, ...BENEFITS.cards];
const guideLinks = [
  ...cards.map((c) => c.href),
  ...NAV.map((l) => l.href),
  ...FOOTER.columns.flatMap((c) => c.links.map((l) => l.href)),
  ...DETAILS.flatMap((d) => d.parts.flatMap((p) => (p.links ?? []).map((l) => l.href))),
].filter((h) => h.startsWith(`${HOME}/`) && !h.includes("#"));

test("every guide link opens a page that exists", () => {
  for (const href of guideLinks) {
    const slug = href.slice(HOME.length + 1);
    assert.ok(PAGES.has(href) || detailFor(slug), `no page for ${href}`);
  }
});

test("detail slugs are unique and none hides a fixed page", () => {
  const slugs = DETAILS.map((d) => d.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.ok(!PAGES.has(`${HOME}/${s}`), `${s} clashes with a page`);
});

test("every detail page is reached from a card in its own section", () => {
  const bySection = { topics: TOPICS.cards, about: ABOUT.cards, benefits: BENEFITS.cards };
  for (const d of DETAILS) {
    assert.ok(
      bySection[d.section].some((c) => c.href === `${HOME}/${d.slug}`),
      `${d.slug} has no card in ${d.section}`,
    );
  }
});

test("every detail page leads to an official government site", () => {
  for (const d of DETAILS) {
    const { hostname } = new URL(d.official.href);
    assert.ok(hostname.endsWith(".gov.bd"), `${d.slug} points to ${hostname}`);
    assert.ok(d.official.site && hostname.endsWith(d.official.site.replace(/^www\./, "")), `${d.slug}: site label ${d.official.site} vs ${hostname}`);
    assert.ok(d.parts.length >= 2, `${d.slug} needs at least two parts`);
  }
});

const everyLink = SERVICES.flatMap((s) => [s.href, ...(s.more ?? []).map((m) => m.href)]);

test("each service is listed once, with both names and a line about it", () => {
  assert.equal(new Set(SERVICES.map((s) => s.id)).size, SERVICES.length);
  for (const s of SERVICES) {
    assert.ok(s.name && s.what, s.id);
    assert.match(s.bn, /[\u0980-\u09FF]/, `${s.id} has no Bangla name`);
  }
});

test("every service link is a real web address, and none leads to a site found hijacked", () => {
  for (const href of everyLink) {
    assert.ok(/^https?:\/\//.test(href), href);
    assert.ok(!/ju-admission|knowledgebank-brri/.test(new URL(href).hostname), href);
  }
});

test("every part of life has services, and the helplines are real numbers", () => {
  for (const n of NEEDS) assert.ok(SERVICES.filter((s) => inNeed(s, n.id)).length >= 3, n.id);
  for (const s of SERVICES) if (s.call) assert.match(s.call.tel, /^\d{3,11}$/, s.id);
});

test("services point at detail pages that exist", () => {
  for (const s of SERVICES) for (const slug of s.topics ?? []) assert.ok(detailFor(slug), `${s.id}: ${slug}`);
});

test("the home page shows a full grid of the most-used services", () => {
  assert.equal(TOP_SERVICES.length % 4, 0);
});

test("search finds services in English, in Bangla and by everyday words", () => {
  const first = (q: string) => searchServices(SERVICES, q)[0]?.id;
  assert.equal(first("passport"), "e-passport");
  assert.equal(first("পাসপোর্ট"), "e-passport");
  assert.equal(first("namjari"), "mutation");
  assert.equal(first("খতিয়ান"), "land-records");
  assert.equal(first("LAND TAX"), "land-tax");
  assert.equal(first("train"), "train");
  assert.equal(searchServices(SERVICES, "nothing like this").length, 0);
  assert.equal(searchServices(SERVICES, "  ").length, SERVICES.length);
});

test("every loan scheme names its source and its date", () => {
  for (const s of SCHEMES) {
    assert.ok(s.source.href.startsWith("https://"), s.title);
    assert.match(s.status, /20\d\d/, s.title);
  }
});
