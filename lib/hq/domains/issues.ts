/**
 * The issue board: anyone raises an issue with the people it concerns; a
 * private discussion room opens for them; once solved, the solution and the
 * lesson learned stay in the lessons library.
 */
import { z } from "zod";
import type { Issue } from "../types.ts";
import { find, HqError, parse, type Ctx, type Domain } from "./ctx.ts";

function issue(ctx: Ctx, id: string): Issue {
  return find(ctx.db.issues, id, "That issue");
}
function involved(ctx: Ctx, i: Issue): boolean {
  return i.by === ctx.me.id || i.memberIds.includes(ctx.me.id) || ctx.me.level === "prime";
}

export const issues: Domain = {
  actions: {
    create: (ctx, p) => {
      const v = parse(z.object({ title: z.string().trim().min(3).max(140), detail: z.string().trim().min(5).max(4000), memberIds: z.array(z.string()).max(30).default([]) }), p);
      const members = [...new Set([ctx.me.id, ...v.memberIds])];
      for (const m of members) ctx.person(m);
      const roomId = ctx.id("ch");
      const i: Issue = { id: ctx.id("is"), title: v.title, detail: v.detail, by: ctx.me.id, at: ctx.nowIso, memberIds: members, channelId: roomId, status: "open" };
      ctx.db.channels.push({ id: roomId, kind: "issue", name: v.title.slice(0, 60), topic: "Issue discussion", memberIds: members, private: true, createdBy: ctx.me.id, at: ctx.nowIso, refId: i.id });
      ctx.db.messages.push({ id: ctx.id("m"), channelId: roomId, by: ctx.me.id, text: v.detail, at: ctx.nowIso, fileIds: [], reactions: {}, mentions: [], urgent: false });
      ctx.db.issues.push(i);
      ctx.notify(members, { kind: "task", title: `${ctx.me.name} raised an issue with you: ${v.title}`, href: `/hq/chat?c=${roomId}` });
      return i.id;
    },
    discuss: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const i = issue(ctx, id);
      if (!involved(ctx, i)) throw new HqError("Only the people in this issue can change it.", 403);
      if (i.status === "open") i.status = "discussing";
    },
    solve: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), solution: z.string().trim().min(5).max(4000), lesson: z.string().trim().min(5).max(2000) }), p);
      const i = issue(ctx, v.id);
      if (!involved(ctx, i)) throw new HqError("Only the people in this issue can solve it.", 403);
      Object.assign(i, { status: "solved", solution: v.solution, lesson: v.lesson, solvedAt: ctx.nowIso });
      const room = i.channelId ? ctx.db.channels.find((c) => c.id === i.channelId) : undefined;
      if (room) ctx.db.messages.push({ id: ctx.id("m"), channelId: room.id, by: ctx.me.id, text: `Solved. ${v.solution}\n\nLesson: ${v.lesson}`, at: ctx.nowIso, fileIds: [], reactions: {}, mentions: [], urgent: false });
      ctx.notify(i.memberIds, { kind: "task", title: `Solved: ${i.title}`, body: v.lesson, href: "/hq/issues" });
    },
    reopen: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const i = issue(ctx, id);
      if (!involved(ctx, i)) throw new HqError("Only the people in this issue can reopen it.", 403);
      i.status = "discussing";
    },
  },
};
