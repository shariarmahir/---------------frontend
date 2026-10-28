"use client";

import { useState } from "react";
import { Card, type Surface } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { RIGHT_THEMES, RIGHTS, type RightTheme } from "@/data/nagorik";
import { cn } from "@/lib/utils";

const CHIP =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none";

const SURFACES: Surface[] = ["navy", "ink", "cobalt"];

/** The fundamental rights, narrowed by theme with a row of chips; each card says what to do when the right is denied. */
export function Rights() {
  const [theme, setTheme] = useState<RightTheme | null>(null);
  const shown = theme ? RIGHTS.filter((r) => r.theme === theme) : RIGHTS;
  const chip = (value: RightTheme | null, label: string, count: number) => {
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
        {chip(null, "All", RIGHTS.length)}
        {RIGHT_THEMES.map((t) => chip(t, t, RIGHTS.filter((r) => r.theme === t).length))}
      </ul>
      <p aria-live="polite" className="mt-5 text-sm text-white/65">
        {theme ? `${shown.length} of ${RIGHTS.length} rights: ${theme.toLowerCase()}` : `${RIGHTS.length} rights from Articles 27 to 44`}
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((r) => (
          <li key={r.article} className="flex">
            <Card surface={SURFACES[RIGHTS.indexOf(r) % SURFACES.length]} className="flex w-full flex-col">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-signal-orange ring-1 ring-white/12">
                  <Icon name={r.icon} className="text-2xl!" />
                </span>
                <p className="text-sm font-semibold text-white/80">
                  Article {r.article}
                  <span aria-hidden> · </span>
                  <span className="sr-only">, </span>
                  {r.theme}
                </p>
              </div>
              <h3 className="mt-5 font-grotesk text-xl font-bold text-signal-orange">{r.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-white/80">{r.body}</p>
              <div className="mt-auto pt-5">
                <p className="border-t border-white/12 pt-4 text-sm leading-relaxed text-white/80">
                  <strong className="block font-semibold text-white">If it is denied</strong>
                  {r.denied}
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
