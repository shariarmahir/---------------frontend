import { test } from "node:test";
import assert from "node:assert/strict";
import { categories } from "./categories.ts";
import { threads } from "./chat.ts";
import { listings } from "./market.ts";
import { posts } from "./posts.ts";
import { people } from "./users.ts";
import { follows } from "./follows.ts";
import { sampleLabs } from "./labs.ts";
import { sampleClassrooms } from "./classroom.ts";
import { sampleResearch } from "./research.ts";
import { boardPosts, STAGE_FIELDS, UNITS } from "./bazaar.ts";
import { DEFAULT_SUB, fieldsForSub, findSubs, formForSub, inPick, isSubId, resolveSub, SECTIONS } from "./market-sections.ts";
import { districts, divisionOf, divisions } from "../districts.ts";
import { walletSeed } from "./wallet.ts";
import { RATED_TOPICS } from "../../lib/media/schemas.ts";
import { isFairPay } from "../../lib/media/fair-pay.ts";
import { challenges } from "./challenges.ts";
import { civicReports } from "./civic.ts";
import { events } from "./events.ts";
import { jobs } from "./jobs.ts";
import { teams } from "./teams.ts";

const byHandle = new Map(people.map((p) => [p.handle, p]));
const categoryIds = new Set(categories.map((c) => c.id));

function unique(ids: string[], what: string) {
  assert.equal(new Set(ids).size, ids.length, `duplicate ${what} id`);
}

test("ids are unique", () => {
  unique(people.map((p) => p.handle), "person");
  unique(posts.map((p) => p.id), "post");
  unique(listings.map((l) => l.id), "listing");
  unique(threads.map((t) => t.id), "thread");
  unique(walletSeed.txns.map((t) => t.id), "txn");
});

test("categories have sane bands", () => {
  for (const c of categories) assert.ok(c.band.low < c.band.high && c.skills.length > 0, c.id);
});

test("every referenced person exists", () => {
  const refs = [
    ...posts.flatMap((p) => [p.author, ...p.comments.flatMap((c) => [c.author, ...(c.replies ?? []).map((r) => r.author)])]),
    ...listings.map((l) => l.seller),
    ...threads.flatMap((t) => [t.with, ...t.messages.map((m) => m.from)]),
  ];
  for (const h of refs) assert.ok(byHandle.has(h), `unknown handle ${h}`);
});

test("posts and listings tie to real skills", () => {
  for (const p of posts) {
    assert.ok(categoryIds.has(p.category), p.id);
    const rated = RATED_TOPICS.includes(p.topic ?? "skill");
    assert.equal(Boolean(p.skill), rated, `${p.id}: rated topics carry a skill, others none`);
    if (p.skill) {
      assert.ok(p.media.length > 0, `${p.id} needs proof media`);
      const author = byHandle.get(p.author)!;
      assert.ok(author.skills.some((s) => s.skill === p.skill!.name), `${p.id}: ${p.author} lacks ${p.skill.name}`);
    }
    if (p.listingId) {
      const l = listings.find((x) => x.id === p.listingId);
      assert.ok(l, `${p.id} → ${p.listingId}`);
      assert.equal(l!.seller, p.author, `${p.id} listing seller`);
    }
  }
  for (const l of listings) {
    const seller = byHandle.get(l.seller)!;
    assert.ok(seller.skills.some((s) => s.skill === l.skill), `${l.id}: ${l.seller} lacks ${l.skill}`);
    assert.ok(l.floor <= l.price, `${l.id} floor`);
    if (!l.negotiable) assert.equal(l.floor, l.price, `${l.id} fixed price floor`);
  }
});

test("threads match their listings", () => {
  for (const t of threads) {
    if (!t.listingId) continue;
    const l = listings.find((x) => x.id === t.listingId);
    assert.ok(l, t.id);
    assert.equal(t.ask, l!.price, `${t.id} ask`);
    assert.equal(t.floor, l!.floor, `${t.id} floor`);
    assert.equal(t.with, l!.seller, `${t.id} seller`);
  }
});

test("community data: people exist, ids unique, jobs pay fairly", () => {
  unique(jobs.map((j) => j.id), "job");
  unique(events.map((e) => e.id), "event");
  unique(teams.map((t) => t.id), "team");
  unique(civicReports.map((r) => r.id), "civic");
  unique(challenges.map((c) => c.id), "challenge");
  const refs = [
    ...jobs.map((j) => j.poster),
    ...events.map((e) => e.organizer),
    ...teams.flatMap((t) => [t.lead, ...t.members]),
    ...civicReports.flatMap((r) => [...(r.by ? [r.by] : []), ...r.solutions.map((s) => s.by)]),
    ...challenges.map((c) => c.by),
  ];
  for (const h of refs) assert.ok(byHandle.has(h), `unknown handle ${h}`);
  for (const j of jobs) {
    const band = categories.find((c) => c.id === j.sector)!.band;
    assert.ok(isFairPay(j.pay.min, j.pay.unit, band), `${j.id} pays below the floor`);
    assert.ok(j.pay.max >= j.pay.min, `${j.id} pay range`);
  }
  for (const t of teams) assert.equal(t.members[0], t.lead, `${t.id}: lead first`);
  for (const e of events) assert.ok(e.joined <= e.goal, `${e.id} joined`);
});

test("wallet rows disclose fees correctly", () => {
  for (const t of walletSeed.txns) {
    if (t.feeSide === "seller") assert.equal(t.net, t.gross - t.fee, t.id);
    if (t.feeSide === "buyer") assert.equal(Math.abs(t.net), t.gross + t.fee, t.id);
    if (t.feeSide === "none") assert.equal(t.fee, 0, t.id);
    if (t.fee > 0) assert.equal(t.fee, Math.round(t.gross * 0.05), `${t.id} is 5%`);
  }
});

test("the follow graph names real people and nobody follows themselves", () => {
  for (const [h, list] of Object.entries(follows)) {
    assert.ok(byHandle.has(h), `unknown follower ${h}`);
    for (const t of list) assert.ok(byHandle.has(t) && t !== h, `${h} → ${t}`);
    assert.equal(new Set(list).size, list.length, `${h} follows someone twice`);
  }
});

test("64 districts, each in one division, and every member lives in one", () => {
  assert.equal(divisions.length, 8);
  assert.equal(new Set(districts).size, 64);
  for (const p of people) assert.ok(divisionOf(p.district), `${p.handle}: ${p.district}`);
});

test("market sections: unique ids, every item lands in a real sub-section", () => {
  unique(SECTIONS.map((s) => s.id), "section");
  unique(SECTIONS.flatMap((s) => s.subs.map((x) => x.id)), "sub-section");
  for (const id of Object.values(DEFAULT_SUB)) assert.ok(isSubId(id), `default ${id}`);
  for (const l of listings) assert.ok(!l.sub || isSubId(l.sub), `${l.id}: ${l.sub}`);
  for (const p of boardPosts) assert.ok(!p.sub || isSubId(p.sub), `${p.id}: ${p.sub}`);
});

test("market forms ask nothing twice and use known units", () => {
  const stageKeys = new Set(Object.values(STAGE_FIELDS).flat().map((f) => f.key));
  for (const s of SECTIONS)
    for (const sub of s.subs) {
      const keys = fieldsForSub(sub.id).map((f) => f.key);
      assert.equal(new Set(keys).size, keys.length, `${sub.id} repeats a question`);
      if (sub.fields || s.fields) for (const k of keys) assert.ok(!stageKeys.has(k), `${sub.id}.${k} clashes with a seller-stage question`);
      assert.ok(UNITS.includes(formForSub(sub.id).unit), `${sub.id}: unit ${formForSub(sub.id).unit}`);
    }
});

test("buyers find sub-sections by everyday words, and picks read the right signals", () => {
  const ids = (q: string) => findSubs(q).map((r) => r.sub.id);
  assert.ok(ids("জামদানি").includes("gi-textile"));
  assert.ok(ids("mobile").includes("mobile"));
  assert.ok(ids("গরু").includes("cattle"));
  assert.deepEqual(ids(""), []);
  const item = (id: string) => {
    const l = listings.find((x) => x.id === id)!;
    return { sub: resolveSub(l.sub, l.category).sub.id, modes: l.modes ?? ["retail" as const], organic: l.organic, stage: l.stage, tags: l.tags ?? [] };
  };
  assert.ok(inPick(item("l-onion"), "direct"));
  assert.ok(inPick(item("l-jamdani"), "heritage"));
  assert.ok(inPick(item("l-veg-basket"), "organic"));
  assert.ok(!inPick(item("l-tax"), "direct"));
});

test("sample labs: unique numbers, reports due after the lab, hand-ins by members", () => {
  for (const lab of sampleLabs) {
    const ids = new Set(lab.members.map((m) => m.id));
    assert.ok(ids.has(lab.leaderId), `${lab.id}: leader is a member`);
    unique(lab.experiments.map((e) => String(e.no)), `${lab.id} experiment number`);
    for (const e of lab.experiments) {
      assert.ok(e.due.slice(0, 10) >= e.date, `${lab.id} #${e.no}: due before the lab`);
      for (const s of e.submissions) assert.ok(ids.has(s.by), `${lab.id} #${e.no}: ${s.by}`);
    }
  }
  assert.ok(!sampleLabs.some((l) => ["SSC27N", "CSE22B", "BCSPRE"].includes(l.code)), "lab codes never clash with class codes");
});

test("sample research comes from real rooms, by real members, and rooms point back to it", () => {
  const rooms = [...sampleLabs.map((l) => ({ kind: "lab", ...l })), ...sampleClassrooms.map((c) => ({ kind: "classroom", ...c }))];
  unique(sampleResearch.map((r) => r.id), "research");
  for (const r of sampleResearch) {
    const room = rooms.find((x) => x.id === r.from.id && x.kind === r.from.kind);
    assert.ok(room, `${r.id} room`);
    assert.equal(room.name, r.from.name, `${r.id} room name`);
    for (const name of r.team) assert.ok(room.members.some((m) => m.name === name), `${r.id}: ${name} is in ${room.name}`);
  }
  for (const room of rooms) {
    for (const s of room.shares ?? []) if (s.researchId) assert.ok(sampleResearch.some((r) => r.id === s.researchId && r.from.id === room.id), `${room.id} share ${s.id}`);
    if (room.maxMembers) assert.ok(room.members.length <= room.maxMembers, `${room.id} within its member cap`);
  }
});

test("teacher codes are unique, never a class code, and sample papers are complete", async () => {
  const { questionProblem } = await import("../../lib/media/exam-paper.ts");
  const { sampleProjects } = await import("./research.ts");
  const rooms = [...sampleClassrooms, ...sampleLabs];
  const codes = rooms.map((r) => r.code);
  const teacherCodes = rooms.map((r) => r.teacherCode);
  assert.ok(teacherCodes.every((c) => typeof c === "string" && /^[A-Z0-9]{6}$/.test(c)), "every sample has a teacher code");
  unique(teacherCodes as string[], "teacher codes");
  assert.ok(!teacherCodes.some((c) => codes.includes(c!)), "teacher codes differ from class codes");
  for (const c of sampleClassrooms) assert.ok(c.teacher, `${c.id} has a teacher`);
  for (const l of sampleLabs) assert.ok(l.instructor, `${l.id} has a teacher`);
  const papers = [...sampleClassrooms.flatMap((c) => c.exams), ...sampleLabs.flatMap((l) => l.exams)].flatMap((e) => (e.paper ? [e.paper] : []));
  assert.ok(papers.length > 0);
  for (const p of papers) for (const q of p.questions) assert.equal(questionProblem(q), null, q.id);
  for (const p of sampleProjects) {
    const room = rooms.find((r) => r.id === p.from.id)!;
    for (const m of p.members) assert.ok(room.members.some((x) => x.id === m.id), `${p.id}: ${m.id}`);
    for (const i of p.ideas) for (const v of Object.keys(i.votes)) assert.ok(p.members.some((m) => m.id === v), `${i.id} vote by ${v}`);
    for (const t of p.tasks) assert.ok(p.members.some((m) => m.id === t.who), `${t.id} assignee`);
  }
});
