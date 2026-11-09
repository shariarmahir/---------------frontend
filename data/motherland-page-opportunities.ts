/**
 * Opportunities, the closing section of Capability & Resources (Mahir, 2026-11-09): where
 * Bangladesh can grow from here, in tabs. Every figure was read on its source in November 2026
 * and each card names one source for the References page. A gap is stated as the room it
 * leaves, never as a forecast. Re-check when these age, first of all the offshore round,
 * whose bids close on 30 November 2026. Reports differ on its size (26 or 27 blocks), so the
 * card gives only the deep-sea count they agree on.
 */
import { pic, type Block, type Card, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

export const OPPORTUNITY_TABS = ["Why now", "Industry", "Energy", "Services", "Land and sea", "People and money"] as const;
type Tab = (typeof OPPORTUNITY_TABS)[number];

const INVEST = { label: "Invest in Bangladesh", href: "https://investbangladesh.gov.bd/" };
const PLAN: Src = { name: "BSS, 180-day joint investment plan, March 2026", url: "https://www.bssnews.net/news/369319" };

/** A card under its tab: one source, one photograph, and the office to go to where there is one. */
const card = (group: Tab, c: Omit<Card, "group">): Card => ({ ...c, group });

const CARDS: Card[] = [
  card("Why now", {
    title: "Two decades of young workers",
    meta: "Working-age peak in 2045",
    text: "The World Bank expects the working-age share of Bangladesh's people to peak in 2045. Every job, skill and school built before then pays back for a generation.",
    source: { name: "Dhaka Tribune on the World Bank, November 2026", url: "https://www.dhakatribune.com/business/423621/world-bank-bangladesh-has-two-more-decades-to" },
    picture: pic("girl-books", "A schoolgirl holding her books in a green field"),
  }),
  card("Why now", {
    title: "Three more years to prepare",
    meta: "LDC status to November 2029",
    text: "The UN General Assembly moved Bangladesh's graduation from the least developed countries from 24 November 2026 to November 2029, giving exporters and investors more time to get ready.",
    source: { name: "Prothom Alo, October 2026", url: "https://en.prothomalo.com/bangladesh/addcsizr3s" },
    picture: pic("karnaphuli-river", "Ships and cranes lit at night on the Karnaphuli River"),
  }),
  card("Why now", {
    title: "Japan's market, duty-free",
    meta: "Signed 6 February 2026",
    text: "An Economic Partnership Agreement signed in Tokyo gives about 7,379 Bangladeshi products, garments included, duty-free entry to Japan once it takes effect.",
    source: { name: "BSS, February 2026", url: "https://www.bssnews.net/news-flash/358293" },
    picture: pic("plane-dhaka", "A passenger plane on the runway at Dhaka airport"),
  }),

  card("Industry", {
    title: "Clothes beyond cotton",
    meta: "A possible $42bn by 2032",
    text: "Non-cotton fibres make most of the world's clothes. One study says Bangladesh could lift these exports from $15.6bn to $42bn by 2032, with $18bn more invested.",
    source: { name: "The Financial Express, non-cotton apparel study", url: "https://thefinancialexpress.com.bd/trade/with-a-full-value-chain-non-cotton-apparel-exports-can-hit-42b-by-2032" },
    picture: pic("jamdani-hands", "A weaver's hands at a loom"),
    cta: { label: "Visit BGMEA", href: "https://bgmea.com.bd/" },
  }),
  card("Industry", {
    title: "Medicines for the world",
    meta: "More than 130 countries",
    text: "Exports reached $238.5m in FY2025-26, about 0.5% of the goods the country sells abroad, from a home market above Tk 300 billion.",
    source: { name: "bdnews24, October 2026", url: "https://bdnews24.com/business/515zckldx9" },
    picture: pic("pharma", "A scientist at work in a medicines laboratory"),
    cta: INVEST,
  }),
  card("Industry", {
    title: "Shoes and leather",
    meta: "About $1.23bn in FY2025-26",
    text: "The leather sector earned about $1.23bn in FY2025-26, up about 7%, and leather goods grew fastest, at about 16%.",
    source: { name: "bdnews24 on Export Promotion Bureau data", url: "https://bdnews24.com/business/55a1465ad4a3" },
    picture: pic("opp-cobbler", "A cobbler at work on a pavement in Dhaka"),
    cta: { label: "Visit the Export Bureau", href: "https://epb.gov.bd/" },
  }),
  card("Industry", {
    title: "Parts and machines",
    meta: "Half the home market",
    text: "Bangladesh's light engineering workshops meet about half of the country's demand for their products. The other half is still open to them.",
    source: { name: "LightCastle Partners, April 2025", url: "https://lightcastlepartners.com/insights/2025/04/export-diversification-light-engineering/" },
    picture: pic("opp-blacksmith", "A blacksmith working at his forge in Bangladesh"),
  }),
  card("Industry", {
    title: "Ship recycling, done cleanly",
    meta: "17 yards on the IMO list",
    text: "With 17 yards at Sitakunda on the International Maritime Organization's list under the Hong Kong Convention, Bangladesh stands second in the world for authorised ship recycling.",
    source: { name: "Hellenic Shipping News, May 2026", url: "https://www.hellenicshippingnews.com/?p=1134050" },
    picture: pic("shipyard", "A ship's hull under repair at a river yard in Dhaka"),
  }),
  card("Industry", {
    title: "Chips, starting with design",
    meta: "About $6m a year today",
    text: "The national taskforce puts chip design, testing and packaging first and leaves fabrication for later: the parts of the industry a country can start without a giant factory.",
    source: { name: "The Financial Express, July 2025", url: "https://thefinancialexpress.com.bd/trade/semiconductor-push-bd-outlines-vision-to-join-global-tech-value-chain" },
    picture: pic("lab-bd", "A researcher at a microscope"),
    cta: INVEST,
  }),

  card("Energy", {
    title: "Clean power by 2030",
    meta: "A 20% target",
    text: "Renewables stood at about 1,936 MW in late 2026, some 566 MW of it on rooftops. National policy aims to meet at least 20% of demand from them by 2030.",
    source: { name: "Dhaka Tribune, October 2026", url: "https://www.dhakatribune.com/bangladesh/power-energy/423304/bangladesh%E2%80%99s-renewable-energy-ambition-faces-a" },
    picture: pic("opp-wind-feni", "Wind turbines near the Feni River"),
    cta: { label: "Visit SREDA", href: "https://sreda.gov.bd/" },
  }),
  card("Energy", {
    title: "Gas under the Bay",
    meta: "Bids close 30 November 2026",
    text: "Petrobangla's offshore round offers 15 deep-sea blocks and more in shallow water to international oil companies.",
    source: { name: "The Financial Express, May 2026", url: "https://today.thefinancialexpress.com.bd/print/bidding-for-offshore-hydrocarbon-exploration-launched-1779643903" },
    picture: pic("coast-dawn", "Dawn on the coast of Bangladesh, with small boats on the water"),
    cta: { label: "Visit Petrobangla", href: "https://petrobangla.org.bd/" },
  }),
  card("Energy", {
    title: "Electric buses and trucks",
    meta: "Proposed relief to June 2030",
    text: "The June 2026 budget proposed lifting import charges, other than VAT, on electric buses and trucks until June 2030. Nobody in Bangladesh builds them yet.",
    source: { name: "Mongabay, June 2026", url: "https://news.mongabay.com/2026/06/bangladesh-unveils-sweeping-ev-incentives-to-cut-emissions-and-pollution/" },
    picture: pic("cng", "A green auto-rickshaw in Dhaka"),
  }),

  card("Services", {
    title: "Software for export",
    meta: "$724.6m in FY2024-25",
    text: "Official figures put ICT service exports at $724.6m against a $5bn goal. The distance between those two numbers is the opportunity.",
    source: { name: "The Business Standard, November 2025", url: "https://www.tbsnews.net/economy/5b-ict-export-target-missed-huge-margin-heres-why-1281591" },
    picture: pic("buet", "The West Palashy campus of BUET in Dhaka"),
    cta: { label: "Visit BASIS", href: "https://basis.org.bd/" },
  }),
  card("Services", {
    title: "Capital for new companies",
    meta: "$6m in the first half of 2026",
    text: "Startup funding fell to $6m in the first half of 2026, from $120m a year earlier. Founders need backers, and an early investor has few rivals.",
    source: { name: "Dhaka Tribune on LightCastle, 2026", url: "https://www.dhakatribune.com/business/416169/report-bangladesh-startup-funding-craters-95%25-to" },
    picture: pic("pathao", "A motorbike rider in Dhaka"),
    cta: { label: "Startup Bangladesh", href: "https://www.startupbangladesh.vc/" },
  }),
  card("Services", {
    title: "Hospitals at home",
    meta: "Nearly $5bn a year, estimated",
    text: "A hospital leader told a Dhaka Chamber seminar that Bangladeshis spend nearly $5bn a year on treatment abroad. Care built here can keep that money here.",
    source: { name: "UNB on the DCCI seminar", url: "https://unb.com.bd/category/Bangladesh/usd-5-billion-spent-abroad-annually-due-to-healthcare-gaps-in-bangladesh-dcci/175121" },
    picture: pic("dhaka-medical", "Mugda Medical College Hospital, Dhaka"),
  }),
  card("Services", {
    title: "Visitors still to come",
    meta: "585,145 in 2025",
    text: "That is all the foreign tourists who came in 2025, to a country with the Sundarbans, Cox's Bazar and Saint Martin's. A tourism master plan is under way.",
    source: { name: "Bonik Barta, September 2026", url: "https://en.bonikbarta.com/bangladesh/lGiJEN7oLhqpm991" },
    picture: pic("coral-st-martin", "The rocky coral shore of Saint Martin's Island"),
    cta: { label: "Visit the Tourism Board", href: "https://tourismboard.gov.bd/" },
  }),

  card("Land and sea", {
    title: "The deep-sea port",
    meta: "2.8m TEU planned",
    text: "Matarbari's planned capacity is 2.8 million twenty-foot containers a year. Warehouses, trucks and shipping services will be needed around it.",
    source: { name: "The Financial Express, April 2026", url: "https://today.thefinancialexpress.com.bd/print/deep-sea-port-to-increase-container-handling-of-ctg-port-to-6m-teus-1775319018" },
    picture: pic("sez", "The sea shore at the National Special Economic Zone in Mirsarai"),
    cta: { label: "Visit the Port Authority", href: "https://cpa.gov.bd/" },
  }),
  card("Land and sea", {
    title: "Fish and shrimp for export",
    meta: "$388.7m in FY2024-25",
    text: "Frozen fish and shrimp earned about $388.7m in FY2024-25, shrimp alone $296.29m, from one of the great delta fisheries of the world.",
    source: { name: "eFeedLink on Export Promotion Bureau data, October 2025", url: "https://www.efeedlink.com/contents/10-22-2025/38e5fa1e-5ede-4bda-85f9-2c3a20e30119-1202.html" },
    picture: pic("fish-market", "A fish seller's stall in Dhaka at night"),
  }),
  card("Land and sea", {
    title: "Food from three harvests",
    meta: "In the 2026 investor plan",
    text: "Agribusiness is among the priority sectors for foreign investment in the government's 2026 plan. Processing what the delta grows keeps more of its value at home.",
    source: PLAN,
    picture: pic("hemanta-harvest", "Farmers harvesting golden rice"),
    cta: INVEST,
  }),

  card("People and money", {
    title: "A route to Japan",
    meta: "100,000 people in five years",
    text: "Under a memorandum signed in May 2025, Japan plans to accept 100,000 Bangladeshis over the next five years, with training for the work.",
    source: { name: "Dhaka Tribune, May 2025", url: "https://www.dhakatribune.com/bangladesh/foreign-affairs/382562/dhaka-tokyo-ink-mous-to-develop-bangladeshi" },
    picture: pic("plane-biman", "A Biman Bangladesh plane on the runway at Dhaka"),
    cta: { label: "Expatriates' Ministry", href: "https://probashi.gov.bd/" },
  }),
  card("People and money", {
    title: "Money that could build",
    meta: "$35.56bn in FY2025-26",
    text: "Workers abroad sent home a record $35.56bn. Put into savings and small firms, it is capital the country already has.",
    source: { name: "Prothom Alo on Bangladesh Bank", url: "https://en.prothomalo.com/business/local/2m49au9o3r" },
    picture: pic("money-exchange", "Banknotes from many countries"),
  }),
  card("People and money", {
    title: "Businesses women lead",
    meta: "About 7.5% of rural firms",
    text: "Women own about 439,000 of the 5.8 million rural enterprises in Bangladesh. Few openings in the country are wider.",
    source: { name: "International Growth Centre", url: "https://www.theigc.org/blogs/gender-equality/progressing-female-labour-force-participation-bangladesh" },
    picture: { ...photo("handloom"), alt: "A woman spinning yarn at a wheel" },
  }),
  card("People and money", {
    title: "176 million customers",
    meta: "A market at home",
    text: "The population has reached about 176 million, most of them of working age: buyers for whatever is made here.",
    source: { name: "Prothom Alo", url: "https://en.prothomalo.com/bangladesh/gg11vmpobv" },
    picture: pic("dhaka-street", "Rickshaws, motorbikes and cars on a Dhaka street"),
  }),
  card("People and money", {
    title: "Where investors are wanted",
    meta: "180-day plan, March 2026",
    text: "A joint plan by BIDA, BEZA, PPPA and the Maheshkhali authority builds a pipeline of foreign investment in agribusiness, medicines, leather, textiles and IT.",
    source: PLAN,
    picture: pic("dhaka-air", "Dhaka from the air"),
    cta: INVEST,
  }),
];

export const OPPORTUNITIES: Block = {
  kind: "cards",
  id: "opportunities",
  tone: "paper",
  title: "Opportunities",
  lede: "Where Bangladesh can grow next, for anyone ready to build, invest or work here.",
  tabs: [...OPPORTUNITY_TABS],
  cards: CARDS,
  note: "Figures are as reported on the dates shown. Estimates and targets are the named source's, not forecasts by this site.",
};
