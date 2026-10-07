"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Feature {
  id: string;
  title: string;
  icon: React.ReactNode;
  image: string;
  alt: string;
  /** What the phone's top bar says, like a class title. */
  screen: string;
  /** The two cards floating beside the phone. */
  a: React.ReactNode;
  b: React.ReactNode;
}

/**
 * What the academy includes: a list of features on the left, and on the
 * right a phone showing that feature with two cards floating beside it.
 * Arrow keys move along the list.
 */
export function FeatureTabs({ items }: { items: Feature[] }) {
  const base = useId();
  const reduce = useReducedMotion();
  const [on, setOn] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const f = items[on];

  function move(e: React.KeyboardEvent) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : step !== undefined ? (on + step + items.length) % items.length : null;
    if (next === null) return;
    e.preventDefault();
    setOn(next);
    tabs.current[next]?.focus();
  }

  const float = (delay: number) => (reduce ? {} : { animate: { y: [0, -7, 0] }, transition: { duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" as const } });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-10">
      <div role="tablist" aria-orientation="vertical" aria-label="একাডেমিতে যা যা থাকছে" onKeyDown={move} className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${item.id}`}
            aria-selected={i === on}
            aria-controls={`${base}-panel`}
            tabIndex={i === on ? 0 : -1}
            onClick={() => setOn(i)}
            className={cn(
              "group relative flex h-[4.75rem] shrink-0 items-center gap-4 rounded-xl bg-white pr-6 pl-5 text-left text-[17px] font-semibold text-text-primary ring-4 transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-orange motion-reduce:transition-none lg:w-full",
              i === on ? "ring-signal-orange shadow-[0_14px_30px_-16px_var(--color-signal-orange)]" : "ring-transparent hover:shadow-tile-lift",
            )}
          >
            <span className="size-11 shrink-0 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">{item.icon}</span>
            <span className="whitespace-nowrap lg:whitespace-normal">{item.title}</span>
            {/* The notch pointing at the picture. */}
            {i === on && <span className="absolute top-1/2 -right-[13px] hidden size-5 -translate-y-1/2 rotate-45 border-t-4 border-r-4 border-signal-orange bg-white lg:block" aria-hidden />}
          </button>
        ))}
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${f.id}`} className="relative overflow-hidden rounded-3xl bg-bd-green px-4 py-8 sm:px-8 lg:min-h-[34rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={f.id}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5 lg:block"
          >
            <div className="relative mx-auto w-[15.5rem] rounded-[2.4rem] bg-text-primary p-2.5 pb-12 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:w-[17rem]">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="flex h-4 items-end gap-0.5" aria-hidden>
                  {[0, 1, 2].map((b) => (
                    <motion.span
                      key={b}
                      className="w-1 rounded-full bg-signal-orange"
                      initial={{ height: 8 }}
                      animate={reduce ? { height: 10 } : { height: [5, 16, 5] }}
                      transition={{ duration: 0.8, delay: b * 0.15, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </span>
                <span className="truncate rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white">{f.screen}</span>
              </div>
              <div className="relative aspect-4/5 overflow-hidden rounded-[1.75rem]">
                <Image src={f.image} alt={f.alt} fill sizes="272px" className="object-cover" />
              </div>
            </div>

            <motion.div {...float(0)} className="w-full max-w-[17rem] rounded-2xl bg-white p-4 text-text-primary shadow-[0_24px_40px_-24px_rgb(0_0_0/0.8)] lg:absolute lg:bottom-10 lg:left-6 xl:left-10">
              {f.a}
            </motion.div>
            <motion.div {...float(0.8)} className="w-full max-w-[17rem] rounded-2xl bg-white p-4 text-text-primary shadow-[0_24px_40px_-24px_rgb(0_0_0/0.8)] lg:absolute lg:top-10 lg:right-6 lg:max-w-[14rem] xl:right-10">
              {f.b}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
