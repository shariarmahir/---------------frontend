import { test } from "node:test";
import assert from "node:assert/strict";
import { STEPS, doneSteps, fitScore, frontierOf, stepOfPath } from "./journey.ts";

test("nine steps in three phases, in the university's order", () => {
  assert.deepEqual(
    STEPS.map((s) => s.id),
    ["find", "academy", "dept", "course", "admit", "routine", "class", "exam", "graduate"],
  );
  assert.deepEqual([...new Set(STEPS.map((s) => s.phase))], ["choose", "admit", "study"]);
  assert.deepEqual(STEPS.map((s) => s.n), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("every academy page sits on its step; teaching pages on none", () => {
  const at = (p: string) => stepOfPath(p);
  assert.equal(at("/media/academy"), "find");
  assert.equal(at("/media/academy/a/sorobingsho"), "academy");
  assert.equal(at("/media/academy/departments"), "dept");
  assert.equal(at("/media/academy/courses"), "course");
  assert.equal(at("/media/academy/dept/web-ai"), "dept");
  assert.equal(at("/media/academy/course/WEB-101"), "course");
  assert.equal(at("/media/academy/checkout"), "admit");
  assert.equal(at("/media/academy/routine"), "routine");
  assert.equal(at("/media/academy/classroom"), "class");
  assert.equal(at("/media/academy/classroom/WEB-101/live"), "class");
  assert.equal(at("/media/academy/exam"), "exam");
  assert.equal(at("/media/academy/graduation"), "graduate");
  for (const p of ["/media/academy/classroom/open", "/media/academy/classroom/new", "/media/academy/teach", "/media/academy/panel", "/media/academy/videos", "/media"]) assert.equal(at(p), null, p);
});

test("how far the learner has come: from finding, to the routine once enrolled, to class, exam and graduation", () => {
  assert.equal(frontierOf([]), "find");
  assert.equal(frontierOf([{ attended: [] }]), "routine");
  assert.equal(frontierOf([{ attended: [1] }]), "class");
  assert.equal(frontierOf([{ attended: [1, 2], project: { title: "", link: "", summary: "", at: "" } }]), "exam");
  assert.equal(frontierOf([{ attended: [], interview: "2026-10-20T04:00:00Z" }]), "exam");
  assert.equal(frontierOf([{ attended: [] }], true), "graduate");
  // Every step before the frontier is done; the frontier itself is not.
  assert.deepEqual([...doneSteps("routine")], ["find", "academy", "dept", "course", "admit"]);
  assert.deepEqual([...doneSteps("find")], []);
});

test("the finder: the dream counts most, then what you like and where your talent lies", () => {
  const fit = { goals: ["business" as const, "home" as const], likes: ["food" as const], talents: ["hands" as const] };
  assert.equal(fitScore(fit, {}), 0);
  assert.equal(fitScore(fit, { goal: "business" }), 3);
  assert.equal(fitScore(fit, { goal: "business", like: "food", talent: "hands" }), 7);
  assert.equal(fitScore(fit, { goal: "job", like: "computers", talent: "mind" }), 0);
  assert.equal(fitScore(undefined, { goal: "job" }), 0);
});
