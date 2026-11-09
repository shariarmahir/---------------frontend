"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CHANNELS } from "@/data/tv-wall/sources";
import { cn } from "@/lib/utils";
import { LiveTv, isLive } from "../live-tv";
import { Empty, Panel } from "../panel";
import { useWallData } from "../wall-context";
import { WireList } from "../wire-list";

const YT = new Map(CHANNELS.map((c) => [c.id, c.youtube]));

/**
 * Live news: the chosen channel large, every channel with its on-air state,
 * and the latest reports beside it.
 */
export function LivePage() {
  const w = useWallData();
  const [chosen, setChosen] = useState<string | null>(null);
  const live = w.data.channels.filter(isLive);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Panel title="On air" sub={`${live.length} of ${w.data.channels.length} channels live right now`} icon="live_tv" field="ink" className="lg:col-span-8">
        <div className="px-3 pb-1">
          <LiveTv channels={w.data.channels} large chosen={chosen} onChoose={setChosen} />
        </div>
      </Panel>

      <div className="grid content-start gap-4 lg:col-span-4">
        <Panel title="Channels" sub="Bangladeshi news on YouTube" icon="tv" field="navy" delay={90}>
          <ul className="grid gap-1.5 px-3 pb-3">
            {w.data.channels.map((c) => {
              const on = isLive(c);
              const yt = YT.get(c.id);
              return (
                <li key={c.id} className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2">
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", on ? "bg-signal-orange" : "bg-white/30")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-sans text-sm font-semibold text-white">{c.name}</span>
                    <span className="block font-bengali text-xs text-white/55">{c.nameBn}</span>
                  </span>
                  {on ? (
                    <button
                      type="button"
                      onClick={() => setChosen(c.id)}
                      className="min-h-8 rounded-lg bg-signal-orange px-3 font-sans text-xs font-bold text-text-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      Watch
                    </button>
                  ) : (
                    <span className="font-sans text-xs text-white/50">Off air</span>
                  )}
                  {yt && (
                    <a
                      href={`https://www.youtube.com/channel/${yt}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${c.name} on YouTube`}
                      className="grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <Icon name="open_in_new" className="text-base!" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Latest reports" sub="Every kind, newest first" icon="feed" field="cobalt" delay={180}>
          <WireList items={w.local} now={w.now} fresh={w.fresh} limit={10} className="max-h-[28rem]" empty={<Empty icon="feed" title="No reports yet" body="The collectors have not found headlines in this window." />} />
        </Panel>
      </div>
    </div>
  );
}
