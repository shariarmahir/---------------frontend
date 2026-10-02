import { test } from "node:test";
import assert from "node:assert/strict";
import { NOTE_FILE_MAX, docTone, examAlert, fileTooBig, fitWithin, newJoinCode, nextExam, noteFileName, pointsOf, rank, recoveryPairs, scorePaper, syllabusProgress, validJoinCode } from "./classroom.ts";

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const today = day("2026-09-25");

test("syllabus progress counts finished topics, rounded down", () => {
  assert.equal(syllabusProgress([]), 0);
  assert.equal(syllabusProgress([{ done: true }, { done: false }, { done: false }]), 33);
  assert.equal(syllabusProgress([{ done: true }, { done: true }]), 100);
});

test("next exam skips past dates; alert tightens as it nears", () => {
  const exams = [
    { id: "a", date: "2026-09-20" },
    { id: "b", date: "2026-10-30" },
    { id: "c", date: "2026-09-28" },
  ];
  const next = nextExam(exams, today);
  assert.equal(next?.exam.id, "c");
  assert.equal(next?.days, 3);
  assert.equal(nextExam([{ id: "a", date: "2026-09-01" }], today), null);
  assert.equal(examAlert(0), "today");
  assert.equal(examAlert(3), "near");
  assert.equal(examAlert(7), "near");
  assert.equal(examAlert(8), "calm");
});

test("points reward sharing, solving and helping more than scoring", () => {
  assert.equal(pointsOf({ notes: 2, solved: 1, helped: 1, assess: 80 }), 2 * 5 + 10 + 8 + 8);
  const ranked = rank([
    { id: "x", name: "ক", stats: { notes: 0, solved: 0, helped: 0, assess: 95 } },
    { id: "y", name: "খ", stats: { notes: 3, solved: 2, helped: 2, assess: 60 } },
  ]);
  assert.deepEqual(ranked.map((r) => r.id), ["y", "x"]);
});

test("weak students get the strongest helper not already paired", () => {
  const members = [
    { id: "a", name: "A", stats: { notes: 0, solved: 0, helped: 0, assess: 35 } },
    { id: "b", name: "B", stats: { notes: 5, solved: 4, helped: 6, assess: 90 } },
    { id: "c", name: "C", stats: { notes: 0, solved: 1, helped: 0, assess: 48 } },
    { id: "d", name: "D", stats: { notes: 3, solved: 2, helped: 4, assess: 85 } },
  ];
  assert.deepEqual(recoveryPairs(members), [
    { weak: "a", buddy: "b" },
    { weak: "c", buddy: "d" },
  ]);
  assert.deepEqual(recoveryPairs(members.slice(1, 2)), []);
  // 0 means "not assessed yet", not "failing"
  assert.deepEqual(recoveryPairs([{ id: "n", name: "N", stats: { notes: 0, solved: 0, helped: 0, assess: 0 } }, members[1]]), []);
});

test("a paper is scored out of 100", () => {
  const qs = [{ answer: 0 }, { answer: 2 }, { answer: 1 }, { answer: 3 }];
  assert.equal(scorePaper(qs, [0, 2, 1, 3]), 100);
  assert.equal(scorePaper(qs, [0, 1, undefined, 3]), 50);
  assert.equal(scorePaper([], []), 0);
});

test("join codes are six letters or digits", () => {
  assert.equal(validJoinCode("cse22a"), "CSE22A");
  assert.equal(validJoinCode(" ssc-26 "), null);
  assert.equal(validJoinCode("ABC"), null);
});

test("scan tone pushes paper to white and ink to black", () => {
  assert.equal(docTone(250), 255);
  assert.equal(docTone(20), 0);
  assert.ok(docTone(140) > 140);
  assert.ok(docTone(90) < 90);
});

test("images shrink to fit the long side, never grow", () => {
  assert.deepEqual(fitWithin(4000, 3000, 1600), { width: 1600, height: 1200 });
  assert.deepEqual(fitWithin(900, 1800, 1600), { width: 800, height: 1600 });
  assert.deepEqual(fitWithin(800, 600, 1600), { width: 800, height: 600 });
});

test("download names keep Bangla, drop characters files cannot hold", () => {
  assert.equal(noteFileName("অধ্যায় ৯: সমাধান/নোট?", "pdf"), "অধ্যায় ৯ সমাধান নোট.pdf");
  assert.equal(noteFileName("   ", "txt"), "note.txt");
});

test("attachments over the limit are refused", () => {
  assert.equal(fileTooBig(NOTE_FILE_MAX), false);
  assert.equal(fileTooBig(NOTE_FILE_MAX + 1), true);
});

test("new join codes are valid six-character codes without look-alike letters", () => {
  let i = 0;
  const seq = [0, 0.99, 0.5, 0.25, 0.75, 0.1];
  const code = newJoinCode(() => seq[i++ % seq.length]);
  assert.equal(validJoinCode(code), code);
  assert.doesNotMatch(newJoinCode(), /[IO01]/);
});
