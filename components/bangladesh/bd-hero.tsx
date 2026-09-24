import { heroFacts, heroFilm } from "@/data/bangladesh";
import { StoryPhoto } from "./story-photo";
import { FilmButton } from "./story-video";

/**
 * Full-bleed hero: a drifting landscape (still under reduced motion) and
 * the pill that opens the page's film.
 */
export function BdHero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--spacing-header))] items-end overflow-hidden bg-slate-950 lg:min-h-[calc(100svh-var(--spacing-header-lg))]">
      {/* Slow-drifting landscape; when the page's own film exists, a
          muted loop of it goes here. */}
      <StoryPhoto photo={heroFilm.poster} sizes="100vw" priority drift className="absolute inset-0 -z-20" />

      {/* Scrims: a deep floor for the type, and a flag-green wash. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-bd-green-dark/70 via-transparent to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-gutter-x pt-24 pb-14 lg:pb-20">
        <div className="story-reveal max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-bengali text-sm font-semibold text-white backdrop-blur-md">
            <span className="size-2 rounded-full bg-national-crimson" />
            বাংলাদেশ · ১৯৭১ → ২০২৬
          </span>

          <h1 className="mt-6 font-bengali text-5xl leading-[1.1] font-bold text-white sm:text-7xl lg:text-8xl">
            আমার <span className="text-signal-orange">সোনার</span> বাংলা
          </h1>
          <p className="mt-4 font-bengali text-2xl text-white/90 sm:text-3xl">
            আমি তোমায় ভালোবাসি।
          </p>
          <p className="mt-6 max-w-2xl font-bengali text-base leading-relaxed text-white/75 sm:text-lg">
            নদী, মাঠ, পাহাড় আর সমুদ্রের দেশ। ভাষার জন্য রক্ত দেওয়া, একাত্তরে
            স্বাধীনতা ছিনিয়ে আনা বীরের জাতি। এটা আমাদের গল্প — কারা আমরা, কোথা
            থেকে এসেছি, আর কোথায় যাচ্ছি।
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <FilmButton film={heroFilm} label="পুরো ভিডিওটি দেখুন" />
            <a
              href="#memories"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 font-bengali text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              আপনার স্মৃতি শেয়ার করুন
            </a>
          </div>
        </div>

        {/* Fact strip. */}
        <dl className="story-reveal mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {heroFacts.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 backdrop-blur-md transition-colors hover:bg-white/[0.12]"
            >
              <dt className="sr-only">{f.label}</dt>
              <dd className="font-bengali text-3xl font-bold text-white">{f.value}</dd>
              <dd className="font-bengali text-xs text-white/70">{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Scroll cue. */}
      <a
        href="#history"
        aria-label="নিচে ইতিহাসে যান"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/70 hover:text-white motion-reduce:animate-none lg:block"
      >
        <span className="material-symbols-outlined text-[32px]!" aria-hidden>
          keyboard_double_arrow_down
        </span>
      </a>
    </section>
  );
}
