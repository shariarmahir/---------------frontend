import { test } from "node:test";
import assert from "node:assert/strict";
import { healthAccess } from "../../../data/gori/scenarios/health-access.ts";
import { bandsAt, defaultConfig, launchBlock, presetFor, RULES, simulate, stateAt, startingVars } from "./engine.ts";
import { configSchema, planSchema, type Plan } from "./types.ts";

const calm = defaultConfig({ events: "off" });
const goodPlan: Plan = [
  [
    { type: "launch", id: "stock", scale: "full" },
    { type: "launch", id: "chw", scale: "pilot" },
  ],
  [{ type: "launch", id: "roster", scale: "pilot" }],
  [{ type: "scale", id: "chw" }],
  [{ type: "launch", id: "grievance", scale: "full" }],
];

test("the same inputs always give the same run", () => {
  const c = defaultConfig({ seed: "k7m-2qx" });
  assert.deepEqual(simulate(c, goodPlan), simulate(c, goodPlan));
});

test("with no actions and no events, nothing moves", () => {
  const run = simulate(calm, []);
  assert.equal(run.turns.length, calm.horizon);
  for (const t of run.turns) for (const d of Object.values(t.delta)) assert.equal(d, 0);
});

test("every change splits exactly into its named contributions", () => {
  const run = simulate(defaultConfig({ seed: "sum-check", events: "high" }), goodPlan);
  for (const t of run.turns) {
    for (const [v, d] of Object.entries(t.delta)) {
      const sum = t.contributions[v].reduce((s, c) => s + c.amount, 0);
      assert.ok(Math.abs(sum - d) < 0.1, `turn ${t.turn} ${v}: ${sum} vs ${d}`);
    }
  }
});

test("launch costs come out of the budget; a pilot costs 40%", () => {
  const run = simulate(calm, [[{ type: "launch", id: "roster", scale: "pilot" }]]);
  const t0 = run.turns[0];
  assert.equal(t0.actions[0].ok, true);
  assert.equal(t0.upfront, 30 * RULES.pilotCostShare);
  assert.equal(t0.budgetEnd, Math.round((run.start.budget - 12 + t0.income - t0.upkeepPaid) * 100) / 100);
});

test("dependencies are enforced with a reason", () => {
  const run = simulate(calm, [[{ type: "launch", id: "telemed", scale: "full" }, { type: "launch", id: "card", scale: "full" }]]);
  const [tele, card] = run.turns[0].actions;
  assert.equal(tele.ok, false);
  assert.match(tele.reason!, /সোলার/);
  assert.equal(card.ok, false);
  assert.match(card.reason!, /তথ্যের মান/);
  const state = stateAt(run, 1);
  assert.equal(launchBlock(healthAccess, { ...state, active: [] }, "telemed", "pilot"), healthAccess.interventions.find((i) => i.id === "telemed")!.requires!.note);
});

test("you cannot spend money you do not have", () => {
  const run = simulate(defaultConfig({ events: "off", budget: "low" }), [
    [
      { type: "launch", id: "roster", scale: "full" },
      { type: "launch", id: "voucher", scale: "full" },
    ],
  ]);
  assert.equal(run.turns[0].actions[1].ok, false);
  assert.match(run.turns[0].actions[1].reason!, /বাজেট/);
});

test("unpaid upkeep wears interventions down", () => {
  const plan: Plan = [
    [
      { type: "launch", id: "roster", scale: "full" },
      { type: "launch", id: "chw", scale: "full" },
    ],
    [{ type: "launch", id: "voucher", scale: "full" }],
  ];
  const run = simulate(defaultConfig({ events: "off", budget: "low", horizon: 8 }), plan);
  const last = run.turns.at(-1)!;
  assert.ok(last.upkeepPaid < last.upkeepDue, "short of money by the end");
  assert.ok(last.active.every((a) => a.maintenance < 1));
});

test("two strategies on one seed face the same random events", () => {
  const c = defaultConfig({ seed: "same-weather", events: "high", horizon: 12 });
  const a = simulate(c, []);
  const b = simulate(c, [[{ type: "launch", id: "grievance", scale: "full" }]]);
  const random = new Set(healthAccess.events.filter((e) => e.trigger.kind === "random").map((e) => e.id));
  const ids = (r: typeof a) => r.turns.map((t) => t.events.filter((e) => random.has(e.id)).map((e) => e.id).join(","));
  assert.deepEqual(ids(a), ids(b));
});

test("crisis mode brings the flood in turn 2", () => {
  const run = simulate(presetFor("crisis", "crisis-1"), []);
  assert.ok(run.turns[1].events.some((e) => e.id === "flood"));
});

test("a piloted intervention scales without rollout risk", () => {
  const run = simulate(calm, [[{ type: "launch", id: "stock", scale: "pilot" }], [{ type: "scale", id: "stock" }]]);
  const a = run.turns[1].active.find((x) => x.id === "stock")!;
  assert.equal(a.scale, "full");
  assert.equal(a.rolloutPenalty, 0);
});

test("a sensible plan beats doing nothing on the outcome index", () => {
  const nothing = simulate(calm, []);
  const plan = simulate(calm, goodPlan);
  assert.ok(plan.turns.at(-1)!.outcomeIndex > nothing.turns.at(-1)!.outcomeIndex + 2);
});

test("health workers plus telemedicine lift equity through the interaction", () => {
  const plan: Plan = [
    [
      { type: "launch", id: "solar", scale: "full" },
      { type: "launch", id: "chw", scale: "full" },
    ],
    [{ type: "launch", id: "telemed", scale: "full" }],
  ];
  const run = simulate(defaultConfig({ events: "off", budget: "high" }), plan);
  assert.ok(run.turns.some((t) => t.contributions.equity.some((c) => c.ref === "telemed+chw" && c.amount > 0)));
});

test("stopping ends an intervention's direct effect", () => {
  const run = simulate(calm, [[{ type: "launch", id: "stock", scale: "full" }], [], [], [{ type: "stop", id: "stock" }]]);
  assert.ok(!run.turns[3].active.some((a) => a.id === "stock"));
  assert.ok(!run.turns[3].contributions.meds.some((c) => c.kind === "intervention"));
});

test("yearly turns run and move faster per turn", () => {
  const c = presetFor("future", "future-1");
  const run = simulate({ ...c, events: "off" }, goodPlan);
  assert.equal(run.turns.length, 9);
  const q = simulate(calm, goodPlan);
  assert.ok(Math.abs(run.turns[3].vars.meds - run.start.vars.meds) > Math.abs(q.turns[1].vars.meds - q.start.vars.meds));
});

test("context and evidence settings shift the start", () => {
  const sc = healthAccess;
  assert.ok(startingVars(sc, defaultConfig({ context: "char" })).access < startingVars(sc, defaultConfig()).access);
  assert.ok(startingVars(sc, defaultConfig({ evidence: "low" })).data < startingVars(sc, defaultConfig()).data);
});

test("uncertainty bands are ordered", () => {
  const b = bandsAt(defaultConfig({ seed: "band" }), goodPlan, 5, 12);
  for (const x of Object.values(b)) assert.ok(x.p10 <= x.p50 && x.p50 <= x.p90);
});

test("input schemas accept the defaults and reject bad input", () => {
  assert.ok(configSchema.safeParse(defaultConfig()).success);
  assert.ok(!configSchema.safeParse({ ...defaultConfig(), horizon: 99 }).success);
  assert.ok(!configSchema.safeParse({ ...defaultConfig(), seed: "<script>" }).success);
  assert.ok(planSchema.safeParse(goodPlan).success);
  assert.ok(!planSchema.safeParse([[{ type: "fund", id: "stock", level: 9 }]]).success);
});

test("the draft preview agrees with what the turn actually does", async () => {
  const { previewDraft } = await import("./engine.ts");
  const c = defaultConfig({ seed: "preview", budget: "low" });
  const draft: Plan[number] = [
    { type: "launch", id: "solar", scale: "full" },
    { type: "launch", id: "telemed", scale: "pilot" },
    { type: "launch", id: "roster", scale: "full" },
    { type: "fund", id: "solar", level: 1.25 },
  ];
  const run = simulate(c, [draft], { turns: 1 });
  const pre = previewDraft(healthAccess, stateAt(simulate(c, [], { turns: 0 }), 0), draft);
  assert.deepEqual(pre.results.map((r) => [r.ok, r.cost]), run.turns[0].actions.map((r) => [r.ok, r.cost]));
});
