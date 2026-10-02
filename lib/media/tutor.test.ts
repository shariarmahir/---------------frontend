import { test } from "node:test";
import assert from "node:assert/strict";
import { attachKind, keyTerms, offlineReply, toTurns, type TutorMsg } from "./tutor.ts";

const msg = (role: TutorMsg["role"], text: string, extra: Partial<TutorMsg> = {}): TutorMsg => ({ id: `${role}${text}`, role, text, at: "2026-10-02T00:00:00Z", ...extra });

test("files are sorted by how the tutor can read them", () => {
  assert.equal(attachKind("photo.JPG", ""), "image");
  assert.equal(attachKind("scan", "image/png"), "image");
  assert.equal(attachKind("book.pdf", "application/pdf"), "pdf");
  assert.equal(attachKind("notes.docx", ""), "office");
  assert.equal(attachKind("slides.pptx", ""), "office");
  assert.equal(attachKind("old.doc", ""), "legacy");
  assert.equal(attachKind("old.PPT", ""), "legacy");
  assert.equal(attachKind("data.csv", "text/csv"), "text");
  assert.equal(attachKind("song.mp3", "audio/mpeg"), null);
});

test("the conversation starts with the student, alternates, and only the newest turn carries files", () => {
  const history = [
    msg("assistant", "স্বাগতম"),
    msg("user", "প্রশ্ন ১", { files: [{ name: "a.pdf", kind: "pdf" }] }),
    msg("assistant", "উত্তর ১"),
    msg("user", "আরেকটু"),
    msg("user", "প্রশ্ন ২"),
  ];
  const file = { name: "b.png", kind: "image" as const, media: "image/png", data: "AAAA" };
  const turns = toTurns(history, [file]);
  assert.deepEqual(
    turns.map((t) => t.role),
    ["user", "assistant", "user"],
  );
  assert.equal(turns[0].text, "প্রশ্ন ১\n[সংযুক্ত: a.pdf]");
  assert.equal(turns[2].text, "আরেকটু\n\nপ্রশ্ন ২");
  assert.deepEqual(turns[2].files, [file]);
  assert.equal(turns[0].files, undefined);
});

test("key terms skip filler words and favour repeats", () => {
  assert.deepEqual(keyTerms("সালোকসংশ্লেষণ এবং ক্লোরোফিল। সালোকসংশ্লেষণ হয় পাতায়, ক্লোরোফিল সবুজ। the light and light", 3), ["light", "ক্লোরোফিল", "সালোকসংশ্লেষণ"]);
});

test("the offline answer says the AI is off, reads text files, and names the ones it cannot read", () => {
  const out = offlineReply("ক্লোরোফিল কী?", [
    { name: "notes.txt", kind: "text", media: "text/plain", data: "ক্লোরোফিল সবুজ রঞ্জক। ক্লোরোফিল আলো শোষণ করে।" },
    { name: "scan.png", kind: "image", media: "image/png", data: "" },
  ]);
  assert.match(out, /অফলাইন/);
  assert.match(out, /notes\.txt — ৭ শব্দ/);
  assert.match(out, /scan\.png — ছবি আর PDF/);
  assert.match(out, /“ক্লোরোফিল” কাকে বলে/);
  assert.match(offlineReply("", [{ name: "n.txt", kind: "text", media: "text/plain", data: "এক দুই তিন" }], "latn"), /3 শব্দ/);
});
