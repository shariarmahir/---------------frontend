/*
 * THESIS: a nation changes in its people's 24 hours. The page opens with
 * the measured day (real BBS data), then asks each reader to own their
 * part — rights known, duties done, one brave act — instead of a civics
 * lecture of bullet lists.
 * OWN-WORLD: the home page's — pitch-black ground, solid gold / ink / bottle
 * green / orange fields, gold pixel-mark headings, the gold pulse on the
 * ink bands' seams; charts use bright green and gold on ink, red only for
 * waste and for bravery.
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
import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "নাগরিক অধিকার ও দায়িত্ব | কাণ্ডারী-ল্যাব",
  description:
    "বাংলাদেশের মানুষ দিনের সময় কীভাবে কাটান (বিবিএস টাইম-ইউজ সার্ভে ২০২১), সংবিধানের মৌলিক অধিকার, ন্যায়বিচারের পথ আর শিশু থেকে প্রবীণ — প্রত্যেকের দায়িত্ব, মানসিকতা ও সাহস।",
};

export default function NagorikPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-black pt-header lg:pt-header-lg">
        <NagorikHero />

        <section id="day" aria-labelledby="day-title" className="section-band scroll-mt-40 bg-black">
          <div className="mx-auto max-w-7xl px-gutter-x">
            <StoryHeading
              id="day-title"
              index="০১"
              kicker="দিনের হিসাব"
              title="আমাদের দিন আসলে কোথায় যায়"
              accent="কোথায়"
              lede="দেশের প্রথম টাইম-ইউজ সার্ভে। ঘরের কাজ কার কাঁধে, আয়ের কাজ কার — সংখ্যাগুলো দেখায় দায়িত্ব কতটা অসমভাবে ভাগ হয়ে আছে।"
            />
            <div className="space-y-5">
              <DayChart />
              <TusFindings />
            </div>
          </div>
        </section>

        <section id="divisions" aria-labelledby="div-title" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-text-primary text-white">
          <SignalSeam className="top-0" />
          <div className="mx-auto max-w-7xl px-gutter-x">
            <StoryHeading
              id="div-title"
              index="০২"
              kicker="বিভাগ"
              title="বিভাগে বিভাগে দিনের হিসাব"
              accent="বিভাগে"
              lede="উৎপাদনশীল সময়, ঘরের কাজ, সমাজের জন্য সময়, শেখা আর অপচয় — প্রতিটি কলামে ক্লিক করে সাজান, নারী-পুরুষ বদলে দেখুন।"
            />
            <DivisionTable />
          </div>
        </section>

        <Rights />
        <Responsibilities />
        <DailyCheck />

        <section aria-labelledby="nagorik-close" className="relative isolate overflow-hidden bg-bd-green text-white">
          <SignalSeam className="top-0" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,rgb(228_176_39/0.28),transparent_70%)]" />
          <div className="mx-auto max-w-4xl px-gutter-x py-20 text-center sm:py-28">
            <div className="story-reveal">
              <h2 id="nagorik-close" className="font-bengali text-3xl leading-tight font-bold text-balance text-signal-orange sm:text-5xl">
                আগামী প্রজন্মের বাংলাদেশ <span className="text-white">আজকের</span> আমাদের হাতে
              </h2>
              <p className="mx-auto mt-5 max-w-2xl font-bengali text-lg leading-relaxed text-white/90">
                অধিকার জানুন, দায়িত্ব পালন করুন, আর অন্যায়ের সামনে সাহস নিয়ে দাঁড়ান। একজন বদলালে একটি ঘর বদলায়; একটি পাড়া বদলালে দেশ।
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link href="/cholo-bangladesh-gori/mission" className={cn(btn.gold, "font-bengali text-base normal-case")}>
                  <Icon name="extension" className="text-[20px]" /> চলো বাংলাদেশ গড়ি
                </Link>
                <Link href="/bangladesh/solutions" className={cn(btn.ink, "font-bengali text-base normal-case")}>
                  <Icon name="lightbulb" className="text-[20px] text-signal-orange" /> বাংলাদেশ সমস্যা ও সমাধান
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
