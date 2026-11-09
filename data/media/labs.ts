import type { LabRoom, LabSubmission } from "@/lib/media/lab";

/**
 * A sample lab room, shown as "নমুনা" and joinable by code. Dates sit around
 * DEMO_NOW (Friday 2026-09-25): two labs done, one report due this weekend,
 * the next lab on Tuesday. Seeded hand-ins carry no files — only who and when.
 */

const sub = (id: string, by: string, kind: LabSubmission["kind"], at: string): LabSubmission => ({ id, by, kind, at });

export const sampleLabs: LabRoom[] = [
  {
    id: "lab-eee102",
    name: "সার্কিট ল্যাব · গ্রুপ বি",
    course: "EEE 102 · ইলেকট্রিক্যাল সার্কিট ল্যাব",
    institution: "বিশ্ববিদ্যালয় · ২য় সেমিস্টার",
    code: "EEE2LB",
    leaderId: "l-nafis",
    instructor: "সাবরিনা ইয়াসমিন ম্যাডাম",
    teacherId: "t-sabrina",
    teacherCode: "TEEE2L",
    notices: [
      { id: "lb1", kind: "late", title: "রিপোর্ট ২ — দেরিতে জমা", body: "সোমবার সকালে জমা দেব।", reason: "অসুস্থ", date: "2026-09-28", by: "l-tamim", byName: "তামিম আহমেদ", byRole: "member", at: "2026-09-21T04:00:00Z" },
      { id: "lb2", kind: "custom", title: "ল্যাব কোট ও জুতা ছাড়া ঢোকা যাবে না", body: "নিরাপত্তার জন্য — মঙ্গলবার থেকে কড়াকড়ি।", by: "t-sabrina", byName: "সাবরিনা ইয়াসমিন ম্যাডাম", byRole: "teacher", at: "2026-09-22T05:00:00Z", pinned: true },
    ],
    maxMembers: 6,
    labDay: 3,
    shares: [{ id: "sh-solar", kind: "research", title: "৫০০ টাকার কমে সোলার চার্জ কন্ট্রোলার", team: ["নাফিস ইকবাল", "ঋতু সাহা", "সাদিয়া রহমান"], at: "2026-09-23T10:00:00Z", researchId: "r-solar" }],
    members: [
      { id: "l-nafis", name: "নাফিস ইকবাল" },
      { id: "l-ritu", name: "ঋতু সাহা" },
      { id: "l-tamim", name: "তামিম আহমেদ" },
      { id: "l-sadia", name: "সাদিয়া রহমান" },
      { id: "l-imran", name: "ইমরান খান" },
    ],
    experiments: [
      {
        id: "x1",
        no: 1,
        title: "ওহমের সূত্র যাচাই",
        topic: "একটি রোধকের দুই প্রান্তে ভোল্টেজ বদলে প্রবাহ মাপা, V–I লেখচিত্র এঁকে রোধ বের করা। পড়ে আসুন: ওহমের সূত্র, অ্যামিটার ও ভোল্টমিটার কোথায় বসে।",
        date: "2026-09-08",
        time: "10:00",
        due: "2026-09-13T23:59",
        task: { text: "যন্ত্র: ডিসি পাওয়ার সাপ্লাই (০–১২V), ১kΩ রোধক, মাল্টিমিটার ২টি, ব্রেডবোর্ড। ৬টি ভোল্টেজে প্রবাহ নিয়ে টেবিল বানাবেন।" },
        questions: ["ওহমের সূত্র বিবৃত করো।", "V–I লেখচিত্রের ঢাল কী নির্দেশ করে?", "তাপমাত্রা বাড়লে ধাতব রোধকের রোধ কেন বাড়ে?"],
        submissions: [
          sub("x1a", "l-nafis", "report", "2026-09-12T14:00:00Z"),
          sub("x1b", "l-ritu", "report", "2026-09-13T10:00:00Z"),
          sub("x1c", "l-tamim", "report", "2026-09-14T03:00:00Z"),
          sub("x1d", "l-sadia", "report", "2026-09-11T09:00:00Z"),
          sub("x1e", "l-nafis", "done", "2026-09-08T06:30:00Z"),
          sub("x1f", "l-sadia", "done", "2026-09-08T06:40:00Z"),
        ],
      },
      {
        id: "x2",
        no: 2,
        title: "কির্শফের প্রবাহ ও ভোল্টেজ সূত্র",
        topic: "দুই লুপের একটি সার্কিটে প্রতিটি শাখার প্রবাহ ও প্রতিটি রোধকের ভোল্টেজ মেপে KCL ও KVL যাচাই।",
        date: "2026-09-15",
        time: "10:00",
        due: "2026-09-20T23:59",
        task: { text: "যন্ত্র: ২টি ডিসি উৎস, ৩টি রোধক (৪৭০Ω, ১kΩ, ২.২kΩ), মাল্টিমিটার। প্রতিটি নোডে প্রবাহের যোগফল লিখুন।" },
        questions: ["KCL ও KVL কোন সংরক্ষণ নীতির ওপর দাঁড়িয়ে?", "লুপে ভোল্টেজের যোগফল শূন্য না হলে কী ভুল হতে পারে?"],
        submissions: [
          sub("x2a", "l-nafis", "report", "2026-09-19T15:00:00Z"),
          sub("x2b", "l-ritu", "report", "2026-09-20T12:00:00Z"),
          sub("x2c", "l-sadia", "report", "2026-09-18T08:00:00Z"),
          sub("x2d", "l-imran", "report", "2026-09-20T17:30:00Z"),
          sub("x2e", "l-ritu", "done", "2026-09-15T06:20:00Z"),
        ],
      },
      {
        id: "x3",
        no: 3,
        title: "থেভেনিন উপপাদ্য",
        topic: "একটি জটিল সার্কিটকে একটি উৎস ও একটি রোধকে নামিয়ে আনা; লোড বদলে মাপা প্রবাহ আর হিসাব মিলিয়ে দেখা।",
        date: "2026-09-22",
        time: "10:00",
        due: "2026-09-27T23:59",
        task: { text: "লোড খুলে খোলা-সার্কিট ভোল্টেজ (Vth) মাপুন, উৎস শর্ট করে Rth মাপুন। তারপর ৩টি লোডে প্রবাহ মিলিয়ে দেখুন।" },
        questions: ["থেভেনিন সমতুল্য রোধ কীভাবে বের করো?", "লোড বদলালে থেভেনিন ভোল্টেজ বদলায় কি?", "নর্টন সমতুল্যের সাথে সম্পর্ক কী?"],
        submissions: [sub("x3a", "l-sadia", "report", "2026-09-24T16:00:00Z"), sub("x3b", "l-nafis", "done", "2026-09-22T06:10:00Z"), sub("x3c", "l-tamim", "done", "2026-09-22T06:15:00Z")],
      },
      {
        id: "x4",
        no: 4,
        title: "RC সার্কিটের চার্জ ও ডিসচার্জ",
        topic: "ক্যাপাসিটর চার্জ হওয়ার সময় ভোল্টেজ কীভাবে বাড়ে, টাইম কনস্ট্যান্ট τ = RC মেপে বের করা।",
        date: "2026-09-29",
        time: "10:00",
        due: "2026-10-04T23:59",
        task: { text: "যন্ত্র: ১০০μF ক্যাপাসিটর, ১০kΩ রোধক, স্টপওয়াচ, মাল্টিমিটার। প্রতি ৫ সেকেন্ডে ভোল্টেজ লিখবেন।" },
        questions: ["টাইম কনস্ট্যান্ট τ = RC-এর একক কী?", "৫τ পরে ক্যাপাসিটর প্রায় কত শতাংশ চার্জ হয়?"],
        submissions: [],
      },
      {
        id: "x5",
        no: 5,
        title: "অসিলোস্কোপে এসি তরঙ্গ মাপা",
        topic: "ফাংশন জেনারেটরের সাইন তরঙ্গের পিক ভোল্টেজ, পর্যায়কাল আর কম্পাঙ্ক অসিলোস্কোপে পড়া।",
        date: "2026-10-06",
        time: "10:00",
        due: "2026-10-11T23:59",
        questions: ["পিক ও RMS ভোল্টেজের সম্পর্ক কী?", "টাইম/ডিভ থেকে কম্পাঙ্ক কীভাবে বের করো?"],
        submissions: [],
      },
    ],
    exams: [
      {
        id: "q1",
        title: "ল্যাব কুইজ ১",
        kind: "quiz",
        date: "2026-10-01",
        time: "10:00",
        syllabus: "এক্সপেরিমেন্ট ১–৩",
        paper: {
          duration: 20,
          released: true,
          questions: [
            { id: "lq1", kind: "mcq", q: "V–I লেখচিত্রের ঢাল কী দেয়?", options: ["প্রবাহ", "রোধ", "ক্ষমতা", "শক্তি"], answer: 1, marks: 2 },
            { id: "lq2", kind: "mcq", q: "KVL কোন সংরক্ষণ নীতি থেকে আসে?", options: ["আধান", "ভরবেগ", "শক্তি", "ভর"], answer: 2, marks: 2 },
            { id: "lq3", kind: "short", q: "থেভেনিন রোধ মাপার সময় উৎসকে কী করতে হয়?", marks: 3 },
            { id: "lq4", kind: "written", q: "তোমার এক্সপেরিমেন্ট ৩-এর ডেটা থেকে থেভেনিন সমতুল্য সার্কিট আঁকো ও ব্যাখ্যা করো।", marks: 8 },
          ],
        },
      },
      { id: "f1", title: "ল্যাব ফাইনাল ও ভাইভা", kind: "final", date: "2026-11-12", time: "09:30", syllabus: "সব এক্সপেরিমেন্ট" },
    ],
  },
];

export const sampleLab = (id: string) => sampleLabs.find((l) => l.id === id);
export const sampleLabByCode = (code: string) => sampleLabs.find((l) => l.code === code);
