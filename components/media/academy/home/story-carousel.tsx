"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormat } from "../../ui/numerals";

export interface Story {
  name: string;
  text: string;
  /** "রহিমা বেগমের কাছে · রান্না ও পেশাদার শেফ" */
  from: string;
  image: string;
  certificate?: string;
}

const EVERY_MS = 7000;

/**
 * Learners in their own words: one story at a time on a white card, moving
 * on by itself every few seconds unless the reader is on it (or prefers no
 * motion), with arrows and dots to choose.
 */
export function StoryCarousel({ stories }: { stories: Story[] }) {
  const reduce = useReducedMotion();
  const { num } = useFormat();
  const [[at, dir], setAt] = useState<[number, 1 | -1]>([0, 1]);
  const [held, setHeld] = useState(false);
  const go = (to: number, d: 1 | -1) => setAt([(to + stories.length) % stories.length, d]);
  const s = stories[at];

  useEffect(() => {
    if (reduce || held) return;
    const t = window.setTimeout(() => setAt(([i]) => [(i + 1) % stories.length, 1]), EVERY_MS);
    return () => window.clearTimeout(t);
  }, [at, held, reduce, stories.length]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="শিক্ষার্থীদের গল্প"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="relative"
    >
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-m-blue-night text-m-on shadow-m-lift">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.article
            key={at}
            custom={dir}
            aria-roledescription="slide"
            aria-label={`গল্প ${num(at + 1)} / ${num(stories.length)}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-6 p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-center"
          >
            <div>
              <Quotes />
              <p className="mt-5 text-lg leading-relaxed sm:text-xl">“{s.text}”</p>
              <p className="mt-6 text-xl font-bold">{s.name}</p>
              <p className="mt-1 text-sm font-semibold text-white/70">{s.from}</p>
            </div>
            <div className="relative aspect-16/10 overflow-hidden rounded-2xl">
              <Image src={s.image} alt="" fill sizes="(min-width: 768px) 352px, 90vw" className="object-cover" />
              {s.certificate && (
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-m-card px-2.5 py-1.5 font-mono text-xs font-bold text-m-blue">
                  <BadgeCheck className="size-4" aria-hidden /> {s.certificate}
                </span>
              )}
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <Arrow side="left" onClick={() => go(at - 1, -1)} />
      <Arrow side="right" onClick={() => go(at + 1, 1)} />

      <div className="mt-8 flex justify-center gap-2">
        {stories.map((st, i) => (
          <button
            key={`${st.name}-${i}`}
            type="button"
            onClick={() => go(i, i > at ? 1 : -1)}
            aria-label={`গল্প ${num(i + 1)}: ${st.name}`}
            aria-current={i === at ? "true" : undefined}
            className={cn("h-2.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none", i === at ? "w-8 bg-m-yellow" : "w-2.5 bg-m-ink/17 hover:bg-m-ink/33")}
          />
        ))}
      </div>
    </div>
  );
}

/** The two quote marks, gold and green, nodding in. */
function Quotes() {
  const reduce = useReducedMotion();
  return (
    <span className="flex gap-1.5" aria-hidden>
      {["fill-m-yellow", "fill-m-blue"].map((tone, i) => (
        <motion.svg
          key={tone}
          viewBox="0 0 20 28"
          className="h-9 w-auto"
          initial={reduce ? false : { y: -12, opacity: 0, rotate: -12 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 420, damping: 16 }}
        >
          <path d="M2 2 h16 v14 q0 9 -9 12 l-2 -4 q4 -2 4 -8 h-9 Z" className={tone} />
        </motion.svg>
      ))}
    </span>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute top-[calc(50%-1.75rem)] hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-m-ink text-m-on shadow-m-tile ring-1 ring-m-ink/10 transition-[scale,background-color] duration-200 hover:scale-110 hover:bg-m-yellow active:scale-95 sm:grid sm:size-14",
        side === "left" ? "-left-1 sm:left-0 lg:-left-2" : "-right-1 sm:right-0 lg:-right-2",
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span className="sr-only">{side === "left" ? "আগের গল্প" : "পরের গল্প"}</span>
    </button>
  );
}
