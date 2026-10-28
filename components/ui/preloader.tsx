"use client";

import { useEffect, useState } from "react";

/** Never held longer than this, however slow the network. */
const MAX_MS = 2500;
/** Never lifted sooner than this, so it reads as a beat, not a flicker. */
const MIN_MS = 700;

/** Set once the skeleton has lifted, so a client-side return to the page skips it. */
let lifted = false;

/**
 * The home page's first beat (Mahir, 2026-10-29): a skeleton of the page,
 * the header bar, the hero and a row of cards, shimmering on the black
 * ground under the wordmark and a gold line that fills, until the page has
 * loaded. Server-rendered, so it covers the very first paint instead of
 * appearing after it; lifted after at least MIN_MS and at most MAX_MS, then
 * removed. If the script never runs, CSS lifts it after a few seconds
 * (globals.css, .preloader) and <noscript> hides it outright.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"on" | "leaving" | "gone">(lifted ? "gone" : "on");

  useEffect(() => {
    if (lifted) return;
    const start = performance.now();
    let leave = 0;
    let remove = 0;
    const lift = () => {
      window.clearTimeout(leave);
      leave = window.setTimeout(() => {
        lifted = true;
        setPhase("leaving");
        remove = window.setTimeout(() => setPhase("gone"), 600);
      }, Math.max(0, MIN_MS - (performance.now() - start)));
    };

    if (document.readyState === "complete") lift();
    else window.addEventListener("load", lift, { once: true });
    const cap = window.setTimeout(lift, MAX_MS);

    return () => {
      window.removeEventListener("load", lift);
      window.clearTimeout(cap);
      window.clearTimeout(leave);
      window.clearTimeout(remove);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div aria-hidden data-leaving={phase === "leaving" || undefined} className="preloader fixed inset-0 z-100 flex flex-col bg-black">
      <noscript>
        <style>{".preloader{display:none}"}</style>
      </noscript>
      {/* The header bar. */}
      <div className="h-header shrink-0 bg-bdnavy-900 lg:h-header-lg" />
      <div className="mx-auto flex w-full max-w-384 flex-1 flex-col gap-5 px-gutter-x py-5 lg:gap-8 lg:py-8">
        {/* The hero, with the wordmark and the progress line over it. */}
        <div className="skeleton-block relative grid min-h-64 flex-1 place-items-center overflow-hidden rounded-3xl lg:max-h-[28rem]">
          <div className="flex w-56 flex-col items-center gap-5 sm:w-72">
            {/* eslint-disable-next-line @next/next/no-img-element -- a fixed, already-cropped still; no optimiser round-trip on the first paint */}
            <img src="/hero/kandari-mark.png" alt="" width={1200} height={179} className="h-auto w-full" />
            <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-white/12">
              <span className="preloader-bar absolute inset-y-0 left-0 w-full origin-left rounded-full bg-signal-orange" />
            </span>
          </div>
        </div>
        {/* A row of cards. */}
        <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={i > 1 ? "max-lg:hidden" : undefined}>
              <div className="skeleton-block aspect-4/3 rounded-2xl sm:rounded-3xl" />
              <div className="skeleton-block mt-3 h-4 w-2/3 rounded-md" />
              <div className="skeleton-block mt-2 h-3 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
