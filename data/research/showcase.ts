import type { Credit } from "@/data/bangladesh";
import { ruralStories } from "@/data/rural-life";
import type { TrackId } from "@/lib/research/tracks";
import { HOUSE_CROW_CREDIT } from "./crow-falcon";

/**
 * What Genius's home and collection pages show around the
 * catalogue: the hero slider, the image collage and each collection's
 * cover and "About this collection" text. Photographs are the Wikimedia
 * Commons files already in /public/bangladesh/rural, always shown with
 * their credit (data/rural-life.ts holds the licences).
 */


export interface ShowcasePhoto {
  src: string;
  alt: string;
  /** The caption under the slider, JSTOR-style: what, where, and its licence. */
  caption: string;
  credit?: Credit;
  /** The collection the scene speaks to, linked from the caption. */
  collection: TrackId;
  focus?: string;
}

const creditOf = (id: string): Credit | undefined => ruralStories.find((s) => s.id === id)?.photo.credit;

const photo = (id: string, rest: Omit<ShowcasePhoto, "src" | "credit">): ShowcasePhoto => ({ src: `/bangladesh/rural/${id}.jpg`, credit: creditOf(id), ...rest });

/** The hero slider under the search bar: five wide scenes of the problems the library studies. */
export const HERO_SLIDES: ShowcasePhoto[] = [
  photo("char-flood", {
    alt: "A settlement on a char of the Jamuna under flood water, tin-roofed houses standing in the river",
    caption: "Flooded homesteads on a char of the Jamuna, Sariakandi, Bogura",
    collection: "bd-live",
    focus: "50% 55%",
  }),
  photo("tea-worker", {
    alt: "A tea worker in a palm-leaf hat plucking leaves on a tea estate in Sreemangal",
    caption: "A tea worker plucking leaves on an estate in Sreemangal, Moulvibazar",
    collection: "culture",
    focus: "50% 40%",
  }),
  photo("teesta-fisher", {
    alt: "A fisherman on a small boat readying his net on the Teesta river in Rangpur",
    caption: "A fisherman readying his net on the Teesta, Rangpur",
    collection: "field-work",
    focus: "50% 50%",
  }),
  photo("sowing-paddy", {
    alt: "A farmer bent over in muddy water, transplanting rice seedlings",
    caption: "Transplanting rice seedlings in a flooded paddy field",
    collection: "field-work",
    focus: "50% 45%",
  }),
  photo("rickshaw-rain", {
    alt: "A rickshaw puller pulling his rickshaw along a rain-soaked city street",
    caption: "A rickshaw puller on a rain-soaked city street",
    collection: "culture",
    focus: "50% 50%",
  }),
];

/** The collage beside "Ground your research in Bangladesh's real problems". */
export const COLLAGE: ShowcasePhoto[] = [
  photo("paddy-bales", { alt: "Farmers carrying paddy bales home along the field ridges after the harvest", caption: "Carrying paddy home after the harvest", collection: "bd-live" }),
  photo("brick-hands", { alt: "A brick worker's hands pressing mud into a mould", caption: "Moulding bricks by hand", collection: "bd-live" }),
  photo("cyclone-shelter", { alt: "Villagers meeting inside a cyclone shelter in the south of the country", caption: "A village meeting in a cyclone shelter", collection: "global" }),
  photo("teesta-erosion", { alt: "A riverbank collapsing into the Teesta, the land sliding into the water", caption: "Riverbank erosion on the Teesta", collection: "bd-live" }),
  photo("garment-machine", { alt: "Workers at sewing machines in a garment factory", caption: "On the floor of a garment factory", collection: "culture" }),
  photo("rural-kitchen", { alt: "A village kitchen with a clay stove and cooking pots", caption: "A village kitchen with a clay stove", collection: "culture" }),
];

export interface CollectionInfo {
  /** The cover beside the title, as JSTOR shows a collection's cover. */
  cover: { src: string; alt: string; credit?: Credit };
  /** "About this Collection": paragraphs, the first shown before "Show more". */
  about: string[];
}

const cover = (id: string, alt: string) => ({ src: `/bangladesh/rural/${id}.jpg`, alt, credit: creditOf(id) });

export const COLLECTIONS: Record<TrackId, CollectionInfo> = {
  "bd-solutions": {
    cover: { src: "/research/house-crow-dhaka.jpg", alt: "A house crow perched in Shantinagar, Dhaka", credit: HOUSE_CROW_CREDIT },
    about: [
      "Bangladesh Real Issues & Solutions gathers research that starts from a problem people in Bangladesh live with today, traces it to causes that can be measured, and ends with a plan that can be costed, tested and handed to the people who must act on it.",
      "Every work here names the problem, weighs the evidence for each cause, and states who benefits, what it costs and how success will be measured. Proposals and pilots are labelled as ongoing until their results are in.",
      "It is a subject of its own in Browse by Subject. Upload a thesis, paper or project under it, and it joins this collection once it passes review.",
    ],
  },
  "bd-live": {
    cover: cover("char-flood", "A flooded char settlement on the Jamuna"),
    about: [
      "Real-Time Bangladesh Problems gathers research that speaks to the 32 live problems in Kandari-Lab's national dossier (BD-001 to BD-032): health access, prices and counterfeits, floods, river erosion, air, schools, jobs and more. Each work is tagged with the problems it addresses, so you can see at a glance which problems have evidence behind them and which are still waiting for a study.",
      "The dossier ranks each problem by urgency and by the state of its evidence (verified, plausible or unverified). A problem with no linked research is an open invitation: upload a thesis, paper or project that addresses it, and it will appear here after review.",
      "Sample entries are labelled as samples. Their authors, institutions and figures are illustrative, and they should not be cited as real studies.",
    ],
  },
  global: {
    cover: cover("cyclone-shelter", "A village meeting inside a cyclone shelter"),
    about: [
      "Global Research holds world questions and comparative work: studies of other countries' policies, technologies and evidence, read for what they teach Bangladesh.",
      "Authors mark a work as global when they upload it. The collection is new; the first global studies will appear here once they pass review.",
    ],
  },
  culture: {
    cover: cover("rural-kitchen", "A village kitchen with a clay stove"),
    about: [
      "Culture & Society brings together research on how people in Bangladesh live, learn, earn and cope: households on the chars, classrooms, markets, livelihoods and the economy that ties them together.",
      "It draws on three subjects (Society, Culture & Policy; Education; Economy & Business) and favours work that lets people speak in their own words.",
    ],
  },
  technology: {
    cover: { src: "/media/circuit.webp", alt: "A sensor prototype on a breadboard" },
    about: [
      "Technology & Engineering collects sensors, software, AI and hardware built for Bangladeshi conditions and budgets, from flood sensors that cost less than a thousand taka to Bangla speech recognition.",
      "Each work states what was built, how it was tested, and what failed, so others can repeat or improve it.",
    ],
  },
  "field-work": {
    cover: cover("sowing-paddy", "A farmer transplanting rice seedlings"),
    about: [
      "From the Field gathers surveys, trials and observation carried out in a named district, char or village, from Satkhira's saline fields to riverside schools in Jamalpur.",
      "Field research is where national figures meet local lives. Every work here names the district where it was done.",
    ],
  },
  ongoing: {
    cover: { src: "/media/civic-waste.webp", alt: "A neighbourhood rubbish heap" },
    about: [
      "Ongoing Research & Working Papers holds work still under way, and papers published for reading and comment before peer review.",
      "Treat the findings here as provisional. Comments and questions from readers help the authors before the work is final.",
    ],
  },
  students: {
    cover: { src: "/media/calculus.webp", alt: "Maths practice in an exercise book" },
    about: [
      "Student Research showcases projects and theses from school, college and undergraduate researchers across Bangladesh.",
      "Publishing early teaches the habits of research: a clear question, an honest method and plainly stated limits.",
    ],
  },
  innovation: {
    cover: { src: "/media/dsa-code.webp", alt: "Model training code on a screen" },
    about: [
      "Innovations, Projects & Ideas collects devices, software and hands-on solutions, with what worked and what did not, and untested ideas published to find a supervisor, collaborators or funding.",
      "Kandari-Lab's own R&D pipeline appears here as ongoing research, never as a finished product.",
    ],
  },
};
