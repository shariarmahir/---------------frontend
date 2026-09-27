/**
 * The 32 problem modules, BD-001 … BD-032.
 *
 * The IDs are product identifiers (Prompt V3 §7). Module n is point n of
 * the national dossier (data/amar-bangladesh.ts → sourcePoints), whose
 * evidence status, urgency and theme it inherits. The source list has
 * overlapping numbering and combined ideas; these IDs do not claim that it
 * is perfectly numbered.
 *
 * `links` are the game's dependency hypotheses between modules. Each says
 * whether it restates a mechanism the dossier describes ("dossier") or is a
 * game assumption, and how confident the game is — none is a measured fact.
 */

import { sourcePoints } from "../amar-bangladesh.ts";
import type { ThemeId } from "./puzzles.ts";

export type ModuleCode = `BD-${string}`;

export interface ProblemModule {
  code: ModuleCode;
  n: number;
  titleBn: string;
  titleEn: string;
  theme: ThemeId;
  /** "full": a playable simulation scenario exists. "quiz": the evidence-check mini-game only. */
  simulation: "full" | "quiz";
  scenarioId?: string;
}

export const codeOf = (n: number): ModuleCode => `BD-${String(n).padStart(3, "0")}`;

const titles: [bn: string, en: string][] = [
  ["স্বাস্থ্যসেবায় প্রবেশাধিকার ও প্রাথমিক চিকিৎসা", "Healthcare access and primary care"],
  ["পণ্যের সরবরাহ শৃঙ্খল ও দামের স্বচ্ছতা", "Product supply chain and price transparency"],
  ["বেকারত্ব", "Unemployment"],
  ["কারখানা বন্ধ", "Factory shutdowns"],
  ["স্বচ্ছতা ও জবাবদিহি", "Transparency and accountability"],
  ["অভিযোগ ও প্রতিকার ব্যবস্থা", "Complaint and grievance systems"],
  ["ঘুষ ও প্রশাসনিক অসততা", "Bribery and administrative dishonesty"],
  ["তরুণ সম্পদ ও মানবসম্পদের তথ্য", "Youth resource and human-capital data"],
  ["ইউনিয়নে প্রকৌশল, কৃষি ও গ্রামীণ সেবা", "Union-level engineering, agriculture, and village services"],
  ["সামাজিক বৈষম্য ও অবহেলিত জনগোষ্ঠী", "Social inequality and neglected communities"],
  ["শিক্ষাব্যবস্থার সংস্কার", "Education system reform"],
  ["পুরোনো প্রাতিষ্ঠানিক মানসিকতা ও কর্মসংস্কৃতি", "Outdated institutional mindset and work culture"],
  ["পরিচ্ছন্নতা ও নগরজীবন", "Cleanliness and urban living"],
  ["নকল পণ্যের বাজার", "Fake product markets"],
  ["লজিস্টিকস ও পরিবহন", "Logistics and transportation"],
  ["পরিবেশগত ঝুঁকি", "Environmental risk"],
  ["প্রাকৃতিক সম্পদ ও ভূমি ব্যবস্থাপনা", "Natural resource and land management"],
  ["পানি শোধন ও নদী রক্ষা", "Water treatment and river protection"],
  ["আয় ও জীবনযাত্রার ব্যয়ের চাপ", "Income and cost-of-living pressure"],
  ["সামাজিক অংশগ্রহণ, ন্যায় ও সমাজ-কাঠামো", "Social participation, justice, and community structure"],
  ["স্টার্টআপ বিনিয়োগ ও বাণিজ্যিকীকরণ", "Startup investment and commercialization"],
  ["স্যাটেলাইট ও রিমোট-সেন্সিং ব্যবহার", "Satellite and remote-sensing utilization"],
  ["আইন ও বিচার প্রক্রিয়া", "Legal and justice processing"],
  ["জননিরাপত্তা ও ঝুঁকিপূর্ণ এলাকা ব্যবস্থাপনা", "Public safety and risk-area management"],
  ["শিক্ষার্থীর মেধা, ল্যাব ও গবেষণা সক্ষমতা", "Student talent, labs, and research capacity"],
  ["খাতভিত্তিক কর্মসংস্থান ও দক্ষতার মিল", "Sector-specific employment and skills matching"],
  ["স্টার্টআপ ও বিকল্প পুঁজি কাঠামো", "Startup and alternative capital structures"],
  ["বিদ্যুৎ, জ্বালানি ও লোড বণ্টন", "Electricity, energy, fuel, and load distribution"],
  ["রাজনৈতিক সহিংসতা, গ্যাং ও তরুণদের ঝুঁকি", "Political violence, gangs, and youth risk"],
  ["নারী ও পরিবারের নিরাপত্তা", "Women’s safety and family security"],
  ["প্রবাসী মেধা ও জ্ঞানের অবদান", "Diaspora talent and knowledge contribution"],
  ["ব্যক্তিগত অভ্যাস, নাগরিক দায়িত্ব ও আত্মউন্নয়ন", "Personal habits, citizenship responsibility, and self-development"],
];

export const modules: ProblemModule[] = titles.map(([titleBn, titleEn], i) => {
  const n = i + 1;
  const point = sourcePoints.find((p) => p.n === n);
  if (!point) throw new Error(`No dossier point ${n}`);
  return {
    code: codeOf(n),
    n,
    titleBn,
    titleEn,
    theme: point.theme as ThemeId,
    simulation: n === 1 ? "full" : "quiz",
    scenarioId: n === 1 ? "health-access" : undefined,
  };
});

export function moduleOf(code: string): ProblemModule | undefined {
  return modules.find((m) => m.code === code);
}

export interface ModuleLink {
  from: ModuleCode;
  to: ModuleCode;
  /** +1: improving `from` helps `to`. */
  sign: 1 | -1;
  confidence: "high" | "medium" | "low";
  basis: "dossier" | "assumption";
  note: string;
}

const L = (from: number, to: number, confidence: ModuleLink["confidence"], basis: ModuleLink["basis"], note: string): ModuleLink => ({
  from: codeOf(from),
  to: codeOf(to),
  sign: 1,
  confidence,
  basis,
  note,
});

export const moduleLinks: ModuleLink[] = [
  L(8, 1, "high", "dossier", "মাপা না গেলে সেবার ঘাটতি ধরা পড়ে না — দুর্বল পরিমাপ থেকেই ভুল লক্ষ্য আর সেবা-ব্যর্থতা।"),
  L(8, 26, "high", "dossier", "তরুণদের তথ্য ছড়ানো থাকলে দক্ষতা আর চাকরি মেলানো যায় না।"),
  L(8, 10, "medium", "dossier", "হর (denominator) ছাড়া বঞ্চিত মানুষ খুঁজে পাওয়া যায় না।"),
  L(6, 5, "high", "dossier", "অভিযোগ ট্র্যাক হলে জনগণের কণ্ঠ প্রাতিষ্ঠানিক শিক্ষায় বদলায়।"),
  L(6, 7, "high", "dossier", "অভিযোগ হারিয়ে গেলে ঘুষই ‘যুক্তিসঙ্গত’ হয়ে ওঠে।"),
  L(5, 32, "high", "dossier", "স্বচ্ছতা আস্থার কাঁচামাল — আস্থা প্রতিটি সংস্কারের উপকরণ।"),
  L(7, 32, "high", "dossier", "ন্যায্য আচরণ না পেলে মানুষ রিপোর্ট, মেনে চলা আর সহযোগিতা কমায়।"),
  L(12, 7, "medium", "dossier", "পুরোনো প্রক্রিয়া আর ব্যক্তির হাতে বিবেচনা ঘুষের সুযোগ রাখে।"),
  L(12, 5, "medium", "assumption", "কর্মসংস্কৃতি বদলালে তথ্য প্রকাশ সহজ হয় — খেলার অনুমান।"),
  L(23, 32, "high", "dossier", "বিচার দ্রুত ও দৃশ্যমান হলে আস্থা বাড়ে।"),
  L(23, 30, "medium", "dossier", "মামলার গতি নারীর নিরাপত্তায় প্রয়োগ আর আস্থা দুটোকেই টানে।"),
  L(24, 30, "high", "dossier", "আলো, পরিবহন, সাড়ার সময় — নিরাপত্তার স্তরগুলো একসাথে কাজ করে।"),
  L(24, 29, "medium", "assumption", "ঝুঁকিপূর্ণ এলাকায় উপস্থিতি তরুণদের ঝুঁকি কমাতে পারে — খেলার অনুমান।"),
  L(18, 1, "high", "dossier", "দূষিত পানি অসুখ বাড়ায় — দূষণ অসুখ আর মৃত্যুর পরিমাপযোগ্য পথ।"),
  L(16, 1, "high", "dossier", "দূষণের খরচ জিডিপির ১৭.৬%, অকালমৃত্যু ২,৭২,০০০+।"),
  L(13, 1, "medium", "dossier", "বর্জ্য আর ড্রেনেজের ব্যর্থতা স্বাস্থ্যে গিয়ে পড়ে।"),
  L(13, 16, "medium", "dossier", "অব্যবস্থাপিত বর্জ্য দূষণের একটি চ্যানেল।"),
  L(17, 16, "medium", "dossier", "দুর্বল ভূমি-ব্যবহার নিয়ন্ত্রণ দূষণ আর জলবায়ু-ক্ষতি বাড়ায়।"),
  L(17, 18, "medium", "assumption", "ভূমি ব্যবস্থাপনা নদী দখল কমাতে পারে — খেলার অনুমান।"),
  L(22, 16, "medium", "dossier", "স্যাটেলাইট তথ্যে বন্যা-মানচিত্র আর দুর্যোগ সাড়া।"),
  L(22, 24, "low", "assumption", "ঝুঁকিপূর্ণ এলাকা চিহ্নিতে দূর-সংবেদন সাহায্য করতে পারে — খেলার অনুমান।"),
  L(22, 9, "low", "dossier", "ফসল পর্যবেক্ষণ কৃষি সেবাকে লক্ষ্যভিত্তিক করে।"),
  L(28, 4, "high", "dossier", "শিল্পাঞ্চলের বিদ্যুৎ-বিভ্রাট কারখানা টিকে থাকার সূচক।"),
  L(28, 1, "low", "assumption", "নির্ভরযোগ্য বিদ্যুৎ ক্লিনিকের কোল্ড চেইন চালু রাখে — খেলার অনুমান।"),
  L(15, 2, "high", "dossier", "চালানের সময় আর গুদামের ক্ষতি দামে গিয়ে পড়ে।"),
  L(15, 4, "medium", "dossier", "লজিস্টিকস দুর্বল হলে বিনিয়োগ আর কারখানা টেকে না।"),
  L(14, 2, "medium", "dossier", "নকল আর ভেজাল দামের কারণ থেকে আলাদা করে মাপতে হয়।"),
  L(14, 1, "medium", "dossier", "নকল ওষুধ সরাসরি রোগীর ক্ষতি।"),
  L(2, 19, "high", "dossier", "সরবরাহের খরচ জীবনযাত্রার ব্যয়ে যায়।"),
  L(4, 3, "high", "dossier", "কারখানা বন্ধ মানে সরাসরি চাকরি হারানো, সাথে সরবরাহকারী ও পরিবার।"),
  L(3, 19, "high", "dossier", "কাজ না থাকলে আয় কমে, ধাক্কা সামলানোর সক্ষমতা কমে।"),
  L(3, 29, "low", "assumption", "কর্মহীনতা আর সহিংসতার যোগ নিরপেক্ষ প্রমাণ চায় — কম আস্থার অনুমান।"),
  L(19, 10, "medium", "dossier", "মূল্যস্ফীতি পরিবারের ধাক্কা সামলানোর ক্ষমতা কমায়।"),
  L(11, 26, "high", "dossier", "সার্টিফিকেট সক্ষমতার তথ্য বহন না করলে দক্ষতার অমিল বাড়ে।"),
  L(11, 25, "medium", "dossier", "ভিত্তিমূলক শেখা গবেষণার পাইপলাইন গড়ে।"),
  L(26, 3, "high", "dossier", "দক্ষতা আর শূন্যপদ মিললে প্লেসমেন্ট আর টিকে থাকা বাড়ে।"),
  L(25, 21, "medium", "dossier", "ল্যাব আর ক্রেতার মাঝে পথ থাকলে উদ্ভাবন পণ্য হয়।"),
  L(27, 21, "high", "dossier", "দেউলিয়া আইন, অর্থায়ন আর বিনিয়োগকারী সুরক্ষা ছাড়া নতুন উদ্যোগ দাঁড়ায় না।"),
  L(21, 3, "medium", "assumption", "টিকে থাকা স্টার্টআপ কাজ তৈরি করে — খেলার অনুমান।"),
  L(25, 31, "medium", "dossier", "দেশে গবেষণার পরিবেশ মেধার আবর্তন টানে।"),
  L(31, 25, "medium", "dossier", "প্রবাসী নেটওয়ার্ক ক্ষতিকে জ্ঞানের পথে বদলায়।"),
  L(9, 1, "medium", "assumption", "ইউনিয়নে পেশাদার সেবা দূরত্ব কমায় — পাইলট দরকার।"),
  L(9, 19, "low", "assumption", "কৃষি সেবা আয় বাড়াতে পারে — খেলার অনুমান।"),
  L(20, 6, "medium", "assumption", "সংগঠিত সমাজ অভিযোগ তোলে ও অনুসরণ করে — খেলার অনুমান।"),
  L(20, 32, "medium", "dossier", "একসাথে কাজ করলে সামাজিক পুঁজি গড়ে।"),
  L(32, 5, "medium", "dossier", "আস্থা থাকলে মানুষ রিপোর্ট করে — রাষ্ট্র নিজের ব্যর্থতা দেখতে পায়।"),
  L(10, 1, "medium", "dossier", "খরচ আর দূরত্ব বঞ্চিতদের চিকিৎসা দেরি করায়।"),
];

export interface CrossCutting {
  id: string;
  bn: string;
  en: string;
  modules: ModuleCode[];
}

/** Themes that run across modules (Prompt V3 §7). */
export const crossCutting: CrossCutting[] = [
  { id: "trust", bn: "সরকার ও জনগণের আস্থা", en: "Government-public trust", modules: [5, 6, 7, 23, 32].map(codeOf) },
  { id: "public-space", bn: "অব্যবহৃত সরকারি জায়গার ব্যবহার", en: "Unused public-space utilization", modules: [9, 13, 20].map(codeOf) },
  { id: "decisions", bn: "সরকারি সিদ্ধান্তের স্বচ্ছতা", en: "Transparency of public decisions", modules: [5, 7, 12].map(codeOf) },
  { id: "community", bn: "সামাজিক দায়িত্ব", en: "Community responsibility", modules: [13, 20, 32].map(codeOf) },
  { id: "data", bn: "তথ্যের মান", en: "Data quality", modules: [8, 22, 26].map(codeOf) },
  { id: "regional", bn: "আঞ্চলিক বৈষম্য", en: "Regional inequality", modules: [1, 10, 15, 28].map(codeOf) },
];

/** Upstream (what this module depends on) and downstream (what it feeds). */
export function neighboursOf(code: ModuleCode) {
  return {
    upstream: moduleLinks.filter((l) => l.to === code),
    downstream: moduleLinks.filter((l) => l.from === code),
  };
}
