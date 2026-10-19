import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { DISTRICT_MAP_SOURCE } from "@/data/tv-wall/districts-map";
import { CENSUS_SOURCE, PLANNED_SOURCES, VITAL_SOURCES } from "@/data/tv-wall/sources";
import type { FeedStatus } from "@/lib/tv-wall/server";
import { cn } from "@/lib/utils";
import { Panel } from "./panel";

const WAYS = [
  { icon: "connected_tv", title: "Run it on a TV", body: "Open /tv-wall/tv in an Android TV or smart-TV browser. The wall changes screens by itself; the remote's left and right buttons move between them, the centre button pauses." },
  { icon: "live_tv", title: "Stream it live", body: "In OBS Studio, add /tv-wall/tv as a Browser Source (1920×1080), then stream to YouTube Live or Facebook Live." },
  { icon: "code", title: "Put it on your site or app", body: "Copy the embed code from Share & embed, or open the TV link in an app WebView. All the data is free at /api/tv-wall." },
];

/**
 * Where every figure comes from (with each collector's state right now),
 * what the wall cannot read yet, and the ways to put it on a TV, a live
 * stream or another site.
 */
export function OpenBand({ feeds }: { feeds: FeedStatus[] }) {
  const up = feeds.filter((f) => f.ok).length;
  return (
    <div className="grid gap-4">
      <ul className="grid gap-4 md:grid-cols-3">
        {WAYS.map((w, i) => (
          <li key={w.title} className={cn("monitor-on rounded-2xl p-5 ring-1 ring-white/12", ["bg-bdnavy-900", "bg-text-primary", "bg-cobalt"][i])}>
            <Icon name={w.icon} className="text-3xl! text-signal-orange" />
            <h3 className="mt-3 font-grotesk text-lg font-bold text-signal-orange">{w.title}</h3>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-white/85">{w.body}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title="Collectors right now" sub={`${up} of ${feeds.length} news collectors answering · each reads every two minutes`} icon="sensors" field="ink">
          <ul className="grid gap-1.5 px-5 pb-5 sm:grid-cols-2">
            {feeds.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 font-sans text-sm">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full", f.ok ? "bg-signal-orange" : "bg-national-crimson")} />
                <span className="min-w-0 flex-1 truncate text-white">{f.label}</span>
                <span className="shrink-0 text-xs text-white/65 tabular-nums">{f.ok ? `${f.count} items` : "down"}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-4">
          <Panel title="Other sources" icon="dataset" field="navy">
            <ul className="space-y-1.5 px-5 pb-5 font-sans text-sm text-white/85">
              {VITAL_SOURCES.map((v) => (
                <li key={v.id}>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link-blue hover:underline">
                    {v.name}
                  </a>
                  : {v.use}
                </li>
              ))}
              <li>
                <a href={DISTRICT_MAP_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link-blue hover:underline">
                  geoBoundaries
                </a>
                : district boundaries ({DISTRICT_MAP_SOURCE.license})
              </li>
              <li>
                <a href={CENSUS_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link-blue hover:underline">
                  BBS
                </a>
                : Census 2022, division populations
              </li>
            </ul>
          </Panel>
          <Panel title="Not read yet" icon="pending" field="cobalt">
            <ul className="space-y-1.5 px-5 font-sans text-sm text-white/85">
              {PLANNED_SOURCES.map((p) => (
                <li key={p.name}>
                  <span className="font-semibold text-white">{p.name}</span>: {p.why}
                </li>
              ))}
            </ul>
            <div className="px-5 pt-4 pb-5">
              <Link href="/protibad" className={cn(btn.gold, "min-h-10 px-4 py-2 text-sm")}>
                <Icon name="campaign" className="text-lg!" />
                Raise a protest
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
