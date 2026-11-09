/**
 * Hiring between members: a person says they want work, a recruiter invites
 * someone to an interview, and the academy's graduates stand ready with a
 * verified result. Pure rules here; the pages keep the state.
 */
import { finalResult, VERDICTS, type Verdict } from "./academy.ts";
import type { PayUnit } from "./fair-pay.ts";

export type WorkType = "full" | "part" | "gig" | "intern";

/** "আমি কাজ চাই": what the person is looking for, open to every recruiter while `open`. */
export interface Seeking {
  role: string;
  type: WorkType;
  pay: number;
  unit: PayUnit;
  /** The first day they can start, yyyy-mm-dd. */
  from: string;
  note: string;
  open: boolean;
  at: string;
}

/** An interview invitation one member sends another. `to` is a handle or, for an academy graduate, the board seat. */
export interface Invite {
  id: string;
  to: string;
  toName: string;
  kind: "seeker" | "graduate";
  role: string;
  note: string;
  /** The proposed interview time, ISO. */
  slot: string;
  at: string;
}

export type InviteReply = "accepted" | "declined";

export const INVITE_NOTE_MIN = 20;
export const ROLE_MIN = 3;

/** What stops an invitation from going out: a role, a real note, a time still ahead. */
export function inviteIssues(i: Pick<Invite, "role" | "note" | "slot">, now: Date): string[] {
  const out: string[] = [];
  if (i.role.trim().length < ROLE_MIN) out.push("কোন পদের জন্য — লিখুন");
  if (i.note.trim().length < INVITE_NOTE_MIN) out.push(`কেন তাঁকে ডাকছেন — অন্তত ${INVITE_NOTE_MIN} অক্ষরে লিখুন`);
  const slot = Date.parse(i.slot);
  if (Number.isNaN(slot) || slot <= now.getTime()) out.push("ইন্টারভিউয়ের সময় সামনের কোনো দিন হতে হবে");
  return out;
}

/** What stops a "কাজ চাই" card from going up. Pay is checked by the caller against the fair-pay floor. */
export function seekingIssues(s: Pick<Seeking, "role" | "from" | "note">): string[] {
  const out: string[] = [];
  if (s.role.trim().length < ROLE_MIN) out.push("কোন কাজ চান — লিখুন");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.from)) out.push("কবে থেকে শুরু করতে পারবেন — তারিখ দিন");
  if (s.note.trim().length > 280) out.push("নোট ২৮০ অক্ষরের মধ্যে রাখুন");
  return out;
}

/** A seat on the academy's public interview board, as much as hiring needs of it. */
export interface BoardSeatLike {
  id: string;
  learner: string;
  district: string;
  course: string;
  project: string;
  at: string;
  marks?: number[];
  certificate?: string;
}

type Certified = { seat: BoardSeatLike; stage: "certified"; average: number; verdict: Verdict; label: string };
type Upcoming = { seat: BoardSeatLike; stage: "interview" };

/** A graduate with a result, or a learner whose final is still ahead. */
export type Talent = Certified | Upcoming;

/**
 * The academy's people a recruiter can call: those who passed, best result
 * first, then those whose panel interview is still to come, soonest first.
 * A failed or undecided final is left out.
 */
export function talentFrom(board: BoardSeatLike[], now: Date): Talent[] {
  const certified: Certified[] = [];
  const upcoming: Upcoming[] = [];
  for (const seat of board) {
    if (seat.certificate && seat.marks && seat.marks.length >= 2) {
      const { average, verdict } = finalResult(seat.marks);
      if (verdict === "pass" || verdict === "distinction") certified.push({ seat, stage: "certified", average, verdict, label: VERDICTS[verdict] });
    } else if (!seat.marks && Date.parse(seat.at) > now.getTime()) {
      upcoming.push({ seat, stage: "interview" });
    }
  }
  certified.sort((a, b) => b.average - a.average);
  upcoming.sort((a, b) => a.seat.at.localeCompare(b.seat.at));
  return [...certified, ...upcoming];
}

/** The next weekday at 11:00 local time, as the value of a datetime-local field. */
export function nextSlot(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 5) d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T11:00`;
}
