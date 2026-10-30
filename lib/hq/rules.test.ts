import { test } from "node:test";
import assert from "node:assert/strict";
import { seedPeople } from "../../data/hq/people.ts";
import { HqError, makeCtx } from "./domains/ctx.ts";
import { me as meDomain } from "./domains/me.ts";
import { people as peopleDomain } from "./domains/people.ts";
import { addDays, can, countWords, dhakaDay, isUrgentText, makeHandle, makeMemberId, mentionsIn, permsOf, priorityFor, taka, weekdayOf } from "./rules.ts";
import { seedDb } from "./seed.ts";
import { viewFor } from "./view.ts";

const NOW = Date.parse("2026-10-21T06:00:00.000Z"); // Wednesday, 12:00 in Dhaka

test("Dhaka days turn over at 18:00 UTC", () => {
  assert.equal(dhakaDay("2026-10-21T17:59:00.000Z"), "2026-10-21");
  assert.equal(dhakaDay("2026-10-21T18:00:00.000Z"), "2026-10-22");
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(weekdayOf("2026-10-21"), 3);
});

test("a due date suggests its lane", () => {
  const h = 3600_000;
  assert.equal(priorityFor(new Date(NOW + 2 * h).toISOString(), NOW), "immediate");
  assert.equal(priorityFor(new Date(NOW + 9 * h).toISOString(), NOW), "urgent");
  assert.equal(priorityFor("2026-10-22T08:00:00.000Z", NOW), "tomorrow");
  assert.equal(priorityFor("2026-10-22T16:00:00.000Z", NOW), "tomorrow");
  assert.equal(priorityFor("2026-10-29T06:00:00.000Z", NOW), "next-week");
  assert.equal(priorityFor("2026-11-30T06:00:00.000Z", NOW), "later");
});

test("the prime admin may do everything; others only what they hold", () => {
  const people = seedPeople();
  const mahir = people.find((p) => p.level === "prime")!;
  const mehek = people.find((p) => p.handle === "kandari@mehek-dev")!;
  assert.equal(can(mahir, "finance.edit"), true);
  assert.equal(can(mehek, "finance.view"), false);
  assert.equal(permsOf(mahir).length, 15);
});

test("words, urgency and mentions", () => {
  assert.equal(countWords("I can't make it — today, tomorrow."), 6);
  assert.equal(isUrgentText("server down @urgent"), true);
  assert.equal(countWords("আমি আজ, কাল — আর পরশু পারব না।"), 7);
  assert.equal(isUrgentText("সার্ভার বন্ধ @urgent"), true);
  assert.equal(isUrgentText("!জরুরি ক্লায়েন্ট ফোন করেছে"), true);
  assert.equal(isUrgentText("urgent নয়"), false);
  const people = seedPeople();
  const ids = mentionsIn("@ishtiak আর @kandari@mehek-dev দেখো", people);
  assert.deepEqual(ids.sort(), ["p-ishtiak", "p-mehek"]);
});

test("usernames, member ids and taka", () => {
  assert.equal(makeHandle("Ishtiak", "Creatives"), "kandari@ishtiak-creatives");
  assert.equal(makeMemberId("Mehek", 6, 2026), "kandari-mehek-006-26");
  assert.equal(taka(1234567), "৳12,34,567");
  assert.equal(taka(2_500_000, { compact: true }), "৳25 lakh");
});

test("a member's view hides accounts, others' notes and finance", () => {
  const db = seedDb(NOW, { samples: false });
  db.accounts.push({ id: "acc", personId: "p-mahir", email: "x@y.z", handle: "kandari@mahir-ceo", passHash: "h", salt: "s", face: [1], faceAt: null, failures: 0, lockedUntil: null, createdAt: "", lastLoginAt: null, epoch: 0 });
  db.notes.push({ id: "n1", personId: "p-mahir", title: "গোপন", body: "", pinned: false, color: "navy", at: "" });
  db.txns.push({ id: "t1", day: "2026-10-01", kind: "income", category: "x", amount: 1, note: "", method: "bank", by: "p-mahir", at: "" });
  const mehek = db.people.find((p) => p.id === "p-mehek")!;
  const v = viewFor(db, mehek, NOW, false);
  assert.equal("accounts" in v, false);
  assert.equal(v.notes.length, 0);
  assert.equal(v.txns.length, 0);
  assert.equal(v.me.isPrime, false);
  const prime = viewFor(db, db.people.find((p) => p.id === "p-mahir")!, NOW, true);
  assert.equal(prime.txns.length, 1);
  assert.equal(prime.notes.length, 1);
});

test("only the prime admin grants permissions; a level change keeps hand-granted extras", () => {
  const db = seedDb(NOW, { samples: false });
  const mahir = db.people.find((p) => p.id === "p-mahir")!;
  const jamil = db.people.find((p) => p.id === "p-jamil")!;
  assert.throws(() => peopleDomain.actions.perms(makeCtx(db, jamil, NOW), { personId: "p-mehek", perms: ["finance.view"] }), HqError);
  peopleDomain.actions.perms(makeCtx(db, mahir, NOW), { personId: "p-mehek", perms: ["finance.view"] });
  const mehek = db.people.find((p) => p.id === "p-mehek")!;
  assert.deepEqual(mehek.perms, ["finance.view"]);
  peopleDomain.actions.designation(makeCtx(db, mahir, NOW), { personId: "p-mehek", designation: "Dev Lead", level: "lead" });
  assert.ok(mehek.perms.includes("finance.view") && mehek.perms.includes("tasks.review"));
  assert.equal(mehek.history.length, 1);
  assert.ok(db.notices.some((n) => n.to === "p-mehek" && n.title.includes("promoted")));
});

test("connecting needs both sides to say yes", () => {
  const db = seedDb(NOW, { samples: false });
  const a = db.people.find((p) => p.id === "p-mehek")!;
  const b = db.people.find((p) => p.id === "p-luban")!;
  meDomain.actions.disconnect(makeCtx(db, a, NOW), { personId: b.id });
  meDomain.actions.connect(makeCtx(db, a, NOW), { personId: b.id });
  assert.equal(a.connections.includes(b.id), false);
  meDomain.actions.connect(makeCtx(db, b, NOW), { personId: a.id });
  assert.equal(a.connections.includes(b.id) && b.connections.includes(a.id), true);
});
