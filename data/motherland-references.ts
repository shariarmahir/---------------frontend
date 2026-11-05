/**
 * Every source, photograph and film behind MOTHERLAND, page by page and section
 * by section. Cards and sections show no sources (Mahir, 2026-11-05): they live
 * here, on the References page the footer opens, and scripts/motherland-references.mts
 * writes the same list to reference.md.
 */
import { BIOGRAPHIES, CULTURE, HERO, HISTORY, JOIN, NATURE, RESOURCES, SCIENCE, TAKA, TRAVEL, VIDEOS, type Credit } from "./motherland.ts";
import { blockCredits, blockSources, type Block, type Src } from "./motherland-blocks.ts";
import { CATEGORIES, categoryCredits, type Category } from "./motherland-categories.ts";
import { DEEP, MORE_FILMS, deepSources } from "./motherland-deep.ts";
import { ESSENTIALS } from "./motherland-essentials.ts";
import { BEST, FACT_TOPICS, FACTS_HERO, FACTS_NAME, GLANCE, GOVERNMENT, NOT_BEST, PEACE, RESEARCH, SCHOOLS, BOTH_TRUE } from "./motherland-facts.ts";
import { CALENDAR_SOURCE, INVEST_LINKS, LAUNCH_SOURCE } from "./motherland-live.ts";
import { BANKS, MOBILE_MONEY } from "./motherland-money.ts";
import { PAGE_BLOCKS } from "./motherland-pages.ts";
import { TRIP_SOURCES } from "./motherland-trip.ts";
import { SOURCES as TRAVEL_SOURCES, travelCredits } from "./motherland-travel.ts";

export interface RefCredit {
  label: string;
  credit: Credit;
}

export interface RefSection {
  title: string;
  sources: Src[];
  /** Notes and figures' workings that the cards no longer carry. */
  notes: string[];
  credits: RefCredit[];
}

export interface RefPage {
  id: string;
  name: string;
  href: string;
  sections: RefSection[];
}

const once = <T>(list: T[], key: (item: T) => string) => [...new Map(list.map((x) => [key(x), x])).values()];

function section(title: string, sources: Src[] = [], credits: RefCredit[] = [], notes: string[] = []): RefSection {
  return { title, sources: once(sources, (s) => s.url), credits: once(credits, (c) => c.credit.sourceUrl), notes };
}

const pictured = (items: { title?: string; name?: string; picture: { credit: Credit } }[]): RefCredit[] => items.map((i) => ({ label: i.title ?? i.name ?? "", credit: i.picture.credit }));
const filmed = (films: { title: string; credit: Credit }[]): RefCredit[] => films.map((f) => ({ label: f.title, credit: f.credit }));

/** The notes and source columns a block keeps off the page. */
function blockNotes(b: Block): string[] {
  const out: string[] = [];
  if ((b.kind === "cards" || b.kind === "table" || b.kind === "lines" || b.kind === "map") && b.note) out.push(b.note);
  if (b.kind === "table" && b.hideLastColumn) for (const r of b.rows) out.push(`${r[0]}: ${r[1]}. ${r[r.length - 1]}`);
  return out;
}

const WALLETS = section("Who moves the money", [...MOBILE_MONEY, ...BANKS].map((b) => ({ name: b.name, url: b.url })), [], ["Logos are trademarks of their owners, shown only to identify each service."]);

/** One block as one section, or the part of the page it draws. */
function blockSection(c: Category, b: Block): RefSection | null {
  if (b.kind === "part") {
    if (b.part === "figures") return section(DEEP[c.slug]?.figuresTitle ?? "Figures", deepSources(c.slug));
    if (b.part === "stack" || b.part === "rails") return section(`${c.name}: stories`, [], categoryCredits(c));
    if (b.part === "videos") return section("Films", [], filmed([...VIDEOS.films, ...MORE_FILMS]));
    return null;
  }
  if (b.kind === "tool") {
    if (b.tool === "calendar") return section("The year in Bangladesh", [CALENDAR_SOURCE], blockCredits([b]));
    if (b.tool === "launch") return section("Our flag in orbit", [LAUNCH_SOURCE]);
    if (b.tool === "money-brands") return WALLETS;
    if (b.tool === "connect") return section("Official bodies for investors", INVEST_LINKS);
    return null;
  }
  const title = "title" in b && b.title ? b.title : "";
  const made = section(title, blockSources([b]), blockCredits([b]), blockNotes(b));
  return title && (made.sources.length || made.credits.length || made.notes.length) ? made : null;
}

/** Two blocks drawing the same part share one section. */
function merged(list: RefSection[]): RefSection[] {
  const byTitle = new Map<string, RefSection>();
  for (const s of list) {
    const had = byTitle.get(s.title);
    byTitle.set(s.title, had ? section(s.title, [...had.sources, ...s.sources], [...had.credits, ...s.credits], [...had.notes, ...s.notes]) : s);
  }
  return [...byTitle.values()];
}

function categoryPage(c: Category): RefPage {
  const film = DEEP[c.slug]?.film;
  const sections = merged((PAGE_BLOCKS[c.slug] ?? []).flatMap((b) => blockSection(c, b) ?? []));
  const known = sections.flatMap((s) => s.credits.map((r) => r.credit.sourceUrl));
  const rest = categoryCredits(c).filter((r) => !known.includes(r.credit.sourceUrl));
  const opening = section("The hero", [], film ? filmed([film]) : []);
  /* A page drawn without the part above still credits its stories, and its figures. */
  const figures = deepSources(c.slug);
  const hasFigures = sections.some((s) => s.title === DEEP[c.slug]?.figuresTitle);
  return {
    id: c.slug,
    name: c.name,
    href: `/bangladesh/${c.slug}`,
    sections: [
      ...(opening.credits.length ? [opening] : []),
      ...(figures.length && !hasFigures ? [section(DEEP[c.slug]?.figuresTitle ?? "Figures", figures)] : []),
      ...sections,
      ...(rest.length ? [section("Other photographs", [], rest)] : []),
    ],
  };
}

const LANDING: RefPage = {
  id: "home",
  name: "Home page",
  href: "/bangladesh",
  sections: [
    section("The lettering", [{ name: "Lipighor Font Foundry", url: "https://lipighor.com" }, { name: "Alfa Slab One", url: "https://fonts.google.com/specimen/Alfa+Slab+One" }], [], [
      "আমার সোনার বাংলা is drawn with Li Sirajee Sylheti 3D, designed by Md. Sirajul Islam and developed by Niladri Shekhar Bala, © Lipighor Font Foundry.",
      "The logo is drawn from Alfa Slab One by JM Solé, under the SIL Open Font License.",
    ]),
    section("The opening film", [], [
      { label: HERO.film.title, credit: HERO.film.credit },
      {
        label: "The sunrise at Lama, Bandarban, in the opening film",
        credit: { author: "iamyasar", source: "Pixabay", sourceUrl: "https://pixabay.com/videos/bangladesh-lama-bandarban-mountains-294187/", license: "Pixabay Content License", licenseUrl: "https://pixabay.com/service/license-summary/" },
      },
    ]),
    section(HISTORY.title, [], pictured(HISTORY.cards)),
    section(SCIENCE.title, [], pictured(SCIENCE.articles)),
    section(BIOGRAPHIES.title, [], pictured(BIOGRAPHIES.lives)),
    section(NATURE.title, [], pictured(NATURE.wild)),
    section(TRAVEL.title, [], pictured(TRAVEL.places)),
    section(CULTURE.title, [], pictured(CULTURE.crafts)),
    section(TAKA.title, [], pictured(TAKA.facts)),
    section(VIDEOS.title, [], filmed(VIDEOS.films)),
    section(RESOURCES.title, RESOURCES.items.map((r) => r.source), [{ label: RESOURCES.title, credit: RESOURCES.picture.credit }]),
    section(ESSENTIALS.title, [], pictured(ESSENTIALS.cards)),
    section(JOIN.title, [], [{ label: JOIN.title, credit: JOIN.picture.credit }]),
  ],
};

const FACTS: RefPage = {
  id: "facts",
  name: FACTS_NAME,
  href: "/bangladesh/facts",
  sections: [
    section("The hero", [], [{ label: FACTS_NAME, credit: FACTS_HERO.credit }]),
    section("At a glance", [GLANCE.source]),
    section(BEST.title, BEST.items.map((f) => f.source), pictured(BEST.items)),
    section(NOT_BEST.title, NOT_BEST.items.map((f) => f.source), pictured(NOT_BEST.items)),
    section("Both lists are true", [], [{ label: "Both lists are true", credit: BOTH_TRUE.credit }]),
    section(GOVERNMENT.title, [], pictured(GOVERNMENT.cards)),
    section(SCHOOLS.title, [], [{ label: SCHOOLS.title, credit: SCHOOLS.picture.credit }]),
    section(PEACE.title, [], [{ label: PEACE.title, credit: PEACE.picture.credit }]),
    section(RESEARCH.title, [], pictured(RESEARCH.cards)),
    section("All topics at a glance", [], pictured(FACT_TOPICS)),
  ],
};

const TRAVEL_PAGE: RefPage = {
  id: "travel",
  name: "Geography & Travel",
  href: "/bangladesh/travel",
  sections: [
    section("Places, seasons and access rules", TRAVEL_SOURCES, travelCredits() as RefCredit[]),
    section("Plan your trip: fares and tours", TRIP_SOURCES),
    section("The map", [
      { name: "OpenFreeMap", url: "https://openfreemap.org/" },
      { name: "Terrain Tiles on AWS", url: "https://registry.opendata.aws/terrain-tiles/" },
      { name: "Esri World Imagery", url: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" },
    ]),
  ],
};

/** Every page, in the order of the site's tabs. */
export const REFERENCES: RefPage[] = [
  LANDING,
  ...CATEGORIES.filter((c) => c.slug !== "travel").map(categoryPage),
  TRAVEL_PAGE,
  FACTS,
];
