/**
 * Transparent scoring (Prompt V3 §10):
 *   Total = weighted mean of category scores − documented penalties
 * Weights are visible and chosen by the player's strategy profile. The
 * score rates a game plan inside this model — never a person's morality,
 * politics, intelligence or real-world competence.
 */

import { scenarioOf } from "./engine.ts";
import type { RunResult } from "./types.ts";

export const CATEGORIES = [
  { id: "evidence", bn: "প্রমাণ", en: "Evidence", how: "পাইলট আগে করা হস্তক্ষেপের অংশ (৬০%) আর মাপার হস্তক্ষেপ (৪০%, দুটিতে পূর্ণ)।" },
  { id: "systems", bn: "সিস্টেম-চিন্তা", en: "Systems thinking", how: "৭টি ফল-সূচকের কতগুলো অন্তত ২ পয়েন্ট ভালো হলো।" },
  { id: "equity", bn: "সমতা", en: "Equity", how: "৫০ + সমতার পরিবর্তন × ২.৫।" },
  { id: "sustainability", bn: "টেকসইতা", en: "Sustainability", how: "শেষে রক্ষণাবেক্ষণের গড় (৫০%), আয় দিয়ে চলমান খরচ মেটে কি না (৩০%), পুরো খরচ মেটানো প্রান্তিক (২০%)।" },
  { id: "risk", bn: "ঝুঁকি ব্যবস্থাপনা", en: "Risk management", how: "ঘটনার ধাক্কা কতটা ঠেকানো গেল; প্রতিটি সংকট −২০, প্রতিটি সময়োচিত সাড়া +১০। কোনো ঘটনা না ঘটলে ৭০।" },
  { id: "adaptability", bn: "অভিযোজন", en: "Adaptability", how: "ধাক্কা বা ব্যর্থতার পরের দুই প্রান্তিকে পরিকল্পনা বদলানো হলো কি না। ধাক্কা না এলে ৬০।" },
  { id: "collaboration", bn: "অংশীজনের সমর্থন", en: "Stakeholder support", how: "শেষে অংশীজনদের গড় সমর্থন। একক খেলায় এটাই সহযোগিতার মাপ; দলগত মিশন সার্ভার-নির্ভর।" },
  { id: "efficiency", bn: "সম্পদ-দক্ষতা", en: "Resource efficiency", how: "৫০ + (সূচকের লাভ ÷ খরচ) × ৪০০।" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const STRATEGIES = [
  { id: "balanced", bn: "ভারসাম্য", en: "Balanced", boost: [] as CategoryId[] },
  { id: "evidence", bn: "প্রমাণ-প্রথম", en: "Evidence-first", boost: ["evidence"] as CategoryId[] },
  { id: "community", bn: "সমাজ-প্রথম", en: "Community-first", boost: ["collaboration"] as CategoryId[] },
  { id: "infrastructure", bn: "অবকাঠামো-প্রথম", en: "Infrastructure-first", boost: ["sustainability"] as CategoryId[] },
  { id: "innovation", bn: "উদ্ভাবন-প্রথম", en: "Innovation-first", boost: ["systems"] as CategoryId[] },
  { id: "equity", bn: "সমতা-প্রথম", en: "Equity-first", boost: ["equity"] as CategoryId[] },
  { id: "resilience", bn: "সহনশীলতা-প্রথম", en: "Resilience-first", boost: ["risk"] as CategoryId[] },
  { id: "efficiency", bn: "দক্ষতা-প্রথম", en: "Efficiency-first", boost: ["efficiency"] as CategoryId[] },
] as const;
export type StrategyId = (typeof STRATEGIES)[number]["id"];

/** Every category weighs 1; the profile's focus weighs 2. A gameplay preference, not a political label. */
export function weightsFor(strategy: StrategyId): Record<CategoryId, number> {
  const s = STRATEGIES.find((x) => x.id === strategy) ?? STRATEGIES[0];
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, (s.boost as readonly string[]).includes(c.id) ? 2 : 1])) as Record<CategoryId, number>;
}

export const PENALTY_RULES = {
  shortfall: { points: 3, bn: "চলমান খরচ পুরো মেটানো যায়নি (প্রতি প্রান্তিক)" },
  abandoned: { points: 3, bn: "চালুর দুই প্রান্তিকের মধ্যে বন্ধ — খরচ নষ্ট (প্রতিটি)" },
  rejected: { points: 2, bn: "শর্ত না মেনে চালুর চেষ্টা (প্রতিটি)" },
  ignored: { points: 2, bn: "সাড়া দেওয়ার সুযোগ থাকা সংকট উপেক্ষা (প্রতিটি)" },
  cap: 25,
} as const;

export interface ScoreResult {
  categories: Record<CategoryId, number>;
  weights: Record<CategoryId, number>;
  weighted: number;
  penalties: { id: keyof typeof PENALTY_RULES; bn: string; count: number; points: number }[];
  penaltyTotal: number;
  total: number;
  facts: {
    launched: number;
    piloted: number;
    measurement: number;
    improved: string[];
    spent: number;
    gain: number;
    setbacks: number;
    adapted: number;
    crises: number;
    responses: number;
  };
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const r0 = (v: number) => Math.round(v);

export function scoreRun(run: RunResult, strategy: StrategyId = "balanced"): ScoreResult {
  const sc = scenarioOf(run.config.scenario);
  const turns = run.turns;
  const last = turns.at(-1);
  const endVars = last?.vars ?? run.start.vars;

  const launches = turns.flatMap((t) => t.actions.filter((a) => a.ok && a.action.type === "launch"));
  const launchedIds = launches.map((a) => (a.action as { id: string }).id);
  const piloted = launches.filter((a) => a.action.type === "launch" && a.action.scale === "pilot").length;
  const measurement = launchedIds.filter((id) => sc.interventions.find((i) => i.id === id)?.measurement).length;
  const evidence = launches.length ? 60 * (piloted / launches.length) + 40 * Math.min(1, measurement / 2) : 0;

  const outcomes = sc.variables.filter((v) => v.kind === "outcome" || v.kind === "pressure");
  const improved = outcomes.filter((v) => (v.good === "up" ? 1 : -1) * (endVars[v.id] - run.start.vars[v.id]) >= 2).map((v) => v.id);
  const systems = (100 * improved.length) / outcomes.length;

  const equity = 50 + 2.5 * (endVars.equity - run.start.vars.equity);

  let sustainability = 30;
  if (last && last.active.length) {
    const maint = last.active.reduce((s, a) => s + a.maintenance, 0) / last.active.length;
    const covers = last.upkeepDue > 0 ? Math.min(1, last.income / last.upkeepDue) : 1;
    const fullTurns = turns.filter((t) => t.upkeepPaid >= t.upkeepDue - 0.01).length / turns.length;
    sustainability = 100 * (0.5 * maint + 0.3 * covers + 0.2 * fullTurns);
  }

  const events = turns.flatMap((t) => t.events);
  const crisisIds = new Set(sc.events.filter((e) => e.trigger.kind === "threshold" && Object.values(e.shocks).some((s) => s < 0)).map((e) => e.id));
  const shocks = events.filter((e) => !crisisIds.has(e.id) && Object.values(e.shocks).some((s) => s < 0));
  const crises = events.filter((e) => crisisIds.has(e.id)).length;
  const responses = turns.flatMap((t) => t.actions.filter((a) => a.ok && a.action.type === "respond")).length;
  const risk = shocks.length || crises
    ? 40 + 60 * (shocks.length ? shocks.reduce((s, e) => s + e.mitigation, 0) / shocks.length : 0.5) - 20 * crises + 10 * responses
    : 70;

  let setbacks = 0;
  let adapted = 0;
  turns.forEach((t, i) => {
    const prevIndex = i > 0 ? turns[i - 1].outcomeIndex : run.start.outcomeIndex;
    const setback = t.outcomeIndex < prevIndex - 0.5 || t.events.some((e) => Object.values(e.shocks).some((s) => s < 0)) || t.actions.some((a) => !a.ok);
    if (!setback || i === turns.length - 1) return;
    setbacks++;
    if (turns.slice(i + 1, i + 3).some((n) => n.actions.some((a) => a.ok))) adapted++;
  });
  const adaptability = setbacks ? (100 * adapted) / setbacks : 60;

  const supports = Object.values(last?.stakeholders ?? run.start.stakeholders);
  const collaboration = supports.reduce((s, v) => s + v, 0) / supports.length;

  const spent = turns.reduce((s, t) => s + t.upfront + t.upkeepPaid, 0);
  const gain = (last?.outcomeIndex ?? run.start.outcomeIndex) - run.start.outcomeIndex;
  const efficiency = 50 + (gain / Math.max(spent, 1)) * 400;

  const categories = {
    evidence: r0(clamp(evidence)),
    systems: r0(clamp(systems)),
    equity: r0(clamp(equity)),
    sustainability: r0(clamp(sustainability)),
    risk: r0(clamp(risk)),
    adaptability: r0(clamp(adaptability)),
    collaboration: r0(clamp(collaboration)),
    efficiency: r0(clamp(efficiency)),
  } satisfies Record<CategoryId, number>;

  const weights = weightsFor(strategy);
  const wSum = Object.values(weights).reduce((a, b) => a + b, 0);
  const weighted = Object.entries(categories).reduce((s, [k, v]) => s + v * weights[k as CategoryId], 0) / wSum;

  // Penalties.
  const shortfallTurns = turns.filter((t) => t.upkeepPaid < t.upkeepDue - 0.01).length;
  const abandoned = turns.flatMap((t) =>
    t.actions.filter((a) => {
      if (!a.ok || a.action.type !== "stop") return false;
      const id = a.action.id;
      const launchedAt = turns.findLast((x) => x.turn < t.turn && x.actions.some((b) => b.ok && b.action.type === "launch" && b.action.id === id))?.turn;
      return launchedAt !== undefined && t.turn - launchedAt <= 2;
    }),
  ).length;
  const rejected = turns.flatMap((t) => t.actions.filter((a) => !a.ok && a.action.type === "launch")).length;
  const ignored = turns.filter((t, i) => {
    const withResponse = t.events.filter((e) => sc.events.find((d) => d.id === e.id)?.response);
    if (!withResponse.length || i + 1 >= turns.length) return false;
    return withResponse.some((e) => !turns[i + 1].actions.some((a) => a.ok && a.action.type === "respond" && a.action.event === e.id));
  }).length;
  const penalties = (
    [
      ["shortfall", shortfallTurns],
      ["abandoned", abandoned],
      ["rejected", rejected],
      ["ignored", ignored],
    ] as const
  )
    .filter(([, n]) => n > 0)
    .map(([id, count]) => ({ id, bn: PENALTY_RULES[id].bn, count, points: count * PENALTY_RULES[id].points }));
  const penaltyTotal = Math.min(PENALTY_RULES.cap, penalties.reduce((s, p) => s + p.points, 0));

  return {
    categories,
    weights,
    weighted: Math.round(weighted * 10) / 10,
    penalties,
    penaltyTotal,
    total: r0(clamp(weighted - penaltyTotal)),
    facts: { launched: launches.length, piloted, measurement, improved, spent: Math.round(spent), gain: Math.round(gain * 10) / 10, setbacks, adapted, crises, responses },
  };
}
