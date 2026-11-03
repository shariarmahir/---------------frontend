"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Map as MapLibre, Marker, ScaleControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Icon } from "@/components/ui/icon";
import { BD_BOUNDS } from "@/lib/motherland-geo";
import { travelMapStyle } from "@/lib/motherland-map-style";
import { cn } from "@/lib/utils";

/**
 * The library finds its worker from its own address, which a bundler changes,
 * so we serve a copy. Chrome won't start a worker straight from the service
 * worker's saved copy without a network, so we start it from a blob of the
 * file instead, which works both online and offline.
 */
let workerSet: Promise<void> | null = null;
const prepareWorker = () =>
  (workerSet ??= fetch("/vendor/maplibre-gl-worker.mjs")
    .then((r) => {
      if (!r.ok) throw new Error("map worker missing");
      return r.blob();
    })
    .then((code) => setWorkerUrl(URL.createObjectURL(new Blob([code], { type: "text/javascript" })))));

export interface CanvasPin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** The ring's colour. */
  color: string;
  picture?: { src: string; focus?: string };
  selected: boolean;
  dim: boolean;
  marked: boolean;
}

/** A pin with the place's own photograph in it, so the map reads as somewhere to go. */
function Pin({ map, pin, onPick }: { map: MapLibre; pin: CanvasPin; onPick: (id: string) => void }) {
  const [el] = useState(() => document.createElement("div"));

  const marker = useRef<Marker | null>(null);

  useEffect(() => {
    const placed = new Marker({ element: el, anchor: "bottom" }).setLngLat([pin.lon, pin.lat]).addTo(map);
    marker.current = placed;
    return () => void placed.remove();
  }, [map, el, pin.lat, pin.lon]);

  useEffect(() => {
    marker.current?.getElement().style.setProperty("z-index", pin.selected ? "3" : pin.dim ? "0" : "1");
  }, [pin.selected, pin.dim]);

  return createPortal(
    <button
      type="button"
      aria-label={pin.name}
      aria-pressed={pin.selected}
      disabled={pin.dim}
      onClick={(e) => {
        e.stopPropagation();
        onPick(pin.id);
      }}
      className={cn("group/pin ml-pin relative flex cursor-pointer flex-col items-center transition-opacity duration-300 focus-visible:outline-none disabled:pointer-events-none", pin.dim && "opacity-20", pin.selected && "is-selected")}
      style={{ "--pin": pin.color } as React.CSSProperties}
    >
      <span className="ml-pin-name pointer-events-none absolute bottom-full mb-1.5 rounded-md bg-black/85 px-2 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover/pin:opacity-100 group-focus-visible/pin:opacity-100">{pin.name}</span>
      <span className="ml-pin-face relative block overflow-hidden rounded-full bg-black shadow-[0_6px_16px_rgb(0_0_0/0.6)] ring-2 ring-(--pin) transition-[width,height] duration-300 group-focus-visible/pin:ring-4">
        {pin.picture ? <Image src={pin.picture.src} alt="" fill sizes="56px" className="object-cover" style={{ objectPosition: pin.picture.focus }} /> : <Icon name="add_location" className="absolute inset-0 m-auto grid size-full place-items-center text-lg text-(--pin)" />}
      </span>
      <span aria-hidden className="-mt-px h-1.5 w-2.5 bg-(--pin) [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      {pin.marked ? <span aria-hidden className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-black" /> : null}
    </button>,
    el,
  );
}

function CenterPin({ offset }: { offset: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-full" style={{ left: `calc(50% + ${offset}px)` }}>
      <Icon name="location_on" className="text-5xl! text-signal-orange drop-shadow-[0_6px_10px_rgb(0_0_0/0.7)]" />
    </div>
  );
}

const ICON_BUTTON = "grid size-11 place-items-center bg-black/75 text-white backdrop-blur transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white";

/**
 * The real map (MapLibre, loaded only when the visitor nears it). It never
 * traps the page's scroll: a wheel needs Ctrl, and a phone needs two fingers.
 */
export default function MapCanvas({
  pins,
  focus,
  you,
  adding,
  satellite,
  tilt,
  leftPad,
  onPick,
  onCenter,
  onReady,
  onFail,
}: {
  pins: CanvasPin[];
  focus: { lat: number; lon: number } | null;
  you: { lat: number; lon: number } | null;
  adding: boolean;
  satellite: boolean;
  tilt: boolean;
  /** Room the floating panel takes on the left, so the country sits in what's left. */
  leftPad: number;
  onPick: (id: string) => void;
  onCenter: (c: { lat: number; lon: number }) => void;
  onReady: () => void;
  onFail: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [made, setMap] = useState<MapLibre | null>(null);
  // A removed map has no style, and touching it throws: treat it as no map at all.
  const map = made?.style ? made : null;
  const [zoom, setZoom] = useState(6);
  const addingRef = useRef(adding);
  const events = useRef({ onCenter, onReady, onFail });

  useEffect(() => {
    addingRef.current = adding;
    events.current = { onCenter, onReady, onFail };
  });

  useEffect(() => {
    let gone = false;
    let instance: MapLibre | null = null;

    const start = () => {
      if (gone || !box.current) return;
      const map = new MapLibre({
        container: box.current,
        style: travelMapStyle(),
        bounds: BD_BOUNDS,
        fitBoundsOptions: { padding: { top: 30, bottom: 30, left: 30 + leftPad, right: 30 } },
        minZoom: 5,
        maxZoom: 16,
        maxBounds: [
          [84, 18],
          [97, 29],
        ],
        cooperativeGestures: true,
        attributionControl: { compact: true },
        dragRotate: true,
      });
      instance = map;
      map.setPadding({ left: leftPad, top: 0, right: 0, bottom: 0 });
      map.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");
      map.on("load", () => {
        if (!leftPad) {
          // On a phone the map credits start folded, behind their (i) button, so they don't cover the map.
          const credits = box.current?.querySelector(".maplibregl-ctrl-attrib");
          credits?.classList.remove("maplibregl-compact-show");
          credits?.removeAttribute("open");
        }
        setMap(map);
        setZoom(map.getZoom());
        events.current.onReady();
      });
      map.on("zoom", () => setZoom(map.getZoom()));
      map.on("moveend", () => {
        const c = map.getCenter();
        events.current.onCenter({ lat: c.lat, lon: c.lng });
      });
      map.on("click", (e) => {
        if (addingRef.current) map.easeTo({ center: e.lngLat, duration: 500 });
      });
    };

    prepareWorker()
      .then(start)
      .catch(() => events.current.onFail());

    return () => {
      gone = true;
      setMap(null);
      instance?.remove();
    };
    // The map is made once; the padding follows below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    map?.setPadding({ left: leftPad, top: 0, right: 0, bottom: 0 });
  }, [map, leftPad]);

  useEffect(() => {
    if (!map) return;
    map.setLayoutProperty("satellite", "visibility", satellite ? "visible" : "none");
    map.setLayoutProperty("hillshade", "visibility", satellite ? "none" : "visible");
  }, [map, satellite]);

  useEffect(() => {
    if (!map) return;
    map.setTerrain(tilt ? { source: "dem-3d", exaggeration: 1.8 } : null);
    map.easeTo({ pitch: tilt ? 58 : 0, bearing: tilt ? -14 : 0, duration: 900 });
  }, [map, tilt]);

  useEffect(() => {
    if (!map) return;
    if (focus) map.flyTo({ center: [focus.lon, focus.lat], zoom: 11, duration: 2400, essential: false });
    else map.fitBounds(BD_BOUNDS, { padding: { top: 30, bottom: 30, left: 30, right: 30 }, duration: 1400, essential: false });
  }, [map, focus]);

  useEffect(() => {
    if (!map || !you) return;
    const dot = document.createElement("div");
    dot.className = "ml-you";
    dot.setAttribute("aria-label", "You are here");
    const marker = new Marker({ element: dot }).setLngLat([you.lon, you.lat]).addTo(map);
    map.flyTo({ center: [you.lon, you.lat], zoom: 11, duration: 2000, essential: false });
    return () => void marker.remove();
  }, [map, you]);

  return (
    <>
      {/* The library makes its own box position: relative, so this wrapper does the filling. */}
      <div className="absolute inset-0">
        <div ref={box} className={cn("size-full", zoom >= 8.5 && "ml-map-near", adding && "[&_canvas]:cursor-crosshair!")} />
      </div>
      {adding ? <CenterPin offset={leftPad / 2} /> : null}
      {map ? pins.map((pin) => <Pin key={pin.id} map={map} pin={pin} onPick={onPick} />) : null}
      {map ? (
        <div className="absolute right-3 bottom-28 z-10 flex flex-col overflow-hidden rounded-xl ring-1 ring-white/15 sm:right-4">
          <button type="button" aria-label="Zoom in" onClick={() => map.zoomIn()} className={ICON_BUTTON}>
            <Icon name="zoom_in" className="text-xl" />
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => map.zoomOut()} className={cn(ICON_BUTTON, "border-t border-white/15")}>
            <Icon name="zoom_out" className="text-xl" />
          </button>
        </div>
      ) : null}
    </>
  );
}
