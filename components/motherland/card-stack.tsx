"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { StoryCard } from "@/data/motherland";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { pill } from "./kit";
import { RiseText } from "./rise-text";
import { StackArt } from "./stack-art";

/** How far each card shrinks for every card that lands on top of it. */
const STEP = 0.05;

const WIDE = "(min-width: 1024px)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
/** True from lg, where the cards stick; the server assumes a phone. */
const useWide = () => useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => false);

/** The words' left edge, on the page column's line even past 120rem. */
const INSET = "px-6 sm:px-10 lg:pr-16 lg:pl-[max(3rem,calc((100vw-120rem)/2+3rem))]";

/**
 * The reference site's card stack, edge to edge: from lg each card fills
 * the screen under the header: its title, words and button on the left
 * over a faint drawing of the subject, the photograph on the right. The next card slides up
 * over it while the ones beneath settle back, and a thin bar along the
 * foot fills as the story goes on. Below lg, and with reduced motion, the
 * cards simply follow one another.
 */
export function CardStack({ cards }: { cards: StoryCard[] }) {
  const deck = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const wide = useWide();
  const still = reduced || !wide;
  const { scrollYProgress } = useScroll({ target: deck, offset: ["start start", "end end"] });

  return (
    <ol ref={deck} className="flex flex-col gap-2 lg:gap-0">
      {cards.map((card, i) => (
        <Card key={card.title} card={card} index={i} count={cards.length} progress={scrollYProgress} still={still} />
      ))}
    </ol>
  );
}

function Card({ card, index, count, progress, still }: { card: StoryCard; index: number; count: number; progress: MotionValue<number>; still: boolean }) {
  const scale = useTransform(progress, [index / count, 1], [1, 1 - (count - 1 - index) * STEP]);

  return (
    <li className="lg:sticky lg:top-(--ml-header) lg:h-[calc(100svh-var(--ml-header))]">
      <motion.article style={{ scale: still ? 1 : scale }} className="relative grid h-full origin-top overflow-hidden bg-ml-deep text-white lg:grid-cols-[53fr_47fr]">
        <div className={cn("relative isolate flex min-w-0 flex-col items-start justify-center gap-7 py-14 lg:py-16", INSET)}>
          <StackArt art={card.art} className="-z-10" />
          <RiseText as="h3" text={card.title} className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase" />
          <p className="max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">{card.text}</p>
          <Link href={card.cta.href} className={pill.onDark}>
            {card.cta.label}
          </Link>
        </div>
        <div className="relative order-first aspect-4/3 lg:order-0 lg:aspect-auto">
          <Image src={card.picture.src} alt={card.picture.alt} fill sizes="(min-width: 1024px) 47vw, 100vw" className="object-cover" style={{ objectPosition: card.picture.focus }} />
        </div>
        {!still && (
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
            <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-white" />
          </div>
        )}
      </motion.article>
    </li>
  );
}
