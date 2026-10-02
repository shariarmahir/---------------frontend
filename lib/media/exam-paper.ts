/**
 * A teacher's question paper for an exam: multiple choice (marked here),
 * short and written questions (answered on paper), each with marks. Students
 * see it only once the teacher releases it. Pure rules, tested in
 * exam-paper.test.ts.
 */

export type QuestionKind = "mcq" | "short" | "written";

export const QUESTION_KINDS: Record<QuestionKind, string> = { mcq: "বহুনির্বাচনি", short: "সংক্ষিপ্ত", written: "রচনামূলক" };

export interface ExamQuestion {
  id: string;
  kind: QuestionKind;
  q: string;
  /** MCQ only: four options and the right one. */
  options?: string[];
  answer?: number;
  marks: number;
}

export interface ExamPaper {
  questions: ExamQuestion[];
  /** Minutes. */
  duration?: number;
  instructions?: string;
  /** Hidden from students until released. */
  released?: boolean;
  /** MCQ marks each student got, by member id. */
  mcq?: Record<string, number>;
}

export const totalMarks = (qs: ExamQuestion[]) => qs.reduce((n, q) => n + q.marks, 0);
export const mcqTotal = (qs: ExamQuestion[]) => totalMarks(qs.filter((q) => q.kind === "mcq"));

/** Marks earned on the multiple-choice part; picks are by question index. */
export function scoreMcq(qs: ExamQuestion[], picks: (number | undefined)[]): number {
  return qs.reduce((n, q, i) => n + (q.kind === "mcq" && picks[i] === q.answer ? q.marks : 0), 0);
}

/** What is wrong with a question, or null when it is ready. */
export function questionProblem(q: ExamQuestion): string | null {
  if (q.q.trim().length < 3) return "প্রশ্নটি লিখুন";
  if (!Number.isFinite(q.marks) || q.marks < 1 || q.marks > 100) return "নম্বর ১ থেকে ১০০";
  if (q.kind === "mcq") {
    if (!q.options || q.options.length !== 4 || q.options.some((o) => !o.trim())) return "চারটি অপশনই লিখুন";
    if (q.answer === undefined || q.answer < 0 || q.answer > 3) return "সঠিক উত্তর বেছে দিন";
  }
  return null;
}

/** The teacher always sees the paper; everyone else once it is released. */
export const canSeePaper = (paper: ExamPaper | undefined, teacher: boolean) => Boolean(paper && (teacher || paper.released));
