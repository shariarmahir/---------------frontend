/*
 * A product page, in the catalogue's language: the short navy band with
 * the product's photo on a cobalt disc, its promises on the cobalt strip,
 * then the problem and the fix, where it stands (running, complete,
 * download, pipeline), what it does, how it works, the data behind it, the
 * roadmap and, for the pharmacy, the village map; the landing page's promo
 * banners close it. One template for every product (CLAUDE.md §8).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeatureStrip, PageHero } from "@/components/catalog/catalog-blocks";
import { CatalogCard, productItems } from "@/components/catalog/catalog-card";
import {
  AccessCard,
  CompleteCard,
  DataBlock,
  DetailSection,
  PipelineTrack,
  ProblemSolve,
  RoadmapGrid,
  RunningCard,
  UseGrid,
} from "@/components/catalog/detail-blocks";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
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

  const { pipeline, access } = release;
  const others = productItems.filter((item) => item.href !== `/products/${slug}`);

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
          <Link href="#status" className={btn.goldOutline}>
            Where it stands
          </Link>
        </PageHero>

        <FeatureStrip items={product.capabilities.map((c) => ({ icon: c.icon, label: c.title }))} label={`What ${product.name} does`} />

        <DetailSection id="problem" title="The problem, and the fix" lead={product.summary}>
          <ProblemSolve problem={product.coreProblem} solve={product.coreSolve} />
        </DetailSection>

        <DetailSection id="status" title="Where it stands" lead="Our own status, not a launch claim: nothing here is on sale or in a store yet.">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <RunningCard title={pipeline.stages[pipeline.current]} note={pipeline.note} />
              <CompleteCard pipeline={pipeline} />
              <AccessCard access={access} />
            </div>
            <PipelineTrack pipeline={pipeline} />
          </div>
        </DetailSection>

        <DetailSection id="uses" title="What you can use it for">
          <div className="flex flex-col gap-4">
            <UseGrid items={product.capabilities} />
            <UseGrid items={product.benefits.map((b) => ({ icon: b.icon, tag: b.audience, title: b.title, body: b.body }))} />
          </div>
        </DetailSection>

        <DetailSection id="data" title="The data behind it" lead="What the product reads, and the published figures that make the case. Every number links to its source.">
          <DataBlock reads={release.reads} stats={product.stats} findings={product.research.findings} />
        </DetailSection>

        <DetailSection id="roadmap" title="The road ahead" lead="Our plan, phase by phase. Each goal is a target, not a result.">
          <RoadmapGrid phases={product.growth} />
        </DetailSection>

        <DetailSection id="more" title="More products">
          <ul className="grid gap-6 sm:grid-cols-2">
            {others.map((item) => (
              <li key={item.href} className="flex">
                <CatalogCard item={item} sizes="(min-width: 640px) 45vw, 100vw" className="w-full" />
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
