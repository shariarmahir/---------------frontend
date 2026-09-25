import type { Metadata } from "next";
import { Suspense } from "react";
import { PostForm } from "@/components/media/post/post-form";
import { PageHeader } from "@/components/media/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "দক্ষতা পোস্ট করুন" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="দক্ষতা পোস্ট করুন"
        subtitle="কাজ দেখান, নিজেকে রেটিং দিন — তারপর কমিউনিটি যাচাই করবে। বিক্রি করতে চাইলে দামও দিন।"
        back={{ href: "/media", label: "ফিড" }}
      />
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-2xl" />}>
        <PostForm />
      </Suspense>
    </div>
  );
}
