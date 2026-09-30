import type { CSSProperties } from "react";
import Link from "next/link";
import { FilmButton } from "@/components/bangladesh/story-video";
import { SignalSeam } from "@/components/ui/section-kit";
import { heroFacts, heroFilm } from "@/data/bangladesh";
import { DESH_CHAPTERS } from "@/data/desh";
import { cn } from "@/lib/utils";
import { PixelMap } from "./pixel-map";

/** Solid colour for each chapter card — the home page's order, green first. */
const CHAPTER_SURFACES = [
  { card: "bg-bd-green text-white", glow: "var(--color-bd-green)" },
  { card: "bg-signal-orange text-text-primary", glow: "var(--color-signal-orange)" },
  { card: "bg-bdorange-600 text-text-primary", glow: "var(--color-bdorange-600)" },
  { card: "bg-text-primary text-white ring-1 ring-white/25", glow: "var(--color-bdgreen-500)" },
  { card: "bg-bd-green text-white", glow: "var(--color-bd-green)" },
];

/**
 * Opening viewport: the country drawn as a glowing low-resolution image
 * with its 32 bad pixels, beside the page's promise and the five chapters it
 * walks through. The map is the thesis — the rest of the section repairs it.
 * An ink band with the header's gold pulse on its seam, like the home hero.
 */
export function DeshHero() {
  return (
    <section aria-labelledby="desh-title" className="relative isolate overflow-hidden bg-text-primary text-white">
      {/* Glow behind the map: bottle green below, harvest gold above. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_75%_45%,rgb(0_103_71/0.45),transparent_70%),radial-gradient(40%_40%_at_85%_15%,rgb(228_176_39/0.16),transparent_70%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-gutter-x py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-20">
        <div className="story-reveal">
          <p className="inline-flex items-center gap-2 font-bengali text-sm font-semibold text-signal-orange">
            <span aria-hidden className="size-2 rounded-xs bg-national-crimson" />
            আমার সোনার বাংলা, আমি তোমায় ভালোবাসি
          </p>
          <h1 id="desh-title" className="mt-4 font-bengali text-5xl leading-[1.05] font-bold text-balance sm:text-6xl lg:text-7xl">
            বাংলাদেশ <span className="text-national-crimson [text-shadow:0_0_28px_rgb(218_41_28/0.55)]">সমস্যা</span> ও{" "}
            <span className="text-signal-orange [text-shadow:0_0_28px_rgb(228_176_39/0.5)]">সমাধান</span>
          </h1>
          <p className="mt-5 max-w-xl font-bengali text-lg leading-relaxed text-white/85">
            দেশটা যেন একটা ঝাপসা ছবি — প্রতিটি অমীমাংসিত সমস্যা একটা নষ্ট পিক্সেল। আমাদের গল্প, সামনের সংকট, ৩২টি বাস্তব সমস্যা আর সেগুলো মেরামতের বাস্তব পথ — পাঁচটি অধ্যায়ে।
          </p>

          <nav aria-label="পাঁচটি অধ্যায়" className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(5,minmax(0,1fr))]">
            {DESH_CHAPTERS.map((c, i) => {
              const tone = CHAPTER_SURFACES[i % CHAPTER_SURFACES.length];
              const here = c.href === "/bangladesh";
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-current={here ? "page" : undefined}
                  style={{ "--glow": tone.glow } as CSSProperties}
                  className={cn(
                    "group rounded-xl px-3 py-3 shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
                    "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "hover:-translate-y-1 hover:shadow-[0_18px_34px_-18px_var(--glow)] active:-translate-y-1 active:scale-[0.97] active:duration-150",
                    "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                    "aria-[current=page]:ring-2 aria-[current=page]:ring-white",
                    tone.card,
                  )}
                >
                  <span className="block font-bengali text-2xl leading-none font-bold">{c.n}</span>
                  <span className="mt-1.5 block font-bengali text-sm font-semibold">{c.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6">
            <FilmButton film={heroFilm} label="বাংলাদেশের গল্প — ভিডিও" />
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-md">
          <PixelMap label="পিক্সেলে আঁকা বাংলাদেশের মানচিত্র; ৩২টি লাল পিক্সেল ৩২টি সমস্যা" className="w-full drop-shadow-[0_0_40px_rgb(0_103_71/0.5)]" />
          <figcaption className="mt-3 flex items-center justify-center gap-4 font-bengali text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-xs bg-national-crimson" /> ৩২টি সমস্যা
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-xs bg-bdgreen-500" /> সুস্থ ভূমি
            </span>
          </figcaption>
        </figure>
      </div>

      {/* Proof strip — the header's ink strip at full width, gold pulse on its seam. */}
      <div className="relative bg-black/35">
        <SignalSeam className="top-0" />
        <dl className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-5">
          {heroFacts.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-0.5 border-white/10 px-2 py-4 text-center not-first:border-l max-sm:nth-[2n+1]:border-l-0 max-sm:nth-[n+3]:border-t max-sm:last:col-span-2">
              <dt className="order-last font-bengali text-xs text-white/70">{f.label}</dt>
              <dd className="font-bengali text-2xl font-bold text-signal-orange sm:text-3xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
