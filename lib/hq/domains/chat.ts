/**
 * Chat, like Slack or Teams: public channels, private groups, direct
 * messages, and the rooms teams, projects and issues open. "@name" mentions
 * notify that person; "@urgent" / "!urgent" alerts everyone in the room.
 * Only leadership posts in #announcements.
 */
import { z } from "zod";
import { isUrgentText, mentionsIn } from "../rules.ts";
import type { Channel } from "../types.ts";
import { channelVisible } from "../view.ts";
import { find, HqError, parse, type Ctx, type Domain } from "./ctx.ts";

const LEADERSHIP = new Set(["prime", "chief", "hr"]);

function channel(ctx: Ctx, id: string): Channel {
  const c = find(ctx.db.channels, id, "That channel");
  if (!channelVisible(c, ctx.me.id) && ctx.me.level !== "prime") throw new HqError("You're not in that channel.", 403);
  return c;
}
/** Everyone who reads a channel. */
export function audience(ctx: Pick<Ctx, "db">, c: Channel): string[] {
  return c.memberIds.length ? c.memberIds : ctx.db.people.filter((p) => p.status === "active").map((p) => p.id);
}
function canManage(ctx: Ctx, c: Channel): boolean {
  return c.createdBy === ctx.me.id || ctx.me.level === "prime";
}

export const chat: Domain = {
  actions: {
    create: (ctx, p) => {
      const v = parse(
        z.object({
          kind: z.enum(["channel", "group", "dm"]),
          name: z.string().trim().max(60).default(""),
          topic: z.string().trim().max(300).default(""),
          memberIds: z.array(z.string()).max(60).default([]),
          private: z.boolean().default(false),
        }),
        p,
      );
      const members = [...new Set([ctx.me.id, ...v.memberIds])];
      for (const m of members) ctx.person(m);
      if (v.kind === "dm") {
        if (members.length !== 2) throw new HqError("A direct message is between exactly two people.");
        const existing = ctx.db.channels.find((c) => c.kind === "dm" && c.memberIds.length === 2 && members.every((m) => c.memberIds.includes(m)));
        if (existing) return existing.id;
        const other = ctx.person(members.find((m) => m !== ctx.me.id)!);
        const c: Channel = { id: ctx.id("ch"), kind: "dm", name: other.name, topic: "", memberIds: members, private: true, createdBy: ctx.me.id, at: ctx.nowIso };
        ctx.db.channels.push(c);
        return c.id;
      }
      const name = v.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (name.length < 2) throw new HqError("Give the channel a name of at least two letters.");
      if (ctx.db.channels.some((c) => c.kind !== "dm" && c.name === name && !c.archived)) throw new HqError("A channel with that name already exists.");
      const isPrivate = v.kind === "group" || v.private;
      const c: Channel = { id: ctx.id("ch"), kind: v.kind, name, topic: v.topic, memberIds: isPrivate ? members : [], private: isPrivate, createdBy: ctx.me.id, at: ctx.nowIso };
      ctx.db.channels.push(c);
      if (isPrivate) ctx.notify(members, { kind: "invite", title: `${ctx.me.name} added you to #${name}`, href: `/hq/chat?c=${c.id}` });
      return c.id;
    },

    edit: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), name: z.string().trim().min(2).max(60).optional(), topic: z.string().trim().max(300).optional() }), p);
      const c = channel(ctx, v.id);
      if (!canManage(ctx, c)) throw new HqError("Only the channel's creator can change it.", 403);
      if (v.name && c.kind !== "dm") c.name = v.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (v.topic !== undefined) c.topic = v.topic;
    },

    members: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), add: z.array(z.string()).default([]), remove: z.array(z.string()).default([]) }), p);
      const c = channel(ctx, v.id);
      if (!c.private || c.kind === "dm") throw new HqError("Only private rooms have a member list.");
      if (!c.memberIds.includes(ctx.me.id) && ctx.me.level !== "prime") throw new HqError("You're not in that room.", 403);
      for (const m of v.add) ctx.person(m);
      c.memberIds = [...new Set([...c.memberIds.filter((m) => !v.remove.includes(m)), ...v.add])];
      ctx.notify(v.add, { kind: "invite", title: `${ctx.me.name} added you to ${c.kind === "channel" || c.kind === "group" ? "#" : ""}${c.name}`, href: `/hq/chat?c=${c.id}` });
    },

    archive: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const c = channel(ctx, id);
      if (["c-general", "c-announce", "c-urgent", "c-adda"].includes(c.id)) throw new HqError("The office's own channels can't be archived.");
      if (!canManage(ctx, c)) throw new HqError("Only the channel's creator can archive it.", 403);
      c.archived = !c.archived;
    },

    send: (ctx, p) => {
      const v = parse(z.object({ channelId: z.string(), text: z.string().max(8000).default(""), threadOf: z.string().optional(), fileIds: z.array(z.string()).max(10).default([]) }), p);
      const c = channel(ctx, v.channelId);
      if (c.archived) throw new HqError("This channel is archived.");
      if (!v.text.trim() && v.fileIds.length === 0) throw new HqError("Write a message or attach a file.");
      if (c.id === "c-announce" && !LEADERSHIP.has(ctx.me.level)) throw new HqError("Only leadership posts in #announcements.", 403);
      if (v.threadOf) find(ctx.db.messages.filter((m) => m.channelId === c.id), v.threadOf, "That message");
      const readers = audience(ctx, c);
      const mentions = mentionsIn(v.text, ctx.db.people).filter((m) => readers.includes(m));
      const urgent = isUrgentText(v.text) || c.id === "c-urgent";
      const m = { id: ctx.id("m"), channelId: c.id, by: ctx.me.id, text: v.text.trim(), at: ctx.nowIso, threadOf: v.threadOf, fileIds: v.fileIds, reactions: {}, mentions, urgent };
      ctx.db.messages.push(m);
      ctx.db.reads[`${ctx.me.id}:${c.id}`] = ctx.nowIso;
      const where = c.kind === "dm" ? "a direct message" : `${c.kind === "channel" || c.kind === "group" ? "#" : ""}${c.name}`;
      const href = `/hq/chat?c=${c.id}`;
      if (urgent) ctx.notify(readers, { kind: "urgent", title: `Urgent in ${where} from ${ctx.me.name}`, body: v.text.slice(0, 200), href });
      else {
        ctx.notify(mentions, { kind: "mention", title: `${ctx.me.name} mentioned you in ${where}`, body: v.text.slice(0, 200), href });
        if (c.kind === "dm") ctx.notify(readers.filter((r) => !mentions.includes(r)), { kind: "mention", title: `Message from ${ctx.me.name}`, body: v.text.slice(0, 200), href });
      }
      if (ctx.db.messages.length > 20000) ctx.db.messages = ctx.db.messages.slice(-15000);
      return m.id;
    },

    "message.edit": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), text: z.string().trim().min(1).max(8000) }), p);
      const m = find(ctx.db.messages, v.id, "That message");
      channel(ctx, m.channelId);
      if (m.by !== ctx.me.id) throw new HqError("You can only edit your own messages.", 403);
      m.text = v.text;
      m.editedAt = ctx.nowIso;
    },
    "message.delete": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const m = find(ctx.db.messages, id, "That message");
      channel(ctx, m.channelId);
      if (m.by !== ctx.me.id && ctx.me.level !== "prime") throw new HqError("You can only delete your own messages.", 403);
      m.deleted = true;
      m.text = "";
      m.fileIds = [];
    },
    react: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), emoji: z.string().min(1).max(8) }), p);
      const m = find(ctx.db.messages, v.id, "That message");
      channel(ctx, m.channelId);
      const who = m.reactions[v.emoji] ?? [];
      const next = who.includes(ctx.me.id) ? who.filter((x) => x !== ctx.me.id) : [...who, ctx.me.id];
      if (next.length) m.reactions[v.emoji] = next;
      else delete m.reactions[v.emoji];
    },
    pin: (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const m = find(ctx.db.messages, id, "That message");
      channel(ctx, m.channelId);
      m.pinned = !m.pinned;
    },
  },
};
