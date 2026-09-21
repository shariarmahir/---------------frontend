/** Left rail navigation for the national feed shell. */
export interface FeedNavItem {
  icon: string;
  label: string;
  path: string;
}

export const feedNav: FeedNavItem[] = [
  { icon: "hub", label: "Home / জাতীয় ফিড", path: "home" },
  { icon: "explore", label: "Explore / অন্বেষণ", path: "explore" },
  { icon: "notifications", label: "Notifications / বিজ্ঞপ্তি", path: "notifications" },
  { icon: "rocket_launch", label: "Innovation Drive / ড্রাইভ", path: "innovation-drive" },
  { icon: "health_and_safety", label: "SWASTI Health / স্বস্তি স্বাস্থ্য", path: "swasti-health" },
  { icon: "bookmark", label: "Bookmarks / সংরক্ষিত", path: "bookmarks" },
  { icon: "badge", label: "Kandari Profile / প্রোফাইল", path: "profile" },
];

/** Composer domain tags. */
export const domainPills: string[] = [
  "#স্বাস্থ্যসেবা",
  "#গ্রামীণ_ফার্মেসি",
  "#আইওটি_হার্ডওয়্যার",
  "#সেমিকন্ডাক্টর",
  "#নাগরিক_সমস্যা",
  "#কৃষি_প্রযুক্তি",
];

/** Right rail — what Bangladesh is discussing. */
export interface TrendItem {
  category: string;
  title: string;
  meta: string;
}

export const trends: TrendItem[] = [
  {
    category: "টেলিমেডিসিন ও স্বাস্থ্য • শীর্ষ ট্রেন্ডিং",
    title: "#স্বস্তি_টেলিমেডিসিন",
    meta: "৪,৮২০ জন নাগরিক আলোচনা করছেন",
  },
  {
    category: "জরুরি সেবা উদ্ভাবন",
    title: "Golden 2-Hour Window",
    meta: "১,২৯০ উদ্ভাবন প্রস্তাব",
  },
  {
    category: "প্রযুক্তি ও হার্ডওয়্যার • সিলেট হাব",
    title: "Microchip Fabrication Sylhet",
    meta: "৮৪০ প্রযুক্তিবিদ যুক্ত",
  },
  {
    category: "পল্লী সেবা অটোমেশন",
    title: "Rural Smart Pharmacy",
    meta: "৬১০ পাইলট প্রোগ্রাম",
  },
  {
    category: "বায়ো-ফার্টিলাইজার • রংপুর",
    title: "Waste-to-Soil Rangpur",
    meta: "৩২০ গবেষক ও কৃষক",
  },
];

/** Right rail — top innovators to follow. */
export interface Innovator {
  initials: string;
  name: string;
  role: string;
}

export const innovators: Innovator[] = [
  { initials: "MS", name: "Mahir Shariar", role: "Micro-Robotics Lead" },
  { initials: "NJ", name: "Dr. Nusrat Jahan", role: "Biomedical Lead" },
  { initials: "BR", name: "BUET Robotics", role: "Research Lab" },
];

/** Feed filter tabs. */
export interface FeedTab {
  label: string;
  /** Count chip, as on the innovation-drive tab. */
  count?: string;
  /** Pinging dot, as on the urgent-issues tab. */
  urgent?: boolean;
  /** Leading material icon, as on the district tab. */
  icon?: string;
}

export const feedTabs: FeedTab[] = [
  { label: "আপনার জন্য (For You)" },
  { label: "অনুসরণ করছেন" },
  { label: "উদ্ভাবন ড্রাইভ", count: "42" },
  { label: "জরুরি জাতীয় সমস্যা", urgent: true },
  { label: "৬৪ জেলা লাইভ", icon: "location_on" },
];

/** Engagement counts rendered under every post. */
export interface PostStats {
  comments: string;
  reposts: string;
  /** `favorite` renders filled crimson; `thumb_up` renders neutral. */
  reactionIcon: "favorite" | "thumb_up";
  reactions: string;
  views: string;
}
