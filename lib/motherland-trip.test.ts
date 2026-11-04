import assert from "node:assert/strict";
import { test } from "node:test";
import { REGIONS } from "../data/motherland-trip.ts";
import { planTrip, cheapestTransport } from "./motherland-trip.ts";

test("planTrip costs the days across the chosen regions", () => {
  const plan = planTrip(["sylhet"], "autumn", 3);
  // 3 days at Sylhet's $38/day = $114, plus one cheapest transport leg.
  assert.equal(plan.days, 3);
  assert.equal(plan.lodgingFoodUsd, 114);
  assert.ok(plan.totalUsd > plan.lodgingFoodUsd, "total includes transport");
  assert.equal(plan.route.length, 3, "a day for each day");
});

test("planTrip splits the days evenly between two regions", () => {
  const plan = planTrip(["sylhet", "bandarban"], "autumn", 4);
  assert.equal(plan.route.length, 4);
  const regionsVisited = new Set(plan.route.map((d) => d.region));
  assert.equal(regionsVisited.size, 2, "both regions appear in the route");
});

test("planTrip picks the cheapest transport leg per region", () => {
  const plan = planTrip(["sylhet"], "autumn", 2);
  // Sylhet's cheapest is the train at 600 taka.
  assert.equal(plan.transport[0].mode, "Train");
  assert.equal(plan.transport[0].fare, 600);
});

test("planTrip flags when a region is out of season", () => {
  const plan = planTrip(["sundarbans"], "monsoon", 2);
  assert.ok(plan.seasonWarnings.some((w) => w.includes("Sundarbans")), "warns the Sundarbans is not in season in monsoon");
});

test("planTrip gives no warning when the region is in season", () => {
  const plan = planTrip(["sundarbans"], "winter", 2);
  assert.equal(plan.seasonWarnings.length, 0);
});

test("planTrip suggests nearby regions it did not include", () => {
  const plan = planTrip(["dhaka"], "winter", 2);
  assert.ok(plan.nearby.length > 0, "offers more to see");
  assert.ok(!plan.nearby.includes("dhaka"), "does not suggest the chosen region");
});

test("planTrip ignores an unknown region id without throwing", () => {
  const plan = planTrip(["dhaka", "atlantis"], "winter", 2);
  assert.ok(plan.route.length === 2);
});

test("planTrip with no valid region returns an empty, safe plan", () => {
  const plan = planTrip(["atlantis"], "winter", 3);
  assert.equal(plan.totalUsd, 0);
  assert.equal(plan.route.length, 0);
});

test("cheapestTransport returns the lowest-fare leg", () => {
  const sylhet = REGIONS.find((r) => r.id === "sylhet")!;
  assert.equal(cheapestTransport(sylhet)?.mode, "Train");
});
