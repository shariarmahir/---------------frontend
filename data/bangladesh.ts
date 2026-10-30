/**
 * Bangladesh — the national landing page (/bangladesh) and the frame its
 * five chapters share, in English: the hero, the chapter list and the
 * "at a glance" facts. Every fact names its source; every photograph is a
 * Wikimedia Commons file shown with its credit. The history chapter's own
 * data is in data/bangladesh-history.ts.
 */

import { commonsPhotos } from "./bangladesh-photos";
import { ruralBackdrops, ruralStories } from "./rural-life";

export interface Credit {
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
}

export interface Photo {
  src: string;
  alt: string;
  credit?: Credit;
  /** CSS object-position, for photos whose subject is off-centre. */
  focus?: string;
}

export interface Film {
  title: string;
  titleBn: string;
  brief: string;
  poster: Photo;
  /** Only set when real footage exists. */
  src?: string;
  duration?: string;
}

/** A credited Commons or rural photo, with its alt text in English (and a crop focus where the subject is off-centre). */
function en(photo: Photo | undefined, alt: string, focus?: string): Photo {
  if (!photo?.credit) throw new Error(`Bangladesh: uncredited photo for "${alt}"`);
  return { ...photo, alt, ...(focus && { focus }) };
}

const rural = (id: string) => ruralStories.find((s) => s.id === id)?.photo;

/* ── Hero ────────────────────────────────────────────────────────────── */

export interface Cta {
  label: string;
  href: string;
}

export const HERO: { title: string; thesis: string; primary: Cta; secondary: Cta; slides: Photo[] } = {
  title: "Bangladesh",
  thesis: "Every unsolved problem is one bad pixel. We fix the map one sector at a time.",
  primary: { label: "See the National Index", href: "#national-index" },
  secondary: { label: "The 32 problems", href: "#problems" },
  slides: [
    en(commonsPhotos.river, "A sailing boat on the Padma river"),
    en(rural("paddy-bales"), "Farmers carry paddy bales home along the ridge of a harvested field"),
    en(commonsPhotos.padmabridge, "The Padma Bridge stretching across the river"),
    en(rural("teesta-fisher"), "A fisher readies his net from a small boat on the Teesta in Rangpur"),
    en(commonsPhotos.village, "A path winding through green paddy fields towards a village"),
  ],
};

/* ── Chapters ────────────────────────────────────────────────────────── */

export type ChapterId = "history" | "crisis" | "shield" | "problems" | "solutions";

export interface Chapter {
  id: ChapterId;
  number: number;
  href: string;
  title: string;
  /** One line under the title, in the chapter hero and on the landing page. */
  lede: string;
  photo: Photo;
}

/** The five chapters in reading order: the chapter bar, heroes and pager read from here. */
export const CHAPTERS: Chapter[] = [
  {
    id: "history",
    number: 1,
    href: "/bangladesh/history",
    title: "The country we love",
    lede: "A thousand years of history, a land of rivers, a language defended with blood and a nation won in 1971.",
    photo: en(commonsPhotos.smritisoudho, "The National Martyrs' Memorial at Savar, ringed by green lawns"),
  },
  {
    id: "crisis",
    number: 2,
    href: "/bangladesh/crisis",
    title: "What threatens it",
    lede: "The pressures hitting households now, what they will cost if left alone, and why the same problems keep coming back.",
    photo: en(ruralBackdrops.floodBoat, "Villagers travel by boat through a flooded village"),
  },
  {
    id: "shield",
    number: 3,
    href: "/bangladesh/shield",
    title: "Your part",
    lede: "The citizen shield, from yourself to your neighbourhood to the country, and the rights and duties that hold it up.",
    photo: en(rural("cyclone-shelter"), "Villagers meeting inside a cyclone shelter on the southern coast"),
  },
  {
    id: "problems",
    number: 4,
    href: "/bangladesh/problems",
    title: "32 problems, pixel by pixel",
    lede: "Where the system breaks first, the lives behind the numbers, and every problem with its evidence and its path.",
    photo: en(ruralBackdrops.erosionWalk, "People walk along a riverbank cut sheer by erosion", "50% 35%"),
  },
  {
    id: "solutions",
    number: 5,
    href: "/bangladesh/solutions",
    title: "What solving looks like",
    lede: "What we already have, what we must let go, who does what, and a roadmap that is realistic and brave.",
    photo: en(ruralBackdrops.farmerCattle, "A farmer walks his cattle along a path through harvested paddy fields"),
  },
];

export const chapterById = (id: ChapterId): Chapter => CHAPTERS.find((c) => c.id === id)!;

/* ── At a glance ─────────────────────────────────────────────────────── */

export interface Fact {
  value: string;
  label: string;
  detail: string;
  source: string;
  sourceUrl: string;
}

const PORTAL = { source: "Bangladesh National Portal", sourceUrl: "https://bangladesh.gov.bd/" };

export const AT_A_GLANCE: Fact[] = [
  {
    value: "8",
    label: "Divisions",
    detail: "Barishal, Chattogram, Dhaka, Khulna, Mymensingh, Rajshahi, Rangpur and Sylhet.",
    ...PORTAL,
  },
  { value: "64", label: "Districts", detail: "Each district is divided into upazilas, and each upazila into unions.", ...PORTAL },
  {
    value: "147,570 km²",
    label: "Area",
    detail: "A delta of rivers and floodplains that opens onto the Bay of Bengal.",
    source: "Bangladesh Bureau of Statistics",
    sourceUrl: "https://bbs.gov.bd/",
  },
  {
    value: "1952",
    label: "Language Movement",
    detail: "On 21 February 1952 students in Dhaka were killed demanding Bangla as a state language. The world keeps the day as International Mother Language Day.",
    source: "UNESCO",
    sourceUrl: "https://www.unesco.org/en/days/mother-language",
  },
  { value: "1971", label: "Independence", detail: "Declared on 26 March 1971; victory on 16 December 1971.", ...PORTAL },
  {
    value: "169.8 million",
    label: "Population",
    detail: "The adjusted count of the Population and Housing Census 2022.",
    source: "Bangladesh Bureau of Statistics, Census 2022",
    sourceUrl: "https://bbs.gov.bd/",
  },
];
