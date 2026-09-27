/**
 * Progression (Prompt V3 §10): seven titles, earned by learning and play,
 * that unlock game content and tools — never real-world authority.
 *
 * XP cannot be duplicated: a simulation counts once per challenge
 * (scenario × mode × region), at its best score, so replaying the same run
 * or farming new seeds adds nothing unless the plan actually improves. No
 * streaks, no timers, no paid shortcuts.
 */

import { puzzles } from "../../data/gori/puzzles.ts";
import { isSolved, puzzlesIn, quizXp, type QuizBest } from "./quiz.ts";
import { themes } from "../../data/gori/puzzles.ts";

export const LEVELS = [
  { at: 0, bn: "পর্যবেক্ষক", en: "Observer" },
  { at: 150, bn: "সমস্যা-মানচিত্রকার", en: "Problem Mapper" },
  { at: 450, bn: "কমিউনিটি পরিকল্পক", en: "Community Planner" },
  { at: 900, bn: "সিস্টেম নির্মাতা", en: "Systems Builder" },
  { at: 1600, bn: "প্রমাণ কৌশলবিদ", en: "Evidence Strategist" },
  { at: 2500, bn: "আঞ্চলিক সমন্বয়ক", en: "Regional Coordinator" },
  { at: 3600, bn: "সভ্যতার স্থপতি", en: "Civilization Architect" },
] as const;

export type Feature = "campaign" | "quiz" | "evidence" | "sandbox" | "regions" | "lab" | "compare" | "forge" | "crisis" | "future";

/** The level (1-based) that opens each feature. */
export const UNLOCKS: Record<Feature, { level: number; bn: string; en: string }> = {
  campaign: { level: 1, bn: "অভিযান", en: "Campaign" },
  quiz: { level: 1, bn: "প্রমাণ-পরীক্ষা", en: "Evidence checks" },
  evidence: { level: 1, bn: "প্রমাণ অনুসন্ধান", en: "Evidence explorer" },
  sandbox: { level: 2, bn: "স্যান্ডবক্স", en: "Sandbox" },
  regions: { level: 3, bn: "সব প্রেক্ষাপট (চর, হাওর, পাহাড়…)", en: "All regions" },
  lab: { level: 4, bn: "বিজ্ঞানাগার", en: "Scientific lab" },
  compare: { level: 4, bn: "দৃশ্যকল্প তুলনা", en: "Scenario comparison" },
  forge: { level: 5, bn: "দৃশ্যকল্প কারখানা", en: "Scenario forge" },
  crisis: { level: 6, bn: "সংকট মোড", en: "Crisis mode" },
  future: { level: 7, bn: "ভবিষ্যৎ গবেষণাগার", en: "Future lab" },
};

export function levelOf(xp: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i++;
  const next = LEVELS[i + 1];
  return {
    number: i + 1,
    bn: LEVELS[i].bn,
    en: LEVELS[i].en,
    next,
    progress: next ? (xp - LEVELS[i].at) / (next.at - LEVELS[i].at) : 1,
    toNext: next ? next.at - xp : 0,
  };
}

export function isUnlocked(feature: Feature, xp: number, openAll: boolean): boolean {
  return openAll || levelOf(xp).number >= UNLOCKS[feature].level;
}

/* ------------------------------------------------------------------ *
 * Progress
 * ------------------------------------------------------------------ */

export interface SimBest {
  score: number;
  runKey: string;
  at: string;
}

export interface Progress {
  quiz: { best: QuizBest; answers: Record<number, ("yes" | "no")[]>; ideas: Record<number, string> };
  /** Best score per challenge key "scenario:mode:context". */
  sim: Record<string, SimBest>;
  /** Run keys already counted, so the same run never pays twice. */
  counted: string[];
  /** Lab experiments completed, keyed "intervention>variable". */
  lab: Record<string, string>;
  /** Hidden mind-map links the player has found. */
  puzzleFound: string[];
  achievements: Record<string, string>;
}

export const emptyProgress: Progress = {
  quiz: { best: {}, answers: {}, ideas: {} },
  sim: {},
  counted: [],
  lab: {},
  puzzleFound: [],
  achievements: {},
};

export const SIM_XP_PER_POINT = 3;
export const LAB_XP = 40;
export const PUZZLE_XP = 100;
export const PUZZLE_TARGET = 4;

export const challengeKey = (scenario: string, mode: string, context: string) => `${scenario}:${mode}:${context}`;

export function simXp(sim: Progress["sim"]): number {
  return Object.values(sim).reduce((s, b) => s + b.score * SIM_XP_PER_POINT, 0);
}

export function totalXp(p: Progress): number {
  return quizXp(p.quiz.best) + simXp(p.sim) + Object.keys(p.lab).length * LAB_XP + (p.puzzleFound.length >= PUZZLE_TARGET ? PUZZLE_XP : 0);
}

/** Record a finished run. Idempotent: the same run key, or a worse score, changes nothing. */
export function recordRun(p: Progress, key: string, runKey: string, score: number, at: string): { progress: Progress; xpGained: number } {
  if (p.counted.includes(runKey)) return { progress: p, xpGained: 0 };
  const prev = p.sim[key];
  const counted = [...p.counted, runKey].slice(-200);
  if (prev && prev.score >= score) return { progress: { ...p, counted }, xpGained: 0 };
  const xpGained = (score - (prev?.score ?? 0)) * SIM_XP_PER_POINT;
  return { progress: { ...p, counted, sim: { ...p.sim, [key]: { score, runKey, at } } }, xpGained };
}

export function recordLab(p: Progress, key: string, at: string): { progress: Progress; xpGained: number } {
  if (p.lab[key]) return { progress: p, xpGained: 0 };
  return { progress: { ...p, lab: { ...p.lab, [key]: at } }, xpGained: LAB_XP };
}

export function recordQuiz(p: Progress, n: number, answers: ("yes" | "no")[], score: number): Progress {
  return {
    ...p,
    quiz: {
      ...p.quiz,
      best: { ...p.quiz.best, [n]: Math.max(p.quiz.best[n] ?? 0, score) },
      answers: { ...p.quiz.answers, [n]: answers },
    },
  };
}

/**
 * How far each module is restored on the national map, 0–1 by module
 * index: its best evidence-check score, or — for modules with a full
 * simulation — its best simulation score if that is higher.
 */
export function restoration(p: Progress): number[] {
  return puzzles.map((q) => {
    let best = p.quiz.best[q.n] ?? 0;
    if (q.n === 1) for (const [k, v] of Object.entries(p.sim)) if (k.startsWith("health-access:")) best = Math.max(best, v.score);
    return Math.min(1, best / 100);
  });
}

/** Quiz scores with the simulation folded in, for the national meters. */
export function nationalBest(p: Progress): QuizBest {
  const r = restoration(p);
  return Object.fromEntries(r.map((share, i) => [i + 1, Math.round(share * 100)]).filter(([, s]) => s > 0));
}

/* ------------------------------------------------------------------ *
 * Achievements — learning milestones, not engagement hooks
 * ------------------------------------------------------------------ */

export const ACHIEVEMENTS = [
  { id: "first-pilot", bn: "প্রথম পাইলট", hint: "কোনো হস্তক্ষেপ আগে ছোট পরিসরে পরীক্ষা করুন" },
  { id: "mapper", bn: "কারণ খুঁজে পেলেন", hint: "মানচিত্রে ৪টি লুকোনো সম্পর্ক খুঁজে বের করুন" },
  { id: "shield", bn: "ধাক্কা সামলানো", hint: "কোনো ঘটনার অর্ধেক ধাক্কা আগেই ঠেকান" },
  { id: "evidence", bn: "প্রমাণ-নির্ভর পরিকল্পনা", hint: "একটি খেলায় ‘প্রমাণ’ বিভাগে ৮০+" },
  { id: "equity", bn: "দূরের পরিবারের পক্ষে", hint: "একটি খেলায় সমতা ১০ পয়েন্ট বাড়ান" },
  { id: "scientist", bn: "বিজ্ঞানী", hint: "বিজ্ঞানাগারে একটি অনুমান পরীক্ষা করুন" },
  { id: "comparer", bn: "তুলনা করে শেখা", hint: "দুটি কৌশল পাশাপাশি তুলনা করুন" },
  { id: "theme", bn: "খাতের কাণ্ডারী", hint: "একটি খাতের সব প্রমাণ-পরীক্ষা সমাধান করুন" },
  { id: "half", bn: "অর্ধেক মানচিত্র", hint: "১৬টি মডিউল পুনর্গঠন করুন" },
  { id: "all", bn: "নতুন মানচিত্র", hint: "৩২টি মডিউলই পুনর্গঠন করুন" },
  { id: "mission", bn: "দলগত জয়", hint: "জাতীয় মিশনে দল নিয়ে চারটি সংস্কার চালু করুন" },
] as const;
export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

/** Achievements that follow from the stored progress alone. */
export function derivedAchievements(p: Progress): AchievementId[] {
  const solved = Object.values(p.quiz.best).filter(isSolved).length;
  const out: AchievementId[] = [];
  if (p.puzzleFound.length >= PUZZLE_TARGET) out.push("mapper");
  if (Object.keys(p.lab).length) out.push("scientist");
  if (themes.some((t) => puzzlesIn(t.id).every((q) => isSolved(p.quiz.best[q.n])))) out.push("theme");
  if (solved >= 16) out.push("half");
  if (solved >= puzzles.length) out.push("all");
  return out;
}

export function grant(p: Progress, ids: AchievementId[], at: string): { progress: Progress; fresh: AchievementId[] } {
  const fresh = ids.filter((id) => !p.achievements[id]);
  if (!fresh.length) return { progress: p, fresh };
  return { progress: { ...p, achievements: { ...p.achievements, ...Object.fromEntries(fresh.map((id) => [id, at])) } }, fresh };
}
