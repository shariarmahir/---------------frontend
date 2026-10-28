"use client";

import { useEffect, useRef } from "react";

/** How closely the ring follows the pointer each frame: lower trails more. */
const FOLLOW = 0.2;
/** What the ring opens up over. */
const INTERACTIVE = "a, button, [role='button'], [role='tab'], label, summary, select";

/**
 * A gold ring that trails the pointer on the home page and opens up over
 * anything that can be clicked (Mahir, 2026-10-29). The system cursor stays:
 * the ring only accompanies it. Mouse and trackpad only, never on a touch
 * screen, and nothing under reduced motion. The frame loop runs only while
 * the ring is catching up, so a still pointer costs nothing.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const to = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let frame = 0;

    const step = () => {
      at.x += (to.x - at.x) * FOLLOW;
      at.y += (to.y - at.y) * FOLLOW;
      ring.style.translate = `${at.x}px ${at.y}px`;
      frame = Math.abs(to.x - at.x) + Math.abs(to.y - at.y) > 0.2 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      to.x = e.clientX;
      to.y = e.clientY;
      if (!ring.dataset.on) {
        at.x = to.x;
        at.y = to.y;
        ring.dataset.on = "";
      }
      const over = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      if (over) ring.dataset.over = "";
      else delete ring.dataset.over;
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onLeave = () => delete ring.dataset.on;
    const onDown = () => (ring.dataset.down = "");
    const onUp = () => delete ring.dataset.down;

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ringRef} aria-hidden className="cursor-ring pointer-events-none fixed top-0 left-0 z-90">
      <span className="cursor-ring-shape block" />
    </div>
  );
}
