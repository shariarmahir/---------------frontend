import type { SellerStage, TradeMode } from "../../lib/media/bazaar.ts";
import type { CategoryId } from "./types";
import { fieldsFor, PHYSICAL, PRODUCT_FORMS, TAG_IDEAS, type Field, type ProductForm } from "./bazaar.ts";

/**
 * বাজারের বিভাগ: everything people in Bangladesh buy and sell, in sections
 * and sub-sections. A sub-section points at a base category (the skill a
 * seller is rated on, and the default form), and may bring its own
 * questions, example title, uploads and delivery. Sections also name the
 * law a seller must respect where it matters (antiques, wildlife, land,
 * medicine). Pure data plus small resolvers, tested in integrity.test.ts.
 */

export type SectionIcon =
  | "food" | "farm" | "perform" | "creative" | "design" | "services" | "education" | "fashion" | "home" | "furniture"
  | "electronics" | "vehicles" | "health" | "kids" | "pets" | "sports" | "antique" | "heritage" | "industry" | "build"
  | "property" | "festival" | "other";

export interface MarketSub {
  id: string;
  bn: string;
  base: CategoryId;
  /** Words buyers type for this sub-section, Bangla and English. */
  keywords?: string;
  /** Hashtags offered while listing. */
  tags?: string[];
  kind?: "goods" | "service";
  fields?: Field[];
  form?: Partial<ProductForm>;
}

export interface MarketSection {
  id: string;
  bn: string;
  hint: string;
  icon: SectionIcon;
  kind?: "goods" | "service";
  /** Questions for every sub-section here, unless the sub-section has its own. */
  fields?: Field[];
  form?: Partial<ProductForm>;
  /** The rule a seller here must know, shown on the form and the section page. */
  note?: string;
  subs: MarketSub[];
}

// Questions shared by several sections. Keys never repeat a seller-stage key.
const CONDITION: Field = { key: "condition", label: "অবস্থা", kind: "select", required: true, options: ["নতুন", "প্রায় নতুন", "ব্যবহৃত — ভালো", "মেরামত লাগবে"] };
const MAKE = (placeholder: string): Field => ({ key: "make", label: "ব্র্যান্ড ও মডেল", kind: "text", required: true, placeholder });
const EXPIRY: Field = { key: "expiry", label: "মেয়াদ শেষ", kind: "date", required: true };
const BSTI: Field = { key: "bsti", label: "বিএসটিআই / অনুমোদন নম্বর", kind: "text", placeholder: "থাকলে নম্বর দিন" };
const GADGET: Field[] = [
  MAKE("Samsung A15, Walton ফ্রিজ 250L…"),
  CONDITION,
  { key: "warranty", label: "ওয়ারেন্টি", kind: "select", options: ["নেই", "দোকানের ওয়ারেন্টি আছে", "কোম্পানির ওয়ারেন্টি আছে"] },
  { key: "receipt", label: "বক্স ও রশিদ", kind: "select", options: ["বক্স ও রশিদসহ", "শুধু রশিদ", "কিছুই নেই"] },
];
const FURNITURE: Field[] = [
  { key: "material", label: "কাঠ / উপকরণ", kind: "select", required: true, options: ["সেগুন", "মেহগনি", "গামারি", "কড়ই", "বেত", "বাঁশ", "স্টিল", "প্লাস্টিক", "বোর্ড / পারটেক্স"] },
  { key: "dims", label: "মাপ", kind: "text", required: true, placeholder: "৭ × ৫ ফুট, উচ্চতা ৪ ফুট" },
  CONDITION,
  { key: "assembly", label: "পাঠানো হবে", kind: "select", options: ["জোড়া লাগানো অবস্থায়", "খুলে, বাসায় জোড়া দেওয়া হবে"] },
];
const VEHICLE: Field[] = [
  MAKE("Honda CB Hornet 160R, Toyota Axio 2016…"),
  { key: "year", label: "তৈরির সাল", kind: "number", required: true },
  { key: "km", label: "চলেছে (কিমি)", kind: "number" },
  { key: "papers", label: "কাগজপত্র", kind: "select", required: true, options: ["রেজিস্ট্রেশন, ফিটনেস ও ট্যাক্স টোকেন হালনাগাদ", "কাগজ আংশিক — বিস্তারিত লিখেছি", "রেজিস্ট্রেশন লাগে না"] },
  CONDITION,
];
const PERFORM: Field[] = [
  { key: "event", label: "কোন অনুষ্ঠানে", kind: "chips", required: true, options: ["বিয়ে", "জন্মদিন", "কর্পোরেট", "কনসার্ট", "নাটক / শুটিং", "স্কুল-কলেজ", "টিভি / অনলাইন"] },
  { key: "duration", label: "পারফর্মেন্স কতক্ষণ", kind: "text", required: true, placeholder: "১ ঘণ্টা, বা ৩টি শো" },
  { key: "team", label: "দলে কতজন", kind: "number" },
  { key: "travel", label: "যাতায়াত", kind: "select", options: ["দামের মধ্যে", "খরচ আলাদা", "শুধু নিজের জেলায়"] },
];
const BOOK: Field[] = [
  { key: "author", label: "লেখক / প্রকাশনী", kind: "text", required: true },
  { key: "edition", label: "সংস্করণ / সাল", kind: "text" },
  CONDITION,
];
const PET: Field[] = [
  { key: "breed", label: "জাত", kind: "text", required: true, placeholder: "পার্সিয়ান, বাজরিগার, গোল্ডফিশ…" },
  { key: "age", label: "বয়স", kind: "text", required: true },
  { key: "vaccine", label: "টিকা", kind: "select", options: ["সব টিকা দেওয়া", "আংশিক", "দেওয়া হয়নি", "প্রযোজ্য নয়"] },
];
const ANTIQUE: Field[] = [
  { key: "age", label: "আনুমানিক বয়স / আমল", kind: "text", required: true, placeholder: "ব্রিটিশ আমল, ১৯৬০-এর দশক…" },
  { key: "provenance", label: "কোথা থেকে পেয়েছেন", kind: "text", required: true, placeholder: "পারিবারিক সংগ্রহ, নিলাম থেকে কেনা…" },
  { key: "docs", label: "প্রমাণ", kind: "select", options: ["ক্রয়ের রশিদ", "নিলামের কাগজ", "পারিবারিক সূত্র", "নেই"] },
  CONDITION,
];
const HERITAGE: Field[] = [
  { key: "origin", label: "কোন জেলা ও এলাকার", kind: "text", required: true, placeholder: "রূপগঞ্জ, নারায়ণগঞ্জ" },
  { key: "maker", label: "কারিগর / উৎপাদক", kind: "text", placeholder: "কার হাতে বা কোন ঘরে তৈরি" },
  { key: "gi", label: "পরিচয়", kind: "select", required: true, options: ["জিআই নিবন্ধিত পণ্য", "ঐতিহ্যবাহী — জিআই নয়"] },
];
const FACTORY: Field[] = [
  { key: "moq", label: "সর্বনিম্ন অর্ডার", kind: "text", required: true, placeholder: "৫০০ পিস, ১ টন" },
  { key: "monthly", label: "মাসে কতটা উৎপাদন", kind: "text", placeholder: "২০,০০০ পিস" },
  { key: "certs", label: "সনদ", kind: "chips", options: ["ট্রেড লাইসেন্স", "বিএসটিআই", "আইএসও", "রপ্তানি নিবন্ধন (ইআরসি)", "পরিবেশ ছাড়পত্র"] },
  { key: "lead", label: "অর্ডার থেকে ডেলিভারি (দিন)", kind: "number" },
];
const BUILD: Field[] = [
  { key: "make", label: "ব্র্যান্ড ও গ্রেড", kind: "text", required: true, placeholder: "৫০০ ডব্লিউ রড, পোর্টল্যান্ড কম্পোজিট সিমেন্ট…" },
  { key: "lead", label: "সাইটে পৌঁছাতে (দিন)", kind: "number" },
];
const LAND: Field[] = [
  { key: "mouza", label: "মৌজা ও দাগ নম্বর", kind: "text", required: true },
  { key: "khatian", label: "খতিয়ান নম্বর", kind: "text", required: true },
  { key: "plot", label: "পরিমাণ (শতাংশ)", kind: "number", required: true },
  { key: "deeds", label: "যে কাগজ আছে", kind: "chips", required: true, options: ["দলিল", "বায়া দলিল", "নামজারি (মিউটেশন)", "খাজনার রশিদ", "পর্চা"] },
];
const CATTLE: Field[] = [
  { key: "breed", label: "জাত", kind: "text", required: true, placeholder: "দেশি, শাহীওয়াল, ব্ল্যাক বেঙ্গল…" },
  { key: "age", label: "বয়স (দাঁত)", kind: "text", required: true, placeholder: "২ দাঁত, ৪ দাঁত" },
  { key: "weight", label: "আনুমানিক ওজন (কেজি)", kind: "number" },
  { key: "feed", label: "কীভাবে মোটা হয়েছে", kind: "select", required: true, options: ["প্রাকৃতিক খাবার ও ঘাসে", "দানাদার খাবার মিশিয়ে"] },
  { key: "vaccine", label: "টিকা", kind: "select", options: ["সব টিকা দেওয়া", "আংশিক", "দেওয়া হয়নি"] },
];
const WRITER: Field[] = [
  { key: "genre", label: "কী লিখবেন", kind: "select", required: true, options: ["গল্প / উপন্যাস", "কবিতা ও গান", "নাটক ও চিত্রনাট্য", "বিজ্ঞাপনের কপি", "ওয়েব ও ব্লগ", "অনুবাদ"] },
  { key: "words", label: "কত শব্দ", kind: "number" },
  { key: "langs", label: "ভাষা", kind: "chips", required: true, options: ["বাংলা", "ইংরেজি", "আরবি", "হিন্দি / উর্দু"] },
];

const GOODS_MEDIA = (label: string, hint: string, max = 5): ProductForm["media"] => ({ label, hint, kinds: ["image", "video"], max, need: "image" });
const SHOWREEL: ProductForm["media"] = { label: "পারফর্মেন্সের ভিডিও ও ছবি", hint: "মঞ্চ বা শুটের আসল ভিডিও দিন — ক্রেতা আগে দেখে নেবেন।", kinds: ["video", "image", "audio"], max: 4, need: "video" };

export const SECTIONS: MarketSection[] = [
  {
    id: "food",
    bn: "খাবার ও মুদি",
    hint: "চাল-ডাল থেকে মাছ-মাংস, মিষ্টি আর ঘরের রান্না — প্রতিদিনের বাজার",
    icon: "food",
    note: "খাবারে ভেজাল, ফরমালিন বা মেয়াদোত্তীর্ণ পণ্য বিক্রি নিরাপদ খাদ্য আইনে দণ্ডনীয়।",
    subs: [
      { id: "rice", bn: "চাল, ডাল ও আটা", base: "farm", keywords: "চাল ডাল আটা ময়দা rice lentil miniket nazirshail", tags: ["চাল", "ডাল", "কাটারিভোগ"] },
      { id: "spice", bn: "তেল, মসলা ও লবণ", base: "farm", keywords: "সরিষার তেল মসলা হলুদ মরিচ জিরা লবণ oil spice", tags: ["সরিষারতেল", "মসলা", "হলুদ"] },
      { id: "fish", bn: "মাছ ও শুঁটকি", base: "farm", keywords: "মাছ ইলিশ রুই চিংড়ি শুঁটকি fish hilsa shrimp", tags: ["মাছ", "ইলিশ", "শুঁটকি"], form: { delivery: ["cold", "bus", "home"] } },
      { id: "meat", bn: "মাংস ও ডিম", base: "farm", keywords: "মাংস গরু খাসি মুরগি ডিম meat egg", tags: ["মাংস", "দেশিডিম"], form: { delivery: ["cold", "home", "pickup"] } },
      { id: "dairy", bn: "দুধ, দই ও ঘি", base: "farm", keywords: "দুধ দই ঘি মাখন পনির milk ghee", tags: ["খাঁটিদুধ", "ঘি"], form: { delivery: ["cold", "home"] } },
      { id: "fruit", bn: "ফল", base: "farm", keywords: "আম লিচু কাঁঠাল কলা পেয়ারা নারকেল fruit mango", tags: ["আম", "লিচু", "নারকেল"] },
      { id: "veg", bn: "শাকসবজি", base: "farm", keywords: "সবজি শাক আলু পেঁয়াজ বেগুন vegetable onion potato", tags: ["সবজি", "পেঁয়াজ", "আলু"] },
      { id: "honey", bn: "মধু, গুড় ও চিনি", base: "farm", keywords: "মধু গুড় খেজুর পাটালি আখ honey jaggery", tags: ["মধু", "গুড়", "পাটালি"] },
      { id: "sweets", bn: "মিষ্টি, পিঠা ও নাশতা", base: "cooking", keywords: "মিষ্টি পিঠা নাশতা রসগোল্লা sweets pitha", tags: ["পিঠা", "মিষ্টি"] },
      { id: "homecook", bn: "ঘরে রান্না খাবার ও টিফিন", base: "cooking", keywords: "ঘরের খাবার টিফিন বিরিয়ানি রান্না home food tiffin", tags: ["ঘরেরখাবার", "টিফিন"] },
      { id: "bakery", bn: "কেক, বেকারি ও স্ন্যাকস", base: "cooking", keywords: "কেক বিস্কুট রুটি বেকারি cake bakery snacks", tags: ["কেক", "বেকারি"] },
      { id: "pickle", bn: "আচার ও শুকনো খাবার", base: "cooking", keywords: "আচার চানাচুর মুড়ি চিড়া pickle", tags: ["আচার", "মুড়ি"] },
      { id: "drinks", bn: "চা, কফি ও পানীয়", base: "shop", keywords: "চা কফি শরবত জুস পানি tea coffee juice", tags: ["চা", "কফি"], fields: [MAKE("ইস্পাহানি, সিলেটের বাগানের চা…"), EXPIRY, BSTI] },
      { id: "grocery", bn: "মুদি ও নিত্যপণ্য", base: "shop", keywords: "মুদি দোকান সাবান ডিটারজেন্ট নিত্যপণ্য grocery", tags: ["মুদি", "নিত্যপণ্য"] },
      { id: "packaged", bn: "প্যাকেট ও হিমায়িত খাবার", base: "shop", keywords: "প্যাকেট ফ্রোজেন সসেজ নুডলস frozen packaged", tags: ["ফ্রোজেন"], fields: [MAKE("ব্র্যান্ড ও ওজন"), EXPIRY, BSTI], form: { delivery: ["cold", "home", "pickup"] } },
    ],
  },
  {
    id: "farm",
    bn: "কৃষক, খামার ও প্রজেক্ট",
    hint: "উৎপাদকের কাছ থেকে সরাসরি — মাঠ, বাগান, পুকুর, খামার আর চুক্তির চাষ",
    icon: "farm",
    note: "কীটনাশক ও সার শুধু নিবন্ধিত ব্র্যান্ড; নিষিদ্ধ কীটনাশক বিক্রি করা যাবে না।",
    subs: [
      { id: "crops", bn: "ধান, গম ও ভুট্টা", base: "farm", keywords: "ধান গম ভুট্টা ফসল paddy wheat maize", tags: ["ধান", "ভুট্টা"], form: { unit: "মণ", delivery: ["truck", "train", "pickup"] } },
      { id: "jute", bn: "পাট ও আঁশ", base: "farm", keywords: "পাট আঁশ সোনালি jute fibre", tags: ["পাট"], form: { unit: "মণ", delivery: ["truck", "train", "pickup"] } },
      { id: "orchard", bn: "ফল বাগান ও মৌসুমি চুক্তি", base: "farm", keywords: "বাগান আম লিচু মৌসুম চুক্তি orchard lease", tags: ["আমবাগান", "লিচুবাগান"] },
      { id: "vegfarm", bn: "সবজি ও মসলার চাষ", base: "farm", keywords: "সবজি চাষ পেঁয়াজ রসুন আদা মরিচ", tags: ["সবজি", "বিষমুক্ত"] },
      { id: "fishfarm", bn: "মাছ চাষ ও পোনা", base: "farm", keywords: "পুকুর মাছ পোনা রেণু চিংড়ি ঘের fish farm fry", tags: ["পোনা", "মাছচাষ"], form: { delivery: ["cold", "truck", "pickup"] } },
      { id: "cattle", bn: "গরু, ছাগল ও ভেড়া", base: "farm", keywords: "গরু ছাগল ভেড়া মহিষ কুরবানি cow goat cattle qurbani", tags: ["কুরবানি", "গরু", "ছাগল"], fields: CATTLE, form: { title: "দেশি ষাঁড় — প্রাকৃতিক খাবারে বড়, ৪ দাঁত", unit: "পিস", delivery: ["truck", "pickup"], media: GOODS_MEDIA("পশুর ছবি ও হাঁটার ভিডিও", "চার দিক থেকে ছবি আর হাঁটার ছোট ভিডিও দিন।") } },
      { id: "poultry", bn: "হাঁস, মুরগি ও কবুতর", base: "farm", keywords: "মুরগি হাঁস কবুতর ব্রয়লার দেশি poultry duck", tags: ["দেশিমুরগি", "হাঁস"], form: { unit: "পিস" } },
      { id: "dairyfarm", bn: "দুগ্ধ ও গাভী খামার", base: "farm", keywords: "গাভী দুধ খামার dairy farm cow", tags: ["গাভী", "দুধ"] },
      { id: "seeds", bn: "বীজ, চারা ও কলম", base: "farm", keywords: "বীজ চারা কলম নার্সারি seed sapling", tags: ["বীজ", "চারা"], form: { unit: "প্যাকেট", delivery: ["courier", "bus", "pickup"] } },
      { id: "inputs", bn: "সার, কীটনাশক ও পশুখাদ্য", base: "shop", keywords: "সার ইউরিয়া কীটনাশক পশুখাদ্য ফিড fertilizer feed", tags: ["জৈবসার", "ফিড"], fields: [MAKE("ব্র্যান্ড ও নিবন্ধন নম্বর"), EXPIRY], form: { unit: "বস্তা", delivery: ["truck", "pickup"] } },
      { id: "agrimach", bn: "কৃষি যন্ত্র — বিক্রি ও ভাড়া", base: "shop", keywords: "ট্রাক্টর পাওয়ার টিলার সেচ পাম্প হারভেস্টার tractor pump", tags: ["পাওয়ারটিলার", "সেচপাম্প"], fields: [MAKE("কুবোটা পাওয়ার টিলার…"), CONDITION], form: { unit: "পিস", delivery: ["truck", "pickup"] } },
      { id: "project", bn: "খামার প্রজেক্ট ও চুক্তির চাষ", base: "farm", kind: "service", keywords: "প্রজেক্ট চুক্তি চাষ বিনিয়োগ contract farming project", tags: ["চুক্তিরচাষ"], fields: [{ key: "acres", label: "জমি / খামারের আয়তন", kind: "text", required: true, placeholder: "৫ বিঘা, ২টি পুকুর" }, { key: "term", label: "মেয়াদ", kind: "text", required: true, placeholder: "এক মৌসুম, ২ বছর" }, { key: "share", label: "ভাগ কীভাবে", kind: "text", placeholder: "লাভের ৬০:৪০, নির্দিষ্ট দামে কিনে নেওয়া" }], form: { title: "১০ বিঘা জমিতে চুক্তিতে বিষমুক্ত সবজি চাষ", unit: "প্রজেক্ট", delivery: ["onsite"] } },
    ],
  },
  {
    id: "perform",
    bn: "পারফর্মিং শিল্পী",
    hint: "গায়ক, অভিনেতা, জাদুকর, মডেল, নৃত্যশিল্পী — অনুষ্ঠান বা শুটে ডাকুন",
    icon: "perform",
    kind: "service",
    fields: PERFORM,
    form: { title: "বিয়ে ও অনুষ্ঠানে লাইভ গান — ২ ঘণ্টা, দলসহ", details: "কী পরিবেশন করবেন, কতক্ষণ, দলে কারা, সাউন্ড সিস্টেম কে দেবে, কত আগে বুক করতে হবে।", media: SHOWREEL, unit: "অনুষ্ঠান", delivery: ["onsite"] },
    subs: [
      { id: "singer", bn: "কণ্ঠশিল্পী ও গায়ক", base: "music", keywords: "গায়ক গায়িকা কণ্ঠশিল্পী singer vocalist", tags: ["লাইভগান", "গায়ক"] },
      { id: "musician", bn: "যন্ত্রশিল্পী ও ব্যান্ড", base: "music", keywords: "গিটার তবলা বাঁশি ব্যান্ড musician band", tags: ["ব্যান্ড", "তবলা", "বাঁশি"] },
      { id: "folk", bn: "লোকশিল্পী, বাউল ও কবিগান", base: "music", keywords: "বাউল লালন কবিগান জারি সারি ভাটিয়ালি folk baul", tags: ["বাউল", "লোকগান"] },
      { id: "actor", bn: "অভিনেতা ও অভিনয়শিল্পী", base: "photo", keywords: "অভিনয় অভিনেতা নাটক বিজ্ঞাপন actor acting", tags: ["অভিনয়", "নাটক"], form: { title: "নাটক, বিজ্ঞাপন ও শর্টফিল্মে অভিনয়", unit: "দিন" } },
      { id: "model", bn: "মডেল", base: "photo", keywords: "মডেল মডেলিং ফ্যাশন শুট model modelling", tags: ["মডেলিং", "ফ্যাশনশুট"], form: { title: "পোশাক ও পণ্যের মডেলিং — অর্ধেক দিন", unit: "দিন" } },
      { id: "magician", bn: "জাদুকর", base: "photo", keywords: "জাদু ম্যাজিক জাদুকর magician magic", tags: ["জাদু", "শিশুদেরঅনুষ্ঠান"], form: { title: "জন্মদিনে শিশুদের জাদু প্রদর্শনী — ৪৫ মিনিট" } },
      { id: "dancer", bn: "নৃত্যশিল্পী", base: "photo", keywords: "নাচ নৃত্য ক্লাসিক্যাল লোকনৃত্য dancer dance", tags: ["নৃত্য"] },
      { id: "host", bn: "উপস্থাপক ও এমসি", base: "photo", keywords: "উপস্থাপক এমসি সঞ্চালক host anchor emcee", tags: ["উপস্থাপনা"], form: { title: "অনুষ্ঠান উপস্থাপনা — বাংলা ও ইংরেজি" } },
      { id: "comedy", bn: "কৌতুক ও স্ট্যান্ড-আপ", base: "photo", keywords: "কৌতুক কমেডি স্ট্যান্ডআপ comedy comedian", tags: ["কমেডি"] },
      { id: "voice", bn: "ভয়েস ওভার ও আবৃত্তি", base: "music", keywords: "ভয়েস ওভার আবৃত্তি ডাবিং voice over recitation", tags: ["ভয়েসওভার", "আবৃত্তি"], fields: [{ key: "langs", label: "ভাষা", kind: "chips", required: true, options: ["বাংলা", "ইংরেজি", "আঞ্চলিক"] }, { key: "turn", label: "ফাইল পাবেন (দিন)", kind: "number", required: true }], form: { title: "বিজ্ঞাপন ও তথ্যচিত্রের ভয়েস ওভার — ১ মিনিট", media: { label: "কণ্ঠের নমুনা", hint: "৩০ সেকেন্ডের পরিষ্কার রেকর্ডিং দিন।", kinds: ["audio", "video"], max: 3, need: "audio" }, unit: "প্রজেক্ট", delivery: ["digital"] } },
    ],
  },
  {
    id: "creative",
    bn: "সৃজনশীল ও ডিজিটাল",
    hint: "গান, আঁকা, লেখা, ডিজাইন, এডিট, অ্যানিমেশন, ভিএফএক্স — কাজ দেখিয়ে বিক্রি",
    icon: "creative",
    note: "অন্যের গান, ছবি বা ফন্ট নিজের বলে বিক্রি করলে কপিরাইট আইন ভঙ্গ হয়।",
    subs: [
      { id: "songs", bn: "গান ও সুর — লাইসেন্স", base: "music", keywords: "গান সুর জিঙ্গেল ব্যাকগ্রাউন্ড মিউজিক song jingle license", tags: ["গান", "জিঙ্গেল"] },
      { id: "painting", bn: "চিত্রকলা ও পেইন্টিং", base: "art", keywords: "ছবি আঁকা পেইন্টিং জলরং তেলরং painting artist", tags: ["জলরং", "তেলরং"] },
      { id: "cartoon", bn: "কার্টুন, কমিকস ও ইলাস্ট্রেশন", base: "art", keywords: "কার্টুন কমিকস ইলাস্ট্রেশন cartoonist comic illustration", tags: ["কার্টুন", "ইলাস্ট্রেশন"] },
      { id: "calligraphy", bn: "ক্যালিগ্রাফি", base: "art", keywords: "ক্যালিগ্রাফি আরবি বাংলা হস্তলিপি calligraphy", tags: ["ক্যালিগ্রাফি"] },
      { id: "writing", bn: "লেখা, কপিরাইটিং ও অনুবাদ", base: "content", keywords: "লেখক কপিরাইটার স্ক্রিপ্ট অনুবাদ writer copywriter translation", tags: ["কপিরাইটিং", "অনুবাদ"], fields: WRITER, form: { title: "ফেসবুক বিজ্ঞাপনের ১০টি বাংলা কপি", media: { label: "আগের লেখার নমুনা", hint: "স্ক্রিনশট বা পিডিএফের ছবি।", kinds: ["image"], max: 4 } } },
      { id: "graphic", bn: "গ্রাফিক ডিজাইন ও লোগো", base: "content", keywords: "গ্রাফিক লোগো ব্যানার পোস্টার graphic logo", tags: ["লোগো", "গ্রাফিক্স"] },
      { id: "videoedit", bn: "ভিডিও এডিটিং", base: "content", keywords: "ভিডিও এডিট রিল ইউটিউব video editing reel", tags: ["ভিডিওএডিটিং", "রিল"] },
      { id: "audioedit", bn: "অডিও এডিটিং ও সাউন্ড ডিজাইন", base: "content", keywords: "অডিও এডিট মিক্সিং মাস্টারিং পডকাস্ট audio mixing sound", tags: ["মিক্সিং", "পডকাস্ট"], form: { media: { label: "আগে-পরে অডিও নমুনা", hint: "কাঁচা আর এডিট করা দুটো নমুনা পাশাপাশি দিন।", kinds: ["audio", "video"], max: 4, need: "audio" } } },
      { id: "photography", bn: "ফটোগ্রাফি ও ভিডিওগ্রাফি", base: "photo", keywords: "ফটোগ্রাফার ছবি তোলা বিয়ের ছবি ভিডিওগ্রাফি photographer", tags: ["ফটোগ্রাফি", "বিয়েরছবি"] },
      { id: "film", bn: "চলচ্চিত্র, তথ্যচিত্র ও বিজ্ঞাপন নির্মাণ", base: "content", keywords: "ফিল্ম শর্টফিল্ম তথ্যচিত্র বিজ্ঞাপন নির্মাতা film documentary tvc", tags: ["শর্টফিল্ম", "বিজ্ঞাপন"], form: { media: { label: "শোরিল ও আগের কাজ", hint: "১–২ মিনিটের শোরিল দিন।", kinds: ["video", "image"], max: 4, need: "video" } } },
      { id: "animation", bn: "২ডি অ্যানিমেশন ও মোশন গ্রাফিক্স", base: "content", keywords: "অ্যানিমেশন মোশন গ্রাফিক্স কার্টুন ভিডিও animation motion", tags: ["অ্যানিমেশন", "মোশনগ্রাফিক্স"] },
      { id: "3d", bn: "৩ডি মডেলিং ও ৩ডি ভিডিও", base: "design", keywords: "থ্রিডি ৩ডি ব্লেন্ডার রেন্ডার 3d blender render", tags: ["৩ডি", "ব্লেন্ডার"] },
      { id: "vfx", bn: "ভিএফএক্স ও কম্পোজিটিং", base: "content", keywords: "ভিএফএক্স কম্পোজিটিং ভিজ্যুয়াল ইফেক্ট vfx compositing", tags: ["ভিএফএক্স"] },
      { id: "uiux", bn: "ওয়েব ও অ্যাপ ইউআই/ইউএক্স ডিজাইন", base: "design", keywords: "ইউআই ইউএক্স ফিগমা অ্যাপ ডিজাইন ui ux figma", tags: ["ইউআইডিজাইন", "ফিগমা"] },
      { id: "assets", bn: "স্টক ছবি, ফন্ট ও টেমপ্লেট", base: "design", keywords: "স্টক ছবি ফন্ট টেমপ্লেট stock font template", tags: ["টেমপ্লেট", "বাংলাফন্ট"] },
    ],
  },
  {
    id: "design",
    bn: "স্থাপত্য, প্রকৌশল ও নকশা",
    hint: "বাড়ির নকশা, অটোক্যাড, ইন্টেরিয়র, সিভিল-ইলেকট্রিক্যাল আর আইওটি",
    icon: "design",
    kind: "service",
    subs: [
      { id: "architect", bn: "স্থপতি ও বাড়ির নকশা", base: "design", keywords: "স্থপতি বাড়ির নকশা আর্কিটেক্ট architect house plan", tags: ["বাড়িরনকশা"] },
      { id: "autocad", bn: "অটোক্যাড ড্রাফটিং", base: "design", keywords: "অটোক্যাড ড্রয়িং ড্রাফটিং autocad drafting", tags: ["অটোক্যাড"] },
      { id: "interior", bn: "ইন্টেরিয়র ডিজাইন", base: "design", keywords: "ইন্টেরিয়র ঘর সাজানো নকশা interior", tags: ["ইন্টেরিয়র"] },
      { id: "civil", bn: "স্ট্রাকচারাল ও সিভিল প্রকৌশল", base: "engineering", keywords: "সিভিল স্ট্রাকচারাল ভবন নকশা civil structural", tags: ["সিভিল"] },
      { id: "electrical", bn: "ইলেকট্রিক্যাল ও সোলার নকশা", base: "engineering", keywords: "ইলেকট্রিক্যাল সোলার ওয়্যারিং নকশা electrical solar", tags: ["সোলার"] },
      { id: "iot", bn: "আইওটি, রোবটিক্স ও প্রোটোটাইপ", base: "engineering", keywords: "আইওটি রোবট প্রোটোটাইপ সেন্সর iot robotics prototype", tags: ["আইওটি", "রোবটিক্স"] },
      { id: "survey", bn: "জমি জরিপ ও ম্যাপিং", base: "engineering", keywords: "জরিপ আমিন ম্যাপ survey mapping", tags: ["জরিপ"] },
    ],
  },
  {
    id: "services",
    bn: "পেশাদার ও গৃহসেবা",
    hint: "সফটওয়্যার থেকে মেরামত, দর্জি, আইনি পরামর্শ, অনুষ্ঠান আয়োজন — ন্যায্য মজুরিতে",
    icon: "services",
    kind: "service",
    subs: [
      { id: "software", bn: "সফটওয়্যার, ওয়েব ও অ্যাপ", base: "tech", keywords: "ওয়েবসাইট অ্যাপ সফটওয়্যার প্রোগ্রামার website app software", tags: ["ওয়েবসাইট", "অ্যাপ"] },
      { id: "repair", bn: "মেরামত — মোবাইল, ইলেকট্রনিক্স, গাড়ি", base: "homeservice", keywords: "মেরামত মিস্ত্রি মোবাইল সার্ভিসিং মেকানিক repair mechanic", tags: ["মেরামত", "মেকানিক"] },
      { id: "electrician", bn: "ইলেকট্রিশিয়ান ও প্লাম্বার", base: "homeservice", keywords: "ইলেকট্রিশিয়ান প্লাম্বার কল মিস্ত্রি electrician plumber", tags: ["ইলেকট্রিশিয়ান", "প্লাম্বার"] },
      { id: "ac", bn: "এসি, ফ্রিজ ও ঘরের যন্ত্র সার্ভিস", base: "homeservice", keywords: "এসি ফ্রিজ সার্ভিস গ্যাস ac fridge service", tags: ["এসিসার্ভিস"] },
      { id: "cleaning", bn: "ঘর পরিষ্কার ও পোকামাকড় দমন", base: "homeservice", keywords: "পরিষ্কার ক্লিনিং তেলাপোকা উইপোকা cleaning pest", tags: ["ক্লিনিং"] },
      { id: "movers", bn: "বাসা বদল ও মালামাল পরিবহন", base: "homeservice", keywords: "বাসা বদল শিফটিং পিকআপ মুভার্স shifting movers", tags: ["বাসাবদল"] },
      { id: "tailor", bn: "দর্জি ও সেলাই", base: "crafts", kind: "service", keywords: "দর্জি সেলাই ব্লাউজ ফিটিং tailor stitching", tags: ["দর্জি", "সেলাই"], fields: [{ key: "items", label: "কী সেলাই করেন", kind: "chips", required: true, options: ["ব্লাউজ", "থ্রি-পিস", "পাঞ্জাবি", "শার্ট-প্যান্ট", "স্কুল ড্রেস", "অল্টার"] }, { key: "ready", label: "হাতে পাবেন (দিন)", kind: "number", required: true }], form: { unit: "পিস", delivery: ["pickup", "home", "courier"] } },
      { id: "beauty", bn: "রূপচর্চা, মেহেদি ও পার্লার", base: "beauty", keywords: "মেহেদি মেকআপ পার্লার চুল beauty mehndi makeup", tags: ["মেহেদি", "মেকআপ"] },
      { id: "legal", bn: "আইনি পরামর্শ", base: "legal", keywords: "আইনজীবী উকিল মামলা দলিল lawyer legal", tags: ["আইনিসেবা", "জমিজমা"] },
      { id: "accounts", bn: "হিসাব, ট্যাক্স ও কাগজপত্র", base: "finance", keywords: "আয়কর রিটার্ন হিসাব ট্রেড লাইসেন্স tax accounting", tags: ["আয়কর"] },
      { id: "event", bn: "অনুষ্ঠান আয়োজন ও ডেকোরেশন", base: "other", kind: "service", keywords: "ইভেন্ট ডেকোরেশন বিয়ে গায়ে হলুদ event decoration", tags: ["ডেকোরেশন", "বিয়ে"], fields: [{ key: "event", label: "কোন অনুষ্ঠান", kind: "chips", required: true, options: ["বিয়ে", "গায়ে হলুদ", "জন্মদিন", "আকিকা", "কর্পোরেট", "স্কুল-কলেজ"] }, { key: "guests", label: "অতিথি পর্যন্ত", kind: "number" }, { key: "includes", label: "দামের মধ্যে", kind: "chips", options: ["মঞ্চ", "ফুল", "আলো", "সাউন্ড", "ছবি", "খাবার"] }], form: { title: "গায়ে হলুদের মঞ্চ ও ফুলের সাজ — ২০০ অতিথি", details: "কী কী সাজাবেন, কতজনের জন্য, কত আগে বুক করতে হবে।", media: GOODS_MEDIA("আগের অনুষ্ঠানের ছবি ও ভিডিও", "নিজের করা সাজের ছবি দিন।"), unit: "অনুষ্ঠান", delivery: ["onsite"] } },
      { id: "catering", bn: "ক্যাটারিং ও বাবুর্চি", base: "cooking", kind: "service", keywords: "বাবুর্চি ক্যাটারিং বিয়ের রান্না catering cook", tags: ["বাবুর্চি", "ক্যাটারিং"], fields: [{ key: "guests", label: "কতজনের রান্না", kind: "number", required: true }, { key: "menu", label: "মেনু", kind: "text", required: true, placeholder: "কাচ্চি, রোস্ট, বোরহানি…" }], form: { unit: "অনুষ্ঠান", delivery: ["onsite"] } },
      { id: "guide", bn: "ভ্রমণ ও গাইড", base: "travel", keywords: "গাইড ট্যুর ভ্রমণ ট্রেকিং guide tour", tags: ["ট্রেকিং", "ভ্রমণ"] },
      { id: "driver", bn: "চালক ও ভাড়ায় গাড়ি", base: "other", kind: "service", keywords: "ড্রাইভার চালক গাড়ি ভাড়া driver rent a car", tags: ["ড্রাইভার", "গাড়িভাড়া"], fields: [{ key: "vehicle", label: "গাড়ি", kind: "select", required: true, options: ["গাড়ি ছাড়া শুধু চালক", "প্রাইভেট কার", "মাইক্রোবাস", "পিকআপ", "ট্রাক"] }, { key: "licence", label: "ড্রাইভিং লাইসেন্স", kind: "select", required: true, options: ["পেশাদার লাইসেন্স আছে", "অপেশাদার লাইসেন্স আছে"] }], form: { unit: "দিন", delivery: ["onsite"] } },
      { id: "care", bn: "সেবাযত্ন — বয়স্ক, শিশু ও রোগী", base: "other", kind: "service", keywords: "আয়া নার্স বয়স্ক যত্ন শিশু দেখাশোনা caregiver nurse", tags: ["সেবাযত্ন"], fields: [{ key: "who", label: "কাদের যত্ন", kind: "chips", required: true, options: ["বয়স্ক", "শিশু", "রোগী", "প্রতিবন্ধী"] }, { key: "training", label: "প্রশিক্ষণ", kind: "text", placeholder: "নার্সিং ডিপ্লোমা, প্রাথমিক চিকিৎসা" }], form: { unit: "মাস", delivery: ["onsite"] } },
      { id: "coach", bn: "ফিটনেস ও খেলার কোচ", base: "sports", keywords: "কোচ ফিটনেস জিম সাঁতার ক্রিকেট coach fitness", tags: ["কোচিং", "ফিটনেস"] },
    ],
  },
  {
    id: "education",
    bn: "শিক্ষা",
    hint: "টিউশন, কোচিং, কোর্স, ভাষা আর বই-খাতা-কলম",
    icon: "education",
    subs: [
      { id: "tuition", bn: "প্রাইভেট টিউশন", base: "teaching", kind: "service", keywords: "টিউশন প্রাইভেট শিক্ষক tutor tuition", tags: ["টিউশন"] },
      { id: "admission", bn: "কোচিং ও ভর্তি প্রস্তুতি", base: "teaching", kind: "service", keywords: "কোচিং ভর্তি বিশ্ববিদ্যালয় মেডিকেল বিসিএস admission coaching bcs", tags: ["ভর্তিপ্রস্তুতি", "বিসিএস"] },
      { id: "language", bn: "ভাষা শিক্ষা", base: "teaching", kind: "service", keywords: "ইংরেজি আরবি জাপানি কোরিয়ান আইইএলটিএস english ielts language", tags: ["ইংরেজি", "আইইএলটিএস"] },
      { id: "vocational", bn: "কারিগরি ও দক্ষতা প্রশিক্ষণ", base: "teaching", kind: "service", keywords: "কারিগরি ইলেকট্রিক্যাল ড্রাইভিং সেলাই প্রশিক্ষণ vocational training", tags: ["প্রশিক্ষণ"] },
      { id: "course", bn: "অনলাইন কোর্স (রেকর্ড করা)", base: "teaching", kind: "service", keywords: "অনলাইন কোর্স ভিডিও ক্লাস online course", tags: ["অনলাইনকোর্স"], form: { unit: "লাইসেন্স", delivery: ["digital"] } },
      { id: "religious", bn: "কুরআন ও ধর্মীয় শিক্ষা", base: "teaching", kind: "service", keywords: "কুরআন হিফজ আরবি ধর্মীয় শিক্ষা quran", tags: ["কুরআনশিক্ষা"] },
      { id: "arts-class", bn: "গান, আঁকা ও নাচ শেখা", base: "teaching", kind: "service", keywords: "গান শেখা আঁকা নাচ ক্লাস music class drawing class", tags: ["গানশেখা", "আঁকাশেখা"] },
      { id: "textbooks", bn: "পাঠ্যবই, গাইড ও নোট", base: "shop", kind: "goods", keywords: "বই গাইড নোট পাঠ্যবই textbook guide notes", tags: ["বই", "নোট"], fields: BOOK, form: { title: "এইচএসসি পদার্থবিজ্ঞান ১ম ও ২য় পত্র — পরিষ্কার কপি", unit: "পিস", delivery: ["courier", "pickup"], media: GOODS_MEDIA("বইয়ের কভার ও ভেতরের পাতার ছবি", "দাগ বা ছেঁড়া থাকলে সেটার ছবিও দিন।") } },
      { id: "books", bn: "গল্প, উপন্যাস ও অন্যান্য বই", base: "shop", kind: "goods", keywords: "বই উপন্যাস গল্প কবিতা novel books", tags: ["বই", "উপন্যাস"], fields: BOOK, form: { title: "হুমায়ূন আহমেদের ১০টি উপন্যাস — একসাথে", unit: "সেট", delivery: ["courier", "pickup"], media: GOODS_MEDIA("বইয়ের ছবি", "সব বই একসাথে আর আলাদা কভারের ছবি।") } },
      { id: "stationery", bn: "স্টেশনারি ও খাতা-কলম", base: "shop", kind: "goods", keywords: "খাতা কলম পেন্সিল স্টেশনারি stationery", tags: ["স্টেশনারি"], form: { title: "স্কুলের খাতা-কলম প্যাকেজ — ক্লাস ১-৫", unit: "প্যাকেট", delivery: ["home", "courier", "pickup"] } },
      { id: "kits", bn: "শিক্ষা উপকরণ ও সায়েন্স কিট", base: "shop", kind: "goods", keywords: "সায়েন্স কিট মডেল মাইক্রোস্কোপ রোবট কিট science kit", tags: ["সায়েন্সকিট"], form: { title: "স্কুল সায়েন্স প্রজেক্ট কিট — ২০টি পরীক্ষা", unit: "সেট", delivery: ["courier", "pickup"] } },
    ],
  },
  {
    id: "fashion",
    bn: "পোশাক ও ফ্যাশন",
    hint: "শাড়ি, পাঞ্জাবি, জুতা, গয়না, ব্যাগ, প্রসাধনী — নতুন আর পুরনো",
    icon: "fashion",
    kind: "goods",
    subs: [
      { id: "women", bn: "নারীর পোশাক — শাড়ি, থ্রি-পিস, বোরকা", base: "fashion", keywords: "শাড়ি থ্রিপিস সালোয়ার কামিজ বোরকা হিজাব saree three piece", tags: ["শাড়ি", "থ্রিপিস"] },
      { id: "men", bn: "পুরুষের পোশাক — পাঞ্জাবি, শার্ট, লুঙ্গি", base: "fashion", keywords: "পাঞ্জাবি শার্ট প্যান্ট লুঙ্গি ফতুয়া panjabi shirt lungi", tags: ["পাঞ্জাবি", "লুঙ্গি"] },
      { id: "kidswear", bn: "শিশুর পোশাক", base: "fashion", keywords: "শিশুর জামা বাচ্চার পোশাক kids wear", tags: ["শিশুরপোশাক"] },
      { id: "fabric", bn: "থান ও গজ কাপড়", base: "fashion", keywords: "থান কাপড় গজ সুতি সিল্ক fabric", tags: ["থানকাপড়"], form: { unit: "গজ" } },
      { id: "shoes", bn: "জুতা ও স্যান্ডেল", base: "fashion", keywords: "জুতা স্যান্ডেল চামড়ার জুতা shoes sandal", tags: ["জুতা", "চামড়ারজুতা"], fields: [{ key: "sizes", label: "মাপ", kind: "chips", required: true, options: ["৩৬", "৩৭", "৩৮", "৩৯", "৪০", "৪১", "৪২", "৪৩", "৪৪"] }, { key: "material", label: "উপকরণ", kind: "select", options: ["খাঁটি চামড়া", "কৃত্রিম চামড়া", "কাপড়", "রাবার"] }, CONDITION], form: { unit: "জোড়া" } },
      { id: "jewelry", bn: "গয়না ও অলংকার", base: "fashion", keywords: "গয়না সোনা রুপা চুড়ি নাকফুল ইমিটেশন jewellery gold", tags: ["গয়না", "ইমিটেশন"], fields: [{ key: "metal", label: "ধাতু", kind: "select", required: true, options: ["সোনা ২২ ক্যারেট", "সোনা ২১ ক্যারেট", "রুপা", "ইমিটেশন", "পিতল / তামা"] }, { key: "weight", label: "ওজন", kind: "text", placeholder: "১ ভরি ২ আনা" }, { key: "hallmark", label: "হলমার্ক", kind: "select", options: ["হলমার্ক আছে", "নেই", "প্রযোজ্য নয়"] }], form: { unit: "পিস", delivery: ["courier", "pickup"] } },
      { id: "bags", bn: "ব্যাগ, বেল্ট ও এক্সেসরিজ", base: "fashion", keywords: "ব্যাগ বেল্ট মানিব্যাগ হ্যান্ডব্যাগ bag belt wallet", tags: ["ব্যাগ", "চামড়ারব্যাগ"] },
      { id: "watches", bn: "ঘড়ি ও চশমা", base: "fashion", keywords: "ঘড়ি চশমা সানগ্লাস watch sunglass", tags: ["ঘড়ি"], fields: [MAKE("Casio, Titan…"), CONDITION] },
      { id: "cosmetics", bn: "প্রসাধনী ও স্কিনকেয়ার", base: "shop", keywords: "প্রসাধনী লোশন ক্রিম লিপস্টিক skincare cosmetics", tags: ["স্কিনকেয়ার"], fields: [MAKE("ব্র্যান্ড ও পরিমাণ"), EXPIRY, BSTI] },
      { id: "perfume", bn: "আতর ও সুগন্ধি", base: "shop", keywords: "আতর পারফিউম সুগন্ধি attar perfume", tags: ["আতর"], fields: [MAKE("আতরের নাম ও মিলি"), BSTI] },
      { id: "preloved", bn: "পুরনো পোশাক — ভালো অবস্থায়", base: "fashion", keywords: "পুরনো ব্যবহৃত পোশাক second hand preloved", tags: ["পুরনোপোশাক"], fields: [{ key: "size", label: "মাপ", kind: "text", required: true }, CONDITION] },
    ],
  },
  {
    id: "home",
    bn: "ঘর, বাগান ও সাজসজ্জা",
    hint: "শোপিস, বাসনকোসন, পর্দা, বাতি, গাছ আর ছাদবাগান",
    icon: "home",
    kind: "goods",
    form: { title: "মাটির টব — ৫টির সেট, হাতে রং করা", details: "কী দিয়ে তৈরি, মাপ, কতটি, নতুন না ব্যবহৃত, কীভাবে পাঠাবেন।", media: GOODS_MEDIA("জিনিসের ছবি", "আসল ঘরে রাখা অবস্থায় ছবি দিন।"), unit: "পিস", delivery: ["courier", "home", "pickup"] },
    subs: [
      { id: "decor", bn: "ঘর সাজানো ও শোপিস", base: "crafts", keywords: "শোপিস ঘর সাজানো দেয়ালচিত্র decor showpiece", tags: ["হোমডেকর"] },
      { id: "kitchen", bn: "রান্নাঘর ও বাসনকোসন", base: "shop", keywords: "হাঁড়ি পাতিল বাসন প্রেশার কুকার kitchen utensils", tags: ["বাসনকোসন"], fields: [MAKE("কিয়াম প্রেশার কুকার ৫ লিটার…"), CONDITION] },
      { id: "bedding", bn: "বিছানা, পর্দা ও কার্পেট", base: "crafts", keywords: "চাদর বালিশ পর্দা কার্পেট কম্বল bedsheet curtain", tags: ["বিছানারচাদর", "পর্দা"], fields: [{ key: "material", label: "কাপড়", kind: "text", required: true }, { key: "size", label: "মাপ", kind: "text", required: true }] },
      { id: "lights", bn: "বাতি ও আলোকসজ্জা", base: "shop", keywords: "বাতি এলইডি ঝাড়বাতি মরিচবাতি light led", tags: ["এলইডি"], fields: [MAKE("এলইডি, ১২ ওয়াট…"), CONDITION] },
      { id: "plants", bn: "গাছ, চারা ও টব", base: "farm", keywords: "গাছ চারা ফুলগাছ বনসাই টব plant nursery bonsai", tags: ["ছাদবাগান", "ফুলগাছ"], fields: [{ key: "species", label: "গাছের নাম", kind: "text", required: true }, { key: "height", label: "উচ্চতা", kind: "text" }], form: { delivery: ["home", "bus", "pickup"] } },
      { id: "garden", bn: "বাগান ও ছাদবাগানের সামগ্রী", base: "shop", keywords: "মাটি কোকোপিট টব স্প্রে garden supplies", tags: ["ছাদবাগান"] },
      { id: "household", bn: "পরিষ্কারক ও গৃহস্থালি", base: "shop", keywords: "ঝাড়ু বালতি পরিষ্কারক হ্যান্ডওয়াশ household", tags: ["গৃহস্থালি"] },
      { id: "handmade", bn: "হাতে তৈরি ঘরের জিনিস", base: "crafts", keywords: "হাতে তৈরি পাটের জিনিস হস্তশিল্প handmade jute", tags: ["হাতেরকাজ", "পাটপণ্য"] },
    ],
  },
  {
    id: "furniture",
    bn: "আসবাবপত্র",
    hint: "খাট, আলমারি, সোফা, বেত-বাঁশ, অফিসের আসবাব — নতুন, পুরনো বা অর্ডারে",
    icon: "furniture",
    kind: "goods",
    fields: FURNITURE,
    form: { title: "সেগুন কাঠের খাট — ৭ × ৫ ফুট, পালিশ করা", details: "কোন কাঠ, মাপ, কত বছরের, কোথাও ভাঙা বা দাগ আছে কি না, জোড়া লাগিয়ে দেবেন কি না।", media: GOODS_MEDIA("আসবাবের সব দিকের ছবি", "সামনে, পাশে আর জোড়ার কাছের ছবি দিন।", 6), unit: "পিস", delivery: ["truck", "pickup", "home"] },
    subs: [
      { id: "wood", bn: "কাঠের আসবাব — খাট, আলমারি, টেবিল", base: "crafts", keywords: "খাট আলমারি ড্রেসিং টেবিল চেয়ার কাঠ bed wardrobe wood", tags: ["সেগুনকাঠ", "খাট"] },
      { id: "sofa", bn: "সোফা ও বসার ঘর", base: "crafts", keywords: "সোফা ডিভান সেন্টার টেবিল sofa", tags: ["সোফা"] },
      { id: "cane", bn: "বেত ও বাঁশের আসবাব", base: "crafts", keywords: "বেত বাঁশ মোড়া cane bamboo", tags: ["বেতেরআসবাব"] },
      { id: "steel", bn: "স্টিল ও প্লাস্টিকের আসবাব", base: "shop", keywords: "স্টিল আলমারি প্লাস্টিক চেয়ার steel plastic", tags: ["স্টিলেরআলমারি"] },
      { id: "office", bn: "অফিস ও দোকানের আসবাব", base: "shop", keywords: "অফিস টেবিল চেয়ার র‍্যাক শোকেস office furniture", tags: ["অফিসফার্নিচার"] },
      { id: "kidsfurn", bn: "শিশুদের আসবাব", base: "shop", keywords: "শিশুর খাট পড়ার টেবিল kids furniture", tags: ["পড়ারটেবিল"] },
      { id: "usedfurn", bn: "পুরনো আসবাব", base: "shop", keywords: "পুরনো ব্যবহৃত আসবাব used furniture", tags: ["পুরনোআসবাব"] },
      { id: "madetoorder", bn: "অর্ডারে বানানো আসবাব", base: "crafts", keywords: "অর্ডার কাঠমিস্ত্রি কাস্টম custom carpenter", tags: ["কাঠমিস্ত্রি"] },
    ],
  },
  {
    id: "electronics",
    bn: "ইলেকট্রনিক্স ও গ্যাজেট",
    hint: "মোবাইল, ল্যাপটপ, টিভি, ফ্রিজ, সোলার, যন্ত্রাংশ — নতুন ও ব্যবহৃত",
    icon: "electronics",
    kind: "goods",
    fields: GADGET,
    note: "চোরাই বা অনিবন্ধিত মোবাইল বিক্রি দণ্ডনীয় — মোবাইলের আইএমইআই দিতে হয়।",
    form: { title: "Samsung Galaxy A15 — ৮/১২৮, ৬ মাস ব্যবহার", details: "কতদিন ব্যবহার, কোনো সমস্যা আছে কি না, ব্যাটারি কেমন, সঙ্গে কী কী দেবেন।", media: GOODS_MEDIA("যন্ত্রের ছবি ও চালু অবস্থার ভিডিও", "সামনে-পেছনে ছবি আর চালু অবস্থার ছোট ভিডিও দিন।"), unit: "পিস", delivery: ["courier", "pickup", "home"] },
    subs: [
      { id: "mobile", bn: "মোবাইল ও ট্যাবলেট", base: "shop", keywords: "মোবাইল ফোন স্মার্টফোন ট্যাব mobile phone tablet iphone", tags: ["মোবাইল", "স্মার্টফোন"], fields: [...GADGET, { key: "imei", label: "আইএমইআই নম্বর", kind: "text", required: true, placeholder: "*#06# চেপে দেখুন" }] },
      { id: "computer", bn: "কম্পিউটার ও ল্যাপটপ", base: "shop", keywords: "ল্যাপটপ কম্পিউটার ডেস্কটপ মনিটর laptop computer", tags: ["ল্যাপটপ"] },
      { id: "tv", bn: "টিভি, সাউন্ড ও অডিও", base: "shop", keywords: "টিভি স্পিকার সাউন্ড বক্স tv speaker", tags: ["টিভি"] },
      { id: "appliance", bn: "ফ্রিজ, এসি ও ঘরের যন্ত্র", base: "shop", keywords: "ফ্রিজ এসি ওয়াশিং মেশিন ফ্যান ওভেন fridge ac fan", tags: ["ফ্রিজ", "এসি"], form: { delivery: ["truck", "home", "pickup"] } },
      { id: "camera", bn: "ক্যামেরা ও ড্রোন", base: "shop", keywords: "ক্যামেরা লেন্স ড্রোন camera lens drone", tags: ["ক্যামেরা"] },
      { id: "parts", bn: "যন্ত্রাংশ, আইওটি ও রোবটিক্স কিট", base: "shop", keywords: "যন্ত্রাংশ সেন্সর আরডুইনো ইএসপি৩২ arduino esp32 sensor", tags: ["আইওটি", "আরডুইনো"] },
      { id: "power", bn: "সোলার, আইপিএস ও ব্যাটারি", base: "shop", keywords: "সোলার প্যানেল আইপিএস ব্যাটারি ইনভার্টার solar ips battery", tags: ["সোলার", "আইপিএস"], form: { delivery: ["truck", "courier", "pickup"] } },
      { id: "gear", bn: "চার্জার, কেবল ও এক্সেসরিজ", base: "shop", keywords: "চার্জার কেবল হেডফোন পাওয়ার ব্যাংক charger headphone", tags: ["এক্সেসরিজ"] },
      { id: "gaming", bn: "গেমিং ও কনসোল", base: "shop", keywords: "গেমিং কনসোল প্লেস্টেশন কন্ট্রোলার gaming console", tags: ["গেমিং"] },
    ],
  },
  {
    id: "vehicles",
    bn: "যানবাহন",
    hint: "সাইকেল, মোটরসাইকেল, গাড়ি, রিকশা-ভ্যান, নৌকা আর যন্ত্রাংশ",
    icon: "vehicles",
    kind: "goods",
    fields: VEHICLE,
    note: "কাগজবিহীন বা চোরাই যানবাহন বিক্রি দণ্ডনীয়; হস্তান্তর বিআরটিএ-তে করতে হয়।",
    form: { title: "Honda Hornet 160R — ২০২২, ১৮,০০০ কিমি", details: "কত সাল, কত চলেছে, কোনো দুর্ঘটনা বা মেরামত, কাগজ হালনাগাদ কি না।", media: GOODS_MEDIA("সব দিকের ছবি ও চালু অবস্থার ভিডিও", "ইঞ্জিন চালু অবস্থার ভিডিও আর কাগজের ছবি (নম্বর ঢেকে)।", 8), unit: "পিস", delivery: ["pickup"] },
    subs: [
      { id: "bicycle", bn: "বাইসাইকেল", base: "shop", keywords: "সাইকেল বাইসাইকেল cycle bicycle", tags: ["সাইকেল"] },
      { id: "motorbike", bn: "মোটরসাইকেল ও স্কুটার", base: "shop", keywords: "মোটরসাইকেল বাইক স্কুটার motorcycle bike scooter", tags: ["মোটরসাইকেল"] },
      { id: "car", bn: "গাড়ি ও মাইক্রোবাস", base: "shop", keywords: "গাড়ি কার মাইক্রোবাস car microbus", tags: ["গাড়ি"] },
      { id: "rickshaw", bn: "রিকশা, ভ্যান ও অটো", base: "shop", keywords: "রিকশা ভ্যান অটো ইজিবাইক rickshaw van", tags: ["রিকশা", "ভ্যান"] },
      { id: "boat", bn: "নৌকা ও ট্রলার", base: "shop", keywords: "নৌকা ট্রলার স্পিডবোট boat trawler", tags: ["নৌকা"] },
      { id: "vparts", bn: "যন্ত্রাংশ, টায়ার ও লুব্রিক্যান্ট", base: "shop", keywords: "যন্ত্রাংশ টায়ার মবিল হেলমেট parts tyre helmet", tags: ["যন্ত্রাংশ", "হেলমেট"], fields: [MAKE("কোন গাড়ির জন্য, কোন ব্র্যান্ড"), CONDITION], form: { delivery: ["courier", "bus", "pickup"] } },
    ],
  },
  {
    id: "health",
    bn: "স্বাস্থ্য ও সেবাযত্ন",
    hint: "স্বাস্থ্য যন্ত্র, সহায়ক উপকরণ, অনুমোদিত হারবাল আর পরিচ্ছন্নতা",
    icon: "health",
    kind: "goods",
    fields: [MAKE("ওমরন প্রেশার মেশিন…"), CONDITION, BSTI],
    note: "প্রেসক্রিপশনের ওষুধ এখানে বিক্রি নিষেধ। রোগ সারানোর দাবি করে কিছু বিক্রি করা যাবে না।",
    form: { title: "ডিজিটাল প্রেশার মেশিন — প্রায় নতুন", details: "কী যন্ত্র, কতদিন ব্যবহার, ঠিকমতো মাপে কি না, সঙ্গে কী দেবেন।", media: GOODS_MEDIA("পণ্যের ছবি", "মোড়ক ও অনুমোদন নম্বরের ছবি দিন।"), unit: "পিস", delivery: ["courier", "home", "pickup"] },
    subs: [
      { id: "devices", bn: "স্বাস্থ্য যন্ত্র", base: "shop", keywords: "প্রেশার মেশিন গ্লুকোমিটার থার্মোমিটার নেবুলাইজার bp machine glucometer", tags: ["প্রেশারমেশিন"] },
      { id: "mobility", bn: "হুইলচেয়ার ও সহায়ক উপকরণ", base: "shop", keywords: "হুইলচেয়ার ক্রাচ ওয়াকার হিয়ারিং এইড wheelchair", tags: ["হুইলচেয়ার"] },
      { id: "herbal", bn: "অনুমোদিত হারবাল ও প্রাকৃতিক পণ্য", base: "shop", keywords: "হারবাল কালোজিরা তেল মেথি ভেষজ herbal", tags: ["হারবাল"], fields: [MAKE("পণ্যের নাম"), EXPIRY, BSTI] },
      { id: "hygiene", bn: "স্যানিটারি ও ব্যক্তিগত পরিচ্ছন্নতা", base: "shop", keywords: "স্যানিটারি প্যাড ডায়াপার মাস্ক hygiene pad", tags: ["স্যানিটারি"], fields: [MAKE("ব্র্যান্ড ও পরিমাণ"), EXPIRY] },
      { id: "gym", bn: "ব্যায়ামের সরঞ্জাম", base: "shop", keywords: "ডাম্বেল ট্রেডমিল যোগা ম্যাট gym dumbbell", tags: ["ব্যায়াম"] },
    ],
  },
  {
    id: "kids",
    bn: "শিশু ও পরিবার",
    hint: "খেলনা, শিশুর যত্ন, স্কুলব্যাগ, দোলনা",
    icon: "kids",
    kind: "goods",
    fields: [CONDITION, { key: "agefor", label: "কত বয়সের জন্য", kind: "text", required: true, placeholder: "৩–৬ বছর" }],
    form: { title: "কাঠের খেলনার সেট — ৩–৬ বছর", details: "কী দিয়ে তৈরি, কত বয়সের জন্য, নিরাপদ রং কি না, ব্যবহৃত হলে কতদিন।", media: GOODS_MEDIA("খেলনা বা পণ্যের ছবি", "সব অংশ একসাথে দেখান।"), unit: "পিস", delivery: ["courier", "home", "pickup"] },
    subs: [
      { id: "toys", bn: "খেলনা", base: "shop", keywords: "খেলনা পুতুল গাড়ি লেগো toys", tags: ["খেলনা"] },
      { id: "babycare", bn: "শিশুর খাবার ও যত্ন", base: "shop", keywords: "শিশুর খাবার দুধ ডায়াপার baby food care", tags: ["শিশুরযত্ন"], fields: [MAKE("ব্র্যান্ড ও পরিমাণ"), EXPIRY] },
      { id: "school", bn: "স্কুলব্যাগ ও টিফিন বক্স", base: "shop", keywords: "স্কুলব্যাগ টিফিন বক্স পানির বোতল school bag", tags: ["স্কুলব্যাগ"] },
      { id: "babygear", bn: "স্ট্রলার, দোলনা ও শিশুর খাট", base: "shop", keywords: "স্ট্রলার দোলনা প্র্যাম baby cot stroller", tags: ["দোলনা"] },
    ],
  },
  {
    id: "pets",
    bn: "পোষা প্রাণী ও পশুপাখি",
    hint: "খাঁচার পাখি, বিড়াল-কুকুর, অ্যাকুরিয়াম, খাবার আর পশু চিকিৎসা",
    icon: "pets",
    kind: "goods",
    fields: PET,
    note: "বন্যপ্রাণী (সংরক্ষণ ও নিরাপত্তা) আইন, ২০১২: বুনো পাখি, টিয়া-ময়না, কচ্ছপ বা যেকোনো বন্যপ্রাণী কেনাবেচা নিষেধ — শুধু খামারে জন্মানো পোষা প্রাণী।",
    form: { title: "বাজরিগার জোড়া — খামারে জন্মানো, ৬ মাস", details: "জাত, বয়স, কোথায় জন্মেছে, কী খায়, টিকা ও স্বাস্থ্য।", media: GOODS_MEDIA("প্রাণীর ছবি ও ভিডিও", "নড়াচড়া করছে এমন ভিডিও দিন।"), unit: "পিস", delivery: ["pickup", "home"] },
    subs: [
      { id: "birds", bn: "পোষা পাখি (খামারে জন্মানো)", base: "farm", keywords: "পাখি বাজরিগার লাভবার্ড ককাটেল কবুতর birds budgie", tags: ["বাজরিগার", "কবুতর"] },
      { id: "catsdogs", bn: "বিড়াল ও কুকুর", base: "farm", keywords: "বিড়াল কুকুর পার্সিয়ান cat dog", tags: ["বিড়াল"] },
      { id: "aquarium", bn: "অ্যাকুরিয়াম ও রঙিন মাছ", base: "farm", keywords: "অ্যাকুরিয়াম রঙিন মাছ গোল্ডফিশ aquarium fish", tags: ["অ্যাকুরিয়াম"] },
      { id: "petfood", bn: "পোষা প্রাণীর খাবার ও সরঞ্জাম", base: "shop", keywords: "পাখির খাবার খাঁচা ক্যাট ফুড pet food cage", tags: ["পেটফুড"], fields: [MAKE("ব্র্যান্ড ও ওজন"), EXPIRY], form: { delivery: ["courier", "home", "pickup"] } },
      { id: "vet", bn: "পশু চিকিৎসা ও যত্ন", base: "homeservice", kind: "service", keywords: "পশু ডাক্তার ভেট গ্রুমিং vet grooming", tags: ["পশুচিকিৎসা"], fields: [{ key: "reg", label: "ভেটেরিনারি নিবন্ধন নম্বর", kind: "text", required: true }], form: { unit: "সেশন", delivery: ["onsite"] } },
    ],
  },
  {
    id: "sports",
    bn: "খেলাধুলা, বাদ্যযন্ত্র ও শখ",
    hint: "ব্যাট-বল, ক্যারম, বাদ্যযন্ত্র, ক্যাম্পিং, বড়শি",
    icon: "sports",
    kind: "goods",
    fields: [MAKE("ব্র্যান্ড বা কারিগর"), CONDITION],
    form: { title: "ইংলিশ উইলো ব্যাট — এক মৌসুম খেলা", details: "কী জিনিস, কতদিন ব্যবহার, কোথাও ভাঙা বা মেরামত, সঙ্গে কী দেবেন।", media: GOODS_MEDIA("জিনিসের ছবি", "কাছ থেকে আর পুরোটা — দুই রকম ছবি দিন।"), unit: "পিস", delivery: ["courier", "bus", "pickup"] },
    subs: [
      { id: "cricket", bn: "ক্রিকেট ও ফুটবল সামগ্রী", base: "shop", keywords: "ব্যাট বল ফুটবল জার্সি cricket football", tags: ["ক্রিকেট", "ফুটবল"] },
      { id: "indoor", bn: "দাবা, ক্যারম ও ইনডোর খেলা", base: "shop", keywords: "দাবা ক্যারম লুডু টেবিল টেনিস chess carrom", tags: ["ক্যারম"] },
      { id: "instruments", bn: "বাদ্যযন্ত্র", base: "shop", keywords: "হারমোনিয়াম তবলা গিটার দোতারা বাঁশি harmonium guitar tabla", tags: ["হারমোনিয়াম", "গিটার"], form: { media: { label: "যন্ত্রের ছবি ও বাজানোর অডিও", hint: "সুর ঠিক আছে কি না শোনাতে ছোট অডিও বা ভিডিও দিন।", kinds: ["image", "video", "audio"], max: 5, need: "image" } } },
      { id: "camping", bn: "ভ্রমণ ও ক্যাম্পিং", base: "shop", keywords: "তাঁবু ব্যাকপ্যাক স্লিপিং ব্যাগ tent camping", tags: ["ক্যাম্পিং"] },
      { id: "fishing", bn: "বড়শি ও মাছ ধরার সরঞ্জাম", base: "shop", keywords: "বড়শি ছিপ জাল fishing rod net", tags: ["বড়শি"] },
    ],
  },
  {
    id: "antique",
    bn: "প্রাচীন ও সংগ্রহযোগ্য",
    hint: "পুরনো মুদ্রা, ডাকটিকিট, কাঁসা-পিতল, পুরনো আমলের আসবাব ও বই",
    icon: "antique",
    kind: "goods",
    fields: ANTIQUE,
    note: "পুরাকীর্তি আইন, ১৯৬৮: সরকার-সংরক্ষিত বা মাটি খুঁড়ে পাওয়া প্রত্নবস্তু কেনাবেচা ও বিদেশে পাঠানো নিষেধ — শুধু বৈধ ব্যক্তিগত সংগ্রহ।",
    form: { title: "ব্রিটিশ আমলের এক পয়সার মুদ্রা — ১০টি", details: "কোন আমলের, কোথা থেকে পেয়েছেন, অবস্থা কেমন, কোনো প্রমাণ বা কাগজ আছে কি না।", media: GOODS_MEDIA("দুই পিঠের কাছের ছবি", "আলোয় দুই পিঠ আর কোনো দাগ বা ক্ষয় থাকলে সেটাও।", 8), unit: "পিস", delivery: ["courier", "pickup"] },
    subs: [
      { id: "coins", bn: "পুরনো মুদ্রা ও নোট", base: "other", keywords: "পুরনো মুদ্রা কয়েন নোট coin currency", tags: ["পুরনোমুদ্রা"] },
      { id: "stamps", bn: "ডাকটিকিট", base: "other", keywords: "ডাকটিকিট স্ট্যাম্প stamp philately", tags: ["ডাকটিকিট"] },
      { id: "brass", bn: "কাঁসা, পিতল ও তামার জিনিস", base: "crafts", keywords: "কাঁসা পিতল তামা থালা ঘটি brass bronze copper", tags: ["কাঁসা", "পিতল"] },
      { id: "oldfurn", bn: "পুরনো আমলের আসবাব", base: "crafts", keywords: "পুরনো আমলের পালঙ্ক আলমারি antique furniture", tags: ["অ্যান্টিকআসবাব"] },
      { id: "oldbooks", bn: "পুরনো বই, পত্রিকা ও মানচিত্র", base: "other", keywords: "পুরনো বই পত্রিকা মানচিত্র পুঁথি old books map", tags: ["পুরনোবই"] },
      { id: "vintage", bn: "ভিন্টেজ ঘড়ি, রেডিও ও ক্যামেরা", base: "other", keywords: "ভিন্টেজ পুরনো ঘড়ি রেডিও গ্রামোফোন vintage radio", tags: ["ভিন্টেজ"] },
      { id: "artcollect", bn: "শিল্পকর্ম ও ভাস্কর্য", base: "art", keywords: "ভাস্কর্য শিল্পকর্ম মূর্তি sculpture artwork", tags: ["ভাস্কর্য"] },
    ],
  },
  {
    id: "heritage",
    bn: "জেলার ঐতিহ্য ও বিখ্যাত পণ্য",
    hint: "জিআই পণ্য আর যে জেলার যা বিখ্যাত — কারিগর ও উৎপাদকের কাছ থেকে সরাসরি",
    icon: "heritage",
    kind: "goods",
    fields: HERITAGE,
    form: { title: "বগুড়ার সরার দই — আসল দোকান থেকে", details: "কোন জেলার, কার হাতে বা কোন দোকানে তৈরি, কেন বিখ্যাত, কতদিন ভালো থাকে, কীভাবে পাঠাবেন।", media: GOODS_MEDIA("পণ্য ও তৈরির জায়গার ছবি", "কারখানা, তাঁত বা দোকানের ছবি — উৎস প্রমাণ হয়।", 6), unit: "পিস", delivery: ["bus", "courier", "cold"] },
    subs: [
      { id: "gi-sweets", bn: "বিখ্যাত মিষ্টি ও দই", base: "cooking", keywords: "বগুড়ার দই পোড়াবাড়ির চমচম কুমিল্লার রসমালাই নাটোরের কাঁচাগোল্লা মুক্তাগাছার মণ্ডা sweets", tags: ["বগুড়ারদই", "রসমালাই", "চমচম"], form: { unit: "কেজি" } },
      { id: "gi-fruit", bn: "বিখ্যাত ফল", base: "farm", keywords: "রাজশাহীর আম চাঁপাইনবাবগঞ্জের আম ফজলি হাঁড়িভাঙা দিনাজপুরের লিচু mango litchi", tags: ["ফজলিআম", "হাঁড়িভাঙা", "লিচু"], form: { unit: "কেজি" } },
      { id: "gi-tea", bn: "চা, মসলা ও সুগন্ধি চাল", base: "farm", keywords: "সিলেটের চা কালিজিরা চাল চিনিগুড়া বিজয়পুরের চুই ঝাল tea aromatic rice", tags: ["সিলেটেরচা", "কালিজিরাচাল"], form: { unit: "কেজি" } },
      { id: "gi-sea", bn: "ইলিশ, চিংড়ি ও সুন্দরবনের মধু", base: "farm", keywords: "পদ্মার ইলিশ বাগদা চিংড়ি সুন্দরবনের মধু hilsa shrimp honey", tags: ["পদ্মারইলিশ", "সুন্দরবনেরমধু"], form: { unit: "কেজি", delivery: ["cold", "bus"] } },
      { id: "gi-textile", bn: "তাঁত ও বস্ত্র", base: "fashion", keywords: "জামদানি টাঙ্গাইল শাড়ি রাজশাহী সিল্ক মণিপুরি তাঁত খাদি jamdani tangail silk", tags: ["জামদানি", "টাঙ্গাইলশাড়ি", "রাজশাহীসিল্ক"] },
      { id: "gi-craft", bn: "হস্তশিল্প — নকশিকাঁথা, শীতলপাটি", base: "crafts", keywords: "নকশিকাঁথা শীতলপাটি শখের হাঁড়ি নকশি পাখা nakshi kantha shital pati", tags: ["নকশিকাঁথা", "শীতলপাটি"] },
      { id: "gi-pottery", bn: "মৃৎশিল্প ও টেরাকোটা", base: "crafts", keywords: "মৃৎশিল্প মাটির জিনিস টেরাকোটা pottery terracotta", tags: ["মৃৎশিল্প"] },
      { id: "gi-metal", bn: "কাঁসা-পিতল ও ধাতুশিল্প", base: "crafts", keywords: "ধামরাইয়ের কাঁসা জামালপুরের পিতল ধাতুশিল্প brass craft", tags: ["কাঁসা"] },
      { id: "gi-food", bn: "আঞ্চলিক খাবার ও মসলা", base: "cooking", keywords: "মেজবানি মসলা চুই ঝাল বাখরখানি সাতকরা regional food", tags: ["মেজবানি", "বাখরখানি"] },
    ],
  },
  {
    id: "industry",
    bn: "উৎপাদক ও কারখানা",
    hint: "কারখানার দামে — কাঁচামাল, স্টক লট, প্যাকেজিং আর অর্ডারে উৎপাদন",
    icon: "industry",
    kind: "goods",
    fields: FACTORY,
    note: "রাসায়নিক ও দাহ্য পণ্যে বিস্ফোরক পরিদপ্তরের লাইসেন্স লাগে।",
    form: { title: "সুতি টি-শার্ট — রপ্তানির স্টক লট, ২,০০০ পিস", details: "কী পণ্য, মান ও সনদ, সর্বনিম্ন অর্ডার, মাসিক সক্ষমতা, নমুনা দেবেন কি না।", media: GOODS_MEDIA("পণ্য ও কারখানার ছবি-ভিডিও", "উৎপাদন লাইনের ছোট ভিডিও ক্রেতার বড় ভরসা।", 6), unit: "পিস", delivery: ["truck", "train", "pickup"] },
    subs: [
      { id: "rawmat", bn: "কাঁচামাল", base: "shop", keywords: "কাঁচামাল সুতা প্লাস্টিক দানা raw material yarn", tags: ["কাঁচামাল"] },
      { id: "garments", bn: "গার্মেন্টস ও স্টক লট", base: "fashion", keywords: "গার্মেন্টস স্টক লট রপ্তানি পোশাক garments stock lot", tags: ["স্টকলট", "গার্মেন্টস"] },
      { id: "packaging", bn: "প্যাকেজিং ও লেবেল", base: "shop", keywords: "প্যাকেট কার্টন লেবেল পলিব্যাগ packaging carton label", tags: ["প্যাকেজিং"] },
      { id: "plastic", bn: "প্লাস্টিক ও রাবার পণ্য", base: "shop", keywords: "প্লাস্টিক রাবার বালতি plastic rubber", tags: ["প্লাস্টিকপণ্য"] },
      { id: "metalgoods", bn: "ধাতব পণ্য ও যন্ত্রাংশ", base: "shop", keywords: "লোহা স্টিল যন্ত্রাংশ লেদ metal parts", tags: ["লেদ"] },
      { id: "leather", bn: "চামড়া ও চামড়াজাত পণ্য", base: "shop", keywords: "চামড়া জুতা ব্যাগ ট্যানারি leather", tags: ["চামড়া"] },
      { id: "foodproc", bn: "খাদ্য প্রক্রিয়াজাত পণ্য", base: "cooking", keywords: "প্রক্রিয়াজাত খাদ্য চানাচুর সস জুস processed food", tags: ["প্রক্রিয়াজাতখাদ্য"], fields: [...FACTORY, EXPIRY, BSTI] },
      { id: "oem", bn: "অর্ডারে উৎপাদন ও নিজস্ব ব্র্যান্ড", base: "shop", keywords: "ওইএম প্রাইভেট লেবেল নিজের ব্র্যান্ড oem private label", tags: ["নিজস্বব্র্যান্ড"] },
      { id: "chemicals", bn: "রং, রাসায়নিক ও কালি", base: "shop", keywords: "রং রাসায়নিক কালি ডাই chemical dye ink", tags: ["রাসায়নিক"] },
      { id: "machines", bn: "শিল্প যন্ত্রপাতি", base: "shop", keywords: "মেশিন যন্ত্রপাতি সেলাই মেশিন জেনারেটর machine generator", tags: ["মেশিন"], fields: [MAKE("কোন মেশিন, কোন দেশের"), CONDITION, { key: "lead", label: "চালু করে দিতে (দিন)", kind: "number" }] },
    ],
  },
  {
    id: "build",
    bn: "নির্মাণ ও হার্ডওয়্যার",
    hint: "রড, সিমেন্ট, ইট-বালু, টাইলস, স্যানিটারি, তার-ফিটিংস আর হাতিয়ার",
    icon: "build",
    kind: "goods",
    fields: BUILD,
    form: { title: "৫০০ ডব্লিউ রড — টন দরে, সাইটে পৌঁছে", details: "কোন ব্র্যান্ড ও গ্রেড, কতটা আছে, টন বা বস্তার দাম, সাইটে পৌঁছাতে কত দিন।", media: GOODS_MEDIA("পণ্য ও গুদামের ছবি", "ব্র্যান্ডের ছাপ দেখা যায় এমন ছবি দিন।"), unit: "টন", delivery: ["truck", "pickup"] },
    subs: [
      { id: "rod", bn: "রড, সিমেন্ট ও স্টিল", base: "shop", keywords: "রড সিমেন্ট স্টিল rod cement steel", tags: ["রড", "সিমেন্ট"] },
      { id: "brick", bn: "ইট, বালু ও পাথর", base: "shop", keywords: "ইট বালু পাথর খোয়া brick sand stone", tags: ["ইট", "বালু"], form: { unit: "সেট" } },
      { id: "tiles", bn: "টাইলস, স্যানিটারি ও বাথরুম", base: "shop", keywords: "টাইলস কমোড বেসিন স্যানিটারি tiles sanitary", tags: ["টাইলস"], form: { unit: "সেট" } },
      { id: "paint", bn: "রং ও ওয়াটারপ্রুফিং", base: "shop", keywords: "রং পেইন্ট ওয়াটারপ্রুফ paint waterproof", tags: ["রং"], form: { unit: "লিটার" } },
      { id: "wiring", bn: "বৈদ্যুতিক তার, সুইচ ও ফিটিংস", base: "shop", keywords: "তার সুইচ সকেট এমসিবি cable switch", tags: ["তার", "ফিটিংস"], form: { unit: "পিস" } },
      { id: "tools", bn: "হাতিয়ার ও যন্ত্রপাতি", base: "shop", keywords: "ড্রিল হাতুড়ি করাত টুলস drill tools", tags: ["টুলস"], fields: [MAKE("বশ ড্রিল…"), CONDITION], form: { unit: "পিস", delivery: ["courier", "pickup"] } },
      { id: "doors", bn: "দরজা, জানালা ও গ্রিল", base: "shop", keywords: "দরজা জানালা গ্রিল থাই অ্যালুমিনিয়াম door window grill", tags: ["থাইজানালা"], form: { unit: "পিস" } },
    ],
  },
  {
    id: "property",
    bn: "বাসা, জমি ও ভাড়া",
    hint: "বাসা-মেস, দোকান-গুদাম, জমি-প্লট, কোল্ড স্টোরেজ আর যন্ত্র ও জায়গা ভাড়া",
    icon: "property",
    kind: "service",
    note: "জমি বিক্রিতে দলিল, নামজারি ও খাজনার রশিদ যাচাই করে নিন; দালালের কাছে অগ্রিম দেবেন না।",
    subs: [
      { id: "flat", bn: "বাসা ও ফ্ল্যাট ভাড়া", base: "rent", keywords: "বাসা ভাড়া ফ্ল্যাট to-let rent flat", tags: ["বাসাভাড়া", "টুলেট"] },
      { id: "sublet", bn: "সাবলেট ও মেস", base: "rent", keywords: "সাবলেট মেস সিট sublet mess", tags: ["সাবলেট", "মেস"] },
      { id: "commercial", bn: "দোকান, অফিস ও গুদাম ভাড়া", base: "rent", keywords: "দোকান অফিস গুদাম ভাড়া shop office warehouse rent", tags: ["দোকানভাড়া"] },
      { id: "land", bn: "জমি ও প্লট বিক্রি", base: "rent", keywords: "জমি প্লট বিক্রি শতাংশ কাঠা land plot", tags: ["জমি", "প্লট"], fields: LAND, form: { title: "পাকা রাস্তার পাশে ১০ শতাংশ বাড়ির জমি", details: "অবস্থান, রাস্তা, কাগজের অবস্থা, দাম আলোচনাসাপেক্ষ কি না।", unit: "শতাংশ", media: GOODS_MEDIA("জমির ছবি ও ভিডিও", "চার পাশ আর রাস্তা দেখা যায় এমন ছবি।") } },
      { id: "storage", bn: "কোল্ড স্টোরেজ ও গুদামের জায়গা", base: "rent", keywords: "কোল্ড স্টোরেজ হিমাগার গুদাম cold storage", tags: ["কোল্ডস্টোরেজ"], fields: [{ key: "space", label: "জায়গা", kind: "text", required: true, placeholder: "১০০ বস্তা, ৫০০ বর্গফুট" }, { key: "temp", label: "তাপমাত্রা", kind: "text", placeholder: "২–৪° সে." }], form: { unit: "মাস" } },
      { id: "gear-rent", bn: "যন্ত্র ও সরঞ্জাম ভাড়া", base: "rent", keywords: "জেনারেটর সাউন্ড সিস্টেম চেয়ার ডেকচি ভাড়া rent generator", tags: ["ভাড়া"], fields: [{ key: "items", label: "কী ভাড়া দেন", kind: "text", required: true }, { key: "deposit", label: "জামানত", kind: "text" }], form: { unit: "দিন", delivery: ["pickup", "home"] } },
      { id: "venue", bn: "অনুষ্ঠানের জায়গা ও কমিউনিটি সেন্টার", base: "rent", keywords: "কমিউনিটি সেন্টার হল ছাদ ভেন্যু venue hall", tags: ["কমিউনিটিসেন্টার"], fields: [{ key: "guests", label: "অতিথি পর্যন্ত", kind: "number", required: true }, { key: "includes", label: "সঙ্গে", kind: "chips", options: ["এসি", "পার্কিং", "জেনারেটর", "রান্নার জায়গা", "সাজসজ্জা"] }], form: { unit: "দিন" } },
    ],
  },
  {
    id: "festival",
    bn: "ধর্মীয় ও উৎসব",
    hint: "ঈদ, পূজা, বৈশাখ, বিয়ে — উৎসবের সব সামগ্রী আর উপহার",
    icon: "festival",
    kind: "goods",
    form: { title: "কাঠের জায়নামাজ স্ট্যান্ড ও তসবির সেট", details: "কী জিনিস, কী দিয়ে তৈরি, কোন উৎসবের জন্য, কতগুলো আছে।", media: GOODS_MEDIA("পণ্যের ছবি", "উৎসবের সাজে রেখে ছবি তুলুন।"), unit: "পিস", delivery: ["courier", "home", "pickup"] },
    subs: [
      { id: "faith", bn: "ধর্মীয় সামগ্রী", base: "shop", keywords: "জায়নামাজ টুপি তসবি আতর কুরআন শরীফ পূজার সামগ্রী prayer mat", tags: ["জায়নামাজ", "তসবি"] },
      { id: "eid", bn: "ঈদ ও রমজান", base: "shop", keywords: "ঈদ রমজান ইফতার সেমাই কুরবানির সামগ্রী eid ramadan", tags: ["ঈদ", "ইফতার"] },
      { id: "puja", bn: "পূজা ও পার্বণ", base: "shop", keywords: "পূজা প্রতিমা ধূপ প্রদীপ শাঁখা puja", tags: ["পূজা"] },
      { id: "boishakh", bn: "পহেলা বৈশাখ ও লোকজ উৎসব", base: "crafts", keywords: "বৈশাখ মুখোশ হাতপাখা পিঠা উৎসব boishakh", tags: ["পহেলাবৈশাখ"] },
      { id: "wedding", bn: "বিয়ে ও অনুষ্ঠানের সামগ্রী", base: "shop", keywords: "বিয়ের কার্ড ডালা কুলা হলুদের সামগ্রী wedding", tags: ["বিয়েরসামগ্রী"] },
      { id: "gifts", bn: "উপহার ও কার্ড", base: "crafts", keywords: "উপহার গিফট বক্স কার্ড gift", tags: ["উপহার"] },
    ],
  },
  {
    id: "other",
    bn: "অন্য কিছু",
    hint: "তালিকায় নেই? নিজের বিভাগের নাম দিন — হ্যাশট্যাগে ক্রেতা খুঁজে নেবে",
    icon: "other",
    subs: [{ id: "custom", bn: "নিজের বিভাগ", base: "other", keywords: "অন্যান্য other" }],
  },
];

const subIndex = new Map<string, { sub: MarketSub; section: MarketSection }>();
for (const section of SECTIONS) for (const sub of section.subs) subIndex.set(sub.id, { sub, section });

/** Where items listed before sub-sections existed belong. */
export const DEFAULT_SUB: Record<CategoryId, string> = {
  crafts: "gi-craft", cooking: "homecook", tech: "software", design: "architect", art: "painting", music: "songs", photo: "photography",
  content: "graphic", engineering: "iot", homeservice: "repair", teaching: "tuition", finance: "accounts", beauty: "beauty", research: "iot",
  travel: "guide", sports: "coach", shop: "grocery", rent: "flat", farm: "veg", legal: "legal", fashion: "women", other: "custom",
};

export function resolveSub(id: string | undefined, category?: CategoryId): { sub: MarketSub; section: MarketSection } {
  return subIndex.get(id ?? "") ?? subIndex.get(category ? DEFAULT_SUB[category] : "custom")!;
}

export const isSubId = (id: string) => subIndex.has(id);
export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

/** Goods travel (stock, weight, delivery); services don't. */
export function isGoods(id: string): boolean {
  const { sub, section } = resolveSub(id);
  return (sub.kind ?? section.kind ?? (PHYSICAL.has(sub.base) ? "goods" : "service")) === "goods";
}

/** The questions a buyer needs answered for this sub-section. */
export const fieldsForSub = (id: string): Field[] => {
  const { sub, section } = resolveSub(id);
  return sub.fields ?? section.fields ?? fieldsFor(sub.base);
};

export function formForSub(id: string): ProductForm {
  const { sub, section } = resolveSub(id);
  return { ...PRODUCT_FORMS[sub.base], ...section.form, ...sub.form };
}

export const tagIdeasFor = (id: string): string[] => {
  const { sub } = resolveSub(id);
  return sub.tags ?? TAG_IDEAS[sub.base] ?? [];
};

/** Sub-sections whose name or keywords contain every word typed. */
export function findSubs(query: string): { sub: MarketSub; section: MarketSection }[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return [...subIndex.values()].filter(({ sub, section }) => {
    const hay = `${sub.bn} ${sub.keywords ?? ""} ${section.bn} ${(sub.tags ?? []).join(" ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** Cross-cutting picks: how it's sold, how it's grown, where it's from. */
export const PICKS = {
  retail: { bn: "খুচরা", hint: "এক-দুটো পিস, সরাসরি ক্রেতার কাছে" },
  wholesale: { bn: "পাইকারি", hint: "বেশি পরিমাণে কম দর — দোকানি ও আড়তদার" },
  export: { bn: "রপ্তানিযোগ্য", hint: "নমুনা, ল্যাব টেস্ট, রপ্তানির প্যাকেজিং" },
  brand: { bn: "নিজস্ব ব্র্যান্ড", hint: "আপনার নামে প্যাকেট করে দেবে" },
  organic: { bn: "অর্গানিক ও বিষমুক্ত", hint: "রাসায়নিক সার ও কীটনাশক ছাড়া" },
  direct: { bn: "কৃষক-খামারির সরাসরি", hint: "উৎপাদক নিজে বিক্রি করছেন, মাঝে কেউ নেই" },
  heritage: { bn: "জেলার বিখ্যাত", hint: "জিআই ও ঐতিহ্যবাহী পণ্য" },
} as const;

export type PickKey = keyof typeof PICKS;

/** What a pick needs to know about a listing or a board post. */
export interface Pickable {
  sub: string;
  modes: TradeMode[];
  organic?: boolean;
  stage?: SellerStage;
  tags: string[];
}

export function inPick(item: Pickable, pick: PickKey): boolean {
  const { sub, section } = resolveSub(item.sub);
  if (pick === "organic") return Boolean(item.organic);
  // Farm section, or a one-person seller of their own produce anywhere.
  if (pick === "direct") return section.id === "farm" || (item.stage === "solo" && sub.base === "farm");
  if (pick === "heritage") return section.id === "heritage" || item.tags.includes("জিআই");
  return item.modes.includes(pick);
}
