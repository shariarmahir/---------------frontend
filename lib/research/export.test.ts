import { test } from "node:test";
import assert from "node:assert/strict";
import type { Article } from "./core.ts";
import { fileBase, toBibtex, toHtml, toMarkdown } from "./export.ts";

const a: Article = {
  slug: "salt-rice",
  title: "লবণসহিষ্ণু ধান <পরীক্ষা>",
  titleEn: "Salt-tolerant rice",
  kind: "thesis",
  field: "agriculture",
  level: "masters",
  status: "published",
  authors: [{ name: "রিয়া", nameEn: "Riya Das" }, { name: "তানভীর" }],
  institution: "খুলনা বিশ্ববিদ্যালয়",
  year: 2025,
  published: "2025-05-01",
  summary: "কৃষকেরা কেন নেন।",
  keywords: ["ধান", "লবণ"],
  sections: [{ id: "m", heading: "পদ্ধতি", body: "জরিপ হলো।\n\n- এক\n- দুই", tables: [{ title: "সারণি", head: ["ক", "খ"], rows: [["১", "২"]] }] }],
  references: [{ text: "বিবিএস ২০২২", url: "https://bbs.gov.bd" }],
  revisions: [],
  sample: true,
};
const url = "https://example.org/research/salt-rice";

test("markdown carries the title, sections, list, table, references, citation and the sample note", () => {
  const md = toMarkdown(a, url);
  for (const part of ["# লবণসহিষ্ণু ধান", "## পদ্ধতি", "- এক\n- দুই", "| ক | খ |", "1. বিবিএস ২০২২ https://bbs.gov.bd", "## উদ্ধৃতি", "নমুনা নিবন্ধ"]) assert.ok(md.includes(part), part);
});

test("html escapes the text and stands alone", () => {
  const html = toHtml(a, url);
  assert.ok(html.startsWith("<!doctype html>"));
  assert.ok(html.includes("&lt;পরীক্ষা&gt;"));
  assert.ok(!html.includes("<পরীক্ষা>"));
  assert.ok(html.includes("<li>এক</li>"));
});

test("bibtex picks the entry type by kind and level and keys on the first author", () => {
  const bib = toBibtex(a, url);
  assert.ok(bib.startsWith("@mastersthesis{Das2025,"));
  assert.ok(bib.includes("author = {Riya Das and তানভীর}"));
  assert.ok(bib.includes("note = {Sample entry; not a real study}"));
  assert.ok(toBibtex({ ...a, kind: "paper", sample: false }, url).startsWith("@article{"));
});

test("file names keep letters and digits only", () => {
  assert.equal(fileBase({ slug: "a b/c?ধান" }), "a-b-c-ধান");
});
