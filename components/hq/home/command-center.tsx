"use client";

import Link from "next/link";
import {
  Activity,
  AlarmClock,
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  Check,
  Crown,
  Flame,
  Handshake,
  LayoutGrid,
  LifeBuoy,
  ListTodo,
  Medal,
  ShieldAlert,
  Siren,
  Sparkles,
  Trash2,
  TriangleAlert,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, useInOffice, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, axisProps, CHART, ChartTip, Countdown, Empty, hb, inputCls, Pill, Panel, PanelLink, Progress, Stat } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { balance, monthly, totals } from "@/lib/hq/finance";
import { ago, clockLabel, dateLabel, MONTHS_SHORT } from "@/lib/hq/format";
import { addDays, can, dhakaDay, num, PRIORITY_LABEL, taka } from "@/lib/hq/rules";
import { leaderboard, lutherKing, rankFor, RANKS, seasonOf, weekStart } from "@/lib/hq/scoring";
import type { HqView } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const BADGE_LABEL = { "quick-silver": "Quick Silver", "iron-man": "Iron Man", "man-of-the-day": "Man of the day", "luther-king": "Luther King", shield: "Shield", helper: "Helper" } as const;

function greeting(now: number): string {
  const h = new Date(now + 6 * 3600_000).getUTCHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function CommandCenter() {
  const v = useHq();
  const full = v.me.isPrime || v.me.perms.includes("reports.view");
  return full ? <PrimeBoard v={v} /> : <MemberBoard v={v} />;
}

/* ───────────────────────── the super dashboard ───────────────────────── */

function PrimeBoard({ v }: { v: HqView }) {
  const now = useNow(60_000);
  const today = useToday();
  const people = usePeople();
  const inOffice = useInOffice();
  const act = useAct();
  const me = v.me.person;
  const seesMoney = can(me, "finance.view");
  const seesClients = can(me, "clients.view");

  const stats = useMemo(() => {
    const month = today.slice(0, 7);
    const monthTx = v.txns.filter((t) => t.day.startsWith(month));
    const active = v.tasks.filter((t) => t.status === "in-progress" || t.status === "taken" || t.status === "submitted" || t.status === "client-review");
    const open = v.tasks.filter((t) => t.status === "open");
    const overdue = active.filter((t) => Date.parse(t.due) < now);
    const pipeline = v.clients.filter((c) => !["lost", "reviewed"].includes(c.stage)).reduce((s, c) => s + c.value, 0);
    const pending = v.approvals.filter((a) => a.status === "pending" && (v.me.isPrime || v.me.perms.includes(a.perm)));
    return {
      month: totals(monthTx),
      cash: balance(v.txns),
      active,
      open,
      overdue,
      pipeline,
      pending,
      issues: v.issues.filter((i) => i.status !== "solved").length,
      help: v.help.filter((h) => h.status === "open" || h.status === "helping").length,
      active7: v.people.filter((p) => p.status === "active").length,
    };
  }, [v, today, now]);

  const throughput = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(today, i - 13);
      return {
        day: `${Number(d.slice(8))} ${MONTHS_SHORT[Number(d.slice(5, 7)) - 1]}`,
        done: v.tasks.filter((t) => t.submittedAt && dhakaDay(t.submittedAt) === d).length,
        created: v.tasks.filter((t) => dhakaDay(t.createdAt) === d).length,
      };
    });
  }, [v.tasks, today]);
  const money = useMemo(() => monthly(v.txns, now, 6).map((r) => ({ ...r, label: MONTHS_SHORT[Number(r.month.slice(5)) - 1] })), [v.txns, now]);

  const meetings = v.events.filter((e) => dhakaDay(e.start) === today && e.kind !== "leave").sort((a, b) => a.start.localeCompare(b.start));
  const urgentFeed = useMemo(() => {
    const items: { id: string; at: string; text: string; href: string; icon: typeof Siren }[] = [];
    for (const m of v.messages) if (m.urgent && !m.deleted && Date.parse(m.at) > now - 2 * 86400_000) items.push({ id: m.id, at: m.at, text: `${nameOf(people, m.by)}: ${m.text}`, href: `/hq/chat?c=${m.channelId}`, icon: Siren });
    for (const t of v.teams) for (const s of t.stickies) if (s.level === "crisis" && !s.resolved) items.push({ id: s.id, at: s.at, text: `${t.name}: ${s.text}`, href: `/hq/teams/${t.id}`, icon: ShieldAlert });
    for (const t of stats.overdue) items.push({ id: t.id, at: t.due, text: `Overdue: ${t.code} ${t.title}`, href: `/hq/tasks/${t.id}`, icon: AlarmClock });
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  }, [v.messages, v.teams, stats.overdue, people, now]);

  const season = seasonOf(today);
  const board = useMemo(() => leaderboard(v.points, v.people.filter((p) => p.status === "active").map((p) => p.id), season.start, season.end).slice(0, 5), [v.points, v.people, season.start, season.end]);
  const latest = (kind: keyof typeof BADGE_LABEL) => [...v.badges].filter((b) => b.kind === kind).sort((a, b) => b.day.localeCompare(a.day))[0];
  const qs = latest("quick-silver");
  const iron = latest("iron-man");
  const motd = latest("man-of-the-day");
  const articlePoints = Object.fromEntries(v.articles.map((a) => [a.id, a.crimePoints]));
  const king = lutherKing(v.cases, articlePoints, today);
  const kingCases = king ? v.cases.filter((c) => c.accusedId === king && c.verdict?.guilty && dhakaDay(c.verdict.at) >= weekStart(today)) : [];

  const feed = useMemo(() => {
    const items: { id: string; at: string; who: string; text: string; href: string }[] = [];
    for (const t of v.tasks) {
      if (t.takenAt) items.push({ id: `${t.id}-take`, at: t.takenAt, who: t.takenBy ?? "", text: `took ${t.code} ${t.title}`, href: `/hq/tasks/${t.id}` });
      if (t.submittedAt) items.push({ id: `${t.id}-sub`, at: t.submittedAt, who: t.takenBy ?? "", text: `submitted ${t.code} ${t.title}`, href: `/hq/tasks/${t.id}` });
    }
    for (const s of v.stories) items.push({ id: s.id, at: s.at, who: s.by, text: `shared a story: ${s.title}`, href: "/hq/wall" });
    for (const b of v.badges) items.push({ id: b.id, at: `${b.day}T12:00:00.000Z`, who: b.personId, text: `earned ${BADGE_LABEL[b.kind]}`, href: "/hq/leaderboard" });
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  }, [v.tasks, v.stories, v.badges]);

  const [clearing, setClearing] = useState(false);
  const [typed, setTyped] = useState("");
  const samples = v.tasks.some((t) => t.sample) || v.clients.some((c) => c.sample) || v.txns.some((t) => t.sample);

  const decide = (id: string, accepted: boolean) => act("approvals", "decide", { id, accepted }, { ok: accepted ? "Approved" : "Rejected" }).catch(() => {});

  return (
    <div className="flex flex-col gap-5">
      <header className="hq-rise flex flex-col gap-4 rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-white/65">{dateLabel(now, { weekday: true, long: true, year: true })} · {clockLabel(now)}</p>
          <h1 className="mt-2 font-grotesk text-3xl font-bold tracking-tight text-signal-orange sm:text-4xl">
            {greeting(now)}, {me.name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            {inOffice.size} of {stats.active7} people are in the office, {stats.active.length} tasks are moving, {stats.pending.length} decisions wait for you
            {stats.overdue.length ? <span className="text-crimson-bright"> and {stats.overdue.length} {stats.overdue.length === 1 ? "task is" : "tasks are"} overdue</span> : null}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-2 hidden font-grotesk text-lg font-bold text-white/85 xl:block">We turn problems into economy.</p>
          <Link href="/hq/tasks?new=1" className={hb.gold}>
            <LayoutGrid aria-hidden className="size-4" /> New ticket
          </Link>
          <Link href="/hq/approvals" className={hb.outline}>
            <BadgeCheck aria-hidden className="size-4" /> Approvals ({stats.pending.length})
          </Link>
        </div>
      </header>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 md:grid-cols-4 min-[100rem]:grid-cols-8">
        {seesMoney ? <Stat label="Revenue this month" value={taka(stats.month.income, { compact: true })} icon={Banknote} href="/hq/finance" sub="income" className="[--i:0]" /> : null}
        {seesMoney ? <Stat label="Cash balance" value={taka(stats.cash, { compact: true })} icon={Wallet} field="cobalt" href="/hq/finance" className="[--i:1]" /> : null}
        <Stat label="Active tasks" value={stats.active.length} icon={Activity} href="/hq/tasks" sub={stats.overdue.length ? <span className="text-crimson-bright">{stats.overdue.length} overdue</span> : "on track"} className="[--i:2]" />
        <Stat label="Open tickets" value={stats.open.length} icon={LayoutGrid} field="ink" href="/hq/tasks" className="[--i:3]" />
        <Stat label="In office now" value={`${inOffice.size}/${stats.active7}`} icon={Users} href="/hq/attendance" className="[--i:4]" />
        <Stat label="Pending approvals" value={stats.pending.length} icon={BadgeCheck} field="cobalt" href="/hq/approvals" className="[--i:5]" />
        {seesClients ? <Stat label="Pipeline value" value={taka(stats.pipeline, { compact: true })} icon={Handshake} field="ink" href="/hq/clients" className="[--i:6]" /> : null}
        <Stat label="Open issues · help" value={`${stats.issues} · ${stats.help}`} icon={TriangleAlert} href="/hq/issues" className="[--i:7]" />
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
        <Panel title="Task flow, last 14 days" icon={Activity} sub="Submitted vs. new tickets" className="md:col-span-6 xl:col-span-7" action={<PanelLink href="/hq/reports">Reports</PanelLink>}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughput} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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

        <Panel title="Today's meetings" icon={CalendarDays} className="md:col-span-6 xl:col-span-5" action={<PanelLink href="/hq/calendar">Calendar</PanelLink>}>
          {meetings.length === 0 ? (
            <Empty title="No meetings today" icon={CalendarDays} className="py-6" />
          ) : (
            <ul className="flex flex-col gap-2">
              {meetings.map((e) => {
                const live = Date.parse(e.start) <= now && Date.parse(e.end) >= now;
                return (
                  <li key={e.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
                    <span className={cn("w-20 shrink-0 font-mono text-xs font-bold", live ? "text-signal-orange" : "text-white/70")}>{clockLabel(e.start)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{e.title}</span>
                      <span className="block truncate text-xs text-white/55">{e.attendees.length} people{e.location ? ` · ${e.location}` : ""}</span>
                    </span>
                    {live ? <Pill tone="gold">Now</Pill> : Date.parse(e.start) > now ? <Countdown to={e.start} suffix="to go" /> : <Pill>Done</Pill>}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {seesMoney ? (
          <Panel title="Revenue vs. expenses" icon={Banknote} sub="Six months" field="ink" className="md:col-span-6 xl:col-span-7" action={<PanelLink href="/hq/finance">Finance</PanelLink>}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={money} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(x: number) => taka(x, { compact: true }).replace("৳", "")} width={60} />
                  <Tooltip content={<ChartTip format={(x) => taka(x)} />} />
                  <Bar dataKey="income" name="Income" fill={CHART.gold} radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="Expenses" fill={CHART.blue2} radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke={CHART.white} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        ) : null}

        <Panel title="Urgent" icon={Siren} sub="Alerts, crises and overdue tasks" className={cn("md:col-span-6", seesMoney ? "xl:col-span-5" : "xl:col-span-6")}>
          {urgentFeed.length === 0 ? (
            <Empty title="All calm" icon={Check} className="py-6">Nothing urgent right now.</Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {urgentFeed.map((u) => (
                <li key={u.id}>
                  <Link href={u.href} className="flex items-start gap-3 rounded-xl border-l-4 border-national-crimson bg-black/25 px-3 py-2.5 ring-1 ring-white/8 hover:bg-black/40">
                    <u.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-crimson-bright" />
                    <span className="min-w-0 flex-1 text-sm leading-snug text-white/90 line-clamp-2">{u.text}</span>
                    <span className="shrink-0 text-xs text-white/50">{ago(u.at, now)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Waiting for a decision" icon={BadgeCheck} className={cn("md:col-span-6", seesMoney ? "xl:col-span-6" : "xl:col-span-6")} action={<PanelLink href="/hq/approvals">All</PanelLink>}>
          {stats.pending.length === 0 ? (
            <Empty title="Nothing waiting" icon={Check} className="py-6" />
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.pending.slice(0, 5).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
                  <Pill tone="navy">{a.kind.replace("-", " ")}</Pill>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-white">{a.title}</span>
                  {a.kind === "application" ? (
                    <Link href="/hq/approvals" className={hb.outlineSm}>
                      Review
                    </Link>
                  ) : (
                    <span className="flex gap-1.5">
                      <button type="button" onClick={() => decide(a.id, true)} className={hb.goldSm} aria-label={`Approve ${a.title}`}>
                        <Check aria-hidden className="size-3.5" /> Approve
                      </button>
                      <button type="button" onClick={() => decide(a.id, false)} className={hb.quietSm} aria-label={`Reject ${a.title}`}>
                        <X aria-hidden className="size-3.5" />
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <section aria-label="Spotlight" className="grid grid-cols-2 gap-3 md:col-span-6 xl:col-span-6">
          <Spotlight icon={Zap} title="Quick Silver" person={qs && people.get(qs.personId)} note={qs ? `${qs.note ?? ""} · ${dateLabel(qs.day)}` : "Three early submissions in a row"} />
          <Spotlight icon={ShieldAlert} title="Iron Man" person={iron && people.get(iron.personId)} note={iron?.note ?? "A team leader whose client rated the delivery 4.5+"} field="cobalt" />
          <Spotlight icon={Medal} title="Man of the day" person={motd && people.get(motd.personId)} note={motd ? `${motd.note ?? ""} · ${dateLabel(motd.day)}` : "The best daily report"} field="ink" />
          <Spotlight
            icon={Crown}
            title="Luther King of the week"
            person={king ? people.get(king) : undefined}
            note={king ? `${kingCases.length} verdict${kingCases.length === 1 ? "" : "s"} this week — better luck next week!` : "A clean week: nobody holds the title"}
            href="/hq/shongbidhan"
          />
        </section>

        <Panel title={`Leaderboard · ${season.label}`} icon={Trophy} className="md:col-span-6 xl:col-span-6" action={<PanelLink href="/hq/leaderboard">Full board</PanelLink>}>
          <ol className="flex flex-col gap-2">
            {board.map((r, i) => {
              const p = people.get(r.personId);
              const rank = rankFor(r.points);
              const max = board[0]?.points || 1;
              return (
                <li key={r.personId} className="flex items-center gap-3">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg font-grotesk text-sm font-bold", i === 0 ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/80")}>{i + 1}</span>
                  <Avatar person={p} size="sm" online={inOffice.has(r.personId)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-white">{p?.name}</span>
                      <span className="shrink-0 font-mono text-xs font-bold text-signal-orange">{num(r.points)} pts</span>
                    </span>
                    <Progress value={(r.points / max) * 100} className="mt-1 h-1.5" label={`${p?.name} points`} />
                  </span>
                  <Pill tone="navy" className="hidden sm:inline-flex">
                    {rank.label}
                  </Pill>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel title="Team activity" icon={Flame} className="md:col-span-6 xl:col-span-6">
          <ul className="flex flex-col gap-3">
            {feed.map((f) => (
              <li key={f.id}>
                <Link href={f.href} className="flex items-start gap-3 rounded-lg hover:bg-white/5">
                  <Avatar person={people.get(f.who)} size="sm" />
                  <span className="min-w-0 flex-1 text-sm leading-snug text-white/85">
                    <span className="font-semibold text-white">{nameOf(people, f.who)}</span> {f.text}
                  </span>
                  <span className="shrink-0 text-xs text-white/45">{ago(f.at, now)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Quick links" icon={Sparkles} field="ink" className="md:col-span-6 xl:col-span-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { href: "/hq/taskbook", label: "My TaskBook", icon: BookOpenCheck },
              { href: "/hq/chat", label: "Chat", icon: Users },
              { href: "/hq/hr", label: "HR", icon: Briefcase, perm: can(me, "hr.manage") },
              { href: "/hq/finance", label: "Finance", icon: Wallet, perm: seesMoney },
              { href: "/hq/people", label: "People", icon: Users },
              { href: "/hq/access", label: "Access control", icon: ShieldAlert, perm: v.me.isPrime },
            ]
              .filter((x) => x.perm !== false)
              .map((x) => (
                <Link key={x.href} href={x.href} className="flex min-h-12 items-center gap-2 rounded-xl bg-white/6 px-3 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-signal-orange">
                  <x.icon aria-hidden className="size-4 text-signal-orange" /> {x.label}
                </Link>
              ))}
          </div>
          {v.me.isPrime && samples ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/30 px-4 py-3 ring-1 ring-white/10">
              <p className="text-sm text-white/70">Sample data is showing so every page has something in it.</p>
              <button type="button" onClick={() => setClearing(true)} className={hb.quietSm}>
                <Trash2 aria-hidden className="size-3.5" /> Clear sample data
              </button>
            </div>
          ) : null}
        </Panel>
      </div>

      <HqDialog
        open={clearing}
        onOpenChange={setClearing}
        title="Clear all sample data?"
        description="Sample tasks, clients, money, events, content and stories are removed for everyone. Real records stay. Type DELETE to confirm."
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setClearing(false)} className={hb.quiet}>
              Cancel
            </button>
            <button
              type="button"
              disabled={typed !== "DELETE"}
              onClick={async () => {
                const removed = await act<number>("system", "samples.clear", { confirm: "DELETE" }).catch(() => null);
                if (removed !== null) {
                  setClearing(false);
                  setTyped("");
                }
              }}
              className={hb.danger}
            >
              Clear sample data
            </button>
          </>
        }
      >
        <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE" className={inputCls} aria-label="Type DELETE to confirm" />
      </HqDialog>
    </div>
  );
}

function Spotlight({ icon: Icon, title, person, note, field = "navy", href = "/hq/leaderboard" }: { icon: typeof Zap; title: string; person?: { name: string; photo?: string | null; designation: string }; note: string; field?: "navy" | "cobalt" | "ink"; href?: string }) {
  return (
    <Link href={href} className={cn("hq-rise flex flex-col gap-3 rounded-2xl p-4 ring-1 ring-white/12 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0", field === "navy" ? "bg-bdnavy-900" : field === "cobalt" ? "bg-cobalt" : "bg-text-primary")}>
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

/* ───────────────────────── a member's day ───────────────────────── */

function MemberBoard({ v }: { v: HqView }) {
  const now = useNow(60_000);
  const today = useToday();
  const people = usePeople();
  const act = useAct();
  const me = v.me.person;
  const mine = v.tasks.filter((t) => (t.takenBy === me.id || v.teams.some((tm) => tm.id === t.teamId && tm.memberIds.includes(me.id))) && ["taken", "in-progress", "submitted"].includes(t.status)).sort((a, b) => a.due.localeCompare(b.due));
  const matches = v.tasks.filter((t) => t.status === "open" && t.skills.some((s) => me.skills.includes(s))).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 6);
  const season = seasonOf(today);
  const myPoints = v.points.filter((e) => e.personId === me.id && dhakaDay(e.at) >= season.start).reduce((s, e) => s + e.points, 0);
  const rank = rankFor(myPoints);
  const next = RANKS[RANKS.findIndex((r) => r.id === rank.id) + 1];
  const meetings = v.events.filter((e) => dhakaDay(e.start) === today && e.attendees.includes(me.id)).sort((a, b) => a.start.localeCompare(b.start));
  const help = v.help.filter((h) => h.status === "open" && h.capable.includes(me.id));
  const invites = v.teams.filter((t) => t.invites.some((i) => i.personId === me.id && i.status === "pending") && t.status === "active");
  const todos = v.todos.filter((t) => !t.done);
  const badges = v.badges.filter((b) => b.personId === me.id);
  const [todo, setTodo] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <header className="hq-rise rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8">
        <p className="text-sm font-semibold text-white/65">{dateLabel(now, { weekday: true, long: true, year: true })}</p>
        <h1 className="mt-2 font-grotesk text-3xl font-bold text-signal-orange sm:text-4xl">
          {greeting(now)}, {me.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-white/75">
          {mine.length} tasks on your desk, {meetings.length} meetings today, {help.length} people asking for your help.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/hq/taskbook" className={hb.gold}>
            <BookOpenCheck aria-hidden className="size-4" /> Daily report
          </Link>
          <Link href="/hq/tasks" className={hb.outline}>
            <LayoutGrid aria-hidden className="size-4" /> Find a task
          </Link>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
        <Panel title="My active tasks" icon={Activity} className="md:col-span-6 xl:col-span-8" action={<PanelLink href="/hq/taskbook">TaskBook</PanelLink>}>
          {mine.length === 0 ? (
            <Empty title="Nothing on your desk" icon={LayoutGrid} action={<Link href="/hq/tasks" className={hb.goldSm}>Take a ticket</Link>} />
          ) : (
            <ul className="flex flex-col gap-2">
              {mine.map((t) => (
                <li key={t.id}>
                  <Link href={`/hq/tasks/${t.id}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/25 px-3 py-3 ring-1 ring-white/8 hover:bg-black/40">
                    <span className="font-mono text-xs text-white/55">{t.code}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{t.title}</span>
                    <Pill tone={t.status === "submitted" ? "cobalt" : "navy"}>{t.status === "submitted" ? "In review" : PRIORITY_LABEL[t.priority]}</Pill>
                    <Countdown to={t.due} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="My season" icon={Trophy} field="cobalt" className="md:col-span-6 xl:col-span-4">
          <p className="font-grotesk text-4xl font-bold text-white">{num(myPoints)}</p>
          <p className="text-sm text-white/70">points · {rank.label}</p>
          {next ? <Progress value={((myPoints - rank.min) / (next.min - rank.min)) * 100} className="mt-4" label="Progress to the next rank" /> : null}
          {next ? <p className="mt-2 text-xs text-white/60">{num(next.min - myPoints)} points to {next.label}</p> : <p className="mt-2 text-xs text-white/60">Top rank reached</p>}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {badges.slice(-6).map((b) => (
              <Pill key={b.id} tone="gold">
                {BADGE_LABEL[b.kind]}
              </Pill>
            ))}
          </div>
        </Panel>
        <Panel title="Tickets that match my skills" icon={Sparkles} className="md:col-span-6 xl:col-span-6" action={<PanelLink href="/hq/tasks">Board</PanelLink>}>
          {matches.length === 0 ? (
            <Empty title="No matching tickets right now" />
          ) : (
            <ul className="flex flex-col gap-2">
              {matches.map((t) => (
                <li key={t.id}>
                  <Link href={`/hq/tasks/${t.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 hover:bg-black/40">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{t.title}</span>
                    <Pill tone={t.priority === "immediate" || t.priority === "urgent" ? "red" : "navy"}>{PRIORITY_LABEL[t.priority]}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Today" icon={CalendarDays} field="ink" className="md:col-span-6 xl:col-span-6">
          {meetings.length === 0 && help.length === 0 && invites.length === 0 ? <Empty title="A quiet day" /> : null}
          <ul className="flex flex-col gap-2">
            {meetings.map((e) => (
              <li key={e.id} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 font-mono text-xs text-signal-orange">{clockLabel(e.start)}</span>
                <span className="truncate text-white">{e.title}</span>
              </li>
            ))}
            {help.map((h) => (
              <li key={h.id}>
                <Link href="/hq/help" className="flex items-center gap-2 text-sm text-white hover:text-signal-orange">
                  <LifeBuoy aria-hidden className="size-4 text-crimson-bright" /> {nameOf(people, h.by)} needs help: {h.title}
                </Link>
              </li>
            ))}
            {invites.map((t) => (
              <li key={t.id}>
                <Link href="/hq/teams" className="flex items-center gap-2 text-sm text-white hover:text-signal-orange">
                  <Users aria-hidden className="size-4 text-signal-orange" /> Invitation to join {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="My to-dos" icon={ListTodo} className="md:col-span-6 xl:col-span-12">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!todo.trim()) return;
              await act("me", "todo.add", { text: todo }).catch(() => {});
              setTodo("");
            }}
            className="mb-3 flex gap-2"
          >
            <input value={todo} onChange={(e) => setTodo(e.target.value)} placeholder="Add a to-do…" className={inputCls} aria-label="New to-do" />
            <button type="submit" className={hb.gold}>
              Add
            </button>
          </form>
          <ul className="grid gap-2 sm:grid-cols-2">
            {todos.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2 ring-1 ring-white/8">
                <button type="button" onClick={() => act("me", "todo.toggle", { id: t.id }, { quiet: true })} aria-label={`Mark "${t.text}" done`} className="grid size-6 shrink-0 place-items-center rounded-md ring-2 ring-signal-orange" />
                <span className="text-sm text-white">{t.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
