"use client";

import { DIVISION_BY_ID } from "@/data/command/divisions";
import { kpis, type DivisionScope, type Kpis } from "@/lib/command/selectors";
import { perDivision, selectKpisIn, useCommand, useResolvedToday } from "@/lib/command/store";
import type { Dept, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Eased, Kpi, Skeleton, formatMin, num } from "./kit";

/**
 * The six headline numbers as one strip of hairline-divided cells: open,
 * awaiting first response (with the overdue count in red), en route, on
 * scene, resolved today, median first response. `dept` narrows it to one
 * department, `div` to one division. Across the country "resolved today"
 * counts pruned cases too (useResolvedToday), so the department figures add up
 * to the overview; the pruned counter keeps no division, so a division counts
 * the cases still on the board. A changed figure eases in (kit Eased).
 */

/** One memoised selector per department and division. */
const DEPT_KPIS: Record<Dept, (div?: DivisionScope) => (w: World) => Kpis> = {
  police: perDivision((w, d) => kpis({ ...w, cases: w.cases.filter((c) => c.dept === "police") }, w.now, d)),
  consumer: perDivision((w, d) => kpis({ ...w, cases: w.cases.filter((c) => c.dept === "consumer") }, w.now, d)),
  other: perDivision((w, d) => kpis({ ...w, cases: w.cases.filter((c) => c.dept === "other") }, w.now, d)),
};

export function KpiRow({ dept, div = "all", className }: { dept?: Dept; div?: DivisionScope; className?: string }) {
  const scoped = div !== undefined && div !== "all";
  const k: Kpis | null = useCommand(dept ? DEPT_KPIS[dept](div) : selectKpisIn(div));
  const resolvedCountry = useResolvedToday(dept);
  const resolved = scoped ? (k?.resolvedToday ?? null) : resolvedCountry;

  const v = (x: number | null | undefined, fmt: (n: number) => string = num) =>
    x === null || x === undefined ? <Skeleton className="h-7 w-14" /> : <Eased value={fmt(x)} />;

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
    { label: "Resolved today", icon: "check_circle", value: v(resolved), sub: k ? (scoped ? "Since midnight, on the board" : "Since midnight, Dhaka") : null },
    {
      label: "Median first response",
      icon: "timer",
      value: k ? <Eased value={formatMin(k.medianFirstResponseMin)} /> : v(null),
      sub: k ? "Report to first answer" : null,
    },
  ];

  return (
    <section
      aria-label={scoped ? `Key figures, ${DIVISION_BY_ID[div].name} division` : "Key figures"}
      className={cn("overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12", className)}
    >
      <dl className="grid grid-cols-2 divide-white/10 sm:grid-cols-3 xl:grid-cols-6 [&>div]:border-white/10 max-sm:[&>div:nth-child(odd)]:border-r max-sm:[&>div:nth-child(-n+4)]:border-b sm:max-xl:[&>div:nth-child(-n+3)]:border-b sm:max-xl:[&>div:not(:nth-child(3n))]:border-r xl:[&>div:not(:last-child)]:border-r">
        {cells.map((c) => (
          <Kpi key={c.label} label={c.label} icon={c.icon} value={c.value} sub={c.sub} />
        ))}
      </dl>
    </section>
  );
}
