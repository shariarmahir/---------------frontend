import type { Metadata } from "next";
import { RoadmapView } from "@/components/research/roadmap";

export const metadata: Metadata = {
  title: "Start a Research — Genius",
  description: "Ten steps from a research question to an international publication: what to do at each step, and the standard reviewers apply.",
};

export default function StartResearchPage() {
  return <RoadmapView />;
}
