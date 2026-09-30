/**
 * Kandari Profile — the one account for the whole site (CLAUDE.md §7).
 *
 * Sign-in is phone-OTP first with an email fallback (password or a one-time
 * link). There is no backend yet: accounts live in the browser (see
 * lib/auth/client.ts) and these demo accounts are seeded on first visit so
 * every flow can be tried without signing up.
 */

export type RoleId = "citizen" | "researcher" | "provider";

/** The three tiers offered on the home page's "Join Kandari Profile" band. */
export const ROLES: { id: RoleId; bn: string; en: string; blurb: string }[] = [
  { id: "citizen", bn: "নাগরিক / রোগী", en: "Citizen / Patient", blurb: "আপনজন ব্যান্ডের ভাইটাল সিঙ্ক, টেলিমেডিসিনে অগ্রাধিকার, গ্রামের ফার্মেসির খবর।" },
  { id: "researcher", bn: "গবেষক / প্রকৌশলী", en: "Researcher / Engineer", blurb: "হার্ডওয়্যার SDK, গবেষণার আপডেট, ডেভ-কিট ও ওপেন ডেটাসেটের খবর।" },
  { id: "provider", bn: "স্বাস্থ্যসেবা প্রদানকারী", en: "Healthcare Provider / Clinic", blurb: "ফার্মেসি নোডে যুক্ত হওয়া, যাচাইকৃত যন্ত্রের তালিকা, ডাক্তার-ট্রায়াজ।" },
];

export type SectorId = "health" | "semiconductor" | "iot" | "robotics" | "ai" | "assistive" | "environment" | "civic";

/** Sectors a subscriber can follow — Kandari-Lab works sector by sector. */
export const SECTORS: { id: SectorId; bn: string; en: string }[] = [
  { id: "health", bn: "স্বাস্থ্যসেবা", en: "Healthcare" },
  { id: "semiconductor", bn: "সেমিকন্ডাক্টর", en: "Semiconductor" },
  { id: "iot", bn: "আইওটি ও হার্ডওয়্যার", en: "IoT & hardware" },
  { id: "robotics", bn: "রোবোটিক্স", en: "Robotics" },
  { id: "ai", bn: "এআই ও মেশিন লার্নিং", en: "AI / ML" },
  { id: "assistive", bn: "সহায়ক প্রযুক্তি", en: "Assistive tech" },
  { id: "environment", bn: "পরিবেশ ও কৃষি", en: "Environment & soil" },
  { id: "civic", bn: "নাগরিক সেবা", en: "Public services" },
];

/** Products a subscriber can follow for release news. Slugs match data/products.ts. */
export const FOLLOWABLE_PRODUCTS: { slug: string; bn: string; en: string }[] = [
  { slug: "swasti", bn: "স্বস্তি", en: "SWASTI" },
  { slug: "aponjon", bn: "আপনজন", en: "Aponjon" },
  { slug: "smart-pharmacy", bn: "স্মার্ট ফার্মেসি", en: "Smart Pharmacy" },
];

export interface NotifyPrefs {
  sms: boolean;
  email: boolean;
}

/** An account as the UI sees it — never includes the password hash. */
export interface Account {
  id: string;
  name: string;
  /** Normalised 11-digit local number, e.g. "01700000001". */
  phone: string;
  email: string | null;
  role: RoleId;
  district: string;
  sectors: SectorId[];
  products: string[];
  notify: NotifyPrefs;
  /** Linked শিক্ষিতদের মিডিয়া profile, if the person has one. */
  mediaHandle: string | null;
  /**
   * Profile picture: a site path (e.g. the founder's portrait in
   * /public/team) or a small JPEG data URL the person uploaded, resized in
   * the browser. Null or absent shows the initial on a placeholder.
   */
  photo?: string | null;
  createdAt: string;
  demo?: true;
}

export interface DemoAccount extends Account {
  /** Shown on the login page so the demo can be tried; not a secret. */
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "acc-mahir",
    name: "মাহির শারিয়ার মাহিন",
    phone: "01700000001",
    email: "mahir@kandari-lab.com",
    password: "Kandari2026",
    role: "researcher",
    district: "শেরপুর",
    sectors: ["health", "iot", "semiconductor"],
    products: ["swasti", "aponjon"],
    notify: { sms: true, email: true },
    mediaHandle: "mahir",
    photo: "/team/mahir_shariar_mahin.png",
    createdAt: "2026-01-12T09:00:00.000Z",
    demo: true,
  },
  {
    id: "acc-shapla",
    name: "শাপলা আক্তার",
    phone: "01800000002",
    email: "shapla@example.com",
    password: "Shapla2026",
    role: "citizen",
    district: "জামালপুর",
    sectors: ["health", "civic"],
    products: ["aponjon"],
    notify: { sms: true, email: false },
    mediaHandle: "shapla",
    createdAt: "2026-02-20T09:00:00.000Z",
    demo: true,
  },
  {
    id: "acc-rafi",
    name: "ডা. রাফি হাসান",
    phone: "01900000003",
    email: "rafi@example.com",
    password: "Clinic2026",
    role: "provider",
    district: "ময়মনসিংহ",
    sectors: ["health", "ai"],
    products: ["smart-pharmacy", "swasti"],
    notify: { sms: false, email: true },
    mediaHandle: null,
    createdAt: "2026-06-03T09:00:00.000Z",
    demo: true,
  },
];

/** Timings for the mock gateway — the same values a real one would enforce. */
export const AUTH_RULES = {
  otpLength: 6,
  otpTtlMs: 5 * 60_000,
  otpResendMs: 30_000,
  otpMaxAttempts: 5,
  /** A verified phone may be used to finish sign-up within this window. */
  phoneProofMs: 15 * 60_000,
  linkTtlMs: 15 * 60_000,
  passwordMaxFailures: 5,
  lockoutMs: 5 * 60_000,
  sessionMs: 30 * 24 * 60 * 60_000,
  passwordMin: 8,
  passwordMax: 72,
} as const;

/**
 * Routes that need a signed-in account. proxy.ts redirects on the server
 * (optimistic cookie check); components/auth/route-guard.tsx re-checks in
 * the browser, where the session actually lives.
 */
export const PROTECTED_PREFIXES = [
  "/account",
  // শিক্ষিতদের মিডিয়া is members-only: feed, market, jobs, profiles — all of it
  // (Mahir, 2026-09-27).
  "/media",
] as const;

/** Pages for signed-out visitors only; a signed-in visitor is sent on. */
export const GUEST_ONLY = ["/login", "/signup"] as const;

/** Non-secret marker cookie read by proxy.ts. The session itself is in localStorage. */
export const SESSION_COOKIE = "kandari_session";

export function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
