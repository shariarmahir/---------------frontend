/**
 * Remove from sale: products the regulators want pulled from shelves.
 *
 * EVERY BRAND AND PRODUCT HERE IS FICTIONAL. A real brand on a "dangerous
 * product" list would be defamation, so the names are invented and do not
 * stand for any real company, shop or product. The hazards are real ones met in
 * Bangladeshi markets, and each names the regulator that really acts on it.
 * Hazard texts describe the harm in general terms; no figures are invented.
 * Districts are real place names; unit counts are demonstration numbers.
 */
import type { ConsumerCategory, Danger, Hazard, RecallItem, RegulatorId } from "../../lib/command/types.ts";

export const REGULATORS: Record<RegulatorId, { name: string; short: string; nameBn: string }> = {
  bsti: { name: "Bangladesh Standards and Testing Institution", short: "BSTI", nameBn: "বিএসটিআই" },
  dgda: { name: "Directorate General of Drug Administration", short: "DGDA", nameBn: "ঔষধ প্রশাসন অধিদপ্তর" },
  bfsa: { name: "Bangladesh Food Safety Authority", short: "BFSA", nameBn: "বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ" },
  dncrp: { name: "Directorate of National Consumer Rights Protection", short: "ভোক্তা অধিদপ্তর", nameBn: "ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর" },
};

export interface HazardInfo {
  labelBn: string;
  label: string;
  textBn: string;
  text: string;
  /** The consumer complaint category a case about this hazard is filed under. */
  category: Extract<ConsumerCategory, "adulteration" | "fake-product">;
}

export const HAZARDS: Record<Hazard, HazardInfo> = {
  formalin: {
    labelBn: "ফরমালিন",
    label: "Formalin",
    textBn: "তাজা দেখাতে ফরমালিন মেশানো হয়েছে। ফরমালডিহাইড বিষাক্ত ও ক্যানসার সৃষ্টিকারী; পেট ও শ্বাসনালির ক্ষতি করে এবং লিভার ও কিডনির ক্ষতি করে।",
    text: "Formalin added to keep it looking fresh. Formaldehyde is toxic and causes cancer; it harms the gut and airways, the liver and the kidneys.",
    category: "adulteration",
  },
  "carbide-ripening": {
    labelBn: "কার্বাইডে পাকানো",
    label: "Carbide ripening",
    textBn: "ক্যালসিয়াম কার্বাইড দিয়ে পাকানো। শিল্পে ব্যবহৃত কার্বাইডে আর্সেনিক ও ফসফরাসের অংশ থাকতে পারে; এতে মাথা ঘোরা, বমি ও স্নায়ুর ক্ষতি হতে পারে।",
    text: "Ripened with calcium carbide. Industrial carbide can carry traces of arsenic and phosphorus, which can cause dizziness, vomiting and nerve damage.",
    category: "adulteration",
  },
  "textile-dye": {
    labelBn: "কাপড়ের রং",
    label: "Textile dye",
    textBn: "রং উজ্জ্বল করতে কাপড়ের রং মেশানো। এসব রং খাবারের উপযোগী নয়; লিভার ও কিডনির ক্ষতি করে, কিছু রং ক্যানসারের কারণ।",
    text: "Coloured with textile dye. These dyes are not food grade; they damage the liver and kidneys, and some cause cancer.",
    category: "adulteration",
  },
  "expired-relabelled": {
    labelBn: "মেয়াদোত্তীর্ণ, নতুন লেবেল",
    label: "Expired, relabelled",
    textBn: "মেয়াদ পেরোনো পণ্যে নতুন তারিখের লেবেল লাগানো। মেয়াদের পর পণ্যে জীবাণু জন্মাতে পারে বা গুণ নষ্ট হয়; ক্রেতার কাছে আসল তারিখ লুকানো হয়।",
    text: "Expired stock with a new date label. Past its date the product can grow germs or lose quality, and the buyer cannot see the real date.",
    category: "fake-product",
  },
  "counterfeit-medicine": {
    labelBn: "নকল ওষুধ",
    label: "Counterfeit medicine",
    textBn: "নকল ওষুধ, যাতে কার্যকর উপাদান সামান্য বা একেবারেই নেই। রোগ সারে না, আর ক্ষতিকর ভেজাল উপাদান থাকতে পারে।",
    text: "Counterfeit medicine with little or none of the active ingredient. It does not treat the illness and can contain harmful fillers.",
    category: "fake-product",
  },
  "mercury-cream": {
    labelBn: "পারদ মেশানো ক্রিম",
    label: "Mercury in skin cream",
    textBn: "ত্বক ফর্সা করার ক্রিমে পারদ। পারদ ত্বক দিয়ে শরীরে ঢোকে এবং কিডনি ও স্নায়ুতন্ত্রের ক্ষতি করে।",
    text: "Skin-lightening cream with mercury. Mercury passes through the skin and damages the kidneys and the nervous system.",
    category: "fake-product",
  },
  "fake-bsti-mark": {
    labelBn: "ভুয়া বিএসটিআই চিহ্ন",
    label: "Fake BSTI mark",
    textBn: "মোড়কে ভুয়া বিএসটিআই চিহ্ন। পণ্যটি কখনো মান পরীক্ষায় যায়নি, তাই এর মান ও নিরাপত্তা অজানা।",
    text: "Carries a fake BSTI mark. It never passed the standards test, so its quality and safety are unknown.",
    category: "fake-product",
  },
  "adulterated-honey-ghee": {
    labelBn: "ভেজাল মধু/ঘি",
    label: "Adulterated honey or ghee",
    textBn: "চিনির সিরাপ মেশানো মধু বা ডালডা ও চর্বি মেশানো ঘি, খাঁটি বলে বিক্রি।",
    text: "Honey mixed with sugar syrup, or ghee mixed with vegetable and animal fat, sold as pure.",
    category: "adulteration",
  },
  "reused-oil": {
    labelBn: "পোড়া তেলে ভাজা",
    label: "Reused frying oil",
    textBn: "বারবার ব্যবহার করা তেলে ভাজা। বারবার গরম করা তেলে ক্ষতিকর যৌগ ও ট্রান্স ফ্যাট তৈরি হয়, যা হৃদরোগ ও ক্যানসারের ঝুঁকি বাড়ায়।",
    text: "Fried in oil used again and again. Reheated oil forms harmful compounds and trans fats that raise the risk of heart disease and cancer.",
    category: "adulteration",
  },
  "unsafe-baby-food": {
    labelBn: "অনিরাপদ শিশুখাদ্য",
    label: "Unsafe baby food",
    textBn: "নিরাপত্তার নিয়ম না মেনে তৈরি বা সংরক্ষিত শিশুখাদ্য। জীবাণু বা ভুল পুষ্টিমানে শিশু গুরুতর অসুস্থ হতে পারে।",
    text: "Baby food made or stored outside the safety rules. Germs or the wrong nutrient levels can make an infant seriously ill.",
    category: "fake-product",
  },
};

type Row = [brandBn: string, brand: string, productBn: string, product: string, hazard: Hazard, regulator: RegulatorId, danger: Danger, districts: string[], units: number, kinds: string[]];

// Cosmetics (the fairness cream) fall under the Drugs and Cosmetics Act 2023, administered by DGDA, not BSTI.
const ROWS: Row[] = [
  ["মেঘবেলা", "Meghbela", "ফ্রোজেন রুই মাছ", "Frozen rui fish", "formalin", "bfsa", "critical", ["Dhaka", "Narayanganj"], 640, ["market", "grocery"]],
  ["রোদরাঙি", "Rodrangi", "পাকা আম (ক্রেট)", "Ripe mangoes (crate)", "carbide-ripening", "bfsa", "high", ["Rajshahi", "Bogura", "Dhaka"], 1200, ["market"]],
  ["লালপরী", "Lalpori", "মরিচের গুঁড়া", "Chilli powder", "textile-dye", "bfsa", "critical", ["Dhaka", "Chattogram"], 2400, ["grocery", "market"]],
  ["হলদিঘুড়ি", "Holdighuri", "হলুদের গুঁড়া", "Turmeric powder", "textile-dye", "bfsa", "critical", ["Khulna", "Jashore"], 1800, ["grocery", "market"]],
  ["কুসুমকলি", "Kusumkoli", "ক্রিম বিস্কুট", "Cream biscuits", "expired-relabelled", "dncrp", "medium", ["Dhaka", "Gazipur", "Mymensingh"], 3600, ["grocery", "bakery"]],
  ["আরোগ্যদীপ", "Arogyadip", "সেফ-২০০ ক্যাপসুল", "Cef-200 capsules", "counterfeit-medicine", "dgda", "critical", ["Dhaka", "Chattogram", "Sylhet"], 5000, ["pharmacy"]],
  ["নির্ভয়-গ্যাস্ট্রো", "Nirvoy-Gastro", "২০ মি.গ্রা. ট্যাবলেট", "20 mg tablets", "counterfeit-medicine", "dgda", "high", ["Rangpur", "Dinajpur"], 4200, ["pharmacy"]],
  ["চাঁদনিরূপ", "Chandnirup", "ফেয়ারনেস ক্রিম", "Fairness cream", "mercury-cream", "dgda", "critical", ["Dhaka", "Sylhet", "Cumilla"], 900, ["pharmacy", "grocery", "market"]],
  ["নীলাম্বরী", "Nilambori", "বোতলজাত পানি", "Bottled drinking water", "fake-bsti-mark", "bsti", "high", ["Dhaka", "Gazipur", "Narayanganj"], 7200, ["grocery", "restaurant"]],
  ["ফুলঝুরি", "Fuljhuri", "ভিটামিন এ যুক্ত সয়াবিন তেল", "Fortified soybean oil", "fake-bsti-mark", "bsti", "high", ["Barishal", "Patuakhali"], 1500, ["grocery", "market"]],
  ["মৌবনি", "Moubony", "খাঁটি মধু", "Pure honey", "adulterated-honey-ghee", "bfsa", "medium", ["Khulna", "Dhaka"], 800, ["grocery", "market", "sweetshop"]],
  ["গোয়ালিনী", "Goyalini", "গাওয়া ঘি", "Cow's ghee", "adulterated-honey-ghee", "bfsa", "high", ["Bogura", "Rajshahi", "Dhaka"], 650, ["grocery", "sweetshop"]],
  ["মচমচে", "Mochmoche", "চানাচুর", "Chanachur (fried snack)", "reused-oil", "bfsa", "medium", ["Dhaka", "Rangpur", "Dinajpur"], 2800, ["grocery", "bakery", "market"]],
  ["শিশুসাথী", "Shishusathi", "শিশুখাদ্য (গুঁড়া দুধ)", "Infant formula", "unsafe-baby-food", "bfsa", "critical", ["Dhaka", "Chattogram", "Rangpur"], 1100, ["grocery", "pharmacy"]],
];

export const RECALLS: readonly RecallItem[] = ROWS.map(([brandBn, brand, productBn, product, hazard, regulator, danger, districts, seededUnits, kinds], i) => ({
  id: `rc-${String(i + 1).padStart(2, "0")}`,
  brandBn,
  brand,
  productBn,
  product,
  hazard,
  regulator,
  danger,
  districts,
  seededUnits,
  kinds,
}));
