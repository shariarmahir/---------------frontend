import { test } from "node:test";
import assert from "node:assert/strict";
import { assessPrice } from "./fair-price.ts";

const band = { low: 1000, high: 2000, unit: "প্রতি পিস" };

test("verdicts across the band", () => {
  assert.equal(assessPrice(700, band), "unfair");
  assert.equal(assessPrice(750, band), "under");
  assert.equal(assessPrice(900, band), "under");
  assert.equal(assessPrice(1000, band), "fair");
  assert.equal(assessPrice(2000, band), "fair");
  assert.equal(assessPrice(2500, band), "premium");
});
