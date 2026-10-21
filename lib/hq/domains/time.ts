/**
 * Time: the calendar (meetings with alarms), office check-in/out with late
 * detection (Dhaka time, office start + grace on working days), leave
 * requests against the yearly allowance, and the office's settings.
 */
import { z } from "zod";
import { atClock, can, dayStart, dhakaDay, weekdayOf } from "../rules.ts";
import type { CalEvent, Day, HqDb, LeaveRequest } from "../types.ts";
import { find, HqError, parse, type Ctx, type Domain } from "./ctx.ts";

const iso = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function isWorkingDay(db: Pick<HqDb, "office">, d: Day): boolean {
  return !db.office.weekend.includes(weekdayOf(d)) && !db.office.holidays.some((h) => h.day === d);
}

/** Working days between two Dhaka days, inclusive. */
export function workingDays(db: Pick<HqDb, "office">, from: Day, to: Day): number {
  let n = 0;
  for (let t = dayStart(from); t <= dayStart(to); t += 86400_000) if (isWorkingDay(db, dhakaDay(t + 3600_000))) n++;
  return n;
}

/** Leave days already approved or pending this year, by kind. */
export function leaveUsed(db: Pick<HqDb, "leaves" | "office">, personId: string, year: number): Record<LeaveRequest["kind"], number> {
  const used = { casual: 0, sick: 0, annual: 0, unpaid: 0 };
  for (const l of db.leaves) {
    if (l.personId !== personId || l.status === "rejected" || !l.from.startsWith(String(year))) continue;
    used[l.kind] += workingDays(db, l.from, l.to);
  }
  return used;
}

function canEdit(ctx: Ctx, e: CalEvent): boolean {
  return e.by === ctx.me.id || can(ctx.me, "attendance.manage");
}

const eventInput = z.object({
  title: z.string().trim().min(2).max(140),
  kind: z.enum(["meeting", "deadline", "client", "training", "holiday", "leave", "personal"]).default("meeting"),
  start: iso,
  end: iso,
  allDay: z.boolean().default(false),
  attendees: z.array(z.string()).max(60).default([]),
  location: z.string().max(200).optional(),
  link: z.string().url().optional().or(z.literal("")),
  alerts: z.array(z.number().int().min(0).max(10080)).max(6).default([15]),
  taskId: z.string().optional(),
  teamId: z.string().optional(),
  note: z.string().max(2000).optional(),
});

export const time: Domain = {
  actions: {
    "event.create": (ctx, p) => {
      const v = parse(eventInput, p);
      if (Date.parse(v.end) < Date.parse(v.start)) throw new HqError("The event ends before it starts.");
      if (v.kind === "holiday" && !can(ctx.me, "attendance.manage")) throw new HqError("Only attendance managers add holidays.", 403);
      const e: CalEvent = { id: ctx.id("ev"), ...v, link: v.link || undefined, start: new Date(v.start).toISOString(), end: new Date(v.end).toISOString(), attendees: [...new Set([ctx.me.id, ...v.attendees])], by: ctx.me.id };
      ctx.db.events.push(e);
      ctx.notify(e.attendees, { kind: "meeting", title: `${ctx.me.name} invited you: ${e.title}`, body: new Date(e.start).toISOString(), href: "/hq/calendar" });
      return e.id;
    },
    "event.edit": (ctx, p) => {
      const v = parse(eventInput.partial().extend({ id: z.string() }), p);
      const e = find(ctx.db.events, v.id, "That event");
      if (!canEdit(ctx, e)) throw new HqError("Only the organiser can change this event.", 403);
      const before = new Set(e.attendees);
      Object.assign(e, { ...v, id: e.id });
      if (v.start) e.start = new Date(v.start).toISOString();
      if (v.end) e.end = new Date(v.end).toISOString();
      if (v.link === "") e.link = undefined;
      if (Date.parse(e.end) < Date.parse(e.start)) throw new HqError("The event ends before it starts.");
      ctx.notify(e.attendees.filter((a) => before.has(a)), { kind: "meeting", title: `Changed: ${e.title}`, href: "/hq/calendar" });
      ctx.notify(e.attendees.filter((a) => !before.has(a)), { kind: "meeting", title: `${ctx.me.name} invited you: ${e.title}`, href: "/hq/calendar" });
    },
    "event.remove": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const e = find(ctx.db.events, id, "That event");
      if (!canEdit(ctx, e)) throw new HqError("Only the organiser can cancel this event.", 403);
      ctx.db.events = ctx.db.events.filter((x) => x.id !== id);
      ctx.notify(e.attendees, { kind: "meeting", title: `Cancelled: ${e.title}`, href: "/hq/calendar" });
    },

    checkin: (ctx) => {
      const d = dhakaDay(ctx.now);
      if (ctx.db.checkins.some((c) => c.personId === ctx.me.id && c.day === d)) throw new HqError("You've already checked in today.");
      const limit = atClock(d, ctx.db.office.start) + ctx.db.office.graceMins * 60_000;
      const late = isWorkingDay(ctx.db, d) && ctx.now > limit;
      const lateMins = late ? Math.round((ctx.now - atClock(d, ctx.db.office.start)) / 60_000) : 0;
      ctx.db.checkins.push({ id: ctx.id("ci"), personId: ctx.me.id, day: d, in: ctx.nowIso, late, lateMins });
      return { late, lateMins };
    },
    checkout: (ctx) => {
      const d = dhakaDay(ctx.now);
      const c = ctx.db.checkins.find((x) => x.personId === ctx.me.id && x.day === d);
      if (!c) throw new HqError("You haven't checked in today.");
      c.out = ctx.nowIso;
    },

    "leave.request": (ctx, p) => {
      const v = parse(z.object({ from: day, to: day, kind: z.enum(["casual", "sick", "annual", "unpaid"]), reason: z.string().trim().min(5).max(1000) }), p);
      if (v.to < v.from) throw new HqError("The leave ends before it starts.");
      const days = workingDays(ctx.db, v.from, v.to);
      if (days === 0) throw new HqError("Those dates are all weekends or holidays.");
      if (v.kind !== "unpaid") {
        const used = leaveUsed(ctx.db, ctx.me.id, Number(v.from.slice(0, 4)))[v.kind];
        const allowed = ctx.db.office.leaveDays[v.kind];
        if (used + days > allowed) throw new HqError(`Not enough ${v.kind} leave: ${allowed - used} of ${allowed} days left this year.`);
      }
      const l: LeaveRequest = { id: ctx.id("lv"), personId: ctx.me.id, ...v, status: "pending", at: ctx.nowIso };
      ctx.db.leaves.push(l);
      ctx.ask({ kind: "leave", title: `${ctx.me.name}: ${days} day${days === 1 ? "" : "s"} ${v.kind} leave (${v.from}${v.to !== v.from ? ` to ${v.to}` : ""})`, detail: v.reason, refId: l.id, perm: "attendance.manage" });
      return l.id;
    },
    "leave.cancel": (ctx, p) => {
      const { id } = parse(z.object({ id: z.string() }), p);
      const l = find(ctx.db.leaves, id, "That leave request");
      if (l.personId !== ctx.me.id) throw new HqError("You can only cancel your own leave.", 403);
      if (l.status !== "pending") throw new HqError("Only a pending request can be cancelled.");
      ctx.db.leaves = ctx.db.leaves.filter((x) => x.id !== id);
      ctx.db.approvals = ctx.db.approvals.filter((a) => !(a.kind === "leave" && a.refId === id && a.status === "pending"));
    },

    office: (ctx, p) => {
      ctx.need("attendance.manage");
      const v = parse(
        z.object({
          start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
          end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
          graceMins: z.number().int().min(0).max(120).optional(),
          weekend: z.array(z.number().int().min(0).max(6)).max(3).optional(),
          leaveDays: z.object({ casual: z.number().int().min(0).max(60), sick: z.number().int().min(0).max(60), annual: z.number().int().min(0).max(60) }).optional(),
        }),
        p,
      );
      Object.assign(ctx.db.office, v);
    },
    "holiday.add": (ctx, p) => {
      ctx.need("attendance.manage");
      const v = parse(z.object({ day, name: z.string().trim().min(2).max(80) }), p);
      ctx.db.office.holidays = [...ctx.db.office.holidays.filter((h) => h.day !== v.day), v].sort((a, b) => a.day.localeCompare(b.day));
    },
    "holiday.remove": (ctx, p) => {
      ctx.need("attendance.manage");
      const v = parse(z.object({ day }), p);
      ctx.db.office.holidays = ctx.db.office.holidays.filter((h) => h.day !== v.day);
    },
  },

  onDecide: {
    leave: (ctx, ap, accepted) => {
      const l = find(ctx.db.leaves, ap.refId, "That leave request");
      l.status = accepted ? "approved" : "rejected";
      l.decidedBy = ctx.me.id;
      if (accepted) {
        const who = ctx.person(l.personId);
        ctx.db.events.push({ id: ctx.id("ev"), kind: "leave", title: `${who.name} on ${l.kind} leave`, start: new Date(dayStart(l.from)).toISOString(), end: new Date(dayStart(l.to) + 86399_000).toISOString(), allDay: true, attendees: [l.personId], by: ctx.me.id, alerts: [] });
      }
    },
  },
};
