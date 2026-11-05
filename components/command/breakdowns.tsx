"use client";

import { Icon } from "@/components/ui/icon";
import { DIVISION_BY_ID } from "@/data/command/divisions";
import { CATEGORY_META } from "@/lib/command/routing";
import { byCategory, byDivision, isOpen, type DivisionScope } from "@/lib/command/selectors";
import { perDivision, perWorld, useCommand } from "@/lib/command/store";
import type { Dept, DivisionId, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Bn, DIVISIONS, Panel, Skeleton, num } from "./kit";

/**
 * Open cases by category and by division, as two ranked bar lists. One
 * series each, so one hue (navy tint) and no legend; the value sits at the
 * bar's tip in text colour, with the share of all open cases beside it.
 * Categories beyond the top seven fold into one "অন্যান্য ধরন" bar only
 * while that bar is no longer than the shortest one shown; otherwise they
 * are a text line under the bars, so the ranking never reads wrong.
 * With a division (`div`) both lists keep to it, and the second one ranks
 * the division's areas instead of the eight divisions (folded the same way).
 */

interface Row {
  key: string;
  bn: string;
  /** English, or the district for an area. */
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
  /** Rows left out of the bars, given as a text line (their total outgrew the shortest bar shown). */
  more?: { rows: number; cases: number; noun: string };
}

/** The top seven of a ranked list; the rest folded into one bar, or a text line when that bar would outrank one above it. */
function fold(all: Row[], restBn: string, noun: string): Ranked {
  if (all.length <= TOP + 1) return { rows: all };
  const shown = all.slice(0, TOP);
  const rest = all.slice(TOP);
  const cases = rest.reduce((s, r) => s + r.count, 0);
  // A folded bar may never outrank the rows above it; otherwise the remainder is a text line.
  if (cases <= shown[shown.length - 1].count) {
    return { rows: [...shown, { key: "rest", bn: restBn, en: `${rest.length} more ${noun}`, icon: "more_horiz", count: cases }] };
  }
  return { rows: shown, more: { rows: rest.length, cases, noun } };
}

function categoryRows(w: World, dept?: Dept, div?: DivisionScope): Ranked {
  const all = byCategory(openOnly(w), dept, div).map(({ key, count }) => ({
    key,
    bn: CATEGORY_META[key].labelBn,
    en: CATEGORY_META[key].label,
    icon: CATEGORY_META[key].icon,
    count,
  }));
  return fold(all, "অন্যান্য ধরন", "categories");
}

/** Open cases per area of one division, most first (the district beside each). */
function areaRows(w: World, div: DivisionId, dept?: Dept): Ranked {
  const m = new Map<string, Row>();
  for (const c of w.cases) {
    if (!isOpen(c) || c.place.division !== div || (dept && c.dept !== dept)) continue;
    const row = m.get(c.place.areaBn) ?? { key: c.place.areaBn, bn: c.place.areaBn, en: c.place.district, count: 0 };
    row.count++;
    m.set(row.key, row);
  }
  const all = [...m.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  return fold(all, "অন্যান্য এলাকা", "areas");
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
  if (total === 0) return <p className="py-6 text-center text-sm text-white/65">No open cases right now.</p>;
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
              {r.icon ? (
                <span className="inline-flex shrink-0">
                  <Icon name={r.icon} className="text-[16px] text-white/65" />
                </span>
              ) : null}
              <span className="flex min-w-0 flex-col leading-tight">
                <span lang="bn" className="truncate font-bengali text-sm font-semibold text-white">
                  {r.bn}
                </span>
                <span className="truncate text-xs text-white/65">{r.en}</span>
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2.5" aria-hidden="true">
              <span
                className={cn("h-3 shrink-0 rounded-r-[4px] bg-bdnavy-300 transition-[width] duration-200 ease-out motion-reduce:transition-none", r.key === "rest" && "bg-bdnavy-300/45", r.count === 0 && "w-0")}
                style={r.count ? { width: `max(4px, calc((100% - 5.5rem) * ${r.count / max}))` } : undefined}
              />
              <span className="shrink-0 font-grotesk text-sm font-bold text-white tabular-nums">{num(r.count)}</span>
              <span className="shrink-0 text-xs text-white/65 tabular-nums">{share}%</span>
            </span>
          </li>
        );
      })}
      {more ? (
        <li className="mt-1 border-t border-white/10 pt-2.5 text-xs text-white/65 tabular-nums">
          + {num(more.rows)} more {more.noun} · {num(more.cases)} {more.cases === 1 ? "case" : "cases"} ({Math.round((more.cases / total) * 100)}%)
        </li>
      ) : null}
    </ul>
  );
}

/** One selector pair per department (every department under "all"), each memoised per division. */
const selectorsFor = (dept?: Dept) => ({
  cats: perDivision((w, d) => categoryRows(w, dept, d)),
  places: perDivision((w, d) => (d ? areaRows(w, d, dept) : divisionRows(w, dept))),
});
const BY_DEPT: Record<Dept | "all", ReturnType<typeof selectorsFor>> = {
  all: selectorsFor(),
  police: selectorsFor("police"),
  consumer: selectorsFor("consumer"),
  other: selectorsFor("other"),
};

export function Breakdowns({ dept, div = "all", className }: { dept?: Dept; div?: DivisionScope; className?: string }) {
  const sel = BY_DEPT[dept ?? "all"];
  const cats = useCommand(sel.cats(div));
  const places = useCommand(sel.places(div));
  const scoped = div !== undefined && div !== "all";
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      <Panel title="Open by category" icon="category" sub={scoped ? "Share of the division's open cases" : "Share of all open cases"}>
        <Bars data={cats} label="Open cases by category" />
      </Panel>
      {scoped ? (
        <Panel
          title="Open by area"
          icon="location_on"
          sub={
            <>
              Busiest areas of <Bn className="font-semibold text-white/85">{DIVISION_BY_ID[div].nameBn}</Bn> division first
            </>
          }
        >
          <Bars data={places} label={`Open cases by area, ${DIVISION_BY_ID[div].name} division`} />
        </Panel>
      ) : (
        <Panel title="Open by division" icon="map" sub="All eight divisions, busiest first">
          <Bars data={places} label="Open cases by division" />
        </Panel>
      )}
    </div>
  );
}

type DivisionCounts = Partial<Record<DivisionId | "all", number>>;

/** Open cases per division, and "all" for the country. */
function openCounts(w: World, dept?: Dept): DivisionCounts {
  const out: DivisionCounts = { all: 0 };
  for (const d of Object.keys(DIVISIONS) as DivisionId[]) out[d] = 0;
  for (const c of w.cases) {
    if (!isOpen(c) || (dept && c.dept !== dept)) continue;
    out.all = (out.all ?? 0) + 1;
    out[c.place.division] = (out[c.place.division] ?? 0) + 1;
  }
  return out;
}

/** The division picker's badges (open cases), one memo per department ("all" = every department). */
export const selectOpenCounts: Record<Dept | "all", (w: World) => DivisionCounts> = {
  all: perWorld((w) => openCounts(w)),
  police: perWorld((w) => openCounts(w, "police")),
  consumer: perWorld((w) => openCounts(w, "consumer")),
  other: perWorld((w) => openCounts(w, "other")),
};
