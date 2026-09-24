"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { heroPhotos } from "@/data/hero-gallery";

/**
 * Meta row above the headline — the three facts that qualify the claim
 * before it is made. Kept to three: a fourth turns a line of context into
 * a stat bar, which is a different (and noisier) component.
 */
const META = [
  "৬৪ districts",
  "Semiconductor · IoT · AI",
  "SWASTI & আপনজন shipping",
];

/** The four proof points, in the rule below the hero band. */
const HERO_STATS = [
  { label: "Citizens Monitored", value: "4.8M+" },
  { label: "Critical Triage", value: "< 120 MIN" },
  { label: "Bengali Data Engine", value: "10-CRORE" },
  { label: "Sovereign Architecture", value: "100%" },
];

const SLIDE_MS = 6000;

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

  // Auto-shuffle. Resets whenever `index` changes, so the dwell restarts
  // after a manual dot click rather than being cut short.
  useEffect(() => {
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % heroPhotos.length),
      SLIDE_MS,
    );
    return () => clearTimeout(id);
  }, [index]);

  return (
    <section
      id="overview-mission"
      className="relative w-full border-b border-slate-200/80"
    >
      {/* The band — same height as the /products hero. */}
      <div className="hero-band relative flex w-full items-center overflow-hidden bg-slate-950">
        {heroPhotos.map((photo, i) => (
          <Image
            key={photo.src}
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

        {/* Scrim. Dark enough on the left for white text to clear AA over
            any of the ten frames, fading out to the right so the image
            stays visible — that open right half is what keeps the
            two-column balance without a drawn mark in it. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-slate-950/95 via-slate-950/70 to-slate-950/25"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-slate-950/25"
        />

        {/* ── Claim ─────────────────────────────────────────────── */}
        <div className="relative w-full py-16">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-space-md px-gutter-x lg:gap-space-lg">
            {/* Meta row. Dot separators are decorative, so they are hidden
                from the accessibility tree and the items read as a list. */}
            <ul className="flex flex-wrap items-center gap-x-space-sm gap-y-1 font-sans text-label-xs text-slate-300">
              {META.map((item, i) => (
                <li key={item} className="flex items-center gap-x-space-sm">
                  {i > 0 ? (
                    <span aria-hidden className="text-slate-500">
                      ·
                    </span>
                  ) : null}
                  {item}
                </li>
              ))}
            </ul>

            {/* `text-pretty` not `text-balance`: balance re-flows the first
                line to match the second and fights the explicit break
                below. The <br /> holds the reference's two-line shape from
                lg up, where there is width for it. */}
            <h1 className="max-w-[20ch] text-pretty font-grotesk text-3xl leading-[1.1] font-bold tracking-tight text-white sm:text-4xl lg:max-w-none lg:text-[2.75rem] lg:leading-[1.08] xl:text-[3.25rem]">
              Sovereign deep-tech,
              <br className="hidden lg:inline" />{" "}
              <span className="text-signal-orange">built in Bangladesh.</span>
            </h1>

            <p className="max-w-[46ch] font-sans text-body-md leading-relaxed text-slate-200 lg:text-body-lg">
              Native semiconductors, clinical wearables and rural telemetry —
              engineered for the Golden Two Hours, across all 64 districts.
            </p>

            {/* Link row. Icon plate + label, matching the reference's quiet
                treatment: these are routes into the work, not conversion
                buttons, so they carry no fill. */}
            <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-sm pt-space-xs">
              <Link
                href="#flagship"
                className="group inline-flex items-center gap-space-sm rounded-lg font-sans text-label-md font-semibold text-white transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-signal-orange backdrop-blur-sm transition-colors group-hover:border-signal-orange/50 group-hover:bg-white/15">
                  <Icon name="monitor_heart" className="text-[18px]" />
                </span>
                Explore the hardware
              </Link>

              <Link
                href="#kandari-profile"
                className="group inline-flex items-center gap-space-sm rounded-lg font-sans text-label-md font-semibold text-white transition-colors hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-emerald-300 backdrop-blur-sm transition-colors group-hover:border-emerald-300/50 group-hover:bg-white/15">
                  <Icon name="person_add" className="text-[18px]" />
                </span>
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
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-7 bg-signal-orange"
                  : "w-3.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Proof rule. Two columns on phones so the values stay large enough
          to read; four from lg. `divide-*` rather than borders per cell so
          the outer edges stay clean. */}
      <div className="w-full border-t border-slate-200/80 bg-white">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200/80 lg:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 px-space-sm py-space-md text-center max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-slate-200/80"
            >
              <dt className="font-mono text-label-xs font-medium tracking-widest text-text-muted uppercase">
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
