/*
 * THESIS: the page is the pixel map being repaired. It opens on the line
 * the company is named from, beside its founder, then tells the company in
 * the order of an agency page (Mahir's reference, 2026-10-18): a strip of
 * stops, value cards, the "who we are" band whose round photograph arrives
 * as a few solid blocks and resolves to full sharpness, the impact panel,
 * the story as one moving row, the crew, and the landing page's Kandari
 * Profile invitation.
 * OWN-WORLD: the home page's: pitch-black ground; navy, ink and cobalt as
 * the only fields, each card with a flat block of another field set off
 * behind it; gold for titles, figures and buttons; kit buttons only.
 * HONESTY: no clients, testimonials or results. The impact chart is the
 * dossier's problem map; the crew's lines are the roster's descriptions of
 * their work, not quotations.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { AboutHeading, MottoBand, PageIndex, RepairBand, ValueCards } from "@/components/about/blocks";
import { ImpactPanel, StoryMarquee } from "@/components/about/chapter";
import { CrewVoices } from "@/components/about/crew";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { CHARTER_TOPIC } from "@/components/sections/charter-looks";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { ABOUT_SUMMARY, VALUES } from "@/data/about";
import { charterSlides, missionReach } from "@/data/charter";
import { sourcePoints } from "@/data/amar-bangladesh";
import { crew, founder } from "@/data/team";

export const metadata: Metadata = {
  title: "About Us | কাণ্ডারী-ল্যাব",
  description:
    "Who Kandari-Lab is: the problem we see in Bangladesh, the challenge we accepted, our mission and our unending goal, the crew behind them, and the values we hold to.",
};

const slide = (id: string) => charterSlides.find((s) => s.id === id)!;
const STORY = ["problem", "challenge", "vision", "mission", "goal"].map(slide);
const IMPACT = slide("impact");
/** The impact's heading, counted from the data: the people, and the problems mapped for them. */
const IMPACT_TITLE = `${missionReach[0].value.replace("M", " million")} people. ${sourcePoints.length} broken pixels.`;

/** The strip under the hero: every stop on the page, in order. */
const INDEX = [
  { href: "#values", name: "Our promises", icon: "favorite" },
  { href: "#who-we-are", name: "Who we are", icon: "grid_on" },
  { href: "#impact", ...CHARTER_TOPIC.impact },
  { href: "#story", name: "Why we fight", icon: "auto_stories" },
  { href: "#crew", name: "Crew", icon: "groups" },
  { href: "#kandari-profile", name: "Join", icon: "person_add" },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <MottoBand founder={{ name: founder.name, role: founder.role, photo: founder.photo! }} />

        <PageIndex items={INDEX} />

        <ValueCards values={VALUES} />

        <RepairBand
          title={
            <>
              We repair Bangladesh, <span className="text-signal-orange">one pixel at a time.</span>
            </>
          }
          lead={ABOUT_SUMMARY}
        >
          <Link href="#kandari-profile" className={btn.gold}>
            Join Kandari Profile
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
          <Link href="#story" className={btn.goldOutline}>
            Read our story
          </Link>
        </RepairBand>

        <ImpactPanel slide={IMPACT} title={IMPACT_TITLE} />

        {/* The story: five chapter cards in one row, drifting sideways across the screen. */}
        <section id="story" aria-labelledby="story-title" className="section-band scroll-mt-header lg:scroll-mt-header-lg">
          <div className="mx-auto max-w-7xl px-gutter-x">
            <AboutHeading
              id="story-title"
              title="Why we fight, in five chapters"
              lead="What is broken, the challenge we accepted, why we refuse a vision with a deadline, the mission, and the war that does not end."
            />
          </div>
          <StoryMarquee slides={STORY} />
        </section>

        <CrewVoices members={crew} />

        <KandariProfileSection />
      </main>
      <SiteFooter />
    </>
  );
}
