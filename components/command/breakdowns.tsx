"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_META } from "@/lib/command/routing";
import { byCategory, byDivision, isOpen } from "@/lib/command/selectors";
import { perWorld, useCommand } from "@/lib/command/store";
import type { Dept, DivisionId, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { DIVISIONS, Panel, Skeleton, num } from "./kit";

/**
 * Open cases by category and by division, as two ranked bar lists. One
 * series each, so one hue (navy tint) and no legend; the value sits at the
 * bar's tip in text colour, with the share of all open cases beside it.
 * Categories beyond the top seven fold into one "অন্যান্য ধরন" bar only
 * while that bar is no longer than the shortest one shown; otherwise they
 * are a text line under the bars, so the ranking never reads wrong.
 */

interface Row {
  key: string;
  bn: string;
  en: string;
  icon?: string;
  count: number;
}

const TOP = 7;

function openOnly(w: World): World {
  return { ...w, cases: w.cases.filter(isOpen) };
}

interface Ranked {
  rows: Row[];
  /** Categories left out of the bars, given as a text line (their total outgrew the shortest bar shown). */
  more?: { categories: number; cases: number };
}

function categoryRows(w: World, dept?: Dept): Ranked {
  const all = byCategory(openOnly(w), dept).map(({ key, count }) => ({
    key,
    bn: CATEGORY_META[key].labelBn,
    en: CATEGORY_META[key].label,
    icon: CATEGORY_META[key].icon,
    count,
  }));
  if (all.length <= TOP + 1) return { rows: all };
  const shown = all.slice(0, TOP);
  const rest = all.slice(TOP);
  const cases = rest.reduce((s, r) => s + r.count, 0);
  // A folded bar may never outrank the rows above it; otherwise the remainder is a text line.
  if (cases <= shown[shown.length - 1].count) {
    return { rows: [...shown, { key: "rest", bn: "অন্যান্য ধরন", en: `${rest.length} more categories`, icon: "more_horiz", count: cases }] };
  }
  return { rows: shown, more: { categories: rest.length, cases } };
}

function divisionRows(w: World, dept?: Dept): Ranked {
  const counts = new Map(byDivision(openOnly(w), dept).map((r) => [r.key, r.count]));
  return {
    rows: (Object.keys(DIVISIONS) as DivisionId[])
      .map((d) => ({ key: d, bn: DIVISIONS[d].labelBn, en: DIVISIONS[d].label, count: counts.get(d) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.en.localeCompare(b.en)),
  };
}

function Bars({ data, label }: { data: Ranked | null; label: string }) {
  if (data === null) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </div>
    );
  }
  const { rows, more } = data;
  const total = rows.reduce((s, r) => s + r.count, 0) + (more?.cases ?? 0);
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (total === 0) return <p className="py-6 text-center text-sm text-white/60">No open cases right now.</p>;
  return (
    <ul aria-label={label} className="flex flex-col">
      {rows.map((r) => {
        const share = Math.round((r.count / total) * 100);
        return (
          <li
            key={r.key}
            className="grid grid-cols-[minmax(7.5rem,10rem)_minmax(0,1fr)] items-center gap-3 rounded-lg py-1.5 sm:grid-cols-[minmax(9rem,12rem)_minmax(0,1fr)]"
          >
            <span className="sr-only">
              {r.en}: {r.count} open, {share}%
            </span>
            <span className="flex min-w-0 items-center gap-2" aria-hidden="true">
              {r.icon ? <Icon name={r.icon} className="shrink-0 text-[16px] text-white/45" /> : null}
              <span className="flex min-w-0 flex-col leading-tight">
                <span lang="bn" className="truncate font-bengali text-sm font-semibold text-white">
                  {r.bn}
                </span>
                <span className="truncate text-xs text-white/50">{r.en}</span>
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2.5" aria-hidden="true">
              <span
                className={cn("h-3 shrink-0 rounded-r-[4px] bg-bdnavy-300 transition-[width] duration-200 ease-out motion-reduce:transition-none", r.key === "rest" && "bg-bdnavy-300/45", r.count === 0 && "w-0")}
                style={r.count ? { width: `max(4px, calc((100% - 5.5rem) * ${r.count / max}))` } : undefined}
              />
              <span className="shrink-0 font-grotesk text-sm font-bold text-white tabular-nums">{num(r.count)}</span>
              <span className="shrink-0 text-xs text-white/50 tabular-nums">{share}%</span>
            </span>
          </li>
        );
      })}
      {more ? (
        <li className="mt-1 border-t border-white/10 pt-2.5 text-xs text-white/60 tabular-nums">
          + {num(more.categories)} more categories · {num(more.cases)} {more.cases === 1 ? "case" : "cases"} ({Math.round((more.cases / total) * 100)}%)
        </li>
      ) : null}
    </ul>
  );
}

export function Breakdowns({ dept, className }: { dept?: Dept; className?: string }) {
  const selCat = useMemo(() => perWorld((w) => categoryRows(w, dept)), [dept]);
  const selDiv = useMemo(() => perWorld((w) => divisionRows(w, dept)), [dept]);
  const cats = useCommand(selCat);
  const divs = useCommand(selDiv);
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      <Panel title="Open by category" icon="category" sub="Share of all open cases">
        <Bars data={cats} label="Open cases by category" />
      </Panel>
      <Panel title="Open by division" icon="map" sub="All eight divisions, busiest first">
        <Bars data={divs} label="Open cases by division" />
      </Panel>
    </div>
  );
}
