/**
 * The TaskBook (Mahir, 2026-10-21): no fixed tasks — tickets are posted by
 * priority and members take them, solo or as a team. Each taken task has a
 * timeline of milestones, a notebook and files; submitting early earns
 * points, three early in a row is a Quick Silver hat-trick; reviews add
 * accuracy and merits; a client rating of 4.5+ on a team task makes its
 * leader an Iron Man. Also: daily reports, man of the day, help requests
 * (an unanswered one goes to the Shongbidhan), and the celebration wall.
 */
import { z } from "zod";
import { can, dhakaDay } from "../rules.ts";
import { earnsIronMan, earnsQuickSilver, isAdvance, MERIT_LABEL, QUICK_SILVER_POINTS, splitTeamPoints, taskPoints } from "../scoring.ts";
import type { Badge, BadgeKind, HelpRequest, MeritKind, Milestone, NoteKind, PointEntry, Task } from "../types.ts";
import { find, HqError, parse, type Ctx, type Domain } from "./ctx.ts";

const PRIORITY = z.enum(["immediate", "urgent", "today", "tomorrow", "this-week", "next-week", "later"]);
const MILESTONE = z.enum(["meeting", "discussion", "build", "testing", "review", "submit", "custom"]);
const NOTE = z.enum(["text", "heading", "check", "code", "file", "link", "quote"]);
const MERIT = z.enum(["risk-taken", "accuracy", "responsibility", "uniqueness", "brilliant", "best-way", "kindness", "teamwork", "leadership", "never-give-up"]);
const iso = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

const draft = z.object({
  title: z.string().trim().min(3).max(140),
  brief: z.string().trim().max(4000).default(""),
  kind: z.enum(["work", "client", "research", "learning"]).default("work"),
  priority: PRIORITY,
  risk: z.enum(["low", "medium", "high"]).default("low"),
  skills: z.array(z.string().min(1).max(40)).max(12).default([]),
  mode: z.enum(["solo", "team", "either"]).default("either"),
  due: iso,
  estimateHours: z.number().min(0.5).max(400).default(4),
  clientId: z.string().optional(),
  learningSkill: z.string().max(40).optional(),
  milestones: z.array(z.object({ kind: MILESTONE, title: z.string().trim().min(1).max(80), at: iso })).max(20).default([]),
});

function task(ctx: Ctx, id: string): Task {
  return find(ctx.db.tasks, id, "That task");
}

/** The people who work on a task: the solo taker, or the team's leader and members. */
export function workers(ctx: Pick<Ctx, "db">, t: Task): string[] {
  if (t.teamId) {
    const team = ctx.db.teams.find((x) => x.id === t.teamId);
    if (team) return [...new Set([team.leaderId, ...team.memberIds])];
  }
  return t.takenBy ? [t.takenBy] : [];
}

function canWork(ctx: Ctx, t: Task): boolean {
  return ctx.me.level === "prime" || workers(ctx, t).includes(ctx.me.id);
}
function canWrite(ctx: Ctx, t: Task): boolean {
  return canWork(ctx, t) || t.sharedWith.includes(ctx.me.id);
}
function needWork(ctx: Ctx, t: Task): void {
  if (!canWork(ctx, t)) throw new HqError("Only the people working on this task can do that.", 403);
}

function point(ctx: Ctx, e: Omit<PointEntry, "id" | "at">): void {
  ctx.db.points.push({ id: ctx.id("pt"), at: ctx.nowIso, ...e });
}
function badge(ctx: Ctx, personId: string, kind: BadgeKind, note: string, taskId?: string): Badge {
  const b: Badge = { id: ctx.id("bd"), personId, kind, day: dhakaDay(ctx.now), note, taskId };
  ctx.db.badges.push(b);
  return b;
}

function newTask(ctx: Ctx, v: z.infer<typeof draft>): Task {
  const code = `KT-${String(ctx.next("KT")).padStart(4, "0")}`;
  return {
    id: ctx.id("t"),
    code,
    title: v.title,
    brief: v.brief,
    kind: v.kind,
    priority: v.priority,
    risk: v.risk,
    skills: v.skills,
    mode: v.mode,
    createdBy: ctx.me.id,
    createdAt: ctx.nowIso,
    due: new Date(v.due).toISOString(),
    estimateHours: v.estimateHours,
    clientId: v.clientId,
    status: "open",
    milestones: v.milestones.map((m) => ({ id: ctx.id("ms"), kind: m.kind, title: m.title, at: new Date(m.at).toISOString(), done: false })),
    notebook: [],
    fileIds: [],
    sharedWith: [],
    merits: [],
    learningSkill: v.learningSkill,
  };
}

/** Requests past their deadline with nobody helping expire; capable members who saw them face the Shongbidhan. */
export function sweepHelp(ctx: Ctx): void {
  for (const h of ctx.db.help) {
    if (h.status !== "open" || Date.parse(h.deadline) > ctx.now) continue;
    h.status = "expired";
    for (const who of h.seen) {
      if (!h.capable.includes(who) || ctx.db.cases.some((c) => c.helpId === h.id && c.accusedId === who)) continue;
      ctx.db.cases.push({
        id: ctx.id("cs"),
        articleId: "art-help",
        accusedId: who,
        byId: h.by,
        at: ctx.nowIso,
        evidence: `Saw the help request "${h.title}" (skills: ${h.skills.join(", ")}) and did not help before the deadline.`,
        fileIds: [],
        status: "filed",
        helpId: h.id,
      });
      ctx.notify(who, { kind: "case", title: "A Shongbidhan case was filed: an unanswered help request", body: h.title, href: "/hq/shongbidhan" });
    }
  }
}

export const tasks: Domain = {
  actions: {
    /** Publish a ticket (tasks.publish) — or, without it, start a solo TaskBook task that a lead approves. */
    publish: (ctx, p) => {
      const v = parse(draft, p);
      const t = newTask(ctx, v);
      if (can(ctx.me, "tasks.publish")) {
        ctx.db.tasks.push(t);
        const matched = ctx.db.people.filter((x) => x.status === "active" && x.id !== ctx.me.id && x.skills.some((s) => t.skills.includes(s))).map((x) => x.id);
        if (t.priority === "immediate" || t.priority === "urgent") ctx.notify(matched, { kind: "task", title: `${t.priority === "immediate" ? "Immediate" : "Urgent"} ticket: ${t.title}`, href: `/hq/tasks/${t.id}` });
        return t.id;
      }
      Object.assign(t, { status: "taken", takenBy: ctx.me.id, takenAt: ctx.nowIso, approval: "pending", mode: "solo" });
      ctx.db.tasks.push(t);
      ctx.ask({ kind: "solo-taskbook", title: `${ctx.me.name}: ${t.title}`, detail: t.brief || undefined, refId: t.id, perm: "tasks.approve" });
      return t.id;
    },

    /** A learning project for a skill the member is learning (a solo TaskBook that a lead approves). */
    learn: (ctx, p) => {
      const v = parse(z.object({ skill: z.string().min(1).max(40), idea: z.string().trim().min(5).max(1000) }), p);
      const t = newTask(ctx, {
        title: `Learning project: ${v.skill}`,
        brief: v.idea,
        kind: "learning",
        priority: "next-week",
        risk: "low",
        skills: [v.skill],
        mode: "solo",
        due: new Date(ctx.now + 7 * 86400_000).toISOString(),
        estimateHours: 8,
        learningSkill: v.skill,
        milestones: [],
      });
      Object.assign(t, { status: "taken", takenBy: ctx.me.id, takenAt: ctx.nowIso, approval: "pending" });
      ctx.db.tasks.push(t);
      ctx.ask({ kind: "solo-taskbook", title: `Learning project for ${ctx.me.name}: ${v.skill}`, detail: v.idea, refId: t.id, perm: "tasks.approve" });
      return t.id;
    },

    edit: (ctx, p) => {
      const v = parse(draft.partial().extend({ id: z.string() }), p);
      const t = task(ctx, v.id);
      if (t.createdBy !== ctx.me.id && !can(ctx.me, "tasks.publish")) throw new HqError("Only the ticket's author or a publisher can edit it.", 403);
      const rest: Partial<z.infer<typeof draft>> & { id?: string } = { ...v };
      delete rest.id;
      delete rest.milestones;
      Object.assign(t, rest, rest.due ? { due: new Date(rest.due).toISOString() } : {});
    },

    cancel: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const t = task(ctx, id);
      if (t.createdBy !== ctx.me.id && !can(ctx.me, "tasks.publish")) throw new HqError("Only the ticket's author or a publisher can cancel it.", 403);
      t.status = "cancelled";
      ctx.notify(workers(ctx, t), { kind: "task", title: `Cancelled: ${t.title}`, href: `/hq/tasks/${t.id}` });
    },

    take: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), teamId: z.string().optional() }), p);
      const t = task(ctx, v.id);
      if (t.status !== "open") throw new HqError("Someone already took this ticket.");
      if (v.teamId) {
        if (t.mode === "solo") throw new HqError("This ticket is for one person.");
        const team = find(ctx.db.teams, v.teamId, "That team");
        if (team.status !== "active") throw new HqError("That team isn't active yet.");
        if (team.leaderId !== ctx.me.id && ctx.me.level !== "prime") throw new HqError("Only the team's leader can take a ticket for the team.", 403);
        t.teamId = team.id;
        if (!team.taskIds.includes(t.id)) team.taskIds.push(t.id);
        ctx.notify(team.memberIds, { kind: "task", title: `Your team took: ${t.title}`, href: `/hq/tasks/${t.id}` });
      } else if (t.mode === "team") {
        throw new HqError("This ticket needs a team.");
      }
      Object.assign(t, { status: "in-progress", takenBy: ctx.me.id, takenAt: ctx.nowIso });
      if (t.createdBy !== ctx.me.id) ctx.notify(t.createdBy, { kind: "task", title: `${ctx.me.name} took ${t.code}: ${t.title}`, href: `/hq/tasks/${t.id}` });
    },

    release: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const t = task(ctx, id);
      needWork(ctx, t);
      if (t.status !== "taken" && t.status !== "in-progress") throw new HqError("Only a task in progress can be released.");
      const team = t.teamId ? ctx.db.teams.find((x) => x.id === t.teamId) : undefined;
      if (team) team.taskIds = team.taskIds.filter((x) => x !== t.id);
      Object.assign(t, { status: "open", takenBy: undefined, takenAt: undefined, teamId: undefined });
    },

    "milestone.add": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), kind: MILESTONE, title: z.string().trim().min(1).max(80), at: iso }), p);
      const t = task(ctx, v.id);
      needWork(ctx, t);
      const m: Milestone = { id: ctx.id("ms"), kind: v.kind, title: v.title, at: new Date(v.at).toISOString(), done: false };
      t.milestones.push(m);
      t.milestones.sort((a, b) => a.at.localeCompare(b.at));
    },
    "milestone.toggle": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), mid: z.string() }), p);
      const t = task(ctx, v.id);
      needWork(ctx, t);
      const m = find(t.milestones, v.mid, "That milestone");
      m.done = !m.done;
      m.doneAt = m.done ? ctx.nowIso : undefined;
    },
    "milestone.remove": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), mid: z.string() }), p);
      const t = task(ctx, v.id);
      needWork(ctx, t);
      t.milestones = t.milestones.filter((m) => m.id !== v.mid);
    },

    "note.add": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), kind: NOTE, text: z.string().max(20_000).default(""), fileId: z.string().optional(), after: z.string().optional() }), p);
      const t = task(ctx, v.id);
      if (!canWrite(ctx, t)) throw new HqError("You can't write in this notebook.", 403);
      const block = { id: ctx.id("nb"), kind: v.kind as NoteKind, text: v.text, fileId: v.fileId, checked: v.kind === "check" ? false : undefined, by: ctx.me.id, at: ctx.nowIso };
      const at = v.after ? t.notebook.findIndex((b) => b.id === v.after) + 1 : t.notebook.length;
      t.notebook.splice(at > 0 ? at : t.notebook.length, 0, block);
      if (v.fileId && !t.fileIds.includes(v.fileId)) t.fileIds.push(v.fileId);
      if (t.status === "taken") t.status = "in-progress";
      return block.id;
    },
    "note.edit": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), bid: z.string(), text: z.string().max(20_000).optional(), checked: z.boolean().optional(), kind: NOTE.optional() }), p);
      const t = task(ctx, v.id);
      if (!canWrite(ctx, t)) throw new HqError("You can't write in this notebook.", 403);
      const b = find(t.notebook, v.bid, "That block");
      if (v.text !== undefined) b.text = v.text;
      if (v.checked !== undefined) b.checked = v.checked;
      if (v.kind) b.kind = v.kind;
    },
    "note.remove": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), bid: z.string() }), p);
      const t = task(ctx, v.id);
      if (!canWrite(ctx, t)) throw new HqError("You can't write in this notebook.", 403);
      t.notebook = t.notebook.filter((b) => b.id !== v.bid);
    },
    "note.move": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), bid: z.string(), dir: z.union([z.literal(-1), z.literal(1)]) }), p);
      const t = task(ctx, v.id);
      if (!canWrite(ctx, t)) throw new HqError("You can't write in this notebook.", 403);
      const i = t.notebook.findIndex((b) => b.id === v.bid);
      const j = i + v.dir;
      if (i < 0 || j < 0 || j >= t.notebook.length) return;
      [t.notebook[i], t.notebook[j]] = [t.notebook[j], t.notebook[i]];
    },
    "file.attach": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), fileId: z.string() }), p);
      const t = task(ctx, v.id);
      if (!canWrite(ctx, t)) throw new HqError("You can't add files to this task.", 403);
      if (!t.fileIds.includes(v.fileId)) t.fileIds.push(v.fileId);
    },

    share: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), personIds: z.array(z.string()).max(30) }), p);
      const t = task(ctx, v.id);
      needWork(ctx, t);
      const added = v.personIds.filter((x) => !t.sharedWith.includes(x));
      t.sharedWith = [...new Set(v.personIds)];
      ctx.notify(added, { kind: "task", title: `${ctx.me.name} shared a task notebook with you: ${t.title}`, href: `/hq/tasks/${t.id}` });
    },

    /** Submit (early earns more; three early in a row is a Quick Silver hat-trick). */
    submit: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), summary: z.string().trim().min(5).max(4000), link: z.string().url().optional().or(z.literal("")), fileIds: z.array(z.string()).max(20).default([]) }), p);
      const t = task(ctx, v.id);
      needWork(ctx, t);
      if (t.approval === "pending") throw new HqError("This TaskBook task is still waiting for approval.");
      if (t.status !== "in-progress" && t.status !== "taken") throw new HqError("Only a task in progress can be submitted.");
      t.submittedAt = ctx.nowIso;
      t.submission = { summary: v.summary, link: v.link || undefined, fileIds: v.fileIds };
      for (const f of v.fileIds) if (!t.fileIds.includes(f)) t.fileIds.push(f);
      t.status = "submitted";
      const early = isAdvance(t);
      let quickSilver = false;
      if (early && t.takenBy && earnsQuickSilver(t.takenBy, ctx.db.tasks, ctx.db.badges)) {
        quickSilver = true;
        badge(ctx, t.takenBy, "quick-silver", "Hat-trick: three tasks submitted early in a row", t.id);
        point(ctx, { personId: t.takenBy, points: QUICK_SILVER_POINTS, kind: "badge", reason: "Quick Silver hat-trick", taskId: t.id });
        ctx.notify(t.takenBy, { kind: "badge", title: "Quick Silver! Three early submissions in a row", href: "/hq/leaderboard" });
      }
      const reviewers = ctx.db.people.filter((x) => x.status === "active" && x.id !== ctx.me.id && can(x, "tasks.review")).map((x) => x.id);
      ctx.notify(t.createdBy !== ctx.me.id ? [t.createdBy] : reviewers.slice(0, 3), { kind: "task", title: `Submitted for review: ${t.code} ${t.title}`, href: `/hq/tasks/${t.id}` });
      return { early, quickSilver };
    },

    /** Review (tasks.review): accuracy and merits; the task is done and its points are awarded. */
    review: (ctx, p) => {
      const v = parse(
        z.object({
          id: z.string(),
          score: z.number().min(0).max(5),
          accuracy: z.number().min(0).max(5),
          note: z.string().max(2000).optional(),
          merits: z.array(z.object({ kind: MERIT, points: z.number().int().min(1).max(20), to: z.string().optional(), note: z.string().max(300).optional() })).max(10).default([]),
          clientReview: z.boolean().default(false),
        }),
        p,
      );
      ctx.need("tasks.review");
      const t = task(ctx, v.id);
      if (t.status !== "submitted") throw new HqError("Only a submitted task can be reviewed.");
      if (workers(ctx, t).includes(ctx.me.id) && ctx.me.level !== "prime") throw new HqError("You can't review your own task.", 403);
      t.review = { by: ctx.me.id, score: v.score, accuracy: v.accuracy, note: v.note, at: ctx.nowIso };
      const people = workers(ctx, t);
      t.merits = v.merits.map((m) => ({ kind: m.kind as MeritKind, points: Math.min(m.points, MERIT_LABEL[m.kind as MeritKind].max), to: m.to && people.includes(m.to) ? m.to : (t.takenBy ?? people[0]), by: ctx.me.id, at: ctx.nowIso, note: m.note }));
      if (v.clientReview && t.clientId) {
        t.status = "client-review";
        ctx.notify(people, { kind: "task", title: `Reviewed, now with the client: ${t.title}`, href: `/hq/tasks/${t.id}` });
        return;
      }
      award(ctx, t);
    },

    /** The client's rating; 4.5+ on a team task makes the leader an Iron Man. */
    clientReview: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), score: z.number().min(0).max(5), note: z.string().max(2000).optional() }), p);
      if (!can(ctx.me, "clients.manage") && !can(ctx.me, "tasks.review")) throw new HqError("You don't have permission to record a client review.", 403);
      const t = task(ctx, v.id);
      if (t.status !== "client-review" && t.status !== "submitted" && t.status !== "done") throw new HqError("This task hasn't been delivered yet.");
      t.clientReview = { score: v.score, note: v.note, at: ctx.nowIso };
      if (earnsIronMan(t)) {
        const team = ctx.db.teams.find((x) => x.id === t.teamId);
        if (team && !ctx.db.badges.some((b) => b.kind === "iron-man" && b.taskId === t.id)) {
          badge(ctx, team.leaderId, "iron-man", `${team.name} delivered "${t.title}" — client rated ${v.score}/5`, t.id);
          point(ctx, { personId: team.leaderId, points: 40, kind: "badge", reason: "Iron Man", taskId: t.id });
          ctx.notify(team.leaderId, { kind: "badge", title: "Iron Man! Your team's delivery was rated " + v.score + "/5", href: "/hq/leaderboard" });
        }
      }
      if (t.status !== "done") award(ctx, t);
    },

    "report.submit": (ctx, p) => {
      const v = parse(z.object({ done: z.string().trim().min(3).max(3000), blockers: z.string().max(2000).default(""), tomorrow: z.string().max(2000).default(""), mood: z.number().int().min(1).max(5), taskIds: z.array(z.string()).max(20).default([]) }), p);
      const day = dhakaDay(ctx.now);
      const existing = ctx.db.reports.find((r) => r.personId === ctx.me.id && r.day === day);
      if (existing) {
        Object.assign(existing, v, { at: ctx.nowIso });
        return existing.id;
      }
      const r = { id: ctx.id("dr"), personId: ctx.me.id, day, at: ctx.nowIso, ...v };
      ctx.db.reports.push(r);
      point(ctx, { personId: ctx.me.id, points: 2, kind: "daily", reason: "Daily report" });
      return r.id;
    },
    "report.score": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), score: z.number().int().min(0).max(10) }), p);
      ctx.need("tasks.review");
      const r = find(ctx.db.reports, v.id, "That report");
      if (r.personId === ctx.me.id && ctx.me.level !== "prime") throw new HqError("You can't score your own report.", 403);
      r.score = v.score;
    },
    manOfDay: (ctx, p) => {
      const v = parse(z.object({ personId: z.string(), note: z.string().max(300).default("") }), p);
      ctx.need("tasks.review");
      const day = dhakaDay(ctx.now);
      if (ctx.db.badges.some((b) => b.kind === "man-of-the-day" && b.day === day)) throw new HqError("Today's man of the day is already chosen.");
      const who = ctx.person(v.personId);
      badge(ctx, who.id, "man-of-the-day", v.note || "Best daily report");
      point(ctx, { personId: who.id, points: 15, kind: "badge", reason: "Man of the day" });
      ctx.notify(who.id, { kind: "badge", title: "You're today's man of the day!", body: v.note, href: "/hq/leaderboard" });
    },

    "help.ask": (ctx, p) => {
      const v = parse(z.object({ title: z.string().trim().min(3).max(140), detail: z.string().trim().max(3000).default(""), skills: z.array(z.string()).min(1).max(8), taskId: z.string().optional(), hours: z.number().min(1).max(168).default(24) }), p);
      sweepHelp(ctx);
      const capable = ctx.db.people.filter((x) => x.status === "active" && x.id !== ctx.me.id && x.skills.some((s) => v.skills.includes(s))).map((x) => x.id);
      const h: HelpRequest = { id: ctx.id("hp"), by: ctx.me.id, taskId: v.taskId, title: v.title, detail: v.detail, skills: v.skills, capable, seen: [], status: "open", at: ctx.nowIso, deadline: new Date(ctx.now + v.hours * 3600_000).toISOString() };
      ctx.db.help.push(h);
      ctx.notify(capable, { kind: "help", title: `${ctx.me.name} needs help: ${v.title}`, body: v.skills.join(", "), href: "/hq/help" });
      return { id: h.id, capable: capable.length };
    },
    "help.seen": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      sweepHelp(ctx);
      const h = find(ctx.db.help, id, "That request");
      if (h.capable.includes(ctx.me.id) && !h.seen.includes(ctx.me.id)) h.seen.push(ctx.me.id);
    },
    "help.offer": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      sweepHelp(ctx);
      const h = find(ctx.db.help, id, "That request");
      if (h.status !== "open") throw new HqError("This request isn't open any more.");
      if (h.by === ctx.me.id) throw new HqError("You can't help with your own request.");
      h.helperId = ctx.me.id;
      h.status = "helping";
      if (!h.seen.includes(ctx.me.id)) h.seen.push(ctx.me.id);
      ctx.notify(h.by, { kind: "help", title: `${ctx.me.name} is helping with: ${h.title}`, href: "/hq/help" });
    },
    "help.solve": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const h = find(ctx.db.help, id, "That request");
      if (h.by !== ctx.me.id && h.helperId !== ctx.me.id && ctx.me.level !== "prime") throw new HqError("Only the asker or the helper can close this.", 403);
      if (h.status === "solved") return;
      h.status = "solved";
      if (h.helperId) {
        point(ctx, { personId: h.helperId, points: 8, kind: "help", reason: `Helped: ${h.title}` });
        const solved = ctx.db.help.filter((x) => x.helperId === h.helperId && x.status === "solved").length;
        if (solved === 3) badge(ctx, h.helperId, "helper", "Third help request solved");
        ctx.notify(h.helperId, { kind: "help", title: `Thanks! "${h.title}" is solved (+8 points)`, href: "/hq/help" });
      }
    },
    "help.cancel": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const h = find(ctx.db.help, id, "That request");
      if (h.by !== ctx.me.id && ctx.me.level !== "prime") throw new HqError("Only the asker can withdraw this.", 403);
      ctx.db.help = ctx.db.help.filter((x) => x.id !== id);
    },

    "story.create": (ctx, p) => {
      const v = parse(
        z.object({
          title: z.string().trim().min(3).max(140),
          taskId: z.string().optional(),
          challenge: z.string().trim().min(5).max(3000),
          solution: z.string().trim().min(5).max(3000),
          why: z.string().trim().max(3000).default(""),
          moments: z.array(z.string().trim().min(1).max(300)).max(12).default([]),
          fileIds: z.array(z.string()).max(12).default([]),
        }),
        p,
      );
      const t = v.taskId ? task(ctx, v.taskId) : undefined;
      const s = {
        id: ctx.id("st"),
        title: v.title,
        taskId: t?.id,
        teamId: t?.teamId,
        clientId: t?.clientId,
        challenge: v.challenge,
        solution: v.solution,
        why: v.why,
        moments: v.moments.map((text, i) => ({ at: new Date(ctx.now - (v.moments.length - i) * 3600_000).toISOString(), text })),
        fileIds: v.fileIds,
        by: ctx.me.id,
        at: ctx.nowIso,
        cheers: [],
      };
      ctx.db.stories.push(s);
      ctx.notify(ctx.db.people.filter((x) => x.status === "active").map((x) => x.id), { kind: "system", title: `New on the wall: ${s.title}`, href: "/hq/wall" });
      return s.id;
    },
    "story.cheer": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const s = find(ctx.db.stories, id, "That story");
      s.cheers = s.cheers.includes(ctx.me.id) ? s.cheers.filter((x) => x !== ctx.me.id) : [...s.cheers, ctx.me.id];
    },
  },

  onDecide: {
    "solo-taskbook": (ctx, ap, accepted) => {
      const t = find(ctx.db.tasks, ap.refId, "That task");
      t.approval = accepted ? "approved" : "rejected";
      t.status = accepted ? "in-progress" : "cancelled";
    },
  },
};

/** Done: the task's points go to its taker, or split across the team (10% leadership share). */
function award(ctx: Ctx, t: Task): void {
  t.status = "done";
  const total = taskPoints(t);
  const merits = t.merits.reduce((s, m) => s + m.points, 0);
  t.awarded = total;
  const base = total - merits;
  const team = t.teamId ? ctx.db.teams.find((x) => x.id === t.teamId) : undefined;
  const shares = team ? splitTeamPoints(base, team.leaderId, team.memberIds) : t.takenBy ? { [t.takenBy]: base } : {};
  for (const [personId, points] of Object.entries(shares)) {
    if (points) point(ctx, { personId, points, kind: "task", reason: `${t.code} ${t.title}`, taskId: t.id });
  }
  for (const m of t.merits) point(ctx, { personId: m.to, points: m.points, kind: "merit", reason: `${MERIT_LABEL[m.kind].label}: ${t.code}`, taskId: t.id });
  ctx.notify(Object.keys(shares), { kind: "task", title: `Done: ${t.title} (+${total} points)`, href: `/hq/tasks/${t.id}` });
}

