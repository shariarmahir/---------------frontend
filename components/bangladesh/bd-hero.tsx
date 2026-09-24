import { heroFacts, heroFilm } from "@/data/bangladesh";
import { StoryPhoto } from "./story-photo";
import { FilmButton } from "./story-video";

/**
 * Full-bleed hero: a drifting landscape (still under reduced motion) and
 * the pill that opens the page's film. The band uses the shared
 * `hero-band` height, so it matches the home and /products heroes; the
 * fact strip sits in a rule beneath it, as the home page's stats do.
 */
export function BdHero() {
  return (
    <section className="relative w-full">
      <div className="hero-band relative isolate flex items-center overflow-hidden bg-slate-950">
        {/* Slow-drifting landscape; when the page's own film exists, a
            muted loop of it goes here. */}
        <StoryPhoto photo={heroFilm.poster} sizes="100vw" priority drift className="absolute inset-0 -z-20" />

        {/* Scrims: a deep floor for the type, and a flag-green wash. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-slate-950/90 via-slate-950/50 to-slate-950/15" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-bd-green-dark/80 via-bd-green-dark/30 to-transparent" />

        <div className="story-reveal mx-auto w-full max-w-7xl px-gutter-x py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-bengali text-sm font-semibold text-white backdrop-blur-md">
            <span className="size-2 rounded-full bg-national-crimson" />
            বাংলাদেশ · ১৯৭১ → ২০২৬
          </span>

          <h1 className="mt-5 font-bengali text-4xl leading-[1.1] font-bold text-white sm:text-6xl lg:text-7xl">
            আমার <span className="text-signal-orange">সোনার</span> বাংলা
          </h1>
          <p className="mt-3 font-bengali text-xl text-white/90 sm:text-2xl">আমি তোমায় ভালোবাসি।</p>
          <p className="mt-4 max-w-2xl font-bengali text-base leading-relaxed text-white/80 sm:text-lg">
            নদী, মাঠ, পাহাড় আর সমুদ্রের দেশ। ভাষার জন্য রক্ত দেওয়া, একাত্তরে
            স্বাধীনতা ছিনিয়ে আনা বীরের জাতি। এটা আমাদের গল্প — কারা আমরা, কোথা
            থেকে এসেছি, আর কোথায় যাচ্ছি।
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <FilmButton film={heroFilm} label="পুরো ভিডিওটি দেখুন" />
            <a
              href="#memories"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 font-bengali text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              আপনার স্মৃতি শেয়ার করুন
            </a>
          </div>
        </div>
      </div>

      {/* Fact rule, beneath the band. */}
      <div className="w-full border-t border-white/10 bg-slate-950">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {heroFacts.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-0.5 border-white/10 px-space-sm py-space-md text-center transition-colors not-first:border-l hover:bg-white/5 max-sm:nth-[2n+1]:border-l-0 max-sm:nth-[n+3]:border-t max-sm:last:col-span-2 sm:max-lg:nth-[3n+1]:border-l-0 sm:max-lg:nth-[n+4]:border-t"
            >
              {/* Label first for screen readers; shown under the value. */}
              <dt className="order-last font-bengali text-xs text-white/70">{f.label}</dt>
              <dd className="font-bengali text-2xl font-bold text-white sm:text-3xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
