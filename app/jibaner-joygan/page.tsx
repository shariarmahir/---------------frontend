import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { FeedComposer, FeedTabs } from "@/components/feed/feed-composer";
import { FeedAside, FeedSidebar } from "@/components/feed/feed-rails";
import {
  FeedEnd,
  PostCivic,
  PostCleanroom,
  PostFirmware,
  PostPharmacy,
  PostTelemetry,
} from "@/components/feed/feed-posts";

export const metadata: Metadata = {
  title: "জীবনের জয়গান | জাতীয় উদ্ভাবন ফিড — কাণ্ডারী-ল্যাব",
  description:
    "কাণ্ডারী-ল্যাবের জাতীয় উদ্ভাবন ফিড — নাগরিক সমস্যা, স্বাস্থ্য টেলিমেট্রি, ওপেন-সোর্স হার্ডওয়্যার ও ৬৪ জেলার লাইভ আপডেট।",
};

export default function JibanerJoyganPage() {
  return (
    <>
      <SiteHeader />

      {/* The rails are fixed below the header, so the centre column carries
          the same offset and sits between them. */}
      <FeedSidebar />
      <FeedAside />

      <main className="min-h-screen w-full bg-mint-subtle/40 pt-header lg:pt-header-lg lg:pl-72 xl:pr-80">
        <FeedTabs />

        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-space-lg px-space-md py-space-lg">
          <FeedComposer />
          <PostTelemetry />
          <PostFirmware />
          <PostCivic />
          <PostPharmacy />
          <PostCleanroom />
          <FeedEnd />
        </div>
      </main>
    </>
  );
}
