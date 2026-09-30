"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { crew, departments, deptOrder, type DeptId } from "@/data/team";
import { cn } from "@/lib/utils";
import { MemberCard } from "./member-card";

/**
 * The crew grid with a department filter — gold pill for the active one,
 * like the game menu and the header. A member in two departments (Safia:
 * creative + IoT) shows under both. Two cards a row on phones, three from sm.
 */
export function TeamDirectory() {
  const [filter, setFilter] = useState<DeptId | "all">("all");
  const shown = filter === "all" ? crew : crew.filter((m) => m.depts.includes(filter));
  const count = (id: DeptId) => crew.filter((m) => m.depts.includes(id)).length;

  const pill = (active: boolean) =>
    cn(
      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 font-sans text-sm font-semibold [-webkit-tap-highlight-color:transparent] touch-manipulation transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
      active ? "bg-signal-orange text-text-primary" : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20",
    );

  return (
    <>
      <div role="group" aria-label="Filter by department" className="no-scrollbar relative mb-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={pill(filter === "all")}>
          <Icon name="groups" className="text-[18px]!" />
          All
          <span className="font-mono text-xs opacity-75">{crew.length}</span>
        </button>
        {deptOrder.map((id) => (
          <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={pill(filter === id)}>
            <Icon name={departments[id].icon} className="text-[18px]!" />
            {departments[id].label}
            <span className="font-mono text-xs opacity-75">{count(id)}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {shown.length} members shown
      </p>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-5">
        {shown.map((m, i) => (
          <li key={`${filter}-${m.slug}`} className="animate-nav-card-in flex" style={{ animationDelay: `${i * 60}ms` }}>
            <MemberCard member={m} priority={i < 3} />
          </li>
        ))}
      </ul>
    </>
  );
}
