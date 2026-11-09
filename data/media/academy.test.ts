import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { admissionQuestions, board, classVideos, courses, deptLikes, deptShort, deptsOfTeacher, teacherFollowers, videoComments, videoRating, departments, rosterOf, teacherRecords, workshops } from "./academy.ts";
import { people } from "./users.ts";
import { CLASS_MINUTES, SCHOOLS, academiesFrom, academyIssues, certificateId, courseIssues, courseTimeline, deptIssues, finalResult, freeClassDone } from "../../lib/media/academy.ts";

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
  }
  for (const t of teacherRecords) assert.ok(deptIds.has(t.dept), `${t.handle}: unknown department ${t.dept}`);
});

test("academy rules: academies with one or more departments, three courses, 40 days, batches of 5 or 15, papers and promo", () => {
  const list = academiesFrom(departments);
  assert.equal(new Set(list.map((a) => a.name)).size, list.length, "one name, one academy");
  for (const a of list) {
    assert.deepEqual(academyIssues(a), [], a.id);
    assert.ok(/^[a-z][a-z0-9-]+$/.test(a.id), `${a.id}: a plain address`);
    // Every department of an academy carries the very same name and about.
    for (const d of a.departments) assert.deepEqual([d.academy.name, d.academy.about], [a.name, a.about], d.id);
  }
  // The owner's example of a university with several departments.
  assert.deepEqual(list.find((a) => a.name === "ষড়বিংশ একাডেমি")!.departments.map((d) => d.id), ["web-ai", "mechatronics"]);
  for (const d of departments) {
    assert.ok(d.academy.about.length >= 20, `${d.id}: a line about the academy`);
    assert.deepEqual(deptIssues(d, courses.filter((c) => c.dept === d.id).length), [], d.id);
    assert.ok(d.fit && d.fit.goals.length && d.fit.likes.length && d.fit.talents.length, `${d.id}: finder tags`);
  }
  for (const c of courses) assert.deepEqual(courseIssues(c, departments.find((d) => d.id === c.dept)!), [], c.id);
  // The two the owner named: a team of four friends, and a solo music academy teaching electric guitar.
  const web = departments.find((d) => d.academy.name === "ষড়বিংশ একাডেমি")!;
  assert.equal(web.kind, "team");
  assert.equal(web.teachers.length, 4);
  const guitar = departments.find((d) => d.academy.name === "সাদমান বিন আহমেদ মিউজিক একাডেমি")!;
  assert.deepEqual([guitar.kind, guitar.name], ["solo", "মিউজিক"]);
  assert.ok(courses.some((c) => c.dept === guitar.id && c.title.includes("ইলেকট্রিক গিটার")));
});

test("academy: every online class is forty minutes, and every department has a short for its page", () => {
  for (const v of classVideos) if (!v.short) assert.equal(v.seconds, CLASS_MINUTES * 60, `${v.id}: a forty-minute class`);
  for (const d of departments) {
    const ids = new Set(courses.filter((c) => c.dept === d.id).map((c) => c.id));
    assert.ok(classVideos.some((v) => v.short && ids.has(v.course)), `${d.id}: a short`);
    assert.ok(ids.has(deptShort(d.id)?.course ?? ""), `${d.id}: its page links its own short`);
  }
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
    const day = new Date(s.at).toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });
    assert.notEqual(day, "Friday", `${s.id}: no panel sits on a Friday`);
    if (!s.marks) {
      assert.equal(s.certificate, undefined, `${s.id}: certificate before marks`);
      if (s.sealed !== undefined) assert.ok(s.sealed >= 0 && s.sealed <= 100, `${s.id}: sealed mark out of range`);
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

test("academy: every course has a full class list with unique names", () => {
  for (const c of courses) {
    const roster = rosterOf(c);
    assert.equal(roster.length, c.enrolled, c.id);
    assert.equal(new Set(roster.map((s) => s.name)).size, roster.length, `${c.id}: repeated name`);
    assert.equal(new Set(roster.map((s) => s.id)).size, roster.length, c.id);
  }
});

test("class videos belong to real lessons, and only মাহির and কামাল still owe this week's free class", () => {
  assert.equal(new Set(classVideos.map((v) => v.id)).size, classVideos.length, "unique ids");
  for (const v of classVideos) {
    const c = courses.find((x) => x.id === v.course);
    assert.ok(c, `${v.id}: course`);
    assert.equal(v.teacher, c.teacher, `${v.id}: the course's own teacher`);
    assert.ok(v.week >= 1 && v.week <= c.lessons.length, `${v.id}: a week of the course`);
    if (v.short) assert.ok(v.seconds < 60 && v.access === "free", `${v.id}: a short is free and under a minute`);
  }
  const now = "2026-09-25T12:00:00Z";
  // Only a running batch owes the weekly free class; one starting next month does not yet.
  const running = courses.filter((c) => c.starts <= now.slice(0, 10) && courseTimeline(c.starts).ends >= now.slice(0, 10));
  const owing = [...new Set(running.map((c) => c.teacher))].filter((t) => !freeClassDone(classVideos, t, now)).sort();
  assert.deepEqual(owing, ["kamal", "mahir"]);
});

test("comments sit under real classes, after them, and only the teacher pins", () => {
  const byId = new Map(classVideos.map((v) => [v.id, v]));
  const handles = new Set(people.map((p) => p.handle));
  assert.equal(new Set(videoComments.map((c) => c.id)).size, videoComments.length, "unique ids");
  for (const c of videoComments) {
    const v = byId.get(c.video);
    assert.ok(v, `${c.id}: video`);
    assert.ok(c.at > v.at, `${c.id}: written after the video went up`);
    assert.ok(c.handle ? handles.has(c.handle) : c.name, `${c.id}: a known writer`);
    if (c.pinned) assert.equal(c.handle, v.teacher, `${c.id}: pinned by the class's teacher`);
    if (c.parent) {
      const p = videoComments.find((x) => x.id === c.parent);
      assert.ok(p && p.video === c.video && !p.parent && c.at > p.at, `${c.id}: answers an earlier comment on the same class`);
    }
  }
  for (const v of classVideos) {
    const r = videoRating(v);
    assert.ok(r.avg >= 1 && r.avg <= 5 && r.count >= 1, `${v.id}: a rating`);
  }
});

test("every teacher has a channel: their departments, led ones first, and followers", () => {
  for (const t of teacherRecords) {
    const depts = deptsOfTeacher(t.handle);
    assert.ok(depts.some((d) => d.id === t.dept), `${t.handle}: their own department`);
    const led = depts.map((d) => d.teachers[0] === t.handle);
    assert.deepEqual(led, [...led].sort((a, b) => Number(b) - Number(a)), `${t.handle}: led departments first`);
    assert.ok(teacherFollowers(t.handle) >= t.graduates, `${t.handle}: graduates follow`);
  }
  assert.deepEqual(deptsOfTeacher("mahir").map((d) => d.id), ["mechatronics", "web-ai"], "leads mechatronics, teaches in web-ai");
  assert.deepEqual(deptsOfTeacher("rupa").map((d) => d.id), ["web-ai", "media"]);
});

test("every department says who it suits", () => {
  for (const d of departments) assert.ok(deptLikes[d.id]?.length > 10, `${d.id}: a line`);
  assert.deepEqual(Object.keys(deptLikes).sort(), departments.map((d) => d.id).sort(), "no line for a department that does not exist");
});
