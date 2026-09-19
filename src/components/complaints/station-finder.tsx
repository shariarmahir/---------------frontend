"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { stationAreas } from "@/data/complaints";
import { cn } from "@/lib/utils";

/**
 * Nearest police station finder.
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
      setLocateError(
        "This browser cannot share your location. Use the division list instead.",
      );
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
        setLocateError(
          "Location was not shared. Pick your division below instead.",
        );
      },
      { timeout: 10_000 },
    );
  }

  return (
    <section
      id="stations"
      className="w-full border-b border-border bg-white px-gutter py-space-lg"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <h2 className="font-display text-headline-md font-extrabold tracking-tight text-slate-900">
            নিকটস্থ থানা
          </h2>
          <p className="max-w-2xl font-sans text-body-sm leading-relaxed text-slate-600">
            Most complaints start at a police station. Find the one nearest to
            you, or browse by division.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-[20rem_1fr]">
          {/* Controls. */}
          <div className="flex flex-col gap-space-md">
            <button
              type="button"
              onClick={findNearest}
              disabled={locating}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-space-xs rounded-lg px-space-md font-sans text-label-md font-bold transition-colors",
                locating
                  ? "cursor-wait bg-slate-200 text-slate-500"
                  : "bg-primary text-white hover:bg-emerald-800",
              )}
            >
              <Icon
                name={locating ? "progress_activity" : "my_location"}
                className={cn("text-[18px]", locating && "animate-spin")}
              />
              {locating ? "Locating…" : "Find nearest station"}
            </button>

            {locateError ? (
              <p
                role="status"
                className="flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 p-space-sm font-sans text-[0.8125rem] leading-relaxed text-amber-900"
              >
                <Icon name="info" className="mt-px shrink-0 text-[15px]" />
                {locateError}
              </p>
            ) : null}

            <div className="flex flex-col gap-space-xs">
              <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-slate-500 uppercase">
                Browse by division
              </span>
              <div className="flex flex-wrap gap-space-xs">
                {stationAreas.map((s) => (
                  <button
                    key={s.division}
                    type="button"
                    onClick={() => setArea(s)}
                    aria-pressed={area.division === s.division}
                    className={cn(
                      "rounded-lg border px-space-sm py-1.5 font-sans text-[0.8125rem] font-semibold transition-colors",
                      area.division === s.division
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-border bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
                    )}
                  >
                    {s.divisionBn}
                  </button>
                ))}
              </div>
            </div>

            <a
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(area.mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 font-sans text-[0.8125rem] font-semibold text-primary hover:underline"
            >
              <Icon name="open_in_new" className="text-[14px]" />
              Open {area.division} stations in a map
            </a>

            <p className="rounded-lg border border-border bg-slate-50 p-space-sm font-sans text-[0.75rem] leading-relaxed text-slate-600">
              Station phone numbers are not listed here. Numbers change, and a
              wrong one costs time in an emergency — call{" "}
              <a href="tel:999" className="font-bold text-crimson underline">
                999
              </a>{" "}
              for police, or use the map to reach a station&apos;s current
              published contact.
            </p>
          </div>

          {/* Map. */}
          <div className="overflow-hidden rounded-xl border border-border bg-slate-100">
            <iframe
              key={area.division}
              title={`Map of police stations in ${area.division}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${BD_BBOX}&layer=mapnik`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[22rem] w-full border-0 lg:h-[28rem]"
            />
            <div className="flex flex-wrap items-center justify-between gap-space-xs border-t border-border bg-white px-space-md py-space-sm">
              <span className="font-sans text-[0.75rem] text-slate-600">
                Map data © OpenStreetMap contributors
              </span>
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(area.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[0.75rem] font-semibold text-primary hover:underline"
              >
                Search stations near {area.division} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
