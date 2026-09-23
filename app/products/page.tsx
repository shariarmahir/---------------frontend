import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/products/section-heading";
import { SourceLink } from "@/components/products/source-link";
import { Icon } from "@/components/ui/icon";
import { getProduct, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Products | কাণ্ডারী-ল্যাব",
  description:
    "Aponjon, SWASTI and the Smart Pharmacy — three connected products for Bangladesh's Golden Two Hours: detect early, triage fast, treat in the village.",
};

/** How the three products hand a patient to one another. */
const CHAIN = [
  { slug: "aponjon", verb: "Detect", verbBn: "শনাক্ত", body: "The band spots a risky trend and raises the alarm early." },
  { slug: "swasti", verb: "Triage", verbBn: "যাচাই", body: "The app checks urgency in Bangla and connects a doctor." },
  { slug: "smart-pharmacy", verb: "Treat", verbBn: "চিকিৎসা", body: "The village pharmacy measures, consults and dispenses." },
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

export default function ProductsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        {/* Hero band. */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/sections/Bangladesh.jpg"
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-950/65 to-slate-950/30" />
          </div>
          <div className="relative mx-auto max-w-7xl px-gutter-x py-20 lg:py-28">
            <span className="font-bengali text-sm font-bold text-signal-orange">আমাদের পণ্য</span>
            <h1 className="mt-3 max-w-3xl font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
              Three products. <span className="text-signal-orange">One Golden Two Hours.</span>
            </h1>
            <p className="mt-5 max-w-2xl font-sans text-lg leading-relaxed text-white/85">
              Built in Bangladesh for the moment that decides survival — from
              the first warning sign, to a doctor&apos;s opinion, to care in
              the village.
            </p>
          </div>
        </section>

        <div className="bg-grid-subtle">
          {/* Product cards. */}
          <section className="section-band mx-auto max-w-7xl px-gutter-x">
            <SectionHeading
              kicker="পণ্যসমূহ"
              title="Explore the products"
              lede="Each page covers the research, the core problem, how the product solves it, and what it means for Bangladesh."
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>

          {/* How they connect. */}
          <section className="section-band-tinted border-y border-slate-200 bg-mint-subtle/70">
            <div className="mx-auto max-w-7xl px-gutter-x">
              <SectionHeading
                kicker="একসাথে কাজ করে"
                title="One patient journey"
                lede="The products are designed to hand a patient from one to the next, so no hour is lost between them."
              />
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {CHAIN.map((step, i) => {
                  const product = getProduct(step.slug);
                  if (!product) return null;
                  return (
                    <li
                      key={step.slug}
                      className="glass-card relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      style={{ "--card-accent": "var(--color-signal-orange)" } as React.CSSProperties}
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex size-10 items-center justify-center rounded-full bg-signal-orange font-grotesk font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="font-grotesk text-xl font-bold text-text-primary uppercase">
                          {step.verb}{" "}
                          <span className="font-bengali text-base normal-case text-bd-green">· {step.verbBn}</span>
                        </span>
                      </div>
                      <p className="font-sans text-sm leading-relaxed text-text-secondary">{step.body}</p>
                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-bold text-bd-green uppercase hover:underline"
                      >
                        {product.name} <Icon name="arrow_forward" className="text-[14px]!" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* The national picture. */}
          <section className="section-band mx-auto max-w-7xl px-gutter-x">
            <SectionHeading
              kicker="কেন এখনই"
              title="Why Bangladesh needs this now"
              lede="Published national data. Every figure links to its source."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {nationalStats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div>
                    <span className="block font-grotesk text-4xl font-bold tracking-tight text-bd-green tabular-nums">
                      {stat.value}
                    </span>
                    <p className="mt-2 font-sans text-sm leading-snug text-text-secondary">{stat.label}</p>
                  </div>
                  <SourceLink source={stat.source} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
