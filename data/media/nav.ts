/** Navigation for শিক্ষিতদের মিডিয়া. Icons are resolved in the shell. */
export type NavIcon =
  | "feed"
  | "market"
  | "jobs"
  | "messages"
  | "events"
  | "classroom"
  | "news"
  | "teams"
  | "challenges"
  | "civic"
  | "notes"
  | "dashboard"
  | "wallet"
  | "profile"
  | "create"
  | "explore"
  | "people"
  | "academy";

export interface MediaNavItem {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: "messages";
  /** One line for the explore page. */
  hint?: string;
}

export const mediaNavGroups: { title: string; items: MediaNavItem[] }[] = [
  {
    title: "শেখা ও কাজ",
    items: [
      { href: "/media", label: "ফিড", icon: "feed", hint: "জীবন, প্রতিভা, দক্ষতা, গবেষণা, বাজার — সবার পোস্ট এক জায়গায়" },
      { href: "/media/academy", label: "একাডেমি", icon: "academy", hint: "কাণ্ডারী তৈরি একাডেমি — বিনামূল্যে ভর্তি, হাতে-কলমে ক্লাস, প্যানেল ইন্টারভিউ, যাচাইযোগ্য সার্টিফিকেট" },
      { href: "/media/classroom", label: "ক্লাসরুম", icon: "classroom", hint: "ব্যাচ, ল্যাব, রুটিন, দায়িত্বের পালা, ক্লাস চ্যালেঞ্জ" },
      { href: "/media/market", label: "বাজার", icon: "market", hint: "যা পারেন বিক্রি করুন, দরদাম করে কিনুন" },
      { href: "/media/jobs", label: "কাজ", icon: "jobs", hint: "খাত অনুযায়ী কাজ, ন্যায্য মজুরি" },
    ],
  },
  {
    title: "মানুষ",
    items: [
      { href: "/media/messages", label: "বার্তা", icon: "messages", badge: "messages", hint: "হায়ার, দরদাম, চুক্তি" },
      { href: "/media/people", label: "মানুষ", icon: "people", hint: "দক্ষ মানুষ খুঁজুন, অনুসরণ করুন" },
      { href: "/media/together", label: "টিম · উদ্যোগ · চ্যালেঞ্জ", icon: "teams", hint: "টিম রুমে যাত্রা, মিশন, লক্ষ্য; গাছ লাগানো থেকে কোড চ্যালেঞ্জ — এক পাতায়" },
    ],
  },
  {
    title: "নাগরিক",
    items: [
      { href: "/media/news", label: "নাগরিক জীবন", icon: "news", hint: "আজকের খবর — সকাল, দুপুর, সন্ধ্যা, রাতের শিরোনাম, সারাংশ আর বিনোদন" },
      { href: "/media/civic", label: "নাগরিক বার্তা", icon: "civic", hint: "অপরাধ, এলাকার সমস্যা, সাহায্য — ছবি-ভিডিওসহ, এলাকাবাসী নিশ্চিত করেন" },
    ],
  },
  {
    title: "আমার",
    items: [
      { href: "/media/notes", label: "নোট", icon: "notes", hint: "স্টিকি নোট, আজকের সেরা কাজ" },
      { href: "/media/dashboard", label: "মাটির ব্যাংক", icon: "dashboard", hint: "আয়, বিক্রি, অর্ডার, ব্যালান্স, উত্তোলন" },
      { href: "/media/me", label: "প্রোফাইল", icon: "profile", hint: "আপনার পোর্টফোলিও" },
    ],
  },
];

export const mediaNav: MediaNavItem[] = mediaNavGroups.flatMap((g) => g.items);

/** Phone bottom bar; the centre item creates a post. */
export const mediaTabs: MediaNavItem[] = [
  { href: "/media", label: "ফিড", icon: "feed" },
  { href: "/media/explore", label: "আবিষ্কার", icon: "explore" },
  { href: "/media/post/new", label: "পোস্ট", icon: "create" },
  { href: "/media/market", label: "বাজার", icon: "market" },
  { href: "/media/me", label: "আমি", icon: "profile" },
];
