import { test } from "node:test";
import assert from "node:assert/strict";
import {
  challengeProblem, formatsFor, matchProblems, outcome, parseScore, recordResult, respond, resultCaption, sideOf, sortMatches, standings, type TeamMatch,
} from "./team-match.ts";

const m = (x: Partial<TeamMatch>): TeamMatch => ({ id: "m", format: "quiz", title: "কুইজ নাইট", home: "a", away: "b", on: "2026-10-20", status: "invited", by: "anik", at: "2026-10-01T00:00:00Z", ...x });
const done = (id: string, home: string, away: string, h: number, a: number, resultAt = "2026-09-01"): TeamMatch => m({ id, home, away, status: "done", score: { home: h, away: a }, resultAt });

test("suggested formats lead with what both teams play, and every format stays possible", () => {
  assert.equal(formatsFor("sports", "sports")[0], "match");
  assert.equal(formatsFor("esports", "esports")[0], "scrim");
  assert.equal(formatsFor("lab", "project")[0], "build");
  assert.equal(formatsFor("sports", "esports")[0], "quiz");
  for (const f of [formatsFor("family", "travel"), formatsFor("lab", "sports")]) assert.equal(new Set(f).size, 5);
});

test("a team cannot challenge itself, nor a team it already has an open match with", () => {
  assert.equal(challengeProblem("a", "a", []), "নিজের দলকে চ্যালেঞ্জ দেওয়া যায় না।");
  assert.equal(challengeProblem("a", "", []), "দুই দলই বেছে নিন।");
  assert.ok(challengeProblem("a", "b", [m({ home: "b", away: "a", status: "accepted" })]));
  assert.ok(challengeProblem("a", "b", [m({ status: "invited" })]));
  assert.equal(challengeProblem("a", "b", [m({ status: "declined" }), done("x", "a", "b", 1, 0)]), undefined);
});

test("a challenge needs a name, a real day from today on, and short rules and stake", () => {
  const ok = { title: "বিজ্ঞান কুইজ", on: "2026-10-20", rules: "", stake: "" };
  assert.deepEqual(matchProblems(ok, "2026-10-02"), { title: undefined, on: undefined, rules: undefined, stake: undefined });
  assert.ok(matchProblems({ ...ok, title: "কু" }, "2026-10-02").title);
  assert.equal(matchProblems({ ...ok, on: "2026-02-30" }, "2026-01-01").on, "কবে খেলা, তারিখ দিন");
  assert.equal(matchProblems({ ...ok, on: "2026-10-01" }, "2026-10-02").on, "তারিখটা পেরিয়ে গেছে");
  assert.equal(matchProblems({ ...ok, on: "2026-10-02" }, "2026-10-02").on, undefined);
  assert.ok(matchProblems({ ...ok, rules: "ক".repeat(501) }, "2026-10-02").rules);
  assert.ok(matchProblems({ ...ok, stake: "ক".repeat(121) }, "2026-10-02").stake);
});

test("only an invite is answered, and only an accepted match gets a result", () => {
  assert.equal(respond(m({}), true).status, "accepted");
  assert.equal(respond(m({}), false).status, "declined");
  const accepted = m({ status: "accepted" });
  assert.equal(respond(accepted, false), accepted);
  assert.equal(recordResult(m({}), 3, 1, "t").status, "invited");
  const r = recordResult(accepted, 3, 1, "2026-10-20T12:00:00Z");
  assert.deepEqual([r.status, r.score, r.resultAt], ["done", { home: 3, away: 1 }, "2026-10-20T12:00:00Z"]);
  assert.equal(recordResult(r, 0, 9, "t"), r);
});

test("scores are whole numbers 0–999, in Bangla or Latin digits", () => {
  assert.equal(parseScore(" ১২ "), 12);
  assert.equal(parseScore("0"), 0);
  assert.equal(parseScore("999"), 999);
  for (const bad of ["", "-1", "1.5", "1000", "abc", "১০০০"]) assert.equal(parseScore(bad), undefined, bad);
});

test("outcome and side read the match", () => {
  assert.equal(outcome(done("x", "a", "b", 2, 2)), "draw");
  assert.equal(outcome(done("x", "a", "b", 1, 2)), "away");
  assert.equal(outcome(m({ status: "accepted" })), undefined);
  assert.equal(sideOf(m({}), "b"), "away");
  assert.equal(sideOf(m({}), "z"), undefined);
});

test("the table gives 3 for a win and 1 for a draw, then sorts by difference, wins and games played", () => {
  const table = standings([
    done("1", "a", "b", 3, 1),
    done("2", "c", "a", 2, 2),
    done("3", "b", "c", 5, 0),
    m({ id: "4", home: "a", away: "d", status: "accepted" }),
  ]);
  assert.deepEqual(table.map((r) => [r.team, r.played, r.w, r.d, r.l, r.points, r.diff]), [
    ["a", 2, 1, 1, 0, 4, 2],
    ["b", 2, 1, 0, 1, 3, 3],
    ["c", 2, 0, 1, 1, 1, -5],
  ]);
  // Level on everything: the team list's order decides.
  assert.deepEqual(standings([done("5", "x", "y", 1, 1)], ["y", "x"]).map((r) => r.team), ["y", "x"]);
  assert.deepEqual(standings([]), []);
});

test("open matches come first by day, then results newest first", () => {
  const list = sortMatches([
    done("old", "a", "b", 1, 0, "2026-08-01"),
    m({ id: "later", on: "2026-11-01", status: "accepted" }),
    done("new", "a", "b", 1, 0, "2026-09-20"),
    m({ id: "soon", on: "2026-10-05" }),
  ]);
  assert.deepEqual(list.map((x) => x.id), ["soon", "later", "new", "old"]);
});

test("the feed caption names the score, the winner, and the stake only when someone lost", () => {
  const names = { home: "নকলা নাইটস", away: "ভ্যালো ঢাকা" };
  assert.equal(
    resultCaption(done("x", "a", "b", 2, 1), names).split("\n\n").slice(1).join(" | "),
    "নকলা নাইটস 2 – 1 ভ্যালো ঢাকা | নকলা নাইটস জিতেছে!",
  );
  const staked = { ...done("y", "a", "b", 0, 3), stake: "হারলে ১০টা গাছ" };
  assert.ok(resultCaption(staked, names).includes("ভ্যালো ঢাকা জিতেছে!") && resultCaption(staked, names).endsWith("বাজি: হারলে ১০টা গাছ"));
  assert.ok(!resultCaption({ ...done("z", "a", "b", 1, 1), stake: "গাছ" }, names).includes("বাজি"));
  const bn = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
  assert.ok(resultCaption(done("w", "a", "b", 24, 31), names, bn).includes("নকলা নাইটস ২৪ – ৩১ ভ্যালো ঢাকা"));
  assert.equal(resultCaption(m({}), names), "");
});
