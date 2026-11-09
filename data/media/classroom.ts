import type { Classroom, Member, MemberStats } from "@/lib/media/classroom";

/**
 * Sample classrooms, shown as "নমুনা" and joinable by code. Dates sit around
 * DEMO_NOW (Friday 2026-09-25). A classroom the viewer creates or joins is
 * copied into their own media state and edited there.
 */

const m = (id: string, name: string, [notes, solved, helped, assess]: number[]): Member => ({
  id,
  name,
  stats: { notes, solved, helped, assess } satisfies MemberStats,
});

export const sampleClassrooms: Classroom[] = [
  {
    id: "c-ssc27",
    name: "দশম শ্রেণি · বিজ্ঞান (এসএসসি-২৭)",
    level: "school",
    institution: "নকলা, শেরপুর",
    code: "SSC27N",
    leaderId: "s-tania",
    teacherId: "t-rafiq",
    teacherCode: "TSSC27",
    notices: [
      { id: "nb1", kind: "cancel", title: "রবিবারের রসায়ন ক্লাস হবে না", body: "স্যার বোর্ডের মিটিংয়ে থাকবেন। পর্যায় সারণি সোমবার।", date: "2026-09-27", by: "t-rafiq", byName: "রফিকুল ইসলাম স্যার", byRole: "teacher", at: "2026-09-24T09:00:00Z" },
      { id: "nb2", kind: "leave", title: "ছুটি", reason: "জ্বর", date: "2026-09-26", days: 2, by: "s-joya", byName: "জয়া রানী", byRole: "member", at: "2026-09-25T02:00:00Z" },
      { id: "nb3", kind: "custom", title: "প্রাক-নির্বাচনী পরীক্ষার ফি", body: "১০ অক্টোবরের মধ্যে অফিসে জমা দিতে হবে।", by: "s-tania", byName: "তানিয়া আক্তার", byRole: "leader", at: "2026-09-23T08:00:00Z", pinned: true },
    ],
    maxMembers: 45,
    shares: [{ id: "sh-filter", kind: "research", title: "বালি-কাঠকয়লার ফিল্টারে ঘোলা পানি কতটা পরিষ্কার হয়", team: ["মীম খাতুন", "রাহাত হাসান", "জয়া রানী"], at: "2026-09-18T08:00:00Z", researchId: "r-filter" }],
    teacher: { name: "রফিকুল ইসলাম স্যার", subject: "গণিত" },
    todayTopic: "দ্বিঘাত সমীকরণ — মূল নির্ণয়",
    members: [
      m("s-tania", "তানিয়া আক্তার", [9, 6, 7, 88]),
      m("s-rahat", "রাহাত হাসান", [4, 5, 3, 81]),
      m("s-mim", "মীম খাতুন", [6, 2, 5, 74]),
      m("s-sohel", "সোহেল মিয়া", [1, 1, 0, 42]),
      m("s-joya", "জয়া রানী", [2, 0, 1, 47]),
      m("s-arif", "আরিফ হোসেন", [3, 3, 2, 69]),
    ],
    topics: [
      { id: "t1", subject: "গণিত", title: "বীজগাণিতিক রাশি", done: true },
      { id: "t2", subject: "গণিত", title: "দ্বিঘাত সমীকরণ", done: false },
      { id: "t3", subject: "গণিত", title: "ত্রিকোণমিতি", done: false },
      { id: "t4", subject: "পদার্থবিজ্ঞান", title: "গতি ও বল", done: true },
      { id: "t5", subject: "পদার্থবিজ্ঞান", title: "আলোর প্রতিফলন", done: true },
      { id: "t6", subject: "রসায়ন", title: "পর্যায় সারণি", done: false },
      { id: "t7", subject: "জীববিজ্ঞান", title: "কোষ বিভাজন", done: true },
    ],
    exams: [
      {
        id: "e1",
        title: "সাপ্তাহিক গণিত পরীক্ষা",
        date: "2026-09-29",
        kind: "class",
        paper: {
          duration: 40,
          instructions: "বহুনির্বাচনি অংশ এখানেই দাও; বাকিটা খাতায় লিখে জমা দেবে।",
          released: true,
          questions: [
            { id: "eq1", kind: "mcq", q: "x² − 5x + 6 = 0 সমীকরণের মূল দুটি কী?", options: ["১ ও ৬", "২ ও ৩", "−২ ও −৩", "৫ ও ৬"], answer: 1, marks: 1 },
            { id: "eq2", kind: "mcq", q: "ax² + bx + c = 0 সমীকরণের নিশ্চায়ক কোনটি?", options: ["b² − 4ac", "b² + 4ac", "4ac − b²", "2a"], answer: 0, marks: 1 },
            { id: "eq3", kind: "short", q: "নিশ্চায়ক শূন্য হলে মূল দুটি সম্পর্কে কী বলা যায়?", marks: 2 },
            { id: "eq4", kind: "written", q: "মধ্যপদ বিশ্লেষণ করে সমাধান করো: 2x² − 7x + 3 = 0। প্রতিটি ধাপ দেখাও।", marks: 6 },
          ],
        },
      },
      { id: "e2", title: "প্রাক-নির্বাচনী পরীক্ষা", date: "2026-10-18", kind: "class" },
      { id: "e3", title: "এসএসসি ২০২৭ (সম্ভাব্য তারিখ)", date: "2027-02-15", kind: "public" },
    ],
    routine: [
      { day: 0, time: "১০:০০", subject: "গণিত", topic: "দ্বিঘাত সমীকরণ" },
      { day: 0, time: "১১:০০", subject: "পদার্থবিজ্ঞান", topic: "আলোর প্রতিসরণ" },
      { day: 1, time: "১০:০০", subject: "রসায়ন", topic: "পর্যায় সারণি" },
      { day: 2, time: "১০:০০", subject: "জীববিজ্ঞান" },
      { day: 3, time: "১০:০০", subject: "গণিত", topic: "ত্রিকোণমিতি" },
      { day: 4, time: "১০:০০", subject: "ইংরেজি" },
      { day: 5, time: "১০:০০", subject: "বাংলা" },
    ],
    notes: [
      { id: "n1", kind: "homework", title: "অনুশীলনী ৯.২ — শনিবার জমা", text: "অনুশীলনী ৯.২ — ১ থেকে ১০ নম্বর, শনিবার জমা।", by: "s-tania", at: "2026-09-24" },
      { id: "n2", kind: "note", title: "দ্বিঘাত সমীকরণ: মধ্যপদ বিশ্লেষণ", text: "x² − 5x + 6 = 0 ভাঙলে (x − 2)(x − 3) = 0, তাই x = 2 বা 3। মধ্যপদ বিশ্লেষণ আগে চেষ্টা করো।", by: "s-rahat", at: "2026-09-24" },
      { id: "n3", kind: "material", title: "অধ্যায় ৯-এর উদাহরণ আবার দেখো", text: "পাঠ্যবই অধ্যায় ৯-এর সমাধান করা উদাহরণগুলো আবার দেখো।", by: "s-mim", at: "2026-09-23" },
      { id: "n4", kind: "rule", title: "নোট নিজের ভাষায় লেখো", text: "নোট শেয়ার করলে নিজের ভাষায় লেখো — ছবি তুলে পাঠ্যবই কপি নয়।", by: "s-tania", at: "2026-09-20" },
    ],
    problems: [
      {
        id: "p1",
        kind: "class",
        title: "দুই সংখ্যার যোগফল ১০, গুণফল ২১",
        body: "সংখ্যা দুটি বের করো এবং কোন দ্বিঘাত সমীকরণ থেকে পেলে তা দেখাও।",
        by: "s-tania",
        solutions: [{ by: "s-arif", text: "x² − 10x + 21 = 0 → (x − 3)(x − 7) = 0, সংখ্যা দুটি ৩ ও ৭।", at: "2026-09-24" }],
        solved: true,
      },
      { id: "p2", kind: "solo", title: "বইয়ের চ্যালেঞ্জ: অধ্যায় ৯-এর সৃজনশীল ৩", body: "নিজে করে ছবি নয়, ধাপে ধাপে লিখে জমা দাও।", by: "s-rahat", solutions: [] },
      { id: "p3", kind: "innovation", title: "স্কুল চ্যালেঞ্জ: পানির ফিল্টার মডেল", body: "বালি, কাঠকয়লা, নুড়ি দিয়ে কম খরচে ফিল্টার — বিজ্ঞান মেলার জন্য দল বানাও।", by: "s-mim", solutions: [] },
    ],
    papers: [
      {
        id: "q1",
        title: "আজকের মূল্যায়ন — বিজ্ঞান ও গণিত",
        by: "s-tania",
        daily: true,
        scores: { "s-tania": 100, "s-rahat": 75, "s-sohel": 25 },
        questions: [
          { q: "x² − 5x + 6 = 0 সমীকরণের মূল দুটি কী?", options: ["১ ও ৬", "২ ও ৩", "−২ ও −৩", "৫ ও ৬"], answer: 1 },
          { q: "সমুদ্রপৃষ্ঠে পানির স্ফুটনাঙ্ক কত?", options: ["৯০°C", "১০০°C", "১১০°C", "১২০°C"], answer: 1 },
          { q: "শূন্য মাধ্যমে আলোর বেগ প্রায় কত?", options: ["৩ × ১০⁵ m/s", "৩ × ১০⁶ m/s", "৩ × ১০⁸ m/s", "৩ × ১০¹⁰ m/s"], answer: 2 },
          { q: "নিউটনের গতির দ্বিতীয় সূত্র কোনটি?", options: ["F = ma", "E = mc²", "V = IR", "P = mv"], answer: 0 },
        ],
      },
    ],
  },
  {
    id: "c-cse22",
    name: "সিএসই ব্যাচ ২২ · সেকশন খ",
    level: "university",
    institution: "সেমিস্টার ৫ · ডেটা স্ট্রাকচার ও অ্যালগরিদম",
    code: "CSE22B",
    leaderId: "u-nafis",
    teacher: { name: "ড. মাহমুদা আক্তার", subject: "ডেটা স্ট্রাকচার" },
    teacherId: "t-mahmuda",
    teacherCode: "TCSE22",
    members: [
      m("u-nafis", "নাফিস ইকবাল", [12, 9, 10, 91]),
      m("u-ritu", "ঋতু সাহা", [8, 7, 6, 86]),
      m("u-tanvir", "তানভীর আলম", [3, 2, 1, 58]),
      m("u-lima", "লিমা পারভীন", [5, 4, 4, 77]),
      m("u-kabir", "কবির আহমেদ", [0, 1, 0, 39]),
    ],
    topics: [
      { id: "t1", subject: "ডেটা স্ট্রাকচার", title: "স্ট্যাক ও কিউ", done: true },
      { id: "t2", subject: "ডেটা স্ট্রাকচার", title: "বাইনারি সার্চ ট্রি", done: true },
      { id: "t3", subject: "ডেটা স্ট্রাকচার", title: "গ্রাফ — BFS ও DFS", done: false },
      { id: "t4", subject: "অ্যালগরিদম", title: "সর্টিং ও কমপ্লেক্সিটি", done: true },
      { id: "t5", subject: "অ্যালগরিদম", title: "ডায়নামিক প্রোগ্রামিং", done: false },
    ],
    exams: [
      { id: "e1", title: "মিডটার্ম — ডেটা স্ট্রাকচার", date: "2026-10-04", kind: "class" },
      { id: "e2", title: "ল্যাব ফাইনাল", date: "2026-11-12", kind: "class" },
    ],
    routine: [
      { day: 0, time: "৯:০০", subject: "ডেটা স্ট্রাকচার", topic: "গ্রাফ" },
      { day: 1, time: "১১:৩০", subject: "অ্যালগরিদম" },
      { day: 2, time: "২:০০", subject: "ল্যাব", topic: "BFS বাস্তবায়ন" },
      { day: 4, time: "৯:০০", subject: "ডেটা স্ট্রাকচার" },
    ],
    notes: [
      { id: "n1", kind: "note", title: "BST ইনঅর্ডার = সর্টেড ক্রম", text: "BST-তে ইনঅর্ডার ট্রাভার্সাল করলে মানগুলো ছোট থেকে বড় ক্রমে আসে।", by: "u-ritu", at: "2026-09-24" },
      { id: "n2", kind: "homework", title: "ল্যাব ৬: BFS — রবিবারের মধ্যে", text: "ল্যাব ৬: অ্যাডজেসেন্সি লিস্ট দিয়ে BFS, রবিবারের মধ্যে গিটহাবে পুশ।", by: "u-nafis", at: "2026-09-23" },
    ],
    problems: [
      {
        id: "p1",
        kind: "class",
        title: "দুটি সর্টেড অ্যারে O(n)-এ মেলাও",
        body: "অতিরিক্ত সর্ট ছাড়া — দুই পয়েন্টার দিয়ে যুক্তি লেখো।",
        by: "u-nafis",
        solutions: [],
      },
    ],
    papers: [
      {
        id: "q1",
        title: "মিডটার্ম প্র্যাকটিস",
        by: "u-ritu",
        scores: { "u-nafis": 100, "u-kabir": 33 },
        questions: [
          { q: "বাইনারি সার্চের টাইম কমপ্লেক্সিটি কত?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1 },
          { q: "স্ট্যাক কোন নীতি মানে?", options: ["FIFO", "LIFO", "র‍্যান্ডম", "অগ্রাধিকার"], answer: 1 },
          { q: "BST-র কোন ট্রাভার্সাল সর্টেড ক্রম দেয়?", options: ["প্রিঅর্ডার", "পোস্টঅর্ডার", "ইনঅর্ডার", "লেভেল অর্ডার"], answer: 2 },
        ],
      },
    ],
  },
  {
    id: "c-bcs",
    name: "বিসিএস প্রিলি প্রস্তুতি দল",
    level: "job",
    institution: "অনলাইন · সারা দেশ",
    code: "BCSPRE",
    leaderId: "j-sabbir",
    teacherId: "t-shahana",
    teacherCode: "TBCS01",
    teacher: { name: "শাহানা পারভীন (মেন্টর)", subject: "বাংলাদেশ বিষয়াবলি" },
    members: [
      m("j-sabbir", "সাব্বির রহমান", [10, 8, 9, 84]),
      m("j-nusrat", "নুসরাত জাহান", [7, 6, 8, 89]),
      m("j-milon", "মিলন মিয়া", [2, 1, 0, 45]),
      m("j-farzana", "ফারজানা ইয়াসমিন", [5, 3, 2, 72]),
    ],
    topics: [
      { id: "t1", subject: "বাংলাদেশ বিষয়াবলি", title: "সংবিধান", done: true },
      { id: "t2", subject: "বাংলাদেশ বিষয়াবলি", title: "মুক্তিযুদ্ধ", done: true },
      { id: "t3", subject: "বাংলা সাহিত্য", title: "আধুনিক যুগ", done: false },
      { id: "t4", subject: "গণিত", title: "শতকরা ও লাভ-ক্ষতি", done: false },
      { id: "t5", subject: "আন্তর্জাতিক বিষয়াবলি", title: "জাতিসংঘ", done: false },
      { id: "t6", subject: "মানসিক দক্ষতা", title: "সংখ্যার ধারা", done: true },
    ],
    exams: [
      { id: "e1", title: "সাপ্তাহিক মডেল টেস্ট ১২", date: "2026-09-27", kind: "class" },
      { id: "e2", title: "পূর্ণাঙ্গ মডেল টেস্ট", date: "2026-10-23", kind: "class" },
    ],
    routine: [
      { day: 0, time: "রাত ৯টা", subject: "বাংলাদেশ বিষয়াবলি" },
      { day: 2, time: "রাত ৯টা", subject: "বাংলা সাহিত্য" },
      { day: 4, time: "রাত ৯টা", subject: "গণিত ও মানসিক দক্ষতা" },
      { day: 6, time: "সকাল ১০টা", subject: "মডেল টেস্ট" },
    ],
    notes: [
      { id: "n1", kind: "rule", title: "প্রতিদিন ২০টা প্রশ্ন", text: "প্রতিদিন অন্তত ২০টা প্রশ্ন সমাধান করে গ্রুপে জানাবেন।", by: "j-sabbir", at: "2026-09-20" },
      { id: "n2", kind: "note", title: "সংবিধান: গৃহীত ও কার্যকরের তারিখ", text: "সংবিধান কার্যকর হয় ১৬ ডিসেম্বর ১৯৭২; গৃহীত হয় ৪ নভেম্বর ১৯৭২।", by: "j-nusrat", at: "2026-09-24" },
    ],
    problems: [
      { id: "p1", kind: "solo", title: "এক সপ্তাহে ১৫০ প্রশ্ন", body: "নিজের দুর্বল বিষয় থেকে — শেষে স্কোর জানান।", by: "j-sabbir", solutions: [] },
    ],
    papers: [
      {
        id: "q1",
        title: "বাংলাদেশ ও সাহিত্য — দ্রুত মডেল টেস্ট",
        by: "j-nusrat",
        daily: true,
        scores: { "j-nusrat": 100, "j-milon": 40 },
        questions: [
          { q: "বাংলাদেশের সংবিধান কার্যকর হয় কবে?", options: ["২৬ মার্চ ১৯৭২", "৪ নভেম্বর ১৯৭২", "১৬ ডিসেম্বর ১৯৭২", "১০ এপ্রিল ১৯৭১"], answer: 2 },
          { q: "জাতীয় সংসদের মোট আসন (সংরক্ষিতসহ) কত?", options: ["৩০০", "৩৩০", "৩৪৫", "৩৫০"], answer: 3 },
          { q: "'অগ্নিবীণা' কাব্যগ্রন্থের রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ", "জসীমউদ্‌দীন"], answer: 1 },
          { q: "আয়তনে বাংলাদেশের সবচেয়ে বড় বিভাগ কোনটি?", options: ["ঢাকা", "রাজশাহী", "চট্টগ্রাম", "খুলনা"], answer: 2 },
          { q: "পদ্মা সেতুর দৈর্ঘ্য কত?", options: ["৪.৮ কিমি", "৬.১৫ কিমি", "৭.৫ কিমি", "৫.২ কিমি"], answer: 1 },
        ],
      },
    ],
  },
];

export const sampleClassroom = (id: string) => sampleClassrooms.find((c) => c.id === id);
export const sampleByCode = (code: string) => sampleClassrooms.find((c) => c.code === code);
