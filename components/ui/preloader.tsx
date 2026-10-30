"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { PIXEL_MASK } from "@/data/pixel-mask";
import { INTRO_KEY } from "@/lib/intro";

/** Never held longer than this, however slow the device. */
const MAX_MS = 2600;
/** Long enough for the map to finish its repair. */
const MIN_MS = 1300;

/** The 64 × 64 mask read at half resolution, so the map is ~330 pixels, not 1,300. */
const GRID = 32;
const PIXELS = (() => {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const lit = [0, 1].some((dy) => [0, 1].some((dx) => PIXEL_MASK[y * 2 + dy]?.[x * 2 + dx] === "#"));
      if (lit) cells.push({ x, y });
    }
  }
  const cx = cells.reduce((s, c) => s + c.x, 0) / cells.length;
  const cy = cells.reduce((s, c) => s + c.y, 0) / cells.length;
  const far = Math.max(...cells.map((c) => Math.hypot(c.x - cx, c.y - cy)));
  // Repaired from the middle outwards, with a fixed jitter so the front is ragged; one in six starts broken red.
  return cells.map((c, i) => {
    const jitter = ((i * 2654435761) >>> 0) % 160;
    return { ...c, delay: Math.round((Math.hypot(c.x - cx, c.y - cy) / far) * 820 + jitter), broken: i % 6 === 0 };
  });
})();

const MISSION = ["Mapping 32 national problems", "Healthcare first: the golden two hours", "One village, one care centre", "Repairing Bangladesh, pixel by pixel"];

/** Set once the intro has lifted, so a client-side return to the page skips it. */
let lifted = false;

/**
 * The home page's first beat (Mahir, 2026-10-29), the company's metaphor in
 * motion: Bangladesh drawn as a map of broken pixels, a few flickering red,
 * a scan line passing over it, then every pixel repaired to gold from the
 * middle outwards, while the mission runs underneath and the count climbs to
 * 100. Server-rendered, so it covers the very first paint; lifted after the
 * repair (MIN_MS) and never later than MAX_MS. It plays once a session: on
 * a return, app/layout.tsx hides it before it is painted. Without a script,
 * CSS lifts it after a few seconds and <noscript> hides it outright.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"on" | "leaving" | "gone">(lifted ? "gone" : "on");

  useEffect(() => {
    if (lifted) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    if (seen) {
      // Already hidden before the first paint (html.kl-intro-seen); only take it out of the page.
      lifted = true;
      const drop = window.setTimeout(() => setPhase("gone"), 0);
      return () => window.clearTimeout(drop);
    }

    let remove = 0;
    const lift = () => {
      lifted = true;
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      setPhase("leaving");
      remove = window.setTimeout(() => setPhase("gone"), 700);
    };
    // The animation began with the first paint and the page is interactive by now (this runs after
    // hydration), so wait only for the repair to finish, counted from the navigation itself.
    const leave = window.setTimeout(lift, Math.max(0, Math.min(MAX_MS, MIN_MS) - performance.now()));
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(remove);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div aria-hidden data-leaving={phase === "leaving" || undefined} className="preloader fixed inset-0 z-100 grid place-items-center bg-black">
      <noscript>
        <style>{".preloader{display:none}"}</style>
      </noscript>
      <div className="flex w-[min(78vw,22rem)] flex-col items-center gap-6">
        <svg viewBox={`0 0 ${GRID} ${GRID}`} className="pl-map w-full overflow-visible">
          {PIXELS.map((p) => (
            <rect
              key={`${p.x}-${p.y}`}
              x={p.x + 0.1}
              y={p.y + 0.1}
              width={0.8}
              height={0.8}
              rx={0.15}
              className={p.broken ? "pl-px pl-px-broken" : "pl-px"}
              style={{ "--d": `${p.delay}ms` } as CSSProperties}
            />
          ))}
          <rect className="pl-scan" x={0} y={0} width={GRID} height={0.25} />
        </svg>

        <div className="flex w-full flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed, already-cropped still; no optimiser round-trip on the first paint */}
          <img src="/hero/kandari-mark.png" alt="" width={1200} height={179} className="pl-mark h-auto w-44 sm:w-52" />
          <div className="flex w-full items-center justify-between gap-4 font-grotesk text-xs font-semibold text-white/65">
            <span className="pl-ticker relative block h-4 flex-1 overflow-hidden">
              {MISSION.map((line, i) => (
                <span key={line} className="pl-line absolute inset-x-0 top-0 truncate" style={{ "--i": i } as CSSProperties}>
                  {line}
                </span>
              ))}
            </span>
            <span className="pl-count text-signal-orange tabular-nums" />
          </div>
          <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-white/12">
            <span className="preloader-bar absolute inset-y-0 left-0 w-full origin-left rounded-full bg-signal-orange" />
          </span>
        </div>
      </div>
    </div>
  );
}
