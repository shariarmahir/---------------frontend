/**
 * People: designations, promotion and demotion, single permissions, wages,
 * suspension, and turning an approved ID application into a member with a
 * sign-in account. There is one super prime admin, the founder: nobody is
 * made prime and the prime admin's level never changes. Only they grant
 * permissions; `people.manage` covers the rest.
 */
import { z } from "zod";
import { ASSIGNABLE_LEVELS, LEVEL_LABEL, LEVEL_ORDER, LEVEL_PRESET } from "../rules.ts";
import type { Level, Perm, Person } from "../types.ts";
import { find, HqError, parse, type Domain } from "./ctx.ts";

const LEVELS = ASSIGNABLE_LEVELS as [Level, ...Level[]];
const PERMS = z.enum([
  "people.manage",
  "tasks.publish",
  "tasks.approve",
  "tasks.review",
  "teams.approve",
  "attendance.manage",
  "finance.view",
  "finance.edit",
  "clients.view",
  "clients.manage",
  "hr.manage",
  "content.manage",
  "shongbidhan.judge",
  "reports.view",
  "audit.view",
]);

/** A level change keeps any extra permissions the prime admin granted by hand. */
function relevel(p: Person, to: Level): Perm[] {
  const extras = p.perms.filter((x) => !LEVEL_PRESET[p.level].includes(x));
  return [...new Set([...LEVEL_PRESET[to], ...extras])];
}

export const people: Domain = {
  actions: {
    /** Designation text and level: promote, demote, retitle. */
    designation: (ctx, p) => {
      ctx.need("people.manage");
      const v = parse(z.object({ personId: z.string(), designation: z.string().trim().min(2).max(80), level: z.enum(LEVEL_ORDER as [Level, ...Level[]]), note: z.string().max(400).optional() }), p);
      const who = ctx.person(v.personId);
      if ((who.level === "prime") !== (v.level === "prime")) throw new HqError("There is one super prime admin, and that never changes.", 403);
      if (who.id === ctx.me.id && v.level !== who.level) throw new HqError("You can't change your own level.", 403);
      const up = LEVEL_ORDER.indexOf(v.level) < LEVEL_ORDER.indexOf(who.level);
      const down = LEVEL_ORDER.indexOf(v.level) > LEVEL_ORDER.indexOf(who.level);
      who.history.push({ at: ctx.nowIso, from: who.designation, to: v.designation, fromLevel: who.level, toLevel: v.level, by: ctx.me.id, note: v.note });
      if (v.level !== who.level) who.perms = relevel(who, v.level);
      who.designation = v.designation;
      who.level = v.level;
      ctx.audit({ kind: "designation", target: who.id, detail: `${v.designation} · ${LEVEL_LABEL[v.level]}` });
      ctx.notify(who.id, {
        kind: "system",
        title: up ? `Congratulations! You were promoted: ${v.designation}` : down ? `Your role changed: ${v.designation}` : `Your designation is now: ${v.designation}`,
        body: v.note,
        href: `/hq/people/${who.id}`,
      });
    },

    /** The prime admin's switchboard: grant or remove single permissions. */
    perms: (ctx, p) => {
      if (ctx.me.level !== "prime") throw new HqError("Only the super prime admin grants or removes permissions.", 403);
      const v = parse(z.object({ personId: z.string(), perms: z.array(PERMS) }), p);
      const who = ctx.person(v.personId);
      if (who.level === "prime") throw new HqError("The prime admin always holds every permission.");
      const before = new Set(who.perms);
      who.perms = [...new Set(v.perms)];
      const added = who.perms.filter((x) => !before.has(x));
      const removed = [...before].filter((x) => !who.perms.includes(x));
      ctx.audit({ kind: "perm", target: who.id, detail: `+${added.join(",") || "—"} −${removed.join(",") || "—"}` });
      if (added.length) ctx.notify(who.id, { kind: "system", title: "You were given new access", body: added.join(", ") });
    },

    wage: (ctx, p) => {
      if (ctx.me.level !== "prime") ctx.need("hr.manage");
      const v = parse(z.object({ personId: z.string(), wage: z.number().int().min(0).max(10_000_000) }), p);
      ctx.person(v.personId).wage = v.wage;
    },

    status: (ctx, p) => {
      ctx.need("people.manage");
      const v = parse(z.object({ personId: z.string(), status: z.enum(["active", "suspended", "left"]) }), p);
      const who = ctx.person(v.personId);
      if (who.level === "prime") throw new HqError("The prime admin can't be suspended.");
      who.status = v.status;
      ctx.audit({ kind: "designation", target: who.id, detail: `status ${v.status}` });
    },

    /** A record for someone joining, before they apply for their sign-in. */
    add: (ctx, p) => {
      ctx.need("people.manage");
      const v = parse(
        z.object({
          name: z.string().trim().min(2).max(80),
          nameBn: z.string().trim().min(2).max(80),
          handle: z.string().regex(/^kandari@[a-z0-9]+-[a-z0-9]+$/),
          designation: z.string().trim().min(2).max(80),
          level: z.enum(LEVELS),
          dept: z.enum(["leadership", "creative", "dev", "iot", "ops", "hr", "client", "rnd", "finance"]),
          skills: z.array(z.string()).max(30).default([]),
        }),
        p,
      );
      if (ctx.db.people.some((x) => x.handle === v.handle)) throw new HqError("That username is already taken.");
      const serial = Math.max(10, ...ctx.db.people.map((x) => Number(x.memberId.split("-")[2]) || 0)) + 1;
      const first = v.handle.slice(8).split("-")[0];
      const yy = String(new Date(ctx.now).getUTCFullYear() % 100).padStart(2, "0");
      const person: Person = {
        id: ctx.id("p"),
        ...v,
        memberId: `kandari-${first}-${String(serial).padStart(3, "0")}-${yy}`,
        learning: [],
        photo: null,
        perms: LEVEL_PRESET[v.level],
        status: "active",
        joinedAt: ctx.nowIso,
        connections: ctx.db.people.map((x) => x.id),
        asked: [],
        history: [],
        hasAccount: false,
      };
      for (const other of ctx.db.people) other.connections.push(person.id);
      ctx.db.people.push(person);
      return person.id;
    },
  },

  onDecide: {
    /**
     * An ID application. Accepting either links it to an existing record
     * (extra.personId) or makes a new member; either way it creates the
     * sign-in account from the password and face the applicant gave.
     */
    application: (ctx, ap, accepted, extra) => {
      const app = find(ctx.db.applications, ap.refId, "That application");
      if (app.status !== "pending") throw new HqError("This application was already decided.");
      app.status = accepted ? "approved" : "rejected";
      app.decidedBy = ctx.me.id;
      app.decidedAt = ctx.nowIso;
      app.reason = typeof extra.note === "string" ? extra.note : undefined;
      if (!accepted) {
        ctx.audit({ kind: "reject", target: app.id, detail: `application ${app.handle}` });
        return;
      }
      const level = LEVELS.includes(extra.level as Level) ? (extra.level as Level) : "member";
      const designation = typeof extra.designation === "string" && extra.designation.trim() ? extra.designation.trim() : "Member";
      let personId = typeof extra.personId === "string" ? extra.personId : undefined;
      if (personId) {
        const who = ctx.person(personId);
        if (who.hasAccount) throw new HqError("This member already has an account.");
        Object.assign(who, { email: app.email, phone: app.phone, handle: app.handle, hasAccount: true, skills: [...new Set([...who.skills, ...app.skills])] });
      } else {
        personId = people.actions.add(ctx, { name: app.name, nameBn: app.nameBn, handle: app.handle, designation, level, dept: app.dept, skills: app.skills }) as string;
        Object.assign(ctx.person(personId), { email: app.email, phone: app.phone, hasAccount: true });
      }
      if (ctx.db.accounts.some((a) => a.email === app.email || a.handle === app.handle)) throw new HqError("An account already uses that email or username.");
      ctx.db.accounts.push({
        id: ctx.id("acc"),
        personId,
        email: app.email,
        handle: app.handle,
        passHash: app.passHash ?? "",
        salt: app.salt ?? "",
        face: app.face ?? null,
        faceAt: app.face ? app.at : null,
        failures: 0,
        lockedUntil: null,
        createdAt: ctx.nowIso,
        lastLoginAt: null,
        epoch: 0,
      });
      app.personId = personId;
      delete app.passHash;
      delete app.salt;
      delete app.face;
      ctx.audit({ kind: "approve", target: personId, detail: `application ${app.handle}` });
    },
  },
};
