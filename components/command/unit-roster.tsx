"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { perWorld, useCommand } from "@/lib/command/store";
import type { Unit, UnitStatus, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Bn, EmptyState, Panel, Skeleton, focusRing } from "./kit";

/**
 * The mobile units that belong to one station or office (everything with
 * that `homeId` except the home itself): status with an icon and word, and
 * the case each busy unit is working, as a button that opens it. Reusable
 * for patrols here and inspection teams on the consumer side.
 */

const UNIT_STATUS: Record<UnitStatus, { label: string; icon: string; tone: string }> = {
  available: { label: "Available", icon: "check_circle", tone: "bg-white text-text-primary" },
  busy: { label: "On a case", icon: "directions_car", tone: "bg-cobalt text-white" },
  "off-duty": { label: "Off duty", icon: "bedtime", tone: "text-white/60 ring-1 ring-white/15" },
};

export function UnitStatusPill({ status }: { status: UnitStatus }) {
  const m = UNIT_STATUS[status];
  return (
    <span className={cn("inline-flex min-h-6 shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap", m.tone)}>
      <Icon name={m.icon} className="text-[14px]" />
      {m.label}
    </span>
  );
}

const selectCaseIndex = perWorld((w: World) => new Map(w.cases.map((c) => [c.id, c])));

export function UnitRoster({
  homeId,
  title = "Patrols",
  icon = "directions_car",
  onOpen,
  className,
}: {
  /** The station or office whose units to list. */
  homeId: string;
  title?: string;
  icon?: string;
  onOpen(caseId: string): void;
  className?: string;
}) {
  const select = useMemo(() => perWorld((w: World): Unit[] => w.units.filter((u) => u.homeId === homeId && u.id !== homeId)), [homeId]);
  const units = useCommand(select);
  const cases = useCommand(selectCaseIndex);
  const free = units?.filter((u) => u.status === "available").length ?? 0;

  return (
    <Panel
      title={title}
      icon={icon}
      sub={units ? `${free} of ${units.length} free right now` : <Skeleton className="h-3 w-32" />}
      className={className}
    >
      {units === null || cases === null ? (
        <div aria-hidden="true" className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <EmptyState icon="directions_car" title="No units assigned">
          Nothing is based here yet.
        </EmptyState>
      ) : (
        <ul aria-label={title} className="flex flex-col gap-2">
          {units.map((u) => {
            const c = u.caseId ? cases.get(u.caseId) : undefined;
            return (
              <li key={u.id} className="flex flex-col gap-2 rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-grotesk text-sm font-bold text-white">{u.name}</span>
                    <Bn className="truncate text-xs text-white/60">{u.nameBn}</Bn>
                  </div>
                  <UnitStatusPill status={u.status} />
                </div>
                {u.status === "busy" ? (
                  c ? (
                    <button
                      type="button"
                      data-case-open={c.id}
                      onClick={() => onOpen(c.id)}
                      className={cn("group flex min-h-11 w-full items-center gap-2 rounded-lg bg-white/6 px-2.5 text-left hover:bg-white/10 lg:min-h-9", focusRing)}
                    >
                      <span className="font-mono text-xs font-semibold text-white/85">{c.id}</span>
                      <Bn className="min-w-0 flex-1 truncate text-xs text-white/70 group-hover:text-signal-orange">{c.titleBn}</Bn>
                      <span aria-hidden="true" className="inline-flex text-white/45">
                        <Icon name="chevron_right" className="text-[18px]" />
                      </span>
                    </button>
                  ) : (
                    <p className="text-xs text-white/55">Working a case that has since been archived.</p>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
