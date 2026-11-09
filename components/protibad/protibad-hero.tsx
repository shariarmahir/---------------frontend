"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { HeroLogo } from "@/components/sections/hero-logo";
import { SignalSeam } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { sourceName, useReducedMotion } from "./kit";
import { useWire } from "./wire";

const CLAIM = "Speak up against injustice, safely.";
const HOLD_MS = 4200;

/**
 * The প্রতিবাদ hero (Mahir, 2026-10-29: "the same as the main landing
 * page hero"): the home hero's frame and lockup on a photograph of the 2024
 * student protests (Wikimedia Commons, credited on /bangladesh with the
 * promo row that shares it). The animated Kandari mark and the claim stand
 * flush left on the photo, the claim navy on a thin gold outline, rising
 * word by word (globals.css: .hero-lockup, .hero-claim, .hero-word). No
 * buttons and no red: the page's actions live in its tabs and sections.
 *
 * Under it, as the home page has its spotlight band, the day's live figures
 * from the TV wall's wire take turns on one centred line.
 */
export function ProtibadHero() {
  const words = CLAIM.split(" ");
  return (
    <section id="top" aria-labelledby="protibad-claim" className="relative w-full">
      <div data-placed="" className="hero-band hero-home @container relative w-full overflow-hidden bg-black">
        <Image
          src="/promos/ad-protibad.webp"
          alt="Students protesting on a Dhaka street in 2024, Bangladesh flags raised"
          fill
          priority
          sizes="100vw"
          className="hero-film object-cover object-[50%_30%]"
        />
        <div className="absolute inset-x-0 bottom-[11%] mx-auto w-full max-w-384 px-gutter-x max-sm:bottom-[9%]">
          <div className="hero-lockup @container flex flex-col items-start gap-[1.2cqw] select-none">
            <HeroLogo />
            <h1 id="protibad-claim" className="hero-claim pb-claim hero-outline relative font-grotesk leading-[1.15] font-extrabold tracking-[-0.02em] text-bdnavy-900">
              <span className="sr-only">{CLAIM}</span>
              {words.map((word, i) => (
                <span key={i} aria-hidden>
                  <span className="hero-word">
                    <span style={{ "--i": i } as CSSProperties}>{word}</span>
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
          </div>
        </div>
      </div>
      <LiveSpotlight />
    </section>
  );
}

interface Slide {
  headline: string;
  lead: string;
  tail: string;
}

/**
 * The day in four live figures, one at a time, in the home spotlight
 * band's type: a gold line, then the figure in the navy tint, a small
 * radar pill, and the unit in white. Slides travel up every 4.2 s; the
 * band holds while pointed at or focused, and under reduced motion.
 */
function LiveSpotlight() {
  const wire = useWire();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  const n = wire.harm.length;
  const severe = wire.harm.filter((x) => x.severity === 3).length;
  const districts = new Set(wire.harm.map((x) => x.district).filter(Boolean)).size;
  const outlets = new Set(wire.harm.flatMap((x) => [x.source, ...x.alsoIn]).map(sourceName)).size;
  const fig = (v: number) => (wire.status === "live" ? v.toLocaleString("en-US") : "…");

  const slides: Slide[] = [
    { headline: "Crime and corruption in today's news", lead: fig(n), tail: "reports in 24 hours" },
    { headline: "Where a life or a body was harmed", lead: fig(severe), tail: "violent incidents" },
    { headline: "How far it reaches", lead: fig(districts), tail: "of 64 districts" },
    { headline: "Who is reporting it", lead: fig(outlets), tail: "news outlets" },
  ];

  useEffect(() => {
    if (reduce || held) return;
    const id = window.setInterval(() => setI((k) => (k + 1) % 4), HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduce, held]);

  const BIG = "font-display leading-[1.08] font-semibold tracking-tighter";
  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <SignalSeam className="bottom-0" />
      <div aria-live="off" className="relative mx-auto h-30 w-full max-w-384 px-gutter-x sm:h-34 md:h-38 lg:h-42">
        {slides.map((s, k) => (
          <div
            key={s.headline}
            inert={k !== i}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              k === i ? "translate-y-0 opacity-100" : k === (i + 3) % 4 ? "-translate-y-full opacity-0" : "translate-y-full opacity-0",
            )}
          >
            <span className={cn("text-2xl text-balance text-signal-orange sm:text-3xl md:text-4xl lg:text-5xl", BIG)}>{s.headline}</span>
            <span className="flex items-center justify-center gap-2.5 md:gap-4">
              <span className={cn("text-xl whitespace-nowrap text-bdnavy-300 tabular-nums sm:text-2xl md:text-4xl lg:text-5xl", BIG)}>{s.lead}</span>
              <span aria-hidden className="relative h-8 w-24 shrink-0 overflow-hidden rounded-full bg-bdnavy-900 ring-1 ring-white/15 sm:h-10 sm:w-32 md:h-12 md:w-40">
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="spot-ring absolute size-1/2 rounded-full border-2 border-signal-orange" />
                  <span className="spot-ring absolute size-1/2 rounded-full border-2 border-signal-orange [animation-delay:1.1s]" />
                  <span className="relative size-2 rounded-full bg-signal-orange lg:size-3" />
                </span>
              </span>
              <span className={cn("text-xl whitespace-nowrap text-white sm:text-2xl md:text-4xl lg:text-5xl", BIG)}>{s.tail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
