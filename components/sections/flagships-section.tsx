import type { ReactNode } from "react";
import { WIDE } from "@/components/catalog/catalog-shelf";
import { ProductsShowcase, ServicesShowcase, ShowcaseCta, TrackLink } from "@/components/showcase/showcase";
import { SectionHeading } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/*
 * Products and services, as two sections of their own with the apps
 * section between them on the home page. Products keeps `#flagship` (the
 * hero button and the footer link to it); `#swasti-section` lives on the
 * SWASTI poster. Both run the full width of the screen, as the catalogue
 * rows on /products and /services do; the apps section between them keeps
 * the content column.
 */

/** A section heading with the link to its full page level with the title, at the right. */
function HeadingRow({ children, href, link }: { children: ReactNode; href: string; link: string }) {
  return (
    <div className="mb-8 grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      {children}
      <div className="lg:pt-0.5">
        <TrackLink href={href}>{link}</TrackLink>
      </div>
    </div>
  );
}

export function ProductsSection() {
  return (
    <section id="flagship" className={cn(WIDE, "section-band")}>
      <HeadingRow href="/products" link="All products">
        <SectionHeading
          tone="dark"
          className="mb-0"
          title="Our Products, Built in Bangladesh"
          lead="Healthcare first, where every hour of delay costs lives, then a platform where skills are proven and paid fairly. Every product is designed, built and run by our own team."
        />
      </HeadingRow>
      <ProductsShowcase poster />
    </section>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className={cn(WIDE, "section-band")}>
      <HeadingRow href="/services" link="Services in detail">
        <SectionHeading
          tone="dark"
          className="mb-0"
          title="Our Services: Engineering for Hire"
          lead="The team that builds our products builds for you too: AI, automation, IoT and software for your factory, office, farm or app."
        />
      </HeadingRow>
      <ServicesShowcase poster />
      <ShowcaseCta />
    </section>
  );
}
