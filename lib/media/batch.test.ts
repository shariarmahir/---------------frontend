import { test } from "node:test";
import assert from "node:assert/strict";
import { batchIssues, batchStage, classSessions, foundingBatch, nextClass, roomName, slotOf, type Batch } from "./batch.ts";

const base: Batch = { id: "MEC-101", course: "MEC-101", n: 1, starts: "2026-09-05", day: 6, time: "19:00", seats: 15, enrolled: 13, room: "Kandari-MEC101-abc", opened: "2026-09-01" };

test("one class a week on the batch's day and time, Dhaka", () => {
  const s = classSessions(base);
  assert.equal(s.length, 5);
  // Saturday 5 September, 7 pm in Dhaka is 1 pm UTC; then every Saturday.
  assert.deepEqual(s.map((x) => x.at), ["2026-09-05T13:00:00.000Z", "2026-09-12T13:00:00.000Z", "2026-09-19T13:00:00.000Z", "2026-09-26T13:00:00.000Z", "2026-10-03T13:00:00.000Z"]);
  // A batch starting on a Saturday with Tuesday classes meets on each week's Tuesday.
  const tue = classSessions({ ...base, day: 2, time: "10:30" });
  assert.equal(tue[0].at, "2026-09-08T04:30:00.000Z");
  assert.equal(tue[4].week, 5);
});

test("the next class, and whether it is on right now", () => {
  assert.deepEqual(nextClass(base, new Date("2026-09-25T12:00:00Z")), { week: 4, at: "2026-09-26T13:00:00.000Z", live: false });
  // Twenty minutes into week 4's class: still that class, and live.
  assert.deepEqual(nextClass(base, new Date("2026-09-26T13:20:00Z")), { week: 4, at: "2026-09-26T13:00:00.000Z", live: true });
  // Forty-one minutes in, it is over; the next is week 5.
  assert.equal(nextClass(base, new Date("2026-09-26T13:41:00Z"))?.week, 5);
  assert.equal(nextClass(base, new Date("2026-10-04T00:00:00Z")), null);
});

test("a batch's stage over its 40 days", () => {
  assert.equal(batchStage(base, new Date("2026-09-01T00:00:00Z")), "upcoming");
  assert.equal(batchStage(base, new Date("2026-09-25T12:00:00Z")), "running");
  assert.equal(batchStage(base, new Date("2026-10-12T00:00:00Z")), "final");
  assert.equal(batchStage(base, new Date("2026-10-20T00:00:00Z")), "done");
});

test("opening a classroom: start today or later, a sensible hour, no clash with the teacher's own batches", () => {
  const ok = { starts: "2026-10-17", day: 6, time: "19:00" };
  assert.deepEqual(batchIssues(ok, [], "2026-10-08"), []);
  assert.equal(batchIssues({ ...ok, starts: "2026-10-01" }, [], "2026-10-08").length, 1);
  assert.equal(batchIssues({ ...ok, time: "23:30" }, [], "2026-10-08").length, 1);
  assert.equal(batchIssues({ ...ok, time: "7pm" }, [], "2026-10-08").length, 1);
  assert.equal(batchIssues({ ...ok, starts: "not-a-day" }, [], "2026-10-08").length, 1);
  // Same Saturday 7 pm while another of the teacher's batches still runs: a clash.
  const running = { ...base, starts: "2026-10-10" };
  assert.match(batchIssues(ok, [running], "2026-10-08")[0], /একই সময়ে/);
  // A different hour, or after that batch has ended, is fine.
  assert.deepEqual(batchIssues({ ...ok, time: "20:00" }, [running], "2026-10-08"), []);
  assert.deepEqual(batchIssues({ ...ok, starts: "2026-11-21" }, [running], "2026-10-08"), []);
});

test("a course's first batch keeps the course code, and its slot comes from the next live class", () => {
  const b = foundingBatch({ id: "AI-201", starts: "2026-09-05", seats: 15, enrolled: 11, nextLive: "2026-10-01T04:00:00Z" });
  assert.equal(b.id, "AI-201");
  assert.deepEqual([b.n, b.day, b.time, b.seats, b.enrolled], [1, 4, "10:00", 15, 11]);
  assert.equal(foundingBatch({ id: "X-1", starts: "2026-10-17", seats: 5, enrolled: 0 }).time, "19:00");
  assert.match(b.room, /^Kandari-AI201-[a-z0-9]+$/);
  assert.equal(slotOf(b.day, b.time), "বৃহস্পতিবার · সকাল ১০:০০");
  assert.equal(slotOf(6, "19:30"), "শনিবার · সন্ধ্যা ৭:৩০");
  assert.notEqual(roomName("AI-201", "a"), roomName("AI-201", "b"));
});
