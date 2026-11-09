"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A scroll container that shows there is more: the edge toward unseen content
 * fades out (a mask, not a gradient layer), and the fade goes away at the
 * end. Pass the overflow classes yourself (`overflow-y-auto max-h-72`,
 * `overflow-x-auto`, or a breakpoint-scoped version); with no overflow the
 * fade never shows. Positioned, so visually hidden text inside a table cannot
 * escape the clip and widen the page.
 */

const FADE = "2.25rem";

export function ScrollCue({
  axis = "y",
  as = "div",
  className,
  children,
  ...rest
}: {
  axis?: "x" | "y";
  as?: "div" | "ul" | "ol";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef({ start: false, end: false });
  const [more, setMore] = useState<{ start: boolean; end: boolean }>({ start: false, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const pos = axis === "y" ? el.scrollTop : Math.abs(el.scrollLeft);
    const size = axis === "y" ? el.clientHeight : el.clientWidth;
    const full = axis === "y" ? el.scrollHeight : el.scrollWidth;
    const start = pos > 1;
    const end = pos + size < full - 1;
    // Only set state on a real change: an identical setState from an effect with no dependencies re-renders and loops.
    if (last.current.start === start && last.current.end === end) return;
    last.current = { start, end };
    setMore({ start, end });
  }, [axis]);

  // Content changes with every tick, so measure after each render too (cheap, and setState is skipped when nothing changed).
  useEffect(() => {
    measure();
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const dir = axis === "y" ? "to bottom" : "to right";
  const mask =
    more.start || more.end
      ? `linear-gradient(${dir}, ${more.start ? "transparent 0" : "#000 0"}, #000 ${more.start ? FADE : "0"}, #000 calc(100% - ${more.end ? FADE : "0px"}), ${more.end ? "transparent 100%" : "#000 100%"})`
      : undefined;

  return (
    <Tag ref={ref} onScroll={measure} className={cn("relative", className)} style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined} {...rest}>
      {children}
    </Tag>
  );
}
