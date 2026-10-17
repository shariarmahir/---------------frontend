"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { reviews, type Review, type ReviewField } from "@/data/reviews";
import { cn } from "@/lib/utils";

/*
 * Partner reviews as a full-width row of solid cards, one always open. On
 * a wide screen the open card widens and its quote fades in; pointing at
 * another card opens that one instead. Below lg the cards stack and open
 * in place. The quote is set at the open card's final width (capped for
 * line length), so it never reflows while the card grows. The + in each
 * corner turns to × when open; it is the keyboard and touch control
 * (focus opens, Enter or a tap toggles).
 */

const LOOKS: Record<ReviewField, { card: string; muted: string; button: string; accent: string; glow: string }> = {
  navy: {
    card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/65",
    button: "bg-signal-orange text-text-primary",
    accent: "text-signal-orange",
    glow: "var(--color-bdnavy-400)",
  },
  gold: {
    card: "bg-signal-orange text-text-primary",
    muted: "text-text-primary/70",
    button: "bg-bdnavy-900 text-white",
    accent: "text-bdnavy-900",
    glow: "var(--color-signal-orange)",
  },
  ink: {
    card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/65",
    button: "bg-signal-orange text-text-primary",
    accent: "text-signal-orange",
    glow: "var(--color-signal-orange)",
  },
};

export function ReviewsSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section-band">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="reviews-title">What Our Partners Say</span>}
          lead="Clinics, pharmacies, universities and programmes we build alongside, in their own words."
        />
      </div>

      {/* The row runs the full width of the window. --n: the card count, for the quote's width. */}
      <ul style={{ "--n": reviews.length } as CSSProperties} className="story-reveal @container flex flex-col gap-3 px-gutter-x lg:h-104 lg:flex-row lg:gap-4 lg:px-6">
        {reviews.map((review, i) => (
          <ReviewCard
            key={review.id}
            review={review}
            open={open === i}
            onOpen={() => setOpen(i)}
            onToggle={() => setOpen((o) => (o === i ? -1 : i))}
          />
        ))}
      </ul>
    </section>
  );
}

/** The reviewer's photograph, or a bare silhouette in the card's accent until there is one. */
function Portrait({ review, accent }: { review: Review; accent: string }) {
  return (
    <span className={cn("relative block size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28", accent)}>
      {review.photo ? (
        <Image src={review.photo} alt={review.name} fill sizes="112px" className="object-cover object-top" />
      ) : (
        <svg viewBox="0 0 80 80" aria-hidden className="absolute inset-0 size-full">
          <circle cx="40" cy="27" r="15" fill="currentColor" />
          <path d="M8 80c0-19 14.3-31 32-31s32 12 32 31z" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

function ReviewCard({ review, open, onOpen, onToggle }: { review: Review; open: boolean; onOpen: () => void; onToggle: () => void }) {
  const look = LOOKS[review.field];
  const quoteId = useId();

  return (
    <li
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onOpen();
      }}
      style={{ "--glow": look.glow } as CSSProperties}
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-3xl p-5 sm:p-6 lg:basis-0",
        "transition-[flex-grow,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open ? "shadow-[0_28px_48px_-22px_var(--glow)] lg:grow-[2.6]" : "shadow-[0_30px_60px_-36px_rgb(0_0_0/0.9)] lg:grow",
        look.card,
      )}
    >
      <Portrait review={review} accent={look.accent} />

      {/* The quote, at the open card's inner width (the row less its gaps and every card's padding, × the open card's share of the growth), at most 36rem. */}
      <div
        id={quoteId}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:my-auto",
          open ? "grid-rows-[1fr] opacity-100 delay-150" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <blockquote className="pt-5 lg:w-[min(36rem,calc((100cqw-(var(--n)-1)*1rem-var(--n)*3rem)*2.6/(1.6+var(--n))))] lg:pt-0">
            <Icon name="format_quote" className={cn("text-[32px]", look.accent)} />
            <p className="mt-1 font-grotesk text-lg leading-snug font-semibold text-pretty sm:text-xl">{review.quote}</p>
          </blockquote>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 lg:mt-auto">
        <div className="min-w-0">
          <p className="truncate font-grotesk text-base font-bold">{review.name}</p>
          <p className={cn("truncate text-sm", look.muted)}>{review.role}</p>
        </div>
        <button
          type="button"
          onFocus={onOpen}
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={quoteId}
          aria-label={`${open ? "Hide" : "Read"} ${review.name}’s review`}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none motion-reduce:transition-none",
            look.button,
          )}
        >
          <Icon
            name="add"
            className={cn("text-[22px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", open && "rotate-45")}
          />
        </button>
      </div>
    </li>
  );
}
