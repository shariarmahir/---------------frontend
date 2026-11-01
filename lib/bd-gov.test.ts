import assert from "node:assert/strict";
import { test } from "node:test";
import { ABOUT, BENEFITS, FOOTER, NAV, TOPICS } from "../data/bd-gov.ts";
import { DETAILS, detailFor } from "../data/bd-gov-details.ts";

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
