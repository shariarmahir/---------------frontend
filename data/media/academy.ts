import type { Course, Department, Lesson, Material, School, TeacherRecord, Workshop } from "@/lib/media/academy";
import type { Question } from "@/lib/media/classroom";

/**
 * কাণ্ডারী তৈরি একাডেমি — departments, courses, workshops, teachers and the
 * public interview board. Teachers are members of শিক্ষিতদের মিডিয়া, so
 * every teacher links to a real profile with community-verified skills.
 * Dates sit around DEMO_NOW (Friday 2026-09-25). Sample data for the demo.
 */

const L = (week: number, title: string, mode: Lesson["mode"], homework?: string): Lesson => ({ week, title, mode, homework });
const M = (kind: Material["kind"], title: string, size: string): Material => ({ kind, title, size });

export const departments: Department[] = [
  { id: "web-ai", name: "ওয়েব, অ্যাপ ও এআই", school: "engineering", kind: "team", teachers: ["anik", "mahir", "rupa"], founded: "2026-03-01", blurb: "তিন বন্ধু — কোড, হার্ডওয়্যার আর ডিজাইন। প্রতি সপ্তাহে লাইভে একটা জিনিস শূন্য থেকে বানিয়ে দেখান, আপনিও সাথে বানান।" },
  { id: "mechatronics", name: "মেকাট্রনিক্স ও আইওটি", school: "engineering", kind: "workshop", teachers: ["mahir", "anik"], place: "কাণ্ডারী-ল্যাব, নকলা, শেরপুর", founded: "2026-04-14", blurb: "সেন্সর, মোটর আর কোড একসাথে — গ্রামের সমস্যার যন্ত্র নিজের হাতে বানানো।" },
  { id: "architecture", name: "স্থাপত্য ও বাড়ির নকশা", school: "engineering", kind: "solo", teachers: ["tanvir"], founded: "2026-05-02", blurb: "বন্যা আর ঝড় মাথায় রেখে কম খরচের বাড়ির নকশা — অটোক্যাড থেকে মাঠের মাপজোখ।" },
  { id: "motor", name: "যানবাহন মেরামত — বাইক, রিকশা, ইজিবাইক", school: "trades", kind: "workshop", teachers: ["rafi"], place: "রফিকুল ইসলামের গ্যারেজ, টঙ্গী, গাজীপুর", founded: "2026-02-10", blurb: "আঠারো বছরের গ্যারেজ এখন শ্রেণিকক্ষ। ভিডিওতে বুঝুন, গ্যারেজে এসে নিজের হাতে খুলুন-জোড়া লাগান।" },
  { id: "kitchen", name: "রান্না ও পেশাদার শেফ", school: "food", kind: "workshop", teachers: ["rahima", "babul"], place: "রহিমা বেগমের রান্নাঘর, মিরপুর ১০, ঢাকা", founded: "2026-03-20", blurb: "ঘরের রান্নাঘর থেকে বিয়েবাড়ির ডেকচি — মাপ, পরিচ্ছন্নতা, খরচের হিসাব আর পরিবেশন।" },
  { id: "music", name: "সংগীত", school: "arts", kind: "solo", teachers: ["mitu"], founded: "2026-04-01", blurb: "কণ্ঠ, সুর আর লোকগীতি — প্রতি সপ্তাহে লাইভে গেয়ে শোনান, শিক্ষক সরাসরি শুধরে দেন।" },
  { id: "fine-art", name: "চিত্রকলা ও ক্যালিগ্রাফি", school: "arts", kind: "solo", teachers: ["joy"], founded: "2026-05-18", blurb: "জলরঙে নদী-গ্রাম, বাংলা হরফের ক্যালিগ্রাফি — আঁকা ছবি বিক্রি পর্যন্ত।" },
  { id: "textile", name: "নকশিকাঁথা, তাঁত ও দর্জি", school: "arts", kind: "workshop", teachers: ["shapla", "hasina"], place: "রূপগঞ্জ তাঁতপল্লি, নারায়ণগঞ্জ", founded: "2026-03-08", blurb: "জামালপুরের কাঁথা আর রূপগঞ্জের জামদানি — ফোঁড় থেকে বাজারে বিক্রি।" },
  { id: "media", name: "ফটো, ভিডিও ও কনটেন্ট", school: "media", kind: "team", teachers: ["nabila", "sumaiya", "rupa"], founded: "2026-04-22", blurb: "ইউটিউবার হওয়া, প্রোডাক্ট ফটোগ্রাফি, মডেলিং আর গ্রাফিক ডিজাইন — ফোন দিয়েই শুরু।" },
  { id: "business", name: "হিসাব, এক্সেল ও ছোট ব্যবসা", school: "business", kind: "team", teachers: ["sajid", "kamal"], founded: "2026-06-01", blurb: "দোকানের খাতা থেকে আয়কর রিটার্ন — টাকার হিসাব যে রাখে, ব্যবসা সে-ই টেকায়।" },
  { id: "beauty", name: "মেহেদি ও সাজসজ্জা", school: "life", kind: "solo", teachers: ["taslima"], founded: "2026-06-15", blurb: "বিয়ে আর উৎসবের মেহেদি নকশা, ত্বকের নিরাপত্তা, বাসায় গিয়ে সেবার দাম ঠিক করা।" },
  { id: "sports", name: "ক্রিকেট ও ফিটনেস", school: "life", kind: "solo", teachers: ["sabbir"], place: "শহীদ কামারুজ্জামান স্টেডিয়াম মাঠ, রাজশাহী", founded: "2026-05-05", blurb: "সব বয়সের জন্য — ব্যাটিং-বোলিংয়ের কৌশল, চোট এড়ানো, নিজের দল গড়া।" },
  { id: "math", name: "গণিত — সব বয়সে", school: "science", kind: "solo", teachers: ["nusrat"], founded: "2026-02-25", blurb: "রিকশার গতি, বাজারের হিসাব, ফসলের মাপ — চারপাশের জিনিস দিয়ে গণিত।" },
];

export const courses: Course[] = [
  {
    id: "WEB-101", dept: "web-ai", title: "ওয়েব অ্যাপ বানানো — শূন্য থেকে লাইভ", teacher: "anik", level: "foundation", weeks: 8, fee: 3000, seats: 60, enrolled: 41, image: "/media/dsa-code.webp",
    outcome: "নিজের দোকান বা সংগঠনের জন্য একটা কাজের ওয়েব অ্যাপ বানিয়ে ইন্টারনেটে তুলতে পারবেন।",
    lessons: [L(1, "ব্রাউজার কীভাবে পাতা দেখায় — এইচটিএমএল", "live", "নিজের পরিচয়ের একটা পাতা"), L(2, "সিএসএস দিয়ে সাজানো, ফোনে ঠিক দেখানো", "video", "পাতাটা ফোনে ঠিক করুন"), L(3, "জাভাস্ক্রিপ্ট — বোতাম চাপলে কী হবে", "live"), L(4, "রিঅ্যাক্ট: পাতাকে টুকরোয় ভাঙা", "live", "দোকানের পণ্যের তালিকা"), L(5, "ফর্ম, ডেটা আর ভুল ধরা", "video"), L(6, "নেক্সট.জেএস দিয়ে পুরো অ্যাপ", "live", "অর্ডার নেওয়ার ফর্ম"), L(7, "ডেটাবেস আর লগইন", "live"), L(8, "অ্যাপ লাইভ করা ও রিভিউ", "live", "লাইভ লিংক জমা")],
    materials: [M("video", "প্রতি সপ্তাহের ক্লাস রেকর্ডিং", "৮টি"), M("pdf", "এইচটিএমএল-সিএসএস চিটশিট", "১.২ এমবি"), M("data", "দোকানের নমুনা পণ্য-তালিকা (JSON)", "৪০ কেবি")],
    final: "একটি সত্যিকারের দোকান, ক্লাব বা স্কুলের জন্য অ্যাপ — লাইভ লিংক আর কোডসহ।", nextLive: "2026-09-26T14:00:00Z",
  },
  {
    id: "AI-201", dept: "web-ai", title: "এআই দিয়ে বাংলা চ্যাটবট", teacher: "mahir", level: "intermediate", weeks: 6, fee: 4000, seats: 40, enrolled: 27, image: "/media/challenge-hackathon.webp",
    outcome: "পাইথনে বাংলা প্রশ্নের উত্তর দেওয়া একটা চ্যাটবট বানিয়ে ওয়েবে বসাতে পারবেন।",
    lessons: [L(1, "পাইথনের ঝটপট পুনরাবৃত্তি", "video", "ছোট একটা ক্যালকুলেটর"), L(2, "এআই মডেল কী, কীভাবে উত্তর দেয়", "live"), L(3, "নিজের নথি থেকে উত্তর (RAG)", "live", "স্কুলের নোটিশ দিয়ে বট"), L(4, "বাংলা লেখা পরিষ্কার করা", "video"), L(5, "ওয়েবে বসানো", "live", "লাইভ ডেমো"), L(6, "ভুল উত্তর ধরা ও নিরাপত্তা", "live")],
    materials: [M("video", "ক্লাস রেকর্ডিং", "৬টি"), M("data", "বাংলা প্রশ্নোত্তর নমুনা ডেটাসেট", "২.৪ এমবি"), M("doc", "প্রম্পট লেখার নির্দেশিকা", "৩২০ কেবি")],
    final: "একটি প্রতিষ্ঠানের আসল প্রশ্নের উত্তর দেওয়া বাংলা চ্যাটবট, ভুল-উত্তরের হিসাবসহ।", nextLive: "2026-09-27T13:00:00Z",
  },
  {
    id: "MEC-101", dept: "mechatronics", title: "মেকাট্রনিক্স: সেন্সর থেকে রোবট", teacher: "mahir", level: "foundation", weeks: 8, fee: 4500, seats: 24, enrolled: 19, image: "/media/circuit.webp",
    outcome: "সেন্সর পড়ে মোটর চালানো একটা যন্ত্র নকশা করে নিজের হাতে বানাতে পারবেন।",
    lessons: [L(1, "বিদ্যুৎ, ভোল্ট আর নিরাপত্তা", "video", "বাড়ির তিনটি যন্ত্রের ভোল্ট-অ্যাম্প লিখুন"), L(2, "ব্রেডবোর্ডে প্রথম সার্কিট", "hands-on"), L(3, "মাইক্রোকন্ট্রোলার প্রোগ্রাম", "live", "এলইডি জ্বলা-নেভা"), L(4, "সেন্সর: তাপ, আর্দ্রতা, দূরত্ব", "hands-on"), L(5, "মোটর ও রিলে", "hands-on", "পাম্প চালু-বন্ধ"), L(6, "ফোন থেকে নিয়ন্ত্রণ (আইওটি)", "live"), L(7, "বাক্সে ভরা — মাঠে টেকার মতো", "hands-on", "নকশার ছবি"), L(8, "প্রদর্শনী", "hands-on")],
    materials: [M("pdf", "যন্ত্রাংশের তালিকা ও দাম", "৬০০ কেবি"), M("sheet", "সার্কিটের হিসাব (এক্সেল)", "৯০ কেবি"), M("video", "সোল্ডারিং হাতে-কলমে", "৩টি")],
    final: "গ্রাম বা কারখানার একটা সমস্যার যন্ত্র — চালু অবস্থার ভিডিও আর খরচের হিসাবসহ।", nextLive: "2026-09-28T04:00:00Z",
  },
  {
    id: "ARC-101", dept: "architecture", title: "বন্যা-সহনশীল বাড়ির নকশা", teacher: "tanvir", level: "intermediate", weeks: 6, fee: 4000, seats: 30, enrolled: 14, image: "/media/floorplan.webp",
    outcome: "উঁচু ভিটা, বাঁশ-কংক্রিট আর বাতাস চলাচল মাথায় রেখে একটা গ্রামীণ বাড়ির নকশা আঁকতে পারবেন।",
    lessons: [L(1, "বন্যার পানি কোথা দিয়ে ঢোকে", "video", "নিজের এলাকার বন্যার উচ্চতা জেনে আসুন"), L(2, "অটোক্যাডে প্রথম নকশা", "live"), L(3, "ভিটা, খুঁটি আর ভিত", "live", "ভিটার মাপ"), L(4, "কম খরচের উপকরণ", "video"), L(5, "মাঠে মাপজোখ", "hands-on", "মাঠের ছবি ও মাপ"), L(6, "খরচের হিসাব ও উপস্থাপন", "live")],
    materials: [M("doc", "নকশার টেমপ্লেট", "৪ এমবি"), M("sheet", "উপকরণের খরচের শিট", "১২০ কেবি")],
    final: "একটি পরিবারের জন্য বন্যা-সহনশীল বাড়ির পূর্ণ নকশা ও খরচ।", nextLive: "2026-09-30T13:00:00Z",
  },
  {
    id: "MTR-101", dept: "motor", title: "মোটরসাইকেল সার্ভিসিং", teacher: "rafi", level: "foundation", weeks: 8, fee: 3500, seats: 16, enrolled: 16, image: "/media/bike-service.webp",
    outcome: "একটা মোটরসাইকেলের পুরো সার্ভিসিং নিজে করতে পারবেন — অয়েল, চেইন, ব্রেক, প্লাগ, ক্লাচ।",
    lessons: [L(1, "যন্ত্রপাতি চেনা ও নিরাপত্তা", "video", "নিজের টুলবক্সের ছবি"), L(2, "ইঞ্জিন অয়েল ও ফিল্টার", "hands-on"), L(3, "চেইন, স্প্রকেট আর টায়ার", "hands-on", "চেইনের ঢিল মাপুন"), L(4, "ব্রেক — ড্রাম ও ডিস্ক", "hands-on"), L(5, "স্পার্ক প্লাগ ও ইগনিশন", "video", "প্লাগের রং দেখে ইঞ্জিনের অবস্থা"), L(6, "ক্লাচ ও তার", "hands-on"), L(7, "বিদ্যুতের লাইন ও ব্যাটারি", "hands-on"), L(8, "পুরো সার্ভিসিং, ঘড়ি ধরে", "hands-on", "সার্ভিসিংয়ের ভিডিও")],
    materials: [M("video", "প্রতিটি কাজের ধাপে ধাপে ভিডিও", "১৪টি"), M("pdf", "সার্ভিসিং চেকলিস্ট", "২১০ কেবি"), M("sheet", "যন্ত্রাংশের দাম ও কাস্টমারের হিসাব", "৬০ কেবি")],
    final: "একটি বাইকের পূর্ণ সার্ভিসিং — শুরুর আর শেষের অবস্থা, ভিডিও ও যন্ত্রাংশের হিসাব।", nextLive: "2026-09-26T04:00:00Z",
  },
  {
    id: "MTR-201", dept: "motor", title: "ইঞ্জিন ও কার্বুরেটর ওভারহল", teacher: "rafi", level: "advanced", weeks: 6, fee: 5000, seats: 10, enrolled: 7, image: "/media/carburetor.webp",
    outcome: "ইঞ্জিন খুলে সমস্যা খুঁজে আবার চালু করতে পারবেন — নিজের গ্যারেজ চালানোর মতো।",
    lessons: [L(1, "শব্দ শুনে সমস্যা ধরা", "video", "তিনটি বাইকের শব্দ রেকর্ড"), L(2, "কার্বুরেটর খোলা ও পরিষ্কার", "hands-on"), L(3, "পিস্টন, রিং আর সিলিন্ডার", "hands-on", "মাপের খাতা"), L(4, "ভাল্ভ ও টাইমিং", "hands-on"), L(5, "জোড়া লাগানো ও প্রথম চালু", "hands-on"), L(6, "কাস্টমার, দাম আর ওয়ারেন্টি", "live", "নিজের গ্যারেজের দামের তালিকা")],
    materials: [M("video", "ওভারহল পুরো রেকর্ডিং", "৬টি"), M("pdf", "টর্ক ও মাপের তালিকা", "৪৮০ কেবি")],
    final: "একটি বন্ধ ইঞ্জিন চালু করা — কী নষ্ট ছিল, কী বদলালেন, কত খরচ।", nextLive: "2026-10-01T04:00:00Z",
  },
  {
    id: "RKS-101", dept: "motor", title: "রিকশা-ভ্যান মেরামত ও ইজিবাইকের ব্যাটারি", teacher: "rafi", level: "foundation", weeks: 4, fee: 0, seats: 30, enrolled: 22, image: "/bangladesh/rickshaw.jpg",
    outcome: "রিকশা-ভ্যানের চাকা, ব্রেক, চেইন সারাতে আর ইজিবাইকের ব্যাটারি নিরাপদে রাখতে পারবেন।",
    lessons: [L(1, "চাকা, স্পোক আর টিউব", "video", "নিজের রিকশার চাকা দেখে কী ঠিক নেই লিখুন"), L(2, "ব্রেক ও চেইন", "hands-on"), L(3, "ইজিবাইকের ব্যাটারি — চার্জ, পানি, আগুনের ঝুঁকি", "video", "নিজের এলাকার চার্জিং ঘরের অবস্থা লিখুন"), L(4, "বডি ও হুড মেরামত", "hands-on")],
    materials: [M("video", "চাকা ও ব্রেকের ভিডিও", "৪টি"), M("pdf", "ব্যাটারি নিরাপত্তার নিয়ম", "১৮০ কেবি")],
    final: "একটি রিকশা বা ভ্যানের মেরামত, আগে-পরের ছবিসহ।", nextLive: "2026-09-27T04:00:00Z",
  },
  {
    id: "CHF-101", dept: "kitchen", title: "ঘরোয়া রান্না থেকে পেশাদার শেফ", teacher: "rahima", level: "foundation", weeks: 8, fee: 4000, seats: 12, enrolled: 11, image: "/media/kacchi.webp",
    outcome: "৫০–১০০ জনের রান্না মাপমতো, পরিচ্ছন্নভাবে, খরচের হিসাব রেখে করতে পারবেন।",
    lessons: [L(1, "রান্নাঘরের পরিচ্ছন্নতা ও ছুরি ধরা", "live", "নিজের রান্নাঘরের ছবি"), L(2, "মসলা — অনুপাত আর ভাজা", "hands-on"), L(3, "ভাত, পোলাও, বিরিয়ানি", "hands-on", "এক কেজির পোলাও"), L(4, "মাছ-মাংস — কাটা, রাখা, রান্না", "hands-on"), L(5, "পিঠা ও মিষ্টি", "live"), L(6, "বড় ডেকচি: ৫০ জনের মাপ", "hands-on", "৫০ জনের বাজারের তালিকা"), L(7, "খরচ, দাম ও লাভ", "live"), L(8, "পরিবেশন ও মেন্যু", "hands-on")],
    materials: [M("pdf", "মাপসহ ৪০টি রেসিপি", "৩.১ এমবি"), M("sheet", "জনপ্রতি খরচের হিসাব", "৭০ কেবি"), M("video", "রান্নাঘরের ক্লাস রেকর্ডিং", "৮টি")],
    final: "একটি অনুষ্ঠানের পুরো মেন্যু রান্না — মাপ, খরচ, পরিবেশন, অতিথির মতামত।", nextLive: "2026-09-26T09:00:00Z",
  },
  {
    id: "CHF-102", dept: "kitchen", title: "স্ট্রিট ফুড ব্যবসা — ফুচকা থেকে টিফিন", teacher: "babul", level: "foundation", weeks: 4, fee: 1500, seats: 20, enrolled: 9, image: "/media/shop-fuchka.webp",
    outcome: "একটা খাবারের গাড়ি বা টিফিন সার্ভিস চালু করে প্রতিদিনের হিসাব রাখতে পারবেন।",
    lessons: [L(1, "ফুচকা-চটপটির মাপ ও পরিচ্ছন্নতা", "live"), L(2, "জায়গা বাছাই ও অনুমতি", "video", "এলাকার তিনটি জায়গা ঘুরে দেখুন"), L(3, "দাম, খরচ, প্রতিদিনের খাতা", "live", "এক সপ্তাহের খাতা"), L(4, "টিফিন সার্ভিস ও ডেলিভারি", "live")],
    materials: [M("sheet", "প্রতিদিনের বিক্রির খাতা", "৪০ কেবি"), M("pdf", "খাদ্য নিরাপত্তার নিয়ম", "২৬০ কেবি")],
    final: "এক সপ্তাহ নিজে খাবার বিক্রি — খাতা, ছবি আর লাভ-ক্ষতি।", nextLive: "2026-09-29T11:00:00Z",
  },
  {
    id: "MUS-101", dept: "music", title: "কণ্ঠসংগীত ও সুর", teacher: "mitu", level: "foundation", weeks: 8, fee: 2500, seats: 25, enrolled: 18, image: "/bangladesh/boishakh.jpg",
    outcome: "সুরে গাইতে, নিজের গলা রক্ষা করতে আর একটা লোকগানের নিজস্ব সুর দাঁড় করাতে পারবেন।",
    lessons: [L(1, "শ্বাস আর গলা গরম করা", "live", "প্রতিদিন ১০ মিনিট রেওয়াজের রেকর্ড"), L(2, "সা রে গা মা — সুর চেনা", "live"), L(3, "তাল: দাদরা, কাহারবা", "video", "দাদরায় একটা গান"), L(4, "লোকগীতির ঢং", "live"), L(5, "রেকর্ডিং — ফোন থেকে স্টুডিও", "video"), L(6, "সুর রচনা", "live", "আট লাইনের নিজের সুর"), L(7, "মঞ্চে গাওয়া", "live"), L(8, "অনলাইন কনসার্ট", "live")],
    materials: [M("video", "রেওয়াজের ভিডিও", "১০টি"), M("doc", "গানের কথা ও স্বরলিপি", "৫৪০ কেবি")],
    final: "নিজের সুরে একটা গান — রেকর্ডিং আর মঞ্চে গাওয়ার ভিডিও।", nextLive: "2026-09-25T13:00:00Z",
  },
  {
    id: "ART-101", dept: "fine-art", title: "জলরং — নদী, গ্রাম, আলো", teacher: "joy", level: "foundation", weeks: 6, fee: 2000, seats: 30, enrolled: 21, image: "/media/watercolor.webp",
    outcome: "জলরঙে প্রাকৃতিক দৃশ্য আঁকতে আর নিজের ছবির ন্যায্য দাম ঠিক করে বিক্রি করতে পারবেন।",
    lessons: [L(1, "কাগজ, তুলি আর পানির মাপ", "video", "রঙের চার্ট"), L(2, "আকাশ আর পানি — ওয়েট অন ওয়েট", "live"), L(3, "আলো-ছায়া", "live", "একটা নৌকা"), L(4, "গ্রামের দৃশ্য", "live"), L(5, "বাংলা ক্যালিগ্রাফি", "video", "নিজের নামের ক্যালিগ্রাফি"), L(6, "ছবির দাম ও বিক্রি", "live")],
    materials: [M("pdf", "রঙ মেশানোর চার্ট", "২.২ এমবি"), M("video", "ধাপে ধাপে আঁকা", "৬টি")],
    final: "তিনটি জলরঙের ছবির একটি সিরিজ, বাজারে তোলার জন্য তৈরি।", nextLive: "2026-09-28T12:00:00Z",
  },
  {
    id: "TEX-101", dept: "textile", title: "নকশিকাঁথা ও দর্জির কাজ", teacher: "shapla", level: "foundation", weeks: 6, fee: 1500, seats: 20, enrolled: 15, image: "/media/kantha-full.webp",
    outcome: "নকশিকাঁথার মূল ফোঁড়, মাপমতো জামা কাটা ও সেলাই — আর কাজের দাম ঠিক করতে পারবেন।",
    lessons: [L(1, "সুতা, সুঁই, কাপড় চেনা", "video"), L(2, "রান ফোঁড় ও কাঁথা ফোঁড়", "hands-on", "এক ফুট কাঁথার নমুনা"), L(3, "নকশা আঁকা ও তোলা", "hands-on"), L(4, "মাপ নেওয়া ও কাটা", "hands-on", "নিজের মাপের কামিজ কাটা"), L(5, "সেলাই মেশিন", "hands-on"), L(6, "দাম ও বাজার", "live")],
    materials: [M("pdf", "৩০টি নকশার ছাপ", "৫.৬ এমবি"), M("sheet", "সময় ও দামের হিসাব", "৩০ কেবি")],
    final: "একটি সম্পূর্ণ কাঁথা বা পোশাক, সময় ও খরচের হিসাবসহ।", nextLive: "2026-09-29T04:00:00Z",
  },
  {
    id: "MED-101", dept: "media", title: "ইউটিউবার হওয়া — ভিডিও বানানো থেকে আয়", teacher: "nabila", level: "foundation", weeks: 6, fee: 2500, seats: 50, enrolled: 38, image: "/bangladesh/bandarban.jpg",
    outcome: "ফোনে ভিডিও তুলে, এডিট করে, নিয়ম মেনে চ্যানেল চালাতে আর আয়ের পথ চিনতে পারবেন।",
    lessons: [L(1, "গল্প আগে, ক্যামেরা পরে", "live", "এক মিনিটের গল্প লিখুন"), L(2, "ফোনে শুট — আলো, শব্দ, ফ্রেম", "video"), L(3, "এডিটিং", "live", "প্রথম ভিডিও"), L(4, "থাম্বনেইল, শিরোনাম, বর্ণনা", "video"), L(5, "কপিরাইট ও কমিউনিটির নিয়ম", "live"), L(6, "আয় — বিজ্ঞাপন, স্পনসর, নিজের পণ্য", "live", "তিন মাসের পরিকল্পনা")],
    materials: [M("video", "শুটিংয়ের ভিডিও", "৬টি"), M("doc", "ভিডিওর স্ক্রিপ্ট টেমপ্লেট", "৮০ কেবি"), M("sheet", "আপলোডের ক্যালেন্ডার", "২০ কেবি")],
    final: "নিজের চ্যানেলে চারটি ভিডিও আর তিন মাসের পরিকল্পনা।", nextLive: "2026-09-25T14:30:00Z",
  },
  {
    id: "MED-102", dept: "media", title: "প্রোডাক্ট ফটোগ্রাফি ও মডেলিং", teacher: "sumaiya", level: "intermediate", weeks: 6, fee: 3000, seats: 20, enrolled: 12, image: "/media/shoot-after.webp",
    outcome: "দোকানের পণ্যের বিক্রিযোগ্য ছবি তুলতে আর ক্যামেরার সামনে পেশাদারভাবে দাঁড়াতে পারবেন।",
    lessons: [L(1, "আলো — জানালা থেকে সফটবক্স", "video", "একটা পণ্যের তিনটি ছবি"), L(2, "পটভূমি ও স্টাইলিং", "hands-on"), L(3, "এডিটিং ও রং", "live", "আগে-পরে"), L(4, "মডেলিং — ভঙ্গি ও হাঁটা", "hands-on"), L(5, "ক্লায়েন্ট, চুক্তি ও নিরাপত্তা", "live"), L(6, "পোর্টফোলিও", "live", "দশ ছবির পোর্টফোলিও")],
    materials: [M("pdf", "আলোর নকশা", "১.৮ এমবি"), M("doc", "শুটের চুক্তিপত্রের নমুনা", "৬০ কেবি")],
    final: "একটি সত্যিকারের দোকানের জন্য ২০টি পণ্যের ছবি।", nextLive: "2026-10-02T09:00:00Z",
  },
  {
    id: "GFX-101", dept: "media", title: "গ্রাফিক ডিজাইন ও ফেসবুক বিজ্ঞাপন", teacher: "rupa", level: "foundation", weeks: 6, fee: 2500, seats: 40, enrolled: 29, image: "/media/ads-report.webp",
    outcome: "লোগো, পোস্টার আর বিজ্ঞাপন বানিয়ে ছোট বাজেটে ঠিক মানুষের কাছে পৌঁছাতে পারবেন।",
    lessons: [L(1, "রং, হরফ আর ফাঁকা জায়গা", "video", "তিনটি পোস্টারের বিশ্লেষণ"), L(2, "লোগো", "live"), L(3, "সোশ্যাল পোস্ট ও ব্যানার", "live", "এক সপ্তাহের পোস্ট"), L(4, "বিজ্ঞাপনের টার্গেটিং", "live"), L(5, "খরচ আর ফলাফল মাপা", "video", "৫০০ টাকার পরীক্ষামূলক বিজ্ঞাপন"), L(6, "ক্লায়েন্টের সাথে কাজ", "live")],
    materials: [M("doc", "ব্র্যান্ড গাইডের টেমপ্লেট", "২.৫ এমবি"), M("sheet", "বিজ্ঞাপনের ফলাফলের শিট", "৫০ কেবি")],
    final: "একটি ছোট ব্যবসার ব্র্যান্ড আর এক মাসের বিজ্ঞাপন — খরচ ও ফলসহ।", nextLive: "2026-09-27T14:00:00Z",
  },
  {
    id: "BIZ-101", dept: "business", title: "এক্সেল, হিসাব ও আয়কর রিটার্ন", teacher: "sajid", level: "foundation", weeks: 6, fee: 2000, seats: 60, enrolled: 33, image: "/media/tax-desk.webp",
    outcome: "এক্সেলে ব্যবসার হিসাব রাখতে আর নিজের বা অন্যের আয়কর রিটার্ন তৈরি করতে পারবেন।",
    lessons: [L(1, "এক্সেল — ঘর, সূত্র, SUM", "video", "এক মাসের খরচের শিট"), L(2, "দোকানের খাতা", "live"), L(3, "লাভ-ক্ষতি ও নগদ প্রবাহ", "live", "নিজের ব্যবসার হিসাব"), L(4, "আয়কর — কে দেবে, কত", "video"), L(5, "রিটার্ন পূরণ, ধাপে ধাপে", "live", "নমুনা রিটার্ন"), L(6, "ক্লায়েন্টের হিসাব রাখা", "live")],
    materials: [M("sheet", "হিসাবের টেমপ্লেট", "১৪০ কেবি"), M("pdf", "রিটার্ন পূরণের নির্দেশিকা", "৯৬০ কেবি"), M("data", "নমুনা লেনদেন", "২২ কেবি")],
    final: "একটি সত্যিকারের ছোট ব্যবসার তিন মাসের হিসাব ও একজনের আয়কর রিটার্ন।", nextLive: "2026-09-26T15:00:00Z",
  },
  {
    id: "BIZ-102", dept: "business", title: "ছোট দোকান চালানো ও হোম ডেলিভারি", teacher: "kamal", level: "foundation", weeks: 4, fee: 0, seats: 40, enrolled: 26, image: "/media/shop-grocery.webp",
    outcome: "মজুত, বাকি, ডেলিভারি আর অনলাইন অর্ডার সামলে দোকান লাভে রাখতে পারবেন।",
    lessons: [L(1, "মজুত ও পাইকারি কেনা", "video", "দোকানের মজুতের তালিকা"), L(2, "বাকির খাতা", "live"), L(3, "ফোনে অর্ডার ও ডেলিভারি", "live", "এক সপ্তাহের ডেলিভারির হিসাব"), L(4, "বিকাশ-নগদে লেনদেন", "video")],
    materials: [M("sheet", "মজুত ও বাকির খাতা", "৩৫ কেবি")],
    final: "নিজের বা পরিবারের দোকানে এক মাস হিসাব রাখা — আগে-পরের লাভ।", nextLive: "2026-09-30T14:00:00Z",
  },
  {
    id: "BTY-101", dept: "beauty", title: "মেহেদি নকশা — বিয়ে ও উৎসব", teacher: "taslima", level: "foundation", weeks: 4, fee: 1500, seats: 20, enrolled: 17, image: "/media/mehndi-bride.webp",
    outcome: "বিয়ের পূর্ণ হাতের মেহেদি করতে, ত্বক নিরাপদ রাখতে আর সেবার দাম ঠিক করতে পারবেন।",
    lessons: [L(1, "কোন ধরা ও রেখা", "video", "এক পাতা রেখার অনুশীলন"), L(2, "ফুল, পাতা, জাল", "live"), L(3, "পূর্ণ হাত — ব্রাইডাল", "hands-on", "একটা পূর্ণ হাত"), L(4, "ত্বকের নিরাপত্তা ও সেবার দাম", "live")],
    materials: [M("pdf", "৫০টি নকশা", "৪.২ এমবি"), M("doc", "প্যাচ টেস্ট ও নিরাপত্তা", "৭০ কেবি")],
    final: "একজন কনের পূর্ণ মেহেদি — ছবি, সময় আর দাম।", nextLive: "2026-09-29T13:00:00Z",
  },
  {
    id: "SPT-101", dept: "sports", title: "ক্রিকেট কোচিং — সব বয়সে", teacher: "sabbir", level: "foundation", weeks: 8, fee: 2000, seats: 30, enrolled: 24, image: "/media/team-cricket.webp",
    outcome: "নিজের এলাকায় শিশু থেকে বড়দের ক্রিকেট শেখাতে আর দল গড়তে পারবেন।",
    lessons: [L(1, "ওয়ার্ম-আপ ও চোট এড়ানো", "video"), L(2, "ব্যাট ধরা ও দাঁড়ানো", "hands-on", "শ্যাডো ব্যাটিংয়ের ভিডিও"), L(3, "বোলিং অ্যাকশন", "hands-on"), L(4, "ফিল্ডিং ও ক্যাচ", "hands-on"), L(5, "ফিটনেস রুটিন", "video", "দুই সপ্তাহের রুটিন"), L(6, "ম্যাচের কৌশল", "live"), L(7, "শিশুদের শেখানো", "hands-on"), L(8, "এলাকার টুর্নামেন্ট", "hands-on")],
    materials: [M("video", "অনুশীলনের ড্রিল", "১২টি"), M("pdf", "বয়সভিত্তিক অনুশীলনসূচি", "৬৬০ কেবি")],
    final: "এক মাস একটি দলকে কোচিং — অনুশীলনসূচি, ভিডিও আর ম্যাচের ফল।", nextLive: "2026-09-26T11:00:00Z",
  },
  {
    id: "MTH-101", dept: "math", title: "রিকশার গতি দিয়ে ক্যালকুলাস", teacher: "nusrat", level: "intermediate", weeks: 6, fee: 1000, seats: 80, enrolled: 52, image: "/media/calculus.webp",
    outcome: "গতি, ঢাল আর পরিবর্তনের হার দিয়ে ক্যালকুলাস বুঝে নিজে অন্যকে বোঝাতে পারবেন।",
    lessons: [L(1, "গড় বেগ — রিকশার যাত্রা", "live", "নিজের যাত্রার সময়-দূরত্ব"), L(2, "তাৎক্ষণিক বেগ ও ঢাল", "live"), L(3, "অন্তরীকরণ", "video", "দশটি অঙ্ক"), L(4, "সর্বোচ্চ-সর্বনিম্ন — দোকানের লাভ", "live"), L(5, "যোগজীকরণ — জমির মাপ", "video", "পুকুরের ক্ষেত্রফল"), L(6, "নিজে শেখানো", "live")],
    materials: [M("pdf", "অনুশীলনী ও সমাধান", "১.৪ এমবি"), M("sheet", "গতির ডেটা (এক্সেল)", "২৮ কেবি")],
    final: "চারপাশের একটা সমস্যা ক্যালকুলাস দিয়ে সমাধান করে দশ মিনিটে শেখানো।", nextLive: "2026-09-25T15:00:00Z",
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
  certificate?: string;
}

export const board: BoardSeat[] = [
  { id: "b-sohag", learner: "সোহাগ মিয়া", district: "গাজীপুর", course: "RKS-101", at: "2026-09-27T04:00:00Z", panel: ["রফিকুল ইসলাম", "বহিরাগত পরীক্ষক · মেকানিক্যাল প্রকৌশলী"], project: "ব্যাটারির আগুনের ঝুঁকি কমানো একটা ইজিবাইক চার্জিং ঘর" },
  { id: "b-maruf", learner: "মারুফ হাসান", district: "সিলেট", course: "MUS-101", at: "2026-09-28T04:00:00Z", panel: ["মিতু সরকার", "বহিরাগত পরীক্ষক · সংগীতশিল্পী"], project: "হাসন রাজার গানের নতুন সুর, ফোনে রেকর্ড করা" },
  { id: "b-jannat", learner: "জান্নাতুল ফেরদৌস", district: "বান্দরবান", course: "MED-101", at: "2026-09-29T09:00:00Z", panel: ["নাবিলা চৌধুরী", "বহিরাগত পরীক্ষক · চলচ্চিত্র নির্মাতা"], project: "পাহাড়ি রান্নার চ্যানেল — চারটি ভিডিও" },
  { id: "b-emon", learner: "ইমন সরকার", district: "ঢাকা", course: "WEB-101", at: "2026-09-30T04:00:00Z", panel: ["অনিক হাসান", "বহিরাগত পরীক্ষক · সফটওয়্যার স্থপতি"], project: "কোচিং সেন্টারের ভর্তি ও বেতনের অ্যাপ" },
  { id: "b-shariful", learner: "শরিফুল ইসলাম", district: "গাজীপুর", course: "MTR-101", at: "2026-09-20T04:00:00Z", panel: ["রফিকুল ইসলাম", "বহিরাগত পরীক্ষক · মেকানিক্যাল প্রকৌশলী"], project: "একটা ১০০ সিসি বাইকের পূর্ণ সার্ভিসিং, ঘড়ি ধরে", marks: [78, 84], certificate: "KTA-2026-MTR101-0007" },
  { id: "b-labonno", learner: "লাবণ্য দাস", district: "ঢাকা", course: "CHF-101", at: "2026-09-18T05:00:00Z", panel: ["রহিমা বেগম", "বহিরাগত পরীক্ষক · হোটেলের হেড শেফ"], project: "১২০ জনের বিয়েবাড়ির মেন্যু, জনপ্রতি খরচসহ", marks: [88, 91], certificate: "KTA-2026-CHF101-0003" },
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

export const getDepartment = (id: string) => deptById.get(id);
export const getCourse = (id: string) => courseById.get(id);
export const teacherRecord = (handle: string) => recordByHandle.get(handle);
export const coursesOf = (dept: string) => courses.filter((c) => c.dept === dept);
export const coursesBy = (handle: string) => courses.filter((c) => c.teacher === handle);
export const workshopsOf = (dept: string) => workshops.filter((w) => w.dept === dept);
