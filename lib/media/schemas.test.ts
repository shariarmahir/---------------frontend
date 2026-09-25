import { test } from "node:test";
import assert from "node:assert/strict";
import {
  commentSchema,
  hireSchema,
  identitySchema,
  postSchema,
  profileSchema,
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

test("withdraw: limits and wallet numbers", () => {
  const s = withdrawSchema(10000);
  assert.ok(s.safeParse({ method: "bkash", account: "01712345678", amount: 5000 }).success);
  assert.ok(s.safeParse({ method: "nagad", account: "০১৮১২৩৪৫৬৭৮", amount: 500 }).success);
  assert.deepEqual(errPaths(s.safeParse({ method: "bkash", account: "0171234", amount: 5000 })), ["account"]);
  assert.deepEqual(errPaths(s.safeParse({ method: "bkash", account: "01712345678", amount: 400 })), ["amount"]);
  assert.deepEqual(errPaths(s.safeParse({ method: "bkash", account: "01712345678", amount: 20000 })), ["amount"]);
  assert.ok(s.safeParse({ method: "banglaqr", account: "QR-7310", amount: 1000 }).success);
});
