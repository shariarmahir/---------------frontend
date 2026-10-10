import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Hind_Siliguri, Noto_Sans_Bengali } from "next/font/google";
import { RouteGuard } from "@/components/auth/route-guard";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { Toaster } from "@/components/ui/sonner";
import { BottomTabs, LeftRail } from "@/components/media/shell/nav";
import { ACADEMY_FACES } from "@/components/media/ui/fonts";
import { TopBar } from "@/components/media/shell/top-bar";
import { LanguageProvider } from "@/components/media/ui/language";
import { NumeralsProvider } from "@/components/media/ui/numerals";
import { MediaThemeShell } from "@/components/media/ui/theme";
import { UsageTracker } from "@/components/media/wellbeing/usage";
import { LANG_COOKIE, readLang } from "@/lib/media/language";
import { NUMERALS_COOKIE } from "@/lib/media/numerals-cookie";
import { THEME_COOKIE, readTheme } from "@/lib/media/theme";
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

/**
 * Headings in the academy's face (fonts.ts): Archivo stretched for Latin and
 * digits, Hind Siliguri for Bangla. Only the bold weights are loaded.
 */
const hind = Hind_Siliguri({ subsets: ["bengali"], weight: ["600", "700"], variable: "--font-m-hind", display: "swap" });

export const metadata: Metadata = {
  title: { default: "শিক্ষিতদের মিডিয়া — দক্ষতা · প্রমাণ · সুযোগ", template: "%s · শিক্ষিতদের মিডিয়া" },
  description: "দক্ষতা পোস্ট করুন, নিজেকে রেটিং দিন, কমিউনিটি যাচাই করবে — তারপর প্রোফাইল থেকেই সরাসরি কাজ পান।",
};

const unreadSeed = Object.fromEntries(threads.filter((t) => t.unread > 0).map((t) => [t.id, t.unread]));

export default async function MediaLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const lang = readLang(jar.get(LANG_COOKIE)?.value);
  const numerals = jar.get(NUMERALS_COOKIE)?.value === "latn" || lang === "en" ? "latn" : "bn";
  const theme = readTheme(jar.get(THEME_COOKIE)?.value);
  return (
    <NumeralsProvider initial={numerals}>
      <LanguageProvider initial={lang}>
        {/* Members only: proxy.ts redirects signed-out visitors to /login before
          this renders; the guard re-checks the browser session. */}
        <RouteGuard>
          <MediaThemeShell initial={theme} className={`${notoBengali.variable} ${hind.variable} ${ACADEMY_FACES} media-shell min-h-dvh w-full bg-m-ground font-sans text-m-ink`}>
            <a
              href="#media-main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-m-yellow focus:px-4 focus:py-2 focus:font-semibold focus:text-m-ink"
            >
              মূল বিষয়ে যান
            </a>
            <SmoothScroll except="/media/academy" />
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
                  toast: "!rounded-2xl !border-m-ink/10 !bg-m-card !font-sans !text-m-ink !shadow-[0_18px_40px_-16px_rgb(16_24_40/0.24)]",
                  description: "!text-m-ink/75",
                  success: "[&_[data-icon]]:!text-m-green",
                  error: "[&_[data-icon]]:!text-m-red",
                },
              }}
            />
          </MediaThemeShell>
        </RouteGuard>
      </LanguageProvider>
    </NumeralsProvider>
  );
}
