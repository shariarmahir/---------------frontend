import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryPage } from "@/components/motherland/category";
import { mlFonts } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { MotherlandHeader } from "@/components/motherland/header";
import { SideTab } from "@/components/motherland/side-tab";
import { CATEGORIES, categoryFor } from "@/data/motherland-categories";
import { cn } from "@/lib/utils";
import "../motherland.css";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  /* Geography & Travel has its own page, app/bangladesh/travel. */
  return CATEGORIES.filter((c) => c.slug !== "travel").map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categoryFor((await params).category);
  return category
    ? {
        title: `${category.name} | MOTHERLAND`,
        description: category.lede,
        alternates: { canonical: `/bangladesh/${category.slug}` },
        openGraph: { title: `${category.name} | MOTHERLAND`, description: category.lede, images: [category.hero.src] },
      }
    : {};
}

/** Where MOTHERLAND's gold buttons lead: one page for each category, in its own header and footer. */
export const viewport = { themeColor: "#0b1849" };

export default async function MotherlandCategoryPage({ params }: Props) {
  const category = categoryFor((await params).category);
  if (!category) notFound();

  return (
    <div className={cn(mlFonts, "ml ml-light w-full bg-ml-ground font-ml-sans text-ml-ink")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; } .ml-reveal { opacity: 1 !important; translate: none !important; } .ml-reveal .ml-wipe { clip-path: none !important; } .ml-reveal .ml-settle { transform: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic={category.topic} />
      <main id="main">
        <CategoryPage category={category} />
      </main>
      <SideTab href="/bangladesh#join" />
      <MotherlandFooter />
    </div>
  );
}
