import type { Metadata } from "next";
import { Suspense } from "react";
import { PostForm } from "@/components/media/post/post-form";
import { PageHeader } from "@/components/media/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "পোস্ট তৈরি করুন" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="পোস্ট তৈরি করুন"
        subtitle="জীবনের মুহূর্ত, প্রতিভা, ভাবনা বা কাজের প্রমাণ — যা খুশি। দক্ষতা যাচাই করাতে চাইলে ‘যাচাই’ চিহ্নের বিষয় বেছে নিন।"
        back={{ href: "/media", label: "ফিড" }}
      />
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-2xl" />}>
        <PostForm />
      </Suspense>
    </div>
  );
}
