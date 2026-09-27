import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng, digest, hashString, randomSeed, stableStringify } from "./rng.ts";

test("same seed, same sequence; different seed, different sequence", () => {
  const a = createRng("k7m-2qx");
  const b = createRng("k7m-2qx");
  const c = createRng("k7m-2qy");
  const sa = Array.from({ length: 20 }, () => a.next());
  const sb = Array.from({ length: 20 }, () => b.next());
  const sc = Array.from({ length: 20 }, () => c.next());
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  for (const x of sa) assert.ok(x >= 0 && x < 1);
});

test("range and chance stay in bounds", () => {
  const r = createRng("x");
  for (let i = 0; i < 500; i++) {
    const v = r.range(0.6, 1.2);
    assert.ok(v >= 0.6 && v < 1.2);
  }
  assert.equal(createRng("y").chance(0), false);
  assert.equal(createRng("y").chance(1), true);
});

test("hash and digest are stable", () => {
  assert.equal(hashString("বাংলাদেশ"), hashString("বাংলাদেশ"));
  assert.equal(digest("abc").length, 14);
});

test("stableStringify ignores key order and undefined", () => {
  assert.equal(stableStringify({ b: 1, a: [2, { d: 3, c: undefined }] }), stableStringify({ a: [2, { d: 3 }], b: 1 }));
});

test("randomSeed has the readable shape", () => {
  let i = 0;
  const s = randomSeed(() => (i++ % 10) / 10);
  assert.match(s, /^[a-z2-9]{3}-[a-z2-9]{3}$/);
});
