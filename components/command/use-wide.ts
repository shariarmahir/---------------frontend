"use client";

import { useSyncExternalStore } from "react";

const WIDE = "(min-width: 64rem)";

function subscribeWide(notify: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
}

/** lg and up (the feed or alerts sit beside the map there); false on the server. */
export const useWide = (): boolean => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
