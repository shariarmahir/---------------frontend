/**
 * The regions a visitor can plan a trip to, with approximate daily costs,
 * transport from Dhaka and the sights worth the journey. Every number here is
 * an illustrative mid-range estimate in US dollars or taka, meant to give a
 * feel for cost and time, not a quote. Prices and schedules change; the
 * planner that reads this says so plainly.
 */

export type Season = "winter" | "spring" | "summer" | "monsoon" | "autumn";

export interface Transport {
  mode: "Bus" | "Train" | "Launch" | "Air";
  /** Approximate one-way fare per person, in taka. */
  fare: number;
  /** Approximate hours door to door. */
  hours: number;
  note?: string;
}

export interface Region {
  id: string;
  name: string;
  /** What the region is, in one line. */
  blurb: string;
  /** Approximate mid-range cost per person per day, in US dollars: a simple room, food and local travel. */
  dailyUsd: number;
  transport: Transport[];
  attractions: string[];
  bestSeasons: Season[];
  photo: string;
}

export const SEASON_LABELS: Record<Season, string> = {
  winter: "Winter (Dec–Feb)",
  spring: "Spring (Feb–Apr)",
  summer: "Summer (Apr–Jun)",
  monsoon: "Monsoon (Jun–Aug)",
  autumn: "Autumn (Aug–Nov)",
};

export const REGIONS: Region[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    blurb: "The capital: the Mughal old city, the Buriganga river, museums and markets.",
    dailyUsd: 40,
    transport: [{ mode: "Air", fare: 0, hours: 0, note: "Most visitors arrive here" }],
    attractions: ["Lalbagh Fort", "Ahsan Manzil", "Old Dhaka & the Buriganga", "Liberation War Museum", "Jatiyo Sangsad"],
    bestSeasons: ["winter", "spring"],
    photo: "lalbagh-fort",
  },
  {
    id: "coxs-bazar",
    name: "Cox's Bazar",
    blurb: "The world's longest natural sea beach, about 120 km of unbroken sand.",
    dailyUsd: 45,
    transport: [
      { mode: "Air", fare: 5500, hours: 1, note: "Dhaka to Cox's Bazar" },
      { mode: "Bus", fare: 1400, hours: 10, note: "Overnight AC coach" },
    ],
    attractions: ["Cox's Bazar beach", "Himchari", "Inani beach", "Sea food"],
    bestSeasons: ["winter", "spring"],
    photo: "coxs-bazar",
  },
  {
    id: "sylhet",
    name: "Sylhet",
    blurb: "Tea gardens, the flooded forest of Ratargul and the stone-strewn Jaflong.",
    dailyUsd: 38,
    transport: [
      { mode: "Train", fare: 600, hours: 6, note: "Dhaka to Sylhet, intercity" },
      { mode: "Bus", fare: 700, hours: 6 },
      { mode: "Air", fare: 4500, hours: 1 },
    ],
    attractions: ["Srimangal tea gardens", "Ratargul swamp forest", "Jaflong", "Bichanakandi"],
    bestSeasons: ["autumn", "winter", "monsoon"],
    photo: "srimangal-tea",
  },
  {
    id: "bandarban",
    name: "Bandarban & the Hill Tracts",
    blurb: "The highest hills in the country, clouds below the ridges and tribal villages.",
    dailyUsd: 35,
    transport: [{ mode: "Bus", fare: 900, hours: 9, note: "Dhaka to Bandarban" }],
    attractions: ["Nilgiri", "Nafakhum waterfall", "Boga Lake", "Sajek valley (via Khagrachhari)"],
    bestSeasons: ["autumn", "winter"],
    photo: "bandarban",
  },
  {
    id: "sundarbans",
    name: "The Sundarbans",
    blurb: "The largest mangrove forest on Earth, reached by boat from Khulna or Mongla.",
    dailyUsd: 70,
    transport: [
      { mode: "Bus", fare: 800, hours: 7, note: "Dhaka to Khulna, then a boat tour" },
      { mode: "Launch", fare: 1200, hours: 12, note: "River launch, part of the journey" },
    ],
    attractions: ["Mangrove boat safari", "Royal Bengal tiger country", "Karamjal", "Kotka"],
    bestSeasons: ["winter"],
    photo: "mangroves",
  },
  {
    id: "kuakata",
    name: "Kuakata",
    blurb: "The 'daughter of the sea', where you can watch both sunrise and sunset over the water.",
    dailyUsd: 35,
    transport: [
      { mode: "Launch", fare: 1000, hours: 12, note: "Overnight launch down the rivers" },
      { mode: "Bus", fare: 1100, hours: 9 },
    ],
    attractions: ["Kuakata beach", "Sunrise and sunset", "Fatra forest", "Rakhine villages"],
    bestSeasons: ["winter", "autumn"],
    photo: "kuakata",
  },
  {
    id: "rajshahi",
    name: "Rajshahi & the north-west",
    blurb: "Silk, mangoes and the ancient ruins of Paharpur and Mahasthangarh.",
    dailyUsd: 32,
    transport: [
      { mode: "Train", fare: 700, hours: 6, note: "Dhaka to Rajshahi" },
      { mode: "Bus", fare: 800, hours: 6 },
    ],
    attractions: ["Paharpur (Somapura)", "Mahasthangarh", "Puthia temples", "Mango orchards (summer)"],
    bestSeasons: ["winter", "spring", "summer"],
    photo: "terracotta",
  },
];

export const TRIP_SOURCE = "Illustrative mid-range estimates compiled for this guide. Confirm fares and prices before you travel.";
