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

test("teachers are addressed by the title in their name, else neutrally", async () => {
  const { addressOf } = await import("./tutor.ts");
  assert.equal(addressOf("রফিকুল ইসলাম স্যার"), "স্যার");
  assert.equal(addressOf("সাবরিনা ইয়াসমিন ম্যাডাম"), "ম্যাডাম");
  assert.equal(addressOf("ড. মাহমুদা আক্তার"), "শ্রদ্ধেয় শিক্ষক");
  assert.equal(addressOf(undefined), "শ্রদ্ধেয় শিক্ষক");
});

test("the question brief names the class, the teacher and the latest thing the teacher said", async () => {
  const { questionBrief } = await import("./tutor.ts");
  const brief = questionBrief({ draft: " ৫ নম্বর বুঝিনি ", room: "দশম শ্রেণি", subject: "গণিত", teacher: "রফিকুল ইসলাম স্যার", lastTeacher: "অনুশীলনী ৪.২ করে আনবে।" });
  assert.equal(brief, "শিক্ষার্থীর খসড়া: “৫ নম্বর বুঝিনি”\nক্লাস: দশম শ্রেণি\nবিষয়: গণিত\nশিক্ষক: রফিকুল ইসলাম স্যার\nশিক্ষকের সর্বশেষ কথা: “অনুশীলনী ৪.২ করে আনবে।”");
  assert.equal(questionBrief({ draft: "" }), "শিক্ষার্থীর খসড়া: (কিছু লেখেননি)");
});

test("the offline builder keeps the student's words and leaves blanks to fill", async () => {
  const { offlineQuestion } = await import("./tutor.ts");
  const { hasBlanks } = await import("./class-chat.ts");
  const own = offlineQuestion({ draft: "৫ নম্বরে নিশ্চায়ক ঋণাত্মক আসছে", subject: "গণিত", teacher: "রফিকুল ইসলাম স্যার" });
  assert.ok(own.startsWith("স্যার, গণিত বিষয়ে ৫ নম্বরে নিশ্চায়ক ঋণাত্মক আসছে\n"));
  assert.ok(hasBlanks(own));
  const topic = offlineQuestion({ draft: "", lastTeacher: "AVL ট্রির রোটেশন নিয়ে স্লাইড দিয়েছি।", teacher: "ড. মাহমুদা আক্তার" });
  assert.ok(topic.startsWith("শ্রদ্ধেয় শিক্ষক, আপনি যে বললেন “AVL ট্রির রোটেশন"));
  assert.ok(hasBlanks(offlineQuestion({ draft: "" })));
});
