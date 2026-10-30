import { defaultMilestones, emptyWrite, type ResearchProject } from "../../lib/media/research-project.ts";
import type { ResearchEntry } from "@/lib/media/showcase";

/**
 * Research the sample classrooms and lab sent to the গবেষণা page. Dates sit
 * before DEMO_NOW (Friday 2026-09-25). The viewer's own entries live in
 * their media state and are listed above these.
 */
export const sampleResearch: ResearchEntry[] = [
  {
    id: "r-solar",
    title: "৫০০ টাকার কমে সোলার চার্জ কন্ট্রোলার",
    question: "গ্রামের দোকানে ছোট সোলার প্যানেল ব্যাটারি নষ্ট করে ফেলে — ওভারচার্জ ঠেকানোর সস্তা উপায় আছে কি?",
    method: "জেনার ডায়োড, একটি BC547 ট্রানজিস্টর আর রিলে দিয়ে কাটঅফ সার্কিট; তিন দিন ছাদে প্যানেল রেখে প্রতি ঘণ্টায় ভোল্টেজ মাপা।",
    finding: "১৩.৮V-এ নির্ভরযোগ্যভাবে চার্জ বন্ধ হয়, খরচ ৪২০ টাকা। মেঘলা দিনে রিলে বারবার চালু-বন্ধ হয় — পরের ধাপে হিস্টেরেসিস যোগ করা হবে।",
    stage: "running",
    team: ["নাফিস ইকবাল", "ঋতু সাহা", "সাদিয়া রহমান"],
    from: { kind: "lab", id: "lab-eee102", name: "সার্কিট ল্যাব · গ্রুপ বি" },
    tags: ["গবেষণা", "ল্যাব", "সোলার", "সার্কিট"],
    at: "2026-09-23T10:00:00Z",
  },
  {
    id: "r-filter",
    title: "বালি-কাঠকয়লার ফিল্টারে ঘোলা পানি কতটা পরিষ্কার হয়",
    question: "পুকুরের ঘোলা পানি কম খরচে খাওয়ার কাছাকাছি পরিষ্কার করা যায় কি?",
    method: "দুই লিটারের বোতলে নুড়ি, বালি, কাঠকয়লা তিন স্তর; সেকি ডিস্ক বানিয়ে আগে-পরে স্বচ্ছতা মাপা।",
    finding: "স্বচ্ছতা প্রায় চার গুণ বাড়ে, তবে জীবাণু যায় না — খাওয়ার আগে ফোটানো বা ক্লোরিন লাগবেই। বিজ্ঞান মেলায় দ্বিতীয় হয়েছে।",
    stage: "done",
    team: ["মীম খাতুন", "রাহাত হাসান", "জয়া রানী"],
    from: { kind: "classroom", id: "c-ssc27", name: "দশম শ্রেণি · বিজ্ঞান (এসএসসি-২৭)" },
    tags: ["গবেষণা", "ক্লাসরুম", "পানি", "ফিল্টার"],
    at: "2026-09-18T08:00:00Z",
  },
  {
    id: "r-bus",
    title: "ক্যাম্পাস বাসের ভিড়: কোন স্টপে কখন বাস লাগবে",
    question: "সকালের প্রথম বাসে জায়গা হয় না, শেষের বাস প্রায় খালি — স্টপভিত্তিক চাহিদা আগে থেকে বোঝা যায় কি?",
    method: "দুই সপ্তাহ ধরে ছয়টি স্টপে গুনে রাখা; স্টপগুলোকে গ্রাফ ধরে BFS দিয়ে ছোট রুট খোঁজা।",
    finding: "দুটি স্টপেই সকালের ভিড়ের ৬০%। একটি বাস ওই দুই স্টপ থেকে সরাসরি গেলে বাকিগুলো স্বস্তিতে চলে — প্রস্তাব পরিবহন অফিসে পাঠানো হবে।",
    stage: "idea",
    team: ["তানভীর আলম", "লিমা পারভীন"],
    from: { kind: "classroom", id: "c-cse22", name: "সিএসই ব্যাচ ২২ · সেকশন খ" },
    tags: ["গবেষণা", "ক্লাসরুম", "গ্রাফ", "পরিবহন"],
    at: "2026-09-21T14:00:00Z",
  },
];

/**
 * A research workspace the sample lab is in the middle of: three topic ideas
 * up for a vote until Monday, the plan drafted, two tasks handed out.
 */
export const sampleProjects: ResearchProject[] = [
  {
    id: "rp-eee102",
    from: { kind: "lab", id: "lab-eee102", name: "সার্কিট ল্যাব · গ্রুপ বি" },
    members: [
      { id: "l-nafis", name: "নাফিস ইকবাল" },
      { id: "l-ritu", name: "ঋতু সাহা" },
      { id: "l-tamim", name: "তামিম আহমেদ" },
      { id: "l-sadia", name: "সাদিয়া রহমান" },
      { id: "l-imran", name: "ইমরান খান" },
    ],
    leadId: "l-nafis",
    createdAt: "2026-09-23T10:00:00Z",
    topicDeadline: "2026-09-28",
    ideas: [
      {
        id: "i1",
        title: "লোডশেডিংয়ে আইপিএস ব্যাটারি কত দ্রুত ক্ষয় হয়",
        why: "পাড়ার প্রায় সব বাসায় আইপিএস; দুই বছরেই ব্যাটারি বদলাতে হয় — কেন?",
        by: "l-nafis",
        votes: { "l-nafis": "agree", "l-ritu": "agree", "l-sadia": "maybe", "l-imran": "agree" },
      },
      {
        id: "i2",
        title: "মোবাইল চার্জারের নো-লোড অপচয়",
        why: "চার্জ শেষেও প্লাগে থাকা চার্জার সারা দেশে কত বিদ্যুৎ নষ্ট করে।",
        by: "l-ritu",
        votes: { "l-ritu": "agree", "l-tamim": "agree", "l-nafis": "maybe", "l-imran": "disagree" },
      },
      {
        id: "i3",
        title: "সস্তা স্মার্ট মিটার দিয়ে মেসের বিদ্যুৎ বিল ভাগ",
        why: "মেসে বিল নিয়ে ঝগড়া — ঘরভিত্তিক মাপা গেলে ন্যায্য ভাগ হয়।",
        by: "l-tamim",
        votes: { "l-tamim": "agree", "l-sadia": "agree", "l-ritu": "disagree" },
      },
    ],
    milestones: defaultMilestones("2026-09-23").map((m, i) => ({ ...m, id: `m${i + 1}`, done: i === 0 ? false : undefined })),
    tasks: [
      { id: "t1", title: "তিনটি বিষয়ের আগের গবেষণা খুঁজে আনা", who: "l-sadia", due: "2026-09-27", status: "doing" },
      { id: "t2", title: "ল্যাব থেকে মাল্টিমিটার ও লোড ধার নেওয়ার অনুমতি", who: "l-nafis", due: "2026-09-29", status: "todo" },
    ],
    files: [],
    write: { ...emptyWrite, background: "বাংলাদেশে গ্রীষ্মে দিনে কয়েক ঘণ্টা লোডশেডিং হয়; শহরের মধ্যবিত্ত ঘরে আইপিএস প্রায় অপরিহার্য।" },
  },
];

export const sampleProject = (id: string) => sampleProjects.find((p) => p.id === id);
