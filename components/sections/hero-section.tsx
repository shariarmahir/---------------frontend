"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { heroPhotos } from "@/data/hero-gallery";
import { btn } from "@/components/ui/section-kit";
import { sampleHeroTone } from "@/components/sections/hero-tone";
import type { TextTone } from "@/lib/backdrop-tone";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6000;

/**
 * Headline and subtitle classes per colour. Each is one of the UI's five:
 * gold, white, black, bottle green, deep navy. The halo is the opposite
 * lightness so the words still read over a busy patch; over gold the
 * subtitle drops to white, which reads wherever gold does.
 */
const TONE_CLASSES: Record<TextTone, { title: string; sub: string }> = {
  gold: {
    title: "text-signal-orange [text-shadow:0_2px_14px_rgb(0_0_0/0.55)]",
    sub: "text-white/95 [text-shadow:0_1px_10px_rgb(0_0_0/0.55)]",
  },
  white: {
    title: "text-white [text-shadow:0_2px_14px_rgb(0_0_0/0.55)]",
    sub: "text-white/95 [text-shadow:0_1px_10px_rgb(0_0_0/0.55)]",
  },
  black: {
    title: "text-black [text-shadow:0_1px_12px_rgb(255_255_255/0.5)]",
    sub: "text-black/90 [text-shadow:0_1px_10px_rgb(255_255_255/0.5)]",
  },
  green: {
    title: "text-bd-green [text-shadow:0_1px_12px_rgb(255_255_255/0.5)]",
    sub: "text-bd-green [text-shadow:0_1px_10px_rgb(255_255_255/0.5)]",
  },
  navy: {
    title: "text-bdnavy-900 [text-shadow:0_1px_12px_rgb(255_255_255/0.5)]",
    sub: "text-bdnavy-900/90 [text-shadow:0_1px_10px_rgb(255_255_255/0.5)]",
  },
};

/** The glass button, re-toned for dark text on a bright photograph. */
const GHOST_ON_BRIGHT = btn.ghost
  .replace("bg-white/10", "bg-text-primary/10")
  .replace("text-white", "text-text-primary")
  .replace("ring-white/25", "ring-text-primary/30")
  .replace("hover:bg-white/15", "hover:bg-text-primary/15");

/**
 * Hero.
 *
 * The photographs are the field; the claim sits over them on the left,
 * with the right half left open so the image is never fully covered. That
 * is the reference's two-column balance, but the right column here is the
 * photograph itself rather than a drawn mark.
 *
 * Height: the shared `hero-band` floor, so this band matches the /products
 * hero exactly (a requested change — it replaces the CLAUDE.md §4.3 16:6 ratio,
 * which ran ~710px tall on a 1900px screen). The claim sits in normal flow
 * and is centred, so a longer line on a phone grows the band rather than
 * clipping.
 */
export function HeroSection() {
  const [index, setIndex] = useState(0);
  // The text colour that reads on the photograph behind it, one of gold,
  // white, black, green or navy: gold on a dark photo, white on a mid green,
  // navy or green on a bright one (mustard field, pale sky). Judged per
  // slide and per band size — see backdrop-tone.ts and hero-tone.ts.
  const [tone, setTone] = useState<TextTone>("gold");
  const bandRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Auto-shuffle. Resets whenever `index` changes, so the dwell restarts
  // after a manual dot click rather than being cut short.
  useEffect(() => {
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % heroPhotos.length),
      SLIDE_MS,
    );
    return () => clearTimeout(id);
  }, [index]);

  // Re-judge the backdrop whenever the slide or the band's size changes.
  useEffect(() => {
    const band = bandRef.current;
    const img = imgRefs.current[index];
    if (!band || !img) return;
    const focus = heroPhotos[index]?.focus;

    const judge = () => {
      const bb = band.getBoundingClientRect();
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      const grow = (r: DOMRect) => {
        if (r.width === 0 && r.height === 0) return;
        x0 = Math.min(x0, r.left);
        y0 = Math.min(y0, r.top);
        x1 = Math.max(x1, r.right);
        y1 = Math.max(y1, r.bottom);
      };
      // The text's own extent (not its full-width block), then the buttons.
      for (const el of [titleRef.current, subRef.current]) {
        if (!el) continue;
        const range = document.createRange();
        range.selectNodeContents(el);
        grow(range.getBoundingClientRect());
      }
      for (const el of Array.from(actionsRef.current?.children ?? [])) grow(el.getBoundingClientRect());
      if (!Number.isFinite(x0)) return;
      const next = sampleHeroTone({
        img,
        band: { w: bb.width, h: bb.height },
        focus,
        box: { x: x0 - bb.left, y: y0 - bb.top, w: x1 - x0, h: y1 - y0 },
      });
      if (next) setTone(next);
    };

    let raf = 0;
    let debounce = 0;
    if (img.complete && img.naturalWidth) raf = requestAnimationFrame(judge);
    else img.addEventListener("load", judge, { once: true });
    const ro = new ResizeObserver(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(judge, 150);
    });
    ro.observe(band);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(debounce);
      img.removeEventListener("load", judge);
      ro.disconnect();
    };
  }, [index]);

  const classes = TONE_CLASSES[tone];
  const onBright = tone === "black" || tone === "green" || tone === "navy";

  return (
    <section
      id="overview-mission"
      className="relative w-full"
    >
      {/* The band — same height as the /products hero. The claim sits at the
          bottom, centred, so the photograph keeps the upper two thirds. */}
      <div ref={bandRef} className="hero-band relative flex w-full items-end overflow-hidden bg-text-primary">
        {heroPhotos.map((photo, i) => (
          <Image
            key={photo.src}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={photo.src}
            alt={i === index ? photo.alt : ""}
            aria-hidden={i !== index}
            fill
            // All ten stack above the fold and any one can be the visible
            // slide, so each loads eagerly — but only the first gets a
            // preload link, to avoid ten competing preloads.
            priority={i === 0}
            loading="eager"
            sizes="100vw"
            quality={90}
            // Per-photo focal point: `cover` still trims to fill the band,
            // but this steers the crop away from faces and subjects.
            style={{ objectPosition: photo.focus ?? "50% 50%" }}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Subtle scrim: keep text readable but let images show clearly */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-text-primary/40 via-text-primary/20 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-text-primary/30 via-transparent to-transparent"
        />

        {/* ── Claim ─────────────────────────────────────────────── */}
        <div className="relative w-full pt-16 pb-14 sm:pb-16">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-space-sm px-gutter-x text-center lg:gap-space-md">
            {/* The claim, set larger than a section title (up to 48px). It wraps
                over two or three balanced lines on a laptop and one or two on a
                wide screen. The colour follows the photograph behind it, easing
                over the same second as the photo crossfade. */}
            <h1
              ref={titleRef}
              className={cn(
                "w-full max-w-[1320px] font-grotesk text-[1.625rem] leading-[1.18] font-bold tracking-tight text-balance transition-[color,text-shadow] duration-1000 ease-in-out sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl",
                classes.title,
              )}
            >
              Every problem is the door of opportunity. Therefore, it is high time we knocked on the door until it opens cause it is now or never.
            </h1>

            <p
              ref={subRef}
              className={cn(
                "max-w-[44ch] font-sans text-body-md leading-relaxed text-balance transition-[color,text-shadow] duration-1000 ease-in-out sm:max-w-[60ch] lg:max-w-none lg:text-body-lg lg:whitespace-nowrap",
                classes.sub,
              )}
            >
              Kandari Lab uses technology and commercial innovation to build a smart, safe, and secure Bangladesh.
            </p>

            {/* Actions: gold for the primary route, a quiet glass pill for
                the second, side by side and centred. */}
            <div ref={actionsRef} className="flex flex-wrap items-center justify-center gap-3 pt-space-xs">
              <Link href="#flagship" className={btn.gold}>
                <Icon name="monitor_heart" className="text-[18px]" />
                Explore the hardware
              </Link>

              <Link href="#kandari-profile" className={cn(onBright ? GHOST_ON_BRIGHT : btn.ghost, "transition-colors duration-1000")}>
                <Icon name="person_add" className="text-[18px] text-bdgreen-500" />
                Join Kandari Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Slide indicators, bottom-right. */}
        <div className="absolute right-4 bottom-4 flex items-center gap-1.5 sm:right-6 sm:bottom-5 lg:right-8">
          {heroPhotos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`স্লাইড ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                i === index ? "w-10 bg-white/25" : "w-3.5 bg-white/40 hover:bg-white/70"
              }`}
            >
              {/* The active slide's timer, filling over its dwell. Keyed
                  on the index so it restarts with every slide. */}
              {i === index ? (
                <span
                  key={index}
                  aria-hidden
                  style={{ "--dwell": `${SLIDE_MS}ms` } as React.CSSProperties}
                  className="hero-progress absolute inset-0 rounded-full bg-signal-orange"
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
