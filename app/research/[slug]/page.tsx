import type { Metadata } from "next";
import { ArticleView } from "@/components/research/article-view";
import { OwnArticle } from "@/components/research/own-article";
import { findArticle, libraryArticles } from "@/data/research/library";
import { shareText } from "@/lib/research/core";

const find = (slug: string) => findArticle(decodeURIComponent(slug));

export function generateStaticParams() {
  return libraryArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = find((await params).slug);
  if (!a) return { title: "নিবন্ধ — গবেষণাকোষ" };
  const description = a.summary.length > 200 ? `${a.summary.slice(0, 199)}…` : a.summary;
  return {
    title: `${a.title} — গবেষণাকোষ`,
    description,
    // Social previews: the card image comes from opengraph-image.tsx next to this page.
    openGraph: { type: "article", title: shareText(a), description, publishedTime: a.published, authors: a.authors.map((x) => x.nameEn ?? x.name), siteName: "কাণ্ডারী গবেষণাকোষ" },
    twitter: { card: "summary_large_image", title: shareText(a), description },
  };
}

/** A library article is rendered here; anything else is looked up in the viewer's own submissions. */
export default async function ResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = find(slug);
  return a ? <ArticleView a={a} /> : <OwnArticle slug={decodeURIComponent(slug)} />;
}
