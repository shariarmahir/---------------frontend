import type { SellerStage, ShipMode, TradeMode } from "@/lib/media/bazaar";
import type { BoardPost, CategoryId, Delivery } from "./types";

/** Where the seller is in their working life; each stage asks for different things. */
export const STAGES: Record<SellerStage, { bn: string; hint: string }> = {
  solo: { bn: "একক", hint: "নিজের ফসল, হাতের কাজ, ঘরের রান্না — একা বিক্রি করেন" },
  new: { bn: "নতুন ব্যবসা শুরু", hint: "আজই শুরু — নাম, প্রথম অফার, কোথায় সাহায্য দরকার" },
  freelance: { bn: "ফ্রিল্যান্স", hint: "সেবা বা ডিজিটাল কাজ — পোর্টফোলিও, সময়সীমা, সংশোধন" },
  running: { bn: "চলমান ব্যবসা", hint: "দোকান বা কারখানা আছে — লাইসেন্স, পাইকারি দর, সক্ষমতা" },
};

export const MODES: Record<TradeMode, { bn: string; hint: string }> = {
  retail: { bn: "খুচরা", hint: "ব্যক্তিগত ক্রেতা, এক-দুটো পিস" },
  wholesale: { bn: "পাইকারি", hint: "দোকানি ও আড়তদার, বেশি পরিমাণে কম দর" },
  export: { bn: "রপ্তানি", hint: "নমুনা, ল্যাব টেস্ট, প্যাকেজিং" },
  brand: { bn: "নিজস্ব ব্র্যান্ড", hint: "অন্যের নামে প্যাকেট করে দেওয়া" },
};

export const UNITS = ["পিস", "কেজি", "মণ", "হালি", "ডজন", "লিটার", "গজ", "ঝুড়ি", "অর্ডার", "দিন", "মাস", "ঘণ্টা", "সেশন", "প্রজেক্ট", "লাইসেন্স"];

export const DELIVERY: Record<Delivery, string> = {
  bus: "বাসের বক্স",
  cold: "কোল্ড বক্স",
  courier: "কুরিয়ার",
  train: "ট্রেন পার্সেল",
  truck: "ট্রাক",
  home: "বাসায় ডেলিভারি",
  pickup: "নিজে নিয়ে যান",
  digital: "ডিজিটাল",
  onsite: "বাসায় এসে সেবা",
};

export const SHIP_NOTE: Record<ShipMode, string> = {
  bus: "দূরপাল্লার বাসের খালি বক্সে, একই দিনে · ৩০ কেজি পর্যন্ত",
  cold: "বরফ-বাক্সে তাজা মাছ, সবজি, ফল · ৫০ কেজি পর্যন্ত",
  courier: "ছোট প্যাকেট, ঘরে পৌঁছায় · ১০ কেজি পর্যন্ত",
  train: "বড় চালান সস্তায় · ১০০ কেজি থেকে",
  truck: "আড়ত থেকে আড়ত · ৩০০ কেজি থেকে",
};

export type FieldKind = "text" | "number" | "date" | "select" | "chips";

export interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

/** Asked of every seller at a stage, whatever they sell. */
export const STAGE_FIELDS: Record<SellerStage, Field[]> = {
  solo: [
    { key: "role", label: "আপনি", kind: "select", required: true, options: ["কৃষক", "হকার / ফেরিওয়ালা", "কারিগর", "ঘরোয়া উদ্যোক্তা", "শিল্পী", "শিক্ষার্থী", "অন্যান্য"] },
    { key: "source", label: "পণ্য কোথা থেকে", kind: "select", options: ["নিজের ফসল", "নিজের হাতে তৈরি", "ঘরে তৈরি", "কিনে বিক্রি"] },
  ],
  new: [
    { key: "brand", label: "ব্যবসার নাম", kind: "text", required: true, placeholder: "যেমন: সবুজ ঝুড়ি" },
    { key: "offer", label: "শুরুর অফার", kind: "text", placeholder: "যেমন: প্রথম ৫০ জনকে ১০% ছাড়" },
    { key: "help", label: "কোথায় সাহায্য দরকার", kind: "chips", options: ["সাপ্লায়ার", "প্যাকেজিং", "ব্র্যান্ডিং", "ডেলিভারি", "ট্রেড লাইসেন্স", "পুঁজি"] },
  ],
  freelance: [
    { key: "portfolio", label: "পোর্টফোলিও লিংক", kind: "text", placeholder: "behance.net/… বা ড্রাইভ লিংক" },
    { key: "days", label: "কাজ শেষ হতে (দিন)", kind: "number", required: true },
    { key: "revisions", label: "বিনা খরচে সংশোধন", kind: "select", options: ["১ বার", "২ বার", "৩ বার", "যতক্ষণ না পছন্দ হয়"] },
  ],
  running: [
    { key: "brand", label: "প্রতিষ্ঠানের নাম", kind: "text", required: true },
    { key: "license", label: "ট্রেড লাইসেন্স নম্বর", kind: "text", placeholder: "যাচাইয়ের পর ব্যাজ পাবেন" },
    { key: "years", label: "কত বছর চলছে", kind: "number" },
    { key: "capacity", label: "মাসে কতটা দিতে পারেন", kind: "text", placeholder: "যেমন: ২ টন, ৫০০ পিস" },
  ],
};

const DIGITAL: Field[] = [
  { key: "license", label: "লাইসেন্স", kind: "select", required: true, options: ["ব্যক্তিগত ব্যবহার", "বাণিজ্যিক ব্যবহার", "এক্সক্লুসিভ (একজনই পাবেন)"] },
  { key: "format", label: "ফাইল / ফরম্যাট", kind: "text", placeholder: "PNG, AI, MP3, WAV…" },
];
const WEAR: Field[] = [
  { key: "material", label: "কাপড় / উপকরণ", kind: "text", required: true, placeholder: "খাঁটি সুতি, রেশম…" },
  { key: "size", label: "মাপ", kind: "text", placeholder: "৬ × ৪.৫ ফুট, ১২ হাত…" },
  { key: "making", label: "বানাতে সময় লাগে", kind: "text" },
];

/** What each kind of goods needs to be bought with confidence. */
export const CATEGORY_FIELDS: Partial<Record<CategoryId, Field[]>> = {
  farm: [
    { key: "harvest", label: "তোলার তারিখ", kind: "date", required: true },
    { key: "variety", label: "জাত / ধরন", kind: "text", placeholder: "হিমসাগর, ঝুনা নারকেল, কাটারিভোগ…" },
    { key: "village", label: "গ্রাম ও উপজেলা", kind: "text", required: true },
  ],
  cooking: [
    { key: "made", label: "তৈরির তারিখ", kind: "date", required: true },
    { key: "shelf", label: "ভালো থাকে (দিন)", kind: "number", required: true },
    { key: "ingredients", label: "উপকরণ", kind: "text" },
    { key: "bsti", label: "বিএসটিআই / খাদ্য সনদ", kind: "text", placeholder: "থাকলে নম্বর" },
  ],
  crafts: WEAR,
  fashion: WEAR,
  art: [
    { key: "medium", label: "মাধ্যম", kind: "select", required: true, options: ["জলরং", "তেলরং", "অ্যাক্রিলিক", "পেনসিল / চারকোল", "ক্যালিগ্রাফি", "ডিজিটাল"] },
    { key: "size", label: "মাপ", kind: "text", placeholder: "১৮ × ২৪ ইঞ্চি" },
    { key: "original", label: "কী পাবেন", kind: "select", required: true, options: ["মূল ছবি", "প্রিন্ট", "ডিজিটাল ফাইল"] },
    { key: "frame", label: "ফ্রেম", kind: "select", options: ["ফ্রেমসহ", "ফ্রেম ছাড়া"] },
  ],
  music: [
    { key: "genre", label: "ধরন", kind: "select", required: true, options: ["আধুনিক", "লোকগীতি", "বাউল", "রবীন্দ্রসংগীত", "নজরুলগীতি", "ব্যান্ড", "ইসলামিক", "ইন্সট্রুমেন্টাল", "জিঙ্গেল"] },
    { key: "length", label: "দৈর্ঘ্য", kind: "text", required: true, placeholder: "৩:৪৫" },
    { key: "license", label: "লাইসেন্স", kind: "select", required: true, options: ["ব্যক্তিগত ব্যবহার", "ইউটিউব / সোশ্যাল", "বিজ্ঞাপন ও বাণিজ্যিক", "এক্সক্লুসিভ (একজনই পাবেন)"] },
    { key: "includes", label: "কী পাবেন", kind: "chips", options: ["মাস্টার অডিও (WAV)", "MP3", "আলাদা ট্র্যাক (স্টেম)", "লিরিক", "মিউজিক ভিডিও"] },
    { key: "credit", label: "শিল্পী ও সুরকার", kind: "text", placeholder: "কণ্ঠ, সুর, কথা — কার" },
  ],
  content: DIGITAL,
  design: DIGITAL,
  photo: [
    { key: "event", label: "কী ধরনের শুট", kind: "select", required: true, options: ["বিয়ে", "পণ্য", "পোর্ট্রেট", "ইভেন্ট", "ফ্যাশন", "ভিডিওগ্রাফি"] },
    { key: "hours", label: "কত ঘণ্টা", kind: "number", required: true },
    { key: "photos", label: "কতটি এডিটেড ছবি", kind: "number" },
    { key: "ready", label: "হাতে পাবেন (দিন)", kind: "number" },
  ],
  teaching: [
    { key: "level", label: "শ্রেণি / স্তর", kind: "text", required: true, placeholder: "এসএসসি, এইচএসসি, বিশ্ববিদ্যালয় ভর্তি…" },
    { key: "where", label: "ক্লাস কোথায়", kind: "select", required: true, options: ["অনলাইনে", "শিক্ষার্থীর বাসায়", "আমার কাছে এসে"] },
    { key: "size", label: "একসাথে কতজন", kind: "number" },
    { key: "schedule", label: "সময়সূচি", kind: "text", placeholder: "সপ্তাহে ৩ দিন, সন্ধ্যা ৭টা" },
  ],
  tech: [
    { key: "stack", label: "প্রযুক্তি", kind: "text", required: true, placeholder: "Next.js, Flutter, Python…" },
    { key: "days", label: "কত দিনে", kind: "number", required: true },
    { key: "support", label: "পরে বিনা খরচে সাপোর্ট", kind: "select", options: ["১ মাস", "৩ মাস", "৬ মাস", "নেই"] },
  ],
  beauty: [
    { key: "service", label: "কী সেবা", kind: "chips", required: true, options: ["মেহেদি", "মেকআপ", "চুল", "শাড়ি পরানো"] },
    { key: "at", label: "কোথায়", kind: "select", required: true, options: ["গ্রাহকের বাসায়", "পার্লারে"] },
    { key: "hours", label: "কতক্ষণ লাগে", kind: "text" },
  ],
  travel: [
    { key: "route", label: "পথ", kind: "text", required: true, placeholder: "থানচি → নাফাখুম → আমিয়াখুম" },
    { key: "days", label: "কত দিন", kind: "number", required: true },
    { key: "group", label: "দলে সর্বোচ্চ", kind: "number" },
    { key: "includes", label: "দামের মধ্যে", kind: "chips", options: ["থাকা", "খাওয়া", "যাতায়াত", "অনুমতিপত্র", "লাইফ জ্যাকেট"] },
  ],
  homeservice: [
    { key: "area", label: "যেসব এলাকায় যান", kind: "text", required: true },
    { key: "parts", label: "যন্ত্রাংশ", kind: "select", options: ["দাম আলাদা", "দামের মধ্যে", "গ্রাহক দেবেন"] },
    { key: "warranty", label: "কাজের ওয়ারেন্টি", kind: "select", options: ["নেই", "৭ দিন", "১ মাস", "৩ মাস"] },
  ],
  rent: [
    { key: "rooms", label: "রুম", kind: "select", required: true, options: ["১ রুম", "২ রুম", "৩ রুম", "৪+ রুম", "সিট (মেস)"] },
    { key: "sqft", label: "আয়তন (বর্গফুট)", kind: "number" },
    { key: "from", label: "কবে থেকে", kind: "date", required: true },
    { key: "for", label: "কাদের জন্য", kind: "select", options: ["পরিবার", "ব্যাচেলর", "ছাত্রী", "যে কেউ"] },
  ],
  legal: [
    { key: "bar", label: "বার কাউন্সিল সনদ নম্বর", kind: "text", required: true },
    { key: "practice", label: "যে মামলা দেখেন", kind: "chips", required: true, options: ["জমিজমা", "পারিবারিক", "ফৌজদারি", "ব্যবসা ও চুক্তি", "শ্রম", "ভোক্তা অধিকার"] },
    { key: "chamber", label: "চেম্বার", kind: "text" },
  ],
  shop: [
    { key: "address", label: "দোকানের ঠিকানা", kind: "text", required: true },
    { key: "hours", label: "খোলা থাকে", kind: "text", placeholder: "সকাল ৮টা – রাত ১০টা" },
  ],
};

export const SERVICE_FIELDS: Field[] = [
  { key: "area", label: "যেসব এলাকায় সেবা দেন", kind: "text", required: true },
  { key: "experience", label: "অভিজ্ঞতা (বছর)", kind: "number" },
];

export const fieldsFor = (c: CategoryId) => CATEGORY_FIELDS[c] ?? (c === "other" ? [] : SERVICE_FIELDS);

export type UploadKind = "image" | "video" | "audio";

/** What the product step asks for in each category: an example title, what to describe, and which proof to upload. */
export interface ProductForm {
  title: string;
  details: string;
  media: { label: string; hint: string; kinds: UploadKind[]; max: number; need?: UploadKind };
  unit: string;
  delivery: Delivery[];
}

const GOODS = (label: string, hint: string, max = 4): ProductForm["media"] => ({ label, hint, kinds: ["image", "video"], max, need: "image" });
const WORK = (label: string, hint: string, kinds: UploadKind[] = ["image", "video"]): ProductForm["media"] => ({ label, hint, kinds, max: 4 });

export const PRODUCT_FORMS: Record<CategoryId, ProductForm> = {
  farm: { title: "বাগেরহাটের ঝুনা নারকেল — গাছ থেকে সরাসরি", details: "কী ফসল, কবে তোলা, কীভাবে চাষ (সার, কীটনাশক), কতটা আছে, ভাগ করে বিক্রি করবেন কি না।", media: GOODS("ফসলের ছবি ও মাঠের ভিডিও", "মাঠ বা বাগান থেকে তোলা আসল ছবি। মাঠের ছোট ভিডিও থাকলে ক্রেতা বেশি ভরসা পান।"), unit: "কেজি", delivery: ["bus", "pickup"] },
  cooking: { title: "ঘরে বানানো খেজুর গুড়ের পায়েস — ১ কেজি পাত্র", details: "কী দিয়ে বানানো, কতজনের জন্য, কতদিন ভালো থাকে, কত আগে অর্ডার দিতে হবে।", media: GOODS("খাবারের ছবি ও বানানোর ভিডিও", "পরিষ্কার রান্নাঘরে বানানোর ছোট ভিডিও সবচেয়ে বড় প্রমাণ।"), unit: "অর্ডার", delivery: ["home", "pickup"] },
  crafts: { title: "হাতে সেলাই নকশিকাঁথা — ‘নদীর গল্প’", details: "কাপড় ও সুতা, নকশার গল্প, মাপ, বানাতে কত সময় লেগেছে, একটিই না অর্ডারে বানান।", media: GOODS("পুরো জিনিস ও কাছ থেকে কাজের ছবি", "পুরোটা একবার, তারপর সেলাই বা বুননের কাছের ছবি। কাজের ভিডিও দিলে হাতের কাজ প্রমাণ হয়।", 6), unit: "পিস", delivery: ["courier", "bus"] },
  fashion: { title: "রূপগঞ্জের জামদানি শাড়ি — ৮৪ কাউন্ট সুতি", details: "কাপড়, মাপ, রং, ধোয়ার নিয়ম, অর্ডারে বানান কি না।", media: GOODS("সামনে, পেছনে, জমিনের ছবি ও পরা অবস্থার ভিডিও", "দিনের আলোয় তুলুন, যাতে রং ঠিক দেখায়।", 6), unit: "পিস", delivery: ["courier", "pickup"] },
  music: { title: "নিজের সুরের গান ‘বর্ষার চিঠি’ — বাণিজ্যিক লাইসেন্স", details: "গানের মেজাজ, কোথায় ব্যবহার করা যাবে (ইউটিউব, বিজ্ঞাপন, নাটক), কেনার পর কী ফাইল পাবেন।", media: { label: "গানের অডিও নমুনা ও ভিডিও", hint: "৩০–৬০ সেকেন্ডের নমুনা দিন — পুরো গান বিক্রির পর পাঠাবেন। কভার ছবি দিতে পারেন।", kinds: ["audio", "video", "image"], max: 4, need: "audio" }, unit: "লাইসেন্স", delivery: ["digital"] },
  art: { title: "জলরঙে সুন্দরবন — ১৮ × ২৪ ইঞ্চি মূল ছবি", details: "মাধ্যম, মাপ, কাগজ বা ক্যানভাস, ছবির গল্প।", media: GOODS("শিল্পকর্মের ছবি ও আঁকার ভিডিও", "পুরো ছবি সোজা করে, আর কাছ থেকে তুলির কাজ।"), unit: "পিস", delivery: ["courier", "digital"] },
  content: { title: "ফেসবুক পেজের ১০টি পোস্ট ডিজাইন ও ১টি রিল", details: "কী বানিয়ে দেবেন, কতটি, কত দিনে, কয়বার সংশোধন, কী ফাইল পাবেন।", media: WORK("আগের কাজের নমুনা — রিল, পোস্ট, বিজ্ঞাপন", "অন্যের ব্র্যান্ডের কাজ দেখালে তাঁদের অনুমতি নিন।", ["video", "image"]), unit: "প্রজেক্ট", delivery: ["digital"] },
  design: { title: "দুই কাঠার ডুপ্লেক্স বাড়ির নকশা — ৩ডি সহ", details: "কী কী ড্রয়িং পাবেন, কয়বার সংশোধন, কত দিনে, সাইটে আসবেন কি না।", media: WORK("নকশা, ৩ডি রেন্ডার ও ওয়াকথ্রু ভিডিও", "আগের প্রজেক্টের কাজ — মালিকের ঠিকানা ঢেকে দিন।"), unit: "প্রজেক্ট", delivery: ["digital", "onsite"] },
  photo: { title: "বিয়ের পূর্ণ দিনের ছবি — ৪০০+ এডিটেড", details: "কত ঘণ্টা, কতটি ছবি, এডিট কেমন, কত দিনে হাতে পাবেন, ভিডিও আছে কি না।", media: { label: "পোর্টফোলিও — সেরা ছবি ও রিল", hint: "নিজের তোলা সেরা ৬টি ছবি বা একটি রিল।", kinds: ["image", "video"], max: 6, need: "image" }, unit: "সেশন", delivery: ["onsite", "digital"] },
  tech: { title: "ছোট ব্যবসার ওয়েবসাইট — ৫ পাতা, মোবাইলে মানানসই", details: "কী বানাবেন, কোন প্রযুক্তি, কত দিনে, পরে সাপোর্ট কত দিন, সোর্স কোড পাবেন কি না।", media: WORK("স্ক্রিনশট ও ডেমো ভিডিও", "আগের কাজের স্ক্রিন রেকর্ডিং সবচেয়ে ভালো প্রমাণ।"), unit: "প্রজেক্ট", delivery: ["digital"] },
  engineering: { title: "সোলার সেচ পাম্পের নকশা ও স্থাপন", details: "কী নকশা করবেন, কোন যন্ত্র, সাইটে কত দিন, ওয়ারেন্টি।", media: WORK("আগের প্রজেক্টের ছবি ও চলমান ভিডিও", "যন্ত্র চলছে এমন ভিডিও দিন।"), unit: "প্রজেক্ট", delivery: ["onsite"] },
  homeservice: { title: "মোটরসাইকেল সার্ভিসিং — বাসায় এসে", details: "কী কী কাজ, কতক্ষণ লাগে, যন্ত্রাংশ কে দেবেন, ওয়ারেন্টি।", media: WORK("কাজের আগে ও পরের ছবি", "একই জায়গার আগে-পরে ছবি পাশাপাশি দিন।"), unit: "সেশন", delivery: ["onsite"] },
  teaching: { title: "এসএসসি গণিত — সপ্তাহে ৩ দিন, অনলাইনে", details: "কোন শ্রেণি ও বিষয়, একসাথে কতজন, ক্লাসের সময়, নোট বা পরীক্ষা দেবেন কি না।", media: { label: "পরিচিতি বা নমুনা ক্লাসের ভিডিও", hint: "২ মিনিটের একটি নমুনা ক্লাস অভিভাবকের সবচেয়ে বড় ভরসা।", kinds: ["video", "image"], max: 3 }, unit: "মাস", delivery: ["digital", "onsite"] },
  finance: { title: "আয়কর রিটার্ন জমা — চাকরিজীবী", details: "কী কাগজ লাগবে, কত দিনে, কী হাতে পাবেন (প্রাপ্তিস্বীকারপত্র)।", media: WORK("সনদ বা নমুনা কাজ (নাম-নম্বর ঢেকে)", "গ্রাহকের কোনো তথ্য দেখাবেন না।", ["image"]), unit: "সেশন", delivery: ["digital", "onsite"] },
  beauty: { title: "বিয়ের মেহেদি — দুই হাত, কনুই পর্যন্ত", details: "কী নকশা, কতক্ষণ লাগে, কোন মেহেদি (প্রাকৃতিক কি না), কোথায় আসবেন।", media: WORK("আগের কাজের ছবি ও ভিডিও", "কনের অনুমতি নিয়ে ছবি দিন।"), unit: "সেশন", delivery: ["onsite"] },
  research: { title: "থিসিসের ডেটা বিশ্লেষণ — SPSS ও R", details: "কী বিশ্লেষণ, কত দিনে, কী রিপোর্ট পাবেন। লেখা নিজে করে দেওয়া নয় — শেখানো ও বিশ্লেষণ।", media: WORK("আগের কাজের নমুনা", "চার্ট বা টেবিলের ছবি, গবেষকের নাম ঢেকে।", ["image"]), unit: "প্রজেক্ট", delivery: ["digital"] },
  travel: { title: "বান্দরবান ৩ দিনের ট্রেক — গাইডসহ", details: "পথ, প্রতিদিন কত হাঁটা, কোথায় থাকা-খাওয়া, কী সঙ্গে আনতে হবে, নিরাপত্তা।", media: WORK("পথের ছবি ও ভিডিও", "আগের দলের অনুমতি নিয়ে ছবি দিন।"), unit: "দিন", delivery: ["onsite"] },
  sports: { title: "ছোটদের ক্রিকেট কোচিং — সপ্তাহে ৩ দিন", details: "বয়স, কী শেখাবেন, মাঠ কোথায়, সরঞ্জাম কে দেবেন।", media: WORK("প্র্যাকটিসের ভিডিও ও ছবি", "শিশুদের মুখ দেখাতে অভিভাবকের অনুমতি নিন।", ["video", "image"]), unit: "মাস", delivery: ["onsite"] },
  shop: { title: "মুদি বাজার বাসায় — এক ঘণ্টায়", details: "কী কী পাওয়া যায়, কোন এলাকায় ডেলিভারি, ন্যূনতম অর্ডার, কীভাবে অর্ডার দেবেন।", media: GOODS("দোকান ও পণ্যের ছবি", "দোকানের সামনে আর তাকের ছবি।"), unit: "অর্ডার", delivery: ["home", "pickup"] },
  rent: { title: "মিরপুর ২-এ দুই রুমের ফ্ল্যাট — পরিবারের জন্য", details: "তলা, রুম, বাথরুম, গ্যাস-পানি-বিদ্যুৎ, অগ্রিম কত, বাড়ির নিয়ম।", media: { label: "প্রতিটি ঘরের ছবি ও ভিডিও ট্যুর", hint: "প্রতিটি ঘর, রান্নাঘর, বাথরুম — আর হেঁটে দেখানো একটি ভিডিও।", kinds: ["image", "video"], max: 8, need: "image" }, unit: "মাস", delivery: [] },
  legal: { title: "জমিজমা ও দলিল — প্রথম পরামর্শ (৪৫ মিনিট)", details: "কোন বিষয়ে পরামর্শ, কতক্ষণ, চেম্বারে না ভিডিও কলে, পরে মামলার খরচ কেমন হতে পারে।", media: { label: "চেম্বারের ছবি ও সনদ (নম্বর ঢেকে)", hint: "কোনো মক্কেলের কাগজের ছবি দেবেন না।", kinds: ["image"], max: 3 }, unit: "সেশন", delivery: ["onsite", "digital"] },
  other: { title: "যা বিক্রি করছেন, এক লাইনে", details: "কী, কতটা, কীভাবে বানানো বা কোথা থেকে, কেন ভালো।", media: { label: "ছবি, ভিডিও বা অডিও", hint: "আসল জিনিসের ছবি দিন।", kinds: ["image", "video", "audio"], max: 4 }, unit: "পিস", delivery: ["courier", "pickup"] },
};

/** Goods that travel (and so need weight, stock and delivery), not services. */
export const PHYSICAL = new Set<CategoryId>(["farm", "cooking", "crafts", "fashion", "shop", "other"]);

/** Tags offered while typing, per category. */
export const TAG_IDEAS: Partial<Record<CategoryId, string[]>> = {
  farm: ["নারকেল", "গুড়", "আম", "সবজি", "চাল", "মধু", "অর্গানিক"],
  cooking: ["ঘরেরখাবার", "পিঠা", "আচার", "গুড়"],
  crafts: ["নকশিকাঁথা", "শীতলপাটি", "মৃৎশিল্প", "রপ্তানি"],
  fashion: ["শাড়ি", "জামদানি", "পাঞ্জাবি", "লুঙ্গি"],
  art: ["আঁকা", "ক্যালিগ্রাফি", "পোর্ট্রেট"],
  music: ["গান", "লোকগীতি", "জিঙ্গেল", "ব্যাকগ্রাউন্ডমিউজিক"],
  photo: ["ফটোগ্রাফি", "বিয়েরছবি", "প্রোডাক্টফটো"],
  design: ["বাড়িরনকশা", "ইন্টেরিয়র", "লোগো"],
  tech: ["ওয়েবসাইট", "অ্যাপ", "ইকমার্স"],
  teaching: ["গণিত", "ইংরেজি", "ভর্তিপ্রস্তুতি"],
  beauty: ["মেহেদি", "ব্রাইডালমেকআপ"],
  travel: ["ট্রেকিং", "বান্দরবান", "সুন্দরবন"],
  homeservice: ["মেরামত", "ইলেকট্রিশিয়ান", "এসিসার্ভিস"],
  content: ["গ্রাফিক্স", "ভিডিওএডিটিং", "লোগো"],
  rent: ["বাসাভাড়া", "সাবলেট", "মেস"],
  legal: ["আইনিসেবা", "জমিজমা", "পারিবারিক"],
};

/** Match boost: paid reach inside the platform, shown only to buyers whose search or need matches. */
export const BOOST_TIERS = [
  { taka: 100, days: 3 },
  { taka: 250, days: 7 },
  { taka: 500, days: 15 },
];

export const SIDES: Record<BoardPost["side"], { bn: string; hint: string }> = {
  sell: { bn: "বিক্রি করতে চাই", hint: "যা আছে, কতটা আছে, কত দাম" },
  buy: { bn: "কিনতে চাই", hint: "যা দরকার, কতটা, সর্বোচ্চ কত দেবেন" },
};

/** The চাহিদা বোর্ড. Every post is matched against listings and the other side of the board. */
export const boardPosts: BoardPost[] = [
  {
    id: "bp-coconut",
    author: "kamal",
    side: "buy",
    who: "মুদি ও ফলের দোকান, মোহাম্মদপুর",
    title: "ঝুনা নারকেল — ২০টি, প্রতি সপ্তাহে",
    category: "farm",
    tags: ["নারকেল"],
    qty: 20,
    unit: "পিস",
    price: 45,
    district: "ঢাকা",
    mode: "wholesale",
    when: "প্রতি শনিবার",
    note: "বাগান থেকে সরাসরি চাই, বাসের বক্সে পাঠালেও চলবে।",
  },
  {
    id: "bp-supari-sell",
    author: "jalal",
    side: "sell",
    who: "নারকেল-সুপারির বাগান, বাগেরহাট",
    title: "পাকা সুপারি — ২,০০০ পিস",
    category: "farm",
    tags: ["সুপারি"],
    qty: 2000,
    unit: "পিস",
    price: 3,
    district: "বাগেরহাট",
    mode: "wholesale",
    when: "৩ অক্টোবর থেকে",
    note: "এক ক্রেতা না নিলে কয়েকজনকে ভাগ করে দেব। বাসের বক্সে ঢাকা একদিনে।",
  },
  {
    id: "bp-karwan-veg",
    author: "selim",
    side: "buy",
    who: "কারওয়ান বাজারের আড়তদার",
    title: "বিষমুক্ত সবজি — সপ্তাহে ৩০ ঝুড়ি",
    category: "farm",
    tags: ["সবজি", "অর্গানিক"],
    qty: 30,
    unit: "ঝুড়ি",
    price: 700,
    district: "ঢাকা",
    mode: "wholesale",
    organic: true,
    when: "৫ অক্টোবর থেকে",
    note: "কয়েকজন কৃষক মিলে দিলেও নেব। কোল্ড বক্সে ভোর ৬টার মধ্যে আড়তে।",
  },
  {
    id: "bp-supari-buy",
    author: "kamal",
    side: "buy",
    who: "মুদি ও ফলের দোকান, মোহাম্মদপুর",
    title: "সুপারি — ৫০০ পিস",
    category: "farm",
    tags: ["সুপারি"],
    qty: 500,
    unit: "পিস",
    price: 4,
    district: "ঢাকা",
    mode: "wholesale",
    when: "এই সপ্তাহে",
  },
  {
    id: "bp-gur-export",
    author: "tareq",
    side: "buy",
    who: "রপ্তানিকারক, চট্টগ্রাম",
    title: "খাঁটি খেজুর গুড় — ৫০০ কেজি, দুবাই",
    category: "farm",
    tags: ["গুড়", "রপ্তানি"],
    qty: 500,
    unit: "কেজি",
    price: 340,
    district: "চট্টগ্রাম",
    mode: "export",
    sampleTest: true,
    when: "ডিসেম্বরের মধ্যে",
    note: "আগে ১ কেজি নমুনা — চিনি, রং আর আর্দ্রতা ল্যাবে পরীক্ষা হবে।",
  },
  {
    id: "bp-kantha-sell",
    author: "shapla",
    side: "sell",
    who: "নকশিকাঁথার কারিগর দল, জামালপুর",
    title: "নকশিকাঁথা — ১০টি, দোকান বা রপ্তানির জন্য",
    category: "crafts",
    tags: ["নকশিকাঁথা", "রপ্তানি"],
    qty: 10,
    unit: "পিস",
    price: 8000,
    district: "জামালপুর",
    mode: "export",
    when: "এখনই",
    note: "আমাদের ১২ জনের দলের হাতের কাজ। একসাথে নিলে প্রতিটি ৮,০০০।",
  },
  {
    id: "bp-land-deed",
    author: "jalal",
    side: "buy",
    who: "বাগেরহাটের নারকেল চাষি",
    title: "জমির দলিল ও খতিয়ান যাচাই",
    category: "legal",
    tags: ["আইনিসেবা", "জমিজমা"],
    qty: 1,
    unit: "সেশন",
    price: 2000,
    district: "বাগেরহাট",
    mode: "retail",
    when: "এই মাসে",
    note: "ভিডিও কলে হলেও চলবে।",
  },
];
