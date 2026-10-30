"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIVISION_IDS, DIVISION_BY_ID } from "@/data/command/divisions";
import { TCB_SOURCE, observedPrices, type PriceObservation } from "@/lib/command/prices";
import { bdDay, compareCases, isOpen } from "@/lib/command/selectors";
import { perWorld, useCommand, usePrices } from "@/lib/command/store";
import type { Case, PriceGroup, PriceUnit, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { DivisionPicker, DivisionScopeNote, useDivision, type DivisionScope } from "./division-picker";
import { Bn, EmptyState, Kpi, Panel, SearchField, SelectField, Skeleton, cb, focusRing, num, taka } from "./kit";
import { PriceSparkline } from "./price-sparkline";
import { CommandPage } from "./shell";
import { useSearchBox, useUrlFilters } from "./url-filters";

/**
 * /protibad/command/consumer/prices, "Price watch": today's market price of
 * each essential against the government's fixed price (a ceiling) or a sample
 * reference range, with a 7-day trend and the open overpricing cases filed
 * about it. Market prices are simulated (lib/command/prices, the same all
 * day); only the fixed rows are real figures, shown with source and date.
 *
 * URL: ?div= (prices for one division; All Bangladesh = Dhaka, TCB's market),
 * ?group=, ?problems=1, ?q=, ?sort=, ?item= (highlighted and scrolled to: the
 * case drawer links here) and ?case=. Uses useSearchParams: render it inside
 * <Suspense>.
 */

const GROUPS: { id: PriceGroup; label: string; labelBn: string }[] = [
  { id: "rice", label: "Rice", labelBn: "চাল" },
  { id: "pulses", label: "Pulses", labelBn: "ডাল" },
  { id: "oil", label: "Edible oil", labelBn: "ভোজ্যতেল" },
  { id: "sugar", label: "Sugar", labelBn: "চিনি" },
  { id: "vegetables", label: "Vegetables", labelBn: "সবজি" },
  { id: "protein", label: "Eggs, meat and fish", labelBn: "ডিম, মাংস ও মাছ" },
  { id: "fruit", label: "Fruit", labelBn: "ফল" },
  { id: "dairy", label: "Milk", labelBn: "দুধ" },
  { id: "other", label: "Flour and salt", labelBn: "আটা ও লবণ" },
];
const GROUP_OPTIONS = [{ value: "", label: "All groups" }, ...GROUPS.map((g) => ({ value: g.id, label: g.label }))];

type SortKey = "group" | "rise" | "excess";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "group", label: "By group" },
  { value: "rise", label: "Largest rise today" },
  { value: "excess", label: "Furthest above its price" },
];
const FILTER_DEFAULTS = { sort: "group" };

const UNIT: Record<PriceUnit, string> = { kg: "per kg", litre: "per litre", dozen: "per dozen", piece: "per packet" };

/** A price problem: sold over the fixed price, or above the usual range. */
const isProblem = (o: PriceObservation): boolean => o.status === "over-ceiling" || o.status === "above-range";

/** How far today's price is above its limit (the fixed price, or the top of the range), in percent; negative when under it. */
function excessPct(o: PriceObservation): number {
  const limit = o.item.fixed ? o.item.fixed.priceTk : o.item.reference.highTk;
  return ((o.todayTk - limit) / limit) * 100;
}

const pct = (x: number): string => `${Math.abs(x).toFixed(1)}%`;

const DATE_LABEL = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Open overpricing cases that name a price-watch item, critical first. */
const selectOverpricing = perWorld((w: World): Case[] =>
  w.cases.filter((c) => c.dept === "consumer" && c.category === "overpricing" && isOpen(c)).sort(compareCases),
);
const selectSeed = (w: World): number => w.seed;
const selectDay = (w: World): number => bdDay(w.now);

export function PriceWatch() {
  const [selected, setSelected] = useSelectedCase();
  const [div] = useDivision();
  const filters = useUrlFilters(FILTER_DEFAULTS);
  const { params, setParams } = filters;
  const prices = usePrices(div);
  const overpricing = useCommand(selectOverpricing);
  const seed = useCommand(selectSeed);
  const day = useCommand(selectDay);

  const groupParam = params.get("group");
  const group = GROUPS.some((g) => g.id === groupParam) ? (groupParam as PriceGroup) : "";
  const sortParam = params.get("sort");
  const sort: SortKey = SORT_OPTIONS.some((o) => o.value === sortParam) ? (sortParam as SortKey) : "group";
  const problemsOnly = params.get("problems") === "1";
  const item = params.get("item");
  const qUrl = params.get("q")?.trim() ?? "";
  const [text, setText, clearText] = useSearchBox(qUrl, filters);
  const filtered = group !== "" || problemsOnly || qUrl !== "" || sort !== "group";

  // Price problems per division today, for the picker's badges (All Bangladesh = Dhaka's market).
  const divCounts = useMemo(() => {
    if (seed === null || day === null) return undefined;
    const problems = (d?: (typeof DIVISION_IDS)[number]) => observedPrices(seed, day, d).filter(isProblem).length;
    const out: Partial<Record<DivisionScope, number>> = { all: problems() };
    for (const d of DIVISION_IDS) out[d] = problems(d);
    return out;
  }, [seed, day]);

  /** Open overpricing cases per item, in the scope (every division for All Bangladesh). */
  const casesByItem = useMemo(() => {
    const m = new Map<string, Case[]>();
    let inScope = 0;
    for (const c of overpricing ?? []) {
      if (div !== "all" && c.place.division !== div) continue;
      inScope++;
      if (!c.productId) continue;
      const list = m.get(c.productId) ?? [];
      list.push(c);
      m.set(c.productId, list);
    }
    return { m, inScope };
  }, [overpricing, div]);

  const figures = useMemo(() => {
    if (!prices) return null;
    const fixed = prices.filter((o) => o.item.fixed);
    const ref = prices.filter((o) => !o.item.fixed);
    const top = prices.reduce<PriceObservation | null>((best, o) => (!best || o.changePct > best.changePct ? o : best), null);
    return {
      over: fixed.filter((o) => o.status === "over-ceiling").length,
      fixed: fixed.length,
      above: ref.filter((o) => o.status === "above-range").length,
      below: ref.filter((o) => o.status === "below-range").length,
      rise: top && top.changePct > 0 ? top : null,
    };
  }, [prices]);

  const shown = useMemo(() => {
    if (!prices) return null;
    const needle = qUrl.toLowerCase();
    const list = prices.filter(
      (o) =>
        (!group || o.item.group === group) &&
        (!problemsOnly || isProblem(o)) &&
        (!needle || o.item.name.toLowerCase().includes(needle) || o.item.nameBn.includes(qUrl) || o.item.id.includes(needle)),
    );
    if (sort === "rise") return list.slice().sort((a, b) => b.changePct - a.changePct || a.item.name.localeCompare(b.item.name));
    if (sort === "excess") return list.slice().sort((a, b) => excessPct(b) - excessPct(a) || a.item.name.localeCompare(b.item.name));
    return list;
  }, [prices, group, problemsOnly, qUrl, sort]);

  /** Rows in sections: one per group when sorted by group, one flat section otherwise. */
  const sections = useMemo(() => {
    if (!shown) return null;
    if (sort !== "group") return [{ id: "all", label: SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "", labelBn: "", rows: shown }];
    return GROUPS.map((g) => ({ ...g, rows: shown.filter((o) => o.item.group === g.id) })).filter((g) => g.rows.length > 0);
  }, [shown, sort]);

  const linked = item && prices?.some((o) => o.item.id === item) ? item : null;
  const linkedHidden = linked !== null && shown !== null && !shown.some((o) => o.item.id === linked);

  // Arriving from a case (?item=): bring that row into view once, in whichever layout is showing.
  const scrolledTo = useRef<string | null>(null);
  useEffect(() => {
    if (!linked || !shown || scrolledTo.current === linked) return;
    const el = [...document.querySelectorAll<HTMLElement>(`[data-price-row="${linked}"]`)].find((e) => e.offsetParent !== null);
    if (!el) return;
    scrolledTo.current = linked;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [linked, shown]);

  const clearAll = () => {
    clearText();
    setParams({ group: "", problems: "", q: "", sort: "" });
  };

  return (
    <CommandPage
      title="Price watch"
      subtitle="Today's market prices against the government's fixed prices. Overcharging becomes a case."
      actions={
        <Link href="/protibad/command/consumer/recalls" className={cb.outline}>
          <Icon name="remove_shopping_cart" className="text-[18px]" />
          Remove from sale
        </Link>
      }
    >
      <div className="flex flex-col gap-2">
        <DivisionPicker counts={divCounts} countLabel="price problems" label="Market" />
        <DivisionScopeNote div={div}>{div === "all" ? "Prices from Dhaka's markets, the ones TCB reports" : "Prices in this division's markets"}</DivisionScopeNote>
      </div>

      <SourceNote />

      <section aria-label="Key figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 sm:grid-cols-4 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+2)]:border-b max-sm:[&>div:nth-child(odd)]:border-r sm:[&>div:not(:last-child)]:border-r">
          <Kpi
            label="Over the fixed price"
            icon="gavel"
            value={figures ? num(figures.over) : <Skeleton className="h-7 w-10" />}
            sub={
              figures ? (
                figures.over > 0 ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-crimson-bright">
                    <Icon name="priority_high" className="text-[14px]" />
                    Of {num(figures.fixed)} government-fixed items
                  </span>
                ) : (
                  `All ${num(figures.fixed)} fixed items within price`
                )
              ) : null
            }
          />
          <Kpi
            label="Outside the reference range"
            icon="swap_vert"
            value={figures ? num(figures.above + figures.below) : <Skeleton className="h-7 w-10" />}
            sub={figures ? `${num(figures.above)} above, ${num(figures.below)} below` : null}
          />
          <Kpi
            label="Overpricing cases open"
            icon="price_change"
            value={overpricing ? num(casesByItem.inScope) : <Skeleton className="h-7 w-10" />}
            sub={overpricing ? (div === "all" ? "Across Bangladesh" : <>In <Bn>{DIVISION_BY_ID[div].nameBn}</Bn> division</>) : null}
          />
          <Kpi
            label="Largest rise today"
            icon="trending_up"
            value={figures ? (figures.rise ? `+${pct(figures.rise.changePct)}` : "None") : <Skeleton className="h-7 w-16" />}
            sub={figures ? (figures.rise ? <Bn>{figures.rise.item.nameBn}</Bn> : "No price rose since yesterday") : null}
          />
        </dl>
      </section>

      <Panel
        id="price-table"
        title="Today's prices"
        icon="price_check"
        sub={
          day !== null ? (
            <>
              {DATE_LABEL.format(day * 86_400_000)}, against yesterday and the last 7 days. Rows over their price link to the open cases.
            </>
          ) : (
            "Against yesterday and the last 7 days."
          )
        }
        action={shown ? <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(shown.length)} shown</span> : null}
      >
        <form
          role="search"
          aria-label="Filter prices"
          onSubmit={(e) => e.preventDefault()}
          className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,16rem)_minmax(0,11rem)_minmax(0,13rem)_auto_auto] sm:items-end"
        >
          <SearchField label="Find an item" value={text} onChange={setText} placeholder="Rice, ডাল, oil…" className="col-span-2 sm:col-span-1" />
          <SelectField label="Group" value={group} onChange={(v) => setParams({ group: v })} options={GROUP_OPTIONS} />
          <SelectField label="Sort" value={sort} onChange={(v) => setParams({ sort: v })} options={SORT_OPTIONS} />
          <button
            type="button"
            aria-pressed={problemsOnly}
            onClick={() => setParams({ problems: problemsOnly ? "" : "1" })}
            className={cn(problemsOnly ? cb.goldSm : cb.quietSm, "max-sm:col-span-1")}
          >
            <Icon name={problemsOnly ? "check_box" : "check_box_outline_blank"} className="text-[18px]" />
            Only problems
          </button>
          <button
            type="button"
            aria-disabled={!filtered && text === ""}
            onClick={() => {
              if (!filtered && text === "") return;
              clearAll();
            }}
            className={cn(cb.quietSm, "aria-disabled:pointer-events-none aria-disabled:opacity-50")}
          >
            <Icon name="filter_alt_off" className="text-[16px]" />
            Clear
          </button>
        </form>

        {linkedHidden ? (
          <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-black/30 px-3.5 py-2.5 text-sm text-white/80 ring-1 ring-white/10">
            <Icon name="visibility_off" className="text-[18px] text-bdnavy-300" />
            The item linked from the case is hidden by the filters.
            <button type="button" onClick={clearAll} className={cb.outlineSm}>
              Show it
            </button>
          </p>
        ) : null}

        {sections === null || day === null ? (
          <div aria-hidden="true" className="flex flex-col gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <EmptyState icon="search_off" title="No item matches">
            {problemsOnly ? "No price problem in this market today, or none that matches." : "Try another spelling, or clear the filters."}
          </EmptyState>
        ) : (
          <>
            <PriceTable sections={sections} day={day} cases={casesByItem.m} linked={linked} onOpenCase={setSelected} />
            <PriceCards sections={sections} day={day} cases={casesByItem.m} linked={linked} onOpenCase={setSelected} />
          </>
        )}
      </Panel>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-white/65">
        <Icon name="info" className="text-[16px]" />
        <span>
          A price over a government-fixed price breaks the law and is an overpricing case for the <Bn>ভোক্তা অধিদপ্তর</Bn>. A reference range is not a legal limit: a price above it is a
          warning to inspect, not proof of an offence.
        </span>
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/** Where the numbers come from, and how far to trust each kind of row. */
function SourceNote() {
  return (
    <section aria-label="About these prices" className="flex flex-col gap-2 rounded-2xl bg-text-primary px-4 py-3.5 text-sm leading-relaxed text-white/80 ring-1 ring-white/12 sm:px-5">
      <p className="flex items-start gap-2.5">
        <span aria-hidden="true" className="mt-0.5 inline-flex">
          <Icon name="account_balance" className="text-[18px] text-bdnavy-300" />
        </span>
        <span>
          Official daily prices:{" "}
          <a
            href={TCB_SOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("inline-flex items-center gap-1 rounded-sm font-semibold text-signal-orange underline decoration-signal-orange/50 underline-offset-4 hover:decoration-signal-orange", focusRing)}
          >
            {TCB_SOURCE.name}
            <Icon name="open_in_new" className="text-[14px]" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{" "}
          {TCB_SOURCE.note}.
        </span>
      </p>
      <p className="flex items-start gap-2.5">
        <span aria-hidden="true" className="mt-0.5 inline-flex">
          <Icon name="verified" className="text-[18px] text-bdnavy-300" />
        </span>
        <span>Government fixed rows are verified (source and date shown). Reference rows are sample ranges for this demo. Market prices here are simulated.</span>
      </p>
    </section>
  );
}

interface Section {
  id: string;
  label: string;
  labelBn: string;
  rows: PriceObservation[];
}
interface ListProps {
  sections: Section[];
  day: number;
  cases: Map<string, Case[]>;
  linked: string | null;
  onOpenCase(id: string): void;
}

/** The price the row is held to: the fixed price with its badge and source, or the sample range. */
function PriceRule({ o, stacked }: { o: PriceObservation; stacked?: boolean }) {
  const f = o.item.fixed;
  if (f) {
    const source = `${f.source}, ${f.effective}`;
    return (
      <span className={cn("flex min-w-0 gap-x-2 gap-y-1", stacked ? "flex-col" : "flex-wrap items-center")}>
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white tabular-nums">{taka(f.priceTk)}</span>
          <span title={`${source}. Reported by ${f.reportedBy.join(" and ")}.`} className="inline-flex min-h-6 items-center gap-1 rounded-full bg-cobalt px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white">
            <Icon name="verified" className="text-[14px]" />
            Government fixed
          </span>
        </span>
        <span className="text-xs leading-snug text-white/65">{source}</span>
      </span>
    );
  }
  const r = o.item.reference;
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-white/85 tabular-nums">
        {taka(r.lowTk)}–{r.highTk.toLocaleString("en-US")}
      </span>
      <span title="A sample range for this demo, not an official figure" className="inline-flex min-h-6 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white/75 ring-1 ring-white/20">
        <Icon name="science" className="text-[14px]" />
        Reference (sample)
      </span>
    </span>
  );
}

/** Today against yesterday: red only when the item is already over its fixed price, gold for a rise otherwise. */
function Change({ o }: { o: PriceObservation }) {
  if (o.changePct === 0) return <span className="text-sm text-white/65">No change</span>;
  const up = o.changePct > 0;
  const tone = !up ? "text-white/65" : o.status === "over-ceiling" ? "text-crimson-bright" : "text-signal-orange";
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap tabular-nums", tone)}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      {pct(o.changePct)}
      <span className="sr-only"> since yesterday</span>
    </span>
  );
}

const PILL = "inline-flex min-h-6 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

function StatusPill({ o }: { o: PriceObservation }) {
  switch (o.status) {
    case "over-ceiling":
      return (
        <span className={cn(PILL, "bg-national-crimson text-white")}>
          <Icon name="priority_high" className="text-[14px]" />
          Over fixed price by {pct(o.overCeilingPct ?? 0)}
        </span>
      );
    case "above-range":
      return (
        <span className={cn(PILL, "bg-signal-orange text-text-primary")}>
          <Icon name="arrow_upward" className="text-[14px]" />
          Above usual range
        </span>
      );
    case "below-range":
      return (
        <span className={cn(PILL, "text-white/75 ring-1 ring-white/20")}>
          <Icon name="arrow_downward" className="text-[14px]" />
          Below usual range
        </span>
      );
    default:
      return (
        <span className={cn(PILL, "text-white/75 ring-1 ring-white/12")}>
          <Icon name="check" className="text-[14px]" />
          Within price
        </span>
      );
  }
}

/** The open overpricing cases about an item; each opens the case drawer. Two shown, the rest on request. */
function ItemCases({ o, cases, onOpenCase }: { o: PriceObservation; cases: Case[] | undefined; onOpenCase(id: string): void }) {
  const [all, setAll] = useState(false);
  if (!cases?.length) return <span className="text-sm text-white/65">{isProblem(o) ? "No case yet" : "—"}</span>;
  const list = all ? cases : cases.slice(0, 2);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {list.map((c) => (
        <button
          key={c.id}
          type="button"
          data-case-open={c.id}
          onClick={() => onOpenCase(c.id)}
          aria-label={`Open case ${c.id}, overpricing, ${c.place.district}`}
          className={cn(cb.quietSm, "gap-1.5 px-2.5 font-grotesk tabular-nums", c.severity === "critical" && "ring-national-crimson/70")}
        >
          <Icon name="folder_open" className="text-[16px] text-bdnavy-300" />
          {c.id}
        </button>
      ))}
      {cases.length > 2 && !all ? (
        <button type="button" onClick={() => setAll(true)} className={cn("min-h-11 rounded-lg px-2 text-xs font-semibold text-signal-orange underline-offset-4 hover:underline lg:min-h-9", focusRing)}>
          +{num(cases.length - 2)} more
        </button>
      ) : null}
    </span>
  );
}

function ItemName({ o }: { o: PriceObservation }) {
  return (
    <span className="flex min-w-0 flex-col">
      <Bn className="text-sm font-semibold text-white">{o.item.nameBn}</Bn>
      <span className="text-xs text-white/65">
        {o.item.name} · {UNIT[o.item.unit]}
      </span>
    </span>
  );
}

/** From xl: one table, a row group per section. */
function PriceTable({ sections, day, cases, linked, onOpenCase }: ListProps) {
  return (
    <div className="hidden xl:block">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Today&apos;s market prices against the fixed price or reference range, with the change since yesterday and the last 7 days</caption>
        <thead>
          <tr className="border-b border-white/10 text-xs font-semibold whitespace-nowrap text-white/65">
            <th scope="col" className="py-2.5 pr-3">Item</th>
            <th scope="col" className="px-3 py-2.5">Fixed price or reference</th>
            <th scope="col" className="px-3 py-2.5 text-right">Today</th>
            <th scope="col" className="px-3 py-2.5 text-right">Since yesterday</th>
            <th scope="col" className="px-3 py-2.5">Last 7 days</th>
            <th scope="col" className="px-3 py-2.5">Status</th>
            <th scope="col" className="px-3 py-2.5">Open cases</th>
          </tr>
        </thead>
        {sections.map((s) => (
          <tbody key={s.id}>
            <tr>
              <th scope="rowgroup" colSpan={7} className="pt-5 pb-2 text-left">
                <span className="flex items-baseline gap-2">
                  <span className="font-grotesk text-sm font-bold text-signal-orange">{s.label}</span>
                  {s.labelBn ? <Bn className="text-xs text-white/65">{s.labelBn}</Bn> : null}
                </span>
              </th>
            </tr>
            {s.rows.map((o) => {
              const on = linked === o.item.id;
              return (
                <tr
                  key={o.item.id}
                  data-price-row={o.item.id}
                  className={cn(
                    "border-b border-white/6 last:border-b-0",
                    on ? "bg-signal-orange/10 shadow-[inset_3px_0_0_var(--color-signal-orange)]" : o.status === "over-ceiling" ? "shadow-[inset_3px_0_0_var(--color-national-crimson)]" : "hover:bg-white/5",
                  )}
                >
                  <td className={cn("py-3 pr-3", (on || o.status === "over-ceiling") && "pl-3")}>
                    <ItemName o={o} />
                    {on ? <span className="sr-only"> (linked from the case)</span> : null}
                  </td>
                  <td className="w-72 min-w-64 px-3 py-3">
                    <PriceRule o={o} />
                  </td>
                  <td className="px-3 py-3 text-right font-grotesk text-base font-bold whitespace-nowrap text-white tabular-nums">{taka(o.todayTk)}</td>
                  <td className="px-3 py-3 text-right">
                    <Change o={o} />
                  </td>
                  <td className="px-3 py-3">
                    <PriceSparkline o={o} day={day} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill o={o} />
                  </td>
                  <td className="px-3 py-3">
                    <ItemCases o={o} cases={cases.get(o.item.id)} onOpenCase={onOpenCase} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

/** Below xl: a card per item, two columns from md. */
function PriceCards({ sections, day, cases, linked, onOpenCase }: ListProps) {
  return (
    <div className="flex flex-col gap-5 xl:hidden">
      {sections.map((s) => (
        <section key={s.id} aria-labelledby={`price-group-${s.id}`}>
          <h3 id={`price-group-${s.id}`} className="mb-2 flex items-baseline gap-2">
            <span className="font-grotesk text-sm font-bold text-signal-orange">{s.label}</span>
            {s.labelBn ? <Bn className="text-xs text-white/65">{s.labelBn}</Bn> : null}
          </h3>
          <ul className="grid gap-2 md:grid-cols-2">
            {s.rows.map((o) => {
              const on = linked === o.item.id;
              return (
                <li
                  key={o.item.id}
                  data-price-row={o.item.id}
                  className={cn(
                    "flex min-w-0 flex-col gap-3 rounded-xl bg-black/30 px-3.5 py-3 ring-1",
                    on ? "bg-signal-orange/10 ring-2 ring-signal-orange" : o.status === "over-ceiling" ? "ring-national-crimson/70" : "ring-white/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <ItemName o={o} />
                    <StatusPill o={o} />
                  </div>
                  {on ? <span className="sr-only">Linked from the case.</span> : null}
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-white/65">Today</span>
                      <span className="flex items-baseline gap-2.5">
                        <span className="font-grotesk text-xl leading-none font-bold text-white tabular-nums">{taka(o.todayTk)}</span>
                        <Change o={o} />
                      </span>
                    </div>
                    <PriceSparkline o={o} day={day} />
                  </div>
                  <PriceRule o={o} stacked />
                  {cases.get(o.item.id)?.length || isProblem(o) ? (
                    <div className="flex flex-col gap-1.5 border-t border-white/8 pt-2.5">
                      <span className="text-xs text-white/65">Open cases</span>
                      <ItemCases o={o} cases={cases.get(o.item.id)} onOpenCase={onOpenCase} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function PriceWatchFallback() {
  return (
    <CommandPage title="Price watch" subtitle="Today's market prices against the government's fixed prices. Overcharging becomes a case.">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </CommandPage>
  );
}
