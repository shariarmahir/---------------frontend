"use client";

import { useSyncExternalStore } from "react";
import { FEED_ANCHOR_MS } from "@/data/news-feed";

/**
 * The instant the feed measures "2h ago" against.
 *
 * This is a clock shared by every card, so the page never shows two
 * different ideas of "now", and — more importantly — so the server and the
 * client agree on the first render.
 *
 * `useSyncExternalStore` is the right tool rather than state-plus-effect:
 * it takes a separate server snapshot, which is exactly the split this
 * needs. During SSR and the hydrating render React reads
 * `getServerSnapshot` (the fixed anchor, the same one the placeholder
 * timestamps are derived from), so the markup matches. Afterwards it reads
 * the live clock and re-renders on each tick.
 */

/** How often the relative times refresh once the page is interactive. */
const TICK_MS = 60_000;

/**
 * Quantised to the tick so the snapshot is stable between ticks.
 *
 * `getSnapshot` may be called many times per render pass, and returning a
 * fresh `Date.now()` each time would look like a store that never settles —
 * React would loop. Rounding down to the tick boundary makes repeated calls
 * within the same minute return an identical value.
 */
function getSnapshot(): number {
  return Math.floor(Date.now() / TICK_MS) * TICK_MS;
}

/** SSR and the hydrating render both use the fixed anchor. */
function getServerSnapshot(): number {
  return FEED_ANCHOR_MS;
}

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}

/** Current feed instant, shared by every card on the page. */
export function useFeedClock(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
