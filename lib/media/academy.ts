import { computeFees } from "./fees.ts";
import type { Batch, RoomMessage } from "./batch.ts";
import type { BatchExam } from "./batch-exam.ts";
import type { StudyFile } from "./study-file.ts";
import type { PlanNode } from "./plan.ts";
import type { QuizPlay, QuizQuestion } from "./quiz.ts";
import type { Notice } from "./notices.ts";
import { bnDigits } from "./format.ts";

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

/**
 * Every department belongs to an academy. One teacher can open a solo
 * academy under their own name; friends together open a team academy, like
 * the four friends of ষড়বিংশ একাডেমি.
 */
export type DeptKind = "solo" | "team";
export const DEPT_KINDS: Record<DeptKind, string> = { solo: "একক একাডেমি", team: "দলীয় একাডেমি" };

/* ── The academy rules ─────────────────────────────────────────────── */

/** An academy opens one or more departments, and a department teaches exactly three skill courses. */
export const DEPT_COURSES = 3;
/** Every course ends 40 days after it starts: five weeks of classes, then five days for the project and the panel. */
export const COURSE_DAYS = 40;
export const CLASS_WEEKS = 5;
export const FINAL_DAYS = COURSE_DAYS - CLASS_WEEKS * 7;
/** Every online class is 40 minutes. */
export const CLASS_MINUTES = 40;
/** One batch of one course: at most 5 skill hunters with a solo academy, 15 with a team. */
export const BATCH_MAX: Record<DeptKind, number> = { solo: 5, team: 15 };
/** The course's promo video: the whole course in two and a half minutes, give or take five seconds. */
export const PROMO_SECONDS = 150;
export const PROMO_SLACK = 5;
/** A department's name is short: what it teaches, in a few words. */
export const DEPT_NAME_MAX = 24;

/** The academy a department belongs to — like a university, it may open several. */
export interface AcademyInfo {
  /** Its address, e.g. "sorobingsho"; every department of the academy carries the same. */
  id: string;
  name: string;
  /** One or two lines: who they are and how they teach. */
  about: string;
}

/* What a department suits, for the academy finder. */
/** The dream: a job, one's own business, earning from home, or the joy of it. */
export type Goal = "job" | "business" | "home" | "joy";
/** What one likes working with. */
export type Like = "machines" | "computers" | "art" | "food" | "people" | "body" | "numbers";
/** Where one's talent lies. */
export type Talent = "hands" | "mind" | "art" | "body";
export interface DeptFit {
  goals: Goal[];
  likes: Like[];
  talents: Talent[];
}

/** An academy with all its departments, as the finder and its own page show it. */
export interface Academy extends AcademyInfo {
  kind: DeptKind;
  departments: Department[];
  /** Every member who teaches in any of its departments, in order of first appearance. */
  teachers: string[];
  /** The earliest department's founding day. */
  founded: string;
}

export interface Department {
  id: string;
  /** Short and to the point, e.g. "ওয়েব ডেভেলপমেন্ট". */
  name: string;
  academy: AcademyInfo;
  school: School;
  blurb: string;
  kind: DeptKind;
  /** Member handles; the first leads. A solo academy has exactly one. */
  teachers: string[];
  /** The real place hands-on classes happen. */
  place?: string;
  founded: string;
  /** What it suits, for the finder. */
  fit?: DeptFit;
}

export interface Lesson {
  week: number;
  title: string;
  mode: Mode;
  homework?: string;
  /** In a team academy, the member who teaches this topic. */
  by?: string;
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
  /** The day the batch starts, YYYY-MM-DD; it ends COURSE_DAYS later. */
  starts: string;
  /* Three things every course is opened with. */
  syllabus: Material;
  /** The working calendar: which class on which day. */
  calendar: Material;
  /** The promo: the whole course in PROMO_SECONDS. */
  promo: { seconds: number; href?: string; file?: string };
  /** A draft for a department that already has its three courses takes this one's place once approved. */
  replaces?: string;
}

/* ── The 40-day course ─────────────────────────────────────────────── */

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export interface Timeline {
  /** Each class week, its first and last day. */
  weeks: { week: number; from: string; to: string }[];
  /** Project and panel. */
  final: { from: string; to: string };
  /** Day 40. */
  ends: string;
}

/** A course's 40 days from its first: five class weeks, then the project and the panel. */
export function courseTimeline(starts: string): Timeline {
  const weeks = Array.from({ length: CLASS_WEEKS }, (_, i) => ({ week: i + 1, from: addDays(starts, i * 7), to: addDays(starts, i * 7 + 6) }));
  return { weeks, final: { from: addDays(starts, CLASS_WEEKS * 7), to: addDays(starts, COURSE_DAYS - 1) }, ends: addDays(starts, COURSE_DAYS - 1) };
}

/** Is a promo the right length? */
export const promoFits = (seconds: number) => Math.abs(seconds - PROMO_SECONDS) <= PROMO_SLACK;

/**
 * What a course breaks of the academy rules, in words a teacher can act on;
 * empty when it keeps them all.
 */
export function courseIssues(course: Pick<Course, "weeks" | "lessons" | "seats" | "enrolled" | "teacher" | "syllabus" | "calendar" | "promo">, dept: Pick<Department, "kind" | "teachers">): string[] {
  const out: string[] = [];
  if (course.weeks !== CLASS_WEEKS || course.lessons.length !== CLASS_WEEKS) out.push(`${bnDigits(CLASS_WEEKS)} সপ্তাহে ${bnDigits(CLASS_WEEKS)}টি বিষয় — ${bnDigits(COURSE_DAYS)} দিনে কোর্স শেষ`);
  if (course.seats > BATCH_MAX[dept.kind]) out.push(`এক ব্যাচে সর্বোচ্চ ${bnDigits(BATCH_MAX[dept.kind])} জন`);
  if (course.enrolled > course.seats) out.push("আসনের চেয়ে বেশি ভর্তি");
  if (!course.syllabus?.title) out.push("সিলেবাস লাগবে");
  if (!course.calendar?.title) out.push("কাজের ক্যালেন্ডার লাগবে");
  if (!course.promo || !promoFits(course.promo.seconds)) out.push("আড়াই মিনিটের প্রোমো ভিডিও লাগবে");
  if (!dept.teachers.includes(course.teacher)) out.push("প্রধান শিক্ষক এই একাডেমির নন");
  if (dept.kind === "team") {
    if (course.lessons.some((l) => !l.by || !dept.teachers.includes(l.by))) out.push("প্রতিটা বিষয়ে দলের একজন শিক্ষক লাগবে");
    if (new Set(course.lessons.map((l) => l.by)).size < 2) out.push("দলীয় একাডেমিতে আলাদা বিষয় আলাদা শিক্ষক পড়ান");
  } else if (course.lessons.some((l) => l.by && l.by !== course.teacher)) out.push("একক একাডেমিতে সব বিষয় একজনই পড়ান");
  return out;
}

/**
 * Departments gathered into their academies, in order of first appearance:
 * each academy's departments, every member who teaches in them, and the
 * earliest founding day.
 */
export function academiesFrom<D extends Pick<Department, "id" | "academy" | "kind" | "teachers" | "founded">>(depts: D[]): (Omit<Academy, "departments"> & { departments: D[] })[] {
  const by = new Map<string, Omit<Academy, "departments"> & { departments: D[] }>();
  for (const d of depts) {
    const a = by.get(d.academy.id);
    if (!a) {
      by.set(d.academy.id, { ...d.academy, kind: d.kind, departments: [d], teachers: [...d.teachers], founded: d.founded });
      continue;
    }
    a.departments.push(d);
    for (const h of d.teachers) if (!a.teachers.includes(h)) a.teachers.push(h);
    if (d.founded < a.founded) a.founded = d.founded;
  }
  return [...by.values()];
}

/** What an academy breaks: its departments must be of one kind, and a solo academy has one teacher in all of them. */
export function academyIssues(a: { kind: DeptKind; teachers: string[]; departments: Pick<Department, "kind">[] }): string[] {
  const out: string[] = [];
  if (a.departments.some((d) => d.kind !== a.kind)) out.push("একাডেমির সব বিভাগ একই ধরনের — একক বা দলীয়");
  if (a.kind === "solo" && a.teachers.length !== 1) out.push("একক একাডেমির সব বিভাগে একজনই শিক্ষক");
  return out;
}

/** What a department breaks of the academy rules; empty when it keeps them. */
export function deptIssues(dept: Pick<Department, "name" | "kind" | "teachers"> & { academy?: Pick<AcademyInfo, "name"> }, courseCount: number): string[] {
  const out: string[] = [];
  if (!dept.academy?.name.trim()) out.push("একাডেমির নাম লাগবে");
  if (dept.name.length > DEPT_NAME_MAX) out.push("বিভাগের নাম ছোট রাখুন");
  if (dept.kind === "solo" && dept.teachers.length !== 1) out.push("একক একাডেমিতে একজনই শিক্ষক");
  if (dept.kind === "team" && dept.teachers.length < 2) out.push("দলীয় একাডেমিতে অন্তত দুজন");
  if (courseCount !== DEPT_COURSES) out.push(`বিভাগে ঠিক ${bnDigits(DEPT_COURSES)}টি দক্ষতার কোর্স`);
  return out;
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
  /** What the learner confirmed at checkout. */
  joining?: JoinDetails;
  /** The batch — and so the classroom — they joined; before batches, the course's first. */
  batch?: string;
}

/** The joining form a learner confirms at checkout, kept with the enrolment for the teacher. */
export interface JoinDetails {
  name: string;
  phone: string;
  district: string;
  /** Why they are joining, in a line; optional. */
  goal?: string;
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
  /** For a new department: the academy that opens it, and a line about it. */
  academy: string;
  about: string;
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
  /** Class videos the teacher put up, newest first. */
  videos: ClassVideo[];
  /** The viewer's like or dislike, by video or comment id. */
  votes: Record<string, Vote>;
  /** The viewer's stars for a class, by video id. */
  ratings: Record<string, number>;
  /** What the viewer wrote under classes, oldest first. */
  comments: VideoComment[];
  /** Teachers the viewer follows, by handle, and how much to hear from each. */
  follows: Record<string, Bell>;
  /** The team photo and logo an academy put up, by department id (small data URLs). */
  academyMedia: Record<string, AcademyMedia>;
  /** Course codes waiting at checkout, in the order they were added. */
  cart: string[];
  /** Classrooms (batches) the viewer's academy opened on this device. */
  batches: Batch[];
  /** What the viewer wrote in batch chats, by batch id, oldest first. */
    roomChat: Record<string, RoomMessage[]>;
  /** The notice board of a batch, by batch id (the classroom's own notice rules). */
  boards?: Record<string, Notice[]>;
  /** Chat lines pinned for a batch, by batch id: message ids, newest first. */
    pins?: Record<string, string[]>;
  /** A batch's exams with the marks given, by batch id. */
    exams?: Record<string, BatchExam[]>;
  /** Files the batch shared for study, by batch id, newest first. */
    shared?: Record<string, StudyFile[]>;
  /** What the viewer planned on a batch's mind map, by batch id. */
    plans?: Record<string, PlanNode[]>;
  /** The quiz questions the teacher wrote, by batch id. */
  quizzes?: Record<string, QuizQuestion[]>;
  /** What the viewer answered on a batch's quiz, and the days played. */
  quizPlay?: Record<string, QuizPlay>;



  /** The learner the teacher named batch leader, by batch id: a roster id, or "me". */
  leaders?: Record<string, string>;


  /** The academy finder's three answers: the dream, what one likes, where one's talent lies. */
  finder?: Partial<{ goal: Goal; like: Like; talent: Talent }>;
  /** The goal the learner wrote for themselves on an academy's page, by academy id. */
  dreams?: Record<string, { line: string; course?: string; at: string }>;
}

export interface AcademyMedia {
  photo?: string;
  logo?: string;
}

export const emptyAcademy: AcademyState = { admissions: {}, enrolled: {}, application: null, complaints: [], workshops: {}, drafts: [], materials: {}, attendance: {}, marks: {}, videos: [], votes: {}, ratings: {}, comments: [], follows: {}, academyMedia: {}, cart: [], batches: [], roomChat: {} };

/**
 * Saved state from any earlier version, made whole: missing parts start
 * empty, and the old single `admission` becomes that department's entry.
 */
export function normalizeAcademy(raw: unknown): AcademyState {
  const saved = (raw && typeof raw === "object" ? raw : {}) as Partial<AcademyState> & { admission?: Admission | null };
  const { admission, ...rest } = saved;
  const admissions = { ...rest.admissions };
  if (admission && !admissions[admission.dept]) admissions[admission.dept] = admission;
  // The old third kind, a working shop, is now a solo or team academy by how many applied.
  const old = rest.application as (Omit<TeachApplication, "kind"> & { kind: string }) | null | undefined;
  const application: TeachApplication | null = old
    ? { ...old, kind: old.kind === "team" || (old.kind === "workshop" && old.team?.length) ? "team" : "solo", academy: old.academy ?? "", about: old.about ?? "" }
    : null;
  // Courses built before the academy rules lack the papers; they show as missing, not crash.
  const drafts = (rest.drafts ?? []).map((d) => ({ ...d, starts: d.starts ?? "", syllabus: d.syllabus ?? { kind: "pdf" as const, title: "", size: "" }, calendar: d.calendar ?? { kind: "sheet" as const, title: "", size: "" }, promo: d.promo ?? { seconds: 0 } }));
  return { ...emptyAcademy, ...rest, admissions, application, drafts };
}

/**
 * The checkout's one step: every course enrolled with the learner's joining
 * details, its department joined on the way if it is new (at the course's
 * level, no test), and those courses taken out of the cart. A department
 * joined earlier keeps its admission as it was.
 */
export function checkoutEnrol(state: AcademyState, courses: (Pick<Course, "id" | "dept" | "level"> & { batch?: string })[], joining: JoinDetails, at: string): AcademyState {
  const ids = courses.map((c) => c.id);
  const admissions = { ...state.admissions };
  for (const c of courses) {
    admissions[c.dept] ??= { dept: c.dept, goal: joining.goal ?? "", years: 0, proof: "", score: 0, level: c.level, fastTrack: false, at };
  }
  return {
    ...state,
    admissions,
    enrolled: { ...state.enrolled, ...Object.fromEntries(courses.map((c) => [c.id, { at, attended: [], homework: {}, joining, batch: c.batch ?? c.id }])) },
    cart: (state.cart ?? []).filter((x) => !ids.includes(x)),
  };
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

/* ── Class videos ──────────────────────────────────────────────────── */

/** Free classes are for everyone; course videos for those enrolled. */
export type VideoAccess = "free" | "paid";

export interface ClassVideo {
  id: string;
  /** Course code. */
  course: string;
  /** Teacher's handle. */
  teacher: string;
  title: string;
  /** The course week the class belongs to. */
  week: number;
  /** Length in seconds. */
  seconds: number;
  access: VideoAccess;
  /** A clip under a minute, for the shorts shelf. */
  short?: boolean;
  at: string;
  views: number;
  /** Where it plays: the YouTube or Drive link the teacher gave. */
  href?: string;
  /** The teacher's own words under the video. */
  about?: string;
}

/** The academy week runs Saturday to Friday, Dhaka time; this is its Saturday, as YYYY-MM-DD. */
export function weekOf(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 6 * 3_600_000);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7));
  return d.toISOString().slice(0, 10);
}

/**
 * Has the teacher put up this week's free class — the one every teacher
 * owes, for free education for all? A short doesn't count. Anything dated
 * after `now` was made on this device, whose clock runs ahead of the
 * demo's, so it counts as this week.
 */
export function freeClassDone(videos: ClassVideo[], teacher: string, now: string): boolean {
  const week = weekOf(now);
  return videos.some((v) => v.teacher === teacher && v.access === "free" && !v.short && (weekOf(v.at) === week || v.at > now));
}

/** May this viewer play it: a free class, a course they joined, or their own. */
export function canWatch(video: ClassVideo, enrolled: Record<string, unknown>, viewer?: string): boolean {
  return video.access === "free" || video.teacher === viewer || video.course in enrolled;
}

/** A YouTube link as a privacy-friendly embed address; any other link is not embedded. */
/** A class video's own page. */
export const watchHref = (v: Pick<ClassVideo, "id">) => `/media/academy/videos/${encodeURIComponent(v.id)}`;

export function youtubeEmbed(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^(www|m)\./, "");
  const id =
    host === "youtu.be"
      ? url.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? (url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1])
        : undefined;
  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

/** A video's length as its thumbnail shows it: "৪১:২০", "১:০২:০৫" (in Latin digits; the page converts). */
export function durationText(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h ? `${h}:${String(m).padStart(2, "0")}` : m}:${String(s).padStart(2, "0")}`;
}

/* ── Under a class: likes, stars and comments ─────────────────────── */

export type Vote = "up" | "down";

export interface VideoComment {
  id: string;
  video: string;
  /** The writer's handle, when they have a profile here (teachers, the viewer). */
  handle?: string;
  /** Otherwise the learner's name. */
  name?: string;
  text: string;
  at: string;
  likes: number;
  /** The comment this answers. */
  parent?: string;
  /** Pinned by the teacher: shown first. */
  pinned?: boolean;
}

export type CommentSort = "top" | "new";

export interface Thread {
  comment: VideoComment;
  replies: VideoComment[];
}

/** A class's conversation: the teacher's pinned note first, then most liked (or newest); replies oldest first. */
export function threadsOf(all: VideoComment[], video: string, sort: CommentSort): Thread[] {
  const here = all.filter((c) => c.video === video);
  return here
    .filter((c) => !c.parent)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (sort === "top" ? b.likes - a.likes : 0) || b.at.localeCompare(a.at))
    .map((comment) => ({ comment, replies: here.filter((r) => r.parent === comment.id).sort((a, b) => a.at.localeCompare(b.at)) }));
}

export interface RatingSummary {
  avg: number;
  count: number;
  /** How many gave 1, 2, 3, 4 and 5 stars. */
  stars: number[];
}

/**
 * How many gave each star, for a class rated `avg` by `count` people — a
 * seeded class keeps only those two. Whole people, adding up to `count`.
 */
export function starSpread(avg: number, count: number): number[] {
  const weights = [1, 2, 3, 4, 5].map((s) => Math.exp(-((s - avg) ** 2) / 0.9));
  const total = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / total) * count);
  const out = raw.map(Math.floor);
  let left = count - out.reduce((a, b) => a + b, 0);
  for (const [, i] of raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0])) {
    if (left-- <= 0) break;
    out[i]++;
  }
  return out;
}

/** A class's rating with the viewer's own stars counted in. */
export function ratingWith(seed: { avg: number; count: number }, mine?: number): RatingSummary {
  const stars = starSpread(seed.avg, seed.count);
  if (!mine) return { ...seed, stars };
  stars[mine - 1]++;
  return { avg: Math.round(((seed.avg * seed.count + mine) / (seed.count + 1)) * 10) / 10, count: seed.count + 1, stars };
}

/* ── Teacher channels ──────────────────────────────────────────────── */

/** How much a follower hears: every new class, only the weekly free class, or nothing. */
export type Bell = "all" | "free" | "none";
export const BELLS: Record<Bell, string> = { all: "সব ক্লাস", free: "শুধু বিনামূল্যের ক্লাস", none: "কিছু না" };

export type VideoSort = "latest" | "popular" | "oldest";
export const VIDEO_SORTS: Record<VideoSort, string> = { latest: "সর্বশেষ", popular: "জনপ্রিয়", oldest: "পুরোনো" };

/** A channel's videos in the chosen order; ties fall back to newest first. */
export function sortVideos(videos: ClassVideo[], by: VideoSort): ClassVideo[] {
  const newest = (a: ClassVideo, b: ClassVideo) => b.at.localeCompare(a.at);
  const order = by === "popular" ? (a: ClassVideo, b: ClassVideo) => b.views - a.views || newest(a, b) : by === "oldest" ? (a: ClassVideo, b: ClassVideo) => -newest(a, b) : newest;
  return [...videos].sort(order);
}
