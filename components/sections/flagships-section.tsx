import { ProductsShowcase, ServicesShowcase, ShowcaseCta, TrackHead } from "@/components/showcase/showcase";
import { SectionHeading } from "@/components/ui/section-kit";

/**
 * Products & services: Kandari-Lab's own healthcare products, then the four
 * services the same engineering team builds for others. Every card keeps
 * its photograph visible under a motion-graphic layer (components/showcase).
 * `#flagship` (hero button, footer) and `#swasti-section` (footer) stay.
 */
export function FlagshipsSection() {
  return (
    <section id="flagship" className="section-band mx-auto max-w-7xl px-gutter-x">
      <SectionHeading
        tone="dark"
        kicker="পণ্য ও সেবা"
        title="Sovereign Deep-Tech: Products & Services"
        lead="Our own healthcare products, designed and built inside Bangladesh — and the same engineering in AI, automation, IoT and software, built for your factory, office, farm or app."
      />

      <TrackHead n="01" title="Healthcare products" titleBn="স্বাস্থ্যসেবার পণ্য — আমাদের নিজেদের" href="/products" link="All products" />
      <ProductsShowcase />

      <div className="mt-16 sm:mt-20">
        <TrackHead n="02" title="Services" titleBn="সেবা — আপনার জন্য আমরা বানাই" href="/products#services" link="Services in detail" />
        <ServicesShowcase />
      </div>

      <ShowcaseCta />
    </section>
  );
}
