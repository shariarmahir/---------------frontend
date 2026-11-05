"use client";

import Link from "next/link";
import { Activity, AlarmClock, BadgeCheck, Banknote, ClipboardCheck, Handshake, LayoutGrid, Layers, TriangleAlert, Users, UsersRound, Wallet } from "lucide-react";
import { useMemo } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useInOffice, useToday } from "@/components/hq/hooks";
import { axisProps, CHART, ChartTip, Countdown, Empty, hb, Panel, PanelLink, Stat } from "@/components/hq/kit";
import { useHq, useNow } from "@/components/hq/provider";
import { balance, monthly, totals } from "@/lib/hq/finance";
import { MONTHS_SHORT } from "@/lib/hq/format";
import { num, PRIORITY_LABEL, PRIORITY_ORDER, STAGE_LABEL, STAGE_ORDER, taka } from "@/lib/hq/rules";
import { seasonOf } from "@/lib/hq/scoring";
import { ActivityPanel, BarRow, DecisionsPanel, FlowPanel, IN_WORK, LeaderPanel, MeetingsPanel, RoomHead, Spotlights, StatRow, TaskList, TeamsPulse, UrgentPanel, useDecisions, useMeetings } from "./parts";

/* ───────────────────────── the super prime admin ───────────────────────── */

/** Mahir's Command Room: the whole company at once — money, clients, pace, people and every decision. */
export function PrimeRoom() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const inOffice = useInOffice();
  const decisions = useDecisions();
  const meetings = useMeetings();

  const s = useMemo(() => {
    const monthTx = v.txns.filter((t) => t.day.startsWith(today.slice(0, 7)));
    const active = v.tasks.filter((t) => IN_WORK.includes(t.status));
    const open = v.clients.filter((c) => !["lost", "reviewed"].includes(c.stage));
    return {
      month: totals(monthTx),
      cash: balance(v.txns),
      active: active.length,
      overdue: active.filter((t) => Date.parse(t.due) < now).length,
      openTickets: v.tasks.filter((t) => t.status === "open").length,
      pipeline: open.reduce((sum, c) => sum + c.value, 0),
      openClients: open.length,
      headcount: v.people.filter((p) => p.status === "active" && !p.demo).length,
      issues: v.issues.filter((i) => i.status !== "solved").length,
    };
  }, [v.txns, v.tasks, v.clients, v.people, v.issues, today, now]);

  const money = useMemo(() => monthly(v.txns, now, 6).map((r) => ({ ...r, label: MONTHS_SHORT[Number(r.month.slice(5)) - 1] })), [v.txns, now]);
  const stages = useMemo(() => STAGE_ORDER.filter((st) => st !== "lost").map((st) => ({ st, list: v.clients.filter((c) => c.stage === st) })), [v.clients]);
  const stageMax = Math.max(1, ...stages.map((x) => x.list.length));

  return (
    <div className="flex flex-col gap-5">
      <RoomHead
        summary={
          <>
            {inOffice.size} of {s.headcount} people are in the office, {s.active} tasks are moving and {decisions.length} {decisions.length === 1 ? "decision waits" : "decisions wait"} for you
            {s.overdue ? <span className="text-crimson-bright">; {s.overdue} {s.overdue === 1 ? "task is" : "tasks are"} overdue</span> : null}.
          </>
        }
        actions={
          <>
            <Link href="/hq/tasks?new=1" className={hb.gold}>
              <LayoutGrid aria-hidden className="size-4" /> New ticket
            </Link>
            <Link href="/hq/approvals" className={hb.outline}>
              <BadgeCheck aria-hidden className="size-4" /> Approvals ({decisions.length})
            </Link>
          </>
        }
      />

      <StatRow cols={8}>
        <Stat label="Revenue this month" value={taka(s.month.income, { compact: true })} icon={Banknote} href="/hq/finance" sub={`profit ${taka(s.month.profit, { compact: true })}`} />
        <Stat label="Cash balance" value={taka(s.cash, { compact: true })} icon={Wallet} field="cobalt" href="/hq/finance" />
        <Stat label="Open pipeline" value={taka(s.pipeline, { compact: true })} icon={Handshake} field="ink" href="/hq/clients" sub={`${s.openClients} clients`} />
        <Stat label="Tasks in work" value={s.active} icon={Activity} href="/hq/tasks" sub={s.overdue ? <span className="text-crimson-bright">{s.overdue} overdue</span> : "all on time"} />
        <Stat label="Open tickets" value={s.openTickets} icon={LayoutGrid} field="ink" href="/hq/tasks" />
        <Stat label="In the office" value={`${inOffice.size}/${s.headcount}`} icon={Users} href="/hq/attendance" />
        <Stat label="Decisions waiting" value={decisions.length} icon={BadgeCheck} field="cobalt" href="/hq/approvals" />
        <Stat label="Open issues" value={s.issues} icon={TriangleAlert} href="/hq/issues" />
      </StatRow>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <DecisionsPanel items={decisions} className="xl:col-span-7" />
        <UrgentPanel className="xl:col-span-5" />

        <Panel title="Revenue and expenses" icon={Banknote} sub="Last six months" field="ink" className="xl:col-span-7" bodyClassName="flex flex-col" action={<PanelLink href="/hq/finance">Finance</PanelLink>}>
          <div className="min-h-60 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={money} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(x: number) => taka(x, { compact: true }).replace("৳", "")} width={56} />
                <Tooltip content={<ChartTip format={(x) => taka(x)} />} />
                <Bar dataKey="income" name="Income" fill={CHART.gold} radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar dataKey="expense" name="Expenses" fill={CHART.blue2} radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke={CHART.white} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Client pipeline" icon={Handshake} sub={`${taka(s.pipeline, { compact: true })} open`} className="xl:col-span-5" action={<PanelLink href="/hq/clients">Client CRM</PanelLink>}>
          <ul className="flex flex-col gap-1.5">
            {stages.map(({ st, list }) => (
              <BarRow key={st} label={STAGE_LABEL[st]} value={list.length} max={stageMax} hint={`${list.length} · ${taka(list.reduce((sum, c) => sum + c.value, 0), { compact: true })}`} href="/hq/clients" />
            ))}
          </ul>
        </Panel>

        <FlowPanel tasks={v.tasks} className="xl:col-span-7" />
        <MeetingsPanel events={meetings} className="xl:col-span-5" />

        <Spotlights className="xl:col-span-12" />

        <TeamsPulse className="xl:col-span-6" />
        <LeaderPanel className="xl:col-span-6" />

        <ActivityPanel className="xl:col-span-12" />
      </div>
    </div>
  );
}

/* ───────────────────────── a chief (COO, CMO) ───────────────────────── */

/** Operations: the work across every team — what needs a reviewer, what is late, how the lanes fill. */
export function ChiefRoom() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const decisions = useDecisions();
  const meetings = useMeetings(true);
  const reviewer = v.me.perms.includes("tasks.review");

  const s = useMemo(() => {
    const active = v.tasks.filter((t) => IN_WORK.includes(t.status));
    const review = v.tasks.filter((t) => t.status === "submitted").sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
    const atRisk = active.filter((t) => t.status !== "submitted" && Date.parse(t.due) < now + 24 * 3600_000).sort((a, b) => a.due.localeCompare(b.due));
    const season = seasonOf(today);
    return {
      active,
      review,
      atRisk,
      overdue: atRisk.filter((t) => Date.parse(t.due) < now).length,
      open: v.tasks.filter((t) => t.status === "open"),
      teams: v.teams.filter((t) => t.status === "active").length,
      doneSeason: v.tasks.filter((t) => t.status === "done" && t.submittedAt && t.submittedAt.slice(0, 10) >= season.start).length,
    };
  }, [v.tasks, v.teams, now, today]);

  const lanes = useMemo(
    () =>
      PRIORITY_ORDER.map((p) => ({
        p,
        open: s.open.filter((t) => t.priority === p).length,
        work: s.active.filter((t) => t.priority === p).length,
      })),
    [s.open, s.active],
  );
  const laneMax = Math.max(1, ...lanes.map((l) => l.open + l.work));

  return (
    <div className="flex flex-col gap-5">
      <RoomHead
        summary={
          <>
            {s.active.length} tasks are in work across {s.teams} teams. {s.review.length} {s.review.length === 1 ? "submission waits" : "submissions wait"} for a reviewer
            {s.overdue ? <span className="text-crimson-bright"> and {s.overdue} {s.overdue === 1 ? "is" : "are"} overdue</span> : null}.
          </>
        }
        actions={
          <>
            <Link href="/hq/tasks?new=1" className={hb.gold}>
              <LayoutGrid aria-hidden className="size-4" /> New ticket
            </Link>
            <Link href="/hq/tasks" className={hb.outline}>
              <Layers aria-hidden className="size-4" /> Task Board
            </Link>
          </>
        }
      />

      <StatRow>
        <Stat label="Tasks in work" value={s.active.length} icon={Activity} href="/hq/tasks" />
        <Stat label="Waiting review" value={s.review.length} icon={ClipboardCheck} field="cobalt" href="/hq/tasks" />
        <Stat label="Overdue" value={s.overdue} icon={AlarmClock} field="ink" href="/hq/tasks" sub={s.overdue ? <span className="text-crimson-bright">needs a push</span> : "none late"} />
        <Stat label="Open tickets" value={s.open.length} icon={LayoutGrid} href="/hq/tasks" />
        <Stat label="Active teams" value={s.teams} icon={UsersRound} field="ink" href="/hq/teams" />
        <Stat label="Done this season" value={num(s.doneSeason)} icon={BadgeCheck} field="cobalt" href="/hq/reports" />
      </StatRow>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Review queue" icon={ClipboardCheck} sub="Oldest submission first" className="xl:col-span-7" action={<PanelLink href="/hq/tasks">Task Board</PanelLink>}>
          <TaskList
            tasks={s.review}
            showTaker
            empty={<Empty title="Nothing to review" icon={ClipboardCheck} className="py-6">Submitted work appears here for scoring and merits.</Empty>}
            rowAction={(t) =>
              reviewer ? (
                <Link href={`/hq/tasks/${t.id}`} className={hb.goldSm}>
                  Review
                </Link>
              ) : null
            }
          />
        </Panel>
        <Panel title="At risk" icon={AlarmClock} sub="Overdue or due within a day" field="ink" className="xl:col-span-5">
          <TaskList tasks={s.atRisk} showTaker empty={<Empty title="Nothing at risk" icon={AlarmClock} className="py-6">Every task in work has more than a day left.</Empty>} rowAction={(t) => <Countdown to={t.due} className="shrink-0 text-right whitespace-nowrap" />} />
        </Panel>

        <Panel title="Lanes" icon={Layers} sub="Open tickets and work in hand, by priority" className="xl:col-span-7" action={<PanelLink href="/hq/tasks">Board</PanelLink>}>
          <ul className="grid gap-x-8 gap-y-1.5 md:grid-cols-2">
            {lanes.map((l) => (
              <BarRow key={l.p} label={PRIORITY_LABEL[l.p]} value={l.open + l.work} max={laneMax} hint={`${l.open} open · ${l.work} in work`} tone={l.p === "immediate" || l.p === "urgent" ? "red" : "gold"} href="/hq/tasks" />
            ))}
          </ul>
        </Panel>
        <DecisionsPanel items={decisions} className="xl:col-span-5" />

        <TeamsPulse className="xl:col-span-6" />
        <FlowPanel tasks={v.tasks} className="xl:col-span-6" />

        <MeetingsPanel events={meetings} className="xl:col-span-6" />
        <LeaderPanel className="xl:col-span-6" />
      </div>
    </div>
  );
}
