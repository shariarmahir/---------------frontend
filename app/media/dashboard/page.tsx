import type { Metadata } from "next";
import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { ArrowUpRight, Settings } from "lucide-react";
import { DashboardStats } from "@/components/media/dashboard/stats";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Num } from "@/components/media/ui/numerals";
import { RatingPair } from "@/components/media/ui/trust";
import { DailyPlan } from "@/components/media/wellbeing/daily-plan";
import { certificatesFor } from "@/data/media/certificates";
import { currentUser } from "@/data/media/users";

export const metadata: Metadata = { title: "ড্যাশবোর্ড" };

export default function DashboardPage() {
  const certs = certificatesFor(currentUser);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="ড্যাশবোর্ড"
        subtitle="আপনার আয়, কাজ, যাচাই করা দক্ষতা আর সময় — এক নজরে।"
        actions={
          <Link href="/media/settings" className={mediaButton({ variant: "quiet" })}>
            <Settings aria-hidden /> গোপনীয়তা ও সময়
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <DashboardStats />

          <Panel title={<span id="certificates">সার্টিফিকেট</span>}>
            {certs.length === 0 ? (
              <p className="text-sm text-text-muted">কোনো দক্ষতা এখনো কমিউনিটি-যাচাইকৃত হয়নি। কাজের প্রমাণ পোস্ট করুন — ৫ জনের রেটিং মিললেই সনদ।</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {certs.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/media/certificate/${currentUser.handle}/${c.n}`}
                      className="flex items-center gap-3 rounded-xl border border-bd-green/25 bg-bd-green-light/40 p-3 transition-colors hover:border-bd-green/50"
                    >
                      <SealCheck size={36} weight="duotone" className="shrink-0 text-bd-green" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-text-primary">{c.skill.skill}</span>
                        <span className="block text-xs text-text-muted">
                          <Num value={c.skill.raters} /> জনের যাচাই · {c.id}
                        </span>
                      </span>
                      <ArrowUpRight className="size-4 text-text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="দক্ষতা — দাবি বনাম যাচাই">
            <ul className="grid gap-5 md:grid-cols-2">
              {currentUser.skills.map((s) => (
                <li key={s.skill} className="space-y-2">
                  <p className="text-sm font-bold text-text-primary">{s.skill}</p>
                  <RatingPair self={s.self} communityAvg={s.communityAvg} raters={s.raters} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <DailyPlan />
        </aside>
      </div>
    </div>
  );
}
