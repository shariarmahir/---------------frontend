import { SiteFooter } from "@/components/layout/site-footer";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { SiteHeader } from "@/components/layout/site-header";
import { AiWidget } from "@/components/ui/ai-widget";
import { FlagshipsSection } from "@/components/sections/flagships-section";
import { HeroSection } from "@/components/sections/hero-section";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { LeadershipSection } from "@/components/sections/leadership-section";
import { NodeTerminalSection } from "@/components/sections/node-terminal-section";
import { PixelThesisSection } from "@/components/sections/pixel-thesis-section";
import { PlatformsSection } from "@/components/sections/platforms/platforms-section";
import { ResearchSection } from "@/components/sections/research-section";

/*
 * THESIS: Bangladesh as a pixel map, fixed one solid pixel at a time; the
 * page refuses the pale-card SaaS scroll and runs on whole colour fields.
 * OWN-WORLD: the header's language on a pitch-black ground. Gold #e4b027,
 * ink #032017 and bottle green #006747 as drenched bands and panels (ink
 * panels carry a faint white ring so they hold an edge on the black); every
 * surface a solid colour, no textures; white tiles for anything green or red; a three-pixel mark on every heading; a gold pulse running
 * the seam of each dark band.
 * STORY: see the photographs and the claim → the four pixels → products
 * and services → the platforms (শিক্ষিতদের মিডিয়া, গবেষণাকোষ, ক্লাসরুম) →
 * the labs → the open drive → the people → join.
 * FIRST VIEWPORT: the gold header over the photo hero, claim left, gold
 * primary action, the ink proof strip closing the band.
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
        {/* Pitch-black ground, solid colours only (Mahir, 2026-09-30). */}
        <div className="relative">
          <PixelThesisSection />
          <FlagshipsSection />
          <PlatformsSection />
          <ResearchSection />
          <NodeTerminalSection />
          <LeadershipSection />
          <KandariProfileSection />
        </div>
      </main>
      <SiteFooter />
      {/* Floating AI assistant — home screen only. */}
      <AiWidget />
    </>
  );
}
