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
const INSET = "px-6 sm:px-10 lg:pr-16 lg:pl-[max(3rem,calc((100vw-var(--ml-column))/2+3rem))]";

/**
 * The reference site's card stack, edge to edge: from lg each card fills
 * the screen under the header: its title, words and button on the left
 * over a faint drawing of the subject, the photograph on the right. The next card slides up
 * over it while the ones beneath settle back, and a thin bar along the
 * foot fills as the story goes on. Below lg, and with reduced motion, the
 * cards simply follow one another.
 */
type DealtCard = Omit<StoryCard, "cta"> & { cta?: StoryCard["cta"] };

export function CardStack({ cards, tone = "forest" }: { cards: DealtCard[]; tone?: "forest" | "navy" }) {
  const deck = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const wide = useWide();
  const still = reduced || !wide;
  const { scrollYProgress } = useScroll({ target: deck, offset: ["start start", "end end"] });

  return (
    <ol ref={deck} className="flex flex-col gap-2 lg:gap-0">
      {cards.map((card, i) => (
        <Card key={card.title} card={card} index={i} count={cards.length} progress={scrollYProgress} still={still} tone={tone} />
      ))}
    </ol>
  );
}

function Card({ card, index, count, progress, still, tone }: { card: DealtCard; index: number; count: number; progress: MotionValue<number>; still: boolean; tone: "forest" | "navy" }) {
  const scale = useTransform(progress, [index / count, 1], [1, 1 - (count - 1 - index) * STEP]);

  return (
    <li className="lg:sticky lg:top-(--ml-header) lg:h-[calc(100svh-var(--ml-header))]">
      <motion.article style={{ scale: still ? 1 : scale }} className={cn("relative grid h-full origin-top overflow-hidden text-white lg:grid-cols-[53fr_47fr]", tone === "navy" ? "bg-ml-navy" : "bg-ml-deep")}>
        <div className={cn("relative isolate flex min-w-0 flex-col items-start justify-center gap-7 py-14 lg:py-16", INSET)}>
          <StackArt art={card.art} className="-z-10" />
          <RiseText as="h3" text={card.title} className="text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[1.12] font-extrabold tracking-[-0.035em]" />
          <p className="max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">{card.text}</p>
          {!card.cta ? null : card.cta.href.startsWith("#") ? (
            <a href={card.cta.href} className={pill.onDark}>
              {card.cta.label}
            </a>
          ) : (
            <Link href={card.cta.href} className={pill.onDark}>
              {card.cta.label}
            </Link>
          )}
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
