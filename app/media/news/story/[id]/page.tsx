import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryDetail, storyCompany } from "@/components/media/news/paper/story-page";
import { sourceName } from "@/data/media/news-sources";
import { loadPaper } from "@/lib/media/news-paper";

/**
 * One story in নাগরিক জীবন, laid out after The Daily Star's story page:
 * the editor's pick at the left, the story in the middle, related stories
 * at the right. We have only the feed's headline, summary and photo, so
 * that is all the page shows; the full story is one tap away on the
 * publisher's site.
 */

type Params = Promise<{ id: string }>;

async function findStory(id: string) {
  const paper = await loadPaper();
  const key = decodeURIComponent(id);
  return { paper, item: paper.items.find((n) => n.id === key) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const { item } = await findStory(id);
  if (!item) return { title: "খবরটি পাওয়া যায়নি — নাগরিক জীবন" };
  return {
    title: `${item.title} — নাগরিক জীবন`,
    description: item.summary || `${sourceName(item.source)}-এর খবর`,
  };
}

export default async function StoryPage({ params }: { params: Params }) {
  const { id } = await params;
  const { paper, item } = await findStory(id);
  if (!item) notFound();
  return <StoryDetail item={item} company={storyCompany(item, paper.items)} />;
}
