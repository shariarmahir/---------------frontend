/*
 * THESIS: Bangladesh as a low-resolution image. The page moves from love
 * (the story) to attack (the crisis) to shield (the citizen) to the 32 bad
 * pixels to their repair, instead of a problem/solution landing page of
 * equal icon cards.
 * OWN-WORLD: night bottle-green fields (bdgreen-950) with harvest-gold glow
 * and the flag's red for anything broken; the story keeps its paper cream;
 * the pixel square is the motif, from map to bullets to the 32 tiles.
 * STORY: see what we love, feel what threatens it, learn our own part,
 * see each problem with its evidence, leave with realistic, brave work.
 * FIRST VIEWPORT: title left with the four acts as jump cards; the glowing
 * pixel map right, 32 red pixels flickering; facts rule beneath.
 * FORM: long-form national chapter book in four acts, structure pinned by
 * the founder's brief (2026-09-27).
 */
import type { Metadata } from "next";
import { BdCulture, BdIcons } from "@/components/bangladesh/bd-culture";
import { BdGrowth } from "@/components/bangladesh/bd-growth";
import { BdHistory } from "@/components/bangladesh/bd-history";
import { BdMap } from "@/components/bangladesh/bd-map";
import { BdMemories } from "@/components/bangladesh/bd-memories";
import { BdNature, BdSeasons } from "@/components/bangladesh/bd-nature";
import { BdCredits, BdPride } from "@/components/bangladesh/bd-pride";
import { AmarBaseline } from "@/components/amar/amar-baseline";
import { AmarCausalLoop } from "@/components/amar/amar-causal-loop";
import { AmarEmergency } from "@/components/amar/amar-emergency";
import { AmarLossProjection } from "@/components/amar/amar-loss-projection";
import { AmarPriorityBreaks } from "@/components/amar/amar-priority-breaks";
import { AmarRoadmap } from "@/components/amar/amar-roadmap";
import { ActOpener } from "@/components/desh/act-opener";
import { CitizenShield } from "@/components/desh/citizen-shield";
import { CrisisAttacks } from "@/components/desh/crisis-attacks";
import { DeshHero } from "@/components/desh/desh-hero";
import { ProblemPixels } from "@/components/desh/problem-pixels";
import { ResearchCard } from "@/components/desh/research-card";
import { RuralLives } from "@/components/desh/rural-lives";
import { SolutionClose, SolutionDuties, SolutionLetGo, SolutionResources } from "@/components/desh/solutions";
import { SummaryPlaceholder } from "@/components/desh/summary-placeholder";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NationalIndexSection } from "@/components/sections/national-index-section";
import { ruralBackdrops } from "@/data/rural-life";

export const metadata: Metadata = {
  title: "বাংলাদেশ সমস্যা ও সমাধান | কাণ্ডারী-ল্যাব",
  description:
    "বাংলাদেশের ইতিহাস ও প্রকৃতি, সামনের জাতীয় সংকট, নাগরিকের ঢাল, প্রমাণসহ ৩২টি বাস্তব সমস্যা আর দয়া, দায়িত্ব ও সাহসের বাস্তব সমাধান — এক পাতায়।",
};

const harvestDusk = { src: "/hero/Hero-3.jpg", alt: "গোধূলিতে ধানক্ষেতের আলপথ ধরে মাথায় খড়ের আঁটি নিয়ে হেঁটে চলেছেন কৃষকেরা" };

export default function BangladeshPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        <DeshHero />

        {/* ১ · আমার বাংলাদেশ */}
        <ActOpener act="amar-desh" photo={harvestDusk} />
        <div className="bg-grid-subtle">
          <BdHistory />
          <BdMap />
          <BdNature />
          <BdSeasons />
          <BdCulture />
          <BdIcons />
          <BdGrowth />
          <BdPride />
          <BdMemories />
        </div>

        {/* ২ · সংকট ও ঢাল */}
        <ActOpener act="crisis" photo={ruralBackdrops.floodBoat} />
        <CrisisAttacks />
        <AmarLossProjection />
        <AmarEmergency />
        <AmarCausalLoop />
        <CitizenShield />
        <SummaryPlaceholder />

        {/* ৩ · সমস্যা */}
        <ActOpener act="problems" photo={ruralBackdrops.erosionWalk} />
        <NationalIndexSection />
        <AmarBaseline />
        <AmarPriorityBreaks />
        <RuralLives />
        <ProblemPixels />

        {/* ৪ · সমাধান */}
        <ActOpener act="solutions" photo={ruralBackdrops.farmerCattle} />
        <SolutionResources />
        <SolutionLetGo />
        <SolutionDuties />
        <AmarRoadmap />
        <SolutionClose />

        <ResearchCard />
        <BdCredits />
      </main>
      <SiteFooter />
    </>
  );
}
