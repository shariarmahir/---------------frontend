import type { Metadata } from "next";
import { AmarBaseline } from "@/components/amar/amar-baseline";
import { AmarPriorityBreaks } from "@/components/amar/amar-priority-breaks";
import { ActOpener } from "@/components/desh/act-opener";
import { DeshShell } from "@/components/desh/desh-shell";
import { ProblemPixels } from "@/components/desh/problem-pixels";
import { RuralLives } from "@/components/desh/rural-lives";
import { NationalIndexSection } from "@/components/sections/national-index-section";
import { ruralBackdrops } from "@/data/rural-life";

export const metadata: Metadata = {
  title: "৩২টি সমস্যা — বাংলাদেশ সমস্যা ও সমাধান | কাণ্ডারী-ল্যাব",
  description: "প্রমাণসহ ৩২টি বাস্তব সমস্যা, জাতীয় সূচক, মাঠের কষ্ট আর গ্রামের মানুষের জীবন — পিক্সেল বাই পিক্সেল।",
};

export default function BangladeshProblemsPage() {
  return (
    <DeshShell current="/bangladesh/problems">
      <ActOpener act="problems" photo={ruralBackdrops.erosionWalk} />
      <NationalIndexSection />
      <div className="amar-dark">
        <AmarBaseline />
      </div>
      <div className="amar-dark">
        <AmarPriorityBreaks />
      </div>
      <RuralLives />
      <ProblemPixels />
    </DeshShell>
  );
}
