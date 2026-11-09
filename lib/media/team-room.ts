/**
 * A team's own room, the way a classroom has one: its journey and stories,
 * its mission, its goals — and the share that takes any of them to the feed.
 * Pure rules here, tested in team-room.test.ts.
 */

import type { CategoryId, TeamKind } from "@/data/media/types";

/** What a team can tell the feed. */
export type StoryKind = "journey" | "story" | "mission" | "goal";

export const STORY_KINDS: Record<StoryKind, { bn: string; hint: string; tag: string }> = {
  journey: { bn: "যাত্রা", hint: "একটা মাইলফলক — কোথা থেকে শুরু, কী পার হলেন", tag: "দলের_যাত্রা" },
  story: { bn: "গল্প", hint: "দলের একটা মুহূর্ত — শেখা, হার, জয়, মানুষ", tag: "দলের_গল্প" },
  mission: { bn: "মিশন", hint: "কেন এই দল — যে বদল আনতে চান", tag: "মিশন" },
  goal: { bn: "লক্ষ্য", hint: "মাপা যায় এমন লক্ষ্য, শেষ তারিখসহ", tag: "লক্ষ্য" },
};

/** Timeline entries: journey milestones and stories. */
export interface TeamStory {
  id: string;
  kind: "journey" | "story";
  title: string;
  body: string;
  /** Who wrote it: a handle, and the name to show. */
  by: string;
  byName: string;
  at: string;
  /** A photo: a path for samples, a data URL for the viewer's own. */
  photo?: string;
  /** The feed post, once shared. */
  postId?: string;
}

export interface TeamGoal {
  id: string;
  title: string;
  /** YYYY-MM-DD, optional. */
  due?: string;
  done: boolean;
  /** When it was met. */
  doneAt?: string;
  postId?: string;
}

export interface TeamRoom {
  mission: string;
  /** Feed post of the mission, once shared. */
  missionPostId?: string;
  goals: TeamGoal[];
  stories: TeamStory[];
}

export const EMPTY_ROOM: TeamRoom = Object.freeze({ mission: "", goals: [], stories: [] }) as TeamRoom;

export const TITLE_MAX = 120;
export const BODY_MAX = 2000;
export const MISSION_MAX = 400;
export const MAX_GOALS = 12;
export const MAX_STORIES = 100;

/** Lead or member writes; everyone else reads the room. */
export function canEditRoom(team: { lead: string; members: string[] }, handle: string | undefined, status?: "requested" | "member"): boolean {
  if (!handle) return false;
  return team.lead === handle || team.members.includes(handle) || status === "member";
}

/** A story needs a real title and a few words; nothing runs past the caps. */
export function storyProblems(s: { title: string; body: string }): { title?: string; body?: string } {
  const title = s.title.trim();
  const body = s.body.trim();
  return {
    title: title.length < 4 ? "অন্তত ৪ অক্ষরের একটি শিরোনাম দিন" : title.length > TITLE_MAX ? "শিরোনাম একটু ছোট করুন" : undefined,
    body: body.length < 10 ? "কী ঘটল, অন্তত এক লাইনে লিখুন" : body.length > BODY_MAX ? "লেখাটা বেশি বড় — একটু ছোট করুন" : undefined,
  };
}

export function missionProblem(text: string): string | undefined {
  const t = text.trim();
  if (t.length < 10) return "মিশনটা অন্তত এক লাইনে লিখুন";
  if (t.length > MISSION_MAX) return "মিশন ছোট রাখুন — এক-দুই বাক্যে";
  return undefined;
}

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar day, or undefined. */
export function validDay(raw: string | undefined): string | undefined {
  const m = raw?.trim().match(DAY);
  if (!m) return undefined;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? m[0] : undefined;
}

/** Whole days from `today` to `due` (both YYYY-MM-DD); negative when past. */
export function daysTo(due: string, today: string): number {
  return Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export type GoalState = "done" | "late" | "soon" | "open";

/** Met, past its day, due within a week, or simply open. */
export function goalState(g: TeamGoal, today: string): GoalState {
  if (g.done) return "done";
  if (!g.due) return "open";
  const left = daysTo(g.due, today);
  return left < 0 ? "late" : left <= 7 ? "soon" : "open";
}

/** Open goals first, nearest day first (no day last); met goals at the end, newest first. */
export function sortGoals(goals: TeamGoal[]): TeamGoal[] {
  return [...goals].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done) return (b.doneAt ?? "").localeCompare(a.doneAt ?? "");
    if (!a.due !== !b.due) return a.due ? -1 : 1;
    return (a.due ?? "").localeCompare(b.due ?? "");
  });
}

export function goalProgress(goals: TeamGoal[]): { done: number; total: number; pct: number } {
  const done = goals.filter((g) => g.done).length;
  return { done, total: goals.length, pct: goals.length === 0 ? 0 : Math.round((done / goals.length) * 100) };
}

/** Newest first. */
export function timeline(stories: TeamStory[]): TeamStory[] {
  return [...stories].sort((a, b) => b.at.localeCompare(a.at));
}

/** What the feed shows: the kind and title, the words, then the team. */
export function storyCaption(s: { kind: StoryKind; title: string; body: string }, team: string): string {
  const head = `${STORY_KINDS[s.kind].bn} · ${s.title.trim()}`;
  const body = s.body.trim();
  return [head, body, `টিম: ${team}`].filter(Boolean).join("\n\n");
}

/** The team's name as one tag: whole words only, up to about 32 letters. */
export function nameTag(team: string): string {
  let tag = "";
  for (const w of team.replace(/[—–\-·,.]/g, " ").trim().split(/\s+/)) {
    const next = tag ? `${tag}_${w}` : w;
    if (tag && next.length > 32) break;
    tag = next;
  }
  return tag;
}

/** The kind, the team's name as one tag, and up to two longer words from the title. */
export function storyTags(kind: StoryKind, team: string, title: string): string[] {
  const words = title
    .split(/[\s,.;:!?()\-–—।]+/)
    .filter((w) => w.length >= 4)
    .slice(0, 2);
  const name = nameTag(team);
  return [...new Set([STORY_KINDS[kind].tag, name, ...words].filter(Boolean))].map((t) => `#${t}`);
}

/** Which feed category a team's posts file under. */
export const TEAM_CATEGORY: Record<TeamKind, CategoryId> = {
  family: "crafts",
  lab: "research",
  project: "tech",
  travel: "travel",
  sports: "sports",
  esports: "sports",
};

/** Add a story at the top, keeping at most MAX_STORIES. */
export function addStory(room: TeamRoom, s: TeamStory): TeamRoom {
  return { ...room, stories: [s, ...room.stories].slice(0, MAX_STORIES) };
}

/** Flip a goal; meeting it stamps the day, reopening clears it. */
export function toggleGoal(room: TeamRoom, id: string, at: string): TeamRoom {
  return { ...room, goals: room.goals.map((g) => (g.id === id ? (g.done ? { ...g, done: false, doneAt: undefined } : { ...g, done: true, doneAt: at }) : g)) };
}
