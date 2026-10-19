"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { districtShapes } from "@/data/tv-wall/districts-map";
import { ZONE_HEX } from "@/lib/tv-wall/geo";
import { cn } from "@/lib/utils";
import { RiskMapSvg, ZoneLegend } from "../crime-map";
import GoogleRiskMap from "../google-map";
import { DIVISION_NAME, LEVEL_NAME } from "../labels";
import { Empty, Panel } from "../panel";
import { useWallData } from "../wall-context";
import { WireList } from "../wire-list";

const BY_ID = new Map(districtShapes.map((d) => [d.id, d]));
type Layer = "google" | "risk";

/**
 * The crime map: Google Maps of Bangladesh with the red zones plotted on it
 * (once a Maps key is set), or the district risk layer on the real
 * boundaries. Beside it every reporting district, ranked, and the chosen
 * district's reports.
 */
export function MapPage() {
  const w = useWallData();
  const [layer, setLayer] = useState<Layer>("google");
  const ranked = [...w.readings].sort((a, b) => b.score - a.score || b.count - a.count);
  const chosen = w.district ? BY_ID.get(w.district) : null;
  const chosenReading = w.district ? w.readings.find((r) => r.id === w.district) : undefined;

  const layerSwitch = (
    <div role="radiogroup" aria-label="Map layer" className="flex shrink-0 rounded-lg bg-black/35 p-1 ring-1 ring-white/10">
      {(
        [
          ["google", "Google Maps", "map"],
          ["risk", "Risk layer", "layers"],
        ] as const
      ).map(([id, label, icon]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={layer === id}
          onClick={() => setLayer(id)}
          className={cn(
            "inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 font-sans text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
            layer === id ? "bg-signal-orange text-text-primary" : "text-white/80 hover:text-white",
          )}
        >
          <Icon name={icon} className="text-base!" />
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Map of Bangladesh"
          sub={layer === "google" ? "Google Maps · circles sized by reported crime" : "64 districts on their real boundaries"}
          icon="map"
          field="navy"
          alert={w.pings.length > 0}
          action={layerSwitch}
          className="lg:col-span-8"
          footer={
            <span className="flex flex-wrap items-center justify-between gap-2">
              <ZoneLegend />
              <span>From published headlines, not police records</span>
            </span>
          }
        >
          <div className="px-3 pb-3">
            {layer === "google" ? (
              <GoogleRiskMap readings={w.readings} pings={w.pings} selected={w.district} onSelect={w.setDistrict} height="min(72dvh, 46rem)" />
            ) : (
              <div className="h-[min(72dvh,46rem)]">
                <RiskMapSvg readings={w.readings} pings={w.pings} selected={w.district} onSelect={w.setDistrict} division={w.division} className="h-full" />
              </div>
            )}
          </div>
        </Panel>

        <div className="grid content-start gap-4 lg:col-span-4">
          <Panel title={chosen ? chosen.en : "Choose a district"} sub={chosen ? `${DIVISION_NAME.get(chosen.division)} division` : "On the map or from the list below"} icon="location_on" field="cobalt" delay={90}>
            {chosen ? (
              <>
                <div className="flex items-center gap-3 px-5 pb-3">
                  <span className="size-3 rounded-[3px] ring-1 ring-white/20" style={{ background: ZONE_HEX[chosenReading?.level ?? 0] }} />
                  <span className="font-sans text-sm text-white">
                    {chosenReading ? `${chosenReading.count} report${chosenReading.count === 1 ? "" : "s"} · ${LEVEL_NAME[chosenReading.level]}` : "No crime reported in this window"}
                  </span>
                  <button type="button" onClick={() => w.setDistrict(null)} className="ml-auto font-sans text-xs font-semibold text-signal-orange hover:underline">
                    Clear
                  </button>
                </div>
                <WireList items={w.harm} now={w.now} fresh={w.fresh} limit={6} className="max-h-[22rem] border-t border-white/10" empty={<Empty icon="verified_user" title="Nothing reported here" body="No crime or corruption reports from this district in the window." />} />
              </>
            ) : (
              <p className="px-5 pb-5 font-sans text-sm text-white/75">Click a district on the map, or pick one from the ranking, to see what is being reported there.</p>
            )}
          </Panel>

          <Panel title="Districts by reports" sub={`${ranked.length} reporting in the last ${w.hours} h`} icon="format_list_numbered" field="ink" delay={180}>
            {ranked.length ? (
              <ol className="max-h-[26rem] overflow-y-auto px-2 pb-3">
                {ranked.map((r, n) => {
                  const on = w.district === r.id;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => w.setDistrict(on ? null : r.id)}
                        className={cn(
                          "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left font-sans text-sm transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                          on ? "bg-signal-orange text-text-primary" : "text-white hover:bg-white/8",
                        )}
                      >
                        <span className={cn("w-5 text-right text-xs tabular-nums", on ? "text-text-primary/70" : "text-white/50")}>{n + 1}</span>
                        <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: ZONE_HEX[r.level] }} />
                        <span className="flex-1 font-semibold">{r.name}</span>
                        <span className={cn("text-xs", on ? "text-text-primary/75" : "text-white/60")}>{LEVEL_NAME[r.level]}</span>
                        <span className="w-8 text-right tabular-nums">{r.count}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <Empty icon="verified_user" title="No district reporting" body="No crime or corruption report named a district in this window." />
            )}
          </Panel>
        </div>
      </div>

      <Panel title="Reports in view" sub={chosen ? `From ${chosen.en}` : w.division ? `From ${DIVISION_NAME.get(w.division)} division` : "From all Bangladesh"} icon="gavel" field="ink" delay={270}>
        <WireList items={w.harm} now={w.now} fresh={w.fresh} limit={30} className="max-h-[36rem]" empty={<Empty icon="verified_user" title="No reports" body="Nothing reported for this place in this window." />} />
      </Panel>
    </div>
  );
}
