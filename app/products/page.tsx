/*
 * The products page: a short navy band, one line of proof, the cobalt strip
 * of promises, the products, the SWASTI app, the services and a request
 * strip, closed by the landing page's Kandari Profile invitation.
 * OWN-WORLD: the home page's: pitch-black ground, navy, ink and cobalt as
 * the only card fields, gold for titles, buttons and figures. No gradients.
 * HONESTY: no reviews, ratings or press logos. The proof row quotes a
 * published finding and names the publishers our figures come from.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { FeatureStrip, PageHero } from "@/components/catalog/catalog-blocks";
import { productItems, serviceItems } from "@/components/catalog/catalog-card";
import { AppDownload, CatalogShelf, ServiceRequest } from "@/components/catalog/catalog-shelf";
import { SourceLink } from "@/components/catalog/source-link";
import { SourceMarks } from "@/components/catalog/source-marks";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { apps } from "@/data/apps";
import { getProduct, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Products | কাণ্ডারী-ল্যাব",
  description:
    "Aponjon, SWASTI and the Smart Pharmacy for Bangladesh's Golden Two Hours, শিক্ষিতদের মিডিয়া for skills and work, and the services behind them.",
};

const PROMISES = [
  { icon: "translate", label: "Bangla first" },
  { icon: "smartphone", label: "Works on any phone" },
  { icon: "memory", label: "AI on the device" },
  { icon: "stethoscope", label: "A doctor in the loop" },
  { icon: "solar_power", label: "Solar-ready pharmacies" },
  { icon: "timer", label: "Built for the Golden Two Hours" },
  { icon: "flag", label: "Made in Bangladesh" },
];

/** The quoted finding: Saver's "Time is brain", as cited on Aponjon's page. */
const QUOTE = getProduct("aponjon")!.research.findings.find((f) => f.source.url.includes("ahajournals"))!;

/**
 * The speech balloon around the quote, in a 600 × 220 box stretched to fit:
 * a soft, slightly uneven body from y 40 down, and a tail rising from the
 * top right to a point at the box's corner.
 */
const BALLOON =
  "M60 48 C140 30 300 42 470 40 C500 30 515 12 560 2 C540 22 535 40 530 48 C575 55 596 90 590 130 C586 185 540 208 450 210 C330 214 180 206 90 210 C30 212 6 175 10 130 C12 80 22 55 60 48 Z";

/** Every publisher behind the products' figures and findings, once each. */
const PUBLISHERS = [
  ...new Set(products.flatMap((p) => [...p.stats, ...p.research.findings].map((s) => s.source.publisher))),
];

export default function ProductsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <PageHero
          art={productItems.flatMap((item) => (item.image ? [item.image] : []))}
          title={
            <>
              Four products. <span className="text-signal-orange">Four services.</span>
            </>
          }
          lead="One team, built in Bangladesh: healthcare for the Golden Two Hours, a platform for skills and work, and the AI, automation, IoT and software behind them."
        />

        {/* Proof: a published finding, the publishers, and the window it is about. */}
        <section className="section-band mx-auto grid max-w-7xl items-center gap-10 px-gutter-x lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <figure className="story-reveal flex flex-col items-center gap-6 text-center">
            {/* The finding as a hand-drawn speech balloon, its tail curling up
                from the top right (`alert-bubble` in globals.css). */}
            <div className="alert-quote relative w-full max-w-2xl px-12 pt-14 pb-10 text-left sm:px-14">
              <svg aria-hidden viewBox="0 0 600 220" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
                <path d={BALLOON} transform="translate(9 9)" fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" className="stroke-signal-orange/40" />
                <path d={BALLOON} strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="alert-bubble stroke-signal-orange" />
              </svg>
              <blockquote className="alert-bubble-text relative font-grotesk text-xl leading-snug font-bold text-balance sm:text-2xl">
                “{QUOTE.text}”
              </blockquote>
            </div>
            <figcaption className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans text-sm text-white/65">
              Source:
              <SourceLink source={QUOTE.source} full className="text-sm" />
            </figcaption>
            <div className="flex w-full flex-col items-center gap-4 pt-2">
              <p className="flex w-full max-w-2xl items-center gap-4 font-sans text-sm text-white/65">
                <span aria-hidden className="h-px flex-1 bg-white/15" />
                Publishers cited across our product pages
                <span aria-hidden className="h-px flex-1 bg-white/15" />
              </p>
              <SourceMarks publishers={PUBLISHERS} />
            </div>
          </figure>

          {/* The Golden Two Hours as a square note: centred title, a hand-drawn
              clock peeking in at the bottom left, and "2 Hours" running off the
              bottom right. It tilts gently to and fro (`golden-note`). */}
          <div className="story-reveal flex justify-center">
            <div className="golden-note relative aspect-square w-full max-w-88 overflow-hidden rounded-3xl bg-cobalt text-white shadow-[0_18px_36px_-14px_rgb(0_0_0/0.8)]">
              <div className="relative flex flex-col items-center gap-3 px-8 pt-10 text-center">
                <p className="font-grotesk text-lg leading-snug text-white/80">
                  Every product is built for
                  <span className="block text-2xl font-bold text-signal-orange">The Golden Two Hours</span>
                </p>
                <p className="font-sans text-sm leading-relaxed text-white/80">The window in which first treatment most changes the odds.</p>
                <Link
                  href="/about#problem"
                  className="rounded-md font-grotesk text-sm font-bold text-signal-orange underline decoration-signal-orange/40 underline-offset-4 hover:decoration-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  Read why it matters
                </Link>
              </div>
              <svg
                aria-hidden
                viewBox="0 0 140 140"
                fill="none"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute -bottom-6 -left-5 size-36 -rotate-12 stroke-white"
              >
                <path d="M70 18 C100 16 124 40 122 72 C120 104 96 124 66 122 C36 120 16 96 18 66 C20 38 42 20 70 18 Z" />
                <path d="M70 70 L69 42 M70 70 L91 58" />
                <path d="M70 26 v6 M114 70 h-6 M70 114 v-6 M26 70 h6" />
                <path d="M126 28 l10 -9 M131 47 l12 -3 M20 20 l-8 -8" />
                <circle cx="70" cy="70" r="4" className="fill-white" />
              </svg>
              <p aria-hidden className="absolute -right-6 bottom-4 font-grotesk text-6xl leading-none font-bold whitespace-nowrap">
                <span className="text-signal-orange">2</span> <span className="text-white/25">Hours</span>
              </p>
            </div>
          </div>
        </section>

        <FeatureStrip items={PROMISES} label="What every product promises" />

        <CatalogShelf
          id="catalog"
          title="Our products"
          intro={{
            title: "Care first, then work.",
            body: "Three products for the Golden Two Hours, and one for skills and fair-paid work.",
            href: "/products/swasti",
            cta: "Start with SWASTI",
          }}
          items={productItems}
        />

        <AppDownload apps={apps} />

        <CatalogShelf
          id="services"
          title="Our services"
          link={{ label: "All services", href: "/services" }}
          intro={{
            title: "The engineering behind them, built for you.",
            body: "AI, automation, IoT and software from the team that builds Aponjon and SWASTI.",
            href: "/services#process",
            cta: "How a project runs",
          }}
          items={serviceItems}
        />

        <ServiceRequest href="#kandari-profile" />

        <KandariProfileSection />
      </main>
      <SiteFooter />
    </>
  );
}
