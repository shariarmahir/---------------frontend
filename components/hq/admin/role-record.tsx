"use client";

import { BadgeCheck, CalendarCheck, ClipboardCheck, FileText, Handshake, KeyRound, LifeBuoy, NotebookPen, Scale, ShieldCheck, Star, Trophy, UserPlus, UsersRound, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { ROLE_BRIEF } from "@/data/hq/roles";
import { Panel, Pill, Stat, type Field } from "@/components/hq/kit";
import { useHq } from "@/components/hq/provider";
import { num, PERM_LABEL, permsOf, taka } from "@/lib/hq/rules";
import { isAdvance } from "@/lib/hq/scoring";
import type { HqView, Person } from "@/lib/hq/types";

interface Figure {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
}

/** The four figures that say how someone is doing in their role: a chief's reviews, HR's documents, a member's deliveries. */
function figuresFor(p: Person, v: HqView): Figure[] {
  const decided = v.approvals.filter((a) => a.decidedBy === p.id);
  const published = v.tasks.filter((t) => t.createdBy === p.id).length;
  const delivered = v.tasks.filter((t) => t.takenBy === p.id && t.submittedAt);
  switch (p.level) {
    case "prime":
      return [
        { label: "Decisions made", value: decided.length, icon: BadgeCheck },
        { label: "Verdicts given", value: v.cases.filter((c) => c.verdict?.by === p.id).length, icon: Scale },
        { label: "Teams approved", value: v.teams.filter((t) => t.approvedBy === p.id).length, icon: UsersRound },
        { label: "Tickets published", value: published, icon: ClipboardCheck },
      ];
    case "chief":
      return [
        { label: "Reviews given", value: v.tasks.filter((t) => t.review?.by === p.id).length, icon: ClipboardCheck },
        { label: "Tickets published", value: published, icon: FileText },
        { label: "Decisions made", value: decided.length, icon: BadgeCheck },
        { label: "Teams approved", value: v.teams.filter((t) => t.approvedBy === p.id).length, icon: UsersRound },
      ];
    case "hr":
      return [
        { label: "Documents issued", value: v.docs.filter((d) => d.by === p.id).length, icon: FileText },
        { label: "Leave decided", value: decided.filter((a) => a.kind === "leave").length, icon: CalendarCheck },
        { label: "Members onboarded", value: decided.filter((a) => a.kind === "application" && a.status === "accepted").length, icon: UserPlus },
        { label: "Project rooms handed over", value: v.projects.filter((x) => x.handedOver?.by === p.id).length, icon: KeyRound },
      ];
    case "lead": {
      const led = v.teams.filter((t) => t.leaderId === p.id);
      const ids = new Set(led.map((t) => t.id));
      const rated = v.clients.filter((c) => c.teamId && ids.has(c.teamId) && c.review).map((c) => c.review!.score);
      return [
        { label: "Teams led", value: led.filter((t) => t.status === "active").length, icon: UsersRound },
        { label: "Team deliveries", value: v.tasks.filter((t) => t.teamId && ids.has(t.teamId) && t.status === "done").length, icon: ClipboardCheck },
        { label: "Best client rating", value: rated.length ? `${Math.max(...rated).toFixed(1)} ★` : "—", icon: Star },
        { label: "Iron Man", value: v.badges.filter((b) => b.personId === p.id && b.kind === "iron-man").length, icon: ShieldCheck },
      ];
    }
    case "client-manager": {
      const mine = v.clients.filter((c) => c.managerId === p.id);
      const won = mine.filter((c) => ["confirmed", "in-progress", "delivered", "reviewed"].includes(c.stage));
      return [
        { label: "Clients managed", value: mine.length, icon: Handshake },
        { label: "Deals won", value: won.length, icon: Trophy },
        { label: "Value won", value: taka(won.reduce((s, c) => s + c.value, 0), { compact: true }), icon: BadgeCheck },
        { label: "Reviews collected", value: mine.filter((c) => c.review).length, icon: Star },
      ];
    }
    default:
      return [
        { label: "Tasks delivered", value: delivered.length, icon: ClipboardCheck },
        { label: "Delivered early", value: delivered.filter((t) => isAdvance(t)).length, icon: Zap },
        { label: "Helps given", value: v.help.filter((h) => h.helperId === p.id && h.status === "solved").length, icon: LifeBuoy },
        { label: "Daily reports", value: num(v.reports.filter((r) => r.personId === p.id).length), icon: NotebookPen },
      ];
  }
}

const FIELDS: Field[] = ["navy", "cobalt", "ink", "navy"];

/** A profile's record strip: different figures for each level. */
export function RoleRecord({ p }: { p: Person }) {
  const v = useHq();
  const figures = useMemo(() => figuresFor(p, v), [p, v]);
  return (
    <section aria-label="Record" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {figures.map((f, i) => (
        <Stat key={f.label} label={f.label} value={f.value} icon={f.icon} field={FIELDS[i]} />
      ))}
    </section>
  );
}

/** What the level is for and the access this person actually holds. */
export function RolePanel({ p, className }: { p: Person; className?: string }) {
  const brief = ROLE_BRIEF[p.level];
  const perms = permsOf(p);
  return (
    <Panel title={`Role · ${brief.room}`} icon={KeyRound} field="cobalt" className={className}>
      <p className="text-sm leading-relaxed text-white/85">{brief.mission}</p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {brief.duties.map((d) => (
          <li key={d} className="flex gap-2 text-sm text-white/75">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-signal-orange" />
            {d}
          </li>
        ))}
      </ul>
      <p className="mt-4 mb-2 text-xs font-semibold text-white/60">{p.level === "prime" ? "Access: every permission" : `Access (${perms.length})`}</p>
      {p.level === "prime" ? null : perms.length ? (
        <div className="flex flex-wrap gap-1.5">
          {perms.map((x) => (
            <Pill key={x} tone="navy">
              {PERM_LABEL[x].label}
            </Pill>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/65">Their own work only: tasks, chat, calendar and help.</p>
      )}
    </Panel>
  );
}
