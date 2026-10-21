"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { SectionHeading } from "@/components/ui/section-kit";
import { dataSources, type DataSource } from "@/data/data-sources";
import { cn } from "@/lib/utils";

/**
 * Credit for the public sources behind the site's figures: the title and a
 * row of their own logos (Mahir, 2026-10-21), each on a tile in one of the
 * site's own fields matched to the logo's colour (navy, blue, green, gold):
 * wordmarks drawn in white, the round seals in their own colours. A tile
 * lifts and takes a gold edge (white on gold) when pointed at; each links to
 * the data the site takes from it. A seal or symbol with no name in it gets
 * the name set beside it. The row runs the
 * screen's width and drifts left on its own, the list running twice so the
 * loop has no seam; it holds under the pointer or keyboard focus. Reduced
 * motion: no drift, the row scrolls by hand.
 *
 * A touch screen has no hover, so a finger on the row holds it too, and it
 * stays held a few seconds after the finger lifts.
 */

/** How long the row stays still after a finger leaves it. */
const TOUCH_HOLD_MS = 4000;

export function DataSourcesSection() {
  const n = dataSources.length;
  const [held, setHeld] = useState(false);
  const resume = useRef(0);
  useEffect(() => () => window.clearTimeout(resume.current), []);

  const hold = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse") return;
    window.clearTimeout(resume.current);
    setHeld(true);
  };
  const release = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse") return;
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setHeld(false), TOUCH_HOLD_MS);
  };

  return (
    <section id="data-sources" className="section-band">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading tone="dark" title="Our Data Sources" />
      </div>

      {/* The row runs the screen's width; py: room for the tiles' lift. */}
      <div className="story-reveal overflow-hidden py-3 motion-reduce:overflow-x-auto">
        <ul
          onPointerDown={hold}
          onPointerUp={release}
          onPointerCancel={release}
          style={held ? { animationPlayState: "paused" } : undefined}
          className="ds-drift flex w-max items-stretch"
        >
          {[...dataSources, ...dataSources].map((source, i) => {
            const copy = i >= n;
            return (
              // Spacing is padding, not gap, so the doubled row is exactly twice one set.
              <li key={`${source.id}${copy ? "-copy" : ""}`} aria-hidden={copy || undefined} className="flex shrink-0 pl-3 sm:pl-4">
                <SourceLogo source={source} copy={copy} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The tile fields: the site's navy, cobalt and ink, and gold; text and the hover edge to suit each. */
const TILES = {
  navy: { field: "bg-bdnavy-900 ring-white/12", name: "text-white", hover: "hover:ring-signal-orange focus-visible:ring-signal-orange" },
  cobalt: { field: "bg-cobalt ring-white/12", name: "text-white", hover: "hover:ring-signal-orange focus-visible:ring-signal-orange" },
  ink: { field: "bg-text-primary ring-white/12", name: "text-white", hover: "hover:ring-signal-orange focus-visible:ring-signal-orange" },
  gold: { field: "bg-signal-orange ring-black/10", name: "text-text-primary", hover: "hover:ring-white focus-visible:ring-white" },
} as const;

/** Wordmarks sit lower than seals and the square IMF mark, so every logo reads at about the same weight. */
const heightOf = (source: DataSource) => (source.ratio >= 2 ? "h-9 sm:h-11" : "h-11 sm:h-14");

/** One source's logo, a link to its data. `copy`: the loop's second run, kept out of the tab order. */
function SourceLogo({ source, copy }: { source: DataSource; copy: boolean }) {
  const name = source.fullName ?? source.name;
  const tile = TILES[source.tile];
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={copy ? -1 : undefined}
      title={`${name}: ${source.use}`}
      aria-label={`${name}: ${source.use} (opens in a new tab)`}
      className={cn(
        "flex h-20 items-center gap-3 rounded-2xl px-6 ring-2 ring-inset sm:h-24 sm:px-8",
        "transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "focus-visible:outline-none",
        tile.field,
        tile.hover,
      )}
    >
      <span className={cn("relative block shrink-0", heightOf(source))} style={{ aspectRatio: source.ratio }}>
        <Image src={source.logo} alt="" fill unoptimized sizes="240px" className={cn("object-contain", source.white && "brightness-0 invert")} />
      </span>
      {source.mark ? (
        <span className={cn("max-w-40 font-grotesk text-sm leading-tight font-bold text-balance sm:max-w-44 sm:text-base", tile.name)}>{name}</span>
      ) : null}
    </a>
  );
}
