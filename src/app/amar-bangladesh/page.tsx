import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AmarBaseline } from "@/components/amar/amar-baseline";
import { AmarCausalLoop } from "@/components/amar/amar-causal-loop";
import { AmarEmergency } from "@/components/amar/amar-emergency";
import { AmarHero } from "@/components/amar/amar-hero";
import { AmarLossProjection } from "@/components/amar/amar-loss-projection";
import { AmarPriorityBreaks } from "@/components/amar/amar-priority-breaks";
import { AmarRegister } from "@/components/amar/amar-register";
import { AmarRoadmap } from "@/components/amar/amar-roadmap";

export const metadata: Metadata = {
  title: "বাংলাদেশের-রোগ | National Issue Dossier — কাণ্ডারী-ল্যাব",
  description:
    "A structural diagnosis of 32 national issues with measured evidence, causal analysis, loss projection to 2050, and a staged reform architecture.",
};

export default function AmarBangladeshPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-surface pt-header lg:pt-header-lg">
        <AmarHero />
        <AmarBaseline />
        <AmarPriorityBreaks />
        <AmarCausalLoop />
        <AmarLossProjection />
        <AmarEmergency />
        <AmarRegister />
        <AmarRoadmap />
      </main>
      <SiteFooter />
    </>
  );
}
