/**
 * "জাতীয় মিশন" — the co-operative crisis game over the 32 modules.
 *
 * Pillars group the modules into four decks of eight; the grouping is a
 * game abstraction over the dossier themes, not a claim about how the state
 * is organised. Roles, policy cards and difficulty are game design — every
 * number here is a rule of the game, not a statistic.
 */

import type { ThemeId } from "./puzzles.ts";
import { modules } from "./modules.ts";

export type PillarId = "people" | "economy" | "state" | "nature";

export interface Pillar {
  id: PillarId;
  bn: string;
  en: string;
  /** Reform name shown when the pillar's national reform launches. */
  reformBn: string;
  themes: ThemeId[];
  /** Explicit extra modules, where a theme is split across pillars. */
  extra?: number[];
  exclude?: number[];
}

export const PILLARS: Pillar[] = [
  { id: "people", bn: "মানুষ ও সমাজ", en: "People & society", reformBn: "সবার জন্য সেবা ও নিরাপত্তা", themes: ["Health", "Education", "Society", "Safety", "Poverty"] },
  { id: "economy", bn: "অর্থনীতি ও কাজ", en: "Economy & work", reformBn: "ন্যায্য বাজার ও কাজের সেতু", themes: ["Markets", "Jobs"], extra: [21, 27] },
  { id: "state", bn: "রাষ্ট্র ও তথ্য", en: "State & data", reformBn: "স্বচ্ছ, জবাবদিহিমূলক রাষ্ট্র", themes: ["Governance", "Data", "Service"], extra: [22] },
  { id: "nature", bn: "প্রকৃতি ও সক্ষমতা", en: "Nature & capacity", reformBn: "টেকসই অবকাঠামো ও জ্ঞান", themes: ["Environment", "Infrastructure"], extra: [25, 31] },
];

const pillarByModule: PillarId[] = [];
for (const m of modules) {
  const explicit = PILLARS.find((p) => p.extra?.includes(m.n));
  const byTheme = PILLARS.find((p) => p.themes.includes(m.theme));
  const p = explicit ?? byTheme;
  if (!p) throw new Error(`Module ${m.n} (${m.theme}) has no pillar`);
  pillarByModule[m.n] = p.id;
}

/** The pillar module n belongs to. */
export const pillarOf = (n: number): PillarId => pillarByModule[n];
export const pillarDef = (id: PillarId): Pillar => PILLARS.find((p) => p.id === id)!;
export const modulesIn = (id: PillarId): number[] => modules.filter((m) => pillarOf(m.n) === id).map((m) => m.n);

export type RoleId = "organizer" | "researcher" | "coordinator" | "engineer" | "guardian" | "analyst";

export interface Role {
  id: RoleId;
  bn: string;
  en: string;
  power: string;
}

export const ROLES: Role[] = [
  { id: "organizer", bn: "মাঠ সংগঠক", en: "Field organiser", power: "‘চাপ কমান’ দিলে ওই মডিউলের সব চাপ একবারে সরে। সংস্কার হয়ে যাওয়া স্তম্ভে পা রাখলেই চাপ মুছে যায়।" },
  { id: "researcher", bn: "নীতি গবেষক", en: "Policy researcher", power: "জাতীয় সংস্কার চালু করতে একটি কার্ড কম লাগে। নিজের যেকোনো কার্ড একই মডিউলে থাকা সঙ্গীকে দিতে পারেন।" },
  { id: "coordinator", bn: "সমন্বয়ক", en: "Coordinator", power: "এক অ্যাকশনে যেকোনো সঙ্গীকে অন্য কোনো সঙ্গীর মডিউলে ডেকে আনতে পারেন।" },
  { id: "engineer", bn: "প্রকৌশলী", en: "Engineer", power: "কার্ড খরচ না করেই সমন্বয় কেন্দ্র বানাতে পারেন।" },
  { id: "guardian", bn: "সমাজ রক্ষী", en: "Community guardian", power: "যে মডিউলে আছেন আর তার সরাসরি সংযুক্ত মডিউলগুলোতে নতুন চাপ বসে না।" },
  { id: "analyst", bn: "তথ্য বিশ্লেষক", en: "Data analyst", power: "এক অ্যাকশনে সংকট-ডেকের উপরের ৩টি কার্ড দেখে যেকোনো একটিকে নিচে পাঠাতে পারেন (প্রতি টার্নে একবার)।" },
];

export const roleDef = (id: RoleId): Role => ROLES.find((r) => r.id === id)!;

export type PolicyId = "fund" | "forecast" | "volunteers" | "quiet" | "resilience" | "airlift";

export interface Policy {
  id: PolicyId;
  bn: string;
  body: string;
}

/** Policy cards: played any time during your own turn, free of actions. */
export const POLICIES: Policy[] = [
  { id: "fund", bn: "জরুরি তহবিল", body: "যেকোনো মডিউলে বিনা কার্ডে একটি সমন্বয় কেন্দ্র বানান।" },
  { id: "forecast", bn: "স্যাটেলাইট পূর্বাভাস", body: "সংকট-ডেকের উপরের ৬টি কার্ড দেখে নিজের পছন্দমতো সাজান।" },
  { id: "volunteers", bn: "স্বেচ্ছাসেবক বাহিনী", body: "যেকোনো জায়গা থেকে মোট ২টি চাপ সরান।" },
  { id: "quiet", bn: "শান্ত প্রান্তিক", body: "পরের সংকট-পর্ব পুরোপুরি বাদ যায়।" },
  { id: "resilience", bn: "টেকসই জনগোষ্ঠী", body: "বাতিল সংকট-স্তূপ থেকে একটি কার্ড খেলা থেকে চিরতরে সরান।" },
  { id: "airlift", bn: "দ্রুত মোতায়েন", body: "যেকোনো খেলোয়াড়কে যেকোনো মডিউলে পাঠান।" },
];

export const policyDef = (id: PolicyId): Policy => POLICIES.find((p) => p.id === id)!;

export type Difficulty = "intro" | "standard" | "heroic";

/**
 * Balanced with the bot teammates (lib/gori/mission/bot.ts) over seeded
 * games: two bots win roughly 3 in 4 intro games, 2 in 3 standard and 1 in 3
 * heroic. Humans who read the cascade previews should do better.
 */
export const DIFFICULTIES: Record<Difficulty, { bn: string; escalations: number; trust: number; body: string }> = {
  intro: { bn: "পরিচিতি", escalations: 4, trust: 8, body: "৪টি মহাসংকট, ৮ জনআস্থা — নিয়ম শেখার জন্য" },
  standard: { bn: "সাধারণ", escalations: 5, trust: 6, body: "৫টি মহাসংকট, ৬ জনআস্থা — ভালো দলের জন্য চ্যালেঞ্জ" },
  heroic: { bn: "বীরত্বপূর্ণ", escalations: 6, trust: 5, body: "৬টি মহাসংকট, ৫ জনআস্থা — প্রতিটি অ্যাকশনের হিসাব লাগবে" },
};

/** Game constants. */
export const RULES = {
  actionsPerTurn: 4,
  maxPressure: 3,
  handLimit: 7,
  /** Cards of one pillar needed to launch its reform (the researcher needs one fewer). */
  reformCards: 3,
  maxHubs: 6,
  /** Crisis cards drawn per turn, by escalation count. */
  rate: [2, 2, 2, 3, 3, 4, 4],
  startHub: 1,
  startingHand: { 1: 5, 2: 4, 3: 3, 4: 2 } as Record<number, number>,
} as const;

export const MISSION_VERSION = "1.0.0";
