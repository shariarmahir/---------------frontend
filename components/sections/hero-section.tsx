"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { heroPhotos, type HeroPhoto } from "@/data/hero-gallery";
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
  white: { title: cn("text-white", LIFT_SHADOW), sub: cn("text-white/80", LIFT_SHADOW) },
  black: { title: "text-black", sub: "text-black/85" },
  // No green in the UI any more (bottle green was retired): a "green" verdict reads in navy.
  green: { title: "text-bdnavy-900", sub: "text-bdnavy-900" },
  navy: { title: "text-bdnavy-900", sub: "text-bdnavy-900" },
};

/** Skip a re-render when the scrim moves by less than this. */
const SCRIM_STEP = 0.03;

/** Where the wide (desktop) crop and file take over from the phone's. */
const WIDE = "(min-width: 1024px)";

/**
 * One photograph of the hero. Phones crop it on its own focal point
 * (`mobileFocus`); when sharper art-directed files exist (`wide`, `tall`)
 * the browser picks the right one through <picture>, otherwise it is the
 * single `src`. The photograph showing pushes in slowly over its dwell; one
 * leaving fades out and settles back.
 */
function HeroImage({
  photo,
  imgRef,
  showing,
  first,
}: {
  photo: HeroPhoto;
  imgRef: (el: HTMLImageElement | null) => void;
  showing: boolean;
  first: boolean;
}) {
  const focus = photo.focus ?? "50% 50%";
  const style = { "--f": focus, "--fm": photo.mobileFocus ?? focus } as CSSProperties;
  const className = cn(
    "absolute inset-0 size-full object-cover [object-position:var(--fm)] lg:[object-position:var(--f)]",
    "[transition:opacity_1.2s_ease-in-out,scale_7s_linear] motion-reduce:scale-100 motion-reduce:transition-none",
    showing ? "scale-[1.06] opacity-100" : "scale-100 opacity-0",
  );
  const common = {
    alt: showing ? photo.alt : "",
    "aria-hidden": !showing,
    fill: true,
    sizes: "100vw",
    quality: 90,
    // All ten stack above the fold and any one can be the visible slide, so
    // each loads eagerly — but only the first gets a preload, to avoid ten
    // competing preloads.
    priority: first,
    loading: "eager" as const,
  };

  if (!photo.wide && !photo.tall) {
    return <Image ref={imgRef} src={photo.src} {...common} alt={common.alt} style={style} className={className} />;
  }

  const { props: wide } = getImageProps({ ...common, src: photo.wide ?? photo.src });
  const { props: tall } = getImageProps({ ...common, src: photo.tall ?? photo.src });
  return (
    <picture>
      <source media={WIDE} srcSet={wide.srcSet} sizes={wide.sizes} />
      {/* Art direction needs <picture>; the props come from getImageProps. */}
      <img {...tall} ref={imgRef} alt={common.alt} style={{ ...tall.style, ...style }} className={className} />
    </picture>
  );
}

/**
 * Hero.
 *
 * The photographs are the field, cross-fading on their own with a slow
 * push-in on the one showing (no indicators); the claim sits over them low
 * and centred, on a soft scrim measured per photograph (see `look` below),
 * so the upper part of every image stays clear. The claim, its line and
 * the two actions (download the apps, join) rise in on load.
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
    const photo = heroPhotos[index];

    const judge = () => {
      // The crop in use: phones frame the photograph on their own point.
      const focus = window.matchMedia(WIDE).matches ? photo?.focus : (photo?.mobileFocus ?? photo?.focus);
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

  return (
    <section
      id="overview-mission"
      className="relative w-full"
    >
      {/* The band — same height as the /products hero. The claim sits at the
          bottom, centred, so the photograph keeps the upper two thirds. */}
      {/* On a phone the band fills the screen under the header, so the photograph shows clear above the claim. */}
      <div
        ref={bandRef}
        className="hero-band relative flex w-full items-end overflow-hidden bg-text-primary max-sm:min-h-[max(32rem,calc(100svh_-_var(--header-offset)_-_1.5rem))]"
      >
        {heroPhotos.map((photo, i) => (
          <HeroImage
            key={photo.src}
            photo={photo}
            imgRef={(el) => {
              imgRefs.current[i] = el;
            }}
            showing={i === index}
            first={i === 0}
          />
        ))}

        {/* A low veil so the claim's foot always sits on some depth; the upper photograph stays clear. */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-text-primary/55 via-text-primary/10 via-45% to-transparent" />

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
                  "hero-rise max-w-[24em] font-grotesk text-3xl leading-[1.08] sm:text-4xl xl:text-5xl font-bold tracking-[-0.025em] text-balance transition-[color,text-shadow] duration-1000 ease-in-out",
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
                style={{ "--d": "120ms" } as CSSProperties}
                className={cn(
                  "hero-rise mt-5 max-w-[42ch] font-sans text-base leading-relaxed lg:text-lg font-medium tracking-[-0.005em] text-balance transition-[color,text-shadow] duration-1000 ease-in-out sm:max-w-[60ch] lg:max-w-none lg:whitespace-nowrap",
                  classes.sub,
                )}
              >
                Kandari Lab uses technology and commercial innovation to build a smart, safe, and secure Bangladesh.
              </p>

              {/* Actions: solid gold for the apps, the gold outline on a navy fill for joining; both read on any photograph. */}
              <div
                ref={actionsRef}
                style={{ "--d": "240ms" } as CSSProperties}
                className="hero-rise mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                <Link href="#apps" className={btn.gold}>
                  <Icon name="download" className="text-lg" />
                  Download the App
                </Link>
                <Link href="#kandari-profile" className={cn(btn.goldOutline, "bg-bdnavy-900")}>
                  <Icon name="group_add" className="text-lg" />
                  Join with Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
