"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { MAX_SEIZURE_UNITS, RECALL_ORDER, REGULATORS, advanceRecall, logSeizure, type RecallRow } from "@/lib/command/recalls";
import { compareCases, isOpen } from "@/lib/command/selectors";
import { commandAct, perWorld, useCommand, useRecalls } from "@/lib/command/store";
import type { Case, Danger, RecallStatus, RegulatorId, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { Bn, CONTROL, EmptyState, Kpi, Panel, SearchField, SelectField, Skeleton, cb, dhakaDateTime, focusRing, num } from "./kit";
import { RecallGuide } from "./recall-guide";
import { CommandPage } from "./shell";
import { useSearchBox, useUrlFilters } from "./url-filters";

/**
 * /protibad/command/consumer/recalls, "Remove from sale": the (fictional)
 * fake and dangerous products the regulators want off the shelves, critical
 * first, each moving Recall ordered → Seizing → Seized → Destroyed. Advancing
 * and logging a seizure are actions kept in the demo world (lib/command/recalls),
 * so they survive a reload. Linked open cases open in the case drawer.
 *
 * URL: ?danger=, ?reg=, ?status= (a status, or "active" for still on sale),
 * ?q=, ?item= (highlighted and scrolled to: the case drawer links here) and
 * ?case=. Uses useSearchParams: render it inside <Suspense>.
 */

const RECALL_STATUS_LABEL: Record<RecallStatus, string> = { ordered: "Recall ordered", seizing: "Seizing", seized: "Seized", destroyed: "Destroyed" };
const DANGER_LABEL: Record<Danger, string> = { critical: "Critical", high: "High", medium: "Medium" };

const DANGER_OPTIONS = [{ value: "", label: "Any danger" }, ...(Object.keys(DANGER_LABEL) as Danger[]).map((d) => ({ value: d, label: DANGER_LABEL[d] }))];
const REG_OPTIONS = [{ value: "", label: "Any regulator" }, ...(Object.keys(REGULATORS) as RegulatorId[]).map((r) => ({ value: r, label: REGULATORS[r].short }))];
const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "active", label: "Still on sale" },
  ...RECALL_ORDER.map((s) => ({ value: s, label: RECALL_STATUS_LABEL[s] })),
];

/** Still on shelves: ordered, or being seized. */
const onSale = (s: RecallStatus): boolean => s === "ordered" || s === "seizing";

/** Open consumer cases about a recalled product. */
const selectRecallCases = perWorld((w: World): Case[] => w.cases.filter((c) => c.dept === "consumer" && c.productId?.startsWith("rc-") && isOpen(c)).sort(compareCases));

/** The regulator's short name; the directorate's is Bangla. */
function RegulatorName({ id, className }: { id: RegulatorId; className?: string }) {
  const r = REGULATORS[id];
  return id === "dncrp" ? <Bn className={className}>{r.short}</Bn> : <span className={className}>{r.short}</span>;
}

export function RecallList() {
  const [selected, setSelected] = useSelectedCase();
  const filters = useUrlFilters();
  const { params, setParams } = filters;
  const rows = useRecalls();
  const recallCases = useCommand(selectRecallCases);
  const [announce, setAnnounce] = useState("");

  const pick = <T extends string>(key: string, options: { value: string }[]): T | "" => {
    const v = params.get(key);
    return options.some((o) => o.value === v) ? (v as T) : "";
  };
  const danger = pick<Danger>("danger", DANGER_OPTIONS);
  const reg = pick<RegulatorId>("reg", REG_OPTIONS);
  const status = pick<RecallStatus | "active">("status", STATUS_OPTIONS);
  const item = params.get("item");
  const qUrl = params.get("q")?.trim() ?? "";
  const [text, setText, clearText] = useSearchBox(qUrl, filters);
  const filtered = danger !== "" || reg !== "" || status !== "" || qUrl !== "";

  const casesById = useMemo(() => {
    const m = new Map<string, Case[]>();
    for (const c of recallCases ?? []) {
      const list = m.get(c.productId as string) ?? [];
      list.push(c);
      m.set(c.productId as string, list);
    }
    return m;
  }, [recallCases]);

  const figures = useMemo(() => {
    if (!rows) return null;
    const live = rows.filter((r) => onSale(r.state.status));
    const districts = new Set(rows.filter((r) => r.state.status !== "destroyed").flatMap((r) => r.item.districts));
    return {
      criticalOnSale: live.filter((r) => r.item.danger === "critical").length,
      seized: rows.reduce((n, r) => n + r.state.seizedUnits, 0),
      expected: rows.reduce((n, r) => n + r.item.seededUnits, 0),
      districts: districts.size,
      inProgress: rows.filter((r) => r.state.status !== "destroyed").length,
      destroyed: rows.filter((r) => r.state.status === "destroyed").length,
      total: rows.length,
    };
  }, [rows]);

  const shown = useMemo(() => {
    if (!rows) return null;
    const needle = qUrl.toLowerCase();
    return rows.filter(
      (r) =>
        (!danger || r.item.danger === danger) &&
        (!reg || r.item.regulator === reg) &&
        (!status || (status === "active" ? onSale(r.state.status) : r.state.status === status)) &&
        (!needle ||
          [r.item.brand, r.item.product, r.hazard.label, r.item.id, ...r.item.districts].some((s) => s.toLowerCase().includes(needle)) ||
          [r.item.brandBn, r.item.productBn, r.hazard.labelBn].some((s) => s.includes(qUrl))),
    );
  }, [rows, danger, reg, status, qUrl]);

  const linked = item && rows?.some((r) => r.item.id === item) ? item : null;
  const linkedHidden = linked !== null && shown !== null && !shown.some((r) => r.item.id === linked);

  // Arriving from a case (?item=): bring that recall into view once.
  const scrolledTo = useRef<string | null>(null);
  useEffect(() => {
    if (!linked || !shown || scrolledTo.current === linked) return;
    const el = document.getElementById(`recall-${linked}`);
    if (!el) return;
    scrolledTo.current = linked;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }, [linked, shown]);

  const clearAll = () => {
    clearText();
    setParams({ danger: "", reg: "", status: "", q: "" });
  };

  return (
    <CommandPage
      title="Remove from sale"
      subtitle="Fake and dangerous products to pull from shelves now. Each recall moves from the order to the seizure and the destruction of the stock."
      actions={
        <Link href="/protibad/command/consumer/prices" className={cb.outline}>
          <Icon name="price_check" className="text-[18px]" />
          Price watch
        </Link>
      }
    >
      <p role="note" className="flex items-start gap-2.5 rounded-2xl bg-text-primary px-4 py-3.5 text-sm leading-relaxed text-white/80 ring-1 ring-white/12 sm:px-5">
        <span aria-hidden="true" className="mt-0.5 inline-flex">
          <Icon name="info" className="text-[18px] text-bdnavy-300" />
        </span>
        <span>
          Brands here are invented for the demo. A real recall comes from BSTI, DGDA, the Bangladesh Food Safety Authority or the <Bn>ভোক্তা অধিদপ্তর</Bn>.
        </span>
      </p>

      <section aria-label="Key figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 sm:grid-cols-4 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+2)]:border-b max-sm:[&>div:nth-child(odd)]:border-r sm:[&>div:not(:last-child)]:border-r">
          <Kpi
            label="Critical, still on sale"
            icon="dangerous"
            value={figures ? <span className={figures.criticalOnSale > 0 ? "text-crimson-bright" : undefined}>{num(figures.criticalOnSale)}</span> : <Skeleton className="h-7 w-10" />}
            sub={figures ? (figures.criticalOnSale > 0 ? "Pull from shelves now" : "None left on shelves") : null}
          />
          <Kpi
            label="Units seized"
            icon="inventory_2"
            value={figures ? num(figures.seized) : <Skeleton className="h-7 w-16" />}
            sub={figures ? `Of ${num(figures.expected)} expected` : null}
          />
          <Kpi
            label="Districts affected"
            icon="location_on"
            value={figures ? num(figures.districts) : <Skeleton className="h-7 w-10" />}
            sub={figures ? `${num(figures.inProgress)} ${figures.inProgress === 1 ? "recall" : "recalls"} in progress` : null}
          />
          <Kpi
            label="Destroyed"
            icon="delete_forever"
            value={figures ? num(figures.destroyed) : <Skeleton className="h-7 w-10" />}
            sub={figures ? `Of ${num(figures.total)} recalls` : null}
          />
        </dl>
      </section>

      <div className="grid min-w-0 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel
          id="recall-list"
          title="Recalls"
          icon="remove_shopping_cart"
          sub="Critical first; finished recalls last."
          action={shown ? <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(shown.length)} shown</span> : null}
        >
          <form
            role="search"
            aria-label="Filter recalls"
            onSubmit={(e) => e.preventDefault()}
            className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] md:items-end 2xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,10rem))_auto]"
          >
            <SearchField label="Find a product" value={text} onChange={setText} placeholder="Brand, product, district" className="col-span-2 md:col-span-4 2xl:col-span-1" />
            <SelectField label="Danger" value={danger} onChange={(v) => setParams({ danger: v })} options={DANGER_OPTIONS} />
            <SelectField label="Regulator" value={reg} onChange={(v) => setParams({ reg: v })} options={REG_OPTIONS} />
            <SelectField label="Status" value={status} onChange={(v) => setParams({ status: v })} options={STATUS_OPTIONS} />
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
              The product linked from the case is hidden by the filters.
              <button type="button" onClick={clearAll} className={cb.outlineSm}>
                Show it
              </button>
            </p>
          ) : null}

          {shown === null ? (
            <div aria-hidden="true" className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-xl" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState icon="search_off" title="No recall matches">
              Try another spelling, or clear the filters.
            </EmptyState>
          ) : (
            <ul aria-label="Recalls" className="flex flex-col gap-3">
              {shown.map((r) => (
                <li key={r.item.id}>
                  <RecallCard row={r} cases={casesById.get(r.item.id)} linked={linked === r.item.id} onOpenCase={setSelected} onAnnounce={setAnnounce} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <RecallGuide />
      </div>

      <p role="status" className="sr-only">
        {announce}
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

function DangerPill({ danger }: { danger: Danger }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        danger === "critical" ? "bg-national-crimson text-white" : danger === "high" ? "bg-signal-orange text-text-primary" : "text-white/75 ring-1 ring-white/20",
      )}
    >
      {danger === "critical" ? <Icon name="priority_high" className="text-[14px]" /> : null}
      {DANGER_LABEL[danger]} danger
    </span>
  );
}

/** Recall ordered → Seizing → Seized → Destroyed: done steps in gold with a tick, the current one ringed. */
function Stepper({ status }: { status: RecallStatus }) {
  const at = RECALL_ORDER.indexOf(status);
  const finished = status === "destroyed";
  return (
    <ol aria-label="Progress" className="grid grid-cols-4">
      {RECALL_ORDER.map((s, i) => {
        const done = i < at || finished;
        const current = i === at && !finished;
        return (
          <li key={s} aria-current={i === at ? "step" : undefined} className="relative flex flex-col items-center gap-1.5 text-center">
            {i > 0 ? <span aria-hidden="true" className={cn("absolute top-3 right-1/2 left-[-50%] h-0.5 -translate-y-1/2", i <= at ? "bg-signal-orange" : "bg-white/12")} /> : null}
            <span
              aria-hidden="true"
              className={cn(
                "relative grid size-6 place-items-center rounded-full text-xs font-bold",
                done ? "bg-signal-orange text-text-primary" : current ? "bg-bdnavy-900 text-signal-orange ring-2 ring-signal-orange" : "bg-bdnavy-900 text-white/65 ring-1 ring-white/20",
              )}
            >
              {done ? <Icon name="check" className="text-[16px]" /> : i + 1}
            </span>
            <span className={cn("text-xs leading-tight", current || (finished && i === at) ? "font-semibold text-white" : done ? "text-white/80" : "text-white/65")}>
              {RECALL_STATUS_LABEL[s]}
              <span className="sr-only">{done ? ", done" : current ? ", current" : ", to come"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** "1,000" or "1000" → 1000; anything that is not a whole number → NaN. */
function parseUnits(raw: string): number {
  const t = raw.replace(/[,\s]/g, "");
  return /^\d+$/.test(t) ? Number(t) : NaN;
}

function RecallCard({
  row,
  cases,
  linked,
  onOpenCase,
  onAnnounce,
}: {
  row: RecallRow;
  cases: Case[] | undefined;
  linked: boolean;
  onOpenCase(id: string): void;
  onAnnounce(text: string): void;
}) {
  const { item, hazard, state } = row;
  const uid = useId();
  const [units, setUnits] = useState("");
  const [unitsError, setUnitsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const step = RECALL_ORDER.indexOf(state.status);
  const next = RECALL_ORDER[step + 1] as RecallStatus | undefined;
  const name = `${item.brand} ${item.product}`;
  const headingId = `recall-${item.id}-title`;
  const log = state.log.slice().reverse();

  /** After an action the card may move (a destroyed recall sorts last) or leave the filtered list: put focus back where it makes sense. */
  const refocus = (preferId: string) =>
    requestAnimationFrame(() => {
      const el =
        document.getElementById(preferId) ??
        document.getElementById(headingId) ??
        document.querySelector<HTMLElement>("#recall-list article h3") ??
        document.getElementById("command-main");
      el?.focus();
    });

  const advance = () => {
    if (!next) return;
    const err = commandAct((w, now) => advanceRecall(w, item.id, now));
    setActionError(err);
    if (err) {
      onAnnounce(err);
      return;
    }
    onAnnounce(`${name}: moved to ${RECALL_STATUS_LABEL[next]}.`);
    // The button stays while there is a next step; once destroyed, the card's heading takes focus.
    refocus(next === "destroyed" ? headingId : `${uid}-advance`);
  };

  const submitSeizure = (e: FormEvent) => {
    e.preventDefault();
    const n = parseUnits(units);
    if (!Number.isInteger(n) || n < 1 || n > MAX_SEIZURE_UNITS) {
      const msg = `Enter a whole number of units from 1 to ${num(MAX_SEIZURE_UNITS)}.`;
      setUnitsError(msg);
      onAnnounce(msg);
      document.getElementById(`${uid}-units`)?.focus();
      return;
    }
    const err = commandAct((w, now) => logSeizure(w, item.id, n, now));
    if (err) {
      setUnitsError(err);
      onAnnounce(err);
      return;
    }
    setUnits("");
    setUnitsError(null);
    setActionError(null);
    onAnnounce(`${name}: ${num(n)} ${n === 1 ? "unit" : "units"} seized logged, ${num(state.seizedUnits + n)} in all.`);
    refocus(`${uid}-units`);
  };

  return (
    <article
      id={`recall-${item.id}`}
      aria-labelledby={headingId}
      className={cn(
        "flex min-w-0 scroll-mt-24 flex-col gap-4 rounded-xl bg-black/30 px-3.5 py-4 ring-1 sm:px-4",
        linked ? "bg-signal-orange/10 ring-2 ring-signal-orange" : item.danger === "critical" && onSale(state.status) ? "ring-national-crimson/70" : "ring-white/10",
      )}
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/65">
          <DangerPill danger={item.danger} />
          <span title={REGULATORS[item.regulator].name} className="inline-flex min-h-6 items-center gap-1 rounded-full bg-cobalt px-2 py-0.5 font-semibold text-white">
            <Icon name="account_balance" className="text-[14px]" />
            <RegulatorName id={item.regulator} />
          </span>
          <span className="tabular-nums">{item.id}</span>
          {linked ? <span className="font-semibold text-signal-orange">Linked from the case</span> : null}
        </div>
        <h3 id={headingId} tabIndex={-1} className="flex flex-col rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange">
          <Bn className="text-base leading-snug font-bold text-white sm:text-lg">
            {item.brandBn} {item.productBn}
          </Bn>
          <span className="text-sm text-white/65">
            {item.brand} · {item.product}
          </span>
        </h3>
      </header>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex gap-2.5">
            <span aria-hidden="true" className="mt-0.5 inline-flex">
              <Icon name="warning" className="text-[18px] text-crimson-bright" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-semibold text-white">
                <Bn>{hazard.labelBn}</Bn> <span className="font-normal text-white/65">· {hazard.label}</span>
              </p>
              <Bn className="text-sm leading-relaxed text-white/85">{hazard.textBn}</Bn>
              <p className="text-xs leading-relaxed text-white/65">{hazard.text}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-white/65">Found in</span>
            <ul aria-label="Districts found" className="flex flex-wrap gap-1.5">
              {item.districts.map((d) => (
                <li key={d} className="inline-flex min-h-7 items-center gap-1 rounded-full bg-bdnavy-900 px-2.5 text-xs font-semibold text-white ring-1 ring-white/12">
                  <Icon name="location_on" className="text-[14px] text-bdnavy-300" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Stepper status={state.status} />
          <div className="flex flex-col gap-1.5">
            <p className="flex items-baseline justify-between gap-2 text-xs text-white/65 tabular-nums">
              <span>Units seized</span>
              <span>
                <span className="font-grotesk text-base font-bold text-white">{num(state.seizedUnits)}</span> of {num(item.seededUnits)} expected
              </span>
            </p>
            <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-bdnavy-300" style={{ width: `${Math.round(row.progress * 100)}%` }} />
            </span>
          </div>

          {next ? (
            <div className="flex flex-col gap-2">
              <button id={`${uid}-advance`} type="button" onClick={advance} className={cb.goldSm}>
                <Icon name="arrow_forward" className="text-[16px]" />
                Advance to {RECALL_STATUS_LABEL[next]}
              </button>
              {actionError ? (
                <p className="text-xs leading-snug font-semibold text-crimson-bright">
                  {actionError}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80">
              <Icon name="task_alt" className="text-[18px] text-signal-orange" />
              Finished: the stock was destroyed
            </p>
          )}

          {onSale(state.status) ? (
            <form onSubmit={submitSeizure} noValidate className="flex flex-col gap-1.5">
              <label htmlFor={`${uid}-units`} className="text-xs font-semibold text-white/65">
                Units seized now
              </label>
              <div className="flex gap-2">
                <input
                  id={`${uid}-units`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={`1 to ${num(MAX_SEIZURE_UNITS)}`}
                  value={units}
                  onChange={(e) => {
                    setUnits(e.target.value);
                    if (unitsError) setUnitsError(null);
                  }}
                  aria-invalid={unitsError ? true : undefined}
                  aria-describedby={unitsError ? `${uid}-units-error` : undefined}
                  className={cn(CONTROL, "min-w-0 flex-1 tabular-nums", unitsError && "ring-2 ring-crimson-bright")}
                />
                <button type="submit" className={cn(cb.outlineSm, "shrink-0")}>
                  <Icon name="inventory_2" className="text-[16px]" />
                  Log seizure
                </button>
              </div>
              {unitsError ? (
                <p id={`${uid}-units-error`} className="text-xs leading-snug font-semibold text-crimson-bright">
                  {unitsError}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>
      </div>

      {cases?.length ? (
        <div className="flex flex-col gap-1.5 border-t border-white/8 pt-3">
          <span className="text-xs text-white/65">Open cases about this product</span>
          <ul className="flex flex-wrap gap-1.5">
            {cases.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  data-case-open={c.id}
                  onClick={() => onOpenCase(c.id)}
                  aria-label={`Open case ${c.id}, ${c.place.district}`}
                  className={cn(cb.quietSm, "gap-1.5 px-2.5 font-grotesk tabular-nums", c.severity === "critical" && "ring-national-crimson/70")}
                >
                  <Icon name="folder_open" className="text-[16px] text-bdnavy-300" />
                  {c.id}
                  <span className="font-sans text-xs font-normal text-white/65">{c.place.district}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-white/8 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 text-xs leading-snug text-white/65">
            <span className="text-white/80">{log[0]?.text}</span>
            {log[0] ? <span className="tabular-nums"> · {dhakaDateTime(log[0].at)}</span> : null}
          </p>
          <button
            type="button"
            aria-expanded={logOpen}
            aria-controls={`${uid}-log`}
            onClick={() => setLogOpen((o) => !o)}
            className={cn("inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-signal-orange hover:underline lg:min-h-9", focusRing)}
          >
            Activity log ({num(log.length)})
            <Icon name={logOpen ? "expand_less" : "expand_more"} className="text-[18px]" />
          </button>
        </div>
        <ol id={`${uid}-log`} hidden={!logOpen} aria-label={`Activity log, ${name}`} className="mt-2 flex flex-col gap-2 border-l border-white/12 pl-3">
          {log.map((e, i) => (
            <li key={`${e.at}-${i}`} className="flex flex-col text-xs leading-snug">
              <span className="text-white/85">{e.text}</span>
              <time dateTime={new Date(e.at).toISOString()} className="text-white/65 tabular-nums">
                {dhakaDateTime(e.at)}
              </time>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

export function RecallListFallback() {
  return (
    <CommandPage title="Remove from sale" subtitle="Fake and dangerous products to pull from shelves now.">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </CommandPage>
  );
}
