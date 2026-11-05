import assert from "node:assert/strict";
import { test } from "node:test";
import { LINKS, REGIONS, TOUR_PLANS } from "../data/motherland-trip.ts";
import { orderStops, parseAsk, pickLeg, planTrip, type TripRequest } from "./motherland-trip.ts";

const trip = (over: Partial<TripRequest>): TripRequest => ({ regions: ["sylhet"], month: 12, days: 4, prefer: "cheapest", style: "budget", ...over });

test("a plan adds up: stay, there and back", () => {
  const plan = planTrip(trip({}));
  assert.equal(plan.stayBdt, 4 * 3000);
  assert.equal(plan.travelBdt, 740 + 740);
  assert.equal(plan.totalBdt, plan.stayBdt + plan.travelBdt);
  assert.equal(plan.stops[0].days, 4);
});

test("each preference picks a different way to Sylhet", () => {
  const sylhet = REGIONS.find((r) => r.id === "sylhet")!;
  assert.equal(pickLeg(sylhet, "cheapest").mode, "Bus");
  assert.equal(pickLeg(sylhet, "easiest").mode, "Flight");
  assert.equal(pickLeg(sylhet, "fun").mode, "Train");
});

test("the Sundarbans is closed in the breeding months, and open in winter", () => {
  assert.ok(planTrip(trip({ regions: ["sundarbans"], month: 7 })).warnings.some((w) => w.level === "closed"));
  assert.ok(!planTrip(trip({ regions: ["sundarbans"], month: 1 })).warnings.some((w) => w.level === "closed"));
});

test("Saint Martin's follows its season", () => {
  assert.ok(planTrip(trip({ regions: ["st-martin"], month: 6 })).warnings.some((w) => w.level === "closed"));
  assert.ok(!planTrip(trip({ regions: ["st-martin"], month: 12 })).warnings.some((w) => w.level === "closed"));
});

test("the Hill Tracts always carry the permit note for foreign visitors", () => {
  assert.ok(planTrip(trip({ regions: ["bandarban"] })).warnings.some((w) => w.text.includes("permit")));
});

test("the route uses a neighbour link where it can, and goes through Dhaka where it cannot", () => {
  const near = planTrip(trip({ regions: ["srimangal", "sylhet"] }));
  assert.ok(near.legs.some((l) => l.from === "srimangal" && l.to === "sylhet"));
  const far = planTrip(trip({ regions: ["sylhet", "coxs-bazar"], days: 6 }));
  assert.ok(far.legs.some((l) => l.to === "dhaka" && l.from !== far.legs.at(-1)!.from));
});

test("the plan warns when the days cannot carry the journey, and when the budget is short", () => {
  assert.ok(planTrip(trip({ regions: ["coxs-bazar", "sylhet", "rajshahi"], days: 2 })).warnings.length > 0);
  assert.ok(planTrip(trip({ budgetBdt: 1000 })).overBudgetBy > 0);
  assert.equal(planTrip(trip({ budgetBdt: 1_000_000 })).overBudgetBy, 0);
});

test("a stay longer than the usual visit gets a note", () => {
  assert.ok(planTrip(trip({ regions: ["sundarbans"], month: 1, days: 7 })).warnings.some((w) => w.text.includes("most visits")));
  assert.ok(!planTrip(trip({ regions: ["sundarbans"], month: 1, days: 3 })).warnings.some((w) => w.text.includes("most visits")));
});

test("no place gives an empty plan and does not throw", () => {
  const plan = planTrip(trip({ regions: ["atlantis"] }));
  assert.equal(plan.stops.length, 0);
  assert.equal(plan.totalBdt, 0);
});

test("the stops run in a sensible order, starting nearest Dhaka", () => {
  assert.deepEqual(orderStops(["st-martin", "coxs-bazar"]).map((r) => r.id), ["coxs-bazar", "st-martin"]);
});

test("a plain question is understood", () => {
  const p = parseAsk("5 days in Sylhet and Srimangal in July under 20000 taka, easiest road");
  assert.deepEqual(p.regions, ["sylhet", "srimangal"]);
  assert.equal(p.days, 5);
  assert.equal(p.month, 7);
  assert.equal(p.budgetBdt, 20000);
  assert.equal(p.prefer, "easiest");
});

test("dollars, weeks, seasons and word numbers are understood", () => {
  const p = parseAsk("two weeks seeing tigers in winter for $500, most scenic");
  assert.deepEqual(p.regions, ["sundarbans"]);
  assert.equal(p.days, 14);
  assert.equal(p.month, 1);
  assert.equal(p.budgetBdt, 61250);
  assert.equal(p.prefer, "fun");
  assert.equal(parseAsk("three days").days, 3);
  assert.equal(parseAsk("trip with 15k taka").budgetBdt, 15000);
});

test("an unrelated question finds nothing and asks nothing of the planner", () => {
  assert.deepEqual(parseAsk("hello").regions, []);
  assert.equal(parseAsk("hello").days, null);
});

test("every region has what the planner needs, and every link and ready-made plan names real places", () => {
  const ids = new Set(REGIONS.map((r) => r.id));
  for (const r of REGIONS) {
    assert.ok(r.legs.length && r.sights.length && r.notes.length, r.id);
    assert.ok(r.dayBudget > 0 && r.dayComfort > r.dayBudget, r.id);
    for (const n of r.nearby) assert.ok(ids.has(n), `${r.id} nearby ${n}`);
    for (const kind of ["cheapest", "easiest", "fun"] as const) assert.ok(pickLeg(r, kind), `${r.id} ${kind}`);
  }
  for (const key of Object.keys(LINKS)) for (const id of key.split("|")) assert.ok(ids.has(id), key);
  for (const t of TOUR_PLANS) for (const id of t.regions) assert.ok(ids.has(id), t.id);
});
