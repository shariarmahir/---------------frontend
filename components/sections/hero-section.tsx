"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { heroPhotos } from "@/data/hero-gallery";

/** The four headline proof points, shown in the bar under the hero. */
const HERO_STATS = [
  { label: "Citizens Monitored", value: "4.8M+" },
  { label: "Critical Triage", value: "< 120 MIN" },
  { label: "Bengali Data Engine", value: "10-CRORE" },
  { label: "Sovereign Architecture", value: "100%" },
];

const SLIDE_MS = 6000;

export function HeroSection() {
  const [index, setIndex] = useState(0);

  // Auto-shuffle. Resets whenever `index` changes, so a manual dot click
  // restarts the dwell rather than cutting it short.
  useEffect(() => {
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % heroPhotos.length),
      SLIDE_MS,
    );
    return () => clearTimeout(id);
  }, [index]);

  return (
    <section id="overview-mission" className="relative w-full">
      {/* Cinematic band. The source photos are ~1.5 wide, so a strict 16:6
          (2.67) would crop away nearly half their height; 16:8 on desktop
          keeps far more of each frame while still reading as a wide hero.
          Phones get a taller box so the headline has room. */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-950 sm:aspect-3/2 lg:aspect-16/8">
        {heroPhotos.map((photo, i) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={i === index ? photo.alt : ""}
            aria-hidden={i !== index}
            fill
            // All ten are stacked above the fold and any one of them can be
            // the visible slide, so each must load eagerly — but only the
            // first gets a preload link, to avoid ten competing preloads.
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

        {/* Scrim — dark enough on the left for white text to clear AA at
            every photo, fading out to the right so the image stays visible. */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/95 via-slate-950/70 to-slate-950/30" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-slate-950/20" />

        {/* Content. */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-4 px-gutter-x lg:gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-amber-300 uppercase backdrop-blur-sm sm:text-[11px]">
              <span
                aria-hidden
                className="flex h-3 w-[1.15rem] shrink-0 items-center justify-center rounded-xs bg-bd-green"
              >
                <span className="size-1.5 rounded-full bg-national-crimson" />
              </span>
              Bangladesh&apos;s first deep-tech ecosystem
            </span>

            <h1 className="max-w-3xl font-grotesk text-3xl leading-[1.08] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Pioneering Bangladesh&apos;s{" "}
              <span className="text-signal-orange">Real-Time Future</span>
            </h1>

            <p className="max-w-xl font-sans text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
              Native semiconductor innovation, IoT robotics and life-saving
              healthcare infrastructure — engineered across all 64 districts.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#swasti-section"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal-orange px-5 py-3 font-grotesk text-xs font-bold text-slate-950 uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-amber-400 sm:px-6 sm:text-sm"
              >
                <Icon name="download" className="text-lg" />
                Download SWASTI
              </a>
              <a
                href="#kandari-profile"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 font-grotesk text-xs font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:px-6 sm:text-sm"
              >
                Explore Kandari R&amp;D
              </a>
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
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-7 bg-signal-orange"
                  : "w-3.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats bar. */}
      <div className="w-full border-b border-slate-200 bg-white">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 lg:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 px-4 py-4 text-center max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-slate-200 lg:py-5"
            >
              <dt className="font-mono text-[10px] font-medium tracking-widest text-text-muted uppercase sm:text-[11px]">
                {stat.label}
              </dt>
              <dd className="font-grotesk text-lg font-bold text-bd-green sm:text-xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
