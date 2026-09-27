"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the element has scrolled into view (and stays true), so a chart
 * animates in exactly once. Without IntersectionObserver it is true at once.
 */
export function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setSeen(true));
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}
