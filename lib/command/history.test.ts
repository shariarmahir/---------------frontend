import { test } from "node:test";
import assert from "node:assert/strict";
import { AREAS, AREA_KIND, HISTORY_DAYS, areaIndex, bdHour, categoryHourWeight, historyCount, historyFor, hourMatrix } from "./history.ts";
import { POLICE_CATEGORIES } from "./routing.ts";
import type { PoliceCategory } from "./types.ts";
import { PLACES } from "../../data/command/places.ts";

const hours = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => (from + i) % 24);
const sum = (seed: number, categories: PoliceCategory[], hrs: number[], areas?: number[]) =>
  historyCount(historyFor(seed), { categories, hours: hrs, areas });

test("historyFor: deterministic per seed, memoised, 30 days of counts, fast", () => {
  const a = historyFor(7);
  assert.equal(historyFor(7), a, "same seed, same object");
  assert.equal(a.days, HISTORY_DAYS);
  assert.equal(a.counts.length, AREAS.length * 24 * POLICE_CATEGORIES.length);
  const t0 = performance.now();
  const fresh = historyFor(424242);
  const ms = performance.now() - t0;
  assert.ok(ms < 60, `computed in ${ms.toFixed(1)} ms`);
  assert.notDeepEqual(fresh.counts, a.counts);
  // Recomputing a seed after the cache moved on gives identical numbers.
  for (let s = 1000; s < 1006; s++) historyFor(s);
  assert.deepEqual(historyFor(7).counts, a.counts);
  // Realistic scale: a few reports per area a day.
  const perAreaDay = historyCount(a) / AREAS.length / HISTORY_DAYS;
  assert.ok(perAreaDay > 3 && perAreaDay < 12, String(perAreaDay));
});

test("history shape: harassment peaks in the evening, drugs late at night, extortion in market hours, theft in the evening", () => {
  for (const seed of [7, 11, 99]) {
    assert.ok(sum(seed, ["sexual-harassment"], hours(17, 21)) > 3 * sum(seed, ["sexual-harassment"], hours(1, 5)), `harassment ${seed}`);
    assert.ok(sum(seed, ["drugs"], hours(22, 26)) > 2 * sum(seed, ["drugs"], hours(9, 13)), `drugs ${seed}`);
    assert.ok(sum(seed, ["chadabaji"], hours(10, 14)) > 4 * sum(seed, ["chadabaji"], hours(1, 5)), `extortion ${seed}`);
    assert.ok(sum(seed, ["theft"], hours(18, 22)) > 2 * sum(seed, ["theft"], hours(3, 7)), `theft ${seed}`);
    assert.ok(sum(seed, ["protest"], hours(10, 15)) > 10 * sum(seed, ["protest"], hours(0, 4)), `protest ${seed}`);
  }
  // The live model gives the same peaks.
  assert.ok(categoryHourWeight("sexual-harassment", 19) > 4 * categoryHourWeight("sexual-harassment", 3));
  assert.ok(categoryHourWeight("drugs", 1) > 3 * categoryHourWeight("drugs", 11));
});

test("history places: harassment clusters at transport hubs and markets, domestic violence at homes", () => {
  const of = (kinds: string[]) => AREAS.map((_, i) => i).filter((i) => kinds.includes(AREA_KIND[i]));
  const hubs = of(["transport", "market"]);
  const homes = of(["residential"]);
  assert.ok(hubs.length >= 15 && homes.length >= 8);
  const perArea = (c: PoliceCategory, areas: number[]) => sum(7, [c], hours(0, 23), areas) / areas.length;
  assert.ok(perArea("sexual-harassment", hubs) > 2 * perArea("sexual-harassment", homes));
  assert.ok(perArea("domestic-violence", homes) > 2 * perArea("domestic-violence", hubs));
  assert.ok(perArea("chadabaji", of(["market"])) > 2 * perArea("chadabaji", homes));
});

test("areas: every listed place, findable by area name and district; hour of day in Bangladesh", () => {
  assert.equal(AREAS, PLACES);
  PLACES.forEach((p, i) => assert.equal(areaIndex(p), i));
  assert.equal(areaIndex({ district: "Dhaka", areaBn: "কোথাও নেই" }), -1);
  // Every named kind is a real listed area (no typos fall back to "mixed" silently).
  const named = AREA_KIND.filter((k) => k !== "mixed").length;
  assert.equal(named, 45, "all 45 named area kinds match a listed place");
  assert.equal(bdHour(Date.UTC(2026, 9, 25, 18, 0, 0)), 0, "midnight in Dhaka");
  assert.equal(bdHour(Date.UTC(2026, 9, 25, 13, 30, 0)), 19);
  assert.equal(bdHour(Date.UTC(1969, 11, 31, 23, 0, 0)), 5, "before the epoch too");
});

test("hourMatrix: 24 rows by category; sums agree with historyCount; a division is a part of the whole", () => {
  const h = historyFor(7);
  const m = hourMatrix(h);
  assert.equal(m.length, 24);
  assert.ok(m.every((r) => r.length === POLICE_CATEGORIES.length));
  assert.equal(m.flat().reduce((a, b) => a + b, 0), historyCount(h));
  const dhaka = historyCount(h, { division: "dhaka" });
  const sylhet = historyCount(h, { division: "sylhet" });
  assert.ok(dhaka > sylhet && sylhet > 0);
  const two = hourMatrix(h, { division: "sylhet", categories: ["drugs", "theft"] });
  assert.ok(two.every((r) => r.length === 2));
  assert.equal(two.flat().reduce((a, b) => a + b, 0), historyCount(h, { division: "sylhet", categories: ["drugs", "theft"] }));
});
