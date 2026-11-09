/**
 * The class chat: the whole class and its teacher in one thread, beside the
 * classroom. A student can flag a message as a question for the teacher; a
 * parent reads but never writes. Pure rules, tested in class-chat.test.ts.
 */

import type { ClassMode } from "./class-access.ts";
import type { Role } from "./notices.ts";

export interface ClassMsg {
  id: string;
  by: string;
  byName: string;
  byRole: Role;
  text: string;
  at: string;
  /** A question for the teacher. */
  ask?: boolean;
}

export const MSG_MAX = 1000;
/** Messages kept per room on this device. */
export const KEEP = 300;

/** Members, the leader and the teacher write; guests and parents only read. */
export const canWrite = (role: Role, mode: ClassMode) => mode === "student" && role !== "guest";

/** The thread in time order: the room's own messages plus the ones written here, no repeats. */
export function thread(seed: ClassMsg[], mine: ClassMsg[]): ClassMsg[] {
  const seen = new Set<string>();
  return [...seed, ...mine]
    .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
    .sort((a, b) => a.at.localeCompare(b.at));
}

/** Add a message, keeping the newest KEEP. */
export const append = (list: ClassMsg[], m: ClassMsg) => [...list, m].slice(-KEEP);

/** Questions to the teacher that no teacher message has followed yet. */
export function openQuestions(list: ClassMsg[]): ClassMsg[] {
  const lastTeacher = list.findLast((m) => m.byRole === "teacher")?.at ?? "";
  return list.filter((m) => m.ask && m.at > lastTeacher);
}

/** The Dhaka calendar day a message falls on, for the day dividers. */
export const bdDay = (iso: string) => new Date(Date.parse(iso) + 6 * 3_600_000).toISOString().slice(0, 10);

/** Trimmed text, or null when empty or too long. */
export function cleanMsg(raw: string): string | null {
  const t = raw.replace(/\n{3,}/g, "\n\n").trim();
  return t && t.length <= MSG_MAX ? t : null;
}

/** An AI-built question leaves "[ ]" for the student to fill; a message still holding one is not ready. */
export const hasBlanks = (text: string) => /\[\s*\]/.test(text);
