/**
 * Facts about Bangladesh (/bangladesh/facts), on the topics of Facts about
 * Germany (tatsachen-ueber-deutschland.de), dressed like every other MOTHERLAND
 * page. Mahir, 2026-11-04: it must carry "Why we are the best" and "Why we are
 * not doing best", and every fact must be a real reality check.
 *
 * So each figure names its source, and each strength carries its limit and
 * each failing the reader's part in fixing it. Checked 4 November 2026. Where
 * sources differ the page says which figure it uses; when a number is updated
 * here, update its source and year with it.
 */
import { commons, type Picture } from "./motherland.ts";
import { pic } from "./motherland-blocks.ts";
import { photo, type QuizQuestion } from "./motherland-categories.ts";
import type { SearchEntry } from "../lib/motherland-facts-search.ts";

/** A photograph from public/motherland/more; a key that isn't there stops the build instead of leaving a blank card. */
function more(key: string, alt: string, focus?: string): Picture {
  const picture = pic(key, alt, focus);
  if (!picture) throw new Error(`MOTHERLAND: no photograph called ${key}`);
  return picture;
}

export const CHECKED = "4 November 2026";

export const FACTS_NAME = "Facts about Bangladesh";
export const FACTS_INTRO = "Bangladesh is easy to praise and easy to write off, and both are lazy. So here are two lists. One is what this country has done against the odds. The other is what it is still getting wrong. Every number names its source, every boast carries its limit, and every failing ends with your part in fixing it.";
export const FACTS_HERO: Picture = more("dhaka-air", "Dhaka from the air, a river running through the city");
export const BOTH_TRUE: Picture = photo("flag-mural");

export interface Source {
  name: string;
  url: string;
}

export interface Strength {
  id: string;
  figure: string;
  title: string;
  text: string;
  /** The honest limit on the boast. */
  check: string;
  source: Source;
  picture: Picture;
}

export interface Failing {
  id: string;
  figure: string;
  title: string;
  text: string;
  /** What one person can actually do about it. */
  yourPart: string;
  source: Source;
  picture: Picture;
}

export const BEST = {
  id: "why-we-are-the-best",
  title: "Why we are the best",
  lede: "Not a boast: where Bangladesh leads the world or beat the odds, and the limit on each.",
  items: [
    {
      id: "language",
      figure: "21 Feb",
      title: "The world keeps our language day",
      text: "Students died in Dhaka in 1952 defending Bangla. In 1999 UNESCO made the date International Mother Language Day, and the whole world now marks it.",
      check: "We gave our blood for this language, yet 51% of our children at late primary age are in learning poverty, the World Bank's measure of struggling to read a simple text.",
      source: { name: "World Bank Learning Poverty Brief, 2024", url: "https://documents1.worldbank.org/curated/en/099090524113159222/pdf/P17920914f1c370071b32417af49f33a784.pdf" },
      picture: photo("shaheed-minar"),
    },
    {
      id: "garments",
      figure: "No. 2",
      title: "We dress the world",
      text: "Bangladesh exported about $38.48 billion of clothing in 2024, 6.9% of the world's total. Among single countries, only China sells more.",
      check: "Our share slipped from 7.4% in 2023, while Vietnam grew 9.34% to reach 6.09%. Second place is not safe.",
      source: { name: "WTO data, via Prothom Alo", url: "https://en.prothomalo.com/business/local/mo5r8r5piq" },
      picture: photo("garments"),
    },
    {
      id: "remittance",
      figure: "$35.56bn",
      title: "Our workers abroad hold us up",
      text: "Remittances reached a record $35.56 billion in FY2025-26, up 17.3% in a year and sent home one family at a time.",
      check: "This is money earned by people who had to leave home to earn it. It does not replace good jobs here.",
      source: { name: "Bangladesh Bank, via The Financial Express", url: "https://thefinancialexpress.com.bd/economy/remittance-inflows-hit-historic-high-of-3556b-in-fy26" },
      picture: more("plane-biman", "A Biman airliner on the runway at Dhaka"),
    },
    {
      id: "poverty",
      figure: "18.7%",
      title: "We pulled millions out of poverty",
      text: "Poverty fell from 24.3% in 2016 to 18.7% in 2022, and extreme poverty from 12.9% to 5.6%.",
      check: "The same survey found inequality widening, and it is now four years old. Nearly one person in five was still poor.",
      source: { name: "BBS HIES 2022, via The Financial Express", url: "https://thefinancialexpress.com.bd/economy/bangladesh-sees-steep-decline-in-poverty-rate-amid-growing-income-inequality-bbs-report" },
      picture: photo("rice-planting"),
    },
    {
      id: "children",
      figure: "58 → 40",
      title: "More of our children live",
      text: "Deaths of children under five fell from 58 to 40 per 1,000 live births between 2013 and 2019.",
      check: "Forty per thousand still means one child in twenty-five. That is progress, not a finish line.",
      source: { name: "UNICEF Bangladesh programme document", url: "https://www.unicef.org/executiveboard/media/6941/file/2021-PL26-Bangladesh_CPD-EN-ODS.pdf" },
      picture: photo("children"),
    },
    {
      id: "fish",
      figure: "1.4m t",
      title: "Second-largest inland fishery",
      text: "We caught about 1.4 million tonnes from rivers and wetlands in 2024, second only to India. The fisheries minister says over 80% of the world's hilsa comes from our waters.",
      check: "This wealth depends on rivers we keep polluting. The 80% is a minister's figure, not one we could confirm independently.",
      source: { name: "FAO, via BSS", url: "https://www.bssnews.net/news/399916" },
      picture: photo("hilsa"),
    },
    {
      id: "padma",
      figure: "6.15 km",
      title: "We built the Padma Bridge",
      text: "A road and rail bridge across one of the world's most powerful rivers, opened in June 2022 and paid for from the country's own budget.",
      check: "We can build it, but paying for the next one is harder: tax brings in under 7% of GDP.",
      source: { name: "NBR, via The Financial Express", url: "https://thefinancialexpress.com.bd/economy/bangladesh/nbrs-fy25-tax-to-gdp-ratio-falls" },
      picture: photo("padma-bridge"),
    },
    {
      id: "peacekeepers",
      figure: "Top 4",
      title: "Our soldiers keep the peace",
      text: "A 2026 SIPRI report names Bangladesh among the leading troop contributors to peace operations worldwide, with Uganda, Nepal and India.",
      check: "Rankings move as missions close, and deployments worldwide are at their lowest in 25 years.",
      source: { name: "SIPRI 2026, via PW Only IAS", url: "https://pwonlyias.com/current-affairs/sipri-report-2026/" },
      picture: more("victory-day", "Bangladeshi soldiers marching on parade"),
    },
    {
      id: "rohingya",
      figure: "1m",
      title: "We opened the door",
      text: "One of the most crowded countries on Earth gave shelter to about a million Rohingya refugees fleeing Myanmar.",
      check: "It cannot last as it is. They still have no safe way home, and the burden falls hardest on Cox's Bazar.",
      source: { name: "Al Jazeera", url: "https://www.aljazeera.com/news/2024/8/18/bangladeshs-yunus-promises-support-to-rohingya-in-first-policy-speech" },
      picture: photo("coxs-bazar"),
    },
  ] satisfies Strength[],
};

export const NOT_BEST = {
  id: "why-we-are-not-doing-best",
  title: "Why we are not doing best",
  lede: "A country that loves itself tells itself the truth. These numbers are ours too.",
  items: [
    {
      id: "corruption",
      figure: "24/100",
      title: "Corruption takes what we build",
      text: "On Transparency International's 2025 index, Bangladesh scored 24 out of 100 and ranked 150th of 182 countries, its second-lowest score in 14 years.",
      yourPart: "Don't pay the extra fee, and ask for the receipt. Report it to the Anti-Corruption Commission on 106.",
      source: { name: "Transparency International, via Prothom Alo", url: "https://en.prothomalo.com/bangladesh/a6tuey7qzy" },
      picture: more("taka-small", "Hands holding a fan of taka notes"),
    },
    {
      id: "air",
      figure: "13×",
      title: "The second-worst air in the world",
      text: "Bangladesh's PM2.5 averaged 66.1 µg/m³ in 2025, more than 13 times the WHO guideline. Only Pakistan's was worse.",
      yourPart: "Stop burning waste, and press your ward councillor about the kiln or the dump you can see from home.",
      source: { name: "IQAir 2025, via Asia News Network", url: "https://asianews.network/bangladeshs-air-is-worlds-2nd-worst" },
      picture: more("plastic-river", "Smog hanging over a factory shore and a river"),
    },
    {
      id: "loans",
      figure: "30.6%",
      title: "A third of bank loans gone bad",
      text: "Defaulted loans were 30.6% of all loans in December 2025, after a record 35.73% that September.",
      yourPart: "These are people's savings. Ask your bank about its health, and ask your MP who is being let off.",
      source: { name: "Bangladesh Bank, via UNB", url: "https://unb.com.bd/category/Business/classified-loans-in-bangladesh-drop-by-tk-87298-crore-in-q4-2025/180702" },
      picture: more("atm-bd", "A hand pressing the keys of a cash machine"),
    },
    {
      id: "tax",
      figure: "6.7%",
      title: "We don't pay for our own country",
      text: "The National Board of Revenue collected about 6.7% of GDP in FY2024-25, down from 7.39%. It is among the lowest rates in the world, and estimates run from 6.6% to 6.9%.",
      yourPart: "If you earn above the limit, file a return. Schools and hospitals are paid for with this money.",
      source: { name: "NBR, via The Financial Express", url: "https://thefinancialexpress.com.bd/economy/bangladesh/nbrs-fy25-tax-to-gdp-ratio-falls" },
      picture: more("dhaka-medical", "A public medical college hospital in Dhaka"),
    },
    {
      id: "learning",
      figure: "51%",
      title: "Half our children struggle to read",
      text: "51% of children at late primary age are in learning poverty, on the latest data, taken during the Covid school closures. They are in school but not learning enough.",
      yourPart: "Read with a child for ten minutes tonight. Ask the school what they can read, not just what they scored.",
      source: { name: "World Bank Learning Poverty Brief, 2024", url: "https://documents1.worldbank.org/curated/en/099090524113159222/pdf/P17920914f1c370071b32417af49f33a784.pdf" },
      picture: more("girl-books", "A girl in a red dress holding her schoolbooks in a green field"),
    },
    {
      id: "neet",
      figure: "22.1%",
      title: "Too many young women are shut out",
      text: "22.1% of women aged 15 to 29 are not in work, education or training, against 15.4% of men. Our young people are our biggest asset, and we are wasting them.",
      yourPart: "Back a daughter's or a sister's course or first job. Ask employers why they don't hire her.",
      source: { name: "BBS Labour Force Survey 2023, via TBS", url: "https://www.tbsnews.net/bangladesh/194-million-youth-unemployed-bbs-survey-1025001" },
      picture: more("garment-floor", "Workers on a garment factory floor"),
    },
    {
      id: "press",
      figure: "152/180",
      title: "We don't protect the truth-tellers",
      text: "Reporters Without Borders ranked Bangladesh 152nd of 180 countries for press freedom in 2026, down three places in a year.",
      yourPart: "Pay for journalism you trust, and share what has been checked rather than what makes you angry.",
      source: { name: "RSF 2026, via Dhaka Tribune", url: "https://www.dhakatribune.com/bangladesh/409086/rsf-bangladesh-ranks-152nd-in-2026-press-freedom" },
      picture: more("old-pages", "Bundles of old papers tied with string"),
    },
    {
      id: "roads",
      figure: "5×",
      title: "We can't count our road deaths",
      text: "Police and BRTA records show 5,000 to 6,000 deaths a year. A government survey found 24,233, and the WHO estimates over 31,000. Nobody knows, and that is the point.",
      yourPart: "Wear the helmet and the belt, and don't ride with a driver who is racing.",
      source: { name: "The Daily Star", url: "https://www.thedailystar.net/news/bangladesh/accidents-fires/news/66-die-injuries-roads-day-4014991" },
      picture: more("dhaka-street", "Motorbikes, cars and rickshaws sharing a Dhaka street"),
    },
  ] satisfies Failing[],
};

/** The sections the bar names, in the order the page reads. */
export const FACT_NAV = [
  { id: BEST.id, label: BEST.title },
  { id: NOT_BEST.id, label: NOT_BEST.title },
  { id: "both-sides", label: "Both sides" },
  { id: "government", label: "Government" },
  { id: "divisions", label: "Divisions" },
  { id: "schools", label: "Schools" },
  { id: "peace", label: "Peace" },
  { id: "research", label: "Research" },
];

/** One subject from both lists: each pair comes from the facts themselves, and adds no new figure. */
export const BOTH_SIDES = {
  id: "both-sides",
  title: "Both sides of the same country",
  lede: "Choose a subject and read the proud number beside the hard one.",
  pairs: [
    { subject: "Language", best: "language", hard: "learning", line: "We gave our blood for this language, and half our children at late primary age struggle to read." },
    { subject: "Money", best: "remittance", hard: "loans", line: "Workers abroad send home a record sum, while almost a third of bank loans have gone bad." },
    { subject: "Building", best: "padma", hard: "tax", line: "We paid for the bridge from our own budget, and tax brings in under 7% of GDP to pay for the next." },
    { subject: "Work", best: "garments", hard: "neet", line: "We dress the world, and more than one young woman in five is out of work, school and training." },
    { subject: "Land and air", best: "fish", hard: "air", line: "The rivers feed us, and the air we breathe is the second-worst on Earth." },
    { subject: "Lives", best: "children", hard: "roads", line: "More of our children live past five, and nobody can say how many die on our roads." },
  ],
};

export const GLANCE = {
  id: "at-a-glance",
  facts: [
    { label: "People (Census 2022)", value: "169.8 million" },
    { label: "People per km²", value: "About 1,150" },
    { label: "Live in villages", value: "About 68%" },
    { label: "Can read and write", value: "74.8%" },
    { label: "Divisions and districts", value: "8 and 64" },
    { label: "Independence", value: "26 March 1971" },
  ],
  source: { name: "BBS Census 2022, via Wikipedia", url: "https://en.wikipedia.org/wiki/2022_Bangladeshi_census" } satisfies Source,
};

export interface LinkCard {
  title: string;
  text: string;
  href: string;
  picture: Picture;
}

export const GOVERNMENT = {
  id: "government",
  title: "Government and parliament",
  text: "Bangladesh is a unitary parliamentary republic under the Constitution of 1972. Learn how Parliament, the President, the Prime Minister and the courts share power, and how to reach them.",
  cards: [
    { title: "The three branches", text: "How do Parliament, the government and the courts share power?", href: "/bangladesh/government/branches-of-government", picture: photo("parliament") },
    { title: "President and Prime Minister", text: "What does each of them do, and who chooses them?", href: "/bangladesh/government/president-and-prime-minister", picture: photo("flag-mural") },
    { title: "Voting and your NID", text: "How do I vote and get my national ID card?", href: "/bangladesh/government/voting-and-elections", picture: more("statue-aparajeyo", "The Aparajeyo Bangla statue at the University of Dhaka") },
    { title: "District and union", text: "Who runs my district, my upazila and my union?", href: "/bangladesh/government/local-government", picture: commons("village", "A path winding through green paddy fields to a village") },
    { title: "The courts", text: "How do the courts work, from the lowest to the highest?", href: "/bangladesh/government/courts", picture: photo("lalbagh-fort") },
    { title: "Laws and legal aid", text: "Where can I read the law and get help with a case?", href: "/bangladesh/government/laws-and-legal-aid", picture: photo("shaheed-minar") },
  ] satisfies LinkCard[],
};

export const DIVISIONS_TITLE = "The 8 divisions";

export const SCHOOLS = {
  id: "schools",
  title: "Schools and universities",
  text: "Primary school is free and compulsory, and every pupil gets free textbooks. The harder job is making sure they learn.",
  href: "/bangladesh/government/education",
  picture: more("campus-green", "A green university campus in Bangladesh"),
  links: [
    { label: "Admissions and free textbooks", href: "/bangladesh/government/education" },
    { label: "Check your exam results", href: "/bangladesh/government/exam-results" },
    { label: "Stipends for poorer families", href: "/bangladesh/government/education-stipends" },
  ],
};

export const PEACE = {
  id: "peace",
  title: "Peace and security",
  text: "Bangladesh sends its soldiers to keep the peace abroad and shelters those who flee war next door. At home, its people call 999 in an emergency and 333 for help from the state.",
  href: "/bangladesh/government/disasters-and-emergencies",
  picture: photo("martyrs-memorial"),
  links: [
    { label: "How does Bangladesh help keep world peace?", href: "#peacekeepers" },
    { label: "Why does Bangladesh shelter the Rohingya?", href: "#rohingya" },
    { label: "Who do I call in an emergency?", href: "/bangladesh/government/disasters-and-emergencies" },
  ],
};

export const RESEARCH = {
  id: "research",
  title: "Research and innovation",
  text: "Rice that survives the flood, money on every phone and a physics paper written in Dhaka that named the boson: this delta has always solved its own problems.",
  cards: [
    { title: "Rice that feeds millions", text: "Varieties bred here to survive flood and salt.", href: "/bangladesh/science-tech#science-for-daily-life", picture: photo("rice-planting") },
    { title: "Money on every phone", text: "How mobile banking reached the village.", href: "/bangladesh/science-tech#science-for-daily-life", picture: photo("mobile-money") },
    { title: "Engineering the delta", text: "Bridges, metro and rail across moving rivers.", href: "/bangladesh/science-tech#engineering-the-delta", picture: photo("metro-rail") },
    { title: "The minds of Bengali science", text: "From the paper that named the boson onward.", href: "/bangladesh/science-tech#minds-of-science", picture: { ...photo("snbose"), focus: "50% 20%" } },
  ] satisfies LinkCard[],
};

export interface Topic {
  title: string;
  text: string;
  href: string;
  picture: Picture;
}

/** Facts about Germany's fourteen topics, each answered for Bangladesh, after the two that had to come first. */
export const FACT_TOPICS: Topic[] = [
  { title: "Why we are the best", text: "Nine places where we lead or beat the odds, each with its limit.", href: `#${BEST.id}`, picture: photo("padma-bridge") },
  { title: "Why we are not doing best", text: "Eight hard numbers, and your part in changing them.", href: `#${NOT_BEST.id}`, picture: photo("flag-mural") },
  { title: "Bangladesh at a glance", text: "The country's people, land and history in six figures.", href: `#${GLANCE.id}`, picture: photo("children") },
  { title: "Bangladesh and the world", text: "Clothes, soldiers and a language day the whole world keeps.", href: "#garments", picture: photo("shaheed-minar") },
  { title: "Political system", text: "A parliamentary republic of three branches, from Parliament to the Union Parishad.", href: `#${GOVERNMENT.id}`, picture: photo("parliament") },
  { title: "Working in Bangladesh", text: "Garments, farms and small loans, and who gets left out.", href: "/bangladesh/invest#market-data", picture: photo("garments") },
  { title: "Schools and universities", text: "Free textbooks, full classrooms and the problem of learning.", href: `#${SCHOOLS.id}`, picture: photo("handloom") },
  { title: "Research and innovation", text: "From rice varieties to the boson.", href: `#${RESEARCH.id}`, picture: photo("rice-planting") },
  { title: "Peace and security", text: "Peacekeepers abroad, refugees sheltered and help on 999 at home.", href: `#${PEACE.id}`, picture: photo("martyrs-memorial") },
  { title: "Climate and energy", text: "Living with cyclones and floods on a low delta.", href: "/bangladesh/government/disasters-and-emergencies", picture: photo("mangroves") },
  { title: "Media and communication", text: "A country of phones, and a press that is not free enough.", href: "#press", picture: photo("mobile-money") },
  { title: "Migration and remittances", text: "The workers abroad who hold the country up, and how they are supported.", href: "/bangladesh/government/migrant-workers", picture: photo("fisher-mist") },
  { title: "Environment", text: "The Sundarbans, the haors, and the air we have to clean up.", href: "/bangladesh/nature", picture: photo("sunamganj-haor") },
  { title: "Global trade partner", text: "How to trade with and invest in Bangladesh.", href: "/bangladesh/government/business-and-trade", picture: photo("taka-notes") },
  { title: "Culture and art", text: "Baul songs, Jamdani and rickshaw painting, listed by UNESCO.", href: "/bangladesh/culture", picture: photo("rickshaw-art") },
  { title: "Living in Bangladesh", text: "Eight divisions, and where to go first.", href: "/bangladesh/travel", picture: photo("srimangal-tea") },
];

/** A short quiz from the page's own figures, as every MOTHERLAND page closes with. */
export const FACTS_QUIZ: QuizQuestion[] = [
  { question: "Where does Bangladesh rank among single countries for clothing exports?", options: ["First", "Second", "Fifth"], answer: 1, why: "It sold about $38.48 billion in 2024, 6.9% of the world's total. Only China sells more." },
  { question: "How far over the WHO's air guideline was Bangladesh's PM2.5 in 2025?", options: ["Twice", "Five times", "More than 13 times"], answer: 2, why: "It averaged 66.1 µg/m³, the second-worst in the world after Pakistan." },
  { question: "Who paid for the Padma Bridge?", options: ["The country's own budget", "A foreign bank", "A private company"], answer: 0, why: "It opened in June 2022, paid for from Bangladesh's own budget." },
  { question: "What share of children at late primary age are in learning poverty?", options: ["11%", "28%", "51%"], answer: 2, why: "That is the World Bank's latest figure, taken during the Covid school closures." },
];

/** Everything the bar can find: each fact, then each card that leads somewhere. */
export const FACT_INDEX: SearchEntry<Picture>[] = [
  ...BEST.items.map((f) => ({ title: f.title, text: `${f.text} ${f.check}`, figure: f.figure, group: BEST.title, href: `#${f.id}`, picture: f.picture })),
  ...NOT_BEST.items.map((f) => ({ title: f.title, text: `${f.text} ${f.yourPart}`, figure: f.figure, group: NOT_BEST.title, href: `#${f.id}`, picture: f.picture })),
  ...GOVERNMENT.cards.map((c) => ({ ...c, group: GOVERNMENT.title })),
  ...RESEARCH.cards.map((c) => ({ ...c, group: RESEARCH.title })),
  ...FACT_TOPICS.map((t) => ({ ...t, group: "Topics" })),
];

/** Every source on the page, once, for its closing list. */
export const FACT_SOURCES: Source[] = [...new Map([...BEST.items, ...NOT_BEST.items].map((f) => f.source).concat(GLANCE.source).map((s) => [s.url, s])).values()];

export const factsCredits = () => {
  const seen = new Set<string>();
  const pictures: { label: string; picture: Picture }[] = [
    { label: FACTS_NAME, picture: FACTS_HERO },
    ...[...BEST.items, ...NOT_BEST.items].map((f) => ({ label: f.title, picture: f.picture })),
    { label: "Both lists are true", picture: BOTH_TRUE },
    { label: SCHOOLS.title, picture: SCHOOLS.picture },
    { label: PEACE.title, picture: PEACE.picture },
    ...FACT_TOPICS.map((t) => ({ label: t.title, picture: t.picture })),
    ...GOVERNMENT.cards.map((c) => ({ label: c.title, picture: c.picture })),
    ...RESEARCH.cards.map((c) => ({ label: c.title, picture: c.picture })),
  ];
  return pictures.filter(({ picture }) => !seen.has(picture.src) && !!seen.add(picture.src)).map(({ label, picture }) => ({ label, credit: picture.credit }));
};
