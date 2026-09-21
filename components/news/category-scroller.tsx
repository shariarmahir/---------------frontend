"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Horizontal rail for the category filters.
 *
 * The filter row overflows well before it runs out of categories, and with
 * the scrollbar hidden there was nothing to say so — the last chip simply
 * looked clipped.
 *
 * Arrows rather than an auto-scrolling marquee: these are controls, and a
 * rail that moves on its own slides the button out from under the pointer
 * as it is being clicked. It would also fight keyboard focus and would have
 * to be switched off wholesale under `prefers-reduced-motion`, which is
 * exactly when a reader still needs to reach the last category.
 *
 * The arrows and the edge fades appear only on the side that actually has
 * more content, so nothing is shown when everything already fits.
 */
export function CategoryScroller({
  children,
  label,
  activeKey,
}: {
  children: React.ReactNode;
  label: string;
  /**
   * Changes whenever the selection changes, so the rail can bring the
   * chosen chip fully into view — picking one that sat half past the edge
   * otherwise leaves it clipped.
   */
  activeKey?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  // Both true initially, so SSR and the first client render agree that no
  // arrow is needed. The real measurement only happens in the effect below,
  // after hydration — measuring during render would need a DOM the server
  // does not have, and would mismatch.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  /** Re-read the scroll position and update which affordances are shown. */
  const sync = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    // A 1px tolerance: fractional layout widths mean scrollLeft rarely
    // reaches scrollWidth - clientWidth exactly, which would leave the
    // right arrow showing permanently at the end of the rail.
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    sync();
    // Width changes without a scroll event — a viewport resize, or a font
    // finishing loading and re-flowing the chips.
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync]);

  useEffect(() => {
    const el = railRef.current;
    if (!el || !activeKey) return;
    const chip = el.querySelector<HTMLElement>('[aria-pressed="true"]');
    // `nearest` so a chip already fully visible is left where it is, rather
    // than being yanked to the centre on every click.
    chip?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeKey]);

  /** Page the rail by most of its visible width, keeping some overlap. */
  const page = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const canScroll = !atStart || !atEnd;

  return (
    <div className="relative">
      {/* Left fade + arrow. */}
      {!atStart ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-white to-transparent"
          />
          <button
            type="button"
            onClick={() => page(-1)}
            // Keyboard users reach the chips by tabbing, which scrolls the
            // rail on its own; these buttons would only add two extra stops
            // on the way there.
            tabIndex={-1}
            aria-hidden
            className="absolute top-1/2 left-0 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            <Icon name="chevron_left" className="text-[20px]" />
          </button>
        </>
      ) : null}

      <div
        ref={railRef}
        onScroll={sync}
        role="group"
        aria-label={label}
        className={cn(
          "no-scrollbar flex items-center gap-space-xs overflow-x-auto pb-1",
          // Room for the arrows to sit over the rail without covering a chip.
          canScroll && "px-1",
        )}
      >
        {children}
      </div>

      {/* Right fade + arrow. */}
      {!atEnd ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-white to-transparent"
          />
          <button
            type="button"
            onClick={() => page(1)}
            tabIndex={-1}
            aria-hidden
            className="absolute top-1/2 right-0 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            <Icon name="chevron_right" className="text-[20px]" />
          </button>
        </>
      ) : null}
    </div>
  );
}
