"use client";

import { useSyncExternalStore } from "react";

/*
 * The visitor's reduced-motion setting, live. Used instead of Framer Motion's
 * useReducedMotion, which reads the setting once and logs a warning on every
 * load for those visitors. The server assumes motion is fine; React then
 * re-renders with the real value after hydration, without a mismatch.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
