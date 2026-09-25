import type { Category, CategoryId } from "./types";

/**
 * Skill categories. Each band is the fair range for that category's usual
 * unit of work — used to warn when an offer undervalues someone's labour.
 * Bands are editorial estimates for the demo, not market data.
 */
export const categories: Category[] = [
  { id: "crafts", bn: "হস্তশিল্প ও দর্জি", en: "Crafts & Tailoring", blurb: "নকশিকাঁথা, জামদানি, দর্জির কাজ — গ্রামের দক্ষতা সারা দেশে।", band: { low: 600, high: 12000, unit: "প্রতি পিস" }, skills: ["নকশিকাঁথা", "দর্জির কাজ", "ব্লক প্রিন্ট", "হাতের এমব্রয়ডারি"] },
  { id: "cooking", bn: "রান্না ও ঘরোয়া খাবার", en: "Cooking", blurb: "নিজের রেসিপি বিক্রি করুন, ঘরে বানানো খাবার পৌঁছে দিন।", band: { low: 150, high: 6000, unit: "প্রতি অর্ডার" }, skills: ["বাংলা ঘরোয়া রান্না", "পিঠা ও মিষ্টি", "বিরিয়ানি", "বেকিং"] },
  { id: "tech", bn: "টেক ও প্রোগ্রামিং", en: "Tech & Code", blurb: "ওয়েব, অ্যাপ, এআই — কোড দিয়ে প্রমাণ করুন।", band: { low: 800, high: 2500, unit: "প্রতি ঘণ্টা" }, skills: ["রিঅ্যাক্ট / নেক্সট.জেএস", "পাইথন", "অ্যান্ড্রয়েড অ্যাপ", "ডেটা বিশ্লেষণ"] },
  { id: "design", bn: "ডিজাইন ও স্থাপত্য", en: "Design & Architecture", blurb: "বাড়ির নকশা, ইন্টেরিয়র, লোগো — ডিজাইন সরাসরি ক্লায়েন্টকে।", band: { low: 3000, high: 30000, unit: "প্রতি ডিজাইন" }, skills: ["আর্কিটেকচারাল ডিজাইন", "ইন্টেরিয়র", "লোগো ও ব্র্যান্ডিং", "ইউআই ডিজাইন"] },
  { id: "art", bn: "চিত্রকলা ও শিল্প", en: "Art", blurb: "ছবি আঁকুন, দাম নিজে ঠিক করুন।", band: { low: 2500, high: 30000, unit: "প্রতি শিল্পকর্ম" }, skills: ["জলরং", "তেলরং", "ক্যালিগ্রাফি", "ডিজিটাল আর্ট"] },
  { id: "music", bn: "সংগীত", en: "Music", blurb: "গান আপলোড করুন, লাইসেন্স বিক্রি করুন।", band: { low: 1500, high: 15000, unit: "প্রতি লাইসেন্স" }, skills: ["কণ্ঠসংগীত", "সুর রচনা", "গিটার", "মিক্সিং"] },
  { id: "photo", bn: "ফটোগ্রাফি ও মডেলিং", en: "Photo & Modeling", blurb: "পোর্টফোলিও গড়ুন, শুটে ডাক পান।", band: { low: 3000, high: 20000, unit: "প্রতি শুট" }, skills: ["প্রোডাক্ট ফটোগ্রাফি", "পোর্ট্রেট", "ফ্যাশন মডেলিং", "ভিডিওগ্রাফি"] },
  { id: "content", bn: "কন্টেন্ট ও মার্কেটিং", en: "Content & Marketing", blurb: "ভিডিও, গ্রাফিক্স, মার্কেটিং।", band: { low: 2000, high: 15000, unit: "প্রতি ক্যাম্পেইন" }, skills: ["গ্রাফিক ডিজাইন", "ভিডিও এডিটিং", "ফেসবুক বিজ্ঞাপন", "কপিরাইটিং"] },
  { id: "engineering", bn: "প্রকৌশল", en: "Engineering", blurb: "ইলেকট্রিক্যাল, সিভিল, আইওটি — বাস্তব সমাধান।", band: { low: 5000, high: 60000, unit: "প্রতি প্রজেক্ট" }, skills: ["আইওটি হার্ডওয়্যার", "সার্কিট ডিজাইন", "সিভিল ড্রয়িং", "রোবটিক্স"] },
  { id: "homeservice", bn: "মেরামত ও গৃহসেবা", en: "Repair & Home", blurb: "মেকানিক, ইলেকট্রিশিয়ান, প্লাম্বার — ন্যায্য মজুরি।", band: { low: 400, high: 3000, unit: "প্রতি কাজ" }, skills: ["মোটরসাইকেল মেরামত", "ইলেকট্রিক ওয়্যারিং", "প্লাম্বিং", "এসি সার্ভিস"] },
  { id: "teaching", bn: "শেখানো ও কোচিং", en: "Teaching & Coaching", blurb: "যা পারেন, শেখান — ভিডিও ক্লাস বা সরাসরি।", band: { low: 500, high: 3000, unit: "প্রতি সেশন" }, skills: ["গণিত শেখানো", "ইংরেজি কথোপকথন", "ইস্পোর্টস কোচিং", "কোডিং শেখানো"] },
  { id: "finance", bn: "হিসাব ও ফাইন্যান্স", en: "Finance", blurb: "হিসাবরক্ষণ, ট্যাক্স রিটার্ন, এক্সেল।", band: { low: 800, high: 20000, unit: "প্রতি কাজ" }, skills: ["আয়কর রিটার্ন", "এক্সেল মডেলিং", "বুককিপিং"] },
  { id: "beauty", bn: "রূপচর্চা ও মেহেদি", en: "Beauty & Mehndi", blurb: "মেহেদি, সাজ, চুলের কাজ — বাসায় গিয়ে সেবা।", band: { low: 500, high: 8000, unit: "প্রতি সেবা" }, skills: ["মেহেদি ডিজাইন", "ব্রাইডাল মেকআপ", "হেয়ার স্টাইলিং"] },
  { id: "research", bn: "গবেষণা ও প্রজেক্ট", en: "Research & Projects", blurb: "থিসিস, প্রোটোটাইপ, ওপেন-সোর্স।", band: { low: 5000, high: 40000, unit: "প্রতি প্রজেক্ট" }, skills: ["প্রোটোটাইপিং", "ডেটা সংগ্রহ", "গবেষণাপত্র লেখা"] },
  { id: "travel", bn: "গাইড ও ভ্রমণ সেবা", en: "Guiding", blurb: "স্থানীয় গাইড — পথ চেনা মানুষের দক্ষতা।", band: { low: 1500, high: 8000, unit: "প্রতি দিন" }, skills: ["ট্রেকিং গাইড", "শহর ভ্রমণ গাইড"] },
  { id: "sports", bn: "খেলাধুলা ও ফিটনেস", en: "Sports & Fitness", blurb: "কোচিং, ফিটনেস ট্রেনিং।", band: { low: 500, high: 3000, unit: "প্রতি সেশন" }, skills: ["ক্রিকেট কোচিং", "ফিটনেস ট্রেনিং", "সাঁতার শেখানো"] },
  { id: "shop", bn: "দোকান ও ডেলিভারি", en: "Shops & Delivery", blurb: "মুদি দোকান, স্টেশনারি, টং, খাবারের গাড়ি — এলাকায় পৌঁছে দিন।", band: { low: 50, high: 5000, unit: "প্রতি অর্ডার" }, skills: ["মুদি ও নিত্যপণ্য", "স্টেশনারি", "স্ট্রিট ফুড", "টং দোকান"] },
  { id: "rent", bn: "বাসা ও ফ্ল্যাট ভাড়া", en: "Rent", blurb: "বাসা, সাবলেট, মেস — সরাসরি মালিকের সাথে, দালাল ছাড়া।", band: { low: 3000, high: 60000, unit: "প্রতি মাস" }, skills: ["বাসা ভাড়া", "সাবলেট", "মেস"] },
  { id: "fashion", bn: "পোশাক ও দৈনন্দিন পণ্য", en: "Clothing & Daily Wear", blurb: "জামদানি, লুঙ্গি, থ্রি-পিস, হাতের কাজের পোশাক।", band: { low: 300, high: 15000, unit: "প্রতি পিস" }, skills: ["তাঁতের শাড়ি", "থ্রি-পিস", "পাঞ্জাবি"] },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}

export function isCategoryId(value: string): value is CategoryId {
  return byId.has(value as CategoryId);
}
