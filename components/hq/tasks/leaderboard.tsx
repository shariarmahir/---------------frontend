"use client";

import { Award, Crown, Medal, ShieldCheck, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { nameOf, useInOffice, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Empty, hb, PageHead, Panel, Pill, Progress, Seg, selectCls } from "@/components/hq/kit";
import { useAct, useHq } from "@/components/hq/provider";
import { dateLabel } from "@/lib/hq/format";
import { addDays, can, num } from "@/lib/hq/rules";
import { leaderboard, MERIT_LABEL, PRIORITY_BASE, QUICK_SILVER_POINTS, rankFor, RANKS, seasonOf, weekStart } from "@/lib/hq/scoring";
import type { BadgeKind } from "@/lib/hq/types";
import { cn } from "@/lib/utils";
import { BADGE_LABEL } from "./shared";

type Span = "week" | "month" | "season";
const BADGE_ICON: Record<BadgeKind, typeof Zap> = { "quick-silver": Zap, "iron-man": ShieldCheck, "man-of-the-day": Medal, "luther-king": Crown, shield: ShieldCheck, helper: Sparkles };

export function Leaderboard() {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const inOffice = useInOffice();
  const today = useToday();
  const [span, setSpan] = useState<Span>("season");
  const [pick, setPick] = useState("");
  const season = seasonOf(today);
  const range = span === "week" ? { from: weekStart(today), to: today } : span === "month" ? { from: `${today.slice(0, 7)}-01`, to: today } : { from: season.start, to: season.end };
  const active = v.people.filter((p) => p.status === "active" && !p.demo);
  const rows = useMemo(() => leaderboard(v.points, active.map((p) => p.id), range.from, range.to), [v.points, active, range.from, range.to]);
  const seasonRows = useMemo(() => new Map(leaderboard(v.points, active.map((p) => p.id), season.start, season.end).map((r) => [r.personId, r.points])), [v.points, active, season.start, season.end]);
  const top = rows.slice(0, 3);
  const max = rows[0]?.points || 1;
  const reviewer = can(v.me.person, "tasks.review");
  const motdToday = v.badges.find((b) => b.kind === "man-of-the-day" && b.day === today);
  const todaysReports = v.reports.filter((r) => r.day === today);

  return (
    <>
      <PageHead
        title="Ranks & Badges"
        lead={`Season ${season.label}. Points come from tasks (priority × risk × timing × accuracy), merits, badges and help — ranks are re-earned every six months.`}
        actions={<Seg label="Period" value={span} onChange={setSpan} options={[{ value: "week", label: "This week" }, { value: "month", label: "This month" }, { value: "season", label: "Season" }]} />}
      />

      <section aria-label="Podium" className="mb-6 grid grid-cols-3 items-end gap-3 sm:gap-5">
        {[1, 0, 2].map((i) => {
          const r = top[i];
          const p = r && people.get(r.personId);
          const h = i === 0 ? "h-44 sm:h-56" : i === 1 ? "h-36 sm:h-44" : "h-28 sm:h-36";
          return (
            <div key={i} className="flex flex-col items-center gap-2" style={{ "--i": i } as React.CSSProperties}>
              {p ? (
                <>
                  <Avatar person={p} size={i === 0 ? "xl" : "lg"} className={i === 0 ? "ring-4 ring-signal-orange" : ""} />
                  <p className="max-w-full truncate text-center text-sm font-bold text-white">{p.name}</p>
                  <p className="font-mono text-xs font-bold text-signal-orange">{num(r.points)} pts</p>
                </>
              ) : null}
              <div className={cn("podium-rise flex w-full flex-col items-center justify-start rounded-t-2xl pt-3 ring-1 ring-white/12", h, i === 0 ? "bg-signal-orange text-text-primary" : i === 1 ? "bg-bdnavy-900 text-white" : "bg-cobalt text-white")}>
                {i === 0 ? <Trophy aria-hidden className="size-7" /> : <Award aria-hidden className="size-6" />}
                <span className="font-grotesk text-3xl font-bold">{i + 1}</span>
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Leaderboard" icon={Trophy} className="xl:col-span-7">
          <ol className="flex flex-col gap-2">
            {rows.map((r, i) => {
              const p = people.get(r.personId);
              const rank = rankFor(seasonRows.get(r.personId) ?? 0);
              return (
                <li key={r.personId} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg font-grotesk text-sm font-bold", i < 3 ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/75")}>{i + 1}</span>
                  <Avatar person={p} size="sm" online={inOffice.has(r.personId)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-white">{p?.name}</span>
                      <span className="shrink-0 font-mono text-xs font-bold text-signal-orange">{num(r.points)}</span>
                    </span>
                    <Progress value={(Math.max(0, r.points) / max) * 100} className="mt-1.5 h-1.5" label={`${p?.name}: ${r.points} points`} />
                  </span>
                  <Pill tone="navy" className="hidden w-28 justify-center sm:inline-flex">
                    {rank.label}
                  </Pill>
                </li>
              );
            })}
          </ol>
        </Panel>

        <div className="flex flex-col gap-5 xl:col-span-5">
          <Panel title="Ranks" icon={Star} field="cobalt">
            <ol className="flex flex-col gap-2">
              {RANKS.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-black/25 font-grotesk text-sm font-bold text-signal-orange">{i + 1}</span>
                  <span className="flex-1 font-semibold text-white">{r.label}</span>
                  <span className="font-mono text-xs text-white/75">{num(r.min)}+ pts</span>
                  <span className="text-xs text-white/60">{active.filter((p) => rankFor(seasonRows.get(p.id) ?? 0).id === r.id).length} people</span>
                </li>
              ))}
            </ol>
          </Panel>

          {reviewer ? (
            <Panel title="Man of the day" icon={Medal} field="ink">
              {motdToday ? (
                <p className="text-sm text-white/85">
                  Today: <strong className="text-signal-orange">{nameOf(people, motdToday.personId)}</strong> — {motdToday.note}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-white/70">{todaysReports.length} daily reports today. Pick the best one.</p>
                  <div className="flex gap-2">
                    <select aria-label="Choose the man of the day" value={pick} onChange={(e) => setPick(e.target.value)} className={selectCls}>
                      <option value="">Choose…</option>
                      {todaysReports.map((r) => (
                        <option key={r.id} value={r.personId}>
                          {nameOf(people, r.personId)}
                        </option>
                      ))}
                    </select>
                    <button type="button" disabled={!pick} onClick={() => act("tasks", "manOfDay", { personId: pick, note: "Best daily report" }, { ok: "Man of the day chosen" })} className={hb.gold}>
                      Award
                    </button>
                  </div>
                </div>
              )}
            </Panel>
          ) : null}

          <Panel title="How points work" icon={Sparkles}>
            <ul className="flex flex-col gap-1.5 text-sm text-white/80">
              <li>Ticket value: {Object.entries(PRIORITY_BASE).map(([k, n]) => `${k.replace("-", " ")} ${n}`).join(", ")}; × risk (1, 1.25, 1.5) × size.</li>
              <li>Timing: +10% per day early (up to +30%), −15% per day late.</li>
              <li>Accuracy at review: × 0.6 to × 1.0.</li>
              <li>Merits: {Object.values(MERIT_LABEL).map((m) => m.label.toLowerCase()).join(", ")}.</li>
              <li>Quick Silver +{QUICK_SILVER_POINTS}, Iron Man +40, Man of the day +15, helping +8, daily report +2.</li>
              <li>Team tasks: 10% to the leader, the rest shared evenly.</li>
            </ul>
          </Panel>
        </div>
      </div>

      <h2 className="mt-8 mb-4 font-grotesk text-2xl font-bold text-signal-orange">Badge gallery</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(["quick-silver", "iron-man", "man-of-the-day", "shield", "helper"] as BadgeKind[]).map((k) => {
          const list = [...v.badges].filter((b) => b.kind === k).sort((a, b) => b.day.localeCompare(a.day));
          const Icon = BADGE_ICON[k];
          return (
            <Panel key={k} title={BADGE_LABEL[k]} icon={Icon} field={k === "iron-man" ? "cobalt" : k === "man-of-the-day" ? "ink" : "navy"}>
              {list.length === 0 ? (
                <Empty title="Not awarded yet" className="py-5" />
              ) : (
                <ul className="flex flex-col gap-2">
                  {list.slice(0, 6).map((b) => (
                    <li key={b.id} className="flex items-center gap-3">
                      <Avatar person={people.get(b.personId)} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{nameOf(people, b.personId)}</span>
                        <span className="block truncate text-xs text-white/60">{b.note}</span>
                      </span>
                      <span className="shrink-0 text-xs text-white/50">{dateLabel(b.day)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
        <Panel title="Season reset" icon={Crown} field="ink">
          <p className="text-sm leading-relaxed text-white/75">
            The season ends on {dateLabel(season.end, { year: true })}. Your next rank is the one your season&apos;s points reach — up, or down by at most one step. {Math.max(0, Math.round((Date.parse(`${season.end}T18:00:00Z`) - Date.parse(`${addDays(today, 0)}T00:00:00Z`)) / 86400_000))} days to go.
          </p>
        </Panel>
      </div>
    </>
  );
}
