import { test } from "node:test";
import assert from "node:assert/strict";
import { CAPTCHA_ITEMS, ITEM_BN, makeCaptcha, OPTIONS, solves } from "./captcha.ts";

/** mulberry32: a small seeded generator, so the tests are repeatable. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("every puzzle shows six different pictures, the target among them exactly once", () => {
  for (let s = 1; s <= 200; s++) {
    const c = makeCaptcha(seeded(s));
    const items = c.options.map((o) => o.item);
    assert.equal(items.length, OPTIONS);
    assert.equal(new Set(items).size, OPTIONS, `seed ${s}`);
    assert.equal(items.filter((i) => i === c.target).length, 1);
    for (const o of c.options) assert.ok(o.turn >= -30 && o.turn <= 45);
  }
});

test("only the target solves it", () => {
  const c = makeCaptcha(seeded(7));
  for (const o of c.options) assert.equal(solves(c, o.item), o.item === c.target);
});

test("a fresh puzzle after a miss asks for a different picture", () => {
  for (let s = 1; s <= 100; s++) {
    const first = makeCaptcha(seeded(s));
    assert.notEqual(makeCaptcha(seeded(s), first.target).target, first.target);
  }
});

test("targets vary and every picture has a Bangla name", () => {
  const seen = new Set(Array.from({ length: 300 }, (_, s) => makeCaptcha(seeded(s + 1)).target));
  assert.ok(seen.size >= CAPTCHA_ITEMS.length - 1);
  for (const i of CAPTCHA_ITEMS) assert.ok(ITEM_BN[i]);
});
