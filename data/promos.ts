/**
 * The home page's banner gallery: one banner for each thing Kandari-Lab
 * asks a citizen to do, in the order the header offers them. Copy follows
 * what each page really does (its own metadata), nothing more.
 *
 * Photographs are Wikimedia Commons files, credited on the banner as their
 * licences require. The credits are repeated here rather than imported from
 * data/media, which stays private to /media (CLAUDE.md §1). The two
 * screenshots are Kandari-Lab's own platforms.
 */

import type { Photo } from "./bangladesh";

export type PromoField = "navy" | "cobalt" | "ink";

export interface PhotoCredit {
  author: string;
  license: string;
  source: string;
}

export type PromoArt =
  | { kind: "photo"; src: string; alt: string; position?: string; credit: PhotoCredit }
  | { kind: "screen"; src: string; alt: string }
  | { kind: "record" };

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
  art: PromoArt;
}

export const promos: Promo[] = [
  {
    id: "record",
    label: "Record",
    title: "অন্যায় দেখলে, প্রমাণ রাখুন",
    body: "Voice or video in a single tap, with a black screen that keeps the phone looking idle while it records.",
    action: { label: "রেকর্ড শুরু করুন", opens: "recorder" },
    field: "ink",
    art: { kind: "record" },
  },
  {
    id: "protibad",
    label: "প্রতিবাদ",
    title: "চুপ থাকবেন না, প্রতিবাদ করুন",
    body: "Report extortion, bribery, land grabbing or a denied service, find the authority that handles it, and keep a public record.",
    action: { label: "অভিযোগ জানান", href: "/protibad" },
    field: "navy",
    art: {
      kind: "photo",
      src: "/media/civic-waste.webp",
      alt: "ঢাকার রাস্তায় পরিচ্ছন্নতাকর্মীরা বর্জ্য সরাচ্ছেন",
      position: "60% 50%",
      credit: {
        author: "Press Information Department",
        license: "Public domain",
        source: "https://commons.wikimedia.org/wiki/File:Dhaka_South_City_Corporation_sanitation_workers_remove_sacrificial_animal_waste,_Hazaribagh,_Dhaka,_Bangladesh,_2019-08-13_(PID-0037426).jpg",
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
    art: {
      kind: "photo",
      src: "/media/civic-flood.webp",
      alt: "বৃষ্টিতে ডুবে যাওয়া ঢাকার রাস্তা",
      credit: {
        author: "Aashaa",
        license: "CC BY-SA 3.0",
        source: "https://commons.wikimedia.org/wiki/File:Rain_filled_Dhaka_Street,2014.jpg",
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
    art: {
      kind: "photo",
      src: "/media/flood.webp",
      alt: "সারিয়াকান্দির চরে বন্যাকবলিত মানুষ",
      credit: {
        author: "TausifAlHossain",
        license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:Sariakandi_Char_Land_Flood_Affected_Bangladesh.jpg",
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
    art: { kind: "screen", src: "/promos/media-feed.webp", alt: "শিক্ষিতদের মিডিয়ার ফিড: দক্ষতা পোস্ট, যাচাই আর আজকের পরিকল্পনা" },
  },
  {
    id: "research",
    label: "R&D",
    title: "দেশের প্রশ্ন, দেশের গবেষণা",
    body: "Read, review and publish research on Bangladesh’s problems, from the lab’s own work to yours.",
    action: { label: "গবেষণা দেখুন", href: "/research" },
    field: "cobalt",
    art: { kind: "screen", src: "/promos/research.webp", alt: "গবেষণাকোষের প্রধান পাতা: দেশের প্রশ্ন, দেশের গবেষণা" },
  },
];

/** The promo photographs with their credits, for the credits list on /bangladesh (the cards themselves carry none). */
export const promoCredits: Photo[] = promosPhotos();

function promosPhotos(): Photo[] {
  const out: Photo[] = [];
  for (const p of promos) {
    if (p.art.kind !== "photo") continue;
    const { author, license, source } = p.art.credit;
    const cc = /^CC (BY(?:-SA)?) (\d\.\d)$/.exec(license);
    out.push({
      src: p.art.src,
      alt: p.art.alt,
      credit: {
        author,
        license,
        sourceUrl: source,
        ...(cc ? { licenseUrl: `https://creativecommons.org/licenses/${cc[1].toLowerCase()}/${cc[2]}` } : {}),
      },
    });
  }
  return out;
}
