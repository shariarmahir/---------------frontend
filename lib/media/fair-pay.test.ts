import { test } from "node:test";
import assert from "node:assert/strict";
import { fairPayFloor, isFairPay, PAY_FLOOR } from "./fair-pay.ts";

const band = { low: 800, high: 2500, unit: "প্রতি ঘণ্টা" };

test("monthly and hourly pay have national floors", () => {
  assert.equal(fairPayFloor("month", band), PAY_FLOOR.month);
  assert.equal(fairPayFloor("hour", band), PAY_FLOOR.hour);
  assert.ok(isFairPay(18000, "month", band));
  assert.equal(isFairPay(8000, "month", band), false);
  assert.equal(isFairPay(100, "hour", band), false);
});

test("per-task pay follows the category's fair band", () => {
  assert.equal(fairPayFloor("task", band), 600);
  assert.ok(isFairPay(600, "task", band));
  assert.equal(isFairPay(599, "task", band), false);
});
