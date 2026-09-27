/**
 * The evidence-check mini-game (one per module): four policy proposals,
 * each answered হ্যাঁ/না against the dossier's evidence discipline. Also
 * the national layer's eight game meters, which these results move.
 */

import type { Urgency } from "../../data/amar-bangladesh.ts";
import { meters, pointOf, puzzles, type Answer, type MeterId, type Puzzle, type ThemeId } from "../../data/gori/puzzles.ts";

export type QuizBest = Record<number, number>;

export const SOLVED_AT = 75;

export function scoreOf(p: Puzzle, answers: readonly Answer[]): number {
  const right = p.decisions.filter((d, i) => answers[i] === d.answer).length;
  return Math.round((right / p.decisions.length) * 100);
}

export function starsOf(score: number | undefined): 0 | 1 | 2 | 3 {
  if (score === undefined) return 0;
  if (score >= 100) return 3;
  if (score >= 75) return 2;
  if (score >= 50) return 1;
  return 0;
}

export const isSolved = (score: number | undefined) => (score ?? 0) >= SOLVED_AT;

export const URGENCY_XP: Record<Urgency, number> = { "very-high": 1.5, high: 1.25, "medium-high": 1.1, medium: 1 };

export function xpFor(n: number, score: number): number {
  return Math.round(score * URGENCY_XP[pointOf(n).urgency]);
}

export function quizXp(best: QuizBest): number {
  return Object.entries(best).reduce((sum, [n, s]) => sum + xpFor(Number(n), s), 0);
}

export const QUIZ_MAX_XP = puzzles.reduce((sum, p) => sum + xpFor(p.n, 100), 0);

/**
 * Each meter rises from its base toward 100 in proportion to the weighted
 * best scores of the puzzles that move it — every puzzle perfect puts every
 * meter at 100. `extra` lets a full simulation count for its module.
 */
export function meterValues(best: QuizBest): Record<MeterId, number> {
  const out = {} as Record<MeterId, number>;
  for (const m of meters) {
    let got = 0;
    let max = 0;
    for (const p of puzzles) {
      const w = p.impact[m.id] ?? 0;
      max += w * 100;
      got += w * (best[p.n] ?? 0);
    }
    out[m.id] = Math.round(m.base + (100 - m.base) * (max ? got / max : 0));
  }
  return out;
}

/** "বাংলাদেশ ২০৫০" — the mean of all eight meters. A game index. */
export function nationIndex(values: Record<MeterId, number>): number {
  const all = Object.values(values);
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}

export function meterDelta(before: QuizBest, after: QuizBest) {
  const a = meterValues(before);
  const b = meterValues(after);
  return meters.map((m) => ({ id: m.id, bn: m.bn, from: a[m.id], to: b[m.id] })).filter((d) => d.to !== d.from);
}

export function puzzlesIn(theme: ThemeId): Puzzle[] {
  return puzzles.filter((p) => pointOf(p.n).theme === theme);
}

/** The most urgent module not yet solved, in dossier order. */
export function nextPuzzle(best: QuizBest): Puzzle | undefined {
  const order: Urgency[] = ["very-high", "high", "medium-high", "medium"];
  for (const u of order) {
    const p = puzzles.find((q) => pointOf(q.n).urgency === u && !isSolved(best[q.n]));
    if (p) return p;
  }
  return undefined;
}

/** The day, in Dhaka, as YYYY-MM-DD. */
export function dhakaDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
