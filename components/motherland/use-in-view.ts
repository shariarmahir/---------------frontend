"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element has scrolled into view, and it stays true: every
 * reveal on the page plays once.
 */
export function useInView(ref: RefObject<Element | null>, margin = "0px 0px -12% 0px") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);

  return inView;
}

/** True while any part of the element is on screen: the slideshows only move while someone can see them. */
export function useOnScreen(ref: RefObject<Element | null>) {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return onScreen;
}
