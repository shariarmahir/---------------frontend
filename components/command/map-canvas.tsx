"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { OFFICES } from "@/data/command/consumer";
import { PLACES } from "@/data/command/places";
import { STATIONS } from "@/data/command/stations";
import { etaMin, haversineKm, nearestHome } from "@/lib/command/geo";
import { isOpen } from "@/lib/command/selectors";
import type { Case, LatLng, Unit, UnitKind } from "@/lib/command/types";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export interface MapViewProps {
  cases: Case[];
  units: Unit[];
  selectedId?: string;
  onSelect?(id: string): void;
  /** What to frame: the whole country (default), the selected case with its units, or a point. Applied when it changes. */
  focus?: "country" | "selection" | (LatLng & { zoom: number });
  className?: string;
  /** Unit kinds to draw (default: all). */
  showUnits?: UnitKind[];
}

/*
 * The few parts of Leaflet 1.9 this map uses. Leaflet is loaded from cdnjs at
 * runtime (no npm dependency), so these narrow interfaces stand in for
 * @types/leaflet.
 */
type LL = [number, number];
type LBounds = [LL, LL];

interface TooltipOptions {
  direction?: "top" | "center" | "auto";
  permanent?: boolean;
  className?: string;
  offset?: [number, number];
  opacity?: number;
}

interface LLayer {
  addTo(target: LMap | LLayerGroup): this;
  remove(): this;
  bindTooltip(content: string | HTMLElement, options?: TooltipOptions): this;
  setTooltipContent(content: string | HTMLElement): this;
}

/** Opaque: made by L.divIcon, handed to markers. */
type LIcon = { readonly __leafletIcon: unique symbol };

interface LMarker extends LLayer {
  setLatLng(ll: LL): this;
  setIcon(icon: LIcon): this;
  setZIndexOffset(offset: number): this;
  on(type: "click", fn: () => void): this;
}

interface LPolyline extends LLayer {
  setLatLngs(lls: LL[]): this;
}

interface LLayerGroup {
  addTo(map: LMap): this;
  /** Drops the layer from the group and the map (marker.remove() would leave it in the group). */
  removeLayer(layer: LLayer): this;
}

interface FitOptions {
  padding?: [number, number];
  maxZoom?: number;
  animate?: boolean;
}

/** A map interaction handler (dragging, touchZoom). */
interface LHandler {
  enable(): unknown;
  disable(): unknown;
}

interface LMap {
  dragging?: LHandler;
  touchZoom?: LHandler;
  fitBounds(bounds: LBounds, options?: FitOptions): this;
  setView(center: LL, zoom: number, options?: { animate?: boolean }): this;
  getPane(name: string): HTMLElement | undefined;
  invalidateSize(): this;
  remove(): this;
  attributionControl?: { setPrefix(prefix: string | false): unknown };
}

interface MapOptions {
  zoomControl: boolean;
  attributionControl: boolean;
  keyboard: boolean;
  minZoom: number;
  maxZoom: number;
  maxBounds: LBounds;
  maxBoundsViscosity: number;
  zoomSnap: number;
  zoomAnimation: boolean;
  fadeAnimation: boolean;
  markerZoomAnimation: boolean;
  scrollWheelZoom: boolean;
  dragging: boolean;
  touchZoom: boolean;
}

interface Leaflet {
  map(el: HTMLElement, options: MapOptions): LMap;
  tileLayer(url: string, options: { attribution: string; maxZoom: number }): LLayer;
  marker(ll: LL, options: { icon: LIcon; keyboard: boolean; interactive: boolean; zIndexOffset: number }): LMarker;
  divIcon(options: { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] }): LIcon;
  polyline(
    lls: LL[],
    options: { color: string; weight: number; opacity: number; dashArray: string; interactive: boolean },
  ): LPolyline;
  layerGroup(): LLayerGroup;
}

/* ---------------------------------------------------------------- loader */

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const CSS_SRI = "sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw==";
const JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const JS_SRI = "sha512-puJW3E/qXDqYp9IfhAI54BJEaWIfloJ7JWs7OeD5i6ruC9JZL1gERT1wjtwXFlh7CjE7ZJ+/vcRZRkIYIb6p4g==";

const leafletGlobal = (): Leaflet | undefined => (window as Window & { L?: Leaflet }).L;

/** Append a <link>/<script> and wait for it; a failed one is removed so a later mount can retry. */
function inject(el: HTMLLinkElement | HTMLScriptElement): Promise<void> {
  return new Promise((resolve, reject) => {
    el.onload = () => resolve();
    el.onerror = () => {
      el.remove();
      reject(new Error(`failed to load ${el instanceof HTMLLinkElement ? el.href : el.src}`));
    };
    document.head.appendChild(el);
  });
}

let loading: Promise<Leaflet> | null = null;

/** Load Leaflet's stylesheet and script once per page; rejects if either fails (offline). */
function loadLeaflet(): Promise<Leaflet> {
  loading ??= (async () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_URL;
    link.integrity = CSS_SRI;
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    const steps = [inject(link)];
    if (!leafletGlobal()) {
      const script = document.createElement("script");
      script.src = JS_URL;
      script.async = true;
      script.integrity = JS_SRI;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      steps.push(inject(script));
    }
    // Wait for both to settle, so a fast CSS failure can't let a remount inject a second script.
    const failed = (await Promise.allSettled(steps)).find((r) => r.status === "rejected");
    if (failed) {
      link.remove();
      throw failed.reason;
    }
    const L = leafletGlobal();
    if (!L) throw new Error("Leaflet did not start");
    return L;
  })().catch((e: unknown) => {
    loading = null;
    throw e;
  });
  return loading;
}

/* --------------------------------------------------------------- drawing */

/** Bangladesh's outline, roughly. */
const BD_OUTLINE: LBounds = [
  [20.6, 88.0],
  [26.65, 92.7],
];
const PAD = 0.6;
/** How far the map may be panned: a little wider than the country. */
const MAX_BOUNDS: LBounds = [
  [BD_OUTLINE[0][0] - PAD, BD_OUTLINE[0][1] - PAD],
  [BD_OUTLINE[1][0] + PAD, BD_OUTLINE[1][1] + PAD],
];

/** The country view: every place a demo case can land and every station/office, with a small margin. */
const BD_BOUNDS: LBounds = (() => {
  const pts: LatLng[] = [...PLACES, ...STATIONS, ...OFFICES];
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const m = 0.15;
  return [
    [Math.min(...lats) - m, Math.min(...lngs) - m],
    [Math.max(...lats) + m, Math.max(...lngs) + m],
  ];
})();
const TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
/** The OSM tiles turned neutral grey and dark (no orange roads): only the markers carry colour. */
const TILE_FILTER = "grayscale(1) invert(1) brightness(0.8) contrast(1.05)";
/** Site tokens: --color-signal-orange (gold) and white at 60%, for the SVG lines (presentation attributes take no var()). */
const GOLD = "#E4B027";
const WHITE = "#FFFFFF";
const ALL_UNITS: readonly UnitKind[] = ["patrol", "station", "office", "team"];

const ll = (p: LatLng): LL => [p.lat, p.lng];

/** Shield glyph for stations, dark on gold. */
const SHIELD =
  '<svg viewBox="0 0 24 24" class="size-3 fill-bdnavy-900" aria-hidden="true"><path d="M12 2 4 5v6c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5l-8-3z"/></svg>';

interface Pin {
  key: string;
  html: string;
  size: number;
}

/** An incident dot: gold police, cobalt consumer, navy-tint other; red with a ring when critical or overdue. */
function incidentPin(c: Case, selected: boolean, reduced: boolean): Pin {
  const open = isOpen(c);
  const urgent = open && (c.severity === "critical" || c.overdue === true);
  const fill = urgent
    ? "bg-national-crimson ring-2 ring-white"
    : c.dept === "police"
      ? "bg-signal-orange ring-2 ring-black"
      : c.dept === "consumer"
        ? "bg-cobalt ring-2 ring-white"
        : "bg-bdnavy-300 ring-2 ring-black";
  const size = selected ? 22 : 14;
  const pulse = urgent && !reduced;
  const html =
    `<span class="relative block size-full${open ? "" : " opacity-50"}">` +
    (pulse ? '<span class="absolute inset-0 rounded-full bg-national-crimson/60 animate-ping motion-reduce:hidden"></span>' : "") +
    (urgent ? '<span class="absolute -inset-1.5 rounded-full border-2 border-national-crimson"></span>' : "") +
    (selected ? '<span class="absolute -inset-2 rounded-full border-2 border-white"></span>' : "") +
    `<span class="absolute inset-0 rounded-full ${fill}"></span></span>`;
  return { key: `${fill}|${open}|${pulse}|${urgent}|${selected}`, html, size };
}

function unitPin(u: Unit): Pin {
  const off = u.status === "off-duty" ? " opacity-40" : "";
  switch (u.kind) {
    case "station":
      return {
        key: `station${off}`,
        size: 18,
        html: `<span class="grid size-full place-items-center rounded-sm bg-signal-orange ring-1 ring-black${off}">${SHIELD}</span>`,
      };
    case "office":
      return { key: `office${off}`, size: 14, html: `<span class="block size-full rounded-sm bg-cobalt ring-2 ring-white${off}"></span>` };
    case "team": {
      const busy = u.status === "busy" ? "ring-signal-orange" : "ring-white";
      return { key: `team|${busy}${off}`, size: 10, html: `<span class="block size-full rounded-full bg-cobalt ring-2 ${busy}${off}"></span>` };
    }
    case "patrol": {
      const busy = u.status === "busy" ? "ring-2 ring-signal-orange" : "ring-1 ring-black";
      return { key: `patrol|${busy}${off}`, size: 10, html: `<span class="block size-full rounded-full bg-bdnavy-300 ${busy}${off}"></span>` };
    }
  }
}

const icons = new Map<string, LIcon>();
function iconFor(L: Leaflet, pin: Pin): LIcon {
  const key = `${pin.size}|${pin.key}`;
  let icon = icons.get(key);
  if (!icon) {
    icon = L.divIcon({ html: pin.html, className: "", iconSize: [pin.size, pin.size], iconAnchor: [pin.size / 2, pin.size / 2] });
    icons.set(key, icon);
  }
  return icon;
}

/** Hover label for an incident, built node by node (case text is never HTML). */
function caseLabel(c: Case): HTMLElement {
  const box = document.createElement("span");
  const id = document.createElement("span");
  id.textContent = `${c.id} · `;
  const title = document.createElement("span");
  title.lang = "bn";
  title.className = "font-bengali";
  title.textContent = c.titleBn;
  box.append(id, title);
  return box;
}

const lineLabel = (from: LatLng, unit: Unit, onScene: boolean): string => {
  if (onScene) return "On scene";
  const km = haversineKm(from, unit);
  return `${km.toFixed(1)} km · ${etaMin(km, unit.kind)} min`;
};

/** Leaflet's own tooltip styles are plain CSS, so these override them with `!`. */
const LABEL_CLASS = "rounded-md! border-white/20! bg-black/85! px-2! py-0.5! text-xs! font-semibold! text-white! shadow-none! tabular-nums";

/* ------------------------------------------------------------- component */

interface Placed {
  marker: LMarker;
  key: string;
  at: LL;
  label?: string;
}

interface Line {
  poly: LPolyline;
  label: string;
}

interface Live {
  L: Leaflet;
  map: LMap;
  incidents: LLayerGroup;
  unitLayer: LLayerGroup;
  lineLayer: LLayerGroup;
  caseMarkers: Map<string, Placed>;
  unitMarkers: Map<string, Placed>;
  lines: { unit?: Line; home?: Line };
}

type Status = "loading" | "ready" | "failed";

/** Touch screens: the map starts still so a swipe scrolls the page; "Move map" hands gestures to the map. */
const coarsePointer = (): boolean => window.matchMedia("(pointer: coarse)").matches;

/** Place or move a marker, swapping its icon only when its look changed. */
function place(
  live: Live,
  store: Map<string, Placed>,
  layer: LLayerGroup,
  id: string,
  at: LL,
  pin: Pin,
  z: number,
  interactive: boolean,
  onClick?: () => void,
): Placed {
  const icon = iconFor(live.L, pin);
  let p = store.get(id);
  if (!p) {
    const marker = live.L.marker(at, { icon, keyboard: false, interactive, zIndexOffset: z }).addTo(layer);
    if (onClick) marker.on("click", onClick);
    p = { marker, key: pin.key, at };
    store.set(id, p);
    return p;
  }
  if (p.at[0] !== at[0] || p.at[1] !== at[1]) {
    p.marker.setLatLng(at);
    p.at = at;
  }
  if (p.key !== pin.key) {
    p.marker.setIcon(icon).setZIndexOffset(z);
    p.key = pin.key;
  }
  return p;
}

function setLine(live: Live, which: "unit" | "home", path: LL[] | null, label: string, color: string, opacity: number): void {
  const current = live.lines[which];
  if (!path) {
    if (current) live.lineLayer.removeLayer(current.poly);
    live.lines[which] = undefined;
    return;
  }
  if (!current) {
    const poly = live.L.polyline(path, { color, weight: 2, opacity, dashArray: "6 6", interactive: false })
      .bindTooltip(label, { permanent: true, direction: "center", className: LABEL_CLASS, opacity: 1 })
      .addTo(live.lineLayer);
    live.lines[which] = { poly, label };
    return;
  }
  current.poly.setLatLngs(path);
  if (current.label !== label) {
    current.poly.setTooltipContent(label);
    current.label = label;
  }
}

/**
 * The Leaflet street map behind MapView (load it through MapView, which keeps
 * it off the server). Supplementary: everything here is also in the lists, so
 * the map is hidden from assistive tech and a one-line summary stands in.
 */
export default function MapCanvas({ cases, units, selectedId, onSelect, focus = "country", showUnits }: MapViewProps) {
  const [status, setStatus] = useState<Status>("loading");
  // Client-only component (MapView loads it with ssr: false), so reading the media query here is safe.
  const [touch] = useState(coarsePointer);
  const [moving, setMoving] = useState(false);
  const ready = status === "ready";
  const reduced = useReducedMotion();
  const el = useRef<HTMLDivElement>(null);
  const live = useRef<Live | null>(null);
  const latest = useRef({ cases, units, selectedId, onSelect, focus, reduced });
  useEffect(() => {
    latest.current = { cases, units, selectedId, onSelect, focus, reduced };
  });

  // Load Leaflet; after a failure, try again when the connection comes back.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    const retry = () => {
      if (!alive) return;
      setStatus("loading");
      setAttempt((n) => n + 1);
    };
    loadLeaflet().then(
      () => alive && setStatus("ready"),
      () => {
        if (!alive) return;
        setStatus("failed");
        window.addEventListener("online", retry, { once: true });
      },
    );
    return () => {
      alive = false;
      window.removeEventListener("online", retry);
    };
  }, [attempt]);

  // Create the map once Leaflet is in.
  useEffect(() => {
    const L = ready ? leafletGlobal() : undefined;
    const node = el.current;
    if (!L || !node) return;
    const still = latest.current.reduced;
    const map = L.map(node, {
      zoomControl: true,
      attributionControl: true,
      keyboard: false,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: MAX_BOUNDS,
      maxBoundsViscosity: 0.8,
      zoomSnap: 0.25,
      zoomAnimation: !still,
      fadeAnimation: !still,
      markerZoomAnimation: !still,
      // The wheel scrolls the page; zoom with the +/- control or a double-click.
      scrollWheelZoom: false,
      dragging: !touch,
      touchZoom: !touch,
    });
    map.fitBounds(BD_BOUNDS, { padding: [12, 12], animate: false });
    map.attributionControl?.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    const tiles = map.getPane("tilePane");
    if (tiles) tiles.style.filter = TILE_FILTER;
    node.style.background = "#000";
    // The map is aria-hidden, so nothing inside it may take focus.
    for (const a of node.querySelectorAll<HTMLElement>("a, button")) a.tabIndex = -1;
    // Touch screens: Leaflet's +/- buttons are 30px; make them 44px targets.
    if (touch) {
      for (const a of node.querySelectorAll<HTMLElement>(".leaflet-control-zoom a")) {
        a.style.width = "44px";
        a.style.height = "44px";
        a.style.lineHeight = "44px";
        a.style.fontSize = "22px";
      }
    }

    live.current = {
      L,
      map,
      incidents: L.layerGroup().addTo(map),
      unitLayer: L.layerGroup().addTo(map),
      lineLayer: L.layerGroup().addTo(map),
      caseMarkers: new Map(),
      unitMarkers: new Map(),
      lines: {},
    };
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(node);
    return () => {
      resize.disconnect();
      map.remove();
      live.current = null;
    };
  }, [ready, touch]);

  // On touch screens the map takes gestures only while "Move map" is on.
  useEffect(() => {
    const m = live.current;
    if (!ready || !m || !touch) return;
    for (const h of [m.map.dragging, m.map.touchZoom]) {
      if (moving) h?.enable();
      else h?.disable();
    }
  }, [ready, touch, moving]);

  // Markers and the selected case's lines, updated in place.
  const showKey = (showUnits ?? ALL_UNITS).join(",");
  useEffect(() => {
    const m = live.current;
    if (!ready || !m) return;

    const seenCases = new Set<string>();
    for (const c of cases) {
      seenCases.add(c.id);
      const selected = c.id === selectedId;
      const p = place(m, m.caseMarkers, m.incidents, c.id, ll(c.place), incidentPin(c, selected, reduced), selected ? 2000 : 1000, true, () =>
        latest.current.onSelect?.(c.id),
      );
      const label = `${c.id}|${c.titleBn}`;
      if (p.label !== label) {
        if (p.label === undefined) p.marker.bindTooltip(caseLabel(c), { direction: "top", offset: [0, -8] });
        else p.marker.setTooltipContent(caseLabel(c));
        p.label = label;
      }
    }
    for (const [id, p] of m.caseMarkers) {
      if (!seenCases.has(id)) {
        m.incidents.removeLayer(p.marker);
        m.caseMarkers.delete(id);
      }
    }

    const kinds = new Set(showKey.split(","));
    const seenUnits = new Set<string>();
    for (const u of units) {
      if (!kinds.has(u.kind)) continue;
      seenUnits.add(u.id);
      const p = place(m, m.unitMarkers, m.unitLayer, u.id, ll(u), unitPin(u), u.kind === "station" || u.kind === "office" ? 100 : 0, true);
      if (p.label !== u.name) {
        if (p.label === undefined) p.marker.bindTooltip(u.name, { direction: "top", offset: [0, -6] });
        else p.marker.setTooltipContent(u.name);
        p.label = u.name;
      }
    }
    for (const [id, p] of m.unitMarkers) {
      if (!seenUnits.has(id)) {
        m.unitLayer.removeLayer(p.marker);
        m.unitMarkers.delete(id);
      }
    }

    // Selected case: dashed lines to the assigned unit (gold) and to its station/office (white).
    const sel = selectedId ? cases.find((c) => c.id === selectedId) : undefined;
    const assigned = sel?.assignedUnitId ? units.find((u) => u.id === sel.assignedUnitId) : undefined;
    const home =
      sel && sel.dept !== "other"
        ? ((sel.homeId ? units.find((u) => u.id === sel.homeId) : undefined) ?? nearestHome(sel.place, units, sel.dept))
        : undefined;
    const live1 = sel !== undefined && isOpen(sel);
    setLine(
      m,
      "unit",
      live1 && assigned ? [ll(sel.place), ll(assigned)] : null,
      sel && assigned ? lineLabel(sel.place, assigned, sel.status === "on-scene") : "",
      GOLD,
      1,
    );
    setLine(
      m,
      "home",
      live1 && home && home.id !== assigned?.id ? [ll(sel.place), ll(home)] : null,
      sel && home ? lineLabel(sel.place, home, false) : "",
      WHITE,
      0.6,
    );
  }, [ready, cases, units, selectedId, reduced, showKey]);

  // Frame the view when `focus` (or, for "selection", the selected case) changes.
  const focusKey =
    typeof focus === "string" ? (focus === "selection" ? `selection:${selectedId ?? ""}` : focus) : `${focus.lat},${focus.lng},${focus.zoom}`;
  useEffect(() => {
    const m = live.current;
    if (!ready || !m) return;
    const { focus: f, cases: cs, units: us, selectedId: id, reduced: still } = latest.current;
    const animate = !still;
    if (f === "country") {
      m.map.fitBounds(BD_BOUNDS, { padding: [12, 12], animate });
    } else if (f === "selection") {
      const c = id ? cs.find((x) => x.id === id) : undefined;
      if (!c) return;
      const points = [c.place, ...us.filter((u) => u.id === c.assignedUnitId || u.id === c.homeId)];
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      if (points.length === 1) m.map.setView(ll(c.place), 14, { animate });
      else
        m.map.fitBounds(
          [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)],
          ],
          { padding: [48, 48], maxZoom: 15, animate },
        );
    } else {
      m.map.setView([f.lat, f.lng], f.zoom, { animate });
    }
  }, [ready, focusKey]);

  const open = cases.reduce((n, c) => n + (isOpen(c) ? 1 : 0), 0);

  return (
    <div className="absolute inset-0">
      <div ref={el} className="absolute inset-0" aria-hidden="true" role="presentation" />
      <p className="sr-only">
        {status === "failed"
          ? `Map unavailable. ${open} open ${open === 1 ? "incident is" : "incidents are"} listed beside it.`
          : `${open} open ${open === 1 ? "incident" : "incidents"} on the map`}
      </p>
      {ready && touch && (
        <button
          type="button"
          aria-pressed={moving}
          onClick={() => setMoving((v) => !v)}
          className="absolute right-2 bottom-8 z-1000 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-bdnavy-900 px-4 text-sm font-semibold text-white ring-1 ring-white/12 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none aria-pressed:bg-signal-orange aria-pressed:text-text-primary"
        >
          <Icon name={moving ? "check" : "pan_tool"} className="text-lg" />
          {moving ? "Done" : "Move map"}
        </button>
      )}
      {status === "loading" && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-bdnavy-900 motion-reduce:animate-none" />}
      {status === "failed" && (
        <div className="absolute inset-0 grid place-items-center bg-bdnavy-900 p-6 text-center ring-1 ring-white/12 ring-inset">
          <div className="max-w-xs">
            <Icon name="wifi_off" className="text-3xl text-bdnavy-300" />
            <p className="mt-2 text-sm text-white/85">Map unavailable offline — all cases are listed beside it.</p>
          </div>
        </div>
      )}
    </div>
  );
}
