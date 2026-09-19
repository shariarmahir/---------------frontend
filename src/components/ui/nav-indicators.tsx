"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { nationalStats, type RiskTone } from "@/data/national-index";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<RiskTone, string> = {
  stable: "text-primary",
  watch: "text-signal",
  critical: "text-crimson",
};

const TONE_BAR: Record<RiskTone, string> = {
  stable: "bg-primary",
  watch: "bg-signal",
  critical: "bg-crimson",
};

const TONE_CHIP: Record<RiskTone, string> = {
  stable: "border-emerald-200 bg-emerald-50",
  watch: "border-orange-200 bg-orange-50",
  critical: "border-red-200 bg-red-50",
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

/** How long each indicator holds before the next one slides in. */
const ROTATE_MS = 3600;

/**
 * Single rotating live-indicator for the navbar.
 *
 * Rather than crowding the bar with every chip at once, one indicator is
 * shown at a time — icon, topic name, value and severity meter — and the
 * set cycles on a timer. Hovering pauses the rotation so a reading can be
 * held still, and the dots let it be driven by hand.
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

  return (
    <div
      className={cn("min-w-0 items-center gap-space-sm", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Rotating readout. Fixed height so the header never reflows. */}
      <a
        href="#national-index"
        aria-live="polite"
        className={cn(
          "group relative flex h-11 w-60 shrink-0 items-center gap-space-sm overflow-hidden",
          "rounded-lg border px-space-sm shadow-xs transition-all",
          "hover:-translate-y-0.5 hover:shadow-sm xl:w-68",
          TONE_CHIP[stats[index].tone],
        )}
      >
        {stats.map((stat, i) => (
          <span
            key={stat.id}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 flex items-center gap-space-sm px-space-sm",
              "transition-all duration-500 ease-out",
              i === index
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-3 opacity-0",
            )}
          >
            <Icon
              name={stat.icon}
              className={cn(
                "shrink-0 text-[20px] transition-transform group-hover:scale-110",
                TONE_TEXT[stat.tone],
              )}
            />

            <span className="flex min-w-0 flex-col leading-none">
              {/* Topic name. */}
              <span className="truncate font-label-sm text-[0.62rem] font-semibold tracking-wide text-slate-600 uppercase">
                {stat.label}
              </span>

              <span className="mt-0.5 flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-code-telemetry text-label-md font-bold whitespace-nowrap",
                    TONE_TEXT[stat.tone],
                  )}
                >
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="font-code-telemetry text-[0.6rem] whitespace-nowrap text-slate-500">
                    {stat.unit}
                  </span>
                ) : null}
              </span>

              {/* Severity meter. */}
              <span className="mt-1 flex h-[3px] w-full overflow-hidden rounded-full bg-white/70">
                <span
                  className={cn("h-full rounded-full", TONE_BAR[stat.tone])}
                  style={{ width: `${stat.progress}%` }}
                />
              </span>
            </span>
          </span>
        ))}
      </a>

      {/* Position dots — also a manual control. */}
      <span className="hidden shrink-0 items-center gap-1 xl:flex">
        {stats.map((stat, i) => (
          <button
            key={stat.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${stat.label}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index
                ? "w-4 bg-primary"
                : "w-1.5 bg-slate-300 hover:bg-slate-400",
            )}
          />
        ))}
      </span>
    </div>
  );
}
