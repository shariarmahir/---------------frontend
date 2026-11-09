"use client";

import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { BANGLADESH_BOUNDS, DIVISIONS, DIVISION_BY_ID, isDivisionId } from "@/data/command/divisions";
import type { DivisionId } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Bn, SelectField, focusRing, num } from "./kit";
import type { MapBounds, MapViewProps } from "./map-view";
import { ScrollCue } from "./scroll-cue";
import { useUrlFilters } from "./url-filters";

/**
 * The division scope of a page, kept in the URL as ?div= (absent = All
 * Bangladesh). `useDivision()` reads and sets it; `<DivisionPicker />` is the
 * control (a row of chips from sm, a select below it); `divisionFocus(div)`
 * frames the map on it. Uses useSearchParams: render the page inside
 * <Suspense>.
 *
 *   const [div] = useDivision();
 *   <DivisionPicker counts={openByDivision} />
 *   <MapView focus={selected ? "selection" : divisionFocus(div)} … />
 *   <DivisionScopeNote div={div}>{num(stations.length)} stations</DivisionScopeNote>
 */

export type DivisionScope = DivisionId | "all";

const ALL = "all";
/** "All Bangladesh" is the default, so it is left out of the URL. */
const DIV_DEFAULTS = { div: ALL };

/** The page's division scope from ?div= ("all" when absent or not a division), and its setter. */
export function useDivision(): [DivisionScope, (div: DivisionScope) => void] {
  const { params, setParams } = useUrlFilters(DIV_DEFAULTS);
  const raw = params.get("div");
  const div: DivisionScope = isDivisionId(raw) ? raw : ALL;
  const setDiv = useCallback((next: DivisionScope) => setParams({ div: next }), [setParams]);
  return [div, setDiv];
}

/** One constant per scope, so the map's focus never changes identity for the same division. */
const FOCUS: Record<DivisionScope, NonNullable<MapViewProps["focus"]>> = {
  all: "country",
  ...(Object.fromEntries(DIVISIONS.map((d) => [d.id, { bounds: d.bounds }])) as Record<DivisionId, { bounds: MapBounds }>),
};

/** The map frame for a scope: the country view for "all", the division's box otherwise. */
export const divisionFocus = (div: DivisionScope): NonNullable<MapViewProps["focus"]> => FOCUS[div];

/** The box around a scope (BANGLADESH_BOUNDS for "all"), for anything that is not the map's focus. */
export const divisionBounds = (div: DivisionScope): MapBounds => (div === ALL ? BANGLADESH_BOUNDS : DIVISION_BY_ID[div].bounds);

interface Choice {
  id: DivisionScope;
  /** Plain English, for title and screen readers. */
  name: string;
  label: ReactNode;
}

const CHOICES: Choice[] = [
  { id: ALL, name: "All Bangladesh", label: "All Bangladesh" },
  ...DIVISIONS.map((d) => ({ id: d.id, name: `${d.name} division`, label: <Bn>{d.nameBn}</Bn> })),
];

const SELECT_OPTIONS = (counts: DivisionPickerProps["counts"]) =>
  CHOICES.map((c) => {
    const n = counts?.[c.id];
    const base = c.id === ALL ? c.name : `${DIVISION_BY_ID[c.id].nameBn} · ${DIVISION_BY_ID[c.id].name}`;
    return { value: c.id, label: n === undefined ? base : `${base} (${num(n)})` };
  });

export interface DivisionPickerProps {
  /** The scope shown as chosen; defaults to ?div= (useDivision). */
  value?: DivisionScope;
  /** Called with the new scope; defaults to writing ?div=. */
  onChange?(div: DivisionScope): void;
  /** A badge per chip (open cases, stations…); scopes left out show none. */
  counts?: Partial<Record<DivisionScope, number>>;
  /** What the badge counts, for screen readers: "Dhaka division, 14 open". */
  countLabel?: string;
  /** The group's name (visible above the select below sm). */
  label?: string;
  className?: string;
}

/**
 * All Bangladesh plus the eight divisions. From sm a horizontally scrolling
 * row of chips (a radio group: arrow keys, Home and End move the choice), the
 * current one on navy in gold; below sm a select. Bangla names on screen,
 * English for title and screen readers.
 */
export function DivisionPicker({ value, onChange, counts, countLabel = "open", label = "Division", className }: DivisionPickerProps) {
  const [urlDiv, setUrlDiv] = useDivision();
  const div = value ?? urlDiv;
  const choose = onChange ?? setUrlDiv;
  const group = useRef<HTMLDivElement>(null);

  // Keep the chosen chip in view inside the row (scrollLeft only: never scrolls the page).
  useEffect(() => {
    const row = group.current;
    const scroller = row?.parentElement;
    const chip = row?.querySelector<HTMLElement>(`[data-div="${div}"]`);
    if (!row || !scroller || !chip) return;
    const left = chip.offsetLeft - row.offsetLeft;
    const right = left + chip.offsetWidth;
    const pad = 36;
    if (left < scroller.scrollLeft + pad) scroller.scrollLeft = Math.max(0, left - pad);
    else if (right > scroller.scrollLeft + scroller.clientWidth - pad) scroller.scrollLeft = right - scroller.clientWidth + pad;
  }, [div]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = CHOICES.findIndex((c) => c.id === div);
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % CHOICES.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i + CHOICES.length - 1) % CHOICES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = CHOICES.length - 1;
    else return;
    e.preventDefault();
    const id = CHOICES[next].id;
    choose(id);
    group.current?.querySelector<HTMLElement>(`[data-div="${id}"]`)?.focus();
  };

  return (
    <div className={cn("min-w-0", className)}>
      <SelectField label={label} value={div} onChange={(v) => choose(isDivisionId(v) ? v : ALL)} options={SELECT_OPTIONS(counts)} className="sm:hidden" />
      <div className="rounded-2xl ring-1 ring-white/12 max-sm:hidden">
        <ScrollCue axis="x" className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div ref={group} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="flex w-max gap-1 p-1">
            {CHOICES.map((c) => {
              const on = c.id === div;
              const n = counts?.[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  data-div={c.id}
                  tabIndex={on ? 0 : -1}
                  title={c.name}
                  onClick={() => choose(c.id)}
                  className={cn(
                    "relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors motion-reduce:transition-none",
                    focusRing,
                    on ? "bg-bdnavy-900 text-signal-orange ring-1 ring-white/12" : "text-white/75 hover:bg-white/6 hover:text-white",
                  )}
                >
                  {c.id === ALL ? (
                    <span aria-hidden="true" className="inline-flex">
                      <Icon name="public" className="text-[18px]" />
                    </span>
                  ) : null}
                  {c.label}
                  {c.id !== ALL ? <span className="sr-only"> ({c.name})</span> : null}
                  {n !== undefined ? (
                    <>
                      <span aria-hidden="true" className={cn("rounded-full px-1.5 text-xs font-bold tabular-nums", on ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/75")}>
                        {n > 999 ? "999+" : num(n)}
                      </span>
                      <span className="sr-only">
                        , {num(n)} {countLabel}
                      </span>
                    </>
                  ) : null}
                  {on ? <span aria-hidden="true" className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-signal-orange" /> : null}
                </button>
              );
            })}
          </div>
        </ScrollCue>
      </div>
    </div>
  );
}

/** One line under a scoped panel: "Showing ঢাকা division · 14 stations", or "Showing all of Bangladesh · …". */
export function DivisionScopeNote({ div, children, className }: { div: DivisionScope; children?: ReactNode; className?: string }) {
  return (
    <p className={cn("flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/65 tabular-nums", className)}>
      <span aria-hidden="true" className="inline-flex">
        <Icon name={div === ALL ? "public" : "location_on"} className="text-[16px] text-bdnavy-300" />
      </span>
      {div === ALL ? (
        <span>Showing all of Bangladesh</span>
      ) : (
        <span>
          Showing <Bn className="font-semibold text-white">{DIVISION_BY_ID[div].nameBn}</Bn> division
          <span className="sr-only"> ({DIVISION_BY_ID[div].name})</span>
        </span>
      )}
      {children ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{children}</span>
        </>
      ) : null}
    </p>
  );
}
