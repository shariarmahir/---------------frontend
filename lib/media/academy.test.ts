import { test } from "node:test";
import assert from "node:assert/strict";
import { BATCH_MAX, COURSE_DAYS, RUBRIC, attendanceOf, checkoutEnrol, courseIssues, courseTimeline, deptIssues, promoFits, canWatch, certificateId, draftCode, durationText, finalResult, freeClassDone, interviewSlots, latestAdmission, materialKindOf, normalizeAcademy, payoutOf, placement, progressOf, ratingWith, rubricTotal, starSpread, threadsOf, sizeParts, sortVideos, teacherPoints, teacherTier, weekOf, youtubeEmbed, type ClassVideo, type VideoComment } from "./academy.ts";

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

test("saved academies from before departments carry over", () => {
  const old = { admission: { dept: "motor", at: "2026-09-25T00:00:00Z" }, enrolled: { "MTR-201": { at: "", attended: [], homework: {} } } };
  const a = normalizeAcademy(old);
  assert.deepEqual(Object.keys(a.admissions), ["motor"]);
  assert.equal("admission" in a, false);
  assert.deepEqual(Object.keys(a.enrolled), ["MTR-201"]);
  assert.deepEqual([a.drafts, a.materials, a.attendance, a.marks], [[], {}, {}, {}]);
  assert.deepEqual(normalizeAcademy(null).admissions, {});
  assert.deepEqual(normalizeAcademy("junk").complaints, []);
  const two = { motor: { dept: "motor", at: "2026-09-01" }, kitchen: { dept: "kitchen", at: "2026-09-20" } };
  assert.equal(latestAdmission(two as never)?.dept, "kitchen");
  assert.equal(latestAdmission({}), undefined);
});

test("checkout enrols every course, joins its department if new, and empties those from the cart", () => {
  const kept = { dept: "kitchen", goal: "দোকান", years: 4, proof: "https://x", score: 90, level: "advanced" as const, fastTrack: true, at: "2026-09-01" };
  const before = { ...normalizeAcademy(null), admissions: { kitchen: kept }, cart: ["CHF-102", "WEB-101", "MTR-101"] };
  const courses = [
    { id: "CHF-102", dept: "kitchen", level: "intermediate" as const },
    { id: "WEB-101", dept: "web", level: "foundation" as const, batch: "WEB-101-B2" },
  ];
  const joining = { name: "মাহির", phone: "01712345678", district: "শেরপুর", goal: "ওয়েবসাইট বানাতে" };
  const a = checkoutEnrol(before, courses, joining, "2026-10-08T10:00:00.000Z");
  assert.deepEqual(Object.keys(a.enrolled).sort(), ["CHF-102", "WEB-101"]);
  assert.deepEqual(a.enrolled["WEB-101"], { at: "2026-10-08T10:00:00.000Z", attended: [], homework: {}, joining, batch: "WEB-101-B2" });
  assert.equal(a.enrolled["CHF-102"].batch, "CHF-102", "no batch chosen means the course's first batch, which carries its code");
  assert.equal(a.admissions.kitchen, kept, "an earlier admission, fast track and all, stays as it was");
  assert.deepEqual(a.admissions.web, { dept: "web", goal: "ওয়েবসাইট বানাতে", years: 0, proof: "", score: 0, level: "foundation", fastTrack: false, at: "2026-10-08T10:00:00.000Z" });
  assert.deepEqual(a.cart, ["MTR-101"]);
  assert.deepEqual(before.cart, ["CHF-102", "WEB-101", "MTR-101"], "the old state is not touched");
});

test("teaching: materials by file name, sizes, attendance and escrow release", () => {
  assert.deepEqual(["class1.MP4", "notes.pdf", "plan.xlsx", "slides.pptx", "data.json", "noext"].map(materialKindOf), ["video", "pdf", "sheet", "doc", "data", "data"]);
  assert.deepEqual(sizeParts(900), { value: 1, unit: "কেবি" });
  assert.deepEqual(sizeParts(1_258_291), { value: 1.2, unit: "এমবি" });
  const held = { 1: ["a", "b"], 2: ["a"], 3: ["a", "b"] };
  assert.deepEqual(attendanceOf(held, "b"), { present: 2, held: 3, rate: 2 / 3 });
  assert.equal(attendanceOf({}, "b").rate, 1, "nothing held yet is not an absence");
  const course = { fee: 3000, enrolled: 10, lessons: [1, 2, 3, 4].map((week) => ({ week, title: "", mode: "live" as const })) };
  assert.deepEqual(payoutOf(course, 1), { earn: 28500, released: 7125, waiting: 21375 });
  assert.equal(payoutOf(course, 9).released, 28500, "never more than all of it");
  assert.equal(payoutOf({ ...course, fee: 0 }, 2).earn, 0);
  assert.equal(draftCode("web-ai", ["WEB-101"]), "WEB-102");
  assert.equal(draftCode("৯৯", []), "NEW-101");
});

test("panel rubric adds to 100 and clamps each line", () => {
  assert.equal(RUBRIC.reduce((n, r) => n + r.max, 0), 100);
  assert.equal(rubricTotal([30, 25, 20, 15, 10]), 100);
  assert.equal(rubricTotal([40, -5, 10.4, 15]), 30 + 0 + 10 + 15);
  assert.equal(rubricTotal([]), 0);
});

test("class videos: the Saturday week, the free class owed, who may watch, safe embeds", () => {
  // Friday 23:30 in Dhaka is still the week that began on Saturday the 19th; Saturday 00:30 starts the next.
  assert.equal(weekOf("2026-09-25T17:30:00Z"), "2026-09-19");
  assert.equal(weekOf("2026-09-25T18:30:00Z"), "2026-09-26");
  assert.equal(weekOf("2026-09-19T00:00:00Z"), "2026-09-19");

  const now = "2026-09-25T12:00:00Z";
  const v = (over: Partial<ClassVideo>): ClassVideo => ({ id: "x", course: "AI-201", teacher: "mahir", title: "t", week: 1, seconds: 600, access: "free", at: "2026-09-21T06:00:00Z", views: 0, ...over });
  assert.equal(freeClassDone([v({})], "mahir", now), true);
  assert.equal(freeClassDone([v({ at: "2026-09-14T06:00:00Z" })], "mahir", now), false, "last week's class is not this week's");
  assert.equal(freeClassDone([v({ access: "paid" })], "mahir", now), false, "a course video is not the free class");
  assert.equal(freeClassDone([v({ short: true, seconds: 40 })], "mahir", now), false, "a short is not a class");
  assert.equal(freeClassDone([v({ teacher: "anik" })], "mahir", now), false);
  assert.equal(freeClassDone([v({ at: "2026-10-07T06:00:00Z" })], "mahir", now), true, "made on this device after the demo's now");

  assert.equal(canWatch(v({}), {}), true);
  assert.equal(canWatch(v({ access: "paid" }), {}), false);
  assert.equal(canWatch(v({ access: "paid" }), { "AI-201": {} }), true);
  assert.equal(canWatch(v({ access: "paid" }), {}, "mahir"), true, "a teacher sees their own");

  const embed = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
  assert.equal(youtubeEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30"), embed);
  assert.equal(youtubeEmbed("https://youtu.be/dQw4w9WgXcQ"), embed);
  assert.equal(youtubeEmbed("https://m.youtube.com/shorts/dQw4w9WgXcQ"), embed);
  assert.equal(youtubeEmbed("http://youtu.be/dQw4w9WgXcQ"), null);
  assert.equal(youtubeEmbed("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(youtubeEmbed("https://youtu.be/not-an-id"), null);
  assert.equal(youtubeEmbed("javascript:alert(1)"), null);

  assert.equal(durationText(2480), "41:20");
  assert.equal(durationText(59), "0:59");
  assert.equal(durationText(3725), "1:02:05");
});

test("under a class: pinned first, replies in order, stars that add up", () => {
  const c = (id: string, over: Partial<VideoComment> = {}): VideoComment => ({ id, video: "v1", name: "ক", text: "ভালো", at: "2026-09-20T00:00:00Z", likes: 0, ...over });
  const all = [
    c("a", { likes: 5, at: "2026-09-20T00:00:00Z" }),
    c("b", { likes: 9, at: "2026-09-21T00:00:00Z" }),
    c("pin", { pinned: true, likes: 1, handle: "rahima" }),
    c("r2", { parent: "b", at: "2026-09-23T00:00:00Z" }),
    c("r1", { parent: "b", at: "2026-09-22T00:00:00Z" }),
    c("other", { video: "v2", likes: 99 }),
  ];
  assert.deepEqual(threadsOf(all, "v1", "top").map((t) => t.comment.id), ["pin", "b", "a"]);
  assert.deepEqual(threadsOf(all, "v1", "new").map((t) => t.comment.id), ["pin", "b", "a"]);
  assert.deepEqual(threadsOf([...all, c("n", { at: "2026-09-24T00:00:00Z" })], "v1", "new").map((t) => t.comment.id), ["pin", "n", "b", "a"]);
  assert.deepEqual(threadsOf(all, "v1", "top")[1].replies.map((r) => r.id), ["r1", "r2"]);

  for (const [avg, count] of [[4.8, 410], [3.2, 7], [0, 0], [5, 1]]) {
    const spread = starSpread(avg, count);
    assert.equal(spread.length, 5);
    assert.equal(spread.reduce((a, b) => a + b, 0), count, `${avg}/${count} adds up`);
  }
  assert.ok(starSpread(4.8, 400)[4] > starSpread(4.8, 400)[0], "a 4.8 class is mostly fives");

  assert.deepEqual(ratingWith({ avg: 0, count: 0 }, 4), { avg: 4, count: 1, stars: [0, 0, 0, 1, 0] });
  const mine = ratingWith({ avg: 4.5, count: 9 }, 5);
  assert.equal(mine.count, 10);
  assert.equal(mine.avg, 4.6);
  assert.equal(mine.stars.reduce((a, b) => a + b, 0), 10);
});

test("a channel's videos sort newest, most watched or oldest first", () => {
  const v = (id: string, at: string, views: number) => ({ id, at, views }) as ClassVideo;
  const all = [v("a", "2026-09-01", 10), v("b", "2026-09-20", 90), v("c", "2026-09-10", 90), v("d", "2026-09-15", 5)];
  assert.deepEqual(sortVideos(all, "latest").map((x) => x.id), ["b", "d", "c", "a"]);
  assert.deepEqual(sortVideos(all, "popular").map((x) => x.id), ["b", "c", "a", "d"], "equal views: newer first");
  assert.deepEqual(sortVideos(all, "oldest").map((x) => x.id), ["a", "c", "d", "b"]);
  assert.deepEqual(all.map((x) => x.id), ["a", "b", "c", "d"], "the list given is left alone");
  assert.deepEqual(normalizeAcademy({}).follows, {}, "older saves start following no one");
});

test("a course runs 40 days: five class weeks, then five days for the project and the panel", () => {
  const t = courseTimeline("2026-09-05");
  assert.equal(t.weeks.length, 5);
  assert.deepEqual(t.weeks[0], { week: 1, from: "2026-09-05", to: "2026-09-11" });
  assert.deepEqual(t.weeks[4], { week: 5, from: "2026-10-03", to: "2026-10-09" });
  assert.deepEqual(t.final, { from: "2026-10-10", to: "2026-10-14" });
  const days = (Date.parse(t.ends) - Date.parse("2026-09-05")) / 86_400_000 + 1;
  assert.equal(days, COURSE_DAYS, "day one to the last day is forty days");
});

test("academy rules: three courses, a short name, batches of 5 or 15, a 2.5-minute promo, a topic per teacher", () => {
  assert.deepEqual(BATCH_MAX, { solo: 5, team: 15 });
  assert.ok(promoFits(150) && promoFits(146) && promoFits(155));
  assert.ok(!promoFits(120) && !promoFits(160));

  const team = { kind: "team" as const, teachers: ["anik", "mahir", "rupa", "sajid"] };
  const L = (week: number, by?: string) => ({ week, title: `বিষয় ${week}`, mode: "live" as const, by });
  const course = {
    weeks: 5,
    lessons: [L(1, "anik"), L(2, "rupa"), L(3, "anik"), L(4, "mahir"), L(5, "anik")],
    seats: 15,
    enrolled: 12,
    teacher: "anik",
    syllabus: { kind: "pdf" as const, title: "সিলেবাস", size: "২০০ কেবি" },
    calendar: { kind: "sheet" as const, title: "ক্যালেন্ডার", size: "৪০ কেবি" },
    promo: { seconds: 150 },
  };
  assert.deepEqual(courseIssues(course, team), []);
  assert.equal(courseIssues({ ...course, seats: 16 }, team).length, 1, "a team batch is at most 15");
  assert.equal(courseIssues({ ...course, weeks: 8 }, team).length, 1, "forty days, five weeks");
  assert.equal(courseIssues({ ...course, promo: { seconds: 300 } }, team).length, 1);
  assert.equal(courseIssues({ ...course, lessons: course.lessons.map((l) => ({ ...l, by: "anik" })) }, team).length, 1, "one teacher alone is not a team course");
  assert.equal(courseIssues({ ...course, lessons: course.lessons.map((l) => ({ ...l, by: "stranger" })) }, team).length, 2);

  const solo = { kind: "solo" as const, teachers: ["sadman"] };
  const own = { ...course, teacher: "sadman", seats: 5, enrolled: 5, lessons: course.lessons.map((l) => ({ ...l, by: undefined })) };
  assert.deepEqual(courseIssues(own, solo), []);
  assert.equal(courseIssues({ ...own, seats: 6 }, solo).length, 1, "a solo batch is at most 5");

  const dept = { name: "মিউজিক", kind: "solo" as const, teachers: ["sadman"], academy: { name: "সাদমান বিন আহমেদ মিউজিক একাডেমি", about: "একক" } };
  assert.deepEqual(deptIssues(dept, 3), []);
  assert.equal(deptIssues(dept, 2).length, 1, "exactly three courses");
  assert.equal(deptIssues({ ...dept, teachers: ["sadman", "mitu"] }, 3).length, 1, "a solo academy is one teacher");
  assert.equal(deptIssues({ ...dept, name: "ইলেকট্রিক গিটার, কর্ড, রিদম আর লিড বাজানো" }, 3).length, 1, "a short name");
  assert.equal(deptIssues({ ...dept, kind: "team" }, 3).length, 1, "a team is at least two");
});

test("an old application for a workshop becomes a solo or team academy", () => {
  const app = { dept: "motor", newDept: "", skill: "মেরামত", years: 5, sample: "https://x.y", plan: "", team: [] as string[], place: "টঙ্গী", at: "2026-09-01T00:00:00Z" };
  assert.equal(normalizeAcademy({ application: { ...app, kind: "workshop" } }).application?.kind, "solo");
  assert.equal(normalizeAcademy({ application: { ...app, kind: "workshop", team: ["anik"] } }).application?.kind, "team");
  assert.equal(normalizeAcademy({ application: { ...app, kind: "team" } }).application?.academy, "");
  assert.deepEqual(normalizeAcademy({}).academyMedia, {});
});
