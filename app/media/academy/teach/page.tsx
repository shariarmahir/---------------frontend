import type { Metadata } from "next";
import { TeachApply } from "@/components/media/academy/teach-apply";
import { PageHeader, Panel } from "@/components/media/ui/layout";

export const metadata: Metadata = { title: "শিক্ষক হোন · একাডেমি" };

export default async function TeachPage({ searchParams }: { searchParams: Promise<{ dept?: string }> }) {
  const { dept } = await searchParams;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        back={{ href: "/media/academy", label: "একাডেমি" }}
        title="শিক্ষক হোন"
        subtitle="দেশে দক্ষ মানুষের অভাব — যিনি কাজ জানেন, তাঁর শেখানো দরকার। মেকানিক, শেফ, প্রকৌশলী, শিল্পী — প্রমাণ দিন, প্যানেলে শিখিয়ে দেখান, তারপর নিজের ব্যাচ।"
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <TeachApply initialDept={dept} />
        <div className="space-y-5 lg:sticky lg:top-0 lg:self-start">
          <Panel as="aside" title="যা দেখা হয়">
            <ul className="space-y-2.5 text-sm leading-relaxed text-m-ink/85">
              <li>পরিচয় যাচাই করা প্রোফাইল (এনআইডি বা পাসপোর্ট)।</li>
              <li>অন্তত ২ বছরের হাতে-কলমে কাজ।</li>
              <li>১০ মিনিটের নমুনা ক্লাস — বোঝানো যায় কি না।</li>
              <li>প্যানেলে একজন প্রধান শিক্ষক আর একজন বহিরাগত পেশাদার; আপনি ১৫ মিনিটে কিছু শিখিয়ে দেখান।</li>
              <li>কর্মশালা হলে প্যানেল গিয়ে জায়গার নিরাপত্তা দেখে।</li>
            </ul>
          </Panel>
          <Panel as="aside" title="আয় ও দায়">
            <ul className="space-y-2.5 text-sm leading-relaxed text-m-ink/85">
              <li>ফি আপনি ঠিক করেন; আপনি পান ৯৫%, ক্লাস হলে এসক্রো থেকে।</li>
              <li>চাইলে বিনা ফিতেও শেখাতে পারেন — দেশের দরকারে অনেকে তা-ই করছেন।</li>
              <li>র‍্যাংক ঠিক হয় পয়েন্টে: ইন্টারভিউ, রেটিং, গ্র্যাজুয়েট, সফলতার গল্প। তিনটি প্রমাণিত অভিযোগে শিক্ষকতা থামে।</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
