"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { BUSINESSES } from "@/data/command/consumer";
import { isOpen } from "@/lib/command/selectors";
import { perWorld, selectOffices, useCommand } from "@/lib/command/store";
import type { Business, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { BUSINESS_KIND_LABEL, Bn, EmptyState, Kpi, Panel, RepeatPill, SearchField, SelectField, Skeleton, businessKind, cb, focusRing, num, taka, timeAgo } from "./kit";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";
import { useSearchBox, useUrlFilters } from "./url-filters";
import { ScrollCue } from "./scroll-cue";

/**
 * /protibad/command/consumer/businesses: every (fictional) business a
 * consumer complaint can name, with its cases, open cases, how long ago the
 * last one was filed and a Repeat pill; each links to its CRM page. Search
 * and kind filter live in the URL (?q=&kind=); the table sorts by column.
 * Uses useSearchParams: render it inside <Suspense>.
 */

interface Row {
  business: Business;
  total: number;
  open: number;
  lastAt: number | null;
}
interface Data {
  rows: Row[];
  now: number;
  openCases: number;
  repeat: number;
  repeatSevere: number;
  finesTk: number;
  fines: number;
}

const selectData = perWorld((w: World): Data => {
  const byBiz = new Map<string, Row>(w.businesses.map((business) => [business.id, { business, total: 0, open: 0, lastAt: null }]));
  let openCases = 0;
  let finesTk = 0;
  let fines = 0;
  for (const c of w.cases) {
    if (c.dept !== "consumer") continue;
    for (const n of c.notes) {
      if (n.kind === "fine" && n.amountTk !== undefined) {
        finesTk += n.amountTk;
        fines++;
      }
    }
    const r = c.businessId ? byBiz.get(c.businessId) : undefined;
    if (!r) continue;
    r.total++;
    if (isOpen(c)) {
      r.open++;
      openCases++;
    }
    if (r.lastAt === null || c.reportedAt > r.lastAt) r.lastAt = c.reportedAt;
  }
  const rows = [...byBiz.values()];
  return { rows, now: w.now, openCases, repeat: rows.filter((r) => r.total >= 2).length, repeatSevere: rows.filter((r) => r.total >= 3).length, finesTk, fines };
});
const selectOpenConsumer = perWorld((w: World) => w.cases.filter((c) => c.dept === "consumer" && isOpen(c)));

type SortKey = "name" | "kind" | "district" | "total" | "open" | "last";
const COLUMNS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "name", label: "Business", numeric: false },
  { key: "kind", label: "Kind", numeric: false },
  { key: "district", label: "District", numeric: false },
  { key: "total", label: "Cases", numeric: true },
  { key: "open", label: "Open", numeric: true },
  { key: "last", label: "Last case", numeric: true },
];

function compare(key: SortKey, a: Row, b: Row): number {
  switch (key) {
    case "name":
      return a.business.nameBn.localeCompare(b.business.nameBn, "bn");
    case "kind":
      return businessKind(a.business.kind).label.localeCompare(businessKind(b.business.kind).label);
    case "district":
      return a.business.district.localeCompare(b.business.district);
    case "total":
      return a.total - b.total;
    case "open":
      return a.open - b.open;
    case "last":
      return (a.lastAt ?? 0) - (b.lastAt ?? 0);
  }
}

const KIND_OPTIONS = [
  { value: "", label: "All kinds" },
  ...Object.keys(BUSINESS_KIND_LABEL)
    .filter((k) => BUSINESSES.some((b) => b.kind === k))
    .map((k) => ({ value: k, label: BUSINESS_KIND_LABEL[k].label })),
];

const href = (id: string) => `/protibad/command/consumer/businesses/${id}`;

export function BusinessList() {
  const [selected, setSelected] = useSelectedCase();
  const filters = useUrlFilters();
  const { params, setParams } = filters;
  const data = useCommand(selectData);
  const open = useCommand(selectOpenConsumer);
  const offices = useCommand(selectOffices);
  // A closed case opened from a table is not on the map: leave the map unframed rather than on its last view.
  const onMap = selected !== null && (open?.some((c) => c.id === selected) ?? false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "total", dir: "desc" });

  const kindParam = params.get("kind");
  const kind = KIND_OPTIONS.some((o) => o.value === kindParam) ? (kindParam ?? "") : "";
  const qUrl = params.get("q")?.trim() ?? "";
  const [text, setText, clearText] = useSearchBox(qUrl, filters);
  const filtered = kind !== "" || qUrl !== "";

  const shown = useMemo(() => {
    if (!data) return null;
    const needle = qUrl.toLowerCase();
    const list = data.rows.filter(
      (r) =>
        (!kind || r.business.kind === kind) &&
        (!needle ||
          r.business.name.toLowerCase().includes(needle) ||
          r.business.nameBn.includes(qUrl) ||
          r.business.district.toLowerCase().includes(needle) ||
          businessKind(r.business.kind).label.toLowerCase().includes(needle)),
    );
    const sign = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      // A business with no case yet sorts last, whichever way the list runs.
      if (sort.key === "last" && (a.lastAt === null) !== (b.lastAt === null)) return a.lastAt === null ? 1 : -1;
      return sign * compare(sort.key, a, b) || b.total - a.total || a.business.nameBn.localeCompare(b.business.nameBn, "bn");
    });
  }, [data, kind, qUrl, sort]);

  const maxTotal = Math.max(1, ...(data?.rows ?? []).map((r) => r.total));
  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" || key === "kind" || key === "district" ? "asc" : "desc" }));

  return (
    <CommandPage
      title="Businesses"
      subtitle={
        <>
          Every business a consumer complaint can name, with its case history, inspection outcomes and fines. Choose one to open its file. <strong className="font-semibold text-white/90">Every business here is fictional</strong>, for demonstration.
        </>
      }
      actions={
        <Link href="/protibad/command/consumer" className={cb.outline}>
          <Icon name="storefront" className="text-[18px]" />
          <Bn>ভোক্তা অধিদপ্তর</Bn>
        </Link>
      }
    >
      <section aria-label="Key figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 sm:grid-cols-4 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+2)]:border-b max-sm:[&>div:nth-child(odd)]:border-r sm:[&>div:not(:last-child)]:border-r">
          <Kpi label="Businesses" icon="store" value={data ? num(data.rows.length) : <Skeleton className="h-7 w-14" />} sub={data ? "On the register" : null} />
          <Kpi label="Open cases" icon="folder_open" value={data ? num(data.openCases) : <Skeleton className="h-7 w-14" />} sub={data ? "Against a business" : null} />
          <Kpi
            label="Repeat businesses"
            icon="replay"
            value={data ? num(data.repeat) : <Skeleton className="h-7 w-14" />}
            sub={
              data ? (
                data.repeatSevere > 0 ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-crimson-bright">
                    <Icon name="priority_high" className="text-[14px]" />
                    {num(data.repeatSevere)} with 3 or more
                  </span>
                ) : (
                  "Two or more cases"
                )
              ) : null
            }
          />
          <Kpi label="Fines imposed" icon="payments" value={data ? taka(data.finesTk) : <Skeleton className="h-7 w-24" />} sub={data ? `${num(data.fines)} ${data.fines === 1 ? "fine" : "fines"} on record` : null} />
        </dl>
      </section>

      <Panel title="Case map" icon="public" sub="Open consumer cases sit at the business. Offices shown; positions are approximate." bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0">
        <MapView
          className="h-72 border-t border-white/10 sm:h-96 lg:h-[26rem]"
          cases={open ?? []}
          units={offices ?? []}
          selectedId={onMap ? (selected ?? undefined) : undefined}
          onSelect={setSelected}
          focus={onMap ? "selection" : "country"}
          showUnits={["office"]}
        />
      </Panel>

      <Panel
        id="business-table"
        title="All businesses"
        icon="list_alt"
        sub="Sort by any column. The businesses with the most cases come first."
        action={shown ? <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(shown.length)} shown</span> : null}
      >
        <form role="search" aria-label="Filter businesses" onSubmit={(e) => e.preventDefault()} className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,20rem)_minmax(0,12rem)_auto] sm:items-end">
          <SearchField label="Find a business" value={text} onChange={setText} placeholder="Name in English or Bangla, district" className="col-span-2 sm:col-span-1" />
          <SelectField label="Kind" value={kind} onChange={(v) => setParams({ kind: v })} options={KIND_OPTIONS} />
          <button
            type="button"
            aria-disabled={!filtered && text === ""}
            onClick={() => {
              if (!filtered && text === "") return;
              clearText();
              setParams({ kind: "", q: "" });
            }}
            className={cn(cb.quietSm, "aria-disabled:pointer-events-none aria-disabled:opacity-50")}
          >
            <Icon name="filter_alt_off" className="text-[16px]" />
            Clear
          </button>
        </form>
        {shown === null || data === null ? (
          <div aria-hidden="true" className="flex flex-col gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon="search_off" title="No business matches">
            Try another spelling, or clear the filters.
          </EmptyState>
        ) : (
          <>
            <ScrollCue axis="x" className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Businesses, {num(shown.length)} shown, sorted by {COLUMNS.find((c) => c.key === sort.key)?.label}
                </caption>
                <thead>
                  <tr className="border-b border-white/10">
                    {COLUMNS.map((c) => {
                      const on = sort.key === c.key;
                      return (
                        <th key={c.key} scope="col" aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("px-3 py-1.5 first:pl-0", c.numeric && "text-right")}>
                          <button
                            type="button"
                            onClick={() => toggle(c.key)}
                            className={cn(
                              "inline-flex min-h-11 items-center gap-1 rounded-md text-xs font-semibold whitespace-nowrap hover:text-white lg:min-h-9",
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
                    <th scope="col" className="px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-white/65">
                      Repeat
                    </th>
                    <th scope="col" className="w-10 px-3 py-2.5">
                      <span className="sr-only">Open the business</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => {
                    const k = businessKind(r.business.kind);
                    return (
                      <tr key={r.business.id} className="group border-b border-white/6 last:border-b-0 hover:bg-white/5">
                        <td className="py-2.5 pr-3">
                          <Link href={href(r.business.id)} className={cn("flex min-h-11 flex-col justify-center rounded-md lg:min-h-0", focusRing)}>
                            <Bn className="font-semibold text-white group-hover:text-signal-orange">{r.business.nameBn}</Bn>
                            <span className="text-xs text-white/65">{r.business.name}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-sm whitespace-nowrap text-white/80">
                          <span className="inline-flex items-center gap-1.5">
                            <span aria-hidden="true" className="inline-flex">
                              <Icon name={k.icon} className="text-[16px] text-bdnavy-300" />
                            </span>
                            {k.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-white/80">{r.business.district}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="inline-flex items-center justify-end gap-2.5">
                            <span aria-hidden="true" className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/8 xl:block">
                              <span className="block h-full rounded-full bg-bdnavy-300" style={{ width: `${(r.total / maxTotal) * 100}%` }} />
                            </span>
                            <span className="text-sm font-semibold text-white tabular-nums">{num(r.total)}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-white/75 tabular-nums">{num(r.open)}</td>
                        <td className="px-3 py-2.5 text-right text-sm whitespace-nowrap text-white/75 tabular-nums">{r.lastAt === null ? "—" : timeAgo(r.lastAt, data.now)}</td>
                        <td className="px-3 py-2.5">{r.total >= 2 ? <RepeatPill cases={r.total} /> : <span className="text-sm text-white/65">—</span>}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span aria-hidden="true" className="inline-flex text-white/65 group-hover:text-signal-orange">
                            <Icon name="chevron_right" className="text-[20px]" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollCue>

            <ul aria-label="Businesses" className="flex flex-col gap-2 md:hidden">
              {shown.map((r) => {
                const k = businessKind(r.business.kind);
                return (
                  <li key={r.business.id}>
                    <Link href={href(r.business.id)} className={cn("flex min-h-11 flex-col gap-2.5 rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10 hover:bg-white/6", focusRing)}>
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex min-w-0 flex-col">
                          <Bn className="truncate text-sm font-semibold text-white">{r.business.nameBn}</Bn>
                          <span className="truncate text-xs text-white/65">
                            {r.business.name} · {k.label} · {r.business.district}
                          </span>
                        </span>
                        <span aria-hidden="true" className="inline-flex text-white/65">
                          <Icon name="chevron_right" className="text-[20px]" />
                        </span>
                      </span>
                      <span className="flex items-end justify-between gap-2 text-xs text-white/65 tabular-nums">
                        <span className="grid grid-cols-3 gap-4">
                          <span className="flex flex-col">
                            <span>Cases</span>
                            <span className="text-sm font-semibold text-white">{num(r.total)}</span>
                          </span>
                          <span className="flex flex-col">
                            <span>Open</span>
                            <span className="text-sm font-semibold text-white/80">{num(r.open)}</span>
                          </span>
                          <span className="flex flex-col">
                            <span>Last case</span>
                            <span className="text-sm font-semibold whitespace-nowrap text-white/80">{r.lastAt === null ? "—" : timeAgo(r.lastAt, data.now)}</span>
                          </span>
                        </span>
                        <RepeatPill cases={r.total} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Panel>

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="map" className="text-[16px]" />
        Every business is fictional and does not stand for any real shop, brand or person. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

export function BusinessListFallback() {
  return (
    <CommandPage title="Businesses" subtitle="Loading the register…">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </CommandPage>
  );
}
