/*
 * A service page, on the product page's template: the service on its
 * tile, what it builds on the cobalt strip, where it stands (taking
 * projects, the products it already runs in, how to start), how a
 * project runs, what you can use it for, and the other services.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeatureStrip, PageHero } from "@/components/catalog/catalog-blocks";
import { CatalogCard, serviceItems } from "@/components/catalog/catalog-card";
import {
  AccessCard,
  DetailSection,
  PipelineTrack,
  RunningCard,
  RunsInCard,
  UseGrid,
} from "@/components/catalog/detail-blocks";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { btn } from "@/components/ui/section-kit";
import { SERVICE_PIPELINE, SERVICE_PIPELINE_NOTES, serviceRunsIn, type Access } from "@/data/catalog";
import { projectsFor } from "@/data/projects";
import { services } from "@/data/services";

export function generateStaticParams() {
  return services.map((s) => ({ id: s.id }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ id: string }> };

const getService = (id: string) => services.find((s) => s.id === id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).id);
  if (!service) return {};
  return { title: `${service.name} | কাণ্ডারী-ল্যাব`, description: service.pitch };
}

const START: Access = {
  label: "Start a project",
  note: "Join Kandari Profile, then tell us the problem. There is nothing to download: we build it with you.",
  href: "#kandari-profile",
  icon: "handshake",
};

export default async function ServicePage({ params }: Props) {
  const { id } = await params;
  const service = getService(id);
  if (!service) notFound();

  const projects = projectsFor(id);
  const others = serviceItems.filter((item) => item.href !== `/services/${id}`);

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <PageHero
          art={[service.image]}
          title={<span className="text-signal-orange">{service.name}</span>}
          lead={service.pitch}
        >
          <Link href={START.href} className={btn.gold}>
            {START.label}
          </Link>
          <Link href="#process" className={btn.goldOutline}>
            How a project runs
          </Link>
        </PageHero>

        <FeatureStrip items={service.builds.map((b) => ({ icon: service.icon, label: b.title }))} label={`What ${service.name} builds`} />

        <DetailSection id="status" title="Where it stands">
          <div className="grid gap-4 lg:grid-cols-3">
            <RunningCard label="Status" title="Taking projects" note="The team is open for new work in this area, from a first idea to a finished build." />
            <RunsInCard proof={service.proof} products={serviceRunsIn[id] ?? []} />
            <AccessCard access={START} label="Get started" />
          </div>
        </DetailSection>

        {projects.length ? (
          <DetailSection id="projects" title="Projects" lead={`What we have proposed and built in ${service.name.toLowerCase()}.`}>
            <ul className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id} className="flex">
                  <CatalogCard
                    className="w-full"
                    sizes="(min-width: 768px) 45vw, 100vw"
                    item={{
                      href: `/services/${service.id}/${project.id}`,
                      name: project.name,
                      body: `${project.status}. ${project.tagline}`,
                      image: { src: project.shots[0].src, alt: project.shots[0].alt, position: "left top" },
                    }}
                  />
                </li>
              ))}
            </ul>
          </DetailSection>
        ) : null}

        <DetailSection id="process" title="How a project runs" lead="Five stages, so you always know where your project stands.">
          <PipelineTrack pipeline={{ stages: SERVICE_PIPELINE, current: 0, note: "" }} notes={SERVICE_PIPELINE_NOTES} steps />
        </DetailSection>

        <DetailSection id="uses" title="What you can use it for" lead={service.pitchBn} leadLang="bn">
          <UseGrid items={service.builds} />
        </DetailSection>

        <DetailSection id="more" title="More services">
          <ul className="grid gap-6 sm:grid-cols-3">
            {others.map((item) => (
              <li key={item.href} className="flex">
                <CatalogCard item={item} sizes="(min-width: 640px) 30vw, 100vw" className="w-full" />
              </li>
            ))}
          </ul>
        </DetailSection>

        <KandariProfileSection />
      </main>
      <SiteFooter />
    </>
  );
}
