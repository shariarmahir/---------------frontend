import { test } from "node:test";
import assert from "node:assert/strict";
import { bnDigits, compactBn, digits, taka, timeAgoBn } from "./format.ts";

test("digits and money", () => {
  assert.equal(bnDigits(2026), "২০২৬");
  assert.equal(bnDigits("4.5"), "৪.৫");
  assert.equal(taka(125000), "৳১,২৫,০০০");
  assert.equal(taka(950), "৳৯৫০");
  assert.equal(taka(-600), "-৳৬০০");
  assert.equal(compactBn(950), "৯৫০");
  assert.equal(compactBn(1200), "১.২ হা");
  assert.equal(compactBn(12000), "১২ হা");
  assert.equal(compactBn(1500000), "১৫ লাখ");
  assert.equal(compactBn(25000000), "২.৫ কোটি");
});

test("Latin numerals option", () => {
  assert.equal(digits("১২৩", "latn"), "123");
  assert.equal(digits(456, "bn"), "৪৫৬");
  assert.equal(taka(125000, "latn"), "৳1,25,000");
  assert.equal(compactBn(1500000, "latn"), "15 লাখ");
  const now = new Date("2026-09-25T12:00:00Z");
  assert.equal(timeAgoBn("2026-09-25T09:00:00Z", now, "latn"), "3 ঘণ্টা আগে");
});

test("relative time", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  assert.equal(timeAgoBn("2026-09-25T11:59:40Z", now), "এইমাত্র");
  assert.equal(timeAgoBn("2026-09-25T11:55:00Z", now), "৫ মিনিট আগে");
  assert.equal(timeAgoBn("2026-09-25T09:00:00Z", now), "৩ ঘণ্টা আগে");
  assert.equal(timeAgoBn("2026-09-23T12:00:00Z", now), "২ দিন আগে");
  assert.equal(timeAgoBn("2026-06-20T12:00:00Z", now), "৩ মাস আগে");
});
