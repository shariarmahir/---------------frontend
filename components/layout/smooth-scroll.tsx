"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/** How closely the glide follows the wheel: lower is silkier, higher is snappier (the academy's own value). */
const GLIDE = 0.12;
/** The fixed header's height, so a jump to an #anchor lands below it. */
const HEADER_OFFSET = -96;

/**
 * Glides the page under the wheel and the touch, and eases #anchor jumps,
 * like the academy pages. Nothing is added to the page; with reduced motion
 * it does nothing and the browser scrolls as usual.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glide = new Lenis({ lerp: GLIDE, anchors: { offset: HEADER_OFFSET }, allowNestedScroll: true, autoRaf: true });
    return () => glide.destroy();
  }, []);
  return null;
}
