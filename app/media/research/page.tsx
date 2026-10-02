import type { Metadata } from "next";
import { ResearchBoard, type FeedResearch } from "@/components/media/research/research-board";
import { posts } from "@/data/media/posts";
import { personOrThrow } from "@/data/media/users";

export const metadata: Metadata = { title: "গবেষণা" };

export default function ResearchPage() {
  const fromFeed: FeedResearch[] = posts
    .filter((p) => p.topic === "research" || p.category === "research")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => ({ id: p.id, title: p.caption.split("\n")[0].slice(0, 140), author: personOrThrow(p.author).nameBn, at: p.createdAt }));
  return <ResearchBoard fromFeed={fromFeed} />;
}
