import { test } from "node:test";
import assert from "node:assert/strict";
import { sourcePoints } from "../amar-bangladesh.ts";
import { meters, pointOf, puzzles, themes } from "./puzzles.ts";

test("one puzzle per dossier point, in order", () => {
  assert.equal(puzzles.length, 32);
  assert.deepEqual(
    puzzles.map((p) => p.n),
    sourcePoints.map((s) => s.n),
  );
});

test("every puzzle's theme is on the map", () => {
  const ids = new Set(themes.map((t) => t.id));
  for (const p of puzzles) assert.ok(ids.has(pointOf(p.n).theme), `puzzle ${p.n} theme`);
  for (const t of themes) assert.ok(puzzles.some((p) => pointOf(p.n).theme === t.id), `theme ${t.id} has puzzles`);
});

test("each puzzle has four proposals that are not all one answer", () => {
  for (const p of puzzles) {
    assert.equal(p.decisions.length, 4, `puzzle ${p.n}`);
    const yes = p.decisions.filter((d) => d.answer === "yes").length;
    assert.ok(yes >= 1 && yes <= 3, `puzzle ${p.n} mixes হ্যাঁ and না`);
    for (const d of p.decisions) assert.ok(d.q.trim() && d.why.trim(), `puzzle ${p.n} text`);
  }
});

test("impact only names real meters, and every meter is moved", () => {
  const ids = new Set(meters.map((m) => m.id));
  for (const p of puzzles) {
    const keys = Object.keys(p.impact);
    assert.ok(keys.length > 0, `puzzle ${p.n} moves something`);
    for (const k of keys) assert.ok(ids.has(k as never), `puzzle ${p.n} meter ${k}`);
  }
  for (const m of meters) assert.ok(puzzles.filter((p) => p.impact[m.id]).length >= 3, `meter ${m.id}`);
});

test("map labels stay short enough for the ring", () => {
  for (const p of puzzles) assert.ok(p.short.length <= 18, `puzzle ${p.n} short label "${p.short}"`);
});
