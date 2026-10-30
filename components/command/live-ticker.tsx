"use client";

import { type FocusEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { safeTitleBn } from "@/lib/command/privacy";
import { inDivision, type DivisionScope } from "@/lib/command/selectors";
import { perDivision, useCommand } from "@/lib/command/store";
import type { TimelineKind, World } from "@/lib/command/types";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Bn, Skeleton, cb, dhakaHm, focusRing } from "./kit";

/**
 * A slim strip of the newest events across the board (in the division, when
 * one is chosen): new reports, escalations, dispatches and resolutions, each
 * a Bangla case title and area with an English verb, and a button that opens
 * the case. It drifts leftwards; an event that has left the strip goes to its
 * far end while it is still among the newest, and newer ones join at the end,
 * so nothing jumps when the world ticks. A pointer or keyboard focus on it
 * holds it, and Pause stops it; under reduced motion it is a still row that
 * scrolls by hand. Decorative, so not a live region: the Live alerts list is
 * the accessible source. Names the area only, never anyone involved.
 */

type TickerKind = Extract<TimelineKind, "reported" | "escalated" | "dispatched" | "resolved">;

const VERB: Record<TickerKind, { label: string; icon: string; tone: string }> = {
  reported: { label: "New report", icon: "fiber_new", tone: "text-white" },
  escalated: { label: "Escalated", icon: "north_east", tone: "text-crimson-bright" },
  dispatched: { label: "Dispatched", icon: "directions_car", tone: "text-bdnavy-300" },
  resolved: { label: "Resolved", icon: "check_circle", tone: "text-signal-orange" },
};
const isTickerKind = (k: TimelineKind): k is TickerKind => k in VERB;

interface TickerEvent {
  /** Case id and timeline index: unique, and stable while the case is in the world. */
  key: string;
  at: number;
  kind: TickerKind;
  caseId: string;
  /** safeTitleBn: a women or child case shows its category and area only. */
  titleBn: string;
  areaBn: string;
}

const COUNT = 14;
/** Drift speed, px per second. */
const SPEED = 42;

function recentEvents(w: World, div: DivisionScope): TickerEvent[] {
  const out: TickerEvent[] = [];
  for (const c of w.cases) {
    if (!inDivision(c, div)) continue;
    c.timeline.forEach((t, i) => {
      if (isTickerKind(t.kind)) out.push({ key: `${c.id}#${i}`, at: t.at, kind: t.kind, caseId: c.id, titleBn: safeTitleBn(c), areaBn: c.place.areaBn });
    });
  }
  return out.sort((a, b) => b.at - a.at || b.key.localeCompare(a.key)).slice(0, COUNT);
}
const selectEvents = perDivision(recentEvents);

/** Draw the track at its offset (transform only: no layout). */
function place(el: HTMLElement | null, x: number): void {
  if (el) el.style.transform = `translate3d(${-x}px, 0, 0)`;
}

/** What the strip shows: `items` in drift order, built from `src` (the newest events) and every key it has shown. */
interface Strip {
  src: TickerEvent[] | null;
  div: DivisionScope;
  items: TickerEvent[];
  seen: ReadonlySet<string>;
}

export function LiveTicker({ div = "all", onOpen, className }: { div?: DivisionScope; onOpen(caseId: string): void; className?: string }) {
  const events = useCommand(selectEvents(div));
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [strip, setStrip] = useState<Strip>({ src: null, div, items: [], seen: new Set() });

  // Keep the strip in step with the store during render (React's "adjust state on a prop change"):
  // a new scope starts over; otherwise only unseen events are added, at the far end.
  if (events !== strip.src) {
    if (events === null || strip.src === null || strip.div !== div) {
      setStrip({ src: events, div, items: events ?? [], seen: new Set(events?.map((e) => e.key)) });
    } else {
      const fresh = events.filter((e) => !strip.seen.has(e.key)).reverse();
      setStrip(
        fresh.length === 0
          ? { ...strip, src: events }
          : { ...strip, src: events, items: [...strip.items, ...fresh], seen: new Set([...strip.seen, ...fresh.map((e) => e.key)]) },
      );
    }
  }

  const track = useRef<HTMLUListElement>(null);
  const offset = useRef(0);
  /** Width of the item being moved to the end, until React has moved it. */
  const shifting = useRef(0);
  const held = useRef(false);

  useEffect(() => {
    if (reduce || paused) return;
    let raf = 0;
    let last = performance.now();
    const frame = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      const el = track.current;
      if (el && !held.current) offset.current += (SPEED * dt) / 1000;
      if (el && shifting.current === 0) {
        const first = el.children[0] as HTMLElement | undefined;
        const second = el.children[1] as HTMLElement | undefined;
        const span = first ? (second ? second.offsetLeft - first.offsetLeft : first.offsetWidth) : 0;
        if (span > 0 && offset.current >= span) {
          shifting.current = span;
          // The first item has left on the left: back to the end while it is still among the newest, else dropped.
          setStrip((s) => {
            const [head, ...rest] = s.items;
            const live = new Set(s.src?.map((e) => e.key));
            return { ...s, items: head && (live.has(head.key) || rest.length === 0) ? [...rest, head] : rest };
          });
        }
      }
      place(el, offset.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce, paused]);

  // React has moved the first item to the end: take its width off the offset in the same frame.
  useLayoutEffect(() => {
    if (shifting.current === 0) return;
    offset.current = Math.max(0, offset.current - shifting.current);
    shifting.current = 0;
    place(track.current, offset.current);
  }, [strip.items]);

  // Another division starts at the beginning.
  useLayoutEffect(() => {
    offset.current = 0;
    shifting.current = 0;
    place(track.current, 0);
  }, [div]);

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) held.current = false;
  };

  const items = reduce ? (events ?? []) : strip.items;

  return (
    <section aria-labelledby="live-ticker-title" className={cn("flex min-h-12 min-w-0 items-stretch overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12", className)}>
      <h2 id="live-ticker-title" className="flex shrink-0 items-center gap-2 border-r border-white/10 pr-3.5 pl-4 font-grotesk text-sm font-bold text-signal-orange">
        <span aria-hidden="true" className="relative grid size-2.5 place-items-center">
          <span className="absolute inset-0 rounded-full bg-signal-orange/50 motion-safe:animate-ping" />
          <span className="size-2 rounded-full bg-signal-orange" />
        </span>
        Live
        <span className="sr-only"> events</span>
      </h2>
      <p className="sr-only">Recent reports, escalations, dispatches and resolutions drift past here. The Live alerts list below has every open case.</p>
      <div
        className={cn("relative min-w-0 flex-1", reduce ? "overflow-x-auto overscroll-x-contain [scrollbar-width:thin]" : "overflow-hidden")}
        onPointerEnter={() => {
          held.current = true;
        }}
        onPointerLeave={() => {
          held.current = false;
        }}
        onFocus={() => {
          held.current = true;
        }}
        onBlur={onBlur}
      >
        {events === null ? (
          <div aria-hidden="true" className="flex h-full items-center gap-6 px-4">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56 max-sm:hidden" />
            <Skeleton className="h-4 w-60 max-lg:hidden" />
          </div>
        ) : items.length === 0 ? (
          <p className="flex h-full items-center px-4 text-sm text-white/65">No events yet. New reports appear here as they arrive.</p>
        ) : (
          <ul ref={track} aria-label="Recent events" className="flex h-full w-max items-center will-change-transform">
            {items.map((e) => {
              const v = VERB[e.kind];
              return (
                <li key={e.key} className="flex shrink-0 items-center border-r border-white/10 px-2 last:border-r-0">
                  <button
                    type="button"
                    data-case-open={e.caseId}
                    onClick={() => onOpen(e.caseId)}
                    className={cn("group inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-left whitespace-nowrap hover:bg-white/6", focusRing)}
                  >
                    <span className="text-xs text-white/65 tabular-nums">{dhakaHm(e.at)}</span>
                    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", v.tone)}>
                      <Icon name={v.icon} className="text-[16px]" />
                      {v.label}
                    </span>
                    <Bn className="max-w-[24ch] truncate text-sm text-white group-hover:text-signal-orange">{e.titleBn}</Bn>
                    <span aria-hidden="true" className="text-white/40">
                      ·
                    </span>
                    <Bn className="text-xs text-white/65">{e.areaBn}</Bn>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {!reduce ? (
        <div className="flex shrink-0 items-center border-l border-white/10 px-1">
          <button
            type="button"
            aria-pressed={paused}
            aria-label="Pause the event strip"
            title={paused ? "Play" : "Pause"}
            onClick={() => setPaused((p) => !p)}
            className={cn(cb.icon, "bg-transparent ring-0")}
          >
            <Icon name={paused ? "play_arrow" : "pause"} className="text-[20px]" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
