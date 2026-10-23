"use client";

import Link from "next/link";
import { type LucideIcon, AlarmClock, CalendarDays, Check, Crown, Flame, Medal, ShieldAlert, ShieldCheck, Siren, Trophy, X, Zap } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ROLE_BRIEF } from "@/data/hq/roles";
import { nameOf, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, axisProps, CHART, ChartTip, Countdown, Empty, type Field, FIELD, hb, Panel, PanelLink, Pill, Progress } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago, clockLabel, dateLabel, MONTHS_SHORT } from "@/lib/hq/format";
import { addDays, dhakaDay, LEVEL_LABEL, num, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/hq/rules";
import { leaderboard, lutherKing, rankFor, RANKS, seasonOf, weekStart } from "@/lib/hq/scoring";
import type { Approval, CalEvent, HqView, Person, Task, TaskStatus } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

/**
 * The pieces every Command Center is built from. Each level gets its own
 * room (components/hq/home/*-room.tsx) assembled from these, so the rooms
 * differ in what they show, never in how a list, a figure or a decision
 * looks. Lists are capped and link to their full page: no panel scrolls.
 */

export const IN_WORK: TaskStatus[] = ["taken", "in-progress", "submitted", "client-review"];
export const BADGE_LABEL = { "quick-silver": "Quick Silver", "iron-man": "Iron Man", "man-of-the-day": "Man of the day", "luther-king": "Luther King", shield: "Shield", helper: "Helper" } as const;

export function greeting(now: number): string {
  const h = new Date(now + 6 * 3600_000).getUTCHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** The urgent priorities show red; the rest stay navy. */
export function priorityTone(t: Pick<Task, "priority">): "red" | "navy" {
  return t.priority === "immediate" || t.priority === "urgent" ? "red" : "navy";
}

/** A grid of headline figures: two across on phones, up to `cols` on wide screens. */
export function StatRow({ children, cols = 6 }: { children: ReactNode; cols?: 4 | 6 | 8 }) {
  return (
    <section aria-label="Key numbers" className={cn("grid grid-cols-2 gap-3 md:grid-cols-3", cols === 4 ? "xl:grid-cols-4" : cols === 6 ? "xl:grid-cols-6" : "xl:grid-cols-4 min-[100rem]:grid-cols-8")}>
      {children}
    </section>
  );
}

/** The room's header: date, greeting, the level's room name and mission, today's summary, actions. */
export function RoomHead({ summary, actions }: { summary: ReactNode; actions?: ReactNode }) {
  const me = useHq((v) => v.me.person);
  const now = useNow(60_000);
  const brief = ROLE_BRIEF[me.level];
  const first = me.demo ? me.name : me.name.split(" ")[0];
  return (
    <header className="hq-rise grid gap-6 rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/65">
          <Pill tone="gold">{brief.room}</Pill>
          <span>{LEVEL_LABEL[me.level]}</span>
          <span aria-hidden>·</span>
          <span>
            {dateLabel(now, { weekday: true, long: true, year: true })} · {clockLabel(now)}
          </span>
        </div>
        <h1 className="mt-3 font-grotesk text-3xl font-bold tracking-tight text-signal-orange sm:text-4xl">
          {greeting(now)}, {first}
        </h1>
        <p className="mt-1.5 text-sm text-white/60">{brief.mission}</p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/85">{summary}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 xl:justify-end">{actions}</div> : null}
    </header>
  );
}

/** One row of a task list: code, title, who has it, priority and the clock. */
export function TaskRow({ t, showTaker, people, action }: { t: Task; showTaker?: boolean; people: Map<string, Person>; action?: ReactNode }) {
  const taker = t.takenBy ? people.get(t.takenBy) : undefined;
  const live = IN_WORK.includes(t.status) && t.status !== "submitted" && t.status !== "client-review";
  return (
    <li className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
      <Link href={`/hq/tasks/${t.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
        {showTaker ? <Avatar person={taker} size="sm" /> : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{t.title}</span>
          <span className="block truncate text-xs text-white/55">
            <span className="font-mono">{t.code}</span>
            {showTaker ? ` · ${taker ? taker.name : "Not taken"}` : ""} · {STATUS_LABEL[t.status]}
          </span>
        </span>
      </Link>
      <Pill tone={priorityTone(t)} className="hidden sm:inline-flex">
        {PRIORITY_LABEL[t.priority]}
      </Pill>
      {action ?? (live || t.status === "open" ? <Countdown to={t.due} className="shrink-0 text-right whitespace-nowrap" /> : null)}
    </li>
  );
}

/** A capped task list with an empty state that says what to do next. */
export function TaskList({ tasks, max = 5, showTaker, empty, rowAction }: { tasks: Task[]; max?: number; showTaker?: boolean; empty: ReactNode; rowAction?: (t: Task) => ReactNode }) {
  const people = usePeople();
  if (tasks.length === 0) return <>{empty}</>;
  return (
    <ul className="flex flex-col gap-2">
      {tasks.slice(0, max).map((t) => (
        <TaskRow key={t.id} t={t} showTaker={showTaker} people={people} action={rowAction?.(t)} />
      ))}
      {tasks.length > max ? <li className="px-1 pt-1 text-xs text-white/55">and {tasks.length - max} more</li> : null}
    </ul>
  );
}

/** Pending decisions this member may take, newest first. */
export function useDecisions(): Approval[] {
  const v = useHq();
  return useMemo(() => {
    const me = v.me.person.id;
    return v.approvals
      .filter((a) => a.status === "pending" && (v.me.isPrime || (a.by !== me && v.me.perms.includes(a.perm))))
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [v.approvals, v.me]);
}

export function DecisionsPanel({ items, max = 5, className }: { items: Approval[]; max?: number; className?: string }) {
  const act = useAct();
  const decide = (id: string, accepted: boolean) => act("approvals", "decide", { id, accepted }, { ok: accepted ? "Approved" : "Rejected" }).catch(() => {});
  return (
    <Panel title="Waiting for your decision" icon={Check} sub={items.length ? `${items.length} pending` : undefined} className={className} action={<PanelLink href="/hq/approvals">All approvals</PanelLink>}>
      {items.length === 0 ? (
        <Empty title="Nothing waits for you" icon={Check} className="py-6">
          Requests for teams, leave, solo tasks and content land here.
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.slice(0, max).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-snug font-semibold text-white">{a.title}</span>
                <span className="block text-xs text-white/55">
                  {a.kind.replace("-", " ")} · {dateLabel(a.at)}
                </span>
              </span>
              {a.kind === "application" ? (
                <Link href="/hq/approvals" className={hb.outlineSm}>
                  Review
                </Link>
              ) : (
                <span className="flex gap-1.5">
                  <button type="button" onClick={() => decide(a.id, true)} className={hb.goldSm} aria-label={`Approve: ${a.title}`}>
                    <Check aria-hidden className="size-3.5" /> Approve
                  </button>
                  <button type="button" onClick={() => decide(a.id, false)} className={hb.quietSm} aria-label={`Reject: ${a.title}`}>
                    <X aria-hidden className="size-3.5" />
                  </button>
                </span>
              )}
            </li>
          ))}
          {items.length > max ? <li className="px-1 pt-1 text-xs text-white/55">and {items.length - max} more in Approvals</li> : null}
        </ul>
      )}
    </Panel>
  );
}

export function MeetingsPanel({ events, className, field }: { events: CalEvent[]; className?: string; field?: Field }) {
  const now = useNow(60_000);
  return (
    <Panel title="Today's meetings" icon={CalendarDays} field={field} className={className} action={<PanelLink href="/hq/calendar">Calendar</PanelLink>}>
      {events.length === 0 ? (
        <Empty title="No meetings today" icon={CalendarDays} className="py-6" />
      ) : (
        <ul className="flex flex-col gap-2">
          {events.slice(0, 5).map((e) => {
            const live = Date.parse(e.start) <= now && Date.parse(e.end) >= now;
            return (
              <li key={e.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
                <span className={cn("w-18 shrink-0 font-mono text-xs font-bold", live ? "text-signal-orange" : "text-white/70")}>{clockLabel(e.start)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{e.title}</span>
                  <span className="block truncate text-xs text-white/55">
                    {e.attendees.length} people{e.location ? ` · ${e.location}` : ""}
                  </span>
                </span>
                {live ? <Pill tone="gold">Now</Pill> : Date.parse(e.start) > now ? <Countdown to={e.start} suffix="to go" /> : <Pill>Done</Pill>}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/** Today's meetings, optionally only the ones a member attends. */
export function useMeetings(onlyMine?: boolean): CalEvent[] {
  const v = useHq();
  const today = useToday();
  return useMemo(
    () => v.events.filter((e) => dhakaDay(e.start) === today && e.kind !== "leave" && (!onlyMine || e.attendees.includes(v.me.person.id))).sort((a, b) => a.start.localeCompare(b.start)),
    [v.events, v.me.person.id, today, onlyMine],
  );
}

/** Urgent chat alerts, crisis notes and overdue work, newest first. */
export function UrgentPanel({ className, teamIds }: { className?: string; teamIds?: Set<string> }) {
  const v = useHq();
  const now = useNow(60_000);
  const people = usePeople();
  const items = useMemo(() => {
    const out: { id: string; at: string; text: string; href: string; icon: LucideIcon }[] = [];
    for (const m of v.messages) if (m.urgent && !m.deleted && Date.parse(m.at) > now - 2 * 86400_000) out.push({ id: m.id, at: m.at, text: `${nameOf(people, m.by)}: ${m.text}`, href: `/hq/chat?c=${m.channelId}`, icon: Siren });
    for (const t of v.teams) {
      if (teamIds && !teamIds.has(t.id)) continue;
      for (const s of t.stickies) if (s.level === "crisis" && !s.resolved) out.push({ id: s.id, at: s.at, text: `${t.name}: ${s.text}`, href: `/hq/teams/${t.id}`, icon: ShieldAlert });
    }
    for (const t of v.tasks) {
      if (!IN_WORK.includes(t.status) || Date.parse(t.due) >= now) continue;
      if (teamIds && !(t.teamId && teamIds.has(t.teamId))) continue;
      out.push({ id: t.id, at: t.due, text: `Overdue: ${t.code} ${t.title}`, href: `/hq/tasks/${t.id}`, icon: AlarmClock });
    }
    return out.sort((a, b) => b.at.localeCompare(a.at));
  }, [v.messages, v.teams, v.tasks, people, now, teamIds]);

  return (
    <Panel title="Urgent" icon={Siren} sub="Alerts, crises and overdue work" className={className}>
      {items.length === 0 ? (
        <Empty title="All calm" icon={Check} className="py-6">
          Nothing urgent right now.
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.slice(0, 5).map((u) => (
            <li key={u.id}>
              <Link href={u.href} className="flex items-start gap-3 rounded-xl bg-national-crimson/10 px-3 py-2.5 ring-1 ring-national-crimson/45 transition-colors hover:bg-black/40">
                <u.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-crimson-bright" />
                <span className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-white/90">{u.text}</span>
                <span className="shrink-0 text-xs text-white/50">{ago(u.at, now)}</span>
              </Link>
            </li>
          ))}
          {items.length > 5 ? <li className="px-1 pt-1 text-xs text-white/55">and {items.length - 5} more</li> : null}
        </ul>
      )}
    </Panel>
  );
}

/** Tickets submitted and opened over the last two weeks. */
export function FlowPanel({ tasks, className, title = "Task flow, last 14 days" }: { tasks: Task[]; className?: string; title?: string }) {
  const today = useToday();
  const data = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = addDays(today, i - 13);
        return {
          day: `${Number(d.slice(8))} ${MONTHS_SHORT[Number(d.slice(5, 7)) - 1]}`,
          done: tasks.filter((t) => t.submittedAt && dhakaDay(t.submittedAt) === d).length,
          created: tasks.filter((t) => dhakaDay(t.createdAt) === d).length,
        };
      }),
    [tasks, today],
  );
  return (
    <Panel title={title} icon={Flame} sub="Submitted against new tickets" className={className} bodyClassName="flex flex-col" action={<PanelLink href="/hq/reports">Reports</PanelLink>}>
      <div className="min-h-60 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="day" {...axisProps} interval={2} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip content={<ChartTip />} />
            <Area type="monotone" dataKey="created" name="New tickets" stroke={CHART.blue} fill={CHART.blue} fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="done" name="Submitted" stroke={CHART.gold} fill={CHART.gold} fillOpacity={0.2} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/** The season's top five, or the top of a given group (a team). */
export function LeaderPanel({ ids, title, className, field }: { ids?: string[]; title?: string; className?: string; field?: Field }) {
  const v = useHq();
  const today = useToday();
  const people = usePeople();
  const season = seasonOf(today);
  const rows = useMemo(() => {
    const pool = ids ?? v.people.filter((p) => p.status === "active" && !p.demo).map((p) => p.id);
    return leaderboard(v.points, pool, season.start, season.end).slice(0, 5);
  }, [v.points, v.people, ids, season.start, season.end]);
  const max = Math.max(1, rows[0]?.points ?? 0);
  return (
    <Panel title={title ?? `Leaderboard · ${season.label}`} icon={Trophy} field={field} className={className} action={<PanelLink href="/hq/leaderboard">Full board</PanelLink>}>
      {rows.length === 0 ? (
        <Empty title="No points yet this season" icon={Trophy} className="py-6" />
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((r, i) => {
            const p = people.get(r.personId);
            return (
              <li key={r.personId} className="flex items-center gap-3">
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg font-grotesk text-sm font-bold", i === 0 ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/80")}>{i + 1}</span>
                <Avatar person={p} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-white">{p?.name}</span>
                    <span className="shrink-0 font-mono text-xs font-bold text-signal-orange">{num(r.points)} pts</span>
                  </span>
                  <Progress value={(Math.max(0, r.points) / max) * 100} className="mt-1.5 h-1.5" label={`${p?.name}: ${r.points} points`} />
                </span>
                <span className="hidden w-24 shrink-0 text-right text-xs text-white/60 sm:block">{rankFor(r.points).label}</span>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

/** Takes, submissions, stories and badges as one feed. */
export function ActivityPanel({ ids, className, max = 8 }: { ids?: Set<string>; className?: string; max?: number }) {
  const v = useHq();
  const now = useNow(60_000);
  const people = usePeople();
  const feed = useMemo(() => {
    const out: { id: string; at: string; who: string; text: string; href: string }[] = [];
    for (const t of v.tasks) {
      if (t.takenAt) out.push({ id: `${t.id}-take`, at: t.takenAt, who: t.takenBy ?? "", text: `took ${t.code} ${t.title}`, href: `/hq/tasks/${t.id}` });
      if (t.submittedAt) out.push({ id: `${t.id}-sub`, at: t.submittedAt, who: t.takenBy ?? "", text: `submitted ${t.code} ${t.title}`, href: `/hq/tasks/${t.id}` });
    }
    for (const s of v.stories) out.push({ id: s.id, at: s.at, who: s.by, text: `shared a story: ${s.title}`, href: "/hq/wall" });
    for (const b of v.badges) out.push({ id: b.id, at: `${b.day}T12:00:00.000Z`, who: b.personId, text: `earned ${BADGE_LABEL[b.kind]}`, href: "/hq/leaderboard" });
    return out.filter((f) => !ids || ids.has(f.who)).sort((a, b) => b.at.localeCompare(a.at));
  }, [v.tasks, v.stories, v.badges, ids]);
  return (
    <Panel title="Activity" icon={Flame} className={className}>
      {feed.length === 0 ? (
        <Empty title="Quiet so far" className="py-6" />
      ) : (
        <ul className="grid gap-x-6 gap-y-3 md:grid-cols-2">
          {feed.slice(0, max).map((f) => (
            <li key={f.id}>
              <Link href={f.href} className="flex items-start gap-3 rounded-lg p-1 transition-colors hover:bg-white/5">
                <Avatar person={people.get(f.who)} size="sm" />
                <span className="min-w-0 flex-1 text-sm leading-snug text-white/80">
                  <span className="font-semibold text-white">{nameOf(people, f.who)}</span> {f.text}
                </span>
                <span className="shrink-0 text-xs text-white/45">{ago(f.at, now)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Spotlight({ icon: Icon, title, person, note, field = "navy", href = "/hq/leaderboard" }: { icon: LucideIcon; title: string; person?: Person; note: string; field?: Field; href?: string }) {
  return (
    <Link href={href} className={cn("hq-rise flex min-w-0 flex-col gap-3 rounded-2xl p-4 ring-1 ring-white/12 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:hover:translate-y-0", FIELD[field])}>
      <span className="flex items-center gap-2 font-grotesk text-sm font-bold text-signal-orange">
        <Icon aria-hidden className="size-4.5" /> {title}
      </span>
      {person ? (
        <span className="flex items-center gap-3">
          <Avatar person={person} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-white">{person.name}</span>
            <span className="block truncate text-xs text-white/60">{person.designation}</span>
          </span>
        </span>
      ) : (
        <span className="text-sm font-semibold text-white/70">Nobody yet</span>
      )}
      <span className="line-clamp-2 text-xs leading-relaxed text-white/65">{note}</span>
    </Link>
  );
}

/** Quick Silver, Iron Man, Man of the day and the week's Luther King. */
export function Spotlights({ className }: { className?: string }) {
  const v = useHq();
  const today = useToday();
  const people = usePeople();
  const latest = (kind: keyof typeof BADGE_LABEL) => v.badges.filter((b) => b.kind === kind).reduce<(typeof v.badges)[number] | undefined>((best, b) => (!best || b.day > best.day ? b : best), undefined);
  const qs = latest("quick-silver");
  const iron = latest("iron-man");
  const motd = latest("man-of-the-day");
  const king = lutherKing(v.cases, Object.fromEntries(v.articles.map((a) => [a.id, a.crimePoints])), today);
  const kingCases = king ? v.cases.filter((c) => c.accusedId === king && c.verdict?.guilty && dhakaDay(c.verdict.at) >= weekStart(today)).length : 0;
  return (
    <section aria-label="Spotlight" className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      <Spotlight icon={Zap} title="Quick Silver" person={qs && people.get(qs.personId)} note={qs ? `${qs.note ?? "Three early submissions in a row"} · ${dateLabel(qs.day)}` : "Three early submissions in a row"} />
      <Spotlight icon={ShieldCheck} title="Iron Man" person={iron && people.get(iron.personId)} note={iron?.note ?? "A team leader whose client rated the delivery 4.5 or more"} field="cobalt" />
      <Spotlight icon={Medal} title="Man of the day" person={motd && people.get(motd.personId)} note={motd ? `${motd.note ?? "Best daily report"} · ${dateLabel(motd.day)}` : "The best daily report"} field="ink" />
      <Spotlight icon={Crown} title="Luther King of the week" person={king ? people.get(king) : undefined} note={king ? `${kingCases} verdict${kingCases === 1 ? "" : "s"} this week. Better luck next week!` : "A clean week: nobody holds the title"} href="/hq/shongbidhan" />
    </section>
  );
}

/** A member's own season: points, rank, progress to the next rank, latest badges. */
export function SeasonPanel({ className }: { className?: string }) {
  const v = useHq();
  const today = useToday();
  const me = v.me.person.id;
  const season = seasonOf(today);
  const points = useMemo(() => v.points.filter((e) => e.personId === me && dhakaDay(e.at) >= season.start && dhakaDay(e.at) <= season.end).reduce((s, e) => s + e.points, 0), [v.points, me, season.start, season.end]);
  const rank = rankFor(points);
  const next = RANKS[RANKS.findIndex((r) => r.id === rank.id) + 1];
  const badges = v.badges.filter((b) => b.personId === me);
  return (
    <Panel title={`My season · ${season.label}`} icon={Trophy} field="cobalt" className={className} action={<PanelLink href="/hq/leaderboard">Ranks</PanelLink>}>
      <p className="font-grotesk text-4xl leading-none font-bold text-white tabular-nums">{num(points)}</p>
      <p className="mt-1.5 text-sm text-white/75">
        points · <strong className="text-signal-orange">{rank.label}</strong>
      </p>
      {next ? (
        <>
          <Progress value={((points - rank.min) / (next.min - rank.min)) * 100} className="mt-4" label="Progress to the next rank" />
          <p className="mt-2 text-xs text-white/65">
            {num(Math.max(0, next.min - points))} points to {next.label}
          </p>
        </>
      ) : (
        <p className="mt-4 text-xs text-white/65">Top rank reached this season.</p>
      )}
      {badges.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {badges.slice(-5).map((b) => (
            <Pill key={b.id} tone="gold">
              {BADGE_LABEL[b.kind]}
            </Pill>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}

/** Every active team as a compact pulse: leader, members, work in hand, crisis notes. */
export function TeamsPulse({ className, teams }: { className?: string; teams?: HqView["teams"] }) {
  const v = useHq();
  const people = usePeople();
  const list = (teams ?? v.teams).filter((t) => t.status === "active");
  return (
    <Panel title="Teams" icon={ShieldCheck} sub={`${list.length} active`} className={className} action={<PanelLink href="/hq/teams">All teams</PanelLink>}>
      {list.length === 0 ? (
        <Empty title="No active teams" className="py-6" />
      ) : (
        <ul className="flex flex-col gap-2">
          {list.slice(0, 5).map((t) => {
            const work = v.tasks.filter((x) => x.teamId === t.id && IN_WORK.includes(x.status)).length;
            const crisis = t.stickies.filter((s) => s.level === "crisis" && !s.resolved).length;
            return (
              <li key={t.id}>
                <Link href={`/hq/teams/${t.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                  <Avatar person={people.get(t.leaderId)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{t.name}</span>
                    <span className="block truncate text-xs text-white/55">
                      {nameOf(people, t.leaderId)} · {t.memberIds.length + 1} people · {work} in work
                    </span>
                  </span>
                  {crisis ? <Pill tone="red">{crisis} crisis</Pill> : <Pill tone="navy">Steady</Pill>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/** A labelled bar row for small distributions (lanes, stages, departments). */
export function BarRow({ label, value, max, hint, tone = "gold", href }: { label: string; value: number; max: number; hint?: string; tone?: "gold" | "navy" | "red"; href?: string }) {
  const body = (
    <>
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate font-semibold text-white">{label}</span>
        <span className="shrink-0 font-mono text-xs text-white/70">{hint ?? num(value)}</span>
      </span>
      <Progress value={(value / Math.max(1, max)) * 100} tone={tone} className="mt-1.5 h-1.5" label={`${label}: ${value}`} />
    </>
  );
  return <li>{href ? <Link href={href} className="block rounded-lg p-1 transition-colors hover:bg-white/5">{body}</Link> : <div className="p-1">{body}</div>}</li>;
}
