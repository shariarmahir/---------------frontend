/**
 * Kandari HQ's shared rules: who may do what, the labels for every enum,
 * Dhaka-time day helpers and small text rules. Pure, no I/O; tested in
 * rules.test.ts. Imports use explicit .ts paths so `node --test` can run
 * them directly. HQ's interface is in English (Mahir, 2026-10-22).
 */
import type { Day, Dept, Iso, Level, Perm, Person, Priority, Risk, Stage, TaskKind, TaskStatus } from "./types.ts";

/* ───────────── access ───────────── */

export const ALL_PERMS: Perm[] = [
  "people.manage",
  "tasks.publish",
  "tasks.approve",
  "tasks.review",
  "teams.approve",
  "attendance.manage",
  "finance.view",
  "finance.edit",
  "clients.view",
  "clients.manage",
  "hr.manage",
  "content.manage",
  "shongbidhan.judge",
  "reports.view",
  "audit.view",
];

export const PERM_LABEL: Record<Perm, { label: string; hint: string }> = {
  "people.manage": { label: "People & designations", hint: "Change designations, promote or demote, approve ID applications" },
  "tasks.publish": { label: "Publish tickets", hint: "Post new task tickets to the board" },
  "tasks.approve": { label: "Approve tasks", hint: "Approve solo TaskBooks and learning projects" },
  "tasks.review": { label: "Review tasks", hint: "Review submissions, score them, award merits" },
  "teams.approve": { label: "Approve teams", hint: "Approve requests to open a new team" },
  "attendance.manage": { label: "Attendance & leave", hint: "Approve leave, late counts, office hours" },
  "finance.view": { label: "View finance", hint: "Income, expenses, cash flow, reports" },
  "finance.edit": { label: "Edit finance", hint: "Add and edit transactions, download reports" },
  "clients.view": { label: "View clients", hint: "The pipeline and client details" },
  "clients.manage": { label: "Manage clients", hint: "Move the pipeline, onboarding, reviews" },
  "hr.manage": { label: "HR", hint: "Project rooms, quotations, invoices, challans, Mushok, groups, reports to the CEO" },
  "content.manage": { label: "Website content", hint: "Ads, images, cards, videos, products and services, orders" },
  "shongbidhan.judge": { label: "Shongbidhan judge", hint: "Decide cases and appeals" },
  "reports.view": { label: "Company reports", hint: "Everyone's tasks, daily reports and analytics" },
  "audit.view": { label: "Security log", hint: "Who signed in when, face checks, permission changes" },
};

/** The starting access of each level; the prime admin adds or removes single permissions per person. */
export const LEVEL_PRESET: Record<Level, Perm[]> = {
  prime: ALL_PERMS,
  chief: ["tasks.publish", "tasks.approve", "tasks.review", "teams.approve", "clients.view", "reports.view"],
  hr: ["people.manage", "attendance.manage", "hr.manage", "clients.view", "finance.view", "reports.view"],
  lead: ["tasks.publish", "tasks.approve", "tasks.review", "clients.view"],
  "client-manager": ["clients.view", "clients.manage", "tasks.publish"],
  member: [],
  intern: [],
};

export const LEVEL_LABEL: Record<Level, string> = {
  prime: "Super Prime Admin",
  chief: "Chief",
  hr: "HR",
  lead: "Team Leader",
  "client-manager": "Client Manager",
  member: "Member",
  intern: "Intern",
};

/** Higher ranks first: promotion moves left in this list. */
export const LEVEL_ORDER: Level[] = ["prime", "chief", "hr", "lead", "client-manager", "member", "intern"];

export const DEPT_LABEL: Record<Dept, string> = {
  leadership: "Leadership",
  creative: "Ideas & Creative",
  dev: "Development",
  iot: "IoT",
  ops: "Operations",
  hr: "HR",
  client: "Client",
  rnd: "R&D",
  finance: "Finance",
};

/** Everything the person may do; the prime admin may do everything. */
export function permsOf(p: Pick<Person, "level" | "perms">): Perm[] {
  if (p.level === "prime") return ALL_PERMS;
  return [...new Set(p.perms)];
}

export function can(p: Pick<Person, "level" | "perms"> | null | undefined, perm: Perm): boolean {
  if (!p) return false;
  return p.level === "prime" || p.perms.includes(perm);
}

/* ───────────── labels ───────────── */

export const PRIORITY_ORDER: Priority[] = ["immediate", "urgent", "today", "tomorrow", "this-week", "next-week", "later"];
export const PRIORITY_LABEL: Record<Priority, string> = {
  immediate: "Immediate",
  urgent: "Urgent",
  today: "Today",
  tomorrow: "Tomorrow",
  "this-week": "This week",
  "next-week": "Next week",
  later: "Later",
};

export const RISK_LABEL: Record<Risk, string> = { low: "Low risk", medium: "Medium risk", high: "High risk" };
export const KIND_LABEL: Record<TaskKind, string> = { work: "Work", client: "Client", research: "Research", learning: "Learning project" };
export const STATUS_LABEL: Record<TaskStatus, string> = {
  open: "Open",
  taken: "Taken",
  "in-progress": "In progress",
  submitted: "Submitted",
  "client-review": "Client review",
  done: "Done",
  cancelled: "Cancelled",
};

export const STAGE_ORDER: Stage[] = ["lead", "first-meeting", "proposal", "confirmed", "in-progress", "delivered", "reviewed", "lost"];
export const STAGE_LABEL: Record<Stage, string> = {
  lead: "Lead",
  "first-meeting": "First meeting",
  proposal: "Proposal",
  confirmed: "Confirmed",
  "in-progress": "In progress",
  delivered: "Delivered",
  reviewed: "Reviewed",
  lost: "Lost",
};

/* ───────────── time (Asia/Dhaka, UTC+6, no daylight saving) ───────────── */

const DHAKA_MS = 6 * 60 * 60_000;
export const DAY_MS = 24 * 60 * 60_000;

/** The Dhaka calendar day of an instant. */
export function dhakaDay(at: Iso | number | Date): Day {
  const t = typeof at === "number" ? at : new Date(at).getTime();
  return new Date(t + DHAKA_MS).toISOString().slice(0, 10);
}

/** Midnight that starts a Dhaka day, as an instant. */
export function dayStart(day: Day): number {
  return Date.parse(`${day}T00:00:00.000Z`) - DHAKA_MS;
}

/** A Dhaka wall-clock time on a day ("10:00") as an instant. */
export function atClock(day: Day, clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return dayStart(day) + (h * 60 + (m || 0)) * 60_000;
}

export function addDays(day: Day, n: number): Day {
  return dhakaDay(dayStart(day) + n * DAY_MS + 60_000);
}

/** 0 = Sunday … 6 = Saturday, in Dhaka. */
export function weekdayOf(day: Day): number {
  return new Date(`${day}T12:00:00.000Z`).getUTCDay();
}

/**
 * The lane a due date suggests, seen from now: overdue or due within six
 * hours is "immediate", within twelve "urgent"; then today, tomorrow, the
 * rest of this work week (Saturday–Thursday in Bangladesh), next week, later.
 */
export function priorityFor(due: Iso, now: number): Priority {
  const t = Date.parse(due);
  const left = t - now;
  if (left <= 6 * 60 * 60_000) return "immediate";
  if (left <= 12 * 60 * 60_000) return "urgent";
  const today = dhakaDay(now);
  const dueDay = dhakaDay(t);
  if (dueDay === today) return "today";
  if (dueDay === addDays(today, 1)) return "tomorrow";
  const endOfWeek = addDays(today, (4 - weekdayOf(today) + 7) % 7);
  if (dueDay <= endOfWeek) return "this-week";
  if (dueDay <= addDays(endOfWeek, 7)) return "next-week";
  return "later";
}

/* ───────────── text ───────────── */

/** Words in English or Bangla text (anything between spaces and punctuation). */
export function countWords(text: string): number {
  return text
    .replace(/[।,.;:!?"“”()\[\]{}—–-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Declining a team invitation takes a reasoned note at least this long (Mahir's rule). */
export const DECLINE_MIN_WORDS = 150;

/** "@urgent" or "!urgent" marks a chat message urgent (the Bangla "জরুরি" works too). */
export function isUrgentText(text: string): boolean {
  return /(^|\s)[@!](urgent|জরুরি)(?=\s|$|[।,.!?])/i.test(text);
}

/** People mentioned by handle ("@ishtiak" or the full "@kandari@ishtiak-creatives"). */
export function mentionsIn(text: string, people: Pick<Person, "id" | "handle">[]): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/@([a-z0-9@._-]+)/gi)) {
    const tag = m[1].toLowerCase();
    for (const p of people) {
      const h = p.handle.toLowerCase();
      const short = h.replace(/^kandari@/, "").split("-")[0];
      if (tag === h || tag === h.replace(/^kandari@/, "") || tag === short) found.add(p.id);
    }
  }
  return [...found];
}

/** "kandari@ishtiak-creatives" from a name and department word. */
export function makeHandle(first: string, deptWord: string): string {
  const clean = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "");
  return `kandari@${clean(first)}-${clean(deptWord)}`;
}

/** "kandari-ishtiak-001-26". */
export function makeMemberId(first: string, serial: number, joinedYear: number): string {
  const clean = first.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `kandari-${clean}-${String(serial).padStart(3, "0")}-${String(joinedYear % 100).padStart(2, "0")}`;
}

export const HANDLE_RE = /^kandari@[a-z0-9]+-[a-z0-9]+$/;

/** A whole number with lakh/crore grouping, as Bangladesh writes it: 12,34,567. */
export function num(v: number, digits = 0): string {
  return v.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** BDT: ৳12,34,567; compact: ৳25 lakh, ৳1.2 crore. */
export function taka(n: number, opts: { compact?: boolean } = {}): string {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (opts.compact) {
    if (v >= 1e7) return `${sign}৳${(v / 1e7).toFixed(v >= 1e8 ? 0 : 1)} crore`;
    if (v >= 1e5) return `${sign}৳${(v / 1e5).toFixed(v >= 1e6 ? 0 : 1)} lakh`;
  }
  return `${sign}৳${num(Math.round(v))}`;
}
