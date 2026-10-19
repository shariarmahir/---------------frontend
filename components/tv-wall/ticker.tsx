import type { CSSProperties } from "react";
import type { WireItem } from "@/lib/tv-wall/core";
import { cn } from "@/lib/utils";
import { placeOf } from "./labels";

/**
 * The crawl: the latest reports of every kind, red for harm, gold for
 * gains. It pauses under the pointer or focus; under reduced motion it
 * stands still and scrolls by hand instead.
 */
export function Ticker({ items }: { items: WireItem[] }) {
  const latest = items.slice(0, 24);
  if (!latest.length) return null;
  const run = (hidden: boolean) =>
    latest.map((i) => {
      const harm = i.category === "crime" || i.category === "corruption" || i.category === "loss";
      const place = placeOf(i);
      return (
        <a
          key={(hidden ? "b-" : "a-") + i.id}
          href={i.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={hidden ? -1 : undefined}
          aria-hidden={hidden || undefined}
          lang={i.lang}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 px-5 text-sm text-white transition-colors hover:text-signal-orange focus-visible:text-signal-orange focus-visible:outline-none",
            i.lang === "bn" ? "font-bengali" : "font-sans",
          )}
        >
          <span aria-hidden className={cn("size-2 rounded-full", harm ? "bg-national-crimson" : i.category === "economy" ? "bg-link-blue" : "bg-signal-orange")} />
          {place && <span className="font-sans font-semibold text-white/70">{place}:</span>}
          {i.title}
        </a>
      );
    });

  return (
    <div className="ticker flex min-h-11 items-stretch overflow-hidden rounded-xl bg-text-primary ring-1 ring-white/12">
      <span className="flex shrink-0 items-center gap-2 bg-national-crimson px-3.5 font-sans text-sm font-bold text-white">
        <span aria-hidden className="tally-blink size-2 rounded-full bg-white" />
        Latest
      </span>
      <div className="no-scrollbar flex min-w-0 flex-1 items-center overflow-hidden motion-reduce:overflow-x-auto" aria-label="Latest headlines">
        <div className="ticker-run flex w-max items-center" style={{ "--ticker-dur": `${Math.max(60, latest.length * 7)}s` } as CSSProperties}>
          {run(false)}
          <span className="contents motion-reduce:hidden">{run(true)}</span>
        </div>
      </div>
    </div>
  );
}
