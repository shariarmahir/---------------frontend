import { test } from "node:test";
import assert from "node:assert/strict";
import { KINDS, SECTION_TEMPLATES } from "../../lib/research/core.ts";
import { allChecks, checksOf, ROADMAP, ROADMAP_KINDS, stepsFor, type RoadmapKind } from "./roadmap.ts";

const ALL = Object.keys(ROADMAP_KINDS) as RoadmapKind[];

test("the roadmap covers every content type the upload form takes", () => {
  assert.deepEqual([...ALL].sort(), Object.keys(KINDS).sort());
});

test("steps have unique ids, a goal and a named standard; each step on a route has checks", () => {
  assert.equal(new Set(ROADMAP.map((s) => s.id)).size, ROADMAP.length);
  for (const s of ROADMAP) assert.ok(s.title && s.goal && s.standard.length > 40, s.id);
  for (const k of ALL) for (const s of stepsFor(k)) assert.ok(checksOf(s, k).length >= 3, `${s.id} (${k}) needs checks`);
});

test("each kind's route fits it: an idea collects no data, only innovations and projects are built", () => {
  const ids = (k: RoadmapKind) => stepsFor(k).map((s) => s.id);
  assert.ok(!ids("idea").includes("data") && !ids("idea").includes("analysis") && !ids("idea").includes("build"));
  assert.ok(ids("innovation").includes("build") && ids("project").includes("build"));
  assert.ok(!ids("paper").includes("build") && !ids("thesis").includes("build"));
  for (const k of ALL) assert.ok(ids(k).includes("upload") && ids(k).at(-1) === "review", k);
});

test("saved ticks never collide: every check key is unique within a kind", () => {
  for (const k of ALL) {
    const keys = allChecks(k);
    assert.equal(new Set(keys).size, keys.length, k);
  }
});

test("the write-up step follows the kind: theses get the university format, the rest the authorship rules", () => {
  const write = ROADMAP.find((s) => s.id === "write")!;
  assert.ok(checksOf(write, "thesis").some((c) => c.id === "format"));
  assert.ok(checksOf(write, "paper").some((c) => c.id === "authors"));
  assert.match(checksOf(write, "paper")[0].text, /IMRaD/);
  assert.ok(checksOf(write, "idea").some((c) => c.id === "untested"));
});

test("the upload step asks for what the form asks for, including the thumbnail and the type's own sections", () => {
  const upload = ROADMAP.find((s) => s.id === "upload")!;
  for (const k of ALL) {
    const list = checksOf(upload, k);
    assert.ok(list.some((c) => c.id === "thumbnail" && /required/.test(c.text)));
    assert.ok(list.find((c) => c.id === "sections")!.text.includes(SECTION_TEMPLATES[k].join(", ")));
  }
});

test("links are https; Genius tools point inside the library", () => {
  for (const s of ROADMAP) {
    for (const l of s.links ?? []) assert.match(l.url, /^https:\/\//, `${s.id}: ${l.url}`);
    for (const t of s.tools ?? []) assert.match(t.url, /^\/research(\/|$)/, `${s.id}: ${t.url}`);
  }
});
