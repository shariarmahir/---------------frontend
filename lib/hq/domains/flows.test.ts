import { test } from "node:test";
import assert from "node:assert/strict";
import { seedDb } from "../seed.ts";
import type { HqDb, Person } from "../types.ts";
import { DECIDERS, approvals } from "./approvals.ts";
import { business } from "./business.ts";
import { chat } from "./chat.ts";
import { control } from "./control.ts";
import { HqError, makeCtx } from "./ctx.ts";
import { people } from "./people.ts";
import { system } from "./system.ts";
import { tasks } from "./tasks.ts";
import { teams } from "./teams.ts";
import { time } from "./time.ts";

for (const d of [tasks, teams, time, business, control]) Object.assign(DECIDERS, d.onDecide ?? {});

const NOW = Date.parse("2026-10-21T06:00:00.000Z"); // Wednesday, 12:00 in Dhaka
const H = 3600_000;
const fresh = () => {
  const db = seedDb(NOW, { samples: false });
  db.articles.push({ id: "art-help", part: "Ga", article: "1", section: "301", title: "Answer the call", text: "…", penalty: { kind: "points", text: "10 points", amount: 10 }, crimePoints: 3 });
  return db;
};
const who = (db: HqDb, id: string): Person => db.people.find((p) => p.id === id)!;
const as = (db: HqDb, id: string, at = NOW) => makeCtx(db, who(db, id), at);

test("publish → take → submit early → review awards points to the taker", () => {
  const db = fresh();
  const id = tasks.actions.publish(as(db, "p-mahir"), { title: "Fix the kiosk", priority: "today", risk: "medium", due: new Date(NOW + 30 * H).toISOString(), estimateHours: 4, skills: ["web"] }) as string;
  tasks.actions.take(as(db, "p-mehek"), { id });
  const r = tasks.actions.submit(as(db, "p-mehek", NOW + 2 * H), { id, summary: "Shipped the fix" }) as { early: boolean };
  assert.equal(r.early, true);
  assert.throws(() => tasks.actions.review(as(db, "p-mehek"), { id, score: 5, accuracy: 5 }), HqError);
  tasks.actions.review(as(db, "p-mahir", NOW + 3 * H), { id, score: 5, accuracy: 5, merits: [{ kind: "kindness", points: 5 }] });
  const t = db.tasks.find((x) => x.id === id)!;
  assert.equal(t.status, "done");
  const earned = db.points.filter((e) => e.personId === "p-mehek").reduce((s, e) => s + e.points, 0);
  assert.equal(earned, t.awarded);
  assert.ok(earned > 0);
});

test("a member without publish rights makes a solo TaskBook task that a lead approves", () => {
  const db = fresh();
  const id = tasks.actions.publish(as(db, "p-luban"), { title: "Learn Rust basics", priority: "next-week", due: new Date(NOW + 7 * 24 * H).toISOString() }) as string;
  const ap = db.approvals.find((a) => a.refId === id)!;
  assert.equal(ap.kind, "solo-taskbook");
  approvals.actions.decide(as(db, "p-ishtiak"), { id: ap.id, accepted: true });
  assert.equal(db.tasks.find((t) => t.id === id)!.status, "in-progress");
});

test("declining a team invitation needs 150 words; accepting joins the room", () => {
  const db = fresh();
  const teamId = teams.actions.create(as(db, "p-ishtiak"), { name: "Camp crew", purpose: "Run the village camp", invite: ["p-mehek", "p-luban"] }) as string;
  const ap = db.approvals.find((a) => a.refId === teamId)!;
  approvals.actions.decide(as(db, "p-mahir"), { id: ap.id, accepted: true });
  const team = db.teams.find((t) => t.id === teamId)!;
  assert.equal(team.status, "active");
  assert.throws(() => teams.actions.respond(as(db, "p-luban"), { id: teamId, accept: false, reason: "Too busy this week." }), /150 words/);
  teams.actions.respond(as(db, "p-luban"), { id: teamId, accept: false, reason: Array.from({ length: 150 }, (_, i) => `word${i}`).join(" ") });
  teams.actions.respond(as(db, "p-mehek"), { id: teamId, accept: true });
  assert.ok(team.memberIds.includes("p-mehek"));
  assert.ok(db.channels.find((c) => c.id === team.channelId)!.memberIds.includes("p-mehek"));
});

test("urgent chat messages alert everyone; only leadership posts announcements", () => {
  const db = fresh();
  chat.actions.send(as(db, "p-mehek"), { channelId: "c-general", text: "Server is down @urgent" });
  assert.ok(db.notices.filter((n) => n.kind === "urgent").length >= 5);
  assert.throws(() => chat.actions.send(as(db, "p-mehek"), { channelId: "c-announce", text: "hello" }), HqError);
});

test("check-in after office start + grace is late", () => {
  const db = fresh();
  const r = time.actions.checkin(as(db, "p-mehek"), {}) as { late: boolean; lateMins: number };
  assert.equal(r.late, true);
  assert.equal(r.lateMins, 120);
  assert.throws(() => time.actions.checkin(as(db, "p-mehek"), {}), /already/);
});

test("an unanswered help request becomes a Shongbidhan case for capable members who saw it", () => {
  const db = fresh();
  const { id } = tasks.actions["help.ask"](as(db, "p-mehek"), { title: "Need a PCB review", skills: ["pcb"], hours: 1 }) as { id: string };
  tasks.actions["help.seen"](as(db, "p-sharul"), { id });
  tasks.actions["help.seen"](as(db, "p-mahir", NOW + 2 * H), { id });
  assert.equal(db.help.find((h) => h.id === id)!.status, "expired");
  assert.ok(db.cases.some((c) => c.accusedId === "p-sharul" && c.articleId === "art-help"));
});

test("a fine can't pass a tenth of the wage, and is zero without a wage on record", () => {
  const db = fresh();
  db.articles.push({ id: "art-fine", part: "Uma", article: "1", section: "501", title: "Respect", text: "…", penalty: { kind: "fine", text: "fine", amount: 5000 }, crimePoints: 10 });
  const id = control.actions["case.file"](as(db, "p-jamil"), { articleId: "art-fine", accusedId: "p-luban", evidence: "Mocked a client during the demo call today." }) as string;
  control.actions["case.answer"](as(db, "p-luban"), { id, text: "I'm sorry, it was a joke that went wrong." });
  control.actions["case.verdict"](as(db, "p-mahir"), { id, guilty: true, note: "Apologise to the client.", fine: 5000 });
  assert.equal(db.cases.find((c) => c.id === id)!.verdict!.fine, 0);
});

test("confirming a client opens a project and an HR room", () => {
  const db = fresh();
  const id = business.actions["client.create"](as(db, "p-mahir"), { name: "Dr. Rahman", org: "Bogura Clinic", contact: { name: "Dr. Rahman", phone: "", email: "" }, value: 500000 }) as string;
  business.actions["client.stage"](as(db, "p-mahir"), { id, stage: "confirmed" });
  const project = db.projects.find((p) => p.clientId === id)!;
  assert.ok(project);
  const room = db.channels.find((c) => c.id === project.channelId)!;
  assert.equal(room.kind, "project");
  assert.ok(room.memberIds.includes("p-jamil"));
});

test("only the super prime admin turns the face lock on or off; it starts off", () => {
  const db = fresh();
  assert.equal(db.faceLock, false);
  assert.throws(() => system.actions["faceLock.set"](as(db, "p-sadman"), { on: true }), HqError);
  system.actions["faceLock.set"](as(db, "p-mahir"), { on: true });
  assert.equal(db.faceLock, true);
  assert.ok(db.audit.some((a) => a.kind === "security" && a.detail === "face lock on"));
});

test("nobody can be made super prime admin, and the founder's level never changes", () => {
  const db = fresh();
  assert.throws(() => people.actions.designation(as(db, "p-mahir"), { personId: "p-sadman", designation: "Co-founder", level: "prime" }), HqError);
  assert.throws(() => people.actions.designation(as(db, "p-jamil"), { personId: "p-mahir", designation: "CEO", level: "chief" }), HqError);
  people.actions.designation(as(db, "p-mahir"), { personId: "p-mahir", designation: "Founder & CEO", level: "prime" });
  assert.equal(who(db, "p-mahir").designation, "Founder & CEO");
});
