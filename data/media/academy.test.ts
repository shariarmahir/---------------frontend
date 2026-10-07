import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { admissionQuestions, board, courses, departments, teacherRecords, workshops } from "./academy.ts";
import { people } from "./users.ts";
import { SCHOOLS, certificateId, finalResult } from "../../lib/media/academy.ts";

const handles = new Set(people.map((p) => p.handle));
const deptIds = new Set(departments.map((d) => d.id));
const courseIds = new Set(courses.map((c) => c.id));
const recordFor = new Map(teacherRecords.map((t) => [t.handle, t]));

test("academy: every teacher is a member with an interview record, in their department", () => {
  for (const d of departments) {
    assert.ok(d.teachers.length > 0, d.id);
    for (const h of d.teachers) {
      assert.ok(handles.has(h), `${d.id}: unknown member ${h}`);
      assert.ok(recordFor.has(h), `${d.id}: ${h} has no interview record`);
    }
    if (d.kind === "workshop") assert.ok(d.place, `${d.id}: a workshop needs a real place`);
  }
  for (const t of teacherRecords) assert.ok(deptIds.has(t.dept), `${t.handle}: unknown department ${t.dept}`);
});

test("academy: courses and workshops point at real departments, teachers and images", () => {
  for (const c of [...courses, ...workshops]) {
    const teacher = "teacher" in c ? c.teacher : c.host;
    assert.ok(deptIds.has(c.dept), `${c.id}: unknown department`);
    assert.ok(departments.find((d) => d.id === c.dept)!.teachers.includes(teacher), `${c.id}: ${teacher} does not teach in ${c.dept}`);
    assert.ok(existsSync(`public${c.image}`), `${c.id}: missing image ${c.image}`);
    assert.ok(c.fee >= 0 && c.seats > 0, c.id);
  }
  for (const c of courses) {
    assert.ok(c.enrolled <= c.seats, `${c.id}: more enrolled than seats`);
    assert.equal(new Set(c.lessons.map((l) => l.week)).size, c.lessons.length, `${c.id}: repeated week`);
    assert.ok(c.lessons.every((l) => l.week >= 1 && l.week <= c.weeks), `${c.id}: a lesson outside the course weeks`);
    assert.notEqual(c.lessons.find((l) => l.week === 1)?.mode, "hands-on", `${c.id}: the first class is always online`);
  }
  for (const w of workshops) assert.ok(w.taken <= w.seats, w.id);
});

test("academy: the board shows only upcoming seats and passes, with matching certificates", () => {
  for (const s of board) {
    assert.ok(courseIds.has(s.course), `${s.id}: unknown course`);
    if (!s.marks) {
      assert.equal(s.certificate, undefined, `${s.id}: certificate before marks`);
      continue;
    }
    const { verdict } = finalResult(s.marks);
    assert.ok(verdict === "pass" || verdict === "distinction", `${s.id}: a retake must not be public`);
    const [, year, code, serial] = s.certificate!.match(/^KTA-(\d{4})-([A-Z0-9]+)-(\d{4})$/) ?? [];
    assert.equal(certificateId(Number(year), s.course, Number(serial)), s.certificate, `${s.id}: certificate does not match its course`);
    assert.equal(code, s.course.replace("-", ""));
  }
});

test("academy: four admission questions per school, each with a valid answer", () => {
  for (const school of Object.keys(SCHOOLS) as (keyof typeof SCHOOLS)[]) {
    const qs = admissionQuestions[school];
    assert.equal(qs.length, 4, school);
    for (const q of qs) assert.ok(q.options.length === 4 && q.answer >= 0 && q.answer < 4, q.q);
  }
});
