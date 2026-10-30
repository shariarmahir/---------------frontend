/**
 * The batch quiz: the teacher writes questions, a learner answers each once
 * for points and keeps a streak of days played. Pure rules, tested by hand
 * in the classroom.
 */

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  /** Index of the right option. */
  answer: number;
}

/** What a learner has done on a batch's quiz: the option picked for each question, and the days played. */
export interface QuizPlay {
  picks: Record<string, number>;
  days: string[];
}

export const POINTS_PER_ANSWER = 10;

export const pointsOf = (questions: QuizQuestion[], play: QuizPlay): number => questions.filter((q) => play.picks[q.id] === q.answer).length * POINTS_PER_ANSWER;

const DAY = 86_400_000;
const back = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) - n * DAY).toISOString().slice(0, 10);

/** Days in a row up to today (or yesterday, if today is not played yet). */
export function streak(days: string[], today: string): number {
  const set = new Set(days);
  let n = 0;
  let d = set.has(today) ? today : back(today, 1);
  while (set.has(d)) {
    n += 1;
    d = back(d, 1);
  }
  return n;
}

export type Badge = { id: string; label: string };

/** Badges earned so far, each from a plain threshold. */
export function badgesOf(points: number, run: number, answered: number): Badge[] {
  return [
    answered >= 1 && { id: "first", label: "প্রথম উত্তর" },
    points >= 50 && { id: "fifty", label: "৫০ পয়েন্ট" },
    run >= 3 && { id: "streak3", label: "টানা তিন দিন" },
    run >= 7 && { id: "streak7", label: "টানা সাত দিন" },
  ].filter((b): b is Badge => Boolean(b));
}
