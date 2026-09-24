import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeading } from "@/components/products/section-heading";
import { FounderSpotlight } from "@/components/team/founder-spotlight";
import { TeamDirectory } from "@/components/team/team-directory";
import { TeamHero } from "@/components/team/team-hero";
import { Icon } from "@/components/ui/icon";
import { crew, fellowship } from "@/data/team";

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
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        <TeamHero />

        <div className="bg-grid-subtle">
          <FounderSpotlight />

          {/* How the signal travels. */}
          <section aria-labelledby="signal-path" className="section-band-tinted border-y border-slate-200 bg-mint-subtle/70">
            <div className="mx-auto max-w-7xl px-gutter-x">
              <h2 id="signal-path" className="sr-only">
                How an idea travels through the team
              </h2>
              <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {SIGNAL_PATH.map((step, i) => (
                  <li
                    key={step.title}
                    className="glass-card relative flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs"
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-bd-green-light text-bd-green">
                        <Icon name={step.icon} className="text-[22px]!" />
                      </span>
                      <span className="font-mono text-xs font-bold text-signal-orange">0{i + 1}</span>
                    </span>
                    <span className="font-grotesk text-base font-bold text-text-primary uppercase">{step.title}</span>
                    <span className="font-sans text-sm leading-relaxed text-text-secondary">{step.body}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="members" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
            <SectionHeading
              kicker="আমাদের কারিগর"
              title="The crew in orbit"
              lede={`${crew.length} people across leadership, creative, client, IoT and AI — each one a line of the founder's signal. Open a profile to see what they build.`}
            />
            <TeamDirectory />
          </section>

          {/* R&D fellowship. */}
          <section id="fellowship" className="mx-auto max-w-7xl scroll-mt-40 px-gutter-x pb-[var(--spacing-seam)]">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-12">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgb(255_145_0/0.3),transparent_45%),radial-gradient(circle_at_10%_100%,rgb(0_103_71/0.55),transparent_55%)]" />
              <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-signal-orange uppercase">
                    <Icon name="school" className="text-[18px]!" />
                    R&amp;D Fellowship
                  </span>
                  <h2 className="mt-3 font-grotesk text-3xl font-bold tracking-tight text-white uppercase sm:text-4xl">
                    The next orbit is yours.
                  </h2>
                  <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-white/75">
                    {fellowship.note} Each cohort runs {fellowship.cycle} ({fellowship.cycleBn}).
                  </p>
                </div>
                <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                  <Link
                    href="/#kandari-profile"
                    className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-signal-orange px-6 py-3 font-grotesk text-sm font-bold text-white uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-bdorange-600 focus-visible:ring-3 focus-visible:ring-signal-orange/40 focus-visible:outline-none motion-reduce:hover:translate-y-0"
                  >
                    <Icon name="notifications_active" className="text-[18px]!" />
                    Get notified of the next cohort
                  </Link>
                  <span className="font-sans text-xs text-white/60">Join Kandari Profile — we announce each cohort there.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
