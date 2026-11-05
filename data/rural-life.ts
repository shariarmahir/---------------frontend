/**
 * Rural life and struggle — photographs for "বাংলাদেশ সমস্যা ও সমাধান".
 *
 * Wikimedia Commons files under CC BY / CC BY-SA, downloaded at 1600px into
 * /public/bangladesh/rural (September 2026) and always shown with their
 * credit. `problem` is the dossier point (1–32) the scene speaks to — the
 * link is our reading of the photo, not a claim about the people in it.
 */

import type { Photo } from "./bangladesh";

export interface RuralStory {
  id: string;
  photo: Photo;
  /** Where / who, in a few words. */
  place: string;
  /** The everyday pain the scene carries. */
  pain: string;
  problem: number;
}

/** Credit for a Commons file under "CC BY[-SA] x.y". */
function cc(author: string, license: string, file: string) {
  const [, kind, version] = license.split(" ");
  return {
    author,
    license,
    licenseUrl: `https://creativecommons.org/licenses/${kind.toLowerCase()}/${version}`,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
  };
}

export const ruralStories: RuralStory[] = [
  {
    id: "paddy-bales",
    photo: {
      src: "/bangladesh/rural/paddy-bales.jpg",
      alt: "ধান কাটার পর মাথায় ধানের আঁটি নিয়ে ক্ষেতের আল ধরে বাড়ি ফিরছেন কৃষকেরা",
      credit: cc("Zaheed Sarwer Khan", "CC BY 4.0", "Carrying_paddy_bales_01.jpg"),
    },
    place: "ধানক্ষেত, কাটার মৌসুম",
    pain: "সারা মৌসুমের খাটুনি — অথচ হাটে ধানের দাম ঠিক করে দেন অন্য কেউ।",
    problem: 2,
  },
  {
    id: "teesta-fisher",
    photo: {
      src: "/bangladesh/rural/teesta-fisher.jpg",
      alt: "রংপুরে তিস্তা নদীতে ছোট নৌকা থেকে জাল ফেলার প্রস্তুতি নিচ্ছেন এক জেলে",
      credit: cc("Muhammad Amdad Hossain", "CC BY-SA 4.0", "Fishing_in_teesta_river.jpg"),
    },
    place: "তিস্তা, রংপুর",
    pain: "নদী শুকালে জাল খালি, নদী ফুলে উঠলে ঘর ভাসে — দুই দিকেই ঝুঁকি।",
    problem: 18,
  },
  {
    id: "char-flood",
    photo: {
      src: "/bangladesh/rural/char-flood.jpg",
      alt: "যমুনার চরে বন্যায় ডুবে যাওয়া বসতি, পানির মাঝে টিনের ঘর",
      credit: cc("TausifAlHossain", "CC BY-SA 4.0", "Sariakandi_Char_Land_Flood_Affected_Bangladesh.jpg"),
    },
    place: "চর এলাকা, সারিয়াকান্দি",
    pain: "প্রতি বর্ষায় ঘর, গবাদিপশু আর স্কুল একসাথে পানির নিচে।",
    problem: 16,
  },
  {
    id: "teesta-erosion",
    photo: {
      src: "/bangladesh/rural/teesta-erosion.jpg",
      alt: "তিস্তার ভাঙনে ধসে পড়া পাড়, নদীতে তলিয়ে যাচ্ছে জমি",
      credit: cc("Ibrahim Husain Meraj", "CC BY-SA 3.0", "Land_Erosion_by_Tista_River_in_Sundorganj_Thana_3.JPG"),
    },
    place: "নদীভাঙন, সুন্দরগঞ্জ",
    pain: "এক রাতে পৈতৃক জমি নদীতে — দলিল থাকে, মাটি থাকে না।",
    problem: 17,
  },
  {
    id: "brick-kiln-family",
    photo: {
      src: "/bangladesh/rural/brick-kiln-family.jpg",
      alt: "ইটভাটায় মাটিতে বসে কাঁচা ইট বানাচ্ছেন নারী-পুরুষ শ্রমিকেরা",
      credit: cc("Frameofashik", "CC BY-SA 4.0", "Brick_Kiln_Workers_05.jpg"),
    },
    place: "ইটভাটা",
    pain: "ভোর থেকে সন্ধ্যা রোদে-ধুলোয় কাজ, মজুরি দিনের হিসাবে — ছুটি নেই, চুক্তি নেই।",
    problem: 19,
  },
  {
    id: "brick-hands",
    photo: {
      src: "/bangladesh/rural/brick-hands.jpg",
      alt: "ছাঁচে কাদা ভরে ইট বানানো শ্রমিকের হাত",
      credit: cc("Frameofashik", "CC BY-SA 4.0", "Brick_Kiln_Workers_07.jpg"),
    },
    place: "শ্রমের হাত",
    pain: "দেশ গড়ার ইট এই হাতে তৈরি — অথচ এই হাতের মালিকের নাম কোনো তথ্যভান্ডারে নেই।",
    problem: 8,
  },
  {
    id: "rickshaw-rain",
    photo: {
      src: "/bangladesh/rural/rickshaw-rain.jpg",
      alt: "বৃষ্টিভেজা শহরের রাস্তায় রিকশা টানছেন এক রিকশাচালক",
      credit: cc("Frameofashik", "CC BY-SA 4.0", "A_rickshaw_puller_in_a_rainy_city_02.jpg"),
    },
    place: "গ্রাম ছেড়ে শহরে",
    pain: "গ্রামে কাজ নেই বলে শহরে রিকশা — বৃষ্টি, জলাবদ্ধতা আর রোজকার ভাড়ার চাপ।",
    problem: 3,
  },
  {
    id: "tea-worker",
    photo: {
      src: "/bangladesh/rural/tea-worker.jpg",
      alt: "শ্রীমঙ্গলের চা-বাগানে মাথায় টোকা পরে পাতা তুলছেন এক চা-শ্রমিক নারী",
      credit: cc("Ayman Nakib Badhan", "CC BY-SA 4.0", "Grace_in_Labor.jpg"),
    },
    place: "চা-বাগান, শ্রীমঙ্গল",
    pain: "দেশের চা যায় বিশ্বে, কিন্তু যিনি পাতা তোলেন তাঁর মজুরি আর চিকিৎসা এখনো লড়াই।",
    problem: 19,
  },
  {
    id: "garment-machine",
    photo: {
      src: "/bangladesh/rural/garment-machine.jpg",
      alt: "পোশাক কারখানায় মেশিনে কাজ করছেন শ্রমিকেরা",
      credit: cc("Fahad Faisal", "CC BY-SA 4.0", "RMG_Bangladesh.jpg"),
    },
    place: "পোশাক কারখানা",
    pain: "গ্রামের মেয়েটি শহরে এসে রপ্তানি টিকিয়ে রাখেন — কারখানা বন্ধ হলে এক দিনে বেকার।",
    problem: 4,
  },
  {
    id: "cyclone-shelter",
    photo: {
      src: "/bangladesh/rural/cyclone-shelter.jpg",
      alt: "দক্ষিণাঞ্চলের এক ঘূর্ণিঝড় আশ্রয়কেন্দ্রে সভায় বসা গ্রামের মানুষ",
      credit: cc("DFID - UK Department for International Development", "CC BY-SA 2.0", "Bangladeshi_men_in_a_cyclone_shelter,_May_2012_(8406366902).jpg"),
    },
    place: "ঘূর্ণিঝড় আশ্রয়কেন্দ্র, উপকূল",
    pain: "আশ্রয়কেন্দ্র প্রাণ বাঁচায় — ঝড় থামলে আবার শূন্য থেকে শুরু।",
    problem: 16,
  },
  {
    id: "rural-kitchen",
    photo: {
      src: "/bangladesh/rural/rural-kitchen.jpg",
      alt: "মাটির চুলা আর হাঁড়ি-পাতিলে সাজানো গ্রামের রান্নাঘর",
      credit: cc("Muhammad Amdad Hossain", "CC BY-SA 4.0", "Rural_Kitchen_Setup.jpg"),
    },
    place: "গ্রামের রান্নাঘর",
    pain: "চাল-ডাল-তেলের দাম বাড়লে সবার আগে টান পড়ে এই হাঁড়িতে।",
    problem: 19,
  },
  {
    id: "sowing-paddy",
    photo: {
      src: "/bangladesh/rural/sowing-paddy.jpg",
      alt: "কাদাজলে নুয়ে ধানের চারা রোপণ করছেন এক কৃষক",
      credit: cc("Frameofashik", "CC BY-SA 4.0", "Farmer_sows_paddy_in_the_field.jpg"),
    },
    place: "চারা রোপণ",
    pain: "সার, বীজ, সেচ — সবকিছুর খরচ বাড়ে; পরামর্শ দেওয়ার কৃষি কর্মকর্তা মাঠে কম।",
    problem: 9,
  },
];

/** Wide scenes used as chapter backdrops; they are credited in the gallery below. */
export const ruralBackdrops = {
  farmerCattle: {
    src: "/bangladesh/rural/farmer-cattle.jpg",
    alt: "কাটা ধানক্ষেতের মাঝের সরু মেঠোপথ ধরে গরু নিয়ে হাঁটছেন এক কৃষক",
    credit: cc("A S M Jobaer", "CC BY-SA 4.0", "A_farmer_walking_with_his_cattle_on_a_rural_path_amidst_paddy_fields,_Bangladesh_2026_01.jpg"),
  },
  farmerCow: {
    src: "/bangladesh/rural/farmer-cow.jpg",
    alt: "সবুজ ধানক্ষেতের পাশ দিয়ে গরু নিয়ে হাঁটছেন এক কৃষক",
    credit: cc("Khairul Anam Nafis Sarker", "CC BY-SA 4.0", "Rural_farmer_with_a_cow_in_a_paddy_field,_Bangladesh.jpg"),
  },
  floodBoat: {
    src: "/bangladesh/rural/village-flood-boat.jpg",
    alt: "বন্যার পানিতে ডুবে থাকা গ্রামের মাঝ দিয়ে নৌকায় চলছেন মানুষ",
    credit: cc("Frameofashik", "CC BY-SA 4.0", "Bangladeshi_Rural_Stories_115.jpg"),
  },
  erosionWalk: {
    src: "/bangladesh/rural/erosion-walk.jpg",
    alt: "নদীভাঙনে খাড়া হয়ে যাওয়া পাড়ের ওপর দিয়ে হেঁটে যাচ্ছেন কয়েকজন",
    credit: cc("Helena Wright", "CC BY 2.0", "River_erosion_in_Bangladesh_(15255986711).jpg"),
  },
} satisfies Record<string, Photo>;

/** Every rural photo with its credit, for the credits list. */
export const ruralCredits: Photo[] = [...ruralStories.map((s) => s.photo), ...Object.values(ruralBackdrops)];
