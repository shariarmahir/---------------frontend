"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardTab {
  name: string;
  count: number;
  panel: ReactNode;
}

/**
 * A long wall of cards, one group at a time. Every panel is in the page the server sends, so
 * search engines read them all; without a script they all simply stand open.
 */
export function CardTabs({ id, label, tabs }: { id: string; label: string; tabs: CardTab[] }) {
  const [on, setOn] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const last = tabs.length - 1;
    const next = e.key === "ArrowRight" ? (on === last ? 0 : on + 1) : e.key === "ArrowLeft" ? (on === 0 ? last : on - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setOn(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-8">
      <noscript>
        <style>{"[data-tab-panel][hidden] { display: block !important; }"}</style>
      </noscript>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="flex flex-wrap gap-2.5">
        {tabs.map((t, i) => {
          const selected = i === on;
          return (
            <button
              key={t.name}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setOn(i)}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[15px] font-semibold ring-1 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy motion-reduce:transition-none",
                selected ? "bg-ml-navy text-white ring-ml-navy" : "bg-white text-ml-navy ring-ml-navy/15 hover:bg-ml-navy/6",
              )}
            >
              {t.name}
              <span className={cn("text-sm font-medium tabular-nums", selected ? "text-signal-orange" : "text-ml-navy/55")}>{t.count}</span>
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div key={t.name} id={`${id}-panel-${i}`} role="tabpanel" aria-labelledby={`${id}-tab-${i}`} data-tab-panel hidden={i !== on}>
          {t.panel}
        </div>
      ))}
    </div>
  );
}
