/**
 * What a classroom or lab room solved or found, shared out: to the feed for
 * everyone, and — when it is research — to the গবেষণা page as well.
 * Pure rules here, tested in showcase.test.ts.
 */

import type { CategoryId, PostTopic } from "@/data/media/types";

export type ShareKind = "solution" | "innovation" | "research";

export const SHARE_KINDS: Record<ShareKind, { bn: string; hint: string; topic: PostTopic; category: CategoryId }> = {
  solution: { bn: "সমাধান", hint: "পড়ার কোনো কঠিন প্রশ্ন বা সমস্যার সমাধান", topic: "education", category: "teaching" },
  innovation: { bn: "নতুন উদ্ভাবন", hint: "দল মিলে বানানো নতুন কিছু, নতুন উপায়", topic: "team", category: "engineering" },
  research: { bn: "গবেষণা", hint: "প্রশ্ন, পদ্ধতি, ফলাফল — যা অন্যরা যাচাই করতে পারে", topic: "research", category: "research" },
};

export type ResearchStage = "idea" | "running" | "done";

export const STAGES: Record<ResearchStage, string> = { idea: "প্রস্তাব", running: "চলমান", done: "সম্পন্ন" };

/** The room a share came from: a classroom, a lab, or a team's room. */
export interface RoomRef {
  kind: "classroom" | "lab" | "team";
  id: string;
  name: string;
}

export const roomHref = (r: RoomRef) =>
  r.kind === "lab" ? `/media/classroom/lab/${r.id}` : r.kind === "team" ? `/media/together/team/${r.id}` : `/media/classroom/${r.id}`;

/** What to call the room in a caption or a tag. */
export const roomKindBn = (r: Pick<RoomRef, "kind">) => (r.kind === "lab" ? "ল্যাব" : r.kind === "team" ? "টিম" : "ক্লাসরুম");

export interface ResearchEntry {
  id: string;
  title: string;
  /** The question or problem. */
  question: string;
  /** What was found or built. */
  finding: string;
  /** How, in a few lines. */
  method?: string;
  stage: ResearchStage;
  /** Names of the people who did it. */
  team: string[];
  from: RoomRef;
  tags: string[];
  /** A photo as a data URL, kept only when the work did not also go to the feed. */
  image?: string;
  /** The feed post, when it was shared there too. */
  postId?: string;
  at: string;
}

/** A room's own record of what it shared. */
export interface SharedRef {
  id: string;
  kind: ShareKind;
  title: string;
  team: string[];
  at: string;
  postId?: string;
  researchId?: string;
}

export interface ShareInput {
  kind: ShareKind;
  title: string;
  question: string;
  finding: string;
  method?: string;
  team: string[];
  from: RoomRef;
}

const lead: Record<ShareKind, string> = { solution: "সমস্যা", innovation: "যে সমস্যা থেকে শুরু", research: "গবেষণার প্রশ্ন" };
const result: Record<ShareKind, string> = { solution: "সমাধান", innovation: "যা বানালাম", research: "ফলাফল" };

/** The feed caption: title, the question, the answer, then who and from where. */
export function shareCaption(s: ShareInput): string {
  const parts = [s.title.trim()];
  if (s.question.trim()) parts.push(`${lead[s.kind]}: ${s.question.trim()}`);
  if (s.method?.trim()) parts.push(`পদ্ধতি: ${s.method.trim()}`);
  parts.push(`${result[s.kind]}: ${s.finding.trim()}`);
  const team = s.team.length > 0 ? `দল: ${s.team.join(", ")} · ` : "";
  parts.push(`${team}${roomKindBn(s.from)}: ${s.from.name}`);
  return parts.join("\n\n");
}

/** A few hashtags to find it by: the kind, the room type, and the title's longer words. */
export function shareTags(s: Pick<ShareInput, "kind" | "title" | "from">): string[] {
  const words = s.title
    .split(/[\s,.;:!?()\-–—।]+/)
    .filter((w) => w.length >= 4)
    .slice(0, 3);
  return [...new Set([SHARE_KINDS[s.kind].bn.replace(/\s+/g, "_"), roomKindBn(s.from), ...words])].map((t) => `#${t}`);
}

/** A share needs a real title and an answer, and somewhere to go. */
export function shareProblems(s: { title: string; finding: string; toFeed: boolean; toResearch: boolean }): { title?: string; finding?: string; where?: string } {
  return {
    title: s.title.trim().length < 5 ? "অন্তত ৫ অক্ষরের একটি শিরোনাম দিন" : undefined,
    finding: s.finding.trim().length < 10 ? "কী পেলেন বা বানালেন, অন্তত এক লাইনে লিখুন" : undefined,
    where: !s.toFeed && !s.toResearch ? "ফিড বা গবেষণা পাতা — অন্তত একটি বেছে নিন" : undefined,
  };
}
