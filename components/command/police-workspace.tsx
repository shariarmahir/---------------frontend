"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type KeyboardEvent, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { STATIONS } from "@/data/command/stations";
import { acknowledge, dispatch, escalate } from "@/lib/command/actions";
import { etaMin, haversineKm } from "@/lib/command/geo";
import { CATEGORY_META } from "@/lib/command/routing";
import { filterCases, isOpen, pendingAlerts, type PendingAlert } from "@/lib/command/selectors";
import { commandAct, perWorld, useCommand } from "@/lib/command/store";
import type { Category, Severity, Status, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { AlertFeed } from "./alert-feed";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable } from "./case-table";
import { KpiRow } from "./kpi-row";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";
import { SearchField, SelectField, Panel, STATUS_META, SEVERITY_LABEL, Skeleton, cb, focusRing, num } from "./kit";

/**
 * /protibad/command/police: the police desk. Alerts (cases waiting for a
 * unit, with Acknowledge / Dispatch nearest / Escalate now), the map, and the
 * task list with filters kept in the URL (?status=&category=&station=
 * &severity=&q=). From lg the alerts and the map sit side by side with the
 * tasks below; under lg they are three tabs. Uses useSearchParams: render it
 * inside <Suspense>.
 */

/* ───────────── selectors (module level, one memo each) ───────────── */

const selectOpenPolice = perWorld((w: World) => w.cases.filter((c) => c.dept === "police" && isOpen(c)));
const selectPoliceUnits = perWorld((w: World) => w.units.filter((u) => u.dept === "police"));
const selectPending = perWorld((w: World) => pendingAlerts(w, "police").length);
const selectOnDuty = perWorld((w: World) => w.units.filter((u) => u.dept === "police" && u.kind === "patrol" && u.status !== "off-duty").length);

/* ───────────── wide / narrow ───────────── */

const WIDE = "(min-width: 64rem)";
function subscribeWide(notify: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
}
/** lg and up (alerts and map side by side, no tabs); false on the server. */
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);

/* ───────────── tabs ───────────── */

type TabId = "alerts" | "map" | "tasks";
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "alerts", label: "Alerts", icon: "notifications_active" },
  { id: "map", label: "Map", icon: "map" },
  { id: "tasks", label: "Tasks", icon: "checklist" },
];

function TabStrip({ active, onChange, counts }: { active: TabId; onChange(t: TabId): void; counts: Record<TabId, number | null> }) {
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
    document.getElementById(`pw-tab-${TABS[next].id}`)?.focus();
  };
  return (
    <div role="tablist" aria-label="Police workspace" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-1 rounded-2xl bg-bdnavy-900 p-1 ring-1 ring-white/12 lg:hidden">
      {TABS.map((t) => {
        const on = t.id === active;
        const n = counts[t.id];
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`pw-tab-${t.id}`}
            aria-selected={on}
            aria-controls={`pw-panel-${t.id}`}
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

/** Under a pending alert: who was alerted, how far, and the three ways to answer it. */
function AlertActions({ p }: { p: PendingAlert }) {
  const [error, setError] = useState<string | null>(null);
  const id = p.case.id;
  const km = p.unit ? haversineKm(p.case.place, p.unit) : null;
  return (
    <>
      <p className="basis-full text-xs text-white/65 tabular-nums">
        {p.unit ? (
          <>
            <span className="font-semibold text-white/85">{p.unit.name}</span>
            {km !== null ? ` · ${km.toFixed(1)} km · about ${etaMin(km, p.unit.kind)} min away` : null}
          </>
        ) : (
          "No unit is free for this alert"
        )}
      </p>
      <button type="button" className={cb.goldSm} onClick={() => setError(commandAct((w, now) => acknowledge(w, id, now)))}>
        <Icon name="how_to_reg" className="text-[16px]" />
        Acknowledge
      </button>
      <button type="button" className={cb.outlineSm} onClick={() => setError(commandAct((w, now) => dispatch(w, id, now)))}>
        <Icon name="directions_car" className="text-[16px]" />
        Dispatch nearest
      </button>
      <button type="button" className={cb.quietSm} onClick={() => setError(commandAct((w, now) => escalate(w, id, now)))}>
        <Icon name="north_east" className="text-[16px]" />
        Escalate now
      </button>
      {error ? (
        <p role="alert" className="flex basis-full items-start gap-2 text-sm font-semibold text-white/85">
          <Icon name="error" className="shrink-0 text-[18px] text-crimson-bright" />
          {error}
        </p>
      ) : null}
    </>
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
const POLICE_CATEGORIES = (Object.keys(CATEGORY_META) as Category[]).filter((c) => CATEGORY_META[c].dept === "police");
const CATEGORY_OPTIONS = [{ value: "", label: "All types" }, ...POLICE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_META[c].label }))];
const STATION_OPTIONS = [{ value: "", label: "All stations" }, ...STATIONS.map((s) => ({ value: s.id, label: s.name.replace(/ Police Station$/, "") }))];
const SEVERITY_OPTIONS = [{ value: "", label: "Any severity" }, ...(Object.keys(SEVERITY_LABEL) as Severity[]).map((s) => ({ value: s, label: SEVERITY_LABEL[s] }))];

const oneOf = (v: string | null, opts: { value: string }[], fallback: string) => (v !== null && opts.some((o) => o.value === v) ? v : fallback);

function Tasks({ onOpen }: { onOpen(id: string): void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status = oneOf(params.get("status"), STATUS_OPTIONS, OPEN_STATUS);
  const category = oneOf(params.get("category"), CATEGORY_OPTIONS, "");
  const station = oneOf(params.get("station"), STATION_OPTIONS, "");
  const severity = oneOf(params.get("severity"), SEVERITY_OPTIONS, "");
  const qUrl = params.get("q")?.trim() ?? "";

  /** Change URL params (other params, including ?case=, are kept). Empty or default values are removed. */
  const setParams = useCallback(
    (patch: Record<string, string>) => {
      const q = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === "" || (k === "status" && v === OPEN_STATUS)) q.delete(k);
        else q.set(k, v);
      }
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // The search box types locally and reaches the URL after a short pause.
  const [text, setText] = useState(qUrl);
  useEffect(() => {
    if (text.trim() === qUrl) return;
    const t = setTimeout(() => setParams({ q: text.trim() }), 300);
    return () => clearTimeout(t);
  }, [text, qUrl, setParams]);

  const select = useMemo(
    () =>
      perWorld((w: World) =>
        filterCases(w, {
          dept: "police",
          status: status === ALL ? undefined : (status as Status | "open"),
          category: (category || undefined) as Category | undefined,
          homeId: station || undefined,
          severity: (severity || undefined) as Severity | undefined,
          q: qUrl || undefined,
        }),
      ),
    [status, category, station, severity, qUrl],
  );
  const cases = useCommand(select);
  const filtered = status !== OPEN_STATUS || category !== "" || station !== "" || severity !== "" || qUrl !== "";
  const key = [status, category, station, severity, qUrl].join("|");

  return (
    <Panel
      id="pw-tasks"
      title="Tasks"
      icon="checklist"
      sub="Every police complaint is a task until it is closed. Critical first, then newest."
      action={
        cases ? (
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(cases.length)} shown</span>
        ) : null
      }
    >
      <form role="search" aria-label="Filter police tasks" onSubmit={(e) => e.preventDefault()} className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-[1.1fr_1.3fr_1.1fr_1fr_1.3fr_auto] xl:items-end">
        <SelectField label="Status" value={status} onChange={(v) => setParams({ status: v })} options={STATUS_OPTIONS} />
        <SelectField label="Complaint type" value={category} onChange={(v) => setParams({ category: v })} options={CATEGORY_OPTIONS} className="max-md:col-span-1" />
        <SelectField label="Station" value={station} onChange={(v) => setParams({ station: v })} options={STATION_OPTIONS} />
        <SelectField label="Severity" value={severity} onChange={(v) => setParams({ severity: v })} options={SEVERITY_OPTIONS} />
        <SearchField label="Search" value={text} onChange={setText} placeholder="Case number or place" className="col-span-2 md:col-span-2 xl:col-span-1" />
        <button
          type="button"
          disabled={!filtered && text === ""}
          onClick={() => {
            setText("");
            setParams({ status: OPEN_STATUS, category: "", station: "", severity: "", q: "" });
          }}
          className={cn(cb.quietSm, "col-span-2 md:col-span-1")}
        >
          <Icon name="filter_alt_off" className="text-[16px]" />
          Clear filters
        </button>
      </form>
      <CaseTable
        key={key}
        cases={cases}
        onOpen={onOpen}
        columns={["id", "category", "place", "severity", "status", "unit", "age"]}
        caption="Police tasks"
        empty={filtered ? "No tasks match these filters." : "No open police tasks. New complaints will appear here."}
      />
    </Panel>
  );
}

/* ───────────── the workspace ───────────── */

const LEGEND: { label: string; swatch: string }[] = [
  { label: "Police case", swatch: "size-3 rounded-full bg-signal-orange ring-2 ring-black outline outline-1 outline-white/30" },
  { label: "Critical or overdue", swatch: "size-3 rounded-full bg-national-crimson ring-2 ring-white outline-2 outline-offset-2 outline-national-crimson" },
  { label: "Police station", swatch: "size-3 rounded-sm bg-signal-orange" },
  { label: "Patrol", swatch: "size-2 rounded-full bg-bdnavy-300" },
];

const DESK_FEED = 14;
const PHONE_FEED = 6;

export function PoliceWorkspace() {
  const [selected, setSelected] = useSelectedCase();
  const wide = useWide();
  const params = useSearchParams();
  // A shared link that carries filters opens on the task list.
  const [tab, setTab] = useState<TabId>(() => (["status", "category", "station", "severity", "q"].some((k) => params.has(k)) ? "tasks" : "alerts"));
  const [allAlerts, setAllAlerts] = useState(false);
  const open = useCommand(selectOpenPolice);
  const units = useCommand(selectPoliceUnits);
  const pending = useCommand(selectPending);
  const onDuty = useCommand(selectOnDuty);
  const feedLimit = wide ? DESK_FEED : allAlerts ? 500 : PHONE_FEED;

  const show = (id: TabId) => wide || tab === id;
  const panel = (id: TabId) => (wide ? {} : { role: "tabpanel", id: `pw-panel-${id}`, "aria-labelledby": `pw-tab-${id}`, tabIndex: 0 });

  return (
    <CommandPage
      title="Police"
      subtitle="Complaints routed to the nearest station and patrol. Acknowledge an alert, send the nearest unit, or pass it on; the case stays a task until it is closed."
      actions={
        <Link href="/protibad/command/police/stations" className={cb.outline}>
          <Icon name="location_city" className="text-[18px]" />
          Stations
        </Link>
      }
    >
      <KpiRow dept="police" />

      <TabStrip active={tab} onChange={setTab} counts={{ alerts: pending, map: null, tasks: open?.length ?? null }} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        {show("alerts") ? (
          <div {...panel("alerts")} className="flex min-w-0 flex-col focus-visible:outline-none lg:h-0 lg:min-h-full">
            <Panel
              title="Alerts"
              icon="notifications_active"
              sub="Soonest to escalate first, then newest"
              action={
                pending !== null ? (
                  <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(pending)} waiting</span>
                ) : null
              }
              className="min-h-0 flex-1"
              bodyClassName="flex min-h-0 flex-col px-2 sm:px-2.5"
            >
              <AlertFeed
                dept="police"
                onOpen={setSelected}
                limit={feedLimit}
                renderActions={(p) => <AlertActions p={p} />}
                className="flex-1 overflow-y-auto overscroll-contain lg:max-h-none"
              />
              {open ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1.5 pt-3 text-xs text-white/60 tabular-nums">
                  <span>
                    Showing {num(Math.min(feedLimit, open.length))} of {num(open.length)} open
                  </span>
                  {wide ? (
                    <a href="#pw-tasks" className={cn("rounded-md px-1 font-semibold text-white/85 underline-offset-4 hover:text-signal-orange hover:underline", focusRing)}>
                      All tasks
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
        ) : null}

        {show("map") ? (
          <div {...panel("map")} className="flex min-w-0 flex-col focus-visible:outline-none">
            <Panel
              title="Map"
              icon="public"
              sub={
                open && onDuty !== null ? (
                  <span className="tabular-nums">
                    {num(open.length)} open incidents · {num(onDuty)} patrols on duty · positions approximate
                  </span>
                ) : (
                  <Skeleton className="h-3 w-56" />
                )
              }
              className="flex-1"
              bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
            >
              <MapView
                className="h-80 border-y border-white/10 sm:h-[26rem] lg:h-auto lg:min-h-[34rem] lg:flex-1"
                cases={open ?? []}
                units={units ?? []}
                selectedId={selected ?? undefined}
                onSelect={setSelected}
                focus={selected ? "selection" : "country"}
                showUnits={["station", "patrol"]}
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
          </div>
        ) : null}
      </div>

      {show("tasks") ? (
        <div {...panel("tasks")} className="min-w-0 focus-visible:outline-none">
          <Tasks onOpen={setSelected} />
        </div>
      ) : null}

      <p className="flex items-center gap-2 text-xs text-white/50">
        <Icon name="map" className="text-[16px]" />
        Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/** What the server and the first paint show before the world is read. */
export function PoliceWorkspaceFallback() {
  return (
    <CommandPage title="Police" subtitle="Loading the police desk…">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-2xl lg:h-[34rem]" />
        <Skeleton className="hidden h-96 rounded-2xl lg:block lg:h-[34rem]" />
      </div>
    </CommandPage>
  );
}
