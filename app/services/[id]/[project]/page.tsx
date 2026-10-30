/*
 * A project page, under its service: the short navy band, its screens on
 * the cobalt strip, the problem and the fix, the technology as stickers, a
 * 3D film of how it works, its screenshots, what it does, its figures
 * (labelled with where they come from), the timeline, and the Kandari
 * Profile invitation. The words above each section come from the
 * project's `copy` (data/projects.ts).
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeatureStrip, PageHero } from "@/components/catalog/catalog-blocks";
import { DetailSection, FigureTiles, PipelineTrack, ProblemSolve, UseGrid } from "@/components/catalog/detail-blocks";
import { TechRow } from "@/components/catalog/tech-row";
import { MotionFilm } from "@/components/films/motion-film";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { getProject, projects } from "@/data/projects";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.service, project: p.id }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ id: string; project: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, project: slug } = await params;
  const project = getProject(id, slug);
  if (!project) return {};
  return { title: `${project.name} | কাণ্ডারী-ল্যাব`, description: project.summary };
}

export default async function ProjectPage({ params }: Props) {
  const { id, project: slug } = await params;
  const project = getProject(id, slug);
  const service = services.find((s) => s.id === id);
  if (!project || !service) notFound();

  const { copy, shots } = project;
  const live = project.timeline.current >= project.timeline.stages.length;
  const viewLabel = live ? "(the live site, opens in a new tab)" : "(the full demo, opens in a new tab)";

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <PageHero
          art={project.shots.map((shot) => ({ src: shot.src, alt: shot.alt }))}
          title={<span className="text-signal-orange">{project.name}</span>}
          lead={`${project.tagline} For ${project.client}: ${project.status.toLowerCase()}.`}
        >
          {project.demoUrl ? (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={btn.gold}>
              View project <span className="sr-only">{viewLabel}</span>
            </a>
          ) : null}
          <Link href="#motion" className={project.demoUrl ? btn.goldOutline : btn.gold}>
            See how it works
          </Link>
          <Link href={`/services/${service.id}`} className={btn.goldOutline}>
            {service.name}
          </Link>
        </PageHero>

        <FeatureStrip items={project.modules.map((m) => ({ icon: m.icon, label: m.label }))} label={`The screens of ${project.name}`} />

        <DetailSection id="project" title="The problem, and the fix" lead={project.summary}>
          <ProblemSolve problem={project.problem} solve={project.solution} />
        </DetailSection>

        <DetailSection id="technology" title="The technology" lead={copy.tech}>
          <TechRow items={project.tech} />
        </DetailSection>

        <DetailSection id="motion" title="How it works" lead={copy.film.lead}>
          <MotionFilm film={project.film} label={copy.film.label} />
        </DetailSection>

        <DetailSection id="demo" title={copy.shots.title} lead={copy.shots.lead}>
          {/* The first screen across the width, the rest in pairs under it; a last one without a pair runs wide too. */}
          <div className="grid gap-6 lg:grid-cols-2">
            {shots.map((shot, i) => (
              <figure
                key={shot.src}
                className={cn("story-reveal flex flex-col gap-3", (i === 0 || (i === shots.length - 1 && shots.length % 2 === 0)) && "lg:col-span-2")}
              >
                <a
                  href={shot.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    sizes={i === 0 || (i === shots.length - 1 && shots.length % 2 === 0) ? "(min-width: 1280px) 80rem, 100vw" : "(min-width: 1024px) 40rem, 100vw"}
                    className="h-auto w-full transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="sr-only">Open the full-size screen in a new tab</span>
                </a>
                <figcaption className="font-sans text-sm leading-relaxed text-white/65">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
          {project.demoUrl ? (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={cn(btn.gold, "mt-8 self-start")}>
              View project <span className="sr-only">{viewLabel}</span>
            </a>
          ) : null}
        </DetailSection>

        <DetailSection id="screens" title="What it does" lead={copy.modules}>
          <UseGrid items={project.modules.map((m) => ({ icon: m.icon, title: m.label, body: m.body }))} />
        </DetailSection>

        <DetailSection id="figures" title={copy.figures.title} lead={copy.figures.lead}>
          <FigureTiles items={project.demo} />
        </DetailSection>

        <DetailSection id="timeline" title="Timeline" lead={project.timeline.note}>
          <PipelineTrack pipeline={project.timeline} notes={project.timeline.notes} />
          {project.timeline.footnote ? (
            <p className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-white/65">
              <Icon name="info" className="text-lg" />
              {project.timeline.footnote}
            </p>
          ) : null}
        </DetailSection>

        <KandariProfileSection />
      </main>
      <SiteFooter />
    </>
  );
}
