/**
 * Sample complaint texts, in Bangla. Every one is invented for the
 * demonstration; none describes a real event or person.
 * Slots: {area} is the place's area name; {business} is the business name
 * (consumer categories only); {product} is a price-watch item or a recalled
 * product (only in templates with `product`). The generator replaces them.
 */
import type { Category, ConsumerCategory, InvolvedKind, Victim } from "../../lib/command/types.ts";

/**
 * `kinds`: business kinds the text fits (consumer categories); omitted means any kind.
 * `product`: the text names a product: a government-fixed price item ("fixed"),
 * a reference-price item ("price") or a recalled product ("recall"); such a
 * template is used only when the case has that kind of product.
 * `victim` and `involved`: what the text itself says (a schoolgirl, "a ring"),
 * so the case's fields agree with it.
 */
export interface Template {
  titleBn: string;
  summaryBn: string;
  kinds?: readonly string[];
  product?: "fixed" | "price" | "recall";
  victim?: Victim;
  involved?: InvolvedKind;
}

const FOOD: readonly string[] = ["restaurant", "grocery", "bakery", "sweetshop", "market"];
const KITCHEN: readonly string[] = ["restaurant", "bakery", "sweetshop"];

/**
 * Business kinds a consumer category can be filed against, where that is not
 * every kind. The generator draws a business from these kinds only. A category
 * missing here accepts every kind. A pharmacy has nothing to weigh out, so
 * short-weight complaints skip it.
 */
export const CATEGORY_KINDS: Partial<Record<ConsumerCategory, readonly string[]>> = {
  "false-weight": ["restaurant", "grocery", "bakery", "sweetshop", "market", "fuel"],
};

export const TEMPLATES: Record<Category, readonly Template[]> = {
  chadabaji: [
    {
      titleBn: "{area} এলাকায় দোকানে চাঁদা দাবি",
      summaryBn: "{area} এলাকায় কয়েকজন যুবক প্রতিদিন দোকানদারদের কাছে টাকা দাবি করছে। না দিলে দোকান ভাঙচুরের হুমকি দিচ্ছে বলে অভিযোগ।",
    },
    {
      titleBn: "{area} এলাকায় নির্মাণ কাজে চাঁদাবাজি",
      summaryBn: "{area} এলাকায় একটি ভবনের নির্মাণ কাজ চলছে। একটি স্থানীয় দল মালামাল ঢুকতে দেওয়ার বিনিময়ে টাকা চাইছে, ফলে কাজ বন্ধ হওয়ার উপক্রম।",
    },
    {
      titleBn: "{area} এলাকায় চালকদের কাছ থেকে টাকা আদায়",
      summaryBn: "{area} এলাকায় রিকশা ও ছোট গাড়ির চালকদের কাছ থেকে প্রতিদিন জোর করে টাকা তোলা হচ্ছে। চালকরা ভয়ে মুখ খুলছেন না।",
    },
    {
      titleBn: "{area} এলাকায় ফুটপাতের দোকান থেকে চাঁদা আদায়",
      summaryBn: "{area} এলাকায় একটি চক্র ফুটপাতের হকারদের কাছ থেকে প্রতিদিন নির্দিষ্ট হারে টাকা তুলছে। কেউ আপত্তি করলে দোকান তুলে দেওয়ার হুমকি দেওয়া হয়।",
      involved: "ring",
    },
  ],
  harassment: [
    {
      titleBn: "{area} এলাকায় শিক্ষার্থীদের উত্ত্যক্ত করা",
      summaryBn: "{area} এলাকায় স্কুল-কলেজের সামনে একদল বখাটে প্রতিদিন শিক্ষার্থীদের উত্ত্যক্ত করছে। অভিভাবকরা আতঙ্কে আছেন।",
    },
    {
      titleBn: "{area} এলাকায় ভাড়াটিয়াকে হুমকি",
      summaryBn: "{area} এলাকায় বাসা ভাড়া নিয়ে বিরোধের জের ধরে একটি পরিবারকে প্রতিদিন হুমকি দেওয়া ও গালাগাল করা হচ্ছে।",
    },
    {
      titleBn: "{area} এলাকার এক তরুণীকে অনলাইনে ব্ল্যাকমেইল",
      summaryBn: "ব্যক্তিগত ছবি ছড়িয়ে দেওয়ার ভয় দেখিয়ে {area} এলাকার এক তরুণীর কাছে টাকা দাবি করা হচ্ছে। তিনি দ্রুত সহায়তা চান।",
      victim: "woman",
    },
  ],
  "police-misconduct": [
    {
      titleBn: "{area} এলাকায় অকারণে আটক ও টাকা দাবি",
      summaryBn: "{area} এলাকায় রাতে এক তরুণকে কোনো কারণ ছাড়াই আটক করা হয়। ছেড়ে দিতে টাকা চাওয়া হচ্ছে বলে পরিবারের অভিযোগ।",
    },
    {
      titleBn: "{area} এলাকায় জিডি নিতে অস্বীকৃতি",
      summaryBn: "{area} এলাকার এক বাসিন্দা জানান, সাধারণ ডায়েরি করতে গেলে তাঁকে থানা থেকে বারবার ফিরিয়ে দেওয়া হচ্ছে।",
    },
    {
      titleBn: "{area} এলাকায় টহলে দুর্ব্যবহারের অভিযোগ",
      summaryBn: "{area} এলাকায় রাতের টহলে এক পথচারীর সঙ্গে দুর্ব্যবহারের অভিযোগ উঠেছে। ঘটনাটি আশপাশের লোকজন দেখেছেন।",
    },
  ],
  theft: [
    {
      titleBn: "{area} এলাকায় মোবাইল ছিনতাই",
      summaryBn: "{area} এলাকায় সন্ধ্যায় মোটরসাইকেলে আসা দুজন এক পথচারীর মোবাইল ফোন ছিনিয়ে নিয়ে পালিয়েছে।",
    },
    {
      titleBn: "{area} এলাকায় দোকানে চুরি",
      summaryBn: "{area} এলাকায় গত রাতে একটি দোকানের তালা ভেঙে মালামাল ও নগদ টাকা চুরি হয়েছে।",
    },
    {
      titleBn: "{area} এলাকায় ব্যাগ ছিনতাই",
      summaryBn: "{area} এলাকায় বাসে ওঠার সময় এক নারীর ব্যাগ ছিনতাই হয়েছে। ব্যাগে জরুরি কাগজপত্র ছিল।",
      victim: "woman",
    },
  ],
  assault: [
    {
      titleBn: "{area} এলাকায় সংঘর্ষে আহত",
      summaryBn: "{area} এলাকায় জমির বিরোধে দুই পক্ষের সংঘর্ষে কয়েকজন আহত হয়েছেন। পরিস্থিতি উত্তেজনাপূর্ণ।",
    },
    {
      titleBn: "{area} এলাকায় দোকানদারের ওপর হামলা",
      summaryBn: "{area} এলাকায় ভাড়া নিয়ে বিরোধের জের ধরে এক দোকানদারের ওপর লাঠিসোঁটা নিয়ে হামলা হয়েছে।",
    },
    {
      titleBn: "{area} এলাকায় নারীকে মারধর",
      summaryBn: "{area} এলাকায় পারিবারিক বিরোধের জের ধরে এক নারীকে মারধর করা হয়েছে। প্রতিবেশীরা সাহায্য চাইছেন।",
      victim: "woman",
    },
  ],
  protest: [
    {
      titleBn: "{area} এলাকায় শ্রমিকদের বিক্ষোভ",
      summaryBn: "{area} এলাকায় বকেয়া বেতনের দাবিতে শ্রমিকরা সড়ক অবরোধ করেছেন। যান চলাচল ব্যাহত হচ্ছে।",
    },
    {
      titleBn: "{area} এলাকায় শিক্ষার্থীদের মানববন্ধন",
      summaryBn: "{area} এলাকায় দাবি আদায়ে শিক্ষার্থীরা মানববন্ধন করছেন। লোকসমাগম বাড়ছে, নিরাপত্তা দরকার।",
    },
    {
      titleBn: "{area} এলাকায় বাসিন্দাদের সড়ক অবরোধ",
      summaryBn: "{area} এলাকায় পানি ও বিদ্যুৎ সংকটের প্রতিবাদে বাসিন্দারা সড়ক অবরোধ করেছেন।",
    },
  ],
  "sexual-harassment": [
    {
      titleBn: "{area} বাসস্ট্যান্ডে তরুণীকে উত্ত্যক্ত",
      summaryBn: "সন্ধ্যায় {area} বাসস্ট্যান্ডে বাসের অপেক্ষায় থাকা এক তরুণীকে কয়েকজন যুবক অশালীন মন্তব্য করে উত্ত্যক্ত করছে। তিনি দ্রুত সহায়তা চান।",
      victim: "woman",
    },
    {
      titleBn: "{area} হয়ে চলা বাসে যৌন হয়রানি",
      summaryBn: "{area} হয়ে যাওয়া একটি বাসে ভিড়ের মধ্যে এক নারী যাত্রী যৌন হয়রানির শিকার হয়েছেন বলে জানিয়েছেন। বাসটি এখনো রুটে চলছে।",
      victim: "woman",
    },
    {
      titleBn: "{area} এলাকায় স্কুলছাত্রীকে ইভটিজিং",
      summaryBn: "{area} এলাকায় স্কুল ছুটির পর এক ছাত্রীকে প্রতিদিন পিছু নিয়ে উত্ত্যক্ত করা হচ্ছে। পরিবার ভয়ে মেয়েকে স্কুলে পাঠাতে পারছে না।",
      victim: "child",
      involved: "repeat",
    },
    {
      titleBn: "{area} এলাকায় কাজ শেষে ফেরার পথে হয়রানি",
      summaryBn: "রাতে কাজ শেষে ফেরার পথে {area} এলাকায় এক কর্মজীবী নারীর পথ আটকে হয়রানি করা হয়েছে বলে অভিযোগ।",
      victim: "woman",
    },
    {
      titleBn: "{area} এলাকার মার্কেটে নারী ক্রেতাকে হয়রানি",
      summaryBn: "{area} এলাকার একটি মার্কেটের ভিড়ে এক নারী ক্রেতা হয়রানির শিকার হয়েছেন। আশপাশের দোকানিরা ঘটনাটি দেখেছেন।",
      victim: "woman",
    },
  ],
  "domestic-violence": [
    {
      titleBn: "{area} এলাকায় যৌতুকের জন্য গৃহবধূ নির্যাতন",
      summaryBn: "{area} এলাকায় যৌতুকের দাবিতে এক গৃহবধূকে মারধর করা হচ্ছে বলে প্রতিবেশীরা জানিয়েছেন। তিনি বাড়ি থেকে বের হতে পারছেন না।",
      victim: "woman",
      involved: "individual",
    },
    {
      titleBn: "{area} এলাকায় রাতে পারিবারিক সহিংসতা",
      summaryBn: "{area} এলাকার একটি বাসা থেকে রাতে চিৎকার শোনা যাচ্ছে। এক নারী ফোনে জানিয়েছেন, তাঁকে মারধর করা হচ্ছে।",
      victim: "woman",
      involved: "individual",
    },
    {
      titleBn: "{area} এলাকায় কিশোরী গৃহকর্মী নির্যাতন",
      summaryBn: "{area} এলাকার একটি বাসায় এক কিশোরী গৃহকর্মীকে নির্যাতন করা হচ্ছে বলে পাশের বাসার এক বাসিন্দা অভিযোগ করেছেন।",
      victim: "child",
    },
    {
      titleBn: "{area} এলাকায় বাল্যবিয়ের চেষ্টা",
      summaryBn: "{area} এলাকায় এক স্কুলছাত্রীকে জোর করে বিয়ে দেওয়ার চেষ্টা চলছে বলে তার এক শিক্ষক জানিয়েছেন। মেয়েটি সাহায্য চেয়েছে।",
      victim: "child",
    },
  ],
  kidnapping: [
    {
      titleBn: "{area} এলাকা থেকে শিশু নিখোঁজ, মুক্তিপণ দাবি",
      summaryBn: "{area} এলাকায় বিকেলে খেলতে গিয়ে একটি শিশু আর ফেরেনি। পরিবার মুক্তিপণ চেয়ে ফোন পেয়েছে বলে জানিয়েছে।",
      victim: "child",
    },
    {
      titleBn: "{area} এলাকায় ব্যবসায়ীকে তুলে নেওয়ার অভিযোগ",
      summaryBn: "{area} এলাকায় এক ব্যবসায়ীকে একটি মাইক্রোবাসে তুলে নেওয়া হয়েছে বলে প্রত্যক্ষদর্শীরা জানিয়েছেন। পরিবার তাঁর খোঁজ পাচ্ছে না।",
      victim: "general",
    },
    {
      titleBn: "{area} এলাকায় কিশোরী অপহরণের অভিযোগ",
      summaryBn: "{area} এলাকায় কলেজে যাওয়ার পথে এক কিশোরীকে অপহরণ করা হয়েছে বলে পরিবারের অভিযোগ।",
      victim: "child",
    },
  ],
  drugs: [
    {
      titleBn: "{area} এলাকায় প্রকাশ্যে মাদক বিক্রি",
      summaryBn: "{area} এলাকার একটি গলিতে রাতে প্রকাশ্যে মাদক বিক্রি হচ্ছে বলে বাসিন্দারা জানিয়েছেন। এলাকার কিশোররা আসক্ত হয়ে পড়ছে।",
    },
    {
      titleBn: "{area} এলাকায় বাসায় বাসায় ইয়াবা সরবরাহ",
      summaryBn: "{area} এলাকায় একটি চক্র বাসায় বাসায় ইয়াবা পৌঁছে দিচ্ছে বলে এক অভিভাবক অভিযোগ করেছেন।",
      involved: "ring",
    },
    {
      titleBn: "{area} এলাকায় মাদকসেবীদের আড্ডা",
      summaryBn: "{area} এলাকার একটি পরিত্যক্ত ভবনে রাতে মাদকসেবীরা জড়ো হয়। পথচারীরা ছিনতাইয়ের ভয়ে আছেন।",
    },
  ],
  sos: [
    {
      titleBn: "{area} এলাকা থেকে জরুরি SOS",
      summaryBn: "{area} এলাকা থেকে একজন জরুরি SOS বোতাম চেপেছেন, কথা বলার সুযোগ পাননি। অবস্থান ধরে নিকটতম ইউনিট পাঠানো দরকার।",
    },
    {
      titleBn: "{area} এলাকায় রাতে বিপদে নারী, SOS",
      summaryBn: "রাতে {area} এলাকা থেকে এক নারী SOS পাঠিয়েছেন। তিনি জানিয়েছেন, কেউ তাঁকে অনুসরণ করছে।",
      victim: "woman",
    },
    {
      titleBn: "{area} এলাকায় হামলার মুখে SOS",
      summaryBn: "{area} এলাকায় এক দোকানদার হামলার মুখে SOS চেপেছেন। ফোনে চিৎকার শোনা গেছে, এরপর লাইন কেটে যায়।",
      victim: "general",
    },
    {
      titleBn: "{area} এলাকায় বয়স্ক ব্যক্তির SOS",
      summaryBn: "{area} এলাকায় একা থাকা এক বয়স্ক ব্যক্তি SOS পাঠিয়েছেন; বাসায় অপরিচিত লোক ঢুকেছে বলে জানিয়েছেন।",
      victim: "elderly",
    },
  ],
  adulteration: [
    {
      titleBn: "{business}-এ ভেজাল খাবারের অভিযোগ",
      summaryBn: "{area} এলাকার {business} থেকে কেনা খাবারে ভেজালের সন্দেহ করছেন এক ক্রেতা। খেয়ে পরিবারের কয়েকজন অসুস্থ হয়েছেন।",
      kinds: FOOD,
    },
    {
      titleBn: "{business}-এ বাসি ও পচা উপকরণ",
      summaryBn: "{business}-এ বাসি ও পচা উপকরণ দিয়ে খাবার তৈরি হচ্ছে বলে {area} এলাকার ক্রেতারা অভিযোগ করেছেন।",
      kinds: KITCHEN,
    },
    {
      titleBn: "{business}-এর পণ্যে ক্ষতিকর রং",
      summaryBn: "{area} এলাকার {business}-এ বিক্রি হওয়া পণ্যে ক্ষতিকর রং ও রাসায়নিক মেশানোর অভিযোগ উঠেছে।",
      kinds: FOOD,
    },
    {
      titleBn: "{business}-এ ভেজাল ওষুধের অভিযোগ",
      summaryBn: "{area} এলাকার {business} থেকে কেনা ওষুধ খেয়ে কাজ হচ্ছে না বলে এক ক্রেতা জানিয়েছেন। ওষুধটি ভেজাল কি না, তাঁর সন্দেহ।",
      kinds: ["pharmacy"],
    },
    {
      titleBn: "{business}-এর জ্বালানিতে ভেজাল",
      summaryBn: "{area} এলাকার {business} থেকে তেল নেওয়ার পর কয়েকটি গাড়ি বন্ধ হয়ে গেছে। চালকদের সন্দেহ, জ্বালানিতে ভেজাল মেশানো হয়েছে।",
      kinds: ["fuel"],
    },
    {
      titleBn: "{business}-এ তালিকাভুক্ত ক্ষতিকর পণ্য: {product}",
      summaryBn: "{area} এলাকার {business}-এ {product} বিক্রি হচ্ছে বলে এক ক্রেতা জানিয়েছেন। পণ্যটি বাজার থেকে তুলে নেওয়ার তালিকায় আছে।",
      product: "recall",
    },
  ],
  overpricing: [
    {
      titleBn: "{business}-এ নির্ধারিত দামের বেশি আদায়",
      summaryBn: "{area} এলাকার {business} পণ্যের গায়ে লেখা দামের চেয়ে বেশি টাকা নিচ্ছে বলে ক্রেতারা জানিয়েছেন।",
    },
    {
      titleBn: "{business}-এ ক্রেতা বুঝে আলাদা দাম",
      summaryBn: "{business}-এ ক্রেতা বুঝে আলাদা দাম হাঁকা হচ্ছে। {area} এলাকার একাধিক ক্রেতা একই অভিযোগ করেছেন।",
    },
    {
      titleBn: "{business}-এ পণ্য মজুত রেখে বেশি দামে বিক্রি",
      summaryBn: "{business} নিত্যপ্রয়োজনীয় পণ্য মজুত রেখে দাম বাড়িয়ে বিক্রি করছে বলে {area} এলাকার বাসিন্দাদের অভিযোগ।",
      kinds: ["grocery", "market"],
    },
    {
      titleBn: "{business}-এ ওষুধের দাম বেশি নেওয়া",
      summaryBn: "{area} এলাকার {business} ওষুধের গায়ে ছাপা সর্বোচ্চ খুচরা মূল্যের চেয়ে বেশি দাম নিচ্ছে বলে এক ক্রেতা অভিযোগ করেছেন।",
      kinds: ["pharmacy"],
    },
    {
      titleBn: "{business}-এ জ্বালানির বাড়তি দাম",
      summaryBn: "{area} এলাকার {business} সরকার নির্ধারিত দামের চেয়ে প্রতি লিটারে বেশি টাকা নিচ্ছে বলে চালকরা জানিয়েছেন।",
      kinds: ["fuel"],
    },
    {
      titleBn: "{business}-এ {product} নির্ধারিত দামের বেশিতে",
      summaryBn: "{area} এলাকার {business} {product} সরকার নির্ধারিত দামের চেয়ে বেশি দামে বিক্রি করছে বলে ক্রেতারা অভিযোগ করেছেন।",
      kinds: ["grocery", "market"],
      product: "fixed",
    },
    {
      titleBn: "{business}-এ {product}-এর দাম হঠাৎ বেশি",
      summaryBn: "{area} এলাকার {business}-এ {product}-এর দাম বাজারদরের চেয়ে অনেক বেশি নেওয়া হচ্ছে বলে এক ক্রেতা জানিয়েছেন।",
      kinds: ["grocery", "market"],
      product: "price",
    },
  ],
  "fake-product": [
    {
      titleBn: "{business}-এ নকল পণ্য বিক্রি",
      summaryBn: "{area} এলাকার {business} নামী ব্র্যান্ডের নামে নকল পণ্য বিক্রি করছে বলে এক ক্রেতা অভিযোগ করেছেন।",
    },
    {
      titleBn: "{business}-এ মেয়াদের তারিখ বদলে বিক্রি",
      summaryBn: "{business}-এ পুরোনো পণ্যে নতুন মেয়াদের লেবেল লাগিয়ে বিক্রি করা হচ্ছে বলে {area} এলাকার ক্রেতারা জানিয়েছেন।",
      kinds: [...FOOD, "pharmacy"],
    },
    {
      titleBn: "{business}-এ ভুয়া লেবেলের পণ্য",
      summaryBn: "{area} এলাকার {business}-এ ভুয়া লেবেল লাগানো প্রসাধনী ও ঘরের জিনিস বিক্রি হচ্ছে বলে অভিযোগ।",
      kinds: ["grocery", "market", "pharmacy"],
    },
    {
      titleBn: "{business}-এ নকল ওষুধ বিক্রির অভিযোগ",
      summaryBn: "{area} এলাকার {business}-এ নামী কোম্পানির নামে নকল ওষুধ বিক্রি হচ্ছে বলে এক ক্রেতা সন্দেহ করছেন।",
      kinds: ["pharmacy"],
    },
    {
      titleBn: "{business}-এ নিষিদ্ধ পণ্য বিক্রি: {product}",
      summaryBn: "বাজার থেকে তুলে নেওয়ার নির্দেশ থাকা {product} এখনো {area} এলাকার {business}-এ বিক্রি হচ্ছে বলে এক ক্রেতা অভিযোগ করেছেন।",
      product: "recall",
    },
  ],
  "unsafe-business": [
    {
      titleBn: "{business}-এর রান্নাঘর অপরিচ্ছন্ন",
      summaryBn: "{area} এলাকার {business}-এর রান্নাঘর নোংরা ও পোকামাকড়ে ভরা বলে একজন ক্রেতা ছবিসহ অভিযোগ জানিয়েছেন।",
      kinds: KITCHEN,
    },
    {
      titleBn: "{business}-এ অগ্নিনিরাপত্তার ব্যবস্থা নেই",
      summaryBn: "{business}-এ আগুন নেভানোর কোনো যন্ত্র নেই, বের হওয়ার পথও বন্ধ। {area} এলাকার বাসিন্দারা ঝুঁকির কথা জানিয়েছেন।",
    },
    {
      titleBn: "{business}-এ খোলা খাবার ও অনিরাপদ পানি",
      summaryBn: "{area} এলাকার {business}-এ খোলা জায়গায় খাবার রাখা এবং অনিরাপদ পানি ব্যবহারের অভিযোগ এসেছে।",
      kinds: FOOD,
    },
    {
      titleBn: "{business}-এ ওষুধ ঠিকমতো সংরক্ষণ হয় না",
      summaryBn: "{area} এলাকার {business}-এ ফ্রিজে রাখার ওষুধ খোলা তাকে পড়ে আছে এবং কড়া রোদে রাখা হচ্ছে বলে এক ক্রেতা জানিয়েছেন।",
      kinds: ["pharmacy"],
    },
    {
      titleBn: "{business}-এ জ্বালানি সংরক্ষণে ঝুঁকি",
      summaryBn: "{area} এলাকার {business}-এর পাশে আগুন জ্বালানো হচ্ছে এবং জ্বালানি রাখার জায়গা ঠিকমতো ঢাকা নেই। আশপাশের লোকজন আতঙ্কিত।",
      kinds: ["fuel"],
    },
  ],
  "false-weight": [
    {
      titleBn: "{business}-এ ওজনে কম দেওয়া",
      summaryBn: "{area} এলাকার {business}-এ এক কেজি বলে নয়শ গ্রামের মতো পণ্য দেওয়া হয়েছে। ক্রেতা বাড়ি এসে ওজন করে তা দেখেছেন।",
      kinds: ["grocery", "market", "sweetshop", "bakery"],
    },
    {
      titleBn: "{business}-এর পাল্লায় কারচুপি",
      summaryBn: "{business}-এর পাল্লায় কারচুপি ধরা পড়েছে বলে {area} এলাকার কয়েকজন ক্রেতা জানিয়েছেন।",
      kinds: ["grocery", "market", "sweetshop", "bakery"],
    },
    {
      titleBn: "{business}-এ মাপে কম পণ্য",
      summaryBn: "{area} এলাকার {business}-এ প্রতিবার মাপে কম পণ্য দেওয়া হচ্ছে বলে ক্রেতারা অভিযোগ করেছেন।",
      kinds: ["restaurant", "grocery", "bakery", "sweetshop", "market"],
    },
    {
      titleBn: "{business}-এর মিটারে তেল কম দেওয়া",
      summaryBn: "{area} এলাকার {business}-এ মিটারে এক লিটার দেখালেও কম তেল পাওয়া যাচ্ছে বলে একজন চালক মাপ দিয়ে দেখেছেন।",
      kinds: ["fuel"],
    },
  ],
  bribery: [
    {
      titleBn: "{area} এলাকায় সেবা পেতে ঘুষ দাবি",
      summaryBn: "{area} এলাকার একটি সরকারি অফিসে ফাইল এগিয়ে নিতে টাকা দাবি করা হচ্ছে বলে এক সেবাগ্রহীতা জানিয়েছেন।",
    },
    {
      titleBn: "{area} এলাকায় নামজারিতে বাড়তি টাকা",
      summaryBn: "{area} এলাকার ভূমি অফিসে জমির নামজারির জন্য নির্ধারিত ফির বাইরে বাড়তি টাকা চাওয়া হচ্ছে।",
    },
    {
      titleBn: "{area} এলাকায় লাইসেন্স নবায়নে টাকা দাবি",
      summaryBn: "{area} এলাকায় ব্যবসার লাইসেন্স নবায়নের সময় একজন কর্মকর্তা টাকা না দিলে ফাইল আটকে রাখার হুমকি দিয়েছেন।",
    },
  ],
  "land-grab": [
    {
      titleBn: "{area} এলাকায় জমি দখলের চেষ্টা",
      summaryBn: "{area} এলাকায় একটি পরিবারের পৈতৃক জমিতে রাতারাতি বেড়া দিয়ে দখলের চেষ্টা চলছে।",
    },
    {
      titleBn: "{area} এলাকায় খাল ভরাট করে দখল",
      summaryBn: "{area} এলাকার একটি খাল মাটি ফেলে ভরাট করে দখল করা হচ্ছে। স্থানীয়রা প্রতিবাদ করছেন।",
    },
    {
      titleBn: "{area} এলাকায় বিধবার জমি জবরদখল",
      summaryBn: "{area} এলাকায় এক বিধবার জমি জাল দলিলের ভিত্তিতে দখলের চেষ্টা চলছে বলে তিনি অভিযোগ করেছেন।",
    },
  ],
  "service-denial": [
    {
      titleBn: "{area} এলাকায় বয়স্ক ভাতা পেতে হয়রানি",
      summaryBn: "{area} এলাকার এক বয়স্ক নাগরিক মাসের পর মাস ঘুরেও বয়স্ক ভাতা পাচ্ছেন না বলে জানিয়েছেন।",
    },
    {
      titleBn: "{area} এলাকার স্বাস্থ্যকেন্দ্রে চিকিৎসক নেই",
      summaryBn: "{area} এলাকার স্বাস্থ্যকেন্দ্রে সপ্তাহের বেশিরভাগ দিন চিকিৎসক থাকেন না। রোগীরা ফিরে যাচ্ছেন।",
    },
    {
      titleBn: "{area} এলাকায় জন্মনিবন্ধন আটকে আছে",
      summaryBn: "{area} এলাকায় জন্মনিবন্ধনের আবেদন তিন মাস ধরে আটকে আছে। কর্তৃপক্ষ কোনো কারণ জানাচ্ছে না।",
    },
  ],
  environment: [
    {
      titleBn: "{area} এলাকায় কারখানার বর্জ্যে পানি দূষণ",
      summaryBn: "{area} এলাকার একটি কারখানা শোধন না করেই বর্জ্য পানিতে ফেলছে। মাছ মরে ভেসে উঠছে বলে স্থানীয়রা জানিয়েছেন।",
    },
    {
      titleBn: "{area} এলাকায় খোলা জায়গায় আবর্জনা পোড়ানো",
      summaryBn: "{area} এলাকায় প্রতিদিন আবর্জনা পোড়ানোর ধোঁয়ায় বাসিন্দাদের শ্বাসকষ্ট হচ্ছে।",
    },
    {
      titleBn: "{area} এলাকায় রাতভর শব্দদূষণ",
      summaryBn: "{area} এলাকায় রাতভর উচ্চ শব্দে যন্ত্র চালানো হচ্ছে। শিক্ষার্থী ও রোগীরা সমস্যায় আছেন।",
    },
  ],
  labour: [
    {
      titleBn: "{area} এলাকায় কারখানায় মজুরি বকেয়া",
      summaryBn: "{area} এলাকার একটি কারখানায় তিন মাসের মজুরি বকেয়া। দাবি জানালে শ্রমিকরা ছাঁটাইয়ের হুমকি পাচ্ছেন।",
    },
    {
      titleBn: "{area} এলাকায় নিরাপত্তাহীন কর্মপরিবেশ",
      summaryBn: "{area} এলাকার একটি কারখানায় জরুরি বের হওয়ার পথ তালাবদ্ধ রাখা হয়। শ্রমিকরা দুর্ঘটনার আশঙ্কায় আছেন।",
    },
    {
      titleBn: "{area} এলাকায় শিশুশ্রম",
      summaryBn: "{area} এলাকার একটি কারখানায় শিশুদের দিয়ে ঝুঁকিপূর্ণ কাজ করানো হচ্ছে বলে এক বাসিন্দা জানিয়েছেন।",
    },
  ],
  other: [
    {
      titleBn: "{area} এলাকায় সড়ক ভাঙা",
      summaryBn: "{area} এলাকায় প্রধান সড়কে বড় গর্ত তৈরি হয়ে চলাচলে বিপদ হচ্ছে। কয়েক সপ্তাহেও মেরামত হয়নি।",
    },
    {
      titleBn: "{area} এলাকায় নর্দমা উপচে পড়ছে",
      summaryBn: "{area} এলাকায় নর্দমা উপচে রাস্তায় নোংরা পানি জমছে। বাসিন্দাদের চলাচল কঠিন হয়ে পড়েছে।",
    },
    {
      titleBn: "{area} এলাকায় রাস্তার বাতি নষ্ট",
      summaryBn: "{area} এলাকার সড়কের বাতি এক মাস ধরে বন্ধ। রাতে ছিনতাই ও দুর্ঘটনার ভয় বাড়ছে।",
    },
  ],
};
