/**
 * The classroom's top bar: a welcome line, then one reminder at a time —
 * class activity, the next lab, research tasks, missed and pending reports,
 * the next exam, the next class, mentions and time spent here. Each comes
 * with a face that feels it and, mostly, a proverb that nudges. Pure rules,
 * tested in class-ticker.test.ts.
 */

import type { ClassMsg } from "./class-chat.ts";
import { nextExam, type Classroom } from "./classroom.ts";
import { countdown, nextDue, nextLab, reportState, type LabRoom } from "./lab.ts";
import { onBoard } from "./notices.ts";
import { chosenTopic, type ResearchProject } from "./research-project.ts";
import { bdWeekday } from "./teamwork.ts";

/** Each reminder stays this long, vanishes, and the next pops in after the gap. */
export const SHOW_MS = 8_000;
export const GAP_MS = 2_000;

export const WELCOME = "চল্ চল্ চল্। চল্ চল্ চল্। ঊর্ধ্ব গগনে বাজে মাদল";

/** The nudges: work not started, work half done, and plain courage. */
export const QUIPS = {
  undone: "কাগজ এগিয়ে রাখো বন্ধু",
  half: "কাজ জমালে জ্বিনে ধরবে",
  effort: "কষ্ট না করলে কেষ্ট মেলে না।",
  again: "একবার না পারিলে দেখ শতবার।",
  time: "সময় গেলে সাধন হবে না",
} as const;

/** The face beside a reminder. */
export type Mood = "cheer" | "worried" | "nervous" | "panic" | "determined" | "happy";

export type TickKind = "welcome" | "activity" | "lab" | "research" | "missing" | "pending" | "exam" | "classtime" | "mention" | "stay";

export interface Tick {
  kind: TickKind;
  label: string;
  text: string;
  mood: Mood;
  /** The proverb shown with it, in the brand's display face. */
  quip?: string;
  href?: string;
  /** Overdue work and an exam within two days. */
  urgent?: boolean;
}

export interface TickerInput {
  /** Whose reminders: the student, or the child a parent is watching. */
  me: { id: string; name: string };
  classes: { room: Classroom; now: Date }[];
  labs: { room: LabRoom; now: Date }[];
  projects: ResearchProject[];
  chats: { roomId: string; href: string; list: ClassMsg[] }[];
  /** Milliseconds in the classroom: this visit, and all visits. */
  stay: { visit: number; total: number };
  num: (v: number | string) => string;
}

const DAY_NAMES = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"];
const BN = "০১২৩৪৫৬৭৮৯";
const classHref = (id: string) => `/media/classroom/${id}`;
const labHref = (id: string) => `/media/classroom/lab/${id}`;
const bdMinutes = (now: Date) => Math.floor(((now.getTime() + 6 * 3_600_000) % 86_400_000) / 60_000);
const bdDate = (now: Date) => new Date(now.getTime() + 6 * 3_600_000).toISOString().slice(0, 10);

/** "১০:৩০" or "10:30" → minutes after midnight; NaN when unreadable. */
export function slotMinutes(time: string): number {
  const m = /(\d{1,2}):(\d{2})/.exec(time.replace(/[০-৯]/g, (d) => String(BN.indexOf(d))));
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
}

const when = (days: number, num: TickerInput["num"]) => (days <= 0 ? "আজ" : days === 1 ? "কাল" : `${num(days)} দিন পর`);

export function duration(ms: number, num: TickerInput["num"]): string {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "এক মিনিটের কম";
  const h = Math.floor(m / 60);
  return [h > 0 && `${num(h)} ঘণ্টা`, m % 60 > 0 && `${num(m % 60)} মিনিট`].filter(Boolean).join(" ");
}

const snip = (t: string, n = 48) => (t.length > n ? `${t.slice(0, n).trim()}…` : t);

/** The reminders that have something to say, welcome first and time spent last. */
export function tickerItems(i: TickerInput): Tick[] {
  const { me, num } = i;
  const out: Tick[] = [{ kind: "welcome", label: "স্বাগতম", text: WELCOME, mood: "cheer", quip: WELCOME }];

  // Class activity: the newest notice or shared note in any class.
  const activity = i.classes
    .flatMap(({ room, now }) => [
      ...onBoard(room.notices ?? [], bdDate(now)).map((n) => ({ at: n.at, by: n.byName ?? "", title: n.title, room })),
      ...room.notes.filter((n) => !n.private && n.title).map((n) => ({ at: n.at, by: room.members.find((m) => m.id === n.by)?.name ?? "", title: n.title, room })),
    ])
    .sort((a, b) => b.at.localeCompare(a.at))[0];
  if (activity) out.push({ kind: "activity", label: "ক্লাস কার্যক্রম", text: `${activity.by ? `${activity.by}: ` : ""}“${snip(activity.title)}” · ${activity.room.name}`, href: classHref(activity.room.id), mood: "determined", quip: QUIPS.effort });

  // The next lab session.
  const lab = i.labs
    .map(({ room, now }) => ({ room, next: nextLab(room.experiments, now) }))
    .filter((x) => x.next)
    .sort((a, b) => a.next!.days - b.next!.days)[0];
  if (lab?.next) out.push({ kind: "lab", label: "ল্যাব", text: `এক্সপেরিমেন্ট ${num(lab.next.exp.no)} — ${lab.next.exp.title} · ${when(lab.next.days, num)}`, href: labHref(lab.room.id), mood: "worried", quip: QUIPS.undone });

  // Research the viewer is part of.
  const projects = i.projects.filter((p) => p.members.some((m) => m.id === me.id));
  const tasks = projects.flatMap((p) => p.tasks.filter((t) => t.who === me.id && t.status !== "done").map((t) => ({ p, t })));
  if (tasks.length) {
    const topic = chosenTopic(tasks[0].p)?.title;
    const half = tasks.some(({ t }) => t.status === "doing");
    out.push({
      kind: "research",
      label: "গবেষণা",
      text: `আপনার ${num(tasks.length)}টি কাজ বাকি — “${snip(tasks[0].t.title, 36)}”${topic ? ` · ${snip(topic, 30)}` : ""}`,
      href: tasks[0].p.from.kind === "lab" ? labHref(tasks[0].p.from.id) : classHref(tasks[0].p.from.id),
      mood: half ? "nervous" : "worried",
      quip: half ? QUIPS.half : QUIPS.undone,
    });
  } else if (projects.some((p) => !p.topicId)) {
    const p = projects.find((x) => !x.topicId)!;
    out.push({ kind: "research", label: "গবেষণা", text: "বিষয় বাছাইয়ের ভোট চলছে — আপনার মত দিন", href: p.from.kind === "lab" ? labHref(p.from.id) : classHref(p.from.id), mood: "determined", quip: QUIPS.time });
  }

  // Reports: overdue first, then the next one due.
  const myLabs = i.labs.filter(({ room }) => room.members.some((m) => m.id === me.id));
  const missing = myLabs.flatMap(({ room, now }) => room.experiments.filter((e) => reportState(e, me.id, now) === "missing").map((e) => ({ room, e })));
  if (missing.length) out.push({ kind: "missing", label: "মিস হয়েছে", text: `রিপোর্ট ${missing.map((m) => num(m.e.no)).join(", ")} জমা হয়নি — সময় পেরিয়ে গেছে, লিডারকে জানান`, href: labHref(missing[0].room.id), urgent: true, mood: "panic", quip: QUIPS.undone });
  const due = myLabs
    .map(({ room, now }) => ({ room, due: nextDue(room.experiments, me.id, now) }))
    .filter((x) => x.due)
    .sort((a, b) => a.due!.hours - b.due!.hours)[0];
  if (due?.due) {
    const left = countdown(due.due.hours);
    // The lab work is done but the report is not: half done.
    const half = due.due.exp.submissions.some((x) => x.by === me.id && x.kind === "done");
    out.push({
      kind: "pending",
      label: "জমা বাকি",
      text: `রিপোর্ট ${num(due.due.exp.no)} — ${left.days > 0 ? `${num(left.days)} দিন ` : ""}${num(left.hours)} ঘণ্টা বাকি`,
      href: labHref(due.room.id),
      urgent: due.due.hours <= 48,
      mood: half ? "nervous" : "worried",
      quip: half ? QUIPS.half : QUIPS.undone,
    });
  } else if (myLabs.length && !missing.length) out.push({ kind: "pending", label: "জমা", text: "সব রিপোর্ট সময়মতো জমা হয়েছে — দারুণ!", mood: "happy" });

  // The nearest exam, class or lab.
  const exam = [
    ...i.classes.map(({ room, now }) => ({ name: room.name, href: classHref(room.id), next: nextExam(room.exams, now) })),
    ...i.labs.map(({ room, now }) => ({ name: room.name, href: labHref(room.id), next: nextExam(room.exams, now) })),
  ]
    .filter((x) => x.next)
    .sort((a, b) => a.next!.days - b.next!.days)[0];
  if (exam?.next) {
    const d = exam.next.days;
    out.push({ kind: "exam", label: "পরীক্ষা", text: `${exam.next.exam.title} · ${d <= 0 ? "আজ" : d === 1 ? "কাল" : `${num(d)} দিন বাকি`} · ${exam.name}`, href: exam.href, urgent: d <= 2, mood: d <= 2 ? "worried" : "determined", quip: QUIPS.time });
  }

  // The next class on the routine.
  const slot = i.classes
    .flatMap(({ room, now }) => {
      const today = bdWeekday(now);
      const at = bdMinutes(now);
      return room.routine.map((s) => {
        const mins = slotMinutes(s.time);
        let ahead = (s.day - today + 7) % 7;
        if (ahead === 0 && mins < at) ahead = 7;
        return { room, s, ahead, wait: ahead * 1440 + mins - at };
      });
    })
    .filter((x) => !Number.isNaN(x.wait))
    .sort((a, b) => a.wait - b.wait)[0];
  if (slot) {
    const day = slot.ahead === 0 ? "আজ" : slot.ahead === 1 ? "কাল" : DAY_NAMES[slot.s.day];
    out.push({ kind: "classtime", label: "ক্লাসের সময়", text: `${slot.s.subject}${slot.s.topic ? ` — ${slot.s.topic}` : ""} · ${day} ${num(slot.s.time)} · ${slot.room.name}`, href: classHref(slot.room.id), mood: "determined", quip: QUIPS.again });
  }

  // Mentions: someone else wrote the viewer's first name in a class chat.
  const first = me.name.trim().split(/\s+/)[0] ?? "";
  if (first.length >= 2) {
    const hits = i.chats.flatMap((c) => c.list.filter((m) => m.by !== me.id && m.text.includes(first)).map((m) => ({ m, href: c.href }))).sort((a, b) => b.m.at.localeCompare(a.m.at));
    if (hits.length) out.push({ kind: "mention", label: "উল্লেখ", text: `${hits[0].m.byName}: “${snip(hits[0].m.text)}”${hits.length > 1 ? ` · আরও ${num(hits.length - 1)}টি` : ""}`, href: hits[0].href, mood: "happy" });
  }

  out.push({ kind: "stay", label: "ক্লাসরুমে সময়", text: `এবার ${duration(i.stay.visit, num)} · সব মিলিয়ে ${duration(i.stay.total, num)}`, mood: "happy", quip: QUIPS.effort });
  return out;
}
