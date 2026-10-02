import type { Metadata } from "next";
import { SubmitForm } from "@/components/research/submit-form";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "গবেষণা প্রকাশ করুন — গবেষণাকোষ" };

const RULES = [
  { icon: "verified_user", title: "নিজের কাজ", body: "আপনি বা আপনার দল যা করেছেন, তা-ই প্রকাশ করুন। সহলেখকদের সম্মতি নিন।" },
  { icon: "fact_check", title: "সৎ তথ্য", body: "তথ্য বানানো বা বদলানো চলবে না। যা পাননি, তা লিখবেন না; সীমাবদ্ধতা স্পষ্ট করুন।" },
  { icon: "menu_book", title: "সূত্র দিন", body: "অন্যের তথ্য, লেখা বা ছবি ব্যবহার করলে তথ্যসূত্রে উল্লেখ করুন।" },
  { icon: "shield_person", title: "মানুষের গোপনীয়তা", body: "জরিপ বা সাক্ষাৎকারের অংশগ্রহণকারীদের নাম, ফোন বা ঠিকানা প্রকাশ করবেন না।" },
  { icon: "rate_review", title: "পর্যালোচনা", body: "প্রতিটি জমা পর্যালোচকেরা দেখেন; প্রয়োজনে আলোচনা পাতায় প্রশ্ন বা পরামর্শ আসবে।" },
  { icon: "public", title: "সবার জন্য খোলা", body: "প্রকাশিত নিবন্ধ যে কেউ পড়তে ও সূত্রসহ উদ্ধৃত করতে পারবেন।" },
];

export default function ResearchSubmitPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      <div className="min-w-0 space-y-4">
        <header className="pb-2">
          <p className="text-sm font-bold text-signal-orange">বিনামূল্যে, সবার জন্য খোলা</p>
          <h1 className="font-wiki mt-1 text-[clamp(2.2rem,5vw,3.4rem)] leading-tight font-bold text-white">গবেষণা প্রকাশ করুন</h1>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-white/70">থিসিস, গবেষণাপত্র, উদ্ভাবন বা প্রকল্প — স্কুল থেকে পিএইচডি, বা স্বাধীন গবেষক। লিখুন সহজ ভাষায়, যাতে দেশের যে কেউ বুঝতে পারেন।</p>
        </header>
        <SubmitForm />
      </div>
      <aside id="rules" aria-labelledby="rules-title" className="scroll-mt-56 rounded-[1.75rem] bg-white/[0.04] p-5 ring-1 ring-white/10 xl:sticky xl:top-[calc(var(--spacing-header-lg)+1rem)]">
        <h2 id="rules-title" className="font-wiki flex items-center gap-2 text-xl font-bold text-white"><Icon name="gavel" className="text-[22px] text-signal-orange" /> প্রকাশের নিয়ম</h2>
        <ul className="mt-4 space-y-4">
          {RULES.map((r) => (
            <li key={r.title} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-signal-orange text-text-primary"><Icon name={r.icon} className="text-[20px]" /></span>
              <span><span className="block font-bold text-white">{r.title}</span><span className="mt-0.5 block text-sm leading-relaxed text-white/70">{r.body}</span></span>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-2xl bg-signal-orange p-4 text-sm leading-relaxed font-semibold text-text-primary">প্রকাশের পর নিবন্ধ থেকেই এক চাপে কাণ্ডারী ফিড, ফেসবুক, লিংকডইন, হোয়াটসঅ্যাপে শেয়ার করতে পারবেন; পাঠকের প্রতিক্রিয়া, মন্তব্য আর শেয়ারে আপনার পয়েন্ট বাড়বে।</p>
      </aside>
    </div>
  );
}
