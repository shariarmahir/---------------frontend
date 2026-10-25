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
 *   />
 *
 * Pass the same `cases`/`units` arrays from the store each tick (markers move
 * in place). `focus` is applied when it changes, not every tick. The map is
 * supplementary: keep every case in a list beside it.
 */
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { MapViewProps } from "./map-canvas";

export type { MapViewProps };

const MapSkeleton = () => <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-bdnavy-900 motion-reduce:animate-none" />;

const MapCanvas = dynamic(() => import("./map-canvas"), { ssr: false, loading: MapSkeleton });

export function MapView(props: MapViewProps) {
  return (
    <div className={cn("relative isolate min-h-64 overflow-hidden bg-black", props.className)}>
      <MapCanvas {...props} />
    </div>
  );
}
