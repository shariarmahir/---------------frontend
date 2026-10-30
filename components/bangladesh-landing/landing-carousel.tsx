"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Fillet } from "@/components/research/kit";
import { Icon } from "@/components/ui/icon";
import type { Photo } from "@/data/bangladesh";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { LINK } from "./kit";

const SLIDE_MS = 7000;

const CONTROL =
  "grid size-11 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

/**
 * The hero's photographs, one at a time and edge to edge, with the black
 * card (`children`) cut into the bottom-right corner, as on the Genius
 * home. On a phone the card sits under the photo, notched into its foot.
 * Below: the photo's caption and credit, then the dots: the active one
 * fills with gold over the slide's time and the next photo follows when it
 * is full. Hovering or focusing the hero holds it, the pause button stops
 * it, and under reduced motion it never turns by itself.
 */
export function LandingCarousel({ slides, children }: { slides: Photo[]; children: ReactNode }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const auto = !reduce && !paused && slides.length > 1;
  const running = auto && !hold;
  const s = slides[i];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Photographs of Bangladesh"
      className="relative"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHold(false)}
    >
      <div className="relative">
        <div className="relative h-80 w-full overflow-hidden bg-bdnavy-900 sm:h-112 lg:h-[clamp(32rem,calc(100svh-13rem),46rem)]">
          {slides.map((p, n) => (
            <Image
              key={p.src}
              src={p.src}
              alt={p.alt}
              fill
              sizes="100vw"
              priority={n === 0}
              quality={90}
              aria-hidden={n !== i}
              className={cn(
                "object-cover transition-[opacity,scale] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                n === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
              )}
              style={{ objectPosition: p.focus ?? "50% 50%" }}
            />
          ))}
        </div>
        <div className="relative z-10 -mt-12 ml-6 rounded-tl-3xl bg-black pt-6 pr-gutter-x pl-5 sm:ml-auto sm:w-[min(40rem,calc(100%-3rem))] sm:pt-8 sm:pl-8 lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:w-auto lg:max-w-[min(48rem,56%)] lg:rounded-tl-4xl lg:pt-10 lg:pl-12">
          <Fillet corner="br" className="-top-6 right-0 size-6 lg:-top-8 lg:size-8" />
          <Fillet corner="br" className="top-6 -left-6 size-6 lg:top-auto lg:bottom-0 lg:-left-8 lg:size-8" />
          {children}
        </div>
      </div>
      <div className="flex flex-col gap-3 px-gutter-x pt-6 sm:flex-row sm:items-center sm:justify-between lg:pt-4">
        {/* Announced only when the reader moves the carousel, never on every automatic turn. */}
        <p aria-live={running ? "off" : "polite"} className="min-w-0 text-xs leading-relaxed text-white/65">
          <span className="block text-sm font-semibold text-white">{s.alt}</span>
          {s.credit && (
            <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <Icon name="photo_camera" className="text-sm! text-signal-orange" />
              <span>Photo: {s.credit.author}</span>
              <span aria-hidden>·</span>
              {s.credit.licenseUrl ? (
                <a href={s.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {s.credit.license}
                </a>
              ) : (
                <span>{s.credit.license}</span>
              )}
              <span aria-hidden>·</span>
              <a href={s.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                Wikimedia Commons
              </a>
            </span>
          )}
        </p>
        <div className="-ml-2.5 flex shrink-0 items-center sm:-mr-2.5 sm:ml-0">
          {!reduce && slides.length > 1 && (
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? "Play the slideshow" : "Pause the slideshow"}
              className={cn(CONTROL, "text-white/80 hover:text-signal-orange")}
            >
              <Icon name={paused ? "play_arrow" : "pause"} className="text-2xl!" />
            </button>
          )}
          <div role="group" aria-label="Choose a photograph" className="flex items-center">
            {slides.map((p, n) => {
              const on = n === i;
              return (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => setI(n)}
                  aria-label={`Photograph ${n + 1} of ${slides.length}: ${p.alt}`}
                  aria-current={on ? "true" : undefined}
                  className="group/dot grid h-11 place-items-center rounded-full px-1 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "relative block h-2.5 overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      on ? "w-10 bg-white/20" : "w-2.5 bg-white/35 group-hover/dot:bg-white/70",
                    )}
                  >
                    {on && (
                      <span
                        key={i}
                        onAnimationEnd={() => auto && setI((n) => (n + 1) % slides.length)}
                        className={cn("absolute inset-0 rounded-full bg-signal-orange", auto && "slide-dot-fill")}
                        style={{ ["--slide-ms" as string]: `${SLIDE_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
