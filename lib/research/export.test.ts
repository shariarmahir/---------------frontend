import { test } from "node:test";
import assert from "node:assert/strict";
import type { Article } from "./core.ts";
import { citeAs, fileBase, toBibtex, toHtml, toMarkdown, toRis } from "./export.ts";

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
  for (const part of ["# লবণসহিষ্ণু ধান", "## Abstract", "## পদ্ধতি", "- এক\n- দুই", "| ক | খ |", "1. বিবিএস ২০২২ https://bbs.gov.bd", "## How to cite", "Sample entry"]) assert.ok(md.includes(part), part);
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

test("ris records carry type, every author, the link and the sample note", () => {
  const ris = toRis(a, url);
  assert.ok(ris.startsWith("TY  - THES\r\n"));
  assert.ok(ris.includes("AU  - Riya Das\r\nAU  - তানভীর"));
  assert.ok(ris.includes(`UR  - ${url}`));
  assert.ok(ris.includes("N1  - Sample entry"));
  assert.ok(ris.trimEnd().endsWith("ER  -"));
});

test("citation styles order names their own way", () => {
  const b = { ...a, title: "Salt-tolerant rice", authors: [{ name: "Riya Das" }, { name: "Tanvir Haque" }] };
  assert.equal(citeAs(b, url, "apa"), `Das, R., & Haque, T. (2025). _Salt-tolerant rice_ [Thesis]. খুলনা বিশ্ববিদ্যালয়. Genius (Kandari-Lab). ${url}`);
  assert.ok(citeAs(b, url, "mla").startsWith("Das, Riya, and Tanvir Haque. _Salt-tolerant rice_."));
  assert.ok(citeAs(b, url, "chicago").startsWith('Das, Riya, and Tanvir Haque. 2025. "Salt-tolerant rice."'));
});
