import type { AcademyInfo, ClassVideo, Course, Department, Lesson, Material, School, TeacherRecord, VideoAccess, VideoComment, Workshop } from "@/lib/media/academy";
import { academiesFrom } from "../../lib/media/academy.ts";
import type { Question } from "@/lib/media/classroom";

/**
 * কাণ্ডারী তৈরি একাডেমি — departments, courses, workshops, teachers and the
 * public interview board. Teachers are members of শিক্ষিতদের মিডিয়া, so
 * every teacher links to a real profile with community-verified skills.
 * Dates sit around DEMO_NOW (Friday 2026-09-25). Sample data for the demo.
 */

const L = (week: number, title: string, mode: Lesson["mode"], homework?: string, by?: string): Lesson => ({ week, title, mode, homework, by });
const M = (kind: Material["kind"], title: string, size: string): Material => ({ kind, title, size });

/** What every course is opened with: its five-week plan's start, the syllabus, the 40-day working calendar and the 2.5-minute promo. */
const opened = (code: string, starts: string) => ({
  weeks: 5,
  starts,
  syllabus: M("pdf", `${code} সিলেবাস`, "২৪০ কেবি"),
  calendar: M("sheet", `${code} কাজের ক্যালেন্ডার — ৪০ দিন`, "৩৬ কেবি"),
  promo: { seconds: 150 },
});

/** The running batch started on a Saturday three weeks ago; the next batches start on 17 October. */
const RUNNING = "2026-09-05";
const NEXT = "2026-10-17";

/**
 * Every department belongs to one academy — solo, under a teacher's own
 * name, or a team of friends — and teaches exactly three skill courses.
 */
/** The academies — like universities, each may open several departments. */
const A = {
  sorobingsho: { id: "sorobingsho", name: "ষড়বিংশ একাডেমি", about: "চার বন্ধুর একাডেমি — কোড, ডিজাইন, সার্ভার, এআই আর যন্ত্র। প্রতি সপ্তাহে লাইভে একটা জিনিস শূন্য থেকে বানিয়ে দেখান, আপনিও সাথে বানান।" },
  tanvir: { id: "tanvir-sthapotto", name: "তানভীর রহমান স্থাপত্য একাডেমি", about: "একজন স্থপতির একক একাডেমি — বন্যা আর ঝড়ের দেশে কম খরচে টেকসই বাড়ি আঁকা, পাঁচজনের ছোট ব্যাচে।" },
  rafi: { id: "rafiqul-motors", name: "রফিকুল মোটরস গ্যারেজ একাডেমি", about: "আঠারো বছরের গ্যারেজ এখন শ্রেণিকক্ষ — একজন মেকানিক, পাঁচজন শিক্ষার্থী, প্রতিটা স্ক্রু নিজের হাতে।" },
  hari: { id: "hari-dekchi", name: "হাঁড়ি-ডেকচি রান্না একাডেমি", about: "ঘরের রাঁধুনি আর ফুচকার গাড়ির মালিক মিলে — বিয়েবাড়ির ডেকচি থেকে রাস্তার খাবারের ব্যবসা।" },
  mitu: { id: "mitu-sangit", name: "মিতু সরকার সংগীত একাডেমি", about: "একজন গায়িকার একক একাডেমি — হাসন রাজা আর লালনের গান, প্রতি সপ্তাহে লাইভে গেয়ে শোনান, সরাসরি শুধরে দেন।" },
  sadman: { id: "sadman-music", name: "সাদমান বিন আহমেদ মিউজিক একাডেমি", about: "একজন গিটারিস্টের একক একাডেমি — পাঁচজনের ব্যাচে প্রতিটা আঙুলের ভুল ধরে ইলেকট্রিক গিটার শেখানো।" },
  joy: { id: "joy-art", name: "জয় চক্রবর্তী আর্ট স্টুডিও", about: "একজন চিত্রশিল্পীর একক স্টুডিও — জলরং, বাংলা হরফ আর নিজের আঁকা ছবি বিক্রি করা।" },
  rupganj: { id: "rupganj-karushilpo", name: "রূপগঞ্জ কারুশিল্প একাডেমি", about: "জামালপুরের কাঁথা শিল্পী আর রূপগঞ্জের জামদানি তাঁতি মিলে — ফোঁড় থেকে তাঁত, তারপর বাজার।" },
  frame: { id: "frame-studio", name: "ফ্রেম স্টুডিও একাডেমি", about: "তিন বন্ধু — ভিডিও, ফটো আর ডিজাইন। ফোন দিয়েই শুরু, শেষে নিজের চ্যানেল আর ক্লায়েন্ট।" },
  khata: { id: "khata-kalam", name: "খাতা-কলম ব্যবসা একাডেমি", about: "হিসাবের ছাত্র আর মুদি দোকানি মিলে — খাতা থেকে আয়কর, দোকান থেকে হোম ডেলিভারি।" },
  taslima: { id: "taslima-beauty", name: "তাসলিমা বিউটি একাডেমি", about: "একজন মেহেদি শিল্পীর একক একাডেমি — বিয়ে আর উৎসবের সাজ, ত্বকের নিরাপত্তা আর সেবার ন্যায্য দাম।" },
  sabbir: { id: "sabbir-cricket", name: "সাব্বির ক্রিকেট একাডেমি", about: "সাবেক বিভাগীয় খেলোয়াড়ের একক একাডেমি — রাজশাহীর মাঠে পাঁচজনের ব্যাচ, সব বয়সের জন্য।" },
  nusrat: { id: "nusrat-pathshala", name: "নুসরাত গণিত পাঠশালা", about: "একজন গণিত শিক্ষকের একক পাঠশালা — রিকশা, বাজার আর ফসল দিয়ে অঙ্ক, ভয় ছাড়া।" },
} satisfies Record<string, AcademyInfo>;

export const departments: Department[] = [
  { id: "web-ai", name: "ওয়েব ডেভেলপমেন্ট", academy: A.sorobingsho, school: "engineering", kind: "team", teachers: ["anik", "mahir", "rupa", "tamim"], founded: "2026-03-01", blurb: "ওয়েবসাইট আর ওয়েব অ্যাপ — পাতা বানানো থেকে ডেটাবেস, লগইন আর এআই চ্যাটবট পর্যন্ত।", fit: { goals: ["job", "business", "home"], likes: ["computers"], talents: ["mind"] } },
  { id: "mechatronics", name: "মেকাট্রনিক্স ও আইওটি", academy: A.sorobingsho, school: "engineering", kind: "team", teachers: ["mahir", "anik"], place: "কাণ্ডারী-ল্যাব, নকলা, শেরপুর", founded: "2026-04-14", blurb: "সেন্সর, মোটর আর কোড একসাথে — গ্রামের সমস্যার যন্ত্র নিজের হাতে বানানো।", fit: { goals: ["job", "business"], likes: ["machines", "computers"], talents: ["hands", "mind"] } },
  { id: "architecture", name: "স্থাপত্য নকশা", academy: A.tanvir, school: "engineering", kind: "solo", teachers: ["tanvir"], founded: "2026-05-02", blurb: "বন্যা আর ঝড় মাথায় রেখে কম খরচের বাড়ির নকশা — অটোক্যাড থেকে মাঠের মাপজোখ।", fit: { goals: ["job", "business"], likes: ["art", "numbers"], talents: ["mind", "art"] } },
  { id: "motor", name: "যানবাহন মেরামত", academy: A.rafi, school: "trades", kind: "solo", teachers: ["rafi"], place: "রফিকুল ইসলামের গ্যারেজ, টঙ্গী, গাজীপুর", founded: "2026-02-10", blurb: "বাইক, রিকশা আর ইজিবাইক — ভিডিওতে বুঝুন, গ্যারেজে এসে নিজের হাতে খুলুন-জোড়া লাগান।", fit: { goals: ["job", "business"], likes: ["machines"], talents: ["hands"] } },
  { id: "kitchen", name: "রান্না ও শেফ", academy: A.hari, school: "food", kind: "team", teachers: ["rahima", "babul"], place: "রহিমা বেগমের রান্নাঘর, মিরপুর ১০, ঢাকা", founded: "2026-03-20", blurb: "ঘরের রান্নাঘর থেকে বিয়েবাড়ির ডেকচি — মাপ, পরিচ্ছন্নতা, খরচের হিসাব আর পরিবেশন।", fit: { goals: ["business", "home", "job"], likes: ["food", "people"], talents: ["hands"] } },
  { id: "music", name: "কণ্ঠসংগীত", academy: A.mitu, school: "arts", kind: "solo", teachers: ["mitu"], founded: "2026-04-01", blurb: "কণ্ঠ, সুর আর লোকগীতি — রেওয়াজ থেকে নিজের গান রেকর্ড করা পর্যন্ত।", fit: { goals: ["joy", "home"], likes: ["art"], talents: ["art"] } },
  { id: "guitar", name: "মিউজিক", academy: A.sadman, school: "arts", kind: "solo", teachers: ["sadman"], founded: "2026-09-01", blurb: "ইলেকট্রিক গিটার — প্রথম কর্ড থেকে ব্যান্ডে বাজানো আর লিড সোলো।", fit: { goals: ["joy", "home"], likes: ["art"], talents: ["art", "hands"] } },
  { id: "fine-art", name: "চিত্রকলা", academy: A.joy, school: "arts", kind: "solo", teachers: ["joy"], founded: "2026-05-18", blurb: "জলরঙে নদী-গ্রাম, বাংলা হরফের ক্যালিগ্রাফি — আঁকা ছবি বিক্রি পর্যন্ত।", fit: { goals: ["joy", "home", "business"], likes: ["art"], talents: ["art", "hands"] } },
  { id: "textile", name: "নকশিকাঁথা ও তাঁত", academy: A.rupganj, school: "arts", kind: "team", teachers: ["shapla", "hasina"], place: "রূপগঞ্জ তাঁতপল্লি, নারায়ণগঞ্জ", founded: "2026-03-08", blurb: "জামালপুরের কাঁথা আর রূপগঞ্জের জামদানি — ফোঁড় থেকে বাজারে বিক্রি।", fit: { goals: ["home", "business"], likes: ["art"], talents: ["hands", "art"] } },
  { id: "media", name: "কনটেন্ট ক্রিয়েশন", academy: A.frame, school: "media", kind: "team", teachers: ["nabila", "sumaiya", "rupa"], founded: "2026-04-22", blurb: "ইউটিউবার হওয়া, প্রোডাক্ট ফটোগ্রাফি, মডেলিং আর গ্রাফিক ডিজাইন — ফোন দিয়েই শুরু।", fit: { goals: ["home", "business", "job"], likes: ["computers", "art", "people"], talents: ["art", "mind"] } },
  { id: "business", name: "হিসাব ও ব্যবসা", academy: A.khata, school: "business", kind: "team", teachers: ["sajid", "kamal"], founded: "2026-06-01", blurb: "দোকানের খাতা থেকে আয়কর রিটার্ন — টাকার হিসাব যে রাখে, ব্যবসা সে-ই টেকায়।", fit: { goals: ["business", "job"], likes: ["numbers", "people"], talents: ["mind"] } },
  { id: "beauty", name: "মেহেদি ও সাজ", academy: A.taslima, school: "life", kind: "solo", teachers: ["taslima"], founded: "2026-06-15", blurb: "বিয়ে আর উৎসবের মেহেদি নকশা, ত্বকের নিরাপত্তা, বাসায় গিয়ে সেবার দাম ঠিক করা।", fit: { goals: ["business", "home"], likes: ["people", "art"], talents: ["hands", "art"] } },
  { id: "sports", name: "ক্রিকেট ও ফিটনেস", academy: A.sabbir, school: "life", kind: "solo", teachers: ["sabbir"], place: "শহীদ কামারুজ্জামান স্টেডিয়াম মাঠ, রাজশাহী", founded: "2026-05-05", blurb: "সব বয়সের জন্য — ব্যাটিং-বোলিংয়ের কৌশল, চোট এড়ানো, নিজের দল গড়া।", fit: { goals: ["joy", "job"], likes: ["body"], talents: ["body"] } },
  { id: "math", name: "গণিত", academy: A.nusrat, school: "science", kind: "solo", teachers: ["nusrat"], founded: "2026-02-25", blurb: "রিকশার গতি, বাজারের হিসাব, ফসলের মাপ — চারপাশের জিনিস দিয়ে গণিত।", fit: { goals: ["job", "joy"], likes: ["numbers"], talents: ["mind"] } },
];

/** The academies with all their departments, in the order they appear above. */
export const academies = academiesFrom(departments);
const academyById = new Map(academies.map((a) => [a.id, a]));
export const getAcademy = (id: string) => academyById.get(id);

export const courses: Course[] = [
  /* ── ষড়বিংশ একাডেমি · ওয়েব ডেভেলপমেন্ট ── */
  {
    id: "WEB-101", dept: "web-ai", title: "ওয়েব অ্যাপ বানানো — শূন্য থেকে লাইভ", teacher: "anik", level: "foundation", fee: 3000, seats: 15, enrolled: 14, image: "/media/dsa-code.webp", ...opened("WEB-101", RUNNING),
    outcome: "নিজের দোকান বা সংগঠনের জন্য একটা কাজের ওয়েব অ্যাপ বানিয়ে ইন্টারনেটে তুলতে পারবেন।",
    lessons: [L(1, "ব্রাউজার কীভাবে পাতা দেখায় — এইচটিএমএল", "live", "নিজের পরিচয়ের একটা পাতা", "anik"), L(2, "সিএসএস দিয়ে সাজানো, ফোনে ঠিক দেখানো", "video", "পাতাটা ফোনে ঠিক করুন", "rupa"), L(3, "জাভাস্ক্রিপ্ট — বোতাম চাপলে কী হবে", "live", undefined, "anik"), L(4, "রিঅ্যাক্ট: পাতাকে টুকরোয় ভাঙা", "live", "দোকানের পণ্যের তালিকা", "anik"), L(5, "অ্যাপ লাইভ করা ও রিভিউ", "live", "লাইভ লিংক জমা", "tamim")],
    materials: [M("video", "প্রতি সপ্তাহের ক্লাস রেকর্ডিং", "৫টি"), M("pdf", "এইচটিএমএল-সিএসএস চিটশিট", "১.২ এমবি"), M("data", "দোকানের নমুনা পণ্য-তালিকা (JSON)", "৪০ কেবি")],
    final: "একটি সত্যিকারের দোকান, ক্লাব বা স্কুলের জন্য অ্যাপ — লাইভ লিংক আর কোডসহ।", nextLive: "2026-09-26T14:00:00Z",
  },
  {
    id: "WEB-201", dept: "web-ai", title: "ব্যাকএন্ড ও ডেটাবেস — অর্ডার নেওয়ার অ্যাপ", teacher: "tamim", level: "intermediate", fee: 3500, seats: 15, enrolled: 9, image: "/media/covers/web-201.webp", ...opened("WEB-201", NEXT),
    outcome: "লগইন, ডেটাবেস আর পেমেন্টসহ একটা অর্ডার নেওয়ার অ্যাপের পেছনের অংশ নিজে বানাতে পারবেন।",
    lessons: [L(1, "সার্ভার কী, এপিআই কী", "live", "তিনটি এপিআই ডাকুন", "tamim"), L(2, "ডেটাবেস — টেবিল, সম্পর্ক, প্রশ্ন", "live", undefined, "tamim"), L(3, "লগইন আর নিরাপত্তা", "video", "নিজের অ্যাপে লগইন", "anik"), L(4, "বিকাশ-নগদে পেমেন্ট", "live", undefined, "tamim"), L(5, "অ্যাডমিন পাতা ও রিপোর্ট", "live", "দোকানের অর্ডারের রিপোর্ট", "rupa")],
    materials: [M("pdf", "এসকিউএল চিটশিট", "৪৮০ কেবি"), M("data", "নমুনা অর্ডারের ডেটাবেস", "১.১ এমবি")],
    final: "একটি দোকানের অর্ডার, পেমেন্ট আর অ্যাডমিন পাতাসহ পুরো অ্যাপ — লাইভ লিংক ও কোড।", nextLive: "2026-10-17T14:00:00Z",
  },
  {
    id: "AI-201", dept: "web-ai", title: "ওয়েবে এআই — বাংলা চ্যাটবট", teacher: "mahir", level: "intermediate", fee: 4000, seats: 15, enrolled: 11, image: "/media/challenge-hackathon.webp", ...opened("AI-201", RUNNING),
    outcome: "পাইথনে বাংলা প্রশ্নের উত্তর দেওয়া একটা চ্যাটবট বানিয়ে ওয়েবে বসাতে পারবেন।",
    lessons: [L(1, "পাইথনের ঝটপট পুনরাবৃত্তি", "video", "ছোট একটা ক্যালকুলেটর", "tamim"), L(2, "এআই মডেল কী, কীভাবে উত্তর দেয়", "live", undefined, "mahir"), L(3, "নিজের নথি থেকে উত্তর (RAG)", "live", "স্কুলের নোটিশ দিয়ে বট", "mahir"), L(4, "ওয়েবে বসানো", "live", "লাইভ ডেমো", "anik"), L(5, "ভুল উত্তর ধরা ও নিরাপত্তা", "live", undefined, "mahir")],
    materials: [M("video", "ক্লাস রেকর্ডিং", "৫টি"), M("data", "বাংলা প্রশ্নোত্তর নমুনা ডেটাসেট", "২.৪ এমবি"), M("doc", "প্রম্পট লেখার নির্দেশিকা", "৩২০ কেবি")],
    final: "একটি প্রতিষ্ঠানের আসল প্রশ্নের উত্তর দেওয়া বাংলা চ্যাটবট, ভুল-উত্তরের হিসাবসহ।", nextLive: "2026-09-27T13:00:00Z",
  },

  /* ── যন্ত্রঘর একাডেমি · মেকাট্রনিক্স ও আইওটি ── */
  {
    id: "MEC-101", dept: "mechatronics", title: "মেকাট্রনিক্স: সেন্সর থেকে রোবট", teacher: "mahir", level: "foundation", fee: 4500, seats: 15, enrolled: 13, image: "/media/circuit.webp", ...opened("MEC-101", RUNNING),
    outcome: "সেন্সর পড়ে মোটর চালানো একটা যন্ত্র নকশা করে নিজের হাতে বানাতে পারবেন।",
    lessons: [L(1, "বিদ্যুৎ, ভোল্ট আর নিরাপত্তা", "video", "বাড়ির তিনটি যন্ত্রের ভোল্ট-অ্যাম্প লিখুন", "mahir"), L(2, "ব্রেডবোর্ডে প্রথম সার্কিট", "hands-on", undefined, "mahir"), L(3, "মাইক্রোকন্ট্রোলার প্রোগ্রাম", "live", "এলইডি জ্বলা-নেভা", "anik"), L(4, "সেন্সর, মোটর আর রিলে", "hands-on", "পাম্প চালু-বন্ধ", "mahir"), L(5, "বাক্সে ভরা — মাঠে টেকার মতো", "hands-on", "নকশার ছবি", "anik")],
    materials: [M("pdf", "যন্ত্রাংশের তালিকা ও দাম", "৬০০ কেবি"), M("sheet", "সার্কিটের হিসাব (এক্সেল)", "৯০ কেবি"), M("video", "সোল্ডারিং হাতে-কলমে", "৩টি")],
    final: "গ্রাম বা কারখানার একটা সমস্যার যন্ত্র — চালু অবস্থার ভিডিও আর খরচের হিসাবসহ।", nextLive: "2026-09-28T04:00:00Z",
  },
  {
    id: "MEC-201", dept: "mechatronics", title: "আইওটি — ফোন থেকে খামার দেখা", teacher: "anik", level: "intermediate", fee: 4000, seats: 15, enrolled: 8, image: "/bangladesh/rural/farmer-cattle.jpg", ...opened("MEC-201", NEXT),
    outcome: "খামারের তাপ, আর্দ্রতা আর পানির মাপ ফোনে দেখার একটা আইওটি ব্যবস্থা বসাতে পারবেন।",
    lessons: [L(1, "আইওটি কী — যন্ত্র কথা বলে কীভাবে", "video", "খামারের তিনটি মাপের তালিকা", "anik"), L(2, "ওয়াইফাই বোর্ড আর সেন্সর", "hands-on", undefined, "mahir"), L(3, "ডেটা ক্লাউডে পাঠানো", "live", "এক দিনের তাপমাত্রার গ্রাফ", "anik"), L(4, "ফোনে সতর্কবার্তা", "live", undefined, "anik"), L(5, "খামারে বসানো ও বিদ্যুৎ বাঁচানো", "hands-on", "বসানোর ছবি", "mahir")],
    materials: [M("pdf", "সেন্সর বসানোর নির্দেশিকা", "৯০০ কেবি"), M("sheet", "খামারের নমুনা ডেটা", "৬০ কেবি")],
    final: "একটি সত্যিকারের খামার বা পোলট্রি ঘরে চালু আইওটি ব্যবস্থা, এক সপ্তাহের ডেটাসহ।", nextLive: "2026-10-17T04:00:00Z",
  },
  {
    id: "MEC-202", dept: "mechatronics", title: "সোলার পাম্প ও স্মার্ট সেচ", teacher: "mahir", level: "intermediate", fee: 5000, seats: 15, enrolled: 6, image: "/bangladesh/rural/sowing-paddy.jpg", ...opened("MEC-202", NEXT),
    outcome: "সোলার প্যানেলে চলা পাম্প মাটির আর্দ্রতা দেখে নিজে চালু-বন্ধ করার ব্যবস্থা বানাতে পারবেন।",
    lessons: [L(1, "সোলার প্যানেল, ব্যাটারি আর ইনভার্টার", "video", "নিজের এলাকার রোদের ঘণ্টা", "mahir"), L(2, "পাম্প আর পাইপের মাপ", "hands-on", undefined, "mahir"), L(3, "মাটির আর্দ্রতা সেন্সর", "hands-on", "মাটির তিনটি নমুনার মাপ", "anik"), L(4, "নিজে চলা নিয়ন্ত্রণ", "live", undefined, "anik"), L(5, "জমিতে বসানো ও খরচের হিসাব", "hands-on", "খরচের শিট", "mahir")],
    materials: [M("pdf", "সোলার মাপের হিসাব", "৭০০ কেবি"), M("sheet", "পাম্প ও প্যানেলের দাম", "৪৫ কেবি")],
    final: "এক বিঘা জমির জন্য সোলার সেচের পূর্ণ নকশা বা চালু ব্যবস্থা — খরচ আর পানির হিসাবসহ।", nextLive: "2026-10-17T05:00:00Z",
  },

  /* ── তানভীর রহমান স্থাপত্য একাডেমি · স্থাপত্য নকশা ── */
  {
    id: "ARC-101", dept: "architecture", title: "বন্যা-সহনশীল বাড়ির নকশা", teacher: "tanvir", level: "intermediate", fee: 4000, seats: 5, enrolled: 4, image: "/media/floorplan.webp", ...opened("ARC-101", RUNNING),
    outcome: "উঁচু ভিটা, বাঁশ-কংক্রিট আর বাতাস চলাচল মাথায় রেখে একটা গ্রামীণ বাড়ির নকশা আঁকতে পারবেন।",
    lessons: [L(1, "বন্যার পানি কোথা দিয়ে ঢোকে", "video", "নিজের এলাকার বন্যার উচ্চতা জেনে আসুন"), L(2, "অটোক্যাডে প্রথম নকশা", "live"), L(3, "ভিটা, খুঁটি আর ভিত", "live", "ভিটার মাপ"), L(4, "কম খরচের উপকরণ ও মাঠে মাপজোখ", "hands-on", "মাঠের ছবি ও মাপ"), L(5, "খরচের হিসাব ও উপস্থাপন", "live")],
    materials: [M("doc", "নকশার টেমপ্লেট", "৪ এমবি"), M("sheet", "উপকরণের খরচের শিট", "১২০ কেবি")],
    final: "একটি পরিবারের জন্য বন্যা-সহনশীল বাড়ির পূর্ণ নকশা ও খরচ।", nextLive: "2026-09-30T13:00:00Z",
  },
  {
    id: "ARC-102", dept: "architecture", title: "অটোক্যাডে বাড়ির প্ল্যান — শুরু থেকে", teacher: "tanvir", level: "foundation", fee: 2500, seats: 5, enrolled: 5, image: "/media/house-built.webp", ...opened("ARC-102", NEXT),
    outcome: "অটোক্যাডে একটা দুই কামরার বাড়ির মাপসহ প্ল্যান আঁকতে আর মিস্ত্রিকে বোঝাতে পারবেন।",
    lessons: [L(1, "অটোক্যাড খোলা — রেখা, মাপ, স্তর", "video", "একটা ঘরের মেঝের মাপ"), L(2, "দেয়াল, দরজা, জানালা", "live"), L(3, "মাপ লেখা ও ছাপার জন্য তৈরি", "live", "দুই কামরার প্ল্যান"), L(4, "পাশ থেকে দেখা — এলিভেশন", "live"), L(5, "মিস্ত্রির সাথে প্ল্যান পড়া", "hands-on", "প্ল্যান হাতে মাঠের ছবি")],
    materials: [M("doc", "অটোক্যাড শর্টকাটের তালিকা", "২১০ কেবি"), M("data", "নমুনা প্ল্যানের ফাইল (DWG)", "৩.৪ এমবি")],
    final: "নিজের বা পরিচিত একটি পরিবারের দুই কামরার বাড়ির পূর্ণ প্ল্যান, মাপ আর এলিভেশনসহ।", nextLive: "2026-10-17T13:00:00Z",
  },
  {
    id: "ARC-201", dept: "architecture", title: "ঝড়-সহনশীল ঘর ও আশ্রয়কেন্দ্রের নকশা", teacher: "tanvir", level: "advanced", fee: 5000, seats: 5, enrolled: 2, image: "/bangladesh/rural/cyclone-shelter.jpg", ...opened("ARC-201", NEXT),
    outcome: "উপকূলের বাতাস আর জলোচ্ছ্বাস মাথায় রেখে ঘর ও ছোট আশ্রয়কেন্দ্রের নকশা করতে পারবেন।",
    lessons: [L(1, "বাতাসের চাপ আর ছাদ উড়ে যাওয়া", "video", "এলাকার পুরোনো ঘরের ছাদ দেখে আসুন"), L(2, "খুঁটি, বাঁধন আর ভিত", "live"), L(3, "জলোচ্ছ্বাসের উচ্চতা ও তলা", "live", "উচ্চতার হিসাব"), L(4, "আশ্রয়কেন্দ্রের জায়গা আর পথ", "live"), L(5, "খরচ, অনুমতি আর উপস্থাপন", "live", "উপস্থাপনের খসড়া")],
    materials: [M("pdf", "উপকূলীয় নির্মাণের নির্দেশিকা", "২.৮ এমবি"), M("sheet", "বাতাসের চাপের হিসাব", "৫৫ কেবি")],
    final: "একটি উপকূলীয় গ্রামের জন্য ঝড়-সহনশীল ঘর বা ছোট আশ্রয়কেন্দ্রের নকশা ও খরচ।", nextLive: "2026-10-18T13:00:00Z",
  },

  /* ── রফিকুল মোটরস গ্যারেজ একাডেমি · যানবাহন মেরামত ── */
  {
    id: "MTR-101", dept: "motor", title: "মোটরসাইকেল সার্ভিসিং", teacher: "rafi", level: "foundation", fee: 3500, seats: 5, enrolled: 5, image: "/media/bike-service.webp", ...opened("MTR-101", RUNNING),
    outcome: "একটা মোটরসাইকেলের পুরো সার্ভিসিং নিজে করতে পারবেন — অয়েল, চেইন, ব্রেক, প্লাগ, ক্লাচ।",
    lessons: [L(1, "যন্ত্রপাতি চেনা ও নিরাপত্তা", "video", "নিজের টুলবক্সের ছবি"), L(2, "ইঞ্জিন অয়েল ও ফিল্টার", "hands-on"), L(3, "চেইন, স্প্রকেট, টায়ার আর ব্রেক", "hands-on", "চেইনের ঢিল মাপুন"), L(4, "স্পার্ক প্লাগ, ক্লাচ ও বিদ্যুতের লাইন", "hands-on", "প্লাগের রং দেখে ইঞ্জিনের অবস্থা"), L(5, "পুরো সার্ভিসিং, ঘড়ি ধরে", "hands-on", "সার্ভিসিংয়ের ভিডিও")],
    materials: [M("video", "প্রতিটি কাজের ধাপে ধাপে ভিডিও", "১৪টি"), M("pdf", "সার্ভিসিং চেকলিস্ট", "২১০ কেবি"), M("sheet", "যন্ত্রাংশের দাম ও কাস্টমারের হিসাব", "৬০ কেবি")],
    final: "একটি বাইকের পূর্ণ সার্ভিসিং — শুরুর আর শেষের অবস্থা, ভিডিও ও যন্ত্রাংশের হিসাব।", nextLive: "2026-09-26T04:00:00Z",
  },
  {
    id: "MTR-201", dept: "motor", title: "ইঞ্জিন ও কার্বুরেটর ওভারহল", teacher: "rafi", level: "advanced", fee: 5000, seats: 5, enrolled: 3, image: "/media/carburetor.webp", ...opened("MTR-201", RUNNING),
    outcome: "ইঞ্জিন খুলে সমস্যা খুঁজে আবার চালু করতে পারবেন — নিজের গ্যারেজ চালানোর মতো।",
    lessons: [L(1, "শব্দ শুনে সমস্যা ধরা", "video", "তিনটি বাইকের শব্দ রেকর্ড"), L(2, "কার্বুরেটর খোলা ও পরিষ্কার", "hands-on"), L(3, "পিস্টন, রিং, ভাল্ভ আর টাইমিং", "hands-on", "মাপের খাতা"), L(4, "জোড়া লাগানো ও প্রথম চালু", "hands-on"), L(5, "কাস্টমার, দাম আর ওয়ারেন্টি", "live", "নিজের গ্যারেজের দামের তালিকা")],
    materials: [M("video", "ওভারহল পুরো রেকর্ডিং", "৫টি"), M("pdf", "টর্ক ও মাপের তালিকা", "৪৮০ কেবি")],
    final: "একটি বন্ধ ইঞ্জিন চালু করা — কী নষ্ট ছিল, কী বদলালেন, কত খরচ।", nextLive: "2026-10-01T04:00:00Z",
  },
  {
    id: "RKS-101", dept: "motor", title: "রিকশা-ভ্যান মেরামত ও ইজিবাইকের ব্যাটারি", teacher: "rafi", level: "foundation", fee: 0, seats: 5, enrolled: 5, image: "/bangladesh/rickshaw.jpg", ...opened("RKS-101", "2026-08-29"),
    outcome: "রিকশা-ভ্যানের চাকা, ব্রেক, চেইন সারাতে আর ইজিবাইকের ব্যাটারি নিরাপদে রাখতে পারবেন।",
    lessons: [L(1, "চাকা, স্পোক আর টিউব", "video", "নিজের রিকশার চাকা দেখে কী ঠিক নেই লিখুন"), L(2, "ব্রেক ও চেইন", "hands-on"), L(3, "ইজিবাইকের ব্যাটারি — চার্জ, পানি, আগুনের ঝুঁকি", "video", "নিজের এলাকার চার্জিং ঘরের অবস্থা লিখুন"), L(4, "মোটর আর কন্ট্রোলার", "hands-on"), L(5, "বডি ও হুড মেরামত", "hands-on", "আগে-পরের ছবি")],
    materials: [M("video", "চাকা ও ব্রেকের ভিডিও", "৪টি"), M("pdf", "ব্যাটারি নিরাপত্তার নিয়ম", "১৮০ কেবি")],
    final: "একটি রিকশা বা ভ্যানের মেরামত, আগে-পরের ছবিসহ।", nextLive: "2026-09-27T04:00:00Z",
  },

  /* ── হাঁড়ি-ডেকচি রান্না একাডেমি · রান্না ও শেফ ── */
  {
    id: "CHF-101", dept: "kitchen", title: "ঘরোয়া রান্না থেকে পেশাদার শেফ", teacher: "rahima", level: "foundation", fee: 4000, seats: 15, enrolled: 12, image: "/media/kacchi.webp", ...opened("CHF-101", RUNNING),
    outcome: "৫০–১০০ জনের রান্না মাপমতো, পরিচ্ছন্নভাবে, খরচের হিসাব রেখে করতে পারবেন।",
    lessons: [L(1, "রান্নাঘরের পরিচ্ছন্নতা ও ছুরি ধরা", "live", "নিজের রান্নাঘরের ছবি", "rahima"), L(2, "মসলা — অনুপাত আর ভাজা", "hands-on", undefined, "rahima"), L(3, "ভাত, পোলাও, বিরিয়ানি", "hands-on", "এক কেজির পোলাও", "rahima"), L(4, "খরচ, দাম ও লাভ", "live", "৫০ জনের বাজারের তালিকা", "babul"), L(5, "পরিবেশন ও মেন্যু", "hands-on", undefined, "rahima")],
    materials: [M("pdf", "মাপসহ ৪০টি রেসিপি", "৩.১ এমবি"), M("sheet", "জনপ্রতি খরচের হিসাব", "৭০ কেবি"), M("video", "রান্নাঘরের ক্লাস রেকর্ডিং", "৫টি")],
    final: "একটি অনুষ্ঠানের পুরো মেন্যু রান্না — মাপ, খরচ, পরিবেশন, অতিথির মতামত।", nextLive: "2026-09-26T09:00:00Z",
  },
  {
    id: "CHF-102", dept: "kitchen", title: "স্ট্রিট ফুড ব্যবসা — ফুচকা থেকে টিফিন", teacher: "babul", level: "foundation", fee: 1500, seats: 15, enrolled: 9, image: "/media/shop-fuchka.webp", ...opened("CHF-102", RUNNING),
    outcome: "একটা খাবারের গাড়ি বা টিফিন সার্ভিস চালু করে প্রতিদিনের হিসাব রাখতে পারবেন।",
    lessons: [L(1, "ফুচকা-চটপটির মাপ ও পরিচ্ছন্নতা", "live", undefined, "babul"), L(2, "জায়গা বাছাই ও অনুমতি", "video", "এলাকার তিনটি জায়গা ঘুরে দেখুন", "babul"), L(3, "দাম, খরচ, প্রতিদিনের খাতা", "live", "এক সপ্তাহের খাতা", "babul"), L(4, "টিফিনের রান্না — মাপ আর বাক্স", "hands-on", undefined, "rahima"), L(5, "টিফিন সার্ভিস ও ডেলিভারি", "live", "দশ জনের টিফিনের পরিকল্পনা", "babul")],
    materials: [M("sheet", "প্রতিদিনের বিক্রির খাতা", "৪০ কেবি"), M("pdf", "খাদ্য নিরাপত্তার নিয়ম", "২৬০ কেবি")],
    final: "এক সপ্তাহ নিজে খাবার বিক্রি — খাতা, ছবি আর লাভ-ক্ষতি।", nextLive: "2026-09-29T11:00:00Z",
  },
  {
    id: "CHF-201", dept: "kitchen", title: "বিয়েবাড়ির বড় রান্না — ১০০ থেকে ৫০০ জন", teacher: "rahima", level: "advanced", fee: 5000, seats: 15, enrolled: 7, image: "/media/kacchi-listing.webp", ...opened("CHF-201", NEXT),
    outcome: "৫০০ জনের অনুষ্ঠানের রান্না, লোক ভাগ আর খরচের হিসাব নিজে সামলাতে পারবেন।",
    lessons: [L(1, "বড় ডেকচির মাপ — ১০০ থেকে ৫০০", "live", "৩০০ জনের বাজারের তালিকা", "rahima"), L(2, "কাচ্চি আর রোস্ট, বড় মাপে", "hands-on", undefined, "rahima"), L(3, "রান্নাঘরের লোক ভাগ আর সময়", "live", "অনুষ্ঠানের দিনের সময়সূচি", "babul"), L(4, "পরিবেশন, পরিচ্ছন্নতা আর বেঁচে যাওয়া খাবার", "hands-on", undefined, "rahima"), L(5, "অর্ডার নেওয়া, অগ্রিম আর লাভ", "live", "নিজের দামের তালিকা", "babul")],
    materials: [M("sheet", "জনপ্রতি মাপ ও খরচ — ৫০০ জন পর্যন্ত", "৯০ কেবি"), M("pdf", "অনুষ্ঠানের চেকলিস্ট", "২০০ কেবি")],
    final: "একটি সত্যিকারের অনুষ্ঠানের রান্না বা পূর্ণ পরিকল্পনা — মাপ, লোক, সময় আর খরচ।", nextLive: "2026-10-17T09:00:00Z",
  },

  /* ── মিতু সরকার সংগীত একাডেমি · কণ্ঠসংগীত ── */
  {
    id: "MUS-101", dept: "music", title: "কণ্ঠসংগীত ও সুর", teacher: "mitu", level: "foundation", fee: 2500, seats: 5, enrolled: 5, image: "/bangladesh/boishakh.jpg", ...opened("MUS-101", RUNNING),
    outcome: "সুরে গাইতে, নিজের গলা রক্ষা করতে আর একটা লোকগানের নিজস্ব সুর দাঁড় করাতে পারবেন।",
    lessons: [L(1, "শ্বাস আর গলা গরম করা", "live", "প্রতিদিন ১০ মিনিট রেওয়াজের রেকর্ড"), L(2, "সা রে গা মা — সুর চেনা", "live"), L(3, "তাল: দাদরা, কাহারবা", "video", "দাদরায় একটা গান"), L(4, "সুর রচনা", "live", "আট লাইনের নিজের সুর"), L(5, "মঞ্চে গাওয়া ও অনলাইন কনসার্ট", "live")],
    materials: [M("video", "রেওয়াজের ভিডিও", "১০টি"), M("doc", "গানের কথা ও স্বরলিপি", "৫৪০ কেবি")],
    final: "নিজের সুরে একটা গান — রেকর্ডিং আর মঞ্চে গাওয়ার ভিডিও।", nextLive: "2026-09-25T13:00:00Z",
  },
  {
    id: "MUS-102", dept: "music", title: "লোকগীতি — হাসন রাজা থেকে লালন", teacher: "mitu", level: "intermediate", fee: 3000, seats: 5, enrolled: 3, image: "/bangladesh/haor.jpg", ...opened("MUS-102", NEXT),
    outcome: "লোকগানের ঢং, উচ্চারণ আর তাল ধরে হাসন রাজা ও লালনের গান নিজের মতো গাইতে পারবেন।",
    lessons: [L(1, "লোকগানের শিকড় — হাওর থেকে ছেঁউড়িয়া", "video", "দুটি গান শুনে পার্থক্য লিখুন"), L(2, "হাসন রাজার গান — উচ্চারণ আর টান", "live"), L(3, "লালনের গান — একতারার তাল", "live", "একটা গানের রেকর্ড"), L(4, "ঢোল-দোতারার সাথে গাওয়া", "live"), L(5, "নিজের ঢঙে নতুন করে গাওয়া", "live", "নতুন গায়কির রেকর্ড")],
    materials: [M("doc", "গানের কথা ও উচ্চারণ", "৩৮০ কেবি"), M("video", "তালের অনুশীলন", "৫টি")],
    final: "দুটি লোকগান নিজের ঢঙে — রেকর্ডিং আর কেন এভাবে গাইলেন তার ব্যাখ্যা।", nextLive: "2026-10-17T13:00:00Z",
  },
  {
    id: "MUS-201", dept: "music", title: "রেকর্ডিং ও নিজের গান প্রকাশ", teacher: "mitu", level: "advanced", fee: 3500, seats: 5, enrolled: 2, image: "/media/covers/mus-201.webp", ...opened("MUS-201", NEXT),
    outcome: "ঘরে বসে পরিষ্কার শব্দে গান রেকর্ড করে মিক্স করতে আর অনলাইনে প্রকাশ করতে পারবেন।",
    lessons: [L(1, "ঘরকে ছোট স্টুডিও বানানো", "video", "নিজের ঘরের শব্দের পরীক্ষা"), L(2, "মাইক্রোফোন আর গলার দূরত্ব", "live"), L(3, "রেকর্ডিং সফটওয়্যার — কাটা, জোড়া", "live", "একটা গানের পরিষ্কার রেকর্ড"), L(4, "মিক্সিং — শব্দের ভারসাম্য", "live"), L(5, "প্রকাশ, কপিরাইট আর রয়্যালটি", "live", "প্রকাশের পরিকল্পনা")],
    materials: [M("pdf", "ঘরোয়া স্টুডিওর তালিকা ও দাম", "৩০০ কেবি"), M("doc", "গানের লাইসেন্সের নমুনা", "৬০ কেবি")],
    final: "নিজের একটি গান রেকর্ড, মিক্স আর অনলাইনে প্রকাশ — লিংক আর খরচসহ।", nextLive: "2026-10-18T13:00:00Z",
  },

  /* ── সাদমান বিন আহমেদ মিউজিক একাডেমি · মিউজিক ── */
  {
    id: "GTR-101", dept: "guitar", title: "ইলেকট্রিক গিটার — শুরু থেকে", teacher: "sadman", level: "foundation", fee: 3000, seats: 5, enrolled: 5, image: "/media/covers/gtr-101.webp", ...opened("GTR-101", "2026-09-19"),
    outcome: "ইলেকট্রিক গিটার সুরে বেঁধে মূল কর্ডগুলো বদলে বদলে একটা পুরো গান বাজাতে পারবেন।",
    lessons: [L(1, "গিটার চেনা, সুর বাঁধা আর ধরা", "live", "প্রতিদিন ১০ মিনিট আঙুলের অনুশীলন"), L(2, "প্রথম কর্ড — এ, ডি, ই", "live", "তিন কর্ডের রেকর্ড"), L(3, "কর্ড বদল আর স্ট্রামিং", "video"), L(4, "অ্যাম্প, ইফেক্ট আর শব্দ", "live", "নিজের পছন্দের শব্দ বানান"), L(5, "একটা পুরো গান", "live", "গানের ভিডিও")],
    materials: [M("pdf", "কর্ডের ছবি-তালিকা", "৬২০ কেবি"), M("video", "আঙুলের অনুশীলন", "৫টি")],
    final: "একটি পুরো গান ইলেকট্রিক গিটারে — ভিডিও, কর্ডের তালিকা আর নিজের শব্দের সেটিং।", nextLive: "2026-09-26T13:00:00Z",
  },
  {
    id: "GTR-102", dept: "guitar", title: "কর্ড, রিদম আর ব্যান্ডে বাজানো", teacher: "sadman", level: "intermediate", fee: 3500, seats: 5, enrolled: 3, image: "/media/covers/gtr-102.webp", ...opened("GTR-102", NEXT),
    outcome: "পাওয়ার কর্ড, বারে কর্ড আর রিদমে ড্রামারের সাথে ব্যান্ডে বাজাতে পারবেন।",
    lessons: [L(1, "পাওয়ার কর্ড আর পাম মিউট", "live", "রক রিদমের রেকর্ড"), L(2, "বারে কর্ড — আঙুলের জোর", "live"), L(3, "মেট্রোনোম আর ড্রামের সাথে বাজানো", "video", "৮০ থেকে ১২০ গতিতে অনুশীলন"), L(4, "ব্যান্ডে নিজের জায়গা — বেস আর কি-বোর্ডের সাথে", "live"), L(5, "লাইভ শো আর মঞ্চের শব্দ", "live", "ব্যান্ডের সাথে একটা গান")],
    materials: [M("data", "ড্রামের ব্যাকিং ট্র্যাক", "৪৬ এমবি"), M("pdf", "রিদমের নকশা", "৪০০ কেবি")],
    final: "একটি ব্যান্ডের সাথে বা ব্যাকিং ট্র্যাকে দুটি গান রিদম গিটারে — ভিডিওসহ।", nextLive: "2026-10-17T13:00:00Z",
  },
  {
    id: "GTR-201", dept: "guitar", title: "লিড গিটার ও সোলো", teacher: "sadman", level: "advanced", fee: 4000, seats: 5, enrolled: 1, image: "/media/covers/gtr-201.webp", ...opened("GTR-201", NEXT),
    outcome: "স্কেল, বেন্ড আর ভাইব্রেটো দিয়ে নিজের সোলো বানিয়ে গানের মধ্যে বাজাতে পারবেন।",
    lessons: [L(1, "পেন্টাটনিক স্কেল — পাঁচ ঘর", "live", "স্কেলের রেকর্ড"), L(2, "বেন্ড, স্লাইড আর ভাইব্রেটো", "live"), L(3, "লিক থেকে বাক্য — সোলোর গঠন", "video", "চার বারের একটা লিক"), L(4, "গতি আর পরিষ্কার পিকিং", "live"), L(5, "নিজের সোলো, গানের মধ্যে", "live", "সোলোর ভিডিও")],
    materials: [M("pdf", "স্কেলের ছক", "৩৫০ কেবি"), M("data", "সোলোর ব্যাকিং ট্র্যাক", "৩২ এমবি")],
    final: "একটি গানে নিজের বানানো সোলো — ভিডিও আর কেন এই সুর বেছে নিলেন।", nextLive: "2026-10-18T13:00:00Z",
  },

  /* ── জয় চক্রবর্তী আর্ট স্টুডিও · চিত্রকলা ── */
  {
    id: "ART-101", dept: "fine-art", title: "জলরং — নদী, গ্রাম, আলো", teacher: "joy", level: "foundation", fee: 2000, seats: 5, enrolled: 5, image: "/media/watercolor.webp", ...opened("ART-101", RUNNING),
    outcome: "জলরঙে প্রাকৃতিক দৃশ্য আঁকতে আর নিজের ছবির ন্যায্য দাম ঠিক করে বিক্রি করতে পারবেন।",
    lessons: [L(1, "কাগজ, তুলি আর পানির মাপ", "video", "রঙের চার্ট"), L(2, "আকাশ আর পানি — ওয়েট অন ওয়েট", "live"), L(3, "আলো-ছায়া", "live", "একটা নৌকা"), L(4, "গ্রামের দৃশ্য", "live"), L(5, "ছবির দাম ও বিক্রি", "live", "তিনটি ছবির দাম")],
    materials: [M("pdf", "রঙ মেশানোর চার্ট", "২.২ এমবি"), M("video", "ধাপে ধাপে আঁকা", "৫টি")],
    final: "তিনটি জলরঙের ছবির একটি সিরিজ, বাজারে তোলার জন্য তৈরি।", nextLive: "2026-09-28T12:00:00Z",
  },
  {
    id: "ART-102", dept: "fine-art", title: "বাংলা ক্যালিগ্রাফি", teacher: "joy", level: "foundation", fee: 1500, seats: 5, enrolled: 4, image: "/bangladesh/shaheedminar.jpg", ...opened("ART-102", NEXT),
    outcome: "কলম আর তুলিতে বাংলা হরফের ক্যালিগ্রাফি করে কার্ড, ফ্রেম আর দেয়ালে লিখতে পারবেন।",
    lessons: [L(1, "কলম, কালি আর হরফের মাপ", "video", "স্বরবর্ণের অনুশীলন"), L(2, "যুক্তাক্ষর আর মাত্রা", "live"), L(3, "নাম আর ছোট বাক্য", "live", "নিজের নামের ক্যালিগ্রাফি"), L(4, "তুলিতে বড় হরফ", "live"), L(5, "কার্ড আর ফ্রেম বিক্রি", "live", "পাঁচটি কার্ড")],
    materials: [M("pdf", "হরফের অনুশীলনের পাতা", "১.৬ এমবি")],
    final: "একুশে বা উৎসবের জন্য পাঁচটি ক্যালিগ্রাফি কার্ড বা একটি ফ্রেম — দামসহ।", nextLive: "2026-10-17T12:00:00Z",
  },
  {
    id: "ART-201", dept: "fine-art", title: "ছবি বিক্রি — প্রদর্শনী থেকে অনলাইন", teacher: "joy", level: "intermediate", fee: 2500, seats: 5, enrolled: 2, image: "/bangladesh/river.jpg", ...opened("ART-201", NEXT),
    outcome: "নিজের ছবির সিরিজ গুছিয়ে দাম ঠিক করে প্রদর্শনী আর অনলাইনে বিক্রি করতে পারবেন।",
    lessons: [L(1, "সিরিজ ভাবা — একটা গল্পে দশ ছবি", "live", "সিরিজের খসড়া"), L(2, "ছবির ছবি তোলা আর রং ঠিক রাখা", "video"), L(3, "দাম — আকার, সময় আর উপকরণ", "live", "দামের তালিকা"), L(4, "ছোট প্রদর্শনী সাজানো", "live"), L(5, "অনলাইন দোকান আর ক্রেতার সাথে কথা", "live", "প্রথম বিক্রির পোস্ট")],
    materials: [M("sheet", "ছবির দামের হিসাব", "৩০ কেবি")],
    final: "নিজের পাঁচ ছবির সিরিজ — দাম, অনলাইন পাতা আর প্রথম ক্রেতার খোঁজ।", nextLive: "2026-10-18T12:00:00Z",
  },

  /* ── রূপগঞ্জ কারুশিল্প একাডেমি · নকশিকাঁথা ও তাঁত ── */
  {
    id: "TEX-101", dept: "textile", title: "নকশিকাঁথা ও দর্জির কাজ", teacher: "shapla", level: "foundation", fee: 1500, seats: 15, enrolled: 13, image: "/media/kantha-full.webp", ...opened("TEX-101", RUNNING),
    outcome: "নকশিকাঁথার মূল ফোঁড়, মাপমতো জামা কাটা ও সেলাই — আর কাজের দাম ঠিক করতে পারবেন।",
    lessons: [L(1, "সুতা, সুঁই, কাপড় চেনা", "video", undefined, "shapla"), L(2, "রান ফোঁড় ও কাঁথা ফোঁড়", "hands-on", "এক ফুট কাঁথার নমুনা", "shapla"), L(3, "নকশা আঁকা ও তোলা", "hands-on", undefined, "hasina"), L(4, "মাপ নেওয়া, কাটা ও সেলাই", "hands-on", "নিজের মাপের কামিজ কাটা", "shapla"), L(5, "দাম ও বাজার", "live", undefined, "hasina")],
    materials: [M("pdf", "৩০টি নকশার ছাপ", "৫.৬ এমবি"), M("sheet", "সময় ও দামের হিসাব", "৩০ কেবি")],
    final: "একটি সম্পূর্ণ কাঁথা বা পোশাক, সময় ও খরচের হিসাবসহ।", nextLive: "2026-09-29T04:00:00Z",
  },
  {
    id: "TEX-102", dept: "textile", title: "জামদানি তাঁতের হাতেখড়ি", teacher: "hasina", level: "intermediate", fee: 2500, seats: 15, enrolled: 7, image: "/media/fashion-jamdani.webp", ...opened("TEX-102", "2026-09-19"),
    outcome: "জামদানি তাঁতে সুতা টানা থেকে ছোট নকশার পাড় বুনতে পারবেন।",
    lessons: [L(1, "তাঁত চেনা — টানা আর পোড়েন", "video", "তাঁতের অংশের নাম লিখুন", "hasina"), L(2, "সুতা রং আর মাড়", "hands-on", undefined, "hasina"), L(3, "নকশা গোনা — কাগজে জামদানি", "live", "একটা পাড়ের নকশা", "shapla"), L(4, "তাঁতে প্রথম পাড়", "hands-on", undefined, "hasina"), L(5, "শাড়ির দাম আর ক্রেতা", "live", undefined, "shapla")],
    materials: [M("pdf", "জামদানি নকশার ছক", "২.৪ এমবি")],
    final: "তাঁতে বোনা একটা জামদানি পাড় বা ওড়না — নকশার ছক, সময় আর দামসহ।", nextLive: "2026-10-03T04:00:00Z",
  },
  {
    id: "TEX-201", dept: "textile", title: "দর্জির কাজ ও অনলাইনে বিক্রি", teacher: "shapla", level: "intermediate", fee: 2000, seats: 15, enrolled: 10, image: "/bangladesh/rural/garment-machine.jpg", ...opened("TEX-201", NEXT),
    outcome: "মাপ নিয়ে সালোয়ার-কামিজ ও পাঞ্জাবি বানিয়ে ফেসবুক পেজে অর্ডার নিতে পারবেন।",
    lessons: [L(1, "মাপ নেওয়া আর প্যাটার্ন", "video", "তিনজনের মাপ", "shapla"), L(2, "কামিজ কাটা ও সেলাই", "hands-on", undefined, "shapla"), L(3, "পাঞ্জাবি আর কাঁথার কাজের গলা", "hands-on", "একটা গলার নকশা", "hasina"), L(4, "পণ্যের ছবি আর পেজ", "live", undefined, "shapla"), L(5, "অর্ডার, ডেলিভারি আর ফেরত", "live", "এক সপ্তাহের অর্ডারের খাতা", "hasina")],
    materials: [M("pdf", "মাপের ছক ও প্যাটার্ন", "১.৯ এমবি"), M("sheet", "অর্ডারের খাতা", "২৫ কেবি")],
    final: "তিনজন ক্রেতার জন্য মাপমতো পোশাক — ছবি, পেজের পোস্ট আর লাভ-ক্ষতি।", nextLive: "2026-10-17T04:00:00Z",
  },

  /* ── ফ্রেম স্টুডিও একাডেমি · কনটেন্ট ক্রিয়েশন ── */
  {
    id: "MED-101", dept: "media", title: "ইউটিউবার হওয়া — ভিডিও বানানো থেকে আয়", teacher: "nabila", level: "foundation", fee: 2500, seats: 15, enrolled: 15, image: "/bangladesh/bandarban.jpg", ...opened("MED-101", RUNNING),
    outcome: "ফোনে ভিডিও তুলে, এডিট করে, নিয়ম মেনে চ্যানেল চালাতে আর আয়ের পথ চিনতে পারবেন।",
    lessons: [L(1, "গল্প আগে, ক্যামেরা পরে", "live", "এক মিনিটের গল্প লিখুন", "nabila"), L(2, "ফোনে শুট — আলো, শব্দ, ফ্রেম", "video", undefined, "sumaiya"), L(3, "এডিটিং", "live", "প্রথম ভিডিও", "nabila"), L(4, "থাম্বনেইল, শিরোনাম আর কপিরাইট", "video", undefined, "rupa"), L(5, "আয় — বিজ্ঞাপন, স্পনসর, নিজের পণ্য", "live", "তিন মাসের পরিকল্পনা", "nabila")],
    materials: [M("video", "শুটিংয়ের ভিডিও", "৫টি"), M("doc", "ভিডিওর স্ক্রিপ্ট টেমপ্লেট", "৮০ কেবি"), M("sheet", "আপলোডের ক্যালেন্ডার", "২০ কেবি")],
    final: "নিজের চ্যানেলে চারটি ভিডিও আর তিন মাসের পরিকল্পনা।", nextLive: "2026-09-25T14:30:00Z",
  },
  {
    id: "MED-102", dept: "media", title: "প্রোডাক্ট ফটোগ্রাফি ও মডেলিং", teacher: "sumaiya", level: "intermediate", fee: 3000, seats: 15, enrolled: 10, image: "/media/shoot-after.webp", ...opened("MED-102", RUNNING),
    outcome: "দোকানের পণ্যের বিক্রিযোগ্য ছবি তুলতে আর ক্যামেরার সামনে পেশাদারভাবে দাঁড়াতে পারবেন।",
    lessons: [L(1, "আলো — জানালা থেকে সফটবক্স", "video", "একটা পণ্যের তিনটি ছবি", "sumaiya"), L(2, "পটভূমি ও স্টাইলিং", "hands-on", undefined, "sumaiya"), L(3, "এডিটিং ও রং", "live", "আগে-পরে", "rupa"), L(4, "মডেলিং — ভঙ্গি ও হাঁটা", "hands-on", undefined, "sumaiya"), L(5, "ক্লায়েন্ট, চুক্তি আর পোর্টফোলিও", "live", "দশ ছবির পোর্টফোলিও", "nabila")],
    materials: [M("pdf", "আলোর নকশা", "১.৮ এমবি"), M("doc", "শুটের চুক্তিপত্রের নমুনা", "৬০ কেবি")],
    final: "একটি সত্যিকারের দোকানের জন্য ২০টি পণ্যের ছবি।", nextLive: "2026-10-02T09:00:00Z",
  },
  {
    id: "GFX-101", dept: "media", title: "গ্রাফিক ডিজাইন ও ফেসবুক বিজ্ঞাপন", teacher: "rupa", level: "foundation", fee: 2500, seats: 15, enrolled: 14, image: "/media/ads-report.webp", ...opened("GFX-101", RUNNING),
    outcome: "লোগো, পোস্টার আর বিজ্ঞাপন বানিয়ে ছোট বাজেটে ঠিক মানুষের কাছে পৌঁছাতে পারবেন।",
    lessons: [L(1, "রং, হরফ আর ফাঁকা জায়গা", "video", "তিনটি পোস্টারের বিশ্লেষণ", "rupa"), L(2, "লোগো", "live", undefined, "rupa"), L(3, "সোশ্যাল পোস্ট ও ব্যানার", "live", "এক সপ্তাহের পোস্ট", "sumaiya"), L(4, "বিজ্ঞাপনের টার্গেটিং আর খরচ", "live", "৫০০ টাকার পরীক্ষামূলক বিজ্ঞাপন", "rupa"), L(5, "ক্লায়েন্টের সাথে কাজ", "live", undefined, "nabila")],
    materials: [M("doc", "ব্র্যান্ড গাইডের টেমপ্লেট", "২.৫ এমবি"), M("sheet", "বিজ্ঞাপনের ফলাফলের শিট", "৫০ কেবি")],
    final: "একটি ছোট ব্যবসার ব্র্যান্ড আর এক মাসের বিজ্ঞাপন — খরচ ও ফলসহ।", nextLive: "2026-09-27T14:00:00Z",
  },

  /* ── খাতা-কলম ব্যবসা একাডেমি · হিসাব ও ব্যবসা ── */
  {
    id: "BIZ-101", dept: "business", title: "এক্সেল, হিসাব ও আয়কর রিটার্ন", teacher: "sajid", level: "foundation", fee: 2000, seats: 15, enrolled: 14, image: "/media/tax-desk.webp", ...opened("BIZ-101", RUNNING),
    outcome: "এক্সেলে ব্যবসার হিসাব রাখতে আর নিজের বা অন্যের আয়কর রিটার্ন তৈরি করতে পারবেন।",
    lessons: [L(1, "এক্সেল — ঘর, সূত্র, SUM", "video", "এক মাসের খরচের শিট", "sajid"), L(2, "দোকানের খাতা", "live", undefined, "kamal"), L(3, "লাভ-ক্ষতি ও নগদ প্রবাহ", "live", "নিজের ব্যবসার হিসাব", "sajid"), L(4, "আয়কর — কে দেবে, কত", "video", undefined, "sajid"), L(5, "রিটার্ন পূরণ, ধাপে ধাপে", "live", "নমুনা রিটার্ন", "sajid")],
    materials: [M("sheet", "হিসাবের টেমপ্লেট", "১৪০ কেবি"), M("pdf", "রিটার্ন পূরণের নির্দেশিকা", "৯৬০ কেবি"), M("data", "নমুনা লেনদেন", "২২ কেবি")],
    final: "একটি সত্যিকারের ছোট ব্যবসার তিন মাসের হিসাব ও একজনের আয়কর রিটার্ন।", nextLive: "2026-09-26T15:00:00Z",
  },
  {
    id: "BIZ-102", dept: "business", title: "ছোট দোকান চালানো ও হোম ডেলিভারি", teacher: "kamal", level: "foundation", fee: 0, seats: 15, enrolled: 15, image: "/media/shop-grocery.webp", ...opened("BIZ-102", RUNNING),
    outcome: "মজুত, বাকি, ডেলিভারি আর অনলাইন অর্ডার সামলে দোকান লাভে রাখতে পারবেন।",
    lessons: [L(1, "মজুত ও পাইকারি কেনা", "video", "দোকানের মজুতের তালিকা", "kamal"), L(2, "বাকির খাতা", "live", undefined, "kamal"), L(3, "ফোনে অর্ডার ও ডেলিভারি", "live", "এক সপ্তাহের ডেলিভারির হিসাব", "kamal"), L(4, "বিকাশ-নগদে লেনদেন", "video", undefined, "sajid"), L(5, "মাস শেষের হিসাব", "live", "এক মাসের লাভ-ক্ষতি", "sajid")],
    materials: [M("sheet", "মজুত ও বাকির খাতা", "৩৫ কেবি")],
    final: "নিজের বা পরিবারের দোকানে এক মাস হিসাব রাখা — আগে-পরের লাভ।", nextLive: "2026-09-30T14:00:00Z",
  },
  {
    id: "BIZ-201", dept: "business", title: "ব্যবসার লাইসেন্স, ভ্যাট ও লোন", teacher: "kamal", level: "intermediate", fee: 2500, seats: 15, enrolled: 6, image: "/bangladesh/rural/paddy-bales.jpg", ...opened("BIZ-201", NEXT),
    outcome: "ট্রেড লাইসেন্স, ভ্যাট নিবন্ধন আর ব্যাংক বা এনজিও লোনের কাগজ নিজে তৈরি করতে পারবেন।",
    lessons: [L(1, "ট্রেড লাইসেন্স — কোথায়, কীভাবে", "video", "নিজের এলাকার অফিসের ঠিকানা", "kamal"), L(2, "ভ্যাট — কখন লাগে, কত", "live", undefined, "sajid"), L(3, "লোনের কাগজ আর ব্যবসার পরিকল্পনা", "live", "এক পাতার পরিকল্পনা", "sajid"), L(4, "কিস্তি আর সুদের হিসাব", "live", undefined, "sajid"), L(5, "ব্যাংকে কথা বলা", "live", "লোনের আবেদন", "kamal")],
    materials: [M("pdf", "লাইসেন্স ও ভ্যাটের ফর্মের নমুনা", "১.২ এমবি"), M("sheet", "কিস্তির হিসাব", "৩০ কেবি")],
    final: "একটি ছোট ব্যবসার লাইসেন্স, ভ্যাট আর লোনের পূর্ণ কাগজ — পরিকল্পনাসহ।", nextLive: "2026-10-17T15:00:00Z",
  },

  /* ── তাসলিমা বিউটি একাডেমি · মেহেদি ও সাজ ── */
  {
    id: "BTY-101", dept: "beauty", title: "মেহেদি নকশা — বিয়ে ও উৎসব", teacher: "taslima", level: "foundation", fee: 1500, seats: 5, enrolled: 5, image: "/media/mehndi-bride.webp", ...opened("BTY-101", RUNNING),
    outcome: "বিয়ের পূর্ণ হাতের মেহেদি করতে, ত্বক নিরাপদ রাখতে আর সেবার দাম ঠিক করতে পারবেন।",
    lessons: [L(1, "কোন ধরা ও রেখা", "video", "এক পাতা রেখার অনুশীলন"), L(2, "ফুল, পাতা, জাল", "live"), L(3, "আরবি আর রাজস্থানি ঢং", "live", "দুই ঢঙের এক হাত"), L(4, "পূর্ণ হাত — ব্রাইডাল", "hands-on", "একটা পূর্ণ হাত"), L(5, "ত্বকের নিরাপত্তা ও সেবার দাম", "live")],
    materials: [M("pdf", "৫০টি নকশা", "৪.২ এমবি"), M("doc", "প্যাচ টেস্ট ও নিরাপত্তা", "৭০ কেবি")],
    final: "একজন কনের পূর্ণ মেহেদি — ছবি, সময় আর দাম।", nextLive: "2026-09-29T13:00:00Z",
  },
  {
    id: "BTY-102", dept: "beauty", title: "বিয়ের সাজ — মেকআপের হাতেখড়ি", teacher: "taslima", level: "intermediate", fee: 2500, seats: 5, enrolled: 4, image: "/media/mehndi-dark.webp", ...opened("BTY-102", NEXT),
    outcome: "ত্বকের ধরন বুঝে নিরাপদ পণ্যে কনে আর অতিথির সাজ করতে পারবেন।",
    lessons: [L(1, "ত্বকের ধরন আর পরিষ্কার", "video", "তিনজনের ত্বকের ধরন লিখুন"), L(2, "নিরাপদ পণ্য — কী কিনবেন, কী না", "live"), L(3, "বেস আর চোখের সাজ", "hands-on", "এক জনের সাজের ছবি"), L(4, "কনের সাজ — পুরো ধাপ", "hands-on"), L(5, "সময়, দাম আর বুকিং", "live", "নিজের দামের তালিকা")],
    materials: [M("pdf", "নিরাপদ পণ্যের তালিকা", "৫০০ কেবি")],
    final: "একজন কনে বা অতিথির পূর্ণ সাজ — আগে-পরের ছবি, পণ্যের তালিকা আর দাম।", nextLive: "2026-10-17T13:00:00Z",
  },
  {
    id: "BTY-201", dept: "beauty", title: "ঘরে গিয়ে সেবা — দাম, বুকিং আর নিরাপত্তা", teacher: "taslima", level: "intermediate", fee: 1500, seats: 5, enrolled: 3, image: "/media/mehndi-listing.webp", ...opened("BTY-201", NEXT),
    outcome: "বাসায় গিয়ে মেহেদি আর সাজের সেবা নিরাপদে চালাতে, দাম আর বুকিং সামলাতে পারবেন।",
    lessons: [L(1, "সেবার তালিকা আর দাম", "live", "নিজের সেবার তালিকা"), L(2, "বুকিং, অগ্রিম আর বাতিল", "live"), L(3, "নিজের নিরাপত্তা — কার বাসায় যাবেন", "video", "নিরাপত্তার চেকলিস্ট"), L(4, "সরঞ্জামের ব্যাগ আর পরিচ্ছন্নতা", "hands-on"), L(5, "রিভিউ আর বারবার আসা ক্রেতা", "live", "পাঁচ ক্রেতার মতামত")],
    materials: [M("doc", "বুকিংয়ের ফর্ম", "৪০ কেবি"), M("pdf", "নিরাপত্তার নিয়ম", "১২০ কেবি")],
    final: "এক মাস ঘরে গিয়ে সেবা — বুকিংয়ের খাতা, দাম, নিরাপত্তা আর ক্রেতার মতামত।", nextLive: "2026-10-18T13:00:00Z",
  },

  /* ── সাব্বির ক্রিকেট একাডেমি · ক্রিকেট ও ফিটনেস ── */
  {
    id: "SPT-101", dept: "sports", title: "ক্রিকেট কোচিং — সব বয়সে", teacher: "sabbir", level: "foundation", fee: 2000, seats: 5, enrolled: 5, image: "/media/team-cricket.webp", ...opened("SPT-101", RUNNING),
    outcome: "নিজের এলাকায় শিশু থেকে বড়দের ক্রিকেট শেখাতে আর দল গড়তে পারবেন।",
    lessons: [L(1, "ওয়ার্ম-আপ ও চোট এড়ানো", "video"), L(2, "ব্যাট ধরা ও দাঁড়ানো", "hands-on", "শ্যাডো ব্যাটিংয়ের ভিডিও"), L(3, "বোলিং অ্যাকশন আর ফিল্ডিং", "hands-on"), L(4, "ম্যাচের কৌশল", "live"), L(5, "শিশুদের শেখানো আর এলাকার টুর্নামেন্ট", "hands-on", "অনুশীলনসূচি")],
    materials: [M("video", "অনুশীলনের ড্রিল", "১২টি"), M("pdf", "বয়সভিত্তিক অনুশীলনসূচি", "৬৬০ কেবি")],
    final: "এক মাস একটি দলকে কোচিং — অনুশীলনসূচি, ভিডিও আর ম্যাচের ফল।", nextLive: "2026-09-26T11:00:00Z",
  },
  {
    id: "SPT-102", dept: "sports", title: "ফিটনেস ও চোট এড়ানো", teacher: "sabbir", level: "foundation", fee: 1500, seats: 5, enrolled: 4, image: "/bangladesh/coxsbazar.jpg", ...opened("SPT-102", NEXT),
    outcome: "নিজের আর দলের জন্য ফিটনেস রুটিন বানাতে আর সাধারণ চোট এড়াতে পারবেন।",
    lessons: [L(1, "শরীর গরম আর ঠান্ডা করা", "video", "দুই সপ্তাহের রুটিন"), L(2, "দৌড়, গতি আর দম", "hands-on"), L(3, "শক্তি — যন্ত্র ছাড়া", "hands-on", "নিজের অনুশীলনের ভিডিও"), L(4, "খাবার, পানি আর ঘুম", "live"), L(5, "চোট হলে প্রথম কাজ", "live", "প্রাথমিক চিকিৎসার তালিকা")],
    materials: [M("pdf", "ফিটনেস রুটিনের ছক", "৪২০ কেবি")],
    final: "একটি দলের চার সপ্তাহের ফিটনেস রুটিন আর আগে-পরের মাপ।", nextLive: "2026-10-17T11:00:00Z",
  },
  {
    id: "SPT-201", dept: "sports", title: "ফাস্ট বোলিং — গতি আর নিয়ন্ত্রণ", teacher: "sabbir", level: "advanced", fee: 2500, seats: 5, enrolled: 3, image: "/media/covers/spt-201.webp", ...opened("SPT-201", NEXT),
    outcome: "নিরাপদ রান-আপ আর অ্যাকশনে গতি বাড়িয়ে লাইন-লেংথে বল করতে পারবেন।",
    lessons: [L(1, "রান-আপ আর ছন্দ", "video", "নিজের রান-আপের ভিডিও"), L(2, "অ্যাকশন — পিঠ বাঁচিয়ে", "hands-on"), L(3, "লাইন আর লেংথ", "hands-on", "দশ বলের লক্ষ্যভেদ"), L(4, "সুইং আর বাউন্সার", "hands-on"), L(5, "ম্যাচে বোলিংয়ের পরিকল্পনা", "live", "একটা ম্যাচের বোলিং পরিকল্পনা")],
    materials: [M("video", "অ্যাকশনের ধীরগতির ভিডিও", "৬টি")],
    final: "একটি ম্যাচে বোলিং — ভিডিও, গতির মাপ আর পরিকল্পনা কতটা মিলল।", nextLive: "2026-10-18T11:00:00Z",
  },

  /* ── নুসরাত গণিত পাঠশালা · গণিত ── */
  {
    id: "MTH-101", dept: "math", title: "রিকশার গতি দিয়ে ক্যালকুলাস", teacher: "nusrat", level: "intermediate", fee: 1000, seats: 5, enrolled: 5, image: "/media/calculus.webp", ...opened("MTH-101", RUNNING),
    outcome: "গতি, ঢাল আর পরিবর্তনের হার দিয়ে ক্যালকুলাস বুঝে নিজে অন্যকে বোঝাতে পারবেন।",
    lessons: [L(1, "গড় বেগ — রিকশার যাত্রা", "live", "নিজের যাত্রার সময়-দূরত্ব"), L(2, "তাৎক্ষণিক বেগ ও ঢাল", "live"), L(3, "অন্তরীকরণ", "video", "দশটি অঙ্ক"), L(4, "সর্বোচ্চ-সর্বনিম্ন আর যোগজীকরণ", "live", "পুকুরের ক্ষেত্রফল"), L(5, "নিজে শেখানো", "live")],
    materials: [M("pdf", "অনুশীলনী ও সমাধান", "১.৪ এমবি"), M("sheet", "গতির ডেটা (এক্সেল)", "২৮ কেবি")],
    final: "চারপাশের একটা সমস্যা ক্যালকুলাস দিয়ে সমাধান করে দশ মিনিটে শেখানো।", nextLive: "2026-09-25T15:00:00Z",
  },
  {
    id: "MTH-102", dept: "math", title: "বাজারের হিসাবে পাটিগণিত ও বীজগণিত", teacher: "nusrat", level: "foundation", fee: 0, seats: 5, enrolled: 5, image: "/bangladesh/rural/rural-kitchen.jpg", ...opened("MTH-102", NEXT),
    outcome: "শতকরা, অনুপাত আর সমীকরণ দিয়ে বাজার, লোন আর ফসলের হিসাব নিজে করতে পারবেন।",
    lessons: [L(1, "শতকরা — ছাড় আর লাভ", "live", "তিনটি দোকানের ছাড় মিলিয়ে দেখুন"), L(2, "অনুপাত — রান্নার মাপ থেকে মিশ্রণ", "live"), L(3, "সরল সুদ আর কিস্তি", "video", "একটা লোনের কিস্তি"), L(4, "সমীকরণ — অজানাকে খোঁজা", "live"), L(5, "নিজের পরিবারের মাসের হিসাব", "live", "মাসের বাজেট")],
    materials: [M("pdf", "অনুশীলনের পাতা", "৮০০ কেবি")],
    final: "নিজের পরিবার বা দোকানের এক মাসের হিসাব — শতকরা, অনুপাত আর সমীকরণ দিয়ে।", nextLive: "2026-10-17T15:00:00Z",
  },
  {
    id: "MTH-201", dept: "math", title: "পরিসংখ্যান — বৃষ্টি আর ফসলের ডেটা", teacher: "nusrat", level: "intermediate", fee: 1500, seats: 5, enrolled: 3, image: "/bangladesh/monsoon.jpg", ...opened("MTH-201", NEXT),
    outcome: "গড়, বিস্তার আর সম্পর্ক দিয়ে বৃষ্টি ও ফসলের ডেটা পড়ে সিদ্ধান্ত নিতে পারবেন।",
    lessons: [L(1, "ডেটা জোগাড় আর সাজানো", "live", "দশ দিনের বৃষ্টির মাপ"), L(2, "গড়, মধ্যমা আর প্রচুরক", "live"), L(3, "বিস্তার — কতটা ছড়িয়ে", "video", "দুই গ্রামের তুলনা"), L(4, "সম্পর্ক — বৃষ্টি বাড়লে ফসল?", "live"), L(5, "গ্রাফে গল্প বলা", "live", "এক পাতার রিপোর্ট")],
    materials: [M("sheet", "বৃষ্টি ও ফসলের নমুনা ডেটা", "৭০ কেবি")],
    final: "নিজের এলাকার একটা ডেটা থেকে এক পাতার রিপোর্ট আর দশ মিনিটে শেখানো।", nextLive: "2026-10-18T15:00:00Z",
  },
];

export const workshops: Workshop[] = [
  { id: "ws-carb", dept: "motor", title: "এক দিনে কার্বুরেটর পরিষ্কার — গ্যারেজে হাতে-কলমে", host: "rafi", at: "2026-10-03T04:00:00Z", place: "টঙ্গী, গাজীপুর", seats: 12, taken: 9, fee: 800, image: "/media/carburetor.webp" },
  { id: "ws-kacchi", dept: "kitchen", title: "৫০ জনের কাচ্চি — বড় ডেকচির মাপ", host: "rahima", at: "2026-10-04T05:00:00Z", place: "মিরপুর ১০, ঢাকা", seats: 10, taken: 10, fee: 1200, image: "/media/kacchi.webp" },
  { id: "ws-sensor", dept: "mechatronics", title: "মাটির আর্দ্রতা সেন্সরে সেচ — এক দিনের কর্মশালা", host: "mahir", at: "2026-10-10T04:00:00Z", place: "নকলা, শেরপুর", seats: 20, taken: 8, fee: 0, image: "/media/circuit.webp" },
  { id: "ws-jamdani", dept: "textile", title: "জামদানি তাঁতে একটা দিন", host: "hasina", at: "2026-10-11T04:00:00Z", place: "রূপগঞ্জ, নারায়ণগঞ্জ", seats: 8, taken: 3, fee: 1000, image: "/media/fashion-jamdani.webp" },
];

const panelOf = (...names: string[]) => names;

export const teacherRecords: TeacherRecord[] = [
  { handle: "rafi", dept: "motor", title: "মোটরসাইকেল ও ইঞ্জিন মেকানিক · ১৮ বছর", interview: { at: "2026-01-28", score: 94, panel: panelOf("বহিরাগত পরীক্ষক · মেকানিক্যাল প্রকৌশলী", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.9, count: 212 }, graduates: 86, complaints: { upheld: 0, open: 0 }, stories: [{ name: "শরিফুল ইসলাম", text: "চা-দোকানের পাশে এখন আমার নিজের সার্ভিসিং পয়েন্ট, দিনে ছয়-সাতটা বাইক।" }, { name: "সোহাগ মিয়া", text: "রিকশা গ্যারেজে কাজ করতাম, এখন ইজিবাইকের ব্যাটারি ঠিক করি — আয় দ্বিগুণ।" }, { name: "মিজানুর রহমান", text: "ডিপ্লোমার পরেও হাতে কাজ জানতাম না; গ্যারেজের আট সপ্তাহে শিখেছি।" }] },
  { handle: "rahima", dept: "kitchen", title: "ঘরোয়া রাঁধুনি থেকে ক্যাটারার", interview: { at: "2026-03-02", score: 90, panel: panelOf("বহিরাগত পরীক্ষক · হোটেলের হেড শেফ", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.9, count: 168 }, graduates: 54, complaints: { upheld: 0, open: 1 }, stories: [{ name: "লাবণ্য দাস", text: "প্রথম বিয়েবাড়ির অর্ডার নিলাম ১২০ জনের — মাপ ভুল হয়নি একটুও।" }, { name: "রুনা আক্তার", text: "অফিসে টিফিন দিই চল্লিশ জনকে, খাতায় প্রতিদিনের লাভ লিখি।" }] },
  { handle: "anik", dept: "web-ai", title: "ফুল-স্ট্যাক ডেভেলপার · বুয়েট সিএসই", interview: { at: "2026-02-20", score: 88, panel: panelOf("বহিরাগত পরীক্ষক · সফটওয়্যার স্থপতি", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.8, count: 143 }, graduates: 61, complaints: { upheld: 0, open: 0 }, stories: [{ name: "ইমন সরকার", text: "এলাকার কোচিং সেন্টারের ভর্তির অ্যাপ বানিয়ে প্রথম ফ্রিল্যান্স কাজ পেলাম।" }, { name: "তানজিলা ইসলাম", text: "কোডিং কখনো করিনি, আট সপ্তাহে মায়ের বুটিকের দোকান অনলাইনে।" }] },
  { handle: "mahir", dept: "mechatronics", title: "আইওটি হার্ডওয়্যার · কাণ্ডারী-ল্যাব", interview: { at: "2026-03-30", score: 86, panel: panelOf("বহিরাগত পরীক্ষক · প্রকৌশল অধ্যাপক", "বহিরাগত পরীক্ষক · শিল্প প্রতিনিধি") }, rating: { avg: 4.7, count: 74 }, graduates: 32, complaints: { upheld: 0, open: 0 }, stories: [{ name: "রাকিব হোসেন", text: "বাবার জমির সেচের পাম্প এখন মাটি শুকালে নিজেই চালু হয়।" }] },
  { handle: "mitu", dept: "music", title: "গায়িকা ও সুরকার · লোকগীতি ফিউশন", interview: { at: "2026-03-14", score: 89, panel: panelOf("বহিরাগত পরীক্ষক · সংগীতশিল্পী", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.8, count: 96 }, graduates: 40, complaints: { upheld: 0, open: 0 }, stories: [{ name: "মারুফ হাসান", text: "নিজের সুরে প্রথম গান রেকর্ড করেছি, জেলা শিল্পকলায় গাইলাম।" }] },
  { handle: "joy", dept: "fine-art", title: "চিত্রশিল্পী · জলরং ও ক্যালিগ্রাফি", interview: { at: "2026-05-04", score: 85, panel: panelOf("বহিরাগত পরীক্ষক · চারুশিল্পী", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.7, count: 58 }, graduates: 22, complaints: { upheld: 0, open: 0 }, stories: [{ name: "নুসরাত আরা", text: "প্রথম তিনটা ছবি বাজারে বিক্রি হলো, দাম নিজে ঠিক করেছি।" }] },
  { handle: "shapla", dept: "textile", title: "নকশিকাঁথা শিল্পী ও দর্জি", interview: { at: "2026-02-26", score: 87, panel: panelOf("বহিরাগত পরীক্ষক · কারুশিল্প গবেষক", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.9, count: 81 }, graduates: 37, complaints: { upheld: 0, open: 0 }, stories: [{ name: "আমেনা খাতুন", text: "ঘরে বসে কাঁথা সেলাই করে মাসে আট হাজার টাকা আসে।" }] },
  { handle: "hasina", dept: "textile", title: "জামদানি তাঁতি · রূপগঞ্জ", interview: { at: "2026-03-01", score: 84, panel: panelOf("বহিরাগত পরীক্ষক · কারুশিল্প গবেষক", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.8, count: 29 }, graduates: 11, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "nabila", dept: "media", title: "ট্রেকিং গাইড ও ভিডিও কনটেন্ট", interview: { at: "2026-04-10", score: 82, panel: panelOf("বহিরাগত পরীক্ষক · চলচ্চিত্র নির্মাতা", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.6, count: 120 }, graduates: 48, complaints: { upheld: 1, open: 0 }, stories: [{ name: "জান্নাতুল ফেরদৌস", text: "থানচির পাহাড়ি রান্নার চ্যানেল খুলেছি, প্রথম স্পনসর পেলাম।" }] },
  { handle: "sumaiya", dept: "media", title: "প্রোডাক্ট ফটোগ্রাফার ও মডেল", interview: { at: "2026-04-18", score: 83, panel: panelOf("বহিরাগত পরীক্ষক · পেশাদার ফটোগ্রাফার", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.7, count: 47 }, graduates: 19, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "rupa", dept: "media", title: "গ্রাফিক ডিজাইনার ও ডিজিটাল মার্কেটার", interview: { at: "2026-04-15", score: 80, panel: panelOf("বহিরাগত পরীক্ষক · ব্র্যান্ড পরামর্শক", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.6, count: 88 }, graduates: 35, complaints: { upheld: 0, open: 0 }, stories: [{ name: "তাহমিনা আক্তার", text: "কুমিল্লার তিনটা দোকানের পেজ এখন আমি চালাই।" }] },
  { handle: "sajid", dept: "business", title: "হিসাব ও আয়কর · সিএ শিক্ষার্থী", interview: { at: "2026-05-25", score: 81, panel: panelOf("বহিরাগত পরীক্ষক · চার্টার্ড অ্যাকাউন্ট্যান্ট", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.5, count: 64 }, graduates: 27, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "kamal", dept: "business", title: "মুদি দোকান ও হোম ডেলিভারি", interview: { at: "2026-05-28", score: 72, panel: panelOf("বহিরাগত পরীক্ষক · ব্যবসায়ী সমিতি", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.4, count: 39 }, graduates: 18, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "babul", dept: "kitchen", title: "ফুচকার গাড়ি · ধানমন্ডি লেক", interview: { at: "2026-03-18", score: 76, panel: panelOf("বহিরাগত পরীক্ষক · হোটেলের হেড শেফ", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.6, count: 33 }, graduates: 14, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "taslima", dept: "beauty", title: "মেহেদি শিল্পী · বিয়ে ও উৎসব", interview: { at: "2026-06-08", score: 84, panel: panelOf("বহিরাগত পরীক্ষক · রূপবিশেষজ্ঞ", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.8, count: 52 }, graduates: 21, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "sabbir", dept: "sports", title: "ক্রিকেট কোচ · সাবেক বিভাগীয় খেলোয়াড়", interview: { at: "2026-04-28", score: 85, panel: panelOf("বহিরাগত পরীক্ষক · জেলা ক্রিকেট কোচ", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.7, count: 70 }, graduates: 30, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "nusrat", dept: "math", title: "গণিত শিক্ষক · চারপাশ দিয়ে শেখান", interview: { at: "2026-02-15", score: 92, panel: panelOf("বহিরাগত পরীক্ষক · প্রকৌশল অধ্যাপক", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.9, count: 190 }, graduates: 73, complaints: { upheld: 0, open: 0 }, stories: [{ name: "রিয়াদ হাসান", text: "ক্যালকুলাস ভয় পেতাম, এখন ছোট ভাইবোনদের পড়াই।" }] },
  { handle: "tanvir", dept: "architecture", title: "স্থপতি · বন্যা-সহনশীল গ্রামীণ বাড়ি", interview: { at: "2026-04-25", score: 88, panel: panelOf("বহিরাগত পরীক্ষক · স্থপতি", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.8, count: 41 }, graduates: 16, complaints: { upheld: 0, open: 0 }, stories: [] },
  { handle: "tamim", dept: "web-ai", title: "ব্যাকএন্ড ডেভেলপার · ডেটাবেস ও পেমেন্ট", interview: { at: "2026-02-22", score: 84, panel: panelOf("বহিরাগত পরীক্ষক · সফটওয়্যার স্থপতি", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.7, count: 58 }, graduates: 21, complaints: { upheld: 0, open: 0 }, stories: [{ name: "রাশেদ কবির", text: "পাড়ার ফার্মেসির অর্ডার আর বাকির হিসাব এখন আমার বানানো অ্যাপে চলে।" }] },
  { handle: "sadman", dept: "guitar", title: "গিটারিস্ট · রক ও ফিউশন ব্যান্ড", interview: { at: "2026-08-24", score: 87, panel: panelOf("বহিরাগত পরীক্ষক · সংগীত প্রযোজক", "কাণ্ডারী প্যানেল") }, rating: { avg: 4.9, count: 26 }, graduates: 6, complaints: { upheld: 0, open: 0 }, stories: [{ name: "তৌহিদ আলম", text: "চল্লিশ দিনে প্রথম গানটা পুরো বাজালাম — এখন কলেজের ব্যান্ডে রিদম গিটার।" }] },
];

/** A final-assessment seat on the public board — upcoming interviews and passes only; retakes stay private. */
export interface BoardSeat {
  id: string;
  learner: string;
  district: string;
  course: string;
  at: string;
  panel: string[];
  project: string;
  /** Examiners' marks, once given. */
  marks?: number[];
  /** The outside examiner's mark, sealed until the teacher on the panel marks too. */
  sealed?: number;
  /** How the learner did in the course, for the panel's file. */
  record?: { attendance: number; homework: number };
  certificate?: string;
}

export const board: BoardSeat[] = [
  { id: "b-sohag", learner: "সোহাগ মিয়া", district: "গাজীপুর", course: "RKS-101", at: "2026-09-27T04:00:00Z", panel: ["রফিকুল ইসলাম", "বহিরাগত পরীক্ষক · মেকানিক্যাল প্রকৌশলী"], project: "ব্যাটারির আগুনের ঝুঁকি কমানো একটা ইজিবাইক চার্জিং ঘর" },
  { id: "b-maruf", learner: "মারুফ হাসান", district: "সিলেট", course: "MUS-101", at: "2026-09-28T04:00:00Z", panel: ["মিতু সরকার", "বহিরাগত পরীক্ষক · সংগীতশিল্পী"], project: "হাসন রাজার গানের নতুন সুর, ফোনে রেকর্ড করা" },
  { id: "b-jannat", learner: "জান্নাতুল ফেরদৌস", district: "বান্দরবান", course: "MED-101", at: "2026-09-29T09:00:00Z", panel: ["নাবিলা চৌধুরী", "বহিরাগত পরীক্ষক · চলচ্চিত্র নির্মাতা"], project: "পাহাড়ি রান্নার চ্যানেল — চারটি ভিডিও" },
  { id: "b-nayon", learner: "নয়ন সরকার", district: "শেরপুর", course: "MEC-101", at: "2026-10-10T04:00:00Z", panel: ["মাহির শারিয়ার মাহিন", "বহিরাগত পরীক্ষক · প্রকৌশল অধ্যাপক"], project: "পোলট্রি খামারের তাপমাত্রা দেখে নিজে চলা ফ্যান, খরচ ২,৪০০ টাকা", sealed: 78, record: { attendance: 88, homework: 100 } },
  { id: "b-sumi", learner: "সুমি আক্তার", district: "ঢাকা", course: "AI-201", at: "2026-10-12T09:00:00Z", panel: ["মাহির শারিয়ার মাহিন", "বহিরাগত পরীক্ষক · সফটওয়্যার স্থপতি"], project: "ইউনিয়ন পরিষদের সেবা নিয়ে প্রশ্নের উত্তর দেওয়া বাংলা চ্যাটবট", sealed: 48, record: { attendance: 83, homework: 80 } },
  { id: "b-emon", learner: "ইমন সরকার", district: "ঢাকা", course: "WEB-101", at: "2026-09-30T04:00:00Z", panel: ["অনিক হাসান", "বহিরাগত পরীক্ষক · সফটওয়্যার স্থপতি"], project: "কোচিং সেন্টারের ভর্তি ও বেতনের অ্যাপ" },
  { id: "b-shariful", learner: "শরিফুল ইসলাম", district: "গাজীপুর", course: "MTR-101", at: "2026-09-20T04:00:00Z", panel: ["রফিকুল ইসলাম", "বহিরাগত পরীক্ষক · মেকানিক্যাল প্রকৌশলী"], project: "একটা ১০০ সিসি বাইকের পূর্ণ সার্ভিসিং, ঘড়ি ধরে", marks: [78, 84], certificate: "KTA-2026-MTR101-0007" },
  { id: "b-labonno", learner: "লাবণ্য দাস", district: "ঢাকা", course: "CHF-101", at: "2026-09-17T05:00:00Z", panel: ["রহিমা বেগম", "বহিরাগত পরীক্ষক · হোটেলের হেড শেফ"], project: "১২০ জনের বিয়েবাড়ির মেন্যু, জনপ্রতি খরচসহ", marks: [88, 91], certificate: "KTA-2026-CHF101-0003" },
  { id: "b-rakib", learner: "রাকিব হোসেন", district: "শেরপুর", course: "MEC-101", at: "2026-09-22T04:00:00Z", panel: ["মাহির শারিয়ার মাহিন", "বহিরাগত পরীক্ষক · প্রকৌশল অধ্যাপক", "তৃতীয় পরীক্ষক · শিল্প প্রতিনিধি"], project: "মাটি শুকালে নিজে চালু হওয়া সেচের পাম্প", marks: [52, 81, 76], certificate: "KTA-2026-MEC101-0002" },
  { id: "b-tanjila", learner: "তানজিলা ইসলাম", district: "ময়মনসিংহ", course: "WEB-101", at: "2026-09-15T04:00:00Z", panel: ["অনিক হাসান", "বহিরাগত পরীক্ষক · সফটওয়্যার স্থপতি"], project: "মায়ের বুটিকের অনলাইন দোকান", marks: [74, 70], certificate: "KTA-2026-WEB101-0011" },
];

/** Four practical questions per school for the admission test; it places, never rejects. */
export const admissionQuestions: Record<School, Question[]> = {
  engineering: [
    { q: "এলইডি সরাসরি ব্যাটারিতে লাগালে পুড়ে যায়। সাথে কী লাগাতে হয়?", options: ["ক্যাপাসিটর", "রেজিস্টর", "সুইচ", "আরেকটি এলইডি"], answer: 1 },
    { q: "ওয়েবপাতার লেখা ও কাঠামো কোন ভাষায় লেখা হয়?", options: ["এক্সেল", "পিডিএফ", "এইচটিএমএল", "ফটোশপ"], answer: 2 },
    { q: "রোবট দূরত্ব মাপে কোনটি দিয়ে?", options: ["আল্ট্রাসনিক সেন্সর", "মোটর", "ব্যাটারি", "স্পিকার"], answer: 0 },
    { q: "১ কিলোবাইট প্রায় কত বাইট?", options: ["১০", "১০০", "১,০০০", "১,০০,০০০"], answer: 2 },
  ],
  trades: [
    { q: "নাট ঢিলা করতে রেঞ্চ কোন দিকে ঘোরাতে হয়?", options: ["ঘড়ির কাঁটার দিকে", "ঘড়ির কাঁটার উল্টো দিকে", "যেকোনো দিকে", "উপরে টেনে"], answer: 1 },
    { q: "বৈদ্যুতিক কাজের আগে প্রথম কাজ কী?", options: ["তার কাটা", "বাল্ব খোলা", "মেইন সুইচ বন্ধ করা", "পানি দেওয়া"], answer: 2 },
    { q: "ইঞ্জিন অয়েল কখন বদলাতে হয়?", options: ["নির্দিষ্ট কিলোমিটার চলার পর", "প্রতিদিন", "কখনো না", "শুধু শব্দ হলে"], answer: 0 },
    { q: "চাকার হাওয়া কম থাকলে কী হয়?", options: ["গতি বাড়ে", "ব্রেক ভালো হয়", "কিছুই হয় না", "তেল বেশি খরচ হয়"], answer: 3 },
  ],
  food: [
    { q: "কাঁচা মাংস কাটার বোর্ডে সবজি কাটা ঠিক নয় কেন?", options: ["বোর্ড ভাঙে", "জীবাণু ছড়ায়", "স্বাদ কমে", "ছুরি ভোঁতা হয়"], answer: 1 },
    { q: "রান্না করা খাবার ফ্রিজে রাখার আগে কী করবেন?", options: ["গরম অবস্থায় ঢেকে রাখা", "পানি মেশানো", "ঘরের তাপমাত্রায় এনে ঢেকে রাখা", "খোলা রাখা"], answer: 2 },
    { q: "১ কেজি = কত গ্রাম?", options: ["১০০০", "৫০০", "১০০", "১০"], answer: 0 },
    { q: "১০ জনের জন্য ১ কেজি চাল লাগলে ৫০ জনের জন্য কত?", options: ["২ কেজি", "৫ কেজি", "১০ কেজি", "৫০ কেজি"], answer: 1 },
  ],
  arts: [
    { q: "লাল আর হলুদ মেশালে কোন রং হয়?", options: ["সবুজ", "বেগুনি", "কমলা", "নীল"], answer: 2 },
    { q: "গানের ‘তাল’ বলতে কী বোঝায়?", options: ["গানের কথা", "ছন্দের নিয়মিত মাপ", "বাদ্যযন্ত্রের নাম", "গলার জোর"], answer: 1 },
    { q: "নকশিকাঁথা মূলত কী দিয়ে বানানো হয়?", options: ["পুরোনো কাপড় ও সুতা", "কাগজ", "প্লাস্টিক", "কাঠ"], answer: 0 },
    { q: "সা রে গা মা — এর পরের স্বর কোনটি?", options: ["ধা", "নি", "সা", "পা"], answer: 3 },
  ],
  media: [
    { q: "ভিডিওতে কথা পরিষ্কার শোনাতে সবচেয়ে জরুরি কী?", options: ["দামি ক্যামেরা", "বেশি আলো", "মাইক বা কাছ থেকে রেকর্ড", "লম্বা ভিডিও"], answer: 2 },
    { q: "অন্যের গান বিনা অনুমতিতে নিজের ভিডিওতে দিলে কী হতে পারে?", options: ["কপিরাইট স্ট্রাইক", "বেশি ভিউ", "ভেরিফায়েড ব্যাজ", "কিছুই না"], answer: 0 },
    { q: "থাম্বনেইল কী?", options: ["ক্যামেরার লেন্স", "ভিডিওর প্রচ্ছদ ছবি", "ভিডিওর শব্দ", "এক ধরনের মাইক"], answer: 1 },
    { q: "ছবি তোলায় ‘রুল অব থার্ডস’ কী কাজে লাগে?", options: ["ব্যাটারি বাঁচাতে", "ছবি ছোট করতে", "রং বদলাতে", "কম্পোজিশন সাজাতে"], answer: 3 },
  ],
  business: [
    { q: "৫০০ টাকায় কিনে ৬০০ টাকায় বেচলে লাভ শতকরা কত?", options: ["১০%", "২০%", "২৫%", "৫০%"], answer: 1 },
    { q: "এক্সেলে কয়েকটি ঘরের যোগফল বের করার ফাংশন কোনটি?", options: ["SORT", "FIND", "SUM", "LEN"], answer: 2 },
    { q: "দোকানের প্রতিদিনের আয়-ব্যয়ের খাতাকে কী বলে?", options: ["ক্যাশবুক", "রুটিন", "মেন্যু", "দলিল"], answer: 0 },
    { q: "বাকিতে বিক্রি বেশি হলে দোকানের কোন সমস্যা হয়?", options: ["ক্রেতা কমে", "নগদ টাকার টান পড়ে", "মজুত বাড়ে", "কর কমে"], answer: 1 },
  ],
  life: [
    { q: "খেলার আগে ওয়ার্ম-আপ কেন করবেন?", options: ["ক্লান্ত হতে", "চোট এড়াতে", "সময় কাটাতে", "ক্ষুধা বাড়াতে"], answer: 1 },
    { q: "নতুন প্রসাধনী লাগানোর আগে কী করবেন?", options: ["সারা মুখে লাগানো", "গরম করা", "ছোট জায়গায় প্যাচ টেস্ট", "পানিতে মেশানো"], answer: 2 },
    { q: "মেহেদির রং গাঢ় করতে লাগানোর পর কী করবেন?", options: ["কয়েক ঘণ্টা রেখে দেওয়া", "সাথে সাথে ধোয়া", "সাবান ঘষা", "গরম পানিতে ভেজানো"], answer: 0 },
    { q: "প্রাপ্তবয়স্কের দিনে মোটামুটি কত গ্লাস পানি পান করা ভালো?", options: ["১–২", "২০–২৫", "দরকার নেই", "৮–১০"], answer: 3 },
  ],
  science: [
    { q: "একটি রিকশা ২ ঘণ্টায় ২০ কিমি গেলে গড় বেগ কত?", options: ["৫ কিমি/ঘণ্টা", "১০ কিমি/ঘণ্টা", "২০ কিমি/ঘণ্টা", "৪০ কিমি/ঘণ্টা"], answer: 1 },
    { q: "পানি কত ডিগ্রি সেলসিয়াসে জমে বরফ হয়?", options: ["১০°", "৫০°", "০°", "১০০°"], answer: 2 },
    { q: "৩ × ৭ + ৪ = ?", options: ["২৫", "৩৩", "১৯", "২১"], answer: 0 },
    { q: "উদ্ভিদ খাদ্য তৈরিতে কোন গ্যাস নেয়?", options: ["অক্সিজেন", "নাইট্রোজেন", "হিলিয়াম", "কার্বন ডাই-অক্সাইড"], answer: 3 },
  ],
};

const deptById = new Map(departments.map((d) => [d.id, d]));
const courseById = new Map(courses.map((c) => [c.id, c]));
const recordByHandle = new Map(teacherRecords.map((t) => [t.handle, t]));

/* A course's class list, the same every time: names drawn from two short lists. */
const FIRST = ["রাকিব", "সুমি", "তানভীর", "মিম", "শাকিল", "নাদিয়া", "আরিফ", "জুই", "সোহেল", "রুমানা", "ইমরান", "তাসনিম", "রাসেল", "লিজা", "ফাহিম", "সাথী", "নয়ন", "মৌ", "রিপন", "শারমিন"];
const LAST = ["হোসেন", "আক্তার", "ইসলাম", "খাতুন", "রহমান", "বেগম", "মিয়া", "সরকার", "দাস", "উদ্দিন"];

export interface Student {
  id: string;
  name: string;
}

/** Everyone enrolled in a sample course. */
export function rosterOf(course: Pick<Course, "id" | "enrolled">): Student[] {
  const k = courses.findIndex((c) => c.id === course.id) + 1;
  return Array.from({ length: course.enrolled }, (_, i) => ({
    id: `${course.id}:${i + 1}`,
    name: `${FIRST[(i + k * 3) % FIRST.length]} ${LAST[(Math.floor(i / FIRST.length) + i * 3 + k) % LAST.length]}`,
  }));
}

export const getDepartment = (id: string) => deptById.get(id);
export const getCourse = (id: string) => courseById.get(id);
export const teacherRecord = (handle: string) => recordByHandle.get(handle);
export const coursesOf = (dept: string) => courses.filter((c) => c.dept === dept);
export const coursesBy = (handle: string) => courses.filter((c) => c.teacher === handle);
export const workshopsOf = (dept: string) => workshops.filter((w) => w.dept === dept);

/* ── Class videos ──────────────────────────────────────────────────── */

/** A class video, titled after its week's lesson; `length` is "mm:ss". */
function clip(course: string, week: number, access: VideoAccess, at: string, length: string, views: number): ClassVideo {
  const c = courseById.get(course)!;
  const [m, s] = length.split(":").map(Number);
  return { id: `${course}-${access === "free" ? "f" : "p"}${week}`.toLowerCase(), course, teacher: c.teacher, title: c.lessons[week - 1].title, week, seconds: m * 60 + s, access, at, views };
}

/** A short: one idea from a lesson, under a minute, always free. */
function short(course: string, week: number, title: string, seconds: number, at: string, views: number): ClassVideo {
  return { id: `${course}-s${week}`.toLowerCase(), course, teacher: courseById.get(course)!.teacher, title, week, seconds, access: "free", short: true, at, views };
}

/**
 * The video shelf. Every teacher with a running course owes one free class
 * a week (Saturday to Friday). In the demo week (19–25 September) all have
 * put theirs up except মাহির and কামাল — it is Friday, the last day.
 */
export const classVideos: ClassVideo[] = [
  // This week's free classes.
  clip("WEB-101", 3, "free", "2026-09-24T14:00:00Z", "40:00", 18400),
  clip("ARC-101", 2, "free", "2026-09-22T10:00:00Z", "40:00", 6100),
  clip("MTR-101", 2, "free", "2026-09-23T05:30:00Z", "40:00", 52300),
  clip("CHF-101", 3, "free", "2026-09-25T04:00:00Z", "40:00", 9800),
  clip("CHF-102", 1, "free", "2026-09-20T12:00:00Z", "40:00", 31200),
  clip("MUS-101", 2, "free", "2026-09-21T13:00:00Z", "40:00", 12700),
  clip("ART-101", 2, "free", "2026-09-24T09:00:00Z", "40:00", 4300),
  clip("TEX-101", 1, "free", "2026-09-19T08:00:00Z", "40:00", 15600),
  clip("MED-101", 2, "free", "2026-09-23T15:00:00Z", "40:00", 27800),
  clip("MED-102", 1, "free", "2026-09-22T07:00:00Z", "40:00", 8900),
  clip("GFX-101", 1, "free", "2026-09-20T14:30:00Z", "40:00", 21400),
  clip("BIZ-101", 1, "free", "2026-09-21T03:00:00Z", "40:00", 13300),
  clip("BTY-101", 1, "free", "2026-09-24T11:00:00Z", "40:00", 11900),
  clip("SPT-101", 1, "free", "2026-09-19T02:00:00Z", "40:00", 7400),
  clip("MTH-101", 3, "free", "2026-09-25T02:00:00Z", "40:00", 36500),
  clip("GTR-101", 1, "free", "2026-09-22T13:00:00Z", "40:00", 9400),
  clip("TEX-102", 1, "free", "2026-09-23T08:00:00Z", "40:00", 6800),
  // Earlier weeks' free classes.
  clip("RKS-101", 3, "free", "2026-09-15T06:00:00Z", "40:00", 64800),
  clip("MEC-101", 1, "free", "2026-09-14T12:00:00Z", "40:00", 22100),
  clip("AI-201", 1, "free", "2026-09-07T12:00:00Z", "40:00", 17600),
  clip("BIZ-102", 1, "free", "2026-09-12T04:00:00Z", "40:00", 5200),
  clip("WEB-101", 2, "free", "2026-09-16T14:00:00Z", "40:00", 24100),
  clip("CHF-101", 1, "free", "2026-09-08T04:00:00Z", "40:00", 19300),
  clip("MTH-101", 2, "free", "2026-09-17T02:00:00Z", "40:00", 33900),
  clip("MTH-101", 1, "free", "2026-09-10T02:00:00Z", "40:00", 41200),
  clip("WEB-101", 1, "free", "2026-09-09T14:00:00Z", "40:00", 29700),
  clip("CHF-101", 2, "free", "2026-09-15T04:00:00Z", "40:00", 22600),
  clip("RKS-101", 2, "free", "2026-09-08T06:00:00Z", "40:00", 48300),
  clip("RKS-101", 1, "free", "2026-09-01T06:00:00Z", "40:00", 57100),
  clip("MTR-101", 1, "free", "2026-09-16T05:30:00Z", "40:00", 61800),
  clip("MUS-101", 1, "free", "2026-09-14T13:00:00Z", "40:00", 15900),
  clip("MED-101", 1, "free", "2026-09-16T15:00:00Z", "40:00", 34100),
  clip("ARC-101", 1, "free", "2026-09-15T10:00:00Z", "40:00", 7300),
  clip("ART-101", 1, "free", "2026-09-17T09:00:00Z", "40:00", 5600),
  // Course videos, for those enrolled.
  clip("WEB-101", 4, "paid", "2026-09-24T15:00:00Z", "40:00", 2100),
  clip("AI-201", 3, "paid", "2026-09-22T13:00:00Z", "40:00", 980),
  clip("MEC-101", 3, "paid", "2026-09-21T12:00:00Z", "40:00", 1240),
  clip("MTR-201", 1, "paid", "2026-09-20T05:00:00Z", "40:00", 1870),
  clip("MUS-101", 3, "paid", "2026-09-18T13:00:00Z", "40:00", 640),
  clip("GFX-101", 2, "paid", "2026-09-23T14:00:00Z", "40:00", 1520),
  clip("MED-101", 3, "paid", "2026-09-15T15:00:00Z", "40:00", 2380),
  clip("BIZ-101", 2, "paid", "2026-09-24T03:00:00Z", "40:00", 870),
  clip("ARC-101", 3, "paid", "2026-09-18T10:00:00Z", "40:00", 460),
  clip("ART-101", 3, "paid", "2026-09-17T09:00:00Z", "40:00", 390),
  // Shorts.
  short("CHF-101", 3, "বিরিয়ানির চাল কখন দেবেন — পানির মাপ এক নজরে", 48, "2026-09-24T05:00:00Z", 128000),
  short("MTR-101", 3, "চেইন কতটা ঢিলা থাকবে? দুই আঙুলের নিয়ম", 35, "2026-09-23T06:00:00Z", 214000),
  short("MTH-101", 2, "ঢাল মানে কী — একটা রিকশার ছবিতে", 52, "2026-09-22T03:00:00Z", 89000),
  short("BTY-101", 1, "মেহেদির কোন ধরার সঠিক কোণ", 41, "2026-09-21T11:00:00Z", 176000),
  short("WEB-101", 2, "এক লাইনের সিএসএস, ফোনে পাতা ঠিক", 29, "2026-09-20T14:00:00Z", 66000),
  short("SPT-101", 2, "ব্যাট ধরার যে ভুলটা সবাই করে", 38, "2026-09-19T03:00:00Z", 97000),
  short("TEX-101", 2, "রান ফোঁড় — চল্লিশ সেকেন্ডে", 40, "2026-09-18T08:00:00Z", 58000),
  short("MED-102", 1, "জানালার আলোয় প্রোডাক্টের ছবি", 45, "2026-09-17T07:00:00Z", 73000),
  short("MEC-101", 2, "মাটি শুকালে পাম্প নিজেই চালু — ত্রিশ সেকেন্ডে", 32, "2026-09-16T12:00:00Z", 81000),
  short("ARC-101", 1, "ভিটা কত উঁচু হবে — এক মাপে", 44, "2026-09-15T10:00:00Z", 42000),
  short("MUS-101", 1, "গলা গরম করার এক মিনিট", 55, "2026-09-14T13:00:00Z", 61000),
  short("GTR-101", 1, "প্রথম কর্ড — আঙুল কোথায় বসবে", 47, "2026-09-21T13:00:00Z", 54000),
  short("ART-101", 1, "আকাশ আঁকার ভেজা কাগজের কৌশল", 50, "2026-09-17T09:00:00Z", 38000),
  short("BIZ-101", 1, "এক সূত্রে মাসের খরচ যোগ", 36, "2026-09-12T03:00:00Z", 47000),
];

/** A department's introduction on its page: its most watched short. */
export function deptShort(dept: string): ClassVideo | undefined {
  const ids = new Set(coursesOf(dept).map((c) => c.id));
  return classVideos.filter((v) => v.short && ids.has(v.course)).sort((a, b) => b.views - a.views)[0];
}

const seededVideo = new Set(classVideos.map((v) => v.id));

/** A seeded class's likes: about one viewer in twenty-two. Videos made on this device start at none. */
export function videoLikes(v: ClassVideo): number {
  return seededVideo.has(v.id) ? Math.round(v.views * 0.045) : 0;
}

/** A seeded class's stars: near its teacher's, from about one viewer in forty-five. */
export function videoRating(v: ClassVideo): { avg: number; count: number } {
  const record = recordByHandle.get(v.teacher);
  if (!seededVideo.has(v.id) || !record) return { avg: 0, count: 0 };
  const nudge = ([...v.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 3) / 10;
  return { avg: Math.round((record.rating.avg - nudge) * 10) / 10, count: Math.max(1, Math.round(v.views / 45)) };
}

/* ── Department pitch ──────────────────────────────────────────────── */

/** "যদি আপনি … ভালোবাসেন" — what kind of person each department suits, in one line. */
export const deptLikes: Record<string, string> = {
  "web-ai": "নিজের হাতে অ্যাপ বানানো, সমস্যার যুক্তি খোঁজা আর কম্পিউটারকে কাজ শেখানো",
  mechatronics: "সেন্সর, তার আর মোটর জুড়ে এমন যন্ত্র বানানো যা গ্রামের কাজ সহজ করে",
  architecture: "মাপজোখ, নকশা আঁকা আর বন্যা-ঝড় মাথায় রেখে কম খরচে টেকসই বাড়ি ভাবা",
  motor: "ইঞ্জিনের শব্দ শুনে সমস্যা ধরা, যন্ত্র খুলে আবার জোড়া লাগানো",
  kitchen: "রান্না করে মানুষকে খাওয়ানো, মাপ মেলানো আর রান্নাঘরকে ব্যবসা বানানো",
  music: "গান গাওয়া, সুর বাঁধা আর লোকগানের শিকড় খুঁজে নতুন করে গাওয়া",
  guitar: "গিটারের তারে আঙুল চালানো, ব্যান্ডে বাজানো আর নিজের সোলো বানানো",
  "fine-art": "রং-তুলিতে নদী-গ্রাম আঁকা, বাংলা হরফে সৌন্দর্য খোঁজা",
  textile: "সুই-সুতোয় ধৈর্য ধরে নকশা তোলা, তাঁতের ছন্দে কাপড় বোনা",
  media: "ছবি তোলা, ভিডিও বানানো আর গল্প বলে মানুষের কাছে পৌঁছানো",
  business: "হিসাব মেলানো, খাতা গুছিয়ে রাখা আর ছোট ব্যবসাকে বড় করা",
  beauty: "হাতে সূক্ষ্ম নকশা আঁকা, উৎসবে মানুষকে সাজিয়ে আনন্দ দেওয়া",
  sports: "মাঠে ঘাম ঝরানো, কৌশল শেখানো আর দল গড়ে জেতা",
  math: "চারপাশের জিনিসে সংখ্যা খোঁজা, ধাঁধা মেলানো আর কেন-কীভাবে জানতে চাওয়া",
};

/* ── Teacher channels ──────────────────────────────────────────────── */

/** The departments a teacher teaches in, the ones they lead first. */
export function deptsOfTeacher(handle: string): Department[] {
  return departments.filter((d) => d.teachers.includes(handle)).sort((a, b) => Number(b.teachers[0] === handle) - Number(a.teachers[0] === handle));
}

/** A teacher's followers before the viewer: about one viewer of their seeded classes in nine, and their graduates. */
export function teacherFollowers(handle: string): number {
  const views = classVideos.filter((v) => v.teacher === handle).reduce((n, v) => n + v.views, 0);
  return Math.round(views / 9) + (recordByHandle.get(handle)?.graduates ?? 0);
}

/** What learners said under the most-watched free classes, and the teachers' answers. */
export const videoComments: VideoComment[] = [
  { id: "c-chf3-pin", video: "chf-101-f3", handle: "rahima", text: "এই সপ্তাহের বাড়ির কাজ: এক কাপ চালে দেড় কাপ পানি মেপে পোলাও রাঁধুন, ছবি তুলে কোর্সের পাতায় দিন। মসলার মাপ উপকরণে পিডিএফ করে দেওয়া আছে।", at: "2026-09-25T04:30:00Z", likes: 212, pinned: true },
  { id: "c-chf3-1", video: "chf-101-f3", name: "রুনা আক্তার", text: "চাল ধুয়ে আধা ঘণ্টা ভিজিয়ে রাখার কারণটা এত সহজে কেউ বোঝায়নি। আজ রাতে বাসায় করে দেখব।", at: "2026-09-25T06:10:00Z", likes: 86 },
  { id: "c-chf3-1a", video: "chf-101-f3", parent: "c-chf3-1", handle: "rahima", text: "ভিজালে দানা লম্বা হয়, ভাঙে না। দেখে জানাবেন কেমন হলো!", at: "2026-09-25T07:00:00Z", likes: 31 },
  { id: "c-chf3-2", video: "chf-101-f3", name: "শাহানা পারভীন", text: "১০০ জনের রান্নায় লবণের মাপ কীভাবে বাড়াব? দ্বিগুণ করলে বেশি হয়ে যায়।", at: "2026-09-25T08:20:00Z", likes: 44 },
  { id: "c-chf3-2a", video: "chf-101-f3", parent: "c-chf3-2", handle: "rahima", text: "ঠিক ধরেছেন — লবণ সরাসরি গুণ হয় না। সপ্তাহ ৫-এ পুরো হিসাব আছে; আপাতত তিন ভাগের দুই ভাগ দিয়ে শুরু করে চেখে বাড়ান।", at: "2026-09-25T09:00:00Z", likes: 58 },
  { id: "c-chf3-2b", video: "chf-101-f3", parent: "c-chf3-2", name: "শাহানা পারভীন", text: "বুঝলাম, ধন্যবাদ আপা।", at: "2026-09-25T09:40:00Z", likes: 4 },

  { id: "c-mth3-pin", video: "mth-101-f3", handle: "nusrat", text: "যাঁরা ক্লাসে ছিলেন না: বোর্ডের ছবি আর অনুশীলনের ১০টা প্রশ্ন উপকরণে। উত্তর মেলাতে শুক্রবার রাতে লাইভে আসুন।", at: "2026-09-25T02:30:00Z", likes: 140, pinned: true },
  { id: "c-mth3-1", video: "mth-101-f3", name: "রিয়াদ হাসান", text: "রিকশার গতি বাড়া-কমা দিয়ে অন্তরীকরণ — এইচএসসিতে যেটা মুখস্থ করেছিলাম, আজ প্রথম বুঝলাম কেন।", at: "2026-09-25T04:00:00Z", likes: 167 },
  { id: "c-mth3-2", video: "mth-101-f3", name: "সাদিয়া ইসলাম", text: "৩২ মিনিটের উদাহরণটা আরেকবার ধীরে দেখাবেন? ঢাল ঋণাত্মক কেন হলো ধরতে পারিনি।", at: "2026-09-25T05:15:00Z", likes: 23 },
  { id: "c-mth3-2a", video: "mth-101-f3", parent: "c-mth3-2", handle: "nusrat", text: "রিকশা তখন ঢাল বেয়ে নামছিল, তাই উচ্চতা কমছে — সেজন্য ঋণাত্মক। শুক্রবারের লাইভে প্রথমেই এটা করব।", at: "2026-09-25T06:00:00Z", likes: 19 },

  { id: "c-web3-1", video: "web-101-f3", name: "তানজিলা ইসলাম", text: "বোতাম চাপলে লেখা বদলানোটা আমার মায়ের দোকানের পাতায় লাগিয়ে দিলাম। কাজ করছে!", at: "2026-09-24T17:00:00Z", likes: 74 },
  { id: "c-web3-1a", video: "web-101-f3", parent: "c-web3-1", handle: "anik", text: "দারুণ! লিংকটা কোর্সের পাতায় দিন, পরের ক্লাসে সবাইকে দেখাব।", at: "2026-09-24T18:00:00Z", likes: 22 },
  { id: "c-web3-2", video: "web-101-f3", name: "ইমন সরকার", text: "কনসোলে লাল লেখা এলে ভয় পেতাম। আপনার ‘ভুলটা পড়ো, ভয় পেয়ো না’ কথাটা মনে থাকবে।", at: "2026-09-25T03:00:00Z", likes: 51 },

  { id: "c-rks3-pin", video: "rks-101-f3", handle: "rafi", text: "ব্যাটারি চার্জের সময় ঘরের দরজা খোলা রাখুন, পানির বালতি হাতের কাছে নয় — বালি রাখুন। নিরাপত্তার তালিকা উপকরণে।", at: "2026-09-15T07:00:00Z", likes: 520, pinned: true },
  { id: "c-rks3-1", video: "rks-101-f3", name: "সোহাগ মিয়া", text: "আমাদের গ্যারেজে গত মাসে ব্যাটারি গরম হয়ে ধোঁয়া বের হয়েছিল। এই ভিডিওটা সবাইকে দেখালাম।", at: "2026-09-16T10:00:00Z", likes: 311 },
  { id: "c-rks3-2", video: "rks-101-f3", name: "জসিম উদ্দিন", text: "পুরোনো ব্যাটারি কোথায় বিক্রি করলে নিরাপদে রিসাইকেল হয়?", at: "2026-09-18T12:00:00Z", likes: 64 },
  { id: "c-rks3-2a", video: "rks-101-f3", parent: "c-rks3-2", handle: "rafi", text: "লাইসেন্স আছে এমন ভাঙারিতে দিন, রাস্তার পাশে খোলা জায়গায় না। সপ্তাহ ৪-এ ঠিকানাগুলোর তালিকা দেব।", at: "2026-09-18T14:00:00Z", likes: 48 },

  { id: "c-med2-1", video: "med-101-f2", name: "জান্নাতুল ফেরদৌস", text: "জানালার পাশে দাঁড়িয়ে শুট করলাম, আলো সত্যিই অনেক ভালো এল। মাইক্রোফোন ছাড়া শব্দ কীভাবে ভালো করি?", at: "2026-09-23T18:00:00Z", likes: 39 },
  { id: "c-med2-1a", video: "med-101-f2", parent: "c-med2-1", handle: "nabila", text: "ফোন মুখের কাছাকাছি, কাপড়ভরা ঘরে রেকর্ড করুন — পর্দা-কাঁথা শব্দ শুষে নেয়। পরের সপ্তাহে দেখাব।", at: "2026-09-23T19:00:00Z", likes: 27 },

  { id: "c-chf102-1", video: "chf-102-f1", name: "মামুন হোসেন", text: "ফুচকার টকের মাপটা লিখে নিলাম। দিনে কত প্লেট বিক্রি হলে লাভ হয় — এই হিসাবটাও চাই।", at: "2026-09-21T09:00:00Z", likes: 57 },
  { id: "c-chf102-1a", video: "chf-102-f1", parent: "c-chf102-1", handle: "babul", text: "সপ্তাহ ৩-এ পুরো খাতা ধরে দেখাব। আমার গাড়িতে দিনে ৮০ প্লেটের নিচে নামলে লোকসান।", at: "2026-09-21T11:00:00Z", likes: 41 },

  { id: "c-gfx1-1", video: "gfx-101-f1", name: "তাহমিনা আক্তার", text: "ফাঁকা জায়গা রাখলেই পোস্ট দামি দেখায় — এটা মাথায় রেখে আজ তিনটা পোস্ট বানালাম।", at: "2026-09-21T08:00:00Z", likes: 46 },
];
