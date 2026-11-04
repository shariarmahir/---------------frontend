/**
 * Geography & Travel (/bangladesh/travel): the places on the map, the
 * must-see lists, the terrain guides and the story contest. Mahir,
 * 2026-11-04: geography is how the world learns this country.
 *
 * Access rules change, so each is dated and sourced, and the hills especially
 * can close at a day's notice: the page says to check before leaving. Facts
 * were checked on 4 November 2026. Coordinates are approximate, good enough to
 * navigate to the area.
 */
import { commons, type Picture } from "./motherland.ts";
import { photo } from "./motherland-categories.ts";
import { BANDARBAN_CLOUDS, STORIES_FILM } from "./motherland-deep.ts";
import { PLACE_CREDITS } from "./motherland-places-credits.ts";
import type { CrowdPlace } from "../lib/motherland-crowd.ts";

const FULL_SIZE_IDS = ["kantajew", "nafakhum", "nijhum-dwip", "paharpur", "panam-nagar", "puthia", "st-martin"];

export const TRAVEL_CHECKED = "4 November 2026";

export type Terrain = "hills" | "sylhet" | "plains" | "char" | "sea" | "rivers";
export type PlaceKind = "antique" | "gem" | "classic";

export interface MapPlace extends CrowdPlace {
  id: string;
  name: string;
  district: string;
  terrain: Terrain;
  kind: PlaceKind;
  /** When it was built, for the antique places. */
  era?: string;
  lat: number;
  lon: number;
  text: string;
  picture: Picture;
}

function local(file: string, alt: string, focus?: string): Picture {
  const c = PLACE_CREDITS[file];
  if (!c) throw new Error(`MOTHERLAND: no credit for places/${file}`);
  return { src: `/motherland/places/${file}.jpg`, alt, focus, credit: { author: c.author, source: "Wikimedia Commons", sourceUrl: c.sourceUrl, license: c.license, licenseUrl: c.licenseUrl } };
}

const COOL = [11, 12, 1, 2];
const COOL_DRY = [10, 11, 12, 1, 2, 3];

const LISTED: MapPlace[] = [
  /* ── Very old, and barely visited ──────────────────────────────────── */
  { id: "wari-bateshwar", name: "Wari-Bateshwar", district: "Narsingdi", terrain: "plains", kind: "antique", era: "About 450 BCE", fame: 1, best: COOL_DRY, lat: 24.087, lon: 90.826, text: "A fortified trading town, dated by its excavators to about 450 BCE, in the middle of today's farm fields. A schoolteacher first noticed the beads and coins that farmers kept turning up. Today a small museum stands among the villagers' homes.", picture: local("wari-bateshwar", "A thatched hut in the green grounds of the museum at Wari-Bateshwar") },
  { id: "shalban-vihara", name: "Shalban Vihara", district: "Cumilla", terrain: "plains", kind: "antique", era: "7th to 8th century", fame: 2, best: COOL_DRY, lat: 23.426, lon: 91.135, text: "A square Buddhist monastery of 115 cells on the Mainamati ridge, its central shrine still standing in brick. The museum beside it holds terracotta plaques and bronzes dug from these hills.", picture: local("shalban-vihara", "The brick walls of Shalban Vihara on a green lawn") },
  { id: "bagha-mosque", name: "Bagha Mosque", district: "Rajshahi", terrain: "plains", kind: "antique", era: "1523", fame: 1, best: COOL_DRY, lat: 24.191, lon: 88.838, text: "Sultan Nusrat Shah raised this mosque in 1523, with ten domes and walls so thick with terracotta flowers that they read like embroidery in brick.", picture: local("bagha-mosque", "The terracotta walls and domes of the Bagha Mosque") },
  { id: "choto-sona", name: "Choto Sona Mosque", district: "Chapainawabganj", terrain: "plains", kind: "antique", era: "About 1500", fame: 1, best: COOL_DRY, lat: 24.842, lon: 88.14, text: "The Gem of Gaur, built of dark stone under Sultan Alauddin Husain Shah on the far western edge of the country. Its domes were once gilded. In its grounds lies Bir Sreshtho Captain Mohiuddin Jahangir, a hero of 1971.", picture: local("choto-sona", "The many-domed stone Choto Sona Mosque in its open courtyard") },
  { id: "kusumba", name: "Kusumba Mosque", district: "Naogaon", terrain: "plains", kind: "antique", era: "1558", fame: 1, best: COOL_DRY, lat: 24.766, lon: 88.695, text: "Black stone from 1558, beside a huge old tank, and pictured on the five-taka note. Most Bangladeshis have carried this mosque in their pocket without ever seeing it.", picture: local("kusumba", "Kusumba Mosque seen beneath a large old tree") },
  { id: "atia-mosque", name: "Atia Mosque", district: "Tangail", terrain: "plains", kind: "antique", era: "1609", fame: 1, best: COOL_DRY, lat: 24.182, lon: 89.955, text: "A single small dome and four corner towers, built in 1609, where Sultanate and Mughal styles meet in one wall of terracotta. It once appeared on the ten-taka note.", picture: local("atia-mosque", "The domed brick Atia Mosque under a clear blue sky") },
  { id: "kantajew", name: "Kantajew Temple", district: "Dinajpur", terrain: "plains", kind: "antique", era: "Finished 1722", fame: 2, best: COOL_DRY, lat: 25.79, lon: 88.668, text: "Every surface of this temple is fired clay: thousands of panels telling the Ramayana, the Mahabharata and daily Bengali life. It had nine spires until the earthquake of 1897.", picture: local("kantajew", "Close view of the carved terracotta panels on Kantajew Temple") },
  { id: "puthia", name: "Puthia Temples", district: "Rajshahi", terrain: "plains", kind: "antique", era: "18th to 19th century", fame: 1, best: COOL_DRY, lat: 24.365, lon: 88.835, text: "A cluster of old Hindu temples and a royal palace around green ponds. Few visitors come, so you may have a Shiva temple's reflection all to yourself.", picture: local("puthia", "The white Shiva temple at Puthia reflected in a lake") },
  { id: "baliati", name: "Baliati Palace", district: "Manikganj", terrain: "plains", kind: "antique", era: "19th century", fame: 1, best: COOL_DRY, lat: 23.925, lon: 90.183, text: "The zamindars of Baliati built this block of palaces close enough to Dhaka for a day trip. Trees now grow from walls that once held chandeliers.", picture: local("baliati", "A weathered red-brick block of Baliati Palace against a blue sky") },
  { id: "panam-nagar", name: "Panam Nagar", district: "Narayanganj", terrain: "plains", kind: "antique", era: "Late 19th century", fame: 2, best: COOL_DRY, lat: 23.647, lon: 90.598, text: "One narrow street of merchant mansions in old Sonargaon, uninhabited since the people left after 1947. The World Monuments Fund listed it among the world's most endangered sites. Walk it slowly, and stay out of unsafe buildings.", picture: local("panam-nagar", "Crumbling merchant mansions along the street of Panam Nagar") },
  { id: "tajhat", name: "Tajhat Palace", district: "Rangpur", terrain: "plains", kind: "antique", era: "Early 20th century", fame: 1, best: COOL_DRY, lat: 25.727, lon: 89.249, text: "A white palace with a grand marble stair, built for a maharaja whose family began as jewellers, far up in the northern plains. It now houses the Rangpur Museum.", picture: local("tajhat", "The white front and grand staircase of Tajhat Palace") },

  /* ── Hidden nature ─────────────────────────────────────────────────── */
  { id: "nafakhum", name: "Nafakhum", district: "Bandarban", terrain: "hills", kind: "gem", fame: 1, best: [8, 9, 10, 11], lat: 21.72, lon: 92.53, text: "A wide waterfall on the Sangu river, far from any road and reached by boat and on foot through Marma villages. Access rules change often, and a registered guide is required.", picture: local("nafakhum", "Nafakhum waterfall pouring into a green river gorge") },
  { id: "birishiri", name: "Birishiri", district: "Netrokona", terrain: "plains", kind: "gem", fame: 1, best: COOL, lat: 25.13, lon: 90.68, text: "White and pink china-clay hills and impossibly green pools, by the Someshwari river on the Indian border. It is the home of the Garo and Hajong peoples.", picture: local("birishiri", "Pink clay cliffs rising beside a turquoise pool at Birishiri") },
  { id: "hakaluki", name: "Hakaluki Haor", district: "Moulvibazar", terrain: "sylhet", kind: "gem", fame: 1, best: [12, 1, 2, 7, 8, 9], lat: 24.65, lon: 92.04, text: "One of the country's largest wetlands, a sea in the monsoon and a meeting ground for migratory birds in winter. In the wet months a lone tree can stand in open water to the horizon.", picture: local("hakaluki", "A lone tree standing in the still water of Hakaluki Haor") },
  { id: "bichanakandi", name: "Bichanakandi", district: "Sylhet", terrain: "sylhet", kind: "gem", fame: 2, best: [6, 7, 8, 9, 10], lat: 25.19, lon: 91.9, text: "Boats cross wetlands to a stony river running out of the Meghalaya hills, the mountains in another country and the water in yours. Stay out of the current after heavy rain.", picture: local("bichanakandi", "A small boat on still water under misty Meghalaya hills at Bichanakandi") },
  { id: "floating-market", name: "Bhimruli Floating Market", district: "Jhalokathi", terrain: "rivers", kind: "gem", fame: 1, best: [7, 8, 9], lat: 22.73, lon: 90.11, text: "Guava farmers sell from their boats on a green canal, and buyers load straight from hull to hull. It runs best in the monsoon months, early in the day.", picture: local("floating-market", "Boats laden with guavas crowding a palm-lined canal at Bhimruli") },
  { id: "nijhum-dwip", name: "Nijhum Dwip", district: "Noakhali", terrain: "char", kind: "gem", fame: 1, best: COOL, lat: 22.05, lon: 90.98, text: "A national park since 2001 on a young island in the Meghna's mouth, where spotted deer walk the mudflats in the dark mangrove. Tides can cut paths; numbers of deer have fallen, so keep your distance.", picture: local("nijhum-dwip", "Spotted deer among the mangrove roots of Nijhum Dwip") },

  /* ── The ones everyone should see ──────────────────────────────────── */
  { id: "sixty-dome", name: "Sixty Dome Mosque", district: "Bagerhat", terrain: "plains", kind: "classic", era: "15th century", fame: 3, best: COOL_DRY, lat: 22.674, lon: 89.742, text: "Khan Jahan Ali's great mosque, at the heart of a UNESCO-listed city of mosques and tanks.", picture: photo("sixty-dome-mosque") },
  { id: "paharpur", name: "Paharpur", district: "Naogaon", terrain: "plains", kind: "classic", era: "8th century", fame: 2, best: COOL_DRY, lat: 25.031, lon: 88.977, text: "Somapura Mahavihara, one of the great Buddhist monasteries south of the Himalayas and a World Heritage Site.", picture: photo("paharpur_b") },
  { id: "mahasthan", name: "Mahasthangarh", district: "Bogura", terrain: "plains", kind: "classic", era: "3rd century BCE", fame: 2, best: COOL_DRY, lat: 24.961, lon: 89.345, text: "Ancient Pundranagara, a walled city more than two thousand years old.", picture: commons("mahasthan", "The brick ruins of Mahasthangarh in Bogura") },
  { id: "lalbagh", name: "Lalbagh Fort", district: "Dhaka", terrain: "plains", kind: "classic", era: "1678", fame: 3, best: COOL_DRY, lat: 23.719, lon: 90.388, text: "A Mughal fort begun in 1678 and never finished, with gardens in the heart of Old Dhaka.", picture: photo("lalbagh-fort") },
  { id: "sundarbans", name: "The Sundarbans", district: "Khulna", terrain: "rivers", kind: "classic", fame: 3, best: [9, 10, 11, 12, 1, 2, 3], closed: [6, 7, 8], lat: 21.95, lon: 89.18, text: "One of the largest mangrove forests on Earth and home of the Bengal tiger. Forest Department permits are required, and it closes to all visitors from 1 June to 31 August every year.", picture: photo("mangroves") },
  { id: "coxs-bazar", name: "Cox's Bazar", district: "Cox's Bazar", terrain: "sea", kind: "classic", fame: 3, best: COOL_DRY, lat: 21.427, lon: 92.006, text: "Some 120 km of unbroken natural sea beach, among the longest on Earth.", picture: photo("coxs-bazar") },
  { id: "st-martin", name: "St Martin's Island", district: "Cox's Bazar", terrain: "sea", kind: "classic", fame: 3, best: [12, 1, 2], closed: [4, 5, 6, 7, 8, 9, 10], lat: 20.627, lon: 92.323, text: "The only coral island of Bangladesh. Open 1 November to 15 March for at most 3,500 visitors a day; November is day trips only, nights are allowed in December and January. You need a travel pass, and pay a Tk 100 conservation fee.", picture: commons("stmartin", "Palm trees above the beach on St Martin's Island") },
  { id: "kuakata", name: "Kuakata", district: "Patuakhali", terrain: "sea", kind: "classic", fame: 2, best: COOL_DRY, lat: 21.817, lon: 90.121, text: "A rare beach where you can watch the sun both rise and set over the sea.", picture: photo("kuakata") },
  { id: "sajek", name: "Sajek Valley", district: "Rangamati", terrain: "hills", kind: "classic", fame: 3, best: [9, 10, 11, 12, 1, 2], lat: 23.382, lon: 92.294, text: "A ridge-top village above a sea of clouds. The district closed it for days in October 2026 over a road blockade, so confirm before you go.", picture: photo("sajek") },
  { id: "bandarban", name: "Bandarban", district: "Bandarban", terrain: "hills", kind: "classic", fame: 3, best: COOL_DRY, lat: 22.195, lon: 92.218, text: "Cloud-wrapped hills, waterfalls and the home of the Marma, Bawm and Mro peoples.", picture: photo("bandarban") },
  { id: "srimangal", name: "Srimangal", district: "Moulvibazar", terrain: "sylhet", kind: "classic", fame: 3, best: COOL_DRY, lat: 24.307, lon: 91.73, text: "Rolling tea gardens and rainforest trails in the country's tea capital.", picture: photo("srimangal-tea") },
  { id: "ratargul", name: "Ratargul", district: "Sylhet", terrain: "sylhet", kind: "classic", fame: 3, best: [6, 7, 8, 9], lat: 25.006, lon: 91.934, text: "Row a small boat through a freshwater forest standing in water for months of the year.", picture: photo("ratargul") },
  { id: "tanguar", name: "Tanguar Haor", district: "Sunamganj", terrain: "sylhet", kind: "classic", fame: 2, best: [12, 1, 2, 7, 8], lat: 25.15, lon: 91.07, text: "A vast seasonal wetland under the Meghalaya hills, where winter brings flocks of migratory birds.", picture: photo("sunamganj-haor") },
];

/** Places with a full-resolution original in public/motherland/top, for large cards. Same photograph, same credit. */
const FULL_SIZE = new Set(FULL_SIZE_IDS);

export const PLACES: MapPlace[] = LISTED.map((p) => (FULL_SIZE.has(p.id) ? { ...p, picture: { ...p.picture, src: `/motherland/top/${p.id}.jpg` } } : p));

export const placeById = (id: string) => PLACES.find((p) => p.id === id);

export const KIND_LABEL: Record<PlaceKind, string> = { antique: "Very old", gem: "Hidden gem", classic: "Must see" };

/** Rivers for the map, roughly traced. They orient the eye; they are not for navigation. */
export const RIVERS: { name: string; path: [number, number][] }[] = [
  { name: "Teesta", path: [[26.2, 89.0], [25.85, 89.35], [25.5, 89.7]] },
  { name: "Jamuna", path: [[25.75, 89.72], [25.2, 89.68], [24.6, 89.72], [24.1, 89.72], [23.8, 89.75]] },
  { name: "Padma", path: [[24.47, 88.1], [24.35, 88.6], [24.05, 89.1], [23.8, 89.75], [23.5, 90.25], [23.25, 90.6]] },
  { name: "Surma", path: [[24.95, 92.3], [24.9, 91.85], [24.92, 91.3], [24.55, 91.1]] },
  { name: "Meghna", path: [[24.55, 91.1], [24.05, 90.98], [23.6, 90.68], [23.25, 90.6], [22.75, 90.68], [22.25, 91.0]] },
];

export const TERRAIN_NAME: Record<Terrain, string> = { hills: "Hills", sylhet: "Sylhet and haors", plains: "The plains", char: "Chars", sea: "Sea and coast", rivers: "Rivers" };

export interface TerrainGuide {
  id: Terrain;
  title: string;
  lede: string;
  picture: Picture;
  best: string;
  watch: string[];
  carry: string[];
}

/** What a traveller needs in each landscape, to avoid what actually goes wrong there. */
export const GUIDES: TerrainGuide[] = [
  {
    id: "hills",
    title: "Hills",
    lede: "Rangamati, Khagrachhari and Bandarban: the country's only real mountains, and the homes of its hill peoples.",
    picture: photo("sajek"),
    best: "October to March. Landslides close roads in the monsoon.",
    watch: ["Access can close at a day's notice. Bandarban closed its tourist sites in July 2026 over landslide risk, and Sajek closed in October 2026 over a road blockade", "Foreign visitors may need permission from the authorities, so ask well ahead", "Malaria is present in the hill forests; ask a doctor before you go", "Signal disappears beyond the towns"],
    carry: ["Your NID or passport, and copies", "A registered local guide for treks", "Repellent, long sleeves and leech socks", "Cash, because shops take nothing else"],
  },
  {
    id: "sylhet",
    title: "Sylhet and haors",
    lede: "Tea gardens, swamp forests and inland seas under the Meghalaya hills, one of the wettest corners of the world.",
    picture: photo("sunamganj-haor"),
    best: "Monsoon for water and boats, winter for birds. Check which you are coming for.",
    watch: ["Rain in Meghalaya can bring a flash flood here within hours", "Afternoon storms raise big waves on an open haor", "Stone-bed rivers look shallow and pull hard", "Stay back from the border, and go with a local guide"],
    carry: ["A life jacket, and ask the boatman for one", "A dry bag for phones and papers", "Rain gear in every season", "A boat fare agreed before you board"],
  },
  {
    id: "plains",
    title: "Shomotal, the plains",
    lede: "About four fifths of the country is floodplain: the rice fields, old cities and forgotten monuments.",
    picture: commons("mustard", "A wide field of yellow mustard in flower"),
    best: "November to February, when it is dry and cool.",
    watch: ["Road crashes are the real danger, so choose a day bus and a careful driver", "Winter fog delays trains, flights and ferries, often in the morning", "Fierce heat in April and May", "Many archaeology museums close one day a week, so check before a long trip"],
    carry: ["Water and a hat", "Modest clothes for mosques and temples", "Time, since rural roads are slow"],
  },
  {
    id: "char",
    title: "Chars",
    lede: "River islands made of silt, that rise and vanish. Millions of people live on them, and they have few services.",
    picture: commons("kashful", "Tall white kash flowers along a riverbank"),
    best: "November to February. The land is drowned or eroding in the monsoon.",
    watch: ["The land itself moves, so maps go out of date in a year", "Boats depend on the tide and may run only once a day", "No clinic or shop may be near", "Keep a distance from wildlife, and ask before photographing families"],
    carry: ["Food, water and a torch", "A local contact who knows the boat times", "A power bank", "Your rubbish, back home with you"],
  },
  {
    id: "sea",
    title: "Sea and coast",
    lede: "From Cox's Bazar to Kuakata and the coral of St Martin's, on one of the world's most cyclone-exposed coasts.",
    picture: photo("coxs-bazar"),
    best: "November to March. Cyclones come in spring and late autumn.",
    watch: ["Rip currents drown swimmers, so swim only by day, near lifeguards and never at high tide", "Obey cyclone signals, and leave when told", "St Martin's needs a pass, and boats leave only from Cox's Bazar", "Corals, turtles and birds are protected by law"],
    carry: ["The Tourist Police helpline: 01320-222222", "Sun protection", "A printed copy of your pass or ticket"],
  },
  {
    id: "rivers",
    title: "Rivers",
    lede: "Launches, ferries and country boats still carry a nation. The Sundarbans can only be reached this way.",
    picture: commons("river", "A boatman sailing a small boat on a river"),
    best: "October to February for calm water. Sundarbans: closed 1 June to 31 August.",
    watch: ["Nor'wester storms strike fast from March to May", "Never board an overcrowded launch, especially at Eid", "Fog stops ferries for hours in December and January", "Night boats on open water are the riskiest"],
    carry: ["Find the life jackets as soon as you board", "A Forest Department permit for the Sundarbans", "A dry bag and warm layer"],
  },
];

export const HELP = [
  { tel: "999", label: "Police, fire, ambulance" },
  { tel: "01320222222", shown: "01320-222222", label: "Tourist Police" },
  { tel: "333", label: "Government information" },
];

export const SOURCES = [
  { name: "St Martin's rules, 2026-27 (Prothom Alo)", url: "https://en.prothomalo.com/bangladesh/60dans0p0u" },
  { name: "Sundarbans closure (TBS)", url: "https://www.tbsnews.net/bangladesh/sundarbans-closed-three-months-tomorrow-protect-wildlife-breeding-1451131" },
  { name: "Sajek reopening (Dhaka Tribune)", url: "https://www.dhakatribune.com/bangladesh/422251/sajek-reopens-to-tourists-after-four-days-800" },
  { name: "Tourist Police helpline (Bangladesh Monitor)", url: "https://bangladeshmonitor.com.bd/en/bangladesh-tourist-police-launches-247-helpline-for-travellers" },
  { name: "Winter fog and ferries (Dhaka Tribune)", url: "https://www.dhakatribune.com/bangladesh/nation/318828/fog-disrupts-paturia-daulatdia-aricha-kazirhat" },
  { name: "Nijhum Dwip National Park", url: "https://en.wikipedia.org/wiki/Nijhum_Dwip_National_Park" },
  { name: "Kantajew Temple", url: "https://en.wikipedia.org/wiki/Kantajew_Temple" },
  { name: "Panam Nagar", url: "https://www.wikiwand.com/en/articles/Panam_Nagar" },
];

export const GEOGRAPHY = [
  { label: "Area", value: "147,570 km²" },
  { label: "River delta", value: "World's largest" },
  { label: "Floodplain", value: "About 80%" },
  { label: "Divisions", value: "8" },
  { label: "Districts", value: "64" },
  { label: "Natural sea beach", value: "About 120 km" },
];

/** The story contest, as proposed: accounts arrive with the auth work. */
export const STORIES = {
  href: "/bangladesh/travel/stories",
  signup: "/signup?next=/bangladesh/travel/stories",
  title: "Travel stories",
  steps: [
    { title: "Create your Kandari Profile", text: "Your profile gets a Travel ID. Stories can only be written from a profile, so every one has a real person behind it." },
    { title: "Write it short, add your photos", text: "Where you went, what you saw, what surprised you. Use only photos you took yourself." },
    { title: "Pin it on the travel wall", text: "Your story becomes one small note on the map at the place you visited, closed until someone opens it." },
    { title: "Earn XP and get chosen", text: "Every week we choose the top ten by story and images, and repost them here to represent the country." },
  ],
  badges: [
    { icon: "badge", title: "Travel ID", text: "Your traveller badge, given with your first story." },
    { icon: "push_pin", title: "Wall pin", text: "One small note on the map for each place you visited." },
    { icon: "diamond", title: "Hidden gem", text: "For the first good story from a place almost no one has written about." },
    { icon: "workspace_premium", title: "Best place of the week", text: "One place each week, picked for its story and images." },
    { icon: "emoji_events", title: "Top 10 story", text: "Only ten stories a week reach the top ten." },
  ],
  xp: [
    { value: "+50", label: "Your story is published" },
    { value: "+20", label: "A new district pinned" },
    { value: "+100", label: "Hidden gem badge" },
    { value: "+200", label: "Top 10 of the week" },
    { value: "+500", label: "Best place of the week" },
  ],
  rules: ["Open to Bangladeshis and visitors from every country", "Stories stay short, and in Bangla or English", "Photos must be your own, with permission from anyone clearly shown", "Recent tours only, because the top ten is about now", "Don't reveal nesting sites or fragile places, and leave no litter in your photos", "Nothing is ever paid for: a place in the top ten can't be bought"],
  /** A demonstration of the wall pin. It is not a real story, and the page says so. */
  example: { placeId: "nafakhum", title: "Example pin", text: "This is what a wall note looks like. Your real story and photo open here, under your name and Travel ID." },
};

/**
 * The six seasons (ritu), in the year's order, each from its first day in the
 * Bangla calendar as Bangladesh keeps it, and how the country looks in each.
 * `pick` marks the best weeks for most trips.
 */
export interface Season {
  id: string;
  name: string;
  english: string;
  months: string;
  from: [number, number];
  pick?: boolean;
  looks: string;
  picture: Picture;
}

export const SEASONS: Season[] = [
  { id: "grishmo", name: "Grishmo", english: "Summer", months: "Mid-Apr to mid-Jun", from: [4, 14], looks: "Ripe mangoes, greenest tea", picture: photo("srimangal-tea") },
  { id: "borsha", name: "Borsha", english: "Monsoon", months: "Mid-Jun to mid-Aug", from: [6, 15], looks: "Flooded forests, endless water", picture: photo("ratargul") },
  { id: "sharot", name: "Sharot", english: "Autumn", months: "Mid-Aug to mid-Oct", from: [8, 16], looks: "Blue sky, white kash, water lilies", picture: photo("shapla") },
  { id: "hemonto", name: "Hemonto", english: "Late autumn", months: "Mid-Oct to mid-Dec", from: [10, 16], pick: true, looks: "Clear air, the Sundarbans opens", picture: photo("mangroves") },
  { id: "sheet", name: "Sheet", english: "Winter", months: "Mid-Dec to mid-Feb", from: [12, 15], pick: true, looks: "Misty mornings, winter birds", picture: photo("fisher-mist") },
  { id: "boshonto", name: "Boshonto", english: "Spring", months: "Mid-Feb to mid-Apr", from: [2, 14], looks: "Red palash, yellow saris", picture: photo("falgun") },
];

/** The hero: cloud lying in the valleys of Bandarban at sunrise. */
export const TRAVEL_FILM = BANDARBAN_CLOUDS;

/** The four very old places dealt as full-screen cards, as the landing page deals its history. */
export const OLD_STACK: { id: string; art: "arches" | "minar" | "peaks" | "waves" }[] = [
  { id: "panam-nagar", art: "waves" },
  { id: "kantajew", art: "peaks" },
  { id: "bagha-mosque", art: "arches" },
  { id: "puthia", art: "peaks" },
];

/** The places the Top 10 chooses from, the most striking first. */
const TOP_POOL = ["sajek", "tanguar", "coxs-bazar", "ratargul", "bandarban", "sixty-dome", "srimangal", "sundarbans", "kuakata", "lalbagh", "panam-nagar", "nafakhum", "st-martin", "paharpur", "nijhum-dwip", "kantajew", "puthia"];

/**
 * This week's ten: places open this month, those in season first, turning by
 * one each week so the list moves. Our own pick until the story contest opens
 * and travellers decide it.
 */
export function topTen(month: number, week: number) {
  const open = TOP_POOL.map((id) => placeById(id)!).filter((p) => !p.closed?.includes(month));
  const season = open.filter((p) => p.best.includes(month));
  const turn = season.length ? ((week % season.length) + season.length) % season.length : 0;
  return [...season.slice(turn), ...season.slice(0, turn), ...open.filter((p) => !p.best.includes(month))].slice(0, 10);
}

export const MUST_SEE = {
  antique: { id: "very-old", title: "Older than anyone told you", lede: "Temples of fired clay, a street of empty mansions and a town from about 450 BCE." },
  gem: { id: "hidden-gems", title: "Almost no one has seen these", lede: "Pink hills, a floating guava market and a waterfall far from any road." },
};

/** Every picture on the page, once, for the footer's credits. */
export function travelCredits() {
  const seen = new Set<string>();
  return [...PLACES.map((p) => ({ label: p.name, picture: p.picture })), ...GUIDES.map((g) => ({ label: g.title, picture: g.picture })), ...SEASONS.map((s) => ({ label: s.name, picture: s.picture }))]
    .filter(({ picture }) => !seen.has(picture.src) && !!seen.add(picture.src))
    .map(({ label, picture }) => ({ label, credit: picture.credit }))
    .concat([TRAVEL_FILM, STORIES_FILM].map((f) => ({ label: f.title, credit: f.credit })));
}
