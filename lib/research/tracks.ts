/**
 * Collections: the rule-based shelves Genius is browsed by,
 * beside its ten subjects. Each collection is a rule over an article's
 * own data, so a new submission lands in the right ones by itself. Pure;
 * tested in tracks.test.ts.
 */
import { FIELDS, type Article, type FieldId } from "./core.ts";

export type TrackId = "bd-solutions" | "bd-live" | "global" | "culture" | "technology" | "field-work" | "ongoing" | "students" | "innovation";

export interface Track {
  id: TrackId;
  title: string;
  icon: string;
  /** One line on the card and under the page title. */
  blurb: string;
  has: (a: Article) => boolean;
}

export const TRACKS: Track[] = [
  {
    id: "bd-solutions",
    title: "Bangladesh Real Issues & Solutions",
    icon: "emoji_objects",
    blurb: "Real problems in Bangladesh traced to their causes and answered with a costed, testable plan.",
    has: (a) => a.field === "solutions",
  },
  {
    id: "bd-live",
    title: "Real-Time Bangladesh Problems",
    icon: "crisis_alert",
    blurb: "Research tied to the 32 live problems in our national dossier, and the problems still waiting for a study.",
    has: (a) => (a.problems?.length ?? 0) > 0,
  },
  {
    id: "global",
    title: "Global Research",
    icon: "public",
    blurb: "World questions and comparative work: what other countries' evidence teaches Bangladesh.",
    has: (a) => a.scope === "global",
  },
  {
    id: "culture",
    title: "Culture & Society",
    icon: "diversity_3",
    blurb: "How people in Bangladesh live, learn, earn and cope: society, education, culture and the economy.",
    has: (a) => a.field === "society" || a.field === "education" || a.field === "economy",
  },
  {
    id: "technology",
    title: "Technology & Engineering",
    icon: "memory",
    blurb: "Sensors, software, AI and hardware built for Bangladeshi conditions and budgets.",
    has: (a) => a.field === "engineering" || a.field === "computing" || a.field === "science",
  },
  {
    id: "field-work",
    title: "From the Field",
    icon: "location_on",
    blurb: "Surveys, trials and observation carried out in a named district, char or village.",
    has: (a) => Boolean(a.district),
  },
  {
    id: "ongoing",
    title: "Ongoing Research & Working Papers",
    icon: "science",
    blurb: "Work still under way, or open for comment before peer review.",
    has: (a) => Boolean(a.ongoing || a.preprint),
  },
  {
    id: "students",
    title: "Student Research",
    icon: "school",
    blurb: "Projects and theses from school, college and undergraduate researchers.",
    has: (a) => a.level === "school" || a.level === "undergrad",
  },
  {
    id: "innovation",
    title: "Innovations, Projects & Ideas",
    icon: "lightbulb",
    blurb: "Devices, software and hands-on solutions, with what worked and what did not, and ideas still looking for a partner.",
    has: (a) => a.kind === "innovation" || a.kind === "project" || a.kind === "idea",
  },
];

export const TRACK_IDS = TRACKS.map((t) => t.id);

export const findTrack = (id: string) => TRACKS.find((t) => t.id === id);

export const isFieldId = (id: string): id is FieldId => Object.hasOwn(FIELDS, id);

/** Browse by Subject: the ten subjects under five headings, as JSTOR groups its disciplines. */
export const SUBJECT_GROUPS: { title: string; fields: FieldId[] }[] = [
  { title: "Bangladesh in Focus", fields: ["solutions"] },
  { title: "Health & Life Sciences", fields: ["health", "agriculture", "science"] },
  { title: "Technology & Engineering", fields: ["engineering", "computing"] },
  { title: "Environment & Climate", fields: ["climate"] },
  { title: "Society, Culture & Economy", fields: ["society", "education", "economy"] },
];

const published = (list: Article[]) => list.filter((a) => a.status === "published");

/** A collection's or a subject's published articles, newest first. */
export function inTopic(list: Article[], id: string): Article[] {
  const track = findTrack(id);
  const keep = track ? track.has : isFieldId(id) ? (a: Article) => a.field === id : () => false;
  return published(list)
    .filter(keep)
    .sort((x, y) => y.published.localeCompare(x.published));
}

/** For every dossier problem, the published articles that speak to it. */
export function problemCoverage(list: Article[], problems: number[]): { n: number; articles: Article[] }[] {
  const pub = published(list);
  return problems.map((n) => ({ n, articles: pub.filter((a) => a.problems?.includes(n)) }));
}

/** "BD-007" for problem 7. */
export const problemCode = (n: number) => `BD-${String(n).padStart(3, "0")}`;

/** The A–Z shelf letter of a title: its first Latin letter, "0–9" for a digit, "#" for anything else. */
export function shelfLetter(title: string): string {
  const c = title.trim().replace(/^(the|a|an)\s+/i, "").charAt(0).toUpperCase();
  if (/[A-Z]/.test(c)) return c;
  if (/[0-9]/.test(c)) return "0–9";
  return "#";
}
