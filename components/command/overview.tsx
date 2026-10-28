"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIVISION_BY_ID } from "@/data/command/divisions";
import type { DivisionThreat } from "@/lib/command/intel";
import { pendingAlerts, unitsInDivision } from "@/lib/command/selectors";
import { perDivision, selectDivisionThreat, selectOpenIn, selectUnitsIn, useCommand } from "@/lib/command/store";
import { cn } from "@/lib/utils";
import { AlertFeed } from "./alert-feed";
import { Breakdowns, selectOpenCounts } from "./breakdowns";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable } from "./case-table";
import { DivisionPicker, divisionFocus, useDivision, type DivisionScope } from "./division-picker";
import { Bn, Eased, Panel, Skeleton, ThreatPill, cb, focusRing, num } from "./kit";
import { ScrollCue } from "./scroll-cue";
import { KpiRow } from "./kpi-row";
import { LiveTicker } from "./live-ticker";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";
import { useWide } from "./use-wide";

/**
 * /protibad/command: both departments at once. The division picker (?div=,
 * All Bangladesh by default) scopes everything under it; then the KPI strip,
 * the live event strip, the live map beside the alert feed, each division's
 * situation (a tile per division that also sets the scope), open cases by
 * category and by division (by area inside one), and every open case in a
 * table (the map is supplementary). Any case opens the drawer, kept in ?case=
 * so it can be shared. Uses useSearchParams: render it inside <Suspense>.
 */

const selectSummaryIn = perDivision((w, d) => {
  let patrols = 0;
  let teams = 0;
  for (const u of unitsInDivision(w, d)) {
    if (u.status === "off-duty") continue;
    if (u.kind === "patrol") patrols++;
    if (u.kind === "team") teams++;
  }
  return { patrols, teams };
});
const selectPendingCountIn = perDivision((w, d) => pendingAlerts(w, "police", d).length + pendingAlerts(w, "consumer", d).length);

const LEGEND: { label: string; swatch: string }[] = [
  { label: "Police case", swatch: "size-3 rounded-full bg-signal-orange ring-2 ring-black outline outline-1 outline-white/30" },
  { label: "Consumer case", swatch: "size-3 rounded-full bg-cobalt ring-2 ring-white" },
  { label: "Other agency", swatch: "size-3 rounded-full bg-bdnavy-300 ring-2 ring-black outline outline-1 outline-white/30" },
  { label: "Critical or overdue", swatch: "size-3 rounded-full bg-national-crimson ring-2 ring-white outline-2 outline-offset-2 outline-national-crimson" },
  { label: "Police station", swatch: "size-3 rounded-sm bg-signal-orange" },
  { label: "Patrol", swatch: "size-2 rounded-full bg-bdnavy-300" },
  { label: "District office", swatch: "size-3 rounded-sm bg-cobalt ring-2 ring-white" },
];

const DESK_FEED = 14;
const PHONE_FEED = 5;

export function Overview() {
  const [selected, setSelected] = useSelectedCase();
  const [div, setDiv] = useDivision();
  const wide = useWide();
  const [allAlerts, setAllAlerts] = useState(false);
  const feedLimit = wide ? DESK_FEED : allAlerts ? 500 : PHONE_FEED;
  // Open cases in the scope, critical first then newest: the map, the table and the feed footer share it.
  const open = useCommand(selectOpenIn(div));
  const units = useCommand(selectUnitsIn(div));
  const summary = useCommand(selectSummaryIn(div));
  const pending = useCommand(selectPendingCountIn(div));
  const counts = useCommand(selectOpenCounts.all);
  // A case outside the scope, or closed, is not on the map: frame the division rather than an absent case.
  const onMap = selected !== null && (open?.some((c) => c.id === selected) ?? false);
  const where = div === "all" ? null : DIVISION_BY_ID[div];

  return (
    <CommandPage
      title="Overview"
      subtitle={
        <>
          Police and <Bn>ভোক্তা অধিদপ্তর</Bn> on one board, live. A complaint goes first to the nearest unit and moves on if nobody answers; it stays a task until it is closed.
        </>
      }
    >
      <DivisionPicker counts={counts ?? undefined} countLabel="open cases" />

      <KpiRow div={div} />

      <LiveTicker div={div} onOpen={setSelected} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Panel
          title={where ? <>Live map · <Bn>{where.nameBn}</Bn></> : "Live map"}
          icon="public"
          sub={
            open && summary ? (
              <span className="tabular-nums">
                {num(open.length)} open incidents · {num(summary.patrols)} patrols and {num(summary.teams)} inspection teams on duty · positions approximate
              </span>
            ) : (
              <Skeleton className="h-3 w-56" />
            )
          }
          bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
        >
          <MapView
            className="h-80 border-y border-white/10 sm:h-[26rem] lg:h-auto lg:min-h-[32rem] lg:flex-1"
            cases={open ?? []}
            units={units ?? []}
            selectedId={onMap ? (selected ?? undefined) : undefined}
            onSelect={setSelected}
            focus={onMap ? "selection" : divisionFocus(div)}
            sos
          />
          <ul aria-label="Map legend" className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
            {LEGEND.map((l) => (
              <li key={l.label} className="flex items-center gap-2 text-xs text-white/70">
                <span aria-hidden="true" className="grid size-4 place-items-center">
                  <span className={cn("block", l.swatch)} />
                </span>
                {l.label}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Live alerts"
          icon="notifications_active"
          sub="Soonest to escalate first, then newest"
          action={
            pending !== null ? (
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(pending)} waiting</span>
            ) : null
          }
          className="lg:h-0 lg:min-h-full"
          bodyClassName="flex min-h-0 flex-col px-2 sm:px-2.5"
        >
          <ScrollCue className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            <AlertFeed div={div} onOpen={setSelected} limit={feedLimit} />
          </ScrollCue>
          {open ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1.5 pt-3 text-xs text-white/65 tabular-nums">
              <span>
                Showing {num(Math.min(feedLimit, open.length))} of {num(open.length)} open
              </span>
              {wide ? (
                <a href="#open-cases" className={cn("rounded-md px-1 font-semibold text-white/85 underline-offset-4 hover:text-signal-orange hover:underline", focusRing)}>
                  All open cases
                </a>
              ) : open.length > PHONE_FEED ? (
                <button type="button" aria-expanded={allAlerts} onClick={() => setAllAlerts((v) => !v)} className={cb.quietSm}>
                  {allAlerts ? "Show fewer" : `Show all ${num(open.length)}`}
                </button>
              ) : null}
            </div>
          ) : null}
        </Panel>
      </div>

      <DivisionSituation div={div} onChoose={setDiv} />

      <Breakdowns div={div} />

      <Panel
        id="open-cases"
        title={where ? <>Open cases · <Bn>{where.nameBn}</Bn></> : "Open cases"}
        icon="list_alt"
        sub="Critical first, then newest. Select a case to work it."
      >
        <CaseTable
          key={div}
          cases={open}
          onOpen={setSelected}
          caption={where ? `Open cases, ${where.name} division` : "Open cases"}
          empty={where ? "No open cases in this division. New complaints will appear here." : "No open cases. New complaints will appear here."}
        />
      </Panel>

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="map" className="text-[16px]" />
        Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/* ───────────── division situation ───────────── */

/**
 * One tile per division from intel's divisionThreat: the level (red only for
 * critical), open police cases, critical ones and SOS presses still waiting.
 * A tile is a toggle for the page's scope: choosing the current one again
 * goes back to All Bangladesh.
 */
function DivisionSituation({ div, onChoose }: { div: DivisionScope; onChoose(div: DivisionScope): void }) {
  const threat = useCommand(selectDivisionThreat);
  return (
    <Panel
      id="division-situation"
      title="Division situation"
      icon="radar"
      sub="Open police cases, critical ones and SOS presses waiting, scored against each division's usual load at this hour. Choose a division to scope the board."
    >
      {threat === null ? (
        <div aria-hidden="true" className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-8">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <ul aria-label="Divisions" className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-8">
          {threat.map((t) => (
            <li key={t.division} className="min-w-0">
              <ThreatTile t={t} on={div === t.division} onChoose={() => onChoose(div === t.division ? "all" : t.division)} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ThreatTile({ t, on, onChoose }: { t: DivisionThreat; on: boolean; onChoose(): void }) {
  const d = DIVISION_BY_ID[t.division];
  const figures: { label: string; value: number; urgent?: boolean }[] = [
    { label: "police", value: t.open },
    { label: "critical", value: t.critical },
    { label: "SOS", value: t.sosWaiting, urgent: t.sosWaiting > 0 },
  ];
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onChoose}
      className={cn(
        "flex h-full w-full flex-col gap-2.5 rounded-xl px-3 py-3 text-left transition-[background-color,box-shadow,translate] duration-200 ease-out hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        focusRing,
        on ? "bg-bdnavy-700 ring-2 ring-signal-orange" : "bg-black/30 ring-1 ring-white/10 hover:bg-white/6",
      )}
    >
      {/* The pill wraps under the name in a narrow tile rather than cutting the name short. */}
      <span className="flex min-w-0 flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
        <span className="flex flex-col">
          <Bn className={cn("text-base leading-tight font-bold", on ? "text-signal-orange" : "text-white")}>{d.nameBn}</Bn>
          <span className="text-xs text-white/65">{d.name}</span>
        </span>
        <ThreatPill level={t.level} />
      </span>
      <span className="grid grid-cols-3 gap-1.5">
        {figures.map((f) => (
          <span key={f.label} className="flex min-w-0 flex-col">
            <span className={cn("font-grotesk text-lg leading-none font-bold tabular-nums", f.urgent ? "text-crimson-bright" : "text-white")}>
              <Eased value={num(f.value)} />
            </span>
            <span className="truncate text-xs text-white/65">
              {f.label}
              {f.label === "police" ? <span className="sr-only"> cases open</span> : f.label === "SOS" ? <span className="sr-only"> waiting</span> : null}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

/** What the server and the first paint show before the world is read. */
export function OverviewFallback() {
  return (
    <CommandPage title="Overview" subtitle="Loading the live board…">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Skeleton className="h-96 rounded-2xl lg:h-[40rem]" />
        <Skeleton className="h-96 rounded-2xl lg:h-[40rem]" />
      </div>
    </CommandPage>
  );
}
