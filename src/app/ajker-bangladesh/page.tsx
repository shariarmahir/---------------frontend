import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NewsFeed } from "@/components/news/news-feed";
import { NewsMasthead } from "@/components/news/news-masthead";
import { NewsSubmit } from "@/components/news/news-submit";

export const metadata: Metadata = {
  title: "আজকের বাংলাদেশ | National News Index — কাণ্ডারী-ল্যাব",
  description:
    "A single index of what Bangladesh is reporting today — short summaries drawn from newspapers, broadcast, online portals, social channels and citizen reports, each linking back to its source.",
};

export default function AjkerBangladeshPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-slate-50 pt-header lg:pt-header-lg">
        <NewsMasthead />
        <NewsFeed />
        <NewsSubmit />
      </main>
      <SiteFooter />
    </>
  );
}
