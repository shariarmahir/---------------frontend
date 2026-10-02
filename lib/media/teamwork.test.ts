import { test } from "node:test";
import assert from "node:assert/strict";
import { bdWeekday, clampLimit, classDuties, doneKey, isFull, labDuties, loadOf, weekDates, weekNo, weekProgress, weekRota } from "./teamwork.ts";

// Friday 25 September 2026, 18:00 in Bangladesh.
const now = new Date("2026-09-25T12:00:00Z");
const five = ["a", "b", "c", "d", "e"];

test("member caps stay in range and never drop below who is already in", () => {
  assert.equal(clampLimit("lab", 40), 15);
  assert.equal(clampLimit("lab", 1), 2);
  assert.equal(clampLimit("lab", 3, 5), 5);
  assert.equal(clampLimit("classroom", Number.NaN), 60);
  assert.equal(isFull(6, 6), true);
  assert.equal(isFull(5, 6), false);
  assert.equal(isFull(99), false);
});

test("the Bangladesh week starts on Saturday", () => {
  assert.equal(bdWeekday(now), 6);
  // 00:30 Saturday in Dhaka is still Friday evening in UTC.
  const sat = new Date("2026-09-25T18:30:00Z");
  assert.equal(bdWeekday(sat), 0);
  assert.equal(weekNo(sat), weekNo(now) + 1);
  assert.deepEqual(weekDates(weekNo(now)).slice(0, 2), ["2026-09-19", "2026-09-20"]);
  assert.equal(weekDates(weekNo(now))[6], "2026-09-25");
});

test("each duty gets the people it needs, never the same person twice", () => {
  const rota = weekRota(five, labDuties(3), 100, "lab");
  const tuesday = rota[3];
  assert.deepEqual(tuesday.map((d) => d.duty.id), ["lead", "build", "calc", "tools"]);
  for (const { duty, members } of tuesday) {
    assert.equal(members.length, duty.need);
    assert.equal(new Set(members).size, members.length);
  }
  // Five slots on lab day, five people: one job each.
  assert.equal(new Set(tuesday.flatMap((d) => d.members)).size, 5);
  assert.deepEqual(rota[0], []);
});

test("the week's work is shared evenly", () => {
  const load = loadOf(weekRota(five, labDuties(3), 100, "lab"));
  const counts = five.map((m) => load.get(m) ?? 0);
  assert.equal(counts.reduce((a, b) => a + b, 0), 5 + 2 + 2 + 2);
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, counts.join(","));
});

test("the rota is stable for a week and shuffles the next", () => {
  const a = weekRota(five, classDuties([0, 1, 2]), 100, "c1");
  assert.deepEqual(weekRota(five, classDuties([0, 1, 2]), 100, "c1"), a);
  const weeks = [101, 102, 103, 104].map((w) => JSON.stringify(weekRota(five, classDuties([0, 1, 2]), w, "c1")));
  assert.ok(weeks.some((w) => w !== JSON.stringify(a)));
});

test("a duty needing more people than the team takes everyone once", () => {
  const rota = weekRota(["a", "b"], [{ id: "x", title: "x", need: 4, days: [1], icon: "build" }], 1, "s");
  assert.deepEqual([...rota[1][0].members].sort(), ["a", "b"]);
});

test("progress counts done slots on days so far", () => {
  const rota = weekRota(["a", "b"], [{ id: "x", title: "x", need: 1, days: [0, 1, 2], icon: "build" }], 5, "s");
  const dates = weekDates(5);
  const who = rota[0][0].members[0];
  assert.deepEqual(weekProgress(rota, dates, { [doneKey(dates[0], "x", who)]: true }, 1), { done: 1, of: 2 });
});
