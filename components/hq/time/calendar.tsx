"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, ExternalLink, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Countdown, FormField, hb, inputCls, PageHead, Pill, Seg, selectCls, textareaCls } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { fromLocalInput, localInput } from "@/components/hq/tasks/shared";
import { clockLabel, dateLabel, MONTHS, monthDays, WEEKDAYS_SHORT } from "@/lib/hq/format";
import { addDays, atClock, can, dayStart, dhakaDay, weekdayOf } from "@/lib/hq/rules";
import type { CalEvent, Day, EventKind } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "agenda" | "year";
const KIND_STYLE: Record<EventKind | "task", string> = {
  meeting: "bg-bdnavy-700 text-white",
  client: "bg-signal-orange text-text-primary",
  training: "bg-cobalt text-white",
  deadline: "bg-national-crimson text-white",
  holiday: "bg-white/80 text-text-primary",
  leave: "bg-white/15 text-white",
  personal: "bg-text-primary text-white ring-1 ring-white/20",
  task: "bg-transparent text-crimson-bright ring-1 ring-national-crimson/70",
};
const KIND_LABEL: Record<EventKind, string> = { meeting: "Meeting", client: "Client", training: "Training", deadline: "Deadline", holiday: "Holiday", leave: "Leave", personal: "Personal" };

interface Item {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  kind: EventKind | "task";
  event?: CalEvent;
  href?: string;
}

export function CalendarPage() {
  const v = useHq();
  const today = useToday();
  const params = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Day>(today);
  const [mineOnly, setMineOnly] = useState(false);
  const [open, setOpen] = useState<CalEvent | null>(null);
  const [editing, setEditing] = useState<CalEvent | "new" | null>(null);
  const [dayPick, setDayPick] = useState<Day | null>(null);
  const creating = params.get("new") === "1";
  const me = v.me.person.id;

  const items = useMemo<Item[]>(() => {
    const ev = v.events.filter((e) => !mineOnly || e.attendees.includes(me)).map((e) => ({ id: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay, kind: e.kind, event: e }));
    const myTeams = new Set(v.teams.filter((t) => t.leaderId === me || t.memberIds.includes(me)).map((t) => t.id));
    const deadlines = v.tasks
      .filter((t) => !["done", "cancelled", "open"].includes(t.status) && (t.takenBy === me || (t.teamId && myTeams.has(t.teamId)) || t.createdBy === me))
      .map((t) => ({ id: t.id, title: `${t.code} due`, start: t.due, end: t.due, allDay: false, kind: "task" as const, href: `/hq/tasks/${t.id}` }));
    const holidays = v.office.holidays.map((h) => ({ id: `h-${h.day}`, title: h.name, start: new Date(dayStart(h.day)).toISOString(), end: new Date(dayStart(h.day) + 86399_000).toISOString(), allDay: true, kind: "holiday" as const }));
    return [...ev, ...deadlines, ...holidays].sort((a, b) => a.start.localeCompare(b.start));
  }, [v.events, v.tasks, v.teams, v.office.holidays, mineOnly, me]);

  const onDay = (d: Day) => items.filter((i) => dhakaDay(i.start) <= d && dhakaDay(i.end) >= d);
  const off = (d: Day) => v.office.weekend.includes(weekdayOf(d)) || v.office.holidays.some((h) => h.day === d);
  const [y, m] = cursor.split("-").map(Number);
  const move = (dir: number) => {
    if (view === "month") setCursor(`${new Date(Date.UTC(y, m - 1 + dir, 1)).toISOString().slice(0, 10)}`);
    else if (view === "year") setCursor(`${y + dir}-01-01`);
    else setCursor(addDays(cursor, dir * 7));
  };
  const select = (i: Item) => (i.event ? setOpen(i.event) : i.href ? router.push(i.href) : undefined);

  return (
    <>
      <PageHead
        title="Calendar"
        lead="Meetings, client visits, trainings, task deadlines, holidays and leave — with alarms before every meeting."
        actions={
          <button type="button" onClick={() => setEditing("new")} className={hb.gold}>
            <Plus aria-hidden className="size-4" /> New event
          </button>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Seg label="View" value={view} onChange={setView} options={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }, { value: "agenda", label: "Agenda" }, { value: "year", label: "Year" }]} />
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => move(-1)} aria-label="Previous" className={hb.iconSm}>
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button type="button" onClick={() => setCursor(today)} className={hb.quietSm}>
            Today
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next" className={hb.iconSm}>
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
        <h2 className="font-grotesk text-xl font-bold text-white">{view === "year" ? y : view === "month" ? `${MONTHS[m - 1]} ${y}` : `Week of ${dateLabel(weekStartSun(cursor))}`}</h2>
        <button type="button" aria-pressed={mineOnly} onClick={() => setMineOnly((x) => !x)} className={cn(hb.quietSm, "ml-auto", mineOnly && "bg-signal-orange text-text-primary ring-signal-orange hover:bg-signal-orange hover:text-text-primary")}>
          Only mine
        </button>
      </div>

      {view === "month" ? (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/12">
          <div className="grid grid-cols-7 bg-bdnavy-900 text-center text-xs font-bold text-white/70">
            {WEEKDAYS_SHORT.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: weekdayOf(`${cursor.slice(0, 7)}-01`) }, (_, i) => (
              <div key={`pad-${i}`} className="min-h-24 border-t border-r border-white/6 bg-white/[0.015] sm:min-h-32" />
            ))}
            {monthDays(y, m - 1).map((d) => {
              const list = onDay(d);
              return (
                <button key={d} type="button" onClick={() => setDayPick(d)} className={cn("flex min-h-24 flex-col gap-1 border-t border-r border-white/6 p-1.5 text-left transition-colors hover:bg-white/5 sm:min-h-32 sm:p-2", off(d) && "bg-white/[0.03]")}>
                  <span className={cn("grid size-7 place-items-center rounded-full text-xs font-bold", d === today ? "bg-signal-orange text-text-primary" : off(d) ? "text-white/40" : "text-white/85")}>{Number(d.slice(8))}</span>
                  {list.slice(0, 3).map((i) => (
                    <span key={i.id} className={cn("hidden truncate rounded-md px-1.5 py-0.5 text-xs font-semibold sm:block", KIND_STYLE[i.kind])}>
                      {i.allDay ? "" : `${clockLabel(i.start).replace(":00", "")} `}
                      {i.title}
                    </span>
                  ))}
                  {list.length ? (
                    <span className="flex gap-0.5 sm:hidden">
                      {list.slice(0, 4).map((i) => (
                        <span key={i.id} className={cn("size-1.5 rounded-full", i.kind === "task" || i.kind === "deadline" ? "bg-national-crimson" : "bg-signal-orange")} />
                      ))}
                    </span>
                  ) : null}
                  {list.length > 3 ? <span className="hidden text-xs text-white/55 sm:block">+{list.length - 3} more</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "week" ? <WeekGrid start={weekStartSun(cursor)} items={items} onSelect={select} off={off} today={today} /> : null}

      {view === "agenda" ? (
        <ol className="flex flex-col gap-5">
          {Array.from({ length: 21 }, (_, i) => addDays(cursor, i)).map((d) => {
            const list = onDay(d);
            if (!list.length) return null;
            return (
              <li key={d}>
                <h3 className={cn("mb-2 font-grotesk text-sm font-bold", d === today ? "text-signal-orange" : "text-white/80")}>{d === today ? "Today" : dateLabel(d, { weekday: true, long: true })}</h3>
                <ul className="flex flex-col gap-2">
                  {list.map((i) => (
                    <li key={i.id}>
                      <button type="button" onClick={() => select(i)} className="flex w-full items-center gap-3 rounded-xl bg-bdnavy-900 px-4 py-3 text-left ring-1 ring-white/12 hover:ring-signal-orange/60">
                        <span className={cn("size-2.5 shrink-0 rounded-full", i.kind === "task" || i.kind === "deadline" ? "bg-national-crimson" : i.kind === "client" ? "bg-signal-orange" : "bg-bdnavy-300")} />
                        <span className="w-28 shrink-0 font-mono text-xs text-white/65">{i.allDay ? "All day" : `${clockLabel(i.start)}`}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{i.title}</span>
                        {i.event ? <span className="text-xs text-white/50">{i.event.attendees.length} people</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      ) : null}

      {view === "year" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {MONTHS.map((name, mi) => (
            <section key={name} className="hq-rise rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12" style={{ "--i": mi } as React.CSSProperties}>
              <button type="button" onClick={() => { setCursor(`${y}-${String(mi + 1).padStart(2, "0")}-01`); setView("month"); }} className="mb-2 font-grotesk font-bold text-signal-orange hover:underline">
                {name}
              </button>
              <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                {WEEKDAYS_SHORT.map((w) => (
                  <span key={w} className="py-1 text-white/40">
                    {w.charAt(0)}
                  </span>
                ))}
                {Array.from({ length: weekdayOf(`${y}-${String(mi + 1).padStart(2, "0")}-01`) }, (_, i) => (
                  <span key={`p${i}`} />
                ))}
                {monthDays(y, mi).map((d) => {
                  const list = onDay(d);
                  const holiday = v.office.holidays.some((h) => h.day === d);
                  const leave = list.some((i) => i.kind === "leave");
                  return (
                    <button key={d} type="button" onClick={() => setDayPick(d)} aria-label={`${dateLabel(d, { year: true })}: ${list.length} events`} className={cn("relative grid aspect-square place-items-center rounded-md font-semibold transition-colors hover:bg-white/10", d === today ? "bg-signal-orange text-text-primary" : holiday ? "bg-white/80 text-text-primary" : off(d) ? "text-white/35" : "text-white/85", leave && d !== today && "ring-1 ring-white/40")}>
                      {Number(d.slice(8))}
                      {list.length && d !== today && !holiday ? <span className={cn("absolute bottom-0.5 size-1 rounded-full", list.length > 2 ? "bg-signal-orange" : "bg-bdnavy-300")} /> : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/65">
        {(["meeting", "client", "training", "deadline", "holiday", "leave"] as EventKind[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded", KIND_STYLE[k])} /> {KIND_LABEL[k]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className={cn("size-3 rounded", KIND_STYLE.task)} /> Task deadline
        </span>
      </div>

      <HqDialog open={dayPick !== null} onOpenChange={(o) => !o && setDayPick(null)} title={dayPick ? dateLabel(dayPick, { weekday: true, long: true, year: true }) : ""} size="sm" footer={<button type="button" onClick={() => { setEditing("new"); }} className={hb.gold}><Plus aria-hidden className="size-4" /> Add event</button>}>
        {dayPick && onDay(dayPick).length === 0 ? <p className="text-sm text-white/60">Nothing on this day{dayPick && off(dayPick) ? " — it's a day off" : ""}.</p> : null}
        <ul className="flex flex-col gap-2">
          {dayPick
            ? onDay(dayPick).map((i) => (
                <li key={i.id}>
                  <button type="button" onClick={() => { setDayPick(null); select(i); }} className="flex w-full items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 text-left ring-1 ring-white/8 hover:bg-black/40">
                    <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-bold", KIND_STYLE[i.kind])}>{i.kind === "task" ? "Task" : KIND_LABEL[i.kind]}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-white">{i.title}</span>
                    <span className="font-mono text-xs text-white/55">{i.allDay ? "All day" : clockLabel(i.start)}</span>
                  </button>
                </li>
              ))
            : null}
        </ul>
      </HqDialog>

      <EventDetail e={open} onClose={() => setOpen(null)} onEdit={(e) => { setOpen(null); setEditing(e); }} />
      <EventDialog
        key={editing === "new" || creating ? `new-${dayPick ?? ""}` : (editing?.id ?? "none")}
        event={creating ? "new" : editing}
        day={dayPick ?? cursor}
        onClose={() => {
          setEditing(null);
          setDayPick(null);
          if (creating) router.replace("/hq/calendar", { scroll: false });
        }}
      />
    </>
  );
}

function weekStartSun(d: Day): Day {
  return addDays(d, -weekdayOf(d));
}

function WeekGrid({ start, items, onSelect, off, today }: { start: Day; items: Item[]; onSelect: (i: Item) => void; off: (d: Day) => boolean; today: Day }) {
  const now = useNow(60_000);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const H0 = 8;
  const H1 = 20;
  const hour = 3.5; // rem per hour
  const top = (iso: string, d: Day) => Math.max(0, ((Date.parse(iso) - atClock(d, `${H0}:00`)) / 3600_000) * hour);
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-white/12">
      <div className="grid min-w-[52rem] grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
        <div className="bg-bdnavy-900" />
        {days.map((d) => (
          <div key={d} className={cn("border-l border-white/8 bg-bdnavy-900 py-2 text-center text-xs font-bold", d === today ? "text-signal-orange" : "text-white/75")}>
            {WEEKDAYS_SHORT[weekdayOf(d)]} {Number(d.slice(8))}
          </div>
        ))}
        <div className="relative" style={{ height: `${(H1 - H0) * hour}rem` }}>
          {Array.from({ length: H1 - H0 }, (_, h) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-white/45" style={{ top: `${h * hour}rem` }}>
              {((H0 + h) % 12) || 12}
              {H0 + h < 12 ? "a" : "p"}
            </span>
          ))}
        </div>
        {days.map((d) => (
          <div key={d} className={cn("relative border-l border-white/8", off(d) && "bg-white/[0.025]")} style={{ height: `${(H1 - H0) * hour}rem` }}>
            {Array.from({ length: H1 - H0 }, (_, h) => (
              <span key={h} className="absolute inset-x-0 border-t border-white/6" style={{ top: `${h * hour}rem` }} />
            ))}
            {d === today ? <span className="absolute inset-x-0 z-10 h-0.5 bg-signal-orange" style={{ top: `${top(new Date(now).toISOString(), d)}rem` }} /> : null}
            {items
              .filter((i) => !i.allDay && dhakaDay(i.start) === d)
              .map((i) => {
                const t = top(i.start, d);
                const h = Math.max(1.4, ((Date.parse(i.end) - Date.parse(i.start)) / 3600_000) * hour);
                return (
                  <button key={i.id} type="button" onClick={() => onSelect(i)} className={cn("absolute inset-x-1 overflow-hidden rounded-lg px-1.5 py-1 text-left text-xs font-semibold shadow", KIND_STYLE[i.kind])} style={{ top: `${t}rem`, height: `${h}rem` }}>
                    <span className="block truncate">{i.title}</span>
                    <span className="block truncate opacity-75">{clockLabel(i.start)}</span>
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

function EventDetail({ e, onClose, onEdit }: { e: CalEvent | null; onClose: () => void; onEdit: (e: CalEvent) => void }) {
  const act = useAct();
  const people = usePeople();
  const me = useHq((v) => v.me.person);
  if (!e) return null;
  const mine = e.by === me.id || can(me, "attendance.manage");
  return (
    <HqDialog
      open
      side
      onOpenChange={(o) => !o && onClose()}
      title={e.title}
      description={`${KIND_LABEL[e.kind]} · organised by ${nameOf(people, e.by)}`}
      footer={
        mine ? (
          <>
            <button type="button" onClick={() => act("time", "event.remove", { id: e.id }, { ok: "Event cancelled" }).then(onClose, () => {})} className={hb.quiet}>
              <Trash2 aria-hidden className="size-4" /> Cancel event
            </button>
            <button type="button" onClick={() => onEdit(e)} className={hb.gold}>
              <Pencil aria-hidden className="size-4" /> Edit
            </button>
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        <p className="flex items-center gap-2 text-white">
          <Clock aria-hidden className="size-4 text-signal-orange" />
          {e.allDay ? `${dateLabel(e.start, { weekday: true })} — all day` : `${dateLabel(e.start, { weekday: true })}, ${clockLabel(e.start)} – ${clockLabel(e.end)}`}
        </p>
        {Date.parse(e.start) > Date.now() ? <Countdown to={e.start} suffix="to go" className="text-sm" /> : null}
        {e.location ? (
          <p className="flex items-center gap-2 text-white/85">
            <MapPin aria-hidden className="size-4 text-signal-orange" /> {e.location}
          </p>
        ) : null}
        {e.link ? (
          <a href={e.link} target="_blank" rel="noopener noreferrer" className={cn(hb.gold, "self-start")}>
            <ExternalLink aria-hidden className="size-4" /> Join the meeting
          </a>
        ) : null}
        {e.note ? <p className="rounded-xl bg-black/30 p-3 text-white/80">{e.note}</p> : null}
        <div>
          <p className="mb-2 flex items-center gap-2 font-semibold text-white">
            <Users aria-hidden className="size-4 text-signal-orange" /> {e.attendees.length} attending
          </p>
          <ul className="flex flex-col gap-2">
            {e.attendees.map((a) => (
              <li key={a} className="flex items-center gap-2 text-white/85">
                <Avatar person={people.get(a)} size="xs" /> {nameOf(people, a)}
              </li>
            ))}
          </ul>
        </div>
        {e.alerts.length ? <p className="text-white/60">Alarms: {e.alerts.map((x) => (x >= 1440 ? "1 day" : x >= 60 ? `${x / 60} h` : `${x} min`)).join(", ")} before</p> : null}
        {e.sample ? <Pill className="self-start">Sample</Pill> : null}
      </div>
    </HqDialog>
  );
}

function EventDialog({ event, day, onClose }: { event: CalEvent | "new" | null; day: Day; onClose: () => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const teams = useHq((v) => v.teams);
  const me = useHq((v) => v.me.person);
  const existing = event && event !== "new" ? event : null;
  const startMs = existing ? Date.parse(existing.start) : Math.max(Date.now() + 3600_000, atClock(day, "11:00"));
  const [f, setF] = useState(() => ({
    title: existing?.title ?? "",
    kind: existing?.kind ?? ("meeting" as EventKind),
    allDay: existing?.allDay ?? false,
    start: localInput(startMs),
    end: localInput(existing ? Date.parse(existing.end) : startMs + 3600_000),
    location: existing?.location ?? "",
    link: existing?.link ?? "",
    note: existing?.note ?? "",
    teamId: existing?.teamId ?? "",
  }));
  const [attendees, setAttendees] = useState<string[]>(existing?.attendees ?? [me.id]);
  const [alerts, setAlerts] = useState<number[]>(existing?.alerts ?? [15]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));
  const save = () => {
    const payload = { ...f, start: fromLocalInput(f.start), end: fromLocalInput(f.end), attendees, alerts, teamId: f.teamId || undefined, location: f.location || undefined, note: f.note || undefined };
    const p = existing ? act("time", "event.edit", { id: existing.id, ...payload }, { ok: "Event updated" }) : act("time", "event.create", payload, { ok: "Event created — invitations sent" });
    p.then(onClose, () => {});
  };
  return (
    <HqDialog
      open={event !== null}
      onOpenChange={(o) => !o && onClose()}
      title={existing ? "Edit event" : "New event"}
      size="lg"
      footer={
        <button type="button" disabled={f.title.trim().length < 2} onClick={save} className={hb.gold}>
          <CalendarDays aria-hidden className="size-4" /> {existing ? "Save" : "Create & invite"}
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" className="sm:col-span-2">
          <input value={f.title} onChange={set("title")} className={inputCls} autoFocus />
        </FormField>
        <FormField label="Kind">
          <select value={f.kind} onChange={set("kind")} className={selectCls}>
            {(Object.keys(KIND_LABEL) as EventKind[])
              .filter((k) => k !== "holiday" || can(me, "attendance.manage"))
              .map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
          </select>
        </FormField>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-white/85">
          <input type="checkbox" checked={f.allDay} onChange={set("allDay")} className="size-4 accent-[#e4b027]" /> All day
        </label>
        <FormField label="Starts">
          <input type="datetime-local" value={f.start} onChange={set("start")} className={inputCls} />
        </FormField>
        <FormField label="Ends">
          <input type="datetime-local" value={f.end} onChange={set("end")} className={inputCls} />
        </FormField>
        <FormField label="Location">
          <input value={f.location} onChange={set("location")} className={inputCls} placeholder="HQ studio, a clinic…" />
        </FormField>
        <FormField label="Meeting link">
          <input value={f.link} onChange={set("link")} className={inputCls} placeholder="https://meet.google.com/…" />
        </FormField>
        <FormField label="Team (optional)">
          <select value={f.teamId} onChange={set("teamId")} className={selectCls}>
            <option value="">No team</option>
            {teams
              .filter((t) => t.status === "active")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </FormField>
        <fieldset>
          <legend className="text-sm font-semibold text-white/85">Alarms before</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[5, 10, 15, 30, 60, 1440].map((n) => {
              const on = alerts.includes(n);
              return (
                <button key={n} type="button" aria-pressed={on} onClick={() => setAlerts((x) => (on ? x.filter((y) => y !== n) : [...x, n]))} className={cn("min-h-8 rounded-full px-3 text-xs font-semibold ring-1", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/75 ring-white/15")}>
                  {n === 1440 ? "1 day" : n === 60 ? "1 h" : `${n} min`}
                </button>
              );
            })}
          </div>
        </fieldset>
        <FormField label="Note" className="sm:col-span-2">
          <textarea value={f.note} onChange={set("note")} className={cn(textareaCls, "min-h-20")} />
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold text-white/85">Attendees ({attendees.length})</legend>
          <div className="mb-2 flex gap-2">
            <button type="button" onClick={() => setAttendees(all.filter((p) => p.status === "active").map((p) => p.id))} className={hb.quietSm}>
              Everyone
            </button>
            <button type="button" onClick={() => setAttendees([me.id])} className={hb.quietSm}>
              Just me
            </button>
          </div>
          <ul className="grid gap-1 sm:grid-cols-3">
            {all
              .filter((p) => p.status === "active")
              .map((p) => {
                const on = attendees.includes(p.id);
                return (
                  <li key={p.id}>
                    <button type="button" aria-pressed={on} onClick={() => setAttendees((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-left text-sm ring-1", on ? "bg-white/10 text-white ring-signal-orange" : "text-white/75 ring-transparent hover:bg-white/5")}>
                      <Avatar person={p} size="xs" /> <span className="truncate">{p.name}</span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </fieldset>
      </div>
    </HqDialog>
  );
}
