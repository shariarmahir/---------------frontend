import { test } from "node:test";
import assert from "node:assert/strict";
import { countdown, daysUntil, dueAt, handIns, nextDue, nextLab, nextNo, reportState, reportTally, type Experiment } from "./lab.ts";

// Friday 25 September 2026, 18:00 in Bangladesh.
const now = new Date("2026-09-25T12:00:00Z");
const exp = (no: number, date: string, due: string, subs: Experiment["submissions"] = []): Experiment => ({ id: `e${no}`, no, title: `Exp ${no}`, topic: "", date, due, questions: [], submissions: subs });

test("deadlines are Bangladesh time, and days count from the local date", () => {
  assert.equal(new Date(dueAt("2026-09-25T23:59")).toISOString(), "2026-09-25T17:59:00.000Z");
  assert.equal(daysUntil("2026-09-25", now), 0);
  assert.equal(daysUntil("2026-09-28", now), 3);
  // 01:00 on the 26th in Dhaka is still "the 26th", even though UTC says the 25th.
  assert.equal(daysUntil("2026-09-26", new Date("2026-09-25T19:00:00Z")), 0);
});

test("the next lab is the soonest one not yet past", () => {
  const list = [exp(1, "2026-09-20", "2026-09-24T23:59"), exp(3, "2026-10-04", "2026-10-08T23:59"), exp(2, "2026-09-28", "2026-10-01T23:59")];
  assert.equal(nextLab(list, now)?.exp.no, 2);
  assert.equal(nextLab(list, now)?.days, 3);
  assert.equal(nextLab([exp(1, "2026-09-20", "2026-09-24T23:59")], now), null);
});

test("the next report owed skips ones handed in and ones already past", () => {
  const list = [
    exp(1, "2026-09-18", "2026-09-24T23:59"),
    exp(2, "2026-09-21", "2026-09-26T23:59", [{ id: "s", by: "me", kind: "report", at: "2026-09-25T03:00:00Z" }]),
    exp(3, "2026-09-24", "2026-09-27T23:59"),
  ];
  const due = nextDue(list, "me", now);
  assert.equal(due?.exp.no, 3);
  assert.equal(Math.round(due!.hours), 54);
  assert.deepEqual(countdown(due!.hours), { days: 2, hours: 5 });
});

test("report state: on time, late, missing, due soon, open", () => {
  const e = exp(1, "2026-09-20", "2026-09-24T23:59");
  assert.equal(reportState({ ...e, submissions: [{ id: "a", by: "me", kind: "report", at: "2026-09-24T10:00:00Z" }] }, "me", now), "submitted");
  assert.equal(reportState({ ...e, submissions: [{ id: "a", by: "me", kind: "report", at: "2026-09-25T10:00:00Z" }] }, "me", now), "late");
  assert.equal(reportState(e, "me", now), "missing");
  assert.equal(reportState(exp(2, "2026-09-24", "2026-09-26T23:59"), "me", now), "due-soon");
  assert.equal(reportState(exp(3, "2026-10-01", "2026-10-05T23:59"), "me", now), "open");
  assert.equal(reportState({ ...e, submissions: [{ id: "a", by: "me", kind: "done", at: "2026-09-20T10:00:00Z" }] }, "me", now), "missing", "a task photo is not the report");
});

test("tally, hand-ins and numbering", () => {
  const list = [
    exp(1, "2026-09-10", "2026-09-14T23:59", [{ id: "a", by: "me", kind: "report", at: "2026-09-13T00:00:00Z" }]),
    exp(2, "2026-09-17", "2026-09-21T23:59"),
    exp(4, "2026-10-01", "2026-10-05T23:59"),
  ];
  assert.deepEqual(reportTally(list, "me", now), { done: 1, owed: 2 });
  const withSubs = { ...list[0], submissions: [...list[0].submissions, { id: "b", by: "x", kind: "done" as const, at: "" }, { id: "c", by: "gone", kind: "report" as const, at: "" }] };
  assert.deepEqual(handIns(withSubs, [{ id: "me", name: "" }, { id: "x", name: "" }]), { report: 1, done: 1, of: 2 });
  assert.equal(nextNo(list), 5);
  assert.equal(nextNo([]), 1);
});
