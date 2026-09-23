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
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        <ProductHero product={product} />
        <div className="bg-grid-subtle">
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
