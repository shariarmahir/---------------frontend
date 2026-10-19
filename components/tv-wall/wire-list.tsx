import type { ReactNode } from "react";
import { ago, type WireItem } from "@/lib/tv-wall/core";
import { cn } from "@/lib/utils";
import { placeOf, typeOf } from "./labels";

/** The mark beside each report: red for a life or a body harmed, gold for good news, blue for the economy. */
export function markOf(i: WireItem): string {
  if (i.category === "achievement" || i.category === "development") return "bg-signal-orange";
  if (i.category === "economy") return "bg-link-blue";
  if (i.severity === 3) return "bg-national-crimson";
  if (i.severity === 2) return "bg-zone-2";
  return "bg-white/40";
}

/**
 * Reports as a broadcast wire: newest first, each with its mark, time,
 * place, headline (to the outlet's own page) and how many other outlets
 * carried it. Reports that arrived since the last refresh flash once.
 * Headlines stay in the language they were published in.
 */
export function WireList({
  items,
  now,
  fresh,
  limit = 40,
  large,
  empty,
  className,
}: {
  items: WireItem[];
  now: number;
  fresh: Set<string>;
  limit?: number;
  large?: boolean;
  empty: ReactNode;
  className?: string;
}) {
  if (!items.length) return <>{empty}</>;
  return (
    <ol className={cn("relative min-h-0 flex-1 divide-y divide-white/8 overflow-y-auto overscroll-contain", className)}>
      {items.slice(0, limit).map((i) => {
        const place = placeOf(i);
        return (
          <li key={i.id} className={cn("px-5", large ? "py-4" : "py-3", fresh.has(i.id) && "wire-in")}>
            <div className="flex items-center gap-2 font-sans text-xs text-white/65">
              <span aria-hidden className={cn("size-2 shrink-0 rounded-full", markOf(i))} />
              <span className="sr-only">{i.severity === 3 ? "Serious" : i.severity === 2 ? "Moderate" : "Minor"}:</span>
              <time dateTime={new Date(i.publishedAt).toISOString()} className="tabular-nums" suppressHydrationWarning>
                {ago(i.publishedAt, now)}
              </time>
              {place && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-semibold text-white/85">{place}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span className="truncate">{typeOf(i)}</span>
              {fresh.has(i.id) && <span className="ml-auto rounded-full bg-signal-orange px-2 py-px font-semibold text-text-primary">New</span>}
            </div>
            <a
              href={i.url}
              target="_blank"
              rel="noopener noreferrer"
              lang={i.lang}
              className={cn(
                "mt-1 block leading-snug font-semibold text-white transition-colors hover:text-signal-orange focus-visible:rounded focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                i.lang === "bn" ? "font-bengali" : "font-sans",
                large ? "text-xl" : "text-base",
              )}
            >
              {i.title}
            </a>
            <p className="mt-1 font-sans text-xs text-white/55">
              {i.source || "Unknown source"}
              {i.alsoIn.length > 0 && (
                <span className="ml-1.5 text-link-blue" title={i.alsoIn.join(", ")}>
                  + {i.alsoIn.length} more source{i.alsoIn.length === 1 ? "" : "s"}
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
