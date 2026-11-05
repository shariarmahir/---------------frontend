/**
 * বাজার rules: hashtags, buyer–seller matching, pooled orders, the legal
 * goods check, wholesale tiers, delivery options with the bus-box fee split,
 * and the hash-linked product journey. Pure, tested in bazaar.test.ts.
 */

export type TradeMode = "retail" | "wholesale" | "export" | "brand";
export type SellerStage = "solo" | "new" | "freelance" | "running";

/* ── Hashtags ─────────────────────────────────────────────────────────── */

/** Canonical tag → spellings buyers actually type. Grows with real searches. */
const SYNONYMS: Record<string, string[]> = {
  নারকেল: ["coconut", "ডাব", "নারিকেল"],
  গুড়: ["gur", "jaggery", "খেজুরগুড়", "আখেরগুড়", "পাটালি", "ঝোলাগুড়"],
  আম: ["mango", "হিমসাগর", "ল্যাংড়া", "আম্রপালি"],
  সবজি: ["vegetable", "vegetables", "শাকসবজি", "সবজী"],
  অর্গানিক: ["organic", "জৈব", "বিষমুক্ত"],
  চাল: ["rice", "মিনিকেট", "কাটারিভোগ"],
  মধু: ["honey", "সুন্দরবনেরমধু"],
  শাড়ি: ["saree", "sari"],
  নকশিকাঁথা: ["nakshikatha", "nakshikantha", "kantha", "কাঁথা"],
  বাসাভাড়া: ["houserent", "tolet", "টুলেট"],
  আইনিসেবা: ["lawyer", "advocate", "উকিল", "আইনজীবী"],
  গ্রাফিক্স: ["graphics", "graphicdesign", "গ্রাফিকডিজাইন"],
  আঁকা: ["drawing", "painting", "ছবিআঁকা"],
  রপ্তানি: ["export"],
};

const squash = (s: string) => s.normalize("NFC").toLowerCase().replace(/[\s_\-.#]+/g, "");

const CANON = new Map<string, string>();
for (const [tag, alts] of Object.entries(SYNONYMS)) for (const a of [tag, ...alts]) CANON.set(squash(a), tag.normalize("NFC"));

export function canonTag(raw: string): string {
  const s = squash(raw);
  return CANON.get(s) ?? s;
}

/** "#খেজুর গুড় #পাটালি" → ["গুড়"]. With no "#", words are tags. */
export function parseTags(text: string): string[] {
  const parts = text.includes("#") ? text.split(/[#,\n]+/) : text.split(/[\s,]+/);
  return [...new Set(parts.map(canonTag).filter(Boolean))];
}

/* ── Matching ─────────────────────────────────────────────────────────── */

export interface MatchOffer {
  sector: string;
  tags: string[];
  price: number;
  /** Units in stock; services have none. */
  stock?: number;
  minOrder?: number;
  district: string;
  /** Trade modes the seller accepts; unset means all. */
  modes?: TradeMode[];
  organic?: boolean;
}

export interface MatchWant {
  sector?: string;
  tags: string[];
  qty: number;
  maxPrice?: number;
  district: string;
  mode: TradeMode;
  organic?: boolean;
}

/** Matches under this are not shown or notified. */
export const MATCH_MIN = 50;

/**
 * 0–100: shared tags 36, same sector 24, price 15, stock 15, district 10.
 * Organic, trade mode, minimum order, budget (+10%) and at least one shared
 * tag are hard limits — the same sector alone is too broad (সুপারি is not নারকেল).
 */
export function matchScore(o: MatchOffer, w: MatchWant): { score: number; why: string[] } {
  const none = { score: 0, why: [] };
  if (w.organic && !o.organic) return none;
  if (o.modes && !o.modes.includes(w.mode)) return none;
  if (o.minOrder && w.qty < o.minOrder) return none;
  if (w.maxPrice !== undefined && o.price > w.maxPrice * 1.1) return none;
  const want = new Set(w.tags.map(canonTag));
  const shared = o.tags.map(canonTag).filter((t) => want.has(t));
  const sameSector = w.sector === o.sector;
  if (shared.length === 0) return none;

  let score = 0;
  const why: string[] = [];
  score += 36;
  why.push(shared.map((t) => `#${t}`).join(" "));
  if (sameSector) score += 24;
  if (w.maxPrice === undefined || o.price <= w.maxPrice) {
    score += 15;
    if (w.maxPrice !== undefined) why.push("দাম বাজেটের মধ্যে");
  } else {
    score += 5;
    why.push("দাম বাজেটের সামান্য বেশি");
  }
  if (o.stock === undefined || o.stock >= w.qty) {
    score += 15;
    if (o.stock !== undefined) why.push("পুরো পরিমাণ আছে");
  } else {
    score += 5;
    why.push(`আংশিক: ${o.stock} আছে`);
  }
  if (o.district === w.district) {
    score += 10;
    why.push("একই জেলা");
  }
  return { score, why };
}

/** Fill a big order from several sellers, cheapest first — how small farmers reach wholesale buyers. */
export function poolOrder(offers: { id: string; stock: number; price: number }[], qty: number) {
  const lots: { id: string; take: number }[] = [];
  let filled = 0;
  let total = 0;
  for (const o of [...offers].sort((a, b) => a.price - b.price)) {
    if (filled >= qty) break;
    const take = Math.min(o.stock, qty - filled);
    if (take <= 0) continue;
    lots.push({ id: o.id, take });
    filled += take;
    total += take * o.price;
  }
  return { lots, filled, total };
}

/* ── Legal goods only ─────────────────────────────────────────────────── */

const BANNED = [
  "ইয়াবা", "গাঁজা", "হেরোইন", "ফেনসিডিল", "মাদক", "অস্ত্র", "পিস্তল", "বন্দুক", "বিস্ফোরক", "গোলাবারুদ",
  "জালনোট", "জালটাকা", "জালসনদ", "চোরাই", "হাতিরদাঁত", "বাঘেরচামড়া", "বন্যপ্রাণী",
  "yaba", "drug", "heroin", "weapon", "gun", "pistol", "explosive", "ivory",
].map((w) => w.normalize("NFC"));

const SUFFIXES = ["", "র", "এর", "ের", "সহ", "গুলো", "s"];

/** The first prohibited item named in the text, or null. Matches whole words with common endings only. */
export function bannedWord(text: string): string | null {
  const words = text.normalize("NFC").toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
  const tokens = [...words, ...words.slice(1).map((w, i) => words[i] + w)];
  for (const b of BANNED) if (tokens.some((t) => SUFFIXES.some((s) => t === b + s))) return b;
  return null;
}

/* ── Wholesale ────────────────────────────────────────────────────────── */

export interface Tier {
  min: number;
  price: number;
}

export function unitPrice(qty: number, base: number, tiers: Tier[] = []): number {
  return tiers.filter((t) => qty >= t.min).reduce((p, t) => Math.min(p, t.price), base);
}

/* ── Delivery ─────────────────────────────────────────────────────────── */

export type ShipMode = "bus" | "cold" | "courier" | "train" | "truck";

export const BUS_BOX_MAX_KG = 30;

const r10 = (n: number) => Math.round(n / 10) * 10;

/**
 * What can carry this load and roughly what it costs. Demo rates: the bus
 * box uses the empty luggage hold of long-distance buses; trains and trucks
 * are for bulk.
 */
export function shipOptions({ kg, km, perishable }: { kg: number; km: number; perishable: boolean }): { mode: ShipMode; fee: number }[] {
  const out: { mode: ShipMode; fee: number }[] = [];
  if (kg <= BUS_BOX_MAX_KG) out.push({ mode: "bus", fee: r10(60 + 6 * kg + 0.1 * km) });
  if (perishable && kg <= 50) out.push({ mode: "cold", fee: r10(120 + 9 * kg + 0.15 * km) });
  if (!perishable && kg <= 10) out.push({ mode: "courier", fee: r10(100 + 20 * kg) });
  if (kg >= 100) out.push({ mode: "train", fee: r10(2 * kg + 0.5 * km) });
  if (kg >= 300) out.push({ mode: "truck", fee: r10(40 * km + 0.5 * kg) });
  return out.sort((a, b) => a.fee - b.fee);
}

/** Bus-box fee: 70% bus company, 25% supervisor, driver and helper, 5% platform. */
export function busSplit(fee: number) {
  const company = Math.round(fee * 0.7);
  const crew = Math.round(fee * 0.25);
  return { company, crew, platform: fee - company - crew };
}

/* ── Product journey ──────────────────────────────────────────────────── */

export interface JourneyStep {
  at: string;
  step: string;
  by: string;
}

export interface JourneyLink extends JourneyStep {
  prev: string;
  hash: string;
}

/** FNV-1a, 32-bit, as 8 hex digits. Tamper evidence for a demo, not cryptography. */
function fnv(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}

const GENESIS = "00000000";
const digest = (prev: string, s: JourneyStep) => fnv(`${prev}|${s.at}|${s.step}|${s.by}`);

export function linkChain(steps: JourneyStep[]): JourneyLink[] {
  const out: JourneyLink[] = [];
  for (const s of steps) {
    const prev = out.at(-1)?.hash ?? GENESIS;
    out.push({ ...s, prev, hash: digest(prev, s) });
  }
  return out;
}

/** Index of the first link that no longer matches its hash, or -1 when the chain is intact. */
export function brokenAt(chain: JourneyLink[]): number {
  let prev = GENESIS;
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].prev !== prev || chain[i].hash !== digest(prev, chain[i])) return i;
    prev = chain[i].hash;
  }
  return -1;
}
