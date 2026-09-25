import { test } from "node:test";
import assert from "node:assert/strict";
import { canCounter, isValidBid, minNextBid, sellerResponse } from "./market.ts";

test("bargain rounds cap at three", () => {
  assert.equal(canCounter(0), true);
  assert.equal(canCounter(2), true);
  assert.equal(canCounter(3), false);
});

test("auction bids", () => {
  assert.equal(minNextBid(0, 5000, 200), 5000);
  assert.equal(minNextBid(5400, 5000, 200), 5600);
  assert.equal(isValidBid(5500, 5400, 5000, 200), false);
  assert.equal(isValidBid(5600, 5400, 5000, 200), true);
  assert.equal(isValidBid(4900, 0, 5000, 200), false);
});

test("seller response to an offer", () => {
  // price 1000, floor 800
  assert.deepEqual(sellerResponse(950, 1000, 800), { kind: "accept", amount: 950 });
  assert.deepEqual(sellerResponse(900, 1000, 800), { kind: "counter", amount: 950 });
  assert.deepEqual(sellerResponse(500, 1000, 800), { kind: "decline" });
  // a counter below the floor is raised to the floor
  assert.deepEqual(sellerResponse(700, 1000, 900), { kind: "counter", amount: 900 });
});
