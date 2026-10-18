/*
 * The services page, the products page's twin: the short navy band, the
 * cobalt strip, the services and the request strip, how a project runs,
 * the products the same skills already power, and the landing page's
 * Kandari Profile invitation.
 * HONESTY: no clients, project counts or results; none are published.
 */
import type { Metadata } from "next";
import { FeatureStrip, PageHero } from "@/components/catalog/catalog-blocks";
import { productItems, serviceItems } from "@/components/catalog/catalog-card";
import { CatalogShelf, ServiceRequest } from "@/components/catalog/catalog-shelf";
import { DetailSection, PipelineTrack } from "@/components/catalog/detail-blocks";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { SERVICE_PIPELINE, SERVICE_PIPELINE_NOTES } from "@/data/catalog";
import { projects } from "@/data/projects";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services | কাণ্ডারী-ল্যাব",
  description:
    "AI, LLMs and agents; automation for factory, home and office; IoT solutions; websites, apps and UI. Built by the team behind Aponjon and SWASTI.",
};

const STRIP = [
  ...services.map((s) => ({ icon: s.icon, label: s.name })),
  { icon: "translate", label: "Bangla first" },
  { icon: "handshake", label: "Handed over, yours to keep" },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <PageHero
          art={projects.map((p) => ({ src: p.shots[0].src, alt: p.shots[0].alt }))}
          title={
            <>
              Our engineering, <span className="text-signal-orange">built for you.</span>
            </>
          }
          lead="AI, automation, IoT and software from the team that builds Aponjon and SWASTI, for your factory, office, farm or app."
        />

        <FeatureStrip items={STRIP} label="What we build" />

        <CatalogShelf
          id="catalog"
          title="Our services"
          intro={{
            title: "Four kinds of work, one team.",
            body: "Tell us the problem on your floor, in your office or in your app. We design it, build it and hand it over.",
            href: "#process",
            cta: "How a project runs",
          }}
          items={serviceItems}
        />

        <ServiceRequest href="#kandari-profile" />

        <CatalogShelf
          id="products"
          title="Where the same skills work"
          link={{ label: "All products", href: "/products" }}
          intro={{
            title: "Built on these services first.",
            body: "Aponjon, SWASTI and the Smart Pharmacy run on the same AI, IoT and software.",
            href: "/products#app",
            cta: "Get the SWASTI beta",
          }}
          items={productItems}
        />

        <DetailSection id="process" title="How a project runs" lead="The same five stages for every service, so you always know where your project stands.">
          <PipelineTrack pipeline={{ stages: SERVICE_PIPELINE, current: 0, note: "" }} notes={SERVICE_PIPELINE_NOTES} steps />
        </DetailSection>

        <KandariProfileSection />
      </main>
      <SiteFooter />
    </>
  );
}
