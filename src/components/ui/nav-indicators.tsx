"use client";

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

/** Indicators that earn a slot in the header's free space. */
const HEADER_IDS = ["world-rank", "air-quality", "external-debt", "factory-shutdown"];

/**
 * Compact live-indicator strip for the navbar.
 *
 * Each chip is an icon, its current value, and a micro bar graph so the
 * severity reads at a glance without leaving the header.
 */
export function NavIndicators({ className }: { className?: string }) {
  const stats = HEADER_IDS.map((id) => nationalStats.find((s) => s.id === id)!).filter(
    Boolean,
  );

  return (
    <div className={cn("items-center gap-space-xs", className)}>
      {stats.map((stat) => (
        <a
          key={stat.id}
          href="#national-index"
          title={`${stat.label} — ${stat.caption}`}
          className="group flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-white/70 px-space-xs py-1 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
        >
          <Icon
            name={stat.icon}
            className={cn(
              "text-[16px] transition-transform group-hover:scale-110",
              TONE_TEXT[stat.tone],
            )}
          />
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "font-code-telemetry text-[0.65rem] font-bold whitespace-nowrap",
                TONE_TEXT[stat.tone],
              )}
            >
              {stat.value}
              {stat.unit ? (
                <span className="font-normal text-slate-500">{stat.unit}</span>
              ) : null}
            </span>
            {/* Micro bar graph. */}
            <span className="mt-0.5 flex h-[3px] w-10 overflow-hidden rounded-full bg-slate-200">
              <span
                className={cn("h-full rounded-full transition-all", TONE_BAR[stat.tone])}
                style={{ width: `${stat.progress}%` }}
              />
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
