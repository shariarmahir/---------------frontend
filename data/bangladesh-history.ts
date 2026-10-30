/**
 * Chapter 1, "The country we love" (/bangladesh/history), in English: the
 * timeline, the divisions, nature, culture and the growth milestones. The
 * shared photo types are in data/bangladesh.ts.
 *
 * ── What is sourced, and how ─────────────────────────────────────────
 *
 *   Chart figures come from the World Bank API (data/bangladesh-growth.ts);
 *   the other figures name their source in `facts`. Dates in the timeline
 *   are long-established history. Figures with no source were left out
 *   rather than guessed, and contested ones (1971 casualty counts) are
 *   deliberately not stated as numbers. Quotations are single lines, in
 *   English translation.
 *
 *   Photographs are Wikimedia Commons files under CC BY / CC BY-SA / CC0
 *   / public domain, stored in /public/bangladesh with their credit in
 *   data/bangladesh-photos.ts and data/rural-life.ts; the credit is shown
 *   with the photo and again in the credits list.
 */

import type { Photo } from "./bangladesh";
import { commonsPhotos } from "./bangladesh-photos";
import { ruralStories } from "./rural-life";

/** A credited Commons photo by key, with its alt text in English (the stored alt is Bangla). */
function commons(key: string, alt: string): Photo {
  const p = commonsPhotos[key];
  if (!p?.credit) throw new Error(`Bangladesh history: no credited photo "${key}"`);
  return { ...p, alt };
}

/** A credited rural photo by id, with its alt text in English. */
function rural(id: string, alt: string): Photo {
  const p = ruralStories.find((s) => s.id === id)?.photo;
  if (!p?.credit) throw new Error(`Bangladesh history: no credited rural photo "${id}"`);
  return { ...p, alt };
}

export const P = {
  sundarbans: commons("sundarbans", "Rows of mangroves in the Sundarbans, with the river in front"),
  coxsbazar: commons("coxsbazar", "Sunset on the beach at Cox's Bazar, people reflected in the wet sand"),
  stmartin: commons("stmartin", "Coconut palms, flowers and blue sea on St Martin's Island"),
  bandarban: commons("bandarban", "Green hills of Bandarban wrapped in mist"),
  sajek: commons("sajek", "The sun low over the hills of Sajek Valley"),
  teagarden: commons("teagarden", "Rows of tea bushes and shade trees in a Sreemangal tea garden"),
  haor: commons("haor", "A houseboat on the wide waters of Tanguar Haor"),
  river: commons("river", "A boatman sails up the Padma river"),
  village: commons("village", "A ridge path winding through green paddy fields towards a village"),
  teesta: rural("teesta-fisher", "A fisher readies his net from a small boat on the Teesta in Rangpur"),
  mahasthan: commons("mahasthan", "The ancient walls of Mahasthangarh in Bogura"),
  mahasthanMounds: commons("mahasthan_b", "The old ramparts and mounds of Mahasthangarh"),
  mahasthanDig: commons("mahasthan_c", "Brick structures uncovered by excavation at Mahasthangarh"),
  paharpur: commons("paharpur", "Ruins of the Somapura Mahavihara at Paharpur"),
  paharpurAir: commons("paharpur_b", "The cross-shaped plan of the Somapura Mahavihara, seen from the air"),
  paharpurDusk: commons("paharpur_c", "The Paharpur monastery in silhouette at dusk"),
  sixtydome: commons("sixtydome", "The Sixty Dome Mosque in Bagerhat"),
  sixtydomeShade: commons("sixtydome_b", "The Sixty Dome Mosque in the shade of trees"),
  sixtydomePalms: commons("sixtydome_c", "The Sixty Dome Mosque behind a row of palm trees"),
  lalbagh: commons("lalbagh", "Lalbagh Fort and its gardens in Dhaka"),
  lalbaghWalls: commons("lalbagh_b", "The walls of Lalbagh Fort"),
  ahsanmanzil: commons("ahsanmanzil", "The pink Ahsan Manzil on the bank of the Buriganga"),
  ahsanmanzilLawn: commons("ahsanmanzil_b", "Ahsan Manzil seen across its green lawn"),
  ahsanmanzilCity: commons("ahsanmanzil_c", "Ahsan Manzil among the buildings of Old Dhaka"),
  shaheedminar: commons("shaheedminar", "The Central Shaheed Minar in Dhaka"),
  shaheedminarGrounds: commons("shaheedminar_b", "The grounds of the Central Shaheed Minar"),
  smritisoudho: commons("smritisoudho", "The National Martyrs' Memorial at Savar, ringed by green lawns"),
  smritisoudhoAir: commons("smritisoudho_b", "The National Martyrs' Memorial, its grounds and pool seen from the air"),
  surrender1971: commons("surrender1971", "A sculpture of the 1971 surrender at the Mujibnagar Memorial Complex"),
  /** Kandari's own picture, so it carries no credit. */
  crowd: { src: "/sections/Bangladesh.jpg", alt: "A crowd in a Dhaka street raises the red and green flag high" },
  padmabridge: commons("padmabridge", "The Padma Bridge stretching across the river"),
  boishakh: commons("boishakh", "Giant colourful masks in the Pahela Baishakh procession"),
  rickshaw: commons("rickshaw", "Rickshaws decorated with bright rickshaw art in Dhaka"),
} satisfies Record<string, Photo>;

/* ── History: eight eras ─────────────────────────────────────────────── */

export interface HistoryEra {
  id: string;
  number: string;
  era: string;
  years: string;
  title: string;
  /** One sentence set large: the era in a breath. */
  lede: string;
  paragraphs: string[];
  facts: { label: string; value: string }[];
  quote?: { text: string; by: string };
  /** What a visitor can still see today, and where. */
  today: string;
  /** Two or three photographs; the first leads. */
  photos: Photo[];
}

export const historyEras: HistoryEra[] = [
  {
    id: "pundranagar",
    number: "01",
    era: "Ancient Bengal",
    years: "3rd century BCE",
    title: "Pundranagar, the dawn of a civilisation",
    lede: "More than 2,500 years ago, on the silt of the Ganges and the Brahmaputra, a city grew, with trade and written history.",
    paragraphs: [
      "Mahasthangarh, on the bank of the Karatoya river in Bogura, holds the ruins of ancient Pundranagar. The Mahasthan Brahmi inscription found here is one of the oldest inscriptions found in the region; it records an order to help the people in a time of famine.",
      "At Wari-Bateshwar in Narsingdi, excavation has uncovered a fortified town, roads, coins and beads from distant lands: proof that this delta was linked to long-distance sea trade long ago.",
    ],
    facts: [
      { label: "Site", value: "Mahasthangarh, Bogura" },
      { label: "Oldest inscription", value: "Mahasthan Brahmi inscription" },
      { label: "A settlement of the same age", value: "Wari-Bateshwar, Narsingdi" },
    ],
    photos: [P.mahasthan, P.mahasthanMounds, P.mahasthanDig],
    today: "Walk through Mahasthangarh today and you see the old city walls, Gokul Medh and the Mahasthan museum, a short way north of Bogura town.",
  },
  {
    id: "pala",
    number: "02",
    era: "The Pala era",
    years: "8th to 12th century",
    title: "A light of learning: Somapura Mahavihara",
    lede: "The people of Bengal chose their own king, and those Pala kings made Bengal a centre of learning for Asia.",
    paragraphs: [
      "To end the anarchy of matsyanyaya, the chiefs elected Gopala king around 750 CE. His successor Dharmapala built the Somapura Mahavihara at Paharpur, one of the largest Buddhist monasteries south of the Himalayas, where students came from distant lands.",
      "In this age Atish Dipankar was born in Bikrampur, and carried his learning to Tibet. And the Charyapada, written by Buddhist mystics, is the oldest literary work in the Bangla language.",
    ],
    facts: [
      { label: "Founded", value: "Gopala, around 750 CE" },
      { label: "UNESCO World Heritage", value: "1985" },
      { label: "Oldest Bangla literature", value: "Charyapada" },
    ],
    photos: [P.paharpur, P.paharpurAir, P.paharpurDusk],
    today: "At Paharpur in Naogaon, the monastery's central temple, the rows of monks' cells around it and the terracotta plaques on its walls still stand; an archaeological museum is next door.",
  },
  {
    id: "sultanate",
    number: "03",
    era: "The Sultanate",
    years: "1352 to 1576",
    title: "One name for Bengal: Shah-i-Bangalah",
    lede: "For the first time every part of this land came under one rule, and its name became Bangalah.",
    paragraphs: [
      "In 1352 Shamsuddin Ilyas Shah united Lakhnauti, Satgaon and Sonargaon and took the title Shah-i-Bangalah. For almost two centuries the independent Bengal Sultanate was one of the richest kingdoms of the subcontinent, on its trade in muslin, rice and sugar.",
      "Under the patronage of the Hussain Shahi sultans, translations of the epics and the Mangalkavya were written in Bangla. In the south, Khan Jahan Ali built Khalifatabad, today's Bagerhat, whose Sixty Dome Mosque is a World Heritage site.",
    ],
    facts: [
      { label: "Unification", value: "1352, Ilyas Shah" },
      { label: "Golden age", value: "The Hussain Shahi period" },
      { label: "Architecture", value: "Sixty Dome Mosque, Bagerhat" },
    ],
    photos: [P.sixtydome, P.sixtydomeShade, P.sixtydomePalms],
    today: "In Bagerhat, the shrine of Khan Jahan Ali and many medieval mosques lie around the Sixty Dome Mosque; UNESCO calls it the Historic Mosque City of Bagerhat.",
  },
  {
    id: "mughal",
    number: "04",
    era: "The Mughal era",
    years: "1576 to 1757",
    title: "Jahangirnagar, the capital of muslin",
    lede: "Past the resistance of the Baro-Bhuiyans came Mughal rule, and Dhaka became a name in world trade.",
    paragraphs: [
      "The Mughals conquered Bengal, but the Baro-Bhuiyans, led by Isa Khan, fought on for many years. In 1610 Subahdar Islam Khan made Dhaka the capital of Bengal and named it Jahangirnagar.",
      "Dhaka's muslin was then so fine that its legend reached Europe. In 1678 work began on Lalbagh Fort; never finished, it is still the best-known face of Old Dhaka.",
    ],
    facts: [
      { label: "Resistance", value: "The Baro-Bhuiyans, Isa Khan" },
      { label: "Dhaka made the capital", value: "1610" },
      { label: "Lalbagh Fort", value: "Begun in 1678" },
    ],
    photos: [P.lalbagh, P.lalbaghWalls],
    today: "Lalbagh Fort in Old Dhaka holds the tomb of Pari Bibi, the audience hall and the hammam; nearby, the ruins of Bara Katra and Chhota Katra bear witness to Mughal Dhaka.",
  },
  {
    id: "british",
    number: "05",
    era: "British rule",
    years: "1757 to 1947",
    title: "From Plassey, two centuries of exploitation",
    lede: "Independence lost in one afternoon's battle took nearly two hundred years to win back.",
    paragraphs: [
      "On 23 June 1757, in the mango groves of Plassey, Nawab Siraj-ud-Daulah was defeated and the rule of Bengal passed to the East India Company. The famine of 1770, the Permanent Settlement and the cruelty of the indigo planters drained a prosperous Bengal.",
      "Still the people did not stop: the Indigo Revolt, the movement against the Partition of Bengal in 1905, and the founding of the University of Dhaka in 1921, which raised the next generation of leaders. The famine of 1943 took countless lives.",
    ],
    facts: [
      { label: "Battle of Plassey", value: "23 June 1757" },
      { label: "Partition of Bengal and its reversal", value: "1905 to 1911" },
      { label: "University of Dhaka", value: "1921" },
    ],
    photos: [P.ahsanmanzil, P.ahsanmanzilLawn, P.ahsanmanzilCity],
    today: "Ahsan Manzil, the pink palace of the Nawabs of Dhaka on the Buriganga, is now a museum; Curzon Hall and the University of Dhaka campus keep the architecture of that age.",
  },
  {
    id: "language",
    number: "06",
    era: "The Language Movement",
    years: "1948 to 1952",
    title: "Blood for the mother tongue",
    lede: "Very few nations on earth have given their blood for their own language. We are one of them.",
    paragraphs: [
      "In 1948 it was declared in Dhaka that Urdu alone would be the state language of Pakistan. Students protested that same day. Four years later, on 21 February 1952, a procession broke the ban under Section 144; outside Dhaka Medical College the police opened fire, and Salam, Barkat, Rafiq, Jabbar, Shafiur and others were martyred.",
      "Overnight the students built the first Shaheed Minar. In 1956 Bangla was recognised as a state language, and in 1999 UNESCO declared 21 February International Mother Language Day; today the whole world marks it.",
    ],
    facts: [
      { label: "Martyrs' Day", value: "21 February 1952" },
      { label: "Recognised as a state language", value: "1956" },
      { label: "International Mother Language Day", value: "1999" },
    ],
    quote: { text: "Ekushey February, reddened with my brothers' blood: can I ever forget it?", by: "Abdul Gaffar Choudhury" },
    photos: [P.shaheedminar, P.shaheedminarGrounds],
    today: "Every year, in the first hours of 21 February, people walk barefoot with flowers to the Central Shaheed Minar in the Prabhat Pheri; and all through February the Amar Ekushey Book Fair runs.",
  },
  {
    id: "liberation",
    number: "07",
    era: "The Liberation War",
    years: "1966 to 1971",
    title: "The nine-month Liberation War",
    lede: "From the Six Points to 26 March, a nation understood that there was no way but independence.",
    paragraphs: [
      "The Six Points of 1966, the mass uprising of 1969 and an outright majority in the 1970 election, and still power was not handed over. The speech of 7 March prepared the nation; after the genocide of Operation Searchlight on the black night of 25 March, independence was declared on 26 March.",
      "On 17 April the government in exile was formed at Mujibnagar. The freedom fighters fought in eleven sectors: farmers, students, workers, women and soldiers. Millions were forced to leave the country as refugees, and in village after village ordinary people gave shelter.",
    ],
    facts: [
      { label: "Independence declared", value: "26 March 1971" },
      { label: "Mujibnagar government", value: "17 April 1971" },
      { label: "Battlefronts", value: "11 sectors" },
    ],
    quote: {
      text: "The struggle this time is the struggle for our liberation; the struggle this time is the struggle for independence.",
      by: "Sheikh Mujibur Rahman, 7 March 1971",
    },
    photos: [P.smritisoudho, P.smritisoudhoAir],
    today: "The seven pairs of triangular walls of the National Martyrs' Memorial at Savar stand for seven stages of the struggle for independence, from 1952 to 1971; Mujibnagar in Meherpur and the Liberation War Museum in Dhaka keep the memory of those days.",
  },
  {
    id: "victory",
    number: "08",
    era: "Victory",
    years: "16 December 1971",
    title: "The victory of the red and green",
    lede: "A dawn bought with the blood of countless martyrs: Bangladesh was born on the map of the world.",
    paragraphs: [
      "Just two days before victory, on 14 December, the country's finest teachers, doctors, journalists and artists were taken away and killed: a last attempt to rob the nation of its minds. Two days later, on 16 December, the Pakistani army surrendered at the Racecourse Maidan in Dhaka.",
      "On 10 January 1972 Bangabandhu returned to an independent country; on 4 November 1972 the Constitution was adopted. A war-torn start with almost empty hands, and from there our journey forward began.",
    ],
    facts: [
      { label: "Martyred Intellectuals Day", value: "14 December" },
      { label: "Victory Day", value: "16 December 1971" },
      { label: "Constitution adopted", value: "4 November 1972" },
    ],
    photos: [P.surrender1971],
    today: "At Suhrawardy Udyan in Dhaka, where the surrender took place, the Independence Monument and the Eternal Flame now stand; at the Rayerbazar killing field the martyred intellectuals are remembered.",
  },
];

/* ── Divisions and the map ───────────────────────────────────────────── */

export interface Division {
  id: "dhaka" | "chattogram" | "rajshahi" | "khulna" | "barishal" | "sylhet" | "rangpur" | "mymensingh";
  name: string;
  districts: number;
  tagline: string;
  body: string;
  highlights: string[];
  photo: Photo;
}

export const divisions: Division[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    districts: 13,
    tagline: "The capital, its history and its tide of people",
    body: "A capital four hundred years old: Lalbagh Fort, Ahsan Manzil, the Shaheed Minar and Old Dhaka on the bank of the Buriganga.",
    highlights: ["Lalbagh Fort", "Ahsan Manzil", "Shaheed Minar", "National Martyrs' Memorial"],
    photo: P.lalbagh,
  },
  {
    id: "chattogram",
    name: "Chattogram",
    districts: 11,
    tagline: "Hills, sea and islands",
    body: "The long beach of Cox's Bazar, the coral island of St Martin's, the cloud-touching hills of Bandarban and Rangamati, and the country's main seaport.",
    highlights: ["Cox's Bazar", "St Martin's Island", "Sajek", "Kaptai Lake", "Bandarban"],
    photo: P.coxsbazar,
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    districts: 8,
    tagline: "Mangoes, silk and an ancient civilisation",
    body: "The Buddhist monastery of Paharpur, Pundranagar at Mahasthangarh, the red soil of the Barind and mango orchards along the Padma.",
    highlights: ["Paharpur", "Mahasthangarh", "Chars of the Padma", "Mango orchards"],
    photo: P.paharpur,
  },
  {
    id: "khulna",
    name: "Khulna",
    districts: 10,
    tagline: "The Sundarbans, land of the tiger",
    body: "The Sundarbans, the world's largest mangrove forest, the Royal Bengal tiger and the Sixty Dome Mosque of Bagerhat: two UNESCO World Heritage sites in one division.",
    highlights: ["Sundarbans", "Sixty Dome Mosque", "Royal Bengal tiger"],
    photo: P.sundarbans,
  },
  {
    id: "barishal",
    name: "Barishal",
    districts: 6,
    tagline: "Rivers, canals and floating markets",
    body: "The Venice of Bengal, laced with rivers and canals: floating guava markets, and the beach at Kuakata, where sunrise and sunset can be watched from the same spot.",
    highlights: ["Kuakata", "Floating guava market", "Kirtankhola river"],
    photo: P.river,
  },
  {
    id: "sylhet",
    name: "Sylhet",
    districts: 4,
    tagline: "Tea gardens, haors and swamp forest",
    body: "The rolling tea gardens of Sreemangal, the swamp forest of Ratargul, Tanguar Haor and the clear, stony river at Jaflong.",
    highlights: ["Sreemangal", "Ratargul", "Tanguar Haor", "Jaflong"],
    photo: P.teagarden,
  },
  {
    id: "rangpur",
    name: "Rangpur",
    districts: 8,
    tagline: "Bhawaiya songs and the chars of the Teesta",
    body: "The wide plains of the north: the chars of the Teesta, Bhawaiya songs, the Tajhat zamindar palace and the Kantajew Temple in Dinajpur.",
    highlights: ["Teesta", "Kantajew Temple", "Tajhat Palace", "Bhawaiya"],
    photo: P.teesta,
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    districts: 4,
    tagline: "The Brahmaputra, the Garo Hills and the old ballads",
    body: "The banks of the Old Brahmaputra, the foothills of the Garo Hills and the birthplace of the ballads of the Mymensingh Gitika.",
    highlights: ["Brahmaputra", "Garo Hills", "Mymensingh Gitika"],
    photo: P.village,
  },
];

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: "sea" | "forest" | "hill" | "heritage" | "water";
  photo: Photo;
}

export const landmarks: Landmark[] = [
  { id: "coxsbazar", name: "Cox's Bazar", lat: 21.43, lon: 91.98, kind: "sea", photo: P.coxsbazar },
  { id: "stmartin", name: "St Martin's Island", lat: 20.62, lon: 92.32, kind: "sea", photo: P.stmartin },
  { id: "sundarbans", name: "Sundarbans", lat: 21.95, lon: 89.18, kind: "forest", photo: P.sundarbans },
  { id: "sajek", name: "Sajek", lat: 23.38, lon: 92.29, kind: "hill", photo: P.sajek },
  { id: "bandarban", name: "Bandarban", lat: 22.19, lon: 92.22, kind: "hill", photo: P.bandarban },
  { id: "srimangal", name: "Sreemangal", lat: 24.31, lon: 91.73, kind: "forest", photo: P.teagarden },
  { id: "tanguar", name: "Tanguar Haor", lat: 25.15, lon: 91.07, kind: "water", photo: P.haor },
  { id: "paharpur", name: "Paharpur", lat: 25.03, lon: 88.98, kind: "heritage", photo: P.paharpur },
  { id: "bagerhat", name: "Sixty Dome Mosque", lat: 22.67, lon: 89.74, kind: "heritage", photo: P.sixtydome },
];

/* ── Nature ──────────────────────────────────────────────────────────── */

export interface NatureItem {
  id: string;
  title: string;
  /** Where, and any listing, in a few words. */
  place: string;
  body: string;
  photo: Photo;
  /** Width in the 12-column grid from lg: a lead card, its side card, a third, or the full row. */
  span: "lead" | "side" | "third" | "full";
}

export const nature: NatureItem[] = [
  { id: "sundarbans", title: "The Sundarbans", place: "Khulna · UNESCO World Heritage, 1997", body: "The world's largest mangrove forest: a forest that lives by the tides, home to the Royal Bengal tiger, the spotted deer and the honey gatherers.", photo: P.sundarbans, span: "lead" },
  { id: "cox", title: "Cox's Bazar", place: "Chattogram", body: "An unbroken stretch of sand: one of the longest natural sea beaches in the world.", photo: P.coxsbazar, span: "side" },
  { id: "hills", title: "Hills in the land of clouds", place: "Chittagong Hill Tracts", body: "The peaks of Bandarban, the clouds of Sajek and the many ways of life of the hill peoples.", photo: P.bandarban, span: "third" },
  { id: "tea", title: "Green waves of tea", place: "Sylhet", body: "Sreemangal, the tea capital, where a green carpet covers the low hills.", photo: P.teagarden, span: "third" },
  { id: "haor", title: "Tanguar Haor", place: "Sunamganj · Ramsar site", body: "In the monsoon a sheet of water as wide as the sea; in winter a gathering of migratory birds.", photo: P.haor, span: "third" },
  { id: "rivers", title: "Padma, Meghna, Jamuna", place: "A land of rivers", body: "A country woven from rivers: the National River Conservation Commission's draft list counts 907 of them. Boats, boatmen and Bhatiyali songs.", photo: P.river, span: "lead" },
  { id: "island", title: "St Martin's Island", place: "Bay of Bengal", body: "The country's only coral island: blue water and rows of coconut palms.", photo: P.stmartin, span: "side" },
  { id: "fields", title: "Green as far as the eye can see", place: "The plains", body: "Paddy fields to the horizon, the ridges between them, date palms and the evening sky: the village Bengal has always known.", photo: P.village, span: "full" },
];

/* ── Culture ─────────────────────────────────────────────────────────── */

/**
 * Bangladesh's inscriptions on UNESCO's Intangible Cultural Heritage list.
 * A tradition we have no photograph of gets its symbol on a plain field,
 * never a photograph of something else.
 */
export const unescoHeritage: { year: string; title: string; icon: string; photo?: Photo }[] = [
  { year: "2008", title: "Baul songs", icon: "music_note" },
  { year: "2013", title: "Jamdani weaving", icon: "apparel" },
  { year: "2016", title: "The Pahela Baishakh procession", icon: "celebration", photo: P.boishakh },
  { year: "2017", title: "Shital pati weaving of Sylhet", icon: "grid_on" },
  { year: "2023", title: "Rickshaws and rickshaw painting in Dhaka", icon: "palette", photo: P.rickshaw },
  { year: "2025", title: "Tangail saree weaving", icon: "apparel" },
];

export const cultureHighlights = [
  { icon: "celebration", title: "Pahela Baishakh", body: "The Bangla New Year: a festival for everyone, whatever their faith or background, with songs at dawn and colourful processions." },
  { icon: "menu_book", title: "Amar Ekushey Book Fair", body: "The Bangla Academy's book fair, all through February, in memory of the language martyrs." },
  { icon: "rowing", title: "Boat races", body: "Long, narrow boats racing on the monsoon rivers to the songs of their oarsmen." },
  { icon: "set_meal", title: "Hilsa and pitha", body: "Hilsa, the national fish; bhapa and chitoi pitha in winter, and payesh at Nabanna, the harvest festival." },
  { icon: "draw", title: "Nakshi kantha", body: "Stories stitched by village women with thread from old saris, as in Jasimuddin's Nakshi Kanthar Math." },
  { icon: "palette", title: "Rickshaw art", body: "A moving art gallery on Dhaka's streets: films, nature and dreams in bright colours." },
];

export const musicTraditions = [
  { name: "Baul and Lalon songs", body: "Songs of the body and of humanity, from wandering mystics with an ektara in hand." },
  { name: "Bhatiyali", body: "The boatman's full-throated song as he rows with the current." },
  { name: "Bhawaiya", body: "Songs of longing from the bullock-cart drivers of the north." },
  { name: "Rabindra and Nazrul Sangeet", body: "Thousands of songs by two poets: love, nature, rebellion and the country." },
  { name: "Jari, Sari and Pala songs", body: "Folk theatre of the village gathering, stories woven into song." },
];

/* ── Growth milestones, 1971 to 2026 ─────────────────────────────────── */

export const milestones = [
  { year: "1972", title: "The Constitution", body: "The Constitution of Bangladesh was adopted on 4 November." },
  { year: "1974", title: "A seat at the United Nations", body: "Bangladesh became a member of the United Nations on 17 September." },
  { year: "1999", title: "International Mother Language Day", body: "UNESCO declared 21 February a mother language day for the whole world." },
  { year: "2015", title: "Lower-middle income", body: "Bangladesh moved up to lower-middle income in the World Bank's classification." },
  { year: "2018", title: "The first satellite in space", body: "The country's first communications satellite was launched on 12 May." },
  { year: "2022", title: "The Padma Bridge", body: "The Padma Bridge, built with the country's own money, opened on 25 June." },
  { year: "2024", title: "The student-led uprising", body: "In July and August a movement of students and the public opened a new political chapter for the country." },
  { year: "2026", title: "Leaving the least developed list", body: "The date set for graduating from the UN's list of least developed countries is 24 November 2026; the government has asked for three years to prepare." },
];

/* ── Sources for the figures outside the World Bank charts ────────────── */

export const facts = [
  { label: "Number of rivers (907, draft list)", source: "National River Conservation Commission, via Prothom Alo", url: "https://en.prothomalo.com/environment/xyyqmcgwmo" },
  { label: "UNESCO Intangible Cultural Heritage", source: "UNESCO list, via Wikipedia", url: "https://en.wikipedia.org/wiki/List_of_Intangible_Cultural_Heritage_elements_in_Bangladesh" },
  { label: "Tangail saree, 2025", source: "The Daily Star", url: "https://www.thedailystar.net/news/bangladesh/diplomacy/news/tangail-saree-wins-unesco-heritage-status-4054876" },
  { label: "Graduation from the least developed list, 2026", source: "The Financial Express", url: "https://thefinancialexpress.com.bd/economy/ldc-graduation-deferral-decision-due-september" },
  { label: "Division boundaries on the map", source: "geoBoundaries (CC0)", url: "https://www.geoboundaries.org/" },
];
