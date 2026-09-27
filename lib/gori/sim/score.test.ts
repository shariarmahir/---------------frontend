import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultConfig, simulate } from "./engine.ts";
import { diagnose, explainChange, turnReport } from "./report.ts";
import { CATEGORIES, PENALTY_RULES, scoreRun, weightsFor } from "./score.ts";
import type { Plan } from "./types.ts";

const plan: Plan = [
  [
    { type: "launch", id: "stock", scale: "full" },
    { type: "launch", id: "chw", scale: "pilot" },
  ],
  [{ type: "launch", id: "roster", scale: "pilot" }],
  [{ type: "scale", id: "chw" }],
  [{ type: "launch", id: "grievance", scale: "full" }],
];

test("every category is scored 0–100 and the total follows the formula", () => {
  const s = scoreRun(simulate(defaultConfig({ seed: "score-1" }), plan));
  for (const c of CATEGORIES) assert.ok(s.categories[c.id] >= 0 && s.categories[c.id] <= 100, c.id);
  assert.equal(s.total, Math.round(Math.max(0, Math.min(100, s.weighted - s.penaltyTotal))));
});

test("a strategy profile doubles its focus category's weight and nothing else", () => {
  const w = weightsFor("equity");
  assert.equal(w.equity, 2);
  assert.equal(Object.values(w).reduce((a, b) => a + b, 0), CATEGORIES.length + 1);
  assert.equal(weightsFor("balanced").equity, 1);
});

test("piloting and measuring raise the evidence score", () => {
  const careful = scoreRun(simulate(defaultConfig({ events: "off" }), plan)).categories.evidence;
  const rushed = scoreRun(simulate(defaultConfig({ events: "off" }), [[{ type: "launch", id: "roster", scale: "full" }]])).categories.evidence;
  assert.ok(careful > rushed);
});

test("penalties are itemised and capped", () => {
  const messy: Plan = [
    [
      { type: "launch", id: "telemed", scale: "full" },
      { type: "launch", id: "card", scale: "full" },
      { type: "launch", id: "roster", scale: "full" },
    ],
    [{ type: "stop", id: "roster" }],
  ];
  const s = scoreRun(simulate(defaultConfig({ events: "off" }), messy));
  const ids = s.penalties.map((p) => p.id);
  assert.ok(ids.includes("rejected") && ids.includes("abandoned"));
  assert.ok(s.penaltyTotal <= PENALTY_RULES.cap);
});

test("explanations name their causes and add up", () => {
  const run = simulate(defaultConfig({ seed: "explain" }), plan);
  const e = explainChange(run, 3, "staff");
  assert.ok(e.parts.length > 0);
  assert.ok(Math.abs(e.parts.reduce((s, p) => s + p.amount, 0) - e.delta) < 0.2);
  assert.match(e.sentence, /কর্মী উপস্থিতি/);
});

test("the turn report covers every required section", () => {
  const run = simulate(defaultConfig({ seed: "report" }), plan);
  const r = turnReport(run, 2);
  for (const k of ["changes", "costs", "benefits", "sideEffects", "assumptions", "uncertainty", "dependencies", "maintenance", "questions"] as const) assert.ok(k in r, k);
  assert.ok(r.questions.length >= 1);
  assert.ok(["low", "medium", "high"].includes(r.uncertainty.level));
});

test("a weak plan gets concrete lessons", () => {
  const run = simulate(defaultConfig({ seed: "diag", budget: "low" }), [[{ type: "launch", id: "telemed", scale: "full" }, { type: "launch", id: "roster", scale: "full" }]]);
  const d = diagnose(run);
  assert.ok(d.some((x) => x.kind === "dependency"));
  assert.ok(d.some((x) => x.kind === "alternative" || x.kind === "assumption"));
});

test("generated sentences use Bangla digits", async () => {
  const { bnDigits } = await import("./report.ts");
  assert.equal(bnDigits("+12.5"), "+১২.৫");
  const run = simulate(defaultConfig({ seed: "digits" }), plan);
  const e = explainChange(run, 3, "staff");
  assert.ok(!/[0-9]/.test(e.sentence), e.sentence);
});
