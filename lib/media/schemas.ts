/**
 * Form schemas for শিক্ষিতদের মিডিয়া (zod), shared by the forms and their
 * tests. Messages are the Bangla text shown under each field.
 */
import { z } from "zod";
import { normalizeDigits, validateNid, validatePassport } from "./identity.ts";

const CATEGORY_IDS = [
  "crafts", "cooking", "tech", "design", "art", "music", "photo", "content", "engineering",
  "homeservice", "teaching", "finance", "beauty", "research", "travel", "sports",
] as const;

const MIN_AGE = 13;

function ageOn(dob: string, today = new Date()): number {
  const d = new Date(dob);
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export const identitySchema = z
  .object({
    docType: z.enum(["nid", "passport"]),
    number: z.string().trim().min(1, "নম্বরটি লিখুন।"),
    fullName: z.string().trim().min(3, "কাগজে যেভাবে লেখা, সেভাবে পূর্ণ নাম লিখুন।"),
    dob: z.string().min(1, "জন্মতারিখ দিন।"),
    front: z.literal(true, { error: "কাগজের সামনের ছবি লাগবে।" }),
    back: z.boolean(),
    selfie: z.literal(true, { error: "মুখ মিলিয়ে দেখার জন্য সেলফি লাগবে।" }),
    consent: z.literal(true, { error: "সম্মতি দিলে তবেই জমা দেওয়া যাবে।" }),
  })
  .superRefine((v, ctx) => {
    const err = v.docType === "nid" ? validateNid(v.number) : validatePassport(v.number);
    if (err) {
      ctx.addIssue({
        code: "custom",
        path: ["number"],
        message:
          v.docType === "nid"
            ? "এনআইডি নম্বর ১০, ১৩ অথবা ১৭ অঙ্কের হয় (শুধু সংখ্যা)।"
            : "পাসপোর্ট নম্বর ৯ অক্ষরের — ১–২টি ইংরেজি অক্ষর, তারপর সংখ্যা।",
      });
    }
    if (v.dob && ageOn(v.dob) < MIN_AGE) ctx.addIssue({ code: "custom", path: ["dob"], message: `অ্যাকাউন্ট খুলতে বয়স অন্তত ${MIN_AGE} বছর হতে হবে।` });
    if (v.docType === "nid" && !v.back) ctx.addIssue({ code: "custom", path: ["back"], message: "এনআইডির পেছনের ছবিও লাগবে।" });
  });
export type IdentityInput = z.infer<typeof identitySchema>;

export const categoriesSchema = z.object({
  categories: z.array(z.enum(CATEGORY_IDS)).min(1, "অন্তত একটি বিভাগ বেছে নিন।").max(5, "সর্বোচ্চ ৫টি বিভাগ।"),
});
export type CategoriesInput = z.infer<typeof categoriesSchema>;

export const profileSchema = z.object({
  displayName: z.string().trim().min(3, "নাম অন্তত ৩ অক্ষরের।").max(40, "নাম ৪০ অক্ষরের মধ্যে রাখুন।"),
  handle: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,20}$/, "৩–২০ অক্ষর: ছোট হাতের ইংরেজি অক্ষর, সংখ্যা বা _"),
  district: z.string().trim().min(1, "জেলা বেছে নিন।"),
  headline: z.string().trim().min(10, "এক লাইনে পরিচয় দিন (অন্তত ১০ অক্ষর)।").max(80, "৮০ অক্ষরের মধ্যে রাখুন।"),
  bio: z.string().trim().max(280, "২৮০ অক্ষরের মধ্যে রাখুন।"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const postSchema = z
  .object({
    kind: z.enum(["skill", "project"]),
    caption: z.string().trim().min(10, "কাজটা কী, কীভাবে করলেন — অন্তত ১০ অক্ষরে লিখুন।").max(1200, "১২০০ অক্ষরের মধ্যে রাখুন।"),
    skill: z.string().trim().min(2, "কোন দক্ষতার প্রমাণ, তা ট্যাগ করুন।").max(40, "দক্ষতার নাম ছোট রাখুন।"),
    category: z.enum(CATEGORY_IDS, { error: "বিভাগ বেছে নিন।" }),
    selfRating: z.number().int().min(1, "১ থেকে ৫-এর মধ্যে দিন।").max(5, "১ থেকে ৫-এর মধ্যে দিন।"),
    media: z
      .array(z.object({ kind: z.enum(["image", "video"]), label: z.string(), src: z.string().optional(), duration: z.string().optional() }))
      .min(1, "অন্তত একটি ছবি বা ভিডিও দিন — প্রমাণ ছাড়া যাচাই হয় না।")
      .max(4, "সর্বোচ্চ ৪টি।"),
    sellable: z.boolean(),
    price: z.number().int().positive().optional(),
    unit: z.string().trim().optional(),
    negotiable: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.sellable) return;
    if (!v.price || v.price < 50) ctx.addIssue({ code: "custom", path: ["price"], message: "বিক্রি করতে দাম দিন (অন্তত ৳৫০)।" });
    if (v.price && v.price >= 50 && !v.unit) ctx.addIssue({ code: "custom", path: ["unit"], message: "একক লিখুন, যেমন ‘প্রতি পিস’।" });
  });
export type PostInput = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  text: z.string().trim().min(2, "কিছু লিখুন।").max(500, "৫০০ অক্ষরের মধ্যে রাখুন।"),
});
export type CommentInput = z.infer<typeof commentSchema>;

export const verifySchema = z
  .object({
    stars: z.number().int().min(1, "তারা বেছে নিন।").max(5),
    verdict: z.enum(["verify", "challenge"]),
    reason: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    if (v.verdict === "challenge" && v.reason.length < 10) {
      ctx.addIssue({ code: "custom", path: ["reason"], message: "চ্যালেঞ্জ করলে কারণ লিখুন (অন্তত ১০ অক্ষর) — কী দেখে মনে হলো দাবিটা বেশি।" });
    }
  });
export type VerifyInput = z.infer<typeof verifySchema>;

export const hireSchema = z.object({
  service: z.string().trim().min(2, "কোন কাজের জন্য, বেছে নিন।"),
  brief: z.string().trim().min(20, "কাজটা অন্তত ২০ অক্ষরে বুঝিয়ে লিখুন।").max(800, "৮০০ অক্ষরের মধ্যে রাখুন।"),
  budget: z.number({ error: "টাকার অঙ্কে বাজেট দিন।" }).int().min(100, "বাজেট অন্তত ৳১০০।"),
  deadline: z
    .string()
    .min(1, "কবের মধ্যে দরকার, তারিখ দিন।")
    .refine((d) => new Date(d).getTime() > Date.now(), "আজকের পরের তারিখ দিন।"),
});
export type HireInput = z.infer<typeof hireSchema>;

export const offerSchema = z.object({
  amount: z.number({ error: "টাকার অঙ্ক লিখুন।" }).int().positive("টাকার অঙ্ক লিখুন।"),
});
export type OfferInput = z.infer<typeof offerSchema>;

export const MIN_WITHDRAW = 500;

export function withdrawSchema(available: number) {
  return z
    .object({
      method: z.enum(["bkash", "nagad", "banglaqr"]),
      account: z.string().trim().min(1, "অ্যাকাউন্ট দিন।"),
      amount: z
        .number({ error: "পরিমাণ লিখুন।" })
        .int()
        .min(MIN_WITHDRAW, `সর্বনিম্ন ৳${MIN_WITHDRAW} তোলা যায়।`)
        .max(available, "ওয়ালেটে এত টাকা নেই।"),
    })
    .superRefine((v, ctx) => {
      if ((v.method === "bkash" || v.method === "nagad") && !/^01[3-9]\d{8}$/.test(normalizeDigits(v.account))) {
        ctx.addIssue({ code: "custom", path: ["account"], message: "১১ অঙ্কের মোবাইল নম্বর দিন, যেমন ০১৭১২৩৪৫৬৭৮।" });
      }
    });
}
export type WithdrawInput = z.infer<ReturnType<typeof withdrawSchema>>;
