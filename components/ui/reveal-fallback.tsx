"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll-reveal for browsers without CSS view timelines (Safari and Firefox
 * on phones, older Android WebViews). Where `animation-timeline: view()` works
 * the `.story-reveal` rise runs in pure CSS and this does nothing. Elsewhere
 * it marks the root, then adds `.in-view` to each reveal as it scrolls in;
 * the hidden state exists only once this has run, so nothing waits on it.
 */
export function RevealFallback() {
  const pathname = usePathname();

  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    const root = document.documentElement;
    root.classList.add("reveal-js");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".story-reveal:not(.in-view)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
