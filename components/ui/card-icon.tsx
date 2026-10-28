"use client";

import { LordIcon } from "@lordicon/react";
import type { LordIconElement } from "@lordicon/element";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

/** The landing page's one icon look: gold lines with light-blue accents (Mahir, 2026-10-29). */
export const BRAND_ICON_COLORS = { primary: "#e4b027", secondary: "#8fa1e3" };

/**
 * Every card icon on the landing page, in one look (Mahir, 2026-10-29:
 * "all icons must be the same"): an animated Lordicon from the free Wired
 * Lineal set in `public/lordicon/<name>.json`, bold strokes in the brand's
 * gold and light blue, playing on a slow loop so it always feels alive.
 * It loads as it nears the screen and pauses while off it, so a page of
 * icons costs nothing out of sight. Viewers who ask for less motion get
 * the still frame (the player handles that). `fallback` is the Material
 * Symbol shown until the animation arrives, in a fixed box, so nothing
 * shifts. Decorative unless `label` is given.
 */
export function CardIcon({
  name,
  fallback,
  size = 48,
  delay = 2600,
  label,
  className,
}: {
  /** File name in `public/lordicon/`, without `.json`. */
  name: string;
  /** Material Symbols name shown until the animation loads. */
  fallback: string;
  /** Square size in px. */
  size?: number;
  /** Pause between plays, in ms. */
  delay?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<LordIconElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play() : el.pause()), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <LordIcon
      ref={ref}
      src={`/lordicon/${name}.json`}
      trigger={`loop(${delay})`}
      stroke="bold"
      colors={BRAND_ICON_COLORS}
      loading="lazy"
      className={className}
      style={{ width: size, height: size, display: "inline-block" }}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="inline-flex items-center justify-center text-signal-orange" style={{ width: size, height: size, fontSize: Math.round(size * 0.7) }}>
        <Icon name={fallback} className="[font-size:inherit]!" />
      </span>
    </LordIcon>
  );
}
