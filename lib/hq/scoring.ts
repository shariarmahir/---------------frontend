/**
 * The TaskBook's scoring (Mahir, 2026-10-21): points for every task by its
 * priority and risk, adjusted by accuracy and how early it came in; merits
 * for the things a number can't see (uniqueness, kindness, teamwork,
 * leadership, never giving up); the badges (Quick Silver, Iron Man, Man of
 * the day, Luther King); and six-month seasons whose rank can rise or fall.
 * Pure; tested in scoring.test.ts.
 */
import { addDays, DAY_MS, dhakaDay, weekdayOf } from "./rules.ts";
import type { Badge, Case, Day, MeritKind, PointEntry, Priority, Risk, Task } from "./types.ts";

export const PRIORITY_BASE: Record<Priority, number> = {
  immediate: 40,
  urgent: 30,
  today: 20,
  tomorrow: 15,
  "this-week": 12,
  "next-week": 10,
  later: 6,
};

export const RISK_FACTOR: Record<Risk, number> = { low: 1, medium: 1.25, high: 1.5 };

export const MERIT_LABEL: Record<MeritKind, { label: string; max: number }> = {
  "risk-taken": { label: "Risk taken", max: 15 },
  accuracy: { label: "Accuracy", max: 15 },
  responsibility: { label: "Responsibility", max: 10 },
  uniqueness: { label: "Uniqueness", max: 15 },
  brilliant: { label: "Brilliant solution", max: 20 },
  "best-way": { label: "Best way to solve it", max: 15 },
  kindness: { label: "Kindness", max: 10 },
  teamwork: { label: "Teamwork", max: 10 },
  leadership: { label: "Leadership", max: 15 },
  "never-give-up": { label: "Never give up", max: 15 },
};

/** The ticket's face value: what it is worth if done on time with full accuracy. */
export function basePoints(t: Pick<Task, "priority" | "risk" | "estimateHours">): number {
  const size = Math.min(2, 0.75 + t.estimateHours / 16);
  return Math.round(PRIORITY_BASE[t.priority] * RISK_FACTOR[t.risk] * size);
}

/** Whole days between submission and the due time: positive = early, negative = late. */
export function daysEarly(submittedAt: string, due: string): number {
  return (Date.parse(due) - Date.parse(submittedAt)) / DAY_MS;
}

/**
 * Timing factor: +10% per day early up to +30%; late costs 15% per day
 * started, down to −60%. Within the same hour counts as on time.
 */
export function timingFactor(submittedAt: string, due: string): number {
  const d = daysEarly(submittedAt, due);
  if (d >= 0) return 1 + Math.min(0.3, Math.floor(d) * 0.1);
  if (d > -1 / 24) return 1;
  return 1 - Math.min(0.6, Math.ceil(-d) * 0.15);
}

/** Accuracy 0–5 → 0.6–1.0. */
export function accuracyFactor(accuracy: number): number {
  return 0.6 + 0.08 * Math.max(0, Math.min(5, accuracy));
}

/** Final points when a task is done: base × timing × accuracy, plus merits; team tasks split later. */
export function taskPoints(t: Task): number {
  const base = basePoints(t);
  const timing = t.submittedAt ? timingFactor(t.submittedAt, t.due) : 1;
  const acc = t.review ? accuracyFactor(t.review.accuracy) : 1;
  const merits = t.merits.reduce((s, m) => s + m.points, 0);
  return Math.round(base * timing * acc) + merits;
}

/**
 * A team task's points: the leader takes a 10% leadership share off the
 * top, the rest is split evenly across everyone including the leader.
 */
export function splitTeamPoints(total: number, leaderId: string, memberIds: string[]): Record<string, number> {
  const everyone = [...new Set([leaderId, ...memberIds])];
  const lead = Math.round(total * 0.1);
  const each = Math.floor((total - lead) / everyone.length);
  const out: Record<string, number> = {};
  for (const id of everyone) out[id] = each;
  out[leaderId] += lead;
  return out;
}

/* ───────────── Quick Silver: the hat-trick ───────────── */

export const QUICK_SILVER_STREAK = 3;
export const QUICK_SILVER_POINTS = 25;

/** Submitted at least an hour before due. */
export function isAdvance(t: Pick<Task, "submittedAt" | "due">): boolean {
  return Boolean(t.submittedAt) && Date.parse(t.due) - Date.parse(t.submittedAt!) >= 60 * 60_000;
}

/**
 * Does this person's latest submission complete a hat-trick? Their last
 * three submissions (newest first) must all be in advance, and no Quick
 * Silver may already have been awarded from within that run.
 */
export function earnsQuickSilver(personId: string, tasks: Task[], badges: Badge[]): boolean {
  const mine = tasks
    .filter((t) => t.submittedAt && (t.takenBy === personId) && t.status !== "cancelled")
    .sort((a, b) => Date.parse(b.submittedAt!) - Date.parse(a.submittedAt!));
  if (mine.length < QUICK_SILVER_STREAK) return false;
  const run = mine.slice(0, QUICK_SILVER_STREAK);
  if (!run.every(isAdvance)) return false;
  const runIds = new Set(run.map((t) => t.id));
  return !badges.some((b) => b.personId === personId && b.kind === "quick-silver" && b.taskId && runIds.has(b.taskId));
}

/** Iron Man: a team leader whose team's client delivery was rated 4.5 or more. */
export const IRON_MAN_SCORE = 4.5;
export function earnsIronMan(t: Pick<Task, "teamId" | "clientReview">): boolean {
  return Boolean(t.teamId && t.clientReview && t.clientReview.score >= IRON_MAN_SCORE);
}

/* ───────────── seasons and ranks ───────────── */

/** Six-month seasons: January–June and July–December. */
export function seasonOf(day: Day): { id: string; start: Day; end: Day; label: string } {
  const [y, m] = day.split("-").map(Number);
  const first = m <= 6;
  return {
    id: `${y}-${first ? "H1" : "H2"}`,
    start: `${y}-${first ? "01" : "07"}-01`,
    end: `${y}-${first ? "06-30" : "12-31"}`,
    label: `${first ? "Jan–Jun" : "Jul–Dec"} ${y}`,
  };
}

/** The ranks, from a new hand at the oars to the one who steers the fleet. */
export const RANKS = [
  { id: "nobish", label: "Cadet", min: 0 },
  { id: "majhi", label: "Oarsman", min: 150 },
  { id: "sareng", label: "Navigator", min: 400 },
  { id: "kandari", label: "Kandari", min: 800 },
  { id: "maha", label: "Grand Kandari", min: 1400 },
] as const;
export type RankId = (typeof RANKS)[number]["id"];

export function rankFor(points: number): (typeof RANKS)[number] {
  let r: (typeof RANKS)[number] = RANKS[0];
  for (const x of RANKS) if (points >= x.min) r = x;
  return r;
}

/** Points earned in a span of days (inclusive). */
export function pointsBetween(entries: PointEntry[], personId: string, from: Day, to: Day): number {
  return entries
    .filter((e) => e.personId === personId && dhakaDay(e.at) >= from && dhakaDay(e.at) <= to)
    .reduce((s, e) => s + e.points, 0);
}

/**
 * At a season's end the rank is re-earned: it moves to the rank the
 * season's points reach, up or down, but never more than one step down.
 */
export function nextRank(current: RankId, seasonPoints: number): RankId {
  const idx = RANKS.findIndex((r) => r.id === current);
  const earned = RANKS.findIndex((r) => r.id === rankFor(seasonPoints).id);
  return RANKS[Math.max(earned, idx - 1, 0)].id;
}

/** Leaderboard rows for a span, highest first. */
export function leaderboard(entries: PointEntry[], personIds: string[], from: Day, to: Day): { personId: string; points: number }[] {
  return personIds
    .map((personId) => ({ personId, points: pointsBetween(entries, personId, from, to) }))
    .sort((a, b) => b.points - a.points || a.personId.localeCompare(b.personId));
}

/* ───────────── Shongbidhan: crime points and the week's Luther King ───────────── */

/** The Saturday that starts the work week a day falls in. */
export function weekStart(day: Day): Day {
  return addDays(day, -((weekdayOf(day) + 1) % 7));
}

/** Crime points from guilty verdicts in a span. */
export function crimePoints(cases: Case[], articlePoints: Record<string, number>, from: Day, to: Day): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of cases) {
    if (!c.verdict?.guilty || c.appeal?.outcome === "overturned") continue;
    const d = dhakaDay(c.verdict.at);
    if (d < from || d > to) continue;
    out[c.accusedId] = (out[c.accusedId] ?? 0) + (articlePoints[c.articleId] ?? 0);
  }
  return out;
}

/** The week's "Luther King": the highest crime points that week (ties: nobody, to be fair). */
export function lutherKing(cases: Case[], articlePoints: Record<string, number>, weekOf: Day): string | null {
  const from = weekStart(weekOf);
  const pts = crimePoints(cases, articlePoints, from, addDays(from, 6));
  const rows = Object.entries(pts).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0 || rows[0][1] <= 0) return null;
  if (rows.length > 1 && rows[1][1] === rows[0][1]) return null;
  return rows[0][0];
}

/**
 * Fines are capped at a tenth of the month's wage across the month
 * (Bangladesh Labour Act 2006, s. 25 limits deductions for fines to one
 * tenth of a wage period's pay, after the worker could show cause).
 */
export const FINE_CAP_SHARE = 0.1;
export function fineAllowed(requested: number, wage: number | undefined, finedThisMonth: number): number {
  if (!wage || wage <= 0) return 0;
  return Math.max(0, Math.min(requested, Math.floor(wage * FINE_CAP_SHARE) - finedThisMonth));
}
