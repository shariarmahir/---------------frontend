import type { Metadata } from "next";
import { Onboarding } from "@/components/media/onboarding/onboarding";
import { PageHeader } from "@/components/media/ui/layout";
import { categories } from "@/data/media/categories";
import { people } from "@/data/media/users";

export const metadata: Metadata = { title: "অ্যাকাউন্ট খুলুন" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="শিক্ষিতদের মিডিয়ায় যোগ দিন"
        subtitle="তিন ধাপ: পরিচয় যাচাই, দক্ষতার বিভাগ, প্রোফাইল। সার্টিফিকেট লাগবে না — কাজই প্রমাণ।"
      />
      <Onboarding categories={categories.map(({ id, bn, blurb }) => ({ id, bn, blurb }))} takenHandles={people.map((p) => p.handle)} />
    </div>
  );
}
