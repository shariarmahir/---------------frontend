/*
 * THESIS: speaking up should take seconds, and nobody should feel they are
 * the only one: call first, write it right, keep the proof, and see what
 * the country is reporting today.
 * OWN-WORLD: the landing page's (Mahir, 2026-10-29): pitch-black ground,
 * navy / ink / cobalt fields, gold titles, animated Lordicons; red only
 * where something is urgent (999, violent crime, the recorder).
 * FIRST VIEWPORT: the claim with its three actions, and the live board of
 * crime news beside it; the day in four figures closes the band.
 * DATA: the live wire is the National TV Wall's real feed (/api/tv-wall);
 * the yearly figures are Police Headquarters counts as the press published
 * them (data/protibad.ts). Nothing on this page is invented.
 */
import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ConnectedBoards } from "@/components/protibad/connected-boards";
import { CrimeRecord } from "@/components/protibad/crime-record";
import { FileComplaint } from "@/components/protibad/file-complaint";
import { HelplineStrip } from "@/components/protibad/helpline-strip";
import { LiveCrime } from "@/components/protibad/live-crime";
import { ProtibadHero } from "@/components/protibad/protibad-hero";
import { StationFinder } from "@/components/protibad/station-finder";
import { WireProvider } from "@/components/protibad/wire";

export const metadata: Metadata = {
  title: "Protibad (প্রতিবাদ): report crime and injustice | Kandari-Lab",
  description:
    "Live crime news from across Bangladesh, five years of police case figures, the right office for every complaint, an evidence recorder, and the free national helplines.",
};

export default function ProtibadPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-black pt-header lg:pt-header-lg">
        <WireProvider>
          <ProtibadHero />
          <HelplineStrip />
          <LiveCrime />
        </WireProvider>
        <CrimeRecord />
        <FileComplaint />
        <StationFinder />
        <ConnectedBoards />
      </main>
      <SiteFooter />
    </>
  );
}
