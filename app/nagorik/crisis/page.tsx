import type { Metadata } from "next";
import { AmarCausalLoop } from "@/components/amar/amar-causal-loop";
import { AmarEmergency } from "@/components/amar/amar-emergency";
import { AmarLossProjection } from "@/components/amar/amar-loss-projection";
import { ChapterShell } from "@/components/bangladesh-landing/chapter-shell";
import { CrisisAttacks } from "@/components/desh/crisis-attacks";

export const metadata: Metadata = {
  title: "Crisis — Bangladesh | Kandari-Lab",
  description:
    "Chapter 2 of Bangladesh: the pressures hitting households now (prices, corruption, floods, joblessness), what they will cost, and why problems regenerate.",
};

export default function BangladeshCrisisPage() {
  return (
    <ChapterShell chapter="crisis">
      <CrisisAttacks />
      <AmarLossProjection />
      <AmarEmergency />
      <AmarCausalLoop />
    </ChapterShell>
  );
}
