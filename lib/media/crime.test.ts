import { test } from "node:test";
import assert from "node:assert/strict";
import { WITNESS_THRESHOLD, FLAG_THRESHOLD, crimeStatus, pixelBox, privacyIssues } from "./crime.ts";

test("a post is a claim until witnesses confirm it; flags send it to review", () => {
  assert.equal(crimeStatus(0, 0), "claimed");
  assert.equal(crimeStatus(WITNESS_THRESHOLD - 1, 0), "claimed");
  assert.equal(crimeStatus(WITNESS_THRESHOLD, 0), "witnessed");
  assert.equal(crimeStatus(40, FLAG_THRESHOLD), "review");
});

test("phone numbers, NID-length numbers and emails are kept out of posts", () => {
  assert.deepEqual(privacyIssues("মোড়ে প্রতিদিন চাঁদা তোলে"), []);
  assert.deepEqual(privacyIssues("ওর নম্বর 01712345678"), ["phone"]);
  assert.deepEqual(privacyIssues("ওর নম্বর ০১৭১২-৩৪৫৬৭৮"), ["phone"]);
  assert.deepEqual(privacyIssues("+8801812345678 এ ফোন দিন"), ["phone"]);
  assert.deepEqual(privacyIssues("এনআইডি 1990123456789"), ["id"]);
  assert.deepEqual(privacyIssues("লিখুন x@y.com"), ["email"]);
  // prices and years are fine
  assert.deepEqual(privacyIssues("৳২,৫০০ চাঁদা, ২০২৬ সালে"), []);
});

test("a cover box is centred on the tap and stays inside the image", () => {
  assert.deepEqual(pixelBox(500, 400, 1000, 800, 0.2), { x: 400, y: 300, size: 200 });
  assert.deepEqual(pixelBox(10, 10, 1000, 800, 0.2), { x: 0, y: 0, size: 200 });
  assert.deepEqual(pixelBox(990, 790, 1000, 800, 0.2), { x: 800, y: 600, size: 200 });
});
