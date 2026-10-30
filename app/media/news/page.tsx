import type { Metadata } from "next";
import { FrontPage } from "@/components/media/news/paper/front";
import { headlines } from "@/lib/media/news";
import { loadPaper } from "@/lib/media/news-paper";

export const metadata: Metadata = { title: "নাগরিক জীবন — আজকের খবর" };

/**
 * নাগরিক জীবন's front page, after The Daily Star's home page (Mahir,
 * 2026-10-21). The editions now live on আজকের খবর (/media/news/today).
 * The masthead's three teasers are left off this page so no story shows twice.
 */
export default async function NewsFrontPage() {
  const { items } = await loadPaper();
  // The layout's masthead picks these (layout.tsx): the same rule, so they can be skipped here.
  const withPhoto = items.filter((n) => n.image);
  const teasers = headlines(withPhoto.length >= 3 ? withPhoto : items, 3);
  // On a thin day the page keeps every story rather than going nearly blank.
  return <FrontPage items={items} skip={items.length > 8 ? teasers : []} />;
}
