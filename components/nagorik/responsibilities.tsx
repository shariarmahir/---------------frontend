"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Card } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { GROUPS } from "@/data/nagorik";
import { cn } from "@/lib/utils";

/**
 * Duties by role as tabs (arrow keys, Home and End move between them, as
 * the ARIA tabs pattern asks): each role's duties, the mindset that carries
 * them, and the one brave act it calls for.
 */
export function Responsibilities() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const g = GROUPS[active];

  const onKeyDown = (e: KeyboardEvent) => {
    const last = GROUPS.length - 1;
    const next = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = next < 0 ? last : next > last ? 0 : next;
    setActive(i);
    tabs.current[i]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Choose a role" onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
        {GROUPS.map((x, i) => {
          const on = i === active;
          return (
            <button
              key={x.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`duty-tab-${x.id}`}
              aria-selected={on}
              aria-controls="duty-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none",
                on ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-black text-white/80 ring-white/20 hover:text-white hover:ring-white/40",
              )}
            >
              <Icon name={x.icon} className="text-xl!" />
              {x.label}
            </button>
          );
        })}
      </div>

      <div id="duty-panel" role="tabpanel" aria-labelledby={`duty-tab-${g.id}`} tabIndex={0} className="mt-6 grid gap-4 rounded-3xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none lg:grid-cols-3 lg:gap-6">
        <Card surface="navy" className="lg:row-span-2">
          <h3 className="flex items-center gap-3 font-grotesk text-xl font-bold text-signal-orange">
            <Icon name="assignment_turned_in" className="text-2xl!" />
            Duties
          </h3>
          <ul className="mt-5 grid gap-3">
            {g.duties.map((d) => (
              <li key={d} className="flex gap-3 text-base leading-relaxed text-white">
                <Icon name="check" className="mt-1 shrink-0 text-lg! text-bdnavy-300" />
                {d}
              </li>
            ))}
          </ul>
        </Card>
        <Card surface="ink" className="lg:col-span-2">
          <h3 className="flex items-center gap-3 font-grotesk text-xl font-bold text-signal-orange">
            <Icon name="psychology" className="text-2xl!" />
            Mindset
          </h3>
          <p className="mt-4 font-grotesk text-lg leading-snug font-semibold text-pretty text-white sm:text-xl">{g.mindset}</p>
        </Card>
        <Card surface="cobalt" className="lg:col-span-2">
          <h3 className="flex items-center gap-3 font-grotesk text-xl font-bold text-signal-orange">
            <Icon name="shield" filled className="text-2xl!" />
            One brave act
          </h3>
          <p className="mt-4 font-grotesk text-lg leading-snug font-semibold text-pretty text-white sm:text-xl">{g.bravery}</p>
        </Card>
      </div>
    </div>
  );
}
