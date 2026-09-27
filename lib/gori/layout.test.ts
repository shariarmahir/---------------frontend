import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLayout, LEAF_DOT, LEAF_R, radialText } from "./layout.ts";

test("every problem appears once on the outer ring", () => {
  const leaves = buildLayout().flatMap((t) => t.leaves);
  assert.equal(leaves.length, 32);
  assert.equal(new Set(leaves.map((l) => l.n)).size, 32);
});

test("neighbouring problem dots never overlap", () => {
  const leaves = buildLayout().flatMap((t) => t.leaves);
  for (let i = 1; i < leaves.length; i++) {
    const a = leaves[i - 1];
    const b = leaves[i];
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > LEAF_DOT * 2 + 4, `${a.n}–${b.n}`);
  }
  // And the ring closes without the last touching the first.
  const first = leaves[0];
  const last = leaves.at(-1)!;
  assert.ok(Math.hypot(first.x - last.x, first.y - last.y) > LEAF_DOT * 2);
  for (const l of leaves) assert.ok(Math.abs(Math.hypot(l.x, l.y) - LEAF_R) < 0.1);
});

test("theme angles run clockwise around the ring", () => {
  const angles = buildLayout().map((t) => t.angle);
  for (let i = 1; i < angles.length; i++) assert.ok(angles[i] > angles[i - 1]);
  assert.ok(angles.at(-1)! - angles[0] < 360);
});

test("radial text never renders upside down", () => {
  assert.equal(radialText(10, 0).anchor, "start");
  assert.equal(radialText(10, 180).anchor, "end");
  assert.equal(radialText(10, -90).anchor, "start");
  assert.equal(radialText(10, 200).anchor, "end");
});
