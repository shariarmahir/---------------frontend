/**
 * Teams: a member proposes a team (they lead it) and it opens once someone
 * with teams.approve says yes; the leader invites, members accept or decline
 * — declining takes a reasoned note of at least 150 words (Mahir's rule).
 * The leader runs the team: members, emergency sticky notes, what the
 * client was told.
 */
import { z } from "zod";
import { countWords, DECLINE_MIN_WORDS } from "../rules.ts";
import type { Team } from "../types.ts";
import { find, HqError, parse, type Ctx, type Domain } from "./ctx.ts";

function team(ctx: Ctx, id: string): Team {
  return find(ctx.db.teams, id, "That team");
}
function needLeader(ctx: Ctx, t: Team): void {
  if (t.leaderId !== ctx.me.id && ctx.me.level !== "prime") throw new HqError("Only the team's leader can do that.", 403);
}
function inTeam(t: Team, id: string): boolean {
  return t.leaderId === id || t.memberIds.includes(id);
}

/** Opens the team's chat room (once). */
function openRoom(ctx: Ctx, t: Team): void {
  if (t.channelId) return;
  const id = ctx.id("ch");
  ctx.db.channels.push({ id, kind: "team", name: t.name, topic: t.purpose, memberIds: [t.leaderId, ...t.memberIds], private: true, createdBy: t.leaderId, at: ctx.nowIso, refId: t.id });
  t.channelId = id;
}

function sendInvites(ctx: Ctx, t: Team, ids: string[]): void {
  for (const pid of ids) {
    if (inTeam(t, pid) || t.invites.some((i) => i.personId === pid && i.status === "pending")) continue;
    ctx.person(pid);
    t.invites.push({ personId: pid, at: ctx.nowIso, status: "pending" });
    ctx.notify(pid, { kind: "invite", title: `${ctx.person(t.leaderId).name} invited you to the team "${t.name}"`, href: "/hq/teams" });
  }
}

export const teams: Domain = {
  actions: {
    create: (ctx, p) => {
      const v = parse(z.object({ name: z.string().trim().min(2).max(60), purpose: z.string().trim().min(5).max(600), invite: z.array(z.string()).max(20).default([]), clientId: z.string().optional() }), p);
      if (ctx.db.teams.some((t) => t.name.toLowerCase() === v.name.toLowerCase() && t.status !== "archived" && t.status !== "rejected")) throw new HqError("A team with that name already exists.");
      const t: Team = { id: ctx.id("tm"), name: v.name, purpose: v.purpose, leaderId: ctx.me.id, memberIds: [], invites: [], taskIds: [], clientId: v.clientId, status: "pending", createdAt: ctx.nowIso, stickies: [], clientUpdates: [] };
      // Invitations wait until the team is approved; keep the list on the team.
      t.invites = [...new Set(v.invite)].filter((x) => x !== ctx.me.id).map((personId) => ({ personId, at: ctx.nowIso, status: "pending" as const }));
      ctx.db.teams.push(t);
      ctx.ask({ kind: "team", title: `New team "${t.name}" led by ${ctx.me.name}`, detail: t.purpose, refId: t.id, perm: "teams.approve" });
      return t.id;
    },

    invite: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), personIds: z.array(z.string()).min(1).max(20) }), p);
      const t = team(ctx, v.id);
      needLeader(ctx, t);
      if (t.status !== "active") throw new HqError("Invitations go out once the team is approved.");
      sendInvites(ctx, t, v.personIds);
    },

    /** Accept, or decline with at least 150 words of reasons. */
    respond: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), accept: z.boolean(), reason: z.string().max(8000).optional() }), p);
      const t = team(ctx, v.id);
      const inv = t.invites.find((i) => i.personId === ctx.me.id && i.status === "pending");
      if (!inv) throw new HqError("You don't have a pending invitation to this team.");
      if (v.accept) {
        inv.status = "accepted";
        inv.decidedAt = ctx.nowIso;
        if (!t.memberIds.includes(ctx.me.id)) t.memberIds.push(ctx.me.id);
        const room = t.channelId ? ctx.db.channels.find((c) => c.id === t.channelId) : undefined;
        if (room && !room.memberIds.includes(ctx.me.id)) room.memberIds.push(ctx.me.id);
        ctx.notify(t.leaderId, { kind: "invite", title: `${ctx.me.name} joined ${t.name}`, href: `/hq/teams/${t.id}` });
        return;
      }
      const words = countWords(v.reason ?? "");
      if (words < DECLINE_MIN_WORDS) throw new HqError(`Declining needs at least ${DECLINE_MIN_WORDS} words of reasons — ${DECLINE_MIN_WORDS - words} more to go.`);
      inv.status = "declined";
      inv.reason = v.reason;
      inv.decidedAt = ctx.nowIso;
      ctx.notify(t.leaderId, { kind: "invite", title: `${ctx.me.name} declined to join ${t.name}`, body: (v.reason ?? "").slice(0, 280), href: `/hq/teams/${t.id}` });
    },

    remove: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), personId: z.string() }), p);
      const t = team(ctx, v.id);
      needLeader(ctx, t);
      t.memberIds = t.memberIds.filter((x) => x !== v.personId);
      const room = t.channelId ? ctx.db.channels.find((c) => c.id === t.channelId) : undefined;
      if (room) room.memberIds = room.memberIds.filter((x) => x !== v.personId);
      ctx.notify(v.personId, { kind: "system", title: `You were removed from ${t.name}` });
    },

    leave: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const t = team(ctx, id);
      if (t.leaderId === ctx.me.id) throw new HqError("A leader can't leave their own team — archive it or hand it over first.");
      t.memberIds = t.memberIds.filter((x) => x !== ctx.me.id);
      const room = t.channelId ? ctx.db.channels.find((c) => c.id === t.channelId) : undefined;
      if (room) room.memberIds = room.memberIds.filter((x) => x !== ctx.me.id);
      ctx.notify(t.leaderId, { kind: "system", title: `${ctx.me.name} left ${t.name}` });
    },

    handover: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), personId: z.string() }), p);
      const t = team(ctx, v.id);
      needLeader(ctx, t);
      if (!t.memberIds.includes(v.personId)) throw new HqError("Hand the team to one of its members.");
      t.memberIds = [...t.memberIds.filter((x) => x !== v.personId), t.leaderId];
      t.leaderId = v.personId;
      ctx.notify(v.personId, { kind: "system", title: `You now lead ${t.name}`, href: `/hq/teams/${t.id}` });
    },

    "sticky.add": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), text: z.string().trim().min(2).max(500), level: z.enum(["info", "urgent", "crisis"]) }), p);
      const t = team(ctx, v.id);
      if (!inTeam(t, ctx.me.id) && ctx.me.level !== "prime") throw new HqError("Only team members can post notes here.", 403);
      t.stickies.push({ id: ctx.id("sn"), text: v.text, level: v.level, by: ctx.me.id, at: ctx.nowIso });
      if (v.level !== "info") ctx.notify([t.leaderId, ...t.memberIds], { kind: v.level === "crisis" ? "urgent" : "task", title: `${v.level === "crisis" ? "CRISIS" : "Urgent"} note in ${t.name}`, body: v.text, href: `/hq/teams/${t.id}` });
    },
    "sticky.resolve": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), sid: z.string() }), p);
      const t = team(ctx, v.id);
      if (!inTeam(t, ctx.me.id) && ctx.me.level !== "prime") throw new HqError("Only team members can resolve notes.", 403);
      const s = find(t.stickies, v.sid, "That note");
      s.resolved = !s.resolved;
    },

    "client.update": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), text: z.string().trim().min(3).max(2000) }), p);
      const t = team(ctx, v.id);
      needLeader(ctx, t);
      t.clientUpdates.push({ id: ctx.id("cu"), text: v.text, by: ctx.me.id, at: ctx.nowIso });
    },

    edit: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), purpose: z.string().trim().min(5).max(600).optional(), clientId: z.string().nullable().optional() }), p);
      const t = team(ctx, v.id);
      needLeader(ctx, t);
      if (v.purpose) t.purpose = v.purpose;
      if (v.clientId !== undefined) t.clientId = v.clientId ?? undefined;
    },

    archive: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const t = team(ctx, id);
      needLeader(ctx, t);
      t.status = "archived";
      const room = t.channelId ? ctx.db.channels.find((c) => c.id === t.channelId) : undefined;
      if (room) room.archived = true;
    },
  },

  onDecide: {
    team: (ctx, ap, accepted) => {
      const t = find(ctx.db.teams, ap.refId, "That team");
      if (!accepted) {
        t.status = "rejected";
        return;
      }
      t.status = "active";
      t.approvedBy = ctx.me.id;
      openRoom(ctx, t);
      const pending = t.invites.filter((i) => i.status === "pending").map((i) => i.personId);
      t.invites = t.invites.filter((i) => i.status !== "pending");
      sendInvites(ctx, t, pending);
    },
  },
};
