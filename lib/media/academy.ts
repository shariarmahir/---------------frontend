import { computeFees } from "./fees.ts";

/**
 * কাণ্ডারী তৈরি একাডেমি — the rules a real skill school runs on. Pure, and
 * tested in academy.test.ts.
 *
 *  - Admission places, it never rejects. A short test and the years someone
 *    has already worked decide where they start; an experienced worker with
 *    proof can go straight to the final assessment (recognition of prior
 *    learning, as BTEB does for trades).
 *  - A teacher's standing is earned — the panel interview, students'
 *    ratings, graduates — and upheld complaints take it away.
 *  - The final is a panel interview on a real project, marked by two
 *    examiners; a third is called when they differ by more than 20 marks.
 */

export type Mode = "video" | "live" | "hands-on";
export const MODES: Record<Mode, string> = { video: "ভিডিও ক্লাস", live: "লাইভ ক্লাস", "hands-on": "হাতে-কলমে" };

export type School = "engineering" | "trades" | "food" | "arts" | "media" | "business" | "life" | "science";
export const SCHOOLS: Record<School, string> = {
  engineering: "প্রকৌশল ও প্রযুক্তি",
  trades: "কারিগরি ও মেরামত",
  food: "রান্না ও খাদ্য",
  arts: "শিল্প, সংগীত ও কারুকাজ",
  media: "মিডিয়া ও কনটেন্ট",
  business: "ব্যবসা ও হিসাব",
  life: "জীবনযাপন, রূপ ও খেলা",
  science: "বিজ্ঞান ও গণিত",
};

export type Level = "foundation" | "intermediate" | "advanced";
export const LEVELS: Record<Level, string> = { foundation: "শুরু থেকে", intermediate: "মাঝারি", advanced: "অভিজ্ঞ" };

/** Who runs a department: one teacher, a team of friends, or a working shop or kitchen. */
export type DeptKind = "solo" | "team" | "workshop";
export const DEPT_KINDS: Record<DeptKind, string> = { solo: "একক শিক্ষক", team: "শিক্ষক দল", workshop: "কর্মশালা" };

export interface Department {
  id: string;
  name: string;
  school: School;
  blurb: string;
  kind: DeptKind;
  /** Member handles; the first leads. */
  teachers: string[];
  /** The real place hands-on classes happen. */
  place?: string;
  founded: string;
}

export interface Lesson {
  week: number;
  title: string;
  mode: Mode;
  homework?: string;
}

export type MaterialKind = "video" | "pdf" | "doc" | "sheet" | "data";
export const MATERIAL_KINDS: Record<MaterialKind, string> = { video: "ভিডিও", pdf: "পিডিএফ", doc: "ডক", sheet: "এক্সেল", data: "ডেটা" };

export interface Material {
  kind: MaterialKind;
  title: string;
  size: string;
  /** A kept copy (data URL) or a link, for materials a teacher added. */
  href?: string;
  /** The uploaded file's own name, for downloading it back. */
  file?: string;
  at?: string;
}

export interface Course {
  /** A course code, e.g. "MTR-101". */
  id: string;
  dept: string;
  title: string;
  /** Lead teacher's handle. */
  teacher: string;
  level: Level;
  weeks: number;
  /** Taka; 0 is free. */
  fee: number;
  seats: number;
  enrolled: number;
  image: string;
  /** What the learner can do at the end, in one line. */
  outcome: string;
  lessons: Lesson[];
  materials: Material[];
  /** The final project the panel interview is about. */
  final: string;
  /** The next live or hands-on session. */
  nextLive?: string;
}

export interface Workshop {
  id: string;
  dept: string;
  title: string;
  host: string;
  at: string;
  place: string;
  seats: number;
  taken: number;
  fee: number;
  image: string;
}

export interface TeacherRecord {
  handle: string;
  dept: string;
  /** "মোটরসাইকেল মেকানিক · ১৮ বছর" — what they teach from. */
  title: string;
  interview: { at: string; score: number; panel: string[] };
  rating: { avg: number; count: number };
  graduates: number;
  stories: { name: string; text: string }[];
  complaints: { upheld: number; open: number };
}

/* ── Admission ─────────────────────────────────────────────────────── */

export interface Placement {
  level: Level;
  /** Straight to the final assessment: experience with proof. */
  fastTrack: boolean;
}

/** Where a learner starts, from the test score (0–100), years worked and proof of work. */
export function placement({ testPct, years, hasProof }: { testPct: number; years: number; hasProof: boolean }): Placement {
  const level: Level = testPct >= 80 || (years >= 2 && testPct >= 60) ? "advanced" : testPct >= 50 || years >= 1 ? "intermediate" : "foundation";
  return { level, fastTrack: level === "advanced" && years >= 3 && hasProof };
}

/* ── Teachers ──────────────────────────────────────────────────────── */

/** Upheld complaints that pause a teacher until the panel reviews them. */
export const REVIEW_AT = 3;

export interface TeacherPoints {
  interview: number;
  rating: number;
  graduates: number;
  stories: number;
  penalty: number;
  total: number;
}

/**
 * Out of 100: the panel interview is worth 40, students' ratings 30,
 * graduates 20 (one point per five) and success stories 10 (two each).
 * Every upheld complaint costs 10.
 */
export function teacherPoints(t: Pick<TeacherRecord, "interview" | "rating" | "graduates" | "stories" | "complaints">): TeacherPoints {
  const interview = Math.round(t.interview.score * 0.4);
  const rating = t.rating.count > 0 ? Math.round((t.rating.avg / 5) * 30) : 0;
  const graduates = Math.min(20, Math.floor(t.graduates / 5));
  const stories = Math.min(10, t.stories.length * 2);
  const penalty = t.complaints.upheld * 10;
  const total = Math.max(0, Math.min(100, interview + rating + graduates + stories - penalty));
  return { interview, rating, graduates, stories, penalty, total };
}

export type Tier = "lead" | "skilled" | "new" | "review";
export const TIERS: Record<Tier, string> = { lead: "প্রধান শিক্ষক", skilled: "দক্ষ শিক্ষক", new: "নতুন শিক্ষক", review: "পর্যালোচনায়" };

export function teacherTier(total: number, upheld: number): Tier {
  if (upheld >= REVIEW_AT) return "review";
  return total >= 75 ? "lead" : total >= 50 ? "skilled" : "new";
}

/* ── Progress and the final ────────────────────────────────────────── */

export const MIN_ATTENDANCE = 0.75;
export const MIN_HOMEWORK = 0.8;

export interface Enrollment {
  at: string;
  /** Weeks the learner attended. */
  attended: number[];
  /** Homework answers by week. */
  homework: Record<number, string>;
  project?: { title: string; link: string; summary: string; at: string };
  /** The booked panel interview. */
  interview?: string;
}

export interface Progress {
  attended: number;
  homeworkDone: number;
  homeworkSet: number;
  /** Classes still needed to reach 75% attendance. */
  needClasses: number;
  needHomework: number;
  eligible: boolean;
}

/** The final is open once attendance, homework and the project are in. */
export function progressOf(course: Pick<Course, "lessons">, e: Pick<Enrollment, "attended" | "homework" | "project">): Progress {
  const weeks = new Set(course.lessons.map((l) => l.week));
  const attended = new Set(e.attended.filter((w) => weeks.has(w))).size;
  const set = course.lessons.filter((l) => l.homework).map((l) => l.week);
  const homeworkDone = set.filter((w) => (e.homework[w] ?? "").trim().length > 0).length;
  const needClasses = Math.max(0, Math.ceil(course.lessons.length * MIN_ATTENDANCE) - attended);
  const needHomework = Math.max(0, Math.ceil(set.length * MIN_HOMEWORK) - homeworkDone);
  return { attended, homeworkDone, homeworkSet: set.length, needClasses, needHomework, eligible: needClasses === 0 && needHomework === 0 && Boolean(e.project) };
}

export const PASS_MARK = 60;
export const DISTINCTION = 80;
export const EXAMINER_GAP = 20;

export type Verdict = "distinction" | "pass" | "retake" | "third-examiner";
export const VERDICTS: Record<Verdict, string> = { distinction: "কৃতিত্বের সাথে উত্তীর্ণ", pass: "উত্তীর্ণ", retake: "আবার চেষ্টা", "third-examiner": "তৃতীয় পরীক্ষক" };

/**
 * Two examiners' marks out of 100. Within 20 of each other they are
 * averaged; further apart, a third examiner marks and is averaged with the
 * closer of the two.
 */
export function finalResult(marks: number[]): { average: number; verdict: Verdict } {
  const [a, b, third] = marks;
  if (a === undefined || b === undefined) throw new Error("finalResult needs two examiners");
  let pair = [a, b];
  if (Math.abs(a - b) > EXAMINER_GAP) {
    if (third === undefined) return { average: Math.round((a + b) / 2), verdict: "third-examiner" };
    pair = [third, Math.abs(third - a) <= Math.abs(third - b) ? a : b];
  }
  const average = Math.round((pair[0] + pair[1]) / 2);
  return { average, verdict: average >= DISTINCTION ? "distinction" : average >= PASS_MARK ? "pass" : "retake" };
}

/**
 * The next panel-interview slots: 10 am and 3 pm Bangladesh time, from the
 * day after `from`, skipping Fridays.
 */
export function interviewSlots(from: Date, count = 6): string[] {
  const slots: string[] = [];
  const day = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  while (slots.length < count) {
    day.setUTCDate(day.getUTCDate() + 1);
    if (day.getUTCDay() === 5) continue;
    // 10:00 and 15:00 at UTC+6.
    for (const hourUtc of [4, 9]) {
      if (slots.length < count) slots.push(new Date(day.getTime() + hourUtc * 3_600_000).toISOString());
    }
  }
  return slots;
}

/** A certificate's public ID, e.g. KTA-2026-MTR101-0007. */
export function certificateId(year: number, course: string, serial: number): string {
  return `KTA-${year}-${course.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}-${String(serial).padStart(4, "0")}`;
}

export type ComplaintKind = "absent" | "quality" | "money" | "behaviour" | "safety";
export const COMPLAINT_KINDS: Record<ComplaintKind, string> = {
  absent: "ক্লাস নেননি বা দেরিতে",
  quality: "শেখানোর মান খারাপ",
  money: "ফি বা টাকা নিয়ে সমস্যা",
  behaviour: "অসম্মানজনক আচরণ",
  safety: "হয়রানি বা নিরাপত্তা",
};

/* ── The viewer's own academy (kept in the media store) ────────────── */

export interface Admission {
  dept: string;
  goal: string;
  years: number;
  proof: string;
  /** Test score, 0–100. */
  score: number;
  level: Level;
  fastTrack: boolean;
  at: string;
}

export interface TeachApplication {
  kind: DeptKind;
  dept: string;
  newDept: string;
  skill: string;
  years: number;
  sample: string;
  plan: string;
  team: string[];
  place: string;
  at: string;
  /** The booked panel interview. */
  interview?: string;
}

export interface Complaint {
  id: string;
  teacher: string;
  course: string;
  kind: ComplaintKind;
  details: string;
  at: string;
}

export interface AcademyState {
  /** Departments joined, by department id: one admission each. */
  admissions: Record<string, Admission>;
  /** By course code. */
  enrolled: Record<string, Enrollment>;
  application: TeachApplication | null;
  complaints: Complaint[];
  /** Workshop seats taken. */
  workshops: Record<string, true>;
  /* Teaching, on this device. */
  /** Courses the teacher built, waiting for the panel. */
  drafts: Course[];
  /** Materials the teacher added, by course code. */
  materials: Record<string, Material[]>;
  /** Attendance taken: course code → week → ids of students present. A week here is a class held. */
  attendance: Record<string, Record<number, string[]>>;
  /** Panel marks the viewer gave, by board seat. */
  marks: Record<string, PanelMark>;
}

export const emptyAcademy: AcademyState = { admissions: {}, enrolled: {}, application: null, complaints: [], workshops: {}, drafts: [], materials: {}, attendance: {}, marks: {} };

/**
 * Saved state from any earlier version, made whole: missing parts start
 * empty, and the old single `admission` becomes that department's entry.
 */
export function normalizeAcademy(raw: unknown): AcademyState {
  const saved = (raw && typeof raw === "object" ? raw : {}) as Partial<AcademyState> & { admission?: Admission | null };
  const { admission, ...rest } = saved;
  const admissions = { ...rest.admissions };
  if (admission && !admissions[admission.dept]) admissions[admission.dept] = admission;
  return { ...emptyAcademy, ...rest, admissions };
}

/** The most recent department joined. */
export function latestAdmission(admissions: Record<string, Admission>): Admission | undefined {
  return Object.values(admissions).sort((a, b) => b.at.localeCompare(a.at))[0];
}

/* ── Teaching ──────────────────────────────────────────────────────── */

/** What a material is, from its file name. */
export function materialKindOf(name: string): MaterialKind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (["mp4", "mov", "webm", "mkv", "m4v"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "sheet";
  if (["doc", "docx", "ppt", "pptx", "txt", "md", "odt", "rtf"].includes(ext)) return "doc";
  return "data";
}

/** A file size as a number and its unit, kilobytes up to a megabyte. */
export function sizeParts(bytes: number): { value: number; unit: "কেবি" | "এমবি" } {
  return bytes >= 1024 * 1024 ? { value: Math.round((bytes / (1024 * 1024)) * 10) / 10, unit: "এমবি" } : { value: Math.max(1, Math.round(bytes / 1024)), unit: "কেবি" };
}

/** One student's attendance over the classes held so far (a full record before any). */
export function attendanceOf(held: Record<number, string[]>, studentId: string): { present: number; held: number; rate: number } {
  const weeks = Object.values(held);
  const present = weeks.filter((ids) => ids.includes(studentId)).length;
  return { present, held: weeks.length, rate: weeks.length ? present / weeks.length : 1 };
}

/**
 * The teacher's side of a course's fees. They earn 95% of every fee; it
 * waits in escrow and a week's share is released when that class is held.
 */
export function payoutOf(course: Pick<Course, "fee" | "enrolled" | "lessons">, weeksHeld: number): { earn: number; released: number; waiting: number } {
  const earn = computeFees(course.fee).sellerReceives * course.enrolled;
  const share = course.lessons.length ? Math.min(weeksHeld, course.lessons.length) / course.lessons.length : 0;
  const released = Math.round(earn * share);
  return { earn, released, waiting: earn - released };
}

/** The first free course code in a department, counting up from 101. */
export function draftCode(dept: string, taken: string[]): string {
  const prefix = (dept.replace(/[^a-z]/gi, "").slice(0, 3) || "NEW").toUpperCase();
  let n = 101;
  while (taken.includes(`${prefix}-${n}`)) n++;
  return `${prefix}-${n}`;
}

/* ── Panel marking ─────────────────────────────────────────────────── */

/** What the panel marks, out of 100 in all. */
export const RUBRIC = [
  { id: "works", bn: "কাজটা সত্যিই চলে", max: 30, guide: "সামনে চালিয়ে বা ব্যবহার করে দেখাতে পারলে পুরো নম্বর।" },
  { id: "craft", bn: "হাতের কাজ ও কারিগরি", max: 25, guide: "কাজের মান, যন্ত্রপাতির সঠিক ব্যবহার, ফিনিশিং।" },
  { id: "explain", bn: "ব্যাখ্যা ও প্রশ্নের উত্তর", max: 20, guide: "কেন এভাবে করলেন, ভুল হলে কী করবেন — নিজের ভাষায়।" },
  { id: "safety", bn: "নিরাপত্তা ও পরিচ্ছন্নতা", max: 15, guide: "নিজের ও অন্যের নিরাপত্তা, পরিচ্ছন্ন কাজ, নিয়ম মানা।" },
  { id: "cost", bn: "সময় ও খরচের হিসাব", max: 10, guide: "সময় আর খরচের সৎ হিসাব, কাস্টমারকে দাম বোঝানো।" },
] as const;

export interface PanelMark {
  /** One score per rubric line, in order. */
  scores: number[];
  total: number;
  comment: string;
  at: string;
}

/** The total of a rubric, each line held between 0 and its maximum. */
export function rubricTotal(scores: number[]): number {
  return RUBRIC.reduce((n, r, i) => n + Math.max(0, Math.min(r.max, Math.round(scores[i] ?? 0))), 0);
}
