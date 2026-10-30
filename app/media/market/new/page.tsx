import type { Metadata } from "next";
import { Suspense } from "react";
import { BazaarForm } from "@/components/media/market/bazaar-form";
import { PageHeader } from "@/components/media/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "সরাসরি বিক্রি" };

export default function NewBazaarPostPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="সরাসরি বিক্রি"
        subtitle="নিজের দোকানের মতো পূর্ণ তালিকা — চার ধাপে। হ্যাশট্যাগ দিলে বোর্ডের ক্রেতারা নিজেরাই খুঁজে পান।"
        back={{ href: "/media/market", label: "বাজার" }}
      />
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-3xl" />}>
        <BazaarForm />
      </Suspense>
    </div>
  );
}
