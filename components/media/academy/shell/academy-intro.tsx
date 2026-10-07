"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

const RUN_MS = 2300;
const STEPS = ["ভর্তি", "শেখা", "প্রমাণ", "কাজ"];
const PIXELS = ["bg-text-primary", "bg-bd-green", "bg-white"];

/**
 * The academy opening, once per visit: the brand's three pixels drop in,
 * the name rises, and the path a learner walks lights up word by word.
 * Skippable; with reduced motion the finished card shows briefly.
 */
export function AcademyIntro({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 600 : RUN_MS);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  const rise = (delay: number) => (reduce ? { initial: false as const } : { initial: { y: 24, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-[46] grid place-items-center overflow-hidden bg-signal-orange px-6 font-sans text-text-primary">
      <div className="flex max-w-2xl flex-col items-center text-center">
        <div className="flex gap-2.5" aria-hidden>
          {PIXELS.map((tone, i) => (
            <motion.span
              key={tone}
              className={`size-5 rounded-[5px] ${tone}`}
              initial={reduce ? false : { y: -60, opacity: 0, rotate: -25 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 500, damping: 22 }}
            />
          ))}
        </div>
        <motion.p {...rise(0.45)} className="mt-6 text-sm font-bold">
          শিক্ষিতদের মিডিয়া
        </motion.p>
        <motion.h1 {...rise(0.55)} className="mt-2 text-[clamp(2.25rem,8vw,4.5rem)] leading-[1.12] font-bold">
          কাণ্ডারী তৈরি একাডেমি
        </motion.h1>
        <motion.p {...rise(0.75)} className="mt-2 text-[clamp(1.25rem,3.5vw,1.75rem)] font-bold text-bd-green-dark">
          “সবার আমি ছাত্র”
        </motion.p>
        <ol className="mt-8 flex items-center gap-2 text-sm font-bold sm:gap-3 sm:text-base">
          {STEPS.map((s, i) => (
            <motion.li key={s} className="flex items-center gap-2 sm:gap-3" {...rise(1 + i * 0.18)}>
              {i > 0 && <span className="h-0.5 w-5 rounded-full bg-text-primary/40 sm:w-8" aria-hidden />}
              <span className="rounded-lg bg-text-primary px-2.5 py-1 text-signal-orange">{s}</span>
            </motion.li>
          ))}
        </ol>
        <div className="mt-9 h-1.5 w-56 overflow-hidden rounded-full bg-text-primary/15">
          <motion.div className="h-full origin-left rounded-full bg-text-primary" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: (reduce ? 600 : RUN_MS) / 1000, ease: "easeInOut" }} />
        </div>
        <button type="button" onClick={onDone} className="mt-5 rounded-lg px-3 py-1.5 text-xs font-bold text-text-primary/75 transition-colors hover:bg-text-primary/10 hover:text-text-primary">
          এড়িয়ে যান
        </button>
      </div>
    </div>
  );
}
