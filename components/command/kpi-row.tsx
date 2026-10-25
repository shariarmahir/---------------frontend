"use client";

import { useMemo } from "react";
import { kpis, type Kpis } from "@/lib/command/selectors";
import { perWorld, selectKpis, useCommand, useResolvedToday } from "@/lib/command/store";
import type { Dept } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Kpi, Skeleton, formatMin, num } from "./kit";

/**
 * The six headline numbers as one strip of hairline-divided cells: open,
 * awaiting first response (with the overdue count in red), en route, on
 * scene, resolved today, median first response. `dept` narrows it to one
 * department ("resolved today" then counts only cases still in the world).
 */
export function KpiRow({ dept, className }: { dept?: Dept; className?: string }) {
  const select = useMemo(() => (dept ? perWorld((w) => kpis({ ...w, cases: w.cases.filter((c) => c.dept === dept) }, w.now)) : selectKpis), [dept]);
  const k: Kpis | null = useCommand(select);
  const resolvedAll = useResolvedToday();
  const resolved = dept ? k?.resolvedToday : resolvedAll;

  const v = (x: number | null | undefined, fmt: (n: number) => string = num) => (x === null || x === undefined ? <Skeleton className="h-7 w-14" /> : fmt(x));

  const cells = [
    { label: "Open cases", icon: "folder_open", value: v(k?.open), sub: k ? "Each a task until closed" : null },
    {
      label: "Awaiting first response",
      icon: "notifications_active",
      value: v(k?.awaiting),
      sub: k ? (
        k.overdue > 0 ? (
          <span className="inline-flex items-center gap-1 font-semibold text-crimson-bright">
            <Icon name="timer_off" className="text-[14px]" />
            {num(k.overdue)} overdue
          </span>
        ) : (
          "None overdue"
        )
      ) : null,
    },
    { label: "En route", icon: "directions_car", value: v(k?.enRoute), sub: k ? "Units travelling" : null },
    { label: "On scene", icon: "location_on", value: v(k?.onScene), sub: k ? "Units at the place" : null },
    { label: "Resolved today", icon: "check_circle", value: v(resolved ?? null), sub: k ? "Since midnight, Dhaka" : null },
    {
      label: "Median first response",
      icon: "timer",
      value: k ? formatMin(k.medianFirstResponseMin) : v(null),
      sub: k ? "Report to first answer" : null,
    },
  ];

  return (
    <section aria-label="Key figures" className={cn("overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12", className)}>
      <dl className="grid grid-cols-2 divide-white/10 sm:grid-cols-3 xl:grid-cols-6 [&>div]:border-white/10 max-sm:[&>div:nth-child(odd)]:border-r max-sm:[&>div:nth-child(-n+4)]:border-b sm:max-xl:[&>div:nth-child(-n+3)]:border-b sm:max-xl:[&>div:not(:nth-child(3n))]:border-r xl:[&>div:not(:last-child)]:border-r">
        {cells.map((c) => (
          <Kpi key={c.label} label={c.label} icon={c.icon} value={c.value} sub={c.sub} />
        ))}
      </dl>
    </section>
  );
}
