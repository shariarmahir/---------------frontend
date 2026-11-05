"use client";

import { CalendarOff, Check, Clock, LogIn, Plus, Settings2, Trash2, UserCheck, UserX, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/hq/data-table";
import { HqDialog } from "@/components/hq/dialog";
import { usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Empty, FormField, hb, inputCls, PageHead, Panel, Pill, Progress, selectCls, Stat, textareaCls } from "@/components/hq/kit";
import { useAct, useHq } from "@/components/hq/provider";
import { clockLabel, dateLabel, MONTHS, monthDays, WEEKDAYS_SHORT } from "@/lib/hq/format";
import { addDays, can, weekdayOf } from "@/lib/hq/rules";
import type { Day, LeaveRequest } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const LEAVE_LABEL: Record<LeaveRequest["kind"], string> = { casual: "Casual", sick: "Sick", annual: "Annual", unpaid: "Unpaid" };

export function Attendance() {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const today = useToday();
  const me = v.me.person;
  const manager = can(me, "attendance.manage");
  const [requesting, setRequesting] = useState(false);
  const [settings, setSettings] = useState(false);
  const off = (d: Day) => v.office.weekend.includes(weekdayOf(d)) || v.office.holidays.some((h) => h.day === d);
  const onLeave = (pid: string, d: Day) => v.leaves.some((l) => l.personId === pid && l.status === "approved" && l.from <= d && l.to >= d) || v.events.some((e) => e.kind === "leave" && e.attendees.includes(pid) && e.start.slice(0, 10) <= d && e.end.slice(0, 10) >= d);
  const active = v.people.filter((p) => p.status === "active");
  const todays = new Map(v.checkins.filter((c) => c.day === today).map((c) => [c.personId, c]));
  const month = today.slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const myMonth = v.checkins.filter((c) => c.personId === me.id && c.day.startsWith(month));
  const lateCount = myMonth.filter((c) => c.late).length;
  const yearLeaves = (kind: LeaveRequest["kind"]) => v.leaves.filter((l) => l.personId === me.id && l.kind === kind && l.status !== "rejected" && l.from.startsWith(String(y))).reduce((s, l) => s + workingDays(l.from, l.to), 0);
  function workingDays(from: Day, to: Day): number {
    let n = 0;
    for (let d = from; d <= to; d = addDays(d, 1)) if (!off(d)) n++;
    return n;
  }

  const table = useMemo(() => {
    const days = monthDays(y, m - 1).filter((d) => d <= today && !off(d));
    return active.map((p) => {
      const mine = v.checkins.filter((c) => c.personId === p.id && c.day.startsWith(month));
      const leave = days.filter((d) => onLeave(p.id, d)).length;
      return { id: p.id, name: p.name, present: mine.length, late: mine.filter((c) => c.late).length, leave, absent: Math.max(0, days.length - mine.length - leave), rate: days.length ? Math.round((mine.length / days.length) * 100) : 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.checkins, v.leaves, active, month, today]);
  type Row = (typeof table)[number];
  const columns: ColumnDef<Row, unknown>[] = [
    { accessorKey: "name", header: "Member", cell: (c) => <span className="flex items-center gap-2 font-semibold text-white"><Avatar person={people.get(c.row.original.id)} size="xs" />{c.row.original.name}</span> },
    { accessorKey: "present", header: "Present" },
    { accessorKey: "late", header: "Late", cell: (c) => <span className={c.row.original.late ? "font-bold text-crimson-bright" : ""}>{c.row.original.late}</span> },
    { accessorKey: "leave", header: "Leave" },
    { accessorKey: "absent", header: "Absent" },
    { accessorKey: "rate", header: "Attendance", cell: (c) => <span className="flex items-center gap-2"><Progress value={c.row.original.rate} className="w-20" label="Attendance rate" /> {c.row.original.rate}%</span> },
  ];
  const pending = v.approvals.filter((a) => a.kind === "leave" && a.status === "pending");

  return (
    <>
      <PageHead
        title="Attendance & Leave"
        lead={`Office hours ${v.office.start}–${v.office.end}, ${v.office.graceMins} minutes' grace. Weekend: ${v.office.weekend.map((d) => WEEKDAYS_SHORT[d]).join(" & ")}.`}
        actions={
          <>
            {manager ? (
              <button type="button" onClick={() => setSettings(true)} className={hb.outline}>
                <Settings2 aria-hidden className="size-4" /> Office settings
              </button>
            ) : null}
            <button type="button" onClick={() => setRequesting(true)} className={hb.gold}>
              <Plus aria-hidden className="size-4" /> Request leave
            </button>
          </>
        }
      />
      <section aria-label="Today" className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="In office now" value={`${[...todays.values()].filter((c) => !c.out).length}/${active.length}`} icon={UserCheck} />
        <Stat label="Late today" value={[...todays.values()].filter((c) => c.late).length} icon={Clock} field="ink" />
        <Stat label="On leave today" value={active.filter((p) => onLeave(p.id, today)).length} icon={CalendarOff} field="cobalt" />
        <Stat label="My late days this month" value={lateCount} icon={Clock} sub={lateCount >= 3 ? <span className="text-crimson-bright">Shongbidhan Part Ka, 1-101</span> : "under the limit"} />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title={off(today) ? "Today is a day off" : "Today's office board"} icon={LogIn} className="xl:col-span-7">
          <ul className="grid gap-2 sm:grid-cols-2">
            {active.map((p) => {
              const c = todays.get(p.id);
              const leave = onLeave(p.id, today);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
                  <Avatar person={p} size="sm" online={Boolean(c && !c.out)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                    <span className="block text-xs text-white/55">{c ? `In at ${clockLabel(c.in)}${c.out ? ` · out ${clockLabel(c.out)}` : ""}` : leave ? "On leave" : "Not in yet"}</span>
                  </span>
                  {c?.late ? <Pill tone="red">{c.lateMins}m late</Pill> : c ? <Pill tone="gold">On time</Pill> : leave ? <Pill tone="cobalt">Leave</Pill> : <Pill>Away</Pill>}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title={`My ${MONTHS[m - 1]}`} icon={CalendarOff} field="ink" className="xl:col-span-5">
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {WEEKDAYS_SHORT.map((w) => (
              <span key={w} className="py-1 text-white/45">
                {w}
              </span>
            ))}
            {Array.from({ length: weekdayOf(`${month}-01`) }, (_, i) => (
              <span key={i} />
            ))}
            {monthDays(y, m - 1).map((d) => {
              const c = myMonth.find((x) => x.day === d);
              const state = d > today ? "future" : off(d) ? "off" : onLeave(me.id, d) ? "leave" : c ? (c.late ? "late" : "present") : "absent";
              return (
                <span key={d} title={`${dateLabel(d)}: ${state}`} className={cn("grid aspect-square place-items-center rounded-lg font-semibold", state === "present" && "bg-signal-orange text-text-primary", state === "late" && "bg-national-crimson text-white", state === "leave" && "bg-cobalt text-white", state === "absent" && "ring-1 ring-national-crimson/60 text-white/70", state === "off" && "text-white/30", state === "future" && "text-white/50", d === today && "ring-2 ring-white")}>
                  {Number(d.slice(8))}
                </span>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/65">
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-signal-orange" /> Present</span>
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-national-crimson" /> Late</span>
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-cobalt" /> Leave</span>
            <span className="flex items-center gap-1"><span className="size-3 rounded ring-1 ring-national-crimson/60" /> Absent</span>
          </div>
        </Panel>

        <Panel title="My leave" icon={CalendarOff} className="xl:col-span-5">
          <ul className="flex flex-col gap-3">
            {(["casual", "sick", "annual"] as const).map((k) => {
              const used = yearLeaves(k);
              const total = v.office.leaveDays[k];
              return (
                <li key={k}>
                  <span className="flex justify-between text-sm">
                    <span className="font-semibold text-white">{LEAVE_LABEL[k]}</span>
                    <span className="text-white/70">
                      {total - used} of {total} days left
                    </span>
                  </span>
                  <Progress value={(used / total) * 100} className="mt-1.5" label={`${LEAVE_LABEL[k]} leave used`} />
                </li>
              );
            })}
          </ul>
          <h3 className="mt-5 mb-2 text-sm font-semibold text-white/80">My requests</h3>
          <ul className="flex flex-col gap-2">
            {v.leaves
              .filter((l) => l.personId === me.id)
              .sort((a, b) => b.from.localeCompare(a.from))
              .map((l) => (
                <li key={l.id} className="flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-sm ring-1 ring-white/8">
                  <span className="min-w-0 flex-1 text-white">
                    {LEAVE_LABEL[l.kind]} · {dateLabel(l.from)}
                    {l.to !== l.from ? ` – ${dateLabel(l.to)}` : ""}
                  </span>
                  <Pill tone={l.status === "approved" ? "gold" : l.status === "rejected" ? "red" : "muted"}>{l.status}</Pill>
                  {l.status === "pending" ? (
                    <button type="button" onClick={() => act("time", "leave.cancel", { id: l.id }, { ok: "Request withdrawn" })} aria-label="Withdraw request" className={hb.iconSm}>
                      <Trash2 aria-hidden className="size-3.5" />
                    </button>
                  ) : null}
                </li>
              ))}
          </ul>
        </Panel>

        {manager ? (
          <Panel title="Leave waiting for you" icon={CalendarOff} field="cobalt" className="xl:col-span-7">
            {pending.length === 0 ? <Empty title="No pending leave" className="py-6" /> : null}
            <ul className="flex flex-col gap-2">
              {pending.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5">
                  <Avatar person={people.get(a.by)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{a.title}</span>
                    {a.detail ? <span className="block text-xs text-white/65">{a.detail}</span> : null}
                  </span>
                  <button type="button" onClick={() => act("approvals", "decide", { id: a.id, accepted: true }, { ok: "Leave approved" })} className={hb.goldSm}>
                    <Check aria-hidden className="size-3.5" /> Approve
                  </button>
                  <button type="button" onClick={() => act("approvals", "decide", { id: a.id, accepted: false }, { ok: "Leave rejected" })} aria-label="Reject" className={hb.quietSm}>
                    <X aria-hidden className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {manager ? (
          <Panel title={`Everyone, ${MONTHS[m - 1]}`} icon={UserX} className="xl:col-span-12">
            <DataTable data={table} columns={columns} search="Search members…" pageSize={12} csv={{ name: `attendance-${month}`, row: (r) => ({ member: r.name, present: r.present, late: r.late, leave: r.leave, absent: r.absent, attendancePct: r.rate }) }} />
          </Panel>
        ) : null}
      </div>
      <LeaveDialog open={requesting} onOpenChange={setRequesting} />
      {manager ? <OfficeDialog open={settings} onOpenChange={setSettings} /> : null}
    </>
  );
}

function LeaveDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const today = useToday();
  const [f, setF] = useState({ from: addDays(today, 1), to: addDays(today, 1), kind: "casual" as LeaveRequest["kind"], reason: "" });
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request leave"
      size="sm"
      footer={
        <button type="button" disabled={f.reason.trim().length < 5} onClick={() => act("time", "leave.request", f, { ok: "Leave requested" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>
          Send request
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="From">
          <input type="date" value={f.from} onChange={(e) => setF((x) => ({ ...x, from: e.target.value, to: x.to < e.target.value ? e.target.value : x.to }))} className={inputCls} />
        </FormField>
        <FormField label="To">
          <input type="date" value={f.to} min={f.from} onChange={(e) => setF((x) => ({ ...x, to: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Kind" className="sm:col-span-2">
          <select value={f.kind} onChange={(e) => setF((x) => ({ ...x, kind: e.target.value as LeaveRequest["kind"] }))} className={selectCls}>
            {Object.entries(LEAVE_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Reason" className="sm:col-span-2">
          <textarea value={f.reason} onChange={(e) => setF((x) => ({ ...x, reason: e.target.value }))} className={textareaCls} />
        </FormField>
      </div>
    </HqDialog>
  );
}

function OfficeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const office = useHq((v) => v.office);
  const [f, setF] = useState({ start: office.start, end: office.end, graceMins: office.graceMins, weekend: office.weekend, leaveDays: office.leaveDays });
  const [holiday, setHoliday] = useState({ day: "", name: "" });
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Office settings"
      size="lg"
      footer={
        <button type="button" onClick={() => act("time", "office", f, { ok: "Office settings saved" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>
          Save settings
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Office starts">
          <input type="time" value={f.start} onChange={(e) => setF((x) => ({ ...x, start: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Office ends">
          <input type="time" value={f.end} onChange={(e) => setF((x) => ({ ...x, end: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Grace (minutes)">
          <input type="number" min={0} max={120} value={f.graceMins} onChange={(e) => setF((x) => ({ ...x, graceMins: Number(e.target.value) }))} className={inputCls} />
        </FormField>
        <fieldset className="sm:col-span-3">
          <legend className="text-sm font-semibold text-white/85">Weekend days</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WEEKDAYS_SHORT.map((w, i) => {
              const on = f.weekend.includes(i);
              return (
                <button key={w} type="button" aria-pressed={on} onClick={() => setF((x) => ({ ...x, weekend: on ? x.weekend.filter((d) => d !== i) : [...x.weekend, i].slice(-3) }))} className={cn("min-h-9 rounded-xl px-3 text-xs font-bold ring-1", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/75 ring-white/15")}>
                  {w}
                </button>
              );
            })}
          </div>
        </fieldset>
        {(["casual", "sick", "annual"] as const).map((k) => (
          <FormField key={k} label={`${LEAVE_LABEL[k]} leave days / year`}>
            <input type="number" min={0} max={60} value={f.leaveDays[k]} onChange={(e) => setF((x) => ({ ...x, leaveDays: { ...x.leaveDays, [k]: Number(e.target.value) } }))} className={inputCls} />
          </FormField>
        ))}
        <fieldset className="sm:col-span-3">
          <legend className="mb-2 text-sm font-semibold text-white/85">Holidays</legend>
          <ul className="mb-3 flex flex-col gap-1">
            {office.holidays.map((h) => (
              <li key={h.day} className="flex items-center gap-3 text-sm text-white/85">
                <span className="w-28 font-mono text-xs">{h.day}</span>
                <span className="flex-1">{h.name}</span>
                <button type="button" onClick={() => act("time", "holiday.remove", { day: h.day }, { quiet: true })} aria-label={`Remove ${h.name}`} className={hb.iconSm}>
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input type="date" value={holiday.day} onChange={(e) => setHoliday((x) => ({ ...x, day: e.target.value }))} aria-label="Holiday date" className={cn(inputCls, "sm:w-44")} />
            <input value={holiday.name} onChange={(e) => setHoliday((x) => ({ ...x, name: e.target.value }))} placeholder="Holiday name" aria-label="Holiday name" className={inputCls} />
            <button type="button" disabled={!holiday.day || holiday.name.length < 2} onClick={() => act("time", "holiday.add", holiday, { ok: "Holiday added" }).then(() => setHoliday({ day: "", name: "" }), () => {})} className={hb.outline}>
              Add
            </button>
          </div>
        </fieldset>
      </div>
    </HqDialog>
  );
}
