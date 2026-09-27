import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { RouteGuard } from "@/components/auth/route-guard";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "আমার অ্যাকাউন্ট | কাণ্ডারী-ল্যাব",
  description: "Kandari Profile — আপনার আগ্রহের খাত, অনুসরণ করা পণ্য, নোটিফিকেশন ও নিরাপত্তা।",
  robots: { index: false },
};

/** Kandari Profile — the subscriber dashboard (CLAUDE.md §5, §7). Signed-in only. */
export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh w-full bg-mint-subtle/50 pt-header lg:pt-header-lg">
        <RouteGuard>
          <Suspense fallback={null}>
            <AccountDashboard />
          </Suspense>
        </RouteGuard>
      </main>
      <SiteFooter />
    </>
  );
}
