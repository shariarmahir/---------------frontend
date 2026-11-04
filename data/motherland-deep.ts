/**
 * What lifts each MOTHERLAND category page beyond its stories: a film for the
 * opening, sourced figures and a timeline. Every figure names where it comes
 * from, and the ones already checked for the Facts page are reused from there,
 * so one number lives in one place. Re-check figures when they age.
 */
import { BEST, GLANCE } from "./motherland-facts.ts";
import { HERO, INVEST, RESOURCES, VIDEOS, type Film } from "./motherland.ts";

export interface Figure {
  value: string;
  label: string;
  source: { name: string; url: string };
}

export interface Moment {
  when: string;
  text: string;
}

export interface Deep {
  film?: Film;
  figuresTitle?: string;
  figures?: Figure[];
  timelineTitle?: string;
  timeline?: Moment[];
}

const best = (figure: string, label: string): Figure => {
  const item = BEST.items.find((i) => i.figure === figure);
  if (!item) throw new Error(`MOTHERLAND: no figure "${figure}" on the Facts page`);
  return { value: figure, label, source: item.source };
};

const glance = (label: string, shown: string): Figure => {
  const row = GLANCE.facts.find((i) => i.label.startsWith(label));
  if (!row) throw new Error(`MOTHERLAND: no glance row "${label}"`);
  return { value: row.value, label: shown, source: GLANCE.source };
};

const [, , BURIGANGA, , RICKSHAWS, FLAG] = VIDEOS.films;

/** A film from Wikimedia Commons, stored in public/motherland/video. */
/** A film from Pixabay, free to use under its content licence. MP4, so it also plays on iPhones. */
const pixabayFilm = (title: string, file: string, slug: string): Film => ({
  title,
  src: { phone: `/motherland/video/${file}-phone.mp4`, desktop: `/motherland/video/${file}.mp4` },
  poster: `/motherland/video/${file}.jpg`,
  credit: { author: "Pixabay contributor", source: "Pixabay", sourceUrl: `https://pixabay.com/videos/${slug}/`, license: "Pixabay Content License", licenseUrl: "https://pixabay.com/service/license-summary/" },
});

const BANDARBAN_FILM = pixabayFilm("The hills of Bandarban", "bandarban-hills", "bandarban-rangamati-landscape-309853");

const commonsFilm = (title: string, file: string, author: string, license: string, name: string): Film => ({
  title,
  src: { phone: `/motherland/video/${file}.webm` },
  poster: `/motherland/video/${file}.jpg`,
  credit: { author, source: "Wikimedia Commons", sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name.replace(/ /g, "_"))}`, license },
});

const SUNDARBANS_FILM = commonsFilm("Kochikhali, the Sundarbans", "sundarbans-kochikhali", "Yahya", "CC BY-SA 4.0", "Kochikhali point, Sundarbans.webm");
const METRO_FILM = commonsFilm("A train arriving on the Dhaka Metro", "metro-uttara", "Mehedi Abedin", "CC BY-SA 4.0", "Train arriving at Uttara Center metro station.webm");
const NEW_YEAR_FILM = commonsFilm("New Year fireworks over Dhaka", "new-year-dhaka", "MdsShakil", "CC BY-SA 4.0", "New year celebrations in Dhaka 02.webm");

/** More real footage of Bangladesh for the Videos page. */
export const MORE_FILMS: Film[] = [
  SUNDARBANS_FILM,
  commonsFilm("Cinematic Bangladesh from the air", "cinematic-bangladesh", "Nishaan Ahmed", "CC BY 3.0", "Cinematic BANGLADESH in 4K - DJI Mini 2 - Part 1.webm"),
  commonsFilm("Weaving jamdani in Narayanganj", "jamdani-weaving", "Wasiul Bahar", "CC BY-SA 4.0", "Weaving jamdani at BSCIC Jamdani palli, Narayanganj 7.webm"),
  commonsFilm("A Baul song at Ramna Park", "baul-ramna", "Wasiul Bahar", "CC BY-SA 4.0", "Baul song at Ramna Park.webm"),
  commonsFilm("Boat race on the Kaliganga", "boat-race", "Sufe", "CC BY-SA 4.0", "Boat Race in Bangladesh at Kaliganga River.ogv"),
  commonsFilm("Kaptai Lake, Rangamati", "kaptai-lake", "Al Riaz Uddin", "CC BY-SA 4.0", "Kaptai Lake video.webm"),
  NEW_YEAR_FILM,
  commonsFilm("By metro through Uttara", "metro-journey", "Mehedi Abedin", "CC BY-SA 4.0", "Journey by metro in Uttara.webm"),
  commonsFilm("A crowd at Sylhet's cricket stadium", "cricket-crowd", "Rocky Masum", "CC BY-SA 4.0", "Spectator at Sylhet International Stadium on March 2023.webm"),
];

const WORLD_HERITAGE: Figure = { value: "3", label: "UNESCO World Heritage sites: Bagerhat, Paharpur and the Sundarbans", source: { name: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/statesparties/bd" } };

export const DEEP: Record<string, Deep> = {
  history: {
    film: FLAG,
    figuresTitle: "A long story in numbers",
    figures: [
      { value: "3rd century BCE", label: "Pundranagara, today's Mahasthangarh, was already a walled city", source: { name: "Mahasthangarh, Wikipedia", url: "https://en.wikipedia.org/wiki/Mahasthangarh" } },
      WORLD_HERITAGE,
      best("21 Feb", "The world keeps Mother Language Day because of Dhaka's students"),
      { value: "9 months", label: "The Liberation War, from 26 March to 16 December 1971", source: { name: "Banglapedia", url: "https://en.banglapedia.org/index.php/War_of_Liberation,_The" } },
    ],
    timelineTitle: "How we got here",
    timeline: [
      { when: "8th century", text: "The Pala kings build Somapura at Paharpur, among the great Buddhist monasteries south of the Himalayas." },
      { when: "15th century", text: "Khan Jahan Ali founds the Mosque City of Bagerhat in the mangrove country." },
      { when: "1757", text: "The East India Company defeats the Nawab of Bengal at Plassey, and British rule begins." },
      { when: "1947", text: "Partition makes East Bengal the eastern wing of Pakistan." },
      { when: "1952", text: "On 21 February police fire on students marching for Bangla as a state language." },
      { when: "1971", text: "Independence is declared on 26 March. Victory comes on 16 December." },
      { when: "1972", text: "Bangladesh adopts its constitution and the taka." },
      { when: "1974", text: "Bangladesh joins the United Nations." },
      { when: "1999", text: "UNESCO declares 21 February International Mother Language Day." },
      { when: "2015", text: "The World Bank moves Bangladesh up to lower-middle income." },
      { when: "2024", text: "A student-led uprising in July and August changes the government." },
    ],
  },
  "science-tech": {
    film: METRO_FILM,
    figuresTitle: "What we have built",
    figures: [
      best("6.15 km", "The Padma Bridge, road above and rail below"),
      { value: "100+", label: "Rice varieties released by the Bangladesh Rice Research Institute", source: { name: "Bangladesh Rice Research Institute", url: "https://brri.gov.bd/" } },
      best("58 → 40", "Deaths per 1,000 children under five, falling as health science reached the villages"),
      { value: "2018", label: "Bangabandhu-1, the country's first satellite, reaches orbit", source: { name: "Bangabandhu-1, Wikipedia", url: "https://en.wikipedia.org/wiki/Bangabandhu-1" } },
    ],
    timelineTitle: "Firsts",
    timeline: [
      { when: "1960s", text: "Researchers at what is now icddr,b in Dhaka help prove oral rehydration, the simple drink that has since saved millions of lives." },
      { when: "1970", text: "The Bangladesh Rice Research Institute is founded." },
      { when: "2010", text: "Bangladeshi scientists led by Maqsudul Alam announce the draft genome of jute." },
      { when: "2018", text: "Bangabandhu-1 gives the country its own communications satellite." },
      { when: "2022", text: "The Padma Bridge opens in June, and Dhaka's first metro line in December." },
    ],
  },
  people: {
    film: RICKSHAWS,
    figuresTitle: "A people in numbers",
    figures: [
      glance("People (Census", "People, in the 2022 census"),
      glance("Can read", "Can read and write"),
      { value: "2021", label: "Dr Firdausi Qadri receives the Ramon Magsaysay Award for her vaccine work", source: { name: "Prothom Alo", url: "https://en.prothomalo.com/bangladesh/fitting-recognition-for-a-pioneering-lifes-work" } },
      { value: "1913", label: "Tagore, who wrote our national anthem, wins the Nobel Prize in Literature", source: { name: "The Nobel Prize", url: "https://www.nobelprize.org/prizes/literature/1913/tagore/facts/" } },
    ],
  },
  nature: {
    film: BANDARBAN_FILM,
    figuresTitle: "A wild country",
    figures: [
      { value: "125", label: "Royal Bengal tigers in the Bangladesh Sundarbans in the 2024 census, up from 106 in 2015", source: { name: "Forest Department census, via Dhaka Tribune", url: "https://www.dhakatribune.com/bangladesh/361154/tiger-population-in-sundarbans-rises-to-125" } },
      { value: "1997", label: "UNESCO lists the Sundarbans, the largest mangrove forest on Earth", source: { name: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/798" } },
      best("1.4m t", "Fish caught each year in rivers, haors and floodplains"),
      { value: "About 80%", label: "Of the country is floodplain, laid down by the Ganges, Brahmaputra and Meghna", source: { name: "Geography of Bangladesh, Wikipedia", url: "https://en.wikipedia.org/wiki/Geography_of_Bangladesh" } },
    ],
  },
  culture: {
    film: MORE_FILMS[2],
    figuresTitle: "Heritage the world has listed",
    figures: [
      { value: "5", label: "Living traditions on UNESCO's lists by 2023", source: { name: "UNESCO Intangible Cultural Heritage", url: "https://ich.unesco.org/en/state/bangladesh-BD" } },
      WORLD_HERITAGE,
      best("21 Feb", "A day for every language on Earth, because of Bangla"),
    ],
    timelineTitle: "Recognised by the world",
    timeline: [
      { when: "2008", text: "Baul songs, the mystic music of wandering singers." },
      { when: "2013", text: "Jamdani, the fine muslin woven by hand." },
      { when: "2016", text: "Mangal Shobhajatra, the Pohela Boishakh procession in Dhaka." },
      { when: "2017", text: "Shital Pati, the cool mats woven in Sylhet." },
      { when: "2023", text: "Rickshaw painting in Dhaka." },
    ],
  },
  taka: {
    film: BURIGANGA,
    figuresTitle: "What gives it value",
    figures: [
      best("No. 2", "In the world's clothing exports"),
      best("$35.56bn", "Sent home by workers abroad in FY2025-26"),
      best("18.7%", "Of people in poverty, far below where the country began"),
      { value: "2006", label: "A Nobel Peace Prize for lending small sums to the poor", source: { name: "The Nobel Prize", url: "https://www.nobelprize.org/prizes/peace/2006/summary/" } },
    ],
    timelineTitle: "The money's story",
    timeline: [
      { when: "1971", text: "Bangladesh Bank is founded in the year of independence." },
      { when: "1972", text: "The first taka notes are issued on 4 March, replacing the Pakistani rupee." },
      { when: "1983", text: "Grameen Bank becomes a bank in its own right, lending to the rural poor." },
      { when: "2006", text: "Muhammad Yunus and Grameen Bank share the Nobel Peace Prize." },
      { when: "2011", text: "bKash launches, and mobile money starts reaching people with no bank." },
      { when: "2015", text: "Bangladesh reaches lower-middle income." },
      { when: "2025", text: "New banknotes show the country's monuments and landscapes, with no person on them." },
    ],
  },
  videos: { film: MORE_FILMS[1] },
  resources: {
    film: HERO.film,
    figuresTitle: "What we were born with",
    figures: RESOURCES.items.map((r) => ({ value: r.value, label: r.label, source: r.source })),
  },
  invest: {
    film: BURIGANGA,
    figuresTitle: "The case in numbers",
    figures: [
      { value: `$${INVEST.exportsToday}bn`, label: "Goods exported in FY2024-25, rounded", source: { name: "Export Promotion Bureau", url: "https://epb.gov.bd/" } },
      best("No. 2", "In the world's clothing exports"),
      best("$35.56bn", "Remittances in FY2025-26"),
      glance("People (Census", "People, a huge market at home"),
    ],
  },
};

/** Every source a page's figures name, once, for its footer. */
export function deepSources(slug: string) {
  const seen = new Map<string, string>();
  for (const f of DEEP[slug]?.figures ?? []) seen.set(f.source.url, f.source.name);
  return [...seen].map(([url, name]) => ({ url, name }));
}
