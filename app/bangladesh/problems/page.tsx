import type { Metadata } from "next";
import { AmarBaseline } from "@/components/amar/amar-baseline";
import { AmarPriorityBreaks } from "@/components/amar/amar-priority-breaks";
import { ChapterShell } from "@/components/bangladesh-landing/chapter-shell";
import { ProblemPixels } from "@/components/desh/problem-pixels";
import { RuralLives } from "@/components/desh/rural-lives";

export const metadata: Metadata = {
  title: "32 problems — Bangladesh | Kandari-Lab",
  description:
    "Chapter 4 of Bangladesh: the 32 structural problems, pixel by pixel, with baseline numbers, where the system breaks first, rural lives, evidence and paths.",
};

export default function BangladeshProblemsPage() {
  return (
    <ChapterShell chapter="problems">
      <AmarBaseline />
      <AmarPriorityBreaks />
      <RuralLives />
      <ProblemPixels />
    </ChapterShell>
  );
}
