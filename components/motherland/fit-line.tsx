"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Tag = "p" | "h2" | "h3" | "h4" | "span";

/**
 * One line of text that shrinks a little when its column is too narrow. It only
 * acts when the line is set not to wrap; a phone, where one line would be too
 * small to read, can let it wrap instead.
 */
export function FitLine({ as: As = "p", text, min = 14, className }: { as?: Tag; text: string; min?: number; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const column = el?.parentElement;
    if (!el || !column) return;
    const fit = () => {
      el.style.fontSize = "";
      if (getComputedStyle(el).whiteSpace !== "nowrap") return;
      const overflow = el.scrollWidth / el.clientWidth;
      if (overflow > 1) el.style.fontSize = `${Math.max(min, parseFloat(getComputedStyle(el).fontSize) / overflow - 0.25)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(column);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text, min]);

  const Element = As as "p";
  return (
    <Element ref={ref as React.RefObject<HTMLParagraphElement>} className={cn("max-w-full overflow-x-clip", className)}>
      {text}
    </Element>
  );
}
