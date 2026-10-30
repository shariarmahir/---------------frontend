"use client";

import { useMediaState } from "@/lib/media/store";

/** Unread messages per seeded conversation id. */
export type UnreadSeed = Record<string, number>;

/** Unread messages left after the viewer has opened some conversations. */
export function useUnread(seed: UnreadSeed): number {
  const read = useMediaState((s) => s.read);
  let n = 0;
  for (const [id, count] of Object.entries(seed)) if (!read[id]) n += count;
  return n;
}
