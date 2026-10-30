import type { CSSProperties } from "react";
import Link from "next/link";
import { btn } from "@/components/ui/section-kit";
import { HERO } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { LandingCarousel } from "./landing-carousel";

/** 1 · Hero: the credited photographs, with the title, the thesis and the two ways in cut into their corner. */
export function LandingHero() {
  return (
    <LandingCarousel slides={HERO.slides}>
      <h1 className="hero-rise font-grotesk text-5xl leading-none font-bold tracking-tight text-signal-orange sm:text-7xl lg:text-8xl">
        {HERO.title}
      </h1>
      <p
        className="hero-rise mt-4 max-w-xl text-lg leading-relaxed text-pretty text-white/80 sm:mt-5 sm:text-xl"
        style={{ "--d": "120ms" } as CSSProperties}
      >
        {HERO.thesis}
      </p>
      <div className="hero-rise mt-7 flex flex-wrap gap-3 pb-1 sm:mt-8" style={{ "--d": "240ms" } as CSSProperties}>
        <Link href={HERO.primary.href} className={btn.gold}>
          {HERO.primary.label}
        </Link>
        <Link href={HERO.secondary.href} className={cn(btn.goldOutline, "bg-bdnavy-900")}>
          {HERO.secondary.label}
        </Link>
      </div>
    </LandingCarousel>
  );
}
