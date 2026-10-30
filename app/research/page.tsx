import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CollectionCards } from "@/components/research/collection-cards";
import { HeroSlider, ThemeCarousel } from "@/components/research/home";
import { BAND_TITLE, BTN, collectionHref, COLUMN, GeniusLogo, LIFT, TITLE } from "@/components/research/kit";
import { SignalSeam } from "@/components/ui/section-kit";
import { COLLAGE, HERO_SLIDES } from "@/data/research/showcase";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Genius — Bangladesh's open research library" };

const BROADEN = [
  {
    src: "/media/circuit.webp",
    alt: "A sensor prototype on a breadboard",
    title: "Bring your work to life with figures and images",
    body: "Every chart, table and photograph in the library, with its caption and credit, ready to cite.",
    href: "/research/images",
    cta: "Search images and figures",
  },
  {
    src: "/bangladesh/rural/char-flood.jpg",
    alt: "A flooded char settlement on the Jamuna",
    title: "Hear voices from the field",
    body: "Surveys, trials and interviews from named districts, chars and villages across Bangladesh.",
    href: collectionHref("field-work"),
    cta: "Browse From the Field",
  },
  {
    src: "/bangladesh/rural/sowing-paddy.jpg",
    alt: "A farmer transplanting rice seedlings",
    title: "Publish your research for the whole country",
    body: "Theses, papers, innovations, projects and ideas, from school to PhD. Free to publish, free to read.",
    href: "/research/submit",
    cta: "Upload research",
  },
];

/** The collage tiles: JSTOR's staggered grid of six primary sources. */
const TILE = [
  "col-start-1 col-span-3 row-start-1 row-span-2",
  "col-start-4 col-span-2 row-start-1 row-span-2",
  "col-start-2 col-span-2 row-start-3 row-span-2",
  "col-start-4 col-span-2 row-start-3 row-span-3",
  "col-start-6 col-span-1 row-start-2 row-span-3",
  "col-start-1 col-span-3 row-start-5 row-span-2",
];

/**
 * Genius's home, after jstor.org, in the landing page's dress: the
 * photograph slider straight under the tool bar (which holds the search),
 * the logo and gold headline in a notch cut into its corner, primary sources, then bands that alternate like the landing
 * page's (ink for the most-read work, navy for the collections, black for
 * the three ways to go further), each opened by a gold pulse on its seam.
 */
export default function ResearchHome() {
  return (
    <>
      <HeroSlider slides={HERO_SLIDES}>
        <GeniusLogo priority className="hero-rise h-10 sm:h-12 lg:h-16" />
        <h1 className={cn(TITLE, "hero-rise mt-3 text-2xl leading-[1.12] sm:mt-4 sm:text-3xl lg:text-4xl")} style={{ "--d": "120ms" } as CSSProperties}>Explore Bangladesh&apos;s knowledge, cultures, and ideas</h1>
      </HeroSlider>

      <section aria-labelledby="sources-title" className={cn(COLUMN, "section-band grid items-center gap-10 lg:grid-cols-2")}>
        <div aria-hidden className="story-reveal grid h-80 grid-cols-6 grid-rows-6 gap-3 sm:h-96 lg:h-112">
          {COLLAGE.map((p, i) => (
            <span key={p.src} className={cn("group relative overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12", TILE[i])}>
              <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none" />
            </span>
          ))}
        </div>
        <div className="story-reveal">
          <h2 id="sources-title" className={BAND_TITLE}>Ground your research in Bangladesh&apos;s real problems</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">Explore studies linked to the 32 live problems in our national dossier, from floods and river erosion to prices, counterfeits, schools and health, with field photographs credited to their makers.</p>
          <Link href="/research/collections" className={cn(BTN, "mt-8")}>Browse by collection</Link>
        </div>
      </section>

      <section aria-labelledby="theme-title" className="section-band-tinted relative bg-text-primary">
        <SignalSeam className="top-0" />
        <div className={COLUMN}>
          <div className="story-reveal">
            <h2 id="theme-title" className={BAND_TITLE}>Take an interdisciplinary approach to Bangladesh&apos;s Real-Time Problems</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/80">Get diverse perspectives on floods, food, health, air and schools through theses, papers, innovations, projects and ideas.</p>
          </div>
          <ThemeCarousel />
        </div>
      </section>

      <section aria-labelledby="collections-title" className="section-band-tinted relative bg-bdnavy-900">
        <SignalSeam className="top-0" />
        <div className={COLUMN}>
          <h2 id="collections-title" className={cn(BAND_TITLE, "story-reveal")}>Explore our collections</h2>
          <div className="mt-10"><CollectionCards /></div>
        </div>
      </section>

      <section aria-labelledby="broaden-title" className={cn(COLUMN, "section-band")}>
        <h2 id="broaden-title" className={cn(BAND_TITLE, "story-reveal")}>Broaden your research with images and field evidence</h2>
        <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-3">
          {BROADEN.map((b, i) => (
            <li key={b.title} className="story-reveal group flex flex-col">
              <span
                style={{ "--glow": ["var(--color-cobalt)", "var(--color-signal-orange)", "var(--color-bdnavy-400)"][i] } as CSSProperties}
                className={cn("relative block aspect-323/248 overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12", LIFT)}
              >
                <Image src={b.src} alt={b.alt} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none" />
              </span>
              {/* The text block grows to the tallest card's, so the three buttons share one baseline under images of one ratio. */}
              <div className="flex flex-1 flex-col">
                <h3 className="mt-6 min-h-[2lh] font-grotesk text-xl leading-snug font-bold text-balance text-white">{b.title}</h3>
                <p className="mt-3 mb-8 text-base leading-relaxed text-white/80">{b.body}</p>
                <Link href={b.href} className={cn(BTN, "mt-auto self-start")}>{b.cta}</Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
