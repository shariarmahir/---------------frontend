"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * A full-bleed photograph or film that moves more slowly than the page, cut to
 * size by its own box. `from="start"` is for the top of the page, where the
 * picture begins in place and only drifts as the reader leaves it.
 */
export function Parallax({ lift = 12, from = "center", className, children }: { lift?: number; from?: "center" | "start"; className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: box, offset: from === "start" ? ["start start", "end start"] : ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], from === "start" ? ["0%", `${lift}%`] : [`-${lift / 2}%`, `${lift / 2}%`]);
  return (
    <div ref={box} className={cn("absolute inset-0 -z-20 overflow-hidden", className)}>
      <motion.div className="absolute inset-x-0 -top-[8%] -bottom-[8%]" style={reduced ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}
