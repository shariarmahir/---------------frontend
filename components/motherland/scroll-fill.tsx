"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * A paragraph that inks itself in as it scrolls past, one line after the
 * other, left to right, gold turning navy: the reference site's "fill on scroll" text, its edge soft so the colour flows, here
 * tied to the scroll position instead of a timer, so it reads at the
 * reader's pace. The lines are measured from the words as laid out, again
 * whenever the width changes or the font arrives. With reduced motion the
 * text is simply inked.
 */
export function ScrollFill({ text, tone = "light", className }: { text: string; tone?: "light" | "dark" | "gold"; className?: string }) {
  const box = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<string[] | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start 0.85", "end 0.5"] });

  useLayoutEffect(() => {
    if (lines || !box.current) return;
    const measured: string[] = [];
    let top = Number.NaN;
    box.current.querySelectorAll<HTMLElement>("[data-word]").forEach((word) => {
      const text = word.textContent?.trim() ?? "";
      if (word.offsetTop !== top) {
        measured.push(text);
        top = word.offsetTop;
      } else {
        measured[measured.length - 1] += ` ${text}`;
      }
    });
    setLines(measured);
  }, [lines]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let width = el.clientWidth;
    const remeasure = () => setLines(null);
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      remeasure();
    });
    ro.observe(el);
    void document.fonts?.ready.then(remeasure);
    return () => ro.disconnect();
  }, []);

  const colours = tone === "dark" ? { base: "text-white/25", ink: "text-white" } : tone === "gold" ? { base: "text-ml-navy/30", ink: "text-ml-navy" } : { base: "text-signal-orange", ink: "text-ml-navy" };

  return (
    <p ref={box} className={cn(colours.base, className)}>
      {lines
        ? lines.map((line, i) => <Line key={`${i}-${line}`} text={line} ink={colours.ink} range={[i / lines.length, (i + 1) / lines.length]} progress={scrollYProgress} still={reduced} />)
        : text.split(" ").map((word, i) => (
            <span key={i} data-word>
              {word}{" "}
            </span>
          ))}
    </p>
  );
}

/** Half the width of the soft edge, in percent of the line. */
const SOFT = 9;

function Line({ text, ink, range, progress, still }: { text: string; ink: string; range: [number, number]; progress: MotionValue<number>; still: boolean }) {
  // The ink comes in behind a soft edge some three words wide, so the colour flows rather than cuts.
  const share = useTransform(progress, range, [0, 1]);
  const mask = useTransform(share, (p) => {
    const at = -SOFT + p * (100 + 2 * SOFT);
    return `linear-gradient(90deg, #000 ${at - SOFT}%, transparent ${at + SOFT}%)`;
  });
  return (
    <span className="relative block">
      {text}
      <motion.span aria-hidden className={cn("absolute inset-0", ink)} style={still ? undefined : { maskImage: mask, WebkitMaskImage: mask }}>
        {text}
      </motion.span>
    </span>
  );
}
