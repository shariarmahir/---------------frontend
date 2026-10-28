/**
 * Consumer-rights directorate (ভোক্তা অধিদপ্তর) offices and inspection teams,
 * plus invented businesses that consumer complaints can point at.
 * Approximate positions; no phone numbers. Every business here is fictional
 * and does not stand for any real shop, brand or person.
 */
import type { Business, DivisionId, Unit } from "../../lib/command/types.ts";

type OfficeRow = [slug: string, name: string, nameBn: string, lat: number, lng: number, teams: number];

const OFFICE_ROWS: OfficeRow[] = [
  ["dhaka-hq", "Head Office, Karwan Bazar", "প্রধান কার্যালয়, কারওয়ান বাজার", 23.7515, 90.392, 2],
  ["dhaka", "Dhaka Divisional Office", "ঢাকা বিভাগীয় কার্যালয়", 23.737, 90.408, 2],
  ["ctg", "Chattogram Divisional Office", "চট্টগ্রাম বিভাগীয় কার্যালয়", 22.34, 91.83, 2],
  ["khulna", "Khulna Divisional Office", "খুলনা বিভাগীয় কার্যালয়", 22.81, 89.56, 1],
  ["rajshahi", "Rajshahi Divisional Office", "রাজশাহী বিভাগীয় কার্যালয়", 24.37, 88.6, 1],
  ["sylhet", "Sylhet Divisional Office", "সিলেট বিভাগীয় কার্যালয়", 24.895, 91.868, 1],
  ["barishal", "Barishal Divisional Office", "বরিশাল বিভাগীয় কার্যালয়", 22.702, 90.37, 1],
  ["rangpur", "Rangpur Divisional Office", "রংপুর বিভাগীয় কার্যালয়", 25.745, 89.255, 1],
  ["mymensingh", "Mymensingh Divisional Office", "ময়মনসিংহ বিভাগীয় কার্যালয়", 24.751, 90.41, 1],
  ["cumilla", "Cumilla District Office", "কুমিল্লা জেলা কার্যালয়", 23.46, 91.18, 1],
  ["narayanganj", "Narayanganj District Office", "নারায়ণগঞ্জ জেলা কার্যালয়", 23.625, 90.5, 1],
  ["gazipur", "Gazipur District Office", "গাজীপুর জেলা কার্যালয়", 23.999, 90.42, 1],
  ["bogura", "Bogura District Office", "বগুড়া জেলা কার্যালয়", 24.85, 89.37, 1],
  ["jashore", "Jashore District Office", "যশোর জেলা কার্যালয়", 23.165, 89.21, 1],
  ["coxsbazar", "Cox's Bazar District Office", "কক্সবাজার জেলা কার্যালয়", 21.452, 91.975, 1],
  ["dinajpur", "Dinajpur District Office", "দিনাজপুর জেলা কার্যালয়", 25.627, 88.635, 1],
  ["sunamganj", "Sunamganj District Office", "সুনামগঞ্জ জেলা কার্যালয়", 25.0715, 91.402, 1],
  ["patuakhali", "Patuakhali District Office", "পটুয়াখালী জেলা কার্যালয়", 22.36, 90.33, 1],
  ["sherpur", "Sherpur District Office", "শেরপুর জেলা কার্যালয়", 25.0215, 90.016, 1],
];

const BN_LETTERS = ["ক", "খ", "গ"];
const LATIN_LETTERS = ["A", "B", "C"];
const TEAM_OFFSETS: [number, number][] = [
  [0.005, 0.006],
  [-0.006, -0.004],
];
const round4 = (x: number): number => Math.round(x * 10000) / 10000;

export const OFFICES: readonly Unit[] = OFFICE_ROWS.map(([slug, name, nameBn, lat, lng]) => ({
  id: `of-${slug}`,
  kind: "office",
  dept: "consumer",
  name,
  nameBn,
  homeId: `of-${slug}`,
  status: "available",
  lat,
  lng,
}));

export const TEAMS: readonly Unit[] = OFFICE_ROWS.flatMap(([slug, name, nameBn, lat, lng, count]) => {
  const short = name.replace(/ (Divisional|District) Office$/, "").replace(/^Head Office, /, "");
  const shortBn = nameBn.replace(/ (বিভাগীয়|জেলা) কার্যালয়$/, "").replace(/^প্রধান কার্যালয়, /, "");
  return TEAM_OFFSETS.slice(0, count).map(
    ([dLat, dLng], i): Unit => ({
      id: `tm-${slug}-${LATIN_LETTERS[i].toLowerCase()}`,
      kind: "team",
      dept: "consumer",
      name: `${short} Inspection Team ${LATIN_LETTERS[i]}`,
      nameBn: `${shortBn} পরিদর্শন দল ${BN_LETTERS[i]}`,
      homeId: `of-${slug}`,
      status: "available",
      lat: round4(lat + dLat),
      lng: round4(lng + dLng),
    }),
  );
});

type BizRow = [nameBn: string, name: string, kind: string, district: string, division: DivisionId, lat: number, lng: number];

const BIZ_ROWS: BizRow[] = [
  ["নতুন স্বাদ রেস্তোরাঁ", "Notun Shad Restaurant", "restaurant", "Dhaka", "dhaka", 23.8072, 90.3691],
  ["সবুজ বাজার মুদি", "Shobuj Bazar Mudi", "grocery", "Dhaka", "dhaka", 23.7568, 90.3751],
  ["বকুলতলা ফার্মেসি", "Bokultola Pharmacy", "pharmacy", "Dhaka", "dhaka", 23.7667, 90.3595],
  ["মিষ্টিমুখ মিষ্টান্ন ভাণ্ডার", "Mishtimukh Mishtanno Bhandar", "sweetshop", "Dhaka", "dhaka", 23.7392, 90.3964],
  ["ভোরের আলো বেকারি", "Bhorer Alo Bakery", "bakery", "Dhaka", "dhaka", 23.7336, 90.4165],
  ["উত্তর তারা ফিলিং স্টেশন", "Uttor Tara Filling Station", "fuel", "Dhaka", "dhaka", 23.8695, 90.3985],
  ["শাপলা কাঁচাবাজার", "Shapla Kacha Bazar", "market", "Dhaka", "dhaka", 23.7515, 90.3928],
  ["রূপসী ভোজনালয়", "Rupshi Bhojonaloy", "restaurant", "Dhaka", "dhaka", 23.7942, 90.4071],
  ["পূর্বাচল মুদি ভাণ্ডার", "Purbachal Mudi Bhandar", "grocery", "Dhaka", "dhaka", 23.7812, 90.4262],
  ["জীবনধারা ফার্মেসি", "Jibondhara Pharmacy", "pharmacy", "Dhaka", "dhaka", 23.7105, 90.4339],
  ["সকালবেলা মিষ্টি ঘর", "Shokalbela Mishti Ghor", "sweetshop", "Dhaka", "dhaka", 23.8589, 90.2672],
  ["মেঘনা পাড় রেস্তোরাঁ", "Meghna Par Restaurant", "restaurant", "Narayanganj", "dhaka", 23.6244, 90.5008],
  ["টঙ্গী সুলভ বাজার", "Tongi Sulov Bazar", "market", "Gazipur", "dhaka", 23.8921, 90.4048],
  ["পাহাড়ি ঝর্ণা ফিলিং স্টেশন", "Pahari Jhorna Filling Station", "fuel", "Chattogram", "chattogram", 22.3276, 91.8137],
  ["সাগরিকা বেকারি", "Sagorika Bakery", "bakery", "Chattogram", "chattogram", 22.3504, 91.8392],
  ["কর্ণফুলী মুদি", "Karnaphuli Mudi", "grocery", "Chattogram", "chattogram", 22.3604, 91.8008],
  ["সৈকত ভোজনালয়", "Shoikot Bhojonaloy", "restaurant", "Cox's Bazar", "chattogram", 21.4278, 91.9781],
  ["কুমিল্লা মিষ্টি কুটির", "Cumilla Mishti Kutir", "sweetshop", "Cumilla", "chattogram", 23.4612, 91.1815],
  ["রূপসা নদী মুদি", "Rupsha Nodi Mudi", "grocery", "Khulna", "khulna", 22.8105, 89.5507],
  ["হিজলপাতা ফার্মেসি", "Hijolpata Pharmacy", "pharmacy", "Khulna", "khulna", 22.8206, 89.5304],
  ["খেজুর রস ভোজনালয়", "Khejur Rosh Bhojonaloy", "restaurant", "Jashore", "khulna", 23.1668, 89.2092],
  ["পদ্মাপাড় বেকারি", "Padmapar Bakery", "bakery", "Rajshahi", "rajshahi", 24.3684, 88.6006],
  ["বরেন্দ্র সুলভ বাজার", "Borendro Sulov Bazar", "market", "Bogura", "rajshahi", 24.8469, 89.3706],
  ["সুরমা তীর রেস্তোরাঁ", "Surma Tir Restaurant", "restaurant", "Sylhet", "sylhet", 24.8936, 91.8716],
  ["চা-বাগান মুদি", "Chabagan Mudi", "grocery", "Sylhet", "sylhet", 24.9056, 91.8696],
  ["কীর্তনখোলা ফিলিং স্টেশন", "Kirtonkhola Filling Station", "fuel", "Barishal", "barishal", 22.7014, 90.354],
  ["তিস্তা ভাণ্ডার", "Tista Bhandar", "market", "Rangpur", "rangpur", 25.7443, 89.2758],
  ["ব্রহ্মপুত্র মিষ্টান্ন", "Brahmaputra Mishtanno", "sweetshop", "Mymensingh", "mymensingh", 24.7476, 90.4209],
  ["গারো পাহাড় ফার্মেসি", "Garo Pahar Pharmacy", "pharmacy", "Sherpur", "mymensingh", 25.0208, 90.0158],
];

export const BUSINESSES: readonly Business[] = BIZ_ROWS.map(([nameBn, name, kind, district, division, lat, lng], i) => ({
  id: `bz-${String(i + 1).padStart(2, "0")}`,
  nameBn,
  name,
  kind,
  district,
  division,
  lat,
  lng,
}));
