import { test } from "node:test";
import assert from "node:assert/strict";
import { basePoints, crimePoints, earnsIronMan, earnsQuickSilver, fineAllowed, lutherKing, nextRank, rankFor, seasonOf, splitTeamPoints, taskPoints, timingFactor, weekStart } from "./scoring.ts";
import type { Case, Task } from "./types.ts";

const task = (x: Partial<Task>): Task => ({
  id: "t",
  code: "KT-0001",
  title: "",
  brief: "",
  kind: "work",
  priority: "today",
  risk: "low",
  skills: [],
  mode: "solo",
  createdBy: "p-mahir",
  createdAt: "2026-10-01T00:00:00.000Z",
  due: "2026-10-10T12:00:00.000Z",
  estimateHours: 4,
  status: "done",
  milestones: [],
  notebook: [],
  fileIds: [],
  sharedWith: [],
  merits: [],
  ...x,
});

test("a ticket's worth follows priority, risk and size", () => {
  assert.equal(basePoints({ priority: "today", risk: "low", estimateHours: 4 }), 20);
  assert.equal(basePoints({ priority: "immediate", risk: "high", estimateHours: 4 }), 60);
  assert.ok(basePoints({ priority: "today", risk: "low", estimateHours: 40 }) > 20);
});

test("early pays up to 30%, late costs 15% a day down to −60%", () => {
  const due = "2026-10-10T12:00:00.000Z";
  assert.equal(timingFactor("2026-10-08T11:00:00.000Z", due), 1.2);
  assert.equal(timingFactor("2026-10-01T00:00:00.000Z", due), 1.3);
  assert.equal(timingFactor("2026-10-10T12:30:00.000Z", due), 1);
  assert.equal(timingFactor("2026-10-11T13:00:00.000Z", due), 0.7);
  assert.equal(timingFactor("2026-10-30T00:00:00.000Z", due), 0.4);
});

test("final points add the merits", () => {
  const t = task({ submittedAt: "2026-10-10T10:00:00.000Z", review: { by: "p-mahir", score: 5, accuracy: 5, at: "" }, merits: [{ kind: "kindness", points: 10, to: "p-mehek", by: "p-mahir", at: "" }] });
  assert.equal(taskPoints(t), 30);
});

test("a team's points: 10% to the leader, the rest shared", () => {
  assert.deepEqual(splitTeamPoints(100, "a", ["b", "c"]), { a: 40, b: 30, c: 30 });
});

test("Quick Silver is a hat-trick of early submissions, once per run", () => {
  const early = (id: string, at: string) => task({ id, takenBy: "p", submittedAt: at, due: "2026-10-20T12:00:00.000Z" });
  const three = [early("1", "2026-10-15T00:00:00.000Z"), early("2", "2026-10-16T00:00:00.000Z"), early("3", "2026-10-17T00:00:00.000Z")];
  assert.equal(earnsQuickSilver("p", three, []), true);
  assert.equal(earnsQuickSilver("p", three, [{ id: "b", personId: "p", kind: "quick-silver", day: "2026-10-17", taskId: "3" }]), false);
  const late = task({ id: "4", takenBy: "p", submittedAt: "2026-10-21T00:00:00.000Z", due: "2026-10-20T12:00:00.000Z" });
  assert.equal(earnsQuickSilver("p", [...three, late], []), false);
  assert.equal(earnsIronMan({ teamId: "tm", clientReview: { score: 4.5, at: "" } }), true);
  assert.equal(earnsIronMan({ clientReview: { score: 5, at: "" } }), false);
});

test("seasons are half-years and ranks fall at most one step", () => {
  assert.deepEqual(seasonOf("2026-10-21").id, "2026-H2");
  assert.equal(rankFor(0).id, "nobish");
  assert.equal(rankFor(820).id, "kandari");
  assert.equal(nextRank("maha", 100), "kandari");
  assert.equal(nextRank("majhi", 900), "kandari");
});

test("Luther King is the week's clear leader in crime points", () => {
  const c = (id: string, who: string, at: string, art = "a1"): Case => ({ id, articleId: art, accusedId: who, byId: "x", at, evidence: "", fileIds: [], status: "decided", verdict: { guilty: true, by: "p-mahir", at, note: "" } });
  const pts = { a1: 5, a2: 2 };
  const cases = [c("1", "ishtiak", "2026-10-19T06:00:00.000Z"), c("2", "ishtiak", "2026-10-20T06:00:00.000Z"), c("3", "mehek", "2026-10-20T06:00:00.000Z", "a2")];
  assert.equal(weekStart("2026-10-21"), "2026-10-17");
  assert.deepEqual(crimePoints(cases, pts, "2026-10-17", "2026-10-23"), { ishtiak: 10, mehek: 2 });
  assert.equal(lutherKing(cases, pts, "2026-10-21"), "ishtiak");
  assert.equal(lutherKing([c("1", "a", "2026-10-19T06:00:00.000Z"), c("2", "b", "2026-10-19T06:00:00.000Z")], pts, "2026-10-21"), null);
});

test("fines stop at a tenth of the month's wage", () => {
  assert.equal(fineAllowed(500, 30000, 0), 500);
  assert.equal(fineAllowed(5000, 30000, 1000), 2000);
  assert.equal(fineAllowed(500, undefined, 0), 0);
});
