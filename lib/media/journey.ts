import type { DeptFit, Enrollment, Goal, Like, Talent } from "./academy.ts";

/**
 * The academy as the university life every Bangladeshi student knows:
 * choose (find the academy, get to know it, its department, the course),
 * admission, then study (routine, class, exam, graduation). Every academy
 * page sits on one of these nine steps.
 */
export type StepId = "find" | "academy" | "dept" | "course" | "admit" | "routine" | "class" | "exam" | "graduate";
export type Phase = "choose" | "admit" | "study";

export interface Step {
  id: StepId;
  n: number;
  phase: Phase;
  label: string;
  /** One line under the label: what happens on this step. */
  hint: string;
}

export const STEPS: Step[] = [
  { id: "find", n: 1, phase: "choose", label: "একাডেমি খুঁজুন", hint: "স্বপ্ন মিলিয়ে নিজের একাডেমি" },
  { id: "academy", n: 2, phase: "choose", label: "একাডেমি চিনুন", hint: "শিক্ষক, বিভাগ, ভবিষ্যৎ" },
  { id: "dept", n: 3, phase: "choose", label: "বিভাগ বাছুন", hint: "কোন দক্ষতার পথে যাবেন" },
  { id: "course", n: 4, phase: "choose", label: "কোর্স বাছুন", hint: "নিজের স্তরের কোর্স" },
  { id: "admit", n: 5, phase: "admit", label: "ভর্তি", hint: "এক ফর্মে রেজিস্ট্রেশন" },
  { id: "routine", n: 6, phase: "study", label: "রুটিন", hint: "কবে, কখন ক্লাস" },
  { id: "class", n: 7, phase: "study", label: "ক্লাস", hint: "লাইভ ক্লাস ও ক্লাসরুম" },
  { id: "exam", n: 8, phase: "study", label: "পরীক্ষা", hint: "প্রজেক্ট আর প্যানেল" },
  { id: "graduate", n: 9, phase: "study", label: "সমাবর্তন", hint: "সনদ আর প্রকাশ্য বোর্ড" },
];

export const PHASES: Record<Phase, string> = { choose: "বাছাই", admit: "ভর্তি", study: "পড়াশোনা" };

/** Which step a page is, by its path; teaching and side pages are on none. */
export function stepOfPath(path: string): StepId | null {
  const p = path.replace(/\/+$/, "");
  if (p === "/media/academy") return "find";
  const rest = p.startsWith("/media/academy/") ? p.slice("/media/academy/".length) : null;
  if (rest === null) return null;
  const [head, second] = rest.split("/");
  switch (head) {
    case "a":
      return "academy";
    case "departments":
    case "dept":
      return "dept";
    case "courses":
    case "course":
      return "course";
    case "checkout":
      return "admit";
    case "routine":
      return "routine";
    case "classroom":
      return second === "open" || second === "new" ? null : "class";
    case "exam":
      return "exam";
    case "graduation":
      return "graduate";
    default:
      return null;
  }
}

/**
 * How far the learner has come, from their own enrolments: nothing yet is
 * still finding; enrolled is at the routine; a class attended is in class;
 * a project handed in or an interview booked is at the exam; a pass is
 * graduating.
 */
export function frontierOf(enrolments: Pick<Enrollment, "attended" | "project" | "interview">[], passed = false): StepId {
  if (passed) return "graduate";
  if (enrolments.length === 0) return "find";
  if (enrolments.some((e) => e.project || e.interview)) return "exam";
  if (enrolments.some((e) => e.attended.length > 0)) return "class";
  return "routine";
}

/** Every step before the frontier. */
export function doneSteps(frontier: StepId): Set<StepId> {
  const at = STEPS.findIndex((s) => s.id === frontier);
  return new Set(STEPS.slice(0, Math.max(0, at)).map((s) => s.id));
}

export type FinderAnswers = Partial<{ goal: Goal; like: Like; talent: Talent }>;

/** How well a department suits the finder's answers: the dream counts three, what one likes and one's talent two each. */
export function fitScore(fit: DeptFit | undefined, a: FinderAnswers): number {
  if (!fit) return 0;
  return (a.goal && fit.goals.includes(a.goal) ? 3 : 0) + (a.like && fit.likes.includes(a.like) ? 2 : 0) + (a.talent && fit.talents.includes(a.talent) ? 2 : 0);
}

export const GOALS: Record<Goal, string> = { job: "ভালো চাকরি", business: "নিজের ব্যবসা", home: "ঘরে বসে আয়", joy: "শখ ও আনন্দ" };
export const LIKES: Record<Like, string> = { machines: "যন্ত্রপাতি", computers: "কম্পিউটার", art: "রং আর সুর", food: "রান্না", people: "মানুষের সেবা", body: "খেলাধুলা", numbers: "হিসাব-অঙ্ক" };
export const TALENTS: Record<Talent, string> = { hands: "হাতের কাজ", mind: "মাথার কাজ", art: "শিল্পীমন", body: "শরীর ও মাঠ" };
