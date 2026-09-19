"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { nationalStats, type RiskTone } from "@/data/national-index";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<RiskTone, string> = {
  stable: "text-primary",
  watch: "text-signal-text",
  critical: "text-crimson",
};

/** Icon plate — a tinted disc carrying the severity colour. */
const TONE_PLATE: Record<RiskTone, string> = {
  stable: "bg-primary/10 text-primary",
  watch: "bg-signal/10 text-signal-text",
  critical: "bg-crimson/10 text-crimson",
};

/** Indicators that rotate through the navbar slot. */
const HEADER_IDS = [
  "world-rank",
  "air-quality",
  "external-debt",
  "factory-shutdown",
  "productivity",
  "judgment-ratio",
];

/** How long each indicator holds before the next one fades in. */
const ROTATE_MS = 4200;

/**
 * Auto-rotating live indicator for the navbar.
 *
 * One reading at a time — icon, topic, value and movement — cycling on a
 * timer with no manual control. The card is deliberately plain: no rails,
 * meters or progress bars, because the navbar row is only 52px tall and
 * every extra element pushed the text into a clip.
 *
 * Hovering pauses the rotation so a reading can be held still.
 */
export function NavIndicators({ className }: { className?: string }) {
  const stats = HEADER_IDS.map((id) =>
    nationalStats.find((s) => s.id === id),
  ).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || stats.length <= 1) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % stats.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [paused, stats.length]);

  if (stats.length === 0) return null;

  const active = stats[index];

  return (
    <div
      className={cn("min-w-0 items-center", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fixed size so the header never reflows as the indicator changes.
          Centred in row 1, so it is sized to hold the longest reading
          ("Workforce Productivity") without truncating. */}
      <a
        href="#national-index"
        aria-live="polite"
        aria-label={`${active.label}: ${active.value}${
          active.unit ? ` ${active.unit}` : ""
        }${active.delta ? `, ${active.delta}` : ""}. View the national index.`}
        className={cn(
          "group relative block h-11 w-60 shrink-0 overflow-hidden xl:w-[17rem] 2xl:w-[18.5rem]",
          "rounded-lg border border-slate-200/80 bg-slate-50/60",
          "transition-colors duration-300 hover:border-slate-300 hover:bg-white",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:outline-none",
        )}
      >
        {stats.map((stat, i) => (
          <span
            key={stat.id}
            aria-hidden={i !== index}
            // Only the active card is mounted in the visual flow. A crossfade
            // would show two readings at once — the text doubles and becomes
            // unreadable in a card this small — so the outgoing card is
            // removed via `hidden` the moment the index changes, and the
            // incoming one fades up on its own.
            className={cn(
              "absolute inset-0 items-center gap-2 px-2",
              i === index
                ? "animate-nav-card-in flex"
                : "pointer-events-none hidden",
            )}
          >
            {/* Icon disc. */}
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                "transition-transform duration-300 group-hover:scale-105",
                TONE_PLATE[stat.tone],
              )}
            >
              <Icon name={stat.icon} className="text-[15px]" />
            </span>

            {/* Two text rows, min-w-0 throughout so truncation works instead
                of overflowing the card. */}
            <span className="flex min-w-0 flex-1 flex-col justify-center">
              <span className="truncate font-label-sm text-label-xs leading-[1.3] font-bold tracking-wide text-slate-500">
                {stat.label}
              </span>

              <span className="flex min-w-0 items-baseline gap-1 leading-[1.3]">
                <span
                  className={cn(
                    "font-code-telemetry text-[0.9rem] font-extrabold whitespace-nowrap",
                    TONE_TEXT[stat.tone],
                  )}
                >
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="truncate font-code-telemetry text-label-xs text-slate-500">
                    {stat.unit}
                  </span>
                ) : null}

                {stat.delta ? (
                  <span
                    className={cn(
                      "ml-auto flex shrink-0 items-center gap-0.5",
                      "font-code-telemetry text-label-xs font-bold whitespace-nowrap",
                      // Colour by whether the movement is good news for this
                      // metric, not by its direction.
                      (stat.deltaDirection === "up") === Boolean(stat.upIsGood)
                        ? "text-primary"
                        : "text-crimson",
                    )}
                  >
                    <Icon
                      name={
                        stat.deltaDirection === "up"
                          ? "arrow_upward"
                          : "arrow_downward"
                      }
                      // Glyph size, not body copy — the 12px readability
                      // floor does not apply to a directional arrow.
                      aria-hidden
                      className="text-[12px]"
                    />
                    {stat.delta}
                  </span>
                ) : null}
              </span>
            </span>
          </span>
        ))}
      </a>
    </div>
  );
}
