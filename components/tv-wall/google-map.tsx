"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { districtShapes } from "@/data/tv-wall/districts-map";
import { BD_BOUNDS, BD_CENTER, DISTRICT_LATLNG, ZONE_HEX, type DistrictReading, type MapLayerProps } from "@/lib/tv-wall/geo";
import { cn } from "@/lib/utils";

/*
 * The few parts of the Google Maps JavaScript API this layer uses. We load the
 * script ourselves (no @googlemaps packages), so these narrow interfaces stand
 * in for @types/google.maps.
 */
interface LatLng {
  lat: number;
  lng: number;
}

interface LatLngBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface MapsListener {
  remove(): void;
}

interface MapStyle {
  featureType?: string;
  elementType?: string;
  stylers: Record<string, string | number>[];
}

interface MapOptions {
  center: LatLng;
  zoom: number;
  minZoom?: number;
  restriction?: { latLngBounds: LatLngBounds; strictBounds: boolean };
  mapTypeControl?: boolean;
  mapTypeControlOptions?: { mapTypeIds: string[] };
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
  backgroundColor?: string;
  clickableIcons?: boolean;
  styles?: MapStyle[];
}

interface GMap {
  fitBounds(bounds: LatLngBounds, padding?: number): void;
  panTo(latLng: LatLng): void;
  setZoom(zoom: number): void;
}

interface CircleOptions {
  center?: LatLng;
  radius?: number;
  map?: GMap | null;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  clickable?: boolean;
  zIndex?: number;
}

interface GCircle {
  setOptions(options: CircleOptions): void;
  setMap(map: GMap | null): void;
  addListener(event: "click", handler: () => void): MapsListener;
}

interface GInfoWindow {
  setContent(content: Node): void;
  setPosition(latLng: LatLng): void;
  open(options: { map: GMap }): void;
  close(): void;
  addListener(event: "closeclick", handler: () => void): MapsListener;
}

interface MapsApi {
  Map: new (el: HTMLElement, options: MapOptions) => GMap;
  Circle: new (options: CircleOptions) => GCircle;
  InfoWindow: new (options?: { maxWidth?: number }) => GInfoWindow;
  importLibrary?: (name: string) => Promise<unknown>;
}

declare global {
  interface Window {
    google?: { maps?: MapsApi };
    __kandariMapsReady?: () => void;
    gm_authFailure?: () => void;
  }
}

/** The browser key, inlined at build time. Empty means "show the plain embed". */
const KEY = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();

/**
 * The owner's Google Maps embed, re-centred on the whole country: in the `pb`
 * string `!1d` is the view's span in metres, `!2d` the longitude, `!3d` the latitude.
 */
const EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2100000!2d90.3!3d23.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1792380682812!5m2!1sen!2sbd";

const PAD = 1.5;
const RESTRICTION: LatLngBounds = {
  north: BD_BOUNDS.north + PAD,
  south: BD_BOUNDS.south - PAD,
  west: BD_BOUNDS.west - PAD,
  east: BD_BOUNDS.east + PAD,
};

const GOLD = "#e4b027";
const PING = "#ff6a5c";

/**
 * Dark roadmap to sit on the dashboard's pitch black and navy. Styler colours
 * take no alpha, so the province lines are #8fa1e3 pre-blended at 60% over the
 * navy ground (#5a6aa5). `styles` is ignored when a mapId is set, so none is.
 */
const DARK_STYLE: MapStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b1849" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c9d1e8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#03060f" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#5a6aa5" }, { weight: 1 }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#8fa1e3" }, { weight: 1.4 }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#101f57" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#16286b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8fa1e3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#03060f" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5a6aa5" }] },
];

/* ---------------------------------------------------------------- loader */

let loading: Promise<MapsApi> | null = null;
let authRejected = false;
const authListeners = new Set<() => void>();

/** Load the Maps JavaScript API once per page; rejects if the script fails or the key is refused. */
function loadMaps(key: string): Promise<MapsApi> {
  if (authRejected) return Promise.reject(new Error("rejected"));
  loading ??= new Promise<MapsApi>((resolve, reject) => {
    // Google calls this when it refuses the key (wrong referrer, API not enabled, billing).
    window.gm_authFailure = () => {
      authRejected = true;
      for (const notify of authListeners) notify();
    };
    window.__kandariMapsReady = () => {
      const maps = window.google?.maps;
      if (!maps) return reject(new Error("no api"));
      // With loading=async the classes are filled in by importLibrary; older loads already have them.
      const libs = maps.importLibrary ? Promise.all([maps.importLibrary("core"), maps.importLibrary("maps")]) : Promise.resolve();
      libs.then(() => resolve(maps), reject);
    };
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__kandariMapsReady`;
    s.async = true;
    s.onerror = () => {
      loading = null;
      s.remove();
      reject(new Error("script failed"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/* --------------------------------------------------------------- helpers */

/** A red zone's radius in metres, growing with the square root of its score. */
const radiusFor = (score: number) => Math.min(6000 + Math.sqrt(Math.max(0, score)) * 7000, 40000);

const NAME_BY_ID = new Map(districtShapes.map((d) => [d.id, d.en]));

/** The InfoWindow's body, built node by node: headlines come from news feeds, so never innerHTML. */
function infoContent(id: string, reading: DistrictReading | undefined): HTMLElement {
  const box = document.createElement("div");
  box.style.cssText = "font-family:inherit;color:#0a0a0a;max-width:16rem;line-height:1.4";

  const name = document.createElement("strong");
  name.style.cssText = "display:block;font-size:14px";
  name.textContent = reading?.name ?? NAME_BY_ID.get(id) ?? id;
  box.appendChild(name);

  const count = document.createElement("div");
  count.style.cssText = "font-size:12px;margin-top:2px";
  const n = reading?.count ?? 0;
  count.textContent = `${n} ${n === 1 ? "report" : "reports"}`;
  box.appendChild(count);

  if (reading?.top) {
    const link = document.createElement("a");
    link.href = reading.top.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.cssText = "display:block;margin-top:6px;font-size:12px;color:#0b1849;text-decoration:underline";
    link.textContent = reading.top.title;
    box.appendChild(link);

    const source = document.createElement("div");
    source.style.cssText = "font-size:12px;margin-top:2px;color:#0a0a0a;opacity:.7";
    source.textContent = reading.top.source;
    box.appendChild(source);
  }
  return box;
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------- component */

type Status = "nokey" | "loading" | "ready" | "rejected" | "failed";

interface Live {
  api: MapsApi;
  map: GMap;
  info: GInfoWindow;
  circles: Map<string, { circle: GCircle; listener: MapsListener }>;
  listeners: MapsListener[];
}

/**
 * The full Google map of Bangladesh with the wall's red zones on it. With
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY set it loads the Maps JavaScript API and
 * draws one circle per district reading (plus pulsing rings for pings);
 * without a key, or when Google refuses it, it shows the plain embed and says
 * the zones are not on it.
 */
export default function GoogleRiskMap({
  readings,
  pings,
  selected,
  onSelect,
  className,
  height = "min(70dvh, 44rem)",
}: MapLayerProps & { height?: string }) {
  const [status, setStatus] = useState<Status>(KEY ? "loading" : "nokey");
  const ready = status === "ready";

  const el = useRef<HTMLDivElement>(null);
  const live = useRef<Live | null>(null);
  const latest = useRef({ readings, selected, onSelect });
  useEffect(() => {
    latest.current = { readings, selected, onSelect };
  });

  // Load the script, and fall back to the embed if Google refuses the key.
  useEffect(() => {
    if (!KEY) return;
    let alive = true;
    const onReject = () => {
      if (alive) setStatus("rejected");
    };
    authListeners.add(onReject);
    loadMaps(KEY).then(
      (api) => {
        if (alive && api) setStatus((s) => (s === "loading" ? "ready" : s));
      },
      () => {
        if (alive) setStatus(authRejected ? "rejected" : "failed");
      },
    );
    return () => {
      alive = false;
      authListeners.delete(onReject);
    };
  }, []);

  // Create the map once the API is in.
  useEffect(() => {
    const api = window.google?.maps;
    if (!ready || !el.current || !api) return;
    const map = new api.Map(el.current, {
      center: BD_CENTER,
      zoom: 7,
      minZoom: 5,
      restriction: { latLngBounds: RESTRICTION, strictBounds: false },
      mapTypeControl: true,
      mapTypeControlOptions: { mapTypeIds: ["roadmap", "satellite"] },
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: "cooperative",
      backgroundColor: "#03060f",
      clickableIcons: false,
      styles: DARK_STYLE,
    });
    map.fitBounds(BD_BOUNDS, 0);
    const info = new api.InfoWindow({ maxWidth: 280 });
    const state: Live = { api, map, info, circles: new Map(), listeners: [] };
    // Closing the window is the same as clearing the selection.
    state.listeners.push(
      info.addListener("closeclick", () => {
        if (latest.current.selected) latest.current.onSelect(null);
      }),
    );
    live.current = state;
    return () => {
      for (const { circle, listener } of state.circles.values()) {
        listener.remove();
        circle.setMap(null);
      }
      state.circles.clear();
      for (const l of state.listeners) l.remove();
      info.close();
      live.current = null;
    };
  }, [ready]);

  // One circle per reading; restyle in place, add the new, drop the gone.
  useEffect(() => {
    const state = live.current;
    if (!ready || !state) return;
    const seen = new Set<string>();
    for (const r of readings) {
      const center = DISTRICT_LATLNG[r.id];
      if (!center) continue;
      seen.add(r.id);
      const hex = ZONE_HEX[r.level];
      const isSel = r.id === selected;
      const options: CircleOptions = {
        center,
        radius: radiusFor(r.score),
        fillColor: hex,
        fillOpacity: 0.55,
        strokeColor: isSel ? GOLD : hex,
        strokeOpacity: 1,
        strokeWeight: isSel ? 3 : 1,
        zIndex: isSel ? 10 : r.level + 1,
      };
      const have = state.circles.get(r.id);
      if (have) {
        have.circle.setOptions(options);
      } else {
        const circle = new state.api.Circle({ ...options, map: state.map, clickable: true });
        const listener = circle.addListener("click", () => {
          const { selected: sel, onSelect: pick } = latest.current;
          pick(sel === r.id ? null : r.id);
        });
        state.circles.set(r.id, { circle, listener });
      }
    }
    for (const [id, { circle, listener }] of state.circles) {
      if (seen.has(id)) continue;
      listener.remove();
      circle.setMap(null);
      state.circles.delete(id);
    }
  }, [ready, readings, selected]);

  // The shared InfoWindow follows the selection and refreshes with the readings.
  useEffect(() => {
    const state = live.current;
    if (!ready || !state) return;
    const at = selected ? DISTRICT_LATLNG[selected] : undefined;
    if (!selected || !at) {
      state.info.close();
      return;
    }
    state.info.setContent(infoContent(selected, readings.find((r) => r.id === selected)));
    state.info.setPosition(at);
    state.info.open({ map: state.map });
  }, [ready, readings, selected]);

  // Fly to the chosen district, or back out to the whole country.
  useEffect(() => {
    const state = live.current;
    if (!ready || !state) return;
    const at = selected ? DISTRICT_LATLNG[selected] : undefined;
    if (at) {
      state.map.panTo(at);
      state.map.setZoom(9);
    } else {
      state.map.fitBounds(BD_BOUNDS, 0);
    }
  }, [ready, selected]);

  // Pulsing rings over districts with a fresh violent report.
  useEffect(() => {
    const state = live.current;
    if (!ready || !state || pings.length === 0) return;
    const rings: { circle: GCircle; base: number }[] = [];
    for (const id of new Set(pings)) {
      const center = DISTRICT_LATLNG[id];
      if (!center) continue;
      const reading = readings.find((r) => r.id === id);
      const base = reading ? radiusFor(reading.score) : 12000;
      const circle = new state.api.Circle({
        center,
        radius: base * 1.3,
        map: state.map,
        fillOpacity: 0,
        strokeColor: PING,
        strokeOpacity: 0.9,
        strokeWeight: 2,
        clickable: false,
        zIndex: 20,
      });
      rings.push({ circle, base });
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    if (!prefersReducedMotion()) {
      const start = performance.now();
      timer = setInterval(() => {
        const phase = ((performance.now() - start) % 1600) / 1600;
        for (const { circle, base } of rings) {
          circle.setOptions({ radius: base * (1 + phase * 0.9), strokeOpacity: 0.9 * (1 - phase) });
        }
      }, 33);
    }
    return () => {
      if (timer) clearInterval(timer);
      for (const { circle } of rings) circle.setMap(null);
    };
  }, [ready, pings, readings]);

  const embed = status === "nokey" || status === "rejected" || status === "failed";
  const note =
    status === "rejected"
      ? "Google Maps key was rejected; showing the plain map."
      : status === "failed"
        ? "Google Maps could not load; showing the plain map."
        : "Red zones appear on Google Maps once NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.";
  const style: CSSProperties = { height };

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl bg-black", className)} style={style}>
      {embed ? (
        <>
          <iframe
            src={EMBED_URL}
            title="Map of Bangladesh (Google Maps)"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
          <p className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-xl bg-black/80 px-3 py-2 font-sans text-xs text-white/80 ring-1 ring-white/12">
            {note}
          </p>
        </>
      ) : (
        <>
          <div
            ref={el}
            role="region"
            aria-label="Google map of Bangladesh with reported crime by district"
            className="absolute inset-0 h-full w-full"
          />
          {status === "loading" && (
            <p className="absolute inset-0 grid place-items-center font-sans text-xs text-white/80" aria-live="polite">
              Loading Google Maps…
            </p>
          )}
        </>
      )}
    </div>
  );
}
