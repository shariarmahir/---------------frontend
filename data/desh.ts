/**
 * "বাংলাদেশ সমস্যা ও সমাধান" — copy for the merged country page (/bangladesh).
 *
 * The page reads in four acts: আমার বাংলাদেশ (the story, components/bangladesh),
 * সংকট ও ঢাল (future risk and the citizen shield), সমস্যা (the 32 problems,
 * pixel by pixel), সমাধান (what we have, what we drop, who does what).
 *
 * Figures are only those already sourced in data/amar-bangladesh.ts or
 * data/bangladesh.ts; everything else here is guidance, written as such.
 */

import { puzzleOf, type Decision } from "./gori/puzzles.ts";

export interface Act {
  id: string;
  n: string;
  label: string;
  title: string;
  line: string;
}

export const ACTS: Act[] = [
  { id: "amar-desh", n: "১", label: "আমার বাংলাদেশ", title: "যে দেশকে আমরা ভালোবাসি", line: "হাজার বছরের ইতিহাস, নদী-মাঠ-পাহাড়, ভাষার জন্য রক্ত আর একাত্তরের বিজয়।" },
  { id: "crisis", n: "২", label: "সংকট ও ঢাল", title: "সামনের ঝুঁকি, আর আমাদের ঢাল", line: "যে সংকট দেশকে আঘাত করছে — আর নিজের এলাকা রক্ষায় নাগরিকের দায়িত্ব।" },
  { id: "problems", n: "৩", label: "সমস্যা", title: "পিক্সেল বাই পিক্সেল সমস্যা", line: "৩২টি বাস্তব সমস্যা — প্রমাণ, মাঠের কষ্ট আর গ্রামের মানুষের জীবন।" },
  { id: "solutions", n: "৪", label: "সমাধান", title: "বাস্তব সমাধান, একসাথে", line: "যা আমাদের আছে, যা ছাড়তে হবে, আর কে কী করবে — দয়া আর সাহস নিয়ে।" },
];

/**
 * The five pages of the country section, in reading order — one route each,
 * matching the header nav. The hero's chapter cards and the pager at the
 * foot of every page read from here.
 */
export interface DeshChapter {
  href: string;
  n: string;
  label: string;
  blurb: string;
}

export const DESH_CHAPTERS: DeshChapter[] = [
  { href: "/bangladesh", n: "১", label: "ইতিহাস", blurb: "হাজার বছরের গল্প, নদী-মাঠ-পাহাড়, ভাষা আর একাত্তর।" },
  { href: "/bangladesh/crisis", n: "২", label: "সংকট", blurb: "যে ঝুঁকি দেশকে আঘাত করছে।" },
  { href: "/bangladesh/shield", n: "৩", label: "নাগরিক ঢাল", blurb: "নিজের এলাকা রক্ষায় নাগরিকের দায়িত্ব।" },
  { href: "/bangladesh/problems", n: "৪", label: "৩২টি সমস্যা", blurb: "প্রমাণসহ পিক্সেল বাই পিক্সেল সমস্যা।" },
  { href: "/bangladesh/solutions", n: "৫", label: "সমাধান", blurb: "যা আছে, যা ছাড়তে হবে, কে কী করবে।" },
];

/* ── Act 2 · the attacks and the shield ─────────────────────────────── */

export interface CrisisAttack {
  id: string;
  icon: string;
  threat: string;
  /** How it shows up in an ordinary household. */
  feels: string;
  /** What a citizen can hold up against it, today. */
  shield: string;
  problem: number;
}

export const CRISIS_ATTACKS: CrisisAttack[] = [
  { id: "prices", icon: "shopping_basket", threat: "দ্রব্যমূল্যের চাপ", feels: "একই বাজারে প্রতি মাসে কম জিনিস।", shield: "পাড়ায় দাম লিখে রাখুন, মজুতদারির খবর দিন, একসাথে কিনুন।", problem: 19 },
  { id: "bribe", icon: "front_hand", threat: "ঘুষ ও দুর্নীতি", feels: "সেবার জন্য টাকা না দিলে ফাইল নড়ে না।", shield: "রসিদ চান, অভিযোগ লিখিত দিন, দুদকের ১০৬-এ জানান।", problem: 7 },
  { id: "fake", icon: "report", threat: "ভেজাল ও নকল পণ্য", feels: "ওষুধ, দুধ, তেল — কোনটা আসল বোঝা যায় না।", shield: "রসিদ রাখুন, ভোক্তা অধিদপ্তরে ১৬১২১-এ অভিযোগ করুন।", problem: 14 },
  { id: "flood", icon: "flood", threat: "বন্যা, ভাঙন ও জলবায়ু", feels: "প্রতি বর্ষায় ঘর আর ফসল ঝুঁকিতে।", shield: "আগাম সতর্কবার্তা ছড়িয়ে দিন, আশ্রয়কেন্দ্র চিনে রাখুন, খাল দখলমুক্ত রাখুন।", problem: 16 },
  { id: "jobs", icon: "work_off", threat: "বেকারত্ব ও অনিশ্চিত কাজ", feels: "ডিগ্রি আছে, কাজ নেই; কাজ আছে, চুক্তি নেই।", shield: "পাড়ার তরুণদের দক্ষতা শেখান, স্থানীয় কাজে স্থানীয়দের সুযোগ দিন।", problem: 3 },
  { id: "justice", icon: "gavel", threat: "বিচারহীনতা", feels: "মামলা বছরের পর বছর, গরিবের পক্ষে কেউ নেই।", shield: "বিনামূল্যে আইনি সহায়তা ১৬৪৩০ — ভুক্তভোগীর পাশে দাঁড়ান, সাক্ষী হতে ভয় পাবেন না।", problem: 23 },
  { id: "drain", icon: "flight_takeoff", threat: "মেধা পাচার", feels: "সবচেয়ে ভালো ছাত্রটি দেশ ছাড়ার পরিকল্পনা করছে।", shield: "দেশের ল্যাব, স্টার্টআপ আর গবেষণায় সুযোগ ও সম্মান দিন।", problem: 31 },
  { id: "rumour", icon: "campaign", threat: "গুজব ও বিভেদ", feels: "যাচাই ছাড়া একটি পোস্টেই পাড়ায় আগুন।", shield: "শেয়ারের আগে যাচাই করুন; ভিন্নমতের প্রতিবেশীকেও রক্ষা করুন।", problem: 32 },
];

export interface ShieldLayer {
  id: string;
  ring: string;
  title: string;
  promise: string;
  acts: string[];
  kindness: string;
}

/** From the self outward — each ring protects the one around it. */
export const SHIELD_LAYERS: ShieldLayer[] = [
  {
    id: "self",
    ring: "আমি",
    title: "নিজেকে ঠিক রাখা",
    promise: "ঘুষ দেব না, নেব না। ভেজাল বেচব না। মিথ্যা ছড়াব না।",
    acts: ["রসিদ ছাড়া লেনদেন নয়", "সময়মতো কাজ, কথা দিলে কথা রাখা", "রাস্তায় ময়লা নয়"],
    kindness: "নিজের সততাই প্রথম ঢাল — আর কেউ না দেখলেও।",
  },
  {
    id: "family",
    ring: "পরিবার",
    title: "ঘরে ন্যায্যতা",
    promise: "ঘরের কাজ সবাই ভাগ করব। মেয়ে ও ছেলে সমান সুযোগ পাবে।",
    acts: ["সন্তানকে প্রশ্ন করতে শেখানো", "প্রবীণের যত্ন ভাগ করে নেওয়া", "ঘরে পানি-বিদ্যুৎ বাঁচানো"],
    kindness: "যে ঘরে সম্মান আছে, সেখান থেকেই সৎ নাগরিক বের হয়।",
  },
  {
    id: "para",
    ring: "পাড়া-মহল্লা",
    title: "প্রতিবেশীর খোঁজ",
    promise: "একা কেউ বিপদে থাকবে না — আমরা খোঁজ রাখব।",
    acts: ["অসুস্থ, একা ও প্রবীণের তালিকা", "পাড়ার দাম-তালিকা ও ভেজাল-সতর্কতা", "রাতের আলো আর নিরাপদ পথ"],
    kindness: "দুর্যোগে সরকার পৌঁছানোর আগে প্রতিবেশীই পৌঁছায়।",
  },
  {
    id: "union",
    ring: "ইউনিয়ন / ওয়ার্ড",
    title: "স্থানীয় সেবার পাহারা",
    promise: "স্কুল, ক্লিনিক, বাঁধ আর বাজার — আমাদের চোখের সামনে চলবে।",
    acts: ["ইউনিয়ন বাজেট সভায় উপস্থিত থাকা", "তথ্য অধিকার আইনে তথ্য চাওয়া", "খাল-পুকুর দখলমুক্ত রাখা"],
    kindness: "অভিযোগ দিন, কিন্তু সমাধানের হাতও বাড়িয়ে দিন।",
  },
  {
    id: "city",
    ring: "শহর / উপজেলা",
    title: "নগর অধিকার রক্ষা",
    promise: "ফুটপাত, পানি, পরিচ্ছন্নতা আর নিরাপত্তা — এগুলো দয়া নয়, অধিকার।",
    acts: ["জলাবদ্ধতা ও ভাঙা রাস্তার ছবি-সহ রিপোর্ট", "গণপরিবহনে নারী-শিশুর নিরাপত্তা", "সবুজ জায়গা ও খেলার মাঠ রক্ষা"],
    kindness: "শহরটা সবার — রিকশাচালক থেকে অফিসার, সমান সম্মানে।",
  },
  {
    id: "desh",
    ring: "দেশ",
    title: "দেশের প্রতি দায়",
    promise: "আইন মানব, কর দেব, ভোট দেব, আর অন্যায় দেখলে চুপ থাকব না।",
    acts: ["রাষ্ট্রীয় সম্পদ নিজের সম্পদের মতো রক্ষা", "মেধা ও শ্রম দেশে কাজে লাগানো", "ভিন্নমতকে সম্মান"],
    kindness: "সংবিধানের ২১ অনুচ্ছেদ: আইন মানা, শৃঙ্খলা রক্ষা, জনগণের কর্তব্য পালন আর জাতীয় সম্পত্তি রক্ষা প্রত্যেক নাগরিকের কর্তব্য।",
  },
];

export interface CityRight {
  right: string;
  icon: string;
  what: string;
  myPart: string;
}

export const CITY_RIGHTS: CityRight[] = [
  { right: "নিরাপদ পানি", icon: "water_drop", what: "প্রতিটি ঘরে পানযোগ্য পানি।", myPart: "পানির অপচয় বন্ধ, দূষিত লাইনের খবর ওয়াসা/পৌরসভায়।" },
  { right: "পরিচ্ছন্ন শহর", icon: "delete", what: "নিয়মিত বর্জ্য সংগ্রহ, খোলা ড্রেন নয়।", myPart: "নির্দিষ্ট সময়ে নির্দিষ্ট জায়গায় ময়লা, ড্রেনে প্লাস্টিক নয়।" },
  { right: "হাঁটার পথ", icon: "directions_walk", what: "দখলমুক্ত ফুটপাত, নিরাপদ পারাপার।", myPart: "ফুটপাতে দোকান-পার্কিং নয়, জেব্রা ক্রসিং মানা।" },
  { right: "ন্যায্য দাম", icon: "sell", what: "মূল্য তালিকা টাঙানো, ওজনে সঠিক।", myPart: "রসিদ চাওয়া, ভেজাল দেখলে অভিযোগ।" },
  { right: "নিরাপদ চলাচল", icon: "shield_person", what: "রাতে আলো, নারী ও শিশুর জন্য নিরাপদ রাস্তা।", myPart: "হয়রানি দেখলে ৯৯৯, পাশে দাঁড়ানো।" },
  { right: "খোলা জায়গা", icon: "park", what: "মাঠ, পার্ক আর জলাশয় সবার জন্য।", myPart: "দখলের খবর জানানো, গাছ লাগানো ও রক্ষা।" },
  { right: "শান্ত বাতাস", icon: "air", what: "শব্দ ও বায়ুদূষণ সহনীয় মাত্রায়।", myPart: "অকারণে হর্ন নয়, খোলা জায়গায় আবর্জনা পোড়ানো নয়।" },
  { right: "তথ্য জানা", icon: "info", what: "সরকারি কাজ ও বাজেট জানার অধিকার (তথ্য অধিকার আইন, ২০০৯)।", myPart: "লিখিত আবেদনে তথ্য চাওয়া, উত্তর না এলে আপিল।" },
];

/* ── Act 4 · solutions ──────────────────────────────────────────────── */

export interface Resource {
  icon: string;
  title: string;
  body: string;
}

/** What Bangladesh already has. Numbers only where a source already backs them. */
export const RESOURCES: Resource[] = [
  { icon: "groups", title: "মানুষ", body: "প্রায় ১৭.৬ কোটি মানুষ (বিশ্বব্যাংক, ২০২৫) — এদের বড় অংশ তরুণ। জনসংখ্যা বোঝা নয়, সবচেয়ে বড় শক্তি।" },
  { icon: "grass", title: "উর্বর পলিমাটি", body: "নদীর রেখে যাওয়া পলিতে বছরে একাধিক ফসল হয়। মাটি আছে — দরকার ন্যায্য দাম আর আধুনিক পরামর্শ।" },
  { icon: "water", title: "নদী ও পানি", body: "শত শত নদী সেচ, মাছ আর নৌপথ দেয়। দখল আর দূষণ থামালে নদীই অর্থনীতি।" },
  { icon: "handyman", title: "শ্রম ও দক্ষতা", body: "কৃষক, জেলে, পোশাককর্মী, প্রবাসী — এঁদের হাতেই অর্থনীতি চলে। দক্ষতার সনদ আর সম্মান পেলে উৎপাদন বাড়ে।" },
  { icon: "volunteer_activism", title: "একসাথে দাঁড়ানোর অভ্যাস", body: "১৯৭০ সালের পর ঘূর্ণিঝড়ে মৃত্যু প্রায় ১০০ গুণ কমেছে — আগাম সতর্কতা, আশ্রয়কেন্দ্র আর স্বেচ্ছাসেবকের সমন্বয়ে।" },
  { icon: "lightbulb", title: "মেধা", body: "ছাত্র, গবেষক আর উদ্যোক্তা — সুযোগ পেলে দেশের সমস্যার সমাধান দেশেই তৈরি হয়।" },
];

export interface LetGo {
  id: string;
  habit: string;
  cost: string;
  instead: string;
  /** Highlighted: the founder's first priority. */
  key?: true;
}

export const LET_GO: LetGo[] = [
  {
    id: "living-cost",
    habit: "জীবনযাত্রার ব্যয় বাড়িয়ে দেওয়া",
    cost: "মজুতদারি, সিন্ডিকেট আর ‘সবাই বাড়াচ্ছে, আমিও বাড়াই’ — প্রতি ধাপে বাড়তি দাম শেষে পড়ে গরিবের থালায়।",
    instead: "খামার থেকে বাজার পর্যন্ত প্রতিটি ধাপের দাম প্রকাশ্যে; পাড়ায় সমবায়ে কেনা; ন্যায্য লাভে সন্তুষ্ট ব্যবসা; অযৌক্তিক দাম দেখলে অভিযোগ।",
    key: true,
  },
  {
    id: "greed",
    habit: "লোভ",
    cost: "অল্প সময়ে বেশি পাওয়ার চেষ্টা ভেজাল, দখল আর ঠকানোর জন্ম দেয়।",
    instead: "সৎ আয়ে সম্মান — সমাজ যেন অসৎ ধনীকে নয়, সৎ কর্মীকে সম্মান করে।",
  },
  {
    id: "illegal",
    habit: "অবৈধ কাজ ও দখল",
    cost: "নদী, খাল, ফুটপাত আর সরকারি জমি দখলে সবার ক্ষতি, কয়েকজনের লাভ।",
    instead: "দখল দেখলে প্রমাণসহ রিপোর্ট, আর নিজেরা কোনো দখলের সুবিধা না নেওয়া।",
  },
  {
    id: "blame",
    habit: "শুধু দোষারোপ",
    cost: "“সব দোষ ওদের” বললে কেউ কাজ শুরু করে না।",
    instead: "প্রশ্ন বদলান: “আজ আমার এলাকায় আমি কোন একটি জিনিস ঠিক করতে পারি?”",
  },
];

export interface DutyColumn {
  id: string;
  who: string;
  icon: string;
  lead: string;
  items: string[];
}

export const DUTY_COLUMNS: DutyColumn[] = [
  {
    id: "state",
    who: "সরকারের দায়িত্ব",
    icon: "account_balance",
    lead: "নিয়ম, সেবা আর ন্যায়বিচার — এগুলো রাষ্ট্রকেই নিশ্চিত করতে হবে।",
    items: ["ন্যায্য বাজার তদারকি ও মজুতদারির শাস্তি", "সময়মতো ও স্বচ্ছ সরকারি সেবা", "দ্রুত ও নিরপেক্ষ বিচার", "সঠিক, প্রকাশ্য তথ্য", "গ্রামে ডাক্তার, প্রকৌশলী, কৃষি কর্মকর্তার উপস্থিতি"],
  },
  {
    id: "citizen",
    who: "নাগরিকের দায়িত্ব",
    icon: "person_check",
    lead: "সরকার একা পারে না — আর সরকার না পারলে আমরা থেমে থাকব না।",
    items: ["আইন মানা ও কর দেওয়া", "ঘুষ না দেওয়া, রসিদ চাওয়া", "নিজের এলাকার খোঁজ রাখা", "প্রমাণসহ অভিযোগ, গুজব নয়", "ভোট দেওয়া ও প্রশ্ন করা"],
  },
  {
    id: "together",
    who: "একে অপরকে সাহায্য",
    icon: "diversity_3",
    lead: "দয়া আমাদের সবচেয়ে পুরোনো শক্তি — বন্যায়, ঝড়ে, একাত্তরে।",
    items: ["বিপদে প্রতিবেশীর পাশে থাকা", "তরুণদের দক্ষতা শেখানো", "রক্তদান ও স্বেচ্ছাসেবা", "অসহায়ের জন্য আইনি ও চিকিৎসা সহায়তা খুঁজে দেওয়া", "সৎ মানুষকে প্রকাশ্যে সম্মান"],
  },
];

/** Mahir's words (written in English, 2026-09-27), in Bangla with the original kept. */
export const FOUNDER_QUOTE = {
  text: "আমি বিশ্বাস করি, আমাদের সমস্যা আমরাই সবচেয়ে ভালো জানি। তাই আমাদের প্রয়োজন অনুযায়ী আমাদেরই সমাধান করতে হবে — আর এতে একে অপরকে সাহায্য করতে পারি আমরাই। আমরা নিজেদের সবচেয়ে ভালো চিনি; আমরা বাঙালি।",
  author: "মাহির শারিয়ার মাহিন",
  role: "প্রতিষ্ঠাতা, কাণ্ডারী-ল্যাব",
  original: "I believe that we only know our problems, so we have solved problems according to our needs and know one another can help in this; we know ourselves better; we are Banggali.",
};

export const BRAVERY = {
  title: "সাহস নিয়ে বাঁচলে, কোনো খারাপ মানুষ কিছু করতে পারে না",
  /** Words in `title` set in the flag's red. */
  accent: "খারাপ মানুষ",
  body: "আমাদের সম্পদ আছে, জনশক্তি আছে, খাদ্য ফলানোর মাটি আছে — যথেষ্ট আছে। দোষারোপ, অবৈধ কাজ আর লোভের অভ্যাস ছাড়লে, কয়েকটি মৌলিক ভুল শুধরালে, আর কিছু খারাপ মানুষের বিরুদ্ধে একসাথে দাঁড়ালে এই সমস্যাগুলো আমরা মিলেই সমাধান করতে পারি।",
};

/* ── The 32 problems → the 32 ideas ─────────────────────────────────── */

export interface ProblemIdeas {
  title: string;
  brief: string;
  fact?: { text: string; source: string };
  /** Proposals the dossier's evidence supports — the way forward. */
  doThis: Decision[];
  /** Tempting moves the evidence rules out. */
  avoid: Decision[];
}

/** Bangla title, brief and the idea checklist for dossier point `n`. */
export function ideasFor(n: number): ProblemIdeas | undefined {
  const p = puzzleOf(n);
  if (!p) return undefined;
  return {
    title: p.title,
    brief: p.brief,
    fact: p.fact,
    doThis: p.decisions.filter((d) => d.answer === "yes"),
    avoid: p.decisions.filter((d) => d.answer === "no"),
  };
}

/** A decision is phrased as a question in the game; as advice it is a statement. */
export const asStatement = (q: string) => q.replace(/\s*\?$/, "").replace(/\s*—\s*/g, " — ");
