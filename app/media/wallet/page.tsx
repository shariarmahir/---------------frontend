import type { Metadata } from "next";
import { Suspense } from "react";
import { BuyerFees } from "@/components/media/market/trade";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Taka } from "@/components/media/ui/numerals";
import { WalletSkeleton } from "@/components/media/ui/skeletons";
import { WalletView } from "@/components/media/wallet/wallet-view";
import { walletSeed } from "@/data/media/wallet";

export const metadata: Metadata = { title: "ওয়ালেট" };

export default function WalletPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="ওয়ালেট" subtitle="বিক্রি আর কাজের আয় এক জায়গায়। প্রতিটি লেনদেনে ফি কত কাটল, তা খোলাখুলি দেখানো হয়।" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Suspense fallback={<WalletSkeleton />}>
          <WalletView seed={walletSeed} />
        </Suspense>
        <aside className="space-y-4">
          <Panel title="ফি কীভাবে কাটে">
            <p className="mb-3 text-sm text-text-secondary"><Taka amount={1000} />-এর একটি বিক্রিতে ক্রেতা দেন ও বিক্রেতা পান:</p>
            <BuyerFees price={1000} />
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              বিক্রেতার দিক থেকে ৫% প্ল্যাটফর্ম ফি, ক্রেতার দিক থেকে ৫% সেবা চার্জ (পেমেন্ট গেটওয়েসহ)। টাকা তোলায় ফি নেই, লুকানো চার্জ নেই।
            </p>
          </Panel>
          <Panel title="এসক্রো কীভাবে কাজ করে">
            <ol className="space-y-2 text-sm text-text-secondary">
              <li>১. চুক্তি বা কেনার সময় টাকা প্ল্যাটফর্মে জমা থাকে।</li>
              <li>২. বিক্রেতা কাজ বা পণ্য ডেলিভারি দেন।</li>
              <li>৩. আপনি ‘বুঝে পেয়েছি’ চাপলে বিক্রেতার ওয়ালেটে যায়।</li>
            </ol>
          </Panel>
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-950">ডেমো: আসল টাকা লেনদেন হয় না। আসল সংস্করণে এসএসএলকমার্জ, বিকাশ, নগদ ও বাংলা কিউআর যুক্ত হবে।</p>
        </aside>
      </div>
    </div>
  );
}
