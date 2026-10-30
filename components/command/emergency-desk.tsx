"use client";

import Link from "next/link";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIVISION_BY_ID } from "@/data/command/divisions";
import { acknowledge, dispatch, escalate } from "@/lib/command/actions";
import { ackWindowMs } from "@/lib/command/engine";
import { rankUnits } from "@/lib/command/geo";
import { safeTitleBn } from "@/lib/command/privacy";
import { bdDay, inDivision, sosQueue, type SosEntry } from "@/lib/command/selectors";
import { commandAct, perDivision, perWorld, selectNow, selectPoliceOpenIn, selectUnitsIn, useCommand } from "@/lib/command/store";
import type { ActionResult, DivisionId, Unit, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { DivisionPicker, DivisionScopeNote, divisionFocus, useDivision } from "./division-picker";
import { HelplineList } from "./emergency-helplines";
import { Bn, CategoryChip, EmptyState, Kpi, Panel, SeverityPill, Skeleton, UNIT_KIND_LABEL, cb, dhakaTime, focusRing, formatMin, mmss, num } from "./kit";
import { MapView } from "./map-view";
import { CommandPage } from "./shell";
import { useWide } from "./use-wide";

/**
 * /protibad/command/emergency: the Emergency desk. Every SOS press still
 * waiting for a unit, then every other critical police case nobody has
 * answered yet, each as a large card with its escalation countdown (30 s for
 * an SOS: ackWindowMs), how long it has waited, the three nearest free units
 * and one-press Dispatch nearest / Acknowledge / Escalate now / Open case.
 * Beside it the map (SOS emphasised, framed on the division or the located
 * case) and the national helplines. Division scope in ?div=. Uses
 * useSearchParams: render it inside <Suspense>.
 *
 * The map runs in privacy mode: the queue mixes SOS presses from women with
 * the rest, and the board never shows a survivor's exact point. Distances and
 * ETAs are measured from the true point.
 */

/* ───────────── the queue (module level, one memo per division) ───────────── */

interface Waiting extends SosEntry {
  /** An SOS press (else a critical police case). */
  sos: boolean;
  /** The case's acknowledgement window, for the countdown ring. */
  windowMs: number;
}

/** SOS presses first (soonest to escalate first), then the critical police cases still new or alerted, the same order. */
function emergencyQueue(w: World, d: DivisionId | undefined): Waiting[] {
  const sos: Waiting[] = sosQueue(w, w.now, d).map((e) => ({ ...e, sos: true, windowMs: ackWindowMs(e.case) }));
  const critical: Waiting[] = [];
  for (const c of w.cases) {
    if (c.dept !== "police" || c.category === "sos" || c.severity !== "critical" || (c.status !== "new" && c.status !== "alerted") || !inDivision(c, d)) continue;
    const windowMs = ackWindowMs(c);
    const p = c.alerts.find((a) => a.outcome === "pending");
    critical.push({
      case: c,
      msLeft: p ? Math.max(0, p.at + windowMs - w.now) : 0,
      waitedMs: Math.max(0, w.now - c.reportedAt),
      nearest: rankUnits(c.place, w.units, "police").slice(0, 3),
      sos: false,
      windowMs,
    });
  }
  critical.sort((a, b) => a.msLeft - b.msLeft || b.waitedMs - a.waitedMs || a.case.id.localeCompare(b.case.id));
  return [...sos, ...critical];
}

const selectQueue = perDivision(emergencyQueue);
const selectUnitIndex = perWorld((w) => new Map(w.units.map((u) => [u.id, u])));

/** The unit the case's pending alert went to, if any. */
function pendingUnit(e: Waiting, units: Map<string, Unit> | null): Unit | undefined {
  const p = e.case.alerts.find((a) => a.outcome === "pending");
  return p ? units?.get(p.unitId) : undefined;
}

interface DeskStats {
  sosWaiting: number;
  criticalWaiting: number;
  /** Median seconds from SOS press to first answer, today (Dhaka day); null before any. */
  medianSosSec: number | null;
  sosAnsweredToday: number;
  patrolsFree: number;
  patrolsOnDuty: number;
}

const selectStats = perDivision((w, d): DeskStats => {
  const today = bdDay(w.now);
  const s: DeskStats = { sosWaiting: 0, criticalWaiting: 0, medianSosSec: null, sosAnsweredToday: 0, patrolsFree: 0, patrolsOnDuty: 0 };
  const secs: number[] = [];
  for (const c of w.cases) {
    if (c.dept !== "police" || !inDivision(c, d)) continue;
    const waiting = c.status === "new" || c.status === "alerted";
    if (c.category === "sos") {
      if (waiting) s.sosWaiting++;
      if (c.firstAckAt !== undefined && bdDay(c.reportedAt) === today) secs.push((c.firstAckAt - c.reportedAt) / 1000);
    } else if (waiting && c.severity === "critical") s.criticalWaiting++;
  }
  for (const u of w.units) {
    if (u.dept !== "police" || u.kind !== "patrol" || !inDivision(u, d)) continue;
    if (u.status !== "off-duty") s.patrolsOnDuty++;
    if (u.status === "available") s.patrolsFree++;
  }
  s.sosAnsweredToday = secs.length;
  if (secs.length) {
    secs.sort((a, b) => a - b);
    const mid = secs.length >> 1;
    s.medianSosSec = secs.length % 2 ? secs[mid] : (secs[mid - 1] + secs[mid]) / 2;
  }
  return s;
});

/** Waiting cases per division and in all, for the picker's badges. */
const selectCounts = perWorld((w) => {
  const counts: Partial<Record<DivisionId | "all", number>> = { all: 0 };
  for (const e of emergencyQueue(w, undefined)) {
    const d = e.case.place.division;
    counts.all = (counts.all ?? 0) + 1;
    counts[d] = (counts[d] ?? 0) + 1;
  }
  return counts;
});

/** "42 s" under 90 seconds, else in minutes. */
function formatSec(s: number | null): string {
  if (s === null) return "—";
  return s < 90 ? `${Math.round(s)} s` : formatMin(s / 60);
}

/* ───────────── countdown ───────────── */

const R = 30;
const CIRC = 2 * Math.PI * R;
/** At or under this share of the window left the ring turns red. */
const LOW = 0.4;

/** A ring that empties over the acknowledgement window, gold then red as it runs low; m:ss in the middle. */
function Countdown({ msLeft, windowMs, queued }: { msLeft: number; windowMs: number; queued: boolean }) {
  const share = queued ? 0 : Math.min(1, msLeft / windowMs);
  const low = queued || share <= LOW;
  return (
    <div className="relative grid size-[4.5rem] shrink-0 place-items-center">
      <svg aria-hidden="true" viewBox="0 0 72 72" className="absolute inset-0 -rotate-90">
        <circle cx="36" cy="36" r={R} fill="none" strokeWidth="5" className="stroke-white/12" />
        <circle
          cx="36"
          cy="36"
          r={R}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - share)}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none", low ? "stroke-national-crimson" : "stroke-signal-orange")}
        />
      </svg>
      {queued ? (
        <span className="relative flex flex-col items-center text-xs font-semibold text-crimson-bright">
          <Icon name="hourglass_disabled" className="text-[20px]" />
          Queued
        </span>
      ) : (
        <span className="relative flex flex-col items-center leading-none">
          <span className={cn("font-grotesk text-lg font-bold tabular-nums", low ? "text-crimson-bright" : "text-white")}>
            <span className="sr-only">Escalates in </span>
            {mmss(msLeft)}
          </span>
          <span aria-hidden="true" className="mt-1 text-xs text-white/65">
            left
          </span>
        </span>
      )}
    </div>
  );
}

/* ───────────── one waiting case ───────────── */

/**
 * After an action the card usually leaves the queue (the case moved on), so
 * focus would fall to the page. Put it on the same card's first action if it
 * is still there, else on the card now in its place, else on the empty state.
 */
function refocusQueue(id: string, index: number): void {
  requestAnimationFrame(() => {
    const scope = document.getElementById("ed-queue");
    if (!scope) return;
    const first = (card: Element | undefined) => card?.querySelector<HTMLElement>("[data-sos-actions] button");
    const own = scope.querySelector(`[data-sos-card="${CSS.escape(id)}"]`);
    const cards = [...scope.querySelectorAll("[data-sos-card]")];
    const target = first(own ?? undefined) ?? first(cards[Math.min(index, cards.length - 1)]) ?? document.getElementById("ed-queue-empty");
    target?.focus({ preventScroll: false });
  });
}

function QueueCard({
  e,
  index,
  alerted,
  located,
  onOpen,
  onLocate,
  onDone,
}: {
  e: Waiting;
  index: number;
  /** The unit the pending alert went to. */
  alerted: Unit | undefined;
  located: boolean;
  onOpen(id: string): void;
  onLocate(id: string): void;
  onDone(message: string): void;
}) {
  const c = e.case;
  const id = c.id;
  const [failed, setFailed] = useState<{ status: string; message: string } | null>(null);
  const error = failed && failed.status === c.status ? failed.message : null;
  const queued = c.status !== "alerted";
  const nearest = e.nearest[0];
  const division = DIVISION_BY_ID[c.place.division];
  const run = (fn: (w: World, t: number) => ActionResult, done: string) => {
    const err = commandAct(fn);
    setFailed(err ? { status: c.status, message: err } : null);
    if (!err) {
      onDone(`Case ${id} ${done}.`);
      refocusQueue(id, index);
    }
  };
  const send = (unitId: string | undefined, name: string, eta: number | undefined) =>
    run((w, t) => dispatch(w, id, t, unitId), eta === undefined ? "dispatched" : `dispatched: ${name}, about ${eta} min away`);

  return (
    <li
      data-sos-card={id}
      className={cn(
        "relative rounded-2xl bg-text-primary p-4 ring-1 transition-[opacity,translate] duration-200 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-none sm:p-5",
        e.sos ? "ring-national-crimson/70" : "ring-white/12",
      )}
    >
      {/* A subtle pulsing red edge while an SOS waits; steady under reduced motion. */}
      {e.sos ? <span aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-2xl ring-2 ring-national-crimson motion-safe:animate-pulse" /> : null}
      {!e.sos ? <span aria-hidden="true" className="absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full bg-national-crimson" /> : null}

      <div className="flex items-start gap-4">
        <Countdown msLeft={e.msLeft} windowMs={e.windowMs} queued={queued} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            {e.sos ? (
              <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-national-crimson px-2 py-0.5 text-xs font-bold text-white">
                <Icon name="e911_emergency" className="text-[15px]" />
                SOS press
              </span>
            ) : (
              <>
                <SeverityPill severity="critical" />
                <CategoryChip category={c.category} />
              </>
            )}
            <span className="font-mono text-xs font-semibold text-white/70">{id}</span>
          </p>
          <h3 className="mt-2 min-w-0 text-xl leading-snug font-bold text-white">
            <Bn>{c.place.areaBn}</Bn>
          </h3>
          <p className="mt-0.5 text-xs text-white/65">
            {c.place.district} · <Bn>{division.nameBn}</Bn> division<span className="sr-only"> ({division.name})</span>
          </p>
          <p lang="bn" className="mt-1.5 truncate font-bengali text-sm text-white/80">
            {safeTitleBn(c)}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-black/35 px-3.5 py-3 text-sm ring-1 ring-white/8 sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs text-white/65">Waited</dt>
          <dd className={cn("font-grotesk font-bold tabular-nums", e.waitedMs >= e.windowMs ? "text-crimson-bright" : "text-white")}>{mmss(e.waitedMs)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-white/65">Reported</dt>
          <dd className="font-semibold text-white tabular-nums">{dhakaTime(c.reportedAt)}</dd>
        </div>
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <dt className="text-xs text-white/65">{queued ? "Status" : "Alerted"}</dt>
          <dd className="truncate font-semibold text-white">{queued ? "No unit answered yet" : (alerted?.name ?? "A unit, waiting for an answer")}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-white/65">Nearest free units</p>
        {e.nearest.length === 0 ? (
          <p className="rounded-xl px-3 py-2.5 text-sm text-white/80 ring-1 ring-white/10">No police unit is free nearby. Escalate, or call in a unit from the next station.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-white/8 rounded-xl ring-1 ring-white/10">
            {e.nearest.map((n, i) => (
              <li key={n.unit.id} className="flex items-center gap-3 px-3 py-2">
                <span className="w-4 shrink-0 text-xs font-semibold text-white/65 tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{n.unit.name}</span>
                  <span className="text-xs text-white/65 tabular-nums">
                    {UNIT_KIND_LABEL[n.unit.kind]} · {n.km.toFixed(1)} km · about {n.eta} min
                  </span>
                </span>
                {i > 0 ? (
                  <button type="button" onClick={() => send(n.unit.id, n.unit.name, n.eta)} aria-label={`Dispatch ${n.unit.name} to ${id}`} className={cb.quietSm}>
                    Send
                  </button>
                ) : (
                  <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-xs font-semibold text-white/85 ring-1 ring-white/12">Nearest</span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div data-sos-actions className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => send(nearest?.unit.id, nearest?.unit.name ?? "", nearest?.eta)}
          aria-label={nearest ? `Dispatch nearest unit, ${nearest.unit.name}, to ${id}` : `Dispatch to ${id}`}
          className={cn(cb.gold, "col-span-2 sm:flex-1")}
        >
          <Icon name="directions_car" className="text-[18px]" />
          Dispatch nearest
        </button>
        {c.status === "alerted" ? (
          <>
            <button type="button" onClick={() => run((w, t) => acknowledge(w, id, t), "acknowledged")} aria-label={`Acknowledge ${id}`} className={cb.outline}>
              <Icon name="how_to_reg" className="text-[18px]" />
              Acknowledge
            </button>
            <button type="button" onClick={() => run((w, t) => escalate(w, id, t), "escalated to the next unit")} aria-label={`Escalate ${id} now`} className={cb.quiet}>
              <Icon name="trending_up" className="text-[18px]" />
              Escalate now
            </button>
          </>
        ) : null}
        <button type="button" data-case-open={id} onClick={() => onOpen(id)} className={cb.quiet}>
          <Icon name="open_in_new" className="text-[18px]" />
          Open case
          <span className="sr-only"> {id}</span>
        </button>
        <button type="button" aria-pressed={located} onClick={() => onLocate(id)} aria-label={`Show ${id} on the map`} className={cn(cb.icon, "max-sm:w-full aria-pressed:bg-signal-orange aria-pressed:text-text-primary")}>
          <Icon name="my_location" className="text-[20px]" />
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-semibold text-white/85">
          <span aria-hidden="true" className="inline-flex shrink-0">
            <Icon name="error" className="text-[18px] text-crimson-bright" />
          </span>
          {error}
        </p>
      ) : null}
    </li>
  );
}

/* ───────────── announcer ───────────── */

const ANNOUNCE_EVERY_MS = 10_000;

/**
 * New SOS presses, politely and at most once every 10 s (the first queue seen
 * is the baseline); action results at once. One status region for both.
 */
function useAnnouncer(queue: Waiting[] | null, now: number | null): [RefObject<HTMLParagraphElement | null>, (m: string) => void] {
  const region = useRef<HTMLParagraphElement>(null);
  const say = useCallback((m: string) => {
    if (region.current) region.current.textContent = m;
  }, []);
  const known = useRef<Set<string> | null>(null);
  const waiting = useRef<Waiting[]>([]);
  const lastAt = useRef(0);
  useEffect(() => {
    if (queue === null) return;
    const sos = queue.filter((e) => e.sos);
    if (known.current === null) {
      known.current = new Set(sos.map((e) => e.case.id));
      return;
    }
    for (const e of sos) {
      if (known.current.has(e.case.id)) continue;
      known.current.add(e.case.id);
      waiting.current.push(e);
    }
    const t = Date.now();
    if (waiting.current.length === 0 || t - lastAt.current < ANNOUNCE_EVERY_MS || !region.current) return;
    const still = new Set(queue.map((e) => e.case.id));
    const fresh = waiting.current.filter((e) => still.has(e.case.id));
    waiting.current = [];
    const latest = fresh[fresh.length - 1];
    if (!latest) return;
    lastAt.current = t;
    const where = `${latest.case.place.district}, ${DIVISION_BY_ID[latest.case.place.division].name} division`;
    say(fresh.length > 1 ? `${fresh.length} new SOS presses. Latest in ${where}.` : `New SOS press in ${where}.`);
  }, [queue, now, say]);
  return [region, say];
}

/* ───────────── the desk ───────────── */

export function EmergencyDesk() {
  const [div] = useDivision();
  const [selected, setSelected] = useSelectedCase();
  const [located, setLocated] = useState<string | null>(null);
  const wide = useWide();
  const queue = useCommand(selectQueue(div));
  const stats = useCommand(selectStats(div));
  const counts = useCommand(selectCounts);
  const open = useCommand(selectPoliceOpenIn(div));
  const units = useCommand(selectUnitsIn(div));
  const now = useCommand(selectNow);
  const unitIndex = useCommand(selectUnitIndex);
  const [region, announce] = useAnnouncer(queue, now);

  // The map follows the located card, else the open case, while it is still an open police case here.
  const mapId = [located, selected].find((id) => id !== null && (open?.some((c) => c.id === id) ?? false)) ?? undefined;
  const locate = (id: string) => {
    setLocated((cur) => (cur === id ? null : id));
    if (!wide) document.getElementById("ed-map")?.scrollIntoView({ block: "nearest" });
  };

  const v = (x: number | null | undefined, fmt: (n: number) => string = num) => (x === null || x === undefined ? <Skeleton className="h-7 w-14" /> : fmt(x));

  return (
    <CommandPage
      title="Emergency desk"
      subtitle="Every SOS press and every critical police case still waiting for a unit, SOS first. Send the nearest unit in one press; a case nobody answers moves to the next unit when its window runs out (30 s for an SOS)."
      actions={
        <Link href="/protibad/command/women" className={cb.outline}>
          <Icon name="shield_person" className="text-[18px]" />
          Women safety
        </Link>
      }
    >
      <div className="flex flex-col gap-2">
        <DivisionPicker counts={counts ?? undefined} countLabel="waiting" />
        <DivisionScopeNote div={div}>{queue ? `${num(queue.length)} waiting` : null}</DivisionScopeNote>
      </div>

      <section aria-label="Key figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 lg:grid-cols-4 [&>div]:border-white/10 max-lg:[&>div:nth-child(-n+2)]:border-b max-lg:[&>div:nth-child(odd)]:border-r lg:[&>div:not(:last-child)]:border-r">
          <Kpi
            label="SOS waiting"
            icon="sos"
            value={stats ? <span className={stats.sosWaiting > 0 ? "text-crimson-bright" : undefined}>{num(stats.sosWaiting)}</span> : v(null)}
            sub={stats ? (stats.sosWaiting > 0 ? "Waiting for a unit now" : "None waiting") : null}
          />
          <Kpi
            label="Other critical waiting"
            icon="priority_high"
            value={v(stats?.criticalWaiting)}
            sub={stats ? "Police cases, no unit yet" : null}
          />
          <Kpi
            label="Median SOS response today"
            icon="timer"
            value={stats ? formatSec(stats.medianSosSec) : v(null)}
            sub={stats ? (stats.sosAnsweredToday ? `Press to first answer · ${num(stats.sosAnsweredToday)} answered` : "None answered yet today") : null}
          />
          <Kpi
            label="Patrols free"
            icon="local_police"
            value={v(stats?.patrolsFree)}
            sub={stats ? `of ${num(stats.patrolsOnDuty)} on duty in scope` : null}
          />
        </dl>
      </section>

      <p ref={region} role="status" aria-atomic="true" className="sr-only" />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel
          id="ed-queue-panel"
          title="Waiting now"
          icon="notifications_active"
          sub="SOS presses first, then critical cases; soonest to escalate on top"
          action={
            queue ? (
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ring-1", queue.some((e) => e.sos) ? "bg-national-crimson/20 text-crimson-bright ring-national-crimson/60" : "bg-white/8 text-white/85 ring-white/12")}>
                {num(queue.length)} waiting
              </span>
            ) : null
          }
          bodyClassName="px-3 sm:px-4"
        >
          <div id="ed-queue">
            {queue === null || now === null ? (
              <div aria-hidden="true" className="flex flex-col gap-3">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            ) : queue.length === 0 ? (
              <div id="ed-queue-empty" tabIndex={-1} className={cn("rounded-xl", focusRing)}>
                <EmptyState icon="verified_user" title="No SOS waiting">
                  New presses appear here within a second.
                </EmptyState>
              </div>
            ) : (
              <ol aria-label="Waiting cases, SOS first" className="flex flex-col gap-3">
                {queue.map((e, i) => (
                  <QueueCard
                    key={e.case.id}
                    e={e}
                    index={i}
                    alerted={pendingUnit(e, unitIndex)}
                    located={located === e.case.id}
                    onOpen={setSelected}
                    onLocate={locate}
                    onDone={announce}
                  />
                ))}
              </ol>
            )}
          </div>
        </Panel>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20">
          <Panel
            id="ed-map"
            title="Map"
            icon="public"
            sub={
              open ? (
                <span className="tabular-nums">{num(open.length)} open police cases · SOS ringed in red · positions shifted for privacy</span>
              ) : (
                <Skeleton className="h-3 w-56" />
              )
            }
            bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
          >
            <div className="relative h-80 border-y border-white/10 sm:h-[26rem] lg:h-[30rem]">
              <MapView
                className="absolute inset-0"
                cases={open ?? []}
                units={units ?? []}
                selectedId={mapId}
                onSelect={setSelected}
                focus={mapId ? "selection" : divisionFocus(div)}
                showUnits={["station", "patrol"]}
                sos
                privacy
              />
            </div>
            <ul aria-label="Map legend" className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
              {[
                { label: "SOS press", swatch: "size-3 rounded-full bg-national-crimson ring-2 ring-white outline-2 outline-offset-2 outline-national-crimson" },
                { label: "Police case", swatch: "size-3 rounded-full bg-signal-orange ring-2 ring-black outline outline-1 outline-white/30" },
                { label: "Police station", swatch: "size-3 rounded-sm bg-signal-orange" },
                { label: "Patrol", swatch: "size-2 rounded-full bg-bdnavy-300" },
              ].map((l) => (
                <li key={l.label} className="flex items-center gap-2 text-xs text-white/70">
                  <span aria-hidden="true" className="grid size-4 place-items-center">
                    <span className={cn("block", l.swatch)} />
                  </span>
                  {l.label}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="National helplines" icon="call" sub="Official shortcodes, free, 24 hours">
            <HelplineList />
          </Panel>
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="map" className="text-[16px]" />
        Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/** What the server and the first paint show before the world is read. */
export function EmergencyDeskFallback() {
  return (
    <CommandPage title="Emergency desk" subtitle="Loading the emergency desk…">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-2xl lg:h-[34rem]" />
        <Skeleton className="hidden h-96 rounded-2xl lg:block lg:h-[34rem]" />
      </div>
    </CommandPage>
  );
}
