import { HERO } from "@/data/motherland";
import { FilmMark } from "./film-mark";
import { HeroFilm } from "./hero-film";

/** One stretch of sea for the drifting back wave: four even swells over 2880 units, so sliding it by half joins up. */
const DRIFT =
  "M0 45C120 20 240 20 360 45S600 70 720 45S960 20 1080 45S1320 70 1440 45S1680 20 1800 45S2040 70 2160 45S2400 20 2520 45S2760 70 2880 45V100H0Z";
/** The front wave, after Mahir's sketch: uneven swells across the width. */
const CREST = "M0 48C120 18 300 22 495 62C640 92 760 78 860 52C960 26 1050 30 1150 60C1260 90 1370 58 1440 34";

/**
 * The film edge to edge, আমাদের বাংলা, our Bangladesh, taking turns with the logo low on the left,
 * on the same left edge as the words under the hero (the page column), and the film's foot breaking like surf onto the page: a wave in
 * the page's own colour, a fainter one drifting behind it and a gold line along its crest, so the
 * film runs straight into the words under it. Under the floating header the band has the
 * Kandari-Lab home hero's size: 4 : 1 and at least 25rem from lg, 30rem on tablets, nearly the
 * whole screen on phones; the header (4rem, 7.75rem from lg) is added on top.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[max(36rem,calc(100svh_-_1.5rem))] flex-col justify-end overflow-hidden bg-ml-navy text-white sm:min-h-[34rem] lg:min-h-[max(32.75rem,calc(7.75rem_+_25vw))]">
      <HeroFilm film={HERO.film} />

      <div className="mx-auto flex w-full max-w-(--ml-column) flex-col items-start px-6 pb-[calc(13svh_+_var(--ml-wave))] [--ml-wave:clamp(2.25rem,4.2vw,5rem)] sm:px-10 sm:pb-[calc(var(--ml-wave)_+_1.25rem)] lg:pb-[calc(var(--ml-wave)_+_1.75rem)] xl:px-12">
        <FilmMark title={HERO.title} />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-[clamp(2.25rem,4.2vw,5rem)] overflow-hidden text-ml-ground">
        <svg viewBox="0 0 2880 100" preserveAspectRatio="none" className="ml-wave-drift absolute inset-y-0 left-0 h-full w-[200%] opacity-40">
          <path d={DRIFT} fill="currentColor" />
        </svg>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d={`${CREST}V100H0Z`} fill="currentColor" />
          <path d={CREST} fill="none" stroke="var(--color-signal-orange)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </section>
  );
}
