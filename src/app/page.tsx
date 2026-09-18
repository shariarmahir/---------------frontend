import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FlagshipsSection } from "@/components/sections/flagships-section";
import { HeroSection } from "@/components/sections/hero-section";
import { LeadershipSection } from "@/components/sections/leadership-section";
import { MetricsSection } from "@/components/sections/metrics-section";
import { NodeTerminalSection } from "@/components/sections/node-terminal-section";
import { PixelThesisSection } from "@/components/sections/pixel-thesis-section";
import { ResearchSection } from "@/components/sections/research-section";
import { TelemetryTicker } from "@/components/sections/telemetry-ticker";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-background pt-16 lg:pt-20">
        <TelemetryTicker />
        <HeroSection />
        <PixelThesisSection />
        <FlagshipsSection />
        <MetricsSection />
        <ResearchSection />
        <LeadershipSection />
        <NodeTerminalSection />
      </main>
      <SiteFooter />
    </>
  );
}
