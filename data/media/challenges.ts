import type { Challenge, ChallengeKind } from "./types";

export const challengeKindBn: Record<ChallengeKind, string> = {
  code: "কোড চ্যালেঞ্জ",
  design: "ডিজাইন চ্যালেঞ্জ",
  research: "গবেষণা",
  assignment: "পেইড অ্যাসাইনমেন্ট",
  lab: "ল্যাব চ্যালেঞ্জ",
};

/**
 * Challenges: solve a real problem, alone or as a team, and win the prize
 * (paid through the wallet). Paid assignments are small real tasks.
 */
export const challenges: Challenge[] = [
  {
    id: "ch-flood-alert",
    kind: "lab",
    title: "৳১,০০০-এর নিচে বন্যার আগাম সতর্কসংকেত",
    host: "বুয়েট আইওটি ও এমবেডেড ল্যাব",
    by: "anik",
    category: "engineering",
    prize: 50000,
    deadline: "2026-11-15",
    teams: true,
    entries: 23,
    description: "নদীর পানি বিপৎসীমায় পৌঁছানোর ৬ ঘণ্টা আগে গ্রামে সংকেত দেবে এমন যন্ত্র। যন্ত্রাংশের খরচ ৳১,০০০-এর নিচে, বিদ্যুৎ ছাড়া ৭ দিন চলবে।",
    tags: ["#আইওটি", "#বন্যা", "#টিম"],
  },
  {
    id: "ch-bangla-ocr",
    kind: "code",
    title: "হাতে লেখা বাংলা রসিদ পড়ার অ্যাপ",
    host: "কাণ্ডারী-ল্যাব",
    by: "mahir",
    category: "tech",
    prize: 30000,
    deadline: "2026-10-30",
    teams: true,
    entries: 41,
    description: "মুদি দোকানের হাতে লেখা রসিদের ছবি থেকে পণ্য ও দাম আলাদা করবে। ওপেন-সোর্স কোড ও ১০০টি নমুনায় নির্ভুলতা জমা দিতে হবে।",
    tags: ["#এআই", "#বাংলা", "#ওপেন_সোর্স"],
  },
  {
    id: "ch-poster-clean",
    kind: "design",
    title: "‘আমার শহর, আমার দায়িত্ব’ — পরিচ্ছন্নতার পোস্টার",
    host: "রূপা ক্রিয়েটিভ",
    by: "rupa",
    category: "content",
    prize: 10000,
    deadline: "2026-10-12",
    teams: false,
    entries: 67,
    description: "বাজার ও বাসস্ট্যান্ডে লাগানোর মতো পোস্টার — রাস্তায় ময়লা ও প্রস্রাব না করার বার্তা, কাউকে অপমান না করে। সেরা তিনটি ছাপা হবে।",
    tags: ["#পোস্টার", "#নাগরিক"],
  },
  {
    id: "ch-assignment-data",
    kind: "assignment",
    title: "৫০০ দোকানের দামের তালিকা এক্সেলে তোলা",
    host: "করিম অ্যান্ড কোং",
    by: "sajid",
    category: "finance",
    prize: 4000,
    deadline: "2026-10-03",
    teams: false,
    entries: 15,
    description: "ছবি থেকে পণ্যের নাম ও দাম এক্সেলে তুলবেন। নির্ভুলতা ৯৮%-এর বেশি হলে পুরো টাকা — শিক্ষার্থীদের জন্য ভালো।",
    tags: ["#ডেটা_এন্ট্রি", "#স্টুডেন্ট"],
  },
  {
    id: "ch-research-heat",
    kind: "research",
    title: "ঢাকার বস্তিতে গরমের প্রভাব — ছোট জরিপ",
    host: "নাগরিক গবেষণা ফোরাম",
    by: "nusrat",
    category: "research",
    prize: 20000,
    deadline: "2026-11-01",
    teams: true,
    entries: 8,
    description: "অন্তত ৫০টি পরিবারের সাথে কথা বলে গরমে ঘুম, কাজ ও স্বাস্থ্যের উপর প্রভাব — সহজ বাংলায় প্রতিবেদন আর কিছু কম খরচের সমাধান।",
    tags: ["#গবেষণা", "#জলবায়ু"],
  },
];

export function getChallenge(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}
