import { test } from "node:test";
import assert from "node:assert/strict";
import { roomHref, shareCaption, shareProblems, shareTags, type ShareInput } from "./showcase.ts";

const lab: ShareInput = {
  kind: "research",
  title: "সস্তা সোলার চার্জ কন্ট্রোলার",
  question: "৫০০ টাকার কমে কি ব্যাটারি ওভারচার্জ ঠেকানো যায়?",
  finding: "জেনার ডায়োড আর একটি ট্রানজিস্টরে ১৩.৮V-এ কাটঅফ।",
  method: "তিন দিন ছাদে মাপা",
  team: ["নাফিস", "ঋতু"],
  from: { kind: "lab", id: "lab-eee102", name: "সার্কিট ল্যাব · গ্রুপ বি" },
};

test("the caption reads top to bottom: title, question, method, finding, team", () => {
  const c = shareCaption(lab).split("\n\n");
  assert.equal(c[0], lab.title);
  assert.ok(c[1].startsWith("গবেষণার প্রশ্ন: "));
  assert.equal(c[2], "পদ্ধতি: তিন দিন ছাদে মাপা");
  assert.ok(c[3].startsWith("ফলাফল: "));
  assert.equal(c[4], "দল: নাফিস, ঋতু · ল্যাব: সার্কিট ল্যাব · গ্রুপ বি");
});

test("empty parts are left out of the caption", () => {
  const c = shareCaption({ ...lab, kind: "solution", question: " ", method: "", team: [] }).split("\n\n");
  assert.deepEqual(c, [lab.title, `সমাধান: ${lab.finding}`, "ল্যাব: সার্কিট ল্যাব · গ্রুপ বি"]);
});

test("tags carry the kind, the room type and the title's words", () => {
  assert.deepEqual(shareTags(lab), ["#গবেষণা", "#ল্যাব", "#সস্তা", "#সোলার", "#চার্জ"]);
  assert.equal(shareTags({ ...lab, kind: "innovation" })[0], "#নতুন_উদ্ভাবন");
});

test("a share needs a title, a finding and a place to go", () => {
  assert.deepEqual(shareProblems({ title: lab.title, finding: lab.finding, toFeed: true, toResearch: false }), { title: undefined, finding: undefined, where: undefined });
  const bad = shareProblems({ title: "ক", finding: "", toFeed: false, toResearch: false });
  assert.ok(bad.title && bad.finding && bad.where);
});

test("rooms link to their own page", () => {
  assert.equal(roomHref(lab.from), "/media/classroom/lab/lab-eee102");
  assert.equal(roomHref({ kind: "classroom", id: "c1", name: "x" }), "/media/classroom/c1");
});
