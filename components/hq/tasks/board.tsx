"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Empty, hb, inputCls, PageHead, Seg, selectCls } from "@/components/hq/kit";
import { useHq } from "@/components/hq/provider";
import { can, KIND_LABEL, PRIORITY_LABEL, PRIORITY_ORDER } from "@/lib/hq/rules";
import type { Priority, Task, TaskKind } from "@/lib/hq/types";
import { cn } from "@/lib/utils";
import { NewTicketDialog, PRIORITY_TONE, TakeDialog, TicketCard } from "./shared";

type Show = "open" | "active" | "all";

/** The ticket board: lanes by priority; members take what fits their skills and timeline. */
export function TaskBoard() {
  const tasks = useHq((v) => v.tasks);
  const me = useHq((v) => v.me.person);
  const params = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState<Show>("open");
  const [mineOnly, setMineOnly] = useState(false);
  const [kind, setKind] = useState<TaskKind | "">("");
  const [mode, setMode] = useState("");
  const [q, setQ] = useState("");
  const [lane, setLane] = useState<Priority>("today");
  const [taking, setTaking] = useState<Task | null>(null);
  const creating = params.get("new") === "1";
  const setCreating = (o: boolean) => router.replace(o ? "/hq/tasks?new=1" : "/hq/tasks", { scroll: false });

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks.filter((t) => {
      if (t.approval === "pending" || t.status === "cancelled") return false;
      if (show === "open" && t.status !== "open") return false;
      if (show === "active" && !["taken", "in-progress", "submitted", "client-review"].includes(t.status)) return false;
      if (mineOnly && !t.skills.some((x) => me.skills.includes(x))) return false;
      if (kind && t.kind !== kind) return false;
      if (mode && t.mode !== mode && !(mode !== "either" && t.mode === "either")) return false;
      if (s && !`${t.code} ${t.title} ${t.brief} ${t.skills.join(" ")}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [tasks, show, mineOnly, kind, mode, q, me.skills]);

  const byLane = useMemo(() => {
    const m = new Map<Priority, Task[]>(PRIORITY_ORDER.map((p) => [p, []]));
    for (const t of list) m.get(t.priority)!.push(t);
    for (const l of m.values()) l.sort((a, b) => a.due.localeCompare(b.due));
    return m;
  }, [list]);

  return (
    <>
      <PageHead
        title="Task Board"
        lead="No fixed tasks at Kandari Lab: tickets wait here by priority. Take the ones that fit your skills, your timeline — or the skill you want to learn."
        actions={
          <button type="button" onClick={() => setCreating(true)} className={hb.gold}>
            <Plus aria-hidden className="size-4" /> {can(me, "tasks.publish") ? "New ticket" : "New TaskBook task"}
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Seg
          label="Which tickets"
          value={show}
          onChange={setShow}
          options={[
            { value: "open", label: "Open", count: tasks.filter((t) => t.status === "open").length },
            { value: "active", label: "In progress", count: tasks.filter((t) => ["taken", "in-progress", "submitted", "client-review"].includes(t.status) && t.approval !== "pending").length },
            { value: "all", label: "All" },
          ]}
        />
        <button type="button" aria-pressed={mineOnly} onClick={() => setMineOnly((x) => !x)} className={cn(hb.quietSm, mineOnly && "bg-signal-orange text-text-primary ring-signal-orange hover:bg-signal-orange hover:text-text-primary")}>
          Matches my skills
        </button>
        <select aria-label="Kind" value={kind} onChange={(e) => setKind(e.target.value as TaskKind | "")} className={cn(selectCls, "min-h-9 w-auto text-xs")}>
          <option value="">Every kind</option>
          {Object.entries(KIND_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <select aria-label="Solo or team" value={mode} onChange={(e) => setMode(e.target.value)} className={cn(selectCls, "min-h-9 w-auto text-xs")}>
          <option value="">Solo or team</option>
          <option value="solo">Solo</option>
          <option value="team">Team</option>
        </select>
        <label className="relative ml-auto w-full sm:w-64">
          <span className="sr-only">Search tickets</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/45" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets…" className={cn(inputCls, "min-h-10 pl-9")} />
        </label>
      </div>

      {/* Phones and tablets: one lane at a time. */}
      <div className="lg:hidden">
        <Seg label="Lane" value={lane} onChange={setLane} className="mb-4 w-full" options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p], count: byLane.get(p)!.length }))} />
        <div className="grid gap-3 sm:grid-cols-2">
          {byLane.get(lane)!.map((t, i) => (
            <TicketCard key={t.id} t={t} onTake={setTaking} i={i} />
          ))}
        </div>
        {byLane.get(lane)!.length === 0 ? <Empty icon={LayoutGrid} title="Nothing in this lane" /> : null}
      </div>

      {/* Desktop: every lane side by side; the board scrolls, never the page. */}
      <div className="hidden overflow-x-auto pb-3 lg:block">
        <div className="grid min-w-max auto-cols-[19rem] grid-flow-col gap-4">
          {PRIORITY_ORDER.map((p) => {
            const items = byLane.get(p)!;
            return (
              <section key={p} aria-label={PRIORITY_LABEL[p]} className="flex min-h-[60vh] flex-col rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/8">
                <header className="mb-3 flex items-center gap-2 px-1">
                  <span className={cn("size-2.5 rounded-full", PRIORITY_TONE[p] === "red" ? "bg-national-crimson" : PRIORITY_TONE[p] === "gold" ? "bg-signal-orange" : "bg-bdnavy-300")} />
                  <h2 className="font-grotesk text-sm font-bold text-white">{PRIORITY_LABEL[p]}</h2>
                  <span className="ml-auto rounded-full bg-white/10 px-2 text-xs font-bold text-white/75">{items.length}</span>
                </header>
                <div className="flex flex-col gap-3">
                  {items.map((t, i) => (
                    <TicketCard key={t.id} t={t} onTake={setTaking} i={i} />
                  ))}
                  {items.length === 0 ? <p className="px-2 py-6 text-center text-xs text-white/40">Empty</p> : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <NewTicketDialog open={creating} onOpenChange={setCreating} />
      <TakeDialog key={taking?.id ?? "none"} task={taking} onClose={() => setTaking(null)} />
    </>
  );
}
