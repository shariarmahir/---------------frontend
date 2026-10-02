/**
 * ল্যাব রুম — a lab course run by its leader (CR / lab captain): experiments
 * with their topic, task sheet, questions and report deadline; students hand
 * in the report and a photo of the finished task; lab exams sit alongside.
 * Pure rules here, tested in lab.test.ts.
 */

import type { NoteFile } from "./classroom.ts";
import type { SharedRef } from "./showcase.ts";
import type { Rota } from "./teamwork.ts";

export interface LabMember {
  id: string;
  name: string;
  accountId?: string;
}

export interface LabSubmission {
  id: string;
  /** Member id. */
  by: string;
  kind: "report" | "done";
  /** The report (PDF or photo) or the finished-task photo; seeded samples carry none. */
  file?: NoteFile;
  note?: string;
  /** ISO date-time. */
  at: string;
}

export interface Experiment {
  id: string;
  /** Experiment number as the course numbers it. */
  no: number;
  title: string;
  /** Objective and theory to read before the lab. */
  topic: string;
  /** Lab day, YYYY-MM-DD. */
  date: string;
  /** "10:00" */
  time?: string;
  /** Report deadline, "YYYY-MM-DDTHH:mm" in Bangladesh time. */
  due: string;
  /** What to do in the lab, and the task sheet the leader photographed. */
  task?: { text: string; file?: NoteFile };
  /** Pre-lab and viva questions. */
  questions: string[];
  submissions: LabSubmission[];
}

export interface LabExam {
  id: string;
  title: string;
  kind: "quiz" | "viva" | "final";
  /** YYYY-MM-DD */
  date: string;
  time?: string;
  /** Experiments it covers, as text. */
  syllabus?: string;
}

export interface LabRoom {
  id: string;
  name: string;
  /** Course code and title, e.g. "EEE 102 · সার্কিট ল্যাব". */
  course: string;
  institution: string;
  code: string;
  leaderId: string;
  instructor?: string;
  members: LabMember[];
  experiments: Experiment[];
  exams: LabExam[];
  /** Most members allowed; the leader may change it later. */
  maxMembers?: number;
  /** The usual lab day, Saturday = 0; the default duties gather round it. */
  labDay?: number;
  /** Weekly duties; lab defaults when unset. */
  rota?: Rota;
  /** Findings and research the group shared out. */
  shares?: SharedRef[];
}

export const EXAM_KINDS: Record<LabExam["kind"], string> = { quiz: "ল্যাব কুইজ", viva: "ভাইভা", final: "ল্যাব ফাইনাল" };

/** Bangladesh is UTC+6 all year; deadlines are written in local time. */
const BD_OFFSET = 6 * 3_600_000;
export const dueAt = (due: string) => Date.parse(`${due}:00Z`) - BD_OFFSET;
const dayStart = (iso: string) => Date.parse(`${iso}T00:00:00Z`) - BD_OFFSET;
const DAY = 86_400_000;

/** Whole days from today (Bangladesh) to a date; 0 = today. */
export function daysUntil(date: string, now: Date): number {
  const today = Math.floor((now.getTime() + BD_OFFSET) / DAY);
  return Math.round((dayStart(date) + BD_OFFSET) / DAY) - today;
}

/** The next lab day, today included. */
export function nextLab(experiments: Experiment[], now: Date): { exp: Experiment; days: number } | null {
  return (
    experiments
      .map((exp) => ({ exp, days: daysUntil(exp.date, now) }))
      .filter((x) => x.days >= 0)
      .sort((a, b) => a.days - b.days || a.exp.no - b.exp.no)[0] ?? null
  );
}

export const hasReport = (exp: Experiment, memberId: string) => exp.submissions.some((s) => s.by === memberId && s.kind === "report");

/** The soonest report still owed by this member, deadline not yet passed. */
export function nextDue(experiments: Experiment[], memberId: string, now: Date): { exp: Experiment; hours: number } | null {
  return (
    experiments
      .filter((e) => !hasReport(e, memberId) && dueAt(e.due) >= now.getTime())
      .map((exp) => ({ exp, hours: (dueAt(exp.due) - now.getTime()) / 3_600_000 }))
      .sort((a, b) => a.hours - b.hours)[0] ?? null
  );
}

export type ReportState = "submitted" | "late" | "missing" | "due-soon" | "open";

/** Where one member stands on one report. Due-soon is the last 48 hours. */
export function reportState(exp: Experiment, memberId: string, now: Date): ReportState {
  const report = exp.submissions.find((s) => s.by === memberId && s.kind === "report");
  const deadline = dueAt(exp.due);
  if (report) return Date.parse(report.at) > deadline ? "late" : "submitted";
  if (now.getTime() > deadline) return "missing";
  return deadline - now.getTime() <= 48 * 3_600_000 ? "due-soon" : "open";
}

/** "২ দিন ৫ ঘণ্টা" style countdown parts; never negative. */
export function countdown(hours: number): { days: number; hours: number } {
  const h = Math.max(0, Math.floor(hours));
  return { days: Math.floor(h / 24), hours: h % 24 };
}

/** Reports handed in out of those already due, for one member. */
export function reportTally(experiments: Experiment[], memberId: string, now: Date): { done: number; owed: number } {
  const due = experiments.filter((e) => dueAt(e.due) <= now.getTime() || hasReport(e, memberId));
  return { done: due.filter((e) => hasReport(e, memberId)).length, owed: due.length };
}

/** How many members handed in each kind, for the leader's view. */
export function handIns(exp: Experiment, members: LabMember[]): { report: number; done: number; of: number } {
  const ids = new Set(members.map((m) => m.id));
  const count = (kind: LabSubmission["kind"]) => new Set(exp.submissions.filter((s) => s.kind === kind && ids.has(s.by)).map((s) => s.by)).size;
  return { report: count("report"), done: count("done"), of: members.length };
}

/** The next experiment number: one past the highest so far. */
export const nextNo = (experiments: Experiment[]) => experiments.reduce((n, e) => Math.max(n, e.no), 0) + 1;
