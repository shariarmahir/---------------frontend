"use client";

import { useSyncExternalStore } from "react";

/**
 * A once-a-second clock for countdowns. Server render and hydration see
 * `null` (no time yet), so no mismatch; the client ticks from there.
 *
 * `sessionStart` is when this page first read the clock. Demo countdowns
 * ("ends in 20 hours") are measured from it, so they restart on reload —
 * a real auction would carry an absolute end time from the server.
 */
let sessionStart: number | null = null;

function subscribe(onTick: () => void) {
  const t = window.setInterval(onTick, 1000);
  return () => window.clearInterval(t);
}

function getSnapshot(): number {
  const now = Date.now();
  if (sessionStart === null) sessionStart = now;
  return Math.floor(now / 1000);
}

/** Current time in whole seconds, or null before hydration. */
export function useNowSeconds(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function sessionStartSeconds(): number {
  if (sessionStart === null) sessionStart = Date.now();
  return Math.floor(sessionStart / 1000);
}
