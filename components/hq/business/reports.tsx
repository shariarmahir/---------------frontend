"use client";

import { Activity, Banknote, CalendarCheck, Download, Handshake, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { downloadCsv } from "@/components/hq/data-table";
import { useToday } from "@/components/hq/hooks";
import { axisProps, CHART, ChartTip, Empty, hb, PageHead, Panel, Stat } from "@/components/hq/kit";
import { useHq, useNow } from "@/components/hq/provider";
import { monthly } from "@/lib/hq/finance";
import { dateLabel, MONTHS_SHORT } from "@/lib/hq/format";
import { addDays, can, dhakaDay, STAGE_LABEL, STAGE_ORDER, taka, weekdayOf } from "@/lib/hq/rules";
import { leaderboard, seasonOf } from "@/lib/hq/scoring";

function CsvButton({ name, rows }: { name: string; rows: Record<string, string | number>[] }) {
  return (
    <button type="button" onClick={() => downloadCsv(name, rows)} className={hb.quietSm} aria-label={`Download ${name} as CSV`}>
      <Download aria-hidden className="size-3.5" /> CSV
    </button>
  );
}

export function Reports() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const people = useMemo(() => new Map(v.people.map((p) => [p.id, p])), [v.people]);
  const active = v.people.filter((p) => p.status === "active");

  const weekly = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const end = addDays(today, -7 * (7 - i));
      const start = addDays(end, -6);
      const done = v.tasks.filter((t) => t.submittedAt && dhakaDay(t.submittedAt) >= start && dhakaDay(t.submittedAt) <= end);
      return { week: dateLabel(start), done: done.length, onTime: done.filter((t) => Date.parse(t.submittedAt!) <= Date.parse(t.due)).length, late: done.filter((t) => Date.parse(t.submittedAt!) > Date.parse(t.due)).length };
    });
  }, [v.tasks, today]);
  const submitted = v.tasks.filter((t) => t.submittedAt);
  const onTime = submitted.filter((t) => Date.parse(t.submittedAt!) <= Date.parse(t.due)).length;
  const season = seasonOf(today);
  const points = useMemo(() => leaderboard(v.points, active.map((p) => p.id), season.start, season.end).map((r) => ({ name: people.get(r.personId)?.name.split(" ")[0] ?? "", points: r.points })), [v.points, active, season.start, season.end, people]);

  const attendance = useMemo(() => {
    const days: string[] = [];
    for (let i = 0; days.length < 20 && i < 40; i++) {
      const d = addDays(today, -i);
      if (!v.office.weekend.includes(weekdayOf(d)) && !v.office.holidays.some((h) => h.day === d)) days.push(d);
    }
    return active.map((p) => {
      const present = v.checkins.filter((c) => c.personId === p.id && days.includes(c.day)).length;
      return { name: p.name.split(" ")[0], rate: Math.round((present / days.length) * 100), late: v.checkins.filter((c) => c.personId === p.id && days.includes(c.day) && c.late).length };
    });
  }, [active, v.checkins, v.office, today]);
  const avgAttendance = attendance.length ? Math.round(attendance.reduce((s, a) => s + a.rate, 0) / attendance.length) : 0;

  const pipeline = STAGE_ORDER.map((s) => ({ stage: STAGE_LABEL[s], value: v.clients.filter((c) => c.stage === s).reduce((t, c) => t + c.value, 0), count: v.clients.filter((c) => c.stage === s).length })).filter((r) => r.count);
  const finance = can(v.me.person, "finance.view");
  const money = useMemo(() => monthly(v.txns, now, 6).map((r) => ({ ...r, label: MONTHS_SHORT[Number(r.month.slice(5)) - 1] })), [v.txns, now]);

  return (
    <>
      <PageHead title="Reports" lead="Company analytics across tasks, people, attendance, clients and money. Every chart downloads as CSV." />
      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Tasks submitted" value={submitted.length} icon={Activity} />
        <Stat label="On time" value={submitted.length ? `${Math.round((onTime / submitted.length) * 100)}%` : "—"} icon={CalendarCheck} field="ink" />
        <Stat label="Attendance, 20 working days" value={`${avgAttendance}%`} icon={CalendarCheck} field="cobalt" />
        <Stat label="Open pipeline" value={taka(v.clients.filter((c) => !["lost", "reviewed"].includes(c.stage)).reduce((s, c) => s + c.value, 0), { compact: true })} icon={Handshake} />
      </section>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Tasks per week" icon={Activity} sub="On time vs late, last 8 weeks" action={<CsvButton name="tasks-per-week" rows={weekly} />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="week" {...axisProps} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="onTime" name="On time" stackId="a" fill={CHART.gold} maxBarSize={36} />
                <Bar dataKey="late" name="Late" stackId="a" fill={CHART.red} radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title={`Points, ${season.label}`} icon={Trophy} field="ink" action={<CsvButton name="points-by-member" rows={points} />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="name" {...axisProps} width={72} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="points" name="Points" fill={CHART.gold} radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Attendance rate" icon={CalendarCheck} field="cobalt" sub="Last 20 working days" action={<CsvButton name="attendance" rows={attendance} />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} domain={[0, 100]} />
                <Tooltip content={<ChartTip format={(x) => `${x}%`} />} />
                <Bar dataKey="rate" name="Attendance" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {attendance.map((a, i) => (
                    <Cell key={i} fill={a.rate < 70 ? CHART.red : CHART.white} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Pipeline by stage" icon={Handshake} action={<CsvButton name="pipeline" rows={pipeline} />}>
          {pipeline.length === 0 ? (
            <Empty title="No clients yet" />
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="size-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pipeline} dataKey="value" nameKey="stage" innerRadius={56} outerRadius={92} paddingAngle={2} stroke="none">
                      {pipeline.map((_, i) => (
                        <Cell key={i} fill={CHART.series[i % CHART.series.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip format={(x) => taka(x)} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex w-full flex-col gap-2 text-sm">
                {pipeline.map((p, i) => (
                  <li key={p.stage} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: CHART.series[i % CHART.series.length] }} />
                    <span className="flex-1 text-white/85">
                      {p.stage} ({p.count})
                    </span>
                    <span className="font-mono text-xs text-signal-orange">{taka(p.value, { compact: true })}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
        {finance ? (
          <Panel title="Revenue trend" icon={Banknote} field="ink" className="xl:col-span-2" action={<CsvButton name="revenue-trend" rows={money.map((r) => ({ month: r.month, income: r.income, expense: r.expense, profit: r.profit }))} />}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={money} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} width={64} tickFormatter={(x: number) => taka(x, { compact: true }).replace("৳", "")} />
                  <Tooltip content={<ChartTip format={(x) => taka(x)} />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke={CHART.gold} fill={CHART.gold} fillOpacity={0.2} strokeWidth={2.5} />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke={CHART.blue} fill={CHART.blue} fillOpacity={0.12} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        ) : null}
      </div>
    </>
  );
}
