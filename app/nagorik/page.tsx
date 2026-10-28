/*
 * Citizen Rights and Duties, in English and in the /bangladesh dress:
 * the measured day (BBS Time-Use Survey 2021) → the rights the
 * Constitution guarantees → what to do when one is denied → the duty for
 * each role → a private pledge and nightly check. Real, sourced data only.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { BangladeshShell } from "@/components/bangladesh-landing/chapter-shell";
import { COLUMN, Section, TITLE } from "@/components/bangladesh-landing/kit";
import { DayChart } from "@/components/nagorik/day-chart";
import { Justice } from "@/components/nagorik/justice";
import { NagorikHero } from "@/components/nagorik/nagorik-hero";
import { Pledge } from "@/components/nagorik/pledge";
import { Responsibilities } from "@/components/nagorik/responsibilities";
import { Rights } from "@/components/nagorik/rights";
import { TusFindings } from "@/components/nagorik/tus-findings";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Citizen Rights and Duties | Kandari-Lab",
  description:
    "How Bangladesh spends its day (BBS Time-Use Survey 2021), the fundamental rights in the Constitution, the path to justice when one is denied, and the duties of every citizen, from child to elder.",
};

export default function NagorikPage() {
  return (
    <BangladeshShell>
      <NagorikHero />

      <Section
        id="day"
        title="The measured day"
        lede="Bangladesh's first national time-use survey shows who carries the paid work and who carries the home. The figures show how unevenly the load is shared."
      >
        <DayChart />
        <TusFindings />
      </Section>

      <Section
        id="rights"
        title="Your rights"
        lede="The fundamental rights in Part III of the Constitution of Bangladesh, in plain English. Every one can be enforced in the High Court Division."
      >
        <Rights />
      </Section>

      <Section id="justice" title="When a right is denied" lede="Five steps, in order. Start with the first: each one makes the next stronger.">
        <Justice />
      </Section>

      <Section id="responsibility" title="Your duties by role" lede="Changing a country is no one's job alone. Choose your place: the duties it carries, the mindset behind them, and one brave act.">
        <Responsibilities />
      </Section>

      <Section id="pledge" title="Pledge and nightly check" lede="Choose what you will keep each day, then check yourself honestly before you sleep. Nothing is sent anywhere.">
        <Pledge />
      </Section>

      <section aria-labelledby="nagorik-close" className={cn(COLUMN, "section-band")}>
        <div className="rounded-3xl bg-bdnavy-900 px-6 py-12 text-center ring-1 ring-white/12 sm:px-12 sm:py-16">
          <h2 id="nagorik-close" className={cn(TITLE, "mx-auto max-w-3xl")}>
            The Bangladesh of the next generation is in our hands today
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            Know your rights, do your duty, and stand up to wrong. When one person changes, a home changes; when a neighbourhood changes, the country does.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/protibad" className={btn.gold}>
              Report a problem
            </Link>
            <Link href="/bangladesh" className={cn(btn.goldOutline, "bg-bdnavy-900")}>
              Bangladesh: problems and solutions
            </Link>
          </div>
        </div>
      </section>
    </BangladeshShell>
  );
}
