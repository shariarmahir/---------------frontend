import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultConfig } from "./engine.ts";
import { runExperiment } from "./lab.ts";

test("an intervention that targets a variable is supported for it", () => {
  const r = runExperiment(defaultConfig({ seed: "lab-1", horizon: 8 }), { intervention: "stock", scale: "full", variable: "meds", direction: "up", trials: 20 });
  assert.equal(r.launchOk, true);
  assert.equal(r.verdict, "supported");
  assert.ok(r.diff.p10 > 0);
  assert.equal(r.series.length, 9);
});

test("predicting the wrong direction is refuted", () => {
  const r = runExperiment(defaultConfig({ seed: "lab-2" }), { intervention: "card", scale: "full", variable: "oop", direction: "up", trials: 10 });
  // card needs data ≥ 40, so at the default start it cannot launch: nothing changes.
  assert.equal(r.launchOk, false);
  assert.equal(r.verdict, "inconclusive");
  const s = runExperiment(defaultConfig({ seed: "lab-3", evidence: "high", context: "urban" }), { intervention: "voucher", scale: "full", variable: "access", direction: "down", trials: 10 });
  assert.equal(s.verdict, "refuted");
});

test("experiments are reproducible from their seed", () => {
  const c = defaultConfig({ seed: "lab-4" });
  const e = { intervention: "chw", scale: "pilot" as const, variable: "equity", direction: "up" as const, trials: 8 };
  assert.deepEqual(runExperiment(c, e), runExperiment(c, e));
});
