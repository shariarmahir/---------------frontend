import type { Metadata } from "next";
import { ContentsView } from "@/components/research/contents-view";

export const metadata: Metadata = { title: "সূচিপত্র — গবেষণাকোষ" };

export default function ResearchContentsPage() {
  return <ContentsView />;
}
