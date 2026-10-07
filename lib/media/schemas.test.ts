import { test } from "node:test";
import assert from "node:assert/strict";
import {
  admissionSchema,
  challengeSchema,
  civicSchema,
  eventSchema,
  jobSchema,
  markSchema,
  commentSchema,
  complaintSchema,
  courseSchema,
  handleList,
  hireSchema,
  identitySchema,
  postSchema,
  projectSchema,
  profileSchema,
  teachSchema,
  verifySchema,
  withdrawSchema,
} from "./schemas.ts";

const errPaths = (r: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  r.success ? [] : r.error!.issues.map((i) => i.path.join("."));

test("identity: NID / passport rules, consent and captures required", () => {
  const base = { fullName: "মাহির শারিয়ার", dob: "1999-04-12", front: true, back: true, selfie: true, consent: true };
  assert.ok(identitySchema.safeParse({ ...base, docType: "nid", number: "১২৩৪৫৬৭৮৯০" }).success);
  assert.ok(identitySchema.safeParse({ ...base, docType: "passport", number: "BN0123456", back: false }).success);
  assert.deepEqual(errPaths(identitySchema.safeParse({ ...base, docType: "nid", number: "12345" })), ["number"]);
  assert.deepEqual(errPaths(identitySchema.safeParse({ ...base, docType: "nid", number: "1234567890", back: false })), ["back"]);
  assert.deepEqual(errPaths(identitySchema.safeParse({ ...base, docType: "nid", number: "1234567890", consent: false })), ["consent"]);
  assert.deepEqual(errPaths(identitySchema.safeParse({ ...base, docType: "nid", number: "1234567890", dob: "2020-01-01" })), ["dob"]);
  // The front photo is reported on the first submit, alongside other missing fields.
  const empty = errPaths(identitySchema.safeParse({ docType: "nid", number: "", fullName: "", dob: "", front: false, back: false, selfie: false, consent: false }));
  assert.ok(empty.includes("front") && empty.includes("selfie") && empty.includes("number"), empty.join(","));
});

test("profile basics: handle format", () => {
  const ok = { displayName: "Rina Akter", handle: "rina_art", district: "ঢাকা", headline: "জলরঙের শিল্পী ও শিক্ষক", bio: "" };
  assert.ok(profileSchema.safeParse(ok).success);
  assert.deepEqual(errPaths(profileSchema.safeParse({ ...ok, handle: "Rina Art" })), ["handle"]);
});

test("post: sellable needs a price", () => {
  const ok = {
    kind: "skill",
    caption: "নতুন নকশিকাঁথার কাজ শেষ হলো, দেখুন।",
    skill: "নকশিকাঁথা",
    category: "crafts",
    selfRating: 4,
    media: [{ kind: "image", label: "কাঁথা" }],
    sellable: false,
  };
  assert.ok(postSchema.safeParse(ok).success);
  assert.deepEqual(errPaths(postSchema.safeParse({ ...ok, sellable: true })), ["price"]);
  assert.ok(postSchema.safeParse({ ...ok, sellable: true, price: 2500, unit: "প্রতি পিস", negotiable: true }).success);
  assert.deepEqual(errPaths(postSchema.safeParse({ ...ok, media: [] })), ["media"]);
  assert.deepEqual(errPaths(postSchema.safeParse({ ...ok, selfRating: 6 })), ["selfRating"]);
});

test("verify vs challenge", () => {
  assert.ok(verifySchema.safeParse({ stars: 5, verdict: "verify", reason: "" }).success);
  assert.deepEqual(errPaths(verifySchema.safeParse({ stars: 2, verdict: "challenge", reason: "কম" })), ["reason"]);
  assert.ok(verifySchema.safeParse({ stars: 2, verdict: "challenge", reason: "ফোঁড়গুলো অসমান, কোণে সুতা বেরিয়ে আছে।" }).success);
});

test("comment and hire", () => {
  assert.equal(commentSchema.safeParse({ text: "  " }).success, false);
  assert.ok(commentSchema.safeParse({ text: "দারুণ কাজ!" }).success);
  const hire = { service: "নকশিকাঁথা", brief: "ক্যাফের জন্য ১০টি কুশন কভার লাগবে, পাহাড়ের নকশা।", budget: 12000, deadline: "2099-01-01" };
  assert.ok(hireSchema.safeParse(hire).success);
  assert.deepEqual(errPaths(hireSchema.safeParse({ ...hire, deadline: "2000-01-01" })), ["deadline"]);
});

test("post: non-skill topics need no rating or media; skill topics do", () => {
  const talk = { topic: "rights", kind: "skill", caption: "মোড়ের ড্রেন তিন মাস ধরে খোলা, রাতে কেউ পড়ে যেতে পারে।", category: "research", selfRating: 3, media: [], sellable: false };
  assert.ok(postSchema.safeParse({ ...talk, skill: "" }).success);
  assert.deepEqual(errPaths(postSchema.safeParse({ ...talk, topic: "education", skill: "" })), ["media", "skill"]);
});

test("post: anything goes — a short life line, a photo alone, a feeling — but never nothing", () => {
  const life = { topic: "daily", kind: "skill", caption: "আজ খুব ভালো দিন!", skill: "", category: "other", selfRating: 3, media: [], sellable: false };
  assert.ok(postSchema.safeParse(life).success);
  assert.ok(postSchema.safeParse({ ...life, topic: "talent", feeling: "proud", audience: "followers", place: "নকলা, শেরপুর" }).success);
  assert.ok(postSchema.safeParse({ ...life, caption: "", media: [{ kind: "image", label: "সাজেক" }] }).success);
  assert.deepEqual(errPaths(postSchema.safeParse({ ...life, caption: "   " })), ["caption"]);
  assert.deepEqual(errPaths(postSchema.safeParse({ ...life, feeling: "angry" })), ["feeling"]);
  // A rated claim still needs words enough to judge it.
  assert.ok(errPaths(postSchema.safeParse({ ...life, topic: "skill", caption: "দেখুন", skill: "নকশিকাঁথা", media: [{ kind: "image", label: "কাঁথা" }] })).includes("caption"));
});

test("post: a colour background takes short text only", () => {
  const life = { topic: "daily", kind: "skill", skill: "", category: "other", selfRating: 3, media: [], sellable: false, bg: "gold" };
  assert.ok(postSchema.safeParse({ ...life, caption: "প্রথম বেতন পেলাম!" }).success);
  assert.deepEqual(errPaths(postSchema.safeParse({ ...life, caption: "অ".repeat(161) })), ["caption"]);
  // With a photo the background is dropped, so long text is fine.
  assert.ok(postSchema.safeParse({ ...life, caption: "অ".repeat(400), media: [{ kind: "image", label: "ছবি" }] }).success);
});

test("job: pay must be stated, ordered and fair", () => {
  const band = { low: 800, high: 2500, unit: "প্রতি ঘণ্টা" };
  const s = jobSchema(() => band);
  const ok = {
    title: "জুনিয়র ফ্রন্টএন্ড ডেভেলপার",
    org: "আলোকিত ল্যাব",
    sector: "tech",
    type: "full",
    location: "ঢাকা",
    remote: false,
    payMin: 25000,
    payMax: 35000,
    payUnit: "month",
    description: "রিঅ্যাক্ট দিয়ে ড্যাশবোর্ড বানাবেন, টিমের সাথে কোড রিভিউ করবেন।",
    tags: "#রিঅ্যাক্ট #ঢাকা",
    studentFriendly: false,
    deadline: "2099-01-01",
  };
  assert.ok(s.safeParse(ok).success);
  assert.deepEqual(errPaths(s.safeParse({ ...ok, payMin: 8000, payMax: 9000 })), ["payMin"]);
  assert.deepEqual(errPaths(s.safeParse({ ...ok, payMax: 20000 })), ["payMax"]);
});

test("civic report and event", () => {
  const r = { kind: "sanitation", title: "বাসস্ট্যান্ডের পাশে খোলা প্রস্রাব", area: "মিরপুর ১০", district: "ঢাকা", description: "প্রতিদিন সন্ধ্যায় দুর্গন্ধে দাঁড়ানো যায় না, একটা পাবলিক টয়লেট দরকার।", severity: "medium", anonymous: true };
  assert.ok(civicSchema.safeParse(r).success);
  assert.deepEqual(errPaths(civicSchema.safeParse({ ...r, description: "খারাপ" })), ["description"]);
  const e = { kind: "tree", title: "নকলায় ১০০ গাছ লাগাই", area: "নকলা", district: "শেরপুর", date: "2099-06-01", goal: 40, description: "বর্ষার শুরুতে স্কুলের মাঠ আর রাস্তার ধারে ১০০টি চারা লাগাব।", needs: "চারা, কোদাল" };
  assert.ok(eventSchema.safeParse(e).success);
  assert.deepEqual(errPaths(eventSchema.safeParse({ ...e, date: "2000-01-01" })), ["date"]);
});

test("withdraw: limits and wallet numbers", () => {
  const s = withdrawSchema(10000);
  assert.ok(s.safeParse({ method: "bkash", account: "01712345678", amount: 5000 }).success);
  assert.ok(s.safeParse({ method: "nagad", account: "০১৮১২৩৪৫৬৭৮", amount: 500 }).success);
  assert.deepEqual(errPaths(s.safeParse({ method: "bkash", account: "0171234", amount: 5000 })), ["account"]);
  assert.deepEqual(errPaths(s.safeParse({ method: "bkash", account: "01712345678", amount: 400 })), ["amount"]);
  assert.deepEqual(errPaths(s.safeParse({ method: "bkash", account: "01712345678", amount: 20000 })), ["amount"]);
  assert.ok(s.safeParse({ method: "banglaqr", account: "QR-7310", amount: 1000 }).success);
});

test("challenge: a real brief, a future deadline, and a prize that is never negative", () => {
  const ok = {
    kind: "code",
    title: "বাংলা ওসিআর — হাতের লেখা চেনা",
    host: "নিজে",
    category: "tech",
    prize: 5000,
    deadline: "2099-01-01",
    teams: true,
    description: "হাতে লেখা বাংলা নোটের ছবি থেকে লেখা বের করার মডেল বানান, অন্তত ৯০% নির্ভুল।",
    judging: "নির্ভুলতা ৬০%, গতি ২০%, কোডের মান ২০%",
    tags: "#ওসিআর #বাংলা",
  };
  assert.equal(challengeSchema.safeParse(ok).success, true);
  assert.equal(challengeSchema.safeParse({ ...ok, prize: 0 }).success, true, "a certificate-only challenge is allowed");
  assert.deepEqual(errPaths(challengeSchema.safeParse({ ...ok, prize: -5 })), ["prize"]);
  assert.deepEqual(errPaths(challengeSchema.safeParse({ ...ok, deadline: "2020-01-01" })), ["deadline"]);
  assert.deepEqual(errPaths(challengeSchema.safeParse({ ...ok, description: "কোড দিন" })), ["description"]);
  assert.deepEqual(errPaths(challengeSchema.safeParse({ ...ok, judging: "" })), ["judging"]);
});

test("academy: admission, teaching, final project and complaints", () => {
  const adm = { dept: "motor", goal: "নিজের গ্যারেজ খুলতে চাই, ইঞ্জিনের কাজ শিখে।", years: 0, proof: "" };
  assert.ok(admissionSchema.safeParse(adm).success);
  assert.deepEqual(errPaths(admissionSchema.safeParse({ ...adm, goal: "শিখব" })), ["goal"]);
  assert.deepEqual(errPaths(admissionSchema.safeParse({ ...adm, proof: "garage" })), ["proof"]);

  const teach = { kind: "solo", dept: "motor", newDept: "", skill: "মোটরসাইকেল মেরামত", years: 18, sample: "https://youtu.be/x", plan: "প্রতি সপ্তাহে একটি অংশ খুলে দেখাব, শিক্ষার্থীরা নিজে হাতে জোড়া লাগাবে।", team: "", place: "" };
  assert.ok(teachSchema.safeParse(teach).success);
  assert.deepEqual(errPaths(teachSchema.safeParse({ ...teach, years: 1 })), ["years"]);
  assert.deepEqual(errPaths(teachSchema.safeParse({ ...teach, kind: "team" })), ["team"]);
  assert.ok(teachSchema.safeParse({ ...teach, kind: "team", team: "@anik, mahir" }).success);
  assert.deepEqual(errPaths(teachSchema.safeParse({ ...teach, kind: "team", team: "Anik Hasan!" })), ["team"]);
  assert.deepEqual(errPaths(teachSchema.safeParse({ ...teach, kind: "workshop" })), ["place"]);
  assert.deepEqual(errPaths(teachSchema.safeParse({ ...teach, dept: "new" })), ["newDept"]);
  assert.deepEqual(handleList(" @Anik,mahir  rafi "), ["anik", "mahir", "rafi"]);

  const project = { title: "কার্বুরেটর সার্ভিস", link: "https://youtu.be/y", summary: "একটি পুরোনো ১০০ সিসি বাইকের কার্বুরেটর খুলে পরিষ্কার করে আবার চালু করেছি।" };
  assert.ok(projectSchema.safeParse(project).success);
  assert.deepEqual(errPaths(projectSchema.safeParse({ ...project, link: "" })), ["link"]);

  assert.ok(complaintSchema.safeParse({ kind: "absent", course: "MTR-101", details: "পরপর দুই সপ্তাহ লাইভ ক্লাস হয়নি, কোনো নোটিশও দেননি।" }).success);
  assert.deepEqual(errPaths(complaintSchema.safeParse({ kind: "rude", course: "", details: "পরপর দুই সপ্তাহ লাইভ ক্লাস হয়নি, কোনো নোটিশও দেননি।" })), ["kind"]);
});

test("academy: building a course and marking a final", () => {
  const lesson = (mode: string) => ({ title: "চেইন ও স্প্রকেট", mode, homework: "" });
  const course = { title: "বাইকের চেইন সার্ভিস", dept: "motor", level: "foundation", weeks: 3, fee: 1500, seats: 12, image: "/media/bike-service.webp", outcome: "নিজে চেইন পরিষ্কার, টাইট আর বদলাতে পারবেন।", final: "একটা বাইকের চেইন-স্প্রকেট বদলানো, ভিডিওসহ।", lessons: [lesson("video"), lesson("hands-on")] };
  assert.ok(courseSchema.safeParse(course).success);
  assert.deepEqual(errPaths(courseSchema.safeParse({ ...course, lessons: [lesson("hands-on")] })), ["lessons.0.mode"]);
  assert.deepEqual(errPaths(courseSchema.safeParse({ ...course, weeks: 1 })), ["lessons"]);
  assert.deepEqual(errPaths(courseSchema.safeParse({ ...course, lessons: [] })), ["lessons"]);
  assert.ok(courseSchema.safeParse({ ...course, fee: 0 }).success, "teaching for free is welcome");

  const mark = { scores: [26, 20, 15, 12, 8], comment: "কার্বুরেটর নিজে খুলে দেখালেন, তবে খরচের হিসাবে ভুল ছিল।" };
  assert.ok(markSchema.safeParse(mark).success);
  assert.deepEqual(errPaths(markSchema.safeParse({ ...mark, scores: [31, 20, 15, 12, 8] })), ["scores.0"]);
  assert.deepEqual(errPaths(markSchema.safeParse({ ...mark, scores: [26, 20] })), ["scores"]);
  assert.deepEqual(errPaths(markSchema.safeParse({ ...mark, comment: "ভালো" })), ["comment"]);
});
