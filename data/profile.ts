import type { PostStats } from "@/data/feed";

/**
 * Mock credentials for the member portal. This is a front-end demo with no
 * auth backend — the check runs in the browser and the "session" is a
 * localStorage flag, so it keeps nobody out. Replace with a real provider
 * before this goes anywhere near production data.
 */
export const MOCK_EMAIL = "mahir@kandari-lab.com";
export const MOCK_PASSWORD = "kandari";

/** localStorage key holding the mock session flag. */
export const SESSION_KEY = "kandari-session";

export interface ProfileUser {
  name: string;
  nameBn: string;
  handle: string;
  initials: string;
  joined: string;
  following: number;
  followers: number;
  postCount: number;
}

export const profileUser: ProfileUser = {
  name: "Mahir Shariar Mahin",
  nameBn: "মাহির শারিয়ার মাহিন",
  handle: "@mahir_kandari",
  initials: "MM",
  joined: "সেপ্টেম্বর ২০২৬",
  following: 1,
  followers: 0,
  postCount: 1,
};

export interface ProfileNavItem {
  icon: string;
  label: string;
  path: string;
  href?: string;
}

export const profileNav: ProfileNavItem[] = [
  { icon: "home", label: "Home / জাতীয় ফিড", path: "home", href: "/jibaner-joygan" },
  { icon: "search", label: "Explore / অন্বেষণ", path: "explore" },
  { icon: "notifications", label: "Notifications / বিজ্ঞপ্তি", path: "alerts" },
  { icon: "group", label: "Follow / অনুসরণ", path: "follow" },
  { icon: "chat_bubble", label: "Chat / বার্তা", path: "chat" },
  { icon: "auto_awesome", label: "Grok / এআই ল্যাব", path: "ai" },
  { icon: "bookmark", label: "History / ইতিহাস", path: "history" },
  { icon: "rocket_launch", label: "Creator Studio", path: "studio" },
  { icon: "verified", label: "Premium", path: "premium" },
  { icon: "person", label: "Profile / প্রোফাইল", path: "profile" },
  { icon: "more_horiz", label: "More / আরও", path: "more" },
];

export const profileTabs = ["Posts", "Replies", "Reposts", "Media"] as const;

export interface SetupCard {
  icon: string;
  label: string;
  badge?: string;
  /** Tailwind classes for the card's gradient fill. */
  fill: string;
}

/**
 * The source design used blue/purple/amber/pink gradients lifted from a
 * social template. Those read as a foreign palette here, so each card is
 * re-cut from the Kandari ramp: green for identity, deepening through the
 * sequence, with orange reserved for the one genuinely new item.
 */
export const setupCards: SetupCard[] = [
  {
    icon: "person",
    label: "প্রোফাইল সম্পূর্ণ করুন",
    fill: "from-bd-green to-emerald-600",
  },
  {
    icon: "person_add",
    label: "৫ জনকে অনুসরণ করুন",
    badge: "৪ বাকি",
    fill: "from-bd-green-dark to-bd-green",
  },
  {
    icon: "forum",
    label: "৩টি বিষয় অনুসরণ করুন",
    badge: "৩ বাকি",
    fill: "from-emerald-800 to-emerald-950",
  },
  {
    icon: "notifications",
    label: "অ্যালার্ট চালু করুন",
    badge: "নতুন",
    fill: "from-signal-orange to-amber-600",
  },
];

export interface SuggestedAccount {
  initials: string;
  name: string;
  handle: string;
  bio?: string;
  verified?: boolean;
}

export const whoToFollow: SuggestedAccount[] = [
  {
    initials: "TA",
    name: "ড. তানভীর আহমেদ",
    handle: "@tanvir_kandari",
    bio: "ক্লিনিক্যাল নিউরো-টেলিমেট্রি গবেষক",
    verified: true,
  },
  {
    initials: "SM",
    name: "সাফিয়া মুবাসসারা",
    handle: "@safia_lidar",
    bio: "LiDAR ও স্পেশিয়াল সেন্সর আর্কিটেক্ট",
    verified: true,
  },
  {
    initials: "SA",
    name: "সাদমান বিন আরিফ",
    handle: "@sadman_ops",
    bio: "৬৪ জেলা ফার্মেসি গ্রিড অপারেশনস",
    verified: true,
  },
];

export const youMightLike: SuggestedAccount[] = [
  { initials: "KL", name: "Kandari Labs", handle: "@kandari_lab", verified: true },
  { initials: "SW", name: "SWASTI Health", handle: "@swasti_bd", verified: true },
  { initials: "AP", name: "Aponjon Devices", handle: "@aponjon_hw", verified: true },
];

export interface ProfileTrend {
  category: string;
  title: string;
  meta: string;
}

export const profileTrends: ProfileTrend[] = [
  {
    category: "বাংলাদেশে ট্রেন্ডিং",
    title: "গোল্ডেন ২ ঘণ্টা প্রটোকল",
    meta: "১,৪২০ পোস্ট",
  },
  {
    category: "বাংলাদেশে ট্রেন্ডিং",
    title: "RISC-V ২৮nm টেপ-আউট",
    meta: "৫,৯১০ পোস্ট",
  },
  {
    category: "বাংলাদেশে ট্রেন্ডিং",
    title: "স্মার্ট ফার্মেসি গ্রিড",
    meta: "৮,১১৪ পোস্ট",
  },
  {
    category: "বাংলাদেশে ট্রেন্ডিং",
    title: "আপনজন ব্যান্ড পাইলট",
    meta: "৩,২৪৫ পোস্ট",
  },
];

export const profilePostStats: PostStats = {
  comments: "১২",
  reposts: "৪৮",
  reactions: "৩১৪",
  views: "৯,২০৪",
  reactionIcon: "favorite",
};

export const footerLinks = [
  "শর্তাবলী",
  "গোপনীয়তা",
  "কুকি নীতি",
  "অ্যাক্সেসিবিলিটি",
  "বিজ্ঞাপন",
  "আরও ···",
];
