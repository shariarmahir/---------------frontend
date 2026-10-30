/**
 * A batch's exams: a title, a day, the full marks, and the marks the teacher
 * gave each learner. Pure rules, shared by the classroom's exam screen and
 * its dashboard.
 */

export interface BatchExam {
  id: string;
  title: string;
  /** The day, YYYY-MM-DD. */
  on: string;
  /** Full marks. */
  marks: number;
  /** Marks given, by learner id. */
  scores: Record<string, number>;
}

export type ExamStage = "upcoming" | "today" | "past";

export const examStage = (e: Pick<BatchExam, "on">, today: string): ExamStage => (e.on > today ? "upcoming" : e.on === today ? "today" : "past");

/** The next exam still to come (or on today), soonest first. */
export const nextExam = (list: BatchExam[], today: string): BatchExam | undefined => [...list].filter((e) => e.on >= today).sort((a, b) => a.on.localeCompare(b.on))[0];

/** Learners with their marks, best first. */
export const ranked = (e: BatchExam): { id: string; score: number }[] =>
  Object.entries(e.scores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);

export function average(e: BatchExam): number | null {
  const all = Object.values(e.scores);
  return all.length ? Math.round((all.reduce((a, b) => a + b, 0) / all.length) * 10) / 10 : null;
}

/** Marks stay between zero and the full marks; anything else is not a mark. */
export const clampMark = (raw: string, full: number): number | null => {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(Math.max(Math.round(n * 10) / 10, 0), full) : null;
};
