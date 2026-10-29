"use client";

import { useEffect, useRef, type FocusEvent, type PointerEvent, type RefObject } from "react";

/**
 * A sideways card row that glides one card on by itself (the home page's
 * reviews below xl): every `stepMs` while at least half
 * of it is on screen and the tab is visible, back to the first card after
 * the last. It holds while a mouse points at it or something in it has
 * focus, and for `touchHoldMs` after a finger leaves it. Only for rows that
 * actually scroll, so a row laid out flat (the reviews from xl) never moves.
 * Reduced motion: it never moves on its own.
 *
 * Offsets are measured from the first card, so any padding before it drops
 * out. Spread the returned handlers on the scrolling element.
 */
export function useAutoGlide(ref: RefObject<HTMLElement | null>, { stepMs = 5000, touchHoldMs = 9000 } = {}) {
  const held = useRef(false);
  const release = useRef(0);

  useEffect(() => {
    const track = ref.current;
    if (!track || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inView = false;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.5 });
    io.observe(track);
    const timer = window.setInterval(() => {
      const end = track.scrollWidth - track.clientWidth;
      if (!inView || held.current || document.hidden || end < 2) return;
      const cards = [...track.children] as HTMLElement[];
      const at = (c: HTMLElement) => c.offsetLeft - cards[0].offsetLeft;
      const next = cards.find((c) => at(c) > track.scrollLeft + 4);
      track.scrollTo({ left: !next || track.scrollLeft >= end - 4 ? 0 : at(next), behavior: "smooth" });
    }, stepMs);
    return () => {
      io.disconnect();
      clearInterval(timer);
      clearTimeout(release.current);
    };
  }, [ref, stepMs]);

  const hold = () => {
    clearTimeout(release.current);
    held.current = true;
  };
  const letGo = (after = 0) => {
    clearTimeout(release.current);
    release.current = window.setTimeout(() => (held.current = false), after);
  };

  return {
    onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && hold(),
    onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && letGo(),
    onTouchStart: hold,
    onTouchEnd: () => letGo(touchHoldMs),
    onFocus: hold,
    onBlur: (e: FocusEvent) => !e.currentTarget.contains(e.relatedTarget) && letGo(),
  };
}
