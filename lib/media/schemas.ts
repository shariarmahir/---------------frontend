/**
 * Form schemas for শিক্ষিতদের মিডিয়া (zod), shared by the forms and their
 * tests. Messages are the Bangla text shown under each field.
 */
import { z } from "zod";
import { fairPayFloor, payUnitBn } from "./fair-pay.ts";
import { bnDigits, taka } from "./format.ts";
import type { PriceBand } from "./fair-price.ts";
import { normalizeDigits, validateNid, validatePassport } from "./identity.ts";

const CATEGORY_IDS = [
  "crafts", "cooking", "tech", "design", "art", "music", "photo", "content", "engineering",
  "homeservice", "teaching", "finance", "beauty", "research", "travel", "sports", "shop", "rent", "fashion", "farm", "legal", "other",
] as const;

const futureDate = (msg: string) =>
  z
    .string()
    .min(1, msg)
    .refine((d) => new Date(d).getTime() > Date.now(), "আজকের পরের তারিখ দিন।");

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

export const POST_TOPICS = ["skill", "education", "research", "team", "talent", "entertainment", "daily", "help", "rights"] as const;
export const FEELINGS = ["happy", "grateful", "proud", "excited", "celebrating", "calm", "learning", "working", "thinking", "sad"] as const;
export const POST_BGS = ["gold", "green", "orange", "white", "ink"] as const;
/** Longest caption a coloured background takes. */
export const BG_MAX = 160;
/** Topics whose posts carry a self-rating for the community to verify. */
export const RATED_TOPICS: readonly (typeof POST_TOPICS)[number][] = ["skill", "education", "research", "team"];

export const postSchema = z
  .object({
    /** Omitted means "skill". */
    topic: z.enum(POST_TOPICS).optional(),
    kind: z.enum(["skill", "project"]),
    caption: z.string().trim().max(1200, "১২০০ অক্ষরের মধ্যে রাখুন।"),
    skill: z.string().trim().max(40, "দক্ষতার নাম ছোট রাখুন।"),
    category: z.enum(CATEGORY_IDS, { error: "বিভাগ বেছে নিন।" }),
    selfRating: z.number().int().min(1, "১ থেকে ৫-এর মধ্যে দিন।").max(5, "১ থেকে ৫-এর মধ্যে দিন।"),
    media: z
      .array(z.object({ kind: z.enum(["image", "video"]), label: z.string(), src: z.string().optional(), duration: z.string().optional() }))
      .max(4, "সর্বোচ্চ ৪টি।"),
    sellable: z.boolean(),
    price: z.number().int().positive().optional(),
    unit: z.string().trim().optional(),
    negotiable: z.boolean().optional(),
    feeling: z.enum(FEELINGS).optional(),
    bg: z.enum(POST_BGS).optional(),
    audience: z.enum(["public", "followers", "private"]).optional(),
    place: z.string().trim().max(60, "জায়গার নাম ছোট রাখুন।").optional(),
  })
  .superRefine((v, ctx) => {
    // A post can be about anything, as long as there is something to see: words, a photo or a video.
    if (!v.caption && v.media.length === 0) ctx.addIssue({ code: "custom", path: ["caption"], message: "কিছু লিখুন, অথবা ছবি বা ভিডিও দিন।" });
    if (v.bg && v.media.length === 0 && v.caption.length > BG_MAX) {
      ctx.addIssue({ code: "custom", path: ["caption"], message: "রঙিন পটভূমিতে ১৬০ অক্ষর পর্যন্ত লেখা যায় — পটভূমি সরান বা লেখা ছোট করুন।" });
    }
    if (RATED_TOPICS.includes(v.topic ?? "skill")) {
      if (v.caption.length < 10) ctx.addIssue({ code: "custom", path: ["caption"], message: "কাজটা কী, কীভাবে করলেন — অন্তত ১০ অক্ষরে লিখুন।" });
      if (v.media.length === 0) ctx.addIssue({ code: "custom", path: ["media"], message: "অন্তত একটি ছবি বা ভিডিও দিন — প্রমাণ ছাড়া যাচাই হয় না।" });
      if (v.skill.length < 2) ctx.addIssue({ code: "custom", path: ["skill"], message: "কোন দক্ষতার প্রমাণ, তা ট্যাগ করুন।" });
    }
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

/** A free job post; `bandFor` supplies each sector's fair band for per-task pay. */
export function jobSchema(bandFor: (sector: (typeof CATEGORY_IDS)[number]) => PriceBand) {
  return z
    .object({
      title: z.string().trim().min(4, "পদের নাম লিখুন।").max(80, "৮০ অক্ষরের মধ্যে রাখুন।"),
      org: z.string().trim().min(2, "প্রতিষ্ঠান বা আপনার নাম দিন।").max(60),
      sector: z.enum(CATEGORY_IDS, { error: "খাত বেছে নিন।" }),
      type: z.enum(["full", "part", "gig", "intern"]),
      location: z.string().trim().min(2, "কোথায় কাজ, লিখুন।"),
      remote: z.boolean(),
      payMin: z.number({ error: "বেতন লিখুন — বেতন ছাড়া পোস্ট হয় না।" }).int().positive("বেতন লিখুন — বেতন ছাড়া পোস্ট হয় না।"),
      payMax: z.number({ error: "সর্বোচ্চ বেতন লিখুন।" }).int().positive("সর্বোচ্চ বেতন লিখুন।"),
      payUnit: z.enum(["month", "hour", "task"]),
      description: z.string().trim().min(30, "কাজটা অন্তত ৩০ অক্ষরে বুঝিয়ে লিখুন।").max(1200),
      tags: z.string().trim().max(120),
      studentFriendly: z.boolean(),
      deadline: futureDate("আবেদনের শেষ তারিখ দিন।"),
    })
    .superRefine((v, ctx) => {
      const floor = fairPayFloor(v.payUnit, bandFor(v.sector));
      if (v.payMin < floor) ctx.addIssue({ code: "custom", path: ["payMin"], message: `ন্যায্য মজুরির নিচে — ${payUnitBn[v.payUnit]} অন্তত ${taka(floor, "bn")} দিতে হবে।` });
      else if (v.payMax < v.payMin) ctx.addIssue({ code: "custom", path: ["payMax"], message: "সর্বোচ্চ বেতন সর্বনিম্নের চেয়ে কম হতে পারে না।" });
    });
}
export type JobInput = z.infer<ReturnType<typeof jobSchema>>;

export const civicSchema = z.object({
  kind: z.enum(["sanitation", "road", "crime", "extortion", "harassment", "utility", "environment", "help"]),
  title: z.string().trim().min(8, "এক লাইনে সমস্যাটা লিখুন।").max(90),
  area: z.string().trim().min(2, "এলাকা লিখুন।"),
  district: z.string().trim().min(1, "জেলা বেছে নিন।"),
  description: z.string().trim().min(20, "কী দেখেছেন, কখন, কোথায় — অন্তত ২০ অক্ষরে লিখুন।").max(1000),
  severity: z.enum(["low", "medium", "high"]),
  anonymous: z.boolean(),
});
export type CivicInput = z.infer<typeof civicSchema>;

export const solutionSchema = z.object({
  text: z.string().trim().min(15, "সমাধানটা অন্তত ১৫ অক্ষরে লিখুন।").max(500),
});
export type SolutionInput = z.infer<typeof solutionSchema>;

export const eventSchema = z.object({
  kind: z.enum(["tree", "cleanup", "blood", "relief", "awareness", "repair"]),
  title: z.string().trim().min(6, "উদ্যোগের নাম দিন।").max(80),
  area: z.string().trim().min(2, "এলাকা লিখুন।"),
  district: z.string().trim().min(1, "জেলা বেছে নিন।"),
  date: futureDate("কবে হবে, তারিখ দিন।"),
  goal: z.number({ error: "কতজন লাগবে লিখুন।" }).int().min(2, "অন্তত ২ জন।").max(10000),
  description: z.string().trim().min(20, "কী করা হবে, অন্তত ২০ অক্ষরে লিখুন।").max(1000),
  needs: z.string().trim().max(200),
});
export type EventInput = z.infer<typeof eventSchema>;

export const sponsorSchema = z.object({
  name: z.string().trim().min(2, "প্রতিষ্ঠানের নাম দিন।").max(60),
  offer: z.string().trim().min(4, "কী দেবেন লিখুন — যেমন ‘লোগোসহ ৫০টি টি-শার্ট’।").max(100),
});
export type SponsorInput = z.infer<typeof sponsorSchema>;

const short = z.string().trim().max(80);

export const teamSchema = z.object({
  kind: z.enum(["family", "lab", "project", "travel", "sports", "esports"]),
  name: z.string().trim().min(3, "টিমের নাম দিন।").max(50),
  district: z.string().trim().min(1, "জেলা বেছে নিন।"),
  about: z.string().trim().min(20, "টিম কী করে, অন্তত ২০ অক্ষরে লিখুন।").max(500),
  tags: z.string().trim().max(100),
  limit: z.number({ error: "সদস্যসংখ্যা লিখুন।" }).int().min(2, "অন্তত ২ জন।").max(100, "সর্বোচ্চ ১০০ জন।"),
  game: z.enum(["pubgm", "freefire", "mlbb", "valorant", "dota2", "cs2"]),
  rank: short,
  scrims: short,
  university: short,
  supervisor: short,
  /** Comma-separated lists: research areas, open roles or positions. */
  focus: short,
  roles: short,
  sport: short,
  ageGroup: short,
  practice: short,
});
export type TeamInput = z.infer<typeof teamSchema>;

export const challengeSchema = z.object({
  kind: z.enum(["code", "design", "research", "assignment", "lab"]),
  title: z.string().trim().min(6, "চ্যালেঞ্জের নাম দিন।").max(80),
  host: z.string().trim().min(2, "কে আয়োজন করছে লিখুন — নিজে হলে “নিজে”।").max(60),
  category: z.enum(CATEGORY_IDS),
  prize: z.number({ error: "পুরস্কার লিখুন — শুধু সনদ হলে ০।" }).int().min(0, "পুরস্কার ঋণাত্মক হতে পারে না।").max(1_000_000),
  deadline: futureDate("শেষ তারিখ দিন।"),
  teams: z.boolean(),
  description: z.string().trim().min(30, "সমস্যাটা অন্তত ৩০ অক্ষরে বুঝিয়ে লিখুন।").max(800),
  judging: z.string().trim().min(5, "কীভাবে বিচার হবে লিখুন।").max(200),
  tags: z.string().trim().max(120),
});
export type ChallengeInput = z.infer<typeof challengeSchema>;

export const entrySchema = z.object({
  summary: z.string().trim().min(20, "আপনার সমাধান অন্তত ২০ অক্ষরে বুঝিয়ে লিখুন।").max(800),
  link: z.union([z.literal(""), z.url("সঠিক লিংক দিন, যেমন https://github.com/…")]),
  team: z.string().trim().max(50),
});
export type EntryInput = z.infer<typeof entrySchema>;

export const noteSchema = z.object({
  text: z.string().trim().min(1, "কিছু লিখুন।").max(280, "২৮০ অক্ষরের মধ্যে রাখুন।"),
  color: z.enum(["yellow", "green", "orange", "blue"]),
  best: z.boolean(),
});
export type NoteInput = z.infer<typeof noteSchema>;

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

/* ── কাণ্ডারী তৈরি একাডেমি ───────────────────────────────────────────── */

/** Handles in a free-text list: "@anik, mahir" → ["anik", "mahir"]. */
export const handleList = (raw: string) =>
  raw
    .split(/[\s,]+/)
    .map((h) => h.replace(/^@/, "").toLowerCase())
    .filter(Boolean);

/** The admission form; the test score is added when it is marked. */
export const admissionSchema = z.object({
  dept: z.string().min(1, "একটি বিভাগ বেছে নিন।"),
  goal: z.string().trim().min(20, "কেন শিখতে চান — অন্তত এক লাইন লিখুন।").max(400, "৪০০ অক্ষরের মধ্যে রাখুন।"),
  years: z.number({ error: "বছর লিখুন, না থাকলে ০।" }).int().min(0).max(60, "৬০ বছরের মধ্যে লিখুন।"),
  proof: z.union([z.literal(""), z.url("সঠিক লিংক দিন, যেমন https://…")]),
});
export type AdmissionInput = z.infer<typeof admissionSchema>;

export const TEACH_KINDS = ["solo", "team", "workshop"] as const;
export const MIN_TEACH_YEARS = 2;

/** Applying to teach: proof of skill first, then a panel interview. */
export const teachSchema = z
  .object({
    kind: z.enum(TEACH_KINDS),
    dept: z.string().min(1, "একটি বিভাগ বেছে নিন।"),
    newDept: z.string().trim().max(60, "৬০ অক্ষরের মধ্যে রাখুন।"),
    skill: z.string().trim().min(2, "কী শেখাবেন লিখুন।").max(60),
    years: z.number({ error: "বছর লিখুন।" }).int().min(MIN_TEACH_YEARS, `শেখাতে অন্তত ${bnDigits(MIN_TEACH_YEARS)} বছরের হাতে-কলমে অভিজ্ঞতা লাগে।`).max(60),
    sample: z.url("একটি নমুনা ক্লাসের ভিডিও লিংক দিন।"),
    plan: z.string().trim().min(40, "ক্লাসের পরিকল্পনা অন্তত ৪০ অক্ষরে লিখুন।").max(800, "৮০০ অক্ষরের মধ্যে রাখুন।"),
    team: z.string().trim().max(200),
    place: z.string().trim().max(120),
  })
  .superRefine((v, ctx) => {
    if (v.dept === "new" && v.newDept.length < 3) ctx.addIssue({ code: "custom", path: ["newDept"], message: "নতুন বিভাগের নাম লিখুন।" });
    const team = handleList(v.team);
    if (v.kind === "team" && team.length === 0) ctx.addIssue({ code: "custom", path: ["team"], message: "দলের অন্তত একজনের @হ্যান্ডেল দিন।" });
    if (team.some((h) => !/^[a-z0-9_]{3,20}$/.test(h))) ctx.addIssue({ code: "custom", path: ["team"], message: "হ্যান্ডেল হয় ছোট হাতের ইংরেজি অক্ষর, সংখ্যা বা _ দিয়ে।" });
    if (v.kind === "workshop" && v.place.length < 5) ctx.addIssue({ code: "custom", path: ["place"], message: "কর্মশালার ঠিকানা দিন — ক্লাস সেখানেই হবে।" });
  });
export type TeachInput = z.infer<typeof teachSchema>;

/** The final project the panel interview is about. */
export const projectSchema = z.object({
  title: z.string().trim().min(4, "প্রজেক্টের নাম দিন।").max(100),
  link: z.url("প্রজেক্টের লিংক দিন — ভিডিও, ছবি বা কোড।"),
  summary: z.string().trim().min(40, "কী বানালেন, কীভাবে — অন্তত ৪০ অক্ষরে লিখুন।").max(1000, "১০০০ অক্ষরের মধ্যে রাখুন।"),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const complaintSchema = z.object({
  kind: z.enum(["absent", "quality", "money", "behaviour", "safety"], { error: "অভিযোগের ধরন বেছে নিন।" }),
  course: z.string(),
  details: z.string().trim().min(20, "কী হয়েছিল, কবে — অন্তত ২০ অক্ষরে লিখুন।").max(1000, "১০০০ অক্ষরের মধ্যে রাখুন।"),
});
export type ComplaintInput = z.infer<typeof complaintSchema>;
