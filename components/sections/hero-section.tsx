"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { heroPhotos } from "@/data/hero-gallery";
import { btn } from "@/components/ui/section-kit";
import { sampleHeroTone } from "@/components/sections/hero-tone";
import { DEFAULT_LOOK, type HeroLook, type TextTone } from "@/lib/backdrop-tone";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6000;

/**
 * Headline and subtitle classes per colour, each one of the UI's five. Light
 * text gets a tight, quiet shadow (the scrim behind it does the real work);
 * dark text is only chosen on an evenly bright photo and needs none. Under a
 * gold title the subtitle is white, which reads wherever gold does.
 */
const LIFT_SHADOW = "[text-shadow:0_1px_2px_rgb(0_0_0/0.35),0_6px_24px_rgb(0_0_0/0.25)]";
const TONE_CLASSES: Record<TextTone, { title: string; sub: string }> = {
  gold: { title: cn("text-signal-orange", LIFT_SHADOW), sub: cn("text-white", LIFT_SHADOW) },
  white: { title: cn("text-white", LIFT_SHADOW), sub: cn("text-white/90", LIFT_SHADOW) },
  black: { title: "text-black", sub: "text-black/85" },
  green: { title: "text-bd-green", sub: "text-bd-green" },
  navy: { title: "text-bdnavy-900", sub: "text-bdnavy-900/90" },
};

/** Skip a re-render when the scrim moves by less than this. */
const SCRIM_STEP = 0.03;

/** The glass button, re-toned for dark text on a bright photograph. */
const GHOST_ON_BRIGHT = btn.ghost
  .replace("bg-white/10", "bg-text-primary/10")
  .replace("text-white", "text-text-primary")
  .replace("ring-white/25", "ring-text-primary/30")
  .replace("hover:bg-white/15", "hover:bg-text-primary/15");

/**
 * Hero.
 *
 * The photographs are the field; the claim sits over them low and centred,
 * on a soft scrim measured per photograph (see `look` below), so the upper
 * part of every image stays clear.
 *
 * Height: the shared `hero-band` floor, so this band matches the /products
 * hero exactly (a requested change — it replaces the CLAUDE.md §4.3 16:6 ratio,
 * which ran ~710px tall on a 1900px screen). The claim sits in normal flow
 * and is centred, so a longer line on a phone grows the band rather than
 * clipping.
 */
export function HeroSection() {
  const [index, setIndex] = useState(0);
  // How the claim is coloured over the photograph behind it: one of gold,
  // white, black, green or navy, plus how strong a soft ink scrim sits
  // behind the text. Judged per slide and per band size from the darkest and
  // brightest pixels under the text, so a dark figure in a bright field still
  // gets readable words — see backdrop-tone.ts and hero-tone.ts.
  const [look, setLook] = useState<HeroLook>(DEFAULT_LOOK);
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
      if (!next) return;
      setLook((prev) =>
        prev.tone === next.tone && Math.abs(prev.scrim - next.scrim) < SCRIM_STEP ? prev : next,
      );
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

  const classes = TONE_CLASSES[look.tone];
  const onBright = look.tone === "black" || look.tone === "green" || look.tone === "navy";

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
        <div className="relative w-full pt-20 pb-16 sm:pb-20">
          <div className="mx-auto flex w-full max-w-[1600px] justify-center px-gutter-x">
            <div className="relative isolate flex max-w-full flex-col items-center text-center">
              {/* The adaptive scrim: a soft ink ellipse behind the words, as
                  strong as this photograph needs and no stronger (none at all
                  under dark text). Full strength across the text block, fading
                  out well past its edges so it never reads as a box. */}
              <div
                aria-hidden
                style={{ opacity: look.scrim }}
                className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[200%] w-[165%] -translate-1/2 bg-[radial-gradient(closest-side,rgb(3_32_23)_0%,rgb(3_32_23)_62%,rgb(3_32_23/0.55)_80%,rgb(3_32_23/0)_100%)] transition-opacity duration-1000 ease-in-out motion-reduce:transition-none"
              />

              {/* The claim in two sentences: the first on its own line, the
                  second balanced over two below it, so the block reads as a
                  deliberate three-line stack on a laptop or wider. */}
              <h1
                ref={titleRef}
                className={cn(
                  "max-w-[24em] font-grotesk text-[clamp(1.75rem,0.9rem+2.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance transition-[color,text-shadow] duration-1000 ease-in-out",
                  classes.title,
                )}
              >
                <span className="block">Every problem is the door of opportunity.</span>{" "}
                <span className="block">
                  Therefore, it is high time we knocked on the door until it opens cause it is now or never.
                </span>
              </h1>

              <p
                ref={subRef}
                className={cn(
                  "mt-5 max-w-[42ch] font-sans text-[clamp(1rem,0.92rem+0.3vw,1.1875rem)] leading-relaxed font-medium tracking-[-0.005em] text-balance transition-[color,text-shadow] duration-1000 ease-in-out sm:max-w-[60ch] lg:max-w-none lg:whitespace-nowrap",
                  classes.sub,
                )}
              >
                Kandari Lab uses technology and commercial innovation to build a smart, safe, and secure Bangladesh.
              </p>

              {/* Actions: gold for the primary route, a quiet glass pill for
                  the second, side by side and centred. */}
              <div ref={actionsRef} className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
        </div>

        {/* Slide indicators, bottom-right, on their own dark pill so they
            stay visible over a bright photograph. */}
        <div className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-2 ring-1 ring-white/10 backdrop-blur-sm sm:right-6 sm:bottom-5 lg:right-8">
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
