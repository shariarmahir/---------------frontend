"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { MAP_HEIGHT, MAP_WIDTH, divisionShapes, project } from "@/data/bangladesh-map";
import { KIND_LABEL, PLACES, RIVERS, STORIES, TERRAIN_NAME, TRAVEL_CHECKED, placeById, type MapPlace, type PlaceKind, type Terrain } from "@/data/motherland-travel";
import { crowdAt, daysUntil, nearestPlaces, nextSurge, placesToGpx, ticketOutlook, type CrowdLevel } from "@/lib/motherland-crowd";
import { tilesFor } from "@/lib/motherland-geo";
import { DEM_TILES, GLYPH_URLS, VECTOR_TILEJSON } from "@/lib/motherland-map-style";
import { NAME_MAX, NOTE_MAX, REPORT_LABEL, REPORT_TO_CROWD, inBangladesh, isFresh, newPlace, timeAgo, type AddedPlace, type ReportLevel } from "@/lib/motherland-reports";
import { cn } from "@/lib/utils";
import { RiseText } from "./rise-text";
import { COLUMN, DISPLAY, LEDE, pill } from "./kit";
import type { CanvasPin } from "./map-canvas";
import { MARK_LABEL, addedStore, choosePlace, reportsStore, setMark, useAdded, useMarks, useMinute, usePlace, useReports, type Mark } from "./travel-store";

const MapCanvas = dynamic(() => import("./map-canvas"), { ssr: false });

/* ── Small parts ── */

const LEVEL_NAME: Record<CrowdLevel, string> = { closed: "Closed", quiet: "Quiet", steady: "Steady", busy: "Busy", packed: "Packed" };
const LEVEL_DOT: Record<CrowdLevel, string> = { closed: "bg-white/35", quiet: "bg-emerald-400", steady: "bg-ml-river", busy: "bg-signal-orange", packed: "bg-ml-red" };
const LEVEL_COLOR: Record<CrowdLevel, string> = { closed: "#8a8a8a", quiet: "#34d399", steady: "#5aa9d6", busy: "#e4b027", packed: "#da291c" };
const KIND_COLOR: Record<PlaceKind, string> = { antique: "#e4b027", gem: "#5aa9d6", classic: "#ffffff" };

function LevelTag({ level, label, className }: { level: CrowdLevel; label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap", className)}>
      <span aria-hidden className={cn("size-2 rounded-full", LEVEL_DOT[level])} />
      {label ?? LEVEL_NAME[level]}
    </span>
  );
}

const CONTROL = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black/75 px-4 text-sm font-semibold whitespace-nowrap text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const CHIP = "min-h-10 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const BACK = "inline-flex min-h-10 items-center gap-1 self-start rounded-sm text-sm font-semibold text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-white";
const FIELD = "w-full rounded-xl bg-white/10 px-3.5 py-3 placeholder:text-white/55 focus-visible:outline-2 focus-visible:outline-white";
const MONTHS = "JFMAMJJASOND".split("");
const REPORT_LEVELS = Object.keys(REPORT_LABEL) as ReportLevel[];

/** Land, rivers and division lines as a drawing: shared with the travel wall, and the map's stand-in without WebGL. */
export function DarkLand() {
  return (
    <>
      {divisionShapes.map((d) => (
        <path key={d.id} d={d.d} className="fill-white/[.07] stroke-white/25" strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
      {RIVERS.map((r) => (
        <path
          key={r.name}
          d={r.path
            .map(([lat, lon], i) => {
              const { x, y } = project(lat, lon);
              return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(" ")}
          fill="none"
          className="stroke-ml-river/70"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
}

function FlatMap({ pins, onPick }: { pins: CanvasPin[]; onPick: (id: string) => void }) {
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 size-full p-4" role="img" aria-label="A drawn map of Bangladesh with the same places as the list.">
      <DarkLand />
      {pins.map((p) => {
        const { x, y } = project(p.lat, p.lon);
        return (
          <g key={p.id} transform={`translate(${x} ${y})`} className={cn("cursor-pointer", p.dim && "pointer-events-none opacity-15")} onClick={() => onPick(p.id)}>
            <title>{p.name}</title>
            <circle r={14} fill="transparent" />
            <circle r={p.selected ? 8 : 5} fill={p.color} stroke="#000" strokeWidth={1} />
          </g>
        );
      })}
    </svg>
  );
}

function LevelPicker({ value, onChoose, legend }: { value: ReportLevel | null; onChoose: (l: ReportLevel) => void; legend: string }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white/70">{legend}</legend>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {REPORT_LEVELS.map((l) => (
          <button key={l} type="button" aria-pressed={value === l} onClick={() => onChoose(l)} className={cn(CHIP, "inline-flex items-center justify-center gap-1.5 px-2", value === l ? "bg-white text-black" : "bg-white/10 hover:bg-white/20")}>
            <span aria-hidden className={cn("size-2 rounded-full", LEVEL_DOT[REPORT_TO_CROWD[l]])} />
            {REPORT_LABEL[l]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const anyOf = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const useWide = () =>
  useSyncExternalStore(
    (cb) => {
      const q = window.matchMedia("(min-width: 1024px)");
      q.addEventListener("change", cb);
      return () => q.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );

const PANEL_WIDTH = 392;

type Located = { lat: number; lon: number };
type PanelView = "list" | "marks" | "location" | "add";

/**
 * The map, last on the page and just above the footer: real roads, rivers and
 * relief across Bangladesh, the places with their photographs, and a plus
 * button for travellers to add a place and how crowded it is.
 */
export function GeoMap() {
  const root = useRef<HTMLElement>(null);
  const minute = useMinute();
  const current = usePlace();
  const savedMarks = useMarks();
  const reports = useReports();
  const added = useAdded();
  const wide = useWide();
  const [kind, setKind] = useState<PlaceKind | "all">("all");
  const [terrain, setTerrain] = useState<Terrain | "all">("all");
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<PanelView>("list");
  const [openAdded, setOpenAdded] = useState<string | null>(null);
  const [you, setYou] = useState<Located | null>(null);
  const [note, setNote] = useState("");
  const [offline, setOffline] = useState("");
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [tilt, setTilt] = useState(false);
  const [colourBy, setColourBy] = useState<"kind" | "crowd">("kind");
  const [draft, setDraft] = useState<{ name: string; note: string; level: ReportLevel | null }>({ name: "", note: "", level: null });
  const [center, setCenter] = useState<Located | null>(null);
  const [formError, setFormError] = useState("");

  const now = minute === null ? null : new Date(minute * 60_000);
  const nowMs = minute === null ? 0 : minute * 60_000;
  const selected = current ? (placeById(current) ?? null) : null;
  const addedOpen = openAdded ? (added.find((a) => a.id === openAdded) ?? null) : null;
  const adding = panel === "add" && !selected;

  // The map library is heavy: load it only as the visitor nears the map.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (document.createElement("canvas").getContext("webgl2") === null && document.createElement("canvas").getContext("webgl") === null) {
      window.queueMicrotask(() => setFailed(true));
      return;
    }
    const seen = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          seen.disconnect();
        }
      },
      { rootMargin: "1200px" },
    );
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  // A place chosen anywhere on the page brings the visitor down to the map.
  useEffect(() => {
    if (!selected || !root.current) return;
    const { top, bottom } = root.current.getBoundingClientRect();
    if (bottom < 300 || top > window.innerHeight - 300) document.getElementById("map-stage")?.scrollIntoView({ block: "start" });
  }, [selected]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLACES.filter((p) => (kind === "all" || p.kind === kind) && (terrain === "all" || p.terrain === terrain) && (!q || `${p.name} ${p.district}`.toLowerCase().includes(q)));
  }, [kind, terrain, query]);
  const shown = new Set(visible.map((p) => p.id));

  const levelOf = (p: MapPlace): CrowdLevel => {
    const c = now ? crowdAt(p, now) : null;
    if (c?.level === "closed") return "closed";
    const r = reports[p.id];
    if (r && isFresh(r.at, nowMs)) return REPORT_TO_CROWD[r.level];
    return c?.level ?? "quiet";
  };

  const pins: CanvasPin[] = [
    ...PLACES.map((p) => ({ id: p.id, name: p.name, lat: p.lat, lon: p.lon, color: colourBy === "crowd" ? LEVEL_COLOR[levelOf(p)] : KIND_COLOR[p.kind], picture: { src: p.picture.src, focus: p.picture.focus }, selected: p.id === current, dim: !shown.has(p.id), marked: !!savedMarks[p.id] })),
    ...added.map((a) => ({ id: a.id, name: a.name, lat: a.lat, lon: a.lon, color: isFresh(a.at, nowMs) ? LEVEL_COLOR[REPORT_TO_CROWD[a.level]] : "#ffffff", selected: a.id === openAdded, dim: false, marked: false })),
  ];

  const pick = (id: string) => {
    if (id.startsWith("added-")) {
      choosePlace(null);
      setPanel("list");
      setOpenAdded(id);
    } else {
      setOpenAdded(null);
      choosePlace(id);
    }
  };

  const openPanel = (next: PanelView) => {
    choosePlace(null);
    setOpenAdded(null);
    setPanel(next);
    setFormError("");
  };

  const focus = useMemo(() => {
    if (selected) return { lat: selected.lat, lon: selected.lon };
    if (addedOpen) return { lat: addedOpen.lat, lon: addedOpen.lon };
    return null;
  }, [selected, addedOpen]);

  const locate = (then: PanelView = "location") => {
    openPanel(then);
    if (!navigator.geolocation) return setNote("This browser can't read your location.");
    setNote("Finding you. Your browser will ask for permission.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setYou({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setNote(`Found you, accurate to about ${Math.round(pos.coords.accuracy)} m. This stays on your device until you share it.`);
      },
      () => setNote("We couldn't get your location. Allow location for this site, then try again."),
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const mapsLink = (l: Located) => `https://www.google.com/maps?q=${l.lat.toFixed(6)},${l.lon.toFixed(6)}`;

  const shareLink = async (title: string, text: string, url: string, copied: string) => {
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else {
        await navigator.clipboard.writeText(url);
        setNote(copied);
      }
    } catch {
      /* The visitor closed the share sheet. */
    }
  };

  const surprise = () => {
    const quiet = now ? PLACES.filter((p) => ["quiet", "steady"].includes(crowdAt(p, now).level) && p.best.includes(now.getUTCMonth() + 1)) : PLACES;
    const pool = quiet.length ? quiet : PLACES;
    choosePlace(anyOf(pool).id);
  };

  const saveAdded = () => {
    const spot = center;
    const result = newPlace({ ...draft, lat: spot?.lat ?? null, lon: spot?.lon ?? null }, Date.now());
    if (!result.ok) return setFormError(result.error);
    addedStore.write([result.place, ...addedStore.read()]);
    setDraft({ name: "", note: "", level: null });
    setFormError("");
    setPanel("list");
    setOpenAdded(result.place.id);
  };

  const removeAdded = (id: string) => {
    addedStore.write(addedStore.read().filter((a) => a.id !== id));
    setOpenAdded(null);
  };

  const updateAdded = (a: AddedPlace, level: ReportLevel) => addedStore.write(addedStore.read().map((x) => (x.id === a.id ? { ...x, level, at: Date.now() } : x)));

  const report = (id: string, level: ReportLevel) => {
    const next = { ...reportsStore.read() };
    if (next[id]?.level === level && isFresh(next[id].at, Date.now())) delete next[id];
    else next[id] = { level, at: Date.now() };
    reportsStore.write(next);
  };

  const downloadMarks = () => {
    const chosen = [
      ...PLACES.filter((p) => savedMarks[p.id]).map((p) => ({ name: p.name, lat: p.lat, lon: p.lon, note: `${MARK_LABEL[savedMarks[p.id]]}. ${p.district}.` })),
      ...added.map((a) => ({ name: a.name, lat: a.lat, lon: a.lon, note: a.note || "Added by me." })),
    ];
    const url = URL.createObjectURL(new Blob([placesToGpx(chosen)], { type: "application/gpx+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "bangladesh-marks.gpx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveOffline = async () => {
    if (!("serviceWorker" in navigator)) return setOffline("This browser can't save pages for offline use.");
    setOffline("Saving the map of Bangladesh. This takes about a minute on a good connection.");
    try {
      await navigator.serviceWorker.register("/travel-sw.js", { scope: "/bangladesh/travel" });
      const worker = await navigator.serviceWorker.ready;
      const tilejson = (await (await fetch(VECTOR_TILEJSON)).json()) as { tiles: string[] };
      const urls = [
        window.location.pathname,
        "/vendor/maplibre-gl-worker.mjs",
        VECTOR_TILEJSON,
        ...GLYPH_URLS,
        ...performance
          .getEntriesByType("resource")
          .map((r) => r.name)
          .filter((u) => u.startsWith(window.location.origin)),
        ...tilesFor(tilejson.tiles[0], [5, 6, 7, 8, 9, 10]),
        ...tilesFor(DEM_TILES, [5, 6, 7, 8, 9]),
      ];
      const done = (e: MessageEvent) => {
        if (e.data?.type === "progress") setOffline(`Saving the map: ${e.data.saved} of ${e.data.total}.`);
        if (e.data?.type !== "saved") return;
        setOffline(`Saved ${e.data.saved} of ${e.data.total} pieces. The map, its roads and rivers, your marks and the photos you've seen now open here without signal. Satellite view needs a connection.`);
        navigator.serviceWorker.removeEventListener("message", done);
      };
      navigator.serviceWorker.addEventListener("message", done);
      worker.active?.postMessage({ type: "save", urls });
    } catch {
      setOffline("Saving failed. Check your connection and try again.");
    }
  };

  const markCount = Object.keys(savedMarks).length + added.length;
  const crowd = selected && now ? crowdAt(selected, now) : null;
  const myReport = selected ? reports[selected.id] : undefined;
  const freshReport = myReport && isFresh(myReport.at, nowMs) ? myReport : null;
  const reportOpen = crowd && crowd.level !== "closed";
  const canAddHere = !!center && inBangladesh(center.lat, center.lon);

  const backToList = () => openPanel("list");

  return (
    <section ref={root} id="map" aria-labelledby="map-title" className="relative isolate scroll-mt-(--ml-header) bg-black pt-12 text-white sm:pt-14 lg:pt-16">
      <div className={cn(COLUMN, "flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pb-10 sm:pb-12")}>
        <div className="flex w-full min-w-0 flex-col gap-4">
          <RiseText id="map-title" text="Now choose where you'll go" className={cn(DISPLAY, "w-full")} />
          <p className={cn(LEDE, "max-w-none text-white/80")}>Every river and road. Open a place, tilt the hills and mark where you want to go.</p>
        </div>
        <Link href={STORIES.href} className={pill.onDark}>
          Share your short tour story
        </Link>
      </div>

      <div id="map-stage" className="relative flex scroll-mt-(--ml-header) flex-col lg:block">
        <div className="relative h-[72svh] min-h-112 w-full overflow-hidden bg-black lg:aspect-video lg:h-auto lg:max-h-[calc(100svh-var(--ml-header))] lg:min-h-160">
          {!ready || failed ? <FlatMap pins={pins} onPick={pick} /> : null}
          {near && !failed ? (
            <MapCanvas pins={pins} focus={focus} you={you} adding={adding} satellite={satellite} tilt={tilt} leftPad={wide ? PANEL_WIDTH + 16 : 0} onPick={pick} onCenter={setCenter} onReady={() => setReady(true)} onFail={() => setFailed(true)} />
          ) : null}

          {/* The view */}
          <div className="absolute top-3 right-3 z-10 flex flex-wrap justify-end gap-2 sm:top-4 sm:right-4">
            {ready ? (
              <>
                <div role="group" aria-label="Map view" className="flex rounded-full bg-black/75 p-1 ring-1 ring-white/20 backdrop-blur">
                  {[
                    { on: !satellite, label: "Map", set: false },
                    { on: satellite, label: "Satellite", set: true },
                  ].map((v) => (
                    <button key={v.label} type="button" aria-pressed={v.on} onClick={() => setSatellite(v.set)} className={cn("min-h-9 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white", v.on ? "bg-white text-black" : "text-white hover:bg-white/15")}>
                      {v.label}
                    </button>
                  ))}
                </div>
                <button type="button" aria-pressed={tilt} onClick={() => setTilt((t) => !t)} className={cn(CONTROL, tilt && "bg-white text-black")}>
                  <Icon name="landscape" className="text-lg" />
                  3D hills
                </button>
              </>
            ) : null}
            {selected || addedOpen ? (
              <button type="button" onClick={backToList} className={CONTROL}>
                <Icon name="zoom_out_map" className="text-lg" />
                Whole country
              </button>
            ) : null}
          </div>

          {/* The legend, which is also the switch for how pins are coloured */}
          <div className="absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 rounded-full bg-black/75 py-1.5 pr-4 pl-1.5 text-xs text-white ring-1 ring-white/15 backdrop-blur sm:flex lg:left-[calc(50%+12.25rem)]">
            <button type="button" onClick={() => setColourBy((c) => (c === "kind" ? "crowd" : "kind"))} className="min-h-8 rounded-full bg-white/15 px-3 font-semibold whitespace-nowrap transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-white">
              Colour by {colourBy === "kind" ? "crowd" : "kind"}
            </button>
            <ul className="flex items-center gap-3 whitespace-nowrap">
              {(colourBy === "kind" ? (Object.keys(KIND_LABEL) as PlaceKind[]).map((k) => ({ name: KIND_LABEL[k], color: KIND_COLOR[k] })) : (["quiet", "steady", "busy", "packed"] as CrowdLevel[]).map((l) => ({ name: LEVEL_NAME[l], color: LEVEL_COLOR[l] }))).map((item) => (
                <li key={item.name} className="flex items-center gap-1.5">
                  <span aria-hidden className="size-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          {/* The plus button */}
          <button type="button" aria-pressed={adding} onClick={() => (adding ? backToList() : openPanel("add"))} className="absolute right-3 bottom-9 z-10 inline-flex min-h-14 items-center gap-2 rounded-full bg-signal-orange pr-5 pl-3.5 font-bold text-ml-ink shadow-[0_12px_32px_rgb(0_0_0/0.5)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4">
            <Icon name={adding ? "close" : "add"} className="text-3xl!" />
            {adding ? "Cancel" : "Add a place"}
          </button>
        </div>

        {/* The panel */}
        <div className="flex flex-col bg-black lg:absolute lg:top-4 lg:bottom-4 lg:left-4 lg:z-20 lg:w-98 lg:overflow-hidden lg:rounded-2xl lg:bg-black/80 lg:ring-1 lg:ring-white/15 lg:backdrop-blur-xl">
          <div role="tablist" aria-label="Map panel" className="grid shrink-0 grid-cols-3 gap-1 p-2">
            {(
              [
                { id: "list", label: "Places", icon: "travel_explore", go: () => openPanel("list") },
                { id: "marks", label: `Marks${markCount ? ` ${markCount}` : ""}`, icon: "bookmark", go: () => openPanel("marks") },
                { id: "location", label: "My location", icon: "my_location", go: () => locate() },
              ] as const
            ).map((t) => {
              const on = !selected && !addedOpen && panel === t.id;
              return (
                <button key={t.id} type="button" role="tab" aria-selected={on} onClick={t.go} className={cn("inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-1 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-white", on ? "bg-white/15" : "text-white/75 hover:bg-white/10 hover:text-white")}>
                  <Icon name={t.icon} className="text-lg" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pt-2 max-lg:max-h-[65svh] lg:overscroll-contain lg:mask-b-from-[calc(100%-1.5rem)]">
            {selected ? (
              <article className="flex flex-col gap-4 pb-4">
                <button type="button" onClick={backToList} className={BACK}>
                  <Icon name="chevron_left" className="text-xl" />
                  All places
                </button>
                <div className="relative aspect-16/10 shrink-0 overflow-hidden rounded-xl bg-white/10">
                  <Image key={selected.id} src={selected.picture.src} alt={selected.picture.alt} fill sizes="(min-width: 1024px) 24rem, 100vw" className="object-cover" style={{ objectPosition: selected.picture.focus }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-signal-orange">
                    {KIND_LABEL[selected.kind]}
                    {selected.era ? `, ${selected.era}` : ""}
                  </p>
                  <h3 className="mt-1 text-3xl leading-tight font-bold text-balance">{selected.name}</h3>
                  <p className="text-white/70">
                    {selected.district}, {TERRAIN_NAME[selected.terrain].toLowerCase()}
                  </p>
                </div>
                <p className="leading-relaxed text-white/90">{selected.text}</p>
                {crowd ? (
                  <div className="flex flex-col gap-3 rounded-xl bg-white/[.07] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-white/70">Crowd right now (estimate)</h4>
                      <LevelTag level={crowd.level} />
                    </div>
                    <p className="text-sm text-white/70">{crowd.reasons.join(", ")}</p>
                    {reportOpen ? (
                      <>
                        <LevelPicker legend="Are you here? Tell the map" value={freshReport?.level ?? null} onChoose={(l) => report(selected.id, l)} />
                        {freshReport ? (
                          <p aria-live="polite" className="text-sm text-white/80">
                            You said {REPORT_LABEL[freshReport.level].toLowerCase()}, {timeAgo(freshReport.at, nowMs)}. This shows on your map for six hours.
                          </p>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
                <div>
                  <h4 className="text-sm font-semibold text-white/70">Best months</h4>
                  <ol className="mt-2 grid grid-cols-12 gap-1">
                    {MONTHS.map((m, i) => {
                      const closed = selected.closed?.includes(i + 1);
                      const best = selected.best.includes(i + 1);
                      return (
                        <li key={i} className={cn("grid h-8 place-items-center rounded text-xs font-bold", closed ? "bg-white/5 text-white/30 line-through" : best ? "bg-signal-orange text-black" : "bg-white/10 text-white/60")}>
                          {m}
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Mark this place">
                  {(Object.keys(MARK_LABEL) as Mark[]).map((m) => (
                    <button key={m} type="button" aria-pressed={savedMarks[selected.id] === m} onClick={() => setMark(selected.id, m)} className={cn(CHIP, savedMarks[selected.id] === m ? "bg-signal-orange text-black" : "bg-white/10 hover:bg-white/20")}>
                      {MARK_LABEL[m]}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`} target="_blank" rel="noopener noreferrer" className={pill.onDark}>
                    <Icon name="directions" className="text-xl" />
                    Directions
                  </a>
                  <button type="button" onClick={() => shareLink(selected.name, `${selected.name}, ${selected.district}, Bangladesh`, `${window.location.origin}${window.location.pathname}#place=${selected.id}`, `Link to ${selected.name} copied.`)} className={pill.white}>
                    <Icon name="share" className="text-xl" />
                    Share
                  </button>
                </div>
                <a href={`#prepare-${selected.terrain}`} className="rounded-sm text-sm font-semibold underline underline-offset-4 hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white">
                  What you need for {TERRAIN_NAME[selected.terrain].toLowerCase()}
                </a>
                {note ? (
                  <p aria-live="polite" className="text-sm text-white/70">
                    {note}
                  </p>
                ) : null}
              </article>
            ) : addedOpen ? (
              <article className="flex flex-col gap-4 pb-4">
                <button type="button" onClick={backToList} className={BACK}>
                  <Icon name="chevron_left" className="text-xl" />
                  All places
                </button>
                <div>
                  <p className="text-sm font-semibold text-signal-orange">Added by you</p>
                  <h3 className="mt-1 text-3xl leading-tight font-bold text-balance">{addedOpen.name}</h3>
                </div>
                {addedOpen.note ? <p className="leading-relaxed text-white/90">{addedOpen.note}</p> : null}
                <LevelPicker legend={`You said ${REPORT_LABEL[addedOpen.level].toLowerCase()}, ${timeAgo(addedOpen.at, nowMs)}. Has it changed?`} value={isFresh(addedOpen.at, nowMs) ? addedOpen.level : null} onChoose={(l) => updateAdded(addedOpen, l)} />
                <p className="rounded-xl bg-white/[.07] p-4 text-sm leading-relaxed text-white/80">Saved on this device for now. When Kandari Profile sign-in opens, places you add can reach the map for everyone.</p>
                <div className="flex flex-wrap gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${addedOpen.lat},${addedOpen.lon}`} target="_blank" rel="noopener noreferrer" className={pill.onDark}>
                    <Icon name="directions" className="text-xl" />
                    Directions
                  </a>
                  <button type="button" onClick={() => removeAdded(addedOpen.id)} className={pill.white}>
                    <Icon name="delete" className="text-xl" />
                    Remove
                  </button>
                </div>
              </article>
            ) : panel === "add" ? (
              <form
                className="flex flex-col gap-4 pb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAdded();
                }}
              >
                <h3 className="text-2xl font-bold">Add a place</h3>
                <p className="flex items-start gap-2 rounded-xl bg-white/[.07] p-3 text-sm leading-relaxed text-white/85">
                  <Icon name="location_on" className="shrink-0 text-xl text-signal-orange" />
                  {!ready ? "The map is loading. It decides where your pin goes." : canAddHere ? `Move the map or tap it so the gold pin sits on the place. Now at ${center!.lat.toFixed(3)}° N, ${center!.lon.toFixed(3)}° E.` : "Move the map so the gold pin sits inside Bangladesh."}
                </p>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-white/70">Name of the place</span>
                  <input name="place-name" value={draft.name} maxLength={NAME_MAX} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Such as Kazaikat river ghat" className={FIELD} />
                </label>
                <LevelPicker legend="How crowded is it now?" value={draft.level} onChoose={(level) => setDraft({ ...draft, level })} />
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-white/70">A note for the next traveller (optional)</span>
                  <textarea name="place-note" value={draft.note} maxLength={NOTE_MAX} rows={2} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Best at sunrise. Ask for the boatman at the ghat." className={cn(FIELD, "resize-none")} />
                </label>
                {formError ? (
                  <p role="alert" className="text-sm font-semibold text-signal-orange">
                    {formError}
                  </p>
                ) : null}
                <button type="submit" className={cn(pill.onDark, "w-full")}>
                  <Icon name="add" className="text-xl" />
                  Add to the map
                </button>
                <p className="text-sm leading-relaxed text-white/65">Saved on this device for now. When Kandari Profile sign-in opens, places you add can reach the map for everyone.</p>
              </form>
            ) : panel === "marks" ? (
              <div className="flex flex-col gap-4 pb-4">
                <h3 className="text-2xl font-bold">My marks</h3>
                <p className="leading-relaxed text-white/80">Marks and places you add stay on this device. Download them for an offline map app such as Organic Maps or OsmAnd, or save this map to use it without signal.</p>
                {markCount ? (
                  <ul className="flex flex-col divide-y divide-white/10">
                    {PLACES.filter((p) => savedMarks[p.id]).map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                        <button type="button" onClick={() => pick(p.id)} className="rounded-sm text-left font-semibold hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white">
                          {p.name}
                        </button>
                        <span className="shrink-0 text-sm text-white/70">{MARK_LABEL[savedMarks[p.id]]}</span>
                      </li>
                    ))}
                    {added.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                        <button type="button" onClick={() => pick(a.id)} className="rounded-sm text-left font-semibold hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white">
                          {a.name}
                        </button>
                        <span className="shrink-0 text-sm text-white/70">Added by you</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl bg-white/[.07] p-4 text-sm text-white/80">No marks yet. Open any place to mark it, or press Add a place.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={!markCount} onClick={downloadMarks} className={cn(pill.onDark, "disabled:cursor-not-allowed disabled:opacity-40")}>
                    <Icon name="download" className="text-xl" />
                    Download marks
                  </button>
                  <button type="button" onClick={saveOffline} className={pill.white}>
                    <Icon name="offline_pin" className="text-xl" />
                    Save for offline
                  </button>
                </div>
                {offline ? (
                  <p aria-live="polite" className="text-sm text-white/80">
                    {offline}
                  </p>
                ) : null}
              </div>
            ) : panel === "location" ? (
              <div className="flex flex-col gap-4 pb-4">
                <h3 className="text-2xl font-bold">My real location</h3>
                <p className="leading-relaxed text-white/80">Send your position to family before a trek, a boat trip or a long road. We never store it: it goes only to the person you choose.</p>
                <p aria-live="polite" className="rounded-xl bg-white/[.07] p-4 text-sm text-white/90">
                  {note}
                </p>
                {you ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => shareLink("My location", "I'm here, travelling in Bangladesh:", mapsLink(you), "Link copied. Paste it to someone you trust.")} className={pill.onDark}>
                        <Icon name="share_location" className="text-xl" />
                        Share location
                      </button>
                      <a href={`https://wa.me/?text=${encodeURIComponent(`I'm here: ${mapsLink(you)}`)}`} target="_blank" rel="noopener noreferrer" className={pill.white}>
                        WhatsApp
                      </a>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white/70">Nearest to you</h4>
                      <ul className="mt-2 flex flex-col divide-y divide-white/10">
                        {nearestPlaces(you, PLACES, 4).map(({ place, km }) => (
                          <li key={place.id}>
                            <button type="button" onClick={() => pick(place.id)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-sm py-2 text-left font-semibold hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white">
                              {place.name}
                              <span className="shrink-0 text-sm font-normal text-white/70">{Math.round(km)} km</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <button type="button" onClick={() => locate()} className={cn(pill.onDark, "self-start")}>
                    Try again
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <label className="relative block min-w-0 flex-1">
                    <span className="sr-only">Search places</span>
                    <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xl text-white/60" />
                    <input name="map-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Place or district" className="min-h-11 w-full rounded-full bg-white/10 pr-3 pl-10 placeholder:text-white/55 focus-visible:outline-2 focus-visible:outline-white" />
                  </label>
                  <button type="button" onClick={surprise} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-signal-orange px-4 text-sm font-bold text-ml-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <Icon name="casino" className="text-lg" />
                    Surprise me
                  </button>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                  <label className="relative block">
                    <span className="sr-only">Kind of place</span>
                    <select name="map-kind" value={kind} onChange={(e) => setKind(e.target.value as PlaceKind | "all")} className="min-h-10 w-full appearance-none rounded-full bg-white/10 pr-8 pl-3.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-white [&>option]:text-ml-ink">
                      <option value="all">All kinds</option>
                      {(Object.keys(KIND_LABEL) as PlaceKind[]).map((k) => (
                        <option key={k} value={k}>
                          {KIND_LABEL[k]}
                        </option>
                      ))}
                    </select>
                    <Icon name="expand_more" className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-lg" />
                  </label>
                  <label className="relative block">
                    <span className="sr-only">Landscape</span>
                    <select name="map-terrain" value={terrain} onChange={(e) => setTerrain(e.target.value as Terrain | "all")} className="min-h-10 w-full appearance-none truncate rounded-full bg-white/10 pr-8 pl-3.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-white [&>option]:text-ml-ink">
                      <option value="all">Every landscape</option>
                      {(Object.keys(TERRAIN_NAME) as Terrain[]).map((t) => (
                        <option key={t} value={t}>
                          {TERRAIN_NAME[t]}
                        </option>
                      ))}
                    </select>
                    <Icon name="expand_more" className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-lg" />
                  </label>
                </div>
                <ul className="flex flex-col divide-y divide-white/10 pb-4">
                  {added.map((a) => (
                    <li key={a.id}>
                      <button type="button" onClick={() => pick(a.id)} className="group flex w-full items-center gap-3 rounded-sm py-2.5 text-left focus-visible:outline-2 focus-visible:outline-white">
                        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-white/10">
                          <Icon name="add_location" className="text-2xl text-signal-orange" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate leading-snug font-semibold group-hover:text-signal-orange">{a.name}</span>
                          <span className="block text-sm text-white/65">Added by you</span>
                        </span>
                        {isFresh(a.at, nowMs) ? <LevelTag level={REPORT_TO_CROWD[a.level]} label={REPORT_LABEL[a.level]} className="font-normal text-white/75" /> : null}
                      </button>
                    </li>
                  ))}
                  {visible.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => pick(p.id)} className="group flex w-full items-center gap-3 rounded-sm py-2.5 text-left focus-visible:outline-2 focus-visible:outline-white">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
                          <Image src={p.picture.src} alt="" fill sizes="48px" className="object-cover" style={{ objectPosition: p.picture.focus }} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate leading-snug font-semibold group-hover:text-signal-orange">{p.name}</span>
                          <span className="block truncate text-sm text-white/65">{p.district}</span>
                        </span>
                        {now ? <LevelTag level={levelOf(p)} className="font-normal text-white/75" /> : null}
                      </button>
                    </li>
                  ))}
                  {visible.length === 0 ? <li className="py-6 text-white/75">No place matches. Clear the search or choose another landscape.</li> : null}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The crowd alert: where it is filling up this hour, where to go instead, and
 * how hard tickets are likely to be. Every figure is an estimate from the
 * calendar, and the board says so.
 */
export function CrowdBoard() {
  const minute = useMinute();
  const now = minute === null ? null : new Date(minute * 60_000);

  const rows = useMemo(() => (now ? PLACES.map((p) => ({ place: p, crowd: crowdAt(p, now) })) : []), [minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const busiest = [...rows].filter((r) => r.crowd.level !== "closed").sort((a, b) => b.crowd.score - a.crowd.score).slice(0, 5);
  /* The calmest places open now, those in season first, so this list is never empty. */
  const inSeason = (r: (typeof rows)[number]) => (r.crowd.reasons.includes("In season") ? 0 : 1);
  const instead = rows
    .filter((r) => r.crowd.level !== "closed" && !busiest.includes(r))
    .sort((a, b) => inSeason(a) - inSeason(b) || a.crowd.score - b.crowd.score)
    .slice(0, 5);
  const closed = rows.filter((r) => r.crowd.level === "closed");
  const surge = now ? nextSurge(now) : null;
  const clock = now ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true }).format(now) : "";
  const days = now && surge ? daysUntil(now, surge.from) : 0;

  return (
    <section id="crowd-alert" aria-labelledby="crowd-title" className="scroll-mt-(--ml-header) bg-black py-12 text-white sm:py-14 lg:py-16">
      <div className={cn(COLUMN, "flex flex-col gap-10")}>
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
          <div>
            <h2 id="crowd-title" className={DISPLAY}>
              Crowd alert
            </h2>
            <p className="mt-3 text-lg text-white/80">{now ? `${clock}, Dhaka time` : "Reading the clock..."}</p>
          </div>
          {surge ? <p className="rounded-2xl bg-signal-orange px-6 py-4 text-lg font-bold text-black">{days === 0 ? `${surge.name} rush is on now. Book ahead.` : `${surge.name} rush in ${days} day${days === 1 ? "" : "s"}. Book ahead.`}</p> : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl bg-white/[.06] p-7 ring-1 ring-white/10">
            <h3 className="text-xl font-bold">Filling up now</h3>
            <ul className="mt-3 flex flex-col divide-y divide-white/10">
              {busiest.map(({ place, crowd }) => (
                <li key={place.id}>
                  <a href={`#place=${place.id}`} className="flex items-center justify-between gap-3 rounded-sm py-2.5 font-semibold hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
                        <Image src={place.picture.src} alt="" fill sizes="44px" className="object-cover" style={{ objectPosition: place.picture.focus }} />
                      </span>
                      {place.name}
                    </span>
                    <LevelTag level={crowd.level} className="font-normal" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white/[.06] p-7 ring-1 ring-white/10">
            <h3 className="text-xl font-bold">Go here instead</h3>
            <ul className="mt-3 flex flex-col divide-y divide-white/10">
              {instead.map(({ place, crowd }) => (
                <li key={place.id}>
                  <a href={`#place=${place.id}`} className="flex items-center justify-between gap-3 rounded-sm py-2.5 font-semibold hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
                        <Image src={place.picture.src} alt="" fill sizes="44px" className="object-cover" style={{ objectPosition: place.picture.focus }} />
                      </span>
                      {place.name}
                    </span>
                    <LevelTag level={crowd.level} className="font-normal" />
                  </a>
                </li>
              ))}
            </ul>
            {closed.length ? <p className="mt-4 text-sm text-white/70">Closed this month: {closed.map((c) => c.place.name).join(", ")}.</p> : null}
          </div>
          <div className="rounded-2xl bg-white/[.06] p-7 ring-1 ring-white/10">
            <h3 className="text-xl font-bold">Tickets this week</h3>
            <ul className="mt-3 flex flex-col gap-4">
              {now
                ? ticketOutlook(now).map((t) => (
                    <li key={t.mode}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{t.mode}</span>
                        <LevelTag level={t.level} className="font-normal" />
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-white/70">{t.note}</p>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>

        <p className="max-w-4xl text-sm leading-relaxed text-white/65">
          This is an estimate from the season, the weekend, public holidays and the hour, not a live count or real ticket sales. Eid and Puja dates follow the moon and may move a day. Access rules last checked on {TRAVEL_CHECKED}. In the hills especially, confirm with the district administration before you leave.
        </p>
      </div>
    </section>
  );
}
