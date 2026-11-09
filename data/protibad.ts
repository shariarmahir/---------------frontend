/**
 * Recorded crime in Bangladesh: case counts from Police Headquarters, as
 * published by the press (Mahir, 2026-10-29: the প্রতিবাদ page runs on real
 * figures). Bangladesh Police's own statistics pages carry no usable table
 * for 2023 or 2024, so every figure here is taken from a named report that
 * quotes Police Headquarters, and each series names its report.
 *
 * These are CASES FILED, not crimes committed: a rise can mean more people
 * reported, and a fall can mean fewer dared to. The page says so beside the
 * chart.
 */

export interface StatSource {
  name: string;
  url: string;
  /** What the report is, as the credit line shows it. */
  note: string;
}

export const SOURCES = {
  pressWing: {
    name: "Prothom Alo, 17 July 2025",
    url: "https://en.prothomalo.com/bangladesh/crime-and-law/cxxk11rytg",
    note: "Police Headquarters figures released by the Chief Adviser's Press Wing",
  },
  tribune: {
    name: "Dhaka Tribune, 25 May 2026",
    url: "https://www.dhakatribune.com/bangladesh/crime/411135/violent-crime-surge-tests-govt-in-first-100-days",
    note: "Police data on 2023–2025 murder cases and January–April 2026",
  },
} satisfies Record<string, StatSource>;

export const YEARS = [2020, 2021, 2022, 2023, 2024] as const;

export interface CrimeSeries {
  id: string;
  label: string;
  labelBn: string;
  icon: string;
  /** Cases filed per year, 2020–2024 (YEARS); null where the report gives no figure. */
  years: (number | null)[];
  /** Cases filed January–June 2025. */
  h1_2025: number | null;
  /** Cases filed January–April 2026. */
  jan_apr_2026: number | null;
  source: StatSource;
  /** Anything a reader should know before trusting the line. */
  caveat?: string;
}

export const crimeSeries: CrimeSeries[] = [
  {
    id: "murder",
    label: "Murder",
    labelBn: "হত্যা",
    icon: "skull",
    years: [3539, 3214, 3126, 3023, 4114],
    h1_2025: 1933,
    jan_apr_2026: 1142,
    source: SOURCES.pressWing,
    caveat: "Dhaka Tribune, citing police data, puts 2024 at 3,442 and 2025 at 3,786 murder cases.",
  },
  {
    id: "rape",
    label: "Rape",
    labelBn: "ধর্ষণ",
    icon: "front_hand",
    years: [6555, 6341, 6032, 5191, 4394],
    h1_2025: null,
    jan_apr_2026: null,
    source: SOURCES.pressWing,
  },
  {
    id: "dacoity",
    label: "Dacoity",
    labelBn: "ডাকাতি",
    icon: "group_off",
    years: [978, 971, 1128, 1227, 1405],
    h1_2025: 972,
    jan_apr_2026: null,
    source: SOURCES.pressWing,
  },
  {
    id: "robbery",
    label: "Robbery",
    labelBn: "দস্যুতা ও ছিনতাই",
    icon: "wallet",
    years: [302, 308, 406, 319, 490],
    h1_2025: 367,
    jan_apr_2026: 184,
    source: SOURCES.pressWing,
  },
  {
    id: "abduction",
    label: "Abduction",
    labelBn: "অপহরণ",
    icon: "person_search",
    years: [486, 445, 460, 463, 642],
    h1_2025: 517,
    jan_apr_2026: 347,
    source: SOURCES.pressWing,
  },
  {
    id: "police-attacked",
    label: "Attacks on police",
    labelBn: "পুলিশের ওপর হামলা",
    icon: "local_police",
    years: [449, 608, 601, 607, 642],
    h1_2025: 329,
    jan_apr_2026: 213,
    source: SOURCES.pressWing,
  },
  {
    id: "women",
    label: "Violence against women",
    labelBn: "নারী নির্যাতন",
    icon: "woman",
    years: [13431, null, null, null, 10198],
    h1_2025: 6144,
    jan_apr_2026: null,
    source: SOURCES.pressWing,
    caveat: "The report gives no figures for 2021–2023. January–April 2026 (5,958) counts violence against women and children together.",
  },
];

/** Murder cases by month, January–June 2025 (Police Headquarters, via the Press Wing). */
export const murderByMonth2025 = [
  { month: "Jan", monthBn: "জানু", cases: 294 },
  { month: "Feb", monthBn: "ফেব্রু", cases: 300 },
  { month: "Mar", monthBn: "মার্চ", cases: 316 },
  { month: "Apr", monthBn: "এপ্রি", cases: 338 },
  { month: "May", monthBn: "মে", cases: 341 },
  { month: "Jun", monthBn: "জুন", cases: 344 },
];

/** January–April 2026, from the Dhaka Tribune report (police data). */
export const early2026 = [
  { id: "murder", label: "Murder", labelBn: "হত্যা", cases: 1142 },
  { id: "women-children", label: "Violence against women and children", labelBn: "নারী ও শিশু নির্যাতন", cases: 5958 },
  { id: "theft", label: "Theft", labelBn: "চুরি", cases: 4099 },
  { id: "abduction", label: "Abduction", labelBn: "অপহরণ", cases: 347 },
  { id: "police-attacked", label: "Attacks on police", labelBn: "পুলিশের ওপর হামলা", cases: 213 },
  { id: "robbery", label: "Robbery", labelBn: "দস্যুতা ও ছিনতাই", cases: 184 },
];

/** Change from one count to the next, in percent (rounded), or null when either is missing. */
export function change(from: number | null, to: number | null): number | null {
  if (from === null || to === null || from === 0) return null;
  return Math.round(((to - from) / from) * 100);
}

/** A year's cases as a monthly average, so a part-year compares with a whole one. */
export const perMonth = (cases: number, months: number) => Math.round(cases / months);
