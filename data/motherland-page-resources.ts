/**
 * Capability & Resources: what the land holds and what people can do with it,
 * with figures and their sources. Gas and coal counts vary by report, so the
 * text names the one it uses.
 */
import { bangla, pic, wiki, type Block, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

const MINERALS: Src = bangla("Mineral Resources");
const HARD: Src = { name: "Banglapedia, Hardrock", url: "https://en.banglapedia.org/index.php?title=Hardrock" };
const USGS: Src = { name: "US Geological Survey, Bangladesh", url: "https://pubs.usgs.gov/myb/vol3/2016/myb3-2016-bangladesh.pdf" };
const BTRC: Src = { name: "The Peninsula on BTRC, June 2026", url: "https://www.thepeninsulaqatar.com/article/01/09/2026/bangladesh-adds-over-6-mln-internet-users-in-h1" };
const FREELANCE: Src = { name: "The Daily Star, Oxford study", url: "https://www.thedailystar.net/bytes/bangladesh-second-in-supplying-online-labourers-says-study-by-oxford-internet-institute-1437082" };
const ROOPPUR: Src = { name: "World Nuclear Association", url: "https://www.world-nuclear.org/information-library/country-profiles/countries-a-f/bangladesh.aspx" };

export const RESOURCES_BLOCKS: Block[] = [
  { kind: "part", part: "stack" },
  { kind: "part", part: "figures" },
  {
    kind: "table",
    id: "resource-table",
    picture: photo("rice-planting"),
    tone: "white",
    title: "What we have, at a glance",
    lede: "The whole inventory on one page.",
    head: ["Resource", "How much", "Where"],
    rows: [
      ["Natural gas", "About 21 trillion cubic feet proven and probable, in 23 fields", "Sylhet, Brahmanbaria, Bhola"],
      ["Hard rock", "174 million tons in the mine area, 1.65 million tons a year", "Maddhapara, Dinajpur"],
      ["Coal", "Mined since 2003", "Barapukuria, Dinajpur"],
      ["White clay and silica sand", "Used by local industry", "Netrokona and the north"],
      ["Sea", "118,813 km² of water", "Bay of Bengal"],
      ["Rice", "Three crops a year, third largest grower", "Across the delta"],
      ["Inland fish", "Third-largest catch", "Rivers, haors and floodplains"],
      ["Jute", "Second-largest grower", "Faridpur, Jashore and the centre"],
      ["Tea", "Long-established export crop", "Sylhet and Chattogram"],
      ["Mangrove", "About 6,000 km² in Bangladesh", "The Sundarbans"],
      ["People", "About 175 million, median age under 30", "Everywhere"],
    ],
    note: "Reserve figures come from different years and methods, so use them as a guide to scale.",
    sources: [MINERALS, HARD, USGS],
  },
  {
    kind: "chapters",
    id: "energy-and-position",
    tone: "mint",
    title: "Power and position",
    lede: "What runs the country today, and what could run it tomorrow.",
    chapters: [
      { title: "Gas built modern Bangladesh", meta: "23 fields", text: "Gas from the eastern fields has fuelled power stations, fertiliser factories and kitchens for decades. Output is now falling, so the country imports liquefied gas and is looking under the Bay of Bengal.", source: MINERALS, picture: pic("gas-pipe", "A gas pipeline running through the forest")},
      { title: "A nuclear country", meta: "Rooppur, October 2026", text: "Unit 1 at Rooppur reached first criticality in October 2026 and is in power start-up, with a second unit to follow. It is the country's first nuclear power.", source: ROOPPUR, picture: pic("rooppur", "The cooling towers of the Rooppur nuclear power station at dusk") },
      { title: "The sun on the roof", meta: "Solar", text: "Millions of small home solar systems lit up rural areas before the grid reached them. The next step is factory roofs and larger parks.", source: wiki("Solar power in Bangladesh"), picture: pic("solar-bd", "Solar panels in a green field") },
      { title: "Where two regions meet", meta: "The Bay of Bengal", text: "Bangladesh sits between South Asia and South-East Asia, with a long coast and land links to India, Bhutan, Nepal and Myanmar nearby. The deep-sea port planned at Matarbari could make that position pay.", source: { name: "PortNews", url: "https://en.portnews.ru/news/381567" }, picture: pic("chattogram-port", "A straddle carrier at the Port of Chittagong") },
    ],
  },
  { kind: "part", part: "rails" },
  {
    kind: "cards",
    id: "capability",
    tone: "navy",
    title: "What our people can do",
    lede: "Skills the world already pays for, from the factory floor to the laptop.",
    columns: 3,
    cards: [
      { title: "Second in the world for clothes", text: "Generations of skill on the factory floor, now moving into green factories and higher-value goods.", picture: pic("garment-floor", "Workers at sewing machines on a factory floor") ?? photo("garments") },
      { title: "Second in online work", text: "An Oxford Internet Institute study ranked Bangladesh second among the world's sources of online workers. The data is from 2017, and the talent has only grown.", source: FREELANCE, picture: photo("mobile-money") },
      { title: "136 million online", text: "Internet subscribers at the end of June 2026, along with 189.83 million active mobile connections.", source: BTRC, picture: pic("phone-field", "A young man using his phone beside a green field")},
    ],
  },
  { kind: "part", part: "timeline" },
];
