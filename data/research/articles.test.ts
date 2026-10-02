import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { sampleArticles } from "./articles.ts";
import { libraryArticles } from "./library.ts";
import { citeParts, FIELDS, KINDS, LEVELS, paragraphs, slugify } from "../../lib/research/core.ts";

test("articles have unique, clean slugs and valid kinds, fields and levels; samples say so", () => {
  const slugs = libraryArticles.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const a of sampleArticles) assert.ok(a.sample, `${a.slug} must be marked as a sample`);
  for (const a of libraryArticles) {
    assert.equal(slugify(a.slug), a.slug, `${a.slug} is not a clean slug`);
    assert.ok(a.kind in KINDS && a.field in FIELDS && a.level in LEVELS, a.slug);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(a.published) && !Number.isNaN(Date.parse(a.published)), `${a.slug} date`);
    assert.ok(a.year >= 1971 && a.year <= Number(a.published.slice(0, 4)), `${a.slug} year`);
    assert.ok(a.authors.length > 0 && a.summary.length >= 80, `${a.slug} authors/summary`);
    assert.ok(a.revisions.length > 0, `${a.slug} has a history`);
  }
});

test("every citation mark points at a reference, and every reference link is a web address", () => {
  for (const a of libraryArticles) {
    const text = [
      a.summary,
      ...a.sections.flatMap((s) => [s.body, s.callout?.body ?? "", ...(s.figures ?? []).map((f) => f.caption), ...(s.tables ?? []).flatMap((t) => [...t.rows.flat(), t.caption ?? ""])]),
    ].flatMap(paragraphs);
    for (const p of text) {
      for (const part of citeParts(p)) {
        if ("cite" in part) assert.ok(part.cite >= 1 && part.cite <= a.references.length, `${a.slug}: [${part.cite}] has no reference`);
      }
    }
    for (const r of a.references) if (r.url) assert.match(r.url, /^https:\/\//, `${a.slug} reference link`);
    const ids = a.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${a.slug} section ids`);
  }
});

test("pictures exist, and pictures from Wikimedia carry a credit", () => {
  for (const a of sampleArticles) {
    if (!a.image) continue;
    assert.ok(existsSync(new URL(`../../public${a.image.src}`, import.meta.url)), `${a.slug}: ${a.image.src} is missing`);
    if (a.image.src.startsWith("/bangladesh/")) assert.ok(a.image.credit, `${a.slug}: Wikimedia photo needs a credit`);
  }
});

test("ongoing research says so, so it is never shown as a finished result", () => {
  for (const a of sampleArticles.filter((x) => x.ongoing)) {
    assert.ok(a.facts?.some((f) => f.value === "চলমান গবেষণা"), `${a.slug} must show its status`);
  }
});

test("real papers start with no borrowed numbers: no seeded reactions, shares or comments", () => {
  for (const a of libraryArticles.filter((x) => !x.sample)) {
    assert.equal(a.engagement, undefined, `${a.slug} must not carry sample engagement`);
    assert.equal(a.talk, undefined, `${a.slug} must not carry sample comments`);
  }
});

test("figures have rows and a caption; table rows match their header; waterfalls end on a total", () => {
  for (const a of libraryArticles) {
    for (const s of a.sections) {
      for (const f of s.figures ?? []) {
        assert.ok(f.rows.length > 0 && f.caption.length > 0 && f.rows.every((r) => Number.isFinite(r.value) && r.value >= 0), `${a.slug}: ${f.title}`);
        if (f.kind === "waterfall") assert.ok(f.rows[0].total && f.rows[f.rows.length - 1].total, `${a.slug}: ${f.title} needs totals at both ends`);
      }
      for (const t of s.tables ?? []) for (const r of t.rows) assert.equal(r.length, t.head.length, `${a.slug}: ${t.title} row ${r[0]}`);
    }
  }
});
