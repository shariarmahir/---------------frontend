import { CLASS_MINUTES, COURSE_DAYS, courseTimeline } from "./academy.ts";
import { bnDigits } from "./format.ts";

/**
 * A batch: one run of a course, with its own start, its own weekly class
 * slot and its own seats. Its classroom is where its skill hunters meet —
 * the live class, the recordings, the chat. An academy opens a classroom
 * per batch and can run several batches of a course at different times.
 */
export interface Batch {
  /** The course's first batch carries the course code itself, so records kept by course code carry over. */
  id: string;
  course: string;
  /** 1, 2, 3 … within the course. */
  n: number;
  /** YYYY-MM-DD; the batch ends COURSE_DAYS later. */
  starts: string;
  /** The weekly class day, 0 Sunday … 6 Saturday. */
  day: number;
  /** Class start, "HH:MM" Dhaka time. */
  time: string;
  seats: number;
  enrolled: number;
  /** The live class's video room name: hard to guess, one per batch. */
  room: string;
  opened: string;
}

/** A file in the batch chat: a small kept copy (data URL), its name and kind. */
export interface RoomFile {
  kind: "file" | "image" | "audio";
  name: string;
  size: string;
  href: string;
}

/** A line in a batch's chat. A member writes by handle; a sample learner by name. */
export interface RoomMessage {
  id: string;
  by: { handle: string } | { name: string };
  text: string;
  file?: RoomFile;
  at: string;
}

export const WEEKDAYS =["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"] as const;

/** Classes may start from 6 am to 10 pm, Dhaka. */
const EARLIEST = 6 * 60;
const LATEST = 22 * 60;
const DHAKA_MS = 6 * 3_600_000;

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const isDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const minutesOf = (time: string): number | null => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
/** Today's date in Dhaka. */
export const dhakaDay = (now: Date) => new Date(now.getTime() + DHAKA_MS).toISOString().slice(0, 10);

/** Each class week's class: on the batch's weekday within that week, at its time, Dhaka. */
export function classSessions(b: Pick<Batch, "starts" | "day" | "time">): { week: number; at: string }[] {
  return courseTimeline(b.starts).weeks.map(({ week, from }) => {
    const first = new Date(`${from}T00:00:00Z`).getUTCDay();
    const date = addDays(from, (b.day - first + 7) % 7);
    return { week, at: new Date(`${date}T${b.time}:00+06:00`).toISOString() };
  });
}

/** The class that is on now, or the next one; null once the class weeks are over. */
export function nextClass(b: Pick<Batch, "starts" | "day" | "time">, now: Date): { week: number; at: string; live: boolean } | null {
  const t = now.getTime();
  const s = classSessions(b).find((x) => t < Date.parse(x.at) + CLASS_MINUTES * 60_000);
  return s ? { ...s, live: t >= Date.parse(s.at) } : null;
}

export type BatchStage = "upcoming" | "running" | "final" | "done";
export const BATCH_STAGES: Record<BatchStage, string> = { upcoming: "শুরু হবে", running: "ক্লাস চলছে", final: "প্রজেক্ট ও প্যানেল", done: "শেষ" };

/** Where a batch is in its 40 days. */
export function batchStage(b: Pick<Batch, "starts">, now: Date): BatchStage {
  const today = dhakaDay(now);
  const t = courseTimeline(b.starts);
  if (today < b.starts) return "upcoming";
  if (today < t.final.from) return "running";
  return today <= t.ends ? "final" : "done";
}

/** Do two batches meet at the same hour on the same weekday while both run? */
function clash(a: Pick<Batch, "starts" | "day" | "time">, b: Pick<Batch, "starts" | "day" | "time">): boolean {
  if (a.day !== b.day) return false;
  const ma = minutesOf(a.time);
  const mb = minutesOf(b.time);
  if (ma === null || mb === null || Math.abs(ma - mb) >= CLASS_MINUTES) return false;
  const aEnds = addDays(a.starts, COURSE_DAYS - 1);
  const bEnds = addDays(b.starts, COURSE_DAYS - 1);
  return a.starts <= bEnds && b.starts <= aEnds;
}

/**
 * What a new classroom breaks, in words the academy can act on; empty when
 * it can open. `mine` is the teacher's other batches.
 */
export function batchIssues(draft: Pick<Batch, "starts" | "day" | "time">, mine: Pick<Batch, "starts" | "day" | "time" | "course" | "n">[], today: string): string[] {
  const out: string[] = [];
  if (!isDay(draft.starts)) out.push("শুরুর তারিখ বেছে নিন");
  else if (draft.starts < today) out.push("শুরুর তারিখ আজ বা পরের কোনো দিন হতে হবে");
  const m = minutesOf(draft.time);
  if (m === null) out.push("ক্লাসের সময় ঘণ্টা:মিনিটে দিন, যেমন ১৯:০০");
  else if (m < EARLIEST || m > LATEST) out.push("ক্লাস শুরু সকাল ৬টা থেকে রাত ১০টার মধ্যে");
  if (!(draft.day >= 0 && draft.day <= 6)) out.push("সপ্তাহের ক্লাসের দিন বেছে নিন");
  if (out.length === 0) {
    const hit = mine.find((b) => clash(draft, b));
    if (hit) out.push(`একই সময়ে আপনার ${hit.course}-এর ব্যাচ ${bnDigits(hit.n)}-এর ক্লাস চলে — অন্য দিন বা সময় নিন`);
  }
  return out;
}

/** A short stable hash, base 36, for the sample batches' room names. */
function hash(s: string): string {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h.toString(36);
}

/** The video room for a batch: the code without punctuation, then a salt nobody can guess from the code alone. */
export function roomName(id: string, salt: string): string {
  return `Kandari-${id.replace(/[^A-Za-z0-9]/g, "")}-${salt.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

/** A course's first batch, from the course itself: its start, seats, and the slot of its next live class (else Saturday 7 pm). */
export function foundingBatch(c: { id: string; starts: string; seats: number; enrolled: number; nextLive?: string }): Batch {
  const live = c.nextLive ? new Date(Date.parse(c.nextLive) + DHAKA_MS) : null;
  return {
    id: c.id,
    course: c.id,
    n: 1,
    starts: c.starts,
    day: live ? live.getUTCDay() : 6,
    time: live ? live.toISOString().slice(11, 16) : "19:00",
    seats: c.seats,
    enrolled: c.enrolled,
    room: roomName(c.id, hash(`kandari-academy:${c.id}`)),
    opened: c.starts,
  };
}

/** "শনিবার · সন্ধ্যা ৭:৩০" — the weekday and the hour as people say it. */
export function slotOf(day: number, time: string): string {
  const m = minutesOf(time) ?? 0;
  const h = Math.floor(m / 60);
  const part = h < 6 ? "ভোর" : h < 12 ? "সকাল" : h < 15 ? "দুপুর" : h < 18 ? "বিকেল" : h < 20 ? "সন্ধ্যা" : "রাত";
  const h12 = h % 12 || 12;
  return `${WEEKDAYS[day] ?? ""} · ${part} ${bnDigits(h12)}:${bnDigits(String(m % 60).padStart(2, "0"))}`;
}

/** iCalendar time: 2026-09-05T13:00:00Z → 20260905T130000Z. */
const icsTime = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** iCalendar text: backslash, semicolon, comma and newlines escaped. */
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/**
 * The learner's classes as a calendar file the phone opens (iCalendar,
 * CRLF lines): one event per class, each its length in minutes.
 */
export function calendarFile(events: { uid: string; title: string; at: string; minutes: number; where?: string }[], now: string): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kandari Academy//Routine//BN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@kandari-academy`,
      `DTSTAMP:${icsTime(now)}`,
      `DTSTART:${icsTime(e.at)}`,
      `DTEND:${icsTime(new Date(Date.parse(e.at) + e.minutes * 60_000).toISOString())}`,
      `SUMMARY:${icsText(e.title)}`,
      ...(e.where ? [`LOCATION:${icsText(e.where)}`] : []),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR", "");
  return lines.join("\r\n");
}

/** Seats still open in a batch; the viewer's own seat, if taken on this device, counts. */
export const seatsLeft = (b: Pick<Batch, "seats" | "enrolled">, mine = false) => Math.max(0, b.seats - b.enrolled - (mine ? 1 : 0));
