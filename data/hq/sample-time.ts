import { addDays, atClock, dhakaDay, weekdayOf } from "../../lib/hq/rules.ts";
import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { Approval, CalEvent, Checkin, HqDb, LeaveRequest } from "../../lib/hq/types.ts";

/** Sample calendar and attendance, relative to now (Dhaka time; Friday and Saturday off). */
export function seedTime(ctx: SeedCtx): Partial<HqDb> {
  const today = dhakaDay(ctx.now);
  const iso = (d: string, clock: string) => new Date(atClock(d, clock)).toISOString();
  const work = (d: string) => ![5, 6].includes(weekdayOf(d));
  const everyone = ctx.people.map((p) => p.id);

  const events: CalEvent[] = [];
  let n = 0;
  const ev = (d: string, from: string, to: string, title: string, kind: CalEvent["kind"], attendees: string[], x: Partial<CalEvent> = {}) =>
    events.push({ id: `ev-s${++n}`, kind, title, start: iso(d, from), end: iso(d, to), allDay: false, attendees, by: ctx.prime, alerts: [15], sample: true, ...x });

  for (let i = -14; i <= 42; i++) {
    const d = addDays(today, i);
    if (!work(d)) continue;
    if (weekdayOf(d) === 0) ev(d, "10:30", "11:00", "Weekly stand-up", "meeting", everyone, { link: "https://meet.google.com/", alerts: [10] });
    if (weekdayOf(d) === 3) ev(d, "16:00", "17:00", "Demo hour", "meeting", everyone, { location: "HQ studio" });
  }
  ev(today, "12:00", "12:45", "SWASTI Sherpur — go-live check", "client", ["p-mahir", "p-ishtiak", "p-luban", "p-safia"], { link: "https://meet.google.com/", alerts: [30, 5], teamId: "tm-swasti" });
  ev(today, "15:00", "15:30", "Aponjon SpO2 drift review", "meeting", ["p-mahir", "p-sharul", "p-janassor"], { location: "Hardware lab", teamId: "tm-aponjon" });
  ev(addDays(today, 1), "11:00", "12:00", "Mymensingh clinic — first meeting", "client", ["p-mahir", "p-jamil", "p-sadman"], { location: "Clinic office, Mymensingh" });
  ev(addDays(today, 2), "14:00", "17:00", "Training: firmware basics", "training", ["p-safia", "p-shabbin", "p-sharul"], { location: "Hardware lab" });
  ev(addDays(today, 3), "09:00", "10:00", "Grant proposal deadline", "deadline", ["p-mahir", "p-sadman"]);
  ev(addDays(today, 9), "08:00", "16:00", "Kazaikat field test", "client", ["p-sadman", "p-janassor", "p-safia", "p-luban"], { location: "Kazaikat village, Nakla, Sherpur" });
  ev(addDays(today, 16), "10:00", "16:00", "Village health camp", "client", everyone, { location: "Kazaikat village" });
  ev(addDays(today, -3), "11:00", "12:00", "Investor call", "meeting", ["p-mahir", "p-sadman", "p-nabeel"], { link: "https://meet.google.com/" });
  ev(addDays(today, -6), "10:00", "13:00", "Nakla pilot hand-over", "client", ["p-ishtiak", "p-luban", "p-mehek", "p-safia"]);
  events.push({ id: `ev-s${++n}`, kind: "leave", title: "Shabbin Ahmed on casual leave", start: new Date(atClock(addDays(today, 5), "00:00")).toISOString(), end: new Date(atClock(addDays(today, 6), "23:59")).toISOString(), allDay: true, attendees: ["p-shabbin"], by: "p-jamil", alerts: [], sample: true });

  // Check-ins for the last ten working days; a few late arrivals.
  const checkins: Checkin[] = [];
  let c = 0;
  let worked = 0;
  for (let i = 0; worked < 10 && i < 20; i++) {
    const d = addDays(today, -i);
    if (!work(d)) continue;
    worked++;
    for (const [k, p] of ctx.people.entries()) {
      if (i === 0 && ["p-shabbin", "p-nabeel"].includes(p.id)) continue; // not in yet today
      if ((k + i) % 11 === 5) continue; // the odd absence
      const lateMins = (k * 7 + i * 13) % 9 === 0 ? 20 + ((k + i) % 4) * 9 : 0;
      const minutes = lateMins ? lateMins : -((k * 5 + i * 3) % 25);
      const inAt = atClock(d, "10:00") + minutes * 60_000;
      if (i === 0 && inAt > ctx.now) continue;
      checkins.push({ id: `ci-s${++c}`, personId: p.id, day: d, in: new Date(inAt).toISOString(), out: i === 0 ? undefined : new Date(atClock(d, "18:00") + ((k + i) % 5) * 600_000).toISOString(), late: lateMins > 15, lateMins: lateMins > 15 ? lateMins : 0 });
    }
  }

  const leaves: LeaveRequest[] = [
    { id: "lv-s1", personId: "p-shabbin", from: addDays(today, 5), to: addDays(today, 6), kind: "casual", reason: "Sister's wedding in Cumilla.", status: "approved", at: new Date(ctx.now - 4 * 86400_000).toISOString(), decidedBy: "p-jamil" },
    { id: "lv-s2", personId: "p-mehek", from: addDays(today, 12), to: addDays(today, 12), kind: "sick", reason: "Dental surgery appointment.", status: "pending", at: new Date(ctx.now - 5 * 3600_000).toISOString() },
    { id: "lv-s3", personId: "p-luban", from: addDays(today, -9), to: addDays(today, -8), kind: "annual", reason: "Family trip to Sylhet.", status: "approved", at: new Date(ctx.now - 20 * 86400_000).toISOString(), decidedBy: "p-jamil" },
  ];
  const approvals: Approval[] = [{ id: "ap-s-lv2", kind: "leave", title: `Mehek: 1 day sick leave (${leaves[1].from})`, detail: leaves[1].reason, refId: "lv-s2", by: "p-mehek", at: leaves[1].at, perm: "attendance.manage", status: "pending" }];

  return { events, checkins, leaves, approvals };
}
