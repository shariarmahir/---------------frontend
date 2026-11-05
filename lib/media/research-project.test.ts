import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canShare, checklist, defaultMilestones, emptyWrite, fileKind, isSheetLink, leading, monthGrid, pollOpen, readiness, shiftMonth, tally, type ResearchProject, type TopicIdea,
} from "./research-project.ts";

const idea = (id: string, votes: TopicIdea["votes"]): TopicIdea => ({ id, title: id, why: "", by: "a", votes });

test("votes: agree counts double, disagree takes away double", () => {
  assert.deepEqual(tally(idea("x", { a: "agree", b: "maybe", c: "disagree" })), { agree: 1, maybe: 1, disagree: 1, score: 1 });
});

test("the leading idea: score, then agrees, then the first", () => {
  const ideas = [idea("a", { p: "agree", q: "disagree" }), idea("b", { p: "maybe", q: "maybe" }), idea("c", { p: "agree", q: "agree", r: "disagree" })];
  // b and c both score 2; c has more agrees.
  assert.equal(leading(ideas)?.id, "c");
  assert.equal(leading(ideas.slice(0, 2))?.id, "b");
  assert.equal(leading([idea("a", {}), idea("b", {})])?.id, "a");
  assert.equal(leading([]), null);
});

test("the poll is open until its last day, and closes once a topic is chosen", () => {
  assert.equal(pollOpen({ topicDeadline: "2026-09-27" }, "2026-09-27"), true);
  assert.equal(pollOpen({ topicDeadline: "2026-09-27" }, "2026-09-28"), false);
  assert.equal(pollOpen({ topicDeadline: "2026-09-27", topicId: "a" }, "2026-09-25"), false);
});

test("files sort by extension; a Google Sheet needs its real address", () => {
  assert.equal(fileKind("Final.PPTX"), "ppt");
  assert.equal(fileKind("paper.pdf"), "pdf");
  assert.equal(fileKind("readings.xlsx"), "data");
  assert.equal(fileKind("photo.jpg"), "other");
  assert.equal(isSheetLink("https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMn/edit#gid=0"), true);
  assert.equal(isSheetLink("https://example.com/spreadsheets/d/1AbCdEfGhIjKlMn"), false);
});

test("a six-week plan from the start day", () => {
  const m = defaultMilestones("2026-09-25");
  assert.equal(m.length, 6);
  assert.equal(m[0].date, "2026-09-28");
  assert.equal(m[5].date, "2026-11-06");
});

test("readiness follows the checklist", () => {
  const p: ResearchProject = {
    id: "p", from: { kind: "lab", id: "l", name: "L" }, members: [{ id: "a", name: "A" }, { id: "b", name: "B" }], leadId: "a", createdAt: "", topicDeadline: "2026-09-27",
    ideas: [idea("t", {})], milestones: [], tasks: [], files: [], write: { ...emptyWrite },
  };
  assert.equal(readiness(p), 0);
  const q: ResearchProject = {
    ...p,
    topicId: "t",
    milestones: defaultMilestones("2026-09-25").map((x, i) => ({ ...x, id: `m${i}` })),
    tasks: [{ id: "1", title: "x", who: "a", status: "todo" }],
    write: { ...emptyWrite, question: "চার্জার কত ওয়াট টানে?", result: "গড়ে ০.১৫ ওয়াট, পাঁচটি চার্জারে।" },
  };
  assert.deepEqual(checklist(q).map((c) => c.done), [true, true, false, false, false]);
  assert.equal(readiness(q), 40);
  assert.equal(canShare(q), true);
  assert.equal(canShare({ ...q, topicId: undefined }), false);
});

test("a month grid starts on Saturday", () => {
  const g = monthGrid("2026-09");
  // 1 September 2026 is a Tuesday: three blanks before it.
  assert.deepEqual(g[0].slice(0, 4), [null, null, null, "2026-09-01"]);
  assert.ok(g.every((w) => w.length === 7));
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
});
