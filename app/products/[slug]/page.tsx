/*
 * THESIS: a product page is the home page in miniature — the same pitch-black
 * ground and whole colour fields, with the product's own motion graphic
 * running behind its hero.
 * OWN-WORLD: the header's gold #e4b027, ink #032017 and bottle green #006747
 * as solid cards and bands; ink cards carry a faint white ring; red only for
 * the urgent things (the problem plates, "Today"); a three-pixel mark on every
 * heading; a gold pulse on the seams. No textures.
 * STORY: the claim → the numbers → the core problem and fix → how it works →
 * real situations → films → what Bangladesh gains → roadmap → research → join.
 * FIRST VIEWPORT: gold header over the ink hero, copy left, the photograph
 * right, the heartbeat / waveform / network running behind.
 * FORM: extension of the home world; bands alternate ink, black, green, gold.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductHero } from "@/components/products/product-hero";
import {
  ProductBenefits,
  ProductGrowth,
  ProductNext,
  ProductResearch,
} from "@/components/products/product-impact";
import { ProductCore, ProductProblem } from "@/components/products/product-problem";
import {
  ProductScenarios,
  ProductSolution,
  ProductVideos,
} from "@/components/products/product-solution";
import { getProduct, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} (${product.nameBn}) — ${product.category} | কাণ্ডারী-ল্যাব`,
    description: product.summary,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <ProductHero product={product} />
        {/* Pitch-black ground, solid colour bands (Mahir, 2026-09-30). */}
        <div className="relative">
          <ProductProblem product={product} />
          <ProductCore product={product} />
          <ProductSolution product={product} />
          <ProductScenarios product={product} />
          <ProductVideos product={product} />
          <ProductBenefits product={product} />
          <ProductGrowth product={product} />
          <ProductResearch product={product} />
          <ProductNext product={product} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
