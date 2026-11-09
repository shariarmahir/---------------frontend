"use client";

import { Fragment, useLayoutEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "./use-in-view";

type Tag = "h1" | "h2" | "h3" | "p";

/**
 * A title whose words rise one after another out of their own line the
 * first time it scrolls into view (motherland.css, .ml-rise). `now` plays
 * it as the page loads instead, in CSS alone, for the hero. Every title
 * stays on one line: its class sets the largest size, and when the words
 * would run wider than their column the size shrinks until they fit,
 * measured again when the column changes width or the font arrives.
 * Screen readers read the plain text.
 */
export function RiseText({ as: As = "h2", text, id, now, className }: { as?: Tag; text: string; id?: string; now?: boolean; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const seen = useInView(ref);
  const words = text.split(" ");

  useLayoutEffect(() => {
    const el = ref.current;
    const column = el?.parentElement;
    if (!el || !column) return;
    const fit = () => {
      el.style.fontSize = "";
      const overflow = el.scrollWidth / el.clientWidth;
      if (overflow > 1) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) / overflow - 0.5}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(column);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text]);

  return (
    <As ref={ref} id={id} className={cn("ml-rise max-w-full overflow-x-clip whitespace-nowrap", className)} data-now={now ? "" : undefined} data-in={!now && seen ? "" : undefined}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="ml-word" style={{ "--i": i } as CSSProperties}>
            <span>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </As>
  );
}
