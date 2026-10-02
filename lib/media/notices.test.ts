import { test } from "node:test";
import assert from "node:assert/strict";
import { canPost, canRemove, lastDay, onBoard, oneWord, roleOf, type Notice } from "./notices.ts";

const n = (over: Partial<Notice>): Notice => ({ id: "n", kind: "custom", title: "t", by: "s1", byRole: "member", at: "2026-09-20T10:00:00Z", ...over });

test("roles: teacher over leader over member; outsiders are guests", () => {
  const room = { leaderId: "cr", teacherId: "t" };
  assert.equal(roleOf(room, "t", true), "teacher");
  assert.equal(roleOf(room, "cr", true), "leader");
  assert.equal(roleOf(room, "s1", true), "member");
  assert.equal(roleOf(room, "s1", false), "guest");
  assert.equal(roleOf(room, undefined, true), "guest");
});

test("students post leave and late notes; cancelling a class is for staff", () => {
  assert.equal(canPost("leave", "member"), true);
  assert.equal(canPost("late", "member"), true);
  assert.equal(canPost("cancel", "member"), false);
  assert.equal(canPost("emergency", "leader"), true);
  assert.equal(canPost("custom", "teacher"), true);
  assert.equal(canPost("leave", "guest"), false);
});

test("the teacher takes down anything; the leader not the teacher's; students only their own", () => {
  const byTeacher = n({ by: "t", byRole: "teacher" });
  const byStudent = n({ by: "s1" });
  assert.equal(canRemove(byTeacher, "teacher", "t"), true);
  assert.equal(canRemove(byTeacher, "leader", "cr"), false);
  assert.equal(canRemove(byStudent, "leader", "cr"), true);
  assert.equal(canRemove(byStudent, "member", "s1"), true);
  assert.equal(canRemove(byStudent, "member", "s2"), false);
});

test("a reason is one word", () => {
  assert.equal(oneWord("  জ্বর "), "জ্বর");
  assert.equal(oneWord("খুব জ্বর"), null);
  assert.equal(oneWord("ক"), null);
});

test("notices leave the board after their day; pinned ones stay; emergencies lead", () => {
  assert.equal(lastDay(n({ date: "2026-09-25", days: 3 })), "2026-09-27");
  assert.equal(lastDay(n({})), "2026-09-27");
  const list = [
    n({ id: "old", date: "2026-09-20" }),
    n({ id: "pin", pinned: true, date: "2026-09-01" }),
    n({ id: "soon", date: "2026-09-26" }),
    n({ id: "sos", kind: "emergency", date: "2026-09-25" }),
  ];
  assert.deepEqual(onBoard(list, "2026-09-25").map((x) => x.id), ["sos", "pin", "soon"]);
});
