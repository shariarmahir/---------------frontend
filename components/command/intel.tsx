"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIVISION_BY_ID, isDivisionId } from "@/data/command/divisions";
import { AREAS } from "@/lib/command/history";
import { THREAT_THRESHOLDS, categoryLabels, type DivisionThreat, type EarlyWarning, type Network, type Recommendation, type ThreatLevel, type WarningLevel } from "@/lib/command/intel";
import { CATEGORY_META } from "@/lib/command/routing";
import { inDivision, isOpen } from "@/lib/command/selectors";
import {
  perDivision,
  perWorld,
  selectDivisionThreat,
  selectEarlyWarnings,
  selectHotspots,
  selectHourPattern,
  selectNetworks,
  selectNow,
  selectPoliceOpenIn,
  selectRecommendations,
  selectUnitsIn,
  useCommand,
} from "@/lib/command/store";
import type { Case, InvolvedKind } from "@/lib/command/types";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { DivisionPicker, DivisionScopeNote, divisionFocus, useDivision, type DivisionScope } from "./division-picker";
import { Bn, CategoryChip, EmptyState, Panel, Skeleton, StatusPill, cb, focusRing, num, timeAgo } from "./kit";
import { MapView, type HeatSpot, type MapViewProps } from "./map-view";
import { ScrollCue } from "./scroll-cue";
import { CommandPage } from "./shell";

/**
 * /protibad/command/intel: crime intelligence. Detect early, act before harm
 * spreads. The situation in all eight divisions; early warnings (areas rising
 * against their usual rate, SOS waiting) beside a hotspot map; the actions the
 * data points to; the rings and gangs linked across stations (?group= opens
 * and scrolls to one); and the 30-day hour × category pattern. Everything is
 * scoped by ?div= and read from lib/command/intel through the store. Uses
 * useSearchParams: render it inside <Suspense>.
 */

/* ───────────── labels ───────────── */

const THREAT_META: Record<ThreatLevel, { label: string; icon: string; pill: string; fill: string }> = {
  calm: { label: "Calm", icon: "check_circle", pill: "text-white/80 ring-1 ring-white/20", fill: "bg-white/45" },
  watch: { label: "Watch", icon: "visibility", pill: "bg-bdnavy-700 text-white ring-1 ring-bdnavy-400/50", fill: "bg-bdnavy-300" },
  alert: { label: "Alert", icon: "warning", pill: "bg-signal-orange text-text-primary", fill: "bg-signal-orange" },
  critical: { label: "Critical", icon: "crisis_alert", pill: "bg-national-crimson text-white", fill: "bg-national-crimson" },
};

const WARN_META: Record<WarningLevel, { label: string; icon: string; pill: string }> = {
  watch: { label: "Watch", icon: "visibility", pill: "bg-bdnavy-700 text-white ring-1 ring-bdnavy-400/50" },
  alert: { label: "Alert", icon: "warning", pill: "bg-signal-orange text-text-primary" },
  critical: { label: "Critical", icon: "crisis_alert", pill: "bg-national-crimson text-white" },
};

const INVOLVED_LABEL: Record<InvolvedKind, string> = {
  ring: "Organised ring",
  gang: "Gang",
  repeat: "Repeat offender",
  individual: "Individual",
  unknown: "Unknown",
};
const INVOLVED_ORDER: readonly InvolvedKind[] = ["ring", "gang", "repeat", "individual", "unknown"];

const PILL = "inline-flex min-h-6 shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

function LevelPill({ level, kind }: { level: ThreatLevel | WarningLevel; kind: "threat" | "warning" }) {
  const m = kind === "threat" ? THREAT_META[level as ThreatLevel] : WARN_META[level as WarningLevel];
  return (
    <span className={cn(PILL, m.pill)}>
      <Icon name={m.icon} className="text-[14px]" />
      {m.label}
    </span>
  );
}

/** "ঢাকা" with the English name for screen readers. */
function DivisionName({ id, className }: { id: string; className?: string }) {
  if (!isDivisionId(id)) return <span className={className}>{id}</span>;
  return (
    <span className={className}>
      <Bn>{DIVISION_BY_ID[id].nameBn}</Bn>
      <span className="sr-only"> ({DIVISION_BY_ID[id].name})</span>
    </span>
  );
}

/* ───────────── selectors ───────────── */

const selectCaseIndex = perWorld((w) => new Map(w.cases.map((c) => [c.id, c])));
const selectStationNames = perWorld((w) => new Map(w.units.filter((u) => u.kind === "station").map((u) => [u.id, u.name])));

/** Hotspots of the scope as map heat, each with its early-warning level (none for an area that is not rising). */
const selectHeat = perDivision((w, d): HeatSpot[] => {
  const level = new Map(selectEarlyWarnings(d)(w).map((x) => [x.area, x.level]));
  return selectHotspots(d)(w).map((h) => ({
    id: `hs-${h.area}`,
    lat: h.lat,
    lng: h.lng,
    weight: h.count,
    label: `${h.areaBn}: ${h.count} police case${h.count === 1 ? "" : "s"} in the last hour`,
    level: level.get(h.area),
  }));
});

/** Who is behind the open police cases of the scope, by kind of actor (no other detail is ever recorded). */
const selectInvolvement = perDivision((w, d) => {
  const by: Record<InvolvedKind | "none", number> = { ring: 0, gang: 0, repeat: 0, individual: 0, unknown: 0, none: 0 };
  for (const c of w.cases) {
    if (c.dept !== "police" || !isOpen(c) || !inDivision(c, d)) continue;
    by[c.involved?.kind ?? "none"]++;
  }
  return by;
});

/* ───────────── case lists ───────────── */

/** Case numbers that open the drawer; only the category and area are shown (never a name or exact point). */
function CaseLinks({ ids, index, onOpen, label }: { ids: string[]; index: Map<string, Case> | null; onOpen(id: string): void; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-col divide-y divide-white/8">
      {ids.map((id) => {
        const c = index?.get(id);
        return (
          <li key={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5">
            {c ? (
              <button
                type="button"
                data-case-open={id}
                onClick={() => onOpen(id)}
                className={cn("inline-flex min-h-11 items-center rounded-md font-mono text-xs font-semibold text-white underline-offset-4 hover:text-signal-orange hover:underline lg:min-h-9", focusRing)}
              >
                <span className="sr-only">Open case </span>
                {id}
              </button>
            ) : (
              <span className="inline-flex min-h-11 items-center font-mono text-xs text-white/65 lg:min-h-9">
                {id}
                <span className="ml-2 font-sans">archived</span>
              </span>
            )}
            {c ? (
              <>
                <CategoryChip category={c.category} className="min-w-0" />
                <Bn className="text-xs text-white/65">{c.place.areaBn}</Bn>
                <StatusPill status={c.status} className="ml-auto" />
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/* ───────────── current situation ───────────── */

/** The threat score on a scale to 1.5× the critical cut-off, with the three cut-offs marked. */
const GAUGE_MAX = THREAT_THRESHOLDS.critical * 1.5;

function Gauge({ score, level }: { score: number; level: ThreatLevel }) {
  const reduced = useReducedMotion();
  const t = Math.min(1, Math.max(0, score / GAUGE_MAX));
  return (
    <span aria-hidden="true" className="relative block h-2.5 overflow-hidden rounded-full bg-white/10">
      <motion.span
        className={cn("absolute inset-0 origin-left rounded-full", THREAT_META[level].fill)}
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: t }}
        transition={reduced ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      {[THREAT_THRESHOLDS.watch, THREAT_THRESHOLDS.alert, THREAT_THRESHOLDS.critical].map((x) => (
        <span key={x} className="absolute inset-y-0 w-0.5 bg-black/70" style={{ left: `${(x / GAUGE_MAX) * 100}%` }} />
      ))}
    </span>
  );
}

function ThreatCard({ t, on, onPick }: { t: DivisionThreat; on: boolean; onPick(): void }) {
  const d = DIVISION_BY_ID[t.division];
  // [label, hidden rest of the label, count, urgent]
  const rows: [string, string, number, boolean][] = [
    ["Open", "", t.open, false],
    ["Critical", "", t.critical, t.critical > 0 && t.level === "critical"],
    ["Overdue", "", t.overdue, t.overdue > 0],
    ["SOS", " waiting", t.sosWaiting, t.sosWaiting > 0],
    ["Hotspots", "", t.hotspots, false],
  ];
  return (
    <li
      className={cn(
        "relative flex min-w-0 flex-col gap-3 rounded-xl bg-black/30 px-3.5 py-3 ring-1 transition-shadow motion-reduce:transition-none",
        on ? "ring-2 ring-signal-orange" : t.level === "critical" ? "ring-national-crimson/70" : "ring-white/10 hover:ring-white/25",
      )}
    >
      {t.level === "critical" ? <span aria-hidden="true" className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-national-crimson" /> : null}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0">
          <button
            type="button"
            aria-pressed={on}
            onClick={onPick}
            className={cn("rounded-md text-left after:absolute after:inset-0 after:rounded-xl after:content-['']", focusRing)}
          >
            <Bn className="block text-base leading-tight font-bold text-white">{d.nameBn}</Bn>
            <span className="text-xs text-white/65">
              {d.name}
              <span className="sr-only">
                {" "}
                division, {THREAT_META[t.level].label}, score {t.score}
                {on ? ", showing" : ""}
              </span>
            </span>
          </button>
        </h3>
        <LevelPill level={t.level} kind="threat" />
      </div>
      <div className="flex items-center gap-3">
        <span className="font-grotesk text-2xl leading-none font-bold text-white tabular-nums">{t.score.toFixed(1)}</span>
        <span className="min-w-0 flex-1">
          <Gauge score={t.score} level={t.level} />
        </span>
      </div>
      <dl className="grid grid-cols-5 gap-x-2 gap-y-1.5 text-xs lg:grid-cols-3">
        {rows.map(([label, rest, n, urgent]) => (
          <div key={label} className="min-w-0">
            <dt className="truncate text-white/65">
              {label}
              {rest ? <span className="sr-only">{rest}</span> : null}
            </dt>
            <dd className={cn("font-semibold tabular-nums", urgent ? "text-crimson-bright" : "text-white")}>{num(n)}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

function Situation({ threat, div, setDiv }: { threat: DivisionThreat[] | null; div: DivisionScope; setDiv(d: DivisionScope): void }) {
  return (
    <Panel
      title="Current situation"
      icon="radar"
      sub="Each division against its own usual load. Select one to scope the page; select it again for all of Bangladesh."
    >
      {threat === null ? (
        <div aria-hidden="true" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <ul aria-label="Divisions" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {threat.map((t) => (
            <ThreatCard key={t.division} t={t} on={div === t.division} onPick={() => setDiv(div === t.division ? "all" : t.division)} />
          ))}
        </ul>
      )}
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/65">
        <span aria-hidden="true" className="inline-flex shrink-0 pt-px">
          <Icon name="info" className="text-[16px] text-bdnavy-300" />
        </span>
        <span>
          The score adds open critical cases, three for each overdue case and each SOS still waiting, one for each early warning on watch and three for each on alert or
          critical, then divides by the division&apos;s usual load for this hour, so a big division is not alarming just for being big. Below{" "}
          {THREAT_THRESHOLDS.watch} is calm, from {THREAT_THRESHOLDS.watch} watch, from {THREAT_THRESHOLDS.alert} alert and from {THREAT_THRESHOLDS.critical} critical;
          three or more overdue cases make a division at least alert. The marks on each gauge are those cut-offs.
        </span>
      </p>
    </Panel>
  );
}

/* ───────────── early warnings ───────────── */

function Warnings({
  warnings,
  now,
  spot,
  onSpot,
  onOpen,
  index,
  className,
}: {
  warnings: EarlyWarning[] | null;
  now: number | null;
  spot: number | null;
  onSpot(area: number | null): void;
  onOpen(id: string): void;
  index: Map<string, Case> | null;
  className?: string;
}) {
  const serious = warnings?.filter((w) => w.level !== "watch").length ?? 0;
  return (
    <Panel
      title="Early warnings"
      icon="notification_important"
      sub="Most severe first. Select one to frame the map on it and list its cases."
      className={className}
      bodyClassName="flex min-h-0 flex-col px-2 sm:px-2.5"
      action={
        warnings ? (
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">
            {num(warnings.length)} active{serious ? ` · ${num(serious)} serious` : ""}
          </span>
        ) : null
      }
    >
      {warnings === null || now === null ? (
        <div aria-hidden="true" className="flex flex-col gap-2 px-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : warnings.length === 0 ? (
        <EmptyState icon="verified_user" title="No early warnings" className="mx-2">
          No area is above its usual rate for this hour and no SOS is waiting. New warnings appear here as cases come in.
        </EmptyState>
      ) : (
        <ScrollCue as="ul" aria-label="Early warnings" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-1 pb-1 max-lg:max-h-[34rem]">
          {warnings.map((w) => {
            const on = spot === w.area;
            return (
              <li
                key={w.id}
                className={cn(
                  "relative rounded-xl bg-black/30 ring-1 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-3 motion-safe:duration-500",
                  on ? "ring-2 ring-signal-orange" : w.level === "critical" ? "ring-national-crimson/60" : "ring-white/10",
                )}
              >
                {w.level === "critical" ? <span aria-hidden="true" className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-national-crimson" /> : null}
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onSpot(on ? null : w.area)}
                  className={cn("flex w-full flex-col gap-2 rounded-xl px-3.5 py-3 text-left hover:bg-white/4", focusRing)}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <LevelPill level={w.level} kind="warning" />
                    <Bn className="text-sm font-bold text-white">{w.areaBn}</Bn>
                    <span className="text-xs text-white/65">
                      {w.district} · <DivisionName id={w.division} />
                    </span>
                    <span className="ml-auto text-xs text-white/65 tabular-nums">since {timeAgo(w.since, now)}</span>
                  </span>
                  <span className="text-sm leading-snug text-white/85">{w.reason}</span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1" title={categoryLabels(w.categories)}>
                    {w.categories.slice(0, 4).map((c) => (
                      <CategoryChip key={c} category={c} />
                    ))}
                    {w.categories.length > 4 ? <span className="text-xs text-white/65">+{w.categories.length - 4} more</span> : null}
                  </span>
                </button>
                {on ? (
                  <div className="border-t border-white/10 px-3.5 pt-1 pb-2">
                    <CaseLinks ids={w.caseIds} index={index} onOpen={onOpen} label={`Cases behind the warning at ${w.areaBn}`} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ScrollCue>
      )}
      <p className="mt-3 border-t border-white/10 px-1.5 pt-3 text-xs leading-relaxed text-white/65">
        An area warns when it has 3 or more police cases in the last hour and at least twice its usual rate for this hour (from the demo&apos;s 30-day history), or when an
        SOS there is still waiting for a unit.
      </p>
    </Panel>
  );
}

/* ───────────── hotspot map ───────────── */

const LEGEND: { label: string; swatch: string }[] = [
  { label: "Hotspot (size = cases in the last hour)", swatch: "size-4 rounded-full bg-signal-orange/45 ring-1 ring-signal-orange" },
  { label: "Critical warning", swatch: "size-4 rounded-full bg-national-crimson/45 ring-1 ring-national-crimson" },
  { label: "Open police case", swatch: "size-3 rounded-full bg-signal-orange ring-2 ring-black outline outline-1 outline-white/30" },
  { label: "Critical or overdue case", swatch: "size-3 rounded-full bg-national-crimson ring-2 ring-white outline-2 outline-offset-2 outline-national-crimson" },
  { label: "Police station", swatch: "size-3 rounded-sm bg-signal-orange" },
  { label: "Patrol", swatch: "size-2 rounded-full bg-bdnavy-300" },
];

const SHOW_UNITS: NonNullable<MapViewProps["showUnits"]> = ["station", "patrol"];

function HotspotMap({
  div,
  spot,
  onSpot,
  selected,
  onSelect,
  className,
}: {
  div: DivisionScope;
  spot: number | null;
  onSpot(area: number | null): void;
  selected: string | null;
  onSelect(id: string): void;
  className?: string;
}) {
  const cases = useCommand(selectPoliceOpenIn(div));
  const units = useCommand(selectUnitsIn(div));
  const heat = useCommand(selectHeat(div));
  const spots = useCommand(selectHotspots(div));
  const onMap = selected !== null && (cases?.some((c) => c.id === selected) ?? false);
  const focus: MapViewProps["focus"] = onMap ? "selection" : spot !== null ? { lat: AREAS[spot].lat, lng: AREAS[spot].lng, zoom: 13 } : divisionFocus(div);

  return (
    <Panel
      id="intel-map"
      title="Hotspot map"
      icon="local_fire_department"
      sub={
        cases && spots ? (
          <span className="tabular-nums">
            {num(spots.length)} areas with police cases in the last hour · {num(cases.length)} open police cases · positions approximate, case points shifted for privacy
          </span>
        ) : (
          <Skeleton className="h-3 w-56" />
        )
      }
      className={cn("scroll-mt-24", className)}
      bodyClassName="flex flex-col p-0 sm:p-0 sm:pb-0"
    >
      <MapView
        className="h-80 border-y border-white/10 sm:h-[26rem] lg:h-auto lg:min-h-[34rem] lg:flex-1"
        cases={cases ?? []}
        units={units ?? []}
        heat={heat ?? undefined}
        selectedId={onMap ? (selected ?? undefined) : undefined}
        onSelect={onSelect}
        focus={focus}
        showUnits={SHOW_UNITS}
        privacy
        sos
      />
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-5">
        {spots && spots.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p id="intel-spots" className="text-xs font-semibold text-white/65">
              Busiest areas in the last hour
            </p>
            <ul aria-labelledby="intel-spots" className="flex flex-wrap gap-1.5">
              {spots.slice(0, 10).map((h) => {
                const on = spot === h.area;
                return (
                  <li key={h.area}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onSpot(on ? null : h.area)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm ring-1 transition-colors motion-reduce:transition-none lg:min-h-9",
                        focusRing,
                        on ? "bg-signal-orange font-semibold text-text-primary ring-signal-orange" : "bg-white/6 text-white ring-white/12 hover:bg-white/12",
                      )}
                    >
                      <Bn>{h.areaBn}</Bn>
                      <span className="text-xs font-bold tabular-nums">{num(h.count)}</span>
                      <span className="sr-only">
                        {" "}
                        police case{h.count === 1 ? "" : "s"}
                        {h.rising ? ", rising" : ""}
                      </span>
                      {h.rising ? <Icon name="trending_up" className="text-[16px]" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <ul aria-label="Map legend" className="flex flex-wrap gap-x-4 gap-y-2">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-2 text-xs text-white/70">
              <span aria-hidden="true" className="grid size-4 place-items-center">
                <span className={cn("block", l.swatch)} />
              </span>
              {l.label}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ───────────── recommended actions ───────────── */

/** Priority bands of lib/command/intel's recommendations: red only for an SOS or a critical warning. */
function priorityBand(p: number): { label: string; pill: string } {
  if (p >= 90) return { label: "Act now", pill: "bg-national-crimson text-white" };
  if (p >= 70) return { label: "Urgent", pill: "bg-signal-orange text-text-primary" };
  if (p >= 55) return { label: "Today", pill: "bg-bdnavy-700 text-white ring-1 ring-bdnavy-400/50" };
  return { label: "Standing", pill: "text-white/80 ring-1 ring-white/20" };
}

const REC_ICON: Record<Recommendation["kind"], string> = {
  sos: "sos",
  "patrol-now": "local_police",
  backup: "group_add",
  "link-cases": "hub",
  "women-desk": "woman",
  "patrol-window": "schedule",
};

function Recommendations({
  recs,
  index,
  onOpen,
  onSpot,
  setDiv,
  className,
}: {
  recs: Recommendation[] | null;
  index: Map<string, Case> | null;
  onOpen(id: string): void;
  onSpot(area: number): void;
  setDiv(d: DivisionScope): void;
  className?: string;
}) {
  const [shown, setShown] = useState<string | null>(null);
  return (
    <Panel title="Recommended actions" icon="task_alt" sub="Generated from the live cases and the 30-day history; most urgent first." className={className}>
      {recs === null ? (
        <div aria-hidden="true" className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <EmptyState icon="task_alt" title="Nothing to act on">
          No SOS is waiting, no area is rising and no station is behind.
        </EmptyState>
      ) : (
        <ol aria-label="Recommended actions" className="flex flex-col gap-2">
          {recs.map((r) => {
            const band = priorityBand(r.priority);
            const area = r.target.kind === "area" ? Number(r.target.id.replace("area-", "")) : NaN;
            const listId = `rec-cases-${r.id}`;
            const open = shown === r.id;
            return (
              <li key={r.id} className="flex flex-col gap-2 rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-white/6 ring-1 ring-white/10">
                    <Icon name={REC_ICON[r.kind]} className="text-[20px] text-signal-orange" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className={cn(PILL, band.pill)}>
                        <span className="sr-only">Priority: </span>
                        {band.label}
                      </span>
                      <span className="text-xs text-white/65">
                        <DivisionName id={r.division} />
                      </span>
                    </p>
                    <h3 className="mt-1.5 text-sm leading-snug font-semibold text-white">{r.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">{r.reason}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-12">
                  {r.target.kind === "station" ? (
                    <Link href={`/protibad/command/police/stations/${r.target.id}`} className={cb.outlineSm}>
                      <Icon name="location_city" className="text-[16px]" />
                      Open {r.target.label}
                    </Link>
                  ) : r.target.kind === "division" && isDivisionId(r.target.id) ? (
                    <button type="button" onClick={() => setDiv(r.target.id as DivisionScope)} className={cb.outlineSm}>
                      <Icon name="filter_center_focus" className="text-[16px]" />
                      <span>
                        Show <Bn>{DIVISION_BY_ID[r.target.id].nameBn}</Bn>
                        <span className="sr-only"> ({DIVISION_BY_ID[r.target.id].name} division)</span>
                      </span>
                    </button>
                  ) : Number.isInteger(area) && AREAS[area] ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSpot(area);
                        document.getElementById("intel-map")?.scrollIntoView({ block: "start" });
                      }}
                      className={cb.outlineSm}
                    >
                      <Icon name="my_location" className="text-[16px]" />
                      <span>
                        Show <Bn>{AREAS[area].areaBn}</Bn> on the map
                      </span>
                    </button>
                  ) : null}
                  {r.caseIds && r.caseIds.length > 0 ? (
                    r.caseIds.length === 1 ? (
                      <button type="button" data-case-open={r.caseIds[0]} onClick={() => onOpen(r.caseIds![0])} className={cb.quietSm}>
                        <Icon name="folder_open" className="text-[16px]" />
                        Open case {r.caseIds[0]}
                      </button>
                    ) : (
                      <button type="button" aria-expanded={open} aria-controls={listId} onClick={() => setShown(open ? null : r.id)} className={cb.quietSm}>
                        <Icon name={open ? "expand_less" : "folder_open"} className="text-[16px]" />
                        Open cases ({num(r.caseIds.length)})
                      </button>
                    )
                  ) : null}
                </div>
                {open && r.caseIds ? (
                  <div id={listId} className="ml-12 border-t border-white/10 pt-1">
                    <CaseLinks ids={r.caseIds} index={index} onOpen={onOpen} label={`Cases for: ${r.title}`} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

/* ───────────── who is involved ───────────── */

const netDomId = (groupId: string): string => `network-${groupId}`;

function Networks({ div, setDiv, index, onOpen, className }: { div: DivisionScope; setDiv(d: DivisionScope): void; index: Map<string, Case> | null; onOpen(id: string): void; className?: string }) {
  const nets = useCommand(selectNetworks(div));
  const everywhere = useCommand(selectNetworks("all"));
  const involvement = useCommand(selectInvolvement(div));
  const names = useCommand(selectStationNames);
  const now = useCommand(selectNow);
  const group = useSearchParams().get("group");
  const reduced = useReducedMotion();
  // undefined: nothing chosen yet, so the ?group= network starts open.
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const expanded = openId === undefined ? group : openId;
  const outOfScope = group !== null && nets !== null && everywhere !== null && !nets.some((n) => n.groupId === group) && everywhere.some((n) => n.groupId === group);

  // Bring the linked network into view once, when it is first on the page.
  const scrolled = useRef<string | null>(null);
  useEffect(() => {
    if (!group || !nets || scrolled.current === group) return;
    const el = document.getElementById(netDomId(group));
    if (!el) return;
    scrolled.current = group;
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, [group, nets, reduced]);

  return (
    <Panel
      id="intel-networks"
      title="Who is involved"
      icon="hub"
      sub="Rings and gangs linked across cases and stations by their group code; most open cases first."
      className={cn("scroll-mt-24", className)}
    >
      {involvement ? (
        <dl aria-label="Open police cases by kind of actor" className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-3">
          {[...INVOLVED_ORDER, "none" as const].map((k) => (
            <div key={k} className="flex min-w-0 flex-col gap-0.5 bg-bdnavy-900 px-3 py-2">
              <dt className="truncate text-xs text-white/65">{k === "none" ? "Not recorded" : INVOLVED_LABEL[k]}</dt>
              <dd className="font-grotesk text-lg font-bold text-white tabular-nums">{num(involvement[k])}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <Skeleton className="mb-4 h-14 w-full rounded-xl" />
      )}

      {outOfScope ? (
        <p role="status" className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-black/30 px-3.5 py-2.5 text-sm text-white/85 ring-1 ring-white/10">
          <Bn className="font-semibold">{group}</Bn> has no cases in this division.
          <button type="button" onClick={() => setDiv("all")} className={cb.quietSm}>
            Show all of Bangladesh
          </button>
        </p>
      ) : null}

      {nets === null || now === null ? (
        <div aria-hidden="true" className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : nets.length === 0 ? (
        <EmptyState icon="hub" title="No linked groups">
          No ring or gang code appears on the cases in scope.
        </EmptyState>
      ) : (
        <ScrollCue as="ul" aria-label="Networks" className="flex max-h-[40rem] flex-col gap-2 overflow-y-auto overscroll-contain p-0.5">
          {nets.map((n) => (
            <NetworkRow
              key={n.groupId}
              n={n}
              now={now}
              names={names}
              index={index}
              onOpen={onOpen}
              linked={n.groupId === group}
              expanded={expanded === n.groupId}
              onToggle={() => setOpenId(expanded === n.groupId ? null : n.groupId)}
            />
          ))}
        </ScrollCue>
      )}
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/65">
        <span aria-hidden="true" className="inline-flex shrink-0 pt-px">
          <Icon name="shield_person" className="text-[16px] text-bdnavy-300" />
        </span>
        Groups are fictional demo codes. No religion, ethnicity, party or appearance is ever recorded.
      </p>
    </Panel>
  );
}

function NetworkRow({
  n,
  now,
  names,
  index,
  onOpen,
  linked,
  expanded,
  onToggle,
}: {
  n: Network;
  now: number;
  names: Map<string, string> | null;
  index: Map<string, Case> | null;
  onOpen(id: string): void;
  linked: boolean;
  expanded: boolean;
  onToggle(): void;
}) {
  const bodyId = `${netDomId(n.groupId)}-body`;
  const stations = n.stations.map((s) => names?.get(s) ?? s);
  return (
    <li id={netDomId(n.groupId)} className={cn("scroll-mt-24 rounded-xl bg-black/30 ring-1", linked ? "ring-2 ring-signal-orange" : "ring-white/10")}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={onToggle}
        className={cn("flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left hover:bg-white/4", focusRing)}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <Bn className="text-base font-bold text-white">{n.groupId}</Bn>
            <span className={cn(PILL, "bg-bdnavy-700 text-white ring-1 ring-bdnavy-400/50")}>{INVOLVED_LABEL[n.kind]}</span>
            {linked ? <span className={cn(PILL, "bg-signal-orange text-text-primary")}>Linked from a case</span> : null}
          </span>
          <span className="mt-1.5 block text-xs leading-relaxed text-white/65 tabular-nums">
            {num(n.caseIds.length)} case{n.caseIds.length === 1 ? "" : "s"} · {num(n.stations.length)} station{n.stations.length === 1 ? "" : "s"} ·{" "}
            <span className={n.open > 0 ? "font-semibold text-white" : undefined}>{num(n.open)} open</span> · last seen {timeAgo(n.lastSeen, now)}
          </span>
        </span>
        <Icon name={expanded ? "expand_less" : "expand_more"} className="mt-1 text-[22px] text-white/75" />
      </button>
      {expanded ? (
        <div id={bodyId} className="flex flex-col gap-3 border-t border-white/10 px-3.5 pt-3 pb-2">
          <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-white/65">Stations touched</dt>
              <dd className="text-sm text-white">{stations.join(", ") || "—"}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-white/65">Areas</dt>
              <dd className="text-sm text-white">
                <Bn>{n.areas.join(", ")}</Bn>
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-white/65">Divisions</dt>
              <dd className="flex flex-wrap gap-x-2 text-sm text-white">
                {n.divisions.map((d) => (
                  <DivisionName key={d} id={d} />
                ))}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-white/65">Head count reported</dt>
              <dd className="text-sm text-white tabular-nums">{n.people > 0 ? `Up to ${num(n.people)} people` : "Not reported"}</dd>
            </div>
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-white/65">Kinds of case</dt>
              <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {n.categories.map((c) => (
                  <CategoryChip key={c} category={c} english />
                ))}
              </dd>
            </div>
          </dl>
          <CaseLinks ids={n.caseIds.slice().reverse()} index={index} onOpen={onOpen} label={`Cases linked to ${n.groupId}`} />
        </div>
      ) : null}
    </li>
  );
}

/* ───────────── hour × category pattern ───────────── */

/** Six steps of gold into the navy field (more is brighter on the dark ground); an empty cell stays the field. */
const STEPS = [20, 36, 52, 68, 84, 100];
const stepColor = (k: number): string => `color-mix(in oklab, var(--color-signal-orange) ${STEPS[k]}%, var(--color-bdnavy-900))`;
const stepOf = (v: number, max: number): number => (v <= 0 || max <= 0 ? -1 : Math.min(STEPS.length - 1, Math.floor((v / max) * STEPS.length - 1e-9)));
const hh = (h: number): string => `${String(h).padStart(2, "0")}:00`;

function Pattern({ div }: { div: DivisionScope }) {
  const p = useCommand(selectHourPattern(div));
  const [hover, setHover] = useState<{ c: number; h: number } | null>(null);

  const stats = useMemo(() => {
    if (!p) return null;
    let peak = { c: 0, h: 0, v: -1 };
    for (let h = 0; h < p.rows.length; h++) for (let c = 0; c < p.rows[h].length; c++) if (p.rows[h][c] > peak.v) peak = { c, h, v: p.rows[h][c] };
    let busiest = 0;
    for (let h = 1; h < p.totals.length; h++) if (p.totals[h] > p.totals[busiest]) busiest = h;
    const maxTotal = Math.max(1, ...p.totals);
    return { peak, busiest, maxTotal };
  }, [p]);

  const read = (c: number, h: number) => {
    if (!p) return null;
    const m = CATEGORY_META[p.categories[c]];
    return (
      <>
        <strong className="font-semibold text-white">{m.label}</strong> (<Bn>{m.labelBn}</Bn>) · {hh(h)}–{hh((h + 1) % 24)} ·{" "}
        <strong className="font-semibold text-white tabular-nums">{num(p.rows[h][c])}</strong> reports in {p.days} days
      </>
    );
  };

  return (
    <Panel
      title="Pattern by hour"
      icon="grid_on"
      sub={
        <>
          30 days of history: police reports by hour of the day and kind of case. This is the demo&apos;s seeded sample history, not real reports.
        </>
      }
    >
      {p === null || stats === null ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : (
        <div className="flex flex-col gap-4">
          <p aria-live="polite" className="min-h-10 text-sm leading-snug text-white/75">
            {hover ? (
              read(hover.c, hover.h)
            ) : (
              <>
                Peak: {read(stats.peak.c, stats.peak.h)}. Busiest hour overall {hh(stats.busiest)}.
              </>
            )}
          </p>

          {/* Focusable so keyboard users can scroll it sideways on a phone; the table below carries the numbers. */}
          <div tabIndex={0} role="region" aria-label="Pattern grid, scrolls sideways" className={cn("overflow-x-auto overscroll-x-contain rounded-md pb-1", focusRing)}>
            <div
              aria-hidden="true"
              onPointerLeave={() => setHover(null)}
              className="grid min-w-[44rem] gap-[2px]"
              style={{ gridTemplateColumns: "minmax(8.5rem, 11rem) repeat(24, minmax(0, 1fr))" }}
            >
              {/* All categories per hour, as thin columns above the grid. */}
              <span className="self-end pr-2 pb-0.5 text-xs text-white/65">All kinds</span>
              {p.totals.map((t, h) => (
                <span key={`t${h}`} className="flex h-10 items-end">
                  <span
                    className={cn("block w-full rounded-t-[3px]", h === stats.busiest ? "bg-signal-orange" : "bg-bdnavy-300/70")}
                    style={{ height: `${Math.max(4, (t / stats.maxTotal) * 100)}%` }}
                  />
                </span>
              ))}
              {p.categories.map((cat, c) => (
                <div key={cat} className="contents">
                  <span className="flex min-w-0 items-center pr-2" title={CATEGORY_META[cat].label}>
                    <Bn className="truncate text-xs text-white/85">{CATEGORY_META[cat].labelBn}</Bn>
                  </span>
                  {p.rows.map((row, h) => {
                    const k = stepOf(row[c], p.max);
                    const peak = stats.peak.c === c && stats.peak.h === h;
                    const on = hover?.c === c && hover.h === h;
                    return (
                      <span
                        key={h}
                        onPointerEnter={() => setHover({ c, h })}
                        className={cn(
                          "block h-6 rounded-[3px]",
                          k < 0 && "ring-1 ring-white/6 ring-inset",
                          peak && "outline-2 outline-offset-1 outline-white",
                          on && "outline-2 outline-offset-1 outline-signal-orange",
                        )}
                        style={k >= 0 ? { backgroundColor: stepColor(k) } : undefined}
                      />
                    );
                  })}
                </div>
              ))}
              <span />
              {Array.from({ length: 24 }, (_, h) => (
                <span key={`h${h}`} className={cn("pt-1 text-center text-xs tabular-nums", h === stats.busiest ? "font-bold text-signal-orange" : "text-white/65")}>
                  {h % 3 === 0 || h === stats.busiest ? String(h).padStart(2, "0") : ""}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/65">
              <span>Fewer</span>
              <span aria-hidden="true" className="flex gap-[2px]">
                <span className="block h-3 w-6 rounded-[3px] ring-1 ring-white/12 ring-inset" />
                {STEPS.map((_, k) => (
                  <span key={k} className="block h-3 w-6 rounded-[3px]" style={{ backgroundColor: stepColor(k) }} />
                ))}
              </span>
              <span>More</span>
              <span className="basis-full tabular-nums sm:basis-auto">0 to {num(p.max)} reports in a cell; the white outline marks the peak</span>
            </div>
            <details className="group w-full sm:w-auto">
              <summary className={cn(cb.quietSm, "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>
                <Icon name="table" className="text-[16px]" />
                <span className="group-open:hidden">Show as a table</span>
                <span className="hidden group-open:inline">Hide the table</span>
              </summary>
              <PatternTable p={p} />
            </details>
          </div>
        </div>
      )}
    </Panel>
  );
}

function PatternTable({ p }: { p: NonNullable<ReturnType<ReturnType<typeof selectHourPattern>>> }) {
  return (
    <div tabIndex={0} role="region" aria-label="Pattern table, scrolls sideways" className={cn("mt-3 overflow-x-auto rounded-md", focusRing)}>
      <table className="w-full border-collapse text-left text-xs tabular-nums">
        <caption className="sr-only">Police reports in {p.days} days by hour of the day (rows) and kind of case (columns); demo sample history</caption>
        <thead>
          <tr className="border-b border-white/10">
            <th scope="col" className="px-2 py-2 font-semibold whitespace-nowrap text-white/65">
              Hour
            </th>
            {p.categories.map((c) => (
              <th key={c} scope="col" className="px-2 py-2 font-semibold whitespace-nowrap text-white/65">
                {CATEGORY_META[c].label}
              </th>
            ))}
            <th scope="col" className="px-2 py-2 font-semibold whitespace-nowrap text-white/65">
              All
            </th>
          </tr>
        </thead>
        <tbody>
          {p.rows.map((row, h) => (
            <tr key={h} className="border-b border-white/6">
              <th scope="row" className="px-2 py-1.5 font-semibold whitespace-nowrap text-white">
                {hh(h)}
              </th>
              {row.map((v, c) => (
                <td key={c} className="px-2 py-1.5 text-white/85">
                  {num(v)}
                </td>
              ))}
              <td className="px-2 py-1.5 font-semibold text-white">{num(p.totals[h])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────── the page ───────────── */

export function Intel() {
  const [div, setDiv] = useDivision();
  const [selected, setSelected] = useSelectedCase();
  const threat = useCommand(selectDivisionThreat);
  const warnings = useCommand(selectEarlyWarnings(div));
  const recs = useCommand(selectRecommendations(div));
  const index = useCommand(selectCaseIndex);
  const now = useCommand(selectNow);
  const [rawSpot, setSpot] = useState<number | null>(null);
  // A framed area outside the division in scope is let go.
  const spot = rawSpot !== null && (div === "all" || AREAS[rawSpot]?.division === div) ? rawSpot : null;

  const counts = useMemo(() => {
    if (!threat) return undefined;
    const c: Partial<Record<DivisionScope, number>> = { all: 0 };
    for (const t of threat) {
      c[t.division] = t.open;
      c.all = (c.all ?? 0) + t.open;
    }
    return c;
  }, [threat]);

  return (
    <CommandPage title="Crime intelligence" subtitle="Detect early, act before harm spreads. Where cases are rising now, where they usually rise, who is behind repeat cases, and what to do next.">
      <div className="flex flex-col gap-2">
        <DivisionPicker counts={counts} countLabel="open police cases" />
        <DivisionScopeNote div={div}>Early warnings, map, actions, networks and pattern follow this scope</DivisionScopeNote>
      </div>

      <Situation threat={threat} div={div} setDiv={setDiv} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
        <HotspotMap div={div} spot={spot} onSpot={setSpot} selected={selected} onSelect={setSelected} />
        <Warnings warnings={warnings} now={now} spot={spot} onSpot={setSpot} onOpen={setSelected} index={index} className="lg:h-0 lg:min-h-full" />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Recommendations recs={recs} index={index} onOpen={setSelected} onSpot={setSpot} setDiv={setDiv} />
        <Networks div={div} setDiv={setDiv} index={index} onOpen={setSelected} />
      </div>

      <Pattern div={div} />

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="map" className="text-[16px]" />
        Police stations are real thanas at approximate positions. Map data © OpenStreetMap contributors.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

/** What the server and the first paint show before the world is read. */
export function IntelFallback() {
  return (
    <CommandPage title="Crime intelligence" subtitle="Loading the live picture…">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-80 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
        <Skeleton className="h-96 rounded-2xl lg:h-[40rem]" />
        <Skeleton className="h-96 rounded-2xl lg:h-[40rem]" />
      </div>
    </CommandPage>
  );
}
