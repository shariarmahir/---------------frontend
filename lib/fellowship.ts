/**
 * R&D Fellowship applications: the form's rules, the saved shape, and how
 * a saved application is read back. Pure, tested in fellowship.test.ts.
 * Until Kandari-Lab has a server, an application is kept with the
 * applicant's Kandari Profile in their browser (components/team/apply-form.tsx).
 */
import { isEmail, normalizePhone } from "./auth/validate.ts";

export const LEVELS = {
  undergrad: "Undergraduate",
  graduate: "Recent graduate",
  masters: "Master's or PhD",
  other: "Other",
} as const;

export type ApplicantLevel = keyof typeof LEVELS;

export const LIMITS = { name: [3, 80], institution: [3, 120], why: [80, 800], link: 200 } as const;

export interface ApplicationDraft {
  name: string;
  contact: string;
  institution: string;
  level: ApplicantLevel | "";
  track: string;
  why: string;
  link: string;
  commit: boolean;
  consent: boolean;
}

export interface Application extends Omit<ApplicationDraft, "level"> {
  level: ApplicantLevel;
  /** "FEL-2026-7K3Q": quoted in any message about the application. */
  ref: string;
  at: string;
}

export type DraftProblems = Partial<Record<keyof ApplicationDraft, string>>;

/** A link the applicant can show: https only, a real host, no spaces. */
export function isWorkLink(s: string): boolean {
  if (!s || s.length > LIMITS.link || /\s/.test(s)) return false;
  try {
    const u = new URL(s);
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Everything the application still needs, in plain English; empty when it can be sent. */
export function applicationProblems(d: ApplicationDraft, tracks: readonly string[]): DraftProblems {
  const p: DraftProblems = {};
  const len = (s: string) => s.trim().length;
  if (len(d.name) < LIMITS.name[0] || len(d.name) > LIMITS.name[1]) p.name = "Write your full name";
  if (!isEmail(d.contact.trim()) && !normalizePhone(d.contact)) p.contact = "Give an email address or a Bangladeshi mobile number";
  if (len(d.institution) < LIMITS.institution[0] || len(d.institution) > LIMITS.institution[1]) p.institution = "Name your university, college or workplace";
  if (!d.level) p.level = "Choose where you are in your studies";
  if (!tracks.includes(d.track)) p.track = "Choose a track";
  if (len(d.why) < LIMITS.why[0]) p.why = `Tell us a little more: at least ${LIMITS.why[0]} characters`;
  else if (len(d.why) > LIMITS.why[1]) p.why = `Keep it within ${LIMITS.why[1]} characters`;
  if (d.link.trim() && !isWorkLink(d.link.trim())) p.link = "Give a full https:// link, or leave it empty";
  if (!d.commit) p.commit = "The fellowship needs the full cycle";
  if (!d.consent) p.consent = "Confirm so we can contact you";
  return p;
}

/** A short reference from a random number in [0, 1): "FEL-2026-7K3Q". */
export function makeRef(year: number, rand: number): string {
  const code = Math.floor(rand * 36 ** 4).toString(36).toUpperCase().padStart(4, "0");
  return `FEL-${year}-${code}`;
}

/** The application to save, trimmed. */
export function buildApplication(d: ApplicationDraft, opts: { now: Date; rand: number }): Application {
  return {
    name: d.name.trim(),
    contact: d.contact.trim(),
    institution: d.institution.trim(),
    level: d.level as ApplicantLevel,
    track: d.track,
    why: d.why.trim(),
    link: d.link.trim(),
    commit: true,
    consent: true,
    ref: makeRef(opts.now.getFullYear(), opts.rand),
    at: opts.now.toISOString(),
  };
}

const isStr = (x: unknown): x is string => typeof x === "string";

/** A saved application read back from browser storage: only a complete, well-formed one counts. */
export function parseApplication(raw: unknown, tracks: readonly string[]): Application | null {
  if (!raw || typeof raw !== "object") return null;
  const x = raw as Partial<Application>;
  const fields = [x.name, x.contact, x.institution, x.track, x.why, x.ref, x.at];
  if (!fields.every(isStr) || !isStr(x.level) || !Object.hasOwn(LEVELS, x.level) || !tracks.includes(x.track!)) return null;
  if (!/^FEL-\d{4}-[0-9A-Z]{4}$/.test(x.ref!) || Number.isNaN(Date.parse(x.at!))) return null;
  return {
    name: x.name!,
    contact: x.contact!,
    institution: x.institution!,
    level: x.level as ApplicantLevel,
    track: x.track!,
    why: x.why!,
    link: isStr(x.link) && isWorkLink(x.link) ? x.link : "",
    commit: true,
    consent: true,
    ref: x.ref!,
    at: x.at!,
  };
}
