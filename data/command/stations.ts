/**
 * Police stations (thanas) and their demo patrol cars.
 * Approximate positions; real thana names; no phone numbers (see data/complaints.ts).
 * Patrols are invented units placed within about a kilometre of their station.
 */
import type { Unit } from "../../lib/command/types.ts";

type Row = [slug: string, name: string, nameBn: string, lat: number, lng: number, patrols: number];

const ROWS: Row[] = [
  // Dhaka metropolitan area
  ["ramna", "Ramna", "রমনা", 23.7385, 90.4, 3],
  ["shahbag", "Shahbag", "শাহবাগ", 23.739, 90.395, 2],
  ["dhanmondi", "Dhanmondi", "ধানমন্ডি", 23.7461, 90.3742, 3],
  ["mohammadpur", "Mohammadpur", "মোহাম্মদপুর", 23.76, 90.356, 2],
  ["mirpur-model", "Mirpur Model", "মিরপুর মডেল", 23.804, 90.364, 3],
  ["pallabi", "Pallabi", "পল্লবী", 23.824, 90.364, 2],
  ["kafrul", "Kafrul", "কাফরুল", 23.794, 90.383, 2],
  ["gulshan", "Gulshan", "গুলশান", 23.7925, 90.413, 3],
  ["banani", "Banani", "বনানী", 23.794, 90.403, 2],
  ["badda", "Badda", "বাড্ডা", 23.78, 90.426, 2],
  ["rampura", "Rampura", "রামপুরা", 23.76, 90.422, 2],
  ["khilgaon", "Khilgaon", "খিলগাঁও", 23.748, 90.428, 2],
  ["motijheel", "Motijheel", "মতিঝিল", 23.732, 90.418, 3],
  ["paltan", "Paltan", "পল্টন", 23.735, 90.413, 2],
  ["tejgaon", "Tejgaon", "তেজগাঁও", 23.758, 90.393, 2],
  ["uttara-east", "Uttara East", "উত্তরা পূর্ব", 23.876, 90.405, 2],
  ["uttara-west", "Uttara West", "উত্তরা পশ্চিম", 23.865, 90.388, 2],
  ["jatrabari", "Jatrabari", "যাত্রাবাড়ী", 23.71, 90.435, 2],
  ["lalbagh", "Lalbagh", "লালবাগ", 23.719, 90.389, 2],
  ["kotwali-dhaka", "Kotwali Dhaka", "ঢাকা কোতোয়ালি", 23.709, 90.406, 2],
  ["savar", "Savar", "সাভার", 23.853, 90.261, 2],
  ["narayanganj-sadar", "Narayanganj Sadar", "নারায়ণগঞ্জ সদর", 23.628, 90.502, 2],
  ["tongi", "Tongi", "টঙ্গী", 23.892, 90.405, 2],
  // The other seven divisions
  ["chattogram-kotwali", "Chattogram Kotwali", "চট্টগ্রাম কোতোয়ালি", 22.338, 91.833, 2],
  ["panchlaish", "Panchlaish", "পাঁচলাইশ", 22.36, 91.817, 2],
  ["cumilla-kotwali", "Cumilla Kotwali", "কুমিল্লা কোতোয়ালি", 23.462, 91.179, 1],
  ["coxsbazar-sadar", "Cox's Bazar Sadar", "কক্সবাজার সদর", 21.451, 91.977, 2],
  ["khulna-sadar", "Khulna Sadar", "খুলনা সদর", 22.814, 89.562, 2],
  ["jashore-kotwali", "Jashore Kotwali", "যশোর কোতোয়ালি", 23.167, 89.211, 1],
  ["boalia", "Boalia", "বোয়ালিয়া", 24.372, 88.596, 2],
  ["bogura-sadar", "Bogura Sadar", "বগুড়া সদর", 24.849, 89.368, 1],
  ["sylhet-kotwali", "Sylhet Kotwali", "সিলেট কোতোয়ালি", 24.896, 91.87, 2],
  ["barishal-kotwali", "Barishal Kotwali", "বরিশাল কোতোয়ালি", 22.704, 90.368, 1],
  ["rangpur-kotwali", "Rangpur Kotwali", "রংপুর কোতোয়ালি", 25.746, 89.253, 1],
  ["mymensingh-kotwali", "Mymensingh Kotwali", "ময়মনসিংহ কোতোয়ালি", 24.753, 90.404, 2],
  ["nakla", "Nakla", "নকলা", 25.065, 90.138, 1],
  // District towns and outer areas that would otherwise sit far from any thana
  ["dinajpur-kotwali", "Dinajpur Kotwali", "দিনাজপুর কোতোয়ালি", 25.624, 88.635, 2],
  ["sunamganj-sadar", "Sunamganj Sadar", "সুনামগঞ্জ সদর", 25.07, 91.4, 1],
  ["patuakhali-sadar", "Patuakhali Sadar", "পটুয়াখালী সদর", 22.359, 90.33, 1],
  ["sharsha", "Sharsha", "শার্শা", 23.044, 88.9, 1],
  ["jamalpur-sadar", "Jamalpur Sadar", "জামালপুর সদর", 24.937, 89.94, 1],
  ["sherpur-sadar", "Sherpur Sadar", "শেরপুর সদর", 25.021, 90.017, 2],
  ["gazipur-sadar", "Gazipur Sadar", "গাজীপুর সদর", 23.999, 90.422, 2],
  ["siddhirganj", "Siddhirganj", "সিদ্ধিরগঞ্জ", 23.695, 90.501, 1],
  ["halishahar", "Halishahar", "হালিশহর", 22.331, 91.783, 1],
];

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const bn = (n: number): string => String(n).split("").map((d) => BN_DIGITS[Number(d)]).join("");

/** Where each patrol sits relative to its station, in degrees (about 0.5 to 1 km). */
const OFFSETS: [number, number][] = [
  [0.006, 0.004],
  [-0.005, 0.007],
  [0.003, -0.008],
];

const round4 = (x: number): number => Math.round(x * 10000) / 10000;

export const STATIONS: readonly Unit[] = ROWS.map(([slug, name, nameBn, lat, lng]) => ({
  id: `st-${slug}`,
  kind: "station",
  dept: "police",
  name: `${name} Police Station`,
  nameBn: `${nameBn} থানা`,
  homeId: `st-${slug}`,
  status: "available",
  lat,
  lng,
}));

export const PATROLS: readonly Unit[] = ROWS.flatMap(([slug, name, nameBn, lat, lng, count]) =>
  OFFSETS.slice(0, count).map(
    ([dLat, dLng], i): Unit => ({
      id: `pt-${slug}-${i + 1}`,
      kind: "patrol",
      dept: "police",
      name: `${name} Patrol ${i + 1}`,
      nameBn: `${nameBn} টহল ${bn(i + 1)}`,
      homeId: `st-${slug}`,
      status: "available",
      lat: round4(lat + dLat),
      lng: round4(lng + dLng),
    }),
  ),
);
