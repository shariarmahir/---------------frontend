import type { Metadata } from "next";
import { ContentView } from "@/components/research/content-view";
import { OwnContent } from "@/components/research/own-article";
import { findArticle, libraryArticles } from "@/data/research/library";

const find = (slug: string) => findArticle(decodeURIComponent(slug));

export function generateStaticParams() {
  return libraryArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = find((await params).slug);
  return { title: a ? `${a.title}: Contents — Genius` : "Contents — Genius" };
}

/** A work's contents page; the viewer's own submissions are read from this browser. */
export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = find(slug);
  return a ? <ContentView a={a} /> : <OwnContent slug={decodeURIComponent(slug)} />;
}
