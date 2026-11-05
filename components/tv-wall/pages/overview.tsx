"use client";

import Link from "next/link";
import { aqiBand, ago, divisionStats } from "@/lib/tv-wall/core";
import { cn } from "@/lib/utils";
import { DivisionRisk, HourlyChart, Verdict, verdictLines } from "../analysis";
import { RiskMapSvg, ZoneLegend } from "../crime-map";
import { District3DLazy } from "../district-3d-lazy";
import { fmt, placeOf, typeOf } from "../labels";
import { isLive } from "../live-tv";
import { Panel, PanelLink, Stat } from "../panel";
import { Ticker } from "../ticker";
import { useWallData } from "../wall-context";
import { markOf } from "../wire-list";

/**
 * The whole country at a glance: the headline figures, the 3D risk relief,
 * the day's reading and each division's risk, the latest serious reports
 * and the last 24 hours. Every figure links to the page that explains it.
 */
export function OverviewPage() {
  const w = useWallData();
  const stats = divisionStats(w.national, w.hours);
  const redZones = w.readings.filter((r) => r.level === 3).length;
  const violent6h = w.harm.filter((i) => i.category === "crime" && i.severity === 3 && w.now - i.publishedAt < 6 * 3_600_000).length;
  const usd = w.data.fx?.rates.find((r) => r.code === "USD");
  const dhaka = w.data.cities?.find((c) => c.id === "dhaka");
  const serious = w.harm.filter((i) => i.severity >= 2).slice(0, 8);
  const channels = w.data.channels.filter(isLive);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Crime & corruption" value={fmt(w.harm.length)} sub={`reports, last ${w.hours} h`} icon="gavel" field="ink" href="/tv-wall/crime" alert={violent6h > 0} delay={0} />
        <Stat label="Red-zone districts" value={String(redZones)} sub={`of 64 · ${w.readings.length} reporting`} icon="map" field="navy" href="/tv-wall/map" delay={60} />
        <Stat label="Violent, last 6 h" value={String(violent6h)} sub="murder, rape, abduction" icon="emergency" field="cobalt" href="/tv-wall/crime" delay={120} />
        <Stat label="Achievements" value={fmt(w.gains.length)} sub="achievement and development" icon="emoji_events" field="ink" href="/tv-wall/gains" delay={180} />
        <Stat label="US dollar" value={usd ? `৳${fmt(usd.bdt, 2)}` : "—"} sub="mid-market rate" icon="currency_exchange" field="navy" href="/tv-wall/economy" delay={240} />
        <Stat
          label="Dhaka air"
          value={dhaka?.aqi != null ? `AQI ${dhaka.aqi}` : "—"}
          sub={dhaka?.aqi != null ? aqiBand(dhaka.aqi).en : "reading unavailable"}
          icon="masks"
          field="cobalt"
          href="/tv-wall/environment"
          alert={(dhaka?.aqi ?? 0) > 150}
          delay={300}
        />
      </div>

      <Ticker items={w.local.length ? w.local : w.data.items} />

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Bangladesh risk relief"
          sub="Height and colour show reported crime by district · drag to turn"
          icon="view_in_ar"
          field="navy"
          alert={w.pings.length > 0}
          action={<PanelLink href="/tv-wall/map">Open the map</PanelLink>}
          className="lg:col-span-8"
          bodyClassName="h-[26rem] sm:h-[34rem]"
          footer={
            <span className="flex flex-wrap items-center justify-between gap-2">
              <ZoneLegend />
              <span>From published headlines, not police records · boundaries: geoBoundaries (CC0)</span>
            </span>
          }
        >
          <District3DLazy
            readings={w.readings}
            pings={w.pings}
            selected={w.district}
            onSelect={w.setDistrict}
            windowHours={w.hours}
            fallback={<RiskMapSvg readings={w.readings} pings={w.pings} selected={w.district} onSelect={w.setDistrict} division={w.division} className="px-3 pb-3" />}
          />
        </Panel>

        <div className="grid gap-4 lg:col-span-4">
          <Panel title="Today's reading" sub="Built from this window's reports" icon="insights" field="cobalt" delay={90}>
            <div className="px-5 pb-5">
              <Verdict lines={verdictLines(w.local, stats, w.division)} />
            </div>
          </Panel>
          <Panel title="Division risk" sub="Reports against population" icon="query_stats" field="ink" delay={180} action={<PanelLink href="/tv-wall/analysis">Analysis</PanelLink>}>
            <div className="px-5 pb-5">
              <DivisionRisk stats={stats} division={w.division} onDivision={(id) => w.setDivision(w.division === id ? null : id)} />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Latest serious reports" sub="Violent crime and corruption, newest first" icon="notifications_active" field="ink" className="lg:col-span-8" action={<PanelLink href="/tv-wall/crime">All reports</PanelLink>} delay={270}>
          {serious.length ? (
            <div className="overflow-x-auto px-2 pb-3">
              <table className="w-full min-w-[40rem] border-collapse font-sans text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/60">
                    <th className="px-3 pb-2 font-medium">When</th>
                    <th className="px-3 pb-2 font-medium">Where</th>
                    <th className="px-3 pb-2 font-medium">What</th>
                    <th className="px-3 pb-2 font-medium">Headline</th>
                  </tr>
                </thead>
                <tbody>
                  {serious.map((i) => (
                    <tr key={i.id} className={cn("border-t border-white/8 align-top", w.fresh.has(i.id) && "wire-in")}>
                      <td className="px-3 py-2.5 whitespace-nowrap text-white/70 tabular-nums" suppressHydrationWarning>
                        <span aria-hidden className={cn("mr-2 inline-block size-2 rounded-full", markOf(i))} />
                        {ago(i.publishedAt, w.now)}
                      </td>
                      <td className="px-3 py-2.5 font-semibold whitespace-nowrap text-white">{placeOf(i) ?? "—"}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-white/80">{typeOf(i)}</td>
                      <td className="px-3 py-2.5">
                        <a href={i.url} target="_blank" rel="noopener noreferrer" lang={i.lang} className={cn("font-semibold text-white hover:text-signal-orange", i.lang === "bn" && "font-bengali")}>
                          {i.title}
                        </a>
                        <span className="mt-0.5 block text-xs text-white/55">
                          {i.source}
                          {i.alsoIn.length > 0 && <span className="text-link-blue"> + {i.alsoIn.length} more</span>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 pb-5 font-sans text-sm text-white/70">No serious reports in this window.</p>
          )}
        </Panel>

        <div className="grid gap-4 lg:col-span-4">
          <Panel title="Last 24 hours" sub="Reports per hour" icon="bar_chart" field="navy" delay={360}>
            <div className="px-5 pb-5">
              <HourlyChart items={w.division ? w.data.items.filter((i) => i.division === w.division) : w.data.items} now={w.now} />
            </div>
          </Panel>
          <Panel title="On air now" sub={`${channels.length} channel${channels.length === 1 ? "" : "s"} live`} icon="live_tv" field="cobalt" delay={450} action={<PanelLink href="/tv-wall/live">Watch</PanelLink>}>
            <ul className="flex flex-wrap gap-1.5 px-5 pb-5">
              {w.data.channels.map((c) => (
                <li key={c.id}>
                  <Link
                    href="/tv-wall/live"
                    className={cn(
                      "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 font-sans text-xs font-semibold",
                      isLive(c) ? "bg-black/35 text-white hover:bg-black/55" : "pointer-events-none bg-black/20 text-white/40",
                    )}
                  >
                    <span aria-hidden className={cn("size-1.5 rounded-full", isLive(c) ? "bg-signal-orange" : "bg-white/30")} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
