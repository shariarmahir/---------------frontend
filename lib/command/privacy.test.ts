import { test } from "node:test";
import assert from "node:assert/strict";
import { SHIFT_MAX_M, SHIFT_MIN_M, boardPoint, isWomenCase, redactCase, safeSummaryBn, safeTitleBn, searchFields, shiftedPoint } from "./privacy.ts";
import { haversineKm } from "./geo.ts";
import { CATEGORY_META } from "./routing.ts";
import { filterCases } from "./selectors.ts";
import type { Case, World } from "./types.ts";

const T = Date.UTC(2026, 9, 25, 6, 0, 0);

const mk = (id: string, c: Partial<Case>): Case => ({
  id,
  dept: "police",
  category: "theft",
  severity: "normal",
  titleBn: `চুরি ${id}`,
  summaryBn: "দোকানের তালা ভাঙা",
  place: { lat: 23.75, lng: 90.39, division: "dhaka", district: "Dhaka", areaBn: "শাহবাগ" },
  reportedAt: T,
  status: "new",
  alerts: [],
  timeline: [],
  notes: [],
  ...c,
});

const theft = mk("PB-000001", {});
const harassed = mk("PB-000002", { category: "sexual-harassment", titleBn: "বাসস্ট্যান্ডে স্কুলছাত্রীকে উত্ত্যক্ত", summaryBn: "এক স্কুলছাত্রীকে প্রতিদিন উত্ত্যক্ত করা হচ্ছে" });
const child = mk("PB-000003", { category: "theft", victim: "child", titleBn: "শিশুর কাছ থেকে ছিনতাই", summaryBn: "এক শিশুর ব্যাগ কেড়ে নেওয়া হয়" });
const consumer = mk("PB-000004", { dept: "consumer", category: "adulteration", victim: "woman" });

test("isWomenCase: police women categories, or a woman or child victim; never other departments", () => {
  assert.equal(isWomenCase(theft), false);
  assert.equal(isWomenCase(harassed), true);
  assert.equal(isWomenCase(child), true);
  assert.equal(isWomenCase(consumer), false);
});

test("safeTitleBn and safeSummaryBn: women and child cases show category and area only", () => {
  assert.equal(safeTitleBn(theft), theft.titleBn);
  assert.equal(safeSummaryBn(theft), theft.summaryBn);
  assert.equal(safeTitleBn(harassed), `${CATEGORY_META["sexual-harassment"].labelBn}, শাহবাগ`);
  assert.equal(safeTitleBn(child), `${CATEGORY_META.theft.labelBn}, শাহবাগ`);
  for (const c of [harassed, child]) {
    assert.ok(!safeTitleBn(c).includes("ছাত্রী") && !safeTitleBn(c).includes("শিশু"), c.id);
    assert.equal(safeSummaryBn(c), "");
    const r = redactCase(c);
    assert.equal(r.titleBn, safeTitleBn(c));
    assert.equal(r.summaryBn, "");
    assert.ok(!searchFields(c).some((s) => s.includes(c.titleBn) || s.includes(c.summaryBn)), c.id);
  }
  assert.equal(redactCase(theft), theft);
});

test("boardPoint: women and child cases are always shifted 120–300 m, fixed per id; others only in privacy mode", () => {
  assert.deepEqual(boardPoint(theft), { lat: theft.place.lat, lng: theft.place.lng });
  assert.deepEqual(boardPoint(theft, true), shiftedPoint(theft.id, theft.place));
  for (const c of [harassed, child]) {
    const p = boardPoint(c);
    assert.deepEqual(p, boardPoint(c, true));
    assert.deepEqual(p, boardPoint(c));
    const m = haversineKm(c.place, p) * 1000;
    assert.ok(m >= SHIFT_MIN_M - 1 && m <= SHIFT_MAX_M + 1, `${c.id} ${m}`);
  }
});

test("filterCases: a search never matches a women case's hidden title or summary", () => {
  const world = { cases: [theft, harassed, child, consumer] } as unknown as World;
  assert.deepEqual(filterCases(world, { q: "স্কুলছাত্রী" }).map((c) => c.id), []);
  assert.deepEqual(filterCases(world, { q: "শিশুর" }).map((c) => c.id), []);
  assert.deepEqual(filterCases(world, { q: "তালা" }).map((c) => c.id), ["PB-000004", "PB-000001"]);
  // What the board shows still finds it: id, area, the safe title's category.
  assert.deepEqual(filterCases(world, { q: "pb-000002" }).map((c) => c.id), ["PB-000002"]);
  assert.ok(filterCases(world, { q: CATEGORY_META["sexual-harassment"].labelBn }).some((c) => c.id === "PB-000002"));
});
