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

const BANDS: { label: string; hint: string; lanes: Priority[] }[] = [
  { label: "Now", hint: "Immediate, urgent and today", lanes: ["immediate", "urgent", "today"] },
  { label: "Soon", hint: "Tomorrow and this week", lanes: ["tomorrow", "this-week"] },
  { label: "Later", hint: "Next week and beyond", lanes: ["next-week", "later"] },
];
const LANE_CAP = 4;

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

      {/* Phones: one lane at a time. */}
      <div className="md:hidden">
        <Seg label="Lane" value={lane} onChange={setLane} className="mb-4 w-full" options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p], count: byLane.get(p)!.length }))} />
        <Lane key={lane} priority={lane} items={byLane.get(lane)!} onTake={setTaking} bare />
      </div>

      {/* Tablets and up: every lane on the page, grouped by how soon it's due; nothing scrolls sideways. */}
      <div className="hidden flex-col gap-6 md:flex">
        {BANDS.map((b) => {
          const total = b.lanes.reduce((n, p) => n + byLane.get(p)!.length, 0);
          return (
            <section key={b.label} aria-labelledby={`band-${b.label}`}>
              <header className="mb-3 flex items-baseline gap-3">
                <h2 id={`band-${b.label}`} className="font-grotesk text-xl font-bold text-signal-orange">
                  {b.label}
                </h2>
                <p className="text-sm text-white/60">
                  {b.hint} · {total} {total === 1 ? "ticket" : "tickets"}
                </p>
              </header>
              <div className={cn("grid items-start gap-4 md:grid-cols-2", b.lanes.length === 3 && "xl:grid-cols-3")}>
                {b.lanes.map((p) => (
                  <Lane key={p} priority={p} items={byLane.get(p)!} onTake={setTaking} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <NewTicketDialog open={creating} onOpenChange={setCreating} />
      <TakeDialog key={taking?.id ?? "none"} task={taking} onClose={() => setTaking(null)} />
    </>
  );
}

/** One priority lane: its tickets, nearest due first, the first few shown until "Show all". */
function Lane({ priority, items, onTake, bare }: { priority: Priority; items: Task[]; onTake: (t: Task) => void; bare?: boolean }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, LANE_CAP);
  const tone = PRIORITY_TONE[priority];
  const cards = (
    <>
      {items.length === 0 ? (
        bare ? (
          <Empty icon={LayoutGrid} title="Nothing in this lane" />
        ) : (
          <p className="rounded-xl px-3 py-6 text-center text-sm text-white/45 ring-1 ring-white/8 ring-inset">No tickets</p>
        )
      ) : (
        <div className={cn("grid gap-3", bare && "sm:grid-cols-2")}>
          {shown.map((t, i) => (
            <TicketCard key={t.id} t={t} onTake={onTake} i={i} />
          ))}
        </div>
      )}
      {items.length > LANE_CAP ? (
        <button type="button" onClick={() => setAll((x) => !x)} className={cn(hb.quietSm, "mt-3 w-full")}>
          {all ? "Show less" : `Show all ${items.length}`}
        </button>
      ) : null}
    </>
  );
  if (bare) return cards;
  return (
    <section aria-label={PRIORITY_LABEL[priority]} className="flex min-w-0 flex-col rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/8">
      <header className="mb-3 flex items-center gap-2 px-1">
        <span aria-hidden className={cn("size-2.5 rounded-full", tone === "red" ? "bg-national-crimson" : tone === "gold" ? "bg-signal-orange" : "bg-bdnavy-300")} />
        <h3 className="font-grotesk text-sm font-bold text-white">{PRIORITY_LABEL[priority]}</h3>
        <span className="ml-auto rounded-full bg-white/10 px-2 text-xs font-bold text-white/75 tabular-nums">{items.length}</span>
      </header>
      {cards}
    </section>
  );
}
