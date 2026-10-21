/**
 * Business: the ledger, the client pipeline, HR's project rooms and
 * documents. Mahir's rule: the moment a client is confirmed, a project and
 * its HR discussion room open, and HR owns resources, budget, quotation,
 * invoice, challan and Mushok until a client manager takes over.
 */
import { z } from "zod";
import { can, dhakaDay } from "../rules.ts";
import type { Client, Doc, DocKind, Project, Stage, Txn } from "../types.ts";
import { find, HqError, parse, type Ctx, type Domain } from "./ctx.ts";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const STAGE = z.enum(["lead", "first-meeting", "proposal", "confirmed", "in-progress", "delivered", "reviewed", "lost"]);
const METHOD = z.enum(["bank", "cash", "bkash", "nagad", "card"]);
const txnInput = z.object({
  day,
  kind: z.enum(["income", "expense"]),
  category: z.string().trim().min(2).max(60),
  amount: z.number().positive().max(1e10),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  note: z.string().max(500).default(""),
  method: METHOD.default("bank"),
});
const DOC_PREFIX: Record<DocKind, string> = { quotation: "QT", invoice: "INV", challan: "CH", "mushok-6.3": "MU", contract: "CT", receipt: "RC" };

function client(ctx: Ctx, id: string): Client {
  return find(ctx.db.clients, id, "That client");
}
function hrPeople(ctx: Ctx): string[] {
  return ctx.db.people.filter((p) => p.status === "active" && can(p, "hr.manage")).map((p) => p.id);
}
function needDocs(ctx: Ctx): void {
  if (!can(ctx.me, "hr.manage") && !can(ctx.me, "finance.edit")) throw new HqError("Documents are for HR or finance.", 403);
}

/** A confirmed client gets a project and an HR room straight away. */
function openProject(ctx: Ctx, c: Client): Project {
  const existing = ctx.db.projects.find((p) => p.clientId === c.id && p.status !== "closed");
  if (existing) return existing;
  const roomId = ctx.id("ch");
  const members = [...new Set([...hrPeople(ctx), ...(c.managerId ? [c.managerId] : []), ...(c.leadId ? [c.leadId] : [])])];
  const project: Project = { id: ctx.id("pj"), clientId: c.id, title: `${c.org} — ${c.name}`, budget: c.value, start: dhakaDay(ctx.now), due: dhakaDay(ctx.now + 60 * 86400_000), managerId: c.managerId, status: "setup", channelId: roomId };
  ctx.db.projects.push(project);
  ctx.db.channels.push({ id: roomId, kind: "project", name: c.org.slice(0, 60), topic: `Project room: resources, budget, quotation, invoice, challan, Mushok`, memberIds: members, private: true, createdBy: ctx.me.id, at: ctx.nowIso, refId: project.id });
  ctx.db.messages.push({ id: ctx.id("m"), channelId: roomId, by: ctx.me.id, text: `${c.org} confirmed the project. HR: please set up resources, budget, quotation, invoice, challan and Mushok until a client manager takes over.`, at: ctx.nowIso, fileIds: [], reactions: {}, mentions: [], urgent: false });
  ctx.notify(members, { kind: "task", title: `New project confirmed: ${c.org}`, href: `/hq/chat?c=${roomId}` });
  return project;
}

export const business: Domain = {
  actions: {
    "txn.add": (ctx, p) => {
      ctx.need("finance.edit");
      const v = parse(txnInput, p);
      const t: Txn = { id: ctx.id("tx"), ...v, by: ctx.me.id, at: ctx.nowIso };
      ctx.db.txns.push(t);
      return t.id;
    },
    "txn.edit": (ctx, p) => {
      ctx.need("finance.edit");
      const v = parse(txnInput.partial().extend({ id: z.string() }), p);
      Object.assign(find(ctx.db.txns, v.id, "That transaction"), v);
    },
    "txn.remove": (ctx, p) => {
      ctx.need("finance.edit");
      const { id } = parse(z.object({ id: z.string() }), p);
      ctx.db.txns = ctx.db.txns.filter((t) => t.id !== id);
    },
    "txn.import": (ctx, p) => {
      ctx.need("finance.edit");
      const v = parse(z.object({ rows: z.array(txnInput).min(1).max(2000) }), p);
      for (const r of v.rows) ctx.db.txns.push({ id: ctx.id("tx"), ...r, note: r.note ? `${r.note} (imported)` : "Imported", by: ctx.me.id, at: ctx.nowIso });
      ctx.audit({ kind: "export", detail: `imported ${v.rows.length} transactions` });
      return v.rows.length;
    },

    "client.create": (ctx, p) => {
      ctx.need("clients.manage");
      const v = parse(
        z.object({
          name: z.string().trim().min(2).max(80),
          org: z.string().trim().min(2).max(120),
          contact: z.object({ name: z.string().max(80).default(""), phone: z.string().max(30).default(""), email: z.string().max(120).default("") }),
          sector: z.string().max(60).default("Healthcare"),
          stage: STAGE.default("lead"),
          value: z.number().min(0).max(1e11).default(0),
          source: z.string().max(80).default(""),
          notes: z.string().max(4000).default(""),
          managerId: z.string().optional(),
          firstMeeting: z.string().max(2000).optional(),
        }),
        p,
      );
      const { firstMeeting, ...rest } = v;
      const c: Client = { id: ctx.id("cl"), ...rest, stage: firstMeeting ? "first-meeting" : rest.stage, notes: firstMeeting ? `First meeting (${dhakaDay(ctx.now)}): ${firstMeeting}\n\n${rest.notes}`.trim() : rest.notes, createdAt: ctx.nowIso, stageAt: ctx.nowIso, onboarding: [] };
      ctx.db.clients.push(c);
      if (c.stage === "confirmed") openProject(ctx, c);
      return c.id;
    },
    "client.edit": (ctx, p) => {
      ctx.need("clients.manage");
      const v = parse(
        z.object({
          id: z.string(),
          name: z.string().trim().min(2).max(80).optional(),
          org: z.string().trim().min(2).max(120).optional(),
          contact: z.object({ name: z.string().max(80), phone: z.string().max(30), email: z.string().max(120) }).optional(),
          sector: z.string().max(60).optional(),
          value: z.number().min(0).max(1e11).optional(),
          source: z.string().max(80).optional(),
          notes: z.string().max(8000).optional(),
          managerId: z.string().nullable().optional(),
          leadId: z.string().nullable().optional(),
          teamId: z.string().nullable().optional(),
        }),
        p,
      );
      const c = client(ctx, v.id);
      Object.assign(c, { ...v, managerId: v.managerId === null ? undefined : (v.managerId ?? c.managerId), leadId: v.leadId === null ? undefined : (v.leadId ?? c.leadId), teamId: v.teamId === null ? undefined : (v.teamId ?? c.teamId) });
    },
    "client.stage": (ctx, p) => {
      ctx.need("clients.manage");
      const v = parse(z.object({ id: z.string(), stage: STAGE }), p);
      const c = client(ctx, v.id);
      if (c.stage === v.stage) return;
      c.stage = v.stage as Stage;
      c.stageAt = ctx.nowIso;
      if (v.stage === "confirmed") openProject(ctx, c);
    },
    "client.onboard": (ctx, p) => {
      ctx.need("clients.manage");
      const v = parse(z.object({ id: z.string(), add: z.string().trim().min(2).max(140).optional(), toggle: z.string().optional(), remove: z.string().optional() }), p);
      const c = client(ctx, v.id);
      if (v.add) c.onboarding.push({ id: ctx.id("ob"), item: v.add, done: false });
      if (v.toggle) {
        const it = find(c.onboarding, v.toggle, "That item");
        it.done = !it.done;
      }
      if (v.remove) c.onboarding = c.onboarding.filter((x) => x.id !== v.remove);
    },
    "client.review": (ctx, p) => {
      ctx.need("clients.manage");
      const v = parse(z.object({ id: z.string(), score: z.number().min(0).max(5), text: z.string().trim().max(2000).default("") }), p);
      const c = client(ctx, v.id);
      c.review = { score: v.score, text: v.text, at: ctx.nowIso };
      if (c.stage === "delivered") {
        c.stage = "reviewed";
        c.stageAt = ctx.nowIso;
      }
    },
    "client.remove": (ctx, p) => {
      ctx.need("clients.manage");
      const { id } = parse(z.object({ id: z.string() }), p);
      ctx.db.clients = ctx.db.clients.filter((c) => c.id !== id);
    },

    "project.edit": (ctx, p) => {
      ctx.need("hr.manage");
      const v = parse(z.object({ id: z.string(), title: z.string().trim().min(2).max(140).optional(), budget: z.number().min(0).max(1e11).optional(), start: day.optional(), due: day.optional(), status: z.enum(["setup", "running", "delivered", "closed"]).optional(), teamId: z.string().nullable().optional() }), p);
      const pr = find(ctx.db.projects, v.id, "That project");
      Object.assign(pr, { ...v, teamId: v.teamId === null ? undefined : (v.teamId ?? pr.teamId) });
    },
    /** HR hands the project to the client manager and the team leader. */
    "project.handover": (ctx, p) => {
      ctx.need("hr.manage");
      const v = parse(z.object({ id: z.string(), managerId: z.string(), leaderId: z.string(), note: z.string().max(2000).default("") }), p);
      const pr = find(ctx.db.projects, v.id, "That project");
      ctx.person(v.managerId);
      ctx.person(v.leaderId);
      pr.managerId = v.managerId;
      pr.handedOver = { at: ctx.nowIso, by: ctx.me.id, to: [v.managerId, v.leaderId] };
      if (pr.status === "setup") pr.status = "running";
      const c = ctx.db.clients.find((x) => x.id === pr.clientId);
      if (c) Object.assign(c, { managerId: v.managerId, leadId: v.leaderId, stage: c.stage === "confirmed" ? "in-progress" : c.stage });
      const room = pr.channelId ? ctx.db.channels.find((x) => x.id === pr.channelId) : undefined;
      if (room) {
        room.memberIds = [...new Set([...room.memberIds, v.managerId, v.leaderId])];
        ctx.db.messages.push({ id: ctx.id("m"), channelId: room.id, by: ctx.me.id, text: `Handover: ${ctx.person(v.managerId).name} (client manager) and ${ctx.person(v.leaderId).name} (team leader) now own this project and all client communication.${v.note ? `\n\n${v.note}` : ""}`, at: ctx.nowIso, fileIds: [], reactions: {}, mentions: [v.managerId, v.leaderId], urgent: false });
      }
      ctx.notify([v.managerId, v.leaderId], { kind: "task", title: `Project handed to you: ${pr.title}`, href: room ? `/hq/chat?c=${room.id}` : "/hq/hr" });
    },

    "doc.create": (ctx, p) => {
      needDocs(ctx);
      const v = parse(
        z.object({
          kind: z.enum(["quotation", "invoice", "challan", "mushok-6.3", "contract", "receipt"]),
          clientId: z.string(),
          projectId: z.string().optional(),
          date: day,
          lines: z.array(z.object({ item: z.string().trim().min(1).max(200), qty: z.number().positive().max(1e6), rate: z.number().min(0).max(1e10) })).min(1).max(50),
          vatPct: z.number().min(0).max(100).default(15),
        }),
        p,
      );
      client(ctx, v.clientId);
      const year = v.date.slice(0, 4);
      const d: Doc = { id: ctx.id("dc"), ...v, number: `${DOC_PREFIX[v.kind]}-${year}-${String(ctx.next(DOC_PREFIX[v.kind])).padStart(4, "0")}`, status: "draft", by: ctx.me.id, at: ctx.nowIso };
      ctx.db.docs.push(d);
      return d.id;
    },
    "doc.edit": (ctx, p) => {
      needDocs(ctx);
      const v = parse(z.object({ id: z.string(), date: day.optional(), vatPct: z.number().min(0).max(100).optional(), status: z.enum(["draft", "sent", "paid", "void"]).optional(), lines: z.array(z.object({ item: z.string().trim().min(1).max(200), qty: z.number().positive(), rate: z.number().min(0) })).min(1).max(50).optional() }), p);
      Object.assign(find(ctx.db.docs, v.id, "That document"), v);
    },
    "doc.remove": (ctx, p) => {
      needDocs(ctx);
      const { id } = parse(z.object({ id: z.string() }), p);
      ctx.db.docs = ctx.db.docs.filter((d) => d.id !== id);
    },

    "group.create": (ctx, p) => {
      ctx.need("hr.manage");
      const v = parse(z.object({ name: z.string().trim().min(2).max(60), topic: z.string().max(300).default(""), memberIds: z.array(z.string()).min(1).max(60) }), p);
      for (const m of v.memberIds) ctx.person(m);
      const id = ctx.id("ch");
      const members = [...new Set([ctx.me.id, ...v.memberIds])];
      ctx.db.channels.push({ id, kind: "group", name: v.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "group", topic: v.topic, memberIds: members, private: true, createdBy: ctx.me.id, at: ctx.nowIso });
      ctx.notify(members, { kind: "invite", title: `HR added you to the group "${v.name}"`, href: `/hq/chat?c=${id}` });
      return id;
    },

    /** HR's summary to the CEO: per member, tasks done, points, on-time share, reports sent. */
    "report.ceo": (ctx, p) => {
      ctx.need("hr.manage");
      const v = parse(z.object({ from: day, to: day, note: z.string().max(2000).default("") }), p);
      const rows = ctx.db.people
        .filter((x) => x.status === "active")
        .map((person) => {
          const done = ctx.db.tasks.filter((t) => t.status === "done" && t.submittedAt && dhakaDay(t.submittedAt) >= v.from && dhakaDay(t.submittedAt) <= v.to && (t.takenBy === person.id || ctx.db.teams.some((tm) => tm.id === t.teamId && tm.memberIds.includes(person.id))));
          const onTime = done.filter((t) => Date.parse(t.submittedAt!) <= Date.parse(t.due)).length;
          const points = ctx.db.points.filter((e) => e.personId === person.id && dhakaDay(e.at) >= v.from && dhakaDay(e.at) <= v.to).reduce((s, e) => s + e.points, 0);
          const reports = ctx.db.reports.filter((r) => r.personId === person.id && r.day >= v.from && r.day <= v.to).length;
          return { member: person.name, designation: person.designation, tasksDone: done.length, onTimePct: done.length ? Math.round((onTime / done.length) * 100) : 0, points, dailyReports: reports };
        });
      const ceo = ctx.db.people.find((x) => x.level === "prime");
      const total = rows.reduce((s, r) => s + r.tasksDone, 0);
      if (ceo) ctx.notify(ceo.id, { kind: "system", title: `HR report ${v.from} to ${v.to}: ${total} tasks done`, body: `${rows.filter((r) => r.tasksDone > 0).length} members delivered.${v.note ? ` ${v.note}` : ""}`, href: "/hq/hr" });
      return rows;
    },
  },
};
