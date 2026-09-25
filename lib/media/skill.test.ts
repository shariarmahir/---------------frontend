import { test } from "node:test";
import assert from "node:assert/strict";
import { skillStatus } from "./skill.ts";

test("skill statuses", () => {
  assert.equal(skillStatus(4, 0, 0), "unrated");
  assert.equal(skillStatus(5, 3.2, 4), "challenged");
  assert.equal(skillStatus(5, 3.2, 2), "rated");
  assert.equal(skillStatus(4, 4.3, 12), "verified");
  assert.equal(skillStatus(4, 4, 5), "verified");
  assert.equal(skillStatus(4, 4.3, 3), "rated");
  // within half a star of the claim counts as confirmed
  assert.equal(skillStatus(5, 4.9, 188), "verified");
  assert.equal(skillStatus(4, 3.5, 20), "verified");
  assert.equal(skillStatus(4, 3.4, 20), "rated");
});
