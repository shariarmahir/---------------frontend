/**
 * "বাংলাদেশ" — the country story page.
 *
 * ── What is sourced, and how ─────────────────────────────────────────
 *
 *   Numbers (growth, population, rivers) come from the World Bank API
 *   (data/bangladesh-growth.ts) or a named source in `facts`, checked in
 *   September 2026. Dates in the timeline are long-established history.
 *   Poetry quoted here is from poets whose work is public domain (Tagore
 *   d.1941, Jibanananda d.1954, Lalon d.1890); the one Nazrul line is a
 *   single-line quotation.
 *
 *   Photographs are Wikimedia Commons files under CC BY / CC BY-SA / CC0
 *   / public domain, downloaded into /public/bangladesh with their credit
 *   in data/bangladesh-photos.ts — the credit is shown on the image and in
 *   the credits list. Films without a `src` are placeholders and the UI
 *   says so.
 *
 *   Contested figures (e.g. 1971 casualty counts) are deliberately not
 *   stated as numbers.
 */

import { commonsPhotos } from "./bangladesh-photos";

export interface Credit {
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
}

export interface Photo {
  src: string;
  alt: string;
  credit?: Credit;
  /** CSS object-position, for photos whose subject is off-centre. */
  focus?: string;
}

export interface Film {
  title: string;
  titleBn: string;
  brief: string;
  poster: Photo;
  /** Only set when real footage exists. */
  src?: string;
  duration?: string;
}

/** A Commons photo by key, or a local fallback if it was not fetched. */
function photo(key: string, fallback: Photo): Photo {
  return commonsPhotos[key] ?? fallback;
}

/* Local, Kandari-owned photographs used as fallbacks and fillers. */
const LOCAL = {
  harvestDusk: { src: "/hero/Hero-3.jpg", alt: "গোধূলিতে ধানক্ষেতের আলপথ ধরে মাথায় খড়ের আঁটি নিয়ে হেঁটে চলেছেন কৃষকেরা" },
  sailboat: { src: "/hero/Hero-1.jpg", alt: "নদীর তীরে বাঁধা রঙিন পালতোলা নৌকা" },
  elders: { src: "/hero/Hero-10.jpg", alt: "ভোরের কুয়াশায় দুই প্রবীণ একে অপরকে পানি এগিয়ে দিচ্ছেন" },
  mustardGirls: { src: "/hero/Hero-8.jpg", alt: "সরিষা ক্ষেতের ভেতর দিয়ে স্কুলে যাচ্ছে চার কিশোরী" },
  mangroveBoat: { src: "/hero/Hero-5.jpg", alt: "সুন্দরবনের ম্যানগ্রোভ জলাভূমিতে একা নৌকা বাইছেন এক মাঝি" },
  threshing: { src: "/hero/Hero-7.jpg", alt: "হলুদ আলোয় ধান মাড়াইয়ের যন্ত্রে কাজ করছেন কৃষকেরা" },
  sunsetCart: { src: "/hero/Hero-2.jpg", alt: "অস্তগামী সূর্যের সামনে গরুর গাড়ি ও দৌড়ে চলা কিশোরদের অবয়ব" },
  lakeHouse: { src: "/hero/Hero-4.jpg", alt: "পাহাড় ও হ্রদের মাঝে জলের উপর দাঁড়িয়ে থাকা একটি কাঠের ঘর" },
  canalBoat: { src: "/hero/Hero-6.jpg", alt: "সুন্দরবনের খাল ধরে যাত্রীবোঝাই নৌকা চলেছে" },
  plough: { src: "/hero/Hero-9.jpg", alt: "ক্ষেতে লাঙল হাতে কৃষক ও পাশে দাঁড়ানো এক কিশোর" },
  flag: { src: "/sections/Bangladesh.jpg", alt: "উড়ন্ত লাল-সবুজ পতাকা" },
} satisfies Record<string, Photo>;

export const P = {
  sundarbans: photo("sundarbans", LOCAL.mangroveBoat),
  tiger: photo("tiger", LOCAL.mangroveBoat),
  coxsbazar: photo("coxsbazar", LOCAL.sailboat),
  stmartin: photo("stmartin", LOCAL.sailboat),
  bandarban: photo("bandarban", LOCAL.lakeHouse),
  sajek: photo("sajek", LOCAL.lakeHouse),
  kaptai: photo("kaptai", LOCAL.lakeHouse),
  teagarden: photo("teagarden", LOCAL.plough),
  ratargul: photo("ratargul", LOCAL.canalBoat),
  haor: photo("haor", LOCAL.canalBoat),
  jaflong: photo("jaflong", LOCAL.lakeHouse),
  river: photo("river", LOCAL.sailboat),
  village: photo("village", LOCAL.harvestDusk),
  mustard: photo("mustard", LOCAL.mustardGirls),
  monsoon: photo("monsoon", LOCAL.canalBoat),
  kashful: photo("kashful", LOCAL.harvestDusk),
  winterfog: photo("winterfog", LOCAL.elders),
  shimul: photo("shimul", LOCAL.sunsetCart),
  shaheedminar: photo("shaheedminar", LOCAL.flag),
  smritisoudho: photo("smritisoudho", LOCAL.flag),
  paharpur: photo("paharpur", LOCAL.threshing),
  sixtydome: photo("sixtydome", LOCAL.threshing),
  lalbagh: photo("lalbagh", LOCAL.flag),
  ahsanmanzil: photo("ahsanmanzil", LOCAL.flag),
  mahasthan: photo("mahasthan", LOCAL.threshing),
  padmabridge: photo("padmabridge", LOCAL.sailboat),
  boishakh: photo("boishakh", LOCAL.flag),
  jamdani: photo("jamdani", LOCAL.flag),
  rickshaw: photo("rickshaw", LOCAL.flag),
  baul: photo("baul", LOCAL.sunsetCart),
  nakshikantha: photo("nakshikantha", LOCAL.flag),
  surrender1971: photo("surrender1971", LOCAL.flag),
  language1952: photo("language1952", LOCAL.flag),
  harvestDusk: LOCAL.harvestDusk,
  sailboat: LOCAL.sailboat,
  elders: LOCAL.elders,
  mustardGirls: LOCAL.mustardGirls,
  mangroveBoat: LOCAL.mangroveBoat,
  threshing: LOCAL.threshing,
  sunsetCart: LOCAL.sunsetCart,
  lakeHouse: LOCAL.lakeHouse,
  canalBoat: LOCAL.canalBoat,
  plough: LOCAL.plough,
  flag: LOCAL.flag,
};

/** Portraits are optional: a person without one gets a monogram. */
export const PORTRAITS: Partial<Record<string, Photo>> = {
  tagore: commonsPhotos.tagore,
  nazrul: commonsPhotos.nazrul,
  lalon: commonsPhotos.lalon,
  jibanananda: commonsPhotos.jibanananda,
  rokeya: commonsPhotos.rokeya,
  jcbose: commonsPhotos.jcbose,
  snbose: commonsPhotos.snbose,
  fazlurkhan: commonsPhotos.fazlurkhan,
  jasimuddin: commonsPhotos.jasimuddin,
};

/* ── Hero ────────────────────────────────────────────────────────────── */

/*
 * No `src`: /video/musicforhero.mp4 was considered and rejected — it is
 * a third-party music video (it opens on a "Hotbox Entertainment
 * presents" card), so it cannot be presented as this page's own film.
 */
export const heroFilm: Film = {
  title: "My Golden Bengal",
  titleBn: "আমার সোনার বাংলা",
  brief: "নদী, মাঠ, পাহাড়, সমুদ্র আর মানুষের মুখে বাংলাদেশ — পাঁচ মিনিটে পুরো দেশের এক আবেগময় যাত্রা।",
  poster: P.village,
};

export const heroFacts = [
  { value: "৮", label: "বিভাগ" },
  { value: "৬৪", label: "জেলা" },
  { value: "১৭.৬ কোটি", label: "মানুষ (বিশ্বব্যাংক, ২০২৫)" },
  { value: "৯০৭", label: "নদী (NRCC খসড়া তালিকা)" },
  { value: "৬", label: "ঋতু" },
];

/* ── History — eight chapters ────────────────────────────────────────── */

export interface HistoryChapter {
  id: string;
  number: string;
  era: string;
  years: string;
  title: string;
  /** One sentence set large — the chapter in a breath. */
  lede: string;
  paragraphs: string[];
  facts: { label: string; value: string }[];
  quote?: { text: string; by: string };
  /** What a visitor can still see today, and where. */
  today: string;
  /** 2–3 photos for the chapter's carousel; the first is the lead. */
  photos: Photo[];
  /** Red for the chapters of loss and struggle. */
  tone: "green" | "red";
}

/** Photos by value or by Commons key; keys that were not fetched drop out. */
function gallery(...items: (Photo | string)[]): Photo[] {
  return items.flatMap((i) => {
    const p = typeof i === "string" ? commonsPhotos[i] : i;
    return p ? [p] : [];
  });
}

export const historyChapters: HistoryChapter[] = [
  {
    id: "pundranagar",
    number: "০১",
    era: "প্রাচীন বাংলা",
    years: "খ্রিস্টপূর্ব ৩য় শতক",
    title: "পুণ্ড্রনগর — সভ্যতার ভোর",
    lede: "গঙ্গা আর ব্রহ্মপুত্রের পলিমাটিতে আড়াই হাজার বছরেরও আগে গড়ে উঠেছিল নগর, বাণিজ্য আর লিখিত ইতিহাস।",
    paragraphs: [
      "বগুড়ার করতোয়া নদীর তীরে মহাস্থানগড় — প্রাচীন পুণ্ড্রনগরের ধ্বংসাবশেষ। এখানে পাওয়া ‘মহাস্থান ব্রাহ্মী লিপি’ এ অঞ্চলে পাওয়া প্রাচীনতম শিলালিপিগুলোর একটি; তাতে দুর্ভিক্ষের সময় প্রজাদের সাহায্যের নির্দেশ লেখা ছিল।",
      "নরসিংদীর উয়ারী-বটেশ্বরে মাটি খুঁড়ে মিলেছে দুর্গনগর, রাস্তা, মুদ্রা আর দূরদেশের পুঁতি — প্রমাণ করে যে এই বদ্বীপ বহু আগেই দূর সমুদ্রপথের বাণিজ্যে যুক্ত ছিল।",
    ],
    facts: [
      { label: "স্থান", value: "মহাস্থানগড়, বগুড়া" },
      { label: "প্রাচীনতম লিপি", value: "মহাস্থান ব্রাহ্মী লিপি" },
      { label: "সমসাময়িক বসতি", value: "উয়ারী-বটেশ্বর, নরসিংদী" },
    ],
    photos: gallery(P.mahasthan, "mahasthan_b", "mahasthan_c"),
    today: "আজ মহাস্থানগড়ে হাঁটলে দেখা যায় প্রাচীন নগরপ্রাচীর, গোকুল মেধ আর মহাস্থান জাদুঘর — বগুড়া শহর থেকে উত্তরে অল্প দূরত্বে।",
    tone: "green",
  },
  {
    id: "pala",
    number: "০২",
    era: "পাল যুগ",
    years: "৮ম – ১২শ শতক",
    title: "জ্ঞানের আলো — সোমপুর মহাবিহার",
    lede: "বাংলার মানুষ নিজেরাই রাজা বেছে নিয়েছিল — আর সেই পাল রাজারা বাংলাকে বানিয়েছিলেন এশিয়ার জ্ঞানচর্চার কেন্দ্র।",
    paragraphs: [
      "অরাজকতার ‘মাৎস্যন্যায়’ শেষ করতে আনুমানিক ৭৫০ খ্রিস্টাব্দে প্রধানেরা গোপালকে রাজা নির্বাচন করেন। তাঁর উত্তরসূরি ধর্মপাল নির্মাণ করেন পাহাড়পুরের সোমপুর মহাবিহার — হিমালয়ের দক্ষিণে সবচেয়ে বড় বৌদ্ধ বিহারগুলোর একটি, যেখানে দূরদেশ থেকে শিক্ষার্থীরা আসতেন।",
      "এই যুগেই বিক্রমপুরে জন্ম নেন অতীশ দীপঙ্কর, যিনি জ্ঞান নিয়ে পৌঁছেছিলেন তিব্বতে। আর বৌদ্ধ সাধকদের লেখা ‘চর্যাপদ’ — বাংলা ভাষার প্রাচীনতম সাহিত্যিক নিদর্শন।",
    ],
    facts: [
      { label: "প্রতিষ্ঠা", value: "গোপাল, আনু. ৭৫০ খ্রি." },
      { label: "ইউনেস্কো বিশ্ব ঐতিহ্য", value: "১৯৮৫" },
      { label: "প্রাচীনতম বাংলা সাহিত্য", value: "চর্যাপদ" },
    ],
    photos: gallery(P.paharpur, "paharpur_b", "paharpur_c"),
    today: "নওগাঁর পাহাড়পুরে বিহারের কেন্দ্রীয় মন্দির, চারপাশের ভিক্ষুকক্ষের সারি আর দেয়ালের পোড়ামাটির ফলকচিত্র আজও দাঁড়িয়ে; পাশেই আছে প্রত্নতাত্ত্বিক জাদুঘর।",
    tone: "green",
  },
  {
    id: "sultanate",
    number: "০৩",
    era: "সুলতানি আমল",
    years: "১৩৫২ – ১৫৭৬",
    title: "এক নামে বাংলা — শাহ-ই-বাঙ্গালাহ",
    lede: "প্রথমবারের মতো এই ভূখণ্ডের সব অঞ্চল এক শাসনে এল, আর তার নাম হলো ‘বাঙ্গালাহ’।",
    paragraphs: [
      "১৩৫২ সালে শামসুদ্দীন ইলিয়াস শাহ লখনৌতি, সাতগাঁও আর সোনারগাঁওকে একত্র করে ‘শাহ-ই-বাঙ্গালাহ’ উপাধি নেন। প্রায় দুই শতাব্দী স্বাধীন বাংলা সালতানাত ছিল উপমহাদেশের সবচেয়ে সমৃদ্ধ রাজ্যগুলোর একটি — মসলিন, চাল আর চিনির বাণিজ্যে।",
      "হোসেন শাহী সুলতানদের পৃষ্ঠপোষকতায় বাংলা ভাষায় লেখা হয় মহাকাব্যের অনুবাদ আর মঙ্গলকাব্য। দক্ষিণে খান জাহান আলী গড়ে তোলেন খলিফাতাবাদ — আজকের বাগেরহাট, যার ষাট গম্বুজ মসজিদ বিশ্ব ঐতিহ্য।",
    ],
    facts: [
      { label: "একীকরণ", value: "১৩৫২, ইলিয়াস শাহ" },
      { label: "স্বর্ণযুগ", value: "হোসেন শাহী আমল" },
      { label: "স্থাপত্য", value: "ষাট গম্বুজ মসজিদ, বাগেরহাট" },
    ],
    photos: gallery(P.sixtydome, "sixtydome_b", "sixtydome_c"),
    today: "বাগেরহাটে ষাট গম্বুজ মসজিদ ঘিরে ছড়িয়ে আছে খান জাহান আলীর মাজার আর অনেক মধ্যযুগীয় মসজিদ — ইউনেস্কো একে বলে ‘ঐতিহাসিক মসজিদের শহর বাগেরহাট’।",
    tone: "green",
  },
  {
    id: "mughal",
    number: "০৪",
    era: "মুঘল আমল",
    years: "১৫৭৬ – ১৭৫৭",
    title: "জাহাঙ্গীরনগর — মসলিনের রাজধানী",
    lede: "বারো ভূঁইয়ার প্রতিরোধ পেরিয়ে এল মুঘল শাসন — আর ঢাকা হয়ে উঠল বিশ্ববাণিজ্যের এক নাম।",
    paragraphs: [
      "মুঘলরা বাংলা জয় করলেও ঈসা খাঁর নেতৃত্বে বারো ভূঁইয়ারা বহু বছর লড়াই চালিয়ে যান। ১৬১০ সালে সুবেদার ইসলাম খান ঢাকাকে বাংলার রাজধানী করেন, নাম দেন জাহাঙ্গীরনগর।",
      "ঢাকার মসলিন তখন এত সূক্ষ্ম যে তার কিংবদন্তি পৌঁছেছিল ইউরোপ পর্যন্ত। ১৬৭৮ সালে শুরু হয় লালবাগ কেল্লার নির্মাণ — অসমাপ্ত থেকেও যা আজ পুরান ঢাকার সবচেয়ে চেনা মুখ।",
    ],
    facts: [
      { label: "প্রতিরোধ", value: "বারো ভূঁইয়া, ঈসা খাঁ" },
      { label: "ঢাকা রাজধানী", value: "১৬১০" },
      { label: "লালবাগ কেল্লা", value: "নির্মাণ শুরু ১৬৭৮" },
    ],
    photos: gallery(P.lalbagh, "lalbagh_b"),
    today: "পুরান ঢাকার লালবাগ কেল্লায় আছে পরী বিবির সমাধি, দরবার হল আর হাম্মামখানা; কাছেই বড় কাটরা আর ছোট কাটরার ধ্বংসাবশেষ মুঘল ঢাকার সাক্ষী।",
    tone: "green",
  },
  {
    id: "british",
    number: "০৫",
    era: "ব্রিটিশ আমল",
    years: "১৭৫৭ – ১৯৪৭",
    title: "পলাশী থেকে দুই শতাব্দীর শোষণ",
    lede: "এক বিকেলের যুদ্ধে হারানো স্বাধীনতা ফিরে পেতে লেগেছিল প্রায় দুশো বছর।",
    paragraphs: [
      "২৩ জুন ১৭৫৭, পলাশীর আমবাগানে নবাব সিরাজউদ্দৌলার পরাজয়ে বাংলার শাসন চলে যায় ইস্ট ইন্ডিয়া কোম্পানির হাতে। ১৭৭০-এর ‘ছিয়াত্তরের মন্বন্তর’, চিরস্থায়ী বন্দোবস্ত আর নীলকরদের অত্যাচার — সমৃদ্ধ বাংলা নিঃস্ব হতে থাকে।",
      "তবু মানুষ থেমে থাকেনি: নীল বিদ্রোহ, ১৯০৫-এর বঙ্গভঙ্গবিরোধী আন্দোলন আর ১৯২১ সালে ঢাকা বিশ্ববিদ্যালয়ের প্রতিষ্ঠা — এখান থেকেই উঠে আসে পরের প্রজন্মের নেতৃত্ব। ১৯৪৩-এর দুর্ভিক্ষে প্রাণ হারান লাখো মানুষ।",
    ],
    facts: [
      { label: "পলাশীর যুদ্ধ", value: "২৩ জুন ১৭৫৭" },
      { label: "বঙ্গভঙ্গ ও রদ", value: "১৯০৫ – ১৯১১" },
      { label: "ঢাকা বিশ্ববিদ্যালয়", value: "১৯২১" },
    ],
    photos: gallery(P.ahsanmanzil, "ahsanmanzil_b", "ahsanmanzil_c"),
    today: "বুড়িগঙ্গার তীরে ঢাকার নবাবদের গোলাপি প্রাসাদ আহসান মঞ্জিল আজ জাদুঘর; কার্জন হল আর ঢাকা বিশ্ববিদ্যালয় চত্বরে দাঁড়িয়ে আছে সেই যুগের স্থাপত্য।",
    tone: "red",
  },
  {
    id: "language",
    number: "০৬",
    era: "ভাষা আন্দোলন",
    years: "১৯৪৮ – ১৯৫২",
    title: "মায়ের ভাষার জন্য রক্ত",
    lede: "পৃথিবীতে খুব কম জাতি আছে, যারা নিজের ভাষার জন্য বুকের রক্ত দিয়েছে। আমরা তাদের একটি।",
    paragraphs: [
      "১৯৪৮ সালে ঢাকায় ঘোষণা আসে — উর্দুই হবে পাকিস্তানের একমাত্র রাষ্ট্রভাষা। সেদিনই ছাত্ররা প্রতিবাদ করে। চার বছর পর, ২১ ফেব্রুয়ারি ১৯৫২, ১৪৪ ধারা ভেঙে মিছিল বের হয়; ঢাকা মেডিকেল কলেজের সামনে পুলিশের গুলিতে শহীদ হন সালাম, বরকত, রফিক, জব্বার, শফিউরসহ অনেকে।",
      "রাতারাতি ছাত্ররা গড়ে তোলে প্রথম শহীদ মিনার। ১৯৫৬ সালে বাংলা রাষ্ট্রভাষার স্বীকৃতি পায়, আর ১৯৯৯ সালে ইউনেস্কো ২১ ফেব্রুয়ারিকে ঘোষণা করে ‘আন্তর্জাতিক মাতৃভাষা দিবস’ — আজ পৃথিবীর সব দেশ এই দিনটি পালন করে।",
    ],
    facts: [
      { label: "শহীদ দিবস", value: "২১ ফেব্রুয়ারি ১৯৫২" },
      { label: "রাষ্ট্রভাষার স্বীকৃতি", value: "১৯৫৬" },
      { label: "আন্তর্জাতিক মাতৃভাষা দিবস", value: "১৯৯৯" },
    ],
    quote: { text: "আমার ভাইয়ের রক্তে রাঙানো একুশে ফেব্রুয়ারি, আমি কি ভুলিতে পারি", by: "আবদুল গাফ্‌ফার চৌধুরী" },
    photos: gallery(P.shaheedminar, "shaheedminar_b"),
    today: "প্রতি বছর ২১ ফেব্রুয়ারির প্রথম প্রহরে খালি পায়ে ফুল হাতে মানুষ আসে কেন্দ্রীয় শহীদ মিনারে — প্রভাতফেরি; আর পুরো ফেব্রুয়ারি জুড়ে চলে অমর একুশে বইমেলা।",
    tone: "red",
  },
  {
    id: "liberation",
    number: "০৭",
    era: "মুক্তিযুদ্ধ",
    years: "১৯৬৬ – ১৯৭১",
    title: "নয় মাসের মুক্তিযুদ্ধ",
    lede: "ছয় দফা থেকে ২৬ মার্চ — একটি জাতি বুঝে নিল, স্বাধীনতা ছাড়া আর কোনো পথ নেই।",
    paragraphs: [
      "১৯৬৬-র ছয় দফা, ১৯৬৯-এর গণঅভ্যুত্থান আর ১৯৭০-এর নির্বাচনে নিরঙ্কুশ রায় — তবু ক্ষমতা দেওয়া হলো না। ৭ মার্চের ভাষণ জাতিকে প্রস্তুত করল; ২৫ মার্চের কালরাতে ‘অপারেশন সার্চলাইট’-এর গণহত্যার পর ২৬ মার্চ ঘোষিত হলো স্বাধীনতা।",
      "১৭ এপ্রিল মুজিবনগরে গঠিত হলো প্রবাসী সরকার; এগারোটি সেক্টরে ভাগ হয়ে লড়লেন মুক্তিযোদ্ধারা — কৃষক, ছাত্র, শ্রমিক, নারী, সৈনিক। প্রায় এক কোটি মানুষ শরণার্থী হয়ে দেশ ছাড়তে বাধ্য হন; গ্রামে গ্রামে আশ্রয় দিয়েছে সাধারণ মানুষ।",
    ],
    facts: [
      { label: "স্বাধীনতা ঘোষণা", value: "২৬ মার্চ ১৯৭১" },
      { label: "মুজিবনগর সরকার", value: "১৭ এপ্রিল ১৯৭১" },
      { label: "রণাঙ্গন", value: "১১টি সেক্টর" },
    ],
    quote: { text: "এবারের সংগ্রাম আমাদের মুক্তির সংগ্রাম, এবারের সংগ্রাম স্বাধীনতার সংগ্রাম।", by: "শেখ মুজিবুর রহমান, ৭ মার্চ ১৯৭১" },
    photos: gallery(P.smritisoudho, "smritisoudho_b"),
    today: "সাভারের জাতীয় স্মৃতিসৌধের সাত জোড়া ত্রিভুজাকার দেয়াল ১৯৫২ থেকে ১৯৭১ পর্যন্ত স্বাধীনতার সাতটি পর্বের প্রতীক; মেহেরপুরের মুজিবনগর আর ঢাকার মুক্তিযুদ্ধ জাদুঘরে রাখা আছে সেই দিনগুলোর স্মৃতি।",
    tone: "red",
  },
  {
    id: "victory",
    number: "০৮",
    era: "বিজয়",
    years: "১৬ ডিসেম্বর ১৯৭১",
    title: "লাল-সবুজের বিজয়",
    lede: "লাখো শহীদের রক্তে কেনা ভোর — পৃথিবীর মানচিত্রে জন্ম নিল বাংলাদেশ।",
    paragraphs: [
      "বিজয়ের মাত্র দুদিন আগে, ১৪ ডিসেম্বর, দেশের শ্রেষ্ঠ শিক্ষক, চিকিৎসক, সাংবাদিক আর শিল্পীদের ধরে নিয়ে হত্যা করা হয় — জাতিকে মেধাশূন্য করার শেষ চেষ্টা। দুদিন পর, ১৬ ডিসেম্বর, ঢাকার রেসকোর্স ময়দানে আত্মসমর্পণ করে পাকিস্তানি বাহিনী।",
      "১০ জানুয়ারি ১৯৭২ স্বাধীন দেশে ফেরেন বঙ্গবন্ধু; ৪ নভেম্বর ১৯৭২ গৃহীত হয় সংবিধান। যুদ্ধবিধ্বস্ত, প্রায় শূন্য হাতে শুরু — সেখান থেকেই শুরু হয় আমাদের অগ্রযাত্রা।",
    ],
    facts: [
      { label: "শহীদ বুদ্ধিজীবী দিবস", value: "১৪ ডিসেম্বর" },
      { label: "বিজয় দিবস", value: "১৬ ডিসেম্বর ১৯৭১" },
      { label: "সংবিধান গৃহীত", value: "৪ নভেম্বর ১৯৭২" },
    ],
    photos: gallery(P.surrender1971, P.flag),
    today: "ঢাকার সোহরাওয়ার্দী উদ্যানে — যেখানে আত্মসমর্পণ হয়েছিল — আজ দাঁড়িয়ে আছে স্বাধীনতা স্তম্ভ আর শিখা চিরন্তন; রায়েরবাজার বধ্যভূমিতে স্মরণ করা হয় শহীদ বুদ্ধিজীবীদের।",
    tone: "green",
  },
];


export const historyFilm: Film = {
  title: "From Pundranagar to Victory",
  titleBn: "পুণ্ড্রনগর থেকে বিজয় দিবস",
  brief: "আড়াই হাজার বছরের বাংলা — প্রাচীন নগর, সুলতানি ও মুঘল ঐশ্বর্য, ঔপনিবেশিক শোষণ, ভাষার লড়াই আর একাত্তরের বিজয় — এক ভিডিওতে।",
  poster: P.smritisoudho,
};

/* ── Divisions & map ─────────────────────────────────────────────────── */

export interface Division {
  id: "dhaka" | "chattogram" | "rajshahi" | "khulna" | "barishal" | "sylhet" | "rangpur" | "mymensingh";
  nameBn: string;
  nameEn: string;
  districts: number;
  tagline: string;
  body: string;
  highlights: string[];
  photo: Photo;
}

export const divisions: Division[] = [
  {
    id: "dhaka", nameBn: "ঢাকা", nameEn: "Dhaka", districts: 13,
    tagline: "রাজধানী, ইতিহাস আর মানুষের স্রোত",
    body: "চারশো বছরের পুরনো রাজধানী — লালবাগ কেল্লা, আহসান মঞ্জিল, শহীদ মিনার আর বুড়িগঙ্গার তীরের পুরান ঢাকা।",
    highlights: ["লালবাগ কেল্লা", "আহসান মঞ্জিল", "শহীদ মিনার", "জাতীয় স্মৃতিসৌধ"],
    photo: P.lalbagh,
  },
  {
    id: "chattogram", nameBn: "চট্টগ্রাম", nameEn: "Chattogram", districts: 11,
    tagline: "পাহাড়, সমুদ্র আর দ্বীপ",
    body: "কক্সবাজারের দীর্ঘ সৈকত, প্রবাল দ্বীপ সেন্ট মার্টিন, বান্দরবান-রাঙামাটির মেঘছোঁয়া পাহাড় আর দেশের প্রধান সমুদ্রবন্দর।",
    highlights: ["কক্সবাজার", "সেন্ট মার্টিন", "সাজেক", "কাপ্তাই হ্রদ", "বান্দরবান"],
    photo: P.coxsbazar,
  },
  {
    id: "rajshahi", nameBn: "রাজশাহী", nameEn: "Rajshahi", districts: 8,
    tagline: "আম, রেশম আর প্রাচীন সভ্যতা",
    body: "পাহাড়পুরের বৌদ্ধ বিহার, মহাস্থানগড়ের পুণ্ড্রনগর, বরেন্দ্রভূমির লাল মাটি আর পদ্মার পাড়ের আমের বাগান।",
    highlights: ["পাহাড়পুর", "মহাস্থানগড়", "পদ্মার চর", "আমের বাগান"],
    photo: P.paharpur,
  },
  {
    id: "khulna", nameBn: "খুলনা", nameEn: "Khulna", districts: 10,
    tagline: "সুন্দরবন আর বাঘের দেশ",
    body: "পৃথিবীর বৃহত্তম ম্যানগ্রোভ বন সুন্দরবন, রয়েল বেঙ্গল টাইগার আর বাগেরহাটের ষাট গম্বুজ মসজিদ — দুটি ইউনেস্কো বিশ্ব ঐতিহ্য এক বিভাগে।",
    highlights: ["সুন্দরবন", "ষাট গম্বুজ মসজিদ", "রয়েল বেঙ্গল টাইগার"],
    photo: P.sundarbans,
  },
  {
    id: "barishal", nameBn: "বরিশাল", nameEn: "Barishal", districts: 6,
    tagline: "নদী, খাল আর ভাসমান হাট",
    body: "‘বাংলার ভেনিস’ — নদী আর খালের জালে ঘেরা, পেয়ারার ভাসমান হাট আর কুয়াকাটার সৈকতে একই জায়গা থেকে সূর্যোদয়-সূর্যাস্ত।",
    highlights: ["কুয়াকাটা", "ভাসমান পেয়ারা হাট", "কীর্তনখোলা নদী"],
    photo: P.river,
  },
  {
    id: "sylhet", nameBn: "সিলেট", nameEn: "Sylhet", districts: 4,
    tagline: "চা-বাগান, হাওর আর জলাবন",
    body: "শ্রীমঙ্গলের ঢেউখেলানো চা-বাগান, রাতারগুলের জলাবন, টাঙ্গুয়ার হাওর আর জাফলংয়ের স্বচ্ছ পাথুরে নদী।",
    highlights: ["শ্রীমঙ্গল", "রাতারগুল", "টাঙ্গুয়ার হাওর", "জাফলং"],
    photo: P.teagarden,
  },
  {
    id: "rangpur", nameBn: "রংপুর", nameEn: "Rangpur", districts: 8,
    tagline: "ভাওয়াইয়ার সুর আর তিস্তার চর",
    body: "উত্তরের বিস্তীর্ণ সমতল — তিস্তার চর, ভাওয়াইয়া গান, তাজহাট জমিদারবাড়ি আর দিনাজপুরের কান্তজীউ মন্দির।",
    highlights: ["তিস্তা", "কান্তজীউ মন্দির", "তাজহাট", "ভাওয়াইয়া"],
    photo: P.mustard,
  },
  {
    id: "mymensingh", nameBn: "ময়মনসিংহ", nameEn: "Mymensingh", districts: 4,
    tagline: "ব্রহ্মপুত্র, গারো পাহাড় আর পালাগান",
    body: "পুরনো ব্রহ্মপুত্রের তীর, গারো পাহাড়ের পাদদেশ আর ‘মৈমনসিংহ গীতিকা’র পালাগানের জন্মভূমি।",
    highlights: ["ব্রহ্মপুত্র", "গারো পাহাড়", "মৈমনসিংহ গীতিকা"],
    photo: P.village,
  },
];

export interface Landmark {
  id: string;
  nameBn: string;
  lat: number;
  lon: number;
  kind: "sea" | "forest" | "hill" | "heritage" | "water" | "city";
  photo: Photo;
}

export const landmarks: Landmark[] = [
  { id: "coxsbazar", nameBn: "কক্সবাজার", lat: 21.43, lon: 91.98, kind: "sea", photo: P.coxsbazar },
  { id: "stmartin", nameBn: "সেন্ট মার্টিন", lat: 20.62, lon: 92.32, kind: "sea", photo: P.stmartin },
  { id: "sundarbans", nameBn: "সুন্দরবন", lat: 21.95, lon: 89.18, kind: "forest", photo: P.sundarbans },
  { id: "sajek", nameBn: "সাজেক", lat: 23.38, lon: 92.29, kind: "hill", photo: P.sajek },
  { id: "bandarban", nameBn: "বান্দরবান", lat: 22.19, lon: 92.22, kind: "hill", photo: P.bandarban },
  { id: "srimangal", nameBn: "শ্রীমঙ্গল", lat: 24.31, lon: 91.73, kind: "forest", photo: P.teagarden },
  { id: "tanguar", nameBn: "টাঙ্গুয়ার হাওর", lat: 25.15, lon: 91.07, kind: "water", photo: P.haor },
  { id: "paharpur", nameBn: "পাহাড়পুর", lat: 25.03, lon: 88.98, kind: "heritage", photo: P.paharpur },
  { id: "bagerhat", nameBn: "ষাট গম্বুজ", lat: 22.67, lon: 89.74, kind: "heritage", photo: P.sixtydome },
  { id: "kuakata", nameBn: "কুয়াকাটা", lat: 21.82, lon: 90.12, kind: "sea", photo: P.river },
];

/* ── Nature ──────────────────────────────────────────────────────────── */

export interface NatureItem {
  id: string;
  kicker: string;
  title: string;
  body: string;
  photo: Photo;
  /** Bento tile size. */
  span: "hero" | "tall" | "wide" | "base" | "full";
}

export const nature: NatureItem[] = [
  { id: "sundarbans", kicker: "খুলনা · ইউনেস্কো ১৯৯৭", title: "সুন্দরবন", body: "পৃথিবীর বৃহত্তম ম্যানগ্রোভ বন — জোয়ার-ভাটায় বাঁচা বন, রয়েল বেঙ্গল টাইগার, চিত্রা হরিণ আর মৌয়ালদের জীবন।", photo: P.sundarbans, span: "hero" },
  { id: "cox", kicker: "চট্টগ্রাম", title: "কক্সবাজার", body: "প্রায় ১২০ কিলোমিটারের অবিচ্ছিন্ন বালুকাবেলা — বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্রসৈকতগুলোর একটি।", photo: P.coxsbazar, span: "tall" },
  { id: "hills", kicker: "পার্বত্য চট্টগ্রাম", title: "মেঘের দেশে পাহাড়", body: "বান্দরবানের চূড়া, সাজেকের মেঘ আর পাহাড়ি জনগোষ্ঠীর বৈচিত্র্যময় জীবন।", photo: P.bandarban, span: "base" },
  { id: "tea", kicker: "সিলেট", title: "চা-বাগানের সবুজ ঢেউ", body: "শ্রীমঙ্গল — ‘চায়ের রাজধানী’ — যেখানে টিলা জুড়ে সবুজের গালিচা।", photo: P.teagarden, span: "base" },
  { id: "rivers", kicker: "নদীমাতৃক দেশ", title: "পদ্মা, মেঘনা, যমুনা", body: "নদীর জালে বোনা দেশ; নদী রক্ষা কমিশনের খসড়া তালিকায় ৯০৭টি নদী। নৌকা, মাঝি আর ভাটিয়ালি গান।", photo: P.river, span: "wide" },
  { id: "haor", kicker: "সুনামগঞ্জ · রামসার সাইট", title: "টাঙ্গুয়ার হাওর", body: "বর্ষায় সমুদ্রের মতো বিস্তৃত জলরাশি, শীতে পরিযায়ী পাখির মেলা।", photo: P.haor, span: "base" },
  { id: "island", kicker: "বঙ্গোপসাগর", title: "সেন্ট মার্টিন", body: "দেশের একমাত্র প্রবাল দ্বীপ — নীল জল আর নারকেল বীথি।", photo: P.stmartin, span: "base" },
  { id: "fields", kicker: "সমতল দিগন্ত মাঠ", title: "যতদূর চোখ যায় সবুজ", body: "দিগন্তজোড়া ধানক্ষেত, আলপথ, খেজুর গাছ আর সন্ধ্যার আকাশ — বাংলার চিরচেনা গ্রাম।", photo: P.village, span: "full" },
];

export const natureFilm: Film = {
  title: "Rupashi Bangla",
  titleBn: "রূপসী বাংলা",
  brief: "সুন্দরবন থেকে সাজেক, কক্সবাজার থেকে টাঙ্গুয়ার হাওর — ড্রোনে দেখা বাংলাদেশের প্রকৃতি।",
  poster: P.sundarbans,
};

/* ── Seasons ─────────────────────────────────────────────────────────── */

export const seasons = [
  { name: "গ্রীষ্ম", months: "বৈশাখ – জ্যৈষ্ঠ", mood: "কালবৈশাখী, আম-কাঁঠালের মধুমাস", tone: "from-amber-500 to-orange-600", photo: P.sunsetCart },
  { name: "বর্ষা", months: "আষাঢ় – শ্রাবণ", mood: "ভরা নদী, কদমফুল আর টিনের চালে বৃষ্টির গান", tone: "from-sky-600 to-slate-700", photo: P.monsoon },
  { name: "শরৎ", months: "ভাদ্র – আশ্বিন", mood: "নীল আকাশে সাদা মেঘ, নদীর ধারে কাশফুল", tone: "from-sky-400 to-indigo-500", photo: P.kashful },
  { name: "হেমন্ত", months: "কার্তিক – অগ্রহায়ণ", mood: "সোনালি ধান আর নবান্নের উৎসব", tone: "from-yellow-500 to-amber-700", photo: P.threshing },
  { name: "শীত", months: "পৌষ – মাঘ", mood: "কুয়াশার চাদর, খেজুরের রস আর পিঠা-পুলি", tone: "from-slate-400 to-slate-700", photo: P.winterfog },
  { name: "বসন্ত", months: "ফাল্গুন – চৈত্র", mood: "শিমুল-পলাশের আগুন রং, কোকিলের ডাক", tone: "from-rose-500 to-red-700", photo: P.shimul },
];

/* ── Culture ─────────────────────────────────────────────────────────── */

/**
 * UNESCO Intangible Cultural Heritage inscriptions for Bangladesh.
 * An item without a photo of *that* craft gets a patterned tile rather
 * than a photo of a different one.
 */
export const unescoHeritage: { year: string; title: string; photo?: Photo }[] = [
  { year: "২০০৮", title: "বাউল গান", photo: commonsPhotos.baul },
  { year: "২০১৩", title: "জামদানি বয়নশিল্প", photo: commonsPhotos.jamdani },
  { year: "২০১৬", title: "পহেলা বৈশাখের শোভাযাত্রা", photo: commonsPhotos.boishakh },
  { year: "২০১৭", title: "সিলেটের শীতলপাটি" },
  { year: "২০২৩", title: "ঢাকার রিকশা ও রিকশাচিত্র", photo: commonsPhotos.rickshaw },
  { year: "২০২৫", title: "টাঙ্গাইল শাড়ির বয়নশিল্প" },
];

export const cultureHighlights = [
  { icon: "celebration", title: "পহেলা বৈশাখ", body: "বাংলা নববর্ষ — ধর্ম-বর্ণ নির্বিশেষে সবার উৎসব, ভোরের গান আর রঙিন শোভাযাত্রা।" },
  { icon: "menu_book", title: "অমর একুশে বইমেলা", body: "পুরো ফেব্রুয়ারি জুড়ে ভাষাশহীদদের স্মরণে বাংলা একাডেমির বইমেলা।" },
  { icon: "rowing", title: "নৌকাবাইচ", body: "বর্ষার নদীতে সারিবদ্ধ মাঝির গান আর সরু লম্বা নৌকার দৌড়।" },
  { icon: "set_meal", title: "ইলিশ আর পিঠা", body: "জাতীয় মাছ ইলিশ, শীতের ভাপা-চিতই পিঠা আর নবান্নের পায়েস।" },
  { icon: "draw", title: "নকশিকাঁথা", body: "পুরনো শাড়ির সুতোয় গ্রামের নারীর হাতে বোনা গল্প — জসীমউদ্‌দীনের ‘নকশী কাঁথার মাঠ’।" },
  { icon: "palette", title: "রিকশাচিত্র", body: "ঢাকার রাস্তায় চলমান আর্ট গ্যালারি — উজ্জ্বল রঙে সিনেমা, প্রকৃতি আর স্বপ্ন।" },
];

export const musicTraditions = [
  { name: "বাউল ও লালনগীতি", body: "দেহতত্ত্ব আর মানবতার গান — একতারা হাতে পথের সাধক।" },
  { name: "ভাটিয়ালি", body: "ভাটির টানে নৌকা বাইতে বাইতে মাঝির দরাজ গলার সুর।" },
  { name: "ভাওয়াইয়া", body: "উত্তরবঙ্গের গরুর গাড়ির গাড়োয়ানের বিরহী গান।" },
  { name: "রবীন্দ্র ও নজরুলসংগীত", body: "দুই কবির হাজারো গান — প্রেম, প্রকৃতি, দ্রোহ আর দেশ।" },
  { name: "জারি-সারি ও পালাগান", body: "গ্রামের আসরে কাহিনি আর সুরে বোনা লোকনাট্য।" },
];

export const cultureFilm: Film = {
  title: "Songs of the Soil",
  titleBn: "মাটির গান",
  brief: "বাউলের একতারা থেকে পহেলা বৈশাখের শোভাযাত্রা — বাংলার গান, উৎসব আর হাতের শিল্প।",
  poster: P.baul,
};

/* ── People ──────────────────────────────────────────────────────────── */

export interface Person {
  id: string;
  name: string;
  years: string;
  role: string;
  body: string;
  quote?: string;
  group: "poet" | "music" | "science";
}

export const people: Person[] = [
  { id: "tagore", group: "poet", name: "রবীন্দ্রনাথ ঠাকুর", years: "১৮৬১ – ১৯৪১", role: "বিশ্বকবি · সাহিত্যে নোবেল ১৯১৩", body: "এশিয়ার প্রথম নোবেলজয়ী; বাংলাদেশের জাতীয় সংগীতের রচয়িতা। শিলাইদহ-শাহজাদপুরের পদ্মাপাড়ে লিখেছেন অজস্র গান ও গল্প।", quote: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।" },
  { id: "nazrul", group: "poet", name: "কাজী নজরুল ইসলাম", years: "১৮৯৯ – ১৯৭৬", role: "জাতীয় কবি · বিদ্রোহী কবি", body: "অন্যায়ের বিরুদ্ধে দ্রোহ আর সাম্যের কবি; হাজারো গানের স্রষ্টা। কাণ্ডারী-ল্যাবের মূলমন্ত্র ‘কে আছ জোয়ান? হও আগুয়ান’ তাঁরই ‘কাণ্ডারী হুঁশিয়ার’ কবিতার পঙ্‌ক্তি।", quote: "বল বীর— বল উন্নত মম শির!" },
  { id: "lalon", group: "poet", name: "লালন সাঁই", years: "আনু. ১৭৭৪ – ১৮৯০", role: "বাউল সাধক · মানবতার কবি", body: "জাত-পাতের ঊর্ধ্বে মানুষের জয়গান গেয়েছেন কুষ্টিয়ার ছেঁউড়িয়ায়; তাঁর গান আজও বাউল দর্শনের প্রাণ।", quote: "সব লোকে কয় লালন কী জাত সংসারে।" },
  { id: "jibanananda", group: "poet", name: "জীবনানন্দ দাশ", years: "১৮৯৯ – ১৯৫৪", role: "রূপসী বাংলার কবি", body: "বরিশালের কবি; বাংলার প্রকৃতিকে তাঁর মতো করে আর কেউ আঁকেননি।", quote: "বাংলার মুখ আমি দেখিয়াছি, তাই আমি পৃথিবীর রূপ খুঁজিতে যাই না আর।" },
  { id: "jasimuddin", group: "poet", name: "জসীমউদ্‌দীন", years: "১৯০৩ – ১৯৭৬", role: "পল্লীকবি", body: "‘নকশী কাঁথার মাঠ’ আর ‘কবর’-এর কবি; গ্রামবাংলার মানুষের সুখ-দুঃখের কথাকার।" },
  { id: "rokeya", group: "poet", name: "বেগম রোকেয়া", years: "১৮৮০ – ১৯৩২", role: "নারী জাগরণের অগ্রদূত", body: "রংপুরের পায়রাবন্দে জন্ম; নারীশিক্ষার পথিকৃৎ, ‘সুলতানার স্বপ্ন’-এর লেখিকা।" },
  { id: "karim", group: "music", name: "শাহ আবদুল করিম", years: "১৯১৬ – ২০০৯", role: "বাউল সম্রাট", body: "সুনামগঞ্জের ভাটির মানুষের জীবন আর প্রেমের গান — ‘আগে কী সুন্দর দিন কাটাইতাম’।" },
  { id: "abbasuddin", group: "music", name: "আব্বাসউদ্দীন আহমদ", years: "১৯০১ – ১৯৫৯", role: "পল্লীগীতির কিংবদন্তি", body: "ভাওয়াইয়া আর ভাটিয়ালিকে গ্রামের আসর থেকে রেকর্ড আর বেতারে পৌঁছে দিয়েছেন।" },
  { id: "jcbose", group: "science", name: "জগদীশচন্দ্র বসু", years: "১৮৫৮ – ১৯৩৭", role: "বেতার গবেষণার পথিকৃৎ", body: "ময়মনসিংহে জন্ম; মাইক্রোওয়েভ ও বেতার তরঙ্গ নিয়ে অগ্রণী গবেষণা, আর ক্রেসকোগ্রাফ দিয়ে উদ্ভিদের সংবেদনশীলতা মাপা।" },
  { id: "snbose", group: "science", name: "সত্যেন্দ্রনাথ বসু", years: "১৮৯৪ – ১৯৭৪", role: "বোস–আইনস্টাইন পরিসংখ্যান", body: "ঢাকা বিশ্ববিদ্যালয়ে থাকাকালে ১৯২৪ সালে কোয়ান্টাম পরিসংখ্যানের যুগান্তকারী তত্ত্ব; ‘বোসন’ কণার নাম তাঁরই নামে।" },
  { id: "fazlurkhan", group: "science", name: "ফজলুর রহমান খান", years: "১৯২৯ – ১৯৮২", role: "গগনচুম্বী ভবনের স্থপতি-প্রকৌশলী", body: "টিউব-কাঠামোর উদ্ভাবক; শিকাগোর সিয়ার্স (উইলিস) টাওয়ার ও জন হ্যানকক সেন্টারের কাঠামো-নকশাকার।" },
  { id: "maqsudul", group: "science", name: "মাকসুদুল আলম", years: "১৯৫৪ – ২০১৪", role: "জিনোম বিজ্ঞানী", body: "২০১০ সালে দেশীয় গবেষক দল নিয়ে পাটের জিনোম সিকোয়েন্সিংয়ে নেতৃত্ব দেন।" },
  { id: "qadri", group: "science", name: "ফেরদৌসী কাদরী", years: "জন্ম ১৯৫১", role: "টিকা বিজ্ঞানী · ম্যাগসেসে ২০২১", body: "কলেরা ও টাইফয়েডের সাশ্রয়ী টিকা গবেষণায় অবদানের জন্য র‍্যামন ম্যাগসেসে পুরস্কার।" },
  { id: "yunus", group: "science", name: "মুহাম্মদ ইউনূস", years: "জন্ম ১৯৪০", role: "শান্তিতে নোবেল ২০০৬", body: "ক্ষুদ্রঋণের ধারণা ও গ্রামীণ ব্যাংকের জন্য গ্রামীণ ব্যাংকের সঙ্গে যৌথভাবে নোবেল শান্তি পুরস্কার।" },
];

export const peopleGroups = {
  poet: { label: "কবি, লেখক ও মনীষী", icon: "history_edu" },
  music: { label: "সংগীত", icon: "music_note" },
  science: { label: "বিজ্ঞান ও উদ্ভাবন", icon: "science" },
} as const;

/* ── Growth milestones (1971 → 2026) ─────────────────────────────────── */

export const milestones = [
  { year: "১৯৭২", title: "সংবিধান", body: "৪ নভেম্বর গৃহীত হয় বাংলাদেশের সংবিধান।" },
  { year: "১৯৭৪", title: "জাতিসংঘের সদস্যপদ", body: "১৭ সেপ্টেম্বর বাংলাদেশ জাতিসংঘের ১৩৬তম সদস্য হয়।" },
  { year: "১৯৯৯", title: "আন্তর্জাতিক মাতৃভাষা দিবস", body: "ইউনেস্কো ২১ ফেব্রুয়ারিকে বিশ্বজুড়ে মাতৃভাষা দিবস ঘোষণা করে।" },
  { year: "২০১৫", title: "নিম্ন-মধ্যম আয়ের দেশ", body: "বিশ্বব্যাংকের শ্রেণিবিন্যাসে বাংলাদেশ নিম্ন-মধ্যম আয়ের দেশে উন্নীত হয়।" },
  { year: "২০১৮", title: "মহাকাশে প্রথম স্যাটেলাইট", body: "১২ মে উৎক্ষেপণ করা হয় দেশের প্রথম যোগাযোগ উপগ্রহ।" },
  { year: "২০২২", title: "পদ্মা সেতু", body: "২৫ জুন নিজস্ব অর্থায়নে নির্মিত ৬.১৫ কিলোমিটারের পদ্মা সেতু চালু হয়।", photo: P.padmabridge },
  { year: "২০২৪", title: "ছাত্র-জনতার গণঅভ্যুত্থান", body: "জুলাই–আগস্টে ছাত্র-জনতার আন্দোলনে দেশে নতুন রাজনৈতিক অধ্যায়ের সূচনা।" },
  { year: "২০২৬", title: "স্বল্পোন্নত দেশ থেকে উত্তরণ", body: "জাতিসংঘের তালিকা থেকে উত্তরণের নির্ধারিত সময় ২৪ নভেম্বর ২০২৬; সরকার প্রস্তুতির জন্য তিন বছরের সময় চেয়েছে।" },
];

export const growthFilm: Film = {
  title: "1971 → 2026",
  titleBn: "শূন্য থেকে উত্থান",
  brief: "যুদ্ধবিধ্বস্ত এক দেশ থেকে পদ্মা সেতু আর মহাকাশ — পঞ্চান্ন বছরের অগ্রযাত্রার গল্প, সংখ্যায় আর মানুষের মুখে।",
  poster: P.padmabridge,
};

/* ── Sources for the non-World-Bank figures ─────────────────────────── */

export const facts = [
  { label: "নদীর সংখ্যা (৯০৭, খসড়া তালিকা)", source: "জাতীয় নদী রক্ষা কমিশন, via Prothom Alo", url: "https://en.prothomalo.com/environment/xyyqmcgwmo" },
  { label: "ইউনেস্কো অধরা সাংস্কৃতিক ঐতিহ্য", source: "UNESCO ICH / Wikipedia list", url: "https://en.wikipedia.org/wiki/List_of_Intangible_Cultural_Heritage_elements_in_Bangladesh" },
  { label: "টাঙ্গাইল শাড়ি, ২০২৫", source: "The Daily Star", url: "https://www.thedailystar.net/news/bangladesh/diplomacy/news/tangail-saree-wins-unesco-heritage-status-4054876" },
  { label: "স্বল্পোন্নত দেশ থেকে উত্তরণ, ২০২৬", source: "The Financial Express", url: "https://thefinancialexpress.com.bd/economy/ldc-graduation-deferral-decision-due-september" },
  { label: "মানচিত্রের সীমানা", source: "geoBoundaries (CC0)", url: "https://www.geoboundaries.org/" },
];
