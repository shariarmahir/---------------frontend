"use client";

import Link from "next/link";
import { BookOpenCheck, CalendarDays, GraduationCap, LayoutGrid, LifeBuoy, ListTodo, NotebookPen, Sparkles, Users, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { INTERN_CYCLE_DAYS } from "@/data/hq/roles";
import { nameOf, usePeople, useToday } from "@/components/hq/hooks";
import { Empty, hb, inputCls, Panel, PanelLink, Pill, Progress, Stat } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { clockLabel, dateLabel } from "@/lib/hq/format";
import { num } from "@/lib/hq/rules";
import { isAdvance, QUICK_SILVER_STREAK } from "@/lib/hq/scoring";
import { IN_WORK, RoomHead, SeasonPanel, StatRow, TaskList, useMeetings } from "./parts";

/** My Desk (members) and the Learning Desk (interns): today's own work, what fits next, and the season. */
export function MemberRoom({ intern }: { intern?: boolean }) {
  const v = useHq();
  const act = useAct();
  const now = useNow(60_000);
  const today = useToday();
  const people = usePeople();
  const meetings = useMeetings(true);
  const me = v.me.person;
  const [todo, setTodo] = useState("");

  const d = useMemo(() => {
    const myTeams = new Set(v.teams.filter((t) => t.status === "active" && (t.leaderId === me.id || t.memberIds.includes(me.id))).map((t) => t.id));
    const desk = v.tasks.filter((t) => IN_WORK.includes(t.status) && (t.takenBy === me.id || (t.teamId && myTeams.has(t.teamId)))).sort((a, b) => a.due.localeCompare(b.due));
    const delivered = v.tasks.filter((t) => t.takenBy === me.id && t.submittedAt).sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
    let streak = 0;
    for (const t of delivered) {
      if (!isAdvance(t)) break;
      streak++;
    }
    return {
      desk,
      dueSoon: desk.filter((t) => t.status !== "submitted" && Date.parse(t.due) < now + 24 * 3600_000).length,
      matches: v.tasks.filter((t) => t.status === "open" && t.skills.some((s) => me.skills.includes(s) || me.learning.includes(s))).sort((a, b) => a.due.localeCompare(b.due)),
      learning: v.tasks.filter((t) => (t.kind === "learning" || t.learningSkill) && (t.takenBy === me.id || t.status === "open")),
      help: v.help.filter((h) => h.status === "open" && h.by !== me.id && h.capable.includes(me.id)),
      invites: v.teams.filter((t) => t.status === "active" && t.invites.some((i) => i.personId === me.id && i.status === "pending")),
      reported: v.reports.some((r) => r.personId === me.id && r.day === today),
      streak,
    };
  }, [v.teams, v.tasks, v.help, v.reports, me, today, now]);

  const cycleDay = Math.max(1, Math.floor((now - Date.parse(me.joinedAt)) / 86400_000) + 1);
  const cycleDone = cycleDay > INTERN_CYCLE_DAYS;
  const cycleText = cycleDone ? "Cycle complete" : `Day ${cycleDay} of ${INTERN_CYCLE_DAYS}`;
  const todos = v.todos.filter((t) => !t.done);

  return (
    <div className="flex flex-col gap-5">
      <RoomHead
        summary={
          <>
            {d.desk.length} {d.desk.length === 1 ? "task is" : "tasks are"} on your desk
            {d.dueSoon ? <span className="text-crimson-bright"> ({d.dueSoon} due within a day)</span> : null}, {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"} today and {d.help.length} {d.help.length === 1 ? "person asks" : "people ask"} for your help.
            {d.reported ? " Today's report is in." : " Your daily report is still to write."}
          </>
        }
        actions={
          <>
            <Link href="/hq/taskbook" className={hb.gold}>
              <BookOpenCheck aria-hidden className="size-4" /> {d.reported ? "My TaskBook" : "Write today's report"}
            </Link>
            <Link href="/hq/tasks" className={hb.outline}>
              <LayoutGrid aria-hidden className="size-4" /> Find a ticket
            </Link>
          </>
        }
      />

      <StatRow cols={4}>
        <Stat label="On my desk" value={d.desk.length} icon={LayoutGrid} href="/hq/taskbook" sub={d.dueSoon ? <span className="text-crimson-bright">{d.dueSoon} due within a day</span> : "nothing due today"} />
        <Stat label="Early streak" value={`${Math.min(d.streak, QUICK_SILVER_STREAK)}/${QUICK_SILVER_STREAK}`} icon={Zap} field="cobalt" href="/hq/leaderboard" sub={d.streak >= QUICK_SILVER_STREAK ? "Quick Silver earned" : "early submissions in a row"} />
        {intern ? (
          <Stat label="Learning cycle" value={cycleDone ? "Complete" : `Day ${cycleDay}`} icon={GraduationCap} field="ink" href="/hq/taskbook" sub={cycleDone ? "paid-place review due" : `of ${INTERN_CYCLE_DAYS}`} />
        ) : (
          <Stat label="Help asks for me" value={d.help.length} icon={LifeBuoy} field="ink" href="/hq/help" sub={d.help.length ? "you have the skills" : "none open"} />
        )}
        <Stat label="Daily report" value={d.reported ? "Sent" : "Not yet"} icon={NotebookPen} href="/hq/taskbook" sub={d.reported ? "+2 points" : <span className="text-signal-orange">write it before you leave</span>} />
      </StatRow>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="On my desk" icon={LayoutGrid} sub="Soonest due first" className="xl:col-span-8" action={<PanelLink href="/hq/taskbook">TaskBook</PanelLink>}>
          <TaskList
            tasks={d.desk}
            max={6}
            empty={
              <Empty title="Nothing on your desk" icon={LayoutGrid} className="py-6" action={<Link href="/hq/tasks" className={hb.goldSm}>Take a ticket</Link>}>
                Take a ticket that matches your skills; finishing early earns more.
              </Empty>
            }
          />
        </Panel>
        <SeasonPanel className="xl:col-span-4" />

        {intern ? (
          <>
            <Panel title="Learning cycle" icon={GraduationCap} sub={cycleText} field="ink" className="xl:col-span-5">
              <Progress value={(Math.min(cycleDay, INTERN_CYCLE_DAYS) / INTERN_CYCLE_DAYS) * 100} label="Learning cycle progress" />
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {cycleDone ? "Your cycle is complete: the season's points decide the offer of a paid place." : "The interns with the strongest season points are offered a paid place at the end of the cycle."}
              </p>
              <p className="mt-4 text-sm font-semibold text-white/85">Learning</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {me.learning.length ? me.learning.map((s) => <Pill key={s} tone="navy">{s}</Pill>) : <span className="text-sm text-white/60">Add the skills you are learning in Settings.</span>}
              </div>
            </Panel>
            <Panel title="Learning tickets" icon={GraduationCap} className="xl:col-span-7" action={<PanelLink href="/hq/taskbook">TaskBook</PanelLink>}>
              <TaskList tasks={d.learning} max={4} empty={<Empty title="No learning project yet" icon={GraduationCap} className="py-6">Ask for one in your TaskBook; it is built around a skill you are learning.</Empty>} />
            </Panel>
          </>
        ) : null}

        <Panel title="Tickets that fit me" icon={Sparkles} sub="Open tickets matching your skills" className="xl:col-span-7" action={<PanelLink href="/hq/tasks">Board</PanelLink>}>
          <TaskList tasks={d.matches} empty={<Empty title="No matching tickets right now" icon={Sparkles} className="py-6">Add skills in Settings to see more.</Empty>} />
        </Panel>
        <Panel title="Today" icon={CalendarDays} sub={dateLabel(today, { weekday: true, long: true })} field="ink" className="xl:col-span-5">
          {meetings.length === 0 && d.help.length === 0 && d.invites.length === 0 ? (
            <Empty title="A clear day" icon={CalendarDays} className="py-6">
              Meetings, help requests and team invitations show here.
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {meetings.slice(0, 3).map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
                  <span className="w-18 shrink-0 font-mono text-xs font-bold text-signal-orange">{clockLabel(e.start)}</span>
                  <span className="truncate text-sm font-semibold text-white">{e.title}</span>
                </li>
              ))}
              {d.help.slice(0, 3).map((h) => (
                <li key={h.id}>
                  <Link href="/hq/help" className="flex items-center gap-3 rounded-xl bg-national-crimson/10 px-3 py-2.5 ring-1 ring-national-crimson/45 transition-colors hover:bg-black/40">
                    <LifeBuoy aria-hidden className="size-4 shrink-0 text-crimson-bright" />
                    <span className="min-w-0 flex-1 truncate text-sm text-white">
                      {nameOf(people, h.by)} needs help: {h.title}
                    </span>
                  </Link>
                </li>
              ))}
              {d.invites.map((t) => (
                <li key={t.id}>
                  <Link href="/hq/teams" className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                    <Users aria-hidden className="size-4 shrink-0 text-signal-orange" />
                    <span className="min-w-0 flex-1 truncate text-sm text-white">Invitation to join {t.name}</span>
                    <Pill tone="gold">Answer</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="My to-dos" icon={ListTodo} sub={todos.length ? `${num(todos.length)} open` : undefined} className="xl:col-span-12" action={<PanelLink href="/hq/taskbook">TaskBook</PanelLink>}>
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
          {todos.length === 0 ? (
            <p className="text-sm text-white/60">Nothing open. Small reminders for yourself go here.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {todos.slice(0, 8).map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2 ring-1 ring-white/8">
                  <button type="button" onClick={() => act("me", "todo.toggle", { id: t.id }, { quiet: true })} aria-label={`Mark "${t.text}" done`} className="grid size-6 shrink-0 place-items-center rounded-md ring-2 ring-signal-orange transition-colors hover:bg-signal-orange/20" />
                  <span className="min-w-0 flex-1 truncate text-sm text-white">{t.text}</span>
                  {t.due ? <span className={t.due < today ? "shrink-0 text-xs text-crimson-bright" : "shrink-0 text-xs text-white/50"}>{dateLabel(t.due)}</span> : null}
                </li>
              ))}
            </ul>
          )}
          {todos.length > 8 ? <p className="mt-2 text-xs text-white/55">and {todos.length - 8} more in your TaskBook</p> : null}
        </Panel>
      </div>
    </div>
  );
}
