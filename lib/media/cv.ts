import type { Person, SkillRating } from "@/data/media/types";

/** The three layouts a CV can be printed in. */
export type CvFormat = "ats" | "modern" | "europass";

export const CV_FORMATS: Record<CvFormat, { name: string; note: string }> = {
  ats: { name: "আন্তর্জাতিক · ATS", note: "এক কলাম, সাদামাটা — নিয়োগের সফটওয়্যার সহজে পড়ে" },
  modern: { name: "আধুনিক · দুই কলাম", note: "পাশে যোগাযোগ ও দক্ষতা, মাঝে কাজ ও শিক্ষা" },
  europass: { name: "ইউরোপাস ধাঁচ", note: "ইউরোপের মানক বিন্যাস — বিদেশে আবেদনের জন্য" },
};

/** The layout named in a link's `?f=`, ATS when it names none. */
export const readFormat = (v?: string): CvFormat => (v === "modern" || v === "europass" ? v : "ats");

/** A line of experience or education the person wrote. */
export interface CvEntry {
  id: string;
  title: string;
  place: string;
  period: string;
  note: string;
}

/** A résumé file the person uploaded, kept on this device as a small data URL. */
export interface ResumeFile {
  name: string;
  type: string;
  size: number;
  href: string;
  at: string;
}

/** What the CV needs beyond the profile: contact, extra history, and the uploaded résumé. */
export interface CvDetails {
  phone: string;
  email: string;
  summary: string;
  education: CvEntry[];
  experience: CvEntry[];
  languages: string;
  resume: ResumeFile | null;
}

export const emptyCv: CvDetails = { phone: "", email: "", summary: "", education: [], experience: [], languages: "", resume: null };

/** A course the person has finished at the academy. */
export interface DoneCourse {
  id: string;
  title: string;
  dept: string;
}

export type CvLine = Omit<CvEntry, "id">;

/** The CV, ready to lay out: every format draws the same data. */
export interface CvData {
  name: string;
  headline: string;
  contact: string[];
  summary: string;
  skills: string[];
  experience: CvLine[];
  education: CvLine[];
  training: CvLine[];
  languages: string[];
}

/** The résumé file's limit: it stays in the browser, so it stays small. */
export const RESUME_MAX_BYTES = 1_500_000;
export const RESUME_TYPES = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * A skill each finished course adds, named by the course, after the skills
 * the person already claimed. Nothing is listed twice.
 */
export function skillNames(claimed: Pick<SkillRating, "skill">[], done: DoneCourse[]): string[] {
  return [...new Set([...claimed.map((s) => s.skill), ...done.map((c) => c.title)])];
}

const kept = (e: CvEntry): CvLine => ({ title: e.title, place: e.place, period: e.period, note: e.note });

export function buildCv(person: Person, d: CvDetails, done: DoneCourse[], where: string): CvData {
  return {
    name: person.nameBn,
    headline: person.headline,
    contact: [d.phone, d.email, `${person.area}, ${person.district}`, where].filter(Boolean),
    summary: d.summary.trim() || person.bio,
    skills: skillNames(person.skills, done),
    experience: [...d.experience.map(kept), ...person.workHistory.map((w) => ({ title: w.title, place: w.client, period: w.date.slice(0, 4), note: w.review }))],
    education: d.education.map(kept),
    training: done.map((c) => ({ title: c.title, place: "কাণ্ডারী তৈরি একাডেমি", period: "", note: c.dept })),
    languages: d.languages
      .split(/[,\n،]/)
      .map((l) => l.trim())
      .filter(Boolean),
  };
}
