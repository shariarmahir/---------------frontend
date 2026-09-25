import type { PriceBand } from "@/lib/media/fair-price";

/**
 * Domain types for শিক্ষিতদের মিডিয়া — shaped like the API a backend would
 * serve. Everything in data/media is mock content of these shapes.
 */

export type CategoryId =
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

export interface Post {
  id: string;
  kind: PostKind;
  author: string;
  category: CategoryId;
  createdAt: string;
  caption: string;
  skill: { name: string; self: number; communityAvg: number; raters: number };
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
