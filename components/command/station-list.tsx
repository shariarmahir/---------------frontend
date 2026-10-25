"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { STATIONS } from "@/data/command/stations";
import { isOpen, stationStats } from "@/lib/command/selectors";
import { perWorld, useCommand } from "@/lib/command/store";
import type { Unit, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { Bn, EmptyState, Kpi, Panel, SearchField, Skeleton, cb, focusRing, formatMin, num } from "./kit";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";

/**
 * /protibad/command/police/stations: every police station with its open and
 * closed cases, median first response and free patrols; each links to its
 * CRM page. The map shows the stations and the open police cases. Uses
 * useSearchParams (the case drawer): render it inside <Suspense>.
 */

interface Row {
  station: Unit;
  open: number;
  closed: number;
  median: number | null;
  free: number;
  patrols: number;
}

const selectRows = perWorld((w: World): Row[] =>
  STATIONS.map((station) => {
    const s = stationStats(w, station.id);
    return {
      station,
      open: s.open,
      closed: s.closed,
      median: s.medianFirstResponseMin,
      free: s.patrols.filter((p) => p.status === "available").length,
      patrols: s.patrols.length,
    };
  }),
);
const selectOpenPolice = perWorld((w: World) => w.cases.filter((c) => c.dept === "police" && isOpen(c)));
const selectStations = perWorld((w: World) => w.units.filter((u) => u.kind === "station"));

type SortKey = "name" | "open" | "closed" | "median" | "free";
const COLUMNS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "name", label: "Station", numeric: false },
  { key: "open", label: "Open", numeric: true },
  { key: "closed", label: "Closed", numeric: true },
  { key: "median", label: "Median first response", numeric: true },
  { key: "free", label: "Patrols free", numeric: true },
];

function compare(key: SortKey, a: Row, b: Row): number {
  switch (key) {
    case "name":
      return a.station.name.localeCompare(b.station.name);
    case "open":
      return a.open - b.open;
    case "closed":
      return a.closed - b.closed;
    case "free":
      return a.free - b.free;
    case "median":
      return (a.median ?? 0) - (b.median ?? 0);
  }
}

const shortName = (s: Unit) => s.name.replace(/ Police Station$/, "");

export function StationList() {
  const [selected, setSelected] = useSelectedCase();
  const rows = useCommand(selectRows);
  const open = useCommand(selectOpenPolice);
  const stations = useCommand(selectStations);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "open", dir: "desc" });

  const shown = useMemo(() => {
    if (!rows) return null;
    const needle = q.trim().toLowerCase();
    const list = needle ? rows.filter((r) => r.station.name.toLowerCase().includes(needle) || r.station.nameBn.includes(needle)) : rows.slice();
    const sign = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      // A station with no response time yet sorts last, whichever way the list runs.
      if (sort.key === "median" && (a.median === null) !== (b.median === null)) return a.median === null ? 1 : -1;
      return sign * compare(sort.key, a, b) || b.open - a.open || a.station.name.localeCompare(b.station.name);
    });
  }, [rows, q, sort]);

  const totals = useMemo(() => {
    if (!rows) return null;
    let openN = 0;
    let closedN = 0;
    let free = 0;
    let patrols = 0;
    let busiest: Row | null = null;
    for (const r of rows) {
      openN += r.open;
      closedN += r.closed;
      free += r.free;
      patrols += r.patrols;
      if (r.open > 0 && (!busiest || r.open > busiest.open)) busiest = r;
    }
    return { openN, closedN, free, patrols, busiest };
  }, [rows]);
  const maxOpen = Math.max(1, ...(rows ?? []).map((r) => r.open));

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" || key === "median" ? "asc" : "desc" }));

  return (
    <CommandPage
      title="Police stations"
      subtitle={
        <>
          Each station keeps its own case file, patrols and follow-ups. Choose one to open its CRM. Station names are real thanas at <strong className="font-semibold text-white/90">approximate</strong> positions.
        </>
      }
      actions={
        <Link href="/protibad/command/police" className={cb.outline}>
          <Icon name="local_police" className="text-[18px]" />
          Police desk
        </Link>
      }
    >
      <section aria-label="Key figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 sm:grid-cols-4 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+2)]:border-b max-sm:[&>div:nth-child(odd)]:border-r sm:[&>div:not(:last-child)]:border-r">
          <Kpi label="Stations" icon="location_city" value={totals ? num(STATIONS.length) : <Skeleton className="h-7 w-14" />} sub={totals ? "Thanas on the board" : null} />
          <Kpi label="Open cases" icon="folder_open" value={totals ? num(totals.openN) : <Skeleton className="h-7 w-14" />} sub={totals ? `${num(totals.closedN)} closed` : null} />
          <Kpi
            label="Busiest station"
            icon="trending_up"
            value={totals ? totals.busiest ? <span className="block truncate text-2xl">{shortName(totals.busiest.station)}</span> : "—" : <Skeleton className="h-7 w-24" />}
            sub={totals?.busiest ? `${num(totals.busiest.open)} open` : null}
          />
          <Kpi label="Patrols free" icon="directions_car" value={totals ? `${num(totals.free)} of ${num(totals.patrols)}` : <Skeleton className="h-7 w-20" />} sub={totals ? "Ready to be sent" : null} />
        </dl>
      </section>

      <Panel title="Station map" icon="public" sub="Approximate location. Stations and open police cases; positions are not exact." bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0">
        <MapView
          className="h-72 border-t border-white/10 sm:h-96 lg:h-[26rem]"
          cases={open ?? []}
          units={stations ?? []}
          selectedId={selected ?? undefined}
          onSelect={setSelected}
          focus={selected ? "selection" : "country"}
          showUnits={["station"]}
        />
      </Panel>

      <Panel
        id="station-table"
        title="All stations"
        icon="list_alt"
        sub="Sort by any column. The busiest stations come first."
        action={shown ? <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(shown.length)} shown</span> : null}
      >
        <SearchField label="Find a station" value={q} onChange={setQ} placeholder="Name in English or Bangla" className="mb-4 sm:max-w-sm" />
        {shown === null ? (
          <div aria-hidden="true" className="flex flex-col gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon="search_off" title="No station matches">
            Try another spelling, or clear the search.
          </EmptyState>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Police stations, {num(shown.length)} shown, sorted by {COLUMNS.find((c) => c.key === sort.key)?.label}
                </caption>
                <thead>
                  <tr className="border-b border-white/10">
                    {COLUMNS.map((c) => {
                      const on = sort.key === c.key;
                      return (
                        <th
                          key={c.key}
                          scope="col"
                          aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                          className={cn("px-3 py-1.5 first:pl-0", c.numeric && "text-right")}
                        >
                          <button
                            type="button"
                            onClick={() => toggle(c.key)}
                            className={cn(
                              "inline-flex min-h-9 items-center gap-1 rounded-md text-xs font-semibold whitespace-nowrap hover:text-white",
                              focusRing,
                              on ? "text-signal-orange" : "text-white/55",
                              c.numeric && "flex-row-reverse",
                            )}
                          >
                            <span aria-hidden="true" className="inline-flex">
                              <Icon name={on ? (sort.dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"} className="text-[14px]" />
                            </span>
                            {c.label}
                          </button>
                        </th>
                      );
                    })}
                    <th scope="col" className="w-10 px-3 py-2.5">
                      <span className="sr-only">Open the station</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.station.id} className="group border-b border-white/6 last:border-b-0 hover:bg-white/5">
                      <td className="py-2.5 pr-3">
                        <Link href={`/protibad/command/police/stations/${r.station.id}`} className={cn("flex flex-col rounded-md", focusRing)}>
                          <span className="font-grotesk text-sm font-bold text-white group-hover:text-signal-orange">{shortName(r.station)}</span>
                          <Bn className="text-xs text-white/60">{r.station.nameBn}</Bn>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="inline-flex items-center justify-end gap-2.5">
                          <span aria-hidden="true" className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/8 xl:block">
                            <span className="block h-full rounded-full bg-bdnavy-300" style={{ width: `${(r.open / maxOpen) * 100}%` }} />
                          </span>
                          <span className="text-sm font-semibold text-white tabular-nums">{num(r.open)}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-white/75 tabular-nums">{num(r.closed)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-white/75 tabular-nums">{formatMin(r.median)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-white/75 tabular-nums">
                        <span className={cn(r.patrols > 0 && r.free === 0 && "font-semibold text-white")}>{num(r.free)}</span>
                        <span className="text-white/45"> of {num(r.patrols)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span aria-hidden="true" className="inline-flex text-white/45 group-hover:text-signal-orange">
                          <Icon name="chevron_right" className="text-[20px]" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul aria-label="Police stations" className="flex flex-col gap-2 md:hidden">
              {shown.map((r) => (
                <li key={r.station.id}>
                  <Link
                    href={`/protibad/command/police/stations/${r.station.id}`}
                    className={cn("flex min-h-11 flex-col gap-2.5 rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10 hover:bg-white/6", focusRing)}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-grotesk text-sm font-bold text-white">{shortName(r.station)}</span>
                        <Bn className="truncate text-xs text-white/60">{r.station.nameBn}</Bn>
                      </span>
                      <span aria-hidden="true" className="inline-flex text-white/45">
                        <Icon name="chevron_right" className="text-[20px]" />
                      </span>
                    </span>
                    <span className="grid grid-cols-4 gap-2 text-xs text-white/60 tabular-nums">
                      <span className="flex flex-col">
                        <span>Open</span>
                        <span className="text-sm font-semibold text-white">{num(r.open)}</span>
                      </span>
                      <span className="flex flex-col">
                        <span>Closed</span>
                        <span className="text-sm font-semibold text-white/80">{num(r.closed)}</span>
                      </span>
                      <span className="flex flex-col">
                        <span>Response</span>
                        <span className="text-sm font-semibold text-white/80">{formatMin(r.median)}</span>
                      </span>
                      <span className="flex flex-col">
                        <span>Patrols free</span>
                        <span className="text-sm font-semibold text-white/80">
                          {num(r.free)}/{num(r.patrols)}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <p className="flex items-center gap-2 text-xs text-white/50">
        <Icon name="map" className="text-[16px]" />
        Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

export function StationListFallback() {
  return (
    <CommandPage title="Police stations" subtitle="Loading the stations…">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </CommandPage>
  );
}
