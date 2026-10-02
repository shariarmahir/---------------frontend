/**
 * অপরাধ বার্তা — citizen journalism of crimes seen in public. A post stays an
 * unconfirmed claim until enough people confirm they saw it too, and it may
 * never name, number or locate a private person. Pure rules, tested.
 */

export type CrimeKind = "nuisance" | "fake" | "extortion" | "theft" | "harassment" | "fraud" | "drugs" | "bribe" | "traffic";

/** Where to report each kind besides posting. Numbers are the national lines. */
export const CRIME_KINDS: Record<CrimeKind, { bn: string; hint: string; line: { label: string; tel: string } }> = {
  nuisance: { bn: "জনস্থানে আইনভঙ্গ", hint: "রাস্তায় প্রস্রাব, ময়লা ফেলা, প্রকাশ্যে ধূমপান", line: { label: "সরকারি তথ্য ও সেবা", tel: "333" } },
  fake: { bn: "ভেজাল ও নকল পণ্য", hint: "নকল ওষুধ, ভেজাল খাবার, মেয়াদোত্তীর্ণ পণ্য", line: { label: "ভোক্তা অধিকার", tel: "16121" } },
  extortion: { bn: "চাঁদাবাজি", hint: "দোকান, পরিবহন বা নির্মাণে জোর করে টাকা", line: { label: "জাতীয় জরুরি সেবা", tel: "999" } },
  theft: { bn: "চুরি-ছিনতাই", hint: "মোবাইল, ব্যাগ, মোটরসাইকেল", line: { label: "জাতীয় জরুরি সেবা", tel: "999" } },
  harassment: { bn: "হয়রানি ও ইভটিজিং", hint: "পথে, যানবাহনে, কর্মস্থলে", line: { label: "নারী ও শিশু নির্যাতন প্রতিরোধ", tel: "109" } },
  fraud: { bn: "প্রতারণা ও স্ক্যাম", hint: "অনলাইন, মোবাইল ব্যাংকিং, চাকরির নামে", line: { label: "জাতীয় জরুরি সেবা", tel: "999" } },
  drugs: { bn: "মাদক", hint: "কেনাবেচা বা প্রকাশ্যে সেবন", line: { label: "জাতীয় জরুরি সেবা", tel: "999" } },
  bribe: { bn: "ঘুষ ও দুর্নীতি", hint: "সেবা পেতে টাকা চাওয়া", line: { label: "দুদক হটলাইন", tel: "106" } },
  traffic: { bn: "সড়কে আইনভঙ্গ", hint: "উল্টো পথ, ফুটপাতে বাইক, বেপরোয়া চালানো", line: { label: "জাতীয় জরুরি সেবা", tel: "999" } },
};

export interface CrimeMedia {
  kind: "image" | "video";
  label: string;
  /** Missing on sample posts: a labelled placeholder is drawn instead. */
  src?: string;
}

export interface CrimePost {
  id: string;
  kind: CrimeKind;
  title: string;
  body: string;
  area: string;
  district: string;
  /** ISO date-time. */
  at: string;
  /** Null when posted anonymously (a verified person is still behind it). */
  by: string | null;
  media: CrimeMedia[];
  /** Blurred until the reader chooses to see it. */
  sensitive?: boolean;
  witnesses: number;
  flags: number;
  /** Where the poster also reported it, e.g. "৯৯৯". */
  reportedTo?: string;
}

/** Different people who must confirm before a claim reads as witnessed. */
export const WITNESS_THRESHOLD = 5;
/** Flags that send a post to review (hidden behind a notice). */
export const FLAG_THRESHOLD = 3;

export function crimeStatus(witnesses: number, flags: number): "claimed" | "witnessed" | "review" {
  if (flags >= FLAG_THRESHOLD) return "review";
  return witnesses >= WITNESS_THRESHOLD ? "witnessed" : "claimed";
}

const toLatin = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

/** What in a post could identify a private person: phone, ID number, email. */
export function privacyIssues(text: string): ("phone" | "id" | "email")[] {
  const t = toLatin(text).replace(/(?<=\d)[\s-]+(?=\d)/g, "");
  const issues: ("phone" | "id" | "email")[] = [];
  const phone = /(?:\+?880|0)1[3-9]\d{8}(?!\d)/g;
  if (phone.test(t)) issues.push("phone");
  if (/(?<!\d)(?:\d{17}|\d{13}|\d{10})(?!\d)/.test(t.replace(phone, ""))) issues.push("id");
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(t)) issues.push("email");
  return issues;
}

/** A square to cover (a face, a plate) around a tap, kept inside the image. */
export function pixelBox(x: number, y: number, width: number, height: number, frac: number): { x: number; y: number; size: number } {
  const size = Math.round(width * frac);
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, Math.round(v)));
  return { x: clamp(x - size / 2, width - size), y: clamp(y - size / 2, height - size), size };
}
