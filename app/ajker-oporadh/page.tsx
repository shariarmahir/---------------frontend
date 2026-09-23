import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CrimeClips } from "@/components/crime/crime-clips";
import { CrimeGrid } from "@/components/crime/crime-grid";
import { CrimeLedger } from "@/components/crime/crime-ledger";
import { CrimeMasthead } from "@/components/crime/crime-masthead";
import { CrimeTaxonomy } from "@/components/crime/crime-taxonomy";

export const metadata: Metadata = {
  title: "আজকের অপরাধ | Daily Crime Index — কাণ্ডারী-ল্যাব",
  description:
    "বাংলাদেশের দৈনিক অপরাধ সূচক — শ্রেণি, ধারা ও স্থানসহ নথিভুক্ত ঘটনা। আদালতে দোষী সাব্যস্ত না হওয়া পর্যন্ত কারও পরিচয় প্রকাশ করা হয় না।",
};

export default function AjkerOporadhPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-slate-50 pt-header lg:pt-header-lg">
        <CrimeMasthead />
        <CrimeTaxonomy />
        <CrimeGrid />
        <CrimeClips />
        <CrimeLedger />
      </main>
      <SiteFooter />
    </>
  );
}
