import type { Metadata } from "next";
import { AdmissionTest } from "@/components/media/academy/admission-test";
import { PageHeader, Panel } from "@/components/media/ui/layout";

export const metadata: Metadata = { title: "বিভাগে যোগ দিন · একাডেমি" };

export default async function AdmissionPage({ searchParams }: { searchParams: Promise<{ dept?: string }> }) {
  const { dept } = await searchParams;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        back={{ href: "/media/academy/departments", label: "সব বিভাগ" }}
        title="বিভাগে যোগ দিন"
        subtitle="বিনামূল্যে, দশ মিনিটের। কাউকে বাদ দেওয়া হয় না — আপনার লক্ষ্য, অভিজ্ঞতা আর চারটি বাস্তব প্রশ্নে ঠিক হয় কোন স্তর থেকে শুরু করবেন।"
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <AdmissionTest initialDept={dept} />
        <Panel as="aside" title="যোগ দেওয়ার নিয়ম" className="lg:sticky lg:top-0 lg:self-start">
          <ul className="space-y-3 text-sm leading-relaxed text-white/85">
            <li>বিভাগে যোগ দেওয়া বিনামূল্যে। কোর্সে ঢুকলে শুধু সেই কোর্সের ফি।</li>
            <li>বয়স, লিঙ্গ বা আগের সার্টিফিকেট লাগে না। যে শিখতে চায়, সে-ই ছাত্র।</li>
            <li>তিন বছরের বেশি কাজ আর কাজের প্রমাণ থাকলে কোর্স ছাড়াই ফাইনালে বসতে পারেন।</li>
            <li>যতগুলো খুশি বিভাগে যোগ দিতে পারেন — প্রতিটির জন্য আলাদা চার প্রশ্ন।</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
