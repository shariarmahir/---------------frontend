"use client";

import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_META } from "@/lib/command/routing";
import { isOpen, pendingAlerts, type PendingAlert } from "@/lib/command/selectors";
import { perWorld, useCommand } from "@/lib/command/store";
import type { Case, Dept, Unit, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Bn, EmptyState, OverduePill, SeverityPill, Skeleton, StatusPill, focusRing, mmss, timeAgo } from "./kit";

/**
 * The live alert feed: cases waiting for a unit to answer first (soonest to
 * escalate on top, with an m:ss countdown), then the newest open cases.
 * Critical cases carry a red edge. A polite live region announces new
 * critical cases, at most once every 10 s. Each row opens the case;
 * `renderActions` adds buttons to pending rows, outside the open-button.
 */

interface FeedItem {
  case: Case;
  /** Time left before the pending alert escalates (alerted cases only). */
  msLeft?: number;
  unit?: Unit;
  /** The pending alert, for alerted cases. */
  pending?: PendingAlert;
}

const ANNOUNCE_EVERY_MS = 10_000;
const selectNow = (w: World) => w.now;
const selectIndex = perWorld((w) => new Map(w.cases.map((c) => [c.id, c])));

function buildFeed(w: World, dept: Dept | undefined, limit: number): FeedItem[] {
  const depts: Dept[] = dept ? [dept] : ["police", "consumer"];
  const pending = depts
    .flatMap((d) => pendingAlerts(w, d))
    .sort((a, b) => a.msLeft - b.msLeft)
    .map((p) => ({ case: p.case, msLeft: p.msLeft, unit: p.unit, pending: p }));
  const seen = new Set(pending.map((p) => p.case.id));
  const rest = w.cases
    .filter((c) => isOpen(c) && !seen.has(c.id) && (!dept || c.dept === dept))
    .sort((a, b) => b.reportedAt - a.reportedAt || b.id.localeCompare(a.id))
    .map((c) => ({ case: c }));
  return [...pending, ...rest].slice(0, limit);
}

/** Ids of open critical cases (dept-filtered), joined, for the announcer. */
function criticalKey(w: World, dept: Dept | undefined): string {
  return w.cases
    .filter((c) => c.severity === "critical" && isOpen(c) && (!dept || c.dept === dept))
    .map((c) => c.id)
    .join(",");
}

export function AlertFeed({
  dept,
  onOpen,
  limit = 12,
  renderActions,
  className,
}: {
  dept?: Dept;
  onOpen(id: string): void;
  limit?: number;
  /** Buttons for a pending alert (e.g. Acknowledge / Dispatch / Escalate), drawn under the row, outside its open-button. */
  renderActions?: (p: PendingAlert) => ReactNode;
  className?: string;
}) {
  const selectFeed = useMemo(() => perWorld((w) => buildFeed(w, dept, limit)), [dept, limit]);
  const selectCritical = useMemo(() => perWorld((w) => criticalKey(w, dept)), [dept]);
  const items = useCommand(selectFeed);
  const critical = useCommand(selectCritical);
  const now = useCommand(selectNow);
  const casesById = useCommand(selectIndex);

  // Announce new critical cases politely, once per 10 s at most; the first list seen is the baseline.
  const region = useRef<HTMLParagraphElement>(null);
  const known = useRef<Set<string> | null>(null);
  const queued = useRef<string[]>([]);
  const lastAt = useRef(0);
  useEffect(() => {
    if (critical === null) return;
    const ids = critical ? critical.split(",") : [];
    if (known.current === null) {
      known.current = new Set(ids);
      return;
    }
    for (const id of ids) {
      if (!known.current.has(id)) {
        known.current.add(id);
        queued.current.push(id);
      }
    }
    const t = Date.now();
    if (queued.current.length === 0 || t - lastAt.current < ANNOUNCE_EVERY_MS || !region.current) return;
    const fresh = queued.current.map((id) => casesById?.get(id)).filter((c): c is Case => c !== undefined && isOpen(c));
    queued.current = [];
    const latest = fresh[fresh.length - 1];
    if (!latest) return;
    lastAt.current = t;
    const what = `${CATEGORY_META[latest.category].label} in ${latest.place.district}`;
    region.current.textContent = fresh.length > 1 ? `${fresh.length} new critical cases. Latest: ${what}.` : `New critical case: ${what}.`;
  }, [critical, now, casesById]);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <p ref={region} aria-live="polite" aria-atomic="true" className="sr-only" />
      {items === null || now === null ? (
        <ul aria-hidden="true" className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl px-3 py-3 ring-1 ring-white/8">
              <Skeleton className="size-9 rounded-lg" />
              <span className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </span>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <EmptyState icon="notifications_off" title="No open alerts">
          New complaints appear here the moment they arrive, with the unit alerted first.
        </EmptyState>
      ) : (
        <ul aria-label="Alerts, pending first" className="flex flex-col gap-1.5">
          {items.map((it) => (
            <FeedRow key={it.case.id} item={it} now={now} onOpen={onOpen} actions={it.pending && renderActions ? renderActions(it.pending) : null} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FeedRow({ item, now, onOpen, actions }: { item: FeedItem; now: number; onOpen(id: string): void; actions: ReactNode }) {
  const c = item.case;
  const meta = CATEGORY_META[c.category];
  const critical = c.severity === "critical";
  const pending = item.msLeft !== undefined;
  const urgent = critical || c.overdue === true;
  return (
    <li
      className={cn(
        "relative rounded-xl transition-[opacity,translate,background-color] duration-200 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-none",
        pending ? "bg-white/6 ring-1 ring-white/12 hover:bg-white/10" : "hover:bg-white/6",
      )}
    >
      {urgent ? <span aria-hidden="true" className="absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-r-full bg-national-crimson" /> : null}
      <button
        type="button"
        data-case-open={c.id}
        onClick={() => onOpen(c.id)}
        className={cn("group flex w-full items-start gap-3 rounded-xl py-3 pr-3 pl-3.5 text-left", focusRing)}
      >
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg ring-1", urgent ? "bg-national-crimson/15 text-crimson-bright ring-national-crimson/50" : "bg-black/30 text-bdnavy-300 ring-white/10")}>
          <Icon name={meta.icon} className="text-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-start gap-3">
            <span lang="bn" className="min-w-0 flex-1 truncate font-bengali text-sm leading-snug font-semibold text-white group-hover:text-signal-orange">
              {c.titleBn}
            </span>
            {pending ? (
              <span className={cn("inline-flex shrink-0 items-center gap-1 font-grotesk text-sm font-bold tabular-nums", critical ? "text-crimson-bright" : "text-white")}>
                <Icon name="hourglass_top" className="text-[15px]" />
                <span className="sr-only">Escalates in </span>
                {mmss(item.msLeft ?? 0)}
              </span>
            ) : null}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-white/60">
            <span className="font-mono text-white/70">{c.id}</span>
            <span aria-hidden="true">·</span>
            <Bn>{c.place.areaBn}</Bn>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{timeAgo(c.reportedAt, now)}</span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            {pending ? (
              <span className="min-w-0 flex-1 truncate text-xs text-white/60">
                Waiting for <span className="font-semibold text-white/85">{item.unit?.name ?? "the alerted unit"}</span>
              </span>
            ) : (
              <span className="flex-1">
                <StatusPill status={c.status} />
              </span>
            )}
            {c.overdue ? <OverduePill /> : critical ? <SeverityPill severity="critical" /> : null}
          </span>
        </span>
      </button>
      {actions ? <div className="flex flex-wrap gap-2 pr-3 pb-3 pl-[3.75rem]">{actions}</div> : null}
    </li>
  );
}
