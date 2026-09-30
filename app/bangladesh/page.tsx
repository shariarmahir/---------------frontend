/*
 * THESIS: Bangladesh as a low-resolution image. The section moves from love
 * (the story) to attack (the crisis) to shield (the citizen) to the 32 bad
 * pixels to their repair — one page each, walked in that order.
 * OWN-WORLD: night bottle-green fields (bdgreen-950) with harvest-gold glow
 * and the flag's red for anything broken; the story keeps its paper cream;
 * the pixel square is the motif, from map to bullets to the 32 tiles.
 * STORY: see what we love, feel what threatens it, learn our own part,
 * see each problem with its evidence, leave with realistic, brave work.
 * FIRST VIEWPORT: title left with the five chapters as page cards; the
 * glowing pixel map right, 32 red pixels flickering; facts rule beneath.
 * FORM: five pages, structure pinned by the founder's brief (2026-09-27),
 * split per header-nav item on 2026-09-30. This route is the first: ইতিহাস.
 */
import type { Metadata } from "next";
import { BdCulture, BdIcons } from "@/components/bangladesh/bd-culture";
import { BdGrowth } from "@/components/bangladesh/bd-growth";
import { BdHistory } from "@/components/bangladesh/bd-history";
import { BdMap } from "@/components/bangladesh/bd-map";
import { BdMemories } from "@/components/bangladesh/bd-memories";
import { BdNature, BdSeasons } from "@/components/bangladesh/bd-nature";
import { BdCredits, BdPride } from "@/components/bangladesh/bd-pride";
import { ActOpener } from "@/components/desh/act-opener";
import { DeshHero } from "@/components/desh/desh-hero";
import { DeshShell } from "@/components/desh/desh-shell";

export const metadata: Metadata = {
  title: "বাংলাদেশ সমস্যা ও সমাধান — ইতিহাস | কাণ্ডারী-ল্যাব",
  description:
    "বাংলাদেশের হাজার বছরের ইতিহাস, নদী-মাঠ-পাহাড়ের প্রকৃতি, ভাষা আর একাত্তরের গল্প — সমস্যা ও সমাধানের যাত্রার প্রথম অধ্যায়।",
};

const harvestDusk = { src: "/hero/Hero-3.jpg", alt: "গোধূলিতে ধানক্ষেতের আলপথ ধরে মাথায় খড়ের আঁটি নিয়ে হেঁটে চলেছেন কৃষকেরা" };

export default function BangladeshPage() {
  return (
    <DeshShell current="/bangladesh">
      <DeshHero />

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
      <BdCredits />
    </DeshShell>
  );
}
