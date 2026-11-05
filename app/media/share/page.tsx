import type { Metadata } from "next";
import { Suspense } from "react";
import { ShareComposer } from "@/components/media/share/share-composer";
import { PageHeader } from "@/components/media/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "ফিডে শেয়ার করুন" };

/** Where other parts of the site send something to be posted on the feed (e.g. a গবেষণাকোষ article). */
export default function SharePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="ফিডে শেয়ার করুন" subtitle="নিজের কথা যোগ করুন, তারপর পোস্ট করুন — লিংকটি কার্ড হয়ে পোস্টের নিচে থাকবে।" back={{ href: "/media", label: "ফিড" }} />
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <ShareComposer />
      </Suspense>
    </div>
  );
}
