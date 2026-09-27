/*
 * THESIS: a nation changes in its people's 24 hours. The page opens with
 * the measured day (real BBS data), then asks each reader to own their
 * part — rights known, duties done, one brave act — instead of a civics
 * lecture of bullet lists.
 * OWN-WORLD: the /bangladesh page's night green and harvest gold, with a
 * validated chart pair (chart-paid green, chart-care deep gold); red only
 * for waste and for bravery.
 * STORY: see how the day is really spent → how divisions compare (sample,
 * labelled) → the rights you hold → the duty for your role → tonight's
 * private self-check.
 * FIRST VIEWPORT: title and one real headline figure over a farmer at
 * work; section jumps beneath.
 * FORM: research report turned into a personal pledge; structure pinned by
 * the founder's brief (2026-09-27).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DailyCheck } from "@/components/nagorik/daily-check";
import { DayChart } from "@/components/nagorik/day-chart";
import { DivisionTable } from "@/components/nagorik/division-table";
import { NagorikHero } from "@/components/nagorik/nagorik-hero";
import { Responsibilities } from "@/components/nagorik/responsibilities";
import { Rights } from "@/components/nagorik/rights";
import { TusFindings } from "@/components/nagorik/tus-findings";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "নাগরিক অধিকার ও দায়িত্ব | কাণ্ডারী-ল্যাব",
  description:
    "বাংলাদেশের মানুষ দিনের সময় কীভাবে কাটান (বিবিএস টাইম-ইউজ সার্ভে ২০২১), সংবিধানের মৌলিক অধিকার, ন্যায়বিচারের পথ আর শিশু থেকে প্রবীণ — প্রত্যেকের দায়িত্ব, মানসিকতা ও সাহস।",
};

export default function NagorikPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        <NagorikHero />

        <section id="day" aria-labelledby="day-title" className="section-band scroll-mt-40 bg-white">
          <div className="mx-auto max-w-7xl px-gutter-x">
            <div className="story-reveal max-w-3xl">
              <h2 id="day-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
                আমাদের দিন আসলে কোথায় যায়
              </h2>
              <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">
                দেশের প্রথম টাইম-ইউজ সার্ভে। ঘরের কাজ কার কাঁধে, আয়ের কাজ কার — সংখ্যাগুলো দেখায় দায়িত্ব কতটা অসমভাবে ভাগ হয়ে আছে।
              </p>
            </div>
            <div className="mt-10 space-y-5">
              <DayChart />
              <TusFindings />
            </div>
          </div>
        </section>

        <section id="divisions" aria-labelledby="div-title" className="section-band-tinted scroll-mt-40 bg-mint-subtle">
          <div className="mx-auto max-w-7xl px-gutter-x">
            <div className="story-reveal max-w-3xl">
              <h2 id="div-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
                বিভাগে বিভাগে দিনের হিসাব
              </h2>
              <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">
                উৎপাদনশীল সময়, ঘরের কাজ, সমাজের জন্য সময়, শেখা আর অপচয় — প্রতিটি কলামে ক্লিক করে সাজান, নারী-পুরুষ বদলে দেখুন।
              </p>
            </div>
            <div className="mt-10">
              <DivisionTable />
            </div>
          </div>
        </section>

        <Rights />
        <Responsibilities />
        <DailyCheck />

        <section aria-labelledby="nagorik-close" className="bg-[#fbf8f1]">
          <div className="mx-auto max-w-4xl px-gutter-x py-20 text-center">
            <h2 id="nagorik-close" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
              আগামী প্রজন্মের বাংলাদেশ আজকের আমাদের হাতে
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-bengali text-lg leading-relaxed text-text-secondary">
              অধিকার জানুন, দায়িত্ব পালন করুন, আর অন্যায়ের সামনে সাহস নিয়ে দাঁড়ান। একজন বদলালে একটি ঘর বদলায়; একটি পাড়া বদলালে দেশ।
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/bangladesh#solutions" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-bd-green px-6 font-bengali text-base font-bold text-white transition-colors hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:ring-offset-2 focus-visible:outline-none">
                <Icon name="lightbulb" className="text-[20px]" /> বাংলাদেশ সমস্যা ও সমাধান
              </Link>
              <Link href="/cholo-bangladesh-gori/mission" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-signal-orange px-6 font-bengali text-base font-bold text-text-primary transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:outline-none">
                <Icon name="extension" className="text-[20px]" /> চলো বাংলাদেশ গড়ি
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
