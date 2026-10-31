"use client";

import { useEffect, useEffectEvent, useState, type FocusEvent, type RefObject } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useOnScreen } from "./use-in-view";

/** Every slideshow on the page moves on this one beat, so they keep the same rhythm. */
export const RHYTHM = 3000;

/**
 * Moves a slideshow on by one every beat while it is on screen. It holds
 * still while the pointer rests on it or focus is inside it, while the
 * tab is hidden, after `stopped` (the visitor took over), and always with
 * reduced motion. Each change of `active` restarts the beat, so a card
 * reached by hand gets its full time. Spread `hold` on the slideshow.
 */
export function useRhythm(ref: RefObject<HTMLElement | null>, active: number, next: () => void, stopped = false) {
  const reduced = useReducedMotion();
  const onScreen = useOnScreen(ref);
  const [held, setHeld] = useState(false);
  const running = onScreen && !held && !stopped && !reduced;
  const tick = useEffectEvent(() => {
    if (!document.hidden) next();
  });

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(tick, RHYTHM);
    return () => window.clearTimeout(timer);
  }, [running, active]);

  return {
    onPointerEnter: () => setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: (e: FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
    },
  };
}
