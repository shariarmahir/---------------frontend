/**
 * MOTHERLAND (/bangladesh): Bangladesh's country profile for the world, in
 * English. Every section's copy, photograph and film lives here; the
 * components in components/motherland only lay it out.
 *
 * Photographs come from Unsplash (Unsplash License) and, for the portraits,
 * Wikimedia Commons (public domain); films come from Pexels (Pexels
 * License). All of them are stored locally under /public/motherland or
 * /public/bangladesh and credited in the footer. Getty Images footage is
 * licensed per use, so none is used here.
 *
 * Facts are kept to what a published source states plainly. Where a figure
 * moves year to year it is rounded or left out.
 */

import { commonsPhotos } from "./bangladesh-photos.ts";
import { project } from "./bangladesh-map.ts";

/* ── Pictures and their credits ──────────────────────────────────────── */

export type Source = "Unsplash" | "Pexels" | "Pixabay" | "Wikimedia Commons";

export interface Credit {
  author: string;
  source: Source;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
}

export interface Picture {
  src: string;
  alt: string;
  credit: Credit;
  /** CSS object-position, for pictures whose subject is off-centre. */
  focus?: string;
}

/** An Unsplash photo stored at /public/motherland/photos/<file>.jpg. */
function unsplash(file: string, alt: string, author: string, slug: string, focus?: string): Picture {
  return {
    src: `/motherland/photos/${file}.jpg`,
    alt,
    focus,
    credit: { author, source: "Unsplash", sourceUrl: `https://unsplash.com/photos/${slug}`, license: "Unsplash License", licenseUrl: "https://unsplash.com/license" },
  };
}

/** A Commons photo already in /public/bangladesh, with its English alt text. */
export function commons(key: string, alt: string): Picture {
  const photo = commonsPhotos[key];
  if (!photo?.credit) throw new Error(`MOTHERLAND: no credited Commons photo "${key}"`);
  const { author, license, licenseUrl, sourceUrl } = photo.credit;
  return { src: photo.src, alt, focus: photo.focus, credit: { author, source: "Wikimedia Commons", sourceUrl, license, licenseUrl: licenseUrl || undefined } };
}

/* ── Topics: the header's tabs and the page's sections, in order ─────── */

export type TopicId = "history" | "science" | "biographies" | "nature" | "travel" | "culture" | "procon" | "taka" | "videos" | "resources" | "invest" | "facts";

export interface Topic {
  id: TopicId;
  /** The category's full name: the section's small title. */
  name: string;
  /** The header tab. */
  tab: string;
}

export const TOPICS: Topic[] = [
  { id: "history", name: "History & Society", tab: "History" },
  { id: "science", name: "Science & Tech", tab: "Science" },
  { id: "biographies", name: "Biographies", tab: "People" },
  { id: "nature", name: "Animals & Nature", tab: "Nature" },
  { id: "travel", name: "Geography & Travel", tab: "Geography & Travel" },
  { id: "culture", name: "Arts & Culture", tab: "Culture" },
  { id: "procon", name: "Pro & Con", tab: "Pro & Con" },
  { id: "taka", name: "Taka", tab: "Taka" },
  { id: "videos", name: "Videos", tab: "Videos" },
  { id: "resources", name: "Capability & Resources", tab: "Resources" },
  { id: "invest", name: "Business & Investment", tab: "Invest" },
  { id: "facts", name: "Facts of Bangladesh", tab: "Facts" },
];

/** The topics that have their own page (data/motherland-categories.ts); the other two live on the landing page. */
export const TOPIC_PAGES: Partial<Record<TopicId, string>> = {
  history: "/bangladesh/history",
  science: "/bangladesh/science-tech",
  biographies: "/bangladesh/people",
  nature: "/bangladesh/nature",
  travel: "/bangladesh/travel",
  culture: "/bangladesh/culture",
  procon: "/bangladesh/procon",
  taka: "/bangladesh/taka",
  videos: "/bangladesh/videos",
  resources: "/bangladesh/resources",
  invest: "/bangladesh/invest",
  facts: "/bangladesh/facts",
};

/** Where a topic link goes: its section on the landing page, or from a category page its own page. */
export const topicHref = (id: TopicId, onLanding: boolean) => (id === "facts" ? TOPIC_PAGES.facts! : onLanding ? `#${id}` : (TOPIC_PAGES[id] ?? `/bangladesh#${id}`));

export const topicName = (id: TopicId) => TOPICS.find((t) => t.id === id)!.name;

/**
 * Each section's "go deeper" link: its gold button to the category's own page
 * (data/motherland-categories.ts), or to a part of it.
 */
export interface Cta {
  label: string;
  href: string;
}

/* ── Hero: About Bangladesh ─────────────────────────────────────────── */

export interface Film {
  title: string;
  /** Phone cut (1280 wide) and desktop cut (1920 wide); one file when there is only one. */
  src: { phone: string; desktop?: string };
  poster: string;
  credit: Credit;
}

function pexels(title: string, file: string, slug: string, desktop?: string): Film {
  return {
    title,
    src: { phone: `/motherland/video/${file}.mp4`, desktop: desktop && `/motherland/video/${desktop}.mp4` },
    poster: `/motherland/video/${file}.jpg`,
    credit: { author: "Pexels", source: "Pexels", sourceUrl: `https://www.pexels.com/video/${slug}/`, license: "Pexels License", licenseUrl: "https://www.pexels.com/license/" },
  };
}

export const HERO = {
  /** The anthem's title, in English and as Tagore wrote it. */
  title: "My Golden Bengal",
  titleBn: "আমার সোনার বাংলা",
  film: pexels(
    "Rivers, fields and villages of Kishoreganj from the air",
    "hero-kishoreganj-720",
    "aerial-drone-footage-of-rural-kishoreganj-bangladesh-35040969",
    "hero-kishoreganj-1080",
  ),
};

/* ── About: the scroll-filled introduction ──────────────────────────── */

export const ABOUT = {
  text: "Bangladesh is a young nation on an ancient delta. Where the Padma, the Jamuna and the Meghna meet the Bay of Bengal, more than 170 million people share one language they once defended with their lives. This is the land of the Sundarbans, of beaches that run for a hundred kilometres, and of a people who turn rivers, rice and rhythm into a way of life.",
  /** Bangladesh at a glance, for a first-time visitor. Sources: Bangladesh National Portal, BBS Census 2022. */
  facts: [
    { label: "Capital", value: "Dhaka" },
    { label: "People", value: "170+ million" },
    { label: "Area", value: "147,570 km²" },
    { label: "Language", value: "Bangla" },
    { label: "Currency", value: "Taka (৳)" },
    { label: "Independence", value: "26 March 1971" },
  ],
  question: "Do you really know your motherland?",
  cta: { label: "Learn the story of your birthplace", href: "/bangladesh/history" } satisfies Cta,
};

/* ── History & Society: the stacked cards ───────────────────────────── */

/** The faint art behind a card's words, drawn from its subject (components/motherland/stack-art.tsx). */
export type Art = "arches" | "minar" | "peaks" | "waves";

export interface StoryCard {
  art: Art;
  title: string;
  text: string;
  cta: Cta;
  picture: Picture;
}

export const HISTORY = {
  title: "A story worth knowing",
  cards: [
    {
      art: "arches",
      title: "Older than memory",
      text: "Pundranagara, today's Mahasthangarh, was a walled city by the third century BCE. The Buddhist monastery of Somapura at Paharpur and the Mosque City of Bagerhat, both UNESCO World Heritage Sites, show how long this land has been a centre of learning, faith and trade.",
      cta: { label: "Walk through 2,500 years", href: "/bangladesh/history#ancient-bengal" },
      picture: unsplash("sixty-dome-mosque", "The Sixty Dome Mosque in Bagerhat behind a field of tall grass", "Faisal Photography", "sixty-dome-mosque-with-a-grass-field-8Q5HBZsJclY"),
    },
    {
      art: "minar",
      title: "Defended with blood",
      text: "When students in Dhaka marched for Bangla to be a state language, police opened fire. Salam, Barkat, Rafiq, Jabbar and others were killed. In 1999 UNESCO declared 21 February International Mother Language Day, and the whole world now keeps it.",
      cta: { label: "Learn why the world keeps 21 February", href: "/bangladesh/history#road-to-freedom" },
      picture: unsplash("shaheed-minar", "The Central Shaheed Minar in Dhaka, its white columns framing a red sun", "John Jyotish Baroi", "a-large-red-and-white-structure-s9iievuN4W8"),
    },
    {
      art: "peaks",
      title: "Won in nine months",
      text: "Independence was declared on 26 March 1971. After nine months of the Liberation War and immense sacrifice, Bangladesh won its victory on 16 December 1971. The National Martyrs' Memorial at Savar honours the millions who gave their lives.",
      cta: { label: "Honour the Liberation War", href: "/bangladesh/history#road-to-freedom" },
      picture: unsplash("martyrs-memorial", "The National Martyrs' Memorial at Savar, its seven peaks rising over green lawns", "Md Rumon Munshi", "the-national-martyrs-memorial-of-bangladesh-tT4mUnA_M7w", "50% 40%"),
    },
    {
      art: "waves",
      title: "Young and on the move",
      text: "Bangladesh is a young country: its median age is under 30. Muslims, Hindus, Buddhists, Christians and about fifty ethnic communities share one land, and their festivals belong to everyone, from Pohela Boishakh and Eid to Durga Puja, Buddha Purnima and Christmas.",
      cta: { label: "Meet the people of Bangladesh", href: "/bangladesh/history#society-today" },
      picture: unsplash("children", "Five children laughing together on a sandy riverbank", "mohammad samir", "3-boys-and-2-girls-standing-on-brown-sand-during-daytime-vaXqT9L7LwY"),
    },
  ] satisfies StoryCard[],
};

/* ── Science & Tech: the article slider ─────────────────────────────── */

export interface Article {
  title: string;
  text: string;
  picture: Picture;
}

export const SCIENCE = {
  title: "Built by Bangladesh",
  lede: "Bridges over the strongest rivers, rice that survives the flood, money on every phone: the delta solves its own problems.",
  cta: { label: "Discover what Bangladesh builds", href: "/bangladesh/science-tech" } satisfies Cta,
  articles: [
    {
      title: "The Padma Bridge",
      text: "A 6.15 km road and rail bridge across one of the world's most powerful rivers, opened in June 2022 and paid for from the country's own budget.",
      picture: unsplash("padma-bridge", "The Padma Bridge stretching across the river on tall concrete piers", "md rifat", "a-large-bridge-spanning-over-a-body-of-water-UrvALLRrDYw"),
    },
    {
      title: "Dhaka Metro Rail",
      text: "The country's first metro line opened in December 2022, carrying commuters on an elevated line above the capital's traffic.",
      picture: unsplash("metro-rail", "A metro train waiting at an elevated station in Dhaka", "Muhammad", "a-train-station-with-a-train-on-the-tracks-iMw_Rk64_H4"),
    },
    {
      title: "Rice science that feeds millions",
      text: "The Bangladesh Rice Research Institute has released more than a hundred rice varieties, including ones that survive floods, salt water and drought.",
      picture: unsplash("rice-planting", "A farmer planting rice seedlings in a flooded paddy field", "Ashraful Haque Akash", "man-in-blue-t-shirt-planting-rice-on-fields-MuiC_cZL80Q"),
    },
    {
      title: "Money on every phone",
      text: "Mobile financial services let tens of millions of people send, save and pay with a basic phone, many of them for the first time.",
      picture: unsplash("mobile-money", "A hand holding a mobile phone", "Sheikh Abir Ali", "a-close-up-of-a-person-holding-a-cell-phone-pL8OUVj6ZF8"),
    },
    {
      title: "A parliament of light",
      text: "Louis Kahn's National Parliament House in Dhaka, completed in 1982, is counted among the landmark buildings of the twentieth century.",
      picture: unsplash("parliament", "The National Parliament House in Dhaka seen from directly above, ringed by its lake", "darkstar sr72", "an-aerial-view-of-a-building-with-a-circular-roof-32CxO3iQ0ME"),
    },
  ] satisfies Article[],
};

/* ── Biographies: the portrait slider ───────────────────────────────── */

export interface Life {
  name: string;
  years: string;
  text: string;
  picture: Picture;
}

export const BIOGRAPHIES = {
  title: "Minds that lit the way",
  lede: "Poets, scientists, reformers and leaders whose work still shapes how Bangladesh thinks, sings and dreams.",
  cta: { label: "Meet the people behind the nation", href: "/bangladesh/people" } satisfies Cta,
  lives: [
    {
      name: "Kazi Nazrul Islam",
      years: "1899–1976",
      text: "The national poet. His poem “Bidrohi” (The Rebel) gave Bengal the line “বল বীর—বল উন্নত মম শির!”",
      picture: commons("nazrul", "Kazi Nazrul Islam holding a flute"),
    },
    {
      name: "Begum Rokeya",
      years: "1880–1932",
      text: "Writer and educator who fought for girls' schooling; her 1905 story “Sultana's Dream” imagined a world run by women.",
      picture: commons("rokeya", "Portrait of Begum Rokeya"),
    },
    {
      name: "Jagadish Chandra Bose",
      years: "1858–1937",
      text: "Born in Mymensingh, a pioneer of radio and microwave science who also showed how sensitively plants respond to the world.",
      picture: commons("jcbose", "Jagadish Chandra Bose"),
    },
    {
      name: "Satyendra Nath Bose",
      years: "1894–1974",
      text: "While teaching at the University of Dhaka in 1924 he wrote the paper behind Bose–Einstein statistics. Every boson is named after him.",
      picture: commons("snbose", "Portrait of Satyendra Nath Bose"),
    },
    {
      name: "Lalon",
      years: "c. 1774–1890",
      text: "The Baul mystic of Kushtia, whose songs set humanity above caste and creed and are still sung across Bengal.",
      picture: commons("lalon", "A sketch of Lalon drawn by Jyotirindranath Tagore in 1889"),
    },
    {
      name: "Jasimuddin",
      years: "1903–1976",
      text: "The Polli Kobi, poet of rural Bengal, whose “Nakshi Kanthar Math” turned a village love story into a classic.",
      picture: commons("jasimuddin", "Portrait of Jasimuddin"),
    },
    {
      name: "Jibanananda Das",
      years: "1899–1954",
      text: "The poet of “Rupashi Bangla”, who found the whole world in Bengal's fields, rivers and evening light.",
      picture: commons("jibanananda", "Portrait of Jibanananda Das"),
    },
  ] satisfies Life[],
};

/* ── Animals & Nature: the square slider ────────────────────────────── */

export interface Wild {
  name: string;
  note: string;
  picture: Picture;
}

export const NATURE = {
  title: "Wild at heart",
  lede: "Mangroves, wetlands and hill forests make one of the richest living landscapes in South Asia.",
  cta: { label: "Explore the wild side of home", href: "/bangladesh/nature" } satisfies Cta,
  wild: [
    {
      name: "Royal Bengal tiger",
      note: "The national animal, at home in the mangroves of the Sundarbans.",
      picture: unsplash("tiger", "A Bengal tiger walking straight towards the camera", "Mike Marrah", "bengal-tiger-gRB4Euk4BYQ"),
    },
    {
      name: "Spotted deer",
      note: "Herds of chital graze where the Sundarbans forest meets the mudflats.",
      picture: unsplash("spotted-deer", "A herd of spotted deer on a mudflat in the Sundarbans", "Ashique Anan Abir", "a-herd-of-deer-standing-on-top-of-a-dirt-field-saEnr4oJ950"),
    },
    {
      name: "Doyel",
      note: "The magpie-robin, the national bird, singing from every village yard.",
      picture: unsplash("doyel", "A black and white magpie-robin perched on a branch", "Fareed Akhyear Chowdhury", "black-and-white-bird-on-brown-tree-branch-_-Z5XdSwcug"),
    },
    {
      name: "Shapla",
      note: "The white water lily, the national flower, opening on ponds and paddy ditches.",
      picture: unsplash("shapla", "A single white water lily blooming on dark water", "Avijit Biswas", "a-single-white-water-lily-blooms-in-dark-water-Sly7pOAxPjs"),
    },
    {
      name: "Ilish",
      note: "The hilsa, the national fish and the silver of the Padma.",
      picture: unsplash("hilsa", "Fresh hilsa fish laid out at a market", "Tarikul Raana", "a-group-of-fish-mSF6ikPWFrA"),
    },
    {
      name: "Kingfisher",
      note: "One of the many river birds that flash blue along the delta's canals.",
      picture: unsplash("kingfisher", "A kingfisher perched on a thin branch", "Ashique Anan Abir", "a-blue-bird-sitting-on-a-tree-branch-tUK86e_BlK8"),
    },
    {
      name: "Ratargul",
      note: "A freshwater swamp forest in Sylhet, where trees stand in water for months.",
      picture: unsplash("swamp-forest", "Tangled roots of a tree rising out of still water at Ratargul", "Nowshad Arefin", "a-tree-that-has-grown-out-of-the-water-SfBZbmyG79c"),
    },
  ] satisfies Wild[],
};

/* ── Geography & Travel: the pin map ────────────────────────────────── */

export interface Place {
  id: string;
  name: string;
  district: string;
  text: string;
  picture: Picture;
  /** Position on data/bangladesh-map.ts's 600 × 842 canvas. */
  at: { x: number; y: number };
}

const place = (p: Omit<Place, "at"> & { lat: number; lon: number }): Place => {
  const { lat, lon, ...rest } = p;
  return { ...rest, at: project(lat, lon) };
};

export const TRAVEL = {
  title: "Your journey starts here",
  lede: "Tap a pin to see what makes each place stand out, and start mapping a trip of your own.",
  cta: { label: "Explore all eight divisions", href: "/bangladesh/travel#eight-divisions" } satisfies Cta,
  places: [
    place({
      id: "lalbagh",
      name: "Lalbagh Fort",
      district: "Dhaka",
      text: "A Mughal fort begun in 1678 and never finished, with gardens, a mosque and a tomb in the heart of Old Dhaka.",
      picture: unsplash("lalbagh-fort", "Lalbagh Fort with its long pool and garden walk", "Shaikhul Imran", "a-large-building-with-a-long-pool-in-front-of-it-CwxaBHd2H9w"),
      lat: 23.719,
      lon: 90.388,
    }),
    place({
      id: "paharpur",
      name: "Paharpur",
      district: "Naogaon",
      text: "Somapura Mahavihara, an eighth-century Buddhist monastery and a UNESCO World Heritage Site.",
      picture: commons("paharpur_b", "Somapura Mahavihara at Paharpur seen from the air"),
      lat: 25.031,
      lon: 88.977,
    }),
    place({
      id: "tanguar",
      name: "Tanguar Haor",
      district: "Sunamganj",
      text: "A vast seasonal wetland under the Meghalaya hills, where winter brings flocks of migratory birds.",
      picture: unsplash("sunamganj-haor", "Clear wetland water with green hills on the horizon in Sunamganj", "Simanta Saha", "a-body-of-water-with-mountains-in-the-background-QMOWBMNN92g"),
      lat: 25.15,
      lon: 91.07,
    }),
    place({
      id: "ratargul",
      name: "Ratargul",
      district: "Sylhet",
      text: "Row a small boat through a flooded forest, where the trees stand in water for months of the year.",
      picture: unsplash("ratargul", "A boat gliding through the flooded trees of Ratargul", "Miraz Khan Salman", "a-person-in-a-boat-on-a-body-of-water-hykhZSM3S0g"),
      lat: 25.006,
      lon: 91.934,
    }),
    place({
      id: "srimangal",
      name: "Srimangal",
      district: "Moulvibazar",
      text: "Rolling tea gardens and rainforest trails in the country's tea capital.",
      picture: unsplash("srimangal-tea", "Rows of tea bushes between shade trees in a tea garden", "Mosharraf Hossain", "a-lush-green-tea-field-surrounded-by-trees-i3W2OJRKsL0"),
      lat: 24.307,
      lon: 91.73,
    }),
    place({
      id: "sajek",
      name: "Sajek Valley",
      district: "Rangamati",
      text: "A ridge-top village where you wake up above a sea of clouds.",
      picture: unsplash("sajek", "A small cabin on a hill above a sea of clouds at Sajek", "Md Parvez Hossen", "a-small-cabin-on-a-hill-above-the-clouds-yq4Fx0VNxHU"),
      lat: 23.382,
      lon: 92.294,
    }),
    place({
      id: "bandarban",
      name: "Bandarban",
      district: "Bandarban",
      text: "Cloud-wrapped hills, waterfalls and the home of the Marma, Bawm and Mro peoples.",
      picture: unsplash("bandarban", "Green hills of Bandarban wrapped in fog", "Shahriar Rahman", "a-lush-green-hillside-covered-in-fog-and-clouds-LGXQ9mqDzOk"),
      lat: 22.195,
      lon: 92.218,
    }),
    place({
      id: "coxsbazar",
      name: "Cox's Bazar",
      district: "Cox's Bazar",
      text: "Some 120 km of unbroken natural sea beach, among the longest on Earth.",
      picture: unsplash("coxs-bazar", "Waves rolling in at sunset on the beach at Cox's Bazar", "Masum Ahmed", "the-sun-is-setting-over-the-ocean-waves-dXj8iSUCydo"),
      lat: 21.427,
      lon: 92.006,
    }),
    place({
      id: "kuakata",
      name: "Kuakata",
      district: "Patuakhali",
      text: "A rare beach where you can watch the sun both rise and set over the sea.",
      picture: unsplash("kuakata", "A wooden boat resting on the sand at Kuakata", "Tanvir Hassan", "a-boat-sitting-on-top-of-a-sandy-beach-8fT8zBQ2kaw"),
      lat: 21.817,
      lon: 90.121,
    }),
    place({
      id: "sundarbans",
      name: "The Sundarbans",
      district: "Khulna",
      text: "One of the largest mangrove forests on Earth, home of the Royal Bengal tiger and a World Heritage Site since 1997.",
      picture: unsplash("mangroves", "Mangrove trees standing over still water in the Sundarbans", "Mamun Srizon", "lake-surrounded-with-tall-green-trees-qay3lNDSHzc"),
      lat: 21.95,
      lon: 89.18,
    }),
  ],
};

/* ── Arts & Culture: the tall cards ─────────────────────────────────── */

export interface Craft {
  name: string;
  note: string;
  picture: Picture;
}

export const CULTURE = {
  title: "Made by hand, sung by heart",
  lede: "UNESCO lists Baul songs, Jamdani weaving, Mangal Shobhajatra, Shital Pati mats and rickshaw painting among the intangible cultural heritage of humanity.",
  cta: { label: "Feel the culture you were born into", href: "/bangladesh/culture" } satisfies Cta,
  crafts: [
    {
      name: "Mangal Shobhajatra",
      note: "The Pohela Boishakh procession of giant masks, inscribed by UNESCO in 2016.",
      picture: unsplash("mangal-shobhajatra", "Giant painted masks carried above a New Year procession", "Samiul Haque Bhuyan", "procession-with-masks-and-large-figures-Bu9-CWTm2LQ"),
    },
    {
      name: "Rickshaw art",
      note: "Hand-painted rickshaws of Dhaka, inscribed by UNESCO in 2023.",
      picture: unsplash("rickshaw-art", "A rickshaw with a painted, fringed hood parked under a tree", "Sunny Hossain Meem", "a-bicycle-with-a-colorful-umbrella-M4jw2hiyMrw"),
    },
    {
      name: "Handloom",
      note: "Hand-spun thread feeds the looms behind Jamdani, the sheer muslin weave inscribed by UNESCO in 2013.",
      picture: unsplash("handloom", "A woman spinning thread on a traditional wooden wheel", "Michael Gluzman", "woman-spinning-thread-on-a-traditional-wooden-wheel-qDiOe4sIAho"),
    },
    {
      name: "Terracotta",
      note: "Temple walls told in fired clay, a Bengal tradition centuries old.",
      picture: unsplash("terracotta", "Carved terracotta panels on an old brick temple wall", "Shohanur Rahman Opu", "a-close-up-of-a-brick-wall-with-carvings-on-it-582EX34TRhQ"),
    },
    {
      name: "Pottery",
      note: "Potters still shape river clay into pots, lamps and toys by hand.",
      picture: unsplash("pottery", "A woman shaping clay pots on a table", "Mehedi Hasan", "a-woman-is-making-clay-pots-on-a-table-fn18W-soPSY"),
    },
    {
      name: "Pohela Falgun",
      note: "Yellow saris and flower garlands greet the first day of spring.",
      picture: unsplash("falgun", "A woman in a yellow sari holding red flowers", "Rejaul Karim", "a-woman-in-a-yellow-sari-holding-a-bouquet-of-flowers-3p-yKiwiGt0"),
    },
  ] satisfies Craft[],
};

/* ── Pro & Con: the debates ─────────────────────────────────────────── */

export interface Debate {
  question: string;
  pro: string;
  con: string;
}

export const PROCON = {
  title: "Questions worth arguing",
  lede: "Big questions about the country's future, with the strongest case on each side. Read both, then make up your own mind.",
  cta: { label: "Take a side and defend it", href: "/bangladesh/procon" } satisfies Cta,
  debates: [
    {
      question: "Should every student learn a trade alongside school subjects?",
      pro: "A practical skill gives every school leaver a way to earn, and it gives respect to work that the economy needs most.",
      con: "The school day is already full. Trades are better taught well in dedicated institutes than squeezed in everywhere.",
    },
    {
      question: "Should ministries and head offices move out of Dhaka?",
      pro: "Spreading government and business across divisional cities would ease the capital's crowding and bring jobs closer to home.",
      con: "Moving offices costs a great deal, and splitting decision-makers apart can slow down the services people rely on.",
    },
    {
      question: "Should the Sundarbans be closed to tourists?",
      pro: "Fewer boats and visitors would give the tiger, the deer and the mangroves room to recover.",
      con: "Careful tourism pays local guides and boatmen, and people protect what they have seen with their own eyes.",
    },
    {
      question: "Should English be taught from the first year of school?",
      pro: "An early start makes English easy, opening doors to global study, work and research.",
      con: "Children learn best in their mother tongue first; a strong grip on Bangla makes a second language easier later.",
    },
    {
      question: "Should phones be banned in classrooms?",
      pro: "Without phones, students focus better, talk to each other more and are bullied less online during the school day.",
      con: "Used well, a phone is a library and a calculator; schools should teach good habits rather than ban the tool.",
    },
  ] satisfies Debate[],
};

/* ── Taka: the money of Bangladesh ──────────────────────────────────── */

export const TAKA = {
  title: "The taka",
  text: "The taka (৳, BDT) has been the money of Bangladesh since 1972, managed by Bangladesh Bank, the central bank. One taka is a hundred poisha, and its name comes from the Sanskrit ṭaṅka, an old silver coin.",
  notes: [2, 5, 10, 20, 50, 100, 200, 500, 1000],
  facts: [
    {
      title: "Dressing the world",
      text: "Bangladesh is one of the world's largest exporters of clothing, and the garment industry employs millions, most of them women.",
      picture: unsplash("garments", "A worker tending spools of blue yarn on a factory machine", "Shanjir H | Photo4life AU", "woman-working-with-blue-yarn-on-a-machine-x8HkyOg19CM"),
    },
    {
      title: "Banking for the poor",
      text: "Grameen Bank and its founder Muhammad Yunus shared the 2006 Nobel Peace Prize for microcredit: small loans that let people build their own businesses.",
      picture: unsplash("taka-notes", "Hands fanning out a stack of 1000-taka banknotes", "Fayaz Ahmed Sunny", "hands-holding-a-fan-of-1000-bangladeshi-taka-banknotes-LlniHzPB1a8"),
    },
  ],
  cta: { label: "A visitor's guide to money", href: "/bangladesh/taka" } satisfies Cta,
};

/* ── Videos ─────────────────────────────────────────────────────────── */

export const VIDEOS = {
  title: "Bangladesh in motion",
  lede: "Rivers, streets and celebrations, filmed by the people who live them.",
  cta: { label: "Watch more of Bangladesh", href: "/bangladesh/videos" } satisfies Cta,
  films: [
    HERO.film,
    pexels("Haor wetlands and paddy fields from the air", "haor-wetland", "aerial-view-of-rural-landscapes-in-bangladesh-34059329"),
    pexels("Boats and boatmen on the Buriganga, Dhaka", "buriganga-boats", "bustling-riverside-market-in-dhaka-bangladesh-37115902"),
    pexels("Eid morning in the streets of Dhaka", "eid-dhaka", "colorful-eid-celebrations-in-dhaka-streets-31409962"),
    pexels("Rickshaws at the TSC, University of Dhaka", "rickshaws-tsc", "suhrawardy-udyan-tsc-26689635"),
    pexels("The national flag in the wind", "national-flag", "the-flag-of-bangladesh-on-a-flag-pole-3978630"),
  ],
};

/* ── Capability & Resources: what Bangladesh was born with ──────────── */

export interface Resource {
  /** The figure, as published. */
  value: string;
  label: string;
  text: string;
  source: { name: string; url: string };
}

const FAOSTAT = { name: "FAO, FAOSTAT", url: "https://www.fao.org/faostat/" };

export const RESOURCES = {
  title: "Born with the power to rise",
  lede: "Fertile soil, great rivers, a wide sea and a young people: Bangladesh was born with what it needs to feed itself and build its future.",
  cta: { label: "See where it can take us", href: "#invest" } satisfies Cta,
  picture: unsplash("fisher-mist", "A lone fisherman in a small boat on a misty river at dawn", "Shahariar Nerov", "a-lone-fisherman-in-a-boat-on-a-misty-morning-uddk4v8xu88", "50% 75%"),
  items: [
    {
      value: "3",
      label: "Rice harvests a year",
      text: "Aus, Aman and Boro: the delta's soil and water let farmers grow rice in three seasons.",
      source: { name: "Bangladesh Rice Research Institute", url: "https://brri.gov.bd/" },
    },
    {
      value: "3rd",
      label: "Largest rice grower on Earth",
      text: "After China and India, no country grows more rice.",
      source: FAOSTAT,
    },
    {
      value: "3rd",
      label: "Largest inland fish catch",
      text: "Rivers, haors and floodplains make one of the richest freshwater fisheries in the world.",
      source: { name: "FAO, The State of World Fisheries and Aquaculture 2022", url: "https://www.fao.org/publications/home/fao-flagship-publications/the-state-of-world-fisheries-and-aquaculture/2022/en" },
    },
    {
      value: "2nd",
      label: "Largest jute grower",
      text: "The golden fibre that once filled the world's grain sacks, now back as a green alternative to plastic.",
      source: FAOSTAT,
    },
    {
      value: "118,813 km²",
      label: "Of sea to work with",
      text: "Settled at international tribunals in 2012 and 2014, the Bay of Bengal waters open a blue economy of fish, ports and energy.",
      source: { name: "Ministry of Foreign Affairs, Bangladesh", url: "https://mofa.gov.bd/" },
    },
    {
      value: "$33.9 billion",
      label: "Sent home in 2025",
      text: "Remittances from Bangladeshis working abroad: the skill and courage of millions, turned into money for their families.",
      source: { name: "World Bank, World Development Indicators", url: "https://data.worldbank.org/country/bangladesh" },
    },
  ] satisfies Resource[],
};

/* ── Business & Investment: where to build, and a future to play with ── */

export interface Sector {
  id: string;
  name: string;
  text: string;
  icon: string;
}

export interface Lever {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** Where the slider starts: today's pace, as the model reads it. */
  start: number;
}

export type LeverId = "investment" | "exports" | "skills";

export const INVEST = {
  title: "Build the bright future",
  lede: "Choose the sectors to back and set the pace of investment, exports and skills. The graph redraws as you go, showing where income per person could reach by 2041.",
  sectors: [
    { id: "garments", name: "Garments", text: "One of the world's largest clothing exporters, moving up to higher-value fashion.", icon: "checkroom" },
    { id: "pharma", name: "Pharmaceuticals", text: "Local makers supply almost all of the home market and export abroad.", icon: "medication" },
    { id: "it", name: "IT services", text: "Young freelancers and software firms serving clients around the world.", icon: "terminal" },
    { id: "agro", name: "Agro-processing", text: "Turning rice, fish, fruit and jute into packaged goods for home and abroad.", icon: "agriculture" },
    { id: "shipbuilding", name: "Shipbuilding", text: "River yards already build ocean-going vessels for foreign buyers.", icon: "directions_boat" },
    { id: "leather", name: "Leather & footwear", text: "From hides to finished shoes, a sector with room to grow in value.", icon: "steps" },
    { id: "energy", name: "Clean energy", text: "Sun, wind and efficient power, so growth does not burn the future.", icon: "solar_power" },
    { id: "blue", name: "Blue economy", text: "Fisheries, ports, shipping and tourism along the Bay of Bengal.", icon: "waves" },
  ] satisfies Sector[],
  levers: {
    investment: { label: "Investment", unit: "% of GDP", min: 20, max: 40, step: 1, start: 30 },
    exports: { label: "Export growth", unit: "% a year", min: 0, max: 20, step: 1, start: 8 },
    skills: { label: "Young people with job skills", unit: "%", min: 10, max: 80, step: 5, start: 30 },
  } satisfies Record<LeverId, Lever>,
  /** The sectors the "current pace" line assumes. */
  startSectors: ["garments", "pharma"],
  /** Exports of goods in FY2024–25, US$ billion, from the Export Promotion Bureau (rounded). */
  exportsToday: 48,
  /** World Bank income thresholds (GNI per person, US$), rounded; drawn on the graph for scale. */
  thresholds: [
    { value: 4500, label: "Upper-middle income" },
    { value: 14000, label: "High income" },
  ],
  horizon: 2041,
  note: "An illustrative model, not a forecast. Each year income per person grows at a rate built from investment, export growth, skills and the sectors chosen. The years up to 2025 are World Bank data (GDP per person, current US$); income thresholds are the World Bank's, shown for scale.",
};

/* ── The welcome popup ──────────────────────────────────────────────── */

export const WELCOME = {
  title: "What do you think?",
  text: "Want to see how beautiful our Bangladesh is? Let's go find and explore the motherland.",
  cta: { label: "Let's gooo!", href: "#history" } satisfies Cta,
};

/* ── Join: the closing call ─────────────────────────────────────────── */

/**
 * Mahir's closing words (2026-11-01), kept word for word where he wrote
 * them and corrected only for grammar and order. Bangla stays in Bangla.
 */
export const JOIN = {
  title: "It's now or never",
  opening: "See the beauty, and see who we are. We are বাঙালি. We are বীরের জাতি, a nation of the brave. Yet we have forgotten our main spark:",
  spark: { line: "বল বীর—বল উন্নত মম শির!", source: "Kazi Nazrul Islam, “Bidrohi” (1922)" },
  paragraphs: [
    "That proves we have not respected our own bravery and dignity. It is a shame that, after so many sacrifices, we have lost our identity, our guts and our respect over very little things. We have forgotten that we all fought together for this country and won our independence. Unfortunately, but truly, laughter and shamelessness have become ours; it is what it is.",
    "So before pointing or blaming, realise what the fact is: every one of us has our own responsibility for every issue we face.",
  ],
  ask: "Ask yourself:",
  question: "“Did you really do anything productive today for the country, for the people, or for your own growth?”",
  close: [
    "Then join us and feel the vibe of Kandari. Join, track your productivity for your own growth, and become part of the history of a new era for Bangladesh.",
    "The choice is yours. It's time—it's now or never.",
  ],
  cta: { label: "Start your productivity—join with us", href: "/signup?next=/media/dashboard" } satisfies Cta,
  picture: unsplash("flag-mural", "The flag of Bangladesh painted across a schoolyard, seen from above", "Fahaduzzaman Fahad", "a-bangladeshi-flag-mural-forms-a-makeshift-soccer-field-O5rTZBjKUGk"),
};

/* ── Every credit, for the footer ───────────────────────────────────── */

export const CREDITS: { label: string; credit: Credit }[] = [
  ...HISTORY.cards.map((c) => ({ label: c.title, credit: c.picture.credit })),
  ...SCIENCE.articles.map((a) => ({ label: a.title, credit: a.picture.credit })),
  ...BIOGRAPHIES.lives.map((l) => ({ label: l.name, credit: l.picture.credit })),
  ...NATURE.wild.map((w) => ({ label: w.name, credit: w.picture.credit })),
  ...TRAVEL.places.map((p) => ({ label: p.name, credit: p.picture.credit })),
  ...CULTURE.crafts.map((c) => ({ label: c.name, credit: c.picture.credit })),
  ...TAKA.facts.map((f) => ({ label: f.title, credit: f.picture.credit })),
  ...VIDEOS.films.map((f) => ({ label: f.title, credit: f.credit })),
  { label: RESOURCES.title, credit: RESOURCES.picture.credit },
  { label: JOIN.title, credit: JOIN.picture.credit },
];
