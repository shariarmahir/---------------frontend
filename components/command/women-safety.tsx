"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIVISION_BY_ID } from "@/data/command/divisions";
import type { HourPattern } from "@/lib/command/intel";
import { redactCase } from "@/lib/command/privacy";
import { CATEGORY_META } from "@/lib/command/routing";
import { isOpen, womenCases, type WomenDeskLoad } from "@/lib/command/selectors";
import { perDivision, selectUnitsIn, selectWomenDesks, selectWomenHotspots, selectWomenHourPattern, useCommand } from "@/lib/command/store";
import type { World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable } from "./case-table";
import { DivisionPicker, DivisionScopeNote, divisionFocus, useDivision } from "./division-picker";
import { HelplineList, OccNote } from "./emergency-helplines";
import { Bn, EmptyState, Kpi, Panel, Skeleton, cb, focusRing, formatMin, num } from "./kit";
import { MapView, type HeatSpot } from "./map-view";
import { CommandPage } from "./shell";
import { hourWindow, patrolPlan } from "./women-data";

/**
 * /protibad/command/women: Women safety. Women and child cases only
 * (selectors' isWomenCase), privacy first: no survivor's name, title or
 * summary is on the page (lib/command/privacy redacts them), the map shifts every
 * dot (privacy mode) and the heat layer marks areas, not points. Key figures,
 * the map with the last hour's harassment and violence hotspots, the 30-day
 * hour-of-day pattern, each station's women help desk load, where to patrol,
 * survivor support (999, 109, One-Stop Crisis Centre) and the case table.
 * Division scope in ?div=. Uses useSearchParams: render it inside <Suspense>.
 */

/* ───────────── selectors (module level, one memo per division) ───────────── */

interface WomenStats {
  open: number;
  critical: number;
  awaiting: number;
  /** Median minutes from report to first answer over every women and child case still in the world. */
  medianMin: number | null;
  answered: number;
}

const selectStats = perDivision((w, d): WomenStats => {
  const s: WomenStats = { open: 0, critical: 0, awaiting: 0, medianMin: null, answered: 0 };
  const mins: number[] = [];
  for (const c of womenCases(w, d)) {
    if (c.firstAckAt !== undefined) mins.push((c.firstAckAt - c.reportedAt) / 60_000);
    if (!isOpen(c)) continue;
    s.open++;
    if (c.severity === "critical") s.critical++;
    if (c.status === "new" || c.status === "alerted") s.awaiting++;
  }
  s.answered = mins.length;
  if (mins.length) {
    mins.sort((a, b) => a - b);
    const mid = mins.length >> 1;
    s.medianMin = mins.length % 2 ? mins[mid] : (mins[mid - 1] + mins[mid]) / 2;
  }
  return s;
});

/** Open women and child cases for the map (privacy mode draws them shifted). */
const selectOpenWomen = perDivision((w, d) => womenCases(w, d).filter(isOpen));
/** The table's rows with titles and summaries taken out: open only, or every case still in the world. */
const selectTableOpen = perDivision((w, d) => womenCases(w, d).filter(isOpen).map(redactCase));
const selectTableAll = perDivision((w, d) => womenCases(w, d).map(redactCase));
const selectSeed = (w: World): number => w.seed;

/* ───────────── hour of day ───────────── */

const pad = (h: number): string => String(h).padStart(2, "0");
const PEAKS = 3;

/**
 * Harassment and violence reports by hour of day over the 30-day history: one
 * gold series, so no legend (the title names it). The three peak hours carry
 * their value; hovering a bar reads out its hour and count; the numbers are in
 * a table for screen readers.
 */
function HourChart({ pattern }: { pattern: HourPattern | null }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!pattern) return <Skeleton className="h-52 w-full" />;
  const { totals, rows, categories, days } = pattern;
  const max = Math.max(1, ...totals);
  const peaks = totals
    .map((n, h) => ({ n, h }))
    .sort((a, b) => b.n - a.n || a.h - b.h)
    .slice(0, PEAKS)
    .filter((p) => p.n > 0)
    .map((p) => p.h);
  const peakSet = new Set(peaks);
  // Value labels on the peaks, highest first, skipping a peak within two hours of one already labelled (they would collide).
  const labelled = new Set<number>();
  for (const h of peaks) if (![...labelled].some((l) => Math.abs(l - h) <= 2)) labelled.add(h);
  const readout = hover ?? peaks[0] ?? 0;
  const ordered = peaks.slice().sort((a, b) => a - b);

  return (
    <figure className="flex flex-col gap-3">
      <p aria-hidden="true" className="min-h-5 text-sm text-white/80 tabular-nums">
        <span className="font-semibold text-white">{hourWindow(readout, 1)}</span> · {num(totals[readout])} reports in {days} days
        {hover === null && peaks.length ? <span className="text-white/65"> · the busiest hour</span> : null}
      </p>
      <div aria-hidden="true" className="relative" onPointerLeave={() => setHover(null)}>
        <div className="flex h-44 items-end gap-0.5 border-b border-white/20 pt-6">
          {totals.map((n, h) => {
            const peak = peakSet.has(h);
            return (
              <div key={h} className="relative flex h-full min-w-0 flex-1 items-end" onPointerEnter={() => setHover(h)}>
                {labelled.has(h) ? (
                  <span className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-white tabular-nums" style={{ bottom: `calc(${(n / max) * 100}% + 4px)` }}>
                    {num(n)}
                  </span>
                ) : null}
                <span
                  className={cn("block w-full rounded-t-[4px] bg-signal-orange transition-opacity motion-reduce:transition-none", hover !== null && hover !== h ? "opacity-45" : peak || hover === h ? "opacity-100" : "opacity-75")}
                  style={{ height: `${Math.max(n > 0 ? 2 : 0, (n / max) * 100)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-0.5">
          {totals.map((_, h) => (
            <span key={h} className="min-w-0 flex-1 text-center text-xs text-white/65 tabular-nums">
              {h % 6 === 0 ? pad(h) : ""}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="text-xs leading-relaxed text-white/65">
        {ordered.length ? (
          <>
            Peak hours: <span className="font-semibold text-white tabular-nums">{ordered.map((h) => `${pad(h)}:00`).join(", ")}</span>. Sample 30-day history for this demo,
            Dhaka time.
          </>
        ) : (
          "No reports in the sample history for this scope."
        )}
      </figcaption>
      {/* A table ignores the 1px box of sr-only, so the wrapper carries it. */}
      <div className="sr-only">
        <table>
          <caption>Harassment and violence reports by hour of day, {days} days</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              {categories.map((c) => (
                <th key={c} scope="col">
                  {CATEGORY_META[c].label}
                </th>
              ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, h) => (
              <tr key={h}>
                <th scope="row">{hourWindow(h, 1)}</th>
                {r.map((n, j) => (
                  <td key={j}>{n}</td>
                ))}
                <td>{totals[h]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/* ───────────── help desk load ───────────── */

const DESKS_SHOWN = 8;

function DeskLoad({ desks }: { desks: WomenDeskLoad[] | null }) {
  const [all, setAll] = useState(false);
  if (!desks) return <Skeleton className="h-52 w-full" />;
  if (desks.length === 0) {
    return (
      <EmptyState icon="support_agent" title="No open women and child cases">
        Each station&apos;s women help desk load shows here as cases come in.
      </EmptyState>
    );
  }
  const max = Math.max(1, ...desks.map((d) => d.open));
  const shown = all ? desks : desks.slice(0, DESKS_SHOWN);
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
        {shown.map((d) => (
          <li key={d.station.id} className="border-b border-white/8">
            <Link href={`/protibad/command/police/stations/${d.station.id}`} className={cn("group flex flex-col gap-1.5 rounded-lg py-2.5", focusRing)}>
              <span className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white group-hover:text-signal-orange">{d.station.name.replace(/ Police Station$/, "")}</span>
                <span className="shrink-0 font-grotesk text-base font-bold text-white tabular-nums">
                  {num(d.open)}
                  <span className="sr-only"> open</span>
                </span>
              </span>
              <span aria-hidden="true" className="block h-1.5 rounded-full bg-white/8">
                <span className="block h-full rounded-full bg-signal-orange" style={{ width: `${(d.open / max) * 100}%` }} />
              </span>
              <span className="flex flex-wrap gap-x-3 text-xs text-white/65 tabular-nums">
                <Bn>{d.station.nameBn}</Bn>
                {d.critical ? <span className="font-semibold text-crimson-bright">{num(d.critical)} critical</span> : <span>None critical</span>}
                <span>{d.awaiting ? `${num(d.awaiting)} waiting for a unit` : "All answered"}</span>
                <span className="sr-only">. Open the station&apos;s CRM.</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {desks.length > DESKS_SHOWN ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-white/65 tabular-nums">
          <span>
            Showing {num(shown.length)} of {num(desks.length)} stations
          </span>
          <button type="button" aria-expanded={all} onClick={() => setAll((v) => !v)} className={cb.quietSm}>
            {all ? "Show fewer" : `Show all ${num(desks.length)}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────── the page ───────────── */

export function WomenSafety() {
  const [div] = useDivision();
  const [selected, setSelected] = useSelectedCase();
  const [showAll, setShowAll] = useState(false);
  const stats = useCommand(selectStats(div));
  const open = useCommand(selectOpenWomen(div));
  const units = useCommand(selectUnitsIn(div));
  const spots = useCommand(selectWomenHotspots(div));
  const pattern = useCommand(selectWomenHourPattern(div));
  const desks = useCommand(selectWomenDesks(div));
  const table = useCommand(showAll ? selectTableAll(div) : selectTableOpen(div));
  const seed = useCommand(selectSeed);

  const heat = useMemo<HeatSpot[]>(
    () =>
      (spots ?? []).map((h) => ({
        id: `w-${h.area}`,
        lat: h.lat,
        lng: h.lng,
        weight: h.count,
        level: h.rising ? "alert" : "watch",
        label: `${h.areaBn}: ${h.count} women and child ${h.count === 1 ? "report" : "reports"} in the last hour`,
      })),
    [spots],
  );
  const plan = useMemo(() => (seed === null || spots === null ? null : patrolPlan(seed, spots, div)), [seed, spots, div]);
  const onMap = selected !== null && (open?.some((c) => c.id === selected) ?? false);

  const v = (x: number | null | undefined, fmt: (n: number) => string = num) => (x === null || x === undefined ? <Skeleton className="h-7 w-14" /> : fmt(x));

  return (
    <CommandPage
      title="Women safety"
      subtitle="Harassment and violence against women and children, routed to each station's women help desk. Where and when it happens, who is waiting, and where to patrol before it happens."
      actions={
        <Link href="/protibad/command/emergency" className={cb.outline}>
          <Icon name="sos" className="text-[18px]" />
          Emergency desk
        </Link>
      }
    >
      <div className="flex flex-col gap-2">
        <DivisionPicker />
        <DivisionScopeNote div={div}>{stats ? `${num(stats.open)} open women and child cases` : null}</DivisionScopeNote>
      </div>

      <p role="note" className="flex items-start gap-3 rounded-2xl bg-cobalt px-4 py-3 text-sm leading-snug text-white ring-1 ring-white/12 sm:px-5">
        <span aria-hidden="true" className="mt-px inline-flex shrink-0">
          <Icon name="visibility_off" className="text-[20px] text-white" />
        </span>
        <span>
          <span className="font-semibold">Survivor details are never shown on this board: area only, positions shifted.</span>{" "}
          <span className="text-white/80">No name, no exact point, no description of the person. Case titles show the complaint type and the area.</span>
        </span>
      </p>

      <section aria-label="Key figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 lg:grid-cols-4 [&>div]:border-white/10 max-lg:[&>div:nth-child(-n+2)]:border-b max-lg:[&>div:nth-child(odd)]:border-r lg:[&>div:not(:last-child)]:border-r">
          <Kpi label="Open women and child cases" icon="folder_open" value={v(stats?.open)} sub={stats ? "Each a task until closed" : null} />
          <Kpi
            label="Critical"
            icon="priority_high"
            value={stats ? <span className={stats.critical > 0 ? "text-crimson-bright" : undefined}>{num(stats.critical)}</span> : v(null)}
            sub={stats ? "Open, critical severity" : null}
          />
          <Kpi label="Awaiting first response" icon="notifications_active" value={v(stats?.awaiting)} sub={stats ? "No unit has answered yet" : null} />
          <Kpi
            label="Median first response"
            icon="timer"
            value={stats ? formatMin(stats.medianMin) : v(null)}
            sub={stats ? (stats.answered ? `Report to first answer · ${num(stats.answered)} cases` : "None answered yet") : null}
          />
        </dl>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel
            title="Map"
            icon="public"
            sub={
              open && spots ? (
                <span className="tabular-nums">
                  {num(open.length)} open cases · {num(spots.length)} {spots.length === 1 ? "area" : "areas"} with reports in the last hour · positions shifted
                </span>
              ) : (
                <Skeleton className="h-3 w-56" />
              )
            }
            bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
          >
            <div className="relative h-80 border-y border-white/10 sm:h-[26rem] lg:h-[32rem]">
              <MapView
                className="absolute inset-0"
                cases={open ?? []}
                units={units ?? []}
                selectedId={onMap ? (selected ?? undefined) : undefined}
                onSelect={setSelected}
                focus={onMap ? "selection" : divisionFocus(div)}
                showUnits={["station"]}
                heat={heat}
                privacy
              />
            </div>
            <ul aria-label="Map legend" className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
              {[
                { label: "Case, shifted for privacy", swatch: "size-3 rounded-full bg-signal-orange ring-2 ring-black outline outline-1 outline-white/30" },
                { label: "Area with reports in the last hour", swatch: "size-4 rounded-full bg-signal-orange/35 ring-1 ring-signal-orange" },
                { label: "Police station", swatch: "size-3 rounded-sm bg-signal-orange" },
              ].map((l) => (
                <li key={l.label} className="flex items-center gap-2 text-xs text-white/70">
                  <span aria-hidden="true" className="grid size-4 place-items-center">
                    <span className={cn("block", l.swatch)} />
                  </span>
                  {l.label}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Hour of day" icon="schedule" sub="Sexual harassment and domestic violence reports by hour, 30-day sample history">
            <HourChart pattern={pattern} />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel title="Survivor support" icon="health_and_safety" sub="Beside every women and child case">
            <div className="flex flex-col gap-2">
              <HelplineList compact />
              <OccNote />
              <p className="flex items-start gap-3 rounded-xl px-3.5 py-3 text-xs leading-relaxed text-white/80 ring-1 ring-white/10">
                <span aria-hidden="true" className="mt-px inline-flex shrink-0">
                  <Icon name="balance" className="text-[18px] text-bdnavy-300" />
                </span>
                <span>
                  <span className="font-semibold text-white">Free legal aid.</span> The District Legal Aid Office (<Bn>জেলা লিগ্যাল এইড অফিস</Bn>) at each district
                  court can give a lawyer at no cost to a survivor who cannot afford one.
                </span>
              </p>
            </div>
          </Panel>

          <Panel title="Where to patrol" icon="directions_walk" sub="Areas with reports in the last hour first, each with its usual worst three hours">
            {plan === null ? (
              <Skeleton className="h-48 w-full" />
            ) : plan.length === 0 ? (
              <EmptyState icon="map" title="No areas to suggest">
                No harassment or violence in the sample history for this scope.
              </EmptyState>
            ) : (
              <ol className="flex flex-col divide-y divide-white/8">
                {plan.map((s, i) => (
                  <li key={s.area} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="w-4 shrink-0 pt-0.5 text-xs font-semibold text-white/65 tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Bn className="text-sm font-semibold text-white">{s.areaBn}</Bn>
                        {s.live > 0 ? (
                          <span
                            className={cn(
                              "inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                              s.rising ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white ring-1 ring-white/15",
                            )}
                          >
                            {s.rising ? "Rising · " : ""}
                            {num(s.live)} in the last hour
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/65">
                        {s.district} · <Bn>{DIVISION_BY_ID[s.division].nameBn}</Bn> division
                      </span>
                    </span>
                    {s.window ? (
                      <span className="shrink-0 text-right">
                        <span className="block font-grotesk text-sm font-bold text-white tabular-nums">{hourWindow(s.window.start)}</span>
                        <span className="block text-xs text-white/65 tabular-nums">{num(s.window.count)} in 30 days</span>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>

      <Panel title="Women help desk load" icon="support_agent" sub="Open women and child cases per station, busiest first; each opens the station's CRM">
        <DeskLoad desks={desks} />
      </Panel>

      <Panel
        title="Cases"
        icon="checklist"
        sub="Critical first, then newest. Titles show the complaint type and area only."
        action={
          <div role="group" aria-label="Which cases" className="flex gap-1 rounded-xl bg-black/30 p-1 ring-1 ring-white/12">
            {[
              { on: !showAll, label: "Open", set: false },
              { on: showAll, label: "All", set: true },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                aria-pressed={b.on}
                onClick={() => setShowAll(b.set)}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-lg px-3.5 text-sm font-semibold transition-colors motion-reduce:transition-none lg:min-h-9",
                  focusRing,
                  b.on ? "bg-signal-orange text-text-primary" : "text-white/80 hover:bg-white/8",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        }
      >
        <CaseTable
          key={showAll ? "all" : "open"}
          cases={table}
          onOpen={setSelected}
          columns={["id", "category", "place", "severity", "status", "unit", "age"]}
          caption="Women and child cases"
          empty={showAll ? "No women and child cases in this scope." : "No open women and child cases. New ones will appear here."}
        />
      </Panel>

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="map" className="text-[16px]" />
        Case positions are shifted 120 to 300 m for privacy; hotspots mark areas. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/** What the server and the first paint show before the world is read. */
export function WomenSafetyFallback() {
  return (
    <CommandPage title="Women safety" subtitle="Loading the women safety desk…">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-2xl lg:h-[34rem]" />
        <Skeleton className="hidden h-96 rounded-2xl lg:block lg:h-[34rem]" />
      </div>
    </CommandPage>
  );
}
