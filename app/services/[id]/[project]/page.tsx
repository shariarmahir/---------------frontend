/*
 * A project page, under its service: the short navy band, the demo's
 * screens on the cobalt strip, the problem and the fix, the technology in
 * one row, a 3D film of how it works, the demo dashboards, the demo's
 * figures (labelled as a sample shift), the timeline, and the Kandari
 * Profile invitation.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeatureStrip, PageHero } from "@/components/catalog/catalog-blocks";
import { DetailSection, PipelineTrack, ProblemSolve, UseGrid } from "@/components/catalog/detail-blocks";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DyeFloorMotion } from "@/components/projects/dye-floor-motion";
import { TechRow } from "@/components/projects/tech-row";
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

/** "A, B and C". */
const listOf = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);

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

  const [lead, ...rest] = project.shots;
  const demoTech = project.tech.filter((t) => t.layer === "demo").map((t) => t.logo.title);

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <PageHero
          art={project.shots.map((shot) => ({ src: shot.src, alt: shot.alt }))}
          title={<span className="text-signal-orange">{project.name}</span>}
          lead={`${project.tagline} For ${project.client}: ${project.status.toLowerCase()}.`}
        >
          <Link href="#motion" className={btn.gold}>
            See how it works
          </Link>
          {project.demoUrl ? (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={btn.goldOutline}>
              Open the live demo <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
          <Link href={`/services/${service.id}`} className={btn.goldOutline}>
            {service.name}
          </Link>
        </PageHero>

        <FeatureStrip items={project.modules.map((m) => ({ icon: m.icon, label: m.label }))} label={`The screens of ${project.name}`} />

        <DetailSection id="project" title="The problem, and the fix" lead={project.summary}>
          <ProblemSolve problem={project.problem} solve={project.solution} />
        </DetailSection>

        <DetailSection
          id="technology"
          title="The technology"
          lead={`The working demo runs on ${listOf(demoTech)}. The rest is the stack we propose for the floor, from the machine sensors to the operator's tablet.`}
        >
          <TechRow items={project.tech} />
        </DetailSection>

        <DetailSection id="motion" title="How it works" lead="A short film of the floor: the machines report, the hub works out what is late, and everyone sees what to do next.">
          <DyeFloorMotion poster={{ src: lead.src, alt: lead.alt }} />
        </DetailSection>

        <DetailSection id="demo" title="Inside the demo" lead="Screens from the working demo, running on a sample shift.">
          {/* The wallboard across the width, the other two screens side by side under it. */}
          <div className="grid gap-6 lg:grid-cols-2">
            {[lead, ...rest].map((shot, i) => (
              <figure key={shot.src} className={cn("story-reveal flex flex-col gap-3", i === 0 && "lg:col-span-2")}>
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
                    sizes={i === 0 ? "(min-width: 1280px) 80rem, 100vw" : "(min-width: 1024px) 40rem, 100vw"}
                    className="h-auto w-full transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="sr-only">Open the full-size screen in a new tab</span>
                </a>
                <figcaption className="font-sans text-sm leading-relaxed text-white/65">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </DetailSection>

        <DetailSection id="screens" title="What it does" lead="Nine screens, one for each person on the floor and in the office.">
          <UseGrid items={project.modules.map((m) => ({ icon: m.icon, title: m.label, body: m.body }))} />
        </DetailSection>

        <DetailSection id="figures" title="What the demo shows" lead="Figures from the demo's sample shift: what the system displays, not results from a live floor.">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.demo.map((d, i) => (
              <li
                key={d.label}
                className={cn("story-reveal flex flex-col gap-2 rounded-3xl p-6 ring-1 ring-white/12", ["bg-cobalt", "bg-bdnavy-900", "bg-text-primary"][i % 3])}
              >
                <span className="font-grotesk text-4xl font-bold tracking-tight text-signal-orange tabular-nums">{d.value}</span>
                <span className="font-sans text-sm leading-relaxed text-white/80">{d.label}</span>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection id="timeline" title="Timeline" lead={`${project.timeline.note} The stages after the proposal are the plan.`}>
          <PipelineTrack pipeline={project.timeline} notes={project.timeline.notes} />
          <p className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-white/65">
            <Icon name="info" className="text-lg" />
            Dates are set with the client when the proposal is agreed.
          </p>
        </DetailSection>

        <KandariProfileSection />
      </main>
      <SiteFooter />
    </>
  );
}
