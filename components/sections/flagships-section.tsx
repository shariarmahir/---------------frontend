import type { ReactNode } from "react";
import { ProductsShowcase, ServicesShowcase, ShowcaseCta, TrackLink } from "@/components/showcase/showcase";
import { SectionHeading } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/*
 * Products and services, as two sections of their own with the apps
 * section between them on the home page. Products keeps `#flagship` (the
 * hero button and the footer link to it); `#swasti-section` lives on the
 * SWASTI poster. On the home page both keep the page's one column (the
 * header's grid, like every other section), so every title starts under
 * the logo on any screen.
 */

const COLUMN = "mx-auto w-full max-w-384 px-gutter-x";

/** A section heading with the link to its full page level with the title, at the right. */
function HeadingRow({ children, href, link }: { children: ReactNode; href: string; link: string }) {
  return (
    // The kit heading's own bottom margin is dropped (mb-0 sm:mb-0) so this row alone sets the gap
    // to the cards, the kit's 40px from sm; the lead keeps to two even lines on wide screens.
    <div className="mb-8 grid gap-x-12 gap-y-4 sm:mb-10 sm:[&_p]:text-pretty lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:[&_p]:max-w-5xl">
      {children}
      <div className="lg:pt-0.5">
        <TrackLink href={href}>{link}</TrackLink>
      </div>
    </div>
  );
}

export function ProductsSection() {
  return (
    <section id="flagship" className={cn(COLUMN, "section-band")}>
      <HeadingRow href="/products" link="All products">
        <SectionHeading
          tone="dark"
          className="mb-0 sm:mb-0"
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
    <section id="services" className={cn(COLUMN, "section-band")}>
      <HeadingRow href="/services" link="Services in detail">
        <SectionHeading
          tone="dark"
          className="mb-0 sm:mb-0"
          title="Our Services: Engineering for Hire"
          lead="The team that builds our products builds for you too: AI, automation, IoT and software for your factory, office, farm or app."
        />
      </HeadingRow>
      <ServicesShowcase poster />
      <ShowcaseCta />
    </section>
  );
}
