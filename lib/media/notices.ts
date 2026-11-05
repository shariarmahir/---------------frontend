/**
 * The notice board of a classroom or lab room: class cancelled, emergency
 * closure, a student's leave with a one-word reason, a late submission, or
 * anything else the teacher or leader pins up. Pure rules, tested in
 * notices.test.ts.
 */

export type NoticeKind = "emergency" | "cancel" | "leave" | "late" | "custom";

/** Who someone is in a room. The teacher has every power the leader has, and more. */
export type Role = "teacher" | "leader" | "member" | "guest";

export const NOTICE_KINDS: Record<NoticeKind, { bn: string; hint: string; staff: boolean }> = {
  emergency: { bn: "জরুরি বাতিল", hint: "বন্যা, হরতাল, হঠাৎ অসুস্থতা — আজই সবাইকে জানান", staff: true },
  cancel: { bn: "ক্লাস বাতিল", hint: "কোন দিনের কোন ক্লাস হবে না", staff: true },
  leave: { bn: "ছুটি", hint: "কোন দিন আসবেন না, এক শব্দে কারণ", staff: false },
  late: { bn: "দেরিতে জমা", hint: "কোন কাজ, কবে জমা দেবেন", staff: false },
  custom: { bn: "নোটিশ", hint: "অন্য যেকোনো ঘোষণা", staff: true },
};

/** Paper colours the poster picks from. Red is not one: it stays the emergency's alone. */
export const NOTE_COLORS = ["gold", "orange", "peach", "green", "mint", "leaf", "white"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

const KIND_COLOR: Record<Exclude<NoticeKind, "emergency">, NoteColor> = { cancel: "gold", leave: "white", late: "orange", custom: "green" };

/** The note's paper: red for an emergency, else the poster's pick, else its kind's colour. */
export const paperOf = (n: Pick<Notice, "kind" | "color">): NoteColor | "red" => (n.kind === "emergency" ? "red" : (n.color ?? KIND_COLOR[n.kind]));

/** Reasons offered as one tap; any other single word is fine too. */
export const LEAVE_WORDS = ["অসুস্থ", "জ্বর", "পারিবারিক", "বিয়ে", "ভ্রমণ", "জরুরি", "পরীক্ষা"];

export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;
  body?: string;
  /** Leave and late: the reason, one word. */
  reason?: string;
  /** The day it is about, YYYY-MM-DD. */
  date?: string;
  /** Leave: how many days from `date`. */
  days?: number;
  by: string;
  /** The author's name when it went up, so it survives members leaving. */
  byName?: string;
  byRole: Role;
  at: string;
  /** Pinned notes stay up until taken down. */
  pinned?: boolean;
  /** The paper colour the poster chose. */
  color?: NoteColor;
}

export const isStaff = (r: Role) => r === "teacher" || r === "leader";

export function roleOf(room: { leaderId: string; teacherId?: string }, meId: string | undefined, member: boolean): Role {
  if (!meId || !member) return "guest";
  if (room.teacherId === meId) return "teacher";
  return room.leaderId === meId ? "leader" : "member";
}

/** Students post their own leave and late notes; the rest is for the teacher and leader. */
export const canPost = (kind: NoticeKind, role: Role) => role !== "guest" && (!NOTICE_KINDS[kind].staff || isStaff(role));

/** The teacher may take down anything; the leader anything but the teacher's; others only their own. */
export function canRemove(n: Notice, role: Role, meId?: string): boolean {
  if (role === "teacher") return true;
  if (role === "leader") return n.byRole !== "teacher";
  return role === "member" && n.by === meId;
}

/** One word: no spaces, 2 to 16 letters. */
export function oneWord(raw: string): string | null {
  const w = raw.trim();
  return /^\S{2,16}$/.test(w) ? w : null;
}

const DAY = 86_400_000;
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

/** The last day a notice matters: its day (or last leave day), else a week after it went up. */
export function lastDay(n: Notice): string {
  if (n.date) return addDays(n.date, Math.max(1, n.days ?? 1) - 1);
  return addDays(n.at.slice(0, 10), 7);
}

/** What is still on the board today, emergencies first, then pinned, then the soonest. */
export function onBoard(list: Notice[], today: string): Notice[] {
  const rank = (n: Notice) => (n.kind === "emergency" ? 0 : n.pinned ? 1 : 2);
  return list
    .filter((n) => n.pinned || lastDay(n) >= today)
    .sort((a, b) => rank(a) - rank(b) || (a.date ?? a.at).localeCompare(b.date ?? b.at));
}
