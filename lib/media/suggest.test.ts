import { test } from "node:test";
import assert from "node:assert/strict";
import { shuffled, suggestPeople } from "./suggest.ts";

const me = { handle: "me", district: "ঢাকা", categories: ["tech", "design"], skills: ["পাইথন", "লোগো"], followers: 10 };
const pool = [
  me,
  { handle: "coder", district: "খুলনা", categories: ["tech"], skills: ["পাইথন"], followers: 40 },
  { handle: "neighbour", district: "ঢাকা", categories: ["cooking"], skills: ["বিরিয়ানি"], followers: 5 },
  { handle: "star", district: "রাজশাহী", categories: ["music"], skills: ["গান"], followers: 90000 },
  { handle: "twin", district: "ঢাকা", categories: ["tech", "design"], skills: ["পাইথন", "লোগো"], followers: 3 },
];

test("shared skills and place rank first, with the strongest reason given", () => {
  const s = suggestPeople(me, pool, { following: new Set(), dismissed: new Set() });
  assert.deepEqual(s.map((p) => p.handle), ["twin", "coder", "neighbour", "star"]);
  assert.deepEqual(s[0].reason, { kind: "skill", value: "পাইথন" });
  assert.deepEqual(s[2].reason, { kind: "district", value: "ঢাকা" });
  assert.deepEqual(s[3].reason, { kind: "popular", value: "" });
});

test("never suggests yourself, people you follow, or people you dismissed", () => {
  const s = suggestPeople(me, pool, { following: new Set(["coder"]), dismissed: new Set(["twin"]) });
  assert.deepEqual(s.map((p) => p.handle), ["neighbour", "star"]);
});

test("on someone else's profile, the viewer is left out too", () => {
  const s = suggestPeople(pool[1], pool, { following: new Set(), dismissed: new Set(), exclude: ["me"] });
  assert.equal(s.some((p) => p.handle === "me" || p.handle === "coder"), false);
  assert.equal(s[0].handle, "twin");
});

test("each feed row gets its own order; the same seed always gives the same one", () => {
  const list = Array.from({ length: 12 }, (_, i) => i);
  assert.deepEqual(shuffled(list, 0), list, "seed 0 keeps the ranking");
  assert.deepEqual(shuffled(list, 7), shuffled(list, 7));
  assert.notDeepEqual(shuffled(list, 7), shuffled(list, 14));
  assert.deepEqual([...shuffled(list, 7)].sort((a, b) => a - b), list, "nobody lost or doubled");
});
