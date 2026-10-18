import { test } from "node:test";
import assert from "node:assert/strict";
import { clampSeq, docPages, excerpt, pagesMatching } from "./pages.ts";

const a = {
  title: "Salt-tolerant rice",
  summary: "Why farmers adopt it.",
  sections: [
    { id: "m", heading: "Method", body: "A survey of 210 households." },
    { id: "r", heading: "Results", body: "Seed arrived late.", tables: [{ title: "Reasons", head: ["Reason"], rows: [["Seed timing"]] }] },
  ],
  references: [{ text: "BBS census 2022" }],
};

test("a work is a title page, one page per section, then references", () => {
  assert.deepEqual(docPages(a).map((p) => `${p.n}:${p.kind}`), ["1:title", "2:section", "3:section", "4:references"]);
  assert.equal(docPages({ ...a, references: [] }).length, 3);
});

test("seq is clamped to a real page", () => {
  assert.equal(clampSeq("3", 4), 3);
  assert.equal(clampSeq("99", 4), 4);
  assert.equal(clampSeq("0", 4), 1);
  assert.equal(clampSeq("x", 4), 1);
  assert.equal(clampSeq(null, 4), 1);
});

test("excerpts cut at a word and drop citation marks", () => {
  assert.equal(excerpt("Short text[1].", 50), "Short text.");
  assert.equal(excerpt("one two three four five six", 15), "one two three…");
});

test("document search finds the pages holding every word, tables included", () => {
  assert.deepEqual(pagesMatching(a, "seed"), [3]);
  assert.deepEqual(pagesMatching(a, "farmers"), [1]);
  assert.deepEqual(pagesMatching(a, "bbs census"), [4]);
  assert.deepEqual(pagesMatching(a, "seed survey"), []);
  assert.deepEqual(pagesMatching(a, "  "), []);
});
