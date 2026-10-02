import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Settings } from "lucide-react";
import { BusinessOverview } from "@/components/media/dashboard/business";
import { DashboardStats } from "@/components/media/dashboard/stats";
import { BuyerFees } from "@/components/media/market/trade";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Num, Taka } from "@/components/media/ui/numerals";
import { WalletSkeleton } from "@/components/media/ui/skeletons";
import { Stars } from "@/components/media/ui/trust";
import { TransactionsButton, WalletView } from "@/components/media/wallet/wallet-view";
import { DailyPlan } from "@/components/media/wellbeing/daily-plan";
import { currentUser } from "@/data/media/users";
import { walletSeed } from "@/data/media/wallet";

export const metadata: Metadata = { title: "মাটির ব্যাংক" };

/** One screen for money and work: balance, shop numbers, activity and skills; the ledger opens from the header. */
export default function DashboardPage() {
  // One community rating across all skills, weighted by how many people rated each.
  const raters = currentUser.skills.reduce((n, s) => n + s.raters, 0);
  const rating = raters ? currentUser.skills.reduce((n, s) => n + s.communityAvg * s.raters, 0) / raters : 0;
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="মাটির ব্যাংক"
        subtitle="ব্যালান্স, রাজস্ব, আয়, বিক্রি আর অর্ডার — সঙ্গে প্রতিটি লেনদেন আর কাজের হিসাব, এক স্ক্রিনে।"
        actions={
          <>
            <Suspense fallback={null}>
              <TransactionsButton seed={walletSeed} />
            </Suspense>
            <Link href="/media/settings" className={mediaButton({ variant: "quiet" })}>
              <Settings aria-hidden /> গোপনীয়তা ও সময়
            </Link>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Suspense fallback={<WalletSkeleton />}>
            <WalletView seed={walletSeed} />
          </Suspense>
          <BusinessOverview />

          <section aria-labelledby="activity" className="space-y-3">
            <h2 id="activity" className="text-lg font-bold text-white">কার্যকলাপ</h2>
            <DashboardStats />
          </section>

          <Panel title="দক্ষতার রেটিং">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-4xl font-bold text-signal-orange"><Num value={rating} decimals={1} /></span>
              <span className="space-y-1">
                <Stars value={rating} size={22} />
                <span className="block text-sm text-white/70">
                  <Num value={currentUser.skills.length} />টি দক্ষতা · <Num value={raters} /> জনের যাচাই
                </span>
              </span>
            </div>
          </Panel>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <DailyPlan />
          <Panel title="ফি কীভাবে কাটে">
            <p className="mb-3 text-sm text-white/80"><Taka amount={1000} />-এর একটি বিক্রিতে ক্রেতা দেন ও বিক্রেতা পান:</p>
            <BuyerFees price={1000} />
            <p className="mt-3 text-xs leading-relaxed text-white/65">
              বিক্রেতার দিক থেকে ৫% প্ল্যাটফর্ম ফি, ক্রেতার দিক থেকে ৫% সেবা চার্জ (পেমেন্ট গেটওয়েসহ)। টাকা তোলায় ফি নেই, লুকানো চার্জ নেই।
            </p>
          </Panel>
          <Panel title="এসক্রো কীভাবে কাজ করে">
            <ol className="space-y-2 text-sm text-white/80">
              <li>১. চুক্তি বা কেনার সময় টাকা প্ল্যাটফর্মে জমা থাকে।</li>
              <li>২. বিক্রেতা কাজ বা পণ্য ডেলিভারি দেন।</li>
              <li>৩. আপনি ‘বুঝে পেয়েছি’ চাপলে বিক্রেতার ওয়ালেটে যায়।</li>
            </ol>
          </Panel>
          <p className="rounded-xl bg-signal-orange p-3 text-xs text-text-primary">ডেমো: আসল টাকা লেনদেন হয় না। আসল সংস্করণে এসএসএলকমার্জ, বিকাশ, নগদ ও বাংলা কিউআর যুক্ত হবে।</p>
        </aside>
      </div>
    </div>
  );
}
