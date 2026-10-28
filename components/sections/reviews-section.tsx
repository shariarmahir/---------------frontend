"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { reviews, type Review, type ReviewField } from "@/data/reviews";
import { cn } from "@/lib/utils";

/*
 * Partner reviews as a row of solid cards in the content column, one
 * always open. From xl the open card widens and its quote fades in;
 * pointing at another card opens that one instead. A closed card is the
 * reviewer alone: a large portrait in the middle with a thought bubble at
 * its shoulder (they have something to say), the name and role under it.
 * The portrait is the keyboard control (Enter or a click opens, and focus
 * moves to the open card's ×, which closes it again). The open card shows
 * the portrait small at the top, the quote, and the name at the foot. The
 * quote is set at the open card's final width (capped for line length), so
 * it never reflows while the card grows.
 *
 * Below xl the row is a swipe carousel of quote cards that bleeds to the
 * window's edge, its first card on the column: every quote shows,
 * the next card peeks in at the edge, and the reviewer sits at the card's
 * foot with a small portrait, so the section is one card
 * tall, not five.
 */

const LOOKS: Record<ReviewField, { card: string; muted: string; button: string; accent: string; quote?: string; name?: string }> = {
  navy: {
    card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/65",
    button: "bg-signal-orange text-text-primary",
    accent: "text-signal-orange",
  },
  /* Cobalt replaced the gold field across the landing page (Mahir, 2026-10-18). Gold
     on cobalt is ≈3.9:1, enough only for large text (24px, or 19px bold), so on
     cobalt gold carries only the mark and the button; quote, name and role are white. */
  cobalt: {
    card: "bg-cobalt text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/80",
    quote: "text-white font-bold",
    name: "text-white",
    button: "bg-signal-orange text-text-primary",
    accent: "text-signal-orange",
  },
  ink: {
    card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/65",
    button: "bg-signal-orange text-text-primary",
    accent: "text-signal-orange",
  },
};

export function ReviewsSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section-band">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="reviews-title">What Partners Say</span>}
          lead="In the words of those we build with."
        />
      </div>

      {/* --n: the card count, for the quote's width. Below xl: a snap carousel running to the window's edge. From xl: the column's row. */}
      <ul
        style={{ "--n": reviews.length } as CSSProperties}
        tabIndex={0}
        aria-label="Partner reviews, scroll sideways for more"
        className={cn(
          "story-reveal @container flex snap-x snap-mandatory scroll-px-gutter-x gap-3 overflow-x-auto overscroll-x-contain px-gutter-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "rounded-3xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
          "xl:mx-auto xl:h-108 xl:max-w-384 xl:snap-none xl:gap-4 xl:overflow-visible xl:rounded-none",
        )}
      >
        {reviews.map((review, i) => (
          <ReviewCard
            key={review.id}
            review={review}
            index={i}
            open={open === i}
            onOpen={() => setOpen(i)}
            onToggle={() => setOpen((o) => (o === i ? -1 : i))}
          />
        ))}
      </ul>
    </section>
  );
}

/** The reviewer's photograph as it comes (a cut-out on its own disc), or a bare silhouette in the card's accent without one. */
function Portrait({ review, accent, className }: { review: Review; accent: string; className?: string }) {
  if (review.photo) {
    return (
      <span className={cn("relative block size-24 shrink-0 sm:size-28", className)}>
        <Image src={review.photo} alt={review.name} fill sizes="(min-width: 1536px) 112px, 96px" className="object-contain" />
      </span>
    );
  }
  return (
    <span className={cn("relative block size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28", accent, className)}>
      <svg viewBox="0 0 80 80" aria-hidden className="absolute inset-0 size-full">
        <circle cx="40" cy="27" r="15" fill="currentColor" />
        <path d="M8 80c0-19 14.3-31 32-31s32 12 32 31z" fill="currentColor" />
      </svg>
    </span>
  );
}

/**
 * A thought bubble rising from the reviewer's shoulder: a white cloud with
 * three coloured dots that type in turn, its two trailing circles popping up
 * toward it, the whole bubble floating (globals.css, "Review thoughts").
 * `--d` offsets each card; reduced motion keeps it still and complete.
 */
function ThoughtBubble({ index, className }: { index: number; className?: string }) {
  const dots = ["var(--color-signal-orange)", "var(--color-cobalt)", "var(--color-bdnavy-400)"];
  return (
    <svg viewBox="0 0 64 56" aria-hidden style={{ "--d": `${index * 0.45}s` } as CSSProperties} className={cn("think overflow-visible", className)}>
      <g className="think-cloud">
        <circle cx="25" cy="19" r="12" fill="white" />
        <circle cx="39" cy="16" r="13" fill="white" />
        <circle cx="51" cy="25" r="9.5" fill="white" />
        <circle cx="16" cy="27" r="9.5" fill="white" />
        <circle cx="33" cy="30" r="12" fill="white" />
        <circle cx="46" cy="32" r="8" fill="white" />
        {dots.map((fill, i) => (
          <circle key={fill} className="think-dot" cx={22 + i * 11} cy="25" r="3.6" fill={fill} style={{ "--i": i } as CSSProperties} />
        ))}
      </g>
      <circle className="think-trail" cx="12" cy="44" r="4.2" fill="white" style={{ "--i": 1 } as CSSProperties} />
      <circle className="think-trail" cx="5" cy="52" r="2.6" fill="white" style={{ "--i": 0 } as CSSProperties} />
    </svg>
  );
}

function ReviewCard({ review, index, open, onOpen, onToggle }: { review: Review; index: number; open: boolean; onOpen: () => void; onToggle: () => void }) {
  const look = LOOKS[review.field];
  const quoteId = useId();
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Which control should take focus after the next open or close, so a keyboard user never lands on a hidden button.
  const handoff = useRef<"close" | "opener" | null>(null);

  useEffect(() => {
    if (open && handoff.current === "close") closeRef.current?.focus();
    if (!open && handoff.current === "opener") openerRef.current?.focus();
    handoff.current = null;
  }, [open]);

  return (
    <li
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onOpen();
      }}
      className={cn(
        // Below xl: a carousel card at 82% of the row (the next one peeks); the scroller clips, so no shadow there.
        "relative flex w-[82%] min-w-0 shrink-0 snap-start flex-col overflow-hidden rounded-3xl p-5 sm:w-[60%] sm:p-6 md:w-[44%] lg:w-[38%] xl:w-auto xl:shrink xl:basis-0",
        "transition-[flex-grow,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open ? "xl:grow-[2.6] xl:shadow-[0_30px_60px_-36px_rgb(0_0_0/0.9)]" : "xl:grow xl:shadow-[0_30px_60px_-36px_rgb(0_0_0/0.9)]",
        look.card,
      )}
    >
      {/* From xl, the closed card: the portrait large in the middle with its thought, the name and role under it. */}
      <div
        inert={open}
        className={cn(
          "absolute inset-0 hidden flex-col items-center justify-center p-6 text-center transition-opacity ease-out motion-reduce:transition-none xl:flex",
          open ? "pointer-events-none opacity-0 duration-150" : "opacity-100 delay-300 duration-500",
        )}
      >
        <button
          ref={openerRef}
          type="button"
          onClick={() => {
            handoff.current = "close";
            onOpen();
          }}
          aria-expanded={false}
          aria-controls={quoteId}
          aria-label={`Read ${review.name}’s review`}
          className="group/portrait relative w-[min(10rem,78%)] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-4 focus-visible:ring-offset-transparent focus-visible:outline-none motion-reduce:transition-none"
        >
          <Portrait review={review} accent={look.accent} className="aspect-square size-auto w-full sm:size-auto" />
          <ThoughtBubble index={index} className="absolute -top-6 -right-10 w-16 2xl:w-20" />
        </button>
        <p className="mt-5 font-grotesk text-base leading-tight font-bold text-balance 2xl:text-lg">{review.name}</p>
        <p className={cn("mt-1 text-sm leading-snug text-balance", look.muted)}>{review.role}</p>
      </div>

      {/* The open card (and, below xl, every carousel card): from xl hidden while closed. */}
      <div className={cn("flex flex-1 flex-col transition-opacity duration-300 motion-reduce:transition-none", !open && "xl:invisible xl:opacity-0")}>
        {/* From xl: the portrait small at the top, and the × that closes the card. */}
        <div className="hidden items-start justify-between gap-2 xl:flex">
          <Portrait review={review} accent={look.accent} className="xl:size-24 2xl:size-28" />
          {open ? (
            <button
              ref={closeRef}
              type="button"
              onClick={() => {
                handoff.current = "opener";
                onToggle();
              }}
              aria-expanded
              aria-controls={quoteId}
              aria-label={`Close ${review.name}’s review`}
              className={cn(
                "ch-pop grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none motion-reduce:transition-none [--i:-2]",
                look.button,
              )}
            >
              <Icon name="close" className="text-2xl" />
            </button>
          ) : null}
        </div>

        {/* The quote, at the open card's inner width (the row less its gaps and every card's padding, × the open card's share of the growth), at most 36rem. */}
        <div
          id={quoteId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none xl:my-auto",
            // Below xl every quote shows; the open/closed fold is the wide row's.
            open ? "grid-rows-[1fr] opacity-100 delay-150" : "grid-rows-[1fr] opacity-100 xl:grid-rows-[0fr] xl:opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <blockquote className="xl:w-[min(36rem,calc((100cqw-(var(--n)-1)*1rem-var(--n)*3rem)*2.6/(1.6+var(--n))))] xl:pt-4">
              <Icon name="format_quote" className={cn("text-2xl sm:text-3xl", look.accent)} />
              {/* A phone reads the quote as body text (16px, medium, open leading); from sm it is a display quote. */}
              <p className={cn("mt-1 font-grotesk text-base leading-relaxed font-medium text-pretty sm:text-xl sm:leading-snug sm:font-semibold", look.quote)}>{review.quote}</p>
            </blockquote>
          </div>
        </div>

        {/* The reviewer, the name in gold over the role. Below xl the card's foot, with a small portrait beside the name; from xl the open card signs off at the bottom right, under the quote. */}
        <div className="mt-auto flex items-center gap-3 pt-5 xl:items-end xl:pt-4">
          <Portrait review={review} accent={look.accent} className="size-11 rounded-xl sm:size-11 xl:hidden" />
          <div className="min-w-0 grow xl:text-right">
            <p className={cn("truncate font-grotesk text-base font-bold xl:whitespace-normal", look.name ?? "text-signal-orange")}>{review.name}</p>
            <p className={cn("truncate text-sm xl:whitespace-normal", look.muted)}>{review.role}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
