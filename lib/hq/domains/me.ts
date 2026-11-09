/** A member's own things: profile, connections, to-dos, notes, alerts, read marks. */
import { z } from "zod";
import { find, HqError, parse, type Domain } from "./ctx.ts";

const profile = z.object({
  phone: z.string().max(20).optional(),
  photo: z.string().max(400_000).nullable().optional(),
  skills: z.array(z.string().min(1).max(40)).max(30).optional(),
  learning: z.array(z.string().min(1).max(40)).max(15).optional(),
});

export const me: Domain = {
  actions: {
    profile: (ctx, p) => {
      const v = parse(profile, p);
      Object.assign(ctx.person(ctx.me.id), v);
    },

    /** Ask to connect; if they had already asked you, you are connected. */
    connect: (ctx, p) => {
      const { personId } = parse(z.object({ personId: z.string() }), p);
      if (personId === ctx.me.id) throw new HqError("You can't connect with yourself.");
      const me = ctx.person(ctx.me.id);
      const them = ctx.person(personId);
      if (me.connections.includes(personId)) return;
      if (them.asked.includes(me.id)) {
        them.asked = them.asked.filter((x) => x !== me.id);
        me.connections.push(personId);
        them.connections.push(me.id);
        ctx.notify(personId, { kind: "system", title: `${me.name} is now connected with you`, href: `/hq/people/${me.id}` });
        return;
      }
      if (!me.asked.includes(personId)) me.asked.push(personId);
      ctx.notify(personId, { kind: "invite", title: `${me.name} wants to connect`, href: `/hq/people/${me.id}` });
    },
    disconnect: (ctx, p) => {
      const { personId } = parse(z.object({ personId: z.string() }), p);
      const me = ctx.person(ctx.me.id);
      const them = ctx.person(personId);
      me.connections = me.connections.filter((x) => x !== personId);
      them.connections = them.connections.filter((x) => x !== me.id);
      me.asked = me.asked.filter((x) => x !== personId);
    },

    "todo.add": (ctx, p) => {
      const v = parse(z.object({ text: z.string().trim().min(1).max(300), due: z.string().optional(), urgent: z.boolean().optional() }), p);
      const t = { id: ctx.id("td"), personId: ctx.me.id, done: false, at: ctx.nowIso, ...v };
      ctx.db.todos.push(t);
      return t.id;
    },
    "todo.toggle": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const t = find(ctx.db.todos.filter((x) => x.personId === ctx.me.id), id, "That to-do");
      t.done = !t.done;
    },
    "todo.remove": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      ctx.db.todos = ctx.db.todos.filter((x) => !(x.id === id && x.personId === ctx.me.id));
    },

    "note.save": (ctx, p) => {
      const v = parse(
        z.object({
          id: z.string().optional(),
          title: z.string().trim().max(120),
          body: z.string().max(20_000),
          pinned: z.boolean().default(false),
          color: z.enum(["navy", "ink", "cobalt"]).default("navy"),
        }),
        p,
      );
      if (v.id) {
        const n = find(ctx.db.notes.filter((x) => x.personId === ctx.me.id), v.id, "That note");
        Object.assign(n, { ...v, at: ctx.nowIso });
        return n.id;
      }
      const n = { ...v, id: ctx.id("nt"), personId: ctx.me.id, at: ctx.nowIso };
      ctx.db.notes.push(n);
      return n.id;
    },
    "note.remove": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      ctx.db.notes = ctx.db.notes.filter((x) => !(x.id === id && x.personId === ctx.me.id));
    },

    "notice.read": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string().optional() }), p);
      for (const n of ctx.db.notices) if (n.to === ctx.me.id && (!id || n.id === id)) n.read = true;
    },

    /** Marks a chat channel read up to now. */
    "channel.read": (ctx, p) => {
      const { channelId } = parse(z.object({ channelId: z.string() }), p);
      ctx.db.reads[`${ctx.me.id}:${channelId}`] = ctx.nowIso;
    },
  },
};
