import type { Metadata } from "next";
import { AmarRoadmap } from "@/components/amar/amar-roadmap";
import { ChapterShell } from "@/components/bangladesh-landing/chapter-shell";
import { ResearchCard } from "@/components/desh/research-card";
import { SolutionClose, SolutionDuties, SolutionLetGo, SolutionResources } from "@/components/desh/solutions";

export const metadata: Metadata = {
  title: "Solutions — Bangladesh | Kandari-Lab",
  description:
    "Chapter 5 of Bangladesh: what we already have, what to let go, who does what, and a realistic roadmap.",
};

export default function BangladeshSolutionsPage() {
  return (
    <ChapterShell chapter="solutions">
      <SolutionResources />
      <SolutionLetGo />
      <SolutionDuties />
      <AmarRoadmap />
      <SolutionClose />
      <ResearchCard />
    </ChapterShell>
  );
}
