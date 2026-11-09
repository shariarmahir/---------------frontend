import assert from "node:assert/strict";
import { test } from "node:test";
import { exportsAfter, growthRate, project, yearReaching, type Plan } from "./motherland-future.ts";

const today: Plan = { investment: 30, exports: 8, skills: 30, sectors: 2 };
const best: Plan = { investment: 40, exports: 20, skills: 80, sectors: 8 };
const worst: Plan = { investment: 20, exports: 0, skills: 10, sectors: 0 };

test("today's levers grow income at about the recent pace", () => {
  assert.ok(Math.abs(growthRate(today) - 0.046) < 0.001);
});

test("growth stays positive and below 10% across the levers' ranges", () => {
  assert.ok(growthRate(worst) > 0);
  assert.ok(growthRate(best) < 0.1);
  assert.ok(growthRate(best) > growthRate(today));
});

test("a projection runs from the start year to the horizon and compounds", () => {
  const points = project(today, [2025, 2600], 2041);
  assert.equal(points.length, 17);
  assert.deepEqual(points[0], [2025, 2600]);
  assert.equal(points.at(-1)?.[0], 2041);
  assert.ok(Math.abs(points[1][1] - 2600 * (1 + growthRate(today))) < 1e-9);
});

test("yearReaching finds the first year at or above a line, or null", () => {
  const points = project(best, [2025, 2600], 2041);
  const year = yearReaching(points, 4500);
  assert.ok(year !== null && year > 2025 && year < 2041);
  assert.equal(yearReaching(project(worst, [2025, 2600], 2041), 14000), null);
});

test("exports grow with export growth and sectors", () => {
  assert.equal(exportsAfter(today, 48, 0), 48);
  assert.ok(exportsAfter(best, 48, 16) > exportsAfter(today, 48, 16));
});
