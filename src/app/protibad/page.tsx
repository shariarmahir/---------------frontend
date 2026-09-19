import type { Metadata } from "next";
import { ComplaintFeed } from "@/components/complaints/complaint-feed";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { ComplaintMasthead } from "@/components/complaints/complaint-masthead";
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
      <main className="w-full bg-white pt-header lg:pt-header-lg">
        <ComplaintMasthead />
        <ComplaintForm />
        <StationFinder />
        <ComplaintFeed />
      </main>
      <SiteFooter />
    </>
  );
}
