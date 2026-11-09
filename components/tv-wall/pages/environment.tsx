"use client";

import { ago } from "@/lib/tv-wall/core";
import { Empty, Panel } from "../panel";
import { CityGrid, EnvAlerts, QuakeNote, envAlerts } from "../vitals";
import { useWallData } from "../wall-context";
import { WireList } from "../wire-list";

/** Losses and environment: warnings, the eight cities' weather and air, earthquakes nearby, and accident and disaster reports. */
export function EnvironmentPage() {
  const w = useWallData();
  const alerts = envAlerts(w.data.cities, w.data.quakes);
  const quakes = w.data.quakes;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Panel title="Warnings" sub="Heat, heavy rain, unhealthy air and strong earthquakes" icon="warning" field="ink" alert={alerts.length > 0} className="lg:col-span-12">
        <div className="px-5 pb-5">
          <EnvAlerts alerts={alerts} max={12} />
        </div>
      </Panel>

      <Panel title="Weather and air" sub="The eight divisional cities, now (Open-Meteo)" icon="partly_cloudy_day" field="navy" className="lg:col-span-12" delay={90}>
        <div className="px-5 pb-5">
          <CityGrid cities={w.data.cities} large />
        </div>
      </Panel>

      <Panel title="Earthquakes nearby" sub="Magnitude 2.5 and above, last seven days (USGS)" icon="earthquake" field="cobalt" className="lg:col-span-5" delay={180}>
        <div className="px-5 pb-5">
          {quakes && quakes.length > 0 ? (
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="text-left text-xs text-white/60">
                  <th className="pb-1.5 font-medium">When</th>
                  <th className="pb-1.5 font-medium">Mag.</th>
                  <th className="pb-1.5 font-medium">Where</th>
                  <th className="pb-1.5 text-right font-medium">From Dhaka</th>
                </tr>
              </thead>
              <tbody>
                {quakes.map((q) => (
                  <tr key={q.id} className="border-t border-white/8">
                    <td className="py-1.5 pr-2 whitespace-nowrap text-white/75" suppressHydrationWarning>
                      {ago(q.time, w.now)}
                    </td>
                    <td className="py-1.5 pr-2 font-semibold text-white tabular-nums">{q.mag}</td>
                    <td className="py-1.5 pr-2">
                      <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-signal-orange">
                        {q.place}
                      </a>
                    </td>
                    <td className="py-1.5 text-right text-white/80 tabular-nums">{q.km} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <QuakeNote quakes={quakes} now={w.now} />
          )}
        </div>
      </Panel>

      <Panel title="Accidents and disasters" sub={`${w.losses.length} reports in the last ${w.hours} h`} icon="flood" field="ink" className="lg:col-span-7" delay={270}>
        <WireList items={w.losses} now={w.now} fresh={w.fresh} limit={60} className="max-h-[36rem]" empty={<Empty icon="check_circle" title="No accidents or disasters reported" body="The collectors found no such headlines in this window." />} />
      </Panel>
    </div>
  );
}
