/*
 * The home page's platform promotion: শিক্ষিতদের মিডিয়া, গবেষণাকোষ and
 * ক্লাসরুম, told as short films built from real screenshots of the pages
 * (public/platforms, captured from the demo account; nothing in them is
 * staged beyond the demo data the pages already show).
 *
 * Every claim names a feature the pages really have. Coordinates are CSS
 * pixels of the 1280-wide layout the screens were captured at, so a scene
 * can say "look at the skills panel" the way a designer would.
 */

/** A screenshot. `h` is its height in layout pixels at 1280 wide. */
export interface Screen {
  src: string;
  h: number;
  alt: string;
  /** Shown in the frame's address bar. */
  path: string;
}

/** The part of a screen in view: its top-left corner and the zoom (1 = the full 1280 width). */
export interface View {
  x: number;
  y: number;
  zoom: number;
}

export type ChipTone = "gold" | "white" | "green" | "ink";

export interface Chip {
  text: string;
  /** Where its centre sits on the screen, in layout pixels, at the scene's final view. */
  at: [number, number];
  tone: ChipTone;
  icon?: "check" | "star" | "spark" | "lock" | "send";
  /** Milliseconds into the scene. */
  delay: number;
  /** Type the text out, as if someone were entering it. */
  typed?: boolean;
}

export interface ShotStage {
  kind: "shot";
  screen: Screen;
  from: View;
  to: View;
  chips?: Chip[];
  /** A pointer gliding from one spot to another and clicking (layout pixels). */
  cursor?: { from: [number, number]; to: [number, number] };
  /** A phone sliding in beside the screen, showing the same page on mobile. */
  phone?: { src: string; alt: string };
}

export interface ArtStage {
  kind: "art";
  art: "cv" | "end" | "classroom-video";
}

export interface Scene {
  id: string;
  /** A short label above the title, e.g. the step. */
  tag: string;
  title: string;
  body: string;
  stage: ShotStage | ArtStage;
}

const screens = {
  compose: { src: "/platforms/compose.webp", h: 800, path: "media/post/new", alt: "শিক্ষিতদের মিডিয়ায় ‘দক্ষতা পোস্ট করুন’ পাতা: পোস্টের ধরন, দক্ষতার প্রমাণ বা প্রজেক্ট ডেমো, ছবি-ভিডিও যোগ, আর ডানে প্রিভিউ" },
  profile: { src: "/platforms/profile.webp", h: 1260, path: "media/u/mahir", alt: "একটি প্রোফাইল পাতা: প্রতিটি দক্ষতায় নিজের দাবি ও কমিউনিটির যাচাই পাশাপাশি, ‘কমিউনিটি যাচাইকৃত’ ব্যাজ, সার্টিফিকেট আর ওয়ালেট" },
  jobs: { src: "/platforms/jobs.webp", h: 1400, path: "media/jobs", alt: "‘কাজ’ পাতা: খাত অনুযায়ী চাকরি, প্রতিটিতে বেতন, ‘ন্যায্য মজুরি’ চিহ্ন আর আবেদন বোতাম; ডানে দক্ষতার সাথে মেলা কাজ" },
  bank: { src: "/platforms/bank.webp", h: 1400, path: "media/dashboard", alt: "‘মাটির ব্যাংক’ পাতা: তোলার মতো ব্যালান্স, এসক্রোতে রাখা টাকা, আয়ের হিসাব, রাজস্বের চার্ট আর ফি কীভাবে কাটে" },
  feed: { src: "/platforms/feed.webp", h: 1900, path: "media", alt: "শিক্ষিতদের মিডিয়ার ফিড: গবেষণাকোষ থেকে শেয়ার করা একটি ওয়ার্কিং পেপারের কার্ড, প্রতিক্রিয়া আর আলোচনা" },
  research: { src: "/platforms/research.webp", h: 1150, path: "research", alt: "গবেষণাকোষের প্রধান পাতা: ‘দেশের প্রশ্ন, দেশের গবেষণা।’ শিরোনাম, জনপ্রিয় বিষয় আর সম্পাদকের নির্বাচিত গবেষণা" },
  article: { src: "/platforms/article.webp", h: 1000, path: "research/farm-gate-to-fake-seal", alt: "গবেষণাকোষে একটি ওয়ার্কিং পেপার: শিরোনাম, লেখক, প্রতিক্রিয়ার বোতাম, আলোচনা-শেয়ার-উদ্ধৃতি আর গবেষণা স্কোর" },
  classes: { src: "/platforms/classes.webp", h: 1240, path: "media/classroom", alt: "কাণ্ডারী-ল্যাব ক্লাসরুম: ‘পুরো ক্লাস, এক জায়গায়।’ শিরোনাম, ক্লাস কোড দিয়ে যোগ দেওয়ার ঘর, নমুনা ক্লাস আর ল্যাব রুম" },
  classone: { src: "/platforms/classone.webp", h: 1260, path: "media/classroom/c-ssc27", alt: "একটি ক্লাসের পাতা: পরীক্ষার কাউন্টডাউন, সিলেবাসের অগ্রগতি, নোটিশ বোর্ড, আজকের টপিক, পরের ক্লাস আর হোমওয়ার্ক" },
} satisfies Record<string, Screen>;

/** শিক্ষিতদের মিডিয়া: from "a degree but no proof" to "paid, safely". */
export const mediaFilm: Scene[] = [
  {
    id: "problem",
    tag: "গল্পের শুরু",
    title: "পাশ করেছেন। তবু কাজ মেলে না?",
    body: "সিভির কাগজে দক্ষতা দেখা যায় না। যে কাজ দেবে, সে জানতে চায় — আপনি আসলে কী পারেন।",
    stage: { kind: "art", art: "cv" },
  },
  {
    id: "post",
    tag: "ধাপ ১ · পোস্ট",
    title: "কাজটাই দেখান",
    body: "ছবি, ভিডিও বা প্রজেক্ট ডেমো দিয়ে দক্ষতা পোস্ট করুন। প্রমাণ ছাড়া যাচাই হয় না — কাজই আপনার সিভি।",
    stage: {
      kind: "shot",
      screen: screens.compose,
      from: { x: 230, y: 40, zoom: 1.22 },
      to: { x: 262, y: 120, zoom: 1.4 },
      cursor: { from: [820, 640], to: [452, 497] },
      chips: [
        { text: "দক্ষতার প্রমাণ বাছাই", at: [470, 560], tone: "gold", icon: "check", delay: 3000 },
        { text: "নিজের দাবি: ৩.০", at: [1020, 455], tone: "white", icon: "star", delay: 3700 },
      ],
    },
  },
  {
    id: "verify",
    tag: "ধাপ ২ · যাচাই",
    title: "নিজে রেটিং দিন, কমিউনিটি যাচাই করুক",
    body: "বেশি দাবি করলে ধরা পড়বে; দাবি মিললে পাবেন যাচাইকৃত ব্যাজ আর সার্টিফিকেট।",
    stage: {
      kind: "shot",
      screen: screens.profile,
      from: { x: 240, y: 260, zoom: 1.3 },
      to: { x: 292, y: 630, zoom: 1.85 },
      chips: [
        { text: "৩৮ জন যাচাই করেছেন", at: [745, 885], tone: "gold", icon: "check", delay: 3300 },
        { text: "সার্টিফিকেট পেলেন", at: [745, 945], tone: "green", icon: "spark", delay: 4000 },
      ],
    },
  },
  {
    id: "work",
    tag: "ধাপ ৩ · সুযোগ",
    title: "এবার কাজ আপনাকে খুঁজে নেবে",
    body: "দক্ষতার সাথে মেলা চাকরি — বেতন লেখা বাধ্যতামূলক ও ন্যায্য। পাশাপাশি বাজারে বিক্রি, দলে যোগ — এক অ্যাকাউন্টে।",
    stage: {
      kind: "shot",
      screen: screens.jobs,
      from: { x: 230, y: 40, zoom: 1.22 },
      to: { x: 230, y: 400, zoom: 1.22 },
      chips: [{ text: "ন্যায্য মজুরি নিশ্চিত", at: [760, 965], tone: "gold", icon: "check", delay: 3200 }],
      phone: { src: "/platforms/phone-feed.webp", alt: "ফোনে শিক্ষিতদের মিডিয়ার ফিড" },
    },
  },
  {
    id: "earn",
    tag: "ধাপ ৪ · আয়",
    title: "আয় জমে মাটির ব্যাংকে",
    body: "টাকা এসক্রোতে নিরাপদ থাকে, কাজ বুঝে পেলে তবেই বিক্রেতার কাছে যায়। ফি স্পষ্ট লেখা — লুকানো চার্জ নেই।",
    stage: {
      kind: "shot",
      screen: screens.bank,
      from: { x: 250, y: 150, zoom: 1.4 },
      to: { x: 292, y: 196, zoom: 1.9 },
      chips: [
        { text: "এসক্রোতে নিরাপদ", at: [720, 262], tone: "gold", icon: "lock", delay: 3000 },
        { text: "৫% + ৫% · আর কিছু নয়", at: [600, 462], tone: "white", icon: "check", delay: 3700 },
      ],
    },
  },
  {
    id: "end",
    tag: "শিক্ষিতদের মিডিয়া",
    title: "কাজই হোক আপনার পরিচয়",
    body: "এক এনআইডি, এক অ্যাকাউন্ট — প্রতিটি রেটিং একজন সত্যিকারের মানুষের। আজই ফ্রি অ্যাকাউন্ট খুলুন।",
    stage: { kind: "art", art: "end" },
  },
];

/** গবেষণাকোষ: read, react, publish, share. */
export const researchReel: Scene[] = [
  {
    id: "home",
    tag: "গবেষণাকোষ",
    title: "দেশের প্রশ্ন, দেশের গবেষণা",
    body: "থিসিস, গবেষণাপত্র আর উদ্ভাবন — বিষয় ধরে খুঁজুন।",
    stage: { kind: "shot", screen: screens.research, from: { x: 0, y: 330, zoom: 1.5 }, to: { x: 0, y: 330, zoom: 1 } },
  },
  {
    id: "react",
    tag: "পড়ুন ও সাড়া দিন",
    title: "প্রতিক্রিয়া, আলোচনা, পয়েন্ট",
    body: "প্রতিটি সাড়ায় গবেষণার স্কোর বাড়ে।",
    stage: {
      kind: "shot",
      screen: screens.article,
      from: { x: 0, y: 380, zoom: 1.55 },
      to: { x: 0, y: 340, zoom: 1.05 },
      chips: [{ text: "নতুন ভাবনা · +২ পয়েন্ট", at: [260, 905], tone: "gold", icon: "spark", delay: 2600 }],
    },
  },
  {
    id: "share",
    tag: "ছড়িয়ে দিন",
    title: "এক চাপে ফিডে শেয়ার",
    body: "আপনার গবেষণা পৌঁছে যায় শিক্ষিতদের মিডিয়ায়।",
    stage: {
      kind: "shot",
      screen: screens.feed,
      from: { x: 290, y: 330, zoom: 1.5 },
      to: { x: 300, y: 620, zoom: 1.9 },
      chips: [{ text: "ফিডে শেয়ার হয়েছে", at: [700, 905], tone: "gold", icon: "send", delay: 2600 }],
      phone: { src: "/platforms/phone-research.webp", alt: "ফোনে গবেষণাকোষের একটি গবেষণাপত্র" },
    },
  },
];

/** ক্লাসরুম: stuck alone, then join the class with a code, then everything in one place. */
export const classroomReel: Scene[] = [
  {
    id: "stuck",
    tag: "ক্লাসরুম",
    title: "একা ভাবলে আটকে যান?",
    body: "সহপাঠী আর শিক্ষকের সাথে ভাবলে উত্তর আসে।",
    stage: { kind: "art", art: "classroom-video" },
  },
  {
    id: "join",
    tag: "যোগ দিন",
    title: "ক্লাস কোড দিন, ঢুকে পড়ুন",
    body: "সিআর বা ক্যাপ্টেন কোড শেয়ার করবেন।",
    stage: {
      kind: "shot",
      screen: screens.classes,
      from: { x: 60, y: 60, zoom: 1.15 },
      to: { x: 60, y: 440, zoom: 1.15 },
      chips: [{ text: "SSC27N", at: [985, 550], tone: "ink", delay: 2600, typed: true }],
    },
  },
  {
    id: "class",
    tag: "এক জায়গায়",
    title: "নোটিশ, রুটিন, পরীক্ষার কাউন্টডাউন",
    body: "অভিভাবকও শিক্ষার্থী আইডি দিয়ে খবর রাখতে পারেন।",
    stage: {
      kind: "shot",
      screen: screens.classone,
      from: { x: 60, y: 60, zoom: 1.2 },
      to: { x: 60, y: 420, zoom: 1.2 },
      chips: [{ text: "নোটিশ বোর্ডে ৩টি নোটিশ", at: [430, 520], tone: "gold", icon: "check", delay: 2600 }],
      phone: { src: "/platforms/phone-class.webp", alt: "ফোনে একটি ক্লাসের পাতা: পরীক্ষার কাউন্টডাউন আর সিলেবাসের অগ্রগতি" },
    },
  },
];

/** Other rooms inside শিক্ষিতদের মিডিয়া, each with its page's own hero as the picture. */
export const mediaRooms = [
  { href: "/media/market", icon: "market", name: "বাজার", nameEn: "Market", line: "যা আছে বিক্রি করুন, যা দরকার চেয়ে নিন — ক্রেতা-বিক্রেতা নিজেরাই মেলে।", image: { src: "/platforms/tile-market.webp", alt: "বাজার পাতার শুরু: ‘যা আছে বিক্রি করুন, যা দরকার চেয়ে নিন।’" } },
  { href: "/media/jobs", icon: "jobs", name: "কাজ", nameEn: "Jobs", line: "খাত অনুযায়ী কাজ; পোস্ট বিনামূল্যে, বেতন লেখা বাধ্যতামূলক ও ন্যায্য।", image: { src: "/platforms/tile-jobs.webp", alt: "কাজ পাতা: খাত আর ধরন অনুযায়ী চাকরির তালিকা" } },
  { href: "/media/together", icon: "team", name: "টিম · উদ্যোগ · চ্যালেঞ্জ", nameEn: "Teams & challenges", line: "একা নয়, একসাথে — দল গড়ুন, উদ্যোগে নামুন, চ্যালেঞ্জ জিতুন।", image: { src: "/platforms/tile-together.webp", alt: "টিম পাতার শুরু: ‘একা নয়, একসাথে।’" } },
  { href: "/media/civic", icon: "civic", name: "নাগরিক বার্তা", nameEn: "Civic reports", line: "দেখেছেন? চুপ থাকবেন না — আপনার নাম গোপন রেখে সমস্যা জানান।", image: { src: "/platforms/tile-civic.webp", alt: "নাগরিক বার্তা পাতার শুরু: ‘দেখেছেন? চুপ থাকবেন না।’ আর জরুরি হেল্পলাইন নম্বর" } },
] as const;

export type RoomIcon = (typeof mediaRooms)[number]["icon"];
