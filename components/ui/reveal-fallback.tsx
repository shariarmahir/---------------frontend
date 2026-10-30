"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll-reveal for every `.story-reveal`: each one rises in once, the first
 * time it scrolls into view, and then stays put (a scroll-linked rise would
 * fade back out on the way up and tremble under the smooth scroll).
 *
 * The hidden state exists only under `.reveal-js`, which this sets, so with
 * no script nothing is ever hidden. Anything already on screen (or above
 * it) is marked shown in the same frame, so the first paint never blinks
 * out and back. Elements that mount later (carousels, client sections) are
 * picked up as they arrive. Reduced motion: nothing moves, nothing hides.
 */
export function RevealFallback() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in-view", "rising");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const watchOne = (el: Element) => {
      if (el.classList.contains("in-view")) return;
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in-view");
      else io.observe(el);
    };
    const watch = (root: Element | Document) => {
      if (root instanceof Element && root.matches(".story-reveal")) watchOne(root);
      root.querySelectorAll(".story-reveal").forEach(watchOne);
    };

    watch(document);
    document.documentElement.classList.add("reveal-js");

    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((node) => node instanceof Element && watch(node));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
