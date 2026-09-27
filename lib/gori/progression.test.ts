import { test } from "node:test";
import assert from "node:assert/strict";
import { puzzleOf, puzzles, type Answer } from "../../data/gori/puzzles.ts";
import {
  derivedAchievements,
  emptyProgress,
  grant,
  isUnlocked,
  LEVELS,
  levelOf,
  recordLab,
  recordQuiz,
  recordRun,
  totalXp,
  UNLOCKS,
} from "./progression.ts";
import { isSolved, meterValues, nationIndex, nextPuzzle, QUIZ_MAX_XP, scoreOf, starsOf, xpFor } from "./quiz.ts";

const perfect = (n: number): Answer[] => puzzleOf(n)!.decisions.map((d) => d.answer);

test("seven titles, Observer to Civilization Architect", () => {
  assert.equal(LEVELS.length, 7);
  assert.equal(levelOf(0).en, "Observer");
  assert.equal(levelOf(149).number, 1);
  assert.equal(levelOf(150).en, "Problem Mapper");
  assert.equal(levelOf(99999).en, "Civilization Architect");
  assert.equal(levelOf(99999).progress, 1);
});

test("unlocks follow the level, and 'open all' overrides", () => {
  assert.equal(isUnlocked("campaign", 0, false), true);
  assert.equal(isUnlocked("lab", 0, false), false);
  assert.equal(isUnlocked("lab", LEVELS[UNLOCKS.lab.level - 1].at, false), true);
  assert.equal(isUnlocked("future", 0, true), true);
});

test("the same run never pays twice, and only improvement pays", () => {
  let r = recordRun(emptyProgress, "health-access:campaign:rural", "run-a", 60, "t");
  assert.equal(r.xpGained, 180);
  const again = recordRun(r.progress, "health-access:campaign:rural", "run-a", 60, "t");
  assert.equal(again.xpGained, 0);
  assert.equal(totalXp(again.progress), totalXp(r.progress));
  const worse = recordRun(r.progress, "health-access:campaign:rural", "run-b", 40, "t");
  assert.equal(worse.xpGained, 0);
  r = recordRun(r.progress, "health-access:campaign:rural", "run-c", 70, "t");
  assert.equal(r.xpGained, 30);
  assert.equal(totalXp(r.progress), 210);
});

test("a lab experiment counts once", () => {
  const a = recordLab(emptyProgress, "chw>equity", "t");
  assert.equal(a.xpGained, 40);
  assert.equal(recordLab(a.progress, "chw>equity", "t").xpGained, 0);
});

test("quiz scoring, stars and XP", () => {
  const p = puzzleOf(1)!;
  assert.equal(scoreOf(p, perfect(1)), 100);
  assert.deepEqual([undefined, 0, 50, 75, 100].map(starsOf), [0, 0, 1, 2, 3]);
  assert.equal(isSolved(75), true);
  assert.equal(xpFor(1, 100), 150);
  assert.equal(QUIZ_MAX_XP, 4295);
  assert.equal(nextPuzzle({})?.n, 1);
  const all = Object.fromEntries(puzzles.map((q) => [q.n, 100]));
  assert.equal(nationIndex(meterValues(all)), 100);
});

test("quiz results keep the best score", () => {
  let p = recordQuiz(emptyProgress, 3, perfect(3), 100);
  p = recordQuiz(p, 3, perfect(3), 25);
  assert.equal(p.quiz.best[3], 100);
});

test("achievements are granted once and derived from real progress", () => {
  const p = recordQuiz(emptyProgress, 1, perfect(1), 100);
  assert.ok(derivedAchievements(p).includes("theme"));
  const g = grant(p, ["theme"], "t");
  assert.deepEqual(g.fresh, ["theme"]);
  assert.deepEqual(grant(g.progress, ["theme"], "t2").fresh, []);
});
