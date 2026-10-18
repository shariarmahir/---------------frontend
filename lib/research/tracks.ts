/**
 * গবেষণাকোষের ধারা (research tracks): the collections the library is browsed
 * by, beside its nine subject fields. Each track is a rule over an
 * article's own data, so a new submission falls into the right ones by
 * itself. Pure; tested in tracks.test.ts.
 */
import { FIELDS, type Article, type FieldId } from "./core.ts";

export type TrackId = "bd-live" | "global" | "field-work" | "ongoing" | "students" | "innovation";

export interface Track {
  id: TrackId;
  bn: string;
  en: string;
  icon: string;
  /** One line on the tile and under the page title. */
  blurb: string;
  has: (a: Article) => boolean;
}

export const TRACKS: Track[] = [
  {
    id: "bd-live",
    bn: "রিয়েল-টাইম: দেশের সমস্যা",
    en: "Real-time Bangladesh problems",
    icon: "crisis_alert",
    blurb: "দেশের ৩২টি চলমান সমস্যার কোনটি নিয়ে কাজ হচ্ছে, কোনটি এখনো অপেক্ষায়।",
    has: (a) => (a.problems?.length ?? 0) > 0,
  },
  {
    id: "global",
    bn: "বৈশ্বিক গবেষণা",
    en: "Global research",
    icon: "public",
    blurb: "বিশ্বের প্রশ্ন আর তুলনামূলক কাজ — অন্য দেশের শিক্ষা বাংলাদেশের জন্য।",
    has: (a) => a.scope === "global",
  },
  {
    id: "field-work",
    bn: "মাঠ থেকে: জেলা ও গ্রাম",
    en: "From the field",
    icon: "location_on",
    blurb: "নির্দিষ্ট জেলা, চর বা গ্রামে গিয়ে করা জরিপ, পরীক্ষা আর পর্যবেক্ষণ।",
    has: (a) => Boolean(a.district),
  },
  {
    id: "ongoing",
    bn: "চলমান ও ওয়ার্কিং পেপার",
    en: "Ongoing & working papers",
    icon: "science",
    blurb: "যে কাজ এখনো চলছে বা পর্যালোচনার আগে মতামতের জন্য খোলা।",
    has: (a) => Boolean(a.ongoing || a.preprint),
  },
  {
    id: "students",
    bn: "শিক্ষার্থীদের গবেষণা",
    en: "Student research",
    icon: "school",
    blurb: "স্কুল-কলেজ আর স্নাতক পর্যায়ের প্রকল্প ও থিসিস।",
    has: (a) => a.level === "school" || a.level === "undergrad",
  },
  {
    id: "innovation",
    bn: "উদ্ভাবন ও প্রকল্প",
    en: "Innovation & projects",
    icon: "lightbulb",
    blurb: "যন্ত্র, সফটওয়্যার আর হাতে-কলমে বানানো সমাধান।",
    has: (a) => a.kind === "innovation" || a.kind === "project",
  },
];

export const TRACK_IDS = TRACKS.map((t) => t.id);

export const findTrack = (id: string) => TRACKS.find((t) => t.id === id);

export const isFieldId = (id: string): id is FieldId => Object.hasOwn(FIELDS, id);

const published = (list: Article[]) => list.filter((a) => a.status === "published");

/** A track's or a field's published articles, newest first. */
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
