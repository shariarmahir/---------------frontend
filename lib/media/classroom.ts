/**
 * ক্লাসরুম — a batch or class run by its leader (CR / captain), inside
 * শিক্ষিতদের মিডিয়া. Everyone acts as their Kandari Profile; there is no
 * separate classroom account. Pure rules here, tested in classroom.test.ts.
 */

export type ClassLevel = "school" | "college" | "university" | "job";

export interface MemberStats {
  /** Notes and materials shared with the class. */
  notes: number;
  /** Class problems and challenges solved. */
  solved: number;
  /** Times they helped a classmate. */
  helped: number;
  /** Average assessment score, 0–100. */
  assess: number;
}

export interface Member {
  id: string;
  name: string;
  /** Set when the member is a Kandari account (the viewer, a known handle). */
  accountId?: string;
  stats: MemberStats;
}

export interface Topic {
  id: string;
  subject: string;
  title: string;
  done: boolean;
}

export interface Exam {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  kind: "class" | "public";
}

/** One weekly slot: day 0 = Saturday (the Bangladeshi week). */
export interface Slot {
  day: number;
  time: string;
  subject: string;
  topic?: string;
}

/** A scanned page or uploaded file, kept in the browser as a data URL. */
export interface NoteFile {
  name: string;
  type: string;
  size: number;
  data: string;
}

export interface ClassNote {
  id: string;
  kind: "note" | "homework" | "material" | "rule";
  /** One line, shown on the card. */
  title: string;
  /** Details, opened on demand. */
  text: string;
  file?: NoteFile;
  by: string;
  at: string;
  /** Only the author sees it. */
  private?: boolean;
}

export interface Problem {
  id: string;
  kind: "class" | "solo" | "innovation";
  title: string;
  body: string;
  by: string;
  solutions: { by: string; text: string; at: string }[];
  solved?: boolean;
}

export interface Question {
  q: string;
  options: string[];
  answer: number;
}

export interface Paper {
  id: string;
  title: string;
  by: string;
  questions: Question[];
  /** Best score per member id. */
  scores: Record<string, number>;
  daily?: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  level: ClassLevel;
  institution: string;
  code: string;
  leaderId: string;
  teacher?: { name: string; subject: string };
  members: Member[];
  topics: Topic[];
  exams: Exam[];
  routine: Slot[];
  notes: ClassNote[];
  problems: Problem[];
  papers: Paper[];
  /** Today's class topic, set by the leader. */
  todayTopic?: string;
}

export const LEVELS: Record<ClassLevel, { bn: string; hint: string }> = {
  school: { bn: "স্কুল", hint: "ক্লাস ৬–১০, এসএসসি" },
  college: { bn: "কলেজ", hint: "এইচএসসি, ভর্তি প্রস্তুতি" },
  university: { bn: "বিশ্ববিদ্যালয়", hint: "ব্যাচ, সেমিস্টার, ল্যাব" },
  job: { bn: "চাকরির প্রস্তুতি", hint: "বিসিএস, ব্যাংক, সরকারি চাকরি" },
};

export const WEEKDAYS = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"];

/** Week index (Saturday = 0) of a date. */
export const weekday = (d: Date) => (d.getUTCDay() + 1) % 7;

const DAY_MS = 86_400_000;
const dayOf = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

export function syllabusProgress(topics: { done: boolean }[]): number {
  if (topics.length === 0) return 0;
  return Math.floor((topics.filter((t) => t.done).length / topics.length) * 100);
}

/** The soonest exam on or after today, with whole days to go. */
export function nextExam<E extends { date: string }>(exams: E[], today: Date): { exam: E; days: number } | null {
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const ahead = exams
    .map((exam) => ({ exam, days: Math.round((dayOf(exam.date) - start) / DAY_MS) }))
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days);
  return ahead[0] ?? null;
}

export function examAlert(days: number): "today" | "near" | "calm" {
  if (days <= 0) return "today";
  return days <= 7 ? "near" : "calm";
}

/** Sharing, solving and helping count for more than raw marks. */
export function pointsOf(s: MemberStats): number {
  return s.notes * 5 + s.solved * 10 + s.helped * 8 + Math.round(s.assess / 10);
}

export function rank<M extends { stats: MemberStats }>(members: M[]): (M & { points: number })[] {
  return members.map((m) => ({ ...m, points: pointsOf(m.stats) })).sort((a, b) => b.points - a.points);
}

/** Below this average a student is offered a recovery buddy. */
export const WEAK_BELOW = 50;

/** An average of 0 means no assessment taken yet, not a failing student. */
export const needsHelp = (s: MemberStats) => s.assess > 0 && s.assess < WEAK_BELOW;

/** Each weak student, weakest first, gets the strongest helper still free. */
export function recoveryPairs(members: { id: string; stats: MemberStats }[]): { weak: string; buddy: string }[] {
  const weak = members.filter((m) => needsHelp(m.stats)).sort((a, b) => a.stats.assess - b.stats.assess);
  const helpers = members
    .filter((m) => m.stats.assess >= 70)
    .sort((a, b) => b.stats.helped - a.stats.helped || b.stats.assess - a.stats.assess);
  return weak.flatMap((w, i) => (helpers[i] ? [{ weak: w.id, buddy: helpers[i].id }] : []));
}

export function scorePaper(questions: { answer: number }[], picks: (number | undefined)[]): number {
  if (questions.length === 0) return 0;
  const right = questions.filter((q, i) => picks[i] === q.answer).length;
  return Math.round((right / questions.length) * 100);
}

/** Six letters or digits, upper-cased; anything else is not a code. */
export function validJoinCode(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9]{6}$/.test(code) ? code : null;
}

/** Scan look: paper to white, ink to black, for one luminance value 0–255. */
export function docTone(l: number): number {
  return Math.max(0, Math.min(255, Math.round((l - 128) * 1.8 + 153)));
}

/** Shrink to fit `max` on the long side; never enlarge. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const k = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * k), height: Math.round(height * k) };
}

/** A safe download name that keeps Bangla. */
export function noteFileName(title: string, ext: string): string {
  const base = title.replace(/[\\/:*?"<>|\s]+/g, " ").trim().slice(0, 80);
  return `${base || "note"}.${ext}`;
}

/** Notes live in browser storage (~5 MB in all), so one file stays small. */
export const NOTE_FILE_MAX = 1_500_000;
export const fileTooBig = (bytes: number) => bytes > NOTE_FILE_MAX;

/** No I, O, 0 or 1: a code read aloud or off a board is not misread. */
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A fresh six-character join code (classrooms, team secret keys). */
export function newJoinCode(rand: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)]).join("");
}
