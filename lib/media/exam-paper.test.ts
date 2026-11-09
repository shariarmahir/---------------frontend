import { test } from "node:test";
import assert from "node:assert/strict";
import { canSeePaper, mcqTotal, questionProblem, scoreMcq, totalMarks, type ExamQuestion } from "./exam-paper.ts";

const qs: ExamQuestion[] = [
  { id: "1", kind: "mcq", q: "২ + ২ = ?", options: ["৩", "৪", "৫", "৬"], answer: 1, marks: 1 },
  { id: "2", kind: "mcq", q: "পানির সংকেত?", options: ["H2O", "CO2", "O2", "NaCl"], answer: 0, marks: 2 },
  { id: "3", kind: "written", q: "ওহমের সূত্র ব্যাখ্যা করো।", marks: 10 },
];

test("marks add up, and the MCQ part is marked here", () => {
  assert.equal(totalMarks(qs), 13);
  assert.equal(mcqTotal(qs), 3);
  assert.equal(scoreMcq(qs, [1, 0]), 3);
  assert.equal(scoreMcq(qs, [1, 3]), 1);
  assert.equal(scoreMcq(qs, []), 0);
});

test("a question is ready only when it is complete", () => {
  assert.equal(questionProblem(qs[0]), null);
  assert.equal(questionProblem(qs[2]), null);
  assert.ok(questionProblem({ ...qs[0], options: ["a", "", "c", "d"] }));
  assert.ok(questionProblem({ ...qs[0], answer: undefined }));
  assert.ok(questionProblem({ ...qs[2], marks: 0 }));
  assert.ok(questionProblem({ ...qs[2], q: " " }));
});

test("students see the paper only once it is released", () => {
  assert.equal(canSeePaper({ questions: qs }, true), true);
  assert.equal(canSeePaper({ questions: qs }, false), false);
  assert.equal(canSeePaper({ questions: qs, released: true }, false), true);
  assert.equal(canSeePaper(undefined, true), false);
});
