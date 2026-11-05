"use client";

import Link from "next/link";
import { AlarmClock, Banknote, ClipboardCheck, FileText, FolderKanban, Handshake, LayoutGrid, MessageSquareWarning, Plus, Star, Trophy, UserRound, Users, UsersRound } from "lucide-react";
import { useMemo } from "react";
import { useInOffice, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Countdown, Empty, hb, Panel, PanelLink, Pill, Progress, Stat, type Tone } from "@/components/hq/kit";
import { useHq, useNow } from "@/components/hq/provider";
import { docTotals } from "@/lib/hq/finance";
import { dateLabel } from "@/lib/hq/format";
import { dhakaDay, num, STAGE_LABEL, STAGE_ORDER, taka } from "@/lib/hq/rules";
import { IRON_MAN_SCORE, seasonOf } from "@/lib/hq/scoring";
import type { Sticky, Task } from "@/lib/hq/types";
import { BarRow, DecisionsPanel, IN_WORK, LeaderPanel, MeetingsPanel, RoomHead, SeasonPanel, StatRow, TaskList, UrgentPanel, useDecisions, useMeetings } from "./parts";

const STICKY_TONE: Record<Sticky["level"], Tone> = { crisis: "red", urgent: "gold", info: "navy" };

/* ───────────────────────── a team leader ───────────────────────── */

/** Team Desk: the leader's people, their work, the review queue, crisis notes and the client. */
export function LeadRoom() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const people = usePeople();
  const inOffice = useInOffice();
  const meetings = useMeetings(true);
  const decisions = useDecisions();
  const me = v.me.person.id;
  const reviewer = v.me.perms.includes("tasks.review");

  const t = useMemo(() => {
    const teams = v.teams.filter((x) => x.status === "active" && x.leaderId === me);
    const teamIds = new Set(teams.map((x) => x.id));
    const memberIds = [...new Set(teams.flatMap((x) => [x.leaderId, ...x.memberIds]))];
    const tasks = v.tasks.filter((x) => x.teamId && teamIds.has(x.teamId));
    const inWork = tasks.filter((x) => IN_WORK.includes(x.status) && x.status !== "submitted").sort((a, b) => a.due.localeCompare(b.due));
    const review = (reviewer ? v.tasks : tasks).filter((x) => x.status === "submitted" && x.takenBy !== me);
    const notes = teams.flatMap((x) => x.stickies.filter((s) => !s.resolved).map((s) => ({ ...s, team: x }))).sort((a, b) => (a.level === "crisis" ? -1 : 0) - (b.level === "crisis" ? -1 : 0) || b.at.localeCompare(a.at));
    const season = seasonOf(today);
    const points = v.points.filter((e) => memberIds.includes(e.personId) && dhakaDay(e.at) >= season.start).reduce((sum, e) => sum + e.points, 0);
    return { teams, teamIds, memberIds, inWork, review, notes, points, overdue: inWork.filter((x) => Date.parse(x.due) < now).length };
  }, [v.teams, v.tasks, v.points, me, reviewer, today, now]);

  const roster = t.memberIds.map((id) => ({ p: people.get(id), task: v.tasks.find((x) => x.takenBy === id && IN_WORK.includes(x.status) && x.status !== "submitted") })).filter((r) => r.p);
  const clients = t.teams.map((team) => ({ team, client: v.clients.find((c) => c.id === team.clientId) })).filter((x) => x.client);

  if (t.teams.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <RoomHead
          summary={`You don't lead a team yet. ${t.review.length ? `Meanwhile ${t.review.length} ${t.review.length === 1 ? "submission waits" : "submissions wait"} for your review.` : "Start one to take team tickets."}`}
          actions={
            <Link href="/hq/teams" className={hb.gold}>
              <Plus aria-hidden className="size-4" /> Start a team
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <Panel title="Start your team" icon={UsersRound} className="xl:col-span-7">
            <ol className="grid gap-3 sm:grid-cols-2">
              {[
                ["Create it", "Name the team and say what it is for."],
                ["Approval", "The super prime admin approves it and its room opens."],
                ["Invite", "Ask the people you need. A decline needs a 150-word reason."],
                ["Take tickets", "Take team tickets; you get 10% of the points, the rest is shared."],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-3 rounded-xl bg-black/25 p-3 ring-1 ring-white/8">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-signal-orange font-grotesk text-sm font-bold text-text-primary">{i + 1}</span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{title}</span>
                    <span className="block text-xs leading-relaxed text-white/65">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/hq/teams" className={`${hb.gold} mt-4`}>
              <Plus aria-hidden className="size-4" /> Start a team
            </Link>
          </Panel>
          <ReviewPanel tasks={t.review} className="xl:col-span-5" />
          <DecisionsPanel items={decisions} className="xl:col-span-7" />
          <SeasonPanel className="xl:col-span-5" />
          <UrgentPanel teamIds={t.teamIds} className="xl:col-span-6" />
          <MeetingsPanel events={meetings} className="xl:col-span-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <RoomHead
        summary={
          <>
            You lead {t.teams.length === 1 ? t.teams[0].name : `${t.teams.length} teams`}: {t.memberIds.length} people, {t.inWork.length} tasks in work and {t.review.length} waiting for review
            {t.overdue ? <span className="text-crimson-bright">; {t.overdue} overdue</span> : null}.
          </>
        }
        actions={
          <>
            <Link href="/hq/teams" className={hb.gold}>
              <UsersRound aria-hidden className="size-4" /> Team console
            </Link>
            <Link href="/hq/tasks" className={hb.outline}>
              <LayoutGrid aria-hidden className="size-4" /> Find a ticket
            </Link>
          </>
        }
      />

      <StatRow>
        <Stat label="Team members" value={t.memberIds.length} icon={Users} href="/hq/teams" sub={`${t.memberIds.filter((id) => inOffice.has(id)).length} in the office`} />
        <Stat label="In work" value={t.inWork.length} icon={LayoutGrid} field="cobalt" href="/hq/tasks" />
        <Stat label="Waiting your review" value={t.review.length} icon={ClipboardCheck} field="ink" href="/hq/tasks" />
        <Stat label="Overdue" value={t.overdue} icon={AlarmClock} href="/hq/tasks" sub={t.overdue ? <span className="text-crimson-bright">push today</span> : "on time"} />
        <Stat label="Team points" value={num(t.points)} icon={Trophy} field="cobalt" href="/hq/leaderboard" sub="this season" />
        <Stat label="Open notes" value={t.notes.length} icon={MessageSquareWarning} field="ink" href="/hq/teams" sub={t.notes.some((n) => n.level === "crisis") ? <span className="text-crimson-bright">crisis open</span> : "no crisis"} />
      </StatRow>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="My people" icon={Users} sub="Who is in and what they are on" className="xl:col-span-7" action={<PanelLink href="/hq/teams">Teams</PanelLink>}>
          <ul className="grid gap-2 md:grid-cols-2">
            {roster.map(({ p, task }) => (
              <li key={p!.id}>
                <Link href={task ? `/hq/tasks/${task.id}` : `/hq/people/${p!.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                  <Avatar person={p} size="sm" online={inOffice.has(p!.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">
                      {p!.name}
                      {p!.id === me ? <span className="font-normal text-white/50"> (you)</span> : null}
                    </span>
                    <span className="block truncate text-xs text-white/55">{task ? task.title : "Free for a ticket"}</span>
                  </span>
                  {task ? <Countdown to={task.due} /> : <Pill>Free</Pill>}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Team notes" icon={MessageSquareWarning} sub="Crisis first" field="ink" className="xl:col-span-5" action={<PanelLink href="/hq/teams">Console</PanelLink>}>
          {t.notes.length === 0 ? (
            <Empty title="No open notes" icon={MessageSquareWarning} className="py-6">
              Emergency sticky notes from your team appear here.
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {t.notes.slice(0, 5).map((n) => (
                <li key={n.id}>
                  <Link href={`/hq/teams/${n.team.id}`} className="flex items-start gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                    <Pill tone={STICKY_TONE[n.level]} className="mt-0.5">
                      {n.level}
                    </Pill>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-sm text-white/90">{n.text}</span>
                      <span className="block text-xs text-white/50">
                        {n.team.name} · {people.get(n.by)?.name ?? "Member"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Team tickets in work" icon={LayoutGrid} sub="Soonest due first" className="xl:col-span-7" action={<PanelLink href="/hq/tasks">Board</PanelLink>}>
          <TaskList tasks={t.inWork} showTaker empty={<Empty title="Nothing in work" icon={LayoutGrid} className="py-6" action={<Link href="/hq/tasks" className={hb.goldSm}>Take a ticket for the team</Link>} />} />
        </Panel>
        <ReviewPanel tasks={t.review} className="xl:col-span-5" />

        <Panel title="Client and delivery" icon={Star} sub={`Iron Man at ${IRON_MAN_SCORE}+`} className="xl:col-span-6" action={<PanelLink href="/hq/clients">Clients</PanelLink>}>
          {clients.length === 0 ? (
            <Empty title="No client on your teams" icon={Handshake} className="py-6">
              When a confirmed client is given to your team, its stage and rating show here.
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {clients.map(({ team, client }) => (
                <li key={team.id}>
                  <Link href={`/hq/clients/${client!.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{client!.org}</span>
                      <span className="block truncate text-xs text-white/55">
                        {team.name} · {team.clientUpdates.length ? `last update ${dateLabel(team.clientUpdates[team.clientUpdates.length - 1].at)}` : "no client update yet"}
                      </span>
                    </span>
                    {client!.review ? <Pill tone={client!.review.score >= IRON_MAN_SCORE ? "gold" : "navy"}>{client!.review.score.toFixed(1)} ★</Pill> : <Pill tone="navy">{STAGE_LABEL[client!.stage]}</Pill>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <LeaderPanel ids={t.memberIds.length ? t.memberIds : [me]} title="Team leaderboard" field="ink" className="xl:col-span-6" />

        <UrgentPanel teamIds={t.teamIds} className="xl:col-span-6" />
        <MeetingsPanel events={meetings} className="xl:col-span-6" />

        <DecisionsPanel items={decisions} className="xl:col-span-7" />
        <SeasonPanel className="xl:col-span-5" />
      </div>
    </div>
  );
}

/** Submitted work waiting for this reviewer, oldest first. */
function ReviewPanel({ tasks, className }: { tasks: Task[]; className?: string }) {
  return (
    <Panel title="Review queue" icon={ClipboardCheck} sub="Score it and award merits" field="cobalt" className={className}>
      <TaskList
        tasks={tasks}
        showTaker
        max={4}
        empty={
          <Empty title="Nothing to review" icon={ClipboardCheck} className="py-6">
            Your team&apos;s submissions land here.
          </Empty>
        }
        rowAction={(x) => (
          <Link href={`/hq/tasks/${x.id}`} className={hb.goldSm}>
            Review
          </Link>
        )}
      />
    </Panel>
  );
}

/* ───────────────────────── a client manager ───────────────────────── */

/** Client Desk: the manager's own pipeline, follow-ups, projects and paperwork. */
export function ClientRoom() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const meetings = useMeetings(true);
  const me = v.me.person.id;

  const c = useMemo(() => {
    const own = v.clients.filter((x) => x.managerId === me);
    const clients = own.length ? own : v.clients;
    const ids = new Set(clients.map((x) => x.id));
    const open = clients.filter((x) => !["lost", "reviewed", "delivered"].includes(x.stage));
    const season = seasonOf(today);
    const won = clients.filter((x) => ["confirmed", "in-progress", "delivered", "reviewed"].includes(x.stage) && dhakaDay(x.stageAt) >= season.start);
    const stale = open.filter((x) => now - Date.parse(x.stageAt) > 7 * 86400_000).sort((a, b) => a.stageAt.localeCompare(b.stageAt));
    const projects = v.projects.filter((p) => ids.has(p.clientId) && (p.status === "setup" || p.status === "running")).sort((a, b) => a.due.localeCompare(b.due));
    const docs = v.docs.filter((d) => ids.has(d.clientId)).sort((a, b) => b.at.localeCompare(a.at));
    const unpaid = docs.filter((d) => d.kind === "invoice" && d.status === "sent");
    return { own: own.length > 0, clients, open, won, stale, projects, docs, unpaid };
  }, [v.clients, v.projects, v.docs, me, today, now]);

  const stages = STAGE_ORDER.filter((st) => st !== "lost").map((st) => ({ st, list: c.clients.filter((x) => x.stage === st) }));
  const stageMax = Math.max(1, ...stages.map((x) => x.list.length));
  const published = v.tasks.filter((x) => x.createdBy === me && x.status !== "done" && x.status !== "cancelled").sort((a, b) => a.due.localeCompare(b.due));
  const pipeline = c.open.reduce((sum, x) => sum + x.value, 0);

  return (
    <div className="flex flex-col gap-5">
      <RoomHead
        summary={
          <>
            {c.own ? "Your" : "The company's"} pipeline holds {c.open.length} open deals worth {taka(pipeline, { compact: true })}.{" "}
            {c.stale.length ? <span className="text-crimson-bright">{c.stale.length} need a follow-up.</span> : "Every deal moved this week."}
          </>
        }
        actions={
          <>
            <Link href="/hq/clients" className={hb.gold}>
              <Plus aria-hidden className="size-4" /> Client CRM
            </Link>
            <Link href="/hq/tasks?new=1" className={hb.outline}>
              <LayoutGrid aria-hidden className="size-4" /> New ticket
            </Link>
          </>
        }
      />

      <StatRow>
        <Stat label="Open pipeline" value={taka(pipeline, { compact: true })} icon={Handshake} href="/hq/clients" sub={`${c.open.length} deals`} />
        <Stat label="Won this season" value={c.won.length} icon={Trophy} field="cobalt" href="/hq/clients" sub={taka(c.won.reduce((sum, x) => sum + x.value, 0), { compact: true })} />
        <Stat label="Follow-ups due" value={c.stale.length} icon={AlarmClock} field="ink" href="/hq/clients" sub={c.stale.length ? <span className="text-crimson-bright">quiet 7+ days</span> : "all fresh"} />
        <Stat label="Projects running" value={c.projects.length} icon={FolderKanban} href="/hq/clients" />
        <Stat label="Unpaid invoices" value={c.unpaid.length} icon={Banknote} field="cobalt" href="/hq/clients" sub={taka(c.unpaid.reduce((sum, d) => sum + docTotals(d).total, 0), { compact: true })} />
        <Stat label={c.own ? "My clients" : "Clients"} value={c.clients.length} icon={UserRound} field="ink" href="/hq/clients" />
      </StatRow>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Pipeline by stage" icon={Handshake} sub="Deals and value per stage" className="xl:col-span-7" action={<PanelLink href="/hq/clients">Pipeline</PanelLink>}>
          <ul className="grid gap-x-8 gap-y-1.5 md:grid-cols-2">
            {stages.map(({ st, list }) => (
              <BarRow key={st} label={STAGE_LABEL[st]} value={list.length} max={stageMax} hint={`${list.length} · ${taka(list.reduce((sum, x) => sum + x.value, 0), { compact: true })}`} href="/hq/clients" />
            ))}
          </ul>
        </Panel>
        <Panel title="Follow-ups" icon={AlarmClock} sub="Open deals with no move in a week" field="ink" className="xl:col-span-5">
          {c.stale.length === 0 ? (
            <Empty title="Nothing to chase" icon={AlarmClock} className="py-6">
              Deals quiet for a week land here.
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {c.stale.slice(0, 5).map((x) => {
                const days = Math.floor((now - Date.parse(x.stageAt)) / 86400_000);
                return (
                  <li key={x.id}>
                    <Link href={`/hq/clients/${x.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{x.org}</span>
                        <span className="block truncate text-xs text-white/55">
                          {x.contact.name} · {STAGE_LABEL[x.stage]}
                        </span>
                      </span>
                      <Pill tone={days > 14 ? "red" : "navy"}>{days} days</Pill>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Projects" icon={FolderKanban} sub="Confirmed work, soonest due first" className="xl:col-span-7" action={<PanelLink href="/hq/clients">Clients</PanelLink>}>
          {c.projects.length === 0 ? (
            <Empty title="No running projects" icon={FolderKanban} className="py-6">
              Confirming a client opens its project and the HR room.
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {c.projects.slice(0, 5).map((p) => {
                const span = Math.max(1, Date.parse(p.due) - Date.parse(p.start));
                const used = ((now - Date.parse(p.start)) / span) * 100;
                return (
                  <li key={p.id}>
                    <Link href={`/hq/clients/${p.clientId}`} className="block rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                      <span className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{p.title}</span>
                        <span className="shrink-0 text-xs text-white/60">Due {dateLabel(p.due)}</span>
                      </span>
                      <Progress value={used} tone={used > 100 ? "red" : "gold"} className="mt-2 h-1.5" label={`${p.title}: time used`} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <Panel title="Documents" icon={FileText} sub="Latest for your clients" field="cobalt" className="xl:col-span-5">
          {c.docs.length === 0 ? (
            <Empty title="No documents yet" icon={FileText} className="py-6" />
          ) : (
            <ul className="flex flex-col gap-2">
              {c.docs.slice(0, 5).map((d) => (
                <li key={d.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs text-signal-orange">{d.number}</span>
                    <span className="block truncate text-xs text-white/60">{v.clients.find((x) => x.id === d.clientId)?.org}</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">{taka(docTotals(d).total, { compact: true })}</span>
                  <Pill tone={d.status === "paid" ? "gold" : d.status === "void" ? "red" : "navy"}>{d.status}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Tickets I published" icon={LayoutGrid} className="xl:col-span-6" action={<PanelLink href="/hq/tasks">Board</PanelLink>}>
          <TaskList tasks={published} showTaker empty={<Empty title="No open tickets from you" icon={LayoutGrid} className="py-6" action={<Link href="/hq/tasks?new=1" className={hb.goldSm}>Publish a ticket</Link>} />} />
        </Panel>
        <MeetingsPanel events={meetings} field="ink" className="xl:col-span-6" />
      </div>
    </div>
  );
}
