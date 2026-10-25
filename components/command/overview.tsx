"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { filterCases, isOpen, pendingAlerts } from "@/lib/command/selectors";
import { perWorld, useCommand } from "@/lib/command/store";
import type { World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { AlertFeed } from "./alert-feed";
import { Breakdowns } from "./breakdowns";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable } from "./case-table";
import { Bn, Panel, Skeleton, cb, focusRing, num } from "./kit";
import { KpiRow } from "./kpi-row";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";

/**
 * /protibad/command: both departments at once. KPI strip; the live map
 * beside the alert feed; open cases by category and division; every open
 * case in a table (the map is supplementary). Any case opens the drawer,
 * kept in ?case= so it can be shared. Uses useSearchParams: render it
 * inside <Suspense>.
 */

const selectOpen = perWorld((w: World) => w.cases.filter(isOpen));
const selectOpenSorted = perWorld((w: World) => filterCases(w, { status: "open" }));
const selectUnits = (w: World) => w.units;
const selectSummary = perWorld((w: World) => {
  let patrols = 0;
  let teams = 0;
  for (const u of w.units) {
    if (u.status === "off-duty") continue;
    if (u.kind === "patrol") patrols++;
    if (u.kind === "team") teams++;
  }
  return { patrols, teams };
});
const selectPendingCount = perWorld((w: World) => pendingAlerts(w, "police").length + pendingAlerts(w, "consumer").length);

const LEGEND: { label: string; swatch: string }[] = [
  { label: "Police case", swatch: "size-3 rounded-full bg-signal-orange ring-2 ring-black outline outline-1 outline-white/30" },
  { label: "Consumer case", swatch: "size-3 rounded-full bg-cobalt ring-2 ring-white" },
  { label: "Other agency", swatch: "size-3 rounded-full bg-bdnavy-300 ring-2 ring-black outline outline-1 outline-white/30" },
  { label: "Critical or overdue", swatch: "size-3 rounded-full bg-national-crimson ring-2 ring-white outline-2 outline-offset-2 outline-national-crimson" },
  { label: "Police station", swatch: "size-3 rounded-sm bg-signal-orange" },
  { label: "Patrol", swatch: "size-2 rounded-full bg-bdnavy-300" },
  { label: "District office", swatch: "size-3 rounded-sm bg-cobalt ring-2 ring-white" },
];

const WIDE = "(min-width: 64rem)";
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
/** lg and up (the feed sits beside the map there); false on the server. */
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);

const DESK_FEED = 14;
const PHONE_FEED = 5;

export function Overview() {
  const [selected, setSelected] = useSelectedCase();
  const wide = useWide();
  const [allAlerts, setAllAlerts] = useState(false);
  const feedLimit = wide ? DESK_FEED : allAlerts ? 500 : PHONE_FEED;
  const open = useCommand(selectOpen);
  const openSorted = useCommand(selectOpenSorted);
  const units = useCommand(selectUnits);
  const summary = useCommand(selectSummary);
  const pending = useCommand(selectPendingCount);

  return (
    <CommandPage
      title="Overview"
      subtitle={
        <>
          Police and <Bn>ভোক্তা অধিদপ্তর</Bn> on one board, live. A complaint goes first to the nearest unit and moves on if nobody answers; it stays a task until it is closed.
        </>
      }
    >
      <KpiRow />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Panel
          title="Live map"
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
            selectedId={selected ?? undefined}
            onSelect={setSelected}
            focus={selected ? "selection" : "country"}
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
          <AlertFeed onOpen={setSelected} limit={feedLimit} className="flex-1 overflow-y-auto overscroll-contain" />
          {open ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1.5 pt-3 text-xs text-white/60 tabular-nums">
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

      <Breakdowns />

      <Panel id="open-cases" title="Open cases" icon="list_alt" sub="Critical first, then newest. Select a case to work it.">
        <CaseTable cases={openSorted} onOpen={setSelected} caption="Open cases" empty="No open cases. New complaints will appear here." />
      </Panel>

      <p className="flex items-center gap-2 text-xs text-white/50">
        <Icon name="map" className="text-[16px]" />
        Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/** What the server and the first paint show before the world is read. */
export function OverviewFallback() {
  return (
    <CommandPage title="Overview" subtitle="Loading the live board…">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Skeleton className="h-96 rounded-2xl lg:h-[40rem]" />
        <Skeleton className="h-96 rounded-2xl lg:h-[40rem]" />
      </div>
    </CommandPage>
  );
}
