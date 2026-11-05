"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { OFFICES } from "@/data/command/consumer";
import { DIVISION_BY_ID, DIVISION_IDS } from "@/data/command/divisions";
import { STATIONS } from "@/data/command/stations";
import { acknowledge, dispatch, escalate } from "@/lib/command/actions";
import { etaMin, haversineKm } from "@/lib/command/geo";
import { CATEGORY_META } from "@/lib/command/routing";
import { filterCases, openInDivision, pendingAlerts, unitDivision, unitsInDivision, type PendingAlert } from "@/lib/command/selectors";
import { commandAct, perDivision, perWorld, useCommand } from "@/lib/command/store";
import type { ActionResult, Category, DivisionId, Severity, Status, UnitKind, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { AlertFeed } from "./alert-feed";
import { selectOpenCounts } from "./breakdowns";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable, type CaseColumn } from "./case-table";
import { DivisionPicker, divisionFocus, useDivision, type DivisionScope } from "./division-picker";
import { KpiRow } from "./kpi-row";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";
import { useSearchBox, useUrlFilters } from "./url-filters";
import { useWide } from "./use-wide";
import { Bn, SearchField, SelectField, Panel, STATUS_META, SEVERITY_LABEL, Skeleton, cb, focusRing, num } from "./kit";
import { ScrollCue } from "./scroll-cue";

/**
 * One department's desk, for the police (/protibad/command/police) and the
 * ভোক্তা অধিদপ্তর (/protibad/command/consumer): Alerts (cases waiting for a
 * unit, with Acknowledge / Dispatch nearest / Escalate now), the map, and the
 * task list with filters kept in the URL (?status=&category=&station= for the
 * police or &office= for the consumer desk, &severity=&q=). From lg the alerts
 * and the map sit side by side with the tasks below; under lg they are three
 * tabs. What differs between the two (names, units, home filter, legend,
 * columns) is the DESKS table below. The division picker (?div=) scopes the
 * whole desk: KPIs, alerts, the map's cases, units and frame, the task list
 * and its station/office choices. Uses useSearchParams: render it inside
 * <Suspense>.
 */

/* ───────────── the two desks ───────────── */

export type DeskDept = "police" | "consumer";

interface Desk {
  /** Plain name: the tab strip's label and the table captions. */
  title: string;
  /** The page's h1 (Bangla for the consumer desk). */
  heading: ReactNode;
  subtitle: ReactNode;
  /** In "Every police complaint is a task". */
  noun: string;
  /** The mobile unit that answers a case. */
  mobileKind: UnitKind;
  onDutyNoun: string;
  /** URL parameter and select label for the owning station or office. */
  homeParam: "station" | "office";
  homeLabel: string;
  /** Every station or office, with the division it is in. */
  homes: { value: string; label: string; division: DivisionId }[];
  /** "All stations" / "All offices". */
  allHomes: string;
  showUnits: UnitKind[];
  legend: { label: string; swatch: string }[];
  columns: CaseColumn[];
  dispatchIcon: string;
  dispatchLabel: string;
  dispatchShort: string;
  dispatchAria: string;
  linkHref: string;
  linkIcon: string;
  linkLabel: string;
  footer: string;
  loading: string;
}

const DESKS: Record<DeskDept, Desk> = {
  police: {
    title: "Police",
    heading: "Police",
    subtitle: "Complaints routed to the nearest station and patrol. Acknowledge an alert, send the nearest unit, or pass it on; the case stays a task until it is closed.",
    noun: "police",
    mobileKind: "patrol",
    onDutyNoun: "patrols on duty",
    homeParam: "station",
    homeLabel: "Station",
    homes: STATIONS.map((s) => ({ value: s.id, label: s.name.replace(/ Police Station$/, ""), division: unitDivision(s) })),
    allHomes: "All stations",
    showUnits: ["station", "patrol"],
    legend: [
      { label: "Police case", swatch: "size-3 rounded-full bg-signal-orange ring-2 ring-black outline outline-1 outline-white/30" },
      { label: "Critical or overdue", swatch: "size-3 rounded-full bg-national-crimson ring-2 ring-white outline-2 outline-offset-2 outline-national-crimson" },
      { label: "Police station", swatch: "size-3 rounded-sm bg-signal-orange" },
      { label: "Patrol", swatch: "size-2 rounded-full bg-bdnavy-300" },
    ],
    columns: ["id", "category", "place", "severity", "status", "unit", "age"],
    dispatchIcon: "directions_car",
    dispatchLabel: "Dispatch nearest",
    dispatchShort: "Dispatch",
    dispatchAria: "Dispatch nearest unit",
    linkHref: "/protibad/command/police/stations",
    linkIcon: "location_city",
    linkLabel: "Stations",
    footer: "Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.",
    loading: "Loading the police desk…",
  },
  consumer: {
    title: "Consumer rights",
    heading: <Bn>ভোক্তা অধিদপ্তর</Bn>,
    subtitle: (
      <>
        Consumer rights protection: complaints routed to the nearest district office and inspection team. Acknowledge an alert, send the nearest team, or pass it on; the case stays a task until it is closed.
      </>
    ),
    noun: "consumer-rights",
    mobileKind: "team",
    onDutyNoun: "inspection teams on duty",
    homeParam: "office",
    homeLabel: "Office",
    homes: OFFICES.map((o) => ({ value: o.id, label: o.name, division: unitDivision(o) })),
    allHomes: "All offices",
    showUnits: ["office", "team"],
    legend: [
      { label: "Consumer case", swatch: "size-3 rounded-full bg-cobalt ring-2 ring-white" },
      { label: "Critical or overdue", swatch: "size-3 rounded-full bg-national-crimson ring-2 ring-white outline-2 outline-offset-2 outline-national-crimson" },
      { label: "District office", swatch: "size-3 rounded-sm bg-cobalt ring-2 ring-white" },
      { label: "Inspection team", swatch: "size-2.5 rounded-full bg-cobalt ring-2 ring-white" },
    ],
    columns: ["id", "category", "business", "severity", "status", "unit", "age"],
    dispatchIcon: "groups",
    dispatchLabel: "Send nearest team",
    dispatchShort: "Send team",
    dispatchAria: "Send nearest inspection team",
    linkHref: "/protibad/command/consumer/businesses",
    linkIcon: "store",
    linkLabel: "Businesses",
    footer: "Offices and inspection teams are at approximate positions; every business is fictional. Map data © OpenStreetMap contributors.",
    loading: "Loading the consumer-rights desk…",
  },
};

/* ───────────── selectors (module level, one memo each per desk and division) ───────────── */

function deskSelectors(dept: DeskDept) {
  const mobile = DESKS[dept].mobileKind;
  return {
    open: perDivision((w, d) => openInDivision(w, d, dept)),
    units: perDivision((w, d) => unitsInDivision(w, d, dept)),
    pending: perDivision((w, d) => pendingAlerts(w, dept, d).length),
    onDuty: perDivision((w, d) => unitsInDivision(w, d, dept).filter((u) => u.kind === mobile && u.status !== "off-duty").length),
  };
}
const SELECTORS: Record<DeskDept, ReturnType<typeof deskSelectors>> = { police: deskSelectors("police"), consumer: deskSelectors("consumer") };

/* ───────────── tabs ───────────── */

type TabId = "alerts" | "map" | "tasks";
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "alerts", label: "Alerts", icon: "notifications_active" },
  { id: "map", label: "Map", icon: "map" },
  { id: "tasks", label: "Tasks", icon: "checklist" },
];

function TabStrip({ active, onChange, counts, label }: { active: TabId; onChange(t: TabId): void; counts: Record<TabId, number | null>; label: string }) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i + TABS.length - 1) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    onChange(TABS[next].id);
    document.getElementById(`dw-tab-${TABS[next].id}`)?.focus();
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="grid grid-cols-3 gap-1 rounded-2xl bg-bdnavy-900 p-1 ring-1 ring-white/12 lg:hidden">
      {TABS.map((t) => {
        const on = t.id === active;
        const n = counts[t.id];
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`dw-tab-${t.id}`}
            aria-selected={on}
            aria-controls={`dw-panel-${t.id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 font-grotesk text-sm font-bold transition-colors motion-reduce:transition-none",
              focusRing,
              on ? "bg-signal-orange text-text-primary" : "text-white/80 hover:bg-white/8",
            )}
          >
            <span aria-hidden="true" className="inline-flex">
              <Icon name={t.icon} className="text-[18px]" />
            </span>
            {t.label}
            {n !== null && n > 0 ? (
              <span className={cn("rounded-full px-1.5 text-xs font-semibold tabular-nums", on ? "bg-text-primary/15" : "bg-white/12")}>{num(n)}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────── alert actions ───────────── */

/**
 * Moves focus back into the alerts list after an action: the case's own row
 * if it is still there, else the first action of the next pending card.
 */
function refocusAlerts(id: string): void {
  requestAnimationFrame(() => {
    const scope = document.getElementById("dw-panel-alerts");
    const visible = (el: Element) => (el as HTMLElement).offsetParent !== null;
    const row = [...(scope?.querySelectorAll(`[data-case-open="${id}"]`) ?? [])].find(visible);
    const next = [...(scope?.querySelectorAll("[data-alert-actions] button") ?? [])].find(visible);
    ((row ?? next) as HTMLElement | undefined)?.focus();
  });
}

/** Under a pending alert: how far the alerted unit is, and the three ways to answer it. */
function AlertActions({ p, desk, onDone }: { p: PendingAlert; desk: Desk; onDone(message: string): void }) {
  const [error, setError] = useState<string | null>(null);
  const id = p.case.id;
  const km = p.unit ? haversineKm(p.case.place, p.unit) : null;
  const run = (fn: (w: World, now: number) => ActionResult, done: string) => {
    const err = commandAct(fn);
    setError(err);
    if (!err) {
      onDone(`Case ${id} ${done}`);
      refocusAlerts(id);
    }
  };
  return (
    <div data-alert-actions className="grid w-full grid-cols-2 gap-2 sm:max-lg:grid-cols-3">
      <p className="col-span-full text-xs text-white/65 tabular-nums">
        {p.unit && km !== null ? `${km.toFixed(1)} km away · about ${etaMin(km, p.unit.kind)} min` : "No unit is free for this alert"}
      </p>
      <button type="button" className={cn(cb.goldSm, "w-full")} onClick={() => run((w, now) => acknowledge(w, id, now), "acknowledged")}>
        <Icon name="how_to_reg" className="text-[16px]" />
        Acknowledge
      </button>
      <button type="button" className={cn(cb.outlineSm, "w-full")} onClick={() => run((w, now) => dispatch(w, id, now), "dispatched")} aria-label={desk.dispatchAria}>
        <Icon name={desk.dispatchIcon} className="text-[16px]" />
        <span className="sm:hidden">{desk.dispatchShort}</span>
        <span className="max-sm:hidden">{desk.dispatchLabel}</span>
      </button>
      <button type="button" className={cn(cb.quietSm, "col-span-2 w-full sm:max-lg:col-span-1")} onClick={() => run((w, now) => escalate(w, id, now), "escalated to the next unit")}>
        <Icon name="north_east" className="text-[16px]" />
        Escalate now
      </button>
      {error ? (
        <p role="alert" className="col-span-full flex items-start gap-2 text-sm font-semibold text-white/85">
          <span aria-hidden="true" className="inline-flex shrink-0">
            <Icon name="error" className="text-[18px] text-crimson-bright" />
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ───────────── filters in the URL ───────────── */

const OPEN_STATUS = "open";
const ALL = "all";
const STATUS_OPTIONS = [
  { value: OPEN_STATUS, label: "Open" },
  { value: ALL, label: "All statuses" },
  ...(Object.keys(STATUS_META) as Status[]).map((s) => ({ value: s, label: STATUS_META[s].label })),
];
function categoryOptions(dept: DeskDept) {
  const cats = (Object.keys(CATEGORY_META) as Category[]).filter((c) => CATEGORY_META[c].dept === dept);
  return [{ value: "", label: "All types" }, ...cats.map((c) => ({ value: c, label: CATEGORY_META[c].label }))];
}
const CATEGORY_OPTIONS: Record<DeskDept, { value: string; label: string }[]> = { police: categoryOptions("police"), consumer: categoryOptions("consumer") };
const SEVERITY_OPTIONS = [{ value: "", label: "Any severity" }, ...(Object.keys(SEVERITY_LABEL) as Severity[]).map((s) => ({ value: s, label: SEVERITY_LABEL[s] }))];

/** "Open" is the default status, so it is left out of the URL. */
const TASK_DEFAULTS = { status: OPEN_STATUS };

const oneOf = (v: string | null, opts: { value: string }[], fallback: string) => (v !== null && opts.some((o) => o.value === v) ? v : fallback);

/** The station (or office) choices for a scope: only those in the division. */
function homeOptions(desk: Desk, div: DivisionScope): { value: string; label: string }[] {
  return [{ value: "", label: desk.allHomes }, ...desk.homes.filter((h) => div === "all" || h.division === div)];
}
const HOME_OPTIONS: Record<DeskDept, Record<DivisionScope, { value: string; label: string }[]>> = {
  police: Object.fromEntries((["all", ...DIVISION_IDS] as DivisionScope[]).map((d) => [d, homeOptions(DESKS.police, d)])) as Record<DivisionScope, { value: string; label: string }[]>,
  consumer: Object.fromEntries((["all", ...DIVISION_IDS] as DivisionScope[]).map((d) => [d, homeOptions(DESKS.consumer, d)])) as Record<DivisionScope, { value: string; label: string }[]>,
};

function Tasks({ dept, div, onOpen }: { dept: DeskDept; div: DivisionScope; onOpen(id: string): void }) {
  const desk = DESKS[dept];
  const categoryOpts = CATEGORY_OPTIONS[dept];
  const homeOpts = HOME_OPTIONS[dept][div];
  const filters = useUrlFilters(TASK_DEFAULTS);
  const { params, setParams } = filters;

  const status = oneOf(params.get("status"), STATUS_OPTIONS, OPEN_STATUS);
  const category = oneOf(params.get("category"), categoryOpts, "");
  // A station outside the division reads as "All stations" (the picker also clears it when the scope changes).
  const home = oneOf(params.get(desk.homeParam), homeOpts, "");
  const severity = oneOf(params.get("severity"), SEVERITY_OPTIONS, "");
  const qUrl = params.get("q")?.trim() ?? "";
  const [text, setText, clearText] = useSearchBox(qUrl, filters);

  const select = useMemo(
    () =>
      perWorld((w: World) =>
        filterCases(w, {
          dept,
          status: status === ALL ? undefined : (status as Status | "open"),
          category: (category || undefined) as Category | undefined,
          homeId: home || undefined,
          severity: (severity || undefined) as Severity | undefined,
          division: div === "all" ? undefined : div,
          q: qUrl || undefined,
        }),
      ),
    [dept, status, category, home, severity, div, qUrl],
  );
  const cases = useCommand(select);
  // The division is the page's scope, not a task filter: it does not count here and Clear filters keeps it.
  const filtered = status !== OPEN_STATUS || category !== "" || home !== "" || severity !== "" || qUrl !== "";
  const key = [status, category, home, severity, div, qUrl].join("|");

  return (
    <Panel
      id="dw-tasks"
      title="Tasks"
      icon="checklist"
      sub={`Every ${desk.noun} complaint is a task until it is closed. Critical first, then newest.`}
      action={
        cases ? (
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(cases.length)} shown</span>
        ) : null
      }
    >
      <form role="search" aria-label={`Filter ${desk.noun} tasks`} onSubmit={(e) => e.preventDefault()} className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-[1.1fr_1.3fr_1.1fr_1fr_1.3fr_auto] xl:items-end">
        <SelectField label="Status" value={status} onChange={(v) => setParams({ status: v })} options={STATUS_OPTIONS} />
        <SelectField label="Complaint type" value={category} onChange={(v) => setParams({ category: v })} options={categoryOpts} className="max-md:col-span-1" />
        <SelectField label={desk.homeLabel} value={home} onChange={(v) => setParams({ [desk.homeParam]: v })} options={homeOpts} />
        <SelectField label="Severity" value={severity} onChange={(v) => setParams({ severity: v })} options={SEVERITY_OPTIONS} />
        <SearchField label="Search" value={text} onChange={setText} placeholder="Case number or place" className="col-span-2 md:col-span-2 xl:col-span-1" />
        <button
          type="button"
          aria-disabled={!filtered && text === ""}
          onClick={() => {
            if (!filtered && text === "") return;
            clearText();
            // ?div= stays: it is the page's scope (the picker above), not one of these filters.
            setParams({ status: OPEN_STATUS, category: "", [desk.homeParam]: "", severity: "", q: "" });
          }}
          className={cn(cb.quietSm, "col-span-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 md:col-span-1")}
        >
          <Icon name="filter_alt_off" className="text-[16px]" />
          Clear filters
        </button>
      </form>
      <CaseTable
        key={key}
        cases={cases}
        onOpen={onOpen}
        columns={desk.columns}
        caption={`${desk.title} tasks`}
        empty={filtered ? "No tasks match these filters." : `No open ${desk.noun} tasks. New complaints will appear here.`}
      />
    </Panel>
  );
}

/* ───────────── the workspace ───────────── */

const FEED = 6;
/** The picker's own default (division-picker.tsx): All Bangladesh is left out of the URL. */
const DIV_DEFAULTS = { div: "all" };

export function DeptWorkspace({ dept }: { dept: DeskDept }) {
  const desk = DESKS[dept];
  const sel = SELECTORS[dept];
  const [selected, setSelected] = useSelectedCase();
  const [div] = useDivision();
  const { setParams } = useUrlFilters(DIV_DEFAULTS);
  const wide = useWide();
  const params = useSearchParams();
  // A shared link that carries filters opens on the task list.
  const [tab, setTab] = useState<TabId>(() => (["status", "category", desk.homeParam, "severity", "q"].some((k) => params.has(k)) ? "tasks" : "alerts"));
  const [allAlerts, setAllAlerts] = useState(false);
  const [done, setDone] = useState("");
  const open = useCommand(sel.open(div));
  const units = useCommand(sel.units(div));
  const pending = useCommand(sel.pending(div));
  const onDuty = useCommand(sel.onDuty(div));
  const counts = useCommand(selectOpenCounts[dept]);
  const feedLimit = allAlerts ? 500 : FEED;
  const where = div === "all" ? null : DIVISION_BY_ID[div];

  // A new scope also drops a station/office filter that is not in it, in the same URL change.
  const chooseDiv = (next: DivisionScope) => {
    const home = params.get(desk.homeParam);
    const keep = next === "all" || !home || desk.homes.some((h) => h.value === home && h.division === next);
    setParams({ div: next, ...(keep ? {} : { [desk.homeParam]: "" }) });
  };
  const onMap = selected !== null && (open?.some((c) => c.id === selected) ?? false);

  // All three panels are always in the page: from lg they sit in the layout, below lg only the
  // chosen tab shows (so the desktop's first paint is final). Tab roles apply below lg only.
  const hide = (id: TabId) => (tab === id ? "" : "max-lg:hidden");
  const panel = (id: TabId) => ({ id: `dw-panel-${id}`, ...(wide ? {} : { role: "tabpanel", "aria-labelledby": `dw-tab-${id}` }) });

  return (
    <CommandPage
      title={desk.heading}
      subtitle={desk.subtitle}
      actions={
        <Link href={desk.linkHref} className={cb.outline}>
          <Icon name={desk.linkIcon} className="text-[18px]" />
          {desk.linkLabel}
        </Link>
      }
    >
      <DivisionPicker onChange={chooseDiv} counts={counts ?? undefined} countLabel="open cases" />

      <KpiRow dept={dept} div={div} />

      <TabStrip active={tab} onChange={setTab} counts={{ alerts: pending, map: null, tasks: open?.length ?? null }} label={`${desk.title} workspace`} />
      <p role="status" className="sr-only">
        {done}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        <div {...panel("alerts")} className={cn("flex min-w-0 flex-col", hide("alerts"))}>
          <Panel
            title="Alerts"
            icon="notifications_active"
            sub="Soonest to escalate first, then newest"
            action={
              pending !== null ? (
                <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(pending)} waiting</span>
              ) : null
            }
            className="flex-1"
            bodyClassName="flex min-h-0 flex-col px-2 sm:px-2.5"
          >
            <ScrollCue className={allAlerts ? "lg:max-h-[56rem] lg:overflow-y-auto lg:overscroll-contain" : undefined}>
              <AlertFeed dept={dept} div={div} onOpen={setSelected} limit={feedLimit} renderActions={(p) => <AlertActions p={p} desk={desk} onDone={setDone} />} />
            </ScrollCue>
            {open && open.length > FEED ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1.5 pt-3 text-xs text-white/65 tabular-nums">
                <span>
                  Showing {num(Math.min(feedLimit, open.length))} of {num(open.length)} open
                </span>
                <button type="button" aria-expanded={allAlerts} onClick={() => setAllAlerts((v) => !v)} className={cb.quietSm}>
                  {allAlerts ? "Show fewer" : `Show all ${num(open.length)}`}
                </button>
              </div>
            ) : null}
          </Panel>
        </div>

        <div {...panel("map")} className={cn("flex min-w-0 flex-col", hide("map"))}>
          <Panel
            title={where ? <>Map · <Bn>{where.nameBn}</Bn></> : "Map"}
            icon="public"
            sub={
              open && onDuty !== null ? (
                <span className="tabular-nums">
                  {num(open.length)} open incidents · {num(onDuty)} {desk.onDutyNoun} · positions approximate
                </span>
              ) : (
                <Skeleton className="h-3 w-56" />
              )
            }
            className="flex-1"
            bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
          >
            {/* The map mounts once it can be seen (a tab below lg, always from lg): Leaflet needs a size. */}
            <div className="relative h-80 border-y border-white/10 sm:h-[26rem] lg:h-auto lg:min-h-[34rem] lg:flex-1">
              {wide || tab === "map" ? (
                <MapView
                  className="absolute inset-0"
                  cases={open ?? []}
                  units={units ?? []}
                  selectedId={onMap ? (selected ?? undefined) : undefined}
                  onSelect={setSelected}
                  focus={onMap ? "selection" : divisionFocus(div)}
                  showUnits={desk.showUnits}
                  sos={dept === "police"}
                />
              ) : null}
            </div>
            <ul aria-label="Map legend" className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
              {desk.legend.map((l) => (
                <li key={l.label} className="flex items-center gap-2 text-xs text-white/70">
                  <span aria-hidden="true" className="grid size-4 place-items-center">
                    <span className={cn("block", l.swatch)} />
                  </span>
                  {l.label}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div {...panel("tasks")} className={cn("min-w-0", hide("tasks"))}>
        <Tasks dept={dept} div={div} onOpen={setSelected} />
      </div>

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="map" className="text-[16px]" />
        {desk.footer}
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/** What the server and the first paint show before the world is read. */
export function DeptWorkspaceFallback({ dept }: { dept: DeskDept }) {
  const desk = DESKS[dept];
  return (
    <CommandPage title={desk.heading} subtitle={desk.loading}>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-2xl lg:h-[34rem]" />
        <Skeleton className="hidden h-96 rounded-2xl lg:block lg:h-[34rem]" />
      </div>
    </CommandPage>
  );
}
