/**
 * The classroom's AI study helper: what files it takes, how a conversation
 * travels to the server, and the answer it gives when no AI key is set.
 * Pure rules, tested in tutor.test.ts.
 */

import { digits, type Numerals } from "./format.ts";

/** How a picked file is handled: sent as is (image, pdf), or read into text first. */
export type AttachKind = "image" | "pdf" | "office" | "legacy" | "text";

export const ACCEPT = "image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.csv";
export const MAX_FILES = 4;

/** Bytes per picked file. Images are shrunk before sending; PDFs go whole, so they stay small. */
export const MAX_BYTES: Record<AttachKind, number> = {
  image: 15 * 1024 * 1024,
  pdf: 3 * 1024 * 1024,
  office: 25 * 1024 * 1024,
  legacy: 25 * 1024 * 1024,
  text: 1024 * 1024,
};

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export function attachKind(name: string, type: string): AttachKind | null {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "heic", "bmp"].includes(ext)) return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "pptx") return "office";
  if (ext === "doc" || ext === "ppt") return "legacy";
  if (type.startsWith("text/") || ["txt", "md", "csv"].includes(ext)) return "text";
  return null;
}

/** A file on its way to the server: images and PDFs as base64, everything else as text. */
export interface TutorFile {
  name: string;
  kind: "image" | "pdf" | "text";
  media: string;
  data: string;
}

export interface TutorTurn {
  role: "user" | "assistant";
  text: string;
  files?: TutorFile[];
}

/** A saved message. Files keep only their name: the bytes are not stored. */
export interface TutorMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  files?: { name: string; kind: AttachKind }[];
  at: string;
  /** Which helper answered. */
  mode?: "claude" | "offline";
  /** Asked by voice: the answer is read aloud. */
  voice?: boolean;
}

/** What the tutor is told about the room the student has open. */
export interface TutorContext {
  room?: string;
  level?: string;
  subject?: string;
  parent?: boolean;
}

export const HISTORY = 12;
export const SAVED = 60;

/**
 * The conversation as the API wants it: the last few turns, starting with
 * the student, roles alternating (back-to-back turns merged). Only the newest
 * message carries files; older ones mention them by name.
 */
export function toTurns(history: TutorMsg[], files: TutorFile[]): TutorTurn[] {
  const turns: TutorTurn[] = [];
  for (const m of history.slice(-HISTORY)) {
    const note = m.files?.length ? `\n[সংযুক্ত: ${m.files.map((f) => f.name).join(", ")}]` : "";
    const text = (m.text + note).trim();
    if (!text) continue;
    const last = turns.at(-1);
    if (last && last.role === m.role) last.text += `\n\n${text}`;
    else turns.push({ role: m.role, text });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  const last = turns.at(-1);
  if (last?.role === "user" && files.length) last.files = files;
  return turns;
}

const STOP = new Set(
  "এবং ও বা কিন্তু তবে যে যা যার যদি তাহলে এই সেই ওই একটি একটা করে করা করতে হয় হবে হলে ছিল আছে নেই থেকে জন্য দিয়ে নিয়ে মধ্যে উপর পরে আগে সাথে সঙ্গে কোন কোনো কী কি কেন কিভাবে কীভাবে তার তাদের আমি আমরা আপনি তুমি সে তারা এটি এটা তা না নয় হয়ে হচ্ছে গেলে দেওয়া পারে পারেন অনেক সব আর বলে বলা প্রতি প্রথম দ্বিতীয় the and for are with that this from have was were has not but you your can will into its their they them then than also which what when where who how about been more most such only other some any each".split(
    " ",
  ),
);

/** The words a text leans on most: a quick map of what to learn. */
export function keyTerms(text: string, n = 6): string[] {
  const count = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[\p{L}\p{M}]+/gu) ?? []) {
    if ([...w].length < 3 || STOP.has(w)) continue;
    count.set(w, (count.get(w) ?? 0) + 1);
  }
  return [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map(([w]) => w);
}

const words = (t: string) => (t.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length;

/**
 * The offline helper's answer: honest that the AI is off, then what it can
 * still do from the text it was given — key words, a reading plan and
 * questions to test yourself with.
 */
export function offlineReply(question: string, files: TutorFile[], numerals: Numerals = "bn"): string {
  const num = (v: number) => digits(v, numerals);
  const texts = files.filter((f) => f.kind === "text");
  const unread = files.filter((f) => f.kind !== "text");
  const out = ["এখন অফলাইন সহায়ক উত্তর দিচ্ছে — সার্ভারে AI চালু হলে পুরো ব্যাখ্যা পাবেন। তবু যা পারি:"];

  for (const f of texts) {
    const terms = keyTerms(f.data, 5);
    out.push(`\n${f.name} — ${num(words(f.data))} শব্দ পড়লাম।${terms.length ? ` বারবার এসেছে: ${terms.join(", ")}।` : ""}`);
  }
  if (unread.length) out.push(`\n${unread.map((f) => f.name).join(", ")} — ছবি আর PDF পড়তে অনলাইন AI লাগে, তাই এখন শুধু নামটা দেখছি।`);

  const terms = keyTerms([question, ...texts.map((f) => f.data)].join(" "), 3);
  const q = question.trim();
  if (q) out.push(`\nআপনার প্রশ্ন: “${q.length > 120 ? `${q.slice(0, 120)}…` : q}”`);
  out.push(
    "\nএভাবে এগোন:",
    "• প্রশ্নটা ছোট ছোট ভাগে ভাঙুন — কী দেওয়া আছে, কী বের করতে হবে।",
    "• বই বা নোটে সংজ্ঞাটা খুঁজে নিজের ভাষায় দুই লাইনে লিখুন।",
    "• একটা সহজ উদাহরণ নিজে বানিয়ে মিলিয়ে দেখুন।",
  );
  if (terms.length) {
    out.push("\nনিজেকে যাচাই করুন:");
    for (const t of terms) out.push(`• “${t}” কাকে বলে, বইয়ের দিকে না তাকিয়ে বলতে পারেন?`);
  }
  out.push("\nআটকে গেলে বাঁ পাশের Discussion Room-এ শিক্ষককে প্রশ্নটা পাঠান।");
  return out.join("\n");
}

/** What the question builder knows about the thread the student is writing in. */
export interface QuestionContext {
  /** What the student has typed so far, however rough; may be empty. */
  draft: string;
  room?: string;
  subject?: string;
  /** The teacher's name as the class knows it, e.g. "রফিকুল ইসলাম স্যার". */
  teacher?: string;
  /** The teacher's latest message: the likely topic. */
  lastTeacher?: string;
}

const clip = (t: string, n: number) => (t.length > n ? `${t.slice(0, n).trim()}…` : t);

/** How to address a teacher: by title when the name carries one, else neutrally. */
export function addressOf(teacher?: string): string {
  if (teacher && /স্যার|\bsir\b/i.test(teacher)) return "স্যার";
  if (teacher && /ম্যাডাম|ম্যাম|আপা|madam|ma'am/i.test(teacher)) return "ম্যাডাম";
  return "শ্রদ্ধেয় শিক্ষক";
}

/** The one message the AI gets when asked to build a question. */
export function questionBrief(c: QuestionContext): string {
  const draft = c.draft.trim();
  return [
    `শিক্ষার্থীর খসড়া: ${draft ? `“${clip(draft, 600)}”` : "(কিছু লেখেননি)"}`,
    c.room && `ক্লাস: ${c.room}`,
    c.subject && `বিষয়: ${c.subject}`,
    c.teacher && `শিক্ষক: ${c.teacher}`,
    c.lastTeacher && `শিক্ষকের সর্বশেষ কথা: “${clip(c.lastTeacher.trim(), 300)}”`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * The offline question builder: no AI, just a clear shape — what the student
 * is on, what they understood, where they are stuck — with "[ ]" blanks to
 * fill. The student's own words are kept as they are.
 */
export function offlineQuestion(c: QuestionContext): string {
  const draft = c.draft.trim();
  const hi = addressOf(c.teacher);
  const topic = c.subject ? `${c.subject} বিষয়ে ` : "";
  if (draft) return `${hi}, ${topic}${clip(draft, 600)}\n\nআমি নিজে এটুকু বুঝেছি/চেষ্টা করেছি: [ ]\nকিন্তু ঠিক এই জায়গায় আটকে যাচ্ছি: [ ]\nএকটু বুঝিয়ে দেবেন?`;
  if (c.lastTeacher) return `${hi}, আপনি যে বললেন “${clip(c.lastTeacher.trim(), 120)}” — এ নিয়ে একটা প্রশ্ন আছে।\n\nআমি এটুকু বুঝেছি: [ ]\nযেখানে আটকে আছি: [ ]\nএকটু বুঝিয়ে দেবেন?`;
  return `${hi}, ${topic}একটা প্রশ্ন ছিল।\n\nটপিক: [ ]\nআমি এটুকু বুঝেছি: [ ]\nযেখানে আটকে আছি: [ ]\nএকটু বুঝিয়ে দেবেন?`;
}
