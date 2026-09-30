import type { Metadata } from "next";
import { AmarCausalLoop } from "@/components/amar/amar-causal-loop";
import { AmarEmergency } from "@/components/amar/amar-emergency";
import { AmarLossProjection } from "@/components/amar/amar-loss-projection";
import { ActOpener } from "@/components/desh/act-opener";
import { CrisisAttacks } from "@/components/desh/crisis-attacks";
import { DeshShell } from "@/components/desh/desh-shell";
import { ruralBackdrops } from "@/data/rural-life";

export const metadata: Metadata = {
  title: "সংকট — বাংলাদেশ সমস্যা ও সমাধান | কাণ্ডারী-ল্যাব",
  description: "সামনের যে সংকট দেশকে আঘাত করছে — দ্রব্যমূল্য, দুর্নীতি, বন্যা, বেকারত্ব — আর তার ক্ষতির হিসাব।",
};

export default function BangladeshCrisisPage() {
  return (
    <DeshShell current="/bangladesh/crisis">
      <ActOpener act="crisis" photo={ruralBackdrops.floodBoat} />
      <CrisisAttacks />
      <div className="amar-dark">
        <AmarLossProjection />
      </div>
      <div className="amar-dark">
        <AmarEmergency />
      </div>
      <div className="amar-dark">
        <AmarCausalLoop />
      </div>
    </DeshShell>
  );
}
