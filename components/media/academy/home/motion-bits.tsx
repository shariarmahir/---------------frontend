"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useFormat } from "../../ui/numerals";

/** A card or block that rises into place the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** A number that counts up once it is seen; readers get the final value straight away. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const { num } = useFormat();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const run = animate(0, value, { duration: reduce ? 0 : 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => run.stop();
  }, [seen, reduce, value]);

  return (
    <>
      <span ref={ref} aria-hidden className="tabular-nums">
        {num(shown)}
        {suffix}
      </span>
      <span className="sr-only">
        {num(value)}
        {suffix}
      </span>
    </>
  );
}
