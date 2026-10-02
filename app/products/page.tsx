/*
 * THESIS: the products page speaks the home page's language — a pitch-black
 * ground with whole colour fields, not pale cards on a dotted sheet.
 * OWN-WORLD: the header's gold #e4b027, ink #032017 and bottle green #006747
 * as solid card and band fills; ink cards carry a faint white ring to hold an
 * edge on the black; a three-pixel mark on every heading; a gold pulse on the
 * seam of the dark bands. No textures (Mahir, 2026-09-30).
 * STORY: the claim over the photograph → the three products → how one patient
 * moves between them → why the country needs it now.
 * FIRST VIEWPORT: gold header over the photo hero, claim left, the ink proof
 * strip closing the band — the same opening as the home page.
 * FORM: extension of the home world; bands alternate black, green, black.
 */
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductsShowcase, ServicesShowcase, ShowcaseCta } from "@/components/showcase/showcase";
import { SourceLink } from "@/components/products/source-link";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam } from "@/components/ui/section-kit";
import { getProduct, products } from "@/data/products";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products & Services | কাণ্ডারী-ল্যাব",
  description:
    "Aponjon, SWASTI and the Smart Pharmacy for Bangladesh's Golden Two Hours — and the services behind them: AI, LLMs and agents; automation for factory, home and office; IoT solutions; websites, apps and UI.",
};

/** How the three products hand a patient to one another. */
const CHAIN = [
  { slug: "aponjon", verb: "Detect", verbBn: "শনাক্ত", body: "The band spots a risky trend and raises the alarm early." },
  { slug: "swasti", verb: "Triage", verbBn: "যাচাই", body: "The app checks urgency in Bangla and connects a doctor." },
  { slug: "smart-pharmacy", verb: "Treat", verbBn: "চিকিৎসা", body: "The village pharmacy measures, consults and dispenses." },
];

/** Solid colour for each step of the journey, on the green band. */
const CHAIN_SURFACES = [
  { card: "bg-signal-orange text-text-primary", num: "bg-text-primary text-signal-orange", glow: "var(--color-signal-orange)" },
  { card: "bg-text-primary text-white ring-1 ring-white/12", num: "bg-signal-orange text-text-primary", glow: "var(--color-bdgreen-500)" },
  { card: "bg-bdorange-600 text-text-primary", num: "bg-text-primary text-signal-orange", glow: "var(--color-bdorange-600)" },
];

/** The four proof points, in the ink rule below the hero band. */
const PROOF = [
  { label: "Connected products", value: String(products.length) },
  { label: "Services", value: String(services.length) },
  { label: "Golden window", value: "2 HOURS" },
  { label: "Built in", value: "BANGLADESH" },
];

/**
 * One national figure per theme — hidden risk, doctor shortage, cost, and
 * the drug-shop front line — drawn from the products' own sourced stats
 * so the overview can never quote a number a detail page does not.
 */
const nationalStats = [
  { slug: "aponjon", index: 0 },
  { slug: "swasti", index: 0 },
  { slug: "swasti", index: 1 },
  { slug: "smart-pharmacy", index: 0 },
].flatMap(({ slug, index }) => {
  const stat = getProduct(slug)?.stats[index];
  return stat ? [stat] : [];
});

/** Green, gold, orange, ink — the Pixel-Map order. */
const STAT_SURFACES = [
  { card: "bg-bd-green text-white", glow: "var(--color-bd-green)" },
  { card: "bg-signal-orange text-text-primary", glow: "var(--color-signal-orange)" },
  { card: "bg-bdorange-600 text-text-primary", glow: "var(--color-bdorange-600)" },
  { card: "bg-text-primary text-white ring-1 ring-white/12", glow: "var(--color-bdgreen-500)" },
];

const LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-20px_var(--glow)] active:-translate-y-1.5 active:scale-[0.98] active:shadow-[0_22px_40px_-20px_var(--glow)] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100";

export default function ProductsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        {/* Hero band — the photograph under an ink scrim, claim on the left. */}
        <section className="relative w-full">
          <div className="hero-band relative flex items-center overflow-hidden bg-text-primary">
            <Image
              src="/sections/Bangladesh.jpg"
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-r from-text-primary/95 via-text-primary/70 to-text-primary/20" />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-text-primary/75 via-transparent to-text-primary/25" />
            <div className="relative w-full py-16">
              <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-space-md px-gutter-x">
                <span className="font-bengali text-sm font-bold text-signal-orange">আমাদের পণ্য</span>
                <h1 className="max-w-3xl font-grotesk text-3xl leading-[1.1] font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] xl:text-[3.25rem]">
                  Three products. Four services. <span className="text-signal-orange">One team, built in Bangladesh.</span>
                </h1>
                <p className="max-w-[46ch] font-sans text-body-md leading-relaxed text-white/85 lg:text-body-lg">
                  Healthcare products for the Golden Two Hours, and the engineering behind them — AI, automation, IoT
                  and software — built for your factory, office, farm or app.
                </p>
              </div>
            </div>
          </div>

          {/* Proof strip — the header's ink strip at full width. */}
          <div className="relative w-full bg-text-primary">
            <SignalSeam className="top-0" />
            <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 lg:grid-cols-4">
              {PROOF.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1 px-space-sm py-space-md text-center max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-white/10"
                >
                  <dt className="font-mono text-label-xs font-medium tracking-widest text-white/65 uppercase">{item.label}</dt>
                  <dd className="font-grotesk text-lg font-bold text-signal-orange tabular-nums sm:text-xl">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="relative">
          {/* Product cards. */}
          <section className="section-band-tinted mx-auto max-w-7xl px-gutter-x">
            <SectionHeading
              tone="dark"
              kicker="পণ্যসমূহ"
              title="Explore the products"
              lead="Each page covers the research, the core problem, how the product solves it, and what it means for Bangladesh."
            />
            <ProductsShowcase />
          </section>

          {/* Services — the same team's engineering, built for others. */}
          <section id="services" className="section-band-tinted mx-auto max-w-7xl scroll-mt-header px-gutter-x lg:scroll-mt-header-lg">
            <SectionHeading
              tone="dark"
              kicker="সেবা — আপনার জন্য আমরা বানাই"
              title="Services"
              lead="The skills behind Aponjon and SWASTI, put to work on your problem. Tell us what you need; we design, build and hand it over."
            />
            <ServicesShowcase on="products" />
            <ShowcaseCta />
          </section>

          {/* How they connect — a green band. */}
          <section className="section-band-tinted relative isolate overflow-hidden bg-bd-green text-white">
            <SignalSeam className="top-0" />
            <div className="mx-auto max-w-7xl px-gutter-x">
              <SectionHeading
                tone="dark"
                kicker="একসাথে কাজ করে"
                title="One patient journey"
                lead="The products are designed to hand a patient from one to the next, so no hour is lost between them."
              />
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))]">
                {CHAIN.map((step, i) => {
                  const product = getProduct(step.slug);
                  if (!product) return null;
                  const tone = CHAIN_SURFACES[i % CHAIN_SURFACES.length];
                  return (
                    <li key={step.slug} className="story-reveal flex">
                      <div
                        style={{ "--glow": tone.glow } as CSSProperties}
                        className={cn("flex w-full flex-col rounded-3xl p-6 shadow-sm", LIFT, tone.card)}
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <span className={cn("inline-flex size-10 items-center justify-center rounded-full font-grotesk font-bold", tone.num)}>
                            {i + 1}
                          </span>
                          <span className="font-grotesk text-xl font-bold uppercase">
                            {step.verb} <span className="font-bengali text-base normal-case">· {step.verbBn}</span>
                          </span>
                        </div>
                        <p className="font-sans text-sm leading-relaxed">{step.body}</p>
                        <Link
                          href={`/products/${product.slug}`}
                          className="mt-auto inline-flex items-center gap-1 pt-4 font-mono text-xs font-bold uppercase underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
                        >
                          {product.name} <Icon name="arrow_forward" className="text-[14px]!" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* The national picture. */}
          <section className="section-band-tinted mx-auto max-w-7xl px-gutter-x">
            <SectionHeading
              tone="dark"
              kicker="কেন এখনই"
              title="Why Bangladesh needs this now"
              lead="Published national data. Every figure links to its source."
            />
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
              {nationalStats.map((stat, i) => {
                const tone = STAT_SURFACES[i % STAT_SURFACES.length];
                return (
                  <li key={stat.label} className="story-reveal flex">
                    <div
                      style={{ "--glow": tone.glow } as CSSProperties}
                      className={cn("flex w-full flex-col justify-between gap-4 rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-6", LIFT, tone.card)}
                    >
                      <div>
                        <span className="block font-grotesk text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">{stat.value}</span>
                        <p className="mt-2 font-sans text-xs leading-snug sm:text-sm">{stat.label}</p>
                      </div>
                      <SourceLink source={stat.source} className="text-current/80 hover:text-current" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
