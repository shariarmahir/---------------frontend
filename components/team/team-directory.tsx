"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { crew, departments, deptOrder, type DeptId } from "@/data/team";
import { cn } from "@/lib/utils";
import { MemberCard } from "./member-card";

/**
 * The crew grid with a department filter. A member in two departments
 * (Safia: creative + IoT) shows under both.
 */
export function TeamDirectory() {
  const [filter, setFilter] = useState<DeptId | "all">("all");
  const shown = filter === "all" ? crew : crew.filter((m) => m.depts.includes(filter));
  const count = (id: DeptId) => crew.filter((m) => m.depts.includes(id)).length;

  const pill = (active: boolean) =>
    cn(
      "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm font-semibold transition-all focus-visible:ring-3 focus-visible:ring-signal-orange/50 focus-visible:outline-none",
      active
        ? "border-transparent bg-bd-green text-white shadow-md"
        : "border-slate-200 bg-white text-text-secondary hover:-translate-y-0.5 hover:border-bd-green/40 hover:text-bd-green motion-reduce:hover:translate-y-0",
    );

  return (
    <>
      <div role="group" aria-label="Filter by department" className="mb-8 flex flex-wrap gap-2">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={pill(filter === "all")}>
          <Icon name="groups" className="text-[18px]!" />
          All
          <span className="font-mono text-xs opacity-70">{crew.length}</span>
        </button>
        {deptOrder.map((id) => (
          <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={pill(filter === id)}>
            <Icon name={departments[id].icon} className="text-[18px]!" />
            {departments[id].label}
            <span className="font-mono text-xs opacity-70">{count(id)}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {shown.length} members shown
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m) => (
          <div key={m.slug} className="animate-nav-card-in">
            <MemberCard member={m} />
          </div>
        ))}
      </div>
    </>
  );
}
