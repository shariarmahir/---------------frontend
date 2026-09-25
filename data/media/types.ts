import type { PriceBand } from "@/lib/media/fair-price";
import type { PayUnit } from "@/lib/media/fair-pay";

/**
 * Domain types for শিক্ষিতদের মিডিয়া — shaped like the API a backend would
 * serve. Everything in data/media is mock content of these shapes.
 */

export type CategoryId =
  | "shop"
  | "rent"
  | "fashion"
  | "tech"
  | "engineering"
  | "design"
  | "art"
  | "music"
  | "cooking"
  | "teaching"
  | "research"
  | "sports"
  | "travel"
  | "photo"
  | "content"
  | "crafts"
  | "homeservice"
  | "finance"
  | "beauty";

export interface Category {
  id: CategoryId;
  bn: string;
  en: string;
  blurb: string;
  /** Fair range for the category's usual unit of work. */
  band: PriceBand;
  /** Suggested skill tags for the post composer. */
  skills: string[];
}

/** One skill: the owner's claim and the community's verdict, never merged. */
export interface SkillRating {
  skill: string;
  category: CategoryId;
  self: number;
  communityAvg: number;
  raters: number;
}

export type Tone = "green" | "orange" | "emerald" | "amber" | "slate" | "teal";

export interface WorkItem {
  id: string;
  title: string;
  client: string;
  amount: number;
  date: string;
  rating: number;
  review: string;
}

export interface Person {
  handle: string;
  name: string;
  nameBn: string;
  initials: string;
  headline: string;
  district: string;
  area: string;
  bio: string;
  /** One NID/passport per account, checked at onboarding. */
  idVerified: boolean;
  skills: SkillRating[];
  categories: CategoryId[];
  followers: number;
  jobsDone: number;
  /** Average of client reviews on completed work. */
  clientRating: number;
  responseTime: string;
  rate?: { amount: number; unit: string };
  openToWork: boolean;
  joined: string;
  tone: Tone;
  workHistory: WorkItem[];
}

export type MediaKind = "image" | "video" | "project" | "audio";

export interface MediaSlot {
  kind: MediaKind;
  label: string;
  ratio: "16/9" | "4/3" | "1/1" | "4/5";
  duration?: string;
  src?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  at: string;
  likes: number;
  /** Set when the comment came with a rating. */
  verdict?: { kind: "verify" | "challenge"; stars: number };
  replies?: Comment[];
}

export type PostKind = "skill" | "project";

/**
 * What a post is for. Skill, education and research posts carry a
 * self-rating the community verifies; the rest are for sharing, asking and
 * speaking up, and carry none.
 */
export type PostTopic = "skill" | "education" | "research" | "team" | "entertainment" | "daily" | "help" | "rights";

export interface Post {
  id: string;
  kind: PostKind;
  /** Defaults to "skill". */
  topic?: PostTopic;
  author: string;
  category: CategoryId;
  createdAt: string;
  caption: string;
  /** Present on rated posts only (see PostTopic). */
  skill?: { name: string; self: number; communityAvg: number; raters: number };
  media: MediaSlot[];
  tags: string[];
  stats: { likes: number; shares: number; views: number };
  comments: Comment[];
  /** Present when the work is for sale. */
  listingId?: string;
}

export interface Listing {
  id: string;
  seller: string;
  category: CategoryId;
  title: string;
  description: string;
  price: number;
  unit: string;
  negotiable: boolean;
  /** Private minimum for offers. */
  floor: number;
  delivery: ("home" | "courier" | "pickup" | "digital" | "onsite")[];
  media: MediaSlot;
  rating: number;
  sold: number;
  location: string;
  highlights: string[];
  /** The seller skill whose community rating vouches for this listing. */
  skill: string;
  /** Paid placement (a revenue line): shown first and tagged “ফিচার্ড”. */
  featured?: boolean;
}

/* ── Community: jobs, events, teams, civic reports, challenges ───────── */

export type JobType = "full" | "part" | "gig" | "intern";

/** A free job post. Every job states its pay; pay below the fair band is refused. */
export interface Job {
  id: string;
  /** Who posted it on the platform. */
  poster: string;
  org: string;
  title: string;
  sector: CategoryId;
  type: JobType;
  location: string;
  remote: boolean;
  pay: { min: number; max: number; unit: PayUnit };
  tags: string[];
  description: string;
  requirements: string[];
  postedAt: string;
  deadline: string;
  applicants: number;
  /** Fits around classes — shown in the students' filter. */
  studentFriendly: boolean;
}

export type EventKind = "tree" | "cleanup" | "blood" | "relief" | "awareness" | "repair";

export interface Sponsor {
  name: string;
  /** What they give: "লোগোসহ ১০০টি টি-শার্ট", "৳২০,০০০". */
  offer: string;
  initials: string;
}

/** A social-work event: someone leads, others join, companies sponsor. */
export interface CommunityEvent {
  id: string;
  kind: EventKind;
  title: string;
  organizer: string;
  area: string;
  district: string;
  date: string;
  description: string;
  goal: number;
  joined: number;
  needs: string[];
  sponsors: Sponsor[];
  cover?: string;
}

export type TeamKind = "family" | "lab" | "project" | "travel" | "sports";

export interface Team {
  id: string;
  kind: TeamKind;
  name: string;
  lead: string;
  /** Known members on the platform (the lead first). */
  members: string[];
  memberCount: number;
  district: string;
  about: string;
  tags: string[];
  /** Taking new members? */
  open: boolean;
  cover?: string;
}

export type CivicKind = "sanitation" | "road" | "crime" | "extortion" | "harassment" | "utility" | "environment" | "help";
export type CivicStatus = "reported" | "confirmed" | "in-progress" | "solved";

/** A public problem, alert or call for help, confirmed by people nearby. */
export interface CivicReport {
  id: string;
  kind: CivicKind;
  title: string;
  area: string;
  district: string;
  at: string;
  /** Null when filed anonymously (still one verified person behind it). */
  by: string | null;
  description: string;
  confirmations: number;
  status: CivicStatus;
  severity: "low" | "medium" | "high";
  solutions: { id: string; by: string; text: string; votes: number }[];
  media?: MediaSlot;
}

export type ChallengeKind = "code" | "design" | "research" | "assignment" | "lab";

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  host: string;
  /** A member who runs it on the platform. */
  by: string;
  category: CategoryId;
  prize: number;
  deadline: string;
  teams: boolean;
  entries: number;
  description: string;
  tags: string[];
}

export type NoticeKind = "rating" | "hire" | "job" | "event" | "civic" | "team" | "sale" | "system";

export interface Notice {
  id: string;
  kind: NoticeKind;
  text: string;
  href: string;
  at: string;
}

export interface Message {
  id: string;
  from: string;
  at: string;
  text: string;
}

export interface Thread {
  id: string;
  /** The other person. */
  with: string;
  kind: "hire" | "offer";
  subject: string;
  listingId?: string;
  ask: number;
  floor: number;
  unread: number;
  messages: Message[];
  /** Seeded negotiation rounds (buyer = the viewer). */
  rounds: { by: "buyer" | "seller"; kind: "offer" | "counter" | "accept" | "decline" | "confirm"; amount: number; at: string }[];
}

export type TxnKind = "sale" | "purchase" | "escrow" | "release" | "withdraw" | "refund";

export interface Txn {
  id: string;
  at: string;
  kind: TxnKind;
  label: string;
  /** Price of the deal before fees (withdrawals: amount sent). */
  gross: number;
  /** Platform commission on this row, always shown. */
  fee: number;
  feeSide: "seller" | "buyer" | "none";
  /** Effect on the wallet: + in, − out. */
  net: number;
  status: "done" | "pending" | "held";
  method?: "bkash" | "nagad" | "banglaqr";
  /**
   * How a purchase was paid. "wallet" moves the balance (see `net`); an
   * outside method (bKash, card…) leaves the balance alone, so `net` is 0.
   */
  paidVia?: PayMethod;
  /** The conversation whose agreement this escrow row pays for. */
  deal?: string;
}

export type PayMethod = "wallet" | "bkash" | "nagad" | "banglaqr" | "card";

export interface WalletSeed {
  available: number;
  escrow: number;
  lifetime: number;
  linked: { bkash: string; nagad: string; banglaqr: string };
  txns: Txn[];
}
