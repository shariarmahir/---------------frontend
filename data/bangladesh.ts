/**
 * The chapter pages, in English: Bangladesh's history chapter
 * (/bangladesh/history) and the four civic chapters under নাগরিক দায়িত্ব
 * (/nagorik/crisis, shield, problems, solutions). Every photograph is a
 * Wikimedia Commons file shown with its credit. The history chapter's own
 * data is in data/bangladesh-history.ts; the MOTHERLAND landing page's is
 * in data/motherland.ts.
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

/** A credited Commons or rural photo, with its alt text in English (and a crop focus where the subject is off-centre). */
function en(photo: Photo | undefined, alt: string, focus?: string): Photo {
  if (!photo?.credit) throw new Error(`Bangladesh: uncredited photo for "${alt}"`);
  return { ...photo, alt, ...(focus && { focus }) };
}

const rural = (id: string) => ruralStories.find((s) => s.id === id)?.photo;

/* ── Chapters ────────────────────────────────────────────────────────── */

export type ChapterId = "history" | "crisis" | "shield" | "problems" | "solutions";

export interface Chapter {
  id: ChapterId;
  /** Shown in the chapter hero; only the civic series is numbered. */
  number?: number;
  href: string;
  /** The page the chapter belongs to: its pager walks the chapters that share it. */
  home: { href: string; title: string };
  title: string;
  /** One line under the title, in the chapter hero. */
  lede: string;
  photo: Photo;
}

const MOTHERLAND = { href: "/bangladesh", title: "Bangladesh" };
const NAGORIK = { href: "/nagorik", title: "Citizen rights and duties" };

/** Every chapter in reading order: the heroes and pagers read from here. */
export const CHAPTERS: Chapter[] = [
  {
    id: "history",
    href: "/bangladesh/history",
    home: MOTHERLAND,
    title: "The country we love",
    lede: "A thousand years of history, a land of rivers, a language defended with blood and a nation won in 1971.",
    photo: en(commonsPhotos.smritisoudho, "The National Martyrs' Memorial at Savar, ringed by green lawns"),
  },
  {
    id: "crisis",
    number: 1,
    href: "/nagorik/crisis",
    home: NAGORIK,
    title: "What threatens it",
    lede: "The pressures hitting households now, what they will cost if left alone, and why the same problems keep coming back.",
    photo: en(ruralBackdrops.floodBoat, "Villagers travel by boat through a flooded village"),
  },
  {
    id: "shield",
    number: 2,
    href: "/nagorik/shield",
    home: NAGORIK,
    title: "Your part",
    lede: "The citizen shield, from yourself to your neighbourhood to the country, and the rights and duties that hold it up.",
    photo: en(rural("cyclone-shelter"), "Villagers meeting inside a cyclone shelter on the southern coast"),
  },
  {
    id: "problems",
    number: 3,
    href: "/nagorik/problems",
    home: NAGORIK,
    title: "32 problems, pixel by pixel",
    lede: "Where the system breaks first, the lives behind the numbers, and every problem with its evidence and its path.",
    photo: en(ruralBackdrops.erosionWalk, "People walk along a riverbank cut sheer by erosion", "50% 35%"),
  },
  {
    id: "solutions",
    number: 4,
    href: "/nagorik/solutions",
    home: NAGORIK,
    title: "What solving looks like",
    lede: "What we already have, what we must let go, who does what, and a roadmap that is realistic and brave.",
    photo: en(ruralBackdrops.farmerCattle, "A farmer walks his cattle along a path through harvested paddy fields"),
  },
];

export const chapterById = (id: ChapterId): Chapter => CHAPTERS.find((c) => c.id === id)!;
