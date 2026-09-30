/*
 * THESIS: speaking up should take seconds — call first, file fast, and see
 * that you are not the only one.
 * OWN-WORLD: the home page's — pitch-black ground, solid gold / ink / bottle
 * green / orange fields, gold pixel-mark headings, the gold pulse on the ink
 * bands' seams; the flag's red carries urgency here and nowhere else.
 * FIRST VIEWPORT: the home hero's band — the claim with the gold file
 * action and the red 999 call, a live board of the latest reports, the ink
 * proof strip closing it.
 */
import type { Metadata } from "next";
import { ComplaintFeed } from "@/components/complaints/complaint-feed";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { ComplaintMasthead, EmergencyBand } from "@/components/complaints/complaint-masthead";
import { StationFinder } from "@/components/complaints/station-finder";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "প্রতিবাদ | Complaint Centre — কাণ্ডারী-ল্যাব",
  description:
    "Report extortion, bribery, land grabbing and service denial. Find the authority that handles your complaint, locate your nearest police station, and keep a public record.",
};

export default function ProtibadPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-black pt-header lg:pt-header-lg">
        <ComplaintMasthead />
        <EmergencyBand />
        <ComplaintForm />
        <StationFinder />
        <ComplaintFeed />
      </main>
      <SiteFooter />
    </>
  );
}
