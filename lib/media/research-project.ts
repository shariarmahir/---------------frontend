/**
 * A team's research from scratch: a short topic poll (three ideas, three
 * reactions), a calendar of milestones, tasks for each member, the slides,
 * papers and data, a guided write-up — then out to the গবেষণা page, the feed
 * and a printable paper. Pure rules, tested in research-project.test.ts.
 */

import type { NoteFile } from "./classroom.ts";
import type { RoomRef } from "./showcase.ts";

export type Vote = "agree" | "maybe" | "disagree";

export const VOTES: Record<Vote, { emoji: string; bn: string }> = {
  agree: { emoji: "👍", bn: "একমত" },
  maybe: { emoji: "🤔", bn: "ভেবে দেখি" },
  disagree: { emoji: "👎", bn: "একমত নই" },
};

export const MAX_IDEAS = 3;

export interface TopicIdea {
  id: string;
  title: string;
  /** Why it matters, one or two lines. */
  why: string;
  by: string;
  votes: Record<string, Vote>;
}

export interface Milestone {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  done?: boolean;
}

export type TaskStatus = "todo" | "doing" | "done";

export const TASK_STATUS: Record<TaskStatus, string> = { todo: "করতে হবে", doing: "চলছে", done: "শেষ" };

export interface ResearchTask {
  id: string;
  title: string;
  /** Member id. */
  who: string;
  due?: string;
  status: TaskStatus;
}

export type FileKind = "ppt" | "pdf" | "data" | "sheet" | "other";

export const FILE_KINDS: Record<FileKind, string> = { ppt: "স্লাইড", pdf: "পিডিএফ", data: "ডেটা", sheet: "গুগল শিট", other: "ফাইল" };

export interface ResearchFile {
  id: string;
  kind: FileKind;
  name: string;
  /** A Google Sheet (or other) link instead of a file. */
  url?: string;
  file?: NoteFile;
  by: string;
  at: string;
}

export interface WriteUp {
  question: string;
  background: string;
  method: string;
  result: string;
  conclusion: string;
}

/** The write-up's sections, with what to put in each. */
export const SECTIONS: { key: keyof WriteUp; bn: string; guide: string; min: number }[] = [
  { key: "question", bn: "গবেষণার প্রশ্ন", guide: "এক বাক্যে: ঠিক কী জানতে চান? যেমন “নো-লোডে মোবাইল চার্জার কত ওয়াট টানে?”", min: 10 },
  { key: "background", bn: "পটভূমি", guide: "কেন জরুরি, কারা ভোগে, আগে কে কী পেয়েছে — দুটি সূত্রসহ।", min: 30 },
  { key: "method", bn: "পদ্ধতি", guide: "কী দিয়ে, কতবার, কোথায় মাপলেন; অন্য কেউ যেন হুবহু আবার করতে পারে।", min: 30 },
  { key: "result", bn: "ফলাফল", guide: "সংখ্যায় বলুন, টেবিল বা গ্রাফ ফাইলে দিন; যা মেলেনি তাও লিখুন।", min: 20 },
  { key: "conclusion", bn: "উপসংহার ও পরের ধাপ", guide: "এর মানে কী, সীমাবদ্ধতা কী, এরপর কী করা উচিত।", min: 20 },
];

export interface ResearchProject {
  id: string;
  from: RoomRef;
  /** The room's members when it started; votes and tasks name them. */
  members: { id: string; name: string }[];
  /** Who runs it: locks the topic, sets dates. */
  leadId: string;
  createdAt: string;
  /** The topic poll closes at the end of this day. */
  topicDeadline: string;
  ideas: TopicIdea[];
  topicId?: string;
  milestones: Milestone[];
  tasks: ResearchTask[];
  files: ResearchFile[];
  write: WriteUp;
  shared?: { postId?: string; researchId?: string; paperAt?: string };
}

export const emptyWrite: WriteUp = { question: "", background: "", method: "", result: "", conclusion: "" };

export function tally(idea: TopicIdea): Record<Vote, number> & { score: number } {
  const t = { agree: 0, maybe: 0, disagree: 0 };
  for (const v of Object.values(idea.votes)) t[v]++;
  return { ...t, score: t.agree * 2 + t.maybe - t.disagree * 2 };
}

/** The idea the team leans to: best score, then most agrees, then the first put up. */
export function leading(ideas: TopicIdea[]): TopicIdea | null {
  let best: TopicIdea | null = null;
  for (const i of ideas) {
    if (!best) best = i;
    else {
      const [a, b] = [tally(i), tally(best)];
      if (a.score > b.score || (a.score === b.score && a.agree > b.agree)) best = i;
    }
  }
  return best;
}

export const pollOpen = (p: Pick<ResearchProject, "topicId" | "topicDeadline">, today: string) => !p.topicId && today <= p.topicDeadline;

export const chosenTopic = (p: ResearchProject) => p.ideas.find((i) => i.id === p.topicId);

const DAY = 86_400_000;
export const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

/** A six-week plan from a start date; the lead moves the dates. */
export function defaultMilestones(start: string): Omit<Milestone, "id">[] {
  return [
    { title: "প্রস্তাবনা চূড়ান্ত", date: addDays(start, 3) },
    { title: "তথ্য ও আগের কাজ খোঁজা", date: addDays(start, 10) },
    { title: "ডেটা সংগ্রহ", date: addDays(start, 21) },
    { title: "বিশ্লেষণ", date: addDays(start, 28) },
    { title: "লেখা ও স্লাইড", date: addDays(start, 35) },
    { title: "উপস্থাপনা ও শেয়ার", date: addDays(start, 42) },
  ];
}

/** Slides, papers and data by their extension. */
export function fileKind(name: string): FileKind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (["ppt", "pptx", "odp", "key"].includes(ext)) return "ppt";
  if (ext === "pdf") return "pdf";
  if (["csv", "tsv", "xls", "xlsx", "ods", "json"].includes(ext)) return "data";
  return "other";
}

/** A shared Google Sheet: docs.google.com/spreadsheets/d/<id>. */
export const isSheetLink = (url: string) => /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]{10,}/.test(url.trim());

export const writeDone = (w: WriteUp, key: keyof WriteUp) => w[key].trim().length >= SECTIONS.find((s) => s.key === key)!.min;

export interface Check {
  key: "topic" | "plan" | "tasks" | "files" | "write";
  bn: string;
  done: boolean;
}

/** What must be in place before the research goes out. */
export function checklist(p: ResearchProject): Check[] {
  return [
    { key: "topic", bn: "বিষয় চূড়ান্ত", done: Boolean(p.topicId) },
    { key: "plan", bn: "সময়সূচিতে অন্তত ৩টি ধাপ", done: p.milestones.length >= 3 },
    { key: "tasks", bn: "সবার ভাগে অন্তত একটি কাজ", done: p.members.length > 0 && p.members.every((m) => p.tasks.some((t) => t.who === m.id)) },
    { key: "files", bn: "স্লাইড, পিডিএফ বা ডেটা — অন্তত একটি", done: p.files.length > 0 },
    { key: "write", bn: "লেখার সব অংশ", done: SECTIONS.every((s) => writeDone(p.write, s.key)) },
  ];
}

export const readiness = (p: ResearchProject) => {
  const c = checklist(p);
  return Math.round((c.filter((x) => x.done).length / c.length) * 100);
};

/** Enough to share with others: a topic, a question and a result. */
export const canShare = (p: ResearchProject) => Boolean(p.topicId) && writeDone(p.write, "question") && writeDone(p.write, "result");

/** A month as weeks of dates (Saturday first); null pads the edges. */
export function monthGrid(month: string): (string | null)[][] {
  const first = Date.parse(`${month}-01T00:00:00Z`);
  const d = new Date(first);
  const days = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (d.getUTCDay() + 1) % 7;
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => addDays(`${month}-01`, i))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

export const shiftMonth = (month: string, n: number) => {
  const d = new Date(`${month}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
};
