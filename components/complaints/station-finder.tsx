"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam } from "@/components/ui/section-kit";
import { stationAreas } from "@/data/complaints";
import { cn } from "@/lib/utils";

/**
 * Nearest police station finder — an ink band with the gold pulse on its
 * seam, the home page's gold pills for the divisions and the map on an ink
 * card.
 *
 * OpenStreetMap rather than Google Maps: the embed needs no API key and no
 * billing account, so it works the moment this ships instead of rendering a
 * grey "for development purposes only" box.
 *
 * Deliberately no hardcoded station phone numbers. An unverified number on a
 * page people reach in an emergency is worse than no number, because a wrong
 * one costs time when time is the thing that matters. The buttons hand off
 * to the user's own map app, which resolves a real, current station.
 *
 * TODO(backend): GET /api/v1/stations?lat=&lon= against the official
 * Bangladesh Police directory, with verified numbers per station.
 */

/** Bounding box covering Bangladesh, for the default map view. */
const BD_BBOX = "88.0,20.5,92.7,26.7";

export function StationFinder() {
  const [area, setArea] = useState(stationAreas[0]);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  /** Hand off to the user's map app, centred on their actual position. */
  function findNearest() {
    if (!("geolocation" in navigator)) {
      setLocateError("This browser cannot share your location. Use the division list instead.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        window.open(
          `https://www.openstreetmap.org/search?query=police%20station#map=14/${latitude}/${longitude}`,
          "_blank",
          "noopener,noreferrer",
        );
      },
      () => {
        setLocating(false);
        setLocateError("Location was not shared. Pick your division below instead.");
      },
      { timeout: 10_000 },
    );
  }

  const mapSearch = `https://www.openstreetmap.org/search?query=${encodeURIComponent(area.mapQuery)}`;

  return (
    <section id="stations" aria-labelledby="stations-title" className="section-band-tinted relative isolate w-full scroll-mt-40 overflow-hidden bg-text-primary">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          kicker="নিকটস্থ থানা"
          title={<span id="stations-title">Nearest police station</span>}
          lead="Most complaints start at a police station. Find the one nearest to you, or browse by division."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="story-reveal flex flex-col gap-4">
            <button
              type="button"
              onClick={findNearest}
              disabled={locating}
              className={cn(
                "group inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-5 font-grotesk text-sm font-bold uppercase [-webkit-tap-highlight-color:transparent] transition-[translate,scale,box-shadow] duration-200 active:scale-95",
                locating
                  ? "cursor-wait bg-white/10 text-white/60"
                  : "bg-signal-orange text-text-primary shadow-tile hover:-translate-y-0.5 hover:shadow-tile-lift",
              )}
            >
              <Icon name={locating ? "progress_activity" : "my_location"} className={cn("text-[20px]", locating && "animate-spin")} />
              {locating ? "Locating…" : "Find nearest station"}
            </button>

            {locateError ? (
              <p role="status" className="live-in flex items-start gap-2 rounded-2xl bg-bdorange-600 p-3 font-sans text-[0.8125rem] leading-relaxed text-text-primary">
                <Icon name="info" className="mt-px shrink-0 text-[16px]" />
                {locateError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] font-bold tracking-widest text-white/80 uppercase">Browse by division</span>
              <div className="flex flex-wrap gap-2">
                {stationAreas.map((s) => (
                  <button
                    key={s.division}
                    type="button"
                    onClick={() => setArea(s)}
                    aria-pressed={area.division === s.division}
                    className={cn(
                      "min-h-10 rounded-full px-4 font-bengali text-sm font-semibold [-webkit-tap-highlight-color:transparent] transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                      area.division === s.division ? "bg-signal-orange text-text-primary" : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20",
                    )}
                  >
                    {s.divisionBn}
                  </button>
                ))}
              </div>
            </div>

            <a
              href={mapSearch}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-bd-green px-4 py-2.5 font-sans text-[0.8125rem] font-bold text-white [-webkit-tap-highlight-color:transparent] transition-[translate,scale] duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <Icon name="open_in_new" className="text-[16px]" />
              Open {area.division} stations in a map
            </a>

            <p className="rounded-2xl bg-black p-4 font-sans text-[0.75rem] leading-relaxed text-white/75 ring-1 ring-white/12">
              Station phone numbers are not listed here. Numbers change, and a wrong one costs time in an emergency — call{" "}
              <a href="tel:999" className="font-bold text-crimson-bright underline">
                999
              </a>{" "}
              for police, or use the map to reach a station&apos;s current published contact.
            </p>
          </div>

          <div className="story-reveal overflow-hidden rounded-3xl bg-black ring-1 ring-white/12">
            <iframe
              key={area.division}
              title={`Map of police stations in ${area.division}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${BD_BBOX}&layer=mapnik`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[22rem] w-full border-0 lg:h-[28rem]"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <span className="font-sans text-[0.75rem] text-white/65">Map data © OpenStreetMap contributors</span>
              <a href={mapSearch} target="_blank" rel="noopener noreferrer" className="font-sans text-[0.75rem] font-bold text-signal-orange hover:underline">
                Search stations near {area.division} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
