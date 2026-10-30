/**
 * Pins and colour markers in the Discussion Room. A pin keeps something
 * where the class sees it first: a line of text, a task with a due day, a
 * piece of data (a value or a link, say a Google Sheet), or an important
 * chat message. A marker colours a message for the one who marked it. The
 * teacher and the leader pin for the class; students pin for themselves.
 * Pure rules, tested in class-pins.test.ts.
 *
 * TODO(backend): pins and markers live in this browser; class-wide pins need
 * a server so every classmate sees the teacher's.
 */

import type { ClassMode } from "./class-access.ts";
import type { ClassMsg } from "./class-chat.ts";
import { NOTE_COLORS, type NoteColor, type Role } from "./notices.ts";

export type PinKind = "text" | "task" | "data" | "chat";

export const PIN_KINDS: Record<PinKind, string> = { text: "লেখা", task: "টাস্ক", data: "ডেটা", chat: "গুরুত্বপূর্ণ চ্যাট" };

/** The paper each kind starts with; the pinner may pick another. */
export const PIN_COLOR: Record<PinKind, NoteColor> = { text: "gold", task: "mint", data: "white", chat: "peach" };

export interface Pin {
  id: string;
  kind: PinKind;
  /** The text, the task, the data's name, or the pinned message. */
  title: string;
  /** Data: its value. Chat: who wrote the message. */
  body?: string;
  /** Data: a link, e.g. a Google Sheet. http or https only. */
  url?: string;
  /** Task: the due day, YYYY-MM-DD. */
  due?: string;
  /** Task: ticked off. */
  done?: boolean;
  /** Chat: the message pinned. */
  msgId?: string;
  color: NoteColor;
  by: string;
  byName: string;
  byRole: Role;
  at: string;
}

export const MAX_PINS = 12;
export const MAX_MARKS = 200;
/** Longest title per kind, and the longest data value. */
export const TITLE_MAX: Record<PinKind, number> = { text: 280, task: 120, data: 60, chat: 300 };
export const VALUE_MAX = 200;

/** Staff pin for the whole class; a student's pins are theirs alone. */
export const isClassPin = (p: Pick<Pin, "byRole">) => p.byRole === "teacher" || p.byRole === "leader";

/** Members, the leader and the teacher pin and mark; guests and parents only read. */
export const canPin = (role: Role, mode: ClassMode) => mode === "student" && role !== "guest";

/** The teacher may take down any pin; the leader any but the teacher's; others their own. */
export function canUnpin(p: Pin, role: Role, meId?: string): boolean {
  if (role === "teacher") return true;
  if (role === "leader") return p.byRole !== "teacher";
  return role === "member" && p.by === meId;
}

/** http and https links only; a bare "docs.google.com/…" gets https. Anything else is null. */
export function safeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const full = /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : /^[^\s/]+\.[^\s/]+/.test(t) ? `https://${t}` : null;
  if (!full) return null;
  try {
    const u = new URL(full);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

const isDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

export interface PinDraft {
  kind: Exclude<PinKind, "chat">;
  title: string;
  /** Data: the value. */
  body: string;
  /** Data: the link. */
  url: string;
  /** Task: the due day, or empty. */
  due: string;
}

export interface Pinner {
  id: string;
  name: string;
  role: Role;
}

/** A pin from a form, or the first thing wrong with it. */
export function buildPin(d: PinDraft, who: Pinner, id: string, at: string, color: NoteColor = PIN_COLOR[d.kind]): { pin: Pin } | { problem: string } {
  const title = d.title.trim();
  const base = { id, kind: d.kind, color, by: who.id, byName: who.name, byRole: who.role, at };
  if (title.length < 2) return { problem: d.kind === "data" ? "ডেটার একটা নাম দিন।" : d.kind === "task" ? "টাস্কটা লিখুন।" : "কিছু লিখুন।" };
  if (title.length > TITLE_MAX[d.kind]) return { problem: "বেশি বড় — একটু ছোট করুন।" };
  if (d.kind === "text") return { pin: { ...base, title } };
  if (d.kind === "task") {
    const due = d.due.trim();
    if (due && !isDay(due)) return { problem: "শেষ তারিখটা ঠিক নেই।" };
    return { pin: { ...base, title, ...(due && { due }) } };
  }
  const body = d.body.trim();
  const link = d.url.trim();
  const url = link ? safeUrl(link) : null;
  if (link && !url) return { problem: "লিংকটা ঠিক নেই — https:// দিয়ে শুরু হওয়া ঠিকানা দিন।" };
  if (!body && !url) return { problem: "মান লিখুন, অথবা লিংক দিন।" };
  if (body.length > VALUE_MAX) return { problem: "মানটা বেশি বড় — একটু ছোট করুন।" };
  return { pin: { ...base, title, ...(body && { body }), ...(url && { url }) } };
}

/** Pin an existing message as important; the text is copied, so the pin outlives the chat. */
export function chatPin(m: ClassMsg, who: Pinner, id: string, at: string, color: NoteColor = PIN_COLOR.chat): Pin {
  const text = m.text.trim();
  return { id, kind: "chat", title: text.length > TITLE_MAX.chat ? `${text.slice(0, TITLE_MAX.chat - 1).trim()}…` : text, body: m.byName, msgId: m.id, color, by: who.id, byName: who.name, byRole: who.role, at };
}

export type TaskState = "done" | "overdue" | "today" | "soon" | "open";

const DAY = 86_400_000;

/** Days from `today` to the due day; negative once it has passed. */
export const daysLeft = (due: string, today: string) => Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);

/** Where a task stands today: ticked, past due, due today, due within two days, or open. */
export function taskState(p: Pick<Pin, "done" | "due">, today: string): TaskState {
  if (p.done) return "done";
  if (!p.due) return "open";
  const d = daysLeft(p.due, today);
  return d < 0 ? "overdue" : d === 0 ? "today" : d <= 2 ? "soon" : "open";
}

/** Open pins first: the teacher's, then the leader's, then the rest, newest first; ticked tasks last. */
export function sortPins(list: Pin[]): Pin[] {
  const rank = (p: Pin) => (p.done ? 3 : p.byRole === "teacher" ? 0 : p.byRole === "leader" ? 1 : 2);
  return [...list].sort((a, b) => rank(a) - rank(b) || b.at.localeCompare(a.at));
}

export const canAddPin = (list: Pin[]) => list.length < MAX_PINS;

/** A message's marker colour, per message id. */
export type Marks = Record<string, NoteColor>;

/** Mark a message, or clear it (null, or the same colour again); only the newest MAX_MARKS stay. */
export function withMark(marks: Marks, msgId: string, color: NoteColor | null): Marks {
  const { [msgId]: had, ...rest } = marks;
  if (color === null || had === color) return rest;
  if (!NOTE_COLORS.includes(color)) return marks;
  const next = { ...rest, [msgId]: color };
  const keys = Object.keys(next);
  return keys.length > MAX_MARKS ? Object.fromEntries(keys.slice(-MAX_MARKS).map((k) => [k, next[k]])) : next;
}
