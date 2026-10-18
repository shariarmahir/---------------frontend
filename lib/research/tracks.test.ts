import { test } from "node:test";
import assert from "node:assert/strict";
import { FIELDS, type Article } from "./core.ts";
import { findTrack, inTopic, problemCode, problemCoverage, shelfLetter, SUBJECT_GROUPS, TRACKS } from "./tracks.ts";

const art = (x: Partial<Article>): Article => ({
  slug: "a",
  title: "নিবন্ধ",
  kind: "paper",
  field: "health",
  level: "masters",
  status: "published",
  authors: [{ name: "রিয়া" }],
  institution: "ঢাকা বিশ্ববিদ্যালয়",
  year: 2025,
  published: "2025-05-01",
  summary: "সারাংশ",
  keywords: [],
  sections: [],
  references: [],
  revisions: [],
  ...x,
});

test("each track keeps only the articles its rule names", () => {
  const live = art({ slug: "live", problems: [1] });
  const world = art({ slug: "world", scope: "global" });
  const field = art({ slug: "field", district: "শেরপুর" });
  const student = art({ slug: "student", level: "school" });
  const list = [live, world, field, student];
  assert.deepEqual(inTopic(list, "bd-live").map((a) => a.slug), ["live"]);
  assert.deepEqual(inTopic(list, "global").map((a) => a.slug), ["world"]);
  assert.deepEqual(inTopic(list, "field-work").map((a) => a.slug), ["field"]);
  assert.deepEqual(inTopic(list, "students").map((a) => a.slug), ["student"]);
});

test("a field id lists its field; work in review and unknown ids list nothing", () => {
  const list = [art({ slug: "h" }), art({ slug: "c", field: "climate" }), art({ slug: "r", status: "review", problems: [2] })];
  assert.deepEqual(inTopic(list, "climate").map((a) => a.slug), ["c"]);
  assert.deepEqual(inTopic(list, "bd-live"), []);
  assert.deepEqual(inTopic(list, "nope"), []);
});

test("topics list newest first", () => {
  const list = [art({ slug: "old", published: "2024-01-01" }), art({ slug: "new", published: "2026-01-01" })];
  assert.deepEqual(inTopic(list, "health").map((a) => a.slug), ["new", "old"]);
});

test("problem coverage counts published work per dossier problem", () => {
  const list = [art({ slug: "x", problems: [1, 2] }), art({ slug: "y", problems: [2] }), art({ slug: "z", status: "review", problems: [3] })];
  assert.deepEqual(problemCoverage(list, [1, 2, 3]).map((p) => [p.n, p.articles.length]), [[1, 1], [2, 2], [3, 0]]);
});

test("track ids are unique and findable; codes are zero-padded", () => {
  assert.equal(new Set(TRACKS.map((t) => t.id)).size, TRACKS.length);
  assert.equal(findTrack("global")?.title, "Global Research");
  assert.equal(problemCode(7), "BD-007");
});

test("culture and technology collect their subjects", () => {
  const list = [art({ slug: "soc", field: "society" }), art({ slug: "edu", field: "education" }), art({ slug: "ai", field: "computing" }), art({ slug: "hw", field: "engineering" })];
  assert.deepEqual(inTopic(list, "culture").map((a) => a.slug).sort(), ["edu", "soc"]);
  assert.deepEqual(inTopic(list, "technology").map((a) => a.slug).sort(), ["ai", "hw"]);
});

test("Bangladesh Real Issues & Solutions collects its own subject", () => {
  const list = [art({ slug: "crow", field: "solutions" }), art({ slug: "hw", field: "engineering" })];
  assert.deepEqual(inTopic(list, "bd-solutions").map((a) => a.slug), ["crow"]);
  assert.equal(findTrack("bd-solutions")?.title, "Bangladesh Real Issues & Solutions");
});

test("every subject sits under exactly one Browse by Subject heading", () => {
  const all = SUBJECT_GROUPS.flatMap((g) => g.fields);
  const subjects = Object.keys(FIELDS).length;
  assert.equal(all.length, subjects);
  assert.equal(new Set(all).size, subjects);
});

test("titles shelve by their first letter, skipping a leading article", () => {
  assert.equal(shelfLetter("The Structure of Policy"), "S");
  assert.equal(shelfLetter("a sub-Tk 1,000 sensor"), "S");
  assert.equal(shelfLetter("2-metre wearable"), "0–9");
  assert.equal(shelfLetter("লবণ"), "#");
});
