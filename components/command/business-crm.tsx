"use client";

import Link from "next/link";
import { type FormEvent, useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { BUSINESSES } from "@/data/command/consumer";
import { addNote, MAX_FINE_TK } from "@/lib/command/actions";
import { safeTitleBn } from "@/lib/command/privacy";
import { CATEGORY_META } from "@/lib/command/routing";
import { businessHistory, isOpen } from "@/lib/command/selectors";
import { commandAct, perWorld, selectNow, selectOffices, useCommand } from "@/lib/command/store";
import type { Case, NoteKind, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable } from "./case-table";
import {
  Bn,
  CONTROL,
  EmptyState,
  FOLLOW_UPS,
  Kpi,
  Panel,
  RepeatPill,
  SelectField,
  Skeleton,
  businessKind,
  cb,
  dhakaDateTime,
  focusRing,
  followUpAt,
  num,
  taka,
  timeAgo,
} from "./kit";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";

/**
 * One (fictional) business's CRM page: figures, an approximate location map,
 * the inspection / warning / fine log built from its cases' notes and visits
 * (newest first, fines added up), a form to log an outcome on its latest open
 * case, and the full case history. Uses useSearchParams (the case drawer):
 * render it inside <Suspense>.
 */


/* ───────────── the inspection log ───────────── */

type EntryKind = NoteKind | "note" | "visit";

const ENTRY: Record<EntryKind, { label: string; icon: string }> = {
  inspection: { label: "Inspection", icon: "fact_check" },
  warning: { label: "Warning", icon: "warning" },
  fine: { label: "Fine", icon: "payments" },
  sealed: { label: "Sealed", icon: "lock" },
  call: { label: "Call", icon: "call" },
  note: { label: "Note", icon: "sticky_note_2" },
  visit: { label: "Team on scene", icon: "location_on" },
};

interface Entry {
  key: string;
  at: number;
  kind: EntryKind;
  text: string;
  amountTk?: number;
  caseId: string;
  titleBn: string;
}

/** Every note on the business's cases, plus the visits (a team arriving), newest first. */
function logEntries(cases: readonly Case[]): Entry[] {
  const out: Entry[] = [];
  for (const c of cases) {
    c.notes.forEach((n, i) =>
      out.push({
        key: `${c.id}-n${i}`,
        at: n.at,
        kind: n.kind ?? "note",
        text: n.text,
        amountTk: n.amountTk,
        caseId: c.id,
        titleBn: safeTitleBn(c),
      }),
    );
    c.timeline.forEach((t, i) => {
      if (t.kind === "arrived")
        out.push({
          key: `${c.id}-t${i}`,
          at: t.at,
          kind: "visit",
          text: t.text,
          caseId: c.id,
          titleBn: safeTitleBn(c),
        });
    });
  }
  return out.sort((a, b) => b.at - a.at || a.key.localeCompare(b.key));
}

function InspectionLog({ entries, onOpen, className }: { entries: Entry[] | null; onOpen(id: string): void; className?: string }) {
  const fines = entries?.filter((e) => e.kind === "fine" && e.amountTk !== undefined) ?? [];
  const total = fines.reduce((s, e) => s + (e.amountTk ?? 0), 0);
  return (
    <Panel
      title="Inspection log"
      icon="fact_check"
      sub="Visits, warnings, seals and fines across all its cases, newest first"
      className={className}
      action={
        entries && fines.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/90 tabular-nums ring-1 ring-white/12">
            <Icon name="payments" className="text-[14px] text-bdnavy-300" />
            {taka(total)} in {num(fines.length)} {fines.length === 1 ? "fine" : "fines"}
          </span>
        ) : null
      }
    >
      {entries === null ? (
        <div aria-hidden="true" className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon="fact_check" title="Nothing logged yet">
          Inspection visits, warnings, seals and fines will be listed here.
        </EmptyState>
      ) : (
        <ol aria-label="Inspection log" className="flex flex-col gap-2">
          {entries.map((e) => {
            const m = ENTRY[e.kind];
            return (
              <li key={e.key} className="flex gap-3 rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10">
                <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 text-bdnavy-300">
                  <Icon name={m.icon} className="text-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex min-h-6 items-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-semibold text-white ring-1 ring-white/15">{m.label}</span>
                    {e.amountTk !== undefined ? <span className="font-grotesk text-sm font-bold text-white tabular-nums">{taka(e.amountTk)}</span> : null}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white">{e.text}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/65 tabular-nums">
                    <span>{dhakaDateTime(e.at)}</span>
                    <button
                      type="button"
                      data-case-open={e.caseId}
                      onClick={() => onOpen(e.caseId)}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-md font-mono font-semibold text-white/85 underline-offset-4 hover:text-signal-orange hover:underline lg:min-h-8",
                        focusRing,
                      )}
                    >
                      <span className="sr-only">Open case </span>
                      {e.caseId}
                    </button>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

/* ───────────── log an outcome ───────────── */

const OUTCOMES: { value: NoteKind; label: string }[] = [
  { value: "inspection", label: "Inspection finding" },
  { value: "warning", label: "Warning issued" },
  { value: "fine", label: "Fine imposed" },
  { value: "sealed", label: "Premises sealed" },
  { value: "call", label: "Call made" },
];

function LogOutcome({ target, onOpen, className }: { target: Case | null | undefined; onOpen(id: string): void; className?: string }) {
  const uid = useId();
  const [kind, setKind] = useState<NoteKind>("inspection");
  const [amount, setAmount] = useState("");
  const [text, setText] = useState("");
  const [follow, setFollow] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!target) return;
    let amountTk: number | undefined;
    if (kind === "fine") {
      const digits = amount.replace(/[,\s৳]/g, "");
      if (!/^\d+$/.test(digits)) {
        setError("Enter the fine in whole taka, for example 25000.");
        setSaved("");
        return;
      }
      amountTk = Number(digits);
    }
    const err = commandAct((w, t) => addNote(w, target.id, t, text, followUpAt(t, follow), { kind, amountTk }));
    setError(err);
    setSaved(err ? "" : kind === "fine" && amountTk !== undefined ? `Fine of ${taka(amountTk)} added to the log.` : "Added to the log.");
    if (!err) {
      setText("");
      setAmount("");
      setFollow("");
    }
  };

  return (
    <Panel title="Log an outcome" icon="edit_note" sub="Added to the business's newest open case" className={className}>
      {target === undefined ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : target === null ? (
        <EmptyState icon="task_alt" title="No open case">
          Outcomes are logged on an open case. When a new complaint names this business, the form opens here.
        </EmptyState>
      ) : (
        <form onSubmit={submit} aria-label="New inspection log entry" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-black/30 px-3.5 py-2.5 ring-1 ring-white/10">
            <span className="flex min-w-0 flex-col">
              <span className="font-mono text-xs font-semibold text-white/85">{target.id}</span>
              <Bn className="truncate text-sm font-semibold text-white">{target.titleBn}</Bn>
            </span>
            <button type="button" data-case-open={target.id} onClick={() => onOpen(target.id)} className={cn(cb.quietSm, "shrink-0")}>
              Open case
            </button>
          </div>
          <div className={cn("grid gap-3", kind === "fine" ? "sm:grid-cols-2" : "")}>
            <SelectField
              label="Outcome"
              value={kind}
              onChange={(v) => {
                setKind(v as NoteKind);
                setSaved("");
                setError(null);
              }}
              options={OUTCOMES}
            />
            {kind === "fine" ? (
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-xs font-semibold text-white/65">Fine amount (৳)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSaved("");
                  }}
                  placeholder="25000"
                  aria-describedby={`${uid}-amount`}
                  className={CONTROL}
                />
                <span id={`${uid}-amount`} className="text-xs text-white/65">
                  Whole taka, up to {taka(MAX_FINE_TK)}
                </span>
              </label>
            ) : null}
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-white/65">What was found or done</span>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSaved("");
              }}
              rows={3}
              placeholder="Findings, what was said, what the owner must do next"
              className={cn(CONTROL, "min-h-20 py-2.5 leading-relaxed lg:min-h-20")}
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <SelectField label="Follow-up" value={follow} onChange={setFollow} options={FOLLOW_UPS} className="min-w-44 flex-1" />
            <button type="submit" className={cb.gold}>
              <Icon name="add_task" className="text-[18px]" />
              Add to log
            </button>
          </div>
          {error ? (
            <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-white/85">
              <span aria-hidden="true" className="inline-flex shrink-0">
                <Icon name="error" className="text-[18px] text-crimson-bright" />
              </span>
              {error}
            </p>
          ) : null}
          <p role="status" className="min-h-4 text-xs text-white/65">
            {saved}
          </p>
        </form>
      )}
    </Panel>
  );
}

/* ───────────── the page ───────────── */

export function BusinessCrm({ businessId }: { businessId: string }) {
  const business = BUSINESSES.find((b) => b.id === businessId);
  const [selected, setSelected] = useSelectedCase();

  const selectHistory = useMemo(() => perWorld((w: World) => businessHistory(w, businessId)), [businessId]);
  const history = useCommand(selectHistory);
  const offices = useCommand(selectOffices);
  const now = useCommand(selectNow);

  const cases = history?.cases ?? null;
  const open = useMemo(() => cases?.filter(isOpen) ?? null, [cases]);
  const entries = useMemo(() => (cases ? logEntries(cases) : null), [cases]);
  const homes = useMemo(() => {
    const ids = new Set(cases?.map((c) => c.homeId));
    return (offices ?? []).filter((o) => ids.has(o.id));
  }, [cases, offices]);
  // Newest open case first (history is newest first); null when none is open, undefined while loading.
  const target = open === null ? undefined : (open[0] ?? null);
  const here = selected !== null && (cases?.some((c) => c.id === selected) ?? false);

  const pins = useMemo(
    () =>
      business
        ? [
            {
              id: business.id,
              lat: business.lat,
              lng: business.lng,
              label: `${business.nameBn} (${business.name})`,
            },
          ]
        : [],
    [business],
  );

  if (!business) return null;
  const kind = businessKind(business.kind);
  const total = cases?.length ?? 0;
  const fines = entries?.filter((e) => e.kind === "fine" && e.amountTk !== undefined) ?? [];
  const finesTk = fines.reduce((s, e) => s + (e.amountTk ?? 0), 0);
  const outcomes = entries?.filter((e) => e.kind === "inspection" || e.kind === "warning" || e.kind === "sealed" || e.kind === "fine").length ?? 0;
  const last = cases?.[0];
  const v = (x: string | number | null | undefined) => (x === null || x === undefined ? <Skeleton className="h-7 w-14" /> : typeof x === "number" ? num(x) : x);

  return (
    <CommandPage
      title={business.name}
      subtitle={
        <>
          <Bn className="text-base font-semibold text-white/90">{business.nameBn}</Bn> · {kind.label} · {business.district} ·{" "}
          <strong className="font-semibold text-white/90">Fictional business for demonstration.</strong>
        </>
      }
      actions={
        <Link href="/protibad/command/consumer/businesses" className={cb.outline}>
          <Icon name="arrow_back" className="text-[18px]" />
          All businesses
        </Link>
      }
    >
      <section aria-label="Business figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 divide-white/10 xl:grid-cols-5 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+4)]:border-b max-sm:[&>div:nth-child(odd)]:border-r max-sm:[&>div:last-child]:col-span-2 max-sm:[&>div:last-child]:border-r-0 sm:grid-cols-6 sm:max-xl:[&>div:nth-child(-n+3)]:col-span-2 sm:max-xl:[&>div:nth-child(n+4)]:col-span-3 sm:max-xl:[&>div:nth-child(-n+3)]:border-b sm:max-xl:[&>div:not(:nth-child(3)):not(:last-child)]:border-r xl:[&>div:not(:last-child)]:border-r">
          <Kpi
            label="Cases filed"
            icon="folder_copy"
            value={v(cases ? total : null)}
            sub={cases ? (total >= 2 ? <RepeatPill cases={total} /> : total === 1 ? "First complaint" : "None filed") : null}
          />
          <Kpi label="Open cases" icon="folder_open" value={v(open?.length)} sub={open ? "Each a task until closed" : null} />
          <Kpi
            label="Fines imposed"
            icon="payments"
            value={entries ? taka(finesTk) : v(null)}
            sub={entries ? `${num(fines.length)} ${fines.length === 1 ? "fine" : "fines"} on record` : null}
          />
          <Kpi label="Inspection outcomes" icon="fact_check" value={v(entries ? outcomes : null)} sub={entries ? "Findings and fines" : null} />
          <Kpi
            label="Last case"
            icon="schedule"
            value={cases && now !== null ? last ? <span className="text-2xl whitespace-nowrap">{timeAgo(last.reportedAt, now)}</span> : "—" : v(null)}
            sub={
              last ? (
                <span lang="bn" className="font-bengali">
                  {CATEGORY_META[last.category].labelBn}
                </span>
              ) : cases ? (
                "Nothing filed yet"
              ) : null
            }
          />
        </dl>
      </section>

      {/*
        Two columns from xl (map and history | log and form). Whichever column is taller, the other ends
        level with it: the map (left) and the form panel (right) stretch, so a short case history never
        leaves a blank block. One column below xl, in the order map, log, form, history.
      */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="flex min-w-0 flex-col gap-4 max-xl:contents">
          <Panel
            title="Location"
            icon="public"
            sub={
              <>
                <strong className="font-semibold text-white/85">Approximate location</strong> · {business.lat.toFixed(3)}°N, {business.lng.toFixed(3)}°E · {business.district}
              </>
            }
            className="max-xl:order-1 xl:flex-1"
            bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
          >
            <MapView
              className="h-72 border-t border-white/10 sm:h-96 xl:h-auto xl:min-h-[24rem] xl:flex-1"
              cases={cases ?? []}
              units={homes}
              selectedId={here ? (selected ?? undefined) : undefined}
              onSelect={setSelected}
              focus={here ? "selection" : { lat: business.lat, lng: business.lng, zoom: 15 }}
              showUnits={["office"]}
              pins={pins}
            />
            <p className="px-4 py-3 text-xs text-white/65 sm:px-5">
              The shop square is the business; dots are its cases (open ones solid); plain squares are the district offices that own them.
              {cases && total === 0 ? " No case has been filed yet." : ""}
            </p>
          </Panel>
          <Panel title="Case history" icon="history" sub="Every complaint against this business, newest first" className="max-xl:order-4">
            <CaseTable
              cases={cases}
              onOpen={setSelected}
              columns={["id", "category", "severity", "status", "age"]}
              caption={`Cases against ${business.name}`}
              empty="No complaint has been filed against this business."
            />
          </Panel>
        </div>
        <div className="flex min-w-0 flex-col gap-4 max-xl:contents">
          {/* The log keeps its natural height; the form panel below it stretches so both columns end level. */}
          <InspectionLog entries={entries} onOpen={setSelected} className="max-xl:order-2" />
          <LogOutcome target={target} onOpen={setSelected} className="flex-1 max-xl:order-3" />
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="map" className="text-[16px]" />
        This business is fictional and does not stand for any real shop, brand or person. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

export function BusinessCrmFallback() {
  return (
    <CommandPage title="Business" subtitle="Loading the business file…">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </CommandPage>
  );
}
