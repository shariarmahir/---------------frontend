/*
 * THESIS: one signal leaves the founder and reaches every builder: the
 * page is that signal travelling, from the core to the crew to the next
 * cohort.
 * OWN-WORLD: the landing page's (Mahir, 2026-10-19): a pitch-black ground,
 * cobalt, navy and ink fields with a faint ring, gold titles and actions,
 * the gold pulse on the bands' seams. No gradients, glows, uppercase or
 * section numbers.
 * FIRST VIEWPORT: the claim left with the gold action, the founder's galaxy
 * right, the navy proof strip closing it.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FounderSpotlight } from "@/components/team/founder-spotlight";
import { SignalPath } from "@/components/team/signal-path";
import { TeamDirectory } from "@/components/team/team-directory";
import { TeamHero } from "@/components/team/team-hero";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam, btn } from "@/components/ui/section-kit";
import { crew, fellowship } from "@/data/team";

export const metadata: Metadata = {
  title: "Team | কাণ্ডারী-ল্যাব",
  description:
    "The people building Kandari-Lab: founder Mahir Shariar Mahin and the leadership, creative, client, IoT and AI teams around him, and the R&D Fellowship.",
};

export default function TeamPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header text-white lg:pt-header-lg">
        <TeamHero />

        <FounderSpotlight />

        <section aria-labelledby="signal-path" className="section-band-tinted relative isolate overflow-hidden bg-text-primary">
          <SignalSeam className="top-0" />
          <div className="mx-auto max-w-7xl px-gutter-x">
            <SectionHeading
              tone="dark"
              title={<span id="signal-path">How the signal travels</span>}
              lead="Five hand-offs from an idea to a village. Every team on this page is one of them."
            />
            <SignalPath />
          </div>
        </section>

        <section id="members" aria-labelledby="members-title" className="section-band mx-auto max-w-7xl px-gutter-x">
          <SectionHeading
            tone="dark"
            title={<span id="members-title">The crew in orbit</span>}
            lead={`${crew.length} people across leadership, creative, client, IoT and AI, each one a line of the founder's signal. Open a card to see what they build.`}
          />
          <TeamDirectory />
        </section>

        <section id="fellowship" aria-labelledby="fellowship-title" className="mx-auto max-w-7xl px-gutter-x pb-(--spacing-seam)">
          <div className="story-reveal grid gap-8 rounded-3xl bg-cobalt p-6 ring-1 ring-white/12 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 id="fellowship-title" className="font-grotesk text-3xl leading-tight font-bold tracking-tight text-balance text-signal-orange sm:text-4xl">
                The next orbit is yours.
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-white/90 sm:text-lg">
                {fellowship.note} Each cohort runs {fellowship.cycle} ({fellowship.cycleBn}), on the lab&apos;s real research: a wearable for the blind, waste into soil, health AI in Bangla and wearable vital signs.
              </p>
            </div>
            <Link href="/team/fellowship" className={btn.gold}>
              <Icon name="school" className="text-xl!" />
              Explore the R&amp;D Fellowship
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
