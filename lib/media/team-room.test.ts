import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addStory, canEditRoom, nameTag, daysTo, EMPTY_ROOM, goalProgress, goalState, MAX_STORIES, missionProblem, sortGoals, storyCaption, storyProblems, storyTags, timeline, toggleGoal, validDay,
  type TeamGoal, type TeamStory,
} from "./team-room.ts";

const goal = (g: Partial<TeamGoal>): TeamGoal => ({ id: "g", title: "লক্ষ্য", done: false, ...g });
const story = (s: Partial<TeamStory>): TeamStory => ({ id: "s", kind: "story", title: "গল্প", body: "লেখা", by: "anik", byName: "অনিক", at: "2026-09-01T00:00:00Z", ...s });

test("the lead and members write in the room; others and signed-out visitors only read", () => {
  const team = { lead: "anik", members: ["anik", "rupa"] };
  assert.equal(canEditRoom(team, "anik"), true);
  assert.equal(canEditRoom(team, "rupa"), true);
  assert.equal(canEditRoom(team, "mahir"), false);
  assert.equal(canEditRoom(team, "mahir", "requested"), false);
  assert.equal(canEditRoom(team, "mahir", "member"), true);
  assert.equal(canEditRoom(team, undefined, "member"), false);
});

test("a story needs a title of four letters and a line of words, within the caps", () => {
  assert.deepEqual(storyProblems({ title: "  প্রথম জয়  ", body: "জেলা টুর্নামেন্টে প্রথম ম্যাচ জিতলাম।" }), { title: undefined, body: undefined });
  assert.equal(storyProblems({ title: "জয়", body: "জেলা টুর্নামেন্টে প্রথম ম্যাচ।" }).title, "অন্তত ৪ অক্ষরের একটি শিরোনাম দিন");
  assert.equal(storyProblems({ title: "ক".repeat(121), body: "জেলা টুর্নামেন্টে প্রথম ম্যাচ।" }).title, "শিরোনাম একটু ছোট করুন");
  assert.equal(storyProblems({ title: "প্রথম জয়", body: "   জিতলাম " }).body, "কী ঘটল, অন্তত এক লাইনে লিখুন");
  assert.equal(storyProblems({ title: "প্রথম জয়", body: "ক".repeat(2001) }).body, "লেখাটা বেশি বড় — একটু ছোট করুন");
  assert.equal(missionProblem("ছোট"), "মিশনটা অন্তত এক লাইনে লিখুন");
  assert.equal(missionProblem("গ্রামের প্রতিটি স্কুলে বিশুদ্ধ পানি।"), undefined);
  assert.equal(missionProblem("ক".repeat(401)), "মিশন ছোট রাখুন — এক-দুই বাক্যে");
});

test("only real calendar days are kept", () => {
  assert.equal(validDay("2026-10-15"), "2026-10-15");
  assert.equal(validDay(" 2028-02-29 "), "2028-02-29");
  for (const bad of ["", "2026-02-30", "2026-13-01", "15-10-2026", "tomorrow", undefined]) assert.equal(validDay(bad), undefined, String(bad));
  assert.equal(daysTo("2026-10-05", "2026-10-02"), 3);
  assert.equal(daysTo("2026-09-30", "2026-10-02"), -2);
});

test("goals read as met, late, due within a week, or open", () => {
  const today = "2026-10-02";
  assert.equal(goalState(goal({ done: true, due: "2026-09-01" }), today), "done");
  assert.equal(goalState(goal({ due: "2026-10-01" }), today), "late");
  assert.equal(goalState(goal({ due: "2026-10-02" }), today), "soon");
  assert.equal(goalState(goal({ due: "2026-10-09" }), today), "soon");
  assert.equal(goalState(goal({ due: "2026-10-10" }), today), "open");
  assert.equal(goalState(goal({}), today), "open");
});

test("open goals come first by nearest day, undated after them, met goals last and newest first", () => {
  const sorted = sortGoals([
    goal({ id: "met-old", done: true, doneAt: "2026-09-01" }),
    goal({ id: "free" }),
    goal({ id: "far", due: "2026-12-01" }),
    goal({ id: "met-new", done: true, doneAt: "2026-09-20" }),
    goal({ id: "near", due: "2026-10-05" }),
  ]);
  assert.deepEqual(sorted.map((g) => g.id), ["near", "far", "free", "met-new", "met-old"]);
});

test("progress counts met goals, and an empty list is zero rather than a division by zero", () => {
  assert.deepEqual(goalProgress([]), { done: 0, total: 0, pct: 0 });
  assert.deepEqual(goalProgress([goal({ done: true }), goal({}), goal({})]), { done: 1, total: 3, pct: 33 });
});

test("meeting a goal stamps the day; reopening clears it; the others are untouched", () => {
  const room = { ...EMPTY_ROOM, goals: [goal({ id: "a" }), goal({ id: "b" })] };
  const met = toggleGoal(room, "a", "2026-10-02T10:00:00Z");
  assert.deepEqual(met.goals[0], { id: "a", title: "লক্ষ্য", done: true, doneAt: "2026-10-02T10:00:00Z" });
  assert.equal(met.goals[1], room.goals[1]);
  const back = toggleGoal(met, "a", "x");
  assert.equal(back.goals[0].done, false);
  assert.equal(back.goals[0].doneAt, undefined);
});

test("the timeline is newest first and never grows past its cap", () => {
  assert.deepEqual(timeline([story({ id: "old" }), story({ id: "new", at: "2026-09-20T00:00:00Z" })]).map((s) => s.id), ["new", "old"]);
  let room = EMPTY_ROOM;
  for (let i = 0; i < MAX_STORIES + 5; i++) room = addStory(room, story({ id: `s${i}` }));
  assert.equal(room.stories.length, MAX_STORIES);
  assert.equal(room.stories[0].id, `s${MAX_STORIES + 4}`);
  assert.equal(EMPTY_ROOM.stories.length, 0);
});

test("the feed caption leads with the kind and title and ends with the team; tags are unique", () => {
  assert.equal(
    storyCaption({ kind: "journey", title: " প্রথম প্রোটোটাইপ ", body: " ৳৯০০-তে সেন্সর বানালাম। " }, "বুয়েট আইওটি ল্যাব"),
    "যাত্রা · প্রথম প্রোটোটাইপ\n\n৳৯০০-তে সেন্সর বানালাম।\n\nটিম: বুয়েট আইওটি ল্যাব",
  );
  assert.equal(storyCaption({ kind: "mission", title: "আমাদের মিশন", body: "" }, "নকলা নাইটস"), "মিশন · আমাদের মিশন\n\nটিম: নকলা নাইটস");
  const tags = storyTags("goal", "লোকাল বাস কোথায়", "লোকাল বাসের লাইভ ম্যাপ লোকাল");
  assert.equal(tags[0], "#লক্ষ্য");
  assert.ok(tags.includes("#লোকাল_বাস_কোথায়"));
  assert.equal(new Set(tags).size, tags.length);
  assert.ok(tags.every((t) => t.startsWith("#") && !/\s/.test(t)));
});

test("the team's tag keeps whole words and drops dashes", () => {
  assert.equal(nameTag("বুয়েট আইওটি ও এমবেডেড ল্যাব"), "বুয়েট_আইওটি_ও_এমবেডেড_ল্যাব");
  assert.equal(nameTag("বান্দরবান ট্রেক — অক্টোবর"), "বান্দরবান_ট্রেক_অক্টোবর");
  const long = nameTag("এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ এগারো বারো");
  assert.ok(long.length <= 32 && long.startsWith("এক_দুই_তিন") && !long.endsWith("_"), long);
  assert.ok("এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ এগারো বারো".startsWith(long.replace(/_/g, " ") + " "), "stops at a whole word");
  assert.equal(nameTag("অতিদীর্ঘনামযাএকটিমাত্রশব্দেলেখাহয়েছেএবংভাঙাযাবেনা"), "অতিদীর্ঘনামযাএকটিমাত্রশব্দেলেখাহয়েছেএবংভাঙাযাবেনা");
});
