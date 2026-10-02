import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardForm } from "@/components/media/market/board-form";
import { PageHeader } from "@/components/media/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "চাহিদা বোর্ডে পোস্ট" };

export default function NewBoardPostPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="চাহিদা বোর্ডে পোস্ট"
        subtitle="যা বিক্রি করতে চান বা যা কিনতে চান — এক পাতায়। অন্য দিকের পোস্টের সাথে নিজেই মিলে যায়।"
        back={{ href: "/media/market?view=board", label: "চাহিদা বোর্ড" }}
      />
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-3xl" />}>
        <BoardForm />
      </Suspense>
    </div>
  );
}
