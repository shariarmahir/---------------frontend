"use client";

import { useState } from "react";
import { DIVISIONS } from "@/data/tv-wall/sources";
import { cn } from "@/lib/utils";
import { Empty, Panel } from "../panel";
import { useWallData } from "../wall-context";
import { WireList } from "../wire-list";

type Tab = "all" | "achievement" | "development";

/** What the country gained: achievements and development projects, with where they come from. */
export function GainsPage() {
  const w = useWallData();
  const [tab, setTab] = useState<Tab>("all");
  const list = tab === "all" ? w.gains : w.gains.filter((i) => i.category === tab);
  const ach = w.gains.filter((i) => i.category === "achievement").length;
  const dev = w.gains.length - ach;
  const byDivision = DIVISIONS.map((d) => ({ ...d, n: w.gains.filter((i) => i.division === d.id).length })).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...byDivision.map((d) => d.n));

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Panel title="Achievements & development" sub={`${w.gains.length} reports in the last ${w.hours} h`} icon="emoji_events" field="navy" className="lg:col-span-8">
        <div role="radiogroup" aria-label="Kind" className="mx-5 mb-3 flex w-fit rounded-lg bg-black/35 p-1 ring-1 ring-white/10">
          {(
            [
              ["all", `All · ${w.gains.length}`],
              ["achievement", `Achievements · ${ach}`],
              ["development", `Development · ${dev}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "min-h-8 rounded-md px-3 font-sans text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                tab === id ? "bg-signal-orange text-text-primary" : "text-white/80 hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <WireList items={list} now={w.now} fresh={w.fresh} limit={80} className="max-h-[70dvh] border-t border-white/10" empty={<Empty icon="emoji_events" title="Nothing new yet" body="The collectors found no achievement or development headlines in this window." />} />
      </Panel>

      <div className="grid content-start gap-4 lg:col-span-4">
        <Panel title="By division" sub="Where the good news comes from" icon="leaderboard" field="cobalt" delay={90}>
          <ul className="space-y-2.5 px-5 pb-5">
            {byDivision.map((d) => (
              <li key={d.id}>
                <span className="flex justify-between font-sans text-sm">
                  <span className="text-white">{d.en}</span>
                  <span className="text-white/75 tabular-nums">{d.n}</span>
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/35">
                  <span className="block h-full rounded-full bg-signal-orange" style={{ width: `${(d.n / max) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Read with care" icon="info" field="ink" delay={180}>
          <p className="px-5 pb-5 font-sans text-sm leading-relaxed text-white/80">
            The collectors ask more questions about harm than about gains, so fewer good-news reports here does not mean a worse day. Many national projects name no district and do not appear in the division counts.
          </p>
        </Panel>
      </div>
    </div>
  );
}
