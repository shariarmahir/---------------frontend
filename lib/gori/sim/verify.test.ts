import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultConfig } from "./engine.ts";
import type { Plan } from "./types.ts";
import { runKeyOf, trimPlan, verifyRun } from "./verify.ts";

const plan: Plan = [[{ type: "launch", id: "stock", scale: "pilot" }], [], [{ type: "scale", id: "stock" }]];

test("run keys ignore trailing empty turns but nothing else", () => {
  const c = defaultConfig({ seed: "key-1" });
  assert.equal(runKeyOf(c, plan), runKeyOf(c, [...plan, [], []]));
  assert.notEqual(runKeyOf(c, plan), runKeyOf({ ...c, seed: "key-2" }, plan));
  assert.notEqual(runKeyOf(c, plan), runKeyOf(c, plan.slice(0, 1)));
  assert.deepEqual(trimPlan([[], []]), []);
});

test("verification replays the run to the same score", () => {
  const c = defaultConfig({ seed: "verify" });
  const a = verifyRun(c, plan, "balanced");
  const b = verifyRun(c, plan, "balanced");
  assert.deepEqual(a, b);
  assert.equal(a.complete, true);
  assert.ok(a.total >= 0 && a.total <= 100);
});
