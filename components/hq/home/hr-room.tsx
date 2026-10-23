"use client";

import Link from "next/link";
import { CalendarOff, Clock, FileText, FolderKanban, Scale, Send, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";
import { usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Empty, hb, Panel, PanelLink, Pill, Stat, type Tone } from "@/components/hq/kit";
import { useHq } from "@/components/hq/provider";
import { docTotals } from "@/lib/hq/finance";
import { clockLabel, dateLabel } from "@/lib/hq/format";
import { taka } from "@/lib/hq/rules";
import type { Application, Case, Checkin, Day, Doc, HqView, Person, Project } from "@/lib/hq/types";
import { BarRow, DecisionsPanel, MeetingsPanel, RoomHead, StatRow, useDecisions, useMeetings } from "./parts";

const DOC_LABEL: Record<Doc["kind"], string> = { quotation: "Quotation", invoice: "Invoice", challan: "Challan", "mushok-6.3": "Mushok 6.3", contract: "Contract", receipt: "Receipt" };
const DOC_TONE: Record<Doc["status"], Tone> = { draft: "muted", sent: "navy", paid: "gold", void: "red" };
const CASE_STATE: Partial<Record<Case["status"], { tone: Tone; label: string }>> = {
  filed: { tone: "navy", label: "Awaiting answer" },
  answered: { tone: "gold", label: "Ready for verdict" },
  appealed: { tone: "red", label: "Appealed" },
};

interface Presence {
  tone: Tone;
  label: string;
  order: number;
}

function presence(c: Checkin | undefined, away: boolean): Presence {
  if (away) return { tone: "cobalt", label: "On leave", order: 2 };
  if (!c) return { tone: "muted", label: "Not in yet", order: 4 };
  if (c.out) return { tone: "muted", label: `Left ${clockLabel(c.out)}`, order: 3 };
  return c.late ? { tone: "red", label: `Late ${c.lateMins} min`, order: 0 } : { tone: "gold", label: `In ${clockLabel(c.in)}`, order: 1 };
}

/** People & Paperwork: who is in, who is late or away, what waits for HR, and every document. */
export function HrRoom() {
  const v = useHq();
  const today = useToday();
  const meetings = useMeetings(true);
  const decisions = useDecisions();
  const paperwork = v.me.perms.includes("hr.manage");

  const s = useMemo(() => {
    const team = v.people.filter((p) => p.status === "active" && !p.demo);
    const away = (pid: string, d: Day) => v.leaves.some((l) => l.personId === pid && l.status === "approved" && l.from <= d && l.to >= d);
    const onLeave = new Set(team.filter((p) => away(p.id, today)).map((p) => p.id));
    const roll = team
      .map((p) => ({ p, state: presence(v.checkins.find((c) => c.personId === p.id && c.day === today), onLeave.has(p.id)) }))
      .sort((a, b) => a.state.order - b.state.order || a.p.name.localeCompare(b.p.name));
    const month = today.slice(0, 7);
    const inToday = v.checkins.filter((c) => c.day === today);
    const lateMonth = new Map<string, number>();
    for (const c of v.checkins) if (c.late && c.day.startsWith(month)) lateMonth.set(c.personId, (lateMonth.get(c.personId) ?? 0) + 1);
    return {
      team,
      onLeave,
      roll,
      inNow: inToday.filter((c) => !c.out).length,
      lateToday: inToday.filter((c) => c.late).length,
      leaveRequests: v.leaves.filter((l) => l.status === "pending").length,
      applications: v.applications.filter((a) => a.status === "pending"),
      docsMonth: v.docs.filter((d) => d.date.startsWith(month)).length,
      lateMonth: [...lateMonth.entries()].sort((a, b) => b[1] - a[1]),
      projects: v.projects.filter((p) => p.status === "setup" || p.status === "running"),
      cases: v.cases.filter((c) => c.status in CASE_STATE),
      docs: [...v.docs].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5),
    };
  }, [v.people, v.leaves, v.checkins, v.applications, v.docs, v.projects, v.cases, today]);

  const waiting = s.leaveRequests + s.applications.length;

  return (
    <div className="flex flex-col gap-5">
      <RoomHead
        summary={
          <>
            {s.inNow} of {s.team.length} people are in the office and {s.onLeave.size} on leave
            {s.lateToday ? <span className="text-crimson-bright">; {s.lateToday} came in late</span> : null}. {waiting === 0 ? "No requests wait for HR." : `${waiting} ${waiting === 1 ? "request waits" : "requests wait"} for HR.`}
          </>
        }
        actions={
          <>
            <Link href="/hq/attendance" className={hb.gold}>
              <Clock aria-hidden className="size-4" /> Attendance
            </Link>
            {paperwork ? (
              <Link href="/hq/hr" className={hb.outline}>
                <Send aria-hidden className="size-4" /> Report to the CEO
              </Link>
            ) : null}
          </>
        }
      />

      <StatRow>
        <Stat label="In the office" value={`${s.inNow}/${s.team.length}`} icon={Users} href="/hq/attendance" />
        <Stat label="Late today" value={s.lateToday} icon={Clock} field="ink" href="/hq/attendance" sub={s.lateToday ? <span className="text-crimson-bright">after the grace time</span> : "everyone on time"} />
        <Stat label="On leave" value={s.onLeave.size} icon={CalendarOff} field="cobalt" href="/hq/attendance" sub="today" />
        <Stat label="Leave requests" value={s.leaveRequests} icon={CalendarOff} href="/hq/approvals" sub="waiting" />
        <Stat label="Applications" value={s.applications.length} icon={UserPlus} field="ink" href="/hq/approvals" sub="for a member ID" />
        <Stat label="Documents" value={s.docsMonth} icon={FileText} field="cobalt" href="/hq/hr" sub="this month" />
      </StatRow>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <AttendancePanel roll={s.roll} today={today} className="xl:col-span-7" />
        <div className="flex flex-col gap-5 xl:col-span-5">
          <DecisionsPanel items={decisions} max={3} />
          <ApplicationsPanel list={s.applications} />
        </div>

        {paperwork ? (
          <>
            <DocumentsPanel docs={s.docs} clients={v.clients} className="xl:col-span-7" />
            <div className="flex flex-col gap-5 xl:col-span-5">
              <ProjectRoomsPanel projects={s.projects} />
              <CasesPanel cases={s.cases} articles={v.articles} />
            </div>
          </>
        ) : (
          <CasesPanel cases={s.cases} articles={v.articles} className="xl:col-span-12" />
        )}

        <LatePanel late={s.lateMonth} className="xl:col-span-7" />
        <MeetingsPanel events={meetings} className="xl:col-span-5" />
      </div>
    </div>
  );
}

function AttendancePanel({ roll, today, className }: { roll: { p: Person; state: Presence }[]; today: Day; className?: string }) {
  return (
    <Panel title="Attendance today" icon={Clock} sub={dateLabel(today, { weekday: true, long: true })} className={className} action={<PanelLink href="/hq/attendance">Attendance</PanelLink>}>
      <ul className="grid gap-2 sm:grid-cols-2">
        {roll.map(({ p, state }) => (
          <li key={p.id}>
            <Link href={`/hq/people/${p.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2 ring-1 ring-white/8 transition-colors hover:bg-black/40">
              <Avatar person={p} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                <span className="block truncate text-xs text-white/55">{p.designation}</span>
              </span>
              <Pill tone={state.tone}>{state.label}</Pill>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ApplicationsPanel({ list }: { list: Application[] }) {
  return (
    <Panel title="ID applications" icon={UserPlus} field="ink" action={<PanelLink href="/hq/approvals">Approvals</PanelLink>}>
      {list.length === 0 ? (
        <p className="text-sm leading-relaxed text-white/65">No applications waiting. New members apply at /hq/apply and their request lands here.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.slice(0, 3).map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
              <Avatar person={{ name: a.name, photo: null }} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{a.name}</span>
                <span className="block truncate font-mono text-xs text-white/55">{a.handle}</span>
              </span>
              <Link href="/hq/approvals" className={hb.outlineSm}>
                Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DocumentsPanel({ docs, clients, className }: { docs: Doc[]; clients: HqView["clients"]; className?: string }) {
  return (
    <Panel title="Recent documents" icon={FileText} sub="Quotations, invoices, challans and Mushok" className={className} action={<PanelLink href="/hq/hr">HR desk</PanelLink>}>
      {docs.length === 0 ? (
        <Empty title="No documents yet" icon={FileText} className="py-6" />
      ) : (
        <ul className="flex flex-col gap-2">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
              <span className="w-32 shrink-0 font-mono text-xs text-signal-orange">{d.number}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{clients.find((c) => c.id === d.clientId)?.org ?? "Client"}</span>
                <span className="block text-xs text-white/55">
                  {DOC_LABEL[d.kind]} · {dateLabel(d.date)}
                </span>
              </span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">{taka(docTotals(d).total, { compact: true })}</span>
              <Pill tone={DOC_TONE[d.status]}>{d.status}</Pill>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ProjectRoomsPanel({ projects }: { projects: Project[] }) {
  return (
    <Panel title="Project rooms" icon={FolderKanban} sub="Opened when a client confirms" field="cobalt" action={<PanelLink href="/hq/hr">HR desk</PanelLink>}>
      {projects.length === 0 ? (
        <p className="text-sm text-white/70">No running projects.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.slice(0, 3).map((p) => (
            <li key={p.id}>
              <Link href={p.channelId ? `/hq/chat?c=${p.channelId}` : "/hq/hr"} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{p.title}</span>
                  <span className="block truncate text-xs text-white/60">
                    Due {dateLabel(p.due)} · {taka(p.budget, { compact: true })}
                  </span>
                </span>
                <Pill tone={p.handedOver ? "gold" : "red"}>{p.handedOver ? "Handed over" : "Hand over"}</Pill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function CasesPanel({ cases, articles, className }: { cases: Case[]; articles: HqView["articles"]; className?: string }) {
  const people = usePeople();
  return (
    <Panel title="Shongbidhan desk" icon={Scale} sub="Open cases" field="ink" className={className} action={<PanelLink href="/hq/shongbidhan">Shongbidhan</PanelLink>}>
      {cases.length === 0 ? (
        <p className="text-sm text-white/65">No open cases.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cases.slice(0, 3).map((c) => {
            const art = articles.find((a) => a.id === c.articleId);
            const state = CASE_STATE[c.status]!;
            return (
              <li key={c.id}>
                <Link href="/hq/shongbidhan" className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 transition-colors hover:bg-black/40">
                  <Avatar person={people.get(c.accusedId)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{people.get(c.accusedId)?.name ?? "Former member"}</span>
                    <span className="block truncate text-xs text-white/55">{art ? `${art.title} · Section ${art.section}` : "Article"}</span>
                  </span>
                  <Pill tone={state.tone}>{state.label}</Pill>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function LatePanel({ late, className }: { late: [string, number][]; className?: string }) {
  const people = usePeople();
  const max = late[0]?.[1] ?? 1;
  return (
    <Panel title="Late this month" icon={Clock} sub="Late check-ins per person" className={className} action={<PanelLink href="/hq/attendance">Details</PanelLink>}>
      {late.length === 0 ? (
        <Empty title="Nobody late this month" icon={Clock} className="py-6" />
      ) : (
        <ul className="grid gap-x-8 gap-y-1.5 md:grid-cols-2">
          {late.slice(0, 8).map(([pid, n]) => (
            <BarRow key={pid} label={people.get(pid)?.name ?? "Former member"} value={n} max={max} hint={`${n} ${n === 1 ? "day" : "days"}`} tone={n >= 3 ? "red" : "gold"} href={`/hq/people/${pid}`} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
