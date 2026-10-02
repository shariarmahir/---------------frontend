import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Noto_Sans_Bengali } from "next/font/google";
import { RouteGuard } from "@/components/auth/route-guard";
import { Toaster } from "@/components/ui/sonner";
import { BottomTabs, LeftRail } from "@/components/media/shell/nav";
import { TopBar } from "@/components/media/shell/top-bar";
import { NumeralsProvider } from "@/components/media/ui/numerals";
import { UsageTracker } from "@/components/media/wellbeing/usage";
import { NUMERALS_COOKIE } from "@/lib/media/numerals-cookie";
import { threads } from "@/data/media/chat";
import { CURRENT_USER_HANDLE } from "@/data/media/users";

/**
 * Bangla in Noto Sans Bengali. It is registered under the same variable the
 * site's Bengali face uses, so inside /media `font-sans` resolves to
 * Inter (Latin, digits) → Noto Sans Bengali (Bangla), per glyph.
 */
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "শিক্ষিতদের মিডিয়া — দক্ষতা · প্রমাণ · সুযোগ", template: "%s · শিক্ষিতদের মিডিয়া" },
  description: "দক্ষতা পোস্ট করুন, নিজেকে রেটিং দিন, কমিউনিটি যাচাই করবে — তারপর প্রোফাইল থেকেই সরাসরি কাজ পান।",
};

const unreadSeed = Object.fromEntries(threads.filter((t) => t.unread > 0).map((t) => [t.id, t.unread]));

export default async function MediaLayout({ children }: { children: React.ReactNode }) {
  const numerals = (await cookies()).get(NUMERALS_COOKIE)?.value === "latn" ? "latn" : "bn";
  return (
    <NumeralsProvider initial={numerals}>
      {/* Members only: proxy.ts redirects signed-out visitors to /login before
          this renders; the guard re-checks the browser session. */}
      <RouteGuard>
        <div className={`${notoBengali.variable} media-shell min-h-dvh w-full bg-black font-sans text-white`}>
          <a
            href="#media-main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-signal-orange focus:px-4 focus:py-2 focus:font-semibold focus:text-text-primary"
          >
            মূল বিষয়ে যান
          </a>
          <TopBar unreadSeed={unreadSeed} />
          <div className="mx-auto flex w-full max-w-350 gap-6 px-3 lg:px-6">
            <LeftRail unreadSeed={unreadSeed} me={CURRENT_USER_HANDLE} />
            <main id="media-main" className="min-w-0 flex-1 pt-6 pb-28 lg:pb-12 print:p-0">
              {children}
            </main>
          </div>
          <BottomTabs me={CURRENT_USER_HANDLE} />
          <UsageTracker />
          <Toaster
            toastOptions={{
              classNames: {
                toast: "!rounded-2xl !border-white/12 !bg-text-primary !font-sans !text-white !shadow-[0_18px_40px_-16px_rgb(0_0_0/0.8)]",
                description: "!text-white/75",
                success: "[&_[data-icon]]:!text-signal-orange",
                error: "[&_[data-icon]]:!text-crimson-bright",
              },
            }}
          />
        </div>
      </RouteGuard>
    </NumeralsProvider>
  );
}
