/**
 * MOTHERLAND's category pages (/bangladesh/<slug>): where every section's
 * gold button leads. The plan follows Britannica's category pages (a
 * category, its subcategories, feature blocks of articles, a quiz, then the
 * other categories); the dress is MOTHERLAND's own.
 *
 * Pictures are the ones already credited in data/motherland.ts, plus a few
 * credited Commons photos. Facts follow that file's rule: only what a
 * published source states plainly, rounded or left out where a figure moves.
 */
import { BIOGRAPHIES, CULTURE, HISTORY, JOIN, NATURE, RESOURCES, SCIENCE, TAKA, TRAVEL, commons, type Picture, type TopicId } from "./motherland.ts";

export interface Story {
  title: string;
  /** A line above the text: a person's years, a place's district. */
  meta?: string;
  text: string;
  picture: Picture;
}

export interface Subcategory {
  id: string;
  title: string;
  lede: string;
  /** "feature": one large story and the rest listed beside it. "grid": equal cards. */
  layout?: "feature" | "grid";
  /** Portraits stand tall in a grid; places lie wide. */
  shape?: "wide" | "tall";
  stories: Story[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** The index of the right option. */
  answer: number;
  why: string;
}

export interface Category {
  slug: string;
  topic: TopicId;
  name: string;
  lede: string;
  hero: Picture;
  /** What a category shows besides its stories. */
  body?: "debates" | "films";
  subcategories: Subcategory[];
  facts: { label: string; value: string }[];
  quiz: QuizQuestion[];
}

const every: Picture[] = [
  ...HISTORY.cards.map((c) => c.picture),
  ...SCIENCE.articles.map((a) => a.picture),
  ...BIOGRAPHIES.lives.map((l) => l.picture),
  ...NATURE.wild.map((w) => w.picture),
  ...TRAVEL.places.map((p) => p.picture),
  ...CULTURE.crafts.map((c) => c.picture),
  ...TAKA.facts.map((f) => f.picture),
  RESOURCES.picture,
  JOIN.picture,
];

/** A picture already in MOTHERLAND, by its file name. */
export function photo(name: string): Picture {
  const found = every.find((p) => p.src.endsWith(`/${name}.jpg`));
  if (!found) throw new Error(`MOTHERLAND: no picture "${name}"`);
  return found;
}

const life = (name: string): Story => {
  const l = BIOGRAPHIES.lives.find((x) => x.name === name);
  if (!l) throw new Error(`MOTHERLAND: no life "${name}"`);
  return { title: l.name, meta: l.years, text: l.text, picture: { ...l.picture, focus: l.picture.focus ?? "50% 20%" } };
};

export const CATEGORIES: Category[] = [
  {
    slug: "history",
    topic: "history",
    name: "History & Society",
    lede: "From a walled city of the third century BCE to a young republic: how this land became a nation, and who lives here now.",
    hero: photo("martyrs-memorial"),
    subcategories: [
      {
        id: "ancient-bengal",
        title: "Ancient Bengal",
        lede: "Walled cities, monasteries and mosques far older than the country's name.",
        stories: [
          { title: "The Mosque City of Bagerhat", meta: "Fifteenth century", text: "Khan Jahan Ali founded a city of mosques, tanks and roads on the edge of the Sundarbans. Its Sixty Dome Mosque still stands, and UNESCO listed the city as a World Heritage Site in 1985.", picture: photo("sixty-dome-mosque") },
          { title: "Pundranagara", meta: "Third century BCE", text: "Today's Mahasthangarh in Bogura was already a walled city more than two thousand years ago, among the oldest cities found in Bangladesh.", picture: commons("mahasthan", "The brick ruins of Mahasthangarh in Bogura") },
          { title: "Somapura Mahavihara", meta: "Eighth century", text: "The Pala kings raised one of the great Buddhist monasteries south of the Himalayas at Paharpur. UNESCO listed it as a World Heritage Site in 1985.", picture: photo("paharpur_b") },
          { title: "Lalbagh Fort", meta: "1678", text: "A Mughal prince began this fort in Old Dhaka and it was never finished. Its gardens, mosque and tomb are still open to visitors.", picture: photo("lalbagh-fort") },
        ],
      },
      {
        id: "road-to-freedom",
        title: "The road to freedom",
        lede: "A language defended in 1952, and a country won in 1971.",
        stories: [
          { title: "21 February 1952", meta: "The Language Movement", text: "Students in Dhaka marched for Bangla to be a state language, and police opened fire. Salam, Barkat, Rafiq, Jabbar and others were killed. In 1999 UNESCO declared the day International Mother Language Day.", picture: photo("shaheed-minar") },
          { title: "Nine months of war", meta: "26 March to 16 December 1971", text: "Independence was declared on 26 March 1971. The National Martyrs' Memorial at Savar honours the millions who gave their lives in the Liberation War.", picture: photo("martyrs-memorial") },
          { title: "Victory", meta: "16 December 1971", text: "The Pakistani forces surrendered in Dhaka at the Racecourse ground, today's Suhrawardy Udyan. The day is kept every year as Victory Day.", picture: commons("surrender1971", "A depiction of the surrender of 1971") },
        ],
      },
      {
        id: "society-today",
        title: "Society today",
        lede: "More than 170 million people, most of them young, sharing one small and crowded land.",
        stories: [
          { title: "A young country", text: "The median age is under 30. Muslims, Hindus, Buddhists, Christians and about fifty ethnic communities live side by side.", picture: photo("children") },
          { title: "Festivals for everyone", text: "Pohela Boishakh and Eid, Durga Puja, Buddha Purnima and Christmas: the country's festivals are shared well beyond the faith or the community that began them.", picture: photo("mangal-shobhajatra") },
          { title: "Village and field", text: "About two in three people still live in rural areas, and the rice harvest still sets the rhythm of the year for millions of families.", picture: photo("rice-planting") },
        ],
      },
    ],
    facts: [
      { label: "Language Movement", value: "1952" },
      { label: "Independence declared", value: "26 March 1971" },
      { label: "Victory Day", value: "16 December 1971" },
      { label: "Constitution adopted", value: "4 November 1972" },
    ],
    quiz: [
      { question: "Which day did UNESCO declare International Mother Language Day?", options: ["21 February", "26 March", "16 December"], answer: 0, why: "It marks the day in 1952 when students died defending Bangla." },
      { question: "What is Pundranagara called today?", options: ["Paharpur", "Mahasthangarh", "Bagerhat"], answer: 1, why: "Mahasthangarh in Bogura was a walled city by the third century BCE." },
      { question: "Where did the Pakistani forces surrender in 1971?", options: ["Savar", "Chattogram", "The Racecourse ground, Dhaka"], answer: 2, why: "The ground is now Suhrawardy Udyan." },
    ],
  },
  {
    slug: "science-tech",
    topic: "science",
    name: "Science & Tech",
    lede: "Bridges over the strongest rivers, rice that survives the flood, money on every phone: the delta solves its own problems.",
    hero: photo("padma-bridge"),
    subcategories: [
      {
        id: "engineering-the-delta",
        title: "Engineering the delta",
        lede: "Building on soft ground, across some of the most powerful rivers on Earth.",
        stories: [
          { title: "The Padma Bridge", meta: "Opened June 2022", text: "A 6.15 km road and rail bridge across one of the world's most powerful rivers, paid for from the country's own budget. It ties the south-west to the capital by road.", picture: photo("padma-bridge") },
          { title: "Dhaka Metro Rail", meta: "Opened December 2022", text: "The country's first metro line carries commuters on an elevated line above the capital's traffic.", picture: photo("metro-rail") },
          { title: "A parliament of light", meta: "Completed 1982", text: "Louis Kahn's National Parliament House in Dhaka is counted among the landmark buildings of the twentieth century.", picture: photo("parliament") },
        ],
      },
      {
        id: "science-for-daily-life",
        title: "Science for daily life",
        lede: "Research and technology that reach the field and the pocket.",
        stories: [
          { title: "Rice science that feeds millions", text: "The Bangladesh Rice Research Institute has released more than a hundred rice varieties, including ones that survive floods, salt water and drought.", picture: photo("rice-planting") },
          { title: "Money on every phone", text: "Mobile financial services let tens of millions of people send, save and pay with a basic phone, many of them for the first time.", picture: photo("mobile-money") },
        ],
      },
      {
        id: "minds-of-science",
        title: "Minds of science",
        lede: "Two Boses, born in Bengal, who changed physics.",
        layout: "grid",
        shape: "tall",
        stories: [life("Satyendra Nath Bose"), life("Jagadish Chandra Bose")],
      },
    ],
    facts: [
      { label: "Padma Bridge length", value: "6.15 km" },
      { label: "First metro line opened", value: "December 2022" },
      { label: "Rice varieties released", value: "100+" },
      { label: "Bose–Einstein paper", value: "1924" },
    ],
    quiz: [
      { question: "Who paid for the Padma Bridge?", options: ["The country's own budget", "A single foreign bank", "A private company"], answer: 0, why: "Bangladesh built it from its own budget." },
      { question: "Where was S. N. Bose teaching when he wrote his famous paper?", options: ["Kolkata", "The University of Dhaka", "Berlin"], answer: 1, why: "He wrote it in Dhaka in 1924, and every boson is named after him." },
      { question: "Who designed the National Parliament House?", options: ["Le Corbusier", "Muzharul Islam", "Louis Kahn"], answer: 2, why: "Louis Kahn's building was completed in 1982." },
    ],
  },
  {
    slug: "people",
    topic: "biographies",
    name: "Biographies",
    lede: "Poets, scientists, reformers and leaders whose work still shapes how Bangladesh thinks, sings and dreams.",
    hero: photo("flag-mural"),
    subcategories: [
      {
        id: "poets-and-singers",
        title: "Poets and singers",
        lede: "The voices the country still recites and sings.",
        layout: "grid",
        shape: "tall",
        stories: [life("Kazi Nazrul Islam"), life("Jibanananda Das"), life("Jasimuddin"), life("Lalon")],
      },
      {
        id: "scientists-and-reformers",
        title: "Scientists and reformers",
        lede: "Pioneers of physics, and the people who fought for girls' schooling and farmers' freedom.",
        layout: "grid",
        shape: "tall",
        stories: [life("Jagadish Chandra Bose"), life("Satyendra Nath Bose"), life("Begum Rokeya"), life("A. K. Fazlul Huq")],
      },
    ],
    facts: [
      { label: "The national poet", value: "Kazi Nazrul Islam" },
      { label: "The Polli Kobi", value: "Jasimuddin" },
      { label: "“Sultana's Dream”", value: "1905" },
      { label: "Bengal's first Prime Minister", value: "1937" },
    ],
    quiz: [
      { question: "Who wrote “Bidrohi” (The Rebel)?", options: ["Kazi Nazrul Islam", "Jibanananda Das", "Jasimuddin"], answer: 0, why: "Nazrul is the national poet of Bangladesh." },
      { question: "Who imagined a world run by women in “Sultana's Dream”?", options: ["Lalon", "Begum Rokeya", "J. C. Bose"], answer: 1, why: "Begum Rokeya wrote it in 1905 and fought for girls' schooling." },
      { question: "What title is A. K. Fazlul Huq known by?", options: ["Polli Kobi", "Bidrohi Kobi", "Sher-e-Bangla"], answer: 2, why: "Sher-e-Bangla means the Tiger of Bengal." },
    ],
  },
  {
    slug: "nature",
    topic: "nature",
    name: "Animals & Nature",
    lede: "Mangroves, wetlands and hill forests make one of the richest living landscapes in South Asia.",
    hero: photo("mangroves"),
    subcategories: [
      {
        id: "the-sundarbans",
        title: "The Sundarbans",
        lede: "One of the largest mangrove forests on Earth, and a World Heritage Site since 1997.",
        stories: [
          { title: "Royal Bengal tiger", meta: "The national animal", text: "At home in the mangroves, it swims between islands and hunts across the tidal mud.", picture: photo("tiger") },
          { title: "Spotted deer", text: "Herds of chital graze where the forest meets the mudflats.", picture: photo("spotted-deer") },
          { title: "The mangrove forest", text: "Rivers and tides thread through the trees, and the forest shelters the coast from cyclones.", picture: photo("mangroves") },
        ],
      },
      {
        id: "national-symbols",
        title: "National symbols",
        lede: "The bird, the flower and the fish that stand for the country.",
        layout: "grid",
        stories: [
          { title: "Doyel", meta: "The national bird", text: "The magpie-robin, singing from every village yard.", picture: photo("doyel") },
          { title: "Shapla", meta: "The national flower", text: "The white water lily, opening on ponds and paddy ditches.", picture: photo("shapla") },
          { title: "Ilish", meta: "The national fish", text: "The hilsa, the silver of the Padma.", picture: photo("hilsa") },
        ],
      },
      {
        id: "wetlands-and-rivers",
        title: "Wetlands and rivers",
        lede: "Water makes this land, and everything that lives on it.",
        stories: [
          { title: "Ratargul", meta: "Sylhet", text: "A freshwater swamp forest, where trees stand in water for months of the year.", picture: photo("swamp-forest") },
          { title: "Tanguar Haor", meta: "Sunamganj", text: "A vast seasonal wetland under the Meghalaya hills, where winter brings flocks of migratory birds.", picture: photo("sunamganj-haor") },
          { title: "Kingfisher", text: "One of the many river birds that flash blue along the delta's canals.", picture: photo("kingfisher") },
        ],
      },
    ],
    facts: [
      { label: "National animal", value: "Royal Bengal tiger" },
      { label: "National bird", value: "Doyel" },
      { label: "National flower", value: "Shapla" },
      { label: "National fish", value: "Ilish" },
    ],
    quiz: [
      { question: "What is the national fish of Bangladesh?", options: ["Ilish", "Rui", "Pangas"], answer: 0, why: "Ilish, the hilsa, is called the silver of the Padma." },
      { question: "Which forest is home to the Royal Bengal tiger?", options: ["Ratargul", "The Sundarbans", "Lawachara"], answer: 1, why: "The tiger lives in the Sundarbans' mangroves." },
      { question: "What kind of forest is Ratargul?", options: ["Mangrove", "Pine", "Freshwater swamp"], answer: 2, why: "Its trees stand in fresh water for months of the year." },
    ],
  },
  {
    slug: "travel",
    topic: "travel",
    name: "Geography & Travel",
    lede: "Eight divisions, three great rivers, hills in the east and some 120 km of sea beach in the south. Where do you want to start?",
    hero: photo("bandarban"),
    subcategories: [
      {
        id: "eight-divisions",
        title: "The eight divisions",
        lede: "Each one has its own landscape, food and way of speaking.",
        layout: "grid",
        stories: [
          { title: "Dhaka", text: "The capital and its crowded heart, from the Mughal fort at Lalbagh to the boats on the Buriganga.", picture: photo("lalbagh-fort") },
          { title: "Chattogram", text: "The country's great port, the Hill Tracts, and the sea beach at Cox's Bazar.", picture: photo("coxs-bazar") },
          { title: "Rajshahi", text: "Silk and mangoes in the north-west, and the ancient ruins of Paharpur and Mahasthangarh.", picture: photo("paharpur_b") },
          { title: "Khulna", text: "The Sundarbans and the Mosque City of Bagerhat in the south-west.", picture: photo("mangroves") },
          { title: "Barishal", text: "A land of rivers and canals, reaching the sea at Kuakata.", picture: photo("kuakata") },
          { title: "Sylhet", text: "Tea gardens, haors and the flooded forest of Ratargul in the north-east.", picture: photo("srimangal-tea") },
          { title: "Rangpur", text: "The northern plains, where mustard turns whole fields yellow in winter.", picture: commons("mustard", "A wide field of yellow mustard in flower") },
          { title: "Mymensingh", text: "The newest division, created in 2015, on the old course of the Brahmaputra.", picture: commons("river", "A boatman sailing a small boat on a river") },
        ],
      },
      {
        id: "hills-and-tea",
        title: "Hills and tea",
        lede: "The country rises in the east, into cloud and forest.",
        stories: [
          { title: "Sajek Valley", meta: "Rangamati", text: "A ridge-top village where you wake up above a sea of clouds.", picture: photo("sajek") },
          { title: "Bandarban", meta: "Bandarban", text: "Cloud-wrapped hills, waterfalls and the home of the Marma, Bawm and Mro peoples.", picture: photo("bandarban") },
          { title: "Srimangal", meta: "Moulvibazar", text: "Rolling tea gardens and rainforest trails in the country's tea capital.", picture: photo("srimangal-tea") },
        ],
      },
      {
        id: "sea-and-water",
        title: "Sea and water",
        lede: "Long beaches in the south, and boats everywhere else.",
        stories: [
          { title: "Cox's Bazar", meta: "Cox's Bazar", text: "Some 120 km of unbroken natural sea beach, among the longest on Earth.", picture: photo("coxs-bazar") },
          { title: "Kuakata", meta: "Patuakhali", text: "A rare beach where you can watch the sun both rise and set over the sea.", picture: photo("kuakata") },
          { title: "Ratargul", meta: "Sylhet", text: "Row a small boat through a flooded forest.", picture: photo("ratargul") },
        ],
      },
    ],
    facts: [
      { label: "Divisions", value: "8" },
      { label: "Districts", value: "64" },
      { label: "Area", value: "147,570 km²" },
      { label: "Cox's Bazar beach", value: "About 120 km" },
    ],
    quiz: [
      { question: "How many divisions does Bangladesh have?", options: ["8", "7", "64"], answer: 0, why: "Eight divisions, divided into 64 districts." },
      { question: "Which beach lets you watch the sun rise and set over the sea?", options: ["Cox's Bazar", "Kuakata", "Teknaf"], answer: 1, why: "Kuakata, in Patuakhali." },
      { question: "Which town is called the country's tea capital?", options: ["Sajek", "Bandarban", "Srimangal"], answer: 2, why: "Srimangal, in Moulvibazar." },
    ],
  },
  {
    slug: "culture",
    topic: "culture",
    name: "Arts & Culture",
    lede: "UNESCO lists Baul songs, Jamdani weaving, Mangal Shobhajatra, Shital Pati mats and rickshaw painting among the intangible cultural heritage of humanity.",
    hero: photo("rickshaw-art"),
    subcategories: [
      {
        id: "living-heritage",
        title: "Living heritage",
        lede: "Traditions UNESCO has inscribed, and people still practise.",
        stories: [
          { title: "Mangal Shobhajatra", meta: "Inscribed 2016", text: "The Pohela Boishakh procession of giant masks, begun by students of the Faculty of Fine Arts at the University of Dhaka.", picture: photo("mangal-shobhajatra") },
          { title: "Rickshaw art", meta: "Inscribed 2023", text: "Hand-painted hoods and panels turn Dhaka's rickshaws into a moving gallery.", picture: photo("rickshaw-art") },
          { title: "The songs of the Bauls", meta: "Inscribed 2008", text: "Lalon's mystic songs set humanity above caste and creed, and are still sung across Bengal.", picture: { ...commons("lalon", "A sketch of Lalon drawn by Jyotirindranath Tagore in 1889"), focus: "50% 20%" } },
        ],
      },
      {
        id: "made-by-hand",
        title: "Made by hand",
        lede: "Thread, clay and brick, shaped the old way.",
        layout: "grid",
        stories: [
          { title: "Handloom", text: "Hand-spun thread feeds the looms behind Jamdani, the sheer muslin weave inscribed by UNESCO in 2013.", picture: photo("handloom") },
          { title: "Terracotta", text: "Temple walls told in fired clay, a Bengal tradition centuries old.", picture: photo("terracotta") },
          { title: "Pottery", text: "Potters still shape river clay into pots, lamps and toys by hand.", picture: photo("pottery") },
        ],
      },
      {
        id: "festivals",
        title: "Festivals",
        lede: "The year turns with colour.",
        stories: [
          { title: "Pohela Falgun", text: "Yellow saris and flower garlands greet the first day of spring.", picture: photo("falgun") },
          { title: "Pohela Boishakh", text: "The Bangla New Year fills streets with red and white on 14 April.", picture: commons("boishakh", "A Pohela Boishakh celebration") },
        ],
      },
    ],
    facts: [
      { label: "Baul songs", value: "2008" },
      { label: "Jamdani weaving", value: "2013" },
      { label: "Mangal Shobhajatra", value: "2016" },
      { label: "Rickshaw painting", value: "2023" },
    ],
    quiz: [
      { question: "Which weave did UNESCO inscribe in 2013?", options: ["Jamdani", "Nakshi kantha", "Tangail saree"], answer: 0, why: "Jamdani is the sheer muslin weave of the Dhaka region." },
      { question: "When is the Mangal Shobhajatra held?", options: ["Victory Day", "Pohela Boishakh", "Pohela Falgun"], answer: 1, why: "It is the New Year procession of giant masks." },
      { question: "What was the latest of these to be inscribed by UNESCO?", options: ["Baul songs", "Jamdani", "Rickshaw painting"], answer: 2, why: "Rickshaw painting was inscribed in 2023." },
    ],
  },
  {
    slug: "procon",
    topic: "procon",
    name: "Pro & Con",
    lede: "Big questions about the country's future. Choose your side on each, then answer the strongest case against it.",
    hero: photo("parliament"),
    body: "debates",
    subcategories: [],
    facts: [],
    quiz: [],
  },
  {
    slug: "taka",
    topic: "taka",
    name: "Taka",
    lede: "A visitor's guide to money in Bangladesh: what the taka is, how to change it, how to pay, and how to stay safe. Rates and prices here are illustrative and change daily.",
    hero: photo("taka-notes"),
    subcategories: [
      {
        id: "the-money",
        title: "The money",
        lede: "The taka has been the country's money since 1972. One taka is a hundred poisha, and the name comes from the Sanskrit ṭaṅka, an old silver coin.",
        stories: [
          { title: "What the taka looks like", meta: "Symbol ৳, code BDT", text: "Banknotes run from ৳2 up to ৳1,000, with ৳500 and ৳1,000 the ones you will handle most. Coins are small change and little used. Bangladesh Bank, the central bank, issues the taka, keeps the reserves and sets monetary policy. The notes carry the Shaheed Minar, the Jatiyo Sangsad and the country's harvests.", picture: photo("taka-notes") },
          { title: "Money on every phone", meta: "Mobile financial services", text: "Tens of millions of people send, save and pay through phone wallets such as bKash, Nagad and Rocket, without ever going into a bank. A visitor cannot open one without a local number and papers, but you will see them used everywhere, and a hotel or guide can pay one for you.", picture: photo("mobile-money") },
          { title: "A currency built on work", meta: "What gives it value", text: "The taka is backed by what the country makes: the clothes it sews for the world, the harvests of the delta, and the money sent home by millions working abroad. A country once written off now holds steady reserves.", picture: photo("garments") },
        ],
      },
      {
        id: "changing-money",
        title: "Changing money as a visitor",
        lede: "Where to turn your dollars, euros or pounds into taka, and what to expect. Carry your passport; a changer records it.",
        stories: [
          { title: "At the airport", meta: "Your first taka", text: "Dhaka's Hazrat Shahjalal airport has bank counters past arrivals. Change a small amount here for the taxi and first day; rates are a little weaker than in the city, so don't change everything at once.", picture: photo("parliament") },
          { title: "Banks and money changers", meta: "The best rates", text: "Licensed banks and authorised money changers in the city give the fairest rates. US dollars, euros, pounds, Indian rupees and Gulf currencies are all easy to change. Keep the receipt: you need it to change leftover taka back when you leave.", picture: photo("padma-bridge") },
          { title: "Cards and ATMs", meta: "Visa, Mastercard", text: "ATMs are common in cities and dispense taka on foreign cards; tell your bank you are travelling first. Hotels, airlines and larger shops take cards, but a 1–2% surcharge is common and a machine can be offline, so never rely on cards alone.", picture: photo("metro-rail") },
          { title: "A rough sense of value", meta: "Illustrative, not a quoted rate", text: "As a feel only: around ৳110–120 to a US dollar in recent years, so $100 is roughly ৳11,000–12,000. A street breakfast might be ৳60–100, a rickshaw hop ৳40–80, a good local meal ৳250–500. Check the day's real rate before you change money.", picture: photo("taka-notes") },
        ],
      },
      {
        id: "paying-day-to-day",
        title: "Paying day to day",
        lede: "Cash still rules the street. Carry small notes, and know which app is doing the work when a local pays by phone.",
        stories: [
          { title: "Cash is king", meta: "Keep small notes", text: "Rickshaws, tea stalls, buses, markets and most small shops take only cash, and rarely have change for a ৳1,000 note. Keep a stock of ৳10, ৳20, ৳50 and ৳100 notes for everyday spending, and break big notes at shops or your hotel.", picture: photo("rickshaw-art") },
          { title: "bKash, Nagad and Rocket", meta: "The phone wallets", text: "These are mobile-money services, not cards: a local sends money by dialling a code or tapping an app, backed by a phone number. Agent booths on every street turn cash into wallet balance and back. As a visitor you will mostly pay cash, but a guide or host can receive and send through these for you.", picture: photo("mobile-money") },
          { title: "Fares and bargaining", meta: "Agree first", text: "Rickshaws and CNG auto-rickshaws have no meters: agree the fare before you get in. Ride apps such as Uber and Pathao work in Dhaka and Chattogram and show a fixed price, which is the easiest way to avoid haggling. In markets, polite bargaining is normal; in shops with price tags, it is not.", picture: photo("metro-rail") },
        ],
      },
      {
        id: "rules-and-safety",
        title: "Rules and staying safe",
        lede: "A few simple habits keep your money safe and keep you on the right side of the rules.",
        stories: [
          { title: "Taking money in and out", meta: "Know the limits", text: "You may bring in foreign currency freely, but large sums must be declared on arrival. The taka is not meant to be taken out of the country, so change what you have left back to foreign currency before you fly, using your exchange receipts.", picture: photo("parliament") },
          { title: "Avoiding the common traps", meta: "Simple caution", text: "Change money only at banks and authorised changers, never with a stranger on the street. Count your notes before you walk away. Check an ATM for anything odd attached to the slot. Keep cards and most of your cash in your hotel safe, and carry only what you need for the day.", picture: photo("lalbagh-fort") },
          { title: "If something goes wrong", meta: "999 and tourist police", text: "The national emergency number is 999, answered in Bangla and English. Tourist Police look after visitors at major sites. For a lost card, call your own bank's international line, which is printed on your statement, and freeze the card from its app.", picture: photo("shaheed-minar") },
        ],
      },
    ],
    facts: [
      { label: "Symbol and code", value: "৳, BDT" },
      { label: "In use since", value: "1972" },
      { label: "Banknotes", value: "৳2 to ৳1,000" },
      { label: "One taka", value: "100 poisha" },
      { label: "Emergency", value: "999" },
    ],
    quiz: [
      { question: "What is the easiest way to avoid haggling over a ride in Dhaka?", options: ["Pay with a foreign card", "Use a ride app like Uber or Pathao", "Offer a ৳1,000 note"], answer: 1, why: "Ride apps show a fixed price, so there is nothing to negotiate." },
      { question: "Why should you keep your money-change receipts?", options: ["To claim a refund", "To change leftover taka back when you leave", "They are not needed"], answer: 1, why: "You need the receipts to convert taka back to foreign currency before flying out." },
      { question: "What are bKash, Nagad and Rocket?", options: ["Banks", "Mobile-money wallets tied to a phone number", "Foreign cards"], answer: 1, why: "They are mobile financial services a local uses by phone, not debit cards." },
    ],
  },
  {
    slug: "videos",
    topic: "videos",
    name: "Videos",
    lede: "Rivers, streets and celebrations, filmed by the people who live them.",
    hero: photo("fisher-mist"),
    body: "films",
    subcategories: [],
    facts: [],
    quiz: [],
  },
  {
    slug: "resources",
    topic: "resources",
    name: "Capability & Resources",
    lede: "Fertile soil, great rivers, a wide sea and a young people: what Bangladesh was born with, and what it can become.",
    hero: photo("rice-planting"),
    subcategories: [
      {
        id: "what-the-land-gives",
        title: "What the land gives",
        lede: "A delta feeds a nation.",
        stories: [
          { title: "Three rice harvests", meta: "Third-largest rice grower on Earth", text: "Aus, Aman and Boro: the delta's soil and water let farmers grow rice in three seasons. After China and India, no country grows more.", picture: photo("rice-planting") },
          { title: "Fish in every river", meta: "Third-largest inland catch", text: "Rivers, haors and floodplains make one of the richest freshwater fisheries in the world, and the hilsa, the national fish, is its pride.", picture: photo("hilsa") },
          { title: "The golden fibre", meta: "Second-largest jute grower", text: "The fibre that once filled the world's grain sacks is coming back as a green alternative to plastic.", picture: photo("handloom") },
          { title: "A sea of our own", meta: "118,813 km² of water", text: "Settled at international tribunals in 2012 and 2014, the Bay of Bengal waters open a blue economy of fish, ports and energy.", picture: photo("kuakata") },
        ],
      },
      {
        id: "green-wealth",
        title: "Green wealth",
        lede: "Forests, tea and wetlands that the whole country leans on.",
        layout: "grid",
        stories: [
          { title: "Tea gardens", meta: "Sylhet", text: "Rolling estates around Srimangal, and one of the country's oldest export crops.", picture: photo("srimangal-tea") },
          { title: "The mangrove shield", meta: "The Sundarbans", text: "The forest breaks cyclones before they reach the villages behind it, and feeds the fisheries around it.", picture: photo("mangroves") },
          { title: "The haors", meta: "Sunamganj", text: "Vast seasonal wetlands that grow a harvest of rice in the dry months and fish in the wet ones.", picture: photo("sunamganj-haor") },
        ],
      },
      {
        id: "a-young-people",
        title: "A young people",
        lede: "The greatest resource walks on two feet.",
        layout: "grid",
        stories: [
          { title: "Under thirty", text: "Bangladesh's median age is under 30: a generation ready to learn, build and lead.", picture: photo("children") },
          { title: "Hands that make", text: "Skill runs from the handloom to the garment line, and millions of workers, most of them women, dress the world.", picture: photo("garments") },
          { title: "Money sent home", text: "The courage of millions working abroad becomes billions of dollars for their families each year.", picture: photo("taka-notes") },
        ],
      },
    ],
    facts: [
      { label: "Rice harvests a year", value: "3" },
      { label: "Rice grower", value: "3rd largest" },
      { label: "Inland fish catch", value: "3rd largest" },
      { label: "Jute grower", value: "2nd largest" },
      { label: "Sea area", value: "118,813 km²" },
    ],
    quiz: [
      { question: "Which is NOT one of Bangladesh's three rice crops?", options: ["Aus", "Aman", "Rabi"], answer: 2, why: "The three are Aus, Aman and Boro." },
      { question: "What is jute known as?", options: ["The golden fibre", "The silver thread", "The white gold"], answer: 0, why: "Its colour and its value gave jute the name the golden fibre." },
      { question: "How much sea does Bangladesh hold after the tribunals?", options: ["11,881 km²", "118,813 km²", "1,188,130 km²"], answer: 1, why: "Rulings in 2012 and 2014 settled 118,813 km² of the Bay of Bengal." },
    ],
  },
  {
    slug: "invest",
    topic: "invest",
    name: "Business & Investment",
    lede: "A huge young market, world-scale factories and new roads to reach them. Here is where to build.",
    hero: photo("padma-bridge"),
    subcategories: [
      {
        id: "why-build-here",
        title: "Why build here",
        lede: "The foundations already in place.",
        stories: [
          { title: "We dress the world", meta: "Second in clothing exports", text: "Bangladesh's garment industry employs millions and supplies the world's best-known brands, and is moving up to higher-value fashion.", picture: photo("garments") },
          { title: "New roads to market", meta: "The Padma Bridge, opened 2022", text: "The 6.15 km road and rail bridge ties the south-west to Dhaka and the port of Chattogram for the first time.", picture: photo("padma-bridge") },
          { title: "A city that moves", meta: "Dhaka Metro, opened 2022", text: "The country's first metro line gives the capital's workers a fast way through its traffic.", picture: photo("metro-rail") },
          { title: "Money on every phone", meta: "Mobile financial services", text: "Tens of millions of people already send, save and pay by phone, a ready base for digital business.", picture: photo("mobile-money") },
        ],
      },
    ],
    facts: [
      { label: "Goods exports", value: "About $48bn" },
      { label: "Clothing exports", value: "No. 2" },
      { label: "Remittances, FY26", value: "$35.56bn" },
      { label: "People", value: "169.8 million" },
    ],
    quiz: [],
  },
];

export const categoryFor = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

/** Every picture a category shows, for its credits. */
export function categoryCredits(c: Category) {
  const seen = new Set<string>();
  return [{ title: c.name, picture: c.hero }, ...c.subcategories.flatMap((s) => s.stories)]
    .filter(({ picture }) => !seen.has(picture.src) && !!seen.add(picture.src))
    .map(({ title, picture }) => ({ label: title, credit: picture.credit }));
}
