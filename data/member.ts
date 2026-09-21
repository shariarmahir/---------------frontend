/**
 * Another member's public profile — the "stalk someone else" view.
 * Distinct from `data/profile.ts`, which is the signed-in user's own page.
 */

export interface MemberProfile {
  slug: string;
  name: string;
  nameBn: string;
  handle: string;
  initials: string;
  rank: string;
  bioLead: string;
  bioQuote: string;
  bioTail: string;
  location: string;
  coords: string;
  site: string;
  grid: string;
  joined: string;
  following: string;
  followers: string;
  patents: string;
  merged: string;
  postCount: string;
}

export const mehek: MemberProfile = {
  slug: "mehek",
  name: "Mehek Tabassum",
  nameBn: "মেহেক তাবাসসুম",
  handle: "@mehek_kandari",
  initials: "MT",
  rank: "Architect #007",
  bioLead: "Lead Bio-Telemetry Researcher",
  bioQuote: "কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।",
  bioTail:
    "আপনজন (Aponjon) ন্যানো-সেন্সর অ্যারে ও SWASTI ক্লিনিক্যাল পাইপলাইন নিয়ে কাজ করছি।",
  location: "সিলেট, বাংলাদেশ",
  coords: "[24.8949° N, 91.8687° E]",
  site: "kandari-lab.com/mehek",
  grid: "৬৪ জেলা লাইভ টেলিমেট্রি কানেক্টেড",
  joined: "জুন ২০২৪",
  following: "৮৪২",
  followers: "১২.৪K",
  patents: "০৭",
  merged: "১৩৮",
  postCount: "১,৯৪০ সলিউশন ও পোস্ট • নোড সক্রিয়",
};

export interface MemberTab {
  label: string;
  count?: string;
  /** Renders a live status dot before the label. */
  live?: boolean;
}

export const memberTabs: MemberTab[] = [
  { label: "পোস্ট ও সমাধান" },
  { label: "Innovation Drive", count: "18" },
  { label: "Healthcare Telemetry", live: true },
  { label: "ল্যাব মিডিয়া" },
];

export interface MemberPost {
  id: string;
  author: string;
  authorBn?: string;
  initials: string;
  handle: string;
  time: string;
  badge?: string;
  pinned?: boolean;
  body: string;
  /** Leading fragment rendered in green bold before `body`. */
  lead?: string;
  hashtags?: string;
  comments: string;
  reposts: string;
  likes: string;
  views: string;
  /** Which attachment block to render under the text. */
  attachment?: "telemetry" | "pharmacy" | "pr";
}

export const memberPosts: MemberPost[] = [
  {
    id: "pinned",
    author: "Mehek Tabassum",
    initials: "MT",
    handle: "@mehek_kandari",
    time: "২ ঘণ্টা আগে",
    pinned: true,
    lead: "আপনজন (Aponjon)",
    body: " ডিভাইসের ক্লিনিক্যাল ট্রায়ালের প্রথম ডাটা এসেছে। গত ২৪ ঘণ্টায় মৌলভীবাজারের তিনটি ইউনিয়ন ফার্মেসিতে দুজন হার্ট পেশেন্টের অস্বাভাবিক ইসিজি রিডিং গোল্ডেন ২ ঘণ্টার মধ্যেই ডিল করা সম্ভব হয়েছে। স্বস্তি (SWASTI) অ্যাপ সরাসরি ডাক্তারের সাথে ভিডিও কানেক্ট করে দেয়।",
    comments: "৩৪২",
    reposts: "১.২K",
    likes: "৪.৮K",
    views: "৮৯K",
    attachment: "telemetry",
  },
  {
    id: "pharmacy",
    author: "Dr. Nusrat Jahan",
    initials: "NJ",
    handle: "@nusrat_swasti",
    time: "৪ ঘণ্টা আগে",
    badge: "Verified Doctor",
    lead: "One Village, One Medical Healthcare Center",
    body: " প্রজেক্টের সোলার ব্যাকআপ পাওয়ার থাকায় লোডশেডিংয়ের মধ্যেও রংপুর গ্রামীণ ফার্মেসিতে টেলিমেডিসিন নির্বিঘ্নে চালু ছিল। গ্রামীণ মানুষের জন্য এটি একটি আশীর্বাদ।",
    hashtags: "#SWASTI #KandariLab #RuralHealth",
    comments: "১৮৯",
    reposts: "৫৪০",
    likes: "২.৩K",
    views: "৪১K",
    attachment: "pharmacy",
  },
  {
    id: "pr",
    author: "BUET Robotics & AI Wing",
    initials: "BR",
    handle: "@buet_robotics",
    time: "৬ ঘণ্টা আগে",
    badge: "Verified Partner",
    lead: "ড্রাইভ আপডেট:",
    body: " দৃষ্টিহীনদের জন্য ২-মিটার লিডার সেন্সর প্রটেকশন শিল্ডের বাংলা ভয়েস ফিডব্যাক ল্যাটেন্সি ১১ মিলিসেকেন্ডে নামিয়ে আনা হয়েছে। গিটহাব রিপোজিটরিতে কোড পুশ করা হয়েছে।",
    comments: "৯৪",
    reposts: "৩১২",
    likes: "১.৫K",
    views: "২৮K",
    attachment: "pr",
  },
];

/** People this member follows — the list behind "অনুসরণ করছেন". */
export const memberFollowing = [
  {
    initials: "MM",
    name: "মাহির শারিয়ার মাহিন",
    handle: "@mahir_kandari",
    role: "Founder & CEO, Kandari-Lab",
  },
  {
    initials: "NJ",
    name: "Dr. Nusrat Jahan",
    handle: "@nusrat_swasti",
    role: "Biomedical Lead",
  },
  {
    initials: "BR",
    name: "BUET Robotics",
    handle: "@buet_robotics",
    role: "Research Lab",
  },
];
