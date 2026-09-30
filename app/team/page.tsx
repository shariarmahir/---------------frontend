/*
 * THESIS: one signal leaves the founder and reaches every builder — the
 * page is that signal travelling, from the core to the crew to the next
 * cohort.
 * OWN-WORLD: the home page's — pitch-black ground, solid gold / ink / bottle
 * green / orange fields, gold pixel-mark headings, the gold pulse on the
 * ink bands' seams; the people are the home page's poster cards.
 * FIRST VIEWPORT: the home hero's band — claim left with the gold action,
 * the founder's galaxy right, the ink proof strip closing it.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FounderSpotlight } from "@/components/team/founder-spotlight";
import { TeamDirectory } from "@/components/team/team-directory";
import { TeamHero } from "@/components/team/team-hero";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam, btn } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { crew, fellowship } from "@/data/team";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Team | কাণ্ডারী-ল্যাব",
  description:
    "The people building Kandari-Lab — founder Mahir Shariar Mahin and the leadership, creative, client, IoT and AI teams around him.",
};

/** How one idea travels from the founder's vision to a village. */
const SIGNAL_PATH = [
  { icon: "neurology", title: "Vision", body: "The founder sets the mission and the next sector to fix." },
  { icon: "workspace_premium", title: "Leadership", body: "Operations and marketing turn it into a plan and partners." },
  { icon: "lightbulb", title: "Idea & Client", body: "Creative and client teams shape it around real users." },
  { icon: "memory", title: "Engineering", body: "IoT and AI teams build the hardware and the software." },
  { icon: "home_health", title: "The village", body: "It ships — to a pharmacy, a phone, a wrist." },
];

export default function TeamPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <TeamHero />

        <FounderSpotlight />

        {/* How the signal travels — an ink band, five solid steps. */}
        <section aria-labelledby="signal-path" className="section-band-tinted relative isolate overflow-hidden bg-text-primary">
          <SignalSeam className="top-0" />
          <div className="mx-auto max-w-7xl px-gutter-x">
            <SectionHeading
              tone="dark"
              title={<span id="signal-path">How the signal travels</span>}
              lead="Five hand-offs from an idea to a village — every team on this page is one of them."
            />
            <ol className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-5">
              {SIGNAL_PATH.map((step, i) => {
                // No ink card on the ink band: green, gold, orange, green, gold.
                const tone = surfaceAt([0, 1, 2, 0, 1][i]);
                return (
                  <li key={step.title} className="story-reveal flex max-lg:last:col-span-2">
                    <div style={glowStyle(tone.glow)} className={cn("group flex w-full flex-col gap-3 rounded-3xl p-4 shadow-sm sm:p-5", LIFT, tone.card)}>
                      <span className="flex items-center justify-between">
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                            tone.tile,
                          )}
                        >
                          <Icon name={step.icon} className="text-[24px]!" />
                        </span>
                        <span className="font-grotesk text-2xl font-bold opacity-85">0{i + 1}</span>
                      </span>
                      <span className="font-grotesk text-base font-bold uppercase sm:text-lg">{step.title}</span>
                      <span className="font-sans text-sm leading-relaxed">{step.body}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="members" aria-labelledby="members-title" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
          <SectionHeading
            tone="dark"
            title={<span id="members-title">The crew in orbit</span>}
            lead={`${crew.length} people across leadership, creative, client, IoT and AI — each one a line of the founder's signal. Open a card to see what they build.`}
          />
          <TeamDirectory />
        </section>

        {/* R&D fellowship — the home page's gold strip. */}
        <section id="fellowship" aria-labelledby="fellowship-title" className="mx-auto max-w-7xl scroll-mt-40 px-gutter-x pb-[var(--spacing-seam)]">
          <div className="story-reveal relative isolate flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-signal-orange p-6 text-text-primary shadow-tile sm:p-10 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4 sm:gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-text-primary text-signal-orange shadow-ink">
                <Icon name="school" className="text-3xl" />
              </span>
              <div>
                <span className="font-mono text-xs font-bold tracking-widest uppercase">R&amp;D Fellowship</span>
                <h2 id="fellowship-title" className="mt-1 font-grotesk text-2xl font-bold tracking-tight uppercase sm:text-4xl">
                  The next orbit is yours.
                </h2>
                <p className="mt-2 max-w-2xl font-sans text-base leading-relaxed text-text-primary/85">
                  {fellowship.note} Each cohort runs {fellowship.cycle} ({fellowship.cycleBn}).
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 lg:items-end">
              <Link href="/signup?role=researcher" className={btn.ink}>
                <Icon name="notifications_active" className="text-[18px]!" />
                Apply for the next cohort
              </Link>
              <span className="font-sans text-xs text-text-primary/75">We announce each cohort on Kandari Profile.</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
