"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { stationAreas } from "@/data/complaints";
import { cn } from "@/lib/utils";

/** Bangladesh's bounding box, for the map's first view. */
const BD_BBOX = "88.0,20.5,92.7,26.7";

/**
 * Nearest police station (moved from components/complaints, 2026-10-29):
 * one button hands the visitor's own position to OpenStreetMap's search, or
 * a division opens its stations there. No key, no billing, and on purpose
 * no station phone numbers: a wrong number costs time when time is the
 * thing that matters, so the page sends people to 999 or the station's own
 * published contact.
 *
 * TODO(backend): GET /api/v1/stations?lat=&lon= against the official
 * Bangladesh Police directory, with verified numbers per station.
 */
export function StationFinder() {
  const [area, setArea] = useState(stationAreas[0]);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapSearch = `https://www.openstreetmap.org/search?query=${encodeURIComponent(area.mapQuery)}`;

  const findNearest = () => {
    if (!("geolocation" in navigator)) {
      setError("This browser cannot share your location. Pick your division below.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        window.open(
          `https://www.openstreetmap.org/search?query=police%20station#map=14/${coords.latitude}/${coords.longitude}`,
          "_blank",
          "noopener,noreferrer",
        );
      },
      () => {
        setLocating(false);
        setError("Your location was not shared. Pick your division below.");
      },
      { timeout: 10_000 },
    );
  };

  return (
    <section id="stations" aria-labelledby="stations-title" className="section-band w-full scroll-mt-40 bg-black">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="stations-title">Find your police station</span>}
          lead="Most complaints start at a police station. Find the one nearest you, or browse by division."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="story-reveal flex flex-col gap-4 rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset sm:p-6">
            <button
              type="button"
              onClick={findNearest}
              disabled={locating}
              className={cn(btn.gold, "disabled:cursor-wait disabled:opacity-70")}
            >
              <Icon name={locating ? "progress_activity" : "my_location"} className={cn("text-xl", locating && "animate-spin")} />
              {locating ? "Finding you…" : "Find the nearest station"}
            </button>
            {error && (
              <p role="status" className="live-in flex items-start gap-2 rounded-2xl bg-black/40 p-3 font-sans text-sm text-white/85">
                <Icon name="info" className="mt-0.5 shrink-0 text-lg text-bdnavy-300" />
                {error}
              </p>
            )}
            <div role="group" aria-label="Division" className="flex flex-wrap gap-2">
              {stationAreas.map((s) => (
                <button
                  key={s.division}
                  type="button"
                  onClick={() => setArea(s)}
                  aria-pressed={area.division === s.division}
                  className={cn(
                    "min-h-10 rounded-full px-4 font-sans text-sm font-semibold transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                    area.division === s.division ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/15",
                  )}
                >
                  {s.division}
                </button>
              ))}
            </div>
            <a
              href={mapSearch}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-fit items-center gap-1.5 font-sans text-sm font-semibold text-signal-orange hover:underline"
            >
              Police stations in {area.division} on the map <Icon name="arrow_outward" className="text-base" />
            </a>
            <p className="mt-auto border-t border-white/10 pt-4 font-sans text-sm leading-relaxed text-white/65">
              Station phone numbers are not listed: they change, and a wrong one costs time in an emergency. For the police call{" "}
              <a href="tel:999" className="font-bold text-signal-orange underline">
                999
              </a>
              , or use the station&apos;s own published number from the map.
            </p>
          </div>
          <div className="story-reveal overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12">
            <iframe
              title={`Map of Bangladesh to find police stations near ${area.division}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${BD_BBOX}&layer=mapnik`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-88 w-full border-0 lg:h-112"
            />
            <p className="px-5 py-3 font-sans text-xs text-white/65">Map data © OpenStreetMap contributors</p>
          </div>
        </div>
      </div>
    </section>
  );
}
