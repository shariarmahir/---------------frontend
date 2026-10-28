import type { Metadata } from "next";
import { Suspense } from "react";
import { Roadmap, RoadmapFallback } from "@/components/command/roadmap";

export const metadata: Metadata = { title: "Prevention roadmap" };

export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapFallback />}>
      <Roadmap />
    </Suspense>
  );
}
