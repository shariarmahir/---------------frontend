"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { CrimeKind } from "@/lib/tv-wall/core";
import { cn } from "@/lib/utils";
import { Accountability, CrimeMix } from "../analysis";
import { KIND } from "../labels";
import { Empty, Panel } from "../panel";
import { useWallData } from "../wall-context";
import { WireList } from "../wire-list";

type Cat = "all" | "crime" | "corruption";

/**
 * Every crime and corruption report in the window, newest first, with
 * search, a category switch and the crime-type mix as a filter; beside it
 * where the reports come from and who answers for them.
 */
export function CrimePage() {
  const w = useWallData();
  const [cat, setCat] = useState<Cat>("all");
  const [kind, setKind] = useState<CrimeKind | null>(null);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return w.harm.filter(
      (i) => (cat === "all" || i.category === cat) && (!kind || i.crimeKind === kind) && (!needle || i.title.toLowerCase().includes(needle) || i.source.toLowerCase().includes(needle)),
    );
  }, [w.harm, cat, kind, q]);

  const places = useMemo(() => {
    const m = new Map<string, number>();
    w.harm.forEach((i) => i.district && m.set(i.district, (m.get(i.district) ?? 0) + 1));
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [w.harm]);
  const nameOf = (id: string) => w.readings.find((r) => r.id === id)?.name ?? id;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Panel
        title="Reports"
        sub={`${list.length} of ${w.harm.length} in the last ${w.hours} h${kind ? ` · ${KIND[kind]}` : ""}`}
        icon="gavel"
        field="ink"
        alert={w.pings.length > 0}
        className="lg:col-span-8"
      >
        <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
          <label className="relative min-w-0 flex-1 basis-56">
            <span className="sr-only">Search reports</span>
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lg! text-white/50" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search headlines or outlets"
              className="min-h-10 w-full rounded-lg bg-black/35 pr-3 pl-10 font-sans text-sm text-white ring-1 ring-white/12 placeholder:text-white/45 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            />
          </label>
          <div role="radiogroup" aria-label="Category" className="flex rounded-lg bg-black/35 p-1 ring-1 ring-white/10">
            {(
              [
                ["all", "All"],
                ["crime", "Crime"],
                ["corruption", "Corruption"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={cat === id}
                onClick={() => setCat(id)}
                className={cn(
                  "min-h-8 rounded-md px-3 font-sans text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                  cat === id ? "bg-signal-orange text-text-primary" : "text-white/80 hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {kind && (
            <button type="button" onClick={() => setKind(null)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 font-sans text-sm font-semibold text-signal-orange ring-1 ring-signal-orange/60">
              <Icon name="close" className="text-base!" />
              {KIND[kind]}
            </button>
          )}
        </div>
        <WireList
          items={list}
          now={w.now}
          fresh={w.fresh}
          limit={120}
          className="max-h-[70dvh] border-t border-white/10"
          empty={<Empty icon="search_off" title="No matching reports" body="Try another word, category or crime type, or widen the time window." />}
        />
      </Panel>

      <div className="grid content-start gap-4 lg:col-span-4">
        <Panel title="What is reported" sub="Press a type to filter the list" icon="category" field="navy" delay={90}>
          <div className="px-5 pb-5">
            <CrimeMix items={w.harm} onKind={setKind} active={kind} />
          </div>
        </Panel>
        <Panel title="Where" sub="Districts with the most reports" icon="location_on" field="cobalt" delay={180}>
          {places.length ? (
            <ol className="px-2 pb-3">
              {places.map(([id, n]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => w.setDistrict(w.district === id ? null : id)}
                    aria-pressed={w.district === id}
                    className={cn(
                      "flex min-h-9 w-full items-center justify-between rounded-lg px-3 font-sans text-sm transition-colors",
                      w.district === id ? "bg-signal-orange text-text-primary" : "text-white hover:bg-white/8",
                    )}
                  >
                    <span className="font-semibold">{nameOf(id)}</span>
                    <span className="tabular-nums">{n}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-5 pb-5 font-sans text-sm text-white/70">No report named a district in this window.</p>
          )}
        </Panel>
        <Panel title="Who answers for it" sub="Call free, 24 hours" icon="support_agent" field="ink" delay={270}>
          <div className="px-5 pb-5">
            <Accountability />
          </div>
        </Panel>
      </div>
    </div>
  );
}
