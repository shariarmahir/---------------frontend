import { test } from "node:test";
import assert from "node:assert/strict";
import { append, bdDay, canWrite, cleanMsg, openQuestions, thread, KEEP, type ClassMsg } from "./class-chat.ts";

const m = (id: string, at: string, extra: Partial<ClassMsg> = {}): ClassMsg => ({ id, by: "s", byName: "স", byRole: "member", text: id, at, ...extra });

test("parents and guests read; members, leaders and teachers write", () => {
  assert.equal(canWrite("member", "student"), true);
  assert.equal(canWrite("teacher", "student"), true);
  assert.equal(canWrite("guest", "student"), false);
  assert.equal(canWrite("member", "parent"), false);
});

test("the thread merges the room's messages with this device's, in time order, once each", () => {
  const seed = [m("a", "2026-09-24T03:00:00Z"), m("c", "2026-09-24T05:00:00Z")];
  const mine = [m("b", "2026-09-24T04:00:00Z"), m("a", "2026-09-24T03:00:00Z")];
  assert.deepEqual(
    thread(seed, mine).map((x) => x.id),
    ["a", "b", "c"],
  );
});

test("only the newest messages are kept", () => {
  let list: ClassMsg[] = [];
  for (let i = 0; i < KEEP + 5; i++) list = append(list, m(String(i), `2026-09-24T00:00:${String(i % 60).padStart(2, "0")}Z`));
  assert.equal(list.length, KEEP);
  assert.equal(list[0].id, "5");
});

test("a question stays open until the teacher writes after it", () => {
  const list = [m("q1", "2026-09-24T03:00:00Z", { ask: true }), m("t", "2026-09-24T04:00:00Z", { byRole: "teacher" }), m("q2", "2026-09-24T05:00:00Z", { ask: true })];
  assert.deepEqual(
    openQuestions(list).map((x) => x.id),
    ["q2"],
  );
  assert.deepEqual(
    openQuestions(list.slice(0, 1)).map((x) => x.id),
    ["q1"],
  );
});

test("days follow Dhaka time and messages are trimmed", () => {
  assert.equal(bdDay("2026-09-24T19:00:00Z"), "2026-09-25");
  assert.equal(cleanMsg("  হ্যালো\n\n\n\nস্যার  "), "হ্যালো\n\nস্যার");
  assert.equal(cleanMsg("   "), null);
  assert.equal(cleanMsg("x".repeat(1001)), null);
});
