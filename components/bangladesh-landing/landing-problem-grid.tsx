"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { SourcePoint, Urgency } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";
import { EvidenceStatus } from "./landing-evidence";

const URGENCY: Record<Urgency, string> = {
  "very-high": "Very high urgency",
  high: "High urgency",
  "medium-high": "Medium-high urgency",
  medium: "Medium urgency",
};

const CHIP =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none";

/** The 32 problems as a compact grid, narrowed by theme with a row of chips. */
export function LandingProblemGrid({ points }: { points: SourcePoint[] }) {
  const [theme, setTheme] = useState<string | null>(null);
  const themes = [...new Set(points.map((p) => p.theme))];
  const shown = theme ? points.filter((p) => p.theme === theme) : points;
  const chip = (value: string | null, label: string, count: number) => {
    const on = theme === value;
    return (
      <li key={label}>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setTheme(value)}
          className={cn(CHIP, on ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-black text-white/80 ring-white/20 hover:text-white hover:ring-white/40")}
        >
          {label}
          <span className={cn("text-xs tabular-nums", on ? "text-text-primary" : "text-white/65")}>{count}</span>
        </button>
      </li>
    );
  };

  return (
    <div>
      <ul aria-label="Filter by theme" className="flex flex-wrap gap-2">
        {chip(null, "All", points.length)}
        {themes.map((t) => chip(t, t, points.filter((p) => p.theme === t).length))}
      </ul>
      <p aria-live="polite" className="mt-5 text-sm text-white/65">
        {theme ? `${shown.length} of ${points.length} problems in ${theme.toLowerCase()}` : `All ${points.length} problems`}
      </p>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {shown.map((p) => (
          <li key={p.n} className="flex flex-col rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12">
            <p className="flex items-center gap-2 text-xs text-white/65">
              <span className="font-grotesk text-sm font-bold text-bdnavy-300 tabular-nums">
                <span className="sr-only">Problem </span>
                {String(p.n).padStart(2, "0")}
              </span>
              <span aria-hidden>·</span>
              {p.theme}
            </p>
            <h3 className="mt-2 text-base leading-snug font-semibold text-white">{p.topic}</h3>
            <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4">
              <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", p.urgency === "very-high" ? "text-crimson-bright" : "text-white/80")}>
                <Icon name={p.urgency === "very-high" ? "priority_high" : "schedule"} className="text-base!" />
                {URGENCY[p.urgency]}
              </span>
              <EvidenceStatus status={p.status} />
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
