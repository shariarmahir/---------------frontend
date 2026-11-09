"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { AnalysisPanel } from "./analysis";
import { RiskMapSvg, ZoneLegend } from "./crime-map";
import { LEVEL_NAME } from "./labels";
import { LiveTv } from "./live-tv";
import { MONITORS, Tally, type MonitorId } from "./monitor";
import { Empty } from "./panel";
import { Ticker } from "./ticker";
import { EconomyPanel, LossesPanel, envAlerts } from "./vitals";
import { useWallData } from "./wall-context";
import { WireList } from "./wire-list";

/** The running order; live TV is on the bus but not in the cycle, so the stream is not restarted every lap. */
const CYCLE: MonitorId[] = ["map", "harm", "analysis", "gains", "economy", "losses"];
const BUS: MonitorId[] = ["map", "harm", "live", "analysis", "gains", "economy", "losses"];
const CYCLE_MS = 12_000;

const dhakaTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

/**
 * The TV screen: one segment full screen at a time, cutting to the next
 * every twelve seconds like a channel. A program bus shows every source with
 * its tally (gold on air, outlined next, red alert). Remote keys: left and
 * right cut, the centre button (Enter) or Space pauses. Text segments are
 * enlarged on wide screens so they read across a room.
 */
export function TvScreen() {
  const w = useWallData();
  const [program, setProgram] = useState<MonitorId>(CYCLE[0]);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const step = useCallback((by: number) => {
    setProgram((p) => CYCLE[(CYCLE.indexOf(CYCLE.includes(p) ? p : CYCLE[0]) + by + CYCLE.length) % CYCLE.length]);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => step(1), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [paused, program, step]);

  useEffect(() => {
    root.current?.focus();
  }, []);

  const severe = w.harm.some((i) => i.severity === 3 && w.now - i.publishedAt < 3 * 3_600_000);
  const alerts: Partial<Record<MonitorId, boolean>> = {
    map: severe,
    harm: severe,
    losses: envAlerts(w.data.cities, w.data.quakes).length > 0 || w.losses.some((i) => i.severity === 3),
  };
  const next = !paused && CYCLE.includes(program) ? CYCLE[(CYCLE.indexOf(program) + 1) % CYCLE.length] : null;

  const body = (id: MonitorId): ReactNode => {
    switch (id) {
      case "map": {
        const hot = [...w.readings].sort((a, b) => b.score - a.score).slice(0, 10);
        return (
          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
            <RiskMapSvg readings={w.readings} pings={w.pings} selected={w.district} onSelect={w.setDistrict} division={w.division} className="lg:max-h-[calc(100dvh-13rem)]" />
            <div className="lg:w-80 lg:shrink-0">
              <ZoneLegend />
              <p className="mt-4 font-sans text-xs font-semibold text-white/70">Most reports</p>
              <ol className="mt-2 space-y-1.5">
                {hot.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 font-sans text-base text-white">
                    <span aria-hidden className={cn("size-2.5 rounded-full", r.level === 3 ? "bg-national-crimson" : r.level === 2 ? "bg-zone-2" : "bg-bdnavy-500")} />
                    <span className="flex-1">{r.name}</span>
                    <span className="text-xs text-white/60">{LEVEL_NAME[r.level]}</span>
                    <span className="w-8 text-right tabular-nums">{r.count}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      }
      case "live":
        return (
          <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col p-4">
            <LiveTv channels={w.data.channels} large />
          </div>
        );
      case "harm":
        return <WireList items={w.harm} now={w.now} fresh={w.fresh} limit={40} large className="mx-auto w-full max-w-5xl" empty={<Empty icon="verified_user" title="No crime reported in this window" body="New reports appear here as soon as the collectors find them." />} />;
      case "analysis":
        return <AnalysisPanel items={w.local} national={w.national} all={w.data.items} now={w.now} windowHours={w.hours} division={w.division} large />;
      case "gains":
        return <WireList items={w.gains} now={w.now} fresh={w.fresh} limit={30} large className="mx-auto w-full max-w-5xl" empty={<Empty icon="emoji_events" title="No new achievements" body="The collectors found no such headlines in this window." />} />;
      case "economy":
        return <EconomyPanel fx={w.data.fx} items={w.economy} now={w.now} fresh={w.fresh} large />;
      case "losses":
        return <LossesPanel cities={w.data.cities} quakes={w.data.quakes} items={w.losses} now={w.now} fresh={w.fresh} large />;
    }
  };

  return (
    <div
      ref={root}
      tabIndex={-1}
      onKeyDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("select, input, textarea")) return;
        if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
        else if ((e.key === " " || e.key === "Enter") && target === e.currentTarget) {
          e.preventDefault();
          setPaused((p) => !p);
        }
      }}
      className={cn("flex h-dvh flex-col bg-black text-white focus:outline-none", paused && "program-paused")}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 px-4 py-3 sm:px-6">
        <span className="font-grotesk text-lg font-bold text-signal-orange">National TV Wall</span>
        <span className="inline-flex items-center gap-2 rounded-md bg-signal-orange px-2.5 py-1 font-sans text-xs font-bold text-text-primary">
          <span aria-hidden className="size-2 rounded-[2px] bg-text-primary" /> On air
        </span>
        <h1 className="flex min-w-0 items-center gap-2 font-grotesk text-xl font-bold text-white sm:text-2xl">
          <Icon name={MONITORS[program].icon} className="text-2xl! text-signal-orange" />
          <span className="truncate">{MONITORS[program].title}</span>
          <span className="hidden font-sans text-sm font-medium text-white/60 md:inline">{MONITORS[program].sub}</span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-lg font-semibold text-white tabular-nums" suppressHydrationWarning>
            {w.clock ? dhakaTime.format(w.clock) : ""}
          </span>
          <IconButton icon="skip_previous" label="Previous" onClick={() => step(-1)} />
          <IconButton icon={paused ? "play_arrow" : "pause"} label={paused ? "Play" : "Pause"} onClick={() => setPaused((p) => !p)} />
          <IconButton icon="skip_next" label="Next" onClick={() => step(1)} />
          <Link href="/tv-wall" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 font-sans text-sm font-semibold text-signal-orange ring-2 ring-signal-orange ring-inset hover:bg-signal-orange/12">
            <Icon name="dashboard" className="text-lg!" />
            Dashboard
          </Link>
        </div>
      </div>

      <div role="radiogroup" aria-label="Choose a source" className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-white/10 px-4 py-2 sm:px-6">
        {BUS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={program === id}
            onClick={() => setProgram(id)}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 font-sans text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
              program === id ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
              next === id && "ring-1 ring-white/50 ring-inset",
            )}
          >
            <Tally onAir={program === id} alert={alerts[id]} />
            {MONITORS[id].title}
            {next === id && <span className="text-xs font-medium text-white/60">next</span>}
          </button>
        ))}
      </div>
      <div className="h-1 bg-white/10" aria-hidden>
        {!paused && CYCLE.includes(program) && <div key={program} className="program-fill h-full bg-signal-orange" style={{ "--cycle": `${CYCLE_MS}ms` } as CSSProperties} />}
      </div>

      <div key={program} className="monitor-on flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={cn("flex min-h-0 flex-1 flex-col", program !== "map" && program !== "live" && "lg:zoom-[1.2] 2xl:zoom-[1.45]")}>{body(program)}</div>
      </div>
      <div className="px-4 pb-3 sm:px-6">
        <Ticker items={w.local.length ? w.local : w.data.items} />
      </div>
    </div>
  );
}

function IconButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-lg bg-white/8 text-white transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
    >
      <Icon name={icon} className="text-2xl!" />
    </button>
  );
}
