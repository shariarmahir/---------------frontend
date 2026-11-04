/**
 * Business & Investment: market data with sources and dates, why to come,
 * where each opportunity sits on the map, and how to reach someone. Where a
 * number is weak, such as fresh equity in FDI, the page says so: serious
 * investors check, and honesty is what earns a meeting.
 */
import { pic, wiki, type Block, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

const BIDA_FDI: Src = { name: "BIDA, net FDI 2025", url: "https://investbangladesh.gov.bd/press-release/bangladesh-net-fdi-inflows-rise-39-36-in-2025" };
const EQUITY: Src = { name: "The Daily Star, FDI in 2025", url: "https://www.thedailystar.net/business/economy/news/fdi-rose-2025-fresh-equity-stayed-weak-4176096" };
const GDP: Src = { name: "Al Jazeera on the IMF outlook, October 2026", url: "https://www.aljazeera.com/news/2026/10/25/bangladesh-per-capita-gdp-forecast-to-outstrip-indias-what-does-it-mean" };
const IMF: Src = { name: "IMF, Bangladesh", url: "https://www.imf.org/en/countries/bgd" };
const BTRC: Src = { name: "The Peninsula on BTRC, June 2026", url: "https://www.thepeninsulaqatar.com/article/01/09/2026/bangladesh-adds-over-6-mln-internet-users-in-h1" };
const LEED: Src = { name: "Ittefaq, May 2026", url: "https://en.ittefaq.com.bd/15918/5-more-rmg-factories-get-leed-certification" };
const HEALTH: Src = { name: "Daily Sabah, BIDA chairman", url: "https://www.dailysabah.com/business/economy/bangladesh-eyes-new-investment-horizons-as-ties-with-turkiye-deepen" };
const BLUE: Src = { name: "UNB, BIDA on the blue economy", url: "https://unb.com.bd/category/Bangladesh/bangladesh-seeks-fdi-to-unlock-blue-economy-potential/189448" };
const MATAR: Src = { name: "PortNews", url: "https://en.portnews.ru/news/381567" };
const MIDA: Src = { name: "Dhaka Tribune, Moheshkhali-Matarbari plan", url: "https://www.dhakatribune.com/amp/bangladesh/390609/ca%E2%80%99s-press-wing-mida-to-transform" };
const NSEZ: Src = { name: "The Financial Express, National Special Economic Zone", url: "https://today.thefinancialexpress.com.bd/print/a-blueprint-of-industrial-future-1751042738" };
const FREELANCE: Src = { name: "World Economic Forum", url: "https://www.weforum.org/stories/all/how-the-digital-economy-is-shaping-a-new-bangladesh/" };
const BIDA: Src = { name: "Bangladesh Investment Development Authority", url: "https://bida.gov.bd/" };

export const INVEST_BLOCKS: Block[] = [
  { kind: "part", part: "stack" },
  {
    kind: "table",
    id: "market-data",
    hideLastColumn: true,
    picture: pic("dhaka-street", "Rickshaws, motorbikes and cars on a Dhaka street") ?? photo("metro-rail"),
    tone: "white",
    title: "The market in numbers",
    lede: "Recent figures, from 2024 to 2026, and the weak ones included.",
    head: ["Measure", "Figure", "As of"],
    rows: [
      ["Economy, nominal GDP", "About US$506 billion", "IMF forecast for 2026"],
      ["Income per person", "About US$2,886", "IMF forecast for 2026"],
      ["Growth", "About 3.6 to 4.7 percent", "IMF, 2026 forecasts, recent ones lower"],
      ["People", "About 175 million", "IMF, 2026"],
      ["Active mobile connections", "189.83 million", "BTRC, June 2026"],
      ["Internet subscribers", "135.94 million", "BTRC, June 2026"],
      ["Goods exports", "About US$48 billion", "Export Promotion Bureau, FY2024-25"],
      ["Money sent home by workers abroad", "US$35.56 billion", "Bangladesh Bank, FY2025-26"],
      ["Net foreign direct investment", "US$1.77 billion, up 39 percent", "BIDA, 2025"],
      ["Share of that FDI which is fresh equity", "About 30 percent", "The Daily Star, 2025"],
    ],
    note: "FDI is still low for an economy this size, and inflation has run high. If that sounds like a problem, it is also why the first movers here face few rivals.",
    sources: [GDP, IMF, BTRC, BIDA_FDI, EQUITY],
  },
  {
    kind: "cards",
    id: "why-invest",
    tone: "navy",
    title: "Why invest in Bangladesh",
    lede: "Four reasons that do not depend on anyone's promises.",
    columns: 4,
    cards: [
      { title: "A market of 175 million", text: "One of the world's most crowded countries, with 136 million internet subscribers and a growing number of people able to buy more than the basics.", source: BTRC, picture: pic("dhaka-street", "Rickshaws, motorbikes and cars on a Dhaka street") },
      { title: "Skilled hands at scale", text: "Decades of export manufacturing have trained millions of workers. An Oxford study ranked Bangladesh second in the world for online workers.", source: FREELANCE, picture: photo("garments") },
      { title: "Between two giants", text: "On the Bay of Bengal between India and South-East Asia. New bridges, a tunnel and a planned deep-sea port are cutting transit times to markets.", source: MIDA, picture: pic("chattogram-port", "A straddle carrier at the Port of Chittagong") },
      { title: "Proven at world level", text: "Second in clothing exports, 284 LEED green factories, and medicines shipped to more than 160 countries. Global buyers already trust this supply base.", source: LEED, picture: photo("garments")},
    ],
  },
  {
    kind: "cards",
    id: "where-the-opportunity-is",
    tone: "white",
    title: "Where the opportunity is, sector by sector",
    lede: "The resource each one rests on, and the gap still open.",
    columns: 3,
    cards: [
      { title: "Higher-value garments", meta: "Rests on: millions of skilled workers", text: "Most exports are still cotton basics. The gap is in man-made fibres, technical textiles, design and branding.", picture: photo("garments") ?? photo("garments"), source: LEED },
      { title: "Healthcare and medicine", meta: "Rests on: a strong drug industry", text: "Bangladeshis spend about US$5 billion a year on treatment abroad, BIDA's chairman says. The gap is in good hospitals, medical devices and digital health. Pharma makes about 98 percent of local demand but still imports most raw ingredients.", picture: pic("pharma", "A scientist at work in a laboratory"), source: HEALTH },
      { title: "Software and fintech", meta: "Rests on: a young, online workforce", text: "Hundreds of thousands of freelancers, and mobile money that already reaches most households. The gap is in companies that can turn talent into exports at scale.", picture: pic("laptop", "Code on a laptop screen"), source: FREELANCE },
      { title: "Food and farm processing", meta: "Rests on: the delta's harvest", text: "A top producer of rice, fish, vegetables and fruit, with little cold storage and packaging. A great deal is lost or sold raw.", picture: photo("rice-planting"), source: BIDA },
      { title: "The blue economy", meta: "Rests on: 118,813 km² of sea", text: "BIDA is asking foreign partners into deep-sea fishing, because local firms do not yet have the capacity. Aquaculture and seafood processing are open too.", picture: photo("hilsa"), source: BLUE },
      { title: "Ports and logistics", meta: "Rests on: the Bay of Bengal", text: "Matarbari deep-sea port and the Bay Terminal are expected to open by about 2029 or 2030, with industry planned around them.", picture: pic("chattogram-port", "A straddle carrier at the Port of Chittagong"), source: MATAR },
      { title: "Clean energy", meta: "Rests on: rising demand and open land", text: "Power demand keeps rising and the country is short of gas. Rooftop solar on factories is a quick win, with buyers now asking for clean supply chains.", picture: pic("solar-bd", "Solar panels in a green field"), source: BIDA },
      { title: "Ships and light engineering", meta: "Rests on: river trades and repair shops", text: "A long tradition of building boats along the rivers has grown into yards that export small ships. Machine parts workshops serve local industry.", picture: pic("shipyard", "A ship's hull under repair at a river yard in Dhaka"), source: BIDA },
      { title: "Tourism", meta: "Rests on: an unknown country", text: "A very long sea beach, the biggest mangrove and few international hotels outside the big cities. The gap is in good mid-range lodges, boats and guides.", picture: photo("coxs-bazar"), source: BIDA },
    ],
  },
  {
    kind: "map",
    id: "where-to-locate",
    tone: "sun",
    title: "Where to put it",
    lede: "Each region has its own resources. Pick a pin to see what it is good for.",
    note: "A guide to help you start looking. Check zones, land and incentives with BIDA and BEZA.",
    pins: [
      { id: "mirsarai", name: "National Special Economic Zone", place: "Mirsarai, Chattogram", lat: 22.78, lon: 91.5, tag: "Heavy and export industry", text: "The flagship zone on about 33,000 acres of reclaimed coast, next to the Dhaka-Chattogram highway and near the port.", link: NSEZ, picture: pic("sez", "The sea shore at the National Special Economic Zone in Mirsarai") },
      { id: "chattogram", name: "Chattogram Port", place: "Chattogram", lat: 22.3, lon: 91.8, tag: "Trade and logistics", text: "The country's main seaport, with steel, shipbreaking and export zones around it.", link: wiki("Chittagong Port"), picture: pic("chattogram-port", "A straddle carrier at the Port of Chittagong") },
      { id: "matarbari", name: "Matarbari and Moheshkhali", place: "Cox's Bazar", lat: 21.71, lon: 91.87, tag: "Deep-sea port and energy", text: "A planned deep-sea port with energy and manufacturing hubs, expected from about 2029 or 2030.", link: MIDA, picture: pic("coast-dawn", "Dawn on the coast of Bangladesh") },
      { id: "dhaka", name: "Greater Dhaka and Gazipur", place: "Dhaka", lat: 23.99, lon: 90.42, tag: "Garments, software, services", text: "The centre of garments, finance and software, and the biggest consumer market.", link: BIDA, picture: pic("dhaka-air", "Dhaka from the air") },
      { id: "savar", name: "Savar", place: "Dhaka district", lat: 23.85, lon: 90.26, tag: "Leather", text: "The tannery estate and many garment factories around the Dhaka export zone.", link: { name: "BEPZA", url: "https://www.bepza.gov.bd/" }, picture: photo("garments") },
      { id: "narayanganj", name: "Narayanganj", place: "Dhaka division", lat: 23.62, lon: 90.5, tag: "Knitwear and ship building", text: "River port town with knit factories, boatyards and jamdani weavers.", link: wiki("Narayanganj"), picture: photo("handloom") },
      { id: "mongla", name: "Mongla Port", place: "Bagerhat", lat: 22.49, lon: 89.6, tag: "South-west gateway", text: "The Padma Bridge has brought this second seaport within a day's road trip of Dhaka.", link: wiki("Port of Mongla"), picture: pic("shipyard", "A ship's hull under repair at a river yard") },
      { id: "khulna", name: "Khulna and Jashore", place: "South-west", lat: 22.85, lon: 89.54, tag: "Shrimp and agro", text: "Frozen shrimp and fish exports, jute mills, and the Benapole land port to India.", link: wiki("Khulna"), picture: photo("mangroves") },
      { id: "barishal", name: "Bhola and Barishal", place: "South", lat: 22.7, lon: 90.65, tag: "Gas and fisheries", text: "Rivers, hilsa and gas fields, newly closer to Dhaka by road.", link: wiki("Bhola Island"), picture: pic("launch-sadarghat", "River launches moored at Sadarghat in Dhaka") },
      { id: "sylhet", name: "Sylhet", place: "North-east", lat: 24.89, lon: 91.87, tag: "Tea, gas, tourism", text: "Tea estates, gas fields and the money of a large diaspora in Britain, looking for a home.", link: wiki("Sylhet"), picture: photo("srimangal-tea") },
      { id: "rajshahi", name: "Rajshahi", place: "North-west", lat: 24.37, lon: 88.6, tag: "Mango, silk, agro", text: "Mangoes, silk and vegetables, and a clean, calm university city.", link: wiki("Rajshahi"), picture: pic("mango-tree", "Mangoes hanging on a tree") },
      { id: "dinajpur", name: "Rangpur and Dinajpur", place: "North", lat: 25.74, lon: 89.25, tag: "Food processing and minerals", text: "Potatoes, rice, maize and litchis, with hard rock and coal mining at Maddhapara and Barapukuria.", link: wiki("Rangpur Division"), picture: photo("rice-planting") },
    ],
  },
  {
    kind: "cards",
    id: "future-market",
    tone: "white",
    title: "The future market",
    columns: 3,
    cards: [
      { title: "People with more to spend", text: "If income per person keeps rising from today's level, spending shifts toward better food, housing, health, education and travel.", source: GDP, picture: pic("shopping-mall", "The glass dome of a building in Dhaka") },
      { title: "A digital country", text: "With 120.84 million people on mobile internet and wallets already common, a new online service can reach a mass market quickly.", source: BTRC, picture: photo("mobile-money") },
      { title: "After LDC status", text: "Bangladesh's graduation is now set for November 2029. Duty-free access to some markets will change, so local factories will need higher value and new trade deals.", source: { name: "Prothom Alo", url: "https://en.prothomalo.com/bangladesh/addcsizr3s" }, picture: pic("dhaka-air", "Dhaka from the air") },
    ],
  },
  { kind: "part", part: "simulator" },
  { kind: "tool", tool: "connect" },
  { kind: "part", part: "figures" },
];
