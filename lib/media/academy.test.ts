import { test } from "node:test";
import assert from "node:assert/strict";
import { certificateId, finalResult, interviewSlots, placement, progressOf, teacherPoints, teacherTier } from "./academy.ts";

test("admission places everyone; experience with proof fast-tracks", () => {
  assert.deepEqual(placement({ testPct: 20, years: 0, hasProof: false }), { level: "foundation", fastTrack: false });
  assert.equal(placement({ testPct: 50, years: 0, hasProof: false }).level, "intermediate");
  assert.equal(placement({ testPct: 10, years: 1, hasProof: false }).level, "intermediate");
  assert.equal(placement({ testPct: 60, years: 2, hasProof: false }).level, "advanced");
  assert.equal(placement({ testPct: 80, years: 0, hasProof: false }).level, "advanced");
  // Eighteen years at the garage and photos of the work: straight to the final.
  assert.deepEqual(placement({ testPct: 70, years: 18, hasProof: true }), { level: "advanced", fastTrack: true });
  assert.equal(placement({ testPct: 70, years: 18, hasProof: false }).fastTrack, false);
});

test("teacher points: interview, ratings, graduates, stories — complaints cost", () => {
  const t = { interview: { score: 90 }, rating: { avg: 4.8, count: 120 }, graduates: 64, stories: [{}, {}, {}], complaints: { upheld: 0 } };
  assert.deepEqual(teacherPoints(t as never), { interview: 36, rating: 29, graduates: 12, stories: 6, penalty: 0, total: 83 });
  assert.equal(teacherPoints({ ...t, rating: { avg: 0, count: 0 } } as never).rating, 0);
  assert.equal(teacherPoints({ ...t, complaints: { upheld: 2 } } as never).total, 63);
  assert.equal(teacherPoints({ ...t, graduates: 500, stories: Array(9).fill({}) } as never).total, 95);
  assert.equal(teacherTier(83, 0), "lead");
  assert.equal(teacherTier(63, 0), "skilled");
  assert.equal(teacherTier(40, 0), "new");
  assert.equal(teacherTier(95, 3), "review");
});

test("the final opens at 75% attendance, 80% homework and a project", () => {
  const course = {
    lessons: [1, 2, 3, 4, 5, 6, 7, 8].map((week) => ({ week, title: "", mode: "live" as const, homework: week % 2 === 0 ? "কাজ" : undefined })),
  };
  const none = progressOf(course, { attended: [], homework: {} });
  assert.deepEqual([none.needClasses, none.needHomework, none.homeworkSet, none.eligible], [6, 4, 4, false]);
  const most = progressOf(course, { attended: [1, 2, 3, 4, 5, 6, 6, 99], homework: { 2: "হ্যাঁ", 4: "হ্যাঁ", 6: "হ্যাঁ", 8: "  " } });
  assert.equal(most.attended, 6, "duplicates and unknown weeks don't count");
  assert.equal(most.needHomework, 1, "blank answers don't count");
  const done = progressOf(course, { attended: [1, 2, 3, 4, 5, 6], homework: { 2: "a", 4: "b", 6: "c", 8: "d" }, project: { title: "", link: "", summary: "", at: "" } });
  assert.equal(done.eligible, true);
});

test("two examiners within 20 marks are averaged; further apart, a third decides", () => {
  assert.deepEqual(finalResult([72, 80]), { average: 76, verdict: "pass" });
  assert.deepEqual(finalResult([85, 90]), { average: 88, verdict: "distinction" });
  assert.deepEqual(finalResult([50, 55]), { average: 53, verdict: "retake" });
  assert.equal(finalResult([40, 85]).verdict, "third-examiner");
  // The third (78) sits closer to 85, so 78 and 85 are averaged.
  assert.deepEqual(finalResult([40, 85, 78]), { average: 82, verdict: "distinction" });
  assert.throws(() => finalResult([70]));
});

test("interview slots: 10 am and 3 pm Dhaka, never on Friday", () => {
  // Thursday 24 Sep 2026: the next day is Friday, so slots start Saturday.
  const slots = interviewSlots(new Date("2026-09-24T12:00:00Z"), 4);
  assert.deepEqual(slots, ["2026-09-26T04:00:00.000Z", "2026-09-26T09:00:00.000Z", "2026-09-27T04:00:00.000Z", "2026-09-27T09:00:00.000Z"]);
  assert.ok(interviewSlots(new Date("2026-09-25T12:00:00Z"), 20).every((s) => new Date(s).getUTCDay() !== 5));
});

test("certificate IDs are stable and readable", () => {
  assert.equal(certificateId(2026, "MTR-101", 7), "KTA-2026-MTR101-0007");
});
