"use client";

/*
 * The live street map for the command dashboard (Leaflet + OpenStreetMap,
 * loaded from cdnjs in the browser only). Give it a size; it fills it.
 *
 *   const cases = useCommand((w) => w.cases);
 *   const units = useCommand((w) => w.units);
 *   <MapView
 *     className="h-[60dvh] rounded-xl ring-1 ring-white/12"
 *     cases={cases ?? []}
 *     units={units ?? []}
 *     selectedId={selected ?? undefined}
 *     onSelect={setSelected}
 *     focus={selected ? "selection" : "country"}
 *     showUnits={["station", "patrol"]}
 *     pins={[{ id: "bz-01", lat: 23.8, lng: 90.4, label: "A business" }]} // optional fixed places
 *   />
 *
 * Optional layers and modes:
 *   focus={divisionFocus(div)}  // "country", or { bounds } framing a division (division-picker.tsx)
 *   heat={spots}                // HeatSpot[]: translucent circles under the markers, gold, red only when critical
 *   sos                         // open SOS cases get a pulsing red ring (no pulse under reduced motion)
 *   privacy                     // Women safety: dots shifted up to ~300 m, labels show case number and area only
 *
 * Pass the same `cases`/`units` arrays from the store each tick (markers move
 * in place), and a stable `pins`/`heat` array (useMemo or a store selector).
 * `focus` is applied when its value changes, not every tick. The map is
 * supplementary: keep every case and hotspot in a list beside it.
 */
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { HeatSpot, MapBounds, MapViewProps } from "./map-canvas";

export type { HeatSpot, MapBounds, MapViewProps };

const MapSkeleton = () => <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-bdnavy-900 motion-reduce:animate-none" />;

const MapCanvas = dynamic(() => import("./map-canvas"), { ssr: false, loading: MapSkeleton });

export function MapView(props: MapViewProps) {
  return (
    // Leaflet's own attribution is dark-blue links on translucent white; here it is white text on solid black (>= 4.5:1).
    <div
      className={cn(
        "relative isolate min-h-64 overflow-hidden bg-black [&_.leaflet-control-attribution]:bg-black/85! [&_.leaflet-control-attribution]:text-white/85! [&_.leaflet-control-attribution_a]:text-white! [&_.leaflet-control-attribution_a]:underline!",
        props.className,
      )}
    >
      <MapCanvas {...props} />
    </div>
  );
}
