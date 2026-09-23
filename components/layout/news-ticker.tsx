"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { announcementKinds, announcements } from "@/data/announcements";
import { cn } from "@/lib/utils";

/** How long each announcement stays on screen before the next slides in. */
const HOLD_MS = 4500;

/**
 * Header announcement rotator — one item at a time.
 *
 * Every item is stacked in the same slot. The active one slides up into
 * place, the one before it slides up and out, and the rest wait hidden
 * below (keyframes in globals.css). Only those two animate, so an item
 * wrapping from "gone above" back to "waiting below" jumps there
 * invisibly instead of sweeping across the strip.
 *
 * Rotation holds while the pointer is over the strip or a link in it has
 * keyboard focus, so an item never changes under a reader about to click.
 * Inactive items are `inert`: out of the tab order and the accessibility
 * tree, so screen readers get one announcement, not eight.
 */
export function NewsTicker() {
  const [active, setActive] = useState(0);
  const held = useRef(false);
  const count = announcements.length;

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!held.current) setActive((i) => (i + 1) % count);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [count]);

  const hold = () => {
    held.current = true;
  };
  const release = () => {
    held.current = false;
  };

  return (
    <section
      aria-label="ঘোষণা"
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocus={hold}
      onBlur={release}
      className="relative h-5 min-w-0 flex-1 overflow-hidden"
    >
      {announcements.map((item, i) => {
        const kind = announcementKinds[item.kind];
        const isActive = i === active;
        const isLeaving = i === (active - 1 + count) % count;
        return (
          <div
            key={item.id}
            inert={!isActive}
            className={cn(
              "news-rotator-item absolute inset-0 flex items-center gap-2",
              isActive && "is-active",
              isLeaving && "is-leaving",
            )}
          >
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-bengali text-[10px] leading-none font-semibold",
                kind.chip,
              )}
            >
              <Icon name={kind.icon} className="text-[12px]!" />
              {kind.label}
            </span>
            {item.isNew && (
              <span className="shrink-0 rounded bg-national-crimson px-1 py-0.5 font-bengali text-[9px] leading-none font-bold text-white">
                নতুন
              </span>
            )}
            <Link
              href={item.href}
              className="group/tick flex min-w-0 items-center gap-1.5 rounded-sm font-bengali text-xs text-slate-700 hover:text-bd-green focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            >
              {/* Truncates on narrow strips; the call to action never does. */}
              <span className="truncate">{item.text}</span>
              <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold whitespace-nowrap text-bdorange-600 group-hover/tick:underline">
                {item.cta}
                <Icon name="arrow_forward" className="text-[12px]!" />
              </span>
            </Link>
          </div>
        );
      })}
    </section>
  );
}
