import type { CivicKind, CivicReport, CivicStatus } from "./types";

export const civicKindBn: Record<CivicKind, string> = {
  sanitation: "পরিচ্ছন্নতা ও স্যানিটেশন",
  road: "রাস্তা ও যানজট",
  crime: "চুরি-ছিনতাই",
  extortion: "চাঁদাবাজি",
  harassment: "হয়রানি",
  utility: "পানি-বিদ্যুৎ-গ্যাস",
  environment: "পরিবেশ ও দূষণ",
  help: "সাহায্য চাই",
};

export const civicStatusBn: Record<CivicStatus, string> = {
  reported: "যাচাই চলছে",
  confirmed: "এলাকাবাসী নিশ্চিত",
  "in-progress": "সমাধান চলছে",
  solved: "সমাধান হয়েছে",
};

/** Confirmations from different verified people before a report counts as confirmed. */
export const CONFIRM_THRESHOLD = 5;

/**
 * Public problems and area alerts. Everyone behind a report is
 * NID-verified, even when shown as anonymous — so false alarms have a
 * cost, and crime/extortion reports can be filed without fear.
 */
export const civicReports: CivicReport[] = [
  {
    id: "cv-kandirpar-waste",
    kind: "sanitation",
    title: "কান্দিরপাড় মোড়ে ছয় দিন ধরে ময়লার স্তূপ",
    area: "কান্দিরপাড়",
    district: "কুমিল্লা",
    at: "2026-09-25T08:00:00Z",
    by: "rupa",
    description: "স্কুলের গেটের পাশে ফুটপাতে ময়লা, বৃষ্টিতে রাস্তায় ছড়িয়ে পড়ছে। ময়লার গাড়ি সপ্তাহে একদিন আসে।",
    confirmations: 47,
    status: "confirmed",
    severity: "medium",
    solutions: [
      { id: "s1", by: "joy", text: "ওয়ার্ড কাউন্সিলরের অফিসে ১০০ জনের স্বাক্ষরসহ লিখিত আবেদন — রাজশাহীতে এভাবে কাজ হয়েছিল।", votes: 38 },
      { id: "s2", by: "rupa", text: "দোকানিরা মিলে একটা ঢাকনাওয়ালা ড্রাম রাখি, প্রতিদিন রাতে ভ্যানওয়ালা নিয়ে যাক — মাসে দোকানপ্রতি ৫০ টাকা।", votes: 21 },
    ],
    media: { kind: "image", label: "মোড়ের ময়লা", ratio: "16/9", src: "/media/civic-waste.webp" },
  },
  {
    id: "cv-mirpur-urine",
    kind: "sanitation",
    title: "মিরপুর ১০ বাসস্ট্যান্ডে খোলা জায়গায় প্রস্রাব — পাবলিক টয়লেট নেই",
    area: "মিরপুর ১০",
    district: "ঢাকা",
    at: "2026-09-24T18:30:00Z",
    by: null,
    description: "বাসস্ট্যান্ডের পেছনের দেয়ালে প্রতিদিন সন্ধ্যায় দুর্গন্ধ। কাছের পাবলিক টয়লেট তালাবদ্ধ থাকে। নারী যাত্রীদের জন্য আরও কষ্ট।",
    confirmations: 31,
    status: "in-progress",
    severity: "medium",
    solutions: [
      { id: "s1", by: "moyna", text: "তালাবদ্ধ টয়লেটটা চালুর দায়িত্ব কার — সিটি করপোরেশনের হটলাইনে সবাই মিলে একই দিনে অভিযোগ দিই।", votes: 26 },
    ],
  },
  {
    id: "cv-mohammadpur-extortion",
    kind: "extortion",
    title: "টাউন হল বাজারে ফুটপাতের দোকান থেকে প্রতিদিন চাঁদা",
    area: "মোহাম্মদপুর",
    district: "ঢাকা",
    at: "2026-09-24T07:15:00Z",
    by: null,
    description: "সন্ধ্যায় দুজন এসে প্রতিটি ভ্যান থেকে ১০০ টাকা নেয়। না দিলে ভ্যান সরিয়ে দেওয়ার হুমকি। কয়েকজন দোকানি নিশ্চিত করেছেন।",
    confirmations: 12,
    status: "confirmed",
    severity: "high",
    solutions: [
      { id: "s1", by: "sajid", text: "৯৯৯-এ কল ও থানায় সাধারণ ডায়েরি — কয়েকজন দোকানি একসাথে গেলে ভয় কম। তারিখ-সময় লিখে রাখুন।", votes: 17 },
    ],
  },
  {
    id: "cv-shantinagar-flood",
    kind: "road",
    title: "শান্তিনগরে আধা ঘণ্টার বৃষ্টিতে হাঁটুপানি",
    area: "শান্তিনগর",
    district: "ঢাকা",
    at: "2026-09-23T11:00:00Z",
    by: "nusrat",
    description: "ড্রেনের মুখ পলিথিনে বন্ধ। রিকশা উল্টে যাচ্ছে, স্কুলের বাচ্চারা ভিজে যায়। এ বছর চতুর্থবার।",
    confirmations: 58,
    status: "reported",
    severity: "medium",
    solutions: [],
    media: { kind: "image", label: "পানিতে ডোবা রাস্তা", ratio: "4/3", src: "/media/civic-flood.webp" },
  },
  {
    id: "cv-rajshahi-snatch",
    kind: "crime",
    title: "পদ্মার পাড়ে সন্ধ্যার পর মোবাইল ছিনতাই",
    area: "টি-বাঁধ",
    district: "রাজশাহী",
    at: "2026-09-22T15:40:00Z",
    by: null,
    description: "গত সপ্তাহে তিনটি ঘটনা, সবই সন্ধ্যা ৭টার পর আলো কম এমন অংশে। দুজন মোটরসাইকেলে আসে।",
    confirmations: 9,
    status: "confirmed",
    severity: "high",
    solutions: [
      { id: "s1", by: "joy", text: "ওই অংশে সোলার বাতি বসানোর জন্য চাঁদা তুলি — ‘উদ্যোগ’-এ ইভেন্ট খুলছি।", votes: 14 },
    ],
  },
  {
    id: "cv-shahbag-help",
    kind: "help",
    title: "শাহবাগে পথশিশুদের জন্য শীতের কাপড় চাই",
    area: "শাহবাগ",
    district: "ঢাকা",
    at: "2026-09-21T09:00:00Z",
    by: "sumaiya",
    description: "৪০টি শিশুর জন্য সোয়েটার ও কম্বল। পুরোনো ভালো কাপড় দিলেও হবে, আমরা ধুয়ে দেব।",
    confirmations: 22,
    status: "solved",
    severity: "low",
    solutions: [{ id: "s1", by: "hasina", text: "আমাদের তাঁতঘর থেকে ১০টি গামছা আর ৫টি চাদর পাঠাচ্ছি।", votes: 31 }],
  },
];

export function getCivic(id: string): CivicReport | undefined {
  return civicReports.find((r) => r.id === id);
}

/** Districts with open high-severity reports, most first — the area alert list. */
export function riskyAreas(reports: CivicReport[]) {
  const open = reports.filter((r) => r.status !== "solved");
  const byArea = new Map<string, { area: string; district: string; high: number; total: number; kinds: Set<CivicKind> }>();
  for (const r of open) {
    const key = `${r.area}|${r.district}`;
    const a = byArea.get(key) ?? { area: r.area, district: r.district, high: 0, total: 0, kinds: new Set<CivicKind>() };
    a.total++;
    if (r.severity === "high") a.high++;
    a.kinds.add(r.kind);
    byArea.set(key, a);
  }
  return [...byArea.values()].sort((a, b) => b.high - a.high || b.total - a.total);
}
