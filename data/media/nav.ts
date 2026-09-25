/** Navigation for শিক্ষিতদের মিডিয়া. Icons are resolved in the shell. */
export type NavIcon =
  | "feed"
  | "market"
  | "jobs"
  | "messages"
  | "events"
  | "teams"
  | "challenges"
  | "civic"
  | "notes"
  | "dashboard"
  | "wallet"
  | "profile"
  | "create"
  | "explore";

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
    title: "প্রধান",
    items: [
      { href: "/media", label: "ফিড", icon: "feed", hint: "দক্ষতা, শিক্ষা, গবেষণা ও সবার পোস্ট" },
      { href: "/media/market", label: "বাজার", icon: "market", hint: "যা পারেন বিক্রি করুন, দরদাম করে কিনুন" },
      { href: "/media/jobs", label: "কাজ", icon: "jobs", hint: "খাত অনুযায়ী কাজ, ন্যায্য মজুরি" },
      { href: "/media/messages", label: "বার্তা", icon: "messages", badge: "messages", hint: "হায়ার, দরদাম, চুক্তি" },
    ],
  },
  {
    title: "কমিউনিটি",
    items: [
      { href: "/media/events", label: "উদ্যোগ", icon: "events", hint: "গাছ লাগানো, পরিষ্কার, রক্তদান — স্পনসরসহ" },
      { href: "/media/teams", label: "টিম ও গ্রুপ", icon: "teams", hint: "প্রোডাক্টিভ ফ্যামিলি, ল্যাব, ভ্রমণ দল" },
      { href: "/media/challenges", label: "চ্যালেঞ্জ", icon: "challenges", hint: "কোড, ডিজাইন, গবেষণা — পুরস্কারসহ" },
      { href: "/media/civic", label: "নাগরিক", icon: "civic", hint: "এলাকার সমস্যা, সতর্কতা, সমাধান" },
    ],
  },
  {
    title: "আমার",
    items: [
      { href: "/media/notes", label: "নোট", icon: "notes", hint: "দিনের সেরা কাজ ও স্মৃতি" },
      { href: "/media/dashboard", label: "ড্যাশবোর্ড", icon: "dashboard", hint: "আয়, রেটিং, সার্টিফিকেট, সময়" },
      { href: "/media/wallet", label: "ওয়ালেট", icon: "wallet", hint: "ব্যালান্স, এসক্রো, উত্তোলন" },
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
