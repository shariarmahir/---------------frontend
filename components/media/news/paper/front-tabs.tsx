"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The front page's two-tab box (সম্পাদকের বাছাই | ধীরে পড়ুন), after The
 * Daily Star's "Editor's Pick / Slow Reads". Both panels are rendered on the
 * server and handed in; this only shows one at a time. Arrow keys, Home and
 * End move between the tabs (the WAI-ARIA tabs pattern).
 */
export function FrontTabs({ tabs }: { tabs: { label: string; panel: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  const go = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1);
    else if (e.key === "ArrowLeft") go(active - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(tabs.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="rounded-2xl bg-bdnavy-900 p-5 ring-1 ring-white/12 sm:p-6">
      <div role="tablist" aria-label="বাছাই করা খবর" onKeyDown={onKey} className="grid grid-cols-2 gap-1 rounded-xl bg-black/40 p-1 ring-1 ring-white/12">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${base}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "min-h-11 rounded-lg px-3 font-grotesk text-base font-bold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none",
              i === active ? "bg-signal-orange text-text-primary" : "text-white/75 hover:text-signal-orange",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} id={`${base}-panel-${i}`} role="tabpanel" aria-labelledby={`${base}-tab-${i}`} hidden={i !== active} tabIndex={0} className="mt-6 rounded-sm focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
