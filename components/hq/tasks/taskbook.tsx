"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpenCheck,
  CalendarClock,
  Check,
  ClipboardList,
  Crown,
  GraduationCap,
  ListTodo,
  LogIn,
  Medal,
  NotebookPen,
  PenLine,
  Pin,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { useToday } from "@/components/hq/hooks";
import { Countdown, Empty, FIELD, FormField, hb, inputCls, PageHead, Panel, PanelLink, Pill, Progress, selectCls, Stat, textareaCls } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { clockLabel, dateLabel } from "@/lib/hq/format";
import { can, dhakaDay, num, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/hq/rules";
import { basePoints, isAdvance, QUICK_SILVER_STREAK, rankFor, RANKS, seasonOf } from "@/lib/hq/scoring";
import type { BadgeKind, DailyReport as Report, PersonalNote, Task } from "@/lib/hq/types";
import { cn } from "@/lib/utils";
import { BADGE_LABEL, NewTicketDialog, PRIORITY_TONE, STATUS_TONE } from "./shared";

const MOODS = ["😫", "😕", "😐", "🙂", "🤩"];
const ACTIVE = ["taken", "in-progress", "submitted", "client-review"];
const BADGE_ICON: Record<BadgeKind, typeof Zap> = { "quick-silver": Zap, "iron-man": ShieldCheck, "man-of-the-day": Medal, "luther-king": Crown, shield: ShieldCheck, helper: Sparkles };

/** The first `cap` items, or all of them once "Show all" is pressed. */
function useCapped<T>(items: T[], cap: number) {
  const [all, setAll] = useState(false);
  const more = items.length - cap;
  const toggle =
    more > 0 ? (
      <button type="button" onClick={() => setAll((x) => !x)} className={cn(hb.quietSm, "mt-3 w-full")}>
        {all ? "Show less" : `Show all ${items.length}`}
      </button>
    ) : null;
  return { shown: all ? items : items.slice(0, cap), toggle };
}

/**
 * A member's own book for the day, in working order: today's state at the
 * top, then the desk (active tasks), the daily report, to-dos and notes,
 * learning, and the track record.
 */
export function TaskBook() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const params = useSearchParams();
  const router = useRouter();
  const me = v.me.person;

  const myTeams = useMemo(() => new Map(v.teams.filter((t) => t.leaderId === me.id || t.memberIds.includes(me.id)).map((t) => [t.id, t.name])), [v.teams, me.id]);
  const mine = useMemo(() => v.tasks.filter((t) => t.takenBy === me.id || (t.teamId && myTeams.has(t.teamId))), [v.tasks, me.id, myTeams]);
  const active = useMemo(() => mine.filter((t) => ACTIVE.includes(t.status)).sort((a, b) => a.due.localeCompare(b.due)), [mine]);
  const delivered = useMemo(() => mine.filter((t) => t.status === "done").sort((a, b) => (b.submittedAt ?? b.due).localeCompare(a.submittedAt ?? a.due)), [mine]);
  const learningTasks = active.filter((t) => t.learningSkill || t.kind === "learning");

  const submitted = useMemo(() => mine.filter((t) => t.takenBy === me.id && t.submittedAt).sort((a, b) => b.submittedAt!.localeCompare(a.submittedAt!)), [mine, me.id]);
  let run = 0;
  for (const t of submitted) {
    if (!isAdvance(t)) break;
    run++;
  }
  // Runs of early submissions count up to the hat-trick, then start again.
  const streak = run === 0 ? 0 : ((run - 1) % QUICK_SILVER_STREAK) + 1;

  const season = seasonOf(today);
  const points = useMemo(() => v.points.filter((e) => e.personId === me.id && dhakaDay(e.at) >= season.start && dhakaDay(e.at) <= season.end).reduce((s, e) => s + e.points, 0), [v.points, me.id, season.start, season.end]);
  const rank = rankFor(points);
  const next = RANKS[RANKS.findIndex((r) => r.id === rank.id) + 1];
  const badges = useMemo(() => v.badges.filter((b) => b.personId === me.id).sort((a, b) => b.day.localeCompare(a.day)), [v.badges, me.id]);
  const pins = active.flatMap((t) => t.milestones.filter((m) => dhakaDay(m.at) === today).map((m) => ({ ...m, task: t }))).sort((a, b) => a.at.localeCompare(b.at));
  const matches = useMemo(() => v.tasks.filter((t) => t.status === "open" && t.approval !== "pending" && t.skills.some((s) => me.skills.includes(s))).sort((a, b) => a.due.localeCompare(b.due)), [v.tasks, me.skills]);
  const report = v.reports.find((r) => r.personId === me.id && r.day === today);
  const checkin = v.checkins.find((c) => c.personId === me.id && c.day === today);
  const publisher = can(me, "tasks.publish");

  const noteOpen = params.get("note") === "1";
  const [editing, setEditing] = useState<PersonalNote | "new" | null>(null);
  const [learning, setLearning] = useState(false);
  const [newTask, setNewTask] = useState(false);
  const desk = useCapped(active, 6);
  const tickets = useCapped(matches, 5);

  return (
    <>
      <PageHead
        title="My TaskBook"
        lead="Your desk for the day: tasks and their countdowns, today's report, to-dos, notes and your track record. Submit early three times in a row to earn Quick Silver."
        actions={
          <>
            <button type="button" onClick={() => setNewTask(true)} className={hb.outline}>
              <PenLine aria-hidden className="size-4" /> {publisher ? "New ticket" : "New TaskBook task"}
            </button>
            <Link href="/hq/tasks" className={hb.gold}>
              <Plus aria-hidden className="size-4" /> Take a ticket
            </Link>
          </>
        }
      />

      <section aria-label="Today at a glance" className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label="Office today"
          icon={LogIn}
          value={checkin ? clockLabel(checkin.in) : "Not in"}
          sub={checkin ? checkin.late ? <span className="font-semibold text-crimson-bright">Late by {checkin.lateMins} min</span> : checkin.out ? `Left at ${clockLabel(checkin.out)}` : "On time" : "Check in from the top bar"}
          className="[--i:0]"
        />
        <Stat
          label="Daily report"
          icon={ClipboardList}
          field={report ? "navy" : "ink"}
          value={report ? "Sent" : "Not sent"}
          sub={report ? (report.score !== undefined ? `Scored ${report.score}/10` : `At ${clockLabel(report.at)} · +2 points`) : "Worth 2 points, every working day"}
          href="#daily-report"
          className="[--i:1]"
        />
        <Stat
          label="Quick Silver run"
          icon={Zap}
          field="cobalt"
          value={`${streak} of ${QUICK_SILVER_STREAK}`}
          sub={
            <span className="flex items-center gap-1.5" aria-hidden>
              {Array.from({ length: QUICK_SILVER_STREAK }, (_, i) => (
                <span key={i} className={cn("grid size-6 place-items-center rounded-md ring-1", i < streak ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/35 ring-white/20")}>
                  <Zap className="size-3.5" />
                </span>
              ))}
              <span className="ml-1">early in a row</span>
            </span>
          }
          className="[--i:2]"
        />
        <Stat
          label={`Season ${season.label}`}
          icon={Trophy}
          value={num(points)}
          href="/hq/leaderboard"
          sub={
            <>
              <span className="font-semibold text-signal-orange">{rank.label}</span>
              <span>{next ? `${num(next.min - points)} to ${next.label}` : "Top rank"}</span>
              {next ? <Progress value={((points - rank.min) / (next.min - rank.min)) * 100} className="h-1.5 w-full" label={`Progress to ${next.label}`} /> : null}
            </>
          }
          className="[--i:3]"
        />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel
          title="On my desk"
          icon={BookOpenCheck}
          sub={active.length ? `${active.length} active · nearest deadline first` : undefined}
          className="xl:col-span-8"
          action={active.length ? <PanelLink href="/hq/tasks">Task Board</PanelLink> : undefined}
        >
          {active.length === 0 ? (
            <Empty title="Nothing on your desk" icon={BookOpenCheck} action={<Link href="/hq/tasks" className={hb.goldSm}>Find a ticket</Link>}>
              Take a ticket from the Task Board. It lands here with its countdown, and your milestones show up in today&apos;s timeline.
            </Empty>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {desk.shown.map((t) => (
                  <DeskRow key={t.id} t={t} team={t.teamId ? myTeams.get(t.teamId) : undefined} now={now} />
                ))}
              </ul>
              {desk.toggle}
            </>
          )}
        </Panel>

        <Panel title="Today's timeline" icon={CalendarClock} field="ink" sub={dateLabel(now, { weekday: true, now })} className="xl:col-span-4">
          {pins.length === 0 ? (
            <Empty title="No milestones today" icon={CalendarClock} className="py-8">
              Pin meetings, builds and reviews on a task&apos;s timeline and they line up here on their day.
            </Empty>
          ) : (
            <ol className="relative ml-2 flex flex-col gap-4 border-l-2 border-white/10 pl-5">
              {pins.map((p) => (
                <li key={p.id} className="relative">
                  <span aria-hidden className={cn("absolute top-1 -left-[1.72rem] size-3 rounded-full ring-4 ring-text-primary", p.done ? "bg-signal-orange" : Date.parse(p.at) < now ? "bg-national-crimson" : "bg-bdnavy-300")} />
                  <span className="block font-mono text-xs text-signal-orange">
                    {clockLabel(p.at)}
                    {p.done ? " · done" : Date.parse(p.at) < now ? " · missed" : ""}
                  </span>
                  <Link href={`/hq/tasks/${p.task.id}`} className="block text-sm font-semibold text-white hover:text-signal-orange">
                    {p.title}
                  </Link>
                  <span className="block truncate text-xs text-white/55">
                    {p.task.code} · {p.task.title}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <DailyReport key={report?.at ?? "none"} report={report} taskIds={active.map((t) => t.id)} className="xl:col-span-12" />

        <Todos className="xl:col-span-5" />
        <Notes onOpen={setEditing} className="xl:col-span-7" />

        <Panel
          title="Learning"
          icon={GraduationCap}
          field="cobalt"
          sub="A one-week solo project for a skill you want"
          className="xl:col-span-5"
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-white/85">Skills I&apos;m learning</p>
              {me.learning.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {me.learning.map((s) => (
                    <Pill key={s} tone="ink">
                      #{s}
                    </Pill>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-white/70">
                  None yet.{" "}
                  <Link href="/hq/settings" className="font-semibold text-signal-orange hover:underline">
                    Add them in Settings
                  </Link>{" "}
                  so learning projects can match.
                </p>
              )}
            </div>
            {learningTasks.length ? (
              <ul className="flex flex-col gap-2">
                {learningTasks.map((t) => (
                  <li key={t.id}>
                    <Link href={`/hq/tasks/${t.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/10 hover:bg-black/40">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{t.title}</span>
                      {t.approval === "pending" ? <Pill tone="gold">Awaiting approval</Pill> : <Countdown to={t.due} />}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/70">No learning project this week. Ask for one: a lead approves it, then it appears on your desk.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setLearning(true)} className={hb.goldSm}>
                <GraduationCap aria-hidden className="size-3.5" /> Request a learning project
              </button>
              <button type="button" onClick={() => setNewTask(true)} className={hb.quietSm}>
                <PenLine aria-hidden className="size-3.5" /> {publisher ? "New ticket" : "Request a solo task"}
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Tickets for your skills" icon={Sparkles} sub={matches.length ? `${matches.length} open tickets match` : undefined} className="xl:col-span-7" action={<PanelLink href="/hq/tasks">Task Board</PanelLink>}>
          {matches.length === 0 ? (
            <Empty title="No matching tickets right now" icon={Sparkles} className="py-8">
              New tickets for {me.skills.slice(0, 3).map((s) => `#${s}`).join(", ") || "your skills"} show here first. Add more skills in Settings to see more.
            </Empty>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {tickets.shown.map((t) => (
                  <li key={t.id}>
                    <Link href={`/hq/tasks/${t.id}`} className="group grid gap-2 rounded-xl bg-black/25 px-3.5 py-3 ring-1 ring-white/10 transition-colors hover:bg-black/40 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-white/55">{t.code}</span>
                          <Pill tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Pill>
                        </span>
                        <span className="mt-1 block truncate text-sm font-semibold text-white group-hover:text-signal-orange">{t.title}</span>
                      </span>
                      <span className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                        <span className="font-grotesk text-sm font-bold text-signal-orange">{basePoints(t)} pts</span>
                        <Countdown to={t.due} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {tickets.toggle}
            </>
          )}
        </Panel>

        <TrackRecord delivered={delivered} badges={badges} className="xl:col-span-12" />
      </div>

      <NoteDialog
        key={editing === "new" || noteOpen ? "new" : (editing?.id ?? "none")}
        note={noteOpen ? "new" : editing}
        onClose={() => {
          setEditing(null);
          if (noteOpen) router.replace("/hq/taskbook", { scroll: false });
        }}
      />
      <LearningDialog open={learning} onOpenChange={setLearning} learning={me.learning} />
      <NewTicketDialog open={newTask} onOpenChange={setNewTask} />
    </>
  );
}

function DeskRow({ t, team, now }: { t: Task; team?: string; now: number }) {
  const done = t.milestones.filter((m) => m.done).length;
  const upcoming = t.milestones.filter((m) => !m.done).sort((a, b) => a.at.localeCompare(b.at))[0];
  const late = Date.parse(t.due) < now && t.status !== "submitted" && t.status !== "client-review";
  return (
    <li>
      <Link
        href={`/hq/tasks/${t.id}`}
        className={cn(
          "group grid gap-3 rounded-xl bg-black/25 p-4 ring-1 transition-colors hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
          late ? "ring-national-crimson/60" : "ring-white/10 hover:ring-signal-orange/40",
        )}
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-white/55">{t.code}</span>
            <Pill tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Pill>
            <Pill tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Pill>
            {team ? (
              <Pill tone="muted" icon={Users}>
                {team}
              </Pill>
            ) : null}
            {t.approval === "pending" ? <Pill tone="gold">Awaiting approval</Pill> : null}
          </span>
          <span className="mt-1.5 block truncate font-grotesk text-base font-bold text-white group-hover:text-signal-orange">{t.title}</span>
          {t.milestones.length ? (
            <span className="mt-2.5 flex items-center gap-3">
              <Progress value={(done / t.milestones.length) * 100} className="h-1.5 max-w-56 flex-1" label={`${done} of ${t.milestones.length} milestones`} />
              <span className="min-w-0 truncate text-xs text-white/60">
                {done}/{t.milestones.length} milestones{upcoming ? ` · next: ${upcoming.title}` : ""}
              </span>
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
          <Countdown to={t.due} className="text-sm" />
          <span className="text-xs text-white/50">
            Due {dateLabel(t.due, { now })}, {clockLabel(t.due)}
          </span>
        </span>
      </Link>
    </li>
  );
}

function DailyReport({ report, taskIds, className }: { report?: Report; taskIds: string[]; className?: string }) {
  const act = useAct();
  const [writing, setWriting] = useState(!report);
  const [f, setF] = useState({ done: report?.done ?? "", blockers: report?.blockers ?? "", tomorrow: report?.tomorrow ?? "", mood: report?.mood ?? 4 });
  const sub = report ? `Sent at ${clockLabel(report.at)}${report.score !== undefined ? ` · scored ${report.score}/10` : " · not scored yet"}` : "Not sent yet today · +2 points";

  return (
    <Panel
      id="daily-report"
      title="Daily report"
      icon={ClipboardList}
      sub={sub}
      className={cn("scroll-mt-24", className)}
      action={
        report && !writing ? (
          <button type="button" onClick={() => setWriting(true)} className={hb.quietSm}>
            <PenLine aria-hidden className="size-3.5" /> Edit
          </button>
        ) : undefined
      }
    >
      {report && !writing ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <ReportPart label="What I did">{report.done}</ReportPart>
          <ReportPart label="Blockers">{report.blockers || "None"}</ReportPart>
          <ReportPart label="Tomorrow">{report.tomorrow || "—"}</ReportPart>
          <div className="flex items-start gap-3 md:flex-col md:items-end">
            <span className="text-3xl" role="img" aria-label={`Mood ${report.mood} of 5`}>
              {MOODS[report.mood - 1]}
            </span>
            {report.score !== undefined ? <Pill tone="gold">{report.score}/10</Pill> : <Pill>Awaiting score</Pill>}
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act("tasks", "report.submit", { ...f, taskIds }, { ok: report ? "Report updated" : "Report sent (+2 points)" }).then(() => setWriting(false), () => {});
          }}
          className="grid gap-4 lg:grid-cols-2"
        >
          <FormField label="What I did today" hint="Tasks moved, problems solved, people helped.">
            <textarea required value={f.done} onChange={(e) => setF((x) => ({ ...x, done: e.target.value }))} className={cn(textareaCls, "min-h-36")} />
          </FormField>
          <div className="grid gap-4">
            <FormField label="Blockers">
              <textarea value={f.blockers} onChange={(e) => setF((x) => ({ ...x, blockers: e.target.value }))} className={cn(textareaCls, "min-h-14")} />
            </FormField>
            <FormField label="Tomorrow">
              <textarea value={f.tomorrow} onChange={(e) => setF((x) => ({ ...x, tomorrow: e.target.value }))} className={cn(textareaCls, "min-h-14")} />
            </FormField>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 lg:col-span-2">
            <fieldset>
              <legend className="text-sm font-semibold text-white/85">Mood</legend>
              <div className="mt-2 flex gap-2">
                {MOODS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={f.mood === i + 1}
                    aria-label={`Mood ${i + 1} of 5`}
                    onClick={() => setF((x) => ({ ...x, mood: i + 1 }))}
                    className={cn("grid size-11 place-items-center rounded-xl text-xl ring-1 transition-transform motion-reduce:transition-none", f.mood === i + 1 ? "scale-110 bg-white/10 ring-signal-orange" : "ring-white/12 hover:bg-white/5")}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex gap-2">
              {report ? (
                <button type="button" onClick={() => setWriting(false)} className={hb.quiet}>
                  Cancel
                </button>
              ) : null}
              <button type="submit" className={hb.gold}>
                <Check aria-hidden className="size-4" /> {report ? "Update report" : "Send report"}
              </button>
            </div>
          </div>
        </form>
      )}
    </Panel>
  );
}

function ReportPart({ label, children }: { label: string; children: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-black/25 p-4 ring-1 ring-white/10">
      <p className="text-xs font-semibold text-white/55">{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-white/90">{children}</p>
    </div>
  );
}

function Todos({ className }: { className?: string }) {
  const act = useAct();
  const todos = useHq((v) => v.todos);
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const sorted = useMemo(() => [...todos].sort((a, b) => Number(a.done) - Number(b.done) || Number(Boolean(b.urgent)) - Number(Boolean(a.urgent)) || b.at.localeCompare(a.at)), [todos]);
  const left = todos.filter((t) => !t.done).length;
  const { shown, toggle } = useCapped(sorted, 8);
  return (
    <Panel title="To-do list" icon={ListTodo} sub={todos.length ? `${left} left of ${todos.length}` : undefined} className={className}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          await act("me", "todo.add", { text, urgent }, { quiet: true }).catch(() => {});
          setText("");
          setUrgent(false);
        }}
        className="mb-3 flex gap-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a to-do…" aria-label="New to-do" className={inputCls} />
        <button type="button" aria-pressed={urgent} onClick={() => setUrgent((x) => !x)} className={cn(hb.quietSm, "min-h-11", urgent && "bg-national-crimson text-white ring-national-crimson hover:bg-national-crimson hover:text-white")}>
          Urgent
        </button>
        <button type="submit" aria-label="Add to-do" className={cn(hb.gold, "px-3")}>
          <Plus aria-hidden className="size-4" />
        </button>
      </form>
      {todos.length === 0 ? <p className="px-1 py-3 text-sm text-white/60">Small things you mustn&apos;t forget. Mark one urgent and it stays on top in red.</p> : null}
      <ul className="flex flex-col gap-1">
        {shown.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5">
            <button
              type="button"
              onClick={() => act("me", "todo.toggle", { id: t.id }, { quiet: true })}
              aria-label={t.done ? `Mark "${t.text}" not done` : `Mark "${t.text}" done`}
              className={cn("grid size-6 shrink-0 place-items-center rounded-md ring-2", t.done ? "bg-signal-orange ring-signal-orange" : "ring-white/40 hover:ring-signal-orange")}
            >
              {t.done ? <Check aria-hidden className="size-4 text-text-primary" /> : null}
            </button>
            <span className={cn("min-w-0 flex-1 text-sm", t.done ? "text-white/40 line-through" : "text-white")}>{t.text}</span>
            {t.urgent && !t.done ? <Pill tone="red">Urgent</Pill> : null}
            <button type="button" onClick={() => act("me", "todo.remove", { id: t.id }, { quiet: true })} aria-label={`Delete "${t.text}"`} className={cn(hb.iconSm, "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100")}>
              <Trash2 aria-hidden className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      {toggle}
    </Panel>
  );
}

function Notes({ onOpen, className }: { onOpen: (n: PersonalNote | "new") => void; className?: string }) {
  const notes = useHq((v) => v.notes);
  const sorted = useMemo(() => [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at)), [notes]);
  const { shown, toggle } = useCapped(sorted, 4);
  return (
    <Panel
      title="Notes"
      icon={NotebookPen}
      sub={notes.length ? `${notes.length} private notes` : undefined}
      className={className}
      action={
        <button type="button" onClick={() => onOpen("new")} className={hb.quietSm}>
          <Plus aria-hidden className="size-3.5" /> New note
        </button>
      }
    >
      {notes.length === 0 ? (
        <Empty title="No notes yet" icon={NotebookPen} className="py-8">
          Ideas, meeting notes, passwords you&apos;re not allowed to keep here. Only you can read them; pin the ones you need every day.
        </Empty>
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {shown.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onOpen(n)}
                  className={cn("flex h-full min-h-32 w-full flex-col gap-2 rounded-2xl p-4 text-left ring-1 ring-white/12 transition-[translate] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:hover:translate-y-0", FIELD[n.color])}
                >
                  <span className="flex items-center gap-2 font-grotesk font-bold text-signal-orange">
                    {n.pinned ? <Pin aria-label="Pinned" className="size-3.5 shrink-0" /> : null}
                    <span className="truncate">{n.title || "Untitled"}</span>
                  </span>
                  <span className="line-clamp-4 text-sm whitespace-pre-line text-white/80">{n.body}</span>
                </button>
              </li>
            ))}
          </ul>
          {toggle}
        </>
      )}
    </Panel>
  );
}

function TrackRecord({ delivered, badges, className }: { delivered: Task[]; badges: { id: string; kind: BadgeKind; day: string; note?: string }[]; className?: string }) {
  const tasks = useCapped(delivered, 5);
  const awards = useCapped(badges, 5);
  const earned = delivered.reduce((s, t) => s + (t.awarded ?? 0), 0);
  return (
    <Panel title="Track record" icon={Trophy} sub={delivered.length ? `${delivered.length} delivered · ${num(earned)} points from tasks` : undefined} className={className}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white/85">Delivered</h3>
          {delivered.length === 0 ? (
            <p className="rounded-xl px-4 py-6 text-sm text-white/60 ring-1 ring-white/10 ring-inset">Finished tasks and the points they earned collect here. An early, accurate first delivery is the best start.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {tasks.shown.map((t) => (
                  <li key={t.id}>
                    <Link href={`/hq/tasks/${t.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-black/25 px-3.5 py-2.5 ring-1 ring-white/10 hover:bg-black/40">
                      <span className="font-mono text-xs text-white/55">{t.code}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{t.title}</span>
                      {t.submittedAt ? isAdvance(t) ? <Pill tone="gold">Early</Pill> : Date.parse(t.submittedAt) > Date.parse(t.due) ? <Pill tone="red">Late</Pill> : <Pill>On time</Pill> : null}
                      {t.review ? <span className="text-xs text-white/60">Accuracy {t.review.accuracy}/5</span> : null}
                      <span className="font-grotesk text-sm font-bold text-signal-orange tabular-nums">+{num(t.awarded ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {tasks.toggle}
            </>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white/85">Badges</h3>
          {badges.length === 0 ? (
            <p className="rounded-xl px-4 py-6 text-sm text-white/60 ring-1 ring-white/10 ring-inset">Your first Quick Silver is three early submissions away. Man of the day goes to the best daily report.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {awards.shown.map((b) => {
                  const Icon = BADGE_ICON[b.kind];
                  return (
                    <li key={b.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3.5 py-2.5 ring-1 ring-white/10">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-signal-orange text-text-primary">
                        <Icon aria-hidden className="size-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{BADGE_LABEL[b.kind]}</span>
                        {b.note ? <span className="block truncate text-xs text-white/60">{b.note}</span> : null}
                      </span>
                      <span className="shrink-0 text-xs text-white/50">{dateLabel(b.day)}</span>
                    </li>
                  );
                })}
              </ul>
              {awards.toggle}
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

function NoteDialog({ note, onClose }: { note: PersonalNote | "new" | null; onClose: () => void }) {
  const act = useAct();
  const existing = note && note !== "new" ? note : null;
  const [f, setF] = useState({ title: existing?.title ?? "", body: existing?.body ?? "", pinned: existing?.pinned ?? false, color: existing?.color ?? ("navy" as PersonalNote["color"]) });
  return (
    <HqDialog
      open={note !== null}
      onOpenChange={(o) => !o && onClose()}
      title={existing ? "Edit note" : "New note"}
      footer={
        <>
          {existing ? (
            <button type="button" onClick={() => act("me", "note.remove", { id: existing.id }, { ok: "Note deleted" }).then(onClose, () => {})} className={hb.quiet}>
              <Trash2 aria-hidden className="size-4" /> Delete
            </button>
          ) : null}
          <button type="button" onClick={() => act("me", "note.save", { ...f, id: existing?.id }, { ok: "Note saved" }).then(onClose, () => {})} className={hb.gold}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Title">
          <input value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} className={inputCls} autoFocus />
        </FormField>
        <FormField label="Note">
          <textarea value={f.body} onChange={(e) => setF((x) => ({ ...x, body: e.target.value }))} className={cn(textareaCls, "min-h-40")} />
        </FormField>
        <div className="flex flex-wrap items-center gap-3">
          {(["navy", "ink", "cobalt"] as const).map((c) => (
            <button key={c} type="button" aria-pressed={f.color === c} aria-label={`${c} note`} onClick={() => setF((x) => ({ ...x, color: c }))} className={cn("size-9 rounded-xl ring-2", FIELD[c], f.color === c ? "ring-signal-orange" : "ring-white/15")} />
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={f.pinned} onChange={(e) => setF((x) => ({ ...x, pinned: e.target.checked }))} className="size-4 accent-[#e4b027]" /> Pin to the top
          </label>
        </div>
      </div>
    </HqDialog>
  );
}

function LearningDialog({ open, onOpenChange, learning }: { open: boolean; onOpenChange: (o: boolean) => void; learning: string[] }) {
  const act = useAct();
  const [skill, setSkill] = useState(learning[0] ?? "");
  const [idea, setIdea] = useState("");
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request a weekly learning project"
      description="A one-week solo project to learn a new skill. A lead approves it, then it appears on your desk."
      size="sm"
      footer={
        <button type="button" disabled={!skill || idea.trim().length < 5} onClick={() => act("tasks", "learn", { skill, idea }, { ok: "Sent for approval" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>
          Send request
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Skill to learn" hint={learning.length ? undefined : "Add skills you're learning in Settings."}>
          <input list="learning-skills" value={skill} onChange={(e) => setSkill(e.target.value)} className={selectCls} />
          <datalist id="learning-skills">
            {learning.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Project idea">
          <textarea value={idea} onChange={(e) => setIdea(e.target.value)} className={textareaCls} placeholder="What will you build or study this week?" />
        </FormField>
      </div>
    </HqDialog>
  );
}
