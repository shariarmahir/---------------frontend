import type { CSSProperties } from "react";
import { HeroFilm } from "./hero-film";
import { HeroLogo } from "./hero-logo";

const CLAIM = "We turn every problem into an opportunity.";

/**
 * Hero (Mahir, 2026-10-25): his 4K film of Bangladesh at full strength
 * (hero-film.tsx), with the animated wordmark and the claim set as one
 * lockup hung under the film's own "Bangladesh" label, flush with its left
 * edge, straight on the film, no blur behind it. No buttons. The claim is
 * navy (the header's #0B1849) on a thin gold outline.
 *
 * The wordmark builds itself on a loop; the claim rises in word by word once.
 * Reduced motion: the poster frame and the finished wordmark, still.
 *
 * Height: the shared `hero-band` floor on a phone; from lg the home band is
 * narrower (`hero-home`, Mahir 2026-10-24: "remove upper space").
 */
export function HeroSection() {
  const words = CLAIM.split(" ");
  return (
    <section id="overview-mission" className="relative w-full">
      {/* The poster is the first paint (and the whole hero without the film): fetch it first. React hoists this into <head>. */}
      <link rel="preload" as="image" href="/hero/hero-poster.jpg" fetchPriority="high" />
      {/* On a phone the band fills the screen under the header. The backdrop is
          the poster frame, framed as the film is (HeroFilm sets its position). */}
      <div className="hero-band hero-home @container relative w-full overflow-hidden bg-black bg-[url(/hero/hero-poster.jpg)] bg-cover bg-position-[50%_42%] max-sm:bg-position-[20%_42%] max-sm:min-h-[max(32rem,calc(100svh-var(--header-offset)-1.5rem))]">
        <HeroFilm />

        {/* One block, flush left, placed by HeroFilm (--pin-x / --pin-y) just
            under the film's label; the fallbacks fit a 4 : 1 band and a phone
            before it runs, so nothing jumps. The claim fills the lockup's width
            in one line (globals.css, .hero-claim) and the wordmark starts at its
            first letter. */}
        <div
          data-hero-lockup
          className="hero-lockup @container absolute top-(--pin-y,60%) left-(--pin-x,15.6%) flex select-none max-sm:top-(--pin-y,calc(49.5%+12px)) max-sm:left-(--pin-x,1rem) flex-col items-start gap-[1.2cqw]"
        >
          <HeroLogo />
          <h1 className="hero-claim hero-outline relative font-grotesk leading-[1.15] font-extrabold tracking-[-0.02em] text-bdnavy-900">
            {/* Read as one sentence; the words below are only its animation. */}
            <span className="sr-only">{CLAIM}</span>
            {words.map((word, i) => (
              <span key={i} aria-hidden>
                <span className="hero-word">
                  <span style={{ "--i": i } as CSSProperties}>{word}</span>
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
