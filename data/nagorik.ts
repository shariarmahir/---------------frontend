/**
 * "নাগরিক অধিকার ও দায়িত্ব" — data for /nagorik.
 *
 * Real figures: Bangladesh Bureau of Statistics, Time-Use Survey 2021,
 * as published in UN Women's summary brief (May 2024) — national averages
 * for people aged 15+. The brief does not break the rest of the day into
 * sleep, study or leisure, so the page keeps that time as one block.
 *
 * SAMPLE figures: `DIVISION_SAMPLE` is illustrative. No published survey
 * measures responsibility or wasted time by division; the rows are built
 * around the real national averages so the table's design can be judged,
 * and the page labels them as sample everywhere they appear. Replace with
 * a real division-level survey before quoting any of them.
 *
 * Rights and duties paraphrase the Constitution of Bangladesh (Part III,
 * Articles 27–44; Article 21). Helpline numbers are the national short codes.
 */

export const TUS = {
  source: "বাংলাদেশ পরিসংখ্যান ব্যুরো (বিবিএস), টাইম-ইউজ সার্ভে ২০২১ — ইউএন উইমেন সারসংক্ষেপ, মে ২০২৪",
  url: "https://data.unwomen.org/publications/bangladesh-time-use-survey-2021",
  sample: "৮,০০০ খানা · ১৭,৭৭০ জন (১৫ বছর ও তার বেশি) · ৬৪ জেলা · মাঠকাজ ২০২১-এর শুরু",
  /** Hours per day, national average. */
  day: {
    women: { paid: 1.2, unpaid: 5.9 },
    men: { paid: 6.1, unpaid: 0.8 },
  },
  /** Unpaid care and domestic work, ages 25–44, hours per day. */
  prime: { women: 7.1, men: 0.9 },
  ratios: [
    { value: "৭.৩×", text: "নারী পুরুষের চেয়ে বেশি সময় দেন অবৈতনিক সেবা ও গৃহস্থালি কাজে" },
    { value: "৭.৬×", text: "গৃহস্থালি কাজ নারী করেন পুরুষের চেয়ে বেশি" },
    { value: "৬×", text: "সেবা-যত্নের দায়িত্বে নারীর অংশগ্রহণ পুরুষের চেয়ে বেশি" },
    { value: "৭.৫×", text: "বিবাহিত নারীর সেবা-যত্নের ভার পুরুষের চেয়ে বেশি (অবিবাহিত নারীর ৩.৮ গুণ)" },
  ],
  /** Share who believe men's work is more important than women's, by age. */
  menWorkMoreImportant: [
    { group: "১৮–৩০ বছর", pct: 60 },
    { group: "৩১ বছর ও বেশি", pct: 71 },
  ],
  bothShouldEarn: "৯০%-এর বেশি মানুষ — লিঙ্গ, বয়স, এলাকা, বিভাগ বা শিক্ষা নির্বিশেষে — মনে করেন স্বামী-স্ত্রী দুজনেরই আয় করা উচিত।",
  womenLabourForce: { from: { year: "২০১৭", pct: 36 }, to: { year: "২০২২", pct: 42.8 } },
} as const;

export type Sex = "women" | "men";

export interface DivisionRow {
  division: string;
  /** Hours per day. */
  paid: number;
  unpaid: number;
  civic: number;
  learning: number;
  idle: number;
  /** 0–100: self-reported daily-duty completion. */
  duty: number;
}

/** SAMPLE — see file header. Built around the real national averages. */
export const DIVISION_SAMPLE: Record<Sex, DivisionRow[]> = {
  women: [
    { division: "ঢাকা", paid: 1.9, unpaid: 5.6, civic: 0.2, learning: 0.6, idle: 1.4, duty: 71 },
    { division: "চট্টগ্রাম", paid: 1.1, unpaid: 6.1, civic: 0.2, learning: 0.5, idle: 1.3, duty: 69 },
    { division: "রাজশাহী", paid: 1.2, unpaid: 5.9, civic: 0.2, learning: 0.5, idle: 1.2, duty: 72 },
    { division: "খুলনা", paid: 1.1, unpaid: 5.8, civic: 0.3, learning: 0.4, idle: 1.3, duty: 70 },
    { division: "বরিশাল", paid: 0.8, unpaid: 6.2, civic: 0.2, learning: 0.4, idle: 1.5, duty: 68 },
    { division: "সিলেট", paid: 0.7, unpaid: 6.3, civic: 0.1, learning: 0.4, idle: 1.6, duty: 66 },
    { division: "রংপুর", paid: 1.3, unpaid: 5.9, civic: 0.3, learning: 0.4, idle: 1.2, duty: 73 },
    { division: "ময়মনসিংহ", paid: 1.0, unpaid: 6.0, civic: 0.2, learning: 0.4, idle: 1.4, duty: 70 },
  ],
  men: [
    { division: "ঢাকা", paid: 6.6, unpaid: 0.9, civic: 0.3, learning: 0.7, idle: 2.3, duty: 63 },
    { division: "চট্টগ্রাম", paid: 6.0, unpaid: 0.7, civic: 0.3, learning: 0.6, idle: 2.5, duty: 61 },
    { division: "রাজশাহী", paid: 6.2, unpaid: 0.8, civic: 0.4, learning: 0.5, idle: 2.2, duty: 64 },
    { division: "খুলনা", paid: 6.1, unpaid: 0.8, civic: 0.4, learning: 0.5, idle: 2.3, duty: 63 },
    { division: "বরিশাল", paid: 5.7, unpaid: 0.7, civic: 0.3, learning: 0.5, idle: 2.6, duty: 60 },
    { division: "সিলেট", paid: 5.6, unpaid: 0.6, civic: 0.2, learning: 0.5, idle: 2.8, duty: 58 },
    { division: "রংপুর", paid: 6.1, unpaid: 0.9, civic: 0.4, learning: 0.5, idle: 2.1, duty: 65 },
    { division: "ময়মনসিংহ", paid: 5.9, unpaid: 0.8, civic: 0.3, learning: 0.5, idle: 2.4, duty: 62 },
  ],
};

export const DIVISION_COLUMNS = [
  { key: "paid", label: "উৎপাদনশীল কাজ", hint: "আয়ের কাজ, ঘণ্টা/দিন", unit: "ঘ." },
  { key: "unpaid", label: "ঘর ও সেবা-যত্ন", hint: "অবৈতনিক কাজ, ঘণ্টা/দিন", unit: "ঘ." },
  { key: "civic", label: "সমাজ ও নাগরিক কাজ", hint: "স্বেচ্ছাসেবা, সভা, প্রতিবেশীর সাহায্য", unit: "ঘ." },
  { key: "learning", label: "শেখা", hint: "পড়া, প্রশিক্ষণ", unit: "ঘ." },
  { key: "idle", label: "অপচয়", hint: "উদ্দেশ্যহীন স্ক্রিন, অলস সময়", unit: "ঘ." },
  { key: "duty", label: "দৈনিক দায়িত্ব পালন", hint: "নিজের বলা হিসাবে, ০–১০০", unit: "" },
] as const satisfies readonly { key: keyof Omit<DivisionRow, "division">; label: string; hint: string; unit: string }[];

/* ── Rights ─────────────────────────────────────────────────────────── */

export interface Right {
  article: string;
  title: string;
  body: string;
  icon: string;
}

/** Fundamental rights, Part III of the Constitution — enforceable in the High Court Division (Art. 44). */
export const RIGHTS: Right[] = [
  { article: "২৭", icon: "balance", title: "আইনের চোখে সমান", body: "সব নাগরিক আইনের দৃষ্টিতে সমান এবং আইনের সমান আশ্রয় পাওয়ার অধিকারী।" },
  { article: "২৮", icon: "diversity_1", title: "বৈষম্য নয়", body: "ধর্ম, গোষ্ঠী, বর্ণ, নারী-পুরুষভেদ বা জন্মস্থানের কারণে রাষ্ট্র কারও প্রতি বৈষম্য করবে না।" },
  { article: "২৯", icon: "work", title: "সরকারি চাকরিতে সমান সুযোগ", body: "প্রজাতন্ত্রের কর্মে নিয়োগে সব নাগরিকের সুযোগের সমতা।" },
  { article: "৩১", icon: "gavel", title: "আইনের আশ্রয়", body: "আইন অনুযায়ী ছাড়া কারও জীবন, স্বাধীনতা, দেহ, সুনাম বা সম্পত্তির হানি করা যাবে না।" },
  { article: "৩২", icon: "favorite", title: "জীবন ও ব্যক্তিস্বাধীনতা", body: "আইন অনুযায়ী ছাড়া কাউকে জীবন বা ব্যক্তিস্বাধীনতা থেকে বঞ্চিত করা যাবে না।" },
  { article: "৩৩", icon: "lock_open", title: "গ্রেপ্তারে রক্ষাকবচ", body: "গ্রেপ্তারের কারণ জানার, আইনজীবীর পরামর্শ নেওয়ার এবং ২৪ ঘণ্টার মধ্যে ম্যাজিস্ট্রেটের সামনে হাজির হওয়ার অধিকার।" },
  { article: "৩৫", icon: "policy", title: "ন্যায্য বিচার", body: "দ্রুত ও প্রকাশ্য বিচার; একই অপরাধে দুবার দণ্ড নয়; নিজের বিরুদ্ধে সাক্ষী হতে বাধ্য নয়; নির্যাতন নিষিদ্ধ।" },
  { article: "৩৬–৩৮", icon: "groups", title: "চলাফেরা, সমাবেশ ও সংগঠন", body: "দেশজুড়ে চলাফেরা, শান্তিপূর্ণ ও নিরস্ত্র সমাবেশ এবং সংগঠন করার স্বাধীনতা — আইনের যুক্তিসংগত বাধা সাপেক্ষে।" },
  { article: "৩৯", icon: "record_voice_over", title: "চিন্তা ও বাক্‌স্বাধীনতা", body: "চিন্তা ও বিবেকের স্বাধীনতা; বাক্ ও ভাব প্রকাশ এবং সংবাদক্ষেত্রের স্বাধীনতা।" },
  { article: "৪০–৪১", icon: "self_improvement", title: "পেশা ও ধর্মের স্বাধীনতা", body: "যেকোনো আইনসংগত পেশা বা ব্যবসা, এবং যেকোনো ধর্ম পালন ও প্রচারের অধিকার।" },
  { article: "৪২–৪৩", icon: "home", title: "সম্পত্তি, গৃহ ও গোপনীয়তা", body: "সম্পত্তি অর্জন ও রাখার অধিকার; গৃহে নিরাপত্তা এবং চিঠিপত্র ও যোগাযোগের গোপনীয়তা।" },
  { article: "৪৪", icon: "verified_user", title: "অধিকার বলবৎ করা", body: "মৌলিক অধিকার লঙ্ঘিত হলে হাইকোর্ট বিভাগে প্রতিকার চাওয়ার অধিকার।" },
];

/** Article 21 — the citizen's and the public servant's duty. */
export const ARTICLE_21 = {
  citizen: "সংবিধান ও আইন মান্য করা, শৃঙ্খলা রক্ষা করা, নাগরিক দায়িত্ব পালন করা এবং জাতীয় সম্পত্তি রক্ষা করা প্রত্যেক নাগরিকের কর্তব্য।",
  servant: "সব সময় জনগণের সেবা করার চেষ্টা করা প্রজাতন্ত্রের কর্মে নিযুক্ত প্রত্যেক ব্যক্তির কর্তব্য।",
};

export interface Helpline {
  number: string;
  name: string;
  when: string;
  icon: string;
}

export const HELPLINES: Helpline[] = [
  { number: "৯৯৯", name: "জাতীয় জরুরি সেবা", when: "পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স", icon: "emergency" },
  { number: "১০৯", name: "নারী ও শিশু নির্যাতন প্রতিরোধ", when: "সহিংসতা, বাল্যবিবাহ", icon: "woman" },
  { number: "১০৯৮", name: "চাইল্ড হেল্পলাইন", when: "বিপদে থাকা শিশু", icon: "child_care" },
  { number: "১৬৪৩০", name: "সরকারি আইনি সহায়তা", when: "বিনামূল্যে আইনি পরামর্শ ও আইনজীবী", icon: "gavel" },
  { number: "১০৬", name: "দুর্নীতি দমন কমিশন", when: "ঘুষ ও দুর্নীতির অভিযোগ", icon: "report" },
  { number: "১৬১২১", name: "ভোক্তা অধিকার", when: "ভেজাল, ওজনে কম, অতিরিক্ত দাম", icon: "shopping_cart" },
  { number: "৩৩৩", name: "জাতীয় কল সেন্টার", when: "সরকারি তথ্য ও সেবা", icon: "support_agent" },
  { number: "১৬২৬৩", name: "স্বাস্থ্য বাতায়ন", when: "ডাক্তারের পরামর্শ", icon: "medical_services" },
];

/** Laws a citizen can use without a lawyer. */
export const CIVIC_LAWS = [
  { name: "তথ্য অধিকার আইন, ২০০৯", use: "সরকারি ও সরকারি অর্থে চলা প্রতিষ্ঠানের কাছে লিখিতভাবে তথ্য চাওয়া যায়।" },
  { name: "ভোক্তা-অধিকার সংরক্ষণ আইন, ২০০৯", use: "ভেজাল, ওজনে কম বা মূল্য তালিকা না টাঙানোর বিরুদ্ধে অভিযোগ করা যায়।" },
  { name: "আইনগত সহায়তা প্রদান আইন, ২০০০", use: "অসচ্ছল মানুষ সরকারি খরচে আইনজীবী ও আইনি সহায়তা পান।" },
];

/* ── Responsibilities, for everyone ─────────────────────────────────── */

export interface Group {
  id: string;
  label: string;
  icon: string;
  duties: string[];
  today: string[];
  behave: string[];
  mindset: string;
  bravery: string;
}

export const GROUPS: Group[] = [
  {
    id: "everyone",
    label: "সবার জন্য",
    icon: "groups",
    duties: ["আইন মানা ও কর দেওয়া", "ভোট দেওয়া", "জাতীয় সম্পদ রক্ষা", "প্রতিবেশীর বিপদে পাশে থাকা"],
    today: ["একটি কাজ সময়মতো শেষ করা", "রসিদ ছাড়া কোনো লেনদেন নয়", "ময়লা নির্দিষ্ট জায়গায়"],
    behave: ["সবাইকে সম্মান — পেশা, ধর্ম বা পোশাক দেখে নয়", "শেয়ারের আগে যাচাই", "লাইনে দাঁড়ানো"],
    mindset: "দোষ খোঁজার আগে জিজ্ঞেস করি — আমি কী ঠিক করতে পারি?",
    bravery: "অন্যায় দেখলে চুপ না থাকা — নিজে না পারলে ৯৯৯ বা ১০৬-এ জানানো।",
  },
  {
    id: "men",
    label: "পুরুষ",
    icon: "man",
    duties: ["ঘরের কাজ ও সন্তানের যত্ন ভাগ করে নেওয়া", "নারীর আয় ও সিদ্ধান্তকে সম্মান", "পরিবারের সবার স্বাস্থ্য ও শিক্ষার খোঁজ"],
    today: ["অন্তত এক ঘণ্টা ঘরের কাজ বা সন্তানকে পড়ানো", "অলস আড্ডা বা স্ক্রিনের সময় কমানো", "মা-বাবা বা শ্বশুর-শাশুড়ির খোঁজ"],
    behave: ["রাস্তায় ও গণপরিবহনে নারীর নিরাপত্তা", "রাগে নয়, আলোচনায় সমাধান", "যৌতুককে না"],
    mindset: "জরিপ বলছে পুরুষ দিনে গড়ে ০.৮ ঘণ্টা ঘরের কাজ করেন — ভাগ বাড়ালে পরিবারের সবার সময় বাঁচে।",
    bravery: "হয়রানি দেখলে দাঁড়িয়ে যাওয়া — নীরব দর্শক না হওয়া।",
  },
  {
    id: "women",
    label: "নারী",
    icon: "woman",
    duties: ["নিজের শিক্ষা, আয় ও স্বাস্থ্যের অধিকার দাবি করা", "পরিবারের সিদ্ধান্তে কণ্ঠ রাখা", "মেয়ে ও ছেলে সন্তানকে সমান সুযোগ দেওয়া"],
    today: ["নিজের জন্য অন্তত আধা ঘণ্টা — শেখা বা বিশ্রাম", "ঘরের কাজ ভাগ করে দিতে বলা", "স্থানীয় সভা বা নারী দলে অংশ নেওয়া"],
    behave: ["অন্য নারীর পাশে দাঁড়ানো", "সন্তানকে প্রশ্ন করতে শেখানো", "ভেজাল পণ্য দেখলে অভিযোগ"],
    mindset: "ঘরের কাজ অবমূল্যায়নের নয় — কিন্তু সেটা একা বহন করার দায়ও নয়।",
    bravery: "সহিংসতা বা বাল্যবিবাহের খবর ১০৯-এ জানানো — নিজের বা অন্যের জন্য।",
  },
  {
    id: "children",
    label: "শিশু",
    icon: "child_care",
    duties: ["স্কুলে যাওয়া ও মন দিয়ে শেখা", "বড়দের সম্মান, ছোটদের যত্ন", "নিজের জিনিস গুছিয়ে রাখা"],
    today: ["বাড়ির একটি ছোট কাজে সাহায্য", "একটি নতুন জিনিস শেখা", "খেলার পর হাত ধোয়া"],
    behave: ["সত্য কথা বলা", "কাউকে ঠাট্টা করে কষ্ট না দেওয়া", "রাস্তায় ময়লা না ফেলা"],
    mindset: "ভুল করলে লজ্জা নয় — শিখে নেওয়াই বড় হওয়া।",
    bravery: "কেউ খারাপভাবে ছুঁলে বা ভয় দেখালে সঙ্গে সঙ্গে মা-বাবা বা শিক্ষককে বলা, অথবা ১০৯৮-এ ফোন।",
  },
  {
    id: "boys",
    label: "কিশোর",
    icon: "boy",
    duties: ["পড়াশোনা ও একটি হাতের কাজ শেখা", "বোন ও সহপাঠী মেয়েদের সম্মান", "মাদক ও জুয়া থেকে দূরে থাকা"],
    today: ["মাকে রান্না বা বাজারে সাহায্য", "এক ঘণ্টা স্ক্রিন কম", "একটি ভালো বই বা খেলা"],
    behave: ["দলবেঁধে কাউকে হয়রানি নয়", "বাইক ও রাস্তায় দায়িত্বশীলতা", "অনলাইনে ভদ্র ভাষা"],
    mindset: "শক্তি মানে অন্যকে রক্ষা করা, ভয় দেখানো নয়।",
    bravery: "বন্ধু ভুল পথে গেলে বাধা দেওয়া — দলের চাপে মাথা নত না করা।",
  },
  {
    id: "girls",
    label: "কিশোরী",
    icon: "girl",
    duties: ["পড়াশোনা চালিয়ে যাওয়া — স্বপ্ন ছোট না করা", "নিজের স্বাস্থ্য ও নিরাপত্তার খোঁজ", "বোন ও বান্ধবীর পাশে থাকা"],
    today: ["প্রশ্ন করা — ক্লাসে ও ঘরে", "একটি দক্ষতা অনুশীলন (কোড, সেলাই, খেলা, আঁকা)", "নিজের মতামত লিখে রাখা"],
    behave: ["আত্মবিশ্বাসে কথা বলা", "অনলাইনে অপরিচিতকে ব্যক্তিগত তথ্য নয়", "অন্যকে ছোট না করা"],
    mindset: "মেয়ে বলে পিছিয়ে থাকার কোনো কারণ নেই — সংবিধান সমান অধিকার দিয়েছে।",
    bravery: "বাল্যবিবাহ বা হয়রানির বিরুদ্ধে ‘না’ বলা — ১০৯-এ সাহায্য আছে।",
  },
  {
    id: "youth",
    label: "তরুণ (১৮–৩৫)",
    icon: "rocket_launch",
    duties: ["দক্ষতা অর্জন ও কাজ তৈরি", "ভোট দেওয়া ও তথ্য যাচাই", "এলাকার সমস্যায় স্বেচ্ছাসেবা"],
    today: ["নতুন কিছু শেখা বা শেখানো", "একজন ছোটকে পড়াশোনায় সাহায্য", "অভিযোগ নয়, একটি প্রস্তাব লেখা"],
    behave: ["রাজনৈতিক ভিন্নমতকে সম্মান", "ঘুষে চাকরি নয়", "উদ্যোগে সততা"],
    mindset: "দেশ ছাড়ার আগে একবার ভাবি — এখানে আমার জায়গা তৈরি করা যায় কি না।",
    bravery: "দুর্নীতির প্রস্তাবে ‘না’ — আর যারা ‘না’ বলে, তাদের পাশে দাঁড়ানো।",
  },
  {
    id: "elders",
    label: "প্রবীণ",
    icon: "elderly",
    duties: ["অভিজ্ঞতা ও ইতিহাস পরের প্রজন্মকে দেওয়া", "পারিবারিক বিরোধে ন্যায্য মধ্যস্থতা", "নিজের স্বাস্থ্যের যত্ন"],
    today: ["নাতি-নাতনিকে একটি গল্প বা শিক্ষা", "প্রতিবেশীর খোঁজ", "হাঁটা ও নিয়মিত ওষুধ"],
    behave: ["মেয়ে ও ছেলেকে সমান দেখা", "নতুন ভাবনাকে সুযোগ দেওয়া", "সালিশে পক্ষপাত নয়"],
    mindset: "বয়স দায়িত্ব কমায় না — শুধু ধরন বদলায়।",
    bravery: "সমাজের অন্যায় প্রথার বিরুদ্ধে প্রবীণের একটি কথাই অনেক বড় ঢাল।",
  },
  {
    id: "workers",
    label: "কর্মজীবী ও ব্যবসায়ী",
    icon: "storefront",
    duties: ["ন্যায্য দাম ও ন্যায্য মজুরি", "ভেজাল ও মজুতদারি নয়", "কর ও নিয়ম মানা"],
    today: ["মূল্য তালিকা টাঙানো", "কর্মীকে সময়মতো মজুরি", "রসিদ দেওয়া"],
    behave: ["ক্রেতার সাথে সৎ ব্যবহার", "কাজের জায়গায় নিরাপত্তা", "নারী কর্মীর সম্মান ও নিরাপত্তা"],
    mindset: "ন্যায্য লাভেই টেকসই ব্যবসা — লোভে এক দিনের লাভ, বিশ্বাসের চিরকালের ক্ষতি।",
    bravery: "সিন্ডিকেট বা চাঁদাবাজির চাপের কথা একসাথে প্রকাশ করা।",
  },
  {
    id: "servants",
    label: "সরকারি কর্মচারী ও জনপ্রতিনিধি",
    icon: "account_balance",
    duties: ["জনগণের সেবা (সংবিধান, অনুচ্ছেদ ২১)", "সময়মতো ও স্বচ্ছ সেবা", "তথ্য চাইলে তথ্য দেওয়া"],
    today: ["জমে থাকা একটি ফাইল নিষ্পত্তি", "সেবাগ্রহীতাকে লিখিত সময়সীমা", "অভিযোগ রেজিস্টারে উত্তর"],
    behave: ["ঘুষ নয়, তদবির নয়", "গ্রামের মানুষকেও সমান সম্মান", "মাঠে উপস্থিতি"],
    mindset: "চেয়ারটা ক্ষমতা নয়, দায়িত্ব — বেতন আসে জনগণের করে।",
    bravery: "ওপরের অন্যায় চাপ লিখিতভাবে ফিরিয়ে দেওয়া।",
  },
];

/** Tonight's self-check — one line per duty, answered privately. */
export const DAILY_CHECKS = [
  "আজ কাউকে ঘুষ দিইনি, নিইনি",
  "আজ একটি কাজ সময়মতো শেষ করেছি",
  "আজ ঘরের কাজে হাত লাগিয়েছি",
  "আজ কিছু নতুন শিখেছি",
  "আজ একজনের খোঁজ নিয়েছি বা সাহায্য করেছি",
  "আজ যাচাই না করে কিছু শেয়ার করিনি",
  "আজ রাস্তায় ময়লা ফেলিনি",
  "আজ অলস স্ক্রিন-সময় এক ঘণ্টার কম",
  "আজ কাউকে ছোট করে কথা বলিনি",
  "আজ অন্যায় দেখে চুপ থাকিনি",
];
