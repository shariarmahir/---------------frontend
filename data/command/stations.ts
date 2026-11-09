/**
 * Police stations (thanas) and their demo patrol cars.
 * Approximate positions; real thana names; no phone numbers (see data/complaints.ts).
 * Patrols are invented units placed within about a kilometre of their station.
 * Each row ends with the station's administrative division (a patrol shares its station's).
 */
import type { DivisionId, Unit } from "../../lib/command/types.ts";

type Row = [slug: string, name: string, nameBn: string, lat: number, lng: number, patrols: number, division: DivisionId];

const ROWS: Row[] = [
  // Dhaka metropolitan area
  ["ramna", "Ramna", "রমনা", 23.7385, 90.4, 3, "dhaka"],
  ["shahbag", "Shahbag", "শাহবাগ", 23.739, 90.395, 2, "dhaka"],
  ["dhanmondi", "Dhanmondi", "ধানমন্ডি", 23.7461, 90.3742, 3, "dhaka"],
  ["mohammadpur", "Mohammadpur", "মোহাম্মদপুর", 23.76, 90.356, 2, "dhaka"],
  ["mirpur-model", "Mirpur Model", "মিরপুর মডেল", 23.804, 90.364, 3, "dhaka"],
  ["pallabi", "Pallabi", "পল্লবী", 23.824, 90.364, 2, "dhaka"],
  ["kafrul", "Kafrul", "কাফরুল", 23.794, 90.383, 2, "dhaka"],
  ["gulshan", "Gulshan", "গুলশান", 23.7925, 90.413, 3, "dhaka"],
  ["banani", "Banani", "বনানী", 23.794, 90.403, 2, "dhaka"],
  ["badda", "Badda", "বাড্ডা", 23.78, 90.426, 2, "dhaka"],
  ["rampura", "Rampura", "রামপুরা", 23.76, 90.422, 2, "dhaka"],
  ["khilgaon", "Khilgaon", "খিলগাঁও", 23.748, 90.428, 2, "dhaka"],
  ["motijheel", "Motijheel", "মতিঝিল", 23.732, 90.418, 3, "dhaka"],
  ["paltan", "Paltan", "পল্টন", 23.735, 90.413, 2, "dhaka"],
  ["tejgaon", "Tejgaon", "তেজগাঁও", 23.758, 90.393, 2, "dhaka"],
  ["uttara-east", "Uttara East", "উত্তরা পূর্ব", 23.876, 90.405, 2, "dhaka"],
  ["uttara-west", "Uttara West", "উত্তরা পশ্চিম", 23.865, 90.388, 2, "dhaka"],
  ["jatrabari", "Jatrabari", "যাত্রাবাড়ী", 23.71, 90.435, 2, "dhaka"],
  ["lalbagh", "Lalbagh", "লালবাগ", 23.719, 90.389, 2, "dhaka"],
  ["kotwali-dhaka", "Kotwali Dhaka", "ঢাকা কোতোয়ালি", 23.709, 90.406, 2, "dhaka"],
  ["savar", "Savar", "সাভার", 23.853, 90.261, 2, "dhaka"],
  ["narayanganj-sadar", "Narayanganj Sadar", "নারায়ণগঞ্জ সদর", 23.628, 90.502, 2, "dhaka"],
  ["tongi", "Tongi", "টঙ্গী", 23.892, 90.405, 2, "dhaka"],
  // The other seven divisions
  ["chattogram-kotwali", "Chattogram Kotwali", "চট্টগ্রাম কোতোয়ালি", 22.338, 91.833, 2, "chattogram"],
  ["panchlaish", "Panchlaish", "পাঁচলাইশ", 22.36, 91.817, 2, "chattogram"],
  ["cumilla-kotwali", "Cumilla Kotwali", "কুমিল্লা কোতোয়ালি", 23.462, 91.179, 1, "chattogram"],
  ["coxsbazar-sadar", "Cox's Bazar Sadar", "কক্সবাজার সদর", 21.451, 91.977, 2, "chattogram"],
  ["khulna-sadar", "Khulna Sadar", "খুলনা সদর", 22.814, 89.562, 2, "khulna"],
  ["jashore-kotwali", "Jashore Kotwali", "যশোর কোতোয়ালি", 23.167, 89.211, 1, "khulna"],
  ["boalia", "Boalia", "বোয়ালিয়া", 24.372, 88.596, 2, "rajshahi"],
  ["bogura-sadar", "Bogura Sadar", "বগুড়া সদর", 24.849, 89.368, 1, "rajshahi"],
  ["sylhet-kotwali", "Sylhet Kotwali", "সিলেট কোতোয়ালি", 24.896, 91.87, 2, "sylhet"],
  ["barishal-kotwali", "Barishal Kotwali", "বরিশাল কোতোয়ালি", 22.704, 90.368, 1, "barishal"],
  ["rangpur-kotwali", "Rangpur Kotwali", "রংপুর কোতোয়ালি", 25.746, 89.253, 1, "rangpur"],
  ["mymensingh-kotwali", "Mymensingh Kotwali", "ময়মনসিংহ কোতোয়ালি", 24.753, 90.404, 2, "mymensingh"],
  ["nakla", "Nakla", "নকলা", 25.065, 90.138, 1, "mymensingh"],
  // District towns and outer areas that would otherwise sit far from any thana
  ["dinajpur-kotwali", "Dinajpur Kotwali", "দিনাজপুর কোতোয়ালি", 25.624, 88.635, 2, "rangpur"],
  ["sunamganj-sadar", "Sunamganj Sadar", "সুনামগঞ্জ সদর", 25.07, 91.4, 1, "sylhet"],
  ["patuakhali-sadar", "Patuakhali Sadar", "পটুয়াখালী সদর", 22.359, 90.33, 1, "barishal"],
  ["sharsha", "Sharsha", "শার্শা", 23.044, 88.9, 1, "khulna"],
  ["jamalpur-sadar", "Jamalpur Sadar", "জামালপুর সদর", 24.937, 89.94, 1, "mymensingh"],
  ["sherpur-sadar", "Sherpur Sadar", "শেরপুর সদর", 25.021, 90.017, 2, "mymensingh"],
  ["gazipur-sadar", "Gazipur Sadar", "গাজীপুর সদর", 23.999, 90.422, 2, "dhaka"],
  ["siddhirganj", "Siddhirganj", "সিদ্ধিরগঞ্জ", 23.695, 90.501, 1, "dhaka"],
  ["halishahar", "Halishahar", "হালিশহর", 22.331, 91.783, 1, "chattogram"],
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

export const STATIONS: readonly Unit[] = ROWS.map(([slug, name, nameBn, lat, lng, , division]) => ({
  id: `st-${slug}`,
  kind: "station",
  dept: "police",
  name: `${name} Police Station`,
  nameBn: `${nameBn} থানা`,
  homeId: `st-${slug}`,
  status: "available",
  lat,
  lng,
  division,
}));

export const PATROLS: readonly Unit[] = ROWS.flatMap(([slug, name, nameBn, lat, lng, count, division]) =>
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
      division,
    }),
  ),
);

/** The division of every station and patrol, by unit id. */
export const STATION_DIVISION: ReadonlyMap<string, DivisionId> = new Map([...STATIONS, ...PATROLS].map((u) => [u.id, u.division as DivisionId]));

/** A station's (or patrol's) division; undefined for an unknown id. */
export const stationDivision = (id: string): DivisionId | undefined => STATION_DIVISION.get(id);
