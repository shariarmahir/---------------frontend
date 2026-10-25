"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { STATIONS } from "@/data/command/stations";
import { addNote } from "@/lib/command/actions";
import { CATEGORY_META } from "@/lib/command/routing";
import { filterCases, followUpsDue, isOpen, stationStats, type FollowUpDue } from "@/lib/command/selectors";
import { commandAct, perWorld, useCommand } from "@/lib/command/store";
import type { Case, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable } from "./case-table";
import { Bn, CONTROL, EmptyState, Kpi, OverduePill, Panel, STATUS_META, SelectField, Skeleton, cb, dhakaDateTime, focusRing, formatMin, num } from "./kit";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";
import { UnitRoster } from "./unit-roster";

/**
 * One police station's CRM page: its figures, an area map (approximate), its
 * patrols, the follow-ups that are due, a contact log per case with a form to
 * log a call or set a follow-up, and its open and closed cases. Uses
 * useSearchParams (the case drawer): render it inside <Suspense>.
 */

const selectNow = (w: World) => w.now;

/* ───────────── follow-ups due ───────────── */

function FollowUps({ items, onOpen }: { items: FollowUpDue[] | null; onOpen(id: string): void }) {
  const late = items ? items.filter((f) => f.overdue).length : 0;
  return (
    <Panel
      title="Follow-ups due"
      icon="event_upcoming"
      sub="Open follow-ups from case notes, soonest first"
      action={
        items && late > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-national-crimson/20 px-2.5 py-1 text-xs font-semibold text-crimson-bright ring-1 ring-national-crimson/70 tabular-nums">
            <Icon name="timer_off" className="text-[14px]" />
            {num(late)} overdue
          </span>
        ) : null
      }
    >
      {items === null ? (
        <div aria-hidden="true" className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="event_available" title="Nothing to follow up">
          When a note carries a follow-up time, it is listed here.
        </EmptyState>
      ) : (
        <ul aria-label="Follow-ups due" className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto overscroll-contain">
          {items.map((f, i) => {
            const overdue = f.overdue;
            return (
              <li key={`${f.case.id}-${f.at}-${i}`} className={cn("relative flex flex-col gap-1.5 rounded-xl bg-black/30 px-3.5 py-3 ring-1", overdue ? "ring-national-crimson/50" : "ring-white/10")}>
                {overdue ? <span aria-hidden="true" className="absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-r-full bg-national-crimson" /> : null}
                <p className="text-sm leading-relaxed text-white">{f.text}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/60">
                  <span className={cn("inline-flex items-center gap-1 font-semibold tabular-nums", overdue ? "text-crimson-bright" : "text-white/85")}>
                    <Icon name={overdue ? "alarm" : "event"} className="text-[14px]" />
                    {overdue ? "Was due " : "Due "}
                    {dhakaDateTime(f.dueAt)}
                  </span>
                  {overdue ? <OverduePill /> : null}
                  <button
                    type="button"
                    data-case-open={f.case.id}
                    onClick={() => onOpen(f.case.id)}
                    className={cn("inline-flex min-h-11 items-center gap-2 rounded-md font-mono font-semibold text-white/85 underline-offset-4 hover:text-signal-orange hover:underline lg:min-h-8", focusRing)}
                  >
                    <span className="sr-only">Open case </span>
                    {f.case.id}
                  </button>
                  <Bn className="min-w-0 truncate text-white/60">{f.case.titleBn}</Bn>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/* ───────────── contact log ───────────── */

const FOLLOW_UPS = [
  { value: "", label: "No follow-up" },
  { value: "15", label: "In 15 minutes" },
  { value: "60", label: "In 1 hour" },
  { value: "240", label: "In 4 hours" },
  { value: "1440", label: "Tomorrow, same time" },
];

interface LogEntry {
  at: number;
  text: string;
  followUpAt?: number;
  /** "note" for a note someone wrote; "step" for a step the operator took on the case. */
  kind: "note" | "step";
}

/** A case's contact log: its notes plus the steps the operator took, newest first. */
function contactLog(c: Case): LogEntry[] {
  const out: LogEntry[] = c.notes.map((n) => ({ at: n.at, text: n.text, followUpAt: n.followUpAt, kind: "note" }));
  // A note also writes a "note" timeline line: skip it, the note itself is listed above.
  for (const t of c.timeline) if (t.by === "operator" && t.kind !== "note") out.push({ at: t.at, text: t.text, kind: "step" });
  return out.sort((a, b) => b.at - a.at);
}

function ContactLog({ cases, now, onOpen }: { cases: Case[] | null; now: number | null; onOpen(id: string): void }) {
  const [pick, setPick] = useState("");
  const [text, setText] = useState("");
  const [follow, setFollow] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const current = cases?.find((c) => c.id === pick) ?? cases?.[0];
  const log = useMemo(() => (current ? contactLog(current) : []), [current]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!current) return;
    const mins = follow ? Number(follow) : undefined;
    const err = commandAct((w, t) => addNote(w, current.id, t, text, mins === undefined ? undefined : t + mins * 60_000));
    setError(err);
    setSaved(!err);
    if (!err) {
      setText("");
      setFollow("");
    }
  };

  return (
    <Panel title="Contact log" icon="contact_phone" sub="Calls made, people spoken to and follow-ups, case by case">
      {cases === null || now === null ? (
        <div aria-hidden="true" className="flex flex-col gap-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : cases.length === 0 || !current ? (
        <EmptyState icon="contact_phone" title="No cases at this station yet">
          A contact log opens for each case once one is assigned here.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          <SelectField
            label="Case"
            value={current.id}
            onChange={(v) => {
              setPick(v);
              setSaved(false);
              setError(null);
            }}
            options={cases.map((c) => ({ value: c.id, label: `${c.id} · ${CATEGORY_META[c.category].label} · ${STATUS_META[c.status].label}` }))}
          />

          <div className="flex items-center justify-between gap-3 rounded-xl bg-black/30 px-3.5 py-2.5 ring-1 ring-white/10">
            <Bn className="min-w-0 truncate text-sm font-semibold text-white">{current.titleBn}</Bn>
            <button type="button" data-case-open={current.id} onClick={() => onOpen(current.id)} className={cn(cb.quietSm, "shrink-0")}>
              Open case
            </button>
          </div>

          {log.length === 0 ? (
            <p className="rounded-xl px-4 py-5 text-center text-sm text-white/60 ring-1 ring-white/10 ring-inset">No contact logged on this case yet.</p>
          ) : (
            <ol aria-label={`Contact log for ${current.id}`} className="flex max-h-72 flex-col gap-2 overflow-y-auto overscroll-contain">
              {log.map((e, i) => {
                const late = e.followUpAt !== undefined && e.followUpAt < now;
                return (
                  <li key={`${e.at}-${i}`} className="flex gap-3 rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10">
                    <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 text-bdnavy-300">
                      <Icon name={e.kind === "note" ? "sticky_note_2" : "check_circle"} className="text-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed text-white">{e.text}</p>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/55 tabular-nums">
                        <span>
                          {dhakaDateTime(e.at)} · {e.kind === "note" ? "Note" : "By you"}
                        </span>
                        {e.followUpAt !== undefined ? (
                          <span className={cn("inline-flex items-center gap-1 font-semibold", late ? "text-crimson-bright" : "text-white/80")}>
                            <Icon name={late ? "alarm" : "event"} className="text-[14px]" />
                            {late ? "Follow-up was due " : "Follow up "}
                            {dhakaDateTime(e.followUpAt)}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <form onSubmit={submit} className="flex flex-col gap-2.5 border-t border-white/10 pt-4" aria-label="Log a call or follow-up">
            <label htmlFor="crm-log-text" className="text-sm font-semibold text-white/90">
              Log a call / follow-up
            </label>
            <textarea
              id="crm-log-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSaved(false);
              }}
              rows={3}
              placeholder="Who you spoke to, what was agreed, what comes next"
              className={cn(CONTROL, "min-h-20 py-2.5 leading-relaxed lg:min-h-20")}
            />
            <div className="flex flex-wrap items-end gap-2">
              <SelectField label="Follow-up" value={follow} onChange={setFollow} options={FOLLOW_UPS} className="min-w-44 flex-1" />
              <button type="submit" className={cb.gold}>
                <Icon name="add_call" className="text-[18px]" />
                Add to log
              </button>
            </div>
            {error ? (
              <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-white/85">
                <Icon name="error" className="shrink-0 text-[18px] text-crimson-bright" />
                {error}
              </p>
            ) : null}
            <p role="status" className="min-h-4 text-xs text-white/65">
              {saved ? "Added to the contact log." : ""}
            </p>
          </form>
        </div>
      )}
    </Panel>
  );
}

/* ───────────── the page ───────────── */

export function StationCrm({ stationId }: { stationId: string }) {
  const station = STATIONS.find((s) => s.id === stationId);
  const [selected, setSelected] = useSelectedCase();

  const selectAll = useMemo(() => perWorld((w: World) => filterCases(w, { homeId: stationId })), [stationId]);
  const selectStats = useMemo(() => perWorld((w: World) => stationStats(w, stationId)), [stationId]);
  const selectFollowUps = useMemo(() => perWorld((w: World) => followUpsDue(w, stationId, w.now)), [stationId]);
  const selectUnits = useMemo(() => perWorld((w: World) => w.units.filter((u) => u.homeId === stationId)), [stationId]);
  const all = useCommand(selectAll);
  const stats = useCommand(selectStats);
  const units = useCommand(selectUnits);
  const followUps = useCommand(selectFollowUps);
  const now = useCommand(selectNow);

  const open = useMemo(() => all?.filter(isOpen) ?? null, [all]);
  const closed = useMemo(() => (all ? all.filter((c) => !isOpen(c)).sort((a, b) => (b.resolvedAt ?? b.reportedAt) - (a.resolvedAt ?? a.reportedAt)) : null), [all]);
  const overdue = followUps ? followUps.filter((f) => f.overdue).length : null;
  // Open cases first for the contact log's case picker.
  const logCases = useMemo(() => (open && closed ? [...open, ...closed] : null), [open, closed]);

  if (!station) return null;
  const free = stats?.patrols.filter((p) => p.status === "available").length ?? 0;
  const v = (x: string | number | null | undefined) => (x === null || x === undefined ? <Skeleton className="h-7 w-14" /> : typeof x === "number" ? num(x) : x);

  return (
    <CommandPage
      title={station.name}
      subtitle={
        <>
          <Bn className="text-base font-semibold text-white/90">{station.nameBn}</Bn> · The station&apos;s case file, patrols and follow-ups in one place.
        </>
      }
      actions={
        <Link href="/protibad/command/police/stations" className={cb.outline}>
          <Icon name="arrow_back" className="text-[18px]" />
          All stations
        </Link>
      }
    >
      <section aria-label="Station figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 divide-white/10 sm:grid-cols-3 xl:grid-cols-5 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+4)]:border-b max-sm:[&>div:nth-child(odd)]:border-r max-sm:[&>div:last-child]:col-span-2 max-sm:[&>div:last-child]:border-r-0 sm:max-xl:[&>div:nth-child(-n+3)]:border-b sm:max-xl:[&>div:not(:nth-child(3n))]:border-r xl:[&>div:not(:last-child)]:border-r">
          <Kpi label="Open cases" icon="folder_open" value={v(stats?.open)} sub={stats ? "Each a task until closed" : null} />
          <Kpi label="Closed cases" icon="inventory" value={v(stats?.closed)} sub={stats ? "Resolved and filed" : null} />
          <Kpi label="Median first response" icon="timer" value={stats ? formatMin(stats.medianFirstResponseMin) : v(null)} sub={stats ? "Report to first answer" : null} />
          <Kpi label="Patrols free" icon="directions_car" value={stats ? `${num(free)} of ${num(stats.patrols.length)}` : v(null)} sub={stats ? "Ready to be sent" : null} />
          <Kpi
            label="Follow-ups due"
            icon="event_upcoming"
            value={v(followUps?.length)}
            sub={
              followUps ? (
                overdue ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-crimson-bright">
                    <Icon name="timer_off" className="text-[14px]" />
                    {num(overdue)} overdue
                  </span>
                ) : (
                  "None overdue"
                )
              ) : null
            }
          />
        </dl>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel
          title="Area map"
          icon="public"
          sub={
            <>
              <strong className="font-semibold text-white/85">Approximate location</strong> · {station.lat.toFixed(3)}°N, {station.lng.toFixed(3)}°E · open cases around the station
            </>
          }
          bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
        >
          <MapView
            className="h-72 border-t border-white/10 sm:h-96 lg:h-auto lg:min-h-[26rem] lg:flex-1"
            cases={open ?? []}
            units={units ?? []}
            selectedId={selected ?? undefined}
            onSelect={setSelected}
            focus={selected ? "selection" : { lat: station.lat, lng: station.lng, zoom: 13 }}
            showUnits={["station", "patrol"]}
          />
        </Panel>
        <UnitRoster homeId={stationId} onOpen={setSelected} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <FollowUps items={followUps} onOpen={setSelected} />
        <ContactLog cases={logCases} now={now} onOpen={setSelected} />
      </div>

      <Panel title="Open cases" icon="folder_open" sub="Critical first, then newest. Select a case to work it.">
        <CaseTable cases={open} onOpen={setSelected} caption={`Open cases at ${station.name}`} empty="No open cases at this station." />
      </Panel>

      <Panel title="Closed cases" icon="inventory" sub="Most recently resolved first">
        <CaseTable cases={closed} onOpen={setSelected} caption={`Closed cases at ${station.name}`} empty="No closed cases yet." />
      </Panel>

      <p className="flex items-center gap-2 text-xs text-white/50">
        <Icon name="map" className="text-[16px]" />
        Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

export function StationCrmFallback() {
  return (
    <CommandPage title="Station" subtitle="Loading the station file…">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </CommandPage>
  );
}
