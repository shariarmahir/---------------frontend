import type { Metadata } from "next";
import Link from "next/link";
import { AuthUI } from "@/components/ui/auth-ui";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "সদস্য পোর্টাল | কাণ্ডারী-ল্যাব",
  description:
    "কাণ্ডারী-ল্যাব সদস্য পোর্টালে সাইন ইন করুন — গবেষণা সাবস্ক্রিপশন, টেলিমেট্রি ড্যাশবোর্ড ও জাতীয় উদ্ভাবন নেটওয়ার্কে প্রবেশাধিকার।",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full bg-white">
      {/* The site header is a fixed floating card that would sit on top of
          this full-bleed layout, so the auth screen carries its own exit
          affordance instead of rendering <SiteHeader />. */}
      <Link
        href="/"
        className="absolute top-space-md left-space-md z-20 inline-flex items-center gap-space-xs rounded-lg border border-card-border bg-white/90 px-space-sm py-space-xs font-sans text-label-sm font-semibold text-text-secondary shadow-clean backdrop-blur-sm transition-colors hover:border-bd-green/40 hover:text-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/30 focus-visible:outline-none md:top-space-lg md:left-space-lg"
      >
        <Icon name="arrow_back" className="text-[16px]" />
        হোমে ফিরুন
      </Link>

      <AuthUI />
    </main>
  );
}
