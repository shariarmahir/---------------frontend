import { SiteFooter } from "@/components/layout/site-footer";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { SiteHeader } from "@/components/layout/site-header";
import { AiWidget } from "@/components/ui/ai-widget";
import { AboutSection } from "@/components/sections/about-section";
import { AppsSection } from "@/components/sections/apps-section";
import { CharterSection } from "@/components/sections/charter-section";
import { ProductsSection, ServicesSection } from "@/components/sections/flagships-section";
import { DataSourcesSection } from "@/components/sections/data-sources-section";
import { HeroSection } from "@/components/hero/HeroSection";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { LeadershipSection } from "@/components/sections/leadership-section";
import { NodeTerminalSection } from "@/components/sections/node-terminal-section";
import { PixelThesisSection } from "@/components/sections/pixel-thesis-section";
import { PromoGallery } from "@/components/sections/promo-gallery";
import { ResearchSection } from "@/components/sections/research-section";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { SpotlightBand } from "@/components/sections/spotlight-band";

/*
 * THESIS: Bangladesh as a pixel map, fixed one solid pixel at a time; the
 * page refuses the pale-card SaaS scroll and runs on whole colour fields.
 * OWN-WORLD: the header's language on a pitch-black ground. Gold #e4b027,
 * ink #032017 and bottle green #006747 as drenched bands and panels (ink
 * panels carry a faint white ring so they hold an edge on the black); every
 * surface a solid colour, no textures; white tiles for anything green or red; a gold pulse running
 * the seam of each dark band.
 * STORY: the photographs and the claim → the narrow spotlight band (news,
 * protocol status, national indicators) → the four pixels → products → the
 * apps to download → services → the banner gallery (record, protest, rights, the 32 problems, the media, research) →
 * the labs → the open drive → who we are and our values → the people → what partners say → where the data comes from → join.
 * FIRST VIEWPORT: the header over the photo hero, its claim and gold
 * primary action, then the narrow spotlight band closing it.
 * FORM: extension of the established header world (no seed roll); pacing
 * alternates black ground, ink, gold and green so no two neighbours match.
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        <HeroSection />
        {/* Announcements, the Golden 2-Hours status and the national
            indicators: a narrow banglalink-style slider under the hero. */}
        <SpotlightBand />
        {/* Pitch-black ground, solid colours only (Mahir, 2026-09-30). */}
        <div className="relative">
          {/* Problem, challenge, vision, mission, goal and impact: a
              carousel of cards that glides on its own. */}
          <CharterSection />
          <PixelThesisSection />
          <ProductsSection />
          <AppsSection />
          <ServicesSection />
          <ResearchSection />
          <NodeTerminalSection />
          <AboutSection />
          <LeadershipSection />
          <PromoGallery />
          <ReviewsSection />
          <DataSourcesSection />
          <KandariProfileSection />
        </div>
      </main>
      <SiteFooter />
      {/* Floating AI assistant — home screen only. */}
      <AiWidget />
    </>
  );
}
