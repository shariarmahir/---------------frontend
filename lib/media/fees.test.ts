import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFees } from "./fees.ts";

test("5% each side on a round price", () => {
  assert.deepEqual(computeFees(1000), {
    price: 1000,
    sellerFee: 50,
    sellerReceives: 950,
    buyerCharge: 50,
    buyerPays: 1050,
    platformTotal: 100,
  });
});

test("rounds to whole taka", () => {
  const f = computeFees(333);
  assert.equal(f.sellerFee, 17);
  assert.equal(f.buyerPays, 350);
});

test("zero and negative prices clamp to zero", () => {
  assert.equal(computeFees(-5).buyerPays, 0);
  assert.equal(computeFees(0).platformTotal, 0);
});
