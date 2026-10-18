/*
 * A product page, laid out like a project page (app/services/[id]/[project]):
 * the short navy band, what it does on the cobalt strip, the problem and
 * the fix, the planned technology as stickers, a 3D film of how it works,
 * real situations it is for, what it does and for whom, the published
 * figures behind it, the timeline, and the Kandari Profile invitation.
 * One template for every product (CLAUDE.md §8).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeatureStrip, PageHero } from "@/components/catalog/catalog-blocks";
import { DetailSection, FigureTiles, PipelineTrack, ProblemSolve, ScenarioGrid, UseGrid } from "@/components/catalog/detail-blocks";
import { TechRow } from "@/components/catalog/tech-row";
import { MotionFilm, type FilmId } from "@/components/films/motion-film";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { productReleases } from "@/data/catalog";
import { getProduct, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} (${product.nameBn}) | কাণ্ডারী-ল্যাব`,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  const release = productReleases[slug];
  if (!product || !release) notFound();

  const { pipeline, access, tech, film } = release;
  const { stages, current } = pipeline;

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <PageHero
          art={[product.image]}
          title={
            <>
              <span className="text-signal-orange">{product.name}</span>{" "}
              <span lang="bn" className="font-bengali text-3xl font-bold text-white/65">
                {product.nameBn}
              </span>
            </>
          }
          lead={product.tagline}
        >
          <Link href={access.href} className={btn.gold}>
            {access.label}
          </Link>
          <Link href="#motion" className={btn.goldOutline}>
            See how it works
          </Link>
        </PageHero>

        <FeatureStrip items={product.capabilities.map((c) => ({ icon: c.icon, label: c.title }))} label={`What ${product.name} does`} />

        <DetailSection id="problem" title="The problem, and the fix" lead={product.summary}>
          <ProblemSolve problem={product.coreProblem} solve={product.coreSolve} />
        </DetailSection>

        <DetailSection
          id="technology"
          title="The technology"
          lead={`The stack we are building ${product.name} on. It is still in development, so parts of it may change.`}
        >
          <TechRow items={tech} />
        </DetailSection>

        <DetailSection id="motion" title="How it works" lead={film.lead}>
          <MotionFilm film={slug as FilmId} label={film.label} />
        </DetailSection>

        <DetailSection id="scenarios" title="Where it helps" lead="Two situations from village life: what happens today, and what changes with it.">
          <ScenarioGrid product={product.name} items={product.scenarios} />
        </DetailSection>

        <DetailSection id="uses" title="What it does" lead={`${product.steps.map((s) => s.title).join(", ")}: and who gains from it.`}>
          <div className="flex flex-col gap-4">
            <UseGrid items={product.capabilities} />
            <UseGrid items={product.benefits.map((b) => ({ icon: b.icon, tag: b.audience, title: b.title, body: b.body }))} />
          </div>
        </DetailSection>

        <DetailSection id="figures" title="The figures behind it" lead="Published national figures that make the case. Every number links to its source.">
          <FigureTiles items={product.stats} />
        </DetailSection>

        <DetailSection
          id="timeline"
          title="Timeline"
          lead={`${pipeline.note} ${current} of ${stages.length} stages finished; the stages after ${stages[current].toLowerCase()} are the plan.`}
        >
          <PipelineTrack pipeline={pipeline} notes={pipeline.notes} />
          <p className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-white/65">
            <Icon name="info" className="text-lg" />
            {access.note}
          </p>
        </DetailSection>

        <KandariProfileSection />
      </main>
      <SiteFooter />
    </>
  );
}
