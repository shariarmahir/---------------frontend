/**
 * The home page's banner gallery: one banner for each thing Kandari-Lab
 * asks a citizen to do, in the order the header offers them. Copy follows
 * what each page really does (its own metadata), nothing more.
 *
 * Photographs are Wikimedia Commons files (public/promos/ad-*.webp, cut to
 * 2000 px wide), credited on /bangladesh as their licences require. The
 * credits are repeated here rather than imported from data/media, which
 * stays private to /media (CLAUDE.md §1).
 */

import type { Photo } from "./bangladesh";

export type PromoField = "navy" | "cobalt" | "ink";

export interface PhotoCredit {
  author: string;
  license: string;
  source: string;
}

export interface PromoPhoto {
  src: string;
  alt: string;
  /** CSS object-position, when the subject sits off centre. */
  position?: string;
  credit: PhotoCredit;
}

export type PromoAction = { label: string; href: string } | { label: string; opens: "recorder" };

export interface Promo {
  id: string;
  /** The banner's name, as the header writes it. */
  label: string;
  /** The Bangla headline. */
  title: string;
  body: string;
  action: PromoAction;
  field: PromoField;
  photo: PromoPhoto;
}

export const promos: Promo[] = [
  {
    id: "record",
    label: "Record",
    title: "অন্যায় দেখলে, প্রমাণ রাখুন",
    body: "Voice or video in a single tap, with a black screen that keeps the phone looking idle while it records.",
    action: { label: "রেকর্ড শুরু করুন", opens: "recorder" },
    field: "ink",
    photo: {
      src: "/promos/ad-record.webp",
      alt: "সূর্যাস্তের আলোয় মোবাইল ফোনে ছবি তুলছেন একজন",
      position: "50% 40%",
      credit: {
        author: "ThibautRe",
        license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:Person_capturing_a_sunset_on_a_smartphone.jpg",
      },
    },
  },
  {
    id: "protibad",
    label: "প্রতিবাদ",
    title: "চুপ থাকবেন না, প্রতিবাদ করুন",
    body: "Report extortion, bribery, land grabbing or a denied service, find the authority that handles it, and keep a public record.",
    action: { label: "অভিযোগ জানান", href: "/protibad" },
    field: "navy",
    photo: {
      src: "/promos/ad-protibad.webp",
      alt: "পতাকা হাতে রাস্তায় শিক্ষার্থীদের প্রতিবাদ, ২০২৪",
      credit: {
        author: "Rayhan9d",
        license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:6.Bangladesh_quota_reform_movement_2024.jpg",
      },
    },
  },
  {
    id: "nagorik",
    label: "নাগরিক দায়িত্ব",
    title: "অধিকার জানুন, দায়িত্ব পালন করুন",
    body: "Your constitutional rights, the helplines that answer, and the duties each of us owes the country, with a nightly self-check.",
    action: { label: "নাগরিক দায়িত্ব দেখুন", href: "/nagorik" },
    field: "cobalt",
    photo: {
      src: "/promos/ad-nagorik.webp",
      alt: "জাতীয় সংসদ ভবন, ঢাকা",
      credit: {
        author: "MD SAIFUL AMIN",
        license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6%E0%A7%87%E0%A6%B0_%E0%A6%9C%E0%A6%BE%E0%A6%A4%E0%A7%80%E0%A6%AF%E0%A6%BC_%E0%A6%B8%E0%A6%82%E0%A6%B8%E0%A6%A6_%E0%A6%AD%E0%A6%AC%E0%A6%A8_16.jpg",
      },
    },
  },
  {
    id: "bangladesh",
    label: "বাংলাদেশ সমস্যা ও সমাধান",
    title: "সমস্যা চিনুন, সমাধান গড়ুন",
    body: "The country’s story, its 32 mapped problems pixel by pixel, and a realistic solution for each one.",
    action: { label: "সমস্যা ও সমাধান দেখুন", href: "/bangladesh" },
    field: "ink",
    photo: {
      src: "/promos/ad-bangladesh.webp",
      alt: "সূর্যাস্তে পদ্মা নদীর তীরে নৌকা",
      credit: {
        author: "Pantho Reja bd",
        license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:Boats_are_on_Padma_river.jpg",
      },
    },
  },
  {
    id: "media",
    label: "শিক্ষিতদের মিডিয়া",
    title: "দক্ষতা দেখান, যাচাই পান, কাজ পান",
    body: "Post your work, rate yourself honestly, let the community verify it, and get hired at fair pay.",
    action: { label: "মিডিয়ায় যোগ দিন", href: "/media" },
    field: "navy",
    photo: {
      src: "/promos/ad-media.webp",
      alt: "ল্যাপটপে একসঙ্গে কাজ করছেন তরুণেরা",
      credit: {
        author: "Ciell",
        license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:Hackathon_participants_20221112-3.jpg",
      },
    },
  },
  {
    id: "research",
    label: "R&D",
    title: "দেশের প্রশ্ন, দেশের গবেষণা",
    body: "Read, review and publish research on Bangladesh’s problems, from the lab’s own work to yours.",
    action: { label: "গবেষণা দেখুন", href: "/research" },
    field: "cobalt",
    photo: {
      src: "/promos/ad-research.webp",
      alt: "সার্কিট বোর্ডে সোল্ডারিং করছেন একজন গবেষক",
      credit: {
        author: "Krzysztof Popławski",
        license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:8_%C5%9Al%C4%85ski_Festiwal_Nauki,_MCK,_Katowice,,_09.12.2024,_1234.jpg",
      },
    },
  },
];

/** The promo photographs with their credits, for the credits list on /bangladesh (the cards themselves carry none). */
export const promoCredits: Photo[] = promos.map(({ photo: { src, alt, credit } }) => {
  const cc = /^CC (BY(?:-SA)?) (\d\.\d)$/.exec(credit.license);
  return {
    src,
    alt,
    credit: {
      author: credit.author,
      license: credit.license,
      sourceUrl: credit.source,
      ...(cc ? { licenseUrl: `https://creativecommons.org/licenses/${cc[1].toLowerCase()}/${cc[2]}` } : {}),
    },
  };
});
