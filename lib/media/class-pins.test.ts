import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPin, canAddPin, canPin, canUnpin, chatPin, daysLeft, isClassPin, MAX_MARKS, MAX_PINS, safeUrl, sortPins, taskState, withMark, type Pin, type PinDraft } from "./class-pins.ts";
import { hasBlanks, type ClassMsg } from "./class-chat.ts";

const who = { id: "s-tania", name: "তানিয়া আক্তার", role: "member" as const };
const draft = (d: Partial<PinDraft>): PinDraft => ({ kind: "text", title: "", body: "", url: "", due: "", ...d });
const pin = (extra: Partial<Pin>): Pin => ({ id: "p", kind: "text", title: "লেখা", color: "gold", by: "s-tania", byName: "তানিয়া", byRole: "member", at: "2026-09-25T00:00:00Z", ...extra });

test("only http and https links are kept, and a bare address gets https", () => {
  assert.equal(safeUrl("docs.google.com/spreadsheets/d/abc"), "https://docs.google.com/spreadsheets/d/abc");
  assert.equal(safeUrl("  https://example.com/a  "), "https://example.com/a");
  assert.equal(safeUrl("http://example.com"), "http://example.com/");
  for (const bad of ["", "javascript:alert(1)", "data:text/html,x", "ftp://example.com", "localhost:3000", "just words", "//evil.example"]) assert.equal(safeUrl(bad), null, bad);
});

test("a text pin needs words, a task a valid due day, data a value or a link", () => {
  assert.deepEqual(buildPin(draft({ title: " " }), who, "p1", "t"), { problem: "কিছু লিখুন।" });
  assert.deepEqual(buildPin(draft({ title: "ক".repeat(281) }), who, "p1", "t"), { problem: "বেশি বড় — একটু ছোট করুন।" });
  const text = buildPin(draft({ title: "  কাল পরীক্ষা  " }), who, "p1", "t");
  assert.ok("pin" in text && text.pin.title === "কাল পরীক্ষা" && text.pin.color === "gold" && text.pin.byRole === "member");

  assert.deepEqual(buildPin(draft({ kind: "task", title: "অনুশীলনী ৪.২", due: "2026-02-30" }), who, "p2", "t"), { problem: "শেষ তারিখটা ঠিক নেই।" });
  const task = buildPin(draft({ kind: "task", title: "অনুশীলনী ৪.২", due: "2026-09-28" }), who, "p2", "t");
  assert.ok("pin" in task && task.pin.due === "2026-09-28" && task.pin.color === "mint");
  const noDue = buildPin(draft({ kind: "task", title: "নোট গোছাও" }), who, "p3", "t");
  assert.ok("pin" in noDue && !("due" in noDue.pin));

  assert.deepEqual(buildPin(draft({ kind: "data", title: "টাইম কনস্ট্যান্ট" }), who, "p4", "t"), { problem: "মান লিখুন, অথবা লিংক দিন।" });
  assert.deepEqual(buildPin(draft({ kind: "data", title: "শিট", url: "javascript:alert(1)" }), who, "p4", "t"), { problem: "লিংকটা ঠিক নেই — https:// দিয়ে শুরু হওয়া ঠিকানা দিন।" });
  const data = buildPin(draft({ kind: "data", title: "ল্যাব ডেটা", url: "docs.google.com/spreadsheets/d/x" }), who, "p4", "t", "leaf");
  assert.ok("pin" in data && data.pin.url === "https://docs.google.com/spreadsheets/d/x" && data.pin.color === "leaf" && !("body" in data.pin));
});

test("an important chat is copied into its pin, trimmed if long", () => {
  const m: ClassMsg = { id: "cm-1", by: "t-rafiq", byName: "রফিকুল ইসলাম স্যার", byRole: "teacher", text: "ক".repeat(400), at: "2026-09-24T03:10:00Z" };
  const p = chatPin(m, who, "p5", "t");
  assert.equal(p.kind, "chat");
  assert.equal(p.msgId, "cm-1");
  assert.equal(p.body, "রফিকুল ইসলাম স্যার");
  assert.equal(p.title.length, 300);
  assert.ok(p.title.endsWith("…"));
});

test("who may pin and unpin", () => {
  assert.equal(canPin("member", "student"), true);
  assert.equal(canPin("teacher", "student"), true);
  assert.equal(canPin("guest", "student"), false);
  assert.equal(canPin("member", "parent"), false);
  const mine = pin({ by: "s-tania" });
  const teachers = pin({ by: "t", byRole: "teacher" });
  assert.equal(canUnpin(mine, "member", "s-tania"), true);
  assert.equal(canUnpin(mine, "member", "s-rahat"), false);
  assert.equal(canUnpin(teachers, "leader", "x"), false);
  assert.equal(canUnpin(mine, "leader", "x"), true);
  assert.equal(canUnpin(teachers, "teacher", "t"), true);
  assert.equal(canUnpin(mine, "guest"), false);
  assert.equal(isClassPin(teachers), true);
  assert.equal(isClassPin(mine), false);
});

test("task state follows the due day; pins sort open first, teacher's before the rest", () => {
  assert.equal(daysLeft("2026-09-28", "2026-09-25"), 3);
  assert.equal(taskState({ due: "2026-09-24" }, "2026-09-25"), "overdue");
  assert.equal(taskState({ due: "2026-09-25" }, "2026-09-25"), "today");
  assert.equal(taskState({ due: "2026-09-27" }, "2026-09-25"), "soon");
  assert.equal(taskState({ due: "2026-10-05" }, "2026-09-25"), "open");
  assert.equal(taskState({}, "2026-09-25"), "open");
  assert.equal(taskState({ due: "2026-09-20", done: true }, "2026-09-25"), "done");

  const list = [
    pin({ id: "old-mine", at: "2026-09-20T00:00:00Z" }),
    pin({ id: "done-teacher", byRole: "teacher", done: true, kind: "task" }),
    pin({ id: "new-mine", at: "2026-09-24T00:00:00Z" }),
    pin({ id: "leader", byRole: "leader" }),
    pin({ id: "teacher", byRole: "teacher" }),
  ];
  assert.deepEqual(sortPins(list).map((p) => p.id), ["teacher", "leader", "new-mine", "old-mine", "done-teacher"]);
  assert.equal(canAddPin(Array.from({ length: MAX_PINS - 1 }, () => pin({}))), true);
  assert.equal(canAddPin(Array.from({ length: MAX_PINS }, () => pin({}))), false);
});

test("a marker sets, changes and clears; the same colour again clears; only the newest are kept", () => {
  let marks = withMark({}, "m1", "gold");
  assert.deepEqual(marks, { m1: "gold" });
  marks = withMark(marks, "m1", "green");
  assert.deepEqual(marks, { m1: "green" });
  assert.deepEqual(withMark(marks, "m1", "green"), {});
  assert.deepEqual(withMark(marks, "m1", null), {});
  assert.deepEqual(withMark(marks, "m2", "nope" as never), marks);
  let many = {};
  for (let i = 0; i < MAX_MARKS + 3; i++) many = withMark(many, `k${i}`, "mint");
  assert.equal(Object.keys(many).length, MAX_MARKS);
  assert.ok(!("k0" in many) && "k202" in many);
});

test("a message still holding a blank is not ready to send", () => {
  assert.equal(hasBlanks("আমি এটুকু বুঝেছি: [ ]"), true);
  assert.equal(hasBlanks("আমি এটুকু বুঝেছি: [  ]"), true);
  assert.equal(hasBlanks("সূত্র [1] দেখো"), false);
});
