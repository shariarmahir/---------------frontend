/**
 * টিম বনাম টিম: one team challenges another — a match, a build-off, a quiz,
 * or a contest of good work — the other accepts, they play, the score goes
 * on the league table and, if they want, on the feed.
 * Pure rules here, tested in team-match.test.ts.
 */

import type { TeamKind } from "@/data/media/types";

export type MatchFormat = "match" | "scrim" | "build" | "quiz" | "service";

export const FORMATS: Record<MatchFormat, { bn: string; hint: string; unit: string }> = {
  match: { bn: "খেলার ম্যাচ", hint: "মাঠে মুখোমুখি — ক্রিকেট, ফুটবল, ব্যাডমিন্টন", unit: "স্কোর" },
  scrim: { bn: "ই-স্পোর্টস ম্যাচ", hint: "একই গেমে, একই নিয়মে — বেস্ট অফ থ্রি", unit: "রাউন্ড" },
  build: { bn: "বানানোর লড়াই", hint: "একই সমস্যা, একই সময় — বিচারকেরা নম্বর দেন", unit: "নম্বর" },
  quiz: { bn: "কুইজ", hint: "বিজ্ঞান, ইতিহাস, সাধারণ জ্ঞান — দলে দলে", unit: "পয়েন্ট" },
  service: { bn: "ভালো কাজের লড়াই", hint: "কে বেশি গাছ লাগায়, কে বেশি এলাকা পরিষ্কার করে", unit: "কাজ" },
};

/** Formats that suit both teams first, then the ones any two teams can play. */
export function formatsFor(a: TeamKind, b: TeamKind): MatchFormat[] {
  const fit = (k: TeamKind): MatchFormat[] =>
    k === "sports" ? ["match"] : k === "esports" ? ["scrim"] : k === "lab" || k === "project" ? ["build"] : [];
  const shared = fit(a).filter((f) => fit(b).includes(f));
  return [...new Set<MatchFormat>([...shared, "quiz", "service", "build", "match", "scrim"])];
}

export type MatchStatus = "invited" | "accepted" | "declined" | "done";

export interface TeamMatch {
  id: string;
  format: MatchFormat;
  title: string;
  /** The challenger. */
  home: string;
  /** The challenged. */
  away: string;
  /** Match day, YYYY-MM-DD. */
  on: string;
  place?: string;
  rules?: string;
  /** What the loser does — kept friendly: plant trees, treat the winners. */
  stake?: string;
  status: MatchStatus;
  /** Who sent it (a handle) and when. */
  by: string;
  at: string;
  score?: { home: number; away: number };
  resultAt?: string;
  postId?: string;
}

export const TITLE_MAX = 100;
export const RULES_MAX = 500;
export const STAKE_MAX = 120;
export const SCORE_MAX = 999;

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
function realDay(raw: string): boolean {
  const m = raw.match(DAY);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** Still to be played or answered. */
export const isOpen = (m: TeamMatch) => m.status === "invited" || m.status === "accepted";

/** Why `from` cannot challenge `to` right now, or undefined. */
export function challengeProblem(from: string, to: string, matches: TeamMatch[]): string | undefined {
  if (!from || !to) return "দুই দলই বেছে নিন।";
  if (from === to) return "নিজের দলকে চ্যালেঞ্জ দেওয়া যায় না।";
  if (matches.some((m) => isOpen(m) && ((m.home === from && m.away === to) || (m.home === to && m.away === from)))) return "এই দুই দলের একটা লড়াই এখনো চলছে — সেটা শেষ হোক আগে।";
  return undefined;
}

export interface MatchDraft {
  title: string;
  on: string;
  rules: string;
  stake: string;
}

/** A challenge needs a name, a real day from today on, and short rules and stake. */
export function matchProblems(d: MatchDraft, today: string): { title?: string; on?: string; rules?: string; stake?: string } {
  const title = d.title.trim();
  const on = d.on.trim();
  return {
    title: title.length < 4 ? "লড়াইয়ের একটা নাম দিন (অন্তত ৪ অক্ষর)" : title.length > TITLE_MAX ? "নামটা একটু ছোট করুন" : undefined,
    on: !realDay(on) ? "কবে খেলা, তারিখ দিন" : on < today ? "তারিখটা পেরিয়ে গেছে" : undefined,
    rules: d.rules.trim().length > RULES_MAX ? "নিয়ম ছোট রাখুন" : undefined,
    stake: d.stake.trim().length > STAKE_MAX ? "বাজি ছোট রাখুন" : undefined,
  };
}

/** The challenged team answers; only an invite can be answered. */
export function respond(m: TeamMatch, accept: boolean): TeamMatch {
  if (m.status !== "invited") return m;
  return { ...m, status: accept ? "accepted" : "declined" };
}

/** A whole number from 0 to SCORE_MAX, or undefined. */
export function parseScore(raw: string): number | undefined {
  const t = raw.trim().replace(/[০-৯]/g, (c) => String(c.charCodeAt(0) - 0x09e6));
  if (!/^\d{1,3}$/.test(t)) return undefined;
  const n = Number(t);
  return n <= SCORE_MAX ? n : undefined;
}

/** Only an accepted match gets a result. */
export function recordResult(m: TeamMatch, home: number, away: number, at: string): TeamMatch {
  if (m.status !== "accepted") return m;
  return { ...m, status: "done", score: { home, away }, resultAt: at };
}

export type Outcome = "home" | "away" | "draw";

export function outcome(m: TeamMatch): Outcome | undefined {
  if (m.status !== "done" || !m.score) return undefined;
  return m.score.home === m.score.away ? "draw" : m.score.home > m.score.away ? "home" : "away";
}

/** Which side a team plays, if any. */
export function sideOf(m: TeamMatch, team: string): "home" | "away" | undefined {
  return m.home === team ? "home" : m.away === team ? "away" : undefined;
}

export interface Standing {
  team: string;
  played: number;
  w: number;
  d: number;
  l: number;
  /** Win 3, draw 1. */
  points: number;
  /** Points scored minus conceded. */
  diff: number;
}

/**
 * The league table over finished matches: points, then difference, then
 * wins, then fewer games played; ties keep the team list's order.
 * Teams that have not played are left out.
 */
export function standings(matches: TeamMatch[], order: string[] = []): Standing[] {
  const rows = new Map<string, Standing>();
  const row = (team: string) => {
    let r = rows.get(team);
    if (!r) rows.set(team, (r = { team, played: 0, w: 0, d: 0, l: 0, points: 0, diff: 0 }));
    return r;
  };
  for (const m of matches) {
    const o = outcome(m);
    if (!o || !m.score) continue;
    const h = row(m.home);
    const a = row(m.away);
    h.played++;
    a.played++;
    h.diff += m.score.home - m.score.away;
    a.diff += m.score.away - m.score.home;
    if (o === "draw") {
      h.d++;
      a.d++;
      h.points++;
      a.points++;
    } else {
      const [win, lose] = o === "home" ? [h, a] : [a, h];
      win.w++;
      win.points += 3;
      lose.l++;
    }
  }
  const rank = (t: string) => {
    const i = order.indexOf(t);
    return i === -1 ? Infinity : i;
  };
  return [...rows.values()].sort((x, y) => y.points - x.points || y.diff - x.diff || y.w - x.w || x.played - y.played || rank(x.team) - rank(y.team));
}

/** Open matches by day, then finished ones newest first. */
export function sortMatches(list: TeamMatch[]): TeamMatch[] {
  return [...list].sort((a, b) => {
    const ao = isOpen(a);
    const bo = isOpen(b);
    if (ao !== bo) return ao ? -1 : 1;
    return ao ? a.on.localeCompare(b.on) : (b.resultAt ?? b.on).localeCompare(a.resultAt ?? a.on);
  });
}

/** The feed caption for a finished match; `num` writes the score in the reader's digits. */
export function resultCaption(m: TeamMatch, names: { home: string; away: string }, num: (n: number) => string = String): string {
  const o = outcome(m);
  if (!o || !m.score) return "";
  const line = `${names.home} ${num(m.score.home)} – ${num(m.score.away)} ${names.away}`;
  const verdict = o === "draw" ? "ড্র — দুই দলই সমান লড়েছে।" : `${o === "home" ? names.home : names.away} জিতেছে!`;
  const stake = m.stake && o !== "draw" ? `বাজি: ${m.stake}` : "";
  return [`টিম বনাম টিম · ${FORMATS[m.format].bn} · ${m.title.trim()}`, line, verdict, stake].filter(Boolean).join("\n\n");
}
