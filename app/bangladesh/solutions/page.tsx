import type { Metadata } from "next";
import { AmarRoadmap } from "@/components/amar/amar-roadmap";
import { ActOpener } from "@/components/desh/act-opener";
import { DeshShell } from "@/components/desh/desh-shell";
import { ResearchCard } from "@/components/desh/research-card";
import { SolutionClose, SolutionDuties, SolutionLetGo, SolutionResources } from "@/components/desh/solutions";
import { ruralBackdrops } from "@/data/rural-life";

export const metadata: Metadata = {
  title: "সমাধান — বাংলাদেশ সমস্যা ও সমাধান | কাণ্ডারী-ল্যাব",
  description: "যা আমাদের আছে, যা ছাড়তে হবে, আর কে কী করবে — দয়া, দায়িত্ব ও সাহসের বাস্তব সমাধান।",
};

export default function BangladeshSolutionsPage() {
  return (
    <DeshShell current="/bangladesh/solutions">
      <ActOpener act="solutions" photo={ruralBackdrops.farmerCattle} />
      <SolutionResources />
      <SolutionLetGo />
      <SolutionDuties />
      <div className="amar-dark">
        <AmarRoadmap />
      </div>
      <SolutionClose />
      <ResearchCard />
    </DeshShell>
  );
}
