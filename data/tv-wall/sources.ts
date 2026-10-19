/**
 * Everything the National TV Wall reads, in one place: the news feeds its
 * collectors poll, the TV channels it can put on air, the division facts its
 * analysis divides by, and who answers for each kind of event.
 *
 * Every feed here is public and every item the wall shows links back to the
 * outlet that reported it: the wall is an index of what is being reported,
 * not a republisher. Social platforms (Facebook, X, TikTok) are not polled:
 * they need official API access, which the wall does not have yet.
 */
import type { DivisionId } from "../bangladesh-map.ts";

export type WireCategory = "crime" | "corruption" | "loss" | "achievement" | "development" | "economy";

export interface Feed {
  id: string;
  /** Who runs the collector, as the source list shows it. */
  label: string;
  url: string;
  lang: "bn" | "en";
}

const gn = (q: string, lang: "bn" | "en") =>
  lang === "bn"
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=bn&gl=BD&ceid=BD:bn`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-BD&gl=BD&ceid=BD:en`;

/** Google News queries reach every Bangladeshi outlet it indexes; Prothom Alo is read directly. */
export const FEEDS: Feed[] = [
  { id: "gn-crime-bn", label: "Google News · crime (Bangla)", lang: "bn", url: gn("হত্যা OR খুন OR ধর্ষণ OR ছিনতাই OR ডাকাতি OR অপহরণ OR গ্রেপ্তার when:1d", "bn") },
  { id: "gn-violence-bn", label: "Google News · violence (Bangla)", lang: "bn", url: gn("হামলা OR মারধর OR চাঁদাবাজি OR গুলি OR মাদক OR ইয়াবা when:1d", "bn") },
  { id: "gn-corruption-bn", label: "Google News · corruption (Bangla)", lang: "bn", url: gn("দুর্নীতি OR ঘুষ OR আত্মসাৎ OR দুদক when:1d", "bn") },
  { id: "gn-loss-bn", label: "Google News · accidents (Bangla)", lang: "bn", url: gn("দুর্ঘটনা OR অগ্নিকাণ্ড OR বন্যা OR বজ্রপাত OR ভূমিধস OR ডেঙ্গু when:1d", "bn") },
  { id: "gn-economy-bn", label: "Google News · economy (Bangla)", lang: "bn", url: gn("রেমিট্যান্স OR রপ্তানি OR রিজার্ভ OR মূল্যস্ফীতি OR পুঁজিবাজার OR বাজারদর when:1d", "bn") },
  { id: "gn-development-bn", label: "Google News · development (Bangla)", lang: "bn", url: gn("প্রকল্প উদ্বোধন OR সেতু OR মেট্রোরেল OR একনেক OR এক্সপ্রেসওয়ে when:1d", "bn") },
  { id: "gn-achievement-bn", label: "Google News · achievements (Bangla)", lang: "bn", url: gn("বাংলাদেশ অর্জন OR পুরস্কার OR স্বর্ণপদক OR চ্যাম্পিয়ন OR স্বীকৃতি when:1d", "bn") },
  { id: "gn-crime-en", label: "Google News · crime (English)", lang: "en", url: gn("Bangladesh murder OR robbery OR arrested OR rape when:1d", "en") },
  { id: "gn-economy-en", label: "Google News · economy (English)", lang: "en", url: gn("Bangladesh economy OR remittance OR exports OR inflation when:1d", "en") },
  { id: "gn-development-en", label: "Google News · development (English)", lang: "en", url: gn("Bangladesh project inaugurated OR bridge OR ECNEC when:1d", "en") },
  { id: "prothomalo", label: "Prothom Alo", lang: "bn", url: "https://www.prothomalo.com/feed" },
];

export interface Channel {
  id: string;
  name: string;
  nameBn: string;
  /** The YouTube channel; the wall finds its live stream from it. */
  youtube: string;
}

/** Bangladeshi news channels that stream live on YouTube and allow embedding. */
export const CHANNELS: Channel[] = [
  { id: "jamuna", name: "Jamuna TV", nameBn: "যমুনা টেলিভিশন", youtube: "UCN6sm8iHiPd0cnoUardDAnw" },
  { id: "independent", name: "Independent TV", nameBn: "ইনডিপেনডেন্ট টিভি", youtube: "UCATUkaOHwO9EP_W87zCiPbA" },
  { id: "somoy", name: "Somoy TV", nameBn: "সময় টিভি", youtube: "UC7STXq0KhgTAK6APs6v-PwA" },
  { id: "atn-news", name: "ATN News", nameBn: "এটিএন নিউজ", youtube: "UC9Rgo0CrNyd7OWliLekqqGA" },
  { id: "dbc", name: "DBC News", nameBn: "ডিবিসি নিউজ", youtube: "UCUvXoiDEKI8VZJrr58g4VAw" },
  { id: "ntv", name: "NTV News", nameBn: "এনটিভি নিউজ", youtube: "UC4LWNegp6rg21PMebmbmrOw" },
];

export interface DivisionFact {
  id: DivisionId;
  bn: string;
  en: string;
  /** Population and Housing Census 2022 (BBS). */
  population: number;
  /** The divisional city, for weather and air readings. */
  lat: number;
  lon: number;
}

export const DIVISIONS: DivisionFact[] = [
  { id: "dhaka", bn: "ঢাকা", en: "Dhaka", population: 44_215_107, lat: 23.8103, lon: 90.4125 },
  { id: "chattogram", bn: "চট্টগ্রাম", en: "Chattogram", population: 33_202_326, lat: 22.3569, lon: 91.7832 },
  { id: "rajshahi", bn: "রাজশাহী", en: "Rajshahi", population: 20_353_119, lat: 24.3745, lon: 88.6042 },
  { id: "khulna", bn: "খুলনা", en: "Khulna", population: 17_416_645, lat: 22.8456, lon: 89.5403 },
  { id: "rangpur", bn: "রংপুর", en: "Rangpur", population: 17_610_956, lat: 25.7439, lon: 89.2752 },
  { id: "mymensingh", bn: "ময়মনসিংহ", en: "Mymensingh", population: 12_225_498, lat: 24.7471, lon: 90.4203 },
  { id: "sylhet", bn: "সিলেট", en: "Sylhet", population: 11_034_863, lat: 24.8949, lon: 91.8687 },
  { id: "barishal", bn: "বরিশাল", en: "Barishal", population: 9_100_102, lat: 22.701, lon: 90.3535 },
];

export const CENSUS_SOURCE = { name: "BBS Population and Housing Census 2022", url: "https://bbs.gov.bd" };

/** The vitals the wall reads besides the news: all public, none needs a key. */
export const VITAL_SOURCES = [
  { id: "open-meteo", name: "Open-Meteo", use: "Weather and air quality", url: "https://open-meteo.com" },
  { id: "usgs", name: "USGS", use: "Earthquakes", url: "https://earthquake.usgs.gov" },
  { id: "er-api", name: "ExchangeRate-API", use: "Taka exchange rates", url: "https://www.exchangerate-api.com" },
  { id: "youtube", name: "YouTube Live", use: "Live news channels", url: "https://www.youtube.com" },
] as const;

/** Sources the wall is built to read but cannot yet, and why. */
export const PLANNED_SOURCES = [
  { name: "Facebook, X, TikTok", why: "Needs official API access" },
  { name: "Posts from Protibad and civic reports", why: "Joins once the backend is live" },
] as const;

export interface Answerable {
  /** Who answers for this kind of event, by law or mandate. */
  who: string;
  whoEn: string;
  /** The number to call, from data/complaints.ts's verified helplines. */
  call: string;
  callLabel: string;
  callLabelEn: string;
  /** What a citizen can do right now. */
  act: string;
  actEn: string;
}

export const ACCOUNTABILITY: Record<WireCategory, Answerable> = {
  crime: { who: "স্বরাষ্ট্র মন্ত্রণালয় ও বাংলাদেশ পুলিশ", whoEn: "Home Ministry, Bangladesh Police", call: "999", callLabel: "জাতীয় জরুরি সেবা", callLabelEn: "National emergency", act: "বিপদে থাকলে ৯৯৯; নারী ও শিশু নির্যাতনে ১০৯। থানায় মামলা নিতে না চাইলে প্রতিবাদ পাতায় রেকর্ড রাখুন।", actEn: "In danger, call 999; violence against women and children, 109. If the police station will not take a case, keep a record on Protibad." },
  corruption: { who: "দুর্নীতি দমন কমিশন", whoEn: "Anti-Corruption Commission", call: "106", callLabel: "দুদক হটলাইন", callLabelEn: "ACC hotline", act: "ঘুষ বা আত্মসাতের তথ্য ১০৬-এ জানান; প্রমাণ (রসিদ, ছবি, তারিখ) সঙ্গে রাখুন।", actEn: "Report bribery or embezzlement to 106; keep the evidence (receipts, photos, dates)." },
  loss: { who: "দুর্যোগ ব্যবস্থাপনা, ফায়ার সার্ভিস ও স্থানীয় প্রশাসন", whoEn: "Disaster management, Fire Service, local administration", call: "999", callLabel: "জরুরি উদ্ধার", callLabelEn: "Emergency rescue", act: "আগুন, দুর্ঘটনা বা বন্যায় ৯৯৯; সরকারি সেবার অভিযোগ ৩৩৩-এ।", actEn: "Fire, accident or flood: 999. Complaints about public services: 333." },
  economy: { who: "বাংলাদেশ ব্যাংক ও অর্থ মন্ত্রণালয়", whoEn: "Bangladesh Bank, Finance Ministry", call: "333", callLabel: "সরকারি সেবা", callLabelEn: "Government services", act: "বাজারদর ও সেবার অনিয়মের অভিযোগ ৩৩৩-এ।", actEn: "Report price gouging and service failures to 333." },
  development: { who: "পরিকল্পনা কমিশন (একনেক) ও বাস্তবায়নকারী সংস্থা", whoEn: "Planning Commission (ECNEC), implementing agency", call: "333", callLabel: "সরকারি সেবা", callLabelEn: "Government services", act: "প্রকল্পের কাজ বন্ধ বা নিম্নমানের হলে ৩৩৩-এ জানান।", actEn: "If project work has stopped or is substandard, report it to 333." },
  achievement: { who: "সংশ্লিষ্ট মন্ত্রণালয় ও প্রতিষ্ঠান", whoEn: "The ministry or institution concerned", call: "333", callLabel: "সরকারি সেবা", callLabelEn: "Government services", act: "অর্জন ছড়িয়ে দিন; উৎসের লিংক দেখে শেয়ার করুন।", actEn: "Share the good news, from the source link." },
};
