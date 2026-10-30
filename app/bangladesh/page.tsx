/*
 * THESIS: Bangladesh as a low-resolution image: every unsolved problem is
 * one bad pixel, and the map is fixed one sector at a time.
 * OWN-WORLD: the main landing page's dress: pitch-black ground, solid
 * navy, ink and cobalt cards, gold titles and buttons, red for urgency only.
 * STORY: the country at a glance, measured honestly (National Index), what
 * we love, what threatens it, the 32 problems, what solving looks like,
 * your part, and where to go deeper. Each summary opens a full chapter.
 * FORM: hub and chapters (spec 2026-10-28-bangladesh-landing-design.md).
 */
import type { Metadata } from "next";
import { LandingAtAGlance } from "@/components/bangladesh-landing/at-a-glance";
import { BangladeshShell } from "@/components/bangladesh-landing/chapter-shell";
import { LandingCountry } from "@/components/bangladesh-landing/country";
import { LandingGoDeeper } from "@/components/bangladesh-landing/go-deeper";
import { LandingHero } from "@/components/bangladesh-landing/hero";
import { LandingNationalIndex } from "@/components/bangladesh-landing/national-index";
import { LandingProblems } from "@/components/bangladesh-landing/problems";
import { LandingSolutions } from "@/components/bangladesh-landing/solutions";
import { LandingThreats } from "@/components/bangladesh-landing/threats";
import { LandingYourPart } from "@/components/bangladesh-landing/your-part";

export const metadata: Metadata = {
  title: "Bangladesh | Kandari-Lab",
  description:
    "Bangladesh's national landing page: the country's story, the National Index, its 32 structural problems with evidence, and what solving them looks like.",
};

export default function BangladeshPage() {
  return (
    <BangladeshShell>
      <LandingHero />
      <LandingAtAGlance />
      <LandingNationalIndex />
      <LandingCountry />
      <LandingThreats />
      <LandingProblems />
      <LandingSolutions />
      <LandingYourPart />
      <LandingGoDeeper />
    </BangladeshShell>
  );
}
