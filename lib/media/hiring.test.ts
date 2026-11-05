import assert from "node:assert/strict";
import { test } from "node:test";
import { inviteIssues, nextSlot, seekingIssues, talentFrom } from "./hiring.ts";

const NOW = new Date("2026-10-01T06:00:00Z");

test("an invitation needs a role, a real note and a time ahead", () => {
  const ok = { role: "ফ্রন্টএন্ড ডেভেলপার", note: "আপনার প্রজেক্টটা দেখে ভালো লেগেছে, কথা বলতে চাই।", slot: "2026-10-03T05:00:00Z" };
  assert.deepEqual(inviteIssues(ok, NOW), []);
  assert.equal(inviteIssues({ ...ok, role: " " }, NOW).length, 1);
  assert.equal(inviteIssues({ ...ok, note: "আসুন" }, NOW).length, 1);
  assert.equal(inviteIssues({ ...ok, slot: "2026-09-30T05:00:00Z" }, NOW).length, 1);
  assert.equal(inviteIssues({ ...ok, slot: "" }, NOW).length, 1);
});

test("a kaj-chai card needs a role and a start date", () => {
  assert.deepEqual(seekingIssues({ role: "দর্জি", from: "2026-10-10", note: "" }), []);
  assert.equal(seekingIssues({ role: "", from: "10/10", note: "" }).length, 2);
  assert.equal(seekingIssues({ role: "দর্জি", from: "2026-10-10", note: "ক".repeat(281) }).length, 1);
});

test("graduates come best first, then upcoming interviews; failures stay out", () => {
  const seat = (s: { id: string; at: string; marks?: number[]; certificate?: string }) => ({ learner: s.id.toUpperCase(), district: "ঢাকা", course: "X", project: "—", ...s });
  const talent = talentFrom(
    [
      seat({ id: "a", at: "2026-09-10T04:00:00Z", marks: [70, 74], certificate: "C-A" }),
      seat({ id: "b", at: "2026-09-11T04:00:00Z", marks: [88, 91], certificate: "C-B" }),
      seat({ id: "c", at: "2026-09-12T04:00:00Z", marks: [40, 45], certificate: "C-C" }),
      seat({ id: "d", at: "2026-10-12T04:00:00Z" }),
      seat({ id: "e", at: "2026-10-05T04:00:00Z" }),
      seat({ id: "f", at: "2026-09-01T04:00:00Z" }),
    ],
    NOW,
  );
  assert.deepEqual(
    talent.map((t) => t.seat.id),
    ["b", "a", "e", "d"],
  );
  assert.equal(talent[0].stage === "certified" && talent[0].verdict, "distinction");
});

test("the suggested interview slot is the next working day at eleven", () => {
  // Wednesday → Thursday.
  assert.equal(nextSlot(new Date(2026, 8, 30, 15)), "2026-10-01T11:00");
  // Thursday → Friday is skipped, so Saturday.
  assert.equal(nextSlot(new Date(2026, 9, 8, 9)), "2026-10-10T11:00");
});
