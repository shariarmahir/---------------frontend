"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_META } from "@/lib/command/routing";
import { isOpen } from "@/lib/command/selectors";
import { perWorld, useCommand } from "@/lib/command/store";
import type { Case, Unit, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Bn, CategoryChip, EmptyState, OverduePill, SeverityPill, Skeleton, StatusPill, cb, focusRing, num, timeAgo } from "./kit";

/**
 * A page of cases (25 rows) as an accessible table from md, and as a list of
 * buttons on phones. Rows keep the order they are given. A row click or the
 * id button opens the case.
 */

export type CaseColumn = "id" | "category" | "place" | "severity" | "status" | "unit" | "age" | "home" | "agency";

const DEFAULT_COLUMNS: CaseColumn[] = ["id", "category", "place", "severity", "status", "unit", "age"];
const PAGE = 25;

const HEAD: Record<CaseColumn, string> = {
  id: "Case",
  category: "Complaint",
  place: "Place",
  severity: "Severity",
  status: "Status",
  unit: "Unit",
  age: "Reported",
  home: "Station / office",
  agency: "Agency",
};

const selectNow = (w: World) => w.now;
const selectUnitIndex = perWorld((w) => new Map(w.units.map((u) => [u.id, u])));

export function CaseTable({
  cases,
  onOpen,
  columns = DEFAULT_COLUMNS,
  empty = "No cases match.",
  caption = "Cases",
  className,
}: {
  /** null while the world loads (skeleton rows). */
  cases: Case[] | null;
  onOpen(id: string): void;
  columns?: CaseColumn[];
  empty?: string;
  caption?: string;
  className?: string;
}) {
  const [page, setPage] = useState(0);
  const now = useCommand(selectNow);
  const units = useCommand(selectUnitIndex);
  const total = cases?.length ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const p = Math.min(page, pages - 1);
  const rows = useMemo(() => (cases ?? []).slice(p * PAGE, p * PAGE + PAGE), [cases, p]);

  if (cases === null || now === null || units === null) {
    return (
      <div aria-hidden="true" className={cn("flex flex-col gap-2", className)}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (total === 0) return <EmptyState icon="task_alt" title={empty} className={className} />;

  const cell = (c: Case, col: CaseColumn) => {
    switch (col) {
      case "id":
        return (
          <button
            type="button"
            data-case-open={c.id}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(c.id);
            }}
            className={cn("inline-flex min-h-11 items-center rounded-md font-mono text-xs font-semibold whitespace-nowrap text-white underline-offset-4 hover:text-signal-orange hover:underline lg:min-h-0", focusRing)}
          >
            <span className="sr-only">Open case </span>
            {c.id}
          </button>
        );
      case "category":
        return (
          <span className="flex min-w-0 flex-col gap-0.5">
            <CategoryChip category={c.category} />
            <span lang="bn" className="block max-w-[28ch] truncate font-bengali text-xs text-white/60">
              {c.titleBn}
            </span>
          </span>
        );
      case "place":
        return (
          <span className="flex min-w-0 flex-col">
            <Bn className="truncate text-sm text-white">{c.place.areaBn}</Bn>
            <span className="text-xs text-white/55">{c.place.district}</span>
          </span>
        );
      case "severity":
        return <SeverityPill severity={c.severity} />;
      case "status":
        return (
          <span className="flex flex-wrap gap-1">
            <StatusPill status={c.status} />
            {c.overdue && isOpen(c) ? <OverduePill /> : null}
          </span>
        );
      case "unit":
        return <UnitCell c={c} units={units} />;
      case "age":
        return <span className="text-sm whitespace-nowrap text-white/75 tabular-nums">{timeAgo(c.reportedAt, now)}</span>;
      case "home":
        return <span className="text-sm text-white/80">{(c.homeId && units.get(c.homeId)?.name) || "—"}</span>;
      case "agency":
        return <span className="text-sm text-white/80">{c.agency ?? CATEGORY_META[c.category].agency ?? "—"}</span>;
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* md and up: a table. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {caption}, {num(total)} in all, page {p + 1} of {pages}
          </caption>
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th key={col} scope="col" className="px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-white/55 first:pl-0">
                  {HEAD[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="cursor-pointer border-b border-white/6 align-middle transition-colors last:border-b-0 hover:bg-white/5"
              >
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2.5 first:pl-0">
                    {cell(c, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: one button per case. */}
      <ul aria-label={caption} className="flex flex-col divide-y divide-white/8 md:hidden">
        {rows.map((c) => (
          <li key={c.id}>
            <button type="button" data-case-open={c.id} onClick={() => onOpen(c.id)} className={cn("flex w-full flex-col gap-2 rounded-lg py-3 text-left", focusRing)}>
              <span className="flex items-center gap-2">
                <CategoryChip category={c.category} className="flex-1" />
                <span className="text-xs text-white/55 tabular-nums">{timeAgo(c.reportedAt, now)}</span>
              </span>
              <span lang="bn" className="font-bengali text-sm leading-snug text-white">
                {c.titleBn}
              </span>
              <span className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
                <span className="font-mono text-white/75">{c.id}</span>
                <span aria-hidden="true">·</span>
                <Bn>{c.place.areaBn}</Bn>
                <span className="ml-auto flex flex-wrap justify-end gap-1">
                  {c.severity === "critical" ? <SeverityPill severity="critical" /> : null}
                  {c.overdue && isOpen(c) ? <OverduePill /> : null}
                  <StatusPill status={c.status} />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {pages > 1 ? (
        <nav aria-label={`${caption} pages`} className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <p className="text-xs text-white/60 tabular-nums">
            {num(p * PAGE + 1)}–{num(Math.min(total, p * PAGE + PAGE))} of {num(total)}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={p === 0} onClick={() => setPage(p - 1)} aria-label="Previous page" className={cb.quietSm}>
              <Icon name="chevron_left" className="text-[18px]" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button type="button" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} aria-label="Next page" className={cb.quietSm}>
              <span className="hidden sm:inline">Next</span>
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </nav>
      ) : (
        <p className="text-xs text-white/50 tabular-nums">{num(total)} {total === 1 ? "case" : "cases"}</p>
      )}
    </div>
  );
}

function UnitCell({ c, units }: { c: Case; units: Map<string, Unit> }) {
  const unit = c.assignedUnitId ? units.get(c.assignedUnitId) : undefined;
  if (!unit) {
    const alerted = c.alerts.find((a) => a.outcome === "pending");
    const name = alerted ? units.get(alerted.unitId)?.name : undefined;
    return name ? (
      <span className="block max-w-[22ch] truncate text-sm text-white/60">Alerted: {name}</span>
    ) : (
      <span className="text-sm text-white/45">—</span>
    );
  }
  return (
    <span className="flex min-w-0 flex-col">
      <span className="max-w-[22ch] truncate text-sm text-white">{unit.name}</span>
      <span className="text-xs text-white/55 tabular-nums">
        {c.status === "on-scene" ? "On scene" : c.etaMin !== undefined && c.status === "en-route" ? `ETA ${c.etaMin} min` : c.distanceKm !== undefined ? `${c.distanceKm.toFixed(1)} km` : ""}
      </span>
    </span>
  );
}
