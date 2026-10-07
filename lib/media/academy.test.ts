import { test } from "node:test";
import assert from "node:assert/strict";
import { RUBRIC, attendanceOf, canWatch, certificateId, draftCode, durationText, finalResult, freeClassDone, interviewSlots, latestAdmission, materialKindOf, normalizeAcademy, payoutOf, placement, progressOf, ratingWith, rubricTotal, starSpread, threadsOf, sizeParts, sortVideos, teacherPoints, teacherTier, weekOf, youtubeEmbed, type ClassVideo, type VideoComment } from "./academy.ts";

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
