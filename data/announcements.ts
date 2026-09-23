/**
 * Header announcement ticker — jobs, events, news and releases.
 *
 * ── Placeholder data ─────────────────────────────────────────────────
 *
 * Every entry here is mock copy for layout. Dates, deadlines and
 * programmes are not real commitments — replace them from the content
 * tables (CLAUDE.md §7) before launch. Entries are deliberately about
 * Kandari-Lab's own activity, never third-party news, so nothing on the
 * ticker puts words in another organisation's mouth.
 *
 * Links use root-anchored paths ("/#rd-labs") because the header renders
 * on every page, and a bare "#rd-labs" would scroll nowhere off the home
 * page.
 */

export type AnnouncementKind = "job" | "event" | "news" | "release" | "program";

export interface Announcement {
  id: string;
  kind: AnnouncementKind;
  text: string;
  /** Call to action shown after the text, e.g. "আবেদন করুন". */
  cta: string;
  href: string;
  /** Flags a time-sensitive item with a red "নতুন" chip. */
  isNew?: boolean;
}

/** Chip label and colour per kind. Classes are literal so Tailwind keeps them. */
export const announcementKinds: Record<
  AnnouncementKind,
  { label: string; icon: string; chip: string }
> = {
  job: {
    label: "চাকরি",
    icon: "work",
    chip: "border-emerald-200 bg-emerald-50 text-bd-green",
  },
  event: {
    label: "ইভেন্ট",
    icon: "event",
    chip: "border-orange-200 bg-orange-50 text-bdorange-600",
  },
  news: {
    label: "আজকের খবর",
    icon: "newspaper",
    chip: "border-slate-200 bg-slate-100 text-slate-700",
  },
  release: {
    label: "রিলিজ",
    icon: "rocket_launch",
    chip: "border-teal-200 bg-teal-50 text-teal-700",
  },
  program: {
    label: "প্রোগ্রাম",
    icon: "school",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
  },
};

export const announcements: Announcement[] = [
  {
    id: "job-embedded",
    kind: "job",
    text: "নতুন চাকরির সুযোগ: এমবেডেড ফার্মওয়্যার ইঞ্জিনিয়ার (আপনজন ওয়্যারেবল টিম)",
    cta: "আবেদন করুন",
    href: "/#leadership",
    isNew: true,
  },
  {
    id: "event-fair",
    kind: "event",
    text: "আসন্ন কাণ্ডারী ইনোভেশন ফেয়ার — তরুণ উদ্ভাবকদের প্রজেক্ট জমা চলছে",
    cta: "রেজিস্ট্রেশন",
    href: "/#innovation",
    isNew: true,
  },
  {
    id: "news-today",
    kind: "news",
    text: "আজকের শীর্ষ খবর: দেশের স্বাস্থ্য, প্রযুক্তি ও জনসেবার সর্বশেষ আপডেট",
    cta: "পড়ুন",
    href: "/ajker-bangladesh",
  },
  {
    id: "program-intern",
    kind: "program",
    text: "R&D ইন্টার্নশিপ — আড়াই মাসের নতুন ব্যাচে আবেদন শুরু",
    cta: "আবেদন করুন",
    href: "/#rd-labs",
  },
  {
    id: "release-swasti",
    kind: "release",
    text: "স্বস্তি (SWASTI) অ্যাপের বেটা সংস্করণ — আর্লি অ্যাক্সেসের জন্য নাম লেখান",
    cta: "যোগ দিন",
    href: "/#kandari-profile",
  },
  {
    id: "job-ml",
    kind: "job",
    text: "নিয়োগ চলছে: বাংলা NLP / মেশিন লার্নিং ইঞ্জিনিয়ার",
    cta: "আবেদন করুন",
    href: "/#leadership",
  },
  {
    id: "event-hackathon",
    kind: "event",
    text: "হেলথটেক হ্যাকাথন — ‘সোনালি দুই ঘণ্টা’ সমস্যার সমাধানে দল গঠন করুন",
    cta: "টিম রেজিস্টার",
    href: "/#innovation",
  },
  {
    id: "news-village",
    kind: "news",
    text: "‘এক গ্রাম, এক স্বাস্থ্যকেন্দ্র’ — গ্রামীণ স্মার্ট ফার্মেসি পাইলটের অগ্রগতি",
    cta: "বিস্তারিত",
    href: "/#rural-network",
  },
];
