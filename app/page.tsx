import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AiWidget } from "@/components/ui/ai-widget";
import { FlagshipsSection } from "@/components/sections/flagships-section";
import { HeroSection } from "@/components/sections/hero-section";
import { KandariProfileSection } from "@/components/sections/kandari-profile-section";
import { LeadershipSection } from "@/components/sections/leadership-section";
import { MetricsSection } from "@/components/sections/metrics-section";
import { NodeTerminalSection } from "@/components/sections/node-terminal-section";
import { PixelThesisSection } from "@/components/sections/pixel-thesis-section";
import { ResearchSection } from "@/components/sections/research-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      {/* The dot-grid starts below the hero: the hero is a full-bleed photo
          band, so a backdrop on <main> would never show through it anyway. */}
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        <HeroSection />
        <div className="bg-grid-subtle">
          <PixelThesisSection />
          <FlagshipsSection />
          <MetricsSection />
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
