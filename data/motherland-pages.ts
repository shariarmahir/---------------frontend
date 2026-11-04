/** Which blocks each category page shows, in the order they are read. */
import type { Block } from "./motherland-blocks.ts";
import { CULTURE_BLOCKS } from "./motherland-page-culture.ts";
import { HISTORY_BLOCKS } from "./motherland-page-history.ts";
import { INVEST_BLOCKS } from "./motherland-page-invest.ts";
import { NATURE_BLOCKS } from "./motherland-page-nature.ts";
import { PEOPLE_BLOCKS } from "./motherland-page-people.ts";
import { RESOURCES_BLOCKS } from "./motherland-page-resources.ts";
import { SCIENCE_BLOCKS } from "./motherland-page-science.ts";
import { TAKA_BLOCKS } from "./motherland-page-taka.ts";

const PROCON_BLOCKS: Block[] = [
  {
    kind: "statement",
    id: "our-policy",
    tone: "gold",
    text: [
      "MOTHERLAND represents Bangladesh and supports its business development by putting information in one place, in the easiest way we can. We have no conflict with any government. If the government wants to work with us, we are open to its support and collaboration, so that together we can build a better Bangladesh and show the whole country, with all its people, to the world.",
    ],
  },
  { kind: "part", part: "debates" },
];

const VIDEO_BLOCKS: Block[] = [{ kind: "part", part: "videos" }];

export const PAGE_BLOCKS: Record<string, Block[]> = {
  history: HISTORY_BLOCKS,
  "science-tech": SCIENCE_BLOCKS,
  people: PEOPLE_BLOCKS,
  nature: NATURE_BLOCKS,
  culture: CULTURE_BLOCKS,
  taka: TAKA_BLOCKS,
  resources: RESOURCES_BLOCKS,
  invest: INVEST_BLOCKS,
  procon: PROCON_BLOCKS,
  videos: VIDEO_BLOCKS,
};

/** The paragraph under each hero, which inks itself in as you scroll. Pro & Con opens with its policy instead. */
export const INTROS: Record<string, string> = {
  history: "This land was rich before most of today's countries had names. It was robbed, starved and split in two. Then it won back its language, its country and a bridge over the Padma paid for with its own money. Read it as one long story of falling down and standing up.",
  "science-tech": "A cheap packet of salt and sugar, proven in a Dhaka laboratory, has saved millions of children around the world. The same country now has its own satellite in orbit and is building a nuclear power station. Its best work is still ahead of it.",
  people: "A farmer's son who taught himself philosophy. A painter who drew a famine on cheap paper. A woman who stood on the highest peak of every continent. These are the people Bangladesh is proud of, and most of the world has not met them yet.",
  nature: "Where the great rivers meet the sea, tigers swim between mangroves, dolphins rise through brown water and six seasons repaint the same field every two months. Very few countries hold this much life in so little land, and all of it needs looking after.",
  culture: "People here once marched to save a television character from the gallows. That tells you how seriously this country takes a story. Songs, ghosts, rice cakes, rock bands and boat races: come in any month and something is being celebrated.",
  taka: "You do not need to worry about money in Bangladesh. Here is what the notes look like, how to change them, which apps people use and the few rules worth knowing, so that you can spend your first day looking around instead of counting.",
  resources: "Few people look at a delta and see wealth. Bangladesh has gas under its fields, silt that feeds three harvests, a long coast on one of the busiest seas in the world and 175 million people. That last one is the resource that matters most.",
  invest: "The second-largest clothing exporter in the world has a young workforce, a growing middle class and a place between India, China and Southeast Asia. Here is where the money is going, what is still open, and who to talk to.",
  videos: "Some of this country cannot be described, only watched. Rivers wider than cities, boats racing to the beat of a drum, a hand weaving jamdani one thread at a time. Press play.",
};

export const TRAVEL_INTRO = "Here you can row a boat through a drowned forest in the morning and drink seven-colour tea in the afternoon. Some of the best places in Bangladesh have no queue, no ticket booth and often no other visitors. Tell us when you are coming and we will show you the way.";
