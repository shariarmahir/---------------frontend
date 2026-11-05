"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIVISION_BY_ID } from "@/data/command/divisions";
import { unitsInDivision, type StationRow } from "@/lib/command/selectors";
import { perDivision, selectPoliceOpenIn, selectStationRows, useCommand } from "@/lib/command/store";
import type { Unit } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { selectOpenCounts } from "./breakdowns";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { DivisionPicker, DivisionScopeNote, divisionFocus, useDivision } from "./division-picker";
import { Bn, EmptyState, Eased, Kpi, Panel, SearchField, Skeleton, cb, focusRing, formatMin, num } from "./kit";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";
import { ScrollCue } from "./scroll-cue";
import { useSearchBox, useUrlFilters } from "./url-filters";

/**
 * /protibad/command/police/stations: every police station with its open,
 * women and child, and closed cases, median first response and free patrols;
 * each links to its CRM page. The map shows the stations and the open police
 * cases. The division picker (?div=) keeps the page to one division's
 * stations; across the country the table gains a Division column. Uses
 * useSearchParams (the case drawer): render it inside <Suspense>.
 */

const selectStationsIn = perDivision((w, d) => unitsInDivision(w, d, "police").filter((u) => u.kind === "station"));

type SortKey = "name" | "division" | "open" | "women" | "closed" | "median" | "free";
const COLUMNS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "name", label: "Station", numeric: false },
  { key: "division", label: "Division", numeric: false },
  { key: "open", label: "Open", numeric: true },
  { key: "women", label: "Women and child", numeric: true },
  { key: "closed", label: "Closed", numeric: true },
  { key: "median", label: "Median first response", numeric: true },
  { key: "free", label: "Patrols free", numeric: true },
];

function compare(key: SortKey, a: StationRow, b: StationRow): number {
  switch (key) {
    case "name":
      return a.station.name.localeCompare(b.station.name);
    case "division":
      return DIVISION_BY_ID[a.division].name.localeCompare(DIVISION_BY_ID[b.division].name);
    case "open":
      return a.open - b.open;
    case "women":
      return a.womenOpen - b.womenOpen;
    case "closed":
      return a.closed - b.closed;
    case "free":
      return a.patrolsAvailable - b.patrolsAvailable;
    case "median":
      return (a.medianFirstResponseMin ?? 0) - (b.medianFirstResponseMin ?? 0);
  }
}

const shortName = (s: Unit) => s.name.replace(/ Police Station$/, "");

export function StationList() {
  const [selected, setSelected] = useSelectedCase();
  const [div] = useDivision();
  const rows = useCommand(selectStationRows(div));
  const open = useCommand(selectPoliceOpenIn(div));
  const stations = useCommand(selectStationsIn(div));
  const counts = useCommand(selectOpenCounts.police);
  const where = div === "all" ? null : DIVISION_BY_ID[div];
  // One division's stations share it: the column is dropped there.
  const columns = where ? COLUMNS.filter((c) => c.key !== "division") : COLUMNS;
  // A closed case opened from a table is not on the map: leave the map unframed rather than on its last view.
  const onMap = selected !== null && (open?.some((c) => c.id === selected) ?? false);
  const filters = useUrlFilters();
  const q = filters.params.get("q")?.trim() ?? "";
  const [text, setText] = useSearchBox(q, filters);
  const [chosen, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "open", dir: "desc" });
  // Sorted by Division and then scoped to one (no such column there): busiest first again.
  const sort = useMemo(() => (where && chosen.key === "division" ? { key: "open" as const, dir: "desc" as const } : chosen), [where, chosen]);

  const shown = useMemo(() => {
    if (!rows) return null;
    const needle = q.trim().toLowerCase();
    const list = needle ? rows.filter((r) => r.station.name.toLowerCase().includes(needle) || r.station.nameBn.includes(needle)) : rows.slice();
    const sign = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      // A station with no response time yet sorts last, whichever way the list runs.
      if (sort.key === "median" && (a.medianFirstResponseMin === null) !== (b.medianFirstResponseMin === null)) return a.medianFirstResponseMin === null ? 1 : -1;
      return sign * compare(sort.key, a, b) || b.open - a.open || a.station.name.localeCompare(b.station.name);
    });
  }, [rows, q, sort]);

  const totals = useMemo(() => {
    if (!rows) return null;
    let openN = 0;
    let closedN = 0;
    let womenN = 0;
    let free = 0;
    let patrols = 0;
    let busiest: StationRow | null = null;
    for (const r of rows) {
      openN += r.open;
      closedN += r.closed;
      womenN += r.womenOpen;
      free += r.patrolsAvailable;
      patrols += r.patrols.length;
      if (r.open > 0 && (!busiest || r.open > busiest.open)) busiest = r;
    }
    return { openN, closedN, womenN, free, patrols, busiest };
  }, [rows]);
  const maxOpen = Math.max(1, ...(rows ?? []).map((r) => r.open));

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" || key === "division" || key === "median" ? "asc" : "desc" }));

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
      <DivisionPicker counts={counts ?? undefined} countLabel="open police cases" />

      <section aria-label={where ? `Key figures, ${where.name} division` : "Key figures"} className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 sm:grid-cols-4 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+2)]:border-b max-sm:[&>div:nth-child(odd)]:border-r sm:[&>div:not(:last-child)]:border-r">
          <Kpi
            label="Stations"
            icon="location_city"
            value={totals && rows ? <Eased value={num(rows.length)} /> : <Skeleton className="h-7 w-14" />}
            sub={totals ? (where ? <>Thanas in <Bn>{where.nameBn}</Bn></> : "Thanas on the board") : null}
          />
          <Kpi
            label="Open cases"
            icon="folder_open"
            value={totals ? <Eased value={num(totals.openN)} /> : <Skeleton className="h-7 w-14" />}
            sub={totals ? `${num(totals.womenN)} women and child · ${num(totals.closedN)} closed` : null}
          />
          <Kpi
            label="Busiest station"
            icon="trending_up"
            value={totals ? totals.busiest ? <span className="block truncate text-2xl">{shortName(totals.busiest.station)}</span> : "—" : <Skeleton className="h-7 w-24" />}
            sub={totals?.busiest ? `${num(totals.busiest.open)} open` : null}
          />
          <Kpi
            label="Patrols free"
            icon="directions_car"
            value={totals ? <Eased value={`${num(totals.free)} of ${num(totals.patrols)}`} /> : <Skeleton className="h-7 w-20" />}
            sub={totals ? "Ready to be sent" : null}
          />
        </dl>
      </section>

      <Panel
        title={where ? <>Station map · <Bn>{where.nameBn}</Bn></> : "Station map"}
        icon="public"
        sub="Approximate location. Stations and open police cases; positions are not exact."
        bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
      >
        <MapView
          className="h-72 border-t border-white/10 sm:h-96 lg:h-[26rem]"
          cases={open ?? []}
          units={stations ?? []}
          selectedId={onMap ? (selected ?? undefined) : undefined}
          onSelect={setSelected}
          focus={onMap ? "selection" : divisionFocus(div)}
          showUnits={["station"]}
        />
      </Panel>

      <Panel
        id="station-table"
        title={where ? <>Stations in <Bn>{where.nameBn}</Bn></> : "All stations"}
        icon="list_alt"
        sub="Sort by any column. The busiest stations come first."
        action={shown ? <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(shown.length)} shown</span> : null}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SearchField label="Find a station" value={text} onChange={setText} placeholder="Name in English or Bangla" className="sm:w-full sm:max-w-sm" />
          <DivisionScopeNote div={div} className="sm:pb-3">
            {rows ? `${num(rows.length)} ${rows.length === 1 ? "station" : "stations"}` : null}
          </DivisionScopeNote>
        </div>
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
            <ScrollCue axis="x" className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Police stations{where ? ` in ${where.name} division` : ""}, {num(shown.length)} shown, sorted by {COLUMNS.find((c) => c.key === sort.key)?.label}
                </caption>
                <thead>
                  <tr className="border-b border-white/10">
                    {columns.map((c) => {
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
                              "inline-flex min-h-11 items-center gap-1 rounded-md text-xs font-semibold lg:min-h-9 whitespace-nowrap hover:text-white",
                              focusRing,
                              on ? "text-signal-orange" : "text-white/65",
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
                        <Link href={`/protibad/command/police/stations/${r.station.id}`} className={cn("flex min-h-11 flex-col justify-center rounded-md lg:min-h-0", focusRing)}>
                          <span className="font-grotesk text-sm font-bold text-white group-hover:text-signal-orange">{shortName(r.station)}</span>
                          <Bn className="text-xs text-white/65">{r.station.nameBn}</Bn>
                        </Link>
                      </td>
                      {where ? null : (
                        <td className="px-3 py-2.5">
                          <span className="flex flex-col">
                            <Bn className="text-sm text-white">{DIVISION_BY_ID[r.division].nameBn}</Bn>
                            <span className="text-xs text-white/65">{DIVISION_BY_ID[r.division].name}</span>
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-right">
                        <span className="inline-flex items-center justify-end gap-2.5">
                          <span aria-hidden="true" className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/8 xl:block">
                            <span className="block h-full rounded-full bg-bdnavy-300" style={{ width: `${(r.open / maxOpen) * 100}%` }} />
                          </span>
                          <span className="text-sm font-semibold text-white tabular-nums">{num(r.open)}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                        <span className={r.womenOpen > 0 ? "font-semibold text-white" : "text-white/65"}>{num(r.womenOpen)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-white/75 tabular-nums">{num(r.closed)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-white/75 tabular-nums">{formatMin(r.medianFirstResponseMin)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-white/75 tabular-nums">
                        <span className={cn(r.patrols.length > 0 && r.patrolsAvailable === 0 && "font-semibold text-white")}>{num(r.patrolsAvailable)}</span>
                        <span className="text-white/65"> of {num(r.patrols.length)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span aria-hidden="true" className="inline-flex text-white/65 group-hover:text-signal-orange">
                          <Icon name="chevron_right" className="text-[20px]" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollCue>

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
                        <span className="truncate text-xs text-white/65">
                          <Bn>{r.station.nameBn}</Bn>
                          {where ? null : (
                            <>
                              {" · "}
                              <Bn>{DIVISION_BY_ID[r.division].nameBn}</Bn>
                              <span className="sr-only"> ({DIVISION_BY_ID[r.division].name} division)</span>
                            </>
                          )}
                        </span>
                      </span>
                      <span aria-hidden="true" className="inline-flex text-white/65">
                        <Icon name="chevron_right" className="text-[20px]" />
                      </span>
                    </span>
                    <span className="grid grid-cols-4 gap-2 text-xs text-white/65 tabular-nums">
                      <span className="flex flex-col">
                        <span>Open</span>
                        <span className="text-sm font-semibold text-white">{num(r.open)}</span>
                      </span>
                      <span className="flex flex-col">
                        <span>
                          Women<span className="sr-only"> and child</span>
                        </span>
                        <span className="text-sm font-semibold text-white/80">{num(r.womenOpen)}</span>
                      </span>
                      <span className="flex flex-col">
                        <span>Response</span>
                        <span className="text-sm font-semibold text-white/80">{formatMin(r.medianFirstResponseMin)}</span>
                      </span>
                      <span className="flex flex-col">
                        <span>Patrols free</span>
                        <span className="text-sm font-semibold text-white/80">
                          {num(r.patrolsAvailable)}/{num(r.patrols.length)}
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

      <p className="flex items-center gap-2 text-xs text-white/65">
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
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </CommandPage>
  );
}
