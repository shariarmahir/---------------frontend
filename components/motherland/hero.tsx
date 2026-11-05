import { HERO } from "@/data/motherland";
import { FilmMark } from "./film-mark";
import { HeroFilm } from "./hero-film";

/** The film edge to edge with nothing laid over it: the logo and the anthem's name as Tagore wrote it are melted into the picture. */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[max(40rem,100svh)] flex-col justify-end overflow-hidden bg-ml-navy text-white">
      <HeroFilm film={HERO.film} />

      <div className="mx-auto flex w-full max-w-384 flex-col items-start px-6 pb-[19svh] sm:px-10">
        <FilmMark title={HERO.title} />
      </div>
    </section>
  );
}
