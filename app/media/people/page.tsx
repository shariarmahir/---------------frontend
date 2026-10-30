import type { Metadata } from "next";
import { Suspense } from "react";
import { PeopleDirectory } from "@/components/media/feed/people-directory";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "মানুষ" };

export default function PeoplePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-3xl" />}>
        <PeopleDirectory />
      </Suspense>
    </div>
  );
}
