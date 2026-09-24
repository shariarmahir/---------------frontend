import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BdCulture, BdIcons } from "@/components/bangladesh/bd-culture";
import { BdGrowth } from "@/components/bangladesh/bd-growth";
import { BdHero } from "@/components/bangladesh/bd-hero";
import { BdHistory } from "@/components/bangladesh/bd-history";
import { BdMap } from "@/components/bangladesh/bd-map";
import { BdMemories } from "@/components/bangladesh/bd-memories";
import { BdNature, BdSeasons } from "@/components/bangladesh/bd-nature";
import { BdCredits, BdPride } from "@/components/bangladesh/bd-pride";

export const metadata: Metadata = {
  title: "আমার বাংলাদেশ — ইতিহাস, প্রকৃতি, সংস্কৃতি ও অগ্রযাত্রা | কাণ্ডারী-ল্যাব",
  description:
    "পুণ্ড্রনগর থেকে একাত্তরের বিজয়, সুন্দরবন থেকে সাজেক, বাউল থেকে বোস–আইনস্টাইন — বাংলাদেশের গল্প, মানচিত্র আর ১৯৭১ থেকে ২০২৬-এর অগ্রযাত্রা।",
};

export default function BangladeshPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        <BdHero />
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
      </main>
      <SiteFooter />
    </>
  );
}
