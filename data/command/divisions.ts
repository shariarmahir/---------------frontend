/**
 * Bangladesh's eight administrative divisions, for the dashboard's division
 * scope (?div=) and for framing the map. `centre` is the divisional
 * headquarters city; `bounds` is an approximate box ([south, west], [north,
 * east]) around all of the division's districts, two decimals: good for
 * framing a map, not a boundary. Boxes of neighbours overlap; never use them
 * to decide which division a point is in (a place carries its division).
 */
import type { DivisionId, LatLng } from "../../lib/command/types.ts";

/** [[south, west], [north, east]] in degrees, the shape Leaflet's fitBounds takes. */
export type Bounds = [[number, number], [number, number]];

export interface Division {
  id: DivisionId;
  name: string;
  nameBn: string;
  /** The divisional headquarters city. */
  centre: LatLng;
  bounds: Bounds;
  /** The districts the box covers, for reference. */
  districts: readonly string[];
}

type Row = [id: DivisionId, name: string, nameBn: string, lat: number, lng: number, bounds: Bounds, districts: string[]];

const ROWS: Row[] = [
  [
    "dhaka", "Dhaka", "ঢাকা", 23.8103, 90.4125, [[22.85, 89.25], [24.8, 91.3]],
    ["Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Manikganj", "Munshiganj", "Tangail", "Kishoreganj", "Faridpur", "Rajbari", "Gopalganj", "Madaripur", "Shariatpur"],
  ],
  [
    // Teknaf and St Martin's Island in the south, Brahmanbaria in the north, the Hill Tracts in the east.
    "chattogram", "Chattogram", "চট্টগ্রাম", 22.3569, 91.7832, [[20.55, 90.55], [24.3, 92.7]],
    ["Chattogram", "Cox's Bazar", "Rangamati", "Bandarban", "Khagrachhari", "Feni", "Noakhali", "Lakshmipur", "Cumilla", "Chandpur", "Brahmanbaria"],
  ],
  [
    // The Sundarbans in the south, Kushtia on the Padma in the north.
    "khulna", "Khulna", "খুলনা", 22.8456, 89.5403, [[21.6, 88.55], [24.2, 90.0]],
    ["Khulna", "Bagerhat", "Satkhira", "Jashore", "Narail", "Magura", "Jhenaidah", "Chuadanga", "Meherpur", "Kushtia"],
  ],
  [
    "rajshahi", "Rajshahi", "রাজশাহী", 24.3745, 88.6042, [[23.8, 88.0], [25.3, 89.85]],
    ["Rajshahi", "Chapai Nawabganj", "Naogaon", "Natore", "Pabna", "Sirajganj", "Bogura", "Joypurhat"],
  ],
  [
    "sylhet", "Sylhet", "সিলেট", 24.8949, 91.8687, [[23.95, 90.95], [25.2, 92.5]],
    ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  ],
  [
    // Kuakata and the southern chars to Bhola's eastern shore.
    "barishal", "Barishal", "বরিশাল", 22.701, 90.3535, [[21.7, 89.85], [23.05, 91.05]],
    ["Barishal", "Bhola", "Patuakhali", "Barguna", "Pirojpur", "Jhalokathi"],
  ],
  [
    // Up to Tetulia, Panchagarh, the country's northern tip.
    "rangpur", "Rangpur", "রংপুর", 25.7439, 89.2752, [[24.95, 88.0], [26.65, 89.9]],
    ["Rangpur", "Dinajpur", "Thakurgaon", "Panchagarh", "Nilphamari", "Lalmonirhat", "Kurigram", "Gaibandha"],
  ],
  [
    "mymensingh", "Mymensingh", "ময়মনসিংহ", 24.7471, 90.4203, [[24.25, 89.6], [25.3, 91.15]],
    ["Mymensingh", "Jamalpur", "Sherpur", "Netrokona"],
  ],
];

/** In the government's usual order. */
export const DIVISIONS: readonly Division[] = ROWS.map(([id, name, nameBn, lat, lng, bounds, districts]) => ({
  id,
  name,
  nameBn,
  centre: { lat, lng },
  bounds,
  districts,
}));

export const DIVISION_IDS: readonly DivisionId[] = DIVISIONS.map((d) => d.id);

export const DIVISION_BY_ID: Readonly<Record<DivisionId, Division>> = Object.fromEntries(DIVISIONS.map((d) => [d.id, d])) as Record<DivisionId, Division>;

/** The whole country, Teknaf to Tetulia, with every division's box inside it. */
export const BANGLADESH_BOUNDS: Bounds = [
  [20.55, 88.0],
  [26.65, 92.7],
];

const IDS = new Set<string>(DIVISION_IDS);

export const isDivisionId = (x: unknown): x is DivisionId => typeof x === "string" && IDS.has(x);

/** "Dhaka", or "ঢাকা" with `"bn"`. */
export const divisionName = (id: DivisionId, lang: "en" | "bn" = "en"): string => (lang === "bn" ? DIVISION_BY_ID[id].nameBn : DIVISION_BY_ID[id].name);
